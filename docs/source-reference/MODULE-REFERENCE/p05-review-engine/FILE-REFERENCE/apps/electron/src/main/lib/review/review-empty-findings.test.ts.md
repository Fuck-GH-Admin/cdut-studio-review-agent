---
path: apps/electron/src/main/lib/review/review-empty-findings.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a3849823cd75fc89291c89e57720e87d6f0dbef8
sha256: 792264e51ff207030a3769e72e2a8360ce4e972be4882f6ed779611346968301
lines: 47
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-empty-findings.test.ts

## 1. 测试目标

M0/H04/H13：合法空发现 + 外案 itemId 拒收 + 分值守门（`parseFindings` 级，`apps/electron/src/main/lib/review/review-empty-findings.test.ts:2`）。被测对象 `ai-review-service.ts` 的 `parseFindings`（无同名源模块）；分值守门部分是**直测依据确认态判断语义**（`:42` 注释：runAiReview 守门逻辑经 run 集成验证）。

夹具：`buildDemoCase()` + `resolveDomainPack('comprehensive-assessment')`（真实领域包，`:9`）。

## 2. 用例清单

共 **5 个 `test(`**（2 个 `describe`）：

| # | 行 | describe / 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 12-15 | parseFindings / 合法空数组 → 空发现（不抛错不降级 mock） | `[]` | `parseFindings([], reviewCase, pack, false)` | 独立 |
| 2 | 17-21 | 全部发现引用不存在事项 → 抛错（垃圾输出不冒充零问题） | 1 条假 itemId | `expect(()=>…).toThrow('缺少合法项')` | 独立 |
| 3 | 23-33 | 混合输出 → 仅保留合法项 | 1 假 1 真 | parseFindings | 独立 |
| 4 | 35-37 | 非数组输出 → 抛错（失败路径） | `{nope:true}` | parseFindings | 独立 |
| 5 | 41-46 | 分值守门 / 依据未确认 → suggestedScore 被剥离 | rulePacks confirmed:false | **仅断言夹具布尔**（`:45`） | 独立 |

## 3. 真实断言

- `:14` `expect(parseFindings([], reviewCase, pack, false)).toEqual([])`。
- `:20` `expect(()=>parseFindings(foreign,…)).toThrow('缺少合法项')`。
- `:31-32` `expect(findings).toHaveLength(1)`、`findings[0].itemId` toBe 真实 itemId。
- `:36` `expect(()=>parseFindings({nope:true},…)).toThrow()`（无文案锚）。
- `:45` `expect(unconfirmed.rulePacks.some(p=>p.confirmed)).toBeFalse()`。

## 4. 未覆盖与脆弱点

- 用例 5 **不断言 suggestedScore 剥离本身**——只断言夹具 confirmed 全 false（`:42` 注释自认：守门逻辑在 runAiReview 集成面）。标题所述「suggestedScore 被剥离」在本文件无对应断言（照实记录）。
- `toThrow()`（`:36`）无文案锚。
- severity 分值守门（H13）的数值面未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 test/2 describe | 已证实 | `:11,40` |
| 空数组合法、垃圾全假抛错、混合过滤 | 已证实 | `:14,20,31-32` |
| 用例 5 只测夹具不测剥离 | 已证实 | `:41-46` |
| 测试通过与否 | 未知 | NOT_RUN |
| runAiReview 分值守门 | 未知 | 集成面批外 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| parseFindings 空/全假/混合/非数组 | §2/§3 | 1-4 | covered |
| 分值守门 | §2/§4 | 5 | partial（仅夹具） |
