# CDUT Studio Review V3｜Dev-A 专属会话交接总档（R18 → R19，2026-10-20）

> **A_ONLY_SESSION_MEMORY / FOR_NEXT_DEV_A_ONLY / NOT_ABCI_SHARED_POLICY**
>
> **本文件只供下一任 Dev-A 恢复旧会话和继续技术执行研发。Dev-B、Dev-C、Integrator-I 均没有阅读或 ACK 本文件的义务。**
>
> 它不具备新的合同效力，不授予任何生产写权，不改变 C 的裁决；四线唯一有效共同规则与授权仍在 PR #145 的 DECISIONS:C、STATUS:A/B/C/I。本文件是特定时间点的证据快照；下一会话应先核验远端实际 HEAD、GitHub Actions 和最新 C 签收，不允许以文档旧 SHA 当浮动 HEAD。
>
> **2026-10-20 更新方式：覆盖本目录既有的 20261020 A 专属交接总档与执行书，保留 20261019 历史文件，不在已全绿的 Dev-A 生产 PR #143 上追加纯交接文档。**

## 一、项目身份、工作树和当前可核查的坐标

- 仓库： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- **你是 V3 Dev-A 持续真实工程 Owner**，不是 Dev-C、Dev-B、Integrator-I，也不是新的只读架构调研或一轮 A/B/C/D/E 领域模板研究。
- 工程 Draft PR：#143 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143 ，分支 feat/v3-dev-a-pi-execution-r01 ，**当前最终绿色 HEAD 0febf1248bc6a580a1bc7b3144e0d96ca4313916**。基于 C0 工程 5682057c7232c914e72fdae525ce95fd33f32b53 / review-c0/1；PR Draft/open/unmerged，禁止自行合并 main。
- 唯一协调 Draft PR：#145 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145 ，分支 docs/v3-integrator-i-r01-taskbook ，本交接编辑开始时其 HEAD 0744db70321299974dadc0d9a9bf0bad61948e38 。共同协议相对路径 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md 。**允许 A 修改的共同协议内容仅 BEGIN:STATUS:A 与 END:STATUS:A 之间**，禁止覆盖 DECISIONS:C 或他线状态。
- Dev-C：工程 Draft #144 feat/v3-dev-c-business-r01 ，快照 461b5c9e7abc17a020c843f279118208196f5ef0 ，新 B-CR-002-B C-only Check 删除 ACK/CAS/Receipt 方案已 **5/5 Gate O**；PR CI 39317813298 （4124 PASS/5 OS SKIP/0 FAIL）、Baseline 39317813334、Batch 39317813301、D1 39317813320、D2 39317813387。还有前期已签 C2 R03 Pi 工厂、Host registry，R04 Main trusted assembly、R05 physical published-plan consumer、C-Tx 跨 PID Case CAS、B-CR-002-A trusted author read。**这些是各自的受限离线工程能力，不是已投入正式 Electron/学校业务。**
- **并行更新：C-MAIN-WIRE-R01（交接前最终复核）**：C #144 已另外开始 **C 自有的真实 Electron Main/Preload author-read + UpgradePlan IPC 注册代码**，C-only 报告在同协调分支 docs/design/review-agent/acceptance/v3-dev-c-session-handoff-r01/C-MAIN-WIRE-R01-ELECTRON-IPC-PRELOAD-AUTHORITY-20261020.md；最新核见 C HEAD eb93bab2c34166495f22553b7861da61fe3974d6。此批 Main author/Plan handler 默认 **C_MAIN_V3_IPC_INDEPENDENT_AUTHORITIES_NOT_INSTALLED（缺受信来源时拒绝）**，没有真实 B vault 或学校政策 issuer，也**不包含 A Pi/Provider 正式接线**。该新 SHA PR CI 39320415985 与 D2 39320415884 **因 TypeScript 失败**，Baseline 39320415923、Batch 39320416036 成功，D1 39320416037 当时仍在运行。**新 C batch Gate O=FAIL/NOT_ATTESTED，需 C 自己修复并新 SHA 集中重验；不能继承前一 C 461b5c9 的 5/5。** 上述 C 461b5c9 是上一已签里程碑而非最新工作 HEAD；新 Dev-A 必须重新获取最新 C SHA/CI/DECISIONS:C。A 没有任何写 C IPC/Preload 的授权。
- C-MAIN-WIRE 连续修复状态： **最终交接快照更新**：C 又提交新修订 SHA 91453c21fded936de8e4dbd3ee14545c5a2ff9ab，5 套同 SHA Actions：PR 39320769078 / D1 39320769024 / D2 39320769052 在运行，Baseline 39320769076 SUCCESS，Batch 39320769122 QUEUED，**当前新 SHA Gate O=PENDING，禁止借前次失败或旧绿推定结果**。这是 C 自有 Main author/Plan IPC 工作，不改变 A Pi/Provider 权限；新 Dev-A 必须实时复核。
- Dev-B：Draft #142 feat/v3-dev-b-template-intake-r01 ，快照 e9215affaf536757d4b63ffcb012bb53006a1821 ，该 SHA PR CI 39318510516 / D2 39318510549 / Baseline 39318510583 **3/3 SUCCESS**，但 candidate-held 不能等同于正式 school-published Plan。
- Integrator-I：I2 #148 89a8c52bdaa407f0b8b99a17b2ecc8475e776e57 已获 C 工程限定签收；I3 Stage1 #150 36dd1c37bc18d7614d8d4835b5213d5cb6459792 已获 C 工程限定签收；I3 Stage2 #151 687ed356de3aee59075b85bf09a978eedab12a02 已获 C **C-I3-STAGE2-R01-FINAL-ENG-ACCEPT**（限定、非实时/非 IPC、A R14 8 个 exact Git blobs）；I3 Stage3 候选 Draft #152 8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b PR 39317723780 / D2 39317723879 / Baseline 39317723768 **3/3 TECHNICAL PASS**，但 **C_ACCEPTED_FOR_ENGINEERING_I3_STAGE3=PENDING_C_SIGNATURE**，新 CR #144 评论 6276302601、6276490583，必须重新检查决议后才能提升。
- 所有短写的历史 SHA 仅为文中定位；执行/来源锁始终使用 40 位完整 SHA。**每项工作跨线前查最新远端，并固定该批 source SHA/path/Git blob。**

