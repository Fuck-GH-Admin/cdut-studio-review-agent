# CDUT Studio Review V3｜十线并行开发与统一交付协议 R03

**基线**：main @ 24603d87570f157d57c4845d897dc04c4cfe19e9（2026-10-20），每个分支均已实际创建于此 SHA。**产品要求、证据与缺口**见同目录 FEATURE-GAP-MATRIX.md。
**R03 状态**：这是十线唯一共同执行协议，仅修订协作/交付纪律，不擅自变动 R02 的产品功能拆分。规则应尽量轻量，避免为规范本身新增无关开发任务。
**目标**：线上多个会话交付能被主产品调用的实际功能模块及其业务 UI/adapter；本地总 Agent 专门负责共享合同接线、真实端到端运行、冲突归属、合并、定点测试和产品 UAT。模块可单独完成≠原始 A/U 用户旅程已完成。线上会话只提交自身 feature branch 与固定 SHA，不直接合入 main，不自作主张增加一个案卷/Run/审批系统。

## 0. 双轨工作定义

**云端功能会话**：读产品 02/04/06/07 + 本任务书 + 所属 V1/V2/V3 现成代码；**直接开发实际功能**，不要再写调研长报告。每轮提供可复用代码、未接入的依赖端口（若有）、真实 Git commit、对应 A/F/U 条款、明确已完成和未完成行为。静态类型错误可自修，但不必为了数千项旧 CI 或想象中的恶意场景重新造验证框架。

**本地总 Agent**：唯一负责共享 Main/IPC/Preload 入口协调、来自多个功能分支的冲突处理、联测/人工验收、生产 main 合并与回滚；不重新实现分支 Owner 已做的模块。不同分支的 SourceRef/Case/ReviewRun 以 V3 当前合同为唯一真实对象，不能再开第四套引擎。

**每个云端会话提交**：分支 + commit SHA + 修改路径 + 用户操作/实际 UI/API 入口 + 必需的共享 Main 接口（签名/作用/返回/错误）+ 尚未验证事项。尽量编写可被单独导入的模块，跨线写入留给本地总 Agent。

### 0.1 必须共同遵守的起点（适用于所有由本会话分出的子会话）

1. **先领号，后写代码**。每个子会话收到 T01–T10 之一作为唯一身份；不允许自选/兼任第二条线。十条线分别使用第 1 节列出的精确远端分支名，初始共同祖先为 main@24603d87570f157d57c4845d897dc04c4cfe19e9；开始时执行远端 ref/HEAD 检查，记录实际 HEAD。不因其他会话提交而悄悄重置本分支。
2. **共同规范唯一来源就是本文件 R03**。所有会话读取 docs/v3-full-product-scope-r01 上的本任务书 R03 + FEATURE-GAP-MATRIX.md R02，再按需查原 02/04/06/07 和源码。本规范在各 feature 分支创建之后才写入文档分支，**不能误以为本文件已存在于 main/自己的 feature branch**。用户指定的更新裁决高于旧版任务书；产品目标始终以原 F/A/U/C 要求为准，矩阵仅表示旧 main 的已核验证据，不是新功能清单的完成状态。
3. **只写自己分支**。不修改 main，不替其他 T 线提交，不重置或强推远端分支，不整分支合并历史 ABCI 或其他 T 线，不替本地 Agent 执行集成。跨线依赖只能读取其他分支的固定提交（必要时），不得把它的未审代码直接复制或 cherry-pick 到自己的生产提交。
4. **先复用后补齐**。开始前用不超过一页的简表标注该模块的“现有可用 / 仅有源码未接 / 真缺失 / 当前待验证”；阅读与本领域直接有关的 V1–V3 已有模块。仅对真实差距施工，避免把当前 main 可用功能重写一遍，也不拿“旧服务存在”直接冒充 V3 完整闭环。
5. **主线权威不变**。遵循 main 已存在的 CaseAggregate / ReviewRun / TemplateVersion / DocumentVersion / SourceRef 和 Actor 合同。单一 Case/Run/证据版本；技术候选不能冒充学校正式决定；人工业务 Actor 来自可信 Main；任何计算都不能把模型猜测当确定结果。
6. **按用户流程分割职责，不按大文件抢所有权**。各线可提供独立实际可用的 UI 和领域 adapter，不只是纯类型或测试；共享 Main/IPC/Preload/持久写入只能交本地 Agent。缺公共入口先实现能测试的本线模块及明确依赖请求，绝不自己建立平行数据源。
7. **业务完备优先，安全守住现实边界**。保留现有角色/权限与来源真实性，不为了想象中的恶意输入新增多层防御框架、审计平台或无关治理任务。禁止对未授权的校方接口编造凭据；但不得因此停下本地可完成的合法审核功能。
8. **不要为等待别线空转**。本线可在现有合同上完成的部分立刻开发、测试、提交。缺 TXX 业务输入或 Main 端口时，使用薄的领域 adapter / 可验证 fixture，列出准确的 WAITING_FOR_* 依赖并继续本线其他能力。Mock/fixture 的通过不能标成真实用户链 PASS。
9. **不修改共同协调文档**。本轮十线不要在自己的 feature 分支创建一套“统一协议”、修改本任务书、直接修改 Feature-Gap 总表或声称替整个系统更新完成率；发现错误放在交付说明中，由协调/本地集成者裁决更新一个共同口径。
10. **最小可验证增量**。一次交付应当包含真实行为、可测试入口与一次自测，而不只是接口空壳、TODO、报告或大量测试桩。没有必要为了历史未触及领域的旧 CI 失败中断全部功能开发；但不得隐藏由自己改动引发的错误。

