---
path: apps/electron/src/main/lib/cslab/cslab-formats/mat-level5.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e4a7960e3c4808dbf123b09e3a99ea7d48797b10
sha256: 1dd6c8addd27e3b507fe1d7a286920a816919b1fdfdcb5f000c0dca79c21fdd1
lines: 285
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-formats/mat-level5.ts

## 1. 结论与边界

MATLAB Level 5（`.mat`）**纯 TypeScript 解析器**（`apps/electron/src/main/lib/cslab/cslab-formats/mat-level5.ts:1-6`）：miMATRIX 数值矩阵、miCOMPRESSED（zlib 压缩元素）、双端序。**v7.3（HDF5）仅识别，交可选 Python 增强通道**（`:5`——不硬解析，诚实分工）。

边界：**只取首个可用数值矩阵**（`:229-231`）；复数**仅保留实部**（保留 complex 标记，`:190-193`）；不支持类型静默跳过（readNumeric default break）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isMatLevel5` | function | 42-44 | 头 20 字节含 'MATLAB 5.0 MAT-file' 且 ≥128 | |
| `isMatV73` | function | 46-49 | 8 字节 HDF5 魔数 `89 48 44 46 0D 0A 1A 0A` | |
| `parseMatLevel5` | function | 226-285 | `(buffer) => ParsedDataset` | 首个数值矩阵→X+Y |

内部：14 个 mi* 常量（`:11-24`）、`MatVariable/Tag`（`:26-39`）、`readTag`（`:51-68`，small-tag（高 16 位 size）+常规 tag+8 字节对齐 padding）、`readNumeric`（`:70-135`，10 数值类型双端序）、`readName`（`:137-147`，UTF8/UTF16/latin1）、`parseMatrix`（`:149-210`，子元素固定序 0=Flags/1=Dims/2=Name/3=Real/4=Imag）、`collectVariables`（`:212-224`，MI_COMPRESSED inflate+递归一层）。

## 3. 内部逻辑与关键流程

`parseMatLevel5`（`:226-285`）：`isMatLevel5` 校验抛错；端序由 126-128 字节标记 'IM'（小端）判定（`:231-232`）；`collectVariables` 遍历 128 起 tag 流（压缩元素解压失败 warn 跳过）；取首个多元素矩阵；**列主序展开**（与 MATLAB 内存布局一致，`:31`）：

- `cols≥2`：首列=X，其余列=Y 序列（标签 `name[:, i]`）。
- `rows≥2` 单列：X=索引，Y=列值。
- 否则抛「维度过小」。

metadata 记变量名/维度/complex（'是（仅保留实部）'）/全部变量名清单。

## 4. 调用者与调用链

出向：`node:zlib`（inflateSync）、`./types`（buildDataset/ParsedDataset）（`:8-9`）。入向（rg 全冻结树）：`cslab-iron-cage.ts:59`（parseMatLevel5/isMatV73/isMatLevel5，摄取中枢）、`cslab-formats/sniff.ts:6`（isMatLevel5/isMatV73）、`cslab-formats.test.ts:7`、`cslab-formats/index.ts:8` 转发。产品入口：main（经 iron-cage）。

## 5. 数据 I/O、读写与副作用

console.warn（压缩解压失败，`:218`）；无文件 I/O。

## 6. 分支、失败、取消与恢复

抛 `Error` 3 处（非 Level5/无可用矩阵/维度过小）；压缩失败 warn 跳过（受控恢复）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；v7.3 分工声明（`:5`）是能力边界口径。

## 8. 修改影响面

tag 词法/列主序语义影响 MAT 摄取；测试 `cslab-formats.test.ts`。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-formats.test.ts`（本批，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| v7.3 仅识别交 Python 通道 | 已证实 | `:5,46-49` |
| 复数仅留实部+标记 | 已证实 | `:190-193,277` |
| 只取首个可用矩阵 | 已证实 | `:229-231` |
| small-tag+8 字节对齐 | 已证实 | `:51-68` |
| 真实 MAT 语料 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | 42-226 | covered |
| tag/数值/矩阵解析 | §2/§3 | 51-224 | covered |
| 归一化输出 | §3 | 226-285 | covered |
