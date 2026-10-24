---
path: apps/electron/default-skills/docx/scripts/office/pack.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db29ed8b1c3676a4980b2d67e9dfe432556d2e58
sha256: b1800987e568261a31f462df8e1303d386e9e6ccc11a75ef46e60cc528c20683
lines: 159
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/pack.py

## 1. 结论与边界

把解包目录**打包回 Office 文件**（`apps/electron/default-skills/docx/scripts/office/pack.py:1-11`）：可选校验+自动修复、压缩 XML 格式（去空白/注释）、ZIP 打包。CLI（`:131-159`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `pack` | 函数 | `:24-66` | `(input_directory, output_file, original_file=None, validate=True, infer_author_func=None) => tuple[None, str]` | 主流程 |

内部：`_run_validation`（`:69-105`）、`_condense_xml`（`:108-128`）。

## 3. 内部逻辑与关键流程

1. 校验目录（`:35-36`）与输出后缀 `.docx/.pptx/.xlsx`（`:38-39`）。
2. `validate and original_file` 且 original 存在 → `_run_validation`（`:41-50`）：docx 组 `DOCXSchemaValidator+RedliningValidator`（author 由 `infer_author_func` 推断，`ValueError` 回落 `'Claude'` 警告，`:78-89`）；pptx 组 `PPTXSchemaValidator`（`:90-91`）；先 `repair()` 再 `validate()`（`:96-100`）；失败返回错误（`:49-50`）。
3. `TemporaryDirectory` 复制输入→`content/`（`:52-54`），`*.xml`/`*.rels` `_condense_xml`（`:56-58`）：**保留 `:t` 文本节点**，其它元素删纯空白文本与注释（`:113-123`）；解析失败打印并**重抛**（`:126-128`）。
4. ZIP_DEFLATED 打包所有文件（相对路径，`:60-64`）。
5. 成功消息（`:66`）。

## 4. 调用者与调用链

- CLI/`unpack.py` 逆向伙伴；skill 编排调用 `pack`。
- 出向：`validators` 包、`defusedxml.minidom`。

## 5. 数据 I/O、读写与副作用

- **写**：输出 `.docx/.pptx/.xlsx`（ZIP）；校验 repair 阶段改临时副本。
- 无网络。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非目录/后缀非法 | `:35-39` | 错误消息 |
| 校验失败 | `:49-50` | 「Validation failed」（不打包） |
| `infer_author_func` 抛 ValueError | `:83-84` | 警告回落 `'Claude'` |
| 无校验器（如 xlsx） | `:93-94` | 跳过校验（成功） |
| XML 解析失败 | `:126-128` | 打印+重抛（打包中止） |

无回滚（输出文件在校验通过后才写）。

## 7. 权限与权威状态

`infer_author_func`/`--author` 语义与 `validate.py` 一致（默认 `'Claude'`）；无身份校验。

## 8. 修改影响面

- `_condense_xml` 保留 `:t` 文本节点的判断（`tagName.endswith(':t')`，`:114`）与 OOXML 文本元素约定耦合；改动会破坏文本空白。
- 与 `unpack.py` 的弯引号转义/pretty-print 构成往返对。

## 9. 测试证据

无专属测试（全树检索 `pack(` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主流程/校验/压缩/打包 | 已证实 | `:24-128` |
| `:t` 文本节点保留、注释删除 | 已证实 | `:113-123` |
| author 回落 `'Claude'` | 已证实 | `:78-89` |
| xlsx 跳过校验打包 | 已证实 | `:93-94` |
| LibreOffice 打开结果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `pack` | `:24-66` | covered |
| `_run_validation` | `:69-105` | covered |
| `_condense_xml` | `:108-128` | covered |
| CLI | `:131-159` | covered |
