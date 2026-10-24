---
path: apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6674944cbb58dd568d414e613363397afe7469b4
sha256: 6e4f6eec90143e61151b4e0cc75ccabea53c09d11825ada5a9b7d76fbc790f5f
lines: 521
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts

## 1. 结论与边界

本文件是 Electron Main 侧“作者读取 + 正式 Plan 升级”的真实 IPC 层（C-MAIN-WIRE-R01/R02/REMOVAL-R01）：注册 4 个 `REVIEW_IPC_CHANNELS` handler，并在 handler 内部把渲染层请求转换为**由特权 Main 注入的独立授权源**（B1 作者库读取、已发布 Plan 出处校验、物理 Host 人类删除同意）驱动的读取/写入。核心设计是 fail-closed：任何授权源未安装、被卸载、被轮换，或渲染层携带身份/凭证字段，一律拒绝。

边界：

- 本文件不自己读写磁盘/网络：B1 读取经注入的 `readLatestB1AuthorRevision`，Case 写入经 `plan-binding-v3.ts` 的 `upgradeCanonicalPlanV3`（Case CAS）。
- 不创建学校发布者、Case Owner、Actor 或候选资格；渲染层只能提交 `templateId`（读）或 `caseId/requestId/expectedRevision/payload.plan/...`（升级）等业务参数。
- 不负责 B1/B2/B19/B20 数据语义；B20 部分只做授权边界，数据语义在 `review-v3-b1-b2-main-read-bundle-v3-b.ts`。
- 没有 IPC 路径可以安装/替换任何授权源（`:138-142` 注释与实现一致：安装函数只在 Main 代码中可调）。

## 2. 导出与关键符号

