# CDUT Studio Review V3｜A/B/C/I 统一协作、裁决及进度协议

**协议 ID**：V3-ABCI-GOVERNANCE-R01  
**版本**：1.0（2026-10-19）  
**协议状态**：C 已提出、待用户向 A/B/I 同步与各线确认（ACK）；不得把“文档已提交”说成其他 Agent 已接受。  
**唯一协调分支**：`docs/v3-integrator-i-r01-taskbook`（Draft PR [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)）  
**协议 Owner / 最终业务裁决人**：Dev-C；**使用者**：Dev-A、Dev-B、Dev-C、Integrator-I。  
**这是一份唯一的跨线规则+近期进度文件。** A/B/C/I 的详细工程日志、测试数据与生产代码仍各在自己的开发 Draft PR 中；该文档只存摘要、链接、不可变 SHA、决议和阻断，不另造平行文档总账。本文件不是生产代码、共享 DTO 或审批发布依据。

> **阅读规则**：新 Agent 首先获取本文件的当前 blob SHA、协调分支 HEAD、协议版本、最新四线状态与待决事项；再读 C0 owner manifest、自己的原始任务书和工程 Draft PR。未经显式 ACK，不得假设对方已经阅读新协议。规则更新仅向后生效；已冻结检查点依据当时版本追溯。

## 1. 不变的权限与产品质量底线

1. **单一当前业务真值**：V2 CaseAggregate/Receipt/CAS 由 C 独占；正式 ReviewRun、ReviewBatchAttempt/Batch finalizer、Decision/Appeal/Rating、Outbox、Main 可信 Principal/IPC、Preload 共用 facade、迁移及正式工作台也是 C 的最终责任。不得创建另一份 CurrentCase/Run/Decision 的权威文件。
2. **身份绝不来自 Renderer/模型自称**：Main 通过真实 sender/frame、可信 session/owner 授权生成 Principal；伪 teacher/school/system、假 SourceRef、跨案、撤权后迟到提交一律 fail closed。没有真实校方授权时记 `BLOCKED_NO_AUTH`，不编造受理回执。
3. **Source/Plan/Run 严格绑定**：不可变 Plan、Check×target×object×subject、三值 unknown、原件物理版本/parseRevision/SourceIdentity、当前有效性、Run manifest/hash/revision/owner generation、Batch entry exact Run/Decision 都不能用默认值、旧数据或 mock 补齐。
4. **技术完成 ≠ 正式审核通过 ≠ 校方受理**。可视化、测试 fixture、Dev-A host ACK、Dev-B candidate Plan、mock Outbox ACK 必须和正式持久回执、真实政策发布及授权 LIVE 严格分层。
5. **质量不因速度降低**：71 条原产品验收义务、72 项历史能力、20 项跨系统风险、7 条用户旅程，均须按实际证据保全；集中实机验收可以延期组合执行，但离线接口负例和迁移安全不能跳过。禁止将 demo/最小闭环代替原定完整产品。
6. C0 工程固定 SHA `5682057c7232c914e72fdae525ce95fd33f32b53`，contract `review-c0/1`。任何 C0/shared 协议修改须有 C 明示批准、版本/兼容与回归；旧 SHA 的 CI 不代表新 SHA。

## 2. 四线完整职责与交付边界（不依赖当前开发到第几轮）

| 线 | 长期独占产出 / 继续独立推进 | 不得自行决定或写入 | 对外必须提供 |
|---|---|---|---|
| **Dev-A** | Main-only Pi Owner/grant/revoke、隐藏后台会话与 ordinary-chat 隔离、允许工具集合、execution attempt/session/generation/tombstone、Host 工具回执与 after-await 复验、Graph/direct/hidden/batch 执行通路、事件 proposal/sequence/replay、技术覆盖判定、Provider 异常、暂停/恢复、重启/双 PID/ENOSPC 等执行可靠性 | 正式 Case/Run/Check/Decision/Batch writer、共享 DTO/IPC/校方 Principal、擅自将技术 complete 当 PASS | 钉死执行身份的 proposal 与只读/受控 Host adapter；自身测试和可靠性证据；事件与 Owner 接口 CR |
| **Dev-B** | D1 作者态、D2/D3/D4 规则模块与不可变 Plan 编译、Check×target/条件/unknown、升版 ACK 要求、原件 picker/drop/staging/ZIP/Office/图片解析/版本定位、可信候选 SourceIdentity、ImportBatch 输入（非审核 Batch）、20 秒保守路由、G01–G08 50 套候选模板来源及 Gold/政策阻断、第 51 套无代码作者态与试跑 | CurrentCase/Run 正式写入、Main 身份发行、擅自 policy publish、将 unsupported legacy Plan 静默兼容、随意修改 shared IPC | 候选不可变 Plan descriptor、可信来源候选与解析 receipt、source/obligation coverage、作者 UI 及输入端口 CR |
| **Dev-C** | 共享 DTO/合同与 Main 身份唯一裁决；C1 唯一案卷+来源当前有效性；C2 正式 Run/ReadReceipt/Check consumer；C3 Batch exact-finalizer；C4 多文件事务、恢复、Outbox、申诉/评价；C5 V1 迁移、工作台、跨线真实接线安全签收；集中跨线工程裁决 | 自行捏造校方政策义务/Gold 或 Provider/学校有效身份；将 mock 当外部认可；未经证据宣称 release GO | 固定的 C 集成锚点、批准/拒绝的版本化 CR、正式可信消费/写入端口、可复核验收结论 |
| **Integrator-I** | 持续读取 A/B/C 已提交切片，核验源 SHA/依赖/CI、受限 cherry-pick 或文件级移入、独立 glue/桥接与联合负例、累计集成快照、冲突定位、源头修复回流、同 SHA 联合回归及向 C 申请签收 | 第二套业务真值/Run finalizer、独立批准共享语义、未经授权改 C 独占文件、覆盖 A/B 原分支、以绿 CI 代替 C 签收 | 可重放的 sourceSHA→integrationSHA 映射、集成快照、测试与阻断证据、窄 CR、C 签收包 |

