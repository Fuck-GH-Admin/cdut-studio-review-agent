# Agent E｜批量审核与自动化逐文件源码盘点

- 仓库：Fuck-GH-Admin/cdut-studio-review-agent
- 审查基线：main / 7b6cdc843d26e926c0c63b8c51a451ff3925cfad
- 基线提交时间：2026-10-21 08:32:09 UTC
- 方式：只读源码与测试审查；本会话没有修改生产代码，也没有运行测试或 CI。
- 目的：为全仓 CODEBASE-MAP 提供批量审核域的逐文件事实、实际调用链和待核实事项。

## 1. 结论摘要

批量审核不是独立的第二套单案审核引擎。当前产品链路由批次层编排队列、读取单案运行结果、进行只读分流、把相似问题组成视图、逐案复核并调用既有 V2 业务事务。队列执行仍通过单案审核执行器；自动通过、自动补件和人工集中处理均不能只凭“检查完成”或“问题组相似”写入业务决定。

主要运行链路：

1. 已有案卷建批次：BatchPanel 选取已发布模板与同模板案卷 → reviewAPI.createBatchV2 → review-ipc.ts → batch-store.createBatchV2。
2. 原件物理入库建批次：ReviewV3T06PhysicalImport → T06 Main IPC → review-v3-t06-main-service.commitT06PhysicalImport → 创建案卷与登记原件 → 按模板分组 → 复用 batch-store.createBatchV2。
3. 批次运行：BatchPanel → reviewAPI.runBatchV2 → review-ipc.ts 的 RUN_BATCH_V2 → batch-store.runBatchQueue，逐案调用 run-async-service.assembleAndRunReview → 更新单案条目状态。
4. 自动化：队列结束后，若批次策略不是 assist，RUN_BATCH_V2 handler 会调用 batch-automation-service.runBatchAutomation；页面也有独立的 BATCH_AUTO_PROCESS_V2 入口。
5. 分流和问题组：BatchPanel 从当前批次、案卷聚合和最新 Run 组成输入，调用共享的 triageBatchCase / groupBatchIssues。分流本身只产生候选，不写正式决定。
6. 人工集中处理：BATCH_GROUP_PREVIEW_V2 → previewBatchGroupAction → 用户确认 → BATCH_GROUP_APPLY_V2 → applyBatchGroupAction → 逐案调用 V2 disposition、补件或正式决定事务。
7. 定稿：BATCH_ACTION_V2 的 finalize-completed → finalizeCompletedBatch → 逐案核对真实最终决定、补件、申诉和任务 → finalizeBatch 写入冻结快照与哈希。
8. 补件回流：stage-workflow.resolveSupplementV2 在全部相关补件满足后调用 requeueCaseAfterSupplement，将符合条件的活动批次条目重新入队。

核心源码入口：
- [batch-store.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/batch-store.ts)
- [batch-automation-gates.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/batch-automation-gates.ts)
- [batch-automation-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/batch-automation-service.ts)
- [batch-group-action-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/batch-group-action-service.ts)
- [batch-review-triage.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/packages/shared/src/review/batch-review-triage.ts)

## 2. 单文件清单：E 直接负责的核心文件

