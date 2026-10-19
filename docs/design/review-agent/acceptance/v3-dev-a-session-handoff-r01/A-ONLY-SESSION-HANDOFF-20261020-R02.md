# CDUT Studio Review V3｜Dev-A 专属会话交接（R19-07 → R19-08/R20，2026-10-20，R02）

> **A_ONLY_SESSION_MEMORY / FOR_NEXT_DEV_A_ONLY / NOT_ABCI_SHARED_POLICY / HISTORICAL_SNAPSHOT**
>
> **只有新任 Dev-A 为恢复本工程会话而阅读本文件。Dev-B、Dev-C、Integrator-I 没有阅读或 ACK 的义务，也不应把它当作跨线任务书。**
>
> 本文件不变更任何授权，不批准生产接线，也不改变四线共同规则。唯一统一协调/授权来源仍然是 PR #145 的 ABCI-UNIFIED-COORDINATION-AND-STATUS.md 内 DECISIONS:C 及各线 STATUS。本文固定的是 2026-10-20 已核实的 Dev-A 快照；接手前必须实时重新核对远端 PR/CI/SHA。

## 0. 交接结论（不可将已完成工作重新标为待开发）

- 工程仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- 身份：**Dev-A 持续真实工程研发**；非 Dev-C 业务 Owner、Dev-B 模板/材料 Owner、Integrator-I 跨线集成 Owner，也非新的只读考古会话。
- A 工程 Draft：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143
- A 工作分支：feat/v3-dev-a-pi-execution-r01，**最新已绿色精确 HEAD：341c01144a5960b47f915461ee9d5e26a570ae20**。PR open/Draft/unmerged，base 为 feat/v3-dev-c-c0-contract-r01。
- A 正式技术签收：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143#issuecomment-6279190590
- R19-07 独立三 CI：PR CI https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39337965334 （job 118352108976），D2 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39337965399 ，Review Baseline https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39337965345 。**同一完整 SHA 3/3 completed/success；全量 Bun 4177 PASS、5 OS SKIP、0 FAIL。**
- 全部 R19-01/02、03、04A/B、05、06A/B、07A/B 在该 PR CI 原始日志仍逐条 PASS；R19-07A 真 SIGKILL 测试 1462.18ms，R19-07B 1596.49ms。
- **下一批 R19-08/R20 尚未开发、没有 CI、不能标记 PASS**。精确旧绿色回滚点依次为 R19-06 87cf182f4cfc970d39670658e89f038924989042、R19-05 e73e721a703aaa45a500f253b37415962d870088、R19-04 58aed24f05645159cdc06afd8448244e7fe9710a。
- **Gate O（A-only）=PASS_EXACT_SHA_SCOPED；Gate E=NOT_RUN、Gate L=BLOCKED_NO_AUTH、Gate P=NOT_RUN、Release=NO_GO**。绝不把 .invalid 离线 HTTPS+真 Pi SDK、真实 PID 或技术 x-request-id 冒充实时 Provider/正式 C Host/School business receipt。

## 1. 四线结构与唯一授权边界

