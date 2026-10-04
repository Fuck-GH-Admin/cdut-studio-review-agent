# CLAUDE.md 更新对齐计划

> 目标文件：`c:\Users\Belie\Desktop\CDUT-Studio\CLAUDE.md`
> 依据标准：`c:\Users\Belie\Desktop\CDUT-Studio\AGENTS.md`
> 事实基准：当前代码库实际情况（以代码为准）
> 约束：本阶段只产出计划，**不修改任何文件**。

---

## 一、摘要（Summary）

`CLAUDE.md` 目前处于「古早版本」，存在大量与当前代码库不符的历史信息（旧项目名、旧包名前缀、旧内核、旧版本号、旧目录结构、已删除的 Claude Agent SDK 章节等）。`AGENTS.md` 是较新的约束文件，但自身也存在若干与代码不一致的待修点。

本次更新的目标形态（用户已确认）：

1. **以 AGENTS.md 为最新基准**，把 CLAUDE.md 的事实信息更新到最新；
2. **保留 CLAUDE.md 中比 AGENTS.md 更充分的细节**（这些细节在 AGENTS.md 中不存在）；
3. 所有事实**以代码为准**，即使 AGENTS.md 与代码冲突，也以代码为准并**标注待修点**；
4. 已失效的 Claude Agent SDK 章节**替换为 Pi 内核对应内容**，而非删除。

产出物：一份**逐章节、决策完备**的改写方案。执行者按本计划可直接完成 CLAUDE.md 的重写，无需再做额外取证。

---

## 二、现状分析（Current State Analysis）

### 2.1 事实基准来源（已探明）

| 证据源 | 关键结论 |
|--------|----------|
| 根 `package.json` | `workspaces: ["packages/*","apps/*"]`；`overrides` 锁定 `@earendil-works/pi-*` 全部为 `0.86.1`；`patchedDependencies` 打补丁 `pi-ai@0.86.1`、`pi-coding-agent@0.86.1`；脚本 `typecheck` = `bun run --filter='*' typecheck`、`check:boundaries`、`test` = `bun test --isolate` |
| `apps/electron/package.json` | 包名 `@profer/electron` v`0.15.89`，描述 `CDUT Studio`；esbuild 以 `--external:@earendil-works/pi-coding-agent / pi-agent-core / pi-ai` 构建；`optionalDependencies: {}`（无 Claude SDK 平台子包）；脚本 `sync:runtime-deps`、`verify:packaged-pi-runtime`、`dist:fast/win/mac`、`release:verify:windows`、`verify:build-target:oss|commercial`、`check:skin-token-sync` |
| `apps/electron/src/main/lib/config-paths.ts` | 存储根为 `~/.cdutai/`（生产）/ `~/.cdutai-dev/`（开发）；**不读取也不迁移** `~/.proma`、`~/.profer` |
| `packages/core/src/providers/index.ts` | `adapterRegistry` 实际 18 个 providerType；适配器为 `AnthropicAdapter` / `OpenAIAdapter` / `OpenAIResponsesAdapter` / `GoogleAdapter` |
| `apps/electron/src/main/lib/agent-orchestrator.ts` | 第 1330 行 `await import('@earendil-works/pi-coding-agent')`，确认 Pi 为唯一内核 |
| `apps/electron/electron-builder.yml` | `appId: com.cdutai.studio`、`productName: CDUT Studio`、`electronVersion: 43.2.0`；`asarUnpack` 含 `@anthropic-ai/**`、`@earendil-works/pi-tui/native/**` 等；`files` 内含**过时前缀** `!node_modules/@proma/**`；`extraResources` 含 default-skills/tutorial/skins/ppt-style-packs 等 |
| 各包 `package.json` | 6 个包 + `apps/cli`，全部 `type: module`、`AGPL-3.0-only` |
| `apps/electron/src/renderer/atoms/settings-tab.ts` | 18 个设置标签页 |
| `apps/electron/default-skills/` | 实际 **16** 个默认技能 |
| `apps/electron/src/renderer/main.tsx` | 实际初始化组件约 **15** 个（CLAUDE.md 仅记录 4 个） |

