---
path: apps/electron/src/main/lib/cslab/cslab-formats/sniff.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 61545a450253dcf64f7819ff1cfa10dffef1e9a8
sha256: ebdf5d271d066a68fec6676e50d01f39a9d49d2f2ba4b2f9360653637f024412
lines: 73
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/sniff.ts

## 1. 结论与边界

科研仪器文件**格式嗅探**（`apps/electron/src/main/lib/cslab/cslab-formats/sniff.ts:1-3`）：扩展名 + 首 128 字节魔数双通道。12 格式枚举（mat-level5/mat-v73/bruker-raw/rigaku-ras/xrdml/bruker-brml/thermo-spc/jcamp-dx/biologic-mpr/mpt/text-table/unknown）。

边界：嗅探不解析内容；识别失败/降级一律 `note` 如实说明（如 v7.3 需可选 h5py 通道、`.raw` 无头走「通用二进制恢复」）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CsLabSniffedFormat` | type | 8-20 | 12 值联合 | |
| `CsLabSniffResult` | interface | 22-27 | `{format; extension; note?}` | note=识别依据/降级说明 |
| `sniffFormat` | function | 32-73 | `(filePath, head: Buffer) => CsLabSniffResult` | |

内部：`TEXT_EXTENSIONS`（`.txt/.csv/.dat/.asc/.dpt/.tsv/.prn`，`:29`）、`XRD_TEXT_EXTENSIONS`（`.ras/.uxd`，`:30`）、`JCAMP_EXTENSIONS`（`.dx/.jdx`，`:31`）。

## 3. 内部逻辑与关键流程

`sniffFormat`（`:32-73`）判定优先级：

1. 魔数：`isMatV73`（note：需 h5py）→ `isMatLevel5` → `isSpc`（thermo-spc）。
2. `.mat` 无头 → unknown+note「未识别到 MATLAB MAT 头」。
3. `.raw`：首 16 字节 'RAW' 头 → bruker-raw；否则仍 bruker-raw+note「将尝试通用二进制恢复」。
4. 扩展名直映射：`.ras/.uxd`→rigaku-ras、`.xrdml`、`.brml`、`.dx/.jdx`→jcamp-dx、`.mpr`、`.mpt`。
5. 文本扩展名：JCAMP 头正则（`##TITLE=`/`##JCAMP-DX=`）→ jcamp-dx；否则 text-table。
6. 兜底 unknown+note「不支持的文件扩展名」。

## 4. 调用者与调用链

出向：`node:path`（extname）、`./mat-level5`（isMatV73/isMatLevel5）、`./spc`（isSpc）（`:5-7`）。入向：cslab-formats 入口转发+格式分发消费方（详见 UNVERIFIED 补记）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯判定（Buffer 进结果出）。

## 6. 分支、失败、取消与恢复

无异常路径（一切降级走 note/unknown）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；降级 note 口径与 types.ts 诚实红线一致。

## 8. 修改影响面

格式枚举/优先级改动影响下游解析分发（mat-level5/spc/jcamp/xrd）。

## 9. 测试证据

无同名测试（`cslab-formats.test.ts` 覆盖解析器；嗅探无独立用例——照实记录）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双通道判定+降级 note | 已证实 | `:32-73` |
| `.raw` 无头兜底语义 | 已证实 | `:51-55` |
| 嗅探无独立测试 | 已证实 | 测试清单核对 |
| 真实仪器文件识别率 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | 8-32 | covered |
| 六级判定 | §3 | 32-73 | covered |
| 测试锚 | §9 | — | unknown（无独立测试） |
