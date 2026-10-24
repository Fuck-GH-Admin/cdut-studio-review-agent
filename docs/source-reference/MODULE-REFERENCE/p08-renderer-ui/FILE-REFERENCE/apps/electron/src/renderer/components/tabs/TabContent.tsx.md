---
path: apps/electron/src/renderer/components/tabs/TabContent.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c4625bb8ef8f051e0efffe7b2dbb03bc9e91ead
sha256: 8582f75189905392ba9459c0cfeb0b37929dbb8bc1eb30c8f10527d9d62220b8
lines: 109
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabContent.tsx

## 1. 结论与边界

标签内容渲染器（头注释 :2-6）：按标签类型渲染参数化 AgentView；**直接传 sessionId prop 无需桥接全局 atoms**。

## 2. 导出与关键符号

导出 2 条（`export` :19/:23）：`TabContentProps`（:19-21）、`TabContent({tabId})`（:23-63）。内部：`TutorialTabContent`（:65-109）。

## 3. 内部逻辑与关键流程

- tab 不存在→警示+空态（:27-40，[FLASH-DEBUG] warn 监控）。
- 类型分派（:42-62）：scratch→ScratchPadView；tutorial→TutorialTabContent；browser→TabErrorBoundary+BrowserTabContent（:50-56）；默认→AgentView（:58-62）。
- TutorialTabContent（:65-109）：getTutorialContent 加载三态（:71-85）+MarkdownToc/只读编辑器。

## 4. 调用者与调用链

入向（子agent 交叉核）：`MainArea.tsx:22`（:369 左窗格/:397 右分组窗格）；index.ts:4 死桶。出向：AgentView（:60）、BrowserTabContent（:53）、ScratchPadView（:43）、TabErrorBoundary（:52/:59）；electronAPI getTutorialContent:72。

## 5. 数据 I/O、读写与副作用

getTutorialContent IPC（教程加载）。

## 6. 分支、失败、取消与恢复

类型四分派+教程三态；不适用取消/恢复。

## 7. 权限与权威状态

sessionId 直传契约（:5）。

## 8. 修改影响面

- 消费面：MainArea。
- 依赖面：AgentView/BrowserTabContent 等 5 视图。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；四分派 | 已证实 | :23-63 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+分派 | §2/§3 | :23-109 | covered |
