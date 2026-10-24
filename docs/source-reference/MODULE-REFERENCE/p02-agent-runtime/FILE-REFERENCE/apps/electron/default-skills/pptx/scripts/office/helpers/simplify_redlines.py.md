---
path: apps/electron/default-skills/pptx/scripts/office/helpers/simplify_redlines.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db963bb998d7d5a8517d8252ce82ec9ab28665bc
sha256: 560cb55978a834c505406eb18e2c61f62f998fc7a2d8e9721b9c563b42597896
lines: 197
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/helpers/simplify_redlines.py

## 1. 结论与边界

DOCX **修订简化**：合并相邻同作者 `w:ins`/`w:del`（同类型、同作者、真相邻——仅空白间隔，忽略时间戳差异，`simplify_redlines.py:1-11`）。另含**作者推断**（`infer_author`：以新增修订数差推断验证归属，多作者歧义抛 ValueError）。就地改写 `word/document.xml`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `simplify_redlines` | 函数 | `:22` | `(input_dir) -> (int, str)` |
| `get_tracked_change_authors` | 函数 | `:126` | `(doc_xml_path) -> {author: count}`（ElementTree） |
| `infer_author` | 函数 | `:172` | `(modified_dir, original_docx, default="Claude") -> str`——modified 新增=modified 原始差额（`:181-186`）；恰一作者→其名（`:191-192`）；多作者→`ValueError`（`:194-197`）；无修订→default |

内部：`_merge_tracked_changes_in`（`:47`，p/tc 容器内相邻合并）、`_is_element/_get_author`（`:75,80`，前缀容错）、`_can_merge_tracked`（`:89`，作者同+真相邻）、`_merge_tracked_content`（`:104`，整搬子节点）、`_find_elements`（`:111`）、`_get_authors_from_docx`（`:149`，直接读 zip 内 document.xml）。

## 3. 内部逻辑与关键流程

`simplify_redlines`（`:22-44`）：定位 document.xml→遍历 `p`+`tc` 容器（`:34`）→分别合并 ins/del（`:37-38`）→写回+计数。`infer_author` 语义=“modified 中比 original 多出的修订归属”（`:172-197`）。

## 4. 调用者与调用链

- 入向：`office/unpack.py:24`（`do_simplify_redlines`）；`office/pack.py` 经 `infer_author_func` 注入（`:80-88`，本批）。
- 出向：`defusedxml.minidom`、`xml.etree.ElementTree`、zipfile。

## 5. 数据 I/O、读写与副作用

读写 `word/document.xml`；读 original zip。异常→`(0,"Error: …")`（`:43-44`）。

## 6. 分支、失败、取消与恢复

文档缺/异常→错误消息；作者歧义→ValueError（pack 侧回落 'Claude' 并告警）；无取消。

## 7. 权限与权威状态

修订归属权威=`w:author` 属性；推断规则=新增计数差（多作者拒绝推断防错配，`:194-197`）。

## 8. 修改影响面

DOCX 编辑面；pack 校验作者归因（RedliningValidator.author）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 合并三条件/作者推断/歧义拒绝 | 已证实 | `:1-197` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+内部 | §2/§3 | 22-197 | covered |
