---
path: apps/electron/src/main/lib/goal-loop.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2cec122d035891dd71d82999667f5ebe817f735d
sha256: 1eae31af028ac84e5596758046b793dfaada8bb21c90f4391f5cc0bcab78361f
lines: 137
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-loop.ts

## 1. 结论与边界

Goal **循环纯函数层**：预算常量、命令解析桥、单轮迭代 prompt 组装（Codex 式 plan→act→verify→review）、状态工厂、续跑裁决（`evaluateGoalContinuation`）、结果协议解析、进程退出语义。全部纯函数/常量，无状态无 I/O。

不做的事：不含调度/状态机（goal-controller）；命令解析唯一实现已收敛 `@profer/shared`（`:13` 注释：本文件 `parseGoalCommand` 仅兼容既有 import）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `DEFAULT_GOAL_LIMITS` | `:4-8` | `{maxIterations:20, maxConsecutiveFailures:3, maxDurationMs:2h}` |
| `GOAL_HISTORY_LIMIT = 20` | `:11` | 历史保留上限 |
| `parseGoalCommand` | `:14-16` | 委托 `@profer/shared` |
| `buildGoalIterationPrompt` | `:22-59` | 单轮 prompt：目标+契约三行（verify/constraint/stop，`:34-36`）+ 轮次/剩余预算（`:37`，"预算不足不等于完成，不得缩小目标"）+ token 预算（`:38`）+ 上轮摘要（`:39`）+ 近 3 轮轨迹（`:40-46`，summary 截 200 字）+ 工作方式五段（`:47-57`，含 `update_goal` 报告要求与"不得冒充 complete"） |
| `createGoalState` | `:61-77` | 空状态工厂（id `crypto.randomUUID`、status 'active'、revision 1、elapsedMs 0） |
| `goalBudgetReason` | `:79-84` | 预算判定：时长→轮次→token（`:80-82`），返回理由或 undefined |
| `evaluateGoalContinuation` | `:86-102` | 续跑裁决（见 §3） |
| `parseGoalIterationResult` | `:104-125` | `<goal_result>` JSON 协议解析（见 §3） |
| `stopGoalForProcessExit` | `:127-129` | → `stopped`/`process_exit` |
| `pauseGoalForProcessExit` | `:135-137` | → `paused`/`app_restart`（`:131-134` 注释：不判死刑，重启后显式 resume） |

## 3. 内部逻辑与关键流程

**续跑裁决序**（`evaluateGoalContinuation:86-102`）：①deferred→deferred（不计失败）；②stopped→stopped；③`hasEvidence`（非空字符串证据）；`failed = turnFailed || outcome==='failed' || (非blocked且无证据)`（`:93`）；④非失败+complete→complete（**:95 注释：完整最后一轮仍可完成**）；⑤非失败+blocked→blocked；⑥预算判定→limit_reached；⑦`failures>=maxConsecutiveFailures`→failed；⑧否则 continue（`failures` 累计或清零）。

**协议解析**（`parseGoalIterationResult:104-125`）：正则抓 `<goal_result>…</goal_result>`（`:107`），**从尾向前**取第一个 status 合法的 JSON 块（`:108-111`，避开 prompt 里的协议示例——`:105-106` 注释）；证据清洗同 goal-tools；有块但全失败→continue+"解析失败"文案（`:121-123`）；无块→尾 2000 字摘要（`:124`）。

## 4. 调用者与调用链

`goal-session-service`（buildGoalIterationPrompt/`goal-loop.test` 全量）、`goal-controller`（createGoalState/evaluateGoalContinuation/goalBudgetReason/GOAL_HISTORY_LIMIT）、goal-store（GOAL_HISTORY_LIMIT）。出向：`@profer/shared`（parseGoalCommandShared/类型）。

## 5. 数据 I/O、读写与副作用

全纯函数；无 I/O。`createGoalState` 用 `crypto.randomUUID()`（`:63`）。

## 6. 分支、失败、取消与恢复

进程退出双语义（`:127-137`）：`stopGoalForProcessExit`（显式停）/`pauseGoalForProcessExit`（降级暂停可恢复）；deferred/stopped 早退（`:90-91`）。

## 7. 权限与权威状态

- **防伪完成**（prompt `:55`）："只有逐项验收完成且 evidence 包含非空真实证据时才允许 complete；预算不足保持诚实的未完成报告，不得冒充 complete"。
- **协议解析防欺骗**（`:105-106`）：从尾部取真实报告，prompt 内示例（status 值 "continue|complete|blocked"）因 status 非法被跳过。
- 预算语义（`:26` 注释）：调用方进本轮前自增轮次；暂停/空闲不耗预算。

## 8. 修改影响面

`evaluateGoalContinuation` 判定序改动影响失败计数/预算闸/伪完成防线；prompt 文案改动影响 Agent 行为（协议要求段）；`GOAL_HISTORY_LIMIT` 联动 store/controller；`DEFAULT_GOAL_LIMITS` 是全链默认预算。

## 9. 测试证据

直接测试 `goal-loop.test.ts`（16 个 `test(`）：命令/契约解析、非法命令、prompt 携带契约预算历史且不含 `<goal_result>`、缺契约要求验收面、进程退出暂停、协议取真报告、跳过坏块、状态工厂、续跑五分支、最后轮 complete 优先/空白证据不能完成、token 耗尽与 stopped/deferred 独立、失败记账、进程退出 stopped。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出、裁决序、协议解析防欺骗 | 已证实 | 文件全读 + 16 测试 |
| 预算不耗暂停时间 | 已证实 | `:26`、`:29`（elapsedMs 口径） |
| prompt 协议段文案 | 已证实 | `:55` |
| shared 解析实现 | 未知 | @profer/shared 不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 8 导出全量 | §2 | covered |
| 裁决序/协议解析 | §3 | covered |
| 防伪红线 | §7 | covered |
| 16 测试断言 | §9 | covered |
