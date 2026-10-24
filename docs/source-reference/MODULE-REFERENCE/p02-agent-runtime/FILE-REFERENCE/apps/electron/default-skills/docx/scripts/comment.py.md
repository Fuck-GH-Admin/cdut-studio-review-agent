---
path: apps/electron/default-skills/docx/scripts/comment.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 36e1c935f2aac390ed468d0637e83cea18decd64
sha256: e86e4e17ec5805780325206d20d3ed5a8f7024f1e4641ac8f46ef5df0b564f63
lines: 318
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/comment.py

## 1. 结论与边界

DOCX **批注添加工具**（`apps/electron/default-skills/docx/scripts/comment.py:1-14`）：向解包目录的 `comments.xml` 及三件套扩展（commentsExtended/Ids/Extensible）追加批注或回复；文档约定文本须**预转义 XML**，标记（commentRangeStart/End）由调用方后续手工插入 `document.xml`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `add_comment` | 函数 | `:218-290` | `(unpacked_dir, comment_id, text, author='Claude', initials='C', parent_id=None) => tuple[str, str]` | 主流程（返回 `(para_id, 消息)`） |

内部：`TEMPLATE_DIR`（`:25`）、`NS`（5 命名空间，`:26-32`）、`COMMENT_XML`（`:34-50`）、`COMMENT_MARKER_TEMPLATE`/`REPLY_MARKER_TEMPLATE`（`:52-65`）、`_generate_hex_id`（`:68-69`）、`SMART_QUOTE_ENTITIES`/`_encode_smart_quotes`（`:72-83`）、`_append_xml`（`:86-95`）、`_find_para_id`（`:98-105`）、`_get_next_rid`（`:108-118`）、`_has_relationship`/`_has_content_type`（`:121-134`）、`_ensure_comment_relationships`（`:137-176`）、`_ensure_comment_content_types`（`:179-215`）。

## 3. 内部逻辑与关键流程

`add_comment`（`:218-290`）：

1. 校验 `word/` 存在（`:226-228`）；生成 `para_id`/`durable_id`（随机 hex，`:68-69`、`:230`）与 UTC 时间戳（`:231`）。
2. **comments.xml**：不存在则从 `templates/` 复制模板（`:234-236`）；确保 rels（4 个 Relationship：comments/commentsExtended/commentsIds/commentsExtensible，`:149-166`）与 Content_Types（4 个 Override，`:190-207`）；`_append_xml` 追加 `COMMENT_XML` 格式化批注（`:239-250`）。
3. **commentsExtended.xml**：`parent_id` 给定时查父 `w14:paraId`（`:256`，查不到报错 `:257-258`），写 `paraIdParent` 建回复链（`:259-263`）；否则独立批注（`:265-269`）。
4. **commentsIds.xml/Extensible.xml**：写 `durableId` 与 `dateUtc`（`:271-287`）。
5. 返回 `(para_id, "Added comment|reply …")`（`:289-290`）。

`_append_xml`（`:86-95`）：解析目标文件、包装内容带 `NS` 命名空间、`importNode` 追加元素子节点、**输出时 `_encode_smart_quotes`**（弯引号转实体）后写回。CLI（`:293-318`）：默认 author='Claude'，成功后打印标记模板（`:314-318`）。

## 4. 调用者与调用链

- CLI/`comment.py` 由 skill 编排调用；出向：`defusedxml.minidom`、`shutil`（模板复制）。
- 模板目录 `templates/`（与本文件同级）——**不在本批 scope**。

## 5. 数据 I/O、读写与副作用

- **写**：`comments.xml`、`commentsExtended.xml`、`commentsIds.xml`、`commentsExtensible.xml`、`word/_rels/document.xml.rels`、`[Content_Types].xml`（就地追加）。
- **读**：templates 副本。
- 无网络；`random` 生成 ID（非加密用途）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| `word/` 不存在 | `:227-228` | 错误消息 |
| 父批注不存在 | `:257-258` | 错误消息 |
| 文件已存在 | `:234`、`:253` 等 | 追加而非重建 |
| rels 已含 comments | `:142-143` | 跳过 |

无回滚（部分文件已追加）。

## 7. 权限与权威状态

`author`/`initials` 默认 `'Claude'`/`'C'`（`:222-223`、CLI `:298-299`）——批注作者身份由调用方给定，无校验。

## 8. 修改影响面

- `COMMENT_XML`/扩展四件套与 Word 版本（w14/w15/w16cid/w16cex）耦合。
- 标记插入约定（`:9-13` 注释：标记必须是 `w:p` 直接子元素、不得在 `w:r` 内）是调用方合同。

## 9. 测试证据

无专属测试（全树检索 `add_comment` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主流程/四件套追加/回复链 | 已证实 | `:218-290` |
| 输出弯引号转义 | 已证实 | `:86-95` |
| 默认作者 Claude | 已证实 | `:222` |
| Word 实际打开效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `add_comment` | `:218-290` | covered |
| rels/Content_Types 确保 | `:137-215` | covered |
| `_append_xml`/转义 | `:86-95` | covered |
| CLI/标记模板 | `:293-318` | covered |
