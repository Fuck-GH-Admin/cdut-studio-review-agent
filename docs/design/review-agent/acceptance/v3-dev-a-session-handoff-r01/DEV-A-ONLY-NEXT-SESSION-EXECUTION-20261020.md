# CDUT Studio Review V3｜下一 Dev-A 会话持续工程任务书（A4-R19）

> **DEV_A_ONLY_CONTINUATION_TASK / NOT_SHARED_ABCI_POLICY / NOT_REQUIRED_FOR_B_C_I**
>
> **任务身份：V3-DEV-A-CONTINUATION-R03 / R19**。这是下一任 Dev-A 的专属执行书；B/C/I 既不必阅读也不必 ACK。它不会修改 DECISIONS:C 或赋予任何正式 Main/Provider/Business 生产权限。**执行前必须以远端最新 SHA 和 C 签署决议重新确认。**

## 0. 一次性恢复会话：先读什么

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

- **共同正式协议（首读，最新 HEAD）**：Draft PR #145，docs/v3-integrator-i-r01-taskbook 分支的 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md 。完整核对最新 DECISIONS:C、STATUS:A/B/C/I。A 只可更改 STATUS:A 标记区，任何 C 合同/生产 lease 以 C 显式 CR 精确签收为准。
- **本会话详细专属档**：同分支 docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/DEV-A-ONLY-SESSION-HANDOFF-20261020.md ，标记 A_ONLY_SESSION_MEMORY，B/C/I 不需要读。这是本任务书配套的完整历史、责任、进度、首败、安全边界。
- **实际 Dev-A 生产仓库**：Draft PR #143，feat/v3-dev-a-pi-execution-r01，交接已验证的正式 R18 SHA **0febf1248bc6a580a1bc7b3144e0d96ca4313916**，PR CI 39318050973 / job 118284575212 **4168 PASS / 5 OS SKIP / 0 FAIL**，D2 39318050981、Baseline 39318050999 **3/3 SUCCESS**。目前 PR Draft/unmerged，C0 ancestor 5682057c7232c914e72fdae525ce95fd33f32b53 。先独立重查远端 SHA 和这三个工作流；不得用过期交接头当代码 HEAD。
- **C 最新并行 R01（只读，不是 A 权限）**：C Draft #144 已在旧绿 461b5c9 之后增加真实 Electron Main/Preload 作者修订读取和 UpgradePlan IPC 注册 C-MAIN-WIRE-R01，核对时最新 C SHA eb93bab2c34166495f22553b7861da61fe3974d6。新 SHA PR CI 39320415985 与 D2 39320415884 TypeScript **FAIL**，Baseline 39320415923、Batch 39320416036 SUCCESS；D1 39320416037 尚未终结。C 必须在 C-owned 代码中重验，不能据源码存在称正式接口可用。更重要的是，此批 **不是 A Pi/Provider IPC 接线**，没有任何 A 写入 Main/Preload 的 lease；下一 Dev-A 只读关注，不接管 C 的修复。
- C-MAIN-WIRE 连续修复状态： **最终交接快照更新**：C 又提交新修订 SHA 91453c21fded936de8e4dbd3ee14545c5a2ff9ab，5 套同 SHA Actions：PR 39320769078 / D1 39320769024 / D2 39320769052 在运行，Baseline 39320769076 SUCCESS，Batch 39320769122 QUEUED，**当前新 SHA Gate O=PENDING，禁止借前次失败或旧绿推定结果**。这是 C 自有 Main author/Plan IPC 工作，不改变 A Pi/Provider 权限；新 Dev-A 必须实时复核。
- **C/I 关联（只读）**：Dev-C #144 最新工程/DECISIONS:C；I3 Stage1 #150、Stage2 #151 (C 已签 687ed356de3aee59075b85bf09a978eedab12a02)；Stage3 候选 #152 (8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b，3/3 technical PASS，但截至交接时仍 **C signature pending**)；B #142 只在 A 任务依赖来源/Plan 时读取，不要对其 candidate-held 推断学校发布。
- C 对 A 的 CR-A-PI-HTTP-WITNESS-R01 仅批准 **C_ONLY_OFFLINE_FACTORY**；PRODUCTION_ATTACHMENT_DEFERRED。I3 的 A 技术来源 **只锁 R14 56f450f3c783299ceb0a6489bf855a1ba8f0a913**；R15–R18 不是已获批准的 I3 import。

