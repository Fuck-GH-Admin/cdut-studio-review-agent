/**
 * 内容审核专区 - 领域包（P1/D14）
 *
 * 背景：原先「规则类别」「问题类型」「prompt 角色」三处写死在综测场景，
 * 换个审批领域（合同/报销/自定义）模型输出就被六类框住。
 *
 * 领域包把这三样抽成数据：
 * - ruleCategories：AI 提取规则大纲时的建议类别
 * - findingKinds：问题类型表（含展示标签与默认严重度）
 * - prompts：角色设定与领域审查视角
 *
 * 结构化的指令（JSON 字段要求、锚点回引规则）仍留在服务层代码里——那部分是引擎契约，
 * 不属于领域知识，避免每个包各写一份导致漂移。
 *
 * 未知类型回落策略（D15）：findingKind 不在包内时，标签按原字符串展示，严重度回落 yellow。
 */

import type { FindingSeverity, RuleConstraint } from './review'

/** 领域包 ID（内置四包 + 自定义字符串） */
export type ReviewDomainPackId = string

/** 内置领域包 ID */
export const BUILTIN_DOMAIN_PACK_IDS = {
  /** 学生综合素质测评（原 demo 场景） */
  comprehensiveAssessment: 'comprehensive-assessment',
  /** 合同/协议审批 */
  contractReview: 'contract-review',
  /** 费用报销审批 */
  expenseReimbursement: 'expense-reimbursement',
  /** 自定义（用户自填类别与类型） */
  custom: 'custom',
} as const

/** 缺省领域包（兼容未标注 domainPackId 的历史案卷） */
export const DEFAULT_DOMAIN_PACK_ID = BUILTIN_DOMAIN_PACK_IDS.comprehensiveAssessment

/** 领域包内的一种问题类型 */
export interface ReviewFindingKindSpec {
  /** 类型 ID（写入 ReviewFinding.kind） */
  id: string
  /** 展示标签（问题卡上显示的中文名） */
  label: string
  /** 默认严重度（模型未给或给了非法值时使用） */
  defaultSeverity: FindingSeverity
  /** 判定口径提示（注入 prompt，帮助模型对齐语义） */
  hint?: string
}

/** 领域包 prompt 片段（结构化指令由服务层拼接，此处只放领域知识） */
export interface ReviewDomainPrompts {
  /** 角色设定，如 "你是学生综合素质测评审核助手" */
  role: string
  /** 领域审查视角补充（可缺省），如合同的"重点关注权责对等与违约责任" */
  guideline?: string
}

/** 领域包 */
export interface ReviewDomainPack {
  id: ReviewDomainPackId
  /** 展示名 */
  name: string
  /** 一句话说明（UI 下拉里展示） */
  description: string
  /** 规则大纲的建议类别（AI 提取时注入） */
  ruleCategories: string[]
  /** 问题类型表 */
  findingKinds: ReviewFindingKindSpec[]
  /** 该领域可用的规则约束类型（供 mock 引擎与约束校验参考） */
  constraintKinds: Array<RuleConstraint['kind']>
  prompts: ReviewDomainPrompts
  /** 是否内置（false = 用户自定义包） */
  builtin: boolean
}

/** 通用兜底类型：任何领域包都应包含，未知类型最终回落于此 */
export const FALLBACK_FINDING_KIND = 'other'

/** 综测领域包（与既有 demo 行为完全一致，保证不回归） */
const COMPREHENSIVE_ASSESSMENT: ReviewDomainPack = {
  id: BUILTIN_DOMAIN_PACK_IDS.comprehensiveAssessment,
  name: '学生综合素质测评',
  description: '综测加分审核：等级分值、材料要求、计分上限与互斥',
  ruleCategories: ['准入条件', '指标分类', '等级分值', '材料要求', '时间范围', '上限', '互斥', '例外'],
  findingKinds: [
    { id: 'level-conflict', label: '等级冲突', defaultSeverity: 'red', hint: '申报等级与证明材料等级不一致' },
    { id: 'missing-evidence', label: '缺证明', defaultSeverity: 'red', hint: '申报事项未关联任何证明材料' },
    { id: 'score-over-limit', label: '超上限', defaultSeverity: 'red', hint: '计入分数超过规则规定的学年上限' },
    { id: 'mutual-exclusion', label: '互斥重复计分', defaultSeverity: 'red', hint: '同一互斥组内多事项同时计分' },
    { id: 'date-out-of-range', label: '日期越界', defaultSeverity: 'red', hint: '活动/获奖日期不在认可时段内' },
    { id: 'unclear-evidence', label: '证明看不清', defaultSeverity: 'yellow', hint: '证明要素缺失或无法辨认，需人工复核' },
    { id: 'info-incomplete', label: '信息不全', defaultSeverity: 'yellow', hint: '申报要素（等级/日期/单位）缺失' },
    { id: 'rule-unmatched', label: '规则未覆盖', defaultSeverity: 'yellow', hint: '找不到与申报类别对应的计分规则' },
    { id: 'cross-document-mismatch', label: '材料互相矛盾', defaultSeverity: 'red', hint: '多份待审文件之间信息不一致' },
    { id: FALLBACK_FINDING_KIND, label: '其他问题', defaultSeverity: 'yellow', hint: '不属于以上类型的其他问题' },
  ],
  constraintKinds: ['max-score', 'score-value', 'mutual-exclusion', 'date-range', 'required-evidence', 'level-mapping'],
  prompts: {
    role: '你是学生综合素质测评审核助手',
    guideline: '审核视角：申报等级与证明是否一致、材料是否齐备、日期是否在认可学年内、是否触发互斥或超上限。',
  },
  builtin: true,
}

