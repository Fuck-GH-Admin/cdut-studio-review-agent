# D4 / G08｜现有 D3 模块化能力适配检查（2026-10-17）

> **状态：独立静态技术适配核对；未生成技术模板、未运行 G08 Pi Case/Run、未读取 Gold、未授权发布。**
> 审查身份：G08 D4 适配检查 Agent。报告独立保存到 `audit/d4-g08-d3-fit-20261017`，不修改既有 A/B/C/D/E 冻结原件、D3-R0/R1 或公共引擎。
> 判定对象：**在固定 D3-R0、可单独研究的 D3-R1 候选能力下，完整 G08 业务责任能否无损落到 D1/D3/D2/Pi。** “能写入语义 Check”与“条件、对象及可信事实已经真正可执行”分栏，不将未全部硬编码本身记作 GAP。

## 0. 结论供统一集成负责人直接读取

| 对象 | D1/D3语义制作 | D2/Pi受限技术预审 | 满足原文全部责任的真实多目标/多条件运行 | 立即制作 |
|---|---|---|---|---|
| G08-T02 校园失物领回权属核验 | **SUPPORTED**：51/51规则均有语义技术承载位（并非功能通过） | **SUPPORTED（仅无条件、整案、人工待核的子集）** | **GAP**：缺多件claim-unit目标、非学籍多条件激活和可信库存/交接阶段事实 | **READY_TO_BUILD：本地语义模块及限界预审候选；完整运行部分待补** |
| G08-T03 公共诉求受理与再次办理程序核验 | **SUPPORTED**：52/52规则均有语义技术承载位 | **SUPPORTED（仅无条件、整案、人工待核的子集）** | **GAP**：缺逐ISSUE范围、多动作事件/叠加分支、可信原工单/续办状态 | **READY_TO_BUILD：本地语义模块及限界预审候选；完整运行部分待补** |
| 真实校务系统接入/校规正式生效 | 非模块化制作条件 | 技术候选仍可制作 | 不允许自动认领放货、创建工单、撤回或办结 | **BLOCKED_SOURCE/AUTHORITY，非自动归因 D3 GAP** |

**裁决**：现有 D3 **足够立即启动 G08 两套完整原文的模块设计、来源绑定及作者态制作**；**尚不足在 D2 现有受支持契约内将两套多目标、多条件业务全量声明为忠实可运行**。不需重做 A/B/C/D/E，不需先做全新审核引擎，统一负责人只需对 §6 的最小扩展决定优先级；作者可先写可支持部分，受到影响的 Check 明确 `tooling-blocked`，不得用错误对象 kind 或无条件整案结果假装完整。

## 1. 已读取与固定的证据

### 1.1 完整业务目录与 C 原件

| ID | 可独立定位的原文与实核 SHA-256 | 业务分母 | 阶段及取舍 |
|---|---|---|---|
| G08-T02 | 用户 Library `G08-T02_正式业务模板_MD_v0.1.md`，**`7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418`** | §9 `R-01…R-51` 51；F-01…50；M-01…18；BR-01…12；ST-01…08；EV-01…12；Q-01…51 | C v0.1 / `BUSINESS_MD_DRAFT_WITH_GAPS`；追踪矩阵 SHA256 `16ad6a33398beccbe21a15d24bc075de4991dc7970b253b40281d7534e5b7982` |
| G08-T03 | 用户 Library `G08-T03_正式业务模板_MD_v0.1.md`，**`53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af`** | §10 `T03-R01…T03-R52` 52；F01…64；MS-01…20；BR-01…08；ST-01…13；EV-01…10；RC-01…20 | C v0.1 / `BUSINESS_MD_DRAFT_WITH_GAPS`；追踪矩阵 SHA256 `79f370bd6047654153ea908216fa4357a6af3d0a20d1dd3a71a3e5fe23eceef0` |

A 统一域目录：用户 Library `G08_01_候选事项处置矩阵.md`（SHA256 `ca7ca911d131b02a87b0c7ef840adc98a7b00628396d86db27ed5cca2394ebb9`）、`G08_02_统一模板目录与边界.md`（SHA256 `f70cb0678f9dc8286f45a51c5bdd800bb74d62c97e0fe73d6e86ab7220a257e1`）；独立 E 的 A v0.2.1 复核确认26/26候选已有去向，G08 真正保留 **T02、T03**，旧 T01 非制式用印归入 G01 的 `G01_special_proof_seal_review_template_v1.4.md`。不能仅凭早期 A 目录仍列 T01 而新增 G08 第三套。

业务原始交付实际**分散于 Library/旧 ZIP 与作者分支，并非已统一存进 `main`**。本轮已读取上述两份完整母版及两份原规则矩阵、两份共性模块候选，逐规则ID核对**51+52无缺号、无重复**。Library 原件由文件SHA锁定，**不得把本 D4 审查提交当作原 C 作者冻结时戳**。A/B/C/D/E 的其他历史包定位和身份边界以 E0 公开清单核对，不自行推定 Gold 内容。

### 1.2 A/B/C/D/E 研究与更新边界

