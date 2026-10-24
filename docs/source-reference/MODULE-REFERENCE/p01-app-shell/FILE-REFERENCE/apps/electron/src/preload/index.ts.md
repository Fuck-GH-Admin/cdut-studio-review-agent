---
path: apps/electron/src/preload/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32eabfb7b941981ffc1dc1c6a447e96fa1fdc452
sha256: 87e00255321d55eb5edea8dce84389e7ebca1861324e7fb97e0f9c79dd435471
lines: 5105
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/preload/index.ts

## 1. 结论与边界

Electron **preload 桥**（构建产物 `dist/preload.cjs`，由 `main/index.ts:514` 挂载，`contextIsolation:true`/`nodeIntegration:false`）。通过 `contextBridge` 暴露 3 个 API 对象：

| 对象 | 实现 | 暴露 | 守卫 |
| --- | --- | --- | --- |
| `electronAPI` | `:2122-4702` | `:4705` `exposeInMainWorld('electronAPI', electronAPI)` | 无条件 |
| `agentPreviewAPI` | `:4721-4735` | `:4738` | `process.isMainFrame`（`:4737` 注释：iframe 内容不能获得预览控制能力） |
| `reviewAPI` | `:4743-5097` | `:5099` | `process.isMainFrame` |

全文件 **834 处 `ipcRenderer.invoke`**、79 处 `on`（78 对 `removeListener` + 1 `off`）、6 处 `send`、2 处 `sendSync`、1 处 `webUtils.getPathForFile`（唯一非 IPC 桥）。**纯透传**：0 处 try/catch/throw/运行时参数校验/sender 检查/日志。

不做的事：不实现任何 IPC handler（main 侧 `ipc.ts`/各 lib）；不做权限判断（sender 守卫在 main `lib/ipc-sender-guard.ts`）；不校验参数（仅 TS 类型与少量默认值）。

## 2. 导出与关键符号

**导出仅 1 条**：`export interface ElectronAPI`（`:272-2107`，约 1840 行类型声明，renderer 可见面的完整 API 契约）。其余均为模块内符号：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `MigrationExportResult` | `:2109-2113` | interface，迁移导出结果 |
| `_settingsPromise` | `:2119-2120` | 模块级缓存，`getSettings` 启动去重（`:2529-2538`，`finally` 清空） |
| `electronAPI: ElectronAPI` | `:2122-4702` | 混合组织：顶层扁平函数 + 15 个命名空间（`knowledge:2489`、`auth:3917`、`sync:3939`、`team:3956`、`sse:4007`、`skillMarketplace:4027`、`globalSkill:4041`、`skillMaster:4058`、`teamMemory:4078`、`teamFile:4089`、`cdutZone:4118`、`longTermMemory:4151`、`cslab:4169-4528`（约 120 成员）、`yanhuExpress:4531-4630`、`study:4633-4678`、`cdutAiClass:4681-4701`） |
| `declare global Window` | `:4707-4719`、`:5101-5105` | `electronAPI: ElectronAPI`、`agentPreviewAPI?`、`reviewAPI: typeof reviewAPI` |
| `agentPreviewAPI` | `:4721-4735` | 5 成员（onRender/sendResult/sendError/notifyReady/capture），通道全是内联字符串 `agent-preview:*` |
| `reviewAPI` | `:4743-5097` | 约 123 成员（REVIEW_IPC_CHANNELS 三前缀 `review:`/`review-v2:`/`review-v3:`），每条 `invoke` + `as Promise<T>` |

接口层（`ElectronAPI :272-2107`）按域分组（成员名+行号全清单见源码）：运行时/git `:276-316`、受管浏览器 `:318-369`、起始页 `:371-376`、窗口控制 `:383-402`、渠道 `:404-447`、对话 `:449-482`、消息/分支 `:492-538`、附件 `:539-560`、knowledge `:562-576`、皮肤/设置/通知 `:586-658`、ScratchPad `:660-675`、图标/环境/安装包/代理 `:677-718`、Chat 流事件 `:720-735`、Agent 会话/预设/Goal `:737-900`、工作区/技能/记忆 `:905-1063`、Chat 工具/交互 `:1065-1102`、文件系统 `:1168-1292`、Lark/飞书/钉钉/微信 `:1309-1431`、迁移/存储 `:1445-1481`、Planning/Automation/推荐 `:1483-1530`、命名空间 `:1533-2106`（cslab `:1704-1978`、yanhuExpress `:1981-2049` 最大）。

