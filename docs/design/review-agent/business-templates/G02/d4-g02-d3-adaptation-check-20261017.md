# CDUT Studio D4｜G02 领域模块化制作前适配检查（2026-10-17）

> **性质：适配审计 / 制作前静态核验，不是 D4 模板产物、E 业务验收或行政发布许可。**
> 范围 G02「信息化与数据权限」；仅新增本报告，未改 A/B/C/D/E 冻结原件、D3 公共类型、编译器或引擎。
> 审核结论：**现有 D3 支持三套模板的作者态语义模块制作、固定来源、共享复用及整案级技术预审；但不足以无损编译三套完整的逐业务对象、复合条件、分阶段审核模板。结论为 PARTIAL_SUPPORTED + SHARED_RUNTIME_GAP，不等于停止全部 D4 制作。**

## 0. 核验方法、版本和诚实边界

- 仓库： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent ，优先读 main/AGENTS.md（要求隔离、BDD、提交前运行类型检查；本文文档提交不改代码）、D3-R0 37 号固定交接、23/24/32 号契约、26 号 B01/B02 示例及实际 TS 源码。
- 技术 R0：不可变基线 4b191c729f3d5f8135c73b87c17642023f6c3986 ，对应 release/d3-r0-20261011。R1：PR #83 代码及文档 HEAD 94d5ec32b6de1ac0c185b63b4aabfddaa29b1649，**Draft，技术 CI 通过但不是已签署新 Release**。下面的“R1 能力”只指该固定源码，不默认已进入 R0、main 或正式产品。不得将 PR #84 的 G01-I 业务迁移当 G02 功能。
- 研究资料：通过 ChatGPT Library 直接找到了 G02 三份全文母版（T01 680 行、T02 709 行、T03 v0.1.1 718 行），并读取三份 C「编辑器共性模块候选」及 C→E 交接；对照仓库 G02 E r01/r02 冻结清单。C 母版哈希沿用可定位的既有交接/独立 E0 校验结果；**本会话没有将 Library 原始二进制重新落盘并独立重算 SHA，也没有把它们复制到公开 GitHub**。
- 真实执行：完成上述固定源码与业务 MD 的静态适配审查；**未创建 G02 D1 工作区、未在本轮执行 Bun/CI、D2 plan、Pi、模型盲测或隐藏 Gold**。本文的模块与 Check ID 都是制作建议，绝不是已经生成或测试的 RuleSpec。既有 PR #83 的 R1 绿色 CI 仅证明其合成 G01-I 与既有回归。
- G02 研究不是新建。不可把 E r01/r02 的 Gold 独立性、学校制度现行性、ACL 问题写成 D3 bug；也不可反过来借模块化宣告 E PASS。

## 1. 现行领域清单、原件、A/B/C/D/E 谱系

A-v2.4 统一目录将 G02 定义为「信息化与数据权限」；其 43 行 A 候选是场景/事项聚类，不是 43 套模板。G02 恰有以下 **3 套独立审核目的**：

| ID | 当前用途 | 现有完整原文与冻结标识 | 作者成熟度 / 发布边界 |
| --- | --- | --- | --- |
| G02-T01 | 部门数据共享申请审核 | G02-T01_正式业务模板_MD_v0.1.md；交接记录 SHA-256 9d16ba80053266dfee3c89e4fbccf1bbd8b408d58c4189e8f7f12bc0a7b235cb；C v2.1 是交付规范，不是业务 v0.2 | BUSINESS_MD_DRAFT_WITH_GAPS；CDUT 2020 试行规定不得冒充 2026 现行 |
| G02-T02 | 部门公共邮箱申请审核 | G02-T02_正式业务模板_MD_v0.1.md；E0 母版 SHA-256 4494cfd81dfde4af1fdcb127b342ed0452be6a7704fe317a123cbe589fff78bc；C v2.1 交接不改变正文 | BUSINESS_MD_DRAFT_WITH_GAPS；2026 部门公邮表单/角色版本仍待校方确认 |
| G02-T03 | 专项网络访问授权审核 | E0 旧冻结 G02-T03_正式业务模板_MD_v0.1.md，SHA-256 b4b3a859d4d85d322347189d253e0e1a7fe4f6003a2a01a4a0c36ea877fe6040；**Library 另有作者 2026-10-16 修订 v0.1.1 的完整全文** | 条件研究候选，不是已经决定上架的校本正式事项；v0.1.1 必须另定完整来源哈希、版差及制作基线，不与旧 v0.1 D/E 混版 |

