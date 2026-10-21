# 材料审核现有界面操作逻辑收敛与功能整合

> 文档性质：给本地 Agent 的直接实施单，不是新一轮架构研究或功能拆分。
> 源码基线：2026-10-21，main = ed69dc13ec747f4d5ce9f4e99963d6fee93ad5e4。
> 目标：审核能力已经存在；本次只解决普通用户如何顺畅使用这些能力的问题。请直接修改现有 Renderer 界面和状态接线，完成后提交代码与验证证据。
> 旧稿说明：REVIEW-UI-REORGANIZATION-SPEC.md 当前明确标记为“暂停采用”。本执行单取代旧稿中未经完整源码核对的页面迁移决定；不要照旧稿新增“审核首页 / 案卷 / 待办中心”等新入口。

## 1. 任务目标与不可越界事项

正常用户进入材料审核后，应当能从一份案卷开始，顺着完成材料导入、方案匹配、运行审核、核对结果、人工办理、补件/申诉和报告导出；不应因为内部实现分成候选工作台、V2 案卷面板和三栏工作台，就被迫反复切换页面或重复选择案卷。

本任务是“现有能力的界面整合”，不是重做审核功能。

必须遵守：

1. 不新增顶层导航、独立首页、全局待办中心、第二套案卷管理器或新的审核工作台。
2. 不按 P1/P2/P3/P4/P5 或 F01–F18 重新拆分任务；这是一个完整的 UI 操作逻辑收敛任务。可以按实施顺序提交，但不得把已存在功能再次定义成新产品边界。
3. 不重写 Main、Pi、业务事务、审核规则或权限状态机。优先复用现有组件和 reviewAPI；只有为了让同一现有组件被多个现有入口复用，才允许做必要的组件提取和 props/state 接线。
4. 不删除或弱化现有能力：G01–G08 的 50 套 D4 方案、公共兜底与第 51 套 B1 候选、已发布业务模板、真实材料导入与解析、统一 Run、历史运行、报告格式、T02 覆盖、T03 事实核验、F06 证明归属、T05 人工流程/决定、补件、申诉、T07 批次评分、T06 文件夹/ZIP 分案、T09 离线任务包、T10 概览、操作时间线、审核助手、Pi 高级账本均须保持可达。
5. 技术预审不等于正式业务审批。不得通过界面调整把 D4/B1 技术计划伪装成学校已发布的正式业务模板，也不得绕过 Main 对阶段决定、身份、权限、Run 有效性和案卷 revision 的校验。
6. 不只改标题、颜色或按钮文案；要修正实际操作路径和当前案卷状态。也不要为了“统一”而把所有能力挤成一个永远展开的超长表单。

## 2. 源码中已确认的具体问题

### 2.1 ContentReviewView 把一条审核流程切成了多个工作页

文件：apps/electron/src/renderer/components/content-review/ContentReviewView.tsx

当前顶层导航映射为：

- workbench → “导入材料”
- local-candidates → “当前审核”
- case-v2 → “结果与办理”
- templates → “审核模板”
- batches → “批次管理”
- 另有单独的“待办”按钮，直接切换到三栏工作台的 right pane。

普通用户导入材料后，quickStart 会保存 quickCaseId、清空 reviewV2AggregateAtom 并切换到 local-candidates；随后候选工作台用 initialCaseId 自己设置 localCaseId。之后候选工作台的“打开本案复核与人工办理”又会把同一案卷切到 case-v2。这样一份案卷的材料、方案、运行、报告和人工办理被切成几段，用户必须知道内部页面的区别才能继续操作。

修改要求：

