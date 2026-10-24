---
path: apps/electron/src/types/node-sqlite.d.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d035432cc549f6ad56d8042cdc357d3e2a0ca376
sha256: f9cbd48cbd5943796b3c822580b42ca969c560cf000e5c9caaaef9c90e84b9e4
lines: 28
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/node-sqlite.d.ts

## 1. 结论与边界

`node:sqlite` 内置模块的**最小环境类型声明**（ambient `declare module`）：项目 `@types/node` 为 ^20 不含该模块，运行时实际在 Electron 43（Node 24.18）下使用，此处只补 typecheck 所需子集（`apps/electron/src/types/node-sqlite.d.ts:1-7`）。

边界：只声明 `run/all/get/exec/prepare/close/constants` 子集（文件头注释 `:6`）；不实现任何逻辑；非运行时代码。

## 2. 导出与关键符号

声明模块内导出逐条核对：3 个（接口 1 + 类 1 + 常量 1）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `StatementSync<Result>` | 接口（模块内导出） | 9-18 | `run(...)`→`{lastInsertRowid,changes}`；`all(...)`→`Result[]`；`get(...)`→`Result\|undefined` | 语句句柄 |
| `DatabaseSync` | 类（模块内导出） | 20-25 | `constructor(filename)`；`exec(sql)`；`prepare<Result>(sql)`→`StatementSync`；`close()` | 同步数据库句柄 |
| `constants` | 常量（模块内导出） | 27 | `Record<string, number\|bigint>` | 模块常量集 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：`.d.ts` 纯声明，无语句级代码。

## 4. 调用者与调用链

入向（冻结树 grep `node:sqlite`）：`apps/electron/src/main/lib/memory-archive-search.ts:25`（`import { DatabaseSync } from 'node:sqlite'`，终身记忆 FTS5 检索，文件头注释 `:8` 说明选型零原生依赖）；动态 `require('node:sqlite')` 且本地 cast：`planning-manager.ts:77`、`cslab/cslab-zotero.ts:330`、`cslab/cslab-db.ts:279`、`cslab/cslab-share-db.ts:138`、`cslab/cslab-hpc-db.ts:134`、`cslab/cslab-vault-cache.ts:80`（均 `as SqliteModule` 局部类型）；测试侧 `cslab/cslab-zotero.test.ts:25,164,185`（require+cast）。`apps/electron/src/main/lib/adapters/pi-builtin-tools.test.ts:4` 注释说明测试刻意不加载该原生模块。

出向：无。

## 5. 数据 I/O、读写与副作用

本文件不适用（类型声明无副作用）；声明所描述的 `DatabaseSync` 在消费者侧有真实磁盘 SQLite 读写（如 memory-archive-search 的 FTS5 库）。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件不适用，依据：无权限逻辑。

## 8. 修改影响面

- 改声明形状影响 7 个消费点的 typecheck（import 1 处 + require cast 6 处 + 测试 3 处）。
- 声明与 Node 24 运行时实现不符时只表现为类型误报/漏报，不改运行行为（`run` 返回 `number|bigint` 已如实放宽，`:12-14`）。

## 9. 测试证据

**无直接测试**（声明文件）；`cslab-zotero.test.ts`/`cslab-db.test.ts` 测的是消费者而非本声明（**间接**）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck。测试断言仅指静态读到的 expect 行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 模块内 3 个声明导出 | 已证实 | `:9,20,27` |
| 直接 import 消费者 = memory-archive-search | 已证实 | `memory-archive-search.ts:25` |
| 6 处动态 require 消费 | 已证实（检索） | §4 列举 |
| `as SqliteModule` 的局部类型定义内容 | 未知 | 各消费者文件内，未逐行读 |
| 运行时与声明一致性 | 未知 | NOT_RUN（Node 24 运行时未验证） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `StatementSync` | §2 | 9-18 | covered |
| `DatabaseSync` | §2 | 20-25 | covered |
| `constants` | §2 | 27 | covered |
| 消费者面 | §4 | — | covered |
| 测试 | §9 | — | unknown |
