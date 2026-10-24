---
path: apps/electron/src/main/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc7093234e6a119379cee9a3051215f71307025f
sha256: 7bc8571522c42f4e67587cdd0aa05e41f1ae72965e1da2977775c0cf17a68b5b
lines: 1282
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/index.ts

## 1. 结论与边界

Electron **主进程入口**（`package.json` 的 `main` 指向构建产物；本文件为源码入口）。职责：进程级初始化（userData 隔离、单实例锁、协议注册、证书策略）、主窗口/启动闪屏生命周期、外部导航拦截、Bridge（飞书/钉钉/微信）注册与自愈、`app.whenReady` 两梯队启动编排、退出清理链。**单点失败均被隔离**，目标是"界面必须先出来"。

不做的事：不注册业务 IPC handler（`ipc.ts` 的 `registerIpcHandlers`，本文件只调用）；不做 preload 桥（`preload/index.ts`）；不实现设置存储/渠道/Agent 等业务模块（只 import 并在生命周期点调用）；不含渲染逻辑。

## 2. 导出与关键符号

**导出仅 1 条**：`export { getMainWindow }`（`apps/electron/src/main/index.ts:373`，从 `./lib/main-window-state` 转出的 getter）。全文件 `grep '^export'` 只有此一处。消费者：`apps/electron/src/main/lib/dock-badge-service.ts:11`（`import { getMainWindow } from '../index'`）；`ipc.ts:341` 直接从 `./lib/main-window-state` 导入，不经本文件。

内部关键符号：

| 符号 | 行 | 签名/形状 | 职责 |
| --- | --- | --- | --- |
| `DEV_SERVER_READY_*` | `:24-27` | 4 个常量 | dev server 就绪轮询/探测/重试参数 |
| `probeDevServerPort` | `:30-42` | `(hostname, port) => Promise<boolean>` | TCP 探测，不走 HTTP |
| `registerProtocolsAndHandlers` | `:75-157` | `() => void` | 特权协议、blink/图形开关、文件关联、证书错误策略 |
| `handleMigrationFileOpen` | `:256-260` | `(filePath) => void` | `.profer-backup`/`.profer-share` → 通知 renderer |
| `recoverEnabledFeishuBots` | `:317-332` | `() => Promise<void>` | 逐 bot 重启，失败计数超阈值抛错 |
| `recoverEnabledDingTalkBots` | `:334-349` | `() => Promise<void>` | 同上 |
| `parseDiagnosticPayload` | `:357-363` | `(raw) => unknown` | JSON 解析失败保留原串 |
| `installWindowsZoomInFallback` | `:375-389` | `(win) => void` | Ctrl++/= 小键盘兜底缩放 |
| `ensureWindowOnScreen` | `:395-417` | `(win) => void` | 多显示器断开后重新居中 |
| `showAndFocusMainWindow` | `:420-436` | `() => void` | 显示/恢复/聚焦，销毁则重建 |
| `getIconPath` | `:441-455` | `() => string` | 平台图标路径 |
| `saveMainWindowState` | `:457-473` | `() => void` | 写 settings（最大化/全屏用 `getNormalBounds`） |
| `createWindow` | `:475-882` | `() => void` | 主窗口 + 闪屏 + 导航拦截 + close 语义 |
| `sendToMainWindow` | `:884-901` | `(channel, data?) => void` | 聚焦后发送，loading 中挂 `did-finish-load` |
| `bootstrap` | `:909-1163` | `() => Promise<void>` | 启动编排（两梯队） |
| `safeRun`/`safeAwait` | `:1166-1181` | `(name, fn) => void/Promise<void>` | 启动钩子异常隔离 |
| `handleBootstrapFailure` | `:1188-1213` | `(err) => void` | 降级窗口 + 错误弹窗 |
| `MIGRATION_IPC_OPEN` | `:253` | `'migration:open-import-file'` | 文件关联 IPC |
| `STARTUP_SPLASH_MIN_MS` | `:367` | `2400` | 闪屏最短展示 |
| `resolveStartupSplashDark` | `:370` | = `resolveAppThemeIsDark` | 闪屏明暗解析 |

## 3. 内部逻辑与关键流程

### 3.1 模块加载期（app ready 之前，按代码顺序）

1. `:2` 置 `ELECTRON_DISABLE_SECURITY_WARNINGS=true`（注释：防反爬脚本经 console.warn 探针识破）。
2. `:46-51` userData 隔离：`getDevInstanceId()` + `app.setName(resolveDevAppName())`（仅 `!app.isPackaged`）+ `app.setPath('userData', resolveDevUserDataPath(...))`。注释红线 `:44`：**必须先于任何读 userData 的模块**。`:53` 明确旧品牌数据迁移已移除。
3. `:58-60` Windows 正式版声明 AUMID `com.cdutai.studio`；开发版刻意不声明（`:55-57`）。
4. `:64-73` 单实例锁：失败则提示 `killall "CDUT Studio"` 并 `app.quit()`；成功进 `registerProtocolsAndHandlers()`。
5. `registerProtocolsAndHandlers`（`:75-157`）：
   - `:78-82` `protocol.registerSchemesAsPrivileged` 注册 `cdut-file`/`cdut-skin`/`cdut-resource`（standard+secure+fetchAPI+cors+stream）——必须在 ready 前。
   - `:87-90` blink 开关：`disable-blink-features=AutomationControlled`（navigator.webdriver 反检测）与 `disable-features=IsolateOrigins,site-per-process`（跨子框架 Cookie，注释称规避瑞数 WAF 400）。
   - `:94-114` Windows 专属图形开关：`disable-lcd-text`、`use-angle`（`PROFER_ANGLE_BACKEND`，缺省 `d3d11on12`，白名单 `d3d11/d3d9/d3d11on12/gl/swiftshader`）、`disable-accelerated-video-decode`（除非 `PROFER_ENABLE_HW_VIDEO_DECODE=1`）、`disable-direct-composition-video-overlays`。
   - `:117-120` macOS `open-file` → `handleMigrationFileOpen`；`:123-129` Windows `second-instance` → 聚焦 + 从 argv 找 `.profer-backup`/`.profer-share`。
   - `:135-156` `certificate-error`：**顺序即安全**（`:134`）——先 `isCompromisedEmudhraCertificate(certificate)` 拒绝（`:145-149`），再 `isCdutDomain(url)` 放行（`:150-154`），否则拒绝（`:155`）。`safeCallback`（`:138-144`）防御 Chromium 一次性回调重复调用导致 Win32 模态错误弹窗冻结消息泵。
6. `:170-177` EPIPE 守卫：stdout/stderr 管道错误只忽略 EPIPE，其余重抛。
7. `:182-186` 删除所有 `ANTHROPIC_*` 环境变量（注释：必须在 `initializeRuntime()` 的 loadShellEnv 之前）。

### 3.2 Bridge 注册（`:262-315`）与自愈

| Bridge | shouldAutoStart | needsRecovery | start/stop | recover |
| --- | --- | --- | --- | --- |
| 飞书（`:264-283`） | 任一 bot `enabled && appId && appSecret` | 同条件且状态 `error` | `feishuBridgeManager.startAll/stopAll` | `recoverEnabledFeishuBots` |
| 钉钉（`:285-304`） | 任一 bot `enabled && clientId && clientSecret` | 同条件且状态 `error` | `dingtalkBridgeManager.startAll/stopAll` | `recoverEnabledDingTalkBots` |
| 微信（`:306-315`） | `enabled && credentials` | `status === 'error'` | `wechatBridge.start/stop` | 无（未注册 recover） |

`recoverEnabled*Bots`（`:317-349`）逐 bot `restartBot`，`failedCount > 0` 时抛 `N 个…自愈恢复失败`（供自愈框架记录）。

### 3.3 主窗口 `createWindow`（`:475-882`）