- 将“当前审核”作为单案正常审核流程的主工作区。普通用户在这里应能完成现有的方案匹配、计划确认、Run、结果核对、人工办理与报告查看，不应被迫通过一个“打开本案复核与人工办理”按钮跳到另一个顶层页面才能完成后半程。
- 继续保留现有顶层入口和用途，不增加新入口。 “审核模板”和“批次管理”仍是独立工作；“结果与办理”作为现有兼容入口保留，但必须与主流程共享同一案卷、同一业务组件与同一真实数据，不能形成第二套状态。
- “导入材料”仍负责无案卷时开始导入/建案，也可用于当前案卷补充材料；选中案卷后不得让用户误以为需要重新建案才能继续。
- 允许将现有业务工作区提取为可复用的单案组件，例如从 V2CasePanel 提取 CaseWorkspace；这是内部组件复用，不是新增产品页面。若采用该方案，V2CasePanel 继续承载已有案卷列表和从已发布模板新建的入口；当前审核工作区复用同一个 CaseWorkspace，不能复制一份相似但独立的业务流程。
- 若实现上不适合立即内嵌全部业务细节，至少先让“当前审核”提供同一案卷内可直接抵达的结果/办理区域，并消除必须重新选案或重新打开案卷的步骤；不要仅把现状原样保留再换文案。

### 2.2 新建/选案和当前审核在多个组件重复出现

涉及：

- apps/electron/src/renderer/components/content-review/ReviewV3QuickIntake.tsx
- apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx
- apps/electron/src/renderer/components/content-review/V2CasePanel.tsx
- apps/electron/src/renderer/atoms/review-atoms.ts

当前 ReviewV3QuickIntake 已能从文件选择或拖入材料创建案卷并导入申请原件。ReviewV3LocalCandidateWorkbench 又提供“创建本机原生案卷”、直接输入案卷 ID、列出历史案卷、选择历史案卷、导入申请/证明和拖入材料。V2CasePanel 还提供“打开其他案卷 / 从已发布模板新建”。这些功能不是都应删除，但不应全部以主要操作区的形式重复出现。

修改要求：

- 普通用户在当前审核中只应看到当前案卷的标题、申请主体、材料状态、方案状态和该继续做什么；不要在当前案卷已选定时，再把“创建原生无绑定案卷”、粘贴 ID、列出历史案卷等建案/维护控件作为页面主内容。
- 保留候选工作台现有的申请材料与证明材料区分、拖放角色选择、材料失败回执及补充材料能力；它们不是 QuickIntake 的简单重复。把它们整合成当前案卷的材料操作，而不是删除。
- 新建、切换和重开历史案卷仍从现有“导入材料”或“结果与办理”路径进入。候选作者/高级操作需要直接输入 ID 或重开修订时，可放进已有的高级折叠区或现有模板/案卷管理区域；不得另加一个顶层“历史案卷”入口。
- 每次切换案卷后，必须同步所有相关视图，不得继续操作上一个案卷。

### 2.3 当前案卷存在多套 ID/聚合状态，必须统一联动

涉及：

- ContentReviewView.tsx 中 quickCaseId、quickStart、openBusinessCase
- ReviewV3LocalCandidateWorkbench.tsx 中 initialCaseId、localCaseId、nativeAggregate、nativeRun
- V2CasePanel.tsx 中 reviewV2AggregateAtom
- review-atoms.ts 中 selectedCaseIdAtom、reviewWorkspaceAggregateAtom、reviewWorkspaceRunAtom、reviewWorkspaceTemplateAtom、reviewWorkspaceRunStaleAtom
- ReviewV3T10WorkspaceOverview.tsx
- AssistantDrawer.tsx

源码已经有 selectedCaseIdAtom 和按案卷 ID 索引的 reviewWorkspaceAggregatesByCaseAtom / reviewWorkspaceRunsByCaseAtom 等状态；不要再引入第三套全局当前案卷状态。

修改要求：

