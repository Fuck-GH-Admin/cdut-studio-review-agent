# 03｜函数级跨分支源码与接口冲突（2D 独立复核）

本轮由 GitHub connector 在指定固定 SHA 读取函数和行范围，而非仅看 PR compare 文件名；标识为 **VERIFIED_STATIC** 的仅指函数文本和接口差异复核，**不是运行安全/产品验收**。

## 1. 四组完整源码对象的差分定位

| 文件 | D4 blob / 行数 | P06 blob / 行数 | 关键函数差异 |
|---|---|---|---|
| `review-ipc.ts` | `18a5fe737362a79292a5846eced8f92d9f2f4949` / 992 | `593774d09098fdfbd2fb11f7d6525bba819a2b05` / 992 | D4 `STAGE_D4_INTAKE`/drop/assess/apply/retry/form 与 D2 锁；P06 `START_BACKGROUND_PI_REVIEW_V2`、batch retry/automation/group 等 |
| `pi-case-review-service.ts` | `f33f1b3037330bfa04e04f06ea573ca4782a0052` / 1126 | `7683720355e06d2910b7d51c3c5b8751c6c9987c` / 1098 | D4 `promptFor` 多对象 `targets`、`compactD2MappingForPi`、已确认关联；P06 `promptFor` 使用 `d2RuntimePlan.scenario` 和旧映射描述 |
| `workspace-service-v2.ts` | `76197fa18ecafe159fc389b88bee762daf02df52` / 250 | `0c32f48adde14921918fd6c97e3d1bcb311f5fc9` / 238 | D4 `projectedCase(v1,current,fixedD2)` 与 archived-confirmed 撤效；P06 无两项 |
| `batch-store.ts` (P06) | D4 不等价的导入 batch | `afab66ebaa38324fc2c886a0eee62c4752a25157` / 607 | `runBatchQueue` `completed`→`done` 可缺 runId，`finalizeBatch` 委托跨领域 final gate |

