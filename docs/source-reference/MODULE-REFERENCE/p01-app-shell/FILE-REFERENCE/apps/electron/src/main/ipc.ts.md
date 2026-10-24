---
path: apps/electron/src/main/ipc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 691ae29c3cc881dee4dc1d2d31544d8b8eb98e01
sha256: cdd428a90cce993183cd6f52bdccdad225815544801ddbc7a2470dd6e7c6dd88
lines: 8114
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/ipc.ts

## 1. 结论与边界

一句话职责：Electron 主进程的**唯一集中式 IPC 总表**——`registerIpcHandlers()` 在此一次性注册渲染进程（及少量其它窗口）可调用的 589 个 `ipcMain.handle`/`ipcMain.on` 注册点（`ipcMain.handle` 584 + `ipcMain.on` 5，行号见 §3 矩阵），并完成大量模块级辅助函数（路径授权、默认应用探测、FS 错误规整、Goal 服务装配等）与注册期副作用（定时归档、启动清理、事件桥接、委托注册 review/cslab/longterm 子域）。

运行时行为文件（非纯类型/配置）。本文件自身几乎不持久化业务数据，主要工作是：参数校验、权限/路径守卫、把请求转发给 `./lib/**` 各服务（约 60 个导入模块，`ipc.ts:18-454`）、把结果广播给窗口。

边界（不做/不含）：
- 不含 review、CSLab、长期记忆三个子域的通道实现：`registerReviewIpc()`（`ipc.ts:6220`）、`registerCsLabIpc()`（`ipc.ts:6223`）、`registerLongTermMemoryIpc()`（`ipc.ts:6226`）只是**委托注册点**，其实现分别在 `apps/electron/src/main/lib/review/review-ipc.ts`、`lib/cslab/`、`lib/longterm-memory/longterm-memory-ipc.ts`（本手册不展开其内部通道，以各自主手册为准）。
- 不含渲染端调用实现：`apps/electron/src/preload/index.ts`（5105 行）与 renderer 侧只是**入向调用者**（通道常量），未在本批深读。
- 不含下层服务行为保证：`channel-manager`、`agent-service`、`agent-session-manager`、`conversation-manager`、`planning-manager`、`team-*`、`*-bridge-manager` 等的内部读写/网络/锁语义属各自文件；本手册中“透传 X”只证明本层调用点与参数形状，不证明 X 的行为（标注为边界/推断）。
- 不画理想架构：全部按 05fb 冻结树实际实现表述；现存实现矛盾照实记录（§10）。

## 2. 导出与关键符号

`export` 逐条核对：本文件共 **5 个导出，全部为函数；0 个导出类型、0 个导出常量**（全文件 `^export` 仅 5 行：`ipc.ts:506,1284,1297,1318,1322`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `stopAllGoalsForProcessExit` | 导出函数 | `ipc.ts:506` | `(): void` | 进程退出前停全部 Goal 并保存状态；仅调用 `goalSessionService.stopAll()`（`ipc.ts:507`）。生产调用者 `apps/electron/src/main/index.ts:1228` |
| `resolveAppIconPath` | 导出函数 | `ipc.ts:1284` | `(variantId: string): string \| null` | 解析图标文件：`default`→`<resources>/icon.png`，否则 `<resources>/profer-logos/profer-<variantId>.png`（`ipc.ts:1285-1289`）。调用者：`index.ts:981-984`（Dock 图标）、`ipc.ts:2557`（APP_ICON SET handler） |
| `setIpcMainWindowGetter` | 导出函数 | `ipc.ts:1297` | `(getter: MainWindowGetter): void` | 注入主窗口 getter（默认 `getMainWindow`，`ipc.ts:1295`）。**冻结树内无调用者**（检索：全仓 `*.ts` grep `setIpcMainWindowGetter`，仅定义处 `ipc.ts:1297`；注释称“测试可注入”，当前测试也未用） |
| `setRendererReadyHandler` | 导出函数 | `ipc.ts:1318` | `(handler: (() => void) \| null): void` | 存回调，供 RENDERER_READY 通道触发。调用者 `index.ts:189,646`（原生启动页退场） |
| `registerIpcHandlers` | 导出函数 | `ipc.ts:1322` | `(): void` | 唯一注册入口；幂等守卫 `_ipcHandlersRegistered`（`ipc.ts:1292,1326-1330`）。调用者 `index.ts:945`（正常启动）、`index.ts:1208`（启动失败降级路径） |

### 2.1 关键内部函数（标注“内部”）

