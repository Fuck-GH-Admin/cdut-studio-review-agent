---
path: packages/shared/src/constants/ofv-theme-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 36232af08326ebb0fbf18426a78d01fe07597071
sha256: f61195b0f0f20735f4ff5811cd3257f26ff21bf80c7bef7bc603ff46e9b9b2df
lines: 151
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/ofv-theme-bridge.ts

## 1. 结论与边界

Open File Viewer（OFV）主题桥接的**跨进程载荷契约单一真源**：定义会被烘进 viewer URL 的 Profer token 名单（`OFV_THEME_TOKEN_NAMES`，12 个）、值/载荷长度上限、字符白名单，以及「收口不可信输入」的 5 个纯函数（normalize/sanitize/trust/serialize/parse）。三方共用（`packages/shared/src/constants/ofv-theme-bridge.ts:1-21`）：渲染进程 `lib/ofv-theme-tokens.ts` 算值、主进程 `browser-preview-service`/`browser-controller` 校验与拼 URL、viewer 页 `viewer/main.ts` 解析回写。

边界：只传**值**不传皮肤 id/CSS（`:13-18` 三条理由：预览面只跟配色、不给不可信页面皮肤 CSS、自定义皮肤自动跟上）；名单与 `ofv-profer-theme.css` 消费变量的**漂移守卫在测试**（`apps/electron/src/renderer/lib/ofv-theme-tokens.test.ts:19-29`），不在本文件。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OFV_THEME_TOKEN_NAMES` | const | 33-46 | `as const` 12 项：`radius, background, foreground, muted, muted-foreground, raised-surface, surface-border, panel-surface, panel-border, primary, selection-bg, selection-color` | 恰等于 `ofv-profer-theme.css` 消费组（`:30-31`） |
| `OfvThemeTokenName` | type | 48 | 联合类型 | |
| `OfvThemeTokens` | type | 54 | `Partial<Record<OfvThemeTokenName, string>>` | 只带出现的 token（`:50-53`） |
| `OFV_THEME_TOKEN_VALUE_MAX_LENGTH` | const | 57 | `64` | 单值上限 |
| `OFV_THEME_TOKENS_MAX_LENGTH` | const | 60 | `2048` | 整份载荷上限（实测约 300，`:59`） |
| `OFV_PREVIEW_THEMES` | const | 69 | `['light','dark'] as const` | |
| `OfvPreviewTheme` | type | 70 | `'light'\|'dark'` | |
| `OfvThemePayload` | interface | 73-76 | `{theme?: OfvPreviewTheme; tokens?: OfvThemeTokens}` | 两项可缺省 |
| `normalizeOfvThemePayload` | function | 85-92 | `(input: unknown) => OfvThemePayload \| null` | IPC/URL 边界收口 |
| `isTrustedOfvThemeTokenValue` | function | 95-102 | `(value: unknown) => value is string` | 非空 + ≤64 + `TOKEN_VALUE_RE` |
| `sanitizeOfvThemeTokens` | function | 105-114 | `(input: unknown) => OfvThemeTokens` | 只留名单内且值可信 |
| `isEmptyOfvThemeTokens` | function | 117-119 | `(tokens) => boolean` | |
| `serializeOfvThemeTokens` | function | 128-138 | `(tokens) => string \| null` | 固定键序 JSON；空/超限 → null |
| `parseOfvThemeTokens` | function | 144-151 | `(raw: string \| null \| undefined) => OfvThemeTokens` | fail closed → `{}` |

内部：`TOKEN_VALUE_RE = /^[#a-zA-Z0-9(),.%/\t -]+$/`（`:66`，刻意排除 `;{}` `"'\` `<>`，`:63-65`）。导出计数：const 5 + type 4 + interface 1 + function 6。

## 3. 内部逻辑与关键流程

- `isTrustedOfvThemeTokenValue`（`:95-102`）：string 且 `length>0` 且 `≤64` 且正则通过。
- `sanitizeOfvThemeTokens`（`:105-114`）：输入非对象 → `{}`；仅遍历 `OFV_THEME_TOKEN_NAMES`（名单外键根本不看，`:109-111`）。
- `normalizeOfvThemePayload`（`:85-92`）：非对象输入 → null（`:86`）；`theme` 用 `OFV_PREVIEW_THEMES.find` 只认 light/dark（`:88`，非法明暗当作没给）；tokens 走 sanitize；`!theme && isEmpty(tokens)` → null（`:90`，调用方据此**不做任何重载**）；否则只带出现的字段（`:91`）。
- `serializeOfvThemeTokens`（`:128-138`）：先 sanitize 再按名单固定键序重建（`:131-135`，主进程拿这串做「已烘进 URL」比对，键序不定会导致每次同步误判变化，`:123-126`）；`JSON.stringify` 后超 2048 → null。
- `parseOfvThemeTokens`（`:144-151`）：`raw` 空或超 2048 → `{}`（不进 JSON.parse，`:145`）；`JSON.parse` 异常 → `{}`（`:146-150`）；结果再 sanitize。

## 4. 调用者与调用链

出向：无 import。入向（grep 全冻结树）：

- 渲染进程算值：`apps/electron/src/renderer/lib/ofv-theme-tokens.ts:13,25-38`（`OFV_THEME_TOKEN_NAMES` 遍历 `getComputedStyle` 取 `--<name>` 计算值；`:35-38` `readOfvThemeTokens`）。被 `useBrowserPreviewThemeSync.ts:5,43` 消费（主题同步时 `readOfvThemeTokens()`）。
- IPC 边界：`apps/electron/src/main/ipc.ts:134`（导入）、`:3034`（`OPEN_FILE_IN_BROWSER` 里 `normalizeOfvThemePayload(input) ?? undefined`）、`:3054-3056`（`REFRESH_BROWSER_PREVIEW_THEME`，null → 返回 0 不重载）。
- 主进程拼 URL：`apps/electron/src/main/lib/browser-preview-service.ts:4,81,89-91,105-129`——`ViewerPreviewTheme = OfvThemePayload`（`:81`）、`viewerPreviewThemeSignature` 用 `serializeOfvThemeTokens` 做签名（`:89-91`）、`createViewerPreviewUrl` 序列化进 `?tokens=`（`:122-128`）。
- viewer 页：`apps/electron/src/renderer/viewer/main.ts:32,111-118`——`parseOfvThemeTokens(params.get('tokens'))` 后写 `<html>` 内联 `--<name>` 变量（`:116-117`）。
- preload 类型引用：`apps/electron/src/preload/index.ts:354,366,2219,2226`（`OfvThemeTokens` 类型）。
- 间接测试/守卫：`apps/electron/src/renderer/lib/ofv-theme-tokens.test.ts:4,19-29`（**漂移守卫**：`ofv-profer-theme.css` 实际消费变量集合 == `OFV_THEME_TOKEN_NAMES`，双向相等断言）、`apps/electron/src/main/lib/browser-controller-preview-theme.test.ts:6`（类型）；CSS 注释 `apps/electron/src/renderer/styles/ofv-profer-theme.css:18,23`。

## 5. 数据 I/O、读写与副作用

无。纯函数 + 常量；JSON.stringify/parse 是唯一「序列化」动作，无 I/O。

## 6. 分支、失败、取消与恢复

- fail-closed 三处：`normalizeOfvThemePayload` 非对象/双空 → null（`:86,90`）；`serializeOfvThemeTokens` 空/超限 → null（`:130,137`）；`parseOfvThemeTokens` 空/超限/坏 JSON/非对象 JSON → `{}`（`:145-150`）。
- 无异常抛出（`JSON.parse` 包 try/catch）。无取消/恢复概念；「恢复」= 调用方对 null/空采取主题默认色（`browser-preview-service.ts:79`、`viewer/main.ts:116-117` 的 `var(--x, fallback)` 链）。

## 7. 权限与权威状态

无权限分支（无 sender/role 检查）。权威口径（`:26-31,51-52`）：值必须是 app 文档 `:root` 的**计算值**（`var()` 已展开），由渲染进程 `ofv-theme-tokens.ts` 采集、IPC 边界 `ipc.ts:3034,3054` 一次性收口（注释 `ipc.ts:3033`）；viewer 页拿到的都是已收口值。安全动机（`:62-66`）：值最终写进 CSS，字符白名单做兜底防注入。

## 8. 修改影响面

- 改 `OFV_THEME_TOKEN_NAMES`：必须同步 `ofv-profer-theme.css` 消费变量，否则漂移守卫测试红（`ofv-theme-tokens.test.ts:19-29`）；渲染采集、viewer 写回自动跟随名单。
- 改上限（57/60）或 `TOKEN_VALUE_RE`：影响 `serialize`/`parse` 边界与 `browser-controller-preview-theme.test.ts` 系列（间接）；主进程签名稳定性（`browser-preview-service.ts:89-91`）。
- 改键序约定（`:131-135`）：破坏 `viewerPreviewThemeSignature` 的稳定性 → 预览误重载（`:123-126` 注释）。
- `OfvThemePayload` 类型改动波及 `browser-preview-service.ts:81`、`ipc.ts`、preload 类型位。

## 9. 测试证据

直接测试 `packages/shared/src/constants/ofv-theme-bridge.test.ts`（116 行，10 个 `test(`）：

- `:15-28` 常见合法值过校验（HSL 三元组/hsl()/rgb()/hex/oklch/长度，8 例 `isTrustedOfvThemeTokenValue===true`）。
- `:30-43` 可疑值不过（空串/超长/含分号/花括号/引号/反斜杠/换行，8 例 false）。
- `:45-57` 往返：`parse(serialize(tokens))` toEqual 原对象 + 两次序列化逐字相同（键序固定）。
- `:59-62` 名单外键丢弃（`evil-token` 不出现）。
- `:64-71` 畸形载荷 fail closed（null/undefined/`''`/坏 JSON/字符串 JSON/非法值 → `{}`）。
- `:73-81` 12 token 各取 64 字符的最大序列化 ≤ 2048。
- `:83-88` 全空/全非法 serialize → null；`sanitize(null/'字符串')` → `{}`。
- `:90-92` 超长载荷在 parse 入口被拒（不进 JSON.parse）。
- 嵌套 `describe('normalizeOfvThemePayload')`：`:95-104` 只认 light/dark（`sepia` 当没给但 tokens 照收）；`:106-114` 双空/非对象/非法 theme/名单外/非法值 → null（7 例）。

缺口：`isEmptyOfvThemeTokens` 无直接断言（经 serialize/normalize 间接覆盖）；`OFV_PREVIEW_THEMES` 常量本体无断言。漂移守卫在外部 `ofv-theme-tokens.test.ts:19-29`（间接）。

**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 名单恰等于 CSS 消费组（双向） | 已证实（守卫测试存在）/测试未运行 | `ofv-theme-tokens.test.ts:19-29` 断言行；NOT_RUN |
| 值白名单排除 `;{}` `"'\` `<>` | 已证实 | `:63-66` |
| 键序固定、序列化确定性 | 已证实 | `:131-135`；测试 `:55-56` |
| IPC 边界 normalize 两点（open/refresh） | 已证实 | `ipc.ts:3034,3054` |
| viewer 页写内联 `--<name>` | 已证实 | `viewer/main.ts:116-117` |
| 主题签名比较避免误重载 | 已证实 | `browser-preview-service.ts:86-91` |
| 「实测约 300 字符」的说法 | 推断（注释） | `:59`；未复算 |
| 两个深色皮肤可区分 | 推断（注释+签名语义） | `browser-preview-service.ts:87`；NOT_RUN |
| `ofv-profer-theme.css` 消费变量的实时集合 | 未知（未读 CSS 全文） | 依赖守卫测试；CSS 不在本批 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 token 名单 + 3 个上限/类型 | §2 | 33-76 | covered |
| `TOKEN_VALUE_RE` | §2, §3 | 63-66 | covered |
| `isTrustedOfvThemeTokenValue` | §3 | 95-102 | covered |
| `sanitizeOfvThemeTokens` | §3 | 105-114 | covered |
| `normalizeOfvThemePayload` 两分支组 | §3 | 85-92 | covered |
| `serializeOfvThemeTokens` | §3 | 128-138 | covered |
| `parseOfvThemeTokens` | §3 | 144-151 | covered |
| `isEmptyOfvThemeTokens` | §3 | 117-119 | covered（无直接测试） |
| CSS 名单一致性 | §8 | 消费方 | partial（守卫测试 NOT_RUN） |
