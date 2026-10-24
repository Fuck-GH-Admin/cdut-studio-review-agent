---
path: apps/electron/default-skills/xlsx/scripts/office/validators/docx.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fec405e694790259824feebb95061f56a705621c
sha256: 0ef04ce86b2e6b6a1cb088c0276fd0bd5b770d96fdfe7a6cc73d005feb3f0345
lines: 446
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/validators/docx.py

## 1. 结论与边界

Word XML 的 XSD/结构/修订校验器（docstring `:1-3`）：`DOCXSchemaValidator(BaseSchemaValidator)`，基类 6 项 + DOCX 专属 6 项（空白保留、del/ins 结构、ID 约束、批注标记、段落数对比）+ `repair()`（durableId 修复）。`__main__` 拒绝直接运行（`:445-446`）。

不做的事：不做语义校验；`compare_paragraph_counts` 只打印不判失败（`:62`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DOCXSchemaValidator` | class | `:16-442` | 继承 `BaseSchemaValidator` |
| `WORD_2006_NAMESPACE`/`W14_NAMESPACE`/`W16CID_NAMESPACE` | consts | `:18-20` | Word 2006/2010 paraId/2016 durableId 命名空间 |
| `ELEMENT_RELATIONSHIP_TYPES` | const | `:22` | 空 dict（DOCX 无元素级关系检查） |

方法：`validate()`（`:24-64`）、`validate_whitespace_preservation`（`:66-110`）、`validate_deletions`（`:112-161`）、`count_paragraphs_in_unpacked/original`（`:163-200`）、`validate_insertions`（`:202-241`）、`compare_paragraph_counts`（`:243-249`）、`_parse_id_value`（`:251-252`）、`validate_id_constraints`（`:254-296`）、`validate_comment_markers`（`:298-384`）、`repair`（`:386-389`，super+`repair_durableId`）、`repair_durableId`（`:391-442`）。

## 3. 内部逻辑与关键流程

### 3.1 `validate()`（`:24-64`）

`validate_xml()` 失败即 False；其后 10 项全量取与 + `compare_paragraph_counts()`（**只打印段落数对比不计入成败**）。

### 3.2 DOCX 专属检查

- **空白保留**（`:66-110`）：document.xml 的 `w:t` 文本首/尾空白必须 `xml:space="preserve"`。
- **del 结构**（`:112-161`）：`w:del` 内不得有 `w:t`（应为 `w:delText`）；`w:instrText` 不得在 del 内（应 `w:delInstrText`）。
- **ins 结构**（`:202-241`）：`w:ins` 内不得有无 del 祖先的 `w:delText`。
- **ID 约束**（`:254-296`）：`w14:paraId` < 0x80000000（hex）；`w16cid:durableId` < 0x7FFFFFFF（numbering.xml 按十进制、其余按十六进制，非法规格也报错）。
- **批注标记**（`:298-384`）：commentRangeStart/End 成对（孤儿各报）；标记 id 须存在于 comments.xml 的 `w:comment`（无 comments.xml 跳过引用检查；无 document.xml 整项 PASS）。

### 3.3 `repair_durableId`（`:391-442`）

全 xml 扫 `w16cid:durableId`：numbering.xml 十进制/其余十六进制解析，越界或非法 → 随机 `1..0x7FFFFFFE` 重写（numbering 十进制字符串、其余 8 位大写 hex），打印 “Repaired: …”，异常静默。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`validate.py:22`、`pack.py:22/87`（docx 分支装配）。出向：`.base.BaseSchemaValidator`、`lxml.etree`、`defusedxml.minidom`（repair）、`zipfile/tempfile/random`。

## 5. 数据 I/O、读写与副作用

只读解包目录 + 原 docx（段落计数临时解包）；**`repair()` 写回 xml 文件**（durableId 重写，随机值——非确定性修复，照实记录）；stdout 输出。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| validate_xml 失败 | `:25-26` | False（跳过后续） |
| 任一子项失败 | `:28-60` | all_valid=False（跑完全部） |
| ID/批注/空白/修订违规 | 各节 | 打印明细/False |
| 解析异常 | 多处 | 计入 errors 或静默（repair `:439-440`） |
| 取消/恢复 | 无 | 纯校验/修复 |

## 7. 权限与权威状态

无权限分支；`compare_paragraph_counts` 仅提示（"+N”口径）不判成败；durableId 修复用**随机值**（不保原身份语义——照实记录）。

## 8. 修改影响面

改检查/修复 → 影响 docx 解包/打包门禁；`base.py` 契约联动；`random` 修复影响字节确定性。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill validator）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 项检查+段落对比打印 | 已证实 | `:24-64` |
| 空白/del/ins/ID/批注语义 | 已证实 | `:66-384` |
| durableId 随机修复 | 已证实 | `:391-442` |
| 段落数不计入成败 | 已证实 | `:62` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validate()` | 3.1 | `:24-64` | covered |
| 空白/del/ins 检查 | 3.2 | `:66-241` | covered |
| ID 约束/批注标记 | 3.2 | `:254-384` | covered |
| `repair`/`repair_durableId` | 3.3 | `:386-442` | covered |
