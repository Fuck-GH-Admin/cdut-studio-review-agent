# CDUT Studio Review V3｜Dev-A 专属会话交接总档（2026-10-20）

> **A_ONLY_SESSION_MEMORY / NOT_SHARED_ABCI_POLICY / NOT_REQUIRED_FOR_DEV_B_C_I**
>
> 本文件只服务于上一 Dev-A → 下一 Dev-A 的会话延续。**Dev-B、Dev-C、Integrator-I 不需要阅读它。** 本文件不产生新四线规则、不增加写权、不代表 C 的批准；唯一正式共同协议及裁决仍是 PR #145 的 ABCI-UNIFIED-COORDINATION-AND-STATUS.md 与 C 的 DECISIONS:C。
>
> 本文件是最新会话接续快照，不能覆盖已固定的 PR #143 历史批次报告、Git 提交、CI 原始证据。交接时重新读真实远端 HEAD，不能把这里的时间截面当永远当前。

## 0. 交接时的固定现场

- 代码仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- 身份：V3-DEV-A-R01 持续生产工程开发，负责技术执行安全与 SDK/Provider 可靠性；**不是 Dev-C、不是 Integrator-I、更不是重新架构研究 Agent**。
- A 工程：Draft PR #143，分支 feat/v3-dev-a-pi-execution-r01，交接时 HEAD **1f1f5d1499cb59c813d590aa407189ba05f65f10**，未合并；C0 base **5682057c7232c914e72fdae525ce95fd33f32b53**，合同 review-c0/1。
- 唯一四线协调：Draft PR #145，分支 docs/v3-integrator-i-r01-taskbook，协议路径 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md。A **仅可编辑 STATUS:A 标记内**，不能改变 C 的 DECISIONS:C、其他线区域和共同规则。
- C 工程：PR #144，交接时 HEAD **34c7ea3bd881504302d2682aad79065c0ef9a24c**，C2-R02 Main trusted Host/source port，五套同 SHA CI 全 PASS，PR 4081 PASS / 5 OS SKIP / 0 FAIL；尚无 A Provider + B 已发布政策的生产真实接线。
- B 工程：PR #142，交接时浮动 HEAD **45809553d19b6fba731fd7edb813ebbb81071031**。不据此推断它已通过 Gate O，也不得把此浮动头替换 I2 的旧来源锁。
- I1：PR #147，C 仅对 **642c1fa3d3dd2042b7af1afdb3882397d4ca79a7** 签技术工程接收，旧锚点只做 staged-only 技术预览。
- I2：独立 Draft PR #148，交接时 HEAD **89a8c52bdaa407f0b8b99a17b2ecc8475e776e57**。I2 的三个独立技术 replay/source import checkpoint 实际 Gate O PASS，最新 PR 4191 PASS / 5 SKIP / 0 FAIL、23/23 联合负例 PASS；C 的 I2 最终工程签收尚需复核。批准的 I2 固定来源是 **C 3242b22a0825eec347b2748680bb746eb0f55215、A c0132ae06de8ae09ab021ac231ffd34756eb5990（R12）、B bf88320e57b20ebc2023f27665c544ce2ba72ce4、I1 642c1fa3d3dd2042b7af1afdb3882397d4ca79a7**。I2 已选择导入 A 9/9、B 8/8 精确 blob，**不是 A4-R13 最新技术代码已整体进入集成**。
- 最重要的授权请求：**CR-A-PI-HTTP-WITNESS-R01**，A 已在 C PR #144 留下正式评论 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6273618639。交接时在 C 的 DECISIONS:C **未找到对这个 CR 的明确正式批准**；新会话必须重新核对 C 最新回复/决议，不能擅自假定获批。

## 1. Dev-A 完整长期职责与禁区

**长期 Owner 工作**：
1. Main-only Pi Owner/普通聊天与隐藏审核会话隔离；授权 grant/revoke、pause/resume、允许的模型和工具、会话/attempt/generation/tombstone、冻结 Run/Plan/Source/manifest、来源当前有效性与 after-await grant/current identity 二次复验。
2. Direct/Hidden/Graph/Batch 技术执行通路，持久 24 turn 预算、技术 needs-resume、真正物理 Provider request dispatch 和回执来源隔离。
3. Host 真实读取/检查/终态的技术 provenance、原始字节/块/Check×target×object×subject 绑定、事件序号、hash-sealed proposal、回放、9/9 三值覆盖判定、迟到与伪造回执拒止。
4. 双 PID/冷恢复、CAS/文件锁、进程 epoch、SIGKILL、EIO/ENOSPC、SDK/Provider 重试、超时、AbortSignal、透明代理、未知副作用、迟到响应、同 Case 跨 Run 重发的故障恢复设计与安全证据。
5. 对 C 输出可信但**仅技术性质**的可供验证的执行 proposal/Host adapter、源码 SHA、测试与 CR，不另建业务真值。

