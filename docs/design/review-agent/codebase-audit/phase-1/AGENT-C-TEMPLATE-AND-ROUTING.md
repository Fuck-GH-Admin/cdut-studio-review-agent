# Agent C｜模板、规则与方案路由：逐文件源码盘点

- 仓库：Fuck-GH-Admin/cdut-studio-review-agent
- 固定基线：main / 7b6cdc843d26e926c0c63b8c51a451ff3925cfad
- 基线提交时间：2026-10-21 08:32:09 UTC
- 工作方式：只读源码审查；未修改生产代码；未运行测试或 CI
- 本报告定位：C 分工的文件级盘点与跨模块调用证据，供总协调者汇入完整 CODEBASE-MAP。

## 1. 结论摘要

当前仓库中的“模板”并不是一个单一数据模型或单一路由，而是至少四条有不同授权与执行语义的路径：

1. **标准 TemplateVersion 库**：模板草稿、发布、版本、归档、政策引用；T01 编辑器直接操作这条路径。
2. **D4 冻结的 50 套候选**：从 acceptance 目录加载冻结 Workspace 和选择配置；允许技术选型，但 catalog 声明 publicationAllowed=false、publication=candidate-held；实际选择后为原生案卷安装 D2 technical plan。
3. **B1/B29 公共兜底候选**：未匹配材料经用户明确确认后形成 B29，再转换为 B1 作者文档、保存修订并冻结，最后可安装候选性质的 D2 technical plan。
4. **候选转标准草稿的另一条兜底路径**：B1AuthorDocument 可转换为普通 TemplateVersion 草稿，之后走标准模板编辑、T01 确认、发布和 T04 规则运行。它与“直接安装 B1/D4 技术预审计划”不是同一结果。

另外，T06 批量物理入库使用另一套按文件夹/分组名称建议已发布模板的路径，不能与单案 C11/B3 内容路由混为一谈。

因此，源码地图必须分别记录模板资产、模板版本库、路由决策、计划编译、计划安装和 Run 执行；不能将“模板存在”“模板可选”“模板已发布”“模板已形成技术计划”视为同一状态。

## 2. 本次核验的主调用链

### 2.1 标准模板与规则运行

- UI：ContentReviewView 的“模板库与业务配置”挂载 TemplateWizardPanel。
- 初始化：review-ipc.ts 注册 BOOT_CHECK_V2，调用 boot-check.ts 的 runBootCheckV2；该函数调用 ensureBuiltinTemplateDrafts。
- 存储：builtin-templates.ts、template-catalog.ts、template-store.ts。
- 政策：policy-store.ts 保存政策及其内容哈希；effective-rules.ts 合并模板政策、模板分项与案卷级 reviewRules；f03-policy-resolution.ts 处理来源冲突。
- 编译：review-v3-main-template-plan-bridge.ts → review-v3-t04-published-plan.ts。
- 确定性执行：review-v3-t04-rules-scoring.ts。
- Run 与覆盖核对：review-v3-main-template-run.ts → run-store-v2 writer，并调用 review-v3-f07-plan-coverage.ts。
- 前端编排：ReviewV3UnifiedRun.tsx 对非 technicalPlan 案卷先调用 runTemplateRuleReview，再单独调用 startBackgroundPiReviewV2；两者分别保存 Run，并未合并成一个 Run。

### 2.2 单案模板路由

- 启动接线：main/index.ts 安装 installC11LocalNativeProductIntake、installC11NativeD4TechnicalPlan、installC11NativeB1TechnicalPlan、installC11LocalAuthorWorkbench。
- 原件读取：review-v3-main-local-product-intake.ts 校验 Main 主框架、原生案卷、原件字节及当前范围，再通过 B2 staging 读取材料。
- 路由目录：同一文件的 catalog() 合并本机 status=published 的 TemplateVersion 与 D4 冻结候选。
- 路由决策：review-intake-routing-adapter-v3-b3.ts 实施保守 B3 路由；review-v3-d4-content-router.ts 根据原件解析文本及模板标签/信号生成候选。
- UI：ReviewV3TemplateRoutingAssistant.tsx 展示候选、手动选择、D4CaseSetup、模型辅助推荐及兜底入口。
- D4：review-v3-main-d4-local-plan.ts 读取冻结 Workspace 与选择配置，再通过 attachD2RuntimePlan 安装非零 D2 technical plan。
- 非 D4 已发布模板：LOCAL_PRODUCT_MANUAL_CHOICE_V3 将模板绑定写入原生案卷，之后由标准 TemplateVersion 路径运行规则和 Pi。
- B1：review-v3-main-local-author-workbench.ts 提供作者修订/预览/冻结入口；review-v3-main-b1-local-plan.ts 将冻结候选编译并安装到原生案卷。

