---
path: apps/electron/src/main/lib/review/review-v3-t02-visual-material.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b1242d5a9cb1bd720dab574e9cdff518e3aaf18
sha256: cfeedfc10e7a1714dbab4c441ed80e96d5478e5af9576dd06ce2a042aea78c90
lines: 201
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t02-visual-material.test.ts

## 1. 测试目标

T02 视觉素材三链（3 describe）：PPTX 图片物理覆盖、真实 OCR 端口复用（绝不伪造结论）、可信 B2 图片 OCR 预览。被测：`extractT02PptxImages`、`parseFileIntoSourceDocument`（视觉分支）、`parseT02VisualMaterialWithOcr`、`previewT02StagedVisualOcr`。夹具：`mkdtemp(review-t02-real-visual-)`、`examplePptx()` 用 JSZip 手工构造双幻灯片 PPTX（sldId 顺序 rId8→slide2 先于 rId7→slide1）、1x1 PNG。本轮 `NOT_RUN`。

## 2. 用例清单

3 describe、**7 test**：

### 2.1 PPTX 图片覆盖（3，`:42-86`）
1. `:43-58` presentation 顺序+真实媒体落盘：slideCount 2、warnings `[]`、page `[1,2]`、assetPath 含 `t02-ppt-slide-1`、contentType png、**落盘字节与 PNG 相等**。
2. `:60-74` 包绝对关系 `/ppt/media/pic2.png` 不误判外部图：warnings `[]`、page `[1,2]`。
3. `:76-85` 纯图 deck：`parseStatus==='partial'`、image 块 ≥2 带 assetPath、**无“图片内容已经自动识别”伪造文本**。

### 2.2 OCR 端口复用（3，`:88-163`）
4. `:89-118` 图片 OCR 成页锚定假设块：ocrBlocks 1、`parseStatus:'partial'`；文本“实验室使用许可” page 1、confidence≈0.91、**bbox `[0.1,0.125,0.6,0.375]`**（100x80 归一）、imageAssetPath、id 含 `-ocr-001`、parseError 含“待人工确认”。recognize 断言 `pageAssetPath===original`。
5. `:119-146` PPTX OCR 指回真实媒体**不发明幻灯片几何**：2 条假设块 page [1,2]、imageAssetPath 含 `t02-ppt-slide-`、**bbox undefined**、confidence 0.9、partial。
6. `:148-162` OCR 不可用：ocrBlocks 0、awaiting 1、所有块无文本、warnings 含“未安装”（recognize 若被调即 throw）。

### 2.3 B2 图片 OCR 预览（1，`:166-201`）
7. `:167-200` 真实 staged 字节+候选限定+稳定版本身份：`checkpoint:'staging-only'`/`candidateOnly:true`、ocrEngine、inspected 1/awaiting 0；ocrText[0] `{text, page:1, confidence:0.88, bbox:[0.01,0.01,0.13,0.09]}`、sourceBlockKey 含 documentVersionId；`revoke` 后 rejects `B2_OWNER_INVALID_OR_REVOKED`。

## 3. 真实断言

- #1 断言**落盘字节与原 PNG 相等**（真实媒体恢复）。
- #2 验证包绝对关系归一（不误判外部）。
- #3/#6 是“不伪造结论/不冒充已读”的直接反证。
- #4/#7 的 bbox 数值断言精确到归一坐标。
- #5 的 `bbox).toBeUndefined()`——PPTX 不发明几何。

## 4. 未覆盖与脆弱点

**未覆盖**：PDF 栅格化分支（Poppler 依赖）；`maxPdfPages`/`inspectPdfPages:false`；`T02_STAGED_BYTES_CHANGED`；OCR 无可靠文字/异常分支。

**脆弱点**：`examplePptx()` 的 sldId/rels 构造与解析器正则耦合；bbox 归一数值依赖 fixture rect。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 describe、7 test、真实 PPTX/PNG/staging | 已证实 | `:42/:88/:166`；`grep -c test(`=7 |
| 真实媒体恢复+顺序权威 | 已证实 | `:43-58` |
| 包绝对关系不误判 | 已证实 | `:60-74` |
| OCR 假设+不伪造 | 已证实 | `:76-162` |
| bbox 语义（整页可定位/PPTX 不伪造） | 已证实 | `:114`、`:142` |
| B2 预览候选限定+撤销拒绝 | 已证实 | `:167-200` |
| PDF 分支 | 未知 | 未覆盖（Poppler 环境依赖） |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `extractT02PptxImages` | #1/#2 | `:43-74` | covered |
| `parseFileIntoSourceDocument` 视觉分支 | #3 | `:76-85` | covered |
| `parseT02VisualMaterialWithOcr` 图片/PPTX/不可用 | #4-#6 | `:89-162` | covered |
| `previewT02StagedVisualOcr` | #7 | `:167-200` | covered |
| PDF 栅格化 | — | — | unknown |
