---
path: apps/electron/src/main/lib/adapters/pi-streaming-control.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 22326172d4ae233daa53e5daed383f0753b89894
sha256: 171ebe847dce4dce814b9acf0aed9cfb154e46fb66989d83101ec1c750390822
lines: 48
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-streaming-control.ts

## 1. 结论与边界

**流式部分消息合并器**（`pi-streaming-control.ts:7-9` 注释）：只保留一个时间窗口内**最新**的流式快照（旧帧被新帧覆盖）；`flush` 保证最终消息前不遗漏最后一帧。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `PartialMessageCoalescer<T>` | interface（export） | `:1-5` | `{schedule; flush; dispose}` | 接口 |
| `createPartialMessageCoalescer<T>` | function（export） | `:10-48` | `(emit: (v:T)=>void, intervalMs: number) => PartialMessageCoalescer<T>` | 工厂 |

## 3. 内部逻辑与关键流程

状态：`pending`/`timer`/`lastEmittedAt`/`disposed`（`:14-17`）。

1. `schedule(value)`（`:29-35`）：disposed 即弃（`:30`）；`pending=value` 覆盖旧帧（**:31**）；已有 timer 不再排（`:32`）；否则 `setTimeout(emitPending, max(0, intervalMs-elapsed))`（**:34**——距上次发射的余量作为延迟，节流而非固定间隔）。
2. `emitPending`（`:19-26`）：清 timer 引用；disposed/pending 空即返；取 pending 发射并记 `lastEmittedAt`。
3. `flush()`（`:36-40`）：清 timer 后立即 `emitPending`（保证尾帧）。
4. `dispose()`（`:41-46`）：置 disposed、清 timer 与 pending。

## 4. 调用者与调用链

入向：Pi 流式消息链（adapters，跨文件）；出向：`setTimeout/clearTimeout/Date.now`。

## 5. 数据 I/O、读写与副作用

无文件 I/O；副作用=定时器与 `emit` 回调。

## 6. 分支、失败、取消与恢复

分支：disposed 吞弃（`:21/:30`）、timer 复用（`:32`）、flush 立即（`:36-40`）。取消=`dispose` 清理（`:41-46`）。不抛错。

## 7. 权限与权威状态

不适用，依据：纯工具。

## 8. 修改影响面

改合并语义 → Pi 流式 UI 的部分消息渲染频率与尾帧完整性。

## 9. 测试证据

**直接测试 `pi-streaming-control.test.ts:5-18`（1 用例，NOT_RUN）**：两帧 schedule 后 flush → `emitted` `toEqual(['latest'])`（只发最新）；dispose 后 flush 不再发射（`:14-17`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+状态机 | 已证实 | 逐行读 `:1-48` |
| 测试 1 用例断言 | 已证实 | 测试 `:5-18` |
| 节流手感 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 工厂+三方法 | §3 | `:10-48` | covered |
| 测试 | §9 | 测试行号 | covered（NOT_RUN） |
