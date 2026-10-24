---
path: apps/electron/src/renderer/lib/model-logo.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8599dfc45a01649f24aa4f71dade0712b9b52e88
sha256: 9ff80dfcb0f53d5732e65317fb31e867b7c64558ac8af300eb0efc0481eba6fe
lines: 568
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/model-logo.ts

## 1. 结论与边界

模型/供应商/渠道 Logo 解析工具（568 行，头注释 `:1-11`）：按**正则键顺序匹配**模型 ID 定 Logo（静态 import 打包 PNG，Vite 资源）；深色双表；渠道 Logo 四级回退（模型→familyId/name→URL 域名→provider）；另有显示名/供应商解析。纯计算+静态资源。

**边界**：不含 Logo 资源本身（`@/assets/models/*.png`，45 个静态 import，机械计数）；渠道数据结构在 `@profer/shared`（跨批）；真实渠道别名数据的覆盖度未验证。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getModelLogoById` | 函数（导出） | 398-409 | `(modelId: string, isDark = false) => string \| undefined` | 正则顺序匹配，未命中 undefined |
| `getModelLogo` | 函数（导出） | 421-425 | `(modelId, provider?, isDark = false) => string` | byId ?? provider ?? DefaultLogo |
| `getProviderLogo` | 函数（导出） | 433-436 | `(provider: ProviderType, isDark = false) => string` | 供应商表，未命中 DefaultLogo |
| `getChannelLogo` | 函数（导出） | 507-534 | `(channel {provider, baseUrl, name?, familyId?, models?}, isDark = false) => string` | 四级回退 |
| `resolveModelDisplayName` | 函数（导出） | 542-551 | `(modelId, channels: Channel[]) => string` | 首个 name≠id 的别名，否则原 id |
| `resolveModelProvider` | 函数（导出） | 556-565 | `(modelId, channels) => ProviderType \| undefined` | 首个命中 channel.provider |
| `DefaultLogo`/`CDUTStudioLogo` | re-export（导出） | 568 | `export { DefaultLogo, CDUTStudioLogo }` | 默认/CDUT 图标 |

导出合计 7（机械核对 `^export `）。内部：`MODEL_LOGO_MAP`（`:118-214`，**54 正则键**，机械计数）、`MODEL_LOGO_DARK_MAP`（`:223-319`，同 54 键同序，`:219-221` 注释）、`PROVIDER_LOGO_MAP`/`PROVIDER_LOGO_DARK_MAP`（`:326-377`，`ProviderType` 全 **23 键**，机械计数）、`URL_LOGO_MAP`/`URL_LOGO_DARK_MAP`（`:448-487`，**17 域名规则**，同序）、`GENERIC_PROVIDERS`（`:490-494`，`{'anthropic','anthropic-compatible','custom'}`）、`COMPILED_LOGO_MAP`/`COMPILED_LOGO_DARK_MAP`（`:382-387`，预编译 `new RegExp(key,'i')`）。

## 3. 内部逻辑与关键流程

1. **getModelLogoById**（`:398-409`）：空 id → undefined（`:399`）；按 `isDark` 选预编译表（`:401`），顺序 `regex.test(modelId)` 首命中返回（`:402-406`）；未命中 undefined。键序即优先级：`gpt-5\.1*` 族在 `gpt-5` 前（`:131-135`）、`deepgemini/kimigemini/qwengemini/seedgemini` 在 `gemini` 前（`:145-153`，注释 `:144`）。
2. **深色表**（`:223-319`）：与亮色表**同键同序**；无暗色资源品牌回退亮色（kimi→`KimiLogo` `:267`、minimax→`MiniMaxLogo` `:307`、mimo→`XiaomiLogo` `:310`、embedding 族 `:317-318` 等），防"缺规则误命中更宽泛规则"（deepgemini 回退成 gemini 暗色，`:219-221` 注释）。
3. **getModelLogo**（`:421-425`）：`getModelLogoById ?? (provider ? getProviderLogo : undefined) ?? DefaultLogo`。
4. **URL 域名表**（`:448-487`）：**故意不含 anthropic 域名规则**（`:444-446`，#659：真 Anthropic 走 `getProviderLogo('anthropic')` 回退 Claude；第三方 anthropic-compatible（常以 `/anthropic` 结尾）不应被误判 Claude）。
5. **getChannelLogo**（`:507-534`）四级：①`channel.models` 逐个 `getModelLogoById` 首命中（`:516-519`）；②`[familyId, name]` 逐个 byId 首命中（`:521-524`）；③`GENERIC_PROVIDERS.has(provider) && baseUrl` 时按 URL 域名表顺序匹配（`:526-532`）；④`getProviderLogo` 兜底（`:533`）。注释（`:514-515`）：模型族虚拟渠道的 provider 表示请求协议不一定代表真实品牌。
6. **resolveModelDisplayName**（`:542-551`）：双层循环找 `model.id===modelId && model.name && model.name !== model.id` 返回别名（`:545`）；无则返回原 id。
7. **resolveModelProvider**（`:556-565`）：双层循环首个 `model.id===modelId` 返回 `channel.provider`（`:559-561`）；无则 undefined。

## 4. 调用者与调用链

入向（全冻结树检索 `model-logo` 及各导出，8 个生产文件）：
- `components/ai-elements/scroll-minimap.tsx:17`（`getModelLogo`+`resolveModelProvider`，`scroll-minimap.tsx:484`）。
- `components/shared/ModelSelector.tsx:31`（`getModelLogo`/`getChannelLogo`/`DefaultLogo`，`ModelSelector.tsx:445`）。
- `components/session-preview/SessionMiniMapPopover.tsx:18`（`SessionMiniMapPopover.tsx:402`）。
- `components/settings/ChannelForm.tsx:49`（`getProviderLogo`，`ChannelForm.tsx:96`）。
- `components/settings/ChannelSettings.tsx:15`（`getChannelLogo`，`ChannelSettings.tsx:382`/`ChannelSettings.tsx:473`/`ChannelSettings.tsx:490`）。
- `components/agent/AgentMessages.tsx:30`（三导出，`AgentMessages.tsx:251`/`AgentMessages.tsx:588`）。
- `components/agent/SDKMessageRenderer.tsx:47`（三导出，`SDKMessageRenderer.tsx:305`/`SDKMessageRenderer.tsx:932`/`SDKMessageRenderer.tsx:1104`）。
- `components/tabs/TabPreviewPanel.tsx:15`（`TabPreviewPanel.tsx:39`）。
- 间接静态测试（批外）：`apps/electron/scripts/dark-mode-guards.test.ts:15`（`MODEL_LOGO_FILE` 读本文件内容）→ `dark-mode-guards.test.ts:119-131` 断言每个导入的 `*_dark.png` 都注册进暗色映射表（文件级静态守卫）。
- 批内测试 `model-logo.test.ts:2`。
出向：`@/assets/models/*.png`（45 个静态资源 import，`:15-103`）、`@profer/shared`（`ProviderType` `:107`、`ChannelModel`/`Channel` 类型 `:512`/`:542`）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：纯函数+打包期资源）。副作用：无（返回资源 URL 字符串）。

## 6. 分支、失败、取消与恢复

- 分支：isDark 双表（`:401`/`:434`/`:527`）；四级回退短路（`:519`/`:524`/`:531`）；空 id/未命中回退（`:399`/`:435`/`:424`）。
- 无 throw/异步（不适用，依据：全文无 throw）。
- 恢复：不适用（无状态）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=四张映射表（键序即优先级）；URL 表的 #659 排除规则是防误判的品牌权威边界（`:444-446`）。

## 8. 修改影响面

- 8 个 UI 消费方的图标显示（§4）；键序变化会翻转匹配结果（如 `gpt-5\.1` 与 `gpt-5`）；暗色表必须与亮色表同键同序（`:219-221`，另有 `dark-mode-guards.test.ts:119-131` 静态守卫盯 `*_dark.png` 注册）。
- 新增品牌需同时改 4 表（亮/暗 model、亮/暗 provider 或 URL）。
- 需同步修改的测试：`model-logo.test.ts`（批内 6 用例）、`apps/electron/scripts/dark-mode-guards.test.ts`（批外静态守卫）。

## 9. 测试证据

直接测试：`lib/model-logo.test.ts`（批内，6 test，详见其手册）：Kimi 模型池/familyId 继承/provider 回退三级、claude_dark/gpt_dark 命中、无暗色回退亮色。间接证据：`apps/electron/scripts/dark-mode-guards.test.ts:119-131`（静态扫描断言 `*_dark.png` 导入均注册进暗色表，非行为断言）。
未覆盖：`getModelLogoById` 未命中、URL 域名表分支、`resolveModelDisplayName`/`resolveModelProvider`、键序边界（gpt-5\.1 vs gpt-5）。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四表结构/54+54+23+23+17+17 键数/四级回退/键序语义 | 已证实 | `:1-568` 全文逐行 + 机械计数 |
| #659 故意不含 anthropic 域名 | 已证实 | `:444-446` 注释 + URL 表实面 |
| 8 个消费方+批外静态守卫 | 已证实 | 全树检索（§4） |
| 别名覆盖度与真实渠道数据符合度 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 45 资源 import | §2/§4 | 15-103 | covered |
| `MODEL_LOGO_MAP`/`_DARK_MAP`（54 键/序） | §3.1-3.2 | 118-319 | covered |
| `PROVIDER_LOGO_MAP`/`_DARK_MAP` | §2/§3.3 | 326-377 | covered |
| `COMPILED_*` 预编译 | §2/§3.1 | 382-387 | covered |
| `getModelLogoById`/`getModelLogo`/`getProviderLogo` | §3.1-3.3 | 398-436 | covered |
| `URL_LOGO_MAP`/`_DARK_MAP`/`GENERIC_PROVIDERS`/#659 | §3.4/§7 | 448-494 | covered |
| `getChannelLogo` 四级 | §3.5 | 507-534 | covered |
| `resolveModelDisplayName`/`resolveModelProvider` | §3.6-3.7 | 542-565 | covered |
| re-export | §2 | 568 | covered |
