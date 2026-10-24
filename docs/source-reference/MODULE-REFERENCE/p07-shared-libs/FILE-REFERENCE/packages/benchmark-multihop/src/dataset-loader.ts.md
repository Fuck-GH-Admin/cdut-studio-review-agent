---
path: packages/benchmark-multihop/src/dataset-loader.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 93e6469bf9ebc8ebff135768d331887d086885a1
sha256: 5ee629afc8564fefa39b6df78a14b2d3507b97a099b13f255e0a24aae40a3dba
lines: 139
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/dataset-loader.ts

## 1. 结论与边界

数据集加载器（运行时代码）：两类数据源——内置离线样例（`dataset.ts`）与官方全集（Hugging Face `yixuantt/MultiHopRAG` 一键拉取+本地缓存），字段同构可走同一评测流程（`packages/benchmark-multihop/src/dataset-loader.ts:1-8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `loadEmbeddedDataset` | 导出函数 | 31-33 | `(): MultiHopDataset` | 返回 `EMBEDDED_SAMPLE` |
| `hasCachedOfficialDataset` | 导出函数 | 36-38 | `(): boolean` | 缓存文件存在性 |
| `loadCachedOfficialDataset` | 导出函数 | 41-49 | `(): MultiHopDataset \| null` | 读缓存；损坏返回 null |
| `downloadOfficialDataset` | 导出异步函数 | 104-130 | `(onPhase?): Promise<MultiHopDataset>` | 下载+规整+写缓存 |
| `loadOrDownloadOfficialDataset` | 导出异步函数 | 133-139 | `(onPhase?): Promise<MultiHopDataset>` | 有缓存读缓存，否则下载 |

内部：`HF_BASE/HF_QUERIES_URL/HF_CORPUS_URL`（`:16-18`，resolve 端点）、`cacheDir`（`:21-23`，`import.meta.dir/../data`）、`officialCachePath`（`:26-28`，`data/official-multihoprag.json`）、`normalizeQuestionType`（`:52-59`，含后缀题型归一，兜底 `'inference'`）、`normalizeQueries`（`:62-84`，id=`hf-<序号>`）、`normalizeCorpus`（`:87-101`，key=url 或 `news-<序号>`）。

## 3. 内部逻辑与关键流程

- `downloadOfficialDataset`（`:104-130`）：两次 `fetch`（查询集→语料集，非 2xx 抛 `下载…失败：HTTP <status>`，`:109/:114`）→ `normalizeCorpus/normalizeQueries` → 组装 `{origin:'huggingface:yixuantt/MultiHopRAG', label:'官方全集 MultiHop-RAG（2556 题）', embedded:false}` → `mkdirSync` + `writeFileSync` 缓存（`:126-128`）→ 返回。
- `loadOrDownloadOfficialDataset`（`:133-139`）：缓存命中直接返回，否则下载。
- 归一化语义：题型大小写不敏感子串匹配（temporal>comparison>null>inference 优先级，`:54-58`）；语料 key 优先用 url（`:92`）。

## 4. 调用者与调用链

入向：`packages/benchmark-multihop/src/server.ts:17`（4 个函数全导入；`resolveDataset:44-47`、GET `/api/datasets`:101-111、POST `/api/datasets/download`:114-121（JSON 直返、无 SSE，QA F-NB41-06 校正））。出向：`node:fs`/`node:path`（`:10-11`）、`./dataset`（`EMBEDDED_SAMPLE`，`:12`）、`./types`（`:13`）；网络 `fetch`（Hugging Face）。

## 5. 数据 I/O、读写与副作用

- 网络：GET `huggingface.co/datasets/yixuantt/MultiHopRAG/resolve/main/{MultiHopRAG.json,corpus.json}`（`:16-18/:108/:113`）。
- 磁盘写：`packages/benchmark-multihop/data/official-multihoprag.json`（`:26-28/:126-128`，非原子写——`writeFileSync` 直写，推断-静态）；磁盘读：同文件。
- 副作用：`onPhase` 回调进度串（`:107/:112/:117`）。

## 6. 分支、失败、取消与恢复

- 下载失败抛错（HTTP status）；缓存损坏 `loadCachedOfficialDataset` 返回 null（`:46-48`）→ 下次 `loadOrDownload` 重新下载覆盖。
- 无取消（fetch 无 AbortSignal）；重复调用重复下载（缓存写无原子性，中途失败留残缺 JSON→下次读损坏归 null 重下，推断）。

## 7. 权限与权威状态

无权限分支；官方数据集权威=Hugging Face 仓库（`yixuantt/MultiHopRAG`），本地缓存为副本；`EMBEDDED_SAMPLE` 为合成数据（`dataset.ts` 注释明确）。

## 8. 修改影响面

改 URL/缓存路径/归一化影响 server 的 `/api/datasets`/`/api/datasets/download` 与评测输入；题型归一优先级影响 `QueryEvaluation.questionType` 分布。

## 9. 测试证据

无专属测试（冻结树 glob `**/dataset-loader*test*` 零命中）；`dataset.test.ts` 只测内置样例（不覆盖本文件）。NOT_RUN；网络下载未验证。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+归一化+缓存路径 | 已证实 | `:16-139` |
| 下载 HTTP 失败抛错文案 | 已证实 | `:109/:114` |
| 缓存非原子写、损坏归 null | 已证实 | `:126-128/:46-48` |
| 无消费者（除 server） | 已证实 | 冻结树检索 |
| 真实下载/官方 schema 兼容 | 未知 | 网络 NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 5 导出+3 归一化 | §2/§3 | 16-139 | covered |
| 网络下载行为 | §10 | — | unknown（NOT_RUN） |
