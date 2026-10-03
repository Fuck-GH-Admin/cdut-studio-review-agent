/**
 * 六内置模板（M1，设计 02 §2）：
 * 学生综测 / 活动材料审批 / 奖学金资格与推荐 / 项目比赛评委 / 费用材料核对 / 文件协议要求核对。
 *
 * 每个模板可直接发布（error 清零）；示例政策以后续 M2 的 fixture 文档为来源，
 * 本文件只声明结构化骨架（字段/材料槽/流程/评分/输出），保证"第七种业务只靠配置创建"走同一通道。
 */

import type { TemplateVersion } from '@profer/shared'

/** 通用两级流程（初审→终审） */
const TWO_LEVEL_STAGES: TemplateVersion['stages'] = [
  { id: 'auto-check', name: '自动核对', kind: 'auto-check', executorRole: 'system' },
  { id: 'first-review', name: '初审', kind: 'manual-review', executorRole: 'reviewer' },
  { id: 'final-review', name: '终审', kind: 'manual-review', executorRole: 'teacher' },
]

function base(overrides: Partial<TemplateVersion> & Pick<TemplateVersion, 'templateId' | 'name' | 'objectType' | 'fields' | 'materialSlots' | 'policyVersionIds' | 'stages' | 'outputs'>): TemplateVersion {
  return {
    schemaVersion: 2,
    version: 1,
    status: 'draft',
    displayName: { template: '{{title}}' },
    createdAt: '2026-10-03T00:00:00.000Z',
    ...overrides,
  }
}

const f = (key: string, label: string, kind: 'text' | 'number' | 'date' | 'enum', extra: Record<string, unknown> = {}) => ({
  key, label, kind, required: true, visibility: 'public' as const, ...extra,
})

const slot = (id: string, name: string, purpose: string, requiredElements: string[], accepted: TemplateVersion['materialSlots'][number]['acceptedKinds'] = ['pdf', 'image', 'office']) => ({
  id, name, purpose, requiredElements, acceptedKinds: accepted, minCount: 1, maxCount: 10, allowReuseAcrossSubjects: false,
})

/** 1. 学生综测：等级映射/适用年限/互斥/共享上限/加权汇总（02 §2 第一行） */
const comprehensiveAssessment: TemplateVersion = base({
  templateId: 'comprehensive-assessment-v2',
  name: '学生综合测评',
  objectType: 'person',
  domainPackId: 'comprehensive-assessment',
  fields: [
    f('studentName', '学生姓名', 'text'),
    f('studentId', '学号', 'text'),
    f('academicYear', '学年', 'text'),
    f('category', '指标类别', 'enum'),
    f('level', '申报等级', 'enum'),
    f('declaredScore', '申报分数', 'number'),
    f('activityDate', '活动日期', 'date'),
  ],
  materialSlots: [
    slot('application-form', '综合测评申报表', '申报事项与等级', ['姓名', '学号', '事项', '等级', '日期']),
    slot('certificates', '证明材料', '等级/日期/颁发单位核验', ['等级', '日期', '颁发单位'], ['pdf', 'image', 'office', 'text']),
  ],
  policyVersionIds: ['policy-comprehensive-assessment'],
  stages: TWO_LEVEL_STAGES,
  outputs: [
    { id: 'item-feedback', kind: 'item-feedback', audience: 'student' },
    { id: 'score-sheet', kind: 'score-sheet', audience: 'teacher' },
  ],
})

/** 2. 活动材料审批：资格/名额预算/时间地点/附件要素（无评分） */
const activityApproval: TemplateVersion = base({
  templateId: 'activity-approval-v2',
  name: '活动材料审批',
  objectType: 'organization',
  fields: [
    f('orgName', '组织名称', 'text'),
    f('activityName', '活动名称', 'text'),
    f('startTime', '开始时间', 'date'),
    f('endTime', '结束时间', 'date'),
    f('location', '地点', 'text'),
    f('budget', '预算金额', 'number'),
    f('contactPerson', '负责人', 'text'),
  ],
  materialSlots: [
    slot('application', '活动申请书', '活动要素完整性', ['时间', '地点', '负责人']),
    slot('plan', '策划书', '内容与流程', ['流程', '安全预案']),
    slot('budget-sheet', '预算表', '预算明细', ['明细', '合计']),
  ],
  policyVersionIds: ['policy-activity-approval'],
  stages: TWO_LEVEL_STAGES,
  outputs: [{ id: 'approval', kind: 'approval', audience: 'teacher' }],
})

