---
path: apps/electron/src/main/lib/review/review-v3-f04-raster-integrity.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0f5caaa0414175e8aa3ac2a259f237ddd6318a65
sha256: 03e4efe1eea2056cc6e962d210ab122f8851c6c99c0620c63680961958503e8a
lines: 33
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f04-raster-integrity.test.ts

## 1. 测试目标

F04 物理图片预检（describe `:15`）：接受真实有界 PNG 字节且不声称内容已 OCR 验证；拒绝截断图片、扩展名伪装与缺失原件。被测：`inspectF04RasterOriginal`。夹具：`mkdtemp(review-f04-raster-)`；合法 1x1 PNG base64（`:10-13`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**2 test**：

1. `:16-20` 真实 PNG → `toEqual({ok:true})`（测试名注明“不声称内容已 OCR 验证”）。
2. `:22-32` 截断 PNG（前 32B）→ ok:false；`%PDF-1.4` 伪装 `.jpg` → ok:false；缺失 `.webp` → ok:false 且 reason 含“不可读取”。

## 3. 真实断言

- #1 精确 `toEqual({ok:true})`（成功返回无额外字段）。
- #2 三类拒绝分别对应结构不符/伪装/读取异常；断言 reason 子串“不可读取”区分读失败与结构失败。

## 4. 未覆盖与脆弱点

**未覆盖**：gif/webp/bmp 三分支；空文件/非普通文件分支；合法 JPEG/GIF/WebP/BMP 正例。

**脆弱点**：合法 PNG 依赖 base64 常量的 IEND 存在；截断长度 32 恰好小于 PNG 最小 45。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、2 test、真实文件 | 已证实 | `:15`；`grep -c test(`=2 |
| 真实 PNG 通过 | 已证实 | `:16-20` |
| 截断/伪装/缺失拒绝 | 已证实 | `:22-32` |
| gif/webp/bmp 分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| PNG 正例 | #1 | `:16-20` | covered |
| 截断/伪装/读失败 | #2 | `:22-32` | covered |
| gif/webp/bmp | — | — | unknown |
