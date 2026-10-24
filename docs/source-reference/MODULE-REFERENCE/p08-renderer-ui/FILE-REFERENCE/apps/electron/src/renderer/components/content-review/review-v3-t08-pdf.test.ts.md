---
path: apps/electron/src/renderer/components/content-review/review-v3-t08-pdf.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6cceab037d64ce44a49fd4933ece8b82e03bb00
sha256: 612e037a79ad68ce69216c8cf75f3276dd944d75d2e33c5bf630b5c9e92028a4
lines: 23
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t08-pdf.test.ts

## 1. 测试目标

`review-v3-t08-pdf.ts` 的 `encodeT08ImagePdf` 字节结构（真实多页 A4+图像流+有效 xref）。被测逻辑见同组手册。

## 2. 用例清单

**2 个 `test()`**：双页 PDF 结构断言（`:4-20`）、空输入拒（`:21-22`）。

## 3. 真实断言

- `:10-19` `%PDF-1.4\n` 开头、`/Count 2`、`/MediaBox [0 0 595.28 841.89]`、`/Subtype /Image` 2 处、`/Type /Page /Parent` 2 处、`/Length 4 >>\nstream\n` 2 处；startxref 偏移指向 `xref\n`。
- `:22` 空数组 `toThrow('PDF 没有可输出的页面')`。

## 4. 未覆盖与脆弱点

未覆盖：`renderT08ReportPdf` canvas 排版（需 DOM）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 逐行读 `:1-23` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| PDF 组装/空拒 | 2 | covered |
| canvas 渲染 | — | unknown |
