# CDUT Studio D4｜G06 全领域 D3 能力适配审计（制作前，2026-10-17）

> **审计身份**：G06 独立技术适配，不替代 A/B/C/D/E 研究，不修改业务规则、Gold、D3 引擎或既有基线。状态是**静态源码—业务责任交叉检查**；尚未构造九套 D1 工作区、运行 G06 D2/Pi 或签署 E 业务验收。G06 正式领域是**科研成果、知识产权及科研伦理/合规**，不是学籍与休学。

## 0. 集成负责人可直接采用的结论

| 维度 | 判断 | 解释 |
|---|---|---|
| 全部九套原始业务 Markdown 定位 | **SUPPORTED（原文可找回）** | 用户 Library 中九份 v0.1 MD 原始字节已实际读取、计算 SHA；来源尚非 Git 生产提交，不能用“已从 Library 获取”冒充持续 ACL/作者生产证据 |
| 语义模块、局部模块、组合、来源映射、版本锁、携包 | **SUPPORTED** | D1/D3 已实现，既有 B01/B02 不是 G06 正式政策；不强制复用 |
| 非发布技术预审：案卷级语义 RuleSpec / Check / Pi | **SUPPORTED（限定范围）** | 可制作九套候选的案卷级责任、保守待核、不适用条件的语义判断及来源追踪，不代表每项复杂状态已程序化或模型准确 |
| **完整** G06 多对象、多动作、组合分支和权利/证据关系无损运行 | **GAP** | D2 目标类型仅校园卡、档案、学籍字段；非学籍多分支使用单校园卡约束；`advanced.evidenceRelations` 明确拒绝；这些是真实源码限制，不是“还未把自然语言硬编码” |
| 学校政策现行性、真实科研底账、有权人批准、Gold ACL | **EXTERNAL / POLICY_HOLD** | 不能伪装成 D3 模块缺口；技术预审草稿可先做，正式批准与真实数据联通须单独治理 |
| **制作安排** | **九套均可立即开始作者态与案卷级候选制作；九套的“完整原文范围已可运行”均暂不能签署** | 对受影响 R 保持 tooling-blocked，补 GAP-01/GAP-02 的最小通用能力后针对确有需要的关系补 GAP-03，绝不重开全量 A/B/C/D/E |

这里 `READY_TO_BUILD` 特指“可以启动真实 D1/D3 模块制作和当前支持部分的 D2 技术运行”，**不是**“整套业务已无 GAP”。若统一负责人把 `READY_TO_BUILD` 定义为“整套所有原文责任已无损且可发布运行”，则当前九套均是 `GAP`，不得把两种完成标准混为一谈。

## 1. 固定证据、目录和输入清单

**阅读的技术基线**：仓库 `AGENTS.md`（只增审计文档、未触及需要用户许可的 AGENTS/README 更新）；D3-R0 `release/d3-r0-20261011@4b191c729f3d5f8135c73b87c17642023f6c3986`；`37-d3-r0-frozen-release-and-d4-handoff.md`、`fixtures/d3-r0-handoff-manifest.json`、`23-d3-shared-module-library-and-d4-handoff-contract.md`、`24-d4-five-template-authoring-and-feedback-loop.md`、`32-md-to-modular-template-agent-quality-protocol.md`；R1 **Draft 候选** `feat/d3-r1-g01-typed-runtime-r01@94d5ec32b6de1ac0c185b63b4aabfddaa29b1649` / PR #83，不是正式 R1 Release。最小作者/编译接口依实际代码核对，不引用未实现的设计能力。

**统一目录**：Library《G06_02_统一模板目录与边界.md》、A 阶段统一共享基线。九套独立审核目的，T01–T09，T10 仅 A 延期研究候选，**本轮不当作第十套已交付 C 母版**。A 阶段正式 `DOMAIN_PARTIAL`；E r01 `audit/g06-e-v1-r01@1dcf4033256121efd3dea62b1153592df1facd7c` / PR #28；E r02 `audit/g06-e-v1-r02@1eabfb9490257f77f81a2401430bb71c76e0c683` / PR #70。E0 有旧 46 ZIP SHA/CRC 记录，九套 B/C/D 输入包固定外层摘要；C 母版不是因此获得 E2 通过，D Gold 独立存储 ACL 仍未证。E r02: `BLOCKED_SOURCE` + `BLOCKED_INPUT`，E2/E3/E4 未正式完成；旧源候选 159 项中 91 个高优先级义务仍待来源补证。这些**不阻止 D4 语义制作**，但不能转成有效的本校强制拒件依据。

