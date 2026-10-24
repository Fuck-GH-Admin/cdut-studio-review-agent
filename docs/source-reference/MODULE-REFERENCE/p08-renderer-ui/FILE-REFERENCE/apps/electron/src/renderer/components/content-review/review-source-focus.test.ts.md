---
path: apps/electron/src/renderer/components/content-review/review-source-focus.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 41f6b8c9a1488d3176752bdbb860e8ea302addb4
sha256: dbadb37423e77740f7b0dc0705cf3e86e8ea72f45b83565008da78af185aa71c
lines: 23
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-source-focus.test.ts

## 1. 测试目标

**V2 SourceRef 三栏定位映射**（`apps/electron/src/renderer/components/content-review/review-source-focus.test.ts:12`）：段落/表格单元格/页坐标定位到对应块；文件级引用只定位首块（防全跳动）。

## 2. 用例清单

1 describe / 2 test。夹具：2 块（段落+表格块）+ `ref(location)` 构造。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 段落/单元格/页坐标定位 | `paragraph index:1`→true；`sheet-cell {row:4, column:'B'}`→true；`pdf-rect page:2`→true（对 `blocks[1]`） | `:13-17` |
| 2 | 文件级只首块 | `file`→`blocks[0]` true、`blocks[1]` false | `:19-22` |

## 3. 真实断言

- `expect(sourceRefTargetsBlock(ref({ kind: 'file' }), document, blocks[1]!)).toBeFalse()`（`:21`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`text-range` 分支、文档版本前缀匹配。
- 脆弱点：表格列 `column:2→'B'` 转换断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例覆盖三类定位/首块约束 | 已证实 | `:13-22` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 三类定位 | 1 | `:13-17` | covered |
| file 首块约束 | 2 | `:19-22` | covered |
| text-range | — | — | unknown（未覆盖） |
