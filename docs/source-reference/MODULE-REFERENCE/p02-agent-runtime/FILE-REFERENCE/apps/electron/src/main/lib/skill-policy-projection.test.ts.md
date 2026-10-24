---
path: apps/electron/src/main/lib/skill-policy-projection.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69a03bad1cd1dfee35ace4f42a7567481db3d87e
sha256: b214edb31b33c6504ee7ed5d8ceebfed2fbee10bc277915f18509c05904b503c
lines: 46
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-policy-projection.test.ts

## 1. 测试目标

`global-skill-manager.preparePolicyRuntimeSkills` 的策略投影：先裁剪再提供、空集合不回退、源目录不变、YAML 重写后 SDK 可解析。（被测函数不在本批源文件内——跨文件，本测试文件属本批。）

## 2. 用例清单

**2 个 `test()`**（无 describe）：

| 用例 | 行 |
| --- | --- |
| 投影先裁剪再提供 Claude/Pi，空集合不回退，源目录不变 | `:9-31` |
| 引号 YAML key、block scalar 与 metadata 重写后仍可由 SDK 解析 | `:33-46` |

夹具：临时源目录（alpha/beta 同 name 'shared-name' + resource.txt，`:13-19`）；afterEach 清理（`:8`）。

## 3. 真实断言

- `:23-28` 投影内 alpha 目录 `existsSync` `toBe(false)`；beta frontmatter.name 重写为 `'beta'`（slug 覆盖 shared-name）；resource.txt 内容保留；`one.skills` `toEqual(['beta'])`；`none.skills` `toEqual([])` 且 `skills/` 目录仍存在。
- `:29` 源目录 SKILL.md 仍含 `name: shared-name`（**源不变**）。
- `:30` 重复投影 `path` `toBe(one.path)`（同 fingerprint 复用）。
- `:42-45` 重写后 frontmatter `toMatchObject({name:'alpha', metadata:{team:'reports'}, 'disable-model-invocation':true})`、description 含多行、body 含 BODY_alpha；源文件 `toBe(content)` 不变。

## 4. 未覆盖与脆弱点

- 未覆盖：`preparePolicyRuntimeSkills` 异常分支；全局 Skill 禁用/替换（在 skill-runtime-smoke.test 覆盖）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 逐行读 `:1-46` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 裁剪/空集合/源不变/复用 | 1 | covered |
| YAML 重写保真 | 1 | covered |
