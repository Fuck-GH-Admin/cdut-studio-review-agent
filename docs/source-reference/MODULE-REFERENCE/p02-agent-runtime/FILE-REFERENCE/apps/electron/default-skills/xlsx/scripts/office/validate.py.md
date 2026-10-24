---
path: apps/electron/default-skills/xlsx/scripts/office/validate.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03b01f6e3ba40e1408d0bd16d587154fa9798a87
sha256: 1aef24f8e316965a0584c30859776bd2c82a9fb69f72d79cfed041119cf95514
lines: 111
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/validate.py

## 1. 结论与边界

Office 文档 XML 校验 CLI（docstring `:1-14`）：对解包目录或打包 Office 文件（.docx/.pptx/.xlsx）做 XSD 架构 + 修订（tracked changes）校验；`--auto-repair` 可修两类常见问题（paraId/durableId 超 OOXML 限额、w:t 空白缺 `xml:space="preserve"`）。Skill 工具脚本（python，非产品代码）。

不做的事：不改文档内容语义（只修两类机械问题）；xlsx **实际不支持校验**（见 §3.3 矛盾记录）；无网络。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `main` | function | `:25-107` | argparse CLI 主入口 |

CLI 参数（`:27-52`）：`path`（解包目录或打包文件）；`--original`（原件路径，供修订校验；省略则报全部 XSD 错且跳过修订校验）；`-v/--verbose`；`--auto-repair`；`--author`（默认 `"Claude"`）。

## 3. 内部逻辑与关键流程

1. **参数校验**（`:55-69`）：path 存在断言；`--original` 须是 .docx/.pptx/.xlsx 文件；文件类型取 `(original_file or path).suffix`，不在三扩展名则断言失败。
2. **解包**（`:71-78`）：path 是打包文件 → `tempfile.mkdtemp` + `zipfile.extractall`（**无归档成员路径校验**，zip-slip 可写到临时目录外——目标为临时目录且通常为受信文件，照实记录风险）；否则须为目录。
3. **校验器装配**（`:80-95`）：`.docx` → `DOCXSchemaValidator`（有 original 再加 `RedliningValidator`，author 传入）；`.pptx` → `PPTXSchemaValidator`；**`case _:`（含 `.xlsx`）→ 打印“Validation not supported”并 `sys.exit(1)`**（`:93-95`）。
4. **auto-repair**（`:97-100`）：`sum(v.repair() for v in validators)`，打印修复数。
5. **validate**（`:102-107`）：`all(v.validate())`；通过打印 "All validations PASSED!"；退出码 0/1。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：skill 的 Office 工作流（agent 经命令行调用 `python validate.py …`）；同包 `validators`（`DOCXSchemaValidator/PPTXSchemaValidator/RedliningValidator`，`:22`）。出向：`argparse/sys/tempfile/zipfile/pathlib`、`validators.*`。

## 5. 数据 I/O、读写与副作用

- 读：输入文件/目录；打包文件解到临时目录（**未清理**——tempfile.mkdtemp 无对应 rm，照实记录）。
- 写：仅 `--auto-repair` 经 `validators.repair()` 改文件；stdout 输出。
- 无网络/日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| path 不存在/original 非文件/扩展名不符 | `:56-68` | assert 失败（退出非 0） |
| 非目录非打包文件 | `:77` | assert 失败 |
| xlsx/未知扩展 | `:93-95` | 打印不支持、exit 1 |
| 校验失败 | `:107` | exit 1 |
| 取消/恢复 | 无 | 无信号处理 |

## 7. 权限与权威状态

无权限分支；`--author` 仅用于修订校验的作者名过滤（默认 "Claude"，docstring 示例 `--author NAME`）。退出码即校验权威结论（0=全过）。

## 8. 修改影响面

改校验器装配/退出码 → 影响 skill 工作流的门禁语义；`validators.*` 构造签名联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill 脚本；行为依赖 `validators/*` 实现）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| CLI 参数/解包/装配/退出码 | 已证实 | `:25-107` |
| auto-repair 仅两类机械修复 | 已证实 | docstring `:11-13` |
| xlsx 不支持（与 docstring“可入 .xlsx”矛盾） | 已证实（矛盾照实记录） | `:9/:93-95` |
| 临时目录不清理 | 已证实 | `:72-75` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `main` 参数/解包 | 3 | `:25-78` | covered |
| 校验器装配（docx/pptx/默认拒） | 3.3 | `:80-95` | covered |
| repair/validate/退出码 | 3 | `:97-107` | covered |
