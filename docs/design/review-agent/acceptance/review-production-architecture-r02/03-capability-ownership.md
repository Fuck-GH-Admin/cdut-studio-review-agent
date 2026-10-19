# 03｜目标能力所有权、接口与阶段边界

源代码固定快照：D4 W1 `f77441cee6771090c0fac05a7643372922975157`；P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`。本表是**推荐架构**，并非宣称已经实施。

| 能力 | 唯一应有 Owner | 保留实现及证据 | 其他模块只可承担 |
|---|---|---|---|
| 审核 Case ID、标题、申请与对象权威 | V2 CaseAggregate + Command service | `case-store-v2.ts:21-165`; `application-service.ts:91-159,214-327` | Renderer 视图；V1 只读迁移适配；批量引用 caseId |
| 业务状态、人工裁定、补件、终审 | V2 workspace/business service | `workspace-business-service-v2.ts:44-316`, `stage-workflow.ts` | UI 发经过验证的命令；Pi 只提供建议，不能伪造 reviewer/school |
| 模板定义、版本发布、作者权限 | TemplateStore + PolicyStore（明确候选/正式状态） | `template-store.ts`, `policy-store.ts`, D1 `review-authoring-v1.ts` | D4 catalog 提供候选索引；Run 只读取已锁定版本 |
| 模板模块、来源哈希、语义依赖 | D3 frozen library / lock validator | `review-d3-module-library.ts:92-245`, `review-d3-workspace-locks.ts:17-76` | D2 读取锁；不能代替学校政策审定 |
| 责任实例化、条件与适用性 | D2 RuntimePlan compiler | `review-d2-runtime.ts:137-311,358-392`; `review-d4-common.ts:7-77` | Renderer 表单收集真实选择，不能虚构条件；Pi 不重新编规则 |
| 当前事实与 SourceRef / EvidenceLink | V2 DocumentVersion + Observation/EvidenceLink command | `material-service.ts:86-256`, `application-service.ts:248-324`, `case-store-v2.ts:111-165` | D4 作 subject/plan-specific 二次门禁；Pi 只按授权提供引文建议 |
| 文件来源、解析修订、真实原件位置 | Main-owned material/import/preview service | `material-service.ts`, `document-service.ts`, `source-index.ts`, `document-preview-path.ts`; Office #71 需复测 | D4 picker 仅可信选择和 staging；Renderer 不可授权 arbitrary path |
| 单案 Run ID、输入清单、状态机、幂等取消 | **新的单一 ReviewRunService 合约**（吸收现有 V2 run store 与业务校验） | `run-store-v2.ts:23-97`, `run-service-v2.ts:28-232`, `pi-case-review-service.ts:280-311,448-523` | 各执行器只返回节点/检查结果；Batch 不再创建第二个 Run 语义 |
| Pi 模型执行、会话 Owner、工具与停止 | AgentSessionManager/AgentOrchestrator + 薄 ReviewPiAdapter | `agent-session-manager.ts:474-487,636-659`; `agent-orchestrator.ts:1315-1337,1562,3473-3495`; `review-pi-run-bridge.ts:23-104` | 不拥有 CaseAggregate、TemplateVersion、BatchStore、school decision |
| 异步/运行图引擎 | 单案 Run 的执行模式适配器 | `run-async-service.ts:73-200`, `review-run-graph.ts:73-222`, `v2-executor-factory.ts` | 不自建第二份业务终态/权限判定 |
| 多案调度与进度、跨案归组、补件回流 | BatchStore/BatchScheduler | P06 `batch-store.ts:84-318,511-607`, `batch-group-action-service.ts:76-267` | 复用单案命令，保存 case/run binding，不能替代 Run 所有者 |
| 学校对接授权、出站投递及重试 | SchoolPort + durable Outbox | P06 `batch-store.ts:320-498`, `external-ports.ts` | Renderer 只发申请，不能直接宣称“学校已审批” |
| 用户导航与三栏工作台 | 一个 ReviewWorkbench | `ContentReviewView.tsx:66-365`, `CenterPanel.tsx`, `LeftPanel.tsx`, `RightPanel.tsx` | V2CasePanel 功能内移为局部 tab/card，不再另建“V2”工作站 |

## 推荐协议形状（仅设计，不修改源码）

`CaseService.create/update/get/list`: 返回唯一 `CaseAggregateV2` 的业务视图；旧案由一次性迁移/可重放事件上载，记录 legacy pointer 和兼容 digest。

`TemplateService.resolveAuthoring/compile/lock`: 只输出已注明来源/版本/适用性/权威类型的 `D2RuntimePlan`；单案 Run 只能消费固定计划，不从作者态猜业务字段，更不把技术预审视为学校审批。

`ReviewRunService.prepare/start/submit/cancel/resume/get`: 唯一 Run ID；需要 `caseId`, `expectedRevision`, `templateDigest`, `documentVersionIds`, `assignment/owner`, `initiatedBy`；输入固定后产生 immutable manifest 与 audit receipts。任何 executor 必须按这个 Run 提交，不能自创另一套有效结论。

`ReviewPiAdapter`: 输入已授权 Run + session policy；输出启动/停止/受限工具/进度事件。隐藏仅应改变投影/展示，不能隐藏或改变真实 Run 归属、材料读取记录、审核授权。

`BatchScheduler`: 使用 `ReviewRunService.start` 完成单案运行；保存每个 `caseId ↔ runId ↔ template version ↔ input hash`；补件后明确 requeue 并重新校验。只在单案终态满足条件时做批次定稿和学校 outbox。

## 不允许破坏的六条不变量

1. 旧案文件、旧 Run、关联及正式审计记录可追溯；新增 schema 使用显式迁移版本与一次性/双阶段写入保护，迁移失败不可删旧档。
2. 当前 SourceRef 绑定 `caseId/documentVersionId/parseRevision/location`；旧版本/错案/错页/未读取不得转成有效证据。
3. 模板源、依赖及当前 RuleSpec 都锁 digest；未经核准候选只可技术预审。
4. Pi 工具权力按真实 assignment、Main owner 和 run 检查；不能从普通 Renderer 伪造 owner；删除后保留身份栅栏。
5. 审核建议、审核员判定、学校正式审批分开；batch “done”不等于学校已批准。
6. SchoolPort 出站满足明确的业务授权、可复核最终决定、持久 actionId 幂等和失败恢复，绝不自动默许。

## 路线建议

先冻结证据和契约，补完全量分支血缘及实例迁移回归；然后做影子读对比和共享 Run manifest；随后把 Renderer 创建/编辑逐功能切向 V2 服务；最后废止 V1 可写入口与 V2 独立 UI。**不是先删文件，再让测试兜底。**
