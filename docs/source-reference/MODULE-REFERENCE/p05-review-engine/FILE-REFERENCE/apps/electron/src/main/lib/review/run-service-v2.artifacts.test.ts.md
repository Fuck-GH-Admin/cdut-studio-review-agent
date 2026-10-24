---
path: apps/electron/src/main/lib/review/run-service-v2.artifacts.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f66ffac05fb4135690da62c561b5d7e8b0572299
sha256: 085b2e86b4c6ee48704d02c231063b5bb66519ad4435e05fe3613a1600c7acce
lines: 85
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/run-service-v2.artifacts.test.ts

## 1. 测试目标

N2b 逐节点产物/即时事件/快照完整性/恢复核验（文件头 :2，R03/R04）：每节点产物落盘、事件即时回调（修正误判 1）、失败保留前序产物、产物删除重做、caseFields 进 hash（修正误判 3）、coverage 由产物账本装配（G12）。

## 2. 用例清单

5 用例 / 3 describe。夹具：`PROFER_CONFIG_DIR` 隔离（:14-16）；`document-checklist-v2` 真实模板 + **合成 auto-check 阶段**（注释 :21-22 默认模板只有人工任务阶段）；`doneAll()` 全 kind 执行器（:26-28）；无模型/mock 框架。

| # | describe | 用例 | 行 |
| --- | --- | --- | --- |
| 1 | N2b 节点产物与事件 | 产物落盘+事件即时 | 31-40 |
| 2 | 同上 | 中途失败保留前序产物 | 42-47 |
| 3 | 同上 | 产物删除→读回空（恢复核验） | 49-58 |
| 4 | 输入快照完整性 | caseFields 变化改 hash | 62-67 |
| 5 | coverage 装配（G12） | 无政策规则 plannedChecks=0 | 71-84 |

## 3. 真实断言

- 1：`run.status==='completed'`；`readArtifact(...'node-auto-check-parse')` 存在且 `summary==='parse'`；`eventOrder[0]` 含 `'node-started'`（首事件即时非整图后，:34-39）。
- 2：check 节点抛 `模型超时` → `run.status==='failed'`；`node-auto-check-parse` 产物仍存在（:45-46）。
- 3：产物文件存在（`existsSync` true）→ `rmSync` 删除 → `readArtifact` `toBeUndefined()`（:54-57）。
- 4：改 `caseFields` → hash `not.toBe`；hash 长度 64（SHA-256）（:65-66）。
- 5：经 `createAggregate` 真实聚合 + `buildComprehensiveFixture().template` 运行 → `coverage.plannedChecks===0`（分母如实）、`coverage.documents` 长度 0（:82-83）。

## 4. 未覆盖与脆弱点

- 未覆盖：续跑重做（在 run-service-v2.test.ts）、取消、`onEvent` 事件全集、产物指纹（dependencyHash）。
- 脆弱点：节点 id 命名 `node-auto-check-*` 耦合运行图生成；用例 3 只验读回空，未验证续跑重做（注释 :56 自述「此处仅验证读回为空」）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 本文件逐行 |
| 合成 auto-check 运行图（非默认模板） | 已证实 | :21-24 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 产物落盘/事件即时 | §3 | 34-39 | covered |
| 失败保留前序 | §3 | 45-46 | covered |
| 产物删除读回空 | §3 | 54-57 | covered（未验重做） |
| caseFields 进 hash | §3 | 65-66 | covered |
| coverage 如实 0 分母 | §3 | 82-83 | covered |
