---
path: apps/electron/src/types/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3b7a755646001b769f565439c0d3958a65f913c9
sha256: 9103305b96bb50dd162fc09bcdc3eb4c342bc618da8232da58c802a32e10bb0a
lines: 9
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/index.ts

## 1. 结论与边界

Electron 应用内部类型桶（barrel）：`export *` 转出 `./settings`、`./user-profile`、`./identity` 三个模块的全部导出（`apps/electron/src/types/index.ts:1-9`）。纯 re-export，无逻辑。

边界：不转出 `node-sqlite.d.ts`/`officeparser.d.ts`/`ws.d.ts`（这三个是环境声明文件，经 `declare module` 全局生效，不走 barrel）。

## 2. 导出与关键符号

`export` 逐条核对：3 条 `export *`（re-export 语句；无本地定义的函数/类/接口/常量）。实际转出符号总数 = 三模块之和（settings 54 + user-profile 4 + identity 3 = 61 个命名导出）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `export * from './settings'` | re-export（导出） | 7 | 转出 54 个命名导出 | 设置类型/IPC 通道 |
| `export * from './user-profile'` | re-export（导出） | 8 | 转出 4 个 | 用户档案 |
| `export * from './identity'` | re-export（导出） | 9 | 转出 3 个 | 身份 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：3 行 re-export 语句，无控制流。

## 4. 调用者与调用链

入向（冻结树 grep，`from '../types'|'../../types'|...`）：主进程 `apps/electron/src/main/ipc.ts:16,17,23,131`、`apps/electron/src/main/index.ts:246`、`titlebar-overlay.ts`、`identity-service.ts`、`agent-skin-tools.ts`、`skin-manager-service.ts`、`browser-risk-disclaimer.ts`、`settings-service.ts`、`planning-window.ts`、`skin-service.ts`、`agent-system-prompt-policy.ts`、`user-profile-service.ts:10`、`microphone-permission-service.ts`、`feishu/sleep-blocker.ts`、`main-window-lifecycle.ts`、`feishu-sleep-blocker.ts`；渲染层 `apps/electron/src/preload/index.ts:10`、`useGlobalAgentListeners.ts`、`atoms/notifications.ts`、`atoms/identity-atoms.ts` 等（类型桶被主/渲染两侧广泛消费）。

出向：`./settings`、`./user-profile`、`./identity`。

## 5. 数据 I/O、读写与副作用

无：纯 re-export。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件不适用，依据：无权限逻辑（类型再出口）。

## 8. 修改影响面

- 增删转出模块会改变上述全部消费者的可用符号面（编译期）。
- 与 `@profer/shared`（包级共享类型）不同，此 barrel 是 **Electron 应用内部**类型（文件头注释 `:3-4`）。

## 9. 测试证据

**无直接测试**（barrel 无行为）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck。测试断言仅指静态读到的 expect 行——本文件没有。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 条 `export *` | 已证实 | `:7-9` |
| 不转出三个 .d.ts 环境声明 | 已证实 | `:7-9` 仅三行；.d.ts 经 declare module 全局生效 |
| 消费者覆盖主/渲染/preload 三侧 | 已证实（检索） | §4 列举的 file:line |
| 61 个命名导出总数 | 推断（按三模块 `^export` 计数之和） | 54+4+3 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 条 re-export | §2 | 7-9 | covered |
| 消费者面 | §4 | — | covered |
| 测试 | §9 | — | unknown |
