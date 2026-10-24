---
path: apps/electron/src/main/lib/adapters/pi-harness-lifecycle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 106fdcc814363c42b713eb796726b9230020978e
sha256: 082909132210464c0009fc7c53f3752b7ac1c91432eac1a3a3c8c253bf499bb5
lines: 42
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-harness-lifecycle.ts

## 1. 结论与边界

Host Harness 消费的**被动** Pi 运行时生命周期信号归一器（薄文件 42 行）：只归一生命周期事实；观察者拿不到 Session/prompt 方法，无法重入 Pi 或调度新一轮模型（文件头注释 `apps/electron/src/main/lib/adapters/pi-harness-lifecycle.ts:1-2,20-23`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个 type + 1 个函数 = 3 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiHarnessLifecycleEvent` | type（导出） | 3-9 | 六种事件：`turn_running`/`model_call_completed`/`retry_started`/`retry_finished`/`compaction_started`/`compaction_finished{recovered}` | 均带 `timestamp` |
| `PiHarnessLifecycleObserver` | type（导出） | 11 | `(event)=>void` | |
| `mapPiHarnessLifecycleEvent` | 函数（导出） | 24-42 | `(event,timestamp=Date.now())=>PiHarnessLifecycleEvent[]` | 归一映射 |
| `PiLifecycleSourceEvent` | 内部 | 13-18 | `{type,aborted?,result?,willRetry?}` | |

## 3. 内部逻辑与关键流程

`mapPiHarnessLifecycleEvent`（`:24-42`）switch 映射：`agent_end`→`model_call_completed`；`auto_retry_start`→`retry_started`；`auto_retry_end`→`retry_finished`；`compaction_start`→`compaction_started`；`compaction_end`→`compaction_finished{recovered: !aborted && result!==undefined && Boolean(willRetry)}`（`:38`）；其余 `[]`（含 `turn_running` 无源映射——该事件类型仅声明）。

## 4. 调用者与调用链

入向：Host Harness 生命周期观察装配（本批检索见 §10）；测试：`apps/electron/src/main/lib/adapters/pi-harness-lifecycle.test.ts`（24 行）。出向：无 import（纯类型/函数）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态；`timestamp` 可注入（默认 `Date.now()`）。

## 6. 分支、失败、取消与恢复

无抛错；未知源类型返回空数组。无取消/恢复概念。

## 7. 权限与权威状态

观察者刻意无 Session/prompt 访问（`:20-23` 注释）——被动信号不能升级为控制能力。

## 8. 修改影响面

改事件形状影响 Harness 生命周期 UI/预算守卫与测试。

## 9. 测试证据

直接测试：`pi-harness-lifecycle.test.ts`（24 行，详见其手册）。`NOT_RUN`：本轮未执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 观察者无重入能力 | 已证实 | `:20-23`（类型仅 event） |
| `recovered` 判定式 | 已证实 | `:38` |
| `turn_running` 无源映射 | 已证实（静态） | `:73-85` switch 无该 case |
| Harness 接线 | 未知 | 本批未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 事件类型 | §2 | 3-11 | covered |
| 映射 switch | §3 | 24-42 | covered |
| 接线 | §10 | — | unknown |
