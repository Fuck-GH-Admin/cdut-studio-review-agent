---
path: apps/electron/src/renderer/components/content-review/ReviewV3SourceNavigator.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fabb47727a4a26d8caa61ca5296ab8b0ac16c123
sha256: 763f79266a3e6bbf1958b9470914643efab2a8d21aca52d266500b2a249b3597
lines: 152
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3SourceNavigator.tsx

## 1. 结论与边界

**F10 来源定位面板**（`:22-25` 注释）：**直接以 V2 DocumentVersion 原文块定位，避免把新版本引用猜到旧 V1 块；不写入任何案卷/Run；无法确认的来源只允许打开原件人工核对**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3SourceNavigator` | function（export） | `:26-148` | `({purpose})`；jotai 三原子驱动（focus/aggregate/activePane `:27-30`） |

内部：`locationText`（5 种 SourceLocation 文案 `:11-20`）、`documentQueryPending`（`data-review-pending-key` 定位 `:150-152`）、blockRefs/targetRef、preview/error/query/searchIndex state。

## 3. 内部逻辑与关键流程

1. 激活判定（`:37`）：focus.purpose 与 caseId 双匹配；`resolveT08Source` 解析（`state==='located'` 才选块 `:40`）。
2. 定位：rAF 后 scrollIntoView 目标块（**:48-56，窄屏栏先挂载；同引用重复点击重定位**）；nonce/案卷切换清状态（`:58-59`）。
3. 块内搜索：text+imageAlt 匹配（`:41-45`）；Enter/下一按钮循环（`:118/:124`）；搜索命中蓝环、当前引用琥珀环（`:132`）。
4. 打开原件（`:68-81`）：`getWorkspaceDocumentPreviewPath` → FilePreviewDialog；失败 `role="alert"`（`:110`）。
5. 返回原检查（`:83-95`）：清 focus、回右栏、双 rAF 后展开 `<details>` 并滚动聚焦 originPendingActionKey（防卸载时序）。
6. 语义行：非 located 提示「不会将不匹配的坐标指向其他材料…文件级定位不表示已验证引用内容」（`:108`）；块文本空→图片块/空文本提示（`:139`）。

## 4. 调用者与调用链

入向：内容审核工作台（F10）。出向：`@/atoms/review-atoms`、`@/components/file-browser/FilePreviewDialog`、`./review-v3-t08-case-report`、`./review-v3-source-navigation`、`window.reviewAPI`。

## 5. 数据 I/O、读写与副作用

读：workspace 原件预览路径（IPC）；渲染：FilePreviewDialog；滚动定位副作用。**无写入**（`:24`）。

## 6. 分支、失败、取消与恢复

解析失败→只读提示+开原件（`:108`）；预览失败→alert；rAF 清理（`:55/:63`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：不写案卷/Run（`:24`）；不猜测跨版本引用（`:23`）；文件级≠已验证（`:108`）。

## 8. 修改影响面

改定位 → 引用核查 UX 与事实边界文案。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3SourceNavigator` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+定位/搜索/返回全链 | 已证实 | 逐行读 `:1-152` |
| reviewAPI/atoms 行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:11-152` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