版本/来源路径：
- A：G02 A-v2.4 完整目录/补充研究；B：T01 v0.1+校本 v0.2、T02 v0.2 校本补证、T03 v0.1+v0.2 校本补证。其原始 ZIP 的名称、SHA、规模及 E0 20 件档案清单见 docs/design/review-agent/business-templates/G02/acceptance/E-v1.0/E0-input-manifest.json（PR #23/#63）。这些不是正在本报告里重做的事实研究。
- C：各 TXX 正式业务 MD、规则追踪 MD/CSV、作者自检、模块候选、C v2.1 验收对接说明分离保存。仓库默认 main 不是三份 C 全文的原始保存位置；本报告用既有文件库与 E 清单定位。T01 32 条 R、T02 32 条 R、T03 v0.1.1 36 条 R，全文可用于制作。
- D：T01 原始 v3 INPUT_ONLY / EVALUATION_ONLY / REPORTS，T02 v1 三件套，T03 三件套及 Gold 正式版本待签；均来自既有隔离档案记录。本报告**没有读取 Gold、预期答案、可信底账**。详见 PR #37/#38 及 G02 E0 manifest。
- E：r01 PR #23 因盲审隔离失效，E1～E4 没有合法签署；r02 PR #63 仅源事实预审锁，E1 独立性仍不足、Gold ACL 仍未证、E2/E3/E4 不运行。**这些影响业务放行及独立金标验收，但不取消制作技术预审候选的权限。**
- T03 旧版 B/C/E 与 v0.1.1 修订之间需作精确版本选择。本报告的 R-01～R-36 对照采用能直接读取的 v0.1.1；“v0.1.1 是 E 已验证冻结原件”这一说法**不成立**。

完整 MD 定位：
- T01：第 1～5 节目的/角色/条件；第 6～8 节 F-01..45、M-01..16、EV-01..11、FACT-01..10；第 9 节 R-01..32；第 10～13 节多状态/版本/例外/制度；第 14 节来源 S01..S27。
- T02：第 1～5 节目的/角色/BR-01..08 与 ST-01..10；第 6～8 节 F-01..38、M-01..14、EV-01..13、CL-01..12；第 9 节 R-01..32；第 10～13 节状态/变更/学校来源；第 14 节 S01..S21。
- T03 v0.1.1：第 1～6 节边界/角色/阶段/BR-01..10 及 B 场景；第 7～9 节 F-01..44、材料/EV/关系；第 10 节 R-01..36；第 11～14 节分项结果/时序/例外/制度；第 15 节来源索引。
- **完整性口径：** 上述是所有编号原子规则的“预制作映射”，不是把 F/M/EV/BR/ST 数量偷算成额外独立 Check，也不是对全文所有非编号责任已经通过独立覆盖门禁的保证。D4 应从完整原文字节另做 source-catalog，包括排除、合法例外、未知、阶段及人审责任。

## 2. D3 实际已实现能力：SUPPORTED 和边界

| 能力 | R0/R1 静态查证 | G02 判断 |
| --- | --- | --- |
| 作者态语义模块 / 本地 Task / 组合与参数 | ReviewAuthoringWorkspaceV1、ReviewAuthoringModuleV1、TemplateV1、SourceBinding；review-authoring-v1.ts validate/save/read/diff/compile；不需每条业务都硬编码 | **SUPPORTED：** 组织审核义务、自然语言完成标准、限制、来源定位和任务预览 |
| 共享固定版本 / 不原地覆盖 / 依赖锁 / 跨工作区复用 / 便携导入导出 | review-d3-module-library.ts、review-d3-workspace-locks.ts；review-d3-library.ts CLI | **SUPPORTED：** 精确冻结及 reuse/import/export；B01/B02 只在局部语义相同时复用 |
| 来源绑定 / RuleSpec | ReviewAuthoringSourceV1 区分 synthetic、user-request、cross-school-reference、policy-candidate，适用性和内容核查分离；review-d2-runtime.ts 为 Check 构建 RuleSpec、sourceRefIds、mapping、计划指纹 | **SUPPORTED：** 产生带可追踪来源的技术审核任务；不可把 content-checked 当校本正式效力 |
| 整案级无条件语义规则技术预审 | compileD2RuntimePlan 可对不声明 scenarios、targets=[] 的原文责任编译 targetScope=case / execution=semantic；D2 candidate-held 不能发布 | **SUPPORTED：** 可以立即制作和调试低风险、整案级原文覆盖候选；不等于逐对象完整运行 |
| 泛化的 G02 多对象 Subject | review-d2.ts D2TargetKind 只有 campus-card/archive-item/archive-operation/student-field；review-d2-runtime.ts validateTargets 严格拒绝其他 kind | **GAP G02-RUNTIME-01**；不能将数据项冒充档案件、邮箱成员冒充学籍字段 |
| 泛化的复合情景/条件自动激活 | R1 selection.scenarios[] 至多 13 分支，仅适用于所有 target.kind=student-field；其他有 scenarios 的模板仍须单一 campus-card + scenario + scenarioObjectKey | **GAP G02-RUNTIME-02**；G02 一个对象可同时触发代理/资源/动作/阶段，不应伪造 campus-card |
| 有限程序化三值门禁 | D2GateExpressionV1: confirmed-observation、evidence-any、现有 CaseStage、controlled-synthetic 学籍注册表字段，all/any/not；material provider applicant/authority、dueStages 基于软件 CaseStage | **PARTIAL：** 可执行部分已明确的材料事实；缺 G02 组织/学校政策/审批阶段/业务对象的可信结构输入及门禁 |
| 全关系 Claim/Evidence/替代与多文书图 | 非空 workspace.advanced 任一数组在 compileD2RuntimePlan → D2_UNMAPPED_ADVANCED；R1 仅学籍 Subject/字段版有限链接 | **GAP G02-RUNTIME-04（仅需强制执行时）**。文本语义审阅、来源提议不强制硬编码；但不能声称复杂关系已被确定性验证 |
| 技术 Pi/SourceRef/运行保护 | D2 plan 的 RuleSpec/Check/Subject/指纹、现有真实材料注册与 Pi 回执路径；authoring source 是制度索引，不等于材料 DocumentVersion 的 SourceRef | **SUPPORTED 基础框架**；要使 G02 每项材料与独立 Subject 真正绑定，依赖 G02-RUNTIME-01/04 |
| 特定业务正式审批、邮箱创建、网络开权、数据交付 | D2 固定 mode=technical-pre-review、publicationAllowed=false；没有获授权校方服务端可信底账及真实审批角色 | **HUMAN/SOURCE_HOLD**，不是缺一个“自动批准”模块；正式动作不得被 Pi 技术建议替代 |

