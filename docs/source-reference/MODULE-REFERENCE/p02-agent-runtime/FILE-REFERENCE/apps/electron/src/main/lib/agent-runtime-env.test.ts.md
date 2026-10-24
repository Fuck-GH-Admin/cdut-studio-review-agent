---
path: apps/electron/src/main/lib/agent-runtime-env.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1cc448c3fcd8070b10af36a8d67576b93458212d
sha256: 62444d5449f6c827a947f6fb305c8f32e7a0df5b12a663b8da106a0433e70ff2
lines: 92
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-runtime-env.test.ts

## 1. 测试目标

`buildAgentRuntimeEnv`/`mergeRuntimeEnv`/`resolvePosixShellPath`：PATH 前置、shell 分离（SHELL 不被改写）、Bash 存在性校验。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:6/:21/:50/:63/:75/:84），1 describe（:5）。
1. Windows 只前置 CLI 目录（:6-19）：`result.env.Path` toEqual 三段 `;` 拼接。
2. Bun 目录前置+Bash 显式+SHELL 保留（:21-48）：PATH 四段（Bun 目录最先，:37-42）、shellKind 'posix'、shellPath '/bin/bash'、`env.SHELL` undefined（:46，注释 :45）、mergeRuntimeEnv 后 SHELL 仍 '/bin/zsh'（:47）。
3. zsh 用户环境用 Bash 执行不改写 SHELL（:50-61）。
4. 失效 SHELL 路径仍解析系统 Bash（:63-73）。
5. PATH 上 Bash 用已验证条目（:75-82）：'/custom/bin/bash'。
6. 无已验证 Bash 不静默降级 sh（:84-91）：toBeUndefined。

## 3. 真实断言

`:14-18`/`:37-47`/`:58-60`/`:71-72`/`:81`/`:90`（toBe/toBeUndefined/toEqual）。

## 4. 未覆盖与脆弱点

未覆盖：Windows git-bash/wsl shell 矩阵（collectWindowsShellEnv）、代理 env。mock 边界：pathExists 注入假探测。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| PATH/shell 分离/解析 | #1-#6 | covered |
| Windows shell 矩阵/代理 | — | unknown |
