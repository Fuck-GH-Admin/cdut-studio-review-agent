# CDUT Studio Review V3｜核心架构收口裁决 R01

**裁决版本**：V3-ARCH-CLOSURE-R01 / 2026-10-21  
**代码依据**：\`main@bea8df92fd70b34f3c06e287f09c4de43aa00f6b\`（创建文档分支时固定；后续 main 继续变化须做增量比对）  
**决策状态**：**ARCHITECTURE_DECIDED / IMPLEMENTATION_PENDING / PRODUCT_NOT_ACCEPTED**  
**范围**：只裁决 TemplateVersion→RuleSpec/CanonicalPlan→真实 ReviewRun→T05 本地业务决定。不是全仓重构，也不涵盖 T02 OCR、T06 ZIP、T08 PDF 等独立能力。  
**执行纪律**：本文可作为各 Owner 的共同工程合同；**文档合入本身绝不代表代码已完成或 A15 已通过**。共享 DTO/IPC/Main 修改只由本地 Main Owner 集成；领域 Owner 独立提交可复用代码；仅本地 Agent 有权真实 Electron 验收/合 main。

## 0. 不再讨论的基础裁决（保全）

沿用第三轮 PR #140 所选的「**增强 V2 CaseAggregate + 边界收敛**」：
1. **唯一业务真值**：\`case-store-v2.ts\` 的 \`CaseAggregateV2\`、\`state.v2.json\`、\`expectedRevision\`、Receipt/CAS；\`native-workspace-case-v3.ts\` 只提供 V1 兼容投影，不新建 CaseV3.json、第二套阶段状态或第二个最终 Decision writer。
2. **模板与政策**：\`TemplateVersion\` 发布后不可变；每个案卷锁模板版本。更正、升版、补件均创建新版本/Run 或追加事件，不改写旧 Run/Decision。
3. **来源真值**：原件字节/DocumentVersion/parseRevision 与精确 SourceRef 保持独立身份；事实确认及来源有效性由 Main 核验，模型文字不能自造引用。
4. **执行与决定分离**：Pi/规则引擎给出 Check、Opinion 和执行证据；真实业务决定由 Main 检查角色、适用业务模式、任务、Run 和模板规则后写入。
5. **历史模式保留**：D2/B1 \`technical-pre-review\` 继续不具备正式业务审批权限；不能为了跑通 A15 删除 \`AGENT_DECISION_DISABLED\` 或冒充学校身份。校方接入 S01–S03 是独立门禁。

**禁止项**：重新选择 V1/V2/V3 的总体主架构、整仓拆分状态库、再写一套规则执行引擎、用验收脚本给正式 Run 注入预期 Check、将模型建议当人工批准。这五项均不属于本轮工作。

## 1. 三个真实冲突及其来源（已核对 main）

| 冲突 | 当前可定位实现 | 后果 | 裁决 |
| --- | --- | --- | --- |
| **C1 模板不能可靠生成 T04 输入** | \`effective-rules.ts\` 能从 \`sections[].criteria\` 产出基础 \`RuleSpec\`；\`TemplateVersion\` 有 \`FieldSpec.max\` 和材料槽；\`review-template-plan-adapter-v3-b1.ts\` 能产出 \`CanonicalPlan\` 但 B1 check 只有自然语言要求；\`review-v3-t04-rules-scoring.ts\` 要求每个 PlanBinding 精确对应 RuleSpec+Operation | A15 S2 \`BLOCKED_OWNER\`；字段上限可能只拦表单而不会进入 CheckResult | **D1 发布模板的独立、确定性编译合同**；不以 B1 技术候选或自然语言文本冒充业务规则 |
| **C2 有 CanonicalPlan 就无法进行合法本地阶段** | \`review-v3-t05-main-service.ts:isLocalBusinessCase\` 对 \`aggregate.canonicalPlan\` 直接 \`return false\`；\`review-v3-t05-local-stage-plan.ts\` 已显式接受 \`businessMode:local-business/technical-pre-review\` | 若补足 C1 并绑定 CanonicalPlan，T05 会拒绝 A15 合法业务案卷 | **D2 基于 Main 可验证的用途/发布来源区分，不以“是否有计划”定义技术预审** |
| **C3 Run 是否有效与允许何种决定判得不够精确** | \`ReviewRunV2.inputManifest.documentVersions\` 才是真实字段；\`currentT05Run\` 却尝试读取 \`inputManifest.documents\`；\`t05DecisionReadiness\` 主要拦待确认/补件/执行失败，未精确核对全 Plan 覆盖、\`not-executed\` 和 \`non-compliant\` 的动作限制 | 更换原件后可能选中过期 Run；21 人超限不能仅靠 Run completed 被 stage-pass | **D3 Main 校验输入版本/计划覆盖与动作适格性；非合规结果不可自动等同可通过** |

以上是**源码事实与设计冲突**，不是凭 CI 结果推断。特别注意：现有 V2 \`v2-executor-factory.ts\` 已有 \`buildDeterministicRuleChecks\`，不应另建第三种公式引擎；T04 应复用/补齐确定算子并由同一正式 Run 写入。

## 2. D1 裁决：正式业务模板是作者入口，编译后才是审核输入

### 2.1 选定路径：TemplateVersion→一个冻结的可执行计划

**选用“模板发布路径同时产出完整规则与绑定工件”作为 A15 首选**；保留 B1 技术候选路径，但它不再是正常本地业务模板的必经入口。

~~~text
T01 编辑/确认 → Published TemplateVersion + 可验证 PolicyRef / OwnerStatement
                 ↓（纯领域编译，不能由 Renderer 自定义业务真值）
           compilePublishedTemplateReviewPlan(...)
                 ├─ CanonicalPlan（C0 现有版本，不制造新 Case 状态）
                 ├─ BindingRuleLedger（每 PlanBinding → 唯一 RuleSpec + 可执行 operation）
                 └─ MaterialSlot/Stage 关联（仍复用 TemplateVersion，不再造第二套 workflow）
                 ↓
              Main 可信安装/锁版本 → T04/V2 规则及 Pi 检查 → 单一 ReviewRunV2
~~~

**规范性最小函数合同（设计接口，非已存在的 API）**：

~~~ts
type V3PlanCompileInput = {
  template: TemplateVersion             // published + exact version
  effectiveRules: RuleSpec[]            // 版本化政策+模板条件+显式人工规则
  policyProvenance: PublishedPolicyLedger // Main 可复核：来源和发布权限
  targetSnapshot: CaseTargetSnapshot     // 真实案卷对象/字段类型和待确认状态
}
type V3CompiledBinding = {
  binding: PlanBinding                   // identity=(checkKey,targetKey,objectKey,subjectId)
  rule: RuleSpec                         // explicit, exactly one per binding
  operation: T04Operation                // compiled from rule's TYPED constraint
  policyVersionId: string
}
type V3CompiledReviewPlan = {
  plan: CanonicalPlan
  bindings: V3CompiledBinding[]
  // private immutable digest binds plan fingerprint to all rule/operation/source identities
  bindingLedgerHash: string
}
declare function compilePublishedTemplateReviewPlan(input: V3PlanCompileInput): V3CompiledReviewPlan
~~~

以上 \`PublishedPolicyLedger\` / \`CaseTargetSnapshot\` / \`V3CompiledReviewPlan\` 为**纯领域适配接口草案**，不是授权新增同名持久库。实现应尽量以现有 \`TemplateVersion\`、\`PolicyRef\`、\`RuleSpec\`、\`CanonicalPlan\` 和 \`PlanBinding\` 为基础；没有必要修改 \`CanonicalPlan.schemaVersion\`。模板版本是 \`number\`，C0 \`CanonicalPlan.templateVersion\` 为 \`string\`，需显式 \`String(template.version)\` 和逆向版本一致性检查。绑定集合按现有 T04 \`(checkKey,targetKey,objectKey,subjectId)\` 一一精确匹配，重复/遗漏 fail closed。

**约束冻结**：plan.fingerprint 必须**涵盖完整 effective rule ledger / typed operators / policy identities / target-conditional input 或其不可变 digest**；主进程在安装与 Run 提交时验证 exact published template、当前案卷版本和已选 Material/Source 版本。新增字段可作为现有合同的**向后兼容可选字段**或只读随附 descriptor；旧已发布版本不能被补写新规则，升级必须新版本 + explicit ACK + 新 Run。

### 2.2 哪些内容能自动编译，哪些不可以

A15 需要三类数据，**不可混为同一个概念**：

1. **表单校验**：\`FieldSpec.max=20\` 可以限制用户输入或提醒编辑器，**但它自身不是具名政策 Check**。必须存在模板负责人显式确认的、绑定 \`applicantCount\` 的业务规则，才能把「人数≤20」作为 \`CheckResult\`。
2. **正式确定性规则**：T04 目前已有 \`value-limit\` operation，但 \`compileT04Operation(RuleSpec)\` 的旧 \`workspaceConstraint\` 不支持通用字段 \`applicantCount\`，不能冒充 \`amount-limit\`/写死 amount。**选定一项很小的共享类型补充**：在 TemplateCriterionSpec 与 RuleSpec 之间提供同一个有限的结构化确定性约束声明（字段比较 \`lte\`、明确字段作用域、上限值及单位；必要时材料槽计数条件），由 T01 负责人**确认**后由 T04 编译为既有 \`value-limit\`/槽位 presence 执行。不要重复开发 parser/evaluator。未提供明确结构化条件 → \`unresolved/awaiting-confirmation\`，不得由纯文字 requirement 硬猜成合规。
3. **必交材料槽**：\`MaterialSlotSpec.minCount/requiredWhen/requiredAt\` 是独立的材料合同。其“当前已登记且有效”的状态由 Main/T02 文件登记决定；若参与 Plan 审核，必须有可枚举的 required-material 检查及基于真实 DocumentVersion 的 Check，**缺件时 sourceVersionIds 可为空，不得虚构来源**。旧的 submission 门禁继续使用，不能凭材料槽未提交而伪造一个 ReviewRun。

**数据来源与身份**：本地 A15 可以使用负责人明确输入的 \`owner-statement\` 作为模拟政策来源；必须记录 \`policyVersionId\`、enteredBy、时间和版本。不能标成 CDUT 正式政策；如果来源未确认、政策冲突或字段未人工确认，结果保持 pending。

### 2.3 选择的非方案（正式否决）

- **不选**“B1 check.requirement 文本自动转确定算子”：会把猜测作为事实。B1 candidate 继续做 technical preview，不能因为有 CanonicalPlan 就获得正式许可。
- **不选**“T04 不参与 A15”：违背“通用模板支持确定性审核”的产品要求。
- **不选**新 CaseV3/PolicyV3/RunV3 并行系统：与唯一权威裁决冲突。
- **不选**只在 UI 里把 \`applicantCount > 20\` 写进 A15 专属分支：这只能作弊通过验收，不能证明通用性。

## 3. D2 裁决：Plan 是执行合同，不是审批许可证

当前 \`isLocalBusinessCase(aggregate)\` 把所有 canonicalPlan 案卷拒绝，是需要修正的**错误业务分类**。改成 Main 派生的**用途/发布来源**，而非单纯结构存在性：

| 情况 | 能执行技术审核吗 | 可进入本地阶段吗 | 可形成校方正式决定吗 |
| --- | --- | --- | --- |
| B1/D2 \`technical-pre-review\`、candidate-held、publicationAllowed=false | 是 | **否** | **否** |
| Published TemplateVersion、Main 确认本地业务发布与 Plan 身份且 \`businessMode=local-business\` | 是 | **是**（真实 Run/阶段 gate） | **否**（除非另有学校信任接口） |
| 学校授权模式，实际学校角色+政策发布门禁均通过 | 是 | 依学校阶段配置 | **仅授权后**，不在 A15 本地演示范围 |

**最小分类合同（规范性语义）**：由 Main 根据已发布模板、安装收据、publisher provenance、Plan fingerprint 与业务实例绑定，形成**可信 \`effectiveBusinessMode\` 读模型**；不得由 Renderer 传字符串就升级业务能力。它可以通过现有版本化安装收据或小的兼容字段持久，**不建立第二套业务状态机**。Main 明确拒绝 \`d2RuntimePlan.mode=technical-pre-review\`、unpublished candidate、缺任一权威来源。已知旧历史案卷不能根据“没有 Plan”就自动赋本地办理权。

实现指令：
- T05 领域函数 \`planT05LocalStageAction\` 已支持 \`businessMode\`，**保留复用**；L 更新 \`isLocalBusinessCase/readT05StageCapability/recordT05StageDecision\` 的 Mode Resolver，不改其阶段算法。
- 原 T05 \`deriveT05LocalActor({role:'teacher'})\` 是**本地模拟角色选择**，不能称为学校身份认证。A15 允许明确标注本地模拟 teacher 来测试阶段；正式学校审批仍必须由真实 school principal 派生，不能用该 role claim。
- 业务模式即使是 local-business，也**仍须**独立检查已发布模板、当前 Run、真实任务、分派、expectedRevision 和人工决定的提交资格。技术结果永远不会自动变成正式学校批准。

## 4. D3 裁决：Run 的真实性与“允许什么动作”必须分开

### 4.1 统一 Main Run 有效性条件

**复用唯一 \`ReviewRunV2\` writer**；若 \`inputManifest\` 目前不能记录 Plan fingerprint，可通过向后兼容的可选字段/已有 C0 RunEvidenceIdentity 引用，固定 \`planFingerprint\` 和 current input snapshot（不得另建正式 Run）。在 T05 决定事务提交点，至少逐项验证：

1. \`run.id / caseId / templateId / templateVersion\` 与案卷一致、真实 RunStore 可查，Run 状态允许用于该动作。
2. **必须读取 \`run.inputManifest.documentVersions\`**（不是当前 \`currentT05Run\` 使用的不存在的 \`documents\` 字段），并与当前有效 DocumentVersion 集合/内容 hash/parseRevision 对比；原件替换或补件 → 旧 Run stale。核对 \`observationIds\`、\`evidenceLinkIds\` 及案卷版本依赖；不能只检查是否存在某个活跃文件 ID。
3. 冻结 Plan fingerprint、RuleSpec/Policy 版本及 exact binding-check 覆盖相符；\`plannedChecks\` 与真实 \`CheckResult\` 逐项映射，0 findings ≠ 全部有效审核。
4. 输入字段已确认，时效与来源有效；待确认、\`not-executed\`、\`execution-failed\`、未关闭补件、未解释的规则冲突均阻断自动通过；\`not-applicable\` 须有可核查的适用条件证据。
5. 本地 Actor、任务/阶段、当前 revision 和对该 action 的业务资格再次在 \`submitCommand\` 内核对。Run completed **只是执行生命周期，不是业务决定许可**。

主线已存在 \`workspace-business-service-v2.ts:isWorkspaceRunStaleV2\`、\`run-service-v2.ts\`、\`run-store-v2.ts\`、来源有效性门禁，可优先复用，避免独立定义“当前 Run”的竞争判断。

### 4.2 业务不符合≠执行失败≠有权通过

| Run Check | 允许的后续方向（规范） | 特别限制 |
| --- | --- | --- |
| \`compliant\` 且覆盖/证据全部有效 | 允许具权初审或继续人工核对 | 不是自动行政批准 |
| \`non-compliant\`（如 21 人 >20） | 明确拒绝、退回修改或**具名且模板允许**的例外复核 | **不能默认 \`stage-pass\`**；必须有明确例外或人工更正的新确认依据 |
| \`awaiting-confirmation\` / \`awaiting-supplement\` | 补件/人工核对 | 未解决不得 pass |
| \`execution-failed\` / \`not-executed\` | 重试、恢复、手工转办 | 不得当作不合规，也不得默认 pass |
| \`not-applicable\` | 可跳过此检查 | 需真实适用性依据，不得因为缺字段就标 N/A |
| 尚未创建真实 Run | 可以依模板开缺件/补件任务 | 不能虚造 Run ID、Check 或最终审批 |

**裁决的动作合同**：将 \`t05DecisionReadiness\` 调整为面向 \`stage-pass / return-for-supplement / final-reject / return-to-previous-stage\` 的**按动作适格判定**。其结果是允许动作与阻断原因的投影；业务 \`non-compliant\` 不是“一律不许作任何决定”，但需禁止无依据通过。正式决定追加 \`BusinessDecision.basedOnRunId\`、actor 来源与理由；历史结论不被“修正”为通过。

### 4.3 不扩大安全工作量的必要修复

只处理**实际存在**的三类错误：过期 Run 误选、覆盖不足误判、技术预审/本地业务分类冲突。并非要求新建身份平台、重造审批工作流或构造大量恶意用例。

## 5. 唯一应实施的最小接口与模块归属

| 接口/产物 | 实施 Owner | 以现有代码为起点 | 完成判定 |
| --- | --- | --- | --- |
| \`TemplateCriterionSpec\` 的**有限确定性约束描述**，本人确认后的模板/政策来源语义 | **T01 模板领域**，与 T04 共同定类型 | \`packages/shared/src/types/review-v2.ts\`、\`TemplateWizardPanel\`、\`effective-rules.ts\`；最终共享类型变动由 L 合入 | 发布的 20 人条件能表达为稳定且可复用的规则，不仅是 \`FieldSpec.max\` |
| \`compilePublishedTemplateReviewPlan\`（上述编译返回 Plan+一一对应 Rule Ledger）；必要 \`RuleSpec\` typed clause 与 \`compileT04Operation\` 补充 | **T04 规则 Owner**，T01 提供模型/编辑输出、双方不用抢同一个生产文件 | \`review-v3-t04-rules-scoring.ts\`、\`review-template-plan-adapter-v3-b1.ts\`（仅复用稳定 fingerprint/target 思路，不让 B1 变正式业务前置） | 18/21/unknown/缺材料四案例形成明确定义、带来源的 proposed Check，全 PlanBinding 无遗漏 |
| **Main 可信 Plan 安装与 Run 绑定**，\`planFingerprint\`/case+source snapshot，必要 Main/IPC | **Local-L/Main Owner** | \`review-v3-main-author-plan-ipc.ts\`、\`review-v3-main-b1-local-plan.ts\`、\`run-service-v2.ts\`、\`case-store-v2.ts\` | 已发布模板冻结计划真实入案卷，T04 结果经现有 writer 形成 ReviewRunV2 |
| **业务模式可信解析器**：local-business vs technical-pre-review | **Local-L/Main Owner**，T05 领域 Owner 只确认语义 | \`review-v3-t05-main-service.ts\`、\`review-v3-t05-local-stage-plan.ts\` | canonicalPlan 本地业务可合法走阶段，D2/B1 技术预审依旧不可审批 |
| **Run validity / per-action readiness** | **Local-L/Main Owner**，T05 领域 Owner 提供最小动作适格逻辑 | \`currentT05Run\`、\`t05DecisionReadiness\`、\`isWorkspaceRunStaleV2\` | stale/未覆盖/21人超限不能无条件 stage-pass；退回/拒绝可合法办理 |
| 真 Electron A15 S2/S3/S4 | **Local-L 验收 Owner** | \`work/e2e/v3-e2e.mjs\` 和已合入 \`work/e2e/a15-fixtures/generate.mjs\` | 用户 UI + 真 DOCX + Run/Check/Decision + 退出/冷启动保全 |

**文件所有权**：T01/T04 可以在各自新功能模块与测试中并行开发，给 L 一个确定的 CONTRACT_REQUEST；\`packages/shared\`、Main、IPC、Preload、当前业务聚合 writer 的最终落地只由 L 统一集成。没有人可以独立合并一个含第二业务真值的“快速解决方案”。

**本轮不强制**：重写 T02/OCR、T06 ZIP、T08 PDF，批量极限压测、全量 120+30 模型测试和学校 S01–S03 认证。这些有独立验收门禁，不应阻塞 A15 通用单案。

## 6. A15 作为架构合约的反证实验（唯一完成门槛）

基础状态据 \`L3-DELIVERY-LEDGER.md\`：**S0 PASS、S1 PASS、S2 BLOCKED_OWNER、S3 PARTIAL、S4 NOT_RUN**。R01 裁决**不会**自行改变这些真实状态。

- **S2-01（正例）**：用户配置并发布模拟组织模板，\`applicantCount=18\`、真实 DOCX 计划书。生成冻结 Plan + 对应 RuleSpec，真实 Run 的人数 Check=\`compliant\`，材料槽有效且来源/version可查；不能用模型判定代替数值操作。
- **S2-02（反例）**：同模板 21 人，人数 Check=\`non-compliant\`，不允许未经具名例外依据直接 stage-pass；仍可按模板走拒绝或退回。
- **S2-03（未知）**：人数空/未确认时必须 pending，不能当零；缺计划书时按 \`requiredAt\` 阶段识别为缺件，不能虚构 SourceRef。
- **S3-01（补件）**：第一次 \`lab-12-unclear-reply.docx\` 内容不足，状态 responded/insufficient；第二次 \`lab-12-corrected-reply.docx\` 新文档版本，具名 reviewer 确认后新 Run，旧 Run 保留。
- **S3-02（合法阶段）**：已有真实有效 Run 的本地业务案卷中，reviewer 初审 → teacher（**本地模拟**，不是学校身份）终审，形成基于真实 Run 的决定；同一 canonicalPlan 在本地业务合法，而 \`technical-pre-review\` 依旧拒绝最终业务决定。
- **S4（完整旅程）**：全部通过现有 Electron UI，不使用开发专用 IPC 造假事实；创建/复用模板→建组织案卷→上传原件→一次开始审核→查看 Check/SourceRef→补件→初终审→报告→冷重启，记录实际 \`main sha/runId/documentVersionId/decisionId\`。

**验收结果**只可按 PASS/PARTIAL/BLOCKED_OWNER/BLOCKED_BRIDGE/NOT_RUN 逐项入旧 L3 台账；若涉及应用外学校审批，单独 NOT_IN_SCOPE。S2/S3/S4 全部真实通过并与 S1 保持兼容，才算 A15 核心产品架构闭环；这并不等于 F01–F18、100 案/500 文件和完整发布验收全部通过。

## 7. 执行顺序（防止又进入无止境设计阶段）

1. **R01 裁决冻结后立即进入实现**：T01+T04 共同约定一个有限 typed predicate 与 Plan/RuleLedger 返回值，在各自分支交付域代码（独立文件和最少针对性测试）。不得另开架构选型会或再写调查报告。
2. L 可**并行**复用/修复 \`currentT05Run\` 真实 manifest 字段、Run 适格动作检查、Plan provenance/业务模式读取，不必等 T04 才解决已经确定的真实 Bug。
3. T01/T04 合同完成后 L 小批集成，跑 S2。S2 通过后直接跑 S3 和 S4；出现实测反证时**只修裁决中与反证对应的最小契约**，不推倒 V3。
4. A15 架构门槛通过后，大并行补余下 F/A/U 功能；已经独立在建的 OCR/ZIP/PDF 不必停止。
5. 终局：文档中的 **DECIDED** 与代码 \`WIRED\`、验收 \`PRODUCT_ACCEPTED\` 必须分别标注；任何人不得把任务书合并看成业务真实完成。

## 8. 对照资料

- 历史总裁决：PR #140，\`docs/design/review-agent/acceptance/v3-round3-unified-architecture-r01/05-v3-options-and-selected-architecture.md\` 和 \`06-v3-domain-and-interface-contract.md\`（第三轮分支，**候选设计**）。
- 产品原要求：\`docs/design/review-agent/02-product-and-templates.md\`、\`03-architecture-and-delivery.md\`、\`04-acceptance-and-evaluation.md\`、\`06-workflows-and-usability-design.md\`、\`07-application-and-execution-design.md\`。
- 生产权威：\`packages/shared/src/types/review-v2.ts\`、\`packages/shared/src/types/review-v3-c0.ts\`、\`apps/electron/src/main/lib/review/{effective-rules,review-v3-t04-rules-scoring,review-v3-t05-main-service,review-v3-t05-local-stage-plan,run-async-service,case-store-v2}.ts\`。
- 最新真实差距：\`docs/design/review-agent/acceptance/local-l01/T04-INTERFACE-REQUEST.md\`、\`L3-DELIVERY-LEDGER.md\`。
- A15 真原件：\`work/e2e/a15-fixtures/generate.mjs\`、\`policy-LAB-SIM-v1.md\`。

**最终裁决一句话**：**V3 不换核心。由已发布模板的明确结构化规则形成唯一冻结计划；计划决定如何检查，不授予审批权；Main 对真实 Run 的输入与覆盖作强校验，再依据模板阶段和有权人员的实际动作形成业务决定。先用 A15 证明这条路真正能走通，再大规模并行收口。**
