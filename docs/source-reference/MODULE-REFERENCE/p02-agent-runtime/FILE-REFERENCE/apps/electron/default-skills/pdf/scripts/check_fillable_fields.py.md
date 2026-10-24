---
path: apps/electron/default-skills/pdf/scripts/check_fillable_fields.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 36dfb9513e2f54e051820b58c3cdd1f09bc6ff37
sha256: 1fe10b9980a5493c9bbec8c20630c603eaa475b45403751c08f26738736647b8
lines: 11
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/pdf/scripts/check_fillable_fields.py

## 1. 结论与边界

11 行脚本：判断 PDF 是否有可填写表单域（`apps/electron/default-skills/pdf/scripts/check_fillable_fields.py:7-11`）。CLI：`check_fillable_fields.py <pdf>`。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

模块级直接执行（无函数/无 `__main__` 守卫）：`PdfReader(sys.argv[1]).get_fields()` 真→`This PDF has fillable form fields`，假→`This PDF does not have fillable form fields; you will need to visually determine where to enter data`（`:8-11`）。

## 3. 内部逻辑与关键流程

模块级直执行（无函数、无 `__main__` 守卫）：`PdfReader(sys.argv[1]).get_fields()` 真→「This PDF has fillable form fields」/假→「This PDF does not have fillable form fields; you will need to visually determine where to enter data」（`:7-11`）。
## 4. 调用者与调用链

入向：无代码级调用方（冻结树 `apps/**`、`packages/**` 全扩展名检索零命中）；经 PDF 技能指令由 Agent 直接执行（推断）。出向：pypdf `PdfReader`、stdlib sys。
## 5. 数据 I/O、读写与副作用

输入=PDF 路径（argv[1]）；输出=单行 stdout（agent 分支决策用）。

## 6. 分支、失败、取消与恢复

无防御：argv 缺失/pypdf 未装/文件坏即抛异常（静态）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

PDF 技能流程入口判定（决定走 fill_fillable_fields 还是 extract_form_structure+annotations 路径）。

## 9. 测试证据

无专属测试（冻结树 glob `**/*test*` 中无本脚本测试，检索范围 `apps/**`、`packages/**` 全扩展名）；NOT_RUN（依赖 pypdf/pdf2image/pdfplumber 生态未跑）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双分支文案 | 已证实 | `:7-11` |
| 运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全逻辑 | §2 | covered |
| 运行 | §10 | unknown（NOT_RUN） |