| 文件 | 实际职责 | 主要调用关系 | 测试文件与覆盖 |
|---|---|---|---|
| apps/electron/src/main/lib/review/batch-store.ts（527 行） | 批次状态 JSON 持久化、批次创建、自动化策略保存、补件回流重入队、队列执行、定向重试、中断恢复、正式定稿、重开新轮次；同文件还包含外部端口 outbox。 | 由 review-ipc.ts 动态导入；被自动化服务、补件工作流和 T06 Main 批次创建复用。 | batch-store.test.ts：26 个 test 调用，覆盖状态机、定稿门槛、路径安全、重试/恢复、outbox 和队列。 |
| apps/electron/src/main/lib/review/batch-store.test.ts（501 行） | 批次存储与状态机测试。 | 直接验证 batch-store 的公开函数；部分用假 runCase 隔离队列调度。 | 26 个 test 调用；本会话只读盘点，未运行。 |
| apps/electron/src/main/lib/review/batch-automation-gates.ts（134 行） | 自动通过/自动补件的只读准入门控：模板和政策锁、已确认规则、当前 Run 与输入、材料读取、检查覆盖、角色/阶段、补件/申诉、任务、证据来源、全局与模板开关。 | 被 batch-automation-service 和 workspace-business-service-v2 的系统决定校验使用。 | 主要通过 batch-automation-service.test.ts 与单案业务事务测试间接覆盖；没有独立同名测试文件。 |
| apps/electron/src/main/lib/review/batch-automation-service.ts（137 行） | 对批次内已完成条目逐案分流；在门控允许时调用现有 V2 单案决定事务；记录批次回执；核验并定稿已完成批次。 | 调用 batch-store、batch-automation-gates、triage、template-store、case-store-v2 和 workspace-business-service-v2。 | batch-automation-service.test.ts：15 个 test 调用，覆盖授权、撤销、旧输入、补件回流、重复执行、混合分流与定稿。 |
| apps/electron/src/main/lib/review/batch-automation-service.test.ts（390 行） | 自动化业务闭环测试。 | 通过测试夹具调用真实服务与单案事务边界。 | 15 个 test 调用；本会话未运行。 |
| apps/electron/src/main/lib/review/batch-group-action-service.ts（264 行） | 问题组人工集中处理的请求校验、只读预览、逐案资格判断、预览哈希、操作 ID 幂等、操作回执持久化、逐案事务执行和中断后不自动重放。 | 依赖 batch-store、triage、case-store-v2、run-store-v2、template-store、workspace-business-service-v2 与 stage-workflow。 | batch-group-action-service.test.ts：10 个 test 调用，覆盖范围选择、版本冲突、来源缺失、补件、正式通过/退回、角色和幂等。 |
| apps/electron/src/main/lib/review/batch-group-action-service.test.ts（236 行） | 人工集中处理服务测试。 | 直接调用 preview/apply 服务。 | 10 个 test 调用；本会话未运行。 |
| packages/shared/src/review/batch-review-triage.ts（322 行） | 纯函数式分流、当前 Run 有效性检查、保守问题归组和逐案处置草稿；不直接写业务决定。 | 被 BatchPanel 与 batch-group-action-service 使用。 | batch-review-triage.test.ts：20 个 test 调用，覆盖候选与正式决定区分、版本/输入/材料有效性、原因归组与草稿约束。 |
| packages/shared/src/review/batch-review-triage.test.ts（197 行） | 分流和问题聚类的共享逻辑测试。 | 直接验证纯函数。 | 20 个 test 调用；本会话未运行。 |

## 3. 重要的跨模块文件与边界

这些文件不是全部由 E 维护，但它们决定批量审核真实运行方式，必须进入总地图。

