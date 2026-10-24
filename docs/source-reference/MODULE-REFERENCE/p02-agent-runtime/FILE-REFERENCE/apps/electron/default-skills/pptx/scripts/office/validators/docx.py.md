---
path: apps/electron/default-skills/pptx/scripts/office/validators/docx.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fec405e694790259824feebb95061f56a705621c
sha256: 0ef04ce86b2e6b6a1cb088c0276fd0bd5b770d96fdfe7a6cc73d005feb3f0345
lines: 446
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/validators/docx.py

## 1. 结论与边界

**DOCX XML 校验器**（`docx.py:1-3`）：继承 `BaseSchemaValidator`，叠加 Word 专属检查（whitespace 保留/删除与插入标记/ID 约束/批注标记/段落数比对）。含 `repair()` 修复 paraId/durableId 超限。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DOCXSchemaValidator` | 类 | `:16` | 继承 BaseSchemaValidator |
| `WORD_2006_NAMESPACE`/`W14_NAMESPACE`/`W16CID_NAMESPACE` | 常量 | `:18-20` | wml 三命名空间 |
| `ELEMENT_RELATIONSHIP_TYPES` | 常量 | `:22` | 空表（Word 元素关系类型由基类通用处理） |
| `.validate()` | 方法 | `:24` | 组合 11 项检查+段落数比对（见 §3） |
| `.validate_whitespace_preservation` | 方法 | `:66` | `w:t` 首尾空白必须 `xml:space="preserve"` |
| `.validate_deletions`/`.validate_insertions` | 方法 | `:~120-220` | 修订标记结构完整性 |
| `.validate_id_constraints`/`.validate_comment_markers` | 方法 | — | ID 约束/批注标记配对 |
| `.compare_paragraph_counts` | 方法 | `:62` 调用 | 段落数比对（只报告不计入 all_valid） |
| `.repair()` | 方法 | `:~400-442` | 修 paraId/durableId 超限（随机新值，numbering.xml 十进制其它 8 位大写 hex `:423-427`） |

`__main__` 守卫（`:445-446`）。

## 3. 内部逻辑与关键流程

`validate`（`:24-64`）：`validate_xml` 短路；10 项布尔累加（namespaces/unique_ids/file_references/content_types/xsd/whitespace_preservation/deletions/insertions/all_relationship_ids/id_constraints/comment_markers）+`compare_paragraph_counts` 附加报告（`:62`）。`validate_whitespace_preservation`（`:66-109`）：lxml 扫 `w:t`，首尾空白字符而无 preserve→逐条报错。

## 4. 调用者与调用链

- 入向：`office/validate.py:83`（.docx 分支）、`office/pack.py:87`。
- 出向：`./base`、defusedxml.minidom/lxml/zipfile。

## 5. 数据 I/O、读写与副作用

validate 只读；`repair()` **改写解包目录 XML**（durableId 重随机，`:429-437`）。

## 6. 分支、失败、取消与恢复

11 项布尔累加；repair 返回计数；单文件异常吞（`:439-440`）；无取消。

## 7. 权限与权威状态

DOCX 合规权威=XSD+修订/空白语义；repair 的 ID 重写保证 OOXML 上限合规（注释 `validate.py:11-13` 互证）。

## 8. 修改影响面

docx 打包质量门；repair 与 pack `--validate` auto-repair 流程联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 项校验/whitespace/repair 规则 | 已证实 | `:1-446` 全文 |
| XSD 具体规则 | 本批 | base.py 手册 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类+方法族+repair | §2/§3 | 16-442 | covered |