- 统一协调 Draft PR #145，分支 docs/v3-integrator-i-r01-taskbook，唯一定约/状态路径 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md。**A 对该文件仅可编辑 BEGIN:STATUS:A 和 END:STATUS:A 中间**，不能覆盖 DECISIONS:C、STATUS:B/C/I，也不能以会话交接代替正式 CR。
- A 有权维护 A-owned Pi 执行技术层、测试和 Owner 技术账本。**C 独占** packages/shared 共享合同、受信 Principal/frame/Main/Preload/IPC、正式 Case/Plan/Source/ReviewRun/ReadReceipt/Check/Decision/Outbox/SchoolPort/业务写入与生产发行。B 独占模板/材料原件/作者候选/解析/版本；I 负责由 C 精确授权的隔离集成、固定 blobs、ABI/依赖与联合 Gate O，而非第二个 C。
- 禁止编辑普通聊天 Pi 主适配、任何 C-owned review-ipc.ts / Main/Preload/正式业务 writer 或 I Draft，禁止直接合并 #143/main。须改跨线入口时到 C #144 申请逐路径/函数、source SHA/blob、actor/source/version/revoke/恢复和正反例的正式 CR；未签先停在 A-only。
- C 之前的 CR-A-PI-HTTP-WITNESS-R01 只批准 C 自己的离线 Main SDK factory 设计/实现；**正式生产附件仍 DEFERRED**。
- **C 正式审批 CR-A-R17-R19-SECURITY-SOURCE-R01 = APPROVED_SCOPED_TECHNICAL_MIGRATION_ONLY**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6277629239 ，对应协调提交 b08318e071993e0d96ee9f6a3926d8aef7e3935c。R17 Engine 与 tests 已包含 I4-A18 先前授权，**不重复重放**。新增 R19 仅先前 A R19-04 绿 SHA 58aed24... 的以下四个固定测试 blobs 获准作为 I 未来隔离技术复演的来源：worker ffbb803a7e93e47488bcb7e97f0537258ff76f04；crosspid 7855139e7bdf367f8ed023483c8905a59903ca27；revoke 27f9d589b37f7560bc1945b5ba2a303f746436e3；diskfault 094698f65a93b47a5fa5cba5080132ea5e733547。必须新隔离 Draft、源/目标/回滚 blob 核验、依赖/ABI、同 SHA 完整 CI、C 新的工程精确签收。**R19-05/06/07 新改过的 worker 或新测试不在这项 C 固定来源批准中，不允许自动升级 I**。
- I4-A18 Draft #153 已由 C 签收固定技术 SHA ec880cd6b5bc6779095fcbdddb143b1034d751c5；I4-B18 独立 Draft #154 也已由 C 签收固定 SHA a74d513f3c990fe4b87401380a2eade8677b2163。仅限定离线技术工程 Gate O，没有给任何人 Main read/write 生产租约或 school/publisher 权限。未来 I 可自行依据已签 R19 旧四 blob 源 CR 排序其隔离批次；A 不去篡改 #153/#154。
- 在本交接时 Dev-C 工程 #144 仍持续独立开发（最后查询 HEAD df565e663b6a9e63e98819ced0ac12ed0f3357e0）；C 最近已签 Main B20 离线受信只读与 Runwide Host 安全围栏，但本交接不据此声称 A 有真实 Host/Provider 接线。新会话必须重新读取 C DECISIONS:C，而非以 C 分支变动自动获权。

## 2. Dev-A 长期职责 A1–A4

**A1 Owner 与 Session 安全**：Main 私有授权边界；Principal + sender/frame + Owner session/grant/processEpoch/generation/attempt/Run/Plan/Source/manifest；普通聊天隔离；grant/pause/resume/revoke/delete/terminal、Owner 过期/撤销、跨 await 再核验、跨 PID CAS、cold quarantine 与墓碑。重要源：apps/electron/src/main/lib/review/review-pi-owner-adapter.ts。

**A2 技术来源与 proposal**：read/check/terminal 的 Main 技术 Host seam；SourceIdentity、Check×target×object×subject、完整性/9×9 覆盖、事件有序/哈希封签/tech proposal、技术终态；只有 C 能将候选转正式 Case/ReviewRun/人工业务确认/Decision/Host physical ACK。源：review-execution-event-adapter.ts、review-v3-execution-proposal-producer.ts、review-execution-event-adapter-completeness.ts。

**A3 真实 SDK turn**：direct/hidden/graph/batch 技术模式；持久化每 immutable Run+attempt+generation 的 24-turn 预算；同步 Main 事前事后 Owner/Run 复核、cancel/timed-out/failed/needs-resume 技术端；旧回执不能双计费或新 Run 串用。源：review-v3-execution-turn-budget.ts、review-v3-main-sdk-turn-bridge.ts、review-v3-sdk-physical-turn-port.ts 及测试。

**A4 物理请求见证与故障恢复**：SDK/Provider 侧副作用前持久 dispatch in-flight、同案跨 Run 未决围栏、唯一 receipt、late-denied、SDK ignored abort、1 个 HTTP fetch、真实 Pi SDK 0.86.1 Responses SSE 的有效终态 + SDK 消费的正常 EOF + native turn_end/agent_end/settled；中断/错误/旧 Owner 禁止物理重试；多 PID SIGKILL/CAS/原子换盘/锁残留。源：review-v3-sdk-dispatch-fence.ts、review-v3-pi-http-provider-engine.ts、review-v3-native-pi-crosspid-r19.worker.ts 和一系列 A 测试。

## 3. 精确历史与本轮可信证据

