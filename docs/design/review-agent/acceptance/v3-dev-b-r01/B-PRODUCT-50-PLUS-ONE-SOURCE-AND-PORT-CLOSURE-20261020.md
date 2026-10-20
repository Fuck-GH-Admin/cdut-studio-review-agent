# Dev-B｜50+1 产品闭包一次性交接（C/I 接线清单）

本表是 **B-owned 产品源 + C R10 `2cb8331b8fdff43da70a894ec597820595cb4d2d`** 的机械比对，不是整分支 cherry-pick 许可。C 对 R30–R32 六旧 blob 的批准不自动覆盖新版本；此处所有新增来源统一请求 C 一次明确 source decision。Gate L 后置，本地态仅 `local-candidate / manual-review / unpublished`。

## 使用路径（B 组件现已具备）

打开 `ReviewV3CandidateIntakeSurface` → 导入来源由 C Main 调用 B2/B30 → “1 原件”分页读取每一个文件（ZIP 内每一项都计数）→ “2 匹配”展示可选和 candidate-held 的完整目录、20 秒倒计时、人工选择/无匹配 → “3 Check”查看 SourceRef/Parser/Subject/UNKNOWN → “4 来源缺口”分类、分页并提交技术观察 → “5 作者候选”已有实际材料 unmatched 时从 B29 全量生成 51st；**即使 Main 未装也能创建无原件绑定的空白候选**, 填字段/对象/Check/条件，导出 JSON。接入 C 作者服务后继续真实保存/技术试跑/修订/冻结/两次读取重开。不存在自动 School Publisher 或 Business Writer。

人工观察三状态严格区分：未提交；等待 C Main 确认；仅在 `B32RemediationReceipt` 与 issue/currentSnapshot 完全匹配且 `persisted:true` 时展示“已持久化”。旧 `Promise<void>` 回调**不再**冒充已保存；没有回执时显示“持久化未确认”，UNKNOWN/Gold 不自动消失。

## C R10 缺失的 B-owned 生产 source blobs（列出的 imports 为直接本地依赖）

所有路径分别以 `apps/electron/src/main/lib/review/`（M）或 `apps/electron/src/renderer/components/review-v3-dev-b/`（U）为前缀。**这些 SHA 是实测 C R10 中 MISSING 的精确 B 源**。若采用本批更新后版本，请以最终 B HEAD 的 Git blob 为准：

| 文件（M / U） | B Git blob SHA | 直接本地 imports（相对同目录；跨目录标注 M/U） |
|---|---|---|
| U/ReviewV3CandidateIntakeSurface.tsx | `3d13d3abf5b3f3cbd2a27bbd9c7ea514d11a7fe7` | U/review-v3-route-view, U/ReviewV3AuthorWizard, U/ReviewV3ProductWorkspace |
| U/ReviewV3ProductWorkspace.tsx | `41e570bbae15f1ddb0aea6f355699be64c496031` | U/review-v3-product-workflow, U/review-v3-b33-author-reopen; type: M/B26, M/B3, M/B1 plan |
| U/ReviewV3AuthorWizard.tsx | `49d0d848ddb07a91a0345457e5f23744f3562cc5` | U/B1BufferedIdentityInput, U/review-v3-author-revision-read, -resume, -diff, -import, -trial, -edit; type: M/B1 plan |
| U/review-v3-route-view.ts | `5828fe5ed54fbe21881b9bf06d864129abb9f299` | type: M/B3 |
| U/review-v3-product-workflow.ts | `40558b169f3bde85e21af451b87aa8ef4ff40301` | type: M/B20, M/B30, M/B26, M/B27, M/B23, M/B3, M/B29 |
| U/review-v3-b33-author-reopen.ts | `fde0b281a8df90bd65cd1bfe584957f5fbb05938` | U/ReviewV3AuthorWizard, U/review-v3-author-resume; type: M/B1 plan |
| U/B1BufferedIdentityInput.tsx | `c2461b6b7a2f0fa4bdbfce8b6ba4368ff499684e` | none |
| U/review-v3-author-revision-read.ts | `8cee844fd71c68311ef36ec1f928004936d50073` | U/review-v3-author-diff; type: M/B1 plan |
| U/review-v3-author-resume.ts | `5e2e5b03e3997fdc23bbd7c8777004a1f09bb164` | U/review-v3-author-revision-read; type: M/B1 plan |
| U/review-v3-author-diff.ts | `34bdef89fc441910e9ff5b7a2114496faaa53af6` | type: M/B1 plan |
| U/review-v3-author-import.ts | `e20b4e991841285e1434b01b1f432d20632fdcfc` | type: M/B1 plan |
| U/review-v3-author-trial.ts | `6b565ee10a4e9f2de97990fb20b38585ad8a05e6` | type: M/B1 plan |
| U/review-v3-author-edit.ts | `07c4bf85fecd344486a93843ee182a7bbac1039d` | type: M/B1 plan |
| M/review-intake-routing-adapter-v3-b3.ts | `cd1d5b885e6fcc801b5e6c9df3e42a102b447f56` | M/review-intake-adapter-v3-b2 (C R10 exists) |
| M/review-v3-b30-current-materials-read.ts | `a26143b485b5a6d51622927916d781da25ac0fad` | M/review-intake-adapter-v3-b2, M/review-v3-b1-b2-main-read-bundle-v3-b (both C R10 exist) |
| M/review-v3-b33-currentity-snapshot.ts | `0aadc435be5d005678628e346e2324ab379cde0f` | M/B30, M/B20, M/B3, M/B26, M/B23 |
| M/review-v3-b1-b2-recovery-preflight-v3-b.ts | `7001e2e5baa7bdebb7c4ee852e9150e8c97af4e6` | M/B1 author store/plan + B2 adapter/checkpoint/ledger + B20 (already C R10) |
| M/review-v3-b3-unmatched-author-bootstrap.ts | `7af5fb6db342f3308257e1adf5232bc1ca5459ea` | M/B2, M/B3, M/B26 |
| M/review-v3-b-candidate-readiness-workbench.ts | `426e93270e2a533575c83a7f1408adf7a577b2dc` | M/B20, M/B3, M/B23, M/B26 |
| M/review-v3-b4-bulk-evidence-workbench.ts | `456192fc5932929b9193f6833cee0bd6e4fadd44` | M/B4 conflict, M/B4 obligation lineage, M/B4 R25 raw clause |
| M/review-v3-b4-conflict-and-instance-guard.ts | `f714143a303a757293b4357c26fc38662bde4c46` | M/B4 high-risk semantics, M/B4 obligation lineage |
| M/review-v3-b4-obligation-lineage.ts | `1d2c9bc22630000906ea976f7a3a77cfd49dd2e3` | none |
| M/review-v3-b4-r25-raw-clause-condition.ts | `43b3b1dc825f9e22596ba9ff1823e908a046a3ee` | M/B4 high-risk semantics, M/B4 rule-source diff, M/B4 obligation lineage, M/B4 conflict |
| M/review-v3-b4-high-risk-semantic-evidence.ts | `86ffd95ee4537f6dd0b09bb5f677348c69ba0f28` | M/B4 obligation lineage |
| M/review-v3-b4-rule-source-diff.ts | `d725f339ac37b5974dbef039252418e81ec9a381` | M/B4 obligation lineage |

