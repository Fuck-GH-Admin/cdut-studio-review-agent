---
path: packages/agent-fabric/src/contract-security.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 78ffa581eca3287cff8014d0aff7ad6729f22fd9
sha256: 89bcd497c23615eef87c6feacfb2fdf35bf4c595f555d86e217ddf3acbd01323
lines: 284
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-security.test.ts

## 1. 测试目标

权限（grant ∩ 节点能力 ∩ policy）、Profile 隔离、审批一次性 token 不可重放、产物过期拒绝（`contract-security.test.ts:3-4`）。bun:test；capabilities/node/approval/artifacts 真实现直测。夹具 `makeNode`（`:35-51`，全能力/ONLINE/127.0.0.1）。

## 2. 用例清单

共 **20 个 `it(`**（计数核对），四 describe：

| 行 | 用例 | 要点 | 依赖顺序 |
| --- | --- | --- | --- |
| `:54` | Hermes 默认 grant 不含审批/重启/写/外发 | NEVER_DEFAULT_GRANTED 逐项 | 独立 |
| `:61` | 未授 workspace.write 即使节点支持也拒 | assertCapability | 独立 |
| `:74` | internal-only 对外部配对不可见 | SHELL_RUN 剔除、TASK_READ 保留 | 独立 |
| `:84` | internal-only 对 same-instance 可用 | SHELL_RUN 有效 | 独立 |
| `:93` | 任务 policy 白名单继续收窄 grant | TASK_CANCEL 被 policy 剔除 | 独立 |
| `:105` | 缺失节点抛 AGENT_NOT_FOUND | assertNodeRoutable | 独立 |
| `:110` | 离线节点拒路由且可重试 | AGENT_OFFLINE+retryable | 独立 |
| `:122` | 旧实例迟到心跳不覆盖新实例 | instanceId 双匹配 | 独立 |
| `:131` | 共享 port/数据目录拒绝注册 | assertProfileIsolation | 独立 |
| `:143` | 完全隔离 Profile 通过 | 同上 | 独立 |
| `:155` | 撤销配对后新请求立即拒 | assertPairingActive | 独立 |
| `:192` | 绑定匹配+未过期可消费 | assertApprovalConsumable | 独立 |
| `:196` | 过期必须重请求 | APPROVAL_EXPIRED | 独立 |
| `:205` | 跨任务使用拒 | APPROVAL_BINDING_MISMATCH | 独立 |
| `:214` | 跨 Agent 使用拒 | 同上 | 独立 |
| `:223` | 一次性 token 不可重放 | ApprovalTokenLedger | 顺序（先消费后重放） |
| `:235` | decision/request 不绑定直接拒 | APPROVAL_BINDING_MISMATCH | 独立 |
| `:248` | 过期产物拒读 | ARTIFACT_EXPIRED | 独立 |
| `:257` | completed+失败测试被一致性检查暴露 | findResultInconsistencies | 独立 |
| `:271` | failed 无 blocker/失败测试也被暴露 | 同上 | 独立 |

## 3. 真实断言

- `:56-57` 对 NEVER_DEFAULT_GRANTED 每项 `DEFAULT_PAIRED_AGENT_GRANTS` `not.toContain` + `CAPABILITY_READINESS[cap]` `toBe('requires-explicit-grant')`。
- `:71,:140,:152,:164,:193,:226` `toThrow(ProtocolError)`/不抛。
- `:80-81` `effective.has(SHELL_RUN)` `toBe(false)`、`has(TASK_READ)` `toBe(true)`；`:90` same-instance 下 `toBe(true)`；`:100` policy 收窄后 `has(TASK_CANCEL)` `toBe(false)`。
- `:117-118` `code` `toBe(AGENT_OFFLINE)`、`retryable` `toBe(true)`。
- `:126-128` 迟到心跳后 `lastHeartbeatAt` 仍 `toBe(100)`；新实例心跳 `toBe(200)`。
- `:201,:210,:219,:231,:242,:253` 各错误码精确断言（APPROVAL_EXPIRED/APPROVAL_BINDING_MISMATCH×3/APPROVAL_REPLAY/ARTIFACT_EXPIRED）。
- `:268,:282` `issues.length` `toBeGreaterThan(0)`。

## 4. 未覆盖与脆弱点

- 未覆盖：`resolveEffectiveCapabilities` 无 policy 集合的默认行为组合、`findResultInconsistencies` 空列表（一致）路径、`assertPairingActive` 未撤销路径。
- 脆弱点：错误码/就绪表值字面锁定；夹具协议版本 `PROTOCOL_VERSION`（`:181`）联动。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 用例、断言行、夹具 | 已证实 | 全 284 行逐行读 |
| 与 capabilities/node/approval/artifacts 实现一致 | 已证实 | 逐条对照各源文件 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 20 用例 | §2/§3 | 54-283 | covered |
| 未覆盖点 | §4 | — | covered（如实） |
