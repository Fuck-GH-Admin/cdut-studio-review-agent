---
path: apps/electron/src/renderer/lib/document-anchor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 23ef8416ae796c8c00a764d18e5a9a25480c7bea
sha256: acbce37321935983bc6f4b6aa0fd5b0cbb482be6519e7568dbed6a711df12f72
lines: 37
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/document-anchor.test.ts

## 1. 测试目标

直接测试 `document-anchor.ts` 的 `DOCUMENT_ANCHOR_RE`（1 个 describe `:5`）：**与 shared 单一事实源一致性**+合法/非法锚点接受拒绝。3 个 `test(` 声明（其中 2 个为循环生成器，合计 13 个运行用例）。

## 2. 用例清单

| # | 行 | 真实断言 |
| --- | --- | --- |
| 1 | `:6-8` | `DOCUMENT_ANCHOR_RE.source).toBe(DOCUMENT_ANCHOR_PATTERN)`（渲染层与 shared 一致） |
| 2 | `:10-24` | 循环 8 合法锚点（`#f1:p2-b3`/`#f3:p1-cC4`/`#f3:p1-B4:E10`/`#f3:p1-tbl1`/`#f4:p5-r12`/`#p3-b2`/`#p10` 等）→`test() .toBe(true)` |
| 3 | `:26-36` | 循环 4 非法（`#f1:page2-block3`/`<bubble anchor="#f1">`/`#f1:p2-b3#extra`/`plain_text_anchor`）→`.toBe(false)` |

## 3. 真实断言

`toBe`（正则 test 结果+source 字符串）。无 mock。

## 4. 未覆盖

- `pickAnchorIcon`（图标三分派未测）；`DOCUMENT_ANCHOR_IN_TEXT_RE` 文内扫描；边界敏感中文词尾正则（发表/意图防误伤）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个 `test(` 声明（13 动态用例）、断言如 §2 | 已证实 | 文件全读（37 行） |
| 单一真源一致性锁定 | 已证实 | 用例 1 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| source 一致性 | §2 用例 1 | `:6-8` | covered |
| 合法/非法锚点 | §2 用例 2/3 | `:10-36` | covered |
| §4 边缘 | — | — | unknown |
