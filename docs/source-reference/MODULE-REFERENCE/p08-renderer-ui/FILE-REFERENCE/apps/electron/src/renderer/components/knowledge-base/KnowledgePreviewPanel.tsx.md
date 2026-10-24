---
path: apps/electron/src/renderer/components/knowledge-base/KnowledgePreviewPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fa2a9abc361df7058795a67394da0a6d48449801
sha256: 8098839d7764fb4e03ed1c0360f3eb33fa1a953dd9f614bc5cf773c01daa433b
lines: 49
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/knowledge-base/KnowledgePreviewPanel.tsx

## 1. 结论与边界

Chat 资料预览（渲染层运行时）：`openKnowledgePreview` 用 CustomEvent 派发预览请求，`KnowledgePreviewContent` 按 `KnowledgeReference` 拉取本地资料并渲染 Markdown 安全 HTML（文件头 `apps/electron/src/renderer/components/knowledge-base/KnowledgePreviewPanel.tsx:1-49`）。资料内容不成为 Agent 隐式输入（`:20` 注释）。

边界：不管理资料库（knowledge IPC）；Markdown 安全转换在 `markdown-rich-text`；不提供预览容器（事件监听方自装）。

## 2. 导出与关键符号

`export` 逐条核对：2 函数 + 1 常量 = 3 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `KNOWLEDGE_PREVIEW_EVENT` | 常量（导出） | 6 | `'profer:knowledge-preview'` | 事件名 |
| `openKnowledgePreview` | 函数（导出） | 8-10 | `(reference: KnowledgeReference) => void` | 派发 CustomEvent |
| `KnowledgePreviewContent` | 函数/组件（导出） | 21-49 | `({reference, onClose?}) => React.ReactElement` | 预览正文 |

内部：`kindLabel`（`:12-14`，kind→中文标签）、`formatDate`（`:16-18`）。

## 3. 内部逻辑与关键流程

`KnowledgePreviewContent` effect（`:24-40`）：置 loading→`window.electronAPI.knowledge.getItem(reference.itemId)`；命中→`{loading:false, meta, text}`；未命中→错误「资料已删除或正文暂不可读取。」（`:34`）；异常→错误信息（`:36`）；`active` 标志防卸载 setState（`:25,39`）。渲染：meta 头条（kind/来源「研究资料|本地资料」/导入日期，`:44`）；正文 `markdownToSafeDisplayHtml(state.text)` memo（`:42`）→ `dangerouslySetInnerHTML`（`:46`）；loading 转圈/错误文案（`:46`）。

## 4. 调用者与调用链

入向（全树检索，证实）：**无任何导入/调用点**——`openKnowledgePreview`/`KnowledgePreviewContent`/`KNOWLEDGE_PREVIEW_EVENT` 全树仅命中本文件（`grep` 名字/导入形式，`apps/`+`packages/` 全 `*.ts/*.tsx`）。孤儿模块（推断：预览容器/事件监听方被裁剪或预留）。

出向：`@/lib/markdown-rich-text`（`markdownToSafeDisplayHtml`，`:3`）、`@profer/shared` 类型（`:4`）、`window.electronAPI.knowledge.getItem`（`:29`）。

## 5. 数据 I/O、读写与副作用

- IPC 读（knowledge.getItem）；DOM CustomEvent 派发（`openKnowledgePreview`）；`dangerouslySetInnerHTML`（经安全转换）。
- 无盘/网络直接操作。并发：`active` 竞态标志（`:25,39`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 加载中 | effect 起始 | 26 |
| 命中 | getItem 返回 | 30-32 |
| 已删除/不可读 | getItem null | 34 |
| 异常 | reject | 36 |
| 卸载取消 setState | active=false | 39 |

无重试/恢复概念，依据：一次性读取。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；资料权威=knowledge IPC（本地库）；HTML 安全性由 `markdownToSafeDisplayHtml` 承担（跨文件）。

## 8. 修改影响面

无调用方（§4）；若接入，`KNOWLEDGE_PREVIEW_EVENT` 事件契约与 `KnowledgeReference` 形状是修改面。需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索本模块 3 个导出 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实资料读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出 + 加载分支 | 已证实 | `:6-49` 逐行读 |
| 无调用者（孤儿模块） | 已证实 | 全树检索（§4 范围） |
| 预留/被裁剪定性 | 推断 | 无调用史证据 |
| markdownToSafeDisplayHtml 安全性 | 未知 | 非本批文件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `KNOWLEDGE_PREVIEW_EVENT`/`openKnowledgePreview` | §2-3 | 6-10 | covered |
| `KnowledgePreviewContent` | §2-3 | 21-49 | covered |
| 加载/错误分支 | §6 | 24-40 | covered |
| 调用链（无） | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
