# CDUT Studio D4｜G03 全领域 D3 模块化适配前置检查

> 日期：2026-10-17；性质：**源码与原始业务规范的只读静态适配审计**，不是 D4 技术模板交付、模型业务测评、E 阶段通过或校方审批授权。  
> 交付分支：audit/d4-g03-d3-preflight-20261017；不得修改 C/D/E 原件、隐藏 Gold 或 D2/D3 公共引擎。  
> 状态口径：**READY_TO_BUILD（可进入作者态/已支持子范围制作）**、**SUPPORTED（已有源码路径）**、**GAP（完整责任运行缺关键接口）**、POLICY_AWAITING / HUMAN_ONLY / NOT_RUN 分开记录。下文每组 R 均是**拟制作责任归属**，绝不是已生成/已测试 Check。

## 0. 独立结论与统一集成负责人行动项

1. **现行完整模板数为十套，规范性规则合计 277 条**。T01/T02/T03/T12/T06/T07/T08/T09/T10/T11 的 C 业务母版全文均在用户 ChatGPT Library/各独立作者交付中找到，并在本次对原始字节计算 SHA-256；全部标为业务候选 BUSINESS_MD_DRAFT_WITH_GAPS，不是校方正式制度。历史 T04、T05 合并至 T03 的 V02、V03，**不能当作独立模板漏做或重复制作**。
2. **现有 D3 足以开始全部十套的语义模块制作、模板草稿、来源绑定、模块冻结/引用/版本化、受控候选检查与无目标的案卷级技术预审**；B01/B02 是合成的局部语义复用候选，不是已获本校政策授权的成品模块。每套均为 **READY_TO_BUILD（受控基础层）**。
3. **现有 D2/D3 尚不足以完整运行十套模板所有“具体资源/人员/样品 × 时段/动作/版本”责任**：源码业务对象 enum 仅 campus-card/archive-item/archive-operation/student-field，非学籍模板的动态场景还受单一 campus-card 目标限制；部分三态事实门禁因没有精确 subjectId 在 case-level 必然 unknown。这是明确的公共技术 GAP，不可把业务范围改成档案操作、校园卡或学生字段来凑数。
4. **最小补充**：在既有 D1/D3 作者态、D2RuntimePlan、Pi RuleSpec 与现有案卷工具上，增加受控且稳定的**通用 G03 业务目标绑定**（例如 resource-use-item/custom-subject，具有对象 key、parent、scenario 及版本；实现名可另定）与**逐目标多轴条件选择**。保证同一申请多个目标各有 Check/Subject/SourceRef、gate、输入材料和部分结果；未知来源/条件仍 fail-closed。不要另建审核引擎、全领域硬编码规则或要求接校方实时 OA 才能制作语义候选。
5. **开工建议**：G03 十路作者可立即完成原文责任目录、模块草稿和可编译的案卷级安全子集；精确多对象/叠加条件的完整运行快照一律待 G03-GAP-01/02 修复并固定公共 Release 后再交集成验收。当前审计不宣称任何一套已完成 D4 全量转换，不代 E PASS。

## 1. 固定依据、来源与审计边界

### 1.1 技术和文档来源

| 对象 | 固定身份与证据 | 关键边界 |
|---|---|---|
| 仓库行为约束 | 根 AGENTS.md（main 静态读取） | 本轮仅写审计文件，不涉及 UI、主进程、README、引擎代码或依赖 |
| D3-R0 正式签署 | PR #9 的 2026-10-11 签署评论；**4b191c729f3d5f8135c73b87c17642023f6c3986**；release/d3-r0-20261011 | **正式 D3-R0 技术制作基线**，不从浮动 main 或分支 HEAD 猜 SHA；五套 G01 的旧交接不是 G03 原文签名 |
| D3-R0 交接 | docs/design/review-agent/37-d3-r0-frozen-release-and-d4-handoff.md；fixtures/d3-r0-handoff-manifest.json | D1 作者态、D3 模块锁、D2 Pi 真实案卷接口；原 G01 MD 不在 Git |
| D3-R1 待验技术实现 | feat/d3-r1-g01-typed-runtime-r01@**94d5ec32b6de1ac0c185b63b4aabfddaa29b1649**，Draft PR #83 | 学籍字段及受控快照等是该候选代码所见能力；**不能把未正式签署 R1 冒充统一 Release** |
| 契约 | docs/design/review-agent/15、23、24、32、35、36、37 号 D3/D4 规范 | 规范是验收合同；可运行边界以以上两个 SHA 下实际 TypeScript 为准 |
| A 统一目录 | ChatGPT Library：G03_02_统一模板目录与边界.md（2026-10-11，v0.1） | 10 个独立审核目的；旧 T04/T05 并入 T03 |
| B 深调研 | 各 G03-TXX 的 B v0.2 研究包和 C 母版内 F/MS/EV/R 溯源；E E0 原件锁表 | B 是字段、材料、条件候选与来源证据，不自动变成当期本校强制政策 |
| C 制作 | 本报告 §2 的十份完整原 MD；C 作者验收对接、来源矩阵、编辑器模块候选 | MD 原件在 ChatGPT Library，不擅自上传公共 Git，也不改原字节 |
| D 历史交付 | G03 E r01 的原 A1+B10+C10+D(INPUT/EVAL/REPORTS) 各10，共51 SHA；E r02 的九份公开增量 D 补证 | 不读取隐藏 Gold；增量证据 commit 不替代原 D 制作 commit |
| E 正式审计 | audit/g03-e-v1-r02@**ad74aa70fa284af71973d3344e6ff8caeb089156**；docs/design/review-agent/business-templates/G03/acceptance/E-v1.0/r02/ | E_DESIGN_ACCEPTANCE=BLOCKED_INPUT+BLOCKED_SOURCE；T06 旧 Gold FAIL_INDEPENDENCE；没有任何 G03 正式 E PASS |
| E 研究轨 | research/g03-e-v1p1-r04@**0f42aeb696be677cef044b40e33af7091c339a9a**，research-r04/r04-decision-and-handoff.md | 研究性静态复核/合成契约试验，不变更正式 E 状态；T09 R-29 明确“自动审批开关不等于有权审批事件” |

