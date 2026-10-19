# Review V3｜Integrator-I I0：输入锁定、集成预检与 C 集中裁决包

**Agent** `V3-INTEGRATOR-I-R01` · **协议** `V3-ABCI-GOVERNANCE-R01/V1.0` · **日期** 2026-10-19 · **结论** `I0_PREPARED / I1_CONTRACT_BLOCKED`（仅描述本 I0 输入/测试准备，非 A+B+C 统一集成）

## 0. 实际工程执行与环境限制

1. 全文读取唯一共同协议（#145 blob `c1b1e732e010fef7d0cc9cf629a65fcad88f4d61`）及 I 技术任务书（blob `41d1373aa76f8235937d1c4041cee66f321e30cc`）。协调远端在核验时 HEAD `5613466af85484e58ebc1e8cf7de227087322ad1`；正式决议区 A/B CR 均为 PENDING，**无 C_INTEGRATION_ANCHOR_SHA、无 I 委托租约**。
2. 逐 PR 查询 #141/#142/#143/#144 的最新 HEAD、base/base SHA、完整变动路径、C0 compare merge-base 与 HEAD 对应 PR CI；读取 C0 ownership/manifest、A/B CR、三线 handoff、关键真实源码/函数。基于 C0 的确切代码 commit 建立独立远端分支 `audit/v3-integrator-i0-preflight-r01`，未以 #145 docs 分支作生产 base。
3. 此运行环境 **无法 DNS 解析 github.com，因此未能 clone/创建真实本地 git worktree**，且无 Bun；通过已连接的 GitHub 接口完成 Git 对象/分支/提交和远端检索。后续 clone、`git worktree list --porcelain`、Bun 的本地 typecheck/boundaries/build/target tests **NOT_RUN**。本次保留一个可执行 Bun 测试（`review-v3-integration-i0-gates.test.ts`），不得把 GitHub 上的单线 CI 等同于当前 I0 集成 Gate O。GitHub 新 I0 PR CI 可以独立验证其实际覆盖的命令。
4. 机器可读输入与精确改动目录：`INPUT-SNAPSHOT-LOCK.json`；本报告是详细记录，#145 仅存 I 状态摘要，不造竞争账本。

## 1. 不可变输入（2026-10-19 当次抓取）

| Owner | PR | HEAD（40位） | merge-base against C0 | PR CI 实测 |
|---|---|---|---|---|
| C0 | #141 | `5682057c7232c914e72fdae525ce95fd33f32b53` | 自身 | `39224651824` success |
| A | #143 | `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` | C0 原 SHA | `39228978591` success |
| B | #142 | `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` | C0 原 SHA | `39230036780` success |
| C | #144 | `31aa352c45a33d6832612884b0fea38e39b5cf8d` | C0 原 SHA | `39229456164` success |
| R3 设计 | #140 | `7f954661b3dbca7f0707832c2d097d9c68a965b4` | 不作为代码基线 | 设计证据 |
| #139 L1 风险负例 | #139 | `10d499d6d120dcffc3c1c8a90aabac9302a9757f` | 不作为生产入口 | 历史探针、非真实 GUI 漏洞证明 |

C0 来源：owner manifest blob `36fc8dcf4190f090a5018fde13bee40a2f69c288`；manifest blob `a28532d3afcb8b77e6c432ace0e9648d4e320963`；schema blob `b7e5074a71cba3441aa76dd279c45f7021087bbc`；版本 `review-c0/1`。manifest 的历史 `IMPLEMENTED_NOT_VERIFIED` 是提交前标记；精确 #141 交接与实际五条 GitHub 工作流才证明该 SHA 的限定离线 C0 门禁。

所有 A/B/C PR 当前 base 分支都是 `feat/v3-dev-c-c0-contract-r01`，与 C0 相比均 `ahead`、`behind=0`、merge-base 均精确 C0 SHA。已核对 A 8、B 12、C 14 个测试/生产变动路径；三线之间**没有同一物理路径重叠**，A/B 未触及共享 types、C 的 Main/Case/Run/Preload 独占文件。这个发现只说明此次 path-level ownership 没有直观冲突，**不证明接口语义兼容，也不代表三线已融合**。各线 docs 另归属对应 Owner；全量文件可由其原 PR 文件清单复现。

