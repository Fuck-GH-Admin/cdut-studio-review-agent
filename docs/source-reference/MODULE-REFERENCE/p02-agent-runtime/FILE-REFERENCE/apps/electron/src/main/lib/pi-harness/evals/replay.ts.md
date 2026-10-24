---
path: apps/electron/src/main/lib/pi-harness/evals/replay.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 600da975327594c6ee6f060d7095384ce4c8c0ae
sha256: a0d7126cb0cccdd8a63f4792b091acc379452dd3b5e1887183c0651c85bd7430
lines: 81
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/evals/replay.ts

## 1. 结论与边界

**夹具回放评测器**：全内存重放 graph+sidecar JSON，练习 focus/证据对账/事后 telemetry——**不能调模型、排队提示、改会话文件或产生自主迁移**（`evals/replay.ts:25-29`）。纯函数，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：1 个导出 + 1 内部。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `evaluatePiHarnessFixture` | 函数 | `:30` | `(fixture): PiHarnessEvalResult` |
| `numericTelemetry`（内部） | 函数 | `:8` | telemetry 形状→12 个数值指标（usage 5/candidate 1/falseVerified/安全 4/autonomy 1） |

## 3. 内部逻辑与关键流程

（`:30-81`）：`buildGraphFromEvents`+`replayPiHarnessEvents`→选最新 goal（updatedAt 降序，`:33-34`）→`decideGoalIntake`（含 goalConflict 透传）→`selectHarnessFocus`→逐任务 `reconcileFocusedTask` 汇总 assuranceByTask（`:42-51`）→`collectPiHarnessTelemetry` 数值化→与 `expected` 逐项比对生成 failures（goalIntakeKind/focusTaskId/focusKind/assuranceByTask/telemetry，仅声明项断言 `:60-79`）→返回 `{fixture, passed, failures, actual}`。

## 4. 调用者与调用链

- 入向：`evals/replay.test.ts:4`（本批）。
- 出向：`../pi-harness-reducer`/`../goal-controller`/`../reconciler`（本批）、`../telemetry`（**域外**：collectPiHarnessTelemetry/session-telemetry 同族）、`@profer/project-core`。

## 5. 数据 I/O、读写与副作用

无（内存回放）。

## 6. 分支、失败、取消与恢复

失败=比较不匹配入 failures（不抛）；无取消。

## 7. 权限与权威状态

“无副作用评测”权威=函数边界（自述禁止五类副作用，`:25-29`）；goalConflict 仅来自夹具（`:18` 类型注释互证）。

## 8. 修改影响面

评测夹具回归基线（replay.test 消费）。

## 9. 测试证据

`NOT_RUN`。直接测试 `evals/replay.test.ts`（35 行/**2 个静态 `test(`**，其中 1 个 for 循环按 6 个 fixture 动态生成=**运行 7 个用例**）：fixture 语料清单锁定（6 名称 `toEqual`，`:14-23`）；每 fixture 双跑一致+零 failures+passed=true+`taskTransitions` `toBe(0)`（`:25-34`）。夹具数据在 `evals/fixtures/*.json`（域外，未在本批 scope）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 回放/比对/12 指标数值化 | 已证实 | `:1-81` 全文 + 测试互证 |
| `../telemetry` 实现 | 边界 | 域外 |
| fixtures 内容 | 边界 | 域外数据文件 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+内部 | §2/§3 | 8-81 | covered |
| 测试（2 静态/7 运行） | §9 | test 文件 | covered（NOT_RUN） |
