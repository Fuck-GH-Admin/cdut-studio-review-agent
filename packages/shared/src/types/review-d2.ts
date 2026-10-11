/**
 * D2 作者态条件/业务对象 → 现有 Pi RuleSpec 的技术预审运行契约。
 * 仅证明执行范围与出处；不构成学校制度授权或最终审批。
 */
import type { ReviewSubject, RuleSpec } from './review-v2'

export type D2TargetKind = 'campus-card' | 'archive-item' | 'archive-operation'

/** 同一档案件每个操作必须拥有独立 objectKey/subjectId。 */
export interface D2TargetBinding {
  objectKey: string
  subjectId: string
  title: string
  kind: D2TargetKind
  scenario?: string
  itemId?: string
  operation?: 'read' | 'copy' | 'excerpt' | 'borrow' | 'certified_copy'
  /** Optional stable per-request operation identity; disambiguates same-kind operations. */
  operationId?: string
}
export interface D2ScenarioSelection {
  templateId: string
  version: number
  /** 有情景的模板必须显式选择，不得把未知默认为 false。 */
  scenario?: string
  /** 仅供校园卡等「模块实例无 objectKey」的分支对象绑定。 */
  scenarioObjectKey?: string
  targets: D2TargetBinding[]
}
export interface D2RuleBinding {
  checkId: string
  ruleId: string
  objectKey?: string
  subjectId?: string
  sourceIds: string[]
  /** 记录制度候选/跨校参考尚未获本案授权；Pi 只能返回待确认。 */
  authority: 'request-scope' | 'unverified-policy'
  /** Structured execution gate; never inferred from task prose. */
  gate?: D2ExecutionGateV1
}
/** Three-valued, fail-closed checks over confirmed human evidence/observations. */
export type D2GatePredicateV1 =
  | { kind: 'confirmed-observation'; fieldKey: string; equals: string }
  | { kind: 'evidence-any'; supportsFacts: string[] }
  | { kind: 'case-stage'; stages: import('./review-v2').CaseStage[] }
export type D2GateExpressionV1 =
  | D2GatePredicateV1
  | { kind: 'all'; conditions: D2GateExpressionV1[] }
  | { kind: 'any'; conditions: D2GateExpressionV1[] }
  | { kind: 'not'; condition: D2GateExpressionV1 }
/** Applicant material cannot be labelled missing before a verified trigger and due stage. */
export interface D2ExecutionGateV1 {
  when?: D2GateExpressionV1
  material?: {
    provider: 'applicant' | 'authority'
    dueStages: import('./review-v2').CaseStage[]
    /** Alternative accepted fact labels, linked by a reviewer to THIS check's target. */
    alternatives: string[]
  }
}
export interface D2RuntimePlan {
  schemaVersion: 1
  mode: 'technical-pre-review'
  publicationAllowed: false
  workspaceId: string
  revision: number
  templateId: string
  templateVersion: number
  scenario?: string
  authoringDigest: string
  previewFingerprint: string
  targets: D2TargetBinding[]
  subjects: ReviewSubject[]
  rules: RuleSpec[]
  mapping: D2RuleBinding[]
  /** 覆盖作者态、选择的情景、对象边界、RuleSpec 内容及来源绑定。 */
  fingerprint: string
}
