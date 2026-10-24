---
path: apps/electron/src/main/lib/review/workspace-service-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b5943998faaa9d640a3ada805ba573ccdd7040e
sha256: a5d3d71f90a3bb36a96a0535879b669de069927dfad1cc05f055723863a81013
lines: 284
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/workspace-service-v2.test.ts

## 1. 测试目标

“单一工作台案卷映射到 V2 聚合”回归（describe `:22`）：首次建立同 caseId 聚合与投影、同步保留人工事实/回执/已读状态/确认关联、V2-only 材料存活、模板+手写规则投影、旧版空规则综测模板升级、材料移除的关联清理、重排同序、规则编译联动、原生案卷压制陈旧 V1 投影、归档级联撤效。

被测：`workspace-service-v2.{ensureWorkspaceAggregateV2,syncWorkspaceProjectionV2}`；协作 `case-store.{getCase,saveCase}`、`builtin-templates.ensureBuiltinTemplateDrafts`、`template-store`、`case-store-v2.{createAggregate,readAggregate}`、`application-service.{correctObservation,setEvidenceLink}`、`workspace-business-service-v2.acknowledgeWorkspaceMaterialV2`、`case-import.{removeDocumentsFromCase,reorderDocumentsInCase}`、`material-service.registerMaterial`。

夹具（`:16-20`）：`PROFER_CONFIG_DIR` = 仓库 `work/tmp/profer-test-workspace-v2-<时间戳>`，`afterAll` 删除；`reviewer` actor；V1 案卷用 `buildDemoCase()`（`demo-fixtures`）。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**11 个 test**：

| # | test 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- |
| 1 | `:23-35` | saveCase(demo) → `ensureWorkspaceAggregateV2` | `caseV2.id===legacy.id`；subjects/documents 数量与 V1 相等；`sourceRefs[0]=={caseId:legacy.id, documentVersionId:'${anchor.documentId}-v1'}`；首回执 `actor.actorSource==='system'` |
| 2 | `:37-57` | `correctObservation`（level=“人工确认等级”）后改 V1 title 再 `sync` | subjects[0].title 更新；observation 文本值仍在；`CorrectObservation` 回执仍在 |
| 3 | `:59-79` | `registerMaterial`（workbench-only-proof.html、slot award-proof）后 sync | 该 versionId 文档存在且 `{fileName:'workbench-only-proof.html', parseStatus:'parsed', active:true}`；仅 1 份 |
| 4 | `:81-99` | 选 `scholarship-v2` 模板 + manualRules 保存 V1 后 ensure/sync | `templateId/Version` 匹配所选模板；`reviewRules` 含 `manual:${id}:local-rule-1` 且有 `sourceRefIds` 以 `-v1` 结尾；sync 后仍一致 |
| 5 | `:101-117` | 造 `comprehensive-assessment-v2@2` 空规则模板（sections 空）并发布，案卷绑定后 ensure | `getCase.reviewTemplate` 变为 v3；聚合 templateId/Version 为 v3；subjects 数量不变 |
| 6 | `:119-158` | `acknowledgeWorkspaceMaterialV2(read)` + `setEvidenceLink` 候选/确认后加新材料 sync | `manualReadReceipt=={actorId, reason:'已核对申报材料'}`；sync 后 `usage==='read'`、link `status==='confirmed'`、`AcknowledgeWorkspaceMaterial`/`SetEvidenceLink` 回执在 |
| 7 | `:160-189` | 建+确认 evidence link 后 `removeDocumentsFromCase(role:evidence)` | V1：documents 无该 id、archivedDocuments 有、evidences 无、items 无引用；V2：版本 `{active:false, usage:'unread'}`、link `status==='rejected'`、回执 summary 含“同步申报输入与材料” |
| 8 | `:191-203` | `reorderDocumentsInCase`（evidence 倒序） | V1 与 V2 的 evidence 文档顺序都等于期望序 |
| 9 | `:205-220` | rulePacks 全 unconfirmed → ensure；改 confirmed → sync | unconfirmed：`reviewRules.length>0` 且全部 `manual/unconfirmed`；confirmed：全部 `confirmed`、deterministic 与 manual 都存在、`sourceRefIds[0]` 以 `-v1` 结尾 |
| 10 | `:222-247` | 先建 legacy 聚合，再造同 caseId 原生聚合 + 陈旧 V1 影子 | `saveCase` 抛“原生审核案卷禁止”；`ensure`/`sync` 均返回“Native authoritative title”、subjects 空、`receiptLog` 长度 1 |
| 11 | `:249-283` | `correctObservation` 绑旧版本后 `removeDocumentsFromCase` | 旧事实保留值/sourceRefs 但 `confirmed===false`；`sourceValidityRevocations.previouslyConfirmedObservationIds` 含旧 id；对已撤效版本 `setEvidenceLink` → `ok:false` 且 `code==='STALE_INPUT'` |

