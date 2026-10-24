---
path: packages/agent-fabric/src/node.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ee8ddbcdc77ecf1b36534e19920cf62ef0856c67
sha256: e6fa51db57c8183ec3bbf2149c699f0d44db0188882d6febd0ac3c6fe5383069
lines: 187
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/node.ts

## 1. 结论与边界

**Agent Node 模型与注册表契约**：agentId=稳定逻辑身份（路由/授权）、instanceId=进程身份（`:5`）；注册不直接授能力（`:6`）；多节点须独立端口/数据目录/权限（`:7`）。含进程内注册表实现与配对/Profile 隔离断言。纯逻辑，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentNodeStatus` | 常量组 | `:13` | online/busy/degraded/offline | |
| `EndpointTransport` | 常量组 | `:23` | local-http/in-process/mcp/remote-server | 传输=适配器类型（`:22`） |
| `AgentEndpoint` | 接口 | `:32` | transport/address? | 注释：第一阶段只允许 127.0.0.1，LAN/反代须显式配置独立认证（`:35-37`，本契约不表达） |
| `AgentNodePolicy` | 接口 | `:42` | allowDelegation/maxDelegationDepth | 注册侧委派边界，仍被任务 policy 收窄（`:41`） |
| `AgentNode` | 接口 | `:47` | 13 字段（agentId/instanceId/displayName/version/status/endpoint/capabilities/workspaceBindings/preset?/maxConcurrency/policy/registeredAt/lastHeartbeatAt） | version 不作身份（`:51`） |
| `WELL_KNOWN_AGENT_IDS` | 常量组 | `:65` | profer-stable/profer-dev/local-headless | 固定逻辑身份（`:64`） |
| `NodeProfile` | 接口 | `:77` | agentId/kind/port/userDataDir/sessionDir/logDir/workspacePath? | Stable/Dev 须完全独立（`:74-75`） |
| `assertProfileIsolation` | 函数 | `:89` | `(a,b): void` | 5 项冲突→`POLICY_VIOLATION`（`:90-102`） |
| `PairedClient` | 接口 | `:108` | clientId/clientName/credentialRef/grants/createdAt/lastSeenAt/revokedAt? | 凭据只存引用（`:107,111-112`） |
| `assertPairingActive` | 函数 | `:120` | `(client,now?): void` | 已撤销→`PAIRING_REVOKED`（`:121-126`） |
| `AgentRegistry` | 接口 | `:132` | register/heartbeat/deregister/get/discover | 任务 payload 不许自带 URL（`:131`） |
| `createInMemoryRegistry` | 函数 | `:148` | `(): AgentRegistry` | 见 §3 |
| `assertNodeRoutable` | 函数 | `:179` | `(node,agentId): AgentNode` | 缺失→`AGENT_NOT_FOUND`；offline→`AGENT_OFFLINE`（retryable:true）（`:180-186`） |

## 3. 内部逻辑与关键流程

`createInMemoryRegistry`（`:148-176`）：`register` 按 agentId 覆盖（`:152-154`）；`heartbeat`/`deregister` **必须 agentId+instanceId 双匹配**，防旧实例迟到心跳覆盖新实例（注释 `:145-146`；实现 `:155-164`——deregister 不删除，置 `OFFLINE`（`:163`））；`get` 直取（`:165-167`）；`discover` 按 status/capability 过滤（`:168-174`）。`assertProfileIsolation`：port/userDataDir/sessionDir/logDir/workspacePath 任一相同记冲突（`workspacePath` 仅双方都定义时，`:95`）。

## 4. 调用者与调用链

- 入向（同包）：`gateway.ts:14-20`（AgentNodeStatus/assertNodeRoutable/AgentNode/AgentRegistry）。
- 测试：`contract-security.test.ts` 6 用例（`:105` AGENT_NOT_FOUND；`:110` AGENT_OFFLINE+retryable；`:122` 迟到心跳不覆盖；`:131` 共享 port/目录拒绝；`:143` 完全隔离通过；`:155` 撤销配对拒绝）+ `contract-gateway.test.ts` 路由 2 用例。
- 出向：`./protocol`、`./capabilities`（类型）。

## 5. 数据 I/O、读写与副作用

无 I/O；内存 Map（`:149`）实例状态；`register` 覆盖语义、`deregister` 置 OFFLINE 为内存行为。

## 6. 分支、失败、取消与恢复

失败=三类抛错（§2）；心跳/注销静默忽略不匹配（`:157,162`）；无取消机制。

## 7. 权限与权威状态

- 身份权威：agentId 稳定逻辑身份 + WELL_KNOWN_AGENT_IDS 寻址限制（`:64-69`）。
- 配对权威：`assertPairingActive`（撤销即拒）；凭据仅 `credentialRef`（`:107`）。
- 隔离权威：`assertProfileIsolation`（Stable/Dev 边界）。
- 注册**不授能力**（`:6`）——能力仍由 capabilities.ts 每次调用解析。

## 8. 修改影响面

注册表/断言语义影响 gateway 路由（`assertNodeRoutable`）、域外 fabric-server/fabric-config（未深读）；测试字面锁定（instanceId 双匹配、POLICY_VIOLATION 文案键）。

## 9. 测试证据

`NOT_RUN`。直接测试见 §4（6+2 用例，断言体逐条读，见 contract-security/contract-gateway 手册）。缺口：`discover` 过滤组合、`heartbeat` 更新后 discover 无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §2/§3 全部语义（双匹配/置 OFFLINE/5 项隔离/撤销拒绝） | 已证实 | `:13-187` 逐行 + 测试互证 |
| `AgentEndpoint.address` 的 127.0.0.1 限制由 Gateway 配置层承担 | 推断（注释声明） | `:35-37`；域外未核 |
| 跨进程发现（Phase 1 Gateway）语义等价性 | 推断 | 注释 `:142-144` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 导出对象 | §2 | 13-179 | covered |
| 注册表实现 | §3 | 148-176 | covered |
| 测试 | §9 | — | covered（缺口如实） |