- 以现有 selectedCaseIdAtom / review workspace 按案卷 ID 的状态作为统一的“当前正在处理哪份案卷”来源。ReviewV2 聚合可以保留为现有业务 API 的缓存，但它不是可以无条件代表当前选中案卷的身份依据。
- QuickIntake 创建成功后，除了导入材料并导航，还必须调用现有选择案卷流程（如 actions.selectCase），确认该 ID 成为当前选中案卷；不能只通过 quickCaseId → initialCaseId → localCaseId 传递。若选择失败，明确报错并保留可恢复的案卷，不要显示另一份案卷的概览。
- 候选工作台自行创建或打开历史案卷时，也必须同步当前选中案卷状态。不要让 localCaseId 和 selectedCaseIdAtom 长期各自独立；如果 localCaseId 仍需作为表单草稿/输入状态，必须在创建、打开和切换时显式同步，并拒绝不一致的写操作。
- 从 V2CasePanel 打开案卷时，必须同步选中 ID、V2 聚合和工作区聚合。异步加载结束时再次核对返回 aggregate.caseV2.id 是否仍等于当前请求 ID，防止慢请求把页面切回旧案卷。
- T10 概览、Run、报告、助手线程、材料、T03 事实、F06 证明、人工决定与时间线都必须绑定同一 caseId。旧案卷缺少某类 projection 时可以显示兼容状态，但不得把另一份案卷的 Run、来源、待办或报告混进来。
- 不需要把所有 atom 合并为一个新状态库；复用现有按案卷缓存并修正同步边界即可。

### 2.4 D4 路由和参数确认被呈现成两个相互竞争的选择区

文件：

- apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx
- apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx
- apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx

ReviewV3TemplateRoutingAssistant 已负责从真实材料读取并匹配 D4 50 套方案、显示建议、允许手动选择、处理已发布模板绑定，并提供公共兜底/自动起草。用户选择 D4 后，D4CaseSetup 用于确认具体对象/场景等参数并形成可执行计划。当前页面又在路由助手之外常驻展示“使用已有 50 套 D4 模板生成本案审核任务”整块选择区，容易让用户以为要选两次。

修改要求：

- 以 ReviewV3TemplateRoutingAssistant 作为常规用户的唯一模板路由/匹配入口。保留 50 套 D4、自动建议、人工覆盖、已发布模板绑定和公共兜底。
- D4CaseSetup 只作为选择 D4 后必要的对象/场景/参数确认步骤，不再作为与路由助手并列、重复出现的第二套模板选择器。路由助手选中 D4 后，把 templateId 建议传给 D4CaseSetup；只有需要确认参数时才展示该步骤。
- 不能因为“去重”而取消人工选择、复杂申请覆盖、多个对象确认或真实计划固定。确认对象/场景后，仍走现有 attachD4TechnicalPlanV3 和 Main 的真实校验。
- 已发布业务模板绑定与 D4 技术预审是两条不同路径。界面应清楚解释差异，但不要要求用户在两个重复页面中重新选择同一模板。
- 自动路由倒计时、材料来源/归属风险提示和人工覆盖必须保留。

### 2.5 第 51 套作者工具和 Pi 账本占据了普通用户主流程

文件：ReviewV3LocalCandidateWorkbench.tsx

该组件同时承担当前审核、D4 匹配、公共兜底、B1 第 51 套候选编辑器、重开作者修订、材料路由刷新、Pi 运行、报告、打开业务办理和高级 Pi 账本。功能本身有价值，但所有高级作者操作常驻展示会让普通用户难以辨认下一步。

修改要求：

- 常规路径突出：当前案卷 → 材料 → 匹配/选择方案 → 必要参数确认 → 固定计划 → 运行 → 结果与待办 → 报告/办理。
- B1 第 51 套候选作者、重开作者修订、保存/冻结候选、公共兜底起草、详细 Pi 账本与停止/续跑，仍使用原有组件和 API，但放在现有“公共兜底/自定义方案”分支或已有的高级折叠区域中；只有用户选择不匹配/自定义目的或主动展开高级操作时才展示。
- 不把 B1 作者入口删除，也不把第 51 套误当成正式发布模板。冻结与安装仍需明确分成两个动作，并显示本机候选的信任边界。
- 对已固定 Plan 的案卷，直接显示计划版本/指纹、当前材料是否使 Run 过期及下一步，不再展示要求重新选模板的主操作。
- 运行和报告继续使用现有 ReviewV3UnifiedRun、ReviewV3T08ReportPanel；不要另造运行按钮逻辑、报告生成器或平行 Run 状态。

