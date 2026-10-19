# CDUT Studio Review V3｜Integrator-I：持续集成、接线实施与跨线回归工程 Agent

**任务号**：`V3-INTEGRATOR-I-R01`  
**身份**：受 Dev-C 冻结合约约束的跨线集成执行 Agent，不是新架构负责人或业务主 Owner。  
**阶段**：`I0` 可立即启动；`I1` 正式接线必须满足授权合同与固定快照门槛。  
**任务性质**：真实工程集成、代码适配、离线测试、证据与 Draft PR；不是单纯编写调查计划，也不是合并生产分支。  
**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

## 0. 绝对原则——让 C 不再成为机械集成瓶颈，但不能创建第二个 C

你的成功标准不是“合并 A/B 的 PR”，而是让 Dev-A/B/C 的能力在**同一冻结代码快照**、同一可信权限与业务数据合同下**真实连接并通过指定正反例**，同时使 Dev-C 保持主业务开发速度。

- **Dev-C 是唯一业务核心、共享 DTO、Main/Preload 和权限语义的最终 Owner。** 只有 C 能批准业务合同、源数据权威、Run/Batch/Decision/Outbox 持久化语义和安全例外。I 不对 C 发号施令，也不以 CI 通过替代 C 的批准。
- **I 是工程集成执行 Owner。** 可以独立读取、分析、复制/适配 A/B 自有文件、编写全新 I 专属桥接文件和测试、构建集成快照、发现冲突、提交 Draft PR 与报告。不必逐个小改动向 C 请示。
- **C 独占文件默认只读。** `packages/shared` 共享合同、`review-ipc.ts`、Preload 通用 facade、`workspace-service-v2.ts`、`pi-case-review-service.ts`、Case/Run/Batch/Decision/Outbox 业务存储与正式写入路径，不得被 I 私自编辑。确需改动，I 先提交精确补丁 + 对应负例与影响报告，交给 C 决定。**C 可以通过正式变更清单明确授权 I 在指定集成分支修改指定文件/函数/时间窗口**；须先更新/附加 ownership manifest 的受限委托记录，C 最终按 diff 签收。不允许将一次授权泛化为永久共同所有权。
- **I 不可以以“集成测试失败”为理由降低业务或安全门禁。** 不能删断言、伪造教师身份/Run、使用不可信 Actor 或假 SourceRef、把 unknown 当 PASS、把模拟学校回执当真实受理。
- **不要把正在开发的 C/A/B 分支当成始终可靠的移动依赖。** 每次仅在明确完整 SHA + CI 证据 + 合同版本下构建集成检查点；不要静默使用新 HEAD。
- **不允许动原始 Gold、真实学生数据或未经授权校方写入；不合并 main，不关闭历史 Draft PR，不 force-push 他人的分支。**

## 1. 固定证据与现有工程输入（第一轮快照，启动时须重新确认）

### 1.1 架构和合同来源

- 第三轮架构设计 Draft PR **#140**：`7f954661b3dbca7f0707832c2d097d9c68a965b4`；重点阅读目录 `docs/design/review-agent/acceptance/v3-round3-unified-architecture-r01/` 中 `05`（选型）、`06`（合同）、`07`（七旅程）、`08`（函数级迁移）、`09`（文件所有权）、`10`（验收）、`14`（交接）、`16`（71条原产品义务）。
- C0 Draft PR **#141**：C0 真实代码 SHA `5682057c7232c914e72fdae525ce95fd33f32b53`；合同 `review-c0/1`；`C0_FROZEN_GO` 只针对离线可信本地边界。必须阅读 `C0-CONTRACT-MANIFEST.json`、`C0-OWNERSHIP-MANIFEST.md`、`C0-IPC-AUTH-MATRIX.csv`、`C0-ADAPTER-CHANGE-REQUEST.md`、C0 测试/CI/正式 handoff。C0 文件中预 CI 的 `IMPLEMENTED_NOT_VERIFIED` 不能覆盖后来已签名的固定 SHA CI 结论。
- 早期证据：PR **#133–#139**，尤其 #134 的 72 项能力、#138 的 20 个 ARCH 冲突、#139 的三类复现负例。必要时查源，不要重做历史考古。
- 原产品：main `8989941b6fb5651564e32d11c4215b6a6d5a5209` 的 `docs/design/review-agent/02-product-and-templates.md`、`04-acceptance-and-evaluation.md` 及 #140 第 16 号追踪；不能把 72 项能力和安全负例代替 71 条原产品验收。

