/**
 * 六内置模板完整政策样例（N4，docs/design/review-agent/05 §5.1 + 06 §6.2；R02）
 *
 * 每个内置模板配一份【虚构演示】政策（负责人声明来源 + 确认记录 + 发布版），
 * 模板引用精确 policyRefs → 六模板全部可发布且依赖完整（修正"草案≠六套可用业务"）。
 * 真实使用：负责人上传/确认为本校现行规定，不以虚构样例自动通过真实审批。
 */

import type { PolicyRecord, TemplateVersion } from '@profer/shared'
import { canonicalContentHash, getPolicy, publishPolicy, savePolicyDraft } from '../policy-store'
import { BUILTIN_TEMPLATES_V2 } from '../builtin-templates'
import { getTemplate, publishTemplate, saveDraft } from '../template-store'

/** 各模板的虚构政策要点（06 §6.2 最小完整业务内容摘要） */
const POLICY_SUMMARIES: Record<string, string> = {
  'activity-approval-v2': 'A1 组织资格与活动要素完整；A2 时间地点无冲突；A3 预算表明细与合计一致；A4 安全预案必备。',
  'scholarship-v2': 'S1 成绩排名达标；S2 申请类别与资格匹配；S3 申请截止前提交；S4 名额由已确认规则处理。',
  'project-judging-v2': 'J1 申报书摘要与成果齐全；J2 团队信息一致；J3 评委独立评分（1-5 量表加权）；J4 同分共享名次、名额由组织者裁定。',
  'expense-check-v2': 'E1 票据要素（金额/日期/抬头）齐全；E2 同一票据不重复报销（去重择高）；E3 合计不超预算上限（封顶 5000）；E4 人工批准金额留痕。',
  'document-checklist-v2': 'D1 每条要求逐条定位检查；D2 缺失/冲突生成修订草案待复核；D3 人工结论附依据；D4 版本适用期核对。',
  'comprehensive-assessment-v2': '见综合测评办法（P1-P4）。',
}

function fixturePolicyId(templateId: string): string {
  return `policy-${templateId.replace('-v2', '')}-demo`
}

/** 生成六模板的虚构政策 + 带精确引用的模板（幂等数据，不落盘） */
export function buildAllTemplateFixtures(): Array<{ policy: PolicyRecord; template: TemplateVersion }> {
  return BUILTIN_TEMPLATES_V2.map((template) => {
    const content = `【虚构演示】${template.name}审核政策（演示版 v1）\n\n${POLICY_SUMMARIES[template.templateId] ?? '演示规则。'}\n\n本文件为演示用虚构政策，不作为任何真实学校的规定。`
    const policy: PolicyRecord = {
      policyId: fixturePolicyId(template.templateId),
      version: 1,
      title: `${template.name}审核政策（虚构演示）`,
      contentHash: canonicalContentHash(content),
      content,
      origin: { kind: 'owner-statement', text: '演示负责人录入（虚构样例）', enteredBy: 'fixture', enteredAt: '2026-10-05T00:00:00.000Z' },
      status: 'draft',
      confirmations: [{ actorId: 'fixture-owner', role: 'template-owner', at: '2026-10-05T00:00:00.000Z', note: '虚构样例确认（演示数据）' }],
    }
    const withRefs: TemplateVersion = {
      ...template,
      policyRefs: [{ policyId: policy.policyId, version: 1, contentHash: policy.contentHash }],
      policyVersionIds: [policy.policyId],
    }
    return { policy, template: withRefs }
  })
}

/** 幂等落盘：六政策草稿 + 六模板草稿（无引用的旧草稿升级为带 policyRefs；已发布不覆盖） */
export function seedAllTemplateFixtures(store: { getTemplate(id: string, version?: number): TemplateVersion | undefined; saveDraft(template: TemplateVersion): TemplateVersion }): void {
  for (const { policy, template } of buildAllTemplateFixtures()) {
    if (!getPolicy(policy.policyId, policy.version)) savePolicyDraft(policy)
    const existing = store.getTemplate(template.templateId, template.version)
    // 无精确引用的旧草稿升级（保留用户字段改动难判定：仅当从未改动时升级——此处以 policyRefs 缺失为升级信号）
    if (!existing || (existing.status === 'draft' && !existing.policyRefs)) store.saveDraft(template)
  }
}

/** 一键发布六套（政策先行，模板随后；已发布幂等跳过） */
export function publishAllTemplateFixtures(store: { getTemplate(id: string, version?: number): TemplateVersion | undefined; saveDraft(template: TemplateVersion): TemplateVersion; publish(templateId: string, version: number): TemplateVersion }): void {
  seedAllTemplateFixtures(store)
  for (const { policy, template } of buildAllTemplateFixtures()) {
    publishPolicy(policy.policyId, 1)
    store.publish(template.templateId, template.version)
  }
}
