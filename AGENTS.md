# AGENTS.md

This file provides guidance to Codex, Antigravity, and other AI pair programmers when working with code in this repository.

**重要提示：**
- 当功能发生变化时，请保持此文件和 `README.md` 同步更新。请更新文档以反映当前状态，但是需要经过我的允许后再修改。
- 所有的注释和日志优先采用中文，保留必要的专业术语部分。
- 所有的依赖包的安装都要先进行搜索，综合判断依赖采用的版本，而不是默认采用某个版本。
- 状态管理上我们全部采用 Jotai 来实现。
- 这是个开源项目，本地存储优先，善用配置文件优于大部分默认采用 localstorage，不采用本地数据库方案。
- 保证充分的组件化以及人类的可读性，每次完成改动后都要思考这一点，运行 @code-simplifier 来简化优化代码，保持简单直接不过渡设计的风格。
- 在 UI 设计上采用更现代的方案，UI 组件推荐采用 ShadcnUI，在合适的情况下，用卡片和阴影取代边框，用符合主题的饱满色彩，设置界面要设置背景，为未来做不同主题留下空间。
- 采用 BDD 行为驱动开发的方案。

> 本文件与 `CLAUDE.md` 保持同一套项目约束；平台相关命令必须按当前宿主系统和运行时检测结果执行。

## 项目概述

CDUT Studio 是一个集成通用 AI Agent 的下一代桌面人工智能软件，采用 Electron 桌面应用架构。核心运行时由 **Pi Coding Agent (`@earendil-works/pi-*`) 作为唯一内核驱动**。

> **项目命名**：CDUT Studio（代码内部兼容包名前缀 `@profer/*`）。

## Monorepo 结构

基于 Bun workspace 的 monorepo 结构（8 个核心包）：

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

**依赖管理**：内部包使用 `workspace:*` 互相引用。

## 常用命令

```bash
# 开发模式（推荐 - Vite HMR；Electron 只启动一次）
bun run dev

# 构建全量产物
bun run electron:build

# 类型检查（全仓库 8 个包）
bun run typecheck

# 单包类型检查
cd packages/core && bun run typecheck

# 测试
bun test

# 打包分发（按目标平台执行）
cd apps/electron
bun run dist:fast     # 当前宿主架构快速打包
bun run dist:mac      # macOS 当前架构验收包
bun run dist:win      # Windows x64 发布/验收包（必须在 Windows 构建主机执行）
# Windows 专属的 PowerShell/注册表 PATH/打包校验只在 Windows 主机执行；不要在 macOS shell 中执行 Windows 命令
```

### Electron 构建脚本（`apps/electron/` 目录下）

```bash
bun run build:main        # esbuild → dist/main.cjs
bun run build:preload     # esbuild → dist/preload.cjs
bun run build:renderer    # Vite → dist/renderer/
bun run build:resources   # 复制 resources/ 到 dist/
bun run generate:icons    # 生成应用图标
```

## 运行时环境

使用 Bun 代替 Node.js/npm/pnpm：

- `bun install` 安装依赖，`bun run <script>` 运行脚本
- `bun test` 运行测试（内置测试运行器，`import { test, expect } from "bun:test"`）
- Bun 自动加载 .env 文件（无需 dotenv）
- 优先使用 Bun 原生 API：`Bun.file` > `node:fs`，`Bun.$\`command\`` > `execa`

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **运行时** | Bun | 1.2.5+ |
| **语言** | TypeScript | 5.0.0+ |
| **桌面框架** | Electron | 39.5.1 |
| **前端框架** | React | 18.3.1 |
| **状态管理** | Jotai | 2.17.1 |
| **UI 组件** | Radix UI | 最新 |
| **样式** | Tailwind CSS | 3.4.17 |
| **富文本编辑器** | TipTap | 3.19.0 |
| **代码高亮** | Shiki | 3.22.0 |
| **Markdown** | React Markdown | 10.1.0 |
| **图表** | Beautiful Mermaid | 最新 |
| **数学公式** | KaTeX | 0.16+ |
| **构建工具** | Vite | 6.0.3 |
| **打包工具** | esbuild | 0.24.0+ |
| **分发工具** | Electron Builder | 25.1.8 |
| **Agent SDK** | @anthropic-ai/claude-agent-sdk | 0.3.153 |
| **飞书 SDK** | @larksuiteoapi/node-sdk | 最新 |

## 核心架构

