---
path: apps/electron/default-skills/pdf/scripts/convert_pdf_to_images.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7939cef56c1220dd9dd0d04ec9594b2fe089ee74
sha256: 7f58e292a67e18a8ff000d30bad2469389546731f7e8a698cc1d0aed001ea15d
lines: 33
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/convert_pdf_to_images.py

## 1. 结论与边界

PDF→PNG 逐页转换（`apps/electron/default-skills/pdf/scripts/convert_pdf_to_images.py:9-24`）。CLI：`convert_pdf_to_images.py [input pdf] [output directory]`（`:27-33`）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

- `convert(pdf_path, output_dir, max_dim=1000)`（`:9-24`）：`pdf2image.convert_from_path(dpi=200)`（`:10`）；超 `max_dim` 边按比例缩到 1000 内（`:14-18`）；存 `page_<N>.png`（1 起）并 print 尺寸（`:20-22`）；末行统计页数（`:24`）。

## 3. 内部逻辑与关键流程

主链路：`convert(pdf_path, output_dir, max_dim=1000)`（`:9-24`）→ `pdf2image.convert_from_path(dpi=200)`（`:10`）→ 超 max_dim 边等比缩入 1000 内（`:14-18`）→ 存 `page_<N>.png`（1 起）并 print 尺寸（`:20-22`）→ 末行打印总页数（`:24`）。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/pdf/forms.md`（技能指令点名）。出向：pdf2image（poppler 依赖）。
## 5. 数据 I/O、读写与副作用

输入=PDF+输出目录（需已存在——无 mkdir，静态）；输出=逐页 PNG。

## 6. 分支、失败、取消与恢复

无 try/except：pdf2image/poppler 缺失即抛（静态）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

PDF 技能视觉校验链上游产物（供 create_validation_image 叠框）。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 缩放/命名/统计逻辑 | 已证实 | `:9-24` |
| 运行结果 | 未知 | NOT_RUN（poppler 依赖未跑） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全逻辑 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