## 1. 你的角色和本批唯一核心目标

你是持续 Dev-A，而不是 C 的业务合同 Owner 或 I 的跨线 integrator。A1 Owner/Session、A2 技术 Host proposal、A3 24-turn/SDK turn bridge、A4 SDK Provider dispatch 与故障恢复仍是你的责任。

**本批必须进行实质 R19 工程开发**：真实 Linux/Bun 子进程里运行真正 Pi 0.86.1 createAgentSession() + 受控 OpenAI Responses SSE，A 的真实 Owner/file CAS、派发 intent、技术预算/提案落在实际临时磁盘；在“派发意图已持久、真实 SDK 开始消耗一个受控 HTTP fetch”这个确定点发真实 SIGKILL，然后使用新子进程/父进程的新 Main-owner adapter 独立重新打开持久账本，证明未知 Provider 副作用不能被新进程隐式擦掉或自动重发。

相比历史覆盖的变化：
- R08 是 **实际 OS PID/SIGKILL，但 SDK completion 合成**；
- R16/R17/R18-01/02 是 **真正 Pi SDK/Responses，但单 PID + 受控 HTTP response**；
- R18-03/04 是 **新 Owner adapter 实例 + 持久账本 + 合成迟到 SDK promise，不是真第二进程**。
- **R19 要把“真 Pi SDK 与真子进程 SIGKILL/跨 PID 冷恢复”放入同一可复验场景**，并独立测试“旧 PID 仍存活/回调迟到”和“真被杀的旧 PID 无回调”两种不同事实。

**不要重写 C-Tx 正式 Case 事务系统，也不要把 A 的技术账本升级为 C 正式 ReviewRun。**

## 2. 生产/测试所有权边界

A-owner 技术源：
- apps/electron/src/main/lib/review/review-pi-owner-adapter.ts
- apps/electron/src/main/lib/review/review-v3-sdk-dispatch-fence.ts
- apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.ts
- apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.ts
- apps/electron/src/main/lib/review/review-v3-pi-http-provider-engine.ts
- apps/electron/src/main/lib/review/review-v3-execution-turn-budget.ts
- apps/electron/src/main/lib/review/review-v3-execution-proposal-producer.ts
- 现有 review-v3-sdk-dispatch-crashpid.test.ts、review-v3-native-pi-offline-sdk.test.ts 及配套 A-only tests。

先以只读源码确认 import、目录和现有能力；新 R19 测试可单独 review-v3-native-pi-crosspid-r19.test.ts 等 A-only 文件，不强求改已有文件。发现真正 A-only 安全漏洞才改生产，并保留首败。

**禁止**：packages/shared 合同、review-ipc.ts、pi-agent-adapter.ts 普通代理/sanitizeContextForInference、任何 C-owned Main/Preload/正式 Case/Plan/Run/ReadReceipt/Check/UpgradePlan/Decision/Outbox/SchoolPort/Business writer，除非 C 对具体函数、具体源 SHA、特定受托者发布另一个 CR。无真实凭据、不联系外部 Provider、不新增隐式 network retry。

## 3. R19 第一工程节点：搭建可信的真实 OS 子进程执行测试

