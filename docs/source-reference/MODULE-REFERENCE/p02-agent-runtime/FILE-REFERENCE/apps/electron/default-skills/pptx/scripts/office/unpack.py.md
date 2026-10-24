---
path: apps/electron/default-skills/pptx/scripts/office/unpack.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00152533ac0fa95109f74253ac6a475401fa6afe
sha256: 83f69cecc87910183654c06345837244402e8a99edbf3bdddc1cf72f11304b62
lines: 132
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/unpack.py

## 1. 结论与边界

Office 文件（DOCX/PPTX/XLSX）**解包器**：解 ZIP、XML 美化打印，可选合并相邻 run/简化修订（**仅 DOCX**，`unpack.py:1-14`）。副作用=写解包目录（就地改写 XML）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SMART_QUOTE_REPLACEMENTS` | 常量 | `:26` | 4 个弯引号→HTML 实体 |
| `unpack` | 函数 | `:34` | `(input_file, output_directory, merge_runs=True, simplify_redlines=True) -> (None, str)`——返回消息文本，"Error" 在消息中即失败 |
| `_pretty_print_xml` | 内部 | `:82` | defusedxml.minidom 美化（解析失败静默跳过 `:87-88`） |
| `_escape_smart_quotes` | 内部 | `:91` | 弯引号转实体（静默失败） |
| CLI | `:101-132` | | 两位置参数 + `--merge-runs`/`--simplify-redlines`（true\|false，默认 true） |

## 3. 内部逻辑与关键流程

`unpack`（`:34-79`）：存在/后缀校验（`:44-48`）→ mkdir+`ZipFile.extractall`（`:51-54`）→ 全部 `*.xml`+`*.rels` 美化（`:56-58`）→ **DOCX 专属**：simplify_redlines（`:63-65`）→ merge_runs（`:67-69`）→ 最后统一弯引号转义（`:71-72`）→ 返回统计消息。BadZipFile→"not a valid Office file"（`:76-77`）；其它异常→"Error unpacking"（`:78-79`）。CLI 末尾消息含 "Error"→exit 1（`:131-132`）。

## 4. 调用者与调用链

- 入向：pptx/docx 技能流程（Agent CLI，域外）。
- 出向：`helpers.merge_runs`/`helpers.simplify_redlines`（本批）、`defusedxml.minidom`（防 XXE 解析器）。

## 5. 数据 I/O、读写与副作用

读 Office ZIP；写解包目录并**就地改写**全部 XML/rels（美化+弯引号转义+DOCX 两整理）。

## 6. 分支、失败、取消与恢复

校验双分支、异常两分支（§3）；美化/转义单文件失败静默跳过（不中断，`:87-88,97-98`）；无取消。

## 7. 权限与权威状态

无权限分支，依据：本地文件操作；使用 defusedxml 防恶意 XML（安全边界）。

## 8. 修改影响面

解包是 pack/validate/edit 链首环；整理行为（merge_runs/simplify_redlines）影响后续编辑面。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 流程/双开关/错误语义/静默跳过 | 已证实 | `:1-132` 全文 |
| defusedxml 防护效果 | 边界 | 第三方库域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+2 内部+CLI | §2/§3 | 26-132 | covered |
