# 06｜执行体系中“重复”与“互补”逻辑

仅审查，**不建议在本轮合并、删除、修改任何一个旧实现**。仓库各版本血缘不同，特别是 D4 与 P06 无直接继承、R02 与 R03 的绑定合同不同；下表是 V3 选型输入，不是直接改造指令。

| 能力/位置 | 两种实现及表面重叠 | 真实互补/冲突 | 必须保留的不变量与候选接口 |
|---|---|---|---|
| RUN-01 A/B | `runReviewCaseV2` 的节点图与 `pi-case-review-service` 的直接 Pi Run | 都可形成 ReviewRunV2，但图依赖 checkpoint/artifact；直接 Pi 以每次 submit 维持 accepted/missing/rejected；**属于两种执行驱动**而非可无条件去重的两个函数 | 共享 `RunResult/CheckEvidence/DocumentCoverage` 合同；不同 Runner adapter 自管轮次/取消 |
| RUN-02/03 | `coverage-ledger`、`v2-executor-factory` 与 Pi direct `recalculateCoverage` | 统一检查计划×目标与业务数值是公共核心；读取账本与终态写入时点不同 | CheckKey 必须对齐 rule/subject/group；`not-executed/execution-failed` 永不算 completed，数值靠程序 |
| RUN-05/06 | D4 `pi-review-submit-repair` vs P06 `requiredToolKeys` 与工具回执 fallback | **互补**：repair 面向缺项/被拒的定向提示，required keys 是完成门槛；仅用 repair 文本无法保证技术拒止，反之所有提交完成也不保证出处正确 | `SubmissionAttempt{accepted,rejected,missing,budget}`、一次运行有限预算、可恢复 |
| RUN-04 | graph `run-service-v2` + direct `buildRun`，同 `run-store-v2` | **重复的是 manifest/哈希序列化，互补的是调度生命周期**；必须统一输入版本但保留 graph 和 direct checkpoint | 同一个真实输入 manifest、旧输入失效、受控 ReadReceipt inheritance |
| BG-01/03/05 | `review-agent-assignment`、`review-strict-pi-tools`、Orchestrator gate | 不应为精简校验删除多个边界；分别抵御工具注册、运行权限、持久撤权/异步迟到 | 授权绑定包含 actor/session/turn/case/run/action、Main 每次写重检、取消后失效 |
| BG-02/04/06 | Agent session index、owner UUID fence、projection publisher、V2 Run | **不是多份业务账本**：index 记录执行容器身份，owner fence 是拒止证据，projection 是 UI 视图，V2 Run 是业务真相 | 不允许 UI 的隐藏状态代替 Main owner；删除迟到不复活；ACK 不等于模型成功 |
| BAT-01/05/06 | `review-d4-case-batch` vs `batch-store`、`batch-run-provenance` | D4 处理一案多文件，P06 处理多案多运行，**不重复**；R02 helper 移除到 R03 各服务是**重复安全校验散布**而非证明等价 | BatchCaseEntry 应明确绑定 Run 和冻结输入版本；不同批不能借 Run |
| BAT-02/03/04 | triage、group、automation gate、workspace business | triage read-only、group 人工 CAS、automation 授权、workspace 正式决定互补；无权互相代替 | 分流≠审批；人工逐案/逐角色；本地自动确认≠学校授权 |
| BAT-07/08 | D4 输入 journal、P06 batch recovery、Outbox WAL | 三类重试针对不同原子边界，不能共用一种“重试后成功”语义 | 禁止跨批补件自动广播；原材料 append 不重放、batch Run 不错用、outbox 不推重 |
| RET-02 | `stage-workflow` 历史 run@rev 与 `workspace-business-service-v2` 真 Run | 仅迁移/展示兼容；合成旧凭据不能当真实审查完成 | 带 `source_kind=legacy_virtual` 标示，不自动授权决策 |
| EXT-01 | MockSchoolAdapter、LocalPackageAdapter、未来 SchoolPort | 端口合同可复用，可靠性和授权证明不可跨适配器继承 | receipt.kind + actionId + payloadHash + external version + real authorization |

## 权限的职责划分建议（供集成轮讨论，不进入最终架构）

**通用 Pi Adapter**：Provider channel/协议、有限上下文/轮次、工具调用流，取消、deadline、transport、SDK event/usage 及能力声明/实测状态；不应知道学校规则、合法批准对象或 `Batch` 的行政状态。

**审核域 Runner**：将 Provider call 映射到具有 `RunInputManifest` 的只读文档能力、`Check` 计划、稳定 SourceRef、结果接收/拒绝/补交、deterministic 计算、coverage 和实际完成判定；不得拥有外部学校批准权限。

**后台 Owner/能力边界**：Main 持有 session/token/assignment/revoke/stop，强制模型工具白名单并在 await/恢复后重新校验；这是运行安全内核，不只是 UI 实现。可被通用 Agent orchestrator 调用，但权限与 owner 不能被普通 Agent 决定。

**单案业务事务**：根据当前 Case revision、真实 Run、Readiness、角色与任务队列完成 disposition/adjudication/decision；Pi “检查正确”不触发自动授权。

**批量协调**：冻结模板/政策和 batch attempt 身份，复用单案 Runner/Run，维护逐案状态、triage/group/explicit-automation、跨批归属、恢复与定稿；不得拥有第二个 case 决定存储。

**外部 Outbox**：发送前持久化 actionId/payload，出站按适配器区分模拟、离线或校方真实回执；未知状态必须可追查，不允许将自动重试提升为学校重复审批。

## 禁止误优化清单

- 不因 `review-pi-run-bridge` 与 `review-ipc` 都能启动而删除 Main admission 及 owner：它们的调用者信任级别不同。
- 不因 `review-agent-assignment` 和 `isAuthorizedDirectReviewTool` 都检查权限而删除其一：前者检查持久授权，后者限制 Host 工具及当前绑定。
- 不因为 Batch 与 Case 同有 `runId` 而只留“最新 Run 指针”；`caseId,runId,batchId` 是三个身份维度。
- 不因 R02 helper 小而直接复原/移植，先核对 R03 带来的现行 hash、stage、版本兼容。
- 不把 R03 的某个 `done` 标签和产品“完整通过”画等号；入口成功、模型回执、覆盖、人工决定和 SchoolPort 真回执各是一层。
- 不修改隐藏 Gold、历史失败日志、旧 Draft PR，不未经授权做真实学校写入。

## 已核实的核心文件固定 blob SHA

`pi-review-submit-repair.ts` @D4 `0968bec974beeac12444034848869a7e4165745d`；
`review-d4-case-batch.ts` @D4 `39a50f54730cb96be83c88c2595ec75fb5d7b51a`；
`batch-template-lock.ts` @R03 `739d13004157a8b515817e251c08f67b1206c92b`；
`batch-automation-gates.ts` @R03 `92dd2e5062d6d890c2bc3eff14f179463dd6951e`；
`batch-group-action-service.ts` @R03 `46bab08ace5cdfebf4d86d7efcccc206536d92f5`；
`batch-review-triage.ts` @R03 `4b3bd2c9880f8ee92e8ab3f3b8f847f3b243e25b`；
`review-pi-run-bridge.ts` @R03 `a4746a241e3d0a8c325ce927f3ea8e9f73cfa198`；
`v2-executor-factory.ts` @R03 `e919b10411c1e585f5cd2c904e4b73a4006f16d2`。
