---
path: apps/electron/src/main/lib/agent-ask-user-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f2ed37110d542c1084f2335625be511b876f3af
sha256: b1e3a8855108f860899eeeda58a1b20fcd38af328303232a68ced718a66a1c7e
lines: 201
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-ask-user-service.ts

## 1. 结论与边界

AskUserQuestion 交互式问答服务（主进程）：拦截模型的 AskUserQuestion 工具调用，解析问题列表发给渲染进程展示交互 UI，阻塞等待用户回答后经 `updatedInput` 注入 `answers` 字段放行工具；管理 pending 请求生命周期（Map + Promise）。单例模式（:201 导出 `askUserService`）。

不做的事：不自行发 IPC（渲染进程通知由调用方传入的 `sendToRenderer` 回调负责，:72/:106）；不做权限审批（那是 `agent-permission-service` 的职责）；不持久化 pending（进程内存，重启即失，见 §6）。

## 2. 导出与关键符号

导出 3 条（`export` 逐条核 :25/:59/:201）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `normalizeAskUserQuestionType` | function | `:25-35` | `(rawType: unknown, optionCount: number, multiSelect: boolean) => AskUserQuestionType` | 题型归一化（`'single'\|'multiple'\|'fill-blank'`，枚举定义 `packages/shared/src/types/agent.ts:1854`） |
| `AgentAskUserService` | class | `:59-198` | 单例服务类 | 私有 `pendingRequests: Map<string, PendingAskUser>`（:61） |
| `askUserService` | const | `:201` | `new AgentAskUserService()` | 全局实例 |

关键内部符号：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `PermissionResult` | `:38-44` | 内部类型：`{behavior:'allow', updatedInput}` 或 `{behavior:'deny', message}` |
| `PendingAskUser` | `:47-52` | `{resolve, request, toolInput}`；`toolInput` 仅留主进程（注释 :50） |
| `handleAskUserQuestion` | `:68-108` | 核心入口（见 §3） |
| `respondToAskUser` | `:115-133` | 应答（IPC/remote/协作代答调用） |
| `getPendingRequests` | `:138-140` | 返回全部 pending 的 `AskUserRequest`（供渲染层重载恢复，注释 :136） |
| `clearSessionPending` | `:145-152` | 会话结束清理，逐条 `deny('会话已结束')` |
| `parseQuestions` | `:160-172` | 支持 `{questions:[...]}` 与平铺单题 `{question,...}`（:164-166） |
| `parseSingleQuestion` | `:175-197` | 字段全防御：label 非串→'' 且过滤空 label（:180/:184）、preview 截 10000（:182）、placeholder 截 500（:193）、`multiSelect === true` 才为 true（:186）、fill-blank 时 options 清空（:194）、`multiSelect` 输出按 `type==='multiple'` 重算（:195） |

## 3. 内部逻辑与关键流程

`handleAskUserQuestion(sessionId, input, signal, sendToRenderer)`（:68-108）执行顺序：
1. `parseQuestions(input)`（:74）。
2. 空题熔断（:77-84）：0 个有效问题 → 直接 resolve `{behavior:'deny', message:'AskUserQuestion 输入未包含任何有效问题。…'}`，不创建 pending、不通知渲染层。
3. `requestId = randomUUID()`（:86）；渲染层收到的 `toolInput` 是浅拷贝 `{...input}`（:87），原始 `input` 存 `PendingAskUser.toolInput` 不外发（:96，注释 :50）。
4. Promise 内：先 `pendingRequests.set`（:96）再 `sendToRenderer(request)`（:106，注释 :105：先登记再通知，防止同步应答找不到 pending）。
5. `signal.addEventListener('abort', …, {once:true})`（:98-103）：若 pending 仍在，删除并 resolve `{behavior:'deny', message:'操作已中止'}`。

`respondToAskUser(requestId, answers)`（:115-133）：查 pending，无则返回 `null`（:116-117）；删除 pending（:120）；构建 `updatedInput = {...pending.toolInput, answers}`（:123-126，注释 :122：内部 metadata 不展示给 renderer——因 `toolInput` 是原始输入，`answers` 覆盖写入）；resolve `{behavior:'allow', updatedInput}`（:128-131）；返回 `sessionId`。

