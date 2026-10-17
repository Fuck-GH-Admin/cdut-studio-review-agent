# R1 → COMMON-01/02 迁移
- 原 D1 `schemaVersion:1`、D3 携包和 shared-module digest 锁不升级；原文作者态与引用路径保持不变。
- 旧 D2 schema 1（文字/校园卡/档案）和 schema 2（R1 student-field）保持原行为与指纹；新增 `generic-object` 才用 schema 3，**不得将旧固定案卷计划更名升级**。
- 新建通用对象模板时需检查每一 Check 的 sourceBinding：明确 `genericScope` 或 `caseScopeJustification`，再给每一业务对象选择独立场景/三值条件、固定来源版本。不能自动给旧模板添加 genericScope。
- 对旧 campus-card / student-field / archive-item 等不适用新选择项；反过来不允许将 G03/G08 目标伪装成旧类型以走通代码。
- `source.reference.documentVersionId` 为**作者态来源快照版本**；`EvidenceLink.documentVersionId` 是**案卷实际上传文档版本**。两者用途不同，不要假定可互换。
- 正式接入八域模板时按照原完整业务 Markdown 的固定来源逐项映射；无法机器确认的保留 awaiting-confirmation/POLICY_HOLD。不能把作者样例复制成学校现行政策。
