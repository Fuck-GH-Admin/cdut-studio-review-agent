---
path: apps/electron/default-skills/pptx/scripts/office/validators/base.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db4a06a2291abf80bd9b000b6ff3b7f012e6dd2f
sha256: d6358b67252df4dbfe4fa6647423a765960c949346ef6a8c4eb8722bb1108d25
lines: 847
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/validators/base.py

## 1. 结论与边界

**校验器基类**（`base.py:1-3`）：DOCX/PPTX 共用的通用校验逻辑（XML 可解析/命名空间/唯一 ID/文件引用/Content_Types/XSD/关系 ID/模板标签清洗）。含全部 XSD 映射与 ID 唯一性规则表。只读为主；`repair()` 留给子类。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BaseSchemaValidator` | 类 | `:12` | 基类 |
| `IGNORED_VALIDATION_ERRORS` | 常量 | `:14` | 2 项白名单（hyphenationZone/purl.org/dc/terms） |
| `UNIQUE_ID_REQUIREMENTS` | 常量表 | `:19` | 15 元素→(属性, 范围 file/global)（comment/bookmark/sldid/sldmasterid/sldlayoutid…；`cm→authorid` `:28`） |
| `EXCLUDED_ID_CONTAINERS` | 常量 | `:37` | sectionlst 不计 ID |
| `SCHEMA_MAPPINGS` | 常量表 | `:43` | **15** 后缀→XSD 路径（机械计数 15 键；ISO-IEC29500-4_2016 族+ecma+微软扩展） |
| 命名空间常量 | `:61-72` | | MC/XML/包关系/Office 关系/Content_Types |
| `OOXML_NAMESPACES` | 常量 | `:76` | 15 个合法 OOXML 命名空间 |
| `validate_xml/validate_namespaces/validate_unique_ids/validate_file_references/validate_content_types/validate_against_xsd/validate_all_relationship_ids` | 方法 | — | 通用校验族（子类 validate 组合调用） |
| `repair()` | 方法 | — | 基类默认实现（子类覆写） |
| 模板标签清洗 | 内部 | `:~800-843` | `{{…}}` 模板标签检测/清除（跳过 `:t` 文本元素 `:836-838`，防吞正文） |

`__main__` 守卫（`:846-847`）。

## 3. 内部逻辑与关键流程

- 唯一 ID 校验：按 `UNIQUE_ID_REQUIREMENTS` 的 file/global 两范围查重（file=单文件内、global=跨文件）。
- XSD 校验：按 `SCHEMA_MAPPINGS` 定位 schema 验证；**差集门**——`validate_file_against_xsd`/`validate_against_xsd` 与 original 同路径校验误差集求差，**只报 NEW errors**（无 `--original` 时全部错误计为新增）；`IGNORED_VALIDATION_ERRORS` 过滤已知无害项。
- 文件引用/关系 ID：`ELEMENT_RELATIONSHIP_TYPES`（子类填）+包关系命名空间解析 `.rels` 目标存在性。
- 模板标签清洗（`:824-843`）：正则找 `{{…}}`→告警+删除（对非 `:t` 元素的 text/tail；`:t` 跳过保正文）。

## 4. 调用者与调用链

- 入向：`docx.py:13`/`pptx.py:7`（继承，本批）。
- 出向：defusedxml.minidom/lxml/re/pathlib。

## 5. 数据 I/O、读写与副作用

validate 族只读+打印报告；模板清洗为内存操作（调用方决定写回）。

## 6. 分支、失败、取消与恢复

各方法独立返回 bool/计数；XML 解析异常逐文件记录不中断；无取消。

## 7. 权限与权威状态

合规权威=ISO-IEC 29500 XSD 映射+OOXML 命名空间白名单+ID 唯一性规则（三张常量表为唯一事实源）。

## 8. 修改影响面

DOCX/PPTX 两子类全部校验能力的底座；XSD 映射/忽略名单变更影响两格式质量门。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三张规则表/校验族/模板清洗（`:t` 保护） | 已证实 | `:1-847` 全文（分段逐行） |
| XSD 文件本体（ISO-IEC29500-4_2016 等） | 边界 | 资产文件域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类+规则表+校验族（SCHEMA_MAPPINGS 15 键） | §2/§3 | 12-843 | covered |