1. **先读两个已绿素材**：review-v3-sdk-dispatch-crashpid.test.ts 的 Bun process.execPath、SIGKILL、文件账本/marker、try/finally；review-v3-native-pi-offline-sdk.test.ts 的真正 ModelRuntime.create / createAgentSession、临时 authPath、SessionManager.inMemory、SettingsManager.inMemory、openai-responses /v1/responses、原生 event trace 和受控 transportFetch。
2. 独立 temporary root 内建立 owner.json / dispatch.json / budget.json / events.json，创建受 Main 注入的离线合规 Principal、Run/Plan/source, grant 当前 Owner，初始化 V3ASDKDispatchFence / SDK turn bridge/physical port。dispatch.claim() 的 sync/CAS/fsync **必须在进 Provider transport 前**实际成功提交；父进程独立 read journal 验明 in-flight。
3. 真 child Pi SDK 进入被测试拦截的 https://provider.r19.invalid/v1/responses 时，在 mock transport callback 内输出受控启动证明（PID、sessionId/dispatchId、Run、已持久日志 digest）；随后阻塞返回流或保持真实 SSE body pending。**禁止先随意写“已进入 SDK”的 marker 再启动 SDK**，那不是物理请求发起证明；也禁止事后基于 PID 存在推断 fetch 已调用。
4. 父进程观察明确握手，校验账本中的 grant/dispatch/run/PID 后，向该 **真实 OS child PID 发送 SIGKILL**，等待 exit signal，不能只用 child process.kill 自杀前一个合成 nextTurn 的旧 R08 路径冒充新证据。
5. 第二真实新进程（或先在父进程中构造独立 Owner/Dispatch 实例，再增一个 true child reader）重新打开**同一磁盘目录**，不得重置/删除 owner 或 intent；quarantineInterrupted() 正式持久化旧 Owner 为 recovery-required，dispatch.unresolved(run) 必为 true，usedTurns=0，技术 proposal 为空，不可生成成功回执。
6. 新 Owner 尝试新 attempt/runId 但**相同 Case**，dispatch.claim() 必拒 Unresolved SDK Provider dispatch on prior Run/Case；若在授权模型下另一 Case 能执行，作为对照验证锁域不是无条件全局阻塞。任何不确定 outcome 先 recovery，不能按超时自动重派。

注意 spawnSync 会阻塞父进程，不便在子进程真实 Provider fetch 卡住时按握手注入强杀；倾向异步 spawn + stdout/file barrier + SIGKILL + bounded timeout + cleanup，保留可重放的真进程退出证据。使用 Linux CI 可执行特性检测，其他 OS 的跳过必须报告为 skip，不能当 pass。

## 4. 第二工程节点：撤权、迟到回调、双 PID/磁盘故障的正反例

- **R19-01 / 核心**：真 child Pi SDK 请求已开始 + 持久 intent → OS SIGKILL → 新 PID Owner quarantine+durable physical unresolved，0 turn、0 proposal、无 provider success。保留 PID、原生 event 先后顺序、request count、日志 sha、原 commit 等证据。
- **R19-02 / 同案阻断 vs 异案允许**：跨新 attempt/generation/新 Owner session 也不能借更换 runId 重派同一 Case，异 Case 能否执行必须使用独立合法 Principal/Plan/source 的真实授权，不能用伪 Run 绕过校验制造假阳性。
- **R19-03 / 旧 PID 未死**：两进程持不同 Main processEpoch、同一 Owner 文件/SDK session 的锁竞争/撤权，旧 SDK 超时后返回成功不得绕过新 Owner；必须区分“活的旧 PID 迟到回调”与“被 SIGKILL PID 已不可能回调”。真实 IPC/文件屏障触发并保证无 deadlock。
- **R19-04 / 宕机与写失败**：选择有实际实现的 postcommit EIO / ENOSPC / CAS 冲突发生点核验；in-flight 可能已物理提交却调用方得到错误时，重开必须按 unknown side effect 阻断，不能利用旧缓存误清账。现有负例完整保留。
- **R19-05 / 回执污染**：即使 fake SSE 给出 response.completed + clean EOF + SDK settled、x-request-id，也不得凭此创建 C 独立 privileged Host read/check/terminal 或 C2 durable ACK；若要跨线签这类合同，只做只读接口差分报告并经 C/I 另申请受控测试。
- **正常对照**：不强杀时真正 Pi SDK 仍应仅 1 次受控物理 fetch、R17 clean SSE transport EOF 必须满足、Owner/Run source 不变、R18 revoke 在 agent_end 与 agent_settled 缝隙继续拒止。

