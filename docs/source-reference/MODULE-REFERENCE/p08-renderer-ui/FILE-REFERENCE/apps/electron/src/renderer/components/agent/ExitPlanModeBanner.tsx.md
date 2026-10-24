---
path: apps/electron/src/renderer/components/agent/ExitPlanModeBanner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e04f2960245ecfc03369c2ad171f6487c153ae8a
sha256: 0e3e51256350757db47e244b0c1a302278c2a0f4524c4d02670086ebb11cf67c
lines: 329
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ExitPlanModeBanner.tsx

## 1. 结论与边界

Agent ExitPlanMode 计划审批横幅（文件头 `:1-10`，仿 Claude Code 计划审批 UI）：四选项——①批准并完全自动执行（→bypassPermissions）②批准并自动审批（→auto，SDK 自动审批器）③拒绝计划（deny）④提供修改意见（feedback）；键盘 ↑↓ 选择、Enter 确认、数字键 1-4 快选。状态存 `allPendingExitPlanRequestsAtom`（按 sessionId 队列，只处理队首）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ExitPlanModeBanner` | function 组件 | `:74-311` | `({sessionId, onRequestStop}) => ReactElement \| null`（无请求返回 null） |
| `AllowedPromptsList` | function 组件（内部） | `:313-329` | allowedPrompts 展示列表 |

内部：`PlanOption`/`PLAN_OPTIONS`（`:30-67`，四选项含 action/label/description/icon/variant）；`ExitPlanModeBanner`Props（`:69-72`）；状态 `focusedIdx/showFeedback/feedbackText/submitting`；**ref 镜像**（`focusedIdxRef/feedbackTextRef/handleActionRef`，`:87-92`——keydown handler 只在 requestId 变化时重建、经 ref 读最新值消除闭包过期）。

## 3. 内部逻辑与关键流程

### 3.1 响应与关闭（`:97-133`）

`handleAction`：`window.electronAPI.respondExitPlanMode({requestId, action, feedback（仅 feedback 动作传 trim 文本）})` 成功后从 atom 队列移除该请求（空则删 key）；失败 console.error；`submitting` 防重入。`handleDismiss`：清空本会话全部请求 + `onRequestStop()`（“关闭并终止 Agent”，`:130`）。

### 3.2 键盘导航（`:135-193`）

- **作用域守卫**：`resolveBannerKeyScope`/`shouldHandleBannerKey`（外部输入框/侧边栏按钮一律放行不 preventDefault，`:139-140`）。
- **可编辑目标**（反馈输入/ProseMirror）：仅 Enter 提交（`isComposing` 跳过、shift+Enter 不交）、Escape 退回选项区（focus=3）；**箭头键保留给原生光标**（`:144-147`）。
- 其余：↑↓ 循环选择（`PLAN_OPTIONS.length` 取模）、Enter（feedback→展开输入，否则执行）、数字 1-4 直选+执行。
- effect 依赖 `request?.requestId`（新请求重置三态，`:94-96`）。

### 3.3 渲染（`:195-329`）

无请求 null；卡片（FileText“Agent 计划待审批”+关闭 X“关闭并终止 Agent”+“Agent 已完成计划，请选择如何继续”）；`AllowedPromptsList`（allowedPrompts 非空时）；四选项按钮（序号+图标+标题+描述；destructive 红 hover；focus ring；`submitting` 禁用）；feedback 展开输入区（Enter 提交）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 会话视图（ExitPlanMode 请求到达时）。出向：`@/atoms`（`allPendingExitPlanRequestsAtom`）、`window.electronAPI.respondExitPlanMode`、`@/lib`（键作用域/可编辑判定辅助）、`lucide-react`。

## 5. 数据 I/O、读写与副作用

IPC 响应计划审批；atom 队列写；document keydown 监听（卸载移除）。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无请求 | `:198` | null |
| 响应失败 | `:117-118` | console.error（队列保留可重试） |
| submitting | `:98/:191` | 防重入/禁用 |
| 可编辑目标 | `:144-160` | 箭头留给光标、仅 Enter/Escape 特判 |
| 外部控件按键 | `:139-140` | 放行 |

## 7. 权限与权威状态

选项语义如实披露（完全自动=后续工具全部自动允许；自动审批=SDK 审批器判断）；拒绝=不执行；关闭=终止 Agent（title 明示）。

## 8. 修改影响面

改键盘/选项 → 影响计划审批交互；`respondExitPlanMode`/atom 契约联动主进程。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四选项语义+键盘全键位 | 已证实 | `:38-67/:135-193` |
| ref 镜像消闭包过期 | 已证实 | `:87-92/:136` |
| 作用域守卫/可编辑特判 | 已证实 | `:139-160` |
| 关闭即终止（明示） | 已证实 | `:130/:214` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| PLAN_OPTIONS/Props | 2 | `:30-72` | covered |
| 响应/关闭 | 3.1 | `:97-133` | covered |
| 键盘导航 | 3.2 | `:135-193` | covered |
| 渲染/`AllowedPromptsList` | 3.3 | `:195-329` | covered |
