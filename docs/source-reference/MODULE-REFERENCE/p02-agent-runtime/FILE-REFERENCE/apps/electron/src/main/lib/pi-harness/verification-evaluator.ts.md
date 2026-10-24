---
path: apps/electron/src/main/lib/pi-harness/verification-evaluator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 79d772d62625e259484c6567889ffcb88ef08d16
sha256: f645d800200fba5ac438aabf5dd8cd0bde7e00fbdd807d139148f45c1b29dcde
lines: 87
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/verification-evaluator.ts

## 1. 结论与边界

任务验证裁决器（`:31-33` 注释红线）："只评估有限确定性证据，任务叙述与模型声明**绝不**成为验证证据"。把 `TaskNode` 的 `@verify` 契约（`@profer/project-core` 的 `getTaskVerificationContext`）与 `ToolFact` 流对账，产出五态 `VerificationDecision`。

不做的事：不产事实（tool-facts）；不持久化（store）；不看模型 prose。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `VerificationDecision` | `:4-9` | `{taskId; state:AssuranceState; reason; evidenceFactIds[]}` |
| `evaluateVerification` | `:35-87` | `({task, facts, previous?}) => VerificationDecision`，纯函数 |

内部：`factPath:11-13`/`category:15-17`（subject 取值助手）、`criterionCategory:19-25`（@verify 判据→test/typecheck/build/readback 正则分类）、`latest:27-29`（时间戳降序取首）。

## 3. 内部逻辑与关键流程

裁决顺序（`:40-86`）：

1. `previous.state==='waived'` → 直接 waived 保持（`:41-43`，`previous.reason/evidence` 原样继承）。
2. `contract.required` 为假 → `not_required`（reason "任务未声明可确定验证契约"，`:44-45`）。
3. 取该 task 的 facts 时间升序；`latestMutation` = 最近成功 `file_mutation`；`afterLatestMutation` = 变更后证据过滤（`:47-49`）。
4. **不可确定判据** → `pending`（"存在无法确定性匹配的 @verify 契约"，`:51-54`）。
5. 最近验证命令失败 → `failed`（`:56-60`，evidence=[失败 fact id]）。
6. **产物读回**：每个 `contract.artifacts` 需变更后成功 `file_read` 且 path 匹配，缺 → `pending`（"缺少产物读回证据: <artifact>"，`:62-72`）。
7. **显式判据**：每个 `explicitCriteria` 需变更后成功 `verification_command` 且 category 匹配，缺 → `pending`（"缺少验证证据: <criterion>"，`:74-84`）。
8. 全过 → `verified`（evidence 去重，`:86`）。

## 4. 调用者与调用链

`apps/electron/src/main/lib/pi-harness/telemetry.ts`（falseVerified 重算 `:207`）；store/reducer 的验证状态生产（`verification_state_changed` 事件）；出向：`@profer/project-core`（`getTaskVerificationContext`/`TaskNode`，`:1`）、`./types`。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O、无副作用。

## 6. 分支、失败、取消与恢复

五态分支见 §3。关键恢复语义：**变更后失效**（`afterLatestMutation`）——旧读回/旧验证在新变更后自动作废回到 pending（测试用例 2 锁定）。

## 7. 权限与权威状态

- 证据权威：只有 `verification_command`/`file_read`/`file_mutation` 三类 ToolFact 有效；"模型声明不作证据"（`:31-33`）。
- `waived` 是用户权威（previous 继承，`:41-43`）。
- 判据分类权威：`criterionCategory` 正则（`:19-25`）——不可分类即 pending（宁停勿假）。

## 8. 修改影响面

改裁决顺序影响 verified/pending/falseVerified 全链（telemetry safety 计数、Governor 循环判定）；`criterionCategory` 正则改动影响 @verify 契约兼容性。

## 9. 测试证据

直接测试 `verification-evaluator.test.ts`（4 个 `test(`）：变更后读回+测试证据齐备→verified（`:16-26`）；新变更后旧证据失效→pending（`:28-38`）；验证失败→failed（`:40-43`）；waived 保持不伪装 verified（`:45-48`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 裁决顺序 8 步/五态 | 已证实 | 文件全读 |
| 变更后失效语义 | 已证实 | `:48-49` + 测试 `:28-38` |
| 模型声明不作证据红线 | 已证实 | `:31-33` |
| `criterionCategory` 对长判据串的误分类边界 | 推断 | `:19-25` 正则 |
| `@verify` 契约解析实现 | 未知 | project-core 不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 2 导出 + 4 助手 | §2 | covered |
| 8 步裁决流程 | §3 | covered |
| 权威红线 | §7 | covered |
| 4 测试断言 | §9 | covered |
| 未知 | §10 | covered |
