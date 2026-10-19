# Review V3｜下一位 Dev-C 专属启动提示词（2026-10-19 R01）

> **仅供新 Dev-C 会话接手使用；A/B/I 不需要阅读。**  
> 非共同协议、非正式跨线 CR、非新增授权。跨线裁决只以 #145 的 ABCI 协调文档 §9 为准。本文由用户交给新的 C 会话后执行。

---

接手 **CDUT Studio Review V3｜Dev-C：唯一业务权威、共享合同、原生案卷、正式 Run/Batch、四线安全裁决与持续工程开发**。

**任务号**：V3-DEV-C-CONTINUATION-R01。  
**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent  
**C 正式工程 Draft PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144  
**C 工程分支**：`feat/v3-dev-c-business-r01`，基于 C0 SHA `5682057c7232c914e72fdae525ce95fd33f32b53`，合同 `review-c0/1` 冻结。  
**四线共同治理 PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145  
**共同文件**：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`（分支 `docs/v3-integrator-i-r01-taskbook`）。

**第一步必须读旧会话专属交接全文**：

`docs/design/review-agent/acceptance/v3-dev-c-session-handoff-r01/C-ONLY-SESSION-HANDOFF-20261019.md`（同 #145 docs-only 分支）。

该文件只为你恢复 C 会话上下文；不得把它作为要求 A/B/I 阅读的新任务书或改变他们既有权限的依据。然后读 #145 四线协议全文、§9 C 现行裁决、§10 四线最新状态；读 #144 当前源码/README/测试，再按需读 #141 C0，#147 I1 与 #142/#143。不要重做 #133–#140 的历史研究；如遇具体疑点再回溯原证据。

**你的身份与权责，不得偏离**：Dev-C 是唯一 CurrentCase、CanonicalPlan 正式安装、Material/Source validity、ReviewRun durable ACK、Batch/Decision/Outbox/SchoolPort 安全决策、Main 身份与 Shared DTO 最终 Owner。Dev-A 提供 Pi Owner/Host events proposal，Dev-B 提供作者候选 Plan/材料解析与路由，Integrator-I 只负责获准工程集成与联合验证；I 不能在未经 C 明示激活授权时修改正式业务写入器。

**接手时上次固定快照**（只用于找源，必须现场复查最新 HEAD 与 exact-SHA CI，不得沿用为最新）：#144 C `a34fcf4cf0206bfb6cb1c379934ff53316ac926f`，五条 CI last seen queued；#147 I `dc90bb063c2b385ee2e63ad818fa48672319515e`，新 CI queued；#142 B `fda338568b442819f373da3d1eaaf31af6266770`；#143 A `41e375630f6571e1c310924547b07e471d50699c`。C0 冻结不变；C 初次已批准集成锚点 `31aa352c45a33d6832612884b0fea38e39b5cf8d`，A 旧绿 `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`、B 旧绿 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`。C `review-v3-execution/1` shared proposal DTO/validator 的先前 CI 绿 SHA `6a9de1ecc4d8d24dc1c29935230b28a579f997df`，**不等于 C2 writer**。

**立即做真实工程，不要只重新讲规划**：

1. 锁定 #144/#145/#147 最新 HEAD，查每个精确 HEAD 的 PR CI/Review Baseline/D1/D2/Batch 运行和第一失败；没有成功结论只记 queued/failed。优先核对 C1_R03 的软归档事务、Run/Pi fence、`case-lifecycle-v3.test.ts` 和 `review-v3-legacy-entry-gates.test.ts` 是否真实通过，修复代码或测试首败，完整保留错误证据。
2. 优先验证并修复一个**已识别的高风险 bug**：旧 `DELETE_CASE` Main 接口使用 `legacy-remove-${sha256(caseId)}` 固定 requestId。归档→恢复→再次旧 UI 移除可能复用先前 Receipt 导致**没有再次归档却返回成功**。须实际添加一整轮“归档、重试、恢复、再次归档”正反例，合理分离生命周期代次与一次请求的幂等键，Main 签可信请求，不信 Renderer Actor/requestId。
3. 在 C1 中完成 **native-first CreateCase 唯一写入→旧三栏只读兼容投影→失败恢复→实际列表/选择/材料/设置/归档/恢复**。不要简单废除旧 UI，不要复制第二份 CaseStore。先走通真实产品业务，再确认 C1，而不是不断堆局部 guard。
4. 继续 C 拥有的 SourceCurrentValidity/Material replace/archive、正式 Plan provenance/install 与 Main picker/bytes capability 的接口落地；每一步基于最新 B 的可验证来源。对历史 Run/Decision，恢复案卷不得重新取得当前有效性。
5. 审查 #147 **最新** I1 代码与精确联合 Gate O。当前仅批准 `I-LEASE-C-TEST-R01`：I 自己的集成 Draft 分支上只能向 `review-c0-ipc.test.ts` **追加** I 专属负例，旧断言/fixture 不得变更。I 在新的 #147 提交已追加两个跨线 Main 安全测试，C 早先审过租约范围，但新 SHA 必须重核。`I-LEASE-MAIN-PORT-R01` 仅 `CONDITIONAL_NOT_ACTIVE`，I **没有**正式 `review-ipc.ts`/Preload/shared DTO/Business writer 权限。`I-LEASE-BUSINESS-WRITER=DENIED`。要扩大租约必须在 #145 §9 另签明示范围、启用门槛与回滚。
6. 在 C 新代码 exact SHA 的 Gate O 全绿前，不得向 I 签新的集成锚点或把它称为 C1 完成；I 原来已签技术锚点继续有效。获准新锚点也应只合并经过源 blob 锁、局部 patch 和新集成 SHA 联合测试的片段，不能整分支粗暴 merge。
7. 后续持续按 **C1 → 早期 C-Tx 持久保障 → C2 唯一 ReviewRun writer → C3 BatchAttempt/精确 Run 决定关系 → C4 完整事务/Outbox/故障恢复 → C5 唯一工作台/历史能力保全/全产品验收** 开发，A/B/I 可并行，C 不因集成等待而停工。保持 Gate O 离线分批、Gate E 集中实机、Gate L 授权校规、Gate P 产品验证相互独立。

**操作纪律**：必须实际读取源码、改代码/测试、提交到 C 工程 Draft PR；C-only 会话笔记/交接写 #145 docs-only 专用目录，不在 docs 分支改生产代码。要更新正式共同文件只能动 `DECISIONS:C` 和 `STATUS:C`，始终先 fetch 最新文件/blob SHA，乐观锁，绝不可覆盖 A/B/I 区段。所有结论附固定 SHA/CI/证明/残留风险/下一工作批次。禁止自行合并 main 或关闭 Draft；真实 Electron、Host、校方 Gold/SchoolPort 不可由 synthetic tests 冒充。尽量一次完成较大的工程切片，并将必须实机验证的事项集中准备给本地 Agent，不要让用户频繁运行虚拟屏。

**本轮预期交付**：修复 C1_R03 首败和重复归档风险；继续推进 native-first CreateCase/可信 Restore UI/Main，并补充正反例；审查 I 的新 HEAD 和写入租约合规性；将正式裁决更新 #145 C 区、工程进度更新 #144。最后给用户报告**真实完成、仅提交待 CI、依赖阻断、下一批**四种状态，不得混淆。

现在开始执行，不要再问用户已提供过的上下文，也不要只产出任务计划。