## 二、Dev-A 长期职责 A1–A4（不得弱化）

### A1｜技术 Owner / Session 安全
Main-only 的当前 Owner/授予 Principal + sender/frame/session/grant/generation/processEpoch/attempt 绑定；普通聊天与专用 Review Agent 隔离；Run/Plan/Source/manifest 冻结；授权 grant/revoke/pause/resume、墓碑、Owner 失效与过期、跨 await/current 再核验、跨 PID CAS 和冷启动隔离。不允许 Renderer/model 声称 Main Actor/Grant 或绕过当前原件。

主要 A-owned：review-pi-owner-adapter.ts 及测试。

### A2｜技术 Host 来源与 Proposal（不是正式业务 ACK）
Main 技术 read/check/terminal 工具见证、SourceIdentity 与 extent、Check×target×object×subject、未知/拒绝/缺失 fail closed，事件序列和 SHA 封签、9/9 coverage、可重放 proposal、终态技术封口。A 生成的 completed-technical/needs-resume/Host proposal 只是 C 可以独立核验的候选证据；C 的 CaseAggregate、ReviewRun、ReadReceipt/Check、人工业务确认与 School Decision 全部独占，A 不建第二套正式 Run 真值。

主要 A-owned：review-execution-event-adapter.ts 、review-v3-execution-proposal-producer.ts 、review-execution-event-adapter-completeness.ts 及测试。

### A3｜Pi SDK 单轮、24 turn 与多运行模式
direct/hidden/graph/batch 技术 SDK seam、持久 24-turn 配额、技术 timeout/cancel/failed/needs-resume、Main SDK one-turn bridge 与后置可信 Owner/Run 再核验。不得把普通 Pi 会话、聊天消息 ID、模型生成文本、仅 agent_end 事件等同物理 Provider receipt。

主要 A-owned：review-v3-execution-turn-budget.ts 、review-v3-main-sdk-turn-bridge.ts 及测试。

