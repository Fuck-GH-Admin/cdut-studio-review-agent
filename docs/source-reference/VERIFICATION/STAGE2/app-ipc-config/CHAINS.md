# CHAINS — STAGE2/app-ipc-config（应用启动/跨层通信/配置）

范围：main→preload→renderer IPC 契约、窗口/workspace/session 生命周期、配置读取/缓存/迁移权威来源、打包资源加载与构建配置、开发/打包差异与绕过入口。
证据基线：`baseline/source@05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 实测、tree clean、全程只读）；标注 **证实**=本轨亲自实读命中，**推断**=代码语义推断未实测，**未知**=未核/待验。真实运行一律 NOT_RUN，静态断言不冒充实测。
入口→全部关键边→最终持久化/输出；file:line 均为冻结源实测。

---

## C1 应用启动 bootstrap（证实主链）

入口 `apps/electron/src/main/index.ts:903` `app.whenReady().then(bootstrap)`（catch→handleBootstrapFailure）。
边（`bootstrap` :909，safeRun/safeAwait 隔离注释 :906-907）：
1. `initializeRuntime`（:930 await safeAwait）；
2. 全局 Skill bundle 来源注入 `configureGlobalSkillSystem(bundledGlobalSkillsDir)`（:942；bundledGlobalSkillsDir :939-943 按 app.isPackaged 取 `process.resourcesPath/default-skills` 或 `__dirname/../default-skills`）——注释 :937-938 明确「仅注入来源，seed/迁移须在窗口创建后」；
3. `registerIpcHandlers()`（:945）；
4. 服务启动（均 safeRun）：startRemoteService :956、startAgentFabricService :966、startStudyBenchmarkServer :972；dock.show :980（macOS）；
5. `createWindow()`（:991）；
6. 窗后收尾（注释 :997：全局能力迁移先于旧 default-skills seed）：`ensureGlobalSkillSystemReady` :999 → `ensurePresetSystemReady` :1000 → `seedDefaultSkills` :1001；
7. `maintainDevShellShortcut` :1007。
持久化/输出：seed/迁移副作用写 `~/.cdutai/default-skills/`（见 C7）；bootstrap 自身无状态落盘。失败语义=各步 safeRun 隔离（**推断**：单步失败不阻塞启动；handleBootstrapFailure 具体行为未逐行核）。

## C2 窗口创建与渲染加载（dev/打包分叉；证实加载链）

入口 `createWindow`（index.ts:475）。
- 渲染 URL 分叉：`rendererUrl = isDev ? VITE_DEV_SERVER_URL : null`（:604）；prod `mainWindow.loadFile(rendererFile)`（:716）；dev `loadURL(rendererUrl)`（:721），且注释 :692：dev 先等 dev server 端口就绪再导航（防 ERR_CONNECTION_REFUSED；注释 :19 提到启动约第 5s 负载窗口）。
- 启动 splash：`splashWindow.loadURL('data:text/html…createStartupSplashHtml(resolveStartupSplashDark())')`（:688）。
- 生命周期事件：open-file :117、second-instance :123、certificate-error :135（safeCallback :138-150 防御性包裹 Chromium 一次性回调；**allow/reject 决策行未核=未知**）、activate（无窗则 createWindow）:1115/:1119、window-all-closed :1215、before-quit :1223。
- 窗口状态：`main-window-lifecycle.ts:36-47` 捕获 bounds（全屏/最大化只存 `getNormalBounds()`，避免把全屏 Space 尺寸写配置）；`main-window-state.ts:5-9` 仅内存 holder（get/setMainWindow）。**未知**：bounds 持久化写点（推断回 settings，未实测）。

## C3 main→preload→renderer IPC 契约（证实抽样配对；全量未逐对）

契约权威=**通道常量表**（同源共享，非字符串散写）：
- `apps/electron/src/types/settings.ts:410` `SETTINGS_IPC_CHANNELS`（及 USER_PROFILE/SKIN/SCRATCH_PAD/APP_ICON/DOCK_BADGE/STORAGE/NOTIFICATION_SOUND/DESKTOP_NOTIFICATION 等族，ipc.ts:16 导入）；
- `@profer/shared` `IPC_CHANNELS` 及 CHANNEL/CHAT/AGENT/LARK/…/TEAM_MEMORY 族（ipc.ts:15 导入）。
main 注册面：`src/main/ipc.ts` 590 处 `ipcMain.handle/on`（抽样：:1347 `on(RENDERER_READY)`、:2177 `handle(GET)`、:2185 `handle(SET_REVIEW_AGENT_AUTO_APPROVAL)`、:2197 `handle(UPDATE)`）；`src/main/lib/review/review-ipc.ts` 105 处；另有 longterm-memory-ipc/cslab-router/review-v3-*-ipc 等模块化注册。
preload 面（`src/preload/index.ts`）：`contextBridge.exposeInMainWorld('electronAPI', electronAPI)` :4705（全帧）、`'agentPreviewAPI'` :4738 与 `'reviewAPI'` :5099（均 `process.isMainFrame` 限定——权限边界：子帧/嵌套帧不获暴露，**证实**注释与条件）；方法体统一 `ipcRenderer.invoke(CHANNEL, …)`（:2127-2143 抽样，通道名取自同一常量表）。
权限/信任边界：renderer 无裸 ipcRenderer（contextBridge 白名单 API）；主进程侧另有 ipc-sender-guard（引用相等+三重存活，nb-135 手册记述，**待验**不在本轨实测）。**推断**：590+105 通道与 preload 方法全量一一配对未逐对核（缺口见 RESULT）。

## C4 配置读取/缓存/迁移（权威来源证实）

- **权威根** `getConfigDir()`（config-paths.ts:54-58）：默认 `~/.cdutai`（命名注释 :24-46；`PROFER_DEV=1` 模式分支 :27/:35）；`PROFER_CONFIG_DIR` 环境变量可整体覆盖（:58 override），注释 :54 明示「所有需要配置根路径的场景统一走这里」。
- **设置**：路径 `getSettingsPath()`= `~/.cdutai/settings.json`（:259-262）；`settings-service.ts` `getSettings()` :45 读 `readFileSync` :56 + 内存缓存（`clearSettingsCache` :129）、`updateSettings()` :93 → `writeFileSync(JSON.stringify)` :117。**实现缺陷（留阶段三）**：写盘非原子（无 tmp+rename）。
- **其余权威文件**：proxy-settings.json（:277-280）、agent-sessions.json（:332-335）、agent-sessions/ 目录（:348-351）、default-skills 目录（:564-574 getDefaultSkillsDir）。
- **迁移两类**：①skill 基线迁移/seed（`seedDefaultSkills` config-paths:956 起；全局能力迁移先行 index.ts:997 注释；legacy 指纹接管 `isKnownLegacyBundledSkill` :941-943→接管 rm+cp :993-997）；②数据导入导出迁移 `migration-service.ts`（export :287/:330、parseImportFile :844、confirmImport :1027、zip-slip 防护 `assertSafeMigrationArchiveEntry` :1679）。
- 缓存一致性=**推断**（clearSettingsCache 由 IPC 面调用，多窗并发场景未实测）。

## C5 workspace 生命周期（证实 CRUD/原子换入）

`agent-workspace-manager.ts`：`readIndex` :40 / `writeIndex` :100（:89-91 `renameSync` inactive→active 原子换入）；`listAgentWorkspaces` :156、`reorder` :168、`get` :185、`create` :190、`update` :241、`delete` :309、`ensureDefaultWorkspace` :362；每 workspace MCP 配置 `getWorkspaceMcpConfig` :417 / `saveWorkspaceMcpConfig` :441；Claude skill manifest `ensureClaudeSkillManifest` :395-411。事件面 `agent-workspace-events.ts`；fork 拷贝 `agent-fork-workspace-copy.ts`。**未知**：index 文件路径常量（未定位 getAgentWorkspacesIndex 路径定义）、事件订阅者全表。

## C6 session 生命周期（证实主链）

`agent-session-manager.ts`：`createAgentSession` :552（:602 `getAgentSessionsDir()` 落 `~/.cdutai/agent-sessions/`、:626 `writeFileSync` sdk settings）；`listAgentSessions` :447、`countArchived` :457、`getMeta` :469、删除拓扑序 `getAgentSessionDeletionOrder` :527；fork 复制已 settle 事件 `copySettledPiHarnessEventsForFork`（import :33；实现 pi-harness-store.ts:69-108）；运行时元数据快照/恢复 `snapshotAgentRuntimeMeta` :246 / `restoreAgentRuntimeMeta` :264；委托子会话 `createDelegatedChildSessionMeta` :388。**未知**：并发写互斥/崩溃恢复全路径、取消-恢复状态机（属会话语义深核，超出本轨窗口）。

## C7 打包资源加载路径（证实）

`electron-builder.yml`：`asar: true`（:31）；`files:` `dist/**/*`+package.json+node_modules（:44-68）；`extraResources`：`default-skills→default-skills`（:70-75，filter **/*）、`resources/skins→skins`（:86-90）、`resources/cslab→cslab`（:118-122）、`resources/ppt-style-packs→ppt-style-packs`、tray-icons/图标/CHANGELOG/bulletin/background 等（:70 起）。
运行时解析：`process.resourcesPath/default-skills`（index.ts:939-941；getBundledSkillsDir config-paths:770-776）、`process.resourcesPath/cslab/demo`（cslab-demo.ts:62-64 resolveDemoDir）、`~/.cdutai/default-skills`（seed 目标，getDefaultSkillsDir :564-574）。
已知勘误沿登记：`electron-builder.yml:71` 注释 `~/.proma` 陈旧（代码 `~/.cdutai`，见 CONFLICTS-01）。

## C8 构建配置与外围依赖（证实）

`package.json`：`build:main` esbuild 入口 `src/main/index.ts`→`dist/main.cjs`（:17）；`build:renderer`=`scripts/build-renderer.mjs` 包装 `vite build`（Mol* ~1.2 万模块 OOM 对策注释）；`test`=`bun test --isolate`（:46）。
`vite.config.ts`：`base: './'`（:13）、`outDir: dist/renderer`（:35）、alias `@`→`src/renderer`。
`scripts/copy-resources.ts`：仅 `apps/electron/resources`→`dist/resources`（不涉 src/renderer/assets——与 renderer-assets 组 QA 结论互证）。

## C9 开发/打包差异与绕过入口（证实静态命中；可达性推断）

- 路径分叉：dev `VITE_DEV_SERVER_URL`（:604/:721，端口等待 :692）vs prod `loadFile`（:716）；skill 源 dev=`__dirname/../default-skills` vs prod=`resourcesPath`（:939-941）。
- **绕过/覆盖入口清单**（均测试或受控用途，生产可达性=推断）：
  1. `PROFER_CONFIG_DIR`（config-paths:54-58）整体替换配置根——**影响面最大**；
  2. `PROFER_DEV=1`（:27/:35）切换配置目录模式；
  3. `testBundledSkillsDirOverride`（:760-771，setter :762-763）替换 bundled skills 源；
  4. `testLegacyBundledSkillDirectoryHashes`（:933-942）替换 legacy 指纹表（可诱导接管判定）；
  5. `rootsOverride`（global-skill-manager.ts:73-110，setter :98/reset :104）替换技能根；
  6. `CSLAB_DEMO_DIR`（cslab-demo.ts:54-56）替换演示数据目录；
  7. `certificate-error` safeCallback（index.ts:135-150）——allow/reject 决策**未知**（待验）。

---

## 覆盖边界（本轨未覆盖，如实）

- 590+105 IPC 通道与 preload 方法的**全量**逐对配对（仅抽样证实同常量机制）；
- workspace/session 的取消-恢复、并发写互斥、崩溃一致性（动态语义）；
- settings 缓存多窗一致性；window bounds 持久化写点；
- certificate-error allow/reject 决策行；
- runtime 初始化（initializeRuntime）、remote/agent-fabric/study-benchmark 服务内部；
- 渲染层状态管理（jotai atoms）与组件级调用图。