### IPC 通信模式（最重要的架构模式）

类型定义 → 主进程处理 → Preload 桥接 → 渲染进程调用：

1. **类型 & 常量**：`@proma/shared` 定义 IPC 通道名称常量和请求/响应类型
2. **主进程处理**：`main/ipc.ts`（57KB）注册 `ipcMain.handle()` 处理器，调用 `main/lib/` 服务
3. **Preload 桥接**：`preload/index.ts` 通过 `contextBridge.exposeInMainWorld` 暴露类型安全的 API
4. **渲染进程**：通过 `window.electronAPI.*` 调用，Jotai atoms 中封装调用逻辑

添加新 IPC 通道时，需要同步修改这四个位置。

#### 主要 IPC 通道组

- `IPC_CHANNELS` - 基础通道（运行时、Git、环境）
- `CHANNEL_IPC_CHANNELS` - 渠道管理
- `AGENT_IPC_CHANNELS` - Agent 功能
- `ENVIRONMENT_IPC_CHANNELS` - 环境检查
- `PROXY_IPC_CHANNELS` - 代理设置
- `SYSTEM_PROMPT_IPC_CHANNELS` - 系统提示词
- `MEMORY_IPC_CHANNELS` - 记忆功能
- `FEISHU_IPC_CHANNELS` - 飞书集成
- `GITHUB_RELEASE_IPC_CHANNELS` - GitHub 发布
- `REVIEW_IPC_CHANNELS` - 内容审核专区（14 通道：案卷 CRUD/导入、大纲、条目识别、审核运行、运行查询、助手对话、报告导出、网关自检、案卷设置）

### 主进程服务层（`main/lib/`）

#### 核心服务

| 服务 | 职责 |
|------|------|
| `agent-orchestrator.ts` | Agent 核心编排层（71KB）：并发守卫、渠道查找、环境变量构建、SDK 路径解析、消息持久化、事件流处理、错误处理、自动标题生成 |
| `agent-session-manager.ts` | Agent 会话管理：SDK 消息持久化、会话元数据 CRUD、JSONL 存储 |
| `agent-prompt-builder.ts` | Agent 系统提示词构建（18KB）：动态上下文构建、内置 Agent 构建、工作区上下文注入 |
| `agent-permission-service.ts` | Agent 权限管理：工具权限检查、权限模式管理 |
| `agent-ask-user-service.ts` | Agent 用户交互：AskUser 请求处理 |
| `agent-exit-plan-service.ts` | Agent 退出计划服务 |
| `agent-workspace-manager.ts` | 工作区管理：MCP Server 配置、Skills 配置、工作区 CRUD |
| `conversation-title-service.ts` | 对话标题生成与重新生成；Chat 发送引擎已移除 |
| `conversation-manager.ts` | 会话 JSONL / 元数据存储，供 Agent 目标、教程等兼容服务使用 |
| `channel-manager.ts` | 渠道管理：渠道 CRUD、API Key AES-256-GCM 加密、连接测试与模型获取 |
| `review/` | 内容审核专区服务层（17 文件）：case-store 案卷原子存储、document-service 文档解析切块、review-model-gateway 统一模型出口（白名单强制 + 多模态降级）、mock-review-engine 确定性引擎、ai-review-service AI 双路径、run-service 运行编排、report-service 报告导出、review-ipc 14 个入参校验 handler |

#### 集成服务

| 服务 | 职责 |
|------|------|
| `feishu-bridge.ts` | 飞书集成（68KB）：消息同步、任务通知、OAuth 认证 |
| `memory-service.ts` | 记忆管理：跨会话记忆存储与检索 |
| `memos-client.ts` | Memos 客户端：笔记服务集成 |

#### 工具与文件

| 服务 | 职责 |
|------|------|
| `workspace-watcher.ts` | 工作区文件监听：文件系统变化监控 |
| `attachment-service.ts` | 附件管理：存储/读取/删除、文件对话框 |
| `document-parser.ts` | 文档解析：PDF/Office/文本文件提取 |

#### 系统服务

| 服务 | 职责 |
|------|------|
| `runtime-init.ts` | 运行时初始化：Shell 环境、Bun、Git 检测（`bun-finder.ts`、`git-detector.ts`、`shell-env.ts`） |
| `config-paths.ts` | 配置路径管理：`~/.profer/` 目录结构 |
| `user-profile-service.ts` | 用户档案持久化 |
| `settings-service.ts` | 应用设置持久化（主题等） |
| `updater/` | 自动更新：Electron Updater 集成 |

