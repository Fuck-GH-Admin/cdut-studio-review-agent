---
path: apps/electron/src/renderer/components/content-review/review-workspace-view-model.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1bc50ea0401aad5f4a0a1bc03ec4235e9fa4d1f6
sha256: 1c8bb6a7cb46479f7ca78e44175116d451be2e2cd9a14f697f65cc95076d0305
lines: 244
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-workspace-view-model.ts

## 1. 结论与边界

**审核工作台视图模型**（`apps/electron/src/renderer/components/content-review/review-workspace-view-model.ts`，244 行）：待办动作/就绪评估纯投影（`assessDecisionReadiness`/`isDecisionRelevantObservation` 自 `@profer/shared`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewWorkspacePendingAction` | interface | `:5-17` | `{key, kind(check/fact/evidence/material/material-slot/supplement/adjudication), title, detail, checkId?…}` |
| `ReviewWorkspaceViewModel` | interface | `:18-38` | 视图模型 |
| `buildReviewWorkspaceViewModel` | 函数 | `:39-244` | 构造视图模型 |

## 3. 内部逻辑与关键流程

`buildReviewWorkspaceViewModel`（`:39-244`）：aggregate+run→pending actions（7 类）+决策就绪（`assessDecisionReadiness`）；`isDecisionRelevantObservation` 过滤。

## 4. 调用者与调用链

- 消费方：审核工作台。
- 出向：`@profer/shared`（就绪评估）。

## 5. 数据 I/O、读写与副作用

纯投影；无写。

## 6. 分支、失败、取消与恢复

pending 分类（7 kind）。

## 7. 权限与权威状态

纯视图模型（`@profer/shared` 就绪评估权威）。

## 8. 修改影响面

`ReviewWorkspacePendingAction.kind` 7 类；就绪口径。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、7 类 pending | 已证实 | `:5-244` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:5-244` | covered |