| 模板 | 现行业务目的 | 可定位 C 母版（原子 R） | 本次原始 MD SHA-256 | 字节数 | 技术适配/开工状态 |
|---|---|---|---|---:|---|
| G06-T01 | 专利申请与校内权属审查 | `v0.1 / 42R` | `e3bb29673e317bf65b00b9b20f5af56a69d8fb2d87f42e2c3aab0473d7e9f727` | 94183 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T02 | 软件著作权申请与校内权属审查 | `v0.1 / 36R` | `251640d6dfe6746dca1296bde9ef9e0ee0f314be539270ab17c46ee581c557b5` | 111868 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T03 | 科研成果首次登记与认领 | `v0.1 / 30R` | `925ce8215d138bed2558efb004d9d30e2ce318a9376207df18d60a5ae0964d9f` | 110459 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T04 | 已有成果记录更正与去重 | `v0.1 / 35R` | `d222b07422fdad32b19ade9e5f8373c9189ec12907e4e8f5b72259591934b640` | 117216 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T05 | 学术活动及成果公开前保密合规核验 | `v0.1 / 28R` | `d0062108a34b73e4c21e56f6d164d147de8a5731e876f10a08612ac370838ec1` | 96847 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T06 | 科研成果官方宣传发布审签 | `v0.1 / 34R` | `77f89ac22112477e472d03cbac2696a1a58760dfec38466fe6bce8ee2db75204` | 65558 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T07 | 涉人研究伦理材料核验 | `v0.1 / 35R` | `00fb0f834316ab781ce4e40f624de08d3ff8f0ec48e72f838671379a6fb12a78` | 88937 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T08 | 动物实验伦理材料核验 | `v0.1 / 24R` | `95d82865daec9494e08510592450b98a7baa673980a90451d21c66ef04df7882` | 72476 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |
| G06-T09 | 科技成果转化、赋权与权利处分校内审查 | `v0.1 / 32R` | `aaf92ece906710162dc48e2805f38db56cc6e172e6ba5971c06f5fbce65422aa` | 103676 | GAP（完整案卷运行）；**READY_TO_BUILD**（语义制作与限定技术预审） |

**来源冻结的精确定义**：上表 MD SHA 是**本次独立读取 Library 原始文件字节**所得；C 候选 ZIP 的外层 E0 冻结值请以 `.../G06/acceptance/E-v1.0/E0-input-manifest.json` 为准。除已有 C 交接对照可核的项外，不声称所有内层文件逐字节复核过 E 的 ZIP 清单。原始 Markdown 未自动进入 Git。**T01 另有后出 v0.1.1**（99,974 字节，SHA-256 `819ede4d926cfc671b22c19ecb3ec0fea03c75ba2f27f492fad47912a3024230`），在原 R01–R42 后加 **R43 国家第 85 号令第 8 条一般不予优先审查因素**，应并入 `G06.PAT.national-priority`，但不能静默替换 r01/r02 原 v0.1 来源；进入制作时应由负责人选择固定版本并显式升版。T04 C 迁移包名称出现 v0.1.1 是**交接文档版本**，核验报告确认业务母版仍 v0.1、35R，非另一份新业务母版。

**A/B/C/D/E 历史交付**：九模板各有 B 深调、C v2.1 迁移交付、D `INPUT_ONLY` / `EVALUATION_ONLY` / 报告包三项，精确名称及 SHA 均在 E0 manifest；这些原始包主要在 Library，不在 Git main 的 `business-templates/G06` 下。E r02 后验 9 作者 Git 分支及 10 增量 ZIP 不构成旧 Gold 生产 Git SHA/权限隔离证明。作者候选业务状态 `BUSINESS_MD_DRAFT_WITH_GAPS`。本审计不读取任何隐藏答案、不使用 E 的研究问题反向改写 C 规则，也不声称通过学校授权。

## 2. 已实现 D3 能力和明确界限（以固定源码为准）

| 链路 | **SUPPORTED** 实现 | 不可越界的实际限制 |
|---|---|---|
| D1 作者态 | `ReviewAuthoringWorkspaceV1` 的语义 `tasks: {id,title,requirement,completion,limits}`、局部任务、模块 references、场景声明、来源 `sourceBindings`；`review-authoring-v1.ts` 校验/保存/修订/预览/候选 | 语义文本可以表达条件，但**不会**被自动变成 `ConditionAST`；宣告 `gate` 后不可从 D1 无条件候选编译 |
| D3 共享与版本 | `review-d3-module-library.ts` 冻结 `moduleId+version+digest`、依赖锁、携包导出导入，`review-d3-upgrade.ts` 影响/显式升级；`review-d3-workspace-locks.ts` 防版本漂移 | B01 `agent-authorization@1`（`e48d279c...`）和 B02 `evidence-source-boundary@1`（`98cc16b5...`）是**合成语义样本**，只能复用“区分代办与授权”“证据来源/覆盖边界”这一层，不复用具体本校审批资格 |
| 来源与制度效力 | `ReviewAuthoringSourceV1` 的 `kind/verification/applicability/reference.documentVersionId/locator`，按实际 Check 的实例来源绑定。D2 把未核政策标为 `unverified-policy`，不会自动升格为有效校规 | `content-checked`、网页来源、申请人上传均不等于正式校方适用或真实证件核验。**制作来源 SourceId ≠ 某案材料 SourceRef** |
| D2 技术编译 | `review-d2-runtime.ts:compileD2RuntimePlan` 产生固定 `RuleSpec`、`D2RuleBinding.checkId/objectKey/subjectId/sourceIds/authority`、`D2RuntimePlan.fingerprint`；`review-d2-plan.ts` 的 `preview/register/create` | `D2TargetKind` 只有 `campus-card/archive-item/archive-operation/student-field`；`D2_TARGET_INVALID` 拒绝科研对象；非学籍含场景模板受单一 campus-card scenario 强约束 |
| 条件、材料和未知 | `D2ExecutionGateV1` 有 `all/any/not`、人工确认观察值、按当前证据关联 `evidence-any`、有限 `case-stage`、**仅合成学籍**可信快照；`material.provider=applicant/authority`、`dueStages`、`alternatives`；`review-d2-execution-gates.ts` 三值 fail-closed | 不存在任意科研业务的权威底账字段查询、规则日期比较、任意对象深度关系；不能用学生合成 `trusted-registry-field` 冒充成果/伦理系统；未到期、部门持有的材料不能判申请人缺件 |
| 复杂关系 | 单个 `SourceRef`/人工 `evidenceLink` 可以连接当前文档版本与一个已知 Subject 的一个事实标签，Pi Check 引用也可校验 | 非空 `workspace.advanced` 的 Claim/Evidence 关系在 D2 明确抛 `D2_UNMAPPED_ADVANCED`；不是“先写字段将来会实现” |
| Pi 运行和结论 | `createD2TechnicalCase`、`preparePiReviewRunV2/submitPiReviewResultV2/verifyD2PiRun` 有当前案卷/规则/来源的回执校验；人工可看待核理由 | 非官方行政审批；`CheckStatus`/Run 输出未实现 G06 独有的每人/每资产/每权利交易对象多级结构；只编译通了整案 Check 不足以交付 |

