# R02 144 项审计：源码现实图（第一批）
日期：2026-10-24。审计基准：feat/v3-r02-template-library；此前核对 HEAD 150acfe761cb7ad0424a2ca009fd57f12dbfddfd，后续须重验 HEAD。
## 已直接核对
- packages/shared/src/types/review-v2.ts：TemplateVersion 使用的字段、DocumentVersion、SourceRef、ConditionAST 等数据契约；SourceRef 必须保留 caseId/documentVersionId/parseRevision。
- apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts：adaptT01ConstraintsToT04 只允许确认过的 field-number-limit lte 映射；不支持或未经确认者进入 unresolved。存在该桥不代表 144 个 R02 criterion 已编入 CanonicalPlan。
- apps/electron/src/main/lib/review/r02-template-catalog/definitions/index.ts：在 base 上按该路径读取返回 404。须继续检索替代注册位置；不能直接断言全仓无注册。
- docs/design/review-agent/R02-V3-IMPLEMENTATION-CONTRACT-20261023.md：仍以旧 128 项为交付范围，144 项由本轮任务书扩展。合同要求独立区分模板研究标准和正式 PolicyVersion；auto-pass 关闭，正式决定经 Main。
## 待逐链核实
拖入/选取 → 上传前门禁 → 模板发现 → 案卷材料分类 → criterion 编译 → C0 Plan → Run → 结果槽 → 补件重审 → Main 决定。特别是 PR #246/#248/#249/#250/#251/#261。
## 初步风险
共享注册与真实 Plan/Run 可达性未证实；各批次 PR 的测试不能替代集成验证。任何未运行场景均记 NOT_EXECUTED。
