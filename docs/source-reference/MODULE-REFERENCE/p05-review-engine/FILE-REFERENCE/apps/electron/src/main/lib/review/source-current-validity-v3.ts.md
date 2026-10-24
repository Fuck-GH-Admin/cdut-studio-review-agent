---
path: apps/electron/src/main/lib/review/source-current-validity-v3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b9a8e226b712c91e7e0892e07b8928231632164a
sha256: 17991e03b9387fe7b5e2814d1e8d4d04d442cd247cf638cb6a5fbfedc2242e85
lines: 79
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/source-current-validity-v3.ts

## 1. 结论与边界

C1 / ARCH-003：**当前来源适用性**与不可变证据历史分离（头注 :1-5）。材料退役时：不删原件、Observation 值/sourceRefs、EvidenceLink 或 Receipt，只撤销「当前确认」并留审计轨迹；撤销与材料过渡在同一 CaseAggregate CAS 写内完成。另提供读侧就绪守卫，兜住旧二进制/畸形直写产生的聚合。

边界：不决定材料生命周期（`material-service`/`material-lifecycle-v3` 驱动）；不做 IPC/身份检查；纯内存变换（在调用方的 `submitCommand` mutate 中运行）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `revokeCurrentSourceValidity` | fn | 9 | `(draft: CaseAggregateV2, retiredVersionIds: ReadonlySet<string>, reason: SourceValidityRevocation['reason']) => void` | 就地撤销（mutate 期） |
| `currentSourceValidityBlockers` | fn | 63 | `(aggregate) => string[]` | 读侧守卫（blocker 键列表） |

无内部函数/常量（全部逻辑内联两函数）。

## 3. 内部逻辑与关键流程

1. **`revokeCurrentSourceValidity`**（:9-56）：空集直接返回（:14）；`activeVersions` = 当前 `active !== false` 文档版本集（:15）；`retiredSubjects` = 退役版本关联过的主体（:17）。逐观察（:23-36）：仅处理 `confirmed`；`referencesInvalid` 判定——无 sourceRefs 时「主体命中退役集**或**本次有任何退役」即失效（:28-29，注释 :25-27：来源集变化后无出处的确认不能静默保持，混合新旧出处也拒绝）；有 sourceRefs 时任一引用跨案或版本不在 active 集即失效（:30-31）；失效者 `confirmed:false` 并记入 revoked/confirmed 两个集合（:33-35）。逐链接（:37-42）：命中退役版本且非 `rejected` 的置 `status:'rejected'`（历史保留）；原 `confirmed` 记入 confirmedLinks。审计（:46-55）：每个退役版本一条 `SourceValidityRevocation`（已存在该版本记录则不重复，:47-48），含 reason/at/observationIds/previouslyConfirmed*/evidenceLinkIds/previouslyConfirmedEvidenceLinkIds，追加到 `draft.sourceValidityRevocations`。
2. **`currentSourceValidityBlockers`**（:63-78）：confirmed 链接指向非 active 版本 → `evidence:{id}`（:66-68）；confirmed 观察引用跨案/非 active → `observation:{id}`（:69-73）；无出处观察且存在任何撤销记录 → `unattributed-observation:{id}`（:74-76）。

## 4. 调用者与调用链

入向（生产）：`material-service.ts:16`、`material-lifecycle-v3.ts:8`、`native-workspace-case-v3.ts:16`、`workspace-service-v2.ts:14`（均 `revokeCurrentSourceValidity`，在材料换版/退役的事务 mutate 内）；`review-v3-run-writer.ts:24`、`workspace-business-service-v2.ts:9`（`currentSourceValidityBlockers`，就绪守卫）。测试：本批 `source-current-validity-v3.test.ts:4`。出向：仅 `@profer/shared` 类型（:6）；纯函数。

## 5. 数据 I/O、读写与副作用

无磁盘/网络；`revokeCurrentSourceValidity` **就地修改**传入 draft（设计为 CAS 事务 mutate，头注 :4）；`currentSourceValidityBlockers` 只读。

## 6. 分支、失败、取消与恢复

无 throw；全部分支返回/就地变更。幂等性：对同一 `retiredVersionIds` 重复调用不再新增 revocation（:47 去重）；已被置 `confirmed:false` 的观察第二次调用因 `!observation.confirmed` 直接跳过（:24）。无取消概念。

## 7. 权限与权威状态

- 历史权威不可变：Observation 的值/sourceRefs、EvidenceLink、Receipt 永不删除（头注 :2-3）；撤销只影响「当前确认」状态并追加审计。
- `previouslyConfirmed*` 字段保存撤销**前**的确认状态（:50-53）——确认历史可追溯。
- 读侧守卫（:58-62 注释）：当前与归档证据都可展示，但归档证据永不能满足当前决定资格（`currentSourceValidityBlockers` 非空即阻断）。
- 无 sender/role 检查；调用方（`submitCommand` 事务层）负责权限。

## 8. 修改影响面

- 撤销语义影响材料换版/归档链路（4 个生产消费方）与 `review-v3-run-writer`/`workspace-business-service-v2` 的就绪判定。
- `sourceValidityRevocations` 形状是 `@profer/shared` 契约，且被 `pi-case-review-service.ts:385-388`（`correctObservation` 后「材料换版后重新确认事实必须指向当前原件」）等消费。
- 需同步测试：`source-current-validity-v3.test.ts`（直接）。

## 9. 测试证据

直接测试 `source-current-validity-v3.test.ts`（3 用例 / 1 describe；`fixture()` 构造两文档 old/new + 两条 confirmed 观察/链接 :7-36；NOT_RUN）：
1. `:39-61` 归档 old：blockers 含 `observation:obs-old`/`evidence:link-old`（:43-44）；revoke 后 obs-old `confirmed:false` 但 sourceRefs/值保留（:46-48）、obs-new 不受影响（:49）、link-old `rejected`、link-new `confirmed`（:50-51）；`sourceValidityRevocations[0]` 含 `previouslyConfirmedObservationIds:['obs-old']`/`previouslyConfirmedEvidenceLinkIds:['link-old']`（:52-55）；blockers 清空（:56）；`computeRunInputHash` 前后变化（:57-58）；重复 revoke 不新增记录（:59-60）。
2. `:62-72` 无出处 confirmed 观察在材料退役后 fail-closed：`confirmed:false` 且撤销审计含 `unattributed`（:70-71）。
3. `:73-77` 无撤销元数据的旧写者读侧守卫仍拦截（`observation:obs-old`）。

未覆盖：`reason` 各取值、`stale`（跨案引用）分支、多版本同时退役的审计拆分；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/无内部符号 | 已证实 | :9/:63 |
| 历史不删、撤销留审计 | 已证实 | :23-55 + 测试 :46-55 |
| 无出处确认 fail-closed | 已证实 | :28-29 + 测试 :62-72 |
| 幂等（重复 revoke 不重复记账） | 已证实 | :47-48 + 测试 :59-60 |
| 4+2 生产消费点 | 已证实 | §4 列行号 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `revokeCurrentSourceValidity`（观察/链接/审计） | §3.1 | 9-56 | covered |
| `currentSourceValidityBlockers` 三类 blocker | §3.2 | 63-78 | covered |
| 无出处/混合引用分支 | §3.1 | 28-31 | covered |
| 跨案引用分支 | §9 | 30-31 | partial（未测） |
