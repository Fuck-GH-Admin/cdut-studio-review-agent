# CDUT Studio Review V3｜最终产品能力差距总表 R02（源码复核校勘）

**核验基线：** 2026-10-20 的 main @ 24603d87570f157d57c4845d897dc04c4cfe19e9。所有功能开发分支从这一 SHA 派生；本文件不代表未来漂移后的分支自动通过验收。R02 仅修正产品语义与接口归属，不代表已经实现新功能。
**需求基准：** docs/design/review-agent/02-product-and-templates.md（F01–F18）；04-acceptance-and-evaluation.md（A01–A18、C01–C04、S01–S03）；06-workflows-and-usability-design.md（U01–U12）；07-application-and-execution-design.md。沿用 V3 的唯一案卷/运行/来源体系，不退回 V1/V2 产品。
**事实基准：** docs/design/review-agent/acceptance/v3-local-closure-20261020/LOCAL-V3-E2E-ACCEPTANCE-20261020.md；latest main GitHub Actions 39470850855（success），以及源码层读取。文档中未签收的用户旅程不能因源码存在或 CI 通过标记完成。

## 状态语义

- **V / 局部实证**：确实运行通过某一段产品链，但不能延伸至全部验收。
- **P / 代码已有、能力未闭环**：存在服务、组件或测试，尚未证明其在当前 V3 同一案卷上可操作到用户目标。
- **M / 明确实现偏差或必需能力缺失**：当前实现与需求存在可定位的不一致，优先设计正确接口后补完。
- **D / 文档目标未找到完整产品实现**：本次逐文件审阅没有找到可调用的全链路；旧 V1/V2 的零碎服务不等于从未编写过代码。仍需会话复核再声明绝对“历史从未实现”。
- **X / 外部条件**：学校正式授权/共享服务暂不可用，不阻止本地等价业务能力实现。

## 一、原始 18 项验收对照（不以标签替代实际工作）

