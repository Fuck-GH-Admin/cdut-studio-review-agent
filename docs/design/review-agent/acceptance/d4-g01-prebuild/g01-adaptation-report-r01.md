# CDUT Studio D4｜G01 全领域模块化制作前适配检查（r01）

> 检查日期：2026-10-17。性质：**独立静态适配审查／制作准入建议**；不是 D4 成品模板、独立 Gold 验收、在线模型测试或校方业务审批。
>
> 本报告只新增于独立审计分支。未修改任何原始业务 Markdown、隐藏 Gold、共享模块、公共引擎、冻结 D3-R0、AGENTS.md 或 README.md。
>
> **结论：五份原始业务模板均可立即开始 D4 作者态模块制作（READY_TO_BUILD）。现有 D3 已足以承载全部模板的审核目的、语义责任、来源、限制和待人工处理的输出；但“所有责任已经能无损编译成有对象/条件/证据强门禁的 D2 运行任务”仍不成立。** 只对实际需要机器防串用、权限放行或确定性事实触发的部分列 GAP，非程序化的语义核验和未核校规均不算引擎缺陷。

## 0. 版本、审查方法和状态定义

- 本报告提交父版本：main @ 8989941b6fb5651564e32d11c4215b6a6d5a5209，**仅用于保存报告**；不以 main 替代技术 Release。
- 技术基线 R0：release/d3-r0-20261011 @ 4b191c729f3d5f8135c73b87c17642023f6c3986；D3-R0 交接第 37 号文档强调按 PR #9 签署 SHA 使用。冻结 manifest 中 CI 测试源提交是 7ff2889205b15cc24fb2eb9f08ea2633c711231d，两者角色不同，不能混称。
- 参考但**尚非正式 Release**的技术增量：D3-R1 Draft PR #83 @ 94d5ec32b6de1ac0c185b63b4aabfddaa29b1649。G01-I 作者差分 A′ Draft PR #84 @ 38277ce925347284d03347cef85ee59c6f30ec26，独立 C′ Draft PR #85 @ 896703ee42827badab3890eb641d030fc4cef35d；它们均不得被当作 R0 已包含的特性。
- 已查：仓库 AGENTS.md；第 15/16/18/19、23/24、32/35/37 号设计/实施/交接文件；五份完整 G01 Markdown 原件与清单；D1/D2/D3 类型、冻结共享库、D3 档案实例化、D2 编译与执行门禁源码；R1 已知缺口、迁移契约；I/A 既有转换和独立技术审查记录。
- 方法：原文件章节和规则表 → 推荐局部模块 → 现有制作态 Check/来源绑定 → D2 真实对象、门禁、RuleSpec 和回执接口；只做**源码与固定历史结果**核对。本审查**未重新运行 Bun、真实 Pi 或 Gold**，本报告本身不产生新实测 PASS。
- **SUPPORTED**：指定责任在指定层级已有适当机制（包括明确的语义 Check＋待核／人工结果），并非保证 AI 事实判断正确。
- **GAP**：存在必须程序约束的语义，当前 D2 目标/条件/可信事件表达或执行缺失；若不改会丢必要的作用范围或错误地给出确定性通过。
- **READY_TO_BUILD**：可以现在建立带来源的完整作者态和所支持部分的 D2 候选；允许将少量受阻责任原样留在覆盖账本，**不等于全量可运行或正式验收通过**。
- **POLICY_HOLD / INTEGRATION_HOLD / TEST_NOT_RUN / D4_AUTHOR_WORK** 分别是有效校规缺失、真实外部权威数据/签章/收件事件缺失、尚未运行、制作 Agent 尚未补齐定义；不得统一上报为 D3 缺陷。

### 0.1 完整原件与统一模板清单

业务目录：docs/design/review-agent/business-templates/G01/README.md；来源索引：docs/design/review-agent/business-templates/G01/source-manifest.json；原件统一保存在该目录下 originals/。

| 模板键／原始独立业务目的 | 固定完整 Markdown 文件（originals/） | 来源版本、SHA-256 | 原文核心规模 |
|---|---|---|---|
| I / student-identity-correction 学籍身份信息更正 | g01_student_identity_complete_template_v1.7.md | v1.7；52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329 | R001–R028；F01–F28；S01–S13 |
| A / archive-utilization 档案利用申请 | g01_archive_utilization_template_editor_spec_v1_5.md | v1.5；65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785 | R01–R42；50 字段；申请／关系／档案件／操作四层 |
| C / special-campus-card 特殊校园卡资格 | special_campus_card_template_v1.4.md | v1.4；fa409cfa30ad0f0c624784f9beab4799cc1e31bbcf3d118c0e41a67deba8937f | C01–C10、F01–F08、T01–T09；家属与临时服务双分支 |
| S / special-proof-and-seal 专项证明与用印 | G01_special_proof_seal_review_template_v1.4.md | v1.4；bb9b11b7963e0cd7661afe12bb3a23eec1655153de2d122ffb59b26f10190c15 | SP-01–SP-29；51 字段；四类可组合动作 |
| P / political-material-procedure 政审材料程序 | G01_political_review_template_v0.3.md | v0.3；542e73ddc26e861e1bc1d454841dc6096299f1a991e944f59a487d84d97304ec | R001–R036；B01–B22 研究条件分支；59 字段、S0–S7 阶段 |