**程序化门禁准则**：精确归属到哪个独立对象/动作、哪个文书版本、某事实是否由当前有效有权来源确认、材料何时到期/由谁提供、正式决定是否确实存在和对哪个范围生效，必须有**不能仅依模型自由回答绕过**的边界；已实现的 D2 门禁优先用，超出则标 GAP。是否文书表达充分、内容是否自洽、是否应提示权利冲突/科研风险，允许**语义模块**（并提供证据位置与未知待核）；权利授予、伦理科学决定、保密许可、涉外审查、签章发布、对价争议，只能由人/有权系统决定。缺少当前校方规章属于 `policy-awaiting-confirmation` 而不是 `tooling-blocked`。

## 3. 逐模板模块构成与原文 R→技术责任覆盖表

映射标记说明：**R 列不是已创建 Check ID**。拟建模块中每一可独立判断的义务在 D4 `source-catalog/ledger` 追溯到独立 Check 或明确等价组合；需要不同 Subject 结果的职责必须分开。**可复用**：B01 的“经办人/受益人/有权签审者分离”局部语义，B02 的“申请声明/证据版本/可信权威/适用范围”局部语义。建议先在九套的共同适配层 `G06.local.source-version-boundary`、`G06.local.applicant-vs-authority` 抽取，但**未验证同义前不冻结新共享版本**；各域特定权属、豁免、审签路线都保留模板局部，不导入其他模板的行政授权。

