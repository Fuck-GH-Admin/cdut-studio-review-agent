---
path: apps/electron/src/main/lib/remote-service-exploration-session.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 585280a9262b2198c35fcdc15b957b09978cb18b
sha256: 0cbf0c83fb5631ae0bab4fe3f811ea328ddf86151c51b579fd6b926c8febc457
lines: 132
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-service-exploration-session.test.ts

## 1. 测试目标

跨端同步波次·工作线 A（桌面侧）代码级验证（`:11-18`）：T1 `buildSessionItem` 探索血缘三字段下沉（验收 A-1）；T2 `create_exploration_session` 参数校验与错误语义（A-7/A-8 错误面）。**真机端到端（A-6/A-9）双端联调补充，不伪造**（`:18`）。

## 2. 用例清单

3 个 describe + **11 个 `test()`**：血缘透传 3（`:32-67`）、`normalizeExplorationSourceLabel` 4（`:71-93`）、`create_exploration_session` 4（`:97-131`）。

## 3. 真实断言

- `:41-44` 三字段（parentSessionId/sourceMessageId/sourceLabel）透传；**`explorationTitleInitializedAt`（内部守卫）不得下发**（`:37-38/:44`）。
- `:49-56` 普通会话/普通 fork 探索字段 undefined（防误判）。
- `:64-66` 委派血缘独立不受影响。
- `:72-92` 标签归一：非串/空白→缺省、空白折叠（'文件 ·\n main.ts'→'文件 · main.ts'）、**>120 截断**（恰好 120 不截，防超长随 session_updated 反复广播 `:83`）。
- `:99-115` 命令已注册（报参数错误非'未知指令'）；缺 upToMessageUuid/纯空白均 '缺少 sessionId 或 upToMessageUuid'。
- `:129-130` 源会话不存在 → 透传中文错误 '源 Agent 会话不存在: …' 且 **无部分成功 data**。

## 4. 未覆盖与脆弱点

真机端到端（A-6/A-9）未做（`:18`）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例断言如 §3 | 已证实 | 逐行读 `:1-132` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 血缘透传/标签归一/命令校验 | 11 | covered |
| 真机端到端 | — | unknown |
