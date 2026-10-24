---
path: apps/electron/default-skills/xlsx/scripts/office/validators/pptx.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09842aa99866fe270ecfeec6f7993495e1865f2b
sha256: f937961e62a5fa0d002b8dc51a4c4e2cd8fcd59fe65853fa54edaca3fe99eccc
lines: 275
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/validators/pptx.py

## 1. 结论与边界

PowerPoint XML 的 XSD/结构校验器（docstring `:1-3`）：`PPTXSchemaValidator(BaseSchemaValidator)`，在基类 6 项检查之上追加 4 项 PPTX 专属检查（UUID 形 ID、幻灯片版式引用、讲义页引用唯一、无重复版式引用）。`__main__` 拒绝直接运行（`:274-275`）。

不做的事：不修复（repair 由基类/调用方）；不解析渲染语义；只读解包目录。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PPTXSchemaValidator` | class | `:10-271` | 继承 `BaseSchemaValidator`（`:7`） |
| `PRESENTATIONML_NAMESPACE` | const | `:12-14` | PresentationML 命名空间 |
| `ELEMENT_RELATIONSHIP_TYPES` | const | `:16-23` | 元素→关系类型映射（sldid→slide 等 6 项） |

基类提供（见 base.py 手册）：`validate_xml`/`validate_namespaces`/`validate_unique_ids`/`validate_file_references`/`validate_content_types`/`validate_against_xsd`、`xml_files`/`unpacked_dir`/`verbose`、两个关系命名空间常量。

## 3. 内部逻辑与关键流程

### 3.1 `validate()`（`:25-60`）

先 `validate_xml()`（失败即 False）；随后 9 项**全量执行**取与（不短路）：namespaces/unique_ids/uuid_ids/file_references/slide_layout_ids/content_types/against_xsd/notes_slide_references/all_relationship_ids/no_duplicate_slide_layouts。

### 3.2 PPTX 专属四项

- **`validate_uuid_ids`**（`:62-102`）：全 xml 属性名含 `id` 的值若“像 UUID”（`_looks_like_uuid`：去括号/连字符后 32 位字母数字，`:100-102`）必须匹配严格 UUID 正则（允许花括号/圆括号包裹、连字符可选，`:66-68`）；不符报“contains invalid hex characters”。
- **`validate_slide_layout_ids`**（`:104-170`）：每个 slideMaster 的 rels 里 slideLayout 关系 Id 集合；`sldLayoutId` 的 `r:id` 须在集合中；缺 rels 文件也报错；无 slideMaster 直接 PASS。
- **`validate_notes_slide_references`**（`:210-271`）：收集 slides rels 的 notesSlide 关系（target 去 `../` 归一）；同一讲义页被多张幻灯片引用 → 报错（“Each slide may optionally have its own slide file”）。
- **`validate_no_duplicate_slide_layouts`**（`:172-208`）：每张幻灯片 rels 的 slideLayout 关系恰 ≤1，多于 1 报错。

失败均打印计数+明细并 return False；verbose 时打印 PASSED。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`validate.py:22`、`pack.py:22`（pptx 分支装配）。出向：`.base.BaseSchemaValidator`、`lxml.etree`（各方法内延迟 import）、`re`。

## 5. 数据 I/O、读写与副作用

只读解包目录（glob + lxml 解析）；stdout 输出。无写/网络。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| XML 基础校验失败 | `:26-27` | 直接 False（跳过后续） |
| 任一子项失败 | `:29-60` | all_valid=False（仍跑完全部） |
| 解析异常 | `:85-88/:154-157/:246-249/:195-198` | 计入 errors |
| 空集（无 master/无 rels） | `:111-114/:218-221` | PASS |
| 取消/恢复 | 无 | 纯校验 |

## 7. 权限与权威状态

无权限分支；结构合法性即权威（失败计数+行号定位，`sourceline` 来自 lxml）。

## 8. 修改影响面

改检查项 → 影响 pptx 解包/打包门禁（validate/pack 共用）；基类契约联动 `base.py`。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill validator）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 项检查全量取与 | 已证实 | `:25-60` |
| UUID 形 ID 严格校验 | 已证实 | `:62-102` |
| 版式/讲义引用唯一性 | 已证实 | `:104-208/:210-271` |
| 空集 PASS 口径 | 已证实 | `:111-114/:218-221` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validate()` | 3.1 | `:25-60` | covered |
| `validate_uuid_ids` | 3.2 | `:62-102` | covered |
| `validate_slide_layout_ids` | 3.2 | `:104-170` | covered |
| `validate_no_duplicate_slide_layouts` | 3.2 | `:172-208` | covered |
| `validate_notes_slide_references` | 3.2 | `:210-271` | covered |
