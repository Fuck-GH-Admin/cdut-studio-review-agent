---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 19dbb9804361afe64a9408bec2cb4459c2c535a9
sha256: b4baa3e033709277c1c98f31b076136e2dcb92996db4e5aa6abbc818ecb538ab
lines: 243
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.ts

## 1. 结论与边界

**T01 可配置业务模板**（`apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.ts:1-8`）：7 场景（student/activity/scholarship/judging/expense/agreement/laboratory）种子 + 模拟表单试填。**模拟值只生成表单值，不生成原件字节**（`:182`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T01ScenarioId` | type | `:9` | 7 场景 |
| `T01_SCENARIOS` | const | `:10-38` | 场景清单（label/description） |
| `createT01Scenario` | 函数 | `:50-151` | `(id, templateId, createdAt) => TemplateVersion` |
| `T01TrialValue`/`T01TrialResult` | types | `:152-161` | 试填值/结果 |
| `exampleT01TrialInput` | 函数 | `:183-207` | 明显模拟的表单值（`:182` 注释） |

内部：`twoReview`/`stagesWithRating`（`:39-49`，流程）、`conditionValue`（`:162-181`，条件求值）。

| `trialT01Template` | 函数 | `:212-…` | 试填主函数（返回 `T01TrialResult`；被 `checkT01ExampleForm` `:101`/`:105` 调用） |
## 3. 内部逻辑与关键流程

- `createT01Scenario`（`:50-151`）：按场景生成 TemplateVersion（字段/材料槽/流程/分项）；laboratory=组织/无评分/初审→终审（test 锁定）。
- `exampleT01TrialInput`（`:183-207`）：**明显模拟值**（不生成原件）；试填不改已起草模板（test 锁定）。
- `conditionValue`（`:162-181`）：条件 AST 求值（缺字段/计划→不能试填，test 锁定）。

## 4. 调用者与调用链

- 消费方：T01 场景选择、example-packs（`createT01Scenario` 夹具源）。
- 出向：`@profer/shared`。

## 5. 数据 I/O、读写与副作用

纯函数/常量；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 字段/计划缺失 | `:162-181` | 试填拒绝 |
| 试填 | `:183-207` | 明显模拟值 |

## 7. 权限与权威状态

「模拟」标注（`:182`）不冒充原件；judging 样例不虚构评审等级（test 锁定）。

## 8. 修改影响面

- 7 场景种子与业务口径耦合；`T01ScenarioId` 被 example-packs 排除 laboratory。

## 9. 测试证据

`review-v3-t01-business-presets.test.ts`（79 行，8 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出、7 场景种子 | 已证实 | `:9-207` |
| 不生成原件/不虚构等级 | 已证实 | `:182` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 7 导出 | `:9-207` | covered |
| 场景/试填 | `:50-207` | covered |
