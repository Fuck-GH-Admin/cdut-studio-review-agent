---
path: apps/electron/src/main/lib/review/review-d4-common.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ebecfa76df7c0236fa22c02aca99609d6f40de30
sha256: 3a4299c4c16e5739be597aa58a4dd32a99221d51108192ba6bd89ca783cdfb28
lines: 76
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-d4-common.ts

## 1. 结论与边界

COMMON-01/02：**有界的通用对象情景编译**（`compileD4Generic`），无额外 agent 或 DSL（`apps/electron/src/main/lib/review/review-d4-common.ts:1`）。把 D2 情景选择（generic-object targets × 情景轴/条件分支）编译为 `GenericEntry[]`（任务实例）+ 确定性 fingerprint。76 行薄模块：1 类型 + 1 函数。

边界：不执行审核、不写盘；预览阻断即抛错（`D2_PREVIEW_BLOCKED`）；来源/绑定缺失 fail-closed（`D2_SOURCE_MISSING`/`D2_GENERIC_*`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `GenericEntry` | type | 6 | `{task: DemoTaskPreview; instanceCheckId: string; applicability: D2RuleBinding['applicability']}` | instanceCheckId 规则：genericScope 任务=`checkId+'#'+objectKey`；caseScope 任务=checkId 本身（`:63,68-69`） |
| `compileD4Generic` | function | 7-76 | `(workspace: ReviewAuthoringWorkspaceV1, selection: D2ScenarioSelection) => {entries: GenericEntry[]; fingerprint: string}` | |

内部：`sha`（`:5`）、`checkSource`（`:24-28`：source.reference.documentVersionId 必须等于声明版本）。

## 3. 内部逻辑与关键流程

`compileD4Generic`（`:7-76`）：

1. `:10-13` 模板定位（`D2_TEMPLATE_MISMATCH`）；`scenarios` 与 `genericScenarioAxes` 必须同有同无（`D2_GENERIC_AXES_REQUIRED`）。
2. `:14-17` 选择合法性（`D2_GENERIC_SELECTION_INVALID`）：targets 1..100、全 `generic-object`、不得带 scenario/scenarios/scenarioObjectKey。
3. `:21-23` 模板 modules 的 objectKey 必须全在 targets 集（`D2_SCOPE_MISSING`）。
4. `:29-51` 逐 target 分支构造：有 axes 时——scenario 必须在 `axes.primary` 且 `scenarioSource.decidedBy==='reviewer'`（`D2_GENERIC_PRIMARY_INVALID`）+ `checkSource`；conditions 数量/去重/成员必须全等于 `axes.conditions`（`D2_GENERIC_CONDITIONS_INCOMPLETE`）；每条件 applicability 三值且 decidedBy 与之匹配（unknown→`undetermined`，否则 `reviewer`，`D2_GENERIC_CONDITION_DECISION_INVALID`）+ `checkSource`；无 axes 时不得带 scenario 声明（`D2_GENERIC_SCENARIO_UNDECLARED`），单分支 applicable。
5. `:52-72` 逐分支 `previewDemo`（blocked → `D2_PREVIEW_BLOCKED`）；指纹项 `sha({object,branch,preview:preview.fingerprint})`（`:56`）；逐 task：绑定须存在（`D2_SOURCE_MISSING`）；task.objectKey 与 target 不符则跳过（`:60`）；有 genericScope 时 businessTypes 不含 target.businessType 则跳过，含则建实例（`:61-65`）；task 带 objectKey 而绑定无 genericScope → `D2_GENERIC_SCOPE_REQUIRED`（`:66`）；绑定有 caseScopeJustification → 建单例（applicability: undefined，`:67-69`）；都不是 → `D2_GENERIC_UNSCOPED_CHECK`（`:70`）。
6. `:74-75` 至少一个带 objectKey 的实例（`D2_GENERIC_ZERO_TASKS`）；`fingerprint=sha(fingerprints)`。

## 4. 调用者与调用链

出向：`node:crypto`、`@profer/shared` 类型（ReviewAuthoringWorkspaceV1/D2ScenarioSelection/D2RuleBinding）、`./semantic-module-demo`（previewDemo/DemoTaskPreview）（`:2-4`）。

入向（检索=符号名+模块名，全冻结树）：

- `compileD4Generic`：`apps/electron/src/main/lib/review/review-d2-runtime.ts:19,199`（`genericMode?compileD4Generic(workspace,selection):undefined`，D2 运行时的通用模式分支）。
- `GenericEntry`：零外部引用（仅本文件 `:6,7`）。
- 测试：无直接测试；间接 `review-d2-runtime.test.ts`（批外，16 test）。

## 5. 数据 I/O、读写与副作用

无 I/O；纯编译 + sha256；抛普通 `Error('D2_…')`。

## 6. 分支、失败、取消与恢复

失败=throw（**14 个 `D2_*` 码**（含 `D2_GENERIC_CONDITION_SOURCE_INVALID`），§3）。无异步/取消。确定性输出（同输入同 fingerprint）。

## 7. 权限与权威状态

无权限分支。权威口径：分支决定人 `decidedBy` 限定 reviewer/undetermined（`:33,41-43`）；来源须有 documentVersionId 精确匹配（`:24-28`）。

## 8. 修改影响面

`review-d2-runtime.ts:199` 是唯一调用点；fingerprint/instanceCheckId 口径影响下游对账。无直接测试（批外 `review-d2-runtime.test.ts` 间接）。

## 9. 测试证据

本批**无**直接测试。间接（批外）：`review-d2-runtime.test.ts`（16 test）经 D2 运行时覆盖组合面；逐断言未核（非本批）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 个 D2_* fail-closed 码 | 已证实 | `:11-74` |
| decidedBy 语义（reviewer/undetermined） | 已证实 | `:33,41-43` |
| instanceCheckId 双规则 | 已证实 | `:63,68-69` |
| 唯一调用点 review-d2-runtime | 已证实（检索式见 §4，全冻结树） | grep + 子 agent 调查 |
| `GenericEntry` 零外部引用 | 已证实（同上） | 同上 |
| D2 运行时消费形态细节 | 推断 | `:199` 一行可见 |
| 真实 selection 分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `GenericEntry`/`compileD4Generic` | §2 | 6-7 | covered |
| 前置闸 | §3 | 10-23 | covered |
| 分支构造 | §3 | 29-51 | covered |
| 实例映射 | §3 | 52-75 | covered |
