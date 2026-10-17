# CDUT Studio D4｜G07 七套业务母版对现有 D3 能力的制作前适配核验

> 核查时间：2026-10-17；性质：**独立只读适配 / D4 preflight**，不是 C 业务规则修订、E 复审、D 独立 Gold、G07 实际编译运行或校方模板授权。本报告创建于独立分支，未改任何原母版/公共引擎。  
> 技术比较：D3-R0 已冻结父提交 `4b191c729f3d5f8135c73b87c17642023f6c3986`；D3-R1 PR #83 实际代码 `94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`（**Draft，不是已签署 release**）；报告分支来自 `main@8989941b6fb5651564e32d11c4215b6a6d5a5209`。业务来源是七个作者独立冻结归档提交，**不是**统一的 main 业务发布版本。  
> 判定口径：`READY_TO_BUILD` 表示可立刻开展业务语义模块制作；`SUPPORTED` 表示已实现对应技术机制；`GAP` 表示为**忠实、可执行**保留特定责任确实缺少源码映射。报告不把所有模型语义责任都升级成硬编码要求。

## 0. 总结（交统一集成负责人）

1. **七套母版全部可定位，目录未缺模板。** A 统一目录 7 项与各 C 原件匹配，作者 C 母版、追踪矩阵和模块建议已经冻结归档；C 状态仍为 `BUSINESS_MD_DRAFT_WITH_GAPS`。不能因 PR 尚为 Draft 或历史 E `BLOCKED_INPUT` 而称其无源。
2. **七套均 `READY_TO_BUILD`（仅制作动作）**：可从固定 MD 原文立即建立 G07 本地语义模块、Check 草稿、版本锁、来源登记、责任 ledger，并运行**无财务动态对象/分支的合成案卷级技术预审**。制作不必等校方校规全部取得，也不必先开发新金额引擎；遇未核规则只允许待核。
3. **七套的“所有职责均逐对象、逐分支忠实运行”目前均为 `GAP`**。不是七份业务模块本身不足，而是当前 D2 `D2TargetKind` 没有财务业务对象，D2 场景绑定对非学籍只开放**单校园卡**，无法把 G07 的多人/多行/多包/多借款多操作可靠编译为独立 Subject/Check。直接做无对象的全案 Check 会遗失原文逐行独立状态；伪装成 student-field 或 archive-operation 违背对象定义，禁止。
4. **需要最小公共补充 2 项**：GAP-01 非学籍业务对象动态实例化和 Check/Subject/来源/证据绑定；GAP-02 非校园卡模板的多轴情景选择及 unknown 门禁。GAP-03 是上述两项对业务阶段/替代材料的有限适配边界，建议作为同一兼容补丁的验收条件。不要为此建“全校财务引擎”。
5. **真实财务/OA/税票/会计接口、校规现行效力、最终审批、在线模型准确率、受控 Gold ACL**各有业务/权限/测试归属，**不是** D3 通用能力缺口；实际取不到有权值就 `EXTERNAL_UNAVAILABLE / POLICY_UNRESOLVED / HUMAN_REVIEW`，不伪装为符合或拒件。

## 1. 完整目录、母版版本及历史交付

A 统一目录原文入口：`G07/C/G07-T01/upstream/A-v0.2/G07_02_统一模板目录与边界.md`（见下表 T01 源提交）；A 的 7 项按**独立审核目的**划分，原 G07-03 拆为 T03 事前采购、T04 履约结算，另外新增 T06 主办会议和 T07 借款。B 为各子域背景、情景、字段/材料、来源与 v0.2 校本补查；C 为母版 MD + 规则追踪矩阵 + 作者自检 + 编辑器共性模块候选；D 为独立模拟包和私有 Gold（本次不读取 Gold）；E 为独立输入/来源审计（当前未 PASS）。

