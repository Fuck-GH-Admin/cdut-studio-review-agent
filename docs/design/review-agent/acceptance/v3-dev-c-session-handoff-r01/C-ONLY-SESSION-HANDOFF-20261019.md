# Review V3｜Dev-C 旧会话专属工程交接（2026-10-19 R01）

> **阅读对象：仅下一位 Dev-C 工程/架构裁决会话。**  
> **分类：C_ONLY_SESSION_MEMORY / NOT_SHARED_POLICY / NOT_ABCI_ASSIGNMENT / NOT_INTEGRATION_APPROVAL。**  
> 本文放在 #145 的 docs-only 协调分支只是为了保存 C 上下文；**Dev-A、Dev-B、Integrator-I 不需要阅读、ACK 或执行它**。本文不新增任何 C 对 A/B/I 的授权，不替换四线唯一正式协议；如本文与远端较新源码、PR、CI 或 §9 裁决冲突，以可核实的较新事实和正式协议为准。本文不得作为 I 擅自编辑 C-owned 文件的授权书。
>
> 截止观察：2026-10-19，晚间中国时间。下面所有 HEAD/CI 是**交接时快照**，新会话第一步须重新读取远端，不能把它们当作永远最新。

## 0. 先读什么（必须按序；不是再做全仓考古）

