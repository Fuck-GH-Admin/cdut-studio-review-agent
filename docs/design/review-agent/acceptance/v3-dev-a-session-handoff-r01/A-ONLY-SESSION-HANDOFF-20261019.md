# CDUT Studio Review V3｜Dev-A 旧会话专属工程交接（2026-10-19 R01）

> **分类：A_ONLY_SESSION_MEMORY / NOT_SHARED_POLICY / NOT_ABCI_ASSIGNMENT / NOT_C_APPROVAL / NOT_I_SOURCE_LOCK。**
>
> **仅供下一位 Dev-A 工程会话恢复上下文。Dev-B、Dev-C、Integrator-I 无须阅读、ACK 或执行本文。** 本文存于四线协调 #145 的 docs-only 分支只是便于持久交接；它**不是**另一份共同协议、跨线任务书、C 安全裁决、I 导入许可或正式工程验收。唯一共同协议、C 决议和各线实时状态仍以 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` 为准。
>
> **所有 SHA/CI/状态均为 2026-10-19 交接时快照。新会话必须重新读取远端而不是继承“当前”二字。** 若本文与更新的工程源码、C 正式 `DECISIONS:C`、PR CI 不同，以新证据为准。不得要求其它三线为本 A-only 文档同步。
>
> 本任务是已有生产研发的连续执行，不是新一轮 A/B/C/D/E 研究，不是重写 Dev-C 的业务架构，也不是为了缩减质量而做“最小闭环”。

## 0. 读入顺序、仓库与唯一共同协议