不能为通过 R19 弱化 R17 sseTransportEof、R18 cold-snapshot CAS 或 turn-budget/dispatch fence；也不要因为强杀测试难做就改回仅合成 callback 然后称“真 SDK PID 通过”。

## 5. 批次施工/集中 Gate O 顺序

1. 完整核验 GitHub #143、#145、C DECISIONS:C、I3 #151/#152；登记 R18 fixed rollback 0febf1248bc6a580a1bc7b3144e0d96ca4313916。
2. 阅读现成 A-only 生产实现和测试；列出本 R19 真 OS/SDK 的具体可信握手，至少完成 R19-01/02 的可执行实现，再扩展 03/04/05；不是先写长调研文档。
3. 测试或生产改动**只写 A 工程 PR #143**。非实机部分快速定向 Bun，可用 GitHub Actions CI 为真实运行证据。若本执行环境无 Bun，不能假称本机执行。
4. 把能无实机通过的安全负例集中做完，达到单个固定 HEAD 后才跑统一 PR CI、D2 Scoped Pi、Review Baseline。所有 workflow 必须是**相同精确 SHA**、completed/success。PR CI 需 frozen deps、全仓 TypeScript、boundary、skin、Main/Preload/Renderer build、全量 Bun，且 R19 每项新增案例在 job raw logs 逐行 PASS。
5. 如 CI 真首败，诊断 first failed step/stack、保留失败 SHA、作最小可信修复、产生 **新** SHA、重新对新 SHA 跑完整三项，不借旧 SHA 的 green。不可绕过 Linux child crash 证据要求，不能随意取消前一个慢 CI。
6. PR #143 里给出本批技术报告、实际 SHA/blob/run/job/测试证据/回滚点。协调 #145 **仅更新 STATUS:A**（最新 blob-SHA 乐观锁），不要修改 DECISIONS:C 或其他线进度。纯 A 会话交接文档只存 #145 A-only 专属目录，以免破坏 A 已签绿色 SHA。
7. 如果发现 C/I 必须处理的真实接口问题，在 C #144 给 exact CR（source SHA/path/blob、签名 scope、API/Principal/Owner/Plan/Host、错误恢复/验收 Gate），等待 C 独立决定。**I Stage2 固定 A R14 8/8 blob 不会自动因为 A R19 更绿而更新**。
8. 只有有真实 Electron 主进程、授权 Provider、School/Host witness、凭据/路径与原始网络/多 PID 证据才允许 Gate E 改写；其前始终 E NOT_RUN、L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO。

## 6. 新会话回复要求（工作执行，不是礼貌复述）

第一回复先给用户：实际 A HEAD 与 GitHub 3/3 Gate O，C/I 最新 SHA/许可与 R19 边界；然后**立刻开始**第一批真实代码提交（优先子进程 + 真 Pi SDK + durable claim + SIGKILL + cold reopen）。同步给出真实提交与 CI；不再重复问用户已经提供过的仓库、角色、验收批次或是否继续。

**成功定义：** 新固定 SHA 有实际可执行的 R19 真实进程/原生 SDK/持久化恢复证据，且全部适用的集中 Gate O 真实 PASS；不是生成漂亮的任务清单、模拟 HTTP 头、伪造校方 ACK 或“最小闭环降低质量”。

**当前已核实状态（仅交接快照）**：Dev-A R18 0febf1248bc6a580a1bc7b3144e0d96ca4313916 3/3 PASS、4168 PASS/5 SKIP/0 FAIL；R19 NOT_STARTED；Gate E NOT_RUN、L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO。