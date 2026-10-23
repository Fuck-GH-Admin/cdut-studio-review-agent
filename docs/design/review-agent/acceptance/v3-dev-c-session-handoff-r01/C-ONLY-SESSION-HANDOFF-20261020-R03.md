# CDUT Studio Review V3｜Dev-C 专属新会话工程与裁决交接（2026-10-20 · R03）

> **C_ONLY_SESSION_HANDOFF / NEXT_DEV_C_ONLY / NOT_ABCI_SHARED_POLICY / NO_NEW_CROSS_LINE_AUTHORIZATION**
>
> **唯一阅读对象：下一位 Dev-C 工程主线与最终业务安全裁决会话。** Dev-A、Dev-B、Integrator-I **不需要阅读、执行、转发、ACK 或同步这份文档**。此文件是 C 会话恢复材料、工程事实快照、下一阶段执行序列，并非 ABCI 共同任务书、不是新授权。必须严格区分本文与唯一四线共同协议中 C 正式签署的决定。**跨线授权只能签入 #145 共同协议的 `DECISIONS:C`；C 状态只能更新 `STATUS:C`，其他三线各管自己的状态。**
>
> 仓库：[Fuck-GH-Admin/cdut-studio-review-agent](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent)。记录日期：2026-10-20（北京时间）。本文件覆盖 R02 交接的进度结论，但保留 R02 为历史；下一个 C 会话必须重新读取远端实际 PR HEAD / 固定 SHA / 同 SHA Actions，不能把时间点快照当成动态签收。
>
> **这次交接最重要的变化**：I3 Stage3 #152 已获 C 正式有界签收（不是 pending）；C #144 的真正 Electron Main IPC/Preload 双通道已通过完整离线 Gate O（不是“尚未做 IPC”）；但 B1 真实作者账本、Main 权威 grant 和真实学校出版源**尚未注入 Main**，所以其生产调用仍是 fail-closed，**绝不是完整可用工作台**。

## 0. 首读顺序和恢复步骤

