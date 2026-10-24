# CHAINS — STAGE2/app-ipc-config-r1（完整修订版；首版 manager/STAGE2/app-ipc-config/ 保留为证据）

范围：main→preload→renderer IPC 契约、窗口/workspace/session 生命周期、配置读取/缓存/迁移权威来源、打包资源加载与构建配置、开发/打包差异与绕过入口。
证据基线：`baseline/source@05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、tree clean、全程只读）。
**术语**：本文所有引证均为**静态源码核对**（grep/read 冻结源）；真实运行一律 **NOT_RUN**，静态断言不冒充实测。**证实**=静态源码核对命中，**推断**=代码语义推断未动态验证。关键未知项（bounds 写点/cert 决策）本版已清零，余项见「非关键边界」。

---

## C1 应用启动 bootstrap（证实）

入口 `apps/electron/src/main/index.ts:903` `app.whenReady().then(bootstrap)`（catch→handleBootstrapFailure）。
边（`bootstrap` :909；safeRun/safeAwait 隔离注释 :906-907）：`initializeRuntime` :930 → 全局 Skill bundle 注入 `configureGlobalSkillSystem(bundledGlobalSkillsDir)` :942（来源解析 :939-943：prod=`process.resourcesPath/default-skills`、dev=`__dirname/../default-skills`；注释 :937-938「仅注入来源，seed/迁移须窗口创建后」）→ `registerIpcHandlers()` :945 → 服务启动 safeRun：startRemoteService :956、startAgentFabricService :966、startStudyBenchmarkServer :972 → `installCertificateSecurityPolicy`（:925 defaultSession + :926 `CDUT_AUTH_PARTITION` 会话）→ dock.show :980 → `createWindow()` :991 → 窗后（顺序注释 :997 全局能力迁移先于旧 default-skills seed）：`ensureGlobalSkillSystemReady` :999 → `ensurePresetSystemReady` :1000 → `seedDefaultSkills` :1001 → `maintainDevShellShortcut` :1007。
持久化/输出：seed 写 `~/.cdutai/default-skills/`（C7）。

## C2 窗口创建/渲染加载与窗口状态持久化（首版缺口① bounds 写点：已闭合=证实）

- 加载分叉（证实）：`createWindow` :475 → `rendererUrl = isDev ? VITE_DEV_SERVER_URL : null` :604 → prod `loadFile(rendererFile)` :716 / dev `loadURL(rendererUrl)` :721（dev 等 Vite 端口就绪注释 :692）；splash `loadURL('data:text/html…')` :688。
- 生命周期（证实）：open-file :117、second-instance :123、activate :1115/:1119、window-all-closed :1215、before-quit :1223（setQuitting+逐服务 dispose+killOrphanedClaudeSubprocesses 兜底 :1225-1240）。
- **bounds 持久化全链（静态源码核对闭合）**：
  1. 触发：`mainWindow.on('resize'|'move', scheduleWindowStateSave)`（index.ts:767-768）；
  2. 防抖：`scheduleWindowStateSave` 500ms（:757-766；timer 取消于关闭路径 :844-846/:860-861）；
  3. **写点**：`saveMainWindowState()`（:457-472）——最大化/全屏取 `getNormalBounds()`（:462-464，注释引 Proma PR #1119 防 macOS 全屏黑屏）→ `updateSettings({mainWindowState: {width,height,x,y,isMaximized}})` :465-471；
  4. 落盘：settings-service.ts:93 `updateSettings` → :117 `writeFileSync` → **`~/.cdutai/settings.json`**（权威键 `AppSettings.mainWindowState`，types/settings.ts:328）；
  5. 恢复：`createWindow` 内 `getSettings().mainWindowState` :499 回放。
  并行子系统（证实两套并存）：`getPersistableMainWindowState`（main-window-lifecycle.ts:38-47，同 normal-bounds 口径）被 `planning-window.ts:5`、`cslab-window-manager.ts:19`（其 `persistWindowState` :100，调用 :221/:227/:310/:327）消费——cslab/planning 窗口自有写点（非关键边界，函数体未逐行展开）。

## C3 main→preload→renderer IPC 契约（实际核对通道端到端+权限边；范围声明）

**机制（证实）**：契约权威=共享常量表——`apps/electron/src/types/settings.ts:410` `SETTINGS_IPC_CHANNELS` 与 USER_PROFILE/SKIN/STORAGE 等族、`@profer/shared` `IPC_CHANNELS`/AGENT/CHAT 等族（ipc.ts:15-16 导入）；main 注册 `src/main/ipc.ts` 590 处 + `lib/review/review-ipc.ts` 105 处 + 模块化 *-ipc.ts；preload `src/preload/index.ts` 三个暴露面：`exposeInMainWorld('electronAPI')` :4705（全帧）、`'agentPreviewAPI'` :4738 与 `'reviewAPI'` :5099（均 `process.isMainFrame` 限定=帧级权限边）。

**实际核对的端到端通道（renderer→preload→main→存储/输出 + 权限边）**：
1. **settings.GET**：renderer `window.electronAPI.getSettings()` → preload 声明 :606、实现 :2529（启动去重共享 Promise 注释 :2119）→ `invoke(SETTINGS_IPC_CHANNELS.GET)` → ipc.ts:2177-2180 `handle(GET)` → `getSettings()` settings-service.ts:45（readFileSync :56+缓存）→ **读 `~/.cdutai/settings.json`**（config-paths.ts:259-262）。
2. **settings.UPDATE**：preload :609 `updateSettings(updates)` → `invoke(SETTINGS_IPC_CHANNELS.UPDATE)` → ipc.ts:2197-2205：**权限边=通用 UPDATE 通道剥离 `reviewAgentAutoApproval*` 字段**（:2198-2200 注释「AI 代批开关走专用确认通道，通用通道剥离防止未确认改写」）→ `updateSettings(safeUpdates)` settings-service.ts:93 → :117 writeFileSync → **写 `~/.cdutai/settings.json`**（副作用含 feishuSessionMirror 同步 :2205 起）。
3. **settings.SET_REVIEW_AGENT_AUTO_APPROVAL（专用确认通道）**：ipc.ts:2185-2193——输入 `{enabled, grantedBy}`，仅 UI 风险确认后写入并盖 `reviewAgentAutoApprovalGrantedAt` 时间戳；注释明示「Agent 工具不可达此通道」=**显式权限边界（证实）**。
4. **workspace.LIST/CREATE**：preload `invoke(AGENT_IPC_CHANNELS.LIST_WORKSPACES)`/`CREATE_WORKSPACE` → ipc.ts:3494-3497 `listAgentWorkspaces()`（agent-workspace-manager :156）/ :3501-3505 `createAgentWorkspace(name)`（:190）→ `writeIndex` :100（:89-91 `renameSync` inactive→active 原子换入）→ **`~/.cdutai/agent-workspaces.json`**（getAgentWorkspacesIndexPath config-paths.ts:410-413；INDEX_VERSION=3 自动版本迁移 :38-45）+ 目录 `~/.cdutai/agent-workspaces/`（:421）；创建后 `broadcastAgentWorkspacesChanged()`（:3505）；delete 守卫 list≤1 拒删（:3534）。
5. **单向事件样例**：`SETTINGS_IPC_CHANNELS.RENDERER_READY` `ipcMain.on`（ipc.ts:1347）；窗口最大化 `webContents.send(IPC_CHANNELS.WINDOW_MAXIMIZE_CHANGED)`（index.ts:771-775，maximize/unmaximize/restore）。
**范围声明**：590+105 通道不全做业务深读；本轨实际端到端核对 **5 组**（上列）+ 契约机制/帧级权限边/专用确认通道结构性核对；其余通道同机制（invoke↔handle 同常量），业务语义未逐条核（非关键边界）。

## C4 配置读取/缓存/迁移（证实）

权威根 `getConfigDir()` config-paths.ts:54-58（默认 `~/.cdutai`，命名注释 :24-46，`PROFER_DEV=1` 分支 :27/:35；`PROFER_CONFIG_DIR` 整体覆盖 :58）。
权威文件：settings.json :259-262、proxy-settings.json :277-280、agent-sessions.json :332-335、agent-sessions/ :348-351、agent-workspaces.json :410-413、agent-workspaces/ :421、default-skills/ :564-574。
读/缓存/写：settings-service.ts `getSettings` :45（:56+缓存，`clearSettingsCache` :129）、`updateSettings` :93→:117 writeFileSync（**非原子=实现缺陷 CONFLICTS-03**）。
迁移两类（证实）：①skill 基线迁移/seed（`seedDefaultSkills` config-paths:956 起；legacy 指纹接管 :941-943→rm+cp :993-997；顺序保证 index.ts:997）；②数据导入导出（migration-service.ts export :287/:330、parseImportFile :844、confirmImport :1027、zip-slip 防护 :1679）。

## C5 workspace 生命周期（证实；首版缺口 index 路径已闭合）

agent-workspace-manager.ts：`readIndex` :40（`getAgentWorkspacesIndexPath()` config-paths:410-413 + `readJsonFileSafe` + 版本迁移 :38-45，INDEX_VERSION=3）/`writeIndex` :100（renameSync 原子换入 :89-91）；list :156/:162、reorder :168、get :185、create :190、update :241、delete :309、ensureDefaultWorkspace :362、MCP config :417/:441、Claude skill manifest :395-411。

## C6 session 生命周期（证实主链）

agent-session-manager.ts：`createAgentSession` :552（:602 `getAgentSessionsDir()`=`~/.cdutai/agent-sessions/` config-paths:348-351；:626 writeFileSync sdk settings）；list :447、countArchived :457、getMeta :469、删除拓扑序 :527；fork 复制 settle 事件 `copySettledPiHarnessEventsForFork`（import :33；pi-harness-store.ts:69-108）；快照/恢复 :246/:264；委托子会话 :388。

## C7 打包资源加载路径（证实）

electron-builder.yml：asar :31；files dist :44-68；extraResources：default-skills→default-skills :70-75、resources/skins→skins :86-90、resources/cslab→cslab :118-122、ppt-style-packs/tray-icons/tutorial 等 :70 起。
运行时解析：`process.resourcesPath/default-skills`（index.ts:939-941；getBundledSkillsDir config-paths:770-776）、`process.resourcesPath/cslab/demo`（cslab-demo.ts:62-64）、seed 目标 `~/.cdutai/default-skills`（:564-574）。
**CONFLICTS-01 关联**：源 yml:71 注释 `~/.proma` 陈旧（CONFLICTS-05）；**当前手册 :58 行沿用 `~/.proma`**（doc_error 成立，详见 CONFLICTS-01）。

## C8 构建配置与外围依赖（证实）

package.json：build:main esbuild `src/main/index.ts`→`dist/main.cjs`（:17）；build:renderer=`scripts/build-renderer.mjs` 包装 vite build（Mol* OOM 对策）；test=`bun test --isolate`（:46）。vite.config.ts base './' :13 / outDir dist/renderer :35 / alias `@`→`src/renderer`。copy-resources.ts 仅 resources→dist/resources。

## C9 开发/打包差异与绕过入口（证实静态命中）

- 分叉：dev `VITE_DEV_SERVER_URL`（:604/:721/:692）vs prod `loadFile`（:716）；skill 源 dev/prod（:939-941）。
- 绕过/覆盖入口 7 项：`PROFER_CONFIG_DIR`（config-paths:54-58）、`PROFER_DEV=1`（:27/:35）、`testBundledSkillsDirOverride`（:760-771）、`testLegacyBundledSkillDirectoryHashes`（:933-942）、`rootsOverride`（global-skill-manager:73-110）、`CSLAB_DEMO_DIR`（cslab-demo:54-56）、certificate-error 放行口（已闭合见下）。
- **certificate-error 最终 allow/reject（首版缺口②：已闭合=证实）**：index.ts:135-157 三分支——①`isCompromisedEmudhraCertificate(certificate)`（cert-blacklist.ts:59-69：issuer 链遍历 ≤MAX_CERT_CHAIN_DEPTH，`matchesCompromisedIssuerName` 命中即真；:55-58 注释说明不按 CN 匹配防钓鱼假阳性）→ `preventDefault()+safeCallback(false)` **拒绝**（:145-149）；②`isCdutDomain(url)`（yanhu-domain-gatekeeper.ts:25-33：仅 http/https 且 hostname==`cdut.edu.cn` 或 `*.cdut.edu.cn`）→ `preventDefault()+safeCallback(true)` **放行**（:150-154）；③其余一律 `safeCallback(false)` **默认拒绝**（:156）。safeCallback=防御性一次性回调封装（:138-144）。同名去重：`isCdutDomain` 另有 yanhu-fingerprint-engine.ts:65（异签名 domain 参），index.ts:10 实际导入 gatekeeper:25 版本。`installCertificateSecurityPolicy` 双会话安装（:925-926）。

---

## 非关键边界（本轨未做，如实声明；非关键缺口，不冒称已验）

- 590+105 IPC 通道的逐条业务语义深读（仅 5 组端到端+机制/权限结构核对，范围已在 C3 声明）；
- cslab/planning 窗口 persistWindowState 写点函数体逐行（主窗写点已闭合）；
- session/workspace 取消-恢复、并发写互斥、崩溃一致性（动态语义，静态不可判）；
- initializeRuntime 与 remote/agent-fabric/study-benchmark 服务内部；renderer 状态层调用图；
- cert-blacklist 内存态放行登记完整语义。
