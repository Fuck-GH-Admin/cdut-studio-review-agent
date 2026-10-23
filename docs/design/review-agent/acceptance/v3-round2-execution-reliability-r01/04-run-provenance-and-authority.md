# 04｜Run 来源、批次绑定与正式决定权威链

**审计发现（源审查而非利用验证）**：R02 的显式双指纹 `(runId,runInputHash)` 到 R03 变为 `runId` 加实时案卷哈希门禁。当前主要服务仍 fail closed，但**不满足“行为完全等价”的静态证明**。另一个风险是批次定稿公共门禁只核验 Case 有正式终态，没有再次将该终态决定绑定到 **本批次 entry.runId**。需用专项负例验证授权边界，不直接定性为可达权限漏洞。

## SHA 与结构差异：R02 vs R03

| 关口 | R02 `c2378988...` | R03 `db028487...` |
|---|---|---|
| BatchStateV2.cases | `runId?:string` + `runInputHash?:string` | `runId?:string`，**去除** `runInputHash` |
| provenance helper | `batch-run-provenance.validateBoundBatchRun(batch,entry,run)`：ID、模板、manifest、`run.inputManifest.hash===entry.runInputHash` | 删除 helper；在 `batch-automation-service`、group、UI 各层按绑定 runId 查询并检查 identity/staleness |
| auto decision | 以双绑定 helper 返回的 Run 为数据源 | 确保 live entry 仍 done、live runId==entry.runId，`getRunV2(entry.caseId,entry.runId)`，`isWorkspaceRunStaleV2`；业务事务按 runId/inputHash 再验 |
| legacy `done` | 无任一绑定拒绝 | 无 runId 直接略过自动处置，不能套 latestRun；允许显式手动重试 |
| 存储/材料改变 | hash 双绑定 + 当前事实检查 | Run inputHash 当前重算；保留 V1→V2 文档顺序兼容 |

**R02 固定证据**：[helper 源码](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c23789882aabf18689c314c77c270ac4a8ae4729/apps/electron/src/main/lib/review/batch-run-provenance.ts) blob `17dfbf55580228e5f5045f6f5704841e4b80e23c`；[专项负例](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c23789882aabf18689c314c77c270ac4a8ae4729/apps/electron/src/main/lib/review/batch-run-provenance.test.ts) blob `1f0c2730c9e64dfbd03dea518f0117c3202067cb`；`review-v2-contracts.ts` blob `a0a009331859694bcd432ac5707f228c200ffc8a`。

**R03 固定证据**：[batch-automation-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-automation-service.ts) blob `4779a746eb18ce144fc991af4eb468ea20085fbe`；[workspace-business-service-v2.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-business-service-v2.ts) blob `ec27b393618d96102ff9195fa1f036d82625c3fb`；`review-v2-contracts.ts` blob `0dab952671356bbb9abbc356cb51a608272bcddd`。

### 需证明的不变量（BAT-05/06/08、RUN-04/07、CASE-06/07）

1. `entry.status=done` 不代表有效 Run：必须同时有稳定 `entry.runId`，Run 中 `caseId`、template+policy lock 和当前输入相符，`status=completed` 且覆盖/来源充足。
2. 同案跨 A/B：A 不能取 B 的新 Run，即使 T+版本完全相同、B 比 A 更新且检查全符合。R03 对“旧 Run 被当前新输入 invalidated”会拒止，这是合理的，但不等于“本批冻结时的输入”有独立可核验证据。
3. Run 的 `inputManifest` 是审核输入事实，不是模型自声明；材料 `versionId+contentHash+parseRevision`、规则、观察和用户确认变更后旧 Run 显示“历史/已失效”，不能被新批准。
4. 逐 Subject 审查 `recordWorkspaceSubjectAdjudicationV2` 和待办 `recordWorkspaceDispositionV2` 都绑定真 `runId,inputHash`，AI opinions 一律 `verification=unverified`，模板或条件未知不可隐式 pass。
5. 正式 `decideWorkspaceCaseV2` 有 revision CAS、actor 来源、策略/人工作业门禁。`pass`、`partial-pass` 需 readiness+逐 Subject 认定；`return` 要具体 requiredElements 与原因；`D2` 技术预审禁止形成行政正式通过。
6. `finalizeBatch` 保存快照并 hash，复入相同 hash 幂等、异 hash 拒绝；历史没有快照不能用当前数据补造。**但现有 `assertBatchBusinessReadyForFinalization` 没有把 `finalDecision.basedOnRunId` 与 BatchCaseEntry.`runId` 作强等式核验**，对于同案跨多个批次/旧 `done`，应补反例与策略判定。不能因为决定是当前 Case 有效终态，就自动声称“这个 Batch 的 Run 导致该决定”。

## 可能形成实际异常的候选组合（全部未复现）

- **P1 候选：finalize provenance**：同案 X 在 Batch A 为历史 `done`，随后 Batch B 重新审并基于 Run B 完成 Case 正式决定；调用 A 的底层 finalize，源码看其只验证 A 的 `done` 与该 Case 最终决定存在，**不显式比较 A.entry.runId 与 final.basedOnRunId**。是否真的能写出不正确 Batch lineage 取决于调用者、完整 snapshot、stage、policy lock 等联合门禁，本轮无测试，标 `UNVERIFIED_HIGH_RISK`。
- **P1 候选：自动批准 gate 绕过本批 runId 关系**：`workspace-business-service-v2.assertAutomatedWorkspaceDecision` 用 `batch-auto:<batchId>:<revision>` 恢复授权，`checkAutoBatchAction` 检查 Case 在该批中 done，**未将它绑定到 gate 所见 Run.id**；外层 `runBatchAutomation` 已做 live runId guard，但内层事务防绕过的完整性尚需测试。从本地受控 service 直接调用并不代表 Renderer 或普通模型可获得 system actor；因此只能记“纵深防御缺口候选”。
- **P1 候选：outbox 双阶段收据**：Case CAS 决定成功但 `appendReceipt` 磁盘满/进程崩溃，Batch automation receipt 缺失；同 requestId 重放理应靠 `submitCommand` 幂等，但跨 PID、记录损坏、外部发送确认要各自证明。即使 SchoolPort 回 `accepted`，必须校验其 `kind=school` 与受授权真实系统回执，mock/offline 不能抬级。

## RET-02：合成 `run@rev` 的过渡语义

第一轮/第 1.5 轮已把 `run@rev` 虚拟终审来源标成 RET-02（`UNNECESSARY`/重做真实来源）。当前 `stage-workflow.ts` 是兼容历史阶段决定，现代 `workspace-business-service-v2.assertCurrentRun` 要求 `getRunV2(caseId,runId)` 取得真实 Run 并对齐 inputHash。**不应静默把旧合成 ID 认作新 V3 可采信的 Run**；需与 2A 协定只读展示/迁移策略、旧决定失效标记、显式人工复核，不伪造通过。

## 候选只作为 2D 集成输入

可讨论 `RunEvidenceIdentity{caseId,runId,templateId,templateVersion,inputHash,policyLock,sourceVersionHashes}` 和 `BatchAttemptIdentity{batchId,caseId,attemptId,boundRun}`，并在 Case/Batch/人工决定之间规定统一校验合同；但是否增加实体层、以哪个服务实现由第二轮集成决定，**2C 不修改生产架构**。
