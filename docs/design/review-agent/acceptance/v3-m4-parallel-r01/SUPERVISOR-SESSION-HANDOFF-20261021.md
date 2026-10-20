# CDUT Studio Review V3｜主会话监督与执行讨论交接 R01

**交接对象**：下一 ChatGPT 主会话（职责为进度监督、技术裁决、开发组织与用户决策支持；**不是** A15 本地执行 Agent，也**不是**第四里程碑的独立调研 Agent）。  
**形成日期**：2026-10-21。**最后复核主线 SHA**：`3d2e0300d92dbe1fc4729a75e8c6e0bc728399ee`。本文件是这一时点的事实快照；下一会话**必须先查最新 main 和 L3 台账**，不得把下述数字当作永不变化的实时状态。  
**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent  
**用户当前选择的工作方式**：Local-L 继续 A15；第四里程碑由**全新独立调研会话先了解上下文和事实核验，不写生产代码、不创建并发子会话**。主会话继续监督、审查结果和讨论安排；等调研报告出来，我们再以它为基线、**分别开开发子会话**。不因等待 S4 而推迟调研；也不因已有 M4 旧任务书就现在强行派发大量代码任务。

## 一、用户最关心的事情以及已经达成的共识

1. 用户不想再经历“无止境研究、架构推倒、重复包装 PR，却连一个真实业务也跑不通”。**真实功能完成度与 Electron 用户旅程**比文档篇数、PR 数量、通过的单元测试数量更重要。
2. V3 使用已实现资产，而不是从零重写。第三轮选定 **增强 V2 CaseAggregate + 边界收敛**；10 月 21 日主会话已负责最小架构收口 **R01**，冻结 Template→RuleSpec/CanonicalPlan→真实 ReviewRun→业务决定的合同。
3. 用户接受“先裁决真实架构矛盾→明确共享合同/可信边界→短路径跑 A15→并行补真实缺口”的方案。但已纠正我们之前的激进做法：**第四里程碑先独立调研、后审查、后按基线开多会话开发**，不要第一轮把理解、研究、拆分、开发和全局协调压到同一个子会话。
4. 用户偏好**以当前代码和真实验收说话、重实证、不做过度防御性编程、只做必要测试**。避免不断新建总账和无用抽象；解释架构问题应说明用户业务场景与代码实际冲突，不堆叠术语。
5. 旧版本/历史 PR 开着 ≠ 未实现；先核对最新 main。区分 `DESIGNED_ONLY / DOMAIN_CODED / MAIN_WIRED / JOURNEY_VERIFIED / EXTERNAL_BLOCKED`，更细如 `PARTIAL`/真实 gate 记录。

## 二、项目架构的当前唯一真值（不再重设计）

**高层链路**：

~~~text
用户/模板负责人
  → T01 TemplateWizardPanel（自然语言草稿 + 人工确认字段/材料/规则/阶段）
  → Published TemplateVersion（绑定政策来源与版本）
  → T04 compilePublishedTemplateReviewPlan → RuleSpec / PlanBinding / CanonicalPlan
  → Main 安装冻结计划，读取已确认 Case 字段/原件版本与 SourceRef
  → 现有 T04 确定性运算 + Pi/RunGraph 执行（分别保持真实执行范围）
  → 唯一 ReviewRunV2（CheckResult / coverage / inputManifest / planFingerprint）
  → T05 按当前真实 Run、模板、Actor、任务判断可执行人工动作
  → 初审、补件/回复、重审、终审、决定、报告/批次/离线交接
~~~

- **唯一业务存储**：`CaseAggregateV2` / `state.v2.json`，`expectedRevision`/CAS 与 Receipt；V1 兼容是投影，不是另外一套 CaseV3 真值。
- **Run 与规则**：沿用 `RunStoreV2`、`RuleSpec`、`CanonicalPlan`；Run completed ≠ 全检查合规 ≠ 自动审批权限。Check 状态必须区分 compliant、non-compliant、awaiting-confirmation/supplement、not-executed/execution-failed。
- **材料来源**：真实原件 DocumentVersion + SourceRef，替换/补交→新版本、新 Run；旧 Run/Decision 保留。
- **审批模式**：D2/B1 的 `technical-pre-review` 不是正式业务许可；本地模拟 reviewer/teacher 可以验证本地两级流程，但**不得宣称获得成都理工大学正式审批身份**。Main 依据可信已发布模板、Plan 指纹和任务/Actor 核实本地模式。
- **分工**：领域 Agent 只写自己的可复用模块/UI；所有共享 DTO、Main/IPC/Preload、正式 Case/Run/决定写入、总集成与 Electron 实机签收均由 Local-L。新并行子会话不能抢占这个边界。

