---
path: packages/shared/src/types/channel.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a5e3c592d82a7d3cdf411823718c26590068ab0
sha256: 03c9079df713a07f23904389e6d500d2ee84a1b427772fe3ecb4a3459437f7cb
lines: 572
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/channel.ts

## 1. 结论与边界

模型渠道**类型 + 凭据解析 + Agent 资格**模块（`packages/shared/src/types/channel.ts`，572 行）：ProviderType 白名单、默认 URL/标签表、Agent 内核资格推导、Zhipu 团队/Codex OAuth/xAI OAuth 三类凭据解析、Channel 配置形状、IPC 通道、配额窗口。含 12 个函数（逻辑集中在凭据与资格）。

## 2. 导出与关键符号

`export` 共 **38 个**，分 7 组：

**A. Provider 基础（`:11-135`）**：`XaiCredentialMode`（`:11`）、`ProviderType`（`:13-38`，含 anthropic/openai/deepseek/kimi 系/xiaomi 系/zhipu 系/ark/ollama/custom/xai/codex 等）、`PROVIDER_DEFAULT_URLS`（`:41-71`）、`PROVIDER_DEFAULT_AGENT_URLS`（`:73-86`）、`PROVIDER_LABELS`（`:88-118`）、`AGENT_COMPATIBLE_PROVIDERS`（`:120-137`）、`isAgentCompatibleProvider`（`:139-141`）。

**B. Agent 资格（`:144-191`）**：`AgentRuntimeMode = 'pi'`（`:144`）、`inferAgentRuntimeModes`（`:155-167`）、`isChannelEnabledForRuntime`（`:169-177`）、`resolveXaiCredentialMode`（`:179-185`）、`isAgentEnabledForChannel`（`:187-191`，`@deprecated` 兼容别名=Pi 资格）。

**C. Zhipu 团队凭据（`:194-235`）**：`ZhipuTeamCredentials`（`:194-198`）、`parseZhipuTeamCredentials`（`:205-230`）、`extractZhipuCodingTeamApiToken`（`:232-235`）。

**D. Codex OAuth（`:238-278`）**：`CodexOAuthCredentials`（`:238-243`）、`serializeCodexCredentials`（`:245-247`）、`parseCodexCredentials`（`:249-268`）、`isCodexCredentialExpired`（`:270-278`，`skewMs=60_000`）。

**E. xAI OAuth（`:280-318`）**：`XaiOAuthCredentials`（`:280-284`）、`serializeXaiCredentials`/`parseXaiCredentials`（`:286-304`）、`isXaiCredentialExpired`（`:306-309`）、`XaiOAuthDeviceCode`（`:311-318`）。

**F. Channel 形状（`:321-496`）**：`ChannelModel`（`:321-348`）、`Channel`（`:350-393`）、`ChannelCreateInput`/`ChannelUpdateInput`（`:395-429`）、`ChannelsConfig`（`:431-441`）、`ChannelTestResult`（`:443-449`）、`ModelAvailabilitySample`/`ModelAvailability`（`:451-465`）、`OfficialChannelHealth`（`:468-474`）、`FetchModelsInput`/`Result`（`:477-496`）。

**G. IPC/配额（`:499-570`）**：`CHANNEL_IPC_CHANNELS`（`:499-535`）、`ChannelPlanQuotaWindow`（`:537-555`）、`ChannelPlanQuotaResult`（`:557-570`）。

## 3. 内部逻辑与关键流程

### 3.1 Agent 资格（`:155-191`）

- `inferAgentRuntimeModes`：xAI 仅在 `agentExperimentalEnabled===true` 给 `['pi']`，其它 provider 恒 `['pi']`（`:160-165`）——注释（`:152-156`）：必须与迁移前等价（Pi 不受白名单限制、xAI 需实验开关）。
- `isChannelEnabledForRuntime`：`enabled` 为 false 直接 false；`agentRuntimes ?? infer…` 后 `includes(runtime)`（`:174-176`）——**勾选优先，缺失回退推导**（老配置不迁移也等价）。
- `resolveXaiCredentialMode`：**OAuth 结构优先**（`parseXaiCredentials(secret)` 成功即 `'oauth'`），防坏配置把 refresh token 当 API Key 发到 Chat（`:182-184`）；否则显式 mode 或 `api-key`。

### 3.2 Zhipu 团队凭据（`:200-235`）

`normalizeZhipuCredentialKey`（小写去 `_/-`，`:200-203`）；`parseZhipuTeamCredentials`：JSON（`{` 开头）或 `k=v` 分号/换行分隔（`:224-228`）→ `pick`（key 归一化后按 `apikey/apitoken/token/authorization/auth/bearer` 取 apiKey，organization/project 按 `bigmodel*`/短名取，`:208-222`）；无 apiKey 返回 `null`。`extractZhipuCodingTeamApiToken`：解析失败回落原 secret trim（`:233-234`）。

## 4. 调用者与调用链

- 消费方：channel-manager、各 Adapter（URL 推导）、设置页、凭据存储。测试：`channel-xai.test`/`channel-zhipu-team.test`/`channel.codex.test`（本批 3 篇）。
- 出向：无模块依赖（自足）。

## 5. 数据 I/O、读写与副作用

纯函数 + 常量表；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| Zhipu 空/无 apiKey | `:207`、`:221` | `null` |
| Zhipu JSON 解析失败 | `:227` | 回落分隔解析 |
| Codex 解析失败 | `:249-268` | `null` 不抛 |
| xAI 密文 OAuth 优先 | `:182-184` | 覆盖显式 `api-key` |
| 渠道 disabled | `:174` | 资格 false |

## 7. 权限与权威状态

- 凭据解析是**密文形态识别**（OAuth 优先保护 refresh token，`:183` 注释）。
- Agent 资格推导保证老配置等价（`:152-156`）。

## 8. 修改影响面

- `PROVIDER_*` 表与 `ProviderType` 联动；新 provider 需补默认 URL/标签/兼容集。
- `inferAgentRuntimeModes`/`isChannelEnabledForRuntime` 是配置迁移等价性的关键；改动须对齐历史行为（测试 7 用例锁定）。
- `CHANNEL_IPC_CHANNELS` 是跨进程契约。

## 9. 测试证据

- `channel-xai.test.ts`（7 用例）、`channel-zhipu-team.test.ts`（2 用例）、`channel.codex.test.ts`（10 用例）直接覆盖（见各测试手册）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 38 个导出、7 组 | 已证实 | `grep -n "^export"` 全表 |
| OAuth 优先保护 refresh token | 已证实 | `:182-184` |
| 资格勾选优先/缺失回退推导 | 已证实 | `:174-176` |
| Zhipu 多别名 key 归一化 | 已证实 | `:200-222` |
| Codex/xAI 过期 skew 默认 60s | 已证实 | `:270`、`:306` |
| Channel 存储/IPC 实现 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A Provider 基础 | `:11-141` | covered |
| B Agent 资格 | `:144-191` | covered |
| C Zhipu 凭据 | `:194-235` | covered |
| D Codex OAuth | `:238-278` | covered |
| E xAI OAuth | `:280-318` | covered |
| F Channel 形状 | `:321-496` | covered |
| G IPC/配额 | `:499-570` | covered |
