---
path: packages/benchmark-multihop/src/dataset.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 160b66a6f09f35ae47f94600ee283fe04d4bd6cc
sha256: 2a2303510250bdb28957f9032b4cac5e9f2ea2e5d28d27b6d3d54afabd954a3b
lines: 426
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/src/dataset.ts

## 1. 结论与边界

内置离线多跳基准样例（**合成语料**，运行时常量 + 自校验函数）：18 篇虚构新闻 + 50 条查询，覆盖四大题型；「仅用于开箱验证评测链路」，正式结论需拉官方 2556 题全集（文件头 `packages/benchmark-multihop/src/dataset.ts:1-11` 如实标注）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EMBEDDED_CORPUS` | 导出常量 | 16 | `MultiHopCorpusDoc[18]` | 合成语料（key/title/author/published_at/source/category/body） |
| `EMBEDDED_SAMPLE` | 导出常量 | 391 | `MultiHopDataset` | 组装（`origin:'embedded-sample'`、`embedded:true`，queries=`expandQueries(RAW_QUERIES, EMBEDDED_CORPUS)` `:396`） |
| `validateEmbeddedSample` | 导出函数 | 403 | `(sample?): string[]` | 自洽性校验（默认 EMBEDDED_SAMPLE） |

**共 3 个导出**（QA F-NB41-05 校正：此前误称 `EMBEDDED_QUERIES` 为导出——实际查询常量名 `RAW_QUERIES`（`:191`，**未导出**）；`RawQuery` 接口（`:182`）、`expandQueries`（`:366`）亦未导出）。

## 3. 内部逻辑与关键流程

- 语料 18 篇（`:16-236`）：6 家虚构机构（Helios Aerospace/Orbital Dynamics/Northwind Energy/Pacific Robotics/Verdant Labs/Terra Nova Institute/Global Space Agency）互链新闻。
- 查询 50 条（RAW_QUERIES `:191-364`）：Comparison（q-c01…）、Temporal（q-t01…）、Inference（q-i01-q-i12，`:300-341`）、Null（`:343-375`）分组注释；多跳题每条 ≥2 条 evidence（key 指语料）。
- `EMBEDDED_SAMPLE` 组装（`:391-399`）：`expandQueries`（`:366-389`）把 RAW_QUERIES 的 evidence.key 回填语料 title。
- `validateEmbeddedSample`（`:400-426`）：语料/查询非空；逐查询——证据标题必须命中语料（`titles` 集合，`:413-415`）、非 null 题型 ≥2 条证据（`:417-419`）；四大题型必须齐备（`:421-424`）；返回 `problems: string[]`。

## 4. 调用者与调用链

入向：`packages/benchmark-multihop/src/dataset-loader.ts:12`（`EMBEDDED_SAMPLE`）；`dataset.test.ts:6`（`EMBEDDED_SAMPLE`+`validateEmbeddedSample`）；`server.ts` 经 dataset-loader 间接。出向：`./types`（`:13`）。

## 5. 数据 I/O、读写与副作用

无（纯常量+纯函数）。

## 6. 分支、失败、取消与恢复

`validateEmbeddedSample` 只返回问题数组不 throw；数据缺陷由测试断言拦截（`dataset.test.ts:11`）。

## 7. 权限与权威状态

无权限分支；样例数据为合成事实（自述），不构成真实世界事实。

## 8. 修改影响面

改语料/查询影响 `dataset.test.ts` 5 用例（18/50 计数、题型齐备、证据回溯、证据数）与内置评测基线；`EMBEDDED_SAMPLE` 形状契约由 `dataset-loader`/`evaluator` 消费。

## 9. 测试证据

直接测试 `packages/benchmark-multihop/src/dataset.test.ts`（45 行、5 用例；NOT_RUN）：`validateEmbeddedSample()` 空数组（`:11`）、18/50 计数（`:15-16`）、四题型均 >0（`:24-27`）、证据标题全命中（`:31-35`）、null 零证据/其余 ≥2（`:41-42`）。未覆盖：单条语料 body 内容正确性、答案可推导性（人工设计保证）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出、18/50 组成、自校验规则（QA F-NB41R1-01 校正：残留 4→3） | 已证实 | `:16-426` |
| 合成语料非真实 | 已证实 | `:1-11` 自述 |
| 答案可由语料推导 | 推断 | `:6-8` 自述（人工设计，未逐题验证） |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| EMBEDDED_CORPUS/RAW_QUERIES/SAMPLE | §2/§3 | 16-399 | covered |
| validateEmbeddedSample | §3 | 400-426 | covered |
| 测试断言 | §9 | test:10-44 | covered |
| 内容正确性/运行 | §9/§10 | — | partial/unknown（NOT_RUN） |