### G06-T01｜专利申请与校内权属审查
源文件：`G06-T01_正式业务模板_MD_v0.1.md`（上表 SHA、94183 字节）。原子规则主锚：**第 248 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 42 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-04 | `G06.PAT.route-policy` | 主路径/类别/学校有效性/校外自办；路径未知不转不适用；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-05–R-10 | `G06.PAT.people-rights` | 发明人、拟申请人、职务成果、合作/代理人身份与权属范围；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-11–R-14 | `G06.PAT.docs` | 技术交底、外观设计附件、法定提交材料、检索条件；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-15–R-20 | `G06.PAT.fast-track` | 本校快审的申请表、主体、领域、排除、窗口和配额；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-21–R-29 | `G06.PAT.signature-risk` | 校内签审先后、代理范围及限制、敏感/境外保密/公开/优先权；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-30–R-35 | `G06.PAT.national-priority` | 国家优先审查和快审不得串级；国家状态与校内状态分离；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-36–R-42 | `G06.PAT.lifecycle` | 非处分性更正/真实转让分流，底账未知、逐专利逐动作、撤回、批准版与补件版；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：同案多专利×多动作 R38，叠加轴及阶段/批准版本 R19/21/30–35/39–40 缺准确目标与有权状态；不准拿校园卡/档案目标冒充专利。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T01.applicability`、`G06-T01.material-evidence`、`G06-T01.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T02｜软件著作权申请与校内权属审查
源文件：`G06-T02_正式业务模板_MD_v0.1.md`（上表 SHA、111868 字节）。原子规则主锚：**第 309 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 36 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-03 | `G06.SW.route-actors` | 申请/补正/登记后变更与经办角色、版本政策；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-04–R-08 | `G06.SW.forms` | 本校/国家表格、承诺、程序和文档鉴别件条件；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-09–R-16 | `G06.SW.deposit` | 一般/例外交存、页行、遮盖、源程序、封存互斥和叠加；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-17–R-19 | `G06.SW.version-consistency` | 签名、软件名称/合法更名和版本、功能跨件一致；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-20–R-28 | `G06.SW.rights-license` | 开发人/著作权人/合作方/委托/继受/原许可/开源/校本AI承诺；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-29–R-31 | `G06.SW.school-external` | 学校签章、开发前备案、账号授权与外部登记决议隔离；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-32–R-35 | `G06.SW.post-submission` | 补正、登记变更、撤回、拒登的有权外部状态；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-36–R-36 | `G06.SW.partial-output` | 多软件/多权利人/多操作局部结果、来源未知与重审；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：§2 明确可同案多软件版本/权利人/操作；R20–24、R36 逐软件×操作及权利人关联无通用 Subject 绑定；BR01–11 的主操作与叠加交存选型不能用单校园卡 scenario 原样编译。页行数 R09–14 可语义核对，不因未提供专门计数执行器而判引擎 GAP。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T02.applicability`、`G06-T02.material-evidence`、`G06-T02.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T03｜科研成果首次登记与认领
源文件：`G06-T03_正式业务模板_MD_v0.1.md`（上表 SHA、110459 字节）。原子规则主锚：**第 333 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 30 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-02 | `G06.ENTRY.route-search` | 首次入库与已锁定更正分流，可信成果库检索；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-03–R-06 | `G06.ENTRY.work-contribution-claim` | 本人/非本人认领、原始署名位、Work–Contribution–Person–Claim；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-07–R-11 | `G06.ENTRY.type-milestone` | 按成果类型补报，论文/索引/专利/录用/发表阶段；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-12–R-12 | `G06.ENTRY.dedupe` | 同作品强标识去重与弱匹配候选；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-13–R-15 | `G06.ENTRY.actor-workflow` | 学生与操作人身份、院校审核分层、学科类型；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-16–R-17 | `G06.ENTRY.sources` | 逐事实权威证据、合法替代和条件缺件；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-18–R-19 | `G06.ENTRY.partial-result` | 成果事实≠绩效；作品事实与个人认领结论独立；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-20–R-24 | `G06.ENTRY.timeline` | 事件时间、底账未知、同作品多署名合法认领、版本更新；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-25–R-26 | `G06.ENTRY.auth-audit` | 自然/社科归口、提交权限与账号审计；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-27–R-30 | `G06.ENTRY.batch-revision` | 多作品批次、退回重报、正式否决和一数一源；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：R03–06/19/22 的 Work、Contribution、Person、Claim 必须独立目标并避免把一个人问题扩展至整作品；R12/27、R24 跨作品去重/版本关系需要作用域，advanced.evidenceRelations 当前编译必拒。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T03.applicability`、`G06-T03.material-evidence`、`G06-T03.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T04｜已有成果记录更正与去重
源文件：`G06-T04_正式业务模板_MD_v0.1.md`（上表 SHA、117216 字节）。原子规则主锚：**第 191 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 35 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-04 | `G06.RECORD.route-target` | 现存记录、首次入库分流、逐变更请求与适用时点；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-05–R-07 | `G06.RECORD.actor` | 反馈者/代办/校内归口操作权限；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-08–R-12 | `G06.RECORD.old-new-facts` | 旧值新值、论文位次、人员同一性、题名别名与外部阶段；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-13–R-15 | `G06.RECORD.merge-split` | 候选重复强关联、主被并记录、非重复禁并；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-16–R-18 | `G06.RECORD.external-correction` | 外部正式更正与仅校内误录、误认领恢复；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-19–R-22 | `G06.RECORD.authority-execute` | 锁定更正权限、底账不可达、批准与真实执行两轨；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-23–R-27 | `G06.RECORD.audit-flow` | 一数一源、下游提示、拒退撤状态、可信查询；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-28–R-31 | `G06.RECORD.operations` | 多操作分项、重审、误合并拆分和异议裁量；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-32–R-35 | `G06.RECORD.evidence-output` | 申请字段≠证明、有效时间、最小披露、正式决定隔离；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：R08/13–15/23/28/30 必须绑定原记录、新记录、变更/去重/拆分 operation，且部分批准/执行不能被泛化整案 Check；D3 没有这种带前后对象引用的 D2 target。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T04.applicability`、`G06-T04.material-evidence`、`G06-T04.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T05｜学术活动及成果公开前保密合规核验
源文件：`G06-T05_正式业务模板_MD_v0.1.md`（上表 SHA、96847 字节）。原子规则主锚：**第 246 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 28 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-04 | `G06.DISCLOSE.policy-route` | 版本适用、公开动作、当前稿件与阶段材料；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-05–R-08 | `G06.DISCLOSE.version-secrecy` | 稿件/作者/身份、保密限制与专岗流转；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-09–R-13 | `G06.DISCLOSE.special-paths` | 特定学校研究生/涉外交流/合作许可；伦理及专利只提示；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-14–R-18 | `G06.DISCLOSE.old-new-approval` | 实质改稿、公开动作与批准范围、否决撤销、事前顺序；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-19–R-20 | `G06.DISCLOSE.equivalence` | 科研诚信与保密分开、OA/纸件的有权等价；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-21–R-24 | `G06.DISCLOSE.multi-scope` | 多稿/公开动作分项、问题聚合、后置材料与撤回过期；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-25–R-28 | `G06.DISCLOSE.safe-exit` | 涉密研究生限定、无校审义务安全退出、专利及出境分流；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：R10–11 存在可同时触发的涉密研究生论文与境内涉外交流双路径；当前非学生领域多 scenarios 限制和真实涉密身份信源不足。R14–18/21–24 的每稿×公开动作×获批版本跨对象绑定未实现；单稿单动作纯语义技术预审可立即制作。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T05.applicability`、`G06-T05.material-evidence`、`G06-T05.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T06｜科研成果官方宣传发布审签
源文件：`G06-T06_正式业务模板_MD_v0.1.md`（上表 SHA、65558 字节）。原子规则主锚：**第 155 行附近 / §8**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 34 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-06 | `G06.NEWS.route-version` | 官方频道/申请角色、线索与送审稿版本；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-07–R-10 | `G06.NEWS.claims` | 科研主张逐项事实来源、成果阶段和责任人；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-11–R-15 | `G06.NEWS.assets` | 图片/视频、版权/肖像/个人信息、合作许可；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-16–R-21 | `G06.NEWS.authority` | 保密与专业复核、首次阶段、真实审签、逐频道权限与禁止伪发布；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-22–R-26 | `G06.NEWS.revision` | 实质/非实质修改、刊后勘误撤稿、与成果库更正分流；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-27–R-30 | `G06.NEWS.partial-evidence` | 逐素材结论、矛盾证据、底账和政策未知；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-31–R-34 | `G06.NEWS.output-audit` | 辅助成果依据、非默认承诺、真实发布留痕和失效重审；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：§2 ReleaseAction(channel,operation,version) 与 Claim/Asset 多对多关联；R07/11–14/20/27 每渠道×主张×素材权利不得相互污染。现有 Subject target 无频道动作或素材种类；单渠道无复杂素材的稿件可先做可运行语义稿。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T06.applicability`、`G06-T06.material-evidence`、`G06-T06.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T07｜涉人研究伦理材料核验
源文件：`G06-T07_正式业务模板_MD_v0.1.md`（上表 SHA、88937 字节）。原子规则主锚：**第 179 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 35 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-06 | `G06.HUMAN-ETHIC.route` | 适用人群/机构、操作路线、PI与初审及医学附件；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-07–R-09 | `G06.HUMAN-ETHIC.risk-consent` | 参与者保护、数据样本、普通知情同意；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-10–R-15 | `G06.HUMAN-ETHIC.exceptions` | 四种不同的豁免/免签/简易审查和弱势人群；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-16–R-20 | `G06.HUMAN-ETHIC.cross-docs` | 研究参数跨件、资质/利益冲突、替代材料与多中心委托；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-21–R-28 | `G06.HUMAN-ETHIC.after-approval` | 批件与方案、修正、先批后做、跟踪不良事件、终结及申诉；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-29–R-35 | `G06.HUMAN-ETHIC.authority-output` | 正式伦理决定不可推、分中心分对象、隐私与冲突、重大风险、重审；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：R10–15 的审批路径条件不是互为一项通用豁免；R16/20–24/30 的 study×center×protocol×consent version 和跨件关系缺可执行作用域，批准范围与版本绑定缺真实有权阶段关系。单方案形式预审可先做语义模块。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T07.applicability`、`G06-T07.material-evidence`、`G06-T07.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T08｜动物实验伦理材料核验
源文件：`G06-T08_正式业务模板_MD_v0.1.md`（上表 SHA、72476 字节）。原子规则主锚：**第 200 行附近 / §09.2**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 24 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-04 | `G06.ANIMAL-ETHIC.route` | 基金证明与实施许可分流、PI、方案/申请表版本；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-05–R-11 | `G06.ANIMAL-ETHIC.scope-welfare` | 逐动物分组数量、3R/福利、供应商/设施许可证及分阶段凭证；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-12–R-15 | `G06.ANIMAL-ETHIC.approval-change` | 实施先后、重大/一般变更、旧批件合法沿用；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-16–R-21 | `G06.ANIMAL-ETHIC.followup` | 福利事件、终结/发表用途、正式决议、补件、撤回；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-22–R-23 | `G06.ANIMAL-ETHIC.special-safety` | 跨机构生物安全许可与校内实验安全两套责任；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-24–R-24 | `G06.ANIMAL-ETHIC.partial-output` | 逐动物/设施/操作局部结果、来源故障、多问题聚合；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：§04 九条路径以及 R05–12/15/24 要逐 animal_scope、batch、facility、operator、protocolVersion 归集，R02 基金证明不能变实施许可。现有目标/有权事实没有这组类型；数量汇总可先做语义与人工复核，不因此单独判代码缺口。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T08.applicability`、`G06-T08.material-evidence`、`G06-T08.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。