特别注意：review-d3-dynamic-case.ts 的 instantiateD3ArchiveCaseV1 明确是 archive-specific；R1 studentScope / trustedStudentSnapshot 是 G01-I 学籍专属，不可假借为 G02 通用目标。ReviewAuthoringSourceBindingV1.applicabilityNote 是说明，不是动态执行 AST；作者能写多条语义检查不等于 D2 对每个实际数据项生成多条独立 Check。

## 3. 模块体系与实际复用关系（建议，非已发布模块清单）

**可复用 B01：** agent-authorization@1（代理授权目标、事项与时间边界）；仅覆盖有真实代理且来源/学校适用性已在实例绑定的局部义务，不能判定部门资格、源数据许可、邮箱开户或 VPN 生效。**可复用 B02：** evidence-source-boundary@1（待证事实、证据出处/材料版本/审核员确认范围）；不能代替复杂法定等价证据关系、校规版本权威或系统后台日志。

提议 G02 本地语义模块簇（此处 G02-COMMON-* 为建议名，不是已存在公共 frozen ID）：

| 提议模块 | 适用 TXX | 复用方式和禁止事项 |
| --- | --- | --- |
| G02-COMMON-ROUTE | 01/02/03 | 业务目的、明确排除事项、学校作用域、分流；各模板实例有不同排除对象 |
| G02-COMMON-POLICY | 01/02/03 | 制度学校/版本/生效状态，unknown 不得触发本校强制拒件；只复用逻辑，不共享政策事实 |
| G02-COMMON-ROLE | 01/02/03 | 经办、主管、实际使用者、委托、签字权；B01 可部分嵌套，主体资格局部化 |
| G02-COMMON-EVIDENCE | 01/02/03 | 文书与事实、官方来源/自报差异、版本、替代候选、B02 部分复用；未经认证不赋真实审批效力 |
| G02-COMMON-STAGE | 01/02/03 | 阶段在先/后置材料、申请方责任与审批方责任分隔；**目前仅语义任务，非完整 G02 程序门禁** |
| G02-COMMON-RESULT | 01/02/03 | 全问题输出、待核/需补/转办、旧版留痕；逐对象聚合仍缺通用技术目标 |
| T01-DATA-SOURCE / T01-DATA-LAW / T01-DELIVERY | 01 | 数据项与字段、数据源部门、目的必要性、个人信息法定基础/第三方关系、逐源审批与交付日志，不能共享为 T02/T03 资格 |
| T02-MAILBOX / T02-LIFECYCLE / T02-MEMBER | 02 | 邮箱命名/唯一性、组织管理员交接、成员权限/变更/撤销；不采集密码或邮件正文 |
| T03-RESOURCE / T03-ACCESS / T03-LIFECYCLE | 03 | 受限资源、使用者×访问动作×时间、VPN/堡垒机与应用层二权、外协/回收；排除普通 VPN 和新系统公开发布 |

局部模块优先：先独立制作三个完整模板的工作区 local 模块，再依据完全相同的语义边界有选择地复用 B01/B02；不需要为复用率“抽空”各模板的独立责任。三套 MD 原作者的 MOD-01 等只是研究候选 ID，**不能当成仓库已经 freeze 的公共模块**。

