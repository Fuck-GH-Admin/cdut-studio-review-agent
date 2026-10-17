# COMMON-01/02 基线与最小修订设计
- 固定技术父提交：`94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`，原 D3-R0：`4b191c729f3d5f8135c73b87c17642023f6c3986`。
- 问题来源：仅文档的 [PR #87](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/87)，包含八域静态适配汇总。它不是待合入的引擎代码。
- 已有 D1 模块 Use `objectKey` / `sourceBindings`、D3 便携锁/摘要、D2 target→Subject/RuleSpec、Pi EvidenceLink/门禁；R1 仅学生对象可按字段批量展开，非学生场景只允许校园卡单对象。
- 本轮改动：作者态的 `genericScope`（businessTypes、精确事实标签）、`genericScenarioAxes`（互斥主场景/附加条件）；D2 `generic-object` / 每对象 `scenarioSource` / 三值 `conditions`；共享 D2 编译调用既有 D3 `previewDemo`，再逐对象展开并固定 schema 3 指纹；Pi 提交前对精确 Subject 和有效 EvidenceLink 施加门禁。
- 兼容策略：保留 schema 1/2 及 R0/R1 原分支，不改 R0/R1 SHA、不搬移作者资产、不以新增接口解锁正式审批。未声明 `genericScope` 的逐对象检查必须拒绝，无条件整案 Check 需完整 `caseScopeJustification`。
- 设计权衡：不创建任意对象图、不解析模型推测为授权；一切来源版本/条件状态属于候选技术输入。运行证据以 CI 固定 checkout SHA 为准。