- A：统一目录的26个候选去向与跨域边界，见 [G08 E r01 E3](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/d5901f1d6ed03454fe1c00201e20d4a373834b75/docs/design/review-agent/business-templates/G08/acceptance/E-v1.0/E3-domain-coverage.md)。
- B：T02/T03 B v1.1 和原 C 母版规则/材料/来源矩阵已有，今次**不补研究、不以参考校规代替本校有效制度**；原B材料的可靠定位依 C/E0 中原ZIP摘要。
- C：T02 C v0.1 固定内容；T03 有**分开记录**的旧 v0.1 与 2026-10-16 修订候选 v0.1.1-R31-r01，不可混用同一锁。
- D：T02 原32案、T03 原30案，后续新增分别14/28公开INPUT，旧Gold/增量Gold封闭；不读取、不重造、不对模拟材料做答题。
- E：正式 [r01](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/d5901f1d6ed03454fe1c00201e20d4a373834b75/docs/design/review-agent/business-templates/G08/acceptance/E-v1.0/E-final-verdict.md) 和 [r02](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/f44f91c2cea545176d87bcc3ec517be7678ad779/docs/design/review-agent/business-templates/G08/acceptance/E-v1.0-r02/E-r02-final-verdict.md) 仍 `NEEDS_REWORK`（r02：5 P1 OPEN / 2 BLOCKED_SOURCE / 2 BLOCKED_INPUT；0独立关闭）；这是**独立业务证据/Gold验收状态**，不能算现有 D3 工具缺陷，也不能因本报告提升为通过。
- T03-R31 注意：原B/C只认“不满意+继续”与其他源/规则矛盾；[作者新修订](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1df64a1a9b7f994deaa596e0f05cb877770235a4/docs/design/review-agent/business-templates/G08/author-remediation/G08-T03/R31-r01-20261016/source-and-rules-delta.md) 在山东平台首轮范围内更正为“**一般或不满意**且另明确继续”，并加官方首次反馈/权限/原因/时序条件。新 GitHub C 文本 SHA256 **`f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec`**；另有打包修订文本摘要不同，不能偷换版本。 [独立研究 r04](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a4bccee5e4b81ad8d699d1fccc09c42b00579fef/docs/design/review-agent/business-templates/G08/acceptance/E-v1.1/research-r04/r04-decision-and-handoff.md) 只确认静态定向修复，并未运行 D4/Gold，**本校仍无这套山东平台续办授权**。进入正式 D4 构造前，作者/负责人需明确选择一个C候选文本的唯一版与SHA，旧稿原封不动保留；不得在原 v0.1 内偷偷改 R31。

### 1.3 源码与交接固定版本（以实现而非设计图为准）

- [AGENTS.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/AGENTS.md)；[D3-R0 37号交接](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4b191c729f3d5f8135c73b87c17642023f6c3986/docs/design/review-agent/37-d3-r0-frozen-release-and-d4-handoff.md)；[23 D3/D4契约](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4b191c729f3d5f8135c73b87c17642023f6c3986/docs/design/review-agent/23-d3-shared-module-library-and-d4-handoff-contract.md)、[24 D4制作契约](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4b191c729f3d5f8135c73b87c17642023f6c3986/docs/design/review-agent/24-d4-five-template-authoring-and-feedback-loop.md)。
- **D3-R0 固定代码**：`4b191c729f3d5f8135c73b87c17642023f6c3986`；[机器交接manifest](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/4b191c729f3d5f8135c73b87c17642023f6c3986/docs/design/review-agent/fixtures/d3-r0-handoff-manifest.json) 中 B01 `agent-authorization@1`、B02 `evidence-source-boundary@1` 属**synthetic**共享样例，非学校认证政策。
- **D3-R1 实现候选**：`94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`（PR #83，Draft，尚非正式Release），较R0多学籍字段目标、受控**学籍**合成快照、多场景及每字段证据绑定；未新增 G08 目标类，也未改为任意通用后台可信源。见 [R1设计差异](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/docs/design/review-agent/acceptance/d3-r1-g01-runtime/design-delta.md)。
- 实读 [作者态类型](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/packages/shared/src/types/review-authoring-v1.ts)、[D2类型](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/packages/shared/src/types/review-d2.ts)、[D1校验编译](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-authoring-v1.ts)、[D2编译](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-d2-runtime.ts)、[三态执行门禁](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-d2-execution-gates.ts)、[冻结资产与携包](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-d3-module-library.ts)、[档案专属动态实例化](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/src/main/lib/review/review-d3-dynamic-case.ts)、[CLI](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/94d5ec32b6de1ac0c185b63b4aabfddaa29b1649/apps/electron/scripts/review-d2-plan.ts)。
- D1作者态 `workspaceId/revision`、D3冻结 `moduleId/version/digest`、完整模板 `TemplateVersion.version`、D2 `planFingerprint` 与 Pi `Case/Run` 分别保存；不可互代。D1的`reference.documentVersionId+locator`是**作者来源定位**，不是实时材料`SourceRef`。每个实例 `sourceBinding.checkId` 须绑定 `sourceIds`，不能从自然语言猜补。
- D2规则投影实际为 `RuleSpec.execution='semantic'`、`targetScope=subject|case`、`onUnknown=needs-confirmation`；材料由当前案卷注册产生版本，`EvidenceLink`需审核者确认 subject、`supportsFact`及当前有效文档版本；系统对未核校规降为 `unverified-policy`。Pi采用现有`preparePiReviewRunV2/submitPiReviewResultV2/verifyD2PiRun`路径，不是新增审核引擎。
- 有门禁的规则 **不得走 D1 无条件 `compileReviewAuthoringCandidateV1`**（报`D1_UNMAPPABLE_EXECUTION_GATE`），应走 D2 plan，校规未核不通过；`advanced.objectRoleKeys/claimKeys/evidenceRelations`一旦非空仍 `D2_UNMAPPED_ADVANCED`。**语义模块可以解释普通关系，不能宣称高级关系已获结构化强制执行。**
- `D2TargetKind`只有`campus-card/archive-item/archive-operation/student-field`；G08非档案非学生类型无正式 `Target`；有情景时非学生业务在`compileD2RuntimePlan` 仅能`scenario`+单`campus-card`+单target，`scenarios[]`多轴仅能用纯`student-field`目标；源码有`D2_SCENARIO_SCOPE_REQUIRED`。**不能用 archive-item/student-field 改名字冒充失物/诉求的合法作用域**。
- `trusted-registry-field`仅从`student-field`的`controlled-synthetic`学籍快照读取。其他受控审批/库存/工单并没有通用值域；confirmed observation与EvidenceLink来自带当前 SourceRef 的审核员确认，仍不得冒充已签发学校后台事实。`case-stage`枚举是通用`CaseStage`，不是T02 ST-01…08或T03 ST-01…13的完整业务状态机。
- `instantiateD3ArchiveCaseV1`是**档案件×查阅/复制等操作专用**；其按操作动态实例化不能直接用于失物Claim或接诉ISSUE。共享 B01/B02 仅可复用确有共同的“核授权范围/证据范围”**局部语义**，不继承校园资格、代理合法性、山东平台操作权。