### A4｜物理请求可信度、故障恢复、可靠性
派发前持久化 in-flight intent；一个 Run 物理 SDK 派发不能在未知副作用时自动重跑；settled/late-denied、跨 Run/同 Case 的未决 quarantine、历史和跨 Run receipt 唯一性、Main abort/Owner revoke vs Provider ignored abort/late callback、ENOSPC/EIO 后提交不确定、冷启动、SIGKILL、跨 PID 锁/CAS，真实 Pi SDK 0.86.1 SSE/HTTPS request URL 和 terminal + EOF + 原生 turn_start→turn_end→agent_end(willRetry:false)→agent_settled，零透明重发、one-shot AgentSession dispose。

主要 A-owned：
- apps/electron/src/main/lib/review/review-v3-sdk-dispatch-fence.ts / .test.ts
- review-v3-sdk-dispatch-crashpid.test.ts
- review-v3-sdk-physical-turn-port.ts / .test.ts
- review-v3-pi-http-provider-engine.ts / .test.ts
- review-v3-native-pi-offline-sdk.test.ts
- review-v3-main-sdk-turn-bridge.ts / .test.ts
- 关联 Owner/turn budget/proposal adapters/tests。

**原则：A 不因“技术执行成功”自行落正式业务 verdict/Decision/Receipt；未知结果默认 RECOVERY_REQUIRED，不能假定 Provider 没有执行。**

## 三、绝对权限边界：C、B、I 与 A 技术见证的关系

1. **C 最终业务/共享合同 Owner**：packages/shared 共享类型/DTO、正式 Electron Main / IPC/Preload/Principal/Frame；Case/Plan/Source-current-validity/ReviewRun/ReadReceipt/Check/UpgradePlan/CAS/Batch/Outbox/SchoolPort/Decision writer。A/I 不因整合、测试成功或用户批准非实时测试而获得这些文件/函数写权。
2. **B 模板/材料 Owner**：G01–G08 既有约 50 套模板、staging 原始物理字节、parser、模板 author candidate、作者 UI；候选/冻稿不等于正式学校已发布 Plan 或校方 Gold/权限。新增临时/通用模板由 B/C 共同合同决定，不属于 A 这里的执行可靠性改写范围。
3. **I 跨线集成 Owner**：技术来源固定、机械 file-blob replay、跨线联合负例/回归、版本锚点；不能指挥 C 获得未授权 Main/Business writer，也不能自动纳入 A 最新浮动 HEAD。
4. **C 已明确批准的 CR-A-PI-HTTP-WITNESS-R01**：A 最早在 C PR #144 评论 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6273618639 正式申请。DECISIONS:C 最终状态 **APPROVED_C_ONLY_OFFLINE_FACTORY_DESIGN_AND_IMPLEMENTATION / PRODUCTION_ATTACHMENT_DEFERRED**。**只授权 C 自己开发惰性/离线 Main SDK factory 和 Host registry**；未批准 A/I 正式 Provider、C2 Run/ACK、Main/Preload 或普通聊天 Pi proxy/pi-agent-adapter.ts 生产接线。
5. **C-I3-ANCHOR-003 与 CR-A-R14-COMPAT-004**：正式批准 I3 在 C R03 固定 e87f75e044becc35c28292cc835a2c2ec41df48a 上，选择性导入 A R14 56f450f3c783299ceb0a6489bf855a1ba8f0a913 的非 IPC、非 live Provider 源；I3 Stage2 #151 **8/8 原 Git blob** 已获 C 有界签收。**A R15、R16、R17、R18 不能自动进入 I**，更不能整个 A PR merge。I3 Stage3 #152 只有独立候选 3/3 Gate O，截至快照 C 签收仍待确认。
6. **回执分层**：A 的 x-request-id + SSE 终态 + transport EOF + 真 Pi 生命周期只证明 SDK 已消费一个技术 HTTP 请求；它**不是** C 主动从独立 privileged Host observer 取得的 read/check/terminal 与业务 Case/Plan/source/current 身份链，也不是 C2 正式 persisted Run ACK。HTTP response headers、模型 JSON、Renderer 参数不得伪造 C Host evidence。
7. **想改 C 文件**：先在 C PR #144 提交 exact source SHA、具体 path/function/hunk、Main actor、凭据、原件、Owner/Plan、失败和恢复窗口、测试和截止条件，收到 DECISIONS:C 的明示文件级 lease 再执行；未签即停在 A-only 技术层。

