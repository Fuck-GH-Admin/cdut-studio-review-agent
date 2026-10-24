---
path: apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e6b6e95e376a0c430837903e2db249af2e7e288a
sha256: e54658cac1a9720ee1fd1daef2ed59691324c8a053003e4989499e86cd427e4e
lines: 445
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `review-v3-main-author-plan-ipc.ts` 的真实 Electron Main 契约（C-MAIN-WIRE-R01/R02、REMOVAL-R01）：4 个 IPC handler 经 `registerReviewIpc` 真实注册；未安装独立授权源时读/写都拒绝且零写入；作者读取只经主窗口主框架 + 当前 B1 grant；正式 Plan 升级必须有真实已发布 Plan 出处与物理人类删除同意；安装/撤销/重装的生命周期不能复活旧请求。测试通过 `globalThis.__proferElectronTestHooks.ipcMainHandlers` 直接调用 handler（mock Electron IPC），并用 `case-store-v2` 落盘的聚合断言“写/不写”。

## 2. 用例清单

共 18 个 `test(`，分 3 个 `describe`（文件行：`review-v3-main-author-plan-ipc.test.ts:183,296,385`）。

夹具（`:25-34`）：`PROFER_CONFIG_DIR` 指向 `work/tmp/c-v3-electron-main-wire-<Date.now()>`；fake 主窗口/`sender{id:91}`/`frame{processId:777,routingId:3}`；`authorRecord()` 返回 `template51` 的 B1 修订（`revision:1`、digest=sha256(JSON(document))）；`plan(id,n,full)` 构造 `CanonicalPlan`（`bindings` 1 或 2 条，`checkKey:'check-kept'/'check-removed'`）；`fixture()`（`:58-181`）建真实案卷聚合（`stage:'reviewing'`、含 `v1` 原件与 `contentHash`）、写 `issued-plan-artifacts/<fingerprint>.json` 出版物、构造 `publishedPlanSource`（`getCurrentPublication`/`assertAuthorizedPublication` 可注入失败）、`removalConsentSource`（approval Map 可注入/篡改）、返回 `install()`/`revokeGrant()`/`revokeOld()`/`approveRemoval()`/`onRead()`/`onPublisher()` 等控制柄。

### describe `C-MAIN-WIRE-R01 real registered Electron Main/Preload contract`（`:183`）

| # | 用例（行） | 关键动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | real registration and uninstalled authority reject both operations（`:184`） | `registerReviewIpc()` 后 `handlers.has` 4 通道；未安装授权时 invoke 读/升级 | 4 通道已注册；`INDEPENDENT_AUTHORITIES_NOT_INSTALLED`；`receiptLog` 保持 1 条 |
| 2 | candidate read only through Main verified window/mainFrame and current B1 owner grant（`:198`） | 正常读取 + 伪造 `principal` + 换 `senderFrame` + 禁 `allowedRead` | `{state:'candidate-held',displayOnly:true,revision:1}`；`reads()===2`（双重读取）；`RENDERER_CREDENTIAL_CLAIM`、`SENDER_UNTRUSTED`（两处）、`NOT_AUTHORIZED` |
| 3 | async Owner rotation blocks author read after B1 full history await（`:216`） | `onRead` 里 `epoch++`（grant 轮换） | 拒绝 `MAIN_CONTEXT_REVOKED` |
| 4 | real published source and old/new physical Case bytes produce one durable UpgradePlan Receipt（`:224`） | 正常升级、重放同载荷、同 requestId 改载荷 | `receiptLog` 2 条、revision 2、`canonicalPlanHistory[0].fingerprint===old.fingerprint`；重放 `ok:true` 不增回执；改载荷 `REQUEST_ID_COLLISION` |
| 5 | renderer fake principal, revoked Main grant, or removed old publication never write Case（`:244`） | `principal:{role:'school'}`、`revokeGrant()`、`revokeOld()` | `RENDERER_CREDENTIAL_CLAIM`/`TRUSTED_GRANT_UNAVAILABLE`/`ok:false`；`receiptLog` 恒 1 条 |
| 6 | uninstalling Main authority during async B1 read invalidates captured old grant（`:265`） | `onRead(()=>dispose())` | `AUTHORITY_INSTALLATION_REVOKED` |
| 7 | uninstalling Main policy authority during CAS publisher check never commits Receipt（`:274`） | `onPublisher(()=>dispose())` | `ok:false`；revision 仍 1、`receiptLog` 仍 1 |
| 8 | removed Check not acknowledged cannot convert candidate UI confirm into formal Case write（`:284`） | 去掉 `removalAck` | `ok:false`；`receiptLog` 1 条 |