PR #9 正式签署定位：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/9#issuecomment-6110379696

D3-R1 实际源码检视：
- packages/shared/src/types/review-authoring-v1.ts：ReviewAuthoringWorkspaceV1、局部/共享模块、Use、SourceBinding、gate 和 studentScope。
- packages/shared/src/types/review-d2.ts：D2TargetKind、D2ScenarioSelection、D2GateExpressionV1、D2RuntimePlan。
- apps/electron/src/main/lib/review/review-authoring-v1.ts：validateReviewAuthoringV1、compileReviewAuthoringCandidateV1、来源和门禁校验。
- apps/electron/src/main/lib/review/review-d3-module-library.ts：freeze/reuse/inspect/import/export、依赖锁、digest、版本冲突。
- apps/electron/src/main/lib/review/review-d2-runtime.ts：validateTargets、compileD2RuntimePlan、D2 plan attach/create/verify，Pi 任务包。
- apps/electron/src/main/lib/review/review-d2-execution-gates.ts：三态条件、确认证据、材料提供方和提交拒止。
- apps/electron/src/main/lib/review/review-d3-dynamic-case.ts：专门针对档案 item/operation 的动态实例化；不可无依据称其支持任意 G03 对象。
- apps/electron/scripts/review-d3-library.ts、review-authoring-v1.ts、review-d2-plan.ts、review-d3-md-coverage.py：真实已有的制作/验证入口，**不是 MD 自动转模板**。

### 1.2 源文件固定清单与可定位性

以下 SHA-256 是本轮对 Library 读取的完整原始 MD 字节计算所得；文件均不在本报告提交中复制。相应章节的 R 编号及 F/MS/EV/分支构成可定位的原文责任。完整文件可在用户 ChatGPT Library 按确切文件名查找：

