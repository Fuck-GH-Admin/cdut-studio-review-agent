---
path: apps/electron/src/main/lib/review/material-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ed7269a064b6d19aa5f78a9a67e542158d2b5797
sha256: 2379f2d2b8e13bade1539fcf557b2e50568ce130129d74e8e6355bb41e881063
lines: 165
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/material-service.test.ts

## 1. 测试目标

材料版本链（describe `:27`）与 ASSET-02/04 原件冻结/材料身份（describe `:130`）：同名再登记形成新版本并停用旧版；迁移失败材料重解析保留原名+替换旧版；XLSX 结构解析保留 sheet-cell 定位；落盘原件字节 hash 与 `byteHash` 一致；同槽同名不同 role 不互相停用。被测：`registerMaterial`（`material-service`）。夹具：`PROFER_CONFIG_DIR=mkdtemp(cdut-material-version-)`（`:13-17`）、真实模板发布、`JSZip` 造真 xlsx。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**5 test**：

### 2.1 材料版本链（3，`:27-128`）
1. `:28-53` 同名再登记：两版本、`versions[0].active===false`、`versions[1].supersedesVersionId===firstVersion`、`versions[1].active===true`。
2. `:55-101` 重解析修复：`writeAggregate` 伪造 V1 解析失败旧版（`parseStatus:'failed'`、`unusedReason:'V1 解析失败'`）后带 `replacesVersionIds` 重登记 → `entity.fileName==='获奖页.html'`（保留原名）、`parseStatus==='parsed'`、旧版 `active===false`、末版 `toMatchObject({fileName, active:true, parseStatus:'parsed', supersedesVersionId: oldVersionId})`。
3. `:103-127` XLSX：JSZip 构造 workbook+sheet1（申报项目!C4=创新创业项目）→ `parseStatus:'parsed'`、1 块、`toMatchObject({text:'创新创业项目', kind:'table', format:'table-cell', location:{kind:'sheet-cell', sheet:'申报项目', row:4, column:'C'}})`。

### 2.2 ASSET-02/04（2，`:130-164`）
4. `:131-145` 冻结字节一致：读 `review-cases/{caseId}/{assetPath}` 落盘文件 sha256 `=== doc.byteHash`。
5. `:147-164` role 身份：同槽 `forms` 同名 `申请表.pdf` 分别以 `rule`/`application` 登记 → 2 文档、**全部 active**、`docs[1].supersedesVersionId` undefined。

## 3. 真实断言

- #1/#5 断言 `supersedesVersionId` 有/无——版本链语义（同槽同名同 role 才替换，ASSET-04）。
- #2 用 `writeAggregate` 直改聚合制造迁移失败现场（测试专用），断言修复后原名保留+双替换语义。
- #3 的 xlsx 是 ZIP 内真实 XML（非 mock 解析器）。
- #4 从磁盘回读原件字节对 hash（“版本回执指向的字节与登记时 hash 完全一致”的实证）。

## 4. 未覆盖与脆弱点

**未覆盖**：50MB 上限、`replacesVersionIds` 无效目标拒绝、槽位非法拒绝、DOCX/PDF/图片解析路径、`pickAndRegisterMaterials`、`canSubmit`、CAS 失败清目录、`authorizeAtCommit`。

**脆弱点**：#2 依赖 `writeAggregate` 注入（绕过命令层）；#3 依赖 `extractSpreadsheetReviewContent` 的 XML 解析；#5 断言模板槽 `forms` 需模板无槽定义时的兼容语义（本测试模板 `materialSlots:[]` 时槽位走历史分组标签语义——`material-service.ts:199-201`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、5 test、真实 I/O+JSZip | 已证实 | `:27/:130`；`grep -c test(`=5 |
| 同名新版本+停旧版 | 已证实 | `:28-53` |
| 重解析保留原名+替换 | 已证实 | `:55-101` |
| XLSX sheet-cell 定位 | 已证实 | `:103-127` |
| 冻结字节=byteHash | 已证实 | `:131-145` |
| role 身份不互替 | 已证实 | `:147-164` |
| 解析失败/上限/清理分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 同名版本链 | #1 | `:28-53` | covered |
| replacesVersionIds 修复 | #2 | `:55-101` | covered |
| XLSX 解析 | #3 | `:103-127` | covered |
| 冻结/落盘 hash | #4 | `:131-145` | covered |
| role 身份（ASSET-04） | #5 | `:147-164` | covered |
| 失败/上限/清理 | — | — | unknown |