关键代码：
- `apps/electron/src/main/lib/review/case-store-v2.ts`
- `apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts`
- `apps/electron/src/main/lib/review/review-v3-main-template-run.ts`
- `apps/electron/src/main/lib/review/review-v3-t04-published-plan.ts`
- `apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.ts`
- `apps/electron/src/main/lib/review/review-v3-t05-main-service.ts`
- `apps/electron/src/renderer/components/content-review/{TemplateWizardPanel,V2CasePanel,ReviewV3TemplateRuleRun}.tsx`

正式设计/裁决：
- 产品基准：`docs/design/review-agent/{02-product-and-templates,04-acceptance-and-evaluation,06-workflows-and-usability-design,07-application-and-execution-design}.md`。
- 第三轮统一架构候选：PR #140（历史背景，不可无条件覆盖现在 main）。
- 最小核心裁决：**PR #180** / `docs/design/review-agent/acceptance/v3-core-architecture-closure-r01/V3-CORE-ARCHITECTURE-CLOSURE-R01.md`（**仍为 Draft 文档 PR；核心修复却已逐步落入 main**，不要把 Draft 状态当业务未实现）。
- T01–T04 最新集成任务书同 PR #180：`LOCAL-L-T01-T04-INTEGRATION-A15-R01.md`（四份代码都已进 main，历史合并指令不可重复执行）。
- 唯一实际进度台账：**main** `docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md`。

## 三、截至本次交接，工程已推进到什么程度

**main SHA**：`3d2e0300d92dbe1fc4729a75e8c6e0bc728399ee`；主线最新 GitHub PR CI **success**。该版本提交说明本地验证 typecheck 通过、Bun 4,862 tests pass / 0 fail / 5 skip。**这些是回归证据，不等于所有产品验收通过**。

按时间顺序的重要合入：
- 原 V3 T01–T10 产品功能，后续 T01/T02/T06/T08/T05 的加深实现已分批纳入 main；如 T05 可信事务 `63c59d488`、T06 物理入库 Main `bea8df92f`、T01 模型端口 `969cb1cb4`、T08 字段类型修复 `b3311ab51`。
- 架构收口新四 PR：#181 T02 OCR 坐标、#183 T01 人工确认 typed criterion、#182 T04 published-plan 编译器、#184 T03 Run freshness/action gate，**全部已合入 main**。主线已有业务模式/Run 校验修复 `36cb1dcd1303`；T03 领域模块没有重建第二套 Main 执行规则。
- `2a5d08ee8875`：正式 T01→T04 typed ledger 适配（仅确认的 `lte` 无损映射；`gte` 尚 unresolved，不得倒置为 lte）。
- `e3eebc09bd3c`：已发布模板 → 冻结 Plan → 真 T04 Check → **ReviewRunV2 正式落盘**，A15 S2 四案例有真实 Run 证据。
- `3d2e0300d92d`：工作台新增「按模板规则检查」UI 入口，同时完成 **A15-S3-01 两轮补件真机**。

**A15 真实验收状态**（下一会话开工必须刷新）：

| Gate | 当前状态 | 已经证明什么 / 剩余什么 |
| --- | --- | --- |
| S0 | PASS | 最初的模板绑定与无学年建案烟测，不能替代 S1 |
| S1 | PASS | 组织模板、字段、材料槽、双阶段、无学年与二次复用 |
| **S2** | **PASS** | 已发布 owner-confirmed lte20 模板在真 Electron/Main 形成四个 `run-tpl-*`：18 compliant、21 non-compliant、unknown awaiting-confirmation、缺计划书 awaiting-supplement；21 人不得无依据 stage-pass |
| **S3-02** | **PASS** | 真实 Pi Run 关联的初审→本地模拟 teacher 终审、角色拒绝和冷重启保全 |
| **S3-01** | **PASS** | 缺件 → 首次补件 insufficient → 第二次 satisfied → 新 Run completed，旧 Run partially-completed 原样留存 |
| **S4** | **NOT_RUN（截至该 SHA）** | 需要从真实 Electron 普通 UI 一次完成模板/建案/原件/规则 Run/补件/初终审/报告/退出后恢复；单个 E2E 子场景通过不等于 S4 |