**严禁**：任何未经 C 明确文件/函数级租约的 packages/shared 共享 DTO、Main IPC、Preload、正式 Case/Run/ReadReceipt/Check/Decision/Batch/Outbox/SchoolPort/Principal/业务工作台 writer；不得把 A 的 technical completed、旧 C0 local outbox ACK 或 fake Host receipt 写为正式 C2 Run/学校政策通过。I 的技术集成不可自行改变这些权限。历史 CR-A-001 APPROVED_SLICED_SPEC 也不是 C 所有文件的写入许可证。

## 2. A1–A4 已有真实源码及成熟度（非完整生产上线）

- **A1 Owner / IMPLEMENTED_SOURCE**：review-pi-owner-adapter.ts。Main Owner grant/revoke、故障/paused/resume、源及身份绑定、当前 epoch/双 PID file CAS、冷 quarantine；R11 修了同 PID deliberate pause 误标 recovery-required，同时仍拒绝旧 grant。缺真实 Electron/Main 生产会话的完整 Gate E。
- **A2 技术 Proposal / IMPLEMENTED_SOURCE_PROPOSAL_ONLY**：review-execution-event-adapter.ts、review-v3-execution-proposal-producer.ts。Host read/check/terminal、版本化 hash/sequence、9/9 check 技术覆盖、replay、terminal seal；R11 修终态后复用旧 Host receipt 绕过禁止。C2 正式 immutable ReviewRun/Check/ReadReceipt ACK 由 C 写，不能由 A 代劳。
- **A3 SDK/技术预算 / IMPLEMENTED_A_ONLY_SEAM**：review-v3-execution-turn-budget.ts、review-v3-main-sdk-turn-bridge.ts、review-execution-event-adapter-completeness.ts。24 turn 持久配额、direct/hidden/graph/batch mode、SDK 单轮 Host 注入、完成 vs interrupted vs needs-resume；真实后台 Graph/Batch、物理 Provider E 仍需核验。
- **A4 可靠性/请求见证 / IMPLEMENTED_A_ONLY_SAFETY**：review-v3-sdk-dispatch-fence.ts、review-v3-sdk-physical-turn-port.ts、review-v3-pi-http-provider-engine.ts。派发前 durable in-flight intent、A4 late-denied、跨 Run/同 Case 未决禁重派、跨 Run 全账本 receipt 去重、Main abort 快速失败但 SDK 仍运行时保持会话锁、真实 OS PID SIGKILL 但**合成 Provider**、强制 one-shot AgentSession.dispose、Pi 0.86.1 HTTPS/SSE 物理 HTTP 回执受限见证。不能声称已经接真实 Provider 或 C Host registry。

### R07–R13 关键演进
- R07：V3APhysicalSDKTurnPort 与 requestStarted/requestFinished 每物理 SDK request witness；最初纯合成提供者，非真实 Hook。
- R08：Main Abort 不无限挂起但 Provider promise 未 settle 仍保持 SDK session guard；迟到 success/failure 不记账。Linux 真 PID SIGKILL + 持久 intent 冷启动测试，Provider 合成。
- R09：持久意图跨 Run/跨 Owner 同 Case quarantine，老无 scope 未决 ledger 全局保守阻断；跨 Run 已结清 native receipt 全账本唯一性。
- R10：真实锁定上游 @earendil-works/pi-* **0.86.1** tag SHA **13cbf77df2396303013a41646bcfa77b4271ae56**。找到公开 AgentSession.agent.streamFunction、Provider fetch、Pi outer retry、onResponse 边界；A 自有 engine 限定 openai-completions/openai-responses、HTTPS/SSE、固定 Main origin、无 redirect、单 fetch、maxRetries=0、HTTP Provider 的 x-request-id，拒绝不可验证 Provider；项目既有 pi-agent-adapter.ts 已包装 streamFunction 负责 request proxy/sanitize，不得粗暴覆盖。
- R11：针对 R10 的 24 条 TS 真实首败，后又修两条真实业务回归（proposal terminal 后 read，Owner pause 显示）。最终独立绿 SHA **93f78e4efe0c17501b338c15989b9e419ddb717a**，PR CI 39291662991 (4134 PASS/5 skip/0 fail)、D2 39291663560、Baseline 39291663088 三套同 SHA PASS。
- R12：每个 fresh Pi AgentSession 必须 dispose（成功/失败/取消/创建预检失败），不销毁仍被其他操作占用的 old Agent。独立绿 **c0132ae06de8ae09ab021ac231ffd34756eb5990**：PR 39293695755 **4139 PASS/5 skip/0 fail**，D2 39293695808，Baseline 39293695753 均 PASS。**这是 I2 已批准 A source pool SHA，不是 R13。**
- **R13 当前正式工程 HEAD** **1f1f5d1499cb59c813d590aa407189ba05f65f10**：严格 Pi native turn_start → 单物理 fetch/x-request-id → turn_end → agent_end(willRetry=false) → agent_settled → session.prompt 完成，才允许 requestFinished；漏事件、乱序/重复、内部 retry 均 fail closed。首次 R13 SHA 157d071f… 的 PR CI/D2 仅有一条 TS2353（合成测试 agent_end willRetry 定型）而失败，A 修复后**新精确 SHA** PR CI [39296623502](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39296623502) **4145 PASS/5 OS skip/0 fail（471 files）**、D2 [39296623298](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39296623298) PASS、Baseline [39296623275](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39296623275) PASS；R13-01..06 和 A4-R10-16 在真实 Bun 日志中逐项 PASS。完整 Gate O 对这一 SHA 已闭合。