### 2.2 CLAUDE.md 的过时/错误条目清单

| 位置 | 现文 | 实际 | 处理 |
|------|------|------|------|
| 项目名 | `Profer` | `CDUT Studio` | 全文替换 |
| 包名前缀 | `@proma/*` | `@profer/*` | 全文替换 |
| Monorepo | 仅 4 包（shared/core/session-core/ui）+ apps/electron | 6 包 + `apps/cli` | 重写树 |
| 版本号 | shared 0.1.31 / core 0.2.11 / session-core 0.1.0 / ui 0.1.9 / electron 0.12.69 | shared 0.1.45 / core 0.2.12 / session-core 0.1.1 / ui 0.2.0 / electron 0.15.89 / agent-fabric 0.1.0 / project-core 0.1.0 / cli 0.1.1 | 更新 |
| 技术栈 Electron | `39.5.1` | `^43.2.0` | 更新 |
| 技术栈内核 | `@anthropic-ai/claude-agent-sdk@0.3.153` | `@earendil-works/pi-*@0.86.1`（唯一内核） | 替换 |
| `@proma/shared` 导出 | 含 `./constants/permission-rules` | 仅 `"."`、`"./types"`、`"./config"`、`"./utils"` | 更正 |
| 「打包配置注意事项」整章 | Claude SDK `--external` + 214–252MB native binary + 平台子包 optionalDependencies | 已被 Pi 内核取代 | 重写为 Pi 版本 |
| 「SDK 版本升级注意事项」整章 | 0.2.91/0.2.111/0.2.113/0.2.120/0.3.142/0.3.143 breaking changes、`buildSdkEnv()` | 已失效 | 替换为 Pi 内核约束 |
| 本地存储 | `~/.profer/` | `~/.cdutai/` / `~/.cdutai-dev/` | 更正 |
| Provider 表 | Anthropic/OpenAI/DeepSeek/智谱/MiniMax/豆包/通义/Google/Custom | 18 项实际映射 | 重写 |
| 默认 Skills | 14 个，含不存在的 `guizang-ppt-skill` | 16 个实际技能 | 重写 |
| Atoms 表 | 含 `chat-atoms.ts`、`user-profile.ts`、`updater.ts`、`credits-atoms.ts` | 这些文件不存在 | 更正 |
| `main.tsx` 初始化器 | 4 个 | 约 15 个 | 更正 |
| 「当前裁剪状态」 | 描述已过时的裁剪面 | 需按现状校正 | 更新 |

### 2.3 AGENTS.md 自身的待修点（不擅自修改，仅标注）

| 位置 | AGENTS.md 现文 | 实际 | 说明 |
|------|----------------|------|------|
| 第 5 节 本地存储 | `~/.profer/` | `~/.cdutai/` | 与代码冲突 |
| 第 2 节 Monorepo | 「8 个核心包」且把 `cli` 列在 `packages/` 内 | 实际 6 个包，`cli` 在 `apps/cli` | 结构描述偏差 |
| 第 2 节命令 | `bun run ensure:mingit` | 根 `package.json` 无该脚本（仅 `apps/electron/scripts/ensure-mingit.ts`） | 命令未接线 |
| `electron-builder.yml` | —— | 仍含 `!node_modules/@proma/**` | 过时前缀（代码待修，非文档问题） |

> 依据红线原则「文档修改需经用户允许」，本计划**只生成 CLAUDE.md 的改写方案**；对 AGENTS.md 的修正一并列出待用户批准后再单独处理。

---

## 三、拟定变更（Proposed Changes）

> 以下为 CLAUDE.md 的**逐章节改写方案**。改写风格：保留 CLAUDE.md 的详实细节，对齐 AGENTS.md 的最新信息与红线原则，所有事实以代码为准。

