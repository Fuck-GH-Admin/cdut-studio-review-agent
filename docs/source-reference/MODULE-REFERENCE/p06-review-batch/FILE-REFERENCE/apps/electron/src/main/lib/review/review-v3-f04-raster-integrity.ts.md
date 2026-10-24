---
path: apps/electron/src/main/lib/review/review-v3-f04-raster-integrity.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4373e6cfc6a25d34c990ad61fb3aba87c1d45030
sha256: 587382f32fbc3ac22c27276e76199d7312faba25d00f927f7feb50f6984b4b1d
lines: 71
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f04-raster-integrity.ts

## 1. 结论与边界

F04 物理图片原件预检（文件头 `:1-10`）：文件名或 OS 选择回执**不是**字节为图片的证据——在材料被宣称为“可视可检”前检查容器边界。**刻意不是完整像素解码器**：预检通过仍需 OCR/Vision 或人工查验；超大图片也只读有界头/尾。纯异步读 + 结构判断。

不做的事：不解码像素/不验内容；不做 OCR（`review-v3-t02-*` 视觉链路）；不落盘。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `inspectF04RasterOriginal` | function | `:18-71` | `(filePath, extension: '.png'\|'.jpg'\|'.jpeg'\|'.gif'\|'.webp'\|'.bmp') => Promise<{ok:true} \| {ok:false; reason}>` |

内部：`RasterExt`（`:13`）、`starts`（`:15-16`，头部签名逐字节匹配）。

## 3. 内部逻辑与关键流程

1. `open(filePath,'r')`+`stat`：非普通文件或 0 字节 → `ok:false`（“图片原件为空或不是普通文件”）（`:25-28`）。
2. 只读有界头 32B/尾 16B（`:29-32`）。
3. 按扩展名结构校验（`:35-61`）：
   - **PNG**：≥45B、8 字节签名、`IHDR`、宽高 >0、尾 12B 等于 IEND chunk。
   - **JPEG**：≥4B、`FF D8 FF` 头、`FF D9` 尾。
   - **GIF**：≥14B、`GIF87a/89a`、宽高 >0、尾 `0x3B`。
   - **WebP**：≥20B、`RIFF`+`WEBP`、`RIFF 长度+8 === 文件大小`、chunk ∈ `VP8 /VP8L/VP8X`。
   - **BMP**：≥26B、`BM`、头部声明大小 === 实际、`DIB 头 ≥12`。
4. 不符 → `ok:false`（“图片文件损坏、截断或实际格式与 X 扩展名不一致，不能作为已读取的视觉原件”）；异常 → `ok:false`（“图片原件不可读取：…”）；finally 关句柄（`:66-70`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：由 F04 物理材料预检/入库链路（`review-v3-f04-*` 消费方）调用；直接测试 `review-v3-f04-raster-integrity.test.ts`。出向仅 `node:fs/promises.open`。

## 5. 数据 I/O、读写与副作用

只读文件头/尾（32B/16B）；无写/网络/日志。大文件不整读（文件头声明）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空/非普通文件 | `:26-28` | ok:false |
| 结构不符（截断/伪装） | `:62-65` | ok:false |
| 读取异常 | `:66-67` | ok:false |
| 取消/恢复 | 无 | 无 AbortSignal；句柄 finally 关闭 |

## 7. 权限与权威状态

诚实边界即权威：预检 ≠ 内容验证（文件头）；失败文案明确“不能作为已读取的视觉原件”。

## 8. 修改影响面

改签名/边界规则 → 影响 F04 预检链路与两测试；与 `t02` 视觉 OCR 的输入契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-f04-raster-integrity.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只读有界头尾、不整读 | 已证实 | `:29-32` |
| 五格式结构校验 | 已证实 | `:35-61` |
| 预检≠内容验证 | 已证实 | 文件头、`:64` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `inspectF04RasterOriginal` 入口/边界 | 3 | `:18-32` | covered |
| 五格式分支 | 3 | `:35-61` | covered（测试仅 PNG/JPEG） |
| 失败族 | 6 | `:62-67` | covered |