### 0.2 统一目录、文件与接口约定

- **仓库目录以真实 main 为准**。Main 业务服务在 apps/electron/src/main/lib/review/；Renderer 审核 UI 在 apps/electron/src/renderer/components/content-review/；共享 DTO 在 packages/shared/ 相关源码。不要凭文档描述猜文件位置；文件缺失先定位历史代码和实际当前调用者。
- **新建文件命名**：建议领域源码使用 review-v3-tXX-<purpose>.ts，同层测试用 review-v3-tXX-<purpose>.test.ts；新组件用 ReviewV3TXX<Purpose>.tsx。**已有模块为修复或继承而修改时保留已有名字**，无须机械重命名或包装转发层。
- **跨线/跨主进程交互**：优先使用 main 已有共享类型和 IPC；不要编辑包级核心 DTO 来适应单线假设。确实需要变更时，在自己模块内先用明确的输入输出边界与适配器，提交一个精确 CONTRACT_REQUEST，由本地 Agent 统一修改共享合同、Main/IPC/Preload。不能用伪造 V3 case/actor/run、随意 any/unknown 强转或在 Renderer 写本地数据库作为“临时可运行”方案。
- **CONTRACT_REQUEST 最小格式**：需求线 TXX；当前代码文件与调用位置；期望函数/事件名；完整输入字段及现有类型复用；输出和错误语义；身份/数据版本来源；为什么现有 API 不够；具体由本地 Agent 修改的共享文件；本线提供的 adapter/测试 SHA。能直接复用现有函数时**不要**提新接口。
- **无权修改不等于无权完成业务**：每条线可改本领域算法、独立适配器、本领域界面及局部测试；只将最小共同写入入口交由 L 线。所有业务语义（例如评分口径、模板字段、两级阶段、学生补件）仍由相应 T Owner 提供，L 不能替其发明。


## 1. 十个可并行的模块 Owner（共享合同须协调）