- 平台标题栏（`:486-497`）：mac `titleBarStyle:'hidden'` + `trafficLightPosition` + vibrancy（hiddenInset 会被原生按钮 hit 区吞 hover，故用 hidden，`:488-489`）；win32 `'hidden'`；其他 `{}`。
- 边界：`savedState`（settings `mainWindowState`）优先，缺省 1400×900（`:499-502`）；`minWidth:800/minHeight:600`。
- `webPreferences`（`:513-517`）：`preload: dist/preload.cjs`、`contextIsolation: true`、`nodeIntegration: false`。
- `:521` `setZoomFactor(DEFAULT_MAIN_WINDOW_ZOOM_FACTOR)`（默认 110%）。
- dev 诊断块（`!app.isPackaged`，`:525-579`）：console-message 镜像到 supervisor（`:528-541`，`[CONVERSATION-SCROLL-DEBUG]` 前缀且 `PROFER_DEV_DIAGNOSTICS=1` 才落盘）、窗口几何落盘（`:546-558`）、`did-fail-load` 有限退避重试（`:563-575`：仅主框架 + `-102/-105` + `<5` 次，`500*n` ms 后 `loadRenderer()`）、`render-process-gone` 日志（`:576-578`）。
- `:581` mac 隐藏原生红绿灯（改由 renderer 自绘）；`:584-594` win32 显式 `setIcon`/`setAppDetails`（AUMID 配合任务栏图标）。
- `:595-600` `installWindowsZoomInFallback`/`installMacTrafficLightZoomSync`/`updateWindowFrameAppearance` + `browserController/yanhuExpressManager/yanhuPetWindowManager.setOwnerWindow`。
- 闪屏与首显（`:602-754`）：独立 splash 窗口（`:651-689`，`frame:false`、`setAlwaysOnTop(true,'floating')`、data URL HTML）；`showWhenReady`（`:619-644`）等 `rendererReady && splashShown` 且满足 `STARTUP_SPLASH_MIN_MS=2400`，冷启动先 `setBounds(startupDisplayWorkArea)` 再 `showInactive` + `maximize`，最后关 splash；`setRendererReadyHandler`（`:646-649`）由 renderer 的 `notifyRendererReady`（经 IPC）触发。
- dev 导航（`:695-723`）：`waitForDevServerReady` 轮询 TCP（30s 超时、200ms 间隔、1s 探测超时）后 `loadURL`；正式版 `loadFile(dist/renderer/index.html)`。
- 热刷新 `replayStartupSplash`（`:725-744`）：Ctrl/Cmd+R 拦截（`:746-751`）；`isRefreshReload` 标记使 `showWhenReady` 跳过 maximize 恢复并恢复全屏（`:626-642`）；不重建独立 splash（注释：与 renderer-ready 竞态会压住主窗口）。
- 状态持久化：`saveMainWindowState` 防抖 500ms（`:757-766`）；`updateSettings` 写盘（`:464-472`），最大化/全屏用 `getNormalBounds()`（`:463`，Proma PR #1119 黑屏修复）。
- 状态通知：`:768-774` `IPC_CHANNELS.WINDOW_MAXIMIZE_CHANGED`（值 `window:maximize-changed`，`packages/shared/src/types/runtime.ts:409`）；`:776-783` mac 全屏用**裸字符串** `'window:full-screen-changed'`（与 shared 常量 `WINDOW_FULL_SCREEN_CHANGED` 同值 `runtime.ts:407`，但本文件未引用常量——既定实现差异，照实记录）。
- 导航安全（`:785-824`）：`toSystemPath` 解析 file:// 与 Windows 盘符路径（`:785-795`）；`will-navigate`（`:798-811`）拦截——dev 的 `http://localhost:` 放行（HMR）、http(s) 交给 `shell.openExternal`、本地路径经 `confirmExecutableFileOpen`（CVE-2026-96951 可执行文件确认框）才 `openPath`；`setWindowOpenHandler`（`:814-824`）一律 `deny` + 同样的外开/确认逻辑。
- close 语义：mac（`:828-853`）非退出→先退全屏（等 `leave-full-screen` 或 1s 超时）→保存状态→`hide()+app.hide()`；win32（`:856-869`）有托盘时→保存状态→`hide()`；`closed`（`:871-879`）置空 mainWindow 并 dispose CSLab 助理窗口/browserController/yanhu 两个管理器；`:881` `setMainWindow(mainWindow)` 供 `main-window-state` getter 体系使用。

### 3.4 启动编排 `bootstrap`（`:903-1163`，`app.whenReady().then(bootstrap).catch(handleBootstrapFailure)` `:903`）

**第一梯队（窗口显示前）**：`installTextContextMenus`（`:913`）→ `setProferVersion(app.getVersion())`（`:916`，供 UA）→ `protocol.handle` ×3（`:918-920`）→ `installCertificateSecurityPolicy`（默认会话 + `CDUT_AUTH_PARTITION` 分区，`:925-926`）→ `safeAwait('initializeRuntime')`（`:930`）→ 应用菜单（`:934-935`）→ `configureGlobalSkillSystem`（`:942`，只注入 bundle 来源）→ `registerIpcHandlers`（`:945`）→ 4 个 C11 本地权威安装器（`:948-951`，注释：只有真实 bootstrap 安装）→ remote service（`:956-962`，`pocketModeEnabled` 优先）→ agent-fabric（`:966-968`）→ study-benchmark（`:972-976`，仅 127.0.0.1）→ macOS dock 图标（`:979-988`）→ `createWindow()`（`:991`）。

