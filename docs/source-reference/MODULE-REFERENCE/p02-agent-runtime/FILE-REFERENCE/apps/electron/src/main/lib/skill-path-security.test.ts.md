---
path: apps/electron/src/main/lib/skill-path-security.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 588a6462acb18b5a4d8cec762e6d849ef324f8b2
sha256: 8e30b5ce0f48baae5c8db5a36d6b6f1efd411fbca088d0416b540dee7460af7b
lines: 32
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-path-security.test.ts

## 1. 测试目标

Windows 不可移植名拒绝、Unicode 唯一键、合法 slug 保留。不运行（`NOT_RUN`）。

## 2. 用例清单

3 组（:5/:25/:29），1 describe（:4）：
1. `test.each` 15 个不可移植名拒（:5-23）：CON/nul.md/Com1/COM¹.log/LPT9.backup/CONOUT$/非法字符 7 种/尾点/尾空格→toThrow。
2. Unicode 形式归一（:25-27）：`canonicalSkillSegmentKey('CAFÉ')` toBe `canonicalSkillSegmentKey('cafe\u0301')`。
3. `test.each` 4 合法 slug 保留原值（:29-31）：toBe(slug)（含 ' leading-space'——注意前导空格仅尾空格被禁）。

## 3. 真实断言

`:22`（toThrow×15）、`:26`（toBe）、`:30`（toBe）。

## 4. 未覆盖与脆弱点

未覆盖：safeSkillPath/assertSafeSkillRootChild 越界分支。mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 组/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 拒绝/归一/保留 | 3 组 | covered |
| 越界二函数 | — | unknown |