### AI Provider 适配器（`packages/core/src/providers/`）

基于适配器模式的多 Provider 支持，通过注册表统一管理：

#### 核心架构
- `ProviderAdapter` 接口：定义统一的 `sendMessage()` 流式方法
- `provider-registry.ts`：Provider 注册表，按 `providerId` 查找适配器
- `sse-reader.ts`：通用 SSE 流读取器（fetch + ReadableStream）

#### 支持的 Provider

| Provider | 适配器 | API 协议 | 特性 |
|----------|--------|----------|------|
| **Anthropic** | `anthropic-adapter.ts` | Messages API | extended_thinking、多模态 |
| **OpenAI** | `openai-adapter.ts` | Chat Completions | 标准 OpenAI 协议 |
| **DeepSeek** | `anthropic-adapter.ts` | Messages API | Anthropic 兼容 |
| **智谱 AI** | `openai-adapter.ts` | Chat Completions | OpenAI 兼容 |
| **MiniMax** | `anthropic-adapter.ts` | Messages API | Anthropic 兼容 |
| **豆包** | `openai-adapter.ts` | Chat Completions | OpenAI 兼容 |
| **通义千问** | `openai-adapter.ts` | Chat Completions | OpenAI 兼容 |
| **Google** | `google-adapter.ts` | Generative Language API | Gemini 系列 |
| **Custom** | `openai-adapter.ts` | Chat Completions | 自定义 OpenAI 兼容端点 |

#### 多模态支持
- **图片**：各 Provider 格式不同，适配器自动转换
- **文档**：提取文本后注入 `<file>` XML 标签

### Jotai 状态管理（`renderer/atoms/`）

| Atom 文件 | 管理的状态 |
|-----------|-----------|
| `chat-atoms.ts` | 对话列表、当前消息、流式状态（Map 结构支持多对话并行）、模型选择、上下文设置、并排模式、思考模式、待上传附件 |
| `agent-atoms.ts` | Agent 会话列表、当前会话、流式状态（`AgentStreamState`）、工作区选择、渠道选择、权限/AskUser 请求队列（按 sessionId Map） |
| `active-view.ts` | 主面板视图切换（'conversations' / 'planning' / 'agent-skills' / 'content-review'） |
| `app-mode.ts` | 应用模式状态（历史 chat 值仅用于旧设置兼容） |
| `settings-tab.ts` | 设置面板当前标签页（18 个：general / usage / account / channels / appearance / about / agent / prompts / tools / bots / tutorial / shortcuts / team / openapi / data-management / developer / proxy / devices） |
| `review-atoms.ts` | 内容审核专区状态：当前案卷/案卷列表、审核运行、问题卡选中态、三栏联动焦点（reviewFocusAtom，nonce 驱动）、规则定位、忙碌/错误态、网关出口自检、助手消息（共 21 个 atoms） |
| `theme.ts` | 主题模式（light / dark / system） |
| `user-profile.ts` | 用户档案（姓名 + 头像） |
| `updater.ts` | 自动更新状态（检查/下载/安装），优雅降级（updater 不可用时保持 idle） |

### 渲染进程组件架构（`renderer/components/`）

- **`app-shell/`**：三面板布局，侧边栏提供会话列表、搜索、流式指示与项目导航
- **`content-review/`**：内容审核专区三栏工作台 — ContentReviewView（视图根）+ LeftPanel（依据材料 + AI 规则大纲 + 案卷管理条 CaseManagerBar/CreateCaseDialog）+ CenterPanel（待审条目与证明，SourceBlockView 定位高亮块）+ RightPanel（AI 审核员问题卡 FindingCard + 覆盖摘要 + 报告导出）+ AssistantDrawer（快捷键审核助手）+ use-review-actions（IPC 动作层）；三栏联动由 reviewFocusAtom 驱动（点问题卡 → 中栏红/黄高亮 + 左栏蓝高亮，跨文档矛盾双处同色）
- **`agent/`**：Agent 模式 — AgentView（纯展示 + 交互，IPC 监听已提升到全局）、AgentHeader（渠道/模型选择）、AgentMessages（消息列表 + 工具活动）、ToolActivityItem（工具调用展示）、WorkspaceSelector（工作区切换）、PermissionBanner/AskUserBanner（权限/问答请求 UI）
- **`settings/`**：设置面板 — GeneralSettings（用户档案）、AppearanceSettings（主题）、ChannelSettings（渠道管理）、ChannelForm（Provider 配置）、AgentSettings（Agent 渠道/工作区/MCP）、McpServerForm（MCP 服务器配置）、AboutSettings（版本/更新）、FeishuSettings（飞书集成）；含 `primitives/` 可复用表单组件
- **`file-browser/`**：文件浏览器 — FileBrowser（工作区文件树浏览）
- **`ai-elements/`**：AI 展示组件 — Markdown 渲染、代码块、Mermaid 图、推理折叠、上下文分割线、富文本输入
- **`ui/`**：Radix UI 组件（现代化设计，CSS 变量主题）

