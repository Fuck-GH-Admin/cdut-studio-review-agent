---
path: apps/electron/src/renderer/components/browser/browser-start-page-navigation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd53450a4a9a8c13b8198748b3d9ad55c5ff7c43
sha256: b6907d20c5198c997859059f0122e5078c24b2a1f99762004b899abf597699b7
lines: 66
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/browser-start-page-navigation.test.ts

## 1. 测试目标

起始页输入归一化与默认首页判定测试（`:1-3`）：被测 `normalizeStartPageInput/shouldNavigateDefaultHome`（本批另篇）。mock 边界：无 mock——`browserState()` 字面量工厂（`:5-26`）。

## 2. 用例清单

无 describe、6 test：

1. `:28` 默认首页不为未打开浏览器的新会话创建浏览器（state null→false）。
2. `:32` 只导航一次已存在的空标签（第二次传 activeTabId→false）。
3. `:38` 已有内容的标签不被覆盖。
4. `:44` 本机/局域网地址按 HTTP 打开（7 输入）。
5. `:54` 局域网地址不当搜索词、不误补 HTTPS（回归核心）。
6. `:60` 公网域名默认 HTTPS、其余走搜索、空串返 ''。

## 3. 真实断言

`:29/:34-35/:39`；`:45-51` 七种本机/私网输入全断言（127.0.0.1/localhost/[::1]/192.168/10./172.16/.local）；`:56-57` not.toStartWith(BING/https)；`:61-65` 域名 HTTPS、中文→Bing、空白→''。

## 4. 未覆盖与脆弱点

未覆盖：正则边界（非法端口、混合输入）、主进程 browser-policy 一致性（跨进程契约）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例锚点与断言文本 | 已证实 | `:28-65` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 四分支+导航判定 | §3 | covered |
| 实际运行 | §5 | unknown（NOT_RUN） |
