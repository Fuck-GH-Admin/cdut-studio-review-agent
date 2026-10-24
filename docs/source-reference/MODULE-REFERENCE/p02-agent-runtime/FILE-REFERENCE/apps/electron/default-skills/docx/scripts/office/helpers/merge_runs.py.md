---
path: apps/electron/default-skills/docx/scripts/office/helpers/merge_runs.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad7c25eec0d064fbd9f5624b17b60e5dd49b5903
sha256: 7c40ed838b88639c51f9ffdcfd564b568f26832b78fe44008c0e01b742669ca7
lines: 199
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/helpers/merge_runs.py

## 1. 结论与边界

DOCX **相邻同格式 run 合并**（`apps/electron/default-skills/docx/scripts/office/helpers/merge_runs.py:1-9`）：合并相邻 `<w:r>`（rPr 相同），覆盖段落与 `<w:ins>/<w:del>` 内；另移除 run 的 rsid 属性与 `proofErr` 元素。被 `unpack.py` 调用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `merge_runs` | 函数 | `:16-39` | `(input_dir) => tuple[int, str]` | 主流程（返回合并计数） |

内部：`_find_elements`/`_get_child`/`_get_children`（`:44-75`，带命名空间后缀匹配）、`_is_adjacent`（`:78-88`，仅空白文本间隔视为相邻）、`_remove_elements`（`:93-96`）、`_strip_run_rsid_attrs`（`:99-103`）、`_merge_runs_in`（`:108-125`）、`_first_child_run`/`_next_element_sibling`/`_next_sibling_run`/`_is_run`（`:128-156`）、`_can_merge`（`:159-167`）、`_merge_run_content`（`:170-175`）、`_consolidate_text`（`:178-199`）。

## 3. 内部逻辑与关键流程

1. 读 `word/document.xml`（缺失返回 `(0, "Error: …not found")`，`:17-20`）。
2. 删 `proofErr`、剥离 run 的 rsid 属性（`:26-27`）。
3. 找所有 run 的父容器，逐一 `_merge_runs_in`（`:29-33`）。
4. `_merge_runs_in`（`:108-125`）：对每个 run，反复与下一个可合并 run 合并（`_can_merge`：双方 rPr 都无或 `toxml()` 相等，`:159-167`），`_merge_run_content` 把 source 的非 `rPr` 子元素搬到 target（`:170-175`），移除 source。
5. `_consolidate_text`（`:178-199`）：把 run 内相邻 `<w:t>` 合并为一个文本节点；合并结果首尾含空格则补 `xml:space="preserve"`，否则移除该属性（`:194-197`）。
6. 写回 `document.xml`，返回 `(count, "Merged N runs")`；异常 `(0, "Error: …")`（`:35-39`）。

## 4. 调用者与调用链

- 调用者：`unpack.py`（`do_merge_runs`，`unpack.py:23`）。
- 出向：`defusedxml.minidom`（安全 XML）。

## 5. 数据 I/O、读写与副作用

就地改写 `word/document.xml`；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| document.xml 不存在 | `:19-20` | `(0, "Error: …not found")` |
| 解析/写回异常 | `:38-39` | `(0, "Error: …")` |
| rPr 一侧有一侧无 | `:163-164` | 不合并 |
| rPr XML 不同 | `:167` | 不合并 |

## 7. 权限与权威状态

无身份校验。rsid/proofErr 属修订元数据/校对标记，移除不改渲染（`:7-8` 注释）。

## 8. 修改影响面

- `_is_adjacent` 的空白容忍影响合并粒度；`toxml()` 全串比较对属性顺序敏感。
- 与 `simplify_redlines.py`、`unpack.py` 的 XML 往返链耦合。

## 9. 测试证据

无专属测试（全树检索 `merge_runs` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 合并/清理全流程 | 已证实 | `:16-199` |
| `xml:space` 补/删逻辑 | 已证实 | `:194-197` |
| 实际渲染等价性 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `merge_runs` 主流程 | `:16-39` | covered |
| 合并判定/内容搬运 | `:159-175` | covered |
| 文本合并/`xml:space` | `:178-199` | covered |
| 清理（proofErr/rsid） | `:93-103` | covered |