### describe `C-MAIN-WIRE-R02 independently installed candidate read / formal write authorities`（`:296`）

| # | 用例（行） | 关键动作 | 真实断言 |
| --- | --- | --- | --- |
| 9 | live Main candidate reader works without a school publisher or Case writer（`:297`） | 只装读源后读取 + 尝试升级 + 卸载后再读 | `{state:'candidate-held',displayOnly:true,revision:1}`；升级 `INDEPENDENT_AUTHORITIES_NOT_INSTALLED`；卸载后读同样拒绝 |
| 10 | published Plan writer can be installed independently; absent B1 author grant stays denied（`:315`） | 只装写源（含注入 `removalConsentSource`） | 读 `INDEPENDENT_AUTHORITIES_NOT_INSTALLED`；升级 `ok:true` |
| 11 | reader remains independent when writer is revoked, without retaining write capability（`:334`） | 读源独立于写源存在/撤销 | 读可用、升级被拒 |
| 12 | uninstall/reinstall SAME reader object during B1 await cannot revive old request（`:349`） | `onRead` 中卸装同对象 | 旧请求拒绝 |
| 13 | uninstall/reinstall SAME writer object during Case CAS cannot revive old request（`:359`） | CAS 期间卸装同对象 | 旧请求拒绝、零写入 |
| 14 | legacy combined installer cannot seize either independent Main authority slot（`:371`） | 独立源已装后再用合并安装器 | `AUTHORITIES_ALREADY_INSTALLED` |

### describe `C-MAIN-REMOVAL-R01 physically observed human deletion one-use authority`（`:385`）

| # | 用例（行） | 关键动作 | 真实断言 |
| --- | --- | --- | --- |
| 15 | valid exact renderer ACK with no independently observed human approval cannot mutate Case（`:386`） | 只给渲染层 ACK、无观察记录 | `ok:false`；`receiptLog` 1 条 |
| 16 | old/current Case version, physical principal and frame, or target fingerprint mismatch deny removal（`:396`） | `approveRemoval` 篡改 `expectedRevision`/`principalId`/`frameId`/`previousFingerprint`/`nextFingerprint`/`ownerGeneration`/`authorityEpoch` 等 | 各自拒绝、零写入（`:396-419` 逐项） |
| 17 | a failed CAS does not make stale unconfirmed permission reusable for a new request（`:420`） | 同 `approvalId` 挂到别的 requestId | `ok:false`；零写入 |
| 18 | confirmation cannot survive install/revoke/reinstall even same Main source object（`:430`） | 装→卸→用 `removalConsentSource:undefined` 重装 | `ok:false`；零写入 |

## 3. 真实断言（抽样逐条）

