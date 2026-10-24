---
path: apps/electron/default-skills/xlsx/scripts/office/unpack.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00152533ac0fa95109f74253ac6a475401fa6afe
sha256: 83f69cecc87910183654c06345837244402e8a99edbf3bdddc1cf72f11304b62
lines: 132
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/unpack.py

## 1. 结论与边界

Office 文件（DOCX/PPTX/XLSX）解包编辑工具（docstring `:1-14`）：解 ZIP、美化打印 XML，可选（仅 DOCX）合并同格式相邻 run、简化同作者相邻修订。Skill 工具脚本。

不做的事：不改文档语义内容（美化/合并/简化是结构变换）；merge_runs/simplify_redlines 不适用 pptx/xlsx。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SMART_QUOTE_REPLACEMENTS` | const | `:26-31` | 四个智能引号→HTML 实体映射 |
| `unpack` | function | `:34-79` | `(input_file, output_directory, merge_runs=True, simplify_redlines=True) => tuple[None, str]`（成功/失败均返回消息字符串） |

内部：`_pretty_print_xml`（`:82-88`，defusedxml.minidom 美化，异常静默跳过）；`_escape_smart_quotes`（`:91-98`，智能引号转实体，异常静默）。

## 3. 内部逻辑与关键流程

1. 输入存在/后缀 ∈ {.docx,.pptx,.xlsx} 校验（错误以 `(None, "Error: …")` 返回，`:44-48`）。
2. `mkdir(parents=True, exist_ok=True)` + `zipfile.extractall`（`:50-54`）。
3. 对 `*.xml` + `*.rels` 全量 `_pretty_print_xml`（`:56-58`）。
4. **仅 DOCX**（`:62-69`）：`simplify_redlines`（默认开）→ “simplified N tracked changes”；`merge_runs`（默认开）→ “merged N runs”。
5. 全量 `_escape_smart_quotes`（在 merge 之后，`:71-72`）。
6. `BadZipFile` → “not a valid Office file”；其它异常 → “Error unpacking: …”（`:76-79`）。

CLI（`:101-132`）：`input_file`、`output_directory`、`--merge-runs`/`--simplify-redlines`（`true|false` 字符串解析，非 "true" 一律 false）；打印消息；消息含 "Error" → exit 1。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：skill Office 工作流（agent 命令行调用）；出向 `helpers.merge_runs.merge_runs`、`helpers.simplify_redlines.simplify_redlines`（`:23-24`）、`defusedxml.minidom`（**防 XXE 的 XML 解析**）、`zipfile/pathlib/argparse`。

## 5. 数据 I/O、读写与副作用

- 写：输出目录解包（`extractall` 无成员路径校验，存在 zip-slip 风险——见 §7）+ 就地重写全部 xml/rels（美化+实体转义）。
- 读：输入 Office 文件。
- 无网络/日志；`_pretty_print_xml`/`_escape_smart_quotes` 异常静默（解析失败保留原文件）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 输入不存在/后缀不符 | `:44-48` | 错误消息返回 |
| 坏 ZIP/其它异常 | `:76-79` | 错误消息返回 |
| xml 解析失败 | `:87-88/:97-98` | 静默跳过（保原字节） |
| CLI 错误 | `:131-132` | exit 1 |
| 取消/恢复 | 无 | 无信号处理 |

## 7. 权限与权威状态

无权限分支。安全边界如实：`extractall` **不校验归档成员路径（zip-slip 无防护）**，恶意归档可写到输出目录之外；defusedxml 仅防 XML 实体扩展（XXE），与归档路径安全无关——解包不可信归档前须自行校验成员路径或用受信来源。错误消息即权威口径（消息含 "Error" 判失败）。

## 8. 修改影响面

改美化/转义 → 影响下游 pack 重新打包的字节形状与 validate 结果；merge_runs/simplify_redlines 契约联动 helpers。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill 脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 解包+美化+实体转义全链 | 已证实 | `:50-74` |
| merge/simplify 仅 DOCX 且默认开 | 已证实 | `:62-69`、`:107-120` |
| defusedxml 防 XXE | 已证实 | `:21/:85` |
| 异常静默保原文件 | 已证实 | `:87-88/:97-98` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SMART_QUOTE_REPLACEMENTS` | 2 | `:26-31` | covered |
| `unpack` | 3 | `:34-79` | covered |
| `_pretty_print_xml`/`_escape_smart_quotes` | 2 | `:82-98` | covered |
| CLI | 3 | `:101-132` | covered |