### G06-T09｜科技成果转化、赋权与权利处分校内审查
源文件：`G06-T09_正式业务模板_MD_v0.1.md`（上表 SHA、103676 字节）。原子规则主锚：**第 211 行附近 / §9**；每条 R 有独立标题、条件、证据及处理语义，原文件全文是责任定义真值。共 32 项，以下映射 **无重叠、无遗漏**。模块标识是**拟新建的 workspace-local 名称，不是声称仓库已有的冻结模块**。

| 原文规则 ID（连续覆盖） | 拟建局部语义模块 | Check / Subject / 来源及门禁去向 |
|---|---|---|
| R-01–R-04 | `G06.TRANSFER.route-actor` | 动作分流、版本适用、完成人/权利人/经办人及授权；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-05–R-10 | `G06.TRANSFER.rights-grant` | 逐成果/权利份额、共同权利、赋权所有权与长期使用权；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-11–R-13 | `G06.TRANSFER.license-sale` | 许可/转让法效、独占/地域/期间、交易对手主体；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-14–R-18 | `G06.TRANSFER.price-notice` | 定价路径、公示异议、对象×金额口径；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-19–R-22 | `G06.TRANSFER.invest-abandon` | 作价投资、放弃权利全权利人同意与外部生效；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-23–R-27 | `G06.TRANSFER.contract-pay` | 特定限制、收益分配、合同批准范围、登记、实际到账；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |
| R-28–R-32 | `G06.TRANSFER.partial-output` | 多标的部分结果、批准版重审、底账故障、人工价格争议与事实更正分流；每项生成可定位 Check、绑定候选 SourceId；需逐业务对象的子 Check 则标记 GAP-01，绝不用整案 Check 冒充。 |

