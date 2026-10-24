---
path: apps/electron/src/renderer/components/content-review/review-v3-f12-supplement-cycle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7847438a8f7c5f50e2264e4ebc19b658c8d72052
sha256: 88d843a67813a4f10f988f845170fa3e420c43a97e09cd1db52ee02ca2a32961
lines: 80
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-f12-supplement-cycle.ts

## 1. 结论与边界

**F12 补件周期只读投影**（`apps/electron/src/renderer/components/content-review/review-v3-f12-supplement-cycle.ts:1-4`）：合并重复补正要素展示，**不合并/改写原始补件事务**；判定以 `CaseAggregateV2` 为准，不生成身份/Run/业务决定。

## 2. 导出与关键符号

`export` 共 **6 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F12_UNRESOLVED_STATUSES` | const | `:7-9` | `{open, responded, insufficient}` |
| `F12ChecklistItem` | interface | `:11-16` | 清单项（`unresolvedRequestIds` 注释：所有来源关闭才算结清，`:14`） |
| `F12SupplementCycle` | interface | `:18-28` | 周期视图（`readyForReview`/`stageStillAwaitingSupplement` 语义，`:24-27`） |
| `buildF12SupplementCycle` | 函数 | `:31-58` | 合并投影 |
| `getF12ReplyDocumentCandidates` | 函数 | `:67-80` | 回复材料候选（快照基线） |

内部：`F12DocumentCandidates`（`:60-64`）。

## 3. 内部逻辑与关键流程

- **`buildF12SupplementCycle`**（`:31-58`）：按 `createdAt` 排序；`F12_UNRESOLVED_STATUSES` 过滤未结清；`byElement` 按要素小写 key 收敛（`requestIds`/`unresolvedRequestIds` 分别保留，`:34-47`——**合并展示不合并事务**）；`awaitingReply`（非 responded）/`awaitingVerification`（responded）分流（`:51-52`）；`readyForReview`：**全关闭 + 阶段∈{reviewing,awaiting-review} + 至少一条 satisfied**（`:54-55`）；`stageStillAwaitingSupplement`：全关闭但 stage 仍是 `awaiting-supplement`（`:56`，不得自作主张跳转）。
- **`getF12ReplyDocumentCandidates`**（`:67-80`）：active 文档；有 `documentVersionIdsAtRequest` 基线→差集+`verifiedAsAddedAfterRequest:true`；**无基线→全量 active 但 `verifiedAsAddedAfterRequest:false`（禁止宣称新增，`:62`）**。

## 4. 调用者与调用链

- 消费方：F12 补件清单/回复面板。
- 出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯投影；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 空要素 | `:37-38` | 跳过 |
| 全关闭但无 satisfied | `:54-55` | `readyForReview:false` |
| 无基线快照 | `:72-74` | 全量+`verifiedAsAddedAfterRequest:false` |

## 7. 权限与权威状态

- `readyForReview` 注释（`:24`）：**请求全关闭≠审查通过**。
- `stageStillAwaitingSupplement`（`:26-27`）：唯一权威案卷仍等补件不得跳转。
- 快照基线缺失如实标注（`:62`）。

## 8. 修改影响面

- `F12_UNRESOLVED_STATUSES` 与 `SupplementRequest.status` 联合绑定。
- 要素合并 key（小写 trim）影响清单收敛。

## 9. 测试证据

`review-v3-f12-supplement-cycle.test.mjs`（55 行，4 用例，**node:test**）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个导出、合并/门控/快照三面 | 已证实 | `:7-80` |
| 不合并事务/不谎称新增红线 | 已证实 | `:2-3`、`:62` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 6 个导出 | `:7-80` | covered |
| 合并/门控 | `:31-58` | covered |
| 快照基线 | `:67-80` | covered |