| 阶段 | 全绿固定源 SHA | PR CI 全量 Bun | 主要已交付证据 |
| --- | --- | --- | --- |
| R14 | 56f450f3c783299ceb0a6489bf855a1ba8f0a913 | 4150 PASS/5 SKIP | I3 原有旧 A 来源，未含 R17 EOF 修复 |
| R17 | 29317b1eff458dd474c5c82cf60af96632db1f2c | 4164 PASS/5 SKIP | 修复 SDK application terminal 后 transport error 冒充完成；新增 sseTransportEof |
| R18 | 0febf1248bc6a580a1bc7b3144e0d96ca4313916 | 4168 PASS/5 SKIP | 完成后取消、冷 Owner 迟到回执、跨 Main 授权回归 |
| R19-01/03 | 5c517a70a8d31860128890b917e0d4349a4ad145 | 4170 PASS/5 SKIP | 真实 Pi+SIGKILL/仍存活晚回调+跨 PID |
| R19-04 | 58aed24f05645159cdc06afd8448244e7fe9710a | 4172 PASS/5 SKIP | real file CAS + 注入前/后 EIO/ENOSPC，冷热进程 |
| R19-05 | e73e721a703aaa45a500f253b37415962d870088 | 4173 PASS/5 SKIP | 真实原生 Pi 完成，跨 PID receipt 不得二次计数 |
| R19-06 | 87cf182f4cfc970d39670658e89f038924989042 | 4175 PASS/5 SKIP | Turn=1 已落盘后，settlement 前/后注入写盘失败 |
| **R19-07 现行** | **341c01144a5960b47f915461ee9d5e26a570ae20** | **4177 PASS/5 SKIP/0 FAIL** | **Turn=1 后真 SIGKILL 于 dispatch settled CAS 前/后，遗留锁安全拒绝/显式恢复** |

R19-05 最初同 SHA 的 PR CI job 118316704558 只是 GitHub Checkout github.com:443 三次网络超时（exit 128，未运行测试）；保留失败证据，按原 SHA 重跑 job 118322283570 后全绿。不能给它假定的代码失败，也不能改写历史记录。

**R19-07 严格证据事实**：
- 代码提交 341c01144a5960b47f915461ee9d5e26a570ae20，和上一绿色 R19-06 相比**只改** review-v3-native-pi-crosspid-r19.worker.ts、增加 review-v3-native-pi-sigkill-settlement-r19.test.ts；所有 A 生产 Engine/Owner/Bridge 未改。
- 当前 worker Git blob f3452061c750fd1d206e82720ac904552cb823cb；新增测试 blob b5981414dd68e16867b783fdb721036b97683f86。
- 真实 Pi 0.86.1 createAgentSession，受控内存拦截的 https://provider.r19.invalid/v1/responses，真实 SSE 响应正常 EOF、native turn_start→turn_end→agent_end→agent_settled、实际磁盘 Turn=1、dispatch settlement CAS 内对真实 Bun child 进程发送 SIGKILL。
- R19-07A：CAS **未提交**，独立 PID 看到旧 dispatch in-flight、Turn=1，拒绝同案新 Run；R19-07B：CAS **已提交**但未返回，独立 PID 看到 settled、Turn=1，拒绝旧 receipt 在另一个物理 claim 复用。
- 两个强杀场景均留下 **owner.json.write-lock**：新 PID 首次因 lock 未确认而 RECOVERY_REQUIRED（不会自动清理/覆盖）。测试在 **已经确认旧 PID 返回 SIGKILL 并等待子进程退出** 后，才在专属临时目录显式 unlink 模拟受信人工介入，继而验证新 PID cold quarantine、账本封签一致。**没有生产锁自恢复，也没有实测真实电源丢失或内核 I/O 故障。**
- 所有四线 gate 路径与真实 C Host witness/Provider、普通 Pi 业务调用仍不可由 A 技术测试代替。

## 4. 新会话第一件真正的研发：R19-08（推荐），随后 R20

**R19-08：真实 SDK 已完成后、Turn budget CAS 写盘前/后突然 SIGKILL**。R19-07 现覆盖 Turn 已持久化、Dispatch settlement CAS SIGKILL，**尚未对 Turn budget commit 前/后施加真 SIGKILL**。该剩余窗口更接近“物理请求已完成但技术计数尚未确认”的危险时刻。

