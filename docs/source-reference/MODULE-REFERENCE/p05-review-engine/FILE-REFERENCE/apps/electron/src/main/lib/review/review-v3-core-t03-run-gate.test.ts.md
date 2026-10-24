---
path: apps/electron/src/main/lib/review/review-v3-core-t03-run-gate.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5da151c023e564752418d02f7bb969087e1ffa51
sha256: d6d2159d4f5ef546fa797c438a63bfc3c4e2382052a8b70f94ffc8eb36179f75
lines: 232
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-core-t03-run-gate.test.ts

## 1. 测试目标

验证 `review-v3-core-t03-run-gate.ts` 的 `assessT03RunAction`（全分支）与 `selectT03CurrentRun`：真实 Run 身份、输入快照、检查账本、stage-pass 逐 check 分支、人工处置/例外、无 Run 只可补件。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 16（`test(` :62/:69/:77/:94/:111/:118/:125/:132/:140/:158/:167/:174/:191/:196/:205/:214），1 describe（:61）。fixture：`aggregate()`（:11-20）、`check()`（:22-32）、`run()`（:34-53，coverage 自动算）、`evidence()`（:54-55）、`gate()` 包装（:56-59）。

| # | 用例（行） | 断言要点 |
| --- | --- | --- |
| 1 | 合法 stage-pass（:62） | allowed/runCurrent true、blockers 空（:64-66） |
| 2 | 21 人不合规（:69） | stage-pass 拒 + nonCompliantCheckIds `['headcount']`；final-reject/return-to-previous-stage 放行（:71-75） |
| 3 | 模板例外（:77） | 全字段例外放行；空 policyVersionId/reason 拒（:79-92） |
| 4 | 文档增删改哈希（:94） | 三形态均拒、blockers 含「原件」（:105-109） |
| 5 | documentId 换绑（:111） | 拒（:114） |
| 6 | effectiveVerdicts 计数（:118） | 0≠1 拒（:121） |
| 7 | 缺证据三负例（:125） | inputSnapshotFresh false、evidence undefined、缺省参数三种均拒（:127-130） |
| 8 | Run 身份（:132） | caseId 不符、`run@rev-4` 假 Run、templateVersion 9 均拒（:134-138） |
| 9 | CanonicalPlan（:140） | 缺指纹拒/错指纹拒/unknown-check 拒/正确组合放行（:152-156） |
| 10 | 零检/duplicate/分母（:158） | 零检拒、manualOnly 放行、dup 拒、分母不一致拒（:160-165） |
| 11 | pending 四态+partially-completed（:167） | 均拒（:169-172） |
| 12 | 人工处置（:174） | 具名处置放行；runId 不符拒（:176-189） |
| 13 | not-applicable/补件（:191） | 空 reason 拒；responded 补件拒（:193-194） |
| 14 | 无 Run（:196） | 仅 return-for-supplement 放行；stage-pass/final-reject 拒（:198-203） |
| 15 | 输入顺序无关（:205） | 乱序文档集仍放行（:211） |
| 16 | selectT03CurrentRun（:214） | 选 `run-old` 不选 stale；缺证明返回 undefined（:220-229，动态 import :215） |

## 3. 真实断言

- `:64-66`：`expect(result.allowed).toBe(true)`、`runCurrent true`、`blockers` toEqual([])。
- `:71-75`：allowed false、`nonCompliantCheckIds` toEqual、reject/return allowed true。
- `:79-92`：两次 `allowed` true/false。
- `:105-109`：`result.blockers.join()` toContain('原件')。
- `:114/:121/:127-130/:134-138/:152-156/:160-165/:169-172`：allowed false/true 逐点。
- `:176-189`：`toBe(true)` / `toBe(false)`（stale runId）。
- `:193-194`：两次 false。
- `:198-203`：noRun 三动作 true/false/false。
- `:211`：`toBe(true)`。
- `:226`：`expect(selected?.id).toBe('run-old')`；`:229`：`toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`manualOnlyTemplate` 与 `expectedCheckIds` 并存、`nonCompliantCheckIds` 空值形态、disposition `findingKey===ruleId` 分支（:146）、blockers 文案全文。
- 脆弱点：`:127-130`/`:198-203` 需绕过默认参数直调被测函数（注释 :126/:197 说明）；`as unknown as CaseAggregateV2` fixture 形状漂移不报编译错。
- mock 边界：纯函数 + 最小字面量 fixture，无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例计数与 `test(` 一致 | 已证实 | :62-214 |
| 断言行如 §3 | 已证实 | 逐行读 :62-229 |
| 全分支（含冲突/防御）被断言 | 已证实 | #1-#16 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 身份/快照/账本 | #1-#10 | covered |
| stage-pass 逐 check 分支 | #2/#3/#11-#13 | covered |
| 无 Run/顺序无关 | #14/#15 | covered |
| `selectT03CurrentRun` | #16 | covered |
| manualOnly+expected 并存/findingKey=ruleId | — | unknown |
