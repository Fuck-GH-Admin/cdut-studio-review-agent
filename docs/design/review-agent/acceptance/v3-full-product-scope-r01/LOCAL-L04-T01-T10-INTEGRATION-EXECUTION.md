
# CDUT Studio Review V3｜Local-L04 五份续作合并与 A15 真实验收 R02

> 2026-10-21 续作指令，**优先于下方 R01**。**原十条 T01–T10 已合入 main，R01 B1/B2/B3 是历史记录，绝对不要重合旧十线**。本轮仅收五个新 PR #174/#175/#176/#177/#179，并可接入 A15 测试素材 PR #178。读取本文后直接开展工程工作，不再进行全仓历史调查。

## R02-A. 来源、实际能力与接收门槛

核验时 main=2a5a614fc8ac6cb5d324a9c15997bf28e1b87f34；开工重新 git fetch 及记录真实 origin/main，绝对不要回退它。所有五线源分支从较旧的 main@9840a64f25a 派生，比目前 main 约落后 3 个提交：三方合并保留当前 T09 可信 Main 桥接、A09 修正和现有业务/数据记录；禁止来源文件整目录覆盖。

| 本轮 PR | 来源分支 | 核验固定 SHA | 真实内容 | 最新 CI 核验 |
| --- | --- | --- | --- | --- |
| **T01 #176** | feat/v3-full-t01-closure-r01 | 362713730d41c614022eadaa2c8b79911a134669 | 明确需求→可编辑模板草稿，受控模型起草领域端口，六个文件样例包与 UI | PR CI SUCCESS |
| **T02 #174** | feat/v3-full-t02-visual-material-r02 | b346c1dade91e27ece427b292dcdebee4e0d6935 | PPTX 原始媒体关系与页来源、图像/扫描 PDF 视觉 OCR、B2 staged OCR 和 UI | PR CI / Baseline / D2 Scoped SUCCESS |
| **T06 #177** | feat/v3-full-t06-physical-intake-r02 | 07ed0a25e192029ba73e68274444e1695100ff52 | 真实 folder/ZIP 分组、预览、新建或绑定案卷、逐原件入库和批次回执 | PR CI / Batch / Baseline / D2 Scoped SUCCESS |
| **T08 #175** | feat/v3-full-t08-report-pdf-and-suggestion-r02 | 82d543771d27b5f2285542f89107beccc47e7c85 | 真正可打开的 PDF 图片页文件、助手建议人工审阅与确认保存 UI | PR CI SUCCESS |
| **T05 #179** | feat/v3-t05-stage-supplement-closure-r01 | 0c2a382a2ada11711920b20680bde943513b34c7 | 真 Run 关联的初审→终审领域提案、补件回复/恢复、可信角色面板与 CR-T05-04 | **最新 SHA 的 PR CI / Baseline / D2 Scoped 全部 SUCCESS** |
| **A15 素材 #178** | feat/v3-a15-cloud-fixtures-r01 | a6d3424055d7a4dfaf44c67ca4346f3e30f38ad4 | 真实 DOCX 生成器、四组预期、虚构 LAB-SIM@1 政策、云端/本地分工 | 测试数据，不是功能或 A15 已 PASS |

**T05 特殊约束**：#179 最新核验 HEAD 0c2a382a2ada11711920b20680bde943513b34c7 的 PR CI/Baseline/Scoped 已全部 SUCCESS，**现已可接第五份**。T05 Owner 仍可能继续提交，不允许使用旧成功测试代替新 HEAD；开工以最新 SHA、diff、CI 固定来源。失败或未结束只阻止 T05 自己，其他四项继续工作。PR #178 可随时独立接收，不需要等 T05。

六套 T01 ZIP 包虽然包含可读原件/配置/预期，并不说明六套业务已在 Case/Run 真实操作通过。T01 模型端口有领域 prompt/schema，但尚需本地 L 接可信模型调用。T02 OCR 依赖引擎和 PDF 渲染工具，缺资源只能标 partial。T08 PDF 是真实图片页 PDF，**不是文字可选择/搜索的 PDF**。T08 对现有可信 Main 暂仅允许保存 text 字段；数字/日期等不可取消禁用伪称完成。

## R02-B. 实际合并顺序、停点和接口接线

**准备**：git fetch origin，核对所有源 SHA 和 CI，检查 git worktree list、git status；使用独立 integration worktree 并记录 rollback SHA。若本地已有进展，从现有工作树安全继续，不 reset/clean/force-push。每条独立合并提交与 bridge 提交，成功后记录进入 main 的 SHA；不整批 squash。三方冲突以保留两边真实功能为准，不允许统一取 ours/theirs。

**批次 1（四份绿灯）**：推荐 T02 #174 → T01 #176 → T06 #177 → T08 #175，可按当前依赖微调。