### 全局 Hooks（`renderer/hooks/`）

| Hook | 职责 |
|------|------|
| `useGlobalAgentListeners` | 全局 Agent IPC 监听器，在 `main.tsx` 顶层挂载，使用 `useStore()` 直接操作 atoms。处理流式事件、完成/错误、标题更新、权限请求、AskUser 请求，永不随组件卸载销毁 |
| `useBackgroundTasks` | 后台任务管理（Agent/Shell 任务的增删改查），按 sessionId 隔离 |

### 渲染进程初始化组件（`renderer/main.tsx`）

# 架构边界检查
bun run check:boundaries

# 打包依赖闭包同步（打包前必须执行）
bun run sync:runtime-deps

# 验证离线运行时完整性
bun run verify:packaged-pi-runtime

# 快速本地打包（当前架构）
cd apps/electron && bun run dist:fast
```
用户输入 → agent-orchestrator.ts (SDK 编排)
  ↓
SDK query() → SDKMessage 流
  ↓
convertSDKMessage() → AgentEvent[]
  ↓
webContents.send() → IPC 推送
  ↓
useGlobalAgentListeners (全局监听) → store.set(atoms)
  ↓
React UI 更新
```

### 关键组件

#### agent-orchestrator.ts（核心编排层，71KB）
- **并发守卫**：同一会话不允许并行请求
- **渠道管理**：查找渠道 + API Key 解密
- **环境构建**：环境变量 + SDK 路径解析
- **消息持久化**：SDK 消息存储到 JSONL
- **事件流处理**：文本累积 + 工具调用解析
- **错误处理**：SDK 错误映射 + 重试逻辑
- **自动标题**：首次对话自动生成标题

#### agent-prompt-builder.ts（提示词构建，18KB）
- **系统提示词生成**：基于工作区配置
- **动态上下文构建**：注入工作区信息
- **内置 Agent 构建**：预定义 Agent 配置

#### agent-permission-service.ts（权限管理）
- **工具权限检查**：基于权限规则
- **权限模式管理**：safe / ask / allow-all

### 关键设计

- **SDK 调用**：`sdk.query({ prompt, options: { apiKey, model, permissionMode, cwd, abortController } })`
- **事件转换**：`convertSDKMessage()`（`@proma/shared`）将 SDK 原始消息转为统一的 `AgentEvent` 类型
- **工具匹配**：`packages/shared/src/agent/tool-matching.ts` — 无状态 `ToolIndex` + `extractToolStarts` / `extractToolResults` 解析工具调用
- **状态管理**：`applyAgentEvent()` 纯函数更新 `AgentStreamState`，支持流式增量更新
- **全局 IPC 监听**：`useGlobalAgentListeners`（`renderer/hooks/`）在 `main.tsx` 顶层挂载，通过 `useStore()` 直接操作 atoms，永不销毁。确保页面切换（如设置页）时流式输出、权限请求不丢失
- **权限请求排队**：权限/AskUser 请求按 sessionId 入队到 Map atoms（`allPendingPermissionRequestsAtom` / `allPendingAskUserRequestsAtom`），不区分当前/后台会话，SDK Promise 等待用户回来响应
- **工作区隔离**：每个工作区独立的 MCP Server 配置和 cwd，Agent 会话按工作区过滤

### SDK 版本升级注意事项

**`@anthropic-ai/claude-agent-sdk` 0.2.113+ `options.env` 语义为"替换"**

