---
path: apps/electron/src/renderer/components/agent/image-attachment-marker.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c4748153342786dcf15a01e2210b71418e5cae10
sha256: 1695e11124c45298a9aec3b67936d74620e9e9d8bf50ff6974bf04361cdb0f6c
lines: 55
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/image-attachment-marker.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

标记解析安全面：合法标记产出图片+洁净文本（保留段落间距）；SVG/畸形标记移除但不产出；缺字段不进加载器；结构化 details 提取；嵌套 output 形状。

## 2. 用例清单

共 5 个 `test(`（`apps/electron/src/renderer/components/agent/image-attachment-marker.test.ts:7,19,29,36,48`，describe `:6`）。夹具 `validMarker`（`:4`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 合法标记（`:7`） | `images` `toEqual` 完整三字段；cleanText `'图片已准备好。\n\n请查看。'`（`:15` 注释：独占 marker 行移除后留一空行） |
| 2 | SVG/畸形（`:19`） | `images` `toEqual([])`；cleanText `'before   after'` |
| 3 | 缺字段（`:29`） | `images` `toEqual([])`、cleanText `''` |
| 4 | details 提取（`:36`） | `toEqual` 三字段（多余 `absolutePath` 被剥） |
| 5 | 嵌套 output（`:48`） | `toMatchObject({filename:'generated.webp',mediaType:'image/webp'})` |

## 3. 真实断言

逐条见上表（`:10-16,25-26,32-33,41-45,53`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：`imageAttachments[]` 数组分支、按 localPath 去重、≥3 空行压缩。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:7-54` |
| 伪造/SVG/缺字段拒 | 已证实 | `:25-33` |
| 洁净文本语义 | 已证实 | `:16,26` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 标记解析 | 1-3 | 7-34 | covered |
| details 两形态 | 4,5 | 36-54 | covered |
| 数组/去重 | 无 | — | unknown |
