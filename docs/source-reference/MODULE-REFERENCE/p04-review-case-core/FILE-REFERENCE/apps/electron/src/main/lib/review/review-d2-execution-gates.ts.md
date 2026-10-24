---
path: apps/electron/src/main/lib/review/review-d2-execution-gates.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c2a8792444efe97fda29d9d55a4977308fe15032
sha256: 730775e9d285936a032051daf0383c8cc22a60b5c95bfb1e35537c211480e68b
lines: 167
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-d2-execution-gates.ts

## 1. 结论与边界

D2 结构化条件/材料语义（头注 :1-6）：**不是**政策权威引擎。三态判定（`'true'|'false'|'unknown'`）只承认两类确定事实——审核员显式确认的当前有效材料链接、以及目标对象上 `confirmed && extractedBy==='user'` 的观测；缺证据/解析失败一律 `unknown`，绝不当 `false`（:5、:86）。提供三件事：gate 表达式结构校验、三态求值、检查提交前的守卫裁决（学籍适用性/通用对象证据/条件/材料义务）。

边界：不读写盘、无副作用、无身份/IPC 检查；权威状态判断的数据来源是聚合内的 `evidenceLinks`/`observations`/`d2RuntimePlan`，其写入正确性由上游业务事务保证。

## 2. 导出与关键符号

导出 4 项（1 类型 + 3 函数）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `D2Tri` | type | 12 | `'true'\|'false'\|'unknown'` | 三态 |
| `validateD2ExecutionGate` | fn | 56 | `(gate: D2ExecutionGateV1) => string[]` | 结构校验，返回错误码列表 |
| `evaluateD2GateExpression` | fn | 87 | `(expr, aggregate, subjectId, documentIds) => D2Tri` | 三态求值 |
| `validateD2GuardSubmission` | fn | 117 | `(aggregate, mapping: D2RuleBinding, status: CheckStatus, documentIds) => string\|undefined` | 提交守卫（undefined=放行） |

内部符号：`FIELD`（:13，`/^[a-zA-Z][a-zA-Z0-9:._-]{0,119}$/`）、`STAGES`（:14-17，9 个阶段值：`draft/submitted/reviewing/awaiting-supplement/awaiting-review/awaiting-rating/awaiting-final/decided/archived`）、`exactKeys`（:18-20，白名单外键报 `unsupported key`）、`expressionIssues`（:21-55，递归校验）、`triNot/triAll/triAny`（:73-75）、`checkedEvidence`（:76-85）。

## 3. 内部逻辑与关键流程

