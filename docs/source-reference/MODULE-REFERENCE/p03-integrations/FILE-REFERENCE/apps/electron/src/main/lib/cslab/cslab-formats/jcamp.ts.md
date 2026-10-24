---
path: apps/electron/src/main/lib/cslab/cslab-formats/jcamp.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0772d3a51a0fbdd532a0faa5b18c28e8edd30143
sha256: 61b9d1206cc594b245f95db120168a4038900a0378f167c8931cc7990cf6a0f5
lines: 98
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/jcamp.ts

## 1. 结论与边界

JCAMP-DX（`.dx/.jdx`）**ASCII 波谱解析器**（`apps/electron/src/main/lib/cslab/cslab-formats/jcamp.ts:1-6`）：仅处理最常见的 `##XYDATA=(X++(Y..Y))` 与 `##XYPOINTS` 数据块；其他块（峰表、注释）原样收录 metadata。

边界：不支持的 XY 变体按 X++ 压缩判定粗放处理；X 轴三回退（FIRSTX+DELTAX→FIRSTX/LASTX 线性→索引）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isJcampDx` | function | 8-10 | `(text) => boolean` | `##TITLE=`/`##JCAMP-DX=` 头正则 |
| `parseJcampDx` | function | 13-98 | `(text) => ParsedDataset` | |

内部：`toNumber`（`:12-15`，剥括号）；BOM 剥离（`:16`）。

## 3. 内部逻辑与关键流程

`parseJcampDx`（`:13-98`）：

1. 逐行状态机：`##KEY=VALUE` 词法；XYDATA/XYPOINTS 开数据模式（dataMode 记压缩形态）；非数据 `##` 块入 metadata；数据行收集（`:26-46`）。
2. 无数据块抛「缺少 XYDATA / XYPOINTS」（`:48-50`）；空数据抛「数据块为空」（`:65`）。
3. `X++` 压缩时每行首 token 为 X 跳过（`:57`）；`?`/空 token → NaN（`:62`）。
4. X 轴三回退（`:70-79`）：FIRSTX+DELTAX 等距 → FIRSTX/LASTX 插值 → 索引。
5. `buildDataset`（format 'jcamp-dx'，X/Y 标签单位取 XLABEL/XUNITS/YLABEL/YUNITS 元数据）。

## 4. 调用者与调用链

出向：`./types`（buildDataset/ParsedDataset，`:8`）。入向（rg 全冻结树）：`cslab-iron-cage.ts:61`（parseJcampDx，**摄取中枢**）、`cslab-formats.test.ts:9`、`cslab-formats/index.ts:10` 转发。`isJcampDx`：模块内正则同源（sniff 用内联正则非本函数——照实记录）。产品入口：main（经 iron-cage 摄取链）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯解析（文本进数据集出）。

## 6. 分支、失败、取消与恢复

抛 `Error` 2 处（缺数据块/空数据）；NaN 容忍（`?` 占位符）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；「仅处理最常见块」声明（`:3-4`）是支持面口径。

## 8. 修改影响面

词法/压缩判定改动影响波谱摄取（iron-cage 链）；测试 `cslab-formats.test.ts`。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-formats.test.ts`（本批 162 行，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两数据块限定+其余入 metadata | 已证实 | `:3-4,26-46` |
| X 三回退 | 已证实 | `:70-79` |
| `isJcampDx` 与 sniff 内联正则并存（重复口径） | 已证实（照实记录） | `:8-10` vs sniff.ts:68 |
| 真实 JCAMP 语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 8-13 | covered |
| 状态机/压缩/三回退 | §3 | 13-98 | covered |