**最新门禁快照**：A SOURCE SHA 1f1f5d1499cb59c813d590aa407189ba05f65f10；**O=PASS_EXACT_SHA (3/3)**；**E=NOT_RUN**（真 Electron/Main/Pi SDK/Provider/后台真实物理请求未验收）；**L=BLOCKED_NO_AUTH**；**P=NOT_RUN**；**Release=NO_GO**。本地/CI 绿只表示技术离线/合成/部分真 OS 测试，不等于真实 Provider completion/学校 ACK。

## 3. C/I 最新进度对下一 A 研发的影响

- C2-R01 在 C 主线完成 C-owned review-v3-run/1 immutable Run sealed evidence 与 CaseAggregate CAS/Receipt 端口，技术完成仍要求人工复核，不自动签发任何 Decision。
- **C2-R02 已全绿**：C Main trusted Host/source port（review-v3-main-trust-port.ts）提供 admit/record/seal；真正独立验证 on-disk source bytes 的 SHA256、Case owner/current generation/grant、注入的 Host receipt/Published Plan，再提交 C 正式 CAS Run seal。但**注入回调在测试中仍为合成**：尚无 A SDK/Provider 真实 registry、B 已发布 Plan、正式 Electron IPC。C 最新绿 SHA 34c7ea3bd881504302d2682aad79065c0ef9a24c，5/5 GitHub CI PASS。
- I2 #148 latest 89a8c52bdaa407f0b8b99a17b2ecc8475e776e57 完成 C 锚点→I1 24 blob replay→A 9 blob→B 8 blob 的三阶段 Gate O，且 C-exclusive production hunk 为 0；C 最终工程签收仍需查 DECISIONS:C。**I2 当前获准 A=R12，不能自动引入 R13；A SDK physical/dispatch/HTTP 等后续文件也尚非全部已导入**。
- C 共享合同 review-v3-execution/1、review-v3-run/1 和 C2 Main trust port 的权威版本归 C；B 的 50 套 candidate-held 不等于 published Plan/Gold。不能用 I2 的 synthetic Main/Host callback 充当真实 C2业务受理。
- **CR-A-PI-HTTP-WITNESS-R01** 已在 C #144 评论 6273618639 正式申请逐文件 Main-only 受信 SDK factory、兼容既有 runWithPiRequestProxy / sanitizeContextForInference、Provider HTTPS origin/凭据、Host registry、C2 ACK 隔离。交接时未见正式 C 批准。不要强迫 C 与 A 同步轮次，也不能因为 I2 已批便越权写 C Main。

## 4. 下一 Dev-A 的当前实际任务：A4-R14 推荐顺序