1. **结构校验** `validateD2ExecutionGate`（:56-72）：gate 非对象/数组 → `['D2_GATE_INVALID']`（:58）；顶层只许 `when/material` 键（:59）；两者皆无 → `D2_GATE_EMPTY`（:60）。`expressionIssues`（:21-55）递归：深度 >12 → `D2_GATE_DEPTH`（:22）；`all/any` 要求 `conditions` 数组 1–32 个子式（:24-29，`D2_GATE_EMPTY_OR_EXCESSIVE_CHILDREN`）；`not` 单子式（:30-32）；`confirmed-observation`/`trusted-registry-field` 要求 `fieldKey` 过 `FIELD`、`equals` 为非空串 ≤200（:33-41）；`evidence-any` 要求 `supportsFacts` 1–32 个互异 `FIELD` 串（:42-48）；`case-stage` 要求 `stages` 非空全在 `STAGES`（:49-53）；未知 kind → `D2_GATE_UNKNOWN_EXPRESSION`（:54）。material 校验（:62-70）：`provider` 仅 `applicant|authority`、`dueStages` 非空全在 `STAGES`、`alternatives` 1–32 互异 `FIELD` 串。
2. **三态代数**（:73-75）：`triNot(unknown)=unknown`；`triAll` 有 false 即 false、全 true 才 true；`triAny` 有 true 即 true、全 false 才 false；其余 unknown。
3. **`checkedEvidence`**（:76-85）：无 subjectId 或无引用文档 → false；否则须存在 `evidenceLinks` 条目满足 `status==='confirmed' && linkedBy==='user' && subjectId 相等 && supportsFact∈labels && documentVersionId∈citedDocumentIds`，且该文档版本在 `caseV2.documents` 中 `active !== false`（:81-84）。
4. **求值** `evaluateD2GateExpression`（:87-116）：`all/any/not` 递归（:91-93）；`case-stage` 直接比 `aggregate.caseV2.stage`（:94）；`evidence-any` → `checkedEvidence` 成立 'true' 否则 **'unknown'**（:95，未确认≠false）；`trusted-registry-field`（:96-104）→ 从 `aggregate.d2RuntimePlan` 找 `subjectId` 相等且 `kind==='student-field'` 的 target，配合 `trustedStudentSnapshot` 须 `status==='current' && sourceKind==='controlled-synthetic' && studentId===target.studentId && sourceId && snapshotVersionId` 全满足，否则 unknown；字段值为字符串才比较（相等 'true' 否则 'false'），非字符串 unknown（:102-103）；`confirmed-observation`（:105-115）→ 取 `subjectId+fieldKey` 相等、`confirmed && extractedBy==='user'`、且 `sourceRefs` 指向引用集内**当前 active** 文档版本的观测（:108-111）；无命中 unknown（:112）；取值集合须恰好一个非空文本值（非文本视作 `''`，:113-114），否则 unknown；与 `expr.equals` 相等 'true' 否则 'false'（:115）。注释 :105-106 明确拒绝自填 caseFields/AI 猜测/已退役版本。
5. **提交守卫** `validateD2GuardSubmission`（:117-167），按序短路：
   - 学籍适用性：`applicability==='unknown'` 且非 `awaiting-confirmation` → `D2_STUDENT_APPLICABILITY_UNKNOWN: 受控学籍条件未知，只能待核`（:121-122）；`not-applicable` 只许 `not-applicable/awaiting-confirmation` 状态（:123-125）；`applicable` 不能标 `not-applicable`（:126-127）。
   - 通用对象证据（target `kind==='generic-object'` 且 status 为 `compliant/non-compliant`）：`mapping.evidenceCoverage?.supportsFacts` 为空、或无「`subjectId===mapping.subjectId` 的 confirmed+user 链接 + active 文档」→ `D2_GENERIC_EVIDENCE_SCOPE_MISSING: 本对象未绑定对应事实的有效材料版本`（:129-137）。
   - gate 缺省放行（:138-139）；结构问题 → `D2_GATE_INVALID: …`（:140-141）。
   - 条件三态与状态矩阵：`cond=when? evaluate : 'true'`（:142）；`unknown` 非待核 → `D2_GATE_UNKNOWN: 条件或所需可信证据不明，不能变成不适用/缺件/符合`（:143-144）；`false` 生成非 `not-applicable/awaiting-confirmation` → `D2_GATE_FALSE: 已确认不触发该业务责任，不能生成符合/缺件`（:145-146）；`true` 且标 `not-applicable` → `D2_GATE_TRUE: 已确认适用的业务责任不能标记不适用`（:147-148）；`cond!=='true'` 或无 material → 放行返回 undefined（:149）。
   - 材料义务（cond=true 有 material 时）：`due=dueStages 含当前 stage`、`satisfied=checkedEvidence(alternatives)`（:150-152）；未到期却判缺件 → `D2_MATERIAL_NOT_DUE`（:153-154）；`provider==='authority'` 判缺件 → `D2_MATERIAL_AUTHORITY_OWNED: 有权部门待签批不得变成申请人缺件`（:155-156）；`provider==='authority'` 判 `compliant` → `D2_MATERIAL_AUTHORITY_DECISION_REQUIRED: 缺少有权部门独立可信审批…`（:157-161，注释 :157-159：审核员确认的材料链接**不等于**有权部门签批，无认证 authority-actor 流程前不得从材料/AI 结论推定批准）；`compliant` 但未满足替代材料 → `D2_MATERIAL_ALTERNATIVE_UNVERIFIED`（:162-163）；已有有效替代证明仍判缺件 → `D2_MATERIAL_ALREADY_SUPPORTED`（:164-165）。