Optional, **not required for basic 50+1 Main reader**: M/review-v3-b-bulk-remediation-cycle.ts@`53e946327f7354e5a16fa5017779049bdcf682e3`. Its separate batch authoring can be deferred without blocking local candidate UI.

**Already in C R10, no replay**: M/review-template-plan-adapter-v3-b1.ts@`974f0b0d127301ed71ad10df5ae64623ce378882`, M/review-template-author-store-v3-b1.ts@`065251ca843c51e68e225dc688bb7a8caab2fea7`, M/review-intake-adapter-v3-b2.ts@`e911663006cb105aad382a6a107630534e014739`, M/review-v3-b1-b2-main-read-bundle-v3-b.ts@`2ff051fc5d18a2c0ef9465188a3611a71a0989ee`. Existing other B2 direct imports must still be resolved against C tree; do not replace newer C-owned Main/IPC/Preload/shared.

## C 一次注入的接口（B 不写 C-owned 文件）

- Main authenticated source read → `B32ProductPorts.onReadCurrent():Promise<B32ProductRead>`; return complete B30 full material inventory (including every ZIP entry), B20/27/26/23, B3 actual route, C-checked current owner and deterministic B33 `readVersion`. C 每次服务端重新取得实际 Main Principal/Owner/source epoch，不信 Renderer hash。
- Main unmatched author read → `onPrepareUnmatchedDraft(intent:B29HumanAuthorIntent):Promise<B29UnmatchedAuthorDraft>`; C 复核完整 B2 + unmatched + 用户明确意图；B 空白草稿不调用这个服务。
- C Main candidate-only observation writer → `onProposeRemediation(request):Promise<B32RemediationReceipt|void>`; 回执应包含 `schemaVersion:'review-v3-b32-remediation-receipt/1'`, `issueId`, `currentSnapshot`, `receiptId`, `persisted:true`, `candidateOnly:true`, `publicationAllowed:false`；写权和证据索引归 C，旧返回 void 明示未确认。
- Main B1 author → `B1AuthorWizardProps.onSaveDraft(doc,expectedRevision)`, `onPreview(doc)`, `onFreezeCandidate(doc,expectedRevision)`, `onReadLatestCandidate(templateId,expectedRevision)`。真 revision CAS、重新打开的 latest 双读由 C，B UI 不凭本地导出认定保存。
- Main route/catalog → `caseCandidateId`, `sessionKey`, `route`, `manualCatalog`, `onRequestRefresh`, `onInterrupt`, `onManualChoice`，页面挂在 C-owned **实际审核输入/新建案卷前的业务类型确认**位置，不取代现有 C Case/Run。仅用 C-supplied catalog，candidate-held 显示但不自动提交。

## Gate 与未完成边界

B source 可用 ≠ C Renderer/Main 已挂载。C R10 本表比对是 MISSING，不得称为正式产品操作成功；尚需 C/I 物理 Electron smoke 和 Gate E/P。49/50 原 RAW、G08-T03 缺失、34 G01 scope、4163 UNKNOWN 和 32 独立 Gold 明确显示人工复核；学校 Gate L 后置，不阻断本地草稿/修订/Manual。回滚 B 到签过的 R33 `87762e002bdbc81cc8c584acb3e9f9c3547b0b26`；C/I 只取 C 签准的精确后续 B blob。
