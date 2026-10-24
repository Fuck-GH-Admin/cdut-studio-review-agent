---
path: apps/electron/src/main/lib/review/review-v3-main-trust-port.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17f78ce719c31311e528ce0092da0df8283f4460
sha256: cce469a56f9abdaa488d1cb7097c217fac968b8c7bf046270e100d53deabbc18
lines: 226
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-trust-port.ts

## 1. 结论与边界

Dev-C C2-R02：Main 侧对 V3 技术提议（admit/record/seal）的**可信消费者端口**。所有权威依赖由可信 Electron Main 注入（已发布 Plan 校验器、活 A Owner/grant 见证、Host 回执注册表）；不装 IPC、不接受 Renderer Actor、不接受 A outbox“ACK”、不建学校发布者或合成回退（文件头 `apps/electron/src/main/lib/review/review-v3-main-trust-port.ts:1-12`）。

边界：

- 空/缺失 Host 注册表 fail-closed，**绝不**从重启后的不可信 journal 提议体重建 Host 证明（`:9-11`）。
- `assertC2PhysicalOriginalBytes` 重算**实际保存原件字节**的 SHA，而不是事件/DTO 声称值（`:64-66`）。
- 不含数据语义内容校验（“内容相等由 C 的提议校验器再查”，`:158`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 2 个函数 = 5 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2MainOwnerWitness` | 接口（导出） | 28-34 | `{run,permissionGrantId,active,ownerGeneration,inputManifestHash}` | 来自 A Owner/grant 注册表，非提议载荷 |
| `C2MainHostWitness` | 接口（导出） | 37-42 | `{run,permissionGrantId,hostReceiptId,verified:V3VerifiedHostReceipt}` | 必须在 Main 注册的物理 Host 注册表中查得 |
| `C2MainTrustedInputs` | 接口（导出） | 44-51 | `assertPublishedPlan/getCurrentOwner/getPhysicalHostReceipt` | 注入依赖 |
| `assertC2PhysicalOriginalBytes` | 函数（导出） | 68-104 | `(aggregate,versionId)=>void` | 案卷原件物理验真（多处复用） |
| `createC2MainTrustedRunPort` | 函数（导出） | 184-225 | `(input)=>{admit,record,seal}` | 三操作端口 |
| `stable`/`same`/`reject` | 内部 | 53-62 | 键排序 JSON 规范化；抛 `CommandValidationError('DEPENDENCY_UNRESOLVED')` | |
| `verifyBase` | 内部 | 106-139 | 案卷/Plan/Owner/原件全量校验 | |
| `verifyHost` | 内部 | 141-160 | Host 回执身份校验 | |
| `RunCommand`/`EventCommand`/`SealCommand` | 内部类型 | 162-179 | 三命令形状 | |

## 3. 内部逻辑与关键流程

### 3.1 原件物理验真（`assertC2PhysicalOriginalBytes`，`:68-104`）

1. `assertSafeReviewStorageId(caseId)`；`documents` 中 `versionId` 匹配且 active 的恰好 1 条（`Main 当前原件版本不存在或重复`，`:72-75`）。
2. `byteHash` 必须 64hex（`:77-79`）；`assetPath` 必须非绝对、无反斜杠、无空段/`.`/`..`（`原件相对路径非法`，`:80-85`）。
3. `caseRoot=resolve(getConfigDir(),'review-cases',caseId)`；词法 + `realpathSync` 双重防逃逸（`原件路径越过当前案卷`/`原件路径或类型不可信`，`:86-98`）。
4. 重读文件 sha256 与 `byteHash` 比对（`物理原件字节与冻结 Case SHA256 不一致`，`:99-100`）；任何 IO 异常 → `物理原件无法从案卷受控目录读取并重新核验`（`:101-103`）。

### 3.2 基础校验（`verifyBase`，`:106-139`）

Case/阶段一致（`:111-113`）→ Plan 指纹/版本绑定且无 `d2RuntimePlan`（`:114-119`）→ `assertPublishedPlan`（`:120`）→ Owner 见证对齐（`DEPENDENCY_UNRESOLVED: Main 当前 Owner/generation/manifest 不再拥有运行许可`，`:121-128`）→ `sourceVersionIds` 非空唯一后逐个重哈希原件（`:131-137`）。

### 3.3 Host 校验（`verifyHost`，`:141-160`）

事件 `permissionGrantId`/`run` 与 Main 一致（`:147-148`）；注册表查得的回执四重对齐（ID/grant/run/verified.kind）否则 `DEPENDENCY_UNRESOLVED: Main 注册 Host 回执缺失、撤权或跨 Run 复用`（`:149-157`）。

### 3.4 端口（`createC2MainTrustedRunPort`，`:184-225`）

- 构造校验三方法，否则 `C2_MAIN_TRUSTED_INPUT_PORTS_REQUIRED`（`:189-193`）。
- `admit`（`:195-199`）：`admitV3TechnicalRun` + `verifyBase`。
- `record`（`:200-210`）：`recordV3TechnicalProposal` + `verifyBase` + `verifyHost`，返回 `{permissionGrantId,grantActive:true,receipts}`。
- `seal`（`:211-224`）：`sealV3ReviewRun` + `verifyBase`；事件非空且末条 `kind==='terminal'`（`Main 未接收到完整技术 Host terminal`，`:215-217`）；`hostReceiptId` 不重复（`:219`）；逐条 `verifyHost`。

## 4. 调用者与调用链

入向（冻结树 grep）：

- `assertC2PhysicalOriginalBytes` 生产调用者多处：`review-v3-main-local-technical-review.ts:20,101`、`review-v3-main-d4-local-plan.ts:16,106`、`review-v3-main-b1-local-plan.ts:12,48`、`review-v3-main-local-product-intake.ts:18,98`、`review-v3-main-plan-provenance.ts:24,132,158`（本批）、`review-v3-main-pi-factory.ts:16,92`（本批）。
- `createC2MainTrustedRunPort`：生产唯一使用者 `review-v3-main-trusted-assembly.ts:22,83`（本批）；该装配无生产调用者（见其手册）。
- 测试：`review-v3-main-trust-port.test.ts`（本批，7 例）、`review-v3-main-trusted-assembly.test.ts`（本批）、`review-v3-main-host-receipt-registry.test.ts:13`、`review-v3-main-local-technical-review.test.ts`（nb-10 批）。

出向：`@profer/shared` 类型；`../config-paths.ts:1`（`getConfigDir`）；`review-storage-id.ts:8`；`case-store-v2.ts`（`CommandValidationError`）；`review-v3-technical-ledger.ts`（`admitV3TechnicalRun`/`recordV3TechnicalProposal`）；`review-v3-run-writer.ts`（`sealV3ReviewRun`）；`review-v3-execution-contract.ts`（`V3VerifiedHostReceipt`）。

## 5. 数据 I/O、读写与副作用

- 读：案卷受控目录的原件字节（`:93-103`）；每次调用现读现哈希，无缓存。
- 写：端口三操作最终落 `review-v3-technical-ledger`/`review-v3-run-writer` 的既有 writer（本文件不直接写盘）。
- 副作用：无 IPC/网络/日志；错误为 `CommandValidationError('DEPENDENCY_UNRESOLVED',…)`（`:61-62`）。
- 原子性/幂等：由底层 ledger/run-writer 的事务保证；本文件在事务校验回调内执行（`:65-66` 注释）。

## 6. 分支、失败、取消与恢复

| 拒绝 | 触发 | 行 |
| --- | --- | --- |
| `Main 当前原件版本不存在或重复` | 文档匹配 ≠1 | 75 |
| `Main 未登记真实原件 byteHash` | hash 缺失/非法 | 78 |
| `原件相对路径非法`/`原件路径越过当前案卷`/`原件路径或类型不可信` | 路径逃逸 | 84,91,98 |
| `物理原件字节与冻结 Case SHA256 不一致` | 篡改 | 100 |
| `物理原件无法从案卷受控目录读取并重新核验` | IO 异常 | 102 |
| `Main 当前 Case 或业务阶段与 Run 不一致`/`Run 未绑定 Main 当前唯一正式 Plan` | 基础绑定 | 112,118 |
| `Main 当前 Owner/generation/manifest 不再拥有运行许可` | Owner 失效 | 126-127 |
| `Run 原件版本集合无效` | 空/重复 | 133 |
| `Host event 的 Run/grant 身份与 Main 不一致` | 事件身份 | 148 |
| `Main 注册 Host 回执缺失、撤权或跨 Run 复用` | 回执缺失/错配 | 155-156 |
| `Main 未接收到完整技术 Host terminal`/`Run 重复使用 Host receiptId` | seal 前置 | 216,219 |
| `C2_MAIN_TRUSTED_INPUT_PORTS_REQUIRED` | 构造 | 192 |

- 失败后状态：所有拒绝发生在底层事务校验回调内，不产生部分写入（由 ledger/run-writer 事务回滚）。
- 取消/恢复：无取消；恢复 = 修复数据后重试。

## 7. 权限与权威状态

- 三类权威全部注入（`:44-51`）：已发布 Plan（candidate-held 拒绝）、活 Owner/grant（非 Renderer 字段）、物理 Host 注册表。
- 原件权威：以“案卷受控目录内的实际字节”为准（`:64-66`），不信任任何 B 暂存预览哈希（`:129-130`）。
- 冷进程/重启语义：Host 注册表缺失即 fail-closed，绝不从 journal 重建（`:8-11`）。

## 8. 修改影响面

- 改 `assertC2PhysicalOriginalBytes` 影响 6+ 个生产调用者（§4）与多批测试。
- 改 `C2MainOwnerWitness`/`C2MainHostWitness` 影响 `review-v3-main-host-receipt-registry.ts`、`review-v3-main-pi-factory.ts`、`review-v3-main-trusted-assembly.ts`、`review-v3-main-local-technical-review.ts`。
- 改三端口语义影响 `review-v3-technical-ledger.ts`/`review-v3-run-writer.ts` 的回调契约与信任边界测试。

## 9. 测试证据

直接测试：`review-v3-main-trust-port.test.ts`（269 行，7 例，详见其手册）：缺注入端口拒绝、admit→read/check/terminal→seal 到 `requires-human-review`、字节篡改/路径穿越/符号链接拒绝、candidate-held/撤权/轮换拒 ACK、跨 Run 回执替换拒绝、seal 前三类失效拒绝。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

间接：`review-v3-main-trusted-assembly.test.ts`、nb-10 批 `review-v3-main-host-receipt-registry.test.ts`/`review-v3-main-local-technical-review.test.ts`。

缺口：`record` 的事件内容语义（由 C 校验器）、`seal` 的 `C2SealRunPayload` 其余字段、并发/重放、`getConfigDir` 根缺失路径无独立用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 原件验真=重读重哈希+双重防逃逸 | 已证实 | `:68-104` |
| 三操作全部经 verifyBase/verifyHost | 已证实 | `:195-224` |
| Host 缺失 fail-closed、不重建 | 已证实 | `:8-11,149-157` |
| 无 IPC/无网络 | 已证实 | 全文无 ipcMain/网络调用 |
| `createC2MainTrustedRunPort` 生产链止于 trusted-assembly | 已证实（检索：冻结树 `apps`+`packages` 非测试 `*.ts`） | 见 §4 |
| C 校验器内容语义 | 未知（文件外） | `review-v3-technical-ledger.ts` 未逐行读 |
| 并发事务行为 | 未知 | 无测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertC2PhysicalOriginalBytes` | §3.1 | 68-104 | covered |
| `verifyBase` | §3.2 | 106-139 | covered |
| `verifyHost` | §3.3 | 141-160 | covered |
| `createC2MainTrustedRunPort` | §3.4 | 184-225 | covered |
| 权威注入/冷进程语义 | §7 | 44-51 | covered |
| 生产调用链 | §4 | 检索记录 | covered（范围已声明） |
| ledger/run-writer 内部 | §9,§10 | — | unknown |
