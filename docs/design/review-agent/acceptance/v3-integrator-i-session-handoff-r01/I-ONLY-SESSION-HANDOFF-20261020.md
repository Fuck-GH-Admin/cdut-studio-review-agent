# CDUT Studio Review V3｜Integrator-I 旧会话专属工程交接（2026-10-20 R01）

> **分类：I_ONLY_SESSION_MEMORY / NOT_SHARED_POLICY / NOT_C_DECISION / NOT_NEW_AUTHORIZATION。**
> **唯一目标读者：新接手的 Integrator-I / Dev-I 会话。Dev-A、Dev-B、Dev-C 无需阅读、ACK 或执行本文件。**
> 本文件仅保存 I 工程会话的上下文、核查证据、已做代码及继续工作的顺序。它不是新的 ABCI 共同协议，不给 I 新增 Main/Preload/Shared/业务写入租约；与 #145 §9 C 正式裁决、新的 exact-SHA 源码/CI 冲突时，以新证据和 C 有效签署为准。
> **观察时点**：2026-10-20（北京时间）。SHA 和 workflow 状态为接手快照，必须现场复核；Draft PR 仍未合并 main。

## 0. 接手阅读顺序（不要重新开展一轮历史考古）

1. **唯一共同协议与有效权限**：PR [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，分支 `docs/v3-integrator-i-r01-taskbook`，文件 `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。完整读尤其 §9 `DECISIONS:C` 和 I、A、B、C 四个状态区；I 只能修改自己 `STATUS:I`。
2. **本 I-only 交接及配套启动任务书**：当前目录的 `I-ONLY-SESSION-HANDOFF-20261020.md`、`I-ONLY-NEXT-DEV-I-START-20261020.md`。它们只是 I 的恢复资料。
3. **最新已通过但 C 尚未签收的集成工程**：[I2 Draft #148](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/148)，分支 `integration/v3-i2-source-replay-r01`，精确 HEAD `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`；首先读 `docs/design/review-agent/acceptance/v3-integrator-i2-r01/I2-SOURCE-AND-CHECKPOINT-LOCK.json`、`I2-REPLAY-AND-GATE-O.md`、PR 全部范围及真正 GitHub CI 日志。注意锁文件中的 `PENDING` 是提交时的历史状态，不应覆盖较晚的精确 CI 完成证据。
4. **此前 C 已签收的 I1**：[I1 Draft #147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147) HEAD `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7`；目录 `v3-integrator-i1-r01/` 的源锁与评审报告，绝对不要覆写 I1 已接受 HEAD。
5. **四条技术来源**：C0 [#141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141)；C [#144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)；A [#143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)；B [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)。源码以 C 正式批准的固定 SHA 为准，浮动 HEAD 仅作新候选调查；按需再追溯 #133–#140 架构审查。

## 1. Integrator-I 身份、真实职责及四线协作

- **Dev-C / PR #144**：唯一共享合同、安全与正式业务状态裁决者。C 独占 CurrentCase、正式 Material/Plan/ReviewRun/ReadReceipt/Check、Batch、Decision、Outbox、Main Principal、C-owned Main IPC/Preload/shared DTO、学校权限与真正的 durable ACK。C 在 #145 §9 决定每个 exact I SHA 的工程签收及新租约。
- **Dev-A / PR #143**：Pi Owner/grant/session/generation、Host 调用及 SDK/Provider 技术凭证、`review-c0/1` 旧 local proposal、`review-v3-execution/1` A 技术 proposal producer、turn-budget/dispatch-fence/故障恢复。不能自行签 C2 业务消费 ACK。
- **Dev-B / PR #142**：B1 候选作者与编译、B2 Main-scoped physical bytes staging/SourceIdentity/ZIP/ImportLedger、B3 保守路由、B4 历史证据/字节来源。50 套为 `candidate-held`，`publicationAllowed=false`；不能视作已授权校方政策、独立 Gold 或正式 CanonicalPlan 安装。
- **Integrator-I（你）/ PR #148**：负责按 C 准许的固定源码 SHA 和文件级 Git blob 重放 A/B/C，构建 I-owned 技术适配器、真正跨线合成正反例、联合 Gate O、可靠的可追踪检查点与回滚、向 C 提交可判定的代码/权限申请。不是第二个 Dev-C、不是 A/B 的上级、不是纯文档整理者。
- 工程目标是把多线真正成熟的能力持续汇合，而不阻断 A/B/C 的独立研发；不能为了快降低验证质量，也不必每个小批次都启动 GUI。可先完成大块离线确定性工程，并明确集中实机 Gate E 验收包。

### 1.1 永久和当前禁区

- 不许碰 `packages/shared/**`、`review-ipc.ts`、Preload、`case-store-v2.ts`、`plan-binding-v3.ts`、`review-v3-technical-ledger.ts`、`review-v3-run-writer.ts`、正式 CurrentCase/Run/Batch/Decision/Outbox/SchoolPort mutator，除非 C 在 §9 新签精确、逐 hunk 可撤销租约。
- **`I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`**：未来可能授权机械、只读 `STAGED_ONLY` 技术 Main handler，但现在没有生产 Main/Preload 写权；I1/I2 Gate O 绿不自动激活。
- **`I-LEASE-BUSINESS-WRITER=DENIED`**：即使技术 Run 记录在 C 的 CaseAggregate CAS 内，也不等于 I 有权调用或修改正式 writer；不得用测试 `()=>{}` 冒充 Main at-commit Host/Principal verifier。
- **C test narrow lease**：`I-LEASE-C-TEST-R01` 允许已签收的 `review-c0-ipc.test.ts` 在 I 分支末尾纯追加 I-only 用例。I1/I2 已经原 145 行原字节前缀不变、`+167/-0`（原 3 个 C test → 5 个）。C-I2-ANCHOR-002 只许可在新 C 树里**重复应用这一原追加**，不构成改其他 C tests 的许可；新 `review-v3-execution-contract.test.ts` 追加前需核对 §9 是否再次明示激活，不要凭旧条件租约自行动笔。
- synthetic Main/Host/Provider 与真实 Electron Gate E、School/Gold Gate L 和产品 Gate P 严格区分。技术 `completed-technical`/A local outbox ACK 绝非正式 ReviewRun/Check/ReadReceipt/Decision/durable C2 ACK。正式发布始终 `NO_GO`。

## 2. C 有效签署与已完成检查点（不可重写历史）

### I0 及 I1

- I0 PR #146 仅输入预检/来源锁，SHA `c84f575addcbb1f36b5eff0acb27442b91073fa1`，C `C-I0-ACCEPT-001 / I0_ACCEPTED_SCOPED`，7/7 技术探针绿；不要修改其历史源锁。
- I1 PR #147：C 决议 **`C-I1-FINAL-ENG-ACCEPT-R01 / C_ACCEPTED_FOR_ENGINEERING_EXACT_SHA`**；SHA `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7`。固定旧 C anchor `31aa352c45a33d6832612884b0fea38e39b5cf8d`、A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`、B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`、C0 `5682057c7232c914e72fdae525ce95fd33f32b53`。
- I1 的 24 个路径：18 个原始 A/B 技术 Git blob + I-owned glue/tests/报告/锁 + C test-only +167/-0；C 正式生产文件修改 **0**。跨界安全包括 B2 byte/parser registry→A1 Owner→A2 await 前后 revoke/fence/本地 proposal→A3 Check coverage→C1 source current/archived fail-closed；跨 Case、旧 generation、stale revision、模板版本、伪 Host/source 必须拒绝。
- I1 exact CI PR `39277400876`、D2 `39277400995`、Baseline `39277400916` ALL SUCCESS；Bun **4073 PASS / 5 OS SKIP / 0 FAIL**，I-only 19/19 测试 PASS。C 的签收 **仅为 STAGED_ONLY 工程接受**，不是 merge main/Release/Gate E/L/P 或新业务写权。

### I2 授权

- C 决议 **`C-I2-ANCHOR-002 / APPROVED_SCOPED_TECHNICAL_SOURCE_REPLAY`**：新的独立冻结 C anchor = `3242b22a0825eec347b2748680bb746eb0f55215`；固定可选 A pool = `c0132ae06de8ae09ab021ac231ffd34756eb5990`；固定可选 B pool = `bf88320e57b20ebc2023f27665c544ce2ba72ce4`；原 I1 accepted SHA 不变。禁止 floating HEAD、whole-branch merge、自动迁移旧 A C0 outbox。
- I2 独立冻结 base ref `integration/v3-i2-c-anchor-002-frozen` 必须指向上述 C SHA；实际工程分支 `integration/v3-i2-source-replay-r01`；Draft PR #148 的 base 是上述 ref，不是 main。
- C 授权先逐 blob I1→新 C replay 并验收，再独立 A 新池有界片段 CI，再 B 新池有界片段 CI；每批的可回滚绿 SHA 必须独立保存。

### I2 三个已经真实完成的代码阶段（每阶段自己的 Gate O）

| 阶段 | 精确组合 SHA / 内容 | 实际 PR CI / D2 / Baseline | Bun；联合用例 |
|---|---|---|---|
| R01 新 C+I1 | `5731c2244a4b3967f344773a767e393494080cdb`；I1 24/24 Git blob replay | `39295929871` / `39295929880` / `39295929893` 全 SUCCESS | 4142 pass / 5 OS skip / 0 fail；原 I1 19/19 |
| R02 A 精选技术池 | `c9548e1310b9fd14046e21318b72051ba3bb42ef`；A 固定 SHA 精确 9/9 source blobs、2 项 I A→C validator 测试 | `39297399475` / `39297399458` / `39297399618` 全 SUCCESS | 4181 pass / 5 skip / 0 fail；联合 21/21 |
| R03 B 精选技术池 | **`89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`**；B 精确 8/8 source blobs、2 项 I B2→B4→B1 测试 | `39298594421` / `39298594426` / `39298594262` 全 SUCCESS | **4191 pass / 5 skip / 0 fail**，484 files；联合 **23/23** |

- 最新 #148 与冻结 C anchor 的精确 compare **34 个变动路径、0 个 C-exclusive production hunk**；C `review-c0-ipc.test.ts` 仍原字节前缀 +167/-0；新增 I2 自有测试 `review-v3-integration-i2-a-proposal.test.ts`、`review-v3-integration-i2-b-source.test.ts`。I2 源锁完整 path/blob map 在 #148 `I2-SOURCE-AND-CHECKPOINT-LOCK.json`，不要仅凭本页描述重新猜 SHA。
- A R02 导入的是 Owner、新版 proposal producer、旧 local event、turn budget 的 9 个来源文件和测试。I-only A/C 合成负例调用**真实 C `validateV3ExecutionProposal` 纯函数**验证 hash、序号、Host receipt、read extent、grant revoke/replay；不是 C2 durable consume/ACK。
- B R03 导入的是 B1 candidate Plan/author、B2 staging、B3 conservative route、B4 **历史原件 Git blob SHA/sha256 只读校验器**共 8 个来源文件。I-only 测试覆盖 physical bytes、来源篡改、跨 owner、staging revoke/path traversal 及 candidate Plan 不发布；不是官方政策 Gold。
- 保留所有上述三个绿 SHA 供回滚。**最新 I2 R03 的 Gate O 已 PASS，但 C 对这一 SHA 的最终 `C_ACCEPTED_FOR_ENGINEERING_I2` 仍 PENDING**。已向 C PR #144 发正式签收请求，评论 [#6273815479](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6273815479)，I2 #148 回执 `6273817064`；在 #145 §9 目前未找到 C 对 I2 最终 exact SHA 的签收。

## 3. 交接时 A/B/C 的新独立进展：不要自动纳入 #148

| Owner | 截止新 HEAD | 实际 exact HEAD Gate O | 对 I 的意义 |
|---|---|---|---|
| A #143 | `1f1f5d1499cb59c813d590aa407189ba05f65f10` | PR CI `39296623502`、D2 `39296623298`、Baseline `39296623275` 3/3 SUCCESS；4145 pass/5 skip/0 fail | A4-R13 Pi native lifecycle/HTTP witness 与故障隔离更进一轮，**不是 I2 已批准 A 来源**（I2 仍用 R12 `c0132...`） |
| B #142 | `45809553d19b6fba731fd7edb813ebbb81071031` | PR CI `39294621431`、D2 `39294621479`、Baseline `39294621743` 3/3 SUCCESS | B 后续历史 raw MD 恢复/候选 UI 等有进展，但 **I2 仍只获批 B-R10 `bf883...`**；不得偷渡后续 source/fixture |
| C #144 | `34c7ea3bd881504302d2682aad79065c0ef9a24c` | PR `39297266036`、Baseline `39297266053`、Batch `39297266045`、D1 `39297266299`、D2 `39297266109` 5/5 SUCCESS；4081 pass/5 skip/0 fail | C2-R02 新 `review-v3-main-trust-port.ts` Main-only trusted Owner/registered Host/real disk byte hash/CAS adapter 已离线可验；**仍不是 I2 当前获准 C anchor**（仍为 `3242b...`） |

- C 的新 `review-v3-run/1`、`review-v3-execution/1` 是版本化 C-owned 共享合同/技术 Main-only writer。新版 Main trust port 在 C 测试中通过合成 Owner/Host 和临时磁盘原件的可信端口负例，但**未真实接入 A Native Pi SDK/Provider 或 B 真实 publisher/校方来源，未注册正式 Electron IPC**，不能称现实来源已完成。
- A 正式提出 `CR-A-PI-HTTP-WITNESS-R01` 的 Main factory/SDK 接线授权请求；截取时是**申请**而非 C 已批的可写权限。新 I 应从 #145 `DECISIONS:C` 查它是否被裁决；不能将 A source/test 绿视为 I 有权改原 `pi-agent-adapter.ts`。
- B 还有历史 MD 43/50 原字节匹配、4 mismatch 隔离、3 未找到、G01 34 scope unknown、第 51 套多人实机 UAT 未完成等领域风险；不是 I 已消化的 B4 Gold 或已可发布的 50 套。

## 4. 下一位 I 的立即任务（真实工程，不是仅写报告）

**第一优先级：I2 工程签收收口。** 重新读取 #145 §9 与 #144 的最新评论，锁定 #148 exact HEAD+三项完成的 CI，并核验 C 是否已对 `89a8c52...` 签 `C_ACCEPTED_FOR_ENGINEERING_I2`。若 C 请求特定 hunk 或负例，先在 I-own 范围修复并跑**新 exact SHA** Gate O；原 R03 绿色 SHA 保留；若 C 已签，记录精确签署的允许范围，而不自行扩大到正式产品。
**第二优先级：下一新 C 锚点的技术承接准备。** C `34c7ea3...` 有 Main-only trust port，但仍与 I2 C-002 `3242b...` 隔离。只读比对 C2-R02 的 shared / Main trust port / Run writer 来源与 I2 A proposal/B staging，识别确切接口、依赖、Host/Plan/Owner at-commit 的真实缺口；整理来源级 patch、独立新分支/冻结锚点/回滚提议。**必须等 C 新 `C-I3-ANCHOR` 或等价明示裁决后，才能向下一新 C tree 引入授权 C 文件**；不得自行将新 C HEAD merge 到 #148。
**第三优先级：保全并扩展 I 自有安全桥接验证。** 在 I-owned `review-v3-integration-i*-*.ts`/tests 中准备 A newer physical Host proposal→C read-only validator、B current-source revocation→A Owner/Run→C technical event、同 Run 跨权限 epoch、新旧 request/replay hash、终态后迟到事件、cancellation/ENOSPC/跨 PID 等 fail-closed 联合检查；不过真正 Host callback、publisher/approved policy、C2 durable ACK、SchoolPort 仍需 Owner/C 的实际代码和授权，测试必须标 synthetic。
**第四优先级：后续 A/B 精选来源。** 依据 C 新授权选择还未引入的 A physical SDK/dispatch/turn-port/Pi HTTP 或 B ZIP/ImportLedger/B4 archive evidence/作者前端；必须按新 A/B exact SHA 完整 Gate O 锁源，分 A/B 独立批次、每批新 CI，不能整分支覆盖或复制依赖不齐的 B4 审计测试。Owner 源 bug 交回 A/B 本线，不要在 I 分支暗改。
**协调纪律**：非 I 专属文档不随意编辑；要公开进度只改 #145 `STATUS:I` 标记区，不能写 `DECISIONS:C` 或其他 Owner 区。遇到扩大 C test/正式 Main 只读租约需求，在 #144/#145 以代码 SHA、目标函数级 hunk、负例、回滚提出正式请求，不要先写后补。

## 5. 证据、验收和执行环境

- 任何完成结论必须有**精确组合 SHA**和该 SHA 的真实 Actions 工作流 job steps/logs，至少 PR CI frozen install、workspace typecheck、boundaries、skin、Main/Preload/Renderer builds、完整 Bun；D1/D2/Batch/Baseline 以工作流本身与适用路径判断。排队不是绿，前一 commit/单线绿不能继承。
- Gate O = 离线源代码/工程技术回归；Gate E = 实际 Electron + Native picker + Office/Host/Provider（**未验**）；Gate L = 校方真实授权/政策/Gold（**BLOCKED_NO_AUTH**）；Gate P = 用户真实业务/规模 UAT（**未验或部分**）。没有 O/E/L/P 的明确证据不得 Release。
- GitHub 插件可读/写 PR、文件、blob、tree、commit、refs、Actions job logs；此前本会话环境本地 github.com DNS/clone 和 Bun 不可用，主要依赖 GitHub Actions 自托管 Runner `self-hosted,Linux,X64` 完成真实类型检查和测试。新会话先复核环境能力；不得捏造本地执行结果。
- 已有有界 GitHub 实际工程路径：冻结新 C ref→Git tree 按 24 path/blob 重放→逐 SHA PR CI→A 9 path/blob 导入→独立 CI→B 8 path/blob 导入→独立 CI。回滚到 R01/R02/R03 exact SHA 或 C 冻结 SHA，不删除历史 commit；新的合同锚点必须由 C 明示批准。
- I2 #148 的源锁/报告在 R03 CI 启动**之前**写入，锁中的 `PENDING_NEW_B_SLICE_EXACT_SHA_CI` 是原时间点状态；真正后续 GitHub CI 与 #145 I status `I2_R03_FINAL_GATE_O_PASS`、#148 comments、C #144 签收请求才记录其新状态。不要为同步文档单独改动已绿 #148 code HEAD 而重置 CI；本专属交接优先保存在 docs-only #145 分支。

## 6. 禁止误判及新会话第一份交付

- 不要把 I2 现有 `C_ACCEPTED_FOR_ENGINEERING_I2=PENDING` 写成已经被签收；真正有权签字的是 C。也不要把后续 C2 Main trust port 的五条绿 CI当作 I2 下一新 C 锚点的授权。
- 不要误解 34 个变动文件是 34 个全新实现：I1 replay 24 路径、A/B 17 个原来源片段、2 个 I2 自有跨线测试、2 个 I2 文档在 **以新 C 为 base 的最终差异**中累积体现；对同路径的升级要依 source lock 比较而不是简单相加。
- 不要自创第二份业务 CaseStore/Plan/Run/Decision；不把 A technical `completed-technical`、A0 outbox ACK、B `candidate-held` 自动转换为校方正式审批。
- 新会话第一份可见结果应是：最新 PR #145 C 裁决、#148/I2 23 联合测试与 exact CI 核验、#144 新 C/Main status、是否存在正式 I2 签收，以及下一独立有权限的**实际工程**工作单。若获新锚点授权，尽快进入真实源码和测试，不要只重新写一轮计划。

---
**本文仅属于 Integrator-I 旧会话记忆。禁止转成要求 A/B/C 阅读的共同任务书。**