# CDUT Studio Review V3｜并行功能开发任务书 R02（开发边界校勘）

**基线**：main @ 24603d87570f157d57c4845d897dc04c4cfe19e9（2026-10-20），每个分支均已实际创建于此 SHA。**产品要求、证据与缺口**见同目录 FEATURE-GAP-MATRIX.md。
**目标**：线上多个会话交付能被主产品调用的实际功能模块及其业务 UI/adapter；本地总 Agent 专门负责共享合同接线、真实端到端运行、冲突归属、合并、定点测试和产品 UAT。模块可单独完成≠原始 A/U 用户旅程已完成。线上会话只提交自身 feature branch 与固定 SHA，不直接合入 main，不自作主张增加一个案卷/Run/审批系统。

## 0. 双轨工作定义

**云端功能会话**：读产品 02/04/06/07 + 本任务书 + 所属 V1/V2/V3 现成代码；**直接开发实际功能**，不要再写调研长报告。每轮提供可复用代码、未接入的依赖端口（若有）、真实 Git commit、对应 A/F/U 条款、明确已完成和未完成行为。静态类型错误可自修，但不必为了数千项旧 CI 或想象中的恶意场景重新造验证框架。

**本地总 Agent**：唯一负责共享 Main/IPC/Preload 入口协调、来自多个功能分支的冲突处理、联测/人工验收、生产 main 合并与回滚；不重新实现分支 Owner 已做的模块。不同分支的 SourceRef/Case/ReviewRun 以 V3 当前合同为唯一真实对象，不能再开第四套引擎。

**每个云端会话提交**：分支 + commit SHA + 修改路径 + 用户操作/实际 UI/API 入口 + 必需的共享 Main 接口（签名/作用/返回/错误）+ 尚未验证事项。尽量编写可被单独导入的模块，跨线写入留给本地总 Agent。

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

## 2. 推荐并行批次（按实现依赖，不要求所有会话齐步走）

**第一组可立即并行：T01、T03、T04、T05、T10**。T02 也可同时独立扩展解析。  
**第二组并行：T06、T07、T08、T09**，它们已有独立服务代码，等相应契约对齐即可由本地 Agent 接入主线。  
**优先做产品功能，不拿旧代码测试数作吞吐指标。** 后续专项签收由本地 Agent 做，它先接最短完整业务：A15 的“通用业务新建→处理→本地决定→报告”，再扩展 A09/A12/A14 等全套能力。已有 50 D4/单案 Pi 实证底座不得退化。

**易冲突的中心点**：CaseAggregate/ReviewRun/Decision/TemplateVersion 核心类型、review-ipc.ts、preload/index.ts、main/index.ts、case-store-v2.ts、统一业务事务/产品导航整合，**由本地总 Agent 独占最终修改与合并**。各线上传可调用 API/adapter + 需求签名；主 Agent 执行 bridge。T01 与 T10 之间“作者表单 vs 通用导航”由各自负责，T05 不写 T10 的顶层 ContentReviewView，T06/T07 不并发修改同一 BatchPanel 页面：T07 建立评委自己的面板/Adapter。

## 3. 各云端开发会话共同接手提示词（补入自己 T 号）

你是 CDUT Studio Review V3 的云端生产功能开发 Agent。仓库 Fuck-GH-Admin/cdut-studio-review-agent。**只负责本任务书第 1 节对应的 T 号**，当前已存在专属 feat/v3-full-tXX-* 云端分支（创建基线 24603d87570f157d57c4845d897dc04c4cfe19e9）。先完整阅读同目录 FEATURE-GAP-MATRIX.md，原设计 02/04/06/07 中和自己业务有关的精确要求，随后读当前 main 对应源码。你的任务是**开发用户真实可操作的业务功能**，优先继承 V1–V3 的已有正确实现，绝不重新开启无边界调查、只生成 PPT/报告或又造第二套 Case/Run/审批系统。不要碰其他 Owner 的文件和统一主进程写入。遇到接口问题，在你的功能分支留下能运行的自身适配层，精确说明本地总 Agent 要接哪个签名。把代码提交到**你自己的远端 feature branch**；不合 main、不触动其他分支、不做全仓验收。最后只汇报 commit SHA、实际功能、用户可执行路径、仍缺接口及与验收 A/F/U 编号的对应；不把“代码写了/CI 绿了”说成整套产品完成。

## 4. 本地总 Agent 的最终唯一签收

1. 开一个不与各会话共享写权限的 integration worktree；记录当前 main 和十个功能来源各固定 SHA。
2. 哪个独立功能真实可调用，先导入哪个；缺 Main/IPC 端口主 Agent 统一最小桥接，绝不替线主重写完整模块。
3. 按 04 A01–A18 + 06 U01–U12 + C01–C04 一项项真实用户场景签收，记录 PASS/PARTIAL/FAIL/NOT_RUN；本地单案 Pi 60/60 executed 且 58 pending 不计完整业务案卷通过。
4. 同一 V3 Case 完成至少三条真实旅程：**A15 通用组织申请全流程**、**A09 补件到本地合法决定及复审**、**A12+A14 批量/评委评分定稿**，以及报告/离线包/重启。各子功能通过后再整体验收剩余边界。
5. 仅本地 Agent 处理所有冲突、编译错误、旧断言、OS E2E 与最终 main fast-forward/merge；不要 force push。学校实际认证/共享平台 S01–S03 仍受外部条件约束，不阻塞本地版开发。
