---
path: apps/electron/default-skills/skill-creator/scripts/utils.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 51b6a07dd57174197a937034b7eecebd5768ff8a
sha256: 3af8ae62c40c73ab712207436a0d9a981e845f25c5a7040229eb189cc8e45bb1
lines: 47
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/utils.py

## 1. 结论与边界

skill-creator 脚本共享工具（47 行）：解析 SKILL.md frontmatter。skill-creator 为内置 skill 脚本，由 Agent 运行（Bash 工具），非产品运行时。

## 2. 导出与关键符号

导出 1 条（`def` :7）：`parse_skill_md(skill_path) -> (name, description, full_content)`。内部：frontmatter 边界定位（开 `---` 必须首行 :12-13、闭合缺失 throw :21-22）。

## 3. 内部逻辑与关键流程

（:7-47）：逐行扫 frontmatter；`name:` 去引号（:30-31）；`description:` 支持 YAML 多行指示符 `> | >- |-`（:34-42，续行缩进收集为空格拼接）；其余取值去引号。纯解析无副作用。

## 4. 调用者与调用链

入向：`improve_description.py:17`（from scripts.utils import parse_skill_md）+同目录脚本。出向：`pathlib`。

## 5-7. 数据/分支/权限

读 SKILL.md；frontmatter 校验分支；不适用权限/取消。

## 8. 修改影响面

- 消费面：improve_description 等 skill-creator 脚本。
- 依赖面：SKILL.md frontmatter 约定。
- 需同步测试：无（脚本层无测试）。

## 9. 测试证据

无（Python 脚本层无测试；行为断言 NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；多行 YAML 处理 | 已证实 | :7-47 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parse_skill_md | §2/§3 | :7-47 | covered |
