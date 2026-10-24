---
path: apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 26359d4b2f3a10f517bc284d426187d5dd030e54
sha256: ca72dcba89a7be23f8769d656c6c809191fb29d7eba044b4bc7eeffa64375f93
lines: 169
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.ts

## 1. 结论与边界

Dev-C C2-R03：进程内、fail-closed 的**物理 Host 见证注册表**。只有独立特权 Host 观察器能返回真实观测结果时才接受回执 ID；提议、模型文本、技术 ACK 或不可信 DTO 都不能自行填充注册表。刻意**不做磁盘再水化**：Main 重启即丢失活证明，必须等显式跨 PID 恢复 Gate E（文件头 `apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.ts:1-10`）。

边界：

- 不校验业务/数据语义；`C2MainTrustedInputs` 的结构查询在这里，事件内容校验由 C 侧独立做（`:128` 注释）。
- 不是持久围栏：Run 级墓碑只在本进程内（`:143-148` 注释），持久恢复门在 C 的特权执行装配。
- 不接受自证：`rememberObservedReceipt` 必须先有观察器记录（`:95-98`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 1 个类 = 3 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2HostDurableFenceReader` | 接口（导出） | 21-23 | `isRunFenced(run):boolean` | 持久围栏读取器（可选注入） |
| `C2MainPhysicalHostSource` | 接口（导出） | 25-30 | `getObservedPhysicalReceipt(receiptId)`、`getCurrentOwner(run)` | 独立观察器 + 当前 Owner |
| `C2MainPhysicalHostReceiptRegistry` | 类（导出） | 86-169 | 见下 | 注册表本体 |
| `canonical`/`equal` | 内部 | 32-39 | 键排序 JSON 规范化/相等 | 与 `review-v3-main-local-execution-orchestrator.ts:27-33` 同算法 |
| `validId` | 内部 | 40-41 | 非空 ≤512 字符串 | |
| `runTombstoneKey` | 内部 | 45-46 | `JSON.stringify([caseId,runId])` | 注释强调 Run ID 在案卷内不可复用，不用 ownerGeneration/attempt 作墓碑命名空间（`:42-44`） |
| `refuse` | 内部 | 47-49 | 抛 `C0ContractError('RECOVERY_REQUIRED',reason)` | |
| `live` | 内部 | 50-83 | 见证的完整物理校验 | 见 §3.1 |

类成员：`receipts`/`seenIds`/`invalidatedRuns`/`closed`（`:88-92`）；构造器 `:94-101`；`rememberObservedReceipt` `:104-124`；`getPhysicalHostReceipt` `:127-141`；`invalidateRun` `:149-162`；`close` `:165-168`。

## 3. 内部逻辑与关键流程

### 3.1 见证校验（`live`，`:50-83`）

1. `assertC0RunEvidenceIdentity(evidence.run)`（`:53`）。
2. `hostReceiptId`/`permissionGrantId` 形状合法、`verified.permissionGrantId` 相等、`verified.kind ∈ {read,check,terminal}`，否则拒绝（`:54-58`）。
3. `read`：必须有 `source` 与 `extent ∈ {block,full-document}`；`assertC0SourceIdentity(source)`；`source.caseId` 与 run 一致且 `documentVersionId` 在 run 的 `sourceVersionIds` 内（`:59-68`）。
4. `check`：`checkKey` 必须在 run 的 `checkKeys` 内（`:69-72`）；非 read/check 则必须有 `terminalStatus`（`:73-75`）。
5. Owner 绑定：`getCurrentOwner(evidence.run)` 必须存在、`active`、`equal(owner.run,evidence.run)`、`ownerGeneration`/`inputManifestHash`/`permissionGrantId` 三者对齐，否则“见证属于已撤销/轮换/非当前 Owner”（`:77-84`）。

### 3.2 登记（`rememberObservedReceipt`，`:104-124`）

1. 关闭或 ID 非法 → 拒绝（`:105`）。
2. `getObservedPhysicalReceipt(receiptId)` 必须返回且 ID 一致（“没有独立观测结果”拒绝，`:106-108`）。
3. Run 墓碑或持久围栏命中 → “Run invalidated”拒绝（`:109-111`）。
4. `live(...)` 全量校验（`:112`）。
5. 已登记同 ID：内容不等 → “rebound”拒绝；相等直接返回（同一物理回调可到两次，绝不追加两次）（`:113-116`）。
6. `seenIds` 已含（回收身份）或容量 ≥8192 → 拒绝（`:117-119`）。
7. 记 `seenIds` + 克隆入库（`:120-122`）。

### 3.3 查询（`getPhysicalHostReceipt`，`:127-141`）

关闭/ID 非法/未登记 → `undefined`（`:129-131`，注释“No recover from event fallback”）；Run 墓碑或持久围栏命中 → `undefined`（`:132-134`，围栏抛错也算命中）；观察器最新记录必须与登记一致且 `live` 仍通过，否则 `undefined`（`:135-138`）；返回克隆（`:139-140`）。

### 3.4 失效与关闭

- `invalidateRun(run)`（`:149-162`）：墓碑键 = `[caseId,runId]`；容量 8192 满时**不淘汰旧围栏**而是 `close()` + “capacity exhausted”（`:153-157`）；把该 Run 的已登记回执删除（`:158-161`）。墓碑永久（即使未见过的迟到 ID 也被拒，见测试）。
- `close()`（`:165-168`）：`closed=true` + 清空 `receipts`（`seenIds` 不清——被关闭后 `rememberObservedReceipt` 直接拒绝）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产：`apps/electron/src/main/lib/review/review-v3-main-local-technical-review.ts:23-26` 导入并在 `:127` 实例化；`review-v3-main-trusted-assembly.ts:31-33` 导入并在 `:70` 实例化（该装配文件本身无生产调用者，见其检索）。
- 测试：自身 `review-v3-main-host-receipt-registry.test.ts:9`；**文件外测试覆盖 1 个**：`review-v3-durable-host-fence.test.ts:13`（`:100` 实例化，不在本批）。

出向：`@profer/shared`（`assertC0RunEvidenceIdentity:205`、`assertC0SourceIdentity:195`、`C0ContractError:149`、`RunEvidenceIdentity`）；`review-v3-main-trust-port.ts:28,37`（`C2MainOwnerWitness`/`C2MainHostWitness` 类型）。无 IPC、无磁盘。

## 5. 数据 I/O、读写与副作用

- 纯内存三集合（`receipts`/`seenIds`/`invalidatedRuns`）；无磁盘再水化（刻意，`:8-9`）。
- 副作用：无日志/通知；失败抛 `C0ContractError('RECOVERY_REQUIRED',...)`。
- 并发：同步方法；无锁（进程内单线程假设）。容量上限 8192（回执）/8192（墓碑），满即整体关闭（`:117-119,153-157`）。
- 幂等：同 ID 同内容重复登记无操作（`:113-116`）；`invalidateRun` 重复调用安全（测试断言）。

## 6. 分支、失败、取消与恢复

| 拒绝（`C0ContractError('RECOVERY_REQUIRED', ...)`） | 触发 | 行 |
| --- | --- | --- |
| `Independent Main Host observer required`（`ACTOR_UNTRUSTED`） | 构造缺观察器 | 100 |
| `Main Host registry closed or invalid ID` | 关闭/ID 非法 | 105 |
| `No independently observed physical Host result for this ID` | 无观察记录 | 107 |
| `Run invalidated: late or unknown physical Host receipt denied` | 墓碑/持久围栏 | 110 |
| `Host receipt ID rebound to different evidence` | 同 ID 异内容 | 114 |
| `Recycled physical Host identity or registry capacity exhausted` | seenIds 回收/容量 | 118 |
| `Run invalidation capacity exhausted: registry sealed` | 墓碑容量满 | 156 |
| `Host registry closed during Run invalidation` | 关闭后 invalidate | 151 |
| `live` 内各拒绝（identity/grant/extent/manifest/Owner） | 见证校验 | 53-84 |

- 失败后状态：登记失败不写入；`invalidateRun` 后该 Run 的回执查询恒 `undefined` 且迟到 ID 永久拒收。
- 恢复：**无自动恢复**——注释明确“进程重启失去活证明，密封必须停等显式跨 PID 恢复 Gate E”（`:8-9,146-148`）。`close()` 后不可复活。

## 7. 权限与权威状态

- 权威来源：独立 Host 观察器（`getObservedPhysicalReceipt`）+ 当前 Owner（`getCurrentOwner`）；两者都是特权 Main 注入，不可由 DTO 自证（`:25-30,104-112`）。
- Owner 语义：`permissionGrantId`/`inputManifestHash`/`ownerGeneration` 必须与 run 对齐（`:77-84`）；“prior persisted lease never authorizes”（`:28-29`）。
- 墓碑键用 `[caseId,runId]` 而非 ownerGeneration/attempt，防止旧回执经新 generation/attempt 复活（`:42-46`）。

## 8. 修改影响面

- 改 `C2MainPhysicalHostSource` 影响 `review-v3-main-local-technical-review.ts:47`（`C11LocalReviewSource` 扩展它）与 `review-v3-main-trusted-assembly.ts:36`。
- 改登记/查询语义影响 `review-v3-main-local-technical-review.ts:127-141` 的使用与两组测试（自身 10 例 + `review-v3-durable-host-fence.test.ts`）。
- 改容量/墓碑语义影响长进程行为（当前满容量即整体封死，测试 `review-v3-main-host-receipt-registry.test.ts:217-229`）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-main-host-receipt-registry.test.ts`（230 行，10 个 `test(`，详见该文件手册）。要点：无观察器即构造失败/自证拒绝、单次接受+克隆、Owner/Grant/manifest 三种失效、跨 attempt 拒绝、来源不匹配/ID 重绑拒绝、invalidate/close 不复活、迟到 ID 拒收、回收 Run 身份跨 generation 仍拒、同案新 Run 可行、容量不淘汰旧围栏。

