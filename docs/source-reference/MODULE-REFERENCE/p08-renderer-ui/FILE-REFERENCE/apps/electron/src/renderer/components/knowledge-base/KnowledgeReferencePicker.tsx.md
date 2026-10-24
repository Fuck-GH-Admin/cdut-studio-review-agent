---
path: apps/electron/src/renderer/components/knowledge-base/KnowledgeReferencePicker.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 478fbb82ee2861652814f65aacc94dd06b4e2e98
sha256: 9f47f25ff47f1117fca15e3cc92662b38a4d579876c89bceea99661fe3ad4159
lines: 45
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/knowledge-base/KnowledgeReferencePicker.tsx

## 1. 结论与边界

轻量资料选择器（渲染层运行时）：可复用于 Chat 与 Agent，勾选 1–10 份资料后 `onConfirm(itemIds)`；不包含删除等管理副作用（文件头 `apps/electron/src/renderer/components/knowledge-base/KnowledgeReferencePicker.tsx:16`）。导入的是轻量引用（Dialog 文案 `:44`）。

边界：不拉正文（只列目录快照）；不写库（onConfirm 交给调用方）；类型标签映射独立于 `KnowledgePreviewPanel` 的 kindLabel（两份重复映射，照实记录）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `KnowledgeReferencePicker` | 函数/组件（导出） | 17-45 | `({open, onOpenChange, onConfirm}) => React.ReactElement` | 选择器 |

内部：`Props`（`:8-12`）、`KIND_LABEL`（`:14`，kind→标签）。

## 3. 内部逻辑与关键流程

1. 打开 effect（`:23-30`）：清选择→`knowledge.getLibrarySnapshot()` 列资料（失败置空列表 `:28`）→ loading 结束。
2. `toggle`（`:32-37`）：Set 增删，**上限 10**（`next.size < 10` 才 add，`:35`）。
3. `submit`（`:38-42`）：空选不动；`saving` 期间禁用；`await onConfirm([...selected])` 后关闭（失败由 onConfirm 抛错冒泡，finally 清 saving，`:41`）。
4. 渲染（单行 JSX `:44`）：已选计数「N/10」、条目按钮（checkbox/FileText/标题/kind 标签，`getItemKind(item)` 查 `KIND_LABEL`）、空态文案、取消/导入按钮（导入禁用条件 `!selected.size || saving`）。

## 4. 调用者与调用链

入向（全树检索，证实）：**无任何导入/渲染点**——`KnowledgeReferencePicker` 全树仅命中本文件（`:17` 定义）。孤儿组件（推断：Chat/Agent 资料引用入口被裁剪或预留）。

出向：`./knowledge-base-workbench-utils`（`getItemKind`，`:5,44`）、`@profer/shared` `KnowledgeItem`（`:4`）、`window.electronAPI.knowledge.getLibrarySnapshot`（`:26`）、`@profer/ui` Dialog/Button 图标。

## 5. 数据 I/O、读写与副作用

- IPC 读（目录快照）；回调 `onConfirm`（写操作在调用方，本文件无写）。
- 副作用：无。并发/幂等：`saving` 防重入（`:21,41`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 快照失败 | getLibrarySnapshot reject | 28 |
| 选择上限 | size≥10 | 35 |
| 空选不提交 | submit 首行 | 39 |
| onConfirm 抛错 | 冒泡 | 41（finally 清 saving） |

无恢复概念，依据：一次性选择流程。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；资料权威=knowledge IPC。

## 8. 修改影响面

无调用方（§4）；若接入，`onConfirm` 契约（string[]）与 10 份上限是修改面。`KIND_LABEL` 与 `KnowledgePreviewPanel.kindLabel` 双份映射需同步。需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索本组件 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实选择导入。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 三动作流程 | 已证实 | `:17-45` 逐行读 |
| 选择上限 10 | 已证实 | `:35` |
| 无调用者（孤儿组件） | 已证实 | 全树检索（§4 范围） |
| KIND_LABEL 双份重复 | 已证实 | `:14` vs `KnowledgePreviewPanel.tsx:13` |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `KnowledgeReferencePicker` | §2-3 | 17-45 | covered |
| toggle/submit/上限 | §3, §6 | 32-42 | covered |
| 调用链（无） | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
