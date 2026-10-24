---
path: apps/electron/src/main/lib/feishu/card-renderer-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a2b3473dca5c2b8daf7153eb739b489a71ea337
sha256: bc3b7703610d04b1da73d07f00d883924e9029b50778333d75cebae275cbd7e9
lines: 83
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu/card-renderer-v2.test.ts

## 1. 测试目标

飞书流式卡片工具调用折叠测试（`:53`）：被测 `renderCard`（本批另篇）。mock 边界：无 mock——工具/状态字面量构造（`tool`/`stateWithTools` `:16-35`）；`collectCollapsiblePanels` 递归收集（`:37-51`）。

## 2. 用例清单

1 describe、3 test：

1. `:54` 单个运行中工具→面板默认收起。
2. `:63` 多个已完成工具→摘要面板默认收起（折叠为 1 个）。
3. `:76` 卡片文案不含 Emoji（`EMOJI_PATTERN=\p{Extended_Pictographic}`，`:12-14` 注释：覆盖国旗/Dingbats 扩展等官方分类）。

## 3. 真实断言

`:59-60` panels 1+expanded false；`:71-73` 折叠后面板恰 1+收起；`:81` `JSON.stringify(card)` 不匹配 Emoji 模式（含 stopHint 场景）。

## 4. 未覆盖与脆弱点

未覆盖：text 块渲染、reasoning 面板、终态注记、metaFooter/summaryText、>3 工具 running 期「摘要+最新」双面板、header 着色。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例锚点与断言文本 | 已证实 | `:53-82` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 折叠/收起/无 Emoji | §3 | covered |
| 其余渲染分支 | §4 | unknown（未覆盖） |
| 实际运行 | §5 | unknown（NOT_RUN） |
