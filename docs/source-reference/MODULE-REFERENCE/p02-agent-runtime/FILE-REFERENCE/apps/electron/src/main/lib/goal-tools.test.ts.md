---
path: apps/electron/src/main/lib/goal-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bb2915c40e8dbed9210c71b0953aba417f506836
sha256: 588ab16061e6a58b6916c42fc836f2133787ad0eecfd0d433e678d08f6a72d97
lines: 28
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-tools.test.ts

## 1. 测试目标

直接测试 `normalizeGoalToolResult`（goal-tools.ts）：结构化归一、证据清洗、防伪完成拒收、无效报告失败降级。3 个 `test(`，1 个 `describe('goal tools')`（`:4`）。

## 2. 用例清单

无夹具/无 mock/无 IO。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:5-11` | `{status:'complete', summary:'已完成', evidence:['测试通过',42,'  产物已生成  ']}` | normalize | `:10` `toMatchObject{status:'complete', summary:'已完成', evidence:['测试通过','产物已生成'], outcome:'success'}`（数字 42 剔除、trim） |
| 2 | `:13-17` | 三情形 | normalize ×3 | `:14` continue+空白混杂证据→`evidence:['测试通过']` success；`:15` complete+纯空白证据→`{outcome:'failed', evidence:[]}`；`:16` 空 summary→`{outcome:'failed'}` |
| 3 | `:19-27` | `{status:'invalid', summary:42, evidence:'not-array'}` | normalize | `:20` `toEqual{status:'continue', summary:'', evidence:[], outcome:'failed', error:'Goal 报告格式无效或缺少真实证据'}`（全等） |

## 3. 真实断言

`toMatchObject` + `toEqual`（全等含 error 文案）。无快照测试。

## 4. 未覆盖

- evidence 20 条截断。
- `normalizeGoalIterationResult` 别名。
- status='blocked' 路径的 evidence 宽松规则（complete 才要求证据）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 归一+清洗 | §2 用例 1 | `:5-11` | covered |
| 证据/摘要校验 | §2 用例 2 | `:13-17` | covered |
| 无效报告降级 | §2 用例 3 | `:19-27` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
