---
path: apps/electron/src/main/lib/review/native-workspace-case-v3.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6b45748708fb8fc62eac36681a29baf47e44185
sha256: f763d5ffd40e8e4db791e3f5a94c0a26138b077712549e9601be5350025f51da
lines: 325
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/native-workspace-case-v3.test.ts

## 1. 测试目标

C1“native-first 单一案卷写者 + V1 只读兼容”回归（describe 名 `:21`）：验证原生建案只写 V2 聚合+回执（无 `case.json`/`case.v2.json` 影子）、Main 撤销在各提交点 fail-closed、候选/自定义模板不被静默发布为官方政策、手写规则与主体文档钉选持久化、既有事项可 CAS 更正、畸形 draft 隔离、未知领域失败关闭、人工建项的来源/幂等/伪造拒绝、file 级与无几何块的诚实锚点。

被测函数：`native-workspace-case-v3.ts` 的 `createNativeWorkspaceCaseV3`、`updateNativeWorkspaceSettingsV3`、`registerNativeWorkspaceMaterialV3`、`removeNativeWorkspaceDocumentsV3`、`nativeWorkspaceProjectionV3`、`updateNativeWorkspaceReviewItemV3`、`createNativeReviewItemV3`；辅助 `case-store-v2.{listAggregatesV2,readAggregate,writeAggregate}`、`case-store.{getCase,getReviewCasesDir,listCases,saveCase}`、`demo-fixtures.buildDemoCase`。

夹具（`:12-19`）：`PROFER_CONFIG_DIR` 指向仓库 `work/tmp/native-workspace-c1-<时间戳>`（非 mkdtemp），`afterAll` 删除；actor 固定 `local-reviewer`；input 为综合测评/2026 学年。测试内多处直接 `writeAggregate` 注入合成数据（明确注释“仅用于演练既有 subject/解析变体，不代表抽取已就绪”，`:136-137`、`:307`）。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**11 个 test**：

| # | test 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- |
| 1 | `:22-37` | 建案 | `receiptLog==['CreateNativeWorkspaceCaseV3']`、`stage==='draft'`、`readAggregate`/`getCase`/`listCases` 可读、`case.json`/`case.v2.json` **不存在**、`saveCase` 覆写抛“原生审核案卷禁止”、聚合字节不变 |
| 2 | `:39-45` | 建案 + 注入 `authorizeAtCommit` 抛 `MAIN_REVOKED_BEFORE_CREATE_COMMIT` | rejects 且 `listAggregatesV2` 前后一致（无新案卷） |
| 3 | `:47-75` | 建案后：设置/材料/归档各注入撤销 | 三次 rejects、每次聚合字节不变；成功登记后 `getCase.documents` 含该 id；归档后 documents 空、`sourceValidityRevocations` 含首版本、`case.json` 仍不存在 |
| 4 | `:77-86` | 自定义领域建案 | `templateId==='pending-template-v3'`、`templateVersion===0`、`canonicalPlan` undefined、view 无 `reviewTemplate`、`view.type==='自定义审核'` |
| 5 | `:87-128` | 登记 application 材料后保存 manualRules+subjectDocumentIds | 规则/主体投影持久化；`nativeWorkspaceDraft` 存 versionId 钉选；`reviewRules`/`canonicalPlan` undefined；回执序列 `Create/RegisterMaterial/Update`；重复 subjectIds 抛“重复”、重复规则 id 抛“无效”、跨案文档抛“待审主体材料”；revision=2；归档后投影 `subjectDocumentIds===[]` 但 draft 钉选不变 |
| 6 | `:130-179` | 注入合成 subject（sourceRefs 指向真文档）后更正 | `items[0]` 匹配 `{title:'Applicant corrected title', declaredScore:4, status:'confirmed', identifiedBy:'manual'}`；`anchor.documentId` 正确；存储 `declaredScore=={kind:'number',value:4}`；末回执 `CorrectNativeWorkspaceReviewItemV3`；撤销提交不落盘；篡改 `sourceRefs.caseId='wrong-case'` 后 `getCase.items===[]`、更正抛“未绑定当前可追溯原件” |
| 7 | `:181-195` | 把 `nativeWorkspaceDraft.manualRules` 改成字符串 | `getCase` undefined、`listCases` 无此案、字节不变、`case.json` 不存在、设置抛“不是原生工作台案卷”、字节仍不变 |
| 8 | `:196-201` | `domainPackId:'unknown-campus-authority'` 建案 | rejects“未知审核领域”且案卷列表不变 |
| 9 | `:203-273` | 人工建项全链 | 见 §3 |
| 10 | `:275-295` | 不选块的人工声明 | `anchor=={documentId, precision:'document'}`、无 `blockId`、`sourceRefs[0].location=={kind:'file'}` |
| 11 | `:297-323` | 块 `location` 置 undefined 后建项 | 锚点 `{documentId, blockId, precision:'block'}`、`location=={kind:'file'}`、`fields.nativeSourceBlockId=={kind:'text',value:blockId}`、`decisions` 空 |

## 3. 真实断言

用例 9（`:203-273`）细目：