## 4. T01 原文责任 → 技术模块覆盖清单（32/32 个编号定位已建立）

审核单位 **CASE/ACTION/DATA_ITEM/APPROVAL_NODE/DELIVERY**；一案多数据源、许可范围与交付各自独立；禁止把材料齐备、正式批准、实际交付合成单个 PASS。

| 来源第 9 节规则（逐 ID） | 模块建议 | 预定 Check / Subject / 证据与输出去向 | 技术状态 |
| --- | --- | --- | --- |
| R-01、R-30 | G02-COMMON-ROUTE | CASE 路由 Check；非本业务 OUT_OF_SCOPE 而非材料不合格 | READY_TO_BUILD case semantic |
| R-02、R-08、R-31 | G02-COMMON-POLICY | CASE 学校/版本 Check；待核政策 non-enforcing，制度 owner 确认 | READY_TO_BUILD semantic；强制规则受 SOURCE_HOLD |
| R-03、R-04、R-09、R-12、R-14、R-26、R-28 | G02-COMMON-ROLE + T01-DATA-SOURCE | 经办/单位/数据源/签批节点与正式否决、撤权事实 Check；授权节点精确分项 | GAP-01/03 的逐源与可信状态部分 |
| R-05、R-06、R-07、R-15、R-16、R-21、R-22、R-23 | T01-DATA-SOURCE + T01-DELIVERY | DATA_ITEM/ACTION 数据集合、用途最小性、分类、交付技术条件；需每数据项 Check，数据必要性人审 | GAP-01；语义职责可先制作 |
| R-17、R-18、R-19、R-20 | T01-DATA-LAW | 第三方转供 vs 受托处理、个人信息基础、敏感数据；风险提示与法务/学校有权人待核 | SEMANTIC + HUMAN_ONLY；关系若机器强制验证则 GAP-04 |
| R-10、R-11、R-13、R-24、R-25 | G02-COMMON-STAGE + T01-DELIVERY | 逐数据源授权在先、未到签章节点、保密承诺、续变、部分批准不能推定整案批准 | GAP-01/03（不是硬编码一条通用缺件） |
| R-27、R-29 | G02-COMMON-EVIDENCE | 可接受的合法证明替代、隐私最小化、真实 SourceRef/修订，未知不判假 | READY_TO_BUILD semantic；条件替代强门禁受 GAP-04 |
| R-32 | G02-COMMON-RESULT | 程序核验与人类裁量分离，给出每项未决原因和转人工 | READY_TO_BUILD case summary；逐项聚合依赖 GAP-01/05 |

**其他非 R 责任：** BR-01..10、第 4 节 ST-00..08 作为模板内多轴条件/阶段，不另拆模板，动态运行映射 GAP-02/03；F-01..45 是请求/核验输入语义而非 45 条无条件硬必填；M-01..16 与 EV-01..11 由触发条件决定本期责任及替代；FACT-01..10 涉跨文书、来源与后台事实，需 B02 与实际 SourceRef，强制跨实体等价条件见 GAP-04；第 10～12 节三轴输出、部分结果与版本重审需 GAP-05 并留人工许可边界。

**T01 裁定：** 作者态 SUPPORTED；整案级技术候选 **READY_TO_BUILD**；原文完整逐 DATA_ITEM/审批节点/交付状态运行 **GAP（不得宣称 full-run ready）**。

## 5. T02 原文责任 → 技术模块覆盖清单（32/32）

审核单位 **mailbox_id? × action_id × member_id? × material_revision**；未发邮箱用稳定临时键，不能当正式邮箱 ID；多成员/多动作不得整案掩盖局部待审。

