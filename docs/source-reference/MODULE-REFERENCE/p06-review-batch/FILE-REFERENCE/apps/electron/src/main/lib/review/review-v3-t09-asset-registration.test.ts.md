---
path: apps/electron/src/main/lib/review/review-v3-t09-asset-registration.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69649a8f3a0f38f3fe6a9cf83b343c2968e19aeb
sha256: 403014dd00c9e09383ccecb4f7d28fcef195355de9b8e1a055cdaa98471a6238
lines: 95
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-asset-registration.test.ts

## 1. 测试目标

OFF-05（文件头 `:1-4`）：离线补件附件必须保留原文件名并绑定补件槽位；用真实 Case 聚合与真实材料事务（V2 模板案卷 + 原生案卷双通道）。被测：`registerT09StudentAsset`（`review-v3-t09-asset-registration`）。夹具：`PROFER_CONFIG_DIR` 仓库 `work/tmp/t09-asset-<时间戳>`（`:10-13`）；真实发布模板 `t09-slot-template@1`（槽 `proof-slot`，minCount 1/maxCount 2）。

## 2. 用例清单

1 describe、**3 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:42-59` | 模板案卷登记 PDF 字节+`proof-slot`：文档 `fileName==='补充证明材料.pdf'`、`materialSlotId==='proof-slot'`、`role==='evidence'`；`revision` 恰 +1；`result.revision` 等于登记后聚合 revision |
| 2 | `:61-74` | 非法槽 `not-a-slot` → `rejects.toThrow('材料槽不存在')`；文档数与 revision 均不变（不落材料） |
| 3 | `:76-94` | 原生案卷（综合测评/2026）用内置模板真实槽位登记 txt：文档 `fileName==='离线补充说明.txt'`、（若槽存在）`materialSlotId` 匹配；`t09AssetTempRoot()` 存在 |

## 3. 真实断言

- #1 断言 `result.revision === after.caseV2.revision`（Main 回读真实值，非 Renderer 自报）。
- #2 断言“拒绝即零副作用”（文档数/revision 双不变）。
- #3 用 `getTemplate(aggregate.caseV2.templateId, ...)` 取**内置模板真实槽**（注释 `:81`“不能凭空断言别的模板的槽”），条件断言（`if (slotId)`）。
- 字节用 `Uint8Array` 直造（`%PDF-1` 头、`test` 文本）。

## 4. 未覆盖与脆弱点

**未覆盖**：`authorizeAtCommit` 注入路径；V2 通道的 `registerMaterial` 失败分支（“未返回版本记录”）；临时文件 finally 清理的直接断言；`safeTempName` 边界（特殊字符/超长/空名）。

**脆弱点**：#3 条件断言在内置模板无槽时会跳过槽位验证（薄覆盖）；#2 的文案断言来自 `material-service` 槽位校验（“材料槽不存在于当前模板”）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、真实双通道 | 已证实 | `:38`；`createCaseFromTemplate`/`createNativeWorkspaceCaseV3` |
| 附件保留原名+槽位+revision 精确 | 已证实 | `:42-59` |
| 非法槽零副作用拒绝 | 已证实 | `:61-74` |
| 原生通道同 helper | 已证实 | `:76-94` |
| 清理/失败分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| V2 通道登记 | #1 | `:42-59` | covered |
| 槽位校验拒绝 | #2 | `:61-74` | covered |
| 原生通道登记 | #3 | `:76-94` | covered |
| 失败分支/清理 | — | — | unknown |
