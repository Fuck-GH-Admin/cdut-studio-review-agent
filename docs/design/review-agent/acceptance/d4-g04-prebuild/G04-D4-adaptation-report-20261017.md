# CDUT Studio D4｜G04 全领域模块化制作前适配审查（2026-10-17）

> **独立技术预检 / NOT_RUN runtime。** 固定已签 R0 代码：`4b191c729f3d5f8135c73b87c17642023f6c3986`；对照而不冒充正式发布的 R1 Draft：`94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`（PR #83）。本审查只增加报告与规则账本，不改公共代码、A/B/C/D/E 原件、隐藏 Gold，不新增审核引擎。**SUPPORTED 表示能力/可制作，不表示已制作/已执行/已获行政批准。**

## 0. 签给统一集成负责人：结论

1. **G04 有且只有 8 套独立审核目的：T01～T08，原 C Markdown 完整原文字节均已在用户 Library 实际读取；343/343 条 R 级原子审核责任都有独立原文定位，附 [逐条清单](coverage-343-rules.csv)。** 不可把 E r01 的“T01 C 缺失”沿用为当前事实；E r02 已恢复原包。原 C 文件不在当前 Git release 是交付介质问题，不是 D3 缺少模块语义。
2. **8/8 `READY_TO_BUILD`（立即制作 D1/D3 完整语义作者态、模块/来源绑定、不可变版本、案卷级 Pi 技术预审候选）。** 不需要等待 B/D/E 再做一遍；不需要正式校方制度全部补齐；有待核规则可以明确 `unverified-policy` 并输出人工/校务待办。
3. **8/8 `GAP`（不能现在宣称“完整逐对象、多条件业务责任无损编译且运行”）。** R0/R1 中 `D2TargetKind` 只列 campus-card / archive-item / archive-operation（R1 再增 student-field），没有 G04 通用业务目标。R0 `D2_SCENARIO_SCOPE_REQUIRED` 将有分支模板绑在唯一校园卡目标；R1 多轴只对学籍字段开放。G04 的“每访客×车”“每人×门点×动作”“每工人×作业点”“每活动×场次”“每项目×危险源”不是把现有字符串随便命名为 objectKey 就有了真实 Subject/Check。
4. **只提两个必需的公共运行能力增量（G04-PUB-01/02），另记一个有条件发现的关系表达风险（G04-PUB-03）。** 当前不建议八个领域分别开发对象适配器，也不建议把全部业务判断做成 AST。模块中的多数专业事实/风险是否充分，仍由 Pi 语义审核及有权专业人员判定。
5. 本报告的 `READY_TO_BUILD` 是**可以开工**，并非 `READY_TO_RELEASE` 或 `D4_EXECUTION_ACCEPTED`。当前 G04 全领域原始 C 规则运行数 **0 / 343（NOT_RUN）**；不以之前 D3/G01 合成 CI、E 设计审计、Gold 编号校验充当 G04 真实运行证据。

## 1. 核验对象、原件、固定性和来源

**统一目录**：Library `G04_02_统一模板目录与边界.md`（A-v0.1），与 [E r01 的 A 母集 40/40 处置表](../../business-templates/G04/acceptance/E-v1.0/E3-domain-coverage.md)（审计分支 `audit/g04-e-v1-r01`）交叉核对。A 的 O01–O04/N01–N36 并非 40 套模板：T01门禁、T02临时访客、T03人员准入、T04项目风险、T05专项高危实验作业、T06活动安全、T07动火、T08机动车长期资格。N08应急报告、N09危化采购、N19场地预约（G03）、N30单纯缴费、N34投诉等按旧 A 归类排除、相邻路由或人工，不造新模板。N18长期驻场访客、N26教学焊接和N22公安许可保留相邻/校本有权分流。

**原 C 完整母版实际存在于用户 Library（不向公开 PR 复制全部字节）**。以下 SHA-256 是本轮对已读取原始文件字节重新计算的值；文件名、§规则/R-nn 和 Lnn 组成可复取定位。公开仓并没有这些原作者历史 C commit，故 **“Library 字节可固定、可定位”≠“原作者原始 Git 提交已证”**。

