---
path: apps/electron/src/renderer/components/agent/TurnFileChangesSummary.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e4aa86dd4cee523223654090539976dfe01fd67a
sha256: 2e8ca0cdb54fe3495dd08a24fec76c5a47609b5c8ead5b926fca836b676aca7a
lines: 57
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/TurnFileChangesSummary.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

`buildTurnFileNameMap`：本轮 Read 映射绝对路径；Write 后保留兼容行号的源路径；同名不同目录不映射；失败工具不映射。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/renderer/components/agent/TurnFileChangesSummary.test.ts:24,32,40,49`，describe `:23`）。夹具 `toolUse`/`failedToolResult`（`:5-21`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | Read 映射（`:24`） | `get('user-profile.md')` `toBe` 该绝对路径 |
| 2 | Write 路径（`:32`） | `get('settings.ts')` `toBe('/tmp/project/src/settings.ts')` |
| 3 | 同名歧义（`:40`） | 两目录 `config.json` → `has` false |
| 4 | 失败剔除（`:49`） | `is_error:true` → `has('missing.md')` false |

## 3. 真实断言

逐条见上表（`:29,37,45,54`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：NotebookEdit `notebook_path`、MUTATING 其余工具、组件渲染。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:24-56` |
| 映射/歧义/失败语义 | 已证实 | `:29-54` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 映射 | 1,2 | 24-38 | covered |
| 歧义/失败 | 3,4 | 40-56 | covered |
| NotebookEdit/渲染 | 无 | — | unknown |