| 模板 | 业务目的 | 原业务 MD 文件 | SHA-256 | 原文 R 编号 | 版本/制作开工 |
|---|---|---|---|---|---|
| G03-T01 | 公共教学教室临时借用 | G03-T01_正式业务模板_MD_v0.1.md | 5dd90cd20cb814c7dfedfb8a95e292c8372c801c74e62d83f8e937e37ce52273 | R-01～22 | 草稿完整；READY_TO_BUILD |
| G03-T02 | 部门会议室与会议用途预约 | G03-T02_正式业务模板_MD_v0.1.md | ccc47640de8023e4b258abdcd6cd17603b99a43f501e14fea7712655de3652ae | R-01～28 | 草稿完整；READY_TO_BUILD |
| G03-T03 | 校园公共活动场地借用（V01/02/03） | G03-T03_正式业务模板_MD_v0.1.md | 419ef4ad231b51f9caba9b2d9f82b42a83a1ebda8559dd24de10056e948ba9a8 | R-01～30 | 草稿完整；READY_TO_BUILD |
| G03-T12 | 体育场馆集体活动借用 | G03-T12_正式业务模板_MD_v0.1.md | a6c7131a8b8dbf5e14cfab532d0eaa7db880ef09237c18045bedf7df3325dd8b | R-01～27 | 草稿完整；READY_TO_BUILD |
| G03-T06 | 共享仪器平台课题组加入和账号授权 | G03-T06_正式业务模板_MD_v0.1.md | 8bc189af1d53125023b5e93ecd78cb07b4148abb5098921ccc0c02dae1bbaa88 | R-01～22 | 草稿完整；READY_TO_BUILD |
| G03-T07 | 指定仪器培训考核与独立操作资格 | G03-T07_正式业务模板_MD_v0.1.md | d166e3f118b63e54ead87e82a38e6684e42dd83cd3d57b3684ddc29cea4da862 | R-01～32 | 草稿完整；READY_TO_BUILD |
| G03-T08 | 仪器自主上机机时预约 | G03-T08_正式业务模板_MD_v0.1.md | c807cc90a3e6fd2d083abba5bcc828348555d18b65d396e7fa909b30c4692662 | R-01～36 | 草稿完整；READY_TO_BUILD |
| G03-T09 | 仪器送样检测委托 | G03-T09_正式业务模板_MD_v0.1.md | ca3195c16f7be049adbba5455393d1eb92bc7deda484721324784be7a1e720d0 | R-01～30 | 草稿完整；READY_TO_BUILD |
| G03-T10 | 实体宣传品布设和公共位置使用 | G03-T10_正式业务模板_MD_v0.1.md | 80ae0ba9c29cb1f2b3f04799743b498fe56b08ea3f3ee565ef8e120bac9e5552 | R-01～26 | 草稿完整；READY_TO_BUILD |
| G03-T11 | 校园电子屏内容与播放版位申请 | G03-T11_正式业务模板_MD_v0.1.md | bd051a6332d9c557fec3103d486747f3ceca042d928c3758ace6f35966f2eb98 | R-01～24 | 草稿完整；READY_TO_BUILD |

**关于固定来源的诚实边界**：十份完整 MD 能定位、能校验当前字节和原文编号；个别 C 作者交接有单独 SHA/压缩包。正式 E 指出的原始作者生产 commit、全部 B 原包/Gold ACL、2026 学校政策/OA 事实链仍不完整，不能从“MD 有 SHA”推断 E provenanceIntegrity PASS。若 D4 制作使用另外一版 MD，必须重新显式指定来源/比对差异，禁止把表中 SHA 偷换。

## 2. 实际能力矩阵：SUPPORTED 与受限部分

| 要求 | D3-R0/R1 实际机制 | 判定及使用守则 |
|---|---|---|
| 语义模块/本地专属责任 | D1 Module/Task（title/requirement/completion/limits），Template localTasks，D0.5 组合预览 | **SUPPORTED**；不用每个制度句子硬编码 |
| 共享复用 | D3 FrozenModule 的 moduleId+version+digest，use/reuse、依赖与锁冲突拦截 | **SUPPORTED**；只复用局部语义，不继承别校来源权威 |
| 作者草稿与版本 | workspace revision、候选 TemplateVersion、D3 portable bundle、upgrade/diff | **SUPPORTED**；冻结共享锁≠正式模板审批/发布 |
| 条件 | D1 template.scenarios；D2 when 的 all/any/not、case-stage、evidence-any、confirmed-observation；R1 trusted-registry-field 仅学生受控合成源 | **SUPPORTED（有限域）**；缺失/冲突 unknown 不得冒充 false，校本条件需有合法来源 |
| 校本来源绑定 | SourceRef（sourceId/kind/verification/applicability/documentVersionId/locator），每 Check 的 sourceBindings；D2 authority = request-scope 或 unverified-policy | **SUPPORTED**；跨校参考或校本待核默认只能报告待确认 |
| 材料提供方与合理替代 | gate.material(provider applicant/authority; dueStages; alternatives)，当前版本 reviewer-confirmed EvidenceLink | **SUPPORTED（精确 Subject 前提下）**；后置行政批准不能算申请人缺件，不可把材料存在当正式批准 |
| Check/RuleSpec | 预览产生 checkId，D2 编译 ruleId、sourceRefIds、semantic RuleSpec，plan mapping+fingerprint，Pi 提交/回执核对 | **SUPPORTED（可绑定已存在目标的场景）**；不承诺模型判别正确 |
| 通用 G03 业务对象 | R1 D2TargetKind 实际只接受 campus-card/archive-item/archive-operation/student-field；validateTargets 非此四类直接拒止 | **GAP-01**；G03 不允许伪装为 G01 类型 |
| 目标级多资源/多场景 | D2 模板含 scenarios 时：非 student-field 只准单一 campus-card/scenario/scenarioObjectKey；student-field 特例不适用于 G03 | **GAP-02**；完整多对象+分支会被阻断或失去对象独立性 |
| case-level 来源条件执行 | confirmed-observation/evidence-any 要求精确 subjectId 与当前 documentVersionId；无 subjectId 的 case Check 不能判为 TRUE | **有限支持**；单纯案卷语义仍可跑，但不能伪称条件门禁完整生效（归入 GAP-01） |
| 业务阶段 | 现有全局 CaseStage + reviewer-confirmed 版本化事实；不含各校 OA 的自动批准事件或 G03 完整行政状态机 | **部分 SUPPORTED**：等待/非适用和语义说明可制作；若需求是自动变更行政权限/实时操作，留 HUMAN_ONLY/外部系统待接入，不冒充完整实现 |
| 导出、重导入、技术运行 | D1/D3 validate/diff/export/import；D2 preview/create/attach；Pi 工具回执与 plan 指纹 | **SUPPORTED 的接口已实现**；本轮未实例化 G03 模板，也未独立实测全流程 |
| 正式审批/实时权威平台 | D2 技术预审始终 publicationAllowed=false；authority 材料不准 AI 直接 compliant | **有意不支持行政自动批准，不是 D3 BUG**。学校制度/台账/ACL 是业务外部依赖 |