`normalizeAskUserQuestionType`（:25-35）优先级：显式 `'fill-blank'` 优先（:30）→ `optionCount===0` 强制 `'fill-blank'`（:32，注释 :31：选择题无 options 无法作答）→ 显式 `'single'`/`'multiple'` 透传（:33）→ 按 `multiSelect` 降级（:34）。注意：显式 `'single'`/`'multiple'` 且 0 options 时仍被 :32 强制降为 fill-blank。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- `apps/electron/src/main/lib/agent-orchestrator.ts:140` 导入；`:1753` 作为 `permissionService.createCanUseTool`（:1745）第 4 参（auto 流程的 ask-user 钩子）；Pi `canUseTool` 内 `toolName === 'AskUserQuestion'` 分支（:1907-1914，注释 :1906：始终走交互式问答，不受权限模式影响）在 :1908 调 `handleAskUserQuestion`；`:3572` 注释说明 askUserService 不在 turn 结束时清理。
- `apps/electron/src/main/ipc.ts:337` 导入；`AGENT_IPC_CHANNELS.ASK_USER_RESPOND`（`'agent:ask-user:respond'`，常量定义 `packages/shared/src/types/agent.ts:2375`）handler（ipc.ts:4300-4318，channel :4301）：`assertSensitiveAgentIpcSender(event)`（:4303）+ `assertOrdinaryPendingRequestId(requestId, getPendingRequests())`（:4305）后调 `respondToAskUser`（:4306），成功再 `emitSessionStreamEvent` 发 `ask_user_resolved`（:4308-4316）；`:3219/:3553` 调 `clearSessionPending`；`:4382` 快照 `getPendingRequests()` 过滤后回传渲染层。
- `apps/electron/src/main/lib/remote-service.ts:81` 导入；WS 命令 `respond_ask_user`（:936-947）：先 `filterOrdinaryPendingRequests(getPendingRequests())` 校验存在（:940），`respondToAskUser`（:943）后 `agentEventBus.emit` 发 `ask_user_resolved`（:945）；`:855` `clearSessionPending`；`:917` 快照。
- `apps/electron/src/main/lib/agent-collaboration-tools.ts:1222-1224` 动态 `await import('./agent-ask-user-service')` 后 `respondToAskUser`（协作子会话代答路径）。
- `apps/electron/src/main/lib/review/review-remote-indirect-access.p05.test.ts:9/:30/:66/:68`：spyOn `getPendingRequests`/`respondToAskUser`（mock，验证审核会话隔离）。

出向：`node:crypto` `randomUUID`（:13）；类型 `@profer/shared`（:14-19）。无其它模块调用。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络 I/O（依据：导入仅 :13-19）；状态仅 `pendingRequests` Map（进程内存）。
- 副作用：调用 `sendToRenderer(request)`（:106，通知渲染进程）；resolve Promise 放行/拒绝下游 SDK 工具调用。
- `toolInput` 数据流：原始 input 只留主进程（:96），渲染层只见浅拷贝（:87）；应答时 `answers` 注入原始 input 得 `updatedInput`（:123-126）交还 SDK。
- 幂等：`respondToAskUser` 对同一 requestId 二次调用返回 `null`（:116-117，pending 已删）；abort 与应答竞态由 Map 删除判定（:99/:120）。

## 6. 分支、失败、取消与恢复

- 空题熔断 deny（:77-84）——结构性拒绝而非悬挂；测试断言「不通知渲染层」。
- 取消：`signal` abort → 删除 pending 并 `deny('操作已中止')`（:98-103）。
- 会话结束：`clearSessionPending` 逐条 `deny('会话已结束')` 并删除（:145-152）。
- 失败后状态：deny 文案即用户/模型可见文本（`操作已中止`/`会话已结束`/空题提示）。pending 不持久化：应用重启后请求丢失，SDK 侧调用结果依赖底层 abort（属下游，未读）。
- `respondToAskUser` 未找到 requestId 返回 `null`，调用方据此回错误（remote-service:944、ipc:4306 返回值用于 resolved 事件判定）。
- 无重试逻辑（依据：全文无 retry/超时；等待时长由 SDK 工具调用的 AbortSignal 决定）。

## 7. 权限与权威状态

- 本文件无 sender/role 检查（依据：全文无 sender/role 字段）；入口守卫在调用方：IPC 路径 `assertSensitiveAgentIpcSender(event)` + `assertOrdinaryPendingRequestId`（ipc.ts:4304-4305，后者实现见 `apps/electron/src/main/lib/agent-ordinary-pending-access.ts:16-22`：仅当 requestId 属于「普通会话」pending 才放行，审核私有会话被 `assertOrdinaryAgentSession` 拒绝）；WS 路径以 `filterOrdinaryPendingRequests` 过滤（remote-service:940）。
- 协作代答路径（agent-collaboration-tools.ts:1222-1224）不经上述过滤器，仅做委派归属校验（见该文件手册 §7）。
- 权威状态：`pendingRequests` 是 pending 的唯一权威（应答/取消/清理都在此收敛）；`answers` 原样注入，服务端不校验答案与 options 的匹配（:123-126，依据：无答案合法性检查）。

