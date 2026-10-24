---
path: apps/electron/src/renderer/components/content-review/ReviewHistoryPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fff9c1e3b49412e6c87c29f34fc11089b9935f0d
sha256: 3e7d45277bbf38bd868d6ebd6bd622a9f8408dd26d93c0ad07ab380ba106f0c5
lines: 216
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewHistoryPanel.tsx

## 1. 结论与边界

**审核历史面板**（`apps/electron/src/renderer/components/content-review/ReviewHistoryPanel.tsx`，216 行）：项目历史列表（V1/V2 双源合并），点击打开案卷。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewHistoryPanel` | 组件 | `:67-216` | `{active, onOpenProject}` |

内部：`toProjectMap`（`:37-66`，`ReviewCaseSummary[]`+V2 aggregates→`ProjectHistoryItem[]` 合并）。

## 3. 内部逻辑与关键流程

- 加载（`:76`）：`Promise.all([window.reviewAPI.listCases(), window.reviewAPI.listCasesV2()])`——V1+V2 双源合并（`toProjectMap`）。
- 展开项目（`:131-132`）：`Promise.all([listRuns(caseId), listRunsV2(caseId)])`——运行历史双源。
- `onOpenProject(caseId)` 打开案卷。

## 4. 调用者与调用链

- 消费方：审核首页（历史区）。
- 出向：`window.reviewAPI`（`listCases/listCasesV2/listRuns/listRunsV2`）。

## 5. 数据 I/O、读写与副作用

IPC 查询（4 个）；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 双源合并 | `:37-66` | `toProjectMap` 归并 |
| 加载失败 | — | 错误显示 |

## 7. 权限与权威状态

无身份语义；V1/V2 双源是历史兼容（V2 为准合并）。

## 8. 修改影响面

- 4 个 IPC 是契约；V1 退役需改双源。
- `toProjectMap` 合并口径影响历史显示。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、双源合并 | 已证实 | `:37-216` |
| 历史实际数据 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ReviewHistoryPanel` | `:67-216` | covered |
| `toProjectMap` | `:37-66` | covered |
