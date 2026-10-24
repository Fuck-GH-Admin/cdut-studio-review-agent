---
path: apps/electron/src/main/lib/review/review-v3-plan-removal-ack.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ec7b7b81b0490329da6ab6412f36e896605f70e
sha256: f5d9509cad310d8d94b5e864a18fff119f259c31bb2d50e7d3f02459ab426151
lines: 155
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-plan-removal-ack.test.ts

> 测试对象是 `plan-binding-v3.ts`（非本批源文件）：C B-CR-002-B 正式删除 Check 的 UpgradePlan CAS+Receipt。本手册记录其真实断言作为本批（p04.migration-stage 范围）测试证据；被测实现的逐行语义归其所属批次手册。

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证删除 Check 的正式升级：Main 独立计算精确 `Check×target×object×subject×source set`；UI 确认无完整正式 ACK 不能写 Case/Receipt；伪造删除身份/错指纹/缺 C Main 批准拒绝；CAS 提交点撤权与陈旧修订零变更；精确 Main 同意追加**一条**持久业务 Receipt 且保留旧不可变 Plan；旧发布源校验失败阻断删除、无删除升级保留旧理由 ACK。

## 2. 用例清单

共 6 个 `test(`（`review-v3-plan-removal-ack.test.ts:81-154`，单一 `describe`）。夹具（`:15-79`）：真实 `createAggregate` 案卷（v1/v2 两原件、`stage:'reviewing'`）+ 真实 `bindCanonicalPlanV3` 安装旧计划（`check-a`+`check-deleted`）；`upgrade()` 包装 `upgradeCanonicalPlanV3`（发布校验器为 fixture 空操作、删除授权回调可注入 allow/authorize/actor）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | Main independently computes exact Check×target×object×subject×source set（`:82`） | `describeRemovedPlanBindings` 三组合 | `toEqual([JSON.stringify(['check-deleted','subject:s1','evidence','s1',['v1','v2']])])`；同计划→`[]`；改来源集→长度 2 |
| 2 | UI confirmation without full formal removal ACK cannot write Case or Receipt（`:93`） | 无 removalAck 升级 | `ok===false`；`revision` 仍 1；`canonicalPlanHistory` `toBeUndefined()`；`receiptLog` 长度 1 |
| 3 | fabricated removed identity, wrong fingerprints, and missing C Main approval reject（`:101`） | 伪造清单/错 nextFingerprint/`authorize:false`/伪造 actor | 四次 `ok===false`；`revision` 仍 1；`receiptLog` 仍 1 |
| 4 | Main approval revoked at CAS commit and outdated revision fail without mutation（`:112`） | `allow:false`；`revision:0` | 两次 `ok===false`；`receiptLog` 仍 1 |
| 5 | exact Main consent adds ONE durable business Receipt and preserves old immutable Plan（`:118`） | 精确 ack 升级；重放；改载荷碰撞 | `ok===true`；`canonicalPlan.fingerprint===新指纹`；`canonicalPlanHistory[0].bindings.map(checkKey)` `toEqual(['check-a','check-deleted'])`；`receiptLog` 长度 2 且 `[1].type==='UpgradeCanonicalPlan'`、`summary` 含 `'删除义务 1 项'`；`revision===2`；重放 `ok===true` 且 `receiptLog` 仍 2；碰撞 `ok===false` 且 `code==='REQUEST_ID_COLLISION'` |
| 6 | old published-source verifier failure blocks deletion; no-removal upgrade keeps old reason ACK（`:137`） | 旧计划校验抛错；无删除升级 | `fail.ok===false` 且 `receiptLog` 仍 1；`noRemovals.ok===true` 且 `receiptLog` 长度 2 |

## 3. 真实断言

逐条见上表（`:85-91,96-99,105-110,114-116,121-135,145-153`）。mock 边界：`publishedOnlyForTechnicalFixture` 是空操作发布校验器（`:14`，自述 fixture-only）；删除授权回调为 mock（`:73-78`）；`plan-binding-v3`/`case-store-v2` 为真实实现（临时目录落盘 CAS）。

## 4. 未覆盖与脆弱点

- 未覆盖：`describeRemovedPlanBindings` 其它形状（target/object 变化）、真实发布校验器、删除授权的真实物理观察器（由 nb-11 `review-v3-main-removal-consent`/native-observer 手册覆盖）、并发 CAS。
- 脆弱点：`summary` 含 `'删除义务 1 项'` 依赖实现文案；fixture 发布校验器空操作（`:14`）意味着“已发布”语义未在本测试验证。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个用例 | 已证实 | `grep test(`；`:82,93,101,112,118,137` |
| 精确删除清单计算 | 已证实 | `:85-91` |
| 无正式 ACK 零写入 | 已证实 | `:96-99` |
| 一条 Receipt+旧 Plan 保留 | 已证实 | `:123-129` |
| 幂等/碰撞 | 已证实 | `:130-135` |
| 真实发布校验 | 未知 | fixture 空操作 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 删除清单计算 | 1 | 82-92 | covered |
| 无 ACK 拒绝 | 2 | 93-100 | covered |
| 伪造/缺批准拒绝 | 3 | 101-111 | covered |
| 提交点撤权/陈旧 | 4 | 112-117 | covered |
| 精确同意写入 | 5 | 118-136 | covered |
| 发布校验阻断/无删除 | 6 | 137-154 | covered |
| 真实发布者/并发 | 无 | — | unknown |