### 2.1 逐条技术去向（适用于 §3 的全部 277 条 R）

- **原文 R 责任** → 将业务句子/完成标准/边界保留在 workspace-local 的 ReviewAuthoringResponsibilityV1；对不同对象需要不同输出的责任拆成不同 task/use；不可把多项不同许可压成一个笼统“合规”。
- **条件/例外** → 分支级限定由 template.scenarios/use.scenarios 或 D2 when 承载；只有已确认的实际目标事实允许门禁评定 TRUE/FALSE；未知→awaiting-confirmation；没有 G03 Subject 时记录 GAP-01/02。
- **FieldSpec/材料槽** → 在 D4 源目录登记 F/MS/EV 来源、材料提供方、最早到期阶段、有效替代；引入 D2 rule.gate.material + EvidenceLink；普通语义提取仍可由 Pi 完成，不必全部生成固定数据库字段。
- **Subject** → 审核资源/人员/仪器/样品/点位/屏幕/时段的稳定目标；当前 D2 仅能给已支持类型生成逐对象 ReviewSubject，G03 目标未实现处不得标 implemented。
- **SourceRef** → 每 Check 保留本校/历史/外校/候选等性质，原件版本、有效时段、适用资源、原文定位；未取得本校效力只输出 policy-awaiting-confirmation。
- **Check + RuleSpec** → 真实 preview/checkId → compileD2RuntimePlan 的 RuleSpec、sourceRefIds、targetScope 和 D2RuleBinding；运行时 plan.fingerprint、材料版本和证据关联不可漂移。**§3 只是预备映射，不等于已经存在这些产物**。
- **输出** → 技术预审分项 compliant/non-compliant/needs-confirmation、补件/待事实/证据冲突/专业转办；行政通过、实际排场/开门/启用账号/上机/电子屏播发均交人或学校平台确认。候选壳仅有 item-feedback/manual-review，不能生成正式批准或改变学校资源权限。

### 2.2 三种责任分别处理

| 责任性质 | 推荐处置 | 反面边界 |
|---|---|---|
| **程序化门禁** | 精确对象/分支/版本来源绑定、阶段到期、合理替代、身份/代办范围、同一时段逐资源分项、权威事实未确认 fail-closed、活动改变引发审批适用重审 | 别用自由文本代替作用范围、触发条件或权限隔离；G03 Subject/分支部分待 GAP 修复 |
| **模型语义审核** | 用途/内容/样品描述和附件一致性、申请材料完整性、一般风险线索、专业审查需补充的事实、OCR 文本冲突说明、政策已明确情况下的理由解释 | 模型“看起来合理”不得代替真实校本事实及特殊安全许可 |
| **必须有权人/系统决定** | 当前教室与场馆日历/负责人批准、会议活动独立许可、仪器 PI/机主授权、特种设备资质、安全/医学等专业判定、样品技术受理、实体宣传布设许可、电子屏内容签审/播控、解除/撤销及行政申诉 | 不能通过生成自动审批事件、把外校表单标成校规或通过 Pi 直接写学校业务系统 |

## 3. 十模板逐项覆盖与模块组合建议

下面每一表内的 R-xx 分组是原文第 9 节（T07 第 11 节）逐条、**不重不漏**的 277 条规则“**拟模块归属**”。其余非 R 责任（F/MS/EV、业务目标、业务阶段、排除项、输出与原文警告）同样必须保留，不能因为 R 编号齐全就宣布原文 100% 转换。每套的 SourceBinding 按具体 use/Check 重新绑定，不能复用同一个“校规已证”属性。