### 3.0 顶部「重要提示」红线条目块
- **改什么**：将 CLAUDE.md 现有提示块升级为 AGENTS.md 版本，补齐：Jotai 统一状态管理、开源/本地存储优先且不引入本地数据库、充分组件化与人类可读性、ShadcnUI 现代 UI（卡片阴影替代边框、设置界面设背景）、BDD、以及"完成前/提交前必跑 `bun run typecheck`"的硬性约束。
- **为什么**：AGENTS.md 是最新基准，红线约束需两文件一致。
- **怎么做**：以 AGENTS.md 顶部条目为蓝本逐条对齐，中文表述，保留专业术语。

### 3.1 项目概述（对应 AGENTS.md 第 1 节）
- **改什么**：项目名 `Profer` → `CDUT Studio`；明确「唯一内核 = Pi Coding Agent（`@earendil-works/pi-*`）」；删除「脱胎于 Proma / 2026-06-21 改名记录」这类历史叙述或改写为简短沿革说明。
- **为什么**：命名与内核是最高优先级事实。
- **怎么做**：采用 AGENTS.md 第 1 节表述，补充 README 中的品牌信息（成都理工大学定制 AI 智能体工作台、三模块等，仅一句带过）。

### 3.2 Monorepo 结构与常用命令（对应 AGENTS.md 第 2 节）
- **改什么**：
  - 目录树重写为：`packages/` 下 6 个包（shared / core / session-core / ui / agent-fabric / project-core）+ `apps/electron` + `apps/cli`。
  - 各包版本号更新为实际值（见 2.2）。
  - 常用命令对齐真实脚本：`bun run dev`、`bun run electron:build`、`bun run typecheck`、`bun test`、`bun run check:boundaries`、`bun run sync:runtime-deps`、`bun run verify:packaged-pi-runtime`、`dist:fast/win/mac`。
- **为什么**：结构、版本、脚本均与现状不符。
- **怎么做**：以 AGENTS.md 第 2 节骨架 + 代码实测脚本为准；`ensure:mingit` 标注为"未接线（脚本未在根 package.json 暴露）"。

### 3.3 核心架构与设计模式（对应 AGENTS.md 第 3 节）
- **3.3.1 IPC 通信模式**：保留 CLAUDE.md 的细粒度说明（类型定义→主进程→Preload→渲染进程），对齐 AGENTS.md 的通道组清单，补全实际存在的通道组（AGENT/CHANNEL/REVIEW/FEISHU/ENVIRONMENT/PROXY/AUTOMATION/SKIN/…）。
- **3.3.2 Pi Agent 运行与执行环境**：**以 AGENTS.md 第 3.2 节为权威模板**写入：Windows 静默降级（Git Bash > 内置 BusyBox Bash > WSL > PowerShell）、内置 MinGit（`resources/bin/git/cmd/git.exe`）、无工作区沙箱隔离（`~/.cdutai/agent-workspaces/default/{sessionId}`，`effectiveWorkspaceId = workspaceId ?? workspace?.id`）、快照熔断（`MAX_SNAPSHOT_FILE_COUNT = 500`、`gcShadowRepo` 异步、会话删除异步清理）、思考链流式渲染要求、权限安全体系。
- **3.3.3 主进程服务层**：将 CLAUDE.md 的 `main/lib/` 表与「Pi 内核 + 实际服务」对齐；保留仍有效的服务条目，删除/合并已不存在或已重命名者，补充 `pi-*`、`automation-*`、`goal-*`、`skin-*` 等实际存在的关键服务（按重要度取舍，避免罗列 ~200 文件）。
- **3.3.4 Provider 适配器**：用 `adapterRegistry` 的 18 项实际映射重写表格，适配器归为 Anthropic 协议 / OpenAI Chat Completions / OpenAI Responses / Google 四类。
- **为什么**：这是 CLAUDE.md 失效最严重的部分。
- **怎么做**：以 AGENTS.md 第 3 节为骨架，CLAUDE.md 的细节保留并校正。

