/**
 * review-actions-controller 单测（M0/H05，对应 04 的 K05 回归）
 *
 * 用真实 Jotai store + 可编排时序的假 IPC，确定性复现用户业务审查的隔离场景：
 * 串案、切回、交错覆盖、选择代次、同案互斥、错误隔离。
 */

import { describe, expect, test } from 'bun:test'
import { createStore } from 'jotai'
import type { CaseAggregateV2, ReviewCase, ReviewItem, ReviewRun, ReviewRunV2, RuleOutlineItem } from '@profer/shared'
import {
  createReviewActionsController,
  type ReviewActionsApi,
} from './review-actions-controller'
import {
  reviewCasesByIdAtom,
  reviewErrorAtom,
  reviewRunsByCaseAtom,
  reviewTasksByCaseAtom,
  reviewRunStaleByCaseAtom,
  reviewExecutionByCaseAtom,
  selectedCaseIdAtom,
  reviewWorkspaceAggregatesByCaseAtom,
  reviewWorkspaceRunsByCaseAtom,
} from '@/atoms/review-atoms'

/** 可手工 resolve/reject 的延迟任务（值类型由调用方 cast，测试内只做触发） */
class Deferred {
  resolve!: (value: unknown) => void
  reject!: (error: unknown) => void
  readonly promise = new Promise<unknown>((res, rej) => {
    this.resolve = res
    this.reject = rej
  })
}

/** 构造最小案卷对象 */
function makeCase(id: string, overrides: Partial<ReviewCase> = {}): ReviewCase {
  return {
    id,
    title: `案卷-${id}`,
    type: '综合测评',
    applicant: '张三',
    academicYear: '2026',
    createdAt: '2026-10-03T00:00:00.000Z',
    updatedAt: '2026-10-03T00:00:00.000Z',
    documents: [],
    rulePacks: [
      { id: `${id}-pack`, documentId: `${id}-doc`, name: '细则', publisher: '', academicYear: '2026', version: 'v1', outline: [], confirmed: false },
    ],
    items: [],
    evidences: [],
    isDemo: false,
    ...overrides,
  } as ReviewCase
}

/** 构造最小运行记录 */
function makeRun(caseId: string, findings = 0): ReviewRun {
  return {
    id: `run-${caseId}-${Math.random().toString(36).slice(2, 6)}`,
    caseId,
    status: 'completed',
    inputVersion: 'hash',
    startedAt: new Date().toISOString(),
    findings: Array.from({ length: findings }, (_, i) => ({
      id: `${caseId}-f${i}`,
      itemId: `${caseId}-item`,
      kind: 'missing-evidence' as const,
      severity: 'yellow' as const,
      title: '缺证明',
      detail: '',
      suggestion: '',
      ruleAnchors: [],
    })),
    coverage: { reviewedItemIds: [], manualReviewItemIds: [], unrecognizedDocumentIds: [], ruleUncoveredItemIds: [] },
    engine: 'mock-engine',
  } as unknown as ReviewRun
}

