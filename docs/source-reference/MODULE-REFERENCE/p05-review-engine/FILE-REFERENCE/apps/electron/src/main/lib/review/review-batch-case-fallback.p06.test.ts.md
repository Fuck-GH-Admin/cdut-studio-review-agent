---
path: apps/electron/src/main/lib/review/review-batch-case-fallback.p06.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b012e2b3c9eb7472415ed4803763fbe96e9adab
sha256: 11262aacc1205aeb1a3c0b280c484322ed2a4b627ba3a19a3dc91db7cd89f78a
lines: 50
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-batch-case-fallback.p06.test.ts

## 1. 测试目标

P06：**零 subject 案卷的 live 批量语义结果**——工具结果在无 subjectIds 时仍完整、未提交时 fail-closed（`apps/electron/src/main/lib/review/review-batch-case-fallback.p06.test.ts:5`）。被测对象 `v2-executor-factory.ts` 的 `assembleV2Executors`（无同名源模块；独立测试入口）。

夹具（`:20-50`）：合成 `CaseAggregateV2`（`subjects:[]`、stage `'submitted'`）+ 合成 `TemplateVersion`（单 criteria `budget`，execution `'semantic'`，targetScope 参数化）+ fake client（runtime 'pi'/protocol 'openai-chat'，`complete` 内调用**真实** `submit_check` 工具处理器，`:35-46`）。mock 边界：client.complete 是内存替身；`submit_check` 工具实现是真实装配产物。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`；前 2 个由 for 循环参数化 scope='case'/'group'）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1-2 | 6-12（循环） | `${scope} tool result remains complete without subject IDs` | scope=case/group、submit=true | `execute(scope,true)` | 独立 |
| 3 | 13-17 | unsubmitted case result still fails closed | scope=case、submit=false | `execute('case',false)` | 独立 |

## 3. 真实断言

- `:9-10` `expect(checks).toHaveLength(1)`、`checks[0]?.status` toBe `'awaiting-confirmation'`。
- `:15-16` `toHaveLength(1)`、`checks[0]?.status` toBe `'execution-failed'`。

工具调用细节（非断言但为链路事实）：`tool.execute({ruleId:'section-all-budget', scope, subjectIds:[], status:'awaiting-confirmation', reason:'合成待确认', sourceRefs:[]})`（`:41`），`result.ok` 否则抛（`:42`）。

## 4. 未覆盖与脆弱点

- 仅 3 个状态锚（`awaiting-confirmation`/`execution-failed`）；`compliant`/`not-executed` 等未测。
- `summarize` 返回 `result.artifact?.checks ?? []`（`:49`），artifact 缺失时静默空数组——未测。
- `group` scope 的未提交路径未测（for 循环只对 submit=true 展开）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test（2 循环+1）、合成夹具 | 已证实 | `:5-50` |
| 零 subject 仍完整 | 已证实 | `:6-12` |
| 未提交 fail-closed | 已证实 | `:13-17` |
| 测试通过与否 | 未知 | NOT_RUN |
| assembleV2Executors 全貌 | 未知 | 批外 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 零 subject 提交（case/group） | §2/§3 | 1-2 | covered |
| 未提交 fail-closed | §2/§3 | 3 | covered |
| 其它状态/artifact 缺失 | §4 | — | unknown |