详细来源：R3 #140 的 `09-three-development-tracks-and-ownership.md`、`11-dev-a-prompt.md`、`12-dev-b-prompt.md`、`13-dev-c-prompt.md`；C0 #141 `C0-OWNERSHIP-MANIFEST.md`。**上述完整职责优先于当前 PR 实现范围**。此协议只规定协作，不代替每线原任务书。

## 3. 谁能修改什么：共享文件、接口和代码的唯一写权

- **A/B 自己的 adapter、源码、测试、领域文档**：由对应 Owner 自主开发、分批提交原 Draft PR。I 只将其“固定 SHA 的经挑选片段”引入集成快照；不能在 A/B 分支私自改源头实现。集成中发现 A/B 自身 Bug，发回对应 Owner，必要时回流补丁。
- **C 独占**：`packages/shared/src/types/**` 共用合同、`review-ipc.ts`、`review-c0-authority.ts`、`review-c0-case-service.ts`、`case-store-v2.ts`、`application-service.ts`、`workspace-service-v2.ts`、`workspace-business-service-v2.ts`、`run-store-v2.ts`、`batch-store.ts`、`pi-case-review-service.ts`、Preload、正式 Renderer 工作台及最终业务持久化。以 C0 manifest 的具体规则为准，新增潜在冲突文件默认 C 裁决。
- **I 专属**：新增 `review-v3-integration/*`（实际路径以工程 boundaries 为准）或其他经 C 确认的 glue、合成测试、映射及集成分支；无需逐个小提交请求 C，但不得借 glue 实现一个新写权。
- **临时修改 C 文件必须有“授权租约”**：C 在本文件`5` 的裁决记录中写明 `delegation_id`、C 基准 SHA、允许路径+导出函数/代码范围、预期改动、测试、授权有效的集成检查点和失效条件。I 仅在委托范围提交 patch，C 对最后精确 diff 签收。C 在租约生效期间不得同时在相同函数范围并行写入；当 C 基准变化或测试门禁失败，租约自动失效，I 重新请示。**不是把整个文件长期共同拥有**。
- **跨线合同优先级**：安全硬约束与已经验证的 C0 immutable 契约 → C 明示签名的后续版本/CR → 本文件当时生效版本 → 各线自己的任务书与 I 技术任务书。发生冲突由 C 在本文件作裁决；不得通过悄悄修改共享 schema 解决。
- 任何未经授权的共享文件触碰、伪造 Actor/Source、重复业务权威、未验证的 Run/Batch 正式化，应冻结**受影响切片**并通知 C；独立切片可以继续。

## 4. 无须轮次同步的持续并行与累计集成

**规则是按“已成熟能力切片”集成，不按 A/B/C 第 N 轮强制对齐。** C 可正在 C3，A 仅有 A1，B 已做 B2：I 先吃已批准的 A1/B1/B2/C3 可兼容片段，缺 A2 的正式 Run 连接标记 `CONTRACT_BLOCKED`，其他片段不停工。

每个待集成片段至少有以下“单条记录”（写在该 Owner 的状态区，复杂明细留在原 PR）：

~~~yaml
slice_id: A1-owner | B1-plan | C2-run-writer  # 实际唯一 ID
owner: A | B | C
source_pr: 143
source_sha: <完整40位SHA>
source_paths: [<源文件>]
requires_contract: review-c0/1 | <C批准的新版本>
requires_slices: [<准确片段ID>]
required_cr: [CR-A-001 | B-CR-001 | ...]
classification: SOURCE_ONLY | READY_FOR_ADAPTER | CONTRACT_BLOCKED | WIRED_INTEGRATION | PASS_SCOPED | C_ACCEPTED
verified_gates: {O: NOT_RUN, E: NOT_RUN, L: BLOCKED_NO_AUTH, P: NOT_RUN}
integration_sha: null
next_action_owner: A | B | C | I
~~~

**I0** 即可在单独工作树只读核验、选择切片、写尚不触及正式业务写权的 adapter 合同测试/准备。**I1** 按批准的单个端口/切片开启，而不是等 A、B 的全部 CR 一次结案；正式 Plan 安装、正式 Run 写入需各自独立门槛和 C 签名。I2/I3/I4 分别按 C2/C3、C4、C5+真实 Host/UI 依赖开放，不因轮次号自动 GO。

