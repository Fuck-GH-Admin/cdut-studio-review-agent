---
path: apps/electron/src/main/lib/global-shortcut-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3da4ae8760e7cfeb352f4e31968f2cb88d1b9f38
sha256: 31a8f44e751e57b776af38ba0efe0ed2f613b0d9241a58ee9db45b8fb39967f9
lines: 47
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/global-shortcut-service.test.ts

## 1. 测试目标

快速任务移除后的全局快捷键通用机制回归：`show-main-window` 始终注册（不受开关影响，头注 :1-6）。

## 2. 用例清单

1 用例 / 1 describe（`show-main-window 始终注册（不受开关影响）` :32）。夹具：preload 统一 electron mock 钩子 `__proferElectronTestHooks`（:9-16，记录 registeredAccelerators）；`mock.module('./settings-service')` 注入 `mockSettings`（:25-27）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 无任何开关设置时也注册 | 34-39 | `registerGlobalShortcut('show-main-window', …)` 返回 `true` |

## 3. 真实断言

如 §2 表（逐条读自 :34-39）。

## 4. 未覆盖与脆弱点

- 未覆盖：override 自定义/null 禁用/cmd→CommandOrControl 转换、`reregisterAllGlobalShortcuts`、注册失败分支。
- 脆弱点：依赖 preload mock 钩子类型声明（:9-16 与 test/preload-electron-mock.ts 一致性注释 :8）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例断言如 §2 | 已证实 | 本文件逐行 |
| 始终注册语义被固定 | 已证实 | 用例 1 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `registerGlobalShortcut` 基础 | §2 | covered |
| override/禁用/重注册 | §4 | unknown（未测） |
