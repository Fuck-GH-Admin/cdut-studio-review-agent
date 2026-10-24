---
path: apps/electron/src/main/lib/review/review-execution-event-adapter-completeness.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e15f14d2d1bc145acec8325d43e9e6276ead802
sha256: 7ea9eba1db3f68e6d8d3de565d80cc8f172124258aa961b09b27f9b6c8dd1ac5
lines: 125
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-execution-event-adapter-completeness.ts

## 1. 结论与边界

Dev-A **瞬时确定性覆盖投影**（`V3ExecutionCompletenessAdapter`）：为 direct/hidden/Graph/batch 执行路径统计「技术完成度」；**不能**提交 ReviewRun/Check/业务通过（`apps/electron/src/main/lib/review/review-execution-event-adapter-completeness.ts:1-5`）。Host 接受的 receipt 是输入，**绝不**采信 Pi 文本自称 "completed"（`:4-5`）。

边界：进程内存态（无持久化）；`arithmeticDifference` 是独立算术诊断，不让模型推断差值（`:119`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A3CheckStatus` | type | 11 | `'accepted'\|'rejected'\|'missing'\|'unknown'` | |
| `A3TechnicalState` | type | 12-14 | `'technically-complete'\|'partial'\|'needs-resume'\|'cancelled'\|'timed-out'\|'failed'` | |
| `A3CheckObservation` | interface | 15-23 | `{checkKey;targetKey;objectKey;subjectId;status;hostReceiptId?}` | 注释：只收 Host receipt 非自由文本（`:21-22`） |
| `A3TechnicalSnapshot` | interface | 24-33 | `{state;accepted[];rejected[];missing[];unknown[];totalRequired;usedTurns;maxTurns}` | |
| `V3ExecutionCompletenessAdapter` | class | 37-117 | 构造 `(plan:CanonicalPlan, run:RunEvidenceIdentity, maxTurns=24)`；`recordHostOutcome/recordTurn/markFailure/snapshot` | |
| `arithmeticDifference` | function | 120-125 | `(expected, observed) => number` | 2 位小数（`Math.round(×100)/100`） |

内部：`tuple`（`:34-35`，四元组 JSON 键）。

## 3. 内部逻辑与关键流程

- 构造（`:43-65`）：`assertC0CanonicalPlan`+`assertC0RunEvidenceIdentity`；maxTurns 安全整数≥1、`plan.fingerprint===run.planFingerprint`、双向 checkKeys 覆盖、bindings 的 sourceVersionIds ⊆ run.sourceVersionIds（不齐 → `RUN_IDENTITY_MISMATCH`，`:52`）；期望表=非 `not-applicable` 绑定（重复四元 → `CONTRACT_INVALID`，`:57-59`）；期望为空 → `CONTRACT_INVALID`（`No eligible checks`，`:62-64`）。
- `recordHostOutcome`（`:68-84`）：failure 后拒；未知四元拒；**`accepted` 要求适用性非 unknown 且带 hostReceiptId**（`:75-78`）；已 accepted 不可被迟到/拒绝输出降级（`:79-82`）。
- `recordTurn`（`:85-88`）：failure 后拒。
- `markFailure`（`:89-91`）：置 `cancelled/timed-out/failed`。
- `snapshot`（`:92-116`）：逐期望取观测（无观测 → unknown/missing 按适用性，`:98-99`）；`covered = accepted===期望总数`；state = failure ?? (covered ? 'technically-complete' : usedTurns>=maxTurns ? 'needs-resume' : 'partial')。
- `arithmeticDifference`（`:120-125`）：非有限输入 → `CONTRACT_INVALID`；返回 2 位小数差。

## 4. 调用者与调用链

出向：`@profer/shared`（C0 断言/错误/类型，`:6-9`）。

入向（检索=符号名+模块名，全冻结树）：

- `V3ExecutionCompletenessAdapter`：`apps/electron/src/main/lib/review/review-v3-execution-proposal-producer.ts:18,196`（`new V3ExecutionCompletenessAdapter(plan,run)`，A 链提案生产者的覆盖投影）。
- `arithmeticDifference`/`A3CheckObservation`/`A3TechnicalSnapshot`：仅本文件与上述使用点（`arithmeticDifference` grep 全树仅定义行——零调用）。
- 测试：无同名 .test.ts；批外 A 链测试间接覆盖。

## 5. 数据 I/O、读写与副作用

无 I/O；内存 Map 状态；抛 `C0ContractError`。

## 6. 分支、失败、取消与恢复

失败=throw（`RUN_IDENTITY_MISMATCH`/`CONTRACT_INVALID`）。`markFailure` 即取消/超时/失败的受控标记（此后 record* 全拒，`:69,86`）。

## 7. 权限与权威状态

无权限分支（授权在调用方 proposal-producer）。权威否定（`:1-5,21`）：不能提交业务通过；`hostReceiptId` 是接受的必要条件（`:75-78`）。

## 8. 修改影响面

构造校验/expected 口径影响 `review-v3-execution-proposal-producer.ts:196` 的覆盖统计与 A22 信封的 technicalEvents。maxTurns 默认 24（`:44`）语义随 sequence driver 的 turn 预算。

## 9. 测试证据

本批**无**直接测试。间接：批外 A 链测试经 proposal-producer 覆盖。**NOT_RUN**。缺口：`arithmeticDifference` 零调用零测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| accepted 必须带 hostReceiptId 且非 unknown 适用性 | 已证实 | `:75-78` |
| accepted 不可降级 | 已证实 | `:79-82` |
| state 六值推导 | 已证实 | `:107-110` |
| `arithmeticDifference` 零调用 | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| proposal-producer 消费形态 | 推断 | `:196` 一行可见 |
| 真实 run 分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 11-125 | covered |
| 构造校验 | §3 | 43-65 | covered |
| record/snapshot | §3 | 68-116 | covered |
| `arithmeticDifference` | §2, §3 | 120-125 | covered（零调用） |