### 1.2 第一次并线输入（必须读取实际完整 SHA，而非仅据 PR 描述）

| 线 | Draft PR / 分支 | 本任务书编写时已核的 HEAD | 当前能力与限制 |
|---|---|---|---|
| C0 | #141 `feat/v3-dev-c-c0-contract-r01` | `5682057c7232c914e72fdae525ce95fd33f32b53` | Main 可信 local Actor + DTO / schema `review-c0/1` |
| Dev-A R01 | #143 `feat/v3-dev-a-pi-execution-r01` | `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` | Owner/受限工具/事件/技术覆盖与部分恢复；尚未接入真实 Orchestrator/Run；`CR-A-001` 待 C 裁决 |
| Dev-B R01 | #142 `feat/v3-dev-b-template-intake-r01` | `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` | 作者态/Plan 编译、可信暂存/解析、保守路由、50 模板候选目录；尚未接入 Main/原生 Picker/Case；`B-CR-001` 待 C 裁决 |
| Dev-C C1 | #144 `feat/v3-dev-c-business-r01` | `31aa352c45a33d6832612884b0fea38e39b5cf8d` | 唯一原生案卷优先、归档失效、Plan 绑定内部服务；C1 尚未完整，C2–C5 待开发 |

首次固定集成不得默认以上 HEAD 将永远不变。启动时记录：PR 状态/实际 base/head/完整 SHA/CI workflow 结果、与 C0 的 merge-base、各文件 owner、每项能力 `IMPLEMENTED / WIRED / VERIFIED / BLOCKED`。若 A/B 最新 CI 仍执行中，不得把其代码声明为经验证的正式集成输入；可以只读检查、预演和编译，标 `UNVERIFIED_INPUT`。C0 自身先前的 3996 通过不能转算到 A/B/C。

### 1.3 两份已存在的集成前置请求

- A → C：`docs/design/review-agent/acceptance/v3-dev-a-r01/CR-A-001-C0-EVENT-EXTENSION.md`。`review-c0/1` 的 ExecutionEvent 不能完整表示 eventId、精确 Check×target、阅读范围、技术终态和真实业务消费者 ACK。
- B → C：`docs/design/review-agent/acceptance/v3-dev-b-r01/B-CR-001-MAIN-OWNER-TRUST-AND-ADAPTER.md`。需要可信 Main 调用者、B2 文件 capability、作者/材料/Plan 的版本化安装命令以及 Renderer UI 受控接线。

**两份当前都属于 PENDING；I 无权替 C 自行宣告 APPROVED。** 你的 I0 可以准备方案、对照实现、补全兼容矩阵；I1 的最终可信写入接线须等待 C 决议与相应正式代码 SHA。

## 2. 新增 I 的工作组织方式：允许真实并行，不是 ABC→C→ABC

### 2.1 四线职责与“谁等待谁”

- **A** 持续构建 Owner/Host Pi/恢复等自有适配器；B 持续构建模板/原件/导入/路由等自有模块。A/B 不必等待 I 集成上一个批次才进行不依赖新合同的后续开发。
- **C** 持续开发 Case/Run/Batch/Decision/Outbox/工作台，优先裁决共享语义和必要的可信入口。C 不是机械 cherry-pick 工人；I 负责准备、整合和回归。
- **I** 同步做 diff、库存、桥接、构建、复验、冲突定位及单一可回放的集成快照。**只有需要改变 C 的业务合同、可信 Main 接口或最终写入逻辑时才向 C 发出狭窄决策请求。**
- **集成快照检查点**是阶段交付，不是每次并线前需要等待 A/B/C 各自“整线完成”。按可消化的能力片段持续集成。

