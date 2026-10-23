# CDUT Studio Review V3｜Dev-B 专属会话交接（2026-10-20，R18 → R19）

> **DEV-B-ONLY SESSION HANDOFF / NOT ABCI GOVERNANCE / NOT REQUIRED FOR DEV-A, DEV-C OR INTEGRATOR-I**
>
> **只供新的 Dev-B 工程开发会话、用户查阅。** Dev-A、Dev-C、Integrator-I **不需要阅读、不需要 ACK、也不需要执行本文**。把本文放在四线协调 docs-only 分支，是为了让新 B 会话从精确工程状态接手，不是在 #145 之外创造第二份四线规则、代替 C 决议或对 I/A/C 派工。真正对其他会话有约束力的权限变更，只能由 C 在唯一协议的 DECISIONS:C 内正式签署。
>
> **取代旧 B-only R12 会话交接的「当前进度与下一步」部分**，不抹除旧文历史。本文也是固定时间点快照。新会话第一步必须重新核实 PR HEAD、Git object、CI、#145 C 决议及各线状态；**不要把写在这里的 SHA 误当成会自动变化的分支**。若文档与实际源码/正式 C 决议冲突，按实际最新且独立验真的事实与 C 决议处理。

## 0｜一页恢复入口与已核实 HEAD

- GitHub 私有工程仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- **Dev-B 现行工程 Draft PR #142**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142
- **Dev-B 唯一 B-owned 代码分支**：`feat/v3-dev-b-template-intake-r01`
- **本次交接确切工程 HEAD（2026-10-20 核实）**：`263b7f36034cacd4d51a00edd5f39266c37037fa`；R18 已完成，Draft 未合并。
- **上一个独立全绿回滚点 R17**：`e9215affaf536757d4b63ffcb012bb53006a1821`
- **四线唯一协调 Draft PR #145**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145
- 统一协调 docs-only 分支：`docs/v3-integrator-i-r01-taskbook`
- 唯一四线规则：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。本文只需对 B 状态做指针更新；协议正文与 C 决议不得由 B 编辑。
- 冻结 C0 共享 DTO 合同：PR #141，`5682057c7232c914e72fdae525ce95fd33f32b53`（`review-c0/1`）。
- 交接核实时其他线：A #143 `0febf1248bc6a580a1bc7b3144e0d96ca4313916`；C #144 `331519d3833e254c7d54c18605b50f3252582517`；I Stage2 #151 `687ed356de3aee59075b85bf09a978eedab12a02`（**C 正式有界签收**）；I Stage3 候选 #152 `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`（**工程 Gate O 已绿，但按当时 #145 的 C 决议仍待 C 对 Stage3 的正式签署**）。这些 SHA 是交接时独立观察，不是授权 B/I 浮动导入的指令。

## 1｜Dev-B 永久职责与真正产品目标

**你是 Dev-B，不是 Dev-C、Integrator-I，也不是又一轮考古/架构研究 Agent。** 持续推进真实 Review V3 产品开发，不因 C/I 仍在接线就只写报告或停止代码工作。使命：让一份真实的原始材料能以可信来源身份进入候选业务，完成保守路由、作者 Check×target 编译、人工声明与可追溯核对；50 套现有业务之外还能安全创建第 51 套未知审核业务；既不丢失历史义务，也不伪造学校制度效力。

### B1｜作者、规则编译、候选 Plan 与第 51 套

- 没有现成模板时，由作者从空白定义业务：独立审核目的、来源 `B1Source`、字段、Subject/Object/Target、Check、条件/UNKNOWN、模块依赖 DAG、Stage/Output、候选冻结与无代码试跑。
- 历史修订 append-only、revision CAS、全链读取校验、文件 fsync、原件/权限再验、候选快照 diff、删除或重命名 Check 显式作者确认、来源/字段/对象引用保全、导入/导出、中文 IME 与脏稿并发安全。
- B1 产物 `candidate-held`，`publicationAllowed=false`；任何用户声明或技术冻结 **不等于校方已授权 Plan/Gold/发布**。
- 第 51 套候选作者组件独立可用 ≠ 已挂到完整正式 Main 工作台 ≠ 5 名真人完成了 UAT。

### B2｜原件、ZIP、InputLedger、来源与版本生命周期

