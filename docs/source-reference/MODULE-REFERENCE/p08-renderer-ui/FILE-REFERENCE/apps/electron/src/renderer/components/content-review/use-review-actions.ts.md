---
path: apps/electron/src/renderer/components/content-review/use-review-actions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 90280719b5de638e9f0cf6c100fc9bef75155d1b
sha256: 498f98097ecee7e0abb644ff589d7238d6517db4755a01c3a3bda1fcf7a60e66
lines: 49
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/use-review-actions.ts

## 1. 结论与边界

**审核动作 Hook**（`apps/electron/src/renderer/components/content-review/use-review-actions.ts:1`）：**审核动作仅调用 Main 业务入口；页面轮询负责显示，不持有 Pi 执行生命周期**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewActions` | type | `:8` | `ReturnType<typeof createReviewActionsController>` |
| `CreateCaseInput` | re-export | `:9` | 控制器类型 |
| `REVIEW_DOCUMENT_ROLE_LABELS` | re-export | `:10` | 角色标签 |
| `useReviewActions` | hook | `:12-49` | 主 Hook |

## 3. 内部逻辑与关键流程

- `startPiReview`（`:15-21`）：`startBackgroundPiReviewV2`→receipt.runId 校验→`getRunV2`（无 run 抛「审核记录不存在」）。
- `actions = createReviewActionsController(store, window.reviewAPI, startPiReview)`（`:22`）。
- **轮询**（`:24-47`）：`refreshBackgroundReview`；running/preparing 1.5s、否则 5s（`:39`）；**空闲页同样允许发现另一窗口的启动**（`:38`）；错误按案隔离（切走不污染）；卸载 `invalidateRefresh`（`:45`）。

## 4. 调用者与调用链

- 消费方：content-review 组件（actions）。
- 出向：`review-actions-controller`、`window.reviewAPI`、Jotai atoms。

## 5. 数据 I/O、读写与副作用

IPC（startBackgroundPiReviewV2/getRunV2/refreshBackgroundReview）；定时器轮询。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| receipt 无 runId | `:17` | 抛「审核未取得有效运行记录」 |
| 无 run | `:19` | 抛「审核记录不存在」 |
| 轮询错误 | `:32-34` | 按案错误显示（切走不污染） |
| 卸载 | `:42-46` | disposed+清定时器+invalidateRefresh |

## 7. 权限与权威状态

**仅调 Main 业务入口**（`:1`）；页面不持有 Pi 生命周期（`:1`）。

## 8. 修改影响面

- 轮询节奏（1.5s/5s）；`createReviewActionsController` 合同。

## 9. 测试证据

`review-workspace-write-fence.p06-fix02.test.ts` 间接（双 Hook 共享）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出、轮询/不持有生命周期 | 已证实 | `:1-49` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:8-49` | covered |
