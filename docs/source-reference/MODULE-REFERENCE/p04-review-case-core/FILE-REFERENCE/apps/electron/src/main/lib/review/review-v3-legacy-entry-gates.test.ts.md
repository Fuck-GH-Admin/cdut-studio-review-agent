---
path: apps/electron/src/main/lib/review/review-v3-legacy-entry-gates.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c3c3687ce17c7267ca5286c97ea4bdd502fa8dd7
sha256: da696f5b7bc77d31902b11c728c095f96cf7231c60e55a6786a8e13b8402a23b
lines: 716
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-legacy-entry-gates.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

C1 legacy 兼容边界（文件头 `apps/electron/src/main/lib/review/review-v3-legacy-entry-gates.test.ts:1-4`）：既有 Renderer 契约存活，但**永远不提供**覆写原生 V2 案卷或冻结 Plan 的权威。覆盖：伪造窗口/子框架拒绝、CREATE_CASE 现走原生持久案卷+回执、标题/设置单 CAS、legacy 影子与原生 V2 冲突不可变、损坏聚合不回退可写 legacy、DELETE 软归档且历史回执保留、纯 V1 草稿仍可删、malformed V2 形状不暴露影子、冻结 Plan 禁止设置升级、归档周期内重放/跨周期恢复、RESTORE 的 Main Actor/回执/失败关闭、坏 summary 不掩盖有效案卷、材料流只提交 V2 回执+伪造 Main 不能登记、真实多页 PDF/DOCX 登记与原件字节、旧 AI/规则/报告钩子不造假成功、手动事项消费真实 V2 来源、无发布模板可建草稿。

## 2. 用例清单

共 18 个 `test(`（`review-v3-legacy-entry-gates.test.ts:101-715`，单一 `describe`）。夹具（`:17-31`）：`PROFER_CONFIG_DIR` 临时根；测试钩子 `ipcMainHandlers` + `invoke()`；fake `sender{id:207}`/`frame{id:1}`；`legacy(id)` 用 `buildDemoCase` 构造 V1；`buildMinimalPdf`（`:39-65`，手写合法多页 PDF+xref）与 `buildReviewDocx`（`:68-99`，JSZip OOXML：Heading1 样式避免 mammoth partial）。