1. **先重新核验**：GitHub #143 当前 SHA/3 套 CI、#145 唯一协议和最新 DECISIONS:C/STATUS:C/A/I、C #144 新 Main trust port/CR-A 的回复、I2 #148 源锁及 C 签收。如有新裁决，以新证据更正本文。
2. **待 C 逐 hunk 授权前，继续 A-owned 工程**：严格用上游 Pi 0.86.1 真实接口与本项目 patched SDK 核查 provider-request/response streaming EOF、retry、onResponse/代理/图片降级、abort/dispose 后是否会续发请求；改进有实际证据支撑的 A-owned witness/dispatch/recovery 缺口。不要循环加纯 mock 然后自称 Gate E。
3. **C2 Main 接线需单独批准**：如果 C 已在 DECISIONS:C 对 CR-A-PI-HTTP-WITNESS-R01 指定授权的 agent+精确文件+函数+hunk+基准 SHA+测试+截止条件，则仅按许可实施。A 不能默认编辑 C-owned Main/IPC/Preload/Run writer；交由 C 或获 lease 的 I 接线时，A 只供源 blob、Host 技术 adapter、真实回执约束与负例。
4. **真实 Gate E**：在合法 Provider 凭据/环境/校方权限具备时，取证 actual Electron+Pi SDK 0.86.1、HTTPS/SSE/physical x-request-id、transport provenance/重试计数、SDK native lifecycle、取消/断流、透明 proxy、真实 PID crash/new process、迟到结果无自动补发、C at-commit Host current validity；没权限则标 BLOCKED，不杜撰 Provider/学校 ACK。
5. **集中 Gate O**：任何新 R14 生产 SHA 需要 PR CI、D2 Scoped Pi、Baseline 三项同 SHA 实际 SUCCESS（frozen install、TypeScript、package boundary、skin、Main/Preload/Renderer、全量 Bun）。如报首个真失败，只修 Owner 路径，重新固定下一 SHA 重验，历史 R13 不能替代。
6. **I2 新来源**：A R13/R14 即使独立 Gate O PASS，也仅能向 C 申请新 A source lock，I 分批 cherry-pick/blobs + 联合真实 Gate O + C 工程签收。I1/I2 不自动升级。

建议重点先补一份 **A↔C2-R02 可信 Host receipt/Provider 完结条件的窄差分说明**，列清 A engine 与 C Main trust port 的 exact types/callbacks 和缺失生产能力；同时可继续 A-owned 有事实依据的 Provider 失败窗口/SDK retry/断流测试。未经许可勿入 C 主文件。

## 5. 需要先读的 A 工程证据与规程

**唯一共同协议**：#145 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md（先读当前远端 HEAD 和 DECISIONS:C）。

**A-only 详细工程来源（#143 分支）**：
- docs/design/review-agent/acceptance/v3-dev-a-r01/DEV-A-CURRENT-PROGRESS-AND-GATES.md
- docs/design/review-agent/acceptance/v3-dev-a-r01/DEV-A-R01-IMPLEMENTATION-AND-HANDOFF.md
- docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R10-PI-0861-TRANSPORT-EVIDENCE-AND-INTEGRATION-CR.md
- docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R11-TYPECHECK-REMEDIATION-AND-EXACT-SHA-GATE-O.md
- docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R12-PI-SDK-SESSION-LIFECYCLE-AND-GATE-E.md
- docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R13-PI-NATIVE-SETTLED-AND-FAULT-QUARANTINE.md
- docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md

**执行和门禁（以实际 package.json/CI 工作流为准）**：冻结 HEAD；bun install --frozen-lockfile；bun run typecheck；bun run check:boundaries；Bun isolate A1/A2/A3/A4/sdk HTTP/PID 定向；Bun 全量；Main/Preload/Renderer build；三项 Github Actions 分别记录 runId/jobId/log、PASS/FAIL/SKIP、环境/进程/Provider。拿不到 Bun 的 Agent 不得声称自己本地跑过，允许读真实 Github CI 日志。所有代码分支维持 Draft、不做 main merge、不删史或 force-push。

**必须记录**：slice_id、A源 SHA 40 位、A own 具体路径+Git blob、requires C/Owner/Plan合同、首败及修复、Gate O/E/L/P、I2 已锁的旧 A source SHA、CR 许可状态、rollback SHA、下一执行 owner。**每批集中工程测试，不为提速降低产品质量。**

## 6. 本次专属交接维护原则

- 本 A-only 文件在 #145 文档分支的专属目录，不属于唯一共同协调协议正文，**其他会话没有阅读义务**；下一个 A 可更新或覆盖本文件，但不要更改共同协议和别线字段。
- #143 的真实生产代码、测试、历史交接保持在 A 工程分支。为会话交接而新增的 docs-only 提交**不要加到 #143**，避免刷新已通过的 R13 精确 SHA CI。
- C/I/B 的状态是核验时快照；新会话接手后必须读取 GitHub 最新具体 SHA/决议，不可擅自拿本快照授予自己写权。

**一句话续接：A1–A4 的技术执行/故障安全底层已推进到 R13 单线 Gate O 全绿；下一个真实里程碑不是“再多一个合成 mock”，而是 C 正式批准的可信 Main SDK factory/Host registry 与实际 Pi/Provider 物理请求、断流、跨 PID 恢复 Gate E；此前继续安全的 A-only 原生接口取证与工程。**