1. **唯一 ABCI 公共协议（必须完整读，尤重 C 决议）**：PR [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，branch `docs/v3-integrator-i-r01-taskbook`，path `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。先重取 blob SHA，仅以 `<!-- BEGIN:DECISIONS:C -->…<!-- END:DECISIONS:C -->` 中的真实签名为授权事实；状态区可能有历史 PENDING，**必须以同批后来的 FINAL 决议覆盖**。
2. **本 C-only R03 和下一会话启动书**：本目录 `C-ONLY-SESSION-HANDOFF-20261020-R03.md` 与 `C-ONLY-NEXT-DEV-C-START-20261020-R03.md`。其他 ABCI 三线不用看；不替代共同协议。R02 `C-ONLY-SESSION-HANDOFF-20261020-R02.md` 供历史回溯。
3. **真实 C 工程源码**：[Draft PR #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)，branch `feat/v3-dev-c-business-r01`，当前固定 **`331519d3833e254c7d54c18605b50f3252582517`**。检查 main lib review、shared IPC channel、Preload 改动与真正回归；不要只读摘要。
4. **本阶段 C-only 验收证据**：`C-MAIN-WIRE-R01-ELECTRON-IPC-PRELOAD-AUTHORITY-20261020.md`、`C-BCR002-A-TRUSTED-AUTHOR-REVISION-READ-20261020.md`、`C-BCR002-B-REMOVED-CHECK-UPGRADEPLAN-ACK-20261020.md`、`C-TX-R01-CROSS-PID-CASE-CAS-AND-RECOVERY-20261020.md`、`C2-R05-PUBLISHED-PLAN-AND-ORIGINAL-PROVENANCE-20261020.md`。较早 C2-R01/R02/R03/R04 证据按需查，不再重复读一轮历史考古。
5. **精确跨线证据**：A #143，B #142，I3 Stage1 #150、Stage2 #151、Stage3 #152；最新 PR 的独立 HEAD 并不自动成为 I 当前可导入源。冻结 C0 [#141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) `5682057c7232c914e72fdae525ce95fd33f32b53` / `review-c0/1`。先看 I Stage3 本次最新 C 决议，再处理新的请求。
6. 旧架构调查 #133/#134/#135–#138/#139 与架构裁决 #140 仅在具体设计冲突时回查；**本会话是产品生产研发，不是新一轮全仓考古**。

## 1. Dev-C 的身份、生产所有权与四线职责

| 线 | 持续研发职责 | 不可越过的合同 |
|---|---|---|
| **Dev-C（你）** | **唯一主进程受信 Actor/Principal、Main/IPC/Preload/shared 主合同、native Case/CurrentCase、Material/SourceLedger、CanonicalPlan、ReviewRun/Check、人工操作/Decision、BatchAttempt、Outbox/SchoolPort、单案 CAS/持久 Receipt、原生工作台交互与最终业务安全决议** | C 最终决定正式业务和跨线权限；Renderer 字符串、SDK ID、candidate-held 数据与 mock issuer 绝不能被提升为正式可信业务事实 |
| Dev-A #143 | 真实 Pi 0.86.1 AgentSession/Owner/grant、技术 Host proposal、单次 HTTP/SSE、native settled、abort/late/cold restart/SDK fault quarantine、执行可靠性 | A 技术 terminal 或 Provider `x-request-id` 不等于 C Host Read/Check/terminal 物理回执，也不具有 Case/Plan/Decision writer |
| Dev-B #142 | 50 G01–G08 模板和第 51 套候选作者 B1、原件 ZIP/Office/TXT B2/staging/parser/source identity、B3 20s routing、B4 原始材料和业务范围证据/作者 UI | `candidate-held`、`publicationAllowed=false` 并非学校已发布模板或正式 CanonicalPlan，B 不获得 C Main/Preload/shared/Case 写权 |
| Integrator-I #147–#152 | 逐文件来源锁/原 Git blob 重放，组合 A/B/C 已授权有界技术源、I-only 回归、固定 Gate O、回滚与 I 专属证据 | **不是第二个 C**；`I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`；`I-LEASE-BUSINESS-WRITER=DENIED`；绝无自动新 source/浮动 HEAD 合并或 C-owned hunk 权限 |

**C 独占目录/入口示例**：`packages/shared/**`、`apps/electron/src/main/lib/review/review-ipc.ts`、正式 `apps/electron/src/preload/index.ts`、`review-c0-authority.ts`、`case-store-v2.ts`、`review-v3-case-disk-tx.ts`、`plan-binding-v3.ts`、`review-v3-main-author-plan-ipc.ts`、`review-v3-main-trust-port.ts`、`review-v3-run-writer.ts`、正式 C business reader/writer/SchoolPort 等。I 的旧小范围 C-owned 测试追加特例只能对特定旧 SHA 和指定 hunk 生效，不推广成通用写权。

**执行方法**：持续推进可形成产品的完整工程批次，每批 source exact SHA、正反例、TypeScript/boundaries/skin/Main+Preload+Renderer build、Bun 和各适用 Gate O；需要真实 Electron/Provider/校方身份的集中 Gate E/L/P，不用“一点点最低质量 Demo”替代真正开发。失败保留证据，修复只签新的精确 SHA；不因 CI 排队就宣称完成。

## 2. 本次交接时的真实 PR、固定 SHA 与门禁快照

> 下列全部按 2026-10-20 交接时的 GitHub 实际读取。新会话立刻重新读取 PR HEAD 和相应 GitHub Actions。**A R19 此时仍未完成其 PR CI，不得提前签收**。全部 Draft/unmerged。

| 线/PR | 当前可见精确 SHA | 同 SHA 工程门禁 |
|---|---|---|
| **C #144** | **`331519d3833e254c7d54c18605b50f3252582517`** | **5/5 PASS**：PR CI [39321173561](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39321173561) job `118295598895`，Bun **4132 pass / 5 OS skip / 0 fail（4137 tests/477 files）**，8/8 新真实注册 Main IPC handler 测试通过，TypeScript/boundaries/skin/Main/Preload/Renderer build PASS；Baseline `39321173382`、Batch `39321173361`、D1 `39321173417`、D2 `39321173396` 全 PASS |
| **B #142** | **`263b7f36034cacd4d51a00edd5f39266c37037fa`** | **3/3 PASS**：PR `39320422706`、Baseline `39320422642`、D2 `39320422755` 均 completed/success；B R18 在真实 B-owned 代码增加持久 ZIP picker 重选/恢复、源版本失效和当前原件字节重验；不得自动进入 I |
| **A #143** | **`fb2bcc3e6315aba32e94768b86f950244414b775`** | **未完成当前 Gate O**：Baseline `39322397192` PASS、D2 `39322397205` PASS、PR CI `39322397220` **仍 in_progress**。前一独立已绿 A R18 `0febf1248bc6a580a1bc7b3144e0d96ca4313916`：PR `39318050973` 4168 pass/5 skip/0 fail + D2 `39318050981` + Baseline `39318050999` 3/3 成功；**不要以 R18 旧绿签新 HEAD** |
| **I #150 Stage1** | `36dd1c37bc18d7614d8d4835b5213d5cb6459792` | C 已签 `C-I3-FINAL-ENG-ACCEPT-R01`，PR `39306748828` Bun 4211/5/0、Baseline `39306749049`、D2 `39306748965` 3/3 PASS |
| **I #151 Stage2** | `687ed356de3aee59075b85bf09a978eedab12a02` | C 已签 `C-I3-STAGE2-R01-FINAL-ENG-ACCEPT`：PR `39314119021` Bun 4302/5/0、Baseline `39314119022`、D2 `39314119056` 3/3 PASS；固定 A R14 8/8 blob |
| **I #152 Stage3 I-only** | **`8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`** | **本会话新签 `C-I3-STAGE3-I-ONLY-ENG-ACCEPT-R01` / YES_EXACT_SHA_SCOPED**；PR `39317723780` Bun **4307/5/0**、Baseline `39317723768`、D2 `39317723879` 3/3 PASS；仅 1 I-owned 技术测试＋2 I-only docs，5/5 新 technical HTTP↔physical Host 边界回归 |
| #145 唯一协调 PR | branch `docs/v3-integrator-i-r01-taskbook`（不断被 A/B/C/I 更新） | **正式 C 决议已签 I #152**，精确决议 commit `0ae3a501d84128b214704a75ab78823c1434fd51`，不是某个旧 pending 备注 |
| #141 C0 | `5682057c7232c914e72fdae525ce95fd33f32b53` | 唯一 `review-c0/1` 冻结合同，非自动变更 |

**总体产品门禁依旧**：离线 Gate O 在各自批次成功；真实 Electron Gate E **NOT_RUN**、School/policy authority Gate L **BLOCKED_NO_AUTH**、非开发者产品 Gate P **NOT_RUN**，Release **NO_GO**。没有完整单一用户审查业务流程的真正产品签收。

## 3. C 已开发且有真 CI 的成果（不得重新发明）

### C0 / C1：可信身份、原生案卷、业务事务

- C0 Main 身份由活着的 Electron 主窗口/senderFrame 生成，普通 local reviewer 从不凭 Renderer claim 变成 teacher/school；四种原生旧兼容 IPC 绑定 `review-c0/1` 统一范围。
- C1 单份 `review-cases/{caseId}/state.v2.json` 是可信案卷真值；`submitCommand` 内处理 `expectedRevision` CAS、`requestId+type+payloadHash` 幂等/碰撞、业务变更与持久 Receipt 一份原子状态。Native Case 优先，V1 shadow 不可覆写 Native。原生建案/材料、归档/恢复、单据与人工事项、三栏工作台的基础已存在但真实 E 尚未集中验收。
- 不要绕过 C CaseStore 另建“临时作者案卷真值”、双写 PlanStore/RunStore 或让 UI 直接修改制度。

### C2-R00/R01/R02/R03：技术事件、不可变 Run 和受信物理 Host

- `review-v3-execution-contract.ts` / `review-v3-technical-ledger.ts`：按精确 Run/attempt/Owner/source/check/event hash 记录 technical proposals；并不等于学校 Decision。
- `review-v3-run-writer.ts::sealV3ReviewRun`：在原生 Case CAS+Receipt 中保全不可变 Run/Plan/Source/Host 和 `requires-human-review/incomplete/interrupted`，无自动学校通过。
- `review-v3-main-trust-port.ts`：C Main 私有 `admit/record/seal` 技术消费端，重读真实原件 bytes sha256，Owner 真实代次、Host 实际物理来源可撤销/不可伪造。
- `review-v3-main-pi-factory.ts` + `review-v3-main-host-receipt-registry.ts` R03：离线 inert、只构造受约束 Pi AgentSession shape 与独立 physical Host registry；真正 Pi Provider/Main live Port 尚未接通。I3 仍固定较早 C R03 `e87f75e044becc35c28292cc835a2c2ec41df48a`，并没有引入本段之后的最新 C 源。

### C2-R04/R05：Main 装配和真正发行工件的受信**消费端**

- R04 `review-v3-main-trusted-assembly.ts` 集成 published Plan/current Owner/physical Host observer/Pi 工厂的 Main-only inert 组合。固定工程 SHA `b51e5f299ffa68284fc1d187607b658405c8643f`，PR CI 4099 pass/5 skip/0 fail，5/5 成功。
- R05 `review-v3-main-plan-provenance.ts` 消费独立发行者注册记录与真实文件工件，在绑定/Run 每次重新检查 issuer、sha256、CanonicalPlan 完全一致和案卷物理原件；B1 `candidate-held`、撤销、symlink、已修改原件 fail-closed。固定 SHA `8273ff4669d4fe55065584b14513557468beecb8`，PR CI 4107 pass/5 skip/0 fail，5/5 成功。**它不包含有权签发真实学校 policy 的发行服务**。

### C-Tx R01：独立 Bun PID 的本地文件事务及故障恢复

- 新 `review-v3-case-disk-tx.ts` 与 `case-store-v2.ts` 改动：同案多进程 mkdir 排他锁、创建/命令/direct write 保护、完整写+fd fsync+atomic rename+POSIX parent fsync；授权后回收只认有权 Owner 且可证明原 PID 已死亡，不因锁“年纪大”抢锁。C 固定 SHA `c78fec4369e6a893e4a0c89eca48657ea16b17b0`，PR CI **4111/5/0**、5/5 CI 全成功，真实 child PID 的 4/4 竞争/崩溃正反例通过。
- **不证明** NFS/跨主机、Windows 强制断电 fsync、一切 multi-file/Provider intent 的分布式原子性；真实 Gate E 仍需 Linux/Windows/macOS 验证。

### B-CR-002-A / B：已签的两个 C 真实业务合同

- A `review-v3-main-author-revision-read.ts`：Main Principal/session/Owner-generation/window/frame/authorityEpoch 受信，读取 B1 全链最新版本两次、前后重核 revision/digest/document 与当前 grant，输出 `displayOnly/candidate-held`；伪造、失联、撤销、改版 fail-closed。独立 SHA `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d`，**4118/5/0**、5/5 CI，7/7 专项。
- B `plan-binding-v3.ts::upgradeCanonicalPlanV3`：Main 从旧/新不可变 Plan 重算删除集合 `Check×target×object×subject×sorted(sourceVersionIds)`，严格对齐 old/new fingerprint、human reason、完整移除列表和独立 Main 授权源；必须在原 `submitCommand` CAS 中校验 old/new publisher + Case 原件，成功保留旧 PlanHistory 并写**仅一份持久 UpgradeCanonicalPlan Receipt**。无删除保留原 reason ACK。独立 SHA `461b5c9e7abc17a020c843f279118208196f5ef0`，**4124/5/0**、5/5 CI，6/6 专项。UI 自称确认不是正式 business consent。

### **C-MAIN-WIRE-R01：本会话最新真正 Electron Main/Preload API 接线（5/5 Gate O）**

- 新 `review-v3-main-author-plan-ipc.ts` 中 `registerCMainV3AuthorPlanIpc` 在真实 `review-ipc.ts::registerReviewIpc` 注册 `AUTHOR_READ_LATEST_V3` 和 `UPGRADE_CANONICAL_PLAN_V3`；`packages/shared/src/types/review.ts` 声明常量；正式 `preload/index.ts` 只向主 frame 暴露 `reviewAPI.readCurrentAuthorRevisionV3` 和 `reviewAPI.upgradeCanonicalPlanV3`。
- Handler 真实 Main C0 live sender/mainFrame + frame process/routing + Main-derived local Principal/session；`installCMainV3AuthorPlanAuthorities` 仅 privileged Main composition 可提供 current B1 vault reader/Owner generation/grant、`C2MainPublishedPlanSource`，不暴露到 Renderer；实物 issuer/Case originals 在 `upgradeCanonicalPlanV3` CAS 再校验。安装实例被卸载/替换，在 async B1 read 或 issuer/CAS 内不准产生迟到数据或写入。
- 最新 **`331519d3833e254c7d54c18605b50f3252582517`**：PR `39321173561` job `118295598895` full **4132 pass / 5 skip / 0 fail（4137/477 files）**，8/8 真 handler harness PASS、5/5 CI 全成功。旧首败：`eb93bab...` Preload:4031 TS parser 真实失败；后修 `91453c21...` 被新安全提交替代；安装源卸载竞态在 `a6ecd8f...` / `331519d...` 修好，新 SHA 重验全绿。原始失败必须留痕。
- **决定性未完**：B1 `review-template-author-store-v3-b1.ts::readB1AuthorRevision` 仍在 **B 自有 PR #142**，没有被新 C 分支实际导入；Main 没有可认证的真实 Owner/grant 组成源，也没有有权学校 issuer。**C 当前默认没有安装任何 `CMainV3AuthorPlanAuthorities`，真实生产 IPC 必须返回 `C_MAIN_V3_IPC_INDEPENDENT_AUTHORITIES_NOT_INSTALLED`。测试的 issuer/Owner 是合成来源，不是学校批准。不能说“实际业务已可用”。**

## 4. 最新 I Stage3 的决定及精确来源血缘——交接前刚签

**正式 Decision**：`I-CR-I3-R03-I-ONLY=APPROVED_SCOPED` 与 `C-I3-STAGE3-I-ONLY-ENG-ACCEPT-R01 / C_ACCEPTED_FOR_ENGINEERING_I3_STAGE3=YES_EXACT_SHA_SCOPED`。在 #145 `DECISIONS:C` [提交 `0ae3a501d84128b214704a75ab78823c1434fd51`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/0ae3a501d84128b214704a75ab78823c1434fd51)。对应 I [原 CR 评论 6276302601](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276302601)、[精确证据 6276490583](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276490583)，C 另在 [#152 评论 6276999539](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152#issuecomment-6276999539) 与 [#144 评论 6277000413](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6277000413) 同步。

**C 独立核验的真实事实**：
- Stage2 冻结 branch `integration/v3-i3-stage2-accepted-frozen` 精确旧 C 已签 #151 SHA `687ed356de3aee59075b85bf09a978eedab12a02`，Stage3 #152 两个新 commits 三个新增路径：1 I-only `review-v3-integration-i3-stage3-sdk-host-technical.test.ts` blob `fd1957106bee70590da71d06e8cd0c58ef34dfea`（206 行），2 I-only candidate provenance docs blob `bfcc8728...`、`b2029722...`；**没有 A/B/C 源或 C 专属测试、shared/IPC/Preload/Run/Case/Host registry 修改**。
- 精确 #152 SHA `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b` PR `39317723780` full Bun **4307 pass / 5 skip / 0 fail**，Baseline `39317723768`、D2 `39317723879` completed/success；原始 5/5 new I HTTP single real in-memory consumed SSE vs physical C Host deny tests + Stage2 4/4 + C R03 Host 6/6、factory 7/7 PASS。
- 新技术测试使用 fake injected HTTPS transport + Pi event shim；Provider ID 和 SSE completion **不是**物理 C Host Read/Check/terminal，不能接真 Provider/native Pi AgentSession、不能给 C Host durable ACK。
- #152 源锁文件依然标原提交时 `C_ACCEPTANCE_PENDING` 是历史快照，不应为了改变这行去改掉新 C 已签的 exact SHA；以 #145 较晚决定为准。I 的 Stage3 仅此技术来源已签，**另一个 B1 作者实际读源合流预检请求** [#151 评论 6276944405](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/151#issuecomment-6276944405) **仍只是 READ-ONLY PREFLIGHT，不能误认为本 Stage3 授权给 I 导入 B R18**。

## 5. 下个 Dev-C 要解决的真实缺口和推荐批次

### 第一优先：C-MAIN-WIRE-R02 —— 真实受信 B1 读取来源与单向授权装配

当前 Main handler “已注册但默认 deny”是刻意正确的阶段性结果，**不应为了让按钮亮起来而使用 mock B1 vault、mock school publisher、对 `canRead` 返回 true 或本地用户 ID 假装学籍/政策认证**。

执行：
1. 在 I 的 READ-ONLY 来源预检结果或 C 自行只读核验中，固定一个真正 **Gate O 全绿**的 B1 `readB1AuthorRevision`/B author source commit 和精确 file/path/Git blobs；B R18 `263b7f36034cacd4d51a00edd5f39266c37037fa` 新近 3/3 PASS，**但没有 C 的新 I import CR**。若需 I 导入，只可通过新的独立 CR 明确哪几份 B-owned 文件+依赖由 I 技术重放，不能 whole-branch merge，不能浮动 HEAD。
2. 在 C 线上开发安全的 privileged B1 author reader+actual Owner read grant 适配，与 `readCurrentAuthorRevisionV3` 在真实 Main 身份边界组合；禁止 C 重新写一个 B1 vault/修改 B 历史账本来源。对用户未保存变更，提供显式 diff/导出后人工重开修订，不自动覆盖草稿。真实 Main window reload/Frame destruction/Owner rotation/authority uninstall 在 await 后必须拒绝。
3. **必须审查当前接口把 author-read 与 plan-upgrade 的 authority 安装绑定在一个 `CMainV3AuthorPlanAuthorities` 对象上**：作者只读候选恢复不一定需要学校 published Plan issuer，而正式 `UpgradePlan` 必须有 school authority；评估拆成独立 fail-closed reader vs business-writer source install gate，防止没有 school issuer 连合法本地候选只读也无法启用、亦绝不通过伪 issuer 启用 reader。
4. C `upgradeCanonicalPlanV3` 的 renderer 传入 removalAck 已有 CAS 保护和 Main-grant callback，但 **真实用户确认是否确实由可信 Main 观察/绑定 Principal、Subject 与不可重放一次性同意**仍待实机和协议核查；本地 `reviewer` 不能自动升级成学校审批。评估正式 Main-issued challenge/nonce 或签收 receipt identity，要求撤权、重复/重放、窗口置换和 stale revision 均 fail closed；不得增双账本。
5. 校方发行者尚无可信来源：可以继续实现严格 `C2MainPublishedPlanSource` 消费安全和显式未授权提示，但**不得直接绑定测试 mock publisher**；缺 School L 则正式 Plan 安装/业务 Case upgrade 应坚持 deny。与 B 的第 51 套 candidate-held 工作台集成要等单独 Gate E/工作台 CR，不因 UI 接线就自动发布。
6. 写高质量离线 Test O：真实 B1 不变量（sha/history CAS/current revision）、Main frame replay、跨模板/跨案、Owner revoke、发证机构缺失、旧发布撤销、Check removal staleness、Receipt 一次性与 multi-PID crash。每一轮固定完整 SHA 并成功 CI，不继承旧绿。

### 第二批：C2/Run 生命周期 + A/I 合流边界

- C 与 I 的来源差异：I3 当前**较旧 C R03**，C 工程已发展 R04/R05/C-Tx/Main IPC，A 最新 Provider SDK 能力也明显超出 I3 固定 A R14。下一版 I 需新 C anchor/source lock，逐文件证明可兼容并重新跑联合测试，**不能直接替换所有文件**。
- `ReviewRun` 多 attempts/续跑/失败后 Owner 恢复、Run-wide invalidate/tombstone、Provider unknown-side-effect 不能自动复发，Host read/check/terminal 必须真实物理见证；分开技术 SSE 和业务 ACK，保留可靠持久化。旧 Main assembly `invalidateRun` 是否对未知/迟到 Host ID 有 Run-wide 永久防复活围栏是**待核潜在点**，必须读源码后验证，不能直接假设有洞。
- `BatchAttempt` 与 Run manifest/inputHash/Outcome，正式 Decision.basedOnRunId 和 Outbox/SchoolPort 人工批准、补件、学校制度；这些是后续 C 生产职责，避免把“technical completed”当审核通过。

### 第三批：真实 Electron Gate E + 产品 Gate P / 学校 Gate L 分开集中验收

- 依据已经在 C-only `C-MAIN-WIRE-R01-ELECTRON-IPC-PRELOAD-AUTHORITY-20261020.md` 保存的矩阵，用真实 Linux/Windows/macOS Electron Main 与 Preload 跑主窗口 reload、子 frame/导航/关闭、Preload 缺权威源拒绝、作者恢复、B1 改版 CAS 和最终可靠确认；保留脱敏截图/日志、Case state revision/Receipt 前后 hash 与 PID/文件原件 SHA。
- 集中验证 Native 建案/导入/手动编辑/20s route/无合适 50 套模板→条件化通用/临时候选、Plan 用户确认、Pi/Host 真来源、Run 证据、人工 Decision、撤销/审计、导出；不要降低产品质量仅做演示 UI。
- 学校认证/政策原文/已发布来源 Gate L 与 nondeveloper 5 人×30 分钟产品 Gate P 不是 Gate O 替代品；在正式发行授权未证实时不能 Release GO。

## 6. 当前风险与阻塞总账

| 项 | 确认的当前事实 | 应对 |
|---|---|---|
| B1 真实源未进入 C/Main | 仅接口注入和 synthetic handler 正例 | 冻结 B 最新已绿 SHA，先 API preflight + 精确 I source CR，再真实 Main read adapter |
| 可信 Owner/Principal/read permission 未正式接入 | C handler 用本地主窗口和可注入 Main grant；未安装权威源则 deny | C Main 独立源安装、窗口/Frame/Owner epoch at-await 双检、零默认放权 |
| 学校 policy issuer/Gold/出版权限未授权 | B 全 50、51 仍 candidate-held，不能认可学校 Rule | 正式 Plan upgrade/Run/Decision 不开放，不得添加测试 publisher 作为生产默认 |
| 删除 Check 真人确认尚无可用完整工作台 | C business CAS+Receipt 模拟 Main callback 8/8 handler PASS | 需要真实 Principal/Subject 意图及 Gate E，拒绝仅客户端“已确认”布尔值 |
| I3 与最新 A/B/C 工程版本差 | I3 固定 C R03、A R14、B I2；#152 仅 I-only 技术 | I Stage4/new CR 新冻结、多阶段逐 blob replay，不能浮动合并 |
| A 新 R19 Gate O 未完成 | #143 新 SHA `fb2bcc3...` PR CI in_progress、D2/Baseline PASS | 新 Dev-C 再查，不重复声称 old R18 green=R19 green |
| 非本地 FS/崩溃/平台 | C-Tx 仅本地 POSIX 技术 Gate O | 按操作系统/强断电机制独立验收，不能声称全平台 durability |
| 大量学校来源与实际适用性 UNKNOWN | B R18 仍 50 candidate-held、47/50 原 bytes match/3 conflict、G01 34 UNKNOWN、4163 适用性未知（须按 B 最新报告核对） | L 持续 BLOCKED；技术 provenance 不能取代实际政策 |
| 真实产品体验欠完整 | Gate E/P NOT_RUN，发布 NO_GO | 建立完整实机路径统一集中测试，不以通过零散单元测试替代 |

## 7. C 工程操作纪律及跨线回复规则

- 生产工程仅修改 `feat/v3-dev-c-business-r01` Draft [#144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)；**C-only 交接和共享 C 决议**在 `docs/v3-integrator-i-r01-taskbook` Draft #145，交接文档不能推到 A/B/I 工程分支，也不应污染 C 代码 SHA 的 Gate O。
- 共同协议是唯一正式规定。每次更新先 fetch 最新 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` blob SHA；只能在 `DECISIONS:C` 与 `STATUS:C` markers 内改写，冲突时重新取 SHA 且只重放 C 的新增 hunk。**绝不修改 STATUS:A/B/I**。
- C-only handoff 明确 `NOT_ABCI_SHARED_POLICY`，A/B/I 不必读，也不负责它的 ACK。需要对外沟通时在正式 C 决议区以 scope+SHA+Gate+禁止清单签署，并在对应 Draft PR 回复精确评论。
- CI 首次失败要保留真实 job/error、源码根因与新修复 SHA；仅最后相同 code HEAD 的五项或适用三项 completed SUCCESS 才能签 Gate O。工具/Runner transient errors 和 cancelled old runs 不应写作 pass。
- 任何 I 阶段必须是独立冻结来源 Git blob，C 审核 PR changed-file 权限边界、真实同 SHA CI、专业负例；不允许不经 CR 就升级 A R15+、B R18 或 C R04+；I readonly Main lease inactive、business writer denied。
- 不承诺后台自动继续作业；一次会话内尽最大努力完成实际代码和测试，避免反复请求用户确认已知信息。

## 8. 给下一任 C 的第一行动清单

1. 重新核验 #145 本次 **I Stage3 已签**、#144 `331519d...`、A/B 最新 SHA、每项 CI 的同 SHA。先查有无新的 C CR 等待审查，再开始工程。
2. 优先看现有 `review-v3-main-author-plan-ipc.ts`、`review-v3-main-author-revision-read.ts`、`plan-binding-v3.ts`、`review-v3-main-plan-provenance.ts`、`case-store-v2.ts` 和 B R18 `review-template-author-store-v3-b1.ts`。基于已实现的真实 Main IPC 从**受信 B1 reader/Owner grant 装配**做下一完整批次，不重新设计架构，不制造第二份作者数据库。
3. 若来源合流需要 I，在 #145 `DECISIONS:C` 先逐文件签 CR，并只让 I 做按固定 Git blob 的受控源重放和新 Gate O；与 I 当前 #152 I-only Stage3 签收严格分开。
4. 依实际 C 主权推进物理源、正式学校 policy issuer、删除 Check 真人 Main ACK、Run/Batch/outbox 分层；实机 Gate E 和产品/学校门禁集中按严格标准组织。
5. 新会话每批次实码、测试、exact SHA、CI、C-only 证据、公开决议分开交付；持续 A/B/C/I 并行，减少无谓停工与重复调研。

**END: C_ONLY_HANDOFF_R03 — NOT COMMON PROTOCOL.**