### 2.3 两条公共兜底路径

- **候选计划路径**：C11 unmatched → review-v3-b3-unmatched-author-bootstrap.ts 产生 B29 → renderer 的 review-v3-fallback-executable-plan.ts 将其整理为 B1AuthorDocument → Main 保存/冻结 B1 → review-v3-main-b1-local-plan.ts 安装候选 D2 plan。它不等于学校正式政策或正式发布模板。
- **标准模板草稿路径**：FALLBACK_TEMPLATE_DRAFT_V3 → review-v3-fallback-template-draft.ts → template-store.saveDraft。该路径生成普通 TemplateVersion 草稿，判据均为 semantic、无 policyRefs、无 deterministicConstraint，之后必须由 T01 负责人编辑/确认并通过标准发布校验。

## 3. 单文件盘点

下列“主责”是 C 本次审查的职责归属；A/B/D/E/F/G 字母用于提示总协调者进行跨模块合并，不代表代码文件只被某个会话阅读。

### 3.1 标准模板库与政策规则

- [builtin-templates.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/builtin-templates.ts)：定义两份项目内置模板和八份参考范本；另定义四份历史兼容模板。ensureBuiltinTemplateDrafts 幂等写入缺失版本、初始化模板目录顺序并将四份旧模板放入归档目录。特殊处理仅自动发布 comprehensive-assessment-v2@3；其余默认/参考模板不能一概当作已发布。
- [template-catalog.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/template-catalog.ts)：维护可见目录的顺序、归档/恢复状态；不是模板正文或发布状态的权威来源。
- [template-store.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/template-store.ts)：持久化 TemplateVersion、模板版本与发布资格控制记录；区分 regular-draft 和 candidate-held；提供保存、发布、停用、验证、目录排序与历史版本读取。publishTemplate 依赖 Main 侧 validateTemplate 和 publication control。
- [policy-store.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/policy-store.ts)：以文件存储政策版本，使用 SHA-256 校验正文与引用，发布版不可覆盖，模板引用要求已发布版本与 hash 一致。compileOwnerRules 是逐非空行的确定性文本切分器，不做语义理解；生成的 RuleSpec 均为 semantic，不能据此描述为自动生成了确定性政策规则。
- [effective-rules.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/effective-rules.ts)：将模板 policyRefs、模板分项 criteria、案卷级 reviewRules 汇成有效规则报告；校验已发布政策的状态、hash、来源和确认；同一规则身份可由案卷规则修正，不同政策来源的同名规则不能靠加载顺序覆盖。
- [f03-policy-resolution.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/f03-policy-resolution.ts)：按规则语义与来源处理去重、冲突、有效期及具名优先决定；未确认/冲突规则被保护为待人工核验，不按 priority 猜测制度效力。
- [workspace-rule-compiler.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/workspace-rule-compiler.ts)：将旧 RulePack/RuleOutline 映射为 RuleSpec；已支持的约束映射到 deterministic，未知约束降为 manual。未在本次已核验的 C11→T04 主链中找到直接调用；其完整运行调用者应由总协调者做全仓引用核查。
- [rule-section-scope.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/rule-section-scope.ts)：按 rule.sectionId 过滤可检查事项，避免分项规则越界读取其他分项 Subject。
- [boot-check.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/boot-check.ts)：通过 BOOT_CHECK_V2 调用模板播种；源码中 runBootCheckV2 是 IPC 可达入口，不应仅凭注释将它描述成 main/index 直接同步调用的启动钩子。

### 3.2 T01 模板编辑、导入与规则确认