| 来源第 9 节规则（逐 ID） | 模块建议 | 预定 Check / Subject / 输出去向 | 技术状态 |
| --- | --- | --- | --- |
| R-01、R-16、R-28 | G02-COMMON-ROUTE | 单位公务公邮 vs 个人邮箱/邮件权限 vs 数据共享分流；活动用途仍同一模板 | READY_TO_BUILD semantic |
| R-06、R-08、R-15、R-17、R-30 | G02-COMMON-POLICY | 学校命名、编制身份、期限、数量限制适用性；缺本校现行规则 WAIT_POLICY | READY_TO_BUILD semantic；SOURCE_HOLD |
| R-02、R-03、R-07、R-09、R-18、R-19、R-27 | G02-COMMON-ROLE + T02-MEMBER | 组织/经办/主管/管理员/成员区分，委托 B01 部分复用；成员按授权粒度 Check | GAP-01 分项，语义可先制作 |
| R-04、R-14、R-24、R-29 | G02-COMMON-EVIDENCE + T02-MAILBOX | 申请目的、合法替代、材料最小性；密码 OTP 和邮件正文禁止进入审核输入/输出 | READY_TO_BUILD semantic + 可程序隐私拦截（现有材料规则限定范围） |
| R-05、R-20、R-21、R-22、R-23 | T02-MAILBOX + T02-LIFECYCLE | 查重、既有邮箱绑定、管理员交接、部门撤并、注销；可信邮箱目录与历史对象必须待核 | GAP-01/03；邮箱服务接口 SOURCE_HOLD |
| R-10、R-11、R-13、R-25、R-26 | G02-COMMON-STAGE + T02-LIFECYCLE | 当前节点不强求后置单位/信息化签批，补件 ≠ 终局否决，批准 ≠ 技术创建 | GAP-03 程序门禁；人工批准 HUMAN_ONLY |
| R-12、R-31、R-32 | G02-COMMON-RESULT + G02-COMMON-EVIDENCE | 正式决定真实性、同版本材料、多个 mailbox/action/member 独立结果，完整 issue trace | GAP-01/05，基础 SourceRef SUPPORTED |

**其他非 R 责任：** BR-01..08 是开户/变更/终止等并存或互斥的条件，不是八份模板；ST-01..10 是公邮办理节点而非通用 CaseStage；F-01..38、M-01..14、EV-01..13、CL-01..12 需要按学校/时间/当前动作激活，不能一律申请方缺件；第 10～12 节必须分离 MATERIAL_VERIFIED、PENDING_UNIT/IT、APPROVED_PENDING_EXEC 与实际执行。邮箱后台不可达是 WAIT_SOURCE，不能归责用户。

**T02 裁定：** 作者态 SUPPORTED；整案级技术候选 **READY_TO_BUILD**；完整多 mailbox/action/member 与阶段状态编译 **GAP**。学校当前邮箱审批配置未核是 SOURCE_HOLD 而不是引擎 Bug。

## 6. T03 v0.1.1 原文责任 → 技术模块覆盖清单（36/36）

本模板**仍为条件研究候选**。审核单位 **school × case × beneficiary × restricted_resource × access_action × period**；身份委托 BR-03 与资源准入 BR-02 可以同时成立，要求两个 Check，不允许用一个「外协身份合格」替代资源授权。

| 来源第 10 节规则（逐 ID） | 模块建议 | 预定 Check / Subject / 输出去向 | 技术状态 |
| --- | --- | --- | --- |
| R-01、R-14、R-23、R-26、R-30 | G02-COMMON-ROUTE + T03-RESOURCE | 普通 VPN/公网发布/新系统备案边界，专项受限资源独立分流 | READY_TO_BUILD semantic；当前本校 T03 业务存在性 SOURCE_HOLD |
| R-02、R-04、R-06、R-07、R-15、R-24、R-28、R-29 | G02-COMMON-ROLE + T03-ACCESS | 请求人与用户分离、学生/外协/特权账号/校内代办/保密承诺/撤权；B01 仅可复用代理范围 | GAP-01/02/03，HUMAN 角色签发 |
| R-03、R-08、R-09、R-13、R-18、R-22、R-27、R-31 | T03-RESOURCE + T03-ACCESS + T03-LIFECYCLE | 既有受限资源精确定位、期限、目的、原许可变化、VPN 与堡垒机/应用层权限独立 | GAP-01/02；部分形式义务可用语义 |
| R-10、R-11、R-12、R-16、R-25、R-33 | G02-COMMON-STAGE + T03-ACCESS | 审批层级、正式否决、网关配置实施、后置运维、复杂高风险人审；不得输出“已开通” | GAP-03；HUMAN_ONLY 正式许可 |
| R-05、R-19、R-20、R-21 | G02-COMMON-EVIDENCE | IP 尚未分配时合法等价定位、上传截图和可信底账冲突、底账不可达、隐私最小化 | READY_TO_BUILD semantic；机器合法替代/来源冲突需 GAP-04 |
| R-17、R-34 | G02-COMMON-RESULT | 按用户×资源×动作×期限分项、部分待审、完整多问题 | GAP-01/05 |
| R-32、R-35、R-36 | G02-COMMON-POLICY + G02-COMMON-STAGE + T03-LIFECYCLE | 政策三值、非到期材料未生成不误判缺件、撤回与重审版本锁 | GAP-02/03，修订快照基础 SUPPORTED |

**其他非 R 责任：** BR-01..10 与原 B 12 场景共存，BR-02/03/04/05/06/08/10 可按条件叠加；旧 1-of-N scenario 不能表达。ST-01..09 是校务办事阶段，非 CaseStage 等价枚举；F-01..44、各 M/EV 与跨文书事实图需按学校和资源对象分项触发。第 11 节要求双轨分项状态、不能跨资源扩权；第 12～13 节需保存旧授权和变更版本。当前 2026 校本专项受限 VPN 的独立表单、审批权责与发布必要性待确认，**不适用的跨校限制不可硬移植**。

