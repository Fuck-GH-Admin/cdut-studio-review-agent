---
path: apps/electron/src/main/lib/goal-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e9bec557a378ab4f97f820d87a91d85c93d9989
sha256: e567b2f412ae8fba986194234abbd6ab57894dfbf85773f892c75ae8e4767ad5
lines: 105
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-store.ts

## 1. 结论与边界

Goal 状态 JSON 持久化（schema v2，兼容 v1）：严格校验 + 原子写（temp+rename）+ **损坏文件保护**（`:85-86`："损坏或未知版本不是空仓库：保留原文件，禁止恢复/保存默默覆盖数据"）。4 个导出 + 11 个内部校验函数。

不做的事：不含内存状态机（goal-loop/goal-controller）；不限定文件路径（调用方传入）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `loadGoalStates` | `:72-76` | 读 `payload.goals` → `filter(isGoalState)` → `map(sanitize)`；失败/缺失→`[]` |
| `loadGoalHistory` | `:78-82` | 同上但读 `payload.history`，可按 sessionId 过滤 |
| `saveGoalStates` | `:93-97` | 全量校验（`every(isGoalState)` 否则 throw）→ 写 `{version:2, goals: sanitized, history: 保留}` |
| `archiveGoalState` | `:100-105` | 按 Goal **id 去重归档**（`:99` 注释：不依赖 sessionId live 槽位）；history 追加 |

内部：常量 `CURRENT_SCHEMA_VERSION=2`/`LEGACY=1`/`VALID_STATUSES` 8 态（`:6-8`）；守卫 `nonNegativeInteger/positiveNumber/record/nonEmptyString/evidence/validUsage/validHistoryRecord/isGoalState`（`:12-52`）；`sanitize:54-59`（history 截 `GOAL_HISTORY_LIMIT` 尾 20、v1 elapsedMs 从历史轮次时长求和迁移 `:56-57`、revision 缺省 1）；`readPayload:61-70`（version 白名单 1|2、goals 必须数组）；`writePayload:84-91`（**既有文件不可解析→throw** `:86`、temp+`renameSync` 原子写）。

## 3. 内部逻辑与关键流程

- **校验严格性**（`isGoalState:30-52`）：id/sessionId/goal 非空、status 8 态、iteration/时间戳非负整数、limits（maxIterations/maxConsecutiveFailures 非零、maxDurationMs 正有限、maxTokens 可选非零）、revision/elapsedMs/usage/history/lastEvidence/6 个可选 string 字段/contract 三字段逐类校验。
- **v1 迁移**（`sanitize:56-57`）：elapsedMs 缺省时按历史轮次 `finishedAt-startedAt` 求和（注释：不用墙钟，排除暂停时间）。
- **写保护**：`saveGoalStates` 入参非法 throw 且不动文件；`writePayload` 对损坏既有文件 throw（'Goal 状态文件损坏或版本不受支持，已保留原文件'）。

## 4. 调用者与调用链

`goal-session-service` 的 `readStates/saveStates/archive/history` 依赖（deps 注入）；`goal-loop` 的 `GOAL_HISTORY_LIMIT`（`:4` import）。出向：`@profer/shared` 类型、`./goal-loop`。

## 5. 数据 I/O、读写与副作用

**本地 JSON 文件**：读（readFileSync）、写（writeFileSync temp + renameSync 原子替换）、mkdirSync 递归建目录。无网络。副作用集中于 `writePayload:84-91`。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 文件缺失/损坏/版本不符 | `:61-70` | 读→[]（静默） |
| 既有文件损坏时写入 | `:86` | throw 保留原文件 |
| save 入参非法 | `:94` | throw 不写 |
| archive 非法 state | `:101` | throw |

## 7. 权限与权威状态

schema 校验即权威闸（`isGoalState` 全字段白名单）；归档按 id 去重（`:99`）防重复历史；`sanitize` 的 history 截尾（每 state 最多 20 条）vs 归档 history 数组不限长（`apps/electron/src/main/lib/goal-store.test.ts:118` 25 条全保留——照实：**归档历史不按全局 20 丢弃**）。

## 8. 修改影响面

改校验/迁移影响 v1→v2 兼容与恢复语义；`GOAL_HISTORY_LIMIT` 联动 goal-loop；原子写语义（temp+rename）改动影响崩溃安全。

## 9. 测试证据

直接测试 `goal-store.test.ts`（9 个 `test(`）：round-trip、缺失/损坏→[]、严格 schema+v1 收 1 拒 4、归档幂等+live 保存保归档、坏 history/contract/owner/预算拒收、v1 elapsedMs 迁移 50ms、save 非法不覆盖、损坏文件保留+归档 25 条全留、history 截 20。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出 + 校验/迁移/原子写 | 已证实 | 文件全读 + 9 测试 |
| 损坏保护（读空写抛） | 已证实 | `:86` + `apps/electron/src/main/lib/goal-store.test.ts:107-119` |
| v1 elapsedMs 排除暂停时间 | 已证实 | `:56-57` + 测试 `:86-94` |
| 归档 history 不截尾 vs state history 截 20 的口径差 | 已证实 | `:55` vs `:104` + `apps/electron/src/main/lib/goal-store.test.ts:118` |
| 真实文件路径 | 未知 | 调用方注入（config-paths 侧） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 4 导出 + 11 内部 | §2 | covered |
| 校验/迁移/写保护 | §3/§6 | covered |
| 权威/去重/截尾口径 | §7 | covered |
| 9 测试断言 | §9 | covered |
