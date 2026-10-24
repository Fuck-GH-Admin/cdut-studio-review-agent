---
path: apps/electron/default-skills/xlsx/scripts/office/helpers/merge_runs.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad7c25eec0d064fbd9f5624b17b60e5dd49b5903
sha256: 7c40ed838b88639c51f9ffdcfd564b568f26832b78fe44008c0e01b742669ca7
lines: 199
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/helpers/merge_runs.py

## 1. 结论与边界

DOCX 相邻同格式 run 合并（docstring `:1-9`）：合并相邻 `<w:r>`（rPr 完全相同），覆盖段落内与修订内（`<w:ins>`/`<w:del>`）的 run；同时删 run 的 rsid 属性（不影响渲染的修订元数据）与 `proofErr` 元素（阻塞合并的拼写/语法标记）。Skill 工具脚本，被 `unpack.py` DOCX 路径调用。

不做的事：不改文本内容（合并是同格式相邻文本拼接）；不处理表格/页眉等非 document.xml 部件（只读 `word/document.xml`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `merge_runs` | function | `:16-39` | `(input_dir) => (merge_count, message)`；无 document.xml → `(0, "Error: …")` |

内部：`_find_elements`（`:44-56`，按 localName/带前缀名递归找元素）；`_get_child/_get_children`（`:59-75`）；`_is_adjacent`（`:78-88`，两元素间仅空白文本/无元素视为相邻）；`_remove_elements`（`:93-96`）；`_strip_run_rsid_attrs`（`:99-103`）；`_merge_runs_in`（`:108-125`）；`_first_child_run/_next_element_sibling/_next_sibling_run/_is_run`（`:128-156`）；`_can_merge`（`:159-167`，rPr 缺失状态一致且 `toxml()` 相等）；`_merge_run_content`（`:170-175`，非 rPr 子元素搬移）；`_consolidate_text`（`:178-199`，相邻 `<w:t>` 文本拼接并按首尾空格维护 `xml:space="preserve"`）。

## 3. 内部逻辑与关键流程

`merge_runs`（`:16-39`）：

1. 读 `word/document.xml`（defusedxml.minidom，防 XXE）。
2. 先删全部 `proofErr`、再剥 run 的 rsid 属性（`:26-27`）。
3. 收集所有 run 的父容器（含 ins/del 内部，`:29`），逐容器 `_merge_runs_in`。
4. `_merge_runs_in`：从首 run 起贪心——下一元素兄弟是 run 且 `_can_merge` 则并内容删节点（计数+1），否则 `_consolidate_text` 后移下一 run（`:108-125`）。
5. `_consolidate_text`：从后往前合并相邻 `<w:t>` 文本到前一节点，维护 `xml:space`（合并结果首/尾空格则置 preserve，否则移除，`:194-197`）。
6. 写回 `toxml`；异常 → `(0, "Error: …")`。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`office/unpack.py:23`（`do_merge_runs`，DOCX 解包默认开启）。出向：`defusedxml.minidom`、`pathlib`。

## 5. 数据 I/O、读写与副作用

读写 `word/document.xml` 一文件（就地覆盖）；无网络/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| document.xml 缺失 | `:19-20` | `(0, "Error: …")` |
| 解析/写异常 | `:38-39` | `(0, "Error: …")` |
| rPr 不同/缺失状态不同 | `:163-167` | 不合并 |
| 非相邻（中间有元素/非空文本） | `:78-88` | 不合并文本 |
| 取消/恢复 | 无 | 纯函数式变换 |

## 7. 权限与权威状态

无权限分支；变换语义保守（只合并格式完全相同且相邻者；proofErr/rsid 是“不影响渲染”的元数据——docstring 口径）。

## 8. 修改影响面

改合并/文本拼接语义 → 影响 unpack 产物与后续 pack/validate 结果；`unpack.py` 调用契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill helper）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 合并仅同 rPr 相邻 run | 已证实 | `:159-167/:78-88` |
| 覆盖 ins/del 内 run | 已证实 | `:29`（父容器收集） |
| xml:space 维护 | 已证实 | `:194-197` |
| proofErr/rsid 清理 | 已证实 | `:26-27/:99-103` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `merge_runs` | 3 | `:16-39` | covered |
| 合并判定/内容搬移/文本拼接 | 3 | `:108-199` | covered |
| 工具函数 | 2 | `:44-103` | covered |