**明确阻断责任**：R05–12/14–22/24–29 的 IPRight×fraction×transaction×counterparty×operation 必须单元独立；全权利人同意、比例/金额汇总、许可与转让不可相互继承批准证据。现有 D2 对象种类及 advanced 映射不足。

**额外覆盖（不止 R 表）**：原文的场景/互斥与条件轴、字段字典、材料槽/合法替代、阶段状态、来源索引、限制/例外及输出契约必须另入 C→D4 ledger；分别由 `G06-T09.applicability`、`G06-T09.material-evidence`、`G06-T09.state-and-report` 三个**模板局部**责任层承接。当前记录的是适配建议，**不是**声称已逐行转成 Check 或已通过 Pi 实测。


## 4. 全域模块复用矩阵（真实资产与拟建责任必须区别）

| 局部审核责任 | 候选消费者 | D3-R0 已有可冻结资产？ | 推荐复用界限 |
|---|---|---|---|
| B01“经办权限≠本人权利≠有权签审” | T01/T02/T03/T04/T05/T06/T07/T08/T09 | **有合成 `agent-authorization@1`** | 仅在真实任务与合成责任同义时绑定实例 Check；不能继承校院权限、代理时长、团队处置权 |
| B02“证据来源与范围、当前版本、缺失/未知分离” | 九套全部 | **有合成 `evidence-source-boundary@1`** | 只复用局部证据思路；成果库权威状态/外部机构许可需要当前模板独立 SourceBinding |
| 模块 `G06.local.policy-effective-scope` | 九套 | **没有；可新建** | 同校制度/适用时点/对象/行为维度，待核时不得强制；不把本校模板内容写进跨校共享模块 |
| 模块 `G06.local.version-snapshot` | T01/T02/T03/T04/T05/T06/T07/T08/T09 | **没有；可新建** | 定位送审批稿、变更前后、外部凭据；若需原子性跨对象校验标 GAP-03 |
| 专属模块 `G06.PAT/SW/ENTRY/RECORD/DISCLOSE/NEWS/HUMAN-ETHIC/ANIMAL-ETHIC/TRANSFER.*` | 各自模板 | **没有；必须本地制作** | 保留成果客体、官方用途、豁免类型、权利处分及阶段差异，禁止为复用把 T03 首次认领并入 T04 真正历史修改，或把 T05 投稿许可当 T06 官方新闻许可 |

## 5. 真正公共技术 GAP（有源码证据、最小补充、受影响 R）

### GAP-01｜任意业务对象的精确作用域与多目标实例化（**阻止九套全量 D2 运行**）

- **实际代码**：`review-d2.ts:D2TargetKind` 四个枚举；`review-d2-runtime.ts:validateTargets` 非四类拒止；`compileD2RuntimePlan` 普通非学生任务**不按选中科研对象复制 Check**；未使用的自定义 target 不接受。G01-I R1 的 `studentScope` 只针对 `student-field`，不是通用 `subjectScope`。
- **影响**：T01 R38 多专利×动作；T02 R20–24/36 多软件/权利人/操作；T03 R03–06/19/22/27 的作品×署名位×认领；T04 R08/13–15/28/30 原/被并记录×操作；T05 R21 同案多公开对象；T06 R07/11–14/20/27 声明×素材×发布频道；T07 R16/20/21/30 项目×中心/方案；T08 R05–12/15/24 动物×设施×批次；T09 R05–12/18/24/28 权利×份额×处分动作。
- **可复现**：给 D2 `targets` 新种类 `research-work` → `D2_TARGET_INVALID`；即使删除目标只留 case Check，逐对象 `Subject/SourceRef` 和独立结果会丢失。这不是业务事实待核。
- **最小补充**：可用增量泛型 `domain-object`/稳定 `kind+objectKey+subjectId+operationKey` 或等价受控对象类型；在 `sourceBindings` 精确声明作用范围并对选中目标生成独立 `Check/RuleSpec/Subject`、拒绝零目标/未消费目标；每个目标绑定独立材料事实，Run/plan Fingerprint 固定。**无需**一次设计全高校通用对象图/新的审核引擎。

### GAP-02｜非学籍业务的互斥+叠加场景及三值触发的目标作用域（**影响九套的多条件路径**）

- **实际代码**：`compileD2RuntimePlan` 接受 `scenarios[]` 最多 13，但声明场景的**非 student-field** 模板被 `D2_SCENARIO_SCOPE_REQUIRED` 限成单个 `campus-card` target + 单 `scenario`。仅 D1 声明 `scenario` 或写自然语言不会让 D2 自动执行条件。
- **影响**：T01 快审/国家优先/保密联动；T02 主动作+合作+一般或封存交存；T03 首次/认领叠加补录；T04 更正/归并与锁定；T05 涉密研究生公开与涉外交流可**并发**；T06 渠道×图片×改稿；T07 豁免/同意与多中心；T08 九个内部路径/采购阶段；T09 赋权/许可/公示与共同权利人。
- **最小补充**：允许非学生的显式 `selectedScenarioAxes` 或已存在 `scenarios[]` 绑定业务目标与实例 Check，具有 `TRUE/FALSE/UNKNOWN` 状态来源及互斥校验；未知条件保留待核，禁止删除 Check 或把新分支静默视为假。**不要求**把复杂实质判定全部硬编码：已能通过现有证据门禁判明的条件用 Gate，其余语义 + 待核记录；不能随意借一个假的校园卡主体解锁。

