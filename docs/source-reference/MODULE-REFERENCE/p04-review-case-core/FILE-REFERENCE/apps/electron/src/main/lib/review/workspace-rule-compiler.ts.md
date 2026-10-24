---
path: apps/electron/src/main/lib/review/workspace-rule-compiler.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c602f3a9eed94ca1239384937ea5b1ffde4da2a
sha256: 1f3e8d4b5d31435a6ba294142e87606a8671faff3393c94e98ea20e58b874fc8
lines: 63
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/workspace-rule-compiler.ts

## 1. 结论与边界

把 V1 案卷里“人工确认的规则摘要”（`RulePack.outline` 条目）编译成一条 V2 可执行 `RuleSpec`：按 `outline.constraint` 的结构化程度决定 `execution`（`deterministic`/`semantic`/`manual`）、`when` 适用条件与 `calculation`；不可表达的约束（互斥、必需条款等）明确降为人工核验。纯函数，无 I/O、无状态、无权限。

不做的事：不判规则是否通过（执行在规则引擎/Run 侧）；不读写聚合（`workspace-service-v2.ts:44` 是唯一调用者）；不校验 `RulePack`/`RuleOutlineItem` 的来源真实性。

## 2. 导出与关键符号

导出 1 个 function，无导出类型。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `compileWorkspaceRule` | function | `:4-63` | `(pack: RulePack, outline: RuleOutlineItem, priority = 1) => RuleSpec` | 单条规则编译 |

内部局部量：`constraint`（`:5`）、`execution`/`targetScope`/`when`/`calculation`（`:6-9`）；默认 `execution = pack.confirmed ? 'semantic' : 'manual'`、`targetScope='subject'`、`when={field:'title',op:'exists'}`。

## 3. 内部逻辑与关键流程

按 `constraint.kind` 顺序判定（`:11-43`）：

1. `!pack.confirmed` → 强制 `manual`（`:11-12`）。
2. `max-score` 且 `value` 为 number → `deterministic`、`targetScope='group'`、`when={field:'declaredScore',op:'exists'}`、`calculation={valueFrom:'declaredScore',aggregate:'sum',cap:{value:String(value),unit:'point'},allocation:'score-desc-then-subject-id'}`（`:13-17`）。
3. `score-value` 且 number → `appliesWhen` 存在才 `deterministic`，否则 `manual`（“固定分值必须有明确适用条件”）；`when` 取 `appliesWhen ? {field,op:'eq',value:equals} : {field:'title',op:'exists'}`（`:18-24`）。
4. `date-range` 且有 `dateFrom/dateTo` → `deterministic`、`when={field:'activityDate',op:'exists'}`（越界是违规而非“不适用”，实际边界在 `workspaceConstraint` 求值，`:25-29` 注释）。
5. `amount-limit` 且 number → `deterministic`、`when={field:'amount',op:'exists'}`（超限金额不从分母剔除，`:30-33` 注释）。
6. `level-mapping` 且 `levels` 非空 → `deterministic`、`when={field:'level',op:'exists'}`（`:34-36`）。
7. `required-evidence` 且 `requiredEvidenceTypes` 非空 → `deterministic`、`when={field:'title',op:'exists'}`（`:37-39`）。
8. 其余有 constraint（`mutual-exclusion`、`required-clause` 等）→ `manual`（`:40-43`）。

输出 `RuleSpec`（`:45-61`）：`id=workspace:${pack.id}:${outline.id}`、`policyVersionId=workspace:${pack.id}@${pack.version}`、`title=${outline.category} · ${outline.title}`、`requirement=summary ? title：summary : title`、`onFail:'manual-review'`、`onUnknown:'needs-confirmation'`、`sourceRefIds:[${pack.documentId}-v1]`、`priority`、`confirmation = pack.confirmed ? 'confirmed':'unconfirmed'`；`semanticOutputEnum` 仅在 `confirmed && execution==='semantic'` 时附加（`:59`）；`workspaceConstraint` 保留原 constraint（`:60`）。

## 4. 调用者与调用链

- **入向**（冻结树检索 `apps/electron/src/**` 非测试文件）：唯一调用者 `apps/electron/src/main/lib/review/workspace-service-v2.ts:13`（import）、`:44`（`v1.rulePacks.flatMap(pack => pack.outline.map((outline,index)=>compileWorkspaceRule(pack,outline,index+1)))`）。
- **出向**：仅 `@profer/shared` 类型（`RuleConstraint/RuleOutlineItem/RulePack/RuleSpec`，`:2`）。
- 链路：`ensureWorkspaceAggregateV2/syncWorkspaceProjectionV2 → projectedCase → compileWorkspaceRule` → 写入 `caseV2.reviewRules`。
- 直接测试：`workspace-rule-compiler.test.ts`（5 test）。间接：`workspace-service-v2.test.ts:205-220` 断言编译结果（manual/unconfirmed/deterministic 混合、`sourceRefIds` 以 `-v1` 结尾）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/缓存/日志；输入 `RulePack`+`RuleOutlineItem`，输出新 `RuleSpec` 对象。幂等：同输入同输出（`id/policyVersionId` 派生自 pack/outline 标识）。无并发问题。

