---
path: apps/electron/src/main/lib/goal-update-validation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ea303bee615857e7a14742f9f1bc02149383ff4
sha256: 2ee968361583fecb56bb4f96072206f31895a3afe2ca87bcd64abba24c3bf91a
lines: 44
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-update-validation.ts

## 1. 结论与边界

Goal 更新 IPC 入参校验（:9 注释：IPC 来自 renderer，修改目标前统一验证）：白名单字段+文本/数值边界。

## 2. 导出与关键符号

导出 2 条（`export` :3/:10）：`GoalUpdatePatch`（:3-7，goal?/contract?/limits?）、`validateGoalUpdatePatch(value)`（:10-44）。

## 3. 内部逻辑与关键流程

（:10-44）：非对象/数组拒（:11）；**未知字段拒**（:13）；goal 空或 >20000 拒（:16）；contract 未知字段拒（:22）+三键文本 ≤10000（:24-29）；limits 未知字段拒（:34）+四键安全正整数（`Number.isSafeInteger&&>0`，:39）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `goal-session-service.ts:6` → 调用 `:152`（GoalSessionService 由 ipc.ts:329 消费）；测试 `goal-update-validation.test.ts:2`。出向：仅类型 import（:1）。

## 5-7. 数据/分支/权限

纯校验；白名单=权限边界（防 renderer 注入未知字段）。

## 8. 修改影响面

Goal 更新 IPC。需同步测试（16 行）。

## 9. 测试证据

`goal-update-validation.test.ts`（批内，1 describe/2+9 用例，NOT_RUN）：有效契约+预算（:5-7）、非法预算 7 值表驱动拒（:8-10）、非法结构 8 形态拒（:11-15）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；白名单+边界 | 已证实 | :10-44 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| validateGoalUpdatePatch 全分支 | §2/§3 | :10-44 | covered |