| 验收 | 当前证据与状态 | 必须补完/纠正，才能叫完整 |
|---|---|---|
| A01 / F01 安装、首次使用、模型 | **P**：真实 Electron 虚拟屏、已配置渠道 Pi 实证；还没有干净 Windows/Linux 安装包无开发依赖的一键示例签收 | 开箱案例/首次引导、格式依赖随安装包、只用全局模型选择；无需开发者环境 |
| A02 / F02 模板作者与发布 | **P+M**：V2 TemplateWizardPanel 有字段/材料/量表/阶段、草稿发布；V3 B1 有编辑/预览/冻结/Plan；**两套流程分离** | 统一 V3 模板生命周期；自然语言+制度生成可编辑草案、全字段类型、条件、流程、评分、试跑、发布、复制、导入导出与版本升级 |
| A03 / F04 多格式原件 | **V+P**：真正 PDF（parsed）、DOCX（partial）；IPC 拖拽登记通过，OS→DOM 拖放未实测；B2 ZIP/解析模块存在 | 扫描 PDF、图片、PPTX、XLSX、CSV、文件夹/ZIP、历史格式按承诺分别实际运行；页/sheet/图片出处与部分读取精度 |
| A04 / F06 证据链 | **P**：evidence-service、source-index、B2/B30 current-source 模块存在；本轮实测 observations=0 | 12 图分批、多证多事项、多学生归属、自动候选与人工更正、图片+文本全部纳入 Run；展示一证多用≠重复计分 |
| A05 / F05 识别纠错与版本 | **P**：V2 ObservationConfirmPanel、material-lifecycle、input-invalidation 存在 | 原件→字段/拆分合并→确认/纠错→版本失效→受影响检查增量运行，在 V3 同一案卷可操作 |
| A06 / F03 多依据和冲突 | **P**：policy-store、effective-rules、Plan 模块存在；50 D4 资产是候选，不等于获确认的规则 | 多制度/负责人要求一起编译，冲突待确认、非冲突继续、例外/优先级/版本与来源可编辑 |
| A07 / F08 确定计算 | **P**：deterministic-engine、judging-service、rating-service 存在 | 实际 D04/D05/D06/D07 组级择高/上限/权重/金额/日期/舍入同一 V3 Run 与报告核对，AI 不决定公式值 |
| A08 / F07+F10 覆盖与原件联动 | **V+P**：真实 Pi 的 60 个 Check 已走完执行阶段，但仅 2 项有效判断、58 项 pendingChecks（尚未逐项判明待确认原因；并非自动产生 58 张人工待办）；legacy 三栏有 SourceBlockView | 保持符合/不符/未执行/待确认真实区分；V3 Check→多出处原件/页/表格→返回卡片的实际联动；全符合无伪问题 |
| A09 / F11+F12 审批与补件 | **P+M**：V2 workspace-business-service/business-workflow 已有具名人工处置、补件、最终决定事务；但 decideWorkspaceCaseV2 明确拒绝 D2 技术预审和受控 Run 未定稿的 CanonicalPlan 直接作正式决定，V3 独立合法本地流程未形成完整 U03 路径 | **必须把本地业务决定与学校正式审批分开**；复用现有 V2 命令与记录，为 V3 新增明确的本地业务阶段/可信 Main 接入；保留技术预审禁止伪装正式审批的限制，不能只删 AGENT_DECISION_DISABLED |
| A10 / F13 申诉/复审 | **P**：business-workflow 中已有 Appeal/decision pure services、离线包候选 | V3 学生异议→新证据→独立复审人→维持/更正/撤回→公开反馈、历史关联可操作 |
| A11 / F09 历史与恢复 | **V+P**：两进程冷重启证明 Case、2 材料和 60 项 Plan 可读；watchdog 解决无限 running | 中断中真实 Pi 续跑/重试已完成 Check、stale/版本变化、跨案切换和历史报告一致性在 V3 旅程证明 |
| A12 / F14 批量 | **P**：BatchPanel、batch-store、batch-automation、分组确认和 B2 ZIP 源码存在 | V3 100 案/500 文件分案预览、队列、失败重试、锁规则、逐案真实 Pi、批量处理、名单；不能仅有 V2 批次入口 |
| A13 / F16+F17 报告与助手 | **V+P**：V3 实际导出 42KB/263 行 MD；旧 AssistantDrawer、report-service-v2、offline-roundtrip 存在 | V3 绑定的助手引用+可确认 patch；学生/内部 MD/PDF/XLSX/JSON/交接包、选择历史 Run、打开/另存、受众投影 |
| A14 / F15 独立评委 | **P**：judging-service/rating-service 和评分离线包部分代码存在 | 任务分配、回避、匿名、独立 UI、评分包往返、缺评/N-A、分歧/同分/名额和冻结定稿，同一 V3 批次走通 |
| A15 / F02 真正通用自定义业务 | **M**：B1 候选可保存/冻结/安装 1 Check，但安装生成的 shell 固定 objectType=document、单一 manual-review 阶段；native-workspace-case-v3.ts 的 createNativeWorkspaceCaseV3 在 Main 校验非空 academicYear，CreateCaseDialog 空学年自动填默认值，本地候选工作台禁用无学年创建 | 不改 TS、无需学年/综测标签，实现“实验室组织申请”自定义对象+字段+材料+无评分条件+补件+两级本地决定+报告 |
| A16 / F01+F09 模型故障与能力 | **V+P**：真实超时落 failed 的 watchdog 证据；已有 gateway/model modules | 能力差异、图/工具/结构输出缺失、断网/预算/模型切换后恢复、按检查范围标未执行；保留不依赖模型的计算 |
| A17 材料内指令与角色 | **P**：现有身份/工具/来源检查模块及历史负例；本轮未见此 A17 真实 GUI 全旅程签收 | 文档指令仅作内容；不因文件文字改工具/权限/审核结论；本地 reviewer 和校方授权状态明确区分 |
| A18 / F09 真正一次开始 | **V+P**：原生材料→固定 Plan→真 Pi 已可串起来，但必须分别点多处操作；技术 Run 不等于业务全程 | 单案启动后自动分类/解析/提取/绑定/检查/计算/摘要；歧义集中待办、可停止/继续、补件增量重审 |