**窗口 show 后延迟**（`:995-1003`）：`ensureGlobalSkillSystemReady` → `ensurePresetSystemReady` → `seedDefaultSkills`（`setTimeout 0`），顺序注释：全局能力迁移必须先于 default-skills seed（否则 legacy master 被替换导致 B1/B2 识别失败）。

**第二梯队（窗口已显）**：dev shell 快捷方式（`:1007`）、`createTray`（`:1008-1019`，回调用 `sendToMainWindow` 转 TRAY_IPC_CHANNELS）、mac 自启动以系统为准回写 settings（`:1024-1031`）/其他平台按 settings 设置（`:1032-1035`）、工作区监听（`:1039-1041`）、飞书防休眠（`:1046`）、全局快捷键（`:1049-1051`）；下一个事件循环（`:1054-1062`）`startAllBridges` + 自愈 + 定时任务 + 日程提醒 + 长期记忆整合器（句柄存 `stopLongTermMemoryConsolidator`）。

**团队会话恢复**（`:1065-1113`）：`tryRestoreSession()` 成功或 `getAuthStatus().isLoggedIn` 两分支，均 `scheduleAutoRefresh`+`startSyncEngine`，3s 后拉团队工作区并广播 `team:workspaces-synced`；**同步失败绝不清空本地索引**（`:1087-1088`）。两分支代码几乎重复（照实记录）。

**事件**：`app.on('activate')`（`:1115-1124`）重建/显示窗口（显式注释不用 `getAllWindows()` 以免 DevTools 干扰）；`powerMonitor.on('resume')`（`:1127-1158`）恢复会话+同步+渠道同步；`lock-screen` 仅日志（`:1160-1162`）。

### 3.5 错误恢复

- `safeRun`/`safeAwait`（`:1166-1181`）：单点失败仅 `[启动] … 失败（已隔离）` 日志，不阻断启动链。
- `handleBootstrapFailure`（`:1188-1213`）：`dialog.showErrorBox`（附常见排查：旧进程/配置损坏/Keychain，`:1193-1202`，弹窗自身失败吞掉 `:1203-1205`）→ 尝试 `registerIpcHandlers`+`createWindow` 降级窗口（`:1207-1212`）。
- dev 加载失败退避重试（`:563-575`）与闪屏竞态处理（`:734-737`）见 §3.3。
- 退出清理 `before-quit`（`:1223-1282`）：`setQuitting()` → 停 goals/agents/Pi MCP/Lark/浏览器与 yanhu 管理器/Agent 预览 → `killOrphanedClaudeSubprocesses`（Issue #357 兜底）→ 工作区与 CSLab 全部 watcher/DB 关闭（Windows 重命名句柄语义 `:1242`）→ bridge/调度器/提醒/长期记忆整合/规划窗口/科学助理窗口/远程服务/agent-fabric/评测服务/同步引擎/防休眠/全局快捷键/托盘（`:1253-1282`）。`window-all-closed`（`:1215-1221`）非 mac 退出。

## 4. 调用者与调用链

- 本文件是进程入口：由 Electron 运行时加载（`apps/electron/package.json` 的 `main`），无业务调用者。
- 出向（生命周期触发点）：`lib/settings-service`（读写 settings）、`lib/config-paths`（`seedDefaultSkills`）、`lib/global-skill-manager`、`lib/agent-preset-manager`、`ipc.ts`（`registerIpcHandlers`/`setRendererReadyHandler`/`stopAllGoalsForProcessExit`/`resolveAppIconPath`）、`menu`/`tray`、`lib/bridge-registry`、`lib/remote-service`、`lib/agent-fabric/agent-fabric-service`、`lib/study/study-benchmark-server`、`lib/auth-service`（惰性 require `:1066`/`:1130`/`:1151`）、`lib/sync-manager`、`lib/team-manager`+`lib/agent-workspace-manager`（`:1078-1081`/`:1139-1141`）、`lib/security/cert-blacklist`、`lib/security/executable-open-guard`、`lib/cdut/yanhu/yanhu-domain-gatekeeper` 等。惰性 `require` 集中在团队会话恢复与退出清理，避免拖慢冷启动。
- 与 renderer 的边界：`sendToMainWindow`（`:884-901`）+ `webContents.send` 直发通道 `window:maximize-changed`（`:770`）、`window:full-screen-changed`（`:779`）、`migration:open-import-file`（`:258`）、`team:workspaces-synced`（`:1083`/`:1104`/`:1144`）、TRAY_IPC_CHANNELS 三个（`:1011`/`:1014`/`:1017`）。消费侧：`preload/index.ts:398`/`:2272`（onWindowMaximizeChanged）、`:400`/`:2266`（onWindowFullScreenChanged）——见本批 preload 手册。

