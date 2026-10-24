---
path: apps/electron/src/main/lib/review/plan-binding-v3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5870588b953def085504874cad61c47438510421
sha256: d207d26b6dd4c89bc8ea45ff0ead38813aa64b7641117bed141c8487431f8548
lines: 183
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/plan-binding-v3.ts

## 1. 结论与边界

C1 不可变 Plan 绑定（头注 :1-5）：**仅 Dev-C Main 业务服务**可携带已核验的 Dev-B 产物验证器调用；不暴露 Renderer IPC；不授予模板发布/校方政策权威。首绑唯一不可变、升级需显式 ACK。

边界：命令经 `submitCommand` CAS 事务（`case-store-v2`）；产物来源验证在调用方注入的 `verify`；删除义务的实体授权在注入的 `authorizeRemoved`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `VerifyPublishedCanonicalPlan` | type | 12-16 | `(plan, aggregate) => void` 外部信任验证器 |
| `bindCanonicalPlanV3` | fn | 61-76 | 首绑（唯一不可变） |
| `CMainUpgradeRemovalAck` | interface | 88-92 | 删除义务 ACK（前后指纹+身份列表） |
| `CMainAuthorizeRemovedPlanBindings` | type | 93-98 | Main 注入的删除授权 |
| `describeRemovedPlanBindings` | fn | 106-114 | 纯 diff（UI 可展示，Main 不信任） |
| `upgradeCanonicalPlanV3` | fn | 123-183 | 升级（新身份+ACK+授权） |

内部：`checkPlan`（:18-58）、`obligationIdentity`（:100-103，`[checkKey,targetKey,objectKey,subjectId,sorted sources]` JSON）、`assertRemovalAckAtCommit`（:115-121+）。

## 3. 内部逻辑与关键流程

1. **`checkPlan`**（:18-58）：`assertC0CanonicalPlan`（:19）；外部 `verify(plan, caseRecord)` 必须核验产物来源/模块摘要/指纹（注释 :20-22「caller-supplied DTOs 不足信」）；模板/版本须匹配绑定案卷（:23-26）；**nativeWorkspaceDraft 三列草稿未清零则拒绝** `DEPENDENCY_UNRESOLVED 原生工作台仍有未正式采纳或明确舍弃的手写规则草稿，禁止静默安装 CanonicalPlan`（:30-33）；工作台选定原件须 active 且被 plan 显式覆盖（:34-42，`STALE_INPUT 待审主体原件版本已失效，必须显式重选` / `DEPENDENCY_UNRESOLVED CanonicalPlan 未显式覆盖…`）；逐 binding：Check×target×object 唯一（:43-47）、来源版本须 active（:48-50）、`subject:` 目标须存在真实 Subject（:53-56）。
2. **`bindCanonicalPlanV3`**（:61-76）：checkPlan 后已有 Plan → `INVALID_TRANSITION Plan already bound; explicit upgrade ACK required`（:68）；mutate `structuredClone(plan)`（:71）。
3. **升级删除义务**（:78-121）：义务身份=Check×target×object×subject×**来源版本集**（注释 :80-86：仅条件/结论变化不授权删除，来源版本替换才移除旧义务；由 Main 在 Case 事务内对两份冻结计划确定性重算，非 UI diff）；`assertRemovalAckAtCommit`：无删除却带 ACK → `VALIDATION_FAILED Non-removal Plan upgrade must not invent a Check-removal ACK`；ACK 须精确匹配（前后指纹+完整有序身份列表+非空 reason）否则 `VALIDATION_FAILED Deleted Check×… requires exact explicit Main ACK`；`authorizeRemoved` 非函数 → `DEPENDENCY_UNRESOLVED Independent Main Principal/Owner/Subject removal approval unavailable`（注释 :122-124：Main 注入物理授权，caller Actor/Renderer 字符串不是授权能力）。
4. **`upgradeCanonicalPlanV3`**（:123-183）：`previousFingerprint` 不符 → `STALE_INPUT Plan upgrade ACK does not identify the installed Plan`（:152-154）；空 acknowledgement → `VALIDATION_FAILED Plan upgrade requires an explicit reason/ACK`（:155）；checkPlan + 新身份（fingerprint/planId 均须变）→ `INVALID_TRANSITION A new immutable Plan identity is required`（:157-159）；有删除时 `verify(previous, aggregate)` **双重来源复核**（:167-171）+ `assertRemovalAckAtCommit`（:172-173）；mutate 旧 Plan 入 `canonicalPlanHistory`、替换当前（:176-180）。