### GAP-03｜必要的跨对象事实/版本关系（**在明确需要精确计算的部分局部阻断**）

- **实际代码**：`ReviewAuthoringAdvancedV1.objectRoleKeys/claimKeys/evidenceRelations` 存在但 `compileD2RuntimePlan` 对非空高级数组拒绝 `D2_UNMAPPED_ADVANCED`；有限一份文书多事实的 R1 模拟学籍绑定不支持一般科研 Claim 图。
- **必要范围**：T01 同一专利申请人与发明人权利/正式批准版本；T02 权利人-开发人-合法合同和多个权利人的个别同意；T03 Work–Contribution–Person–Claim / 一数一源；T04 原记录→新记录、保留合并来源；T05 批准稿→变更稿→指定披露动作；T06 ReleaseAction–Claim–Asset–license；T07 方案版本/批准书/参与者同意条件；T08 animal_scope/设施许可/累计用量/批件有效范围；T09 IP-right/处分份额/合同相对方/收益分配。
- **最小补充**：不必实现通用深层法律关系推理。先基于 GAP-01 稳定目标，支持作者声明的**有限、具名、可验证的二元/三元关联**（文书版本↔目标↔支持事实；需人工确认并按文书与对象撤销），且对同一任务中的跨对象关系错配直接拒止；超出受控关系必须人工待核。只在制作时触发真实 `advanced` 使用的模板局部修，**不因暂时保持语义文本就把全部表述判技术阻断**。

### GAP-04｜G06 分项输出与有效有权状态关联（**按实际需求的输出适配，不自动要求新引擎**）

- **实际代码**：当前 Pi/D2 `CheckStatus` 可表达常规合规、缺件、未知/不适用和 SourceRef，但不会原生生成 G06 MD 定义的三轴状态（如 T08 `material_review_state / authority_state / execution_state`）及 per right/asset/claim 的独立汇总；`case-stage` 只是通用审查阶段，不能表示正式伦理决议/专利国家阶段/新闻已发布事实。
- **影响**：T03 R19、T04 R21–23/28、T05 R18/21–24、T06 R20–21/27/33、T07 R21–30、T08 R02/12/19/24、T09 R17/22/27–29；T01 R35/39/40、T02 R29/32–36。同一「材料可供复核」不等于「正式获批」。
- **最小补充**：优先采用**不更改 Pi CheckStatus** 的 G06 局部适配/汇总侧车：`checkId + objectKey + actionId + sourceRef + currentVersion + triState + issueCodes + nextActor + officialDecisionRef?`，有权状态严格只从可信独立决定引入，默认 `UNKNOWN`。若当前服务无处持久绑定该侧车且要求同案逐对象固定运行验收，才归因 D3/R2 公共接口缺口。**保密、伦理许可、成果赋权、新闻上线等实际有权审批流程建设属于外部系统/人，绝不要求 D3 自动做决定。**

**非 GAP 的事项**：没有每条 Rxx 的 hardcoded AST、没有自动法律真假判断、没有全部数值计数执行器、无本校官方规则/表单、未取得 Gold ACL、未知学校真实账号身份——分别属于可接受语义模块、人工专业判断、来源/身份外部依赖、独立验收前置；不能因为这些存在就要求重做 D3。

## 6. 程序化 / 语义 / 人工的职责切分及技术去向

| 类别 | 推荐所有模板执行方式 | Check / Subject / SourceRef / RuleSpec 对应 |
|---|---|---|
| **P 程序化边界** | 作者态模块 digest、来源类型/适用效力、按目标的 Check 生成与去重、对象/动作/版本绑证、条件三值、材料责任人及到期阶段、有权决定不可由申请人自述变造 | D1 sourceBindings→D2 `mapping`/gate→Case subjects→Pi evidenceLinks+SourceRef→`verifyD2PiRun`；不具备目标/关系时报 GAP-01/02/03 |
| **S 模型语义** | 文书内容互相印证、科研报道陈述与凭证阶段一致、署名与贡献描述矛盾、合法替代类型识别、实验风险论据是否存在、同案异常初步提示 | 每项保留局部自然语言 `requirement/completion/limits`，编译成 `RuleSpec.execution=semantic` 的独立 Check；必须报告引用证据位置，未知转待核 |
| **H 有权人工** | 专利权利纠纷和国家审查、学校盖章和代理禁用的具体判断、科学伦理是否可接受、保密许可、科研不端定性、发布最终审签、交易定价/赋权/放弃权利决定 | 明确 `manual-only/authority-owned`、`nextActor`、不得显示 `official-approved`；能验证材料不意味着能代有权人批准 |
| **X 外部可信信息** | CDUT 科研成果主记录、国家知识产权/版权登记真实状态、学校涉密身份与保密流程、伦理批件、权利人及权利份额、实际实验许可证、发布/归档/付款记录 | 当前无 G06 专用受鉴权 adapter；只能预审/待确认/转部门取证；**不拿 D3-R1 的 `controlled-synthetic` 学籍快照冒充 G06 权威库** |

