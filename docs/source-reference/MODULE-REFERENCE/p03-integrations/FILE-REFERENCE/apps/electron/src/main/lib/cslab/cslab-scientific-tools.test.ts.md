---
path: apps/electron/src/main/lib/cslab/cslab-scientific-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c6e94557f8f048b36f9e0c7b8df5bef9fdf890b9
sha256: 88164d33059db0a74242464e3647815c0dd356d9d42b2628df61cd7270b35a4c
lines: 172
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-scientific-tools.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

CSLab 科学工具集集成测试（`:1-3`）：`cslab_create_structure` 入笼生成 mol 资产、`cslab_focus_structure` 聚焦指令、`cslab_snapshot_structure` 注册（schema 含 scale/filenamePrefix）、`buildSystemPrompt` 注入双引擎规范+禁止手搓 3D+真实 vault 拓扑。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/cslab/cslab-scientific-tools.test.ts:63,91,117,132`）。夹具：`SAMPLE_CIF`（SrTiO3 文本，`:15-31`）；真实 lab+会话绑定 `cslabLabId`（`:33-42`）；`fakeSdk.defineTool` 捕获注册（`:65-67` 等）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | create_structure 入笼（`:63`） | 工具存在；`execute({title:'钛酸锶钙钛矿',format:'cif',content:SAMPLE_CIF})`：`result.isError` falsy、`details.uri` `toContain('mol')`、`details.title` 含 `'钛酸锶'`、`details.format==='cif'` |
| 2 | focus_structure（`:91`） | `execute({uri:'lab://…/mol/fake-123',supercell:{2,2,2},highlightPolyhedra:true})`：`isError` falsy、`details.status==='focused'` |
| 3 | snapshot_structure 注册（`:117`） | 工具存在；`JSON.stringify(parameters)` 含 `'scale'`/`'filenamePrefix'` |
| 4 | 系统提示词注入（`:132`） | `getCsLabPromptLabInfo` 定义且 `labName==='Origin × VESTA 测试实验室'`；`buildSystemPrompt({cslabLabBound:true,…})` 含：`'<cslab_science>'`/`'Origin × VESTA'`/`'VESTA 3D Crystal & Molecular Engine'`/四个 `cslab_*` 工具名/`'It cannot export the 3D crystal viewport'`/`'Intent Fidelity & No Scavenging (CRITICAL)'`/`'Never substitute an unrelated plot'`/`'CRITICAL NEGATIVE CONSTRAINT'`/`'NEVER attempt to write Python scripts'`/vault 拓扑（`'Vault Root Directory:'`+figures/plots/lit/notes/raw/tables/manuscripts）/`'there is NO \`structures/\` directory'`+`not.toContain('Structures Directory')`（真实拓扑注释 `:159`）/`'Do NOT run \`ls -R\` or \`find\` on the vault'` |

## 3. 真实断言

逐条见上表（`:85-88,113-114,127-129,137-170`）。mock 边界：`fakeSdk`（defineTool 捕获）；入笼/聚焦/提示词为**真实实现**（真实 sqlite/文件/`agent-prompt-builder`）。

## 4. 未覆盖与脆弱点

未覆盖：`cslab_export_figure` 执行面、工具错误分支、未绑定会话时工具缺席。用例 4 断言大量提示词子串（文案脆弱点）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:63-171` |
| 入笼/聚焦/注册 | 已证实 | `:85-129` |
| 提示词双引擎+负向约束+真实拓扑 | 已证实 | `:147-170` |
| 执行面/错误分支 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| create_structure | 1 | 63-89 | covered |
| focus_structure | 2 | 91-115 | covered |
| snapshot_structure | 3 | 117-130 | covered |
| 系统提示词 | 4 | 132-171 | covered |
| 错误分支/其余工具 | 无 | — | unknown |
