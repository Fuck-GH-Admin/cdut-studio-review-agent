# CDUT Studio Review V3｜M4 F01–F18 单一提交与协调协议 R01

- 协议版本：M4-F01-F18-SUBMISSION-R01（2026-10-21）
- **开发固定共同祖先：main@5b0f5faf7869ba47a867c9cfaed0bbd1cfdd16b5**。它比上一轮调查的 `3d2e0300...` 领先 1 个提交，涉及 A15 S4/E2E 文件；实际开工应核验祖先和当时的 main 增量，不可悄悄更换祖先。
- **本协议承载分支**：`docs/v3-m4-f01-f18-delivery-r01`（docs-only，**不是生产集成分支，也不是 18 条代码分支的合并目的地**）。
- 既有背景：PR #186（M4 调研与监督交接）和 PR #163（原 T01–T10 十线协议）。二者保留历史身份；以当前 main 源码、L3 台账与本 R01 管理 18 条新交付。
- 本阶段范围：只约定开发协作、代码交付和依赖披露；**不组织合并，不提前执行 A15，不创建开发子会话，不修改 V3 核心架构**。
- 规则生效条件：各 F Owner 需在自己的 Draft PR 明确 ACK 本协议版本与协调 HEAD；仅文档存在不代表 18 会话已接令或实际开工。

## 1. 三层 Git 分支，避免 18 人共写一条源码分支

1. **协调分支（本分支）**：只有这份协议和 18 项交付索引；由主监督/授权协调者串行更新。各 F Owner 只读，不直接修改该分支，不向此分支 push 生产源码。
2. **18 条独立 feature 分支**：各自从上面固定的 main SHA 派生，命名见 §3；每条线只写自己的领域文件和独立测试，允许多次增量提交并推送远端。
3. **每线一个 Draft PR**：原则上以 `main` 为 PR base，用作暂存/代码评审，**明确 NO MERGE**。不要指向 docs-only 协调分支，不通过把 18 个 PR 顺次合到它来“收件”；也不要直接 push main。后续工程 staging、合并顺序、冲突桥接与统一 Electron 验收，待用户单独决策。

所有分支必须记录实际完整 `base SHA`、`source SHA` 和源码相对路径；main 继续变化时不强制重置/rebase，提交本线增量及与新 main 的差异说明。禁止 force-push 重写已被协调表引用的固定 SHA。

## 2. 全体 F Owner 必须遵守的执行规则

1. **一线一项：** F01 至 F18 按 §3 严格对应。先查最新 main、该功能现有代码、旧 F/A/U/C 验收与 L3 台账，区分已验证、已接线、领域已有、需完善、外部阻断。不能把以前 T01–T10 已实现的能力重新造一遍。
2. **必须交可用生产代码：** 聚焦真实功能缺口，允许维护独立 Renderer 面板、领域适配器和必要定向测试；禁止只交 TODO/接口空壳/设计文档/大量防御性测试而无功能。不会因别线未完成而停工。
3. **共享写入只有一个权威：** `CaseAggregateV2`/CAS/Receipt、`TemplateVersion`、`CanonicalPlan`、`ReviewRunV2`、`DocumentVersion`、`SourceRef`、批次和决定，均复用既有体系。禁止 CaseV3/RunV3 第二真值，禁止伪造 Actor、来源、政策发布或学校审批。
4. **共享 Main/IPC/Preload/公共类型不抢写：** 包括 `case-store-v2.ts`、`run-store-v2.ts`、`application-service.ts`、`review-ipc.ts`、`packages/shared/src/types/**`、`preload/index.ts`、正式 Case/Run/Batch writer；涉及多线共用入口的 `ContentReviewView.tsx`、`V2CasePanel.tsx`、`TemplateWizardPanel.tsx` 修改也应由对应主 Owner 或后续本地集成协调，非归属线不要覆盖。
5. **确需共用接口时，交 CONTRACT_REQUEST，别在自己的分支“临时”重设计：** 说明旧接口与真实调用位置、所需函数与完整输入输出/错误、actor 与版本来源、影响路径、最低兼容方案、依赖哪个 F、受阻片段与已完成源码 SHA。等待合同审批时继续不依赖该接口的部分。
6. **本地 Agent 的职责不被抢走：** 当前 local Main Owner 负责共享主进程写入与运行态桥接、最终集成、A15 S4 及 Electron 真实用户验收。新 F 会话可做定向单测和自身 UI，但只能报告实际做过的测试，不能把单测/模拟器/已有 L3 证据冒充新代码 UAT。
7. **品质和实际边界：** 优先实功能与必要质量。模型结果不是确定性规则；技术预审不是本地业务阶段，更不是校方审批；没有学校身份/政策授权/真实 Gold 就标 `BLOCKED_EXTERNAL`，不伪造结果。
8. **交付标准：** 每线 Draft PR 至少说明用户能执行的行为、相对原要求剩余缺口、修改文件、固定 source SHA、已运行命令与结果、实际 UI/领域入口、缺少的共享端口和对其他线的精确依赖。测试不通过须如实标记；PR 创建不代表产品闭环。

