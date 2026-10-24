---
path: apps/electron/src/main/lib/review/review-v3-t07-main-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd54a842e5def2942236db7bb100301e2503c036
sha256: 209edb75c151a41247ec4e650b8fb15e84a08fc9e2ca20be2ff2d8e9d058d73a
lines: 202
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-main-service.ts

## 1. 结论与边界

T07 评分 Main 服务（Local-L04 桥接层，文件头 `:1-11`）：职责仅三件——①从 Main 可信信息派生评委/组织者 actor（**绝不采用 Renderer 声称身份**）；②读 T07State 投影评分视图（评委只见自己任务+脱敏材料）；③应用 T07Action 并持久化（expectedRevision 必须匹配）。**不重写 T07 业务算法**（分配/回避/评分/排名/同分/冻结全调 `review-v3-t07-rating-workflow` 纯函数）。运行时模块（读 batch-store/template-store/case-store/t07-state-store）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T07MainActorClaim` | interface | `:25-29` | `{role:'judge'\|'organizer'; reviewerId?}`（Renderer 只能声明角色，身份由 Main 绑定，`:24`） |
| `deriveT07Actor` | function | `:39-50` | organizer 恒 `local-reviewer`；judge 须显式 reviewerId（`[A-Za-z0-9_-]{1,64}`）——“本地评委”语义，不获校方权限（`:36-37`） |
| `T07StateView` | interface | `:90-94` | `{revision; view; updatedAt}` |
| `getT07View` | function | `:97-107` | 读投影 |
| `initT07MainState` | function | `:115-133` | 建轮次（仅组织者；已存在拒绝防静默重置） |
| `T07ApplyResult` | interface | `:138-142` | `{revision; view; ranking}` |
| `applyT07MainAction` | function | `:150-186` | 应用动作+CAS 持久化 |
| `readT07RoundSummary` | function | `:189-202` | Main 内部汇总（不含票面内容） |

内部：`trustedMaterials`（`:56-66`，只读案卷本体；文档标题中性“材料 N”防文件名泄学号姓名（JDG-02/JDG-15））；`assertRoundFresh`（`:73-88`，JDG-09 本地部分）；`trustedNaEligible = undefined`（`:135-136`，T04 事实端口未接通前 N/A 失败关闭）。

## 3. 内部逻辑与关键流程

### 3.1 `deriveT07Actor`（`:39-50`）

claim 缺失/角色非法 → `T07_ACTOR_REQUIRED`；organizer → `{actorId:'local-reviewer', actorSource:'local'}`；judge 空 id → `T07_JUDGE_ID_REQUIRED`、格式不符 → `T07_JUDGE_ID_INVALID`。

### 3.2 `assertRoundFresh`（`:73-88`，JDG-09）

批次存在（`T07_BATCH_NOT_FOUND`）；量表版本与轮次锁定一致（`T07_RUBRIC_VERSION_STALE`）；模板仍 published（`T07_TEMPLATE_NOT_PUBLISHED`）；案卷集合不变（`T07_CASES_CHANGED`）。批次重开语义由 batch 组（`:71` 注释）。

### 3.3 `initT07MainState`（`:115-133`）

仅组织者（`T07_ORGANIZER_REQUIRED`）；**Renderer 传入 `state` 是旧 IPC 兼容项不作数据来源**（`:122`）；真实轮次由 `createT07RoundFromPublishedTemplate(batch, template)` 派生；已存在时 `initT07State` 拒绝（`:112`）。

### 3.4 `applyT07MainAction`（`:150-186`）

`initialState`/`safeMaterials`/`naEligible` 均为**运行时忽略的兼容字段**（`safeMaterials` 标 @deprecated“Renderer 不得提供材料或 N/A 条件”，`:157-161`；naEligible 不采用“冒充条件已核验”，`:174-176`）。流程：derive actor → 状态须已初始化（`T07_STATE_NOT_INITIALIZED`）→ batchId 匹配（`T07_BATCH_MISMATCH`）→ `assertRoundFresh` → `applyT07Action`（动作合法性全在 workflow）→ `writeT07State(expectedRevision)` CAS → 返回 view+ranking。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`review-ipc.ts`（T07 评分 IPC）；`review-v3-t09-judge-adapter`（`applyT07MainAction` 作 T07 CAS 依赖）；直接测试 `review-v3-t07-main-service.test.ts`；`review-v3-t07-precision-rounds.test.ts` 直测 `rating-workflow` 纯函数（间接关联，亦在本批）。出向：`batch-store.readBatchStateV2`、`template-store.getTemplate`、`case-store.getCase`、`review-v3-t07-round-setup`、`review-v3-t07-rating-workflow`、`review-v3-t07-state-store`。

## 5. 数据 I/O、读写与副作用

读 batch/template/case store 与 `t07-state-store`；经 `writeT07State` 持久化（CAS）；无网络/日志。`at` 取系统时间。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 错误码 |
| --- | --- | --- |
| claim 缺失/非法/id | `:40-48` | `T07_ACTOR_REQUIRED`/`T07_JUDGE_ID_*` |
| 批次/量表/模板/案卷集变化 | `:73-87` | `T07_BATCH_NOT_FOUND`/`T07_RUBRIC_VERSION_STALE`/`T07_TEMPLATE_NOT_PUBLISHED`/`T07_CASES_CHANGED` |
| 未初始化/批次不符 | `:165/:168` | `T07_STATE_NOT_INITIALIZED`/`T07_BATCH_MISMATCH` |
| 非组织者建轮次 | `:121` | `T07_ORGANIZER_REQUIRED` |
| CAS | `:179` | VERSION_CONFLICT（state-store） |
| 取消/恢复 | 无 | 无 AbortSignal |

## 7. 权限与权威状态

- 身份 Main 绑定（organizer 恒 local-reviewer；本地评委≠校方权限）。
- 材料匿名（中性标题防 PII 泄漏）；N/A 失败关闭（T04 端口未接通）；Renderer 材料/条件一律忽略。
- JDG-09 新鲜度门防旧轮次续用。

## 8. 修改影响面

改 actor/投影/CAS → 影响 T07 IPC 与 t09-judge-adapter（submitRating 依赖）；`rating-workflow`/`state-store` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t07-main-service.test.ts`、`review-v3-t07-precision-rounds.test.ts`（详见各手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 身份 Main 绑定+失败关闭 N/A | 已证实 | `:24-50/:135-136/:174-176` |
| JDG-09 新鲜度门 | 已证实 | `:68-88` |
| Renderer state/材料/条件忽略 | 已证实 | `:122/:157-161` |
| 中性标题防 PII | 已证实 | `:52-63` |
| 建轮次≠重开 | 已证实 | `:109-113` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `deriveT07Actor` | 3.1 | `:39-50` | covered |
| `assertRoundFresh` | 3.2 | `:73-88` | covered |
| `getT07View`/`initT07MainState` | 3.3 | `:97-133` | covered |
| `applyT07MainAction` | 3.4 | `:150-186` | covered |
| `readT07RoundSummary` | 2 | `:189-202` | covered |