## 3. 内部逻辑与关键流程

### 3.1 方向与封装模式

- **invoke 双写法**：多行（`:2126-2128` 等）或单行箭头批（如预设批 `:2735-2748`、Planning 批 `:3848-3868`）；返回 `Promise` 直通，部分带 `as Promise<T>` 断言（**断言不是校验**）。
- **send（单向，6 处）**：`setAgentBrowserForeground:2183`、`setAgentBrowserLayout:2191`、`notifyRendererReady:2526`（`settings:renderer-ready`，驱动 `main/index.ts:646` 的 `setRendererReadyHandler`）、agentPreviewAPI 的 `sendResult:4728`/`sendError:4731`/`notifyReady:4733`。
- **sendSync（同步阻塞，2 处）**：`updateSettingsSync:2544-2546`（`settings:update-sync`，返回 boolean）、`saveScratchPadSync:2628-2630`（beforeunload 场景）。
- **on 订阅（79 通道）统一模式**：`const listener = (_, payload) => callback(payload)` → `ipcRenderer.on(CH, listener)` → `return () => ipcRenderer.removeListener(CH, listener)`；唯一例外 `onInstallerProgress:2668-2672` 闭包用 `ipcRenderer.off`（`:2671`）。**无 once/removeAllListeners/重复订阅防护**——重复调用 on* 会叠加回调，去重责任在调用方持 disposer。`onWindowResize:2284-2288` 是唯一非 IPC 订阅（DOM `window.addEventListener('resize')`）。
- **参数默认值**（仅有的"处理"）：`truncateMessagesFrom` `preserveFirstMessageAttachments=false`（`:2416`）、`installSkinZip/Folder` `replace=false`（`:2518-2519`）、`promoteWorkspacePresetToGlobal`/`promoteWorkspaceSkillToGlobal` `keepWorkspaceCopy=true`（`:2737`/`:3003`）、`searchWorkspaceFiles` `limit=20`（`:3507`）、`globalSkill.save` 传 `workspaceSlug ?? ''`（`:4046`，**唯一空串兜底**）、`createTab` 传 `input ?? {}`（`:4541`）。

### 3.2 通道来源与内联字符串

绝大多数成员引用常量（import 自 `@profer/shared` 的 33 个 `*_IPC_CHANNELS` 与 `../types` 的 10 个，`:9-267`）。**内联字符串通道全集**（36 个，与常量区并存，改动需逐处同步）：`agent:select-and-upload-folder:3364`；`file:*` 12 个（`:3402-3456`，`resolve-and-read`/`describe-path`/`write-text`/`resolve-path`/`search-candidate`/`cancel-search`/`resolve-html-preview-path`/`register-preview-path`/`prepare-pdf-preview`/`resolve-document-anchor`/`read-binary-base64`）；`menu:close-tab:3758`；`migration:*` 10 个（`:3780-3844`）；`team:workspaces-synced:3959` 与 team 其余 5 个（`:3993-4003`）；`sse:connect/disconnect/disconnect-all:4008-4010`；`agent-preview:*` 5 个（`:4724-4734`）。

常量映射规则（供定位，全量见常量定义文件）：`IPC_CHANNELS`（`packages/shared/src/types/runtime.ts:362-415`，多前缀 `runtime:/git:/shell:/preview:/window:/screenshot:/sidebar:`）；`AGENT_IPC_CHANNELS`（`types/agent.ts:2022-2414`，183 键，`agent:<kebab(KEY)>`，17 个键值不符例外如 `CLEAR_COMPLETION_STATE='agent:confirm-working-done'`（`:2058` 注释：**值保留旧名以兼容已缓存的 preload**）、`STOP_AGENT='agent:stop'`、Goal 族 `agent:goal-*`）；`AGENT_PRESET_IPC_CHANNELS`（`types/agent-preset.ts:777-805`，26 键）；`CSLAB_IPC_CHANNELS`（`types/cslab.ts:10` 起，138 键，例外 `ZOTERO_GET_STATUS='cslab:zotero-status'`、`ZOTERO_GET_BRIDGE_STATUS='cslab:zotero-bridge-status'`）；`REVIEW_IPC_CHANNELS`（`types/review.ts:486` 起，123 键，三前缀与键名后缀不互推——`T01_MODEL_DRAFT='review-v3:t01-model-draft'` 无 _V3 却是 review-v3 前缀；`LATEST_RUN='review:get-latest-run'`）；`SETTINGS/SKIN/SCRATCH_PAD/…`（`apps/electron/src/types/settings.ts:388-508`）等。**键名→字符串值不能一律按 kebab 推断**，定位请查定义文件行。

