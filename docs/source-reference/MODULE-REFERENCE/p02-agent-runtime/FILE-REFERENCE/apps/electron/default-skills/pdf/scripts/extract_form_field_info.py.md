---
path: apps/electron/default-skills/pdf/scripts/extract_form_field_info.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 64cd4703a4af80bf6abe16f4c3065d8abd55d173
sha256: bb235b36f497bbb1c7c6821cecf527bbba7213520de11219da99f7b13a38c109
lines: 122
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/extract_form_field_info.py

## 1. 结论与边界

从可填写 PDF **提取表单域信息**（类型/页码/坐标/选项）写 JSON（`apps/electron/default-skills/pdf/scripts/extract_form_field_info.py:47-115`）。CLI：`extract_form_field_info.py [input pdf] [output json]`（`:118-122`）。同目录 `fill_fillable_fields.py:6` 复用其 `get_field_info`。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `get_full_annotation_field_id` | 9-16 | 沿 `/Parent` 链拼全限定字段名（`.` 连接，倒序） |
| `make_field_dict` | 19-44 | `/FT` 映射：`/Tx`→text、`/Btn`→checkbox（`/_States_` 2 态时判 `/Off` 定 checked/unchecked，非 /Off 双态打印警告按序取值，`:27-34`）、`/Ch`→choice（选项 value/text 对，`:35-41`）、其他→`unknown (ft)` |
| `get_field_info` | 47-107 | 第一遍跳过 `/Kids` 父字段（`/Btn` 记入 possible_radio_names，`:53-58`）；第二遍按页 `/Annots` 回填 page+rect（`:63-69`）；radio group 聚合 `/AP./N` 唯一 on 值+rect（`:70-87`，KeyError 跳过）；无 page 的字段告警忽略（`:90-94`）；排序键=页+阅读顺序（-top,x0，`:96-105`） |
| `write_field_info` | 110-115 | 写 JSON indent=2 + 统计 |

## 3. 内部逻辑与关键流程

主链路：`get_field_info` 两遍扫描（`:47-107`）——第一遍跳过 `/Kids` 父字段并记 `/Btn` radio 候选（`:53-58`），第二遍按页 `/Annots` 回填 page+rect（`:63-69`）→ radio group 聚合 `/AP./N` 唯一 on 值（`:70-87`，KeyError 跳过）→ 页+阅读顺序排序（`:96-105`）→ `write_field_info` 写 JSON indent=2（`:110-115`）；字段形状由 `make_field_dict` 按 `/FT` 归一（`:19-44`）。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/pdf/forms.md`（技能指令点名）+ **`fill_fillable_fields.py:6` import `get_field_info`（同目录代码级复用，已证实）**。出向：pypdf、stdlib json/sys。
## 5. 数据 I/O、读写与副作用

输入=PDF（pypdf）；输出 JSON 数组元素：`{field_id, type, page, rect, checked_value?, unchecked_value?, choice_options?, radio_options?}`。

## 6. 分支、失败、取消与恢复

`/_States_`/`/AP` 缺失分支容错（`:26` 默认空、`:72-74` KeyError continue）；无 try 的 IO/解析失败即抛（静态）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

被 `fill_fillable_fields.py` 导入（`:6`）；输出 JSON 是 check_bounding_boxes/fill 脚本的输入契约。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全函数/radio 聚合/排序 | 已证实 | `:9-115` |
| 被 fill_fillable_fields 复用 | 已证实 | 同目录 import |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全函数/分支 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
