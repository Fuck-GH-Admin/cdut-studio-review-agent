---
path: packages/benchmark-multihop/src/server.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7830e578dfb373061c7bdf8f53385cf1a276fa94
sha256: a6b2f7a21dfe111e3586fe720b33ad61fc1590bf9f2be1658d252743f8b88c14
lines: 208
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/server.ts

## 1. 结论与边界

独立轻量可视化测试程序**入口**（运行时代码，`Bun.serve`）：静态单页看板（零构建零外部依赖）、SSE 实时进度、三格式报告下载、经回环调度主程序隐蔽评测接口；「与主程序彻底解耦：仅依赖主程序启动时写出的回环握手文件」（`packages/benchmark-multihop/src/server.ts:1-13`）。

## 2. 导出与关键符号

无导出（可执行入口）。模块级：`HOST='127.0.0.1'`、`PORT=Number(process.env.CDUT_BENCH_UI_PORT ?? 7801)`（`:23-24`）；`summarizeDataset`（`:27-41`）、`resolveDataset`（`:44-47`）、`dashboardHtml`（`:50-56`，读 `public/index.html` 缺失回退错误页 HTML）、`json`（`:59-64`）、`sseFrame`（`:67-69`）；`server = Bun.serve({…})`（`:71-205`）。

## 3. 内部逻辑与关键流程

路由（`fetch` 分发，`:74-204`；QA F-NB41-01 校正——此前清单有虚构/错名，以下为源码实测）：

- `GET /` 或 `/index.html`（`:77-82`）：`dashboardHtml()`，`Cache-Control: no-store`。
- `GET /api/runtime`（`:85-98`）：`loadRuntimeInfo`+`health()` → `{connected, runtimeFilePath, endpoint}`；失败 `{connected:false, error:'RUNTIME_NOT_FOUND'|'UNKNOWN', message}`。
- `GET /api/datasets`（`:101-111`）：内置摘要 + 官方缓存摘要/`cached` 标志。
- `POST /api/datasets/download`（`:114-121`）：`loadOrDownloadOfficialDataset` → **JSON 直返** `{success, summary|message}`（无 SSE 进度帧）。
- `POST /api/run`（`:124-179`）：body `{dataset, engines, topK, concurrency}` → `ReadableStream` **SSE 流**（`text/event-stream` `:172-178`）：事件 `status`/`progress`/`done`（**报告经 done 帧下发** `{report, highlights}`——服务端不保存报告）/`error`（连不上主程序或异常 `:152/:165`）。
- `POST /api/export`（`:182-201`）：body `{report, format}`——缺 report 400（`:185`）；`buildReportBundle` 按 md|json|csv 输出，`Content-Disposition: attachment`（`:192-197`）。
- **`GET /api/report`、`GET /api/report/export` 不存在**（grep 零命中）；其余 404 `{error:'NOT_FOUND'}`（`:203`）。

启动日志两条（`:207-208`，含「请保持 CDUT Studio 桌面应用处于运行状态」提示）。

## 4. 调用者与调用链

入向：`bun run src/server.ts`（`packages/benchmark-multihop/package.json:12`）/bin（`:8-10`）/根 `benchmark:ui`（`server.ts:4` 注释）。出向：`node:fs`/`node:path`（`:15-16`）、`./dataset-loader`（4 函数，`:17`）、`./evaluator`（`:18`）、`./report`（`:19`）、`./runner`（`:20`）、`./types`（`:21`）、`Bun.serve`。

## 5. 数据 I/O、读写与副作用

- 读：`public/index.html`（`:52`）；经 runner 的回环 HTTP；经 dataset-loader 的网络/缓存。
- 写：无磁盘写（报告在内存 + 浏览器端下载）。
- 网络监听：`127.0.0.1:7801`（可 `CDUT_BENCH_UI_PORT` 覆盖）。
- 副作用：`console.log` 启动横幅；SSE 长连接。

## 6. 分支、失败、取消与恢复

- 页面缺失回退错误 HTML（`:53-55`）；runtime 未找到→`RUNTIME_NOT_FOUND`（区分 UNKNOWN，`:94`）；导出异常 500 `{success:false,message}`（`:198-200`）；未选引擎→前端拦截（index.html:232）。
- 无优雅停机逻辑（Bun.serve 默认）；评测进行中无取消端点（推断-静态：无 abort 路由）。

## 7. 权限与权威状态

无鉴权（本机回环开发工具）；主程序侧鉴权=握手 token（runner 携带）；报告权威=内存中最后一次 `runEvaluation` 结果。

## 8. 修改影响面

改路由影响 `public/index.html` 前端 fetch/SSE 帧协议（双侧同步，见 `index.html.md`）；改端口/握手流程影响使用方式。

## 9. 测试证据

无专属测试（冻结树 glob `**/server*test*` 本包零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 路由清单/端口/env 覆盖/降级分支 | 已证实 | `:23-208` |
| 无鉴权/无取消端点 | 已证实（静态） | 全文件无 token 校验/abort 路由 |
| Bun.serve 实际行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部路由+工具函数 | §2/§3 | 23-205 | covered |
| 失败降级 | §6 | 53-55/94/198-203 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
