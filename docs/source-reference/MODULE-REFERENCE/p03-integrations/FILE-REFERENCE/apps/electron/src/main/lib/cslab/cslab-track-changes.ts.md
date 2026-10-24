---
path: apps/electron/src/main/lib/cslab/cslab-track-changes.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1432f2a316c8d63a81e37596256b7be3a4b33d60
sha256: 2afd0460e977abce4220056f1918be555c5f0ea806d72ab843efab88ad30ea18
lines: 36
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-track-changes.ts

## 1. 结论与边界

**CSLab 论文修订（Track Changes）主进程封装**（`cslab-track-changes.ts:1-7` 注释）：复用 OOXML 引擎导出/导入带 Word 修订与批注的 docx；切片计划 `planSuggestionApplication` 放在 `@profer/shared` 供双端共用同一套**「绝不跨 Block 加 Mark」**纯函数（`:5-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `suggestionIdToWordId` | re-export | `:12` | 来自 `./cslab-ooxml` |
| `describeSuggestionPlanFailure`/`planSuggestionApplication` | re-export | `:14-17` | 来自 `@profer/shared` |
| `CsLabDocBlock`/`CsLabSuggestionPlan`/`CsLabSuggestionSlice` | type re-export | `:18-22` | 来自 `@profer/shared` |
| `exportTrackedDocx` | function（export） | `:25-29` | `(input: OoxmlExportInput) => Promise<Uint8Array>`；Worker 线程优先（`:24`） |
| `importTrackedDocx` | function（export） | `:32-36` | `(buffer) => Promise<OoxmlImportResult>` |

## 3. 内部逻辑与关键流程

两包装函数：`runOoxmlTask` 分派 export/import（`:26/:33`），结果 type 不匹配即抛（`:27/:34`）；导出取 `result.buffer`（`:28`）。

## 4. 调用者与调用链

入向：CSLab 修订导出/导入链（跨文件）。出向：`./cslab-ooxml`（runOoxmlTask/suggestionIdToWordId，**不在本批**）、`@profer/shared`（切片计划纯函数）。

## 5. 数据 I/O、读写与副作用

经 OOXML Worker 读写 docx（间接）；本文件无直接 I/O。

## 6. 分支、失败、取消与恢复

结果类型不符即抛（`:27/:34`）；不适用取消/恢复（Worker 任务生命周期在 cslab-ooxml）。

## 7. 权限与权威状态

不适用（封装层）；「绝不跨 Block 加 Mark」约束在 shared 纯函数（`:5-6`）。

## 8. 修改影响面

改封装 → 修订 docx 导出/导入链；re-export 面变化牵动双端切片计划。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `exportTrackedDocx|importTrackedDocx` → 0 命中；planSuggestionApplication 测试在 shared 侧非本批）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出组+两包装 | 已证实 | 逐行读 `:1-36` |
| cslab-ooxml 引擎行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出组 | §2/§3 | `:12-36` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