/** 3. 奖学金资格与推荐：门槛/重复申请/截止/名额 */
const scholarship: TemplateVersion = base({
  templateId: 'scholarship-v2',
  name: '奖学金资格与推荐',
  objectType: 'person',
  fields: [
    f('studentName', '学生姓名', 'text'),
    f('gpaRank', '成绩排名', 'number'),
    f('category', '申请类别', 'enum'),
    f('applicationDate', '申请日期', 'date'),
  ],
  materialSlots: [
    slot('transcript', '成绩单', '排名与学分', ['排名', 'GPA'], ['pdf', 'image']),
    slot('recommendation', '推荐材料', '资格说明', ['推荐人']),
  ],
  policyVersionIds: ['policy-scholarship'],
  stages: TWO_LEVEL_STAGES,
  outputs: [
    { id: 'approval', kind: 'approval', audience: 'teacher' },
    { id: 'roster', kind: 'roster', audience: 'organizer' },
  ],
})

/** 4. 项目/比赛评委：形式资格 + 独立量表评分（A14） */
const projectJudging: TemplateVersion = base({
  templateId: 'project-judging-v2',
  name: '项目/比赛评委',
  objectType: 'project',
  fields: [
    f('projectName', '项目名称', 'text'),
    f('teamName', '团队', 'text'),
    f('track', '申报类型', 'enum'),
    f('summary', '项目摘要', 'text'),
  ],
  materialSlots: [slot('proposal', '项目申报书', '摘要与成果', ['摘要', '成果'])],
  policyVersionIds: ['policy-project-judging'],
  stages: [
    { id: 'auto-check', name: '形式资格核对', kind: 'auto-check', executorRole: 'system' },
    { id: 'rating', name: '独立评分', kind: 'independent-rating', executorRole: 'judge' },
    { id: 'aggregate', name: '汇总定稿', kind: 'summary', executorRole: 'organizer' },
  ],
  rubric: {
    dimensions: [
      { id: 'innovation', name: '创新性', min: 1, max: 5, weight: 0.4 },
      { id: 'execution', name: '可行性', min: 1, max: 5, weight: 0.6 },
    ],
    totalPrecision: 2,
    missingStrategy: 'block',
  },
  outputs: [
    { id: 'rating-matrix', kind: 'rating-matrix', audience: 'organizer' },
    { id: 'item-feedback', kind: 'item-feedback', audience: 'student' },
  ],
})

/** 5. 费用材料核对：合计/限额/票据要素/单据一致性 */
const expenseCheck: TemplateVersion = base({
  templateId: 'expense-check-v2',
  name: '费用材料核对',
  objectType: 'transaction',
  fields: [
    f('claimantName', '报销人', 'text'),
    f('totalAmount', '申报金额', 'number', { unit: 'CNY' }),
    f('expenseDate', '费用日期', 'date'),
  ],
  materialSlots: [slot('invoices', '票据', '要素与真伪留痕', ['金额', '日期', '抬头'], ['pdf', 'image'])],
  policyVersionIds: ['policy-expense-check'],
  stages: TWO_LEVEL_STAGES,
  outputs: [{ id: 'approval', kind: 'approval', audience: 'teacher' }],
})

/** 6. 文件/协议要求核对：必备条款/附件引用/跨文档一致性 */
const documentChecklist: TemplateVersion = base({
  templateId: 'document-checklist-v2',
  name: '文件/协议要求核对',
  objectType: 'document',
  fields: [
    f('documentTitle', '文件标题', 'text'),
    f('counterparty', '相对方', 'text'),
    f('version', '版本', 'text'),
  ],
  materialSlots: [
    slot('target-document', '待核对文件', '条款完整性', ['条款', '签章']),
    slot('requirement-doc', '要求清单', '依据要求', ['要求']),
  ],
  policyVersionIds: ['policy-document-checklist'],
  stages: [
    { id: 'auto-check', name: '条款核对', kind: 'auto-check', executorRole: 'system' },
    { id: 'first-review', name: '人工复核', kind: 'manual-review', executorRole: 'reviewer' },
  ],
  outputs: [{ id: 'item-feedback', kind: 'item-feedback', audience: 'reviewer' }],
})

/** 六内置模板（02 §2；发布动作由模板仓库执行） */
export const BUILTIN_TEMPLATES_V2: TemplateVersion[] = [
  comprehensiveAssessment,
  activityApproval,
  scholarship,
  projectJudging,
  expenseCheck,
  documentChecklist,
]

/** 幂等写入内置模板草稿（已存在同名同版本时不覆盖用户改动） */
export function ensureBuiltinTemplateDrafts(store: {
  getTemplate(id: string, version?: number): TemplateVersion | undefined
  saveDraft(template: TemplateVersion): TemplateVersion
}): void {
  for (const template of BUILTIN_TEMPLATES_V2) {
    if (!store.getTemplate(template.templateId, template.version)) {
      store.saveDraft(template)
    }
  }
}