| 符号 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- |
| `realpathOrResolve`（内部） | `ipc.ts:523` | `(path: string): string` | `realpathSync(resolve())`，失败退化为 `resolve()`（`ipc.ts:524-528`） |
| `getAuthorizedRoots`（内部） | `ipc.ts:531` | `(options?: FileAccessOptions): string[]` | 授权根：agent-workspaces 根 + `tmpdir()/profer-preview` + 用户常用目录 Desktop/Documents/Downloads/Pictures/Videos（`ipc.ts:532-548`，**不含 homedir 本身**，防 `~/.ssh` 类）+ 会话 attachedDirectories/attachedFiles（`ipc.ts:552-559`）+ 工作区 files 目录/附加目录/附加文件（`ipc.ts:560-574`） |
| `isUnderRoot`（内部） | `ipc.ts:579` | `(resolvedPath, root): boolean` | realpath 后相等或 `root + sep` 前缀（`ipc.ts:580-581`） |
| `isResolvedPathInsideRoot`（内部） | `ipc.ts:584` | `(targetPath, root): boolean` | `relative()` 判定，拒 `..` 与绝对逃逸（`ipc.ts:585-586`） |
| `assertInsideAgentWorkspaces`（内部） | `ipc.ts:589` | `(targetPath: string): void` | 写路径专用：`isUnsafeAgentWorkspaceMutationPath` 命中抛“审核内部路径不可操作”（`ipc.ts:590`）；越界抛“访问路径超出 Agent 工作区范围”（`ipc.ts:591-594`） |
| `RM_QUERY_SCRIPT`（内部常量） | `ipc.ts:602-653` | PowerShell 源 | Windows Restart Manager P/Invoke 查询占用进程（`ipc.ts:597-601` 注释） |
| `findLockingProcesses`（内部） | `ipc.ts:656` | `(filePath: string): Promise<string[]>` | `powershell.exe -EncodedCommand`（UTF-16LE Base64，`ipc.ts:662-663`），路径经环境变量 `PROFER_QUERY_PATH` 传入（`ipc.ts:668`）；3s 超时兜底 `[]`（`ipc.ts:660`）；spawn/进程错误均 `[]`（`ipc.ts:671-674,679`） |
| `toFsErrorMessage`（内部） | `ipc.ts:697` | `(err, action: '删除'\|'移入回收站'\|'重命名', filePath?): Promise<string>` | EPERM/EBUSY/EACCES/ENOTEMPTY→占用进程名文案（`ipc.ts:703-713`）；ENOENT→“文件或文件夹已不存在”（`ipc.ts:715-717`）；message 含 aborted/cancel→“操作被中止”或占用文案（`ipc.ts:719-729`）；其余→`无法${action}`（`ipc.ts:730`）。在主进程端转文案的原因见 `ipc.ts:692-696` 注释（IPC 序列化乱码） |
| `parseHttpUrl`（内部） | `ipc.ts:733` | `(rawUrl: string): string \| null` | 仅 http/https（`ipc.ts:736`）；SSRF 防护拒绝 localhost/127.0.0.1/0.0.0.0/[::1]/[::]/192.168.*/10.*/172.16-31.*/169.254.*/*.local（`ipc.ts:738-753`） |
| `isPathAllowed`（内部） | `ipc.ts:760` | `(filePath, options?): boolean` | **deny-by-default**：无 `FileAccessOptions` 直接拒（`ipc.ts:765-768`）；`isReviewPrivateDesktopPath` 拒（`ipc.ts:761`）；realpath 后仅接受 `getAuthorizedRoots` 内（`ipc.ts:769-779`）；无“有 sessionId 即放行”的 fallback（`ipc.ts:781-783`） |
| `isPreviewPathAllowed`（内部） | `ipc.ts:795` | `(filePath, options?): boolean` | 只读预览边界：授权根内放行，根外退化到 `isReadOnlyPreviewPathAllowed`（`ipc.ts:797-798`；策略实现在 `lib/preview-path-policy.ts:110`，本批未深读其内部） |
| `normalizeFileAccessOptions`（内部） | `ipc.ts:801` | `(value?: FileAccessOptions \| string[]): FileAccessOptions \| undefined` | 形状清洗：sessionId/workspaceSlug 字符串、candidateBasePaths 字符串数组、preflight 布尔（`ipc.ts:802-810`）；数组/非对象→undefined |
| `getFileSearchRoots`（内部） | `ipc.ts:815` | `(sessionId: string): string[]` | 搜索根＝会话工作目录 + workspace files 目录 + 工作区附加目录 + 会话附加目录（`ipc.ts:832-839`）；未绑定工作区回退 slug `'default'`（`ipc.ts:833`）；**不含整个 workspace 根**（`ipc.ts:835` 注释） |
| `getWorkspaceSlugsForAccess`（内部） | `ipc.ts:843` | `(options?): string[]` | sessionId→workspace slug ∪ options.workspaceSlug（`ipc.ts:844-855`） |
| `getAllowedCandidateBasePaths`（内部） | `ipc.ts:858` | `(options?): string[] \| undefined` | 过滤掉 `isPathAllowed` 不通过的候选根；空→undefined（`ipc.ts:859-860`） |
| `getAccessRootMainRepo`（内部） | `ipc.ts:863` | `(root: string): Promise<string \| null>` | 文件取 dirname 后 `getMainRepoRoot`（`ipc.ts:864-872`） |
| `ensurePathAllowed`（内部） | `ipc.ts:875` | `(filePath, options?): boolean` | `isPathAllowed` + 拒绝日志（`ipc.ts:876-878`） |
| `ensurePathAllowedWithWorktree`（内部） | `ipc.ts:888` | `(filePath, options?): Promise<boolean>` | 额外放行“主仓库已被授权的 worktree”：`getMainRepoRoot(filePath)` 回溯主仓（`ipc.ts:890-891`），与各授权根的主仓（`ipc.ts:893-899`）及工作区 worktree 仓库清单（`ipc.ts:900-912`）比对（`normalizePathForCompare`+realpath） |
| `getBundledResourcesDir`（内部） | `ipc.ts:932` | `(): string` | 打包态 `process.resourcesPath`，开发态 `__dirname/resources`（`ipc.ts:933`） |
| `extOf`（内部） | `ipc.ts:942` | `(filePath: string): string` | 末段后缀小写（`ipc.ts:943-945`） |
| `getAppIconDataUrl`（内部） | `ipc.ts:948` | `(appPath: string): Promise<string>` | macOS `.app` 先 `getMacAppIconViaSips`（`ipc.ts:952-955`，防 Electron `.icns` resize 崩溃，`ipc.ts:949-951` 注释）；否则 `app.getFileIcon`，空→`''`（`ipc.ts:957-959`） |
| `getMacAppIconViaSips`（内部） | `ipc.ts:962` | `(appPath: string): Promise<string>` | PlistBuddy 取 `CFBundleIconFile`（`ipc.ts:972`）；候选 .icns 列表（`ipc.ts:975-978`）；`sips -Z 64` 转 PNG→dataURL（`ipc.ts:984-987`）；tmp 产物 finally 清理（`ipc.ts:988-990`） |
| `runCmd`（内部） | `ipc.ts:994` | `(bin, args, opts?): Promise<{status: number\|null; stdout: string}>` | 不经 shell 防注入（`ipc.ts:993` 注释）；默认 4s 超时 SIGKILL（`ipc.ts:1000,1013-1016`）；error/close 均 settle（`ipc.ts:1017-1018`） |
| `parseWindowsRegistryValue`（内部） | `ipc.ts:1029` | `(stdout: string): string` | REG_* 行取值（`ipc.ts:1030-1034`） |
| `expandWindowsEnvPath`（内部） | `ipc.ts:1037` | `(filePath: string): string` | `%VAR%` 展开（大小写不敏感匹配 `process.env`，`ipc.ts:1038-1041`） |
| `parseWindowsExecutablePath`（内部） | `ipc.ts:1044` | `(command: string): string` | 从 open command 提取 `.exe` 路径（`ipc.ts:1045-1046`） |
| `isSafeWindowsProgId`（内部） | `ipc.ts:1049` | `(progId: string): boolean` | `/^[a-zA-Z0-9_.+-]+$/`（`ipc.ts:1050`） |
| `getWindowsDefaultAppCommand`（内部） | `ipc.ts:1053` | `(progId): Promise<string>` | `reg query HKCR\<progId>\shell\open\command /ve`，fallback `cmd /c ftype`（`ipc.ts:1056-1065`） |
| `getWindowsDefaultAppInfo`（内部） | `ipc.ts:1068` | `(filePath): Promise<{appPath; appName; isUwp?}\|null>` | ext 严格校验 `^\.[a-zA-Z0-9]+$` 防命令链（`ipc.ts:1070-1074`）；四级 fallback：UserChoice ProgId（`ipc.ts:1076-1083`）→`assoc`（`ipc.ts:1085-1089`）→OpenWithList MRU（`ipc.ts:1091-1119`）→OpenWithProgids（`ipc.ts:1121-1136`）；UWP `AppX*` 走 ApplicationName/AppUserModelId（`ipc.ts:1144-1162`）；命令解析失败再走 HKCR 默认值 + App Paths（`ipc.ts:1168-1192`） |
| `getDefaultAppInfoForFile`（内部） | `ipc.ts:1198` | `(filePath, _options?): Promise<DefaultAppInfo\|null>` | 按 `platform:ext` 缓存（含 null 负缓存，`ipc.ts:940,1205-1206,1276-1279`）；darwin=swift NSWorkspace（`ipc.ts:1211-1232`）、win32=注册表链（`ipc.ts:1233-1238`）、其它=xdg-mime + .desktop 解析（`ipc.ts:1239-1259`）；**图标拿不到也返回 null 并负缓存**（`ipc.ts:1267-1269`） |
| `assertSensitiveAgentIpcSender`（内部） | `ipc.ts:1301` | `(event): void` | 转 `assertTrustedAgentSender(event, mainWindowGetter)`（`ipc.ts:1302`；实现在 `lib/ipc-sender-guard.ts:55-59`：主窗口（`ipc-sender-guard.ts:22-27`）或登记过的可信次级窗口 WeakSet（`ipc-sender-guard.ts:34-52`），否则抛“仅允许主窗口或科学助理窗口调用此 Agent IPC”） |
| `broadcastAgentWorkspacesChanged`（内部） | `ipc.ts:1310` | `(): void` | 向所有未销毁窗口发 `AGENT_IPC_CHANNELS.WORKSPACES_CHANGED`（`ipc.ts:1311-1315`） |

### 2.2 `registerIpcHandlers` 内部闭包（关键者）

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `broadcastSkinChanged` | `ipc.ts:2137-2142` | 皮肤变化广播，**排除发起窗口**（`ipc.ts:2139`），携带 deletedId |
| `assertMainRenderer` | `ipc.ts:2894-2901` | 受管浏览器仅主窗口：主窗口/webContents 销毁或 `webContents.id !== senderId` 抛“仅主窗口可以操作受管浏览器。”（`ipc.ts:2896-2900`） |
| `assertBrowserSessionAccess` | `ipc.ts:2902-2912` | `assertMainRenderer` + `assertOrdinaryAgentSession`（`lib/agent-session-manager.ts:660`，审核归属会话拒绝）+ 会话存在性（`ipc.ts:2905-2906`）+ `browserController.configureSession`（profileKey/executionSource，`ipc.ts:2908-2911`） |
| `runYanhuCdp` | `ipc.ts:6395-6401` | CDP 任务统一包成 `YanhuCdpResult`，错误降级不抛 IPC 层（`ipc.ts:6398-6400`） |
| `fetchServerReleases` | `ipc.ts:5674-5680` | 拉 `RELEASES_JSON_URL`（`ipc.ts:5670-5671`，可用 `PROFER_UPDATE_FEED_URL` 覆盖，默认 `https://updates.profer.cn/releases.json`）；非 2xx/非数组抛错 |
| `syncTeamWorkspacesToSidebar` | `ipc.ts:7359-7373` | 拉团队工作区→`syncTeamWorkspacesToIndex`→广播 `'team:workspaces-synced'`（`ipc.ts:7368`）；失败仅日志（`ipc.ts:7370-7371`） |
| `runAutoArchive` | `ipc.ts:6642-6663` | `archiveAfterDays`（默认 7，`ipc.ts:6645`）>0 时归档对话+Agent 会话并广播 `ARCHIVED_UNREAD_CHANGED`（`ipc.ts:6647-6657`） |
| `runStartupCleanup` | `ipc.ts:6738-6761` | `autoCleanupTempOnStart !== false` 清临时文件（`ipc.ts:6741-6746`）；`autoCleanupArchivedDays > 0` 清归档数据（`ipc.ts:6747-6757`） |
| Planning 校验器组 | `ipc.ts:6887-6913,7069-7072` | `isPlanningTitle`（1-500 字）、`isPlanningTimestamp`（有限正数）、`isTodoPriority`/`isTodoStatus`、`parseTodoListQuery`、`parseCalendarEventListQuery`（from>to 拒）、`isPlanningShortName`（≤100）、`isPlanningGroupScope`、`isOptionalColor` |
| Automation 校验器组 | `ipc.ts:7181-7255` | `isNonEmptyString`/`isNonBlankString`/`isFiniteInt`/`validScheduleType`/`validPermissionMode`/`validAutomationNotificationTrigger`/`validTimeOfDay`（HH:MM）/`validTimeOfDayArr`（≤10）/`validDayOfWeekArr`（0-6，≤7）/`validDayOfMonthArr`（1-31，≤31）/`validateAutomationNotificationTargets`（≤5、type=feishu、botId/chatId 必填，`ipc.ts:7192-7208`）/`validateAutomationFields`（`ipc.ts:7229-7255`）。动机注释：防渲染层被 XSS 污染后写坏 `~/.proma/automations.json`（`ipc.ts:7179-7180`） |
| `SEARCH_WORKSPACE_FILES` 内部闭包 | `ipc.ts:5496-5613` | `scan`（深度≤10、跳过 node_modules/.git 等，`ipc.ts:5486-5487,5504-5509`）、`addAttachedPath`、`sortGroup`（前缀匹配>目录>路径短，`ipc.ts:5581-5590`）、`matchEntries`（前缀/包含/子序列，`ipc.ts:5592-5604`）、`sortDirsFirst` |
| `PUBLISH` 内 `uploadDir` | `ipc.ts:7728-7737` | 递归上传技能目录（跳过 SKILL.md 已单独传，`ipc.ts:7732`） |
| `LIST_TEAM_SKILLS` 内 `parseFrontmatter` | `ipc.ts:7778-7787` | 简易 `---` 块键值解析 |
| `CHECK_FOR_UPDATES` 内 `compareVersions` | `ipc.ts:7927-7934` | 三段数字 semver 简易比较 |

### 2.3 模块级状态（内部）

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `HIDDEN_FS_ENTRIES` | `ipc.ts:457` | `Set{'.DS_Store','Thumbs.db'}` | 文件浏览器隐藏项 |
| `agentSessionDeletionCoordinator` | `ipc.ts:460` | `AgentSessionDeletionCoordinator` 实例 | 同会话并发删除合并为 stop-and-wait 生命周期（`ipc.ts:459` 注释） |
| `GOAL_STORE_PATH` | `ipc.ts:462` | `() => join(app.getPath('userData'),'goals.json')` | Goal 持久化路径 |
| `goalSessionService` | `ipc.ts:464-499` | `GoalSessionService` 实例 | run=`runAgent(input, mainWindow.webContents)`（`ipc.ts:476-480`，主窗口不可用抛“Profer 主窗口不可用，Goal 已停止”）；permissionError 检查 plan 模式（`ipc.ts:467-475`，`resolveEffectivePermissionMode`）；read/save/archive/history 挂 goals.json（`ipc.ts:482-485`）；受阻建/更新 Todo（`ipc.ts:488-494`）；publish 发 `GOAL_EVENT`（`ipc.ts:495-497`） |
| `KNOWN_EDITORS` | `ipc.ts:511-514` | `string[]`（9 个） | macOS 编辑器白名单（`ipc.ts:510` 注释） |
| `defaultAppCache` | `ipc.ts:940` | `Map<string, DefaultAppInfo \| null>` | 按扩展名缓存（含负缓存），进程级不失效（`ipc.ts:936-939` 注释） |
| `activeFileSearches` | `ipc.ts:813` | `Map<string, AbortController>` | 文件候选搜索取消表 |
| `_ipcHandlersRegistered` | `ipc.ts:1292` | `boolean` | 注册幂等标志（理由见 `ipc.ts:1323-1325`：`ipcMain.on`/`nativeTheme.on`/`setInterval` 不去重） |
| `mainWindowGetter` | `ipc.ts:1295` | `MainWindowGetter` | 默认 `getMainWindow`（`lib/main-window-state`） |
| `rendererReadyHandler` | `ipc.ts:1307` | `(() => void) \| null` | 首屏完成回调 |
| `ALLOWED_AUDIO_EXTENSIONS` | `ipc.ts:2370` | `Set`（7 种） | 自定义音效白名单 |
| `RELEASES_JSON_URL` | `ipc.ts:5670-5671` | `string` | 商业版 releases 地址 |
| `activeRegisterAbort` | `ipc.ts:5936` | `AbortController \| null` | 飞书扫码注册单例流程 |
| `CDUT_CACHE_PATHS` | `ipc.ts:6282-6285` | `Record<CdutDomainCacheName, () => string>` | schedule/grades 离线缓存路径函数 |

## 3. 内部逻辑与关键流程

### 3.0 `registerIpcHandlers` 总体结构（`ipc.ts:1322-8114`）

执行顺序：幂等守卫（`ipc.ts:1326-1330`，重复调用直接返回）→ `restoreGoalStatesOnce()`（`ipc.ts:1332`，恢复 goals.json，失败仅日志 `ipc.ts:502`）→ 注册 runtime 进程表变更广播（`ipc.ts:1334-1340`）→ 按域顺序注册 589 个通道（§3.2-3.4 矩阵）→ 注册期副作用（§3.1）。

**注册期副作用清单**（发生在 `registerIpcHandlers()` 调用当刻，非 IPC 调用时）：

| 行 | 副作用 |
| --- | --- |
| `ipc.ts:1332` | `restoreGoalStatesOnce()`：恢复 Goal 状态 |
| `ipc.ts:1334-1340` | `onRuntimeProcessRegistryChanged` 回调：向所有窗口发 `RUNTIME_PROCESSES_CHANGED` |
| `ipc.ts:2358-2365` | `nativeTheme.on('updated')`：系统主题变化 → `updateWindowFrameAppearance` + `ON_SYSTEM_THEME_CHANGED` 广播 |
| `ipc.ts:3490` | `ensureDefaultWorkspace()`：确保默认工作区存在 |
| `ipc.ts:5735-5744` | `__setLarkLoginEventHandler` / `__setLarkMcpLoginEventHandler`：Lark 登录事件转发 `LOGIN_EVENT`/`MCP_LOGIN_EVENT` 到所有窗口 |
| `ipc.ts:6220/6223/6226` | `registerReviewIpc()` / `registerCsLabIpc()` / `registerLongTermMemoryIpc()`：委托注册三个子域通道（实现不在本文件） |
| `ipc.ts:6630-6636` | `cdutAuthManager.setStatusCallback`：特区账户状态变化广播 `CDUT_ZONE STATUS_CHANGED` |
| `ipc.ts:6639` | `void cdutAuthManager.resetOnStartup()`：启动复位未登录并清 CDUT 分区 Cookie（注释 `ipc.ts:6638`） |
| `ipc.ts:6665-6666` | `runAutoArchive()` 立即执行 + `setInterval` 每 24h（**无 clearInterval**，与幂等守卫配套防泄漏） |
| `ipc.ts:6669-6674` | `cleanupStaleAttachedPaths()` + `cleanupStaleWorkspaceAttachedPaths()`：清理失效附加路径，失败仅日志 |
| `ipc.ts:6762` | `runStartupCleanup()`：启动清理临时/归档数据 |
| `ipc.ts:7650-7652` | `sseClient.onEvent` → `teamNotificationService.handleSSEEvent` |
| `ipc.ts:7655-7660` | `teamNotificationService.setCurrentUserId`（按当前团队登录态） |

**主进程→渲染进程广播出口汇总**（调用点行号）：`WORKSPACES_CHANGED`（`ipc.ts:1313`）、`RUNTIME_PROCESSES_CHANGED`（`ipc.ts:1337`）、`GOAL_EVENT`（`ipc.ts:496`）、`ON_SKINS_CHANGED`（`ipc.ts:2140`）、`ON_DEVELOPER_SETTINGS_CHANGED`（`ipc.ts:2214,2316`）、`ON_THEME_SETTINGS_CHANGED`（`ipc.ts:2229`，跳过发起者）、`ON_SYSTEM_THEME_CHANGED`（`ipc.ts:2363`）、`LARK LOGIN_EVENT/MCP_LOGIN_EVENT`（`ipc.ts:5737,5742`）、`FEISHU REGISTER_APP_QRCODE/REGISTER_APP_STATUS`（`ipc.ts:5964,5969,5982`，定向 `event.sender`）、`CDUT STATUS_CHANGED`（`ipc.ts:6633`）、`GENERATE_PROGRESS`（`ipc.ts:6609`，定向 `event.sender`）、`ARCHIVED_UNREAD_CHANGED`（`ipc.ts:6655`）、`PLANNING TODO_AGENT_SESSION_READY`（`ipc.ts:6989`）、`DESKTOP_NOTIFICATION CLICKED`（`ipc.ts:8104`）、`'team:workspaces-synced'`（`ipc.ts:7368`）、`permission_resolved`/`ask_user_resolved`/`exit_plan_mode_resolved`/`permission_mode_changed` 经 `emitSessionStreamEvent`（`ipc.ts:4024,4315,4340,4366`）。

### 3.1 参数校验与守卫模式（矩阵“守卫”列的语义）

- **无 sender 校验**：矩阵未标注守卫的通道，`event`/`_event` 被忽略或仅取 `event.sender` 做窗口定位，任何渲染进程均可调（照实记录，见 §7）。
- **assertSensitive**：`assertSensitiveAgentIpcSender(event)`（`ipc.ts:1301`），仅主窗口/可信次级窗口。
- **主窗口浏览器族**：`assertMainRenderer` / `assertBrowserSessionAccess`（`ipc.ts:2894-2912`）。
- **路径守卫**：`isPathAllowed`（deny-by-default 写路径）、`isPreviewPathAllowed`（只读预览）、`assertInsideAgentWorkspaces`（工作区写操作）、`ensurePathAllowedWithWorktree`（git 族）、`isUnsafeAgentWorkspaceMutationPath`（审核内部路径禁操作，`lib/review-private-file-access.ts:41`）。
- **普通会话**：`assertOrdinaryAgentSession(id)`（`lib/agent-session-manager.ts:660`；拒绝审核归属会话，错误文案“内部审核会话不可通过普通 Agent 入口访问”——`goal-ipc-routing.test.ts:24` 证实该语义被测试依赖）。
- **待决请求**：`assertOrdinaryPendingRequestId(requestId, pendingList)`（`lib/agent-ordinary-pending-access.ts:16`）。
- **Skill slug**：`assertSafeSkillSegment(value, fieldName)`（`lib/skill-path-security.ts:17`）。
- **乐观锁**：`expectedRevision` 与 `session.revision` 比对，冲突抛 `'REVISION_CONFLICT: 会话状态已更新，请刷新后重试'`（`ipc.ts:2761,2780,4066`）。

### 3.2 IPC handler/注册点矩阵（589 个＝`ipcMain.handle` 584＋`ipcMain.on` 5，逐条；行=注册行号）

> 列说明：`通道`为源码常量名（字面量值在 `@profer/shared` 各 `*_IPC_CHANNELS`，如 `IPC_CHANNELS.GET_RUNTIME_STATUS`=`'runtime:get-status'`，`packages/shared/src/types/runtime.ts:362-408`，本批仅抽样核对该文件未全读）；`参数/返回`给出 handler 签名要点；`守卫`见 §3.1 缩写；`副作用/错误`含写盘、广播、抛错点。标注“透传”表示本层仅形状校验后调用一个 `./lib/**` 函数（下层行为未深读=边界）。

#### A. 运行时 / Git / 预览 / 系统（`ipc.ts:1347-1628`，19 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 1347 | SETTINGS.RENDERER_READY (`on`) | 无 → void | 无 | 触发 `rendererReadyHandler?.()`（启动页退场） |
| 1352 | IPC.GET_RUNTIME_STATUS | 无 → `RuntimeStatus\|null` | 无 | 透传 `getRuntimeStatus`（`ipc.ts:1355`） |
| 1360 | IPC.REINIT_RUNTIME | 无 → `RuntimeStatus` | 无 | 透传 `reinitializeRuntime`（重探测 Git/Node，注释 `ipc.ts:1359`） |
| 1368 | IPC.GET_GIT_REPO_STATUS | `dirPath` → `GitRepoStatus\|null` | 无 | 非法 dirPath 返 null（`ipc.ts:1371-1374`）；透传 `getGitRepoStatus` |
| 1381 | IPC.GET_UNSTAGED_CHANGES | `dirPath, sessionPath?, workspaceFilesPath?, extraPaths?, sessionId?` → 变更清单 | `ensurePathAllowed(dirPath)`；三个附属路径逐个 `isPathAllowed` 过滤（`ipc.ts:1392-1394`） | 拒绝时返回空结构（`ipc.ts:1386,1390`） |
| 1400 | IPC.GET_FILE_DIFF | `GetFileDiffInput` → `string` | `ensurePathAllowedWithWorktree(dirPath & gitRoot)`（`ipc.ts:1409`） | 拒绝返 `''` |
| 1415 | IPC.GET_UNTRACKED_CONTENT | 同上 → `string` | 同 1400（`ipc.ts:1424`） | 拒绝返 `''` |
| 1430 | IPC.REVERT_FILE | `RevertFileInput` → void | 同 1400（`ipc.ts:1439`） | **git 突变**：`revertFile` 后 `invalidateGitDiffCache(filePath)`（`ipc.ts:1440-1442`） |
| 1447 | IPC.INVALIDATE_GIT_DIFF_CACHE | `changedPath?` → void | 无 | 透传 `invalidateGitDiffCache` |
| 1455 | IPC.GET_DIFF_CONTENTS | `GetFileDiffInput`（含 `baseRef`）→ 新旧内容\|null | 同 1400（`ipc.ts:1464`） | 拒绝返 null |
| 1470 | IPC.LIST_WORKTREES | `repoPath, _sessionId` → 数组 | **显式跳过路径检查**（注释 `ipc.ts:1469`：仅 worktree 元信息） | 非法返 `[]` |
| 1479 | IPC.GET_WORKTREE_CHANGES | `worktreePath, baseBranch, sessionId` → 变更清单 | `ensurePathAllowedWithWorktree`（`ipc.ts:1486`） | 拒绝返空结构 |
| 1494 | IPC.OPEN_DETACHED_PREVIEW | `DetachedPreviewWindowInput` → `string\|null` | 无 sender；形状校验（`ipc.ts:1497-1500`） | 动态 import `detached-preview-window`；`BrowserWindow.fromWebContents(event.sender)` 作父窗（`ipc.ts:1502`） |
| 1508 | IPC.GET_DETACHED_PREVIEW_DATA | `previewId` → 数据\|null | 无 | 动态 import 透传 |
| 1518 | IPC.SCREENSHOT_CAPTURE | `{html,isDark,width?,mode,css?,themeClass?}` → 图 | 无 | 动态 import `screenshot-service`；渲染 PNG（外部行为未深读） |
| 1527 | IPC.OPEN_EXTERNAL | `url` → void | `parseHttpUrl`（http/https + SSRF 拒私网，`ipc.ts:1535`） | `shell.openExternal`；非法静默返回（`ipc.ts:1530-1538`） |
| 1545 | IPC.SYSTEM_OPEN_FILE | `filePath, appName?, access?` → void | `isPreviewPathAllowed`（`ipc.ts:1556`）；macOS `appName` 必须在 `KNOWN_EDITORS`（`ipc.ts:1563-1566`）；非 macOS `confirmExecutableFileOpen`（CVE-2026-96951 防御，`ipc.ts:1573`） | darwin `spawnSync open -a`（`ipc.ts:1567-1570`）；否则 `shell.openPath`（`ipc.ts:1577`）；拒绝/取消静默 warn |
| 1584 | IPC.SCAN_EDITORS | 无 → `EditorApp[]` | 无 | 仅 darwin（`ipc.ts:1587`）；按 `KNOWN_EDITORS` 探测 `/Applications`、`~/Applications`（`ipc.ts:1592-1601`） |
| 1606 | IPC.GET_DEFAULT_APP_FOR_FILE | `filePath, access?` → `DefaultAppInfo\|null` | 有 options 时 `isPreviewPathAllowed`（`ipc.ts:1615`）；**options 缺省不做路径检查** | `expandHomeDirectory` 后走 §2.1 默认应用链；异常返 null（`ipc.ts:1623-1626`） |

#### B. 渠道管理（`ipc.ts:1634-1790`，15 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 1634 | CHANNEL.LIST | 无 → `Channel[]` | 无 | `listChannelsWithBackgroundSync`（本地缓存优先 + 后台同步，注释 `ipc.ts:1632-1633`；`require('./lib/auth-service')` 惰性取 `getTeamAuthWithRefresh` `ipc.ts:1637`）；同步失败仅 warn（`ipc.ts:1643-1645`） |
| 1651 | CHANNEL.GET_OFFICIAL_HEALTH | 无 → `OfficialChannelHealth[]` | 无 | **网络**：`fetch auth.baseUrl/v1/account/channels/health`，Bearer、10s 超时（`ipc.ts:1656-1658`）；无 auth/失败返 `[]` |
| 1667 | CHANNEL.CREATE | `ChannelCreateInput` → `Channel` | 无 | 透传 `createChannel` + `agentCatalogInvalidationPublisher.invalidate('channels')`（`ipc.ts:1672`） |
| 1678 | CHANNEL.UPDATE | `id, ChannelUpdateInput` → `Channel` | 无 | 同上 invalidate（`ipc.ts:1682`） |
| 1688 | CHANNEL.DELETE | `id` → void | 无 | 透传 + invalidate（`ipc.ts:1692`） |
| 1698 | CHANNEL.DECRYPT_KEY | `channelId` → `string` | **商业模式守卫**：`isCommercialMode() && !canSelfConfig()` 抛“商业模式下渠道由服务端统一管理”（`ipc.ts:1702`） | 透传 `decryptApiKey` |
| 1708 | CHANNEL.TEST | `channelId` → `ChannelTestResult` | 无 | 透传 `testChannel` |
| 1716 | CHANNEL.TEST_DIRECT | `FetchModelsInput` → `ChannelTestResult` | 无 | 明文凭证直测（透传） |
| 1724 | CHANNEL.FETCH_MODELS | `FetchModelsInput` → `FetchModelsResult` | 无 | 透传（网络，凭证直传） |
| 1732 | CHANNEL.GET_PLAN_QUOTA | `channelId` → `ChannelPlanQuotaResult` | 无 | 透传 |
| 1740 | CHANNEL.SYNC_FROM_SERVER | `serverBaseUrl, accessToken` → void | 无 | 透传 `syncChannelsFromServer` |
| 1748 | CHANNEL.GET_COMMERCIAL_MODE | 无 → `boolean` | 无 | 透传 `isCommercialMode` |
| 1756 | CHANNEL.GET_ACCOUNT_CAPABILITIES | `force?` → `{commercialMode,canSelfConfig,membershipTier}` | 无 | `force=true` 先 `refreshAuthToken().catch(()=>{})`（`ipc.ts:1762`） |
| 1772 | CHANNEL.GET_BUILD_TARGET | 无 → `'oss'\|'commercial'` | 无 | 透传 `getBuildTarget` |
| 1780 | CHANNEL.XAI_LOGIN | `channelId` → `Channel` | 无 | 渠道须存在且 `provider==='xai'` 否则抛（`ipc.ts:1784`）；`loginXaiOAuth`（外部 OAuth）→ `persistXaiOAuthCredentials`（写 safeStorage，注释 `ipc.ts:1779`）；完成后读不到渠道抛（`ipc.ts:1788`） |

#### C. 对话与附件（`ipc.ts:1796-2110`，29 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 1796 | CHAT.LIST_CONVERSATIONS | `includeArchived?` → `ConversationMeta[]` | 无 | 透传（默认 false） |
| 1804 | CHAT.CREATE_CONVERSATION | `title?, modelId?, channelId?` → meta | 无 | 透传（建对话落盘） |
| 1812 | CHAT.GET_MESSAGES | `id` → `ChatMessage[]` | 无 | 透传 |
| 1820 | CHAT.GET_RECENT_MESSAGES | `id, limit` → `RecentMessagesResult` | 无 | 分页加载（透传） |
| 1828 | CHAT.UPDATE_TITLE | `id, title` → meta | 无 | **定稿锁定**：`updateConversationMeta(id,{title,titleLockedAt:Date.now()})`（`ipc.ts:1831`） |
| 1836 | CHAT.REGENERATE_TITLE | `id, channelId?, modelId?` → meta\|null | 无 | 动态 import `conversation-title-service`（绕过定稿锁） |
| 1845 | CHAT.UPDATE_MODEL | `id, modelId?, channelId?` → meta | 无 | 透传 `updateConversationMeta` |
| 1853 | CHAT.DELETE_CONVERSATION | `id` → void | 无 | 透传 `deleteConversation` |
| 1861 | CHAT.TOGGLE_PIN | `id` → meta | 无 | read-then-write（`ipc.ts:1864-1867`）；不存在抛 `对话不存在: ${id}`；置顶自动取消归档（`ipc.ts:1870-1872`） |
| 1878 | CHAT.TOGGLE_ARCHIVE | `id` → meta | 无 | 同上对称；归档自动取消置顶（`ipc.ts:1887-1889`） |
| 1895 | CHAT.SEARCH_MESSAGES | `query` → 结果 | 无 | 透传 `searchConversationMessages` |
| 1903 | CHAT.GET_TUTORIAL_CONTENT | 无 → `string\|null` | 无 | 透传 |
| 1911 | CHAT.CREATE_WELCOME_CONVERSATION | 无 → meta\|null | 无 | 透传（含教程附件） |
| 1919 | CHAT.DELETE_MESSAGE | `conversationId, messageId` → `ChatMessage[]` | 无 | 透传 |
| 1927 | CHAT.TRUNCATE_MESSAGES_FROM | `conversationId, messageId, preserveFirstMessageAttachments?` → `ChatMessage[]` | 无 | **已废弃仍可用**：warn 提示改用 forkBranchAt+setActivePath（`ipc.ts:1935`），仍执行 `truncateMessagesFrom`（`ipc.ts:1936-1940`） |
| 1945 | CHAT.GET_BRANCH | `conversationId` → `ChatMessage[]` | 无 | 透传 `getConversationBranch` |
| 1953 | CHAT.SET_ACTIVE_PATH | `conversationId, path: string[]` → 分支消息 | 无 | 写激活分支后返回 `getConversationBranch`（`ipc.ts:1956-1957`） |
| 1962 | CHAT.GET_BRANCH_TREE | `conversationId` → 树快照 | 无 | 透传 |
| 1970 | CHAT.FORK_BRANCH_AT | `conversationId, anchorId, payload{role:'user',content,attachments?,knowledgeReferences?}` → `ChatMessage` | 无 | 透传 `forkBranchAt`（重发/编辑重发） |
| 1983 | CHAT.GET_MESSAGE_CONTENT | `conversationId, messageId` → `string\|null` | 无 | 透传 |
| 1991 | CHAT.UPDATE_CONTEXT_DIVIDERS | `conversationId, dividers: string[]` → meta | 无 | 透传 |
| 2001 | CHAT.SAVE_ATTACHMENT | `AttachmentSaveInput` → `AttachmentSaveResult` | 无 | 透传 `saveAttachment`（落盘） |
| 2009 | CHAT.READ_ATTACHMENT | `localPath` → base64 `string` | **本层无路径校验**（边界：`readAttachmentAsBase64` 内部未深读） | 透传 |
| 2017 | CHAT.RESOLVE_IMAGE_URL | `url` → 解析结果 | 无 | 透传 `resolveRemoteImageUrl`（网络） |
| 2025 | CHAT.SAVE_IMAGE_AS | `localPath, defaultFilename` → `boolean` | 无路径校验（读 `localPath` 附件） | `dialog.showSaveDialog`（父窗=`fromWebContents(event.sender)`，`ipc.ts:2032,2037`）；用户取消返 false；`writeFileSync` 写用户所选路径（`ipc.ts:2047-2049`） |
| 2054 | CHAT.SAVE_RESOURCE_FILE_AS | `resourceRelativePath, defaultFilename` → `boolean` | **路径穿越防护**：`fullPath.startsWith(resourcesDir + sep)` 否则抛 `Path traversal not allowed`（`ipc.ts:2065-2068`）；不存在抛 `Resource not found`（`ipc.ts:2069-2071`） | Save As 对话框 + `writeFileSync`（`ipc.ts:2078-2089`） |
| 2094 | CHAT.DELETE_ATTACHMENT | `localPath` → void | 无 | 透传 `deleteAttachment` |
| 2102 | CHAT.OPEN_FILE_DIALOG | 无 → `FileDialogResult` | 无 | 透传 `openFileDialog` |
| 2110 | CHAT.EXTRACT_ATTACHMENT_TEXT | `localPath` → `string` | 无 | 透传 `extractTextFromAttachment` |

#### D. 用户档案 / 皮肤 / 设置（`ipc.ts:2120-2355`，24 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 2120 | USER_PROFILE.GET | 无 → `UserProfile` | 无 | 透传 |
| 2128 | USER_PROFILE.UPDATE | `Partial<UserProfile>` → `UserProfile` | 无 | 透传 `updateUserProfile`（落盘） |
| 2144 | SKIN.GET_SKINS | 无 → 皮肤列表 | 无 | 透传 `scanSkins` |
| 2145 | SKIN.GET_SKIN_CSS | `id` → css\|null | 仅 `typeof id === 'string'`（`ipc.ts:2145`） | 透传 |
| 2146 | SKIN.GET_SKIN_PREVIEW | `id` → 预览\|null | 同上 | 透传 |
| 2147 | SKIN.SELECT_ZIP | 无 → 选择结果 | 无 | 透传 `selectSkinZip`（对话框） |
| 2148 | SKIN.SELECT_FOLDER | 无 → 选择结果 | 无 | 透传 |
| 2149 | SKIN.INSTALL_ZIP | `path, replace` → 结果 | `typeof path === 'string'` 否则 `{ok:false,...'无效 ZIP 路径'}`（`ipc.ts:2150`） | 成功 `broadcastSkinChanged(event.sender.id)`（`ipc.ts:2151`） |
| 2154 | SKIN.INSTALL_FOLDER | `path, replace` → 结果 | 同上（'无效文件夹路径'） | 同上广播 |
| 2159 | SKIN.DELETE_USER_SKIN | `id` → 结果 | `typeof id === 'string'`（'无效皮肤 id'） | 成功广播含 deletedId（`ipc.ts:2161`） |
| 2164 | SKIN.OPEN_USER_FOLDER | 无 | 无 | 透传 `openUserSkinsFolder` |
| 2165 | SKIN.OPEN_TEMPLATE_FOLDER | 无 | 无 | 透传 |
| 2166 | SKIN.REFRESH | 无 → skins | 无 | `invalidateSkinCache` + `scanSkins` + 广播（`ipc.ts:2167-2169`） |
| 2176 | SETTINGS.GET | 无 → `AppSettings` | 无 | 透传 `getSettings` |
| 2184 | SETTINGS.SET_REVIEW_AGENT_AUTO_APPROVAL | `{enabled, grantedBy}` → `AppSettings` | **专用确认通道**（注释 `ipc.ts:2183`：只有 UI 风险确认后写入，Agent 工具不可达） | enable 时写三字段（grantedAt/grantedBy 截 64 字，`ipc.ts:2188-2190`）；disable 清标志 |
| 2196 | SETTINGS.UPDATE | `Partial<AppSettings>` → `AppSettings` | 无 | **剥离** `reviewAgentAutoApproval*` 三字段防未确认改写（`ipc.ts:2199-2200`）；`feishuSessionMirror` 变更→`syncFeishuSyncSleepBlocker`（`ipc.ts:2204-2206`）；开发者设置变更→广播（`ipc.ts:2208-2216`）；主题三键变更→全窗口 `updateWindowFrameAppearance` + `ON_THEME_SETTINGS_CHANGED`（跳过发起者，`ipc.ts:2219-2232`） |
| 2239 | SETTINGS.GET_POCKET_MODE_STATUS | 无 → 状态 | 无 | `getRemoteServiceStatus()`（Token 仅监听后返回，注释 `ipc.ts:2238`） |
| 2245 | SETTINGS.SET_POCKET_MODE_ENABLED | `enabled` → 状态 | `typeof boolean` 否则抛“移动模式开关参数无效”（`ipc.ts:2248`） | 开/关局域网监听 + `updateSettings({pocketModeEnabled})`（`ipc.ts:2249-2259`） |
| 2266 | SETTINGS.SET_POCKET_MODE_PORT | `port` → 状态 | 0=恢复默认；否则须 1024-65535 整数否则抛（`ipc.ts:2270-2276`） | `updateSettings` + `restartRemoteService()`（`ipc.ts:2271-2279`） |
| 2285 | SETTINGS.GET_APK_QR | 无 → `{url,dataUrl,fileName}` | 无 | 动态 import `qrcode` 生成；失败返空 dataUrl（`ipc.ts:2290-2297`）；URL 硬编码 `https://profer.cn/profer-mobile/...apk`（`ipc.ts:2288-2289`） |
| 2302 | SETTINGS.UPDATE_SYNC (`on`) | `Partial<AppSettings>` → `event.returnValue` 布尔 | 无 | 同步版 UPDATE（beforeunload 用，注释 `ipc.ts:2301`）；不剥离 reviewAgentAutoApproval 字段（与 2196 不一致，§10）；异常返 false（`ipc.ts:2320-2322`） |
| 2327 | SETTINGS.GET_SYSTEM_THEME | 无 → `boolean` | 无 | `nativeTheme.shouldUseDarkColors` |
| 2335 | SETTINGS.GET_AUTO_LAUNCH | 无 → `boolean` | 无 | `app.getLoginItemSettings().openAtLogin` |
| 2343 | SETTINGS.SET_AUTO_LAUNCH | `enabled` → void | 无 | `app.setLoginItemSettings`（dev 附 `process.execPath`，`ipc.ts:2346-2350`）+ `updateSettings({autoLaunch})`（`ipc.ts:2352`） |

#### E. 音效 / ScratchPad / 图标 / 环境 / 安装器 / 代理（`ipc.ts:2373-2667`，18 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 2373 | NOTIFICATION_SOUND.ADD | `sourcePath, label` → `CustomNotificationSound` | 扩展名白名单（`ALLOWED_AUDIO_EXTENSIONS`，`ipc.ts:2376-2379`）；文件存在（`ipc.ts:2380-2382`） | `copyFileSync` 到 sounds 目录（随机文件名，`ipc.ts:2386-2389`）+ settings 数组追加（`ipc.ts:2398-2400`） |
| 2408 | NOTIFICATION_SOUND.REMOVE | `id` → `CustomNotificationSound[]` | 无 | 删文件（失败仅 warn，`ipc.ts:2419-2423`）；settings 移除并清理 taskComplete/permissionRequest/exitPlanMode 引用（`ipc.ts:2430-2440`）；id 不存在原样返回（`ipc.ts:2414`） |
| 2448 | NOTIFICATION_SOUND.GET_URL | `fileName` → `string` | 无 | 不存在抛（`ipc.ts:2453-2455`）；`registerProferFilePath` 换 cdut-file:// URL（`ipc.ts:2456`） |
| 2465 | SCRATCH_PAD.LOAD | 无 → `string` | 无 | 读 `getScratchPadPath()`；失败/缺文件返 `''`（`ipc.ts:2470-2475`） |
| 2480 | SCRATCH_PAD.SAVE | `content` → `boolean` | 无 | `writeFile`；失败返 false（`ipc.ts:2485-2490`） |
| 2495 | SCRATCH_PAD.SAVE_SYNC (`on`) | `content` → `event.returnValue` | 无 | `writeFileSync`；失败返 false（`ipc.ts:2499-2504`） |
| 2509 | SCRATCH_PAD.EXPORT | `markdown, dirPath, filename` → `string` 路径 | 无 | filename 空=dirPath 即完整路径模式，自动 mkdir（`ipc.ts:2513-2525`）；`writeFileSync`（`ipc.ts:2526`） |
| 2533 | SCRATCH_PAD.CHOOSE_EXPORT_PATH | `defaultName` → `string\|null` | 无 | Save 对话框（`ipc.ts:2538-2546`）；无聚焦窗口返 null（`ipc.ts:2536-2537`） |
| 2552 | APP_ICON.SET | `variantId` → `boolean` | 无 | `resolveAppIconPath` 存在性（`ipc.ts:2557-2561`）；darwin `app.dock.setIcon`（`ipc.ts:2564-2566`）；`updateSettings({appIconVariant})`（`ipc.ts:2569`）；异常返 false |
| 2581 | DOCK_BADGE.SET_COUNT | `count` → `boolean` | 无 | 透传 `setDockBadgeCount` |
| 2591 | ENVIRONMENT.CHECK | 无 → `EnvironmentCheckResult` | 无 | `checkEnvironment` 后**自动写 settings.lastEnvironmentCheck**（`ipc.ts:2595-2598`） |
| 2605 | INSTALLER.MANIFEST | 无 → `InstallerManifest` | 无 | 透传 `fetchInstallerManifest`（网络） |
| 2612 | INSTALLER.DOWNLOAD | `InstallerDownloadRequest` → `InstallerDownloadResult` | 无 | 无 source 抛“未找到安装包”（`ipc.ts:2617-2619`）；发起窗口已关抛（`ipc.ts:2620-2623`）；`downloadInstaller(source, id:arch, window)`（进度经窗口） |
| 2629 | INSTALLER.CANCEL | `key` → `boolean` | 无 | 透传 `cancelInstallerDownload`（取消） |
| 2636 | INSTALLER.LAUNCH | `filePath` → void | 无 | 透传 `launchInstaller` |
| 2646 | PROXY.GET_SETTINGS | 无 → `ProxyConfig` | 无 | 透传 |
| 2654 | PROXY.UPDATE_SETTINGS | `ProxyConfig` → void | 无 | `saveProxySettings`（落盘） |
| 2662 | PROXY.DETECT_SYSTEM | 无 → `SystemProxyDetectResult` | 无 | 透传 |

#### F. Agent 会话 / 预设（`ipc.ts:2672-2889`，31 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 2672 | AGENT.LIST_SESSIONS | `includeArchived?` → `AgentSessionMeta[]` | 无 | 过滤审核归属会话（`ipc.ts:2675`，`isReviewOwnedAgentSession` 定义 `packages/shared/src/types/agent.ts:947`）；**副作用**：对所有 attachedDirectories 启动文件监听（`ipc.ts:2677-2683`） |
| 2689 | AGENT.GET_ARCHIVED_COUNTS | 无 → `{conversations, agentSessions}` | 无 | 透传两个 count 函数 |
| 2700 | AGENT.GET_SESSION_META | `id` → meta\|null | 无 | 审核归属会话返 null（`ipc.ts:2705`） |
| 2710 | AGENT.CREATE_SESSION | `title?, channelId?, workspaceId?, modelId?, presetId?` → meta | 无 | 预设缺省继承工作区默认（`ipc.ts:2714-2715`）；runtime 取 `getSettings().agentRuntime ?? 'pi'`（`ipc.ts:2716`）；**飞书镜像** `ensureSessionMirror`（失败仅日志，`ipc.ts:2717-2719`） |
| 2725 | PRESET.LIST_PRESETS | `workspaceSlug?, includeInactiveGlobal?` → `AgentPreset[]` | 无 | 透传 |
| 2732 | PRESET.LIST_GLOBAL_PRESETS | 无 → `AgentPreset[]` | 无 | 透传 |
| 2734 | PRESET.GET_REFERENCE_REPORT | `PresetReference` → 报告 | 无 | 透传 |
| 2738 | PRESET.DELETE_GLOBAL_PRESET | `PresetReference` → void | 无 | 透传 |
| 2742 | PRESET.COPY_TO_WORKSPACE | `reference, workspaceSlug, name?` → preset | 无 | 透传 |
| 2746 | PRESET.CREATE_GLOBAL_PRESET | `AgentPresetCreateInput` → preset | 无 | 透传 |
| 2747 | PRESET.PROMOTE_WORKSPACE_PRESET_TO_GLOBAL | `workspaceSlug, presetId, targetWorkspaceSlugs, keepWorkspaceCopy?` → preset | 无 | 透传 |
| 2748 | PRESET.UPDATE_GLOBAL_PRESET | `presetId, updates` → preset | 无 | 透传 |
| 2749 | PRESET.SET_DEFAULT_REFERENCE | `workspaceSlug, reference` → reference | 无 | 透传 |
| 2750/2751 | PRESET.ENABLE/DISABLE_GLOBAL_IN_WORKSPACE | `workspaceSlug, reference` → void | 无 | 透传 |
| 2752 | PRESET.REBIND_AND_DISABLE_GLOBAL_SCOPE | `workspaceSlug, source, replacement?` → `PresetScopeRebindResult` | 无 | 透传 |
| 2757 | PRESET.SET_WORKSPACE_ENABLED | `workspaceSlug, presetId, enabled` → void | 无 | 透传 |
| 2758 | PRESET.REBIND_SESSION_REFERENCE | `sessionId, reference, expectedRevision?` → meta | 无 | 不存在抛“会话不存在”；revision 冲突抛 `REVISION_CONFLICT`（`ipc.ts:2760-2761`）；`publishAgentSessionProjection`（`ipc.ts:2763`） |
| 2766 | PRESET.REBIND_AUTOMATION_REFERENCE | `automationId, reference\|null` | 无 | 透传 |
| 2768 | PRESET.GET_DEFAULT_PRESET | `workspaceSlug?` → `string` | 无 | 透传 `getDefaultPresetId` |
| 2775 | PRESET.UPDATE_SESSION_PRESET | `sessionId, presetId, expectedRevision?` → meta | 无 | 会话/预设存在性硬校验（`ipc.ts:2779-2784`，未知预设抛 `预设不存在`）；revision 冲突抛；写 UI meta + 投影（`ipc.ts:2785-2786`） |
| 2791 | PRESET.SET_DEFAULT_PRESET | `workspaceSlug, presetId` → `string` | 无 | 透传 |
| 2798 | PRESET.CREATE_PRESET | `workspaceSlug, input` → preset | 无 | 透传 |
| 2805 | PRESET.COPY_PRESET | `workspaceSlug, fromId, name?` → preset | 无 | 透传 |
| 2812 | PRESET.UPDATE_PRESET | `workspaceSlug, presetId, updates` → preset | 无 | 透传 |
| 2819 | PRESET.DELETE_PRESET | `workspaceSlug, presetId` → void | 无 | 透传 |
| 2827 | PRESET.GET_OTHER_WORKSPACE_PRESETS | `currentSlug` → 分组 | 无 | 透传 |
| 2834 | PRESET.IMPORT_PRESET_FROM_WORKSPACE | `targetSlug, sourceSlug, presetId` → preset | 无 | 透传 |
| 2842 | PRESET.EXPORT_PRESETS | `workspaceSlug, presetIds?` → `{filePath,count}\|null` | 无 | 无候选抛“没有可导出的预设”（`ipc.ts:2850`）；Save 对话框取消返 null（`ipc.ts:2858`）；`writeFileSync` 到用户所选路径（`ipc.ts:2860`） |
| 2867 | PRESET.IMPORT_PRESETS | `workspaceSlug` → `AgentPresetImportResult\|null` | 无 | Open 对话框取消返 null；`importAgentPresets(workspaceSlug, text)` 非法格式抛（`ipc.ts:2877-2878`） |
| 2883 | AGENT.ENSURE_PROJECT_DRAFT_SESSION | `workspaceId, channelId?, modelId?` → meta | 无 | 工作区不存在抛“项目不存在”（`ipc.ts:2886`）；草稿会话禁止飞书镜像（注释 `ipc.ts:2882`） |

#### G. 受管浏览器（`ipc.ts:2914-3100`，24 个；守卫=主窗口族）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 2914 | AGENT.SET_BROWSER_FOREGROUND (`on`) | `sessionId\|null` → void | null 时 `assertMainRenderer`；否则 `assertBrowserSessionAccess`（`ipc.ts:2920-2921`） | `browserController.setForegroundSession`；**单向 IPC 异常直接吞**（`ipc.ts:2923-2925`）；非法 sessionId 丢弃（`ipc.ts:2917-2918`） |
| 2929 | AGENT.OPEN_BROWSER | `sessionId` → `BrowserViewState` | `assertBrowserSessionAccess` | 透传 `browserController.open` |
| 2936 | AGENT.GET_BROWSER_STATE | `sessionId` → 状态\|null | 同上 | 透传 |
| 2943 | AGENT.SET_BROWSER_LAYOUT (`on`) | `BrowserViewLayout` → void | 形状全量校验（`ipc.ts:2946-2955`）+ `assertBrowserSessionAccess`（`ipc.ts:2959`） | `browserController.setLayout`；异常吞（`ipc.ts:2961-2963`） |
| 2966 | AGENT.NAVIGATE_BROWSER | `BrowserNavigateInput` → 状态 | 同上 | 透传 `navigateDisplay` |
| 2973 | AGENT.GO_BACK_BROWSER | `sessionId` → 状态 | 同上 | 透传 |
| 2977 | AGENT.GO_FORWARD_BROWSER | `sessionId` → 状态 | 同上 | 透传 |
| 2981 | AGENT.RELOAD_BROWSER | `sessionId` → 状态 | 同上 | 透传 |
| 2985 | AGENT.TRANSLATE_BROWSER | `BrowserTabInput` → `BrowserTranslateResult` | 同上 | 透传 `translatePage` |
| 2989 | AGENT.PASTE_BROWSER_CLIPBOARD | `BrowserTabInput` → 结果 | 同上 | 透传 `pasteClipboard` |
| 2993 | AGENT.SET_BROWSER_ZOOM | `BrowserTabInput & {zoomFactor}` → 状态 | 同上；tabId/zoomFactor 必填否则抛（`ipc.ts:2995`） | 透传 `setZoom` |
| 3001 | AGENT.OPEN_FILE_IN_BROWSER | `{sessionId, filePath, theme?, tokens?, access?}` → 状态 | 参数形状（`ipc.ts:3013-3021`）+ `assertBrowserSessionAccess`（`ipc.ts:3022`）；候选根经 `getAllowedCandidateBasePaths` 过滤（`ipc.ts:3025`） | `browserController.previewOpen`，主题经 `normalizeOfvThemePayload` 收口（`ipc.ts:3033-3034`；实现在 `packages/shared/src/constants/ofv-theme-bridge.ts:85`，未深读） |
| 3039 | AGENT.HIDE_BROWSER | `sessionId` → void | 同上 | 透传 `hide` |
| 3043 | AGENT.CLOSE_BROWSER | `sessionId` → void | 同上 | 透传 `close` |
| 3050 | AGENT.REFRESH_BROWSER_PREVIEW_THEME | `{theme?, tokens?}` → `number` | `assertMainRenderer`（`ipc.ts:3053`） | `refreshLocalPreviewThemes`（本地预览标签重载，注释 `ipc.ts:3047-3049`）；无合法主题返 0 |
| 3059 | AGENT.LIST_BROWSER_TABS | `sessionId` → `BrowserTabListResult` | `assertBrowserSessionAccess` | 透传 |
| 3063 | AGENT.CREATE_BROWSER_TAB | `BrowserCreateTabInput` → 状态 | 同上 | 透传 `createDisplayTab` |
| 3067 | AGENT.SELECT_BROWSER_TAB | `BrowserTabInput` → 状态 | 同上；tabId 必填（`ipc.ts:3069`） | 透传 |
| 3072 | AGENT.CLOSE_BROWSER_TAB | `BrowserTabInput` → 状态\|null | 同上；tabId 必填（`ipc.ts:3074`） | 透传 |
| 3079 | AGENT.GET_BROWSER_START_PAGE | 无 → `BrowserStartPageState` | 无 | 读 bookmarks/history + `getSettings().browserHomeUrl`（`ipc.ts:3080-3085`） |
| 3086 | AGENT.ADD_BROWSER_BOOKMARK | `BrowserAddBookmarkInput` → 状态 | url 必填（`ipc.ts:3087`） | `addBookmark`（落盘，`lib/browser-start-page-store`） |
| 3091 | AGENT.REMOVE_BROWSER_BOOKMARK | `id` → 状态 | id 必填（`ipc.ts:3092`） | `removeBookmark` |
| 3096 | AGENT.UPDATE_BROWSER_HOME_URL | `url` → 状态 | 无 | `updateSettings({browserHomeUrl})`（`ipc.ts:3097`） |
| 3100 | AGENT.CLEAR_BROWSER_HISTORY | 无 → 状态 | 无 | `clearHistory` |

#### H. Agent 流 / 会话管理 / 进程 / Skill 体系（`ipc.ts:3107-3832`，74 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 3107 | AGENT.GET_SDK_MESSAGES | `id, opts?:{tail?,before?}` → `SDKMessage[]\|SDKMessagePage` | assertSensitive + `assertOrdinaryAgentSession`（`ipc.ts:3110-3111`） | 分页透传 `getAgentSessionSDKMessages` |
| 3117 | AGENT.RESTORE_ACTIVE_STREAMS | 无 → `string[]` | assertSensitive（`ipc.ts:3120`） | `restoreActiveAgentStreams(event.sender)`：renderer 刷新后重绑活跃流并回放（注释 `ipc.ts:3116`） |
| 3124 | AGENT.FILE_PREVIEW_REVISION | `filePath, access?` → `string\|null` | assertSensitive；`isPreviewPathAllowed` + 仅 `.pptx`（`ipc.ts:3129`） | 返回 `sha256:<hex>`（读文件哈希，`ipc.ts:3130`） |
| 3132 | AGENT.FILE_PREVIEW_REPORT | `AgentFilePreviewReport` → `boolean` | assertSensitive + `assertOrdinaryAgentSession(report.sessionId)`（`ipc.ts:3133-3135`） | 透传 `agentFilePreviewSessionManager.reportReady` |
| 3138 | AGENT.FILE_PREVIEW_INSPECTION_RESULT | 结果 → `boolean` | 同上（`ipc.ts:3139-3141`） | 透传 `reportInspection` |
| 3146 | AGENT.UPDATE_TITLE | `id, title` → meta | `assertOrdinaryAgentSession`（无 sender 检查） | 定稿锁定 `titleLockedAt: Date.now()`（`ipc.ts:3150`） |
| 3155 | AGENT.UPDATE_QUEUE_AUTO_SEND | `sessionId, enabled` → meta | assertSensitive + ordinary + sessionId 长度≤200（`ipc.ts:3158-3162`）+ 存在性（`ipc.ts:3166-3168`）；enabled 必须布尔（`ipc.ts:3163-3165`） | `updateAgentSessionUiMeta` |
| 3174 | AGENT.UPDATE_SESSION_MODEL | `id, channelId?, modelId?` → meta | assertSensitive + ordinary；**运行中抛“Agent 正在运行，完成后再切换模型”**（`ipc.ts:3179-3181`） | 写 UI meta |
| 3187 | AGENT.GENERATE_TITLE | `AgentGenerateTitleInput` → `string\|null` | 无 | 透传 `generateAgentTitle` |
| 3195 | AGENT.REGENERATE_TITLE | `id, channelId?, modelId?` → meta\|null | assertSensitive + ordinary（`ipc.ts:3198-3199`） | 透传 `regenerateAgentTitle` |
| 3206 | AGENT.DELETE_SESSION | `id` → void | assertSensitive + ordinary（`ipc.ts:3209-3210`） | **删除协调器 stop-and-wait**：`agentSessionDeletionCoordinator.delete`（`ipc.ts:3211`）→ beginDeletion/stopAndWait/clearState（清权限白名单、pending、askUser、exitPlan、关浏览器，`ipc.ts:3216-3222`）→ `deleteAgentSession({backgroundDiskCleanup:true})`（`ipc.ts:3223`） |
| 3229 | AGENT.MIGRATE_CHAT_TO_AGENT | `conversationId, agentSessionId` → void | assertSensitive + ordinary（`ipc.ts:3232-3233`） | 透传 `migrateChatToAgentSession` |
| 3239 | AGENT.TOGGLE_PIN | `id` → meta | ordinary（`ipc.ts:3242`） | read-then-write；不存在抛（`ipc.ts:3245`）；置顶清归档（`ipc.ts:3249-3251`） |
| 3257 | AGENT.CLEAR_COMPLETION_STATE | `id` → meta | ordinary | 清 `manualWorking`/`completedButUnconfirmed`（`ipc.ts:3265-3266`）；无变化原样返回（`ipc.ts:3267`） |
| 3273 | AGENT.SET_COMPLETION_STATE | `id` → meta | ordinary | 标未读 `completedButUnconfirmed: true`（`ipc.ts:3280`） |
| 3285 | AGENT.UPDATE_INTERRUPTION_STATE | `UpdateAgentInterruptStateInput` → meta | ordinary | state 非 null 置中断三字段，null 清除（`ipc.ts:3290-3292`；语义注释 `ipc.ts:3284`：防重启复活已消费中断） |
| 3297 | AGENT.TOGGLE_ARCHIVE | `id` → meta | ordinary | read-then-write；归档清置顶（`ipc.ts:3307-3309`） |
| 3315 | AGENT.SEARCH_MESSAGES | `query` → 结果 | 无 | 透传 `searchAgentSessionMessages` |
| 3323 | AGENT.SEARCH_SESSION_REFERENCES | `AgentSessionReferenceSearchInput` | 无 | 透传 |
| 3331 | AGENT.MOVE_SESSION_TO_WORKSPACE | `MoveSessionToWorkspaceInput` → meta | ordinary（`ipc.ts:3334`） | 运行中等待 500ms 重试一次再抛“会话正在运行中，请停止后再迁移”（`ipc.ts:3337-3342`，注释解释 STREAM_COMPLETE 与 finally 时序） |
| 3351 | AGENT.GET_SESSION_PROCESS_COUNT | `sessionId` → `number` | assertSensitive + ordinary（`ipc.ts:3354-3355`） | 与 LIST_SESSION_PROCESSES 同源去重 key=`pid ?? -\|launchedAt\|`（`ipc.ts:3356-3361`） |
| 3368 | AGENT.LIST_SESSION_PROCESSES | `ListSessionProcessesInput` → `SessionProcessInfo[]` | assertSensitive + 输入校验 + ordinary（`ipc.ts:3371-3373`） | 权威来源=Pi shell 启动点 ownership registry（注释 `ipc.ts:3366`）；SDK 后台任务补充去重（`ipc.ts:3392-3400`） |
| 3407 | AGENT.KILL_PROCESS | `KillProcessInput` → `{ok,message}` | assertSensitive + ordinary + **破坏性双因子**：仅杀本会话登记进程（`ipc.ts:3417-3427`，非归属抛“该进程不属于本会话或已失效”）；缺 startTime 抛（`ipc.ts:3428-3430`）；`isSameProcess(pid,startTime)` 防 PID 转世（`ipc.ts:3432-3435`） | `terminateProcessTreeGracefully`；失败抛 `结束失败: ...`（`ipc.ts:3436-3439`）；成功 `markOwnedRuntimeProcessExited`（`ipc.ts:3440`） |
| 3446 | AGENT.FORK_SESSION | `ForkSessionInput` → meta | assertSensitive + ordinary（`ipc.ts:3449-3450`） | `forkAgentSession` + 飞书镜像补建（`ipc.ts:3451-3456`，失败仅日志） |
| 3462 | AGENT.REWIND_SESSION | `RewindSessionInput` → `RewindSessionResult` | assertSensitive + ordinary（`ipc.ts:3466-3467`） | 目标 UUID 缺失抛“撤销失败：未指定目标消息 UUID”（`ipc.ts:3468-3471`）；透传 `rewindAgentSession`（快照回退） |
| 3480 | AGENT.FIND_ORPHAN_SESSIONS | 无 → 孤儿清单 | 无 | 透传 `findOrphanSessions`（健康检查） |
| 3493 | AGENT.LIST_WORKSPACES | 无 → `AgentWorkspace[]` | 无 | 透传 |
| 3501 | AGENT.CREATE_WORKSPACE | `name` → 工作区 | 无 | 创建 + `broadcastAgentWorkspacesChanged`（`ipc.ts:3505`） |
| 3511 | AGENT.UPDATE_WORKSPACE | `id, {name?, archived?}` → 工作区 | 无 | 更新 + 广播 |
| 3521 | AGENT.DELETE_WORKSPACE | `id` → void | 无 | **前置守卫**：slug=`default` 抛“默认项目不能删除”、仅剩一个抛“至少需要保留一个项目”（`ipc.ts:3531-3536`，注释解释防先删绑定数据再抛错）；逐会话走删除协调器（`ipc.ts:3545-3559`）；删绑定 automations 并广播（`ipc.ts:3560-3565`）；`deleteAgentWorkspace` + 广播 |
| 3572 | AGENT.REORDER_WORKSPACES | `orderedIds` → 列表 | 无 | 透传 + 广播 |
| 3584 | AGENT.GET_CAPABILITIES | `workspaceSlug` → `WorkspaceCapabilities` | 无 | 透传 |
| 3592 | AGENT.GET_MCP_CONFIG | `workspaceSlug` → `WorkspaceMcpConfig` | 无 | 透传 |
| 3600 | AGENT.SAVE_MCP_CONFIG | `workspaceSlug, config` → void | 无 | 透传（落盘） |
| 3608 | AGENT.TEST_MCP_SERVER | `name, McpServerEntry` → `{success,message}` | 无 | 动态 import `mcp-validator`（`ipc.ts:3611`） |
| 3620 | AGENT.PROMOTE_SKILL_TO_GLOBAL | `workspaceSlug, skillSlug, targetWorkspaceSlugs, keepWorkspaceCopy?` | 无 | 透传 `promoteWorkspaceSkillToGlobal` |
| 3625 | AGENT.GET_SKILLS | `workspaceSlug` → `SkillMeta[]` | 无 | `getAllWorkspaceSkills(slug, true)`（含不活跃） |
| 3633 | AGENT.GET_SKILLS_DIR | `workspaceSlug` → `string` | 无 | 透传 `getWorkspaceSkillsDir` |
| 3641 | AGENT.CREATE_SKILL | `workspaceSlug, skillSlug, name, description, content` → void | 无 | 透传 `createWorkspaceSkill` |
| 3649 | AGENT.DELETE_SKILL | `workspaceSlug, skillSlug` → void | 无 | 透传 |
| 3657 | AGENT.TOGGLE_SKILL | `workspaceSlug, skillSlug, enabled, sourceSkillId?` → void | 三段 `assertSafeSkillSegment`（`ipc.ts:3660-3663`；sourceSkillId 三态语义注释 `ipc.ts:3662`） | 透传 `toggleWorkspaceSkill` |
| 3669 | AGENT.GET_OTHER_WORKSPACE_SKILLS | `currentSlug` | 无 | 透传 |
| 3677 | AGENT.GET_DEFAULT_SKILL_SLUGS | 无 | 无 | 透传（`~/.proma/default-skills/`，注释 `ipc.ts:3676`） |
| 3685 | AGENT.IMPORT_SKILL_FROM_WORKSPACE | `targetSlug, sourceSlug, skillSlug` → `SkillMeta` | 三段 `assertSafeSkillSegment`（`ipc.ts:3688-3690`） | 透传 |
| 3696 | AGENT.UPDATE_SKILL_FROM_SOURCE | `targetSlug, skillSlug` → `SkillMeta` | 无 | 透传 |
| 3703 | AGENT.READ_SKILL_CONTENT | `workspaceSlug, skillSlug` → `string` | 无 | 透传 |
| 3710 | AGENT.WRITE_SKILL_CONTENT | 三参 → void | 无 | 透传（写盘） |
| 3719 | AGENT.LIST_SKILL_FILES | `workspaceSlug, skillSlug` | 无 | 透传 |
| 3726 | AGENT.READ_SKILL_FILE | `+ relativePath` | 无 | 透传 |
| 3733 | AGENT.WRITE_SKILL_FILE | `+ relativePath, content` | 无 | 透传（写盘；slug 安全在下层 `skill-path-security`？本 handler 未调 assertSafeSkillSegment，§10） |
| 3740 | AGENT.CREATE_SKILL_ENTRY | `+ relativePath, type:'file'\|'directory'` | 无 | 透传 |
| 3747 | AGENT.DELETE_SKILL_ENTRY | `+ relativePath` | 无 | 透传 |
| 3754 | AGENT.RENAME_SKILL_ENTRY | `+ fromRelative, toRelative` | 无 | 透传 |
| 3762 | GLOBAL_SKILL.LIST | `workspaceSlug?` | 传 slug 时 `assertSafeSkillSegment`（`ipc.ts:3763`） | 透传 `listGlobalSkills` |
| 3766 | GLOBAL_SKILL.READ | `skillId` | 无 | 透传 `readGlobalSkillContent` |
| 3767 | GLOBAL_SKILL.READ_WORKSPACE_COPY | `workspaceSlug, workspaceSkillId` | 双 `assertSafeSkillSegment`（`ipc.ts:3768-3769`） | 透传 |
| 3772 | GLOBAL_SKILL.SAVE_WORKSPACE_COPY | `+ content` | 同上（`ipc.ts:3773-3774`） | 透传（写盘） |
| 3777 | GLOBAL_SKILL.SAVE | `skillId, content, workspaceSlug, scope:'global'\|'workspace'` | scope 非法抛“必须明确选择全局版本或当前工作区”（`ipc.ts:3778`）；workspace 时校验 slug（`ipc.ts:3779`） | `editGlobalSkill`（**唯一可写入口**体系，注释 `ipc.ts:408-409`） |
| 3782 | GLOBAL_SKILL.COPY_TO_USER | `skillId, slug?` | slug 传入时校验（`ipc.ts:3783`） | 透传 |
| 3786 | GLOBAL_SKILL.CREATE_USER | `slug, name, description, content` | slug 校验（`ipc.ts:3787`） | 透传 |
| 3790 | GLOBAL_SKILL.COPY_TO_WORKSPACE | `skillId, workspaceSlug` | slug 校验（`ipc.ts:3791`） | 透传 |
| 3794 | GLOBAL_SKILL.GET_DELETE_BLOCKERS | `skillId` | 无 | 透传 |
| 3795 | GLOBAL_SKILL.DELETE_USER | `skillId, confirmationToken?` | 无（token 在下层核） | 透传 |
| 3796 | GLOBAL_SKILL.SET_ENABLED | `workspaceSlug, skillId, enabled` | slug 校验（`ipc.ts:3797`） | 透传 |
| 3800 | GLOBAL_SKILL.RESTORE | `workspaceSlug, skillId` | slug 校验（`ipc.ts:3801`） | 透传 |
| 3804 | GLOBAL_SKILL.GET_OVERRIDES | `workspaceSlug` | slug 校验（`ipc.ts:3805`） | 透传 |
| 3810 | SKILL_MASTER.LIST | 无 → `MasterSkillMeta[]` | 无 | 透传 `listMasterSkills`（只读兼容） |
| 3813 | SKILL_MASTER.READ | `slug` → `string` | 无 | 透传 |
| 3817 | SKILL_MASTER.SAVE | — | 无 | **恒抛**“旧元 Skill 写接口已停用，请通过全局 Skill 体系复制后编辑”（`Promise<never>`） |
| 3820 | SKILL_MASTER.RENAME_META | — | 无 | 恒抛同上 |
| 3823 | SKILL_MASTER.LIST_HISTORY | `slug` → `MasterSkillVersion[]` | 无 | 透传 |
| 3826 | SKILL_MASTER.ROLLBACK | — | 无 | 恒抛同上 |
| 3829 | SKILL_MASTER.SYNC_TO_WORKSPACES | — | 无 | 恒抛“…请使用全局 Skill 的工作区副本功能” |
| 3832 | SKILL_MASTER.DETECT_CONFLICT | `workspaceSlug, skillSlug` → `SkillConflict` | 无 | 透传 |

#### I. 发送 / Goal / 停止 / 队列 / 任务 / 权限（`ipc.ts:3841-4163`，23 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 3841 | AGENT.SEND_MESSAGE | `AgentSendInput` → void | assertSensitive + 形状 + ordinary（`ipc.ts:3844-3846`） | 审核 Pi 绑定回调（`require('./lib/review/pi-case-review-service')`，`ipc.ts:3849-3853`，失败仅 warn）；`coordinateAgentSend`（`ipc.ts:3857-3885`）：workspace 存在性、渠道、预设校验与**脏引用自愈**（`ipc.ts:3865-3873`）、飞书镜像 startMirror/startAgent 回调；并发保护（注释 `ipc.ts:3890-3892`） |
| 3893 | AGENT.START_GOAL | `sessionId, goal, contract?` → `AgentGoalState` | assertSensitive；goal 空抛（`ipc.ts:3895`） | `goalSessionService.start`（会跑 runAgent，主窗口不可用则停，`ipc.ts:476-480`） |
| 3898 | AGENT.GET_GOAL | `sessionId` → 状态\|null | assertSensitive | 透传 |
| 3902 | AGENT.LIST_GOALS | 无 → 列表 | assertSensitive | 透传 |
| 3906 | AGENT.PAUSE_GOAL | `sessionId` → 状态 | assertSensitive | 透传 |
| 3910 | AGENT.RESUME_GOAL | `sessionId` → 状态 | assertSensitive | 透传（plan 模式被 permissionError 拦，`ipc.ts:467-475`） |
| 3914 | AGENT.STOP_GOAL | `sessionId` → 状态 | assertSensitive | 透传 `goalSessionService.stop` |
| 3918 | AGENT.CLEAR_GOAL | `sessionId` → void | assertSensitive | 透传 |
| 3922 | AGENT.UPDATE_GOAL | `sessionId, patch{goal?,contract?,limits?}` → 状态 | assertSensitive；patch 必须对象非数组（`ipc.ts:3924`） | 透传 `update` |
| 3927 | AGENT.GET_GOAL_HISTORY | `sessionId` → `AgentGoalState[]` | assertSensitive；sessionId 必须字符串（`ipc.ts:3929`） | 透传 `history`（goals.json 读） |
| 3933 | AGENT.STOP_AGENT | `sessionId` → void | assertSensitive + ordinary（`ipc.ts:3936-3937`） | 停飞书镜像（`ipc.ts:3938`）；Goal owner 判定 `isGoalRunActive`（`ipc.ts:3940`）；**普通停止与 Goal 停止并行** `Promise.all`（`ipc.ts:3941-3946`，防 await 后误停新 owner，测试 `goal-ipc-routing.test.ts:55-59` 断言） |
| 3953 | AGENT.QUEUE_MESSAGE | `AgentQueueMessageInput` → `string` | assertSensitive + 形状 + ordinary（`ipc.ts:3956-3958`） | 透传 `queueAgentMessage(input, event.sender)` |
| 3966 | AGENT.GET_TASK_OUTPUT | `GetTaskOutputInput` → `GetTaskOutputResult` | assertSensitive + ordinary + **多段校验**：sessionId/taskId ≤200 非空、block 布尔、timeoutMs 0-30000（`ipc.ts:3969-3984`） | 透传 `getAgentTaskOutput`（归属由主进程 adapter 决定，注释 `ipc.ts:3965`） |
| 3993 | AGENT.GET_RUNTIME_CAPABILITIES | `runtime` → 能力快照 | assertSensitive；`isAgentRuntime(runtime)` 否则抛（`ipc.ts:3997`） | 透传 `getAgentRuntimeCapabilities` |
| 4005 | AGENT.PERMISSION_RESPOND | `PermissionResponse{requestId,behavior,alwaysAllow}` → void | assertSensitive + `assertOrdinaryPendingRequestId`（`ipc.ts:4008-4010`） | `permissionService.respondToPermission`；`permission_resolved` 进事件总线 `emitSessionStreamEvent`（`ipc.ts:4015-4024`，注释：Pocket 广播 + WS 重放 + 防双投） |
| 4031 | AGENT.STOP_TASK | `StopTaskInput` → void | assertSensitive + ordinary + sessionId/taskId 校验 + `type ∈ {agent,shell}`（`ipc.ts:4034-4046`） | `stopAgentTask`；不支持/无法确认归属时明确抛错（注释 `ipc.ts:4029-4030`） |
| 4052 | AGENT.UPDATE_SESSION_PERMISSION_MODE | `sessionId, mode, expectedRevision?` → meta | assertSensitive；`isProferPermissionMode(mode)`（`ipc.ts:4056-4058`）；ordinary + 存在性（`ipc.ts:4060-4063`）；revision 冲突抛（`ipc.ts:4065-4067`） | **CSLab 信任联动**：`bypassPermissions`→`grantCsLabToolTrust`，否则 `revokeCsLabToolTrust`（`ipc.ts:4070-4074`）；运行中热切换 `updateAgentPermissionMode`，失败回滚 meta+信任并抛（`ipc.ts:4076-4088`）；成功 `publishAgentSessionProjection`（`ipc.ts:4090`，与注释“不广播”不一致，§10） |
| 4096 | AGENT.UPDATE_SESSION_CODEX_FAST_MODE | `sessionId, enabled` → meta | ordinary + 布尔 + 存在性 + **运行中抛**（`ipc.ts:4099-4102`） | 写 UI meta |
| 4108 | AGENT.UPDATE_SESSION_OPENAI_THINKING | `sessionId, level\|null` → meta | ordinary；level 白名单 `[null,'off','minimal','low','medium','high','xhigh','max']`（`ipc.ts:4112-4116`）；存在性；**运行中抛**（`ipc.ts:4118`） | 写 UI meta |
| 4125 | AGENT.UPDATE_SESSION_AGENT_EFFORT | `sessionId, effort\|null` → meta | ordinary；白名单 `[null,'low','medium','high','max']`（`ipc.ts:4129-4132`）；存在性；**运行中抛**（`ipc.ts:4134`） | 写 UI meta |
| 4142 | AGENT.UPDATE_SESSION_STUDY_TEACHING_MODE | `sessionId, mode` → meta | 白名单 `['fast','balanced','strict']`（`ipc.ts:4145-4148`）；存在性；**允许运行中切换**（纯提示词参数，注释 `ipc.ts:4139-4141`） | 写 UI meta |
| 4155 | AGENT.GET_PI_REASONING_CAPABILITY | `provider, modelId?` → `ReasoningCapability\|undefined` | 无 | 透传 `resolvePiReasoningCapability` |
| 4163 | AGENT.UPDATE_SESSION_AGENT_RUNTIME | `sessionId, runtime` → meta | assertSensitive + ordinary + sessionId 校验 + `isAgentRuntime`（`ipc.ts:4166-4171`）；存在性；**运行中抛**（`ipc.ts:4174`） | 切换前 `snapshotAgentRuntimeMeta` 保存（`ipc.ts:4177`，注释：跨 runtime 清 SDK/fork/resume 字段）；写 meta + `updateSettings({agentRuntime})` + 投影；失败 `restoreAgentRuntimeMeta` 回滚（`ipc.ts:4183-4189`） |

#### J. 工作区记忆 / AskUser / ExitPlanMode / Project Graph（`ipc.ts:4196-4431`，19 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 4196 | AGENT.GET_WORKSPACE_MEMORY_SUMMARY | `workspaceSlug` → 摘要 | 无 | 透传 |
| 4203 | AGENT.READ_WORKSPACE_PROFILE | `workspaceSlug` → `SkillFileContent` | 无 | 透传（读盘） |
| 4210 | AGENT.WRITE_WORKSPACE_PROFILE | `workspaceSlug, content` → void | assertSensitive（`ipc.ts:4213`） | 透传（写盘） |
| 4218 | AGENT.LIST_WORKSPACE_AUTO_MEMORY_FILES | `workspaceSlug` | 无 | 透传 |
| 4225 | AGENT.READ_WORKSPACE_AUTO_MEMORY_FILE | `workspaceSlug, relativePath` | 无 | 透传 |
| 4232 | AGENT.WRITE_WORKSPACE_AUTO_MEMORY_FILE | `+ content` | assertSensitive（`ipc.ts:4235`） | 透传（写盘） |
| 4240 | AGENT.LIST_WORKSPACE_MEMORY_ARCHIVE_FILES | `workspaceSlug` | 无 | 透传 |
| 4247 | AGENT.READ_WORKSPACE_MEMORY_ARCHIVE_FILE | `workspaceSlug, relativePath` | 无 | 透传 |
| 4254 | AGENT.WRITE_WORKSPACE_MEMORY_ARCHIVE_FILE | `+ content` | assertSensitive（`ipc.ts:4257`） | 透传（写盘） |
| 4262 | AGENT.SEARCH_MEMORY_ARCHIVE | `workspaceSlug, query, topK?` → 检索结果 | 无 | **双引擎路由**：`memoryRetrievalEngine==='hipporag'` 走 `searchMemoryArchiveRouted`，默认经典 FTS5 `createMemoryArchiveSearcher`（finally close，`ipc.ts:4266-4275`）；topK 默认 20 |
| 4279 | AGENT.RESOLVE_MEMORY_WIKILINK | `workspaceSlug, name` → `MemoryWikilinkTarget\|null` | 无 | 透传（archive+auto 两目录） |
| 4288 | AGENT.GET_MEMORY_BACKLINKS | `workspaceSlug, currentAbsolutePath, currentLinkName` → `MemoryBacklink[]` | 无 | 透传 |
| 4300 | AGENT.ASK_USER_RESPOND | `AskUserResponse{requestId,answers}` → void | assertSensitive + `assertOrdinaryPendingRequestId`（`ipc.ts:4303-4305`） | `askUserService.respondToAskUser` + `ask_user_resolved` 进事件总线（`ipc.ts:4306-4315`） |
| 4323 | AGENT.EXIT_PLAN_MODE_RESPOND | `ExitPlanModeResponse` → void | assertSensitive + pending 校验（`ipc.ts:4326-4327`） | `exitPlanService.respondToExitPlanMode`；`exit_plan_mode_resolved` 广播（`ipc.ts:4334-4340`）；选定 targetMode 时**持久化权限模式 + CSLab 信任联动**（`ipc.ts:4344-4358`，失败仅 warn）+ `permission_mode_changed` 广播（`ipc.ts:4360-4366`） |
| 4376 | AGENT.GET_PENDING_REQUESTS | 无 → `PendingRequestsSnapshot` | assertSensitive（`ipc.ts:4379`） | 三类 pending 快照（过滤普通会话，`ipc.ts:4380-4384`），供 renderer 重载恢复 |
| 4389 | AGENT.GET_GRAPH | `sessionId` → 图 | assertSensitive + sessionId ≤128（`ipc.ts:4392-4395`） + ordinary | 动态 import `project-graph-service`（`ipc.ts:4397`） |
| 4402 | AGENT.GET_GRAPH_SUMMARY | `sessionId` → 摘要 | 同上（`ipc.ts:4405-4409`） | 动态 import 透传 |
| 4415 | AGENT.APPEND_GRAPH_EVENT | `sessionId, GraphEvent` → void | 同上 + 图事件对象校验（`ipc.ts:4422-4424`） | `appendGraphEvent`（追加图事件） |
| 4431 | AGENT.RUN_RETROSPECTIVE | `sessionId` → 结果 | assertSensitive + ordinary（`ipc.ts:4434-4435`） | 动态 import `retrospective-service` |

#### K. Agent 附件 / 工作区附加 / Worktree 配置（`ipc.ts:4444-4642`，17 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 4444 | AGENT.SAVE_FILES_TO_SESSION | `AgentSaveFilesInput` → `AgentSavedFile[]` | assertSensitive + 形状 + ordinary（`ipc.ts:4447-4449`） | 透传 `saveFilesToAgentSession`（写会话目录） |
| 4455 | AGENT.SAVE_FILES_TO_WORKSPACE | `AgentSaveWorkspaceFilesInput` → 数组 | **无 sender/会话校验** | 透传 `saveFilesToWorkspaceFiles`（写工作区 files 目录） |
| 4463 | AGENT.GET_WORKSPACE_FILES_PATH | `workspaceSlug` → `string` | 无 | 透传 `getWorkspaceFilesDir` |
| 4471 | AGENT.OPEN_FOLDER_DIALOG | 无 → `{path,name}\|null` | 无 | `dialog.showOpenDialog`；无窗口/取消返 null（`ipc.ts:4474-4482`） |
| 4491 | AGENT.ATTACH_DIRECTORY | `AgentAttachDirectoryInput` → `string[]` | assertSensitive + ordinary + 会话存在（`ipc.ts:4494-4497`） | 去重追加 `attachedDirectories`（`ipc.ts:4499-4503`）+ `watchAttachedDirectory`（`ipc.ts:4505`） |
| 4511 | AGENT.DETACH_DIRECTORY | 同上 → `string[]` | 同上（`ipc.ts:4514-4517`） | 过滤移除 + `unwatchAttachedDirectory`（`ipc.ts:4520-4523`） |
| 4529 | AGENT.ATTACH_FILE | `AgentAttachFileInput` → `string[]` | 同上（`ipc.ts:4532-4535`） | `realpathSync` 解析 + 仅文件否则抛“只能附加文件”（`ipc.ts:4539-4541`）；去重写 `attachedFiles`（`ipc.ts:4543-4547`） |
| 4553 | AGENT.DETACH_FILE | 同上 → `string[]` | 同上（`ipc.ts:4556-4559`） | 过滤移除（注意按原始 `input.filePath` 过滤，`ipc.ts:4562`，与 ATTACH_FILE 的 realpath 值可能不一致，§10） |
| 4569 | AGENT.ATTACH_WORKSPACE_DIRECTORY | `WorkspaceAttachDirectoryInput` → `string[]` | 无 | `attachWorkspaceDirectory` + watch（`ipc.ts:4572-4573`） |
| 4579 | AGENT.DETACH_WORKSPACE_DIRECTORY | 同上 | 无 | detach + unwatch |
| 4589 | AGENT.ATTACH_WORKSPACE_FILE | `WorkspaceAttachFileInput` | 无 | realpath + 仅文件校验（`ipc.ts:4592-4596`）；透传 |
| 4603 | AGENT.DETACH_WORKSPACE_FILE | 同上 | 无 | 透传 |
| 4611 | AGENT.GET_WORKSPACE_DIRECTORIES | `workspaceSlug` → `string[]` | 无 | 透传 |
| 4619 | AGENT.GET_WORKSPACE_ATTACHED_FILES | `workspaceSlug` → `string[]` | 无 | 透传 |
| 4628 | AGENT.GET_WORKTREE_REPOS | `workspaceSlug` | 无 | 透传 |
| 4635 | AGENT.ADD_WORKTREE_REPO | `workspaceSlug, WorkspaceWorktreeRepo` | 无 | 透传（写配置） |
| 4642 | AGENT.REMOVE_WORKTREE_REPO | `workspaceSlug, repoPath` | 无 | 透传 |

#### L. Agent 文件系统 / 文件预览族（`ipc.ts:4652-5665`，32 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 4652 | AGENT.GET_SESSION_PATH | `_workspaceId, sessionId` → `string\|null` | assertSensitive + ordinary（`ipc.ts:4655-4656`） | 会话不存在/工作区悬空返 null（`ipc.ts:4657-4660`）；未绑定工作区用 `'default'` 沙箱（`ipc.ts:4661-4662`） |
| 4667 | AGENT.LIST_DIRECTORY | `dirPath, access?` → `FileEntry[]` | `isPreviewPathAllowed`（`ipc.ts:4683`，拒绝抛“路径不在允许预览的范围内”）；目录校验（`ipc.ts:4686-4688`） | 目录不存在优雅返 `[]`（`ipc.ts:4677-4680`）；过滤 HIDDEN_FS_ENTRIES 与审核私有路径（`ipc.ts:4694-4696`）；目录前/隐藏后/名称排序（`ipc.ts:4707-4714`） |
| 4721 | AGENT.DELETE_FILE | `filePath` → void | `assertInsideAgentWorkspaces`（`ipc.ts:4729`） | `rmSync recursive force maxRetries:5`（`ipc.ts:4733`）；失败转 `toFsErrorMessage` 抛（`ipc.ts:4736`） |
| 4742 | AGENT.MOVE_TO_TRASH | `filePath` → void | 同上（`ipc.ts:4749`） | `shell.trashItem`（可恢复）；失败转文案抛（`ipc.ts:4755`） |
| 4761 | AGENT.READ_DIRECTORY_RECURSIVE | `dirPath` → `Array<{relativePath,data:Uint8Array}>` | **双根内校验** + 审核私有拒读（`ipc.ts:4770-4774`） | 递归读全部文件内容（文件夹上传用）；私有子项跳过（`ipc.ts:4781`） |
| 4797 | 'agent:select-and-upload-folder' | 无 → 上传清单\|null | 无（对话框选定目录） | 限额：≤1000 文件、单文件 ≤50MB、敏感文件名/扩展名跳过（`.env`、`id_rsa`、`.pem` 等，`ipc.ts:4816-4825`）、跳过 node_modules/.git 等（`ipc.ts:4825`）；读失败跳过（`ipc.ts:4847-4849`）；返回含 sourcePath |
| 4859 | AGENT.OPEN_FILE | `filePath` → void | `assertInsideAgentWorkspaces`（`ipc.ts:4865`）；`confirmExecutableFileOpen`（CVE-2026-96951，`ipc.ts:4868`） | `shell.openPath`；失败 warn（`ipc.ts:4873-4874`） |
| 4879 | AGENT.WRITE_CLIPBOARD_PREVIEW | `filename, content` → `string` 路径 | 文件名清洗防穿越（`ipc.ts:4900`）+ resolve 后仍在 tmpDir 内否则抛“文件名越界”（`ipc.ts:4903-4907`） | 写 `tmpdir()/profer-preview/<safeFilename>`（`ipc.ts:4894-4909`） |
| 4916 | AGENT.SHOW_IN_FOLDER | `filePath` → void | `assertInsideAgentWorkspaces`（`ipc.ts:4922`） | `shell.showItemInFolder` |
| 4929 | IPC.SHOW_ITEM_IN_FOLDER | `filePath, candidateBasePaths?` → `boolean` | 审核私有返 false（`ipc.ts:4937`）；**无工作区限制**（注释 `ipc.ts:4928`）；不存在返 false | `shell.showItemInFolder` |
| 4948 | 'file:resolve-and-read' | `filePath, access?` → `{resolvedPath,content}\|null` | `isPreviewPathAllowed`（`ipc.ts:4955`） | 动态 import `file-preview-service`；拒绝返 null |
| 4965 | 'file:write-text' | `filePath, content, access?` → `boolean` | **写边界用 `isPathAllowed`**（`ipc.ts:4974`）；content 非字符串返 false | `writeFileSync`（Markdown 内联编辑） |
| 4984 | 'file:search-candidate' | `FileSearchCandidateRequest` → 结果 | 形状校验 + ordinary + 会话存在（`ipc.ts:4987-4992`）；无授权搜索根抛“没有授权搜索目录”（`ipc.ts:4994-4997`） | **可取消**：`activeFileSearches` AbortController（`ipc.ts:5001-5002`）；同 requestId 并发返 `cancelled:true`（`ipc.ts:4998-5000`）；deep 模式 maxDepth 12/50 条，否则 3/1 条（`ipc.ts:5008-5009`）；错误结构化返回（`ipc.ts:5015-5021`）；finally 清表（`ipc.ts:5022-5024`） |
| 5028 | 'file:cancel-search' | `requestId` → `boolean` | 无 | `controller.abort()`；无此请求返 false（`ipc.ts:5031-5034`） |
| 5039 | 'file:resolve-path' | `filePath, access?` → `ResolvedFileUrl\|null` | `isPreviewPathAllowed`（`ipc.ts:5046`） | preflight 跳过全局递归搜索（`ipc.ts:5044-5045`）；`registerProferFilePath` 换 token-gated URL（`ipc.ts:5050`） |
| 5056 | 'file:describe-path' | `filePath, access?` → `{kind:'file'\|'directory'\|'missing'\|'denied'}` | `isPreviewPathAllowed` 不过返 denied（`ipc.ts:5065-5067`） | 仅探测（注释 `ipc.ts:5054-5055`） |
| 5079 | 'file:resolve-html-preview-path' | `filePath, access?` → `ResolvedFileUrl\|null` | 同上（`ipc.ts:5085`） | 注册所在目录使相对资源可加载；返回目录 URL+文件名（`ipc.ts:5090-5091`）；注册失败返 null（`ipc.ts:5092-5095`） |
| 5100 | 'file:prepare-pdf-preview' | `filePath, access?` → `{tmpHtmlUrl}\|null` | 同上（`ipc.ts:5107`） | `preparePdfPreview` 生成临时 HTML（`ipc.ts:5111-5112`） |
| 5117 | 'file:resolve-document-anchor' | `anchor, access?(含 label?)` → `ResolvedDocumentAnchor\|null` | anchor 形状（`ipc.ts:5124`）；结果 `isPreviewPathAllowed`（`ipc.ts:5160`） | 候选目录＝会话工作目录+study 目录+搜索根+候选根，fallback＝会话/工作区附加文件（`ipc.ts:5132-5153`）；透传 `resolveDocumentAnchor` |
| 5169 | 'file:register-preview-path' | `filePath, access?` → `string\|null` | `isPreviewPathAllowed`（`ipc.ts:5180`）；须是文件（`ipc.ts:5179`） | `registerProferFilePath`（cdut-file:// 协议注册）；异常返 null（`ipc.ts:5185`） |
| 5190 | 'file:read-binary-base64' | `filePath, access?, maxSize?` → `string\|null` | `isPreviewPathAllowed`（`ipc.ts:5197`）；超 maxSize 返 null（`ipc.ts:5199`） | 读文件 base64（内联图片预览） |
| 5205 | AGENT.RENAME_FILE | `filePath, newName` → void | 新名禁路径分隔符/`..`（`ipc.ts:5210-5212`）；旧/新路径 `assertInsideAgentWorkspaces`（`ipc.ts:5215,5218`） | `renameOrdinaryAgentFileEntry`（审核私有条目拒改）；失败转文案抛（`ipc.ts:5223`） |
| 5229 | AGENT.MOVE_FILE | `filePath, targetDir` → void | 三路径 `assertInsideAgentWorkspaces`（`ipc.ts:5236-5240`） | 同上重命名语义 |
| 5247 | AGENT.LIST_ATTACHED_DIRECTORY | `dirPath, access?` → `FileEntry[]` | **`isPathAllowed`（严格写边界）**，拒绝抛“访问路径不在允许范围内”（`ipc.ts:5255-5257`） | 与 LIST_DIRECTORY 同构排序（`ipc.ts:5261-5282`） |
| 5289 | AGENT.READ_ATTACHED_FILE | `filePath, sessionId?, workspaceSlug?` → base64 | realpath 防 symlink 绕过（`ipc.ts:5299-5302`）；审核私有拒（`ipc.ts:5304-5306`）；ordinary（`ipc.ts:5307`）；**白名单**＝会话/工作区附加目录+文件+workspace files+agent-workspaces 根（`ipc.ts:5309-5338`），不在内抛“访问路径不在允许范围内” | 20MB 上限（`ipc.ts:5343-5350`，超限抛）；读 base64 |
| 5358 | AGENT.SHOW_ATTACHED_IN_FOLDER | `filePath, access?` → void | `isPreviewPathAllowed`（`ipc.ts:5364`） | `shell.showItemInFolder` |
| 5373 | AGENT.RENAME_ATTACHED_FILE | `filePath, newName, access?` → void | 新名校验（`ipc.ts:5378-5380`）；`isUnsafeAgentWorkspaceMutationPath` 抛“审核内部或共享容器路径不可操作”（`ipc.ts:5382`）；`isPathAllowed`（`ipc.ts:5384-5386`） | `renameOrdinaryAgentFileEntry` |
| 5394 | AGENT.MOVE_ATTACHED_FILE | `filePath, targetDir, access?` → void | 同上 + 目标也 `isPathAllowed`（`ipc.ts:5400-5405`） | 同上 |
| 5413 | AGENT.DELETE_ATTACHED_FILE | `filePath, access?` → void | 同上（`ipc.ts:5420-5424`） | `rmSync` 重试参数同 DELETE_FILE；失败转文案抛（`ipc.ts:5426-5429`） |
| 5435 | AGENT.MOVE_ATTACHED_TO_TRASH | `filePath, access?` → void | 同上（`ipc.ts:5440-5444`） | `shell.trashItem`；失败转文案抛 |
| 5455 | AGENT.CHECK_PATHS_TYPE | `paths[]` → `{directories,files}` | 审核私有跳过（`ipc.ts:5462`） | 仅 stat 分类；不可访问忽略（`ipc.ts:5470-5472`） |
| 5479 | AGENT.SEARCH_WORKSPACE_FILES | `rootPath, query, limit?, additionalPaths?, sessionPaths?` → `FileSearchResult` | **无 isPathAllowed 检查**（rootPath 直接 resolve 后扫描；私有路径由 `isReviewPrivateDesktopPath` 过滤，`ipc.ts:5504,5512,5533`） | 扫描上限：深度≤10、组内≤2000、总≤3000（`ipc.ts:5488-5489,5504`）；忽略 node_modules/.git 等（`ipc.ts:5486-5487`）；空 query=目录优先浏览模式（`ipc.ts:5617-5632`）；有 query=前缀/包含/子序列匹配 + 配额分配（`ipc.ts:5634-5656`） |

#### M. GitHub Release / Lark / 飞书 / 钉钉 / 微信（`ipc.ts:5683-6186`，56 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 5683 | GITHUB_RELEASE.GET_LATEST_RELEASE | 无 → `GitHubRelease\|null` | 无 | commercial 走 `fetchServerReleases`（网络，失败仅日志返 null，`ipc.ts:5686-5694`）；oss 走 GitHub `getLatestRelease` |
| 5700 | GITHUB_RELEASE.LIST_RELEASES | `options?` → 列表 | 无 | commercial slice(0, perPage??3)（`ipc.ts:5703-5711`）；oss 透传 |
| 5718 | GITHUB_RELEASE.GET_RELEASE_BY_TAG | `tag` → 发布\|null | 无 | commercial 本地 find；oss 透传 |
| 5745/5746 | LARK.GET_STATUS / REFRESH_STATUS | 无 | 无 | 透传 `detectLarkCli`（两通道同实现） |
| 5747 | LARK.GET_MCP_STATUS | 无 | 无 | 透传 |
| 5748 | LARK.SAVE_MCP_CREDENTIALS | `LarkMcpCredentialsInput` | 无 | 透传（写凭据） |
| 5749/5750 | LARK.ENABLE/DISABLE_MCP_FOR_WORKSPACE | `workspaceSlug` | 无 | 透传 |
| 5751 | LARK.START_MCP_LOGIN | 无 | 无 | 透传（登录流程，事件经 5740 桥转发） |
| 5752 | LARK.CANCEL_MCP_LOGIN | 无 | 无 | `cancelLarkMcpLogin`（取消） |
| 5753 | LARK.TEST_MCP_CONNECTION | 无 | 无 | 透传（网络） |
| 5754 | LARK.INSTALL_CLI | 无 | 无 | `installLarkCli`（装 CLI，外部命令） |
| 5755 | LARK.START_LOGIN | 无 | 无 | `startLarkLogin` |
| 5756 | LARK.CANCEL_LOGIN | 无 | 无 | `cancelLarkLogin` |
| 5763 | FEISHU.GET_CONFIG | 无 → `FeishuConfig` | 无 | 透传（旧 API 操作 bots[0]，注释 `ipc.ts:5760`） |
| 5771 | FEISHU.GET_DECRYPTED_SECRET | 无 → `string` | 无 | 透传 `getDecryptedAppSecret`（解密凭据出站） |
| 5779 | FEISHU.SAVE_CONFIG | `FeishuConfigInput` → `FeishuConfig` | 无 | 保存后按 enabled 重启/停止 bots[0]（`ipc.ts:5784-5792`） |
| 5798 | FEISHU.START_BRIDGE | 无 | 无 | `feishuBridgeManager.startAll`（网络长连接） |
| 5806 | FEISHU.STOP_BRIDGE | 无 | 无 | `stopAll` |
| 5814 | FEISHU.GET_STATUS | 无 → `FeishuBridgeState` | 无 | 取第一个 bot 状态，空返 `disconnected`（`ipc.ts:5817-5819`） |
| 5826 | FEISHU.GET_MULTI_CONFIG | 无 | 无 | 透传 `getFeishuMultiBotConfig` |
| 5834 | FEISHU.SAVE_BOT_CONFIG | `FeishuBotConfigInput` | 无 | 保存后自动 restart/stop bot（不阻塞结果，`ipc.ts:5839-5845`） |
| 5851 | FEISHU.REMOVE_BOT | `botId` | 无 | 先 `stopBot` 再删配置（`ipc.ts:5854-5855`） |
| 5860 | FEISHU.GET_BOT_DECRYPTED_SECRET | `botId` → `string` | 无 | 解密凭据出站 |
| 5868/5876 | FEISHU.START_BOT / STOP_BOT | `botId` | 无 | 透传 |
| 5884 | FEISHU.GET_MULTI_STATUS | 无 | 无 | `getStates` |
| 5892 | FEISHU.TEST_CONNECTION | `appId, appSecret` | 无 | 透传（网络） |
| 5900 | FEISHU.LIST_BINDINGS | 无 → `FeishuChatBinding[]` | 无 | `listAllBindings` |
| 5908 | FEISHU.UPDATE_BINDING | `FeishuUpdateBindingInput` → 绑定\|null | 无 | 按 chatId 找 bridge 更新（`ipc.ts:5911-5912`） |
| 5917 | FEISHU.REMOVE_BINDING | `chatId` → `boolean` | 无 | 找不到返 false（`ipc.ts:5920-5921`） |
| 5926 | FEISHU.REPORT_PRESENCE | `FeishuPresenceReport` | 无 | `presenceService.updatePresence` |
| 5938 | FEISHU.REGISTER_APP_START | 无 → `FeishuRegisterAppResult` | 无 | **单例注册流程**：已有流程先 abort（`ipc.ts:5942-5944`）；动态 import `@larksuiteoapi/node-sdk` + `qrcode`；QR 码/状态经 `event.sender.send` 定向回传（`ipc.ts:5954-5983`，sender 销毁检查）；QR 失败兜底只发 url（`ipc.ts:5968-5973`）；finally 清 activeRegisterAbort（`ipc.ts:5991-5995`） |
| 5999 | FEISHU.REGISTER_APP_CANCEL | 无 | 无 | `abort()` + 清空（`ipc.ts:6002-6003`） |
| 6010 | DINGTALK.GET_CONFIG | 无 | 无 | 透传（旧 API） |
| 6018 | DINGTALK.GET_DECRYPTED_SECRET | 无 → `string` | 无 | 解密凭据出站 |
| 6026 | DINGTALK.SAVE_CONFIG | `DingTalkConfigInput` | 无 | 透传（旧 API 不自动重启，与飞书 5779 不一致，§10） |
| 6034 | DINGTALK.TEST_CONNECTION | `clientId, clientSecret` | 无 | 透传（网络） |
| 6042/6050 | DINGTALK.START_BRIDGE / STOP_BRIDGE | 无 | 无 | startAll/stopAll |
| 6058 | DINGTALK.GET_STATUS | 无 | 无 | 第一个 bot 状态或 `disconnected`（`ipc.ts:6061-6063`） |
| 6070 | DINGTALK.GET_MULTI_CONFIG | 无 | 无 | 透传 |
| 6078 | DINGTALK.SAVE_BOT_CONFIG | `DingTalkBotConfigInput` | 无 | 自动 restart/stop（`ipc.ts:6083-6089`） |
| 6095 | DINGTALK.REMOVE_BOT | `botId` | 无 | stop + 删 |
| 6104 | DINGTALK.GET_BOT_DECRYPTED_SECRET | `botId` | 无 | 解密出站 |
| 6112/6120 | DINGTALK.START_BOT / STOP_BOT | `botId` | 无 | 透传 |
| 6128 | DINGTALK.GET_MULTI_STATUS | 无 | 无 | `getStates` |
| 6138 | WECHAT.GET_CONFIG | 无 → `WeChatConfig` | 无 | 透传 |
| 6146 | WECHAT.START_LOGIN | 无 | 无 | `wechatBridge.startLogin`（扫码） |
| 6154 | WECHAT.LOGOUT | 无 | 无 | `wechatBridge.logout` |
| 6162/6170 | WECHAT.START_BRIDGE / STOP_BRIDGE | 无 | 无 | start/stop |
| 6178 | WECHAT.GET_STATUS | 无 | 无 | `getStatus` |
| 6186 | 'agent:sync-delegation-session' | 协作委派参数 → meta | 无 | `createDelegatedChildSessionMeta`（桥接平台层→侧栏，注释 `ipc.ts:6185`） |

#### N. 版本/公告 + 委托注册 + CDUT 专区 + 离线缓存（`ipc.ts:6210-6300`，11 个注册）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 6210 | CHANGELOG.GET | 无 → `ChangelogEntry[]` | 无 | `getChangelog`（内置本地 CHANGELOG） |
| 6215 | BULLETIN.GET | 无 → `BulletinItem[]` | 无 | `getBulletins`（本地 bulletin.json） |
| — | （非注册）`registerReviewIpc()`/`registerCsLabIpc()`/`registerLongTermMemoryIpc()` | — | — | `ipc.ts:6220,6223,6226` 委托注册子域通道（实现不在本文件，边界） |
| 6230 | CDUT_ZONE.GET_ACCOUNT | 无 → profile | 无 | `cdutAuthManager.getProfile`（`~/.cdutai/cdut-account.json` 独立持久化，注释 `ipc.ts:6229`） |
| 6233 | CDUT_ZONE.GET_SAVED_ACCOUNT | 无 → 脱敏账户 | 无 | `getSavedAccount`（可选解密密码供填充，注释 `ipc.ts:6232`） |
| 6235 | CDUT_ZONE.LOGIN | `CdutLoginInput` | 无 | `cdutAuthManager.login`（CAS 网络） |
| 6239 | CDUT_ZONE.LOGOUT | 无 → `{success:true}` | 无 | `logout` |
| 6245 | CDUT_ZONE.CONFIRM_MUTATION | `CdutMutationConfirmResult` → `{handled}` | 无 | `resolveCdutMutationConfirm`（唤醒挂起的写请求，注释 `ipc.ts:6244`） |
| 6250 | CDUT_ZONE.GATEKEEPER_RESPOND | `CdutGatekeeperDecision` → `{handled}` | 无 | `resolveCdutGatekeeper`（唤醒挂起门禁请求） |
| 6255 | CDUT_ZONE.CALL_DOMAIN_TOOL | `CdutToolInvokeParams` → `CdutDomainToolResult` | 无 | 登录态且非 demo 走 `executeDomainTool`（CDUT_AUTH_PARTITION 会话，`ipc.ts:6264-6265`）；失败/异常**自动回退高仿真演示数据** `cdutDemoService.execute` 且 `isDemo:true`（`ipc.ts:6266-6277`） |
| 6287 | CDUT_ZONE.READ_DOMAIN_CACHE | `name` → `unknown` | 无 | `readJsonFileSafe`（schedule/grades 路径，`ipc.ts:6282-6285`）；未知名/异常返 null |
| 6300 | CDUT_ZONE.WRITE_DOMAIN_CACHE | `{name,payload}` → `{success}` | 无 | `writeJsonFileAtomic`（原子写 `{savedAt,data}`，`ipc.ts:6306`）；payload 非对象返 `{success:false}`（`ipc.ts:6304`） |

#### O. Yanhu Express 浏览器 + 桌宠（`ipc.ts:6316-6490`，40 个；均无 sender 校验）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 6316 | YANHU.INIT_OR_RESTORE | 无 | 无 | `yanhuExpressManager.initOrRestore` |
| 6317 | YANHU.GET_TABS_STATE | 无 | 无 | 透传 |
| 6318 | YANHU.SHOW_VIEW | 无 → 状态 | 无 | showView + `yanhuPetWindowManager.setPresented(true)`（`ipc.ts:6319-6322`） |
| 6324 | YANHU.HIDE_VIEW | 无 → `{success:true}` | 无 | hideView + 释放桌宠前台 + setPresented(false)（`ipc.ts:6325-6327`） |
| 6330 | YANHU.UPDATE_BOUNDS | `YanhuViewLayout` → `{success}` | 无 | updateBounds；visible 时同步桌宠视口（`ipc.ts:6332-6339`）；隐藏时 tour keep-alive 例外（`ipc.ts:6340-6345`） |
| 6348 | YANHU.SYNC_THEME | `YanhuSyncThemeInput` | 无 | `syncTheme(input?.isDark ?? true)` |
| 6352 | YANHU.CREATE_TAB | `YanhuCreateTabInput` | 无 | 透传（`input ?? {}`） |
| 6355/6358 | YANHU.ACTIVATE_TAB / CLOSE_TAB | `YanhuTabRefInput?` | 无 | tabId ?? '' |
| 6361/6364 | YANHU.CLOSE_OTHER_TABS / CLOSE_RIGHT_TABS | 同上 | 无 | 透传 |
| 6367 | YANHU.REORDER_TABS | `YanhuReorderTabsInput` | 无 | `orderedTabIds ?? []` |
| 6370 | YANHU.NAVIGATE | `YanhuNavigateInput` | 无（URL 校验在下层，边界） | 透传 |
| 6373/6376/6379 | YANHU.GO_BACK / GO_FORWARD / RELOAD | `YanhuTabRefInput?` | 无 | 透传 |
| 6382 | YANHU.RETRY_WITH_CLEAN | 同上 | 无 | 透传（清缓存重试） |
| 6385 | YANHU.SHOW_TAB_MENU | 同上 → `{success}` | 无 | `showTabContextMenu` |
| 6389 | YANHU.OPEN_EXTERNAL | `url` → `{success}` | 无（**不经 parseHttpUrl**，下层行为未深读） | `yanhuExpressManager.openExternal` |
| 6402-6414 | YANHU.CDP_GET_DOM / CDP_GET_SOURCE / CDP_GET_NETWORK_LOGS / CDP_GET_CONSOLE_LOGS / CDP_EXECUTE_SCRIPT | `YanhuCdpInput` → `YanhuCdpResult` | 无 | `runYanhuCdp` 包裹：错误降级为 `{success:false,error}` 不抛（`ipc.ts:6395-6401`）；CDP 静默预留（注释 `ipc.ts:6315,6394`） |
| 6420 | YANHU.PET_SYNC_VIEWPORT | `YanhuPetViewport` → `{success}` | 无 | 仅几何同步，不改呈现态（历史 bug 注释 `ipc.ts:6421-6423`） |
| 6428 | YANHU.PET_UPDATE_GEOMETRY | `YanhuPetWindowGeometry` → `{success}` | 无 | `applyGeometry` |
| 6432/6433 | YANHU.PET_GET_BOOTSTRAP / PET_GET_CONFIG | 无 | 无 | 透传 |
| 6434 | YANHU.PET_SAVE_CONFIG | `Partial<YanhuPetConfig>` | 无 | `saveConfig(patch ?? {})`（落盘） |
| 6437/6438 | YANHU.PET_GET_HISTORY / PET_CLEAR_HISTORY | 无 | 无 | 读/清历史 |
| 6442 | YANHU.PET_CHAT_SEND | `YanhuPetChatInput` → `{success}` 或 `{success:false,error}` | 无 | `yanhuPiRuntime.send`（模型请求；活动 tab 提供者+流事件回调 `ipc.ts:6445-6449`）；错误**不抛**、`markChatFinished(message)`（`ipc.ts:6452-6456`） |
| 6458 | YANHU.PET_CHAT_ABORT | 无 → `{success}` | 无 | `yanhuPiRuntime.abort()`（取消） |
| 6463 | YANHU.PET_GET_CHAT_STATUS | 无 | 无 | 透传（引导用） |
| 6467 | YANHU.PET_TOUR_FILL | `YanhuPetTourFillEvent` | 无 | 填输入框不代发（注释 `ipc.ts:6466`） |
| 6472/6475 | YANHU.PET_TOUR_PRESENT / PET_TOUR_RELEASE | 无 | 无 | 前台/释放 |
| 6480 | YANHU.PET_SET_IGNORE_MOUSE | `boolean` | 无 | 鼠标穿透 |
| 6485 | YANHU.PET_SHOW_CONTEXT_MENU | 无 | 无 | `Menu.popup` |
| 6490 | YANHU.OPEN_DIAGNOSTIC_CONSOLE | 无 → `{success}` | 无（隐藏特权指令，注释 `ipc.ts:6489`） | `openDiagnosticConsole` |

#### P. AI 速课堂 Study / AI Class（`ipc.ts:6496-6617`，25 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 6496 | STUDY.INGEST_DOCUMENTS | `StudyIngestDocumentsInput` | 无 | `ingestStudyDocuments(sessionId, filePaths ?? [])`（解析入库） |
| 6500 | STUDY.LIST_DOCUMENTS | `sessionId` | 无 | 透传 |
| 6504 | STUDY.GET_OUTLINE | `StudyDocumentQueryInput` | 无 | 透传 |
| 6508 | STUDY.REMOVE_DOCUMENT | 同上 → `{success}` | 无 | `removeStudyDocument` |
| 6512 | STUDY.TOGGLE_DOCUMENT_ACTIVE | `StudyToggleDocumentActiveInput` | 无 | `setStudyDocumentActive` + **立即失效检索缓存**（`ipc.ts:6514-6515`） |
| 6519 | STUDY.SET_DOCUMENTS_ACTIVE | `StudySetDocumentsActiveInput` | 无 | 同上双写+缓存失效（`ipc.ts:6520-6521`） |
| 6526 | STUDY.GET_TABS | `sessionId` | 无 | 透传 `getStudyTabs` |
| 6528 | STUDY.SAVE_TABS | `{sessionId,tabs,activeTabId}` | 无 | `saveStudyTabs`（`?? []`/`?? ''`） |
| 6534 | STUDY.GET_MINDMAP | `{sessionId,mindmapId?}` | 无 | 透传 |
| 6538 | STUDY.SAVE_MINDMAP_COORDS | `{sessionId,mindmapId,coords}` | 无 | `saveStudyMindmapCoords`（`coords ?? {}`） |
| 6546 | STUDY.EXPORT_OPML | `{sessionId,mindmapId?}` → `{success,...}` | 无 | 无导图返 `{success:false,error}`（`ipc.ts:6548`）；Save 对话框；`writeFile` OPML（`ipc.ts:6555`）；取消 `{success:false,canceled:true}` |
| 6559 | STUDY.GET_FLASHCARDS | `{sessionId,deckId?}` | 无 | 透传 |
| 6563 | STUDY.UPDATE_CARD_RATING | `StudyCardRatingInput` | 无 | 透传 |
| 6567 | STUDY.GET_QUIZ | `{sessionId,quizId?}` | 无 | 透传 |
| 6571 | STUDY.SUBMIT_QUIZ_ANSWER | `StudyQuizAnswerInput` | 无 | 透传 |
| 6575 | STUDY.RESET_QUIZ | `{sessionId,quizId}` | 无 | 透传 |
| 6579 | STUDY.GENERATE_ARTIFACT | `StudyGenerateArtifactInput` | 无 | `generateStudyArtifact` |
| 6583 | STUDY.LIST_ARTIFACTS | `sessionId` | 无 | 透传 |
| 6588 | AI_CLASS.LIST_SESSIONS | 无 | 无 | `listAiClassSessions` |
| 6592 | AI_CLASS.CREATE_SESSION | `courseName` | 无 | `createAiClassSession` |
| 6596 | AI_CLASS.ENSURE_DEMO_SESSION | 无 | 无 | `ensureDemoAiClassSession` |
| 6600 | AI_CLASS.DELETE_SESSION | `sessionId` → `{success:true}` | 无 | `deleteAiClassSession` |
| 6605 | AI_CLASS.GENERATE_GRAPH_RELATIONS | `StudyGraphGenerateInput` | 无 | `generateKnowledgeGraph(sessionId, mode ?? 'ai_smart', progress→event.sender.send GENERATE_PROGRESS)`（`ipc.ts:6608-6610`） |
| 6613 | AI_CLASS.ESTIMATE_GRAPH_COST | `sessionId` | 无 | 透传 |
| 6617 | AI_CLASS.SEARCH_KNOWLEDGE | `StudySearchKnowledgeInput` | 无 | **双引擎路由**：`studyRetrievalEngine==='graphrag'`→`searchStudyRouted`，默认混合检索 `getGlobalStudyRetriever().searchHybrid`（`ipc.ts:6622-6626`） |

#### Q. 存储 / 迁移 / 快捷键 / 窗口（`ipc.ts:6678-6877`，22 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 6678 | STORAGE.GET_STATS | 无 | 无 | `calculateStorageStats` |
| 6682 | STORAGE.CLEANUP | `CleanupOptions` | 无 | `cleanupStorage`（**删除数据**，类别/归档天数由参数定） |
| 6686 | STORAGE.CLEANUP_TEMP | 无 | 无 | `cleanupTempFiles` |
| 6691 | STORAGE.SESSION_COMPACTION_PREVIEW | 无 | 无 | `previewAgentSessionCompaction`（就地收敛超限行，不删会话，注释 `ipc.ts:6690`） |
| 6695 | STORAGE.SESSION_COMPACTION_APPLY | 无 | 无 | `compactAgentSessionStorage`（**就地改写会话存储**） |
| 6701 | STORAGE.SESSION_RESOLVE_BLOBS | `SDKMessage` | 无 | `resolveMessageBlobs`（按需取回外置大载荷，注释 `ipc.ts:6699-6700`） |
| 6707 | AGENT.GET_WORKSPACE_HEATMAP_DAILY | `workspaceId` | 无 | 动态 import `workspace-heatmap-query` |
| 6713 | 'migration:cancelImport' | `tempDir` → void | **目录白名单**：realpath 须在 `tmpdir()` 下且名以 `profer-import-` 开头，否则拒清（`ipc.ts:6717-6727`） | `rmSync` 清临时解压目录；异常静默（`ipc.ts:6732-6734`） |
| 6767 | SHORTCUT.REREGISTER_GLOBAL_SHORTCUTS | 无 → `Record<string,boolean>` | 无 | 动态 import `global-shortcut-service` |
| 6777 | 'migration:getExportPreview' | `workspaceId` | 无 | 动态 import `migration-service` |
| 6782 | 'migration:getShareExportPreview' | 无 | 无 | 同上 |
| 6787 | 'migration:export' | `options` | 无 | `exportData`（写导出文件） |
| 6792 | 'migration:exportV2' | `options` | 无 | `exportDataV2` |
| 6797 | 'migration:parseImportFile' | `filePath` | 无（路径来自打开对话框） | `parseImportFile` |
| 6802 | 'migration:confirmImport' | `options` | 无 | `confirmImport`（**导入写数据**） |
| 6807 | 'migration:openFileDialog' | 无 → 路径\|null | 无 | Open 对话框（`.profer-backup`/`.profer-share`） |
| 6820 | 'migration:saveFileDialog' | `mode` → 路径\|null | 无 | Save 对话框（personal→profer-backup，否则 profer-share，`ipc.ts:6822`） |
| 6836 | IPC.WINDOW_MINIMIZE | 无 | 无（`fromWebContents(event.sender)` 定位窗口） | `win.minimize()` |
| 6844 | IPC.WINDOW_MAXIMIZE | 无 | 无 | **darwin 走 `setFullScreen` 切换**（语义注释 `ipc.ts:6850-6851`），其它 `maximize/unmaximize`（`ipc.ts:6857`） |
| 6861 | IPC.WINDOW_CLOSE | 无 | 无 | `win.close()` |
| 6869 | IPC.WINDOW_IS_MAXIMIZED | 无 → `boolean` | 无 | 窗口销毁返 false（`ipc.ts:6873`） |
| 6877 | IPC.WINDOW_IS_FULL_SCREEN | 无 → `boolean` | 无 | 同上 |

#### R. 任务 / 日程 Planning（`ipc.ts:6915-7167`，21 个；校验器见 §2.2）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 6915 | PLANNING.OPEN_WINDOW | 无 | 无 | 动态 import `planning-window` 开独立窗口 |
| 6920 | PLANNING.LIST_TODOS | `input?`（查询或 `{workspaceId}`）→ `Todo[]` | 查询校验 `parseTodoListQuery`（`ipc.ts:6895-6903`） | workspaceId 为 team 时走 `listTeamTodos`（网络），否则本地 `listTodos`（`ipc.ts:6921-6926`） |
| 6928 | PLANNING.CREATE_TODO | `CreateTodoInput` → `Todo` | title/priority/dueAt/sessionId 校验（`ipc.ts:6929-6932`） | team 工作区走 `createTeamTodo`；本地 `createTodo` + `broadcastPlanningChanged(['todos','reminders'])`（`ipc.ts:6937-6939`） |
| 6943 | PLANNING.START_TODO_AGENT | `StartTodoAgentInput` → `StartTodoAgentResult` | 全量校验（`ipc.ts:6944-6949`）；**乐观锁** `expectedUpdatedAt` 不符抛 `PLANNING_CONFLICT_ERROR`（`ipc.ts:6953`；常量值 `packages/shared/src/types/planning.ts:13`） | **同步单事务**（防 TOCTOU 注释 `ipc.ts:6941-6942`）：必要时 `updateTodo` 迁移归属（`ipc.ts:6955-6961`）→ `createAgentSession`（`ipc.ts:6965-6971`）→ 飞书镜像（`ipc.ts:6972-6974`）；来自规划窗口时转交主窗口 `TODO_AGENT_SESSION_READY`（`ipc.ts:6977-6994`） |
| 6997 | PLANNING.UPDATE_TODO | `UpdateTodoInput` → `Todo\|undefined` | 字段级校验（`ipc.ts:6998-7003`） | team/本地分支 + 广播（`ipc.ts:7004-7010`） |
| 7012 | PLANNING.DELETE_TODO | `id, workspaceId?` → `boolean` | id 校验 | team 透传；本地 `deleteTodo` + 广播（`ipc.ts:7019-7021`） |
| 7024 | PLANNING.LIST_CALENDAR_EVENTS | `input?` | `parseCalendarEventListQuery` | team/本地分支（`ipc.ts:7025-7030`） |
| 7032 | PLANNING.CREATE_CALENDAR_EVENT | `CreateCalendarEventInput` | title/startAt 校验；endAt≥startAt（`ipc.ts:7033-7034`） | team/本地 + 广播 |
| 7043 | PLANNING.UPDATE_CALENDAR_EVENT | `UpdateCalendarEventInput` | 字段校验（`ipc.ts:7044-7048`） | team/本地 + 广播 |
| 7057 | PLANNING.DELETE_CALENDAR_EVENT | `id, workspaceId?` | id 校验 | team/本地 + 广播 |
| 7074 | PLANNING.LIST_GROUPS | `scope, workspaceId?` | `isPlanningGroupScope`（`ipc.ts:7075`） | team/本地 |
| 7082 | PLANNING.CREATE_GROUP | `CreatePlanningGroupInput` | scope/name/color 校验（`ipc.ts:7083`） | team/本地 + 广播（按 scope 不同键，`ipc.ts:7089`） |
| 7091 | PLANNING.UPDATE_GROUP | `UpdatePlanningGroupInput` | 同上（`ipc.ts:7092`） | team/本地 + 广播 |
| 7100 | PLANNING.DELETE_GROUP | `scope, id, workspaceId?` | 同上（`ipc.ts:7101`） | team/本地 + 广播 |
| 7110 | PLANNING.LIST_TAGS | `workspaceId?` | 无 | team/本地 |
| 7117 | PLANNING.CREATE_TAG | `CreatePlanningTagInput` | name/color 校验（`ipc.ts:7118`） | team/本地 + 广播 |
| 7128 | PLANNING.UPDATE_TAG | `UpdatePlanningTagInput` | 同上（`ipc.ts:7129`） | team/本地 + 广播 |
| 7139 | PLANNING.DELETE_TAG | `id, workspaceId?` | id 校验 | team/本地 + 广播 |
| 7151 | PLANNING.LIST_ACTIVE_REMINDERS | `workspaceId?` | 无 | team/本地 |
| 7158 | PLANNING.ACKNOWLEDGE_REMINDER | `id, workspaceId?` | team 分支无 id 校验；本地 id 校验（`ipc.ts:7164`） | team 透传返 undefined；本地 + 广播 |
| 7167 | PLANNING.SNOOZE_REMINDER | `SnoozePlanningReminderInput, workspaceId?` | 本地 minutes 整数 1-10080（`ipc.ts:7173`） | team/本地 + 广播 |

#### S. 推荐 / 定时任务 Automation（`ipc.ts:7257-7327`，9 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 7257 | RECOMMENDATION.LIST | 无 | 无 | `listRecommendations` |
| 7258 | RECOMMENDATION.REFRESH | 无 | 无 | `refreshAutomationRecommendations(listAutomations())` 后返回列表 |
| 7262 | RECOMMENDATION.FEEDBACK | `input` | id 字符串 + status∈{accepted,dismissed,snoozed}（`ipc.ts:7263`）；不存在抛“推荐不存在” | `applyRecommendationFeedback` |
| 7269 | AUTOMATION.LIST | 无 → `Automation[]` | 无 | `listAutomations`（读 `~/.proma/automations.json`，注释 `ipc.ts:7180`） |
| 7274 | AUTOMATION.CREATE | `CreateAutomationInput` → `Automation` | name/prompt 必填 + `validateAutomationFields` + 各 scheduleType 依赖字段必填（`ipc.ts:7277-7285`） | `createAutomation` + `broadcastAutomationsChanged`（`ipc.ts:7286-7287`） |
| 7292 | AUTOMATION.UPDATE | `UpdateAutomationInput` | id 必填 + 字段校验（`ipc.ts:7295-7299`） | `updateAutomation` + 广播 |
| 7306 | AUTOMATION.DELETE | `id` → `boolean` | id 必填 | `deleteAutomation` + 广播 |
| 7316 | AUTOMATION.TOGGLE | `id, active` | id/布尔校验 | `updateAutomation({id,active})` + 广播 |
| 7327 | AUTOMATION.RUN_NOW | `id` | id 必填 | `runAutomationNow(id)`（**立即跑一次 Agent 任务**） |

#### T. 身份认证 / 同步 / 团队 / SSE（`ipc.ts:7340-7694`，43 个；7337-7338/7451-7456/7480-7497/7542-7546/7645-7647 为 `require()` 惰性取服务）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 7340 | AUTH.GET_DEVICE_IDENTITY | 无 | 无 | `getOrCreateDeviceIdentity`（首次生成） |
| 7345 | AUTH.GET_USER_IDENTITY | 无 | 无 | 透传 |
| 7350 | AUTH.UPDATE_PROFILE | `updates` | 无 | **占位实现**：忽略 updates 直接返 `getUserIdentity()`（Phase 3 注释 `ipc.ts:7353`，§10） |
| 7375 | AUTH.LOGIN | `{email,password,revokeSlotId?}` | 无 | `login`（网络）；成功后 `startSyncEngine` + `syncTeamWorkspacesToSidebar`（`ipc.ts:7380-7385`）；日志不打印密码（`ipc.ts:7379`） |
| 7390 | AUTH.LOGOUT | 无 | 无 | `logout` |
| 7395 | AUTH.GET_SERVER_INFO | 无 | 无 | `getServerInfoList` |
| 7400 | AUTH.REGISTER | 注册参数 | 无 | `register(...)`；成功同 LOGIN 后置（`ipc.ts:7404-7409`） |
| 7414 | AUTH.GET_REGISTRATION_OPTIONS | 无 | 无 | 透传 |
| 7419 | AUTH.SEND_REGISTRATION_OTP | `email` | 无 | 透传（网络） |
| 7424 | AUTH.VERIFY_REGISTRATION_OTP | `email, otpToken, code` | 无 | 透传 |
| 7429 | AUTH.GET_AUTH_STATUS | 无 | 无 | `getAuthStatus` |
| 7434 | AUTH.GET_TEAM_AUTH | 无 | 无 | `getTeamAuthWithRefresh` |
| 7439 | AUTH.LIST_DEVICES | 无 | 无 | `listRemoteDevices` |
| 7444 | AUTH.REVOKE_DEVICE | `slotId` | 无 | `revokeRemoteDevice` |
| 7458 | SYNC.GET_STATUS | 无 | 无 | `getSyncStatus` |
| 7463 | SYNC.TRIGGER_SYNC | `workspaceId` | 无 | `triggerSync`（网络） |
| 7468 | SYNC.GET_PENDING_CHANGES | `workspaceId` | 无 | 透传 |
| 7473 | SYNC.DISCARD_PENDING_CHANGES | `workspaceId` | 无 | 丢弃待同步变更 |
| 7499 | TEAM.LIST_WORKSPACES | 无 | 无 | `listTeamWorkspaces`（网络） |
| 7504 | TEAM.CREATE_WORKSPACE | `name` | 无 | 创建 + `syncTeamWorkspacesToSidebar()`（`ipc.ts:7507-7508`） |
| 7513 | TEAM.DELETE_WORKSPACE | `workspaceId` | 无 | 透传 |
| 7518 | TEAM.GET_MEMBERS | `workspaceId` | 无 | 透传 |
| 7523 | TEAM.CREATE_INVITATION | `{workspaceId,email,role}` | 无 | 透传 |
| 7529 | TEAM.LIST_INVITATIONS | `workspaceId` | 无 | 透传 |
| 7534 | TEAM.CANCEL_INVITATION | `{workspaceId,invitationId}` | 无 | 透传 |
| 7548 | 'team:get-announcements' | `workspaceId` | 无 | 透传 |
| 7553 | 'team:create-announcement' | `workspaceId,title,content,isPinned` | 无 | 透传 |
| 7559 | 'team:delete-announcement' | `workspaceId,announcementId` | 无 | 透传 |
| 7565 | TEAM.GET_STATS | `workspaceId` | 无 | `getWorkspaceStats` |
| 7570 | 'team:get-audit-logs' | `workspaceId, limit?, before?` | 未登录抛“未登录”（`ipc.ts:7574`） | **直接 fetch 服务端**（`require('undici').fetch`，`ipc.ts:7578`）；`before` 为**客户端过滤**（注释 `ipc.ts:7583`）；非 2xx 返 `[]` |
| 7591 | TEAM.VERIFY_INVITATION | `token` | 无 | 透传 |
| 7596 | TEAM.ACCEPT_INVITATION | `token` | 无 | accept + `syncTeamWorkspacesToSidebar()`（`ipc.ts:7599-7601`） |
| 7606 | TEAM.DECLINE_INVITATION | `token` | 无 | 透传 |
| 7611 | TEAM.UPDATE_MEMBER_ROLE | `{workspaceId,userId,role}` | 无 | 透传 |
| 7617 | TEAM.REMOVE_MEMBER | `{workspaceId,userId}` | 无 | 透传 |
| 7623 | TEAM.LEAVE_WORKSPACE | `workspaceId` | 无 | 透传 |
| 7628 | TEAM.TRANSFER_OWNERSHIP | `{workspaceId,targetUserId}` | 无 | 透传 |
| 7634 | TEAM.RESTORE_WORKSPACE | `workspaceId` | 无 | restore + 同步侧栏（`ipc.ts:7637-7639`） |
| 7662 | 'sse:connect' | `workspaceId` | 未登录抛（`ipc.ts:7666`） | `sseClient.init/connect`（长连接）+ 设置通知服务 userId（`ipc.ts:7667-7671`） |
| 7675 | 'sse:disconnect' | `workspaceId` | 无 | `sseClient.disconnect` |
| 7682 | 'sse:disconnect-all' | 无 | 无 | `disconnectAll` |
| 7689 | 'team:get-notification-settings' | 无 | 无 | `teamNotificationService.getSettings` |
| 7694 | 'team:update-notification-settings' | `Partial<NotificationSettings>` | 无 | `updateSettings`（落盘） |

#### U. 技能市场 / 团队文件 / 团队记忆 / 资料库 / 桌面通知（`ipc.ts:7703-8083`，37 个）

| 行 | 通道 | 参数/返回 | 守卫 | 副作用/错误 |
| --- | --- | --- | --- | --- |
| 7703 | SKILL_MARKETPLACE.PUBLISH | `{workspaceId,workspaceSlug,skillSlug}` → `{success,skillSlug}` | 无 | 目录/`SKILL.md` 存在性抛错（`ipc.ts:7712,7716`）；**逐文件 `uploadFile` 上传团队文件服务**（SKILL.md + 递归其余文件，`ipc.ts:7719-7739`）；上传失败抛；`enqueueChange(...'publish')` 推同步信封（`ipc.ts:7742-7744`） |
| 7750 | SKILL_MARKETPLACE.UNPUBLISH | 同上 | 无 | manifest 失败抛（`ipc.ts:7754`）；按前缀逐文件 `deleteRemoteFile`（`ipc.ts:7756-7760`）+ `enqueueChange('unpublish')` |
| 7771 | SKILL_MARKETPLACE.LIST_TEAM_SKILLS | `workspaceId` → 技能列表 | 无 | manifest 分组（`ipc.ts:7790-7803`）；逐技能下载 SKILL.md 临时文件解析 frontmatter（`ipc.ts:7811-7838`，失败用默认值 `ipc.ts:7839`）；**临时文件写 tmpdir 未见清理**（`ipc.ts:7827-7828`，§10） |
| 7855 | SKILL_MARKETPLACE.INSTALL_TEAM_SKILL | `{workspaceId,skillSlug,targetWorkspaceSlug}` | 无 | manifest/技能不存在抛（`ipc.ts:7863,7867`）；`downloadFile` 逐文件下载并写目标工作区 skills 目录（`ipc.ts:7872-7881`）；`scanSkillsInDir` 重扫描静默（`ipc.ts:7884-7885`） |
| 7891 | SKILL_MARKETPLACE.CHECK_FOR_UPDATES | `workspaceSlug` → 更新列表 | 无 | 仅查 `sourceWorkspaceId` 技能（`ipc.ts:7900`）；远端 SKILL.md 版本 semver 简比（`ipc.ts:7927-7937`）；网络错误跳过（`ipc.ts:7938`） |
| 7967 | TEAM_FILE.CREATE_DIRECTORY | `{workspaceId,dirPath}` | 无 | 透传 `createRemoteDirectory`（远端） |
| 7973 | TEAM_FILE.UPLOAD | `{workspaceId,workspaceSlug,fileName,fileData,sourcePath?}` | 无 | `uploadFile`（远端写） |
| 7981 | TEAM_FILE.DOWNLOAD | `{workspaceId,workspaceSlug,filePath,uploadedBy?,sha256?}` | 无 | `downloadFile`（远端读→本地） |
| 7987 | TEAM_FILE.DELETE | `{workspaceId,workspaceSlug,filePath}` | 无 | `deleteRemoteFile`（远端删） |
| 7993 | TEAM_FILE.GET_MANIFEST | `workspaceId, workspaceSlug?` | 无 | 透传 |
| 7998 | TEAM_FILE.MOVE | `{workspaceId,workspaceSlug,fromPath,toDir}` | 无 | 透传 |
| 8004 | TEAM_FILE.RENAME | `+ path, newName` | 无 | 透传 |
| 8010 | TEAM_FILE.SEARCH | `workspaceId, {q,page?,limit?}` | 无 | 透传 |
| 8015-8023 | TEAM_FILE.GET_METADATA / PATCH_METADATA / GET_TAGS / GET_STATUSES / SET_PREFERENCE / GET_ACTIVITIES / LIST_TRASH / RESTORE_TRASH / PURGE_TRASH | 各签名见行号 | 无 | 一一透传 `team-file-service`（远端元数据/回收站操作） |
| 8025 | TEAM_MEMORY.LIST | `workspaceId, includeArchived?` | 无 | 透传 `listTeamMemories` |
| 8026 | TEAM_MEMORY.READ | `workspaceId, memoryId` | 无 | 透传 |
| 8027 | TEAM_MEMORY.CREATE | `workspaceId, input` | **assertSensitive**（`ipc.ts:8027`） | `createTeamMemory` |
| 8028 | TEAM_MEMORY.UPDATE | `workspaceId, memoryId, input` | **assertSensitive** | `updateTeamMemory` |
| 8029 | TEAM_MEMORY.LIST_REVISIONS | `workspaceId, memoryId` | 无 | 透传 |
| 8030 | TEAM_MEMORY.ARCHIVE | `workspaceId, memoryId` | **assertSensitive** | `archiveTeamMemory(..., true)` |
| 8031 | TEAM_MEMORY.UNARCHIVE | 同上 | **assertSensitive** | `archiveTeamMemory(..., false)` |
| 8035 | KNOWLEDGE.IMPORT_ITEMS | `filePaths[]` | 数量 1-10、路径 ≤4096 非空（`ipc.ts:8036-8038`） | `importKnowledgeItems`（复制入库） |
| 8043 | KNOWLEDGE.LIST_ITEMS | 无 | 无 | 透传 |
| 8048 | KNOWLEDGE.GET_LIBRARY_SNAPSHOT | 无 | 无 | 透传 |
| 8053 | KNOWLEDGE.GET_ITEM | `itemId` | ≤160 字符（`ipc.ts:8054`） | 透传 |
| 8059 | KNOWLEDGE.DELETE_ITEM | `itemId` | 同上 | `deleteKnowledgeItem`（删） |
| 8065 | KNOWLEDGE.SEARCH_ITEMS | `query, itemIds?, topK?` | query ≤500 非空、itemIds ≤10 各 ≤160、topK 1-20（`ipc.ts:8066-8068`） | `searchKnowledgeItems` |
| 8073 | KNOWLEDGE.SHOW_ITEM_IN_FOLDER | `itemId` | ≤160（`ipc.ts:8074`） | 无本地副本抛（`ipc.ts:8077`）；`shell.showItemInFolder` |
| 8083 | DESKTOP_NOTIFICATION.SHOW | `{title,body}` | 无（须有 sender 窗口，`ipc.ts:8086-8087`） | `new Notification`（body 截 200 字、silent，`ipc.ts:8090-8094`）；点击聚焦窗口 + `CLICKED` 回调（`ipc.ts:8096-8106`）；弹出失败仅 warn（`ipc.ts:8109-8111`） |

> 注册总数核对：上表 A-U 覆盖 589 个注册点＝`ipcMain.handle` 584 ＋ `ipcMain.on` 5（1347、2302、2495、2914、2943），与机械 `grep -c` 一致（584/5）。

## 4. 调用者与调用链

### 4.1 入向（谁调用本文件）

| 调用者 | 证据 | 说明 |
| --- | --- | --- |
| `apps/electron/src/main/index.ts` | `index.ts:189`（import）、`index.ts:945`（启动注册）、`index.ts:1208`（启动失败降级再注册）、`index.ts:646`（`setRendererReadyHandler`）、`index.ts:981-984`（`require('./ipc').resolveAppIconPath` 懒取 Dock 图标）、`index.ts:1228`（`stopAllGoalsForProcessExit`） | 唯一生产入口 |
| 渲染进程（经 preload） | `apps/electron/src/preload/index.ts`（5105 行，`ipcRenderer.invoke/send` 转发各通道；本批**未逐行深读**=边界） | 通道名取自 `@profer/shared` 的 `*_IPC_CHANNELS` 常量（如 `IPC_CHANNELS` 定义 `packages/shared/src/types/runtime.ts:361-408`，抽样核对；其余常量组同型，未逐个核字面量=边界） |
| 独立窗口（Planning/Pocket/桌宠等） | handler 内 `event.sender.getURL()` 判 `window=planning`（`ipc.ts:6978-6983`）；`GET_APK_QR`/Pocket 状态（`ipc.ts:2239-2259`）等供移动模式页面 | 部分通道按 `event.sender` 定向回传（`ipc.ts:5964,6609`） |
| 测试 | `apps/electron/src/main/lib/goal-ipc-routing.test.ts:6-11` 直接读取本文件源码文本、切片 `START_GOAL`→`// ===== Agent 队列消息 =====` 段经 `Bun.Transpiler` 执行 | 见 §9 |

### 4.2 出向（本文件调用谁，按导入域）

- Electron 原语：`ipcMain/nativeTheme/shell/dialog/BrowserWindow/app/Notification/session`（`ipc.ts:7`）。
- node 原语：path/crypto/fs/fs.promises/os/child_process（`ipc.ts:8-13`）。
- `@profer/shared`：26 个 `*_IPC_CHANNELS` 常量组 + 60+ 类型 + `isAgentRuntime/isChannelEnabledForRuntime/isProferPermissionMode/normalizePathForCompare/resolveEffectivePermissionMode/normalizeOfvThemePayload/mindMapToOpml/isReviewOwnedAgentSession` 等（`ipc.ts:15,129,130,134,196,331`）。
- 本进程服务（`./lib/**`，约 60 模块，`ipc.ts:18-454`）：runtime-init、git-diff-service、channel-manager、conversation-manager、attachment-service、settings-service、skin-*、agent-session-manager、agent-service、agent-preset-manager、agent-workspace-manager、planning-manager、automation-manager、team-*、skill-*、global-skill-manager、feishu/dingtalk/wechat/lark *-manager、cdut-*、study-*、storage-service、migration-service、auth-service、sync-manager、sse-client、team-file-service、knowledge-item-service、process-monitor、goal-* 等。**下层实现属各自文件（边界）**。
- 动态 import / 惰性 require（延迟加载点）：`detached-preview-window`（`ipc.ts:1501,1512`）、`screenshot-service`（`ipc.ts:1521`）、`file-preview-service`（多处 `ipc.ts:1551,1611,3126,4951,5042,5061,5082,5103`）、`conversation-title-service`（`ipc.ts:1839`）、`qrcode`（`ipc.ts:2291,5950`）、`mcp-validator`（`ipc.ts:3611`）、`project-graph-service`（`ipc.ts:4397,4410,4426`）、`retrospective-service`（`ipc.ts:4436`）、`document-parse-tools`（`ipc.ts:5125`）、`local-file-protocol`（`ipc.ts:5173`）、`planning-window`（`ipc.ts:6916`）、`team-planning-service`（`ipc.ts:6923` 等 10 处）、`migration-service`（`ipc.ts:6778` 等 7 处）、`global-shortcut-service`（`ipc.ts:6770`）、`workspace-heatmap-query`（`ipc.ts:6708`）、`@larksuiteoapi/node-sdk`（`ipc.ts:5949`）、`auth-service`/`identity-service`/`sync-manager`/`team-manager`/`sse-client`/`team-notification-service`/`team-file-service`/`knowledge-item-service`/`agent-workspace-manager`/`undici`（`ipc.ts:1637,7337-7338,7361-7362,7381,7405,7415,7420,7425,7451-7456,7480-7497,7542-7546,7578,7645-7647,7706-7709,7742,7763,7812,7816-7819,7858-7860,7884,7894,7908,7911,7947-7965,8039,8044,8049,8055,8061,8069,8075`）。
- 外部进程/网络：`runCmd` spawn（reg/cmd/assoc/ftype/xdg-mime/swift/sips/PlistBuddy，`ipc.ts:994-1027` 及 1053-1260）、`powershell.exe`（`ipc.ts:667`）、`open -a`/`shell.openPath`（`ipc.ts:1567-1577,4873`）、`fetch`（官方健康 `ipc.ts:1656`、releases `ipc.ts:5675`、审计日志 `ipc.ts:7578`、技能市场 SKILL.md 下载 `ipc.ts:7822,7912`）、OAuth 登录 `loginXaiOAuth`（`ipc.ts:1785`）、Lark/飞书/钉钉/微信桥、CDUT CAS/教务（`ipc.ts:6235,6265`）、Pi 运行时 `yanhuPiRuntime.send`（`ipc.ts:6445`）。

### 4.3 委托注册链

`registerIpcHandlers()` → `registerReviewIpc()` / `registerCsLabIpc()` / `registerLongTermMemoryIpc()`（`ipc.ts:6220-6226`）→ 各自文件内 `ipcMain.handle`。review-ipc.ts 注释明确幂等依赖外层守卫（`review-ipc.ts:12,105`）。三个子域的通道矩阵不在本手册（各自主手册覆盖）；本文件不读写其内部状态。

## 5. 数据 I/O、读写与副作用

### 5.1 磁盘/持久化（经下层服务；行号为本文件调用点）

| 目标 | 读 | 写 |
| --- | --- | --- |
| Goal 状态 `userData/goals.json` | `ipc.ts:482-485`（readStates/history） | `ipc.ts:483-484`（saveStates/archive）、恢复 `ipc.ts:1332` |
| 设置 `settings.json`（`getSettings/updateSettings`） | 大量读取（如 `ipc.ts:2716,3083,4267,6623,6644,6740`） | 写点：2191/2251/2258/2271/2277/2352/2399/2427/2439/2569/2596/3097/4180 |
| 对话/消息（conversation-manager） | 1799/1815/1823/1864/1881/1898/1948/1957/1965/1986 | create/delete/update/fork/truncate（1807/1831/1848/1856/1922/1936/1956/1978/1994） |
| Agent 会话（agent-session-manager/agent-service） | 2675/2704/3112/3243/3261/3277/3301/3356/3375/3417/4657 | create/delete/move/fork/rewind/ui-meta（2716/3211/3223/3234/3252/3268/3280/3290/3310/3343/3451/3472） |
| 工作区/skills/记忆文件（agent-workspace-manager 等） | 3587/3595/3628/3636/3671/3680/3706/3722/3729/4199/4206/4220/4227/4241/4248/4265/4282 | 3603/3644/3652/3664/3691/3699/3713/3736/3743/3750/3757/4214/4236/4258 |
| 音效文件 | 2380（existsSync） | `copyFileSync` 2389、`rmSync` 2420 |
| Scratch Pad | `readFileSync` 2471 | `writeFile` 2485、`writeFileSync` 2499、导出 2526 |
| 剪贴板预览 `tmpdir()/profer-preview/` | — | `writeFile` 4909 |
| CDUT 离线缓存 | `readJsonFileSafe` 6293 | `writeJsonFileAtomic` 6306（原子写） |
| 迁移导入/导出文件 | `parseImportFile` 6799 | `exportData/exportDataV2/confirmImport` 6789/6794/6804；临时解压目录清理 6729 |
| 自定义资源另存 | `readFileSync` 2088 | `writeFileSync` 2048/2088（用户所选路径） |
| 预设导入/导出 | `readFileSync` 2877 | `writeFileSync` 2860 |
| 团队技能市场 | 远端 manifest/SKILL.md 下载（7753/7822/7912） | `uploadFile/deleteRemoteFile/downloadFile→writeFileSync`（7719-7739/7759/7874-7880） |
| 会话存储压缩/清理 | 6679-6702 | `cleanupStorage/cleanupTempFiles/compactAgentSessionStorage`（6683/6687/6696） |
| 外部进程 | `runCmd`/spawn 见 §4.2 | 同左（含注册表查询、LaunchServices、图标转换） |

### 5.2 原子性/幂等/并发

- 原子写：CDUT 缓存用 `writeJsonFileAtomic`（`ipc.ts:6306`）；其余经下层（`safe-file` 等，未深读=边界）。
- 幂等：注册守卫（`ipc.ts:1326-1330`）；`ENSURE_PROJECT_DRAFT_SESSION` 复用草稿（`ipc.ts:2883`）；附件附加去重（`ipc.ts:4500,4544`）。
- 并发协调：会话删除合并（`ipc.ts:460,3211`）；SEND_MESSAGE 并发保护（`coordinateAgentSend`，`ipc.ts:3857`）；START_TODO_AGENT 单事务防 TOCTOU（`ipc.ts:6941-6942`）；文件搜索并发去重（`ipc.ts:4998`）；飞书注册单例（`ipc.ts:5942`）；OPTIMISTIC 锁 revision/expectedUpdatedAt（`ipc.ts:2761,2780,4066,6953`）。
- read-then-write 竞态（未加锁）：CHAT/AGENT 的 TOGGLE_PIN/TOGGLE_ARCHIVE、CLEAR/SET_COMPLETION_STATE（`ipc.ts:1864,1881,3243,3261,3277,3301`）。

### 5.3 进程/窗口/网络副作用

窗口广播见 §3.0；原生对话框（save/open）：2037/2078/2538/2853/2870/4477/6549/6809/6824；系统集成：`shell.openExternal/openPath/showItemInFolder/trashItem`、`app.setLoginItemSettings`（2346）、`app.dock.setIcon`（2565）、`Notification`（8090）、全局快捷键重注册（6770）；网络：§4.2 列出的 fetch/桥/OAuth/CAS/同步/SSE；定时器：24h 归档（6666）、screenshot/migration 等由下层持有。

### 5.4 失败、取消与恢复

- **错误形态**：`ipcMain.handle` 抛出的 `Error` 会序列化给渲染层（如 `REVISION_CONFLICT`、`AGENT_PRESET_REQUIRED`、FS 文案 `toFsErrorMessage`）；单向 `ipcMain.on` 通道把异常吞掉或降级为 `event.returnValue=false`（`ipc.ts:2923-2925,2961-2963,2320-2322,2503`）。
- **取消**：文件搜索 `file:cancel-search`（`ipc.ts:5028`）；安装包下载 `INSTALLER.CANCEL`（`ipc.ts:2629`）；飞书注册 `REGISTER_APP_CANCEL`（`ipc.ts:5999`）；桌宠 `PET_CHAT_ABORT`（`ipc.ts:6458`）；迁移 `migration:cancelImport`（`ipc.ts:6713`）。
- **恢复/重启**：Goal 状态恢复（`ipc.ts:1332`）；`RESTORE_ACTIVE_STREAMS` 重绑流（`ipc.ts:3117`）；`GET_PENDING_REQUESTS` 恢复交互请求（`ipc.ts:4376`）；`findOrphanSessions` 健康检查（`ipc.ts:3480`）；启动清理（`ipc.ts:6669-6674,6738-6762`）；runtime 切换/权限热切失败回滚（`ipc.ts:4076-4088,4179-4189`）；MOVE_SESSION 运行态 500ms 重试（`ipc.ts:3337-3342`）。
- **不可恢复点**：`DELETE_SESSION`/`DELETE_WORKSPACE`/`STORAGE.CLEANUP`/`SESSION_COMPACTION_APPLY`/团队文件 DELETE/PURGE_TRASH 等删除类无本层撤销（回收站类除外，`MOVE_TO_TRASH`/`MOVE_ATTACHED_TO_TRASH` 可恢复，`ipc.ts:4742,5435`）。

## 6. 分支、失败、取消与恢复

重要条件分支（补充 §3 矩阵；失败/取消/恢复全集见 §5.4）：

- **幂等短路**：`_ipcHandlersRegistered` 为 true 时整个注册直接返回（`ipc.ts:1326-1329`），防止 `ipcMain.on`/`nativeTheme.on`/`setInterval` 累积泄漏。
- **denied 分支模式**：文件通道拒绝时多为“空值返回”（`''`/`null`/`[]`/空结构，`ipc.ts:1390,1409,1424,1439,1464,1486,3025`）而非抛错；而 `LIST_DIRECTORY`/`READ_ATTACHED_FILE`/`DELETE_FILE` 等抛 `Error`（`ipc.ts:4684,5256,5340`）；单向 `on` 通道吞异常（`ipc.ts:2923,2961`）。同为“拒绝”，错误形态按通道类型不同（照实记录）。
- **平台分支**：darwin/win32/linux 三路默认应用探测（`ipc.ts:1211-1259`）；`SYSTEM_OPEN_FILE` darwin `open -a` vs 其它 `confirmExecutableFileOpen`+`shell.openPath`（`ipc.ts:1560-1579`）；`WINDOW_MAXIMIZE` darwin 全屏语义（`ipc.ts:6852-6855`）。
- **构建目标分支**：`getBuildTarget()==='commercial'` 时 releases 走服务端（`ipc.ts:5686-5713`）；商业模式下 `DECRYPT_KEY` 被拒（`ipc.ts:1702`）。
- **引擎路由分支**：记忆检索 hipporag/FTS5（`ipc.ts:4266-4275`）；学习检索 graphrag/混合（`ipc.ts:6622-6626`）。
- **team/本地分支**：Planning 全族按 `getAgentWorkspace(workspaceId)?.type === 'team'` 路由本地 manager 或 team-planning-service（`ipc.ts:6921-6926` 等 14 处）。
- **运行中保护分支**：切换模型/快速模式/推理档位/内核在 `isAgentSessionActive` 时抛（`ipc.ts:3179,4102,4118,4134,4174`）；带教模式例外允许（`ipc.ts:4139-4141`）。
- **降级回退分支**：CDUT 业务域真实抓取失败自动回退演示数据（`ipc.ts:6266-6277`）；渠道后台同步失败继续用本地缓存（`ipc.ts:1643-1645`）；商业 releases 拉取失败返 null/[]（`ipc.ts:5690-5693`）。
- **错误文案**（用户可见）：FS 三动作文案（`ipc.ts:710,713,716,728,730`）、`REVISION_CONFLICT: 会话状态已更新，请刷新后重试`（`ipc.ts:2761`）、`AGENT_PRESET_REQUIRED: 请先选择一个 Agent 预设，然后再开始对话`（`ipc.ts:3868`）、`PLANNING_CONFLICT_ERROR`=`'日程已被其他窗口修改，请重新加载后再试'`（`packages/shared/src/types/planning.ts:13`）、`'内部审核会话不可通过普通 Agent 入口访问'`（`agent-session-manager.ts:662`）、`'仅允许主窗口或科学助理窗口调用此 Agent IPC'`（`ipc-sender-guard.ts:57`）。
- **失败后状态**：权限热切失败回滚 meta+CSLab 信任（`ipc.ts:4078-4087`）；runtime 切换失败回滚快照（`ipc.ts:4183-4189`）；删除会话先停运行再删盘（`ipc.ts:3211-3224`）；`SEND_MESSAGE` 的预设引用脏数据自愈（`ipc.ts:3871-3873`）。

## 7. 权限与权威状态

### 7.1 sender/窗口身份（谁能调）

| 守卫 | 实现 | 覆盖通道 |
| --- | --- | --- |
| `assertSensitiveAgentIpcSender` | `ipc-sender-guard.ts:55-59`；=主窗口 webContents（`ipc-sender-guard.ts:22-27`）或 `registerTrustedAgentSender` 登记的可信次级窗口（WeakSet，`ipc-sender-guard.ts:34-52`，科学助理独立窗口）；失败抛“仅允许主窗口或科学助理窗口调用此 Agent IPC” | 约 50 个敏感通道：GET_SDK_MESSAGES/RESTORE_ACTIVE_STREAMS/FILE_PREVIEW_*/UPDATE_QUEUE_AUTO_SEND/UPDATE_SESSION_MODEL/REGENERATE_TITLE/DELETE_SESSION/MIGRATE_CHAT_TO_AGENT/GET_SESSION_PROCESS_COUNT/LIST_SESSION_PROCESSES/KILL_PROCESS/FORK_SESSION/REWIND_SESSION/SEND_MESSAGE/Goal 全族/STOP_AGENT/QUEUE_MESSAGE/GET_TASK_OUTPUT/GET_RUNTIME_CAPABILITIES/PERMISSION_RESPOND/STOP_TASK/UPDATE_SESSION_PERMISSION_MODE/UPDATE_SESSION_AGENT_RUNTIME/WRITE_WORKSPACE_PROFILE/WRITE_WORKSPACE_AUTO_MEMORY_FILE/WRITE_WORKSPACE_MEMORY_ARCHIVE_FILE/ASK_USER_RESPOND/EXIT_PLAN_MODE_RESPOND/GET_PENDING_REQUESTS/GET_GRAPH/GET_GRAPH_SUMMARY/APPEND_GRAPH_EVENT/RUN_RETROSPECTIVE/SAVE_FILES_TO_SESSION/ATTACH_*/DETACH_*/GET_SESSION_PATH/TEAM_MEMORY CREATE/UPDATE/ARCHIVE/UNARCHIVE（逐行见 §3 矩阵“守卫”列） |
| `assertMainRenderer` | `ipc.ts:2894-2901` | 受管浏览器族（`ipc.ts:2914-3075`）、REFRESH_BROWSER_PREVIEW_THEME（`ipc.ts:3053`） |
| `assertBrowserSessionAccess` | `ipc.ts:2902-2912` | 同上除 REFRESH 主题 |
| 无 sender 校验 | — | **其余约 530 个通道**（chat/channel/settings/skin/planning/automation/team/study/yanhu/文件预览族等）。任何可发 IPC 的渲染进程可调；部分通道对 `event` 完全忽略。照实记录为现状（非建议） |

