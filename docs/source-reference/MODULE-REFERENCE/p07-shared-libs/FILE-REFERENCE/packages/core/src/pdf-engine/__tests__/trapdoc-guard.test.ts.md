---
path: packages/core/src/pdf-engine/__tests__/trapdoc-guard.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d11ad9410a06a07bd495ee939424e53706b14af8
sha256: 43c1277beecbe2f792b899c996a0dc4d86ec689ee0fcbbb72b884cf6f74fc966
lines: 59
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/pdf-engine/__tests__/trapdoc-guard.test.ts

## 1. 测试目标

TrapDocGuard 幽灵字符拦截（`packages/core/src/pdf-engine/__tests__/trapdoc-guard.test.ts:19`）：幽灵字符 100% 滤除、正常字符 0 丢失。被测 `filterGhostGlyphs`（../trapdoc-guard）。夹具 `makeGlyph()`（`:6-18` 满字段工厂）+ 固定页面 `612×792`（`:20`）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 21-39 | 5 类幽灵 100% 滤除、正常 0 丢失 | 2 正常+7 幽灵（renderingMode 3/零尺寸/零宽/零高/越界/全透明/零宽字符）→ 结果 ['H','i']、filteredCount 7 | 独立 |
| 2 | 41-47 | 内嵌不可见字符清理但字符保留 | `'A\uFEFFB\u200B'` → 1 枚、char 'AB'、filteredCount 0 | 独立 |
| 3 | 49-56 | 页面视口外幽灵文本整枚丢弃 | bbox (700,10)→ 0 枚、filteredCount 1 | 独立 |

## 3. 真实断言

- `:35-36` `result.glyphs.map(char)` toEqual `['H','i']`（顺序保持）；`filteredCount` toBe 7（幽灵全数）。
- `:44-46` 长度 1、char toBe `'AB'`、filteredCount 0。
- `:54-55` 长度 0、filteredCount 1。

## 4. 未覆盖与脆弱点

- 幽灵判定各规则的独立边界（恰 alpha 0.01 等）未测。
- 用例 1 的「5 类」标题与实际 7 幽灵枚举不完全一致（照实记录：renderingMode/零尺寸/零宽/零高/越界/透明/零宽字符=7 枚）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、幽灵全滤+正常保留 | 已证实 | `:35-36` |
| 内嵌清理不误删字符 | 已证实 | `:44-46` |
| 视口外整枚丢弃 | 已证实 | `:54-55` |
| 标题「5 类」vs 7 枚枚举差异 | 已证实（照实记录） | `:21,24-32` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 幽灵滤除 | §2/§3 | 1 | covered |
| 内嵌清理 | §2/§3 | 2 | covered |
| 视口外丢弃 | §2/§3 | 3 | covered |
| 规则边界 | §4 | — | unknown |
