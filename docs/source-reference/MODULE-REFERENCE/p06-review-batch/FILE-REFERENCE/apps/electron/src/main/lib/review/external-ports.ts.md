---
path: apps/electron/src/main/lib/review/external-ports.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: de8d2bc1b600112184acd59a8af51fa94ab54879
sha256: 921fb381f2b3bd99526104575a00fa84efdd1e1377a413db039c6716b3cd1e6a
lines: 268
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/external-ports.ts

## 1. 结论与边界

外部系统端口（文件头 `:1-8`，M5）：同一合同两种实现——`MockSchoolAdapter`（进程内模拟校方：幂等 actionId、外部版本推进、可制造冲突）与 `LocalPackageAdapter`（离线包两段式 outbox，U 盘场景，复用 `exportHandoffPackage/importHandoffPackage`）。合同：动作幂等（重复回放同回执）、期望外部版本不符→conflict（C02）。S 类真实联调待外部条件不在本轮。

不做的事：不做持久 outbox 重放语义（`batch-store.pushViaOutbox` 才是持久层）；不做真实认证传输（`buildAcknowledgement` 是本地演示应答器，`:218`）；不解析业务 body。

## 2. 导出与关键符号

| 符号 | 类型/类 | 行 | 说明 |
| --- | --- | --- | --- |
| `PushPayload` | interface | `:18-25` | `{caseId; actionId; actionKind:decision\|supplement\|roster\|rating-matrix; baseExternalRevision; body}` |
| `SchoolPort` | interface | `:28-31` | `{kind; push(payload) => Promise<SyncReceipt>}` |
| `ExternalCaseSnapshot/ExternalTaskSnapshot/ExternalVerification` | interfaces | `:34-54` | 可替换外部读取能力（不要求真实学校提供未授权 API，`:33`） |
| `SchoolReadPort` | interface | `:55-61` | SchoolPort + capabilities/fetchCase/listTasks/verify/getReceipt |
| `MockSchoolAdapter` | class | `:64-140` | 内存模拟校方 |
| `OfflinePortAcknowledgement` | interface | `:147-156` | 离线回执信封（含 requestHash/baseExternalRevision） |
| `LocalPackageAdapter` | class | `:182-268` | 两段式离线 outbox |

内部：`pushHash`（`:162-164`）、`issuedFile`（`:165-170`，actionId 的 **sha256 作文件名**——“actionId 不是文件路径” `:168`）、`readIssued/saveIssued`（`:171-181`，tmp+rename）。

## 3. 内部逻辑与关键流程

### 3.1 `MockSchoolAdapter.push`（`:100-139`）

1. 幂等含载荷身份（`:102`）：已有回执时 `payloadHash` 相同→原回执；不同→`rejected`（“同 actionId 载荷漂移”）。
2. `baseExternalRevision !== current` → `conflict` 回执（“外部版本已推进：当前 X，推送方持有 Y”）。
3. 否则版本+1、同步 caseView.revision、`accepted` 回执（externalId `ext-{caseId}-{n}`）并记录回执+哈希。
4. `setOnline(false)` 后全部操作抛 `MOCK_PORT_OFFLINE`（`:86`）；`seedRevision` 可拨版本制造冲突（`:93-98`）。

### 3.2 `LocalPackageAdapter.push`（`:186-211`）

- 已发出的同 actionId：哈希不同 → `rejected`（“相同 actionId 的载荷不同，拒绝覆盖”）；相同 → 原回执。
- 版本不符 → `conflict`（“外部版本不一致，请重新导出”）。
- 否则 `exportHandoffPackage({...payload, externalRevision})` 生成便携包，回执 `awaiting-receipt`，落盘 `sync-outbox/offline-port/{sha256(actionId)}.json`。**push 只签发文件，接受需独立回执 `confirm`**（`:142-146` 注释：“不是自验证 mock”）。

### 3.3 `buildAcknowledgement`/`confirm`（`:219-267`）

- `buildAcknowledgement`：导入请求包校验后生成回执信封（`requestHash=contentHash`）；注释标明真实 SchoolPort 须换认证传输（`:218`）。
- `confirm`：无发出记录拒；终态（accepted/rejected）幂等返回；导入回执校验四要素（actionId/caseId/requestHash/baseExternalRevision，`:245-247`，不符“回执关联动作/包/版本不匹配”）；导出后本地外部版本变化 → `conflict`（落盘）；否则按 `body.accepted` 记 accepted/rejected（“独立副本已确认接收/拒绝”）并落盘。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`batch-store.pushViaOutbox/recoverPendingPushes`（`SchoolPort` 消费，`batch-store.ts:16`）；`review-ipc.ts:368/:1065` 推送链、`review-principal-service`/`review-v3-f18-school-profile`（类型/端口引用）；`review-ipc-actor-guard.ts:5` 类型。出向：`config-paths`、`report-service-v2.{exportHandoffPackage,importHandoffPackage}`、`node:fs/crypto`。

## 5. 数据 I/O、读写与副作用

- **Mock**：纯内存（6 个 Map + online 开关）。
- **Local**：`sync-outbox/offline-port/{hash}.json` 原子写（tmp+rename）；`getIssuedPackage` 导出便携包给独立副本。
- 副作用：无日志/网络（Local 是文件往返）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| Mock 离线 | `:86` | `MOCK_PORT_OFFLINE` throw |
| 载荷漂移（两实现） | `:107/:190-193` | rejected |
| 外部版本不符 | `:110-121/:197-202/:249-255` | conflict |
| confirm 无记录/终态/关联不符 | `:240-247` | throw/幂等/throw |
| 取消 | 无 | 无 AbortSignal |
| 恢复 | Local 落盘 | issued 文件重启可读（`readIssued`）；重放语义在 batch-store outbox |

## 7. 权限与权威状态

- **合同即权威**：actionId 幂等（含载荷身份）、外部版本 CAS（C02）。
- Local 的接受必须独立回执（`confirm`），不自验证（`:142-146`、`:234`）；`buildAcknowledgement` 明示是本地演示应答器。
- `capabilities()` 声明 mock 无 identity 能力（`:85`）——不冒充校方身份核验。

## 8. 修改影响面

改合同形状 → 影响 `batch-store` outbox 推送/恢复与测试；改 `exportHandoffPackage` 依赖 → 报表交接链路；`PushPayload.actionKind` 与 outbox 校验（`batch-store.assertOutboxPayload` 4 值）联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `external-ports.test.ts`（详见其手册）；`batch-store.test.ts` 的 outbox 用例以 `MockSchoolAdapter` 为端口间接覆盖。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 合同：幂等含载荷身份+版本 conflict | 已证实 | `:102-121`、`:189-202` |
| Local 是两段式 outbox 非自验证 mock | 已证实 | `:142-146/:234-267` |
| actionId 不作路径（sha256 文件名） | 已证实 | `:165-170` |
| Mock 可下线/拨版本 | 已证实 | `:74/:93-98` |
| confirm 四要素关联校验 | 已证实 | `:245-247` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型合同（6） | 2 | `:18-61` | covered |
| `MockSchoolAdapter` push/幂等/冲突/离线 | 3.1 | `:64-140` | covered |
| `LocalPackageAdapter` push/getIssued | 3.2 | `:182-216` | covered |
| `buildAcknowledgement`/`confirm` | 3.3 | `:219-267` | covered |
