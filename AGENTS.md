# AGENTS.md

This file provides guidance to Codex, Antigravity, and other AI pair programmers when working with code in this repository.

**重要提示（不可违背的红线原则）：**
- 当功能发生变化时，请保持此文件和 `README.md` 同步更新。请更新文档以反映当前状态，但是需要经过我的允许后再修改。
- 所有的注释和日志优先采用中文，保留必要的专业术语部分。
- 所有的依赖包的安装都要先进行搜索，综合判断依赖采用的版本，而不是默认采用某个版本。
- 状态管理上我们全部采用 Jotai 来实现。
- 这是个开源项目，本地存储优先，善用配置文件优于大部分默认采用 localstorage，不采用本地数据库方案。
- 保证充分的组件化以及人类的可读性，每次完成改动后都要思考这一点，保持简单直接不过度设计的风格。
- 在 UI 设计上采用更现代的方案，UI 组件推荐采用 ShadcnUI，在合适的情况下，用卡片和阴影取代边框，用符合主题的饱满色彩，设置界面要设置背景，为未来做不同主题留下空间。
- 采用 BDD 行为驱动开发的方案。
- 完成前端与渲染进程逻辑改动后、提交或打包前，必须至少执行 `bun run typecheck`（或 `bun run --filter='@profer/electron' typecheck`），严禁在存在 TypeScript 编译错误/缺少 import 的情况下进行打包构建。

> 本文件与 `CLAUDE.md` 保持同一套项目约束；平台相关命令必须按当前宿主系统和运行时检测结果执行。

---

## 1. 项目概述与技术栈

CDUT Studio 是一个集成通用 AI Agent 的下一代桌面人工智能软件，采用 Electron 桌面应用架构。核心运行时由 **Pi Coding Agent (`@earendil-works/pi-*`) 作为唯一内核驱动**。

> **项目命名**：CDUT Studio（代码内部兼容包名前缀 `@profer/*`）。

### 核心技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **运行时** | Bun 1.2.5+ (推荐 1.4.2+) | 统一使用 Bun 代替 Node.js/pnpm 执行脚本与测试 |
| **语言** | TypeScript 5.0.0+ | 严格模式，`"moduleResolution": "bundler"` |
| **桌面框架** | Electron 43.2.0 | 主进程/Preload 由 esbuild 构建，渲染进程由 Vite 构建 |
| **前端框架** | React 18.3.1 | 现代化函数式组件 + Hooks |
| **状态管理** | Jotai 2.17.1 | 全局与局部状态原子化管理 |
| **核心内核** | Pi Agent (`@earendil-works/pi-*`) | **唯一内核**，驱动代码编写、工具调用与任务执行 |
| **UI 体系** | Tailwind CSS + Radix UI + TipTap | 现代卡片阴影设计，支持深浅主题无缝切换 |
| **分发打包** | Electron Builder 25.1.8 | 支持 Windows NSIS/Unpacked、macOS DMG 分发 |

---

## 2. Monorepo 结构与常用命令

基于 Bun workspace 的 Monorepo 结构（8 个核心包）：

```
CDUT-Studio/
├── packages/
│   ├── shared/        # 共享类型、IPC 常量、配置与权限规则 (@profer/shared)
│   ├── agent-fabric/  # Agent 编排抽象与能力装配 (@profer/agent-fabric)
│   ├── project-core/  # 项目级配置与上下文解析 (@profer/project-core)
│   ├── session-core/  # headless session 读取/分组/搜索/渲染 (@profer/session-core)
│   ├── core/          # AI Provider 适配器、代码高亮服务 (@profer/core)
│   ├── cli/           # 独立命令行脚手架 (@profer/cli)
│   └── ui/            # 共享 UI 组件库 (@profer/ui)
└── apps/
    └── electron/      # Electron 桌面应用主体 (@profer/electron)
        └── src/
            ├── main/       # 主进程 + 服务层 (main/lib/)
            ├── preload/    # IPC 上下文桥接
            └── renderer/   # React UI (Vite + Tailwind + Radix UI)
```

**依赖管理**：内部包使用 `workspace:*` 互相引用。优先使用 Bun 原生 API（`Bun.file` > `node:fs`）。

### 常用开发命令