**累计快照与重放规则（必须在实际 Git 上验证）**：
1. C 在自己工程 PR 固定一个通过声明范围 CI 的 `C_INTEGRATION_ANCHOR_SHA`；I 锁定 A/B 源 SHA、合同版本、I 旧已签收 checkpoint SHA。I 不能自行把 C 的移动 HEAD 认定为已批准锚点。
2. I 工程分支从此锚点建立，按明确文件/片段引入已固定 A/B 代码，并单独提交 glue。记录来源 blob/commit、目标 commit、首次失败、测试和回滚。禁止整支合并后覆盖冲突。
3. **新 C 锚点产生时，上一期已签收 I 代码不可丢**：以新 C 固定 SHA 为基准逐片重放旧 I glue/已认可源片段，检查是否已经被 C 吸收（patch ID/文件 blob/行为）并跳过重复；以双方单测及联合负例验证重复/删除/行为变化，不允许简单按 cherry-pick 成功判断。
4. 每期发布**不可变集成检查点** `I_CHECKPOINT_SHA`、`C_SOURCE_SHA`、`A/B_SLICES`、`CONTRACT_VERSION`、`GATE_RESULTS`、`C_REVIEW`。旧 SHA 和旧证据不可 force-push 改写；移动的工作分支只用于准备下一快照。
5. C 审核确切新集成 SHA，签 `C_ACCEPTED_FOR_ENGINEERING` 或 `CHANGES_REQUESTED`；成功仅能成为下一开发检查点，不等于 main merge、发布 GO、校方认可。
6. I 引入的代码必须分清 `I_ONLY` / `UPSTREAM_TO_A` / `UPSTREAM_TO_B` / `UPSTREAM_TO_C`，并记录原 Owner 已吸收的 commit SHA。否则下一次新 C 锚点不得宣称累计成果安全继承。
7. I 的快照若涉及正式写入语义/新 schema，先经 C 裁决及版本签收；不使用候选 Plan 的 `publicationAllowed=false` 或模拟 verifier 充当已发布政策证据。Sandbox/Preview、可信技术安装和校方正式发布必须明确区分。

## 5. 裁决与问责：让 C 只处理真正必须由 C 解决的决定

A/B/I 发现阻断，先用已有类型化接口排障；无法自行解决时在**本文件 C 裁决区**登记由 C 处理的 CR（A/B/I 在自己的状态区提交请求，**不能直接写 C 的裁决区**）。

**CR 最小字段**：`request_id`、请求 Agent、当前切片、影响业务对象、C/A/B/I 固定 SHA、合同版本、精确文件/函数、真实阻断、提议差异、身份/来源/最终写入负例、兼容/迁移、回滚、是否允许部分工作继续。C 用一个集中窗口优先处理 `CR-A-001` 和 `B-CR-001`，按端口/字段逐项批准，不强制等两份完整关闭。

**只有 C 可写正式决议**，状态为 `APPROVED` / `REQUEST_CHANGES` / `REJECTED` / `DEFERRED`，须记录决定时基准 SHA、允许范围、合同版本、测试条件、是否临时委托 I 修改 C 代码。`PENDING` 和沉默绝不等于批准；合同变更执行后仍需新代码 SHA + 回归证据。

**Bug 分流**：A owner/Host 自有模块 → A；B compiler/intake/parser/候选原件 → B；C Case/Run/Batch/Outbox/身份和持久化 → C；I glue/整合测试/版本重放 → I。发现高危事实污染或跨权限写入，I 立即冻结受影响片段，C 裁决，其他互不依赖的片段继续。

**决策期限不是全线停工**：只对受阻切片保持 `PENDING_C`，其余任务继续；提交人可以附候选方案、合成契约负例供 C 一次性审批，不要把每个小型重命名都升级为架构 CR。

## 6. 门禁、可追溯状态及交付质量

- `Gate O`：新**精确 HEAD** 的 Bun install/typecheck/boundaries/构建、所属与跨线正负例、回归；记录 workflow/命令、环境、exit code、测试总量、首败、修复 SHA。单线 O PASS ≠ 集成 O PASS。
- `Gate E`：真实 Electron Renderer→Preload→Main、picker/drop/Office、Owner stop/late event、跨 PID/故障、用户工作台；未执行 `NOT_RUN`，不得用合成 harness 替代。
- `Gate L`：获授权的 Provider/school Principal/真实 SchoolPort/政策与独立 Gold；无权限 `BLOCKED_NO_AUTH`。
- `Gate P`：71 条原产品品质门禁、120+30 评测、100 案/500 文件、50 套来源、第 51 套无代码作者态、七旅程/真人 UAT；独立跟踪，绝不按“功能存在”虚构全部 PASS。
- `PASS_SCOPED` 仅表示其描述的范围通过；`C_ACCEPTED` 是 C 对集成工程的签收；`RELEASE_GO` 必须另过独立发布门禁。若外部事实或回执已经写入，Git revert ≠ 业务数据回滚。

## 7. **唯一协调分支**的实际协作与防覆盖协议（四线全部遵守）

### 7.1 两种用途、禁止混淆

1. `feat/v3-dev-a-pi-execution-r01`、`feat/v3-dev-b-template-intake-r01`、`feat/v3-dev-c-business-r01` 和 `integration/v3-i*` 是**工程代码分支**：测试、实现、详细报告各归其线，彼此不能直接写入对方分支。
2. **`docs/v3-integrator-i-r01-taskbook` 是唯一跨线协调分支**（PR #145）：**仅 docs-only** 的治理协议、各线最近进度摘要、C 决议与 I 检查点索引。绝不在此分支承接生产代码或替代工程 PR。PR #145 本身基于 main，I0/I1 工程分支基于 C0/C 锚点；**不得把 #145 的 head 作为生产集成 base**。
3. **只新增这一份共用协调文档**。本目录已经存在的 I 执行任务书/README 保留为技术方案和历史输入；当其协作条款与本协议不一致，须先由 C 修订本协议，再同步 I 任务书，不形成多个相互竞争的共同规则。
4. 各线详细进度仍写各自工程 PR 的 handoff；协调分支只更新本文件对应一段“当前状态/变化摘要/来源链接”，每次开发完成一个可独立复验的能力片段，或 CR、阻断、测试结论变化时更新。无意义的每提交日报不必同步。