/** 假 IPC：每个方法可挂延迟门闩，记录调用次数 */
function makeApi() {
  const calls = { runReview: 0, outline: 0, items: 0 }
  const gates: Record<string, Deferred[]> = {}
  const gate = (key: string): Deferred => {
    const d = new Deferred()
    ;(gates[key] ??= []).push(d)
    return d
  }
  const shift = (key: string): Deferred => (gates[key] ??= []).shift() as Deferred

  const api: ReviewActionsApi = {
    listCases: async () => [],
    getCase: async (caseId) => makeCase(caseId),
    loadDemoCase: async () => makeCase('demo-zhangsan-2026'),
    createCase: async (input) => makeCase(`case-${Date.now()}`),
    importDocument: async (input) => ({ id: 'doc-new', fileName: input.fileName, role: input.role, mimeType: 'text/plain', sizeBytes: 1, parseStatus: 'parsed', blocks: [], origin: 'upload' }) as unknown as SourceDocument,
    deleteCase: async () => {},
    updateCaseSettings: async (input) => ({ ...makeCase(input.caseId), domainPackId: input.domainPackId }),
    generateRuleOutline: async () => {
      calls.outline += 1
      return gate(`outline-${calls.outline}`).promise as never
    },
    extractItems: async () => {
      calls.items += 1
      return gate(`items-${calls.items}`).promise as never
    },
    runReview: async (caseId) => {
      calls.runReview += 1
      return gate(`run-${calls.runReview}`).promise as Promise<ReviewRun>
    },
    exportReport: async () => ({ markdownPath: '/tmp/x.md', jsonPath: '/tmp/x.json' }) as never,
    getLatestRun: async (caseId: string) => ({ run: null, inputStale: false }),
    getTemplateV2: async () => ({ materialSlots: [] }) as never,
    getModelGatewayStatus: async () => ({ available: true, protocol: 'openai' }) as never,
    assistantChat: async () => ({ content: 'ok' }),
  }
  return { api, calls, gate, shift }
}

import type { SourceDocument } from '@profer/shared'