| # | 用例（行） | 关键断言 |
| --- | --- | --- |
| 1 | legacy CREATE_CASE rejects forged window and subframe without V1/V2 write（`:102`） | 伪造 sender/换 senderFrame → `SENDER_UNTRUSTED` ×2；`case-*` 目录 `toEqual([])` |
| 2 | existing CREATE_CASE UI channel now creates native-only durable Case + receipt（`:116`） | `stage:'draft'`；`receiptLog` 长度 1 且 `{type:'CreateNativeWorkspaceCaseV3',revision:0,actor:local-reviewer}`；`case.json`/`case.v2.json` 均不存在；`listCases` 含条目；`MIGRATE_CASE_V2` 返回 `migrated:true` 但仍不写 `case.v2.json`；`ensureWorkspaceAggregateV2` revision 0、回执仍 1 |
| 3 | native-first workbench title and type updates use one V2 CAS receipt, no V1 writer（`:143`） | 更新后 revision 1、回执类型序列 `['CreateNativeWorkspaceCaseV3','UpdateNativeWorkspaceSettingsV3']`；`manualRules` 写入 `nativeWorkspaceDraft`、`canonicalPlan` 未定义、revision 2；非法规则 `'../invalid'` → `手写规则无效` 且聚合不变；DELETE→RESTORE 后标题保留 |
| 4 | native V2 colliding with a legacy shadow is immutable through low-level V1 updateCase（`:183`） | `getCase`/`listCases`/`GET_CASE`/`LIST_CASES` 不暴露影子；`LIST_CASES_V2`/`listAggregatesV2` 暴露；`saveCase`/`updateCase`/`UPDATE_CASE_SETTINGS` 均 `原生审核案卷禁止` 且 V1/V2 字节不变 |
| 5 | corrupt native aggregate does not silently fall back to writable legacy case.json（`:222`） | `state.v2.json` 为坏 JSON 时 `getCase` 仍 `undefined`；`saveCase`/`updateCase` 仍 `原生审核案卷禁止`；影子字节不变 |
| 6 | old DELETE_CASE soft-archives native and migrated V2 without destroying historical receipts（`:239`） | `stage:'archived'`、`caseArchive.previousStage` 保留、回执 +1 且 `ArchiveReviewCaseV3`；重复 DELETE 字节不变（幂等）；`deleteCase` → `禁止通过旧版删除入口`；迁移案卷同样；伪造 frame DELETE → `SENDER_UNTRUSTED` |
| 7 | pure V1-only draft can still be deleted through its existing UI command（`:280`） | 纯 V1 DELETE 后 `getCase`/`readAggregate` 均 `undefined` |
| 8 | valid JSON missing V2 shape cannot expose V1 shadow, archive or remove files（`:290`） | `state.v2.json='{}'` 时 `DELETE_CASE` → `V2 状态损坏`；影子/state 字节不变 |
| 9 | frozen CanonicalPlan forbids legacy settings upgrade before either file changes（`:307`） | `UPDATE_CASE_SETTINGS` → `审核计划已冻结`；V1/V2 快照不变 |
| 10 | existing migrated legacy case can still edit ordinary title and project it to V2（`:327`） | 普通 `saveCase` 编辑不抛；`UPDATE_CASE_SETTINGS` 标题更新且 V2 title 同步、revision 增加 |
| 11 | legacy DELETE_CASE replays only within one archive cycle; restore enables a fresh archive（`:341`） | 归档→重复 DELETE 幂等；RESTORE→`stage:'draft'`；伪造 frame 不消耗新周期；第二次 DELETE revision=`createRevision+3`、`ArchiveReviewCaseV3` 计 2、requestId 不同、`caseArchiveHistory` 长度 1；第三周期 revision+5、计 3、历史 2、requestId 三异 |
| 12 | RESTORE_CASE_V3 derives Main Actor and receipt; stale, forged and cross-cycle requests fail closed（`:403`） | 陈旧 revision → `VERSION_CONFLICT`；伪造 actor/requestId → `ACTOR_UNTRUSTED` ×2；伪造 frame → `SENDER_UNTRUSTED`；成功回执 `{type:'RestoreReviewCaseV3',actor:'local-reviewer'}`、`previousStage:'decided'`、revision+1；重放幂等；第二周期 requestId 不同 |
| 13 | one malformed native summary cannot hide valid archived Cases or forge cross-case IDs（`:453`） | 坏 summary/跨目录 summary 不出现在 `listAggregatesV2`/`LIST_CASES_V2`；有效案卷保留 `{stage:'archived',revision+1}` |
| 14 | native-first legacy workbench material flow commits only V2 receipts; spoofed Main cannot register（`:481`） | 伪造 frame 导入拒绝且聚合不变；`REGISTER_MATERIAL_PATH_V2` 返回 versionId（ASSET-05）、`RegisterMaterial` 回执；再伪造仍拒；`IMPORT_DOCUMENT_FROM_PATH` 登记 B；active 文档 2、回执序列三型；原件字节读回一致、`case.json` 不存在；`REORDER_DOCUMENTS`/`REMOVE_DOCUMENTS` → `ReorderNativeWorkspaceDocumentsV3`/`ArchiveNativeWorkspaceDocumentsV3`、`active:false`、`sourceValidityRevocations` 含停用版本 |
| 15 | native drag-drop path import registers a real multi-page PDF and DOCX with readable originals（`:555`） | 手写 3 页 PDF：blocks ≥3、三页文本层全在、`parseStatus:'parsed'`；案卷内副本字节 `Buffer.compare===0`、`byteHash` 等于源 sha256；DOCX：`format:'heading'` 文本、`table-cell` 两值、`parsed`、字节一致；重开后两文档与原件都在 |
| 16 | native Main old AI/rule/report hooks do not create a fake V1 success or policy（`:616`） | `GENERATE_RULE_OUTLINE`→`NATIVE_OUTLINE_STAGING_REQUIRED`；`EXTRACT_ITEMS`→`NATIVE_SUBJECT_STAGING_REQUIRED`；`UPDATE_RULE_OUTLINE`→`NATIVE_RULE_OUTLINE_SOURCE_REQUIRED`；`CONFIRM_RULE_PACK`→`NATIVE_RULE_CONFIRMATION_REQUIRED`；`RUN_REVIEW`→`NATIVE_C2_RUN_REQUIRED`；`EXPORT_REPORT`→`NATIVE_C2_REPORT_REQUIRED`；聚合不变 |
| 17 | trusted Main manual item IPC consumes real V2 source; forged identity/frame fail without a new receipt（`:642`） | 伪造 actor/`sourceIdentity` → `ACTOR_UNTRUSTED` ×2、伪造 frame → `SENDER_UNTRUSTED` 且聚合不变；成功 `CreateNativeReviewItemV3` 回执 actor `local-reviewer`、item 锚定文档；同 requestId 重放幂等（同 id、revision/回执数不变） |
| 18 | new native draft can be created without any published template; explicit null never auto-installs a mapped policy（`:693`） | `reviewTemplate:null` → `templateId:'pending-template-v3'`、`templateVersion:0`、无 `canonicalPlan`/`d2RuntimePlan`、`reviewTemplate` 未定义、回执仅 `CreateNativeWorkspaceCaseV3` |

