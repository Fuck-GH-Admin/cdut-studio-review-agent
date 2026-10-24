---
path: apps/electron/default-skills/pptx/scripts/office/helpers/merge_runs.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad7c25eec0d064fbd9f5624b17b60e5dd49b5903
sha256: 7c40ed838b88639c51f9ffdcfd564b568f26832b78fe44008c0e01b742669ca7
lines: 199
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/helpers/merge_runs.py

## 1. 结论与边界

DOCX **相邻 run 合并**（`merge_runs.py:1-9`）：合并 `<w:rPr>` 完全一致的相邻 `<w:r>`（段落与 `<w:ins>/<w:del>` 内都处理）；顺带删 rsid 属性与 proofErr 元素（它们阻碍合并）。就地改写 `word/document.xml`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `merge_runs` | 函数 | `:16` | `(input_dir) -> (int, str)`——返回合并数/消息；文档缺失返 `(0,"Error: …")` |
| `get_tracked_change_authors`（simplify_redlines 同族） | — | — | 本文件无；见 simplify_redlines 手册 |

内部 10 个：`_find_elements`（`:44`，localName/前缀容错）、`_get_child/_get_children`（`:59,68`）、`_is_adjacent`（`:78`，仅空白间隔算相邻）、`_remove_elements`（`:93`）、`_strip_run_rsid_attrs`（`:99`）、`_merge_runs_in`（`:108`）、`_first_child_run/_next_element_sibling/_next_sibling_run/_is_run`（`:128-156`）、`_can_merge`（`:159`，rPr toxml 相等或同缺）、`_merge_run_content`（`:170`，搬非 rPr 子元素）、`_consolidate_text`（`:178`，相邻 `<w:t>` 合并并维护 `xml:space="preserve"` `:194-197`）。

## 3. 内部逻辑与关键流程

`merge_runs`（`:16-39`）：文档定位→defusedxml 解析→去 proofErr（`:26`）→剥 rsid（`:27`）→按父容器分组 run（`:29`）→每容器贪心合并（`_merge_runs_in`：while 邻接可合并则并入+删源+计数，`:113-120`；再 `_consolidate_text`，`:122`）→写回。

## 4. 调用者与调用链

- 入向：`office/unpack.py:23`（`do_merge_runs`，DOCX 解包流程，本批）。
- 出向：`defusedxml.minidom`。

## 5. 数据 I/O、读写与副作用

读写 `word/document.xml`（就地）；异常→`(0,"Error: …")` 不抛（`:38-39`）。

## 6. 分支、失败、取消与恢复

文档缺/异常→错误消息；合并为纯整理可逆性依赖 unpack 前备份（调用方域外）；无取消。

## 7. 权限与权威状态

无权限分支，依据：本地文件整理；**文本等价不变量**=只合并同格式 run 与相邻 w:t（内容不增删）。

## 8. 修改影响面

DOCX 编辑面整理；与 simplify_redlines 顺序（unpack 先 simplify 后 merge，`unpack.py:62-69`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 合并条件/xml:space 维护/计数 | 已证实 | `:1-199` 全文 |
| defusedxml 序列化细节 | 边界 | 第三方库域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+内部 | §2/§3 | 16-199 | covered |