### T01｜模板负责人完整编排、六样例与第 51 套通用业务
**分支**：feat/v3-full-t01-template-authoring  
**对应**：F02/F03，A02/A06/A15，U08。**优先级 P0**。  
**复用**：TemplateWizardPanel.tsx、ReviewV3AuthorWizard.tsx、review-template-plan-adapter-v3-b1.ts、template-store.ts、review-v3-main-b1-local-plan.ts、D2/D4 库。  
**实现**：统一“选择模板→复制/自建→业务对象与字段→材料槽→规则/条件→评分或无评分→自检/初审/终审等流程→试跑→冻结/发布本地可用版→安装案卷”的真实业务能力。把“学年非通用必填”“B1 固定 document/单一 manual-review”列为需主 Agent 配合修正的接口请求。注意学年不仅在 Renderer：native-workspace-case-v3.ts 的建案 Main 也要求非空；不可只隐藏输入框。负责可配置的对象/字段/规则/阶段表达及试跑；A15 的两级**业务执行**由 T05 实现、本地总 Agent 安装到唯一 Case 后与 T10 联合验收。不得把 B1 technical-pre-review 当作正式发布模板。  
**隔离边界**：Owner 编辑自有作者/模板 UI 与 compiler 适配；不要擅改共享 V3 案卷写入和公共 TemplateVersion schema。若变更共用合同，给本地 Agent 接口补丁。  
**验收样例**：创建实验室申请（组织、人数、时间、计划附件，人数≤20，无分数）→试跑/保存/新案卷可重复使用；6 套完整业务样例的配置能力要逐项对照，不要把 D4 50 technical candidates 当最终六模板完成。

### T02｜多格式材料与真实来源
**分支**：feat/v3-full-t02-material-parsing  
**对应**：F04，A03/A16，U01/U07。**优先级 P1**。  
**复用**：document-service、document-capability-library、ocr-port、PDF/parser、B2 ZIP/import-ledger、source-index、material-service。  
**实现**：PDF/扫描/图/Word/Excel/CSV/PPT/TXT/MD/ZIP 的真实登记、部分读取/失败、页/块/表格/图定位、同名与版本、不静默漏图/页。重点是可观察的材料/来源状态，不做额外通用恶意输入框架。  
**边界**：解析和 source descriptor 自身，不改 Case writer 和全局拖拽 IPC。  
**验收**：含扫描图、12 张图片、两个同名文档及 XLSX 的真实材料一案：每份真实来源可见、无法解析明确标部分或失败。

### T03｜事实提取、证据归属与人工纠错
**分支**：feat/v3-full-t03-facts-evidence  
**对应**：F05/F06，A04/A05，U02。**优先级 P0**。  
**复用**：evidence-service、source-current-validity-v3、ObservationConfirmPanel、input-invalidation、CenterPanel、B4 object isolation。  
**实现**：事实/事项提取→候选证据多对多绑定→人确认/纠错/拆并→新原件版本失效→按受影响范围重审。0 分为有效值；跨学生歧义不能自动绑定。  
**边界**：写纯粹业务 action/adapter 与 UI，Main 的统一 CAS writer/IPC 变更请本地总 Agent 接。  
**验收**：两学生/三证明/一个跨人同名冲突，人工更正后能看到重新计算的待审范围和旧历史。

### T04｜规则编译、多依据与确定评分
**分支**：feat/v3-full-t04-rules-scoring  
**对应**：F03/F07/F08，A06/A07/A08。**优先级 P0**。  
**复用**：deterministic-engine、workspace-rule-compiler、effective-rules、policy-store、coverage-ledger、D2/D3 runtime。  
**实现**：且/或/非、例外/政策冲突、分组择高/互斥/共享上限、权重、舍入、金额/币种、日期、未知值，作为同一 Plan 的确定性检查项；不要把模型输出作为可计算真值。  
**边界**：独立规则/Plan adapter；与 T01 的 DTO 使用当前版本，不同时编辑其作者组件。  
**验收**：04 §3 D04–D07、D09 数值与冲突样本能得到解释得通的来源、计算明细和待处理状态。

### T05｜本地合法业务决定、补件、复审、申诉
**分支**：feat/v3-full-t05-human-workflow  
**对应**：F11/F12/F13，A09/A10，U03–U05。**优先级 P0**。  
**复用**：workspace-business-service-v2、business-workflow、stage-workflow、V2CasePanel 及补件服务。  
**实现**：把“技术候选不可假冒学校批准”与“本地业务负责人能作真实**本地**决定”分清；实现事项/案卷决定、人工误报/例外、合并补件、学生回复→核对不足/满足→受影响检查重审、撤回/申诉/复审，历史不可改写。  
**边界**：云端开发业务动作纯函数、阶段模型和独立视图；正式 Case/Run 变更、Main 身份生成与校方认证由本地 Agent 最终接入。**禁止直接删除 AGENT_DECISION_DISABLED 或伪造学校身份。**  
**验收**：A09/D08 中第一次补模糊图不通过、第二次补清晰图满足；具名 local reviewer 形成**本地**终审并能被学生复审，历史完整。T05 不得把 D2 的技术结果伪装成正式校方决定；原 V2 服务已有部分状态动作，先接旧事务再补 V3 阶段合同。

