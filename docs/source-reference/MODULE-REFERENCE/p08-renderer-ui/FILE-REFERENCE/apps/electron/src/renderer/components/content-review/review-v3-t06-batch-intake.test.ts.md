---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-batch-intake.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2f8a991c7d7b7a242d3eb7bee43ad5b996b50f85
sha256: 59f2ac7625e03a14b9bd3ddbba88e1f7e30ab068569982898c0ee3a9123795eb
lines: 32
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-batch-intake.test.ts

## 1. 测试目标

`review-v3-t06-batch-intake.ts` 的清单解析/映射/CSV 导出（describe `T06 roster intake and case assignment` `:4`）。被测逻辑见同组手册。

## 2. 用例清单

**3 个 `test()`**：中文表头+引号多行单元格且**文件名不作身份**（`:5-12`）、未知/重复/姓名冲突**不可静默成已提交案卷**（`:14-21`）、**CSV 值按数据导出非公式**（`:23-31`）。

## 3. 真实断言

- `:7-11` BOM 表头解析 2 行；`files` 多行保真（'第一页\n第二页'）。
- `:18` 首轮状态序列 `['duplicate','duplicate','name-conflict','unassigned']`；`:20` 修复后（人工覆盖+排除）`['ready','ready','ready','excluded']`。
- `:28-30` `"'=2+2"`（公式前缀转义）、`"张,三"`（逗号包裹）、`"0","5","5"`。

## 4. 未覆盖与脆弱点

未覆盖：未闭合引号错误、表头全未识别错误。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-32` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 解析/映射/导出 | 3 | covered |
