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

# 运行自动化测试（隔离环境运行）
bun test --isolate

# 架构边界检查
bun run check:boundaries

# 打包依赖闭包同步（打包前必须执行）
bun run sync:runtime-deps

# 验证离线运行时完整性
bun run verify:packaged-pi-runtime

# 快速本地打包（当前架构）
cd apps/electron && bun run dist:fast
```

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
