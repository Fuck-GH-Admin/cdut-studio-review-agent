---
path: apps/electron/src/main/lib/goal-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 62d3daa650df89f711b1a1bd7da0639a5b11e311
sha256: 0a495ef061ae32fcb031eedbcf1b3eecffa029bb4974a3549b66df7bb0994439
lines: 143
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-store.test.ts

## 1. 测试目标

直接测试 goal-store.ts 4 个导出的持久化语义：round-trip、损坏容错、严格 schema（收 v1 拒坏数据）、归档幂等与历史保留、v1 elapsedMs 迁移、写保护。9 个 `test(`，1 个 `describe('goal store')`（`:8`）。真实文件 I/O（mkdtempSync 临时目录），无 mock。

## 2. 用例清单

夹具：`createGoalState`/`DEFAULT_GOAL_LIMITS`（goal-loop，`:6`）；每用例独立 tmpdir + finally 清理。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:9-21` | goal(paused, contract) | save→load | `:16` `toHaveLength(1)`；`:17` `toMatchObject{sessionId,goal:'完成登录页',status:'paused',contract:{verification:'测试通过'},history:[]}` |
| 2 | `:23-36` | 缺失/坏 JSON/坏数据 | load ×3 | `:26`/`:29`/`:32` 全部 `toEqual([])` |
| 3 | `:38-50` | v1 含 4 个坏项（maxIterations:-1/status:'arbitrary'/iteration:'20'/usage 负） | load | `:44` 只存 `goal.id`（`toEqual([goal.id])`）；`:46` version:99→[]；`:48` 无 version→[] |
| 4 | `:52-66` | old(blocked) 双归档 → 新 goal live 保存 | archive ×2 + save→load | `:62` live 仅 `[next.id]`；`:63` history(filter 's') `[old.id]`（幂等去重）；`:64` 'other'→[] |
| 5 | `:68-84` | 6 个坏项（id 空/contract 数字/activeRunId 对象/坏 history×2/lastEvidence 数字） | load | `:82` `toEqual([])`（全拒） |
| 6 | `:86-94` | v1 无 elapsedMs、history 1 条(1000→1050) | load | `:92` `elapsedMs` `toBe(50)`（不含暂停） |
| 7 | `:96-105` | 合法 goal 后 save NaN 预算 | save | `:102` `toThrow()`；`:103` 原文件 `[goal.id]` 保留 |
| 8 | `:107-120` | 坏文件/版本 999/25 次归档 | save/archive/load | `:112` `toThrow('已保留原文件')`；`:113` 原字节 `{broken` 保留；`:115` 版本 999 归档 `toThrow()`；`:118` history `toHaveLength(25)`（**不按 20 截**） |
| 9 | `:122-142` | 40 条 history | save→load | `:137` `toHaveLength(20)`；`:138` `[19].iteration` `toBe(40)`（截尾留新） |

## 3. 真实断言

`toHaveLength`/`toMatchObject`/`toEqual`/`toBe`/`toThrow(文案)`——含文件字节级断言（`:113`）。真实 fs I/O（tmpdir）。

## 4. 未覆盖

- `loadGoalHistory` 无 sessionId 全量分支（用例 4/8 均带 's'）。
- writePayload 的 temp 文件残留/并发写。
- `validUsage` totalTokens 与 input+output 一致性（只校验非负）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 损坏保护/迁移/截尾口径由用例 6/8/9 锁定 | 已证实 | `:86-94`/`:107-120`/`:122-142` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| round-trip | §2 用例 1 | `:9-21` | covered |
| 损坏容错 | §2 用例 2 | `:23-36` | covered |
| schema 严格+v1 | §2 用例 3/5 | `:38-50`/`:68-84` | covered |
| 归档幂等/历史 | §2 用例 4/8 | `:52-66`/`:107-120` | covered |
| v1 迁移 | §2 用例 6 | `:86-94` | covered |
| 写保护 | §2 用例 7/8 | `:96-105`/`:112-115` | covered |
| history 截尾 | §2 用例 9 | `:122-142` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
