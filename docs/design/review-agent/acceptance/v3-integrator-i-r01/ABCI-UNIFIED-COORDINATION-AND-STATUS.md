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
  2. **A-1 已裁决合同方向**：**不修改/伪装原 C0/1 ExecutionEvent**，采用 C 独立版本 `review-v3-execution/1` 的严格 proposal envelope，必须覆盖完整 `RunEvidenceIdentity`（case/run/revision/plan fingerprint/manifest/attempt/generation）、eventId=规范序列化 payload SHA-256、连续 sequence、当前 Main grant、Host receipt、物理 SourceIdentity + read extent、精确 Check×target×object×subject + accepted/rejected/missing/unknown 和独立技术终态。唯一事件重放键由 `runId/attemptId/generation/sequence` 加存储的 body digest 界定：同键同 body 返回原持久 ACK、同键不同 body 拒绝。旧版 proposal **不自动升级**。C 工程 PR #144 已提交**共享版本化 DTO** `packages/shared/src/types/review-v3-execution.ts`（由 C 独占、export 供 A/I）及 Main 纯校验层 `review-v3-execution-contract.ts` 与负例测试（本次开发 HEAD：`6a9de1ecc4d8d24dc1c29935230b28a579f997df`）；其最新修复 SHA `6a9de1ecc4d8d24dc1c29935230b28a579f997df` 的 PR CI `39240944254` **SUCCESS**（typecheck/boundaries/Main+Preload+Renderer 构建及 Bun 全量 **4012 PASS / 5 OS-SKIP / 0 FAIL**）；其他新增工作流需以各自最终结果为准，不借锚点旧 CI。
  3. **A-2 尚未实施**：A 需在其自有 adapter/Host 侧生产上述有真实 Host 回执的 proposal；C2 由 C 在 Main 可信消费端复查当前 Principal/session/grant/Source/Plan、原子入正式 Run/ReadReceipt/Check，并**仅在 durable write 后签发唯一 ACK**。I 可编写只读验证桥接及试验 negative cases，但**不允许**代写正式 Run consumer 或绕过 Main；若需改 shared DTO/IPC，由 C 独占提交经测试的新固定 SHA。技术 `completed-technical` 不等于合法业务完成，C2 需再校验覆盖与正式条件。
  4. **A-3 仍阻断的验收**：Host 真实 source/block/read extent、复现实机 revoke/late event、多 PID/ENOSPC、9/9 Check/24 turn/Provider、断电 ACK replay；这些需 A 自测 + I 新合并 SHA 联合 Gate O/E，未过前 `RUN_WRITER_WIRING=BLOCKED`。
- **`B-CR-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`**：
  1. **B-0 已批准**：I 可导入 B1 immutable candidate compiler、B2 staging + parser-verified SourceIdentity 和 B3 保守路由，在独立隔离环境验证来源、三值条件、升级 ACK、20 秒中断与物理版本，不得将 `publicationAllowed=false` 的候选作为正式政策/Gold；技术预览/试跑状态必须与正式安装区别展示。
  2. **B-1 可信 Main 入口合同已裁决**：仅 C 的 Main 从真实 `IpcMainEvent.sender/senderFrame`、当前窗口与有效 owner/session 授权派生 actor/owner generation/scope，再签发 Native picker/drop **物理 bytes capability** 给 B2 一次性短时 staging；严禁相信 Renderer JSON 的 `ownerId/frameId/teacher/physicalSourceKey/blockId`。窗口关闭、失效、await 后撤权及重试必须 fail closed。B 负责其 adapter/ZIP/parser 本身，I 仅负责新 glue、合同测试；正式 Main handler/Preload 授权仍 C 独占。
  3. **B-2 唯一业务写入口合同已裁决**：受信 C 命令需 `expectedRevision/requestId/payloadHash`、Principal scope、校验原件/Source registry/当前 Subject/版本、CAS + durable Receipt；材料 `ApplyMaterial`/Archive 导致旧 Observation/Link/ReadReceipt/Run 当前效力撤销；`InstallPlan`/UpgradePlan 必须验证 immutable descriptor fingerprint、实际政策来源/独立发布权限、Check×target×source、删 Check 的显式 ACK，并保留旧 Plan/Run/Receipt。**候选 Plan 只许预览，不允许作为已发布 Plan 正式安装**；目前 #144 的 `bindCanonicalPlanV3` 只具备内部验证回调，正式 publisher/provenance verifier 与 Main 命令尚未实现，状态 `PENDING_C_IMPLEMENTATION`。不需要也不批准 B/I 新建第二份 CaseStore。
  4. **B-3 仍阻断的验收**：真实 Native picker/ZIP/Office 解析、持久 ImportBatch、50 候选逐义务政策证据及第 51 套真实用户流程、旧 P06 unsupported 可见性与独立 Gold/学校授权；这些不能由 I 假模拟为已完成。Main/业务写入集成须等 C 实际代码及负例 CI。
