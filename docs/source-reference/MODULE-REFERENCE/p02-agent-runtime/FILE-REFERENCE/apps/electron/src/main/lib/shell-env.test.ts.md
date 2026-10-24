---
path: apps/electron/src/main/lib/shell-env.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6dd8df5604399fc5eccb50f4b7b2f3b1f426c8b5
sha256: 091a8e0e60bfc4f13c8b13f73fdbdf52a37d45633b2bee89cf42f9a4a291d645
lines: 23
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/shell-env.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Shell 环境加载：非交互 login shell 调用契约（`-l -c` 且无 `-i`、命令含 marker 与 `env`）；macOS zsh 实际加载（无交互 zle 初始化）。

## 2. 用例清单

共 2 个测试（`:5`，`:9` 为 `test.skipIf(process.platform!=='darwin')`）。用例 2 断言 macOS `/bin/zsh` 行为，非 darwin 宿主跳过而非误报（测试内注释与 `packaging-guards.test.ts:206` 同款守卫，`:7-8`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 非交互 login 调用（`:5`） | `args[0]==='-l'`、`args[1]==='-c'`、`not.toContain('-i')`、`args[2]` 含 marker 与 `'env'` |
| 2 | macOS zsh 加载（`:9`，skipIf 非 darwin） | `getShellEnv('/bin/zsh')`：`env.PATH` `toBeString()`、`env.SHELL==='/bin/zsh'`（真实子进程） |

## 3. 真实断言

逐条见上表（`:8-14,16-17`）。mock 边界：无 mock；用例 2 为**真实 login shell 子进程**（平台条件）。

## 4. 未覆盖与脆弱点

未覆盖：`parseEnvOutput` 过滤/`mergeEnvToProcess`/`loadShellEnv` 分派/fallback。用例 2 依赖宿主 shell 配置（PATH/SHELL 语义）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个测试（1 skipIf） | 已证实 | `:5,9` |
| 调用契约 | 已证实 | `:8-14` |
| macOS 实测 | 未知 | 平台条件+NOT_RUN |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| invocation 契约 | 1 | 5-15 | covered |
| zsh 实测 | 2 | 9-18 | covered（条件） |
| 解析/合并/fallback | 无 | — | unknown |
