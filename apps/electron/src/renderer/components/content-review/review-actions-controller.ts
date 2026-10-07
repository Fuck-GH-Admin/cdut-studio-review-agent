/**
 * review-actions-controller — 内容审核动作编排（M0/H05）
 *
 * 从 use-review-actions 抽出的可测层：不依赖 React，接收 Jotai Store + IPC 子集。
 * 职责（对应设计 03 §11.1「并发与快照」与 04 K05）：
 * - 选择代次：selectCase 慢返回不得把界面切回旧案（K05 选择场景）
 * - 按案写入：异步结果只写对应 caseId 的槽位（casesById/runsByCase/tasksByCase），
 *   A 的运行回 A、即使用户正在 B；不再用调用前快照覆盖"当前案卷"（K05 串案场景）
 * - 同案操作代次：同类操作后发先生时，旧响应丢弃，不覆盖新结果（K05 交错场景）
 * - 同案互斥守卫：同案同操作进行中拒绝重复发起（运行/大纲/识别），切走不解除守卫
 * - 兼容合并：大纲与识别修改范围不同（rulePacks / items），回写时以缓存最新为基底定向合并，
 *   两者交错完成互不丢失（K05「兼容 patch 都保留」）
 *
 * 主进程存储侧的 expectedRevision/串行队列见 main/lib/review/case-store.ts updateCase。
 */

import type { createStore } from 'jotai'

/** Jotai 底层 Store（与 useStore 返回一致） */
type JotaiStore = ReturnType<typeof createStore>
import type {
  ExportReportResult,
  ReviewAssistantMessage,
  ReviewCase,
  ReviewCaseSummary,
  ReviewCaseType,
  ReviewDomainPackId,
  ReviewFinding,
  ReviewItem,
  ReviewModelGatewayStatus,
  ReviewRun,
  RuleOutlineItem,
  SourceDocument,
} from '@profer/shared'
import {
  reviewAssistantPendingAtom,
  reviewRunStaleByCaseAtom,
  reviewAssistantThreadsAtom,
  reviewCasesByIdAtom,
  reviewCaseListAtom,
  reviewErrorAtom,
  reviewExecutionByCaseAtom,
  reviewFocusAtom,
  reviewGatewayStatusAtom,
  reviewRunsByCaseAtom,
  reviewRuleLocateAtom,
  reviewTasksByCaseAtom,
  selectedCaseIdAtom,
  selectedFindingIdAtom,
} from '@/atoms/review-atoms'
import type { ReviewCaseTasks } from '@/atoms/review-atoms'
import type { ReviewExecutionViewState, ReviewFocus } from '@/atoms/review-atoms'

/** focus/locate 联动 nonce（每次点击 +1 驱动 useEffect 重放） */
let focusNonce = 0

/** 控制器依赖的 IPC 子集（结构化最小接口，测试注入假实现） */
export interface ReviewActionsApi {
  listCases(): Promise<ReviewCaseSummary[]>
  getCase(caseId: string): Promise<ReviewCase | undefined>
  loadDemoCase(): Promise<ReviewCase>
  createCase(input: {
    title: string
    type: ReviewCaseType
    applicant: string
    academicYear: string
    domainPackId?: ReviewDomainPackId
  }): Promise<ReviewCase>
  importDocument(input: { caseId: string; fileName: string; role: SourceDocument['role'] }): Promise<SourceDocument>
  deleteCase(caseId: string): Promise<void>
  updateCaseSettings(input: { caseId: string; domainPackId: ReviewDomainPackId }): Promise<ReviewCase>
  generateRuleOutline(request: { caseId: string; rulePackId?: string }): Promise<RuleOutlineItem[]>
  extractItems(caseId: string): Promise<ReviewItem[]>
  runReview(caseId: string): Promise<ReviewRun>
  getLatestRun(caseId: string): Promise<{ run: ReviewRun | null; inputStale: boolean }>
  exportReport(caseId: string): Promise<ExportReportResult>
  getModelGatewayStatus(): Promise<ReviewModelGatewayStatus>
  assistantChat(input: {
    caseId: string
    history: ReviewAssistantMessage[]
    focusFindingId?: string
  }): Promise<{ content: string; references?: ReviewAssistantMessage['references']; degraded?: boolean }>
}

