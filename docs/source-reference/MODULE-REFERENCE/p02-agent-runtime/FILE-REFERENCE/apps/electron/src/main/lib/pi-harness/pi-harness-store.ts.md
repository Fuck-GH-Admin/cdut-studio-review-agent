---
path: apps/electron/src/main/lib/pi-harness/pi-harness-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 957ce36cceb49ccf5f3af97cbba3b8673cb297f7
sha256: e2bd7c67449946bc64219387523a4fbb7566ee8ec3f854a4b05df3dcb4da5ab1
lines: 108
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/pi-harness-store.ts

## 1. 结论与边界

**Harness sidecar 存储**（JSONL 事件账本）：解析（损坏/版本不符/重复→diagnostics 不抛）、加载归并、追加（会话/版本校验）、fork 复制（**只复制分叉边界前已 settled 的 Goal，ID 全重映射**——分支永不与源共享可变执行血缘，`pi-harness-store.ts:65-68`）。写盘 `appendFileSync`/`writeFileSync`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `parsePiHarnessEvents` | 函数 | `:26` | `(jsonl): {events, diagnostics}`——逐行：invalid_json/unsupported_version/invalid_event 三类诊断（`:33-45`） |
| `loadPiHarnessSnapshot` | 函数 | `:50` | 文件缺→空归并；否则 parse+`replayPiHarnessEvents` |
| `appendPiHarnessEvent` | 函数 | `:57` | sessionId 不匹配→抛“会话 ID 不匹配”（`:58`）；版本不符→抛（`:59`）；mkdir+追加 |
| `copySettledPiHarnessEventsForFork` | 函数 | `:69` | `(source,dest,forkTimestamp): number`——见 §3 |

内部：`isEvent` 结构校验（`:13-24`）。

## 3. 内部逻辑与关键流程

`copySettledPiHarnessEventsForFork`（`:69-108`）：取 `timestamp <= forkTimestamp` 的事件→归并出**已 settled 的 Goal 集**（`:77-79`，无 settled→0）→ 仅这些 Goal 的事件克隆：eventId/goalId/turnId/fact.id 全 `randomUUID` 重映射、sessionId 改 dest（`:82-101`；tool_fact 连 payload.fact 内 id/goalId/turnId 一并重映射 `:95-98`）→ 一次性写 dest 文件（`:102-107`）。

## 4. 调用者与调用链

- 入向：`orchestrator-bridge.ts:5`（append/load）、`session-manager.ts:33`（`copySettledPiHarnessEventsForFork`——nb-51 批已读调用点 `:2027`）、`evals/replay.ts`（经 reducer 间接）。
- 出向：`../config-paths`（getPiHarnessEventsPath）、`./pi-harness-reducer`、`./types`（域外）。

## 5. 数据 I/O、读写与副作用

读写 `pi-harness` 事件 JSONL（路径由 config-paths 决定）；append 逐行追加、fork 复制为整文件写。无锁（并发追加语义=文件系统追加）。

## 6. 分支、失败、取消与恢复

解析三类诊断不抛（`:33-45`）；append 双校验抛；fork 无 settled→0 且不写文件。

## 7. 权限与权威状态

账本权威=append-only JSONL + eventId 去重（reducer 侧）；fork 隔离权威=ID 全重映射（`:65-68` 注释）。

## 8. 修改影响面

Harness 状态持久化/fork 血缘隔离；session-manager fork 链（nb-51）消费。

## 9. 测试证据

`NOT_RUN`。直接测试 `pi-harness-store.test.ts`（97 行/**5 个 `test(`**）：追加+归并账本（usage/诊断空，`:40-56`）；坏行/版本 2/重复行→诊断码序列 `['invalid_json','unsupported_version','duplicate_event']` 且有效状态保留（`:58-67`）；跨会话追加拒（`:69-72`）；**fork 只带 settled 且 ID 重映射**（copied=4、目标 goalId 不再是 'settled-goal'、turnId ≠ 'old-turn'，`:74-91`）；空/坏账本解析不抛（`:93-96`）。mock 边界：临时 PROFER_CONFIG_DIR 真文件。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 解析/追加/加载/fork 重映射语义 | 已证实 | `:1-108` 全文 + 5 测试互证 |
| 并发追加互斥 | 未知 | 无锁设计，未测 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+内部 | §2/§3 | 13-107 | covered |
| 测试 5 用例 | §9 | test 文件 | covered（NOT_RUN） |
