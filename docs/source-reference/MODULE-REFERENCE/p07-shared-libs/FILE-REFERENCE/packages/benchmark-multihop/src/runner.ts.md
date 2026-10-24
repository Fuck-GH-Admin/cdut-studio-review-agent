---
path: packages/benchmark-multihop/src/runner.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1115957b3ac82a001e715dec5c382b80bfd5712
sha256: ae945cc007ad8f5590c0e50e4d4d1e7ea6c54acb37b6884bffcd608e9d66d3a7
lines: 187
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/runner.ts

## 1. 结论与边界

主程序**隐蔽评测接口客户端**（运行时代码）：经本机回环直连 Electron 主进程静默启动的评测服务，完成会话创建/回收、纯文本语料注入（key→documentId）、双引擎（classic/graphrag）检索（`packages/benchmark-multihop/src/runner.ts:1-10`）。握手信息读取顺序：环境变量 → 开发配置目录 → 正式配置目录（`:9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/签名 | 说明 |
| --- | --- | --- | --- | --- |
| `EngineType` | 类型 | 17 | `'classic'\|'graphrag'` | 引擎 |
| `IngestDocument`/`IngestMapping` | 接口 | 20-31 | key/title/content；key/documentId/totalSections | 注入契约 |
| `SearchResultItem`/`SearchResult` | 接口 | 34-49 | 与主进程 `StudySearchResultItem` 同构 | 检索结果 |
| `BenchmarkRuntimeInfo` | 接口 | 52-57 | `{host, port, token, runtimeFilePath}` | 握手 |
| `BenchmarkRuntimeNotFoundError` | 导出类 | 60-69 | 构造收 `searched[]`，message 列检索路径 | 专属错误 |
| `loadRuntimeInfo` | 导出函数 | 84-103 | `(): BenchmarkRuntimeInfo` | 读握手文件 |
| `BenchmarkRunner` | 导出类 | 106-187 | 见 §3 | HTTP 客户端 |

内部：`candidateRuntimePaths`（`:72-81`）。

## 3. 内部逻辑与关键流程

- `candidateRuntimePaths`（`:72-81`）：`CDUT_BENCH_RUNTIME` → `PROFER_CONFIG_DIR/study-benchmark-runtime.json` → `~/.cdutai-dev/study-benchmark-runtime.json` → `~/.cdutai/study-benchmark-runtime.json`。
- `loadRuntimeInfo`（`:84-103`）：依序找文件；JSON 解析容错继续下一候选（`:98-100`）；需 `port:number`+`token:string`，host 空默认 `127.0.0.1`（`:92`）；全无抛 `BenchmarkRuntimeNotFoundError`。
- `BenchmarkRunner`（`:106-187`）：`baseUrl=http://host:port`；`post<T>` 统一 POST + `Authorization: Bearer <token>`（`:133-146`，非 2xx 抛 `评测服务调用失败：<path> → HTTP <status>`）；`health()` GET /health 异常返 false（`:123-130`）；`createSession`/`ingest`/`search`/`reset` 对应 `/v1/session`、`/v1/session/ingest`、`/v1/search`、`/v1/session/reset`（`:149-186`）；`reset` 吞错（回收失败不影响结果，`:183-185`）。

## 4. 调用者与调用链

入向：`packages/benchmark-multihop/src/evaluator.ts:9`（类型）+ 经 `BenchmarkRunner` 实例调用（`:260/:271/:288/:326`）；`server.ts:20`（`BenchmarkRunner`/`BenchmarkRuntimeNotFoundError`/`loadRuntimeInfo`）。出向：`node:fs`/`node:os`/`node:path`（`:12-14`）、全局 `fetch`。

## 5. 数据 I/O、读写与副作用

- 读：4 个候选握手文件路径（`study-benchmark-runtime.json`）。
- 网络：回环 HTTP（POST 4 端点 + GET /health），Bearer token 鉴权。
- 无写盘。副作用：无日志。

## 6. 分支、失败、取消与恢复

- 握手缺失/全损坏 → `BenchmarkRuntimeNotFoundError`（列已检索路径）；HTTP 非 2xx → 抛（health 吞错返 false）；`reset` 吞错。
- 无 AbortSignal/超时（fetch 默认——推断）；恢复=主程序重启后重新握手。

## 7. 权限与权威状态

鉴权=握手文件 token（Bearer）；token 权威=主程序写出的运行时文件；本程序不校验发送者（本地回环工具）。

## 8. 修改影响面

改端点/契约影响 evaluator 与主程序评测服务两侧；`SearchResultItem` 与主进程 `StudySearchResultItem` 同构契约（`:33` 注释）双侧同步。

## 9. 测试证据

无专属测试（冻结树 glob `**/runner*test*` 在本包零命中）；NOT_RUN；真实主程序服务未验证。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出+握手顺序+5 端点+token 鉴权 | 已证实 | `:52-187` |
| reset 吞错、health 吞错 | 已证实 | `:123-130/:183-185` |
| fetch 无超时 | 推断 | 调用无 AbortSignal/timeout 参数 |
| 真实评测服务行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 7 导出+客户端方法 | §2/§3 | 17-187 | covered |
| 握手降级/错误分支 | §3/§6 | 72-103/142-144 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
