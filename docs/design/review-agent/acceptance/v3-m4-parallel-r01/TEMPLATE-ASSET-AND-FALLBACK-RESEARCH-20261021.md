# CDUT Studio Review V3｜50 套领域模板、公共兜底模板与六类示例：独立核查

**研究日期**：2026-10-21  
**主线快照**：`main@19efdbb039374aaab37c58aba0b5d14131c5cf58`  
**研究范围**：只读核查模板资产、公共/兜底模板概念、未匹配路由与自动起草实现；不改生产代码、不影响已经派发的 M4 F01–F18 任务。  
**结论性质**：代码与文档静态核查；主线 CI 状态已查，未在此处重新执行本地 Electron 或模型调用。

## 1. 结论先行

用户提出的概念没有问题；此前讨论里确实把不同层级的“模板”混成了一类。**六类业务示例不等于产品只有六套模板，也不能替代原有 50 套 D4 领域模板或“未匹配时的公共兜底/作者起草能力”。**

核查结果可以精确表述为：

1. **50 套 D4 领域模板仍在当前 main 中**，由 G01–G08 的冻结目录登记。主线还存在 50/50 候选目录读取测试，以及 50 套逐一安装非零技术 Plan 的回归测试；2026-10-21 最新主线 `19efdbb03937` 的 PR CI 成功。它们是候选领域资产，不代表每套已经正式发布、逐套通过真实 Pi/ReviewRun 业务验收或取得学校政策授权。
2. **COMMON-01/02 是可复用的通用对象/场景编译能力，不是一份公共兜底模板。** 它接收已有工作区中的模板与对象/条件选择，生成具体检查任务；自身不是可供用户选用的 TemplateVersion。
3. **六类示例是另一项产品验收资产。** T01 提供六类示例包，每包含模板草稿、虚构政策、符合/违规/缺件三个样例及预期矩阵；此外 A15 的“实验室使用申请”是第七种作者起点，但不属于六个标准示例包。
4. **当前 main 确实有“50+1”作者候选路径。** “第 51 套”指用户为原有 50 套未覆盖的业务创建的自定义候选，而不是一份预先存在的公共模板。未匹配路由会要求用户确认，再生成一个最小 B1 候选草稿，进入编辑、保存/冻结候选的流程。
5. **自然语言/模型辅助模板起草也已存在，但与未匹配路由仍是两条相邻而未完全合一的路径。** 模板编辑器可以用本地结构化提取或已授权模型生成可编辑 TemplateVersion 草稿；B3 未匹配路径则生成带来源占位的最小 B1 作者候选，并不直接调用该模型起草器。
6. 在本次核对的 main 核心目录中，**没有找到一份独立、固定 templateId、专门在 50 套都不匹配时使用的“公共兜底模板”资产**。当前最接近的实现是“未匹配 → 用户确认 → 第 51 套自建候选/模板作者工作台”。若用户所指的“公共模板”是一个静态的通用模板资产，它目前尚未在这些主线目录中被明确找到；若指的是通用兜底作者流程，则已有部分实现，但与完整自动起草/发布/真实审核链还不等价。

## 2. 各类资产与能力的准确边界

### 2.1 D4 G01–G08：50 套领域候选模板

权威目录：[`catalog.json`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/docs/design/review-agent/acceptance/d4-unified-r01/catalog.json)

| 领域 | 数量 |
| --- | ---: |
| G01 | 5 |
| G02 | 3 |
| G03 | 10 |
| G04 | 8 |
| G05 | 6 |
| G06 | 9 |
| G07 | 7 |
| G08 | 2 |
| **合计** | **50** |

证据：