- 原生选择/拖拽所需的 B 侧技术输入能力；**真实 Electron Sender/Frame/Principal/Owner/NativePicker 权威必须由 C 提供**。
- 原始 bytes 与 SHA256、每个物理来源的 DocumentVersion、解析器实际注册 block/locator/parseRevision、解析精度不足的保守降级；Office/PDF/图片未被真实读取不能写成全文已读。
- ZIP CRC、防 zip-bomb、大小/目录穿越/软链/配额、多 PID 容量锁、不可变持久 archive/checkpoint、decoder profile 固定、恢复后新 Main owner 重新确认原件；staging 无权安装 Case。
- InputLedger 逐条 pending/needs-confirmation/accepted/skipped/rejected、人工 role/Subject、CAS、明确 receipt hash、未授权不得转出正式 `ApplyMaterial`。
- **R19 应把 B2 已核验的材料 SourceIdentity、版本变化与 B1 候选 Check×target 来源关联起来**；这需要是真实端到端可验证的候选关联，不能只生成另一份孤立 JSON。

### B3｜路由与中断

- 用户拖入后 L1 关键词+L2 轻量 Agent 保守路由、Main 掌握 20 秒默认自动倒计时、候选适用资格和不确定性提示、人工中断/改选、Owner 撤权和源更新后的旧推荐拒绝。
- 若 50 套不适用，可以进入 B1 新业务作者候选界面；不能默认声称“通用模板已经满足校规”。

### B4｜50 套历史模板、来源与义务保全

- G01–G08 共 **50** 套、D4 固定历史版本；约 **3,875** 条历史技术 Check、**4,163** 条 source applicability 目前 UNKNOWN、G01 **34** 条对象/case scope UNKNOWN、32 条高风险原文语义 `semanticValidated=0`。
- **交接时 R18 最新 STATUS:B 记载 47/50 原始 Markdown bytes MATCH，三份来源冲突隔离：G02-T03、G04-T06、G08-T03。** 旧 R12 交接曾写 43/50、四冲突三缺失；已过期，下一轮若触碰 B4，必须读 **实际 R18 最新 R14–R18 来源账/测试** 再依据原 bytes 证据复核，不得拼接两个版本的数字、静默抹除来源差异。
- 历史 Git blob/MD hash 一致、Check 与 workspace task 有技术血缘，**均不等于**真实校方制度、业务对象 scope、Gold、签名或发布权限已确认。
- 历史能力保全原则还涉及 71 条产品验收义务、72 项遗产能力、20 项跨系统冲突、7 条用户旅程。只按需要回查 #133–#140，不再做无边界考古。

## 2｜四线所有权、授权与最新 C 事实（特别重要）

**Dev-A**：Pi SDK/AgentSession、Owner/grant/Host 物理回执可靠性、模型 Provider/故障恢复；不能写 C 正式业务 Case/Run/Decision。A 最新 R18 离线 Gate O 已绿，并不自动加入 I 来源。

**Integrator-I**：按 C 选定的精确 SHA、原 Git blob、有界技术桥接及联合回归；不是第二个 C，不拥有最终业务权限。I Stage2 #151 `687ed356...` C 已签有界工程接收；I Stage3 #152 的离线工程已绿不等于 C 已签。I Main 只读生产租约 `CONDITIONAL_NOT_ACTIVE`，Business writer `DENIED`。**不能因为 B R18 独立全绿就让 I 自动导入整个 B 分支**，更不能更改已签 I2/I3 Source Lock。

**Dev-C**：唯一共享业务主权与最终裁决。C 独占 `packages/shared/**`、`review-ipc.ts`、Preload、真实 Main trusted Principal/Frame/Owner、`CaseAggregate/CurrentCase/Plan/ReviewRun/Check/Decision/Batch/Outbox/SchoolPort`、正式 Receipt/CAS/事务、政策 Publisher 与真实工作台主接线。C-only 生产文件不能由 B 未授权修改。

**B-CR-002 三项批准已实际落到各自代码，但权限没有转让**：