### 7.2 单文件四线共同更新的范围

本文件使用固定区段 `BEGIN/END STATUS` 标识。**Dev-A 只能替换 A 状态区；Dev-B 只能替换 B 状态区；I 只能替换 I 状态区；Dev-C 管理 C 状态区、正式裁决区、规则正文与协议版本**。各线不得清空其他区、随意重排章结构或改变 C 裁决。I 可以对 C 递交草案，不能自行签署 C 的决定。

**每次实际写入步骤**：获取远端协调分支最新 HEAD 和本文件 blob SHA → 编辑自己的标记区（保留其余全文）→ 校验其他区字节内容未变化 → 用最新 blob SHA 提交 docs-only commit → 重新拉取确认自己的提交和其他区未丢失 → 在自己的工程 PR 留下协调提交 SHA 链接。遇到 `409` / SHA mismatch / 非快进，必须重新获取最新内容并**只重放自己的区段**，不得强制覆盖、force-push 或把旧版全文重新提交。仅靠 GitHub 不同段落自动合并不能保证并发安全；必须遵守此串行乐观锁过程。

**更新触发**：① 源 PR 获得新的可复验 SHA/CI 结论；② slice READY/BLOCKED/WIRED/ACCEPTED 状态改变；③ 新 CR/裁决；④ I 的新集成 checkpoint；⑤ 门禁变红或存在产品安全风险。每条摘要记录真实基准/来源 PR/SHA、状态（包括 `NOT_RUN`）、下个行动 Owner。后续变更以新的 Git commit 形成版本链，旧记录可通过 Git 历史追溯，不必无限追加数千行日志。

### 7.3 版本与 ACK

- C 修改共用规则：增加版本、日期、变更摘要、影响切片、是否需重测/重新固定锚点；在此文件 C 区登记 `RULE_CHANGE`。A/B/I 在各自状态区写 `ACK version@coordinationCommitSHA` 或记录疑义，不以口头已读代替。
- 同步过程允许不同 Agent 暂时运行不同开发批次；**但每个待集成 slice 都必须声明它遵守的协议版本**。未 ACK 最新涉及自身契约的规则，则其下一工程检查点应标 `COORDINATION_ACK_PENDING`；已有冻结代码不会被文档修改追溯地“自动不合格”。
- C 裁决改变数据合同/共享文件时，A/B/I 应以新的 C 真实提交 SHA 为准，而不根据本协议的文字自动假设代码已修改。
- 所有执行 Agent 在自己的工程 PR 说明协调分支地址、协议版本和最近一次 ACK SHA，便于用户把一份同样的提示词发给 A/B/I。

## 8. 当前快照（2026-10-19，以下 SHA 是首次记录，不是自动更新的实时引用）

| 线 | 工程 PR | 当前固定 HEAD | 已核验描述 | 真实集成状态 |
|---|---|---|---|---|
| C0 | #141 | `5682057c7232c914e72fdae525ce95fd33f32b53` | `C0_FROZEN_GO`：仅离线本地身份/共享合同 | 四线共同起点 |
| A | #143 | `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` | A1–A3、部分 A4；单线 PR CI 成功 | `SOURCE_ONLY`，CR-A-001 未裁决 |
| B | #142 | `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` | B1–B4 部分实现；单线 PR CI 成功 | `SOURCE_ONLY`，B-CR-001 未裁决 |
| C | #144 | `31aa352c45a33d6832612884b0fea38e39b5cf8d` | C1 部分，单线 PR CI 成功；C2–C5 未形成验收工程产物 | `C1_PARTIAL` |
| I | #145 | 初始文档 HEAD `2fcc5019576aa95857ccbaa70a3765978cac2bff` | I 任务书 docs-only、未启动实装 | `I0_NOT_RUN`；**无统一 A+B+C 集成 SHA** |

**快照判读**：单线 PR CI 的成功范围不代表 Gate E/L/P、正式应用接线、任何校方认可；本文件的更新不自动刷新实际工程 HEAD，写状态之前要重新获取 PR 和 workflow 状态。

## 9. C 独占裁决登记区（其余 Agent 只读）

