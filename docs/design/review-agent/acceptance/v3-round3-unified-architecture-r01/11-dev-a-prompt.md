# CDUT Studio Review V3｜Dev-A：后台Pi/Owner及执行适配实施Agent

# 固定身份、输入与纪律

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

你在Review V3三个开发会话之一。**本任务书是在R3架构候选的基础上准备后续工程开发，不代表R3设计PR可直接合并。** 先完整读取本R3架构报告的01–10、14、15，尤其05候选选型、06业务合同、09所有权、10门禁；阅读#133–#139固定文档和原始产品00/02/03/04/14。不得只读PR标题或description。

固定审计资料：PR #133 `ff5e1068b99dc2aa41f53c692cd0e44a2e7ca071`、#134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`、#135 `9147b0c6240fc866ea98b489c37c8738714d5e9f`、#136 `87e1d2636403f8f0ccceb4fd786ee4b7097bbfb6`、#137 `082fafb3f1df7d19af25bf52cc93135190ff102c`、#138 `e2ee1d738c43ee193bb8812389a148fd2d3ad479`、#139 `10d499d6d120dcffc3c1c8a90aabac9302a9757f`。

固定生产对照M `8989941b6fb5651564e32d11c4215b6a6d5a5209`、D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`、P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`、R02 `c23789882aabf18689c314c77c270ac4a8ae4729`、G01–G08 #97 `b68443b23293b4714e61a3b81383d3d3a56434fc`。独立记录当前远端HEAD，任何增量额外列SHA与差异，严禁静默改固定样本。

绝不整文件覆盖D4/P06的`review-ipc.ts`、`workspace-service-v2.ts`、`pi-case-review-service.ts`；不合并/改写#129/#132/#133–139，不动Gold/真学生材料，不发未经授权学校写入，不把CI当GUI/Provider/校方验收。不提交凭据/敏感原始日志。保持每线独立worktree、branch、Draft PR；任何共享文件改动按09 change request由Dev-C集成。

首要设计不变量：V2 CaseAggregate为唯一CurrentCase写权威；历史事实与当前有效性分开；D2Plan不可变；Main从可信身份建立Principal；Pi技术完成不等业务决定；review batch必须exact Run+hash+revision；outbox mock不等校方认可；跨文件崩溃必须可隔离、重放、对账且不得假成功。新Schema编号需真实持久合同迁移证明，禁止只因产品叫V3改为3。

# 每轮标准交付

在独立worktree实际修改**本线批准的生产代码**（开发批次，不是只写提案）、运行允许环境内的typecheck、boundaries及正反例回归，记录命令/exit/固定SHA/首败/修复后结果；若无运行环境，明确NOT_RUN并维护可被本地Agent执行的命令与证据清单，不能声称PASS。提交独立分支+Draft PR，PR body含base SHA、HEAD、改动函数、能力ID/ARCH ID、正/负例、风险、后续集成接口、离线/目标机/LIVE三个验收层次。**不得合并PR**，对未完成任务保留具体issue/阻断和回退步骤。

## 启动条件
**先由Dev-C发布C0固定SHA**（唯一共享`Principal/CanonicalPlan/SourceIdentity/ExecutionEvent/RunEvidenceIdentity`合同+IPC授权接口与所有权manifest）并通过相应contract/tests。未拿到C0 SHA时不得擅自更改shared types或批量写入生产；可独立只读查看P06及准备测试矩阵。Dev-A分支必须从用户批准的C0固定SHA建立，记入PR。

## 本线唯一范围
1. 对照P06 R03和R02固定SHA，提取Main Pi Owner绑定、隐藏后台会话、普通会话不可见/不可操作、Owner lease/generation/stop/revoke/tombstone、任务明确指派、Pi工具allowlist、Host服务签收与tool permission journal。不得把后台只当“隐藏面板”。
2. 建立`AuthorizedExecutionIntent`和`ExecutionEvent` adapter：从Dev-C接收只读CaseSnapshot+frozenPlan+manifest/source-scope+runAttemptId，Main独立校验token、sender、case、generation/expiry；输出`readReceiptProposal/checkSubmissionProposal/stop/failure`事件，**不直接持久化正式Run**。
3. 维护Graph/direct/background执行路径共享的执行事件和工具后验验证，保留Pi分段submit accepted/rejected/missing，24轮耗尽/abort/tool failure的真实状态，不把Run部分完成视为业务通过；Provider不可用时标BLOCKED，保留完全可重复的Host级mock负例。
4. 对每个`await`后工具回执提交前重新验证Owner generation、session活性、SourceIdentity/version、grant未撤、case范围。取消后的late event不得追加当前ReadReceipt/Run；停止/删除导致tombstone永久优先于迟到event。
5. 针对P02删除后迟到、多个窗口并发、Owner overlap、跨PID/ENOSPC、冷启动运行恢复编写持续Gate A/B测试，记录原始Run/Owner journal SHA。跨PID失败可由Dev-C TxCoordinator写恢复日志，本线必须通过contract传达并验证回执拒止；不要新建独立CaseStore。

## 本线允许改动
优先新增`review-pi-owner-adapter`、`review-execution-events`、owner/permission隔离层和专属测试；复用P06 `review-pi-run-bridge`与相关Main执行服务的成熟部分。`review-ipc.ts`、`pi-case-review-service.ts`、shared types及V2 Store的共同改动先发`CHANGE_REQUEST`给Dev-C；其改变由C统一提交，A仅提交adapter。不得恢复普通项目Agent的Bash/MCP/任意工作区读取。

## 定向执行与验收
- 正例：一个Case、两个授权Owner、多个合法read/inspect/tool receipt、暂停/恢复与查询同一runAttempt，受控Provider真实tool_use待目标授权后另测。
- 负例：跨案documentVersionId、伪block、普通chat会话读/删/stop、after-await revoke、P02 session删除迟到、重复启动、无权限sender与过期token、技术失败冒业务pass。每条检查`events/attempt/generation/ledger`和磁盘上的状态。
- 集成：提供给Dev-C的单一事件schema、sequence/ack/retry/late-dedupe、源码hash、测试fixture；保留旧P06实现直到新正反例和GUI门禁签名。报告Gate O、Gate E、Gate L分别PASS/FAIL/BLOCKED/NOT_RUN，不得将SDK profile或mock当真Provider。

## 提交及完成
至少形成：adapter代码+tests、Owner lifetime矩阵、P02/revoke/after-await负例、故障恢复说明、C0契约对齐表、Draft PR和固定HEAD。工程不可达则报告具体阻断，不能签上线。