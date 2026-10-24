---
path: packages/shared/src/utils/tab-mru.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 187f6270f08e2909fc5e1c8581123a7cf691e4be
sha256: 57b11ed0eb3bbbb5d707053a767c0cd3832570b89839a62d610908615f6d6046
lines: 32
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/tab-mru.ts

## 1. 结论与边界

标签页**最近使用（MRU）通用操作**（`packages/shared/src/utils/tab-mru.ts:1`）：renderer 与主进程复用。32 行三函数：提升队首/移除/回退选择。纯函数不可变（均返回新数组）。

边界：不持久化（调用方持有状态）；默认容量 50（`:3`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `promoteMru` | function | 7-12 | `(mru, tabId, limit=50) => string[]` | 提升队首+去重+截断 |
| `removeMruId` | function | 15-19 | `(mru, tabId) => string[]` | 移除已关闭标签 |
| `selectMruFallbackId` | function | 22-31 | `(mru, activeTabId, availableIds) => string\|null` | 跳过当前/失效记录 |

内部：`DEFAULT_MRU_LIMIT=50`（`:3`）。

## 3. 内部逻辑与关键流程

- `promoteMru`（`:7-12`）：空 tabId 原样拷贝返回；否则 `[tabId, …filter(≠tabId)]` 后 `slice(0, max(1,limit))`。
- `removeMruId`（`:15-19`）：空 tabId 拷贝；否则过滤。
- `selectMruFallbackId`（`:22-31`）：Set 化 availableIds，按 MRU 序找首个 `≠activeTabId 且 available` 的 id；无 → null。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：

- `promoteMru`：`apps/electron/src/main/lib/browser-controller.ts:10,959,1202,1263`、`renderer/lib/tab-switching.ts:1,23`、`renderer/atoms/tab-atoms.ts:21,238`。
- `removeMruId`：`browser-controller.ts:11,951,1253,1353`、`tab-atoms.ts:21,487-488`。
- `selectMruFallbackId`：`browser-controller.ts:12,1254`、`tab-atoms.ts:21,495`。
- 产品入口 main（browser-controller）+ renderer（tab-switching/tab-atoms）；测试 `tab-mru.test.ts`（本批，2 test）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数（不改入参）。

## 6. 分支、失败、取消与恢复

无异常路径（空 id 短路）；无异步。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

MRU 序/回退语义影响标签切换体验（caller 见 §10）；`limit<1` 被 `max(1,·)` 钳制。

## 9. 测试证据

直接测试 `packages/shared/src/utils/tab-mru.test.ts`（本批，11 行；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三函数不可变语义 | 已证实 | `:7-31` |
| 空 id 短路+limit 钳 1 | 已证实 | `:8,11` |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 函数 | §2-§3 | 7-31 | covered |
