---
path: apps/electron/src/main/lib/cslab/cslab-columnar.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 86339e46a482a22230918c0b7559102da2fcd1d8
sha256: 0b01cfbc5053146081e4a517f3e183e09507d470130cb0243e247c1b27a0c482
lines: 397
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-columnar.ts

## 1. 结论与边界

CSLab **列式数据集读写**（`apps/electron/src/main/lib/cslab/cslab-columnar.ts`，397 行）：Parquet 写出（可选 zstd）、预览生成/读取、单元格/序列读取、CSV 流式导出（背压控制）。`PREVIEW_ROW_LIMIT = 500`（`:19`）。

## 2. 导出与关键符号

`export` 共 **11 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PREVIEW_ROW_LIMIT` | const | `:19` | 500 |
| `CsLabTablePreview` | interface | `:21-30` | 预览形状（行/列/截断标记） |
| `ParquetWriteResult` | interface | `:51-58` | 写出结果 |
| `writeDatasetParquet` | 函数 | `:59-100` | async，写 Parquet（zstd 可选） |
| `buildDatasetPreview` | 函数 | `:101-126` | 内存构建预览 |
| `writeDatasetPreview` | 函数 | `:127-136` | async，写预览文件 |
| `readDatasetPreview` | 函数 | `:137-155` | async，读预览（无则 null） |
| `readPreviewCell` | 函数 | `:156-173` | 预览内取单元格 |
| `readDatasetCell` | 函数 | `:174-203` | async，按坐标取单元格 |
| `readDatasetSeries` | 函数 | `:204-298` | async，取列序列 |
| `writeDatasetCsvStream` | 函数 | `:351-397` | async，CSV 流式导出（背压） |

内部：`getZstdCompressor`（`:32-45`，惰性 zstd）、`sanitizeNumber`（`:46-50`，非有限→null）、`csvCell`（`:299-319`，CSV 转义）、`waitForDrain`/`writeWithBackpressure`（`:320-350`，Writable 背压）。

## 3. 内部逻辑与关键流程

- `writeDatasetParquet`（`:59-100`）：列数据→Parquet（`getZstdCompressor` 可用则压缩）；`sanitizeNumber` 清洗非有限数。
- 预览三件套（`:101-173`）：构建（≤500 行）/写/读/取格。
- `readDatasetSeries`（`:204-298`）：按列读取序列（含类型处理）。
- `writeDatasetCsvStream`（`:351-397`）：`csvCell` 转义 + `writeWithBackpressure`（`waitForDrain`，`:320-350`）防大表内存峰值。

## 4. 调用者与调用链

- 消费方：数据集导出/预览面板。
- 出向：Parquet/zstd 库、Node Writable。

## 5. 数据 I/O、读写与副作用

**文件写**（Parquet/预览/CSV）；无网络。`sanitizeNumber` 改变数据表示（非有限→null）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| zstd 不可用 | `:32-45` | 无压缩写出 |
| 非有限数 | `:46-50` | →null |
| 预览无文件 | `:137-155` | `null` |
| 流背压 | `:320-350` | drain 后续写 |

## 7. 权限与权威状态

无身份语义；`PREVIEW_ROW_LIMIT` 是预览上限契约。

## 8. 修改影响面

- `csvCell` 转义口径影响 CSV 注入面（引号/逗号/换行）。
- 背压写改动影响大表导出内存。

## 9. 测试证据

本批 cslab 测试不含 columnar 专属用例（全树检索 `writeDatasetParquet` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个导出、读写链 | 已证实 | `:19-397` |
| 背压/CSV 转义 | 已证实 | `:299-350` |
| Parquet 库实际行为 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 11 个导出 | `:19-397` | covered |
| Parquet/压缩 | `:32-100` | covered |
| 预览/读取 | `:101-298` | covered |
| CSV 背压 | `:299-397` | covered |