1. T02：保留新旧 document-service 实现，接原有 B2 Main-owned ctx 和来源/DocumentVersion 写入。使用 parseT02VisualMaterialWithOcr、previewT02StagedVisualOcr；Main 提供受信原件地址、OCR 端口、B2 scope，不允许 Renderer 传物理绝对路径。展示 partial/待确认及页级来源。无 pdftoppm/Tesseract 不能声称真实扫描 OCR 已完整验证。
2. T01：保留已有 TemplateWizardPanel 的发布编辑功能，挂载 ReviewV3T01AuthoringLaunchpad；本地明确要求提取应真实可用。调用真正模型时复用现有 Provider/模型选择与可信 Host，向 draftT01ViaAuthorizedModel 注入授权 invoke，Renderer 不持凭据。不得展示“已调用 AI”但背后只执行本地规则的按钮。
3. T06：保留已通过的 T07/BatchStore，安装 ReviewV3T06PhysicalImport。Main 最小可信调用 pickT06PhysicalSource({sourceKind:'folder'|'zip'}) 和 commitT06PhysicalImport(request)，复用已有 B2 staging 和 Case/DocumentVersion/Batch writer。真实 OS Picker、entry token、来源指纹/幂等、实际字节入库必须由 Main 校验。原件未全部成功的案卷不得记为 batch 成功成员；保留部分失败回执，不删除已建案卷。
4. T08：挂载真实 PDF 和 ReviewV3T08SuggestionReview，确认 Run 与 audience 投影正确，2+ 页中文能用独立阅读器打开。现有 UPDATE_FIELDS_V2 的 Main 未传 TemplateVersion，导致非 text 字段被当文本；修复 Main 读取已发布模板、验证 FieldSpec kind/scope/选项及版本后再通知 T08 Owner 解锁 typed 编辑。不新建第二套写入系统。没有共享修复前，非 text 保存必须保持禁用；旧 Run 不应被就地改写，补件不自动批准。

每条都运行受影响定向测试、workspace typecheck、必要的 Main/Preload/Renderer build。不要因一条分支尚缺最终产品 E2E 拒绝已可用模块合并，也不能用 CI 成功代替桥接。验证新功能真实入口可达，无数据损坏/权限绕过后即可分批合入 main。

**批次 2（T05 最新 CI 已合格）**：接 PR #179，保留现有 V2CasePanel、T03/T08/T10 挂载与旧 T05 工作台；新增 planT05LocalStageAction/planT05SupplementReentry 负责纯领域判断；新增 applyT05LocalStageProposal 生成阶段任务/补件/决定的追加式状态，**由 Main 提供可信 ID/时间并在同一 CaseAggregate 事务原子写入**，不要再造平行阶段状态机。L 负责可信 Main 执行。**必须完整阅读来源文档** docs/design/review-agent/acceptance/v3-t05-stage-closure-r01/T05-HISTORY-SCOPE-AND-CONTRACT-REQUEST.md 的 CR-T05-04。

T05 Main 需要：
- 只读 T05TrustedStageCapability：可信来源的 actorRole reviewer/teacher、开放任务及 current real Run；Renderer 的 role/runId 不授权。
- 写入 recordTrustedStageDecision(T05TrustedStageCommand)：Main 核对 published TemplateVersion、expectedRevision、真实任务与有权角色、当前来源版本、当前 Run、必需规则决定准备度（不能把 completed Run 当全部规则通过），再使用已有统一案卷事务提交领域 Proposal。
- reviewer 初审 stage-pass 只启动 teacher 终审任务；teacher 终审才 final。缺材料可先开补件请求而**不能捏造 Run 或批准**。第一次回复不足不等于 satisfied；第二次补齐并经人工核验后新 DocumentVersion、Run 和阶段恢复。
- **严禁**沿用 stage-workflow.ts 的合成 run@rev ID 作为真实 Run 证据，不能通过修改 Renderer actor 冒充 teacher。D2 技术预审/学校正式审批禁令必须保留。

**所有五份均合入后先跑自身入口**：T01 能用编辑/模型（如已接）起草；T02 实体图像 OCR 有来源和 partial 说明；T06 ZIP/folder 真实成批建案与原件；T08 能输出 PDF 和确认应用 text 字段；T05 能在可信 Main 下按两级业务任务操作。无法完成某条的桥接，要写清具体 IPC/Writer 缺口和 BLOCKED_BRIDGE，不回头写新架构白皮书。

### A15 最高优先的一个仍未解决的合同

最新 main 现有 T04 evaluateT04Plan 接受真正 CanonicalPlan 和每个 binding 的 RuleSpec，而 T01 发布模板的绑定路径尚**不会自动**生成这种可执行计划。#176 主要是自然语言起草和六样例，并未自动解决这一转换。