共同可复用局部候选（非强制引用）：**B01**=agent-authorization@1（只核代理权限有无覆盖人/事项/有效期），**B02**=evidence-source-boundary@1（证据、事实、有效版本、权威边界）。冻结 digest 见 R0 manifest。G03 的资源审批资格、特殊项目安全与学校政策，必须保留各套**本地业务专属模块**。括号中的 R 编号不是预先编造的 Check ID。

### G03-T01｜公共教学教室临时借用（22/22）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 局部 + T01 身份/有权发起 | 02,03,11 | 教师、学生、社团/代理/前置意见；证据与来源条件绑定 |
| B02 局部 + T01 材料/事实 | 04,17,20 | 活动主表、跨材料一致性、权威课程/占用台账版本 |
| T01 教室时段与资源准入 | 01,05,06,07,08,09,10,21 | room_id×slot_id，教学/考试优先、容量、超期/假期、逐时段部分许可；必须准确 Subject |
| T01 活动关联许可/执行 | 12,13,14,15,18 | 讲座/社团/调补课、多媒体/后勤、学校有权批准 ≠ 物业开门 |
| T01 变更/政策有效期 | 16,19,22 | 预占/撤销/调整、旧授权/身份和制度版本失效 |

**分支/输入/输出**：教学教室与其他场地互斥；一次多房间/多 slot，按原条件触发社团、讲座、涉外及设备支持；申请人主表、资源时段、主管事实、审批回执分属不同提供方。可立即编写 22 个原 R 责任的模块及安全案卷级结果；**GAP-01/02**：无法完整编译逐 room×slot 的范围检查、部分批准与校方条件叠加。校本课程日历缺失属于 POLICY/FACT_AWAITING。

### G03-T02｜部门会议室与会议用途预约（28/28）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T02 主体/代办/导师 | 02,03,17,18 | 教师直申、学生导师账号、经办授权、导师单次审批 ≠ 房间终审 |
| B02 + T02 证据和权限 | 04,27 | 主表事实与截图/官方 OA 证据来源分离 |
| T02 房间/时段 | 01,05,06,07,08,09,23,24 | room×slot 容量、冲突、设备、时限、收费、局部结果 |
| T02 会议事项/上游 | 10,11,12,13,14,15,16,20,28 | 组会豁免、哲社/国际/校级会议、领导出席等只按生效条件触发；会议许可≠房间许可 |
| T02 批准状态和变更 | 19,21,22,25,26 | 预锁/正式否决、改期、执行后材料、涉保密最小化 |

**分支/输入/输出**：会议室主管、申请角色、上游会议类别、单多 slot、变更状态为独立轴；MS-01～16 的申请人与有权单位材料到期阶段不同。案卷级审核模块 **READY_TO_BUILD**；逐 room×slot 以及多轴 unknown/TRUE 并行必须 **GAP-01/02**；不把外校提前期、导师制度套成本校政策。

### G03-T03｜校园公共活动场地（V01/V02/V03，30/30）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T03 合法主体 | 02,14 | 组织发起资格、校外协办和授权范围 |
| B02 + T03 表单/来源/隐私 | 03,27,28,29 | F-001～058、MS-01～25、跨文书、外校规则不上升为强制 |
| T03 资源行与三互斥变体 | 01,04,05,06,07,26,30 | 每 resource_use_item 单取 BR-01/02/03；多资源行可各自不同 |
| T03 安全与并行专业许可 | 08,09,10,11,12,13,15,16,17,18,19,20,21 | 法律/保卫/公安/舞台/临时电/外来嘉宾/商业/宣传独立权限；风险附加条件可叠加 |
| T03 变更/结果归属 | 22,23,24,25 | 每资源行许可范围、上游审批与实施阶段/部分批准分别输出 |

**分支/输入/输出**：旧 T04/T05 只是 V02/V03，不可丢条件附件；方案、安全承诺、外部许可由各自阶段与权责人出具。**GAP-01/02 是完整运行的强阻断**：逐资源互斥分类+多重附加触发无法由“仅一个 campus-card scenario”代替。C 母版虽有来源不确定，语义制作可立即开始。

### G03-T12｜体育场馆集体活动借用（27/27）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T12 资格与集体活动主体 | 01,02,10 | 班级/社团/部门、负责人及代理 |
| B02 + T12 输入/隐私 | 03,24,25,26 | 主表及材料等效、多文书一致、隐私最小化 |
| T12 场馆分区×场次 | 04,05,06,07,08,09,20,22 | 训练/教学优先、维修、容量/安全、每片区和时段独立 |
| T12 方案、责任与主管许可 | 11,12,13,14,15,16,17 | 风险方案、特殊器材、付费合同、保卫/场馆/外部审批分离 |
| T12 生命周期/执行界线 | 18,19,21,23,27 | 提交≠批准、后置材料、改期/撤销/正式否决 |