**每一项 Check 必须**可追溯 `原文 R及非R不变量→模块实例路径→sourceBinding[checkId]→实际 D2 mapping.ruleId/sourceIds/subjectId（如有）→Pi Run/SourceRef→责任状态`。在 GAP 未补前登记 `tooling-blocked` 并保留原文；不要为了凑 “coverage PASS” 把多个应独立的对象挤成一个 case-level Check；学校制度不明的应登记 `policy-awaiting-confirmation`。

## 7. D4 即刻执行范围、停工范围和关闭门槛

**无需等待公共引擎修复即可执行**：九套各自在独立工作区对现有 v0.1 固定 SHA 提取 `source-catalog` 与条件/例外/材料/阶段表；创建 D1 语义局部模块与模板局部 Check，逐个绑定 SourceId（仅允许适用性诚实的候选/合成），再做 `validate → D1 revision/save → D3 frozen/portable export/import → D2 case-level preview`；可做单对象、不含复杂跨件作用域的合成 Pi 技术预审候选。先明确 B01/B02 实际采用或拒用理由。T01 若使用 v0.1.1，追加 R43 且显式记录与旧来源的差分。

**不得提前声称完成**：任何九套的全部场景×对象已经有完整 Check/Subject/Runs；不得伪用 archive 或 campus-card 来代表科研成果客体；不得拿模型输出表示伦理批准、学校保密放行、新闻发布、IP处分签署、国家授权；不得根据主目录没有 C 文件就改写既有母版。原 C 文档仍保留原 SHA，D4 分支不得触碰 Gold。

**统一技术返工的最短路径**：
1. 负责人确认 GAP-01 的泛型目标+逐对象 Check/Subject 绑定最小需求，先在 G06-T03（作品+署名位）和 G06-T06（渠道+素材）各做一个**合成负例**验证对象证据不串用；一次共性补丁即可，不必让九域分别改 D3。
2. 若此后需要复合分支才触发 GAP-02，以 T05 同时满足“涉密研究生论文+境内涉外交流”和 T02 “合作+封存”做守卫反例；未知条件不可误标不适用。只有实际需要执行关联时按 GAP-03 补有限关系。
3. 通过同一新技术 SHA 下的 D1/D2/D3/Pi 正反回归、明确固定模块锁/迁移说明后，再由九套 D4 各自迁移已受影响 Check。G06 局部侧车输出 GAP-04 优先不侵入公共内核。
4. 源有效性/权属/权限 E 验收继续由原负责人各自推进，不作为“修复程序后已通过学校制度”的逻辑前提；这不是一次新增 A/B/C/D/E 全域研究。

**关闭 GAP 必须附**：原文 R ID+分支+对象/文书版本、失败前实际编译错误或错误目标计数、最小代码/适配改动、修复后的实际 plan `Check/Subject/SourceRef/fingerprint`、Pi 正反例与当前代码 SHA。仅“新增一个类型”“prompt 补了说明”或“CI 旧版本绿色”都不构成关闭。

## 8. 本次真实验证、限制与交接

- **执行过**：读取九套 Library 原始全文并计算字节 SHA、逐 R 核对 ID 连续（296 项旧候选基线；T01 新增 v0.1.1 为 297 项），将每一原子 R 分配给以上一项局部模块候选且无重叠/遗漏；逐项审查 `review-authoring-v1.ts`、`review-d2-runtime.ts`、`review-d2-execution-gates.ts`、`review-d3-module-library.ts`、`review-d3-upgrade.ts`、共享类型、R1 已知缺口及 D4 质量门槛。原文还存在非R分支、例外、材料和输出定义，**本清单不是对这些非R叙述义务的自动逐行等价认证**。
- **未执行**：九套 D1 JSON 制作或真实 Pi 运行；Gold 内容读取/对照；校方实时接口；GitHub Actions 本分支编译回归（本分支仅新增文档、没有前端/渲染代码修改）；所以此报告不写“模板已运行 PASS”“全域 E PASS”或“完整覆盖已经验证”。
- **建议验收入口**：`32-md-to-modular-template-agent-quality-protocol.md` 要求完整 Source-Catalog（包含非R原文锚）+ Ledger、独立 Gold、实际 D2 plan 才能使用 `review-d3-md-coverage.py` 真正验收；本轮仅提供制作前的适配判断，不以这份静态表替代后续运行验收。
- **来源**：私有 Library 的九份原文（本报告只给名称/摘要，不上传正文）；repo G06 E r01/r02 manifests/verdict；D3-R0 技术交接、D3-R1 Draft 实码与 D4 协议。只在本独立适配分支新增该报告，冻结母版、Gold、公共引擎、AGENTS/README 均未改变。

**最终签署**：`G06_DOMAIN_ADAPTATION=SUPPORTED_FOR_D4_AUTHORING; FULL_FIDELITY_D2_RUNTIME=GAP(GAP-01,GAP-02,SELECTIVE_GAP-03,GAP-04);` `READY_TO_BUILD_SCOPED=G06-T01..T09;` `FULL_TEMPLATE_RELEASE_ACCEPTANCE=NOT_RUN`。统一集成负责人可以立即组织九套制作；修复的优先项是对象/实例和非学籍复合条件，而不是重新编写 296 条规则或研究政策。
