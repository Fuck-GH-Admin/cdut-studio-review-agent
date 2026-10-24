---
path: apps/electron/src/main/lib/browser-view-layout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f94e2f48ab03d1c4c3e368b7902e4b578b2bce16
sha256: fdc96cd163399f82afb7ec5aaef9d7a7a6654195e2c5a54b435c63e40bfbe810
lines: 31
kind: test
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-view-layout.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

浏览器视口布局纯函数：CSS viewport 只缩放一次并裁到 contentView 内；窗口外收敛零宽；网页 host 只覆盖 frame 内 pageBounds；布局代际仅严格递增。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/browser-view-layout.test.ts:4,12,20,27`，无 describe）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 缩放一次+裁切（`:4`） | `resolveBrowserViewportLayout({100,80,600,700},1.25,{800,700})` `toEqual({x:125,y:100,width:675,height:600})` |
| 2 | 窗口外收敛（`:12`） | `{900,20,200,100}` zoom 1 → `toEqual({x:800,y:20,width:0,height:100})` |
| 3 | pageHost 偏移合成（`:20`） | `resolveBrowserPageHostBounds` `toEqual({x:112,y:296,width:788,height:504})` |
| 4 | 代际严格递增（`:27`） | `(12,12)`→false、`(12,11)`→false、`(12,13)`→true |

## 3. 真实断言

逐条见上表（`:9,17,24,28-30`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：非法 zoom 回退 1、`hasUsableBrowserBounds`/`sameBrowserBounds`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:4-31` |
| 缩放/裁切/合成/代际 | 已证实 | `:9-30` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 缩放裁切 | 1,2 | 4-18 | covered |
| pageHost | 3 | 20-25 | covered |
| 代际门 | 4 | 27-31 | covered |
| 其余两函数 | 无 | — | unknown |