间接：`review-v3-durable-host-fence.test.ts:100`（文件外，验证持久围栏交互）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`terminal`/`check` kind 的正例覆盖较弱（测试夹具主要 `kind:'read'`）；并发/多进程行为未测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无磁盘再水化、重启即失 | 已证实 | `:8-9`；全文无 `fs` |
| 自证 DTO 不能登记 | 已证实 | `:104-112`；测试 `:56-62` |
| 墓碑按 `[caseId,runId]`，迟到 ID 永久拒 | 已证实 | `:42-46,149-161`；测试 `:152-166` |
| 容量满即封死不淘汰 | 已证实 | `:153-157`；测试 `:217-229` |
| 同 ID 同内容重复登记幂等 | 已证实 | `:113-116`；测试 `:64-77` |
| 持久围栏交互由 `durable?` 可选注入 | 已证实 | `:95,109-111,132-134` |
| `check`/`terminal` 正例行为 | 未知 | 测试以 `read` 为主 |
| 跨进程恢复 Gate E | 未知（文件外） | 注释提及（`:8-9`），未读实现 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `live` 校验链 | §3.1 | 50-84 | covered |
| `rememberObservedReceipt` | §3.2 | 104-124 | covered |
| `getPhysicalHostReceipt` | §3.3 | 127-141 | covered |
| `invalidateRun`/容量 | §3.4 | 149-162 | covered |
| `close` | §3.4 | 165-168 | covered |
| 墓碑键语义 | §7 | 42-46 | covered |
| `check`/`terminal` 正例 | §9 | 69-75 | partial |
| 跨进程恢复 | §10 | — | unknown |