- **T01/T04 领域 Owner** 必须明确结构化条件（人数≤20、材料必交、两级阶段）的 RuleSpec/PlanBinding 编译含义及来源版本；不能由 L 猜测纯 requirement 文本或在 Main 特判“实验室”。
- **L 独占**将成熟 RuleSpec/PlanBinding 绑定到唯一正式 Case/Run，调用实际规则/材料检查并持久化及展示真实 CheckResult/SourceRef。
- 缺领域规则合同标 BLOCKED_OWNER:T01/T04，并给最小缺字段/函数名；仍推进 T02/T06/T08/T05 的其他独立桥接。**不拿假 CheckResult 代替真实运行**。

## R02-C. 接五份后用 PR #178 的真实 DOCX 分阶段跑 A15

PR #178 中的生成器 work/e2e/a15-fixtures/generate.mjs 可直接以 Node 标准库执行：

~~~bash
node work/e2e/a15-fixtures/generate.mjs
~~~

它会产生五份真实 DOCX + 文本对照 + generated/manifest.json；模拟政策在 work/e2e/a15-fixtures/policy-LAB-SIM-v1.md（非学校正式规定）。**安全检出/合入 PR #178，不要再次花大量时间编造样本，也不能拿纯 TXT 解析替代 DOCX 读取。** 不需要先完成 T02 全格式 OCR、T06 全批次极限、T08 可检索 PDF 才能做 A15 单案验证。

| Gate | 从何时可跑 | Electron 中应看到什么 |
| --- | --- | --- |
| **S0（已局部 PASS）** | 现有 flow-t01-bind | 仅证明发布/绑案、无学年；旧样例 objectType=document、两个字段、单个手审阶段，**不是完整 A15** |
| **S1 真正通用模板** | T01 模板系统可编辑/发布 | 用户非写码配置 organization、组织名/负责人/人数/日期/时段/用途、必交计划书、人数≤20、无学年/分数、reviewer 初审→teacher 终审；发布版本、重新打开及复用 |
| **S2 真实规则** | T01×T04 RuleSpec/PlanBinding 合同 + L Run 桥接准备好 | DOCX 真原件→DocumentVersion/SourceRef→人工确认真实值→真正 CanonicalPlan/RuleSpec→ReviewRun/CheckResult；18 人 compliant、21 人 non-compliant、人数未确认 pending、缺计划书待补件 |
| **S3 人工补件与终审** | T05 与可信 Main 阶段命令已接 | 无计划书先补件；第一份 lab-12-unclear-reply.docx 已回复但不足；第二份 lab-12-corrected-reply.docx 形成新 DocumentVersion，经人核验并关联新 Run；初审仅推进终审、teacher 可信角色才能本地最终决定、旧版本和 Run 保留 |
| **S4 真正用户旅程** | S1–S3 都具备 | 从 Electron UI 配置/选择模板、建案、实际选/拖 DOCX、一次开始检查、原件引用、补件、初终审、报告、冷重启恢复；不能只通过 CDP/IPC 构造假后台状态 |

每个 Gate 固定 PASS/PARTIAL/BLOCKED_OWNER/BLOCKED_BRIDGE/NOT_RUN。**只有 S1–S4 真实通过才是 A15 PRODUCT_ACCEPTED**。对 21 人超限，不得由“Run 已 completed”直接 stage-pass；对未知人数，不能把 null 变 0；对缺计划书，不得按模型乐观建议自动批准。校方真实审批未开放可用具名本地模拟角色，但绝不冒充学校授权。

若 S2 因 T01×T04 领域合同无法运行，**不要求 L 自己写规则编译器**：准确交出 Owner 需求，同时继续其它已能做的桥接；S0/S1 和 T02/T06/T08 独立操作仍可推进。S3 若缺可信 Main 审核角色/Run 绑定属 L 的桥接任务，不能全部推回 T05。

最终 S4 需使用已有 work/e2e/v3-e2e.mjs 扩充真实 user journey，已有 flow-t01-bind 仅保留烟测；现有 flow-a09、flow-t07-judging、phase-prepare/phase-verify 不回归。需要真机才能验证的内容不许凭作者 CI 预填 PASS。

## R02-D. 一个现有总账，不要再开多套收口文档

验收证据仅更新主线现有 docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md；写明 origin/main 和实际 merge/bridge SHA、UI 或可信 Main 消费者、命令和结果、RunId/DocumentVersionId/actor 来源、回滚点。

每批简短回执：

~~~text
Local-L04-R02：origin/main=<sha>
接收：PR #<n> 源 HEAD=<sha> → merge/bridge=<sha> → main=<sha>
模块：MERGED / WIRED / JOURNEY_VERIFIED / BLOCKED_OWNER / BLOCKED_BRIDGE
真机/测试：具体命令及 PASS/FAIL/NOT_RUN
A15：S0 / S1 / S2 / S3 / S4 的证据和真实断点
下一步：可执行的一个接线动作，不重启历史调研
~~~

