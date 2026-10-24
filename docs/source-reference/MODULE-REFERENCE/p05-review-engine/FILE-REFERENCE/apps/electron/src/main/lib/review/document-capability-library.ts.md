---
path: apps/electron/src/main/lib/review/document-capability-library.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ddd8de6c5b8f40ca06a9502ce6b22a3d074e82f4
sha256: 1d8ba2abdf5ba0d08d8c1869d8d6a296d31665bb40c058370db541f77675baee
lines: 277
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/document-capability-library.ts

## 1. 结论与边界

Case 域文档能力库（头注 :1-5）：向审核 Agent 暴露**稳定 document/block ID** 的已解析文档事实与已核验图像资产；**绝不接受模型给的文件系统路径**。内存类，绑定一个活动案卷。

边界：解析在 `document-service`；Agent 调用面在 `review-tools`/`v2-executor-factory`/`pi-case-review-service`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DocumentSearchInput` | interface | 21-26 | 关键词/role/offset/limit |
| `DocumentReadInput` | interface | 28-41 | blockIds/offset/limit/sheetName/fromRow/toRow/textOffset/textLimit |
| `DocumentImageAttachment` | interface | 43-50 | dataUrl 图像附件 |
| `DocumentCapabilityEvent` | interface | 52-55 | 活动事件 |
| `DocumentCapabilityOptions` | interface | 57-62 | caseId/caseRoot/documents/onActivity |
| `DocumentCapabilityLibrary` | class | 65-270 | 能力库主体 |

内部：`MAX_READ_BLOCKS=80`/`MAX_BLOCK_CHARS=12_000`/`MAX_IMAGE_BYTES=8MB`（:9-11）、`canConfirmFullRead`（:13-19）、`detectImageMime`（:272-277）。

## 3. 内部逻辑与关键流程

1. **阅读账本**（内存，`readBlockIds`/`readRanges`，:68-69）：`recordRead`（:83-95）更新 usage（`read`/`partially-read`）与 unusedReason（`Agent 已读取 x/y 个已解析材料块`/解析失败 `文件解析失败；占位内容不计入材料阅读`）；`recordTextRange`（:97-110）区间合并，返回 `[0,length)` 是否全读；`canConfirmFullRead`（:13-19）：parsed 或纯图像块文档（全 image 块已视觉核对）。
2. **`listDocuments`**（:117-151）：解析失败块数记 0（:122-124）；`imageAssetsMissingCount`（无 imageAssetPath 的图像块）、`imagesAwaitingInspection`（本会话未 markImageRead 的图像块）——注释 :142-143「缺视觉资产≠已查验」。
3. **`search`**（:153-178）：大小写不敏感、跳过 image 块、文本截 600 字、分页（limit≤50）。
4. **`read`**（:180-243）：不存在/未激活 throw `材料版本不存在或未激活`（:182）；sheetName/fromRow/toRow 过滤（:188-191）；limit≤80；`textOffset` 单块分页（多块 throw `长文本分页一次只能读取一个 blockId`，:199）；`textLimit≤12_000`；越界 throw `textOffset 超出文本块长度`（:205）；区间完整才计 completedBlockIds（image 块除外，:209-210）；返回 `nextTextOffset`/`nextOffset`/`fullyRead`（:215-243）。
5. **`loadImage`**（:245-262）：块须为 image 且有 `imageAssetPath`（:249）；路径 resolve(root) 后 `relative` 越界 throw `图像资产不在当前案卷目录中`（:251-253）；大小 0<x≤8MB（:254-255）；`detectImageMime` 按字节签名（PNG/JPEG/GIF/WEBP）否则 throw `图像字节签名与受支持格式不匹配（…）；不会把未知格式发给模型`（:272-277）。
6. **`markImageRead`**（:264-270）：无 imageAssetPath → throw `图像块尚无可核验原件`（注释 :266-267「版面占位图不能称已查验，须先 loadImage」）；否则记 read + onActivity。

## 4. 调用者与调用链

入向（生产）：`pi-case-review-service.ts:19`、`v2-executor-factory.ts:27`、`review-tools.ts:11`（Agent 工具）。测试：`document-capability-library.test.ts:7`。出向：`node:fs`/`node:path`（:6-7）、`@profer/shared`（:8）。

## 5. 数据 I/O、读写与副作用

只读文件（loadImage）；阅读账本纯内存；`onActivity` 回调（read_document/inspect_document_image）。

## 6. 分支、失败、取消与恢复

throw 5 类（材料不存在/长文本多块/textOffset 越界/图像块无资产/路径越界/大小非法/签名不符/markImageRead 无资产）；账本会话级，进程重启即失（未持久化——边界如实记录）。

## 7. 权限与权威状态

- 路径权威：模型只给 ID，不给路径（头注 :4）；`loadImage` relative 越界防御（:251-253）。
- 已读权威：`fullyRead` 只算本 Agent 会话读过的块（:76-81，测试「只有当前 Agent 会话读取过全部块才算完整读取」）；图像须 `markImageRead` 才算查验（:264-270）；解析失败块不入目录（:122-124/:185）。
- 格式权威：字节签名校验，未知格式不发给模型（:276）。

## 8. 修改影响面

Agent 工具链的材料读取/视觉核对语义；`recordRead` 的 usage 更新直接进覆盖账本。同测：`document-capability-library.test.ts`（7 用例）。

## 9. 测试证据

直接测试 `document-capability-library.test.ts`（7 用例 / 1 describe；mkdtemp 真实文件/PNG 字节；NOT_RUN）：
1. `:33-63` 表格读取+图像核对才 fullyRead：inventory 无 `imageAssetPath` 键（:38-40）、`imageAssetsMissingCount:0`/`imagesAwaitingInspection:1`；sheet 过滤读 `['cell-a1','cell-b1']`、`fullyRead` false、usage `partially-read`；`markImageRead` 后 usage `read`、`isFullyRead` true。
2. `:65-83` Office 版面块无资产：`imageAssetsMissingCount:1`、`markImageRead` throw `尚无可核验原件`、`isFullyRead` false。
3. `:85-97` `loadImage`：PNG dataUrl 前缀 `data:image/png;base64,`；`missing` throw `图像块不存在`；`../outside.png` throw `不在当前案卷目录中`。
4. `:99-111` 独立 PNG 视觉核对后 `usage 'read'`、`isFullyRead` true（不因无文本层永久 partial）。
5. `:113-126` 会话阅读账本：读 p1 不 fully、读完才 fully。
6. `:128-143` 解析失败占位块：blockCount 0、read 空、`fullyRead` false、usage 保持 `registered`。
7. `:145-156` 长文本分页：`{textOffset:0,nextTextOffset:12000,truncated:true}`；第二页 `{textOffset:12000,truncated:false}`、8500 字、fullyRead true；越界 throw `超出文本块长度`。
未覆盖：`search`、`detectImageMime` 未知签名、8MB 上限；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 会话级已读账本/图像须核对 | 已证实 | :76-83/:264-270 + 测试 |
| 路径/格式双重守卫 | 已证实 | :251-255/:272-277 + 测试 :85-97 |
| 阅读账本不持久化 | 已证实 | :68-69（内存 Map） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `listDocuments`/`read`/`isFullyRead` | §3.1-3.4/§9 | 65-243 | covered |
| `loadImage`/`markImageRead` | §3.5-3.6/§9 | 245-270 | covered |
| `search` | §3.3 | 153-178 | covered（未测） |
| `detectImageMime`/大小上限 | §3.5 | 254/272-277 | partial（未测） |