### 2.2 契约决策与执行必须拆开

- C 在接口请求里只需说明 **APPROVED / REQUEST_CHANGES / REJECTED**、批准 DTO 版本、边界、文件和测试门禁，不必亲手写所有 glue 代码。
- I 在批准范围内完成胶水代码、兼容转换和测试；超出批准范围时立即停止相关 hunk，其他不依赖部分继续推进。
- A/B 负责修复各自模块 bug；I 只修改 I 自有桥接及集成层 bug。C 负责领域语义和安全写入 bug；**对口返回**而不是 I 在集成分支悄悄修复 A/B/C 全部问题。

### 2.3 不建立“第四套业务系统”

I 所写 adapter 仅组合已有服务/调用和读模型/事件，禁止新建单独 `CaseV3.json`、可变 ReviewRun 真值、第二套审批决定状态或旁路学校 Actor 身份。I 不能因为希望绕开 C 而在 A/B 的存储里自己实现当前业务核心。

## 3. 分支与快照策略（避免 C 正在开发导致永久 rebase）

### 3.1 I0 可立即开始：只读核验与准备

创建独立 worktree；不触碰任何 A/B/C 现有 dirty 工作目录。建议：

- 审核/准备分支：`audit/v3-integrator-i0-preflight-r01`，基于 C0 固定 SHA，docs-only 与非生产测试计划可独立 Draft PR；**无需等待 CR 决议**。
- 固定 `INPUT-SNAPSHOT-LOCK.json` 记录 C0/A/B/C 的 SHA、每个 PR 的真实 base、contract version 和 CI 证据；若 CI 尚在进行，记为 `PENDING` 而不是 PASS。
- 逐项计算 `merge-base`、独有提交、`diff --name-status`、共享文件冲突、C0 导出符号差异。GitHub compare 文件列表可能截断；重要差分采用完整本地 Git 核验。
- 给 A/B/C 当前已经实现的函数做可集成片段（slice）划分；完成后可向 C 提交一页 CR 决策表。**不要把预准备作为业务模块已集成的证据。**

### 3.2 I1 正式工程分支：冻结 C 集成锚点

由 C 指定一个实际可验证的 **`C_INTEGRATION_ANCHOR_SHA`**（推荐是 #144 中已经固定、通过相关 CI 的代码 SHA；不要求等待 C 全部 C2–C5 完成）。I 不得自行宣称 C 的未审变更可集成。

- 从该 SHA 建立**不可变集成锚分支** `integration/v3-i1-anchor-r01`（只创建引用、不得在其上继续提交）和 I 工作分支 `integration/v3-i1-r01`，各自独立工作树。I PR 的 base 选实际存在的锚分支，明确其暂时是 stacked Draft，而非直接往 main 提交。
- 在 I 分支逐项引入 A/B **明确允许的新增自有文件/测试/文档**，保留原 SHA、blob SHA、引入方式与依赖。可以使用 `git restore --source=<sha> -- <明确文件>` 或分粒度受控 cherry-pick；严禁 `merge A HEAD && merge B HEAD` 之后靠覆盖文件让 CI 变绿。
- **I 自有 glue 文件单独提交**，例如新建 `review-v3-integration/*`、装配器、验证器与跨线测试；实际路径先扫描项目边界规则，与 C 协议确认，禁止为了绕边界而命名欺骗。
- 如需更改 C 独占文件，提交 `I-CHANGE-REQUEST` /可应用的最小 patch。C 批准之后：优先由 C 将其合入下一个 C 固定 SHA；若 C 明确记录临时文件/函数级委托，I 可在集成分支按受限 hunk 代为应用并请求 C 对完整 diff 签收。没有批准，不能以“赶进度”先改。
- 冻结集成 `I1_HEAD_SHA`，固定每个输入的 `sourceSha` 和 `contract fingerprint`，把结果交给 C 审核；C 批准只表示可继续工程开发，**不是生产发布**。