### 2.6 V2CasePanel 同时承担案卷管理和全部单案业务操作，应复用而不是复制

文件：apps/electron/src/renderer/components/content-review/V2CasePanel.tsx

当前面板将打开其他案卷、从已发布模板建案、填写案卷字段/申报事项、材料槽和导入、提交案卷、ReviewV3UnifiedRun、T08 报告、T05 人工业务流程、T05 Run 决定、RunResultPanel、ObservationConfirmPanel、T02 覆盖、T03 事实/证明、T09 离线包、ReviewAssignmentCard、CaseTimelinePanel 和高级模板规则运行放在同一长面板中。

修改要求：

- 把“案卷列表/新建案卷/选择已发布模板”与“当前案卷工作区”在组件职责上分开。前者保留在现有案卷管理入口；后者抽成可复用的单案工作区，供“当前审核”与现有“结果与办理”入口共同使用。
- 只提取现有 JSX、状态处理和业务动作，不复制一套相似的事务逻辑。单案工作区必须继续调用现有 reviewAPI 和既有 T05/T08/T09/T02/T03 等组件。
- 普通流程将最常用内容优先展示：材料/事项、最近一次 Run 与检查结果、待核对事项、适用的人工办理操作、报告入口。模板规则单独运行、离线任务包、评分/分配等低频功能可以分组或折叠，但仍须在原有工作流内可达。
- 不改变各项业务动作的权限和前置条件。特别是正式决定、补件和申诉仍须由现有 Main 能力判断是否允许，不能只靠前端按钮显示/隐藏。
- 保留“整份案卷只需启动一次审核”的既有语义，不要为每个事项重复创建 Run。

### 2.7 报告按钮的实际行为与文案不一致

文件：ContentReviewView.tsx

顶部按钮文案为“查看与导出报告”，但当 businessAggregate 存在时点击会调用 openBusinessCase()，实际只是切换到 case-v2，并没有直接打开报告。另一方面，当前审核和 V2CasePanel 内已经各自有 ReviewV3T08ReportPanel。

修改要求：

- 顶部报告操作必须真正打开/定位到当前案卷的既有 T08 报告面板，或在该位置明确显示报告区；不能把“切换到结果与办理”伪装成“查看报告”。
- 报告数据必须使用当前 caseId 对应的真实 Run、当前 Run 有效性和既有 audience/format 选项。Run 过期时明确提示历史结果，不要静默导出成当前结论。
- 只保留一套报告生成和导出逻辑，支持当前已有的 Markdown、JSON、XLSX、HTML、PDF 和只读 ZIP。不得另写一个格式不全的快捷导出器。
- 若某案卷没有可用 Run，按钮应说明“先完成审核”或禁用，并给出合理提示；不要点击后无明显反馈地跳去别处。

### 2.8 T10 概览和待办必须成为真正的下一步指引，而不是额外入口

文件：ReviewV3T10WorkspaceOverview.tsx、review-workspace-view-model.ts、ContentReviewView.tsx

T10 已根据材料、检查、业务阶段、Run 过期状态和 pendingActions 计算下一步。ContentReviewView 又额外提供“待办”按钮；概览目前还会在模板/批次等所有 section 上显示。

修改要求：

- T10 概览仅在适合单案工作的区域显示；进入模板编辑或批次管理时，不要重复占据页面顶部或显示与当前区域无关的案卷 CTA。
- 保留现有 T10 状态计算和排序，确保“下一步”跳转到对应的当前案卷区域。不要在 UI 中自行推断“审核完成/正式通过”。
- 有案卷时，“待办”定位到现有 RightPanel/当前案卷待处理项；无案卷时应引导用户从现有导入入口开始，不能让用户点击后看到空待办 pane。
- pendingActions 中的事实、证据、材料槽、补件、检查和最终认定要继续指向对应现有组件/来源；不要新建全局待办数据模型。

### 2.9 模板工作区的次级导航和维护操作重复

文件：ContentReviewView.tsx

当前“审核模板”和“当前审核”两个顶层入口下又显示“模板库与业务配置”“候选方案与技术试跑”次级导航，并在两者下方显示“发布 50 套模板”。这让用户难以区分正常使用模板与维护/初始化模板。

