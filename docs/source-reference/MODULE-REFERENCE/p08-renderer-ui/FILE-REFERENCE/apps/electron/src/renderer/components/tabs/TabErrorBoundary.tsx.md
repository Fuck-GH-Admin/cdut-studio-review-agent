---
path: apps/electron/src/renderer/components/tabs/TabErrorBoundary.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1672e9b6ce4f622dcf36f145e70f5a3830a7bfd7
sha256: d8b65eb9994e0be5f57ae3ba276e747bf1ee4705d42e709624cf86b0d4139962
lines: 60
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/TabErrorBoundary.tsx

## 1. 结论与边界

Tab 级错误边界（60 行）：渲染异常→错误页+「重新加载」重置。

## 2. 导出与关键符号

导出 1 条（`export` :14）：`TabErrorBoundary` class（:14-60）。内部：`getDerivedStateFromError`（:23-26）、`componentDidCatch`（console.error+componentStack :28-30）、`handleReset`（:32-34）。

## 3. 内部逻辑与关键流程

hasError 二分支（:36-58）：错误页（AlertTriangle+消息+重载按钮）/children。重置仅清本组件状态。

## 4. 调用者与调用链

入向（子agent 交叉核）：`TabContent.tsx:17`、`cdut-zone/AiClassChatPanel.tsx:11`→:35（2 生产）；不在 index.ts 再导出面。出向：react、lucide-react。

## 5-7. 数据/分支/权限

错误边界生命周期；不适用取消/恢复。

## 8. 修改影响面

- 消费面：Tab 内容渲染。
- 依赖面：React 错误边界机制。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；错误边界生命周期 | 已证实 | :23-58 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+二分支 | §2/§3 | :14-60 | covered |
