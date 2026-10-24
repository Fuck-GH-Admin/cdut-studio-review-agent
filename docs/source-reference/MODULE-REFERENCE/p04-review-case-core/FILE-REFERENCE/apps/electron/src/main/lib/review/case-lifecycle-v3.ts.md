---
path: apps/electron/src/main/lib/review/case-lifecycle-v3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 587ce530ae90071108c51a02fef9fed536838df7
sha256: ddd7e440d5108a467453eb315b53ae23e7b6629451029ef7cd5ad04e73ca6bb0
lines: 97
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-lifecycle-v3.ts

## 1. 结论与边界

C-owned 的**可逆案卷归档/恢复**（V3）：`archiveReviewCaseV3` / `restoreReviewCaseV3` 通过 `case-store-v2.submitCommand` 的单次 CAS 事务写业务账，归档软保留、恢复显式（`apps/electron/src/main/lib/review/case-lifecycle-v3.ts:36-97`）。

文件头声明的关键边界（`:1-8`）：`state.v2.json` 是唯一业务写入者；归档与回执在同一 CAS 事务提交；V1 `case.json` 永不删除也不作为第二权威；**真实 Main 调用者必须从活跃 Main sender 派生 Actor，绝不接受渲染层 JSON 身份**。

明确不做的事：

- **不删任何东西**：文档/回执/运行全部保留（`:35` 注释）。
- **不做旧版入口**：旧删除入口由别处拦截（测试断言 `deleteCase` 抛「禁止通过旧版删除入口」，`case-lifecycle-v3.test.ts:46`）。
- **无 sender 校验**：actor 合法性只做结构检查（`:25-27`），真实身份由 IPC 层派生。

## 2. 导出与关键符号

`export` 共 **2 个**。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `archiveReviewCaseV3` | 导出异步函数 | `:36-70` | `(caseId, command: CaseLifecycleCommand) => Promise<ReviewCommandResult>` | 软归档 |
| `restoreReviewCaseV3` | 导出异步函数 | `:73-97` | `(caseId, command: CaseLifecycleCommand) => Promise<ReviewCommandResult>` | 显式恢复 |

内部：`CaseLifecycleCommand`（`:14-19`，`{requestId; expectedRevision; actor; payload:{reason}}`）、`check`（`:20-33`）。

## 3. 内部逻辑与关键流程

### 3.1 `check`（`:20-33`）——命令合法性

`assertSafeReviewStorageId(caseId)`（`:21`）；随后任一不满足即抛 `CommandValidationError('VALIDATION_FAILED','案卷归档/恢复命令缺少可信人员、修订号或有效理由')`：`requestId` 匹配 `^[a-zA-Z0-9_-]{1,128}$`（`:23`）、`expectedRevision` 为非负安全整数（`:24`）、`actor.actorSource==='local' && actor.role==='reviewer' && actor.actorId` 非空（`:25-27`）、`payload.reason` 为字符串且 `trim()` 后 ≥2 且原始长度 ≤1000（`:28-30`）。

### 3.2 `archiveReviewCaseV3`（`:36-70`）

`check` 后 `submitCommand(caseId, {…, type:'ArchiveReviewCaseV3'}, snapshot => …)`：

1. **进行中的 Run 阻断**（`:43-47`）：`listRunsV2(caseId)` 有 `running`/`queued` → 抛 `INVALID_TRANSITION`「案卷仍有进行中的审核 …请先停止并完成归档」。
2. **重复归档阻断**（`:48-50`）：`stage==='archived'` → 抛「案卷已经归档」。
3. **账本矛盾阻断**（`:51-53`）：存在 `caseArchive` 但 `restoredAt` 为空 → 抛「案卷归档账与业务状态矛盾，禁止覆盖」。
4. `mutate`（`:56-67`）：若上一轮归档已恢复（`restoredAt` 存在），把旧 `caseArchive` 推入 `caseArchiveHistory`；写新 `caseArchive`（`previousStage`、`archivedAt`、`archivedBy=actor.actorId`、`reason=trim`）；`caseV2.stage='archived'`。

### 3.3 `restoreReviewCaseV3`（`:73-97`）

`check` 后 `submitCommand(…, 'RestoreReviewCaseV3', snapshot => …)`：

1. **有效归档检查点校验**（`:78-81`）：必须 `stage==='archived'` 且 `caseArchive` 存在且未 `restoredAt` 且 `previousStage!=='archived'`，否则抛「案卷没有可恢复的有效归档检查点」。
2. `mutate`（`:84-94`）：`stage='draft'`；`caseArchive` 追加 `restoredAt/restoredBy/restoreReason`。注释明示恢复**不是**重新批准：旧 Run/决定保持历史，修订递增使其旧输入绑定失效（`:85-86`）。

## 4. 调用者与调用链

