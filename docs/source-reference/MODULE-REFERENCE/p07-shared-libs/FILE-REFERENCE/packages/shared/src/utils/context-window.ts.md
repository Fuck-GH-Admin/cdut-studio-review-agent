---
path: packages/shared/src/utils/context-window.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cb9e6cb9e36a4f53cfb3cb4a8691ce8b60da9d4d
sha256: eaa558975a794b67371e51f3180c9570aadaadbd182bf4cdea4f7e71f4a3d22a
lines: 375
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/context-window.ts

## 1. 结论与边界

模型上下文窗口推断的**单一 source of truth**（`packages/shared/src/utils/context-window.ts:1-7`）：后端（agent-orchestrator 是否发 `context-1m-2025-08-07` beta）与前端（ContextUsageBadge 分母 fallback）必须共用同一判定，防「UI 显示 1M 实际 200K」。功能面：1M 代际家族规则、provider×模型已验证组合、`[1m]` 变体后缀解析/剥离、窗口数值推断、多模型 usage 选择。

边界：模型侧判定 ≠ provider 链路已协商 1M（`:139-141`）；`strip1MContextSuffix` 只在「模型 ID 即将出门」时用，不要用于规范化用户手填 ID（`:256-261`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEFAULT_CONTEXT_WINDOW` | const | 13 | `200_000` | |
| `ONE_MILLION_CONTEXT_WINDOW` | const | 16 | `1_000_000` | |
| `CODEX_GPT_CONTEXT_WINDOW` | const | 18 | `1_050_000` | GPT-5.4/5.5/5.6/6.x |
| `CODEX_GPT_54_MINI_CONTEXT_WINDOW` | const | 20 | `400_000` | 5.4 mini 实测更小 |
| `ModelUsageContextInfo` | interface | 35-37 | `{contextWindow?: number}` | |
| `normalizeContextModelId` | function | 43-45 | → `normalizeModelIdTail(modelId)` | 去 `[1m]` 尾段+保留网关前缀末段 |
| `isDeepSeekV4Model` | function | 54-57 | → `resolveDeepSeekV4ModelId` 后匹配 `/^(deepseek-flash\|deepseek-v4-pro)$/` | |
| `isNextGeneration1MContextModel` | function | 142-148 | `(modelId?) => boolean` | 纯模型侧 1M 家族判定 |
| `supports1MContext` | function | 163-170 | `(modelId) => boolean` | +`[1m]`/GLM-X-Preview 特例 |
| `inferContextWindow` | function | 193-203 | `(model?) => number\|undefined` | 名称推断 fallback |
| `supportsVerified1MContext` | function | 235-241 | `(modelId, provider?) => boolean` | 模型族 ∧ provider 白名单 |
| `resolveAgentSdkModelId`（重载） | function | 247-253 | `(modelId, provider\|boolean) => string` | 追加 `[1m]` 与否 |
| `strip1MContextSuffix` | function | 262-264 | `(modelId) => string` | |
| `OneMillionContextSource` | type | 267 | `'auto'\|'forced-on'\|'forced-off'` | |
| `OneMillionContextDecision` | interface | 269-276 | `{enabled; source; autoEnabled}` | |
| `resolveOneMillionContextDecision` | function | 286-295 | `(modelId, provider, explicit?) => OneMillionContextDecision` | 三态决策 |
| `AgentSdk1MSelection` | interface | 297-304 | `{modelId; oneMillionContextEnabled; source}` | |
| `resolveAgentSdk1MSelection` | function | 312-325 | → 后缀+beta **同决策** | |
| `inferAgentSdkContextWindow` | function | 328-338 | 显式偏好优先 | |
| `resolveContextWindowFromModelUsage` | function | 344-375 | 多模型 usage 选窗 | |

内部：`GPT_54_MINI_MODEL_ID`/`GPT_GENERATION_MIN_VERSION='5.4'`/`KIMI_K3_SHORT_MODEL_ID='k3'`/`DEEPSEEK_SHORT_MODEL_NAMES`（`:23-33`）、`parseVersionSegments`/`isVersionAtLeast`（`:60-77`，`.`/`-`/`_` 分段、缺段按 0）、`OneMillionFamilyRule`+`ONE_MILLION_FAMILY_RULES`（`:86-122`，10 家族：claude-sonnet-4+/opus-4.6+/fable-5+、gpt-5.4+（mini 排除）、deepseek-v4+（短名继承）、kimi-k3+、glm-5.2+、mimo-v2.5+（exact mimo-v2-pro）、minimax-m3+、grok-4.6+）、`matchesOneMillionFamilyRule`（`:124-134`：exact→shortNames 前缀→prefix+exclude→版本比较）、`isGptMiniSku`/`isCodexGenerationGptModel`（`:173-185`）、`AGENT_SDK_1M_PROVIDER_FAMILIES`（`:212-225`，13 provider）、`matchesFamilyPrefix`（`:227-229`，k3 精确、其余前缀）。

## 3. 内部逻辑与关键流程

- `isNextGeneration1MContextModel`（`:142-148`）：归一化→haiku 排除→`k3`/`k3[` 精确→家族规则 any。
- `supports1MContext`（`:163-170`）：空/false→false；haiku 排除；`[1m]` 尾 + `glm-x-preview` → true（显式声明特例，`:167-168`）；否则家族规则。
- `inferContextWindow`（`:193-203`）：gpt-mini（`gpt-5.4-mini` 精确 → 400K，其它 mini → 200K）→ Codex 世代 → 1.05M；`supports1MContext` → 1M；否则 200K。注释（`:190-192`）：SDK 流式不带 contextWindow，此为进度环分母 fallback。
- `supportsVerified1MContext`（`:235-241`）：provider 白名单 + 模型族 + 家族前缀匹配三重（Pi 运行时同判保证两链一致，`:233`）。
- `resolveOneMillionContextDecision`（`:286-295`）：显式 `true`→forced-on、`false`→forced-off、缺省→auto（白名单）；`autoEnabled` 恒为自动判定值。
- `resolveAgentSdk1MSelection`（`:312-325`）：**后缀与 beta 同一决策**（`:309-310`：只给其一不生效）；已有 `[1m]` 不重复追加。
- `inferAgentSdkContextWindow`（`:328-338`）：enabled→1M；forced-off→200K（不按名推断）；否则 `inferContextWindow`。
- `resolveContextWindowFromModelUsage`（`:344-375`）：preferred 精确匹配（canonicalize 去 `[1m]`+小写）→ 尾段唯一匹配 → 否则全表最大实测窗 → fallback 模型推断（`:342` 注释：避免误取首个子 Agent 模型）。

## 4. 调用者与调用链

出向：`../types/channel`（ProviderType）、`../types/deepseek-model-alias`（`DEEPSEEK_V4_SHORT_MODEL_NAMES`/`resolveDeepSeekV4ModelId`/`normalizeModelIdTail`，`:9-10`）。入向（检索=符号名+模块名，全冻结树，经 barrel `index.ts:15-32`）：

- **main**：`agent-session-usage.ts:24-26,80-106`（infer/resolveFromModelUsage）、`agent-orchestrator.ts:44-46,408,1238,1243`（strip1M/resolveAgentSdk1MSelection/inferAgentSdkContextWindow）、`agent-model-routing.ts:1,43`（supports1MContext）、`lightweight-completion.ts:13,44`、`adapters/pi-model-registry.ts:9-14,416-468`（ONE_MILLION/CODEX_54_MINI/supportsVerified1MContext）、`adapters/pi-codex-request-settings.ts:11,112`。
- **renderer**：`SearchDialog.tsx:44,365`（isDeepSeekV4Model）、`lib/model-1m-toggle.ts:12,31`（resolveOneMillionContextDecision）、`SDKMessageRenderer.tsx:77,223`、`hooks/useGlobalAgentListeners.ts:74,227,265`。
- 测试：`context-window.test.ts`（本批，39 test）、`agent-session-usage.test.ts:2,22-31`（常量）。
- **同名碰撞警示**：`pi-model-registry.ts:54` 本地另定义 `DEFAULT_CONTEXT_WINDOW = 200_000`（同值不同源，`pi-agent-adapter.ts:87` 用的是本地副本）。
- 零产品调用：`CODEX_GPT_CONTEXT_WINDOW`（仅内部 :200+单测）、`resolveAgentSdkModelId`（仅 barrel+单测）、`normalizeContextModelId`/`isNextGeneration1MContextModel`/`ModelUsageContextInfo`/`OneMillionContextDecision`/`AgentSdk1MSelection`。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数+常量表。

## 6. 分支、失败、取消与恢复

无异常路径（空入参短路返回 false/undefined/原值）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；但它是**跨端一致性契约**（`:1-7`）：后端 beta 注入与前端分母共享同一判定；`AGENT_SDK_1M_PROVIDER_FAMILIES` 是「已验证协商」的权威白名单（未列 provider 不追加后缀，`:208-210`）。

## 8. 修改影响面

- 改家族规则/白名单 → beta 注入、UI 分母、Pi 窗口注册三处联动（`:233`）。
- `resolveAgentSdkModelId` 重载语义（boolean=显式协商）被 SDK 调用点使用。
- 同步测试：`context-window.test.ts`（本批）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/context-window.test.ts`（本批，298 行；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 家族代际规则 + 自动继承 | 已证实 | `:102-134` |
| haiku/mini 排除、k3 精确匹配 | 已证实 | `:144-146,108,227-229` |
| `[1m]` 仅 glm-x-preview 显式特例 | 已证实 | `:167-168` |
| 后缀+beta 同决策 | 已证实 | `:309-324` |
| 三态决策（forced-on/off/auto） | 已证实 | `:286-295` |
| provider 白名单 13 项 | 已证实 | `:212-225` |
| 生产 caller 分布 | 见 UNVERIFIED 补记 | — |
| 真实 provider 协商结果 | 未知 | 静态规则，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 20 导出 | §2 | 13-375 | covered |
| 家族规则匹配 | §3 | 124-148 | covered |
| 窗口推断 | §3 | 193-203 | covered |
| 三态决策/SDK 选择 | §3 | 286-325 | covered |
| usage 选窗 | §3 | 344-375 | covered |
