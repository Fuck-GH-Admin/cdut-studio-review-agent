---
path: apps/electron/src/main/lib/review/review-pi-owner-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cb80e050c7c8256d002f2c1315b3f3c388d47427
sha256: dd83ce9be73e5048a0b530656d6b98e0e16fc849ff6acd9d57e761cd9b258699
lines: 496
kind: source
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-pi-owner-adapter.ts

## 1. 结论与边界

V3 Dev-A **Main-only 执行 Owner**（`apps/electron/src/main/lib/review/review-pi-owner-adapter.ts:1-8`）：进程内/跨进程的评审执行租约账本（journal）。**不是** IPC 入口、**不是**第二 Case/Run 存储；C0 业务权威必须为每次受理背书。模型提供的 ID、会话元数据、旧进程日志**从不授予权威**；新进程 epoch 隔离全部旧租约；**持久 ACK 只在账本写成功后返回**。

## 2. 导出与关键符号

`export` 共 **9 个**（1 const + 5 type/interface + 1 函数 + 1 class + 含类方法）。

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3_REVIEW_TOOLS` | 导出 const | `:27-32` | 4 工具：`review_read_documents`/`review_inspect_document_image`/`review_inspect_original`/`review_submit_result` | 工具白名单 |
| `V3ReviewTool` | 导出 type | `:33` | 上表联合 | |
| `V3OwnerState` | 导出 type | `:35` | 6 态：`active`/`paused`/`revoked`/`deleted`/`terminal`/`recovery-required` | 租约态 |
| `V3OwnerLease` | 导出 interface | `:36-54` | 16 字段（grantId/processEpoch/generation/runEvidence?/planSnapshot?/permittedTools/expiresAt/state…） | 租约 |
| `OwnerPersistence` | 导出 interface | `:62-69` | `read`/`write`/`compareAndWrite?`/`withLeaseFence?` | 持久化合同 |
| `V3MainAuthority` | 导出 interface | `:72-82` | `authorizeExecution`/`isCurrent` | Main 授权口 |
| `V3OwnerGrantRequest` | 导出 interface | `:83-92` | 8 字段 | 授予请求 |
| `createFileOwnerPersistence` | 导出函数 | `:166-223` | `(filePath) => OwnerPersistence` | 文件持久化（跨 PID CAS） |
| `V3ReviewOwnerAdapter` | 导出 class | `:229-495` | 见第 3 节 | Owner 主体 |

内部：`OwnerDisk`（`:55-60`）、`SealedLedger`（`:61`）、`EMPTY`（`:93-95`）、`digest`/`own`/`fail`（`:96-101`，`fail` 抛 `C0ContractError('RECOVERY_REQUIRED')`）、`assertLeaseValid`（`:102-132`）、`decode`/`encode`（`:133-159`）。

## 3. 内部逻辑与关键流程

### 3.1 账本完整性（`decode`，`:133-159`）

信封 `{payload, sha256}` 摘要不符 → `Owner journal integrity mismatch`（`:138-141`）；schema 非 `v3-dev-a-owner/1` → `Unsupported Owner journal schema`（`:143-148`）；逐租约 `assertLeaseValid` + 代数单调校验（`:149-154`）。`assertLeaseValid`（`:102-132`）：16 字段全检（manifestHash 64hex、工具白名单、generation≥1…）；`runEvidence`/`planSnapshot` **必须成对**（`:112-114`）且内部 7 项一致（`:115-127`）；来源必须同案（`:128-131`）。

### 3.2 文件持久化（`createFileOwnerPersistence`，`:166-223`）

`atomicReplace`（`:171-193`）：临时文件 `wx` 创建→短写检查→`fsync`→`rename`→目录 `fsync`；`exclusive`（`:194-209`）：`.write-lock` 文件 `wx` 互斥，失败即 `RECOVERY_REQUIRED`（注释：不按年龄/PID 破锁，锁获取不是授权 ACK，`:162-165`）；`lockedWrite`（`:210-216`）：CAS 不符 → `Stale Owner journal snapshot; refusing cross-PID overwrite`。

### 3.3 `V3ReviewOwnerAdapter`（`:229-495`）

- **构造**（`:237-251`）：缺 authority 双方法 → `ACTOR_UNTRUSTED`；读盘 decode；**冷启动把全部 active/paused 旧租约加入 `localDenied`**（`:247-250`，「No old lease may become live merely because Main restarted」）。
- **`assertFresh`/`persist`**（`:253-272`）：每次读校验盘上 revision 未被外进程改（`Owner journal changed outside this process`）；写用 `compareAndWrite` 优先（`:263-267`）。
- **`grant`**（`:275-330`）：合同全检（`CONTRACT_INVALID`）+ 来源在冻结 Run 内（`SOURCE_STALE`，`:290-296`）+ 会话 ID 不可复用（tombstone/previous/localDenied → `CASE_SCOPE_FORBIDDEN`，`:297-301`）+ 代数必须单调（`RUN_IDENTITY_MISMATCH`，`:302-305`）→ `authority.authorizeExecution`（`:307-310`）→ 组租约（grantId=randomUUID）→ **persist 后才返回**（`:324-329`）。
- **`get`**（`:332-343`）：冷租约/被拒 active → 返回 `recovery-required` 视图（`:338-342`）；同进程 pause 是有意调度态（`:335-337` 注释）。
- **`assertOrdinarySession`**（`:346-352`）：评审私有会话不得被普通会话操作触碰（`Review-owned session is private`）。
- **`assertAuthorized`**（`:354-383`）：8 重检查（active/同 epoch/grantId/senderKey/未过期/工具白名单/principal 范围/`isCurrent`）→ `CASE_SCOPE_FORBIDDEN`；来源须命中冻结 allowlist 七元组比对（`:367-380`）→ `SOURCE_STALE`。
- **`withAuthorizedEvent`**（`:390-399`）：授权+事件追加与跨 PID revoke 共锁串行（`withLeaseFence`）。
- **`pause`**（`:406-420`）：仅当前 active Owner；**先 `localDenied` 再落盘**（`:414-415`，写失败不能复活进行中调用）。
- **`resumePaused`**（`:428-453`）：同进程+双授权检查；**轮换 grantId**（`:423-424` 注释：pre-pause 的 in-flight await 永不被 resume 后接受）；commit 后才解禁（`:450-451`）。
- **`settle` 家族**（`:455-472`）：`revoke`/`deleteSession`（加 tombstone）/`settleTerminal`；先禁后写（`:456`、`:460`）。
- **`quarantineInterrupted`**（`:478-494`）：冷启动显式把跨 epoch/被拒的 active|paused 归为 `recovery-required` 并返回 ID 列表。

## 4. 调用者与调用链

- Main-only：宿主每 Main 进程实例化一次（`:226-228` 注释：跨 PID 锁与 Electron 调用绑定是 Dev-C 集成门，不在本文件推断）。
- 出向：`@profer/shared` C0 断言（`assertC0RunEvidenceIdentity`/`assertC0CanonicalPlan`/`assertC0SourceIdentity`/`C0ContractError`）。
- 测试：`review-feishu-owner-boundary.p05.test.ts`（159 行）等 Owner 边界合同测试（见第 9 节）。

## 5. 数据 I/O、读写与副作用

- **文件 I/O**：owner journal（原子替换+CAS+互斥锁，`:166-223`）；`fsync` 双刷（数据+目录）。
- **进程内**：`localDenied: Set`、`journal` 缓存、`revision` 快照。
- **无** 网络/定时器。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 错误 |
| --- | --- | --- |
| journal 损坏/摘要不符/schema 不符 | `:137-148` | `RECOVERY_REQUIRED` 系 |
| 租约字段非法/快照不成对/跨案来源 | `:102-131` | `RECOVERY_REQUIRED` |
| 锁不可用/CAS 过期 | `:199-201`、`:212-214` | `RECOVERY_REQUIRED` |
| grant 合同/来源/复用/代数 | `:288-305` | `CONTRACT_INVALID`/`SOURCE_STALE`/`CASE_SCOPE_FORBIDDEN`/`RUN_IDENTITY_MISMATCH` |
| 授权检查不过 | `:365`、`:378` | `CASE_SCOPE_FORBIDDEN`/`SOURCE_STALE` |
| 外进程改盘 | `:254-256` | `RECOVERY_REQUIRED` |
| resume 资格不符 | `:436`、`:443` | `CASE_SCOPE_FORBIDDEN` |

**恢复**：`quarantineInterrupted()` 显式归类；paused 不自动复活（`:426-427`）；被拒 ID 进程内保持拒绝。

## 7. 权限与权威状态

- C0 双口背书（`authorizeExecution`/`isCurrent`）；模型 ID/旧日志不授权（`:5-7`）。
- 持久 ACK 仅在写成功后（`:7`、`:324-329`）。
- 工具白名单 4 个；来源冻结 allowlist 七元组比对。

## 8. 修改影响面

- journal schema `v3-dev-a-owner/1` 与 decode 严格耦合；升版需迁移策略（当前 fail closed）。
- `V3_REVIEW_TOOLS` 是工具准入白名单；增删需同步租约校验与调用方。
- `localDenied` 先禁后写顺序是安全关键；调整会引入 I/O 失败窗口的越权。

## 9. 测试证据

- `review-feishu-owner-boundary.p05.test.ts`（159 行）、`review-owned-session.p03.test.ts`（98 行）覆盖 Owner/会话边界合同（间接，非本批逐行）。
- **无专属测试文件**在本批 scope 内直接测本类（全树检索 `V3ReviewOwnerAdapter` 测试文件命中见 p05 边界测试）。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个导出（含 class/const/type） | 已证实 | `:27`、`:35-92`、`:166`、`:229` |
| 冷启动隔离旧租约 | 已证实 | `:247-250` |
| grant persist 后才 ACK | 已证实 | `:324-329` |
| resume 轮换 grantId | 已证实 | `:423-424`、`:445` |
| 先禁后写（pause/settle） | 已证实 | `:414-415`、`:456-460` |
| 跨 PID 锁不破龄 | 已证实 | `:162-165` 注释 + `:197-201` |
| p05 边界测试断言细节 | 未知 | 未逐行读（后续 test 手册覆盖） |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 个导出 | 2 | — | covered |
| decode/assertLeaseValid | 3.1 | `:102-159` | covered |
| 文件持久化 | 3.2 | `:166-223` | covered |
| 类方法全 11 个 | 3.3 | `:229-495` | covered |
| 失败/恢复 | 6 | — | covered |
| 权限边界 | 7 | — | covered |
| 测试证据 | 9 | — | covered（间接） |
