---
path: apps/electron/default-skills/xlsx/scripts/office/helpers/simplify_redlines.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db963bb998d7d5a8517d8252ce82ec9ab28665bc
sha256: 560cb55978a834c505406eb18e2c61f62f998fc7a2d8e9721b9c563b42597896
lines: 197
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/helpers/simplify_redlines.py

## 1. 结论与边界

DOCX 修订简化（docstring `:1-11`）：合并相邻同作者 `<w:ins>`/`<w:del>`，减少修订包裹层，便于重度修订文档处理。规则：只并同类型（ins↔ins、del↔del）、只并同作者（忽略时间戳差异）、只并真相邻（中间仅空白）。Skill helper，被 `unpack.py` DOCX 路径调用；另提供作者推断（供 `pack.py` 的 RedliningValidator）。

不做的事：不并跨作者/跨类型；不改修订内容本身。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WORD_NS` | const | `:19` | WordprocessingML 命名空间 |
| `simplify_redlines` | function | `:22-44` | `(input_dir) => (merge_count, message)` |
| `get_tracked_change_authors` | function | `:126-146` | `(doc_xml_path) => dict[author, count]`（ins+del 计数） |
| `infer_author` | function | `:172-197` | `(modified_dir, original_docx, default="Claude") => str`：取“新增修订量>0”的唯一作者；多作者 → **raise ValueError**；无新增/无修订 → default |

内部：`_merge_tracked_changes_in`（`:47-72`）、`_is_element`（`:75-77`）、`_get_author`（`:80-86`，`w:author` 或任意前缀 author 属性）、`_can_merge_tracked`（`:89-101`，同作者+兄弟间仅空白）、`_merge_tracked_content`（`:104-108`，子节点整体搬移）、`_find_elements`（`:111-123`）、`_get_authors_from_docx`（`:149-169`，直接读包内 document.xml）。

## 3. 内部逻辑与关键流程

### 3.1 `simplify_redlines`（`:22-44`）

defusedxml 读 `word/document.xml`；容器 = 全部 `p` + `tc`（`:34`——ins/del 只在段落/单元格直属子级合并）；每容器先 ins 后 del 各扫一遍；写回；异常 `(0, "Error: …")`。

### 3.2 合并（`:47-108`）

收集容器直属同类型子元素，双指针贪心：`_can_merge_tracked`（同作者 + 元素间仅空白/无元素）→ 搬内容删节点。

### 3.3 `infer_author`（`:172-197`）

修改稿作者计数为空 → default；与原件（zip 内 document.xml）计数相减，`diff>0` 记新增；恰一个 → 返回；多个 → `ValueError("Multiple authors added new changes: …")`（pack.py 接到 ValueError 警告后用默认 "Claude"）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`office/unpack.py:24`（`do_simplify_redlines`）；`pack.py` 的 `infer_author_func` 候选（`infer_author`，同构签名 `(unpacked_dir, original_file)`）。出向：`defusedxml.minidom`、`xml.etree.ElementTree`（作者统计）、`zipfile`、`pathlib`。

## 5. 数据 I/O、读写与副作用

读写 `word/document.xml`（就地）；`infer_author` 只读（修改稿 + 原 docx 包）。无网络/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| document.xml 缺失/异常 | `:25-26/:43-44` | 错误消息返回 |
| 作者不同/非相邻 | `:89-101` | 不合并 |
| infer：无修订/无新增 | `:176-177/:188-189` | default |
| infer：多作者新增 | `:194-197` | ValueError |
| 取消/恢复 | 无 | 纯变换 |

## 7. 权限与权威状态

无权限分支；作者身份以 `w:author` 属性为准（不验证作者真实性——修订元数据）；`infer_author` 多义时 fail-loud（抛错交调用方处置）。

## 8. 修改影响面

改合并规则 → 影响 unpack 产物修订结构；`infer_author` 影响 pack 的 RedliningValidator 作者过滤。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill helper）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三规则（同型/同作者/相邻） | 已证实 | `:89-101`、docstring |
| 仅 p/tc 直属子级合并 | 已证实 | `:34/:50-54` |
| infer 多义 fail-loud | 已证实 | `:194-197` |
| 作者仅按属性不验证 | 已证实 | `:80-86` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `simplify_redlines` | 3.1 | `:22-44` | covered |
| 合并族 | 3.2 | `:47-108` | covered |
| `get_tracked_change_authors`/`infer_author` | 3.3 | `:126-197` | covered |
