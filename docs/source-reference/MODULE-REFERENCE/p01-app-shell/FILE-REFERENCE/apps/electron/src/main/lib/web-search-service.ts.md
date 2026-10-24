---
path: apps/electron/src/main/lib/web-search-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0320d88965d12fd441c591487b24ea759e036034
sha256: 5835b49b6aff1995d48e7364555ea9732ade5994cc64a8c7a67820f3909c0ab7
lines: 246
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/web-search-service.ts

## 1. 结论与边界

Tavily Web 搜索/抓取服务（246 行，头注释 `:1-8`）：app-hosted WebSearch/WebFetch 工具面（模型无原生 hosted web-search 时的稳定替代）。`/search` + `/extract` 两 API。**头注释称 "shared by Chat tools and Agent tools"，但冻结树检索仅 Agent 侧 `pi-builtin-tools` 消费**（注释与实际消费面差异，照实）。

**边界**：API key/工具开关在 `chat-tool-config`（跨批）；Tavily 服务为远端。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TavilySearchResult`/`TavilySearchResponse` | 接口（导出） | 22-37 | 结果/响应形状 | 含 answer/usage 等 |
| `WebSearchOptions` | 接口（导出） | 39-46 | `{query, maxResults?, searchDepth?, includeDomains?, excludeDomains?, signal?}` | 搜索选项 |
| `TavilyExtractResult`/`TavilyExtractFailedResult`/`TavilyExtractResponse` | 接口（导出） | 48-66 | 抓取形状 | 含 failed_results |
| `WebFetchOptions` | 接口（导出） | 68-74 | `{url, prompt?, extractDepth?, maxChars?, signal?}` | 抓取选项 |
| `isWebSearchAvailable` | 函数（导出） | 76-79 | `() => boolean` | `getToolCredentials('web-search').apiKey` 有值 |
| `isWebSearchEnabledForAgent` | 函数（导出） | 81-83 | `() => boolean` | 开关 && 可用 |
| `searchWeb` | 异步函数（导出） | 141-163 | `(options: WebSearchOptions) => Promise<TavilySearchResponse>` | Tavily /search |
| `fetchWebPage` | 异步函数（导出） | 166-184 | `(options: WebFetchOptions) => Promise<TavilyExtractResponse>` | Tavily /extract |
| `formatSearchResults` | 函数（导出） | 187-213 | `(data: TavilySearchResponse) => string` | 概要+编号列表 |
| `formatFetchResults` | 函数（导出） | 216-246 | `(data, {maxChars}) => string` | 编号标题+截断 |

内部：`getTavilyApiKey`（`:85-87`）、`clampInt`（`:89-92`）、`normalizeStringList`（`:94-98`）、`validateHttpUrl`（`:100-113`）、`fetchWithTimeout`（`:115-138`）、`postTavily`（`:125` 附近合并段）；常量 `TAVILY_SEARCH_URL`/`TAVILY_EXTRACT_URL`（`:12-13`）、`DEFAULT_TIMEOUT_MS=30_000`（`:14`）、`DEFAULT_SEARCH_RESULTS=5`、`MAX_SEARCH_RESULTS=10`、`MAX_FETCH_CHARS=20_000`（`:15-17`）。导出合计 13（§2 表逐条）。

## 3. 内部逻辑与关键流程

1. **searchWeb**（`:141-163`）：query trim 非空校验（`:142-143`）；`maxResults` clamp 1..10 缺省 5（`clampInt`）；`include_answer:true, include_raw_content:false`（`:147-151`）；include/exclude_domains 经 `normalizeStringList`（空数组→undefined）。
2. **fetchWebPage**（`:166-184`）：`validateHttpUrl` 仅 http/https（`:100-113`，无效 throw）；`include_images:false, format:'markdown'`；`maxChars` clamp 1000..80000。
3. **fetchWithTimeout**（`:115-138`）：AbortController + 30s 超时 abort；上游 `signal` 合并转发（`onAbort`），finally 清理监听/定时器。
4. **postTavily**：Bearer key POST；非 2xx 抛含 status+body(200 字符)。
5. **formatSearchResults**（`:187-213`）：answer 概要 + 编号列表（content 截 500，`:203`）+ score 三位小数；无结果兜底文案。
6. **formatFetchResults**（`:216-246`）：多结果编号标题（`# 1. <url>`，`:223`）；raw_content 截 `maxChars` 并标注 `[内容过长，已截断至 N 字符]`（`:226-228`）；`failed_results` 段（`:237-242`）；全空 → `'未提取到网页内容。'`（`:244`）。

## 4. 调用者与调用链

入向（全冻结树检索 `web-search-service`，1 文件）：`lib/adapters/pi-builtin-tools.ts:96`（import 块：`fetchWebPage`/`formatFetchResults`/`formatSearchResults`/`isWebSearchEnabledForAgent`/`searchWeb`）。`isWebSearchAvailable` 无外部调用（全树检索）。Chat 侧消费=无（注释差异照实，检索范围=baseline/source 全树）。
出向：`./chat-tool-config`（`getToolCredentials`/`getToolState`，`:10`）、fetch（网络）。

## 5. 数据 I/O、读写与副作用

- 网络：POST `api.tavily.com/search|extract`（API key 经 chat-tool-config 的 getToolCredentials）。
- 无盘 IO；副作用=外呼计费（usage.credits 字段提示）。

## 6. 分支、失败、取消与恢复

- 校验 throw：query 空/URL 无效/协议非 http(s)；`postTavily` 非 2xx throw（含 status+body）；超时 abort→fetch reject（调用方处理）。
- 取消：`options.signal` 上游取消转发（§3.3）。
- format 两函数无 throw，含兜底文案。

## 7. 权限与权威状态

**Tavily API Key 为访问凭据**（`getToolCredentials('web-search').apiKey`）；`isWebSearchEnabledForAgent` 用户开关门控。权威=chat-tool-config 配置（跨批）。

## 8. 修改影响面

pi-builtin-tools 的 WebSearch/WebFetch 工具面（Agent 运行时）；clamp 口径（1..10 结果/1k..80k 字符/500 content）是工具契约；Tavily 响应形状是外部契约。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `web-search-service` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试/真实网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出/clamp 口径/超时合并/格式化契约 | 已证实 | `:1-246` 全文逐行 |
| 消费面=仅 pi-builtin-tools（1 文件） | 已证实 | 全树检索（§4） |
| 头注释"Chat tools"与实际单消费面差异 | 已证实（差异事实） | `:2` vs §4 |
| Tavily API 真实行为 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 接口+3 门控函数（=13 导出） | §2 | 22-83 | covered |
| `searchWeb`/`fetchWebPage` | §3.1-3.2 | 141-184 | covered |
| `fetchWithTimeout`/`postTavily` | §3.3-3.4 | 100-138 | covered |
| 两 format 函数 | §3.5-3.6 | 187-246 | covered |
| 注释/消费面差异 | §1/§10 | 2 | covered |
