---
path: apps/electron/default-skills/docx/scripts/office/helpers/simplify_redlines.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db963bb998d7d5a8517d8252ce82ec9ab28665bc
sha256: 560cb55978a834c505406eb18e2c61f62f998fc7a2d8e9721b9c563b42597896
lines: 197
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/helpers/simplify_redlines.py

## 1. 结论与边界

DOCX **修订简化**（`apps/electron/default-skills/docx/scripts/office/helpers/simplify_redlines.py:1-11`）：合并同作者相邻 `<w:ins>`/`<w:del>` 包装（减少修订包装数）；规则：同类型、同作者（忽略时间戳）、真相邻（仅空白间隔）。另提供**作者推断**（`infer_author`，供 `pack.py` 校验用）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `simplify_redlines` | 函数 | `:22-44` | `(input_dir) => tuple[int, str]` | 合并主流程 |
| `get_tracked_change_authors` | 函数 | `:126-146` | `(doc_xml_path) => dict[str,int]` | 统计 ins/del 作者计数 |
| `infer_author` | 函数 | `:172-197` | `(modified_dir, original_docx, default='Claude') => str` | 差量推断新增作者 |

内部：`_merge_tracked_changes_in`（`:47-72`）、`_is_element`（`:75-77`）、`_get_author`（`:80-86`）、`_can_merge_tracked`（`:89-101`）、`_merge_tracked_content`（`:104-108`）、`_find_elements`（`:111-123`）、`_get_authors_from_docx`（`:149-169`）。

## 3. 内部逻辑与关键流程

- **合并**（`:22-44`）：容器 = `p` + `tc`（段落/单元格，`:34`）；每容器内分别合并 `ins` 与 `del`（`:37-38`）；写回并返回计数。
- **`_merge_tracked_changes_in`**（`:47-72`）：扫描容器直属同类型子元素，相邻可合并则把 source 子节点全搬到 target（`:104-108`）并移除 source。
- **`_can_merge_tracked`**（`:89-101`）：作者相同（`_get_author` 兼容命名空间，`:80-86`）且两者之间无元素、无非空白文本。
- **`infer_author`**（`:172-197`）：改后 XML 作者计数 − 原 DOCX 作者计数（`_get_authors_from_docx` 直接读 ZIP 内 `word/document.xml`）→ 新增改动者；0 新增或无作者→`default`（'Claude'）；恰 1 个→该作者；**多个→`ValueError`**（无法判定，`:194-196`）。

## 4. 调用者与调用链

- 调用者：`unpack.py`（`do_simplify_redlines`）；`infer_author` 供 `pack.py` 的 `infer_author_func`。
- 出向：`defusedxml.minidom`（合并路径）、`xml.etree.ElementTree`（作者统计路径）、`zipfile`。

## 5. 数据 I/O、读写与副作用

就地改写 `word/document.xml`；读原 DOCX ZIP；无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| document.xml 不存在 | `:25-26` | `(0, "Error: …not found")` |
| 解析/写回异常 | `:43-44` | `(0, "Error: …")` |
| 作者不同/不相邻 | `:90-98` | 不合并 |
| `infer_author` 多新增作者 | `:194-196` | `ValueError`（pack 回落默认并警告） |
| ZIP/XML 坏 | `:133-134`、`:168-169` | 返回 `{}` |

## 7. 权限与权威状态

作者归属是修订权威元数据；`infer_author` 的差量口径决定 RedliningValidator 的校验作者（默认 `'Claude'`）。

## 8. 修改影响面

- 合并规则（同作者/相邻）改动影响修订保真；`w:author` 属性命名空间兼容逻辑（`:80-86`）。
- `infer_author` 多作者抛错语义与 `pack.py` 警告回落链路耦合（`pack.py:83-84`）。

## 9. 测试证据

无专属测试（全树检索 `simplify_redlines` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、合并/推断全流程 | 已证实 | `:22-197` |
| 多新增作者抛 ValueError | 已证实 | `:194-196` |
| 作者统计用 ET、合并用 minidom（双解析路径） | 已证实 | `:126-146` vs `:22-44` |
| 修订保真实际效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `simplify_redlines` | `:22-44` | covered |
| 合并判定/搬运 | `:47-108` | covered |
| 作者统计 | `:126-169` | covered |
| `infer_author` | `:172-197` | covered |