## 8. 修改影响面

- 改 `updatedInput` 注入形状会影响 SDK 工具实际收到的参数（消费链：Pi adapter 恢复工具调用；`apps/electron/src/main/lib/adapters/pi-agent-adapter.test.ts:86` 注释即模拟该注入）。
- 改 `PermissionResult` 形状影响 orchestrator 的 canUseTool 契约（agent-orchestrator.ts:1753/:1908）。
- `getPendingRequests` 返回形状被 IPC 快照（ipc.ts:4382）与 remote 快照（remote-service:917）直接下发渲染层/Pocket，改动影响 pending UI 与移动端。
- 题型归一化改动影响渲染层表单（单选/多选/填空）与历史会话兼容（注释 :22-23）。
- 需同步修改的测试：`agent-ask-user-service.test.ts`（本批内）；间接：`review-remote-indirect-access.p05.test.ts`（spy 契约）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-ask-user-service.test.ts`（本批内，7 用例）。
- describe「题型归一化」4 用例（:5/:11/:17/:22）：显式合法 type 优先（断言 :6-8）、缺省按选项+multiSelect 降级（:12-14）、非法 type 不信任（`'essay'`→multiple、`42`→fill-blank，:18-19）、0 options 强制 fill-blank（:23-24）。
- describe「问答服务闭环」3 用例（:29/:51/:64）：平铺单题解析（断言 questions 数组长度 1、question 文本、options 标签序列 :40-44，末尾 abort 清理 :47-48）；空题输入立即 deny 且 `notified=false`（:60-61）；空 questions 数组同样 deny（:72）。
- mock/边界：直接使用全局单例 `askUserService`（真身，非 mock）；`sendToRenderer` 用捕获回调替身；无 Electron/IPC。
- 未覆盖：`respondToAskUser`（含 answers 注入形状）、`getPendingRequests`、`clearSessionPending`、abort 竞态、`respondToAskUser` 二次调用返回 null——本文件测试未覆盖；`respondToAskUser`/`getPendingRequests` 仅在 `review-remote-indirect-access.p05.test.ts` 中以 spyOn mock 间接出现（mock 返回值，不执行真身）。
- `NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；单例 :201 | 已证实 | `:25/:59/:201` |
| 空题熔断 deny 且不通知渲染层 | 已证实 | `:77-84`；测试 :51-62 |
| 先登记 pending 再通知渲染层 | 已证实 | `:96`（set）先于 `:106`（send） |
| `toolInput` 原始输入不随 request 外发，渲染层仅见浅拷贝 | 已证实 | `:87` vs `:96` |
| 题型归一化优先级（fill-blank > 0-options > 显式 single/multiple > multiSelect 降级） | 已证实 | `:30-34`；测试 :6-24 |
| abort/会话清理走 deny | 已证实 | `:98-103`/`:145-152` |
| `answers` 不经校验原样注入 `updatedInput` | 已证实 | `:123-131` |
| 审核私有会话的 pending 在 IPC/WS 路径被过滤 | 已证实 | `agent-ordinary-pending-access.ts:4-13`；ipc.ts:4305；remote-service:940 |
| 底层 SDK 收到 deny 后的重试行为 | 未知 | 属 SDK/orchestrator，未读 |
| 渲染层 UI 消费 `AskUserQuestion` 形状的具体组件 | 推断 | 仅见快照下发（ipc.ts:4382），未追渲染端 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizeAskUserQuestionType` 全 4 分支 | §3/§9 | :25-35 | covered |
| `handleAskUserQuestion` 熔断/登记/abort | §3/§6/§9 | :68-108 | covered |
| `respondToAskUser` | §3/§5 | :115-133 | partial（无直接测试） |
| `getPendingRequests`/`clearSessionPending` | §2/§6 | :138-152 | partial（仅间接 spy） |
| `parseQuestions`/`parseSingleQuestion` | §3 | :160-197 | covered |
| `PendingAskUser.toolInput` 不外发 | §5 | :50/:87/:96 | covered |
| answers 注入形状 | §5/§8 | :123-126 | covered（无断言测试） |
| SDK 收 deny 后行为 | §10 | — | unknown |
