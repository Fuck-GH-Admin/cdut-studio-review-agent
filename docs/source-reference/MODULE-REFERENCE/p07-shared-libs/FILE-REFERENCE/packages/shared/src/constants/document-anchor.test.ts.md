---
path: packages/shared/src/constants/document-anchor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 706285a40c7ca55f4383bd368aa1964fd40b1a22
sha256: 115d693429e9db7cc31164fc13e0dfd148ef5e6a4245027a9add2bc74ef811bd
lines: 45
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/document-anchor.test.ts

## 1. 测试目标

验证 `packages/shared/src/constants/document-anchor.ts` 的两个正则模式串（`DOCUMENT_ANCHOR_PATTERN` 锚定、`DOCUMENT_ANCHOR_IN_TEXT_PATTERN` 文内扫描）与统一 flag `'i'`：合法锚点全形态接受、非法锚点拒绝、文内裸锚点可提取。bun:test（`:1`）；模式串经相对导入（`:2-6`），在模块级 `new RegExp` 构造 `anchorRe`/`inTextRe`（`:8-9`）。NOT_RUN，只读断言。

## 2. 用例清单

`test(` 调用点 **3 处**，其中 2 处在 for 循环内注册，运行时共 **14 个用例**（9 合法 + 4 非法 + 1 文内）：

| # | 行 | 用例 | 设置 | 动作 | 断言目标 |
| --- | --- | --- | --- | --- | --- |
| 1-9 | 23-27（循环） | 接受合法锚点：`#f1:p2-b3`、`#f2:p10-b1`、`#f3:p1-cC4`、`#f3:p1-B4:E10`、`#f3:p1-tbl1`、`#f4:p5-r12`、`#f3:p3-cA10:B10`、`#p3-b2`、`#p10` | validCases 数组（`:12-22`） | `anchorRe.test(anchor)` | toBe(true) |
| 10-13 | 35-39（循环） | 拒绝非法锚点：`#f1:page2-block3`、`<bubble anchor="#f1">`、`#f1:p2-b3#extra`、`plain_text_anchor` | invalidCases 数组（`:29-34`） | `anchorRe.test(invalid)` | toBe(false) |
| 14 | 41-44 | 文内扫描可提取嵌入正文的裸锚点 | `'参见第2页 #f1:p2-b3 的推导'` | `inTextRe.exec(...)` | `match?.[0]` toBe `'#f1:p2-b3'` |

依赖顺序：无（夹具为模块级常量，用例相互独立）。

## 3. 真实断言

- `:25` `expect(anchorRe.test(anchor)).toBe(true)`（9 个合法形态）。
- `:37` `expect(anchorRe.test(invalid)).toBe(false)`（4 个非法形态）。
- `:43` `expect(match?.[0]).toBe('#f1:p2-b3')`。

全部断言仅 3 行（循环展开后 14 次求值）。无捕获组断言（组 1/2/3 的语义由渲染层包装 `apps/electron/src/renderer/lib/document-anchor.ts:15-21` 的注释声明，非本文件断言）。

## 4. 未覆盖与脆弱点

- 捕获组（fileId/页码+块/页码）无断言；`DOCUMENT_ANCHOR_PATTERN_FLAGS === 'i'` 本身无断言（大小写不敏感行为仅经 `#f3:p1-cC4` 等用例间接体现）。
- 头注释警示的可选量词位置陷阱（`packages/shared/src/constants/document-anchor.ts:10-11`：`?` 必须挂在块后缀组，否则 `#f1:p2` 整体失配）**没有**对应防回归用例——`#p10`（纯页面、无文件前缀）有，但 `#f1:p2`（带前缀纯页面）无。
- 裸锚点提取只测 1 例（单次 `exec`，未测多锚点 `exec` 迭代/`g` flag 语义——`inTextRe` 无 `g`）。
- `#f1:p2-B4:E10`（无 c 前缀范围带前缀）、`#f2-p3-b4`（连字符分隔形态，注释 `document-anchor.ts:7` 提及）等未列入 validCases。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 运行时用例/3 调用点 | 已证实 | `:23-27,35-39,41` |
| 合法 9 形态 + 非法 4 形态清单 | 已证实 | `:12-22,29-34` |
| 文内提取单锚点 | 已证实 | `:41-44` |
| 可选量词位置陷阱无回归用例 | 已证实（核对源注释 `document-anchor.ts:10-11` 与用例清单） | `:12-34` 无 `#f1:p2` |
| 测试通过与否 | 未知 | NOT_RUN |
| `inTextRe` 与 `anchorRe` 捕获口径一致性 | 未知 | 注释声明（`document-anchor.ts:16`），无断言 |

## 6. 覆盖表

| 被测符号/分支 | 手册章节 | 用例 # | 状态 |
| --- | --- | --- | --- |
| `DOCUMENT_ANCHOR_PATTERN` 合法面 | §2/§3 | 1-9 | covered |
| `DOCUMENT_ANCHOR_PATTERN` 非法面 | §2/§3 | 10-13 | covered |
| `DOCUMENT_ANCHOR_IN_TEXT_PATTERN` | §2/§3 | 14 | partial（单例） |
| `DOCUMENT_ANCHOR_PATTERN_FLAGS` | §4 | — | unknown（无直接断言） |
| 捕获组语义 | §4 | — | unknown |