修改要求：

- 顶层导航不增加新项；保留现有“审核模板”和“当前审核”的可达性。
- 普通当前审核中只显示当前案卷所需的匹配、参数确认和运行步骤，不重复展示模板管理次级导航。
- “发布 50 套模板”是维护/初始化操作，移动到现有审核模板管理区域内，使用现有按钮和发布逻辑，不删除、不另建模板管理入口。
- 模板作者和模板维护能力继续使用 TemplateWizardPanel 及现有编辑器；正常审核用户不应被迫先理解“候选作者工作台”才能选择已发布模板。

## 3. 推荐的实施顺序

按下面顺序直接实现，不需要先重新做一轮全仓调研，也不需要把任务拆成多份独立功能开发：

1. **统一选案与上下文。** 先修 QuickIntake、候选工作台、V2CasePanel 的打开/创建/切换案卷同步。确保 selectedCaseIdAtom、当前 aggregate、Run、模板、报告和助手线程不串案。
2. **抽取单案业务工作区。** 从 V2CasePanel 提取可复用的当前案卷工作区；案卷列表/从已发布模板新建仍留在现有管理入口。让当前审核复用该工作区，避免跳页才能人工办理。
3. **收敛常规方案路径。** 以 TemplateRoutingAssistant 为单一常规路由入口；D4CaseSetup 只负责被选中方案的必要参数确认；B1 作者和 Pi 账本进入高级/自定义分支。
4. **修复入口行为。** 修复顶部报告按钮、待办按钮、T10 下一步跳转和概览显示范围；让文案、实际动作与当前案卷状态一致。
5. **收敛模板管理导航。** 去掉重复的模板次级导航和普通审核中的发布维护按钮，但保留所有原有维护能力。
6. **验证整条实际流程。** 不止跑组件单测；至少用真实本地 GUI 走完第 5 节的验收路径。无需为此新增一套业务逻辑或大规模无关测试。

## 4. 明确不能做的“捷径”

- 不要只把“当前审核”改名或把“结果与办理”按钮换个文案，然后保留用户必须跳转的原流程。
- 不要把 V2CasePanel 整个组件在候选页再挂载一遍，造成两个实例、重复请求、局部 state 不一致；应提取共享单案组件或采用等价的单实例复用方式。
- 不要同时保留两个互不关联的 D4 50 套选择器，也不要为消除重复而删掉对象/场景参数确认。
- 不要让普通用户进入当前审核后，首先面对建案 ID、作者修订 ID、B1 冻结、Pi 账本等维护字段。
- 不要删掉历史案卷重开、证明材料导入、文件夹/ZIP 批次分案、T07 评分、离线包、时间线或高级 Run 控制。
- 不要把 T05 正式决定、T09 回件导入、T08 报告导出等动作改成仅前端更新状态；必须继续使用 Main 真实回执。
- 不要把旧案卷、技术预审和已发布业务模板合并成同一种“已审核”状态。
- 不要引入新的顶层导航、独立首页、待办中心、重复案卷选择器或新的后台服务。
- 不要把文档完成当作代码完成；本执行单是要求本地 Agent 实施代码修改的具体依据。

## 5. 验收场景