- [review-v3-t01-typed-criteria.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.ts)：在 TemplateCriterionSpec JSON 上以可选 deterministicConstraint 扩展保存 field-number-limit；负责设置、负责人确认、校验、收集确认后的数值检查、导入时重置确认和编辑后撤销旧确认。该扩展目前不是 @profer/shared 中一等的共享类型字段。
- [review-v3-t01-brief-authoring.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.ts)：本地确定性地从自然语言需求与场景预设构造未确认 TemplateVersion 草稿，并记录提取项；不等同于模型推理或正式政策识别。
- [review-v3-t01-model-draft-port.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.ts)：构造模型提示、解析 JSON、通过模板导入逻辑规范化返回结果；模型结果仍是未确认草稿。
- [review-v3-t01-template-portability.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.ts)：模板 JSON 导入/导出；导入产生新 ID、v1 草稿并附来源提示。
- [review-v3-t01-versioning.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.ts)：派生新版本或复制配置，清除 publishedAt、回到 draft，并重置负责人确认。
- [review-v3-t01-business-presets.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-business-presets.ts)：提供 student、activity、scholarship、judging、expense、agreement、laboratory 七种模板起始场景及纯本地表单试跑；trialT01Template 不执行真实 Run、解析或规则引擎。
- [review-v3-t01-example-packs.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.ts)：提供六类标准示例包、虚构样例政策、表单样例和可上传的样例材料文件；这些示例不能当作真实学校政策或真实 Run 结果。
- [ReviewV3T01AuthoringLaunchpad.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ReviewV3T01AuthoringLaunchpad.tsx)：TemplateWizardPanel 内的本地 brief、模型起草、场景示例入口；自身不发布模板。
- [ReviewV3T01ConditionEditor.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ReviewV3T01ConditionEditor.tsx)：编辑条件 AST 的 UI 组件。
- [ReviewV3T01NumberRuleEditor.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ReviewV3T01NumberRuleEditor.tsx)：编辑结构化数值规则；任何语义变更会使旧负责人确认失效。
- [ReviewV3T01TrialPanel.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ReviewV3T01TrialPanel.tsx)：纯本地表单试跑，不是真实审核 Run。
- [TemplateWizardPanel.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/TemplateWizardPanel.tsx)：当前“模板库与业务配置”界面的主要模板编辑器；负责列表、草稿保存、复制、版本派生、导入导出、T01 字段/条件/数值规则、预览与发布。发布前会在 Renderer 调用 validateT01TypedCriteria；Main 的 template-store.validateTemplate 没有同一验证调用，这是一个边界缺口。

### 3.3 D4 50 套冻结候选与内容路由

- [review-authoring-v1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-authoring-v1.ts)：D1/D4 Workspace 的 schema、结构与来源映射校验；还提供 manifest 验证工具，但当前 D4 catalog loader 未调用 manifest 验证入口。
- [review-authoring-store-v1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-authoring-store-v1.ts)：旧 V1 作者态存储；本次未确认它是 C11/B1 当前工作流的活动存储，需保留为独立历史/兼容候选，不与 B1 vault 混称。
- [review-d4-common.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-d4-common.ts)：D4 通用候选与任务/条件映射辅助，供 D4 技术计划编译链使用。
- [review-d4-catalog.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-d4-catalog.ts)：加载固定 catalog，校验 50 项、G01–G08 数量、ID/版本唯一、publication=candidate-held、publicationAllowed=false、路径安全与 workspace Git blob SHA，并验证 Workspace schema。它会对 manifestPath 做安全路径解析，但不读取 manifest 正文、不验证 manifest 内容或重算 sourceSha256；sourceHeadSha/sourceSha256 目前只检查格式。
- [review-v3-d4-content-router.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-d4-content-router.ts)：按解析后的申请原件文本做精确模板名称/编号识别和业务信号匹配；OCR/vision 文本不作为自动路由依据。其输入类型允许包含任何 catalog item，不仅 D4 ID。
- [review-intake-routing-adapter-v3-b3.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts)：B3 保守路由会话，绑定 Main 派生的 owner/session/scope；只在材料集完整、恰有一个申请、材料归属同一 Subject、唯一高置信建议且未被用户中断时允许倒计时自动选择，否则要求人工选择或停留在 unmatched/awaiting-evidence。
- [review-v3-main-local-product-intake.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts)：C11 实际 IPC 路由接线；重新核验原件字节、构建 B2 staging、读取库存、组合本地已发布模板与 D4 候选，执行 B3 路由并提供中断、未匹配草稿、人工选择与只读暂存预览。
- [review-v3-main-d4-local-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts)：返回 D4 50 套候选和冻结选择；选择后校验 native Case、模板 ID/版本、候选资格及 G01-I 受控快照，使用 attachD2RuntimePlan 安装非零 D2 technical plan。
- [review-v3-d4-demo-publish.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-d4-demo-publish.ts)：将 D4 Workspace 转为 TemplateVersion 演示模板，所有判据 semantic、无 policyRefs，随后调用普通 saveDraft/publishTemplate。此路径与 candidate-held D2 technical-plan 路径有不同身份和执行语义，且没有专用测试文件。
- [D4CaseSetup.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx)：从 D4 本地候选列表读取模板，配置目标对象、Subject、场景和适用条件；不是标准 TemplateVersion 编辑器。
- [ReviewV3TemplateRoutingAssistant.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx)：主单案路由 UI，展示 B3 状态、D4 列表、已发布模板入口、模型辅助推荐及公共兜底。模型只推荐，用户仍须确认。
- [ContentReviewView.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ContentReviewView.tsx)：在模板工作区显式显示“发布 50 套模板”按钮，调用 D4_DEMO_PUBLISH_V3；UI 按钮和 toast 没有显式显示“演示”，与模块注释里的演示限定不一致。

