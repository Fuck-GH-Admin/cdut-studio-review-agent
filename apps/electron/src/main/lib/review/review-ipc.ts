/**
 * 内容审核专区 - IPC 处理器注册
 *
 * 对应共享通道常量：packages/shared/src/types/review.ts 的 REVIEW_IPC_CHANNELS。
 * preload 侧桥接：apps/electron/src/preload/index.ts 的 reviewAPI。
 *
 * 设计决策（docs/plans/2026-10-02-content-review-demo-implementation.md D2）：
 * 独立注册函数 registerReviewIpc()，由 main/ipc.ts 的 registerIpcHandlers() 调用一次，
 * 避免向 7700+ 行的 ipc.ts 继续追加业务逻辑。
 */

import { ipcMain } from 'electron'
import {
  REVIEW_IPC_CHANNELS,
  type AssistantChatRequest,
  type ExportReportResult,
  type GenerateRuleOutlineRequest,
  type ReviewCase,
  type ReviewCaseType,
  type ReviewItem,
  type ReviewModelGatewayStatus,
  type ReviewRun,
  type RuleOutlineItem,
  type SourceDocument,
  type UpdateCaseSettingsRequest,
} from '@profer/shared'
import {
  deleteCase,
  getCase,
  listCases,
  loadDemoCase,
  saveCase,
} from './case-store'
import { parseFileIntoSourceDocument } from './document-service'
import {
  extractItems,
  generateRuleOutline,
  reviewAssistantChat,
  runAiReview,
} from './ai-review-service'
import { startReviewRun } from './run-service'
import { exportReport } from './report-service'
import { getReviewModelGatewayStatus } from './review-model-gateway'
import { createEmptyCase } from './case-creation'
import { importDocumentIntoCase } from './case-import'

/** 来源角色枚举（IMPORT_DOCUMENT 入参白名单） */
const SOURCE_ROLES: ReadonlySet<string> = new Set(['rule', 'application', 'evidence'])

/** 审核类型枚举（CREATE_CASE 入参白名单） */
const CASE_TYPES: ReadonlySet<string> = new Set(['综合测评', '活动申请', '自定义审核'])

/** 收窄字符串入参（非字符串 → 中文错误，IPC 边界上类型注解不生效） */
function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`参数 ${name} 缺失或类型非法`)
  }
  return value
}

/**
 * 注册内容审核专区全部 IPC 处理器。
 *
 * 由 registerIpcHandlers() 在应用启动时调用一次（幂等由外层守卫保证）。
 */