| ID | 唯一审核目的 | 原子 R | 主要条件轴 | 母版字段与材料规模 | C 作者归档 |
|---|---|---:|---|---|---|
| G07-T01 | 活动、竞赛与科研直接费用报销预审 | 32 | BR-01—BR-22 | F 64；M 38 | [PR #35](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/35) `0fff12c5b533` |
| G07-T02 | 因公与学术交流差旅费用核销预审 | 36 | BR-01—BR-14 | F 55；多旅段/人员/资金 | [PR #33](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/33) `1564a20fb99c` |
| G07-T03 | 物资与服务采购事前经费合规预审 | 33 | 16种采购情景与并行条件 | F 42；M 25 | [PR #30](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/30) `e9f4db82176e` |
| G07-T04 | 采购及委托服务履约结算预审 | 36 | 首款/进度/尾款/保证金/内外币等 | F 58；M 45 | [PR #32](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/32) `4f914de38ec9` |
| G07-T05 | 科研劳务、助研及专家酬金发放预审 | 45 | BR-01—BR-15等 | F 58；M 29 | [PR #36](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/36) `780cd209cecd` |
| G07-T06 | 主办会议与培训经费结算预审 | 36 | BR-01—BR-16；SC-01—SC-16 | F 63；B材料槽35+补充可信槽 | [PR #31](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/31) `0fbd811f9f6e` |
| G07-T07 | 项目借款与事后冲账结清预审 | 42 | BR-01—BR-18 | F 60；M 20；TR账务槽 | [PR #34](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/34) `41b88bab6f84` |

**七份不变 C 母版的精确 Git 定位**（下列路径均相对于 `docs/design/review-agent/business-templates/G07/`；`Git blob` 是文档本身的 Git blob SHA-1，不是文件 SHA-256；作者原历史提交不可追认，以各恢复提交作为目前可读固定快照）：

| 模板 | 可读取归档 commit | C MD Git blob | 相对路径 |
|---|---|---|---|
| T01 | `0fff12c5b5330b72566d33d81283da603f687793` | `8a998496a49fff82fbb57bd8894c2f7bf646ec6f` | `C/G07-T01/originals/G07-T01_正式业务模板_MD_v0.1.md` |
| T02 | `1564a20fb99c5ff13fd78ce3162d0ac93005e65c` | `46c48f80df90e99274986633ae29d7d407ed84b9` | `T02/C-v2.1/G07-T02_正式业务模板_MD_v0.1.md` |
| T03 | `e9f4db82176e235b87808787ddf12bd0806fa5ca` | `734f9fdeb16ee25c8b4e5b339b02a2af9baf1aee` | `author-handoff/G07-T03/C-v0.1/G07-T03_正式业务模板_MD_v0.1.md` |
| T04 | `4f914de38ec971d119fbeef20f44d82939aa70de` | `9a629e8c6e6e9bf4c348fe413c32b564e50f580d` | `G07-T04/C-e0-r02/C-v0.1-original/G07-T04_正式业务模板_MD_v0.1.md` |
| T05 | `780cd209cecd6b90cd568997530b47ddde32aa2a` | `6a7ef0cdd10ecaa7e851d6dc43a728a669484106` | `author-handoffs/G07-T05/E0-r02/C_frozen/original_v0.1/G07-T05_正式业务模板_MD_v0.1.md` |
| T06 | `0fbd811f9f6e8170c37b381e1b127ceab8fda348` | `c3be13c801a56300e71e2a468632d263f8fa2de8` | `C/G07-T06/G07-T06_正式业务模板_MD_v0.1.md` |
| T07 | `41b88bab6f84363e1d111f8c464cbe37cffddbcd` | `f6d9c8c2820b165b6010fecddc1dde5a478a9ac2` | `author-deliverables/G07-T07/C-v0.1/G07-T07_正式业务模板_MD_v0.1.md` |

所有母版均已实际打开阅读其目的、责任/字段/材料/分支和原子规则，七份 `编辑器共性模块候选.md` 也已阅读。旧 C 的“模块候选”**只是设计建议，不是 D3 已发布模块**，本报告以下的 `L*` / `T*` 均为**制作建议名**，并非源码中的注册 API。

E 冻结审计：`audit/g07-e-v1-r02@ff8d55026f45b09d3d4955167a6cbc4b4e8e409e`，PR #67，`acceptance/E-v1.0/r02/E-r02-stage-status-and-verdict.md`、`E0-r02-evidence-audit.md`。该 E 曾独立核对 **7/7 C 原件 SHA-256**和其中 T02/T03/T04/T06 的 D INPUT_ONLY 外层 SHA+CRC，**E0 仍 BLOCKED_INPUT，E1/E2/E3 NOT_STARTED，Gold ACL 未核**；当前 C 原作者最早制作 Git commit 往往不可获得，归档不倒填时序。另 E v1.1 研究性 PR #76 的 T02 城市住宿无票合法替代路径为 `C_STATIC_GAP_CANDIDATE`，**归 C 语义/校本来源待证**，绝不报作 D3 通用缺陷。

## 2. 真实 D3 实现能力与边界（按源码，不按设想）

| 功能 | 当前实现证据（R1 固定 SHA） | 本领域判断 |
|---|---|---|
| D1 作者态、责任、场景、模块参数、本地复用 | `packages/shared/src/types/review-authoring-v1.ts`；`review-authoring-v1.ts`；D1 责任由 `purpose/scope/tasks/completion/limits` 描述 | **SUPPORTED**：不要求全部规则写 AST |
| Check → SourceBinding → 候选 TemplateCriterion / RuleSpec | `review-authoring-v1.ts` 编译与 `RULE_TRUTH_MISMATCH`；`review-d2-runtime.ts` 每任务要求源，RuleSpec 映射、语义模式、policy version | **SUPPORTED**：可表达申请材料预审、模型语义判断，来源未核时需 pending |
| 跨工作区冻结模块、digest、版本复用 | `review-d3-module-library.ts` 的 inspect/freeze/reuse、导出/导入、锁/摘要/依赖循环拒止；`review-d3.ts` | **SUPPORTED**：现有 B01 授权、B02 来源证据边界是**synthetic 试验资产**，不能自动认定成 G07 校本规则 |
| D3 作者文件 → D2 技术计划 → Pi 案卷 | `review-d2-runtime.ts` 的 compile/attach/create/verify；`review-d2-plan.ts`；`preparePiReviewRunV2 / submitPiReviewResultV2` | **SUPPORTED**：仅 `mode=technical-pre-review`、`publicationAllowed=false`，现成源码不能证明 G07 全量运行 |
| 有限三态 `gate` 与申请人/权责材料门禁 | `review-d2-execution-gates.ts` 支持 `all/any/not`、`confirmed-observation`、`evidence-any`、`case-stage`、`trusted-registry-field`；`material.provider` 与有限 `dueStages` | **SUPPORTED 有界**：只认真实 Subject 的已确认观察、真实有效文件版本/人工确认 EvidenceLink；未知不变 false；`case-stage` 只有产品案卷状态，非会计生命周期 |
| G07 的费用行、旅段、采购包、受款行、借款号、分配/冲正业务对象 | `review-d2.ts` 的 TargetKind **仅** campus-card / archive-item / archive-operation / student-field；`validateTargets` 严格校验 | **GAP-01**：无合法对象及每个实例独立 Check 扩张。不能滥用已有类型 |
| G07 多路财务条件轴与同时成立的分支 | `compileD2RuntimePlan` 第 146—170 行：**非 student-field** 有场景必须是**唯一 campus-card + 单 scenario**；student-field 的 `scenarios` 最多 13 条同时选中 | **GAP-02**：无法直接完成一般 G07 多条件情景组合；不应把 22 个 BR 错认成 22 套模板 |
| 本域业务 ST（出差前/后、合同预付、银行到款、会计冲正等） | `D2ExecutionGate.material.dueStages` 只认 draft/submitted/reviewing/awaiting-*/decided/archived；`case-stage` 同样是**技术案卷状态** | **GAP-03（条件从属）**：原业务 ST 不能无损当作 `CaseStage`；与 GAP-01 对象实例的确定性事实触发最小绑定一起补 |
| 多方 Claim 关系、付款分摊和财务余额的确定性机器核算 | 非空 `advanced.*` 由 `D2_UNMAPPED_ADVANCED` 拒绝；`evidence-any` 仅测本 Subject 是否有某个精确已确认事实，不判资金流图或 Decimal 账务 | **有限支持**：多事实 AND/OR 可通过多个 `evidence-any` 合成；跨对象分摊、真正支付/结清、数值确定性**不能靠此门禁证明**。模型可建议，人核/账簿确认；自动可付数值另记 GAP-04 |
| 正式权限、来源适用性 | `source.kind/applicability` 与 `mapping.authority` 分离；`unverified-policy` 只可 `awaiting-confirmation` | **SUPPORTED 边界**：来源文本存在 ≠ 校规生效，财务接口/审批由校方授权，不由模板模拟 |

**验证范围**：此检查执行 GitHub 固定提交下的**代码/文档/母版静态阅读和接口对照**；本轮未在 G07 实际生成工作区、编译、运行 Pi 或 Gold。R1 PR #83 既有自证 CI 为 13 个学生专项、104 个旧功能回归，不代表 G07 运行已通过。严格采用 `SUPPORTED / GAP` 区分“已实测通用机制”和“未实测 G07 模板”。

## 3. 建议的本地模块组成与复用边界

**先作为各模板工作区局部模块复制/版本化；合格后才择机独立冻结共享**。下列只是建议语义构成，不是要求开发 10 个新的公共硬编码组件。

| 局部复用候选 | 输入 → 局部责任 → 输出 | 真实 D3 归宿 / 强制边界 |
|---|---|---|
| L00 制度适用与来源版本 | 学校/资金/业务时点/作用域 → 政策候选、冲突、有效期 → `POLICY_UNRESOLVED` | `sourceId`、`applicabilityNote`、语义 Check；不把外校政策变校规 |
| L01 业务分流与条件轴 | 目的、资金、人员、业务事实 → 适用 BR/不适用/未知 | 模块实例 scenario/语义 Check；逐对象可执行映射需 GAP-01/02 |
| L02 分阶段材料形成 | 业务 ST、材料所有者、是否已形成 → 当前缺项/未到期/权责待办 | 语义 Check + 有界 `gate.material`；业务 ST 需 GAP-03 |
| L03 合法等效证据组 | 多文件证据 + 有权效力范围 → 已支持/缺件/冲突 | `evidence-any` 与 `all/any` 可部分复用；不认未经审核员确认的照片 |
| L04 多主体授权 | 经办/负责人/受益/审批/收款/签发及有效期 → 权限未证/利益冲突 | B01 仅**可能**复用“授权范围不自授”局部意义；校本人员资格专属 |
| L05 同事实跨文书校对 | 文件版本、签发者、角色、时间、金额 → 同异与矛盾/引用 | B02 可部分复用来源信任；复杂自动 Claim 图仍 fail closed |
| L06 费用行/交易算术语义 | 逐行净额、退款、分摊、历史占用 → 候选可核额/待权威账簿 | 数字提取/语义差异可交模型；不能以文本算数替代正式财务余额 |
| L07 分项与整案多问题聚合 | Check/Subject/行结果 → 多个问题、下一处理人、局部建议 | `RuleSpec/ReviewRun` 现可逐 Check；逐财务对象及可审计金额结构需 GAP-01/04 |
| L08 修改/补件/撤回及审计 | 文档版本/身份政策快照 → 影响责任/新一轮待核 | D1 revision、D3 locks、D2 plan fingerprint；不重写旧财务事件 |
| L09 人审、隐私、审批支付隔离 | 敏感事实和业务责任 → 风险建议/有权转办 | `limits` + Check + 权责门禁；系统无法产生签章、付款或刑责认定 |

**分模板原创模块与真实同义复用**：

| 模板 | 应创的业务专属局部模块 | 可复用（限局部语义） | 不能通用化的责任 |
|---|---|---|---|
| T01 | T01-ACT、T01-PUB、T01-CONTEST、T01-FUND | L00—L09 选择适用者 | 赛事个人垫付/对公证据、专利/论文阶段、横向包干 vs 纵向预算调剂 |
| T02 | T02-TRIP、T02-SEG、T02-LODGE、T02-COST、T02-GRANT、T02-FX | L00—L09；T01 的**付款追踪机制**不继承 T01 活动资格 | 旅行人档次/分段、公私路线、免费食宿按日扣减、无票合法例外 |
| T03 | T03-PACK、T03-METHOD、T03-DEMAND、T03-EXCEPTION | L00—L05、L07—L09；多明细金额核算借用 L06 | 采购前的采购方式适用、科研急需简化、单一来源人工法定认定 |
| T04 | T04-STAGE、T04-DELIVERY、T04-AMOUNT | L00—L09；与 T03 仅共享授权/原始采购结果引用 | 首款可无需验收、尾款必须有有权验收、已付上限及保证金 |
| T05 | T05-PERSON、T05-WORK、T05-EXPERT、T05-RATE、T05-PAY、T05-A13 | L00—L09；T07 可共享“资金受益人自我批准应互签”的**机制** | A13 双重适用、不同专家费率阶梯、实际工作期、退汇重转不新建劳动 |
| T06 | T06-EVENT、T06-ATTEND、T06-LIMIT、T06-BILL | L00—L09；T02 的“包食宿核事实”只能借机制不借补助标准 | 会议/培训分开、人天定额、线上签到、科研校外酒店条件 |
| T07 | T07-BORROW、T07-LEDGER、T07-ALLOC | L00—L09；与 T01/02/04 的合法**费用结果只作输入** | 借款真正放款才建债、逐抵借额、不因为申请被删而消债、银行入账及会计结清 |

## 4. 原文责任 → 技术模块全域覆盖索引

**原子规则分母：260 = 32 + 36 + 33 + 36 + 45 + 36 + 42。** 本报告在下列范围表和同行 CSV 中 **索引 260/260 原文 R-ID**；含义仅是“已给出制作去向和能力判定”，不是已经构建 260 Check、更不是业务语义已通过。完整单条清单见同目录 `G07-D4-rule-coverage-index.csv`，每行含 `template_id/rule_id/source_anchor/recommended_modules/design_mapping_state/runtime_limitation/authority_boundary/source_commit_and_path`。

### G07-T01：活动、竞赛与科研直接费用报销预审（32/32 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-02 | L01+L00 | 路由、政策年份/来源 |
| R-03—R-06 | T01-ACT+L03 | 学生活动事实、餐食、办公品明细 |
| R-07—R-09 | T01-PUB | 论文与专利费阶段及付款用途 |
| R-10—R-14 | T01-CONTEST+L03 | 赛项对公/垫付、阶段与奖品证据 |
| R-15—R-19 | L05+L06+L03 | 付款票据、遗失替代、退款净额 |
| R-20—R-23 | L04+L00+T01-FUND | 预算/主体授权、审批付款分离、采购分流 |
| R-24—R-27 | L07+L02+L06 | 逐行部分意见、证据冲突、阶段材料与项目分摊 |
| R-28—R-32 | L04+T01-FUND+L09 | 校内签批、纵横向资金调剂、风险与归口 |

**原文非 R 义务不得遗漏**：`§11` 原子规则之外的适用/相邻业务边界、BR-01—BR-22、F 64；M 38、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

### G07-T02：因公与学术交流差旅费用核销预审（36/36 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-08 | T02-TRIP+L00+L04 | 旅后边界、政策、角色、批准、预算与阶段 |
| R-09—R-18 | T02-SEG+T02-LODGE+L03 | 旅段、交通、退改、住宿及无票合法路径 |
| R-19—R-25 | T02-COST+L06 | 会费、分摊、按人按日津补贴及包食宿扣减 |
| R-26—R-32 | T02-GRANT+T02-FX+L05 | 专项资助、跨境汇率、税票/重复历史权威核验 |
| R-33—R-36 | L02+L07+L08+L09 | 冲突升级、阶段材料、分项建议和隐私 |

**原文非 R 义务不得遗漏**：`§8` 原子规则之外的适用/相邻业务边界、BR-01—BR-14、F 55；多旅段/人员/资金、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

### G07-T03：物资与服务采购事前经费合规预审（33/33 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-07 | T03-PACK+L04+L06 | 采购前范围、工程分流、授权、预算、总价与包 |
| R-08—R-12 | T03-METHOD+L00+L03 | 政府/校本方式、市场调查触发及等效 |
| R-13—R-19 | T03-DEMAND+L05 | 需求、排他性、服务指标、公告、论证 |
| R-20—R-27 | T03-EXCEPTION+L04+L05 | 进口、单一来源、科研急需、安全、存量、廉洁风险 |
| R-28—R-33 | T03-PACK+L02+L07+L08+L09 | 时间戳、修改撤回、分包审查、可信接口、人工决策 |

**原文非 R 义务不得遗漏**：`§9` 原子规则之外的适用/相邻业务边界、16种采购情景与并行条件、F 42；M 25、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

### G07-T04：采购及委托服务履约结算预审（36/36 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-05 | T04-STAGE+L04 | 合同付款节点、合法预付与有权验收 |
| R-06—R-13 | T04-DELIVERY+L05+L03 | 交货、库存、资产、服务、内部结算、跨境 |
| R-14—R-19 | T04-AMOUNT+L06 | 合同价、累计付款、发票、合同触发条件 |
| R-20—R-28 | T04-STAGE+T04-AMOUNT+L00 | 政采、供应商、保证金、退款、预算及预付款例外 |
| R-29—R-36 | L07+L08+L09+T04-DELIVERY | 审批/支付状态隔离、冲突、校规版本、逐批意见、转办和隐私 |

**原文非 R 义务不得遗漏**：`§9` 原子规则之外的适用/相邻业务边界、首款/进度/尾款/保证金/内外币等、F 58；M 45、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

### G07-T05：科研劳务、助研及专家酬金发放预审（45/45 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-08 | T05-PERSON+T05-WORK+L04 | 资金、人员类别、协议、身份、工作事实 |
| R-09—R-15 | T05-EXPERT+L04+L03 | 专家独立性/资格、个人劳务与专项身份 |
| R-16—R-20 | T05-RATE+L06 | 工时/人数额度、预算、批次合计和重复发放 |
| R-21—R-30 | T05-EXPERT+L04+T05-PAY | 利益冲突、互签、银行账户、税额与退汇重转 |
| R-31—R-37 | L07+L08+L09+T05-A13 | 逐人部分意见、敏感字段、A12/A13适用与事前批准 |
| R-38—R-45 | T05-A13+T05-EXPERT+L09 | 专属费率阶梯与去重、A14受控渠道、绩效转办 |

**原文非 R 义务不得遗漏**：`§09` 原子规则之外的适用/相邻业务边界、BR-01—BR-15等、F 58；M 29、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

### G07-T06：主办会议与培训经费结算预审（36/36 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-08 | T06-EVENT+L00+L04 | 主办业务、权限、预算、资助、变更 |
| R-09—R-17 | T06-ATTEND+L03+L05 | 实际出席人日、线上线下/酒店/餐饮核对 |
| R-18—R-25 | T06-LIMIT+T06-EVENT+L06 | 按会议/培训类别的人日定额、师资、国际与允许费用 |
| R-26—R-36 | T06-BILL+L06+L07+L08+L09 | 专属票据合同、分摊、收款、退款、部分结果与冲突 |

**原文非 R 义务不得遗漏**：`§9` 原子规则之外的适用/相邻业务边界、BR-01—BR-16；SC-01—SC-16、F 63；B材料槽35+补充可信槽、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

### G07-T07：项目借款与事后冲账结清预审（42/42 个 R-ID 索引）

| 原文 R ID | 规划技术模块 | 责任及门禁重点 |
|---|---|---|
| R-01—R-08 | T07-BORROW+L00+L04 | 借款边界、借款人/代办、预算、借前阶段 |
| R-09—R-16 | T07-BORROW+L03+L04 | 各用途前置凭据、有权借款申请和支付对象 |
| R-17—R-22 | T07-LEDGER+L05 | 真实拨款建债、用途变更、票据抵借与权威查重 |
| R-23—R-31 | T07-ALLOC+T07-LEDGER+L06 | 多借款/多费用行配额、余款、还款与到账结清 |
| R-32—R-42 | T07-LEDGER+L08+L09+L04 | 清账期限/延期、历史问题、会计冲正、敏感与版本 |

**原文非 R 义务不得遗漏**：`§9` 原子规则之外的适用/相邻业务边界、BR-01—BR-18、F 60；M 20；TR账务槽、EV/可信槽、审批与执行阶段、合法替代、问题聚合/输出、撤回/版本/隐私逐项保留。制作阶段按 `32-md-to-modular-template-agent-quality-protocol.md` 重新逐条标锚并测试；当前索引不是已编译 Check。

**跨母版必须与 R-ID 一起建账的源责任**：独立目的与排除/分流、每个 BR 的触发与交叠优先、完整 F/M/EV/可信记录字段与材料形成期、申请人/权责机关/财务/银行真实来源等级、各模板结果问题码与逐对象输出、版本变更/撤回/隐私/正式审批禁止项。原 C 中“字段/槽位存在”不等于“每一字段就是独立 Check”；按审核义务建 Check，复杂多来源可在一个 Check 内叙述，但**需要不同可观察结论的对象不得只留下一个整案 Check**。C 配套矩阵是复查依据，CSV 中 R 锚尚需 D4 作者在全文精确换成行号/表格行与原文片段。

### Check / Subject / SourceRef / RuleSpec / 输出 的实际技术去向

| 原文对象或责任 | 已有技术去向 | 禁止的偷换 / 不足 |
|---|---|---|
| 每个 `R-xx` 审核义务、合并或拆分后的独立核验事项 | `ReviewAuthoringModuleV1.tasks[id,requirement,completion,limits]` → 实例 `checkId` → `sourceBindings[]` → `RuleSpec.id` 和 manifest mapping | 不把同一金额行/不同受益人写成一个无 subject 的“整案符合”；须 GAP-01 |
| F / M / EV、提交人与有权来源 | MD 原锚 + `ReviewAuthoringSourceV1.reference{documentVersionId,locator}` + `sourceId`；运行的 `sourceRefIds`、`EvidenceLink`、`ReviewRunV2.inputManifest` | source registration 不是校方证据真实性；审核实例需真实 Subject/file version；非授权截图不是批准 |
| 单一或并行 BR、业务对象 | D1 `scenarios` 和 module use `scenario/objectKey`，D2 `D2ScenarioSelection`、`targets/subjects` 和 preview → plan | 目前一般 G07 无合法多场景多对象映射，GAP-01/02 |
| 条件 unknown、应何时提交材料 | D1 sourceBinding `gate` + D2 三态表达、`material.provider/dueStages/alternatives` → `validateD2GuardSubmission` | 未到财务 ST 不是产品案卷 `case-stage`；有权单位未来签批不能作为申请人当前缺件，GAP-03 |
| 模型负责的真实性相关性、用途、金额疑点、材料一致性判断 | `RuleSpec.execution=semantic` + 固定 requirement/完成标准/风险禁止 + Pi Check evidence 与 review trace | 可用，不强制每条写成数值 AST；无法验证法规/金额的地方保留 unknown、人审 |
| 主案卷/分人/分包/分行可核候选数额和多问题输出 | D2 Check/映射、ReviewRun 状态和解释；真实结构化金额/核销关系需专属对象结果 | 不得把文本“金额建议”认作机器已证明的净额，更不能从候选 `compliant` 推出实际付款 |
| 审批/付款/借款会计结清 | 模板只生成 `awaiting-confirmation` / 人审事项，读取权限内 OA/账簿权威记录 | 缺学校接口属外部依赖；机器绝不签批、放款、清账或改账 |

## 5. 真正的公共 GAP（最小复现与解除门槛）

| GAP | 涉及 | 被影响的原文必要责任与复现 | 最小技术补充，不重做审核引擎 |
|---|---|---|---|
| **G07-GAP-01｜非学籍动态业务对象、独立 Subject/Check 实例** | **T01–T07 全部**。T01 expense_line/allocation；T02 traveler/trip_segment/expense_line；T03 package；T04 settlement_action/delivery_line；T05 recipient×task×period；T06 attendance/fee_line；T07 borrow_id/offset_allocation | `D2TargetKind` 无这些 kind；`validateTargets` 报 `D2_TARGET_INVALID`，传未注册 `objectKey` 则 `D2_SCOPE_MISSING`；硬用 `student-field` 要 studentScope，硬用档案会破坏业务。原文要求各行有独立待核/补件/不同结果。 | 给公共 D2 最小的**有界通用业务审核对象**（如 `business-item` 的稳定 `objectKey/subjectId/kind/parentKey`，明确模板允许类别），支持同一模块实例按已登记 targets 扩张为独立 Check，保持每实例 sourceBinding、`gate`、`EvidenceLink`、来源及版本指纹；孤立 target、重复 key、无来源 Check、伪造类型必须 fail closed；旧 R0/R1 场景不漂移 |
| **G07-GAP-02｜一般业务模板多条件/多场景可执行展开** | **T01–T07**。T01 22 BR；T02 14 BR；T03 多包/多方式；T04 多付款阶段；T05 15 BR；T06 16 BR；T07 18 BR | 当前 D2 `selection.scenarios` 是学籍例外，非学生模板若出现多个 scenarios 一律 `D2_SCENARIO_SCOPE_REQUIRED`；若强行不使用 scenario 编译全部分支，则会把未触发的材料风险混进运行责任。 | 对通用 business-item/案卷支持**显式且有界的多场景选择/绑定**，每个条件来源及 true/false/unknown 有可观察结果；同时成立者叠加，不适用不生成“应交”判定；未知保留待核；原 D1 模块 scenario、来源和 D2 Rule/Check mapping 精确一致；无需内置 G07 22 业务谓词 |
| **G07-GAP-03｜业务阶段事实 → 条件材料门禁的受控映射** | **T01–T07**（尤 T04 首款/尾款、T05 付款后退汇、T07 到款/冲销） | 当前 `dueStages` 只含技术案卷 9 状态，业务 ST 不能直接填入而不报 `D2_GATE_BAD_DUE_STAGES`；若填成 `reviewing` 就会错误要求真正只在交易后才存在的文件。无 subject 的 `confirmed-observation` 也会恒为 unknown。 | 不增加正式行政工作流：在 GAP-01 对象上允许从**审核员确认的、版本绑定的业务阶段事实**构造条件、证据需求（并清楚标 `applicant/authority`），三态执行和阶段未来材料区分沿用现有 gate；禁 applicant caseFields/模型猜测升级为权威已批准；旧 `CaseStage` 含义不变 |
| **G07-GAP-04｜自动确定可付净额/会计结清的高级量化结果（可选择不实现、不得假通过）** | 高要求：T01 R18/24/27，T02 R13/20/22/25，T03 R06/30，T04 R15/23/24/33，T05 R16–20/38–40，T06 R18–20/32/33/35，T07 R17/23–30/37 | D2 gate 无 Decimal、多笔费用与主账一对多关系和独立权威账簿状态证明，`advanced.*` 明确 `D2_UNMAPPED_ADVANCED`。**不影响编写完整语义预审模块**，但若技术完成声明包括“可机器证明准确结清、可付上限”，现有机制不足。 | 本轮**不要求建设通用财务引擎**。制作时把上述金额值定位为**模型建议/待财务确认**，输出明确 `amount_unverified`、各行问题、外部查询所需事实与人工最终职责，即可先做技术预审；只有统一集成方明确要求自动确定金额/结清，才按小范围增加只读确定性计算器、Decimal、主账事件版本/幂等与授权接口、逐对象结果字段及正反例。不得以 prompt 生成的数值当授权支付结果 |

**最短解除顺序**：先给 G07-GAP-01/02 的有界对象/情景扩展 → 让 GAP-03 可在该 Subject 上以已有门禁表达材料形成与 unknown → 使用任一 T03“同案两个采购包”、T05“同批两人不同权限”、T07“同借款两笔抵借且会计未入账”合成**正/负/未知/撤回**验证真实 D1→D3→D2→Pi Check、SourceRef、版本锁及迁移；再继续七套完整模板制作及统合验收。不得通过删除原文例外、改写学校规定、伪造外部账簿或把未核项无条件通过来消除 GAP。**GAP-04 仅自动定额/清账产品能力的条件阻断，不应让它挡住全部语义模板制作。**

## 6. 谁交程序门禁、谁交模型、谁必须人工/权威系统

| 责任 | 推荐归属 | 未取得足够信息时 |
|---|---|---|
| 稳定对象 ID、触发分支选择、明确阶段的“尚未形成”、材料来源、版本、重复对象引用、已确认事实相等/冲突、跨对象不许默许同一票重复全额 | **程序化有界门禁**（已实现的用于可映射单对象；G07 对象需 GAP-01/02/03） | `awaiting-confirmation`、不适用需真正 false，不可推断或删除任务 |
| 活动/科研用途相关、合同实际履约表述、证明文义是否一致、异常收费和明显矛盾、附件合理性与风险线索 | **模型语义审核**，按原文 Check 和来源解释、返回可复查证据，不等于刑责或行政违法裁定 | `HUMAN_REVIEW / FACT_CONFLICT`，报告观察到的事实，不决定付款 |
| 校规版本与有效范围、OA授权、正式验收、税票状态、项目预算和历史占用、银行到账/财务结清 | **校方有权只读系统/人员**提供认证事实；D3 管来源而非创造事实 | `POLICY_UNRESOLVED / EXTERNAL_UNAVAILABLE` |
| 单一来源或科研急需的正式采购选择、付款批准、科研外事资格、人员薪酬审批、税务处理、会计冲正、预算调剂、保密文档准入 | **人/有权机关最终决定**；模型可列补办项，程序不得越权 | `AUTHORITY_PENDING / REQUIRES_AUTHORIZED_REVIEW` |
| 隐藏 D Gold、独立 E 源事实及 ACL、线上模型准确率 | **D/E/独立集成与存储负责人** | 与 D4 制作状态分账，不当技术 GAP 修补 |

## 7. 每套结论与开工范围

| 模板 | MD 固定可读 | 作者态语义模块/来源/冻结 | 多业务对象+条件完整运行 | **可立即做** | **当前不得宣布已做成** |
|---|---|---|---|---|---|
| G07-T01 | YES | **SUPPORTED** | **GAP-01/02/03**；自动净额另看 04 | **READY_TO_BUILD**：全部 32 R 草稿与 22 BR/EV/费用行明细索引 | 全费用行自动可核金额与部分核销正确 |
| G07-T02 | YES | **SUPPORTED** | **GAP-01/02/03**；金额看 04 | **READY_TO_BUILD**：36 R、多旅段/人员模块与合法替代 | 旅程按日计算准确、城市无票例外已 E 确认 |
| G07-T03 | YES | **SUPPORTED** | **GAP-01/02/03**；金额看 04 | **READY_TO_BUILD**：33 R、逐包采购前审查语义及权责边界 | 同案多包逐包编译并独立通过/待审，学校采购方式最终认定 |
| G07-T04 | YES | **SUPPORTED** | **GAP-01/02/03**；金额看 04 | **READY_TO_BUILD**：36 R、首款/进度/尾款分支及材料合同 | 逐节点已付余额/正式验收和真实付款已发生 |
| G07-T05 | YES | **SUPPORTED** | **GAP-01/02/03**；A13定额看 04 | **READY_TO_BUILD**：45 R、助研/专家/专项局部模块 | 多人/多期正确拆行、税后阶梯支付已由系统证明 |
| G07-T06 | YES | **SUPPORTED** | **GAP-01/02/03**；定额看 04 | **READY_TO_BUILD**：36 R、线上线下/人日/会议培训语义 | 有效参会人数、定额、重复分摊经系统逐行确认 |
| G07-T07 | YES | **SUPPORTED** | **GAP-01/02/03**；正式清账看 04 | **READY_TO_BUILD**：42 R、借前及借后操作语义与历史清理边界 | 一笔借款多笔抵借/冲正及真实会计结清可机器确定 |

**技术适配最终裁定**：

- `G07_AUTHORING=SUPPORTED`，`G07_ALL_SEVEN_READY_TO_BUILD=YES`，仅指**立即开始业务模块制作，不要求先再开展 A/B/C/D/E**。
- `G07_FULL_DYNAMIC_EXECUTION=GAP`，由 `G07-GAP-01/02/03` 导致；完成上述最小通用映射后即可继续完成七套的**逐对象技术运行**，不需要把 260 条规则逐一硬编码。
- `G07_AUTO_FINANCIAL_DETERMINATION=GAP/OUT_OF_D4_REQUIRED_SCOPE`：若只做预审意见，则人审/待核闭环可保留；若要求机器给可付款/已结清的确定结果，必须另行明确财务接口、专用确定性算子和授权。
- `G07_OFFICIAL_PUBLISH=NOT_AUTHORIZED`、`G07_D4_RUNTIME=NOT_RUN`、`G07_E_DESIGN_PASS=NOT_SIGNED`、`G07_GOLD=NOT_READ`。不能把此报告签成 release 或 D4 完成。

## 8. 检查源、重现入口及本轮未做事项

**固定源码**：`packages/shared/src/types/review-authoring-v1.ts`、`review-d2.ts`、`review-d3.ts`；`apps/electron/src/main/lib/review/review-authoring-v1.ts`、`review-d2-runtime.ts`、`review-d2-execution-gates.ts`、`review-d3-module-library.ts`、`review-d3-dynamic-case.ts`。**文档**：`AGENTS.md`，`docs/design/review-agent/{23-d3-shared-module-library-and-d4-handoff-contract.md,24-d4-five-template-authoring-and-feedback-loop.md,32-md-to-modular-template-agent-quality-protocol.md,35-d3-md-dynamic-authoring-and-execution-implementation.md,37-d3-r0-frozen-release-and-d4-handoff.md}` 与 `acceptance/d3-r1-g01-runtime/` 已知缺口和 CI 账本。来源位置以上表不可变 commit+路径为准。

官方预期 CLI 仍用现有 `review-authoring-v1.ts validate/save/diff` → `review-d3-library.ts export/import/inspect/report-gap` → `review-d2-plan.ts preview/register/create/attach` → `Pi` 现有服务，**不是**本报告已运行命令。本次未创建模板 JSON、未连校内财务或真实档案、未重制 Gold、未跑 D/E 测试/全量 CI、未更改 AGENTS/README、母版或共享引擎；后续运行须独立 `PROFER_CONFIG_DIR` 及合成数据并逐个比对真实日志。

**注意**：CSV 的 260/260 仅是逐原子 R 的 *design coverage index*，对原文其它独立义务的完整性必须在 D4 作者制作 ledger 时重新过 `32` 号全文契约，且独立验收不得因此宣称语义覆盖通过。