## 5. 数据 I/O、读写与副作用

- **设置写**：`saveMainWindowState` → `updateSettings({mainWindowState})`（`:464-472`）；mac 自启动回写 `autoLaunch`（`:1028`）。
- **开发诊断写**：`appendDevDiagnostic` 两处（`:533-539`/`:549-555`），仅 `!app.isPackaged` 且 `PROFER_DEV_DIAGNOSTICS=1`。
- **环境/进程副作用**：`ELECTRON_DISABLE_SECURITY_WARNINGS`（`:2`）、删除 `ANTHROPIC_*`（`:182-186`）、`app.setName`/`setPath('userData')`（`:47-48`）、`app.setAppUserModelId`（`:59`）、单实例锁（`:64`）、blink/ANGLE 等命令行开关（`:87-113`）、协议注册（`:78-82`/`:918-920`）、会话 verifyProc（`:925-926`）、登录项（`:1027`/`:1034`）、托盘/菜单/全局快捷键/监听器。
- **网络**：仅 dev 端口 TCP 探测（`:30-42`）；无产品网络请求。
- **磁盘读**：`getSettings()`、`existsSync` 图标/内置 skill 目录。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 单实例锁失败 | `:64-69` | 提示 + `app.quit()` |
| 证书错误 3 分支 | `:145-155` | 泄露链拒绝 → 校内放行 → 其余拒绝 |
| dev/prod 加载 | `:603-605`、`:714-723` | URL vs loadFile |
| `did-fail-load`（dev） | `:567-575` | -102/-105 主框架 <5 次退避重试 |
| 导航 3 分支 | `:800-810` | dev localhost 放行 / http(s) 外开 / 本地路径确认后 openPath |
| `window.open` | `:814-824` | 一律 deny + 外开/确认 |
| mac/win32 close | `:828-869` | 非退出：保存状态 + 隐藏 |
| bootstrap 异常 | `:1188-1213` | 错误弹窗 + 降级窗口 |
| 启动钩子异常 | `:1166-1181` | 隔离日志 |
| 团队工作区同步失败 | `:1086-1089` | 保留本地索引，下轮再试 |
| 自愈恢复失败 | `:329-331`/`:346-348` | 抛错给 bridge 框架 |
| EPIPE | `:170-177` | 忽略 |

无 `AbortSignal`/请求取消概念（进程生命周期管理）。

## 7. 权限与权威状态

- **证书信任策略**：`:135-156` eMudhra 泄露链先拒（`installCertificateSecurityPolicy` `:925-926` 在默认会话与特区账户分区装 verifyProc；注释 `:134` "已装 verifyProc 的会话不会走到本兜底"）；校内域名放行是**既定现状**（`:131-132`），站外默认拒绝。
- **渲染隔离**：`contextIsolation:true`+`nodeIntegration:false`（`:515-516`）；preload 为唯一桥。
- **导航权限**：页面内导航一律拦截（`will-navigate`/`setWindowOpenHandler`），本地可执行文件经 `confirmExecutableFileOpen` 确认（CVE-2026-96951，`:806-809`/`:819-821`）。
- **特权协议**：`cdut-file`/`cdut-skin`/`cdut-resource` 具 fetchAPI+stream+cors（`:78-82`），由 `protocol.handle` 的三个 handler 实现过滤（本文件不校验路径，权威在 handler 模块）。
- **进程权威**：单实例锁（`:64`）；`setQuitting`（`:1225`）是 close/quit 语义的权威状态（`lib/app-lifecycle`）；`mainWindow` 空指针一致性由 `setMainWindow`/`main-window-state` getter 维护。
- 无 IPC sender 判断在本文件；sender 守卫在 `ipc.ts`/`lib/ipc-sender-guard.ts`（`assertMainWindowSender`，`ipc-sender-guard.ts:22`/`:30`）——**本文件不替代也不借用**其权限。