## 3. 真实断言（抽样）

- 零写入：`expect(readdirSync(before).filter(n=>n.startsWith('case-'))).toEqual([])`（`:113`）；多处 `JSON.stringify(readAggregate(...))` 前后相等（`:178,250,275,297,324,368,533,668`）。
- 回执序列：`receiptLog.map(r=>r.type)` `toEqual([...])`（`:152-153,545-546,607-609,707-709`）。
- 真实 PDF/DOCX：`Buffer.compare(stored,source)===0` + sha256 相等（`:583-584`）；`blocks.length>=3` 且三页文本 `toContain`（`:574-578`）。
- 失败码：`SENDER_UNTRUSTED`/`ACTOR_UNTRUSTED`/`VERSION_CONFLICT`/`原生审核案卷禁止`/`V2 状态损坏`/`审核计划已冻结`/`手写规则无效`/`禁止通过旧版删除入口`/六个 `NATIVE_*_REQUIRED`。

夹具/mock 边界：Electron IPC 用测试钩子 Map + `registerReviewIpc` 真实注册；案卷/材料/解析为**真实实现**（case-store/case-store-v2/workspace-service-v2/case-lifecycle-v3 + 真实 pdfjs/mammoth 解析链）；PDF/DOCX 字节由测试现场构造（无第三方生成器，`:34-38,67`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`SOURCE_CAPABILITY_REQUIRED` 旧行为已被**有意更新**为真实登记（测试内注释 `:498-502` 自述“旧断言…已过期；这里改为断言新的真实行为”——照实记录的断言迁移）；并发 IPC、`state.v2.json` 其它损坏形态、PDF 加密/图片层。
- 脆弱点：错误文案全为中文子串匹配；PDF 断言依赖 pdfjs 解析行为（`:37` 注释自述兼容）；DOCX 依赖 mammoth 样式告警语义（`:82`）；多用例共享 `root` 依赖执行顺序（案卷 ID 均唯一）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 个用例 | 已证实 | `grep test(`；`:102-693` |
| 旧 UI 契约存活但无覆写权威 | 已证实 | 用例 4/5/9 全拒绝 |
| 原生 V2 只经 CAS 回执写入 | 已证实 | 用例 2/3/14 回执序列 |
| 归档/恢复周期语义 | 已证实 | 用例 11/12 |
| 真实 PDF/DOCX 登记+原件字节 | 已证实 | 用例 15 |
| 旧 AI/报告钩子 fail-closed | 已证实 | 用例 16 |
| 断言迁移（SOURCE_CAPABILITY_REQUIRED→真实登记） | 已证实（测试内注释） | `:498-502` |
| 并发/加密 PDF | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 伪造 sender/frame | 1,6,11,12,14,17 | 102-688 | covered |
| CREATE_CASE 原生化 | 2 | 116-141 | covered |
| 设置 CAS/manualRules | 3 | 143-181 | covered |
| 影子不可变 | 4,5 | 183-237 | covered |
| DELETE/归档/幂等 | 6,7,8,11 | 239-278,280-288,290-305,341-400 | covered |
| 冻结 Plan 拒设置 | 9 | 307-325 | covered |
| 标题投影 | 10 | 327-339 | covered |
| RESTORE 契约 | 12 | 403-450 | covered |
| summary 隔离 | 13 | 453-478 | covered |
| 材料流/重排/停用 | 14 | 481-553 | covered |
| 真实 PDF/DOCX | 15 | 555-614 | covered |
| 旧钩子拒绝 | 16 | 616-640 | covered |
| 手动事项+幂等 | 17 | 642-691 | covered |
| 无模板草稿 | 18 | 693-714 | covered |
| 并发/加密材料 | 无 | — | unknown |