**T03 裁定：** v0.1.1 语义 MD 全文可做结构化制作，**READY_TO_BUILD（有条件：先选定/哈希冻结 v0.1.1 来源，且仅做非发布技术候选）**；完整逐资源多分支运行 **GAP**；是否独立上线为官方模板仍为政策/产品目录决定，不是工具技术失败。

## 7. Check / Subject / SourceRef / RuleSpec / 输出的明确落点

1. **源责任 → Check：** 每个原文 R ID 单独或经有记录的合并映射到本地模块 task ID、实际模板实例路径与 Check ID，必须保留可独立判断的义务。业务 MD 中 F/M/BR/EV/FACT/CL/ST 记录为 scope/condition/material/fact/phase/exception 关联，不虚增全局必填。若同一 R 需按每个数据项、账号成员或资源出结果，**应实例化多个 Check**，不能一个整案 Check 代替。
2. **Check → SourceBinding：** 精确绑定模板实例 checkId 与来源索引 sourceId、source.kind、verification、applicability；旧 2020 CDUT、外校例子、作者设计均不能转换为“现行强制校规”。业务原件自身的文件名、内容 SHA、规则章节/行定位作为制作来源；D1 source.reference 的 locator 是文本声明，不等于材料 OCR/页锚点已验证。
3. **Subject：** 现有 D2 仅支持校园卡、档案对象/操作、学籍字段。G02 全案可以暂用 case Check；T01 DATA_ITEM、T02 mailbox/action/member、T03 beneficiary/resource/action/window **无法无损生成 G02 Subject**，这是主要公共缺口。
4. **RuleSpec：** 实际 D2 编译为 execution=semantic、onFail=manual-review、onUnknown=needs-confirmation、sourceRefIds 固定、指纹固定和 authority=request-scope/unverified-policy。不是强制每条硬编码。必须防止由于没有 target 把强制逐对象义务误投影为 case 通过。
5. **材料 SourceRef：** 材料文件自身的 documentVersionId/核对锚点经注册、证据 link 与 Pi 提交校验后才成立；学校目录、OA、邮箱或 VPN 审批底账不是申请人上传的一页图片，必须以**受控可信独立来源**接入或报告 SOURCE_UNAVAILABLE。上传截图不能冒充校方正式决定。
6. **程序 vs 语义 vs 人：** 可程序门禁的包括对象 ID/权限范围隔离、分支来源锁、未知不当 false、到期/撤回/正式否决不得推导开通、材料版本/已核证据一致性与阶段未到不报缺件；文本内容、用途是否充分、第三方关系解释、文书事实冲突及风险提示保留模型语义核验；最终数据共享、单位邮箱设立、受限网络准入、法律利益衡量/人事签批和真实技术开权限只由授权人/校方服务决定。
7. **输出：** 最低技术预审须带 templateId/version、planFingerprint、case/Subject/Check/RuleSpec、source、材料版本、逐问题状态/位置、待确认原因、下一责任人及非发布标志。母版特有 PENDING_UNIT/IT、APPROVED_PENDING_EXEC、UNVERIFIABLE/WAIT_SOURCE、PARTIAL_RESULT 等可先在报告语义使用，但若要对外承诺**机器可判的逐对象状态机和全案聚合**，还需 GAP-05 的最小输出契约与测试；不能把自由文本当已强制状态机。

## 8. 技术缺口（公共能力，按最小补充定义）

