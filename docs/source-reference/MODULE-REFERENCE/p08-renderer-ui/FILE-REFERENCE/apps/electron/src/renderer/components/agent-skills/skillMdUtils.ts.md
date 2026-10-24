---
path: apps/electron/src/renderer/components/agent-skills/skillMdUtils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a7560d693ad19fde8c3249851d9f1a999c74313
sha256: 83e76bc82b9cd8240c9ad9c4571fbbe888ed3d54055176c078ef8b007aa16d76
lines: 51
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/skillMdUtils.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

SKILL.md frontmatter 解析与重写工具（51 行，头注 :1-6）：提取正文、在保留 frontmatter 前提下重写 name/description/body。供技能详情抽屉编辑使用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `extractSkillBody` | fn | 9-15 | 去 frontmatter 取正文（BOM 剥离 :11） |
| `rebuildSkillMd` | fn | 22-51 | 保结构重写指定字段 |

内部：`toInlineValue`（:18-20，值内换行折叠为空格防破 YAML）。

## 3. 内部逻辑与关键流程

`extractSkillBody`：剥 UTF-8 BOM（`0xFEFF`）→正则 `^---\s*\n[\s\S]*?\n---\s*\n` 匹配→无匹配返回原文。`rebuildSkillMd`：剥 BOM→frontmatter 匹配失败**原样返回**；name 存在则替换 `^name:.*$` 否则前置；description 替换或**追加到末尾**；body 未提供则保留现正文。

## 4. 调用者与调用链

入向：Agent 技能详情抽屉（编辑保存链）。出向：无依赖（纯字符串）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 frontmatter→原样返回；不抛。

## 7. 权限与权威状态

- 结构完整性权威：重写不破坏 frontmatter（字段缺失时前置/追加而非重建）；BOM 双处剥离防匹配失败。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：技能详情抽屉的读取展示与保存回写（SKILL.md 字段编辑）。
- 回归关注：BOM 场景匹配、值内换行折叠、无 frontmatter 原样返回。
- 无专属测试文件（全树检索确认）；回归靠编辑保存人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号/行号 | 已证实 | 逐行核对 |
| BOM/折叠/原样返回语义 | 已证实 | :11/:18-20/:27 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `extractSkillBody`/`rebuildSkillMd` | §3 | 9-51 | covered（未测） |
