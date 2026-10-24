---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/sidebar-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 29214c8f51306f37b991d089803feae5b94857ce
sha256: f9b9317ba9e13c41034eb473ae261fad4941c7124f8b8fc41b8ceac0df75f5cd
lines: 123
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/sidebar-utils.ts

## 1. 结论与边界

侧边栏纯函数工具（文件头 `:1-6`）：零依赖纯函数——计数格式化、项目排序、日期分组、相对时间、rail 首字母、Set 不可变操作、列表渐进切片。**不依赖 React/atom**（仅类型 import `WorkspaceSortMode`）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `formatAutomationCount` | `:10-12` | >99 显 `'99+'` |
| `WORKSPACE_SORT_ORDER` | `:15` | default→recent→name 循环 |
| `WORKSPACE_SORT_LABEL` | `:18-22` | 中文标签（默认/最近/名称） |
| `workspaceNameCollator` | `:25-28` | `Intl.Collator('zh-Hans-CN', {numeric, sensitivity:'base'})`（拼音/数值/忽略大小写） |
| `getNextWorkspaceSortMode` | `:31-34` | 循环取下一档 |
| `DateGroup` | `:37` | `'今天'\|'昨天'\|'更早'` |
| `formatRelativeUpdatedAt` | `:39-53` | 刚刚/N 分钟/N 小时/N 天/N 月/N 年（diff 负值钳 0） |
| `groupByDate` | `:56-80` | 按今天 0 点/昨天 0 点分三组（空组不输出） |
| `getRailInitial` | `:82-84` | 首字母大写，空→`'·'` |
| `toggleSetEntry`/`deleteSetEntry` | `:87-103` | 不可变 Set 切换/删除（不存在返回原引用） |
| `sliceGroupsByCount` | `:109-123` | 按累计条数切组（渐进渲染防卡顿，`:105-108`） |

## 3. 内部逻辑与关键流程

均为纯函数；`groupByDate` 用本机时区今天 0 点；`sliceGroupsByCount` 部分切组时 `{...group, items: slice}` 保组元数据。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`left-sidebar/` 各组件与 `use-left-sidebar`。出向：仅类型 `@/atoms/sidebar-atoms`。

## 5. 数据 I/O、读写与副作用

无（`Intl.Collator` 构造于模块级）。

## 6. 分支、失败、取消与恢复

时间分档/分组边界分支（`:47-52/:66-72`）；其余无。

## 7. 权限与权威状态

无权限语义；渐进切片是防卡顿口径（非完整性语义）。

## 8. 修改影响面

改格式化/分组 → 影响侧边栏列表呈现。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试（session-tree.test 覆盖树工具，非本文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 零依赖纯函数 | 已证实 | 文件头、全文件 |
| 渐进切片语义 | 已证实 | `:105-123` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | 2/3 | `:10-123` | covered |