| 模板 | 完整业务 C Markdown 文件（Library） | 本轮 SHA-256 | 原子规则 | 技术制作准入 |
|---|---|---|---:|---|
| T01 楼宇门禁与特定区域通行授权 | `G04-T01_正式业务模板_MD_v0.1.md` | `54ce879cacd4895da0dd746a65579098569b513c1166e0f8fd828dd39bf17efb` | 40 | READY_TO_BUILD / exact runtime GAP |
| T02 校外人员临时入校及访客车辆预约审核 | `G04-T02_正式业务模板_MD_v0.1.md` | `8ef7326529c11a88affcba1085607b0cf919b7644935d1dda7ac72f4b1577f72` | 53 | READY_TO_BUILD / exact runtime GAP |
| T03 实验室人员安全准入资格核验 | `G04-T03_正式业务模板_MD_v0.1.md` | `9c889be9151854cbe43e3e94f5389c2a5fa0619e5e90867b14c117cee8e03cee` | 46 | READY_TO_BUILD / exact runtime GAP |
| T04 实验项目安全风险评估审核 | `G04-T04_正式业务模板_MD_v0.1.md` | `868a37e073411ebe9aa3d5b7c5def22e8737caefb7c5b013df270f57b1059658` | 35 | READY_TO_BUILD / multi-risk precision GAP |
| T05 高风险实验活动专项作业许可 | `G04-T05_正式业务模板_MD_v0.1.md` | `384ead2ba14d69559a989d75bc5620007b33c7355e57209f0e0ec6ef6f5ff829` | 36 | READY_TO_BUILD / exact runtime GAP |
| T06 校内群体活动安全审批与备案 | `G04-T06_正式业务模板_MD_v0.1.1_E-G04-T06-0004.md` | `d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2` | 48 | READY_TO_BUILD / per-session GAP |
| T07 校园临时动火作业安全许可（角色限定） | `G04-T07_正式业务模板_MD_v0.1.md` | `a0ad98d6685cc4a78f981dc4a146309a1e3ede67ba65303b936b60b2d2cf5712` | 46 | READY_TO_BUILD / exact runtime GAP |
| T08 校园机动车长期通行资格审核 | `G04-T08_正式业务模板_MD_v0.1.md` | `715ca07edd4934245e0c9f3774eb12302baf03a292b1fd635444fd10ba8f328a` | 39 | READY_TO_BUILD / per-car GAP |
| **合计** | **8 套实际完整原文** |  | **343** | **8 READY_TO_BUILD，8 局部 GAP** |

T01 原母版 SHA 与 [E r02 恢复包登记](../../business-templates/G04/acceptance/E-v1.0/r02/E0-delta-manifest.json) 中 `masterSHA256` 一致；T06 使用 E r02 **七条来源 URL 限域修正**后的 v0.1.1 SHA，不把旧 v0.1 误称现行。其余 T02/T03/T04/T05/T07/T08 用本轮真实 Library 文件摘要作制作输入固定指纹，**尚未有 C 原作者 Git commit 的独立性签署**。

