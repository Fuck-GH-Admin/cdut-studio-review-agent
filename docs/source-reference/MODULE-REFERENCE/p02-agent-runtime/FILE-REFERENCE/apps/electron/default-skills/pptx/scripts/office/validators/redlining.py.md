---
path: apps/electron/default-skills/pptx/scripts/office/validators/redlining.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 71c81b6bf4cacda322db32c87df7b2301c469933
sha256: f4c33fdb9da0651d1d9aa76f0d5294cc9955869339ae131b2f75f3b2e366cb40
lines: 247
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/validators/redlining.py

## 1. 结论与边界

**Word 修订（tracked changes）校验器**（`redlining.py:1-3`）：核心不变量=“指定作者的所有改动必须带修订标记”——把双方文档中该作者的 `w:ins/w:del` 还原后，正文文本必须完全一致（`:87-98`）。不改文件（只读校验）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RedliningValidator` | 类 | `:11` | `(unpacked_dir, original_docx, verbose=False, author="Claude")` |
| `.repair()` | 方法 | `:22` | 恒返 0（无修复项） |
| `.validate()` | 方法 | `:25` | 见 §3 |
| `._generate_detailed_diff` | 内部 | `:104` | 文本不一致时生成逐行差异报告 |
| `._remove_author_tracked_changes` | 内部 | `:~200-227` | 作者 `w:ins` **整体删除（含内容）**、`w:del` **还原展开**（`w:delText`→`w:t` 改标 `:222-223`、倒序插回 `:225-227`） |
| `._get_git_word_diff` | 内部 | `:149-192` | git word-diff 两遍降级比对；无 git 环境提示（依赖系统 git，降级行为照实） |
| `._extract_text_content` | 内部 | `:229` | 段落级文本拼接（非空段 `\n` 连接） |

`__main__` 守卫：`raise RuntimeError("This module should not be run directly.")`（`:246-247`）。

## 3. 内部逻辑与关键流程

`validate`（`:25-102`）：①modified document.xml 缺→FAILED（`:27-29`）；②快速路径——该作者无任何 ins/del→PASSED（`:40-54`）；③解包 original 到临时目录（`:59-67`）；④双文档解析（ParseError→FAILED `:83-85`）；⑤双方移除该作者修订标记后提取文本（`:87-91`）；⑥文本不等→详细 diff+FAILED（`:93-98`）；⑦相等→PASSED（`:100-102`）。

## 4. 调用者与调用链

- 入向：`office/validate.py:87`（docx+original 时）、`office/pack.py:88`（`_run_validation`，author 经 infer_author 注入）。
- 出向：zipfile/ElementTree（stdlib）。

## 5. 数据 I/O、读写与副作用

只读（original 解包到 tempfile，`:59-60`）；无写副作用。

## 6. 分支、失败、取消与恢复

快速路径/解析失败/文本不等三分支（§3）；无取消。

## 7. 权限与权威状态

修订完备性权威=“无标记改动=违规”（`:90-98` 判定）；作者归属权威=`w:author` 属性（`:43-48`）。

## 8. 修改影响面

docx 打包质量门；author 参数与 `infer_author`/`--author` 联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 校验语义/快速路径/展开规则 | 已证实 | `:1-247` 全文 |
| 真实 Word 文档边界形态 | 边界 | 域外样本未核 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类+3 方法+4 内部（含 _get_git_word_diff） | §2/§3 | 11-247 | covered |