**分支/输入/输出**：体育馆/体育场子区域与场次是实际许可 Subject；不等于个人自助付费锻炼。基础模块 **READY_TO_BUILD**；逐分区/时段、课程占用及安全许可组合 **GAP-01/02**；本校大型活动阈值需政策 owner。

### G03-T06｜课题组加入与账号授权（22/22）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T06 成员/PI/代理授权 | 01,02,04,10,11,15,22 | 批量多成员、跨 PI 合作、经办人身份及授予范围 |
| B02 + T06 权威记录与隐私 | 17,21 | 系统成员底账优于用户陈述；不索取密码/非必要敏感资料 |
| T06 入组资格/资金分权 | 03,05,06,07,08,09,16,18,19 | 成员资格、项目/经费来源和账套权限必须独立，可按子项部分生效 |
| T06 生效/撤权链 | 12,13,14,20 | 注册≠已激活；有权 PI 审批≠系统技术写入；撤权历史与生效时间 |

**分支/输入/输出**：成员、课题组、PI、项目/支付权是有向关系；校本可允许 PI 直接添加，不能无条件强制申请表。**GAP-01** 阻断多成员/组/资金的精确主体和可追踪部分批准；关联事实可语义核对并待有权系统确认，不因缺实时组员查询硬编码新引擎。注意 T06 **原 D Gold 独立性失败只影响正式验收**，不阻止 C 到 D4 作者态转换。

### G03-T07｜仪器培训考核与独立操作资格（32/32）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T07 人员/导师身份 | 02,03,21,22 | 被培训人和代理、导师资格分离 |
| B02 + T07 来源/等效证据 | 09,17,20,23,30 | 纸电等效、官方成绩和授权记录、制度/设备配置未知 |
| T07 培训/具体设备事项 | 01,04,05,07,08,10,18,19,24,31 | 现场培训/通用安全/单机考核不得互代；分设备、分功能 |
| T07 授予/有效期/撤销 | 06,11,12,13,14,15,16,25,27 | 个人×设备×功能资格、续期复训/有权停权；不能把考试合格当已授权 |
| T07 阶段与程序输出 | 26,28,29,32 | 未考核/驳回/补件/有权授予各有不同终态；T08、T09 非首次申请必交 |

**分支/输入/输出**：报名→培训→理论/实操→正式授权→续期/撤销，学校各单机规则条件化。**GAP-01** 对同人多台、多功能状态产生相互隔离 Check/Subject；具体考核事件/审批/安全事实缺失由 HUMAN_ONLY 处理。基础语义制作 **READY_TO_BUILD**。

### G03-T08｜自主上机机时预约（36/36）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T08 申请/操作/支付权 | 02,03,06,07,22 | 预约人≠真实操作者≠PI/经费归口；正式禁约状态版本 |
| B02 + T08 事实/规则来源 | 28,29,30 | 校本设备权限/日历/版本未知保守待查，问题可逐段聚合 |
| T08 设备资格/实际安全 | 01,04,05,09,10,11,16,17,18,31,32,33,34,35,36 | 单机授权、一般安全/专项安全/特种设备持证及实际开机许可独立 |
| T08 预约时段/审批 | 12,13,14,15,19,20,23,24,27 | segment×equipment×operator×booking revision；非工作时段、白名单和多级审批开关各自条件化 |
| T08 费用/后续执行 | 08,21,25,26 | 费率和条件合同，使用后惩戒/账单不能提前索要 |

**分支/输入/输出**：审批通过机时≠安全放行开机；申请/修改/取消/实际使用属于不同节点。**GAP-01/02** 精确多 segment 独立主体和安全条件叠加；单纯无校方实时设备接口不算当前技术模板无法制作的理由。**READY_TO_BUILD** 先做稳定语义/待核输出。

### G03-T09｜仪器送样检测委托（30/30）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T09 经办/经费身份 | 02,03,04,05,13,15,22 | 样品所有人、代理送测、项目/PI/校外合同各独立 |
| B02 + T09 主表、等效与待核 | 08,27,28 | 样品事实缺失、合理证据替代、平台配置未知 |
| T09 送样行/设备与安全 | 01,06,07,09,10,11,12,14,16,17,18,23,24,26,30 | sample×service×equipment，特殊保存、专业安全及收样/报告/处置分阶段 |
| T09 报价与收费 | 19,20 | 费用节点与方式按配置，结果不能越过有权审定 |
| T09 订单版本/自动审批 | 21,25,29 | 订单撤补，保密，配置 autoApprove=true **不能冒充特定订单正式批准事件** |

