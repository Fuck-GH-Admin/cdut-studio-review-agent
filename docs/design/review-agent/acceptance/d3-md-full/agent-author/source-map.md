# 来源等级与制度效力

原MD: `g01_archive_utilization_template_editor_spec_v1_5.md`，SHA-256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`；仅保存在私有工作环境，不提交原文。

- §0.2: `content-checked`只证明内容看过；`request-scope`用于技术任务说明，**不代表现行档案馆正式校规**。
- LAW01–LAW04/SC01：法定/省级依据候选，具体适用条款、版本与权限对象需有权核定；见catalog.sourceRegistry。
- CD01–CD06：馆方2026申请表目录已见，三表**全文具体字段**和2017/2024适用关系仍缺；2026寒假公告只在寒假期间有效。
- EX04–EX06：仅用于跨校结构参考，不在成都理工自动产生必交条件。
- UNIVERSAL_DESIGN：仅程序预审/证据组织建议，不形成馆方授权。

每个Check独立sourceBinding：`source-md`始终表示业务输入；有法律/校本/外校等级的原子规则还包含`source-law` / `source-cd` / `source-cross`，D2须编译为`unverified-policy`。不允许使用外校要求给本校拒件。

原文 §3.2 50字段、§4 14槽、§5.1 15分支、§9 16例外均在catalog中逐ID记录；§6 R01–R42全覆盖；非表格不变量X01–X12带精确sourceAnchor。实际源文全量哈希校验记录见run-log。
