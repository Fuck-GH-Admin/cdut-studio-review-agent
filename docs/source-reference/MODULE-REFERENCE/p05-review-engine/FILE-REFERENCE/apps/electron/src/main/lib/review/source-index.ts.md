---
path: apps/electron/src/main/lib/review/source-index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e04b3db87bd100f349a7c213dbe27eadc45c1de9
sha256: 23589a8bf8b0a57c46791790e3b740b080072bdaaaa5807e0ed1960961849cfd
lines: 175
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/source-index.ts

## 1. 结论与边界

来源索引与自动分批（N2c/R09，头注 :1-8）：`SourceIndex` 是每文档版本的结构化位置索引（段落/行/单元格/页），存 `source-index/{versionId}.json`；文本类给真实段落位置（**不虚构页码**）；CSV 用引号/换行感知解析器（不用 `split(',')`），学号保留前导零；`planVisionBatches` 按数量/字节自动分批，全部登记。

边界：PDF/图片分页与 OCR 矩形经 `PageIndexer/OcrPort` 端口接入（头注 :6，本文件不含）；不做业务判定；`excerptHash` 只是摘录指纹（见 §10 记录的注释与实现差异）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SourceIndexEntry` | interface | 17-25 | `{blockId, text, location, precision, excerptHash}` |
| `SourceIndex` | interface | 27-35 | `{documentVersionId, parseRevision, engine, engineVersion, entries, incomplete?}` |
| `buildTextSourceIndex` | fn | 48-63 | 段落索引（空行分隔） |
| `parseCsvRows` | fn | 66-94 | 引号感知 CSV 解析 |
| `buildSheetSourceIndex` | fn | 97-116 | sheet-cell 索引 |
| `saveSourceIndex` | fn | 119-127 | 索引落盘（tmp+rename） |
| `VisionItem` / `VisionBatch` | interface | 131-144 | 分批输入/输出（含独立 manifest） |
| `planVisionBatches` | fn | 150-175 | 按张数/字节切批 |

内部：`hashExcerpt`（:37-45）。

## 3. 内部逻辑与关键流程

1. `hashExcerpt`（:37-45）：对文本做 FNV-1a 32 位（初值 `0x811c9dc5`、乘 `0x01000193`），输出 8 位十六进制（:44）。**注意**：注释 :23/:38 称「SHA-1（V1 兼容）」，实现并非 SHA-1（见 §10 记录）。
2. `buildTextSourceIndex`（:48-63）：`content.split(/\n\s*\n/)` 过滤空白段（:49）；每段 `blockId={versionId}-p{index}`、`location: text-range`（start/end 取 `content.indexOf(paragraph)`，重复段落会取首个出现位置——已知边界）、`precision:'paragraph'`（:55-61）。
3. `parseCsvRows`（:66-94）：逐字符状态机；引号内 `""` 转义（:74-77）、引号内换行不切行（:78-79）、`\r` 忽略（:86-87）；末尾残行收尾（:92）。
4. `buildSheetSourceIndex`（:97-116）：首行当表头（:99）；从第 2 行起逐非空单元格建 entry（blockId `{versionId}-r{r}c{c}`、column 用表头名或 `col{c}`、值按文本保留前导零，:101-113）。
5. `saveSourceIndex`（:119-127）：`{configDir}/review-cases/{caseId}/source-index/{documentVersionId}.json`，随机后缀 tmp + rename（:123-126）。注意 caseId 直接拼路径，**本文件不调用 id 校验**（:120）。
6. `planVisionBatches`（:150-175）：`maxItemsPerBatch<1` throw（:151）；满张或超字节（当前批非空时）先 flush（:167-169）；单项超预算独立成批不丢弃（:170-171，注释 :148-149）；每批 `manifest.itemIds` 为 `versionId[#page]`（:161）。

## 4. 调用者与调用链

入向（生产）：`v2-executor-factory.ts:21`（`buildTextSourceIndex`，解析流水线建索引）；`document-service.ts:27`（`parseCsvRows`，CSV 解析共用）。测试：`source-index.test.ts:7`（全部 5 个函数）。**`buildSheetSourceIndex`/`saveSourceIndex`/`planVisionBatches` 生产零调用者**（全树检索仅本文件定义 + 该测试）。出向：`../config-paths getConfigDir`（:13）、`node:fs`/`node:path`（:10-11）、`@profer/shared SourceLocation`（:12）。

## 5. 数据 I/O、读写与副作用

- 写：`saveSourceIndex` 的 `source-index/{versionId}.json`（tmp+rename，无 fsync）；mkdir 递归（:121）。
- 无网络/日志/全局状态；其余函数纯计算。

## 6. 分支、失败、取消与恢复

- `planVisionBatches` 非法 limit → throw（:151）；其余函数无 throw 路径。
- CSV 解析器容错：引号未闭合时按引号内收集到文末（无显式错误）。
- 无取消/恢复概念；索引文件覆盖式写（旧版本被 rename 覆盖）。

## 7. 权限与权威状态

无权限分支（依据：无 sender/actor 检查）。定位权威边界由头注 :4-6 约束：不虚构页码；PDF/页定位只能来自接入的 PageIndexer/OcrPort。`saveSourceIndex` 未做 caseId 校验（:120），与 `run-store-v2` 等的 `assertSafeReviewStorageId` 惯例不一致——现存差异照实记录。

## 8. 修改影响面

- `buildTextSourceIndex` 改动影响 `v2-executor-factory` 的引用定位产物；`parseCsvRows` 影响 `document-service` 的 CSV 导入（含学号前导零语义）。
- 三个零生产消费者函数的改动只影响测试；若未来接线需补调用方。
- 同步测试：`source-index.test.ts`（6 用例）。

## 9. 测试证据

直接测试 `source-index.test.ts`（6 用例 / 3 describe；`PROFER_CONFIG_DIR` 隔离 :9-11；NOT_RUN）：
1. `:14-20` CSV 解析：前导零 `'00121'` 保留、转义引号 `'说了"你好"'`、引号内换行 `'两行\n说明'` 不切行、行数 3。
2. `:22-27` sheet 索引：`r1c1` 单元格 location `toEqual({kind:'sheet-cell',sheet:'sheet1',row:1,column:'分值'})`、text `'8'`。
3. `:31-36` 段落索引：2 entries、`precision==='paragraph'`、`excerptHash` 稳定（自比较）。
4. `:38-41` 落盘：`source-index/doc-txt-v1.json` `existsSync` true。
5. `:47-53` 12 张 5/批 → 3 批、全 12 张登记、末批 2 张。
6. `:55-59` 字节预算切批、单项 5000B 独立成批仍登记。

未覆盖：`excerptHash` 跨实现一致性、重复段落 `indexOf` 边界、`incomplete` 字段、`saveSourceIndex` 路径注入、`planVisionBatches` throw 分支；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出/行号如 §2 | 已证实 | 逐条 |
| CSV 状态机保留前导零/转义/内换行 | 已证实 | :66-94 + 测试 :14-20 |
| 分批全登记、单项超限独立成批 | 已证实 | :150-175 + 测试 :47-59 |
| `buildSheetSourceIndex` 等三函数生产零消费者 | 已证实（否定） | 全树检索 |
| **注释与实现差异**：`excerptHash` 注释称 SHA-1（:23/:38），实现为 FNV-1a 32 位 8 位 hex（:37-45） | 已证实（记录） | :37-45 |
| `saveSourceIndex` 不校验 caseId | 已证实 | :120 |
| 重复段落 text-range 定位取首次出现 | 推断 | :58 `content.indexOf` |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `parseCsvRows` | §3.3/§9 | 66-94 | covered |
| `buildSheetSourceIndex` | §3.4/§9 | 97-116 | covered（生产零消费） |
| `buildTextSourceIndex` | §3.2/§9 | 48-63 | covered |
| `saveSourceIndex` | §3.5/§9 | 119-127 | covered |
| `planVisionBatches` | §3.6/§9 | 150-175 | covered |
| `hashExcerpt`/`incomplete` | §3.1/§9 | 37-45/34 | partial（未测） |