1. **A：Main 可信作者最新修订读**。C #144 曾以 `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d` 实现 C-owned 离线 Main Principal/Owner/Frame/全链 revision 验证，Gate O 5/5 PASS；B R16 Wizard 已做可选 reader 消费/比较、同修订冲突/旧版本/epoch fail closed。
2. **B：移除 Check 正式 UpgradePlan ACK**。C #144 `461b5c9e7abc17a020c843f279118208196f5ef0` 在单案 Case CAS 内实现正式 Check×target×object×subject×sourceVersion 的 ACK/Receipt，C 5/5 Gate O PASS；B 只能做无权威候选删除影响清单，**B 用户点击确认不是正式 C ACK**。
3. **C：候选作者工作流技术准备**。B/I 可继续独立构建 candidate-held 作者组件、导入导出、规则试跑与版本比较，但真实产品状态须按实际 Electron Gate E/P 判断。

**此次交接核实的最新 C 进展（重要更新！）**：C #144 **`331519d3833e254c7d54c18605b50f3252582517`** 已在实际 C-owned `review-ipc.ts`、Preload、shared DTO 和 `review-v3-main-author-plan-ipc.ts` 内注册了作者读/UpgradePlan 两条 **真实 Electron Main/Preload 技术通道**，独立 5/5 CI 和新 8/8 handler tests PASS。**但是 B1 实际作者账本、Main Owner grant、可信校方 Publisher authority 等尚未安装为可工作的真实来源；Main 未安装独立权威源时默认 fail closed。** 因此不能再笼统说“C 连 IPC 代码都没做”，也不能宣称“真实工作台与校方发布链路已完成”。B 无权代 C 安装假 Publisher 或开放这些源。

**实际缺口**：C/I 须按唯一 #145 协议另外签真实 B1/B2 与 C Main 系统的技术导入、可信源绑定、工作台安装和目标机验收；B 不得借此次专属会话交接发放授权、修改 C 决议或要求 I 自行提升 source SHA。

## 3｜Dev-B 已完成批次与真实 Gate O（不能用旧绿证明新 SHA）

| 批次 | B 自有固定 SHA | 可核实结果 |
| --- | --- | --- |
| **R10 / 既有 I2 B 来源锁** | `bf88320e57b20ebc2023f27665c544ce2ba72ce4` | PR/D2/Baseline 3/3 SUCCESS；旧 I2 固定 B 来源，但不代表新 R18 已集成 |
| **R14** | `4330e9f749771925f018e49ac3f5df7b09c00da3` | R14 有独立成功证据；B-CR-002 C 依据此有界裁决 |
| **R15** | `db288ef762666860e793df4cd175e0558c1da5cf` | PR `39309467404` / D2 `39309467241` / Baseline `39309467180` 全 SUCCESS；4149/5/0 |
| **R16** | `33a8482a1bc40d24076941f7643e002d8a228cb1` | PR `39315934021` / D2 `39315934016` / Baseline `39315934018` 全 SUCCESS；4164/5/0 |
| **R17** | `e9215affaf536757d4b63ffcb012bb53006a1821` | PR `39318510516` / D2 `39318510549` / Baseline `39318510583` 全 SUCCESS；4176/5/0 |
| **R18（最新完成）** | **`263b7f36034cacd4d51a00edd5f39266c37037fa`** | **PR `39320422706` / D2 `39320422755` / Baseline `39320422642` 均 completed/success；4187 PASS / 5 OS SKIP / 0 FAIL，4192 tests / 494 files，11/11 R18 新增用例 PASS** |

### R15–R18 新增技术实际是什么

- **R15**：B1 Check 重命名显式确认/中文输入暂态安全；B4 对 G03/G04/G06 合成多对象 Check×target/sourceVersion 的技术隔离验证，仍未证明学校制度。
- **R16**：B1 作者最新候选修订读回消费端，显式 diff/冲突恢复/epoch stale/备份保护；B1 精确 Check×target×object×subject×sourceVersion 删除影响清单；B2 单 parser block 与 file-only 精度划分，不宣称全文已读。新增 15/15。
- **R17**：候选修订不可变 JSON 文件 fsync+目录 fsync（POSIX）/O_NOFOLLOW/防符号链接硬链接/孤儿锁 fail closed；Main stage 原件在 mint SourceIdentity 时重新验证当前 bytes/Owner/version；下载按钮不再被误认已完成 OS 备份，要求用户自行检查后按 exact edit epoch 确认。新增 12/12；**没有完成真实断电/Windows 目录同步 Gate E**。
- **R18**：现有 `ReviewB2ArchiveVault.recoverAfterMainPicker` 只在新一代可信 Main owner/native picker 重新确认**相同 ZIP 原字节、锁定的历史解压 profile 与所有逐条 receipt** 后生成新待确认 B2 candidate，不复用旧 candidateID、不创建正式 Material/Case；新增 `ReviewB2SourceVersionAdapter.compareCandidateSourceVersions`，同一原件/解析会保留块，换物理原件（即使 SHA 相同）会保守 invalidate 全部旧 block，撤权/篡改/重启后无旧 registry 都拒绝。R18 新增 5+6=11/11，Gate O 全绿。

