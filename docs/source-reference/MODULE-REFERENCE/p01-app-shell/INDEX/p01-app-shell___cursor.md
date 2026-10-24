# p01-app-shell___cursor 索引（仓根 .cursor/rules/ 编辑器规则）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell___cursor`（owner `p01-app-shell`，family `.cursor`）共 2 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：`.cursor/rules/*.mdc` 是 Cursor 编辑器的项目级规则文件（`.mdc` 带 YAML frontmatter：`description`/`globs`/`alwaysApply`）。加载方=Cursor 编辑器（外部工具，非本仓代码）：编辑匹配 `globs` 的文件或（`alwaysApply: true` 时）任何文件的 AI 会话中被注入为行为约束；生效时机与注入机制属 Cursor 工具约定（推断），frontmatter 自述的触发条件本身可实读（证实）。本组 2 文件均不进安装包（`electron-builder.yml:44-68` `files:`、`:70-122` `extraResources:` 均无 `.cursor/`）。

## .cursor--rules--science-ui.mdc

- 职责：CDUT Science 专区前端 UI 规则（22 行）：frontmatter `description: CDUT Science 专区前端 UI 规范与成理学术界面准则`、`globs: apps/electron/src/renderer/components/cdut-science/**/*.{tsx,jsx,css}`、`alwaysApply: true`；正文「CDUT Science (CSLab) 前端规范守卫」：§1 严格遵从 AGENTS.md、UI 推荐 ShadcnUI/优雅卡片柔和阴影、允许 `rounded-xl`(12px)/`rounded-2xl`(16px)、色彩取成理湖蓝/青绿/石青等。
- 消费（谁加载→何时生效→行为约束）：Cursor 编辑器加载 → 编辑 `globs` 匹配文件（cdut-science 前端组件/样式）或 `alwaysApply: true` 时任意文件的 AI 编辑会话中生效 → 约束 UI 组件选型（ShadcnUI）、卡片圆角/阴影风格与配色（成理色系）。frontmatter 触发条件=实读证实；Cursor 的注入机制=按 `.mdc` 规则目录约定推断。本仓产品代码无读取者（全树检索 `.cursor` 零命中，证实）。
- 来源：项目自撰的编辑器规则（CDUT Science 前端规范）；`change=unchanged_since_093f`。sourceBlob `b3ee4ba1d6ed4fa787c4eb7fe5257212159cc9c5`；sourceSha256 `0c462b28c2c4ee3204d03ca96d021dcf41584723fce97c65516c8ecc682a274e`。
- 打包：不进安装包（electron-builder.yml:44-68/:70-122 清单无 `.cursor/`）。
- 影响：删除→Cursor 编辑 cdut-science 前端时失去 UI 规范守卫（组件/圆角/配色约束），产品运行不受影响（无代码消费者）。
- 验证：①实读 frontmatter 三键与正文 §1；②核 glob 目录 `apps/electron/src/renderer/components/cdut-science/` 在树中存在；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实 Cursor 会话注入验证。
- 证实/推断/未知：文件内容、glob、无代码消费者=**证实**；「Cursor 注入时机/机制」=**推断**（.mdc 工具约定，本轮未开 Cursor 验证）；规则是否仍与现行 cdut-science 组件风格一致=**未知**。

## .cursor--rules--use-bun-instead-of-node-vite-npm-pnpm.mdc

- 职责：名义上是「用 bun 取代 node/vite/npm/pnpm」的工具链规则文件，但实际内容只有 1 行 15 字节文本 `../../CLAUDE.md`（无 YAML frontmatter、无规则正文，regular file 100644 非 symlink，git ls-tree 证实）；即一个指向 `../../CLAUDE.md` 的**纯文本指路占位**。
- 消费（谁加载→何时生效→行为约束）：若 Cursor 加载本文件，注入内容只是字符串 `../../CLAUDE.md`，不产生实质规则约束；其意图指向的 `CLAUDE.md` 在冻结树中**不存在**（`test -e CLAUDE.md` 缺失，全树检索证实），目标悬空。本仓代码无读取者（全树检索证实）。
- 来源：项目自撰占位（意图复用 `../../CLAUDE.md` 作为 bun 工具链规则来源；真实来源=未知，未见生成脚本）；`change=unchanged_since_093f`。sourceBlob `6100270f85a724bd0f09bc6f0d990913ed34fb17`；sourceSha256 `70231b956e7f9335ec83966d4bcd7196f98195c1e005069a275c3ea6d41244db`。
- 打包：不进安装包（electron-builder.yml:44-68/:70-122 无 `.cursor/`）。
- 影响：删除→无实际行为损失（规则本体已因目标缺失而空转）；改动→若补齐 CLAUDE.md 或改为内联规则，会开始对编辑器 AI 会话施加 bun 工具链约束。
- 验证：①`xxd` 核内容恰为 `../../CLAUDE.md`（15 字节）；②核 `CLAUDE.md` 缺失=悬空指针成立；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实 Cursor 会话。
- 证实/推断/未知：内容、文件类型、目标缺失、无消费者=**证实**；「本应是 symlink/被误写为普通文件」的成因=**推断**（由内容形态推断）；作者意图=**未知**（无提交说明可考）。
