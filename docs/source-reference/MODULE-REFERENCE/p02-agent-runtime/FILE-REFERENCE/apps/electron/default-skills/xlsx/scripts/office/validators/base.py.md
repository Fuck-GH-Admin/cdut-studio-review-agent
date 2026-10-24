---
path: apps/electron/default-skills/xlsx/scripts/office/validators/base.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db4a06a2291abf80bd9b000b6ff3b7f012e6dd2f
sha256: d6358b67252df4dbfe4fa6647423a765960c949346ef6a8c4eb8722bb1108d25
lines: 847
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/validators/base.py

## 1. 结论与边界

文档校验基类（docstring `:1-3`）：`BaseSchemaValidator` 提供 XML/命名空间/ID 唯一/文件引用/关系 ID/Content_Types/XSD 七项公共校验与 `repair()`（空白保留修复）。XSD 校验是**基线差分口径**——只报“相对原件新增的错误”，原件既有错误被容忍（`IGNORED_VALIDATION_ERRORS` 再过滤两条模式）。`__main__` 拒绝直接运行（`:846-847`）。

不做的事：`validate()` 抽象（子类实现，`:109-110`）；不理解渲染语义。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BaseSchemaValidator` | class | `:12-843` | `(unpacked_dir, original_file=None, verbose=False)` |

类常量：`IGNORED_VALIDATION_ERRORS`（`:14-17`，hyphenationZone/purl.org 两模式）；`UNIQUE_ID_REQUIREMENTS`（`:19-35`，15 类元素→(属性, file/global 范围)）；`EXCLUDED_ID_CONTAINERS`（`:37-39`，sectionlst）；`ELEMENT_RELATIONSHIP_TYPES`（`:41`，空，子类覆写）；`SCHEMA_MAPPINGS`（`:43-59`，15 条部件→XSD 路径）；`MC/XML/PACKAGE_RELATIONSHIPS/OFFICE_RELATIONSHIPS/CONTENT_TYPES` 命名空间（`:61-72`）；`MAIN_CONTENT_FOLDERS={word,ppt,xl}`（`:74`）；`OOXML_NAMESPACES`（`:76-92`，15 个标准命名空间）。

方法：`__init__`（`:94-107`，schemas_dir=`../schemas`、`xml_files`=rglob `*.xml`+`*.rels`）；`validate`（抽象）；`repair`→`repair_whitespace_preservation`（`:112-141`）；`validate_xml`（`:143-168`）；`validate_namespaces`（`:170-197`）；`validate_unique_ids`（`:199-287`）；`validate_file_references`（`:289-383`）；`validate_all_relationship_ids`（`:385-467`）；`_get_expected_relationship_type`（`:469-490`）；`validate_content_types`（`:492-596`）；`validate_file_against_xsd`（`:598-634`）；`validate_against_xsd`（`:636-683`）；`_get_schema_path`（`:685-701`）；`_clean_ignorable_namespaces`/`_remove_ignorable_elements`（`:703-740`）；`_preprocess_for_mc_ignorable`（`:742-748`）；`_validate_single_file_xsd`（`:750-785`）；`_get_original_file_errors`（`:787-812`）；`_remove_template_tags_from_text_nodes`（`:814-843`）。

## 3. 内部逻辑与关键流程

### 3.1 修复（`:112-141`）

`repair()` = `repair_whitespace_preservation`：`:t` 末/首含空格/tab 且缺 `xml:space="preserve"` → 补属性、打印 Repaired、写回；异常静默。

### 3.2 结构校验

- **validate_xml**：lxml 解析全 xml/rels，语法错误带行号。
- **validate_namespaces**：`mc:Ignorable` 列出的前缀必须已声明。
- **validate_unique_ids**：先移除 `mc:AlternateContent`（`:208-212`）；`UNIQUE_ID_REQUIREMENTS` 15 类元素的 id 按 file/global 范围查重（`EXCLUDED_ID_CONTAINERS` 内跳过）。
- **validate_file_references**：rels 的 Target（跳过 http/mailto；`/` 开头按包根、`.rels` 按根、其余按上级目录解析）必须存在；**所有文件必须被引用**（孤儿文件报错）；失败提示 “CRITICAL: …appear corrupt”。
- **validate_all_relationship_ids**：非 rels 文件的 `r:id/embed/link` 必须存在于同名 rels（重复 rid 也报）；`ELEMENT_RELATIONSHIP_TYPES` 非空时校验关系类型匹配（`_get_expected_relationship_type`：显式映射或按元素名 `*id`/`*reference` 派生）。
- **validate_content_types**：`[Content_Types].xml` 必须存在；declarable_roots（sld/document/workbook 等 8 类根）须有 Override；媒体扩展（8 种图片）须有 Default 声明。

### 3.3 XSD 基线差分（`:598-785`）

`_get_schema_path` 按文件名/`.rels`/charts/theme/主内容目录映射 XSD（无映射→跳过计数）。`_validate_single_file_xsd` 预处理：删非 `:t` 文本中的 `{{…}}` 模板标签（`:814-843`，带 warning）、删 `mc:Ignorable` 属性、主内容目录再清除非 OOXML 命名空间的属性/元素（`:703-748`）；然后 schema.validate。`validate_file_against_xsd`：**当前错误 − 原件同部件错误 = 新增错误**（再滤 `IGNORED_VALIDATION_ERRORS`）——原件既有错误不算失败（`:611-634`）；`_get_original_file_errors` 临时解原件包取基线（原件缺该部件→空集，`:806-807`）。`validate_against_xsd` 汇总 valid/skipped/original-ignored/new-error 计数。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`validators.docx`/`validators.pptx` 继承；经 `validate.py`/`pack.py` 间接执行。出向：`lxml.etree`、`defusedxml.minidom`（repair）、`zipfile/tempfile`（基线）、`re`。

## 5. 数据 I/O、读写与副作用

只读解包目录与原件 zip（`_get_original_file_errors` 解原件包用 `extractall`，同 unpack.py 无成员路径校验（zip-slip 风险），原件通常受信）；`repair()` 写回 xml；stdout 输出。无网络。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无 XML 文件 | `:106-107` | 警告 |
| 各子项违规 | 各节 | 计数+明细/False |
| 无 XSD 映射 | `:685-701/:752-753` | 跳过（skipped 计数） |
| 原件无对应部件 | `:806-807` | 基线空集（全部错误算新增） |
| 解析/校验异常 | 多处 | 计入 errors/False |
| 取消/恢复 | 无 | 纯校验 |

## 7. 权限与权威状态

- **基线差分是核心口径**：XSD 判定“不新增错误”而非“绝对合规”——原件错误被容忍（照实记录）。
- 模板标签 `{{…}}` 校验前剥除（skill 模板占位不判错）；Ignorable/非 OOXML 命名空间清理后再验。

## 8. 修改影响面

改常量/检查 → 影响 docx/pptx（及未来的 xlsx）全部校验；SCHEMA_MAPPINGS 依赖 `../schemas` 目录（不随本批 13 文件，未读）。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill validator 基类）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| XSD 基线差分口径 | 已证实 | `:598-634/:787-812` |
| 模板标签剥除/命名空间清理 | 已证实 | `:703-748/:814-843` |
| ID 唯一/引用完整/Content_Types | 已证实 | `:199-596` |
| repair 空白保留 | 已证实 | `:112-141` |
| schemas 目录内容 | 未知 | 不在本批范围 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类常量/`__init__` | 2 | `:14-107` | covered |
| `repair` 族 | 3.1 | `:112-141` | covered |
| 结构五项 | 3.2 | `:143-596` | covered |
| XSD 差分族 | 3.3 | `:598-812` | covered |
| 模板/清理辅助 | 3.3 | `:703-748/:814-843` | covered |