```bash
# 开发模式（推荐 - Vite HMR；Electron 只启动一次）
bun run dev

# 构建全量产物
bun run electron:build

# 类型检查（全仓库 8 个包，提交或打包前必跑）
bun run typecheck
bun run --filter='@profer/electron' typecheck

# 单元测试
bun test

# Windows MinGit 资源预检与准备
bun run ensure:mingit

# 架构边界检查与依赖同步
bun run check:boundaries
bun run sync:runtime-deps
bun run verify:packaged-pi-runtime

# 打包分发（Windows x64 请在 Windows 主机执行）
cd apps/electron
bun run dist:fast     # 当前架构快速打包 (win-unpacked)
bun run dist:win      # Windows x64 正式安装包
bun run dist:mac      # macOS 产物打包
```

### 调试与排查技巧
当打包产物卡在加载页或出现白屏时，在终端运行带 `--enable-logging` 查看渲染和主进程输出：
```powershell
cmd.exe /c ".\apps\electron\out\win-unpacked\CDUT Studio.exe --enable-logging"
```

---

## 3. 核心架构与设计模式

### 3.1 IPC 通信模式（核心架构模式）

类型定义 → 主进程处理 → Preload 桥接 → 渲染进程调用：
1. **类型与常量**：`@profer/shared` 集中定义 IPC 通道常量及强类型请求/响应；
2. **主进程处理**：`main/ipc.ts` 集中注册 `ipcMain.handle()`，统一调度 `main/lib/` 服务；
3. **Preload 桥接**：`preload/index.ts` 通过 `contextBridge.exposeInMainWorld` 暴露安全 API（`window.electronAPI.*`）；
4. **渲染进程**：通过 Jotai Atoms 或专用 Hooks 封装通信调用，不在 UI 组件内散落原生通信。

主要通道组：`AGENT_IPC_CHANNELS`、`CHANNEL_IPC_CHANNELS`、`REVIEW_IPC_CHANNELS`、`FEISHU_IPC_CHANNELS`、`ENVIRONMENT_IPC_CHANNELS`、`PROXY_IPC_CHANNELS`。

---

### 3.2 Pi Agent 运行与执行环境（关键约束）

- **内核驱动**：以 `@earendil-works/pi-coding-agent` 为唯一执行内核，内部协议通过适配器与界面事件解耦。
- **Windows 零配置开箱即用**：
  - Windows 执行环境实行**静默自动降级策略**：`Git Bash（若已装） > 内置 BusyBox Bash > WSL > 原生 PowerShell`。
  - 用户无感知、界面无切换开关，确保全新纯净 Win10/Win11 机器无需预装 Git 或配置 WSL 即可直接运行。
  - **内置 MinGit 零配置检查点**：针对无 Git 的 Windows 设备，系统优先探测本机 Git，缺失时无缝切换至应用内置的精简版 MinGit（`resources/bin/git/cmd/git.exe`），保证增量检查点毫秒级快照开箱即用。
- **沙箱隔离与快照拒止（防卡死红线）**：
  - **无工作区模式沙箱隔离**：未指定工作区时，主进程必须在会话沙箱目录（`~/.cdutai/agent-workspaces/default/{sessionId}`）内启动 Agent，**严禁将用户宿主个人主目录（`homedir`）或盘符根目录作为 Agent 工作空间**。
  - **快照拒止与熔断机制**：`pi-file-checkpoint.ts` 对敏感目录（主目录与盘符根目录）绝对拒止执行快照；物理复制降级引擎强制执行 `MAX_SNAPSHOT_FILE_COUNT = 500` 文件硬熔断，严禁同步复制几十万文件阻塞 Electron 主线程事件循环。
- **思考链 (Thinking) 流式体验**：
  - 支持思考的模型（如 DeepSeek/Claude）思考块必须正常渲染并支持折叠收纳；
  - 无工具调用时正文必须直接外置流式输出，**严禁将纯回复误收纳进折叠过程组**导致界面出现假死无限 Spinner。
- **权限安全体系**：`packages/shared/src/constants/permission-rules.ts` 定义只读/安全白名单与危险命令拦截。

---

### 3.3 主进程服务层 (`main/lib/`)

