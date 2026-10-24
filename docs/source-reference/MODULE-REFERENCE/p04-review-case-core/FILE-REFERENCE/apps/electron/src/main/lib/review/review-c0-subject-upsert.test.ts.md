---
path: apps/electron/src/main/lib/review/review-c0-subject-upsert.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab47705f38e3ecdfa9be897b803fabf2ddaa65a5
sha256: 757ae46cd2deb7cfa7e42c01461daa79d3adb5199a434eff600e12d744909a26
lines: 145
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-c0-subject-upsert.test.ts

## 1. 测试目标

B1 返修目标（文件头 :1-4）：导入草案的「补录必需分项」必须经 Main C0 授权命令落盘，且与普通建案/提交共用同一份**已发布**模板校验。被测入口 `review-c0-case-service.upsertCaseSubjectC0`（:18）+ 应用层 `upsertCaseSubject/updateFields/createCaseFromTemplate` + `stage-workflow.submitCaseV2` + `material-service.registerMaterial`（真实材料事务）。

## 2. 用例清单

4 用例 / 1 describe（`导入草案补录必需分项（C0 真实写入路径）`，:66）。夹具与 mock 边界：
- 隔离 `mkdtempSync(join(tmpdir(),'c0subject-'))` + `PROFER_CONFIG_DIR`（:11-13，`afterAll` rmSync）。
- describe 体顶部即执行 `saveDraft(template); publishTemplate(template.templateId, 1)`（:67-68）——**模板先发布**，4 用例共享。
- `template`（:37-51）：`amount:number`（case 域必填）、`projectName:text`（subject 域必填）；分项 `decl`（required，含 criterion `c1`）。
- `addEvidenceMaterial`（:23-33）：真实 `registerMaterial`（写真实源文件 `evidence-{caseId}.txt` 并登记 `role:'evidence'`），注释明示「提交审核要求至少一份已登记原件；用真实材料事务登记，不手写聚合」。
- `authorized()`（:54-64）手工构造 `AuthorizedCaseCommand`（**绕过绑定层**，同 field-kind 测试的局限）。

| # | 用例 | 行 | 场景 |
| --- | --- | --- | --- |
| 1 | 缺必填字段与必需分项的入库草案 → Main 补录 → 同案可提交且持久化 | 70-99 | `allowIncompleteIntake:true` 建案 |
| 2 | 已提交案卷补录分项 → 拒绝（不绕过阶段门禁） | 101-117 | 提交后补录 |
| 3 | 越权 scope（仅 UPDATE_FIELDS_V2）→ C0 授权拒绝 | 119-129 | action 与命令不符 |
| 4 | 缺必填事项字段 → 拒绝且不落半条事项 | 131-144 | 直调 `upsertCaseSubject` |

## 3. 真实断言

- 用例 1：`created.ok` true（:75）；`filled.ok` true（:84，先补 `amount:5000`）；`added.ok` true（:90）；**重新读盘** `persisted.caseV2.subjects` 长度 1、`subjects[0].sectionId === 'decl'`、`subjects[0].fields.projectName` `toEqual({ kind:'text', value:'数学建模' })`（:92-95，验证落盘非仅返回值）；`submitCaseV2` ok 且 `stage === 'submitted'`（:96-98）。
- 用例 2：`submitted.ok` true（:109）；补录 `rejected.ok` false（:115）；`rejected.message` 含 `'仅草案阶段'`（:116）。
- 用例 3：`upsertCaseSubjectC0` 同步 `toThrow('CASE_SCOPE_FORBIDDEN')`（:125-128）。
- 用例 4：`rejected.ok` false、`message` 含 `'项目名称'`（:141-142，必填字段 label）；`readAggregate(...).caseV2.subjects` 长度 0（:143，无半条写入）。

## 4. 未覆盖与脆弱点

- 未覆盖：`upsertCaseSubjectC0` 的 `NOT_FOUND`（聚合缺失）/`DEPENDENCY_UNRESOLVED`（模板未发布）分支、`correctObservationC0`/`setEvidenceLinkC0`、enum/类型非法值、`subjectId` 更新（existing）分支、绑定层校验（绕过）。
- 脆弱点：`authorized()` 自造 payloadHash（`'UpsertCaseSubject'`）与真实绑定层一致性无断言；`as never` 绕过类型（:89/:114/:127）；describe 体副作用（saveDraft/publish 在收集阶段执行）依赖 Bun 语义；用例 4 走应用层直调而非 C0 入口（有意为之：隔离必填校验）。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言/夹具如 §2-3 | 已证实 | 本文件逐行 |
| 补录走真实材料/提交事务（非手写聚合） | 已证实 | :23-33/:96-98 |
| 持久化断言基于重新 `readAggregate` | 已证实 | :92-95 |
| 模板未发布分支无用例 | 已证实（否定） | 本文件 + 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 补录持久化 + 提交链路 | §3 | 90-98 | covered |
| 阶段门禁（仅草案） | §3 | 115-116 | covered |
| C0 scope 授权拒绝 | §3 | 125-128 | covered |
| 必填拒绝无半写 | §3 | 141-143 | covered |
| NOT_FOUND/DEPENDENCY_UNRESOLVED/existing 更新 | §4 | — | unknown（未测） |
