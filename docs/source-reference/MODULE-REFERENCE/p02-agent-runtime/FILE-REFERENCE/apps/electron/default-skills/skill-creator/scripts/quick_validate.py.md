---
path: apps/electron/default-skills/skill-creator/scripts/quick_validate.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ed8e1dddce77b16af13c6f36b3fe86c4ac7c590c
sha256: 67cf5703402013936c8fb75ad6a1afecd8841d45cc5e606b634eb05825fde365
lines: 103
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/scripts/quick_validate.py

## 1. 结论与边界

Skill 快速校验（最小版）：SKILL.md 存在/frontmatter 合法/字段白名单与长度边界。CLI 入口（exit 0/1）。

## 2. 导出与关键符号

导出 1 条（`def` :12）：`validate_skill(skill_path) -> (bool, message)`。常量：`ALLOWED_PROPERTIES={name,description,license,allowed-tools,metadata,compatibility}`（:42）。

## 3. 内部逻辑与关键流程

（:12-94）顺序：SKILL.md 存在→frontmatter 开头/正则提取（:27）→yaml.safe_load 必须 dict（:35-37）→**未知字段拒**（:45-50）→name/description 必填（:53-56）→name kebab-case（`^[a-z0-9-]+$` :65、无首尾/连续连字符 :67-68、≤64 :70-71）→description 禁尖括号（:80-81）+≤1024（:83-84）→compatibility 可选 ≤500（:87-92）。CLI（:96-103）：单参数+exit code。

## 4. 调用者与调用链

入向：`package_skill.py:17`（打包前置校验）+skill-creator 工作流。出向：`yaml`（PyYAML）。

## 5-7. 数据/分支/权限

只读 SKILL.md；校验分支族；不适用权限/取消。

## 8. 修改影响面

- 消费面：package_skill 打包门+skill-creator 校验流。
- 依赖面：SKILL.md 规范（name 64/desc 1024/compat 500 上限）。
- 需同步测试：无（脚本层）。

## 9. 测试证据

无（脚本层无测试）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；校验链+边界数字 | 已证实 | :42-94 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 校验链全分支 | §2/§3 | :12-103 | covered |