R18 验收文件（在 **B 工程 #142 分支**，不在本协调 docs-only 分支）：

`docs/design/review-agent/acceptance/v3-dev-b-r01/B-R18-RECOVERY-REAUTH-SOURCE-VERSION-INVALIDATION-UAT.md`

R18 固定 PR 回执：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6276766935

R17 固定 PR 回执：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6276505209

R16 固定 PR 回执：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6276022445

R15 固定 PR 回执：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6275323656

## 4｜目前关键工程文件索引（R19 应据真实源码/类型实施）

**B1 作者/规则**：
- `apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.ts`，`compileReviewB1Plan`、`verifyReviewB1Descriptor`、`diffReviewB1Plans`、`ImmutablePlanDescriptorB1.bindingDetails`（每项 Check×target 的 `sourceIds/sourceVersionIds/applicability/objectKey/subjectId`）。
- `review-template-author-store-v3-b1.ts`、`review-template-author-main-port-v3-b1.ts`；`review-v3-b1-candidate-removal-impact.ts`。
- `apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx`，`review-v3-author-revision-read.ts`、`review-v3-author-edit.ts`、`B1BufferedIdentityInput.tsx`。

**B2 原件/来源/账本**：
- `apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.ts`（`ReviewB2StagingService`、`B2MainContext`）
- `review-zip-intake-v3-b2.ts`、`review-zip-staging-v3-b2.ts`（源 ZIP 和独立 entry receipts）
- `review-import-checkpoint-v3-b2.ts`（`ReviewB2ArchiveVault`、`recoverAfterMainPicker`、`prepareRestage`）
- `review-import-ledger-v3-b2.ts`（`ReviewB2InputLedger`、per-entry revision/CAS、`B2InputBatchLedger`，**不是 CurrentCase/ReviewBatchAttempt**）
- `review-import-handoff-v3-b2.ts`（`proposeB2MaterialCandidates`、`B2ApplyMaterialCandidate`、候选 `input-only-unapplied`、`sourceLedgerHash/confirmingReceiptHash/proposalHash`，**不是正式 ApplyMaterial**）
- `review-source-version-adapter-v3-b2.ts`（`ReviewB2SourceVersionAdapter`、`parse`、`sourceForBlock`、`candidateReadExtent`、`compareCandidateSourceVersions`，C0 `SourceIdentity` 只来自真实 Main stage original/parser registry，不可由 Renderer/模型伪造）
- 各自同目录 `.test.ts`，特别 `review-import-checkpoint-v3-b2.test.ts`、`review-v3-b2-physical-revalidation.test.ts`、`review-v3-b2-version-transition.test.ts`、`review-source-version-adapter-v3-b2.test.ts`。

**B3 路由**：`review-intake-routing-adapter-v3-b3.ts`，`ReviewV3CandidateIntakeSurface.tsx`。Main 时钟/20 秒路由与人工中断规则保留。

**B4**：`review-v3-b4-obligation-lineage.ts`、`review-v3-b4-high-risk-semantic-evidence.ts`、B4 原字节与 50 套来源账证据。50 套仍技术候选，不许以测试结果冒充制度审查。

## 5｜下一批立即开工：R19「B2 原件与 B1 Check 来源约束的候选技术桥接」

**首要任务不是再做一次调查，也不是只写设计计划**，而是以 R18 全绿源为起点，直接做 B-owned 工程、正反例和精确 Gate O。前提：先独立重新核对最新 #142 HEAD，如已变化，要对真实 HEAD 处理而非强推。

目标：当申请人导入或更新材料时，系统知道**具体哪个材料、哪个物理版本、哪个 parser block、哪些 B1 Source 声明、哪些 Check×target×Subject 被影响**；所有来源不确定或已过期的核验义务要被保守挂起/UNKNOWN/needs-human-confirmation，不能因新材料或未确认 ZIP 自动满足 Check。

建议工程顺序：

