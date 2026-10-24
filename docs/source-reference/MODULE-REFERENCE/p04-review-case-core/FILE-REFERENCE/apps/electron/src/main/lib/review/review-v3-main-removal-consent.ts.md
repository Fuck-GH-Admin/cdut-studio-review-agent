---
path: apps/electron/src/main/lib/review/review-v3-main-removal-consent.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 698a703ad551f6e09fdf9f1c008130a4ff8ccdd4
sha256: 7e00f78261d344a48186a410256345a9d64ed2d43c3b99442f5abc41818664cb
lines: 146
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-removal-consent.ts

## 1. 结论与边界

Dev-C C-MAIN-REMOVAL-R01：Main-only、一次性、人类已观察的删除同意。绝不从 Renderer“confirm”标志或 `UpgradeCanonicalPlan` 载荷 `removalAck` 产生批准；只有特权 Main 观察到真实人类确认才能提供 `CMainRemovalObservedConsent`（文件头 `apps/electron/src/main/lib/review/review-v3-main-removal-consent.ts:1-12`）。

边界（`:10-12`）：生产**尚未**安装 UI 观察器；没有观察器时任何 Check 删除都 fail-closed，即使 Renderer 提供逐字匹配的 acknowledgement 清单。

## 2. 导出与关键符号

