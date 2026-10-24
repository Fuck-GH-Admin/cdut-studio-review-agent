---
path: apps/electron/default-skills/pdf/scripts/fill_fillable_fields.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 51c2600f3895723cac15ec3ffcd8a482e42f95d7
sha256: d140872c2e92e41b1e05370ae8d270c5b7f5ebdf55d9905f03bc974a9c708ff5
lines: 98
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/fill_fillable_fields.py

## 1. 结论与边界

填写**可填写** PDF 表单域（pypdf，`apps/electron/default-skills/pdf/scripts/fill_fillable_fields.py:11-52`）。CLI：`fill_fillable_fields.py [input pdf] [field_values.json] [output pdf]`（`:90-98`）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `fill_pdf_fields` | 11-52 | 读值 JSON 按页分组（仅带 `value` 的项，`:14-21`）；`get_field_info`（自 `extract_form_field_info` 导入，`:6`）逐一校验——字段 ID 不存在/页码不符/值非法→ERROR 输出并 `sys.exit(1)`（`:28-43`）；通过后 `PdfWriter(clone_from)` 逐页 `update_page_form_field_values(..., auto_regenerate=False)`（`:45-47`）+ `set_need_appearances_writer(True)`（`:49`）写盘 |
| `validation_error_for_field_value` | 55-71 | checkbox 限 checked/unchecked 两值、radio_group/choice 限选项值集合（错误列出合法值） |
| `monkeypatch_pydpf_method` | 74-87 | 补丁 `DictionaryObject.get_inherited`：`Opt` 为双元素列表数组时取 `r[0]`（兼容旧式选项格式）；`__main__` 先打补丁再执行（`:94`） |

## 3. 内部逻辑与关键流程

主链路：读值 JSON 按页分组（仅取带 `value` 项，`:14-21`）→ `get_field_info`（自 extract_form_field_info 导入 `:6`）+`validation_error_for_field_value`（`:55-71`）逐项校验——字段 ID 不存在/页码不符/值非法→ERROR 输出并 `sys.exit(1)` 不部分填写（`:28-43`）→ `PdfWriter(clone_from)` 逐页 `update_page_form_field_values(auto_regenerate=False)`（`:45-47`）+`set_need_appearances_writer(True)`（`:49`）→ 写盘。`monkeypatch_pydpf_method`（`:74-87`）由 `__main__` 先打补丁再执行（`:94`）。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/pdf/forms.md`（技能指令点名）。出向：pypdf（PdfWriter）、`extract_form_field_info.get_field_info`（`:6`）、stdlib json/sys。
## 5. 数据 I/O、读写与副作用

输入 field_values.json：`[{field_id, page, value?}]`（值校验形状依赖 extract_form_field_info 的输出）；输出=已填 PDF。

## 6. 分支、失败、取消与恢复

校验失败即列错退出（不部分填写）；无其他 try/except（静态）；monkeypatch 影响进程内 pypdf 行为（照实记录，函数名拼写 `pydpf` 为源码原文）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

可填写 PDF 主路径；与 extract_form_field_info 的字段契约耦合。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 校验三分支/写入/monkeypatch | 已证实 | `:11-87` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全函数/分支 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