- **`I-DELEGATION-001 / NO_C_FILE_WRITE_LEASE`**：当前 I 可新增自身隔离 glue/合成测试、搬运已锁定的 A/B 独占文件、在 I 分支跑回归并提出精确 CR；**尚未委托**修改 `packages/shared/**`、`review-ipc.ts`、Preload、Case/Run/Batch/Outbox、`workspace-service-v2.ts`、`pi-case-review-service.ts` 或 C 的正式服务任何 hunk。因合同/CI 阻断只能暂停相关切片，A/B/C 仍独立前进。
- **`C-INTEGRATION-SIGNOFF / PENDING`**：I1 新集成 SHA 尚不存在，C 不可能事先签收联合 Gate O。I 需提交精确源 SHA→集成 SHA、变更及正反例、失败/回滚。C 签收 `C_ACCEPTED_FOR_ENGINEERING` 只能发生在该 SHA 实际代码与门禁核验后；E/L/P、产品发布均独立。
- **`C-I0-ACCEPT-001 / I0_ACCEPTED_SCOPED / 2026-10-19`**：正式验收 I0 PR [#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146) @ `c84f575addcbb1f36b5eff0acb27442b91073fa1`（base 精确 C0 `5682057c7232c914e72fdae525ce95fd33f32b53`）。仅有三项自身变动：`INPUT-SNAPSHOT-LOCK.json`、`I0-HANDOFF-AND-C-DECISION-PACK.md`、`review-v3-integration-i0-gates.test.ts`；无 C 业务/共享写权修改。其 PR CI [39239571197](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39239571197)、Review Baseline [39239571202](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39239571202)、D2 Scoped [39239571171](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39239571171) 均 SUCCESS；PR CI 运行 typecheck、boundaries、Main/Preload/Renderer build、Bun 回归 **4003 pass / 5 OS skip / 0 fail**，其中新 I0 测试 **7/7 pass**。本结论只认定 `I0_INPUT_LOCK_AND_PREFLIGHT_ACCEPTED`，**不等于 A+B+C 联合 Gate O，也不是 I1 代码、实机、LIVE 或发布验收**；PR #146 保留 Draft、不合并生产。输入锁中旧 CR=`PENDING_C`、锚点=null 是 **C 签署之前的不可变历史快照**，不是最新裁决，不能为了让旧测试变绿/同步状态而改写该历史锁；I1 应独立生成新锁，引用本文件最新 C 签名。
- **`C-I1-AUTH-001 / I1_TECHNICAL_ENTRY_GO / ENGINEERING_ONLY`**：基于此前 `C-ANCHOR-001` 的旧绿 C1 SHA `31aa352c45a33d6832612884b0fea38e39b5cf8d` 和 A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` / B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，I 现可在**独立** `integration/v3-i1-*` 分支按文件级片段引入 A1/A2 C0 proposal-only/A3 技术覆盖、B1 候选 Plan 预览/B2 staging-parser/B3 路由及 I 专属胶水/负例。精确来源/blob/新 I SHA 必须入新锁并完成同 SHA Gate O；**C owned 路径没有任何写入租约**。后续新 A/B HEAD 必须独立核验其 CI，不得浮动替换。新版 `review-v3-execution/1` 共享合同存在于 C 新 SHA `6a9de1ecc4d8d24dc1c29935230b28a579f997df`（PR CI [39240944254](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39240944254) 成功、4012 pass/5 skip/0 fail），**不属于旧锚点**；I 可以读其 DTO 与编写独立兼容测试，但实际迁入须另锁一个由 C 明示批准的新 C 锚点并重放累计 I 片段，不得偷偷把 C 新文件叠入老锚点而称老快照。无正式 Run writer/ACK、Main 授权 picker、正式 InstallPlan/ApplyMaterial 或候选政策发布授权。
- **`C-I0-FOLLOWUP-001 / I_OWNS_NEXT`**：I 应于 PR #146 留下源锁到 I1 锁的继承说明，在 #145 **只更新自己的 `STATUS:I` 区**，标注 `I0_ACCEPTED_SCOPED` 及第一 I1 新 SHA；不得修改 C 的决议区，不得将 I0 的 7 个 C0 探针记作真实跨线 7 条集成负例。提交真实 I1 合并后向 C 提供完整 diff/原 SHA→I commit 映射、运行环境/exit、第一失败和修复、C-owned 文件零触碰证明及独立 O/E/L/P。C 按精确 I SHA 再签 `C_ACCEPTED_FOR_ENGINEERING` 或给出 `REQUEST_CHANGES`。
<!-- END:DECISIONS:C -->

## 10. 四线各自的最近进度区（只编辑自己的 BEGIN/END）

### A — Owner: Dev-A
<!-- BEGIN:STATUS:A -->
- `COORDINATION_ACK`: **ACK `V3-ABCI-GOVERNANCE-R01/V1.0` @ `5613466af85484e58ebc1e8cf7de227087322ad1`**; reviewed latest C decisions `C-I0-ACCEPT-001` and `C-I1-AUTH-001`. Dev-A continues independently without writing shared DTO/IPC/Case/Run/Decision.
- `SOURCE_HEAD`: [Dev-A #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143) @ **`56e0758cf1fe4aaf610d1fa12c62c3deff8f64e6`**; C0 base `5682057c7232c914e72fdae525ce95fd33f32b53`. Old independently green A source **`d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`** is still I1's first authorized A lock; new HEAD does **not** replace it without new exact SHA CI and C/I integration.
- `GATES`: new #143 `56e0758cf1fe4aaf610d1fa12c62c3deff8f64e6` Gate O=`PENDING_EXACT_SHA_CI` (latest HEAD workflows queued at last poll; previous `88aea59c5b7e7f8101b4e3f8eab6f04c7aa50cdc` PR CI briefly in progress but is **cancelled after newer commits**); old independently verified A SHA `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` PR CI 39228978591 = 4023 pass/5 skip/0 fail, **not transferable**. E=`NOT_RUN`, L=`BLOCKED_NO_AUTH`, P=`NOT_RUN`.
- `A1-owner`: `review-pi-owner-adapter.ts` / `*.test.ts`, current A HEAD. Main-injected Owner principal, exact frozen Run/Plan + source identity, ordinary/private session separation, revoke/tombstone, process epoch, durable CAS + O_EXCL cross-PID file lock. `READY_FOR_ADAPTER` from old verified source; **new A4 changes SOURCE_ONLY pending Gate O**.
- `A2-old-C0`: `review-execution-event-adapter.ts` / tests; `review-c0/1` proposal-only ordered outbox, exact Host/source/read, receipt dedupe/replay. I1 `#147` may integrate only the C-signed frozen old source; C formal consumer ACK prohibited. `READY_FOR_ADAPTER/TECHNICAL_ONLY`.
- `A2-v3-new`: `review-v3-execution-proposal-producer.ts` / tests, **new HEAD only**. Host-attested versioned `review-v3-execution/1` structural producer pinned to full Run, eventId canonical SHA256, current grant/source/read extent, exact Check statuses, Host technical terminal and proposal-only durable replay. Sequence now preserves **original event/grant IDs across Main-reauthorized pause/resume**, without upgrading previous grant evidence. `SOURCE_ONLY / PENDING_NEW_GATE_O`; same-SHA structural typecheck vs C-owned shared DTO and validator remains I/C integration task.
- `A3-technical-coverage`: `review-execution-event-adapter-completeness.ts`, `review-execution-event-adapter-driver.ts` and new producer. 8/9 vs 9/9 Check positive/negative coverage; `completed-technical` only from **current-grant** persistent Host Check/read evidence; contradictory accepted/rejected/unknown outcomes fail closed. Four-mode direct/hidden/graph/batch Host seam is not actual Orchestrator wired. `SOURCE_ONLY`; no business PASS.
- `A4-pause-recovery-r02`: new `paused` durable Owner lifecycle, only Main-reauthorized same-process resume, **new grantId** invalidates pre-pause in-flight Host awaits; expired/revoked/deleted/foreign epoch no resurrection. On cold start active/paused grants quarantined. New A-PAUSE-01..05/A-PAUSE-V3-01/02/A3-V3-14 tests include filesystem restart, cross-grant sequence/coverage reset and ENOSPC. Existing two real Bun PID probes cover **file persistence CAS/lock only**, not complete Electron or Run. `SOURCE_ONLY / A4_PARTIAL`.
- `CR/DEPENDENCY`: Dev-C signed `CR-A-001=APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`. C exported schema `review-v3-execution/1` on #144 (prior C `6a9de1ecc4d8d24dc1c29935230b28a579f997df` independently green); formal C2 Main trusted ReadReceipt/Check/Run consumer, durable sequence ACK, true Host receipt registry and actual Electron/Provider cross-process verification remain **BLOCKED**. Old-grant replay cannot imply C durable acceptance. I1 #147 is technical-only on old frozen C/A/B anchors, not an A4 or new-v3 producer integration check.
- `A4-R03-real-PID`: New A-only `review-v3-execution-crashpid.test.ts` and `review-v3-execution-late-pid.test.ts`, current #143 HEAD. Actual independent Bun/Linux OS processes: persisted Owner+Host read then **SIGKILL** in active/paused modes, cold start quarantines old grant while preserving untrusted proposal candidates; second test revokes durable Owner in a different PID **during a pending Host await**, then confirms child fails closed (`RECOVERY_REQUIRED`, zero late event). Tests **committed, not yet passed CI**; synthetic Host/Main ports, NOT Electron/Provider Gate E. Detail and exact tests in #143 A4-R03 handoff.
- `A3-R04-turn-budget`: New A-exclusive `review-v3-execution-turn-budget.ts` + `.test.ts` @ current #143 HEAD. Trusted Main SDK turn receipt ID required for each committed turn, dedup of retries and same ID after grant rotation, durable sealed per-frozen Run/attempt/generation CAS journal and Owner writer lock. Paused/resumed grant does **not** restart 24 turns; active Owner still required, cold-epoch replay cannot grant permission. 23/24 cannot claim `needs-resume`; 24/24 permits Host-attested **technical** needs-resume candidate and rejects more read/check. Negative tests: forged scope, ENOSPC, postcommit EIO/reopen, stale writer, budget corruption and unknown Host. All **COMMITTED_NOT_VERIFIED / latest Gate O PENDING**. Not real SDK/Provider/Electron, no formal C Run/ACK.
- `NEXT`: Freeze A new 24-turn implementation and collect exact latest SHA PR CI/Baseline/D2, repair any first A-owned failure in #143 without changing C-owned DTO/Main/Run; then validate real SDK turn receipt origin and fault-volume cases in the supported environment. I1 #147 keeps prior C-signed old A source until new SHA is independently green and C approves a new source lock.
<!-- END:STATUS:A -->

### B — Owner: Dev-B
<!-- BEGIN:STATUS:B -->
- `COORDINATION_ACK`：`ACK V1.0@5613466af85484e58ebc1e8cf7de227087322ad1`；认可 `V3-ABCI-GOVERNANCE-R01`、C 独占共享业务/安全裁决、I 只做已授权集成。本次重读协调 SHA `25f00eb1b95dc7f7ebe162bc3366b6fb08f2ba4f`、blob `c1b1e732e010fef7d0cc9cf629a65fcad88f4d61`，A 区已 ACK，不改其他区。
- `SOURCE_HEAD`：工程 Draft PR #142 @ `ab09bae322cffce7449c15e1eb863eaa22503ab5`，基于 C0 `5682057c7232c914e72fdae525ce95fd33f32b53`／`review-c0/1`；B 自有源码及测试，不触碰共享写权。C #144 `31aa352c45a33d6832612884b0fea38e39b5cf8d`，A #143 `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` 为此次取样。
- `B1-plan`：#142 已验证旧切片 SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，`review-template-plan-adapter-v3-b1.ts` + test；immutable Plan、2 target × 6 Check、unknown/sourceVersion、模块依赖/digest 与删除 ACK；`READY_FOR_ADAPTER`（技术候选预览，不是正式 InstallPlan），C0/1，正式安装需 `B-CR-001` C 决议；I 可先集成无写权编译器。
- `B2-source`：#142 旧已验证 SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，`review-intake-adapter-v3-b2.ts`、`review-source-version-adapter-v3-b2.ts` + tests；单次 owner/sender/frame/generation token、物理 bytes hash、真实 parser 和已验证 SourceIdentity block；`READY_FOR_ADAPTER` 仅独立暂存/解析，真实 Main picker、持久版本/ImportBatch 与 ApplyMaterial `CONTRACT_BLOCKED`，需 B/C/I 分工。
- `B3-router`：#142 旧已验证 SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，`review-intake-routing-adapter-v3-b3.ts` + test；20s 倒计时、唯一明确/用户打断/歧义拒自动选择，不建案；`READY_FOR_ADAPTER`（纯建议），Main 真实输入和用户工作台接线尚未发生。
- `B4-author-ui-assets`：#142 旧已验证 SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，独立 `ReviewV3AuthorWizard.tsx`、`review-template-author-store-v3-b1.ts` + tests、`B4-50-CANDIDATE-SOURCE-LEDGER.csv`；`SOURCE_ONLY`（UI 未挂载、无完整第51套 UAT；G01–08 5/3/10/8/6/9/7/2 全部 candidate-held，50 条目录并非逐义务 Gold）。
- `B2-zip-intake-r02`：source #142 原始新增 ZIP/checkpoint / FileToken 加固源码（可追溯起点 `4985997034a9a1ea9e1f84b6a530137982c019c3`）；新增 `claimArchiveRequest` 将整个 ZIP 物理原件+raw hash 固定到 requestId，阻止“完全不重名的两次 ZIP”混成一个 ImportBatch 源候选；源码入口 `decodeReviewB2Zip`、`stageReviewB2TrustedZip`、`ReviewB2ArchiveVault`，测试包含 ZIP slip、symlink、炸弹、CRC、改版重试、撤权与本地恢复。source #142 新 HEAD `7f34165e1b4e6212c7aafc5513e4880bc7490ca0` **Gate O 未通过新 SHA**，`SOURCE_ONLY`，不作为正式 ApplyMaterial/ImportBatch。
- `B1-51-author-trial-main`：source #142 同新 HEAD，`ReviewV3AuthorWizard.tsx` + `review-v3-author-trial.ts` + `review-template-author-main-port-v3-b1.ts` + tests；UI 增加数值/日期/enum/boolean 样例、unknown/applicable/not-applicable 技术试跑及候选声明导出，样例和 frozen Plan 草稿隔离；Main-only Save/Preview/Freeze 注入真实 principal/授权 callback，伪造作者身份拒止。不修改共享 IPC、Preload 或 CurrentCase；`SOURCE_ONLY / PENDING_NEW_CI / NOT_MOUNTED`，正式第51套 UAT 未运行，I 可准备无权预览胶水。
- `B2-import-ledger-r03`：PR #142 SHA `a18bdad78a7e048626c964b3df2f1a6b41b9791b` 新增持久逐文件 ImportBatch 输入账和只读 C 候选交接，带 archive/file hash、Subject、确认 receipt、revision CAS、请求幂等与重启重认证；`SOURCE_ONLY / NEW_CI_QUEUED`，不是 CurrentCase/SourceIdentity/ApplyMaterial，详细接口见 `B2-INPUT-LEDGER-AND-MAIN-HANDOFF-R03.md`。
- `B4-50-lineage-r02`：B owner，#142 HEAD `ab09bae322cffce7449c15e1eb863eaa22503ab5`；固定 #97 `b68443b23293b4714e61a3b81383d3d3a56434fc` 的 G01–G08 50 workspace，逐 Check/task/sourceBinding **3,875** 条，0 孤立/缺 source，34 条 G01 缺显式对象/全案 scope，来源适用性仍 unknown（4,163 条 source link）。独立原始 Markdown 证据分级：9 套 Git Blob 按固定预期核对（G07 7 套按原 manifest 历史 SHA 取回），1 套 Git Blob 仅观察，40 套仅 manifest/catalog SHA256 元数据无本轮原始字节重核。新增 8 域 JSON + CSV/缺口账 + validator/2 组 Bun 测试及 B4-R02 报告。**SOURCE_ONLY / NEW_HEAD_GATE_O_PENDING**，全部 `candidate-held`，不得当 policy/Gold published；I 新 CI 通过并锁定 SHA 后才可技术集成此切片。
- `GATES`：旧 B SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 的 PR CI / D2 / Baseline 各 SUCCESS（仅旧 B1/B2/B3 技术切片），供 #147 I1 原始锁使用。新 B SHA `ab09bae322cffce7449c15e1eb863eaa22503ab5` PR CI `39247377820` / D2 `39247377819` / Baseline `39247377814` 本次观察 QUEUED，`Gate O=NOT_YET_ATTESTED_NEW_SHA`，不得复用旧 PASS；Gate E=NOT_RUN（Electron/Office/损坏恢复），L=BLOCKED_NO_AUTH（校规/来源原文/学校身份与 Gold），P=PARTIAL（50 套原始业务无损性需独立 L/P 及第51套用户UAT）。

- `BLOCKED`：Dev-C 已在本文件 C 裁决区批准 `B-CR-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`：B-0 技术候选可集成，B-1 Main owner/picker 方向、B-2 C 独占 ApplyMaterial/InstallPlan 命令方向获认可；**尚无正式可信 Main handlers、publisher/Gold 许可或 I C 文件租约**。`B-3` 真实 Native/Electron/Office、100 案/500 文件、逐责任50套及第51套UAT未达标；本地 ZIP archive checkpoint 仅原件恢复候选，不等于完整 ImportBatch/CurrentCase receipt。

- `NEXT`：集中补齐当前 SHA typecheck/Bun/boundaries 首败并固定真实 CI；保留 34 条作用域不明及 40 套未独立取得原始字节的来源缺口，优先推进 B4 独立原文/Gold 来源复核及 B2 Office71 真实解析差分；第51套技术作者 UI/试跑已实现但未挂工作台、未 UAT。I 继续固定旧 B0 绿色切片集成 #147，不浮动换本 B4 新 HEAD；C 独占正式 Main/Plan/Material/Policy 发布。详见 #142 `B4-50-OBLIGATION-COVERAGE-R02.md`。
<!-- END:STATUS:B -->

### C — Owner: Dev-C
<!-- BEGIN:STATUS:C -->
- `COORDINATION_VERSION`：`V3-ABCI-GOVERNANCE-R01/V1.0`；C 已对 `CR-A-001`、`B-CR-001` 按端口作**批准规范/暂缓实施**的分层裁决，首次 I1 **技术-only 锚点**为旧绿 `31aa352c45a33d6832612884b0fea38e39b5cf8d`。见第 9 节，其他线的 ACK 保持其各自原状态。
- `SOURCE_HEAD`：#144 最新 C1 受限工程提交 `5b5c2d8b2fc0b9b73ed70cac2d64fff3bc0c5cc2`，尚无对应完整 PR CI 完结。旧已绿事件合同 SHA `6a9de1ecc4d8d24dc1c29935230b28a579f997df`、C1 锚点 `31aa352c45a33d6832612884b0fea38e39b5cf8d` 仍各按原限定可信。
- `DELIVERED`：C1 原生案卷优先、材料归档当前效力撤销、内部 Plan 绑定/升级；新增 C-owned `review-v3-execution/1` 共享 proposal DTO（不改变冻结 C0）、技术事件可信校验器与合成负例。这里只是输入合同层，**没有实现 C2 正式 Run writer、A Host 到 C Main 的真实联通或 B 正式 Main intake**。
- `BLOCKED`：C1 完整写路径未收口；C2 Run、C3 Batch、C4 事务/Outbox、C5 工作台均未完成。A 新版本事件消费者、B 正式 policy provenance verifier 和 Main Picker/ApplyMaterial/InstallPlan 都需 C 后续实现；缺少校方授权 Gate L 不可达。
- `GATES`：旧锚点离线 CI success (上述四个 workflow)；上一已绿 C 合同 SHA `6a9de1ecc4d8d24dc1c29935230b28a579f997df` 的 PR CI 因 Host receipt 类型收窄失败，已于 `6a9de1ecc4d8d24dc1c29935230b28a579f997df` 修复；**当前精确 SHA PR CI `39240944254` SUCCESS**，全仓 typecheck/boundaries/主进程+预加载+渲染构建及 Bun **4012 PASS/5 SKIP/0 FAIL**；**C1 本批新 SHA `9857471...` 的 Gate O 未验证（CI QUEUED）**；其他专用 workflow 仍以实际结果为准；I1 联合 Gate O、Gate E、Gate P `NOT_RUN`，Gate L `BLOCKED_NO_AUTH`。本协议裁决不等于代码/产品验收。
- `NEXT`：首先核对新 SHA 的 PR CI、专用 workflow，修复任何首败；继续 C1 原生优先建案/兼容读视图/持久恢复的完整迁移，且不跳过旧版 UI 的用户流程，之后再签新 I 锚点；并推进 C2 唯一 ReviewRun writer。I 只集成已授权的技术切片。
- `I0_REVIEW`：[#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146) @ `c84f575addcbb1f36b5eff0acb27442b91073fa1` 已由 C 按旧锁定输入和 3 个精确成功 workflow 签 `I0_ACCEPTED_SCOPED`；I1 技术只读接线准入 `GO`，**I1 联合 Gate O 仍 NOT_RUN、正式 writer/发布仍 BLOCKED**。I 须自己更新 I 进度区与另建 I1 锁。
- `C1_LEGACY_ENTRY_GAP`：继续开发时核查确认，正式 Main `review-ipc.ts` 的旧 `CREATE_CASE` 仍先调用 V1 `createEmptyCase` 写 legacy `case.json`，随后 `ensureWorkspaceAggregateV2` 再转投 V2；旧 `UPDATE_CASE_SETTINGS` 也仍写 V1。即使当前 `workspace-service-v2.ts` 保护了原生 V2 不受旧投影覆盖，**尚未完成「所有新增案卷只有一个权威写入口」**；不得把 C1 只凭已有回归标为完成。下一批 C1 需以现有 Renderer 用户流程兼容为前提，将这些 V1 Main 意图转译到 C0 Main-trusted native typed commands，旧案只读影子/显式迁移，集中覆盖同 ID、重试、人工确认与失败不变性，禁止简单关闭 V1 来假达标。- `C1_LEGACY_ENTRY_HARDENING_R01`：#144 @ `9857471b07e79537bb86d956c5a53c324771ad96` 实际新增 Main frame 可信校验（旧 `CREATE_CASE`/`UPDATE_CASE_SETTINGS`）、`case-store.updateCase` 对 native V2 同 ID 或损坏 state fail closed、已冻结 D2/CanonicalPlan 禁止旧设置静默改模板/规则/材料范围，以及 6 个真实 handler/存储正负例（仅已提交，精确 SHA **CI 尚未通过**）。旧 V1-first 建案、新 UI native-first、其他直接 `saveCase`/跨文件恢复仍未收口，因此 **C1_PARTIAL/RELEASE_NO_GO**。
- `C1_LEGACY_NATIVE_READ_WRITE_DELETE_R02`：C1 后续批次在 #144 实际补强 V1 ↔ V2 硬边界：所有直接 `saveCase` 与 `updateCase` 均阻止 native-only 或 corrupt state 的旧影子写回；旧 `GET_CASE`/`LIST_CASES` 不再把原生 V2 同 ID `case.json` 当作当前案卷（正式 `LIST_CASES_V2`/`GET_AGGREGATE_V2` 仍可用）；旧 `DELETE_CASE` 必须来自可信 Main frame，并在存在任何 `state.v2.json` 时禁止物理删除整目录/Receipt/历史，纯 V1-only 仍可删；`UPDATE_CASE_SETTINGS` 对 native-only 明确提示使用 V2 业务命令。新增/调整真实 IPC、底层读写、损坏聚合、合法 legacy migrated 与删除正反例，**当前新 HEAD `5b5c2d8...` Gate O 未完成，暂不签集成锚点**。遗留高优先缺口：旧 `CREATE_CASE` 依然 V1-first；旧 migrated Case 的正式软归档/撤销与恢复需 C 业务事务落地；其他 V1 mutator 仍需逐个收敛到 C native typed writer，Renderer 旧/新入口分流未整体验收。**C1_PARTIAL / RELEASE_NO_GO**。
<!-- END:STATUS:C -->

### I — Owner: Integrator-I
<!-- BEGIN:STATUS:I -->
- `COORDINATION_ACK`：**ACK V3-ABCI-GOVERNANCE-R01/V1.0@b1ce42b3417dbc939d210354c63c557649cc220f**；只编辑 I 区，遵守 C 的正式裁决及无 C 文件租约。
- `I0_ACCEPTANCE`：I0 [#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146) @ `c84f575addcbb1f36b5eff0acb27442b91073fa1` 已获 C `C-I0-ACCEPT-001 / I0_ACCEPTED_SCOPED`，原输入锁永久保持原史实；不会因为 I1 已获新裁决而改写旧 `CR=PENDING`。
- `I1_CODE`：正式工程 Draft [#147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147) `integration/v3-i1-technical-a-b-c-r01`；当前技术集成 HEAD `09d67ee494481dcc32571c8887ea1326b9a45b36`，以 C 批准 SHA `31aa352c45a33d6832612884b0fea38e39b5cf8d` 为唯一代码父锚点，PR 使用 I 自有 `integration/v3-i1-c-anchor-001-frozen`（指向相同 C SHA）冻结 GitHub 对比基准，不从 #145 docs 或浮动 C HEAD 构建。
- `I1_SOURCES`：A #143 `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`（A1 Owner/A2 C0 proposal/A3 技术覆盖、4 source+4 test），B #142 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`（B1 immutable candidate/compiler/store、B2 staging/actual parser、B3 routing；5 source+5 test）；共**18 个原 Git blob 按路径一对一迁入**，导入 commit `b6e767f0c85eca8e1c83a5420bc31ea8b4533e8f`，source SHA/blob→import 映射见 #147 `I1-SOURCE-AND-CHECKPOINT-LOCK.json`。A/B 最新浮动 HEAD 未被擅自替换。
- `I1_GLUE_AND_NEGATIVES`：I 专有 `review-v3-integration-i1-technical.ts` + 13 项跨线合成测试：B2 bytes→parser-verified block、B1 immutable Plan×source、A3 exact multi-target unknown/technical coverage、B3 20s candidate-held、C1 归档 CurrentValidity、Owner revoke、原件 Subject×Check target 跨界和伪造 Source/Check；所有 API `STAGED_ONLY`、`publicationAllowed=false`、`canInstallPlan/Run/Decision=false`。本批 **23 个变动路径，仅 18 A/B 源文件 + 3 I 自有代码/测试 + 2 I 文档，不修改任何 C-exclusive 文件**；C 新 `review-v3-execution/1` 不属于旧锚点、未导入。
- `GATE_STATUS`：#147 HEAD `09d67ee494481dcc32571c8887ea1326b9a45b36` 已提交、PR workflows 触发 **PENDING_CI/QUEUED（PR CI 39245749145、D2 39245749350、Baseline 39245749040）**（不把旧 A/B/C CI 当联合 PASS）；I1 真正 Gate O `PENDING_EXACT_SHA_CI`，Gate E `NOT_RUN`，L `BLOCKED_NO_AUTH`，P `NOT_RUN`，`C_ACCEPTED_FOR_ENGINEERING=PENDING_C_REVIEW`。工具容器无法 DNS clone 且无 Bun，本轮通过 GitHub 原生 Git tree/commit/PR 完成真实代码组装，不虚称本地 worktree/test。
- `CR_AND_LIMITS`：C 已 `C-I1-AUTH-001 / I1_TECHNICAL_ENTRY_GO`、`CR-A-001/B-CR-001 APPROVED_SLICED_SPEC`，但 **正式 C2 Run ACK/Case installation/picker/Publisher/Batch/Outbox 仍未实现/授权**；没有 C-file edit lease；mock 绝不当业务或学校认可。
- `I1_SECOND_SLICE`：新增 I-only `readI1OwnerBoundBlock`，在 Main-only 技术适配层完成 B2 parser-verified physical block → A1 Owner grant/Source allowlist → A2 before/after-await Host read + C0 event outbox proposals；5 项新正反例含 C1 CurrentValidity 驱动 A1 `isCurrent`、伪 Source/Host、后 await 撤权、local ACK/replay，不代表真正 Electron Main/C2 Run ACK。工程与新增测试同 [#147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147)，当前 `COMMITTED_NOT_VERIFIED`，原 A/B SHA 和 C 锚点未变。
- `NEXT`：跟进 #147 精确 HEAD CI（typecheck/boundaries/build/Bun A/B/C 和 I 联合正反例），I-only defects 修在 #147，A/B/C 缺陷回原 Owner；保留失败证据，Gate O 有证据后向 C 申请对精确 I_SHA 工程签收；后续 C 新锚点采用 blob/patch+行为重放，不丢已接受检查点。
<!-- END:STATUS:I -->

## 11. 四线收到本文件后立即执行的统一动作

1. **A/B/I** 先读最新全文+PR #145 head，确认自身职责和禁止事项，在对应状态区写入 `ACK V1.0@<协调分支实际commitSHA>`；如有实质疑义，保持 `ACK_PENDING` 并提出精确冲突。C 在第 9 节集中裁决，不要求停止无依赖工程。
2. 每线继续原来的工程 PR 和既定开发任务，**不是另起研究或把当前工程改为只写文档**。在自己的工程 PR 完成一个可复验切片后，按第 7 节同步自己的状态区，保持测试证据可追溯。
3. **I** 不等待 A/B/C 轮次对齐，从 I0 开始；按已满足前置条件的 slice 制作 adapter/合同负例。在没有 C 正式批准时保留 `CONTRACT_BLOCKED`，不得用假接口硬接成 PASS。
4. **C** 批准共享合同/委托及集成检查点；I 负责机械集成和联合回归。真实的修改依据签名的代码 SHA 和裁决记录，不根据文档预测已经完成。
5. 无人自动合并 main、删除历史分支、修改受限 Gold、伪造校方授权或降低验收标准。所有四线维持 Draft、NO-GO，直至独立发布门禁满足。
