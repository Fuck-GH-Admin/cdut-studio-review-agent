---
path: apps/electron/src/main/lib/pi-harness/session-telemetry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aac11aec0248754270e8184baa85e9196483b968
sha256: feaf43771d52c2626dd09f3ffbf59b903ef9465b7d34df8dd57480e124f62d66
lines: 22
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/session-telemetry.ts

## 1. 结论与边界

单文件适配器（22 行）：`collectSessionPiHarnessTelemetry`——按 sessionId 装载本地 ledger（快照+事件+项目图）并调 `collectPiHarnessTelemetry` 出诊断汇总。注释红线（`:7-11`）："**刻意不是 IPC handler，绝不外发遥测**"（开发者诊断/导出专用）。

不做的事：不接 IPC（防误用为遥测出口）；不聚合逻辑（telemetry.ts）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `collectSessionPiHarnessTelemetry` | `:12-22` | `(sessionId: string) => PiHarnessTelemetry`：`getPiHarnessEventsPath(sessionId)` → 存在则 `parsePiHarnessEvents(readFileSync).events` 否则 `[]`（`:14-16`）→ `collectPiHarnessTelemetry({snapshot: loadPiHarnessSnapshot, graph: loadGraph, events})` |

import：`node:fs`（existsSync/readFileSync）、`../project-graph-service`（loadGraph）、`../config-paths`（getPiHarnessEventsPath）、`./pi-harness-store`（loadPiHarnessSnapshot/parsePiHarnessEvents）、`./telemetry`。

## 3. 内部逻辑与关键流程

三源汇流：events（JSONL 文件，缺失→[]）+ snapshot（store）+ graph（项目图）→ 纯聚合。无分支之外的逻辑。

## 4. 调用者与调用链

诊断导出入口（开发者诊断 UI/CLI）；出向五模块如 §2。telemetry.ts 的唯一包装消费者。

## 5. 数据 I/O、读写与副作用

**只读本地文件**：`getPiHarnessEventsPath(sessionId)` 的 JSONL（`existsSync`+`readFileSync`，`:13-16`）；快照/图经 store/graph 服务读取。无写入、无网络、无外发（`:9-10`）。

## 6. 分支、失败、取消与恢复

单分支：events 文件缺失→空数组降级（`:14-16`）——诊断仍可出（缺边界诊断，`apps/electron/src/main/lib/pi-harness/telemetry.ts:126-127` 语义）。readFileSync 抛错不捕获（路径存在性已挡；截断文件的 parse 失败由 `parsePiHarnessEvents` 的 diagnostics 承接——推断）。

## 7. 权限与权威状态

`sessionId` 经 `getPiHarnessEventsPath` 解析路径（config-paths 侧 UUID/路径闸）；"非 IPC、不外发"（`:9-10`）是本文件的安全权威声明。

## 8. 修改影响面

改成 IPC handler 会违反注释红线（`:9-10`）；改事件装载口径影响诊断完整性（边界诊断依赖 events）。

## 9. 测试证据

**有直接测试** `apps/electron/src/main/lib/pi-harness/session-telemetry.test.ts`（57 行，1 describe/1 test，`:52` `expect(collectSessionPiHarnessTelemetry(...)).toMatchObject(...)`；该测试文件属后续批次不在本批 SCOPE，之前"0 命中"为检索失误）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出、三源汇流、缺失降级 | 已证实 | 文件全读 |
| 非 IPC/不外发红线 | 已证实 | `:7-11` |
| 截断 JSONL 的 parse 降级 | 推断 | store 实现不在本批 |
| 实际调用点是否仅诊断 | 未知 | 调用点不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 1 导出 | §2 | covered |
| 三源/分支/IO | §3/§5/§6 | covered |
| 红线/影响面 | §7/§8 | covered |
| 测试/未知 | §9/§10 | covered |