工程标准：
1. 精确冻结 A 当前绿色 SHA，阅读 A worker、R19-07 测试、review-v3-execution-turn-budget.ts、review-pi-owner-adapter.ts、review-v3-sdk-dispatch-fence.ts 的实际执行次序。只对 A-owned 测试工装/技术源码施工，先不改 C/I。
2. 在真实 Pi 0.86.1 createAgentSession 通过应用 terminal + clean SDK-consumed EOF + native settled 后，针对 **Turn Journal 的真实 file CAS** 设置同步测试挂钩：precommit SIGKILL（预算旧盘未变，Turn=0，Dispatch 必留 in-flight）；postcommit SIGKILL（Turn=1 已真实落盘，Dispatch 仍 in-flight）。证明只有一次物理受控 fetch，实际 PID 和持久证据封签匹配。
3. 新真实 PID reopen：旧 Owner 均 cold recovery-required，未知物理副作用禁止同案跨 Run 自动重发；无新技术 proposal/正式业务 ACK；pre/post 的计数按**真实存盘**判定，绝不按调用者是否见到返回判断。
4. 如果 kill 发生于 Owner.withAuthorizedEvent() 独占 lock 内，必须像 R19-07 一样先验证残留锁的拒绝，再由 **测试环境确认已杀死的进程并经过独立验证** 才模拟人工清理；不得在产品生产库加“超过 N 秒直接删 lock”、“凭 PID 文件自行夺锁”。
5. 附加正反例：恶意/陈旧 Principal、Plan/Source 变化、其它 Case 隔离、错误 receipt/Run 与确权凭据防伪；不要为满足时间压缩取消已有 R17/R18/R19 回归或降验收质量。
6. R19-08 成功则保留源 SHA + blob 差异/rollback，固定新 SHA 三独立 PR CI/D2/Baseline，原始全量 Bun 逐条 PASS 后签收；未全绿则继续修 A-only，严禁把旧绿借给新 SHA。

**R20 方向（需边界裁决，不是现成已批准的生产功能）**：制定可审计、受信 Main/operator 独立验证锁所有者生存性、进程代次/Owner epoch、单一恢复事务的运行时恢复协议；先在 A-only 做可测试的 fail-closed 反例/接口草案，任何涉及 C Main/业务 writer 或真实锁抢占/恢复授权的代码须提交新 C CR。不要以本交接当作 C 生产权批准。若 R19-08 发现更关键的 A-only 安全问题，可据源码证据重新排序，不因任务书写了 R19-08 而固守次序。

## 5. GitHub 操作、协作和验收交接

- Dev-A 生产及测试代码只提交 A 工程 #143，保持 Draft/未合 main；原始绿色 SHA 341c... 是回滚锚。纯交接文本仅提交 #145 文档分支本 A-only 目录，绝不修改 A 已绿代码 SHA。
- PR #143 的 issue-comment 6279190590 是 R19-07 正式技术验收；前面 R19-06 6278220957、R19-05 6278098414、R19-04 6277456173。C CR 在 #144 评论 6277629239。发生新跨线依赖另提 C CR，不得假设旧批覆盖新源。
- GitHub PR CI: 必须验证 frozen install、TypeScript、package boundary、skin、Main/Preload/Renderer build、全量 Bun；D2/Baseline 同一完整 SHA success。必要时读取原始 job logs 的 R19-08 每条 PASS，5 OS skip 不计通过；保持首败日志。
- 统一协调的 STATUS:A 只更新本线 SHA/Gate/CR 状态；其他行只能 C/B/I 自行修改。更新协调文档前重新读取 HEAD 与 blob CAS，防止同时编辑覆盖别人。
- 新会话若 GitHub 连接可用就直接开展实际 A-only 工程与核验，不能只生成规划；禁止声称无工具的本机执行、真实 Provider 请求、后台继续或未发生的检查结果。

## 6. 必读链接（最少）

1. 本 A-only 总档与相邻下一会话执行书（不要让 B/C/I 阅读）。
2. [唯一共同协议 #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) 的 DECISIONS:C、STATUS:A/B/C/I；仅共同协议有跨线效力。
3. [Dev-A #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)，当前 green 341c01144a5960b47f915461ee9d5e26a570ae20；R19-07 评论 6279190590、R19-07 CI 原始日志。
4. [C #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144) 的批准与真实约束；[I #153](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/153)、[I #154](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/154) 的已签固定技术来源/不得漂移。
5. A Owner、Turn budget、SDK bridge、Dispatch fence、Pi HTTP engine、R19 native worker、R19-05/06/07 tests；需要更早 R11–R18 详史可查本目录历史 handoff 20261019/20261020 文件，不需要重复恢复全部对话。

**交接签字：Dev-A R19-07=PASS_EXACT_SHA_SCOPED；当前任务 R19-08=NOT_STARTED；Release=NO_GO。**