/** 合同审批领域包 */
const CONTRACT_REVIEW: ReviewDomainPack = {
  id: BUILTIN_DOMAIN_PACK_IDS.contractReview,
  name: '合同/协议审批',
  description: '合同条款审核：必备条款、权责对等、付款与违约约定',
  ruleCategories: ['主体资格', '标的与范围', '付款条件', '交付与验收', '违约责任', '保密与知识产权', '争议解决', '变更与终止', '生效条件'],
  findingKinds: [
    { id: 'missing-clause', label: '必备条款缺失', defaultSeverity: 'red', hint: '依据方要求必备的条款在待审合同中不存在' },
    { id: 'clause-conflict', label: '条款冲突', defaultSeverity: 'red', hint: '同一合同内两处条款互相矛盾' },
    { id: 'cross-document-mismatch', label: '文件间不一致', defaultSeverity: 'red', hint: '合同正文与附件/另一版本之间信息不一致' },
    { id: 'unclear-liability', label: '违约责任不明', defaultSeverity: 'red', hint: '未约定违约责任或约定无法执行' },
    { id: 'unbalanced-obligation', label: '权责不对等', defaultSeverity: 'yellow', hint: '单方义务明显重于对方，缺少对等约定' },
    { id: 'unclear-payment', label: '付款条件不明', defaultSeverity: 'yellow', hint: '付款节点、金额或方式不明确' },
    { id: 'missing-deadline', label: '期限缺失', defaultSeverity: 'yellow', hint: '交付/验收/生效期限未约定' },
    { id: 'invalid-reference', label: '引用错误', defaultSeverity: 'yellow', hint: '引用的附件、条款号或法规不存在或错位' },
    { id: 'unfavorable-term', label: '不利条款', defaultSeverity: 'yellow', hint: '存在明显不利的风险条款，建议协商修改' },
    { id: FALLBACK_FINDING_KIND, label: '其他问题', defaultSeverity: 'yellow', hint: '不属于以上类型的其他问题' },
  ],
  constraintKinds: ['required-clause', 'date-range', 'required-evidence', 'amount-limit', 'max-score'],
  prompts: {
    role: '你是合同条款审核助手',
    guideline: '审核视角：依据方给出的审查要点逐条核对待审合同；重点关注必备条款是否齐备、权责是否对等、付款与违约责任是否明确、正文与附件是否一致。给出的建议应指出具体条款位置并说明风险。',
  },
  builtin: true,
}

/** 费用报销审批领域包 */
const EXPENSE_REIMBURSEMENT: ReviewDomainPack = {
  id: BUILTIN_DOMAIN_PACK_IDS.expenseReimbursement,
  name: '费用报销审批',
  description: '报销单审核：范围、票据合规、标准限额与时限',
  ruleCategories: ['报销范围', '票据要求', '标准限额', '审批权限', '时间限制', '不予报销项', '例外情形'],
  findingKinds: [
    { id: 'over-standard', label: '超标准', defaultSeverity: 'red', hint: '金额或标准超过制度规定的限额' },
    { id: 'invalid-invoice', label: '票据不合规', defaultSeverity: 'red', hint: '票据要素缺失、抬头错误或类型不符合要求' },
    { id: 'missing-invoice', label: '缺少票据', defaultSeverity: 'red', hint: '报销事项未附对应票据' },
    { id: 'duplicate-claim', label: '重复报销', defaultSeverity: 'red', hint: '同一票据或同一事项被多次申报' },
    { id: 'cross-document-mismatch', label: '单据间不一致', defaultSeverity: 'red', hint: '报销单与票据/审批单之间金额或事由不一致' },
    { id: 'deadline-exceeded', label: '超时限', defaultSeverity: 'yellow', hint: '报销申请超出规定时限' },
    { id: 'unclear-purpose', label: '事由不明', defaultSeverity: 'yellow', hint: '费用事由描述不清，无法判断业务真实性' },
    { id: 'wrong-category', label: '科目错误', defaultSeverity: 'yellow', hint: '费用归入的科目与制度定义不符' },
    { id: 'out-of-scope', label: '超出报销范围', defaultSeverity: 'red', hint: '该费用不在制度允许的报销范围内' },
    { id: FALLBACK_FINDING_KIND, label: '其他问题', defaultSeverity: 'yellow', hint: '不属于以上类型的其他问题' },
  ],
  constraintKinds: ['amount-limit', 'max-score', 'date-range', 'required-evidence', 'mutual-exclusion'],
  prompts: {
    role: '你是费用报销审核助手',
    guideline: '审核视角：逐条核对报销事项与票据；重点检查是否在报销范围内、票据是否合规、金额是否超标准、是否超时限、是否存在重复报销。金额类结论必须给出计算依据。',
  },
  builtin: true,
}

