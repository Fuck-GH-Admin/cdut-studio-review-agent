---
path: apps/electron/src/main/lib/review/material-lifecycle-v3.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 380ce364fefa7fda4ecabfd155a79b797b826898
sha256: 6fd08351b1cad467ca3ffa01eb3f49bc1ee399d988613c2862c602e227eea691
lines: 67
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/material-lifecycle-v3.test.ts

## 1. 测试目标

C1 native CaseAggregate 材料归档/回执（describe `:15`）：真实 typed 命令保留旧事实与回执、撤效来源、允许精确重放。被测：`archiveMaterialVersionV3`（`material-lifecycle-v3`）；协作 `application-service.{correctObservation,setEvidenceLink}`、`workspace-business-service-v2.isWorkspaceRunStaleV2`。夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/review-v3-archive-c1-<时间戳>`（`:10-12`）；`createAggregate` 造 V2 案卷（1 subject、1 文档 `d-v1` 带 `manualReadReceipt`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**1 test**（`:16-66`）：

1. 真实 typed 命令链：`correctObservation`（fact-4：declaredScore 4）→ `setEvidenceLink`（bind-old）→ `archiveMaterialVersionV3`（archive-old，reason“已替换原材料”）→ 断言；同 requestId 精确重放；新 requestId 再归档 → `INVALID_TRANSITION`；对已归档版本 `setEvidenceLink` → `STALE_INPUT`；`isWorkspaceRunStaleV2('legacy-run-rev')===true`。

## 3. 真实断言

- 归档后 `revision===3`、`documents[0].active===false`、**`manualReadReceipt.reason` 保留“核对原件”**（回执不丢）。
- 事实保留：`observations[0].value==={kind:'number',value:4}` 但 `confirmed===false`（撤效而非删除）。
- 关联级联：`evidenceLinks[0].status==='rejected'`；`sourceValidityRevocations[0].previouslyConfirmedObservationIds` 精确等于 `[observations[0].id]`。
- 回执链精确：`receiptLog.map(type)===['CorrectObservation','SetEvidenceLink','ArchiveMaterialVersion']`。
- 重放（同 requestId/expectedRevision=2）：`ok===true` 且 revision 仍 3（幂等不重复写）。
- 再归档（archive-again）：`ok===false`、`code==='INVALID_TRANSITION'`。
- 已失效版本重连证据：`badLink.code==='STALE_INPUT'`。
- 旧 run（`legacy-run-rev`）判 stale：`===true`。

## 4. 未覆盖与脆弱点

**未覆盖**：`archiveMaterialVersionV3` 的四门槛中“已关闭案卷/版本不存在/缺 reason”三个分支（仅覆盖“材料版本已归档”）；`authorizeAtCommit` 无注入；归档后 `usage` 保持原值（本用例未断言）。

**脆弱点**：断言依赖撤效算法（`revokeCurrentSourceValidity`）的 `previouslyConfirmedObservationIds` 字段名与数组顺序；回执链断言对命令 type 字符串敏感。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、1 test、真实聚合 | 已证实 | `:15/:16` |
| 归档保留字节/回执/历史，撤效级联 | 已证实 | `:43-51` |
| 精确重放幂等、二次归档拒 | 已证实 | `:52-59` |
| 失效来源重连拒 STALE_INPUT | 已证实 | `:60-64` |
| 其余门槛分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `archiveMaterialVersionV3` 成功路径 | #1 | `:40-51` | covered |
| 幂等重放 | #1 | `:52-55` | covered |
| 已归档拒绝 | #1 | `:56-59` | covered |
| archived 案卷/NOT_FOUND/缺 reason | — | — | unknown |
