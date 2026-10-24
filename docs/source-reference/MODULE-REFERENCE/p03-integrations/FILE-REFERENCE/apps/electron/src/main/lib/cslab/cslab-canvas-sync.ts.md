---
path: apps/electron/src/main/lib/cslab/cslab-canvas-sync.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 53dc4ab135e95466efc6c14f222119391ea99b30
sha256: 3d2377c93cdca8c16785fa0870b5904ae853cb8d77961ff3151286907609ba8d
lines: 455
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-canvas-sync.ts

## 1. 结论与边界

CSLab **画布文件同步与 vault 监视**（`apps/electron/src/main/lib/cslab/cslab-canvas-sync.ts`，455 行）：画布（canvas）文档的列/读/写（写冲突→**冲突副本**）、vault 目录 watcher（启动/停止/重建通知）。`assertCanvasRelPath`（`:51`）与 `isReservedPath`（`:63`）守卫路径穿越/保留名。

## 2. 导出与关键符号

`export` 共 **10 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `listCanvases` | 函数 | `:152-179` | async，lab 画布清单 |
| `readCanvas` | 函数 | `:180-189` | async，读画布 |
| `createCanvas` | 函数 | `:190-224` | async，新建 |
| `writeCanvas` | 函数 | `:225-306` | async，写入（冲突→副本） |
| `VaultWatcherStatus` | interface | `:307-311` | watcher 状态 |
| `startVaultWatcher` | 函数 | `:312-401` | async，启动监视 |
| `stopVaultWatcher` | 函数 | `:419-432` | async，停止 |
| `closeAllVaultWatchers` | 函数 | `:433-443` | async，全关 |
| `isVaultWatcherActive` | 函数 | `:444-452` | 查询 |
| `getCanvasNotesDir` | 函数 | `:453-455` | 画布 notes 目录 |

内部：`WatcherLike`/`ActiveWatcher`（`:38-50`）、`assertCanvasRelPath`（`:51-58`）、`resolveCanvasPath`（`:59-62`）、`isReservedPath`（`:63-67`）、`pathExists`（`:68-76`）、`uniqueConflictPath`（`:77-87`）、`writeConflictCopy`（`:88-106`）、`evaluateDocument`（`:107-127`）、`walkCanvasFiles`（`:128-151`）、`rebuildAndNotify`（`:402-418`）。

## 3. 内部逻辑与关键流程

- **路径守卫**（`:51-67`）：`assertCanvasRelPath` 校验相对路径（防穿越）；`isReservedPath` 拒保留名。
- **写冲突**（`:77-106`）：`writeCanvas` 目标被占/忙→`uniqueConflictPath` 生成唯一副本名→`writeConflictCopy` 写冲突副本（与 `cslab-atomic.ts` 的 `CsLabFileBusyError` 业务层「写冲突副本」承诺一致）。
- **watcher**（`:312-418`）：`startVaultWatcher` 监视 vault 目录，变化→`rebuildAndNotify`（重建清单+`broadcastCsLabEvent`）；`stopVaultWatcher`/`closeAllVaultWatchers` 释放；`ActiveWatcher`（`:44-50`）持 watcher 句柄。

## 4. 调用者与调用链

- 消费方：画布 IPC/文件面板。
- 出向：`cslab-events`（`broadcastCsLabEvent`）、`cslab-atomic`（忙错语义）、fs/watcher。

## 5. 数据 I/O、读写与副作用

**文件读写**（画布 JSON）+ **目录监视**（fs watcher）+ IPC 广播；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 路径穿越/保留名 | `:51-67` | 抛/拒 |
| 写冲突 | `:77-106` | 冲突副本（不覆盖） |
| watcher 重建 | `:402-418` | 重建清单并通知 |

## 7. 权限与权威状态

路径守卫是文件边界；冲突副本语义=「不吞写入、不覆盖他人」（与 atomic 红线一致）。

## 8. 修改影响面

- 冲突副本命名（`uniqueConflictPath`）与 QA 判读相关。
- watcher 生命周期影响进程退出（配合 debounce `unref`）。

## 9. 测试证据

`cslab-canvas.test.ts`（535 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 个导出、路径守卫/冲突副本/watcher | 已证实 | `:51-455` |
| 冲突副本=不覆盖 | 已证实 | `:77-106` |
| watcher 实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 10 个导出 | `:152-455` | covered |
| 路径守卫/冲突 | `:51-106` | covered |
| watcher | `:312-443` | covered |
