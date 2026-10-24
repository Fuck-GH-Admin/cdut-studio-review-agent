---
path: apps/electron/src/main/lib/adapters/pi-mcp-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 899c75bb96741b8bbae149904c07c4b338fc06ad
sha256: c4014982450af0a076cd36f7fed22c669110f270067240a4765e87a4f3701872
lines: 478
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-mcp-tools.ts

## 1. 结论与边界

Pi Runtime 的**用户 MCP 工具桥接层**：Claude runtime 继续用 Claude Agent SDK 原生 `mcpServers`；Pi SDK 无等价参数，故 Profer 在主进程连接用户配置的 MCP server 并把 MCP tools 映射为 Pi customTools（文件头 `apps/electron/src/main/lib/adapters/pi-mcp-tools.ts:1-7`）。本函数族仅供 Pi runtime（`:403-406` 注释）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 1 个接口 + 6 个函数 = 8 个导出（类导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiMcpServers` | type（导出） | 40 | `Record<string,Record<string,unknown>>` | |
| `normalizeMcpToolNameSegment` | 函数（导出） | 75-79 | 段规范化（非 `[A-Za-z0-9_]`→`_`、去重/去边 `_`、空→`unnamed`、数字开头加前缀） | |
| `mcpToolName` | 函数（导出） | 81-83 | `mcp__<server>__<tool>` | |
| `getMcpPolicyToolName` | 函数（导出） | 140-142 | WeakMap 取原始策略名（否则 `tool.name`） | 策略判断不用 Pi 别名（`:374`） |
| `DiscoveredMcpTool` | 接口（导出） | 168-172 | `{serverName,config,tool}` | 保留原始身份（`:174`） |
| `discoverExternalMcpTools` | 函数（导出） | 175-201 | `(mcpServers)=>Promise<DiscoveredMcpTool[]>` | 并行连接+列举 |
| `buildPiMcpTools` | 函数（导出） | 203-231 | `(mcpServers,policy?)=>Promise<ToolDefinition[]>` | 构建 customTools |
| `disposePiMcpConnections` | 函数（导出） | 236-238 | `()=>Promise<void>` | app quit 清理（`:233-235`） |
| 常量族 | 内部 | 22-27 | 请求 60s/启动 30s/健康 120s/ping 5s/重试 2 | |
| `PiMcpServerConfig`/`McpConnection`/`McpToolBinding` | 内部 | 29-61 | 配置/连接/绑定形状 | |
| `stableStringify`/`configHash` | 内部 | 63-73 | 键排序 JSON；sha256 前 16 hex | 连接 key=`serverName:hash` |
| `getHeaders`/`getTimeoutMs`/`createTransport` | 内部 | 85-157 | stdio/http/sse 三 transport | |
| `isObjectSchema`/`toTypeBoxSchema`/`stringifyForTool`/`convertMcpResult` | 内部 | 159-211 | schema 转换与结果转 `AgentToolResult` | |
| `PiMcpClientManager` | 内部类 | 213-351 | dispose/disconnect/listTools/callTool/getConnection/createConnection | 单例 `manager`（`:378`） |
| `isConnectionAlive`/`isMcpConnectionError` | 内部 | 357-376 | ping 存活/连接级错误正则 | |
| `mcpPolicyIdentities`/`createPiMcpToolDefinition` | 内部 | 379-400 | WeakMap 策略名；工具定义工厂 | |

## 3. 内部逻辑与关键流程

### 3.1 Transport（`createTransport`，`:104-157`）

`stdio`：command 必填（缺→warn 跳过）、args 过滤字符串、env 过滤字符串、`stderr:'inherit'`；`http`：url 必填 → `StreamableHTTPClientTransport`（headers 可选）；`sse`：url 必填 → `SSEClientTransport`（headers 注入 requestInit 与 eventSourceInit 的 fetch）；其它类型 warn 跳过（`:155-156`）。

### 3.2 连接管理（`PiMcpClientManager`，`:213-351`）

- `getConnection`（`:293-315`）：key=`serverName:configHash`；已有连接先 `isConnectionAlive` 快速验证，失效则 `disconnect` 重建（`:299-307`）；新连接 promise 失败即从缓存删除（`:309-312`）。
- `createConnection`（`:317-350`）：`Client('profer-pi-agent-mcp-bridge/0.1.0')` + `connect(transport,{timeout:getTimeoutMs})`；包装 `onerror`/`onclose`（close 时清 healthTimer+缓存，`:327-337`）；健康定时器每 120s `isConnectionAlive`，失败移除+关闭（`:339-347`）。
- `listTools`（`:255-263`）：缓存 `connection.tools`；`client.listTools(timeout:60s)`；更新 `lastUsedAt`。
- `callTool`（`:265-291`）：循环 `attempt≤2` 重试——连接级错误（`isMcpConnectionError` 正则 `connection|disconnect|transport|econnrefused|econnreset|epipe|not connected|closed`，`:372-376`）时 `disconnect` 后重连；否则 break 后 `throw lastError`。`callTool` 带 `signal`、60s timeout、`resetTimeoutOnProgress:true`。
- `dispose`（`:221-236`）/`disconnect`（`:242-253`）：清 timer + `transport.close()`，异常忽略。

### 3.3 存活判定（`isConnectionAlive`，`:357-369`）

真实 `client.ping(5s)`（fire-and-forget）；ping 失败主动 `transport.close()`（由下次 `getConnection` 重建）；同步异常→false。注释记录历史缺陷：此前恒返回 true 是死代码、健康检查永不触发，断连恢复只靠 callTool 错误正则（`:353-356`）。

### 3.4 工具映射（`:384-431`）

- `createPiMcpToolDefinition`（`:384-400`）：`mcpToolName` 命名、description 兜底、`toTypeBoxSchema(inputSchema)`（仅 `type:'object'` 透传 `Type.Unsafe`，其余空对象，`:203-207`）、`execute`→`manager.callTool`→`convertMcpResult`。
- `convertMcpResult`（`:178-211`）：text/image 块直转；其它块 stringify；`toolResult`/`structuredContent` 追加文本；空内容兜底 stringify；`isError` 时前置 `MCP tool returned isError=true.`。
- `discoverExternalMcpTools`（`:175-201`）：过滤三类型、`Promise.allSettled` 并行 `listTools`，失败 warn 跳过（`:193-195`）。
- `buildPiMcpTools`（`:203-231`）：策略过滤（`isEffectiveAgentPresetToolDisabled`/`disabledTools` 按原始名或 Pi 别名，`:449`）；重名冲突 warn 跳过（`:450-453`）；`mcpPolicyIdentities.set(definition, originalName)` 保留策略身份（`:462`）。

## 4. 调用者与调用链

入向：Pi Agent 会话装配（`pi-agent-adapter.ts` 的 MCP 桥接）；`disposePiMcpConnections` 于 app quit/session 结束（`:218-220,233-235`）。测试：本批 `pi-agent-adapter.test.ts`（间接）；scope 无专属测试。出向：`@modelcontextprotocol/sdk`（Client/三种 Transport）、`@profer/shared`（preset 策略）、`typebox`、`@earendil-works/pi-coding-agent`/`pi-agent-core`/`pi-ai`（类型）、`node:crypto`。

## 5. 数据 I/O、读写与副作用

- 网络/子进程：stdio MCP 子进程、HTTP/SSE 连接（真实外部服务）。
- 副作用：模块级单例 `manager`（`:378`，连接池跨会话共享）；`console.warn/log`；定时器。
- 资源回收：`dispose`/`disconnect`/`onclose`/健康检查四路清理。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| transport 缺 command/url/未知类型 | warn + 跳过该 server | 108-109,124-125,135-136,155-156 |
| 连接级 callTool 错误 | ≤2 次重连重试 | 268-290 |
| 业务错误 | 直接 throw | 285-287 |
| ping 失败/transport close | 移除缓存，下次重建 | 361-365,333-337 |
| disposed 后调用 | `PiMcpClientManager 已关闭` | 256,266,294 |
| 策略禁用/重名 | 跳过该工具 | 449-453 |
| AbortSignal | 透传 `callTool` | 275 |

恢复语义：连接断开→自动重连；`isConnectionAlive` ping 失败→主动关闭+重建。

## 7. 权限与权威状态

- 工具启停权威=Agent preset 策略（`isEffectiveAgentPresetToolDisabled`/`disabledTools`，按**原始** `mcp__<server>__<tool>` 名判定，别名映射回 `getMcpPolicyToolName`，`:374,449,462`）。
- 用户配置的 MCP server 即信任边界（连接任意用户指定 command/url）。

## 8. 修改影响面

- 改命名/策略映射影响 preset 禁用判定与工具列表。
- 改连接池/重试语义影响稳定性与 app quit 清理（`disposePiMcpConnections`）。
- `convertMcpResult` 影响模型可见工具输出。

## 9. 测试证据

本批**无专属测试**（scope 未含）；间接：`pi-agent-adapter.test.ts`（桥接装配面）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

缺口（静态判断）：重试/健康检查/三 transport/convert 各分支无专属断言证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 Pi runtime 使用（Claude 不经此） | 已证实 | `:403-406` |
| 策略按原始名判定（别名不冒充） | 已证实 | `:374,449,462` |
| 连接级错误重连（≤2） | 已证实 | `:268-290,372-376` |
| ping 存活判定 + 历史死代码修复注释 | 已证实 | `:353-369` |
| 单例连接池 + 四路清理 | 已证实 | `:378,221-253,333-347` |
| 真实 MCP 服务行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| transport 三型 | §3.1 | 104-157 | covered |
| 连接池/重试/健康 | §3.2,§3.3 | 213-369 | covered |
| 工具映射/结果转换 | §3.4 | 159-211,384-400 | covered |
| 发现/构建/策略 | §3.4 | 175-231,443-471 | covered |
| 清理 | §5 | 221-253,476-478 | covered |
| 真实服务/测试 | §9,§10 | — | unknown |