| 文件 | 在 E 链路中的作用 | 归属建议 |
|---|---|---|
| apps/electron/src/main/lib/review/review-ipc.ts | 注册 RUN_BATCH_V2、CREATE_BATCH_V2、GET_BATCH_V2、LIST_BATCHES_V2、BATCH_ACTION_V2、BATCH_AUTO_PROCESS_V2、BATCH_GROUP_PREVIEW_V2、BATCH_GROUP_APPLY_V2。RUN_BATCH_V2 负责运行队列并在启用策略时继续执行自动处理。 | A 负责 IPC/安全接线；E 提供业务委托证据。 |
| packages/shared/src/types/review.ts | 定义批次 IPC 通道常量。 | G/A。 |
| packages/shared/src/types/review-v2-contracts.ts | 定义 BatchStateV2、BatchAutomationPolicy、BatchAutomationReceipt、BatchAutomationReport 和相关批量命令契约。BatchStateV2.status 允许 draft/queued/running/finalized/reopened；单案条目允许 queued/running/done/failed/paused。 | G 负责契约；E 记录与实现的对应关系。 |
| apps/electron/src/preload/index.ts | 将批次通道包装为 window.reviewAPI，提供创建/读取/列表/运行/动作/自动处理/问题组预览与应用等方法。 | A。 |
| apps/electron/src/renderer/components/content-review/BatchPanel.tsx | 用户批次入口；创建批次、展示队列与分流、启动、恢复、重试、自动处理、集中办理和定稿。页面还同时读取 V2 案卷索引与旧 listCases() 元数据。 | F。 |
| apps/electron/src/renderer/components/content-review/BatchAutomationDialog.tsx | 用户逐批选择 assist/auto-return/auto-approve 并明确确认；显示全局授权、模板策略及人工审批限制。 | F。 |
| apps/electron/src/renderer/components/content-review/BatchGroupActionDialog.tsx | 先预览、展示逐案资格，再要求明确确认后应用；每次编辑动作、理由、要求补件要素或选择范围都会使旧预览失效。 | F。 |
| apps/electron/src/renderer/components/content-review/batch-ui-feedback.ts 与 batch-ui-feedback.test.ts | 统一清理 Electron IPC 错误包装，并区分当前 Run 的自动化回执与历史动作。 | F。 |
| apps/electron/src/main/lib/review/workspace-business-service-v2.ts | 单案正式决定的权威事务。system 来源的自动决定必须带 batch-auto 批次 ID 和策略修订号，并在 submitCommand 的串行事务内部重新检查当前批次策略与自动化门控。 | B；E 调用它而不另造业务决定。 |
| apps/electron/src/main/lib/review/stage-workflow.ts | 补件判定为 satisfied 且没有其他未结束补件后，调用 requeueCaseAfterSupplement。 | B；E 记录批次回流语义。 |
| apps/electron/src/main/lib/review/run-async-service.ts | assembleAndRunReview 装配模型渠道、Pi Adapter 与 OCR，提供单案真实审核执行。 | D。 |
| apps/electron/src/main/lib/review/review-v3-t06-main-service.ts（432 行） | 物理目录/ZIP 入库的 Main 服务；验证来源指纹，创建/绑定案卷、登记原件，并按已成功入库的案卷与模板创建批次。它是第二个批次创建入口，但复用 createBatchV2。 | G/F 的材料入口与 E 的批次 writer 交叉。 |
| apps/electron/src/main/lib/review/review-v3-t06-main-service.test.ts（157 行） | 物理入库、混合模板分批、部分失败与同请求重复提交测试。 | 6 个 test 调用；当前夹具的 policyRefs 与 policyVersionIds 都为空，未覆盖政策版本大于 1 的批次锁。 |
| apps/electron/src/main/lib/review/external-ports.ts 与 external-ports.test.ts | 定义 MockSchoolAdapter、LocalPackageAdapter 和 SchoolPort 合同；batch-store 内的 outbox 用于可恢复的外部动作载荷。 | 作为外部系统边界单独记录；当前未证实已接入用户批次流程。 |

## 4. 实际状态语义

### 4.1 批次状态与单案状态不是同一件事

- 新批次由 createBatchV2 创建为 draft。
- runBatchQueue 开始时将批次标为 running，逐案设置 running，执行成功后标为 done，失败后标为 failed。
- 一轮队列结束后，批次状态回到 queued；此时 queued 表示批次仍可继续处理/自动化，不代表每个单案都还排队。真正待执行的项目由 state.cases 的状态决定。
- done 只表示审核运行完成，不表示正式业务通过。
- recoverInterruptedBatch 将遗留 running 条目标为 failed，并将批次恢复为 queued，等待人工明确重试；不会自动重放未确认的执行。
- retryBatchCases 仅允许明确选择的 failed/paused 条目，或经 triage 判定为技术异常的 done 条目重新入队；它先校验整个选择范围，再落盘。
- reopenBatch 不修改已定稿批次，而是创建新的 draft 批次，round 加一，并通过 reopenedFromBatchId 保留来源关系。

### 4.2 自动化候选与正式决定严格分离

triageBatchCase 和 groupBatchIssues 是只读建议。自动执行需要 batch-automation-gates 再次检查当前授权、模板版本、已发布政策、检查覆盖、材料读取、来源引用、角色、业务阶段及单案状态。

最终写入走 workspace-business-service-v2 的 decideWorkspaceCaseV2 或补件事务。对 system 来源，事务内部再次解析 batch-auto 身份中的批次 ID 和策略修订号，重新读取批次并运行 checkAutoBatchAction。这是授权撤销与输入变化能够 fail-closed 的关键边界。

### 4.3 问题组是视图，不是合并后的业务实体

groupBatchIssues 以规则标识、检查状态和规范化后的问题原因保守归组。它没有把组本身变成决定，也没有在本模块实现模型语义相似聚类。applyBatchGroupAction 在应用前重新生成预览哈希，并逐案核对修订号、Run 新鲜度和批次状态；每个案卷单独提交现有业务事务，部分失败不会被报告为整组成功。

### 4.4 定稿是业务终态核验，不是队列完成标记

assertBatchBusinessReadyForFinalization 要求所有批次条目均为 done，案卷聚合与模板存在且匹配，没有开放补件、未结束申诉或未完成任务，并且单案已经存在真实最终决定。finalizeBatch 写入 finalized-rN.json 快照及哈希，再将批次标记为 finalized。已定稿批次不能原地执行或重写。