## 2. T02 逐责任模块建议与技术覆盖

母版§1/2定义失主、申请人、受托人、保管方及一案多物；§3/4的ST与BR；§5–8字段、材料槽、证据、FACT；§9规则 `R-01—R-51`；§10 Q码及逐对象聚合；§11–13交接及校本配置。**以 `claim_unit_id = (case,custody_item,requested_component/scope,owner/proxy relationship,action)` 为独立语义对象**；没有对应可信原始保管记录时，只能“查询/人工待核”，不能放货。建议以T02 `MOD-01…MOD-10`的**候选语义**设计局部模块；这些ID来自原 C 的 `G08-T02_编辑器共性模块候选.md`，不代表代码已有同名共享模块。

复用策略：`MOD-01/02/03/04/05/06/07/08`可借鉴既有 D3 语义模块 + 合成 B01/B02 的目的、适用、局限、来源字段；**先作为 G08 workspace-local**，验证无跨域规则泄漏后再择机冻结。T02特有 `MOD-09`非公开特征隐私挑战及 `MOD-10`保管/竞争认领/交付锁必须留本地；不能用现有B02自动得出“真实权属”。

| 原规则全集：每ID恰一次 | 原文责任组 | 作者态模块实例建议 | Check/Subject/RuleSpec 去向 | 限制或受阻 |
|---|---|---|---|---|
|  `R-01`、 `R-02`、 `R-09`、 `R-24`、 `R-25`、 `R-31`、 `R-32`、 `R-38`、 `R-39`、 `R-48` | 保管登记、地点、转交与官方台账 | MOD-01/05/07/10 | SEMANTIC + 可信登记状态三态门禁 | GAP-01/03（多件/权威底账）；未接API保持待核 |
|  `R-03`、 `R-07`、 `R-08`、 `R-20`、 `R-44` | 非公开特征、时间矛盾、设备和证据可读性 | MOD-03/05/09 | SEMANTIC + 人工安全核验 | 无权看到私有特征时禁止推定匹配 |
|  `R-04`、 `R-06`、 `R-18`、 `R-19`、 `R-50` | 身份证明不等于所有权、票据/旧照证据 | MOD-03/05 + T02局部权属责任 | SEMANTIC + 事实限定的EvidenceLink | 权属争议由人判断；证据效力依现行来源 |
|  `R-05`、 `R-17` | 本人身份、同名不同人和身份连续 | MOD-04/07 | SEMANTIC + 身份来源/对象作用域 | GAP-03：不能以用户自报当可信身份 |
|  `R-10`、 `R-30` | 多物件/部件拆项及不同结果聚合 | MOD-06 | 每claim_unit独立Check/Subject/输出 | GAP-01/04 |
|  `R-11`、 `R-23`、 `R-40` | 卡务、场馆专规、危险品例外分流 | MOD-01/02 + 本地场馆例外 | SEMANTIC + 条件三态分流 | GAP-02；专规未知则待核，危险情形人工应急 |
|  `R-12`、 `R-13`、 `R-14`、 `R-15`、 `R-37` | 代理许可、委托格式/范围/撤销与未知 | MOD-02/04 + 本地委托范围 | 逐item授权检查 + 来源/事实门禁 | GAP-01/02/03；不能跨物自动继承代理权限 |
|  `R-16`、 `R-26`、 `R-41`、 `R-49` | 多方争议、已领取、公安争议和新反证 | MOD-10 + 本地争议停止 | 不可放货门禁 + 人工升级 | GAP-03；未授权系统不得写交付动作 |
|  `R-21`、 `R-22`、 `R-45`、 `R-46`、 `R-47` | 隐私、照片要求、注入风险与跨校规则拒用 | MOD-07/09 + 本地敏感资料 | SEMANTIC + 权限限制 | 现实访问控制不等于规则Check；保管方人工执行 |
|  `R-27`、 `R-28`、 `R-29`、 `R-42`、 `R-43`、 `R-51` | 签收、员工权限、行政决定和实体交付 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值）；AI不得判已出库 |
|  `R-33`、 `R-34`、 `R-35`、 `R-36` | 法定处置、公告时点、规则效力和校本空缺 | MOD-01/08 + 本地法务界限 | SEMANTIC + 来源待核 | BLOCKED_SOURCE（不是D3代码缺陷） |

