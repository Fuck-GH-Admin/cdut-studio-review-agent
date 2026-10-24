---
path: apps/electron/src/renderer/components/content-review/CaseTimelinePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 966231d88f967ae74e1cf2bd2b38cefc37ebf7b8
sha256: a7efd0b04f33853c0a51784c542b8a20acd88f236455693ad2edcb6037eb15d9
lines: 80
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/CaseTimelinePanel.tsx

## 1. 结论与边界

**案卷时间线面板**（`apps/electron/src/renderer/components/content-review/CaseTimelinePanel.tsx:1-6`）：倒序条目+操作者徽标（人工蓝/AI 紫/模拟灰/校方绿/未记录灰斜体）；`runNonce` 变化即刷新（Agent 写后 `applyResult→+1`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CaseTimelinePanel` | 组件 | `:41-80` | `{caseId, refreshNonce}` |

内部：`TimelineRow`（`:9-15`，`operatorKind: human/agent/mock/school/system/unknown`）、`BADGE_STYLE`（`:17-24`）、`BADGE_TEXT`（`:26-33`）、`FILTERS`（`:35-39`，全部/AI Agent/人工）。

## 3. 内部逻辑与关键流程

- `load`（`:45-52`）：`window.reviewAPI.getCaseTimelineV2({caseId, filterOperator})`（`:47`）；失败 `console.error` 不抛。
- `useEffect` 绑 `[load, refreshNonce]`（`:54`）——`refreshNonce` 变化重载。
- 空态「尚无时间线记录」（`:56-58`）；过滤器切换重查（`filterOperator` 传主进程过滤）。

## 4. 调用者与调用链

- 消费方：案卷详情（时间线区）。
- 出向：`window.reviewAPI.getCaseTimelineV2`（IPC）。

## 5. 数据 I/O、读写与副作用

IPC 查询时间线；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 加载失败 | `:49-51` | console.error 静默 |
| 空列表 | `:56-58` | 空态 |

## 7. 权限与权威状态

`operatorKind` 六态如实标注操作来源（`:9-15`、`:26-33`）——含 `unknown`（旧版记录未记录）不伪造。

## 8. 修改影响面

- `operatorKind` 集合与主进程时间线数据耦合。
- `refreshNonce` 协议（applyResult +1）与 Agent 写链耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、六态徽标/过滤/刷新 | 已证实 | `:9-80` |
| 时间线实际数据 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CaseTimelinePanel` | `:41-80` | covered |
| 徽标/过滤表 | `:9-39` | covered |
