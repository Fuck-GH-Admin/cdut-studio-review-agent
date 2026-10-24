---
path: packages/shared/src/types/reasoning-profile.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e6ca97dd93c50111df68658c7e5f52bcab56c7d
sha256: 18ba975ebc13428de7b1c99fbdfeae456797b2d8470977f5f1e1aed88627317c
lines: 467
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/reasoning-profile.ts

## 1. 结论与边界

**推理档位（thinking level）→ 各协议请求参数的映射注册表 + 解析函数**（`reasoning-profile.ts:1-467`）。红线：渠道名不能直接决定请求字段；profile 必须同时匹配模型 ID 与 transport，避免把 OpenAI 的 `reasoning_effort` 发到 Anthropic endpoint（`:15-16` 注释）。

## 2. 导出与关键符号（16 条）

| 符号 | 类型 | 行 | 形状/说明 |
| --- | --- | --- | --- |
| `ReasoningTransport` | type | `:6-10` | `'anthropic-messages'\|'openai-completions'\|'openai-responses'\|'other'` |
| `inferReasoningTransport` | function | `:18-36` | `(provider?) => ReasoningTransport`，switch 映射（§3） |
| `ReasoningEncodingKind` | type | `:39-45` | 6 种编码（adaptive-effort/deepseek-output-effort/openai-reasoning-effort/zai-thinking-effort/zai-toggle/anthropic-manual） |
| `ReasoningEffortMap` | type | `:48` | `Partial<Record<AgentThinkingLevel, string\|null>>`（null=该档位不支持） |
| `ReasoningEncoding` | interface | `:50-53` | `{kind, effortMap}` |
| `ReasoningProfile` | interface | `:55-61` | `{id: 9 字面量之一; levels; defaultLevel; normalize(level); encodings: Partial<Record<transport, ReasoningEncoding>>}` |
| `PiCatalogReasoningMetadata` | interface | `:64-67` | Pi catalog 最小元数据（`reasoning?/thinkingLevelMap?`） |
| `ReasoningCapability` | interface | `:74-78` | 跨进程传输形态（`source:'profile'\|'pi-catalog'`，不带 protocol encoding，`:72` 注释） |
| `ResolveReasoningCapabilityInput`/`ResolveReasoningProfileInput` | interface | `:80-88` | 解析入参 |
| `REASONING_PROFILES` | const | `:339-349` | 9 profile 注册表 |
| `resolveReasoningProfile` | function | `:352-381` | 按 modelId+transport 双匹配解析 profile（§3.1） |
| `resolveReasoningCapability` | function | `:399-420` | profile 优先、pi-catalog 兜底（§3.2） |
| `normalizeReasoningCapabilityLevel` | function | `:425-444` | 与 Pi `clampThinkingLevel` 一致：不可用档位先向高档位靠拢再回退（`:422-423` 注释），兜底 `levels[0]`（`:443`） |
| `normalizeReasoningLevel` | function | `:446-451` | `(profile?, level?) => level`（profile 存在才归一） |
| `supportsReasoningLevel` | function | `:465-467` | `transport !== 'other'`（§3.3） |

内部：9 组 LEVELS 常量（`:90-95` 6 组+GROK_46 `:165`+OPENAI_ASTRA `:306`+PI_EXTENDED_THINKING `:383`）、9 个 EFFORT_MAP/THINKING_LEVEL_MAP（`:100-166`，含 GROK_46；注释标注各模型官方映射差异；OPENAI_ASTRA_EFFORT_MAP 单列于 `:307`）、6 个 normalize 函数（`:174-230`）、9 个 profile 常量（`:232-337`）。

## 3. 内部逻辑与关键流程