- 注册：`expect(handlers.has(REVIEW_IPC_CHANNELS.AUTHOR_READ_LATEST_V3)).toBe(true)` 等 4 行（`:188-191`）。
- 零写入：`expect(readAggregate(f.id)?.receiptLog).toHaveLength(1)`（`:196,250,256,262,282,293,347,368,394,428,437`）。
- 读取形状：`expect(snapshot).toMatchObject({state:'candidate-held',displayOnly:true,revision:1})`（`:306`）；双重读取 `expect(f.observations()).toBe(2)`（同夹具 `review-v3-main-author-revision-read.test.ts:63` 语义，本文件用 `readerCalls` 计数断言于 `:208-212`）。
- 升级：`expect(snapshot).toMatchObject({canonicalPlan:{fingerprint:f.old.fingerprint}})`、`expect(snapshot.receiptLog).toHaveLength(2)`、`expect(collision).toMatchObject({ok:false,code:'REQUEST_ID_COLLISION'})`（`:236-243`）。
- 删除拒绝：`expect(onlyUI.ok).toBe(false)`（`:292`）；`expect(denied.ok).toBe(false)`（`:261,280,345,365,382,391,426,435`）。
- 测试夹具状态：案卷是 `stage:'reviewing'` 的已建聚合（`:64-79`），B1 作者修订 `status:'candidate-held'`（`:44-48`）；mock 边界：Electron `ipcMain` 由测试钩子 Map 替代，主窗口由 `setMainWindow` 伪造（`:25-31`）；真实边界：`case-store-v2` 真实落盘、`plan-binding-v3` 真实 CAS、发布物真实写文件（`:58-100`）。

## 4. 未覆盖与脆弱点

- `installCMainV3NativePlanUpgradeAuthorities`（Electron 物理观察器路径）无用例；REMOVAL 用注入 `removalConsentSource`。
- `handleCMainB20CandidateRead`/`handleCMainB20NativeArchiveRepick` 不在本文件覆盖（由 `review-v3-main-b20-electron-ipc.test.ts` 与 `review-v3-main-b20-physical-composition.test.ts` 覆盖）。
- 未覆盖：并发升级、写盘失败注入、`upgradeCanonicalPlanV3` 内部其它错误码、`expectedRevision` CAS 冲突（`VERSION_CONFLICT`）、`liveFrame` 的 `PHYSICAL_FRAME_ID_MISSING` 分支、`checkGrant` 各字段非法。
- 脆弱点：夹具依赖 `work/tmp` 相对路径与 `Date.now()` 目录名；approval 断言依赖 `observedAtMs` 未严格比较；`authorRecord()` 的 digest 用测试自己计算，若 B1 digest 算法变化会失配。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 个用例、3 组 | 已证实 | `grep test(` 计数；`:183-437` |
| 4 通道经 `registerReviewIpc` 注册 | 已证实 | `:12` 导入、`:188-191` 断言 `handlers.has` |
| 未安装授权源零写入 | 已证实 | `:196` 等多处 `receiptLog` 长度断言 |
| 读取双重读取与身份轮换拒绝 | 已证实 | `:208-223` |
| 升级单回执 + 幂等 + 碰撞拒绝 | 已证实 | `:224-243` |
| 删除同意一次性、失败不复用 | 已证实 | `:385-437` |
| 测试用 mock Electron + 真实磁盘聚合 | 已证实 | `:25-31`（hooks）与 `:58-100`（createAggregate/写文件） |
| 生产无写源安装点（与测试对照） | 已证实（检索） | 见 `review-v3-main-author-plan-ipc.ts.md` §4；本文件只测安装器函数 |
| 并发/CAS 冲突路径 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 注册 + 未安装拒绝 | 1 | 184-196 | covered |
| 读取授权/sender/伪造字段 | 2 | 198-214 | covered |
| await 轮换 grant | 3 | 216-223 | covered |
| 升级回执/幂等/碰撞 | 4 | 224-243 | covered |
| 伪造身份/撤销/撤销发布 | 5 | 244-263 | covered |
| 读源卸载失效 | 6 | 265-273 | covered |
| 写源卸载零提交 | 7 | 274-283 | covered |
| 无删除同意拒绝 | 8 | 284-294 | covered |
| 读写源独立安装/撤销 | 9-11 | 297-348 | covered |
| 同对象卸装不复活 | 12-13 | 349-370 | covered |
| 合并安装器不抢占 | 14 | 371-383 | covered |
| 删除同意字段匹配/一次性 | 15-18 | 385-437 | covered |
| Native 物理观察器 | 无 | — | unknown |
| B20 通道 | 另两文件 | 见各自手册 | 间接 |