## 8. 修改影响面

- `webPreferences.preload`（`:514`）指向 `dist/preload.cjs`：改 preload 构建产物名会断桥。
- `IPC_CHANNELS.WINDOW_MAXIMIZE_CHANGED`（`:770`）与裸串 `'window:full-screen-changed'`（`:779`）→ `preload/index.ts:2272`/`:2266` + 渲染层；改名需同步 `packages/shared/src/types/runtime.ts:407-409` 与 preload。
- `MIGRATION_IPC_OPEN`（`:253`）→ 渲染层迁移导入 UI。
- `sendToMainWindow` 的 loading 挂载语义（`:896-899`）：改早发语义会丢迁移文件打开事件。
- bootstrap 的 skill/preset 顺序（`:995-1003`）与 `config-paths.seedDefaultSkills`（本批另一文件）耦合。
- `before-quit` 清理顺序：`stopAllAgents` 先于 `killOrphanedClaudeSubprocesses`（`:1229`/`:1239`），调整顺序可能重新引入残留子进程（Issue #357）。
- dev 诊断与闪屏参数（`:24-27`/`:367`）影响启动体验调优。
- 直接依赖本文件导出的唯一模块：`dock-badge-service.ts:11`。

## 9. 测试证据

- **无直接测试**：检索 `apps/electron/test`、`tests` 及全冻结树对 `main/index` 的引用（`grep -rln "main/index"`）为 0 个测试文件；Electron 入口需要真实运行时，静态无法注入。
- 间接：`preload/index.ts` 的 `onWindowMaximizeChanged`/`onWindowFullScreenChanged`（`:398`/`:400`/`:2266`/`:2272`）依赖本文件发的通道；无测试断言覆盖。
- 未覆盖：`bootstrap` 全流程、闪屏竞态、证书策略分支、导航拦截、close 语义、before-quit 清理链、降级窗口。
- `NOT_RUN`：本轮未执行测试/typecheck/build/GUI/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出是 `getMainWindow` 转出 | 已证实 | `:373`；`grep '^export'` 唯一 |
| userData 隔离先于业务模块加载 | 已证实 | `:44-51` 位于 import 求值后的顶层语句首部 |
| 证书策略顺序：泄露链拒 → 校内放行 → 默认拒 | 已证实 | `:145-155` |
| `contextIsolation:true`/`nodeIntegration:false` | 已证实 | `:515-516` |
| close=隐藏（mac/win32）、`before-quit` 才真退出 | 已证实 | `:828-869`、`:1223-1282` |
| 闪屏最短 2400ms 且需 rendererReady | 已证实 | `:367`、`:619-644` |
| `ANTHROPIC_*` 环境变量在启动即删除 | 已证实 | `:182-186` |
| `:779` 用裸串而非 shared 常量（与 `:770` 风格不一致） | 已证实 | `:770` vs `:779`；`runtime.ts:407` |
| 反检测/瑞数规避开关的实际效果 | 推断 | 注释自述（`:84-90`），无运行证据 |
| dev 冷启动就绪时间分布（416ms-9240ms） | 推断 | 注释实测记录（`:18`），非本轮测量 |
| 无测试覆盖的启动/退出链在真实 Electron 的行为 | 未知 | 未运行 |
| `preload.cjs` 构建产物与源码 `preload/index.ts` 的对应 | 未知 | 构建未跑（NOT_RUN） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 条导出 | §2 | `:373` | covered |
| 加载期副作用/协议/证书/图形开关 | §3.1 | `:2-186` | covered |
| Bridge 注册与自愈 | §3.2 | `:262-349` | covered |
| createWindow 全生命周期 | §3.3 | `:475-882` | covered |
| bootstrap 两梯队 + 事件 | §3.4 | `:903-1163` | covered |
| 错误恢复/降级/退出清理 | §3.5 | `:1166-1282` | covered |
| 调用者/出向依赖 | §4 | 跨文件 | covered |
| 数据 I/O 与副作用 | §5 | 跨行 | covered |
| 失败分支表 | §6 | — | covered |
| 权限/权威状态 | §7 | `:78-156`、`:515-516`、`:806-824` | covered |
| 修改影响面 | §8 | 跨文件 | covered |
| 测试缺口 | §9 | 0 测试 | covered |
| 反检测实际效果/真实运行行为 | §10 | — | unknown |
