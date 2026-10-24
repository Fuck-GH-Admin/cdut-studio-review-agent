---
path: apps/electron/default-skills/docx/scripts/office/validators/redlining.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 71c81b6bf4cacda322db32c87df7b2301c469933
sha256: f4c33fdb9da0651d1d9aa76f0d5294cc9955869339ae131b2f75f3b2e366cb40
lines: 247
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/validators/redlining.py

## 1. 结论与边界

**修订追踪校验器**（`apps/electron/default-skills/docx/scripts/office/validators/redlining.py:1-3`）：验证指定作者（默认 `'Claude'`）的改动**全部经 `<w:ins>/<w:del>` 追踪**——把两份文档中该作者的修订还原后，正文文本必须一致。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RedliningValidator` | class | `:11-243` | 校验器（`__init__/repair/validate` 合同） |

- `__init__(unpacked_dir, original_docx, verbose=False, author='Claude')`（`:13-20`）。
- `repair() -> int`：恒 `0`（本校验器不修复，`:22-23`）。
- `validate()`（`:25-102`）：主判定。
- 内部：`_generate_detailed_diff`（`:104-125`）、`_get_git_word_diff`（`:127-196`）、`_remove_author_tracked_changes`（`:198-227`）、`_extract_text_content`（`:229-243`）。

## 3. 内部逻辑与关键流程

1. **快速路径**（`:31-57`）：解析修改版 `document.xml`，找该作者的 `w:ins`/`w:del`；**没有该作者修订 → 直接 PASSED**（`:51-54`，不进 diff）。解析异常静默落主路径（`:56-57`）。
2. **主路径**（`:59-102`）：临时解包原 DOCX（失败→FAILED，`:62-67`）；解析两份 XML（`ET.ParseError`→FAILED，`:83-85`）；`_remove_author_tracked_changes` 同时还原两份（`:87-88`）：
   - 删除该作者的 `w:ins` 元素（`:203-209`）；
   - 该作者的 `w:del`：`w:delText` 改回 `w:t`、子节点提回父级后移除包装（`:220-227`）。
3. `_extract_text_content` 提取每段 `w:t` 文本按段落拼接（`:229-243`）；**两份不相等 → FAILED** 并输出 `_generate_detailed_diff`（`:93-98`）。
4. diff 说明含三条可能原因与两条正确模式（拒绝他人插入=在他人 `w:ins` 内套 `w:del`；恢复他人删除=在他人 `w:del` 后加 `w:ins`，`:108-116`）；`git diff --word-diff` 生成差异（`--word-diff-regex=.` 字符级，先试字符级再试词级，git 缺失返回 None，`:127-196`）。

## 4. 调用者与调用链

- 调用者：`validate.py`（docx 分派，`validate.py:85-88`）、`pack.py`（`_run_validation`，`pack.py:86-89`）；`author` 由 `infer_author`（`simplify_redlines.py:172`）或 CLI `--author` 注入。
- 出向：`xml.etree.ElementTree`、`zipfile`、`subprocess`（git diff）。

## 5. 数据 I/O、读写与副作用

读解包目录与原 DOCX ZIP；临时目录写文本作 git diff；无持久化写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 修改版 XML 缺失 | `:27-29` | FAILED |
| 无该作者修订 | `:51-54` | PASSED |
| 原 DOCX 解包失败/缺 document.xml | `:65-74` | FAILED |
| XML 解析失败 | `:83-85` | FAILED |
| 文本不一致 | `:93-98` | FAILED + diff 说明 |
| git 不可用 | `:123`、`:193-196` | 差异说明降级为「Unable to generate word diff」 |

## 7. 权限与权威状态

`author` 是修订归属权威键（`:13`）；校验语义=「该作者改动必须全部带修订标记」。

## 8. 修改影响面

- 还原逻辑（ins 删除/del 提升）与 OOXML 修订模型耦合；`w:delText`↔`w:t` 转换（`:220-223`）。
- 无该作者修订直接 PASS（`:51-54`）意味着「零改动=合法」。

## 9. 测试证据

无专属测试（全树检索 `RedliningValidator` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 校验/还原/diff 全流程 | 已证实 | `:25-243` |
| `repair` 恒 0 | 已证实 | `:22-23` |
| 无该作者修订直接 PASS | 已证实 | `:51-54` |
| git 词级 diff 降级链 | 已证实 | `:127-196` |
| 实际文档效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `validate` | `:25-102` | covered |
| 还原 | `:198-227` | covered |
| 文本提取 | `:229-243` | covered |
| diff 生成 | `:104-196` | covered |