**A/B/C/D/E 历史交付已定位、未重做**：A-v0.1 统一目录/40项处置；B 八套二轮 ZIP（SHA 登在 [E0 r01](../../business-templates/G04/acceptance/E-v1.0/E0-input-manifest.json)）；C 八套完整 MD（T01 经 E r02 找回，T06 URL 修正版）；D 八套分别有 reports / INPUT / evaluation 三包共 24 个历史归档、212 个编号案例（这里只读公开元数据，**没有读隐藏 Gold**）；E r01 [PR #27](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/27)、r02 [PR #68](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/68)，r02 `BLOCKED_INPUT`、`BLOCKED_SOURCE`，T05/T06/T08 Gold lineage P1、无已证私有 ACL 或 212 案答案全复核。**这些是版本/制度/验收治理限制，不是本次 D3 模块能力 GAP。**

## 2. 已读源码：D3 什么已支持、什么未支持

| 层与固定源码 | 已实现并可直接用于 G04 | 具体限制 / 不能自称已实现 |
|---|---|---|
| D1 `packages/shared/src/types/review-authoring-v1.ts` + `review-authoring-v1.ts` | `ReviewAuthoringWorkspaceV1`、局部 `ReviewAuthoringModuleV1.tasks`（目标、要求、完成、限制）、`templates.modules/localTasks`、`sourceBindings(checkId→sourceIds)`、`source.reference(documentVersionId+locator)`、revision、校验/候选映射 | `applicabilityNote` 是文字，不是泛用运行条件；D1 `TemplateVersion` 投影不能静默抹掉 execution gate；不能把编辑者引用制度等于材料 `SourceRef` |
| D3 `review-d3-module-library.ts` + `review-d3-workspace-locks.ts` + `review-d3-library.ts` | 本地/冻结模块组合、锁 `moduleId@version+digest`、依赖校验、同版不可覆盖、`reuse`、`diff/impact/upgrade`、`export/import` 携包 | 已冻 B01/B02 **只有合成局部语义**，不可自动提供 G04 现行校规、官方代理关系或行政许可 |
| D2 `review-d2-runtime.ts` + `review-d2.ts` | 明确选择已知条件的模块预览、案卷级语义 `RuleSpec`、`ReviewSubject`、规则/来源关联、`planFingerprint`、技术建案、目标证据验证和 Pi Run 核验 | R0 可用目标仅 `campus-card/archive-item/archive-operation`；档案 `review-d3-dynamic-case.ts` 是专用适配器。R1 仅增加 `student-field`，**不能重命名成 G04 业务目标**。非学籍多轴/多受益人条件 `D2_SCENARIO_SCOPE_REQUIRED`，`advanced.*` 非空 `D2_UNMAPPED_ADVANCED` 拒止 |
| D2 `review-d2-execution-gates.ts` | 已有 `all/any/not` 三态谓词、`confirmed-observation`、`evidence-any`、`case-stage`、材料 `applicant/authority`、`dueStages`、OR 替代；未知状态拒止确定性结果；`SourceRef` 应对应有效材料版本 | 谓词依赖**实际 Subject 和受控事实**。G04 当前无目标契约，不能让“申请表自述=可信门禁/许可台账”。`trusted-registry-field` R1 只对受控合成学籍字段 |
| Pi `preparePiReviewRunV2 / submitPiReviewResultV2 / verifyD2PiRun` | 语义 Agent 对原文审查目标作事实审读、提交状态/证据出处、再核技术计划；不需要每条 R 写专门执行器 | 不签正式行政决定，不证明公安/校保卫许可，不自动读可认证的访客、门禁、消防、场馆、车辆业务台账 |

**现有真正冻结的共享资产**：`agent-authorization@1`（B01，digest `e48d279ce5c813b2bcf9163b44a413bfd44de0291b1de93687af95ef3b1cbb5d`）与 `evidence-source-boundary@1`（B02，digest `98cc16b522702baf1e98c042dcc3d1381d386188e6db9495feaeab6e54295f90`），均为 `synthetic / candidate-local-meaning-only`。建议在 T02/T03/T07/T08 核验发起人与受益人/授权对象的 **局部 B01 语义**，八套在低可信材料与权威来源分离处核验 **局部 B02 语义**；每次均显式新建**本模板来源绑定**，不应仅因名字相似直接冻结共享。其余下面标记 `LOCAL-*` 的是**待制作的局部模块建议，不是已有 D3 样例模块的实际 ID**。

## 3. 每套模块组成、检查粒度、可用部分与被挡部分

所有模板建议基础局部模块：`LOCAL-POLICY`（生效学校、规范范围、未知策略），`LOCAL-ACTOR`（发起者/受益人/有权者），`LOCAL-EVIDENCE`（最小材料、合法等效、真实版本与冲突），`LOCAL-STAGE`（先后阶段、续期/变更、批准≠执行），`LOCAL-SCOPE`（对象和分项结果），`LOCAL-AUTHORITY`（人签/部门审批不能由模型代签）。**这些是抽取候选：若实际语义不同就分别保持本地，不强求八套共享。**

| 模板 | 原文责任 / 推荐专用局部模块（源锚点在 CSV） | 可立即 D1/D3 编制/案卷级运行 | 当前精确运行受阻部分 |
|---|---|---|---|
| **T01** | `LOCAL-T01-door-delta` 人×门×grant/add/remove/renew/rebind/suspend/resume/terminate；时段、导师/房间有权审批、课程联动、写卡回执。基础模块 + B01/B02 局部复用（逐人权限与证据）。R01–40；13 BR；F01–50、MS01–31。 | 40 R 意义、合法校区/门点范围、材料欠缺/待查、人工写卡流程分离都能成为语义 Check | 同案多主体×多门点×动作的不同结果、撤/增权集合、实际已写入状态不能以**单一整案 Check**冒充；G04-PUB-01/02 |
| **T02** | `LOCAL-T02-visitor-entry`、`LOCAL-T02-group-count`、`LOCAL-T02-temp-vehicle`、`LOCAL-T02-host-or-public`；13+访客/会务/车辆校本路径及关联 T06/T08。R01–53。 | 访客身份角色、政策适用、随行车辆材料、会务与访校权限分离做局部语义；B01 可选 | 多访客×车×司机/车主及部分放行、群组人数、临时与年卡互斥、N18长期施工者未知，需精确对象及联合分支；G04-PUB-01/02；N18 `POLICY_PENDING` |
| **T03** | `LOCAL-T03-person-lab-qual`、`LOCAL-T03-risk-tier-training`、`LOCAL-T03-exam-validity`、`LOCAL-T03-revoke-status`；课程/外来人/参观与操作不同。R01–46，F01–67。 | 培训/考试/职业资格/访客码边界可作语义目标；数据未连权威系统=等待权威复核，不能编造资格 | 同一人跨不同实验室/风险级别、撤销/停用、逐人逐批部分结果，可信考核底账的精确绑定；G04-PUB-01/02（真实校内数据接入属外部前提） |
| **T04** | `LOCAL-T04-project-version`、`LOCAL-T04-hazard-site-control`、`LOCAL-T04-professional-assessment`、`LOCAL-T04-reassessment`；科研/教学同模板条件轴。R01–35。 | **单项目单方案**的风险识别、应急方案、签署限制与政策保留，案卷级语义运行可先做 | 同项目多场所×多危险源分别的发现/证据；改版触发局部/全量复评必须精确关联旧版与新风险，不能一个整案合格覆盖；G04-PUB-01/02 |
| **T05** | `LOCAL-T05-operation-permit`、`LOCAL-T05-shift-watch`、`LOCAL-T05-special-conditions`、`LOCAL-T05-renewal`；过夜、高压、高温、节假日等条件化。R01–36，F01–47。 | 是否适用当前作业许可、方案、监护责任、未知签发单位/校本表单的语义检查；持有人批复与实施分离 | 作业×人员×设备×房间×时间，计划双人在场≠执行时在场；多操作部分授权和阶段复核，G04-PUB-01/02；真实监护由人确认 |
| **T06** | `LOCAL-T06-event-session`、`LOCAL-T06-public1000-legal`、`LOCAL-T06-meeting-cdut2025`、`LOCAL-T06-venue-facilities`、`LOCAL-T06-multi-authority`。R01–48；19 BR、F01–70、MS01–37。 | **明确分开**国务院大型群众性活动许可条件与 CDUT2025“会议”内部 1000 人分层；活动方案材料、法务/场馆/宣传人工分流，全部能写作语义 Check | 同活动各场次×场馆×高峰人数，会议/非会议、社会公众+规模+类型多轴精确适用和多部门独立状态，G04-PUB-01/02。T06 R37–47 会议分支不得强迫一般活动 |
| **T07** | `LOCAL-T07-fire-workpoint`、`LOCAL-T07-contractor-workers`、`LOCAL-T07-guard-approval`、`LOCAL-T07-site-verification`、`LOCAL-T07-extinguish-close`。R01–46，8 BR、F01–54、MS01–30。 | 动火归口、危险源措施审核建议、施工工单≠动火证、未来 2027 标准不能提前拒绝，语义任务完整可写；安全专业确认后再决定 | 每点×每工人×工种资质/监护时段与“票一人一点”可能性、过期/复工/紧急补录的分对象结果；G04-PUB-01/02。现场消防充分性由专业人员决定 |
| **T08** | `LOCAL-T08-car-beneficiary-type`、`LOCAL-T08-family-relationship`、`LOCAL-T08-renewal-quota`、`LOCAL-T08-fee-vs-whitelist`。R01–39，18 BR、F01–50、MS01–33。 | 校本身份类别未知保留候选、真实车辆材料、代办关系、缴费/白名单/停车权分离，语义可先写 | 一案多车、本人/配偶/亲属不同要求、逐车配额/到期/黑名单，学年与合同有效期及部分通过 G04-PUB-01/02 |

**所有八套都必须保留的输出契约**：`caseId + templateId@version + source SHA + policy applicability + subject/object/action + branch applicability(TRUE/FALSE/UNKNOWN) + Rule/Check + material evidence version/SourceRef + actual result + follow-up party + authority decision separate + run/plan fingerprint`。其中部分字段仍是 D4 制作层定义/原文输出约束，**不表示当前 D2 有全部强类型字段**。不能凭一个漂亮的 Pi 自然语言报告，宣称已经生成逐对象结构化 result 或有权审批记录。

## 4. 覆盖、责任技术去向与授权边界

### 4.1 原文责任覆盖分母

[**`coverage-343-rules.csv`**](coverage-343-rules.csv) 共 **343 行，不含表头**：8 套 C 的规范性 `R-01 … R-n` 逐条对应 **文件 SHA / 原文 §规则、L 行号 / 原文责任标题 / 建议 primary LOCAL 模块 / D1 task→instance sourceBinding→D2 RuleSpec/Pi Check / 需要人确认 / 精确对象 GAP**。本轮实查每套 R 起止连续、ID 无缺号无重复，汇总 `40+53+46+35+36+48+46+39=343`。CSV 属**逐条设计归属账本而不是 D1 JSON 已生成账本**；`SEMANTIC_READY` ≠ `implemented-and-tested`，并不主张只按标题自动分配的模块名称已经穷尽每条正文的分支、材料和例外。

**R 之外的强制原文维度不得漏掉**：T01 的 BR01–13 / F01–50 / MS01–31 / EV01–12，T02 的访客路径、人物/车辆/会务分支与 EV 等价条件，T03 的培训层级/考试时点、风险等级与有效期，T04 的风险源/实施场所/项目版次和审批意见，T05 的多操作班次/值守条件/后置执行回执，T06 的 19 BR / F01–70 / MS01–37 和法定许可、2025会议双规，T07 的 8 BR / F01–54 / MS01–30 / EV01–10，T08 的 18 BR / F01–50 / MS01–33。**这些字段/材料/条件轴的逐实例映射将在 D4 正式制作中作为独立账本扩展，当前不是 100% 条件运行验收。**

### 4.2 Check、Subject、SourceRef、RuleSpec 及输出的去向

| 业务责任 | 当前技术去向 | 谁判断 / 允许的结果 |
|---|---|---|
| 可语义审核的完整性、合理性、专业方案、事实相互印证 | `ReviewAuthoringResponsibilityV1` 每条独立 Check，`D2RuntimePlan.mapping/rules` → `RuleSpec.requirement` → Pi 语义评价 | 模型按限定范围给证据解释；专业充分性 T04/T05/T07 必须转安全人员确认 |
| 政策生效、学校/学院/地点/时间适用与外校来源 | `ReviewAuthoringSourceV1.kind+reference+applicability` / 每实例 `sourceBindings` / D2 `authority='unverified-policy'` | 未核校规保持 `UNKNOWN/POLICY_PENDING`，不能自动 `compliant` 或以外校量化值拒件 |
| 合法替代、仅当前阶段到期材料、申请人 vs 有权部门材料 | 已有 `D2ExecutionGateV1` 三态 `when` + `material.provider/dueStages/alternatives`，需绑定真实 Subject/EvidenceLink | 已证触发才可缺件；有权者尚未签批不是申请人缺件；不能用旧材料版本冒充 |
| 多人、多门、多车、多场次、多点及复合主键 | **D1 层通过 objectKey、task/limits 写明**；D2 必须按匹配目标生成分项 `ReviewSubject/Check` | **G04-PUB-01 阻断逐项技术完成**，不得退成一个“整案通过” |
| 访客渠道、风险级别、焊接/临时与年卡、社会公众/会议等多轴分支 | D1 `scenarios` 和 `applicabilityNote` 能储存语义；目前限域 D2 condition 对已有对象可做三态材料门禁 | **G04-PUB-02 阻断精确分支组合**；不可将未选/未知分支当 false |
| 规则出处 vs 申请材料原始证据 | 前者是 D1 source reference + D2 sourceIds；后者是 Case documentVersionId + `SourceRef` 与 `EvidenceLink` + Pi `Check.sourceRefs` | `source.reference` 引了某条规章 **不等于**申请材料已被真实核验；虚假截图或低信任文本不能单独确定合规 |
| 正式行政或专业决定、执行回执 | 当前仅能拆为独立 `awaiting-confirmation` 义务、流程/证据记录，待有权者实际确认 | 真人（保卫、实验室负责人、消防、公安、车辆管理等）最终决定。**不存在“模型批准”路径** |

## 5. 公共能力缺口登记（不要把待核制度混进来）

### G04-PUB-01 / P0：通用 G04 业务对象实例与分项 Check/Subject 绑定缺失 — `GAP`

- **已证源码**：R0 `packages/shared/src/types/review-d2.ts:D2TargetKind` 只支持 campus-card/archive-item/archive-operation；R1 加了 student-field，`review-d2-runtime.ts:validateTargets()` 对其余 kind 抛 `D2_TARGET_INVALID`。学籍 `studentScope` 绑定的是 fieldKeys/intents，不适用于 G04。
- **影响**：T01 人×门×动作、T02 每访客×车辆、T03 人×实验室、T04 每危险源×场所、T05 作业×工人×地点、T06 event×session×venue、T07 每动火点/工人、T08 每车×资格。CSV 中标明 `G04-PUB-01/02` 的 R 是第一批高优先级检查项。
- **最小补足**：在既有 `D2TargetBinding/compileD2RuntimePlan` 内新增**受控通用业务 target / 显式稳定 objectKey + scope label**，允许一条 D1 语义 Check 在显式传入且授权匹配的多个 G04 目标上产生独立 Check、Subject、evidence scope、结果与不可变 plan fingerprint；case-level 责任仍合法。拒绝未匹配/多出/冲突目标、未知类型不假成功、不能套学籍合成注册快照。采用固定最小合成例：两车一车缺件、一人两门一门撤权、一活动两场次一场次未知。
- **关门标准**：D1 save/read→D3 export/import→D2 preview/create→现有 Pi prepare/submit/verify，分项 Rule/Check/SourceRef 不串用且 partial 结果独立；旧档案/校园卡/学籍路径保持原回归。

### G04-PUB-02 / P0：G04 多轴适用性、阶段和业务对象联动的“可执行条件选择”未泛化 — `GAP`

- **已证源码**：R0 `D2_SCENARIO_SCOPE_REQUIRED` 只允许一分支一 campus-card；R1 `selection.scenarios` 多轴只对 `student-field` 目标合法。D1 `use.scenario`、`applicabilityNote` 可以存原规则而不保证逐对象 `TRUE/FALSE/UNKNOWN`。有限 `D2ExecutionGateV1` 支持基础 `all/any/not` 和到期材料，但必须有实际目标、受控证据和有效 `CaseStage`；不能凭文字判断等同结构化门禁。
- **影响**：T02 访客渠道+临时车/驻场；T03 身份+培训+具体实验室；T04 项目类型+危险源+变更；T05 危险作业+假期+监护时段；T06 会议/非会议、法定社会公众许可（**不能只用人数**）、多场次；T07 紧急/夜间/现场与工种；T08 亲属/学生/雇员/年卡类别/换车；T01 课程联动/门点资格/跨时段动作。
- **最小补足**：扩展已有 `D2ScenarioSelection` 和执行 gate 的**适用对象限定**，只接收枚举/受控确认的分支事实和已核时间/阶段；支持同一案同一目标多条件 AND/OR，并产生 `applicable/not-applicable/unknown` 独立责任状态。**不要求**通用业务审批 DSL、不要求模型的所有专业问题硬编码；未知需保持 `awaiting-confirmation` 而非删除 Check。限定集成适配必须附每个事实的来源/版本；“学校规则未核”应停 `POLICY_PENDING`，不作为假数据自动执行。
- **关门标准**：法定活动 `社会公众+活动性质+预计每场人数` 与本校学术会议的不同触发分开复现；模拟材料缺/不缺、申请人/主管材料阶段切换和政策未知三态样例通过，旧默认一分支兼容。

### G04-PUB-03 / P1 条件触发，**不是全领域阻断**：高级多事实/多文书关系无法无损编译

- `advanced.evidenceRelations`（乃至 R1 `advanced.*`）若作者态非空，D2 现在返回 `D2_UNMAPPED_ADVANCED`。当前 `evidence-any`、多条来源关联及模型语义解释能承担**无需强制结构化关系图**的职责。T01 的房间签批+门禁回执、T04 多危险源与计划版次、T06 一证多场次/权限、T07 工单与动火证不同主体是需要关注的反例。
- 仅在真实 D4 模块转换无法用 **现有每目标单独 Check + 受控来源绑定 + 有限 AND/OR gate + 人工核对** 保留责任时，登记精确原文 `R`、输入反例和真正丢失关系的复现，再提一个**最小关系能力**（例如 `subjectId+factKey+documentVersionId` 的显式关联）。**禁止预先把通用 Claim Graph 当作八模板的硬门槛。**

### 非公共 GAP，保持独立记录

- **政策/来源待核**：2026 有效校本门禁/访客年卡/动火/特殊高危作业办事表、审批 owner、系统可达性、N18长期驻场身份、N26课堂焊接与 T07、T06 非会议安全校本阈值、T06 的 CD06/CD09、A 旧2016政策废止元数据。归 `POLICY_PENDING/BLOCKED_SOURCE`，不可用技术修复替代。
- **业务部门决定**：保卫、实验室主管、安全专业/消防、公安、车辆管理和场馆真实授权/执行需相应有权者；在完整技术预审里表现为独立后置 Check 与待办，不给 AI 赋权。
- **数据/接口**：权威人员资格、门禁底账、车牌白名单、现场核验、场馆/会议和公安接口不存在或未授权，不影响 D4 合成技术制作，但阻止真实线下放行声称。
- **D/E 金标治理**：E r02 `BLOCKED_INPUT`、`BLOCKED_SOURCE` 与 Gold lineage P1、ACL 未证和未全量独立 Gold 复算，是独立验收发布阻断，**不是 D3 模块无法制作**。

## 6. 立刻开工的交接范围、停工线与复验建议

**立刻允许**：8 个作者分别从上表自己的 Library 母版和 hash 建 `workspace-local` 语义模块、所有 R 的 task、候选来源和实例级 sourceBindings；按正确局部含义择用 B01/B02（或者明确不复用），D1 `validate/save/read/diff`、D3 `freeze/reuse/export/import`；在无动态分项要求时用现有 D2 **案卷级**候选和 Pi 运行有限合成技术预审。各模板相同业务 ID 不能拆成新的模板；保留原 BR 条件、不删政策未知和有权流程。

**暂不能声称已完成**：T01/T02/T03/T04/T05/T06/T07/T08 的各自逐人/门/车/场次/风险/动作 **分项技术运行**，以及依赖真实多轴的执行性 skip/缺件判定。此部分等 G04-PUB-01/02 **统一公共 R2 改动+新的固定 SHA**，作者显式迁移、构造几条不含 Gold 的最小反例回归，再继续 D4 分项编译；不应等到整套 A/B/C/D/E 重新完成才动手。

**本轮没有实测 G04 D1 JSON 编译 / Pi Run**：业务原始 MD 已读、343 条定位已核、D3/R1 源码/接口已静态检查，故结论是**制作前适配**，不应当被 CI/集成负责人扩张为“八份全部实跑成功”。正式 D4 转换时每一 R 须升级为 `implemented-not-tested/implemented-and-tested/policy-awaiting-confirmation/tooling-blocked` 等可复验状态，补 BR/MS/EV/阶段账本，测试另由独立者复核。Gold 不读取、不改写、不公开。

**交接定位**：R0 文档 `docs/design/review-agent/37-d3-r0-frozen-release-and-d4-handoff.md`；D3/D4 契约 23/24、32；R1 Draft 设计 `docs/design/review-agent/acceptance/d3-r1-g01-runtime/design-delta.md` 和 `issues/known-gaps.md`；公共实码 `packages/shared/src/types/review-{authoring-v1,d2,d3}.ts`、`apps/electron/src/main/lib/review/review-{authoring-v1,d2-runtime,d2-execution-gates,d3-module-library}.ts`、`apps/electron/scripts/review-{d3-library,d2-plan}.ts`。

**最终回答统一负责人：`D3-R0 is sufficient to BEGIN authoring all 8 G04 templates; insufficient for lossless complete multi-subject G04 runtime. Two generic public capabilities (object-scope and multi-axis applicability) are the minimal shared repair. No full-policy confirmation, full hardcoding, or new engine prerequisite.`**
