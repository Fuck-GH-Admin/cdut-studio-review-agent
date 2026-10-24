---
path: apps/electron/src/main/lib/pi-harness/evals/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4699f4c5e529f28f0a455c8eb6c2bd07f4f5bed8
sha256: 5708214b0ecca287691307e056236f96a03043304f3110a96a7df15ab4bf9224
lines: 36
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/evals/types.ts

## 1. 结论与边界

**Harness 回放评测夹具类型**（36 行纯类型文件）：JSON 可序列化、无模型依赖的回放用例形状（`evals/types.ts:12`）。`goalConflict` 仅模拟调用方声明的冲突，**评测器绝不自行推断**（`:18`）。0 运行逻辑。

## 2. 导出与关键符号

`export` 逐条核：3 个接口。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PiHarnessEvalExpected` | 接口 | `:4` | goalIntakeKind?/focusTaskId?/focusKind?/assuranceByTask?/telemetry?（全部可选=部分断言） |
| `PiHarnessEvalFixture` | 接口 | `:13` | name/sessionId/userMessage（仅用于确定性 intake 分类，`:16`）/goalConflict?/graphEvents/harnessEvents/expected |
| `PiHarnessEvalResult` | 接口 | `:25` | fixture/passed/failures[]/actual（四项实测值） |

## 3. 内部逻辑与关键流程

不适用（纯类型）。

## 4. 调用者与调用链

- 入向：`evals/replay.ts:6`（本批）、`evals/replay.test.ts:5`。
- 出向：`@profer/project-core`（GraphEvent）、`../types`（PiHarnessEvent——**域外** 194 行背景件）。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用（纯类型）。

## 8. 修改影响面

评测夹具 schema（`evals/fixtures/*.json` 消费，域外数据）。

## 9. 测试证据

`NOT_RUN`。类型经 `replay.test.ts` 使用间接验证（夹具反序列化成功）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 接口形状 | 已证实 | `:1-36` 全文 |
| fixtures 数据内容 | 边界 | `evals/fixtures/*.json` 未在本批 scope |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 接口 | §2 | 4-36 | covered |