### T06｜批次、分案、100 案/500 文件
**分支**：feat/v3-full-t06-batch-intake  
**对应**：F04/F14，A12，U09（批次侧）。**优先级 P1**。  
**复用**：BatchPanel、batch-store、batch-automation、batch-group-action、B2 ZIP/ledger、case creation。  
**实现**：表格/文件夹/ZIP 预览→按对象分案→人工修正错绑→队列/过滤/暂停/重试→汇总/批量确认；每案独立 Run，坏案不阻断全批。  
**边界**：批次规划器/队列 UI 独立；批次确认所需真实 Case writer/IPC 交本地 Agent。不要改 T02 parser 核心。  
**验收**：本线先交可复用的分案/队列/汇总能力与用户入口；100 案/500 文件是本地总 Agent 最终联合压测门槛，非未接入主 Case/Run 时单模块可宣称完成的结果。不能批量批准未审案。

### T07｜评委独立评分、匿名、同分与名额
**分支**：feat/v3-full-t07-judge-review  
**对应**：F08/F15，A14，U09（评委侧）。**优先级 P1**。  
**复用**：judging-service、rating-service、review-agent-assignment、offline-roundtrip 中的 judge rating 格式。  
**实现**：分配/回避/替补、量表独立提交（缺评与 N/A 不为 0）、匿名原件视图、加权/分歧/同分、达到人数才能定稿；兼容 T09 的离线包协议。  
**边界**：新评委 UI 和评分/汇总 adapter；不改批次总事务与共享 Actor。  
**验收**：04 D11 两有效评委、一回避，4.10/5→82.00，缺一评委不能定稿；匿名独立包不显示其他评分。

### T08｜案卷内助手、原件导航与报告矩阵
**分支**：feat/v3-full-t08-assistant-reports  
**对应**：F10/F16/F17，A08/A13，U07/U11。**优先级 P1**。  
**复用**：AssistantDrawer、SourceBlockView、RightPanel、review-source-focus、report-service-v2、report-export-v2-service、offline-roundtrip audience projection。  
**实现**：V3 当前 Case 的引用直接点到真实原件/页/表格，答案引用可导航；助手修改建议先成为用户可审阅的 patch；学生/内部/评分/批次 MD/PDF/XLSX/JSON/交接格式按角色输出，保留固定 Run/decision 历史。  
**边界**：助手内容投影、只读结果 UI 和格式生成，不碰主工作台导航与共享 IPC。  
**验收**：一份带多出处的实际 V3 Run，从 AI 问题卡跳回正确原件，输出的学生版不含内部意见，历史报告不混入新版本。

### T09｜离线回件/评分包与校方接口替换
**分支**：feat/v3-full-t09-offline-ports  
**对应**：F18，C01–C04、U12；S01–S03 外部等待。**优先级 P1**。  
**复用**：offline-roundtrip、external-ports、report-service-v2 中的 handoff 包。  
**实现**：学生独立副本补件、评委独立副本评分、导出包→读写→导入本案、同 actionId 幂等、旧版差异与冲突；对 MockSchoolAdapter 与 LocalPackageAdapter 实际契约作兼容。校方真实连接只保留适配点，不捏造外部凭据。  
**边界**：离线包 codec/adapter 自有文件，正式应用写入统一交本地 Agent；与 T07 对齐评分包 DTO。  
**验收**：两独立本地副本真实往返一次补件和一次评分包；重复/旧包不覆盖新结果。