### 7.2 路径/数据权限（谁能读写什么文件）

- 写边界 deny-by-default：`isPathAllowed`（`ipc.ts:760-784`）+ 授权根白名单（`ipc.ts:531-577`：工作区、`tmp/profer-preview`、用户常用目录、会话/工作区显式附加）。审核私有桌面路径（`isReviewPrivateDesktopPath`，`lib/review-private-file-access.ts`）全域拒绝。
- 只读预览放宽：`isPreviewPathAllowed`（`ipc.ts:795-799`）→ `isReadOnlyPreviewPathAllowed`（`lib/preview-path-policy.ts:110`）。
- 工作区写操作收口：`assertInsideAgentWorkspaces`（`ipc.ts:589-595`）供 DELETE_FILE/MOVE_TO_TRASH/OPEN_FILE/SHOW_IN_FOLDER/RENAME_FILE/MOVE_FILE。
- worktree 例外：`ensurePathAllowedWithWorktree`（`ipc.ts:888-916`），git 背书（--git-common-dir 语义在 `lib/git-diff-service`，未深读）。
- Skill 路径段：`assertSafeSkillSegment`（`lib/skill-path-security.ts:17`），仅部分 skill/global-skill 通道调用（WRITE_SKILL_FILE 等未调，§10）。
- 迁移临时目录白名单：`profer-import-*` + `tmpdir`（`ipc.ts:6717-6727`）。

