/** P2-C: explanatory hints for model-facing submission rejections.
 * Pure, bounded, never a substitute for Main validation and never an authorization change.
 * Do not echo untrusted original rejection text in advice. */
export type PiReviewRepairCode =
  | 'OBS_FIELD_NOT_DECLARED' | 'OBS_TYPE_OR_TARGET_MISMATCH' | 'RULE_UNCONFIRMED'
  | 'EVIDENCE_SCOPE_MISSING' | 'APPLICABILITY_UNVERIFIED'
  | 'IMAGE_NOT_READ' | 'SOURCE_REF_UNVERIFIED' | 'CHECK_TARGET_INVALID'
  | 'CHECK_REASON_EMPTY' | 'RULE_NOT_EXECUTABLE' | 'VALIDATION_REJECTED'
export interface PiReviewRepairHint {
  kind: 'observation' | 'check'
  index: number
  code: PiReviewRepairCode
  nextAction: string
}
export interface PiReviewRepairGuide {
  rejectedCount: number
  pendingChecks: number
  hints: PiReviewRepairHint[]
  hiddenHints: number
  nextStep: string
}
interface RejectedEntry { kind: 'observation' | 'check'; index: number; reason: string }
const HELP: Readonly<Record<PiReviewRepairCode, string>> = {
  OBS_FIELD_NOT_DECLARED: '仅使用模板 FieldSpec 明确声明的 fieldKey；如果模板没有字段，请省略 observations，只提交合法 checks。',
  OBS_TYPE_OR_TARGET_MISMATCH: '按 FieldSpec 的 kind/scope/sectionId 和本案 subjectId 修正字段或对象，不得跨对象引用事实。',
  RULE_UNCONFIRMED: '当前规则未由有权人员确认；检查状态只能用 awaiting-confirmation，禁止直接给符合或不符合。',
  EVIDENCE_SCOPE_MISSING: '核对固定 D2 Plan 的 objectKey/subjectId/supportsFact，并由用户确认该对象的 EvidenceLink；不可拿另一对象材料替代。',
  APPLICABILITY_UNVERIFIED: '重新核对不可变 D2 Plan 的场景及三态条件；unknown 不能视为 not-applicable，不得自行改写适用性。',
  IMAGE_NOT_READ: '先调用本案允许的图像检查能力真正读取对应图像块，再使用返回的稳定定位及观察描述提交。',
  SOURCE_REF_UNVERIFIED: '重新读取当前有效文档的 blockId，并提交匹配原文的短引文；不要杜撰 documentVersionId、blockId 或 quote。',
  CHECK_TARGET_INVALID: '对照当前模板的 ruleId、目标范围和 subjectIds；逐主体规则一次只检查对应主体。',
  CHECK_REASON_EMPTY: '填写具体且能追溯到本案检查的简短理由，不得给出空字符串。',
  RULE_NOT_EXECUTABLE: '仅提交本案有效的 semantic 规则检查，确定性及不可执行规则由既有执行器处理。',
  VALIDATION_REJECTED: '依据原 rejected.reason 和本案规则/材料账本逐项校正；不得绕过 Main 校验或把失败当作通过。',
}
export function classifyPiReviewRepair(reason: string, kind: 'observation' | 'check'): PiReviewRepairCode {
  if (/模板没有字段|不存在的字段|fieldKey|未声明字段/.test(reason)) return 'OBS_FIELD_NOT_DECLARED'
  if (kind === 'observation' && /事实目标|字段.*(类型|分项|不适用)|类型是|文本|数值不一致|布尔字段|多选字段/.test(reason)) return 'OBS_TYPE_OR_TARGET_MISMATCH'
  if (/规则尚未确认|规则未确认|未确认.*(只能|不得|不能)/.test(reason)) return 'RULE_UNCONFIRMED'
  if (/EVIDENCE_SCOPE|EVIDENCE_LINK|EVIDENCE_FACT|SUBJECT_EVIDENCE|supportsFact|逐对象证据|跨主体.*证据|跨对象.*材料|证明关联/.test(reason)) return 'EVIDENCE_SCOPE_MISSING'
  if (/APPLICAB|SCENARIO|CONDITION|适用性|三态|unknown|未知条件|分支.*未确定/.test(reason)) return 'APPLICABILITY_UNVERIFIED'
  if (/图像出处尚未|图像.*未读取|图像块.*未读/.test(reason)) return 'IMAGE_NOT_READ'
  if (/文档版本|材料块|blockId|documentVersionId|引用|出处|引文|quote|读取.*材料|来源/.test(reason)) return 'SOURCE_REF_UNVERIFIED'
  if (/目标事项|主体|分项范围|规则分项|目标范围/.test(reason)) return 'CHECK_TARGET_INVALID'
  if (/理由不能为空/.test(reason)) return 'CHECK_REASON_EMPTY'
  if (/只能提交本案有效|只能提交.*语义|非 semantic|规则.*执行器/.test(reason)) return 'RULE_NOT_EXECUTABLE'
  return 'VALIDATION_REJECTED'
}
export function buildPiReviewRepairGuide(rejected: RejectedEntry[], missingChecks: string[], maxHints = 12): PiReviewRepairGuide {
  const limit = Math.min(24, Math.max(0, Number.isFinite(maxHints) ? Math.floor(maxHints) : 12))
  const hints = rejected.slice(0, limit).map(item => {
    const code = classifyPiReviewRepair(String(item.reason ?? ''), item.kind)
    return { kind: item.kind, index: item.index, code, nextAction: HELP[code] }
  })
  return {
    rejectedCount: rejected.length, pendingChecks: missingChecks.length, hints,
    hiddenHints: Math.max(0, rejected.length - hints.length),
    nextStep: rejected.length
      ? '先按 rejected[kind,index] 修复；不要重交已接受的检查，缺项按 missingChecks 继续，finish=false 允许分批补交。'
      : missingChecks.length
        ? '已有提交保留；按 missingChecks 补齐后，且没有 rejected，才能 finish=true。'
        : '当前没有拒绝或缺项；只有实际 Main 返回 completed 才算本轮完成。',
  }
}
export function formatPiReviewRepairGuide(rejected: RejectedEntry[], missingChecks: string[], limit = 12): string {
  const guide = buildPiReviewRepairGuide(rejected, missingChecks, limit)
  if (!guide.rejectedCount && !guide.pendingChecks) return ''
  return [
    `【最近一次提交的修复建议】拒绝=${guide.rejectedCount}，待补检查=${guide.pendingChecks}；建议不是放行依据，须重新通过 Main 校验。`,
    ...guide.hints.map(item => `- ${item.kind}[${item.index}] ${item.code}：${item.nextAction}`),
    ...(guide.hiddenHints ? [`- 另外 ${guide.hiddenHints} 条拒绝未在提示中展开，原 rejected 账本仍完整保留。`] : []),
    guide.nextStep,
  ].join('\n')
}