### 3.4 B1/B29 公共兜底和计划转换

- [review-template-plan-adapter-v3-b1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.ts)：B1AuthorDocument 的结构契约与不可变计划描述编译；候选 descriptor 不代表正式发布或校方签发。
- [review-template-author-store-v3-b1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-template-author-store-v3-b1.ts)：B1 修订追加写入、父摘要链校验、文件安全读取、并发锁和冻结候选；作者身份须由 Main 授权层绑定。
- [review-v3-b3-unmatched-author-bootstrap.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-b3-unmatched-author-bootstrap.ts)：仅接受明确的人类兜底意图、完整同一 owner/Subject 材料集与唯一申请原件，产出 candidateOnly、publicationAllowed=false、schoolPolicyVerified=false 的 B29/B1 候选。
- [review-v3-fallback-executable-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-fallback-executable-plan.ts)：将 B29 初稿与人工确认的要求整理成 B1 语义审核候选；通过原件 hash 将 B2 暂存引用重新绑定到原生案卷 DocumentVersion，不能把临时 candidate ID 当作持久原件 ID。
- [review-v3-main-local-author-workbench.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-local-author-workbench.ts)：Main 侧 B1 作者修订、预览和冻结接线，随主进程启动安装。
- [review-v3-main-b1-local-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts)：将冻结 B1 候选绑定到原生案卷 D2 technical plan；这是候选技术计划路径，不是 TemplateVersion 发布。
- [review-v3-fallback-template-draft.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-fallback-template-draft.ts)：把 B1AuthorDocument 转为可编辑的标准 TemplateVersion 草稿；不生成 policyRefs 或 deterministicConstraint，判据全部 semantic，技术阶段不进入业务阶段链。
- [review-v3-main-author-plan-ipc.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts)：另一条权威门控的作者读取/CanonicalPlan 升级 IPC；review-ipc.ts 注册了它，但模块注释说明在独立 Main authorities 未安装时 fail-closed。本次核对 main/index.ts 的 C11 安装列表未见这些 authorities 的安装调用；不能将此路径与当前 B1 direct D2 attach 混为一谈。

### 3.5 规则计划、确定性检查与运行边界

- [review-v3-main-template-plan-bridge.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts)：从已发布 TemplateVersion 与有效规则编译 T04 计划；负责人确认的数值约束必须能无损映射，否则 unresolved 并拒绝不完整计划。
- [review-v3-t04-published-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-t04-published-plan.ts)：建立模板规则与目标字段/材料槽之间的绑定，要求真实字段、材料身份和明确确认。
- [review-v3-t04-rules-scoring.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.ts)：对冻结的 T04 计划执行确定性比较与检查状态转换；未知值不能当作 0。
- [review-v3-main-template-run.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-template-run.ts)：只接受已发布 TemplateVersion，拒绝 D2 technicalPlan 案卷；编译非空计划、执行 T04、调用 F07 来源/覆盖核对并写真实 ReviewRunV2。
- [review-v3-f07-plan-coverage.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-f07-plan-coverage.ts)：将检查结果与真实原件来源、绑定目标及覆盖台账核对；D 主责，C 只记录 T04 输出与它的契约边界。
- [review-v3-main-plan-provenance.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-main-plan-provenance.ts)：校验计划来源与发布证据；属于 A/G 的可信来源边界，C 只记录模板/计划来源如何进入该检查。
- [review-v3-t05-local-stage-plan.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-t05-local-stage-plan.ts)：依据模板阶段与 Run 状态计算可信阶段转换；B 主责，C 只记录 TemplateVersion.stages 的下游消费。