## 5. 已确认问题与待核实风险

### E-01｜批次 IPC 入口没有显式主窗口调用者校验（高优先级安全边界核查）

在 review-ipc.ts 中，RUN_BATCH_V2、CREATE_BATCH_V2、GET_BATCH_V2、LIST_BATCHES_V2、BATCH_ACTION_V2、BATCH_AUTO_PROCESS_V2、BATCH_GROUP_PREVIEW_V2、BATCH_GROUP_APPLY_V2 这些 handler 接收的 event 未用于调用 assertMainWindowSender 或 assertC0ReviewMainSender。

相邻的 T06 物理来源选择/提交以及若干模板、材料和 V2 案卷 handler 则显式调用 assertC0ReviewMainSender。review-ipc-path.test.ts 的测试事件是空对象，只验证恶意 caseId 被拒绝和配置目录外未创建文件，没有验证批次 handler 会拒绝非主窗口调用。

影响：批次创建、队列启动、策略配置、自动处理和人工集中操作都处于 IPC 边界；不能只依赖 UI 禁用按钮或调用方传入 confirmed=true。虽然单案事务仍有严格业务门控，但 sender 信任边界需要补充核查。

交接：A 核实统一 IPC 安全约束；E 不在本次只读审计中改代码，也不把这一点表述成已证明的远程利用漏洞。

### E-02｜T06 物理入库批次的政策版本锁与普通创建路径不一致（高优先级正确性问题）

普通批次创建路径 BatchPanel.createBatch 优先从 selectedTemplate.policyRefs 取真实 policyId/version；只有旧模板没有 policyRefs 时才退回 policyVersionIds，并按旧格式版本 1 处理。

但 review-v3-t06-main-service.ts 的 commitT06PhysicalImport 在创建每个模板批次时只遍历 template.policyVersionIds，并将每个 policyVersionId 固定写成 version: 1，没有优先使用 template.policyRefs。代码注释声称沿用模板声明的政策版本，但实现可能丢失已明确声明的版本。

当模板引用的政策版本不是 1，或者 policyRefs 与旧 ID 列表不完全等价时，物理入库创建的批次锁就可能与实际模板/Run 不匹配，后续 triage 与自动化门控会将其拒绝或标为技术异常。

