# 05｜模板—案卷合同冲突与 V3 统一接口待裁决

本报告是 2B 提交给 2D 的**问题定义与证据，不做 V3 代码改造**。W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`，main `8989941b6fb5651564e32d11c4215b6a6d5a5209`，P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`；D4 与 P06 不能视为同一 HEAD。

## 一、必须保留的独立权威边界

| 对象 | 现有作者/读者 | 权威写入应属谁 | 当前冲突/缺口 |
| --- | --- | --- | --- |
| 业务原文责任和政策引用 | D1 `ReviewAuthoringWorkspaceV1` / `sources` / `sourceBindings` | 作者态版本化存储，发布必须是独立授权流程 | 源文件 SHA 只是来源固定，不等于规章有效、责任覆盖或正式授权 |
| 冻结共享模块 | D3 `moduleId@version+digest` 和锁/依赖图 | 模块资产仓库，消费者锁定确切版本 | 新版本升级支持作者 workspace 差异，未证明旧案 ReviewRun/Outcome 影响完整 |
| 可执行计划 | D2 `D2RuntimePlan.fingerprint`，subject/rule/check/source/gate 映射 | 唯一案卷 aggregate 附件、不可变，明示版次 | `createD2TechnicalCase` 先 create V2 aggregate，再 attach Plan 两事务；部分失败须恢复，不得假装一个原子操作 |
| 真实案卷信息 | V2 `CaseAggregateV2` 与 D4 旧 `ReviewCase` | 未来只能有一个业务事务权威写入口；其他一律投影或兼容 read DTO | D4 `createD4ClientCase` 在 V2 aggregate 之外写 legacy metadata / staged documents；任一边失败时跨存储一致性无法凭单测推定 |
| 审核员输入字段 | `D4ReviewerFormSnapshot`、`FieldValue` | Subject 下被确认的事实与表单配置分离 | 当前 reviewer 可以配置已冻结字段，不能因此反写 D1 author schema；required 配置 ≠ 校规正式必填 |
| 来源和证据关系 | DocumentVersion/SourceRef、Observation、EvidenceLink、Check finding | Main 可信材料索引 + 主案卷命令事务 | 模型 Office 临时 `fileId` 与 V2 `documentVersionId` 非同一身份；parseRevision、blockId、Subject、引用/quote 与旧结论失效必须联合验证 |
| 运行/覆盖 | D2 Verify、Pi RunV2、`coverage-ledger`，P06 BatchRun | 审核运行存储只对确切案卷/计划/Run 与授予的权力有效 | 暂存/材料导入批次不能充作审核执行批次；同一案跨批不同 Run 严禁旧 receipt 复用 |
| 正式审批 | 有权人员/学校业务系统、stage workflow | 授权业务命令/SchoolPort，不是模板或 Agent | 候选模板 `publicationAllowed=false`；自然语言摘要、合成合规 Check 与 Pi ACK 都不是正式行政决定 |

证据：[review-authoring-v1.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-authoring-v1.ts)、[review-d2-runtime.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d2-runtime.ts)、[review-d3-upgrade.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d3-upgrade.ts)、[review-d4-client.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-client.ts)、[review-d4-field-form.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-field-form.ts)；P06 [case-store-v2.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/case-store-v2.ts)、[pi-case-review-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/pi-case-review-service.ts)；main [coverage-ledger.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/coverage-ledger.ts)。

## 二、按实际调用方向拆解四类不一致

**A｜作者定义 vs 冻结执行**。D1 的 sourceBinding 可以表达原文来源、资格与意图；D2 只对明确可映射的 Gate/Check 提供可执行含义。复杂 Claim/Evidence 关系抛 `D2_UNMAPPED_ADVANCED`；正确做法是保留待开发责任和人工路线，而不是转成模糊的“综合核验”。COMMON primary/conditions 最多各 13，G07-T01 BR-13…22 只保留语义描述，没有结构 gate。2D 需确定 `obligationId, authoredCheckId, executableCheckId, subjectType, applicability, sourceAuthority` 的不可丢失映射。

**B｜案卷事实 vs 表单定义**。D4 `saveD4ReviewerForm` 把 form snapshot 通过 legacy `updateCase` 写入，不同于 D2 在 V2 aggregate 保存 Plan。运行时 `assertD4ReviewerFieldValue` 依据 case/subject/plan fingerprint 校验数字、枚举、日期；若没有快照，它直接返回，不代表全局类型约束已经有唯一权威。V3 必须由 Plan 定义稳定字段 schema/版本，审阅 UI 配置只能在被允许范围内加呈现约束。

