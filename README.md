<div align="center">

<img src="./docs/assets/profer-banner.svg" alt="Profer" width="100%" />

# Profer

**基于 Claude Agent SDK + Pi Agent 的通用 AI Agent 桌面应用**

Agent 工作流 · 协作子 Agent · 定时自动化 · Skills 与 MCP

[![GitHub Release](https://img.shields.io/github/v/release/Yuan-lai-ru-ci/ProferAI?style=flat-square&label=Release)](https://github.com/Yuan-lai-ru-ci/ProferAI/releases)
[![License](https://img.shields.io/github/license/Yuan-lai-ru-ci/ProferAI?style=flat-square&label=License)](./LICENSE)
[![Electron](https://img.shields.io/badge/Electron-43-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![Pi Agent SDK](https://img.shields.io/badge/Pi%20Agent%20SDK-0.86.1-6D28D9?style=flat-square)](https://www.npmjs.com/package/@earendil-works/pi-agent-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Stars](https://img.shields.io/github/stars/Yuan-lai-ru-ci/ProferAI?style=flat-square&label=Stars)](https://github.com/Yuan-lai-ru-ci/ProferAI)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/Yuan-lai-ru-ci/ProferAI/pulls)

</div>

---

Profer 是本地优先（local-first）的 AI Agent 桌面应用。以 Agent 会话为核心，提供任务编排、计划确认、协作子 Agent、自动化调度、文件预览，以及 Skills 与 MCP 配置。模型渠道由用户自行配置。

---

## ✨ 核心特性

| 特性 | 说明 |
| --- | --- |
| 🤖 **Agent 工作流** | 支持 Claude 与 Pi Agent runtime，任务图拆解、子任务依赖编排、流式输出与计划确认 |
| 🧩 **协作子 Agent** | 复杂任务拆分为独立子会话并行推进，完成后汇总结果 |
| ⏰ **定时任务自动化** | interval / daily / weekly / monthly 调度，运行历史与失败保护 |
| 📁 **文件与预览** | 会话文件浏览、差异预览、浏览器和常见文档预览 |
| 🧠 **Skills & MCP** | 按工作区配置 Agent Skills 与 MCP Server |
| 🎨 **桌面体验** | 自动更新、全局快捷键、浅色/深色外观与本地数据管理 |

---

## 📸 界面预览

<img src="./docs/assets/screenshots/profer-main-demo.png" alt="Profer 主界面" width="100%" />

---

## 🚀 快速开始

### 下载安装

从 [GitHub Releases](https://github.com/Yuan-lai-ru-ci/ProferAI/releases) 下载最新版本，提供 **macOS Apple Silicon / Intel** 与 **Windows** 安装包。

### 首次配置

1. 打开 Profer，完成环境检查（Agent 依赖 Git、Node.js / Bun 及可用 Shell）
2. **设置 → 模型配置**：添加 AI 渠道（Anthropic、DeepSeek、Kimi、智谱、豆包、通义千问等）
3. **设置 → Agent 配置**：选择默认渠道、模型和工作区，即可开始使用


---

## 🤖 支持的 Agent 渠道

| 供应商 | Agent | 协议 |
| --- | --- | --- |
| Anthropic | ✅ | Messages API |
| DeepSeek | ✅ | Anthropic 兼容 |
| Kimi API | ✅ | Anthropic 兼容 |
| Kimi Coding Plan | ✅ | Anthropic 兼容（官方白名单） |
| 智谱 AI | ✅ | Anthropic 兼容 |
| MiniMax | ✅ | Anthropic 兼容 |
| 豆包 | ✅ | Anthropic 兼容 |
| 通义千问 | ✅ | Anthropic 兼容 |
| OpenAI / Google / 自定义端点 | 按 Pi provider 支持情况 | 对应原生协议 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
| --- | --- |
| 运行时 | Bun |
| 桌面框架 | Electron 43 |
| 前端 | React 18 + TypeScript + Jotai |
| 样式 | Tailwind CSS + Radix UI |
| 富文本 / 图表 | TipTap · Beautiful Mermaid · KaTeX · Shiki |
| 构建 | Vite + esbuild + electron-builder |
| Agent SDK | Claude Agent SDK + Pi Agent adapter（当前支持双 runtime） |

---

## 👷 本地开发

Bun workspace monorepo：

```text
profer/
├── packages/
│   ├── shared/         # 共享类型、IPC 常量、配置
│   ├── core/           # Provider Adapter、SSE、代码高亮
│   ├── project-core/   # 项目 / 工作区领域模型
│   ├── session-core/   # 会话领域模型
│   └── ui/             # 共享 React UI 组件
├── apps/
│   ├── electron/       # Electron 桌面应用
│   └── cli/            # 命令行工具
```

```bash
bun install        # 安装依赖
bun run dev        # 开发模式（Vite + Electron + 热重载）
bun run typecheck  # 类型检查
bun test           # 测试
```

---

## 🤝 贡献

欢迎提交 PR！提交前请确认：

- 使用 Bun，不混用 npm / pnpm lockfile
- 状态管理使用 Jotai
- TypeScript 禁用 `any`，对象结构优先使用 `interface`
- 新增 IPC 时同步修改 shared 类型、main handler、preload bridge、renderer 调用
- 影响包行为时递增对应 package 的 patch 版本

---

## 📄 许可证

Profer 基于 [Proma](https://github.com/ErlichLiu/Proma) 开发，社区版采用 [AGPL-3.0](./LICENSE) 协议。

## 🙏 致谢

感谢 [Proma](https://github.com/ErlichLiu/Proma) by Erlich Liu，以及 Shiki、Beautiful Mermaid、Cherry Studio、Lobe Icons、Craft Agents OSS
