---
path: apps/electron/src/main/lib/review/run-service-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e55b47772cb82417604b9f58c449d7a65bf7cc4
sha256: 8509a7d284a287049119c085038732c1055e8f2c6c0cdbd6fe05e72226caa93e
lines: 181
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/run-service-v2.test.ts

## 1. 测试目标

V2 运行编排（文件头 :2，M3）：输入指纹不变量（读取状态/顺序不使运行过期）、分项标准全覆盖、取消 K18 不留半成品、续跑 done+同 hash 跳过、产物指纹损坏重做。被测 `runReviewCaseV2`/`computeRunInputHash`/`cancelRunV2` + `run-store-v2` 读写。

## 2. 用例清单

11 用例 / 1 describe（`runReviewCaseV2（M3 编排）` :35）。夹具：`PROFER_CONFIG_DIR` 隔离（:15-17）；`ensureBuiltinTemplateDrafts` 真实内置模板（:19-22）；假执行器全 kind（:30-33）；`autoCheckTemplate` 合成 auto-check 阶段（:36）。无 mock 框架。

| # | 用例 | 行 | 要点 |
| --- | --- | --- | --- |
| 1 | 材料读取状态是运行输出不致过期 | 37-43 | usage/parseRevision |
| 2 | 材料顺序变化不致过期 | 44-50 | |
| 3 | 分项标准全纳入并分别覆盖 | 51-68 | sectioned 模板 |
| 4 | workspace-only 规则进清单与分母 | 73-93 | |
| 5 | completed 且检查点落盘可读回 | 95-106 | |
| 6 | 同 hash 续跑 done 节点跳过（A11） | 108-115 | |
| 7 | 输入变化续跑拒绝（K06 防混版） | 117-120 | |
| 8 | 执行前取消 K18 | 122-129 | |
| 9 | 后续节点运行中前序检查点已落盘 | 131-148 | |
| 10 | OCR 产物丢失续跑重做下游保留可复用 | 150-169 | |
| 11 | 产物指纹损坏→同运行续跑重做 | 171-179 | `calls===1` |

## 3. 真实断言

- 1：`usage:'read'+unusedReason` 后 hash `toBe(before)`；`parseRevision:2` 后 `not.toBe(before)`（:41-42）。
- 2：正/逆序 documents hash 相等（:49）。
- 3：`run.inputManifest.effectiveRuleIds` `toEqual(['section-study-credit-check','section-service-hour-check'])`、`coverage.plannedChecks===2`（:66-67）。
- 4：`effectiveRuleIds` 三条 workspace 规则、`effectiveRuleSetHash` 匹配 `/^[a-f0-9]{64}$/`、`plannedChecks===3`、`pendingChecks===3`（:89-92）。
- 5：`status==='completed'`、`checkpoints.length>0`、`completedAt` `toBeString()`、events 含 `'node-completed'`；`getRunV2` 读回 completed、`listRunsV2` 长度 1（:94-98）。
- 6：续跑后 `parseCalls===0`（全部节点跳过）、status completed（:113-114）。
- 7：改 subjects 后续跑旧运行 `rejects.toThrow('不能在旧运行上续跑')`（:119）。
- 8：`cancelRunV2('r-cancel')` 预登记 → `status==='cancelled'`、盘上 cancelled、`completedAt` `toBeUndefined()`（:123-128）。
- 9：parse 节点内读取运行文件：前序 register checkpoint `status==='done'`、`outputRef==='artifacts/{nodeId}.json'`、`readArtifact` 已定义（:132-134）；运行 completed（:139-140）。
- 10：删 OCR 产物后续跑新 runId → `calls` `toEqual({parse:0, ocr:1, extract:1})`（仅 OCR 及下游重做）、checkpoints 数量与首跑相同、register 产物 `runId` 换新 run.id、OCR 产物已定义、completed（:164-168）。
- 11：产物 `dependencyHash:'损坏的指纹'` 后同 runId 续跑 → 重做节点 `calls===1`、`run.status==='completed'`（:178-179）。

## 4. 未覆盖与脆弱点

- 未覆盖：`isRunCancelled` 独立断言、`effectiveRuleDependencies` 的 constraint 字段分支、`onEvent` 事件全集、`startReviewRun`（V1）不在本文件。
- 脆弱点：模板/节点 id 与 `review-run-graph` 生成耦合（`node-auto-check-*`）；用例 9/10 依赖执行器内读盘时序；`Date.now()` 隔离目录。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例断言/行号如 §2-3 | 已证实 | 本文件 :37-179 逐行 |
| hash 两不变量（usage/顺序） | 已证实 | :41-42/:49 |
| 输入变化拒绝（K06）/取消 K18/续跑跳过/产物重做 | 已证实 | :119/:123-128/:113-114/:164-179 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `computeRunInputHash` 两不变量 | §3 | 37-50 | covered |
| 分项/workspace 规则进分母 | §3 | 66-87 | covered |
| 检查点落盘/事件/读回 | §3 | 94-140 | covered |
| 续跑跳过/输入变化拒绝/取消 | §3 | 107-122 | covered |
| 产物丢失/损坏重做 | §3 | 162-179 | covered |
| `isRunCancelled`/依赖分支 | §4 | — | unknown（未测） |