**执行优先级：四份绿灯→T05 已经通过最新 CI 的 SHA→集中 A15 S1/S2/S3/S4；#178 验收输入并行纳入。** 禁止为假想风险扩展异常框架；保留现实中的来源真值、正式持久化、受控身份和审批边界。


---

# 附录｜Local-L04 原十线集成任务书 R01（历史背景）

**任务编号**：V3-LOCAL-L04-INTEGRATE-T01-T10-R01  
**执行者**：本地 Local-L Agent，唯一集成者；原 T01–T10 仍各自拥有业务实现。  
**任务性质**：正式工程集成 + 必要共享接线 + 真实 Electron 验证 + 分批合入 main。**现在授权开始执行，不是重新做设计审查。**  
**文档发布日期**：2026-10-21。**起点 main（编写时）**：e499d9a497b2ff93e6b97b761509dfa568dd6696。实际开工以重新 fetch 后的 origin/main 为准，记录真实 SHA；该值不是要求回退到旧提交。  
**禁止**：让十线仅“代码存在”就宣称完整产品；或因为十线尚未完成全部 F/A/U 验收，拒绝任何模块进入集成。

## 一、唯一目标与完成定义

把以下 **十条已提交、已有成功 PR CI 的功能线**真正合入当前 Review V3，使用**同一个权威 CaseAggregate、ReviewRun、DocumentVersion、SourceRef、模板与业务事务**，从统一工作台实际可到达、可操作、可持久恢复。

本地 Agent 的工作是：查重、接线、处理交叉文件冲突、必要类型/事务适配、定向测试、OS Electron 联测、按批合并与回滚。**不能借集成自行重写 T Owner 的业务算法、模板编辑器、页面产品设计，也不能因校方授权尚不可用而停下本地功能。**

交付分四层，不允许混称：
- **MERGED**：指定功能提交的实际源码已进入 main（能在 git 历史证明），即使尚无用户入口。
- **WIRED**：共享 Main/IPC/Preload/渲染入口真实连通，使用现有权威数据，不再是不可调用的孤岛模块。
- **JOURNEY_VERIFIED**：用户从 Electron UI 操作至预期最终业务状态，包含必要的原件、运行记录、持久化及报告。
- **KNOWN_GAP**：模块已集成但原 T Owner 尚欠的业务功能（例如扫描 OCR、完整自然语言模板起草、完整 ZIP 分案）；记录真实缺口、归属和继续施工入口，**不得伪称通过，也不得擅自扩写到 L 线**。

**最低交付要求**：十条来源均完成 MERGED；每条新增功能均可说明用户入口或可信 Main 内部消费者。至少 A15 通用申请与本地办理、A09 补件/复审、A12+A14 批次/评委路径进行真实联测；未闭环处给出精确阻断点而非笼统“需要更多架构设计”。若某条线因未完成本线核心功能确实不能合并，须保留已合并的其他成果，按下文 BLOCKED_OWNER 单独退回；不得为了凑数字掩盖缺口。

## 二、固定接收清单（此次已经核查最新 PR CI 为 success）

| 线 / PR | 固定来源分支 | 接收 SHA | 主要成果与集成责任 |
| --- | --- | --- | --- |
| T01 / #166 | feat/v3-full-t01-template-authoring | ac2947fc6de547074f36dfc7cb8c8dd38ce328dd | 作者编辑器、七套模拟业务草稿、条件/试跑/导入导出；桥接已发布模板到唯一 V3 案卷 |
| T02 / #164 | feat/v3-full-t02-material-parsing | 36687a952bc69c5d541ad53e2df2595fb804a581 | 多格式解析精度、B2 实际暂存字节只读预览、材料覆盖面板；桥接可信 Main 来源读取 |
| T03 / #171 | feat/v3-full-t03-facts-evidence | 28528b02b7f8ab74a54044d05ebb104149abc6ef | 事实确认、证据多对多、事项拆并与重审影响；桥接一次性权威案卷事务 |
| T04 / #172 | feat/v3-full-t04-rules-scoring | 54678e8ee6c050ce34f92bf05b32a86b397dd3d5 | 三值规则、确定性计算、冲突裁决、Plan 提案；桥接真实 Plan/Run |
| T05 / #173 | feat/v3-full-t05-human-workflow | 41c3f2fa9eec000d797bde61baff7946d40756b4 | 本地人工处理、补件、决定、申诉面板/领域逻辑；桥接可信人工 Actor 与正式本地事务 |
| T06 / #165 | feat/v3-full-t06-batch-intake | 9ac93052fbbc6ff6883ba64af01c651e493984c7 | 清单分案预览、筛选/重试/重开、批次 CSV；复用现有批次权威状态 |
| T07 / #170 | feat/v3-full-t07-judge-review | 37c6d32121d7c90077debbb4cf7be8ad2ad032de | 独立评委、回避/评分/排名/同分/冻结与匿名视图；桥接可信分配、写入与角色投影 |
| T08 / #167 | feat/v3-full-t08-assistant-reports | d83b4be3287c0244f30dcca036ed9e0cb649f2ae | V3 助手上下文、来源定位、分受众/历史 Run 报告，包含字段显示修复和定向测试 |
| T09 / #169 | feat/v3-full-t09-offline-ports | 474cf5f84254420e16cca163fa483e4d6c58af36 | 离线学生回件、评委包、独立 HTML 编辑器、回执/版本冲突；桥接签发、预览与原子导回 |
| T10 / #168 | feat/v3-full-t10-product-workspace | 3679cc4e3d5ade57bb8deb87d33f2453c77f245c | V3 统一导航/案卷概览/下一步/通用建案；最后负责真实 UI 总装 |