作者态映射：上述每条 `R-XX` 应生成至少一条稳定 `task.id/checkId` 及来源绑定（实例重用时`instance path`不同产生不同Check）；并与原B `B-RXX`、母版§9及追踪矩阵中对应`F/M/EV/ST/Q`绑定。原始Q与输出不能只保存一个“通过”。多件模板若硬填单一case结果，**视为漏责任而非模型性能限制**。

### T02 材料和责任边界

- 输入 `F-01…50` 及 `M-01…18` 映射为**责任中使用的事实/来源/材料槽**，不要求强制写死为D1的`TemplateVersion.fields/materialSlots`（D2候选shell恰要求空字段槽）；门禁原型只对需要强判材料到期/替代的Check设置`gate.material`，先区分`applicant/authority`与 `REQ/COND/SYS/POST/N-A/UNKNOWN`，证据替代有当前对象关联。未配置场馆特定强制材料不能被模型当必交。
- 程序门禁：多件分离、保管方当前占有事实、物品已交付/转交、代理范围失效、竞争主张、仅申请人提交信息不能执行放货（GAP-01/02/03）。证据冲突、照片线索、购买与权属区别适合语义 Check + 人工；真实放货、争议裁断、法务处置**必须有权人员**。
- 输出应保留 `claim_unit_id`、对应R/Check/Q、材料缺口、`SourceRef`、每件`待核/补正/待现场/争议/需专门处理`及整案汇总；不能推导“已交付”“已签收”，见 GAP-04。

## 3. T03 逐责任模块建议与技术覆盖

母版§1–2范围与角色、§3八分支、§4–9字段/材料/事实/关系、§10 52条原子规则、§11 RC多问题结论、§12–13状态/权限/异常。单一模板内`CASE→ISSUE→(primary_action,event_history)`；五个主动作首次来信/查询/评价/再办/撤回互斥，**隐私、多事项、急险为可叠加条件**。不能拆成五份不同目的模板，也不能把法定申诉/人事复核塞进普通诉求结果。

复用：`CM-01…CM-10`来自原 C `G08-T03_编辑器共性模块候选.md`，全部是**设计候选而非D3已存在的同名模块**。`CM-01/03/04/05/06/07/08/09`可从通用原子审核/来源/证据/范围/人工边界组织并在源安全条件下复用合成B02；`CM-02`借鉴B01但不可继承其正式授权。`CM-10`的后台查询异常语义可本地定义，系统级查询结果须独立接入。专属模块要保留 `channel-mailbox-policy`、`complaint-case-link`、`rating-continue-split`、`special-route`、`urgency-forward`、`official-reply-state`。

| 原规则全集：每ID恰一次 | 原文责任组 | 作者态模块实例建议 | Check/Subject/RuleSpec 去向 | 限制或受阻 |
|---|---|---|---|---|
|  `T03-R01`、 `T03-R02`、 `T03-R05`、 `T03-R06`、 `T03-R11`、 `T03-R12`、 `T03-R13`、 `T03-R15`、 `T03-R16`、 `T03-R21`、 `T03-R41`、 `T03-R42`、 `T03-R43`、 `T03-R47` | 渠道归属、申请主体、分类/归口、实名、邮件/附件、期限与校外用户 | CM-01/03 + 本地channel-policy | SEMANTIC + 来源版本/条件三态 | GAP-02/03；山东专门规则不可强加本校 |
|  `T03-R03`、 `T03-R04`、 `T03-R17`、 `T03-R18`、 `T03-R19`、 `T03-R20` | 初次建议、时间地点、附件、冲突与注入防护 | CM-04/05 | SEMANTIC + 证据来源/版本定位 | 纯文本邮件需有合法案卷材料载体；缺OCR不判伪造 |
|  `T03-R07`、 `T03-R08`、 `T03-R23`、 `T03-R50`、 `T03-R51` | 学校权限、法定申诉/复核及专门路由 | 本地special-route + CM-01/06 | SEMANTIC + 人工确定主管机关 | 跨域目标ID未定属A交接欠缺，不是D3模块缺陷 |
|  `T03-R09`、 `T03-R10`、 `T03-R14`、 `T03-R24`、 `T03-R44`、 `T03-R48`、 `T03-R49`、 `T03-R52` | 举报保密、急险、身份隔离、公共利益和最终有权动作 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03；不可向无权人展示他人旧案 |
|  `T03-R22`、 `T03-R35` | 同主题多部门/一人多事项分项 | CM-06/07 | 逐issue Check/Subject独立输出 | GAP-01/04 |
|  `T03-R25`、 `T03-R26`、 `T03-R27`、 `T03-R28`、 `T03-R33`、 `T03-R34`、 `T03-R39`、 `T03-R40`、 `T03-R45`、 `T03-R46` | 原单检索、再次提交、重复与新事实、状态/送达/接口不可用 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03；截图≠后台系统事实，超时≠不存在 |
|  `T03-R29`、 `T03-R30`、 `T03-R31`、 `T03-R32`、 `T03-R36`、 `T03-R37`、 `T03-R38` | 评价与继续分离、再次办理、撤回、材料修订与阶段 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03；R31依据新版候选；不得创建真实二次工单 |