**重要区分**：S2 真 T04 RuleRun 与 S3-02 真 Pi Run 的成功证据来自不同旅程，S4 仍应把同一合法模板和业务案卷上的全流程真用户操作串起来，不能将不同测试截图简单相加判定完整产品 PASS。

**可能仍有的非 A15 缺口（需 M4 独立调研证实，不是本文件已冻结的任务清单）**：
- `gte` 数值下限与不同 policyVersionId 的联合含义；多个具体算子在真实同案卷的确定计算覆盖；不同规则来源冲突与人工例外的 UI。
- T02 扫描 OCR 的真实图片坐标、PPTX 图像布局与多格式原件覆盖；OCR 实际依赖须按不同环境验证。
- T06 真实原生文件夹选择器从最终用户界面走完 ZIP/多案/批次与失败回执（此前自动化环境不便驱动原生 Picker）；不能把 mock/单测冒充 OS UI PASS。
- T08 PDF 文件已存在，但属于真实**图片页 PDF**，尚非可检索文字 PDF；助手建议非文本字段与历史 Run 受众导出的完整旅程需按最新 Main 更新检查。
- T07 多评委基本真实评分/定稿与重启已 PASS，不能重新做；T09 离线回件 Main/UI 已接但独立副本和复审往返可能未完整签收。
- T01 六套样例 ZIP 不等于六套不同业务的完整正式 Case/Run/决定/报告 E2E。
- A01–A18、F01–F18/U01–U12、安装包、多格式、100 案/500 文件、独立人工 UAT 的完整证据尚未全部签收。旧 `FEATURE-GAP-MATRIX.md` 使用 2026-10-20 的历史 main，已有多项结论**严重过时**，仅作搜索索引。

## 四、当前有三条不同的工作/会话，严禁混淆

### A. Local-L：当前仍在自主执行（用户已派发）

- 负责 A15 S4 完整 GUI 验收与必要的最后接线、合并、回归；真实进度以最新 main 和 L3 台账为准。
- 不要抢夺 Local-L 的唯一 Writer、Main/IPC/Preload、用户可用的最终决定权限。
- 本主会话的监督职责：在用户询问时读取实际提交和台账，准确定位阻断或反证；若确有必要写短小的 CONTRACT_REQUEST；不让 L 再重做 T01–T10 或从历史仓库代码考古。

### B. M4 **独立调研**新会话：用户最后确认的首轮动作

- **只做 V3 设计与当前 main 对照调查**，弄清架构、完整用户业务流程、F/A/U 覆盖、已实现/已接线/已验收/真实剩余功能、跨模块依赖。
- 输出有源码/最新 SHA/验收证据的**结构化调研结论**；不改生产代码、不合并 PR、不派发开发会话、不自行发起大并发；可指出旧差距表错误。
- 调研完成后**先给用户和主监督会话审查**，由我们决定 M4 正式开发包与会话分工。不可根据早期 M4 PR #186 R01 的“马上拆包开发”指令越权。
- 是否已经启动新调研会话**未获明确确认**；接手主会话不能凭本记录声称它已经完成或正在运行。

### C. 下一主会话：监督与阶段裁决（本文件的接收者）

- 接手“监督 Local-L A15、等待/审查 M4 独立调研、决定下一轮开发组织”的职能，而不是第三个不断写代码的总 Agent。
- 若用户提交新的 Local-L 提交或 M4 调查结果，按最新代码/证据审查、纠偏，再和用户讨论真实进度、优先级、何时并行。
- 下一里程碑不是重新讨论 V3 大架构，而是：**A15-S4 实际验收**与**M4 可证明的剩余产品缺口基线**；两者完成后再多会话开发。

## 五、交接后的第一轮操作（新主会话）

