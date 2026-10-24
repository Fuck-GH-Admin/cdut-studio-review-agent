---
path: apps/electron/src/main/lib/feishu/run-coordinator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c2a50eed02c74d0099ddf4038b5a1b6a01b52aaa
sha256: ffee9096d3f9cc0e671b1528d31d0c2ddc48a270243a5c2eb17d77d2aeafa5b9
lines: 94
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/run-coordinator.ts

## 1. 结论与边界

飞书 Agent run **并发协调器**（`apps/electron/src/main/lib/feishu/run-coordinator.ts:1-16`）两层并发控制：① **per-scope 串行**（同 scope 同时一个 run，新消息 ScopedQueue block-accumulate，run 结束 unblock 合并 flush）；② **全局上限** `maxConcurrent`（acquire 排队先到先得）。设计参考 zara/feishu-claude-code-bridge（`:10-13` 注释）；**本期不做抢占**（block-and-merge 更友好）；`abort` 接口预留未来用户抢占（`:15-16`）。

边界：`abort` 仅注销注册表**不杀 SDK**（调用方自行 stopAgent，`:77-78`）；release 必须 try/finally（否则 waiters 永远等不到，`:58-60`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ActiveRunHandle` | interface | 18-22 | `{scope; sessionId; startedAt}` |
| `RunCoordinator` | class | 24-94 | `isActive/size/acquire/abort/abortAll` |

内部：`active` Map、`maxConcurrent`（数或函数，`:31-33`）、`waiters` FIFO。

## 3. 内部逻辑与关键流程

- `acquire`（`:59-74`）：容量满→await 入 waiters；注册 handle；release **幂等**（released flag）且**仅删自己**（`cur.sessionId===sessionId` 校验，`:68-71`）→唤醒下一等待者。
- `abort`（`:77-87`）：注销+唤醒；`abortAll`（`:89-94`）：清空+全部唤醒（「让它们 race 到 abort」，`:88`）。

## 4. 调用者与调用链

出向：无（零 import）。入向（检索=符号名+模块名，全冻结树）：`feishu-bridge.ts:84,175`（new RunCoordinator，注释提及 :913/:960/:1580）；`ActiveRunHandle` 零外部引用。产品链：feishu-bridge ← feishu-bridge-manager ← main/index.ts:235、main/ipc.ts:448。

## 5. 数据 I/O、读写与副作用

内存注册表；无 I/O。

## 6. 分支、失败、取消与恢复

无异常路径；release 幂等防重入；abortAll 唤醒全部（受控取消语义）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；「abort 不杀 SDK」契约（`:77-78`）是职责边界声明。

## 8. 修改影响面

并发语义影响飞书桥多群并发；无直接测试。

## 9. 测试证据

**无任何测试**（0 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两层并发控制 | 已证实 | `:59-74` |
| release 幂等+归属校验 | 已证实 | `:66-71` |
| abort 不杀 SDK 契约 | 已证实 | `:77-78` |
| `ActiveRunHandle` 零外部引用 | 已证实（检索式见 §4，全冻结树） | caller 图 |
| **零测试** | 已证实 | caller 图 |
| 真实并发行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 18-94 | covered |
| 并发状态机 | §3 | 59-94 | covered |
| 测试锚 | §9 | — | unknown（零测试） |