### T10｜统一 V3 用户工作台与角色流
**分支**：feat/v3-full-t10-product-workspace  
**对应**：F01/F02/F09/F10/F11，A01/A08/A15/A18，U01–U12 导航。**优先级 P0**。  
**复用**：ContentReviewView、V2CasePanel、ReviewV3LocalCandidateWorkbench、Left/Center/RightPanel、review-atoms、B 工作台。  
**实现**：让用户从唯一 V3 案卷视图进入模板/来源/检查/待办/人工流程/批次；旧 V2 功能按当前 V3 案卷投影复用，不暴露“V2 另一个产品”。把学年改为按模板条件字段；最终页头统一展示材料/检查/业务三种状态、当前模板/Run 与下一步。  
**边界**：只拥有导航/展示/Presenter/ViewModel；不能改 T01 作者/模板规则、T02 parser、T05 正式业务存储。需要新 IPC 写精确接口请求给本地 Agent。  
**验收**：用户从主导航操作 A15 组织实验室申请，不再需要理解“V2 案卷”和“本地候选”的内部技术命名；保留历史功能的兼容读取/原生 V2 聚合权威，不能因整理入口另建存储或删去仍可用的旧组件。下一步动作明确、无 JSON 开发字段。

## 1.5 易混淆边界与最小跨线合同（R02 校勘）

**现有源码结论**：`main@24603d87570f` 的原生 V3 建案 Main 强制学年；B1 shell 是 document+单 manual-review 技术候选；V2 已有业务决定/补件/申诉的代码；D4 50 套是 candidate-held 技术方案，非最终六套通用业务模板；实机 60 个 Check 已执行，其中 2 个形成判断、58 个 pendingChecks，后者不能直接转换成 58 条待办。

共享接口只需要在开发前确定**必要数据含义**，不要为了此项再建评审委员会、第二个 Agent 治理系统或大批防御性测试。涉及下面四条协作关系时，线上提交明确的函数/DTO 建议，由本地总 Agent 统一决定并连接：

| 协作界面 | 产物责任 | 本地总 Agent 的接线责任 |
| --- | --- | --- |
| T01 ↔ T04 ↔ T05 | T01 定义可配置业务字段/阶段与模板视图；T04 编译规则并确定计算；T05 实现有权本地业务阶段与决定 | 统一 TemplateVersion、Stage、Rule/Plan 的合法含义；通过现有 CaseAggregate 命令持久化，不让技术预审取得校方审批权 |
| T02 ↔ T03 ↔ T08 | T02 真实原件/解析 SourceRef；T03 事实、归属、纠正与失效；T08 引用定位及报告 | 保持同一 DocumentVersion/SourceRef 和 Run 快照，不凭虚构块 ID 定位 |
| T05 ↔ T10 | T05 提供业务动作/任务状态与独立面板；T10 提供统一入口和页面呈现 | Main 上具名 local actor、合法阶段/任务调用，不重造 Case 或把 V2 入口一删了之 |
| T06 ↔ T07 ↔ T09 | T06 批次/队列；T07 独立评分；T09 学生/评委包编解码 | 复用唯一 Batch/Case/Run writer，将离线返回的 actionId、版本、任务提交为正式本地命令 |

**完成状态分两层**：线上模块只能声明“功能代码与自身 UI/adapter 已交付，待 Main 接入或联合实测”；本地总 Agent 按 A/F/U/C 真实操作签收后才声明“V3 产品能力闭环”。不得以已存在的 V2 函数当作 V3 全链通过，也不得把缺 Main 桥接归咎为该业务从未实现。


## 1.6 十线文件所有权清单（允许修改与禁止抢写）

以下是 **Owner 对产品代码的归属**，不是限制合理新增文件的白名单；新文件归相应领域。发现一个旧文件跨域混合功能时，只允许修改本领域独立段落且无其他线并发修改；否则抽出独立组件/adapter，让本地集成者处理公共文件。

