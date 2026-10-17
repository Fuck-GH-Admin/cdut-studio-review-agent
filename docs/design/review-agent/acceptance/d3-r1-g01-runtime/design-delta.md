# D3-R1 G01-I 共享引擎最小修复：设计差异与权限边界

## 确切技术基线
R0 = `4b191c729f3d5f8135c73b87c17642023f6c3986`（`release/d3-r0-20261011`）。R1 只是这个固定父版本的独立 Draft PR；所有 A #81 / C #82 旧历史文件和 B 私有 Gold 不变。

## 旧→新映射（公共而非 G01 旁路引擎）
| 能力 | R0 | R1 候选 |
|---|---|---|
| 业务对象 | campus-card、archive-item、archive-operation | 新增 `student-field`，`objectKey=studentId/fieldKey`，每字段独立 `ReviewSubject` |
| D1 作者责任 | sourceBinding 仅文本、gate | 对已有 sourceBinding 增加 `studentScope:{fieldKeys,intents,enrollmentStatuses?}`；真实案卷仍由原 `compileD2RuntimePlan` 编译 |
| 校园卡 scenario | 明确 1 个、唯一 campus-card | 保留原样；学籍可声明 `scenarios:[...]` 多个并发合法分支，通过现有 `previewDemo` 各自展开、按 checkId 去重，再按字段绑定 |
| 混淆检查 | 49 项都可能回退 case-scope，0 subject/target | 学籍字段审查中，未显式 `studentScope` 的整案责任必须有至少 12 字符 `caseScopeJustification`，否则 `D2_STUDENT_UNSCOPED_CHECK` |
| 动态选择 | 对学生声明无绑定 | 同一已选择字段上，意图不匹配或无可信状态 → `unknown`；可信状态不匹配 → `not-applicable`；匹配 → `applicable`，门禁约束回执 |
| 校内事实 | caseFields 可装任何申请陈述但没有权威 | 新 `trustedStudentSnapshot` 是独立显式参数、来源标记 `controlled-synthetic`、sourceId/snapshotVersionId/current + 同学籍主体；拒绝其他来源/撤销记录；进入固定计划摘要 |
| 证据复用 | 既有 `EvidenceLink` 已有 subject/documentVersionId/fact，`evidence-any` 精确求值 | 受限 `d2:student:<fieldKey>:<fact>` 声明 + 逐 Subject 人工确认有效版本；使用原 `setEvidenceLink`、`validateD2GuardSubmission`；一证两字段为**两条分别审核的关联** |
| 执行 | 原 `Pi` RuleSpec/Case/Run | 同一条 Pi 服务路径，schemaVersion=2 用于 student；R0 无学生的计划维持 schemaVersion=1 |
| 结构化关系 | 高级 advanced 不可无损映射则 `D2_UNMAPPED_ADVANCED` | **仍拒止**，受限一证两事实≠任意知识图或合法性已认证 |
| 权限/政策 | 未核 C01/C02/C03；学院/学籍主管部门决定不属于 Pi | 不变；只能合成技术预审，所有正式决定仍待主管部门。 |

## R1 准入不变量
1. 无匹配字段责任或 target 无对应 Check：错误而非空成功；未知状态不得转为 `not-applicable`、缺件或 `compliant`。
2. 不允许普通 caseFields、学生上传 PDF、Pi 推断自动变成校内可信记录；真实学籍系统接口**未实现**。
3. 可信快照在本轮**只能是受控合成 fixture**，并非经身份认证的真实校务连接。 `sourceKind` 和 ID 是技术合同校验，不是密码学来源证明。
4. 证据仅在同 Subject、对应 fact、有效 documentVersionId、且审核员 user 确认并为当前检查引用时被有限认可。只能认材料的技术佐证，不确认签发机关真实性。
5. 未核政策的 mapping `authority=unverified-policy`；审批权限仍在人的治理流程；`material.provider=authority` 不能自动被认定为通过/申请人缺件。
6. D1 作者修订、D3 bundle digest/锁和 D2 plan fingerprint 各自仍使用原储存/读取机制；计划 schema 2 不能静默伪装 schema 1。
7. 拒绝任意图关系、额外不识别的高级条件和混合不合法对象；不创建第二审核服务。

## 实施源码
- `packages/shared/src/types/review-d2.ts`、`review-authoring-v1.ts`
- `apps/electron/src/main/lib/review/review-authoring-v1.ts`
- `apps/electron/src/main/lib/review/review-d2-runtime.ts`
- `apps/electron/src/main/lib/review/review-d2-execution-gates.ts`
- `apps/electron/scripts/review-d2-plan.ts`
- `apps/electron/src/main/lib/review/review-d3-r1-student.test.ts`

**尚未实现的内容**：完整 G01 13 分支的业务条件、学校注册数据真实可信适配、权威政策真实性、法律文书签发核验、P0-P7 到真实审批工作流的转换、任意 advanced 多向 Claim 图、B r02 28 案联动及 Gold、线上模型准确性。