对应 PR：#164–#173，均为 Draft；**各 SHA 的 PR CI 已查到成功**，包括修正后的 T04 与最后新增回归测试的 T08。CI 覆盖工作区类型检查、Main/Preload/Renderer 构建、单元回归；**不等于已经通过产品 E2E**。开工时用源 SHA 再核对分支头；分支如果追加提交，**不要默默改为最新 HEAD**，先核对变更和新增 CI，再决定升级固定接收 SHA。不要引用之前失效的 T04 13eb11d、T08 af14f7 作为最终来源。

权威资料：
- 共同分工与文件边界：docs/v3-full-product-scope-r01 分支的 PARALLEL-IMPLEMENTATION-TASKBOOK.md R03，固定旧文档提交 9a270cfec038fe0d8db2c379487394f0276ba3d3。
- 产品差距矩阵：同目录 FEATURE-GAP-MATRIX.md R02。
- 本地主线已做工作：main 的 docs/design/review-agent/acceptance/local-l01/L0-BASELINE-CHECK.md、L2-SHARED-ENTRY-INVENTORY.md、L3-DELIVERY-LEDGER.md。
- 真机底座：docs/design/review-agent/acceptance/v3-local-closure-20261020/LOCAL-V3-E2E-ACCEPTANCE-20261020.md、work/e2e/README.md。
- 原产品要求：docs/design/review-agent/02-product-and-templates.md、04-acceptance-and-evaluation.md、06-workflows-and-usability-design.md、07-application-and-execution-design.md。

## 三、先确认本地实际工作区，不要误覆盖正在施工的 main

L3 已记载本地 worktree 位于 /home/miku/Bot/CDUTStudio/wt/integration-l01、对应 integration/local-l01 分支。**先检查它是否仍存在、是否干净、是否落后于远端 main**；不能假定此绝对路径在当前机器上一定可用。已有正在执行的其他工作不能被 reset/clean 误删。

开始步骤：
1. git fetch origin main 和十个来源分支；记录 origin/main 的 SHA 及十个接收 SHA；确认对照表均存在且可读取。
2. git status --short、git worktree list；有未提交本地工作就先辨别所有权，不要覆盖。用当前 main 派生或安全更新**独立的**集成分支/工作树，保留可回滚基线。
3. 检查 L0–L3 已进入 main 的功能：**通用建案学年解除、合法学年校验、看门狗、合法字段 prompt 约束、原生持久化**。这些不需要从 T01/T10 的旧基线再次“修回来”。
4. 十条来源从旧 main@24603d87570f 派生，而现在 main 更靠前；**禁止用分支旧文件直接整目录覆盖新 main，禁止 force push**。每条按照 Git 三方合并和真实差异处理。
5. 记录固定的起点 SHA 和 rollback 点，后续每条线分别记录 merge/bridge commit。不要把十条线 squash 为无法拆分的一个大提交。

推荐短命令（根据实际工作树执行，不复制路径盲跑）：

~~~bash
git fetch origin
git worktree list
git status --short
git rev-parse origin/main
git merge-base origin/main origin/feat/v3-full-t05-human-workflow
git diff --stat origin/main...origin/feat/v3-full-t05-human-workflow
~~~

**合并原则**：以固定提交为来源，每次**一条线**合入集成分支、查重、化解真实冲突、编译或定向验证，再提交。优先用保留真实 Git 历史的非快进 merge；如因分支形态必须定向 cherry-pick，完整记录所有实际选入的 commit 与遗漏原因。遇到难解冲突及时中止当前 merge、保留上一批通过结果，不得以“ours/theirs 整文件覆盖”解决共享 UI 或共享服务冲突。只有所有受影响者的功能都还在，冲突才算解决。

