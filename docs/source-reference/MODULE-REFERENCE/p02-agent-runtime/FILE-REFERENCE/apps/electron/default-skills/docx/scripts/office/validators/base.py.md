---
path: apps/electron/default-skills/docx/scripts/office/validators/base.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db4a06a2291abf80bd9b000b6ff3b7f012e6dd2f
sha256: d6358b67252df4dbfe4fa6647423a765960c949346ef6a8c4eb8722bb1108d25
lines: 847
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/validators/base.py

## 1. 结论与边界

Office 文档**校验基类**（`apps/electron/default-skills/docx/scripts/office/validators/base.py:1-3`）：`BaseSchemaValidator` 提供 XML 良构/命名空间/唯一 ID/文件引用/关系 ID/Content_Types/XSD 校验与 `xml:space` 自动修复；DOCX/PPTX 子类复用并编排。

## 2. 导出与关键符号

`export`：`BaseSchemaValidator`（class，`:12-847`）。

**类常量**：

| 常量 | 行 | 说明 |
| --- | --- | --- |
| `IGNORED_VALIDATION_ERRORS` | `:14-17` | 2 个忽略项（`hyphenationZone`、`purl.org/dc/terms`） |
| `UNIQUE_ID_REQUIREMENTS` | `:19-35` | 15 元素的 `(id 属性, 作用域 file/global)` |
| `EXCLUDED_ID_CONTAINERS` | `:37-39` | `sectionlst` |
| `ELEMENT_RELATIONSHIP_TYPES` | `:41` | 空（子类填） |
| `SCHEMA_MAPPINGS` | `:43-…` | 路径→XSD 映射（wml/pml/sml/opc-contentTypes/coreProperties 等） |

**方法（20 个）**：`__init__`（`:94-107`，收集 `*.xml`+`*.rels`、`schemas_dir`）、`validate`（`:109-110`，抽象）、`repair`（`:112-113`）、`repair_whitespace_preservation`（`:115-142`）、`validate_xml`（`:143-169`）、`validate_namespaces`（`:170-198`）、`validate_unique_ids`（`:199-288`）、`validate_file_references`（`:289-384`）、`validate_all_relationship_ids`（`:385-468`）、`_get_expected_relationship_type`（`:469-491`）、`validate_content_types`（`:492-597`）、`validate_file_against_xsd`（`:598-635`）、`validate_against_xsd`（`:636-684`）、`_get_schema_path`（`:685-702`）、`_clean_ignorable_namespaces`（`:703-722`）、`_remove_ignorable_elements`（`:723-741`）、`_preprocess_for_mc_ignorable`（`:742-749`）、`_validate_single_file_xsd`（`:750-786`）、`_get_original_file_errors`（`:787-813`）、`_remove_template_tags_from_text_nodes`（`:814-847`）。

## 3. 内部逻辑与关键流程

- **`repair`**（`:112-142`）：`:t` 文本节点首尾含空格/制表符而缺 `xml:space="preserve"` → 补属性并打印修复行；就地写回。
- **`validate_xml`**（`:143-169`）：lxml 逐文件良构检查，错误含行号。
- **`validate_unique_ids`**（`:199-288`）：按 `UNIQUE_ID_REQUIREMENTS`（15 元素、file/global 两作用域）查重。
- **`validate_file_references`/`validate_all_relationship_ids`**（`:289-468`）：内部引用与 `rId` 关系闭合核对（`_get_expected_relationship_type` 映射）。
- **`validate_content_types`**（`:492-597`）：`[Content_Types].xml` Override/Default 覆盖性。
- **XSD 链**（`:598-786`）：`validate_against_xsd` 按 `SCHEMA_MAPPINGS` 选 XSD（`_get_schema_path`）；`_preprocess_for_mc_ignorable`/`_clean_ignorable_namespaces`/`_remove_ignorable_elements` 处理 `mc:Ignorable` 声明（避免误报）；`_get_original_file_errors` 对比原文件同类错误（基线豁免）；`_remove_template_tags_from_text_nodes` 清模板占位。
- `IGNORED_VALIDATION_ERRORS` 使 2 个已知 XSD 误报恒被忽略（`:14-17`）。

## 4. 调用者与调用链

- 子类：`DOCXSchemaValidator`（docx.py）、`PPTXSchemaValidator`（pptx.py）；`RedliningValidator` 独立不继承。
- 出向：`defusedxml.minidom`、`lxml.etree`、`re`；XSD 目录 `../schemas`（`:99`）。

## 5. 数据 I/O、读写与副作用

- 读全部 `*.xml`/`*.rels`；`repair` 就地写回。
- XSD 文件读取（schemas 目录）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无 XML 文件 | `:105-107` | 警告 |
| `validate` 未覆写 | `:109-110` | `NotImplementedError` |
| XML 不良构 | `:156-169` | FAILED 含行号 |
| `repair` 解析失败 | `:138-139` | 静默跳过该文件 |
| XSD 误报 | `:14-17` | 恒忽略 |

## 7. 权限与权威状态

无身份语义；XSD/结构即权威；`_get_original_file_errors` 的「原文件也有的错误」豁免是对比基线口径。

## 8. 修改影响面

- `SCHEMA_MAPPINGS`/XSD 文件目录是校验权威源。
- `UNIQUE_ID_REQUIREMENTS` 15 项与 OOXML 元素耦合；子类新增元素需补。
- `IGNORED_VALIDATION_ERRORS` 是已知误报白名单（改动影响敏感度）。

## 9. 测试证据

无专属测试（全树检索 `BaseSchemaValidator` 测试命中 0）；行为经 `validate.py`/`pack.py` 间接。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 方法 + 5 类常量 | 已证实 | 全文 grep 表 |
| `repair` 仅补 `xml:space` | 已证实 | `:115-142` |
| mc:Ignorable 预处理链 | 已证实 | `:703-749` |
| 原文件错误豁免 | 已证实 | `:787-813` |
| 各子项细节（引用/关系/Content_Types） | 已证实（结构） | `:289-597` 方法体 |
| XSD 实际校验结果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 常量表 | `:14-50` | covered |
| `__init__`/抽象接口 | `:94-110` | covered |
| repair | `:112-142` | covered |
| 结构校验族 | `:143-597` | covered |
| XSD 链 | `:598-847` | covered |
