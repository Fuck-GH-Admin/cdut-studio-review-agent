---
path: apps/electron/src/main/lib/cslab/cslab-formats/spc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 02dcafa551e43436552209d2a4ff69106b01ab34
sha256: 8b674e79b9ca02818929ed396940520f908e62feb89518a3a8386ae9d7a5ce15
lines: 98
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/spc.ts

## 1. 结论与边界

Thermo Galactic `.spc` **二进制光谱解析器**（`apps/electron/src/main/lib/cslab/cslab-formats/spc.ts:1-9`）：SPC 规范——`0x4D4C`（"ML"）小端新格式 512 字节头 / `0x4C4D`（"LM"）大端旧格式 128 字节头；ftflgs bit0=Y 16 位整数（否则 32 位浮点）；fexp=16 位整数二进制指数缩放（Y=raw×2^fexp）；ffirst/flast 线性 X 端点。

边界：点数 >1e8 抛错（防御）；部分 Thermo 文件 44 字节子头（首字节 'K'）兼容（`:62-63`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isSpc` | function | 14-19 | `(buffer) => boolean` | 双魔数 |
| `parseSpc` | function | 21-98 | `(buffer) => ParsedDataset` | |

内部：`SPC_NEW_HEADER=512`/`SPC_OLD_HEADER=128`（`:11-12`）、端序感知读取闭包（`:30-33`）。

## 3. 内部逻辑与关键流程

`parseSpc`（`:21-98`）：

1. `isSpc` 校验抛「不是有效的 Thermo SPC 文件」；头长校验抛「文件头不完整」（`:25-27`）。
2. 头字段（`:35-39`）：flags=byte2、exponent=int8@4、pointCount=u32@6、firstX/lastX=double@10/@18。
3. 点数防御（`:41-43`）：≤0 或 >1e8 抛「SPC 点数无效」。
4. 数据区（`:45-63`）：16/32 位按 bit0；'K' 子头 +44 偏移；长度不足抛「数据区不完整：需要 N 字节」。
5. Y 解码（`:65-73`）：16 位×2^fexp / 32 位浮点；端序双路。
6. X 轴（`:75-88`）：ftflgs bit1 置位→X 数组紧随 Y（float32）；否则 firstX/lastX 线性；单点→[firstX]。
7. `buildDataset`：Wavenumber/cm⁻¹ + Intensity；metadata 记版本/flags/exponent/点数/端序。

## 4. 调用者与调用链

出向：`./types`（buildDataset/ParsedDataset，`:10`）。入向（rg 全冻结树）：`cslab-iron-cage.ts:60`（parseSpc，摄取中枢）、`cslab-formats/sniff.ts:7`（isSpc）、`cslab-formats.test.ts:8`、`cslab-formats/index.ts:9` 转发。产品入口：main（经 iron-cage）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯解析（Buffer 进数据集出）。

## 6. 分支、失败、取消与恢复

抛 `Error` 4 处（非 SPC/头不完整/点数无效/数据区不完整——均含字节数细节）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；SPC 规范注释（`:1-9`）是解析权威口径。

## 8. 修改影响面

端序/子头/位深分支改动影响 Thermo 光谱摄取；测试 `cslab-formats.test.ts`。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-formats.test.ts`（本批，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双端序/双头长/双位深全分支 | 已证实 | `:25-88` |
| 4 处 fail-closed 含细节 | 已证实 | `:25,27,41-43,59-61` |
| 'K' 子头兼容 | 已证实 | `:62-63` |
| 真实 SPC 语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 14-21 | covered |
| 解码全分支 | §3 | 21-98 | covered |
