# p01-app-shell__specs__gui 索引（specs/gui 文件路径 Chip 搜索规格）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__specs__gui`（owner `p01-app-shell`，family `specs/gui`）共 2 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：`specs/gui/<feature>/` 是 GUI 特性规格目录（设计+需求成对）。本组规格对象=「文件路径 Chip 搜索与候选选择」，对应已实现组件 `apps/electron/src/renderer/components/ai-elements/file-path-chip.tsx`（:34 `FilePathChipProps`、:64 `FilePathChip`）及其消费面（`message.tsx:45/:1078/:1093/:1096`、`TurnFileChangesSummary.tsx:21/:117`、`tool-result-renderers/write-result.tsx:12/:67/:76`）与批量预检后端（`packages/shared/src/types/runtime.ts:210` 注释「FilePathChip 批量预检用」、`file-preview-service.ts:197`）。全组不进安装包（`electron-builder.yml:44-68` `files:`、`:70-122` `extraResources:` 无 `specs/`）。

## specs--gui--file-path-chip-search--design.md

- 职责：《文件路径 Chip 搜索与候选选择 — 设计文档》（130 行）：架构概览（:5）、文件变更范围（:13，:20-:21 列出目标代码 `file-path-chip.tsx` 与 `file-path-chip.test.ts`）、搜索服务接口与策略（:25/:27/:56）、IPC 与 preload（:66）、Chip 交互/显示/交互状态（:74/:76/:80）、附加目录菜单（:98）、数据流与取消（:108）、接口兼容性与风险（:122）。
- 消费：人类/开发读者（特性设计规格）；全树检索 `specs/gui|file-path-chip-search` 除自身与需求文档外零引用（证实）；它消费（指路）`file-path-chip.tsx`/`file-path-chip.test.ts`（:20-:21）。
- 来源：GUI 特性设计产出；sourceBlob `886b31b03ae73857f3cf9d95f2fb846470a0804c`；sourceSha256 `c83dfe599b86c7be5f4a3c56691b79a362bd51b712746fc73f46ae44e730a2f8`。
- 打包：不进产物（yml:44-68/:70-122 无 specs/）。
- 影响：删除→该特性设计依据断档（:20-:21 代码指路失效）；对构建/运行无影响。
- 验证：核 :1/:5/:20-:21/:25/:66/:74/:108/:122 章节存在、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：结构/代码指路=**证实**（实读+grep）；设计与实现一致性=**未知**（未逐条对照 file-path-chip.tsx）。

## specs--gui--file-path-chip-search--requirements.md

- 职责：《文件路径 Chip 搜索与候选选择 — 需求文档》（98 行）：背景（:5）+ 需求 1.1–1.8（延迟搜索 :11、首次点击 chip :20、搜索按钮与同名候选 :29、深度搜索 :40、后台搜索与取消 :50、候选路径选择 :60、Chip 显示切换 :70、附加文件夹操作入口 :80）+ 非功能需求（:90）。
- 消费：人类/开发读者（验收口径）；零外部引用（全树检索证实）；相关实现史：`release-notes/releases.json:204` 记 PR#103「fix(file-path-chip): 完整路径仅精确搜索自身」（需求 1.3/1.4 的落地修复记录）。
- 来源：GUI 特性需求产出；sourceBlob `96b1b67b037158785cd567100dd1939e161b712b`；sourceSha256 `4e5d7781b7b6ce165babd5a703f68d0cd6fb20a13666eea126b30a4de59067c8`。
- 打包：不进产物。
- 影响：删除→需求口径与验收基线丢失；对构建/运行无影响。
- 验证：核 :1/:5/:9/:11-:80/:90 各节、与 `file-path-chip.test.ts:62`（候选搜索策略测试族）对照可读、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/PR 记录=**证实**；1.1–1.8 逐条实现满足度=**未知**（未跑测试、未逐条对照）。