### 3.6 T06 批量路由（与 C11 单案路由分开）

- [review-v3-t06-template-route.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t06-template-route.ts)：根据物理分组/文件夹名称与已发布模板名称、编号提出分组模板建议；它是启发式建议，不是 C11 对申请原件正文的 B3 路由。
- [ReviewV3T06PhysicalImport.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/ReviewV3T06PhysicalImport.tsx)：物理文件夹/ZIP 批量导入 UI，按组选择或覆盖模板。
- [review-v3-t06-main-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-t06-main-service.ts)：校验所选模板必须是 status=published 的 TemplateVersion，再按组创建 Case 和 Batch；不能直接接收 D4/B1 candidate-held technical plan。
- [review-v3-t06-batch-intake.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/review-v3-t06-batch-intake.ts)：解析批量清单并预览分组分配，不是模板仓库。

## 4. D4 冻结资产清点

D4 目录在 acceptance/d4-unified-r01/catalog.json 中定义 50 个版本为 1 的冻结条目，分布为 G01=5、G02=3、G03=10、G04=8、G05=6、G06=9、G07=7、G08=2。该资产集合共 200 个 JSON 文件：50 个 workspace、50 个 manifest、50 个 selection、49 个 case 文件和 1 个额外 JSON；其中 16 个文件位于 fixtures 子目录，fixtures 数量与前述类型有重叠，不能重复加总。

- G01：g01-archive-utilization、g01-special-campus-card、g01-student-identity-correction、g01-political-procedure、g01-special-proof-seal。
- G02：g02-t01-review、g02-t02-review、g02-t03-review。
- G03：g03-t01、g03-t02、g03-t03、g03-t06、g03-t07、g03-t08、g03-t09、g03-t10、g03-t11、g03-t12。
- G04：d4-g04-t01 至 d4-g04-t08。
- G05：g05-t01 至 g05-t06。
- G06：g06-t01 至 g06-t09。
- G07：g07-t01 至 g07-t07。
- G08：g08-t02、g08-t03。

目录条目的 workspacePath 与 manifestPath 是 catalog.json 中的显式映射；路径结构并不完全统一，例如 G01-I、G07-T01–T07 的 workspace 位于子目录内，不能假设所有文件都位于模板 ID 目录根下。

## 5. 已确认的风险与差异

### C-01｜P1：D4 演示发布可能占用原生候选的相同 ID/版本

证据：
- ContentReviewView.tsx 的按钮直接显示“发布 50 套模板”，调用 D4_DEMO_PUBLISH_V3。
- review-v3-d4-demo-publish.ts 在某 ID 尚无 TemplateVersion 时，按 catalog entry.templateVersion（当前为 1）创建普通 draft 并 publishTemplate。
- review-v3-main-d4-local-plan.ts 在安装原生 D4 plan 时，如果同 ID/版本已经存在且不是 candidate-held draft，会拒绝并报 LOCAL_D4_TEMPLATE_ID_ALREADY_PUBLISHED_OR_OCCUPIED。

所以在干净的本机模板库里先点击“发布 50 套模板”，可能先把 D4 ID@1 发布为普通 TemplateVersion，随后同一个 D4 ID@1 无法再通过原生 candidate-held 入口安装 D2 technical plan。反过来，若已存在名字正常的草稿，publishD4Templates 只看 latest 与名称，并没有先判断 latest.status；它可能把草稿当作“已发布且名称正常”跳过。该函数没有专用测试文件。

建议总协调者决定：演示发布是否仍需保留；若保留，应使用独立 demo ID/版本或明确隔离的发布资格/存储，不应与原生 D4 候选共享可冲突的身份。另需为“干净库先发布”和“已有 candidate draft”两条分支补服务级测试。