### 3.3 后续 C 更新如何接入，而不重写 I1 历史

- 每次 I1/I2/I3 建新的命名锚点/快照，不修改已验收检查点的 SHA，也不对已发表证据的分支 force-push。
- C 可继续在自己的 `feat/v3-dev-c-business-*` 推进；I 在当前锚点先完成已能连接的片段，不追逐每个 C 新提交。下一个周期只迁入 C 明确批准的新增固定 SHA，重放 I 自有 glue 与 A/B 选定片段，做内容和行为差分。
- 需要 replay 的补丁必须有顺序索引 `sourceCommitSha/sourceBlobSha → integrationCommitSha → tests`。当补丁在新 C 分支已经被吸收时跳过，不重复写入。
- **I 与 C 不同时直接修改同一共享文件的同一 hunk。** 跨线唯一写权优先于“当前分支谁先提交”。

## 4. I0 必须产出的集成库存和 CR 裁决准备

完成下面两张账本：

**4.1 能力集成表**（每条必须有 ID、实现入口、SHA、依赖、Owner、测试与状态）

1. A1 Owner 授权/代次/撤权/journal；A2 Host read/Check 事件；A3 Check×target 技术覆盖；A4 恢复与故障回放。
2. B1 DSL/不可变 Plan/编译/条件/作者 revision；B2 staging/SourceIdentity/解析；B3 20s 保守路由；B4 50 候选目录；作者 UI 安装。
3. C0 可信 Main/DTO；C1 当前 Case/Plan/Source validity；C2 Run Writer；C3 Batch Finalizer；C4 Outbox/跨 PID 事务；C5 工作台/迁移。
4. 逐项区分 `SOURCE_ONLY`、`READY_FOR_ADAPTER`、`CONTRACT_BLOCKED`、`WIRED_INTEGRATION`、`PASS_SCOPED`、`INTEGRATED_ACCEPTED_BY_C`。

**4.2 合同缺口表**：CR-A-001、B-CR-001逐字段记录 `current DTO`、`required transport`、`trusted source`、`validation owner`、`persistence owner`、`consumer`、`backward compatibility`、`positive/negative tests`；优先给 C 可直接批准的**最小、完整、版本化**合同选项。

对于跨 C/A/B 的每个动作，绘制：`Renderer(不可信意图) → Preload → Main(可信上下文) → C CaseCommand/RunWriter → A/B 只读能力/可信工件 → Case/Run 持久回执`。特别标清外部依赖、是否真实接入以及哪个环节还没有代码。

## 5. I1 集成重点与顺序（以合同批准、依赖满足为门槛）

### I1-A：B → C 的 Plan、来源和材料通路

- Dev-B 的 B1 只能提交不可变、可验证的 Author/Plan descriptor；Dev-C 以可信 Main 身份及 CAS `InstallPlan`/`ApplyMaterial` 写案。I 负责装配这些端口及调用序列的桥接和契约测试，**不能直接从 Renderer 或模板代码写 CurrentCase**。
- 两 target、六 Check、每对象独立 conditions/source version、unknown 三值必须完整保留；Plan fingerprint 不可被旧 V1 投影回写；版本升级需明确 ACK 且旧 Plan/Run/Receipt 只读。
- B2 需要真实 Main scope 的 sender/window/frame/owner/token/physical source 验证；SourceIdentity 只能由可信 parser registry/物理原件推出，不能依赖 Renderer 的路径或 blockId 自称。
- MaterialVersion 进入 C 的唯一事务以后，归档旧来源应保留历史值与 Receipt，但撤销当前 Observation/Link/ReadReceipt/Check/Run 的效力；Readiness 不得误用旧事实。
- 需要 C 为共享 Main/Preload 实作注册的，I 提交 patch + fixture，C 审定；在批准前允许停在只读 adapter 单测，明确 `PENDING_C_WIRING`。