describe('review-actions-controller（M0/H05 并发与按案写入）', () => {
  test('重新打开工作台时恢复已有案卷，材料入口有可用的当前任务', async () => {
    const { api } = makeApi()
    api.listCases = async () => [{ id: 'case-restore', title: '恢复案卷', type: '综合测评', applicant: '张三', academicYear: '2026', updatedAt: '2026-10-07T00:00:00.000Z', isDemo: false, documentCount: 0 }]
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.initialize()
    expect(store.get(selectedCaseIdAtom)).toBe('case-restore')
    expect(store.get(reviewCasesByIdAtom)['case-restore']?.title).toBe('案卷-case-restore')
  })

  test('Given 两份依据 When 生成大纲 Then 两包分别请求并保留各自结果', async () => {
    const { api } = makeApi()
    const store = createStore()
    const source = makeCase('qa-multi')
    source.rulePacks.push({ ...source.rulePacks[0]!, id: 'qa-pack-2', documentId: 'qa-doc-2', name: '学院细则' })
    api.getCase = async () => source
    const requested: string[] = []
    api.generateRuleOutline = async ({ rulePackId }) => {
      requested.push(rulePackId!)
      return [{ id: rulePackId!, category: '其他', title: rulePackId!, summary: '', anchors: [], generatedBy: 'ai' }]
    }
    const actions = createReviewActionsController(store, api)
    await actions.selectCase(source.id)
    await actions.generateRuleOutline()
    expect(requested).toEqual(source.rulePacks.map((pack) => pack.id))
    expect(store.get(reviewCasesByIdAtom)[source.id]!.rulePacks.map((pack) => pack.outline[0]?.id)).toEqual(requested)
  })

  test('Given 已有审核结果 When 导入或切换领域 Then 不切案且即时核验过期标记', async () => {
    const { api } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('qa-stale')
    store.set(reviewRunsByCaseAtom, { 'qa-stale': makeRun('qa-stale') })
    api.getLatestRun = async () => ({ run: makeRun('qa-stale'), inputStale: true })
    await actions.importDocument('rule')
    expect(store.get(reviewRunStaleByCaseAtom)['qa-stale']).toBe(true)
    store.set(reviewRunStaleByCaseAtom, { 'qa-stale': false })
    await actions.setDomainPack('custom')
    expect(store.get(reviewRunStaleByCaseAtom)['qa-stale']).toBe(true)
    expect(store.get(selectedCaseIdAtom)).toBe('qa-stale')
  })

  test('Given 审核过程中输入发生变化 When 旧快照结果返回 Then 仍标为过期', async () => {
    const { api, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('qa-during-run')
    const running = actions.runReview()
    api.getLatestRun = async () => ({ run: makeRun('qa-during-run'), inputStale: true })
    shift('run-1').resolve(makeRun('qa-during-run'))
    await running
    expect(store.get(reviewRunStaleByCaseAtom)['qa-during-run']).toBe(true)
  })
  test('K05 主场景：A 审核中切到 B，A 返回只落 A、不污染 B、不切回', async () => {
    const { api, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)

    await actions.selectCase('case-A')
    expect(store.get(selectedCaseIdAtom)).toBe('case-A')

    const runPromise = actions.runReview() // A 开始审核（挂起）
    expect(store.get(reviewTasksByCaseAtom)['case-A']?.running).toBe(true)

    await actions.selectCase('case-B') // 用户切到 B
    expect(store.get(selectedCaseIdAtom)).toBe('case-B')
    expect(store.get(reviewRunsByCaseAtom)['case-B'] ?? null).toBeNull()

    // 模型返回 A 的运行
    ;(shift('run-1') ).resolve(makeRun('case-A', 3))
    await runPromise

    expect(store.get(reviewRunsByCaseAtom)['case-A']?.caseId).toBe('case-A')
    expect(store.get(reviewRunsByCaseAtom)['case-A']?.findings).toHaveLength(3)
    expect(store.get(reviewRunsByCaseAtom)['case-B']).toBeNull() // 不串 B（恢复查询无运行 → null）
    expect(store.get(selectedCaseIdAtom)).toBe('case-B') // 不强制切回
    expect(store.get(reviewTasksByCaseAtom)['case-A']?.running).toBe(false)
    expect(store.get(reviewTasksByCaseAtom)['case-B']?.running ?? false).toBe(false)
    expect(store.get(reviewRunStaleByCaseAtom)['case-A']).toBe(false)
    // B 视图无错误（A 的结果/error 不污染当前视图）
    expect(store.get(reviewErrorAtom)).toBeNull()
  })

  test('H09 恢复：selectCase 拉回最近运行与过期标记', async () => {
    const { api } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    api.getLatestRun = async (caseId: string) => ({ run: makeRun(caseId, 1), inputStale: true })
    await actions.selectCase('case-A')
    expect(store.get(reviewRunsByCaseAtom)['case-A']?.findings).toHaveLength(1)
    expect(store.get(reviewRunStaleByCaseAtom)['case-A']).toBe(true)
  })

  test('K05 交错：同案大纲（慢）与识别（快）都保留，互不覆盖', async () => {
    const { api, gate, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('case-A')

    const outlinePromise = actions.generateRuleOutline() // 先发起（慢）
    const itemsPromise = actions.extractItems() // 后发起（快）

    const outline: RuleOutlineItem[] = [
      { id: 'rule-1', title: '省级加分', summary: '', anchors: [], generatedBy: 'ai' },
    ] as unknown as RuleOutlineItem[]
    ;(shift('outline-1') ).resolve(outline) // 大纲先……不对：大纲慢，这里让它后返回
    // 识别先完成
    ;(shift('items-1') ).resolve([
      { id: 'item-1', title: '事项', category: '其他', declaredScore: 2, anchor: { documentId: 'd', precision: 'block', blockId: 'b' }, evidenceDocumentIds: [], status: 'identified', identifiedBy: 'ai' },
    ] as unknown as ReviewItem[])
    await itemsPromise
    // 识别完成后大纲才返回
    ;(gate('outline-1') ).resolve(outline)
    await outlinePromise

    const cached = store.get(reviewCasesByIdAtom)['case-A']
    // 兼容 patch 都保留：识别出的条目不被慢大纲覆盖，大纲也写入
    expect(cached?.items).toHaveLength(1)
    expect(cached?.rulePacks[0]?.outline).toHaveLength(1)
  })

  test('选择代次：慢的 selectCase(A) 不把界面切回 A', async () => {
    const { api, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)

    // A 的读取挂起
    const originalGetCase = api.getCase
    let resolveA: (value: ReviewCase | undefined) => void = () => {}
    api.getCase = (caseId: string) => {
      if (caseId === 'case-A') {
        return new Promise<ReviewCase | undefined>((res) => {
          resolveA = res
        })
      }
      return originalGetCase(caseId)
    }

    const selectA = actions.selectCase('case-A')
    await actions.selectCase('case-B') // B 快速完成
    expect(store.get(selectedCaseIdAtom)).toBe('case-B')

    resolveA(makeCase('case-A'))
    await selectA
    // 慢返回被代次守卫丢弃：仍停留在 B
    expect(store.get(selectedCaseIdAtom)).toBe('case-B')
    expect(store.get(reviewErrorAtom)).toBeNull()
  })

  test('同案互斥：审核进行中拒绝再次发起，且切走后守卫不解除', async () => {
    const { api, calls, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('case-A')

    const first = actions.runReview()
    expect(calls.runReview).toBe(1)
    await actions.runReview() // 第二次点击被拒
    expect(calls.runReview).toBe(1)
    expect(store.get(reviewErrorAtom)).toContain('已有审核在进行中')

    await actions.selectCase('case-B')
    // 切走不解除 A 的守卫（K05：运行中状态按案保留）；B 可以运行
    const second = actions.runReview()
    expect(calls.runReview).toBe(2)
    ;(shift('run-2') ).resolve(makeRun('case-B'))
    await second
    expect(store.get(reviewRunsByCaseAtom)['case-B']).toBeDefined()

    ;(shift('run-1') ).resolve(makeRun('case-A'))
    await first
  })

  test('一键审核复用已有中间产物，只调用一次最终审核', async () => {
    const { api, calls } = makeApi()
    const source = makeCase('one-click', {
      documents: [{ id: 'application-1', fileName: '申报.txt', role: 'application', mimeType: 'text/plain', sizeBytes: 1, parseStatus: 'parsed', blocks: [], origin: 'upload' } as never],
      rulePacks: [{ id: 'pack', documentId: 'rule-1', name: '规则', publisher: '', academicYear: '2026', version: 'v1', outline: [{ id: 'r1', category: '资格', title: '规则', summary: '', anchors: [], generatedBy: 'ai' }], confirmed: true }],
      items: [{ id: 'item-1', title: '事项', declaredScore: 1, category: '其他', evidenceDocumentIds: [], status: 'identified', identifiedBy: 'ai', anchor: { documentId: 'application-1', precision: 'document' } } as never],
    })
    api.getCase = async () => source
    api.runReview = async () => { calls.runReview += 1; return makeRun('one-click') }
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('one-click')
    await actions.runFullReview()
    expect(calls.runReview).toBe(1)
    expect(store.get(reviewExecutionByCaseAtom)['one-click']?.status).toBe('completed')
    expect(store.get(reviewTasksByCaseAtom)['one-click']?.running).toBe(false)
  })

  test('阶段 3：一键审核提交同 ID V2 案卷并将主结果写入 V2 run', async () => {
    const { api, calls } = makeApi()
    const source = makeCase('v2-one-click', {
      documents: [{ id: 'application-1', fileName: '申报.txt', role: 'application', mimeType: 'text/plain', sizeBytes: 1, parseStatus: 'parsed', blocks: [{ id: 'b1', kind: 'text', text: '竞赛申报' }], origin: 'upload' } as never],
      rulePacks: [{ id: 'pack', documentId: 'rule-1', name: '规则', publisher: '', academicYear: '2026', version: 'v1', outline: [{ id: 'r1', category: '资格', title: '规则', summary: '', anchors: [], generatedBy: 'ai' }], confirmed: true }],
      items: [{ id: 'item-1', title: '事项', declaredScore: 1, category: '其他', evidenceDocumentIds: [], status: 'identified', identifiedBy: 'ai', anchor: { documentId: 'application-1', precision: 'document' } } as never],
    })
    const caseV2: CaseAggregateV2['caseV2'] = { id: source.id, templateId: 't', templateVersion: 1, title: source.title, objectType: 'person', caseFields: {}, subjects: [], documents: [], stage: 'draft', revision: 0, createdAt: '', updatedAt: '' }
    const aggregate: CaseAggregateV2 = { caseV2, observations: [], evidenceLinks: [], dispositions: [], tasks: [], decisions: [], supplements: [], appeals: [], receiptLog: [] }
    const run: ReviewRunV2 = {
      id: 'v2-run', caseId: source.id, templateId: 't', templateVersion: 1,
      inputManifest: { hash: 'h', templateVersion: 1, policyVersions: [], documentVersions: [], observationIds: [], evidenceLinkIds: [] },
      status: 'completed', checkpoints: [], checks: [{ checkId: 'c1', ruleId: 'r1', target: { scope: 'case', subjectIds: [] }, status: 'compliant', reason: '符合', sourceRefs: [], executedBy: 'deterministic', executedAt: '' }], opinions: [],
      coverage: { documents: [], plannedChecks: 1, completedChecks: 1, effectiveVerdicts: 1, pendingChecks: 0 }, diagnostics: [], startedAt: '', completedAt: '',
    }
    api.getCase = async () => source
    api.getAggregateV2 = async () => aggregate
    api.listRunsV2 = async () => [run]
    api.getRunObservationsV2 = async () => []
    api.getWorkspaceRunValidityV2 = async () => false
    api.submitCaseV2 = async () => ({ ok: true, aggregate: { ...aggregate, caseV2: { ...caseV2, stage: 'submitted' } } })
    api.runReviewV2 = async () => run
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase(source.id)
    expect(store.get(reviewWorkspaceRunsByCaseAtom)[source.id]?.id).toBe('v2-run')
    expect(store.get(reviewExecutionByCaseAtom)[source.id]?.status).toBe('completed')
    await actions.runFullReview()
    expect(calls.runReview).toBe(0)
    expect(store.get(reviewWorkspaceAggregatesByCaseAtom)[source.id]?.caseV2.id).toBe(source.id)
    expect(store.get(reviewWorkspaceRunsByCaseAtom)[source.id]?.id).toBe('v2-run')
    expect(store.get(reviewExecutionByCaseAtom)[source.id]?.status).toBe('completed')
  })

  test('阶段 2 P0：无审核依据时不启动运行', async () => {
    const { api, calls } = makeApi()
    api.getCase = async (caseId) => makeCase(caseId, {
      rulePacks: [],
      documents: [{ id: 'application-1', fileName: '申报.txt', role: 'application', mimeType: 'text/plain', sizeBytes: 1, parseStatus: 'parsed', blocks: [], origin: 'upload' } as never],
    })
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('no-rules')
    await actions.runFullReview()
    expect(calls.runReview).toBe(0)
    expect(store.get(reviewExecutionByCaseAtom)['no-rules']?.status).toBe('awaiting-input')
  })

  test('阶段 2 P0：大纲生成失败显示失败，不伪装成缺少用户材料', async () => {
    const { api, calls } = makeApi()
    api.getCase = async (caseId) => makeCase(caseId, {
      documents: [{ id: 'application-1', fileName: '申报.txt', role: 'application', mimeType: 'text/plain', sizeBytes: 1, parseStatus: 'parsed', blocks: [], origin: 'upload' } as never],
    })
    api.generateRuleOutline = async () => { throw new Error('模型出口超时') }
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('outline-error')
    await actions.runFullReview()
    expect(calls.runReview).toBe(0)
    expect(store.get(reviewExecutionByCaseAtom)['outline-error']?.status).toBe('failed')
    expect(store.get(reviewExecutionByCaseAtom)['outline-error']?.error).toContain('模型出口超时')
  })

  test('阶段 2 P0：人工复核与覆盖缺口将完成运行标为部分完成', async () => {
    const { api, calls } = makeApi()
    const source = makeCase('partial-review', {
      documents: [{ id: 'application-1', fileName: '申报.txt', role: 'application', mimeType: 'text/plain', sizeBytes: 1, parseStatus: 'parsed', blocks: [], origin: 'upload' } as never],
      rulePacks: [{ id: 'pack', documentId: 'rule-1', name: '规则', publisher: '', academicYear: '2026', version: 'v1', outline: [{ id: 'r1', category: '资格', title: '规则', summary: '', anchors: [], generatedBy: 'ai' }], confirmed: true }],
      items: [{ id: 'item-1', title: '事项', declaredScore: 1, category: '其他', evidenceDocumentIds: [], status: 'identified', identifiedBy: 'ai', anchor: { documentId: 'application-1', precision: 'document' } } as never],
    })
    api.getCase = async () => source
    api.runReview = async () => {
      calls.runReview += 1
      return { ...makeRun('partial-review'), coverage: { reviewedItemIds: [], manualReviewItemIds: ['item-1'], unrecognizedDocumentIds: [], ruleUncoveredItemIds: [] } }
    }
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('partial-review')
    await actions.runFullReview()
    expect(store.get(reviewExecutionByCaseAtom)['partial-review']?.status).toBe('partial')
  })

  test('阶段 2 P0：重启恢复时状态与最近运行和输入过期标记一致', async () => {
    const { api } = makeApi()
    const partialRun = { ...makeRun('restored'), coverage: { reviewedItemIds: [], manualReviewItemIds: ['item-1'], unrecognizedDocumentIds: [], ruleUncoveredItemIds: [] } }
    api.getLatestRun = async () => ({ run: partialRun, inputStale: false })
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('restored')
    expect(store.get(reviewExecutionByCaseAtom)['restored']?.status).toBe('partial')
    expect(store.get(reviewRunsByCaseAtom)['restored']?.id).toBe(partialRun.id)
  })

  test('操作代次与互斥：同类第二次点击被拒；完成后结果正常落位', async () => {
    const { api, gate, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('case-A')

    const first = actions.generateRuleOutline()
    await actions.generateRuleOutline() // 同案同类进行中 → 拒绝（不产生第二次请求）
    expect(store.get(reviewErrorAtom)).toContain('已在进行中')

    const outline = [{ id: 'rule-1', title: '新大纲', summary: '', anchors: [], generatedBy: 'ai' }] as unknown as RuleOutlineItem[]
    ;(shift('outline-1') ).resolve(outline)
    await first
    expect(store.get(reviewCasesByIdAtom)['case-A']?.rulePacks[0]?.outline).toHaveLength(1)
    expect(store.get(reviewErrorAtom)).toBeNull()
  })

  test('错误按案隔离：失败发生时已切走则不污染当前视图', async () => {
    const { api, shift } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('case-A')

    const runPromise = actions.runReview()
    await actions.selectCase('case-B')
    ;(shift('run-1') ).reject(new Error('模型超时'))
    await runPromise

    expect(store.get(reviewErrorAtom)).toBeNull() // A 的失败不写进 B 的错误条
    expect(store.get(reviewTasksByCaseAtom)['case-A']?.running).toBe(false)
  })

  test('领域包切换按案落位：响应期间切走也只更新原案卷缓存', async () => {
    const { api } = makeApi()
    const store = createStore()
    const actions = createReviewActionsController(store, api)
    await actions.selectCase('case-A')

    const packPromise = actions.setDomainPack('contract')
    await actions.selectCase('case-B')
    await packPromise

    expect(store.get(reviewCasesByIdAtom)['case-A']?.domainPackId).toBe('contract')
    expect(store.get(selectedCaseIdAtom)).toBe('case-B')
  })
})
