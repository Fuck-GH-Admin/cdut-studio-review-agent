---
path: packages/shared/src/types/review-v3-run.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dabf7ba8a843a194aee7ab9114fddee1bf79fcd6
sha256: 61d10ad6fc271aeb83a3952bcf3daabc1d76b14596d4b244042416afcaa9868e
lines: 63
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v3-run.ts

## 1. 结论与边界

**C2/1 — 不可变、CASE-LOCAL、C Main 拥有的 Run 证据快照**（`review-v3-run.ts:1-9` 注释）：纯声明。红线：这是真实持久 Run 历史对象，**不是** A/I 技术 ACK；技术 Check 态不是正式政策裁定/成绩/决定/授权/学校结果（`:4-6`）；`review-v3-execution/1` 提案传输独立冻结（`:8`）。

## 2. 导出与关键符号（5 条）

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `REVIEW_V3_RUN_SCHEMA` | const（export） | `:13` | `'review-v3-run/1'` | schema 标识 |
| `V3RunEvidenceState` | type（export） | `:16` | `'requires-human-review'\|'incomplete'\|'interrupted'` | **无隐含 pass**（`:15` 注释） |
| `V3RunBoundCheck` | interface（export） | `:18-27` | `{ binding: PlanBinding; technicalStatus: V3CheckStatus\|null; eventId?; hostReceiptId?; sequence?; decisionEligible: false }` | `technicalStatus=null` 表示 Host 从未产 verified 事件（`:20-21`）；`decisionEligible` 恒 false（`:25-26`） |
| `V3RunReadEvidence` | interface（export） | `:29-35` | `{ eventId; hostReceiptId; sequence; source; extent }` | 读证据 |
| `ReviewRunRecordV3` | interface（export） | `:37-63` | `{ schemaVersion; run; plan: CanonicalPlan; inputDigest; eventChainDigest; terminalEventId; terminal: V3TechnicalTerminal; state; boundChecks[]; readEvidence[]; coverage{totalBindings,observedBindings,unobservedBindings,blockedApplicability}; sealedAt; sealedByActorId; formalDecisionId?: never; schoolAckId?: never }` | 封存快照；两个 `?: never` 锁死"技术完成≠业务批准"（`:61-62`） |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）；`coverage` 计数四元组（`:52-57`）与 `eventChainDigest`（`:45`，SHA-256 事件链）表达完整性账目。

## 4. 调用者与调用链

- 出向：`./review-v3-c0`（`CanonicalPlan/PlanBinding/RunEvidenceIdentity/SourceIdentity`，`:10`）、`./review-v3-execution`（`V3CheckStatus/V3TechnicalTerminal`，`:11`）——均本批同组。
- 入向：经 `@profer/shared` barrel（C Main Run 持久化，跨批实现未读）。

## 5. 数据 I/O、读写与副作用

无（声明文件）；持久化语义（durable Run history，`:2`）由 C Main 实现承担。

## 6. 分支、失败、取消与恢复

不适用（纯类型）；`state:'interrupted'`/`terminal:'needs-resume'` 携带中断/恢复语义（实现方职责）。

## 7. 权限与权威状态

**核心红线**：无隐含 pass（`:15`）、`decisionEligible:false` 恒定（`:26`）、`formalDecisionId?:never`/`schoolAckId?:never`（`:61-62`）——仅人/政策授权的决定可裁定（`:15`）。

## 8. 修改影响面

改形状 → C Main Run 持久化/封存链路与 `review-v3-c0.ts` 引用；动 `?: never` 或 `decisionEligible` 等于拆权威边界。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewRunRecordV3|V3RunEvidenceState` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+权威红线字段 | 已证实 | 逐行读 `:1-63` |
| 封存/校验实现遵守边界 | 未知 | C Main 实现（跨批）未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | `:13-63` | covered |
| 权威红线 | §7 | `:15/:21/:26/:61-62` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
