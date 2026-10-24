---
path: apps/electron/src/main/lib/review/review-v3-t02-pptx-visual-assets.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 01c1e45e566e65598a5ca9b066e4e2be0b0377fc
sha256: fe287dad2cc3533dfb5ea14826a70d3f1ea127e5969af0fbc844f69b7f1cbddd
lines: 139
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t02-pptx-visual-assets.ts

## 1. 结论与边界

T02：恢复真实 PPTX/OOXML 图片字节并带幻灯片级出处（文件头 `:1-8`）：纯几何 Office AST 图形在恢复物理字节前不能提交 Vision；**绝不把关系目标或 alt 文本当作已识别图片内容**；调用方持有可信文件路径，无渲染层文件系统路径进入本模块。异步解包（JSZip）+ 可选落盘。

不做的事：不做 OCR/视觉核验（imageAlt 明示“尚未 OCR/视觉核验”）；不读外部 URL/图表/OLE（`:110`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T02SlideImage` | interface | `:14-24` | `{page; order; sha256（物理媒体 hash；同图复用多页保留两个源位置，`:17`）; contentType; imageAssetPath?（仅调用方供可信目的地，`:20`）; imageAlt（**非 OCR 结果**，`:23`）}` |
| `T02SlideImagesResult` | interface | `:26-30` | `{images[]; warnings[]; slideCount}` |
| `extractT02PptxImages` | function | `:80-139` | `(filePath, destination?) => Promise<T02SlideImagesResult>` |

内部：`attributes`/`relationships`（`:32-47`，正则解析 XML 属性/关系）；`IMAGE_EXTENSIONS`（`:49-52`）；`orderedSlideParts`（`:55-78`，**presentation sldId 顺序权威**——slide1.xml 不等于第一张可见幻灯片；无 presentation 时回退“显式 slide-part 顺序，不声称演示顺序”，`:74`）。

## 3. 内部逻辑与关键流程

`extractT02PptxImages`（`:80-139`）：

1. JSZip 读包 → `orderedSlideParts`。
2. 逐幻灯片解析 rels 与 `<a:blip r:embed>` 图片引用（`:89-96`）。
3. 逐引用（`:98-135`）：
   - 关系须本地、type 以 `/image` 结尾、target 非绝对 URL（否则 warning“无本地媒体关系”）（`:99-103`）。
   - 目标归一（`../media/pic.png` 或 `/ppt/media/pic.png` 皆为包内部件，`:104-109`）；**只读 `ppt/media/` 且必须存在**（否则“缺少 PPTX 媒体字节”；不读外部/图表/OLE，`:110-114`）。
   - 扩展名须在 6 格式表（否则“媒体格式未支持”）（`:115-120`）。
   - 取字节算 sha256；有 destination 时落盘 `t02-ppt-slide-{页}-img-{序}-{hash12}{ext}` 并回填相对 `imageAssetPath`（`:121-129`）。
   - 记录 `{page, order, sha256, contentType, imageAlt: '第 N 页图片 M；原件字节已提取，尚未 OCR/视觉核验'}`。
4. 返回 `{images, warnings, slideCount}`。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：T02 视觉素材链路（`review-v3-t02-visual-ocr`/`staged-visual-ocr` 消费）；直接测试 `review-v3-t02-visual-material.test.ts`。出向：`jszip`、`node:fs/promises`、`node:crypto`、`node:path.posix`。

## 5. 数据 I/O、读写与副作用

读调用方供的文件；可选写 destination.directory（`mkdir recursive`+writeFile）；无网络/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无本地媒体关系/缺字节/格式不支持 | `:100-120` | warning 留痕、跳过 |
| presentation 缺失 | `:74-77` | 回退 slide-part 顺序（不声称演示顺序） |
| 取消/恢复 | 无 | 无 AbortSignal |

## 7. 权限与权威状态

诚实边界：alt 非 OCR（`:23`、`:133`）；顺序口径（sldId 权威/回退不声称）；只读 `ppt/media/` 防路径/外部载荷；`imageAssetPath` 仅在调用方供可信目的地时存在。

## 8. 修改影响面

改关系/媒体解析 → 影响 T02 视觉核验输入；`imageAssetPath` 契约联动素材落盘方。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t02-visual-material.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 真实字节恢复+hash+出处 | 已证实 | `:121-134` |
| sldId 权威顺序/回退口径 | 已证实 | `:54-78` |
| 不读外部/图表/OLE | 已证实 | `:110-114` |
| alt 非 OCR 结论 | 已证实 | `:23/:133` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两接口/辅助 | 2 | `:14-52` | covered |
| `orderedSlideParts` | 2 | `:55-78` | covered |
| `extractT02PptxImages` | 3 | `:80-139` | covered |