原 R30/R31 的来源门禁须严格包含 `SHANDONG_PLATFORM`、首轮、官方反馈事件、当前操作者权限与旧案身份、评分和continue两个独立字段；在CDUT配置为`unknown/unsupported`时不得称已获系统二次办理能力。作者新修订须单独有版本锁，见§1.2。

### T03 材料和责任边界

- `F01…F64`、`MS-01…20`、`EV-01…10`、`ST-01…13`、`RC-01…20`由业务母版保留稳定ID；首次纯文字建议或邮件**不得被强制要求上传照片**，原始邮件文本/获授权记录为原始材料载体即可（正式案卷文档登记还需实机核）。有些材料`SYS/POST`由有权学校后台产生，不能做申请人首次必交。
- 主体到ISSUE、同一信件多个不同权限子事项、敏感被反映人的读写权限、旧案权限/正式回复、接诉继续办理阶段是真正门禁；模型可做语义分类、对矛盾解释和建议归口，不可自动改官方工单。紧急信息优先人工通知，不允许格式未全就压下急险提示。
- `RC-XX`可以针对**每条ISSUE并存多个问题码**，不得只给单案“通过/拒绝”；SourceRef必须指向真实案卷文档版本/可信来源，截图不等于原案后台记录；受阻见GAP-01/03/04。

## 4. 逐条ID到目标类型的机读前覆盖索引

下表**仅表示每个原子责任的意向技术去向，不是实际已生成Check、已编译或通过测试。**所有 103 条均有且仅有一次归属；在任意后续作者工作区需要逐条填写真实`checkId`、`sourceBinding`、`RuleSpec.ruleId`、对象、材料和输出字段，不得把本表视为可直接导入的 JSON 技术模板。

