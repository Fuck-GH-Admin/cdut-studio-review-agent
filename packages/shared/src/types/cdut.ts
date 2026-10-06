/**
 * CDUT 专区特区账户与认证类型定义
 *
 * 说明：本模块仅描述「特区账户」的本地状态与 IPC 契约，不包含任何业务数据抓取逻辑。
 * 凭证仅加密保存密码字段（见 token-crypto.ts），不宣称嗅探或持有 Cookie。
 */

export type CdutAccountStatus = 'disconnected' | 'connecting' | 'active' | 'expired'

export interface CdutAccountProfile {
  studentId: string
  studentName: string
  /** Base64 头像数据 URL（主进程读取后离线持久化） */
  avatar?: string
  /** 学院（如：地球物理学院） */
  college?: string
  /** 专业（如：勘查技术与工程） */
  major?: string
  /** 班级编号 */
  classCode?: string
  /** 身份角色（如：学生 / 教师） */
  role?: string
  status: CdutAccountStatus
  rememberPassword?: boolean
  lastLoginAt?: number
  lastActiveAt?: number
}

export interface CdutLoginInput {
  username: string
  password: string
  rememberPassword?: boolean
}

export interface CdutLoginResult {
  success: boolean
  error?: string
  profile?: CdutAccountProfile
}

/**
 * 本地已保存的特区账户摘要，专供登录窗「一键填充」引导消费。
 * 不含 Cookie，密码仅在用户勾选「记住密码」时返回解密后的明文。
 */
export interface CdutSavedAccountSummary {
  hasSaved: boolean
  studentId?: string
  studentName?: string
  avatar?: string
  rememberPassword?: boolean
  savedPassword?: string
}

// ===== 青果教务系统 8 大业务域专用 Tools 契约 =====

/** 8 大业务域标识（对应 31 个底层端点聚合） */
export type CdutToolDomain =
  | 'profile'
  | 'schedule'
  | 'grades'
  | 'exams'
  | 'classrooms'
  | 'curriculum'
  | 'selection'
  | 'notices'

/** Tool 1：学籍与个人档案 */
export interface CdutAcademicProfileParams {
  action:
    | 'get_profile'
    | 'get_contact_info'
    | 'query_status_changes'
    | 'query_major_split'
    | 'submit_major_preference'
    | 'query_minor_signup'
    | 'apply_minor'
  payload?: {
    /** 大类分流专业代号志愿排序（如 ["01", "03", "02"]） */
    volunteerOrder?: string[]
    /** 辅修专业代码 */
    minorMajorCode?: string
    /** 联系方式更新 */
    phoneNumber?: string
  }
}

/** Tool 2：课表与作息日程 */
export interface CdutScheduleParams {
  action: 'get_my_schedule' | 'query_other_schedule'
  /** 学期代码（如 "2025-2026-1"，留空默认当前学期） */
  semester?: string
  /** 指定周次（1-20，留空返回全周课表） */
  week?: number
  queryType?: 'class' | 'teacher' | 'classroom'
  queryKeyword?: string
}

/** Tool 3：成绩与考核评定 */
export interface CdutGradesParams {
  action:
    | 'query_grades'
    | 'query_level_exams'
    | 'query_social_exam_replace'
    | 'apply_social_exam_replace'
    | 'query_grade_review'
    | 'apply_grade_review'
  semester?: string
  courseType?: string
  reviewPayload?: {
    /** 待查卷课程代码 */
    courseId: string
    /** 申请查卷理由 */
    reason: string
  }
}

/** Tool 4：考务安排与报名 */
export interface CdutExamAffairsParams {
  action:
    | 'query_exam_schedule'
    | 'query_makeup_exams'
    | 'signup_makeup_exam'
    | 'query_retake_courses'
    | 'signup_retake_course'
    | 'query_deferral_status'
    | 'apply_exam_deferral'
  semester?: string
  payload?: {
    courseCode?: string
    examType?: 'midterm' | 'final' | 'makeup'
    deferralReason?: string
    contactTel?: string
  }
}

/** Tool 5：教室资源与自习雷达 */
export interface CdutClassroomParams {
  action: 'query_empty_classrooms' | 'query_room_occupancy'
  /** 校区：成都校区 / 宜宾校区；`yanshan` 为历史别名，兼容映射回成都校区 */
  campus: 'chengdu' | 'yibin' | 'yanshan'
  building?: string
  week?: number
  dayOfWeek?: number
  timeSlots?: number[]
  minSeats?: number
}

