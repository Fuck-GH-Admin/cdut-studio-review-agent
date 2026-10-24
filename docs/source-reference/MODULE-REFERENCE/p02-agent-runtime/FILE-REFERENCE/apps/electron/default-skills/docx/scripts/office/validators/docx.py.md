---
path: apps/electron/default-skills/docx/scripts/office/validators/docx.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fec405e694790259824feebb95061f56a705621c
sha256: 0ef04ce86b2e6b6a1cb088c0276fd0bd5b770d96fdfe7a6cc73d005feb3f0345
lines: 446
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/validators/docx.py

## 1. 结论与边界

DOCX **XSD/结构/修订一致性校验器**（`apps/electron/default-skills/docx/scripts/office/validators/docx.py:16`）：`DOCXSchemaValidator` 继承 `BaseSchemaValidator`，编排 11 项校验 + 段落数对比 + 2 类修复（`xml:space` 继承 + `repair_durableId`）。被 `validate.py`/`pack.py` 的 `.docx` 分支使用。

## 2. 导出与关键符号

`export`：`DOCXSchemaValidator`（class，`:16-446`）。

| 方法 | 行 | 说明 |
| --- | --- | --- |
| `validate` | `:24-64` | 编排（见第 3 节） |
| `validate_whitespace_preservation` | `:66-111` | `:t` 空白与 `xml:space` 一致性 |
| `validate_deletions` | `:112-162` | `w:del` 结构（`delText` 等） |
| `count_paragraphs_in_unpacked`/`_in_original` | `:163-201` | 段落数统计（原 ZIP 对比） |
| `validate_insertions` | `:202-242` | `w:ins` 结构 |
| `compare_paragraph_counts` | `:243-250` | 段落数对比（**信息性**，不计入 all_valid） |
| `_parse_id_value` | `:251-253` | 十六进制 ID 解析 |
| `validate_id_constraints` | `:254-297` | paraId/durableId OOXML 上限 |
| `validate_comment_markers` | `:298-385` | 批注标记成对/`w:p` 直接子元素约定 |
| `repair` | `:386-389` | 覆写：`super().repair()` + `repair_durableId` |
| `repair_durableId` | `:391-446` | 超限 ID 自动修复 |

类常量 `ELEMENT_RELATIONSHIP_TYPES = {}`（`:22`）。

## 3. 内部逻辑与关键流程

**`validate` 编排**（`:24-64`）：`validate_xml` 短路；11 项全跑取与——`validate_namespaces`、`validate_unique_ids`、`validate_file_references`、`validate_content_types`、`validate_against_xsd`、`validate_whitespace_preservation`、`validate_deletions`、`validate_insertions`、`validate_all_relationship_ids`、`validate_id_constraints`、`validate_comment_markers`；最后 `compare_paragraph_counts()`（仅打印，不影响结果）。

**`repair`**（`:386-446`）：`super().repair()`（`xml:space` 补齐）+ `repair_durableId`（paraId/durableId 超 OOXML 上限的截断/重排修复，`:391-446`）——与 `validate.py --auto-repair` 文档承诺（`:11-13`）一致。

## 4. 调用者与调用链

- 调用者：`validate.py`（`.docx` 分支，`:81-88`）、`pack.py`（`:86-89`）；`RedliningValidator` 并联。
- 出向：`base.BaseSchemaValidator`（本批）。

## 5. 数据 I/O、读写与副作用

只读校验；`repair` 就地写回 XML；`count_paragraphs_in_original` 读原 DOCX ZIP。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 基础 XML 失败 | `:25-26` | 短路 False |
| 任一子项失败 | `:28-62` | `all_valid=False`（全项跑完） |
| 段落数不一致 | `:243-250` | 仅打印（不置 False） |
| 无原文件 | `:179-201` | 统计跳过 |

## 7. 权限与权威状态

修订结构（del/ins/批注标记）是 OOXML 权威约定；`validate_comment_markers` 强化 `comment.py` 的标记约定（标记必须 `w:p` 直接子元素）。

## 8. 修改影响面

- 11 项校验名与 `validate.py`/`pack.py` 的 `repair()/validate()` 合同。
- `repair_durableId` 与 `comment.py` 的 `_generate_hex_id`（`:68-69`，`0x7FFFFFFE` 上限）配套。
- 段落数对比口径影响 QA 判读（信息性输出）。

## 9. 测试证据

无专属测试（全树检索 `DOCXSchemaValidator` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 方法、11 项编排 | 已证实 | `:24-64` |
| 段落数对比信息性 | 已证实 | `:243-250` |
| repair 含 durableId 修复 | 已证实 | `:386-446` |
| 批注标记约定校验 | 已证实 | `:298-385` |
| XSD 实际结果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `validate` 编排 | `:24-64` | covered |
| 修订/空白校验 | `:66-242` | covered |
| 段落/ID/批注 | `:243-385` | covered |
| repair 族 | `:386-446` | covered |
