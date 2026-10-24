---
path: apps/electron/src/main/lib/channel-url-routing.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3ef895845421198e64c091f9edcc055ddadb62e
sha256: cbbbd34ea32a024d17ff8b96dba8a8aab1a6a5a26927132eb2531d5c555a78d0
lines: 142
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-url-routing.ts

## 1. 结论与边界

渠道 Chat/Agent URL **路由与迁移**（`:5` 注释红线："第三方网关不得被官方默认值迁移逻辑覆盖"）：Agent Base URL 推导（`inferAgentBaseUrl`）+ 配置 schema 归一（`normalizeChannelForCurrentSchema`/`normalizeConfigForCurrentSchema`）。核心历史教训（`:62-64`）：官方默认值曾被持久化进 `agentBaseUrl`，用户切 Base URL 后 Agent 仍打旧地址——"换了 URL 仍请求不到"的根因。

不做的事：不发请求；不改渠道列表（channel-manager）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `inferAgentBaseUrl` | `:56-87` | `(provider, baseUrl?, agentBaseUrl?) => string\|undefined` 推导 Agent 入口 |
| `normalizeChannelForCurrentSchema` | `:89-131` | 单渠道迁移归一 → `{channel, changed}` |
| `normalizeConfigForCurrentSchema` | `:133-141` | 整配置 map + changed 聚合 |

内部：`isOfficialDeepSeekHost:6-13`（hostname 精确 `api.deepseek.com`，URL 解析失败回退 includes）、`isOfficialDeepSeekAgentUrl:21-32`（官方 host + 路径 `/anthropic`/`/anthropic/v1`/`/anthropic/v1/messages` 三写法，`:31`）、`PI_NATIVE_BASE_URL_PROVIDERS:34-44`（9 provider 集合）、`isOfficialDeepSeekV1Url:46-54`（官方 host+`/v1` 或全文等值）。

## 3. 内部逻辑与关键流程

### `inferAgentBaseUrl`（`:56-87`）

- **deepseek 特判**（`:59-68`）：①显式非官方 Agent 入口优先（`:61`）；②官方 Agent 默认值**不再优先**于当前 Base URL（`:62-64` 注释根因）；`isAnthropicShapedEndpoint(baseUrl)`→normalize(baseUrl)（`:65`）；baseUrl 空/官方→`PROVIDER_DEFAULT_AGENT_URLS.deepseek`（`:66`）；否则跟随 baseUrl（`:67`）。
- 显式值通吃（`:70`）。
- `ollama`（`:72-75`）：normalize 后剥 `/v1` 尾；`anthropic-compatible`（`:77-79`）：复用 baseUrl。
- 兜底（`:83-86`）：默认表 ?? （Agent 兼容或 Pi 原生 9 者 → 复用 baseUrl，否则 undefined）——`:81-82` 注释：Pi 原生渠道无独立 Anthropic endpoint，须复用否则 undefined 入模型注册层。

### `normalizeChannelForCurrentSchema`（`:89-131`）

① xai 空 baseUrl 补官方默认（`:93-96`）；② deepseek 三分支（`:98-115`）：官方 Anthropic 地址→拆分（agentBaseUrl 保留/派生、baseUrl 归官方根）、官方 `/v1`→归根、空→补默认；③ 推导 agentBaseUrl 回写（`:117-121`）；④ `agentRuntimes` 缺失→`inferAgentRuntimeModes` 静默迁移（`:123-128`，注释：与迁移前门禁行为等价）。

## 4. 调用者与调用链

`channel-manager.ts`（配置装载/迁移时调用；同批另册）；出向：`@profer/shared`（Channel/ChannelsConfig/PROVIDER_DEFAULT_URLS/PROVIDER_DEFAULT_AGENT_URLS/inferAgentRuntimeModes/isAgentCompatibleProvider）、`@profer/core`（isAnthropicShapedEndpoint/normalizeBaseUrl）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

URL 解析失败回退字符串比较（`:10-12`、`:27-29`、`:51-53`）——**双实现容错**；分支全列 §3。

## 7. 权限与权威状态

**用户意图权威**（`:18-19`）：官方地址只是推导结果非用户意图，用户切网关后 Agent 不得回官方；显式 `agentBaseUrl`（非官方）优先级最高（`:61`/`:70`）。迁移只动官方形态（`:99-100` 注释：自定义网关含 /anthropic 不覆盖）。

## 8. 修改影响面

改推导逻辑影响全部渠道的 Agent 请求目标（历史 bug 根因区）；`PI_NATIVE_BASE_URL_PROVIDERS` 增删影响 Pi runtime 请求地址；迁移分支改动影响老配置兼容（silent migration，`:123-124`）。

## 9. 测试证据

直接测试 `channel-url-routing.test.ts`（11 `test(` + 1 `test.each` 8 例）：Anthropic 拆分迁移、推导、v1 归根、第三方网关不受覆盖、历史官方 Agent URL 跟随新地址、显式值尊重、官方三形态、anthropic-compatible 复用、openai/xai 复用、ollama 剥 /v1、8 个 Pi 原生 provider 复用表。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出 + 4 内部、路由/迁移全分支 | 已证实 | 文件全读 |
| "换了 URL 仍请求不到"根因注释 | 已证实 | `:62-64` |
| 官方判定双实现容错 | 已证实 | `:10-12`/`:27-29`/`:51-53` |
| `isAnthropicShapedEndpoint`/`normalizeBaseUrl` 行为 | 未知 | @profer/core 不在本批 |
| `inferAgentRuntimeModes` 推导规则 | 未知 | shared 侧 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 3 导出全量 | §2 | covered |
| 路由/迁移分支 | §3 | covered |
| 用户意图权威 | §7 | covered |
| 19 断言（11+8） | §9 | covered |
| 未知 | §10 | covered |