1. **`inferReasoningTransport`**（`:18-36`）：openai/zhipu/doubao/qwen/custom/opencode-go-openai → `openai-completions`；openai-codex/openai-responses/xai → `openai-responses`；google → `other`；**default → anthropic-messages**。
2. **9 profiles**（`:232-337`）：deepseek-v4-flash/pro（`deepseek-output-effort`，low/xhigh 映射不同，`:97-99` 注释；off 用 `thinking:{type:'disabled'}` 而非 effort 值）、kimi-k3（anthropic 用 adaptive-effort + completions 用 openai-reasoning-effort）、glm-5.2（两协议两 map）、glm-5.3（toggle 型，仅 off/high 两档，`:144`）、grok-4.6（responses only）、openai-standard/max/astra（astra 含 `off:null` + 5 档，`:306-315`）。全部 `defaultLevel:'high'`。
3. **normalize 六态**（`:174-230`）：DeepSeek/K3 把 minimal/low 归 low、medium/high 归 high；GLM-5.2 xhigh|max→max；GLM-5.3 非 off 一律 high；OpenAI-standard off/minimal/max 特判；**default 回 'high'**。
4. **`resolveReasoningProfile`**（`:352-381`）：modelId 小写（`:353`）；OpenAI 推理模型判定 = `gpt-5*`/`gpt-6-astra`/`o1|o3|o4-*` 且非 `-chat-latest`（`:357-358`）；DeepSeek 经 `resolveDeepSeekV4ModelId` 归一（`deepseek-flash`/`deepseek-v4-pro` 前缀，`:362-366`）；k3/kimi-k3 正则（`:367-368`）、glm-5.3/glm-5.2/grok-4.6 精确（`:369-374`）；OpenAI 家族三分（astra/`gpt-5.6*`→MAX/其余 STANDARD，`:375-377`）；**末尾以 `profile?.encodings[transport]` 确认该 transport 有已验证编码，否则返回 undefined**（`:380`）。
5. **catalog 档位**（`getPiCatalogThinkingLevels` `:385-394`）：`reasoning:false` → 空（`:386`）；`xhigh/max` 仅在 catalog 显式映射时暴露（`:392`）；`mapped===null` 排除（`:390`）。`resolveReasoningCapability`（`:399-420`）：profile 优先（`:400-406`）；catalog 全空/全 off → undefined（`:410`）；defaultLevel 经 `normalizeReasoningCapabilityLevel`（`:411-414`）。
6. **`supportsReasoningLevel`**（`:453-467`）：注释红线——不做模型级精确匹配，Pi SDK 用 catalog clamp、Anthropic 原生 extended thinking 由 Pi `thinkingLevel` 直控（不走 effort 重写）；故只需排除 `other`（google）。

## 4. 调用者与调用链

- 入向（跨批实现，负向检索口径见 §10）：主进程 `resolvePiThinkingLevel` 与 renderer 思考档位菜单共用 `supportsReasoningLevel`（`:456-457` 注释自述）；编译器按 `ReasoningEncodingKind` 生成请求参数（`:38` 注释）。
- 出向：`./channel`（`ProviderType`）、`./agent`（`AgentThinkingLevel`）、`./deepseek-model-alias`（`resolveDeepSeekV4ModelId`，`:1-3`）。

## 5. 数据 I/O、读写与副作用

无 I/O；纯查找表+函数；确定性。

## 6. 分支、失败、取消与恢复

`resolveReasoningProfile` 空 modelId → undefined（`:354`）、无对应 transport 编码 → undefined（`:380`）；`normalizeReasoningCapabilityLevel` 高位优先扫描+低位回退（`:435-442`）兜底 `levels[0]`（`:434/:443`）；normalize 默认回 'high'。不抛错。

## 7. 权限与权威状态

无权限分支；协议正确性红线 = modelId+transport 双匹配（`:15-16`）。

## 8. 修改影响面

改映射表/normalize → 全厂商 thinking 请求参数（9 档位 profile）；`supportsReasoningLevel` 改动 → 主进程档位解析与 renderer 菜单共用判断（`:456-457`）。

## 9. 测试证据

**直接测试 2 文件（bun:test，NOT_RUN，断言见测试手册）**：`reasoning-profile.test.ts`（52 行）与 `reasoning-profile-xai.test.ts`（19 行）。本轮仅静态阅读；断言内容在同组测试手册逐条列出。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 导出+9 profile+10 map+6 normalize | 已证实 | 逐行读 `:1-467` |
| Pi SDK clamp/Anthropic 直控行为 | 推断 | `:459-463` 注释自述（SDK 未读） |
| 实际请求参数生成 | 未知 | 编译器（跨批）未读 |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 16 导出 | §2 | `:6-467` | covered |
| transport 映射/9 profile/normalize | §3 | `:18-337` | covered |
| resolveReasoningProfile/capability 解析链 | §3.4-3.5 | `:352-420`、`:425-444` | covered |
| supportsReasoningLevel 红线 | §3.6/§7 | `:453-467` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
