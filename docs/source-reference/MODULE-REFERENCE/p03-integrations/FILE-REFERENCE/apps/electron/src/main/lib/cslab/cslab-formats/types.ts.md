---
path: apps/electron/src/main/lib/cslab/cslab-formats/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d58c91f4ac7ff26edc66b923d50bf46c08b55916
sha256: e3c27ffacfc3340b0c10bc46bc34abd34fc59e7b45bb125893cbbb72f361a594
lines: 72
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/types.ts

## 1. 结论与边界

CSLab 多格式解析**统一数据契约**（`apps/electron/src/main/lib/cslab/cslab-formats/types.ts:1-7`）：所有解析器归一化为「一维 X + 若干 Y 序列」二维连续坐标矩阵，由 cslab-columnar 写 Parquet 并生成预览。**诚实降级红线**（`:20`）：`CsLabUnsupportedFormatError` 明确表达「该变体当前无法解析」，**绝不伪造数据**。

边界：纯契约（数据形状+错误类型+两个构造工具）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ParsedDataset` | interface | 9-19 | `{format; columns: CsLabColumn[]; x: number[]; series: Record<string, number[]>; metadata; rowCount}` | series 键 `y1..yn` |
| `CsLabUnsupportedFormatError` | class | 22-27 | `extends Error` | 诚实降级 |
| `buildDataset` | function | 29-50 | `(input) => ParsedDataset` | 列构造：x+y1..yn |
| `splitLabelUnit` | function | 53-72 | `(raw) => {label; unit?}` | 两种单位语法 |

内部：单位正则——括号式 `[\[(（]…[\])）]` 结尾（`:60`）与斜杠式 `label / unit`（`:65`，unit 首字符限 `A-Za-z°%‰µμ`）。

## 3. 内部逻辑与关键流程

- `buildDataset`（`:29-50`）：`x` 列 + 每序列 `y{i+1}` 列；`series[index] ?? []`；`rowCount = x.length`。
- `splitLabelUnit`（`:53-72`）：空→`{label:''}`；括号式优先于斜杠式；无单位→仅 label。

## 4. 调用者与调用链

出向：`@profer/shared`（CsLabColumn，`:9`）。入向：cslab-formats 各解析器（jcamp/mat-level5/spc/xrd/header-data-separator）+消费方（详见 UNVERIFIED 补记）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯构造函数。

## 6. 分支、失败、取消与恢复

失败=抛 `CsLabUnsupportedFormatError`（红线语义）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:20`）：无法解析必须显式报错，绝不伪造。

## 8. 修改影响面

`ParsedDataset` 形状是全部仪器解析器与 cslab-columnar/Parquet 链的统一契约。

## 9. 测试证据

无同名测试（`cslab-formats.test.ts` 覆盖解析器行为）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 诚实降级红线 | 已证实 | `:20` |
| 两种单位语法 | 已证实 | `:60,65` |
| 消费面 | 见 UNVERIFIED 补记 | — |
| 真实仪器数据 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 9-72 | covered |