## 3. F01–F18 开发所有权和预定提交分支

以下只是**预定名字与责任**，在用户派发前不声明已创建或已开工。旧代码路径按当前 main 核实，不能仅凭名称抢写别线文件。

| Owner | 预定 feature 分支（均从固定 main） | 产品职责 | 对应验收 | 边界 |
|---|---|---|---|---|
| F01 | `feat/v3-m4-f01-first-use-model` | 首次启动/模型能力/安装体验 | A01/A16 | F01 自有启动 UI 与能力检查；共享配置入口仅申请接线 |
| F02 | `feat/v3-m4-f02-template-authoring` | 模板编排/发布/版本/六业务样例 | A02/A15 | 模板作者界面、作者侧规则描述；不重写 T04 或正式 Run |
| F03 | `feat/v3-m4-f03-policy-conflicts` | 多依据/政策优先级/冲突与确认 | A06 | 规则来源与冲突领域模块；不另造 RuleStore |
| F04 | `feat/v3-m4-f04-material-intake` | 原件解析/多格式/物理入库 | A03 | 解析器与材料适配；正式 DocumentVersion writer 由 Main 接线 |
| F05 | `feat/v3-m4-f05-fact-corrections` | 字段事实提取/更正/拆并/版本 | A05 | 事实/修订 UI 与领域模块；不直接写 Aggregate |
| F06 | `feat/v3-m4-f06-evidence-links` | 证据归属/多对多绑定/去重 | A04 | EvidenceLink 领域及视图；共享 SourceRef 不私改 |
| F07 | `feat/v3-m4-f07-review-coverage` | 完整检查/覆盖/状态判定 | A08 | 覆盖判定与规则目标适配；不造第二 Run |
| F08 | `feat/v3-m4-f08-deterministic-scoring` | 确定性计算/分组/评分口径 | A07/A14 | 计算领域函数；Run 持久化/正式评分提交留给 Main |
| F09 | `feat/v3-m4-f09-run-lifecycle` | 一次启动/暂停/重试/恢复/增量重审 | A11/A18 | 执行流程适配与状态读模型；不抢 Pi/Run 共享 writer |
| F10 | `feat/v3-m4-f10-source-workspace` | 三栏/多出处定位/窄屏 | A08/U07 | 原件导航与三栏表现；顶层导航冲突提交接线请求 |
| F11 | `feat/v3-m4-f11-human-decisions` | 人工复核/阶段/业务决定 | A09 | T05 阶段领域与局部 UI；可信身份及业务 writer 只在 Main |
| F12 | `feat/v3-m4-f12-supplement-cycle` | 合并补件/回件/再审核 | A09/U03 | 补件领域动作与 UI；不重复实现 F11 阶段事务 |
| F13 | `feat/v3-m4-f13-appeals` | 撤回/退回/申诉/复审 | A10/U05 | 申诉领域与历史读模型；学校 teacher 权限不能模拟授权 |
| F14 | `feat/v3-m4-f14-batch-review` | 批次/分案/队列/名册 | A12 | 批次输入和队列 UI；Batch 最终提交由 Main |
| F15 | `feat/v3-m4-f15-judge-ratings` | 独立评委/回避/缺评/排名/定稿 | A14 | 评分领域与评委 UI；与 F18 复用既有评分协议 |
| F16 | `feat/v3-m4-f16-report-formats` | 学生/内部报告/MD/PDF/XLSX/JSON/包 | A13 | 格式生成及受众投影；仅从真实当前/指定历史 Run 读取 |
| F17 | `feat/v3-m4-f17-review-assistant` | 本案助手/证据引用/建议审阅与应用 | A13 | 助手本领域视图与 patch proposal；正式修改走旧命令 |
| F18 | `feat/v3-m4-f18-offline-ports` | 学生回件/评委评分包/学校接口适配 | C01-C04/U12 | 离线 codec/差异与接口适配；校方实连外部阻断 |

## 4. 优先记录的已知接口缺口（**证据输入，不自动认领跨线开发**）