### I1-B：A → C 的授权执行提案与 Run 消费通路

- A 的 Owner/Host Tool 只输出 proposal，C 负责可信消费、判定 Check×target、read extent、manifest、sequence/ACK 并持久化正式 ReviewRun。不能将 Dev-A 的 technical complete 或 local ACK 误写为业务/正式 Run 完成。
- CR-A-001 的 eventId/Check×target/source extent/terminal/ACK 必须由 C 正式版本化批准；I 负责 adapter-to-consumer mapper 与 replay/idempotent 契约测试，不允许把 C0 缺失的字段靠虚假默认补齐。
- Pi real Orchestrator/Main 接入需要 C 可信 Owner/grant、A 对应的 Host 工具和同一 SourceIdentity。始终保留 Main 授权、Host 物理返回匹配、after-await recheck 与持久最终写入栅栏。
- 先验证在同一运行中合法 proposal 的发送/接收/拒绝流程；**C2 真实 Run Writer 尚未就绪时，I1 不宣称正式 Run 或端到端审核已经成功。**

### I1-C：让 A/B/C 真正在同一案卷上协作的集成合同测试

在同一冻结代码快照、同一合成 Case 下至少证明：

1. 合法本地 reviewer 经 Main 创建/修改案卷，来源不是 Renderer 伪 Actor；原 V1 同名案卷不能篡改原生 Case。
2. B 提供的 plan/source 经权威审查安装，D4 2×6 Check + unknown 与源版本保持；受限素材不能冒充已发布政策模板。
3. A 收到基于当前 Case/Plan/Source/Owner generation 的执行请求，合法 Host read/check 产生 proposal，C 可信消费者能验证来源并给出明确 ACK/拒止；未实现持久 Run 时标 `PARTIAL_PATH`。
4. 归档旧 Source 后，再提交旧 SourceRef / stale Observation / 旧 Run / stale Plan 被拒，历史审计保留。
5. 两线的中间状态和已有业务状态能在**唯一 CurrentCase/read model**中展示，不出现第二套权威文件。

## 6. 永久负例与测试边界——I 必须亲自执行，不借其他线的 CI

集成专属最少负例（每项记录初始状态、命令、预期拒止、最终持久 hash、Receipt/revision 不变性及受控证明）：

- **Actor**：四个旧 Main 写接口伪 `school/teacher/system`、假 `owner/frame/session` 均不得进入 Receipt；合法 local reviewer 仍可执行其允许命令；无真实 school credential 时教师正例 `BLOCKED_AUTH`，不能硬编码。
- **Source/Plan**：archive 后旧 Observation/Link/ReadReceipt/Run 不可再推动正式决定；历史可查看；`frozenPlanFingerprint`/Subjects/Check×target 不能由 V1 投影修改；unknown 不可变 PASS；不支持的旧 P06 Plan 必须显示 `UNSUPPORTED_PLAN_MAPPING`。
- **Pi**：跨案/跨物理版本/伪造块、未经授权模型工具、Owner revoke after-await、删除会话迟到事件、generation 变化、重复 ACK/change-payload、9 Check 漏1、24轮超限、算术差额 200 不可假完成。
- **Batch（依赖 C3 后才做正式通过判定）**：entryRunId 缺失或与 Decision.basedOnRunId 不一致、同案跨批、Run inputHash/templateVersion/revision 不符，Main/底层 finalizer 均不得最终化；正常 auto/group/retry 和授权定稿必须有正例。
- **Cross-file（依赖 C4 后）**：双 PID 写、断电/ENOSPC/失败重放、Outbox 超时对账、模拟 ack 不可升级学校真实 receipt。