## 四、分三批接收，边集成边验证，不等全部到齐才开始

这仅是**推荐的代码接收顺序**，实际可按独立程度调整；不要为严格顺序浪费时间。每批可保留多个小提交，能复用先复用。

### B1｜共同基础：T02 → T03 → T04 → T01

- **T02**：保留 document-service / document-capability-library 的现有主线修复；导入新 staging preview / inventory，接上由 Main 派生 B2 ctx 的**只读**入口与材料覆盖面板，不在 Renderer 传任意物理路径。确实无法解析的图片仍标 partial/待核验。
- **T03**：挂载 ReviewV3T03FactWorkbench，复用现有 correction/evidence actions；保障 canonical SourceRef（caseId/documentVersionId/parseRevision/location）**原样传递**，不得降级为按 quote 猜块。事项拆并使用单个可信 CaseAggregate CAS 事务接纳 T03RestructureProposal，历史不覆盖，新事实候选不自动确认。按 planT03Recheck 创建新 Run 或标真实 pending，绝不改写旧 Run。
- **T04**：保留 workspace-rule-compiler 的新增修复，调用 evaluateT04Plan 处理真实冻结 Plan binding，输入来自已确认事实与可信政策版本，结果经现有 Run writer；待定规则/冲突不能从模型文本偷换为 compliant。T01 动态配置与 T04 编译之间使用一个合同，不另设第二套 rules storage。
- **T01**：接入已发布的 TemplateVersion 到 V3 真实新案卷，绑定 objectType、字段、材料槽、流程阶段、规则与版本。确保示例“实验室申请”不强制学年；模拟试跑保留明确模拟字样，不能把草稿/技术 candidate 当正式审批模板。主线已经解除学年全局必填，**只做差异适配，不回退 L2 修复**。

**B1 可观察结果**：同一 V3 案卷能选择非综测模板、建立无学年对象、登记真实材料、查看精确来源/事实、冻结适用计划、得到可解释的确定性检查提案；没有 L 端口时逐项列具名 BLOCKED_OWNER / BLOCKED_BRIDGE，继续独立的部分。

### B2｜业务协作：T05 → T07 → T09 → T06

- **T05**：复用 V2 workspace-business-service/business-workflow，接入人工补件、阶段任务、申诉和受控本地决定。实现真实 Main Actor 绑定与原子申诉事务，不使用 Renderer 声称的 local-student / teacher 身份作为认证事实。保留原 AGENT_DECISION_DISABLED 对 D2 技术预审和无资格正式审批的拒绝；**另外提供合法本地业务阶段，而不是删校方安全边界**。
- **T07**：T07State / T07Action 不得落为第二套 CaseStore。Main 从真实组织者/评委身份派生 actor，保存轮次、assignment、requestId、expectedRevision；评委只收到其本人任务与脱敏原件；不得将其他票/实名资料暴露到评委 Renderer。D11 两有效评委 + 回避案例得到 4.10/5 → 82.00，缺评不能定稿。
- **T09**：Main 签发与读取 T09 任务包、离线 HTML 编辑器、回件预览、导入确认；附件**先经 T02 注册真实字节/DocumentVersion**，再作为 T05 补件或 T07 评分命令原子持久写入。actionId 幂等、版本锁和原任务包校验沿用 T09 codec。离线包的 respondent.actorSource/actorId 是声明，不是登录身份；学校正式适配只保留接口不伪造。
- **T06**：已存在 BatchStateV2、reopenBatch/retryBatchCases，先接 T06 CSV/TSV 清单、分案预览/重试和状态汇总。批次引用真实案卷 ID、每案独立 Run；T02 材料 ZIP→正式分案的桥接未完成时不得声称完成物理 ZIP 全自动入库。暂停/恢复若缺 Main 动作，记录准确缺口，补最小 queue 控制，不重造 BatchStore。

**B2 可观察结果**：一案可从技术审核进入合法本地人工补件与决定；同一原生案卷可接离线学生回件和评委票；批次选择多案执行并独立恢复失败案。所有未授权校方角色仍保持原状态。

### B3｜用户产品总装：T08 → T10

- **T08**：保留最新报告修复及回归。将已有 Run/Check 的 SourceRef 导航接至真实原件预览；选历史 Run 后不得混入当前尚未冻结的字段/补件。保留受众过滤，申请人报告不能含内部意见。现有 MD/JSON/XLSX/HTML 可调用；**PDF 若只是打印 HTML，不写成“已导出真实 PDF”**。Main 原生另存/报告文件桥接仅做最小必要施工。
- **T10**：最后集成 ContentReviewView、CreateCaseDialog、ReviewV3T10WorkspaceOverview，接入 T01 模板作者、T02 来源覆盖、T03 事实证据、T05 业务任务、T06 批次、T07 评委、T08 报告、T09 离线入口。避免出现“分支有组件但生产组件树从未 import”的孤岛。维持统一当前 case 与 run，不把五个入口误实现为五份存储。

