---
path: apps/electron/src/main/lib/review/review-v3-main-b20-electron-ipc.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8d4fb85d86295f97bbf2eb20c064fdaa193e6f7
sha256: 53375c2af4fe25ecd11f074aae6b10ece382182c48b55ea703ea16d2bae3d9a8
lines: 158
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b20-electron-ipc.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `B20_CANDIDATE_READ_V3` 真实注册的 Electron handler 与 Preload 契约（C-MAIN-B20-WIRE-R02）：默认拒绝、渲染层不能携带任何身份/来源字段、独立 Main owner 门提供 candidate-only 展示且不泄露物理 key/Issuer、senderFrame 替换与 ACL/pin/安装生命周期漂移都拒绝。文件头（`:1-6`）明确：B20 R20/B19/B2 源未导入 C，本测试只证 Main 身份边界，不证物理源或 Gate E。

## 2. 用例清单

共 6 个 `test(`（`review-v3-main-b20-electron-ipc.test.ts:77-157`，单一 `describe`）。

夹具（`:16-76`）：fake 主窗口/`sender{id:91}`/`frame{processId:777,routingId:3}`（`:19-22`）；`invoke(payload, ev=event)` 经测试钩子调 `B20_CANDIDATE_READ_V3`（`:23-27`）；`pinned`（revision 3、两 digest）（`:28-31`）；`fixture()` 构造 bundle（含 `nativePhysicalArchiveKey:'MUST_NOT_ESCAPE'`、`schoolIssuer:'MUST_NOT_ESCAPE'` 私密字段，`:35-54`）与 `CMainV3B20ReadAuthorities` 注入（`:55-70`）；控制柄 `rotate/revoke/expire/drift/changePin/onRead/reads`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | Main registration exists; no physical trusted source is default-deny（`:78`） | `handlers.clear()` + `registerReviewIpc()` 后读取 | `handlers.has(REVIEW_IPC_CHANNELS.B20_CANDIDATE_READ_V3)` 为 true；`rejects.toThrow('B20_TRUSTED_SOURCE_NOT_INSTALLED')` |
| 2 | renderer cannot provide principal, caseCandidate, archive key or author pin（`:85`） | 携带 `principalId`/`caseCandidateId`/`nativePhysicalArchiveKey`/`revision`/`sourceIdentity`/`actor` 六种额外字段；`'../bad'` | 六次 `B20_RENDERER_CREDENTIAL_OR_SOURCE_CLAIM`；`B20_TEMPLATE_ID_INVALID` |
| 3 | separate trusted Main owner gate supplies candidate-only display, never physical key/issuer（`:96`） | 安装读源后读取 | `toMatchObject({templateId:'template51',caseCandidateId:'case51',state:'candidate-held',displayOnly:true,schoolPolicyVerified:false,businessWriteAllowed:false,publicationAllowed:false})`；`reads()===2`；`not.toHaveProperty('nativePhysicalArchiveKey')`、`not.toHaveProperty('schoolIssuer')` |
| 4 | senderFrame substitution, missing current Owner, revoked read and generation rotation deny（`:110`） | 换 `senderFrame` 副本；`revoke()`；`rotate()`（grant 轮换）；`expire()` | `SENDER_UNTRUSTED`；`MAIN_ACL_REVOKED`；`/MAIN_CONTEXT_REVOKED_AFTER_B20_READ|B20_BUNDLE_NOT_PINNED_TO_MAIN/`；`MAIN_IDENTITY_NOT_INSTALLED` |
| 5 | B20 source change, author pin drift and source uninstall during awaited read deny（`:130`） | 读取时 `drift()`/`changePin()`/卸载 | `B20_SOURCE_CHANGED_DURING_READ`；`MAIN_CONTEXT_REVOKED_AFTER_B20_READ`；`B20_SOURCE_INSTALLATION_REVOKED` |
| 6 | two different installed sources cannot coexist, and prior source is not authoritative after uninstall（`:149`） | 已装时再装；卸载后读取 | `B20_READER_ALREADY_INSTALLED`；`B20_TRUSTED_SOURCE_NOT_INSTALLED` |

