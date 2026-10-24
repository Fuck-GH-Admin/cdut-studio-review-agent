---
path: apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c2e25524d08281424791492645dbc543bf19464b
sha256: 3465ae5a69fcd12074d65a894934f0270d8b17822e5ccdf25916ccb65dfe4d6b
lines: 127
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.ts

## 1. 结论与边界

Dev-C R11 本地优先的 Main 运行协调器：调用真实导入的 A R22 后台 SDK 执行，然后交给独立物理 Host 审阅把技术结果归类为“候选人工审阅”或“恢复必需”。输出永远不是学校决定或正式 ReviewRun（文件头 `apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.ts:1-12`）。

边界：

- 不自装 IPC、不接普通 Pi（`:9-10`）；特权 Main 注入 `currentRun`/`background`/`handoff`/`physicalReview` 四个端口。
- 不重放：失败不隐式重试（`:68` 注释；真实 A SDK 副作用可能发生）。
- Gate L 不要求：本地预览不是官方结果（`:5-7`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 1 个接口 + 1 个类 = 3 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C11LocalExecutionDisposition` | type（导出） | 34-39 | `candidate-manual-review`（带 `preview`）或 `recovery-required`（带 `reason`+两 false 标志） | 二态结果 |
| `C11MainLocalExecutionAuthority` | 接口（导出） | 41-47 | `currentRun(call)`、`background:Pick<V3ABackgroundTechnicalCoordinator,'run'|'inspect'|'stop'|'stopSession'>`、`handoff:Pick<A22TechnicalEvidenceHandoff,'snapshot'>`、`physicalReview:Pick<C11MainLocalTechnicalReview,'inspect'>` | 注入端口 |
| `C11MainLocalExecutionOrchestrator` | 类（导出） | 48-125 | `execute/stop/stopSession/close` | 协调器 |
| `deny` | 内部 | 24-26 | 抛 `C0ContractError('RECOVERY_REQUIRED','C_R11_LOCAL_RUN_'+why)` | |
| `stable` | 内部 | 27-33 | 键排序 JSON 规范化 | 与 `review-v3-main-host-receipt-registry.ts:32-38` 同算法 |
| `sameRun` | 内部 | 126-127 | `stable(a)===stable(b)` | |
| `live` | 内部 | 56-62 | 取当前 Run 或拒绝 | `MAIN_LOCAL_EXECUTION_DISPOSED`/`NO_ACTUAL_CURRENT_MAIN_RUN` |
| `recovery` | 内部 | 63-67 | 构造 `recovery-required` 处置 | |

## 3. 内部逻辑与关键流程

### 3.1 构造（`:50-55`）

四端口形状校验，否则 `TRUSTED_C_MAIN_A_AND_HOST_PORTS_NOT_INSTALLED`（`:51-54`）。

### 3.2 `execute(request)`（`:69-110`）

1. 入参必须有 `call`/`requestId`，否则 `INVALID_MAIN_EXECUTION_REQUEST`（`:70-71`）。
2. `expected=this.live(request.call)`（`:72`）：`currentRun` 返回的 run 且 `caseId`/`runId` 非空，克隆。
3. `await this.deps.background.run(request)`：抛错 → `recovery('A_SDK_DISPATCH_EFFECT_UNCERTAIN_REQUIRES_MANUAL_INSPECTION')`（`:73-76`）。
4. await 后复核：`closed`、`currentRun` 仍等于 `expected`、`result.run` 等于 `expected`、`result.ownerGrantId===request.call.grantId`、`result.requestId===request.requestId`，任一失败 → `recovery('MAIN_OWNER_OR_RUN_REVOKED_AFTER_A_SDK_AWAIT')`（`:77-83`）。
5. `result.state ∈ {recovery-required, stopping, running}` → `recovery(result.reason||'UNKNOWN_A_PROVIDER_EFFECT_OR_UNSEALED_TASK')`（`:84-88`）。
6. `evidence=handoff.snapshot(request.call)`；必须 `sameRun(evidence.run,expected)` 且 `canSealCReviewRun===false`，否则 `deny('A_HANDOFF_NOT_PINNED_TO_MAIN_RUN')`（`:90-93`）；`preview=physicalReview.inspect(evidence)`；这两步抛错 → `recovery('INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED')`（`:94-99`）。
7. 再核 `closed`/`currentRun`（`MAIN_OWNER_CHANGED_AFTER_C_PHYSICAL_HOST_CHECK`，`:100-102`）。
8. `preview` 必须 `status==='local-manual-review'`、`runId/caseId` 相等、`businessWriteAllowed===false`、`schoolPolicyPublished===false`，否则 `recovery('UNRESOLVED_PROVIDER_OR_UNTRUSTED_TECHNICAL_DISPOSITION')`（`:103-107`）。
9. 成功返回 `{state:'candidate-manual-review',requestId,preview}`（`:108-109`）。

注意（已证实）：步骤 6 的 `deny`（handoff 未钉住）是**抛错**（`C0ContractError`），而步骤 3/6catch/5/8 是返回 `recovery-required` 处置——两种失败语义不同（`:90-93` vs `:63-67`）。

### 3.3 停止与关闭

- `stop(caseId,requestId)`/`stopSession(sessionId)`：关闭后 `MAIN_LOCAL_EXECUTION_DISPOSED`，否则透传 `background.stop/stopSession`（`:111-118`）。
- `close()`：置 `closed`；只阻止新请求与结果采纳，已派出的 Provider 请求需调用方 Owner/session 生命周期停止（`:119-124`）。

## 4. 调用者与调用链

入向（冻结树 grep）：**无生产 import/实例化**。`review-v3-a25-c11-local-execution-ports.ts:2,78` 仅注释提及类名；测试 `review-v3-main-local-execution-orchestrator.test.ts:5-7`（`:56` 实例化）。

出向：`@profer/shared`（`C0ContractError`、`RunEvidenceIdentity`）；类型：`review-execution-event-adapter.ts`（`V3ReviewToolCall`）、`review-v3-background-technical-coordinator.ts:15-18`（A22 请求/任务/协调器）、`review-v3-a-host-technical-handoff.ts:19-20`（`A22TechnicalEvidenceHandoff`）、`review-v3-main-local-technical-review.ts:21-23`（`C11LocalCandidatePreview`/`C11MainLocalTechnicalReview`）。无 IPC、无磁盘。

## 5. 数据 I/O、读写与副作用

- 本文件无磁盘/网络；真实副作用在注入的 `background.run`（A SDK dispatch，`:74`）与 `physicalReview.inspect`（读案卷/原件，见 local-technical-review 手册）。
- 状态：`closed` 标志；其余全在依赖里。
- 幂等/取消：不重放（`:68`）；`stop/stopSession` 是唯一取消通道；`close` 后 execute 抛错。

## 6. 分支、失败、取消与恢复

| 失败 | 语义 | 行 |
| --- | --- | --- |
| `TRUSTED_C_MAIN_A_AND_HOST_PORTS_NOT_INSTALLED` | 抛 `C0ContractError('RECOVERY_REQUIRED',...)` | 54 |
| `INVALID_MAIN_EXECUTION_REQUEST` | 抛 | 71 |
| `MAIN_LOCAL_EXECUTION_DISPOSED` | 抛 | 57,112,116 |
| `NO_ACTUAL_CURRENT_MAIN_RUN` | 抛 | 60 |
| `A_SDK_DISPATCH_EFFECT_UNCERTAIN_REQUIRES_MANUAL_INSPECTION` | 返回 `recovery-required` | 75-76 |
| `MAIN_OWNER_OR_RUN_REVOKED_AFTER_A_SDK_AWAIT` | 返回 | 81-82 |
| `UNKNOWN_A_PROVIDER_EFFECT_OR_UNSEALED_TASK` / result.reason | 返回 | 86-87 |
| `A_HANDOFF_NOT_PINNED_TO_MAIN_RUN` | **抛** | 93 |
| `INDEPENDENT_C_PHYSICAL_HOST_OR_ORIGINAL_NOT_VERIFIED` | 返回 | 97-98 |
| `MAIN_OWNER_CHANGED_AFTER_C_PHYSICAL_HOST_CHECK` | 返回 | 101-102 |
| `UNRESOLVED_PROVIDER_OR_UNTRUSTED_TECHNICAL_DISPOSITION` | 返回 | 106-107 |

- 恢复语义：`recovery-required` 处置带 `officialSchoolApproved:false`、`businessWriteAllowed:false`（`:65-66`），要求人工检查；绝不把不确定副作用当成功（`:96` 注释）。
- 取消：`stop/stopSession` 透传（`:111-118`）；`close` 不取消已派出请求（`:122-123`）。

## 7. 权限与权威状态

- 无 sender 检查（无 IPC）；权威来自 `currentRun`（C 信任的当前 Case/Run/Grant，非 A 回显，`:42-43`）。
- 结果只产候选处置：`state:'candidate-manual-review'` 带 `preview`（其中 `officialSchoolApproved:false` 等固定，由 local-technical-review 保证）。
- `canSealCReviewRun` 必须为 false，否则抛错（`:92`）——A 不能声称可封正式 Run。

## 8. 修改影响面

- 改 `C11LocalExecutionDisposition` 影响未来接线方（当前无生产消费者）与测试。
- 改端口契约影响 `review-v3-a25-c11-local-execution-ports.ts`（A 侧端口，文件外）与 `review-v3-background-technical-coordinator.ts`。
- 改失败语义（抛 vs recovery）会改变测试断言（`:122-126` 期望 `resolves.toMatchObject({state:'recovery-required'})` 而非抛错）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.test.ts`（132 行，5 个 `test(`，详见该文件手册）：成功路径只给 manual-review、SDK await 期间 Owner 轮换 → recovery、未知 Provider/Host 缺失 → recovery、stop/close 语义、handoff/preview 声称权威 → recovery。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`A_HANDOFF_NOT_PINNED_TO_MAIN_RUN` 抛错分支、`INVALID_MAIN_EXECUTION_REQUEST`、`NO_ACTUAL_CURRENT_MAIN_RUN`、`result.state==='stopping'/'running'` 分支、真实 A SDK 集成均无用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无生产调用者 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`/`*.tsx`） | 模块名/类名仅注释与测试命中 |
| await 后多重复核 | 已证实 | `:77-88,100-107` |
| 失败双语义（抛 vs recovery） | 已证实 | `:63-67` 与 `:90-93` |
| 不重放、close 不取消已派出请求 | 已证实 | `:68,119-124` |
| A 侧端口实现行为 | 未知（文件外） | `review-v3-a25-c11-local-execution-ports.ts` 未逐行读 |
| 真实 SDK 副作用 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造校验 | §3.1 | 50-55 | covered |
| `execute` 全流程 | §3.2 | 69-110 | covered |
| `stop`/`stopSession`/`close` | §3.3 | 111-124 | covered |
| 失败语义 | §6 | 54-107 | covered |
| 权限 | §7 | 41-47,92 | covered |
| 抛错分支/真实 SDK | §9,§10 | — | unknown |
