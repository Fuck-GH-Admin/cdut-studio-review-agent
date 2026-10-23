# CDUT Studio Review V3｜Dev-C：统一业务核心、共享合同及工作台实施Agent

# 固定身份、输入与纪律

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

你在Review V3三个开发会话之一。**本任务书是在R3架构候选的基础上准备后续工程开发，不代表R3设计PR可直接合并。** 先完整读取本R3架构报告的01–10、14、15，尤其05候选选型、06业务合同、09所有权、10门禁；阅读#133–#139固定文档和原始产品00/02/03/04/14。不得只读PR标题或description。

固定审计资料：PR #133 `ff5e1068b99dc2aa41f53c692cd0e44a2e7ca071`、#134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`、#135 `9147b0c6240fc866ea98b489c37c8738714d5e9f`、#136 `87e1d2636403f8f0ccceb4fd786ee4b7097bbfb6`、#137 `082fafb3f1df7d19af25bf52cc93135190ff102c`、#138 `e2ee1d738c43ee193bb8812389a148fd2d3ad479`、#139 `10d499d6d120dcffc3c1c8a90aabac9302a9757f`。

固定生产对照M `8989941b6fb5651564e32d11c4215b6a6d5a5209`、D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`、P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`、R02 `c23789882aabf18689c314c77c270ac4a8ae4729`、G01–G08 #97 `b68443b23293b4714e61a3b81383d3d3a56434fc`。独立记录当前远端HEAD，任何增量额外列SHA与差异，严禁静默改固定样本。

绝不整文件覆盖D4/P06的`review-ipc.ts`、`workspace-service-v2.ts`、`pi-case-review-service.ts`；不合并/改写#129/#132/#133–139，不动Gold/真学生材料，不发未经授权学校写入，不把CI当GUI/Provider/校方验收。不提交凭据/敏感原始日志。保持每线独立worktree、branch、Draft PR；任何共享文件改动按09 change request由Dev-C集成。

首要设计不变量：V2 CaseAggregate为唯一CurrentCase写权威；历史事实与当前有效性分开；D2Plan不可变；Main从可信身份建立Principal；Pi技术完成不等业务决定；review batch必须exact Run+hash+revision；outbox mock不等校方认可；跨文件崩溃必须可隔离、重放、对账且不得假成功。新Schema编号需真实持久合同迁移证明，禁止只因产品叫V3改为3。

# 每轮标准交付

在独立worktree实际修改**本线批准的生产代码**（开发批次，不是只写提案）、运行允许环境内的typecheck、boundaries及正反例回归，记录命令/exit/固定SHA/首败/修复后结果；若无运行环境，明确NOT_RUN并维护可被本地Agent执行的命令与证据清单，不能声称PASS。提交独立分支+Draft PR，PR body含base SHA、HEAD、改动函数、能力ID/ARCH ID、正/负例、风险、后续集成接口、离线/目标机/LIVE三个验收层次。**不得合并PR**，对未完成任务保留具体issue/阻断和回退步骤。

## 优先级最高的C0启动工作（**必须先于A/B大批次开发**）
1. 确认当前远端HEAD和#133–139每个固定SHA；审视R3 05的增强A选择与反证。以main `8989941b6fb5651564e32d11c4215b6a6d5a5209`作为首个工程集成起点，不把D4/P06整支合并；若因实际依赖必须改变起点，提交source-level差异报告并要求架构审批。
2. 创建独立`feat/v3-dev-c-contract-r01` worktree/branch。定义`Principal/AuthorizedCaseCommand/CanonicalPlan/SourceIdentity/RunEvidenceIdentity/BatchEntryBinding/ExecutionEvent/OutboxReceipt`，每个类型说明Writer/ReadOwner、version、兼容/unknown、持久/传输边界。
3. 实作最薄但**真实可运行**的Main IPC→可信Principal→业务命令安全路径，冻结Renderer actor“不可信”和4个写IPC的安全负例；增加合法本地reviewer正例（教师身份凭据正例外部条件不足则BLOCKED且不可模拟签名）。
4. 形成`shared-file-ownership-manifest`与`AdapterChangeRequest`协议、接口测试和C0完整typecheck/boundaries。**提交固定C0 HEAD给Dev-A/B，未形成可运行C0不要通知两线开始大批次生产。**

