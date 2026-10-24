---
path: apps/electron/default-skills/pdf/scripts/fill_pdf_form_with_annotations.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b430069fd016cff11560d0f2b95c63074736e5e4
sha256: 8a56e063a49ed53c0b0e1d312ecf8023af76816ed139486ec3b539873de202fd
lines: 107
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/fill_pdf_form_with_annotations.py

## 1. 结论与边界

对**非可填写** PDF 以 FreeText 批注方式填表（pypdf.annotations，`apps/electron/default-skills/pdf/scripts/fill_pdf_form_with_annotations.py:33-96`）。CLI：`fill_pdf_form_with_annotations.py [input pdf] [fields.json] [output pdf]`（`:99-107`）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `transform_from_image_coords` | 10-20 | 图像坐标→PDF 坐标（比例缩放+y 轴翻转） |
| `transform_from_pdf_coords` | 23-30 | pypdf top/bottom 坐标系转换（`pdf_height - y`） |
| `fill_pdf_form` | 33-96 | `writer.append(reader)`；逐 field——`pages[].pdf_width` 有则走 pdf 坐标变换、否则用 image_width/height 变换（`:55-67`）；无 entry_text.text 跳过（`:69-74`）；`FreeText(text, rect, font 默认 Arial/font_size 默认 14pt/font_color 默认 000000，border/background=None)`（`:76-88`）；`add_annotation(page_number=page_num-1)`（`:90`）；写盘+统计 |

## 3. 内部逻辑与关键流程

主链路：`fill_pdf_form`（`:33-96`）→ `writer.append(reader)` → 逐 field 坐标变换（有 `pages[].pdf_width` 走 PDF 坐标、否则 image 宽高变换，`:55-67`）→ 无 `entry_text.text` 跳过（`:69-74`）→ `FreeText` 批注（默认 Arial/14pt/黑色，`:76-88`）→ `add_annotation(page_number=page_num-1)`（`:90`）→ 写盘并打印统计。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/pdf/forms.md`（技能指令点名）。出向：pypdf（PdfWriter/annotations.FreeText）、stdlib json/sys。
## 5. 数据 I/O、读写与副作用

输入 fields.json：`{form_fields:[{page_number, entry_bounding_box, entry_text?{text,font?,font_size?,font_color?}}], pages:[{page_number, pdf_width?|image_width,image_height}]}`（与 check_bounding_boxes 同族）；输出=带批注 PDF。

## 6. 分支、失败、取消与恢复

`next(p for p ...)` 页信息缺失即抛 StopIteration（静态）；其余无 try/except。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

非可填写 PDF 填表主路径；坐标契约与 extract_form_structure/check_bounding_boxes 对齐。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双坐标变换/FreeText 参数/跳过分支 | 已证实 | `:10-96` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全函数/分支 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