## 4. 调用者与调用链

入向（全树 grep 三符号 + 错误码前缀）：
- `review-d2-runtime.ts:18` 导入 `validateD2GuardSubmission`，唯一调用点 `:533`——`verifyD2PiRun` 逐 mapping 检查（每条 Pi 检查结果经 `validateD2OperationEvidence` 后再过本守卫，:531-533）。
- `review-authoring-v1.ts:15` 导入 `validateD2ExecutionGate`，调用点 `:101`——`validateReviewAuthoringV1` 对 `sourceBindings[].gate` 逐条校验（错误前置 `checkId`）。
- `evaluateD2GateExpression`/`D2Tri` **无外部消费者**（全树检索仅本文件内部 :91-93/:140-142 调用；导出未被外部引用）。
- 无测试文件直接 import 本模块（全树 `review-d2-execution-gates` 仅上述 2 个生产 import；`D2_GATE_/D2_MATERIAL_/D2_STUDENT_` 错误码仅出现在本文件与 `review-d2-runtime.ts`/`review-authoring-v1.ts` 的**其他**错误码常量，无 `.test.ts` 命中）。

出向：仅 `@profer/shared` 类型（`CaseAggregateV2/D2ExecutionGateV1/D2GateExpressionV1/D2RuleBinding/CheckStatus`，:7-10）。**零运行时依赖、零 I/O**。

## 5. 数据 I/O、读写与副作用

纯函数：无磁盘/网络/缓存写读；输入只读 `aggregate.evidenceLinks`、`aggregate.observations`、`aggregate.caseV2.{stage,documents}`、`aggregate.d2RuntimePlan.{targets,trustedStudentSnapshot}`（:81-84/:97-103/:108-111/:129-137）。无日志、无全局状态。

## 6. 分支、失败、取消与恢复

- 校验函数从不 throw，返回错误码数组/字符串（调用方决定拒绝方式）；求值函数对畸形表达式可能走 `expr.kind` 未匹配时落到 `confirmed-observation` 兜底逻辑（:105-115 的注释链尾，非显式 else）——正常输入由 `validateD2ExecutionGate` 先行把关（`review-d2-runtime.ts`/`review-authoring-v1.ts` 均先校验后求值/生成）。
- 无取消/恢复概念（无状态机、无写入）。

## 7. 权限与权威状态

- 事实权威的**来源分级**（本文件核心）：`confirmed-observation` 只认 `extractedBy==='user'` 且 `confirmed` 的观测（:108-109）；证据只认 `linkedBy==='user'` 且 `status==='confirmed'` 的链接（:82）；两者都必须指向当前 `active !== false` 的材料版本（:84/:111）——AI 结果、退役版本、自填字段均不构成权威（:105-106 注释）。
- 可信注册表字段只认 `status==='current'` 的受控合成快照（:100-101）；不满足即 unknown（fail-closed 到「待核」而非放行/否定）。
- **有权部门签批不可被替代**：`provider==='authority'` 的材料无论链接多完整都不能推定 `compliant`（:157-161）或转嫁为申请人缺件（:155-156）——即"本地审核员/AI 无行政批准权"的落地。
- 本文件无 sender/actor 检查（纯数据判定）；actor 权限在 IPC/C0 层（见 `review-c0-authority.ts` 篇）。

## 8. 修改影响面

- `validateD2GuardSubmission` 的唯一调用点是 `review-d2-runtime.ts:533`（`verifyD2PiRun` 内逐 mapping 检查）；改判据只影响 `verifyD2PiRun` 的 `problems/complete` 输出（诊断/测试路径）。**`verifyD2PiRun` 当前无生产调用者**（全冻结树非 `.test.ts` 检索 `verifyD2PiRun(` 零命中）——本守卫不在生产提交路径上。生产结果提交的拒绝由 `pi-case-review-service.submitPiReviewResultV2`（`pi-case-review-service.ts:915` 起）自身校验负责（如「规则尚未确认」拒绝在 `pi-case-review-service.ts:984`），不受本守卫影响。
- `validateD2ExecutionGate` 影响作者态校验（`review-authoring-v1.ts:101`）与 D2 计划生成前置。
- `STAGES` 集合须与 `@profer/shared` 的阶段枚举保持同步（当前 9 值，:14-17）。
- 无专属测试；修改后只能经 `review-d2-runtime.test.ts` 间接回归，建议补直接单测（§9 缺口）。