### 3.3 代表性逐通道表（核心域，含参数/返回与 Main/renderer 边界）

| 桥成员 | 行 | 方向/通道值 | 参数 → 返回 | Main 注册 | renderer 消费 |
| --- | --- | --- | --- | --- | --- |
| `getPlatformInfo` | `:2123` | 非 IPC | → `{platform,arch}` | — | window.electronAPI |
| `getRuntimeStatus`/`reinitRuntime` | `:2126`/`:2130` | invoke `runtime:get-status`/`runtime:reinit` | 无 → Promise | `ipc.ts`（registerIpcHandlers） | 同上 |
| git 族（11） | `:2134-2176` | invoke `git:*` | 路径/输入对象 → Promise | ipc.ts | 同上 |
| 窗口控制（5） | `:2246-2264` | invoke `window:minimize/maximize/close/is-maximized/is-full-screen` | 无 → Promise | ipc.ts | 同上 |
| `onWindowFullScreenChanged`/`onWindowMaximizeChanged` | `:2266`/`:2272` | on `window:full-screen-changed`/`window:maximize-changed` | cb(bool) → disposer | main/index.ts `:779`/`:770` 直发 | 渲染层标题栏 |
| `listChannels`…`loginXaiOAuth`（15） | `:2291-2348` | invoke `channel:*` | 渠道输入 → Promise | ipc.ts/channel-manager | 设置页 |
| 对话族（12） | `:2351-2398` | invoke `chat:*` | id/标题/模型 → Promise | ipc.ts | 会话列表 |
| 消息/分支（8） | `:2409-2457` | invoke `chat:delete-message/truncate-messages-from/get-branch/set-active-path/get-branch-tree/fork-branch-at/get-message-content/update-context-dividers` | 对话/消息 ID → Promise | ipc.ts | 对话视图 |
| 附件族（7） | `:2460-2486` | invoke `chat:save-attachment`… | localPath/文件名 → Promise | ipc.ts | 对话/输入框 |
| `getSettings`/`updateSettings`/`updateSettingsSync` | `:2529`/`:2540`/`:2544` | invoke/sendSync `settings:get`/`settings:update`/`settings:update-sync` | Partial → Promise/boolean | settings-service | 全局 |
| `notifyRendererReady` | `:2526` | send `settings:renderer-ready` | 无 | `main/index.ts:646` | 启动链 |
| Chat 流事件（5） | `:2688-2716` | on `chat:stream:{chunk,reasoning,complete,error,tool-activity}` | cb(event) → disposer | yanhu/对话流 | 流式渲染 |
| `sendAgentMessage`/`stopAgent` | `:2904`/`:2908` | invoke `agent:send-message`/`agent:stop` | AgentSendInput/sessionId | ipc.ts:3842（SEND_MESSAGE，另有 `lib/agent-send-binding.ts:8` 归属校验） | AgentView.tsx 多处 |
| `getPathForFile` | `:3503-3505` | webUtils | File → string | — | 拖拽取路径 |

（其余 ~800 个成员均可按 §3.2 的行号分组与常量映射定位：预设批 `:2732-2792`、Goal 批 `:2911-2924`、工作区/Skill/记忆 `:2949-3194`、Chat 工具 `:3197-3229`、文件系统 `:3346-3501`、IM `:3531-3754`、迁移/存储 `:3779-3845`、Planning/Automation/推荐 `:3848-3914`、命名空间 `:3917-4701`、reviewAPI `:4744-5096`。）

## 4. 调用者与调用链