`export` 逐条核对：4 个接口 + 1 个类 = 5 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainRemovalPhysicalIdentity` | 接口（导出） | 14-22 | principalId/sessionId/windowId/frameId/ownerId/ownerGeneration/authorityEpoch | 物理身份 |
| `CMainRemovalObservedConsent` | 接口（导出） | 23-35 | 身份 + `{schemaVersion:'review-v3-main-human-removal-consent/1',approvalId,caseId,requestId,expectedRevision,previousFingerprint,nextFingerprint,acknowledgedRemovedIdentities,reason,observedAtMs}` | `approvalId` 只属真实观察确认（`:18-19`） |
| `CMainRemovalWitnessSource` | 接口（导出） | 36-44 | `observeAtCommit?`（CAS 内同步钩子）/`getObservedMainHumanConsent` | 禁止 Renderer 实现（`:25-27`） |
| `CMainRemovalCommitContext` | 接口（导出） | 45-53 | `{caseId,requestId,currentCaseRevision,identity,acknowledgement,computedRemovedIdentities,reason}` | CAS 提交上下文 |
| `CMainRemovalConsentGate` | 类（导出） | 75-145 | `consumeAtCommit(ctx)`/`close()` | 一次性消费门 |
| `MAX_AGE_MS`/`LIMIT`/`sha`/`safe`/`denied`/`isSame` | 内部 | 55-63 | 5 分钟/4096；抛 `C_MAIN_REMOVAL_CONSENT_*` | |
| `seenPerPhysicalObserver` | 内部 | 72 | `WeakMap<CMainRemovalWitnessSource,Set<string>>` | 同观察器对象跨 gate 重装保留墓碑（`:64-71` 注释） |

## 3. 内部逻辑与关键流程

### 3.1 构造（`:78-84`）

`source` 若给则必须有 `getObservedMainHumanConsent`（`PHYSICAL_HUMAN_OBSERVER_INVALID`）；`consumedIds` 优先取该观察器的 WeakMap 墓碑集（新 gate 与旧 gate 共享，`:78-84`）。

### 3.2 `consumeAtCommit(ctx)`（`:87-139`）

1. 关闭 → `GATE_CLOSED`；无观察器 → `MAIN_OBSERVER_NOT_INSTALLED`（`:89-91`）。
2. 无观察记录 → `PHYSICAL_HUMAN_CONFIRMATION_MISSING`（`:92-93`）。
3. `approvalId` 非法或已消费 → `APPROVAL_ALREADY_USED_OR_INVALID`（`:94-96`）。
4. 记录与 ctx 全等校验（`:97-115`）：schemaVersion、caseId/requestId、`expectedRevision===currentCaseRevision`、身份七字段逐项相等，否则 `MAIN_PRINCIPAL_OWNER_FRAME_OR_REVISION_CHANGED`。
5. 指纹/清单/理由校验（`:116-125`）：两个 64hex 指纹相等、`consent.acknowledgedRemovedIdentities` 与 `ack.acknowledgedRemovedIdentities` 都与 `computedRemovedIdentities` 逐位相等、reason 相等，否则 `HUMAN_DID_NOT_CONFIRM_EXACT_DELETED_OBLIGATIONS`。
6. `observedAtMs` 必须 ≤now 且 5 分钟内且为安全整数，否则 `HUMAN_CONFIRMATION_EXPIRED_OR_INVALID`（`:126-131`）。
7. 容量 ≥4096 → `close()` + `CAPACITY_EXHAUSTED_CLOSED`（`:132-135`）。
8. **先消费后返回**：后续 IO 失败该批准即失效，用户必须重新确认，绝不重放（`:136-139` 注释 + `consumedIds.add`）。

### 3.3 `close()`（`:141-145`）

置 closed，**不清墓碑**：同物理观察器重装的 gate 仍须拒绝已消费 ID（`:143-144`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- `CMainRemovalConsentGate`：`review-v3-main-author-plan-ipc.ts:35` 导入；`:119`（安装槽字段）、`:138`（`newInstallation` 参数）、`:157`/`:196`（`installCMainV3PlanUpgradeAuthorities`/`installCMainV3AuthorPlanAuthorities` 构造）；消费点 `:510`（`removalGate.consumeAtCommit`，UPGRADE handler CAS 内）。
- 类型：`review-v3-main-native-removal-observer.ts:17-20`（实现 `CMainRemovalWitnessSource`）。
- 测试：`review-v3-main-removal-consent.test.ts`（本批 6 例）、`review-v3-main-native-removal-observer.test.ts:6`（联用）。

出向：`plan-binding-v3.ts`（`CMainUpgradeRemovalAck` 类型，`:4`）。无 IPC/无磁盘。

## 5. 数据 I/O、读写与副作用

- 写：`consumedIds` 集合（WeakMap 持久于观察器对象生命周期）；无盘、无日志。
- 副作用：无；错误抛 `Error('C_MAIN_REMOVAL_CONSENT_'+why)`（`:61`）。
- 并发：同步方法；无锁。
- 幂等：消费一次后永不可再用；容量满整体封死。

## 6. 分支、失败、取消与恢复

| 拒绝（`C_MAIN_REMOVAL_CONSENT_*`，两个直接 Error 见下行） | 触发 | 行 |
| --- | --- | --- |
| `PHYSICAL_HUMAN_OBSERVER_INVALID` | 构造源缺方法 | 80 |
| `GATE_CLOSED` | 关闭后 | 89,143 |
| `MAIN_OBSERVER_NOT_INSTALLED`（直接 Error） | 无观察器 | 91 |
| `PHYSICAL_HUMAN_CONFIRMATION_MISSING`（直接 Error） | 无记录 | 93 |
| `APPROVAL_ALREADY_USED_OR_INVALID` | 复用/非法 ID | 95 |
| `MAIN_PRINCIPAL_OWNER_FRAME_OR_REVISION_CHANGED` | 身份/修订漂移 | 114 |
| `HUMAN_DID_NOT_CONFIRM_EXACT_DELETED_OBLIGATIONS` | 指纹/清单/理由不符 | 124 |
| `HUMAN_CONFIRMATION_EXPIRED_OR_INVALID` | 时间窗 | 130 |
| `CAPACITY_EXHAUSTED_CLOSED` | ≥4096 | 134 |

- 失败后状态：消费在返回前记账（`:138`），CAS 后续失败不复用；`close` 不清墓碑。
- 取消/恢复：无取消；恢复=新确认 + 新批准。

## 7. 权限与权威状态

- 批准只能来自 `CMainRemovalWitnessSource`（特权 Main 观察器）；Renderer `removalAck` 只是提议清单（文件头 `:3-5`）。
- 生产现状（`:10-12` + nb-10 检索）：生产未安装 UI 观察器 → 所有删除 fail-closed。
- 5 分钟时效（`:55`）；一次性（WeakMap 墓碑跨重装）。

## 8. 修改影响面

- 改校验逻辑影响 `plan-binding-v3.ts` 的删除回调（`upgradeCanonicalPlanV3` 第二回调）与 `review-v3-main-author-plan-ipc.ts:488-512`。
- 改 `CMainRemovalObservedConsent` 影响 `review-v3-main-native-removal-observer.ts:110-124` 的生成端。
- 改墓碑语义影响 6 个测试（含重装/容量）。

## 9. 测试证据

直接测试：`review-v3-main-removal-consent.test.ts`（107 行，6 例，详见其手册）：一次性消费/跨请求不可复用、同观察器重装保留墓碑、缺观察器/无效源/缺记录/关闭拒绝、9 种字段篡改拒绝、过期/未来/NaN 时间拒绝、容量无 FIFO/LRU。联用：`review-v3-main-native-removal-observer.test.ts`（5 例）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`MAX_AGE_MS` 边界（恰 5 分钟）、并发 consume、`computedRemovedIdentities` 超长。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 批准只能来自 Main 观察器 | 已证实 | 文件头 `:1-12`；`:89-93` |
| 一次性 + 跨重装墓碑 | 已证实 | `:64-84,138,141-145`；测试 `:43-60,97-106` |
| 消费先于返回（失败不复用） | 已证实 | `:136-139` |
| 5 分钟时效 | 已证实 | `:55,126-131` |
| 生产未装观察器 → 删除 fail-closed | 已证实（文件注释 + nb-10 检索） | `:10-12` |
| 并发行为 | 未知 | 无测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造/WeakMap | §3.1 | 64-84 | covered |
| `consumeAtCommit` 全分支 | §3.2 | 87-139 | covered |
| `close` | §3.3 | 141-145 | covered |
| 权威/时效/一次性 | §7 | 55,64-71 | covered |
| 生产安装现状 | §4,§7 | 检索记录 | covered（范围已声明） |
| 并发/边界 | §9,§10 | — | unknown |
