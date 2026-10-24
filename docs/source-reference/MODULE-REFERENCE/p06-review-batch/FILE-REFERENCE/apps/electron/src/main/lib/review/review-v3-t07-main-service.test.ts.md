---
path: apps/electron/src/main/lib/review/review-v3-t07-main-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca225e960f1fbe9e835bd1ea65d46161efd4a172
sha256: c705ebae3f9fc29b045af2e9f9fc997f3734e5695ab54ee6e476c3ab006ee3da
lines: 136
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-main-service.test.ts

## 1. 测试目标

T07 桥接层（文件头 `:1`）：身份派生、修订号守卫、持久化与视图投影。被测：`deriveT07Actor`/`initT07MainState`/`applyT07MainAction`/`getT07View`/`readT07RoundSummary`；协作真实 `batch-store.createBatchV2`/`template-store.saveDraft+publishTemplate`/`t07-state-store`。夹具：`PROFER_CONFIG_DIR=mkdtemp(t07-)`（`:7-9`）；`seedPublishedBatch`（`:34-59`）走真实发布校验（量表含合法业务流程）；`initialState`（`:17-32`）被 initT07MainState 忽略（Renderer 兼容项）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**6 test**（`:61-135`）：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:62-65` | organizer → `{actorId:'local-reviewer', role:'organizer', actorSource:'local'}`；`deriveT07Actor(undefined)` 抛 `T07_ACTOR_REQUIRED` |
| 2 | `:67-71` | judge 合法 id 通过；缺 id 抛 `T07_JUDGE_ID_REQUIRED`；`'../etc'` 抛 `T07_JUDGE_ID_INVALID` |
| 3 | `:73-85` | init 后 revision 1（从 0 起步）、磁盘持久（`readT07State`）、2 案卷、**`blindLabel==='匿名项目 001'`**（匿名标签由可信流程生成，非 Renderer）、量表维度 `[quality, impact]` |
| 4 | `:87-95` | `expectedRevision:0` 写入 → `T07_REVISION_CONFLICT`（防并发覆盖） |
| 5 | `:97-123` | 分配→评分落盘（rev 2→3）；judge 视图 `tasks` 只 1 条（只含本人任务）；summary `{round:1, caseCount:2, assignmentCount:1, voted:1, finalized:false}` |
| 6 | `:125-135` | 缺评时 finalize 抛错（沿用 T07 门控） |

## 3. 真实断言

- #3 断言 `blindLabel` 是“匿名项目 001”——Renderer `initialState` 的“案件 A”被忽略的直接反证。
- #4 断言修订号守卫精确错误码。
- #5 断言评委视图任务数（投影过滤）+ summary 五字段。
- `seedPublishedBatch` 走真实 `publishTemplate`（发布校验）。

## 4. 未覆盖与脆弱点

**未覆盖**：`assertRoundFresh` 四分支（量表变化/模板未发布/案卷集变化/批次缺失）；`T07_BATCH_MISMATCH`；`naEligible`/`safeMaterials` 忽略语义；`initT07MainState` 重复初始化拒绝；organizer 建轮次门。

**脆弱点**：`as never` 绕过模板类型；匿名标签序号依赖 round-setup 实现；错误文案断言用错误码。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、6 test、真实 store | 已证实 | `:61`；`grep -c test(`=6 |
| 身份 Main 绑定 | 已证实 | `:62-71` |
| Renderer state 忽略（匿名标签） | 已证实 | `:73-85` |
| CAS 守卫 | 已证实 | `:87-95` |
| 投影/持久/门控 | 已证实 | `:97-135` |
| 新鲜度门分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `deriveT07Actor` | #1/#2 | `:62-71` | covered |
| `initT07MainState` | #3 | `:73-85` | covered |
| `applyT07MainAction` CAS/流程 | #4/#5/#6 | `:87-135` | covered |
| `getT07View`/`readT07RoundSummary` | #5 | `:117-122` | covered |
| `assertRoundFresh` | — | — | unknown |
