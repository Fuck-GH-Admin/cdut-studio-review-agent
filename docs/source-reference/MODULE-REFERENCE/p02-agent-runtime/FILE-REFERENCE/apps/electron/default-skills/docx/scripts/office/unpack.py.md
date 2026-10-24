---
path: apps/electron/default-skills/docx/scripts/office/unpack.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00152533ac0fa95109f74253ac6a475401fa6afe
sha256: 83f69cecc87910183654c06345837244402e8a99edbf3bdddc1cf72f11304b62
lines: 132
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/unpack.py

## 1. 结论与边界

Office 文件**解包工具**（`apps/electron/default-skills/docx/scripts/office/unpack.py:1-14`）：解 ZIP、pretty-print XML、可选合并相邻同格式 run/同作者修订（仅 DOCX）、转义弯引号。CLI（`:101-132`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `unpack` | 函数 | `:34-79` | `(input_file, output_directory, merge_runs=True, simplify_redlines=True) => tuple[None, str]` | 主流程 |
| `SMART_QUOTE_REPLACEMENTS` | 常量 | `:26-31` | 4 弯引号→实体 | `“”‘’` |

内部：`_pretty_print_xml`（`:82-88`）、`_escape_smart_quotes`（`:91-98`）。

## 3. 内部逻辑与关键流程

1. 校验：存在（`:44-45`）、后缀 `.docx/.pptx/.xlsx`（`:47-48`）。
2. `zipfile.extractall` 解包（`:53-54`）；`BadZipFile`→错误（`:76-77`）。
3. 收集 `*.xml`+`*.rels`，逐个 `_pretty_print_xml`（**defusedxml** minidom `toprettyxml`，`:56-58`；解析失败静默跳过 `:87-88`）。
4. DOCX 且 `simplify_redlines` → `do_simplify_redlines(output)` 计数入消息（`:63-65`）；`merge_runs` → `do_merge_runs(output)` 计数入消息（`:67-69`）。
5. 最后逐文件 `_escape_smart_quotes`（把弯引号替换为 `&#x201C;` 等实体，`:71-72`、`:91-98`）。
6. 返回成功消息（含 XML 计数）。

## 4. 调用者与调用链

- CLI/`pack.py` 的逆向伙伴；skill 编排调用。
- 出向：`helpers.merge_runs.merge_runs`、`helpers.simplify_redlines.simplify_redlines`（本批同组）、`defusedxml.minidom`。

## 5. 数据 I/O、读写与副作用

- **写**：`output_directory` 解包内容；就地改写 XML（pretty-print + 弯引号转义）。
- **无网络**；XML 解析用 defusedxml（防 XXE/实体炸弹）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 文件不存在/后缀非法 | `:44-48` | 错误消息 |
| 坏 ZIP | `:76-77` | 「not a valid Office file」 |
| XML 解析失败 | `:87-88`、`:97-98` | 静默跳过该文件 |
| 其它异常 | `:78-79` | 「Error unpacking: …」 |

无回滚（部分解包残留输出目录）。

## 7. 权限与权威状态

无身份校验；输出目录任意写（CLI 场景默认信任调用方）。

## 8. 修改影响面

- `SMART_QUOTE_REPLACEMENTS` 双向性由 `pack.py` 的 `_condense_xml`/`normalize` 链路保证；改动破坏往返。
- 后缀白名单与 skill 描述耦合。

## 9. 测试证据

无专属测试（全树检索 `unpack(` 测试命中 0）。**NOT_RUN**：未运行 Python 测试/解包/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主流程/CLI/defusedxml | 已证实 | `:34-132` |
| 弯引号转义时机（helper 之后） | 已证实 | `:63-72` 顺序 |
| 解析失败静默 | 已证实 | `:87-88` |
| LibreOffice/编辑链路实际效果 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 行 | 状态 |
| --- | --- | --- |
| `unpack` | `:34-79` | covered |
| `_pretty_print_xml`/`_escape_smart_quotes` | `:82-98` | covered |
| 失败分支 | `:44-79` | covered |
| CLI | `:101-132` | covered |