## 3. 真实断言

- 用例 1：`expect(handlers.has(REVIEW_IPC_CHANNELS.B20_CANDIDATE_READ_V3)).toBe(true)`（`:81`）；`rejects.toThrow('B20_TRUSTED_SOURCE_NOT_INSTALLED')`（`:82`）。
- 用例 2：循环内 `rejects.toThrow('B20_RENDERER_CREDENTIAL_OR_SOURCE_CLAIM')`（`:92-93`）；`rejects.toThrow('B20_TEMPLATE_ID_INVALID')`（`:94`）。
- 用例 3：`expect(result).toMatchObject({...})`（`:100-103`）；`expect(f.reads()).toBe(2)`（`:104`）；两个 `not.toHaveProperty`（`:105-106`）。
- 用例 4：`SENDER_UNTRUSTED`（`:112-113`）；`MAIN_ACL_REVOKED`（`:115`）；`/MAIN_CONTEXT_REVOKED_AFTER_B20_READ|B20_BUNDLE_NOT_PINNED_TO_MAIN/`（`:122-123`）；`MAIN_IDENTITY_NOT_INSTALLED`（`:127`）。
- 用例 5：`B20_SOURCE_CHANGED_DURING_READ`（`:134`）；`MAIN_CONTEXT_REVOKED_AFTER_B20_READ`（`:139-140`）；`B20_SOURCE_INSTALLATION_REVOKED`（`:145-146`）。
- 用例 6：`B20_READER_ALREADY_INSTALLED`（`:152-153`）；`B20_TRUSTED_SOURCE_NOT_INSTALLED`（`:155`）。

夹具/mock 边界：Electron `ipcMain` 用测试钩子 Map + `registerReviewIpc` 真实注册函数；B20 读源是注入 fixture（非真实 B20 数据，文件头 `:4-5` 自述）；无磁盘。

## 4. 未覆盖与脆弱点

- 未覆盖：`B20_NUMERIC_MAIN_FRAME_NOT_CURRENT`、`B20_MAIN_CURRENT_SCOPE_LOST`、`B20_NATIVE_REPICK_V3`（由 `review-v3-main-b20-physical-composition.test.ts` 覆盖）、`handleCMainB20CandidateRead` 的 `Object.keys` 精确 1 键分支之外的数组输入。
- 脆弱点：用例 4 的 `SENDER_UNTRUSTED` 依赖 `assertC0ReviewMainSender` 的错误类型（`C0ContractError`）而非消息；`reads()===2` 依赖双读实现；fixture 的 `MUST_NOT_ESCAPE` 字符串断言靠 `not.toHaveProperty` 而非内容扫描。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个用例 | 已证实 | `grep test(`；`:78,85,96,110,130,149` |
| 真实注册 + 默认拒绝 | 已证实 | `:78-83` |
| 渲染层 6 种越权字段被拒 | 已证实 | `:85-95` |
| 私密字段不外泄 | 已证实 | `:104-106` |
| 安装生命周期漂移拒绝 | 已证实 | `:130-147,149-156` |
| 仅身份边界（非物理源/Gate E） | 已证实（文件自述） | `:1-6` |
| 数值帧/手选通道分支 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 注册/默认拒绝 | 1 | 78-83 | covered |
| 渲染层字段拒绝 | 2 | 85-95 | covered |
| candidate-only 展示/脱敏 | 3 | 96-108 | covered |
| 帧/ACL/轮换/过期 | 4 | 110-128 | covered |
| 读中漂移/卸载 | 5 | 130-147 | covered |
| 双源互斥 | 6 | 149-156 | covered |
| 数值帧/re-pick | 无/另文件 | — | partial |