/** Tool 6：培养方案与毕业学分 */
export interface CdutCurriculumPlanParams {
  action:
    | 'get_training_plan'
    | 'check_graduation_requirements'
    | 'query_degree_application'
    | 'apply_degree'
    | 'query_delay_graduation'
    | 'apply_delay_graduation'
  moduleName?: string
  payload?: {
    delayReason?: string
    expectedGraduationYear?: string
  }
}

/** Tool 7：选课中心与选课结果 */
export interface CdutCourseSelectionParams {
  action:
    | 'query_selection_rounds'
    | 'query_available_courses'
    | 'select_course'
    | 'drop_course'
    | 'query_selected_results'
  roundCode?: string
  courseFilter?: {
    keyword?: string
    courseCategory?: string
    onlyWithRemainingSeats?: boolean
  }
  operatePayload?: {
    /** 选/退课的教学班 ID */
    courseId: string
    /** 课程名称 */
    courseName: string
  }
}

/** Tool 8：教务通知、学业预警与系统服务 */
export interface CdutNoticesParams {
  action:
    | 'query_notices'
    | 'query_bulletins'
    | 'query_messages'
    | 'query_faq'
    | 'post_question'
    | 'query_documents'
    | 'query_academic_warnings'
    | 'get_password_policy'
    | 'change_password'
    | 'get_quick_identity'
  page?: number
  keyword?: string
  changePasswordPayload?: {
    oldPassword?: string
    newPassword?: string
  }
}

/** 8 大业务域入参联合映射 */
export interface CdutToolParamsMap {
  profile: CdutAcademicProfileParams
  schedule: CdutScheduleParams
  grades: CdutGradesParams
  exams: CdutExamAffairsParams
  classrooms: CdutClassroomParams
  curriculum: CdutCurriculumPlanParams
  selection: CdutCourseSelectionParams
  notices: CdutNoticesParams
}

/** 业务域调用统一返回（双模：精简 Markdown 表格 + 结构化 JSON） */
export interface CdutDomainToolResult {
  success: boolean
  /** 人类与模型高可读的 Markdown 视图 */
  markdown: string
  /** 结构化 JSON 关键字段 */
  json?: unknown
  error?: string
  /** 是否已由主进程实际执行写操作 */
  mutated?: boolean
}

/** 写操作二次确认：主进程 -> 渲染端 */
export interface CdutMutationConfirmRequest {
  requestId: string
  /** 业务域 Tool 名称 */
  toolName: string
  /** 触发的 action 标识 */
  action: string
  /** 弹窗标题 */
  title: string
  /** 弹窗说明 */
  description: string
  /** 供展示的结构化参数 */
  payload?: unknown
}

/** 写操作二次确认：渲染端 -> 主进程结果 */
export interface CdutMutationConfirmResult {
  requestId: string
  confirmed: boolean
}

// ===== Tool 9：CDUT 逆向反代大模型接入 =====

/** CDUT 专区三大板块子页面标识；null 表示停留在专区首页 */
export type CdutSubViewId = 'ai-class' | 'yanhu-express' | 'material-review' | null

/** Tool 9：CDUT 逆向反代大模型调用入参（提问内容由发起 AI 自行构造） */
export interface CdutReverseProxyParams {
  /** 发起 AI 根据上下文自行生成的提问内容（必填） */
  queryPrompt: string
  /** 可选的任务上下文，供反代大模型理解背景 */
  taskContext?: string
  /** 可选的目标任务标识，用于路由到特定反代任务 */
  targetTask?: string
}

/** Tool 9 调用结果：复用双模返回结构 */
export type CdutReverseProxyResult = CdutDomainToolResult

// ===== 统一门禁拦截契约 =====

/** 统一门禁拦截通知（主进程 -> 渲染进程），触发专属门禁引导弹窗 */
export interface CdutGatekeeperNoticeEvent {
  requestId: string
  toolName: string
  toolLabel: string
}

/** 统一门禁用户决策响应（渲染进程 -> 主进程） */
export interface CdutGatekeeperDecision {
  requestId: string
  action: 'navigate_login' | 'decline'
}