1. **实际类型/依赖核对**：先阅读上节 5 个 B1/B2 关键源文件及测试，确认 `B1Source.documentVersionId` 与 `SourceIdentity.documentVersionId/rawSha256/parseRevision/blockId`、`B2ApplyMaterialCandidate` 的目前真实字段。不要直接把 ImportLedger 的 `candidateVersionKey` 当 C 正式 DocumentVersion，也不能仅靠 `fileName/sourceId` 串起两个不同物理版本。无对应字段就作 B-owned sidecar/exact mapping proposal，不修改 C0 shared。
2. **候选来源关联**：新增一个 B-owned pure/owner-bound 技术模块（可按实际仓库风格命名）复用 `compileReviewB1Plan/verifyReviewB1Descriptor` 和 B2 staging/parser/source identity 的当前验证；在已确认 Subject/role、源版本一致、真实注册块存在时输出逐 `Check×target×source` 的可解释技术证明或 `unknown/stale/needs-human-confirmation`，包含材料 SHA/版本/解析修订/块/role/Subject/旧新 binding identity 与阻断原因。只输出 **`candidateOnly:true, publicationAllowed:false, businessWriteAllowed:false`**，绝不授正式学校认可。
3. **版本失效传播**：使用 R18 conservative invalidation，把更换原件/重新解析/新 owner generation/改变 SourceVersion 后的 affected Check×target 明确标记为 stale，保留未受影响的其它 Check，避免用 Check key-only 做错误粒度的删除 ACK。新旧版本虽相同文本但物理 key 不同绝不自动继承；没有源证据的 Check 应保持 UNKNOWN 而非视作 PASS。
4. **历史账本保全**：整合 InputLedger `accepted/skipped/rejected/needs-confirmation` 的真实状态、人工 Role/Subject、receipt/proposal digest 和 C0 `SourceIdentity`；旧 ledger/zip archive/旧冻结 Plan 必须可继续核对、不可回写历史以“修复”当前适用性。
5. **足够强的测试**：使用真实 `ReviewB2StagingService`、TXT parser、真实 B1 compiler/immutable descriptor；正反例覆盖同物理版稳定绑定、来源版本更新影响多个 Check×target、同文件名不同物理 ID、相同 SHA 不同来源、Subject/role 不匹配、未确认/拒绝 entry、缺失 parser block、扫描或未检验图片、旧 parseRevision、Owner 撤权/跨案/跨 generation、旧 receipt/ledger 被改、候选作者修改/重命名 Check、`unknown` 传播、旧源不可静默复活。新测试不可通过降低 B1 `B1_UNUSED_TARGET` 等已有编译安全约束来“跑绿”。
6. **必要的 C 接线请求**：只在确实需要一个现有 C 未授权的 trusted read/ACL/publisher/Case 主权接口时，向 C #144 按协议交精确函数/文件/源码 blob/正反例/有界 CR，再继续 B 自己能做的技术工作；**不要等待 C 先批完才开始其它 B-owned 开发**。
7. **提交和签 Gate**：不要把小改拆成大量零散门禁轮次，集中完成代码+测试+验收说明，push 至 B #142 并记录真实同 SHA CI；只有全部通过再按规则更新 #145 STATUS:B。后续若需要 Integrator-I 吸收成熟成果，须提供精确 B SHA、file/blob、导入范围和原始证据申请 C 签新来源锁；I 不能直接整分支合并。

**R19 明确不是**：创建一个可任意通过的“通用审核模板”、发布第 51 套校规、重写 C CaseStore/SourceLedger、为 Renderer 伪造 Main Principal、把 B 原始 ZIP import 当成正式 ReviewBatchAttempt、用旧 Green CI 证明新代码、自动开启 PolicyPublisher/Decision/Run Writer。

## 6｜验收与产品门禁：不降低质量

**Gate O**：相同精确 commit SHA 的 PR CI、D2 Scoped Pi、Review Baseline 都要 `completed/success`；核对 `bun install --frozen-lockfile`、所有 TypeScript、package boundaries、skin contract、Main+Preload+Renderer build、全仓 Bun `PASS/SKIP/FAIL` 统计及 R19 新用例**原始日志**。若真实首败，记 SHA/Run/首条失败原因/修复差异并重跑**新 SHA**全部门禁；旧 SHA 的 CI 不能借用。可保留回滚锚 R18 直到下一最终 R19 通过。

