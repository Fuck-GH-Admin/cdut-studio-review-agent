---
path: apps/electron/src/main/lib/review/document-capability-library.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 435328a0001d6bded258900af654f3a602d6a9d5
sha256: 859f7fdab0138148c8f964c5a70ad474355bec865207a9475847aaabd1609c26
lines: 156
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/document-capability-library.test.ts

## 1. 测试目标

DocumentCapabilityLibrary：表格读取+图像核对才 fullyRead、Office 版面块缺资产如实统计、loadImage 路径/ID 守卫、独立 PNG 视觉核对、会话阅读账本、解析失败占位块不入账、长文本分页。

## 2. 用例清单

7 用例 / 1 describe（`DocumentCapabilityLibrary` :31）。夹具：mkdtemp 真实目录 + 真实 PNG 字节；`document(blocks)` 帮手（:23-30）；无 mock。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 表格读取+文本与图像都核对才已读 | 33-63 |
| 2 | Office 版面块无资产：统计缺失+拒绝核对 | 65-83 |
| 3 | loadImage 只按 blockId+目录约束+真实格式 | 85-97 |
| 4 | 独立 PNG 视觉核对后已读 | 99-111 |
| 5 | 只有本会话读完全部块才算完整 | 113-126 |
| 6 | 解析失败占位块不入目录/不可读 | 128-143 |
| 7 | 长文本按字符分页、全页才已读 | 145-156 |

## 3. 真实断言

- 1：inventory 无 `imageAssetPath` 键（:38）、`imageAssetsMissingCount:0`/`imagesAwaitingInspection:1`（:41-45）；sheet 过滤读 `['cell-a1','cell-b1']`、`fullyRead` false、usage `partially-read`（:47-51）；`markImageRead` 后 `imagesAwaitingInspection:0`、usage `read`、`isFullyRead` true（:52-56）。
- 2：`{parseStatus:'partial', imageBlockCount:1, imageAssetsMissingCount:1, imagesAwaitingInspection:1, parseError:'图片未提取'}`（:70-76）；`markImageRead` throw `尚无可核验原件`（:79）。
- 3：PNG dataUrl `toStartWith('data:image/png;base64,')`（:91）；`missing` throw `图像块不存在`（:92）；`../outside.png` throw `不在当前案卷目录中`（:94）。
- 4：`isFullyRead` false → `markImageRead` → usage `read`、`isFullyRead` true（:104-109）。
- 5：读 p1 不 fully、offset:1 读完才 fully（:118-124）。
- 6：inventory `{blockCount:0, textBlockCount:0, imageBlocks:[], parseError:'PDF 解析失败'}`、read 空块、`fullyRead` false、usage 保持 `registered`（:132-141）。
- 7：首页 `{textOffset:0, nextTextOffset:12000, truncated:true}`、二页 `{textOffset:12000, truncated:false}` 8500 字、fullyRead true；越界 throw `超出文本块长度`（:148-155）。

## 4. 未覆盖与脆弱点

- 未覆盖：`search`、`detectImageMime` 未知签名、8MB 上限、`onActivity` 回调。
- 脆弱点：`/tmp/case` 硬编码根用于不触盘用例；`source.blocks[0]!.imageAssetPath = …` 直改夹具（:93）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §3 | 已证实 | 本文件逐行 |
| 已读三不变量（会话账本/图像核对/失败块不入账）被固定 | 已证实 | 用例 1/4/5/6 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| listDocuments/read/isFullyRead/recordRead | §3 | covered |
| loadImage/markImageRead 守卫 | §3 | covered |
| 长文本分页 | §3 | covered |
| search/签名/大小上限 | §4 | unknown（未测） |
