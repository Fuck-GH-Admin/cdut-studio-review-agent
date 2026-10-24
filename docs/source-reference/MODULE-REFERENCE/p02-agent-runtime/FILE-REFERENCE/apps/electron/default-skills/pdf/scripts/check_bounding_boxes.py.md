---
path: apps/electron/default-skills/pdf/scripts/check_bounding_boxes.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2cc5e348f359b7aa7179e6a26772dacfdbbeba53
sha256: 0ced522402dd7b3c82a0be9518cf4e485fa9cc0467d7beab6ddb04cb36fcc3e1
lines: 65
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/check_bounding_boxes.py

## 1. 结论与边界

PDF 表单**边界框校验**（`apps/electron/default-skills/pdf/scripts/check_bounding_boxes.py:15-56`）：读 fields.json，检查 label/entry 框相交与 entry 框高度不足。CLI：`check_bounding_boxes.py [fields.json]`（`:58-65`，参数个数不对 exit 1）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

- `RectAndField` dataclass（`:8-12`）：rect/rect_type(label|entry)/field。
- `get_bounding_box_messages(fields_json_stream) -> list[str]`（`:15-56`）：每字段展开 label+entry 两框（`:26-28`）；O(n²) 两两相交检测（`rects_intersect` `:20-23`，同页且相交→FAILURE，自框 label-vs-entry 与跨框分别措辞，`:36-39`）；entry 框高 < font_size（默认 14，`:45`）→FAILURE（`:43-49`）；messages ≥20 提前中止（`:40-42/:50-52`）；无错输出 `SUCCESS: All bounding boxes are valid`（`:55`）。
- `__main__`（`:58-65`）：读文件→逐行 print。

## 3. 内部逻辑与关键流程

主链路：`__main__` 读 fields.json 逐行打印（`:58-65`）→ `get_bounding_box_messages` 每字段展开 label/entry 双框（`:26-28`）→ `rects_intersect` O(n²) 相交检测（`:20-23`，自框与跨框分别措辞 `:36-39`）→ entry 框高 < font_size（默认 14）判 FAILURE（`:43-49`）→ messages 达 20 条提前中止（`:40-42/:50-52`）→ 无错输出 `SUCCESS: All bounding boxes are valid`（`:55`）。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/pdf/forms.md`（PDF 技能指令文档点名调用，冻结树 grep 证据）。出向：stdlib json/sys；与 extract_form_field_info（产出 fields.json）/create_validation_image 配套（§8）。
## 5. 数据 I/O、读写与副作用

输入 fields.json：`{form_fields: [{description, page_number, label_bounding_box, entry_bounding_box, entry_text?{font_size}}]}`；输出=消息列表（含 FAILURE/SUCCESS 前缀，供 agent 读取修复）。

## 6. 分支、失败、取消与恢复

无 try/except：JSON/键缺失即抛 traceback（静态）；20 条上限防刷屏。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

PDF 技能校验链一环（与 extract_form_field_info/create_validation_image 配套）；措辞被 agent 消费。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全逻辑/相交判定/20 条中止 | 已证实 | `:8-65` |
| 运行结果 | 未知 | NOT_RUN（依赖 pypdf 生态未跑） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全函数/分支 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