| 线 | 优先修改的现有模块或独立新增组件 | 不得替别人修改的范围 |
| --- | --- | --- |
| **T01** | TemplateWizardPanel、ReviewV3AuthorWizard、review-template-author-store-v3-b1、review-template-plan-adapter-v3-b1；自身模板作者/编排/试跑 UI | T04 规则执行核心、T05 审批执行、T10 顶层导航；共享 TemplateVersion、主进程安装入口提交需求而非直接改 |
| **T02** | document-service、document-capability-library、解析/OCR/ZIP staging、review-source-version-adapter-v3-b2；物理来源解析适配 | T03 事实证据归属业务、T08 来源展示/报告、共享 Case material writer |
| **T03** | evidence-service、ObservationConfirmPanel、review-v3-b4-* 的事实/证据语义、证据纠错与失效独立模块 | T02 文件解析、T08 SourceBlockView/导航、共享观察值落库事务 |
| **T04** | deterministic-engine、规则计算/有效规则/冲突解析、独立 Plan compiler/测试 | T01 模板作者 UI、T05 阶段执行、核心 CanonicalPlan 全局类型 |
| **T05** | business-workflow、stage-workflow、局部补件/决定/复审业务动作及独立业务面板 | T10 ContentReviewView、Main 中 workspace-business-service-v2 的正式 writer/权限判定、Actor 核心 |
| **T06** | BatchPanel、独立分案/队列/批次适配器、batch-automation 的本领域算法 | T07 评委模块、T09 离线 codec、batch-store 的权威写事务 |
| **T07** | judging-service、rating-service、独立评分/匿名/名额 UI 与适配器 | T06 BatchPanel 总入口、T09 offline-roundtrip codec、共享身份和批次 writer |
| **T08** | AssistantDrawer、SourceBlockView、report-service-v2、report-export-v2-service、只读来源呈现与报告 UI | T02/T03 来源真值和归属、T10 ContentReviewView 总导航、公共导出 IPC |
| **T09** | offline-roundtrip、external-ports、本线离线包 codec/版本/冲突适配 | T07 评分业务规则、T05 补件业务决定、Main 导入后正式提交事务 |
| **T10** | ContentReviewView、CaseManagerBar、CreateCaseDialog、Left/Center/RightPanel 的导航和 ViewModel 组合 | T01 作者表单、T05 审批内核、T02 解析与 T03 证据内核；建案 Main 学年约束交 L |

**L 线独占最终写入 / 生产总装**：apps/electron/src/main/lib/review/review-ipc.ts、apps/electron/src/preload/index.ts、apps/electron/src/main/index.ts、apps/electron/src/main/lib/review/native-workspace-case-v3.ts、case-store-v2.ts、正式案卷/Run/Batch 提交路径、可信 Actor 授权入口、packages/shared 中多线共用的核心业务 DTO，以及 main 合并。T10 负责统一 Renderer 顶层导航的产品设计与代码；L 只负责把 T10 产物与其他组件接进真实运行环境，不另做一套竞争 UI。即使上表某旧模块被两个路径复用，也不因此允许跨 Owner 改写其业务语义。

**旧代码交叠的处理顺序**：①先读本线现有功能是否能直接调用；②可独立修的在本人负责的模块里修；③只能改共享文件时，开发本线 adapter + 精确 CONTRACT_REQUEST；④由 L 定向接线。如果阻碍本线的只有一个公共字段/端口，不要因此停止其他本领域施工。

## 2. 推荐并行批次（按实现依赖，不要求所有会话齐步走）

**第一组可立即并行：T01、T03、T04、T05、T10**。T02 也可同时独立扩展解析。  
**第二组并行：T06、T07、T08、T09**，它们已有独立服务代码，等相应契约对齐即可由本地 Agent 接入主线。  
**优先做产品功能，不拿旧代码测试数作吞吐指标。** 后续专项签收由本地 Agent 做，它先接最短完整业务：A15 的“通用业务新建→处理→本地决定→报告”，再扩展 A09/A12/A14 等全套能力。已有 50 D4/单案 Pi 实证底座不得退化。

**易冲突的中心点**：CaseAggregate/ReviewRun/Decision/TemplateVersion 核心类型、review-ipc.ts、preload/index.ts、main/index.ts、case-store-v2.ts、统一业务事务/产品导航整合，**由本地总 Agent 独占最终修改与合并**。各线上传可调用 API/adapter + 需求签名；主 Agent 执行 bridge。T01 与 T10 之间“作者表单 vs 通用导航”由各自负责，T05 不写 T10 的顶层 ContentReviewView，T06/T07 不并发修改同一 BatchPanel 页面：T07 建立评委自己的面板/Adapter。