## 3. 真实断言

- #1 的 `documentVersionId` 精确等于 `${anchor.documentId}-v1`（`:33`），实证 V1→V2 版本命名契约。
- #2/#6/#7 断言人工事实/回执/关联在投影同步后**存活**（“保留人工事实与操作回执”），并断言回执类型名。
- #5 断言升级后 `getCase(legacy.id).reviewTemplate` 精确等于 v3 对象（`:113`）。
- #7 断言已确认关联被移除级联为 `rejected`（`:187`）。
- #10 断言 `receiptLog` 长度恰为 1（不追加 `EnsureReviewWorkspaceAggregate`），实证短路。
- #11 用 `expect(rejected.ok).toBeFalse()` + `code==='STALE_INPUT'` 双断言。

## 4. 未覆盖与脆弱点

**未覆盖**：同步 3 次冲突后 throw；`ensureFlights` 并发去重；指纹一致短路“不写”；模板升级的两个不满足分支（非 v2 绑定 / 新版无 criteria）；`projectedCase` 领域未映射/模板缺失 throw；`materialSlotId` 仅综测模板补槽的直接断言；`projectWorkspaceCaseV2` 导出（未直接调用）。

**脆弱点**：

- 用例依赖 `buildDemoCase()` 与内置模板（`scholarship-v2`、`comprehensive-assessment-v2@3`）的内容；模板库变化会使 #4/#5 失败。
- #5 手工 `saveDraftStored(stale)` 发布 v2 假模板，若发布校验收紧会先失败。
- 大量子串断言（中文 summary/规则 id 模板），文案/命名改动即红。
- 用例串行共享 `CONFIG_DIR`，但每例新建 demo id，未互踩（#3/#11 用固定 id）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 test、真实文件 I/O（V1 JSON + V2 聚合） | 已证实 | 夹具 `:16-18`；`saveCase/readAggregate` 调用 |
| 同 caseId 建聚合、system 回执 | 已证实 | `:28-35` |
| 原生案卷拒绝 V1 投影与 V1 影子写入 | 已证实 | `:239-246` |
| V2-only 版本存活 | 已证实 | `:75-78` |
| 归档级联撤效 + STALE_INPUT 拒绝重连 | 已证实 | `:268-282` |
| 空规则综测 v2→v3 升级 | 已证实 | `:103-116` |
| 同步重试/短路/并发去重 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `initializeAggregate` | #1 | `:23-35` | covered |
| `ensureWorkspaceAggregateV2` | #1/#4/#5/#10 | 多处 | covered |
| `syncWorkspaceProjectionV2` 全量同步 | #2/#3/#6/#7/#8/#9 | 多处 | covered |
| 短路（原生/归档） | #10 | `:222-247` | covered |
| `upgradeLegacyComprehensiveTemplateAssignment` | #5 | `:101-117` | covered（单分支） |
| 冲突重试 3 次 throw | — | — | unknown |
| `projectedCase` 材料/规则形状 | #4/#8/#9 | 多处 | covered |
| `projectWorkspaceCaseV2` | — | — | unknown |
