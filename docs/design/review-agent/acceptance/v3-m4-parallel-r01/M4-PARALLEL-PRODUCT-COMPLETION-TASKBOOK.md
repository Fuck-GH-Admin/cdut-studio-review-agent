# CDUT Studio Review V3｜第四里程碑提前并发：剩余产品功能补全任务书 R01

**任务类型**：真实生产功能开发的并发协调与交付；不是第四轮无限制架构考古，不是只产出调研报告。  
**2026-10-21 起始事实**：`main@e3eebc09bd3c1677af831f8bf003e430e99a3ae3`；Local-L 刚提交“发布模板 Plan 正式安装与真实 ReviewRunV2”及 A15 S2 真机四例，**S2 PASS（18/21/未知/缺计划书）**；**S3-01 补件两轮和 S4 纯 GUI 完整旅程未签收**，这两者归本地 Agent，云端 M4 不抢。开工时重新查最新 main SHA 与 L3 台账。

## 1. 从现在起，两条工作流同时前进

- **Track L，Local-L**：唯一 Main/IPC/Preload/Case/Run 可信事务与跨模块合并、A15-S3/S4 真机闭环、最后产品签收；不承担 M4 子会话可以独立完成的领域扩展。新的 shared/Writer 修改由 L 统一接。
- **Track M4，新云端会话**：立刻接管 A15 核心链**以外**尚缺的真实产品功能，按 F01–F18 / A01–A18 / U01–U12 做**增量差距重核 → 并行开发分包 → 独立 Draft PR**。不等 A15-S4 完成才开工，也不预判未来 A15 反证。S4 出来仅针对真实不兼容做定向微调。

**冻结交接面**：沿用架构裁决 PR #180：唯一 `CaseAggregateV2`/state.v2.json、RunStore、DocumentVersion/SourceRef、TemplateVersion、RuleSpec/CanonicalPlan、可信 Main Actor、T05 本地与学校正式决定区别。**禁止**再次选择全局架构、另建 CaseV3/RunV3/第二规则引擎、把技术预审当学校审批、硬编码 A15 实验室名称或把 test fixture 当产品运行证据。

## 2. 新会话首次阅读：只读这些，不无限扩张

1. `docs/design/review-agent/02-product-and-templates.md` — F01–F18、六个完整示例。
2. `docs/design/review-agent/04-acceptance-and-evaluation.md` — A01–A18/C01–C04/S01–S03。
3. `docs/design/review-agent/06-workflows-and-usability-design.md` 与 `07-application-and-execution-design.md` — 交互与执行边界。
4. PR #180 下 `V3-CORE-ARCHITECTURE-CLOSURE-R01.md` — 已定架构与特殊不可越过的 Main 信任边界。
5. **最新** `main:docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md` — 真实签收。
6. `docs/design/review-agent/acceptance/v3-full-product-scope-r01/FEATURE-GAP-MATRIX.md` — 旧缺口候选，**标注起点 2026-10-20，已过时**。每项必须用最新 main 的实际模块/消费者/PR/验收纠偏，尤其旧表不能继续说 A15 S2 未实现。

完成上述核对后，一页内写出真正**未完成**的可开发项，不再阅读百余旧 PR 做新一轮考古。对每一项使用 `DESIGNED_ONLY / DOMAIN_CODED / MAIN_WIRED / JOURNEY_VERIFIED / EXTERNAL_BLOCKED` 标记；不因源码存在宣称完整，也不把已有交付重复作为新功能。

## 3. 首批候选并行包：按可独立写代码程度排序，允许调整

以下是**待核定任务包**，不是要求八条不论是否已经完成全部重写。首次查重后选 4–8 条互不冲突的子任务，明确源码文件 Owner、独立验收、共享依赖与提交分支；直接开发。

| 包 | 优先功能与验收范围 | 可独立开发的内容 / 注意 Main 边界 |
| --- | --- | --- |
| **M4-01：复杂材料输入** | A03/F04：真实扫描 PDF、图片、PPTX/XLSX/CSV，多页/图像/表格内容与区域来源，partial 覆盖明确 | 复用已合入 T02 OCR/PPTX 与文档读入模块，增量完善解析、OCR 位置、原件来源展示及实际格式用例；**不替换 DocumentStore/文件真值 Writer** |
| **M4-02：证据与事实工作台** | A04/A05/A08：一证多事项、图文提取、字段更正、版本失效、Check→原件双向跳转 | 复用 T03 FactWorkbench、Observation/Evidence 与来源 UI，做可操作链路及定位/确认领域代码；不另造事实/RunStore |
| **M4-03：物理批量与批次旅程** | A12/F14：ZIP/文件夹真实多案分组、归属修正、批次建案、失败回执、恢复、后续 100 案/500 文件证明 | 复用 T06 已经合入的真实 OS Picker/Main entry token/BatchStore；云端补分案策略、UI/进度、定向回归，生产 Main bridge 缺口交 L；不可虚构 100/500 通过 |
| **M4-04：报告与助手的完整交付** | A13/F16/F17：Run-pinned 报告、可审阅助手建议确认应用、真实 PDF/可用导出、分受众与依据链接 | 复用 T08 PDF（目前为图片页，不冒充可检索 PDF）、现有字段类型 Main 修复和 AssistantDrawer；在独立报告/助手组件补实用缺口，特殊输出格式各自验收 |
| **M4-05：补件/申诉/离线副本** | A10/C01–C04：学生答复、具名复审、独立副本来回、版本冲突、重复回件、反馈闭环 | 复用 T09 offline-roundtrip、现有 Appeal、T05 可信业务阶段；云端开发领域和前台交互，正式角色/任务/保存仍交 L；不能伪造 school 身份 |
| **M4-06：六套完整通用业务实例** | A02/A15、F02：从真实用户可编辑模板到原件、规则、材料槽、人工阶段、报告的六个不同场景 | 复用 T01 六个 ZIP/作者态、已完成 A15 模板/规则合同，补**可实际运行**的虚构政策+材料+预期状态及通用 UI，不为每套场景写专用 Main if |
| **M4-07：一次开始与用户工作台** | A18/U01–U12：普通用户一次开始后解析/审核/集中待办、跨案切换、可停止/恢复、明确异常入口 | 复用 T10/现有 ContentReviewView、RunGraph、工作台，不改可信执行权限；缺 IPC 指明最小请求交 L；优先降低“需要开发者手工多次点击” |
| **M4-08：确定计算及评委收口** | A07/A14：组级择高/上限/权重/金额/日期、独立多评委/回避/N-A/同分/历史定稿 | 复用 T04 与 T07、judging/rating；先查主线评委已有真实 PASS，不重做已通过的评分链；补仅剩的业务运算和边界并保留公式的真实计算来源 |

