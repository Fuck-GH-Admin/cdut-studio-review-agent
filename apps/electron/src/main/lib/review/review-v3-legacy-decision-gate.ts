/**
 * Legacy V2 decision writers must not alter native V3 business authority.
 *
 * The native creation receipt is an ownership marker, not a validity check:
 * even if a later material/Subject projection is malformed, legacy writers
 * must fail closed rather than treating that Case as an ordinary V2 Case.
 * Historical V2 cases without a native marker remain on their legacy route.
 */
import type { CaseAggregateV2 } from '@profer/shared'
import { CommandValidationError } from './case-store-v2'

export function assertLegacyDecisionWritable(aggregate: CaseAggregateV2): void {
  if (aggregate.receiptLog?.some((receipt) => receipt?.type === 'CreateNativeWorkspaceCaseV3')) {
    throw new CommandValidationError('INVALID_TRANSITION',
      '原生 V3 案卷只能通过可信 T05/F13 决定入口更改结论，旧 V2 决定入口只读')
  }
  if (aggregate.d2RuntimePlan || aggregate.canonicalPlan) {
    throw new CommandValidationError('AGENT_DECISION_DISABLED',
      '冻结计划或 D2 技术预审案卷不得通过旧 V2 入口生成业务决定')
  }
}