/** 新建案卷入参 */
export interface CreateCaseInput {
  title: string
  type: ReviewCaseType
  applicant: string
  academicYear: string
  domainPackId?: ReviewDomainPackId
}

function buildFocus(finding: ReviewFinding): ReviewFocus {
  focusNonce += 1
  return {
    findingId: finding.id,
    ruleAnchor: finding.ruleAnchors[0],
    subjectAnchor: finding.subjectAnchor,
    evidenceAnchor: finding.evidenceAnchor,
    counterpartAnchor: finding.counterpartAnchor,
    severity: finding.severity,
    nonce: focusNonce,
  }
}

/** 导入角色的中文名（同时作为 IMPORT_DOCUMENT 的 fileName 兜底值） */
export const REVIEW_DOCUMENT_ROLE_LABELS: Record<SourceDocument['role'], string> = {
  rule: '审核依据（规则）',
  application: '待审文件',
  evidence: '证明材料',
}

/** 主进程取消导入时抛出的错误标记（见 main/lib/review/case-import.ts） */
const CANCEL_IMPORT_MESSAGE = '已取消导入'

export function createReviewActionsController(store: JotaiStore, api: ReviewActionsApi) {
  /** 选择代次：每次 selectCase/loadDemo/create 递增；慢返回若代次已变则丢弃 */
  let selectionGeneration = 0
  /** 同案操作代次：key = `${caseId}:${kind}`，新发起递增；旧返回代次不符即丢弃 */
  const operationGenerations = new Map<string, number>()

  const reportError = (scope: string, error: unknown, options: { caseId?: string } = {}): void => {
    console.error('[审核专区]', scope, error)
    const message = error instanceof Error ? error.message : String(error)
    // 按案隔离：案卷已切走时错误只留日志，不污染当前案卷的错误条（K05）
    if (options.caseId === undefined || store.get(selectedCaseIdAtom) === options.caseId) {
      store.set(reviewErrorAtom, `${scope}：${message}`)
    }
  }

  const setError = (message: string | null, options: { caseId?: string } = {}): void => {
    if (options.caseId === undefined || store.get(selectedCaseIdAtom) === options.caseId) {
      store.set(reviewErrorAtom, message)
    }
  }

  /** 取当前选中案卷 ID */
  const currentCaseId = (): string | null => store.get(selectedCaseIdAtom)

  /** 每次输入变更与运行返回后查询主进程指纹，避免旧结论在当前页面继续冒充同版结果。 */
  const refreshRunValidity = async (caseId: string): Promise<void> => {
    try {
      const latest = await api.getLatestRun(caseId)
      store.set(reviewRunStaleByCaseAtom, { ...store.get(reviewRunStaleByCaseAtom), [caseId]: latest.inputStale })
    } catch (error) {
      if (store.get(reviewRunsByCaseAtom)[caseId]) {
        store.set(reviewRunStaleByCaseAtom, { ...store.get(reviewRunStaleByCaseAtom), [caseId]: true })
      }
      console.error('[审核专区] 核验运行输入版本失败', error)
    }
  }

  /** 选中案卷（带选择代次）：慢返回若期间已选其他案卷则整体丢弃 */
  const selectCaseInternal = async (caseId: string): Promise<boolean> => {
    const generation = ++selectionGeneration
    try {
      const reviewCase = await api.getCase(caseId)
      if (!reviewCase) {
        if (generation === selectionGeneration) {
          store.set(reviewErrorAtom, '该案卷不存在或已被删除，请刷新列表')
          await refreshCaseList()
        }
        return false
      }
      if (generation !== selectionGeneration) return false
      // 只更新缓存与选中态：焦点/定位/选中卡等界面态清除，但按案任务守卫保留（切回可见"运行中"）
      store.set(reviewCasesByIdAtom, { ...store.get(reviewCasesByIdAtom), [reviewCase.id]: reviewCase })
      store.set(selectedCaseIdAtom, reviewCase.id)
      store.set(selectedFindingIdAtom, null)
      store.set(reviewFocusAtom, null)
      store.set(reviewRuleLocateAtom, null)
      // M0/H09：恢复该案卷最近一次运行与有效性（磁盘 runs 已有，此前重开显示"尚未运行"）
      try {
        const latest = await api.getLatestRun(caseId)
        if (generation === selectionGeneration) {
          store.set(reviewRunsByCaseAtom, { ...store.get(reviewRunsByCaseAtom), [caseId]: latest.run })
          store.set(reviewRunStaleByCaseAtom, { ...store.get(reviewRunStaleByCaseAtom), [caseId]: latest.inputStale })
        }
      } catch (restoreError) {
        console.error('[审核专区] 恢复最近运行失败', restoreError)
      }
      setError(null)
      return true
    } catch (error) {
      if (generation === selectionGeneration) reportError('切换案卷失败', error)
      return false
    }
  }

  async function refreshCaseList(): Promise<ReviewCaseSummary[]> {
    try {
      const cases = await api.listCases()
      store.set(reviewCaseListAtom, cases)
      return cases
    } catch (error) {
      reportError('读取案卷列表失败', error)
      return []
    }
  }

  /** 同案互斥守卫：同案同任务进行中返回 false（切走不解除守卫，K05） */
  const tryBeginTask = (caseId: string, kind: keyof ReviewCaseTasks): boolean => {
    const tasks = store.get(reviewTasksByCaseAtom)[caseId]
    if (tasks?.[kind]) return false
    store.set(reviewTasksByCaseAtom, {
      ...store.get(reviewTasksByCaseAtom),
      [caseId]: { outline: false, items: false, running: false, ...tasks, [kind]: true },
    })
    return true
  }

  const endTask = (caseId: string, kind: keyof ReviewCaseTasks): void => {
    const tasks = store.get(reviewTasksByCaseAtom)[caseId]
    store.set(reviewTasksByCaseAtom, {
      ...store.get(reviewTasksByCaseAtom),
      [caseId]: { outline: false, items: false, running: false, ...tasks, [kind]: false },
    })
  }

  /** 同案操作代次：发起时递增并返回本次代次 */
  const beginOperation = (caseId: string, kind: string): number => {
    const key = `${caseId}:${kind}`
    const generation = (operationGenerations.get(key) ?? 0) + 1
    operationGenerations.set(key, generation)
    return generation
  }

  const isCurrentOperation = (caseId: string, kind: string, generation: number): boolean =>
    operationGenerations.get(`${caseId}:${kind}`) === generation

  const setExecution = (caseId: string, state: ReviewExecutionViewState): void => {
    store.set(reviewExecutionByCaseAtom, { ...store.get(reviewExecutionByCaseAtom), [caseId]: state })
  }

  return {
    async initialize(): Promise<void> {
      await refreshCaseList()
      try {
        const status = await api.getModelGatewayStatus()
        store.set(reviewGatewayStatusAtom, status)
      } catch (error) {
        console.error('[审核专区] 模型出口自检失败', error)
        store.set(reviewGatewayStatusAtom, { available: false, protocol: 'none', reason: '出口自检失败' })
      }
    },

    async loadDemoCase(): Promise<ReviewCase | null> {
      const generation = ++selectionGeneration
      try {
        let reviewCase: ReviewCase | undefined
        try {
          reviewCase = await api.loadDemoCase()
        } catch (error) {
          console.error('[审核专区] 载入演示案卷失败，回退读取已存储案卷', error)
          const cases = await api.listCases()
          const first = cases[0]
          reviewCase = first ? await api.getCase(first.id) : undefined
        }
        if (!reviewCase) {
          setError('未找到可载入的案卷（请检查演示数据）')
          return null
        }
        if (generation !== selectionGeneration) return null
        store.set(reviewCasesByIdAtom, { ...store.get(reviewCasesByIdAtom), [reviewCase.id]: reviewCase })
        store.set(selectedCaseIdAtom, reviewCase.id)
        store.set(selectedFindingIdAtom, null)
        store.set(reviewFocusAtom, null)
        store.set(reviewRuleLocateAtom, null)
        await refreshCaseList()
        setError(null)
        return reviewCase
      } catch (error) {
        reportError('载入演示案卷失败', error)
        return null
      }
    },

    refreshCaseList,

    selectCase: selectCaseInternal,

    async createCase(input: CreateCaseInput): Promise<ReviewCase | null> {
      const generation = ++selectionGeneration
      try {
        // CREATE_CASE 支持 domainPackId（缺省不写字段，主进程按综测包回落）
        const created = await api.createCase({
          title: input.title,
          type: input.type,
          applicant: input.applicant,
          academicYear: input.academicYear,
          ...(input.domainPackId ? { domainPackId: input.domainPackId } : {}),
        })
        await refreshCaseList()
        if (generation !== selectionGeneration) return created
        store.set(reviewCasesByIdAtom, { ...store.get(reviewCasesByIdAtom), [created.id]: created })
        store.set(selectedCaseIdAtom, created.id)
        setError(null)
        return created
      } catch (error) {
        reportError('新建案卷失败', error)
        return null
      }
    },

    async importDocument(role: SourceDocument['role']): Promise<SourceDocument | null> {
      const caseId = currentCaseId()
      if (!caseId) {
        setError('导入材料失败：请先选择或新建案卷')
        return null
      }
      const roleLabel = REVIEW_DOCUMENT_ROLE_LABELS[role]
      try {
        const document = await api.importDocument({ caseId, fileName: roleLabel, role })
        // 按案回写：导入期间用户可能切走，刷新数据仍写入原案卷槽位（不污染新案卷）
        try {
          const refreshed = await api.getCase(caseId)
          if (refreshed) {
            store.set(reviewCasesByIdAtom, { ...store.get(reviewCasesByIdAtom), [caseId]: refreshed })
          }
        } catch (refreshError) {
          console.error('[审核专区] 导入后刷新案卷失败', refreshError)
        }
        await refreshCaseList()
        await refreshRunValidity(caseId)
        if (document.parseStatus === 'parsed') {
          setError(null, { caseId })
        } else {
          setError(
            `${roleLabel}「${document.fileName}」解析${document.parseStatus === 'failed' ? '失败' : '不完整'}：${document.parseError ?? '文件内容可能为扫描件或格式不受支持'}（文件已收录，可在案卷中查看）`,
            { caseId },
          )
        }
        return document
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes(CANCEL_IMPORT_MESSAGE)) {
          setError(`已取消${roleLabel}导入（未选择文件，案卷未发生变化）`, { caseId })
          return null
        }
        reportError(`${roleLabel}导入失败`, error, { caseId })
        return null
      }
    },

    async deleteCase(caseId: string): Promise<boolean> {
      const isCurrent = currentCaseId() === caseId
      try {
        await api.deleteCase(caseId)
        if (isCurrent) {
          store.set(selectedCaseIdAtom, null)
          store.set(selectedFindingIdAtom, null)
          store.set(reviewFocusAtom, null)
          store.set(reviewRuleLocateAtom, null)
        }
        // 从缓存移除，避免幽灵条目
        const map = { ...store.get(reviewCasesByIdAtom) }
        delete map[caseId]
        store.set(reviewCasesByIdAtom, map)
        await refreshCaseList()
        setError(null)
        return true
      } catch (error) {
        reportError('删除案卷失败', error)
        return false
      }
    },

    async setDomainPack(packId: ReviewDomainPackId): Promise<boolean> {
      const caseId = currentCaseId()
      if (!caseId) {
        setError('切换领域包失败：请先选择案卷')
        return false
      }
      try {
        // 按案回写：响应期间切走也只更新原案卷缓存（H05 领域切换不串案）
        const updated = await api.updateCaseSettings({ caseId, domainPackId: packId })
        store.set(reviewCasesByIdAtom, { ...store.get(reviewCasesByIdAtom), [updated.id]: updated })
        await refreshRunValidity(caseId)
        await refreshCaseList()
        setError(null)
        return true
      } catch (error) {
        reportError('切换领域包失败', error, { caseId })
        return false
      }
    },

    async generateRuleOutline(options?: { onlyMissing?: boolean }): Promise<void> {
      const selected = currentCaseId() ? store.get(reviewCasesByIdAtom)[currentCaseId() as string] : undefined
      const rulePack = selected?.rulePacks[0]
      if (!selected || !rulePack) {
        setError('生成规则大纲失败：当前案卷没有规则包')
        return
      }
      const caseId = selected.id
      if (!tryBeginTask(caseId, 'outline')) {
        setError('该案卷的大纲生成已在进行中', { caseId })
        return
      }
      const generation = beginOperation(caseId, 'outline')
      try {
        // 每份依据都有独立大纲；完整走过全部规则包，成功的包即时合并，失败不清空已有内容。
        const packs = options?.onlyMissing ? selected.rulePacks.filter((pack) => pack.outline.length === 0) : selected.rulePacks
        for (const pack of packs) {
          const rulePackId = pack.id
          const outline = await api.generateRuleOutline({ caseId, rulePackId })
          // 旧代次丢弃：期间用户再次发起的大纲已更新，晚返回不得覆盖（K05 交错）
          if (!isCurrentOperation(caseId, 'outline', generation)) {
            console.warn('[审核专区] 旧的大纲响应已丢弃（已有更新的请求完成）:', caseId)
            return
          }
          // 定向合并到缓存最新：只动目标规则包的 outline，不覆盖期间发生的其他字段变更
          const latest = store.get(reviewCasesByIdAtom)[caseId]
          if (latest) {
            store.set(reviewCasesByIdAtom, {
              ...store.get(reviewCasesByIdAtom),
              [caseId]: {
                ...latest,
                rulePacks: latest.rulePacks.map((pack) =>
                  pack.id === rulePackId ? { ...pack, outline, confirmed: false } : pack,
                ),
              },
            })
          }
        }
        setError(null, { caseId })
      } catch (error) {
        if (isCurrentOperation(caseId, 'outline', generation)) {
          reportError('生成规则大纲失败', error, { caseId })
        }
      } finally {
        await refreshRunValidity(caseId)
        endTask(caseId, 'outline')
      }
    },

    async extractItems(): Promise<void> {
      const selected = currentCaseId() ? store.get(reviewCasesByIdAtom)[currentCaseId() as string] : undefined
      if (!selected) {
        setError('识别条目失败：尚未载入案卷')
        return
      }
      const caseId = selected.id
      if (!tryBeginTask(caseId, 'items')) {
        setError('该案卷的条目识别已在进行中', { caseId })
        return
      }
      const generation = beginOperation(caseId, 'items')
      try {
        const items = await api.extractItems(caseId)
        if (!isCurrentOperation(caseId, 'items', generation)) {
          console.warn('[审核专区] 旧的识别响应已丢弃（已有更新的请求完成）:', caseId)
          return
        }
        // 定向合并：只动 items，不覆盖期间发生的大纲/导入变更（K05「兼容 patch 都保留」）
        const latest = store.get(reviewCasesByIdAtom)[caseId]
        if (latest) {
          store.set(reviewCasesByIdAtom, { ...store.get(reviewCasesByIdAtom), [caseId]: { ...latest, items } })
        }
        await refreshRunValidity(caseId)
        setError(null, { caseId })
      } catch (error) {
        if (isCurrentOperation(caseId, 'items', generation)) {
          reportError('识别条目失败', error, { caseId })
        }
      } finally {
        endTask(caseId, 'items')
      }
    },

    async runReview(): Promise<void> {
      const caseId = currentCaseId()
      if (!caseId) {
        setError('开始审核失败：尚未载入案卷')
        return
      }
      if (!tryBeginTask(caseId, 'running')) {
        setError('该案卷已有审核在进行中，请等待完成后再试', { caseId })
        return
      }
      try {
        const run: ReviewRun = await api.runReview(caseId)
        // 按案落位：A 的运行回 A——用户切到 B 也不串（K05 主场景）
        store.set(reviewRunsByCaseAtom, { ...store.get(reviewRunsByCaseAtom), [caseId]: run })
        await refreshRunValidity(caseId)
        if (run.error) {
          setError(`审核未完成：${run.error}`, { caseId })
        } else {
          setError(null, { caseId })
        }
      } catch (error) {
        reportError('开始审核失败', error, { caseId })
      } finally {
        endTask(caseId, 'running')
      }
    },

    async runFullReview(): Promise<void> {
      const caseId = currentCaseId()
      const selected = caseId ? store.get(reviewCasesByIdAtom)[caseId] : undefined
      if (!caseId || !selected) {
        setError('开始审核失败：请先新建或选择审核任务')
        return
      }
      if (!tryBeginTask(caseId, 'running')) {
        setError('该审核任务已有操作正在进行，请等待完成后再试', { caseId })
        return
      }
      const update = (state: ReviewExecutionViewState): void => setExecution(caseId, state)
      const current = (): ReviewCase => store.get(reviewCasesByIdAtom)[caseId] ?? selected
      try {
        update({ status: 'preparing', stage: 'rules', message: '正在准备审核依据' })
        const hasOutlines = current().rulePacks.length > 0 && current().rulePacks.every((pack) => pack.outline.length > 0)
        if (!hasOutlines) {
          await this.generateRuleOutline({ onlyMissing: true })
          if (!current().rulePacks.every((pack) => pack.outline.length > 0)) {
            update({ status: 'awaiting-input', stage: 'rules', message: '请补充或确认审核依据后继续' })
            return
          }
        }
        const applicationCount = current().documents.filter((document) => document.role === 'application').length
        if (applicationCount === 0) {
          update({ status: 'awaiting-input', stage: 'materials', message: '请先导入待审材料' })
          return
        }
        update({ status: 'preparing', stage: 'materials', message: `已准备 ${current().documents.length} 份材料`, documents: { completed: current().documents.length, total: current().documents.length } })
        if (current().items.length === 0) {
          update({ status: 'preparing', stage: 'extract', message: '正在识别申报事项', documents: { completed: applicationCount, total: applicationCount } })
          await this.extractItems()
          if ((current().items.length) === 0) {
            update({ status: 'awaiting-input', stage: 'extract', message: '未识别到可审核事项，请检查待审材料' })
            return
          }
        }
        update({ status: 'running', stage: 'checks', message: '正在核对申报事项与证明', documents: { completed: current().documents.length, total: current().documents.length } })
        const run = await api.runReview(caseId)
        store.set(reviewRunsByCaseAtom, { ...store.get(reviewRunsByCaseAtom), [caseId]: run })
        await refreshRunValidity(caseId)
        if (run.status === 'failed') {
          update({ status: 'failed', stage: 'checks', message: '审核未完成', error: run.error ?? '审核运行失败' })
        } else if ((run.coverage.unprocessedMaterials?.length ?? 0) > 0) {
          update({ status: 'partial', stage: 'summary', message: '审核部分完成，存在未处理材料', documents: { completed: current().documents.length - (run.coverage.unprocessedMaterials?.length ?? 0), total: current().documents.length } })
        } else {
          update({ status: 'completed', stage: 'summary', message: '审核完成', documents: { completed: current().documents.length, total: current().documents.length } })
        }
        setError(run.status === 'failed' ? `审核未完成：${run.error ?? '审核运行失败'}` : null, { caseId })
      } catch (error) {
        update({ status: 'failed', message: '审核未完成', error: error instanceof Error ? error.message : String(error) })
        reportError('一键审核失败', error, { caseId })
      } finally {
        endTask(caseId, 'running')
      }
    },

    async exportReport(): Promise<ExportReportResult | null> {
      const caseId = currentCaseId()
      if (!caseId) {
        setError('导出报告失败：尚未载入案卷')
        return null
      }
      try {
        const result = await api.exportReport(caseId)
        setError(null, { caseId })
        return result
      } catch (error) {
        reportError('导出报告失败', error, { caseId })
        return null
      }
    },

    async assistantChat(history: ReviewAssistantMessage[]): Promise<void> {
      const caseId = currentCaseId()
      if (!caseId) return
      const focusFindingId = store.get(selectedFindingIdAtom) ?? undefined
      store.set(reviewAssistantPendingAtom, true)
      try {
        const reply = await api.assistantChat({ caseId, history, focusFindingId })
        const assistantMessage: ReviewAssistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply.content,
          createdAt: new Date().toISOString(),
          references: reply.references,
          degraded: reply.degraded,
        }
        const threads = store.get(reviewAssistantThreadsAtom)
        const previous = threads[caseId] ?? []
        store.set(reviewAssistantThreadsAtom, { ...threads, [caseId]: [...previous, assistantMessage] })
        setError(null, { caseId })
      } catch (error) {
        reportError('助手回答失败', error, { caseId })
      } finally {
        store.set(reviewAssistantPendingAtom, false)
      }
    },

    locateRuleAnchor(anchors: NonNullable<ReviewFocus['ruleAnchor']>[]): void {
      focusNonce += 1
      store.set(reviewRuleLocateAtom, { anchors, nonce: focusNonce })
    },

    focusFinding(finding: ReviewFinding, options?: { select?: boolean }): void {
      // 仅真实问题卡进入选中态；中栏条目卡的合成定位不污染助手焦点（F14）
      if (options?.select !== false) store.set(selectedFindingIdAtom, finding.id)
      store.set(reviewFocusAtom, buildFocus(finding))
    },
  }
}