export function registerReviewIpc(): void {
  // ===== 案卷管理 =====

  /** 载入演示案卷（首次复制进配置目录，之后读存储） */
  ipcMain.handle(REVIEW_IPC_CHANNELS.LOAD_DEMO_CASE, (): ReviewCase => {
    return loadDemoCase()
  })

  /** 列出已存储案卷（摘要） */
  ipcMain.handle(REVIEW_IPC_CHANNELS.LIST_CASES, () => {
    return listCases()
  })

  /** 读取单个案卷 */
  ipcMain.handle(REVIEW_IPC_CHANNELS.GET_CASE, (_event, caseId: string): ReviewCase | undefined => {
    return getCase(caseId)
  })

  /** 创建空案卷 */
  ipcMain.handle(
    REVIEW_IPC_CHANNELS.CREATE_CASE,
    (
      _event,
      input: {
        title: string
        type: ReviewCaseType
        applicant: string
        academicYear: string
        domainPackId?: string
      },
    ): ReviewCase => {
      if (!input || typeof input !== 'object') throw new Error('参数 input 缺失或类型非法')
      if (!CASE_TYPES.has(input.type)) throw new Error(`参数 type 非法：${String(input.type)}`)
      // 领域包 ID 只做存在性判断：未知 ID 回落缺省包由 resolveDomainPack 负责，不因拼错而拒绝建卷
      if (input.domainPackId !== undefined && typeof input.domainPackId !== 'string') {
        throw new Error('参数 domainPackId 类型非法')
      }
      return createEmptyCase({
        title: requireString(input.title, 'title'),
        type: input.type,
        applicant: requireString(input.applicant, 'applicant'),
        academicYear: requireString(input.academicYear, 'academicYear'),
        ...(input.domainPackId ? { domainPackId: input.domainPackId } : {}),
      })
    },
  )

  /** 更新案卷设置（领域包 / 标题 / 类型 / 待审主体文档） */
  ipcMain.handle(
    REVIEW_IPC_CHANNELS.UPDATE_CASE_SETTINGS,
    (_event, input: UpdateCaseSettingsRequest): ReviewCase => {
      if (!input || typeof input !== 'object') throw new Error('参数 input 缺失或类型非法')
      const caseId = requireString(input.caseId, 'caseId')
      const reviewCase = getCase(caseId)
      if (!reviewCase) throw new Error(`案卷不存在: ${caseId}`)
      if (input.type !== undefined && !CASE_TYPES.has(input.type)) {
        throw new Error(`参数 type 非法：${String(input.type)}`)
      }
      if (input.domainPackId !== undefined && typeof input.domainPackId !== 'string') {
        throw new Error('参数 domainPackId 类型非法')
      }
      if (input.title !== undefined && typeof input.title !== 'string') {
        throw new Error('参数 title 类型非法')
      }
      // 待审主体文档：逐个校验是否属于本卷，防止悬空 ID 让三栏联动指向不存在的文档
      let subjectDocumentIds: string[] | undefined
      if (input.subjectDocumentIds !== undefined) {
        if (!Array.isArray(input.subjectDocumentIds) || input.subjectDocumentIds.some((id) => typeof id !== 'string')) {
          throw new Error('参数 subjectDocumentIds 类型非法')
        }
        const known = new Set(reviewCase.documents.map((doc) => doc.id))
        subjectDocumentIds = input.subjectDocumentIds.filter((id) => known.has(id))
        if (subjectDocumentIds.length !== input.subjectDocumentIds.length) {
          throw new Error('待审主体文档包含不属于本案卷的文档 ID')
        }
      }
      const updated: ReviewCase = {
        ...reviewCase,
        ...(input.title !== undefined ? { title: input.title.trim() || reviewCase.title } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.domainPackId !== undefined ? { domainPackId: input.domainPackId } : {}),
        ...(subjectDocumentIds !== undefined ? { subjectDocumentIds } : {}),
        updatedAt: new Date().toISOString(),
      }
      saveCase(updated)
      console.log(
        `[审核专区] 已更新案卷设置: ${caseId}` +
          `${input.domainPackId ? `（领域包 ${input.domainPackId}）` : ''}`,
      )
      return updated
    },
  )

  /** 导入文件到案卷（系统选择框 → 解析为 SourceDocument 并写回案卷） */
  ipcMain.handle(
    REVIEW_IPC_CHANNELS.IMPORT_DOCUMENT,
    (_event, input: { caseId: string; fileName: string; role: SourceDocument['role'] }): Promise<SourceDocument> => {
      if (!input || typeof input !== 'object') throw new Error('参数 input 缺失或类型非法')
      if (!SOURCE_ROLES.has(input.role)) throw new Error(`参数 role 非法：${String(input.role)}`)
      return importDocumentIntoCase({
        caseId: requireString(input.caseId, 'caseId'),
        fileName: requireString(input.fileName, 'fileName'),
        role: input.role,
      })
    },
  )

  /** 删除案卷 */
  ipcMain.handle(REVIEW_IPC_CHANNELS.DELETE_CASE, (_event, caseId: string): void => {
    deleteCase(caseId)
  })

  // ===== AI 生成（左/中栏）=====

  /** 生成规则大纲（左栏；无出口时降级返回 fixture 大纲） */
  ipcMain.handle(
    REVIEW_IPC_CHANNELS.GENERATE_RULE_OUTLINE,
    (_event, request: GenerateRuleOutlineRequest): Promise<RuleOutlineItem[]> => {
      return generateRuleOutline(request)
    },
  )

  /** 识别可审核条目（中栏；无出口时降级返回已有条目） */
  ipcMain.handle(REVIEW_IPC_CHANNELS.EXTRACT_ITEMS, (_event, caseId: string): Promise<ReviewItem[]> => {
    return extractItems(caseId)
  })

  // ===== 审核运行（右栏）=====

  /**
   * 执行审核运行。
   *
   * 引擎选择：网关可用 → 'ai'（内部失败仍会降级 mock）；
   * 网关不可用 → 直接走确定性模拟引擎（决策 D6，保证离线可演示）。
   */
  ipcMain.handle(REVIEW_IPC_CHANNELS.RUN_REVIEW, (_event, caseId: string): Promise<ReviewRun> => {
    const engine = getReviewModelGatewayStatus().available ? 'ai' : 'mock-engine'
    return startReviewRun(caseId, engine)
  })

  /** 查询单次运行状态 */
  ipcMain.handle(
    REVIEW_IPC_CHANNELS.GET_RUN,
    (_event, input: { caseId: string; runId: string }): ReviewRun | undefined => {
      return startReviewRunLookup(input)
    },
  )

  // ===== 审核助手 =====

  /** 助手对话（无出口时降级静态解答 degraded:true） */
  ipcMain.handle(
    REVIEW_IPC_CHANNELS.ASSISTANT_CHAT,
    (_event, request: AssistantChatRequest): Promise<{ content: string; references: string[]; degraded: boolean }> => {
      if (!request || typeof request !== 'object') throw new Error('参数 request 缺失或类型非法')
      if (!Array.isArray(request.history)) throw new Error('参数 history 必须是消息数组')
      // 只允许 user/assistant 角色（阻断渲染层伪造 system 消息的提示词注入面）
      const history = request.history.filter(
        (message) => !!message && (message.role === 'user' || message.role === 'assistant'),
      )
      return reviewAssistantChat({ ...request, history })
    },
  )

  // ===== 报告与网关自检 =====

  /** 导出预审报告（JSON + Markdown） */
  ipcMain.handle(REVIEW_IPC_CHANNELS.EXPORT_REPORT, (_event, caseId: string): Promise<ExportReportResult> => {
    return exportReport(caseId)
  })

  /** 查询当前可用模型出口（白名单自检） */
  ipcMain.handle(REVIEW_IPC_CHANNELS.GET_MODEL_GATEWAY_STATUS, (): ReviewModelGatewayStatus => {
    return getReviewModelGatewayStatus()
  })

  console.log('[审核专区] IPC 处理器注册完成')
}

/** GET_RUN 的实现（独立函数，避免 handler 内联依赖） */
function startReviewRunLookup(input: { caseId: string; runId: string }): ReviewRun | undefined {
  // 延迟 import 避免与 startReviewRun 的命名耦合；直接复用 run-service 查询
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- 主进程内同步查询，无需动态加载
  const { getRun } = require('./run-service') as typeof import('./run-service')
  return getRun(input.caseId, input.runId)
}

// saveCase 供后续"案卷修正写回"迭代使用；runAiReview 由 run-service 调用，此处不直接使用
void saveCase
void runAiReview
