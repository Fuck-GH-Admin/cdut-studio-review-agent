# CDUT Studio Review V3｜第四里程碑前置调研 R02（Research-First）

**用户 2026-10-21 最新决定，正式覆盖旧 R01“立即拆包/派发/编码”指令**：第四里程碑可以提前启动，但**第一轮仅由全新会话了解项目、复核事实和整理功能缺口**。直到用户与主监督会话审阅调研结果、共同确认开发基线之前，**不得开多开发子会话，不修改生产代码，不自行组织大并发**。

**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent  
**主线快照**：`main@3d2e0300d92dbe1fc4729a75e8c6e0bc728399ee`（2026-10-21；开工重新 `fetch`）。  
**独立主监督交接**：`SUPERVISOR-SESSION-HANDOFF-20261021.md`（同目录，主会话职责与 A15 最新状态，请勿将它误解为研究会话任务）。

## 1. 两线并行，但职责不同

**Local-L 本地执行线**：持续完成 A15-S4 的真实 Electron GUI 全流程和可信 Main/IPC/Preload/Case/Run 事务，保留唯一主线集成权。当前 **A15-S1 PASS / S2 PASS（四种真 RuleRun）/ S3-02 PASS（初终审）/ S3-01 PASS（补件两轮）/ S4 截至本快照 NOT_RUN**。仅使用最新 main 和 `L3-DELIVERY-LEDGER.md` 作为实时状态来源。

**M4 新独立调研线**：不等 S4 才开始调研；但先**理解完整 V3 与剩余产品差距**。研究不影响本地 L 的日常执行。调研结果交给用户和主监督会话裁决，再决定并行数量、真实 Owner 和开发任务。

## 2. 调研入口（避免重启漫无边际的历史考古）

1. `docs/design/review-agent/02-product-and-templates.md` — 原始 F01–F18、用户角色与六套完整业务目标。
2. `docs/design/review-agent/04-acceptance-and-evaluation.md` — A01–A18/C01–C04/S01–S03，产品验收准绳。
3. `docs/design/review-agent/06-workflows-and-usability-design.md` 和 `07-application-and-execution-design.md` — 真实操作链与内部执行。
4. PR #180 的 `V3-CORE-ARCHITECTURE-CLOSURE-R01.md` — **架构已裁决**：TemplateVersion→RuleSpec/Plan→真实 ReviewRun→合法业务动作；唯一 V2 CaseAggregate/CAS，不再另做一套。
5. **main** `docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md` — 真实本地验收与最新集成（最新章节优先于旧历史）。
6. 旧 PR #163 的 `FEATURE-GAP-MATRIX.md` — 有用的差距索引，但 2026-10-20 的代码基线**已经过时**。逐项查最新 main，不可照抄其 BLOCKED/M 结论。

必要时读取对应源码、运行入口、真实 CI 和历史 PR。**不要求**重新遍历 189 个分支、全部历史 PR 或 72 项能力考古。

## 3. 唯一调查任务：把设计与实情核对清楚

A. **设计中的 V3**：完整产品定位、核心架构、角色权限、模板/政策/材料/来源/事实/Plan/Run/人工决定/批量/评分/报告/离线的用户旅程及职责。

B. **当前 main**：对每个 F/A/U 功能查真实源码、生产消费者、CLI/API/GUI 可达性与已经记录的验收；把 `DESIGNED_ONLY`、`DOMAIN_CODED`、`MAIN_WIRED`、`JOURNEY_VERIFIED`、`EXTERNAL_BLOCKED` 区分清楚。已通过一段真实流程也不能推断全功能通过。

C. **剩余差距**：找出真正要新写的功能、需要接线的旧功能、目前实现错误的地方、仍需独立验收的能力，以及依赖学校正式授权的外部项。**不能把已经合入的 T01/T02/T06/T08/T05、T01–T04 架构收口或 A15-S2/S3 重列为“完全未开发”**。

D. **并行开发依赖**：记录共享 DTO、可信 Main、案例原件/Run/Decision 真值的 ownership 与实际接口请求；说明哪些功能在后续可以独立开发、哪些必须等统一合同、哪些可能和 A15-S4 撞文件。**只指出，不在本轮实际派发/开发**。

## 4. 交付：先把可靠基线交给用户

调研完成后提交一份结构化结论（仓库 Markdown 报告可放自己 docs-only 审计分支）：

1. 设计 V3 的总体架构与完整业务流程。
2. 最新 main 的实际架构与业务完成度。
3. 按 F01–F18/A01–A18/U01–U12 的**功能差距表**（源码证据、必要的具体缺口、推荐补法）。
4. 会影响大并发的真实接口/代码依赖与冲突。
5. 候选第四里程碑优先方向及为什么（**建议，不是已授权开发任务书**）。

不要只写大而空的总结；重要结论要有文件路径、SHA、实际可达入口或验收证据。也不必人为追求长报告。调研完成后先汇报，**等待用户与主监督会话审核**。

## 5. 本轮禁止与下一阶段触发

- **禁止**修改生产代码、合并 PR、删除分支、替 Local-L 跑 A15、提前生成多个开发 Agent 提示词或声称已经派发并发子任务。
- **禁止**推倒第三轮增强 V2 架构、制造第二套 Case/Run/Policy writer、取消 Main 可信角色门禁，或过度防御性重构。
- **允许**独立静态核查、比对源码、阅读测试结果、在独立审计分支提交调查报告；若有疑问在报告中写证据和置信度。
- **只有在调研结果经过用户与主监督会话确认之后**，进入 M4 后续阶段：确定开发包、分别创建子会话真实开发、分支 Draft PR、由 Local-L 集成及实机验收。A15-S4 结果可作为接口微调信息，并非本轮调研的前置阻断。

**避免过度管理**：本阶段的结束条件就是“设计与真实实现的差异已经足以支持可靠的下一轮拆分”。不要为了继续完善文档而拖延交付，也不要反过来跳过调查直接分包。