## 四、A 迭代进度账本（真实验收，不得改写历史）

| Slice | 精确固定 SHA | PR CI full Bun | D2 / Baseline | 工程成果 |
|---|---|---|---|---|
| R11 | 93f78e4efe0c17501b338c15989b9e419ddb717a | 4134 PASS / 5 SKIP / 0 FAIL（PR 39291662991） | 39291663560 / 39291663088 SUCCESS | Owner pause 语义、terminal receipt 防复用、R10 TS 首败纠正 |
| R12 | c0132ae06de8ae09ab021ac231ffd34756eb5990 | 4139/5/0（PR 39293695755） | 39293695808 / 39293695753 SUCCESS | 每次 fresh SDK AgentSession 在 success/fail/abort 需要 dispose；是 I2 的旧 A source |
| R13 | 1f1f5d1499cb59c813d590aa407189ba05f65f10 | 4145/5/0（PR 39296623502） | 39296623298 / 39296623275 SUCCESS | native lifecycle 组合约束；缺阶段 fail-closed |
| R14 | 56f450f3c783299ceb0a6489bf855a1ba8f0a913 | **4150/5/0**（PR 39304172035） | 39304172120 / 39304172175 SUCCESS | SDK-consumed SSE 首次引入 terminal marker、HTTP MIME/2xx/x-request-id 校验；**唯一 C 批 I3 A 来源** |
| R15 | b2528525a5080d56ce9fbd074a6ddf7db546c0f5 | **4158/5/0**（PR 39307774960） | 39307774627 / 39307774585 SUCCESS | 完整 SSE 事件分帧、Responses 终态 data.type、缺帧/伪帧/重复帧拒绝；首次 double-escape 8 FAIL 后修复 |
| R16 | 06ddf911074f3256d53af886c9f993a6413cf607 | **4160/5/0**（PR 39312761077） | 39312761054 / 39312761079 SUCCESS | **真实 Pi 0.86.1 createAgentSession()** + OpenAI Responses /v1/responses SSE 成功与截断负例；测试假 URL 路径与 SDK automatic retry 诊断修复 |
| R17 | 29317b1eff458dd474c5c82cf60af96632db1f2c | **4164/5/0**（PR 39315259349） | 39315259249 / 39315259180 SUCCESS | **真漏洞修复：response.completed 后 stream error 不得签收**；SDK-consumed TransformStream.flush() 正常 EOF + terminal 双重门禁 |
| **R18（最新）** | **0febf1248bc6a580a1bc7b3144e0d96ca4313916** | **4168 PASS / 5 OS SKIP / 0 FAIL，4173 tests /472 files**（PR 39318050973，job 118284575212） | **39318050981 / 39318050999 两项 SUCCESS** | R18-01/02 真实 Pi EOF 后撤权/成功对照；R18-03/04 cold Owner 新实例、迟到 SDK 回执、同案新 Run 与 stale CAS 拦截，四条新增 raw CI 全 PASS |

注意：这张表是 **各自独立完全绿色的固定检查点**，不是合并 Main、不是 E/学校验收。首次失败和修复 SHA 历史仍保留在 #143 评论、Git 历史、共同协议 STATUS:A 中。

### R14–R18 最重要的可重放事实和首败

