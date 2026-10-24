---
path: apps/electron/src/main/lib/review/review-v3-main-b20-current-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ab581e104f89007f18f13ea9dc56327db13bf1e
sha256: 5dce5017f393f894aa6a0b6073f4e1090994e1e251f023d4bcdf7645f39e1165
lines: 287
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b20-current-registry.ts

## 1. 结论与边界

C-R10 特权 Main 的“当前 B20 候选注册表”：一个**进程内临时**的源选择缓存，负责 (a) 接受特权 Main 注册的候选（B1 冻结作者 + B19 源选择 + B2 真实暂存），(b) 把自己作为 `CMainB20PhysicalSources` 安装进 `installCMainV3PhysicalB20Sources`，从而给 B20 读取链提供“当前候选/grant/pin/原始 ZIP 私钥”四类权威查询。

边界（文件头 `apps/electron/src/main/lib/review/review-v3-main-b20-current-registry.ts:1-9`）：

- 不是第二个 Case/SourceLedger/B1 作者库/B2 归档保险库/Run/学校政策/发布者。
- 冷启动无任何注册源；不铸造本地 Principal；`nativePickZipPath` 缺省用 `createCMainElectronNativeArchiveChooser()`（真实 OS 选择器，`:119`）。
- 无 IPC 注册：注册/安装只能由特权 Main 代码调用（`registerFromTrustedMain` 注释 `:156-159`）。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 1 个类 = 3 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainB20PhysicalHost` | 接口（导出） | 54-73 | `current(templateId)`/`mayRead(identity,templateId)`/`currentNativeScope()`/`mainIssuedPhysicalKey(id,archiveId)`/`nativePickZipPath?` | Main 侧宿主：当前 scope+grant、权限、物理 scope、私有 ZIP key、OS 选择器 |
| `CMainB20Registration` | 接口（导出） | 74-79 | `{templateId,caseCandidateId,expected:CMainB20PinnedExpectation,selections:B19SourceSelection[]}` | 注册输入 |
| `CMainB20CurrentRegistry` | 类（导出） | 86-287 | `implements CMainB20PhysicalSources` | 注册表本体 |
| `Registered` | 内部接口 | 80-84 | `{identity,grant,expected,selections}` 克隆存储 | 私有 |
| `reject`/`idOK`/`caseOK`/`digest`/`same`/`sameIdentity` | 内部 | 39-52 | 抛 `C_MAIN_B20_CURRENT_<code>`；模板名/案卷 ID/64hex 校验；JSON 相等；8 字段身份相等 | 同一函数注释强调“JSON 键序不是身份属性”（`:46-47`） |

类字段/方法：`bSources`（`:88`）、`nativePicker`（`:89`）、`registered` Map（`:90`）、`closed`（`:91`）、`installed`（`:92`）；构造器 `:93-120`；`requireOpen` `:121`；`currentRegistration` `:122-130`；`assertCurrent` `:131-138`；`registerFromTrustedMain` `:143-213`；`currentCandidate` `:214-219`；`canReadCandidate` `:220-225`；`currentPinnedAuthor` `:226-231`；`currentSelections` `:232-245`；`currentMainIssuedOriginalKey` `:246-256`；`assertLiveCMainIdentity` `:257-264`；`install` `:265-273`；`revoke` `:274-278`；`close` `:279-287`。

## 3. 内部逻辑与关键流程

### 3.1 构造（`:93-120`）

- 校验 `host` 四个方法存在，否则 `PHYSICAL_MAIN_OWNER_AND_PICKER_AUTH_REQUIRED`（`:94-98`）。
- 未给 `sources` 时自建一套 B2 栈：`ReviewB2StagingService` + `ReviewB2SourceVersionAdapter` + `ReviewB2ArchiveVault` + `ReviewB2InputLedger`（`:101-106`）；给定则用调用方实例（必须与创建候选时同一实例，见 `review-v3-main-b20-physical-composition.ts:36-39` 注释）。
- `nativePicker = new CMainNativeArchiveRegistry({currentScope, assertCurrentArchive, pickZipPath})`（`:107-119`）：`assertCurrentArchive` 在关闭/身份漂移/数值帧缺失时拒绝（`REGISTRY_CLOSED`/`PHYSICAL_MAIN_ARCHIVE_SCOPE_REVOKED`/`NUMERIC_MAIN_SCOPE_ABSENT`，`:111-117`），并用 `vault.inspect` 校验归档 SHA/字节数（`B_VAULT_ORIGINAL_CHANGED`，`:118-122`）。

### 3.2 当前性判定

- `currentRegistration(templateId)`（`:122-130`）：注册项存在且 `host.current` 返回的 identity/grant 与注册时相同、`host.mayRead` 仍真；否则 `undefined`（即“无当前候选”，不是错误）。
- `assertCurrent(caseCandidateId)`（`:131-138`）：按 caseCandidateId 扫 `registered`，命中后走 `currentRegistration`。

### 3.3 注册（`registerFromTrustedMain`，`:143-213`）

1. `requireOpen`；输入形状：`templateId`（`idOK`）、`caseCandidateId`（`caseOK`）、`expected.templateId` 相等、`revision≥1` 安全整数、两个 digest 64hex、`selections` 数组且 ≤4096，否则 `CURRENT_CANDIDATE_REGISTRATION_INVALID`（`:144-153`）。
2. 已存在 → `REGISTRATION_EXISTS_REVOKE_FIRST`（`:154-155`）。
3. `host.current` 必须存在且 caseCandidateId 相等、grant 三字段与 identity 对齐、`mayRead` 真，否则 `CURRENT_MAIN_GRANT_NOT_INSTALLED`（`:156-163`）。
4. **真实 B1 源校验**：`readB1AuthorRevision` + `readB1FrozenCandidate(templateId, expected.frozenFingerprint)`；要求修订/digest/fingerprint 对齐且 `frozen.status==='candidate-held'`，否则 `REAL_B1_FROZEN_CURRENT_SOURCE_REQUIRED`（`:164-170`）；再 `verifyReviewB1Descriptor(latest.document, frozen.descriptor)`（`:171`）。
5. `staging.assertStillGranted(bctx)`（`:181`），`bctx` 由 `host.current` 的 numeric 帧派生（`:172-180`）。
6. 逐条校验 `selections`：字段齐全、`requiredRole ∈ {application,supporting}`（`B19_SELECTION_INCOMPLETE`，`:186-191`）；`[checkKey,targetKey,sourceId]` 必须在 `frozen.descriptor.bindingDetails` 展开的期望集合中且不重复（`B19_SELECTION_NOT_IN_FROZEN_AUTHOR`，`:192-194`）；`staging.getCandidate`/`vault.inspect` 验证候选与归档真实存在（`:195-198`）。
7. 注册前再取 `host.current` 快照比较（identity/grant/numeric/mayRead），变化 → `MAIN_SCOPE_CHANGED_DURING_REGISTRATION`（`:199-203`）；然后克隆入库（`:204-209`）。

### 3.4 查询接口

- `currentCandidate`（`:214-219`）：当前注册 + principalId 相等才返回 `{caseCandidateId,grant}` 克隆。
- `canReadCandidate`（`:220-225`）：principal/case/grant 全等。
- `currentPinnedAuthor`（`:226-231`）：返回 `expected` 克隆（pin）。
- `currentSelections`（`:232-245`）：scope 六字段 + `same(expected,author)` 全等才返回 selections 克隆，否则 `null`（空选择 = UNKNOWN，不是 PASS）。
- `currentMainIssuedOriginalKey`（`:246-256`）：身份一致才向 `host.mainIssuedPhysicalKey` 要 key；仅接受长度 1–256 的字符串，否则 `null`。
- `assertLiveCMainIdentity`（`:257-264`）：身份不一致 → `C_MAIN_PRINCIPAL_FRAME_OR_OWNER_REVOKED`。

### 3.5 生命周期

- `install()`（`:265-273`）：`installCMainV3PhysicalB20Sources(this)`，重复安装拒绝（`ALREADY_INSTALLED`，`:267`）；返回卸载闭包（按实例）。
- `revoke(templateId)`（`:274-278`）：删注册 + `nativePicker.revoke()`。
- `close()`（`:279-287`）：卸载、清空注册、关 picker、`closed=true`；此后一切调用 `REGISTRY_CLOSED`。

## 4. 调用者与调用链

入向（冻结树 grep，排除测试）：**无生产调用者**。唯一使用者是 `review-v3-main-b20-physical-composition.test.ts:29-30`（import）与 `:316`（`new CMainB20CurrentRegistry(host, f.entry.bSources)`）。

出向（关键依赖定义点）：`review-template-author-store-v3-b1.ts:120,211`（B1 修订/冻结读取）、`review-template-plan-adapter-v3-b1.ts:305`（`verifyReviewB1Descriptor`）、`review-intake-adapter-v3-b2.ts:79`（`ReviewB2StagingService`）、`review-source-version-adapter-v3-b2.ts:194`、`review-import-checkpoint-v3-b2.ts:58`（`ReviewB2ArchiveVault`）、`review-import-ledger-v3-b2.ts:94`（`ReviewB2InputLedger`）、`review-v3-main-native-archive-registry.ts:104,175`（`CMainNativeArchiveRegistry`/OS 选择器）、`review-v3-main-b20-physical-composition.ts:108`（`installCMainV3PhysicalB20Sources`，`:268` 调用）。

由于本类无生产入口，它所实现的 `CMainB20PhysicalSources`（含 `currentCandidate`/`canReadCandidate`/`currentPinnedAuthor`）在生产也未接入 `installCMainV3B20ReadAuthorities`（该链最终回到 `review-v3-main-author-plan-ipc.ts:107`，生产无安装点）。

## 5. 数据 I/O、读写与副作用

- 读：B1 作者库（修订/冻结）、B2 暂存（`assertStillGranted`/`getCandidate`）、B2 归档库（`inspect`）。
- 写：仅进程内 `registered` Map 与 `nativePicker` 状态；不落盘、不写案卷。
- 副作用：构造 `CMainNativeArchiveRegistry`；`nativePickZipPath` 缺省时创建 Electron OS 选择器（`:119`）。
- 并发/原子性：注册全程同步、末尾再比较 `host.current`（`:199-203`）防注册期间漂移；跨异步无锁（本文件无 await）。
- 幂等：注册同 templateId 第二次拒绝（`:154-155`）；`close` 幂等（`:280`）。

## 6. 分支、失败、取消与恢复

| 错误（前缀 `C_MAIN_B20_CURRENT_`） | 触发 | 行 |
| --- | --- | --- |
| `PHYSICAL_MAIN_OWNER_AND_PICKER_AUTH_REQUIRED` | host 缺方法 | 97 |
| `REGISTRY_CLOSED` | 关闭后调用 | 111,121,132,266 |
| `PHYSICAL_MAIN_ARCHIVE_SCOPE_REVOKED`/`NUMERIC_MAIN_SCOPE_ABSENT`/`B_VAULT_ORIGINAL_CHANGED` | 归档校验 | 114-122 |
| `CURRENT_CANDIDATE_REGISTRATION_INVALID` | 注册输入形状 | 153 |
| `REGISTRATION_EXISTS_REVOKE_FIRST` | 重复注册 | 155 |
| `CURRENT_MAIN_GRANT_NOT_INSTALLED` | grant/权限未就位 | 163 |
| `REAL_B1_FROZEN_CURRENT_SOURCE_REQUIRED` | B1 源不真实/不当前 | 170 |
| `B19_SELECTION_INCOMPLETE`/`B19_SELECTION_NOT_IN_FROZEN_AUTHOR` | 选择非法/越权 | 191,194 |
| `MAIN_SCOPE_CHANGED_DURING_REGISTRATION` | 注册期间漂移 | 203 |
| `C_MAIN_PRINCIPAL_FRAME_OR_OWNER_REVOKED` | `assertLiveCMainIdentity` 失败 | 263 |
| `ALREADY_INSTALLED` | 重复 install | 267 |

- 失败后状态：注册失败不入库（`:204-209` 只在成功后写）；`revoke` 后该模板查询返回 `undefined`/`null`（不是错误）。
- 取消/恢复：无取消；`close` 后不可复活（`closed` 单向）。冷进程重启后注册表为空，需要重新注册（文件头 `:8`）。

## 7. 权限与权威状态

- 本文件不做 sender 检查；权威完全来自 `CMainB20PhysicalHost`（Main 侧身份/权限/私钥）与 B1/B2 真实存储校验（`:144-198`）。
- `currentSelections` 的空值语义：返回 `null` = UNKNOWN，绝不等于通过（文件头 `:14`）。
- `currentMainIssuedOriginalKey` 的 key 是“Main 在初次物理导入时铸造的不透明 ZIP key”，绝不经 IPC 响应泄露（`review-v3-main-b20-physical-composition.ts:54-62` 注释与本文件 `:246-256`）。
- **生产现状**：无生产调用者（§4），因此这些权威查询在生产未接线（已证实：检索范围冻结树 `apps/`+`packages/` 非测试 `*.ts`/`*.tsx`）。

## 8. 修改影响面

- 改 `CMainB20PhysicalHost`/`CMainB20Registration` 会影响 `review-v3-main-b20-physical-composition.ts`（实现 `CMainB20PhysicalSources` 的对偶接口）与 `review-v3-main-author-plan-ipc.ts` 的 B20 回调。
- 改注册校验会影响 `review-v3-main-b20-physical-composition.test.ts:292-344` 的断言（`B19_SELECTION_NOT_IN_FROZEN_AUTHOR`/`REGISTRATION_EXISTS_REVOKE_FIRST`/`MAIN_IDENTITY_NOT_INSTALLED`）。
- 改 `nativePicker` 构造会影响 `review-v3-main-native-archive-registry.ts` 的行为契约。

## 9. 测试证据

直接测试：仅 `review-v3-main-b20-physical-composition.test.ts`（本批）第 7 个用例“real Main-local current candidate registration+native repick is the single B20 runtime source”（`:292-344`）：伪造选择 → `B19_SELECTION_NOT_IN_FROZEN_AUTHOR`；重复注册 → `REGISTRATION_EXISTS_REVOKE_FIRST`；安装后 repick 成功、preview `bindings` 全 `linked-candidate`；`registry.revoke` 后读取 → `MAIN_IDENTITY_NOT_INSTALLED`。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（检索范围：冻结树 `apps/`/`packages/` 测试文件）：无其它测试 import 本模块；未覆盖 `close()`、`currentSelections` 的 `null` 分支、`currentMainIssuedOriginalKey` 长度校验、`assertCurrent` 多候选扫描、`MAIN_SCOPE_CHANGED_DURING_REGISTRATION`、归档校验三分支。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 进程内临时缓存，无落盘 | 已证实 | `:1-9,90-91`；全文无 `fs` 写 |
| 注册须真实 B1 冻结源 + 选择属于冻结作者 | 已证实 | `:164-198` |
| 注册末尾防漂移 | 已证实 | `:199-203` |
| 选择空 = UNKNOWN | 已证实 | 文件头 `:14`；`:243-244` |
| 无生产调用者 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`/`*.tsx`） | 模块名 0 命中 |
| 生产 B20 链因此未接线 | 推断 | 与 `review-v3-main-author-plan-ipc.ts:311-312` 的 fail-closed 合并推导 |
| `createCMainElectronNativeArchiveChooser()` 的 OS 行为 | 未知 | 未读该函数全文；未运行 |
| 并发注册（多 Main 线程） | 未知 | 无锁、无测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造/host 校验/自建 B2 栈 | §3.1 | 93-120 | covered |
| `currentRegistration`/`assertCurrent` | §3.2 | 121-138 | covered |
| 注册全链 | §3.3 | 143-213 | covered |
| 查询接口 | §3.4 | 214-264 | covered |
| install/revoke/close | §3.5 | 265-287 | covered |
| 权限/UNKNOWN 语义 | §7 | 232-256 | covered |
| `close`/`currentSelections` null/长度校验 | §9 | 246-256,279-287 | partial |
| 生产接线 | §4,§10 | 检索记录 | covered（范围已声明） |