### 7.3 权威状态（谁产生/以谁为准）

- 会话/工作区/预设权威状态：agent-session-manager / agent-workspace-manager / agent-preset-manager 的持久化（本文件只做校验+转发+`publishAgentSessionProjection` 投影，`ipc.ts:2763,2786,4086,4090`）。
- 权限模式权威：`updateAgentSessionMeta.permissionMode` + `resolveEffectivePermissionMode`（preset 覆盖，`ipc.ts:472,3867`）；CSLab 工具信任为派生态（grant/revoke 联动，`ipc.ts:4070-4074,4350-4354`）。
- 进程归属权威：Pi shell 启动点 ownership registry（注释 `ipc.ts:3366`）；KILL 以 registry + PID/startTime 双因子为准（`ipc.ts:3416-3435`）。
- 待决交互请求权威：permissionService/askUserService/exitPlanService 的 pending 列表（`ipc.ts:4010,4305,4327`）。
- 渠道/商业能力权威：channel-manager + auth-service（服务端），本地缓存为展示副本（`ipc.ts:1632-1646`）。
- 特区账户权威：`cdutAuthManager`（`~/.cdutai/cdut-account.json`，`ipc.ts:6229-6233`）。

## 8. 修改影响面

- **入向**：`index.ts` 生命周期（189/646/945/981/1208/1228）；preload 5105 行转发 + renderer 全部 UI 功能（对话、Agent、浏览器、皮肤、设置、Planning、团队、学习、专区）；Pocket/移动模式（remote-service，`ipc.ts:2239-2259`）；独立 Planning 窗口（`ipc.ts:6978-6990`）；桌宠/智联万站。改通道名/签名/返回形状必须同步：`@profer/shared` 常量组、`apps/electron/src/preload/index.ts`、renderer 调用点。
- **出向**：约 60 个 `./lib/**` 服务。改转发参数影响下层校验；下层接口存在≠本层已传对参数（边界）。
- **注册语义**：`ipcMain.handle` 按 channel 去重覆盖（注释 `ipc.ts:1324`），新增重复 channel 会静默覆盖旧 handler；`ipcMain.on`/`nativeTheme.on`/`setInterval` 不去重——必须维持幂等守卫。
- **权限回归风险**：动 `isPathAllowed`/`getAuthorizedRoots`/`isPreviewPathAllowed` 影响全部文件类通道（§3 L 组 + 系统打开类）；动 `assertSensitiveAgentIpcSender` 影响约 50 个敏感通道；动 `assertOrdinaryAgentSession` 影响会话族（含 review 归属隔离）。
- **测试同步**：`goal-ipc-routing.test.ts:7-8` 以**源码文本标记**（`'  ipcMain.handle(AGENT_IPC_CHANNELS.START_GOAL,'` 与 `'  // ===== Agent 队列消息 ====='`）切片——移动/改写这两处文本或调整 Goal 段落边界会直接破坏该测试（`goal-ipc-routing.test.ts:9` 显式抛“Goal IPC 注册边界不存在”）。
- **设置/广播契约**：改 SETTINGS.UPDATE 的字段剥离或主题广播键影响多窗口同步（`ipc.ts:2199-2232`）；改 `emitSessionStreamEvent` 出口影响 Pocket 广播与 WS 重放一致性（`ipc.ts:4019-4024` 注释）。

