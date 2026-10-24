---
path: apps/electron/default-skills/pdf/scripts/extract_form_structure.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f219e7d5b5e30616b2259abb924253afd0240aee
sha256: 6814e3fe8f78c2b16d766c132b5a727ff7a31b71d76a7d46bd6e40fe50bc97c5
lines: 115
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/extract_form_structure.py

## 1. 结论与边界

从**非可填写** PDF 提取表单结构（文本标签坐标/横线/复选框）供生成填写坐标（文件头 `apps/electron/default-skills/pdf/scripts/extract_form_structure.py:1-13`）。CLI：`extract_form_structure.py <input.pdf> <output.json>`（`:114-115`）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

- `extract_form_structure(pdf_path)`（`:20-88`，pdfplumber）：
  - pages：页号+宽高（`:31-35`）；
  - labels：`extract_words()` 逐词四坐标（round 1 位，`:37-46`）；
  - lines：横线阈值 |x1-x0| > 0.5×页宽（`:48-55`）；
  - checkboxes：矩形 5-15pt 见方、|宽-高|<2（`:57-69`，含中心点）；
  - row_boundaries：同页横线 y 去重排序相邻成行（`:71-86`）。
- `main`（`:91-111`）：写 JSON + 五类计数打印。

## 3. 内部逻辑与关键流程

主链路：`extract_form_structure(pdf_path)`（`:20-88`）逐页抽取 pages（`:31-35`）/labels（`:37-46`）/lines（`:48-55`）/checkboxes（`:57-69`）/row_boundaries（`:71-86`）五类 → `main`（`:91-111`）写 JSON 并打印五类计数。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/pdf/forms.md`（技能指令点名）。出向：pdfplumber、stdlib json/sys。
## 5. 数据 I/O、读写与副作用

输出 JSON：`{pages, labels, lines, checkboxes, row_boundaries}`（键见 `:21-27`）；供 fill_pdf_form_with_annotations 的 fields 构造参考。

## 6. 分支、失败、取消与恢复

无 try/except（静态）；pdfplumber 缺失即抛。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

非可填写 PDF 流程上游（配合 fill_pdf_form_with_annotations 使用）。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五类提取阈值/成行逻辑 | 已证实 | `:20-111` |
| 运行结果 | 未知 | NOT_RUN（pdfplumber 未跑） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全逻辑 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