/**
 * 自定义领域包。
 *
 * 结构与内置包一致，但类别/类型为通用集合；调用方可基于它构造用户自定义包
 * （替换 name/ruleCategories/findingKinds/prompts 即可）。
 */
const CUSTOM: ReviewDomainPack = {
  id: BUILTIN_DOMAIN_PACK_IDS.custom,
  name: '自定义审核',
  description: '通用文件审批：按依据文件自行判定，不预设领域规则',
  ruleCategories: ['依据条款', '适用条件', '限制与禁止', '材料要求', '时间范围', '例外情形', '其他'],
  findingKinds: [
    { id: 'non-compliant', label: '不符合要求', defaultSeverity: 'red', hint: '待审文件内容与依据条款要求不符' },
    { id: 'missing-material', label: '材料缺失', defaultSeverity: 'red', hint: '依据要求提供的材料未提供' },
    { id: 'clause-conflict', label: '条款冲突', defaultSeverity: 'red', hint: '文件内部或文件之间条款互相矛盾' },
    { id: 'cross-document-mismatch', label: '文件间不一致', defaultSeverity: 'red', hint: '多份待审文件之间信息不一致' },
    { id: 'info-incomplete', label: '信息不全', defaultSeverity: 'yellow', hint: '关键要素缺失，无法判定' },
    { id: 'unclear-content', label: '内容不清', defaultSeverity: 'yellow', hint: '内容模糊或无法辨认，需人工确认' },
    { id: 'rule-unmatched', label: '规则未覆盖', defaultSeverity: 'yellow', hint: '依据文件中找不到对应条款' },
    { id: FALLBACK_FINDING_KIND, label: '其他问题', defaultSeverity: 'yellow', hint: '不属于以上类型的其他问题' },
  ],
  constraintKinds: ['max-score', 'score-value', 'mutual-exclusion', 'date-range', 'required-evidence', 'level-mapping'],
  prompts: {
    role: '你是文件审核助手',
    guideline: '审核视角：严格依据给定的依据文件逐条核对待审文件；依据文件未覆盖的事项不要臆断，标注为规则未覆盖。所有结论必须能回引到依据原文或待审文件原文。',
  },
  builtin: true,
}

/** 内置领域包清单（顺序即 UI 下拉顺序） */
export const BUILTIN_DOMAIN_PACKS: ReviewDomainPack[] = [
  COMPREHENSIVE_ASSESSMENT,
  CONTRACT_REVIEW,
  EXPENSE_REIMBURSEMENT,
  CUSTOM,
]

/**
 * 解析领域包：ID 未提供或未命中时回落缺省包（综测），保证历史案卷行为不变。
 *
 * @param packId 领域包 ID（可缺省）
 */
/** 显式声明的领域包 ID 是否为已知内置包（M0/H14：未知 ID 阻止默默按综测执行，K14） */
export function isKnownDomainPack(packId?: string): boolean {
  if (!packId) return true // 未声明 = 使用缺省包，属于显式语义
  return BUILTIN_DOMAIN_PACKS.some((pack) => pack.id === packId)
}

export function resolveDomainPack(packId?: string): ReviewDomainPack {
  if (!packId) return COMPREHENSIVE_ASSESSMENT
  return BUILTIN_DOMAIN_PACKS.find((pack) => pack.id === packId) ?? COMPREHENSIVE_ASSESSMENT
}

/**
 * 取问题类型的展示标签；未知类型回落为原字符串（D15 宽进严出）。
 *
 * @param pack 领域包
 * @param kind 问题类型 ID
 */
export function findingKindLabel(pack: ReviewDomainPack, kind: string): string {
  return pack.findingKinds.find((spec) => spec.id === kind)?.label ?? kind
}

/**
 * 取问题类型的默认严重度；未知类型回落 yellow。
 *
 * @param pack 领域包
 * @param kind 问题类型 ID
 */
export function findingKindSeverity(pack: ReviewDomainPack, kind: string): FindingSeverity {
  return pack.findingKinds.find((spec) => spec.id === kind)?.defaultSeverity ?? 'yellow'
}

/**
 * 判断类型是否属于该领域包（用于把模型输出的未知类型收敛到兜底类型）。
 *
 * @param pack 领域包
 * @param kind 问题类型 ID
 */
export function isKnownFindingKind(pack: ReviewDomainPack, kind: string): boolean {
  return pack.findingKinds.some((spec) => spec.id === kind)
}