| ID | 性质/受影响模板 | 真实源码行为及受影响责任 | 最小补充要求 / 如何证明关闭 |
| --- | --- | --- | --- |
| **G02-RUNTIME-01 P0** | T01/T02/T03；逐源授权 R-10/25、每邮箱成员 R-18/32、每资源 R-17/34 等 | D2TargetKind 只有四个非 G02 kind；validateTargets 硬拒非法 kind；目前无通用 G02 多对象实例化器。强行使用 archive/student/campus-card 会伪造身份和操作 | 增量支持一类明示的 generic business-object target，含 objectKey、subjectId、业务操作/父子定位；同模板逐对象复制独立 Check、保来源/证据/结果边界，拒绝重复/悬空/错对象。至少对多 DATA_ITEM、双邮箱成员、两用户×两资源的正反合成用例生成独立 Subject/Check，并防错授权扩展 |
| **G02-RUNTIME-02 P0** | 三套 BR 轴尤其 T03 BR-02+03 同时成立与 T02 动作+成员 | R1 selection.scenarios[] 支持多轴，但非学籍目标仍限“单一 campus-card + 单一 scenario”；模板没有真实 G02 动态场景实例规则。注释性 applicabilityNote 不是程序条件 | 针对 generic business-object 允许多个经过显式确认的条件轴激活，按每 Subject/动作选择独立 Check；true/false/unknown 均有拒止语义，unknown 不当 false，不能靠模型自由猜测默认情景。至少 T03 身份+受限资源双触发、T01 新增+多个来源、T02 变更+成员三类 fixture 回归 |
| **G02-RUNTIME-03 P1** | 三套跨 ST/政策/有权审批、补件与交付区隔 | R1 D2GateExpressionV1 只认少量已核 observation、evidence、通用 CaseStage、学籍 synthetic registry；G02 ST-xx、部门角色/政策时点/审批底账无法无损成为程序门禁。不是因为语义 Check 没硬编码而定 GAP，而是**严格阻止尚未到期材料被报申请人缺件、正式否决仍被判通过**等安全状态缺契约 | 最小新增可声明的业务阶段及角色/权威事件只读受控输入，支持 unknown fail closed、到期材料 current/future/authority provider、正式拒绝与实施分离；保留校方授权接口可缺席状态，不能合成 school-approved。至少验证未来签章缺失不会报缺件、后台不可达不判拒件、正式否决不能化为已开通 |
| **G02-RUNTIME-04 P1 scoped** | T01 第 8/12 节及 R17..20/27、T02 EV/CL & R24/31、T03 R05/19/24 | 非空 workspace.advanced 数组 → D2_UNMAPPED_ADVANCED；学籍字段版受控 evidenceLink 不适用于 G02 任意关系。同一事实的合法替代和多版本跨人证据**如只是语义审阅可直接制作**，只有声称“已经程序化强制验证”才属于此 GAP | 不开发任意法学 Claim 图。先抽出业务真实需要的**有限**同 Subject/版本的 one-of-evidence 或跨对象显式依赖，并附可验证 SourceRef、未知冲突；其余保持 HUMAN/SEMANTIC + recorded tooling-blocked。不得绕开编译错误删除原始关系 |
| **G02-RUNTIME-05 P1 scoped** | 三套第 10/11 节输出；尤其逐数据来源、逐成员/账号、逐用户资源 | RuleSpec 有语义结果、规则和证据来源，但无 G02 业务专属的可信逐对象状态机及跨对象许可/交付合并契约。只需用户可读问题卡时不强制引擎新增 Schema | 若完整母版要求机器接口消费状态：以 G02 generic Subject 下的 Check verdict + pending reason + verified authority/delivery outcome 输出分项状态及可追溯聚合；不把已批准推算成已执行，不把部分 item 合格推算成整案正式批准。至少测试双对象一通过一待核、全部问题保留、拒绝污染邻对象 |
| **G02-SOURCE-01（非 D3 GAP）** | T01/T02/T03 | C 原件在 Library，仓库未托管其完整字节；T03 2026-10-16 v0.1.1 与旧 E0 v0.1 的基线关系尚未冻结复核 | 制作者引用原文来源位置、已声明原版 SHA 与适用版次；对 T03 v0.1.1 新算 SHA、保存不可变母版身份和对 v0.1 的差分；**不要改旧 D/E 记录**。这由制作/来源管理员完成，不需要改编译器 |
| **G02-POLICY-01（非 D3 GAP）** | 三套 | 2026 校规现行性、邮箱办事与专项 VPN 受理依据不足；E1 未签、Gold ACL 不足、T03 正式独立性尚争议 | 仍可制作 non-enforcing 研究候选；正式业务/独立 E 审核另走原独立性和合法来源流程，不得用工具发布取代 |

**最小公共修复优先级：** 先一次补通用业务对象 + 非学籍复合条件（01/02，影响 G02 三套）；随后对真正要求确定性阻断的阶段/可信来源（03）扩展；证据和输出（04/05）按具体无法用语义审核 + 人审正确表达的责任**限定范围**补充，不要重新开发任意关系图或完整审批引擎。对应公共能力只能在统一 R2 分支实现、通过源码+合成正反运行后发行新固定技术 SHA；业务分支不得偷偷补公共类型。

## 9. 逐套 SUPPORTED / GAP 与开工授权

| 模板 | 语义作者态 / 共享复用 | 可生成整案级 D2 技术候选 | 全文无损逐对象+条件+阶段运行 | 制作裁定 |
| --- | --- | --- | --- | --- |
| T01 数据共享 | **SUPPORTED** | **SUPPORTED（case-only）** | **GAP 01/02/03；04/05 按强制执行范围** | **READY_TO_BUILD**（完整责任 catalog、本地/局部语义模块、来源锁、整案预审可开工）；逐源/交付部分暂不得称已运行 |
| T02 公共邮箱 | **SUPPORTED** | **SUPPORTED（case-only）** | **GAP 01/02/03；04/05 条件化** | **READY_TO_BUILD**（不改原文、可作者制作）；邮箱×动作×成员和校务 stage 暂未全运行 |
| T03 专项网络 | **SUPPORTED** | **SUPPORTED（case-only）** | **GAP 01/02/03；04/05 条件化** | **READY_TO_BUILD，CONDITIONAL**：先固定 v0.1.1 原件与旧 E0 区分；只做受限技术候选，不做官方上架/真实开权 |