- SDK 将 `options.env` **替换** 传递给子进程（0.2.111/0.2.112 短暂改为叠加，0.2.113 恢复替换）
- 如果传 `env` 时只给 `ANTHROPIC_*` 相关变量，子进程会丢失 `PATH` / `HOME` / `SHELL` 等关键变量，导致 SDK 调用 `npx` / `git` 等命令失败
- **正确做法**：`agent-orchestrator.ts` 的 `buildSdkEnv()` 末尾显式 `{ ...cleanEnv, ...customEnv }` 合并 `process.env`，再剥离不希望泄漏的 `ANTHROPIC_*` 变量
- **修改 `buildSdkEnv()` 时的检查清单**：
  1. ✅ 基于 `process.env` 合并，保证 PATH / HOME / SHELL 等继承到子进程
  2. ✅ 过滤掉不希望泄漏的 `ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_CUSTOM_HEADERS`、`ANTHROPIC_MODEL` 等
  3. ✅ 新增的 SDK 识别的环境变量必须显式加入 `sdkEnv`
- 若未来升级到后续大版本导致语义再次变化，需重新评估本加固逻辑

**关键 Breaking Changes（升级参考）**：
- `0.2.91`: `sandbox.failIfUnavailable` 默认从 `false` 变为 `true`（目前项目未使用 sandbox 选项）
- `0.2.111`: `options.env` 从"替换"变为"叠加"
- `0.2.113`:
  - `options.env` 回退为"替换"
  - **SDK 包结构重构**：删除 `cli.js`，改为平台 native binary（通过 `@anthropic-ai/claude-agent-sdk-{platform}-{arch}` optionalDependency 分发），ripgrep 编译进 binary
  - 详见上方"打包配置注意事项"段落
- `0.2.120`: `query()` 省略 `settingSources` 时默认加载所有来源（Proma 已显式传 `['user', 'project']`，不受影响）
- `0.3.142`: SDK/headless 默认使用 Task 工具（`TaskCreate` / `TaskUpdate` / `TaskGet` / `TaskList`）替代已废弃的 `TodoWrite`；MCP server 默认后台连接，慢连接会在 `init` 中呈现 `pending`
- `0.3.143`: `@anthropic-ai/sdk` 与 `@modelcontextprotocol/sdk` 改为 peerDependencies；bun/npm/pnpm 会自动安装

### 共享类型（`@proma/shared`）

- `AgentEvent`：Agent 事件（text / tool_start / tool_result / done / error）
- `AgentSessionMeta`：会话元数据（id / title / channelId / workspaceId）
- `AgentMessage`：持久化消息（role + content blocks）
- `AgentSendInput`：发送请求输入
- `AGENT_IPC_CHANNELS`：Agent 相关 IPC 通道常量
- `WorkspaceCapabilities`：工作区能力（MCP Server 列表 + Skills 列表）

## 创作参考