<!-- BEGIN:DECISIONS:C -->
- `C-RULE-001 / 2026-10-19 / ACTIVE_V1.0`：A/B 已按各自状态区 ACK；I 以自身实际区段为准。单一协调文件、四线独立工程 PR、C 最终业务/安全裁决与 I 工程集成 Owner 继续生效。本裁决只编辑 C 的决议/状态区，不代替其他 Agent 署名。
- **`C-ANCHOR-001 / APPROVED_TECHNICAL_ONLY`**：**首个 C 集成锚点**为 PR #144 的已验证旧 SHA `31aa352c45a33d6832612884b0fea38e39b5cf8d`，共同基础 C0 `5682057c7232c914e72fdae525ce95fd33f32b53`／`review-c0/1`。此 SHA 的 PR CI `39229456164`、Batch `39229456214`、D2 `39229456312`、Review Baseline `39229456107` 均成功，**仅构成 C1 部分离线代码可用性，不构成 C1 完成或 A+B+C 联合 PASS**。I 可从该 SHA 开始隔离的 I1 工程快照，测试 A1 Owner、A2 C0 proposal-only、A3 技术诊断、B1 候选 Plan 编译预览、B2 staged parser/source registry、B3 路由建议；不得写任何正式 CurrentCase/Run/Decision 或把 candidate-held 作为 published。I 可使用 A 已独立 CI 成功的 `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` 和 B 已成功的 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 作为首批来源；**不得自动替换为浮动的新 HEAD**。A/B 后续 SHA 需新 CI 证据与独立锁定；B 于本次核验时最新 `df6b6ba458eb7c6ef2e7a2942ccffa17c72cf2d2` 的 PR CI `39239062410` 为 FAILURE，不在批准来源内。
- **`CR-A-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`**：
  1. **A-0 已批准**：I 可受限导入 A1 Owner/Grant、A2 的旧 `review-c0/1` 事件 proposal/outbox、A3 exact-check 技术覆盖和合成负例；所有事件只做候选观察和受控技术测试。无正式 Run ACK/业务完成权限，不需要等 A4 完成。
  2. **A-1 已裁决合同方向**：**不修改/伪装原 C0/1 ExecutionEvent**，采用 C 独立版本 `review-v3-execution/1` 的严格 proposal envelope，必须覆盖完整 `RunEvidenceIdentity`（case/run/revision/plan fingerprint/manifest/attempt/generation）、eventId=规范序列化 payload SHA-256、连续 sequence、当前 Main grant、Host receipt、物理 SourceIdentity + read extent、精确 Check×target×object×subject + accepted/rejected/missing/unknown 和独立技术终态。唯一事件重放键由 `runId/attemptId/generation/sequence` 加存储的 body digest 界定：同键同 body 返回原持久 ACK、同键不同 body 拒绝。旧版 proposal **不自动升级**。C 工程 PR #144 已提交纯校验层 `review-v3-execution-contract.ts` 与负例测试（本次开发 HEAD：`8a72a68d141d1a262b27b62f219c8619ffb5fbd2`）；其本次代码 CI **待检查，不继承锚点旧 CI**。
  3. **A-2 尚未实施**：A 需在其自有 adapter/Host 侧生产上述有真实 Host 回执的 proposal；C2 由 C 在 Main 可信消费端复查当前 Principal/session/grant/Source/Plan、原子入正式 Run/ReadReceipt/Check，并**仅在 durable write 后签发唯一 ACK**。I 可编写只读验证桥接及试验 negative cases，但**不允许**代写正式 Run consumer 或绕过 Main；若需改 shared DTO/IPC，由 C 独占提交经测试的新固定 SHA。技术 `completed-technical` 不等于合法业务完成，C2 需再校验覆盖与正式条件。
  4. **A-3 仍阻断的验收**：Host 真实 source/block/read extent、复现实机 revoke/late event、多 PID/ENOSPC、9/9 Check/24 turn/Provider、断电 ACK replay；这些需 A 自测 + I 新合并 SHA 联合 Gate O/E，未过前 `RUN_WRITER_WIRING=BLOCKED`。
- **`B-CR-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`**：
  1. **B-0 已批准**：I 可导入 B1 immutable candidate compiler、B2 staging + parser-verified SourceIdentity 和 B3 保守路由，在独立隔离环境验证来源、三值条件、升级 ACK、20 秒中断与物理版本，不得将 `publicationAllowed=false` 的候选作为正式政策/Gold；技术预览/试跑状态必须与正式安装区别展示。
  2. **B-1 可信 Main 入口合同已裁决**：仅 C 的 Main 从真实 `IpcMainEvent.sender/senderFrame`、当前窗口与有效 owner/session 授权派生 actor/owner generation/scope，再签发 Native picker/drop **物理 bytes capability** 给 B2 一次性短时 staging；严禁相信 Renderer JSON 的 `ownerId/frameId/teacher/physicalSourceKey/blockId`。窗口关闭、失效、await 后撤权及重试必须 fail closed。B 负责其 adapter/ZIP/parser 本身，I 仅负责新 glue、合同测试；正式 Main handler/Preload 授权仍 C 独占。
  3. **B-2 唯一业务写入口合同已裁决**：受信 C 命令需 `expectedRevision/requestId/payloadHash`、Principal scope、校验原件/Source registry/当前 Subject/版本、CAS + durable Receipt；材料 `ApplyMaterial`/Archive 导致旧 Observation/Link/ReadReceipt/Run 当前效力撤销；`InstallPlan`/UpgradePlan 必须验证 immutable descriptor fingerprint、实际政策来源/独立发布权限、Check×target×source、删 Check 的显式 ACK，并保留旧 Plan/Run/Receipt。**候选 Plan 只许预览，不允许作为已发布 Plan 正式安装**；目前 #144 的 `bindCanonicalPlanV3` 只具备内部验证回调，正式 publisher/provenance verifier 与 Main 命令尚未实现，状态 `PENDING_C_IMPLEMENTATION`。不需要也不批准 B/I 新建第二份 CaseStore。
  4. **B-3 仍阻断的验收**：真实 Native picker/ZIP/Office 解析、持久 ImportBatch、50 候选逐义务政策证据及第 51 套真实用户流程、旧 P06 unsupported 可见性与独立 Gold/学校授权；这些不能由 I 假模拟为已完成。Main/业务写入集成须等 C 实际代码及负例 CI。