判定解释：这里 **READY_TO_BUILD** 表示“无需等待再一轮 A/B/C/D/E 研究，也无需为每个审核责任写确定性代码，当前就能启动 D4 作者转换及本地语义模块制作”；**不代表本套所有原文责任可在现有 R0/R1 逐 Subject 实际执行**。如统一负责人要求“必须整套完整 runtime 完成后才称 READY_TO_BUILD”，则三套都只能是 **PARTIAL_READY / NOT_READY_FOR_FULL_RUNTIME**，原因明确是同一公共 G02-RUNTIME-01/02（以及必要的 03），而非模板空白。

### 当前可以立即做的工作

1. 从完整原文生成每套 source-catalog：每条 R、每个分支/例外/阶段、人审与非编号义务有章节/行锚点；保留 C SHA 和 T03 双版本说明。
2. 用现有 D1/D3 CLI 制作三个彼此独立的 workspace-local 语义模块模板；B01/B02 仅准确局部复用，所有来源绑至实例 Check，逐 Check 记录是否只是语义。
3. 以无动态 G02 targets、无伪造 scenarios 的最小可运行 case-only 选择，验证 D1 validate/save/diff → D3 export/import → D2 preview/register/create → Pi 材料核验/SourceRef 的有限技术候选；记录原文未能展开的逐对象规则及对应 gapId，绝不以 case-only PASS 冒充整套 PASS。
4. 待公共通用目标/多轴最小修复形成固定 R2 后，显式迁移受影响实例，验证每个 G02 业务对象独立 Check/SourceRef/RuleSpec/未知/补件/已批准未实施的正反例，再做统一集成。
5. 正式 E、Gold ACL、校本规则、办事权限和模型业务准确率继续由各自有权的来源/审计/系统负责人完成；不得以本报告关闭这些状态。

### 本轮未做也不应冒充的事情

- 没有改 A/B/C/D/E 原件；没有给 G02 生成编译版 JSON、在线模型结果或 Gold；没有为“通过检查”修规则/加假校规。
- 没有运行本地 Bun/TypeScript/CI；是**实际源码静态检查**，非动态实测或独立源码验收。既有 R1 CI 记录保留其原作用范围。
- 没有发布学校正式模板或开放真实数据/邮箱/VPN 权限。

## 10. 参考路径与复核指引

- 固定技术基线：docs/design/review-agent/37-d3-r0-frozen-release-and-d4-handoff.md @ R0；23-d3-shared-module-library-and-d4-handoff-contract.md；24-d4-five-template-authoring-and-feedback-loop.md；32-md-to-modular-template-agent-quality-protocol.md。
- 实现：packages/shared/src/types/review-authoring-v1.ts、packages/shared/src/types/review-d2.ts；apps/electron/src/main/lib/review/review-authoring-v1.ts、review-d3-module-library.ts、review-d3-workspace-locks.ts、review-d3-dynamic-case.ts、review-d2-runtime.ts、review-d2-execution-gates.ts @ 94d5ec32b6de1ac0c185b63b4aabfddaa29b1649。重点是 review-d2-runtime.ts 的 validateTargets、compileD2RuntimePlan 及 D2_UNMAPPED_ADVANCED、D2_SCENARIO_SCOPE_REQUIRED。
- CLI 与回归入口：apps/electron/scripts/review-authoring-v1.ts、review-d3-library.ts、review-d2-plan.ts、review-d3-md-coverage.py；apps/electron/src/main/lib/review/review-d3-r1-student.test.ts；R1 已知缺口 docs/design/review-agent/acceptance/d3-r1-g01-runtime/issues/known-gaps.md。
- E 冻结和历史： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/23 、 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/63 ；G02/E-v1.0/r02/E-final-verdict.md（路径从 docs/design/review-agent/business-templates/ 起）。
- D3 工程版本： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/9 、R0 交接 PR #20、R1 运行 PR #83；业务先例 G01-I PR #81/#84 均不得当 G02 支持证明。

**最终交付给统一集成负责人的一句话：三个 G02 完整业务 MD 都存在且可进入 D4 语义模块制作；D3 不是“全部不够”，但 R0/R1 的 D2 非学籍目标/复合条件确有公共运行缺口。先并行制作已支持的内容，把最小泛化修复集中做一次，不再重跑 A/B/C/D/E，不凭空编造学校权威。**
