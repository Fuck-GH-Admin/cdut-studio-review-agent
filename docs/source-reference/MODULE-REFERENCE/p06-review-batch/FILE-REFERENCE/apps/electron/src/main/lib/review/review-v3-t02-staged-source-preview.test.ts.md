---
path: apps/electron/src/main/lib/review/review-v3-t02-staged-source-preview.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 709b2ef59e38b711f8808a06e10fe25cef4a9660
sha256: 7d2fc019dea5427266b910455fe8020c8e755cfa5ecdd5de1effdfdfd1c1e0da
lines: 126
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t02-staged-source-preview.test.ts

## 1. 测试目标

T02 可信 staged 材料解析（describe `:21`）：CSV 引号/换行单元格、同名原件独立源版本、真实 XLSX sheet/cell 精度、图片 partial 待检、未知二进制 failed 不生成占位证据、真实 ZIP 同 basename 独立候选、12 张同名图片全量报告、撤销后预览拒绝。被测：`previewT02StagedSource`/`previewT02StagedInventory`；协作真实 `ReviewB2StagingService`/`stageReviewB2TrustedZip`、真实 `xlsx`/`adm-zip` 构造。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**8 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:22-37` | CSV 引号内换行同格：`parsed`、blockCount 6、`sheets:['CSV']`；(row2,col1)='00081'、(row2,col2)='一等\r\n奖'；两次预览 `sourceBlockKey` 序列相同（稳定） |
| 2 | `:39-51` | 同名 `证明.txt` 异字节：documentVersionId 不同、sourceBlockKey 不同、文本各归各 |
| 3 | `:53-66` | 真实 XLSX（`xlsx` 构造）：`parsed`、sheets 含“综测清单”、块 `00031` sheet/row 2 精确 |
| 4 | `:68-77` | JPEG 图片：`partial`、`imageBlocksAwaitingInspection:1`、block `{kind:'image', requiresVisualInspection:true}`（不魔术解析为文本） |
| 5 | `:79-86` | 未知二进制：`failed`、blocks 0、parseError 含“暂不支持”（不生成占位证据） |
| 6 | `:88-104` | 真实 ZIP（adm-zip）两同名条目：2 候选；inventory total 2/parsed 2、documentVersionId 2 个、文本各归各 |
| 7 | `:106-118` | 12 张同名 `图片.jpg`：inventory total 12、partial 12、images 12、12 个不同版本、每条 1 个 image 块 |
| 8 | `:120-125` | 撤销后预览 → rejects `B2_OWNER_INVALID_OR_REVOKED` |

## 3. 真实断言

- #1 的单元格文本含 `\r\n` 精确断言——CSV 解析保真；`sourceBlockKey` 可重复性断言。
- #3/#6 用真实 `xlsx`/`adm-zip` 字节（非手搓）。
- #7 断言全量清单含同名文件（“不漏报”）。

## 4. 未覆盖与脆弱点

**未覆盖**：`T02_STAGED_BYTES_CHANGED`；application 角色映射；`sheets` 多表；`indexedPages` 排序；临时目录清理验证。

**脆弱点**：CSV blockCount 6 依赖解析器行为；“暂不支持”文案断言。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、8 test、真实 staging+真实格式 | 已证实 | `:21`；`grep -c test(`=8 |
| CSV/XLSX 精度保真 | 已证实 | `:22-66` |
| 图片 partial/未知 failed 诚实 | 已证实 | `:68-86` |
| 同名独立+全量清单 | 已证实 | `:39-51`、`:88-118` |
| 撤销拒绝 | 已证实 | `:120-125` |
| 字节漂移分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `previewT02StagedSource` 各 parseStatus | #1-#5 | `:22-86` | covered |
| `previewT02StagedInventory` | #6/#7 | `:88-118` | covered |
| 授权撤销 | #8 | `:120-125` | covered |
| `T02_STAGED_BYTES_CHANGED` | — | — | unknown |