// ===== AI 速课堂专属工作区与会话 IPC 契约 =====

/** 速课堂专属工作区 slug（物理隔离于 agent-workspaces 下） */
export const CDUT_AI_CLASS_WORKSPACE_SLUG = 'cdut-ai-class'

/** 速课堂专属工作区展示名（用于会话类型判定，兼容 slug 冲突场景） */
export const CDUT_AI_CLASS_WORKSPACE_NAME = 'AI速课堂'

export const CDUT_AI_CLASS_IPC_CHANNELS = {
  /** 列出速课堂历史课堂简报 */
  LIST_SESSIONS: 'cdut-ai-class:list-sessions',
  /** 新建速课堂会话（自动锁定内部导师预设） */
  CREATE_SESSION: 'cdut-ai-class:create-session',
  /** 删除速课堂会话 */
  DELETE_SESSION: 'cdut-ai-class:delete-session',
  /** 按用户选定模式生成跨资料知识关联并返回图谱数据（入参 StudyGraphGenerateInput） */
  GENERATE_GRAPH_RELATIONS: 'cdut-ai-class:generate-graph-relations',
  /** 图谱推演进度事件（主进程 -> 渲染进程，实时广播批次进度） */
  GENERATE_PROGRESS: 'cdut-ai-class:generate-progress',
  /** 动态测算当前会话三种生成模式的 Token 与费用预估 */
  ESTIMATE_GRAPH_COST: 'cdut-ai-class:estimate-graph-cost',
  /** 全域跨文档高精度混合检索（入参 StudySearchKnowledgeInput） */
  SEARCH_KNOWLEDGE: 'cdut-ai-class:search-knowledge',
} as const

/** 图谱推演进度事件（主进程 -> 渲染进程，驱动资料树顶部进度胶囊） */
export interface StudyGraphProgressEvent {
  sessionId: string
  /** 已完成批次 */
  current: number
  /** 总批次 */
  total: number
  /** 完成百分比（0~100） */
  percent: number
  /** 当前阶段文案（如「正在推演分层知识网络」） */
  phase: string
}

/** 全域跨文档混合检索入参（AI 导师 study_search_knowledge 工具与渲染端共用） */
export interface StudySearchKnowledgeInput {
  sessionId: string
  /** 检索查询词或学生的具体提问 */
  query: string
  /** 可选：限定在某份特定文档中检索；不传则跨全域所有文档检索 */
  targetDocumentId?: string
  /** 返回最相关的切块数量（默认 5） */
  topK?: number
}

/** 单条全域检索结果（带来源文档名与章节定位） */
export interface StudySearchResultItem {
  documentId: string
  documentFileName: string
  sectionId: string
  sectionTitle: string
  score: number
  /** 经过显著性剪枝后的高密度事实摘要 */
  matchedExcerpt: string
  /** PDF 页码范围（非 PDF 可省略） */
  pageRange?: [number, number]
}

/** 全域跨文档混合检索结果 */
export interface StudySearchKnowledgeResult {
  success: boolean
  items: StudySearchResultItem[]
  error?: string
}

export const CDUT_ZONE_IPC_CHANNELS = {
  GET_ACCOUNT: 'cdut-zone:get-account',
  /** 查询本地已保存的特区账户元数据（供登录窗一键填充引导） */
  GET_SAVED_ACCOUNT: 'cdut-zone:get-saved-account',
  LOGIN: 'cdut-zone:login',
  LOGOUT: 'cdut-zone:logout',
  STATUS_CHANGED: 'cdut-zone:status-changed',
  /** 渲染端（或调试入口）调用 8 大业务域 Tool */
  CALL_DOMAIN_TOOL: 'cdut-zone:call-domain-tool',
  /** 渲染端回传写操作二次确认结果 */
  CONFIRM_MUTATION: 'cdut-zone:confirm-mutation',
  /** 主进程派发写操作确认请求 */
  ON_MUTATION_REQUEST: 'cdut-zone:on-mutation-request',
  /** 主进程派发统一门禁拦截通知（拉起专属门禁弹窗） */
  GATEKEEPER_BLOCKED: 'cdut-zone:gatekeeper-blocked',
  /** 渲染端回传统一门禁用户决策 */
  GATEKEEPER_RESPOND: 'cdut-zone:gatekeeper-respond',
} as const