- 建项后 `items` 长度 1、`{title:'Human declared project', declaredScore:2.5, identifiedBy:'manual', status:'identified', anchor:{documentId,blockId,precision:'block'}}`（`:220-226`）。
- 存储侧 `sourceRefs` 精确等于 `{caseId, documentVersionId, parseRevision, location: 块 location ?? {kind:'file'}}`（`:229-233`）；`observations`/`decisions` 均空（`:235-236`）。
- 幂等：同 command 重放 → items id 不变、revision 不变、`receiptLog` 长度不变（`:237-240`）。
- 异载荷（`declaredScore:99`）同 requestId → rejects“已被不同载荷使用”（`:242-243`；来自 `case-store-v2.ts:228`）。
- 跨案 `documentVersionId` → rejects“本案当前有效”（`:244-248`）；伪造 `sourceBlockId:'renderer-forged-block'` → rejects“解析块不属于”（`:249-253`）；过期 `expectedRevision` → rejects“案卷已被其他操作更新”（`:254-256`；`case-store-v2.ts:233`）。
- `authorizeAtCommit` 抛 `MAIN_SESSION_REVOKED` → rejects 且聚合字节不变（`:257-262`）。
- 归档源文档后：`subjects[0].sourceRefs[0].documentVersionId` 仍是旧版本（不改写历史）、`getCase.items` 长度 0（“no current source, not false approval”）、对已归档源建项 rejects“本案当前有效”（`:265-272`）。

其余用例的关键精确断言：#1 的 `existsSync(case.json)===false`（`:30`）与 `JSON.stringify` 字节级不变（`:36`、`:54`、`:61` 等多处）；#5 的 `registeredVersionId` 与 `subjectDocumentVersionIds` 一致（`:101-104`）；#6 的 `correction→identifiedBy:'manual'` 映射。

## 4. 未覆盖与脆弱点

**未覆盖**：

- `reorderNativeWorkspaceDocumentsV3`（无用例）。
- `removeNativeWorkspaceDocumentsV3` 的“清单数量不匹配/角色不匹配”拒绝分支。
- `updateNativeWorkspaceSettingsV3` 的 `reviewTemplate` 显式绑定/`resolvedTemplate` 未发布模板拒绝、`manualRules` 上限 100、字段长度上限（160/8000）。
- `createNativeWorkspaceCaseV3` 的 `title` 空串回退“未命名案卷”、`applicant` 空格、`type` 非法分支。
- `registerNativeWorkspaceMaterialV3` 的 `options.fileName/replacesVersionIds` 透传。
- 投影的 `importedAt` 回执启发式、`rulePacks`/`evidences` 形状、attachment 过滤的直接断言（经 `getCase.items` 间接）。
- 学年由 `native-case-academic-year.test.ts` 覆盖（不在本文件）。

**脆弱点**：

- 多用例直接 `writeAggregate` 注入合成 subject/损坏 draft（`:149`、`:186`、`:308`）：若 `writeAggregate` 校验收紧，用例会先失败，掩盖被测行为。
- 大量断言中文错误文案子串（“已被不同载荷使用”“本案当前有效”等），文案改动即红。
- #3 与 #9 的“字节不变”用 `JSON.stringify` 全量比较，聚合内时间戳/顺序变化都会触发；本身是强断言但容错低。
- 目录用 `work/tmp` + `Date.now()`（`:12`）而非 mkdtemp：并发跑同文件可能互踩（推断）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、11 test | 已证实 | `:21`；`grep -c test(`=11 |
| 原生建案不建 V1 影子 | 已证实 | `:30-31`、`:74`、`:111`、`:191`、`:263` |
| Main 撤销在建/设置/材料/归档/建项各提交点 fail-closed | 已证实 | `:39-45`、`:47-75`、`:163-168`、`:257-262` |
| 同 requestId 幂等、异载荷碰撞、revision 冲突分别拒绝 | 已证实 | `:237-256` |
| 畸形 draft 隔离不自动修复 | 已证实 | `:181-195` |
| 锚点不编造：无块→document 级、无几何→保 blockId | 已证实 | `:275-295`、`:297-323` |
| 归档不改写历史 sourceRefs、不伪造通过 | 已证实 | `:265-268` |
| 合成注入仅演练用 | 已证实 | `:136-137`、`:307` 注释 |
| `work/tmp` 目录并发安全性 | 推断 | `:12` 构造方式 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源函数/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `createNativeWorkspaceCaseV3` | #1/#2/#4/#8 | `:22-86`、`:196-201` | covered |
| `updateNativeWorkspaceSettingsV3` | #5/#7 | `:87-128`、`:181-195` | covered |
| `registerNativeWorkspaceMaterialV3` | #3/#5/#9 | `:47-75` 等 | covered |
| `removeNativeWorkspaceDocumentsV3` | #3/#5/#9 | 同上 | covered |
| `nativeWorkspaceProjectionV3` | #1/#5/#6/#10/#11 | 多处 | covered |
| `updateNativeWorkspaceReviewItemV3` | #6 | `:130-179` | covered |
| `createNativeReviewItemV3` | #9/#10/#11 | `:203-323` | covered |
| `reorderNativeWorkspaceDocumentsV3` | — | — | unknown（无用例） |
| 模板绑定/上限校验分支 | — | — | unknown |