证据：
- [BatchPanel.tsx](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/renderer/components/content-review/BatchPanel.tsx#L230-L260)
- [review-v3-t06-main-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/apps/electron/src/main/lib/review/review-v3-t06-main-service.ts#L400-L425)
- 当前 T06 Main 测试的模板 fixture policyRefs 与 policyVersionIds 均为空，未覆盖该情况。

### E-03｜createBatchV2 没有在权威写入层验证案卷与模板/政策锁一致性（中优先级）

createBatchV2 当前主要校验批次 ID、非空 caseIds、caseId 安全性、重复 caseId 与批次路径是否已存在；它不会逐案读取聚合并验证 caseV2.templateId/templateVersion 与批次相同，也不会验证 policyVersionLock 与模板声明的政策版本一致。

正常 UI 路径通过 availableCases 过滤同模板案卷，T06 Main 路径也验证既有案卷模板与所选模板相同，所以常规路径有调用方校验。但核心 writer 本身没有封住这个业务不变量；未来增加新批次入口时可能写入结构上合法、业务上不一致的批次。建议由总架构审查决定是否把此不变量收敛到唯一 writer。

### E-04｜设计要求中的暂停/取消没有对应的批次操作入口（中优先级设计差异）

16 号批量审核规范要求队列启动、重试、暂停、恢复和取消具备明确 API/UI。当前实现能启动、定向重试和显式恢复；BatchStateV2 的单案状态包含 paused，但 BATCH_ACTION_V2 的 action 联合类型没有 pause/cancel，runBatchQueue 也没有取消信号或停止检查，BatchPanel 没有暂停/取消操作。

因此当前不能将暂停/取消描述成已实现能力。是否需要在下一阶段实现，应由产品/架构总协调者裁决。当前代码也没有发现自动重试次数/最大自动重试次数计数器；已有的是人工定向重试与中断恢复。

### E-05｜T06 入库请求回执仅存于进程内存（待明确幂等保证范围）

review-v3-t06-main-service.ts 使用进程内 Map 保存 selections、receipts、receiptRequests 与已登记版本索引。相同 requestId 的重复提交在同一进程内会返回既有回执；Main 服务重启后这些 Map 不保留。案例、原件和批次本身则已经分别写入持久化存储。

因此当前实现能证明的是进程内重复请求幂等，不能直接声称跨重启仍能返回同一回执。确定性 caseId/batchId 可以阻止简单重复创建，但重试可能返回重复 ID/批次已存在一类失败，而不是恢复原回执。需确认设计究竟要求仅进程内幂等，还是需要持久化请求账本。

### E-06｜混合模板批次的启动没有跨批次并发上限（运行容量风险）

ReviewV3T06PhysicalImport 在用户点击启动全部已创建批次时，对所有 batchId 使用 Promise.allSettled 并发调用 runBatchV2。runBatchQueue 在单个批次内部是逐案串行，但 activeBatchRuns 只按 batchId 去重，没有跨批次全局并发限制。

因此，一次物理导入产生多个不同模板批次时，这些批次会同时启动，可能形成多个并行模型请求。是否需要全局并发上限需结合实际渠道限额与批量规模确定；当前代码中没有找到该上限。

### E-07｜outbox 实现存在，但当前用户批次链路未证明已接入外部系统推送

batch-store.ts 中实现了 pushViaOutbox、recoverPendingPushesDetailed 与 recoverPendingPushes；它在外部端口调用前持久化原始载荷及哈希，拒绝同 actionId 不同载荷，恢复时只重放校验通过的原始载荷。external-ports.ts 当前包含 MockSchoolAdapter 和 LocalPackageAdapter。

但在本次追踪的 review-ipc.ts 与 preload reviewAPI 批次入口中，没有找到 outbox 的用户操作通道；也没有在本次限定范围内确认一个生产调用者。16 号规范和 24 号验收记录也明确把真实生产 SchoolPort 留作后续接入。因此地图应把 outbox 标记为已实现的端口/恢复能力，但不能把它写成当前批次审核已经完成的学校系统推送闭环。全仓调用者检索仍应由总协调者最终复核。

### E-08｜批次状态与 IPC 动作存在疑似遗留契约（低优先级）

- BatchStateV2.status 允许 reopened，但 reopenBatch 实际创建的是 status=draft 的新批次，旧批次保持 finalized；在本次检查的 batch-store 写入路径中没有发现将状态写成 reopened 的地方。需要全仓确认后再决定是否移除类型与 UI 标签。
- BATCH_ACTION_V2 的类型联合仍包含 finalize，handler 却明确拒绝旧 finalize 动作，要求使用 finalize-completed；输入中仍有 snapshot 字段，但该处理路径不使用它。这些属于契约残留候选，不应在未检查所有调用者前直接删除。

### E-09｜补件满足后会重新入队该案卷所属的所有符合条件批次（业务语义待确认）

requeueCaseAfterSupplement 遍历全部批次：只要其中包含该 caseId、批次模板与当前案卷模板相同，且批次未 finalized/running，就可能将该条目重新置为 queued。createBatchV2 没有禁止同一案卷进入多个活动批次。

如果同一案卷被加入多个开放批次，补件满足后可能在多个批次中被重新排队。该行为可能是为了让所有批次视图都反映最新输入，也可能造成重复审核调度；当前需要明确业务语义并由 B 负责追踪补件事务、E 负责追踪批次重入队。

### E-10｜batch-store.ts 混合了批次生命周期与外部同步 outbox

同一文件同时承担批次持久化、队列/重试/定稿，以及外部动作 outbox 的安全校验、WAL、重放恢复。这些能力在逻辑上可分成两个子模块。此处仅记录模块职责混合，当前阶段不拆文件、不重构，以免改变生产路径。

## 6. 测试与既有验收证据

本次仅盘点测试源码，没有运行任何测试。

E 核心直接测试源码包含：
- batch-store.test.ts：26 个 test 调用。
- batch-automation-service.test.ts：15 个 test 调用。
- batch-group-action-service.test.ts：10 个 test 调用。
- batch-review-triage.test.ts：20 个 test 调用。
- 合计 71 个直接 test 调用。

相关交叉测试：
- review-ipc-path.test.ts：1 个测试场景覆盖恶意 caseId 的批次创建拒绝。
- review-v3-t06-main-service.test.ts：6 个测试场景覆盖物理入库、混合模板分批、部分失败和同请求重复提交。
- review-v3-t06-physical-intake.test.ts：8 个测试场景覆盖物理分案预览、路径与重复项拒绝、已有案卷绑定及批次成功成员。
- review-v3-t06-template-route.test.ts：3 个模板预路由测试。
- batch-ui-feedback.test.ts：3 个 UI 反馈测试。
- review-v3-f14-batch-worklist.test.ts：4 个批量工作名单元测试。
- review-v3-t06-batch-intake.test.ts：3 个清单解析/绑定测试。
- review-batch-case-fallback.p06.test.ts：3 个相邻执行语义测试。

测试源码证明了上述行为被编写为断言，但本会话未执行它们，也未独立验证当前 HEAD 的 CI。基线提交 7b6cdc8 的提交信息记录了当时 5021 pass / 0 fail / 5 skip，typecheck 与 boundaries 通过；这属于提交记录中的既有验证声明，不是本会话重新运行的结果。

现有历史文档：
- [16-batch-review-automation-and-issue-clustering-spec.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/docs/design/review-agent/16-batch-review-automation-and-issue-clustering-spec.md)：批量审核产品规范与阶段范围。
- [17-batch-review-stage-c-local-acceptance.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/docs/design/review-agent/17-batch-review-stage-c-local-acceptance.md)：自动化策略、补件回流、定稿与本地验收条件。
- [21-batch-review-offline-ui-acceptance.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/docs/design/review-agent/21-batch-review-offline-ui-acceptance.md)：旧基线上的真实 Electron UI/IPC 场景记录。
- [24-batch-review-independent-final-acceptance.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/7b6cdc843d26e926c0c63b8c51a451ff3925cfad/docs/design/review-agent/24-batch-review-independent-final-acceptance.md)：旧基线的独立复验记录与生产部署边界。

需要留意：16 号文档的状态段仍写有 C 阶段“手动 UI 验收待完成”，而 21/24 号文档记录了较早基线上的 UI/IPC 验收通过。它们并不自动证明当前 HEAD 的所有场景均已重验，正式的设计实现差异文档应记录这项文档状态不一致。

## 7. 不应与 E 的用户批次模型混为一谈的技术批次

- review-v3-a24-bounded-technical-batch.ts：注释明确说明这是 Main 内部技术任务调度，不是学校批次定稿器，也不是 C Run writer。
- review-v3-b4-bulk-evidence-workbench.ts：历史模板来源证据工作台；注释明确不修改 D4、Case、Run、Principal、Owner 或正式 Plan。
- review-v3-b-bulk-remediation-cycle.ts：对候选技术证据问题生成非破坏性修复包；注释明确不是权限主体或 Case writer。

这些模块即使名称包含 batch/bulk，也不是 BatchStateV2 的用户审核批次，不应合并进本模块的队列、状态机或业务闭环图。其真实调用关系由对应的 V3 技术/调研分工继续核实。

## 8. 给总协调者的跨模块交接

- A（应用接入与 IPC）：优先核查 E-01；批次 IPC handler 与 T06/模板/案卷 handler 的 sender guard 策略不一致。
- B（案卷与业务事务）：核实 requeueCaseAfterSupplement 对同一案卷多批次的业务语义，以及最终决定、补件、申诉和任务的权威状态。
- C（模板与政策）：核实 E-02 的 policyRefs/version 锁差异；决定是否把模板/政策锁验证纳入 createBatchV2 唯一 writer。
- D（审核执行）：将 RUN_BATCH_V2 → runBatchQueue → assembleAndRunReview 的真实单案执行路径与其他 V3 技术批次明确区分。
- F（前端）：记录批次页实际操作、状态提示、T06 一键启动多个模板批次的并发行为，以及旧 listCases() 元数据依赖。
- G（共享契约与测试）：核对 BatchStateV2 的 reopened 状态、BATCH_ACTION_V2 的 finalize/snapshot 残留，以及现有测试是否覆盖非默认政策版本和 IPC sender 负例。

## 9. 本轮范围与完成状态

本报告已完成 E 核心服务、共享分流逻辑、主要 IPC 调用链、前端操作入口、T06 第二批次创建入口与相关测试源码的静态盘点。发现项按“已从源码确认的差异”和“需全仓/运行态进一步核实的风险”分开记录。

未修改生产代码；未运行测试或 CI；未删除/合并任何代码或分支。下一步应由总协调者合并七路文件清单，再统一决定是否修复发现项和编写正式 CODEBASE-MAP。
