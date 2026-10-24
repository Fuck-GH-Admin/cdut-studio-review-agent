---
path: apps/electron/src/main/lib/review/review-execution-event-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be2ad9195991ecfef3068f80295d74fdc0bf629f
sha256: 1e2b6865c1362d2bc21fa3b5cf177d7479f70c35e9b2fa7ebfcdd7161609e125
lines: 276
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-execution-event-adapter.ts

## 1. 结论与边界

Dev-A **持久提案 outbox**：把已认证的 Main 拥有工具结果转成冻结 C0 `ExecutionEvent`；**从不写 ReviewRun/Check/Decision**（`apps/electron/src/main/lib/review/review-execution-event-adapter.ts:1-4`）。C0/1 缺 eventId/checkKey/outcome/terminal 变体——本地投递摘要只是 outbox 键，**不是**新共享执行协议（CR-A-001，`:5-6`）。

边界：`V3ReviewToolCall`（`:31-38`）是全 A 链共享的调用身份形状（a-host/a23/a25/bridge/driver/turn-budget 均 import 本文件该类型）；事件 journal 内容自带 sha256 封印（`SealedEvents`，`:30`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3EventDelivery` | interface | 17-20 | `{deliveryId; event: ExecutionEvent}` | |
| `V3ReviewToolCall` | interface | 31-38 | `{sessionId; grantId; senderKey; principal: Principal; tool: V3ReviewTool; source?: SourceIdentity}` | A 链共享调用形状 |
| `V3ExecutionEventAdapter` | class | 85-276 | 构造 `(persistence: OwnerPersistence, owners: V3ReviewOwnerAdapter)`；`proposeRead/proposeCheck/failAttempt/stopAttempt/pending/acknowledge/guardedRead` | |

内部：`DeliveryRecord`（`:21-25`，+acked+physicalSourceDigest 私有元数据）、`EventDisk`/`SealedEvents`（`:26-30`）、`sha/initial/load/seal`（`:39-83`）、`key`（`:111-113`，`attemptId:generation`）、`append`（`:118-187`）。

## 3. 内部逻辑与关键流程

### 3.1 journal 完整性 `load`（`:41-80`）

空→initial；解析失败/版本不符/摘要不符 → `RECOVERY_REQUIRED`（`:45-50`）；逐 attempt：nextSequence≥1 安全整数、逐 record `assertC0ExecutionEvent` + physicalSourceDigest 64hex + sequence 连号 + key 自指 + `deliveryId===sha(JSON(event))` + acked 布尔 + **terminal 后不得有记录**（`:51-74`）；`seq+1===nextSequence` 且 terminal 标志一致（`:75-77`）。

### 3.2 `append`（`:118-187`）

busy 互斥（`:120-121`）→ `assertFresh`（另一进程改 journal → 拒绝陈旧序列/ACK，`:94-99`）→ `owners.withAuthorizedEvent(...)` 授权回调内：①**receiptId 幂等**（`:136-151`）：同 attempt 内重复 receiptId 且 eventKind/permissionGrantId/sourceVersionId/physicalSourceDigest 全同 → 返回原 delivery（SDK 重投递不产生第二提案）；不同 → `REQUEST_ID_COLLISION`（注释 `:132-135`：receipt 复用到另一物理块是碰撞不是证明）；②已 terminal → `RUN_IDENTITY_MISMATCH`（`:152-154`）；③构造 event（sequence=nextSequence，`:155-161`）→ `assertC0ExecutionEvent` → `deliveryId=sha(JSON(event))` → store（compareAndWrite 优先，`:103-107`）。

### 3.3 公共入口

- `proposeRead`（`:188-201`）：工具须 `review_read_documents`/`review_inspect_document_image`/`review_inspect_original`（否则 `CASE_SCOPE_FORBIDDEN`）；须有 source+receiptId（`SOURCE_STALE`）；eventKind `read-receipt-proposal` 带 sourceVersionId。
- `proposeCheck`（`:202-209`）：仅 `review_submit_result` + receiptId；`check-proposal`。
- `failAttempt`/`stopAttempt`（`:214-219`）：`failed`/`stopped` 终态事件；注释 `:210-213`：无合成 completed/business-pass（CR-A-001 前技术终态保持 failed/partial）。
- `pending`（`:221-226`）：未 acked 投递（结构化拷贝）。
- `acknowledge`（`:228-246`）：Dev-C ACK 须匹配 attempt/generation/sequence/id 四元（`:227`）；deliveryId 哈希核对、全 JSON 相等、**先序未 ack 不得跳序 ACK**（`:239`）；幂等（已 ack 返回 true）。
- `guardedRead`（`:253-275`）：execute 前后双 `assertAuthorized`（`:257-261`，注释：每次 await 后重读授权）；receipt 的 actualSource 八字段与 call.source 全等（`:262-271`，`SOURCE_STALE`）；`append` 前再核权（`:273-274`）。

## 4. 调用者与调用链

出向：`node:crypto`、`@profer/shared`（`REVIEW_C0_SCHEMA_VERSION`/`assertC0ExecutionEvent`/`C0ContractError`+类型）、`./review-pi-owner-adapter`（类型）（`:8-15`）。

入向（检索=符号名+模块名，全冻结树）：

- `V3ReviewToolCall` 类型（type-only）：10 个调用方——`review-v3-execution-proposal-producer.ts:17,224,335,366,397`、`review-v3-a-host-technical-handoff.ts:9,61`、`review-v3-execution-turn-budget.ts:14,143`、`review-v3-a23-physical-host-observer.ts:17,107`、`review-v3-sdk-dispatch-fence.ts:17,136,208,252`、`review-v3-a25-c11-local-execution-ports.ts:13,38,55,88,161,176,180,191,210`、`review-v3-main-sdk-turn-bridge.ts:10,80,97,123`、`review-v3-main-local-execution-orchestrator.ts:14,43,56`、`review-v3-technical-sequence-driver.ts:12,57`、`review-v3-background-technical-coordinator.ts:15,50,56`。
- `V3ExecutionEventAdapter` **类**：全冻结树零实例化/零引用（检索式=类名+模块名，仅定义行 `:85`）——**死类**（当前无装配点）。
- `V3EventDelivery`：仅本文件自用（零外部引用）。
- 间接测试：无任何测试文件引用本模块或其符号（`*.test.ts` 全树零命中）。

## 5. 数据 I/O、读写与副作用

- 持久化：经注入 `OwnerPersistence`（compareAndWrite/write，`:103-107`）存封印 journal（`seal` 包 sha256，`:81-83`）。
- 内存：`disk`/`revision`/`busy`；结构化拷贝隔离。
- 幂等：receiptId 去重（`:136-151`）、ACK 幂等（`:238`）。
- 副作用=抛 `C0ContractError`（RECOVERY_REQUIRED/REQUEST_ID_COLLISION/RUN_IDENTITY_MISMATCH/CASE_SCOPE_FORBIDDEN/SOURCE_STALE）。

## 6. 分支、失败、取消与恢复

- journal 损坏/篡改 → `RECOVERY_REQUIRED`（不修复不覆盖，`:45-77`）。
- 跨进程竞态：`assertFresh` 在 store/pending/acknowledge/append 前置（`:94-99`），陈旧 revision 一律拒绝。
- terminal 封存：`failed`/`stopped` 后再 append → 拒绝（`:152-154`）；终态后无记录（load 校验 `:71-73`）。
- 无取消 API；`stopAttempt` 即受控终态。

## 7. 权限与权威状态

`withAuthorizedEvent`/`assertAuthorized` 三处授权重读（`:124-126,257-261`+append 前 `:123`）。权威否定（`:1-4,5-6,210-213`）：不写 ReviewRun/Check/Decision；`physicalSourceDigest` 是私有 outbox 元数据非 C0 事实（`:23`）；无合成 completed。`V3ReviewToolCall.principal` 为 Main 注入身份。

## 8. 修改影响面

- `V3ReviewToolCall`/`V3EventDelivery` 是 A 链共享契约（7+ 模块 import），改动波及全链。
- `load` 校验口径改变会使旧 journal 不兼容（RECOVERY_REQUIRED）。
- `acknowledge` 顺序约束（`:239`）与 proposal-producer/bridge 的 ACK 流程耦合。

## 9. 测试证据

本批**无**直接测试文件；全冻结树**无任何测试文件**引用本模块或其符号（`*.test.ts` 零命中）。`V3ExecutionEventAdapter` 零实例化 → append/pending/acknowledge/guardedRead 的全部分支事实上无执行路径与测试锚。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| journal 封印+全链重放校验 | 已证实 | `:41-83` |
| receiptId 幂等/碰撞分治 | 已证实 | `:136-151` |
| 终态封存 | 已证实 | `:71-73,152-154,175` |
| ACK 顺序+四元匹配 | 已证实 | `:228-246` |
| guardedRead 前后双授权 | 已证实 | `:257-261` |
| 不写 ReviewRun/Check/Decision | 已证实 | 全文无此类写入 |
| `V3ExecutionEventAdapter` 零实例化（死类） | 已证实（否定结论，检索式=类名+模块名，全冻结树仅定义行） | grep + 子 agent 调查 |
| 类未来装配方式 | 未知 | 无调用点可考 |
| 跨进程真实并发 | 未知 | assertFresh 语义 NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | 17-85 | covered |
| `load`/`seal` | §3.1 | 39-83 | covered |
| `append` 三闸 | §3.2 | 118-187 | covered |
| 六公共方法 | §3.3 | 188-275 | covered |
| 装配点 | §10 | — | unknown |
