---
path: apps/electron/src/main/lib/review/decision-readiness-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0a4fa075ed234b4f6f72488190f9cd1765a0fd6b
sha256: 7e20e510f4de931818a0854d04afdabb268ebd62f0c4d24f3ac8f4e3a6de98d2
lines: 149
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/decision-readiness-v2.test.ts

## 1. 测试目标

“UI/服务端统一的最终决定就绪判断”回归（describe `:18`）：验证 `@profer/shared` 的 `assessDecisionReadiness`（定义 `packages/shared/src/review/decision-readiness-v2.ts:35`）在缺事项认定、未确认规则相关事实、未读/解析失败/部分读取材料、跨案/错绑证据、零有效规则、覆盖缺结果等场景下如实阻断，并在人工豁免/确认核对后放行。被测函数来自 shared 包，本文件是其在 p04 侧的直接测试载体（文件落在 `apps/electron/src/main/lib/review/`）。

夹具（`:5-16`）：内存对象构造器 `aggregate(overrides)`（subject `s1`、stage `reviewing`）、`run(overrides)`（`effectiveRuleIds:['rule-a']`、1 条 compliant check、`plannedChecks:1`）、`accepted` 认定（`s1/accepted/basedOnRunId:'r1'/inputHash:'h1'`）。无文件 I/O、无 mock 框架。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**12 个 test**：

| # | test 行 | 设置 | 断言 |
| --- | --- | --- | --- |
| 1 | `:19-28` | 文档 usage `unread`、规则依赖 `level`、观测未确认、无认定 | blockers kinds 含 `missing-adjudication`、`unconfirmed-fact`、`unread-material`；`ready===false` |
| 2 | `:30-39` | 文档 usage `registered` 但 run.coverage 标 `read`、有认定 | 精确 `{ready:true, blockers:[]}` |
| 3 | `:41-50` | 解析失败 + 空占位块 + usage `read`，run.coverage `unread` | blocker `{kind:'unread-material', id:versionId}` |
| 4 | `:52-62` | 解析失败 + blocks 空 + usage `registered`，run.coverage 误标 `read` | 仍阻断 `unread-material`；`ready===false` |
| 5 | `:64-74` | check 的 sourceRef `caseId:'another-case'` | blocker `{kind:'unresolved-check', id:'check-a'}`，message 含“材料引用不属于当前案卷” |
| 6 | `:76-90` | 材料经 `evidenceLinks` 归属 `s2`（confirmed/user），check 引用同版本 | blocker 同上，message 含“归属其他事项” |
| 7 | `:92-101` | 解析失败 + `manualReadReceipt{actorId:'reviewer',…}` | **无** `unread-material` blocker（`some(...)===false`） |
| 8 | `:103-112` | 解析失败 + `unusedReason:'[审核员忽略] …'` | **无** `unread-material` blocker |
| 9 | `:114-124` | run.coverage `partially-read` + reason“…1/4 个材料块” | blocker `unread-material`，message 含该 reason |
| 10 | `:126-133` | 未确认观测 fieldKey `hobby`（非规则相关）+ `waived` 处置 + 认定 | 精确 `{ready:true, blockers:[]}` |
| 11 | `:135-138` | `effectiveRuleIds:[]`、checks 空 | blocker kind `zero-effective-rules` |
| 12 | `:140-148` | `plannedChecks:2` 但只有 1 条 check | blocker `{kind:'unresolved-check', id:'coverage:missing-results'}`；`ready===false` |

## 3. 真实断言

- #1 用 `expect.arrayContaining` 断言三种 blocker kind 同时存在（`:26`）。
- #2/#10 用 `toEqual({ready:true, blockers:[]})` 精确相等（无多余 blocker）。
- #3/#4/#9 断言 blocker 对象 `objectContaining({kind:'unread-material', id:…})`，#9 还断言 message 含运行账本的读取范围 reason。
- #5/#6 断言 message 中文子串区分“跨案引用”与“归属其他事项”。
- #7/#8 用 `toBeFalse()` 断言**不存在**该 blocker——覆盖人工 `manualReadReceipt` 与 `[审核员忽略]` 两条解除路径。
- 夹具字段刻意真实：`parseStatus:'failed'`+`parseError`、`usage` 各态、`coverage.documents[].status ∈ {read,unread,partially-read}`、`evidenceLinks` 形状（`:82`）。

## 4. 未覆盖与脆弱点

**未覆盖**（`assessDecisionReadiness` 的其它分支，按冻结树 `packages/shared/src/review/decision-readiness-v2.ts` 检索）：`runStale:true` 的阻断、`open-supplement` kind（在 `workspace-business-service-v2.test.ts:182-184` 间接覆盖）、材料槽（`template.materialSlots`）缺口 blocker、`missing-adjudication` 多事项列举、跨 subject 的 sourceRefs 归属细节、`effectiveRuleDependencies` 多字段、blocker 文案的其余分支。

**脆弱点**：

- #1 的三种 kind 同时断言依赖夹具三重缺失恰好并存；若实现把某类降为 warning 会红。
- #5/#6 断言中文 message 子串（“材料引用不属于当前案卷”“归属其他事项”）。
- 该测试文件在 p04 目录但测 shared 函数；若 shared 的该文件归属 p07 批次复核，需注意“同一函数、两个测试载体”的边界（`workspace-business-service-v2.test.ts` 亦有 2 处调用）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 test、纯内存夹具 | 已证实 | `:5-16`；无 fs/网络 import |
| 解析失败材料的两条人工解除路径 | 已证实 | `:92-112` |
| run 账本 read 不能解除解析失败原件 | 已证实 | `:52-62` |
| 跨案/错绑来源阻断 | 已证实 | `:64-90` |
| 零有效规则/覆盖缺结果阻断 | 已证实 | `:135-148` |
| `partially-read` 保留读取范围原因 | 已证实 | `:114-124` |
| runStale/材料槽/open-supplement 分支 | 未知 | 本文件未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支（`assessDecisionReadiness`） | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| missing-adjudication / unconfirmed-fact / unread-material | #1 | `:19-28` | covered |
| run 账本 read 放行 | #2 | `:30-39` | covered |
| 解析失败占位块不放行 | #3 | `:41-50` | covered |
| 解析失败+账本误标 read | #4 | `:52-62` | covered |
| 跨案引用 | #5 | `:64-74` | covered |
| 归属其他事项 | #6 | `:76-90` | covered |
| manualReadReceipt 解除 | #7 | `:92-101` | covered |
| 审核员忽略解除 | #8 | `:103-112` | covered |
| partially-read | #9 | `:114-124` | covered |
| 非规则相关事实+豁免 | #10 | `:126-133` | covered |
| zero-effective-rules | #11 | `:135-138` | covered |
| coverage:missing-results | #12 | `:140-148` | covered |
| runStale / materialSlots / open-supplement | — | — | unknown（部分间接） |
