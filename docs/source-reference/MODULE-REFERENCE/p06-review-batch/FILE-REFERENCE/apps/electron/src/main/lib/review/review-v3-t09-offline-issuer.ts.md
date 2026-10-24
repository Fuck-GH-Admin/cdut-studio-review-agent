---
path: apps/electron/src/main/lib/review/review-v3-t09-offline-issuer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5e65f750e181f2351ddf043a1b56977dc3d85ca9
sha256: db87e32dc8c1e5c37df5061fa5ede13cb787ba7b448eb9bd48a8575d31841526
lines: 68
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-offline-issuer.ts

## 1. 结论与边界

T09 签发适配器（文件头 `:1-4`）：复用 V2/V3 聚合做只读权威，不另建 CaseStore、不允许文件签发业务决定。两个签发入口把真实案卷状态转成 `T09TaskPackage`：学生补件包（只导出目标请求）与评委评分包（默认零申请人字段/原件，匿名展示）。纯函数（除 `createHash`）。

不做的事：不写状态；不打包语义校验（`offline-codec.issueT09Task`）；不做投影过滤细节（`offline-roundtrip.projectForRole`）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `issueT09StudentFromCase` | `:19-37` | `(aggregate, recipientId, supplementId, fieldVisibility, policyVersionIds=[]) => T09TaskPackage` |
| `issueT09JudgeFromCase` | `:44-68` | `(aggregate, assignment, rubric, policyVersionIds=[], reviewedAnonymousAssets=[], scoringBinding?) => T09TaskPackage` |

内部：`lockOf`（`:10-16`，`{templateId, templateVersion, policyVersionIds}`）。

## 3. 内部逻辑与关键流程

### 3.1 学生包（`:19-37`）

- `supplementId` 必须命中 aggregate 的补件且 `status ∈ {open, insufficient}`（“补件请求不处于可回复状态”）（`:26-27`）；`responsibleRole==='student'`（“不是学生应答的补件任务”）（`:28`）。
- `projectForRole(aggregate,'student',fieldVisibility,recipientId)` 产出受众过滤投影（`:29`）。
- `issueT09Task`：task `student-reply`（supplementId/reason/requiredElements/deadline）、recipient `{student, recipientId, local}`、publicContext `{title: projection.title, fields: projection.fields}`（`:30-36`）。

### 3.2 评委包（`:44-68`）

- 分配校验：`assignment.caseId` 匹配、非回避、`status==='assigned'`（“没有有效的可评分分配”）；`reviewerId` 非空（“评委未指定”）（`:52-53`）。
- 匿名标签 `匿名案卷#` + sha256(`assignment.id|caseId`) 前 10 位（`:55`）——案卷身份绑定在私有包契约，展示匿名。
- task `judge-rating-reply`（assignmentId/rubricVersion/dimensions 来自 rubric：id/name/min/max/allowNA=!!naWhen）；带 `scoringBinding` 时注入 `batchId/round/caseRevision`（新版 T07 评分回件绑定）且包 `baseRevision` 用 `scoringBinding.revision`（`:57-62`）。
- `publicContext: {title: anonymousLabel, fields: {}}`（零申请人字段）；`assets=reviewedAnonymousAssets`（只带 T07 独立审阅过的匿名材料；无法匿名则不带，`:39-42` 注释）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`issueT09StudentFromCase`/`issueT09JudgeFromCase` 由 `review-v3-t09-main-service` 与 `review-ipc` 的 T09 导出流程调用。出向：`offline-roundtrip.projectForRole`（`:7`）、`review-v3-t09-offline-codec.issueT09Task`（`:8`）、`node:crypto`。

## 5. 数据 I/O、读写与副作用

无 I/O；输出新包对象（含随机 packageId/actionId）。幂等性不含 id（每次签发 id 不同，内容 hash 不同）。

## 6. 分支、失败、取消与恢复

两处 throw（补件状态/角色、分配有效性/评委缺失）；其余由 `issueT09Task` 校验兜底。无取消/恢复。

## 7. 权限与权威状态

聚合是**只读权威**（不另建 CaseStore，文件头）；学生包仅导出目标补件请求（`:18` 注释）；评委包默认零原始字段/原件、匿名展示、评分绑定可锁批次/轮次/案卷版本（`:39-42`、`:55-62`）。

## 8. 修改影响面

改包内容 → 影响离线往返（codec hash 契约）与 T09 main-service 导出；`projectForRole` 可见性契约联动 `fieldVisibility`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t09-judge-adapter.test.ts`/`review-v3-t09-main-service.test.ts` 间接覆盖（详见各手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只读权威、不发业务决定 | 已证实 | 文件头 `:1-4` |
| 学生包仅目标请求+受众投影 | 已证实 | `:18/:26-36` |
| 评委包匿名+零字段+可选评分绑定 | 已证实 | `:52-67` |
| 调用面（main-service/IPC） | 已证实 | 检索 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `lockOf` | 2 | `:10-16` | covered |
| `issueT09StudentFromCase` | 3.1 | `:19-37` | covered |
| `issueT09JudgeFromCase` | 3.2 | `:44-68` | covered |