- 目录头明确 `templateCount=50`、上述 `domainCounts`，并包含每项 `templateId`、版本、工作区路径、Git blob SHA、来源 SHA、原领域状态及发布状态。
- [`review-d4-catalog.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-d4-catalog.ts#L33-L96) 强校验目录必须是 50 条，并验证领域数量、冻结工作区 SHA 和工作区模板身份。
- [`review-v3-main-d4-local-plan.test.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts#L42-L99) 验证目录 50/50 可读、每项具有非空冻结选择。
- [`review-v3-d4-catalog-attach.test.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-v3-d4-catalog-attach.test.ts#L25-L78) 对 50 套逐一调用既有 `attachD2RuntimePlan`，要求每套都能安装非零技术计划。最新 main 的 [PR CI run 39516171439](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39516171439) 在 SHA `19efdbb039374aaab37c58aba0b5d14131c5cf58` 上为 SUCCESS；该工作流包含全仓 `bun test --isolate`。

**必须保留的限制**：

- 目录仍记录 `publicationAllowed=false`、`authoritativeSchoolTemplate=false`，条目为 `candidate-held`。它们是有冻结来源的候选模板，不是学校正式发布的政策。
- “50 套逐一安装非零技术 Plan”是强于“只列出目录”的工程证据，但仍不等于每套都经过真实 Pi、真实材料、ReviewRun、人工业务决定的完整 E2E。
- `catalog.json` 的 `integrationStatus=NOT_TESTED_ON_UNIFIED_HEAD` 及每条 `integrationStatus=NOT_RUN` 是早期冻结目录里的状态文本；当前 main 后来新增了 50 套逐一 Plan 安装测试。因此**目录中的这两个状态字段已不能单独代表当前自动化测试进度**。后续应更新/补充状态证据，而不是把历史字段当作最新事实，也不能反过来将 Plan 安装测试升级解释成完整业务验收。

### 2.2 COMMON-01/02：通用对象与场景编译器，不是模板

实现：[ `review-d4-common.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-d4-common.ts)

该模块的核心接口是 `compileD4Generic(workspace, selection)`。它要求传入已有模板工作区、对象集合、可选的主场景与条件，并校验每个对象的来源版本、适用性、模块范围和非零检查。它解决的是**同一业务模板如何在多个对象/条件下正确展开**。

它不提供一个独立的“任何未匹配业务都可以直接套用”的模板；也不负责发明该业务应当遵守的规则。

来源历史：[PR #88 COMMON-01/02](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/88) 标题为“Generic object scopes and per-object scenario runtime”，明确交付是通用对象范围和逐对象场景运行时。

另外，模板模块化规范 [`15-template-modules-and-runtime-boundary-spec.md §2.2`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/docs/design/review-agent/15-template-modules-and-runtime-boundary-spec.md#L23-L54) 要求使用**一套统一模板目录**，避免建立互相重复的“跨校通用模板库”和“CDUT 私有模板库”。这并不禁止在同一目录中有一份共享的通用兜底模板；它禁止的是把同一套业务资产复制成两套互相竞争的目录。**统一目录、通用编译能力、公共兜底模板，是三个不同概念。**

### 2.3 六类 T01 标准示例包

设计来源：[ `02-product-and-templates.md §2`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/docs/design/review-agent/02-product-and-templates.md#L13-L25)。

六类标准示例为：

1. 学生综测；
2. 活动材料审批；
3. 奖学金资格与推荐；
4. 项目/比赛评委；
5. 费用材料核对；
6. 文件/协议要求核对。

实现：[ `review-v3-t01-example-packs.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.ts#L1-L123) 的 `T01_STANDARD_EXAMPLES` 恰好是六个 ID。每个 ZIP 含模板草稿、虚构政策、预期差异和符合/违规/缺件三类样例原件。代码注释明确指出它们**不是伪造的 Run 结果**，需用真实 Case/Run 验证。

`review-v3-t01-business-presets.ts` 的 `T01_SCENARIOS` 则有七个起点：上述六类再加 A15 使用的“实验室使用申请”。因此，“六类示例包”和“全部模板/作者起点数量”本来就不是同一个计数口径。

这些示例的职责是证明通用模板作者和业务工作流能够覆盖代表性场景，**不是要求把 D4 的 50 套缩成六套**。六包结构测试通过也不能自动证明六个业务都已走完真实端到端旅程。

### 2.4 “第 51 套”：自建候选作者路径

用户界面和调用链有直接证据：

- [`ReviewV3LocalCandidateWorkbench.tsx`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx#L294-L367) 明确写着“使用已有 50 套 D4 模板生成本案审核任务”以及“本地候选审核模板 · 第 51 套”。并且说明：自定义审核目的不在 50 套时可创建候选，记录只在本机，不代表校方发布、学校政策核验或正式审批。
- [`ReviewV3ProductWorkspace.tsx`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3ProductWorkspace.tsx#L192-L243) 在当前路由仍为 `unmatched` 时，要求用户填写候选模板 ID、名称、目的、场景、对象、待核 Check 和人工角色，再明确确认生成临时候选。
- [`review-v3-b3-unmatched-author-bootstrap.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-v3-b3-unmatched-author-bootstrap.ts#L1-L156) 生成最小 B1 作者候选：单个“业务范围已由人确认”字段、一个待核 Check、人工/技术阶段及当前材料来源引用；标记 `candidateOnly=true`、`publicationAllowed=false`、`businessWriteAllowed=false`、`schoolPolicyVerified=false`、`planCondition='unknown'`。该函数本身不写入作者库；后续由 B1 已授权的保存/冻结流程处理，并要求 Main 重新验证实际原件。
- [`review-v3-main-local-product-intake.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts#L148-L219) 把本地已发布模板与 50 个 D4 工作区放在同一技术候选选择视图中；D4 项仍保持 candidate-held 身份。人工选择 D4 后返回 `requiresPlanSetup=true`，要求用户在场景编辑器核实对象/条件后再固定 Plan，而不是直接把候选当成正式发布模板。
- [`ReviewV3CandidateIntakeSurface.tsx`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx#L114-L184) 在未匹配时显示“这批材料尚无可验证的匹配模板”，允许人工选择已有模板或“创建新的候选审核模板（非正式发布）”。

因此，当前“+1”是**未匹配业务的自建候选/作者入口**，不是固定的公共模板内容。它已经是一个有真实 Main/Renderer 调用链的产品能力，但其默认生成结果只是最小候选骨架，不能把它说成已经自动生成并发布了一份完整审核模板。

### 2.5 自然语言/模型辅助自动起草：已存在，但与未匹配路由未完全合并

相关实现：

- [`ReviewV3T01AuthoringLaunchpad.tsx`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/ReviewV3T01AuthoringLaunchpad.tsx#L13-L85) 已嵌入现有模板编辑器，提供“从自然语言起草模板”和六类示例 ZIP 下载。
- [`review-v3-t01-brief-authoring.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/review-v3-t01-brief-authoring.ts#L1-L187) 的本地模式只抽取明确写出的对象、字段、材料、流程、数值限制；规则默认保留为人工检查，并把未确定的正式制度/阈值写入 questions。
- [`review-v3-t01-model-draft-port.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/review-v3-t01-model-draft-port.ts#L13-L54) 提供已授权模型起草适配器：要求模型返回结构化 TemplateVersion 草稿，随后强制设为 `status='draft'`、清空正式政策引用、补充负责人核实问题。
- [`TemplateWizardPanel.tsx`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/TemplateWizardPanel.tsx#L359-L364) 已把模型起草调用接到 `window.reviewAPI.requestT01ModelDraft`。

**差别在于入口与产物**：

| 路径 | 输入 | 当前产物 | 不能声称已经完成的部分 |
| --- | --- | --- | --- |
| T01 自然语言起草 | 模板负责人输入的自然语言需求 | 可编辑的 `TemplateVersion` 草稿（本地规则提取或授权模型草稿） | 不自动确定正式政策，不自动发布，不生成真实 Case/Run |
| B3 未匹配 → B29/B1 | 实际输入材料、Main 验证的来源和用户明确填写的候选意图 | 一个最小 B1 作者候选骨架，可继续编辑、保存/冻结 | 该 bootstrap 本身不调用模型，不会自动填全业务字段/规则/流程，也不发布或形成业务结论 |
| D4 COMMON-01/02 | 已有 D4 工作区和逐对象/场景选择 | 该候选在特定对象/条件下展开的技术检查任务 | 不会自动发明新业务模板，也不是兜底模板 |

所以，自动起草功能不是完全不存在；但**“未匹配的实际材料 → 自动提炼业务 → 使用公共兜底模板/通用骨架 → 形成可编辑完整草稿 → 负责人确认发布 → 正式 Case/Run”这条统一用户旅程仍未由这些分开的代码路径证明完整闭环**。

### 2.6 普通模板库的空白起点也不是公共兜底模板

[`TemplateWizardPanel.tsx`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/TemplateWizardPanel.tsx#L57-L95) 有“新审核模板”空白草稿起点；[`builtin-templates.ts`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/builtin-templates.ts#L82-L292) 有两套 builtin 模板和八套 reference 范本，未找到单独命名的 catch-all 公共模板。空白草稿是作者主动创建的起点，不会自动在 B3 无匹配时被选中，也不提供跨业务通用的正式规则。

此外，`visibility: 'public'` 在 T01 字段配置中表示字段的可见性，不应仅凭这个类型值就认定仓库存在一份“公共模板”。

## 3. 当前产品概念图

~~~text
                    ┌─────────────────────────────┐
                    │ 已发布的本地 TemplateStore   │
                    └──────────────┬──────────────┘
                                   │
┌────────────────────┐             │             ┌────────────────────┐
│ D4 G01–G08 50 候选 │─────────────┼─────────────│ 用户自建第 51 套候选│
│ 冻结领域工作区     │             │             │ B1 作者/Plan 预览   │
└────────────────────┘             │             └────────────────────┘
                                   │
                       B3 保守技术路由/人工确认
                                   │
                  ┌────────────────┴─────────────────┐
                  │                                   │
              有可信匹配                           无匹配
                  │                                   │
       选 D4 后配置对象/场景               用户确认业务意图
       或绑定已发布本地模板                         │
                  │                        B29 最小候选骨架
                  │                                   │
                  │                         B1 作者编辑/保存/冻结
                  │                                   │
                  └────────────────┬──────────────────┘
                                   │
                 只有满足正式合同/发布门禁后才能执行
                                   │
                     CanonicalPlan / ReviewRun
~~~

T01 的自然语言起草是另一条相邻路径：需求文字 → 可编辑 TemplateVersion 草稿 → 人工确认/编辑/发布。它还需要和 B3 无匹配入口更紧密地衔接，但不应绕过正式来源、负责人确认与发布门禁。

## 4. 调研判断与建议

### 已证实

- 50 套 D4 领域模板没有被六类示例替换；它们仍在主线冻结目录中。
- 50 套候选已经有目录读取和逐套非零 Plan 安装自动化回归；这是实际工程进展。
- COMMON-01/02 是共用对象/场景运行能力，不是单独的公共模板资产。
- 六类 T01 示例包与 A15 第七种实验室作者起点是示例/起草层面的概念。
- 当前 main 已有真实的“未匹配 → 用户确认 → 第 51 套自建候选”路径，也有独立的自然语言/授权模型起草入口。

### 尚未被证明/需要进一步裁决

- 用户记忆中的“一套公共模板”是否指一个固定的、可在目录中直接选择的通用模板，还是指“未匹配时进入公共通用作者起点”的产品流程。本次在当前 main 的 D4 目录、builtin/reference 列表和 B3/B1 路由入口中没有找到独立静态 catch-all 模板 ID。
- 若需要固定公共兜底模板，它应如何与 50 套 D4 候选及已发布模板共同存在于**同一统一目录**，并在路由无匹配时被调用，而不是建立第二套模板库。
- 当前 B29 生成的最小候选骨架如何和 T01 模型起草端口衔接，以利用真实材料与用户目的生成更完整的字段/材料槽/规则问题/阶段，同时确保未知政策保持未知。
- 50 套各自的完整业务语义、来源、Plan 编译与运行效果如何分层记账。逐套 Plan attach PASS 不应把 50 套一口气标成全产品 E2E PASS。

### 建议（本报告不直接派发开发）

1. **保留三项独立产品要求**：50 套领域模板资产；一份可复用公共兜底/通用作者入口；六类完整业务示例与验收包。不得互相抵消。
2. 若“公共模板”指固定资产，建议把它定义为统一目录里的 **通用未匹配业务起草模板/脚手架**，而不是拥有任意默认政策的通吃审核规则。其默认结果应是需要用户确认的草稿/候选，而不是自动合规或自动批准。
3. 让 B3 的 unmatched 路径在用户确认后复用 T01 的结构化/授权模型起草能力，自动生成**可编辑草稿**；把材料来源、业务对象、检查目的和待确认问题传进去。正式政策来源、结构化算子、角色权限和发布版本仍需负责人确认。
4. 为 50 套保留逐项状态：`ASSET_PRESENT`、`WORKSPACE_VALIDATED`、`PLAN_ATTACH_VERIFIED`、`REAL_RUN_VERIFIED`、`BUSINESS_JOURNEY_VERIFIED`、`PUBLISHED`。当前自动化证据可支持前几层中的部分层级，不可把它们折叠成一个“已完成”。
5. 由于 M4 子任务已由用户另行派发，本报告只作为独立审计证据提供，不要求暂停、重派或重写现有子任务。后续主监督会话可据此检查任务书是否覆盖“50 + 公共兜底作者能力 + 六类示例”三条要求。

## 5. 核心证据索引

- [D4 冻结目录：50 条资产及历史状态](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/docs/design/review-agent/acceptance/d4-unified-r01/catalog.json)
- [D4 目录加载与数量/哈希校验](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-d4-catalog.ts)
- [COMMON-01/02 通用对象/场景编译](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-d4-common.ts)
- [50 套逐一 Plan 安装测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-v3-d4-catalog-attach.test.ts)
- [50+1 本地候选工作台](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx)
- [B3 无匹配路由 UI](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx)
- [B29 无匹配候选草稿生成器](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/main/lib/review/review-v3-b3-unmatched-author-bootstrap.ts)
- [T01 六类示例包](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/apps/electron/src/renderer/components/content-review/review-v3-t01-example-packs.ts)
- [产品设计：六类完整模板要求](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/docs/design/review-agent/02-product-and-templates.md)
- [模块化/路由设计：统一目录与自动路由的边界](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/19efdbb039374aaab37c58aba0b5d14131c5cf58/docs/design/review-agent/15-template-modules-and-runtime-boundary-spec.md)

**最终判断**：此前的说法不是“50 套变成六套”，而是我们没有把“50 套具体领域模板”“公共兜底/自建模板能力”和“六类完整示例包”保持为三条独立要求。当前主线已经具备 50 套资产、COMMON 编译能力、第 51 套自建候选和 T01 起草/示例包的部分实现；但没有证据证明存在一份独立固定的公共 catch-all 模板，也没有证明无匹配材料到完整生成、发布、运行的流程已完全闭环。