**C01–C04（本地包和未来适配器）**：offline-roundtrip.ts、external-ports.ts 已存在；但从独立副本真实导出→填报/评分→冲突对账→同一 V3 案卷导入的完整用户路径，及替换 Repository/Adapter 的完整一致性证明仍缺。标 **P**，不准说全部未实现。
**S01–S03（校方身份/共享协作/实际联调）**：属于 **X**，必须依外部服务与授权。保留接入口并后置，不因此阻止本地能做的人工审批、评分、补件、离线协作。
**质量/发布**：04 文档的 120 例固定集+30 盲测、六完整业务、5 人 UAT、100 案/500 文件、安装包/平台资源验证是**拟定验收**，最新单案 E2E 绝不等于满足这些门槛。

## 二、已经确认的结构性偏差（优先处理，不要靠修补按钮遮盖）

1. **五个并列用户入口（不等于五个独立存储系统）**：ContentReviewView 分别显示“预审工作台 / V2 案卷 / 模板编排 / 本地候选模板 / 批次管理”。旧功能能用≠它们在 V3 同一案卷统一，需业务模型/数据流主导的产品编排。源：apps/electron/src/renderer/components/content-review/ContentReviewView.tsx。
2. **通用对象被固定业务字段侵入**：不仅 ReviewV3LocalCandidateWorkbench 创建按钮依赖必填学年，native-workspace-case-v3.ts 主进程也强制非空学年；B1 安装适配器硬编码 document 对象与单个 manual-review 阶段。A15 需要 T01/T05/T10 与本地总 Agent 的模板字段、建案和流程合同配合，不是单改 UI。源：ReviewV3LocalCandidateWorkbench.tsx、CreateCaseDialog.tsx、native-workspace-case-v3.ts、review-v3-main-b1-local-plan.ts。
3. **技术预审不具正式审批权，但不是整个业务层从零缺失**：D4/B1 的 mode=technical-pre-review、publicationAllowed=false；V2 已有人工决定/补件/申诉命令与持久化，本地 V3 尚缺受控衔接。保留 School guard，单独设计本地业务模式/阶段与可靠 Run 来源，不得把 D2 技术结果偷渡为正式决定。源：review-v3-main-b1-local-plan.ts、workspace-business-service-v2.ts、business-workflow.ts、LOCAL-V3-E2E-ACCEPTANCE。
4. **“检查完成”不等于“足够证据作结论”**：成功 Run 60/60 executed 中仅 2 个有效 verdict / 58 个 pendingChecks；先基于每项状态、原因与证据定位区分需人确认、补件、规则待定、能力不足或不适用等（不得凭 pending 数量推定原因），再生成最小合并待办；不能把 pending 批量变 pass。
5. **旧 V2 模板发布与 V3 D4/B1 候选相互独立**：TemplateWizardPanel 可发布 V2 模板，B1 作者可冻结候选，D4 有 50 条技术 Plan；需要一个用户理解的模板生命周期、统一可执行规则与阶段合同，而不是第三套存储。

## 三、“文档有目标，当前未查见完整落地”的高价值能力

这里的 **D** 指本轮没有找到可操作端到端实现，不声称三代仓库从未出现其任何函数：