## 9. 测试证据

本轮 `NOT_RUN`：未运行任何产品测试/typecheck/build/Electron GUI/真实模型（只做静态调查与文档检查）。

直接测试（针对本文件代码）：

| 测试文件 | 用例数 | 真实断言 | 备注 |
| --- | --- | --- | --- |
| `apps/electron/src/main/lib/goal-ipc-routing.test.ts` | 5 个 `test(`（:49,55,60,65,70） | ①UPDATE_GOAL/GET_GOAL_HISTORY 均过 guard 且调用服务：`expect(h.calls).toEqual(['guard','update','guard','history'])`（:51-53）；②Goal owner 时 STOP_AGENT 只 `['guard','mirror-stop','goal-stop']` 不误停新 owner（:55-59）；③`owned-review` 会话 STOP_AGENT 抛“内部审核会话”且不调服务（:60-64）；④普通+Goal 并存时 `['guard','mirror-stop','ordinary-stop','goal-stop']`（:65-69）；⑤非法 START_GOAL/UPDATE_GOAL/GET_GOAL_HISTORY 抛错且只触发 guard（:70-76） | **真实执行本文件源码**：读 `../ipc.ts` 文本、`Bun.Transpiler` 转换 Goal 段（:6-11）、依赖注入 mock（ipcMain 假实现、goalSessionService 假实现、`isGoalRunActive` 可控、`feishuBridgeManager`/`stopAgentAndWait` 记录调用）。mock/真实边界：被测 handler 为真源码，依赖为 mock |
| `apps/electron/src/main/lib/ipc-sender-guard.test.ts` | 1 个 `test(`（:22） | `isMainWindowSender` 对主窗口 true、他窗 false、销毁 sender false、销毁主窗 false；`assertMainWindowSender` 抛“仅允许 Profer 主窗口”（:27-32） | 覆盖 `ipc.ts:1302` 所依赖 guard 的**主窗口分支**；未覆盖 `isTrustedAgentSender` 的可信次级窗口分支与 `assertTrustedAgentSender` 文案 |