**已知唯一直接交叠文件**：**T05 与 T10 都修改 V2CasePanel.tsx**。必须人工三方合并：同时保留 T05 的 ReviewV3T05HumanWorkflow / ReviewV3T05RunDecision 实际操作和 T10 针对非学生案卷的条件字段显示、统一案卷状态同步。**不允许直接用 T10 最后的文件把 T05 内容覆盖，亦不许因此放弃 T10 的 UI 调整。**

**B3 可观察结果**：用户从唯一 V3 工作台进入所有已接功能，不需要理解“V2 案卷 / B1 候选 / D4 technical”技术区别；当某功能仍缺合法 Main 写端口，展示真实未可用原因而不是不可见空白或假的成功提示。

## 五、需要补的共享桥接：只做必要项，不抢写十条线业务

| 需求 | 现有 T 线交付 | L 必须提供的最小桥接 / 注意 |
| --- | --- | --- |
| T01 模板绑定 | TemplateVersion + 模板编辑与 trial | 可信 Main 将已发布版本绑定唯一 V3 Case/Run；不能只在 Renderer 预览 |
| T02 暂存材料预览 | previewT02StagedSource / Inventory | 使用 Main 发出的 B2 ctx；原件候选仍为 staging-only，不自动变 DocumentVersion |
| T03 拆并及更正 | T03RestructureProposal、fact/evidence panel | 同案单事务 CAS、Current SourceRef 原样透传、受影响新 Run |
| T04 规则执行 | T04PlanCheck/evaluateT04Plan | 正确构造冻结 PlanBinding、已确认事实/政策选择，落入现有权威 Run |
| T05 本地决定/申诉 | stage/supplement/appeal adapters | local-business 模式、Main 可信 reviewer、补件本人、申诉独立复核；技术预审仍非学校批准 |
| T06 批次操作 | manifest mapping、queue UI | 复用 BatchStore；必要时补 pause-after-current/resume 与实际材料分案通道 |
| T07 评分 | T07Action/T07View | 可信评委分配、专属投影、持久评分与冻结、Case/Batch 对应 |
| T08 报告 | source-linked assistant / report builder | 当前/历史 Run 的真实引用、受众校验、必要保存入口；不虚称 PDF |
| T09 离线包 | T09 codec/issuer/HTML | 真实任务签发、附件登记、trusted import callback、可靠 actionId |
| T10 UI | overview/nav/case dialog | 只做统一组合、旧案卷兼容刷新、跨组件状态联动；T10 仍拥有 UI 设计 |

**共享文件归属**仍按 R03：review-ipc.ts、preload/index.ts、main/index.ts、native-workspace-case-v3.ts、共享 Case/Run/Batch 正式写事务及跨线 DTO 由 L 修改；本线的具体业务实现应以固定 T SHA 为准。

**接口请求卡住时如何行动**：先检查 Main 是否已有等价入口（L2 提醒 ASSIGNMENT_*_V2 是工具操作指派，**不是评委 roster**）；若已有则复用。若缺乏最小桥接则补桥接。如果缺的是 T 模块自己根本没做的业务算法，列 BLOCKED_OWNER、给出文件与最小反例，**不以大规模重构替代**。

## 六、只做真正有价值的验证，分级安排

**每条线 MERGED 后**：
1. 检查新增文件是否实际被生产调用、旧逻辑是否保留；特别确认 T05/T10 冲突。
2. 最小类型检查/构建：bun run typecheck；必要时 bun run check:boundaries；改 IPC/Preload 时执行 Electron Main/Preload/Renderer 构建。
3. 跑刚合入的本线少量定向测试（如 review-v3-t03-fact-workflow.test.ts、review-v3-t04-rules-scoring.test.ts、review-v3-t07-rating-workflow.test.ts、review-v3-t08-case-report.test.ts、review-v3-t09-offline-codec.test.ts），不以制造新测试数量为目标。旧环境与已知主线问题要与新增问题分开。
4. 真实功能出错就修最小原因；不能靠删除现有有效检查、替换 mock、默认标 pass 掩盖。

**每个关键跨线接线批次 WIRED 后**：复用现有 work/e2e/v3-e2e.mjs 驱动。现有场景包含 probe、d4-list、flow-core、flow-full、flow-b1、phase-prepare/phase-verify；现有场景**并不自动覆盖新增十线的业务旅程**，需要在现有脚本上少量补出真实用户操作，不另造独立 Electron E2E 基础框架。真实 Provider 仅在核心端到端节点使用，避免每合一份文件都跑耗时真实模型。