- **D1**：普通用户用自然语言+上传制度自动起草完整模板，经过有界歧义问答后在表单中配置 *任意* 对象、评分、阶段与输出，发布后重复实际运行。B1 有作者编译器，V2 有表单，不等于这一条产品旅程。
- **D2**：同一套可配置业务阶段支持“自检 / 单级 / 初审→终审 / 资格→独立评委→汇总”加条件/并行/重开，并能生成学生与负责人可操作任务，不依赖硬写模板类型。
- **D3**：多角色完整本地协作包，特别是学生补件与多评委匿名评分在独立工作副本的完整往返、冲突/旧版处理、最终定稿。
- **D4**：文档定义的六种**完整业务样例**（不仅 50 套技术候选）全部带自洽的虚构政策、实物样本、补件/评分/人工阶段/报告并从用户入口完成。
- **D5**：普通用户从本地报告发现异常后，可通过来源定位→更正/补件→只重审受影响项→人工决定→报告/公开反馈串成一条无开发者命令的链。
- **D6**：经过真实证明的 120+30 固定评测、正确性 D01–D12、100 案/500 文件与 5 名用户接受度，不是运行一轮 60 项技术 Check。

## 四、R02 源码校勘：防止任务误派

- **真实实机结论的边界**：main 内 `LOCAL-V3-E2E-ACCEPTANCE-20261020.md` 记载 2026-10-20 Linux/Xvfb/Electron、真实 Provider Pi 单案；PDF 为 parsed，DOCX 为 partial，拖放只证实 IPC 路径而非 OS→DOM 命中。60/60 是执行计数，不是 60 项规则均已下结论，也不是 58 个人工任务。
- **现有功能不等于 V3 未写过**：业务工作流 `business-workflow.ts`/`workspace-business-service-v2.ts`，确定计算 `deterministic-engine.ts`，离线包 `offline-roundtrip.ts`，批次 `batch-automation-service.ts`，V2 模板 `TemplateWizardPanel.tsx`，都是真实源码资产；应优先复用并验证 V3 兼容性。已有函数不证明完整 U 类用户旅程。
- **内置模板目录口径**：`builtin-templates.ts` 包含两份项目内置模板及参考场景范本；D4 G01–G08 的 50 条候选均属技术预审且 `publicationAllowed=false`；B1 所谓“第 51 套”是另一个候选作者/Plan 流程。三者相加**不等于**原产品 02 所要求的六套完整可操作示例，也不等于 51 套正式发布模板。
- **共享权威的实际范围**：`native-workspace-case-v3.ts` 声明 `state.v2.json` 是原生权威并生成只读 V1 兼容投影。因此说“五入口未统一”是**用户流程/入口及不同模式协作问题**，不是可据此推导五份独立 CaseStore、需要重写底座。
- **真实待开发范围**：优先补对象与字段通用性（包括建案 Main 合同）、模板与阶段合同、V3 本地决定/补件、待定 Check 转可操作动作和同案工作台；来源解析、评分、批次、评委与离线往返按原 A/F/U 分项继承旧代码和完成缺口。
- **十条线的可并行边界**：十个远端分支独立开发模块，**不意味着接口可以十套自行定义**。最容易冲突的 `TemplateVersion/Stage`、`Case/Run`、规则和来源 DTO 需共享单一 V3 合同；T01/T04/T05/T10 的跨线接口由本地总 Agent 统一签收。共享桥接未完成时标模块已开发/待集成，不能标完整产品通过。

## 五、执行原则

- 后续功能开发直接对照上述 A/F/U/C 目标；不是重复旧 V1/V2/V3 的命名和技术路线。
- **优先继承** case-store-v2、workspace-business-service-v2、business-workflow、TemplateWizardPanel、deterministic-engine、batch-automation、judging/rating、offline-roundtrip、report-service-v2 等，先阅读这些代码。只有发现它们不能满足业务需求时再扩展。
- 本轮只做**需求和源码证据审查/任务拆分**。没有在新开发分支实做功能，也没有声称新缺口已经修复。
- 每个开发会话发现本矩阵错误时，以具体函数、截图或验收用例写回自己的 PR；由本地总 Agent 更新唯一当前状态和最终集成。
