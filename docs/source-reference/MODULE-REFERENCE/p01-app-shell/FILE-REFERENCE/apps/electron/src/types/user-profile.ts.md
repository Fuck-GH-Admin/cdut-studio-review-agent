---
path: apps/electron/src/types/user-profile.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c312647166d6e232b722ff4129786f5dd0b8bc1a
sha256: ffae5cdc18fbdf17c3da453eca9236dd2ea238ed565c39011ab83ea058cdd49e
lines: 25
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/user-profile.ts

## 1. 结论与边界

用户档案类型 + 默认值常量 + 用户档案 IPC 通道名（`apps/electron/src/types/user-profile.ts:1-5`）。纯声明，无逻辑。

边界：不含档案读写实现（`user-profile-service.ts`）；不含 IPC handler 注册。

## 2. 导出与关键符号

`export` 逐条核对：4 个（常量 2 + 接口 1 + 常量对象 1）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEFAULT_USER_AVATAR` | 常量（导出） | 8 | `'🧑‍💻'` | 默认头像 emoji |
| `DEFAULT_USER_NAME` | 常量（导出） | 11 | `'用户'` | 默认用户名 |
| `UserProfile` | 接口（导出） | 14-19 | `{userName: string; avatar: string}` | 头像=emoji 或 `data:image/*` base64 URL |
| `USER_PROFILE_IPC_CHANNELS` | 常量（导出） | 22-25 | `{GET:'user-profile:get', UPDATE:'user-profile:update'} as const` | 用户档案 IPC 通道 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：纯类型/常量声明。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/lib/user-profile-service.ts:10`（`DEFAULT_USER_AVATAR/DEFAULT_USER_NAME`，`user-profile-service.ts:23-24,32-33,38-39` 用作缺省值回填）、`apps/electron/src/renderer/atoms/user-profile.ts:8`（同两常量）；`USER_PROFILE_IPC_CHANNELS`：`apps/electron/src/main/ipc.ts:16`（import）、`ipc.ts:2121`（GET handler 注册）、`ipc.ts:2129`（UPDATE handler 注册）；`apps/electron/src/preload/index.ts:10`（import）、`preload/index.ts:2505`（`invoke(GET)`）、`preload/index.ts:2509`（`invoke(UPDATE, updates)`）。`UserProfile` 类型经 `../types` barrel 被 `ipc.ts:131`、渲染层 atoms 消费。

出向：无。

## 5. 数据 I/O、读写与副作用

无：纯声明。实际读写在 user-profile-service（settings.json 侧，文件外）。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件无权限分支，依据：无 sender/role 检查。通道名是主/渲染契约；鉴权在 handler 侧（未在本文件体现）。

## 8. 修改影响面

- 改 `UserProfile` 形状影响 user-profile-service、渲染 atoms 与 `ipc.ts:131` 装配。
- 改通道名需同步 `ipc.ts:2121,2129` 与 `preload/index.ts:2505,2509`（两端同源常量）。
- 改默认值常量影响首启/清空档案的可见用户名头像。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对本文件导出 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出 | 已证实 | `grep -c '^export'`=4，`:8,11,14,22` |
| IPC 通道两端消费（handler+invoke） | 已证实 | `ipc.ts:2121,2129`、`preload/index.ts:2505,2509` |
| 默认常量两处消费 | 已证实 | `user-profile-service.ts:23-39`、`atoms/user-profile.ts:8` |
| handler 侧鉴权 | 未知 | 文件外 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两常量 | §2,§4 | 8,11 | covered |
| `UserProfile` | §2 | 14-19 | covered |
| `USER_PROFILE_IPC_CHANNELS` | §2,§4 | 22-25 | covered |
| 测试 | §9 | — | unknown |