**必须实际复验的产品旅程**：
- **A15 通用组织实验室申请**：无学年 → T01 真实模板 → 人数上限 20、计划材料 → 来源/规则 → 初审、终审（本地具名且授权）→ 决定与报告。若不能做到，明确指出断在模板安装、Run 还是业务阶段，不得把模拟 trial 算 PASS。
- **A09 补件/人工纠正/复审**：模糊或不全的原件 → 一次不足 → 补真实新原件 → 再核验满足 → 不改写旧 Run → 本地决定与可追溯申诉复审。旧 technical-pre-review 不得越权生成学校批准。
- **A12 + A14 批次与评委**：多案真实 Case/Run → 批次分流与失败重试 → 匿名评委分配/回避/独立评分/缺评 → 汇总、同分/配额、具名本地冻结；离线评分包需在此验一次真实应用。
- **来源与报告**：Check/Opinion 点击定位真实原件/块/页；查看历史 Run、学生报告无内部资料，内部报告有来源和计算明细。
- **恢复**：已有 Case/Run/DocumentVersion 与 T05/T07/T09 新状态冷重启恢复；不丢历史、不意外批准、不重复离线回执。
- **原基线不回归**：D4 50 套目录/单案真实 Pi、B1 51st candidate 的真实技术预审链、60 Check 执行的真实含义、学年解耦、看门狗、来源版本保持可用。58 pendingChecks **不是** 58 张待办，也**不是** 58 项通过。

**100 案/500 文件、全格式 OCR、完整 120+30 评测、五人 UAT** 是原文定义的后续严格验收，未测则写 NOT_RUN；不要以这些大型验收尚未完成阻止已验证模块合入 main，也不得反向谎称已全部满足。

## 七、合入 main 的规则（本次已授权，但必须能回退）

1. **每批先在独立 integration worktree 验证。** 一条线一个可辨识的 merge commit；跨线 bridge 用单独提交，记录依赖。避免一个提交揉进十条线后无法定位问题。
2. 若 main 在执行时更新，先 fetch 比对，再重放本批变更，不能覆盖他人的主线工作。未经确认不 force push、不 reset 远端 main、不改上游 Nya-Angle/CDUT-Studio 仓库。
3. 批次满足“源码完整保全 + 类型/构建通过 + 受影响定向测试无新增失败 + 关键入口可达”即可推 main；真实业务多角色验收不完整的部分保留明确 KNOWN_GAP。不能为了追求绝对绿色无限扩张防御或测试。
4. 遇到真实致命缺陷（丢材料、错案卷、伪造审批、评分泄露、确定计算错误）则**不得强行合入该受影响部分**。只回退当前未通过的 merge/bridge，保留之前已通过的批次；列文件、原因和最小复现，必要时交原 Owner 修复后按新固定 SHA 继续。
5. 推 main 后复核远端 SHA 和生产引用；将每条线记录为 MERGED / WIRED / JOURNEY_VERIFIED 或 BLOCKED_OWNER（以及 KNOWN_GAP）；**不能因为工作树存在代码或 PR CI 绿就标 main 已包含该功能**。
6. Draft PR 保留至来源实际合入并可核验，不重复创建十个新 PR；如使用 Git merge 令原 PR 自动关联/关闭，须以远端 main 历史与真实文件为准，不把 PR UI 当唯一验收证据。

## 八、汇报方式与止损：不要再写大篇调查

直接持续更新 main 的 docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md **一个现有总账**。允许补一份简短的本次集成结论与复现步骤；不要为十条线分别创建十套治理文档。

每完成一个批次，按下面模板汇报；用户无需再重新派任务：

~~~text
Local-L04 批次：B1 / B2 / B3
集成 main 基线：<SHA>
实际接收：TXX=<来源固定 SHA> → merge=<集成 SHA> → main=<SHA>
已真实调用：<UI 或可信 Main 入口>
新桥接：<函数/通道、真实调用方>
验证：<具体命令或真实 Electron 路径> = PASS / FAIL / NOT_RUN
已知缺口：<TXX Owner 或 L Bridge、具体文件、真实原因>
下一批：<要合的 T 号、共享冲突、最短用户路径>
回滚点：<SHA>
~~~

**已结束的 R01 指令：十线 B1/B2/B3 已合入 main，现执行上文 R02 五份续作与 A15。** 若途中用户要求继续补齐 TXX 自身未开发的业务功能，先在总账说明而不是擅自跨 Owner。只在代码会丢失、正式审批权限改变、无法安全选择两条互斥业务语义等重大问题上请求裁决。

**最终成果不是“十份 PR 全变绿”，而是现在的 V3 main 真正包含十份功能代码、能从同一产品入口走通已实现的业务能力，并且每个未闭环处都有准确、可继续施工的 Owner。**