| 场景 | 必须观察到的结果 |
|---|---|
| A. 首次进入、导入材料 | 无案卷时能从现有导入入口选择/拖入材料；创建成功后进入当前审核，标题、申请主体、材料列表和活动案卷 ID 对应同一份案卷。 |
| B. 同一案卷完成 D4 路由 | 自动建议或人工选择 50 套中的方案；必要时确认对象/场景；固定真实计划后运行。用户不会被要求在两个并列的 D4 选择区重复选择。 |
| C. 没有合适的 D4 | 用户可进入现有公共兜底/自定义方案分支，起草、保存、冻结并安装 B1；界面明确它是本机候选，不代表校方发布。 |
| D. 已发布业务模板建案 | 仍可从现有模板入口选择已发布模板、填写案卷字段与申报事项、登记材料并启动审核；不必经过 B1/D4 技术作者流程。 |
| E. 审核后人工办理 | 在当前案卷流程内能查看结果、核对事实与证明、处理适用的补件/阶段任务/决定/申诉；不要求重新选案，且技术预审不能直接冒充正式审批。 |
| F. 报告 | 从顶部报告操作或当前案卷报告区打开真实 T08 面板，选择当前/历史 Run、查看适用受众并导出已有格式；过期 Run 有明确提示。 |
| G. 切换历史案卷 | 从现有案卷管理入口打开另一份案卷后，标题、材料、Run、待办、报告、助手线程和人工办理均切换到该 ID；慢请求不得把页面状态覆盖回上一案卷。 |
| H. 批次/评分/离线功能 | 文件夹/ZIP 分案、清单映射、批次执行、T07 评分、T09 离线任务包、操作时间线仍能从原有批次/单案入口使用。 |
| I. 空状态和无权限状态 | 无案卷时不显示伪待办；无 Run 时不假装有报告；过期 Run、未绑定模板、技术预审和正式业务流程边界清楚；权限不允许的动作仍由 Main 拒绝。 |

## 6. 代码验证与交付要求

- 更新或补充最少量的针对性测试，重点覆盖选案同步、跨案卷结果隔离、报告按钮实际行为和关键导航回跳。优先复用现有测试，不新增庞大的 UI 测试框架。
- 运行与改动范围直接相关的类型检查、lint 和测试；修复由本次改动造成的失败，不扩展到无关重构。
- 必须在本地 Electron GUI 或现有 A15/端到端路径中走查 A、B、D、E、F、G 场景。仅有 TypeScript 编译通过不能证明操作闭环。
- 检查窄窗口单栏切换、键盘导航、已有 data-testid 与助手快捷键没有被破坏。
- 交付时说明：改了哪些现有组件、哪些重复入口被收敛、哪些原功能如何保留、每个验收场景的实际结果、测试命令和失败项。不得只报告“页面已整理”。
- 如果最新 main 已前进，先基于最新 main 对照本执行单并将改动移植到最新源码；不要回退到文档记录的旧 SHA，也不要覆盖其他会话的代码。
- 不要合并 main。由本地 Agent 按项目现有集成流程实施、验证和提交。

## 7. 关键源码入口

- 主容器、导航和顶部操作：apps/electron/src/renderer/components/content-review/ContentReviewView.tsx
- 快速导入：apps/electron/src/renderer/components/content-review/ReviewV3QuickIntake.tsx
- 当前候选审核、材料、方案、Run、报告：apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx
- 模板路由与兜底：apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx
- D4 参数确认：apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx
- 业务案卷与单案业务组件：apps/electron/src/renderer/components/content-review/V2CasePanel.tsx
- 当前案卷概览与下一步：apps/electron/src/renderer/components/content-review/ReviewV3T10WorkspaceOverview.tsx、review-workspace-view-model.ts
- 当前案卷 ID / 按案卷缓存：apps/electron/src/renderer/atoms/review-atoms.ts
- 报告：apps/electron/src/renderer/components/content-review/ReviewV3T08ReportPanel.tsx
- 事实与证明：apps/electron/src/renderer/components/content-review/ReviewV3T03FactWorkbench.tsx、ReviewV3F06EvidenceWorkbench.tsx
- 人工业务流程和决定：apps/electron/src/renderer/components/content-review/ReviewV3T05HumanWorkflow.tsx、ReviewV3T05RunDecision.tsx
- 助手案卷上下文：apps/electron/src/renderer/components/content-review/AssistantDrawer.tsx
- 旧版三栏工作台：apps/electron/src/renderer/components/content-review/LeftPanel.tsx、CenterPanel.tsx、RightPanel.tsx

最终判断标准只有一个：普通用户沿着现有入口进入一份案卷后，能自然地完成它当前适用的审核与办理；原有能力仍然可达，案卷上下文始终一致，且没有为了“整理页面”另造一套入口或业务实现。
