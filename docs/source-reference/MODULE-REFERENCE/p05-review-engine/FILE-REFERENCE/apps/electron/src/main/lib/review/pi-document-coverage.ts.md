---
path: apps/electron/src/main/lib/review/pi-document-coverage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73e7b56f33c47feab13e6c7af48dd5199497da53
sha256: d5bc41e49f75e29af3b5c7527703f5930b5b2e4182a84a696aa51e4bc0fb075f
lines: 89
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-document-coverage.ts

## 1. 结论与边界

根据一次 Pi 运行里**实际记录**的块读取状态生成材料覆盖账本（`RunDocumentCoverage[]`，头注 :5）：区分 `read / partially-read / unread`，解析失败、占位块、预览、人工回执各有专门口径。纯函数，无 I/O。

边界：不决定业务结论；账本的持久化与消费在 `pi-case-review-service`（读状态 artifact + `run.coverage.documents`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `finalizePiDocumentCoverage` | fn | 6 | `(input) => RunDocumentCoverage[]` | 唯一导出 |

输入（:6-13）：`documents: DocumentVersion[]`、`previous: RunDocumentCoverage[]`、`readBlocksByDocument: Record<string,string[]>`、`previewedDocumentVersionIds?/fullyPreviewedDocumentVersionIds?: ReadonlySet<string>`、`citedDocumentVersionIds: ReadonlySet<string>`。内部类型 `RunDocumentCoverage`（:3，取自 `ReviewRunV2['coverage']['documents'][number]`）。

## 3. 内部逻辑与关键流程

只映射 `active !== false` 的文档（:15）。逐文档判定顺序：
1. `document.manualReadReceipt` 存在 → `read` + `reason:'审核员已核对原件：…'`（:17-23）。
2. previous 已 `read` 且 `parseStatus !== 'failed'` → 原样保留 previous（:24）。
3. 在 `fullyPreviewedDocumentVersionIds` → `read`（:25-27）。
4. 期望块集：`parseStatus==='failed'` → `[]`（空占位块不算内容，注释 :29-30），否则全部 `blockId`（:31）；读块集过滤掉不在期望集内的 id（:33）。全读 = 期望>0 且读块数==期望数（:34）。
5. `fullyRepresentedImage`：`mimeType` 以 `image/` 开头且期望>0 且所有块 `kind==='image'`（:37-39，注释 :35-36 栅格图无提取文本，图像块即完整来源）。全读且（`parseStatus==='parsed'` 或 `fullyRepresentedImage`）→ `read`（:40-42）。
6. `parseStatus==='failed'` 分支（:47-61）：有预览回执 → `partially-read`（"本次虽打开过原件，但未登记完整页面核验"+解析原因）；否则 `unread`（"读取空占位块不代表读取了原件…"）。
7. 有预览但期望块为 0 → `partially-read`（reason 用 `parseError` 或固定文案，:62-68）。
8. 有预览/读块/引用/上次 partially-read 之一 → `partially-read`（reason 三分支拼装：解析非 parsed 时区分预览-only 与部分读块；parsed 时区分预览-only/读块/仅引用/沿用 previous.reason，:69-82）。
9. 其余 → `unread`（reason 用 `parseError`/`previous.reason`/固定文案，:84-87）。

## 4. 调用者与调用链

入向：`pi-case-review-service.ts:20` 导入；调用点 `:246-253`（`reconcilePiReviewRunsWithReadReceipts` 重建历史账目）、`:722-729`（`recordPiReviewPreviewByPath`）、`:876-883`（`applyPiReadReceiptInheritance`）、`:1065-1072`（`submitPiReviewResultV2` finish 收尾）、`:1149-1156`（`finishPiReviewRunV2`）、`:1174-1181`（`updatePiReviewReadActivity`）；`pi-document-coverage.test.ts:3`。出向：仅 `@profer/shared` 类型（:1）。

## 5. 数据 I/O、读写与副作用

纯函数：无磁盘/网络/日志；输出新数组，不改输入。

## 6. 分支、失败、取消与恢复

无 throw 路径；所有分支返回确定账目行。无状态/取消概念。注意 `previous?.status==='read'` 的保留条件排除了 `failed`（:24）——与 `pi-document-coverage.test.ts:96-105` 的纠正断言一致。

## 7. 权限与权威状态

无权限分支。权威分级内建于口径：`manualReadReceipt`（人工确认）> 完整预览回执 > 逐块读取回执 > 引用记录 > previous；`failed` 材料只有人工回执能记 `read`（:17-23 优先于 :47）。

## 8. 修改影响面

改判定顺序/文案影响 `pi-case-review-service` 六个调用点的 `run.coverage.documents` 与业务就绪判定（`summarizePiReviewBusinessReadiness` 的 `unreadDocuments`，:823），进而影响报告/UI；需同步 `pi-document-coverage.test.ts`（11 用例文案断言）。

## 9. 测试证据

直接测试 `pi-document-coverage.test.ts`（11 用例 / 1 describe；`document()` 夹具 3 文本块 :5-25，纯函数；NOT_RUN）：
1. `:28-41` 读 1/3 块 → `partially-read`，reason 精确 `'本次审核通过材料工具读取了 1/3 个材料块'`。
2. `:43-52` 全读+parsed → `read`。
3. `:54-63` parseStatus=partial 全读 → `partially-read`（reason 含 `'解析状态为 partial'`）。
4. `:65-82` failed+空占位块已读 → `unread`，reason 精确含 `解析原因：PDF 解析失败`。
5. `:84-94` failed+仅预览 → `partially-read`（含 `'未登记完整页面核验'`）。
6. `:96-105` failed 但 previous=read 无视觉回执 → 纠正为 `unread`。
7. `:107-119` `manualReadReceipt` → `read`，reason `'审核员已核对原件：已逐页核对扫描件'`。
8. `:121-137` 仅引用 → `partially-read`；无任何记录 → `unread`。
9. `:139-152` 无块+预览 → `partially-read`，reason 取 `parseError`（`'PDF 无文本层'`）。
10. `:154-165` 扫描 PDF 全页预览（fullyPreviewed）→ `read`。
11. `:167-182` 独立图片图像块已核 → `read`；未核 → `unread`。

未覆盖：`previous.status==='partially-read'` 沿用 reason 分支、非 image 的 `fullyRepresentedImage` 混合块、`cited`+`readBlocks` 组合文案；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出与九步判定顺序 | 已证实 | :6-89 |
| failed 占位块不计数（注释 :29-30 与 :31 实现一致） | 已证实 | :31 |
| 权威分级（人工>全预览>读块>引用） | 已证实 | :17-27/:40-82 |
| 六个生产调用点 | 已证实 | §4 列行号 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| manualReadReceipt / previous-read / full-preview | §3.1-3.3 | 17-27 | covered |
| 全块读 + parsed/图像 | §3.4-3.5 | 31-42 | covered |
| failed 两分支 | §3.6 | 47-61 | covered |
| 预览空块 / partially-read 文案三分支 | §3.7-3.8 | 62-82 | covered |
| unread 兜底 | §3.9 | 84-87 | covered |
| partially-read 沿用 previous.reason 分支 | §9 | 80 | partial（未测） |
