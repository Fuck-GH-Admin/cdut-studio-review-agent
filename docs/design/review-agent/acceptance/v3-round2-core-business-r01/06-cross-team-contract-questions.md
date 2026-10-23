# 06｜2A 对模板组、执行组、批次组与 2D 的跨组合同问题

固定证据：`8989941b6fb5651564e32d11c4215b6a6d5a5209`（main）、`c2f965d29022a42b3c32d6a4cb73aa8fd542329b`（D4 W1）、`db0284879f75ce123b5d83cb6577a3cc7ad057da`（P06 R03）、#134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`。本文件不替代 2B（模板）或 2C（运行）的独立审查；提出具体的生产接口问题、验收输入和阻断条件。

## A. 向 2B：模板/编译（TPL-03、TPL-05）

| ID | 需要对方确认的接口合同 | 2A 观测与冲突 | 不通过条件 |
|---|---|---|---|
| TPL-03 | D2 `runtimePlan.fingerprint`、`templateId@version`、`subjects`、`reviewRules`、plan-locked check 由谁写？当 V1 申报材料刷新时，哪些字段可投影，哪些绝不允许改？ | D4 `projectedCase(...,fixedD2)` 冻结 rules/subjects；P06 同名函数无此分支。[`apps/electron/src/main/lib/review/workspace-service-v2.ts:22`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/workspace-service-v2.ts#L22) vs [`apps/electron/src/main/lib/review/workspace-service-v2.ts:22`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L22) | 对已有 D2 Plan 的 V1 同步导致 Check/Subject 隐式变化 |
| TPL-05 | 已冻结模块升级时 Check 删除/责任变化/来源变更是否要求签收 ACK？在审案如何继续引用老版本及报告？ | V1 `reviewTemplate` 可由 UI 修改并向 V2 投影，且 `upgradeLegacyComprehensiveTemplateAssignment` 特判内置 v2→v3；[`apps/electron/src/main/lib/review/workspace-service-v2.ts:218`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L218) | 自动更改已开案正式责任且未记录原因/历史引用 |
| CASE-03 | 多 Subject 的字段校验使用 template schema、reviewer-form snapshot 还是 D2 plan target 作为 Main 权威？ | D4 `review-d4-field-form.saveD4ReviewerForm` 写 V1；`assertD4ObservationScope/assertD4EvidenceLinkScope` 受 V2 Plan 影响；[`apps/electron/src/main/lib/review/review-d4-field-form.ts:62`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-field-form.ts#L62) | 同案两个业务对象的字段/证据相互污染 |

2B 请交出 `schema_owner→allowed_mutation→lock_revision→error_code→test_name→SHA` 矩阵；不能仅回 “遵循冻结原则”。

## B. 向 2C：运行/证据/SourceRef（RUN-04、RUN-07）

| ID | 必答问题 | 2A 证据 | 反例门禁 |
|---|---|---|---|
| RUN-04 | Agent 输出 Observation 候选与人工已确认 Observation 的**生效优先级**如何定义？`latestObservations` 依据 timestamp 会拿到后来的 AI 候选，何处保证人工不被覆盖？ | [`apps/electron/src/main/lib/review/evidence-service.ts:13`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/evidence-service.ts#L13), [`apps/electron/src/main/lib/review/evidence-service.ts:47`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/evidence-service.ts#L47) | human confirmed 后再次 AI 提取仍被当最终事实 |
| RUN-04 | `SourceRef` 不仅有 docVersionId，是否由 Main 校验真实 `caseId/parseRevision/blockId/contentHash/归档状态`？ | `use-review-workspace-actions.sourceRefsFor` 只是 Renderer 以 quote 猜块或退化 file；[`apps/electron/src/renderer/components/content-review/use-review-workspace-actions.ts:25`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/renderer/components/content-review/use-review-workspace-actions.ts#L25) | 假页、跨案、归档、同名不同物理源 |
| RUN-07 | 正式 readiness 基于哪一个不可变 Run 输入？什么状态算 complete？历史 `run@rev` 如何显示而不会形成正式结论？ | [`apps/electron/src/main/lib/review/workspace-business-service-v2.ts:271`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-business-service-v2.ts#L271), [`apps/electron/src/main/lib/review/stage-workflow.ts:171`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/stage-workflow.ts#L171) | 旧 Run、零有效规则、partial with missing checks 被误判 pass |
| RUN-07 | `run-store-v2`、D2 Plan、ReviewCaseRevision、模板版本、归档 docs 之间的 invalidation 原子事件由哪个进程提交？ | `isWorkspaceRunStaleV2` 运行时算 input hash，V1 `input-invalidation` 另行清派生产物；[`apps/electron/src/main/lib/review/workspace-business-service-v2.ts:358`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-business-service-v2.ts#L358) | 内容变了却仍引用旧 run 判 pass |

2C 交付 `source_version_identity` 和 `run_provenance` 结构合同、强制拒止的测试与失败注入结果，确认 2A 不负责验证 Pi Provider 真调用。

## C. 向批次/P06（BAT-03、BAT-04、BAT-06）

| ID | 问题 | 已知事实 | 拒止标准 |
|---|---|---|---|
| BAT-03 | D4 文件批次导入和 P06 审核批次如何命名/关联？一个案卷多个材料导入批次与多个审核运行批次如何保存不同 id？ | D4 `review-d4-case-batch.applyD4CaseBatch` 使用 V1 `updateCase`，P06 `batch-store` 是已有案卷执行态；[`apps/electron/src/main/lib/review/review-d4-case-batch.ts:46`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-case-batch.ts#L46) | 混淆“材料已导入”与“审核已完成” |
| BAT-04 | 系统自动正式决定的政策开关是否每批锁定、每请求事务内再次验证模板、Run、授权撤销？ | `assertAutomatedWorkspaceDecision` 根据 batch-auto actorId+revision 检查、`checkAutoBatchAction`；[`apps/electron/src/main/lib/review/workspace-business-service-v2.ts:225`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-business-service-v2.ts#L225) | 普通 Pi 报告/后台 done 直接签校务决定 |
| BAT-06 | 同案跨批 Run 身份绑定是 `batchId + entry.runId + template lock + input hash` 哪些键？R02 独立 provenance 文件取消后 R03 内联行为是否对所有历史空字段一致？ | #133/#134 指出 R02→R03 分叉，R03 内联非可认定等价；[`apps/electron/src/main/lib/review/review-ipc.ts:760`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L760) | 批 A 用批 B 的 run 结束；空 runId done 被信任 |

要求 2C/P06 提供旧 R02→R03 的测试对照，至少 `same case + same template + different batch run`，恢复后的 stale pointer 清理和撤权后重复提交。

## D. 向 2D：唯一写权与用户体验冲突裁决

1. **CASE-01/02**：是否把 V1 表单实体转换为 V2 声明输入事件？如果转换，哪些 legacy `case.json` 仍读写、由谁持有 mutation ACL？必须给字段级 schema 和双读回归，而不是口头宣告 V2 唯一真值。
2. **CASE-03**：D4 Plan 固定对象和 V1 `items` / P06 投影的冲突怎么消解？固定 D4 的 freeze 分支不能丢。
3. **CASE-04/05/06**：人工确认值与 Agent 候选的有效性、归档材料/Check/Run 全链撤销合同明确为何者；revision 双增量怎么驱动 UI？
4. **CASE-07/08/09/11**：本地 reviewer、校方 teacher、student、judge 的真实身份边界。尤其 P06 `RESOLVE_APPEAL_V2` 在 IPC 强制绑定 reviewer，但 service 要求 teacher：[`apps/electron/src/main/lib/review/review-ipc.ts:721`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L721), [`apps/electron/src/main/lib/review/stage-workflow.ts:322`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/stage-workflow.ts#L322)。不得以伪造 renderer actor “修复”；必须有校方授权或显式不可用 UI。
5. **UI-01…UI-06**：保留三栏原件联动、V2 事务错误/回执、补件/评分/申诉、批次异常处理、模板向导；合并入口时先写“控制器/页面/行为/回执/迁移”矩阵。不要重造多个互不一致的“案卷已完成”状态。
6. **EXT-01**：学校外部出站究竟采用哪种协议、是否授权、如何持久 idempotent actionId 与**真实** externalRevision/Receipt？`external-ports.ts` 仅 mock/local package；不得把 MockSchoolAdapter 的 accepted 当实发。[`apps/electron/src/main/lib/review/external-ports.ts:29`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/external-ports.ts#L29)。
7. **历史回滚**：兼容期任何删旧实现的候选必须给 `old input→new object→reverse/read-only replay→historical report` 检测和失败行为。

## E. 问题优先级与交接输出

- **P0 阻断选型**：两分支同名 `review-ipc.ts` 与 `workspace-service-v2.ts` 的函数级冲突（特别 D4 fixedD2）；Renderer 业务 Actor 入站验证；教师申诉入口；Run finality 真假；跨 V1/V2 写入中断恢复。
- **P1 阻断高级能力退役**：投影与归档、人工观察优先级、评分轮次+回避、离线按角色脱敏、跨批 Run 绑定、历史报告可信度。
- **P2 产品体验对齐**：三栏/案卷管理双入口、文件来源导航、窄屏、模板向导和批次异常提示。

每个问题必须由主责组返回：固定 SHA、源码函数、实际负例、结果码、可追溯执行工件、如果没跑则 `BLOCKED`。**2A 不授权任何人直接删兼容或开始 V3 生产重构。**
