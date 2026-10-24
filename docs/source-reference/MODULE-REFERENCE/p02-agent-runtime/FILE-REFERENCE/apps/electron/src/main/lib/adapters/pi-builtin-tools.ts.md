---
path: apps/electron/src/main/lib/adapters/pi-builtin-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dff85ddd398a9e38b74511b1fc2bf84628c60a37
sha256: d23370e6863b06a7b27e6870be7ec365ea6136f3fbeb292601b0dc672ab1ffc6
lines: 2272
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-builtin-tools.ts

## 1. 结论与边界

Pi Runtime **内置业务工具桥接层**：Claude SDK 用 `createSdkMcpServer()`+Zod 注册 MCP 工具，Pi SDK 用 `defineTool()`+TypeBox 注册 customTools；本模块复用底层 service 函数（automation-manager、collaboration 等），用 Pi ToolDefinition 暴露相同业务能力，避免 Pi runtime 下工具缺失（文件头 `apps/electron/src/main/lib/adapters/pi-builtin-tools.ts:1-9`）。2272 行工具注册集合 + 统一装配入口。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 7 个函数 = 9 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PiBuiltinToolsContext` | 接口（导出） | 138-186 | `{sessionId,workspaceSlug?,workspaceId?,isTeamWorkspace?,agentCwd?,allowedRoots?,triggeredBy?,disabledToolGroups?,disabledTools?,activeToolGroups?,goalIteration?,reportGoalResult?,allowedPresetOperations?,currentPresetReference?,presetOperationUserMessage?,pendingPresetChange?,windowsShellAvailable?,onActivateToolGroup?,onImageGenerationUpdate?}` |
| `buildPiMemoryArchiveTools` | 函数（导出） | 217-253 | 记忆归档（`mcp__memory-archive__search_memory` 等） |
| `buildPiPlanningTools` | 函数（导出） | 254-387 | todos×4 + calendar×5（list/get/create/update/delete） |
| `buildPiTaskGraphTools` | 函数（导出） | 400-491 | `proma_task_create/update`（GraphEvent 持久化，`:397-399` 注释） |
| `buildPiGoalTools` | 函数（导出） | 492-518 | `update_goal`（goalIteration/reportGoalResult） |
| `buildPiAgentPresetTools` | 函数（导出） | 519-722 | preset×7（list/create/copy/switch_session/propose_update/request_default_change/commit_change） |
| `buildPiCdutTools` | 函数（导出） | 1691-1941 | CDUT 青果教务 8+1 域工具 |
| `PiBuiltinToolsResult` | 接口（导出） | 1945-1948 | `{tools,collaborationAvailable}` |
| `buildPiBuiltinTools` | 函数（导出） | 2046-2272 | **统一入口**（async，装配+裁剪） |

内部工具族（非导出 builder）：`buildPiAgentImageOutputTools`（`:737`，`send_local_image`）、`buildPiAgentPreviewTools`（`:763`，open/inspect_file_preview）、`buildPiPptDeliveryTools`（`:850`，plan_ppt_visuals/audit_ppt_delivery）、`buildPiAgentGptImageTools`（`:897`）、`buildWebTools`（`:930`，WebSearch/WebFetch）、`buildTeamMemoryTools`（`:1102`，team-memory×5）、`buildAutomationTools`（`:1114`，automation×6）、`buildPiClipboardTools`（`:1327`，clipboard×2）、`buildBrowserTools`（`:1363`，Browser×17）、`buildProferCloudTools`（`:1607`）、`buildWindowsShellInstallerTools`（`:1952`，`InstallWindowsShell`）、`buildDiscoverToolsTool`（`:1992`，`discover_tools` Tier-2 能力发现）。辅助：`jsonToolResult/jsonToolError/textToolResult`（`:188-216`）、`enrichTaskDescription`（`:389`）、`getCurrentAutomationId/summarizeAutomation`（`:990-1033`）、`isFiniteInt/assertNonBlank/validScheduleType/validTimeOfDayArr/validDayOfWeekArr/validDayOfMonthArr/validateScheduleFields`（`:1034-1101`）、`isWebSearchDepth/stringArray/numberOrUndefined`（`:723-736`）。

## 3. 内部逻辑与关键流程

### 3.1 工具族行为要点

- **planning（`:254-387`）**：todo/calendar CRUD 透传 `planning-agent-operations`，均带 `{sessionId,workspaceId,isTeamWorkspace}`；错误转 `jsonToolResult({error})` 不抛。
- **task-graph（`:400-491`）**：`proma_task_create` 发 `task_created`+`task_session_linked` 两个 GraphEvent；`proma_task_update` 先 `queryNodeById` 校验存在（`TASK_NOT_FOUND` 拒写入，`:470-471`）；父会话有运行中协作子会话时 `completed` 被阻断（`completionBlocked`，`:474-476`，子会话结束自动续跑后由后续更新定终态）。
- **presets（`:519-722`）**：`preset_list` 常驻；create/copy/switch/propose/request_default/commit 仅在 `triggeredBy==='user'` 且 `allowedPresetOperations` 含对应操作时注册（`:542-543` 等）——agent 触发不可自升能力。
- **automation（`:1114-1326`）**：六工具（list/get/create/update/delete/run_now）；`get` 在自动化运行中可省略 id 读当前任务（`:1130-1131`）；`create/update` 经 `validateScheduleFields`（`:1069-1101`）校验 interval/daily/weekly/monthly/once；`run_now` 走 `automation-scheduler`。
- **team-memory（`:1102-1113`）**：list/read/search/create/update（update 带 `expectedVersion` 版本冲突须向用户解释不得自动覆盖——工具描述强制语义）。
- **web（`:930-989`）**：WebSearch/WebFetch 经 `web-search-service`（Tavily）；`query`/`url` 必填；`maxChars` 默认 20000。
- **browser（`:1363-1606`）**：17 个 Browser* 工具经 `browserController`（navigate/observe/click/fill/dom-action/js/preview/tabs 等）；标签操作需浏览器风险告知确认。
- **clipboard（`:1327-1362`）**：read/write text。
- **cdut（`:1691-1941`）**：8 域（profile/schedule/grades/exams/classrooms/curriculum/selection/notices）+ `cdut_reverse_proxy_agent`；`runCdutDomain`（`:1643-1672`）先 `checkCdutGatekeeper` 门禁（写操作需用户确认）、演示态（`cdutDemoService.isActive()`）绝不发真实请求（`:1663-1668` 注释）、真实态经 `CDUT_AUTH_PARTITION` 会话执行。
- **InstallWindowsShell（`:1952-1989`）**：仅 `shouldOfferWindowsShellInstaller`（平台/可用性/触发方）为真时注册；下载 manifest→`findInstallerSource('git-for-windows',arch)`→`downloadInstaller`→`launchInstaller`（需用户批准外部安装）。
- **discover_tools（`:1992-2044`）**：Tier-2 能力发现（约 150 tokens）：按 `AGENT_PRESET_CAPABILITY_GROUPS` 列出能力组+已挂载工具+被预设关闭组，支持 `onActivateGroup`。

### 3.2 统一入口（`buildPiBuiltinTools`，`:2046-2272`）

按序装配各族 + 协作工具（`buildPiCollaborationTools` + `hasRunningDelegations`，`:2213-2214`）→ cloud（`:2254`）→ discover_tools 常驻（捕获注入失败仅 log，`:2256-2262`）→ **单工具裁剪** `filterDisabledTools(tools, ctx.disabledTools)`（shared 唯一事实表口径=短名末段，与 `disabledToolGroups` 叠加，`:2264-2268`）→ 返回 `{tools: filtered, collaborationAvailable}`。

## 4. 调用者与调用链

入向：Pi Agent 会话工具装配（`pi-agent-adapter.ts` 的 `customTools` 组装）；测试：`pi-builtin-tools.test.ts`（626 行，本批）。出向：`@profer/shared`（preset/automation 类型与 `filterDisabledTools`/能力组事实表）、`../automation-manager`/`automation-scheduler`/`agent-session-manager`/`agent-preset-manager`/`agent-preset-operations`/`planning-agent-operations`/`agent-collaboration-tools`/`installer-downloader`/`installer-manifest`/`windows-shell-installer`/`project-graph-service`/`team-memory-agent-tools`/`agent-workspace-manager`/`web-search-service`/`browser-controller`/`browser-profile-policy`/`clipboard-agent-tools`/`ppt-delivery-audit-service`/`agent-image-output-service`/`agent-gpt-image-service`/`cdut-*` 等主进程服务。

## 5. 数据 I/O、读写与副作用

- 读写：automation/preset/todo/calendar/记忆归档/团队记忆的主进程持久层（经各 service）；GraphEvent 追加（任务图）。
- 网络：WebSearch/WebFetch（Tavily）、browser、cdut 教务/反代、安装器下载。
- 副作用：`console.log/error` 装配日志；工具结果统一 `AgentToolResult`（文本+details）。

## 6. 分支、失败、取消与恢复

- 各 execute 统一 `try/catch` → `jsonToolError`/`jsonToolResult({error})`（业务错误不炸会话）；入参错误多为 `throw new Error('<字段> 必填')`。
- task update 的 `TASK_NOT_FOUND`/completed 阻断（`:470-476`）；automation schedule 校验（`:1069-1101`）；preset 门禁（source/allowedOperations）；cdut 门禁/演示态。
- 无取消概念（透传 `signal` 仅 web/gpt-image）。

## 7. 权限与权威状态

- preset 单工具/组裁剪（`disabledTools`/`disabledToolGroups`）为能力权威；agent 触发不得注册 preset 变更工具（`triggeredBy==='user'` 门禁）。
- cdut 写操作需用户确认（工具描述+gatekeeper）；演示态零真实请求。
- 团队记忆 update 强制版本冲突人工解释。

## 8. 修改影响面

- 改工具名/参数影响模型调用与 `pi-builtin-tools.test.ts` 断言。
- 改装配/裁剪顺序影响 preset 语义与 `discover_tools` 的 mounted 集合。
- 改 service 委托影响主进程各业务模块契约。

## 9. 测试证据

直接测试：`pi-builtin-tools.test.ts`（626 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

缺口：浏览器/cdut/web 族真实网络行为、automation 校验全分支以测试手册为准。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| TypeBox 复刻 Claude MCP 业务面 | 已证实 | 文件头 `:1-9` |
| preset 变更工具仅 user 触发 | 已证实 | `:542-543` 等 |
| task-graph completed 阻断语义 | 已证实 | `:474-476` |
| cdut 演示态零真实请求 | 已证实 | `:1663-1668` |
| 单工具裁剪+组裁剪叠加 | 已证实 | `:2264-2268` |
| **源码矛盾**：`proposeAgentPresetUpdateFromAgent` 传参 `input.agentRuntime !== 'pi' && input.agentRuntime !== 'pi'`（重复条件恒等价于单条件，疑似迁移残留） | 已证实（静态） | `:1093` |
| 真实网络/教务行为 | 未知 | 未运行 |
| 测试覆盖细节 | 未知 | 见测试手册 |

## 11. 覆盖表

| 工具族 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| memory/planning/task-graph/goal | §3.1 | 217-518 | covered |
| presets | §3.1 | 519-722 | covered |
| image/preview/ppt/gpt-image | §3.1 | 737-929 | covered |
| web/team-memory/automation/clipboard | §3.1 | 930-1362 | covered |
| browser/cloud/cdut | §3.1 | 1363-1941 | covered |
| installer/discover | §3.1 | 1952-2044 | covered |
| 统一入口/裁剪 | §3.2 | 2046-2272 | covered |
| 测试断言 | §9 | — | 见测试手册 |
