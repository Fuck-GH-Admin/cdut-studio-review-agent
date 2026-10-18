/** P2-A: bounded model-facing schema and compact D2 map.
 * Never deletes/merges checks or authoring requirements; authorization remains Main-owned. */
import type { CaseAggregateV2, RuleSpec, TemplateVersion } from '@profer/shared'

export function piObservationFieldContract(template: Pick<TemplateVersion, 'fields'>, caseId: string): string {
  const fields = template.fields
  if (!fields.length) return [
    '【可提交事实字段】本模板没有声明任何 FieldSpec：review_submit_result 的 observations 必须省略或为 []。',
    '不要为对象键、场景、条件、材料名、claim_item 等自动创造 fieldKey；这些属于固定 Plan 或检查理由，不是 Observation。',
  ].join('\n')
  return [
    '【可提交事实字段】仅允许以下模板已声明的 FieldSpec（字段 ID、类型、作用域均须精确匹配）：',
    ...fields.map(field => {
      const scope = field.scope === 'case' ? `case（subjectId 必须是 ${caseId}）` : 'subject（subjectId 必须属于本案、匹配分项）'
      return `- ${field.key} | ${field.kind} | ${scope}${field.sectionId ? ' | sectionId='+field.sectionId : ''} | ${field.label}`
    }),
    '任何 observations 必须有真实 material documentVersionId、blockId 与准确引文，未经用户确认只能为事实候选；禁止添加任何未列出的 fieldKey。',
  ].join('\n')
}

type D2Mapping = NonNullable<CaseAggregateV2['d2RuntimePlan']>['mapping']

export function compactD2MappingForPi(mapping: D2Mapping): string {
  return [
    '业务对象与操作绑定（逐行完整列出，不允许合并或忽略 Check；事实支持项不等于已确认证据）：',
    'ruleId | checkId | subjectId | objectKey | authority | applicability | supportsFacts',
    ...mapping.map(item => [
      item.ruleId, item.checkId, item.subjectId ?? '整案', item.objectKey ?? '整案',
      item.authority, item.applicability ?? '整案',
      (item.evidenceCoverage?.supportsFacts ?? []).join(',') || '无',
    ].join(' | ')),
  ].join('\n')
}

export function piRuleForPrompt(rule: RuleSpec, sectionName?: string): string {
  const header = `- ${rule.id} | ${rule.execution} | ${rule.targetScope}${sectionName ? ' | 分项：' + sectionName : ''}`
  return `${header} | ${rule.confirmation === 'confirmed' ? '已确认' : '未确认→只可 awaiting-confirmation'} | ${rule.title}：${rule.requirement}`
}

export const PI_SUBMIT_SCHEMA_CONTRACT = [
  '【review_submit_result 的精确输入合同】',
  'summary: string；observations?: Array<{subjectId,fieldKey,kind,value,sourceRefs:[{documentVersionId,blockId,quote?}]}>；',
  'checks?: Array<{ruleId,subjectIds,status,reason,sourceRefs?:[{documentVersionId,blockId,quote?}]}>；finish?: boolean。',
  '状态只允许 compliant / non-compliant / awaiting-supplement / awaiting-confirmation / not-applicable。',
  '任何未确认规则的检查状态只能是 awaiting-confirmation（即使材料中出现支持或否定信息）；不得把模板作者态、上传内容当作校方正式确认。',
  'compliant 和 non-compliant 需要本案当前有效材料版本、真实读取的 blockId 和准确引文，且必须满足逐对象 EvidenceLink 与 supportsFact 的 Main 校验；没有对应人工关联的事实不能凭同案其它对象的材料提交确定结论。',
  '仅在证据和适用条件实际满足时报告确定状态。unknown 不能等同 not-applicable；缺失、过期、冲突或未核实材料采用 awaiting-confirmation / awaiting-supplement。',
  '观测事实和检查结果是两个不同的输入：对象名称、场景、规则 ID、Check ID 等不得杜撰为 observations 的 fieldKey。',
  '先按对象或模块提交 finish=false，读取 rejected/missingChecks 后定向修正；没有任何提交拒绝并且全部检查有效才 finish=true。',
].join('\n')
