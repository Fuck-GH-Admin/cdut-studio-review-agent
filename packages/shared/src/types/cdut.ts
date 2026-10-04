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
} as const