### C-02｜P1/P2：内容路由候选可包含非 D4 模板，但候选按钮统一进入 D4CaseSetup

证据：
- review-v3-main-local-product-intake.ts 的 catalog() 将所有本机 published TemplateVersion 与 D4 候选放入同一 catalog。
- review-v3-d4-content-router.ts 的显式模板名称/编号匹配作用于传入的整个 catalog，不只匹配 D4 ID。
- ReviewV3TemplateRoutingAssistant.tsx 将 read.routeCandidates 全部渲染为按钮，点击后统一调用 chooseManual(templateId)；后续 D4CaseSetup 只读取 D4 候选列表。
- 同组件另外提供“本机已发布模板”折叠区，才会走 LOCAL_PRODUCT_MANUAL_CHOICE_V3 的普通模板绑定路径。

因此，原件正文若明确写出某个非 D4 已发布模板的精确名称，该模板可能出现在顶部候选按钮中，但点击后进入 D4 选择/计划安装流程，无法按普通 TemplateVersion 路径完成绑定。需要在分类结果中区分 D4 candidate 与普通已发布模板，并将点击行为分流。

### C-03｜P2：C11 目录构建没有沿用逐候选错误隔离

review-v3-main-d4-local-plan.ts 的 buildLocalD4Templates 路径有逐候选隔离；相关测试明确验证单个候选损坏只影响自身。但 review-v3-main-local-product-intake.ts 的 catalog() 首次构建 historicalD4Catalog 时直接对 50 个条目逐个调用 loadD4UnifiedWorkspace，没有 per-entry try/catch。若某一 workspace 缺失或 blob SHA 错误，C11 的材料路由读取可能整体失败，而 D4 列表接口仍可能返回其余可用候选。应由总协调者决定：路由是否 fail-closed 整体停止，或是否允许明确排除坏候选继续展示其他候选；并用测试锁定这一语义。

### C-04｜P2：D4 manifest 元数据没有在运行时被读取和校验

review-d4-catalog.ts 验证 workspace 的真实 Git blob SHA，并校验 manifestPath 是安全路径；但没有读取 manifest 正文、比对 manifest 内容，也没有根据实际源内容重算 sourceSha256。sourceHeadSha/sourceSha256 仅检查字段格式。review-authoring-v1.ts 虽有 manifest 验证工具，当前 D4 catalog loader 没有调用它。

如果 manifest 只是历史来源说明，应在文档中明确它不是运行时信任根；如果它承担来源完整性证明，应补上验证调用与测试。

### C-05｜P2：T01 数值约束的发布校验主要位于 Renderer

TemplateWizardPanel.tsx 在 UI 发布前调用 validateT01TypedCriteria；template-store.ts 的 Main 侧 validateTemplate/publishTemplate 不调用同一 typed-criteria validator。直接绕过 Renderer 的 PUBLISH_TEMPLATE_V2 调用，可能使不完整的 deterministicConstraint 被标成 published；后续 T04 bridge 会对未确认/不支持的约束 fail-closed，因此不是自动误判已被证实，但发布资格与运行可执行性检查不一致。建议由总协调者决定把 T01 typed constraint 提升为共享/主进程可验证契约，或由 Main 在发布时做等价校验。

### C-06｜P2：T04 编译器注释与实现/测试不一致

review-v3-main-template-plan-bridge.ts 顶部及 adaptT01ConstraintsToT04 注释称只接受 lte、gte 无对应算子；但当前实现明确把 gte 映射为 field-minimum，review-v3-main-template-plan-bridge.test.ts 也有“gte 下限规则编译为 field-minimum”的测试。review-v3-main-template-run.ts 的模块注释仍举 gte 为未映射约束示例。应更新注释，不应改动当前已由测试覆盖的实际算子行为。

### C-07｜P2：关键路由与演示发布缺少直接测试文件

本次 tree 核查未发现以下专用测试文件：
- review-intake-routing-adapter-v3-b3.ts
- review-v3-d4-content-router.ts
- review-v3-main-local-product-intake.ts
- review-v3-d4-demo-publish.ts

现有测试已覆盖 TemplateVersion 发布检查、F03 有效规则/冲突、T01 typed criteria、T04 编译/执行、B1 修订/冻结、D4 50 套列表与技术计划安装，以及 T06 分组建议。但这些测试不等于已验证 C11 的端到端路由状态机、D4 demo publish 与原生 D4 attach 的互斥条件，或 routeCandidates 在两类模板之间的 UI 分流。

