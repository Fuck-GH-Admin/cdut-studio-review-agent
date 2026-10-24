# p01-app-shell：应用壳、配置、构建与入口

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

本分区包括启动/窗口/主 IPC/preload、设置/迁移/通用服务、CLI、构建发布及资源索引；逻辑归属并不等于独立 npm 包。

主链是 [apps/electron/src/main/index.ts:903](<../../SOURCE/apps/electron/src/main/index.ts>) bootstrap → runtime 初始化 → IPC 注册 :945 → 本地审核 Main 能力安装 :948–951 → createWindow :991 → 窗后技能迁移/预设/seed :999–1001。preload.cjs 把 Renderer 请求送入 Main；Renderer 主入口和独立窗口分支从 [apps/electron/src/renderer/main.tsx:1059](<../../SOURCE/apps/electron/src/renderer/main.tsx>)、:1123 读取。`registerIpcHandlers` 在 [apps/electron/src/main/ipc.ts:1322](<../../SOURCE/apps/electron/src/main/ipc.ts>) 统一挂 review、CSLab、longterm-memory 等专用注册器 :6220–6226。

配置根的唯一解析入口 [apps/electron/src/main/lib/config-paths.ts:57](<../../SOURCE/apps/electron/src/main/lib/config-paths.ts>)：PROFER_CONFIG_DIR 可覆盖，开发默认 .cdutai-dev、打包默认 .cdutai；getConfigDir :80 会创建目录，resolveConfigDir 只解析。Electron userData 另有启动隔离，不能与业务配置根混用。settings 读取缓存/写盘来自 [apps/electron/src/main/lib/settings-service.ts:45](<../../SOURCE/apps/electron/src/main/lib/settings-service.ts>)、:93；写入为 writeFileSync，不能借用原生 Case 事务的跨进程锁保证。

窗口 resize/move →500ms防抖→normal bounds→updateSettings/mainWindowState（[apps/electron/src/main/index.ts:457](<../../SOURCE/apps/electron/src/main/index.ts>)、:757、:767）；恢复读 settings。开发加载 Vite URL，打包加载 renderer 文件（:692/:716/:721）。技能 bundle 是来源，用户配置中技能副本是迁移/seed 目标，更新 bundle 不保证覆盖用户现有副本。

接口契约在 [apps/electron/src/preload/index.ts:272](<../../SOURCE/apps/electron/src/preload/index.ts>) 及 shared/types、types/settings 通道表。electronAPI 无主帧暴露条件，agentPreviewAPI/reviewAPI 有；敏感业务仍由各 handler 核权。通用 settings.UPDATE 剥离 reviewAgentAutoApproval 字段，专用确认通道才写代批授权（[apps/electron/src/main/ipc.ts:2185](<../../SOURCE/apps/electron/src/main/ipc.ts>)、:2197）。因此设置对象不能直接当 Agent 授权来源。

失败/恢复：bootstrap 用隔离执行处理部分初始化失败；主窗关闭和退出处释放服务（[apps/electron/src/main/index.ts:1223](<../../SOURCE/apps/electron/src/main/index.ts>)）。各通用 writer 的原子性不同；迁移、资源缺失、证书规则须读对应文件，不承诺统一回滚。CLI [apps/cli/src/index.ts:17](<../../SOURCE/apps/cli/src/index.ts>) 是独立会话查询入口，不能画成桌面启动必经步骤。

继续阅读：[逐文件导航与接受状态](<../../INDEXES/p01-app-shell.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