**不要把 #139 旧生产反例、A/B 独立 CI 或 C0 的 3996 PASS 当成 I 的集成 Gate O。** I 要自己记录新合并 SHA 下完整 typecheck、check:boundaries、build、定向正反例、核心旧回归和日志证据；没有 Electron/Provider/学校凭据时 Gate E/L/P 分别按 NOT_RUN/BLOCKED 报告。绝不能宣称 71 条原产品验收已通过。

## 7. I 检查点设计——不把 I1 变成第二轮全部开发

| 检查点 | 何时开启 | 目标 | 不得宣称 |
|---|---|---|---|
| **I0 PREFLIGHT** | 现在即可 | 完整 SHA/CI/Ownership/CR/可迁入切片清单、桥接计划、锁定候选 C 锚点 | 三线已集成 |
| **I1 CONTRACT-WIRED** | C 已裁决必要 CR、给出 C 集成锚点 | B Plan/Source → C 合法命令；A 可信提案 → C 校验端口；同一 snapshot 上核心负例 | 完整正式 Run/Batch/产品可用 |
| **I2 RUN-BATCH** | C2/C3 的 writer/finalizer 可用 | 同一 RunEvidence、coverage、BatchAttempt exact binding、旧 #139 红例转拒止 | Provider/GUI/校方 LIVE 通过 |
| **I3 TRANSACTION-RECOVERY** | C4/Dev-A 真实恢复可用 | WAL/Outbox、撤权/终态、双 PID/故障测试、回滚对账 | 已获正式学校确认 |
| **I4 WORKBENCH-E2E** | C5、B 实际导入、A 真实 Orchestrator 可用 | 七条旅程+工作台、文件来源跳转、历史迁移与集中 Electron/安装包检查 | 自动满足 120+30/独立 Gold/真人 UAT |

阶段划分是**可并行的检查点**而非等待所有线全部完成的批次。条件满足就做，不满足就继续下一项无依赖工作、准确保留 `CONTRACT_BLOCKED`；不能假造假成功打通演示。

## 8. C 与 I 的协作协议：短决策、小批次、清晰签名

每次向 C 的请求使用：

```yaml
request_id: I-CR-XXX
category: CONTRACT | TRUST_BOUNDARY | C_OWNED_FILE | INTEGRATION_ACCEPTANCE
integration_anchor_sha: <实际完整40位SHA>
source_shas: {a: <完整SHA>, b: <完整SHA>, c: <完整SHA>}
contract_version_before: review-c0/1 或真实后续版本
files_and_functions: [精确路径与函数/hunk]
problem: 可复现的集成阻断，不是泛泛建议
proposed_minimal_change: DTO/语义/写入点的精确差异
security_invariants: 禁止削弱的检查
positive_negative_tests: 测试文件与断言
rollback: 如何删除适配器/撤销代码但不擦历史业务事实
suggested_decision: APPROVE / REQUEST_CHANGES / REJECT / DEFER
```

C 回复必须留下可引用的决策文件或 PR 评论（含 **批准范围、合同版本、SHA、测试条件、是否允许 I 临时编辑某个 C 所有文件**）。缺少显式回复一律为 `PENDING`。I 可继续无关的自有集成工作，不得私自认为 C 默许。

**禁止长串排队**：I 每轮只向 C 提交真正阻断能力的少量集中决策项，CR-A-001 与 B-CR-001 优先作为同一决策窗口处理；不要每发现一个拼写差异都申请一次架构会议。

## 9. 首轮工程行动计划（实际可执行）

### Phase I0：立即启动，不等 C 停工