`export` 逐条核对：6 个接口 + 10 个函数 = 16 个导出（类 0、常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainV3Grant` | 接口（导出） | 51-56 | `{ownerId,generation,authorityEpoch}` | 只能由特权 Main 的 Owner/grant 注册表提供；`authorityEpoch` 在 revoke/换 Owner/换窗口时轮换 |
| `CMainV3AuthorReadAuthorities<T>` | 接口（导出） | 64-69 | `getAuthorGrant/canReadAuthor/readLatestB1AuthorRevision` | B1 候选作者读取授权（不需学校发布者） |
| `CMainV3PlanUpgradeAuthorities` | 接口（导出） | 71-78 | `getCaseGrant/canUpgradeCase/publishedPlanSource/removalConsentSource?` | 正式 Case 计划升级授权；`removalConsentSource` 缺省即删除默认拒绝 |
| `CMainV3AuthorPlanAuthorities<T>` | 接口（导出） | 80-81 | 读写合并（兼容旧安装者） | 同时实现读与写授权 |
| `CMainV3B20ReadAuthorities` | 接口（导出） | 87-103 | `currentCandidate/canReadCandidate/currentPinnedAuthor/readCurrentB20Bundle/repickNativeArchive?` | B20 候选读取授权；`repickNativeArchive` 缺省时用户请求默认拒绝 |
| `installCMainV3B20ReadAuthorities` | 函数（导出） | 107-115 | `(next)=>()=>void` | 安装 B20 读取源；重复安装抛 `B20_READER_ALREADY_INSTALLED`；返回卸载闭包 |
| `installCMainV3AuthorReadAuthorities` | 函数（导出） | 143-150 | `(next)=>()=>void` | 安装作者读取源；重复安装抛 `AUTHOR_READER_ALREADY_INSTALLED` |
| `installCMainV3PlanUpgradeAuthorities` | 函数（导出） | 152-167 | `(next)=>()=>void` | 安装计划升级源 + `CMainRemovalConsentGate`；卸载时 `removalGate.close()` |
| `installCMainV3NativePlanUpgradeAuthorities` | 函数（导出） | 170-184 | `(source)=>()=>void` | 用 `createCMainElectronRemovalObserver()` 物理人类同意观察器包装安装；失败时关闭观察器并保持既有注册不变 |
| `installCMainV3AuthorPlanAuthorities` | 函数（导出） | 187-202 | `(next)=>()=>void` | 旧式原子双安装；任一槽位已被占用即抛 `AUTHORITIES_ALREADY_INSTALLED` |
| `handleCMainAuthorLatestRead` | 函数（导出） | 263-296 | `(event,input)=>Promise<CMainAuthorReadResult>` | `AUTHOR_READ_LATEST_V3` 处理器 |
| `handleCMainB20CandidateRead` | 函数（导出） | 302-362 | `(event,input)=>Promise<CMainB20CandidatePreview>` | `B20_CANDIDATE_READ_V3` 处理器 |
| `handleCMainB20NativeArchiveRepick` | 函数（导出） | 369-424 | `(event,input)=>Promise<ack>` | `B20_NATIVE_REPICK_V3` 处理器（原生 OS 文件选择） |
| `CMainV3UpgradeIntent` | 接口（导出） | 426-434 | `{caseId,requestId,expectedRevision,payload:{plan,previousFingerprint,acknowledgement,removalAck?}}` | 升级请求形状 |
| `handleCMainUpgradeCanonicalPlan` | 函数（导出） | 459-514 | `(event,input)=>Promise<ReviewCommandResult>` | `UPGRADE_CANONICAL_PLAN_V3` 处理器 |
| `registerCMainV3AuthorPlanIpc` | 函数（导出） | 516-521 | `()=>void` | 无条件注册 4 个 handler；缺授权源时由 handler 拒绝 |
| `refuse`/`safe`/`own` | 内部 | 46-48 | 抛 `C_MAIN_V3_IPC_<reason>`；≤128 非空串；`hasOwnProperty` | 拒绝原语 |
| `CMainB20Installation`/`b20ReadInstallation` | 内部 | 105-106 | `{source,token:string}` 单例槽 | B20 读取源安装槽 |
| `MainInstallation<T>`/`authorReadInstallation`/`planUpgradeInstallation` | 内部 | 117-122 | `{source,token:symbol,removalGate?}` 单例槽 | 作者读/计划写安装槽 |
| `validateReader`/`validateWriter` | 内部 | 124-136 | 形状校验；写校验含 `new C2MainPublishedPlanProvenance(...)` | 只验依赖形状，不验学校签发 |
| `requireAuthorReader`/`requirePlanWriter` | 内部 | 205-212 | 取槽或 `INDEPENDENT_AUTHORITIES_NOT_INSTALLED` | fail-closed 取源 |
| `assertCurrentAuthorReader`/`assertCurrentPlanWriter` | 内部 | 213-219 | 槽实例不等即 `AUTHORITY_INSTALLATION_REVOKED` | await/CAS 期间重查 |
| `liveFrame` | 内部 | 221-236 | `(event)=>{principalId,sessionId,windowId,frameId}` | C0 sender 校验 + 主窗口 + `processId:routingId` |
| `checkGrant`/`sameGrant` | 内部 | 238-247 | 校验并克隆 grant / 三字段相等 | grant 形状与比较 |
| `liveAuthorIdentity` | 内部 | 249-261 | frame + grant → `CMainAuthorReadIdentity` | 每次调用重取 |
| `assertCaseInput` | 内部 | 437-454 | 校验升级意图形状、拒绝凭证字段 | `UPGRADE_*` 拒绝原语 |
| `actorOf` | 内部 | 456-457 | `(principal)=>Actor` 固定 `role:'reviewer'`、`actorSource:'local'` | 由 Main 派生 Actor |

## 3. 内部逻辑与关键流程

### 3.1 授权安装槽（进程内单例，fail-closed）

三个模块级槽：`b20ReadInstallation`（`:105-106`）、`authorReadInstallation`/`planUpgradeInstallation`（`:121-122`）。安装语义：

- 重复安装拒绝（`B20_READER_ALREADY_INSTALLED` `:108`；`AUTHOR_READER_ALREADY_INSTALLED` `:145`；`PLAN_WRITER_ALREADY_INSTALLED` `:154,172`；`AUTHORITIES_ALREADY_INSTALLED` `:188-189`）。
- 卸载闭包只在“当前槽仍是自己”时清空（`:114`、`:149`、`:165-166`、`:198-200`），因此卸载→重装**同一对象**后，旧请求捕获的安装 token 已失效（`assertCurrent*` 用实例相等判断，`:213-219`）。
- `installCMainV3PlanUpgradeAuthorities` 每次安装都新建 `CMainRemovalConsentGate`，卸载时 `close()`（`:155,165-166`）；`installCMainV3NativePlanUpgradeAuthorities` 额外持有 Electron 物理观察器，安装失败会先关观察器再抛错（`:171-183`）。
- `validateWriter` 会构造 `C2MainPublishedPlanProvenance`（`:130-136`）：只校验依赖形状；真实政策证明只在 Case CAS 内由该类校验。

### 3.2 身份与 grant（`liveFrame`/`checkGrant`）

`liveFrame`（`:221-236`）：先 `assertC0ReviewMainSender(event)`（`review-c0-authority.ts:21-28`，要求主窗口主框架），再要求主窗口存活、`senderFrame.processId/routingId` 为安全整数，派生 `principalId='local-reviewer'`、`sessionId='local-main-webcontents:'+sender.id`、`windowId='main-webcontents:'+main.webContents.id`、`frameId=processId+':'+routingId`。`checkGrant`（`:238-243`）拒绝缺失/非法 grant 并克隆。

### 3.3 作者读取（`handleCMainAuthorLatestRead`，`:263-296`）

1. `liveFrame(event)`（`:264`）。
2. 入参必须是普通对象；含 `actor/principal/authorId/sourceIdentity/publication` 任一键 → `RENDERER_CREDENTIAL_CLAIM`（`:267-269`）；`templateId` 必须为字符串（`:270-271`）；`expectedRevision` 若给必须是安全整数（`:273-275`）。
3. `requireAuthorReader()`（`:276`）：无安装 → `INDEPENDENT_AUTHORITIES_NOT_INSTALLED`。
4. 构造 `CMainTrustedAuthorRevisionRead`（`:277-295`）：`currentIdentity` 每次重取 `liveAuthorIdentity`（frame+grant）；`canRead` 先比较七字段身份一致，再调 `authority.canReadAuthor`；`readLatestAuthorRevision` 透传到注入的 B1 读取。
5. 返回 `port.readLatestAuthorRevision(scope, expected)`（`:296`）；双重读取与冲突语义在 `review-v3-main-author-revision-read.ts`（见该手册）。

### 3.4 B20 候选读取（`handleCMainB20CandidateRead`，`:302-362`）

1. `liveFrame`；入参**只能**有 `templateId` 一个键（`:305-307`），`templateId` 须匹配 `/^[A-Za-z][A-Za-z0-9._-]{0,79}$/`（`:308-310`）；否则 `B20_RENDERER_CREDENTIAL_OR_SOURCE_CLAIM`/`B20_TEMPLATE_ID_INVALID`。
2. 无 `b20ReadInstallation` → `B20_TRUSTED_SOURCE_NOT_INSTALLED`（`:311-312`）。
3. 构造 `CMainB20TrustedCandidateRead`（`:316-351`）：`current` 从 `source.currentCandidate` 取 caseCandidateId+grant 并 `assertSafeReviewStorageId`；`canRead` 重取当前身份逐字段 JSON 相等 + grant 三字段相等 + `source.canReadCandidate`；`readCurrentBundle` 额外要求数值帧（`sender.id`/`routingId`）与 `liveFrame` 派生一致，否则 `B20_NUMERIC_MAIN_FRAME_NOT_CURRENT`（`:337-347`）。
4. 返回 `reader.read(templateId)`（`:362`）；双重读取/脱敏在 `review-v3-main-b20-trusted-candidate-read.ts`。

### 3.5 原生归档重选（`handleCMainB20NativeArchiveRepick`，`:369-424`）

- 入参只能是 `templateId`（同上正则）+ `archiveId`（`/^[a-f0-9]{40}$/`）（`:373-380`）。
- 起点快照 `atStart=liveFrame(event)`（`:371`）；`current()` 每次重取并比较 `JSON.stringify(atStart)===JSON.stringify(frame)`，不等 → `B20_MAIN_PHYSICAL_FRAME_CHANGED`（`:391-393`）。
- 需要 `src.repickNativeArchive` 函数，否则 `B20_NATIVE_PICKER_NOT_INSTALLED`（`:383-385`）；当前候选缺失/ACL 撤销/无 pin 分别拒绝（`:394-402`）。
- 数值帧缺失 → `B20_NATIVE_PICKER_NUMERIC_FRAME_MISSING`（`:407-412`）；`await performRepick(...)`（`:416-417`）后重取 `current()` 与起点比较，变化 → `B20_MAIN_REVOKED_DURING_NATIVE_PICK`（`:418-419`）。
- 返回固定 ack：`status:'picked-for-candidate-only'`、`publicationAllowed:false`、`businessWriteAllowed:false`、`schoolPolicyVerified:false`（`:420-424`）。

### 3.6 正式 Plan 升级（`handleCMainUpgradeCanonicalPlan`，`:459-514`）

1. `atStart=liveFrame(event)`；`assertCaseInput`（`:437-454`）拒绝 `actor/principal/owner/publisher/sourceIdentity/schoolRole` 等键（`:441-442`），要求 `caseId` 安全、`requestId` ≤128 非空、`expectedRevision` 非负安全整数、`payload` 为对象且不含 `actor/principal/publication`，`previousFingerprint`/`acknowledgement` 为字符串、`plan` 为对象（`:444-453`）。
2. `requirePlanWriter()`；`checkGrant(authority.getCaseGrant(caseId))`；`authority.canUpgradeCase(atStart.principalId,caseId,initial)` 否则 `CASE_UPGRADE_UNAUTHORIZED`（`:462-466`）。
3. `publisher=new C2MainPublishedPlanProvenance(authority.publishedPlanSource)`（`:467`）。
4. `recheck(aggregate)`（`:470-478`）：`assertCurrentPlanWriter` + 重取 `liveFrame` 与 `atStart` JSON 相等 + `sameGrant(initial,latest)` + `aggregate.caseV2.id` 相等 + `canUpgradeCase`，任一失败 → `CASE_UPGRADE_REVOKED_AT_COMMIT`。
5. 调 `upgradeCanonicalPlanV3(caseId,{requestId,expectedRevision,actor:actorOf(atStart.principalId),payload},(plan,aggregate)=>{recheck;publisher.assertPublishedPlanForCase(plan,aggregate);recheck},(aggregate,actor,ack,removed)=>{...})`（`:481-513`）。
6. 第二个回调（删除同意，`:488-512`）：`recheck`；`actor.actorId` 必须等于 `atStart.principalId`（`ACTOR_CHANGED_AT_COMMIT`，`:492`）；无 `removalGate` 抛 `C_MAIN_V3_IPC_HUMAN_REMOVAL_OBSERVER_NOT_INSTALLED`（`:496`）；`authority.removalConsentSource?.observeAtCommit?.(observedCtx)`（`:508`）后 `recheck`，再 `removalGate.consumeAtCommit(observedCtx)`（`:510`）后 `recheck`。注释明确：渲染层 `acknowledgement` 只是提议清单，物理人类同意只能来自 Main 观察器；无观察即 fail-closed（`:489-491`）。

### 3.7 注册（`registerCMainV3AuthorPlanIpc`，`:516-521`）

无条件注册 4 个通道：`AUTHOR_READ_LATEST_V3`、`B20_CANDIDATE_READ_V3`、`B20_NATIVE_REPICK_V3`、`UPGRADE_CANONICAL_PLAN_V3`（常量定义 `packages/shared/src/types/review.ts:512,527,529,531`）。注册点：`review-ipc.ts:4,110` → `main/ipc.ts:146,6220`（`registerIpcHandlers`）→ `main/index.ts:945`（启动）与 `:1208`。注释明说“注册无条件，缺授权源即拒绝”（`:514-515`）。

## 4. 调用者与调用链

入向（冻结树 `apps/`+`packages/` grep，排除测试）：

| 调用方 | 使用点 | 说明 |
| --- | --- | --- |
| `apps/electron/src/main/lib/review/review-ipc.ts` | `:4` 导入；`:110` 调 `registerCMainV3AuthorPlanIpc()` | 生产注册唯一入口 |
| `apps/electron/src/main/lib/review/review-v3-main-local-author-workbench.ts` | `:11` 导入；`:50` 调 `installCMainV3AuthorReadAuthorities` | 生产**唯一**的授权安装：本地作者工作台在启动时安装读取源 |
| `apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.ts` | `:24-26` 导入；`:214` 调 `installCMainV3B20ReadAuthorities` | 但该文件本身只被 `review-v3-main-b20-current-registry.ts:35-37` 使用，而后者在冻结树无生产调用者（仅测试 `review-v3-main-b20-physical-composition.test.ts:29-31,208` 等） |
| `apps/electron/src/main/lib/review/review-v3-main-b20-current-registry.ts` | `:29` 导入类型 `CMainV3Grant` | 类型引用 |

**生产可达性（否定结论，检索范围：冻结树 `apps/`+`packages/` 全部 `*.ts`/`*.tsx`，排除 `*.test.ts`；不覆盖动态 `require`/字符串拼接）**：

- `installCMainV3PlanUpgradeAuthorities`、`installCMainV3NativePlanUpgradeAuthorities`、`installCMainV3AuthorPlanAuthorities`：除本文件与测试外**无调用者**。因此生产中 `UPGRADE_CANONICAL_PLAN_V3` 恒在 `requirePlanWriter()` 处拒绝 `INDEPENDENT_AUTHORITIES_NOT_INSTALLED`（`:209-210,463`）。
- `installCMainV3B20ReadAuthorities` 的生产调用链（physical-composition → current-registry）无生产入口，因此生产中 `B20_CANDIDATE_READ_V3` 恒 `B20_TRUSTED_SOURCE_NOT_INSTALLED`（`:311-312`）、`B20_NATIVE_REPICK_V3` 恒 `B20_NATIVE_PICKER_NOT_INSTALLED`（`:384-385`）。
- 4 个 handler 本身的注册是真实的（`review-ipc.ts:110`）。

渲染层/preload 通道级调用：preload 桥在 `apps/electron/src/preload/index.ts:4813`（`AUTHOR_READ_LATEST_V3`）、`:4850`、`:4860`（`B20_*`）、`:4872`（`UPGRADE`）暴露 4 通道；渲染层实际业务调用只检索到 `ReviewV3LocalCandidateWorkbench.tsx:130`（作者读取），B20 读/重选/升级的渲染层调用在冻结树 0 命中（检索方式：`window.reviewAPI.*`，范围 `apps/electron/src/renderer`）。

另有 6 个外部测试经 `registerReviewIpc` 间接注册本文件 4 handler 但从未 invoke 这 4 通道（`review-c0-ipc.test.ts:35`、`review-ipc-path.test.ts:24`、`review-ipc-legacy-sender.test.ts:52,64,84`、`review-pi-run-bridge.main.test.ts:290`、`review-background-state.p03-main.test.ts:78`、`review-v3-legacy-entry-gates.test.ts:105`）；它们不是本文件行为的直接覆盖。

出向依赖：`review-c0-authority.ts:21`（`assertC0ReviewMainSender`）、`review-v3-main-author-revision-read.ts:97`（`CMainTrustedAuthorRevisionRead`）、`review-v3-main-b20-trusted-candidate-read.ts:150`（`CMainB20TrustedCandidateRead`）、`plan-binding-v3.ts`（`upgradeCanonicalPlanV3`、`CMainUpgradeRemovalAck`）、`review-v3-main-plan-provenance.ts`（`C2MainPublishedPlanProvenance`）、`review-v3-main-removal-consent.ts`（`CMainRemovalConsentGate`）、`review-v3-main-native-removal-observer.ts`（`createCMainElectronRemovalObserver`）、`review-storage-id.ts`（`assertSafeReviewStorageId`）、`../main-window-state.ts`（`getMainWindow`）。

## 5. 数据 I/O、读写与副作用

- **本文件自身无磁盘/网络 I/O**。持久化只经 `upgradeCanonicalPlanV3` 的 Case CAS（回执与业务变更同事务；见 `plan-binding-v3.ts` 与 `case-store-v2.ts:203-262`）；B1 读取是注入回调（生产为 `review-template-author-store-v3-b1.ts` 的 `readB1AuthorRevision`，经 `review-v3-main-local-author-workbench.ts:59` 注入）。
- 模块级可变状态：三个安装槽 + B20 token（进程内，重启即失效——冷启动无授权源即拒绝）。
- 副作用：`ipcMain.handle` 注册 4 通道；升级成功产生 Case 回执/`canonicalPlanHistory`（由 `upgradeCanonicalPlanV3` 负责）；`removalGate.close()` 在卸载时关闭一次性同意。
- 并发/原子性：写入原子性由 Case CAS 保证；本文件在 CAS 的两个回调内多次 `recheck`（`:470-478`）把“安装仍当前、frame/grant 未变”作为提交条件，形成提交点重校验。
- 幂等：由 `submitCommand` 的 `requestId+payloadHash` 处理（测试断言重放返回原回执、改载荷 `REQUEST_ID_COLLISION`，`review-v3-main-author-plan-ipc.test.ts:235-243`）。

## 6. 分支、失败、取消与恢复

| 错误（前缀 `C_MAIN_V3_IPC_`） | 触发 | 行 |
| --- | --- | --- |
| `B20_READER_ALREADY_INSTALLED` | B20 读源重复安装 | 108 |
| `B20_REAL_SOURCE_REQUIRED` | B20 源缺方法 | 110 |
| `AUTHOR_READER_SOURCE_REQUIRED` | 读源缺方法 | 126-128 |
| `INDEPENDENT_PUBLISHED_PLAN_AUTHORITY_REQUIRED` | 写源缺发布出处 | 131-133 |
| `AUTHOR_READER_ALREADY_INSTALLED`/`PLAN_WRITER_ALREADY_INSTALLED`/`AUTHORITIES_ALREADY_INSTALLED` | 各安装器重复安装 | 145/154,172/189 |
| `INDEPENDENT_AUTHORITIES_NOT_INSTALLED` | handler 无授权源 | 206,210 |
| `AUTHORITY_INSTALLATION_REVOKED` | await/CAS 期间安装被替换 | 214,218 |
| `MAIN_WINDOW_CLOSED`/`PHYSICAL_FRAME_ID_MISSING` | 窗口/frame 不可用 | 226,229 |
| `TRUSTED_GRANT_UNAVAILABLE` | grant 缺失/非法 | 239-241 |
| `AUTHOR_REQUEST_INVALID`/`RENDERER_CREDENTIAL_CLAIM`/`TEMPLATE_REQUIRED`/`EXPECTED_REVISION_INVALID` | 作者读取入参 | 266-275 |
| `B20_RENDERER_CREDENTIAL_OR_SOURCE_CLAIM`/`B20_TEMPLATE_ID_INVALID`/`B20_TRUSTED_SOURCE_NOT_INSTALLED` | B20 读取入参/未装源 | 305-312 |
| `B20_NUMERIC_MAIN_FRAME_NOT_CURRENT`/`B20_MAIN_CURRENT_SCOPE_LOST` | 数值帧/身份不符 | 346,339 |
| `B20_REPICK_RENDERER_CREDENTIAL_OR_PATH_CLAIM`/`B20_REPICK_TEMPLATE_OR_ARCHIVE_INVALID`/`B20_NATIVE_PICKER_NOT_INSTALLED` | 重选入参/未装 picker | 375-385 |
| `B20_MAIN_PHYSICAL_FRAME_CHANGED`/`B20_OWNER_CANDIDATE_NOT_CURRENT`/`B20_REPICK_MAIN_ACL_REVOKED`/`B20_CURRENT_AUTHOR_PIN_MISSING`/`B20_MAIN_REVOKED_DURING_NATIVE_PICK` | 重选过程身份漂移 | 392-419 |
| `UPGRADE_INTENT_INVALID`/`RENDERER_CREDENTIAL_CLAIM`/`UPGRADE_CONTRACT_INVALID`/`UPGRADE_PAYLOAD_INVALID` | 升级入参 | 438-453 |
| `CASE_UPGRADE_UNAUTHORIZED`/`CASE_UPGRADE_REVOKED_AT_COMMIT`/`ACTOR_CHANGED_AT_COMMIT` | 升级授权/提交点复核 | 466,477,492 |
| `C_MAIN_V3_IPC_HUMAN_REMOVAL_OBSERVER_NOT_INSTALLED` | 无删除同意门 | 496 |

- 失败后的状态：读取类拒绝无写入；升级拒绝由 Case CAS 保证零业务写入（测试 `review-v3-main-author-plan-ipc.test.ts:245-263,385-394` 断言 `receiptLog` 长度不变、`canonicalPlan.fingerprint` 不变）。
- 取消/恢复：本文件无取消令牌、无重试；`removalGate.consumeAtCommit` 是一次性同意（失败 CAS 不复用，测试 `:420-429`）。安装卸载即撤销所有在途请求（`:213-219`）。

## 7. 权限与权威状态

- **sender 守卫**：4 个 handler 全部经 `liveFrame` → `assertC0ReviewMainSender`（`:222`）；这是“主窗口主框架”证明，不是教师/学校身份（`review-c0-authority.ts:1`）。
- **授权分离**：读取（B1 作者）与写入（Case Plan 升级）是两个独立安装槽；只有合并安装器 `installCMainV3AuthorPlanAuthorities` 同时占用两者（`:187-202`）。测试证明读源独立于写源存在/撤销（`review-v3-main-author-plan-ipc.test.ts:297-348`）。
- **权威来源**：grant（`CMainV3Grant`）、B1 最新修订读取、已发布 Plan 出处（`C2MainPublishedPlanProvenance`）、物理人类删除同意（`CMainRemovalConsentGate`/观察器）全部由特权 Main 注入；渲染层字段 `actor/principal/publication/...` 一律拒绝（`:267-269,441-442`）。
- **权威状态**：`publicationAllowed`/`schoolPolicyVerified` 等只在返回值里固定为 false（`:420-424`）；正式 Plan 的“已发布”证明只在 Case CAS 内由 `publisher.assertPublishedPlanForCase` 校验（`:483`）。
- **生产现状（重要）**：生产只安装了读取源（local-author-workbench）；写入源与 B20 源在冻结树无生产安装点（见 §4 否定结论），因此正式 Plan 升级与 B20 读取在生产默认拒绝。

## 8. 修改影响面

- 改 4 个 handler 的入参契约会影响 preload（`apps/electron/src/preload/index.ts` 的 `readCurrentB20CandidateV3`/`repickCurrentB20ArchiveV3`/`attachD4TechnicalPlanV3` 等附近接口）与渲染层调用；改错误码文案影响 UI 错误映射。
- 改安装槽语义（token/单例/卸载）会影响 `review-v3-main-local-author-workbench.ts:50-60` 的读源安装、`review-v3-main-b20-physical-composition.ts:214` 的 B20 安装，以及 3 个测试文件（`review-v3-main-author-plan-ipc.test.ts`、`review-v3-main-b20-electron-ipc.test.ts`）的断言。
- 改 `CMainV3Grant`/`CMainB20PinnedExpectation` 等类型会波及 `review-v3-main-author-revision-read.ts`、`review-v3-main-b20-trusted-candidate-read.ts`、`review-v3-main-b20-current-registry.ts`。
- 改升级回调里的 `recheck` 次数/条件会改变 fail-closed 边界（测试 `:265-283,359-370` 依赖这些拒绝点）。

## 9. 测试证据

直接测试（均静态读断言，`NOT_RUN`：本轮未执行 `bun test`/typecheck/构建/GUI/真实模型）：

- `apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.test.ts`（445 行，18 个 `test(`）：
  - 注册存在 + 未安装授权即拒绝两操作且零写入（`:184-196` 断言 `handlers.has(...)`、`INDEPENDENT_AUTHORITIES_NOT_INSTALLED`、`receiptLog` 长度 1）。
  - 作者读取只经主窗口主框架与当前 B1 grant（`:198-214`：`state:'candidate-held'`/`displayOnly:true`/`reads()===2`；`RENDERER_CREDENTIAL_CLAIM`；两处 `SENDER_UNTRUSTED`；`NOT_AUTHORIZED`）。
  - await 期间 Owner 轮换 → `MAIN_CONTEXT_REVOKED`（`:216-222`）。
  - 升级产生单条持久回执、重放幂等、改载荷 `REQUEST_ID_COLLISION`（`:224-243`：revision 2、`canonicalPlanHistory[0].fingerprint=old`、`receiptLog` 2 条）。
  - 伪造 principal/撤销 grant/撤销旧发布 → 不写 Case（`:244-263`）。
  - 异步期间卸载读源/写源 → `AUTHORITY_INSTALLATION_REVOKED`/零写入（`:265-283`）。
  - 未确认删除的 UI 确认不能转正式写（`:284-294`）。
  - 独立安装读/写源、互不保留能力、同对象卸装不能复活旧请求、合并安装器不能抢占（`:297-383`）。
  - 删除同意：无物理人类批准即拒绝；11 种字段不匹配拒绝；失败 CAS 不复用旧同意；安装/撤销/重装不存活（`:385-437`）。
- `apps/electron/src/main/lib/review/review-v3-main-b20-electron-ipc.test.ts`（158 行，6 个 `test(`）：注册存在 + 默认拒绝；渲染层 6 种越权字段被拒；独立源提供 candidate-only 且**不含** `nativePhysicalArchiveKey`/`schoolIssuer`（`:96-108`）；senderFrame 替换/ACL 撤销/epoch 轮换/安装过期拒绝；B20 源漂移/pin 漂移/读中卸装拒绝（`:130-147`）；双源不能共存、卸装后旧源非权威（`:149-156`）。

未覆盖/缺口：`handleCMainB20NativeArchiveRepick` 的成功路径只在 `review-v3-main-b20-physical-composition.test.ts:206-208`（经 repick handler）验证；`installCMainV3NativePlanUpgradeAuthorities` 的真实 Electron 观察器路径无直接测试（REMOVAL 测试用注入的 `removalConsentSource`）；生产“写源/B20 源永不安装”无测试锁定（现状是代码无安装点）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 handler 由 `registerReviewIpc` 真实注册 | 已证实 | `:516-521`；`review-ipc.ts:110` |
| 4 个 handler 全部经 `assertC0ReviewMainSender` | 已证实 | `:221-236`（liveFrame）与各 handler 首行 |
| 渲染层凭证字段一律拒绝 | 已证实 | `:267-269,305-307,373-375,441-442` |
| 安装槽单例 + 卸载按实例清空 | 已证实 | `:105-115,121-122,143-202,213-219` |
| 升级的提交点重校验（recheck×多次） | 已证实 | `:470-512` |
| 删除同意一次性、无观察即拒绝 | 已证实 | `:488-512`；测试 `:385-394,420-429` |
| 生产仅安装读取源（local-author-workbench） | 已证实（检索） | `review-v3-main-local-author-workbench.ts:50`；`main/index.ts:190,948` |
| 生产无 Plan 升级源/B20 源安装点 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`/`*.tsx`） | `installCMainV3*Upgrade*`/`installCMainV3B20ReadAuthorities`/`installCMainV3PhysicalB20Sources` 无生产调用者；B20 链止于 `review-v3-main-b20-current-registry.ts`（无生产调用者） |
| 因此生产 `UPGRADE_CANONICAL_PLAN_V3`/`B20_*` 默认拒绝 | 推断（由上述安装点缺失 + `require*` fail-closed 推导） | `:206-210,311-312,384-385` |
| 本文件无磁盘写 | 已证实 | 全文无 `fs`/写调用；持久化经 `upgradeCanonicalPlanV3` |
| `installCMainV3NativePlanUpgradeAuthorities` 的真实观察器行为 | 未知 | 未读 `review-v3-main-native-removal-observer.ts` 全文；无直接测试 |
| preload/渲染层对 4 通道的实际调用 | 未知（部分） | 未逐行核 preload 全部绑定；仅按通道名检索确认存在于 preload 接口层 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 安装槽/重复安装/卸载 | §3.1 | 105-202,213-219 | covered |
| `liveFrame`/`checkGrant`/`sameGrant` | §3.2 | 221-247 | covered |
| 作者读取流程 | §3.3 | 263-296 | covered |
| B20 候选读取流程 | §3.4 | 302-362 | covered |
| 原生归档重选 | §3.5 | 369-424 | covered |
| Plan 升级 + 删除同意 | §3.6 | 426-514 | covered |
| 注册与调用链 | §3.7,§4 | 516-521 | covered |
| 权限/权威 | §7 | 221-236,462-512 | covered |
| 生产安装点缺失（否定） | §4,§10 | 检索记录 | covered（范围已声明） |
| 真实观察器路径 | §10 | 170-184 | unknown |
