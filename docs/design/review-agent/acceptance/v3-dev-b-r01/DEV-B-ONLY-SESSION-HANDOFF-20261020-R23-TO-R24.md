# CDUT Studio Review V3｜Dev-B 专属会话交接（2026-10-20，R23 → R24）

> **DEV-B-ONLY SESSION HANDOFF / NOT ABCI GOVERNANCE / NOT REQUIRED FOR DEV-A, DEV-C OR INTEGRATOR-I**
>
> **阅读义务：仅下一任 Dev-B 和用户。** Dev-A、Dev-C、Integrator-I **无需阅读、无需 ACK、无需按本文执行**。它只是一份 Dev-B 会话续接快照，存放于已有四线协调 docs-only 分支以保留上下文；**不是**第二份四线统一协作规则、C 裁决、I source-lock 或生产发布授权。
>
> 本文更新上一份 `DEV-B-ONLY-SESSION-HANDOFF-20261020-R18-TO-R19.md` 的“最新进展与下一批”部分，历史文档保留、不重写。此处所有 SHA、Gate、其他线 HEAD 均是 **2026-10-20 当次真实读取快照**；新会话第一步必须重新读 #142/#144/#145 与精确 CI，不得用本快照代替实时仓库事实或 C 的最新裁决。

## 0. 唯一恢复入口、分支及来源权

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- **Dev-B 唯一真实工程 Draft PR #142**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142
- Dev-B 工程分支：`feat/v3-dev-b-template-intake-r01`，PR base `feat/v3-dev-c-c0-contract-r01`，**Draft/open/unmerged**。
- **本次固定 Dev-B R23 最终全绿工程 HEAD**：`d96c3d176159cd12f4befd2a91bfeade44dca216`。
- 上一可独立回滚点 R22：`8ff484a670932cacf23e8c1e7a2564043c2ac05f`。
- **协调 docs-only Draft PR #145**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145 ，分支 `docs/v3-integrator-i-r01-taskbook`。
- **唯一四线正式规则与 C 业务安全裁决**：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`，永远先读。Dev-B 只能修改 `<!-- BEGIN:STATUS:B -->` 与 `<!-- END:STATUS:B -->` 之间的自身状态，**不能改规则正文、DECISIONS:C、STATUS:A/C/I**；本 Dev-B-only 文档另行自由追加，但不可要求其他线阅读。
- **Dev-C 工程 Draft #144**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144；本次观察 C HEAD `5d1272effa299be0a6014fb6a690c9914ce68d58`，仅供标记，不是 Dev-B 导入目标或授权。
- C0 冻结共享合同旧源：PR #141 `5682057c7232c914e72fdae525ce95fd33f32b53`，`review-c0/1`。禁止为了 B4 安全审计而改 C0/shared。
- 早期 B-only R18→R19 历史交接在**本协调分支**：`docs/design/review-agent/acceptance/v3-dev-b-r01/DEV-B-ONLY-SESSION-HANDOFF-20261020-R18-TO-R19.md`；其 R18/R19 “下一任务”和当时其他线 HEAD 已过期，只用于考古。

## 1. Dev-B 身份、长期职责、产品原则

你是 **Dev-B 继续真实开发的工程 Agent**，不是 Dev-C、不是 Integrator-I、不是仅写报告的独立研究 Agent。核心是让真实业务材料经来源核验进入**可理解、可保存、可恢复、可保守路由、可由人工创建未知业务**的审核候选工作流，同时尽量保全历史 50 套的材料/业务含义。已经跑绿的 B source 不必重复研发，找真正的剩余业务风险并推进代码和验收。

### B1｜第 51 套作者 / 模板 / 编译

独立审核目的、来源/SourceVersion、字段、对象/Subject/Target、Check、conditions 的三值 `applicable/not-applicable/unknown`、模块 DAG、阶段/输出、候选 Plan 编译和 freeze；作者 append-only 修订、revision CAS、全链/不可变冻结、删除或重命名 Check 的显式作者确认、参考完整性、JSON 导入导出、IME 与草稿并发、Main 最新候选只读对比与二次重新验证。**第 51 套是 `candidate-held`，绝不是新发布的学校模板。**

### B2｜原件与可追溯物理来源

B2 Owner/grant 内存暂存及完整源 inventory、真实 bytes SHA256 与 DocumentVersion、ZIP central/CRC/防压缩炸弹/容量锁、原 archive/checkpoint/解码 profile/fsync、每 entry InputLedger /2 CAS、真正人工 role/Subject receipt、TXT/PDF/DOCX/XLSX/图片 parser 的实际精度/块/parseRevision 和旧来源失效、断点/冷重启新 Owner generation 的重选/重确认。**B2 `accepted` 仅是 INPUT 准备，不等于 C CurrentCase Material、SourceLedger、ReviewBatchAttempt 或审核结果。**无经验证原件不可假造 SourceIdentity。

### B3｜保守路由

Main 掌控倒计时/当前 Owner 的来源集合；20 秒默认建议只适用于唯一、高置信、Main 当前技术目录授权、全量物理输入已覆盖且业务 Subject/role 单义的情形；人工可中断/改选，未知或未匹配转人工确认/自建候选。**模型宣称授权不构成授权；第 51 套也不自动进入 Main 正式目录。**

### B4｜既有 50 套、原文与义务语义保全

- G01–G08 50 套（G01 5、G02 3、G03 10、G04 8、G05 6、G06 9、G07 7、G08 2）、技术 workspace 冻结 **3,875 条 Check**。
- 固定原始 Markdown 实际字节对应 **47/50 MATCH**；其余 **G02-T03 (`g02-t03-review`)、G04-T06 (`d4-g04-t06`)、G08-T03 (`g08-t03`)** 均 `HASH_MISMATCH_QUARANTINED`。G06-T01 v0.1 **已于 R12B 实际原字节重新找回**；旧 R11 “四冲突+三缺失/43/50”不再是当前数字。参考 `B4-R12B-G06-T01-V01-ORIGINAL-RECOVERY.md` 与 `B4-1-ORIGINAL-RAW-RECOVERY-R12B.json`。旧来源冲突版本必须保留独立证据，不得做 CRLF/NFC/标题修改后伪造相同 SHA。
- **34 项 G01 Check 缺明示对象/case scope；4,163 条 SourceRef applicability=UNKNOWN（注意按来源链接而非 3,875 Check 计数）**。UNKNOWN 绝不能映射为 `false/not-applicable/PASS`。
- **三套已独立取得完整真实原文的 107 条规则锚点**（G03-T12 27、G04-T03 46、G06-T06 34），其中 **32 条高风险原文语义**（G03-T12 7、G04-T03 14、G06-T06 11）具有实例分离/授权主体/流程范围缺口，均 `CANDIDATE_CHECK_TRACEABLE_SEMANTIC_UNPROVEN`，不是已经证实功能丢失也不是已经实现学校许可。
- 历史 50 套 **全部 `candidate-held/publicationAllowed=false/schoolPolicyVerified=false`**；原字节身份真实 ≠ 现行学校制度生效、业务条件等价、独立 Gold、签发者授权或可以安装为正式审核 Plan。

## 2. ABCI 协作边界与**当前 C 正式事实**

- **Dev-A**：Pi/AgentSession、非正式模型 Provider/SDK、技术 Host/revoke/恢复，不能替代 C physical ACK 或正式 Run writer。
- **Dev-B（本会话）**：B1–B4 自有模块、测试、B-only 文档与 source-lock 提案；**不能**自行修改 `packages/shared/**`、`apps/electron/src/main/lib/review/review-ipc.ts`、Preload、C-owned Main trusted Principal/Frame/Owner/NativePicker、`CurrentCase/CaseAggregate/ReviewRun/Decision/Outbox/SourceLedger/SchoolPort`，不得伪造校方 publisher、Main native picker、正式权限或审批回执。
- **Dev-C**：全系统共享业务合同、真实 Main/Preload、可信权限和 Case/Run/Policy 业务安全唯一裁决；本会话如需新跨线契约只能按 #145 向 #144 提具体 CR，包括 owner/接口/条件/文件/blob/正反例和清晰默认拒绝方式，**不得私自跨边界写入**。
- **Integrator-I**：只在 C 精确授权的 source SHA/blob 范围内做隔离技术汇合、联合回归、回滚与独立签收；不自动漂移来源，不是第二个 C。此前已签 I3/I4 SHA 是冻结锚点而不是 B #142 HEAD 的动态导入权限。
- 协调协议正式已有 **`B-CR-003 / APPROVED_SCOPED_C_OWNED_OFFLINE_READ_CONTRACT_ONLY / B_FOLLOWUP_REQUIRED`**：C 批准**自己**设计离线 Main 可信候选只读 read adapter，B 应提供前置依赖与精确门禁，**没有**授权 B 写 Main。B R20 实际提交已由 C 在 **`B-R20-C-DEPENDENCY-ACCEPT-R01 / YES_EXACT_SHA_SCOPED_B_SOURCE_ONLY`** 单独签收，此签收不含 I 自动导入或正式 Main 安装。
- C 自有 `C-MAIN-B20-R01-FINAL-EXACT-GATE-O / PASS_EXACT_SHA_D5A61304 / OFFLINE_TRUST_BOUNDARY_ONLY`，已真实开发 C-owned 的离线当前 Principal/Owner/frame/source 双读合同，**但尚没有独立证明 B R20 真实 vault、可信 native picker/正式 Main 生产入口全部注入、真实 Electron Gate E 或校方发布可用**。C 已有若干 Main/Preload 技术通道的先前工作；不要说“C 连 IPC 都未做”，也不要说“已完成真正产品联调”。
- I Main lease 仍 `CONDITIONAL_NOT_ACTIVE`，Business Writer `DENIED`，任何新来源导入必须单独精确 C 签收。C 的其他技术签收包括 I4-A18 #153 和 I4-B18 #154，均不能扩大为 B R19–R23 自动入库。
- **本 Dev-B-only 交接文档不是 C 决议**。下一会话先核对 #145 DECISIONS:C 当前全量/尾部新批准，再判断是否有新的明确范围。

## 3. R19–R23 最新五轮：代码已做、证据已签、不可重复

| B 批次 | 精确独立全绿 B 工程 SHA | PR CI / D2 / Baseline GitHub run IDs | 新增专项 | 全仓 Bun |
| --- | --- | --- | --- | --- |
| **R19** | `77e6df0511098e084b045a711d16c48cad93c758` | `39324901639` / `39324901546` / `39324901534` | 13/13 | 4200 PASS / 5 SKIP / 0 FAIL |
| **R20** | `984fbdda35590b39e8547860a025ef0db5a666b9` | `39328913067` / `39328913007` / `39328913046` | 12/12 | 4212 / 5 / 0 |
| **R21** | `f1fd56c8c61149e40dc2c916ad7fbcf87a23d66b` | `39331517763` / `39331517696` / `39331517726` | 10/10 | 4222 / 5 / 0 |
| **R22** | `8ff484a670932cacf23e8c1e7a2564043c2ac05f` | `39334190681` / `39334190527` / `39334190733` | 10/10 | 4232 / 5 / 0 |
| **R23（当前）** | **`d96c3d176159cd12f4befd2a91bfeade44dca216`** | **`39338187046` / `39338186750` / `39338186959`** | **13/13** | **4245 PASS / 5 OS SKIP / 0 FAIL；4250 tests / 498 files** |

**以上每行均为其各自原精确 SHA 的 GitHub Actions `completed/success`，不是声称这些测试已经通过真机。** R23 PR CI job `118352848207` 亲读原始日志，13 条 `R23-01..13` 全 `(pass)`，完整 TypeScript/boundaries/Main+Preload+Renderer build 成功；#142 保持 Draft/open/unmerged。

### R19｜B1 Check×target×物理来源与失效

`review-v3-b1-b2-candidate-source-bridge.ts@e322df7ddc0910f5065d7a887507218cac7a7713`：结合 B1 编译+ B2 真 ZIP archive original/CRC/ ledger /2 接受回执 + parser register 的 parseRevision/block 生成逐 Check×target×Object×Subject×source provenance，state `linked-candidate/stale/unknown/needs-human-confirmation`；旧 audit snapshot 只能做差异，原件同 bytes 但物理不同不得复用；Check 未受影响独立保留。仍不是规范 Check PASS。

### R20｜真正保存作者+冻结候选+原件组合的只读 C Main 依赖

`review-v3-b1-b2-main-read-bundle-v3-b.ts@2ff051fc5d18a2c0ef9465188a3611a71a0989ee`：`readB20CurrentCandidateBundle` 必需 C 外注可信 `currentScope/currentSelections/nativeArchiveKey` 和真实 B2 staging/parser/vault/ledger；B1 append-only 全链和 frozen 当前 revision/fingerprint 双读防漂移，未安装可信能力则拒绝，返回 only `candidate-held` / `publicationAllowed=false`。C **已批准 B source/dependency 任务完成**，但真实 C Main native picker/auth 组合仍另需真实 source import/接线 Gate。

### R21｜50 套之外的业务不能错配

`review-intake-routing-adapter-v3-b3.ts@cd1d5b885e6fcc801b5e6c9df3e42a102b447f56` + `ReviewB2StagingService.listScopedCandidateIds`：材料必须覆盖同一案卷所有真实 staged 文件，单申请/单 Subject/逐原件唯一证据与 Main 当前技术目录精确授权，防故意遗漏第二位申请人；无匹配则 `unmatched` / 0 秒 / 无 `chosen`，B-only React surface 可人工自建 B1 candidate，绝不默认发布“通用已批准模板”。

### R22｜51 套作者复开与版本竞态

`review-v3-author-resume.ts@5e2e5b03e3997fdc23bbd7c8777004a1f09bb164` + `ReviewV3AuthorWizard.tsx@49d0d848ddb07a91a0345457e5f23744f3562cc5`：第一 Main 读只作 diff，用户确认时第二次 Main-read 核对 revision/digest/full author content/editEpoch、真实旧版本不能覆盖，脏稿必须经过用户亲自检查已导出备份后人工放弃；全新空白页仅输入 templateId 可重开已有候选。C 可信 Main read callback **不是 B 自己安装的**。

### R23｜多 ZIP / ledger / 作者版本同读恢复预检（最新）

`review-v3-b1-b2-recovery-preflight-v3-b.ts@7001e2e5baa7bdebb7c4ee852e9150e8c97af4e6`，测试 `@27da50b5a5a57b89027f4a3870d94bd0cdd48655`：实际两 ZIP/4 原件/跨 fresh `ReviewB2StagingService` 读磁盘 archived bytes/checkpoint、InputLedger /2 role/Subject receipts、B1 frozen author；最多 32 档案，全部逐原件/账本首次和二次读取 + 末尾 B1 和 Main scope/注册表重复核对；中间真实 ledger CAS 写、原件坏、Owner 撤权、作者版本变化则整包拒绝，不部分成功。旧 `accepted` 一律 **`historic-accepted-needs-new-source-confirmation`、`sourceReuseAllowed=false/currentSourceIdentityVerified=false`**，仍须 C Main 真 native picker 重新选和重新授权，不会因恢复预检变正式材料。

**重要首败保留**：R23 旧 `be99c27ba540e2f898a5ec2c81fdfcad61127464` PR CI `39337465484` 和 D2 `39337465468` TS 可空文件/账本/注册表编译失败；B-owned 显式 fail-closed `throw` 修复 `832cf1ba500158dca6984ceb0f9635ceb22d7d7b`，在新最终 SHA 3 项重跑成功，未降低质量。R22 旧夹具初败也保留在其报告，不得抹除。

## 4. R19–R23 固定工程文档 / PR 回执（历史可追溯）

**所有以下文档均在 B #142 工程分支，而不是本 B-only 协调文档分支**，定位目录：`docs/design/review-agent/acceptance/v3-dev-b-r01/`：

- R19 `B-R19-B1-B2-CANDIDATE-SOURCE-CHECK-BINDING-AND-UAT.md`，[#142 回执 6277427550](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6277427550)。
- R20 `B-R20-CURRENT-AUTHOR-PHYSICAL-SOURCE-READ-BUNDLE-AND-UAT.md`，[#142 回执 6278025531](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6278025531)，C 精确 B20 source dependency 签收另查 #145 `B-R20-C-DEPENDENCY-ACCEPT-R01`。
- R21 `B-R21-UNMATCHED-BUSINESS-AND-TRUSTED-FULL-SET-ROUTING-UAT.md`，[#142 回执 6278369842](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6278369842)。
- R22 `B-R22-AUTHOR-RESTORE-EXACT-MAIN-RECHECK-AND-CANDIDATE-REOPEN-UAT.md`，[#142 回执 6278700813](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6278700813)。
- **R23** `B-R23-MULTI-ZIP-ORIGINAL-LEDGER-AUTHOR-COLD-RESTART-RECOVERY-UAT.md@ac2ecbd89371bbb013fd2772ecff2de23635889c`，[#142 回执 6279209633](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6279209633)。GitHub 3/3 exact SHA runs PR `39338187046`、D2 `39338186750`、Baseline `39338186959`，全仓 Bun `4245/5/0`。
- B4 核心报告：`B4-R12B-G06-T01-V01-ORIGINAL-RECOVERY.md`、`B4-R13-107-RAW-RULE-CHECK-SEMANTIC-GAP-REPORT.md`、`B4-R14-32-HIGH-RISK-SEMANTIC-EVIDENCE-REPORT.md`、`B4-R15-OBJECT-ISOLATION-TECHNICAL-REGRESSION.md`、`B4-50-OBLIGATION-COVERAGE-R02.md`。要区分不同年代归档状态，以 **R12B 后最新 raw provenance** 为准，不使用旧 43/46 计数。

## 5. R24 下一会话第一批：B4 冻结原件冲突、规则适用性与实例语义安全性

> **这是下一批建议的正式工程方向，但 B 仍必须先复核远端最新 C DECISIONS/B HEAD；不是 C 对所有文件已经签的授权。**
>
> **产品目的：让“历史技术 Check 可见”与“真实原文/校规可证”分层呈现，先解决高风险证据不确定性，不用猜学校规则。避免另起无边界考古或为了数字把 50 套一键标绿。**

### R24 优先目标与工程顺序

1. **先精准读原 B4 而不是写另一个平行真相账**：`review-v3-b4-original-byte-verifier.ts@02565186990a7e67e5e1e37fb83931384be9fffd`、`review-v3-b4-rule-source-diff.ts@d725f339ac37b5974dbef039252418e81ec9a381`、`review-v3-b4-high-risk-semantic-evidence.ts@86ffd95ee4537f6dd0b09bb5f677348c69ba0f28`、`review-v3-b4-object-isolation.ts@009c12382ddbc955965be0ce9b796739cc6905f8`，连同 `B4-50-CANDIDATE-SOURCE-LEDGER.csv`、`B4-50-CHECK-SOURCE-COVERAGE-R02.csv`、`B4-R14-HIGH-RISK-32-SEMANTIC-EVIDENCE.json`，逐文件 SHA/身份逐条校验。仅凭报告不计原件 bytes 真实复验。
2. **3 项来源冲突按“固定原件、观察版本、可用性/差异、继续隔离”分类**。以原 D4 pinned `sourceSha256` 与实际由授权 Library 或原件提供者独立读得的完整原始 bytes 对比；若文件未授权/未提供，明确 `RAW_NOT_AVAILABLE`、不得造 bytes/把 Git JSON 摘要冒充 raw。若新版本真实存在，作为**独立候选版本**建只读 diff/审计记录，不能覆盖原冻结原文、旧 sourceVersion 或模仿批准 Gold；不得让任何冲突母版进入自动技术高信心路由的“学校已授权模板目录”。
3. **32 高风险语义的可执行正反例**：结合 R13 107 条双向原文标题+原文条款正文与 R14 32 条 clause evidence，针对 G03 的 `scope_item_id×场馆区段×时间`、G04 的 `person×lab×scope×action×policy`、G06 的 `ReleaseAction×channel×claim×asset×version`，扩展 B-owned **逐对象技术差异**检查及条件真值/UNKNOWN、版本更换失效、跨实例串证据反例。只证明确实能从当前证据和候选 compiler 得到的技术结论，未证明官方签署者/运行数据时维持 `semanticValidated=false`、`applicability=unknown`。
4. **G01 34 scope UNKNOWN 与全体 4,163 source links**：做可验证的责任/缺口分类、辅助人审所需证据精度与有界统计，不以简单“找到 Check ID/标题”填出实际 Object/Subject 或设默认 `CASE`；任何未决定 policy issuer/source applicability 对正式发布持续 fail closed。
5. **工程交付**：尽可能在**一个足够完整的 R24 批次**做 B-owned source verifier/semantic guard+现实正反例+完整 B-only UAT/来源 blob+旧错误证据。原始素材需要真实 bytes 时，先使用可授权 Library/已固定 Git bytes；获取不到就做不依赖缺失信息的保守安全实现与历史证据差分，**不将不可验证部分伪造为已完成**。业务证据需校方或 C Main 才有的，按 #145 向 C 提确切 CR，但继续 B 可独立开发的部分。
6. **签收**：在 #142 原分支提交真实代码+tests+文档，最新 SHA 的 PR CI、D2、Baseline 必须 3/3 completed/success，记录 workspace TS/package boundaries/skin/build/Bun 总 PASS/SKIP/FAIL及新用例真实原始日志；旧首败和新修复 SHA 都留痕。然后 **仅更新 #145 `STATUS:B`**，绝不改 C/A/I 区。下一轮如给 I 移源，需 C 新 exact blob+依赖 source-lock/新集成 Gate O/独立 C 工程签收。
7. **工程优先于形式**：不要只写“R24 实施方案”却没有可运行代码。不要每实现一个纯函数就做一次昂贵实机验收，统一写入 Gate E 本地 Agent 验收任务书，C 接线具备后集中跑完。别以“最小闭环”名义压缩负例、安全/可靠性或产品完整性。

### R24 何时不宜贸然提交结论

- 无当年 pinned business original 或读取的是别版本，则不能做逐条 **原版** SHA/政策有效性签收。
- D4 Check 一一能映射原文 RuleID ≠ Check 的条件/责任/Subject 语义已经一致；G03/G04/G06 的合成条件测试不等于学校批准方提供的真实运行证据。
- 3 冲突、34 scope、4,163 applicability、32 high-risk 在无独立原始/人工权威前应保留真实 UNKNOWN 计数，不为“完成率”强制归零。
- B4 不能把模板发行权限交给 Renderer，不能把技术 `linked-candidate` 当 `PASS`，也不能改变 C ReviewRun 原业务含义。

## 6. 真实产品门禁：必须分别记录

| Gate | 2026-10-20 当前状态 | 要做才能转绿 |
| --- | --- | --- |
| **Gate O / Dev-B 离线工程** | **R23 当前 HEAD PASS_EXACT_SHA_SCOPED，3/3；R19–R22 各自亦全绿** | 新 R24 HEAD 需要**重新**跑其本身三 CI 与专项日志，绝不可继承 R23 绿 |
| **Gate E / 目标机实机** | **NOT_RUN** | C/I 真实 Main/native picker/auth/source bundle 接好后，3 OS Electron、文件原件/Office71/ZIP、主窗口、中文 IME、源替换、权限撤销、跨 PID crash/ENOSPC/断电、100 案 500 文件、20s 路由与 51st freeze/restore；真实录屏日志/精确 A/B/C/I SHA |
| **Gate L / 学校政策与独立 Gold** | **BLOCKED_NO_AUTH** | 真实校规版本/逐原文字节/业务签发者和对象适用性、有效 PolicyPort/Publisher/ACL、独立 Gold 验明；不得用用户声明或 B 原始 SHA 自动签 |
| **Gate P / 真实产品使用** | **NOT_RUN** | C 主界面成功安装后 5 位独立非开发者各 30min 完整第 51 套候选与多原件、保存/复开/恢复/冲突和真实责任确认，记录失败/恢复 |
| **Release** | **NO_GO，PR #142 Draft 未合并** | C/I/产品按相应证据、完整合同与授权进行另行签收 |

## 7. 真实开发工具约束

- 在 ChatGPT 当前连接环境，可直接通过 GitHub connector `tools.mcp__GitHub__get_pr_info/fetch_file/compare_commits/create_file/update_file/fetch_commit_workflow_runs/fetch_workflow_run_jobs/fetch_workflow_job_logs/add_comment_to_issue` 操作；**先拿新 HEAD/文件 blob 的 Git optimistic CAS**，再更新；若仓库主代码并行改变，重新对比，不能盲推。
- 容器无法保证直连 GitHub 或安装 Bun；以前所有真实工程 CI 均来自 GitHub Actions 运行日志，不要谎称“我本地执行了 Bun”。
- 当前 #142 目标分支 B-only；交接文档位于 #145 docs-only 分支，二者独立，不要将 #145 docs HEAD 当作 B 工程 Gate O SHA。
- 当发现 C 所需新接口，先对真实 C 当前实现核查，再提精确有界 CR。没有明确主权转让不得 edit C-owned 正式文件。
- 作者侧操作需要 Main 真 Actor，不能伪造 `local-reviewer`；source audit/checksum 均不能充当学校发布者的签名。
- 每次交付必须记录：新代码/测试差异、旧失败、固定 source Git blobs、精确 3 CI（含 raw tests）、Gate O/E/L/P、Release、已签与未签的外部依赖，更新 PR #142 与 #145 STATUS:B。

## 8. 专属交接最终判断

**Dev-B R23 已正式工程收口，R24 尚未开始。** 第一优先级不再是 R19–R23 重复实现，也不是等 C 生产主界面后空转；而是 B4 原文版本冲突/UNKNOWN 和 32 高风险业务语义的**证据驱动安全收口**，用真实代码、对现有产品负担最小的保守规则与独立源核验完成下一整批开发。对当前 C Main 可信安装、学校授权或用户验收还没做到的部分诚实说明，不把候选技术功能描述成已经上线。
