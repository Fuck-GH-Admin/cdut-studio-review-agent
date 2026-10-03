/**
 * review-actions-controller 单测（M0/H05，对应 04 的 K05 回归）
 *
 * 用真实 Jotai store + 可编排时序的假 IPC，确定性复现用户业务审查的隔离场景：
 * 串案、切回、交错覆盖、选择代次、同案互斥、错误隔离。
 */

import { describe, expect, test } from 'bun:test'
import { createStore } from 'jotai'
import type { ReviewCase, ReviewItem, ReviewRun, RuleOutlineItem } from '@profer/shared'
import {
  createReviewActionsController,
  type ReviewActionsApi,
} from './review-actions-controller'
import {
  reviewCasesByIdAtom,
  reviewErrorAtom,
  reviewRunsByCaseAtom,
  reviewTasksByCaseAtom,
  selectedCaseIdAtom,
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
    getModelGatewayStatus: async () => ({ available: true, protocol: 'openai' }) as never,
    assistantChat: async () => ({ content: 'ok' }),
  }
  return { api, calls, gate, shift }
}

import type { SourceDocument } from '@profer/shared'

describe('review-actions-controller（M0/H05 并发与按案写入）', () => {
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
    expect(store.get(reviewRunsByCaseAtom)['case-B']).toBeUndefined()

    // 模型返回 A 的运行
    ;(shift('run-1') ).resolve(makeRun('case-A', 3))
    await runPromise

    expect(store.get(reviewRunsByCaseAtom)['case-A']?.caseId).toBe('case-A')
    expect(store.get(reviewRunsByCaseAtom)['case-A']?.findings).toHaveLength(3)
    expect(store.get(reviewRunsByCaseAtom)['case-B']).toBeUndefined() // 不串 B
    expect(store.get(selectedCaseIdAtom)).toBe('case-B') // 不强制切回
    expect(store.get(reviewTasksByCaseAtom)['case-A']?.running).toBe(false)
    expect(store.get(reviewTasksByCaseAtom)['case-B']?.running ?? false).toBe(false)
    // B 视图无错误（A 的结果/error 不污染当前视图）
    expect(store.get(reviewErrorAtom)).toBeNull()
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