### 3.4 渲染进程架构与 Jotai（对应 AGENTS.md 第 4 节）
- **改什么**：
  - Atoms 表校正为实际文件（移除 `chat-atoms.ts`/`user-profile.ts`/`updater.ts`/`credits-atoms.ts`，补入实际存在的 atoms）。
  - 组件目录清单按实际 `renderer/components/` 更新。
  - `main.tsx` 初始化器由 4 个 → 约 15 个（`ThemeInitializer`、`AgentSettingsInitializer`、`AgentListenersInitializer`、`UpdaterInitializer`、`AutomationInitializer`、`NotificationsInitializer`、`UiPreferencesInitializer`、`UiScaleInitializer`、`FeishuInitializer`、`DingTalkInitializer` 等）。
  - settings-tab 18 个标签页对齐。
- **为什么**：当前描述大量指向已不存在的文件。
- **怎么做**：以代码实测清单为准，保留 CLAUDE.md 的「全局监听器 / 三栏联动 / 卡片设计」等设计模式叙述。

### 3.5 本地存储规范（对应 AGENTS.md 第 5 节）
- **改什么**：存储根 `~/.profer/` → `~/.cdutai/`（生产）/ `~/.cdutai-dev/`（开发）；目录清单一并更新（channels/conversations/agent-sessions/agent-workspaces/default-skills/automations/skins/…）。
- **为什么**：代码明确 `~/.cdutai/`，且不迁移旧目录。
- **怎么做**：以 `config-paths.ts` 实测为准重写，同时在"待修点"中标注 AGENTS.md 第 5 节同样过时。

### 3.6 构建、测试与发版约束（对应 AGENTS.md 第 6 节 + CLAUDE.md 细节）
- **改什么**：
  - 「打包配置注意事项」整章 → **替换为 Pi 内核版本**：esbuild `--external:@earendil-works/pi-coding-agent / pi-agent-core / pi-ai`；根 `overrides` 锁定 `0.86.1` + `patchedDependencies`；`asarUnpack` 中的 Pi native（`@earendil-works/pi-tui/native/**`）；`electron-builder.yml` 的 `files`/`extraResources`/NSIS/publish 现状；并标注 `!node_modules/@proma/**` 为待修过时前缀。
  - 「SDK 版本升级注意事项」整章 → **替换为 Pi 内核版本**：版本锁定策略、补丁维护、升级注意事项；删除 `buildSdkEnv()` 的 Claude 专属加固描述（如 Pi 侧仍有对应逻辑则据实改写）。
  - 保留并校正 CLAUDE.md 的「版本管理 / 默认 Skills 版本契约 / 全局元 Skill / 发版流程（`scripts/push-release.cjs`）/ macOS 验收限制」。
- **为什么**：两整章内容已完全失效，且用户已确认"替换为 Pi 内核对应内容"。
- **怎么做**：以 AGENTS.md 第 6 节 + 实测 esbuild/electron-builder 配置为准改写。

### 3.7 默认 Skills
- **改什么**：14 个（含不存在的 `guizang-ppt-skill`）→ 实际 16 个：automation、brainstorming、docx、executing-plans、find-skills、in-app-browser、lark-delivery、pdf、pptx、profer-coach、session-cleaner、skill-creator、tool-builder、user-sense、writing-plans、xlsx。
- **为什么**：清单与实际目录不符。
- **怎么做**：以 `default-skills/` 实测目录为准。

### 3.8 代码风格 / TypeScript 配置 / 创作参考 / 核心特性 / 当前裁剪状态
- **改什么**：保留 CLAUDE.md 的详实叙述，逐条校正事实；「创作参考」中移除或改写已失效的 Claude SDK 引用；「当前裁剪状态」按现状更新。
- **为什么**：保留 CLAUDE.md 相对 AGENTS.md 更充分的细节是用户明确要求。
- **怎么做**：仅在事实层面校正，不删有效信息。