- **Main 侧注册**：`ipc.ts` `registerIpcHandlers()`（由 `main/index.ts:945` 调用）注册绝大部分通道；示例已核 `AGENT_IPC_CHANNELS.SEND_MESSAGE` 于 `ipc.ts:3842`；`chat:send-message` 见 §10 矛盾条。`main/index.ts:770/:779/:258/:1083` 等 `webContents.send` 主动推送，对应 on* 桥。
- **renderer 消费**：`window.electronAPI.*`（`declare global :4707-4719`），如 `AgentView.tsx:1481` 等调 `sendAgentMessage`；`window.reviewAPI`（`:5101-5105`）供 Review 3C11 视图。
- **入向**：无（preload 由 Electron 在页面加载前注入，`main/index.ts:514` 指向 `preload.cjs`）。
- **出向**：`electron`（contextBridge/ipcRenderer/webUtils）、`@profer/shared` 与 `../types` 的通道常量/类型、**类型-only import 主进程 review 模块类型**（`../main/lib/review/review-template-plan-adapter-v3-b1` 等 8 处，`:4818-5068`——仅类型，无运行时调用）。

## 5. 数据 I/O、读写与副作用

- **无磁盘/网络/日志**：0 处 `console.*`、0 处 `window.*` 写、无 fetch/fs。
- **模块级状态**：仅 `_settingsPromise`（`:2119`，in-flight 去重缓存，成功/失败都清空 `:2535`）。
- **副作用**：`exposeInMainWorld` ×3（`:4705/:4738/:5099`）；`ipcRenderer` 监听器注册（79 处，生命周期由 renderer disposer 控制）。

## 6. 分支、失败、取消与恢复

- **无 try/catch**：invoke 异常以 rejected Promise 冒泡给 renderer；`sendSync` 异常直接抛在 renderer。
- **无取消 API**：唯一"取消"语义是 `cancelFileSearch:3421`/`cancelInstallerDownload:2662` 等业务通道本身。
- **失败恢复**：无（重试责任在 renderer/业务层）。
- 分支极少：`process.isMainFrame`（`:4738/:5099`）、默认参数（§3.1）、`getSettings` 缓存（`:2529-2538`）。`agentPreviewAPI.onRender` 与 `reviewAPI.onImportProgress:4759` 是各自对象内唯一监听器。

## 7. 权限与权威状态

- **preload 不做权限判断**：listener 第一参数（event）全部丢弃，不查 senderFrame；sender 校验在 main（`lib/ipc-sender-guard.ts:22/:30` `assertMainWindowSender`，由 ipc.ts 各 handler 调用——**权限不借旁边 handler**，逐通道以 main 注册处为准）。
- **iframe 隔离**：`agentPreviewAPI`/`reviewAPI` 仅主框架暴露（`:4737` 注释）；`electronAPI` 无此守卫（iframe 亦可得，属既定实现）。
- **reviewAPI 安全模型**（注释 `:4811-5057` 多处）：renderer 只传声明性 `claim`/`actor` 不可伪造，身份与 OS 选择器由 Main 派生；B20 读接口返回 `publicationAllowed:false` 等硬编码 false（`:4850-4856`）。
- **敏感透传**：`decryptApiKey:2310`（`channel:decrypt-key`）与 `getDecryptedFeishuSecret` 等明文密钥出口存在，收口在 main handler 的 sender 校验（本文件无法定其安全性）。

## 8. 修改影响面

- 通道改名需五方同步：常量定义文件（`@profer/shared`/`../types`）→ preload → main `ipc.ts`/各 lib 注册 → renderer 消费点 → **已缓存 preload 兼容**（`agent.ts:2058` 注释明示旧名保留原因）。
- `ElectronAPI` 接口（`:272-2107`）与 `electronAPI` 实现（`:2122-4702`）双份维护，新增桥必须两处加；接口孤儿注释（§10）警示曾有漂移。
- 内联字符串通道（§3.2 36 个）无常量保护，重命名最易漏。
- `_settingsPromise` 语义（in-flight 去重）改动影响启动期并发读设置的行为。
- `main/index.ts` 的 `webContents.send` 通道与 on* 桥一一对应，改任一侧断事件流。

## 9. 测试证据

- **无 preload 自身测试**：全冻结树无测试 import `preload/index` 或驱动 `ipcRenderer`。
- 间接（renderer 侧 mock `window.electronAPI`，不验证桥实现）：
  - `apps/electron/src/renderer/components/agent-skills/global-capability-adapter.test.ts:25`：stub `electronAPI: {...}`；
  - `apps/electron/src/renderer/lib/channel-plan-quota.test.ts:34-46`：注入 `getChannelPlanQuota` mock（延迟后返回 supported）；
  - `apps/electron/scripts/settings-macos-contract.test.ts:53`：断言生成代码含字符串 `window.electronAPI.getAutoLaunch().then`（契约字符串检查）。
