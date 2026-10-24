---
path: apps/electron/src/main/lib/cslab/cslab-formats/xrd.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 30dcd03a0a65726562214d8a3b6218abeeb4835f
sha256: 4ae706eb62bffac4230f61fd63f357100b52ed8c911aca338e1f482236092af0
lines: 215
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/xrd.ts

## 1. 结论与边界

XRD 常见格式解析（`apps/electron/src/main/lib/cslab/cslab-formats/xrd.ts:1-7`）：Rigaku `.ras` 文本 / Panalytical `.xrdml` / Bruker `.brml` XML / Bruker 二进制 `.raw`。**诚实红线**（`:4-6`）：`.raw` 官方块结构版本差异极大，本实现采用「先识别 RAW 头，再限定窗口内寻找严格单调等步长数值序列」启发式恢复；无法可信恢复时**明确抛 Unsupported 交 Python(geddes) 增强通道，绝不伪造数据**。

边界：启发式恢复窗口 8MB、步长容差 5%、最短 50 点、上限 200 万点（`:137-168`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `parseRigakuRas` | function | 12-63 | `(text) => ParsedDataset` | `*RAS_DATA_START*` 标记+纯文本回退 |
| `parseXrdXml` | function | 66-114 | `(xml, format) => ParsedDataset` | xrdml/brml 共用 |
| `parseBrukerBrmlXml` | function | 116-118 | → `parseXrdXml(xml,'bruker-brml')` | |
| `parseBrukerRaw` | function | 174-208 | `(buffer) => ParsedDataset` | 启发式恢复 |

内部：`isRawHeader`（`:120-123`，'RAW'/'RAW1.01'）、`recoverNumericScan`（`:128-171`：float64/float32×双端序 4 路扫描，x∈[-360,360]、y≥0、等步长 5% 容差、score=点数取最优）。

## 3. 内部逻辑与关键流程

- `parseRigakuRas`（`:12-63`）：`*KEY "value"` 元数据词法；无 RAS 标记→找首个 ≥2 数值列行回退；双抛错（缺数据块/数据块为空）；X=2θ°/Intensity。
- `parseXrdXml`（`:66-114`）：`counts`/`positions[axis=2theta]` 块提取；X 三回退（positions 等长→start/end 插值→索引）；无强度抛错。
- `parseBrukerRaw`（`:174-208`）：无 RAW 头抛 `CsLabUnsupportedFormatError`；恢复失败抛同错误类（提示导出 .uxd/.brml 或启用 Python 通道）；metadata 记 `parser:'heuristic-equidistant-scan'`+头 64 字节摘要。

## 4. 调用者与调用链

出向：`./types`（buildDataset/CsLabUnsupportedFormatError/ParsedDataset，`:9`）。入向（rg 全冻结树）：`cslab-iron-cage.ts:62`（parseBrukerBrmlXml/parseBrukerRaw/parseRigakuRas/parseXrdXml 四个全消费，摄取中枢）、`cslab-formats.test.ts:10`（parseBrukerRaw）、`cslab-formats/index.ts:11` 转发。产品入口：main（经 iron-cage）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯解析。

## 6. 分支、失败、取消与恢复

失败=抛 `Error`/`CsLabUnsupportedFormatError`（红线：不可信恢复必须显式 Unsupported）；启发式参数即防御边界；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；红线即口径（`:4-6`）：绝不伪造数据，不可信即 Unsupported。

## 8. 修改影响面

启发式参数（8MB/5%/50 点）影响 .raw 恢复率与误收率；测试 `cslab-formats.test.ts`。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-formats.test.ts`（本批，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 诚实红线（Unsupported 不伪造） | 已证实 | `:4-6,185-192` |
| 4 路扫描+等步长容差+score 排序 | 已证实 | `:128-171` |
| ras 无标记回退 | 已证实 | `:31-38` |
| 真实 XRD 语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 12-208 | covered |
| 三格式解析 | §3 | 12-118 | covered |
| 启发式恢复 | §3 | 128-208 | covered |
