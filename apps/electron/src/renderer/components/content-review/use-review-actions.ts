/**
 * use-review-actions — 内容审核专区三栏共用的 IPC 动作手（hook）
 *
 * 职责：
 * - 封装 window.reviewAPI.* 的全部调用
 *   （案卷管理：列表/新建/切换/导入材料/删除/领域包；规则大纲 / 条目识别 / 审核运行 / 助手 / 导出）
 * - 统一把结果写入 Jotai atoms（review-atoms.ts），三栏只读 atoms 渲染
 * - 统一错误处理：console.error('[审核专区]', e) + 写 reviewErrorAtom（视图底部渲染错误条）
 * - 三栏联动的两个写入口：focusFinding（问题卡 → reviewFocusAtom）、locateRuleAnchor（大纲 → reviewRuleLocateAtom）
 *
 * 案卷切换的隔离约定：selectCase 会清空运行/发现/联动状态，
 * 避免上一个案卷的问题卡与高亮串到新案卷上（reviewRunAtom 等均为全局单例 atom）。
 */

import * as React from 'react'
import { useStore } from 'jotai'
import type {
  ExportReportResult,
  ReviewAssistantMessage,
  ReviewCase,
  ReviewCaseSummary,
  ReviewCaseType,
  ReviewDomainPackId,
  ReviewFinding,
  ReviewRun,
  ReviewSourceAnchor,
  SourceDocument,
} from '@profer/shared'
import {
  reviewAssistantOpenAtom,
  reviewAssistantPendingAtom,
  reviewAssistantThreadsAtom,
  reviewBusyAtom,
  reviewCaseAtom,
  reviewCaseListAtom,
  reviewErrorAtom,
  reviewFocusAtom,
  reviewGatewayStatusAtom,
  reviewRunAtom,
  reviewRuleLocateAtom,
  reviewRunningAtom,
  selectedFindingIdAtom,
} from '@/atoms/review-atoms'
import type { ReviewFocus } from '@/atoms/review-atoms'

/** 每次 focus/locate 的 nonce 自增源（模块级即可：同页只有一个工作台） */
let focusNonce = 0

/** 导入角色的中文名（同时作为 IMPORT_DOCUMENT 的 fileName 兜底值） */
export const REVIEW_DOCUMENT_ROLE_LABELS: Record<SourceDocument['role'], string> = {
  rule: '审核依据（规则）',
  application: '待审文件',
  evidence: '证明材料',
}

/** 主进程取消导入时抛出的错误标记（见 main/lib/review/case-import.ts） */
const CANCEL_IMPORT_MESSAGE = '已取消导入'

/** 新建案卷入参（随 CREATE_CASE 一次提交） */
export interface CreateCaseInput {
  title: string
  type: ReviewCaseType
  applicant: string
  academicYear: string
  /** 领域包（可缺省；缺省不写字段，主进程按综测包回落） */
  domainPackId?: ReviewDomainPackId
}

/** hook 对外暴露的动作集合（三栏 + 主视图 + 助手抽屉共用） */
export interface ReviewActions {
  /** 挂载初始化：刷新案卷列表 + 模型出口自检；主视图挂载时调用（不自动选中案卷） */
  initialize: () => Promise<void>
  /** 载入演示案卷（顶栏「载入演示案卷」按钮）+ 刷新列表并选中；返回 null 表示失败 */
  loadDemoCase: () => Promise<ReviewCase | null>
  /** 刷新案卷列表（reviewCaseListAtom） */
  refreshCaseList: () => Promise<ReviewCaseSummary[]>
  /** 切换当前案卷：读案卷写 reviewCaseAtom，并清空运行/发现/联动状态 */
  selectCase: (caseId: string) => Promise<void>
  /** 新建案卷：创建（含领域包）→ 刷新列表 → 自动选中；失败返回 null */
  createCase: (input: CreateCaseInput) => Promise<ReviewCase | null>
  /** 导入材料到当前案卷（系统选择框由主进程弹出）；成功后重新读案卷刷新三栏，返回导入的文档 */
  importDocument: (role: SourceDocument['role']) => Promise<SourceDocument | null>
  /** 删除案卷：刷新列表；删的是当前案卷则清空当前选中；返回是否成功 */
  deleteCase: (caseId: string) => Promise<boolean>
  /** 切换当前案卷领域包（updateCaseSettings 返回值直接刷新案卷）；返回是否成功 */
  setDomainPack: (packId: ReviewDomainPackId) => Promise<boolean>
  /** 生成规则大纲（左栏） */
  generateRuleOutline: () => Promise<void>
  /** 识别可审核条目（中栏） */
  extractItems: () => Promise<void>
  /** 执行审核运行（右栏） */
  runReview: () => Promise<void>
  /** 导出预审报告，返回 null 表示失败（成功结果交由调用方展示路径） */
  exportReport: () => Promise<ExportReportResult | null>
  /** 追加一条助手消息并请求回答（助手抽屉） */
  assistantChat: (history: ReviewAssistantMessage[]) => Promise<void>
  /** 左栏规则大纲点击：写 reviewRuleLocateAtom（蓝色定位） */
  locateRuleAnchor: (anchors: ReviewSourceAnchor[]) => void
  /** 右栏问题卡点击：写 selectedFindingIdAtom + reviewFocusAtom（红/黄 + 蓝联动）；select:false 只定位不改选中态 */
  focusFinding: (finding: ReviewFinding, options?: { select?: boolean }) => void
}