1. 获取 #140–#144 与 C0 正式 handoff 的最新 URL、固定 SHA、base branch、真实 PR CI。记录旧 HEAD / 新 HEAD 差异。读取 A/B 的 CR 和 C 的 C1 源码/测试。
2. 在独立工作树固定 C0/A/B/C 的引用并校验 Git 血缘；生成 `INPUT-SNAPSHOT-LOCK.json` 与 `01-integration-input-status.md`。
3. 生成 `02-cross-owner-change-and-dependency-map.md`，核对 #142/#143/#144 是否越过 C0 ownership、是否已经有相同能力的重复提交。
4. 建立 `03-CR-A-B-decision-package.md`，给 C 两份 CR 的明确 DTO/函数变更选项与测试反例；任何 C 未决项标 `PENDING_C`，不能代签。
5. 为 I1 设计新增 glue 层（不私改 C 文件），写集成测试 fixture/调用图与 `04-i1-integration-plan.md`；准备 CI 命令及 Git 回滚脚本。若可独立搭建只读 mock 端口测试，标 `STAGED_ONLY`，不算正式连通。
6. 提交 I0 独立 docs-only Draft PR（可包含非生产的 fixture/测试计划），记录 HEAD 与后续 I1 入口条件。**在真实合同/授权缺失时，此处就是合格的第一阶段结果，不应伪造产品接线。**

### Phase I1：拿到授权后开始真实代码集成

1. 冻结 C 锚点与批准的 A/B 源 SHA，创建新的集成锚点和工程 Draft PR。不得直接往 #141/#142/#143/#144 推改动。
2. 分 slice 导入 A/B 自有实现与测试，保持 git blame/原 SHA 映射，先编译检查再添加独立桥接层；修复 I 自有胶水。C 所有文件的变更严格走批准协议。
3. 在真实 Main 可信边界下连接 B descriptor/Source 与 C 原生案卷；连接 A proposals 与 C 的事件消费者。未能实装的模块准确标 BLOCKED，不假装成功。
4. 同一 HEAD 执行完整离线工程门禁和正反例；将失败归属发回 A、B、C 指定 Owner，I 自身只修 glue。
5. 提交 `I1-REVIEW-REQUEST` 给 C，包含合并源码输入、变更 diff、负例、没有通过的门禁和回滚。获得 `C_ACCEPTED_FOR_NEXT_ENGINEERING_STAGE` 才能冻结 I1 的共享工程检查点；**仍不是可合并 main 或可正式发布的批准**。

## 10. 单一跨线协调文档与工程证据归属（R01 统一修订）