## 2. 成熟切片与逐函数真实接线边界

| Slice / 来源 blob、函数 | 依赖与可先做的 I 工作 | 分类 / 禁止冒进 |
|---|---|---|
| **A1 Owner** — #143 `review-pi-owner-adapter.ts` blob `356e5b3a290522c5d2db3a55eedac3b7805e69be`，`V3ReviewOwnerAdapter` / `createFileOwnerPersistence` | C0 `RunEvidenceIdentity`、Main 提供可信 `V3MainAuthority`，I 可准备限制 read-only/owner 生命周期测试 | `READY_FOR_ADAPTER`；真实 session/Orchestrator 尚未接 |
| **A2 proposals** — #143 `review-execution-event-adapter.ts` blob `efa0f41cc2dab970b2cc5b92c0c00c3be3c6cf93`，`V3ExecutionEventAdapter` | 仅承载 C0/1 read/check/stopped/failed；I 可测试 proposal 顺序、重放、后 await 撤权，CR-A-001 阻止正式 Run ACK | `READY_FOR_ADAPTER` / 正式消费者 `CONTRACT_BLOCKED` |
| **A3 tech coverage** — blob `0e15f14d2d1bc145acec8325d43e9e6276ead802`，`V3ExecutionCompletenessAdapter`；driver blob `c62d78908ce6156abb3f7be2380a0e64e243242b`，`V3ExecutionHostAdapter` | 技术 Check×target×object×subject、四模式 Host seam；I 可只做旁路观察负例 | `SOURCE_ONLY`；不能把 9/9 技术完成当审批通过 |
| **A4 recovery** — #143 Owner/event journal 与注入故障测试 | A 继续 cross-PID、真实 ENOSPC/EACCES、kill/restart；I 不在无故障卷环境制造通过 | `PARTIAL/SOURCE_ONLY`，Gate E NOT_RUN |
| **B1 Plan** — #142 blob `f140d4f66d741fa29757a8a3ddaba9d9d2cdd038`，`compileReviewB1Plan`、`verifyReviewB1Descriptor`、`requireReviewB1UpgradeAck` | C0 immutable CanonicalPlan；I 预备 fingerprint、unknown、删 Check 升版 ACK 正反例 | `READY_FOR_ADAPTER` candidate-only；`publicationAllowed=false` |
| **B2 staging/parser** — blobs `50dd49f5b985f0f9da98cf63a1934dad0be38d70` / `367390a7cab5d9fbb6ebaa3a25fe6ead942d8ff9`，`ReviewB2StagingService`、`ReviewB2SourceVersionAdapter` | Main 可信 picker/source capability 尚缺；I 仅准备 `sourceForBlock` 解析真实性、source isolation 合同测试 | `READY_FOR_ADAPTER` candidate / 正式 `CONTRACT_BLOCKED` |
| **B3 Router** — blob `dd23b16675a74f7ef82c8037f477bca2f7a306d8`，`planB3ConservativeRouting` | I 侧验证 20s 唯一可信候选、撤回和人工选择；不执行 CreateCase | `SOURCE_ONLY` |
| **B4 inventories** — #142 50 条 G01–G08 candidate-held 来源目录 | 源 SHA 可固定，真实政策/Gold/每 obligation coverage 待 B/授权 | `SOURCE_ONLY`；不是 50 published |
| **C1** — #144 `source-current-validity-v3.ts` blob `b9a8e226b712c91e7e0892e07b8928231632164a`，`revokeCurrentSourceValidity` / `currentSourceValidityBlockers`；`plan-binding-v3.ts` blob `291b270eff7c6f1f83379b06fbcc8a2aa6d2856e`，`bindCanonicalPlanV3` / `upgradeCanonicalPlanV3`；`material-lifecycle-v3.ts` blob `d8534c0d7a52b15cb69fe1e1a4e82d2e7a8186f3`，`archiveMaterialVersionV3` | C1 源码已落地、单线 CI 成功，但尚无 C 出具的统一 I1 锚点、签名的 B descriptor verifier 与可信 Run 消费 | `C1_PARTIAL`，禁止 I 越权直接改正式调用口 |
| **C2–C5** — #144 handoff | Run exact writer、Batch finalizer、Outbox recovery、3栏工作台陆续由 C 独占推进 | `NOT_READY`，分 slice 等真实代码 SHA |