- **R14**：首次候选 e6c4bc... 的旧 A4-R10-16 测试在“无 SSE 终止的旧合成 Response”下 FAIL，修复该测试提供真实 terminal/消费 body；最终 56f450... 三项 Gate O 全绿。不允许因新的 source hardening 删除旧 SDK bridge 负例。
- **R15**：原候选 fd68e9c... full Bun 4150 pass/5 skip/8 fail，真实根因为 JS/TS 的 SSE 换行与 Responses 正则被错误 double-escape；生产 parser-only 修复 b252852...；8 个正反例新增并全部通过。
- **R16**：首版 2cac0cc... 两条 FAIL（原生成功路径 + 未改动 Goal-session 间歇断言），后一轮 Goal 测试恢复 PASS；真实 Pi 原生 first error 显示选择 **/v1/responses** 而测试错误断言 **/v1/chat/completions**，SDK 由此 internal auto-retry，但 A 物理围栏实际只放行第一次 fetch。最后按 Pi 正确 Responses 路由/完整 SSE 事件流 + 隔离 authPath 修复 06ddf911...，R16 01/02 PASS。
- **R17**：原 e07dbc1c... 4162 pass/5 skip/2 fail。R17-01 是预计错误文案与既有技术 port 拒绝不同；更重要 **R17-04 真安全漏洞**：Pi 收到 response.completed 后，后续 ReadableStream.controller.error() 仍可能被上层当成完成。生产 review-v3-pi-http-provider-engine.ts 添加 sseTransportEof，仅当 SDK 真正消费同一 body 的 TransformStream.flush() 才置位，SSE terminal + clean EOF + native settled 缺一不结清，绝不 tee/clone/fake drain。修复 0df33926...、最终 29317b... 3/3 PASS。
- **R18**：仅改两个 A 测试文件，不变更生产执行器；R18-01 实际 turn_end:stop 且无 nativeFailures，成功 Provider EOF 后 Main 在 agent_end/agent_settled 夹缝取消必须拒绝；R18-02 正常成功仍单 fetch；R18-03 SDK promise pending 时创建冷 Owner adapter，旧 owner recovery-required + stale journal 快照强制 reopen、迟到结果不得收费/同案新 Run 不得重派；R18-04 Main abort 先返回恢复要求但原 SDK promise 未 settle 前仍锁会话，冷启与迟到 result 不得升级。**R18-03/04 是新 adapter 实例+持久账本+合成延迟 SDK，绝非实际第二个 OS PID**；A4-R08-PID-01 才是真子进程 SIGKILL + 合成 SDK callback。
- 这些进度反映 A 技术路线在逐步增强，但仍未满足真正 Provider TLS 归属、proxy transparent retry 排除、正式 C Host registry 物理来源、真实 Electron 调用权限和产品 Gate E。

## 五、精确 Gate 与产品完成度（最新）

- **A4-R18 Gate O = PASS_EXACT_SHA_0FEBF124_3_OF_3**：PR CI frozen install / TS workspace / package boundaries / skin contract / Main+Preload+Renderer builds / 4168 pass 5 skip 0 fail；D2/Baseline 同一完整 SHA SUCCESS。OS SKIP 是跳过，不当作 pass。
- **Gate E = NOT_RUN**：还没有 C 正式 Main production wiring / Electron live integration / 有权真实 HTTPS Provider / privileged Host physical receipt 与 proxy/重试/冷启动跨 PID 真源证明；离线 .invalid + test intercept 不计 E。
- **Gate L = BLOCKED_NO_AUTH**：缺真实学校发布者/业务授权，不能以 candidate-held、mock publisher、C-only Plan 验证充当校方审批。
- **Gate P = NOT_RUN**：真实用户/多场景产品验收未执行，不能因 CI 通过称产品可发布。
- **Release = NO_GO / Draft/unmerged**，不自动合 main、不签 School Decision。
- **工程评价**：A1–A4 的技术保护与多轮完整回归成熟；最大的系统性缺项是权限、真实环境、跨线生产接线、真实 Provider 和全系统验收，不是“需要再补一套业务 writer”。下一 Dev-A 必须继续工程，不要只写计划。

## 六、紧接下一轮：A4-R19 实际交付目标（优先级由高到低）

**核心价值：填补 R08“真 PID + 合成 SDK”与 R16–R18“真 Pi SDK + 同 PID/新适配实例”之间的交叉空白，验证真实 Pi SDK 0.86.1 工作中发生操作系统进程中止、Main 新进程接管时 A 物理派发/Owner 状态不被重置。**

