---
path: apps/electron/default-skills/xlsx/scripts/office/pack.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db29ed8b1c3676a4980b2d67e9dfe432556d2e58
sha256: b1800987e568261a31f462df8e1303d386e9e6ccc11a75ef46e60cc528c20683
lines: 159
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/pack.py

## 1. 结论与边界

把解包目录打回 DOCX/PPTX/XLSX（docstring `:1-11`）：先校验（带 auto-repair）、压缩 XML 空白、再打 ZIP。Skill 工具脚本，与 `unpack.py` 互逆（字节形状不对称：unpack 美化、pack 压缩）。

不做的事：不改 XML 语义（只删纯空白文本节点/注释）；xlsx 无校验器（静默跳过校验，见 §3.2）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `pack` | function | `:24-66` | `(input_directory, output_file, original_file=None, validate=True, infer_author_func=None) => tuple[None, str]` |
| `_run_validation` | function | `:69-105` | 校验装配+repair+validate（返回 `(success, output)`） |
| `_condense_xml` | function | `:108-128` | 压缩 XML 空白/注释（解析失败**抛出**） |

## 3. 内部逻辑与关键流程

### 3.1 `pack`（`:24-66`）

1. 输入须目录、输出后缀 ∈ {.docx,.pptx,.xlsx}（错误消息返回，`:35-39`）。
2. `validate and original_file` 且原件存在 → `_run_validation`；失败返回 “Error: Validation failed”（`:41-50`）。
3. `tempfile.TemporaryDirectory` 内 `copytree` → 全量 `_condense_xml`（`*.xml`/`*.rels`）→ `ZIP_DEFLATED` 打包（相对路径，`:52-64`）。
4. 成功消息 “Successfully packed …”。

### 3.2 `_run_validation`（`:69-105`）

- `.docx`：author 默认 `"Claude"`；`infer_author_func` 抛 `ValueError` → stderr 警告后用默认（`:79-84`）；装配 `DOCXSchemaValidator` + `RedliningValidator`。
- `.pptx`：`PPTXSchemaValidator`。
- **`.xlsx`/无匹配 → `validators=[]` → `return True, None`——静默跳过校验**（`:93-94`；与 `validate.py` 显式拒绝不同，照实记录）。
- 恒执行 `repair()`（“Auto-repaired N issue(s)”）再 `validate()`；通过打 “All validations PASSED!”。

### 3.3 `_condense_xml`（`:108-128`）

defusedxml.minidom 解析；跳过 `*:t`（文本运行）元素内部；删除非 t 元素的纯空白文本节点与注释；`toxml` 写回。**解析失败打印 stderr 并 re-raise**（打包中断，`:126-128`——与 unpack 的静默跳过相反）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：skill Office 工作流（agent 命令行）；出向 `validators.*`（`:22`）、`defusedxml.minidom`、`zipfile/shutil/tempfile`。

## 5. 数据 I/O、读写与副作用

- 读输入目录；临时目录自动清理（`TemporaryDirectory`）；写输出 ZIP（覆盖式 `ZipFile(...,'w')`）。
- `_run_validation` 的 `repair()` 会改输入目录副本？——不：repair 作用于 `unpacked_dir`（**原始输入目录**，`:44-46`），即校验修复写回输入目录（照实记录副作用）。
- 无网络；stderr 警告/错误。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 非目录/后缀不符 | `:35-39` | 错误消息返回 |
| 校验失败 | `:49-50` | “Error: Validation failed” |
| XML 解析失败 | `:126-128` | stderr + re-raise（中断） |
| infer_author ValueError | `:83-84` | 警告+默认作者 |
| CLI 错误 | `:158-159` | exit 1 |
| 取消/恢复 | 无 | 无信号处理 |

## 7. 权限与权威状态

无权限分支；校验通过才打包（`validate=True` 默认）；`--validate false` 可绕过（CLI 提供）。作者推断失败降级默认 “Claude” 不阻断。

## 8. 修改影响面

改压缩策略 → 影响产出 ZIP 字节与回环一致性；`validators.*`/`infer_author_func` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill 脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 校验→压缩→打包链 | 已证实 | `:24-66` |
| xlsx 静默跳过校验（与 validate.py 不同） | 已证实（矛盾照实记录） | `:93-94` |
| repair 写回输入目录 | 已证实 | `:44-46/:96` |
| `_condense_xml` 失败即中断 | 已证实 | `:126-128` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `pack` | 3.1 | `:24-66` | covered |
| `_run_validation` | 3.2 | `:69-105` | covered |
| `_condense_xml` | 3.3 | `:108-128` | covered |
| CLI | 3 | `:131-159` | covered |