- F02 ↔ F07/F08：T01 作者确认数据的 `ownerStatement.enteredBy/enteredAt` 与 Main 桥接读取的 `actorId/confirmedAt` 不一致；A15 S2 的手工 fixture 与真实用户编辑器格式不同。按实际代码修正确切接口，不另造 RuleSpec。
- F02 ↔ F03/F07/F08：T01 编辑允许 `gte`，Main 桥接目前只能无损 `lte`；published template → Plan/Rule ledger → Run 的安装/版本/覆盖要单一语义。
- F07/F09/F11：检查真实 Run 的当前性、全计划覆盖、失败及未执行的动作资格；技术结果 completed 不自动授予阶段通过。
- F04/F05/F06/F10/F17：材料原版/parseRevision/SourceRef 与事实确认/原件定位不能分裂；缺准确坐标必须明确降级。
- F11/F12/F13/F18：本地模拟 actor 与学校可信 teacher 不同，申诉、补件与离线回件必须链接同案历史。
- F14/F15/F18：T09 Main 目前拒绝评委评分回件写入，必须与现有 T07 评分任务、批次冻结和幂等回执对齐。
- F01/F04/F14/F16：打包/完整 OCR、真实 OS 选择器、100 案/500 文件、导出后的实际文件打开等属于联合产品验收，不能以领域测试替代。

## 5. 统一收件索引（只由协调者修改）

状态词：`NOT_ASSIGNED` → `DEVELOPING` → `SOURCE_READY` / `CONTRACT_BLOCKED` / `BLOCKED_EXTERNAL` → `INTEGRATION_PENDING` → `INTEGRATED` → `USER_JOURNEY_ACCEPTED`。
- `SOURCE_READY` 仅表示本领域代码与交付包可审，不是 main merged，更不是 F 产品完成。
- `CONTRACT_BLOCKED` 必须带精确 CR，其他功能继续。
- `INTEGRATED` 必须有本地集成 SHA；`USER_JOURNEY_ACCEPTED` 必须有同一生产 SHA 的实际 UI 验收。主监督者统一维护，不以 PR 文字宣称代替验收。

| Owner | Feature PR | 固定 source SHA | 状态 | 未解决 CR / 跨线依赖 |
|---|---|---|---|---|
| F01 | — | — | NOT_ASSIGNED | — |
| F02 | — | — | NOT_ASSIGNED | — |
| F03 | — | — | NOT_ASSIGNED | — |
| F04 | — | — | NOT_ASSIGNED | — |
| F05 | — | — | NOT_ASSIGNED | — |
| F06 | — | — | NOT_ASSIGNED | — |
| F07 | — | — | NOT_ASSIGNED | — |
| F08 | — | — | NOT_ASSIGNED | — |
| F09 | — | — | NOT_ASSIGNED | — |
| F10 | — | — | NOT_ASSIGNED | — |
| F11 | — | — | NOT_ASSIGNED | — |
| F12 | — | — | NOT_ASSIGNED | — |
| F13 | — | — | NOT_ASSIGNED | — |
| F14 | — | — | NOT_ASSIGNED | — |
| F15 | — | — | NOT_ASSIGNED | — |
| F16 | — | — | NOT_ASSIGNED | — |
| F17 | — | — | NOT_ASSIGNED | — |
| F18 | — | — | NOT_ASSIGNED | — |

### 单份交付回执（各 Owner 写在自己的 Draft PR，不共同写此表）

- Owner / 协议 ACK `R01@<coordination_sha>`；
- 原始共同祖先 SHA、当前 source SHA、变更路径与影响 F/A/U/C；
- 本轮完成的用户行为及具体入口 / 尚未完成部分；
- 单测/静态检查的实际命令、结果和无法运行原因；
- 若依赖共享端口，提出最小 CONTRACT_REQUEST，注明依赖 Owner 和风险；
- 真实标签：`CODED`、`WIRED`、`PASS_SCOPED`、`NOT_RUN`、`BLOCKED_EXTERNAL`，不得与正式产品验收混用。

## 6. 协调更新纪律与后续阶段

- 18 条线的源码和长交接各自在自己 Draft PR；**总协调文档只登记最新有效 SHA/状态/冲突入口**。无需每天抄日志，不允许各线在同一协调文件并发全文覆盖。
- 协调者写入前需重新读取本分支 HEAD 和文件 blob SHA，进行基于最新版本的非强制提交；来源分支更新只替换其对应行。协议修改须提升版本，并通知各 F Owner 在自己的 PR 中重新 ACK。
- 本阶段**不合并任何 F PR**，不预先假定 18 条可以整支 merge。待第一批 SOURCE_READY 出现，由用户决定集成批次和唯一 Main Owner 的桥接；本地 Agent 正在执行的 A15 不被本协议替代。
- 50 套 D4 冻结技术模板、B1 第 51 候选与六个普通用户完整业务样例是三种不同资产，不能因为本轮做 F02 就删除/缩减 50 套历史目录；正式学校发布必须另获授权。