## 6. 分支、失败、取消与恢复

无 throw、无异步、无失败路径：任何无法结构化的约束都降级 `manual`（`:40-43`）或经 `score-value` 无条件分支（`:20`）。`constraint.value` 非 number 的 `max-score`/`score-value`/`amount-limit` 会落入哪个分支：`max-score`/`amount-limit` 条件要求 `typeof value==='number'`，不满足则继续向下落到 `:40` 的 `else if (constraint)` → `manual`（推断，未单独测试）。无取消/恢复概念。

## 7. 权限与权威状态

无权限分支：本文件无 sender/actor/role 参数，纯编译。权威状态不在本文件——`RuleSpec.confirmation` 只是忠实转录 `pack.confirmed`（`:58`）；“未确认规则不得自动化执行”的强制点在 `execution='manual'` 的下游消费（规则引擎/Run 侧，非本文件）。`sourceRefIds` 固定 `${pack.documentId}-v1`（`:56`），不校验该来源版本是否存在。

## 8. 修改影响面

- 改 `execution` 判定 → 直接改变 V2 规则是否可自动执行；影响 `workspace-service-v2.ts:44` 生成的 `reviewRules`、规则引擎与 Run 的检查计划。
- 改 `id/policyVersionId` 派生 → 影响幂等键与既有案卷的规则身份对比（`workspace-service-v2.ts:119-122` 的 `projectionFingerprint` 含 `reviewRules`，改形状会触发一次投影同步写）。
- 需同步的测试：`workspace-rule-compiler.test.ts`、`workspace-service-v2.test.ts:205-220`。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `workspace-rule-compiler.test.ts`（1 describe、**5 test**）：

1. `:11-15` `score-value`+`appliesWhen` → `deterministic`；无 `appliesWhen` → `manual`；`date-range` → `deterministic`。
2. `:17-20` `required-evidence` → `deterministic`；`mutual-exclusion` → `manual`。
3. `:22-29` `when` 形状断言：amount→`{field:'amount',op:'exists'}`、date→`{field:'activityDate',op:'exists'}`、fixed+appliesWhen→`{field:'category',op:'eq',value:'contest'}`。
4. `:31-34` `confirmed:false` 的 `max-score` → `manual`；confirmed 的无 constraint 条目 → `semantic`。
5. `:36-41` `max-score` → `deterministic`、`targetScope==='group'`、`calculation.cap==={value:'8',unit:'point'}`。

**未覆盖**：`level-mapping`/`amount-limit` 的 execution 断言（#3 只断言 when）；`calculation.allocation`、`sourceRefIds`、`priority`、`semanticOutputEnum` 附加条件；非 number value 的降级路径；`requirement`/`title` 拼接形状。间接证据见 §4。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `compileWorkspaceRule`，纯函数 | 已证实 | `:4`；全文件无 import 运行时依赖 |
| 未确认 pack 一律 `manual` | 已证实 | `:11-12`；测试 `:32` |
| `score-value` 无 `appliesWhen` 降 `manual` | 已证实 | `:20`；测试 `:13` |
| `max-score` 走 `group` + sum-cap 计算 | 已证实 | `:13-17`；测试 `:37-40` |
| 互斥等不可表达约束降 `manual` | 已证实 | `:40-43`；测试 `:19` |
| 唯一调用者为 workspace-service-v2.ts:44 | 已证实 | 冻结树检索（非测试 import 仅此一处） |
| 非 number `value` 的约束落入 `manual` | 推断 | `:13/:18/:30` 的 typeof 条件与 `:40` 兜底；未测试 |
| 下游如何消费 `execution='manual'` | 未知 | 规则引擎/Run 侧不在本文件，未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `compileWorkspaceRule` 签名 | 2 | `:4-63` | covered |
| `!confirmed → manual` | 3 | `:11-12` | covered |
| `max-score` | 3 | `:13-17` | covered |
| `score-value` 有/无 appliesWhen | 3 | `:18-24` | covered |
| `date-range` | 3 | `:25-29` | covered |
| `amount-limit` | 3 | `:30-33` | partial（when 有断言、execution 无） |
| `level-mapping` | 3 | `:34-36` | partial（无直接断言） |
| `required-evidence` | 3 | `:37-39` | covered |
| 兜底 manual | 3 | `:40-43` | covered |
| RuleSpec 组装/semanticOutputEnum | 3 | `:45-61` | partial（id/requirement 未断言） |
