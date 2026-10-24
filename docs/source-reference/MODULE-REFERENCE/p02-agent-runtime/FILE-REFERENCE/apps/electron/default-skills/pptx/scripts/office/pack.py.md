---
path: apps/electron/default-skills/pptx/scripts/office/pack.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db29ed8b1c3676a4980b2d67e9dfe432556d2e58
sha256: b1800987e568261a31f462df8e1303d386e9e6ccc11a75ef46e60cc528c20683
lines: 159
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/pack.py

## 1. 结论与边界

目录→Office 文件（DOCX/PPTX/XLSX）**打包器**：校验（含 auto-repair）+XML 压缩+ZIP 输出（`pack.py:1-11`）。副作用=写输出文件。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `pack` | 函数 | `:24` | `(input_directory, output_file, original_file=None, validate=True, infer_author_func=None) -> (None, str)` |
| `_run_validation` | 内部 | `:69` | 按后缀组校验器（docx=DOCX+Redlining，pptx=PPTX；xlsx 不支持→跳过校验 `:93-94`） |
| `_condense_xml` | 内部 | `:108` | 压缩空白/注释（**`:t` 文本元素除外** `:114-115`，防吞文本）；解析失败**抛**（与 unpack 静默相反，`:126-128`） |
| CLI | `:131-159` | | 两位置参数 + `--original` + `--validate`（默认 true） |

## 3. 内部逻辑与关键流程

`pack`（`:24-66`）：目录/后缀校验（`:35-39`）→ validate 且有 original→`_run_validation`（失败→"Error: Validation failed"，`:41-50`；**`--original` 指定但路径不存在时 `original_path.exists()` 内层静默跳过校验仍打包，`:42-50` 照实**）→ 临时目录复制→`*.xml`/`*.rels` 全部 `_condense_xml`（`:56-58`）→ `ZipFile(ZIP_DEFLATED)` 打包（`:61-64`）→ 成功消息。`_run_validation`（`:69-105`）：docx 用 `infer_author_func` 推断作者（失败回落默认 'Claude' 并告警 `:80-84`）→ `repair()` 累计（`:96-98`）→ `all(v.validate())`（`:100`）。

## 4. 调用者与调用链

- 入向：pptx/docx 技能流程（Agent CLI，域外）。
- 出向：`validators`（本批）、`defusedxml.minidom`、zipfile/shutil。

## 5. 数据 I/O、读写与副作用

读解包目录（+可选 original）；写输出 Office 文件；校验器 repair 会**改写解包目录内文件**（validators.repair 语义，域内 docx.py）。

## 6. 分支、失败、取消与恢复

校验失败→不打包返回 Error（`:49-50`）；condense 解析失败→抛（中止）；CLI 消息含 "Error"→exit 1（`:158-159`）。

## 7. 权限与权威状态

无权限分支，依据：本地文件操作；校验权威=validators（XSD+红线/修订核对）。

## 8. 修改影响面

打包收尾环；validate 开关影响产物合规性。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 流程/校验组/condense 保护/错误语义 | 已证实 | `:1-159` 全文 |
| validators.repair/validate 行为 | 本批 | base/docx/pptx/redlining 手册 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+2 内部+CLI | §2/§3 | 24-159 | covered |