固定链接使用 `https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/<SHA>/apps/electron/src/main/lib/review/<file>#L<line>`。可复核：
- [D4 IPC intake:103–181](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-ipc.ts#L103-L181)；[D4 frozen setting:249](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-ipc.ts#L249)。
- [P06 IPC batch:634–659](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L634-L659)；[P06 background:687–702](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L687-L702)。
- [D4 Pi prompt:392–445](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/pi-case-review-service.ts#L392-L445)；[P06 Pi prompt:384–430](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/pi-case-review-service.ts#L384-L430)。
- [D4 projection:22–116](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/workspace-service-v2.ts#L22-L116)；[D4 sync:166–210](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/workspace-service-v2.ts#L166-L210)；[P06 sync:163–207](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/workspace-service-v2.ts#L163-L207)。

## 2. 函数级裁决（不得整文件覆盖）

### S-01 `projectedCase` / `syncWorkspaceProjectionV2`：confirmed 事实的失效差异（ARCH-002、003）

- D4 `projectedCase(v1,current,!!current.d2RuntimePlan)`：当 frozen D2 存在时沿用 `current.subjects/reviewRules`；对已归档旧来源的 `EvidenceLink` 写 `rejected`，对引用相同旧版本的 `observation.confirmed` 置 `false`，并保留 value/sourceRefs/immutable receipts。D4 还避免在 frozen Plan 上追加 legacy item 候选关联。
- P06 `projectedCase(v1,current)`：重投影 subjects/reviewRules；archive 时仅将 EvidenceLink rejected，继续遍历 legacy items。
- **独立判断**：这不是抽象“重构建议”，而是同一输入在两个源码快照下的结果不同。若强行以 P06 覆盖 D4 的 frozen-case 路径，可能把已锁定的审核对象和旧人工确认效力带回正式 gate。标 P0 **潜在业务污染候选**、P1 **确定的合流阻断**；需要可达性负例再决定是否为实际 P0 缺陷。

### S-02 `promptFor`：D2 RuntimePlan schema/Prompt 交叉兼容（ARCH-005）
- D4 使用 `d2RuntimePlan.targets.map({objectKey,scenario,conditions,fieldKey})`，过滤重复 D2 控制字段，使用 compact mapping 和 confirmed `EvidenceLink` 提示。P06 使用 `d2RuntimePlan.scenario ?? '普通文本审核'` 和旧 `mapping` 串联文本。
- 二者都要求真实出处、missing/rejected、不能代行政批准；不能抹掉 P06 的 `review_inspect_original(documentVersionId)` 和 Main 权限安全门，也不能保留 P06 过时的单场景 Prompt 作为 D4 多对象完整表示。
- 必须验证 `CaseAggregate.d2RuntimePlan` 的类型、`CheckKey×target` 与 SourceRef 在 Main/Preload/Renderer 三端一致，不能只通过静态 TS 编译就推断业务语义相等。

### S-03 `registerReviewIpc`：不同业务入口的 owner 冲突（ARCH-004/011/013）
- D4 在 Main IPC 接受 sender 主 frame 并签发 token，`STAGE_D4_DROPPED_BYTES` **不接受 Renderer 任意路径**；`APPLY_D4_CASE_BATCH` 还要求 expectedRevision/choices/acknowledgeSkipped。P06 同文件增加审核 Batch group/automation/background Owner 和配置，且存在多个直接透传 `input.actor` 的 V2 CRUD 命令。
- P06 `CREATE_CASE_V2:515–520`、`UPDATE_FIELDS_V2:526–531`、`CORRECT_OBSERVATION_V2:586–590`、`SET_EVIDENCE_LINK_V2:591–595` 不调用用于正式决定的 `bindLocalReviewerCommand`。可证实**层间验证方式不一致**，尚不等于证实某 Renderer 用户可任意提升为校方身份。来源：[P06 actor IPC](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L515-L595)。
- Main/Preload/Renderer 必须对 D4 channels 的实际暴露、P06 `BATCH_ACTION_V2` union、Owner stop/started events 做对照合同；当前仅验证 Main 函数，**没有宣称三端完整差分已静态覆盖**。独立 TSV/自动生成接口清单建议第三轮执行 CI 检查。

### S-04 `runBatchQueue` / `finalizeBatch` / `assertAutomatedWorkspaceDecision`（ARCH-007/008/009）
- P06 `runBatchQueue:592–595` 完成时写 `entry.status=done`，`outcome.runId` 为可选。调用端真实 `RUN_BATCH_V2` 确实传回 `run.id`，故这是**底层接口缺乏封闭性**，不是证明用户端默认会产生无 ID done。
- 2D 另外独立读取 `batch-store.ts:236–262` 的 `assertBatchBusinessReadyForFinalization` 完整函数：依次检查所有 entry 为done、无未完补件、stage=decided/archived、模板版本一致、无进行中申诉/待办、`resolveFinalDecisionProjection` 有效。**完整函数没有要求entry.runId存在，也没有比较`projected.decision.basedOnRunId === entry.runId`**；`finalizeBatch:266–283` 将其作为唯一公共业务final gate。缺少等式这一静态事实 VERIFIED，错误跨批定稿是否可达仍为 PARTIAL/测试NOT_RUN。来源：[P06 final gate:236–262](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-store.ts#L236-L262)。
- `workspace-business-service-v2.ts:225–269` `assertAutomatedWorkspaceDecision` 以 `batch-auto:<batchId>:<revision>` 检查自动化授权和 `checkAutoBatchAction`，但内层是否重新约束 **batch entry exact run ID** 需直接测试。外层 `runBatchAutomation` 已有 live runId 校验，不能混淆内外风险面。

### S-05 `RESOLVE_APPEAL_V2` + `stage-workflow.resolveAppealV2`（ARCH-014）
- P06 IPC:721–723 将 actor 绑定为 local reviewer，业务服务却要求 teacher；因此真实教师授权来源尚未接通，不能宣称全角色生命周期闭环。其他人工阶段 API 的权限不能由 TypeScript `Actor` 形状推定。

### S-06 SourceRef 的来源/读取/显示（ARCH-010/012）
- SourceRef 应包含可靠的 caseId/versionId/blockId+位置、读取收据/quote/原件 digest；绑定到具体 case、具体材料版本与已解析内容。Renderer 高亮是**显示能力**，不是 Main 来源真实性确认。P06 `review_inspect_original` 接收 documentVersionId，不接受任意文件路径；D4 `inspect_preview` 及材料暂存属于不同边界。
- Office #71 曾有物理同名串源与缓存隔离问题，失效测试、修复代码和下一层 SourceRef 必须联合回归；不可仅通过“调用函数存在”宣称安全。

## 3. 自主检查的盲区和约束

`review-ipc.ts` 与 `pi-case-review-service.ts` 两边分别 992/992、1126/1098 行，检查了函数列表与关键段；**未执行全文件 AST/逐 hunk diff**（本地 git clone DNS 阻断）；完整函数级全量差异、Preload/Renderer 全量接口比对仍 **PARTIAL**。不得用本节替代 `git diff --function-context` 或 typecheck。所有 SHA 为代码快照或 blob SHA，不把 `#135/#136/#137` 文档分支当运行代码。
