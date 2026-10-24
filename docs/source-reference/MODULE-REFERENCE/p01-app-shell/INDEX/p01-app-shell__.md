# p01-app-shell__ 索引（仓根 LICENSE / README.md）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇是 705 index-only 文件中 group `p01-app-shell__`（owner `p01-app-shell`，family 空=仓根）的 2 个文件索引，按 `INDEX-SCOPE-LOCK.json` 锁定顺序排列。每文件七项必填：职责 / 消费（真实加载或消费者）/ 来源与 hash / 打包位置 / 影响 / 验证 / 证实·推断·未知。hash 列取自冻结树 `git ls-tree` blob 与内容 sha256（机械列）；消费/影响为人工调查结论，`INDEX-FACTS.tsv` 仅作检索线索未抄入。

家族背景（仓根文档）：两文件均为仓库顶层的法律/说明文档，不属于任何运行时模块；workspace 各包以 `package.json` 的 `"license": "AGPL-3.0-only"` 字段与本 LICENSE 挂钩。

## LICENSE

- 职责：项目的开源许可证正文——GNU Affero General Public License Version 3（19 November 2007）完整官方文本（661 行 / 34523 字节），文件头自述 `GNU AFFERO GENERAL PUBLIC LICENSE / Version 3, 19 November 2007 / Copyright (C) 2007 Free Software Foundation, Inc.`，全仓代码分发的法律条款依据。
- 消费：①`README.md:20`（页首协议徽章 `<a href="LICENSE">`）与 `README.md:437`（「本项目基于 GNU Affero General Public License v3.0 (AGPL-3.0) 开源……详见 [LICENSE](LICENSE) 文件」）以相对链接引用；②workspace 包元数据声明 `packages/{agent-fabric,benchmark-multihop,shared,project-core,core,ui,session-core}/package.json:4` 与 `apps/cli/package.json:4` 的 `"license": "AGPL-3.0-only"` 以 SPDX 标识指向本条款（证实：grep `"license"` 全树）。全树 `AGPL|licenseText|LICENSE(` 在 `src/` 代码零命中（证实），无运行时程序读取本文件。
- 来源：AGPL-3.0 标准文本 v3/2007-11-19（FSF）；2026-05-25 随 6382c6a21（`chore(license): switch from Apache-2.0/MIT to AGPL-3.0 with commercial dual-license`）协议切换提交引入（此前仓库为 Apache-2.0/MIT，root commit 不含 LICENSE），`change=unchanged_since_093f`（相对 093f1143 基线未变）。sourceBlob `be3f7b28e564e7dd05eaf59d64adba1a4065ac0e`；sourceSha256 `0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0`。
- 打包：不进安装包产物。electron-builder `apps/electron/electron-builder.yml:44-68`（`files:` 仅 `dist/**/*`、`package.json`、`node_modules/**`）与 `:70-122`（`extraResources:` 清单）均未列入仓根 LICENSE；安装器 license 亦未在该配置声明（证实：实读构建配置）。
- 影响：改动/删除会使全仓 AGPL-3.0 授权声明失去正文依据（README:437 与各 package.json 的 `AGPL-3.0-only` 声明悬空），产生合规风险；不影响任何构建或运行行为（无代码消费者）。
- 验证：①比对文本头 3 行与 FSF AGPL-3.0 官方文本一致、总行数 661；②`sha256sum` 等于 sourceSha256（机械可复算）；③核 `README.md:437`、各 `package.json:4` 引用关系仍在。本轮 NOT_RUN：产品测试/typecheck/构建/GUI（无需运行即足以核对文本一致性）。
- 证实/推断/未知：文件内容与 hash、README/package.json 引用关系=**证实**（实读+grep）；"FSF 标准文本"=**证实**（文件头自述+体例核对）；安装器许可展示行为=**未知**（electron-builder 未配置 license 字段，未运行打包，无法证实安装器界面是否展示）。

## README.md

- 职责：仓库根产品说明书（450 行）：`# CDUT Studio 🦖` 成都理工大学定制 AI 智能体工作台总览——项目简介（:38）、四大产品专区（:46）、CDUT Science 科学实验室（:76）、校园/教务特区（:115）、材料审核专区（:147）、AI 速课堂与智联万站（:161）、MultiHop-RAG 基准评测（:176）、安全与本地信任链（:194）、全景架构与技术栈（:230）、快速上手（:293）、团队（:364）。
- 消费：人类读者与代码托管平台渲染（GitHub 首页）；文内相对链接是它对仓内资产的消费：`README.md:20` → `LICENSE`，`README.md:188` → `assets/MultiHop-RAG-Scores/multihop-rag-report.md`（实读确认）。全树检索 `README.md` 在 `apps/**/src` 的命中均为测试 fixture 自造字符串（`remote-workspace-file-search.test.ts:26,40`、`mention-query-utils.test.ts:27`、`review-v3-t01-example-packs.ts:112` 生成示例包内容），与本文件无关——**无程序消费者**（证实：grep 全树）。
- 来源：项目团队自撰的产品文档，随仓库演进更新（`change=r03_pr44`：随 R03 PR#44 更新）。sourceBlob `6d85b0dfdfad714f25339ace4e8ad11f52897bcb`；sourceSha256 `7f2477f6b813b36ca5fe8f4b82c82bdb632534e08894856518d3076de5671539`。
- 打包：不进安装包产物。electron-builder `apps/electron/electron-builder.yml:44-68`（`files:`）与 `:70-122`（`extraResources:`）均不含仓根 README.md；安装包内文档仅有 `tutorial/tutorial-v2.md`→`tutorial.md`（`electron-builder.yml:77-78`）（证实）。
- 影响：改动影响对外产品认知与上手路径（:293 快速上手、:299 安装与启动）；删除会使 :20/:437 对 LICENSE 与 :188 对 `multihop-rag-report.md` 的链接失效；不影响构建与运行（无代码消费者）。
- 验证：①逐节核对章节标题行存在（:7/:38/:46/:76/:115/:147/:161/:176/:194/:230/:293/:328/:364）；②核文内相对链接目标存在（`LICENSE`、`assets/MultiHop-RAG-Scores/multihop-rag-report.md`）；③`sha256sum` 等于 sourceSha256。本轮 NOT_RUN：产品测试/typecheck/构建/GUI（文档无运行时行为）。
- 证实/推断/未知：章节结构、链接关系、无程序消费者=**证实**（实读+grep）；"对外第一入口/上手文档"的定位=**推断**（由内容体例与链接布局推断，仓库未显式声明 README 的消费者）；文中产品能力（如 :89 Mol*、:133 教务接口）与实现一致性=**未知**（超出本索引线范围，未逐条对照源码）。
