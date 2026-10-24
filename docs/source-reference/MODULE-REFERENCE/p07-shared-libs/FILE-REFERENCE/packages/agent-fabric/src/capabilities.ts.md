---
path: packages/agent-fabric/src/capabilities.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 375f1ddc2ae9a8434d536084233ede4a4d007239
sha256: c4b06fac2f4f88bf20ee8e90c1c98bff87120d03d9c2606fbc50c3a3ee7811c3
lines: 150
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/capabilities.ts

## 1. 结论与边界

**能力目录与授权解析**：能力是独立授予的最小权限单元、无"全能 token"；有效能力=调用方 grant ∩ 目标节点能力 ∩ 任务 policy ∩ 信任前提，任一层拒绝即拒绝（fail-closed，`capabilities.ts:1-7`）。纯逻辑，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：**12 条 export（10 对象 + 2 类型别名 `CapabilityValue`/`TrustLevelValue`）**=3 常量组 + 3 常量数组 + 1 接口 + 2 函数 + 2 类型别名。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Capability` | 常量组 | `:12` | **19 个能力值**（任务面 6/工作区执行 4/运行时诊断 6/产物外发 3） | 新增能力须同步就绪表（`:11`） |
| `CapabilityValue` | 类型 | `:38` | | |
| `ALL_CAPABILITIES` | 常量数组 | `:40` | `Object.values(Capability)` | |
| `CAPABILITY_READINESS` | 常量表 | `:48` | 19 项 × `external-ready`(9) / `requires-explicit-grant`(6) / `internal-only`(4) | internal-only：AGENT_EXECUTE/SHELL_RUN/TEST_RUN/ARTIFACT_CREATE（`:49,57,58,66`） |
| `DEFAULT_PAIRED_AGENT_GRANTS` | 常量数组 | `:71` | TASK_SUBMIT/READ/CANCEL/ARTIFACT_READ（4 项） | 配对外部 Agent（如 Hermes）推荐默认 |
| `NEVER_DEFAULT_GRANTED` | 常量数组 | `:82` | TASK_APPROVE/RUNTIME_RESTART/WORKSPACE_WRITE/EXTERNAL_PUBLISH | 永不默认授予，须逐项显式勾选（`:79-81`） |
| `TrustLevel` | 常量组 | `:90` | 4 级：same-session(3)/same-instance(2)/paired-local-agent(1)/untrusted-local(0) | **loopback 不等于可信**（`:89`） |
| `TrustLevelValue` | 类型别名 | `:97` | `TrustLevel` 值联合 | |
| `isTrustAtLeast` | 函数 | `:106` | `(level, required): boolean` | TRUST_RANK 数值比较（`:99-104`） |
| `ResolveCapabilitiesInput` | 接口 | `:111` | callerGrants/callerTrust/nodeCapabilities/policyAllowedCapabilities? | |
| `resolveEffectiveCapabilities` | 函数 | `:126` | `(input): Set<CapabilityValue>` | 四层交集 |
| `assertCapability` | 函数 | `:142` | `(input, required): void` | 缺失→`CAPABILITY_DENIED` |

## 3. 内部逻辑与关键流程

`resolveEffectiveCapabilities`（`:126-139`）：遍历 callerGrants；节点能力缺失→剔除（`:132`）；policy 白名单存在且不含→剔除（`:133`）；`internal-only` 且信任 < `same-instance`→剔除（`:135`）；其余入集。`assertCapability`（`:142-150`）：结果集不含 required→抛 `CAPABILITY_DENIED`（details 含 required/callerTrust）。

## 4. 调用者与调用链

- 入向（同包）：`gateway.ts:14`（`assertCapability`，提交 `:228-231` 与任务操作 `:488-499`）、`approval.ts:8`（CapabilityValue 类型）、`node.ts:10`（同）。
- 测试：`contract-security.test.ts` 5 用例（§9）+ `contract-gateway.test.ts` 能力拒绝 2 用例间接。
- 出向：`./protocol`（ProtocolError）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用；纯常量+集合运算。

## 6. 分支、失败、取消与恢复

交集三分支（§3）+ `CAPABILITY_DENIED` 抛错；无取消路径。

## 7. 权限与权威状态

本文件即权限解析核心（权威规则）：grant 来自配对记录/会话身份（`:112-113` 注释）、node 能力来自注册、policy 来自任务；三者交集为有效授权，`internal-only` 额外要求信任级 ≥same-instance。`NEVER_DEFAULT_GRANTED`+`CAPABILITY_READINESS` 为静态权威表。

## 8. 修改影响面

19 能力/就绪表/信任级是全包授权基线；改动影响 gateway 全部 capability 断言、域外 fabric-pairing 配对授予（域外）与 contract-security 测试（字面锁定，如 `:57,80-81`）。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-security.test.ts` 5 用例（`:54` 默认 grant 不含 NEVER_DEFAULT_GRANTED 且就绪表=requires-explicit-grant；`:61` 未授 workspace.write 拒；`:74` internal-only 对 paired 不可见、TASK_READ 可见；`:84` internal-only 对 same-instance 可用；`:93` policy 白名单继续收窄）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 19 能力/就绪表 19 项/默认授予 4+4/交集语义 | 已证实 | `:12-150` 逐行 + 测试互证 |
| loopback≠可信（信任级参与解析） | 已证实 | `:89,99-108,135` |
| 域外配对层如何填充 callerGrants | 边界 | fabric-pairing 未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 条 export（10 对象+2 类型别名） | §2 | 12-142 | covered |
| 解析流程 | §3 | 126-150 | covered |
| 测试 5 用例 | §9 | test 文件 | covered（NOT_RUN） |