1. 阅读本文件。**最先查询最新 main SHA、最新 L3 台账、主线最近提交**，确认 A15-S4 是否有新结果；若没更新，不要擅自宣称通过/失败。
2. 阅读 PR #180 的 R01 裁决（仅真实合同和边界），理解 Template→Plan→Run→T05；无需重新读 72 项资产考古，除非新差距证据需要。
3. 确认用户是否已把“第四里程碑独立调研提示词”交给另一会话；如果用户直接提供了报告，审查其证据与缺口，**不要求用户重新描述过去**。
4. 在调查未完成前，**不要替调研会话自行派发十条开发包**。可以就用户当前问题作优先级建议、准备缺口复核标准，但不抢调研结论。
5. 调研报告完成时，优先复核：是否以最新 main 为依据、是否继承已有 T01/T02/T06/T08/T09/T07、是否只把真实“未闭环”列为新开发；然后和用户确定适合并发的包，单独开子会话。
6. 之后所有合并/主线变动归 Local-L；主会话负责高阶协调，必要时具体承担一项独立的、不会争夺共享 Writer 的任务，用户同意后再开工。

**本主会话不能替代本地后台进度观察**：无定时任务/持续监控时，不声称可以自动盯代码并在未来主动回报；按用户新指令和当前实际仓库状态主动核查。

## 六、主要链接与单一状态源

| 资料 | 位置 / 特别提示 |
| --- | --- |
| 主仓库 | https://github.com/Fuck-GH-Admin/cdut-studio-review-agent |
| **最新真值** | `main:docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md`（历史段落可能包含过时 BLOCKED，要按最顶部最新段与 commit 解释） |
| **架构裁决 PR #180** | https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/180 — docs-only Draft；核心工程成果已独立进入 main |
| T01–T04 集成文档 | PR #180：`docs/design/review-agent/acceptance/v3-core-architecture-closure-r01/LOCAL-L-T01-T04-INTEGRATION-A15-R01.md`（历史已执行，非待执行新任务） |
| **M4 文档 PR #186** | https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/186 — R01 早期主张立即开发，**本次已修为“调研优先 R02”** |
| M4 研究要求 | 同 PR #186：`docs/design/review-agent/acceptance/v3-m4-parallel-r01/M4-PARALLEL-PRODUCT-COMPLETION-TASKBOOK.md`（参照 R02 版） |
| 旧差距表 PR #163 | https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/163 — 旧 `FEATURE-GAP-MATRIX.md` 仅索引，必须校对新 main |
| 历史统一架构 PR #140 | https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/140 — 可查历次设计原理，但不能回退到候选阶段 |
| A15 真实样本 | main `work/e2e/a15-fixtures/generate.mjs`，A15 test actions 在 `work/e2e/v3-e2e.mjs` |
| 原设计 | `docs/design/review-agent/{02,04,06,07}*.md`，包括 F01–F18 / A01–A18 / U01–U12 |

## 七、不要再犯的错误

- **不**把规划文档、合并 SHA、领域测试、IPC 测试、GUI 完整流程混为同一种验收结论。
- **不**沿用过时的“现在还差 T01→T04 规则编译”“S2 尚未做”“S3-01 未做”等说法：截至本快照二者**均已完成并通过相应实证**；A15-S4 未通过之前仍不可宣称通用产品完全闭环。
- **不**重新起十条同名 T01–T10，或在本地 Agent 独占的 Main 上再开无授权多写入。
- **不**让新的 M4 调研会话承担编码、派发、总架构裁决、合并；那些都是**调研完成后的独立阶段**。
- **不**过度保守地要求一切功能等 A15-S4 才能调查；两条线可以并行，而代码分包是在调查报告审过之后。
- **不**夸大官方权限或真实学校接入，保留本地模拟与校方权限分界。

## 八、用户可直接复制到下一主会话的短启动词

> 继续监督 CDUT Studio Review V3。请先阅读 PR #186 中 `SUPERVISOR-SESSION-HANDOFF-20261021.md`，然后核对最新 main 和 L3 台账。你的职责是接管本主会话：监督 Local-L 的 A15-S4 实机收口，审查新开 M4 独立调研会话的结果，并与我讨论下一阶段如何组织开发。**当前 M4 仅调研，不允许提前拆分并启动多个开发子会话；完成研究后由我们共同确定并发基线。**不重新设计 V3，不重合 T01–T10，不抢本地 Main/IPC/Case/Run writer。请先用一小段话确认你看到的最新主线进度、两线分工和下一里程碑，不要马上大规模开发。

---

**交接结论**：架构裁决已明确；本地 A15 S2/S3 已有分段实证，S4 尚待单趟完整 GUI；第四里程碑被授权**先做独立研究、后定并发**。下一主会话负责持续据真实提交判断，而不是重新发明路线图。