### 3.9 新增「待修点」小节（写入 CLAUDE.md 末尾或独立说明）
- **改什么**：新增一节"与 AGENTS.md 的差异 / AGENTS.md 待同步点"，列出 2.3 表中的条目（`~/.profer/`、8 包 vs 6 包 + cli、`ensure:mingit` 未接线、`@proma/**` 过时前缀）。
- **为什么**：用户要求"以代码为准并标注待修点"，且不能擅自改 AGENTS.md。
- **怎么做**：以清单形式列出，注明"AGENTS.md 修正需用户批准后单独处理"。

---

## 四、假设与决策（Assumptions & Decisions）

| # | 决策 | 依据 |
|---|------|------|
| D1 | 采用「刷新 + 合并」而非"精简对齐" | 用户明确：保留 CLAUDE.md 更充分的细节 |
| D2 | 所有冲突事实以代码为准 | 用户明确："以代码为准并标注待修点" |
| D3 | Claude SDK 两整章替换为 Pi 内核内容（非删除） | 用户明确："替换为 Pi 内核对应内容（推荐）" |
| D4 | 不改动 AGENTS.md，仅在本计划与 CLAUDE.md 中标注其待修点 | AGENTS.md 红线：文档修改需用户允许 |
| D5 | 存储根统一为 `~/.cdutai/`（`/dev` 为开发） | `config-paths.ts` 实测 |
| D6 | 服务层/组件层清单按"重要度取舍"而非全量罗列 | 保持文档可读，避免堆积 ~200 文件 |
| D7 | 改写语言为简体中文，保留专业术语（如 Pi、MCP、IPC、Jotai） | 仓库约定"注释与日志优先中文" |

**假设**：
- A1：本次仅改 `CLAUDE.md` 一个文件；若执行中产生新的事实分歧，回到用户确认。
- A2：CLAUDE.md 中被 AGENTS.md 覆盖且更优的表述，直接采用 AGENTS.md 版本。
- A3：CLAUDE.md 独有的、仍然有效的细节（如发版脚本、元 Skill 机制、macOS 验收限制）全部保留并校正。

---

## 五、验证步骤（Verification）

执行改写完成后，按以下步骤自检：

1. **事实核对**：逐条比对 2.2 表，确认所有过时条目已被更正为代码实测值。
2. **命名一致性**：全文不得再出现 `Profer`（作为项目名）、`@proma/*`、`@anthropic-ai/claude-agent-sdk`（作为内核）、`~/.profer/`（作为存储根）。
3. **命令核对**：文档中出现的每条命令，均在根/应用 `package.json` 的 `scripts` 中存在，或已显式标注为"未接线"。
4. **结构核对**：Monorepo 树与实际 `packages/`、`apps/` 目录一致。
5. **红线一致性**：顶部红线块与 AGENTS.md 保持同义。
6. **待修点章节**：确认已列出 AGENTS.md 全部待修点且未擅自改动 AGENTS.md。
7. **交叉验证（可选只读）**：
   - `bun run typecheck`（确认文档未破坏任何构建——文档本身不影响，仅作为仓库健康自检）
   - 手动 `git diff CLAUDE.md` 复查改动范围是否仅限本计划所列章节。

---

## 六、风险与回滚

| 风险 | 说明 | 缓解 |
|------|------|------|
| 事实再次漂移 | 版本号/脚本可能随开发变化 | 改写取"当前快照"，并在文首注明"以代码为准" |
| 过度精简丢失细节 | 与用户意图相反 | 采用"合并 + 校正"策略，逐节保留 CLAUDE.md 有效细节 |
| 误改 AGENTS.md | 违反红线 | 本计划明确不改 AGENTS.md，仅在待修点标注 |
| 回滚 | 改写属文档变更 | 依赖 git 版本控制，`git checkout CLAUDE.md` 即可回滚 |

---

## 七、执行清单（供批准后逐步执行）

1. [ ] 备份/确认 git 工作树状态（只读检查）。
2. [ ] 按 3.0–3.9 逐节改写 `CLAUDE.md`。
3. [ ] 按第五节执行自检。
4. [ ] 输出最终 `git diff CLAUDE.md` 概览给用户。
5. [ ] （待用户批准后另行处理）修正 AGENTS.md 待修点。
