---
path: apps/electron/src/main/lib/review/review-v3-main-template-run.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9922fa9fd1c475d695efd2eb1fed94c231c089a3
sha256: 5b42750038fcccb2ebbd2a5b84abb032abd7f6b93aa703e1282e5c55fa062757
lines: 174
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-template-run.ts

## 1. 结论与边界

已发布模板计划的**正式安装与 Run 写入**（ARCH-CLOSURE-R01 D1/§4.3）。只做 Main 该做的事（文件头 `apps/electron/src/main/lib/review/review-v3-main-template-run.ts:1-15`）：从真实已发布 TemplateVersion 与案卷已确认字段编译冻结计划；用 T04 `evaluateT04Plan` 得确定性结论并经 `toT04CheckResult` 转正式 `CheckResult`；经既有 `run-store-v2` writer 写**真实 ReviewRunV2**（计划指纹/原件版本/规则集合冻结进 `inputManifest`）。

不做：不新建 PlanStore/RunStore/规则引擎；不接受渲染层 Plan/Check/Run；有未映射约束（如 `gte` 早期无算子时）直接拒绝，不拿不完整计划跑审核（`:11-14`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 2 个函数 = 3 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TemplateRuleRunResult` | 接口（导出） | 28-36 | `{runId,planFingerprint,inputHash,checks,status,ruleIds}` | `inputHash` 与 `Run.inputManifest.hash` 一致（`:31`） |
| `runTemplateRuleReview` | 函数（导出） | 62-168 | `(input:{caseId,phase?,initiatedBy?,asOfDate?})=>TemplateRuleRunResult` | 安装计划并生成 Run |
| `latestTemplateRuleRun` | 函数（导出） | 171-174 | `(caseId)=>ReviewRunV2\|undefined` | 最近一次 `run-tpl-*` |
| `MAIN_ACTOR` | 内部 | 26 | `{actorId:'local-reviewer',actorSource:'local',role:'reviewer'}` | 缺省发起人 |
| `sourceRefsOf` | 内部 | 39-48 | 有效未忽略原件→`SourceRef[]` | 缺原件为空，绝不虚构（`:38`） |
| `fingerprintOf` | 内部 | 51-55 | `sha256(planFingerprint+'|'+sorted ruleIds)` | 同模板不同规则不共指纹（`:50`） |

## 3. 内部逻辑与关键流程

`runTemplateRuleReview`（`:62-168`）：

1. `readAggregate(caseId)`（`案卷不存在`/NOT_FOUND，`:69-70`）；有 `d2RuntimePlan` → `AGENT_DECISION_DISABLED: D2 技术预审案卷不得使用正式业务规则计划`（`:71-73`）。
2. `getTemplate(templateId,templateVersion)`（`模板不存在`/DEPENDENCY_UNRESOLVED，`:74-77`）；必须 `status==='published'`（`INVALID_TRANSITION: 只有已发布模板可以生成正式审核运行`，`:78-80`）。
3. `compileTemplatePlanForCase`（`:82-85`）；无 `compiled` → `DEPENDENCY_UNRESOLVED` 带逐条 unresolved 理由（`:86-89`）。
4. `bindings.length===0` → `DEPENDENCY_UNRESOLVED: 已发布模板尚无可执行检查，不能记录空运行`（`:91-93`）；`ruleIds=bindings.map(b=>b.rule.id)`（`:94`）。
5. `executeAt=now`；`active` 有效未忽略原件（RUN-40 同前缀口径，`:97-99`）。
6. `evaluateT04Plan(plan,checks)`；`proposals.length!==plan.bindings.length` → `DEPENDENCY_UNRESOLVED: T04 实际检查数量与冻结计划不一致`（`:100-103`）。
7. `reconcileF07PublishedPlan({plan,bindings,results,documents:active,verifiedSources:sourceRefsOf,caseId,recordedAt})` 逐条核对 Check×target×object×subject + Run 原件版本（`:104-110`）。
8. 统计 compliant/non-compliant/pending/failed（`:113-117`）。
9. `planFingerprint=fingerprintOf(plan.fingerprint,ruleIds)`（`:119`）；构造 `ReviewRunV2`（`:120-162`）：`id='run-tpl-'+Date.now().toString(36)+'-'+sha256(planFingerprint+executedAt).slice(0,8)`；`inputManifest.hash=computeRunInputHash(caseV2,observations,evidenceLinks)`（T05 新鲜度判定复用，`:126-131`）；`policyVersions/documentVersions/observationIds/evidenceLinkIds/effectiveRuleIds/effectiveRuleSetHash/planFingerprint`；`status='partially-completed'` 当 pending>0 或 failed>0 或 `reconciled.blockers` 非空（`:145`）；单 checkpoint `template-rule-plan`；diagnostics 含规则数/指纹/`业务判断日：未指定（带有效期规则将保持待确认）`/覆盖阻断（`:153-158`）。
10. `saveRunV2(run)`（`:163`）；返回 `{runId,planFingerprint,inputHash,checks,status,ruleIds}`（`:164-167`）。

`latestTemplateRuleRun`（`:171-174`）：`listRunsV2(caseId)` 过滤 `run-tpl-` 前缀取最后一条。

## 4. 调用者与调用链

入向（冻结树 grep）：

- IPC：`review-ipc.ts:965-977` 注册 `TEMPLATE_RULE_RUN_V3` handler（`assertC0ReviewMainSender` 于 `:968`，入参校验后 `require('./review-v3-main-template-run')` 并调 `runTemplateRuleReview`）。
- preload：`apps/electron/src/preload/index.ts:4940`（`runTemplateRuleReview`）。
- 渲染层：`ReviewV3TemplateRuleRun.tsx:39`、`ReviewV3UnifiedRun.tsx:93`、`ReviewV3T08SuggestionReview.tsx:84`、`ReviewV3T03FactWorkbench.tsx:86`。
- `latestTemplateRuleRun`：**无调用者**（全树 grep 0 命中，含测试）。
- 测试：本批无 `template-run.test.ts`；`review-v3-main-template-plan-bridge.test.ts` 覆盖其编译上游。

出向：`case-store-v2.ts`（`CommandValidationError`/`readAggregate`）、`template-store.ts`（`getTemplate`）、`run-store-v2.ts`（`saveRunV2`/`listRunsV2`）、`run-service-v2.ts`（`computeRunInputHash`）、`review-v3-main-template-plan-bridge.ts:22,83`、`review-v3-t04-rules-scoring.ts:23`（`evaluateT04Plan`）、`review-v3-f07-plan-coverage.ts:24`（`reconcileF07PublishedPlan`）。

## 5. 数据 I/O、读写与副作用

- 读：案卷聚合、模板库、原件来源引用。
- 写：**一条** `ReviewRunV2`（`saveRunV2`，`:163`）；不改案卷、不写计划存储（计划只冻结进 Run `inputManifest`）。
- 副作用：无 IPC 自身（经 review-ipc handler 暴露）；无网络。
- 幂等/原子性：每次调用新建 Run（`run-tpl-<时间>-<hash8>`）；同案卷可多次运行（补件后），历史 Run 不改写（`:60-61`）。

## 6. 分支、失败、取消与恢复

| 拒绝（`CommandValidationError`） | 触发 | 行 |
| --- | --- | --- |
| `NOT_FOUND: 案卷不存在` | 无聚合 | 70 |
| `AGENT_DECISION_DISABLED: D2 技术预审案卷…` | d2RuntimePlan 存在 | 72 |
| `DEPENDENCY_UNRESOLVED: 模板不存在` | 缺模板 | 77 |
| `INVALID_TRANSITION: 只有已发布模板…` | 非 published | 79 |
| `DEPENDENCY_UNRESOLVED: 模板规则尚不能编译…` | unresolved 非空 | 87-88 |
| `DEPENDENCY_UNRESOLVED: 已发布模板尚无可执行检查…` | 空 bindings | 92 |
| `DEPENDENCY_UNRESOLVED: T04 实际检查数量与冻结计划不一致` | 数量不符 | 102 |

- 失败后状态：全部在 `saveRunV2` 前抛出，零 Run 写入。
- 取消/恢复：同步函数无取消；恢复=补数据/改模板后重跑（新 Run）。

## 7. 权限与权威状态

- 模板必须真实已发布（`:78-80`）；来源引用只来自有效未忽略原件（`:38-48`）。
- actor 缺省 `local-reviewer`（`:26`），可由 `initiatedBy` 覆盖（`:161`）——渲染层经 IPC 不传 actor（`review-ipc.ts:972-975` 只传 caseId/phase）。
- `asOfDate` 由调用方显式给，缺省不偷用机器时间（`:66`；diagnostics 明示 `:156`）。

## 8. 修改影响面

- 改返回形状影响 preload（`:4940`）与 4 个渲染组件。
- 改 `ReviewRunV2` 组装影响 T05 新鲜度判定（`inputManifest.hash` 复用权威算法，`:126`）与台账展示。
- 改拒绝语义影响 UI 错误映射。

## 9. 测试证据

本批**无专属测试**（scope 未含 `review-v3-main-template-run.test.ts`）。间接：`review-v3-main-template-plan-bridge.test.ts`（11 例覆盖编译上游与 RUN-33/34/37/40 语义）；IPC 入口在 `review-ipc.ts` 有独立测试文件（非本批）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（静态判断）：`runTemplateRuleReview` 的 Run 组装/统计/status 分支、`latestTemplateRuleReview` 全函数无自动化断言。维护者验证：经 `TEMPLATE_RULE_RUN_V3` 对已发布模板案卷发起，检查 `run-tpl-*` Run 与 `inputManifest`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| D2 案卷禁用正式规则 | 已证实 | `:71-73` |
| 非发布模板拒绝 | 已证实 | `:78-80` |
| unresolved 拒绝/空 bindings 拒绝 | 已证实 | `:86-93` |
| 每次新 Run、历史不改写 | 已证实 | `:60-61,121,163` |
| `latestTemplateRuleRun` 无调用者 | 已证实（检索：冻结树 `apps`+`packages` 全部 `*.ts`/`*.tsx`） | grep 0 命中 |
| IPC 生产接线（TEMPLATE_RULE_RUN_V3） | 已证实 | `review-ipc.ts:965-977`；preload `:4940` |
| Run 组装细节的运行行为 | 未知 | 无测试 |
| F07/T04 内部 | 未知（文件外） | 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `runTemplateRuleReview` 全流程 | §3 | 62-168 | covered |
| `latestTemplateRuleRun` | §3 | 171-174 | covered |
| 拒绝分支 | §6 | 70-102 | covered |
| 权限/asOfDate | §7 | 26,66,78-80 | covered |
| IPC/渲染调用链 | §4 | 检索记录 | covered（范围已声明） |
| 运行断言 | §9 | — | unknown |