- 未覆盖：834 个 invoke 的参数/返回一致性、79 个订阅的 disposer、sendSync 时序、isMainFrame 守卫、接口与实现一致性。
- `NOT_RUN`：本轮未执行测试/typecheck/build/GUI/网络。

## 10. 已证实 / 推断 / 未知（含现存实现矛盾，照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `ElectronAPI`；3 对象 3 次 exposeInMainWorld | 已证实 | `:272`、`:4705/:4738/:5099` |
| 834 invoke / 79 on / 6 send / 2 sendSync / 1 off / 1 webUtils（子串计数） | 已证实 | `grep -o` 计数 |
| 零运行时校验/try/catch/sender 检查/日志 | 已证实 | 全文检索 |
| 无重复订阅防护，on* 返回 disposer | 已证实 | §3.1 模式逐条 |
| `getSettings` in-flight 去重缓存 | 已证实 | `:2119-2120`、`:2529-2538` |
| `updateSettingsSync`/`saveScratchPadSync` 为 sendSync | 已证实 | `:2544-2546`、`:2628-2630` |
| **矛盾①**：接口孤儿注释——`:494` "发送消息（触发 AI 流式响应）"、`:495` 资料引用、`:497` "中止生成"、`:538` "生成对话标题" 无对应成员（原始字节核实非显示遮蔽）；`grep sendMessage/abortGeneration` 全文件 0 命中 | 已证实 | `:494-498`、`:538`；grep |
| **矛盾②**：`CHAT_IPC_CHANNELS.SEND_MESSAGE='chat:send-message'`（`chat.ts:545`）在 `apps/electron/src` 无 handler/桥/消费者（检索 0 命中）；实际发送走 `agent:send-message`（`sendAgentMessage:2904`） | 已证实 | 全树检索 |
| **矛盾③**：`CLEAR_COMPLETION_STATE` 键值不符（值 `agent:confirm-working-done`，`:2843`），`agent.ts:2058` 注释明示"值保留旧名以兼容已缓存的 preload" | 已证实 | `:2842-2844`、`agent.ts:2058` |
| **矛盾④**：`PET_TOUR_FILL` 同一通道字符串兼作 invoke（`petTourFill:4613`）与事件订阅（`onPetTourFill:4619`） | 已证实 | `:4613`、`:4619` |
| **矛盾⑤**：`reviewAPI.openAggregateV2:5080` 与 `getAggregateV2:4874` 重复封装同通道 `GET_AGGREGATE_V2` | 已证实 | `:4874`、`:5080` |
| 36 个内联字符串通道与常量区并存 | 已证实 | §3.2 |
| `globalSkill.save` 空串兜底 `workspaceSlug ?? ''` | 已证实 | `:4046`（原始字节核对） |
| 通道字符串值的键值派生规则/例外（AGENT 17 例外、CSLAB 2、REVIEW 前缀不互推） | 已证实 | 常量定义文件（`agent.ts:2022-2414` 等） |
| 内联字符串与 main 注册名逐字一致性 | 未知 | 仅核了 preload 侧字节与抽查（如 `ipc.ts:3842`） |
| `as Promise<T>` 与 handler 实际返回的一致性 | 未知 | main 侧未逐条核 |
| 真实运行时 sendSync 阻塞表现/订阅泄漏 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 + 3 暴露对象 + 2 declare global | §2 | `:272`、`:4705-5105` | covered |
| 接口层 15 域分组 | §2 | `:272-2107` | covered |
| 方向/封装/订阅模式/默认值 | §3.1 | 全文件 | covered |
| 常量映射 + 36 内联通道 | §3.2 | `:9-267` 等 | covered |
| 核心域逐通道表 | §3.3 | `:2123-3505` | covered |
| 其余 ~800 成员行号分组定位 | §3.3 尾注 | `:2732-5096` | covered（定位性） |
| Main/renderer 边界 | §4 | 跨文件 | covered |
| 副作用/状态 | §5 | `:2119` | covered |
| 失败/取消 | §6 | — | covered |
| 权限/iframe/安全模型 | §7 | `:4737-4738`、`:4811+` | covered |
| 影响面 | §8 | 跨文件 | covered |
| 测试缺口 | §9 | 3 间接 | covered |
| 5 个现存矛盾 | §10 | 各行 | covered |
| main 注册逐字一致/运行时行为 | §10 | — | unknown |
