---
path: apps/electron/default-skills/docx/scripts/office/validators/pptx.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09842aa99866fe270ecfeec6f7993495e1865f2b
sha256: f937961e62a5fa0d002b8dc51a4c4e2cd8fcd59fe65853fa54edaca3fe99eccc
lines: 275
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/validators/pptx.py

## 1. 结论与边界

PPTX **XSD/结构校验器**（`apps/electron/default-skills/docx/scripts/office/validators/pptx.py:1-3`）：`PPTXSchemaValidator` 继承 `BaseSchemaValidator`，编排 10 项校验。被 `validate.py`/`pack.py` 的 `.pptx` 分支使用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PPTXSchemaValidator` | class | `:10-275` | 继承 `BaseSchemaValidator`（`:7`） |

类常量：`PRESENTATIONML_NAMESPACE`（`:12-14`）、`ELEMENT_RELATIONSHIP_TYPES`（`:16-23`，6 元素→关系类型映射：sldid→slide、themeid→theme 等）。

方法：`validate`（`:25-60`）、`validate_uuid_ids`（`:62-98`）、`_looks_like_uuid`（`:100-102`）、`validate_slide_layout_ids`（`:104-…`）、以及 notes 引用/关系 ID/重复布局等校验（`:145-275`）。

## 3. 内部逻辑与关键流程

**`validate` 编排**（`:25-60`）：`validate_xml()` 失败即短路；随后 10 项全部执行取与（不短路）：`validate_namespaces`、`validate_unique_ids`、`validate_uuid_ids`、`validate_file_references`、`validate_slide_layout_ids`、`validate_content_types`、`validate_against_xsd`、`validate_notes_slide_references`、`validate_all_relationship_ids`、`validate_no_duplicate_slide_layouts`。

**`validate_uuid_ids`**（`:62-98`）：全 XML 的 `*id` 属性——`_looks_like_uuid`（32 位字母数字，`:100-102`）却不符合 UUID 十六进制正则（`:66-68`）→ 报错（含 sourceline）。

**`validate_slide_layout_ids`**（`:104 起`）：slideMaster 的 `sldLayoutId` 的 `r:id` 必须在 master `.rels` 的 slideLayout 关系集合内；缺 rels 报错。

## 4. 调用者与调用链

- 调用者：`validate.py`（`.pptx` 分支，`:89-92`）、`pack.py`（`:90-91`）。
- 出向：`base.BaseSchemaValidator`（本批）、`lxml.etree`、`re`。

## 5. 数据 I/O、读写与副作用

只读校验（`repair` 继承 base）；`lxml` 解析 XML；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 基础 XML 校验失败 | `:26-27` | 短路 False |
| 无 slideMasters | `:111-114` | PASS（verbose 提示） |
| 缺 master rels | `:122-127` | 报错继续 |
| 任一子项失败 | `:29-60` | `all_valid=False`（全项跑完） |

## 7. 权限与权威状态

无身份语义；XSD/结构即权威。

## 8. 修改影响面

- `ELEMENT_RELATIONSHIP_TYPES` 与 PPTX 关系类型耦合。
- 10 项校验名是 base/子类合同；`validate.py` 依赖 `repair()/validate()` 接口。

## 9. 测试证据

无专属测试（全树检索 `PPTXSchemaValidator` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 项编排、不短路取与 | 已证实 | `:25-60` |
| UUID 形校验规则 | 已证实 | `:62-102` |
| 布局 r:id 与 rels 集合核对 | 已证实 | `:104-145` |
| base 各项（XSD/命名空间/唯一 ID）实现 | 未知 | 见 base.py 手册 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `validate` 编排 | `:25-60` | covered |
| UUID 校验 | `:62-102` | covered |
| 布局/关系校验 | `:104-275` | covered |
| 继承面 | `:7` | covered |