| 原文规则 | 责任模块 | 建议承载 | 运行端约束状态 |
|---|---|---|---|
| R-01 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-02 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-03 | MOD-03/05/09 | 现有语义Check | SUPPORTED（受限） |
| R-04 | MOD-03/05 + T02局部权属责任 | 现有语义Check | SUPPORTED（受限） |
| R-05 | MOD-04/07 | 现有语义Check | GAP-03：不能以用户自报当可信身份 |
| R-06 | MOD-03/05 + T02局部权属责任 | 现有语义Check | SUPPORTED（受限） |
| R-07 | MOD-03/05/09 | 现有语义Check | SUPPORTED（受限） |
| R-08 | MOD-03/05/09 | 现有语义Check | SUPPORTED（受限） |
| R-09 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-10 | MOD-06 | Check/Subject（需增强） | GAP-01/04 |
| R-11 | MOD-01/02 + 本地场馆例外 | 现有语义Check | GAP-02 |
| R-12 | MOD-02/04 + 本地委托范围 | 逐item授权检查 + 来源/事实门禁 | GAP-01/02/03 |
| R-13 | MOD-02/04 + 本地委托范围 | 逐item授权检查 + 来源/事实门禁 | GAP-01/02/03 |
| R-14 | MOD-02/04 + 本地委托范围 | 逐item授权检查 + 来源/事实门禁 | GAP-01/02/03 |
| R-15 | MOD-02/04 + 本地委托范围 | 逐item授权检查 + 来源/事实门禁 | GAP-01/02/03 |
| R-16 | MOD-10 + 本地争议停止 | 不可放货门禁 + 人工升级 | GAP-03 |
| R-17 | MOD-04/07 | 现有语义Check | GAP-03：不能以用户自报当可信身份 |
| R-18 | MOD-03/05 + T02局部权属责任 | 现有语义Check | SUPPORTED（受限） |
| R-19 | MOD-03/05 + T02局部权属责任 | 现有语义Check | SUPPORTED（受限） |
| R-20 | MOD-03/05/09 | 现有语义Check | SUPPORTED（受限） |
| R-21 | MOD-07/09 + 本地敏感资料 | 现有语义Check | SUPPORTED（受限） |
| R-22 | MOD-07/09 + 本地敏感资料 | 现有语义Check | SUPPORTED（受限） |
| R-23 | MOD-01/02 + 本地场馆例外 | 现有语义Check | GAP-02 |
| R-24 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-25 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-26 | MOD-10 + 本地争议停止 | 不可放货门禁 + 人工升级 | GAP-03 |
| R-27 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值） |
| R-28 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值） |
| R-29 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值） |
| R-30 | MOD-06 | Check/Subject（需增强） | GAP-01/04 |
| R-31 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-32 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-33 | MOD-01/08 + 本地法务界限 | 现有语义Check | SUPPORTED（受限） |
| R-34 | MOD-01/08 + 本地法务界限 | 现有语义Check | SUPPORTED（受限） |
| R-35 | MOD-01/08 + 本地法务界限 | 现有语义Check | SUPPORTED（受限） |
| R-36 | MOD-01/08 + 本地法务界限 | 现有语义Check | SUPPORTED（受限） |
| R-37 | MOD-02/04 + 本地委托范围 | 逐item授权检查 + 来源/事实门禁 | GAP-01/02/03 |
| R-38 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-39 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-40 | MOD-01/02 + 本地场馆例外 | 现有语义Check | GAP-02 |
| R-41 | MOD-10 + 本地争议停止 | 不可放货门禁 + 人工升级 | GAP-03 |
| R-42 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值） |
| R-43 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值） |
| R-44 | MOD-03/05/09 | 现有语义Check | SUPPORTED（受限） |
| R-45 | MOD-07/09 + 本地敏感资料 | 现有语义Check | SUPPORTED（受限） |
| R-46 | MOD-07/09 + 本地敏感资料 | 现有语义Check | SUPPORTED（受限） |
| R-47 | MOD-07/09 + 本地敏感资料 | 现有语义Check | SUPPORTED（受限） |
| R-48 | MOD-01/05/07/10 | 现有语义Check | GAP-01/03（多件/权威底账） |
| R-49 | MOD-10 + 本地争议停止 | 不可放货门禁 + 人工升级 | GAP-03 |
| R-50 | MOD-03/05 + T02局部权属责任 | 现有语义Check | SUPPORTED（受限） |
| R-51 | MOD-08/10 | 只审依据、缺口与待处理；人类执行/签字 | GAP-03（官方阶段/签收真值） |
| T03-R01 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R02 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R03 | CM-04/05 | 现有语义Check | SUPPORTED（受限） |
| T03-R04 | CM-04/05 | 现有语义Check | SUPPORTED（受限） |
| T03-R05 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R06 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R07 | 本地special-route + CM-01/06 | 现有语义Check | SUPPORTED（受限） |
| T03-R08 | 本地special-route + CM-01/06 | 现有语义Check | SUPPORTED（受限） |
| T03-R09 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R10 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R11 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R12 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R13 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R14 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R15 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R16 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R17 | CM-04/05 | 现有语义Check | SUPPORTED（受限） |
| T03-R18 | CM-04/05 | 现有语义Check | SUPPORTED（受限） |
| T03-R19 | CM-04/05 | 现有语义Check | SUPPORTED（受限） |
| T03-R20 | CM-04/05 | 现有语义Check | SUPPORTED（受限） |
| T03-R21 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R22 | CM-06/07 | 逐issue Check/Subject独立输出 | GAP-01/04 |
| T03-R23 | 本地special-route + CM-01/06 | 现有语义Check | SUPPORTED（受限） |
| T03-R24 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R25 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R26 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R27 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R28 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R29 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R30 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R31 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R32 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R33 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R34 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R35 | CM-06/07 | 逐issue Check/Subject独立输出 | GAP-01/04 |
| T03-R36 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R37 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R38 | CM-03/05/08 + 本地rating-continue | 条件与阶段门禁 + 版本保留 + 人工正式操作 | GAP-02/03 |
| T03-R39 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R40 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R41 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R42 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R43 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R44 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R45 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R46 | CM-02/05/08/10 + 本地complaint-link | 可信原案事件/权限门禁 + SEMANTIC | GAP-01/03 |
| T03-R47 | CM-01/03 + 本地channel-policy | 现有语义Check | GAP-02/03 |
| T03-R48 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R49 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |
| T03-R50 | 本地special-route + CM-01/06 | 现有语义Check | SUPPORTED（受限） |
| T03-R51 | 本地special-route + CM-01/06 | 现有语义Check | SUPPORTED（受限） |
| T03-R52 | CM-02/08/09 + 本地紧急/保密 | 敏感访问控制/人工应急、语义建议 | GAP-03 |

## 5. Check / Subject / SourceRef / RuleSpec / 输出的具体去向