1. **唯一四线正式协议和实时状态**（C 只能编辑 `DECISIONS:C`、`STATUS:C` 区；尊重其他区段的并发修改）：  
   [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) / `docs/v3-integrator-i-r01-taskbook` / `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。所有 CR 和 I 写入租约的最新定义只有该文件 §9 是正式来源。
2. **C0 冻结合同基线**：[PR #141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) / `feat/v3-dev-c-c0-contract-r01`；冻结 SHA `5682057c7232c914e72fdae525ce95fd33f32b53`，contract `review-c0/1`；其中 Main 可信身份、shared types/DTO、owner manifest、测试为共同基础，禁止在未做版本化 CR 时偷偷改变。
3. **C 当前唯一工程工作**：[PR #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144) / `feat/v3-dev-c-business-r01`，`docs/design/review-agent/acceptance/v3-dev-c1plus-r01/README.md`。这是 **C1 部分完成**而不是整个 C1 已封版。C-only 文档与工程代码在**两个不同分支**。
4. **I1 集成和 C 审阅**：[PR #147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147) / `integration/v3-i1-technical-a-b-c-r01` / `docs/design/review-agent/acceptance/v3-integrator-i1-r01/I1-INTEGRATION-AND-C-REVIEW.md`；同看 §9 的租约。I0 [#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146) 已 C 有限验收，历史输入锁不要改。
5. 按需读架构证据：一轮 #133；1.5轮 #134；2A/B/C/D #135–#138；定向核验 #139；第三轮系统裁决与设计候选 #140。**不是让你重开研究**，遇到有冲突的具体代码再溯源。

## 1. Dev-C 是谁：唯一业务权威和决策 Owner

Review V3 A/B/C/I 四线持续并行：

- **Dev-A #143**：Pi Owner/session/grant、Host 工具和执行事件 *proposals*、技术覆盖、暂停/崩溃/冷启动权限恢复；不能正式写当前 Case、ReviewRun/Decision，也不能签业务 ACK。
- **Dev-B #142**：模板编译/作者态候选、G01–G08 50 候选、物理材料暂存/ZIP/Office/SourceIdentity/路由、20 秒选择建议；`candidate-held`、`publicationAllowed=false` 不等于学校政策/Gold/正式发布，不是正式 InstallPlan 权威。
- **Integrator-I #147**：只处理受限的跨线源码导入、技术桥接/测试、源 SHA→新集成 SHA、联合离线 Gate O 和检查点；**不是 Dev-C 的替代者，也不是上级**。它不能自己宣布 C 业务验收。
- **Dev-C（你）#144**：四线**最终共享合同/业务安全裁决权**，唯一原生 Case/Plan/Material/Source-current-validity/ReviewRun/Batch/Decision/Outbox/可信 Main/Renderer 业务落地 Owner；负责 C0 契约版本化、正式工作台与迁移、判定每一份 I 集成 SHA 是否可接受，推进 C1–C5 全程实现与产品验收。

典型 C 独占路径：`packages/shared/**`、`review-ipc.ts`、Preload 正式口、`review-c0-authority.ts`、`case-store-v2.ts`、`case-store.ts`、`application-service.ts`、`workspace-service-v2.ts`、`workspace-business-service-v2.ts`、`run-service-v2.ts`、`run-store-v2.ts`、`pi-case-review-service.ts`、Batch/Decision/Outbox、最终三栏工作台接线。部分测试有**C 已明示的极窄 I 写入租约**，详见第 4 节。

**长期不妥协约束**：唯一业务写权、不接受 Renderer 提供的 teacher/actor/sender/owner、真实 Main frame/权限重验、Plan immutable 且需授权 provenance、物理 SourceIdentity 追溯、Check×target×subject 与 unknown、ReadReceipt 真实 extent 与最终 durable ACK、旧 Run/Decision 不自动复活、fail-closed、模拟/Provider/校方确认分级，不能凭技术完成发出业务/学校审批。工程质量不能因工期而采用“降低质量的最小闭环”；把无法实机验证的工程部分集中开发，设较大的实机验收点，不要每个小 commit 都要求用户启动虚拟屏。

## 2. 精确 Git 状态与 CI 证据（交接瞬间）

| PR | 职责 | 当前观察 HEAD | 当前结论 |
|---|---|---|---|
| [#141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) | C0 冻结 | `5682057c7232c914e72fdae525ce95fd33f32b53` | 冻结的离线开发基础，不等于产品上线 |
| [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142) | B | `fda338568b442819f373da3d1eaaf31af6266770` | 新 HEAD CI queued；I 首轮仍锁旧绿 B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` |
| [#143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143) | A | `41e375630f6571e1c310924547b07e471d50699c` | 新 HEAD CI queued；I 首轮仍锁旧绿 A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` |
| [#144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144) | C 当前开发 | `a34fcf4cf0206bfb6cb1c379934ff53316ac926f` | 5 条 workflow 在最后查询仍 queued，**C1_R03 尚无 exact-HEAD Gate O** |
| [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) | 共同协调文件/本文所在 docs 分支 | 交接前 `9f807ffda657b74238aaa2c712c64df0bc9ec087` | 不要把 docs-only 的 CI/HEAD 当成 C 工程源码或 I 集成 SHA |
| [#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146) | I0 | `c84f575addcbb1f36b5eff0acb27442b91073fa1` | **C 已签 `I0_ACCEPTED_SCOPED`**；I0 自身 PR CI 4003 pass/5 skip/0 fail；非 A+B+C 集成 |
| [#147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147) | I1 | `dc90bb063c2b385ee2e63ad818fa48672319515e` | 技术桥接 + 实际两项 C0 IPC 联合负例，CI 仍 queued；**未签 C_ACCEPTED_FOR_ENGINEERING** |

**已真实通过的非当前 HEAD 证据**：
- C 初次 I 集成技术锚点 `31aa352c45a33d6832612884b0fea38e39b5cf8d`：PR CI `39229456164`、Batch `39229456214`、D2 `39229456312`、Review Baseline `39229456107`，仅针对这个 SHA。
- C 新版 `review-v3-execution/1` DTO + fail-closed proposal 校验器 `6a9de1ecc4d8d24dc1c29935230b28a579f997df`：PR CI `39240944254` SUCCESS，4012 pass / 5 OS skip / 0 fail。这只证明版本化提案输入检查代码，**不是 Run writer / Run durable ACK**。
- C 当前 `a34fc...`、I 当前 `dc90...` 的 Gate O **尚无 PASS**，新会话须查真实 workflow run、job、日志、测试总数，按每条工作流的精确 SHA 记账。queued/cancelled/success on parent 不等于新 SHA PASS。Gate E 实机和 Gate L 正式校方授权/Gold 与 Gate P 产品均未被覆盖；Release NO-GO。

## 3. C 当前代码具体做到了什么（不能概括成“C1 已完成”）

### 3.1 C0 + 执行事件合同
- `review-c0/1` 已冻结 C0。
- C 新增共享 `packages/shared/src/types/review-v3-execution.ts`，以及 `review-v3-execution-contract.ts` 和测试：完整 RunEvidenceIdentity、规范 SHA256 eventId、Host receipt、真实 SourceIdentity/extent、Check×target×subject/status、连续 sequence、同 body replay，不信任技术终态冒充业务审批。**未注册正式 C2 Main consumer/持久 ACK**，不能让 A 的旧事件隐式升级。

### 3.2 C1 原生业务和材料
- `workspace-service-v2.ts` 原生聚合优先、阻止 legacy projection 覆写 native；归档不可经 V1 投影复活。
- `source-current-validity-v3.ts`、`material-service.ts`、`material-lifecycle-v3.ts`、`application-service.ts`、`workspace-business-service-v2.ts`：材料替换/版本归档导致 Observation、EvidenceLink、ReadReceipt/Run 的**当前效力失效**，保留历史回执。部分逻辑仍只是 CaseAggregate 层，不宣称跨文件事务。
- `plan-binding-v3.ts`：内部 CanonicalPlan 绑定与显式升级 ACK，有合成验证 callback，**正式 Dev-B publisher/provenance verifier/Main InstallPlan 未实现**。
- 旧 `CREATE_CASE` 仍在 `review-ipc.ts` 中**先创建 V1 `case.json`**，再 `ensureWorkspaceAggregateV2`，**C1 唯一 native-first 建案未完成**。旧 UI `CreateCaseDialog`、`CaseManagerBar`、`use-review-actions`、材料处理/三栏都依赖旧 `ReviewCase`，绝不能直接只替换一个 IPC 并假称迁移成功。
- 旧 `saveCase`/`updateCase` 无权覆盖 native-only/corrupt V2，同 ID 旧影子在 V1 `getCase/listCases` 隐藏（仍从 V2 列表取正式案卷），旧 `UPDATE_CASE_SETTINGS` 禁止偷偷改冻结 Plan。
- C1_R03 新增 `case-lifecycle-v3.ts` + `case-lifecycle-v3.test.ts`：`ArchiveReviewCaseV3`/`RestoreReviewCaseV3` 通过 `submitCommand` CAS+Receipt；归档保存原件/历史、恢复只回到 `draft`，旧 `decided` 不恢复为当前批准。多轮归档记录于 `caseArchiveHistory`。
- Main 旧 `DELETE_CASE` 在可信主 Frame 下：V2 案卷**软归档**而非整目录物理删除；纯 V1 草稿维持旧删除语义；无法辨认或损坏的 V2 state 必须拒绝删除。Renderer `CaseManagerBar` 已更新提示。**尚未实现原生恢复的可信 Main handler、Preload 命令与真实 UI**。
- 归档时若同案 `queued/running` Run 存在则拒绝；普通 V2 Run 和 Pi 入口/迟到提交/读取路径初步添加 archive fence。**真正跨 PID/Host await 的 fencing 未证明**，不是 C4 事务耐久封版。

### 3.3 高优先级真实疑点——下一会话应先复核，不要照单宣称 PASS
1. **旧 DELETE 的 requestId 恒定碰撞风险**：`review-ipc.ts` 用 `legacy-remove-${sha256(caseId)}` 作为 archive requestId。第一次归档成功→显式恢复→第二次旧界面“移除”时，`submitCommand` 的 requestId 幂等检查可能返回**第一次的成功 receipt**，但不执行第二次归档；UI 会误以为已删除/归档。必须用真实往返正反例复现，确定每个 archive 周期唯一的受信请求 ID，同时保留单次重试幂等与同 requestId 不同 payload 拒绝，不得让 Renderer 自带写入凭据。此问题尚未修复。
2. `submitCommand` 的 CAS 与 run store 使用不同文件；归档前 `listRunsV2` 检查活跃 Run 与真正 Run 启动写入**不是跨进程原子**。当前取消/重验只是一部分防护，C4 需持久跨对象 intent/lease；绝不宣布同时归档/Run 的 multi-PID 竞态已关闭。
3. 旧三栏 `onDelete`／`deleteCase` 新软归档仍走旧 UX，必须确认列表刷新、恢复入口及重复操作含义；原生-only 案卷在旧列表不可见并非“全工作台可发现”。
4. C1 新测试（包括 `review-v3-legacy-entry-gates.test.ts`、`case-lifecycle-v3.test.ts`）均在最近一批新 HEAD 上**未有 CI 通过证明**；typecheck、Bun、按用例再核验 fixture/断言。不要移除失败测试只让 CI 变绿。
5. `restoreReviewCaseV3` 目前为 C-owned service，校验 `actorSource=local,role=reviewer`；**不得从 Renderer 直接塞 Actor**，正式 Main handler 需要复用可信 actor 派生与授权，恢复后旧 Run/Decision 的当前效力/输入指纹要测试而不是只看 stage。
6. `run-service-v2.ts` 和 Pi 的 archive fence 还需检查 await 中发起归档、进程间并发、迟到 Host、ENOSPC、重试、脏文件等；当前只是在执行链若干点读取聚合状态，非不可绕过的 C2 Run writer。

## 4. 对 I 的正式裁决：最重要的跨会话持续性约束

**唯一具有约束力的原文：#145 §9。新会话只在 C 决议区修改，不依赖本文直接指挥 I。**

- `C-I0-ACCEPT-001`：#146 I0 可追溯预检通过，**不合并**、不重写 I0 旧输入锁。
- `C-ANCHOR-001` / `C-I1-AUTH-001`：I1 仅可从 **C `31aa352c45a33d6832612884b0fea38e39b5cf8d`**，A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`，B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 三个已授权固定来源导入，旧 `review-c0/1` 技术 proposals/Plan candidate/staging/Preview only。I 后续源码新 HEAD 不可浮动替换。
- `CR-A-001`、`B-CR-001`：**批准分片接口设计，正式消费者/Picker/ApplyMaterial/InstallPlan 生产代码仍待 C 实现**；`completed-technical` 不等于正式 Run，候选模板不等于 published。
- **I 测试窄租约 `I-LEASE-C-TEST-R01 / APPROVED_ACTIVE`**：I 可在自己的隔离 `integration/v3-i1-*` / `i2-*` 分支，向 C-owned `apps/electron/src/main/lib/review/review-c0-ipc.test.ts` **只追加** I 专属联合测试/最少必要私有 helper，不删除/修改既有 C fixture/断言，不改 C 工程分支。只有 C 另签载有 `review-v3-execution/1` 的**新固定集成锚点**之后，才可对 `review-v3-execution-contract.test.ts` 执行相同性质追加；目前不激活后者。
- **I Main 窄租约 `I-LEASE-MAIN-PORT-R01 / CONDITIONAL_NOT_ACTIVE`**：原则认可 I 将来只做 C 指定 `review-ipc.ts::registerReviewIpc` 的独立**只读 STAGED_ONLY 技术 handler** hunk，但须先 (a) I1 精确 HEAD Gate O 真 PASS + C 按 diff 签收；(b) C 新共享 channel、Main Principal/Owner/capability 端口已在新的固定 C SHA 通过 CI；(c) I 给出函数级 PATCH、撤权/跨案/伪 Actor/Host 负例和回滚；(d) C 再签**激活**裁决。**现在未激活，I 不得改正式 Main handler、Preload 或 shared DTO**。
- **`I-LEASE-BUSINESS-WRITER / DENIED`**：Case、Plan install、Material、Run durable ACK、Batch finalizer、Decision、Outbox、SchoolPort 全归 C。不可把测试租约解释为核心业务写权。
- I 在 #147 新提交 `d6187b96ffc47b5606a57e78e0c2e6a2c7ae563b` 首次使用窄租约，仅在 `review-c0-ipc.test.ts` 文件尾追加两个真正调用注册 C0 handler 的跨线负例 `I-C0-IPC-01/02`，C 通过 scope review、CI pending。**I 当前 HEAD 已进一步变为 `dc90bb063c2b385ee2e63ad818fa48672319515e`，新会话须再读最新 diff 与 gate；并非历史 review 自动覆盖新 HEAD**。
- `C_ACCEPTED_FOR_ENGINEERING`：截至交接**尚未对 #147 签署**。I 的技术预览/模拟 Main 与正式 Electron/Provider/校方环境必须标识分开。若 C/I 新基线成功，I 应在独立新分支按锁定 SHA + patch/blob 重放有价值的集成成果，而非整分支粗暴 merge。

## 5. C 接下来的工程顺序（以实证决定是否调整）

**首批（接手时立即执行）**：
1. 固定远端 #144/#147/#145 当前 HEAD，读各自变更/评论/§9，核对确切 CI job/exit/首败；若原 CI queued 不可写 PASS。**先检查新的 lifecycle 代码和对应测试**，修上节 requestId 重复归档问题及 TypeScript/断言首败。仅在 C 开发分支改生产代码、C 所有权文档在 docs-only 分支单独提交。
2. 完成 C1 原生唯一建案：可信 Main native `CreateCase` 唯一业务先写；为旧 `ReviewCase`/三栏维护**只读兼容投影**（而非 V1-first 真写），并解决跨文件失败/重试恢复、原生列表→工作台选择→材料入口/设置/移除的真实路径。保持现有用户功能，不可简单禁掉旧 UI。
3. 正式的 `RestoreReviewCaseV3` Main/Preload/Renderer 路径与恢复前后 Run/Decision stale 状态；明确软归档 vs 真物理删除产品语义及菜单文案；必要时独立迁移模式、旧案可回滚，不偷偷删除历史。
4. 与 B 的正式可信 Native picker / material bytes staging、SourceRegistry、Plan provenance verifier 做 C-only 主进程权限桥接；先完成 C1 关键链路再认定 C1（不强迫 B/I 停止他们自己的进度）。
5. 新 C SHA 所有 Gate O 真 PASS 后，只有 C 在 #145 决议区签定新 `C_INTEGRATION_ANCHOR_SHA`，I 才可升锚点。隔离跑集中 Electron/UAT Gate E，不把一般 synthetic 测试伪装成实机。

**后续分期，不走 A/B/C 全轮瀑布**：
- **C-Tx（应早于 C2/C3 基本持久保障）**：跨对象 commit intent、CAS/retry/recovery、跨 PID/fault-fs 约束；建立正式业务边界，不重写历史。
- **C2 唯一 ReviewRun writer**：消费 A `review-v3-execution/1` 的 Host-attested proposals + B 可靠 Plan/Source，经 C Main trusted Principal/grant/epoch/extent/Check×target/unknown/activeSource 精确核验，**只有 durable Run/ReadReceipt/Check 成功才 ACK**。
- **C3 BatchAttempt**：批次最后 durable write 时验证唯一 entry Run、Decision.basedOnRunId、manifest/hash/revision、同案多 batch/同 request retry；不允许“最新运行”推断和无 Run 自动完成。
- **C4 完整 Outbox/Transaction/故障恢复**：Provider/模拟/学校接口不可混淆；多 PID、ENOSPC、await 撤权、业务幂等、旧 Run/决定审计历史。
- **C5**：统一三栏产品工作台、V1 shadow/adoption/migration、7 条旅程、72 历史能力、20 架构风险、71 产品门禁；完整 E/L/P gate 和集中 UAT。

**集中测试点**（先开发可远程/离线可做内容）：C1+C2+I1 首个综合 E；C3+C4+I2/I3 第二个 E；C5+I4 全产品 E；涉及真实校方政策/Gold/学校身份需合法授权 Gate L，不得伪造。离线 Gate O 可以每个适当批次跑，避免每小步把用户叫去本机跑虚拟屏。

## 6. 安全边界和容易误操作的仓库约束

- **工程分支** C `feat/v3-dev-c-business-r01`（base 为 C0）；**协调/docs-only 分支** `docs/v3-integrator-i-r01-taskbook`（base 为 main）。不要从 docs-only 分支承接工程提交，也不跨两分支混提。
- **只编辑 §9 C 决议和 §10 C 状态**，A/B/I 的区段分别由其 Owner 写。更新共享文件先 fetch 原文和 blob SHA，进行乐观锁更新，发现冲突先刷新，不粗暴覆盖其他 Agent。
- 本目录是 **C 专属会话记忆**，不指挥/不授权 A/B/I。C 对外正式修改必须写 §9；只有 C 自己想恢复上下文时才看本文。不要要求 A/B/I 再读本文。
- A/B/C/I 都保持 Draft，代码行使的写权与“业务最终签收”区别，保护 frozen SHA。每个 PR/集成必须记录源码 SHA、导入 SHA、HEAD SHA、test/log、Gate O/E/L/P、首败、回滚。
- 校方真实政策/Gold、已签正式外部学校回执、Teacher/Provider 身份不可测试凭空宣称。所有 C 工程改动以 source path + real test 而非描述“已完成”衡量。
- 如无法 clone/Bun，不要声称本地运行过；用 GitHub 原生源码、精确 CI 作证据，持续修真实失败。Dev-C 不能因为 I 有租约就让其承担 Shared DTO/正式业务 writer。

## 7. Dev-C 下一会话完成第一轮任务的验收形式

必须输出并提交：
1. #144 exact-HEAD CI 状态与首败/实测 PASS（如未完成则 QUEUED/UNVERIFIED）；上述重复 archive 问题经过真实可复演测试，必要修复到 C 工程代码；
2. 更新后的 C1 native-first create/restore/Main 工作清单与**真正代码提交**，不止报告；
3. #147 当前真实 HEAD 的租约 compliance 与联合 Gate O 检查，决定是否够资格签 C 工程签收；未经验证不能扩大 Main 写权限；
4. 在 #145 §9/§10 C 区记录**只有正式裁决需要共享的内容**，在 #144 更新执行进度，保留本 C-only 文档作为历史交接，不把它当产品合同；
5. 明确下一批重要工作和集中验收点。

**本次交接结束。不要求新 Dev-C 重复介绍研究阶段或等待用户补充背景，直接做下一批真实工程。**
