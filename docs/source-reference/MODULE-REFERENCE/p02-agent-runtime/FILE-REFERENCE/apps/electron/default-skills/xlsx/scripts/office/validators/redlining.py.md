---
path: apps/electron/default-skills/xlsx/scripts/office/validators/redlining.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 71c81b6bf4cacda322db32c87df7b2301c469933
sha256: f4c33fdb9da0651d1d9aa76f0d5294cc9955869339ae131b2f75f3b2e366cb40
lines: 247
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/office/validators/redlining.py

## 1. 结论与边界

Word 修订（tracked changes）校验器（docstring `:1-3`）：核心断言——**移除目标作者的修订后，修改稿文本必须与原件逐段相等**（即该作者所有改动都是合法追踪修订、未夹带未追踪文本改动）。类 `RedliningValidator`，被 `validate.py`/`pack.py` 装配使用。`__main__` 明确拒绝直接运行（`:246-247`）。

不做的事：`repair()` 恒 0（无修复）；不校验修订结构合法性（只验文本等价性）；不验证作者身份真实性。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RedliningValidator` | class | `:11-243` | `(unpacked_dir, original_docx, verbose=False, author="Claude")` |

方法：`repair()`（`:22-23`，恒 0）；`validate()`（`:25-102`）；`_generate_detailed_diff`（`:104-125`）；`_get_git_word_diff`（`:127-196`）；`_remove_author_tracked_changes`（`:198-227`）；`_extract_text_content`（`:229-243`）。

## 3. 内部逻辑与关键流程

### 3.1 `validate()`（`:25-102`）

1. 修改稿 `word/document.xml` 缺失 → FAILED/False。
2. 快路（`:31-57`）：解析修改稿数 `w:del`/`w:ins` 中作者为 `self.author` 的元素；**作者零修订 → PASSED/True**（异常也 fall through 到慢路）。
3. 慢路（`:59-102`）：临时目录解原件包；两稿解析（ParseError → FAILED）；`_remove_author_tracked_changes` 剥离作者修订（两稿同等处理）；`_extract_text_content` 逐段拼 `w:t` 文本比较——**不等 → 打详细 diff、False**；相等 → “All changes by X are properly tracked”、True。

### 3.2 `_remove_author_tracked_changes`（`:198-227`）

- 作者的 `w:ins` 整元素移除（`:203-209`）。
- 作者的 `w:del`：`w:delText` 改回 `w:t`、子节点按原位插回父级再删 del 壳（`:211-227`，逆序保索引）——语义 = 拒绝该作者删除。

### 3.3 报告（`:104-196`）

失败信息给“可能原因+正确模式”（在他人的 ins 里改文本/无追踪编辑/未把 del 嵌进 ins 等，`:108-116`）；git 词级 diff（`--word-diff=plain --word-diff-regex=. -U0 --no-index`，失败退普通 word-diff；git 不可用 → 说明行）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：`validate.py:22`（docx 且有 original 时装配）、`pack.py:22/88`（`_run_validation` docx 分支，author 可由 `infer_author` 推断）。出向：`xml.etree.ElementTree`、`zipfile/tempfile/subprocess`（git diff）、`pathlib`。

## 5. 数据 I/O、读写与副作用

读修改稿目录 + 原件 docx 包（`zipfile.extractall` 解原件，无归档成员路径校验（zip-slip 风险），原件通常受信——与 unpack.py/base.py 同点，NB63-NOTE-02）；临时目录写两份 txt 供 git diff（自动清理）；stdout 输出结论。无网络（git 为本地子进程）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 修改稿缺失/解包失败/XML 坏 | `:27-29/:65-67/:83-85` | FAILED/False |
| 作者零修订 | `:51-54` | PASSED/True |
| 文本不等 | `:93-98` | 详细 diff/False |
| git 不可用 | `:123/:193-196` | diff 降级 None/说明 |
| 取消/恢复 | 无 | 纯校验 |

## 7. 权限与权威状态

- 权威判定 = “作者改动全部被追踪”（文本等价测试）；作者名仅按 `w:author` 属性匹配（默认 "Claude"）。
- 快路的“零修订即通过”如实（作者没动过=无违规）。

## 8. 修改影响面

改剥离/比较语义 → 影响 docx 修订门禁（validate/pack 均消费）；git diff 只影响报错可读性。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill validator）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 文本等价判定（剥离作者修订后） | 已证实 | `:87-98` |
| ins 删除/del 复原（delText→t） | 已证实 | `:198-227` |
| 快路零修订通过 | 已证实 | `:51-54` |
| git 词级 diff 报告 | 已证实 | `:127-196` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `repair`/`validate` | 3.1 | `:22-102` | covered |
| `_remove_author_tracked_changes` | 3.2 | `:198-227` | covered |
| `_extract_text_content`/diff 族 | 3.3 | `:104-196/:229-243` | covered |