间接证据（其它测试经由本文件委托/常量，非本文件 handler）：`review-*.test.ts` 族经 `registerReviewIpc` 的通道（review-ipc.ts 实现）；`agent-message-queue.test.ts:17` 引用 `agent:send-message` 的 Electron 错误串断言渲染端队列解析（不测本文件 handler 行为）；`review-owned-session.p03.test.ts:43-44` 断言 `isReviewOwnedAgentSession` 真值（依赖被本文件 `ipc.ts:2675,2705` 使用）。

**覆盖缺口（否定结论，检索范围=冻结树全部 `*.test.ts`，grep 模式 `parseHttpUrl|toFsErrorMessage|isPathAllowed|getFileSearchRoots|findLockingProcesses|getDefaultAppInfoForFile|select-and-upload-folder|file:search-candidate|SEARCH_WORKSPACE_FILES|READ_ATTACHED_FILE|ensurePathAllowed`，0 命中）**：这些内部函数与文件族 handler 无直接测试；除 Goal 段 5 个用例外，其余 580+ 注册点无任何直接测试覆盖；矩阵 §3 中标注的行为断言均为源码静态阅读结论，运行时行为未验证（NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 589 注册点（584 handle+5 on）、行号、通道、参数、守卫、分支、副作用如 §3 矩阵 | 已证实 | 全文件 1-8114 逐行阅读 + 机械 grep 计数核对（584/5） |
| 5 个导出及签名、调用者（index.ts:189/646/945/981-984/1208/1228） | 已证实 | `ipc.ts:506,1284,1297,1318,1322` + grep 全树 |
| `setIpcMainWindowGetter` 冻结树无调用者 | 已证实（否定结论） | grep 全树 `*.ts`（仅定义处 ipc.ts:1297）；含测试文件也未命中 |
| assertTrustedAgentSender 主窗口/可信次级窗口语义与抛错文案 | 已证实 | `ipc-sender-guard.ts` 全 59 行读毕（22-27,34-52,55-59） |
| assertOrdinaryAgentSession 依据 `isReviewOwnedOrDeletedAgentSessionId(sessionId)`（按 ID 判定）抛“内部审核会话不可通过普通 Agent 入口访问” | 已证实 | `agent-session-manager.ts:658-664` |
| Goal 段 5 测试断言如 §9 | 已证实 | `goal-ipc-routing.test.ts` 全 77 行读毕 |
| IPC_CHANNELS 字面量（runtime:get-status 等） | 已证实（抽样） | `packages/shared/src/types/runtime.ts:361-408` 读毕该常量组；其余常量组（AGENT/CHAT/…26 组）字面量**未逐组核**→推断其命名规律与注释一致 |
| 渲染端经 preload 按同名常量调用各通道 | 推断 | preload 存在（5105 行）+ 常量共享；未逐行核 preload |
| “AI 代批开关 Agent 工具不可达”（`ipc.ts:2183` 注释） | 推断 | 仅注释声明；未检索工具路由实现 |
| 下层 60 个服务的读写/网络/锁行为 | 边界/未知 | 本批未深读（仅知本层调用点与参数） |
| 真实 Electron 运行行为（重复注册覆盖、returnValue、窗口焦点） | 未知 | NOT_RUN，无运行证据 |
| **现存实现矛盾/不一致（照实记录）**：①“中止 Agent 执行…”注释（`ipc.ts:3890-3892`）紧邻 START_GOAL（3893），但描述的是 STOP_AGENT（3933）——注释错位 | 已证实（矛盾存在） | 行号如列 |
| ②UPDATE_SESSION_PERMISSION_MODE 注释“不广播”（`ipc.ts:4051`）vs 成功路径 `publishAgentSessionProjection`（`ipc.ts:4090`） | 已证实（矛盾存在） | 同左 |
| ③SETTINGS.UPDATE 剥离 `reviewAgentAutoApproval*`（`ipc.ts:2199-2200`）vs UPDATE_SYNC 不剥离直接 `updateSettings(updates)`（`ipc.ts:2306`） | 已证实（不一致存在） | 同左 |
| ④ATTACH_FILE 存 realpath（`ipc.ts:4539-4547`）vs DETACH_FILE 按原始 `input.filePath` 过滤（`ipc.ts:4562`），symlink 输入下可能删不掉 | 已证实（不一致存在） | 同左 |
| ⑤SAVE_FILES_TO_WORKSPACE/ATTACH_WORKSPACE_* 无 sender/会话校验（`ipc.ts:4455,4569+`）vs 会话级 ATTACH_* 有 assertSensitive（`ipc.ts:4494+`） | 已证实（不一致存在） | 同左 |
| ⑥LIST_DIRECTORY 用只读预览边界（`ipc.ts:4683`）vs LIST_ATTACHED_DIRECTORY 用严格 `isPathAllowed`（`ipc.ts:5255`）——同类列表接口边界不同 | 已证实（不一致存在） | 同左 |
| ⑦FEISHU.SAVE_CONFIG 自动重启 bot（`ipc.ts:5784-5792`）vs DINGTALK.SAVE_CONFIG 不重启（`ipc.ts:6026-6030`） | 已证实（不一致存在） | 同左 |
| ⑧AUTH.UPDATE_PROFILE 为占位实现，忽略入参返回 `getUserIdentity()`（`ipc.ts:7350-7356`） | 已证实 | 同左 |
| ⑨LIST_TEAM_SKILLS 下载 SKILL.md 写 `tmpdir()/profer-skill-<slug>.md` 未见删除（`ipc.ts:7827-7828`） | 已证实 | 同左（未检索其它清理点=范围限定本 handler） |
| ⑩TRUNCATE_MESSAGES_FROM 标注已废弃仍保留完整功能（`ipc.ts:1926-1941`） | 已证实 | 同左 |
| ⑪GET_MESSAGES 无 sender 守卫（`ipc.ts:1812`）vs GET_SDK_MESSAGES 有（`ipc.ts:3110`） | 已证实（不一致存在） | 同左 |
| ⑫WRITE_SKILL_FILE/READ_SKILL_FILE 等 skill 子文件通道未调 `assertSafeSkillSegment`（`ipc.ts:3726-3757`）而 toggle/import 通道调用（`ipc.ts:3660-3690`） | 已证实（不一致存在） | 同左；slug 校验是否在 `skill-path-security` 之外的下层兜底=未知 |
| setIpcMainWindowGetter 的设计意图（测试注入）当前无人消费 | 已证实 | 同上否定检索 |