### C-08｜P3：标准库、D4 候选与“公共兜底”命名容易被误解为同一套模板

- ALL_DEFAULT_TEMPLATES_V2 是 10 份内置/参考模板；另有 4 份历史兼容模板被移出新模板目录。
- 仅 comprehensive-assessment-v2@3 有特殊自动发布修复逻辑；不能将“种入目录”描述成“10 套全部可载入”。
- D4 的 50 套是冻结候选，publicationAllowed=false，但允许技术选型。
- B1/B29 的公共兜底不是一份静态的第 51 套模板，而是从未匹配业务和人类意图生成的候选/草稿流程。
- D4 demo publisher 又能把候选转换成普通 published TemplateVersion；这改变执行路径，不代表校方正式批准。

文档应为每条路径分别定义身份、发布资格、可执行计划类型、Run 类型和是否代表正式学校政策。

## 6. 已有测试证据（本次只读检查，未运行）

- template-store.test.ts：模板结构、默认播种幂等、发布检查、历史版本、目录归档/恢复、流程与量表检查。
- effective-rules.test.ts：模板、政策与案卷级规则的合并及同身份覆盖。
- f03-policy-resolution.test.ts：跨政策同名冲突、语义去重、具名裁定绑定候选哈希、有效期与未确认规则。
- review-authoring-v1.test.ts：D1 作者态来源映射、候选资格、manifest 来源修改检测及不支持条件的拒绝。
- review-template-author-store-v3-b1.test.ts：追加式修订、父摘要链、并发保存/冻结和 candidate-held 防提升。
- review-v3-main-d4-local-plan.test.ts：50/50 候选目录、真实冻结选择、单候选损坏隔离、G01-I 及一个真实 LOCAL_D4_ATTACH_PLAN_V3 入口。
- review-v3-d4-catalog-attach.test.ts：50 套 D4 均可编译/安装非零 D2 technical plan 的服务级覆盖；不能等同于 50 套都经过 UI/IPC 完整端到端。
- review-v3-main-template-plan-bridge.test.ts：数值上限/下限、未知值、材料缺失、负责人确认与未确认约束。
- review-v3-t04-published-plan.test.ts、review-v3-t04-rules-scoring.test.ts、review-v3-f07-plan-coverage.test.ts：正式计划、确定性检查、来源与覆盖。
- review-v3-fallback-template-draft.test.ts、review-v3-fallback-chain.test.ts：兜底草稿不虚构政策、技术阶段不进入业务阶段，以及后续标准发布/运行链。
- T01 renderer tests：brief、模型 JSON、场景预设、示例包、导入导出、typed criteria、版本派生。
- review-v3-t06-template-route.test.ts 与 review-v3-t06-main-service.test.ts：批量分组建议及物理入库服务。

## 7. 与其他分工的交接边界

- A：核对 review-ipc.ts、Preload 与 main/index.ts 的全部注册和 authority 安装，尤其是 review-v3-main-author-plan-ipc.ts 为什么仍 fail-closed，以及 CREATE_POLICY_V2 的发布时机。
- B：确认模板绑定、Case stage、Run 与业务决定的权威状态边界；T05 阶段规则只在本报告中作为下游契约。
- D：核对 D2 runtime plan、Pi 执行、formal TemplateVersion Run 与 background Pi Run 的语义差异和用户可见结果。
- E：确认 T06 批量导入只消费已发布 TemplateVersion 的设计是否符合批量审核目标。
- F：核对 routeCandidates 的两类模板分流、D4 demo 发布按钮的用户可见语义，以及两种兜底 UI 的区别。
- G：核对 shared TemplateCriterionSpec 是否应正式包含 deterministicConstraint；补查路由/发布路径的测试缺口与跨模块契约。

## 8. 本次完成边界

已完成 C 领域核心实现、主要调用链、D4 冻结资产目录、现有测试文件与关键设计文档的只读核对。没有修改生产代码，没有运行测试或 CI。未决事项已按 C-01 至 C-08 列出；本报告不把未运行测试描述为通过，也不将未找到的直接测试文件描述为绝对没有任何间接覆盖。