**优先建议**：M4-01、02、04、06、07 可以最早启动；M4-03、05、08 以最新缺口证据决定是否独立开会话。M4-07 与 A15-S4 可能碰 `ContentReviewView`/Main，故先在单独领域 UI 分支实现，不直接改 L 正在编辑的统一入口。

## 4. 并发约束：写得快，但不互相覆盖

- 每个子会话从**分发时实际最新的 `origin/main` SHA**建自己的分支，如 `feat/v3-m4-01-material-real-r01`，使用独立工作树；不得和 Local-L 共享可写 worktree。
- 各会话只负责本任务**领域代码、独立组件、自己的测试及明确交接**；`packages/shared`、`case-store-v2.ts`、`run-store-v2.ts`、核心 `review-ipc.ts`、`preload/index.ts`、唯一可信 Actor/Decision Writer、正式 `main` 合并都由 Local-L。
- 面临所需的共享 API 修改：写最小 `CONTRACT_REQUEST`（入参/出参/字段作用域、已有 owner/消费者、实际阻断），领域侧可做无副作用 adapter；**不要**自行修改第三套业务结构、回退旧架构。
- 多个包需要同一个 Renderer 大文件时，只交可复用子组件/ports，由 L 最后在主入口注册。避免并发改 `V2CasePanel`、`ContentReviewView`、`BatchPanel` 导致抢合并。
- 修的是已确认的产品缺口，避免无实际需求的 defensive validation / 大型测试基础设施。针对性验证由子会话做，完整 Electron E2E/集成回归交 Local-L。**不可**为降低测试成本省去实际业务行为或事实真值。
- PR 可 Draft，必须有真实生产 diff、测试结果、未接线点和可复现操作；**文档-only 任务不得冒充功能完成**。旧源码升级优先于重新发明模块。
- Local-L 与 M4 并行期间，S4 发现合同问题，由架构 Owner 提出最小 patch，M4 相应子会话只按差异更新；不全线回滚、全面停工或重新开架构大会。

## 5. 新云端会话：从 context 到代码的最短执行路径

**本会话负责 M4 协调，不替代主会话 PR #180 的架构裁决，不替代 Local-L。**

1. 一次性获取最新 main、L3、A/F/U 需求、八个候选域当前代码与真实 E2E。**写不超过 30 行的 M4 当前差距结果**（更新旧矩阵，不编造完成率），列出已通过应关闭的候选。
2. 列出各独立任务包：`scope、文件所有权、验收场景、与 L 的 Main 接口、可直接开工的源码入口`。对确实无共享依赖的包当场独立开始**真实功能开发**，并交付 Draft PR；别把“等待 A15-S4”写成统一前置。
3. 若无法从一个会话自己开启新的平行聊天，就把每个开发包整理为**可直接复制给 ChatGPT 新子会话的独立提示词**；用户负责创建会话，协调者不声称已自动创建子会话。
4. 定期以 PR + SHA 为准收敛来源，原始缺口矩阵只作对照，**不创建第二套正式状态总账**；本地合并依原 L3 台账。
5. 第一个可用增量完成后直接提交真实功能 PR，并在 PR body 给 L 说明怎样集成；不只产出规划文件就停。

## 6. 并发与 A15-S4 的同步检查点

- **现在**：M4 的独立域代码全面可以启动；A15 S2 已记录为 PASS，但这是**真 Electron IPC/Run**，不是 S4 用户 GUI 旅程。
- **当 L 的 S3-01 两轮补件通过**：仅核对 M4-05、M4-06 是否与补件语义冲突，精准修补。
- **当 L 的 S4 首次完成**：将真实 UI/业务契约变化回传涉及的 M4 领域 owner，仅修改必要的桥接或 UI 组件，不重做全部分支。
- **当各 M4 PR 集齐**：由 L 独立逐条接收并验收原 A01–A18 所需旅程，最后做跨平台、安装包、独立评委、批量与原件覆盖等联合验收。

**区分状态**：`DOMAIN_CODED` / `MAIN_WIRED` / `JOURNEY_VERIFIED` / `PRODUCT_ACCEPTED`。任何一步都不能因为“CI 全绿”自动向右跃迁；不建议重新造大量过程报告。

## 7. 首批产出

**M4 协调会话首轮必须交付**：最新 main 固定 SHA、真实剩余功能清单、优先 4–8 个互不改写共享 Main 的开发包和各自提示词/PR、至少一个可执行的领域开发动作（或明确首个领域分支代码交付）。进程不等 A15-S4，但以 S4 后最小协议回写为约束。

**最终目标**：当 Local-L 完成 A15-S4 时，其余独立产品功能应该已经有并行代码成果可以立即接收，而不是那时才启动第一次剩余功能盘点。