1. **唯一 A/B/C/I 协作协议**：仓库 `Fuck-GH-Admin/cdut-studio-review-agent`，协调 Draft [PR #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，分支 `docs/v3-integrator-i-r01-taskbook`，文件 `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。读协议版本及 `DECISIONS:C`、`STATUS:A/B/C/I`，获取当前文件 blob SHA。**Dev-A 只能改 `<!-- BEGIN:STATUS:A -->` 与 `<!-- END:STATUS:A -->` 之间的自身摘要。**
2. **本文 A-only 会话记忆**：`docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/A-ONLY-SESSION-HANDOFF-20261019.md`，和同目录 `A-ONLY-NEXT-DEV-A-START-20261019.md`。这两份仅为 A 自己恢复历史，**不需要发给 B/C/I**。
3. **唯一 A 工程 Draft [PR #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)**：分支 `feat/v3-dev-a-pi-execution-r01`，固定母基线 Dev-C C0 [PR #141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) SHA `5682057c7232c914e72fdae525ce95fd33f32b53`／`review-c0/1`。完整阅读 A 工程自有 `docs/design/review-agent/acceptance/v3-dev-a-r01/DEV-A-R01-IMPLEMENTATION-AND-HANDOFF.md`、`CR-A-001-C0-EVENT-EXTENSION.md`，重点 A4-R02/R03/R04、A3-R04/R05；然后逐个阅读 A 的生产源码及对应测试。**A 工程代码和本 A-only 文档分属两个分支**。
4. **跨线只读依赖**：Dev-C 工程 [#144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)、Dev-B [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)、Integrator-I [#147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147)。只有相关接口/裁决变化才进入对应代码核验。C 自己的 `C_ONLY_SESSION_HANDOFF` 属于 C 专属记忆，**A 不要求阅读**。
5. 历史追溯按需用第一轮 #133、1.5轮 #134、二轮 #135–#138、定向 #139、三轮架构 #140；不是再做全仓考古。

## 1. Dev-A 完整身份、A1–A4 业务工程边界

**Dev-A 是 Pi 执行系统与技术可靠性 Owner，不是独立业务 Case/Run writer，也不是 Integrator-I。** 用户要的是高质量持续开发、较大批次集中测试、完整可用的产品，而非一轮轮单点“最小闭环”。

- **A1 Owner / Main-only session & grant**：Main 注入可信 Principal/sender/frame、Case/Run/Plan/source frozen identity、session/grant/process epoch、工具权限；普通对话与审核私有会话隔离；current/expiry/revoke/delete/terminal/pause、恢复重新授权、grantId 轮换；磁盘写前/写后授权重查、CAS、跨 OS PID file lock、cold-start quarantine、崩溃后旧 token 不复活。
- **A2 Host / 原始来源与技术执行事件提案**：严格物理 SourceIdentity/read extent、真实 Host receipt、不可冒用的 Check×target×object×subject/status，Run、attempt、generation、manifest、Plan fingerprint、连续 sequence、canonical SHA-256 eventId、技术 terminal；磁盘候选事件 outbox/replay、重复回执及 body collision，**永远不是 C durable ACK**。旧 `review-c0/1` event 仅技术 C0 proposal；新版 `review-v3-execution/1` local structural producer 需在 I/C 同一 SHA 用 C 共享 DTO/校验器联合类型验证，不能在 A 分支造第二套共享 DTO。
- **A3 技术覆盖、Pi/SDK turn 和执行模式**：9/9 精确 Check×target 和每 applicable source 的 Host read，8/9 / unknown / rejected / missing 不能 `completed-technical`。direct / hidden / graph / batch 的可信 SDK Host port；24 次 SDK turn 预算、Main 来源回执、幂等消费、错误/超时/中断、`needs-resume` 仅技术终态。当前独立适配器并不代表真实四模式 Orchestrator 已挂载。
- **A4 可靠性和恢复**：Owner pause/rotate/revoke、late Host，双 OS PID 的 owner CAS/lock 和 SIGKILL 冷启动、EIO/ENOSPC、前后 await 授权、技术派发意图与未知 Provider 结果、不自动重复调用 SDK；后续真实 Electron/Main/Pi/Provider、跨 PID SDK worker、断电/恢复的集中测试计划。
- **给 I/C 交付可复用切片**：精确 A source SHA/blob、DTO 依赖、正反例、真正 O/E/L/P 与已知缺口，不强迫 I 停止已有固定来源的 I1。仅 Dev-C 可以授权新 shared contract/C2 Main consumer/业务 ACK；I 负责它自己分支的 glue 和统一技术集成，不能替代 A 维护 A-owned 错误。

### 明确的无权领域

C 唯一拥有：`packages/shared/**`、`review-ipc.ts`、Preload 正式 handler、trusted Principal/业务 sender、CaseAggregate/CurrentCase/Plan 正式安装、真实 SourceCurrentValidity、ReviewRun/ReadReceipt/Check durable consumer+ACK、Batch/Decision/Outbox、业务事务和发布/授权。Dev-B 拥有模板候选、素材解析/原件候选、B2 physical staging/SourceRegistry、B3 路由、50 模板来源；A 只消费经 C/B 验证的只读技术端口，不冒充现行学校政策/Gold。C `CR-A-001=APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING` 只批准分层设计与有限技术导入，不等于 A 获得 C2 Run 写权。

## 2. 交接瞬间已核查的准确 Git 与 Gate 快照

| 工程/协调 PR | 交接时 HEAD | 作用、限制 |
|---|---|---|
| C0 #141 | `5682057c7232c914e72fdae525ce95fd33f32b53` | 冻结共同 C0 `review-c0/1`；不是新合同最终业务实现 |
| A #143 | **`0192725d1578662db33ff86e9106d6edabff420b`** | 新 A1/A2/A3/A4 源码及合成负例；**没有 latest Gate O PASS** |
| B #142 | `6549f6c27ff4145306ad0a1f38499a873ed2ec65` | B 并行独立工程，取样时快照，之后可变 |
| C #144 | `917505f5d2d05b2f5930205b2c5464140281f6b1` | C C1 继续研发，含归档/恢复、可信 Main/共享合同方向，之后可变 |
| I #147 | `b4e06e767752865835e146c956412c098e98b1d4` | I1 技术集成 Draft、需精确联合 Gate O/C 签收 |
| 协调 #145 | `2fa23aed081c678e38244f314e8e76e117340f88` | 文档/规则分支，不是 A 源码 SHA；本交接提交后该 SHA 会变化 |

**A 最新 `0192725d...` 工作流（2026-10-19 查询）**：
- PR CI [39254709736](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39254709736)：`QUEUED`；job `118066963319` 请求 labels `self-hosted, Linux, X64`，当次 `runner_name=""`、没有可见分配。不能推断服务器永久掉线，但当次不是 PASS/FAIL 测试。
- D2 Scoped [39254709758](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39254709758)：`QUEUED`。
- Review Baseline [39254709719](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39254709719)：`QUEUED`。
- 较早中间 SHA 因频繁 push 的 PR CI `CANCELLED`，不可当编译失败，也不要为了刷新 status 无意义追加 commit 重置队列。
- 唯一曾**独立绿色**的 A1/A2 C0/A3 旧源：`d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` / PR CI [39228978591](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39228978591)，**4023 pass / 5 OS skip / 0 fail，只证明该旧 SHA**。I1 首批 C 已批准导入的 A SHA 依然是它；I1 C 锚 `31aa352c45a33d6832612884b0fea38e39b5cf8d`，B 源锁 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`。新版 A HEAD 不得自行替换 I 锁。
- C 新 `review-v3-execution/1` DTO + pure validator 曾独立 CI 成功于 `6a9de1ecc4d8d24dc1c29935230b28a579f997df` / PR CI [39240944254](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39240944254) `4012 pass / 5 skip`；不是正式 Run writer/ACK。

**Gate O：PENDING_EXACT_SHA_CI；Gate E：NOT_RUN；Gate L：BLOCKED_NO_AUTH；Gate P：NOT_RUN。** 没有真实 SDK/Provider、Electron 或 C2 正式业务签收。切勿把测试文件存在写成通过。

## 3. A 当前所有生产代码资产与精确状态

路径公共前缀：`apps/electron/src/main/lib/review/`，除特别说明，每项都有同名 `*.test.ts`（A3-R05/R04 等新代码另有专项）。

### A1 — Owner

- `review-pi-owner-adapter.ts`、`review-pi-owner-adapter.test.ts`、`review-pi-owner-adapter-multipid.test.ts`。
- Main-only Owner grant、Run/Plan/source 冻结快照、前后 await 可信 Principal/sender 验证、session epoch、CAS / O_EXCL file lock / fsync、revoke/delete/terminal/paused/recovery-required，Main 同进程显式授权 `resumePaused` 旋转 grant。真实 Bun 双 PID CAS/lock 负例及 post-commit EIO。
- 早期旧绿源可用于 I1；A4 新增 pause/snapshot 等属于未经新 SHA Gate O 的 source-only。另要证明跨进程 SDK 执行唯一性，不可只靠文件写互斥声称全部任务互斥。

### A2 — C0/V3 技术事件提案

- `review-execution-event-adapter.ts` + `.test.ts`：旧 C0 Host read/check、技术 outbox、收据去重/本地 replay；只产生 proposal、不签 C ACK。
- `review-v3-execution-proposal-producer.ts` + `.test.ts`：C-approved **local** `review-v3-execution/1` 形状，Host source block/full-document、Run frozen、Check tuple/status、事件 SHA、连续 sequence、完整源读取与 9/9 技术覆盖、Host technical terminal。`terminalCandidate` 提供已 sealed 技术意图只读预检查。`completed-technical` 不等于业务通过；前后 grant 更替各事件保留原 permissionGrantId，不升级旧授权。
- **未完成**：与 C-owned `V3ExecutionProposal`/`validateV3ExecutionProposal` 同 SHA typecheck/真实 Host receipt registry；C2 durable ACK 只能由 C 完成，I 可做自身已授权的 technical validator/adapters。

### A3 — 技术完整性、24 turn 和 SDK

- `review-execution-event-adapter-completeness.ts` + test；`review-execution-event-adapter-driver.ts` + test：技术 Check/source 完整性与四模式 seam，非实际 Pi Orchestrator。
- `review-v3-execution-turn-budget.ts` + `.test.ts`（A3-R04）：按 immutable Run/attempt/generation 独立持久账本，Main SDK receipt ID 幂等、暂停/恢复计数不重置、ENOSPC/postcommit EIO、24/24 才许可 Host `needs-resume` 候选。重复 `recordCompletedTurn` 回调可能合法，但**不同物理 dispatch 使用同 receipt 不合法**，A4-R04 已收紧。
- `review-v3-main-sdk-turn-bridge.ts` + `.test.ts`（A3-R05）：注入 `V3AMainSDKTurnPort.nextTurn`、运行前后 Owner 和 canonical Run exact check、Main AbortSignal、Provider interrupted/throw、只读 terminal preflight、24/24 终态、同 session 多桥并发 process-local guard。合成 `A3-SDK-01..16` 已提交，未 Gate O 通过。**真实 Pi SDK 回调尚未实际注册，Main/Provider turn receipt 身份尚需证明**。

### A4 — multi-PID、崩溃和未知 Provider 派发

- `review-v3-execution-crashpid.test.ts` 和 `review-v3-execution-late-pid.test.ts`（A4-R03）：真正独立 Bun OS PID 的 SIGKILL/cold owner 和 Host-await 跨 PID revoke 场景；模拟 Main/Host，绝非 Electron/Provider E 证据。
- `review-v3-sdk-dispatch-fence.ts`（A4-R04）：版本 `v3-dev-a-sdk-dispatch/1`，Main Owner grant 下、调用 SDK **之前** hash-sealed + CAS 记录 `in-flight` intent。可信 SDK turn 或 Host terminal 持久化后 `settled`；已返回但因 revoke/paused/AbortSignal 无授权的技术结果 `late-denied`；真实 Provider throw/未知回执、预算持久化失败/崩溃或 EIO 不确定状态留 `in-flight`，同 Run 禁止 SDK 自动再派发（`RECOVERY_REQUIRED`）。
- A4 额外修正：`assertUniqueReceipt(run,dispatchId,receiptId)` 拒绝不同 Provider 派发复用同一个 SDK 物理回执（`REQUEST_ID_COLLISION`）。同一真正派发的持久回调重放仍可由预算账本幂等恢复。
- `A4-DISPATCH-01..06` 合成负例及原 A3-SDK-04/05/09/12 预期调整已经写入 `review-v3-main-sdk-turn-bridge.test.ts`，但全新 Gate O 未证明。
- **核心未闭合**：SDK 是否真的执行过/如何拿回 SDK 原生回执，跨 PID 真实 Provider worker 持久协调、突然电源中断、真实非模拟 EACCES/ENOSPC、派发意图与 C2 ACK 的跨组件事务。A 不得创建第二份 C Run writer 或任意“清账后重跑”命令。

### CR-A-001

协调 #145 C `CR-A-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`：A 旧 C0 proposal、A 版本化 Host producer/technical terminal 方向已获技术准入；正式 C2 Main trusted consumer + unique durable ACK、读来源精度、权限当前性仍 C 独占且未完成。**任何 “A already DONE / final ACK / C business PASS” 属越权和不实。**

## 4. 当前最重要的未解决问题与质量风险（接手首先查）

1. **Gate O runner 未实际运行**：A 当前 SHA 的 PR CI/Baseline/D2 均 queued（见上方 run IDs）；先核 jobs 中 runner assignment、workflow runs 与失败日志。若依然无人调度，应写 `CI_RUNNER_UNASSIGNED_OR_QUEUE_PENDING`，必要时提供可复制的目标机离线 Bun/tsc/build 一趟验收任务，**不把队列时间当 PASS**；不需要为刷新排队不停 push。
2. **A4-R04 的新 ledger 尚未经过静态 typecheck/实跑**：首要审阅 `review-v3-sdk-dispatch-fence.ts`、`review-v3-main-sdk-turn-bridge.ts`、`review-v3-main-sdk-turn-bridge.test.ts` 的类型/语义，重点 `claim→sdk.nextTurn→Host result→budget/proposal durable→settle`，postcommit EIO、paused grant、raw SDK throw、wrong Run、collision、terminal retry；有问题在 A-owned 分支修并保存精确首败证据。
3. **技术派发意图不是最终工作量事实**：如果 SDK 已实际完成而在预算确认前崩溃，`in-flight` 的意义只能是“结果未知”，不能决定重跑或业务失败。恢复机制必须有 C 当前性与真实 Host provenance，必要时另起新 attempt；A 不签 durable business ACK。
4. **SDK receipt ID 的可信来源尚不成立**：目前 `V3AMainSDKTurnPort` 为注入端口，合成 Host 可返回任意非空 receiptId；没有真实 SDK 回调注册、Host receipt registry 或跨进程来源 attestation。不同 dispatch 重用同 receipt 被拒绝是防线但不是实际“SDK 硬件签名”。
5. **任务并发边界有限**：单进程 `activeSDKOwnerSessions` guard 与 Owner 文件 CAS/lock 不等于跨 OS PID SDK worker singleton；需要真实多 PID Provider await/crash/restart 的执行侧专项，禁止重复派发。
6. **Source/Check 完整性不得自证**：A physical full-document 仍依赖注入 Host covered/totalPhysicalBlocks；需对 B2 parser/source registry 的真实完整性做 I/C 联合验证。`8/9`、unknown、rejected、missing、重复 Check、虚读 block/整档、旧 plan/归档版本应全覆盖。
7. **真实 Electron/Main/Provider Gate E、School Gate L、产品 Gate P 均未完成**。集中验收可以后置但不可以删除；不要以合成 Main + Bun 负例替代目标机人机/隐会话/graph/batch/Provider。
8. **新合同与集成版本**：I1 仍锁旧 A SHA，C 新 DTO 在另一个 SHA。没有同 SHA 的 Git blob+CI+联合校验，禁止把新 A2-V3 producer 拿入 I1 并声称 C 已接收。
9. **A4 file journal 安全边界**：本地 hash 封印只检测意外损坏/一致性，不是防恶意篡改的签名或加密，文件权限/重命名/fsync/目录 symlink 等真实 OS 故障面要另验证。

## 5. 推荐下一会话集中工作顺序（不要只写计划）

**P0：冻结事实、解决可验证性瓶颈。**
重新读取 #145 最新 C `DECISIONS:C` 和 A/B/C/I 区，再固定 #143 HEAD、20+ A changed paths、workflow 运行/runner/job/first failure。CI 一旦运行，检查 exact SHA 的 typecheck、boundary、build:main/preload/renderer、全量 Bun 计数、multiPID 场景。失败则在 #143 修 A-owned 源码/测试，不弱化既有断言。若 runner 无法启动，向用户提供**一次集中本机验证任务书**，而不是无限等待/叠加提交；与 CI 未跑的区别要清楚。

**P1：A4-R04 质量收敛与持久故障矩阵。**
核对 SDK pre-dispatch 在真正 Provider 之前持久提交；一轮 Host callback 已返回但 `turn budget` 或 terminal settle ENOSPC、跨进程 stale writer、EIO-after-commit 冷重启、await cancellation/revoke、唯一物理 dispatch receipt。明确 `in-flight` 只能 BLOCK/人工复核，无已授权 reconciliation 不放开 SDK auto-retry。集中添可靠正反例，按真实日志修缺陷而非继续设计文件。

**P2：A-owned 真 SDK 适配边界准备，跨线请求 C/I。**
对真实 Pi SDK API 定位一个可作为`sdk.nextTurn` 的 Main-observed回调以及唯一 SDK Host turn ID 的来源，列出必要依赖与 A-owned glue；先可只读审查。C-owned `pi-case-review-service.ts`、`review-ipc.ts`、共享 DTO/Main 登记若需生产修改，向 C 通过 #145 正式 CR 申请，不得自行写。I 可以在自己的 I-only glue 中做组合/负例，但非 C consumer。**不允许绕过 C 以图接上一个 demo**。

**P3：集中验收 Gate E**（待合适独立技术检查点，而非每个小提交要求本机屏幕）
真实 Electron Main/Preload/Renderer 主体权限、Pi direct/hidden/graph/batch 24 SDK turns、9/9 Check、真实 SourceRef + image/page, Provider 错误及取消、窗口关闭/owner rotate、两 PID 和硬崩溃、磁盘故障、重复 SDK 物理回执；详记录日志、Trace、初始/最终 SHA、测试数量和环境。没有 Provider/学校权限时清楚标 BLOCKED 或 SKIP，不模拟为通过。

**P4：可交给 I 的新成熟 A 切片。**
仅在准确同 SHA Gate O PASS、A/C 接口形状与授权明示后提供源文件→blob→新 I SHA、依赖、测试正反例与 O/E/L/P、回滚。I 旧锁独立继续；新 A 只是候选。C2 唯一 Run consumer/ACK 未授权前，禁止技术候选写正式 Run。

## 6. 仓库与文档的更新纪律

- A 真正工程代码、测试、A-only 技术细节、修复：只提交 #143 分支 `feat/v3-dev-a-pi-execution-r01`，保留 Draft、不要合并 main。
- 当前 A-only 交接两文件**只放在** #145 docs-only 分支 `docs/v3-integrator-i-r01-taskbook` 的目录 `v3-dev-a-session-handoff-r01/`；**它们不是 A/B/C/I 共同必读，不在 `DECISIONS:C` 声明批准，也不影响 I 来源锁**。以后无需为了 A 上下文变长而让 B/C/I 阅读它们。
- 真正跨线进度只写唯一共同协议的 `STATUS:A` 简短摘要。更新前拿最新协调文件 blob SHA（乐观锁）；严格检查只改变 A section，禁止覆盖 C 的 `DECISIONS:C`、其它 STATUS；因并发变化需重新 fetch/rebase 自己一段内容。**本 A-only docs 提交本身不是新的 A 工程状态，不必改共同 status。**
- 本 A-only 文档不许可 A 编辑 `packages/shared/**`、C Main、Preload、Case/Run/Batch/Outbox，也不授权 I 动手。任何新 CR 必须正式写在 C 可裁决的流程，不用本交接推定 C 已批准。
- 最终每轮交付固定 `source HEAD, base, changed files, GitHub CI job+exit/log, first failure, Gate O/E/L/P, live-vs-synthetic, pending blockers, next exact slice`。没有 Bun 本地环境则诚实标 `NOT_EXECUTED_LOCALLY`，不要用“CI 已触发”替代通过。
- User 对于高质量产品交付的明确要求：不降质量做“最小闭环”，更喜欢集中推进功能后进行目标机/虚拟屏集中验收；需要可追溯实证和实改源码，而非持续输出只有任务书。

## 7. 下一会话第一批必须产生的实物

1. 读完本文及 #145 新协议，报告**新的** #143 HEAD、协调 HEAD/blob、C 是否新增 A 相关裁决、CI runner/first failure、真实 Gate O/E/L/P。
2. 针对最新源码核对 SDK 前持久 intent、V3 Producer terminal、A3 24 轮计数与 Run 绑定的具体失败点，**实际修改 A-owned 代码及测试**、提交 #143；如果 CI 真正排队且没有本机环境，提供批量离线验收命令/记录，不虚称 PASS。
3. 明确哪些事实是合成 Host、哪些是实际 Bun 双 PID、哪些还需 Electron/Provider；不把 C2 Run writer/ACK 偷交给 A。
4. 用新 source HEAD 更新 #143 handoff 和 PR 描述，并在 #145 **只修改 STATUS:A**（当真正有 A 新工程进展时）；维持 B/C/I 状态和决策不变。
5. 提交结果：源 SHA、最重要的两三个已解决/未解决问题、测试实证、下一集中工程节点和 Gate E/L/P 阻断。

**直接接手并做实际工程，不要只重复本任务书，不要重新要求用户提供已有仓库、权限或职责信息。**
