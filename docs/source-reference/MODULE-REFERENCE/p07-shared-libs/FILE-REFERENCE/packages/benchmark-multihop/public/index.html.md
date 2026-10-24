---
path: packages/benchmark-multihop/public/index.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9dffbc09d3a95b21cbfb5e9fce4e90f4f6585cea
sha256: 22a3f96fbafbb5c59a2265384e8b57d30eee04bed5b4240017b33b50f2b80150
lines: 440
kind: template
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/public/index.html

## 1. 入口与加载方式

MultiHop-RAG 评测看板**静态单页**（零构建、零外部依赖、无第三方脚本/字体请求）。由 `packages/benchmark-multihop/src/server.ts:50-56` 读取并以 `GET /` 或 `/index.html` 响应（`Cache-Control: no-store`，`server.ts:77-82`）。离线独立页面——数据全部经同源 `/api/*` 取得；产物=报告下载（浏览器端触发 `Content-Disposition` 附件）。

## 2. 脚本块与事件流

唯一内联 `<script>`（`:189-438`，纯 ES5+async/fetch，无框架）：

- 状态：`state={report,runtime,detailEngine}`（`:190`）；`$=getElementById`（`:192`）。
- `probeRuntime`（`:194-206`）：GET `/api/runtime` → 圆点 on/off + 文案（`RUNTIME_NOT_FOUND`→「未检测到主程序」）；**5 秒轮询**（`setInterval`，`:437`）。
- `loadDatasets`（`:208-216`）：GET `/api/datasets` → 内置/官方摘要文案。
- `runBenchmark`（`:230-273`）：校验至少一引擎（`:232`）→ POST `/api/run`（dataset/engines/topK，`:240-248`）→ **fetch + ReadableStream 手工解析 SSE 帧**（`getReader`+按 `\n\n` 切帧、抽 `event:`/`data:` 行 JSON.parse，`:250-266`；全文件无 EventSource、无 `/api/report*`——QA F-NB41-02 校正属实）→ `handleEvent`（`:275-289`）按 status/progress/done/error 分发。
- `downloadOfficial`（`:409-425`）：POST `/api/datasets/download` **JSON 响应**（无 SSE）；失败展示 message。
- `exportReport(format)`（`:393-407`）：POST `/api/export` body `{report, format}` → blob 下载 `multihop-rag-report.<ext>`。
- 渲染：`renderReport`（`:294-…`，聚合引擎卡+对比条）、`renderDetail`（`:351-…`，引擎/题型双 select 过滤逐题表）。（函数实名 renderReport/renderDetail——此前误作 renderMetrics/renderBars）
- 事件绑定（`:427-433`）：runBtn/downloadBtn/detailEngine/detailType/exportMd/exportJson/exportCsv。

## 3. DOM 契约

被脚本引用的 id：`runtimeDot`/`runtimeText`（`:199`）、`datasetSelect`/`datasetInfo`（`:215/:244`）、`engineClassic`/`engineGraphrag`（`:220-221`）、`topK`（`:234/:246`）、`runBtn`/`downloadBtn`（`:233/:427-428`）、`progressFill`/`phaseText`（`:226-227`）、`errorText`（`:232/:234`）、`resultCard`/`detailCard`（`:235-236`）、`engineMetrics`/`compareBars`（`:149/:151`）、`detailEngine`/`detailType`/`detailTable`（`:163-174`）、`exportMd`/`exportJson`/`exportCsv`（`:153-155`）。数据来源：`/api/*`（JSON + `/api/run` SSE 流）；表格列为 查询/题型/Hit@4/Hit@10/MRR/MAP@10/证据链完整（`:177-180`）。

## 4. 失败与降级

- `/api/runtime` fetch 失败→`{connected:false}` 红点（`:198`）。
- 引擎未选→`errorText` 提示（`:232`）。
- 下载失败→`datasetInfo` 展示 message/异常（`:418-421`）。
- 服务端页面缺失回退错误 HTML（`server.ts:53-55`，非本文件）。

## 5. 修改影响面

改 id/端点与 `server.ts` 路由契约双侧同步（§2/§3）；样式内联（`:7-187` CSS 自包含）无外部主题依赖。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单 script 块行段/事件绑定/DOM id 清单 | 已证实 | `:189-438` 逐行核对 |
| 零外部请求（字体/CDN） | 已证实（静态） | 全文件无外链 URL |
| 5s 轮询+SSE 手工帧解析 | 已证实 | `:437`、`:250-266`（fetch+ReadableStream，非 EventSource） |
| 浏览器实际渲染/下载行为 | 未知 | NOT_RUN（GUI） |

## 7. 覆盖表

| 区段 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| head/style | §1 | 1-187 | covered |
| script 逻辑/事件流 | §2 | 189-438 | covered |
| DOM 契约 | §3 | 120-186 | covered |
| 失败降级 | §4 | 198/232/418-421 | covered |
| 运行验证 | §6 | — | unknown（NOT_RUN） |
