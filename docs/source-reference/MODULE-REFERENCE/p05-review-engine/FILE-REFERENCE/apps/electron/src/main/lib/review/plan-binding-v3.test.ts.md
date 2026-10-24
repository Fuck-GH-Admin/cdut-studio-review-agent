---
path: apps/electron/src/main/lib/review/plan-binding-v3.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bdd3f90ebcab8a53cf5766e565dbba56c8d8a55c
sha256: b31e987d02ae22cc221b7929e706363d05b4992f290be211aa6622c91ce93717
lines: 160
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/plan-binding-v3.test.ts

## 1. 测试目标

Dev-C C1 不可变 Plan 绑定：幂等重放/请求碰撞/后绑拒绝、来源与唯一性与可信验证器、升级 ACK+历史保留、未采纳草稿/失效来源/未覆盖选择拒绝。

## 2. 用例清单

4 用例 / 1 describe。夹具：`PROFER_CONFIG_DIR` 隔离（:8-10）；真实聚合 `createAggregate/readAggregate/writeAggregate`（:5）；`seed()` 建案卷+文档（:16-28）；`plan(n)` 差异指纹（:29-35）；`verifiedFixtureOnly` 空验证器（:12-14，注释：真实 Main→Dev-B 验证是独立集成门）。mock 边界：仅产物验证器为空实现。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 重放/碰撞/后绑拒绝且无重复 Receipt | 38-62 |
| 2 | 当前材料/唯一 Check×target/可信验证器 | 64-85 |
| 3 | 升级需指纹+ACK，保留旧 Plan 与 Receipt 历史 | 87-114 |
| 4 | 未采纳草稿/失效选择/未覆盖选择不能静默装 Plan | 115-158 |

## 3. 真实断言

- 1：重放 `ok` true（:48）；同 requestId 换 payload → `REQUEST_ID_COLLISION`（:53）；`bind-2` 后绑 → `INVALID_TRANSITION`（:58）；`revision===1`、`receiptLog` 1、binding `applicability==='unknown'`（:59-61）。
- 2：来源 `'archived'` → `STALE_INPUT`（:73）；重复 binding 拒（:79）；verify throw 拒（:83）；`revision===0`（:84）。
- 3：空 ACK 拒（:98）；`previousFingerprint:'wrong'` 拒（:103）；合法 ACK ok（:108）；`canonicalPlan.fingerprint` 新值、`canonicalPlanHistory[0].fingerprint` 旧值、`receiptLog` 2、`revision===2`（:110-113）。
- 4：手写草稿 → `DEPENDENCY_UNRESOLVED` 且 `canonicalPlan` undefined（:127-128）；选 `stale-version` → `STALE_INPUT`（:141）；未覆盖选择 → `DEPENDENCY_UNRESOLVED`（:151）；全覆盖 → ok、`revision===1`（:156-157）。

## 4. 未覆盖与脆弱点

- 未覆盖：`removalAck` 精确匹配/`authorizeRemoved`（在 `review-v3-plan-removal-ack.test.ts`）；`verify` 语义为空（集成门）。
- 脆弱点：fixture 靠 `as unknown as` 绕类型；caseId 字符串全局唯一依赖 `Date.now()`。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 本文件逐行 |
| 幂等/碰撞/历史保留被固定 | 已证实 | :48-113 |
| 草稿/来源/覆盖拒绝被固定 | 已证实 | :115-158 |
| 真实 Dev-B 验证器未在本文件覆盖 | 已证实 | :12-14 注释 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| bindCanonicalPlanV3 幂等/拒绝 | §3 | covered |
| checkPlan 来源/唯一性/草稿/覆盖 | §3 | covered |
| upgradeCanonicalPlanV3 ACK+历史 | §3 | covered |
| removalAck/authorizeRemoved | §4 | unknown（未测，他测覆盖） |