| 业务身份及信息 | 已实现直接落点（SUPPORTED） | 禁止的失真或仍缺的部分 |
|---|---|---|
| 源MD及制度适用 | `ReviewAuthoringSourceV1.reference.documentVersionId/locator/excerpt`、`source.kind/verification/applicability`；实例`sourceBindings.checkId→sourceIds`；冻结`D3ModuleLock` | 作者定位**不是**校方制度确认；source `policy-candidate`或外校参考只能`unverified-policy`，不能输出合规批准 |
| Check及语义模块 | `ReviewAuthoringResponsibilityV1`的目标、要求、完成条件、限制；模板localTasks/模块任务→D1 preview→D2 rules & mapping；源要求保留在`RuleSpec.requirement` | 任务分解本身不表示业务激活正确；对应具体claim/issue仍需GAP-01 |
| Subject | D2目标`objectKey/subjectId`→`ReviewSubject`，每subject关联Checks和EvidenceLinks；已支持校园卡、档案和学籍 | **没有失物claim-unit或诉求issue的正式target kind/实例化路由；不能冒充现有kind** |
| 材料与SourceRef | 案卷文档注册/版本、`SourceRef`、`EvidenceLink(subjectId,documentVersionId,supportsFact)`审阅确认；固定plan指纹、Run记录 | 非公开实物特征/后台状态/原工单是权威系统事实，用户截图和`caseFields`不能提升为可信正式数据 |
| 条件、材料等价、阶段 | D2 Gate `confirmed-observation / evidence-any / case-stage / trusted-registry-field`及all/any/not三态；`gate.material(provider,dueStages,alternatives)` | 现成的`trusted-registry-field`只读学籍合成注册；现有`CaseStage`≠业务ST；非学籍多分支编译限制，见GAP-02/03 |
| RuleSpec和Pi | `execution:semantic`、`targetScope:subject|case`、`onUnknown:needs-confirmation`；`prepare/submit/verify`强制来源与技术候选性质 | `advanced.evidenceRelations`非空拒止；不要把没有结构性证明的关系写成“程序已验证” |
| 分项结果及行政动作 | 每 Check 可保留状态及引用，后续案卷可据此显示问题；`candidate-held / publicationAllowed:false` | 多item/issue机器可读状态、Q/RC并集的精确输出投影未在D2契约中实现，见GAP-04；任何正式收件/出库/签收/二次派发/公开回复只由授权人和正式系统决定 |

## 6. 唯一需要公共团队评估的技术 GAP（按最小改动）

### GAP-01 / P0：非学籍通用多目标、责任作用域与动态实例化

**源码事实**：`D2TargetKind`枚举没有G08目标；原`instantiateD3ArchiveCaseV1`仅支持档案操作；编译器的检查绑定需精确`objectKey/subjectId`、未用目标拒绝。**影响** T02所有依赖`claim_unit`/一案多物的规则（尤其R-10/14/16/26/30/49/50）；T03多`ISSUE`/原案关联的规则（尤其R22/23/25/26/35/49/50）。**最小补充**：一个显式受控通用 `business-subject` kind 或两个窄目标类型，传入稳定case+item/issue+action ID，制作期按对象实例化固定本地module的实例、SourceBinding、RuleSpec和EvidenceLink；无匹配/重复/跨对象引用fail-closed；不开发Claim大图引擎。非目标聚合的普通case级规则仍保留case Check。**解除标准**：2件失物与2个诉求子事项每个产生独立Check、Subject、Rule/Source、能各自判`awaiting-confirmation`且某件变更不改变另一件证据与判定；实际CLI Pi技术案卷可复核。

### GAP-02 / P0：G08的非学籍多条件轴与对象级生效

**源码事实**：在非`student-field`目标含场景时，D2强制单`campus-card`/单情景；`scenarios[]`多轴实际只放行学籍字段路径。单纯模组`applicabilityNote`没有运行约束作用。**影响** T02 12 BR（身份/代理/场馆/物品/阶段叠加），T03 8 BR（主动作互斥+隐私/多议题/急险叠加），R-12…15、T03-R29…31等。**最小补充**：在GAP-01目标绑定上允许显式选择有界多轴/单主动作以及逐目标三态激活/不适用/未知；未知不作N/A，已确认条件不跨对象污染；保留源来源和plan指纹。不要求建立通用无穷规则DSL。**解除标准**：两个以上非学籍目标的两个并发轴编译成功且正确激活对应责任；冲突主动作、未知条件、丢失授权逐项阻断。

### GAP-03 / P1（阻止安全“自动符合”，不阻止语义候选）：权威事实/事件与人工权限门禁的通用受控映射

**源码事实**：`trusted-registry-field`只是R1受控学籍合成快照；普通`confirmed-observation`是审核者指向案卷当前材料的人工观察，不能凭它认定校方出库、原工单办结、角色撤权等真实有权系统事件；G08业务ST不是D2`CaseStage`。**影响** T02现库存/争议/转交/签收及代理撤销，T03渠道权限、原单存在/隐私访问/正式答复、继续/撤回及期限。**最小补充**：受控的`official-record-fact`（actor/sourceId/objectKey/factKey/value/version/asOf/status/current/revoked）或等价审核员确认+不可伪造的受控合成事件fixture路由，**不得来自申请人caseFields**；事实缺失/超时/无权/撤销都映射`unknown`并待核；人工授权作最终现实执行门禁。只为技术预审支持合成可信模拟即可，真实校方API仍需学校单独授权。**解除标准**：同一案件在合成受控“在库/转库/已领取”和“旧案无权/超时/已答复”状态变化时，原有R/Check执行三态正确改变且不新增官方动作；模糊截图不能冒充权威事实。

