---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-physical-intake.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ade7abcca0c4dd98793e8f2f9a2bfbaf370b3b50
sha256: 6d1b002903a106803500d2d2377d1f14393e4ebe45aa44bc06f3f1ef9f31b887
lines: 127
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-physical-intake.test.ts

## 1. 测试目标

`review-v3-t06-physical-intake.ts` 的预览/计划/执行三链（连带 `review-v3-t06-physical-manifest` 清单建议）。被测逻辑见同组手册。

## 2. 用例清单

**8 个 `test()`**：一目录一案卷分组（`:13-19`）、剥壳须显式+根文件不静默归属（`:21-28`）、**重复路径/穿越提交前拒**（`:30-40`）、申请人/绑定模板兼容校验（`:42-57`）、100 案 500 文件→100 组（**:59-67 规模**）、**执行只建批完整导入案卷**（`:69-93`）、零导入不报成功批（`:95-109`）、清单建议唯一编号不从姓名推断（`:111-127`）。

## 3. 真实断言（代表性）

- `:16-18` 2 组（2+1 条目）、unassignedCount 0。
- `:23-27` 剥壳前后 1→2 组；平铺文件 unassigned 1；显式分组名 '组织丙'。
- `:36-39` 重复路径+`../` 穿越 → errors 2、plan 无 request。
- `:49-56` 缺申请人/未知案卷拒；补齐后 actions `['create','existing']`、entryIds 保序。
- `:65-66` 100 组×5 条目。
- `:89-92` 状态 `['done','failed']`、失败组保留 caseId、`batchId 'batch-1'`、**批只含 case-甲**（`batch:case-甲`）。
- `:106-108` 全失败→`batchId` undefined、documents 空、status failed（createBatch 被 mock 成必抛）。
- `:118-126` 唯一编号→create 建议；同编号两行→ambiguous 且无建议。

## 4. 未覆盖与脆弱点

未覆盖：warnings/excluded 回执透传、多模板批次命名。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §3 | 已证实 | 逐行读 `:1-127` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 预览/计划/执行/清单建议 | 8 | covered |