1. **先冻结 R18 并检查现状**。读最新 PR #143 精确 SHA / 3 套 CI、#145 最新 DECISIONS:C 与 STATUS:A/B/C/I，#144 C 签收、#151/#152 I source locks。确认 R19 没有新增 C 函数级权限，继续 A-only。
2. **测试真实 child PID 启动真实 Pi SDK**。参考 review-v3-sdk-dispatch-crashpid.test.ts 的 Bun process.execPath/临时目录/真实 SIGKILL，结合 review-v3-native-pi-offline-sdk.test.ts 的真正 createAgentSession + openai-responses /v1/responses + 受控 fetch；真实文件 owner/dispatch/turn/event journals，应在 **durable claim 写成后、实际 SDK fetch 开始的明确握手点** 记录 PID、run、dispatchId、source digest，父进程观察握手再 SIGKILL，不能在请求尚未进入时用抢先 marker 制造假强证据。
3. **R19 负例与回归**：R19-01 真 Pi SDK child 进入受控 Provider fetch 后被 SIGKILL，新 PID/Owner 读 recovery-required、dispatch in-flight，turn=0，proposal/业务 ACK=0；R19-02 same Case **new Run/new Owner** 仍拒自动重派，fresh unrelated Case 可以继续（确保隔离域不过宽）；R19-03 第二 PID 仍活着/SDK 卡死时 Owner CAS/锁与 Main abort 不释放物理 in-flight，晚到模型正常完成不得骗过 Owner grant；R19-04 断电前后/写入 EIO/ENOSPC/postcommit 不确定恢复条件继续 fail closed；R19-05 不允许 Header/SSE/proposal/x-request-id 伪装 C 主物理 Host registry。测试数量和确切断言以真实源码/可执行场景调整，但必须留真正可判别的事实证据。
4. **区分工具场景**：测试 spawnSync 与 spawn 的活体握手差异；若需要在真实请求阻塞时发送信号，应用异步 child process 的可观察 IPC/marker，并确保 timeout 清理与 finally rmSync，不残留子进程或测试 token。保持 https://provider.r19.invalid + intercept，不发送互联网请求、不碰真实凭据、不修改标准 Pi ordinary session。容器无 Bun 时允许 GitHub Actions 运行；不声明自己本地跑过。
5. **先修 A-only 真实漏洞，再组合跑 Gate O**：必要时修改 A-owned Owner/dispatch/SDK bridge/HTTP engine/test，不变更 C Main/Preload/shared/business。保留 R17 SSE clean EOF 保护和原 R18 竞争负例。冻结一个最终代码 SHA 后统一 PR CI、D2、Baseline，同 SHA 三项 completed/success 且 full Bun 新 R19 用例逐行 PASS 才能签 A4-R19 Gate O。首败明确保留 SHA/Job/完整日志，再修并另 SHA 全部重跑。
6. **是否跨线新来源**：若 I/C 需要 A R17/R18/R19 新风险修复，向 C PR #144 交付精确 A source SHA/path/blob/ABI/测试，等待新 CR 和 I 独立分支来源锁；**绝不能强行覆写已签 I3 #151 的 A R14 8 blobs 或自行推进 #152**。
7. **真实 Gate E 的准备**：单列必须本机验证的 Electron Main actor / SecretStore / Pi real provider / proxy transport EOF / unauthorized replay、真正 privileged Host read/check/terminal 与 Run ACK 的证据清单。缺授权环境时 E=NOT_RUN，不降低测试标准、不频繁要求用户为了一个小负例开虚拟屏。

### R19 验收特别小心

- 既有 A 断言的 Main-origin HTTP x-request-id 不是强认证的服务端物理完成，不能直接作为 C registry 的 V3VerifiedHostReceipt。
- 真 Pi SDK 经过 HTTP Response fake transport ≠ 真外部 Provider；真 child PID + fake Provider 只提高故障/进程真实性，不自动构成 Gate E。
- “SDK promise settled” 与“底层 HTTP stream clean EOF”不能混用，R17 安全修复不可撤销。
- “父进程 SIGKILL 后从未有回调”与“仍活着的旧进程迟到回调”是两种独立故障测试，不能在同一时刻声称两者都真实发生。
- 主进程写入文件锁可能保留在异常/强杀下：不能凭文件 mtime、PID 数字或合成 token 自动偷锁；C-Tx 对正式 Case FS 交易已独立处理，A 不复制 C 的业务事务。

## 七、持续开发、统一验收与状态签收规则