### GAP-04 / P1（完整原文输出合同）：多项/多问题/多状态结果的可追溯投影

**源码事实**：D2 `RuleSpec`是语义/逐Check输出；目前未找到对应G08原文`claim_unit_id + Q集合`/`ISSUE + RC集合`的固定机读投影合同。**影响** T02 R-10/30、§10与Q-01…51，T03 R22/23/35、§11与RC01…20，尤其“部分可办、部分争议、部分转人工”。**最小补充**：不改Pi决策引擎，增加基于现有固定plan+Run Check的只读汇总投影：每subject `checkIds/sourceRefIds/problemCodes/adviceState/authorityPending`；整案保留各subject及冲突/未知并集；不能把建议映射成正式接收或授权执行。**解除标准**：同案两分项相反状态，两个问题码和两个来源都完整保留，正式`executed`无真实有权事件时不能出现。

### 条件性高级关系限制（**不是一律P0，也不要求全图硬编码**）

`advanced.objectRoleKeys/claimKeys/evidenceRelations`非空目前会`D2_UNMAPPED_ADVANCED`；T02权属/委托/实物关系与T03父单/事件关系可以先用 **各subject独立的语义Check+明确人工确认**表达，作者态建议按原文保留关系说明、但不要伪造高级块已执行。只有需**机器强制**防跨物代理、越权读取/官方动作的有限关系才落GAP-01/03；若后续确需强制一对多跨对象边，可仅补具体`relationshipFact(subjectA,relation,subjectB,authoritySourceVersion)`验证，不建任意Claim图。此限制本身**不阻塞两套语义模块开始制作**。

### 明确不是公共D3缺口

**学校制度和真实系统来源**：成都理工普通失物领回/代领/贵重门槛、原工单/评价后台权限、校方真实审批岗位；以及T03山东平台规则不能自动转成成都理工的生效政策——都是`BLOCKED_SOURCE/AUTHORITY`，不是“D3没有实现校规”。
**跨域ID治理**：正式学生处分申诉、教职工人事复核、工程归口的目标模板ID待A/管理者定位，属于目录交接，不是D2`TargetKind`。
**E/D Gold ACL与法证**：T02原D1绝对冻结时间、T02私有补丁SHA冲突、双TXX Gold库角色访问隔离是审计/保管问题，不需要为制作G08语义模块先重做Gold。
**模型推断**：OCR质量、图片真实性、法律证据权重与最终事实裁断，不因缺全自动程序化核验就判公共引擎失效。

## 7. 立即制作范围 / 暂停点 / 最小验收

**可立即创建的 D4 作者成果（READY_TO_BUILD）**：两套完整`ReviewAuthoringWorkspaceV1`的本地语义模块草稿；准确记录103个R的每条原文定位/来源/局部语义/完成/限制与全部字段/材料义务的设计映射；共享B01/B02有限复用或明确不适用说明；D1不可变revision与D3冻锁/携包回导；对无目标复杂关系的整案语义项生成`D2Plan`候选并尝试`Pi`受控技术待核回执。**不得报告“103条均已正确运行”**；作者源材料来自有哈希的全文，绝不因剪裁或迁移偷偷改义。

**暂不能宣布完整可运行的部分**：T02一案多物、代理限单物、真实保管事件/分项Q及放货阻断；T03一案多ISSUE、主动作叠加敏感/急险、原单/再次办理事件与分项RC；这些分别带 `GAP-01…04`，没有通用可靠映射前在交付账本中登记 `tooling-blocked` 而不是删掉原R。T03固定候选须先明确旧v0.1和新v0.1.1的来源选择并保持审计版本隔离。

**不做的事**：本轮不创建完整技术模板、不能声称运行了G08真实Pi、不能使用Gold/学校内部账号，不改R0/R1、旧A/B/C/D/E、发布资格或校方行政决定。

**给集成负责人最小工程收口**：先补 `GAP-01 + GAP-02`，即可把两套G08的全部语义责任落到**正确的Subject/条件**运行；接着 `GAP-03`使关键“权威事实/无权未知”在受控合成预审中被门禁；`GAP-04`做只读分项结果投影。补齐后用独立技术例复测T02双物/代领/转交及T03双ISSUE/首次评分-继续/旧案权限，再决定全域 `RUNTIME_READY`，正式E和真实学校审批仍另行授权与验收。

## 8. 本次真实性与未运行声明

- 已实际阅读：Library G08两套**完整母版**、两份原规则追踪矩阵、两份共性模块候选及两份A目录；GitHub AGENTS、D3-R0交接/机器锁、D4契约、R1设计差异以及列出的D1/D2/D3实际源码、历史 E r01/r02/r04与T03作者定向修订。
- 对两套原文及矩阵在当前读取的原始字节上计算SHA256，与C/E公开冻结记录一致；规则归类通过本报告生成脚本计算 51/51 与 52/52 无重复漏号。
- **没有运行 `bun test`、`typecheck`或G08 D1→D3→D2→Pi端到端**；无公共代码改动，本文为源码/输入语义适配审查而非执行性回归。建议统一集成负责人在GAP补齐后执行技术集成及独立试验，不把本文当作已完成D4运行证书。
