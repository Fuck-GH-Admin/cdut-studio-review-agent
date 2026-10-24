---
path: apps/electron/default-skills/skill-creator/scripts/package_skill.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f48eac444656ddc41204aac1760a217951ce609e
sha256: 1a33059b0db1ef73375d46d513e5ea81369d2e8838c970597b0d52ddef8d1c0f
lines: 136
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/package_skill.py

## 1. 结论与边界

Skill 打包器：把 skill 文件夹打成可分发 `.skill`（zip 格式）。打包前必过 `validate_skill`（:70-77）。

## 2. 导出与关键符号

导出 2 条（`def` :27/:42）：`should_exclude(rel_path)`（:27-39）、`package_skill(skill_path, output_dir=None)`（:42-108）。内部：排除规则常量（`EXCLUDE_DIRS={__pycache__,node_modules}` :20、`EXCLUDE_GLOBS={'*.pyc'}` :21、`EXCLUDE_FILES={.DS_Store}` :22、**`ROOT_EXCLUDE_DIRS={'evals'}` 仅根级** :24）。

## 3. 内部逻辑与关键流程

`package_skill`（:42-108）：存在/目录/SKILL.md 三查（:55-68）→校验门（:70-77）→zip（ZIP_DEFLATED :91）：rglob 全文件、arcname 以 skill 父目录为根（:96）、排除逐条打印（:98-101）。CLI（:111-132）：`<skill-folder> [output-directory]`。

## 4. 调用者与调用链

入向：skill-creator 工作流（Agent Bash 调用）。出向：`scripts.quick_validate`（validate_skill :17）、`zipfile`/`fnmatch`。

## 5. 数据 I/O、读写与副作用

读 skill 目录；写 `.skill` zip 到输出目录（默认 cwd）。

## 6. 分支、失败、取消与恢复

校验失败返 None（exit 1）；异常打印返 None（:106-108）。不适用取消/恢复。

## 7. 权限与权威状态

打包排除规则权威（防构建产物入包）；校验前置为质量门。

## 8. 修改影响面

- 消费面：skill-creator 打包分发流。
- 依赖面：quick_validate 校验契约；zip 约定。
- 需同步测试：无（脚本层）。

## 9. 测试证据

无（脚本层无测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；排除规则+校验门 | 已证实 | :20-108 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+打包链 | §2/§3 | :27-136 | covered |