- **`I-DELEGATION-001 / NO_C_FILE_WRITE_LEASE`**：当前 I 可新增自身隔离 glue/合成测试、搬运已锁定的 A/B 独占文件、在 I 分支跑回归并提出精确 CR；**尚未委托**修改 `packages/shared/**`、`review-ipc.ts`、Preload、Case/Run/Batch/Outbox、`workspace-service-v2.ts`、`pi-case-review-service.ts` 或 C 的正式服务任何 hunk。因合同/CI 阻断只能暂停相关切片，A/B/C 仍独立前进。
- **`C-INTEGRATION-SIGNOFF / PENDING`**：I1 新集成 SHA 尚不存在，C 不可能事先签收联合 Gate O。I 需提交精确源 SHA→集成 SHA、变更及正反例、失败/回滚。C 签收 `C_ACCEPTED_FOR_ENGINEERING` 只能发生在该 SHA 实际代码与门禁核验后；E/L/P、产品发布均独立。
<!-- END:DECISIONS:C -->

## 10. 四线各自的最近进度区（只编辑自己的 BEGIN/END）

### A — Owner: Dev-A
<!-- BEGIN:STATUS:A -->
- `COORDINATION_ACK`: **ACK V1.0@5613466af85484e58ebc1e8cf7de227087322ad1** (`V3-ABCI-GOVERNANCE-R01`); accepted four-line role boundaries and C-only decisions. ACK references protocol branch SHA read before this A-only commit.
- `SOURCE_HEAD`: Dev-A Draft PR [#143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143) @ **`a0b875150ef278084d4621c7f0ddd701cba880b7`**, base C0 `5682057c7232c914e72fdae525ce95fd33f32b53`, schema `review-c0/1`; no production Main/Run writer modifications.
- `GATE`: **latest source SHA O=PENDING_CI/NOT_YET_VERIFIED** ([PR CI #39239631018](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39239631018) queued/pending at last read); previous **O=PASS_SCOPED** only on `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` ([#39228978591](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39228978591), 4023 PASS/5 SKIP/0 FAIL). **E=NOT_RUN; L=BLOCKED_NO_AUTH; P=NOT_RUN**. No latest SHA PASS inherited from older runs.
- `A1-owner`: source PR #143, source SHA `a0b875150ef278084d4621c7f0ddd701cba880b7`; `review-pi-owner-adapter.ts` and tests; Main-injected authorization port, lease/generation/expiry/source allowlist, tombstone, process-epoch cold-start quarantine, atomic/fsynced journal; `READY_FOR_ADAPTER` (not wired to real Orchestrator/session manager). C0/1, no required CR for isolated extraction; I next: preflight/contract test; A next: restore/stop robustness.
- `A2-events`: same frozen source SHA; `review-execution-event-adapter.ts` and tests; C0/1 proposal sequence, local digest/ACK replay, Host receipt-id dedupe and collision denial, physical source digest, after-await check plus cross-PID final Owner fence; **`READY_FOR_ADAPTER` for proposal-only**, **`CONTRACT_BLOCKED` for formal C ReviewRun consumption**; requires `CR-A-001` C decision before trusted check/extent/terminal finalization. I may extract without writing formal Run.
- `A3-coverage`: same source SHA; `review-execution-event-adapter-completeness.ts`, `review-execution-event-adapter-driver.ts` and tests; exact technical Plan×check×target with accepted/rejected/missing/unknown, mode-compatible Host seam for direct/hidden/Graph/batch, 24-turn and failure cases; `SOURCE_ONLY` pending actual host-path wiring; business completion `CONTRACT_BLOCKED` by CR-A-001.
- `A4-recovery`: same source SHA; cold-process deny, damaged ledger fail-closed, injected ENOSPC, file CAS+O_EXCL writer lock with stale-snapshot fail-closed, two real PID CAS/lock primitive probes (`review-pi-owner-adapter-multipid.test.ts`); `SOURCE_ONLY/PARTIAL`; full cross-PID Main/Run, real ENOSPC/EACCES/kill and Electron Gate E remain NOT_RUN. Owner permission + outbox append is serialized against file-backed revoke via the same lock. A continues standalone tests and reliable Owner/event journal.
- `CR/BLOCKERS`: `CR-A-001=PENDING_C_DECISION` (eventId+sequence/ACK, exact check target/real read extent, case/source/owner generation, partial/failed/terminal); C decisions section remains unchanged. Main sender, real session/Host callsite glue, business consumer belong to C/I coordinated integration.
- `NEXT`: continue standalone Owner/Host recovery and targeted real fault tests, then update latest exact-SHA Gate O from workflow output; I may preflight source SHA but should not label new slice PASS_SCOPED before latest workflow SUCCESS; C still owns trusted Run consumption and CR-A-001.
- `A4-DELTA`: under #143 current SHA the file backend CAS avoids stale competing writers, event outbox de-duplicates repeat Host receipts, and a Main Owner file lock spans final grant validation to proposal append. All are Dev-A-local types, **not** shared DTO/schema changes; status awaits new Gate O.
<!-- END:STATUS:A -->

### B — Owner: Dev-B
<!-- BEGIN:STATUS:B -->
- `COORDINATION_ACK`：`ACK V1.0@5613466af85484e58ebc1e8cf7de227087322ad1`；认可 `V3-ABCI-GOVERNANCE-R01`、C 独占共享业务/安全裁决、I 只做已授权集成。本次重读协调 SHA `25f00eb1b95dc7f7ebe162bc3366b6fb08f2ba4f`、blob `c1b1e732e010fef7d0cc9cf629a65fcad88f4d61`，A 区已 ACK，不改其他区。
- `SOURCE_HEAD`：工程 Draft PR #142 @ `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，基于 C0 `5682057c7232c914e72fdae525ce95fd33f32b53`／`review-c0/1`；B 自有源码及测试，不触碰共享写权。C #144 `31aa352c45a33d6832612884b0fea38e39b5cf8d`，A #143 `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` 为此次取样。
- `B1-plan`：#142 同上 SHA，`review-template-plan-adapter-v3-b1.ts` + test；immutable Plan、2 target × 6 Check、unknown/sourceVersion、模块依赖/digest 与删除 ACK；`READY_FOR_ADAPTER`（技术候选预览，不是正式 InstallPlan），C0/1，正式安装需 `B-CR-001` C 决议；I 可先集成无写权编译器。
- `B2-source`：#142 同 SHA，`review-intake-adapter-v3-b2.ts`、`review-source-version-adapter-v3-b2.ts` + tests；单次 owner/sender/frame/generation token、物理 bytes hash、真实 parser 和已验证 SourceIdentity block；`READY_FOR_ADAPTER` 仅独立暂存/解析，真实 Main picker、持久版本/ImportBatch 与 ApplyMaterial `CONTRACT_BLOCKED`，需 B/C/I 分工。
- `B3-router`：#142 同 SHA，`review-intake-routing-adapter-v3-b3.ts` + test；20s 倒计时、唯一明确/用户打断/歧义拒自动选择，不建案；`READY_FOR_ADAPTER`（纯建议），Main 真实输入和用户工作台接线尚未发生。
- `B4-author-ui-assets`：#142 同 SHA，独立 `ReviewV3AuthorWizard.tsx`、`review-template-author-store-v3-b1.ts` + tests、`B4-50-CANDIDATE-SOURCE-LEDGER.csv`；`SOURCE_ONLY`（UI 未挂载、无完整第51套 UAT；G01–08 5/3/10/8/6/9/7/2 全部 candidate-held，50 条目录并非逐义务 Gold）。
- `GATES`：Gate O 对精确 B HEAD：PR CI `39230036780`、D2 Scoped Pi `39230036753`、Review Baseline `39230036747` 全部 SUCCESS；`PASS_SCOPED`，不代表每条适配器/安全负例已通过。Gate E `NOT_RUN`；L `BLOCKED_NO_AUTH`（校方政策、身份、原件/独立Gold）；P `PARTIAL_NOT_ACCEPTED`（50逐条政策责任、第51套真实用户体验、100案/500文件、120+30/真人UAT）。
- `BLOCKED`：`B-CR-001 PENDING_C_DECISION`，Main 身份/Native picker、source receipt、InstallPlan/ApplyMaterial 和发布授权；ZIP安全、durable ImportBatch/checkpoint/重试/真实 Office71/Electron 尚缺。I 可先逐片集成纯编译/解析/路由，不可越权正式写入。
- `NEXT`：B 继续独立提升 #142 的 ZIP 安全与逐文件导入状态、可信 parser/SourceRef 对照、作者 UI/试跑/版本导出、50 候选逐义务账；将新固定 SHA、正反例及 Gate O/E/L/P 逐片交 I，不等待 A/C/I 轮次对齐。
<!-- END:STATUS:B -->

### C — Owner: Dev-C
<!-- BEGIN:STATUS:C -->
- `COORDINATION_VERSION`：`V3-ABCI-GOVERNANCE-R01/V1.0`；C 已对 `CR-A-001`、`B-CR-001` 按端口作**批准规范/暂缓实施**的分层裁决，首次 I1 **技术-only 锚点**为旧绿 `31aa352c45a33d6832612884b0fea38e39b5cf8d`。见第 9 节，其他线的 ACK 保持其各自原状态。
- `SOURCE_HEAD`：#144 C 研发 HEAD 本轮提交 `8a72a68d141d1a262b27b62f219c8619ffb5fbd2`（版本化 Execution proposal validator + tests，CI 未确认）；旧 C1 SHA 的限定 CI 已成功，**不可移植其成功结论**。
- `DELIVERED`：C1 原生案卷优先、材料归档当前效力撤销、内部 Plan 绑定/升级；新增 C-owned `review-v3-execution/1` 技术事件可信校验器与合成负例。这里只是输入合同层，**没有实现 C2 正式 Run writer、A Host 到 C Main 的真实联通或 B 正式 Main intake**。
- `BLOCKED`：C1 完整写路径未收口；C2 Run、C3 Batch、C4 事务/Outbox、C5 工作台均未完成。A 新版本事件消费者、B 正式 policy provenance verifier 和 Main Picker/ApplyMaterial/InstallPlan 都需 C 后续实现；缺少校方授权 Gate L 不可达。
- `GATES`：旧锚点离线 CI success (上述四个 workflow)；本轮 C 新代码 `Gate O=PENDING_CI`；I1 联合 Gate O、Gate E、Gate P `NOT_RUN`，Gate L `BLOCKED_NO_AUTH`。本协议裁决不等于代码/产品验收。
- `NEXT`：确认新 C 合同负例与 typecheck CI，修复失败；继续 C1 正式 Main 入口及 Source/Plan validity，再提供下一代码锚点给 I；并推进 C2 唯一 ReviewRun writer。I 只集成已授权的技术切片。
<!-- END:STATUS:C -->

### I — Owner: Integrator-I
<!-- BEGIN:STATUS:I -->
- `COORDINATION_ACK`：**ACK V1.0@f77887c3340d7e6dc9658857ae43334429bc093a**，已阅读共同协议全文、I 任务书、C0 owner manifest、A/B CR；保留 C 的最终业务合同/签收权，不修改其他 Agent 状态或决议区。
- `I0_PR`：独立 Draft [#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146)，分支 `audit/v3-integrator-i0-preflight-r01`，当前已提交工程预检 HEAD `c84f575addcbb1f36b5eff0acb27442b91073fa1`，实际 base 为 C0 `5682057c7232c914e72fdae525ce95fd33f32b53`。三个文件：机器输入锁、可执行 C0/I0 守卫测试、集中 I0 handoff+CR 决策包；**未创建 A+B+C 正式集成 SHA**。
- `FROZEN_I0_INPUT`：#143 A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`、#142 B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`、#144 C `31aa352c45a33d6832612884b0fea38e39b5cf8d`，皆以同一 C0 为 Git merge-base，原 PR CI 各成功；A 8/B 12/C 14 个测试或生产路径零同路径冲突，A/B 未触碰 C 独占文件。这**仅证明输入 lineage 与 ownership**。
- `ADVANCING_SOURCES`：A #143 后续 `ab1e965e14bf3ccefc8c28828aa26c7390782b62`（新增 multi-PID 测试，检查时 CI `39239221711` QUEUED）；B #142 `df6b6ba458eb7c6ef2e7a2942ccffa17c72cf2d2` 新 ZIP 曾在 PR CI `39239062410` typecheck **FAIL TS2366**（`review-zip-intake-v3-b2.ts:105:35`，B 已收到精确评论），之后 `90154a351334866ea13a87a5a850a09b980b3b6c` 新增 checkpoint，最新 CI 尚未签收。旧源锁保留，新片段按新 HEAD 单独验。
- `SLICES`：A1 owner、A2 C0 proposal-only 和 B1 candidate Plan、B2 staged Source 为 `READY_FOR_ADAPTER`（I0 只预检）；A3 Host coverage、A4 recovery、B3 routing、B4 candidate UI/50目录、C1 partial `SOURCE_ONLY/PARTIAL`；正式 Plan/Source/Run 写入 `CONTRACT_BLOCKED`。C2/C3/C4/C5 未获得正式可集成代码。
- `I0_GATES`：GitHub 可验证文件/函数与 SHA、内存静态输入锁断言 9/9 PASS；`review-v3-integration-i0-gates.test.ts` 已提交待 CI 真实执行。**联合 Gate O=NOT_RUN**（无统一 A+B+C SHA / 本地无 Bun 与可 clone worktree），E=NOT_RUN，L=BLOCKED_NO_AUTH，P=NOT_RUN；未获得 C 工程签收、无政策发布或学校认可。
- `CR_AND_C_DECISIONS`：`CR-A-001=PENDING_C`（Run/eventId/sequence、Check×target/status、read extent、可信 ACK）；`B-CR-001=PENDING_C`（Main picker/owner context、SourceRegistry/physical origin、InstallPlan/ApplyMaterial、publication gate）。I 以 #146 的单份决策包请求 C 逐端口裁决，另需 `C_INTEGRATION_ANCHOR_SHA` 与必要的窄路径/函数 lease。无批准不修改 C writer。
- `NEXT`：I 继续审新源 diff 和隔离合同测试准备、追踪各源新 HEAD 真实 CI；拿到 C 固定锚点+逐端口 APPROVED 后另建 `integration/v3-i1-*`，按已批准 slice 导入 A/B，构建**同一 SHA** Gate O、保存累计 checkpoint，并请求 C 对精确 diff 签收；不要求 A/B/C 轮次同步。
<!-- END:STATUS:I -->

## 11. 四线收到本文件后立即执行的统一动作

1. **A/B/I** 先读最新全文+PR #145 head，确认自身职责和禁止事项，在对应状态区写入 `ACK V1.0@<协调分支实际commitSHA>`；如有实质疑义，保持 `ACK_PENDING` 并提出精确冲突。C 在第 9 节集中裁决，不要求停止无依赖工程。
2. 每线继续原来的工程 PR 和既定开发任务，**不是另起研究或把当前工程改为只写文档**。在自己的工程 PR 完成一个可复验切片后，按第 7 节同步自己的状态区，保持测试证据可追溯。
3. **I** 不等待 A/B/C 轮次对齐，从 I0 开始；按已满足前置条件的 slice 制作 adapter/合同负例。在没有 C 正式批准时保留 `CONTRACT_BLOCKED`，不得用假接口硬接成 PASS。
4. **C** 批准共享合同/委托及集成检查点；I 负责机械集成和联合回归。真实的修改依据签名的代码 SHA 和裁决记录，不根据文档预测已经完成。
5. 无人自动合并 main、删除历史分支、修改受限 Gold、伪造校方授权或降低验收标准。所有四线维持 Draft、NO-GO，直至独立发布门禁满足。