## 3. C 集中裁决：只要四组精确最小决定（可逐端口批准）

### CR-A-001（源 blob `a617ec6ac56bd36ed576138cf032b783afc6d74c`）

- **现有 DTO**：`ExecutionEvent {schemaVersion,attemptId,generation,sequence,eventKind,toolReceipt,manifestHash}`；A adapter local `deliveryId=sha256(JSON(event))`，属于 **A 本地去重键**，不是 C 正式 Run ACK。
- **字段/消费者缺口**：事件无可信绑定的 `caseId/runId/caseRevision/planFingerprint/inputManifestHash`，Check 无 `checkKey,targetKey,objectKey,subjectId,status`，read 无 `documentVersionId/rawSha256/parseRevision/block/location/extent`；技术末态未版本化，正式 `consumedAt/event ACK` 由 C 持久服务唯一签发。
- **请求 C 决策 A-1**：选择严格版本化 extension 还是 `RunEvidenceIdentity`+受控 sidecar；明确 event 唯一键（例如 attempt/generation/sequence 与 payload-digest 的关系）、schema 迁移/兼容拒止。
- **请求 C 决策 A-2**：唯一 Run consumer/Main 授权边界（grant、sender、generation、Source 当前效力、after-await）和入库 ACK/重复/跨案/变更内容 replay 拒止。C 若尚无 C2 Run writer，可以**仅批准 proposal sink 的只读/无业务写适配**，明确不构成 Run。
- **A 应自己补**：Host 实际读取范围可信证明、cross-PID/真实故障、Provider 失败路径与测试，不将技术状态自称正式 Check；I 不替 A 写 Owner 实现。
- **正反例**：同一运行合法连续 read→check 可产生唯一被 C 验证/持久化的事件；1/9 missing、unknown、8/9、旧 generation、撤权后迟到、假 source、同键不同 body、disk-full ACK 全部 fail closed。
- **回滚**：取消新版事件消费，维持 C0 四种技术 proposal 并保留不可确认的 durable outbox；**不得 synthesize 正式 Run 或丢业务历史**。

### B-CR-001（源 blob `2af4cb0a5a5bcbf3c29e20b394025673f1268cd0`）

- **现有输入/DTO**：B1 `ImmutablePlanDescriptorB1` 带 canonicalPlan/authorDigest/sourceLedger/bindingDetails，`publicationAllowed=false`；B2 `B2MainContext`、staging token、解析端 block registry，`SourceIdentity` 来自 `sourceForBlock`，目前无受权 Main 首次发行或完整持久交易。
- **请求 C 决策 B-1**：从 `IpcMainEvent.sender/senderFrame` 和现有可信 owner/session 注册表签发 Main 上下文，native picker/drop 字节能力、stage/grant 与窗口关闭/双击/after-await/revoke；禁止 renderer 上传 `ownerId/actor/physicalSourceKey/sourceRef` 自封可信。
- **请求 C 决策 B-2**：`ApplyMaterial` / `InstallPlan` 受控 CAS 类型命令（expectedRevision/requestId/payloadHash、source/subject/policy verifier、审计 Receipt、旧证据 invalidation），指定调用 `bindCanonicalPlanV3` 的**可信 verifier 实现**。不得把测试 callback 作为生产签名。
- **可先局部批准**：C 可先授权只读候选 Plan 预览/Source registry 查询与技术路由建议，保持 `candidate-held`、无任何当前 Case 事务；C 正式签署前不装载 active Plan。
- **B 应自己补**：完整来源物理解析/ZIP 安全、durable ImportBatch、50 套 obligation/policy 逐项验真、51st no-code UAT 与输入端反例；I 不替 B 成为模板 Publisher。
- **正反例**：合法用户 Native picker→Main grant→parse→有审核授权的 ApplyMaterial，正确拒止旧版本/假 block/同 stem 异路径、角色伪造、撤权、删 Check 未 ACK、未知条件；没有 policy/Gold 只能候选。
- **回滚**：关闭 Main adapter activation，不逆向清洗已经写入的 Receipt/档案；旧 immutable Plan 保留，只中断下一次未通过授权的安装。

### C-I-ANCHOR 与文件租约（独立于 A/B CR）