## 2.1 所有 T 线采用相同的实际开发和提交节奏

**领取任务（一次）**：确认本人 T 号、精确 branch 与当前 HEAD；读取 R03、矩阵 R02、原 A/F/U/C 和所负责的旧源码；用 5～10 条简短事实确定真实缺口。检查 main 新进展**只读**，不在本人分支私下同步 main 导致别人依赖的 SHA 改变。

**一轮开发（可重复多轮）**：选择一条本线能够展示价值的纵向切片（例如“材料登记后出现精确来源状态”），优先接已有代码，直接修改领域源码和 UI/adapter；仅编写覆盖变更行为的定向测试。内部可多次 commit，推送时给出这轮最终 SHA；下一轮从自己上轮 SHA 继续。不要把全部功能攒到最后一次大提交，也不要为了“先交一份研究”而停工。

**自测要求**：根据修改选择 bun test --isolate <本线相关测试文件>、bun run typecheck（或指定 workspace typecheck）、bun run check:boundaries 中相关命令；记录真正运行的命令及结果，命令未运行写 NOT_RUN。旧全仓失败必须区分“基线已有”与“本次引入”；本地 L 最终完成 OS Electron/E2E、跨线冲突、整仓编译与真实 Provider/人机操作验收。不能为了 CI 绿而删旧测试/绕过原功能。

**交付方式**：只能 push 自己的 feat/v3-full-tXX-* 远端分支；首次有实际功能代码后可创建一个面向 main 的 **Draft PR** 供 L 读取及分批 cherry-pick/合并，不得自行合并。后续持续向**同一分支和同一 Draft PR** 追加，不因每轮批次新建额外分支/PR。PR 的目标是交付可集成代码而非代替本地产品验收。

**共享依赖**：交付时把所有 CONTRACT_REQUEST 放在同一 Draft PR 描述或最终回复中，**不得附带尚未同意的共享源码变更**。需求可以在一轮内多次修订，L 以明确的 SHA+字段版本为准。需要对 T07/T09 等协议方同步时，写精确字段和含义，使用 PR 交付摘要给对方引用；不共享可写工作树。

**基线变化**：若 L 合入 main 或变更共享类型，本线先记录“原基线、L 提供的新合同 SHA、当前个人 HEAD”；由 L 明确安排同步方式。没有 L 的明确同步指令，**不要自动 merge/rebase main 到个人开发分支**，更不要 force push 覆写既有交付。允许继续做不依赖新基线的独立切片。

**单轮固定汇报字段**（不需要写长报告）：
- T 号 / 功能范围 / 源分支 / 本轮 commit SHA / 对应 Draft PR（若有）
- 这轮**新增的真实行为**、实际 UI/API 入口；对应 F/A/U 编号
- 修改文件（区分新文件和旧模块）及继承的旧实现
- 自测命令及结论；没有跑的明确 NOT_RUN
- CONTRACT_REQUEST（没有写 NONE）与 WAITING_FOR_TXX / WAITING_FOR_L（没有写 NONE）
- 完成级别：**CODED**（写了代码未验证） / **MODULE_VERIFIED**（定向测试或可操作模块） / **INTEGRATED**（L 真正接入 main） / **PRODUCT_ACCEPTED**（L 真实用户流程验收）。**云端会话只能自行宣称前两级**；不得因 Draft PR、单测或 mock 伪装后两级。
- 下一轮仍属于本人范围内的具体工作（一句话）。


## 3. 十份会话的统一启动约定（每份只换 T 号）

新会话必须收到明确的 **T01/T02/.../T10 身份**。如果用户只是复制这份协议却没有标明身份，先确定本会话对应 T 号；不能自主同时领取空闲模块。每条线只查第 1 节对应的那一个分支与任务。

**所有会话共同的开工指令**：