这五份完整原件**目前确实存在于 main 的 originals/**；第 37 号历史交接中“原件尚在 Library、不在 GitHub”的文字是当时状态，不能再用作今日 SOURCE_MISSING 依据。来源表仅核对当前仓库 manifest/ Git Blob 与内容定位；不表示政策链接的 2026 现行性已重验。五份均为 business-design-draft；独立审核目的固定为五套，不按每个分支拆分模板。

### 0.2 已有 A/B/C/D/E 历史成果与可复用技术交付

| 资料／历史交付 | 实际定位与可信边界 |
|---|---|
| G01 领域研究、五份业务完整稿 | originals/ 五文件、source-manifest.json、16 号五模板差异研究；原件为优先事实，横向摘要不得代替原文 |
| A/B/C/D/E 研究／离线评估线索 | PR #80 归档离线 V1–V3 与 G01-I 双阶段试点；原件引用了各自离线材料和反误杀案例。**本次未核对私有历史输入/Gold 的逐件内容，也没有找到可替代 G01 全域 D4 的正式独立 E 签收** |
| D3 模块冻结及合成跨模板 | R0 第 37 号交接、D3-10 PR #11/#12/#13；合成共享模块 B01/B02 的目的与边界已明确，但尚非跨业务校本法条 |
| A 档案原文向模块转换 | PR #15：既有技术回放报告称 39 类 R 职责对应 77 个 Check；R24/R29/R40 曾明确留为受阻。它证明局部路径，不等于 A v1.5 全业务完成 |
| I 首套旧 D4 作者产物 | PR #81：10 个局部模块、49 个来源绑定；当时无实际 field Subject/target，不能宣布多字段无损运行 |
| I 独立集成初检 | PR #82：定位旧 R0 的场景与对象限制、Claim 关系未映射；输入冻结预检不是 Gold 通过 |
| R1 新公共代码 | PR #83：新增 student-field、studentScope、多场景显式选择、受控合成学籍快照、有限一证多事实绑定；固定 94d5ec… 仍为 Draft |
| I A′ 后继作者态 | PR #84：版本 @2，10 旧模块＋13 S 场景模块，85 项覆盖账本、62 个 sourceBinding；历史 CI 曾得到 1 Subject/39 Check、2 Subject/60 Check 的合成技术结果。条件由作者显式选择，不是真实事实自动路由 |
| I C′ 独立后继检查 | PR #85：B r02 INPUT 结构预检与另外的合成专项，但原 B **28 案真实引擎运行 0/28（NOT_RUN），Gold 未读**；不能签业务结果 |

URL： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/80 、/81 、/82 、/83 、/84 、/85 、/15 及 /9 。这些历史工件保持原样，今后的整合负责人须锁定各自提交，不能把不同分支测试数字合并成一个“已运行”分母。

## 1. D3 实装能力：有、没有、不能混同的层

| 制作／执行责任 | 真实技术位置 | 本次适配评价 |
|---|---|---|
| 完整模板、局部语义模块、组合实例、场景、自然语言任务 | packages/shared/src/types/review-authoring-v1.ts；review-authoring-v1.ts | SUPPORTED。模板的目的／适用／限制和局部业务义务不要求改成程序 DSL |
| 按 Check 绑定原 Markdown 章节、来源性质和适用性 | ReviewAuthoringSourceBindingV1；D1 manifest 与 RuleMap | SUPPORTED。制作来源 reference.documentVersionId＋locator **不是**真实待审材料的 SourceRef |
| 本地修订、来源及规则摘要、候选发布隔离 | review-authoring-store-v1.ts、review-authoring-v1.ts、template-store.ts | SUPPORTED。candidate-held 不能发布为学校正式模板；source.content-checked 不等于校本政策已获授权 |
| 共享模块冻结、digest 锁、reuse/export/import/diff/impact | review-d3-module-library.ts，review-d3.ts，review-d3-library.ts | SUPPORTED。B01 agent-authorization@1 SHA digest e48d279ce5c813b2bcf9163b44a413bfd44de0291b1de93687af95ef3b1cbb5d；B02 evidence-source-boundary@1 digest 98cc16b522702baf1e98c042dcc3d1381d386188e6db9495feaeab6e54295f90，皆是 synthetic 示例而非制度事实 |
| 有条件的业务对象映射到 RuleSpec/ReviewSubject | review-d2.ts；review-d2-runtime.ts compileD2RuntimePlan | SUPPORTED，**仅限** campus-card / archive-item / archive-operation / student-field（R1 候选）四类具体 target。普通整案自然语言 Check 也可编译，但不能用它冒充逐人／逐操作受控规则 |
| 分支实例化 | D2 selection＋previewDemo；档案专用 review-d3-dynamic-case.ts | R0 支持 C 一分支一对象、A 多档案件/逐操作；R1 支持 I 字段级 scopes 和显式复合 scenarios[]。**普通 S/P 多分支、多动作并发不是通用功能** |
| 执行条件 | review-d2-execution-gates.ts | SUPPORTED 范围：三值 all/any/not；当前 CaseStage、已由人确认的同 Subject observation、有限 evidence-any；R1 的 trusted-registry-field 只读受控合成学生快照。未知不能变假／通过；不等于政策 AST、组织岗位权限图、纸件收讫事实验证 |
| 证据链、真实回执、版本保护 | setEvidenceLink，preparePiReviewRunV2，submitPiReviewResultV2，verifyD2PiRun | SUPPORTED。必须在有效文档版本上有 **当前 Subject＋supportsFact＋审核员确认** 的 EvidenceLink，并由 Check 引用真实 SourceRef；运行包指纹和 inputManifest 应一致。有限同文书双 Subject 证明不等于任意高级 Claim 图 |
| 高阶 Claim/多路证据图 | ReviewAuthoringWorkspaceV1.advanced；compileD2RuntimePlan | **GAP（按需）**：传入非空 advanced 时 D2_UNMAPPED_ADVANCED 明确 fail-closed；不能在作者态声明高级关系后把它静默变成一段不承担门禁的自由文本 |
| 真实行政阶段、学校主数据、发行人/收件人认证与正式审批 | D2 仅 technical-pre-review；AGENT_DECISION_DISABLED | 不属于已实现 D3 的本地校务真实性。缺真实外部接口与有权校规是 INTEGRATION_HOLD/POLICY_HOLD；不可用申请表 caseFields 或模型判断代替 |

制作入口（R0 已提供）：apps/electron/scripts/review-authoring-v1.ts；review-d3-library.ts；review-d2-plan.ts；review-d3-handoff-demo.ts。D3 R0 真实配置使用独立 PROFER_CONFIG_DIR；新会话按相同固定代码 SHA 工作。**不要求新增引擎，不要求让每条业务判断硬编码**。

### 1.1 Check、Subject、SourceRef、RuleSpec、输出五项的强制去向

1. 原文每个独立可观察责任 → 作者态 module.tasks 或 template.localTasks → 由 D1/D3 生成的稳定实例 Check ID；同一个规则可实例化到不同 target，必须能反查原文责任；一个自然语言 Check 可负责相连步骤，但不能吞掉需要独立状态的业务。
2. 每个 Check 的 sourceBindings.sourceIds 必须指向实际 MD source locator 和适用性；一份 B01/B02 模块跨模板复用时来源仍由本模板实例重绑，不能继承另一学校权限。
3. 对逐字段、档案件×操作、持卡主体等**必须隔离的可判定结论**，绑定 D2TargetBinding.objectKey/subjectId；未支持的业务角色可记在语义 Check **并只输出人工待核**，不得声明具备程序化跨角色防串用。
4. compileD2RuntimePlan 产生固定 D2RuntimePlan.mapping(checkId,ruleId,objectKey?,subjectId?,sourceIds,authority,gate?)、subjects 与 rules；实际 rule 仍是 RuleSpec，来源为 unverified-policy 的检查不可自动形成政策合规。
5. 真正运行后提交 CheckResult、当前真实 SourceRef（文档版本、页／块定位）、ReviewRun.inputManifest/plan fingerprint，并区分 compliant / non-compliant / awaiting-supplement / awaiting-confirmation / not-applicable / 未执行；报告应保留多问题和待办，不由 AI 产生行政批准。仅制作报告时这些运行字段**标 PLANNED，不预填实际回执**。

## 2. 总体准入与模板模块组成

| 模板 | 建议局部模块（名字仅为 D4 待建模块概念，不是声称已经发布） | 可复用、不得继承的部分 | 制作态判定 | 全量程序化运行判定 |
|---|---|---|---|---|
| I 学籍更正 | I-范围/校规；I-学生字段与来源；I-更正事实/证据；I-13分支；I-阶段/输出 | B02 可复用“证据按事实定位”；不得推断法定更名/校方批准；可继承 A′ 仅作新候选参考 | **READY_TO_BUILD / SUPPORTED**（R1 分支可制作字段级候选） | **GAP（指定高级关系／可信审批事实）；SOURCE_HOLD**；不等于所有 85 项已运行 |
| A 档案利用 | A-申请与身份；A-档案件可定位性；A-逐操作权限；A-材料替代；A-后续交付 | B01 仅代理动作/范围；B02 仅证据覆盖；已存在 archive dynamic helper，可保留专属 R24 | **READY_TO_BUILD / SUPPORTED** | **GAP（同类多操作 gate 精确赋值及某些复合关系）；D4 作者缺专属模块；SOURCE_HOLD** |
| C 特殊校园卡 | C-公共资格；C-family；C-temp-service；C-授权关联；C-期限/报告 | B01 仅代办范围；B02 仅各事实证据；家属亲缘法定效力不继承 | **READY_TO_BUILD / SUPPORTED** | 单 campus-card target 两顶层分支 **SUPPORTED**；多主体可信链要求自动肯定时 **GAP**，否则人工待核 |
| S 证明与用印 | S-分流/事实证明；S-制式/译文/原复件；S-密封；S-拟用印动作；S-批准稿版本；S-章权和阶段 | B01 仅合法代办核验；B02 仅事实对照；正式章权永不共享 | **READY_TO_BUILD / SUPPORTED** | **GAP（多动作 target、批准版本×章种×份数和正式阶段的受控关联）** |
| P 政审材料程序 | P-业务范围与政策版本；P-身份/版式；P-组织权限/签署；P-收件/期限；P-证据与保密 | B01 可考虑代理范围而非组织评价；B02 可复用客观证据边界；政治实质判断绝不复用 AI | **READY_TO_BUILD / SUPPORTED** | **GAP（复合条件与方向/收件/出具角色可靠绑定、实际收讫事件）；人工政治结论永久排除** |

**判断重点**：本轮允许五路 D4 作者现在建立全部业务责任的模块与覆盖账本；不要求等 D3 补完所有接口才做 Markdown→JSON。需要受控来源/角色而暂未具备的 Check，应以 waiting/manual/tooling-blocked 的可见状态保留，不可“映射到 case Check 即算完全运行”。

## 3. 全量原文编号责任 → 计划技术模块覆盖账本

以下为**静态适配责任清单**，不是已经执行的 Check ID/运行账本。每行列明原文编号（完整覆盖五文件的独立规则表）和建议去向。技术路径简写：
- **G**：现有 D2 对象／来源／条件门禁可承担明确的**技术范围**，需 D4 实际配置、复现；
- **S**：可用语义模块＋RuleSpec／SourceRef／awaiting-confirmation 保留完整审核责任；不是机器已经保证法律判断；
- **H**：有权人工／外部可信接口决定；语义 Check 负责列出待核事项，禁止用 Agent 代批；
- **X**：需要按第 4 节定向补公共表达或执行能力，才可声称该子责任具备**无损程序化**运行。

### 3.1 I 学籍身份更正（原文 §3–9、§12–13）

| 原文编号（每条均列入） | 专属模块／要保持的责任 | 适配和边界 |
|---|---|---|
| R001、R026 | I-业务分流：在籍更正／账号通信／毕业历史勘误 | S/G；S12、S13 确认越界需 ROUTE，不触发在籍附件 |
| R002、R003、R011、R012、R013、R021、R022 | I-学校/学段/国别/制度版本及特殊字段适用 | S/H；C01/C02现行性、C03研究生2024原文待核，不能凭外校例强制缺件 |
| R004、R005、R008 | I-申请人＋字段集合＋权威旧值；F02–F05 | G（R1 student-field / studentScope）＋H（真实校务数据源仍无）；缺可信源待核 |
| R006、R007、R009、R010 | I-原因、逐事实证据、缺失/不可读/真伪/时间区分 | S＋有限 G(evidence-any/confirmed observation)；多向事实图只在必要时 X |
| R014、R015、R016、R017、R018、R019 | I-S01–S06：更名、证号、升级、报考/录取原错、生日 | S＋R1 字段/意图 gates 可用；无法由证号格式推定法定身份；招生权威源 H |
| R020 | I-S07 多字段每项事实覆盖与联合身份连续性 | R1 多 target/分字段 EvidenceLink 为 G；复杂“多个文件合成证明”需要 X 或 H；不能自动把一证对两个事实视为全部事实有效 |
| R023、R024 | I-S09 跨境证件和 S10 生僻字/编码 | S；证件制度例外和 ROUTE 不可因 OCR 差异判违法 |
| R025 | I-P0–P7 当前阶段、未来机关签署不得当缺件 | G(case-stage/material.provider) 的有限技术检查＋H；实际学院/教务审批阶段**不是**现有 CaseStage 自带事实 |
| R027、R028 | I-风险事实只报告客观异常，输出限程序预审 | S＋既有候选隔离/AGENT_DECISION_DISABLED；不能定伪造/犯罪/正式核准 |

**分支与材料额外覆盖**：S01–S13 完整保留为**同一完整模板中的可叠加/分流条件**；其中 S01–S07 以及 S08/S09/S10 的更正事实，S11 的研究生交叉校规，S12/S13 的范围外路由都不得被简化成“选一个场景就全案合格”。F01–F28 按原文 B/S/Q/A/V/X 来源类型分别进入作者态输入说明或 Check；F15/F16/F23–F26 属可信招生/校务/后续流程，不可以“申请人需上传此文件”取代。A′ 已有 85 责任 ledger、13 场景、62 sourceBinding，**可复用它的覆盖方法，不可把它的合成测试视为法规事实已证**。

### 3.2 A 档案利用（原文 §1–8、§11–13）

| 原文编号 | 专属模块／要保持的责任 | 适配和边界 |
|---|---|---|
| R01、R02、R30、R31、R39 | A-范围、渠道/日期和校规优先级 | S/G；未核通知不生效，跨校不继承 |
| R03、R04、R07、R08、R11、R13 | A-申请人／委托人／经办人／档案主体资格区别、历史姓名关系 | S＋B01 仅辅助代理范围；相同姓名不是角色权利等价 |
| R09、R10、R12 | A-具体档案件×操作×期限的授权凭据 | G archive-operation target/explicit evidence link；同类两个 operationId 要不同 gates 时 X |
| R05、R06、R14、R17、R18 | A-档案件定位/类别/馆方权威位置；公布不等于开放 | G archive-item target＋S/H 权威状态；目录结果不能自动批准访问 |
| R15、R16、R19、R20 | A-适用查阅/外借表、受限馆藏/第三人隐私 | S＋G 分项门禁；保密授权本身 H |
| R21、R22、R23、R25、R26 | A-查阅、摘录、复制/扫描、原件外借、借还 | G 同项各自独立 archive-operation；R26 post_decision 真实交接仍 H/INTEGRATION_HOLD |
| R24 | A-档案证明（certified_copy）特殊出具 | **D4_AUTHOR_WORK＋H**：现有动态 helper 已有 certified_copy 类型但要求专属 authority-owned 模块；不得用普通 copy 冒名。没有模块时不能标 SUPPORTED |
| R27、R28、R29、R40 | A-签章外观/真伪、冲突、合法电子授权/历史差异替代 | S＋有限 evidence-any；法定电子签章真实性 H/外部接口；任意复杂 Claim 图启用时 X |
| R32、R33 | A-阶段必交、未来审批不能算申请人缺件 | G when/material.dueStages/provider=authority＋S；真实审批节点 H |
| R34、R37 | A-最终批准和档案交付动作不得由 AI 执行 | H；技术候选禁正式决定 |
| R35、R36、R38 | A-逐操作结果、整案并行异常、材料覆盖/未读 | G 对象独立 Rule/Check＋S 保留所有 findings；未读不合格 |
| R41、R42 | A-公开/内部权限、版本修订后重审 | S/已有 inputManifest；实际 ACL 与外部分发权限另行治理 |

字段按 50 项候选及 §2 四层模型映射；MaterialSlots 不可以为每个角色任意增加必交。既有 A PR #15 的 77 Check/39 责任不代表另外 R24/R29/R40 自动无损支持。归责时区分“R24 尚未制作专属模块”“法定签名权威缺失”和“D3 确实无法表达的高级图”。

### 3.3 C 特殊校园卡（原文 §3–7、§9–12）

| 原文编号 | 专属模块／要保持的责任 | 适配和边界 |
|---|---|---|
| C01、C08、C09、C10 | C-入口卡种/规则效力/预审权限/隐私 | G C 的 family 或 temporary_service **单顶层分支**；S 政策隔离；H 最终发卡 |
| C02、C03、C04、C07 | C-申请人/持卡人/关联人或责任单位的主体和授权链 | S＋B01（限定代理范围）；如果要自动判“关系/权限已证实”必须有 X 多角色作用域或 H，不可把全部人当一个 Subject |
| C05、C06 | C-期限与旧卡状态 | S/G（受控期限观察）；旧卡真实台账缺失 H，不可套外校最长日数 |
| F01、F02、F05、F08 | C-family 关联职工状态/家属类别/退休/特批范围 | S；CDUT-F1 2024 已列的大类与当下全部细则不同，未知保留待核 |
| F03、F06、F07 | C-family 亲缘证据、多代链与合法替代 | S＋有限 B02；不能把没同一本户口簿当不合格；多跳强确证才需 X |
| F04 | C-family 已故职工家属代确认 | S＋H；不能要求已故者本人在线签署，具体代办部门校规未核 |
| T01、T07、T09 | C-temp-service 人员类别与访客分流 | S/G scenario＋子类条件；“住校/短期入校”不是自动卡资格 |
| T02、T03、T04、T05 | C-temp-service 借调、自聘、派遣三方、其他长期批准链 | S＋H；合同比对属于语义，个人资格与校方签批须有权核对，跨人自动通过时 X |
| T06、T08 | C-temp-service 请求期与已生效服务期、责任单位权限 | S/G 期间比较可写语义 Check；校方身份/单位授权 H，不能把待续签当已生效 |

MaterialSlots 按公共／family／temporary 三组设置，但同一完整模板只有两条互斥顶层情景。R0 已有 family、temporary-service 合成编译与 Pi 技术通路。C 领域不存在“必须把亲缘关系证明推理成数据库多跳才准开工”的硬要求；在权威不足时**明确 waiting＋人工核验**即可保住业务责任，不能擅自宣布已确认办卡资格。

### 3.4 S 专项证明与用印（原文 §1–10、§14、§17）

| 原文编号 | 专属模块／要保持的责任 | 适配和边界 |
|---|---|---|
| SP-01、SP-02、SP-03 | S-入口／自助证明／财务合同／政审路由 | S/G；与 C/P/A 独立审核目的互不偷渡 |
| SP-04、SP-05、SP-08、SP-09 | S-拟出件正文、事实对照、管理机关权限 | S＋B02 事实定位；没有可信在读/任职事实不得假合格 |
| SP-06、SP-07、SP-17、SP-23 | S-章权主体、代理资格、单位/落款/章种 | S＋B01（代办限定）；校方章权 H；多动作同一申请须独立 Scope，自动判定时 X |
| SP-10、SP-11、SP-12、SP-28 | S-制式表、个人签字、版本、学校待填栏/真正空白 | S＋有限 G(stage/material due)；正常后置签字栏可空，不能把真空白正文等同未来印章位 |
| SP-13、SP-14、SP-15、SP-16 | S-中外文核对、译文遗漏、译者资格及中文原本先印 | S；跨语言语序差异不能机械字符串判错；学校认可翻译资质待核 |
| SP-18、SP-19、SP-20 | S-复印件原件一致、材料封套/密封/骑缝、现场封装条件 | S＋人工现场；不能因 PDF 图片出现信封推定已封口 |
| SP-21、SP-22、SP-26 | S-未到部门审批节点/已到必备节点/待审批不等于已用印 | G 的粗粒度 stage/provider＋H；实际部门阶段／签署权仍需授权记录 |
| SP-24、SP-25 | S-批准稿与送印稿实质版本核对、重导出无害字节差异 | S 可保留文档语义比对，但若要**程序保证每份批准对应每一个动作/章种/份数/送印版本**需 X；禁止只比较 hash 代替语义 |
| SP-27 | S-执行后用印结果必须来自可信记录 | H/INTEGRATION_HOLD；图片红章不可视作已经完成的正式操作 |
| SP-29 | S-本校表单版本不存在或不清 | S/POLICY_HOLD；保持待确认而非自编校规 |

**动作/条件补充**：原文四类可组合办理情形与六个动态判定轴，以及 51 字段中的申请事实、提交文书、译文、复印密封、批准/用印各组，都保留在一个 S 模板。可以现在制作所有 SP Check；但普通无 Subject 的整案 Check 不足以声称不同章种、批准稿、执行稿和份数已经受到逐动作运行时防串用。

### 3.5 P 政审材料程序（原文 §0–12、§14–18）

| 原文编号 | 专属模块／要保持的责任 | 适配和边界 |
|---|---|---|
| R001、R002、R003、R004、R005 | P-SCOPE：业务方向、学校/届别/通知版本、真实阶段 | S＋有限 G(case-stage)；多个条件轴同时命中时 X，未知版本不得自动判旧表错误 |
| R006、R007、R013 | P-FORM：指定表或认可复函、页和本人已到栏目 | S＋B02；组织未来待签空栏不属于学生缺件 |
| R008、R009、R010、R025 | P-IDENTITY：客观身份/编号、身份经历与附件一致 | S＋有限 G(confirmed observation)；行政主数据未接入应待核 |
| R011、R012、R018、R019 | P-AUTH：被接收认可的出具主体 vs 实际有权出具的部门、分段覆盖 | S＋H；不同单位签署不能凭文件抬头自动认权，强结论须分主体 Target（X） |
| R014、R015、R016、R017、R026 | P-AUTH/FORMS：组织意见、签字章、日期、在出具阶段合法留白 | S＋G material.provider=authority/due stage 可保护一定误杀；章图真假须人工/平台 |
| R020、R021、R022、R023、R024 | P-DELIVERY：纸件、PDF、寄送、密封、电子签章五类独立状态 | S＋H/INTEGRATION_HOLD；实际收件/电子验签不能凭申请人叙述变真；自动结案需 X 受控独立事件 |
| R027、R028、R033 | P-受控通知延期、上传/签署/签收/组织决定分状态、版本变更重审 | S/运行指纹可追已有材料；新生效通知、可信收件与组织阶段事件 H／按需 X |
| R029、R030、R034、R035 | P-权限、敏感数据最小化、防注入、**绝对不作政治实质评价** | H＋S；D2 仅技术预审。禁止模型给出政治合格/不合格或据此调档 |
| R031、R032、R036 | P-所有已可判断问题并行发现、校规不明保持未知、视觉未读不得视作完整 | S/G：所有 Check/SourceRef 实际覆盖要在运行时检查；无证据不得正式合格 |

**原文 B01–B22 分支仍是 22 个条件研究分支，不是另外 22 套模板**。分支维度包含 issue/receive、已就业与否、出具组织、多院校／当年表版本、已签／未签、纸件与电子件、密封、延期等；同案可叠加。不允许一个普通 campus-card 式单场景编译器代替这些复合情形，也不得先要求 issue 阶段出现 receive 端完成态。S0–S7 业务阶段不自动等于 D2 CaseStage；其中组织正式签章、纸质收件和政审结论明确归 H。

## 4. 公共 GAP 与最小补充：只补运行边界，不重建引擎

以下是**需要完整无损程序化声明时**的技术 GAP；其出现不应阻止前述已经 SUPPORTED 的作者态工作。每个 GAP 均保留原文 Check，不能因当前执行器不支持就把它改成不适用。

| GAP ID / 证据 | 影响模板及原文责任 | 真正受阻的运行承诺 | 最小补充／关闭条件 |
|---|---|---|---|
| **G01-GAP-01：非学生多轴复合场景**。D2 对非 student-field 分支限制一个 scenario/一个 campus-card target；否则 D2_SCENARIO_SCOPE_REQUIRED | S 四动作及 SP-04～27；P B01–B22 与 R003/004/026；C 的顶层单分支**不受影响** | 同一案多个不同局部条件可以同时成立、各 Check 独立激活且未知不丢项 | 对 S/P 增量允许显式**合法多个并发分支／动作实例**，每个展开后的 Check 按稳定 instance/target 绑定；重复/冲突/未知 fail-closed；不要求 Agent 自动猜分支、不把组合条件都硬编码 |
| **G01-GAP-02：通用多业务角色/动作受控 target**。D2TargetKind 只有四种 | S SP-06/07/17/23/24/27，P R011/012/018/019/020～24，C C02～04、F03/06、T02～05；I 已有 student-field，A 已有 archive-operation | 无法向 D2 清晰声明“哪个经办人对哪个申请者／机构／文书动作负责”；若产生确定性授权结论，不能只靠整案文字阻止跨人/跨动作证据串用 | 在**确需自动肯定**的模板上增加有限 typed subject role/action binding，带 objectKey、roleKey、operationKey、显式 target 来源；复用既有 EvidenceLink/RuleSpec/gate，不要求一次建设无限关系图。不能提供可信绑定时只允许 awaiting-confirmation |
| **G01-GAP-03：档案同类操作实例 gate 指派精度**。review-d3-dynamic-case.ts gateAssignments 过滤 moduleId/taskId/itemId/operation，却不按 operationId 过滤；实例 objectKey 已支持 operationId | A R09/10/12/21～26/32/33，特别同档案件两次 copy 不同份数/授权 | 两次同类操作需不同证据或不同材料到期门禁时，不能通过现有 gateAssignments 精确选择一条，不可“一条授权套多条” | 只给现有赋值合同增加可选 operationId/精确 objectKey 选择与歧义拒止；使用同项两次 copy 授权相反的正反例及来源签名固定测试。**A 普通不同类别 read/copy 已 SUPPORTED，不需返工** |
| **G01-GAP-04：有限证据关系以外的高级图**。D2_UNMAPPED_ADVANCED | I R007/014/015/020，A R27/29/40，C F03/F06/F07/T04 等**仅当**作者声明 advanced 多向关系且实际判定必须程序核实 | 有限 evidence-any 和一个文书分别给两个字段做关联支持；不支持任意多份佐证的 AND/OR 及多角色 Claim 证明图的无损投影 | 优先拆成现有对象作用域上的多个独立、可观察 Check＋人工复核；**只有不能等价拆分的最小案例**再增量加入显式 claimId×subjectId×evidence fact 的 AND/OR 解释器与失败保护，保留版本指纹。不能因为某模板提及“证据链”就要求全库实现图数据库 |
| **G01-GAP-05：批准稿与执行动作强绑定** | S SP-21～27，特别 SP-24/25、章种／份数／版本 | 现有 D2 只有当前文档版本引用和通用 CaseStage，没有“某有权批准的版本 A 只授权动作 X 上的章 Y、份数 N，执行文件 B 是否仍一致”的独立结构化核验 | 若需要从预审进入程序化用印许可，新增最小 approvedSnapshot（受控批准 actor、批准文件版本、目标动作、章种、份数、批准时间）、executionTarget 与语义比较结果人工确认的门禁；变更执行稿或动作时拒沿用旧批准。**仅制作送印差异预审 Check 不以此为前置工程阻断** |
| **G01-GAP-06：业务阶段/权威事件不能由 CaseStage 推导** | I R025/F23–26；A R26/33/34/37；S SP-21/22/26/27；P R004/012/020～28 | 把“申请/出具/部门签署/批准/已寄/已收”错误投射到技术案卷 submitted/reviewing/decided，并用用户文件声明当官方回执 | 最小仅对需要程序放行的动作增加受控 provider、actor、eventType、documentVersion、eventTime、status 的外部事实契约和 UNKNOWN 处理；未经认证接口只能让 Check 进入人工待核，**不是要求 D3 先接全部校务系统** |

**不列为公共引擎 GAP 的事项**：
- 业务模块没写完、A R24 certified_copy 没有独立权限模块、I 13 分支没有自动事实发现，是 **D4_AUTHOR_WORK**；当前 D2 已认识 certified_copy 操作类型，但档案 helper 明确要求作者为它提供专属 authority-owned 模块，不能改名成 copy。
- 学籍底账/招生原始记录、职工与卡务资格、馆方开放情况、真实组织/签章/收件、真实 ACL/校方权限，分别属 **INTEGRATION_HOLD** 或正式业务治理，不是自然语言审核模板表达不足。
- I C01/C02/C03 现行性、C 模板 2026 强制附件和经办岗、S 章权和表单现行性、P 校/院/年接收方具体要求及 A 档案政策有效性是 **POLICY_HOLD**。
- B 隐藏 Gold 28 案未跑、在线模型漏检率未知、校方真实运行未验，为 **TEST_NOT_RUN**。
- “某规则未硬编码”、“表格检查适合 LLM”、“暂没有复杂证据图”、“没有专门可视化节点编辑器”本身**不构成 GAP**；条件和证据的程序化保证必须由真实反例证明有必要。

### 4.1 最小优先级与开工次序

**立即开工，不等公共 R2**：五套原件→完整 source-catalog/责任-模块映射→D1 workspace（语义＋有限 gate，固定源 locator）→共享 B01/B02 选择或拒绝复用→D3 validate/export/import→可支持部分 D2 preview 与合成 Case。每条无法程序运行的责任在 ledger 标 blocked、manual-only 或 policy-awaiting-confirmation，并保留对应原文；不需要重新开展 A/B/C/D/E 调研。

**定向最小补丁优先**：A 同类 operationId gate 指派（GAP-03，改动小、可复现）；S/P 非学生并发场景与精确动作目标（GAP-01/02）；S 执行版本绑定（GAP-05，仅在需要模拟动作放行时）；高阶证据图（GAP-04，只有真实独立 Check 无法保真时）；受控业务阶段事实（GAP-06，若校务真实系统暂不可接入，D4 保持人工待核即可）。

**统一集成前必须做的技术工作**：选择并固定 R0 或经第三方签署的 R1 新 Release；严禁在五个分支中混用。每项 GAP 要有“失败的最小正反例 → 修复提交 → 受影响模板的重新编译和回归”，R1 的已通过合成 CI 不自动覆盖 S/P 全领域。未取得源政策和外部校方接口也可以做技术预审，不得把结果发布为校方许可。

## 5. 五套模板的 READY_TO_BUILD 清单（精确禁区）

| 模板 | 现在可以制作并以 D3 工具编译的部分 | 暂时不能声明全量已程序支持的部分 | 下一步最短交付 |
|---|---|---|---|
| I | 28 R/28 F/13 S 的**作者态责任**；R1 技术候选下 StudentField+studentScope 与有来源的独立语义 Check；A′ 已为 D4 提供可检查迁移参考 | 法定真伪、可信学籍/招生、P0–P7正式部门阶段；任意 advanced 图；B Gold 尚未验 | 以 A′ 固定 SHA 复核 85 ledger→完整原文责任覆盖→额外缺口明确标记；不改旧 A/C/B |
| A | R01–R42 逐项作者态；已有 item×operation D3 helper，read/copy/excerpt/borrow 技术路径与局部 EvidenceLink | 同类多 operationId 不同 gate，尚缺 R24 独立 author 模块，R29 法定替代验真和复杂关系、馆方批准 | 补出 R24 语义/人工模块，R29/R40 制作为独立可见 Check；GAP-03 留最小复现 |
| C | 共用 C01–C10、家属 F01–F08、临时 T01–T09 全部语义模块；family / temporary-service 单场景编译 | 三方/两代资格证据若要机器自动确定，必须先有可信分角色事实／相关 GAP；校内发卡决定不可生成 | 用 R0 两个已有场景制作两个不同条件包，身份来源待核时输出人工待办 |
| S | SP-01–29 全部语义与材料分阶段检查；版本差异的可读 Check、无害格式变更合理例外 | 多动作合并实例强门禁、批准版本×章种×份数的受控执行、实际监印结果 | 先把预审／译文／密封／批准稿差异做为本地模块；把执行权限义务隔离到 GAP-01/02/05/06 |
| P | R001–R036、B01–B22、S0–S7 的**语义与适用责任**；组织意见出现/日期/纸件差别可以审核并引用 | 多轴实例化强保证、正式组织权限、真实纸件收讫、验签；政治实质评价永不自动实现 | 一份 P 作者态，issue/receive 及阶段保留；未核通知和机构资格 → awaiting-confirmation，不得自动做成品拒件 |

**领域总判定**：**D3 作者态足够 → G01 五套全部 READY_TO_BUILD。D3-R0 不是五套全部强门禁运行的完整实现；R1 也没有自动解决 S/P/A/C 所有边界。** 统一集成可以同时接收五份作者态候选和明确的 GAP 账本，按小范围定向补丁推进，而不是停工等待一轮新的全域调研。

## 6. 审核责任分工、验证口径与交接建议

- **程序化门禁（当前已能做时才设）**：确定性对象实例、来源绑定、明确条件/到期、有效文档版本、独立 EvidenceLink、规则真值、未确认政策不能确定性 PASS、校务动作禁权；典型 I StudentField、A 操作 read/copy、C 顶层 family/temp、通用当前技术阶段。
- **模型语义审核**：文书内容含义、译文对应、合法解释和合理例外的文本核对、跨材料事实冲突说明、政策效力不明时指出未知、部分亲缘和职业关系的证明材料解释、风险客观异常说明。模型必须给出逐项依据/证据定位，不得因为 Check 已编译就假设材料已读或事实已证。
- **人工决定／权威来源**：正式校规适用认证、学籍修改、档案实际开放/外借/证明出具、亲缘或雇用资格与卡务开通、盖章及签名真实性和批准、组织政审意见及政治实质结论、纸质签收和其可信接口。不得以另一个学校的样表、申请人自述、合成数据、AI 生成意见作为部门正式决定。
- **需交统一验收者的技术产物**：每模板完整 source-catalog（原文包含非表格例外和叙述责任）、模块锁／复用理由、D1 JSON、sourceBindings、编译 plan 内的 checkId→ruleId→subjectId/objectKey→sourceIds 对照、逐项状态与 GAP、测试实际执行记录、B Gold 隔离证明和完整 commit SHA。制作时由 D4 作者维护自己的转换 ledger；本报告的建议编号不是已经实现的 Check ID。
- **最小正反例**：I 一证两字段仅一事实确认、未知可信底账；A 同案两次 copy 仅一条授权、馆藏目录开放状态未知；C 已故教工与跨代替代证明、派遣名单无本人；S 空机关栏、批准后实质改稿 vs 无害重导出；P issue 起始无组织章、receive 成品缺章、已上传未纸质签收、规则补充通知变更；五套均有未知政策/材料版本替换/未读页。每例需对应独立 Rule/Check 和负向断言，不能只看自然语言“看起来正常”。
- **本审查未执行部分**：未在新分支安装或跑 Bun/CI；未取得并读取私有 Gold；未执行 G01 全领域 D2/Pi 运行；未向学校接口请求真实权威记录；未验证外部政策 2026 现行性。基于真实仓库源码的适配静态结论与其他固定 PR 的历史 CI 证据，**不能写为本分支实测 PASS**。

## 7. 可核查路径与固定记录

- 原文、哈希、完整范围：docs/design/review-agent/business-templates/G01/README.md、source-manifest.json、originals/ 五文件。
- 统一目录与模块原则：docs/design/review-agent/15-template-modules-and-runtime-boundary-spec.md；16-template-editor-five-g01-gap-and-module-extraction-v0.1.md。
- D3/D4 合同：docs/design/review-agent/23-d3-shared-module-library-and-d4-handoff-contract.md；24-d4-five-template-authoring-and-feedback-loop.md；32-md-to-modular-template-agent-quality-protocol.md；37-d3-r0-frozen-release-and-d4-handoff.md。
- R0 module locks：docs/design/review-agent/fixtures/d3-r0-handoff-manifest.json；d3-b01-delegation-scope.json；d3-b02-evidence-coverage.json。
- 源码：packages/shared/src/types/review-authoring-v1.ts、review-d2.ts、review-d3.ts；apps/electron/src/main/lib/review/review-authoring-v1.ts、review-d3-module-library.ts、review-d3-dynamic-case.ts、review-d2-runtime.ts、review-d2-execution-gates.ts、pi-case-review-service.ts。
- R1 受限技术说明（参考 Draft #83 固定 SHA）：docs/design/review-agent/acceptance/d3-r1-g01-runtime/design-delta.md、migration-contract.md、issues/known-gaps.md。
- I A′/C′ 历史（分别在 PR #84/#85 上而不一定属于 main）：docs/design/review-agent/acceptance/d4-g01-i/agent-aprime-r1/report.md、coverage/ledger-85.json、runtime/README.md；agent-cprime/C-verdict.md。独立 Gold 权限与测试分母仍以 C′ 明确记录为准。

**签署边界**：G01 **AUTHORING_READY_WITH_SCOPED_RUNTIME_GAPS**；不是 FULL_D4_RUNTIME_PASS，不是正式 D3-R1 Release，不是 E 政策验收，不是学校行政模板发布授权。