- **请求 C 决策 C-1**：给首个 `C_INTEGRATION_ANCHOR_SHA`、精确功能范围、合同版本、测试通过范围和仍待修复路径；当前 C1 HEAD **不自动等于** C 签署锚点。
- **请求 C 决策 C-2**：确认 I 新增隔离 glue 测试目录的合规路径。若确需碰 C 独占路径，则逐路径/函数开 `delegation_id`+C 基准 SHA+语义允许范围+测试+失效条件；无租约 I 只提交 patch 建议。

以上为 **REQUEST**，并非 C 的 APPROVED/REJECTED 决议。由 C 在 #145 共用文档第 9 节签署，按批准子范围解锁 I1 切片。

## 4. 三类历史负例及 I1 一致性验收

- **#139 L1-01 当前效力**：Source retire/archive 不得令旧 Observation/EvidenceLink/Check/Run 获得当前认可；合法新版本材料与新确认应能继续进展。历史 probe 是 test-only 状态前置，不断言普通 GUI 漏洞。
- **#139 L1-02 Actor**：Renderer 伪 teacher/system/owner/sender 在 Main 所有适用写入口拒绝，可信 local reviewer 正向路径继续；历史四 Main 写入口 harness 红不代表已验证实时 GUI 利用。
- **#139 L1-03 Batch**：即使低层 finalizer 被调用，缺失 entry Run、错 Run、跨批同案及 hash/revision 不符禁止提交；合法匹配 Run/Decision 能定稿。C2/C3 之前只能列为 `CONTRACT_BLOCKED`，不能伪造新测试的正式通过。

I0 暂存测试 `apps/electron/src/main/lib/review/review-v3-integration-i0-gates.test.ts`：锁 SHA/祖先/改动所有权，禁止未决 CR 被标已接线；运行 C0 unknown、SourceIdentity、proposal-only、Batch binding 正反例。**仅为 C0 + I0 锁验证**，不能当作三线接入的联合负例，执行结果需查询当前 I0 PR 的实际工作流。

## 5. I1 逐片接线、重放及检查点规则

1. C 冻结锚点后从该 SHA 另建 `integration/v3-i1-*`；锁定上一 `I_CHECKPOINT_SHA`、A/B 源 SHA、CR/合同及各原始 blob。不得从 #145 docs 分支或 floating PR HEAD 批量 merge。
2. 优先纳入 **A1 owner/proposal-only** 与 **B1 candidate preview/B2 source registry** 的许可文件级切片；先运行 A/B 自有单元测试，再补 I 自有合成合同负例。未获正式 writer 授权的状态明确 `STAGED_ONLY`。
3. C 批准 ApplyMaterial/InstallPlan/Run consumer 某一端口及锚点后，独立连接对应 slice；相同 Case/Plan/Source/owner/ReadReceipt 的正反例跑在**同一个实际 integration SHA**，不能把不同来源 branch 的绿 CI 并列当 pass。
4. 新 C 锚点必须对旧 I 已接受 commit 做 blob/patch + 行为双查：已被 C 吸收者记录 C commit 并跳过，未吸收的 I-only / imported slices 按顺序重放；重测全部受影响用例。不覆盖 C 正式文件、不 force-push 旧冻结 checkpoint。
5. 每次固定 `{previousAcceptedI, CSourceSHA, ASlices, BSlices, contractVersion, IGlueCommits, newI_SHA, testExitCodes, firstFailure, CReview}`；`C_ACCEPTED_FOR_ENGINEERING` 只能由 C 在对精确 SHA 的审阅后签。Gate E/L/P 继续独立阻断；真正 school/write 需要获授权环境。

**I 可独立继续**：source/ownership diff、静态桥接测试、未接业务的 source/plan/proposal 负例、replay harness、PR CI 故障定位、未来锚点差异检测。

**A/B 应自修**：A journal/owner/Host 真实执行可靠性及可信技术事件；B compiler/parser/staging/authoring 与来源目录；不得由 I 悄悄修其原分支。

**必须由 C**：schema/Principal/Main IPC/Case/Run/Batch/Outbox 的唯一消费写权、trusted picker/InstallPlan/ApplyMaterial、批准子端口、integration anchor、所有权委托与最终工程签收。

## 6. 验证记录、阻断与下一批

