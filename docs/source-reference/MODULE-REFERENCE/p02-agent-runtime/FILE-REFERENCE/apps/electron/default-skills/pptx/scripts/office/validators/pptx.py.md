---
path: apps/electron/default-skills/pptx/scripts/office/validators/pptx.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09842aa99866fe270ecfeec6f7993495e1865f2b
sha256: f937961e62a5fa0d002b8dc51a4c4e2cd8fcd59fe65853fa54edaca3fe99eccc
lines: 275
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/validators/pptx.py

## 1. 结论与边界

**PPTX XML 校验器**（`pptx.py:1-3`）：继承 `BaseSchemaValidator`，在基类通用校验之上叠加 PPTX 专属检查。只读校验（无 repair 覆写=基类 repair）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PPTXSchemaValidator` | 类 | `:10` | 继承 BaseSchemaValidator |
| `PRESENTATIONML_NAMESPACE` | 常量 | `:12` | pml 命名空间 |
| `ELEMENT_RELATIONSHIP_TYPES` | 常量表 | `:16` | 6 元素→关系类型（sldid→slide/sldmasterid→slidemaster/notesmasterid/sldlayoutid→slidelayout/themeid→theme/tablestyleid→tablestyles） |
| `.validate()` | 方法 | `:25` | 组合 **11 项**检查（validate_xml+10；全部执行） |
| `.validate_uuid_ids` | 方法 | `:62` | UUID 形 ID 合法 hex 校验（`_looks_like_uuid` 32 位字母数字判定 `:100-102`） |
| `.validate_slide_layout_ids` | 方法 | `:104` | slideMasters 的 layout 引用一致性 |
| `.validate_notes_slide_references` | 方法 | `:~230-271` | notesSlide 引用唯一（多 slide 引同一 notes→FAILED） |

`__main__` 守卫（`:274-275`）。

## 3. 内部逻辑与关键流程

`validate`（`:25-60`）：`validate_xml` 失败直接 False；其余 **10 项布尔累加且全部执行不短路**（namespaces/unique_ids/uuid_ids/file_references/slide_layout_ids/content_types/xsd/notes_slide_references/all_relationship_ids/no_duplicate_slide_layouts）——合计 11 项，全部来自基类+本类覆写/新增。UUID 校验（`:62-98`）：lxml 逐元素属性扫描，形似 UUID 但非法 hex→报错。

## 4. 调用者与调用链

- 入向：`office/validate.py:91`（.pptx 分支）、`office/pack.py:91`。
- 出向：`./base`（BaseSchemaValidator）、lxml。

## 5. 数据 I/O、读写与副作用

只读扫描 XML；打印校验报告（FAILED/PASSED+明细）。

## 6. 分支、失败、取消与恢复

11 项检查逐项布尔累加（仅 validate_xml 短路 False，其余全部执行，`:29-58`）；无取消。

## 7. 权限与权威状态

PPTX 结构合规权威=XSD（基类映射）+本类引用/ID 检查。

## 8. 修改影响面

pptx 打包质量门；`ELEMENT_RELATIONSHIP_TYPES` 与基类引用校验联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 项校验组合/UUID/layout/notes 检查 | 已证实 | `:1-275` 全文 |
| XSD 映射完整性 | 本批 | base.py 手册 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类+3 方法+常量 | §2/§3 | 10-271 | covered |