**C｜材料源证据 vs 运行结果**。`assertD4ObservationScope` 明确拒绝跨案 SourceRef、过期 parseRevision、非 active role 和无匹配坐标；`assertD4EvidenceLinkScope` 必须精确 Subject 支持范围。但坐标为 `location.kind=file` 时无法提供 PDF 精确页文字引文；必须在引证精度中表示其事实等级，避免“存在文件”冒充“有文字证明”。替换原件后如旧 EvidenceLink/Run仍可对外展示，必须按版本影响显示过期，不得仍被判已确认。

**D｜两份源码树的桥接**。D4 W1 修改 `review-ipc.ts`、legacy case store/input；P06 R03 的严格工具/Run/Batch 也独立修改 `review-ipc.ts` 和 V2 case store。第一轮记录两支 diverged，不能通过把某一支整体覆盖另一支来做统一接口。2D 应输出三向函数级冲突表 main/D4/P06 和迁移选择，由单案命令事务统一管理，而非建第二个 V3 案卷数据库。

## 三、2D 需要正式定稿的合同列表

1. **TemplateAssetV3**：`templateId/version`、原文 bytes hash/定位、每项责任ID、源权威/生效信息、authoring digest、冻结模块及依赖锁、发布状态/审批日志、迁移映射。输出冻结 artifact 不改已在审案件。
2. **CasePlanInstall**：以 `caseId+expectedRevision+requestId` 安装 immutable plan，包含 `fingerprint`、每一 source obligation 到 Check/Subject、unknown/cross-object gate；失败事务不生成可运行案卷，允许显式安全重试。
3. **Subject/FieldSchema**：稳定 Subject key、业务类型、字段种类、选项、必填/可空/unknown、来源 authority、验证约束与 schema 版本；动态操作 ID 与对象 ID 不能混淆。
4. **MaterialIdentity/SourceRef**：案卷ID、documentVersionId、原件 digest+size、parseRevision、blockId、精度化 location、quote/excerpt hash、active/archived状态、OCR/vision置信与人工证实标识。Office `fileId` 只是 parser 内部身份，需显式映射。
5. **Observation/EvidenceLink**：subjectId、factKey、sourceVersion/locator、confirmedBy、版本化可撤回、复用策略；同份证据多 Subject 必须分别声明依据和权限，不得按文档 hash 自动跨人复制。
6. **InvalidationImpact**：凡是材料替换、来源 rev 改变、模板升级删除或变更 Check、Subject 属性更改，列出旧 Observation/EvidenceLink/CheckRun/Outcome 哪些转 stale、哪些可直接沿用、哪些要人审签回。
7. **Coverage+Run**：计划快照/RunID/批次ID/owner及授权轮次、文档已读块/页、Check 分母、unread/failed/partial/unknown；不得接受没读材料或零有效 Check 的“全部符合”。

以上是合同议题，不意味着现有类型已实现这些字段，也不允许未经校方原文批准就添加新的业务规则。最终持久化所有权由 2A/2C/2D 共同裁定。

## 四、保留 / 重构 / 退役的边界

- **保留实现思想与负例**：D1 作者来源链接、D3 digest/循环/升级删 Check ACK、D2 immutable Plan、COMMON unknown/source gate、D4 主进程 token+原件 hash，P06 最小工具授权，Office71 双源隔离。
- **重构接缝**：D1 / D4 field schema、D4 legacy `case-store` vs V2 command、SourceRef vs Office anchors、材料替换到 Run/Decision 失效传播、D4 产品界面→V2 单一案卷。
- **不继续产品化**：D0.5 独立演示业务状态机、基于两类 SIGNALS 的“普适”自动路由、虚构 run@rev 或候选草稿自动发布。其合理 UX/安全反例可保留。
- **未确定**：是否需要新增 API，具体 event schema/事务机制应以 2A/2C 的真实调用链最终选择为准。**不得以重写 V2 案卷为前提强迫模板接线。**

## 五、接口冲突优先验证清单

`CasePlanInstall × CaseCreate` 的中断恢复；`SubjectFieldSchema × D4ReviewerFormSnapshot` 的跨版输入；`SourceRef × Office fileId` 同名跨案；`DocumentVersion archived × EvidenceLink × Run` 的旧结果失效；`D4CaseBatch × P06 BatchRun` 的来源/幂等混用；`unknown × business decision` 的错误提升。这六项是 2D 必须给出输入/输出、写入边界与拒绝码的最小合同集合。
