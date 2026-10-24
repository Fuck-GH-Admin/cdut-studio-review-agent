---
path: packages/shared/src/utils/goal-contract.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 860fe14f382bd40eb1aa388734db4c717d3e4033
sha256: 711788ad0a6620d2e4fde5c6912497b844777e2ea91fdb4ca83d1150f1297ac2
lines: 117
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/goal-contract.ts

## 1. 结论与边界

Goal 契约解析的 **renderer/main 共用唯一实现**（`packages/shared/src/utils/goal-contract.ts:48`）：`/goal` 命令解析（Codex 式 `@verify/@constraint/@stop` 契约行标记，沿用 pi-harness @verify/@artifact 声明式行标记传统，`:50-56`）、表单预算严格解析、预算耗尽原因、`<goal_result>` 剥离、goal 控制消息识别。

边界：预算解析为展示/恢复前检查，**运行准入最终裁决仍由主进程 Controller 负责**（`:32`）；标记行不进 goal 文本（`:55`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `GoalLimitsInput` | interface | 3-8 | 四字符串字段（表单态） | |
| `parseGoalLimitsInput` | function | 11-29 | `(input) => Partial<AgentGoalLimits>` | 严格十进制 |
| `getGoalBudgetExhaustedReasons` | function | 35-41 | `(goal: AgentGoalState) => string[]` | 三上限检查 |
| `parseGoalCommand` | function | 58-72 | `(input) => AgentGoalCommand` | not_goal/invalid/start/五子命令 |
| `parseGoalContractInput` | function | 78-94 | `(text) => {goal; contract?}` | 契约行分离 |
| `stripGoalResultBlocks` | function | 100-102 | `(text) => string` | 剥 `<goal_result>`（含未闭合） |
| `GOAL_UPDATE_TOOL_NAME` | const | 104 | `'update_goal'` | |
| `isGoalUpdateToolName` | function | 107-109 | 本名或 `mcp__goal__` 前缀 | |
| `isGoalIterationMessage` | function | 112-115 | `_goalIteration != null` 判定 | |

内部：`GOAL_SUBCOMMANDS=['status','pause','resume','stop','clear']`（`:44`）。

## 3. 内部逻辑与关键流程

- `parseGoalLimitsInput`（`:11-29`）：正整数严校验（`^\d+$`+SafeInteger+>0，拒绝截断/溢出/**非法值静默当无限额**，`:9`）；时长分钟数允许小数→毫秒（非负 SafeInteger）；**maxTokens 留空=保留已有上限**（避免删表单文字被当作取消授权，`:26`）。
- `getGoalBudgetExhaustedReasons`（`:35-41`）：轮次/净运行时长（`elapsedMs ?? 0`）/Token（`usage?.totalTokens ?? 0`）三上限中文原因。
- `parseGoalCommand`（`:58-72`）：`/goal` 前缀判定（不匹配 → `not_goal`）；空目标 → invalid；单行五子命令（小写匹配）；纯字母未知 → invalid；否则 `parseGoalContractInput` 分离契约，无目标行 → invalid，否则 `start`。
- `parseGoalContractInput`（`:78-94`）：正则 `@(verify|constraint|constraints|stop):\s*(\S.*)` 逐行；**每类取第一条有效行且 ≤240 字符**（`:76`）；其余行并入 goal 文本；无契约 → `contract: undefined`。
- `stripGoalResultBlocks`（`:100-102`）：正则剥 `<goal_result>…(闭合|$)`（未闭合一并剥，`:99`）+ 3+ 换行压缩 + trimEnd。

## 4. 调用者与调用链

出向：`../types/agent`（4 类型，`:1`）。入向（检索=符号名+模块名，全冻结树）：

- `parseGoalCommand`：`apps/electron/src/main/lib/goal-loop.ts:1`（**别名 `parseGoalCommandShared`**，包转本地同名函数 `:14`）、`renderer/components/agent/AgentView.tsx:156,2188`、本批测试。
- `parseGoalLimitsInput`：`GoalStatusBar.tsx:4,115`；`getGoalBudgetExhaustedReasons`：`GoalStatusBar.tsx:121-127,207`、`renderer/atoms/goal-atoms.ts:3,70`。
- `stripGoalResultBlocks`：`ContentBlock.tsx:45,771`。
- `isGoalUpdateToolName`：`tool-utils.ts:7,118`；`GOAL_UPDATE_TOOL_NAME`：`goal-tools.ts:1`（仅 import 无使用行——照实记录）。
- `isGoalIterationMessage`：**packages/session-core** `group.ts:16,55,114,267`、`transcript.ts:10,103` + renderer `AgentMessages.tsx:50,779`、`SDKMessageRenderer.tsx:16,389,1131,1705,1741`。
- `parseGoalContractInput`：仅测试+内部（`goal-loop.test.ts` 间接 16 test）；`GoalLimitsInput` 零外部引用。
- **同名碰撞警示**：`parseGoalCommand` 在 goal-loop.ts:14 有本地包装（shared 版已别名）。
- 产品入口：main（goal-tools/goal-loop）+ renderer（7 处）+ **packages/session-core**；preload/core/cli 无。
- 测试：`goal-contract.test.ts`（本批 11 test）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯解析函数。

## 6. 分支、失败、取消与恢复

失败= `Error`（预算解析，带中文文案）或 `invalid` 命令态；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；注释权威声明（`:32`）：最终裁决在主进程 Controller——本模块只做展示/恢复前检查。

## 8. 修改影响面

- 契约行语法（`:77`）与预算严校验是 goal 子系统跨端契约（renderer/main/session-core 三端共享）。
- 测试：本批 11 test + 批外 goal-loop.test 16 test。

## 9. 测试证据

直接测试 `packages/shared/src/utils/goal-contract.test.ts`（本批，85 行/11 test，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 严格十进制防截断/溢出/静默无限额 | 已证实 | `:9,12-17` |
| maxTokens 留空=保留授权 | 已证实 | `:26-27` |
| 契约行 ≤240+首条语义 | 已证实 | `:76-90` |
| 未闭合 goal_result 剥离 | 已证实 | `:99-102` |
| `parseGoalContractInput`/`GoalLimitsInput` 零产品引用、`GOAL_UPDATE_TOOL_NAME` 死 import | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 goal 流程行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 导出 | §2 | 3-115 | covered |
| 预算解析 | §3 | 11-29 | covered（11 test 锚） |
| 命令/契约解析 | §3 | 58-94 | covered |
| 剥离/工具名/迭代消息 | §3 | 100-115 | covered |