## 9. 测试证据

**无直接测试文件**（否定范围：全冻结树 `.ts` 检索 `review-d2-execution-gates`/`D2_GATE_`/`D2_MATERIAL_`，无 `.test.ts` 命中）。间接证据：
- `review-d2-runtime.test.ts`（16 用例，NOT_RUN）经 `verifyD2PiRun`/`submitPiReviewResultV2` 覆盖守卫**结果**：`:289-348` 查阅凭据不得跨操作替代复制（跨操作拒绝 `rejected` 含「逐操作」，:326）、缺检查保持 `running`、补 `awaiting-confirmation` 后 `complete:true`；`:350-375` 未认证校规（`authority==='unverified-policy'`）判 `compliant` 被拒（reason 含「尚未确认」，:360），全 `awaiting-confirmation` 才 `completed`。
- 归因更正：用例 `:360` 的 `rejected`（reason 含「尚未确认」）来自 `pi-case-review-service.ts:984`（`submitPiReviewResultV2` 的规则确认检查），**与本守卫无关**；用例 `:328/:374` 的 `complete/problems` 断言对应 `review-d2-runtime.ts:527-528`（verifyD2PiRun 的未认证制度 problems 串）与 :533（本守卫）。`D2_GATE_*`/`D2_MATERIAL_*` 文案**未被任何测试断言**（全树检索确认）。
- 三态求值的边界（`unknown` 传播、`checkedEvidence` 五条件、trusted-registry-field 快照门槛）无测试。

未覆盖（缺口）：`validateD2ExecutionGate` 全部错误码、`evaluateD2GateExpression` 六种 kind、`validateD2GuardSubmission` 全部 13 个拒绝串（学籍 3（:122/:125/:127）+ 通用对象 1（:136）+ gate 4（:141/:144/:146/:148）+ 材料 5（:154/:156/:161/:163/:165））、`triNot/triAll/triAny` 组合；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号行号如 §2 | 已证实 | :12-117 逐条 |
| 缺证据/解析失败 = unknown，非 false | 已证实 | :5、:86、:95、:112-114 |
| 权威事实只认 user 确认 + 当前 active 版本 | 已证实 | :81-84、:105-111 |
| authority 材料既不能推定批准也不能判申请人缺件 | 已证实 | :155-161 |
| 调用链：`review-d2-runtime.ts:533`（verifyD2PiRun 内）、`review-authoring-v1.ts:101`；verifyD2PiRun 无生产调用者 | 已证实 | 全树 grep `verifyD2PiRun(` 非测试零命中 |
| `evaluateD2GateExpression`/`D2Tri` 无外部消费者 | 已证实（否定） | 全树检索仅本文件 |
| 无直接测试、错误码无断言 | 已证实（否定） | 全树检索无 `.test.ts` 命中 |
| 畸形表达式求值的兜底行为 | 推断 | :105-115 链尾无显式 else；正常由先校验保证 |
| 真实业务数据下 unknown 误报率 | 未知 | 无运行证据（NOT_RUN） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validateD2ExecutionGate`（全错误码） | §3.1 | 56-72 + 21-55 | covered（未测） |
| `evaluateD2GateExpression`（六 kind） | §3.4 | 87-116 | covered（未测） |
| `validateD2GuardSubmission`（13 拒绝串+放行） | §3.5/§6 | 117-167 | covered（间接测试仅整体结果） |
| `checkedEvidence` 五条件 | §3.3 | 76-85 | covered |
| `triNot/triAll/triAny` | §3.2 | 73-75 | covered |
| `FIELD`/`STAGES`/`exactKeys` | §2/§3.1 | 13-20 | covered |
| 畸形表达式兜底 | §6/§10 | 105-115 | partial（推断） |