**Gate E**：真实 Electron 主窗口、真实 Main sender/frame/Owner、原生文件选择、Windows/macOS/Linux、Office71 典型原件与解析精度、中文 IME、100 案/500 文件、ZIP 并发/容量锁、ENOSPC/强杀/跨 PID 重启、SourceRef 回溯、用户撤权；应将高成本实机事项写入集中验收脚本/证据矩阵给本地 Agent 执行，不要用模拟 Bun/SSR 替代，也不必每个独立函数改动后做一次零碎实机验收。

**Gate L**：校方真实政策原件版本/业务归属/授权 Principal/Publisher/独立 Gold/高风险语义正反例。当前 `BLOCKED_NO_AUTH`，**不得由 B 自己批准或猜测**。

**Gate P**：第 51 套候选从真实主窗口无代码完成：5 名非开发用户各 30 分钟独立操作；录像、OS/应用与 exact A/B/C/I SHA、真正文件/SourceRef、错误处理、导入恢复、修订冲突、备份确认、真实版本失效、Check×target 改版、可用性数据与逐人结论；目前 `NOT_RUN`。

**Release = NO-GO**：即使 R19 Gate O 全绿，也不能自动把 E/L/P 写成 PASS、不能合并生产 main 或声称学校可正式使用。

## 7｜新会话执行纪律与结束交付

1. **先读取**：本文（新 B-only R18→R19）；#145 唯一协议最新有效 B/C/I 与 C DECISIONS 区；B #142 最新 SHA 与 R18 实际源码/文档/3CI；C #144/Main wire 的真实有界决定；必要时旧 B-only R12 历史供追索。**A/C/I 不需要读或 ACK 本文**。
2. 严格区分 **B 单线 Gate O 绿**、**I 有界集成 C 签收**、**C Main 技术通道已注册**、**真实 Main authority 已安装**、**School Publisher 已授权**、**真人产品 Gate P** 六种不同状态。
3. GitHub 读写走可用 GitHub connector；若有独立工作树则使用 B 专属分支，不与 A/C/I 共用可写目录。任何上传或 commit 检查最新 SHA 与父提交，乐观锁/expected SHA 更新，不能覆盖并行人工作业。
4. 共享协调文档只能 CAS 更新自己标记 `<!-- BEGIN:STATUS:B -->` 到 `<!-- END:STATUS:B -->` 的状态内容；**不能更改 DECISIONS:C、STATUS:A/C/I、唯一协议规则**。本 B-only 文档可在下一次会话末专门更新，但不让其他线背负新阅读义务。
5. 完成批次后：B #142 实际生产代码/测试/验收报告 + PR 精确 CI 回执；#145 STATUS:B 精确 Gate/权限/阻断更新；简洁告知用户代码 SHA、正反例、三个 Run ID、哪些真实能力尚未接线。遇到需要 C 的事项要走正式 CR，但继续独立 B 开发。
6. **用户偏好**：优先较完整的工程批次及集中实机验收，不能因时间或分支多就降低质量，更不能把工作降成“最小闭环”；一页/一事式清楚交代工程状态，不用华而不实的进度宣称。

## 8｜旧交接与有用证据位置

- 本 docs-only 分支旧 B-only 历史：`docs/design/review-agent/acceptance/v3-dev-b-r01/DEV-B-ONLY-SESSION-HANDOFF-20261020-R12.md`（历史 R12 SHA/43/50 原文统计**已过期**，仅追溯背景）。
- B 工程 #142 分支 R16：`B-R16-C-DECISION-AND-CANDIDATE-READ-REMOVAL-EXTENT-UAT.md`
- B 工程 #142 分支 R17：`B-R17-CANDIDATE-VAULT-ORIGINAL-REVALIDATION-AND-BACKUP-SAFETY.md`
- B 工程 #142 分支 R18：`B-R18-RECOVERY-REAUTH-SOURCE-VERSION-INVALIDATION-UAT.md`
- 真正规则与最新其他线签署：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`，只遵守其最新协议/C 正式裁决，不对其它线派发本文件。

**最终交接判断：B R18 代码与独立 Gate O 已正式收口，R19 尚未开工；现在立刻接续 B2→B1 Check 来源/版本影响的候选技术桥接。下一会话不得重复 R18 或把 B1 UI/Main IPC/Publisher 当成已生产完成。**