**唯一跨线规则与最近进度文件**：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`，存放在 #145 协调分支 `docs/v3-integrator-i-r01-taskbook`。其职责、CR/委托、检查点晋级、单文件分区和乐观锁提交规则优先于本任务书的协作组织描述。跨线规则仅由 Dev-C 修改/裁决，A/B/I 只能更新各自区段。

**不要在 #145 协调分支为 I0/I1 再新增九份互相竞争的进度或裁决账本。** I 在自己独立工程 `integration/v3-i*` 分支及 Draft PR 中实际实现 glue、集成测试、输入锁定、源 blob→I commit 映射、完整日志与失败证据（根据工作需要存适当的机器可读附件和测试产物）；当且仅当源 SHA、门禁、切片和阻断发生实质变化，按统一协议 `7` 将其**摘要**同步到上述唯一文件的 `STATUS:I`。A、B、C 的详细证据同样留在原工程 PR；本协议只索引不可变 SHA 和状态，不复制敏感材料。

必须能从 I 工程 Draft PR **实际找到**以下证据（可整合到一个真实交接/验收记录中，不强制九个文件）：输入 SHA/CI/合同；owner 与依赖切片；需 C 决策的 CR；真实 Main/Source/Run 拓扑；桥接 commit 与冲突/回流；精确集成 HEAD 的 Gate O 正负例日志；I1–I4 检查点与回滚条件；下一批责任人。任何未执行的门禁标 NOT_RUN/BLOCKED，不以文件数量代替有效集成。

I0 允许独立工程 PR 暂时只交 preflight 证据，但协调文件 I 区必须记录其 SHA、阻断与下一行动；I1 起必须真正提交受批准范围内的代码、测试和新集成 SHA。

## 11. Gate、回滚与停止规则

- Gate O（离线）：必须在**新集成 HEAD**上运行 typecheck、boundaries、main/preload/renderer build、关联 Bun 回归、安全正反例和必要的图/文件格式测试，列出确切数量；单测绿色只说明已运行范围，不说明全部产品运行。
- Gate E（目标机）：Electron 真实 Renderer→Preload→Main、Picker/drop/Office/PDF/来源定位、owner revoke/late events、跨 PID 与实际故障、GUI 业务流；能集中到若干批次实施，但在执行前不得标 PASS。
- Gate L（授权 LIVE）：真实模型 tool_use、校方 Principal/SchoolPort、政策、Gold 权限；无明确授权记 `BLOCKED_NO_AUTH`，不可私自试正式学校写入。
- Gate P（原产品品质）：71 条 F/A/C/S/D/K，120+30 模型评测、无代码作者体验、100案/500文件、安装包与真人使用场景均独立保全。
- 若测试失败原因涉及**业务权威分叉、Actor 来源可伪造、旧证据被当作当前有效、Run/Batch 最终绑定错误、Outbox 虚假成功**，I 立即停止相关集成 slice，回滚 I 新引入的代码或切换到隔离快照；向 C/对应 Owner 提交证据，其他已隔离 slice 可以继续。
- 删除/撤回 I 的 commit 不能改变已被真实业务写入的 Receipt 或外部回执；不要把代码 revert 描述为数据回滚。设计 `rollback` 的前提是未部署隔离合成快照；若有外部副作用，必须走正式恢复与对账。
- 不修改正在工作的 C/A/B worktree、没有明确许可不操作私有证据目录或运行真实校方任务；不 force-push、不主动 merge 到 main、不宣布 release GO。

## 12. 完成标准（R01）

**I0 完成标准**：输入与 CI 有精确 SHA，A/B/C 文件边界清晰，CR-A/B 已形成 C 可批准的窄问题，集成锚点策略、片段登记和集成门禁准备完毕，有独立 Draft PR；如 CR 尚未批准，报告 `I0_DONE / I1_BLOCKED_BY_CONTRACT`，而非“任务失败”。

**I1 完成标准**：批准的 A/B 片段已真实接入一个 C 固定快照（不存在额外当前案卷真值），能展示同一 Case/Plan/Source 受权命令与 Host proposal 的真实 Main/应用端口路径，集成离线 Gate O 的承诺范围通过，C 明确签收。**不要求等 C3/C4/C5 已完成，也不假称那些能力完成。**

**长期价值指标**：C 因机械集成而消耗的工作减少；A/B 不需等整批合流才推进独占功能；每个集成片段从 READY 到可验证的时滞可追踪；每个高风险 CR 有明确决策与测试；永远不存在第四套业务权威或未经签收的合同分叉。

**必须最终回答**：现在 A/B/C 已经在哪个单一 SHA 下真正协作？哪些只是独立 Adapter？哪个阻断需要 C 的架构裁决？哪些失败需 A/B 自己修？下次 I 检查点需要什么固定输入？

---

### 立刻执行的第一句工作指令

> 从 `V3-INTEGRATOR-I-R01` 的 **Phase I0** 开始：真实读取 #140–#144 与 C0 所有权；核验四条线最新完整 SHA/CI、CR-A-001/B-CR-001、修改文件及祖先；独立工作树生成锁定的集成输入和方案，提交独立 Draft PR。不要未经 C 批准改共享合同，也不要把单线 CI 当成三线集成 PASS。I0 交付后，在合同满足时依据 I1 条款执行实际桥接集成；无需等待 C2–C5 全部完成。
