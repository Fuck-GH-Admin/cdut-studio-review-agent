---
path: apps/electron/src/renderer/components/content-review/ObservationConfirmPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e82fa3c9fff8a0d6763a0ef47960703c8ae44aa
sha256: 503d679fccfdde10e518e78a9d368636be6e1abccf0303d9e9b23caf9d80921d
lines: 122
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ObservationConfirmPanel.tsx

## 1. 结论与边界

**AI 抽取人工确认面板**（`apps/electron/src/renderer/components/content-review/ObservationConfirmPanel.tsx:1-6`，阶段 B `correctObservation` 接 UI）：展示最近运行的 extract 产物观察（真实模型抽取，含引用与置信度）；未确认条目可「确认无误」（原值落 `confirmed=true` 的 user 记录）或「更正」（新值+理由，原值进 `supersedes` 链——A05/U02）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ObservationConfirmPanel` | 组件 | `:23-122` | `{caseId, aggregate:{caseV2:{revision}}, onResult, refreshNonce}` |

## 3. 内部逻辑与关键流程

- 加载（`:31`）：`window.reviewAPI.getRunObservationsV2(caseId)`。
- 「确认无误」（`:44`）：`correctObservationV2({…, confirmed:true})`——原值确认。
- 「更正」（`:63`）：`correctObservationV2({…, 新值+理由})`——原值进 `supersedes` 链。
- 置信度展示（`:97`，`confidence*100%`）；`onResult` 回传 `ReviewCommandResult`；`refreshNonce` 刷新。

## 4. 调用者与调用链

- 消费方：案卷工作台（观察确认区）。
- 出向：`window.reviewAPI.getRunObservationsV2`/`correctObservationV2`（IPC）。

## 5. 数据 I/O、读写与副作用

IPC 查询/更正观察（主进程落 `supersedes` 链）；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无观察 | — | 空态 |
| 确认/更正 | `:44`、`:63` | 分别走 `correctObservationV2` |

## 7. 权限与权威状态

人工确认是**权威标注**（`confirmed=true` user 记录）；更正走 `supersedes` 链保留原值（A05/U02 溯源语义）。

## 8. 修改影响面

- `correctObservationV2` 参数契约（confirmed/supersedes）。
- A05/U02 溯源链语义与主进程存储耦合。

## 9. 测试证据

无专属测试（全树检索 `ObservationConfirmPanel` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、确认/更正双路径 | 已证实 | `:23-122` |
| supersedes 语义 | 已证实（注释） | `:5-6` |
| 主进程链实现 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ObservationConfirmPanel` | `:23-122` | covered |
| 确认/更正链 | `:31-70` | covered |