## 11. 覆盖表

| 符号/域 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 个导出 | §2 | 506/1284/1297/1318/1322 | covered |
| 模块级辅助（§2.1/2.2/2.3 全表） | §2、§5、§7 | 456-1320 及闭包各行 | covered |
| 注册期副作用（14 项） | §3.0 | 1332-7660 | covered |
| 矩阵 A 运行时/Git/预览/系统（19） | §3.2-A | 1347-1628 | covered |
| 矩阵 B 渠道（15） | §3.2-B | 1634-1790 | covered |
| 矩阵 C 对话与附件（29） | §3.2-C | 1796-2110 | covered |
| 矩阵 D 用户档案/皮肤/设置（24） | §3.2-D | 2120-2355 | covered |
| 矩阵 E 音效/Scratch/图标/环境/安装/代理（18） | §3.2-E | 2373-2667 | covered |
| 矩阵 F 会话/预设（31） | §3.2-F | 2672-2889 | covered |
| 矩阵 G 受管浏览器（24） | §3.2-G | 2914-3100 | covered |
| 矩阵 H 流/会话管理/进程/Skill（74） | §3.2-H | 3107-3832 | covered |
| 矩阵 I 发送/Goal/队列/任务/权限（23） | §3.2-I | 3841-4163 | covered |
| 矩阵 J 记忆/交互/图谱（19） | §3.2-J | 4196-4431 | covered |
| 矩阵 K 附件/工作区附加（17） | §3.2-K | 4444-4642 | covered |
| 矩阵 L 文件系统/预览族（32） | §3.2-L | 4652-5665 | covered |
| 矩阵 M Release/Lark/飞书/钉钉/微信（56） | §3.2-M | 5683-6186 | covered |
| 矩阵 N 公告/委托/CDUT（11） | §3.2-N | 6210-6300 | covered |
| 矩阵 O Yanhu/桌宠（40） | §3.2-O | 6316-6490 | covered |
| 矩阵 P Study/AI Class（25） | §3.2-P | 6496-6617 | covered |
| 矩阵 Q 存储/迁移/窗口（22） | §3.2-Q | 6678-6877 | covered |
| 矩阵 R Planning（21） | §3.2-R | 6915-7167 | covered |
| 矩阵 S 推荐/Automation（9） | §3.2-S | 7257-7327 | covered |
| 矩阵 T 认证/同步/团队/SSE（43） | §3.2-T | 7340-7694 | covered |
| 矩阵 U 市场/团队文件/记忆/资料/通知（37） | §3.2-U | 7703-8083 | covered |
| 守卫体系 | §3.1、§7 | 见各节 | covered |
| 调用链（入向/出向/委托） | §4 | 见各节 | covered；preload/下层=partial（边界） |
| 数据 I/O/副作用/失败恢复 | §5、§6 | 见各节 | covered（下层行为=partial） |
| 测试 | §9 | goal-ipc-routing 5 用例 + guard 1 用例 | covered（本文件其余 580+ 通道=unknown/无测试） |
| 运行验证 | §9 | — | unknown（NOT_RUN，用户接手） |







