---
path: apps/electron/src/renderer/components/browser/browser-viewport-layout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a024e342927e95b1e056110d1cf1b56a30a66022
sha256: 0cb78e562a5715821792128a92f0d839eff199a4d1e36e5842e712490fb931ed
lines: 31
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/browser-viewport-layout.test.ts

## 1. 测试目标

原生视图可见性/布局去重测试（`:1-2`）：被测 `resolveNativeBrowserVisible/sameBrowserViewportLayout`（本批另篇）。mock 边界：无 mock——`layout` 字面量（`:4-14`）。

## 2. 用例清单

无 describe、3 test：

1. `:16` CSS 隐藏面板时即使盒模型未变也必须隐藏原生视图（三组合）。
2. `:22` 相同几何与可见性不重复发布（revision 变化不算差异）。
3. `:26` 视口/页面/标签/可见性任一变化都发布。

## 3. 真实断言

`:17-19` false/false/true 三组合；`:23` revision 2 仍 true；`:27-30` visible/tabId/viewportBounds.x=201/pageBounds.height=499 各返 false。

## 4. 未覆盖与脆弱点

未覆盖：viewportRadius 差异、previous undefined 分支（隐含在函数首行）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例锚点与断言文本 | 已证实 | `:16-30` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 可见性/去重判定 | §3 | covered |
| 实际运行 | §5 | unknown（NOT_RUN） |