遵循 [craft-agents-oss](https://github.com/craftship/craft-agents-oss) 的模式：

- **会话管理**：收件箱/归档工作流
- **权限模式**：safe / ask / allow-all
- **Agent SDK**：@anthropic-ai/claude-agent-sdk（[v1 文档](https://platform.claude.com/docs/en/agent-sdk/typescript)、[v2 文档](https://platform.claude.com/docs/en/agent-sdk/typescript-v2-preview)）
- **MCP 集成**：Model Context Protocol 用于外部数据源
- **凭证存储**：AES-256-GCM 加密
- **配置位置**：`~/.profer/`（类似 `~/.craft-agent/`）

## 核心特性

### 已实现功能

- ✅ **多 Provider 支持**：Anthropic、OpenAI、DeepSeek、Kimi、智谱、MiniMax、豆包、通义千问、Google、自定义端点
- ✅ **Agent SDK 集成**：Claude Agent SDK 与 Pi Agent adapter 双运行时
- ✅ **飞书集成**：消息同步、任务通知、OAuth 认证（68KB 核心服务）
- ✅ **工作区管理**：多工作区隔离、MCP Server 配置、Agent Skills 管理
- ✅ **权限系统**：工具权限检查、用户确认流程
- ✅ **Automation 定时任务**：持久化调度、运行历史、手动运行、失败保护、飞书通知
- ✅ **记忆系统**：跨会话记忆存储与检索
- ✅ **自动更新**：Electron Updater 集成
- ✅ **代理支持**：系统代理检测与配置
- ✅ **文档解析**：PDF、Office、文本文件提取
- ✅ **多模态支持**：图片、文档附件
- ✅ **内容审核专区**：三栏审核工作台（依据/待审/审核）、领域包可切换（综测/合同/报销/自定义）、问题卡三栏联动定位高亮、跨文档比对、AI/确定性引擎双路径、预审报告导出


### 架构亮点

- **并发守卫**：同一会话防止并行请求冲突
- **全局监听**：Agent IPC 监听器永不销毁，确保后台会话不丢失
- **权限排队**：按 sessionId 隔离权限请求，支持多会话并行
- **文件监听**：工作区文件与 MCP 配置实时监控
- **事件流处理**：SDK 消息流式转换与累积
- **错误映射**：SDK 错误统一转换为应用错误

## 历史维护说明

下方旧版更新记录曾描述团队文件管理和独立服务端。这些内容不代表当前公开应用功能；团队工作区 UI、Chat 用户模式与第三方插件系统已从应用入口和对应实现中移除。共享工作区/同步底层服务仍有 planning 等调用方，不能将其等同于完整产品能力。

## 当前裁剪状态

## 技术栈与运行时

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **运行时** | Bun 1.2.5+ (推荐 1.4.2+) | 统一使用 Bun 代替 Node.js/pnpm 执行脚本与测试 |
| **开发语言** | TypeScript 5.0.0+ | 严格模式，`"moduleResolution": "bundler"` |
| **桌面框架** | Electron 43.2.0 | 主进程/Preload 由 esbuild 构建，渲染进程由 Vite 构建 |
| **前端框架** | React 18.3.1 | 现代化函数式组件 + Hooks |
| **状态管理** | Jotai 2.17.1 | 全局与局部状态原子化管理 |
| **核心内核** | Pi Agent (`@earendil-works/pi-*`) | **唯一内核**，驱动代码编写、工具调用与任务执行 |
| **UI 体系** | Tailwind CSS + Radix UI + TipTap | 现代卡片阴影设计，支持深浅主题无缝切换 |

## 核心架构原则

### 1. IPC 通信规范
- **通道定义**：在 `@profer/shared` 中集中定义强类型 IPC 通道常量与入参/返回类型。
- **主进程**：`main/ipc.ts` 集中注册处理器并调度底层服务。
- **Preload 桥接**：`preload/index.ts` 暴露类型安全的 `window.electronAPI`。
- **渲染进程**：Jotai atoms 与 Hooks 封装调用逻辑，不在 UI 组件内散落原生通信。

### 2. Pi Agent 运行与执行环境
- **内核驱动**：以 `@earendil-works/pi-coding-agent` 为唯一执行内核，内部协议通过适配器与界面事件解耦。
- **Windows 零配置开箱即用**：
  - Windows 下实行**静默自动降级策略**：`Git Bash（若已装） > 内置 BusyBox Bash > WSL > 原生 PowerShell`。
  - 用户无感知、界面无繁琐切换开关，确保全新纯净 Win10/Win11 机器无需预装 Git 或配置 WSL 即可直接运行。
  - 工具层统一提供 `Bash` 工具契约，并在 Windows 下并行提供原生 `PowerShell` 工具支持系统深度操作。
- **权限安全体系**：`packages/shared/src/constants/permission-rules.ts` 定义只读/安全白名单与危险命令拦截。

### 3. 本地存储规范 (`~/.profer/`)
- 配置与索引采用轻量 JSON（如 `channels.json`, `agent-sessions.json`）。
- 会话消息流采用追加写入的 JSONL 格式（`agent-sessions/{sessionId}.jsonl`）。
- **坚守原则**：优先使用文本配置文件与追加日志，绝不引入复杂重量级的本地数据库（如 SQLite）。

### 4. 产品边界与精简规约
- 专注纯粹的 **AI Agent 工作流**，保持界面与主进程代码的精简、高效与专注。
- 历史遗留的 Chat 用户模式、团队多用户协同 UI、语音输入、快速任务小窗及不必要的外部耦合服务均已裁撤或计划下线。
- 避免过度设计，新功能必须优先保持简洁直接。

## 打包与发布约束
- **主进程外部化依赖**：`electron` 与 `@earendil-works/pi-*` 原生 native 模块严格通过打包脚本保证完整闭包。
- **资源目录隔离**：
  - `resources/bin/` 严格受契约保护，仅允许包含随包 CLI 工具；
  - 第三方工具与内置可执行程序（如内置 BusyBox）必须放置于 `resources/vendor/` 对应子目录。
- **版本规范**：任何功能改动必须递增受影响子包的 patch 版本。
