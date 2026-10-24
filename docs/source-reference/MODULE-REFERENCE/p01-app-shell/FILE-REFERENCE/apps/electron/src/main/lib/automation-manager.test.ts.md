---
path: apps/electron/src/main/lib/automation-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a4323d0f372af3600e3f896a498d553a3bd6e4cd
sha256: ada082c85e7176a7b2b3dc3b3fb6131b3314250026406d9d45dee5f53cd1d5fb
lines: 166
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/automation-manager.test.ts

## 1. 测试目标

直接测试 `automation-manager.ts` 的 **`computeNextRunAt`（仅此一个导出）**（5 个 describe `:4`/`:71`/`:75`/`:113`/`:141`）。13 个 `test(`，Given-When-Then 中文命名。固定 from 时间戳防时间耦合（`:5`）。

## 2. 用例清单

**月度（6 例 `:9-67`）**：本月未到→20 日；已过→下月同日；**3/31→4/30 不跳 5/1**；**1/31→2/28 非 3/3（setDate(1) 防溢出关键）**；闰年 1/31→2/29；dom=29 平年 2 月→2/28。

**daily 多时间（3 例 `:76-110`）**：今天最近（09:30 起选 14:00）；全过→明天首个；**旧单值 string 兼容**。

**weekly（2 例 `:114-137`）**：周一三多时选最近组合；目标星期时间全过→下周一。

**monthly 多日（2 例 `:142-163`）**：[1,15] 选最近；全过→下月首个。

## 3. 真实断言

`expect(new Date(next).getDate()/getMonth()/getHours()/getMinutes()).toBe(...)`（20 条断言逐行字节核对）。

## 4. 未覆盖（子agent 清单摘要）

once/interval 整条分支（含 scheduledAt 缺失回退/补跑语义）；空数组→DEFAULT_* 回退；'HH:MM' 解析失败回退；monthly dom>当月天数裁剪；CRUD/appendRun/迁移/缓存全无测试（文件名覆盖面不匹配照实）；DST/跨年/时区。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 个 `test(`、断言如 §2 | 已证实 | 文件全读（166 行） |
| 溢出防线（用例 3/4/5） | 已证实 | `:29-57` |
| **照实**：文件名暗示全 manager 覆盖实仅 computeNextRunAt | 已证实 | `:2` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 月度/多值推进 | §2 | covered |
| §4 边缘 | — | — | unknown |
