---
path: packages/agent-fabric/src/protocol.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3bbfba933e9fc5200d074ea51febbd5bcae98a3e
sha256: 8caf4139ee81afcb96f2838c41b30d7113d0cd8a9b434ece419d695d257df061
lines: 192
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/protocol.ts

## 1. 结论与边界

Agent Fabric **协议基础层**：协议版本、统一请求/响应 envelope、29 个错误码、`ProtocolError`、幂等账本（`protocol.ts:1-7`）。所有传输适配器必须转换到本层模型，不许自带任务状态/持久化语义（`:5-6` 注释=契约要求）。纯逻辑，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：**13 条 export（12 对象 + 1 类型别名 `ProtocolErrorCodeValue`）**，逐条如下。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PROTOCOL_VERSION` | 常量 | `:10` | `'1.0'` | 主版本不兼容变更须提升 |
| `SUPPORTED_PROTOCOL_VERSIONS` | 常量 | `:13` | `[PROTOCOL_VERSION]` | 兼容窗口 |
| `ProtocolActor` | 接口 | `:16` | `{agentId, instanceId?}` | 只标识调用者，不带凭据（`:15`） |
| `ProtocolEnvelope<T>` | 接口 | `:26` | protocolVersion/requestId/actor/payload | requestId=重试幂等键；taskId 在 payload（`:23-24`） |
| `ProtocolResponse<T>` | 接口 | `:34` | ok 为 false 时 error 必填（`:33`） | |
| `ProtocolErrorCode` | 常量组 | `:46` | **29 个错误码**（命名即语义，`:44-45`） | 分组：协议/校验 4（`:48-51`）、节点/路由 4（`:53-56`）、权限/策略 9（`:58-66`）、任务生命周期 4（`:68-71`）、审批 4（`:73-76`）、产物 2（`:78-79`）、任务图 2（`:81-82`） |
| `ProtocolErrorCodeValue` | 类型别名 | `:85` | `(typeof ProtocolErrorCode)[keyof typeof ProtocolErrorCode]` | 错误码值联合 |
| `ProtocolErrorShape` | 接口 | `:87` | code/message/retryable/details? | `retryable=true` 可用新 requestId 重试（`:90`） |
| `ProtocolError` | 类（extends Error） | `:96` | `(code,message,opts?)` | `name='ProtocolError'`（`:103`）；retryable 缺省 false（`:105`）；`toShape()`（`:109-111`） |
| `createEnvelope` | 函数 | `:115` | `(actor,requestId,payload)` | requestId 由调用方生成、重试不变（`:114`） |
| `validateEnvelope` | 函数 | `:120` | `(envelope): void` | 见 §3 |
| `IdempotencyRecord<T>` | 接口 | `:137` | requestId/status('in_flight'\|'completed')/result?/createdAt | |
| `IdempotencyLedger<T>` | 类 | `:151` | `begin/complete/release` | 见 §3 |

## 3. 内部逻辑与关键流程

- `validateEnvelope`（`:120-134`）：①版本不支持→`PROTOCOL_VERSION_UNSUPPORTED`（非 retryable，`:121-127`）；②requestId 空/纯空白→`VALIDATION_FAILED`（`:128-130`）；③`actor.agentId` 空→`VALIDATION_FAILED`（`:131-133`）。
- `IdempotencyLedger`（`:151-192`）：`begin`（`:160-174`）——已有记录且 `in_flight`→抛 `DUPLICATE_REQUEST_IN_FLIGHT`（`retryable:true`，`:163-168`）；`completed`→返回缓存记录（重复提交不重复执行，`:170`）；首次→写 `in_flight` 返回 undefined（`:172-173`）。`complete`（`:176-183`）——无 begin 记录→`VALIDATION_FAILED`（`:178-180`）；写 completed+result。`release`（`:186-191`）——仅删除 `in_flight` 记录，让同一 requestId 可重试（注释 `:185`）。`now` 可注入（`:155-157`）。

## 4. 调用者与调用链

- 入向（同包）：`gateway.ts:22-29`（IdempotencyLedger/ProtocolError/createEnvelope/validateEnvelope）、`approval.ts:9`、`artifacts.ts:9`、`capabilities.ts:9`、`events.ts:8`、`node.ts:11`、`task-graph.ts:8`、`state-machine.ts:10`（均 ProtocolError/ProtocolErrorCode）。
- 测试：`contract-protocol.test.ts` 8 用例（§9）。
- 出向：无（基础层）。

## 5. 数据 I/O、读写与副作用

无 I/O。内存 Map（`IdempotencyLedger.records`，`:152`）为实例状态；无全局态。

## 6. 分支、失败、取消与恢复

失败分支全部为抛 `ProtocolError`（§3）；幂等恢复语义=`release()` 后同 requestId 可重试（`:185-191`）。无取消机制。

## 7. 权限与权威状态

无权限分支，依据：本文件无身份校验（`ProtocolActor` 仅标识不鉴权，`:15`）；鉴权在 capabilities/node/gateway 层。

## 8. 修改影响面

错误码/Envelope 是全包契约：改动影响 8 个同包模块 + 7 个域外 fabric-* 消费文件 + 全部 78 个契约测试断言（错误码字面被测试锁定，如 `contract-protocol.test.ts:30,63`）。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-protocol.test.ts`（81 行/**8 个 `it(`**）：envelope 组 4（当前版本合法 `:17-21`；版本 '0.9'→`PROTOCOL_VERSION_UNSUPPORTED` 且是 `ProtocolError` `:23-32`；空 requestId 拒 `:34-37`；缺 actor.agentId 拒 `:39-42`）；幂等账本组 4（完成重放缓存 `task_1` `:46-54`；in_flight 并发重试→`DUPLICATE_REQUEST_IN_FLIGHT`+`retryable=true` `:56-66`；release 后可重试 `:68-73`；不同 requestId 互不影响 `:75-80`）。无 mock（纯对象直测）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 29 错误码逐条、幂等三方法语义、envelope 校验三分支 | 已证实 | `:10-192` 逐行 + 测试互证 |
| **7 个错误码在本包内无抛出点**（PAYLOAD_TOO_LARGE/AGENT_BUSY/ENDPOINT_NOT_REGISTERED/CALLER_NOT_PAIRED/APPROVAL_NOT_FOUND/TASK_LEASE_EXPIRED/WORKSPACE_CONFLICT） | 已证实（否定结论） | grep `ProtocolErrorCode.<code>` 于 packages/agent-fabric/src（除 protocol.ts 定义）0 命中；推断由域外传输/适配层抛（未深读=边界） |
| 传输层遵守"不自带任务状态"契约 | 推断 | 注释契约（`:5-6`）；域外实现未核 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 条 export（12 对象+1 类型别名）+ 29 错误码 | §2 | 10-85 | covered |
| validate/幂等账本 | §3 | 120-192 | covered |
| 7 未用错误码 | §10 | — | covered（检索范围明示） |
| 测试 8 用例 | §9 | test 文件 | covered（NOT_RUN） |
