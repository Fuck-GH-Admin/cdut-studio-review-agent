---
path: apps/electron/src/renderer/components/agent/inline-image-sources.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09466557cd549eb65e640bb42a79dd1f1a05eda5
sha256: fdf0730605e4c151781da3698895a558ffae219e1ca624f3c5c08d8e3df7732f
lines: 35
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/inline-image-sources.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

内联图片候选：data URL 提取且从展示文本剥离；带 query 的图片 URL 识别且原文保留；非图片扩展名不作候选；相同图片去重。

## 2. 用例清单

共 4 个 `it(`（`apps/electron/src/renderer/components/agent/inline-image-sources.test.ts:9,18,25,30`，describe `:8`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | data URL 剥离（`:9`） | `images` 长度 1、`kind==='dataUrl'`；cleanText 无 `'base64'`、含 `'结果如下'` |
| 2 | query URL 保留（`:18`） | 长度 1、`toMatchObject({kind:'remote',url:'https://a.com/x.png?size=2'})`；cleanText 含原文 |
| 3 | 非图片扩展名（`:25`） | `report.pdf` → `images` 长度 0 |
| 4 | 去重（`:30`） | 同 URL×2 → 长度 1 |

## 3. 真实断言

逐条见上表（`:12-15,21-22,27,33`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：12 张上限、`filenameFromUrl` 回退、data URL 解析失败分支。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep it(`；`:9-34` |
| 剥离/保留/拒/去重 | 已证实 | `:12-33` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| data URL | 1 | 9-16 | covered |
| URL 候选 | 2,3 | 18-28 | covered |
| 去重 | 4 | 30-34 | covered |
| 上限/回退 | 无 | — | unknown |
