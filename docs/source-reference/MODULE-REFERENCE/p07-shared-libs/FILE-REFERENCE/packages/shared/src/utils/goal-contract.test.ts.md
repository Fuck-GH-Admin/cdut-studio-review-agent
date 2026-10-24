---
path: packages/shared/src/utils/goal-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ecc1bd7a75117c00215a4b759eba73a2db4739fb
sha256: 6d2a088bde1a5456ef912feb82a7043ffaaec6b2b9b5b7b69dc7074d4d9a6507
lines: 85
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/goal-contract.test.ts

## 1. 测试目标

Goal 契约（`packages/shared/src/utils/goal-contract.test.ts`）：预算编辑严格解析、`/goal` 命令/契约行解析、`<goal_result>` 剥离、迭代消息/工具名识别。被测 `goal-contract.ts` 7 符号。夹具：内联 `GoalLimitsInput`（`:5`）与合成 `AgentGoalState`（`:27-34`）。

## 2. 用例清单

共 **11 个 `test(`**（2 个 `describe`）：

### D1「Goal 预算编辑解析」（3）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 7-10 | 分钟转毫秒，空 token 保留原限制 | toEqual `{maxIterations:20, maxDurationMs:7200000, maxConsecutiveFailures:3}`；`' 50000 '`+'0.5' 分钟 → toMatchObject `{maxTokens:50000, maxDurationMs:30000}` |
| 2 | 12-24 | 非法/零/负/无穷/不安全整数不可悄悄变不限额 | maxIterations 9 值+maxTokens 5 值+时长 2 值全 toThrow |
| 3 | 26-36 | 只按累计净执行时间与用量检查，不含暂停墙钟 | 3 原因 toHaveLength(3)；`{iteration:1,elapsedMs:100,usage:undefined}` toEqual [] |

### D2「goal contract parsing」（8）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 4 | 33-36 | 子命令大小写不敏感 | `'/goal STATUS'`→status、`'/goal resume'`→resume |
| 5 | 38-42 | 多行目标内子命令词保持 start | type 'start'、goal 含 `'status 页面重做'` |
| 6 | 44-49 | 契约标记提取并移出目标文本 | goal `'优化首屏加载'`、contract 三字段 toEqual |
| 7 | 51-55 | 重复/超长标记取第一条有效值 | 241 字符超长被跳过，`verification` toBe `'第一条有效'` |
| 8 | 57-61 | 无标记目标无 contract | contract toBeUndefined、start 命令 contract undefined |
| 9 | 63-69 | stripGoalResultBlocks 剥机器协议 | 3 断言（含未闭合尾部块 `'正文<goal_result>{"stat'`→'正文'） |
| 10 | 71-76 | isGoalIterationMessage 仅匹配带标消息 | 2 真 2 假（含 null） |
| 11 | 78-82 | isGoalUpdateToolName 认 Claude MCP 与 Pi 名 | 2 真 1 假 |

## 3. 真实断言

逐条见 §2（关键锚）：`:8-9` 双 toEqual/toMatchObject；`:15-23` 16×toThrow；`:34-35`；`:35-36,41,48,54,59-60,65-68,73-76,79-81`。

## 4. 未覆盖与脆弱点

- `parseGoalCommand` 的 `not_goal`/空目标 invalid 分支未单列（隐含于其它用例）。
- 用例 3 的「不含暂停墙钟」语义仅由 `elapsedMs` 字段名承载（无墙钟字段对照断言）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 test/2 describe | 已证实 | 全文 |
| 严校验 16 值拒绝面 | 已证实 | `:15-23` |
| 未闭合块剥离 | 已证实 | `:67` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| parseGoalLimitsInput 严校验 | §2 | 1-2 | covered |
| getGoalBudgetExhaustedReasons | §2 | 3 | covered |
| parseGoalCommand/ContractInput | §2 | 4-8 | covered |
| strip/工具名/迭代消息 | §2 | 9-11 | covered |
| not_goal/空目标 | §4 | — | unknown |