export function useReviewActions(): ReviewActions {
  const store = useStore()

  /** 统一错误处理：记日志 + 写全局错误条 */
  const reportError = React.useCallback(
    (scope: string, error: unknown): void => {
      console.error('[审核专区]', scope, error)
      const message = error instanceof Error ? error.message : String(error)
      store.set(reviewErrorAtom, `${scope}：${message}`)
    },
    [store],
  )

  /** 取当前案卷 ID（异步动作前置条件） */
  const currentCaseId = React.useCallback((): string | null => store.get(reviewCaseAtom)?.id ?? null, [store])

  // ===== 案卷管理（入口：列表 / 新建 / 切换 / 导入 / 删除 / 领域包） =====

  /** 清空当前案卷及其运行、发现、联动状态（切换/删除案卷时避免串案卷） */
  const clearCaseState = React.useCallback((): void => {
    store.set(reviewCaseAtom, null)
    store.set(reviewRunAtom, null)
    store.set(reviewRunningAtom, false)
    store.set(selectedFindingIdAtom, null)
    store.set(reviewFocusAtom, null)
    store.set(reviewRuleLocateAtom, null)
    store.set(reviewBusyAtom, { outline: false, items: false })
  }, [store])

  const refreshCaseList = React.useCallback(async (): Promise<ReviewCaseSummary[]> => {
    try {
      const cases = await window.reviewAPI.listCases()
      store.set(reviewCaseListAtom, cases)
      return cases
    } catch (error) {
      reportError('读取案卷列表失败', error)
      return []
    }
  }, [reportError, store])

  const selectCase = React.useCallback(
    async (caseId: string): Promise<void> => {
      try {
        const reviewCase = await window.reviewAPI.getCase(caseId)
        if (!reviewCase) {
          store.set(reviewErrorAtom, '该案卷不存在或已被删除，请刷新列表')
          await refreshCaseList()
          return
        }
        clearCaseState()
        store.set(reviewCaseAtom, reviewCase)
        store.set(reviewErrorAtom, null)
      } catch (error) {
        reportError('切换案卷失败', error)
      }
    },
    [clearCaseState, refreshCaseList, reportError, store],
  )

  /** 载入演示案卷（失败时回退到列表中第一份案卷） */
  const loadDemoCase = React.useCallback(async (): Promise<ReviewCase | null> => {
    try {
      let reviewCase: ReviewCase | undefined
      try {
        reviewCase = await window.reviewAPI.loadDemoCase()
      } catch (error) {
        // 演示案卷载入失败（如首次写盘异常）→ 回退读取已存储案卷
        console.error('[审核专区] 载入演示案卷失败，回退读取已存储案卷', error)
        const cases = await window.reviewAPI.listCases()
        const first = cases[0]
        reviewCase = first ? await window.reviewAPI.getCase(first.id) : undefined
      }
      if (!reviewCase) {
        store.set(reviewErrorAtom, '未找到可载入的案卷（请检查演示数据）')
        return null
      }
      clearCaseState()
      store.set(reviewCaseAtom, reviewCase)
      await refreshCaseList()
      store.set(reviewErrorAtom, null)
      return reviewCase
    } catch (error) {
      reportError('载入演示案卷失败', error)
      return null
    }
  }, [clearCaseState, refreshCaseList, reportError, store])

  const createCase = React.useCallback(
    async (input: CreateCaseInput): Promise<ReviewCase | null> => {
      try {
        // CREATE_CASE 支持 domainPackId（缺省不写字段，主进程按综测包回落），一次调用建成
        const created = await window.reviewAPI.createCase({
          title: input.title,
          type: input.type,
          applicant: input.applicant,
          academicYear: input.academicYear,
          ...(input.domainPackId ? { domainPackId: input.domainPackId } : {}),
        })
        await refreshCaseList()
        // 直接采用主进程返回值（保证领域包等字段与落盘一致），再同步列表
        clearCaseState()
        store.set(reviewCaseAtom, created)
        store.set(reviewErrorAtom, null)
        return created
      } catch (error) {
        reportError('新建案卷失败', error)
        return null
      }
    },
    [clearCaseState, refreshCaseList, reportError, store],
  )

  const importDocument = React.useCallback(
    async (role: SourceDocument['role']): Promise<SourceDocument | null> => {
      const caseId = currentCaseId()
      if (!caseId) {
        store.set(reviewErrorAtom, '导入材料失败：请先选择或新建案卷')
        return null
      }
      const roleLabel = REVIEW_DOCUMENT_ROLE_LABELS[role]
      try {
        // 主进程弹系统选择框；fileName 只是取消选择时的兜底名（真实文件名以所选文件为准）
        const document = await window.reviewAPI.importDocument({ caseId, fileName: roleLabel, role })
        // 重新读案卷：三栏（依据原文/条目/证据）都以 reviewCaseAtom 为唯一事实来源
        // （选择框期间若已切走案卷则不回写，避免把旧案卷内容盖到新案卷上）
        const refreshed = await window.reviewAPI.getCase(caseId)
        if (refreshed && currentCaseId() === caseId) store.set(reviewCaseAtom, refreshed)
        await refreshCaseList()
        if (document.parseStatus === 'parsed') {
          store.set(reviewErrorAtom, null)
        } else {
          store.set(
            reviewErrorAtom,
            `${roleLabel}「${document.fileName}」解析${document.parseStatus === 'failed' ? '失败' : '不完整'}：${document.parseError ?? '文件内容可能为扫描件或格式不受支持'}（文件已收录，可在案卷中查看）`,
          )
        }
        return document
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes(CANCEL_IMPORT_MESSAGE)) {
          // 用户主动取消不是错误：不写错误条，只给中文提示
          store.set(reviewErrorAtom, `已取消${roleLabel}导入（未选择文件，案卷未发生变化）`)
          return null
        }
        reportError(`${roleLabel}导入失败`, error)
        return null
      }
    },
    [currentCaseId, refreshCaseList, reportError, store],
  )

  const deleteCase = React.useCallback(
    async (caseId: string): Promise<boolean> => {
      const isCurrent = currentCaseId() === caseId
      try {
        await window.reviewAPI.deleteCase(caseId)
        if (isCurrent) clearCaseState()
        await refreshCaseList()
        store.set(reviewErrorAtom, null)
        return true
      } catch (error) {
        reportError('删除案卷失败', error)
        return false
      }
    },
    [clearCaseState, currentCaseId, refreshCaseList, reportError, store],
  )

  const setDomainPack = React.useCallback(
    async (packId: ReviewDomainPackId): Promise<boolean> => {
      const caseId = currentCaseId()
      if (!caseId) {
        store.set(reviewErrorAtom, '切换领域包失败：请先选择案卷')
        return false
      }
      try {
        // 主进程返回更新后的完整案卷，直接用它刷新，避免二次读取的空窗
        const updated = await window.reviewAPI.updateCaseSettings({ caseId, domainPackId: packId })
        store.set(reviewCaseAtom, updated)
        await refreshCaseList()
        store.set(reviewErrorAtom, null)
        return true
      } catch (error) {
        reportError('切换领域包失败', error)
        return false
      }
    },
    [currentCaseId, refreshCaseList, reportError, store],
  )

  // ===== 初始化：刷新案卷列表 + 模型出口自检 =====
  // 注意：不自动载入/选中案卷（首个案卷可能属于用户，"载入演示案卷"仍由顶栏按钮显式触发）

  const initialize = React.useCallback(async (): Promise<void> => {
    await refreshCaseList()

    try {
      const status = await window.reviewAPI.getModelGatewayStatus()
      store.set(reviewGatewayStatusAtom, status)
    } catch (error) {
      // 出口自检失败不阻断界面：按"离线模拟"处理
      console.error('[审核专区] 模型出口自检失败', error)
      store.set(reviewGatewayStatusAtom, { available: false, protocol: 'none', reason: '出口自检失败' })
    }
  }, [refreshCaseList, store])

  // ===== 规则大纲（左栏） =====

  const generateRuleOutline = React.useCallback(async (): Promise<void> => {
    const reviewCase = store.get(reviewCaseAtom)
    const rulePack = reviewCase?.rulePacks[0]
    if (!reviewCase || !rulePack) {
      store.set(reviewErrorAtom, '生成规则大纲失败：当前案卷没有规则包')
      return
    }
    store.set(reviewBusyAtom, { ...store.get(reviewBusyAtom), outline: true })
    try {
      const outline = await window.reviewAPI.generateRuleOutline({ caseId: reviewCase.id, rulePackId: rulePack.id })
      // 大纲结果回写案卷（渲染层唯一事实来源仍是 reviewCaseAtom）
      store.set(reviewCaseAtom, { ...reviewCase, rulePacks: [{ ...rulePack, outline }, ...reviewCase.rulePacks.slice(1)] })
      store.set(reviewErrorAtom, null)
    } catch (error) {
      reportError('生成规则大纲失败', error)
    } finally {
      store.set(reviewBusyAtom, { ...store.get(reviewBusyAtom), outline: false })
    }
  }, [reportError, store])

  // ===== 条目识别（中栏） =====

  const extractItems = React.useCallback(async (): Promise<void> => {
    const reviewCase = store.get(reviewCaseAtom)
    if (!reviewCase) {
      store.set(reviewErrorAtom, '识别条目失败：尚未载入案卷')
      return
    }
    store.set(reviewBusyAtom, { ...store.get(reviewBusyAtom), items: true })
    try {
      const items = await window.reviewAPI.extractItems(reviewCase.id)
      store.set(reviewCaseAtom, { ...reviewCase, items })
      store.set(reviewErrorAtom, null)
    } catch (error) {
      reportError('识别条目失败', error)
    } finally {
      store.set(reviewBusyAtom, { ...store.get(reviewBusyAtom), items: false })
    }
  }, [reportError, store])

  // ===== 审核运行（右栏） =====

  const runReview = React.useCallback(async (): Promise<void> => {
    const caseId = currentCaseId()
    if (!caseId) {
      store.set(reviewErrorAtom, '开始审核失败：尚未载入案卷')
      return
    }
    store.set(reviewRunningAtom, true)
    store.set(reviewErrorAtom, null)
    try {
      const run: ReviewRun = await window.reviewAPI.runReview(caseId)
      store.set(reviewRunAtom, run)
      if (run.error) store.set(reviewErrorAtom, `审核完成但部分失败：${run.error}`)
    } catch (error) {
      reportError('开始审核失败', error)
    } finally {
      store.set(reviewRunningAtom, false)
    }
  }, [currentCaseId, reportError, store])

  // ===== 导出预审报告 =====

  const exportReport = React.useCallback(async (): Promise<ExportReportResult | null> => {
    const caseId = currentCaseId()
    if (!caseId) {
      store.set(reviewErrorAtom, '导出报告失败：尚未载入案卷')
      return null
    }
    try {
      const result = await window.reviewAPI.exportReport(caseId)
      store.set(reviewErrorAtom, null)
      return result
    } catch (error) {
      reportError('导出报告失败', error)
      return null
    }
  }, [currentCaseId, reportError, store])

  // ===== 审核助手对话 =====

  const assistantChat = React.useCallback(
    async (history: ReviewAssistantMessage[]): Promise<void> => {
      const caseId = currentCaseId()
      if (!caseId) return
      const focusFindingId = store.get(selectedFindingIdAtom) ?? undefined
      store.set(reviewAssistantPendingAtom, true)
      try {
        const reply = await window.reviewAPI.assistantChat({ caseId, history, focusFindingId })
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
        store.set(reviewErrorAtom, null)
      } catch (error) {
        reportError('助手回答失败', error)
      } finally {
        store.set(reviewAssistantPendingAtom, false)
      }
    },
    [currentCaseId, reportError, store],
  )

  // ===== 三栏联动写入口（D8） =====

  const focusFinding = React.useCallback(
    (finding: ReviewFinding, options?: { select?: boolean }): void => {
      focusNonce += 1
      const focus: ReviewFocus = {
        findingId: finding.id,
        ruleAnchor: finding.ruleAnchors[0],
        subjectAnchor: finding.subjectAnchor,
        evidenceAnchor: finding.evidenceAnchor,
        // 跨文件比对：对照块同色高亮（中栏两处同时可见）
        counterpartAnchor: finding.counterpartAnchor,
        severity: finding.severity,
        nonce: focusNonce,
      }
      // 仅真实问题卡进入选中态；中栏条目卡的合成定位不污染助手焦点（F14）
      if (options?.select !== false) store.set(selectedFindingIdAtom, finding.id)
      store.set(reviewFocusAtom, focus)
    },
    [store],
  )

  const locateRuleAnchor = React.useCallback(
    (anchors: ReviewSourceAnchor[]): void => {
      focusNonce += 1
      store.set(reviewRuleLocateAtom, { anchors, nonce: focusNonce })
    },
    [store],
  )

  return {
    initialize,
    loadDemoCase,
    refreshCaseList,
    selectCase,
    createCase,
    importDocument,
    deleteCase,
    setDomainPack,
    generateRuleOutline,
    extractItems,
    runReview,
    exportReport,
    assistantChat,
    locateRuleAnchor,
    focusFinding,
  }
}
