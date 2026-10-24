---
path: apps/electron/src/main/lib/pi-harness/verification-evaluator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68d2a6b3545c2c17b516b0281a7a5af2e6253bf1
sha256: 463c578cc5697edef6af4a615581ef33234ca1d9e0c20d085c3bcfbe216c5a9f
lines: 49
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/verification-evaluator.test.ts

## 1. 测试目标

直接测试 `evaluateVerification`（verification-evaluator.ts）四条裁决路径：变更后证据齐备→verified、变更后旧证据失效→pending、验证失败→failed、waived 保持不伪装。4 个 `test(`，1 个 `describe('Pi Harness verification evaluator')`（`:15`）。

不测试：@verify 契约解析（project-core）、不可确定判据→pending。

## 2. 用例清单

夹具：`task`（TaskNode，`description:'@verify: bun test target'`、`artifact:['dist/output.txt']`，`:6-9`）；`fact()` 工厂（`:11-13`，subject 可注入）。无 mock/无 IO。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:16-26` | write(10)→read(11)→test 成功(12) 三条事实 | evaluate | `:25` `toMatchObject{state:'verified', evidenceFactIds:['read','test']}` |
| 2 | `:28-38` | read-old(10)/test-old(11) 后 write-new(12) | evaluate | `:37` `toMatchObject{state:'pending', reason:'缺少产物读回证据: dist/output.txt'}`（旧证据因新变更作废） |
| 3 | `:40-43` | 仅 test-failed(10, outcome failure) | evaluate | `:42` `toMatchObject{state:'failed', evidenceFactIds:['test-failed']}` |
| 4 | `:45-48` | previous waived（'用户接受风险'）+ 空 facts | evaluate | `:47` `toEqual({taskId:'task', state:'waived', reason:'用户接受风险', evidenceFactIds:[]})`（全等断言） |

## 3. 真实断言

`toMatchObject`（状态+原因+证据 ID）+ `toEqual`（waived 全等——连 evidenceFactIds 空数组也锁）。无快照测试。

## 4. 未覆盖

- `not_required`（contract.required 为假）。
- 不可确定判据→pending（"存在无法确定性匹配的 @verify 契约"）。
- 显式判据缺证据→pending（"缺少验证证据: <criterion>"）。
- multiple artifacts/多判据的 evidence 组合与去重。
- `criterionCategory` 正则边界（readback/build）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 变更后失效语义由用例 2 锁定 | 已证实 | `:28-38` |
| waived 全等保持 | 已证实 | `:47` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| verified（读回+判据） | §2 用例 1 | `:16-26` | covered |
| 变更后失效→pending | §2 用例 2 | `:28-38` | covered |
| failed | §2 用例 3 | `:40-43` | covered |
| waived 保持 | §2 用例 4 | `:45-48` | covered |
| §4 边缘分支 | — | — | unknown（未覆盖） |
