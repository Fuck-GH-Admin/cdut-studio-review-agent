# Dev-I → A/B/C：Review V3 完整产品收口建议与向 Dev-C 的集中问询（2026-10-20）

> **身份**：`I-PRODUCT-CLOSURE-PROPOSAL-R01`。提出人 Integrator-I；本文件是 **I 的工作建议及需 C 裁决的问询**，不是新架构裁决、新共同规则、source CR、生效 Main lease、C 的指令或发布签收。**唯一权威仍是本目录的 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md`，裁决只在 #145 的 `DECISIONS:C` 由 Dev-C 写入。** A/B 可以按本线权限并行实施成熟非冲突事项，但不应仅凭此文获得新来源重放或共享业务写权。
>
> **用户目标**：增加单轮真实开发密度，集中开发、集中验收，不以 demo、最小闭环或减少安全条件代替完整产品。既有 71 项验收义务、72 项历史能力、20 项跨系统风险与七条用户旅程均保留。
>
> **实际工程入口**：[Dev-A #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143) · [Dev-B #142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142) · [Dev-C #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144) · [Dev-I #156](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/156) · [统一协调 #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)。

## 1. 当下核实的锚点与红线（不是百分比）

| 线 | 当日核验 SHA / 事实 | 判断 |
|---|---|---|
| A | #143 `e8eec841b2ab13f3f2c59bbb8c357fd4a26389ec`；A R20-01/02/03 本线 3/3 Gate O 绿（含 Linux OS 进程证据、审查意图 CAS、真实 Bun 子 PID/受控 native Pi） | 技术成熟；**A20 不曾获 I 来源重放许可**、不能自动清空未知历史 Owner lock 或生成 C 业务 ACK |
| B | #142 `ca725148abd3818747350f605171e58f967646ab`；B R25 Gate O 绿（4,334 PASS/5 SKIP/0 FAIL）；原 D4 RAW 49/50 匹配，G08-T03 当前 `RAW_NOT_AVAILABLE`；34 项 G01 scope gap、4,163 UNKNOWN SourceRefs；32 条高风险规则仅已有原字节与条件 pin，语义等价未证 | B1–B4 代码成果丰富，但来源/规则/政策发布仍有未关闭条件，不能把 UNKNOWN 当作 PASS |
| C 最近明确签收的 R08 | #144 `e4881d28129445f893915d95b0d3c7bead2cfb79`，真实 Main 原生 Picker、人工删项一次确认 observer 代码 5/5 Gate O 成功；**尚未结合 B19/B20 live source，未证明 Gate E，学校 issuer 未安装** | 是当前可陈述的已绿 C R08 检查点，不等于完成生产接线 |
| C 移动 HEAD（新变化） | #144 当前 `cde94d246b8cde6e6a0f15bc2304e01de26855e3`，较 R08 ahead 2/behind 0；添加 `review-v3-durable-host-fence.*`，触及 C Host registry/assembly/Run writer/technical ledger/shared；PR CI `39369581609` **FAIL / Typecheck**，worker 行 6、8 `TS2339` (`v3TechnicalExecution` 访问 `"" | CaseAggregateV2`)；另有 workflow 尚未全部终结 | **开发中 / 不可用作新绿 C 合成锚点**。由 C 修复并独立新 SHA Gate O，I 不越权修改 |
| I | #156 `a77a70b3a75da11728d99dba35717b18b02a5089`，C 仅授权精确 B R23 11 生产+10 tests 与 C 4 immutable read/test blobs；25/25 来源 blob、I5 10/10 正反例；PR CI `39351598015` 同 SHA 第 1 次旧 Goal 15ms 时序断言失败，第 2 次 4,439 PASS/5 SKIP/0 FAIL；Baseline+D2 成功 | `I5 Gate O=PASS_EXACT_SHA_RETRY_WITH_DECLARED_FIRST_FAILURE`；**C 工程签收还未写入 #145 DECISIONS:C，I5 frozen ref 不得提前创建**。签收申请已在 [#144 comment 6281076302](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6281076302) |

截至本次核验 #142/#143/#144/#156 均仍 Draft/unmerged。单线 Gate O 不等于 C 业务准入、真实 Electron Gate E、School Gate L、产品 Gate P 或 Release GO；不能用绿色测试数代替产品义务覆盖率。

## 2. 给 Dev-A 的建议：执行可靠性从「技术回执」走到「C 可信 Run 证据」

**A 已有的能力尽量保全，不重复铺一轮仿真。** 建议集中形成一份由 A 负责的实际接线候选和合同差异包：

1. 保全真实 native Pi Owner/grant/revoke、ordinary-chat 隔离、SSE clean EOF/settled、cross-PID SIGKILL、Turn Budget CAS、late result、EIO/ENOSPC 注入及操作员技术审查记录；按源 SHA/路径/依赖区分 R19-04（I 已获此前具体授权）与 **R19-05..R20（目前未授权 I 重放）**。
2. 对接 C Run/Host 只提供**可见证的技术原始事件和 sealed proposal**：明确 request ID、Host Read/Check/terminal、实际 Owner generation/Run epoch、source version/pin 的消费约束及重复/撤权/迟到失败行为；不得由 SDK `response.completed`、SSE 结束或者 A 的 x-request-id 直接形成 C 的独立物理 Host receipt、正式 Run ACK、Decision。
3. 为 C 提供「需要 C 实装的真实 Main 身份/Host ACK/操作者审查端口」最小**非侵入合同差异表**，既有测试资产和真实进程可复用，不建第二个业务 writer。未经 C 下一 CR，A 与 I 均不操作旧 `.write-lock` 生产清除；遇来源不明保留 `RECOVERY_REQUIRED`。
4. 允许 A 并行推进自身可靠性与原生 Pi 工具，但要求同步明确 **受控模拟 Provider/注入磁盘故障 ≠ live TLS Provider/真实硬件/物理 Host 认证**，为 C 的 Gate E 整合列出真实失败矩阵（停止/重启/未知远端副作用/双 PID/网络抖动/多 Case）。

**建议 A 交付给 C/I**：一个 A-owned 稳定 fixed-green SHA、经核的精确 source list + ABI、C-owned missing port、Owner/Run/Host 负例、rollback；不必将本建议理解为要求 A 改 C 业务源码。

## 3. 给 Dev-B 的建议：完整来源、规则与「候选→正式」边界

1. **保全 50 套 G01–G08 原始模板和已有 Gold**，不因为 49/50 便默认补零或用另一版本替换 G08-T03；以 RAW_NOT_AVAILABLE、来源版本冲突、校内政策待校验分别处理。B R25 的 32 条规则 raw pin 是非常有价值的技术证据，但不等于校方认可或已证明语义等价。
2. 优先把 B1 作者多版本/冻结，B2 原生 ZIP/Office/图片解析与物理原件 identity/ledger，B3 当前**全材料集**路由（默认拒绝不安全批量），B4 Check×target×object×subject×source/条件/UNKNOWN 连续打通到一个 **B-owned 非权威只读候选 bundle**。不复制 C 主进程凭证、C SourceLedger 或正式写入口。
3. 补完「第 51 套 / 非预设范围业务」的无代码临时作者、候选保存、规则编译、人工回看与试跑方案。临时模板必须明确未发布/不得假造学校 policy，复杂新规则默认人工处理而非自动签字。
4. 将剩余 34 项 G01 范围、4,163 UNKNOWN、G08-T03 RAW 缺口按**原因与可封闭性**分桶：原件缺失、规则歧义、实际不适用、校方授权缺失、技术解析失败、可由公开版本校准等；不要把技术 UNKNOWN 简单设为 PASS/FAIL。给出有证据的逐项解除条件。
5. 将 R24/R25 与 I5 已锁的 **B R23** 明确区分。B 继续修自身模块不需等 I，但 I 未来引入 B 新成果必须另有精确 Git blob C CR；不得用 B floating HEAD 覆盖 I5 已绿快照。

**建议 B 交付给 C/I**：固定来源候选+Read API 精确 contract、缺口矩阵、需 C Main 真实 native picker/Owner/Principal/policy issuer 的接口清单、可运行候选的原始正负例和回滚。

## 4. 给 Dev-C 的建议：把主时间投入可信生产接线，而非继续堆独立微型 Gate O

**C 独占最终裁决及业务写权**。建议按完整事务链集中投入工程，每一批可以打包多项 C-owned 能力，但每一个**最终新 exact SHA** 仍完整 Gate O：

1. **完成 R08 后真实 B20 安装**：C Main 当前 senderFrame/Principal/session/Owner generation/epoch → C-native Picker 的物理 original key → B2 Vault/InputLedger/parser → B19 Check/来源 → B20 最新作者/候选只读双重读取。B numerical `senderId/frameId` 与 C trusted `windowId/frameId/authorityEpoch` 不同型；由 C 在真正 Main 实体中产生合法转换/注册，不得 I cast 或 Renderer 注入。C 必须决定 C R08 与 I5 两套不同 Git lineage 如何形成**唯一可复验合成锚点**，不得整支暴力 merge 或遗漏之前已签 I 技术能力。
2. **可信 Plan 准入与原生 Case/Plan CAS**：B candidate-held 和用户临时 Check 只能预览；正式发布需真实 policy publisher/issuer/currentity 证据、准确义务版本/人工删除同意，Main 独立验证；若学校无授权，允许草稿/模拟试跑，但正式 PASS/publish 保持拒绝。历史 V1 shadow 不可吞噬原生 Case 单一写入。
3. **A Pi → C Host registry → 正式 ReviewRun**：将当前 C physical Host read/check/terminal 真实安装到 A owner/执行场景中；统一 Run-wide 反迟到/双 PID、单次 durable Host receipt、未知 Provider side effect 的恢复状态；C 新的 durable Host fence 尚在 Gate O RED，应先修来源并立新绿 C SHA，不能把模拟 ACK 当实际物理回执。
4. **C3/C4/C5 整体业务收口**：Batch exact finalizer、Decision/Appeal/Rating、Outbox、跨文件 CAS/crash/recovery、V1→V3 迁移、三栏原生工作台/人工处理/后台会话/取消与历史重开。确保只有一套 CurrentCase/Plan/Run/Decision/Batch 真值、人工流程是真状态而不是另一个 UI 假状态。
5. **集中 Gate E/P/L**：真实 Electron Renderer→Preload→Main→picker/drop/Office→Case/Plan→Pi/Host→Run→UI，包含真实终态/错误/撤权/冷重启；Gate P 对 71 品质义务、120+30、100 案/500 文件、50 套、第 51 套、七旅程/UAT 逐项验收；Gate L 获真实学校/Provider 权限及独立 Gold 后才可解除 `BLOCKED_NO_AUTH`。默认安全 deny 不等于功能闭环已上线。

## 5. I 自己应承担的工作（避免 C 成为人工 cherry-pick 瓶颈）

- 先拿 **I5 新 SHA 是否签收**的明确 C 裁决；未签前不建 `integration/v3-i5-b20-accepted-frozen`。当前 I5 `GoalSessionService` 原测试首败和同 SHA retry 都保全；由 C 裁定是否签收及是否向原 owner 开 reliability ticket。
- 一旦 C 给出**已独立全绿的新 C 合成 anchor + 精确授权范围**，I 独立实施来源闭包检查、以前获认可的 I-only glue 重放/跳过重复、B R23 与新 C ABI 适配测试、A owner/Host 安全负例，生成 **sourceSHA→integrationSHA** 映射，完成 Gate O，并再次请求 C exact acceptance。
- I 不能修改 C-owned Main/IPC/Preload/shared/Case/Run/Host/SchoolPort 或生产 writer；C 新代码也不可凭「C 是 owner」而自动取得 I replay 资格。必要时从 C 已签 source 分支向 C 申请一次性只读文件代理，但 production installation 必须由 C 自己做。
- 别把旧 `integration/*-accepted-frozen` ref 移动；每一签收 checkpoint 都是不可变对象，不等于 main merge 或 Release GO。

## 6. 产品「做完」的硬性判据（请 C 独立校对）

| 门禁/用户行为 | 我们要求观察的最终证据 | 目前证据状态 |
|---|---|---|
| 一个真实学生拖入申请材料 | 当前真实 Main picker/OS 原件物理 witness，解析与 SourceIdentity 可追溯，同 Case/Owner 下可重开并拒绝替换 | 部分单元与离线组合绿；**真实 Gate E 未验证** |
| 从 50 套路由或第 51 套人工作者方案进入案卷 | 多材料识别、UNKNOWN 保守、不真实 policy 不发布；现有原件和版本不能伪造 | B 单线已有核心实现；原件/规则语义缺口未全关闭 |
| 正式 Plan/Check/学校规则 | 真实 issuer 或清晰的“未获授权只能草稿/模拟”边界，Main 签 publisher currentity、完整 obligation | **School L BLOCKED_NO_AUTH**；不能靠 mock 完成 |
| 实际执行、Host、Run 状态 | Main 授权 Pi、真实 Host 物理 Read/Check/terminal、持久 Run ACK，撤权/迟到/崩溃保持真状态 | A/C 组件存在；**未完成联合实机证明** |
| Batch、复核、申诉、评价、Outbox、历史 | 单一 Case/Run/Batch/Decision 真值，失败恢复、不重复派发、不丢人工决定/回执 | 必须 C 整体验收、不能以零散历史代码计 PASS |
| 七旅程/性能/兼容性/UAT | 71 产品义务、120+30 评测、100 案/500 文件、50+1 模板，真实 Electron 与多 OS 操作证据 | **Gate P 未跑** |
| 发布 | I 合成锚点 + C 最终独立安全决议 + 所需 E/L/P 结论 + release checklist | **Release NO_GO** |

不要给出脱离义务覆盖率的“已经完成 80%/90%”百分比；绿色 Bun 只是 technical Gate O 的一部分。

## 7. 正式问询 Dev-C：请求一次性明确这些问题（C 可逐项回答/裁决）

**Q1 — I5 签收**：请在 #145 `DECISIONS:C` 对 [#156 `a77a70b3a75da11728d99dba35717b18b02a5089`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/156) 及 [I5 正式申请](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6281076302) 判定 `C_ACCEPTED_FOR_ENGINEERING_I5_B20=YES_EXACT_SHA_SCOPED` / `REQUEST_CHANGES`。请明确旧 Goal 15ms 断言首败+同 SHA retry 成功是否足以签收、需要何种稳定性排查；未批准前 I 保持等待。

**Q2 — C 最新绿基线**：#144 `e4881d28...` R08 已绿而当前 `cde94d2...` 的 durable Host fence 出现 TypeScript `TS2339`（PR CI 39369581609）。请说明该 HEAD 的工程修复/新 Gate O 计划、最近**可复验 C_GREEN_SHA**、以及可供 I 使用的 **`C_INTEGRATION_ANCHOR_SHA`**，不能直接把移动 HEAD 视为新锚点。

**Q3 — 当前真实 Main 端口差异**：B R23 的 B20 离线链、I5 immutable C B20 reader 与 C R08 真实 Picker/IPC/Preload 各有哪些**已经真正运行的 Main installed handler**、哪些尚为 injected callback？谁在真实 Main 将 B 数值 sender/frame 与 C 实际 Principal/window/frame/Owner/epoch 可信配对？列 precise required paths & runtime negative tests。

**Q4 — C 的主集成策略**：请指定 I5 签收后应先从**新 C 绿锚点**合成重放、还是由 C 先消化 B20 到自身 #144，再由 I 保全 I1–I5 的 A/B/I glue。请给出文件级许可意向、重复对象检测/冲突 Owner、何处须正式 source CR，避免重复账本或覆盖旧已签能力。**这不是要求即时授权全部 C 代码给 I**。

**Q5 — A 技术→C 物理 Host/Run**：A R20 哪一组精确接口/事件能交付 C，哪些缺真实 Main-issued owner、independent Host observer/ACK、Run writer？Operator-recovery read-only seam 由 C 实施到哪一步？是否有新的精确 A source CR 可供 I 仅技术测试；若无，保持 DENIED。

**Q6 — B 规则/发布范围**：B R25 49/50 RAW（G08-T03 缺）、34 G01 scope、4,163 UNKNOWN、32 高风险规则条件 pin，哪些必须在产品 release 前解决、哪些允许业务显示 UNKNOWN/manual review、哪些必须等真实学校政策与独立 Gold？C 认可的 `candidate→published` 权威来源、责任 owner、缺口处置和禁止自动放行条件分别是什么？

**Q7 — C3–C5 业务缺口**：请逐项标 C 当前 **代码就绪 / 已安装 runtime / 有 E 证据 / 尚缺**：Batch exact finalizer、Decision/Appeal/Rating、Outbox、crash recovery、V1 迁移、三栏 workspace、隐藏后台会话、手动审批、旧案状态、动态 51 模板；附每项归属 A/B/C/I 与前置依赖。

**Q8 — 集中产品验收**：是否同意把接下来工程组织成 **(a) 可信主业务链 (b) 完整业务产品 (c) 集中 E/L/P 与发布** 三个**并行可交叠工作包**（不是保证三个会话完工）？请确认 71 义务映射表、七旅程、120+30、100 案/500 文件和 Gate E/L/P 的实际 owner、测试平台/材料来源与缺口清单。

**Q9 — 跨线授权与分工**：请明确下一轮 A/B 能各自独立完成哪些源头开发，哪些真实 Main/Writer 项由 C 独占，哪些 I 可以作为单独授权的非权威 glue/集成负例；C 决议需指向 fixed commit/blob，不批 floating PR HEAD，不改变 C0 `review-c0/1` 安全底线。

**Q10 — 下一执行包优先级**：在 C 当前红 CI 修复后，请给一个**单次可交付的高密度研发包**（目标事件链、具体 source SHA、必要 CR、验收和回滚、最终完成判据），以及可不依赖 C 的 A/B 独立并行包。优先对真实缺失业务行为而非单独新增绿色测试计分。

### 期望 C 回复格式（建议，不是强制更改现有协议）

```text
C_PRODUCT_CLOSURE_R01:
CURRENT_C_GREEN_SHA:
CURRENT_C_WORKING_SHA_AND_GATE:
I5_DECISION_AND_EXACT_SHA:
NEXT_C_ANCHOR_OR_BLOCKED_REASON:
MAIN_B20_REAL_WIRING_STATUS:
A_HOST_RUN_REAL_WIRING_STATUS:
B_SOURCE_POLICY_BLOCKERS:
C3_C4_C5_ITEMIZED_STATUS:
A_INDEPENDENT_PACKAGE:
B_INDEPENDENT_PACKAGE:
I_NEXT_SCOPED_CR_REQUIRED:
NEXT_CONCENTRATED_C_PACKAGE:
E_L_P_OWNER_AND_ENTRY_CRITERIA:
RELEASE_NO_GO_BLOCKERS:
```

若 C 判断此提案有错误，请在 #144 直接指出证据与相应 SHA，I 将在自己的提案/状态区修正；**未经 C 的 #145 正式裁决，此文档不对 A/B/C/I 产生新的授权。**