| 服务模块 | 职责与设计要点 |
|----------|----------------|
| `agent-orchestrator.ts` | 核心编排层：并发守卫、渠道调度、环境装配、沙箱隔离、自动标题生成与流式推送 |
| `pi-file-checkpoint.ts` | 文件增量快照引擎：优先 Git 检查点，内置 MinGit 降级回退，物理复制带 500 文件安全熔断 |
| `git-detector.ts` | Git 探测器：本机系统 PATH 优先，未安装时透明回退到打包内置 MinGit |
| `channel-manager.ts` | 渠道管理：模型渠道 CRUD、API Key AES-256-GCM 本地加密存储与连通性测试 |
| `feishu-bridge.ts` | 飞书集成：飞书机器人任务通知、会话消息同步与 OAuth 认证 |
| `review/` | 内容审核专区服务矩阵（案卷存储、文档切块、白名单网关、双路径预审、报告导出） |
| `runtime-init.ts` | 运行时初始化：Shell 环境注入、Bun/Git 检测与自适应配置 |

---

### 3.4 AI Provider 适配器 (`packages/core/src/providers/`)

基于适配器模式，统一通过 `ProviderAdapter` 接口提供流式通信服务：
- **Anthropic 协议**：Messages API，支持 Claude extended_thinking、DeepSeek-reasoner、MiniMax；
- **OpenAI 协议**：Chat Completions，支持 OpenAI、智谱、豆包、通义千问、自定义端点；
- **Google 协议**：Gemini Generative Language API；
- **多模态格式**：适配器自动将图片及文档 `<file>` 格式转换为 Provider 原生协议。

---

## 4. 渲染进程架构与 Jotai 状态管理

状态管理全量采用 **Jotai**（`apps/electron/src/renderer/atoms/`）：

| Atom 文件 | 管理职责 |
|-----------|----------|
| `agent-atoms.ts` | 会话列表、当前激活会话、流式状态 (`AgentStreamState`)、渠道/工作区映射、权限与问答请求队列 |
| `review-atoms.ts` | 内容审核专区状态：当前案卷、规则大纲、问题卡选中态、三栏联动焦点 (`reviewFocusAtom`) |
| `active-view.ts` | 主面板视图路由（`conversations` / `agent-skills` / `content-review`） |
| `settings-tab.ts` | 设置面板标签页路由（渠道配置、关于更新、通用设置等） |
| `theme.ts` | 界面主题模式（`light` / `dark` / `system`） |

### 核心前端设计模式

1. **全局 Agent 监听器 (`useGlobalAgentListeners`)**：
   - 挂载于 `renderer/main.tsx` 根部，使用 `useStore()` 直接更新 Atoms，生命周期贯穿应用全程；
   - 保证切换设置或审核专区时后台流式回复不中断、权限确认弹窗不丢失。
2. **三栏联动与卡片设计**：
   - 遵循 ShadcnUI 风格，用优雅的卡片与立体阴影取代冷硬边框；
   - 审核专区支持通过 `reviewFocusAtom` 点击右侧问题卡直接高亮中栏违规条目与左栏规则依据。

---

## 5. 本地存储规范与精简边界

- **配置文件优先**：配置存放在 `~/.profer/`（如 `channels.json`、`agent-sessions.json`），用户 Agent 沙箱存放在 `~/.cdutai/`。
- **结构化日志**：会话消息采用追加式 JSONL 存储（`agent-sessions/{sessionId}.jsonl`）。
- **坚守原则**：**绝不引入复杂重量级的本地数据库（如 SQLite）**，轻量文本配置与原子写入优于一切。
- **产品边界**：保持纯粹的 AI Agent 交互体验。历史遗留的独立服务端、多用户协同 UI 等已彻底清理，严禁引入过度设计的冗余模块。

---

## 6. 构建、测试与发版约束

1. **严格类型校验**：
   - 任何改动提交前，**必须执行 `bun run typecheck`**。严禁在存在类型报错、未导入符号的情况下打包。
2. **打包依赖闭包**：
   - 打包前必须执行 `bun run sync:runtime-deps` 与 `bun run verify:packaged-pi-runtime`，保证原生 native 模块完整内聚。
3. **资源目录规范**：
   - `resources/bin/` 仅允许存放随包 CLI 工具；
   - 内置依赖程序（如 MinGit 检查点引擎、BusyBox 等）通过 `electron-builder.yml` 明确配置 `extraResources` 并置于标准路径。
4. **文档同步铁律**：
   - 功能与架构发生调整后，保持 `AGENTS.md` 和 `README.md` 同步更新，且修改前必须经过用户确认。