- **IPC 层**（`review-ipc.ts`）：
  - `archiveReviewCaseV3`：`:1351-1364` ——旧工作台「移除案卷」入口（`legacy-remove-` + 案卷/归档周期哈希作 `requestId`，`actor` 固定 `{actorId:'local-reviewer',actorSource:'local',role:'reviewer'}`，理由「用户在原工作台将案卷移入归档」）；此前先 `assertSafeReviewStorageId`（`:1344`）、校验 V2 状态与归档历史完整性（`:1345-1360`）。
  - `restoreReviewCaseV3`：`:1403-1409` ——原生恢复入口（`native-restore-` + `[caseId, history长度, archivedAt]` 哈希作 `requestId`）。
- **测试**：`case-lifecycle-v3.test.ts`（5 用例）、`review-v3-legacy-entry-gates.test.ts`（3 处引用）。
- **出向**：`assertSafeReviewStorageId`（`review-storage-id.ts:8`）、`submitCommand`/`CommandValidationError`（`case-store-v2`）、`listRunsV2`（`run-store-v2`）。

## 5. 数据 I/O、读写与副作用

- **写**：仅经 `submitCommand`（CAS + 回执追加）改 `state.v2.json` 的 `caseArchive`/`caseArchiveHistory`/`caseV2.stage`。
- **读**：`listRunsV2`、`snapshot`。
- **无** 网络/定时器/直接文件 IO。
- **幂等**：同一 `requestId` 重放由 `submitCommand` 层处理（测试证明重放返回 `ok:true` 且状态字节不变、同 `requestId` 换载荷得 `REQUEST_ID_COLLISION`，`case-lifecycle-v3.test.ts:48-53`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 命令字段非法 | `:20-33` | `VALIDATION_FAILED` |
| 有 running/queued Run | `:43-47` | `INVALID_TRANSITION`，要求先停止 |
| 已归档再归档 | `:48-50` | `INVALID_TRANSITION`「案卷已经归档」 |
| 归档账矛盾 | `:51-53` | `INVALID_TRANSITION` 禁止覆盖 |
| 无可恢复检查点 | `:78-81` | `INVALID_TRANSITION` |
| 旧修订恢复 | `:77` + CAS | `VERSION_CONFLICT`（测试 `case-lifecycle-v3.test.ts:85-87`） |

失败均为命令级拒绝，不产生部分状态（`submitCommand` 事务性）。恢复后旧快照运行被拒（「旧快照禁止执行」，测试 `:101-102`）。

## 7. 权限与权威状态

- `actor` 只做结构校验（`:25-27`）；文件头要求真实 Main 从 sender 派生（`:6-7`）。IPC 层以固定 `local-reviewer` 构造（`review-ipc.ts:1357-1360`），`requestId` 由 Main 状态哈希派生、不接受渲染层值。
- 权威状态：`caseV2.stage`/`caseArchive` 均在 V2 聚合内；`revision` 由 `submitCommand` 自增（测试 `:36`、`:92`）。

## 8. 修改影响面

- IPC 两个入口（`:1351-1364`、`:1403-1409`）依赖 `requestId` 稳定性实现重放语义；改哈希构成会改变重放判定。
- 阻断条件与 `run-store-v2` 的 Run 状态集耦合（`running`/`queued`）。
- 测试 `case-lifecycle-v3.test.ts` 断言回执序列（`['ArchiveReviewCaseV3','RestoreReviewCaseV3','ArchiveReviewCaseV3']`，`:109-111`）与 `caseArchiveHistory` 长度（`:112`）。

## 9. 测试证据

- `case-lifecycle-v3.test.ts`（151 行，1 describe / 5 test）：CAS+回执单事务与重放/冲突（`:27-54`）、归档阻断全部正常命令（`:56-75`）、恢复 CAS 且不重新批准（`:77-117`）、运行中 Run 阻止归档（`:119-132`）、非法 actor/reason 与未跟踪归档不可写（`:134-150`）。
- `review-v3-legacy-entry-gates.test.ts` 引用 `restoreReviewCaseV3`（3 处，非本批）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出 | 已证实 | `:36`、`:73` |
| 归档三重阻断（运行中/已归档/账矛盾） | 已证实 | `:43-53` |
| 恢复四条件校验 | 已证实 | `:78-81` |
| 恢复不重新批准、旧快照禁执行 | 已证实 | `:85-87`；测试 `:101-102` |
| IPC requestId 由 Main 哈希派生 | 已证实 | `review-ipc.ts:1361-1363`、`:1407-1409` |
| 重放/冲突语义由 `submitCommand` 实现 | 已证实（测试行为） | 测试 `:48-53`；`submitCommand` 实现未逐行读 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `check` | 3.1 | `:20-33` | covered |
| `archiveReviewCaseV3` | 3.2 | `:36-70` | covered |
| `restoreReviewCaseV3` | 3.3 | `:73-97` | covered |
| IPC 调用链 | 4 | `review-ipc.ts:1351-1364`、`:1403-1409` | covered |
| 失败分支 | 6 | — | covered |
| 权限与 requestId 派生 | 7 | — | covered |
| 测试证据 | 9 | — | covered |