- 编写真实代码/故障注入/可靠性测试，不重新做 #133–#140 历史考古，也不拖延 C/I 合并；A 和其他线继续并行推进。
- A 新提交只能进 feat/v3-dev-a-pi-execution-r01 对应 **A-owned** 技术源码与测试；新会话交接纯文档提交协调分支的 A-only 文件，不要将已全绿的 #143 R18 HEAD 因文档改变而重测。
- 共用协议使用真正版本控制：先取得最新 blob SHA，**只替换 STATUS:A 段**；发现冲突重新读取再编辑，不覆盖 C DECISIONS:C/STATUS:C 或 I/B 进度。
- 每轮冻结唯一 40 位代码 SHA；完整 PR CI + D2 Scoped Pi + Review Baseline **三项同 SHA**，全量 Bun + TS + boundaries + skin + 3 builds 通过。对失败保存 first-failure job 与原始输出、回滚 SHA，任何新提交都重新计 Gate O。
- Provider 合成/离线事件、真实 Pi SDK、真实 OS child、真实 Electron Main、物理远端 TLS 分五种独立证据等级报告，不“逐渐变真实”混写成 Gate E。
- 记录 PI SDK 版本固定 @earendil-works/pi-* 0.86.1、真实内层 API Route /v1/responses；普通会话 pi-agent-adapter.ts / runWithPiRequestProxy / sanitizeContextForInference 未经单独 C 授权不可变更。
- C/I 签收的来源必须保持 exact 40 SHA + path + blob + Gate O + C decision，一份 PR 通过不是整分支 merge 许可证。
- 若下一会话工具受限，仍可通过 GitHub connector 拉 PR/源文件/Actions job logs、更新 A-owned 文件提交 Draft；不要声称本机跑过 Bun 或有真实 Provider 凭据。
- 继续采用**较大批次的实际开发 + 集中 CI/实机验收**，不为了速度删负例/弱化质量/频繁空提交使 CI 取消。

## 八、下一任 Dev-A 必须先读的来源（按顺序）

1. **共同协议**：#145 当前 HEAD docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md — 权限以最新 DECISIONS:C 优先，核查 STATUS:A/C/I。
2. **本 A-only 总档**：docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/DEV-A-ONLY-SESSION-HANDOFF-20261020.md 。
3. **对应下一轮执行书**：同目录 DEV-A-ONLY-NEXT-SESSION-EXECUTION-20261020.md （专为 A 会话，B/C/I 不需要读）。
4. **A 真实工程 #143**：R18 fixed 0febf1248bc6a580a1bc7b3144e0d96ca4313916 处 A1/A2/A3/A4 原代码和所列测试。A-only docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R15-STRICT-SSE-FRAME-AND-I3-SOURCE-BOUNDARY.md 和 R10–R13 源版本报告；早期文档时间戳不代表新 Gate。
5. **最新 #143 证据**：R17 真实漏洞修复 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143#issuecomment-6276125815 ，R18 真实结论 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143#issuecomment-6276533117 ；R18 CI 39318050973 / 39318050981 / 39318050999 。
6. **只读 C/I 关键接口**：C #144 / review-v3-main-pi-factory.ts 、review-v3-main-host-receipt-registry.ts 、review-v3-main-trusted-assembly.ts、review-v3-main-trust-port.ts 与最新 C-Tx/Plan 发布消费端；I3 Stage1 #150、Stage2 #151、Stage3 #152 的精确来源锁和 C DECISIONS:C。无需重做大范围历史调查。

**一句话交接**：Dev-A R18 在 0febf1248bc6a580a1bc7b3144e0d96ca4313916 完整离线 Gate O 3/3 绿色（4168 PASS/5 SKIP/0 FAIL），R17 SSE EOF 真实漏洞已修、真 Pi SDK 与 Owner 冷启动组合负例已完成；Dev-A 下轮应直接实施 **R19 真 Pi SDK × 真子进程崩溃 × 持久化 Owner/dispatch 恢复**，继续只写 A-own 可靠性代码，C 仍拥有正式 Main/业务写权，I3 Stage2 仍锁 A R14，Gate E/L/P 未通过、产品 NO-GO。