**分支/输入/输出**：委托送样与 T08 自主上机互斥，单次多份样品可以部分接收。**GAP-01/02** 多样品/检项/服务行精确输出与条件化；自动批准的学校真实事件是 SOURCE/HUMAN 责任。E r04 已静态排除“C R-29 直接把开关等同批准”的假设，不能据此要求重写 C。

### G03-T10｜实体宣传品与点位许可（26/26）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T10 申请/代办 | 02,05,15 | 主办与落款、校外组织代办资格 |
| B02 + T10 内容/版本/证据 | 03,04,13,19,23,24,25 | 审核版素材/二维码版本、真实性及注入隔离 |
| T10 宣传品×物理点位 | 01,07,08,09,10,11,12,14,18,21,26 | 实体载体、尺寸/安全/位置/时限，逐件和逐位部分许可 |
| T10 审批/执行/例外 | 06,16,17,20,22 | 活动批准≠点位布设许可；日常内部公告简化；撤展与后置材料不前置 |

**分支/输入/输出**：宣传品类型、布设点位、活动/商业标记和作品版本各自独立，不能复用 T11 屏幕发布权。**GAP-01/02** 一件多点位、多版本及局部撤销；内容语义可立即制作，实际张贴与撤展须有权人决定。

### G03-T11｜校园电子屏内容与播放版位（24/24）

| 拟模块/复用 | 原文责任 ID | 条件、对象、去向 |
|---|---|---|
| B01 + T11 主办/审批权限 | 02,04 | 申请主体与单位初审；宣传部门责任 ≠ 具体电子屏播控权限 |
| B02 + T11 素材、版本、可靠来源 | 03,07,08,17,19,20,21,22,23 | content_version×screen×window 的跨文书版本/图片视频/二维码；外校条件不上升为强制 |
| T11 屏幕与窗口业务 | 01,05,06,09,10,11,14,15 | 逐屏播发窗口、格式/安全/商业/紧急申请；技术适配不等于正式批准 |
| T11 内容签审/播放执行链 | 12,13,16,18,24 | 内容批准、排期、实际播出与故障、撤稿各独立有权事件 |

**分支/输入/输出**：屏幕、内容版本、播放时间三维对象，文件改变须有受影响重审且不取消未受影响屏的判断。**GAP-01/02** 多屏/多窗口与内容修订的独立 Rule/Subject；播控无校方授权时只可待核，**READY_TO_BUILD** 基础语义部分。

## 4. 精确 GAP 清单（工程真实缺口，避免滥报）

| GAP ID / 级别 | 源码精确证据 | 涉及模板/受阻原文责任 | 最小补充与验收证据 |
|---|---|---|---|
| **G03-GAP-01 / BLOCKING_FULL_RUNTIME**：G03 精确目标类型与来源门禁 | R1 packages/shared/src/types/review-d2.ts 的 D2TargetKind 仅4种；review-d2-runtime.ts 的 validateTargets 对其他 kind 抛 D2_TARGET_INVALID。compileD2RuntimePlan 按 objectKey 绑定预览 task 到 target；无 G03 目标的 case-level gate 中 confirmed-observation/evidence-any 因 subjectId 为空只能 UNKNOWN | **十套全部**：T01 R05/06/09/21、T02 R07/23、T03 R01/26、T12 R04/22、T06 R18/22、T07 R06/18/31、T08 R13/27/36、T09 R09/24、T10 R07/18、T11 R08/14 等；对应所有精确对象和文书版本责任 | 在现有类型/编译/提交核验上追加一个不冒名 G01 的通用目标，必有稳定 objectKey/subjectId/kind/父对象或关联维度/条件对象与版本；每个 module-use/task 可绑定目标；相同 R 对不同对象产生不同 Check/SourceRef/RuleSpec；未知/冲突拒绝推定通过；保存/重导入/Plan fingerprint/真实 Pi 回执仍可核；新测试至少覆盖两同类对象与一条越权串证负例 |
| **G03-GAP-02 / BLOCKING_FULL_RUNTIME**：逐对象复合分支 | R1 review-d2-runtime.ts 的 compileD2RuntimePlan 对非 student-field 的有分支模板只允许**单 campus-card scenario + 单目标**；多场景 scenarios 只放行 student-field 特例；动态建案适配器 instantiateD3ArchiveCaseV1 又固定档案用途 | **最明显 T02/T03/T08/T09/T10/T11/T12**：T03 三资源类型在每 resource_use_item 互斥而风险条件并行叠加；T08 多segment的安全/禁约/收费；T11 每屏每版本每窗口；T01 多slot并行许可；T06/T07 分成员、分设备条件也受影响 | 不另创第二引擎，只在现有 D2 选择与模块 use 上允许通用目标逐条声明互斥 variant 和复合独立条件；条件 TRUE/FALSE/UNKNOWN 对每个目标独立计算且不把无配置默认降为普通类；编译同案两资源（V01+V03）且另有独立高风险条件、只触发指定对象附件；负例证明跨目标不会合并授权；保留原 D3-R0/R1 G01 回归 |
| **非 GAP：业务权威与外部系统暂缺** | D1/D2 将 policy-candidate/unverified-policy 限定 awaiting-confirmation；authority material 不准 AI 输出正式 compliant | 校发〔2023〕13号全文、2026 OA 主管、场馆/仪器可用性、部门权限表、审批原事件、T11 屏幕权限等 | 补原文/有效性/有权配置或受控人工确认即可；**不要求把所有 OA/政策接口内置 D3 才开工** |
| **非 GAP：不能让 Pi 直接审批/操作** | publicationAllowed=false；review-d2-execution-gates.ts 对 authority-owned 审批材料拒绝“已批准”直接结论；没有校方可信签署接口 | 全十套：使用许可、入组激活、独立操作、开机、送样正式接收、宣传发布/撤稿 | 保留 HUMAN_ONLY、WAIT_AUTHORITY、待签批；未来有合法独立对接任务时再增功能，D4 不擅自造授权 |
| **非 GAP：Gold/原作者 SHA/E 状态未完** | E r02 正式终判、D/E 输入来源指针及 T06 Gold 独立性 | T06 Gold，新旧 T10 Gold 指针，以及十套 E ACL/来源核验 | 不阻止制作语义候选；但不能称 D4 质量验收/真实学校规则 E PASS |

