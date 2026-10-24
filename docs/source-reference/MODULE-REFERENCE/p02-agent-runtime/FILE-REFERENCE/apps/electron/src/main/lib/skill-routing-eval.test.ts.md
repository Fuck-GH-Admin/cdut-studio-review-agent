---
path: apps/electron/src/main/lib/skill-routing-eval.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5559b72511a8d65e4255e581f275d32cc8379dff
sha256: 007af42625d14b211a702d3343efb35704ddb932e9d16fb347b9de90da1dd3bc
lines: 45
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-routing-eval.test.ts

## 1. 测试目标

`skill-routing-rules.skillTaskMatch` 的**离线路由评测集**（`:4` 注释红线：这些指标衡量确定性推荐，**不冒充真实模型采用率**）。

## 2. 用例清单

**29 个参数化用例 + 1 个组合用例 = 30 个 `test()`**：

- 应推荐（15）：code-honor ×3、brainstorming、writing-plans、agent-collaboration ×2、automation ×2、in-app-browser、pdf ×2、docx、xlsx、pptx（`:6-20`）。
- 不应推荐（14）：寒暄/疑问/NOT_CODE/否定保护/注入块/代码围栏/无信息主题（`:21-33`）。
- 组合用例（`:40-44`）：自定义关键字单词边界（'internet' 不命中 'net'、'run net check' 命中）、excludeKeywords 优先。

## 3. 真实断言

- 参数化：`expect(Boolean(skillTaskMatch(slug, task, {}))).toBe(expected)`（`:38`）。
- `:41` `'internet'`+keywords:['net'] → `toBeUndefined()`；`:42` `'run net check'` → `toBe('configured-keyword')`；`:43` excludeKeywords:['不要'] 优先 → `toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`BUILTIN_SKILL_DEPENDENCIES`/requiredTools 系（路由层测试覆盖）；真实语料命中率（评测集为手工样本）。
- 脆弱点：样本与正则耦合（规则改动需同步评测集）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 30 用例如 §2-3 | 已证实 | 逐行读 `:1-45` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 九 slug 正向 | 15 | covered |
| 否定保护/脏输入 | 14 | covered |
| 关键字边界/排除 | 1 | covered |