## C1–后续本线唯一业务权威
- 重构V2 CaseAggregate/CAS/Receipt为唯一写路径；移除**新案**V1 case.json双写，保留read-only/migration shadow。保留Observation人工确认、EvidenceLink多对多/状态、人工任务、流程、补件、评分回避、申诉、报告/离线包、历史Run。
- D2 Plan绑定冻结、Version/SourceRef current validity级联：材料归档必须保留旧Observation.value/source/Receipt、撤销其当前confirmed与link/read/Check/Run validity、禁止改Subjects/Rules/fingerprint；同构L1-01无需删Plan或手工造Run就测试真正的`readiness→decide`拒止。
- Dev-A只送授权Pi事件；Dev-C独占`ReviewRun`持久化和finality，聚合Check×target完整覆盖与read receipts/Manifest hash，拒绝9漏1/1680-1480差200/unknown/执行失败当PASS；历史run@rev不可转真实Run。
- `ReviewBatchAttempt`和Case/Run/Decision写所有权统一：每个finalize/auto/group/retry/outbox写入口在事务**最终提交**重新核exact CaseId、AttemptId、RunId、Decision.basedOnRunId、source hash、Plan fingerprint、revision、授权；既要有正常auto正例，也要有Main直调finalizer负例；旧done无Run严禁backfill latest。
- 应用层Main Principal与领域role gate双层生效；`RESOLVE_APPEAL_V2`只能让校方可信teacher按明确业务政策处理，不能删role gate、硬编码teacher或接受renderer actor。
- Outbox与Aggregate/Run/Batch独立文件建立持久intent journal、acquire跨PID fence、commit/recovery/replay/reconcile，外部学校ack与mock/HTTP-accepted区分；ENOSPC/crash后`RECOVERY_REQUIRED`阻断自动出站与正式决策。
- 工作台统一三栏来源/规则/结果与SourceFocus、历史只读、补件、申诉、评分、批次异常及动态模板；Renderer仅展示readModel并请求命令，不成为另一个当前状态写权威。按R3 07七旅程完整验收，而非只做minimal demo。
- 历史旧案Shadow read、hash校验、copy migration、rollback/tombstone、Report/Receipt/Outbox保持，旧新模式数据不交叉污染；禁止直接抹掉旧Score/Run或允许旧写路径恢复双主。

## 共享文件与合并责任
`review-ipc.ts`、`workspace-service-v2.ts`、`pi-case-review-service.ts`、`packages/shared`、Preload、`case-store-v2.ts`统一由C在集成分支上处理。Dev-A/B的接口请求需在C批准后以单项adapter补丁进入；每个重要hunk标明D4/P06/R02源SHA、合同ID、回归与回滚，不直接取另一分支同名文件全部覆盖。

## Gate与分阶段完成
- C0：shared DTO + Main Actor trust bound及4 IPC spoof reject；固定HEAD/PR；A/B据此派生。
- C1：Case CAS+旧双写停用+Plan frozen、Observation archive CurrentValidity；L1-01旧红→绿，老Receipt/Run保全。
- C2：Run/Coverage/read ledger + Pi adapter；9漏1/差200/unknown完整负例。
- C3：Batch Attempt exact finalizer，Main/auto/group各路径旧红→绿；R02双绑定不变量。
- C4：Outbox Tx crash/跨PID与恢复、可信school role/appeal授权、旧案migration/read model/三栏GUI；集中Electron真实Office与Provider测试准备。

可按以上数个批次集中目标机验收，但每批**必须**有typecheck/boundaries/CAS/finalizer安全负例，保存首败、修复后日志和固定HEAD。没有Provider/学校授权和独立Gold只能输出BLOCKED，不能称完整产品或已上线。

## 本线交付
C0接口/所有权文档和可运行代码、分阶段独立Draft PR、完整72能力与20 ARCH的回归更新、迁移/恢复协议可执行测试、七旅程readModel测试、A/B接口集成固定SHA与Release GO/NO-GO。正式上线只能在独立Gate O/E/L签名后申请。