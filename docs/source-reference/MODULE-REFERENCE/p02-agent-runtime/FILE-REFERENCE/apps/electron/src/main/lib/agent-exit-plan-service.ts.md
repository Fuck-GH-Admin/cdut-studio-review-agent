---
path: apps/electron/src/main/lib/agent-exit-plan-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 422db4d835f557a93c1c0129f55544064a7d616f
sha256: 8497366e039eacfe648d63c6011e9be59d0bf79e0c62565483f60d1dfb0fd845
lines: 184
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-exit-plan-service.ts

## 1. 结论与边界

ExitPlanMode 计划审批服务（头注释 :1-11）：拦截工具调用→解析 allowedPrompts→渲染进程审批 UI→等待用户选择（批准/拒绝/反馈）→按选择返回 PermissionResult 并切换权限模式。复用 AskUserService 的 Promise+Map 模式。单例管理全部会话。

## 2. 导出与关键符号

导出 4 条（`export` :22/:40/:50/:184）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `ExitPlanPermissionResult` | `:22-30` | allow（含 `targetMode?`）\| deny（message） |
| `ExitPlanModeCallbacks` | `:40-43` | `onPermissionModeChange(mode)` |
| `AgentExitPlanService` | `:50-181` | 主体（见 §3） |
| `exitPlanService` | `:184` | 全局单例 |

内部：`PendingExitPlan`（:33-37，resolve/request/toolInput）、`parseAllowedPrompts`（:169-180，非数组→[]、tool 固定 'Bash' :176、空 prompt 过滤 :179）。

## 3. 内部逻辑与关键流程

- `handleExitPlanMode(sessionId, input, signal, sendToRenderer)`（:59-88）：构造 request（randomUUID :69）→ sendToRenderer（:75）→ Promise 挂 pendingRequests（:78）；**abort 监听**（once :80-86）：删除并 resolve deny「操作已中止」。
- `respondToExitPlanMode(response)`（:95-145）：未命中返 null（:97）；五分支（:102-144）：`approve_auto`→allow+bypassPermissions、`approve_edit`→allow+auto、`deny`→「用户拒绝了计划」、`feedback`→deny+反馈文本（缺省「用户要求修改计划」）、default→「未知操作」。返回 `{sessionId, targetMode}` 供编排层切模式。
- `getPendingRequests`（:150-152，渲染层重载恢复）、`clearSessionPending(sessionId)`（:157-164，全 deny「会话已结束」）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/ipc.ts:338`（调用 :3220/:3554 clearSessionPending、:4327/:4383 getPendingRequests、:4328 respondToExitPlanMode）、`lib/remote-service.ts:82`（:856/:918/:953/:956）、`lib/agent-orchestrator.ts:141`（:1735-1736 handleExitPlanMode、:3574）；仅测试 `lib/review/review-remote-indirect-access.p05.test.ts:10`（spyOn）。出向：`node:crypto`（randomUUID :69）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无磁盘 I/O；内存 Map 状态；console.log/warn（:65/:82）。回调透传渲染层。

## 6. 分支、失败、取消与恢复

- 取消：AbortSignal→deny（:80-86，once 监听）。
- 响应五分支（§3）；pending 未命中返 null（:97）。
- 恢复：`getPendingRequests` 支持渲染层重载恢复（:148 注释）。

## 7. 权限与权威状态

权限核心：`targetMode`（bypassPermissions/auto）由用户选择驱动（:104-120），回调 onPermissionModeChange 切换编排层权限模式；deny 一律不切模式。

## 8. 修改影响面

ipc/remote-service/orchestrator 三条审批链；权限模式切换语义。无直接测试（仅 p05 spy）。

## 9. 测试证据

无专属测试（全树 `agent-exit-plan-service` 测试仅 `review-remote-indirect-access.p05.test.ts` spyOn :31/:67/:69，批外）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；abort→deny、五分支 | 已证实 | :59-145 |
| 三链消费（ipc/remote/orchestrator） | 已证实 | §4 子agent 交叉核 |
| 无专属测试 | 已证实（否定） | 全树检索 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| handleExitPlanMode/respondToExitPlanMode 五分支 | §3 | :59-145 | covered |
| getPendingRequests/clearSessionPending | §3 | :150-164 | covered |
| 测试 | §9 | — | unknown |
