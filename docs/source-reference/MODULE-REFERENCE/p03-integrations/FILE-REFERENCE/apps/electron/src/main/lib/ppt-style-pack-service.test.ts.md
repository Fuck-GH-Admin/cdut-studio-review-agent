---
path: apps/electron/src/main/lib/ppt-style-pack-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5d93e175935eb589cef6f472a36c78f26d0b5b0c
sha256: 5187aa9005722aaf685e3e280f8afd04b98bb9a89550d9296efb68fd6131f3e2
lines: 105
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-style-pack-service.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

样式包服务：仅列两个首发包+opaque 预览不含本地路径；Academic Editorial/Cloud Dancer 风格契约；未知 id 拒绝；preview.asset 禁越界引用任意本地文件。

## 2. 用例清单

共 5 个 `test(`（`apps/electron/src/main/lib/ppt-style-pack-service.test.ts:15,41,65,81,88`，describe `:14`）。夹具：`mock.module('electron')`（`app.isPackaged:false`，`:6-9`）；真实资源根 `resources/ppt-style-packs`（`:12`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 白名单+opaque（`:15`） | ids `toEqual(['academic-editorial','profer-cloud-dancer'])`；注册 2 路径；每包 preview `toMatch(/^!\[[^\]]+\]\(cdut-file:\/\/preview-\d+\)$/)` 且 `not.toContain(resourceRoot)`；definition 具 8 属性（tokens/layoutGrammar/motifs/chartLanguage/imageDirection/narrativeRhythm/qaProfile/editorialPolicy） |
| 2 | Academic 契约（`:41`） | colors `{canvas:'#F7F5F0',ink:'#17191C',accent:'#A20D18'}`；grid 12 列；`assertion_evidence.medium` 含 `'editorial-split'`；motif `evidence-marker`；editorialPolicy 五值（scientific-editorial/evidence-statement/三个 require true）；forbidden 含 `rhetorical-headline`/`presentational-slogan` |
| 3 | Cloud Dancer 契约（`:65`） | 色板含 5 色（`#F0EFEC` 等）；motifs 含 `cloud-cluster/arch/crescent/dancer-motion`；`maxContentMotifs` ≤4；forbidden 含 `full-slide-dancer-on-content` |
| 4 | 未知 id 拒（`:81`） | `getPptStylePack('user-local-pack')` `toThrow('未知 Style Pack')` |
| 5 | preview 越界拒（`:88`） | 临时根改 `preview.asset='../../private.png'` → `listPptStylePacks` `toThrow('preview.asset')`（注册回调 `must-not-register` 语义） |

## 3. 真实断言

逐条见上表（`:25-38,47-62,71-78,85,100`）。mock 边界：仅 `electron` 模块（`:6-9`）+`registerPreviewPath` 注入；校验/加载为**真实实现**（真实资源包文件）。

## 4. 未覆盖与脆弱点

未覆盖：pack.json 缺/坏分支、`getPptStylePackPreviewAssetPath`、注册失败抛错。用例 2/3 断言大量设计 token 值（内容绑定型断言）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:15-104` |
| 白名单/opaque/不泄路径 | 已证实 | `:25-29` |
| 两包风格契约 | 已证实 | `:47-78` |
| 越界/未知拒 | 已证实 | `:85,100` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 白名单/opaque | 1 | 15-39 | covered |
| 两包契约 | 2,3 | 41-79 | covered |
| 未知/越界拒 | 4,5 | 81-104 | covered |
| 坏 pack.json | 无 | — | unknown |