- **本会话直接验证**：PR HEAD/metadata、三个 compare C0 ancestor、GitHub source/file blobs、四条 PR CI conclusion、文件级 ownership/no overlap；在内存中校验 lock 的 40位 SHA、merge-base、文件去重、pending 决议、未集成状态。
- **不可声称**：本机 Bun、真实 worktree、单 SHA 联合 build/typecheck/boundaries、Electron/Office、真实 Provider/SchoolPort/政策/Gold、71条产品验收。Gate O **NOT_RUN（联合）**、Gate E **NOT_RUN**、Gate L **BLOCKED_NO_AUTH**、Gate P **NOT_RUN**。
- **下一运行环境必做**：`git fetch` 四线冻结 refs → isolated `git worktree add` 校验 HEAD/clean → `bun install --frozen-lockfile` → `bun run typecheck` → `bun run check:boundaries` → `bun test apps/electron/src/main/lib/review/review-v3-integration-i0-gates.test.ts` → 全量受影响测试（未来真集成 SHA）→ build；记录 exit code、测试计数、日志摘要和首败。不因缺本地验证阻止下一轮独立文档/测试预备，但不准谎称 DONE 的联合门禁。
- **发布结论**：`I0_INPUT_FROZEN + TEST_STAGED`；**不是** `I1_WIRED`、`C_ACCEPTED` 或 `RELEASE_GO`。

## 7. 并发新提交增量核验（不改写第 1 节冻结输入）

核验 I0 首个来源 SHA 后，A/B 在各自分支**继续推进**，证明无法把“最初读到 HEAD”误当“永久最新”。I0 的上表、机器锁和原始代码来源**保留为第 0 检查点**，后续 I1 源入选必须另外锁定和取得精确新 CI。

- **A #143**：新 HEAD `ab1e965e14bf3ccefc8c28828aa26c7390782b62`，相对旧 A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`：`ahead=7,behind=0`、merge-base=旧 A。修改 owner/event/test，新增 `review-pi-owner-adapter-multipid.test.ts`；对应 PR CI `39239221711` 在检查时为 QUEUED，故新切片 `SOURCE_ONLY / CI_PENDING`，不能把旧 A 的绿色沿用。未经进一步运行验证不把 multi-PID 测试称为真实跨 PID 产品验收。
- **B #142**：新 ZIP 增量 `df6b6ba458eb7c6ef2e7a2942ccffa17c72cf2d2` 相对旧 B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`：`ahead=5,behind=0`，新增 ZIP intake/staging 两源码+两测试；新 PR CI `39239062410` **FAIL**。Job `118015179695` 中 `bun run typecheck` 第一错误为 `review-zip-intake-v3-b2.ts:105:35 TS2366`（非所有分支返回值），后续 boundaries/build/tests **SKIPPED**；已在 #142 评论 `6265357010` 将精确失败交还 B，禁止 I 越权修 B 源文件或把新 ZIP 标 READY。
- **B 随后新 HEAD**：`90154a351334866ea13a87a5a850a09b980b3b6c` 是在失败 ZIP HEAD 上 `ahead=1,behind=0` 的提交，仅新增 `review-import-checkpoint-v3-b2.ts`；检查当刻此 HEAD 尚无可见 PR CI，**旧 ZIP TS2366 的修复未获证实**，新来源 `SOURCE_ONLY / CI_NOT_YET_REPORTED`。
- **C #144**：仍为 `31aa352c45a33d6832612884b0fea38e39b5cf8d`，未发现 C 正式新锚点/合同决议。#145 四线协调区 A/B 已 ACK V1.0（在 I 更新前先重新读取；I 只能编辑 I 自己的一段）。

**最新一次的源 HEAD 并非当前已验证入选 SHA**：旧 A/B 继续可作为 I0 锁定的 candidate；新增 A/B 代码须经过对应新 HEAD 的 CI、来源差异和 I 独立预检后才可进批准的 I1。最新源变动不会强制 I 等各线达到同一轮次。

**I0 附加核验**：通过 GitHub 读取当前锁的真实 blob `42b1e73111593d56cb2fd7d89febf9e10a7a17a4`，在 JS 内存实际执行 9 项数据一致性断言，9/9 PASS（包含假 C-owned 路径注入的拒止）。这是 **输入锁逻辑的轻量静态预检**；不是 Bun 定向测试，更不等于联合 Gate O PASS。
