# 03｜Batch 与单案：共享能力与事务边界

固定对照：D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`；P06 R02 `c23789882aabf18689c314c77c270ac4a8ae4729`；R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`。本轮静态阅读，相关测试源码已检查但**未执行**。

## 对象身份及状态归属

| 对象 | ID 与所有者 | 冻结与运行 | 禁止混淆 |
|---|---|---|---|
| CaseV2 | `caseId`，`case-store-v2`/业务命令事务 | 当前案卷模板、材料版本、业务任务、人工决定、revision | Case ≠ Batch；Case 可以被多个 Batch 引用 |
| ReviewRunV2 | `caseId/runId`，`run-store-v2` | template/policy/doc manifest、inputHash、checks、coverage、terminal | Run 完成 ≠ BatchCaseEntry done ≠ approval |
| ReviewBatch | `batchId`，`batch-store` | 固定 templateId/version、policyVersionLock、caseIds、round、automation revision | Batch 冻结与 Case 输入版本不是同一件事 |
| BatchCaseEntry | `(batchId,caseId)`，`cases[]` | queued/running/done/failed/paused、绑定的 `runId` | **同案跨批不能凭最新 Run 推断归属** |
| Batch triage | `batch-review-triage` 只读结果 | technical-exception/manual/auto candidate/awaiting | auto candidate **不是正式通过** |
| 按组人工操作 | `batch-group-action-service` + `operationId` | previewHash、逐案事实检查 + Command CAS | 相似问题不能推断相同合法处置 |
| 正式决定 | `case-store-v2` 业务事务 | `basedOnRunId`, inputHash, reviewer/system grant, revision | 批量 panel 的勾选不等于决定权 |
| Outbox | `sync-outbox/{actionId}.json` | 原载荷、actionId、外部版本、最终 receipt 或 pending | 本地业务决定不等于学校 accepted |

## D4 的批量材料输入 ≠ P06 审核批次

- [D4 `review-d4-case-batch.ts` @W1](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-case-batch.ts) blob `39a50f54730cb96be83c88c2595ec75fb5d7b51a`，针对**一个案卷的多文件** append/replace、授权 token、revision、版本归档、崩溃 journal、duplicate 和 staging。 [测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-case-batch.test.ts) blob `4f790ef3b1b5ce39eeedbf333a471af98be27a18`（361 行）。
- [P06 `batch-store.ts` @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-store.ts) blob `afab66ebaa38324fc2c886a0eee62c4752a25157`，针对**多个案卷的审核调度/结果/人工业务事务**，持久 Batch 与每个 Case 的 Run identity、问题、补件回流、最终定稿及 Outbox。[测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-store.test.ts) blob `8775e169c58bace94751fbcd96e3cee646f4278b`。
- 互补关系：D4 附件批次应产出当前案卷文档版本/哈希；P06 审核批次引用已定稿的 Case 与 Run。两边应**复用稳定身份、版本清理、异常/重试语义**，但不能共用一个名为 Batch 的状态文件而抹平资产导入与业务审批交易。

## 批量运行链与事务

```text
CREATE_BATCH_V2 / configureBatchAutomation
   └─ ReviewBatch(template + policy lock + caseIds)
RUN_BATCH_V2 → batch-store.runBatchQueue
   ├─ per-case queued→running (清空旧 runId)
   ├─ pre: assertBatchCaseTemplateLock(batch, case, current CaseV2)
   ├─ run-async-service.assembleAndRunReview(caseId)  [同单案图]
   ├─ post: assertBatchRunTemplateLock; classifyBatchRunCompletion
   ├─ per-case done(runId) | failed(runId?,error)
   └─ batch state queued (待业务决定), 不自动 finalized
        ├─ triageBatchCase → 按组 issues (read-only)
        ├─ previewBatchGroupAction → applyBatchGroupAction
        │      previewHash/CAS, per-case disposition/decision
        ├─ opt-in runBatchAutomation → gate + decideWorkspaceCaseV2
        ├─ supplement response → requeue one unambiguous batch OR explicit select
        └─ finalizeBatch → verified business decision + immutable snapshot
```

重要验证：runBatchQueue 的注入契约 `runCase():Promise<{status;runId?}>` 允许 `status='completed'`、`runId=undefined` 导致 Batch entry 物理标 `done` 而**缺失可信 Run**。后续 triage/automation/group 均有 fail-closed 路径，但 UI 不得把 `done` 本身当可采取行动的业务合格证明；建议加入强门禁和负例。

## 交叉批次危险链

**场景**：Case X + template T1 在 Batch A 中运行产生 Run A；同案另在 Batch B 中生成更新的 Run B。若按 `latestRun(caseId)` 填 Batch A，Run B 的完全合格检查可能作为 A 的审批依据。#131 的 R02 helper 专门以 `runId + runInputHash` 双绑定拦截；#132 R03 改为持久 `runId` 并从该 ID 取 Run，当前 source service 仍重算 `isWorkspaceRunStaleV2`。**最新 Run 污染已由已查阅源码中的 ID 路径避免，但与 R02 的双绑定并不逐项等价**。详情见 04。

特别留意 `retryBatchCases`、`updateCaseStatus`、补件重排清除旧 runId；多批归属的自动回流会拒绝并要求明确 `selectSupplementRequeueBatch`，而不是广播多个 Batch。历史无 runId 的 `done` 不能从当前 Case latestRun 逆向补齐。失败批次可重试，其他成功项不重跑；旧 Batch 重开建新 id，旧 Snapshot 保留。

## 分流、人工及自动化不同边界

`triageBatchCase` 静态条件包括 run.status completed、planned checks、effective verdict、doc read 和任何 execution-failed。返回 auto-pass-candidate/auto-return-candidate 是**建议**。自动事务另由 `configureBatchAutomation` 确认 + `batch-automation-gates` 正式政策、有限角色、global auto approval（pass）、无未办事项/申诉/补件、有效 SourceRef 和 `assessDecisionReadiness` 逐层校验；最终 `workspace-business-service-v2` 的 actor/CAS 重新校验。对于需人工分项最终认定、院校审批、多阶段、评分/名额等，自动通过拒止。

按组处置必须预览命中和源 hash；`applyBatchGroupAction` 处理每个 Case 的当前 revision 与 runId，写持久 operation receipt；崩溃中的未终结操作**不能自动盲重放**，要求人工检查。分组相似度只减少展示/选择成本，不能代表同一规则下作行政决定。

### 实测限制与下一轮验证

- R03 [batch-automation-service.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-automation-service.test.ts) blob `a3390c22a47555e1115add1ab59c21b0e9dfa930` 含同案更新 Run、无绑定旧 done、补件、旧输入和权限测试；本轮 NOT_RUN。
- [batch-group-action-service.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-group-action-service.test.ts) blob `78ca4014d0c44e9bd89a5ae363c827f70c6c1058`，包含同案跨批、预览后改版、人工权限、幂等；本轮 NOT_RUN。
- [stage-workflow-l02-01-idempotent-batch.p06.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/stage-workflow-l02-01-idempotent-batch.p06.test.ts) 未单独固定测试 blob；不宣称已独立复验。
- 最重要下一步：同案同时加入 A/B、同模板+不同 Run，分别测旧批 triage/group/auto/finalize，交织补件与 crash，然后故障注入 Outbox。不得真实触发学校写入。