## 4. 调用者与调用链

入向（生产）：`review-v3-main-author-plan-ipc.ts:26/:481`（仅 `upgradeCanonicalPlanV3`）；`review-v3-main-removal-consent.ts:12`（`CMainUpgradeRemovalAck` 类型）。测试：`plan-binding-v3.test.ts:6`、`review-v3-main-plan-provenance.test.ts`、`review-v3-plan-removal-ack.test.ts`。**`bindCanonicalPlanV3` 生产零调用者**（全树检索仅测试 + `review-v3-main-plan-provenance.ts:74` 注释提及）。出向：`@profer/shared assertC0CanonicalPlan`（:6-9）、`./case-store-v2 submitCommand/CommandValidationError`（:10）。

## 5. 数据 I/O、读写与副作用

无直接 I/O；经 `submitCommand` 走 CAS 事务落盘（含 receiptLog）。纯校验函数无副作用。

## 6. 分支、失败、取消与恢复

全部拒绝经 `CommandValidationError`（VALIDATION_FAILED/STALE_INPUT/DEPENDENCY_UNRESOLVED/INVALID_TRANSITION）在事务内中止（原子，不落半状态）；测试 :84 断言失败后 revision 保持 0。无取消概念；恢复语义=事务重试。

## 7. 权限与权威状态

- 发布权威边界：本文件**不授予**模板发布/校方政策权威（头注 :4-5）。
- 来源权威：外部 `verify` 必须核验 Dev-B 产物（:20-22）；升级删除时对**前后两份** issuer 来源重核（:167-171，撤销的 issuer 需显式恢复，不认 UI ACK）。
- 删除权威：精确 Main ACK + 独立 `authorizeRemoved`（:115-121）；「caller Actor/Renderer 字符串不是授权能力」（注释 :122-124）。
- 不可变：首绑唯一、升级换新身份、旧 Plan 留 `canonicalPlanHistory`（:176-180）。

## 8. 修改影响面

- `review-v3-main-author-plan-ipc`（升级通道）与 preload `upgradeCanonicalPlanV3`（apps/electron/src/preload/index.ts:4865）。
- 义务身份/ACK 格式变更影响 `review-v3-plan-removal-ack.test.ts`/`review-v3-main-removal-consent`。
- 同测：`plan-binding-v3.test.ts`（4 用例）。

## 9. 测试证据

直接测试 `plan-binding-v3.test.ts`（4 用例 / 1 describe；`PROFER_CONFIG_DIR` 隔离 :8-10；真实聚合 `createAggregate/readAggregate/writeAggregate`；`verifiedFixtureOnly` 空验证器（注释 :13 真实 Main→Dev-B 验证是集成门）；NOT_RUN）：
1. `:38-62` 幂等重放 → ok；同 requestId 换 payload → `REQUEST_ID_COLLISION`；后绑 → `INVALID_TRANSITION`；revision 1、receiptLog 1、binding `applicability==='unknown'`。
2. `:64-85` 过期来源 → `STALE_INPUT`；重复 Check×target → 拒绝；verify throw → 拒绝；revision 保持 0。
3. `:87-114` 升级：空 ACK 拒、错 fingerprint 拒、合法 ACK ok → `canonicalPlan` 新指纹、`canonicalPlanHistory[0]` 旧指纹、receiptLog 2、revision 2。
4. `:115-158` 未采纳草稿 → `DEPENDENCY_UNRESOLVED`（Plan 不落）；选失效版本 → `STALE_INPUT`；未覆盖选择 → `DEPENDENCY_UNRESOLVED`；全覆盖 → ok revision 1。

未覆盖：`removalAck` 精确匹配分支、`authorizeRemoved` 注入（在 `review-v3-plan-removal-ack.test.ts` 间接）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 草稿/来源/唯一性拒绝 | 已证实 | :18-58 + 测试 :64-158 |
| 删除义务身份+ACK+独立授权 | 已证实 | :78-121 |
| `bindCanonicalPlanV3` 生产零调用者 | 已证实（否定） | 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `checkPlan` 全分支 | §3.1/§9 | 18-58 | covered |
| `bindCanonicalPlanV3` | §3.2/§9 | 61-76 | covered（生产零消费） |
| 义务身份/ACK/authorize | §3.3/§9 | 78-121 | covered（ACK 细节间接） |
| `upgradeCanonicalPlanV3` | §3.4/§9 | 123-183 | covered |
| `describeRemovedPlanBindings` | §2/§3.3 | 106-114 | covered（间接） |
