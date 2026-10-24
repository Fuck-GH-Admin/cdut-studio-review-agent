---
path: packages/agent-fabric/src/contract-protocol.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98180c375cdacc090e90dde3f134c48738f54f7a
sha256: 4298195e666e03087ffca2dceb47f83ed2d91acd859dd23d8f0e3c9beb479b97
lines: 81
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-protocol.test.ts

## 1. 测试目标

`protocol.ts` 的 envelope 校验与 `IdempotencyLedger` 幂等语义（不启动真实 Agent 也能做契约测试，`contract-protocol.test.ts:3`）。bun:test；真对象直测，无 mock。

## 2. 用例清单

共 **8 个 `it(`**（计数核对），两 describe：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:17` | 接受当前版本合法 envelope | createEnvelope | validateEnvelope 不抛 | 独立 |
| `:23` | 拒绝不支持协议版本 | 手改 protocolVersion='0.9' | validateEnvelope | 独立 |
| `:34` | 拒绝空 requestId | requestId='  ' | validateEnvelope | 独立 |
| `:39` | 拒绝缺 actor.agentId | agentId='' | validateEnvelope | 独立 |
| `:46` | 同 requestId 重复提交命中首次结果 | begin+complete | 再 begin | 独立 |
| `:56` | 执行中并发重试被拒 | begin 未完成 | 再 begin | 独立 |
| `:68` | release 后同一 requestId 可重试 | begin+release | 再 begin | 独立 |
| `:75` | 不同 requestId 互不影响 | req_d1 完成 | begin req_d2 | 独立 |

## 3. 真实断言

- `:19-20` `envelope.protocolVersion` `toBe(PROTOCOL_VERSION)` + `validateEnvelope` 不抛。
- `:26,30` 抛 `ProtocolError` 且 `code` `toBe(PROTOCOL_VERSION_UNSUPPORTED)`。
- `:36,:41` 空 requestId/缺 agentId 均 `toThrow(ProtocolError)`。
- `:52-53` 重放 `replay?.status` `toBe('completed')`、`replay?.result` `toBe('task_1')`。
- `:63-64` `code` `toBe(DUPLICATE_REQUEST_IN_FLIGHT)`、`retryable` `toBe(true)`。
- `:72` release 后 `begin('req_c')` `toBeUndefined()`（可重试）。
- `:79` `begin('req_d2')` `toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`IdempotencyLedger.complete` 无 begin 记录时的 `VALIDATION_FAILED`、`release` 对 completed 记录不动、`ProtocolError.toShape()`。
- 脆弱点：错误码字面锁定（改名即破）。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例、断言行 | 已证实 | 全 81 行逐行读 |
| 与 protocol.ts 语义一致 | 已证实 | 逐条对照 `protocol.ts:120-192` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 用例 | §2/§3 | 17-80 | covered |
| 未覆盖点 | §4 | — | covered（如实） |