**限制说明**：GAP-01/02 的“必须补”是指**忠实覆盖原文多对象、条件、阶段的完整运行技术模板**。它不意味着所有事项都需要程序化业务判定，也不要求实现自动真实审批。若将任务收窄到一个案卷级语义检查，可在当前 D3 受控跑，但这只是**子集**；按完整业务模板范围不得标全量 SUPPORTED。

## 5. 集成顺序、完成门槛与本次未做工作

**立即允许（十套均 READY_TO_BUILD）**：按 §1 校验原文 → 为每份 C 建立 source-catalog（R/F/MS/EV/分支/例外/输出）→ 将 §3 的 277 条 R 编为独立 localTasks/uses 或合理拆分 → 为每个预期 Check 明示 sourceBinding 与 policy-awaiting → D1/D3 validate、冻结候选 B01/B02 精确锁（如适用）→ 已支持的无目标、无分支案卷级子集 preview/compile → 记录与 G03 精确对象相关的 tooling-blocked，单独维护未映射项。不读取隐藏 Gold，不改 C 原文，不对当前 277 条规则声称已全部实现或测试。

**必须等 GAP-01/02 后才能声明全量技术 READY**：资源/成员/仪器/样品/宣传对象以及 time/asset/slot/window/版本稳定标识；多类型互斥与独立叠加条件；按目标的当前材料及 SourceRef 绑定；失效/撤销、部分结果不串权；真实 Pi D2 plan、RuleSpec、subject、run/fingerprint、导出/重导入一致。统一集成负责人必须用至少一个跨资源类型和一个跨成员/设备/样品对象的合成正反样例验证，受影响十套显式迁移新公共 SHA，才可收签完整模板制作。

**本轮未执行**：G03 的作者态 JSON 制作、D2/Pi 真实案卷运行、在线模型、独立 Gold 测试、学校 OA/台账访问、T06 Gold 重制、E0-E4 复验、公共引擎修改、GitHub CI。故本报告只证明**静态技术适配可能性和阻断点**，不证明“十套模板已经成功编译运行”。原 C 文本的适用性、作者溯源和 E 状态按原审计只读保留。

## 6. 复核入口

- R0 签署：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/9#issuecomment-6110379696
- R0 交接：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4b191c729f3d5f8135c73b87c17642023f6c3986/docs/design/review-agent/37-d3-r0-frozen-release-and-d4-handoff.md
- D4 制作契约：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4b191c729f3d5f8135c73b87c17642023f6c3986/docs/design/review-agent/24-d4-five-template-authoring-and-feedback-loop.md
- D1 作者态：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/packages/shared/src/types/review-authoring-v1.ts
- D2 target & gate：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/packages/shared/src/types/review-d2.ts
- D2 真实编译：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-d2-runtime.ts
- D2 三态门禁：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-d2-execution-gates.ts
- E r02 正式结果：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/ad74aa70fa284af71973d3344e6ff8caeb089156/docs/design/review-agent/business-templates/G03/acceptance/E-v1.0/r02/E-r02-final-verdict.md
- E r04 研究限定：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/0f42aeb696be677cef044b40e33af7091c339a9a/docs/design/review-agent/business-templates/G03/acceptance/E-v1.1/research-r04/r04-decision-and-handoff.md
