---
path: apps/electron/src/renderer/components/cdut-zone/AiClassChatPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 30910540c2a82c7bb12fbb7f1e1664275868fced
sha256: 6b5b5c566141e6c81880d9cd45d04df513dc8479a4e8174474e8b19f52e08ba2
lines: 40
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/AiClassChatPanel.tsx

## 1. 结论与边界

AI 速课堂**专属对话面板**（40 行）："彻底替代直接挂载的通用 AgentView"（`:4`）：`variant="ai-class"` 精简模式——剥离 Token 热力图/MCP 技术提示、隐藏预设切换、禁用 `/` `#` `&` 唤起、柔和大字号问候+学习语境占位，仅保留 AskUserBanner 摸底能力（`:4-6`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AiClassChatPanel` | `:18-40` | `({sessionId})`：构造 `emptyState`（CdutMark 校徽+渐变问候文案+引导文案，absolute inset-0 居中 `:20-22` 注释解释塌陷问题）→`TabErrorBoundary`（key 含 sessionId `:35`）包裹 `AgentView`（variant/emptyState） |

内部 props：`AiClassChatPanelProps:14-16`（仅 sessionId）。

## 3. 内部逻辑与关键流程

单组件纯组合：emptyState 常量→ErrorBoundary→AgentView。`data-tour="ai-class-chat"`（导览锚点 `:34`）。

## 4. 调用者与调用链

AiClassView（课堂主界面）；出向 `@/components/agent`（AgentView）、`@/components/tabs/TabErrorBoundary`、`@/components/shared/CdutLogo`（CdutMark）。

## 5. 数据 I/O、读写与副作用

纯渲染（数据流在 AgentView 内部）。

## 6. 分支、失败、取消与恢复

错误由 TabErrorBoundary 捕获（sessionId 作用域）。

## 7. 权限与权威状态

"ai-class" variant 的精简契约在 AgentView 侧（本层只声明意图）。

## 8. 修改影响面

改 variant 语义影响速课堂对话面；emptyState 文案面向学生用户。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件组合/空态注释 | 已证实 | 40 行全读 |
| AgentView variant 实际裁剪面 | 未知 | agent 组件不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；依赖/实效 unknown。