你是 CDUT Studio Review V3 的 TXX 功能 Owner。仓库 Fuck-GH-Admin/cdut-studio-review-agent。请先读取 docs/v3-full-product-scope-r01 分支中的 PARALLEL-IMPLEMENTATION-TASKBOOK.md **R03** 与同目录 FEATURE-GAP-MATRIX.md **R02**；然后阅读原产品 02/04/06/07 中与本 T 号有关的条目和当前 main 的真实代码。使用第 1 节规定的精确 feat/v3-full-tXX-* 分支，在原有分支 HEAD 上开发，不自建新生产分支。按第 0.1、0.2、1.6、2.1 节严格遵守共享数据合同、文件归属、依赖请求、提交与自测格式。**重点是把用户可操作的真实功能补齐**，优先继承 V1/V2/V3 旧实现。不要改核心 Main/IPC/Preload/Case writer，不另造业务引擎，不自己把 PR 合入 main，也不要为了缺共享入口而放弃本线能完成的功能。真正需要 L 接线时提交最小 CONTRACT_REQUEST。实际完成一轮后把代码 push 到自己的远端分支，并按第 2.1 节的固定字段汇报。你负责模块功能，L 负责统一桥接、合并及产品级签收。

**十份会话各自开头只需加一句“本会话身份=TXX，执行第 1 节对应任务”。** 文档链接、分支名、共同规则均不得由各会话自行改写。不要发送同一份没有 T 号的模糊指令给十个分支。

## 4. 本地总 Agent 的最终唯一签收

1. 开一个不与各会话共享写权限的 integration worktree；记录当前 main 和十个功能来源各固定 SHA。
2. 哪个独立功能真实可调用，先导入哪个；缺 Main/IPC 端口主 Agent 统一最小桥接，绝不替线主重写完整模块。
3. 按 04 A01–A18 + 06 U01–U12 + C01–C04 一项项真实用户场景签收，记录 PASS/PARTIAL/FAIL/NOT_RUN；本地单案 Pi 60/60 executed 且 58 pending 不计完整业务案卷通过。
4. 同一 V3 Case 完成至少三条真实旅程：**A15 通用组织申请全流程**、**A09 补件到本地合法决定及复审**、**A12+A14 批量/评委评分定稿**，以及报告/离线包/重启。各子功能通过后再整体验收剩余边界。
5. 仅本地 Agent 处理所有冲突、编译错误、旧断言、OS E2E 与最终 main fast-forward/merge；不要 force push。学校实际认证/共享平台 S01–S03 仍受外部条件约束，不阻塞本地版开发。


## 4.1 本地 L 的同步边界（防止第十一条开发线）

本地 Agent 按 Local-L01 执行：优先主线与历史执行资产定向核对、主进程通用建案学年合同、当前 V3 可复用读写入口、集成环境；持续接入成熟 TXX 固定 SHA，补共享 Main/IPC/Preload 并作产品联测。**不得自行接管或重写 T01–T10 的模板、材料、事实、规则、工作流、批次、评委、助手、离线与顶层 UX 产品实现。**

L 可在自己集成分支先完成公共基础合同；若改动会影响 TXX 的现成类型，须提供可复用的新合同文件/精确 SHA 与迁移说明，而不是要求十条线猜 main 的临时状态。L 记录：已接收 TXX SHA → 已桥接端口 → 已进入 main SHA → E2E/UAT 是否通过。**L 才有权把状态从 MODULE_VERIFIED 提升为 INTEGRATED/PRODUCT_ACCEPTED。**

## 5. 分支提交前的简短核对（十线共同）

- [ ] 我只负责用户指定的一个 T 号，在精确分支上继续，没有覆盖别人分支或自动改 main。
- [ ] 我查过本领域当前 main 及历史正确代码；新增的是实际缺口，没把旧能力重新复制一遍。
- [ ] 这轮提交含真实模块/交互/adapter 与相关验证，不只是文档、空框架或测试假象。
- [ ] 没改其他 Owner 的领域文件、Main/IPC/Preload、正式 writer、共享核心 DTO；需要的端口已作为具体 CONTRACT_REQUEST 告知 L。
- [ ] 没改写授权主体、技术预审/学校正式批准的界限；没有重造 Case/Run/Source 数据真值。
- [ ] 代码已推送到本人远端分支，能报出真实 SHA、修改路径、测试结果、待接线依赖及下一个本职切片。
- [ ] **仅声明本轮实际完成的层级**，不把代码存在、旧测试通过、PR 建立或 CI 绿色说成完整产品验收。
