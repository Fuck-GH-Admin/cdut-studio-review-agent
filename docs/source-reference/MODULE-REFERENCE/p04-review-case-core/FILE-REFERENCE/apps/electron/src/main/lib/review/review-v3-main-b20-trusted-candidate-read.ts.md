---
path: apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d0e6ea271e0b20474060131f1f29a74b876463c3
sha256: 6b6d0781e692cc5c9f6220571725d79a30a9f53de00be978904aeb42c7d05838
lines: 196
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.ts

## 1. 结论与边界

Dev-C C-MAIN-B20-R01：Main 侧对 Dev-B R20“当前候选 bundle”的**授权边界**（不含 B1/B2/B19 数据语义）。把注入的身份/pin/ACL/读取回调组装成 `CMainB20TrustedCandidateRead`，经“双读 + 双重再认证 + bundle 形状/pin 绑定校验”输出脱敏的 `CMainB20CandidatePreview`。

边界（文件头 `apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.ts:1-13`）：

- 不 import/cherry-pick B 源；不注册 IPC、无发布者、无 Case/Run 写入者、不铸 Owner。
- 渲染层只能选“要看的 templateId”；期望修订、actor、来源身份、归档 key、grant 全部独立查找。
- 返回投影固定 `displayOnly:true`、`candidateOnly:true`、`publicationAllowed:false` 等（`:28-44`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个接口 + 1 个类 = 5 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainB20ReadIdentity` | 接口（导出） | 16-18 | `CMainAuthorReadIdentity & {caseCandidateId}` | 身份 + 候选案卷 |
| `CMainB20PinnedExpectation` | 接口（导出） | 20-25 | `{templateId,revision,revisionDigest,frozenFingerprint}` | Main 认证的 pin |
| `CMainB20CandidatePreview` | 接口（导出） | 28-44 | 16 字段投影（含 `candidateProvenance:unknown`） | 对渲染层的唯一输出 |
| `CMainB20TrustedReadSources` | 接口（导出） | 46-59 | `currentIdentity/currentInstallationToken/canRead/getPinnedExpectation/readCurrentBundle` | 注入依赖 |
| `CMainB20TrustedCandidateRead` | 类（导出） | 150-196 | `read(templateId):Promise<CMainB20CandidatePreview>` | 双读信任边界 |
| `deny`/`digest`/`valid`/`templatePattern`/`same` | 内部 | 61-67 | 抛 `C_MAIN_B20_<code>`；64hex；≤256 非空；模板名正则；JSON 相等 | |
| `identity` | 内部 | 69-78 | 身份七字段 + caseCandidateId 校验 | 否则 `MAIN_IDENTITY_NOT_INSTALLED` |
| `expectation` | 内部 | 80-91 | ACL + pin 校验并克隆 | `MAIN_ACL_REVOKED`/`PINNED_AUTHOR_SOURCE_MISSING` |
| `installed` | 内部 | 93-97 | 安装 token 校验 | `MAIN_INSTALLATION_MISSING` |
| `assertBundle` | 内部 | 100-147 | bundle 形状/pin/owner/provenance 全等校验 | `B20_BUNDLE_NOT_PINNED_TO_MAIN`/`B20_FROZEN_DESCRIPTOR_MISMATCH`/`B20_SOURCE_PROVENANCE_*` |

## 3. 内部逻辑与关键流程

### 3.1 身份与 pin（`:69-97`）

- `identity`：八字段全非空、`ownerGeneration` ≥0 安全整数，否则 `MAIN_IDENTITY_NOT_INSTALLED`（`:69-78`）。
- `expectation`：先 `canRead`（`MAIN_ACL_REVOKED`），再 `getPinnedExpectation` 且 `revision≥1`、两个 digest 64hex（`PINNED_AUTHOR_SOURCE_MISSING`），返回克隆（`:80-91`）。
- `installed`：`currentInstallationToken()` 非空即用（`MAIN_INSTALLATION_MISSING`）（`:93-97`）。注释强调 token 在同对象重装后也会轮换（`:49-50`）。

### 3.2 bundle 校验（`assertBundle`，`:100-147`）

- 必须是对象；`schemaVersion==='review-v3-b20-main-read-bundle/1'`、`candidateOnly:true`、三个 false 标志、`authorityInstalledByB===false`、`authorStatus==='candidate-held'`，且 `templateId/authorRevision/authorRevisionDigest/frozenFingerprint` 与 pin 全等、`ownerId/ownerGeneration/caseCandidateId` 与 scope 全等，否则 `B20_BUNDLE_NOT_PINNED_TO_MAIN`（`:103-120`）。
- `frozenDescriptor.canonicalPlan.fingerprint` 必须等于 pin（`B20_FROZEN_DESCRIPTOR_MISMATCH`，`:122-127`）。
- `candidateProvenance` 必须 `schemaVersion==='review-v3-b1-b2-candidate-source/1'`、三个 false、owner/case/planFingerprint 全等、`bindings`/`invalidatedPriorEvidence` 为数组、`snapshotHash` 64hex（`B20_SOURCE_PROVENANCE_MISSING`/`B20_SOURCE_PROVENANCE_NOT_CURRENT`，`:129-145`）。
- 返回 `structuredClone(b)`（`:146`）。测试在 fixture 中放入 `principalId`/`nativePhysicalArchiveKey`/`schoolIssuer` 等私密字段，验证它们不在预览里（`review-v3-main-b20-trusted-candidate-read.test.ts:41-46`）。

### 3.3 双读（`read`，`:160-195`）

1. `templateId` 正则 + 不是 `.`/`..`（`TEMPLATE_SCOPE_INVALID`，`:162-163`）。
2. `token = installed()`；`atStart = identity()`；`pinned = expectation(...)`（`:164-166`）。
3. `first = assertBundle(await readCurrentBundle(pinned), pinned, atStart)`（`:167`）。
4. 再认证：token/identity/pinned 三者任一变化 → `MAIN_CONTEXT_REVOKED_AFTER_B20_READ`（`:168-175`）。
5. `second = assertBundle(await readCurrentBundle(pinned), ...)`（`:178`）；再认证 + `first`/`second` 全等（`B20_SOURCE_CHANGED_DURING_READ`，`:179-183`）。
6. 返回投影（`:184-194`）：`candidateProvenance` 取 `second.candidateProvenance`；其余字段来自 pin/scope；固定 `state:'candidate-held'`、`displayOnly:true`、`candidateOnly:true`、三 false。

注释明确：第一次 bundle 可能 await 磁盘操作，复用前必须再认证（`:168-169`）；任何异步跳变后必须重读，早前 UI 缓存快照不能胜出（`:176-177`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产：`apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts:40-44` 导入并在 `:329` 实例化（`handleCMainB20CandidateRead`）；`review-v3-main-b20-current-registry.ts:26-28`、`review-v3-main-b20-physical-composition.ts:27-29` 仅类型。
- 测试：`review-v3-main-b20-trusted-candidate-read.test.ts:4-6`（直接实例化）；`review-v3-main-b20-physical-composition.test.ts:31`（类型）。

出向：仅 `review-v3-main-author-revision-read.ts:14` 的类型 `CMainAuthorReadIdentity`（`:14`）；无其它本地模块、无 `ipcMain`。数据来自注入的 `readCurrentBundle`（生产链：`review-v3-main-b20-physical-composition.ts:205-207` → `readB20CurrentCandidateBundle`）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/全局状态；纯内存校验 + `structuredClone`。
- 副作用：无日志；失败抛 `Error('C_MAIN_B20_'+code)`。
- 并发/幂等：类无状态；一致性靠双读 + token/身份/pin 三重比较。并发源变化 → 拒绝。

## 6. 分支、失败、取消与恢复

| 错误（前缀 `C_MAIN_B20_`） | 触发 | 行 |
| --- | --- | --- |
| `TRUSTED_MAIN_AND_B20_DEPENDENCIES_REQUIRED` | 构造缺依赖 | 153 |
| `TEMPLATE_SCOPE_INVALID` | 模板名非法 | 163 |
| `MAIN_INSTALLATION_MISSING` | token 缺失 | 95 |
| `MAIN_IDENTITY_NOT_INSTALLED` | 身份不完整 | 75 |
| `MAIN_ACL_REVOKED`/`PINNED_AUTHOR_SOURCE_MISSING` | ACL/pin 失效 | 81,83 |
| `B20_CURRENT_BUNDLE_INVALID` | bundle 非对象 | 102 |
| `B20_BUNDLE_NOT_PINNED_TO_MAIN` | bundle 与 pin/owner 不符 | 119 |
| `B20_FROZEN_DESCRIPTOR_MISMATCH` | 指纹不符 | 126 |
| `B20_SOURCE_PROVENANCE_MISSING`/`B20_SOURCE_PROVENANCE_NOT_CURRENT` | provenance 缺失/不当前 | 132,144 |
| `MAIN_CONTEXT_REVOKED_AFTER_B20_READ` | 首读后身份/安装漂移 | 174,181 |
| `B20_SOURCE_CHANGED_DURING_READ` | 两次 bundle 不同 | 183 |

- 失败后状态：只读无写；调用方（IPC handler）把异常透传。
- 取消/恢复：无取消；恢复是重新 `read`。

## 7. 权限与权威状态

- ACL 由 `canRead` + pin registry 提供（`:80-91`）；安装 token 区分“同一对象重装”（`:49-50,93-97`）。
- 输出不含 `principalId`/`nativePhysicalArchiveKey`/`schoolIssuer` 等私密字段：投影是白名单构造（`:184-194`），不是对象裁剪（测试 `review-v3-main-b20-trusted-candidate-read.test.ts:41-46,152-159` 验证）。
- 权威语义：`state:'candidate-held'`、`displayOnly:true`；`schoolPolicyVerified:false` 等三标志固定 false。

## 8. 修改影响面

- 改 `CMainB20CandidatePreview` 影响 preload `readCurrentB20CandidateV3`（`apps/electron/src/preload/index.ts:4860` 附近）与渲染层展示。
- 改 pin/bundle 校验影响 `review-v3-main-author-plan-ipc.ts:329-351` 的回调装配与 `review-v3-main-b20-physical-composition.ts` 的 bundle 结构。
- 改双读语义影响 8 个测试用例。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.test.ts`（179 行，8 个 `test(`，详见该文件手册）。覆盖：正常读取/脱敏、模板越权/ACL/无帧、owner 轮换/换帧/无安装 token/同对象重装、pin 轮换、bundle 4 种篡改、读中源变化。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`B20_FROZEN_DESCRIPTOR_MISMATCH`、`B20_CURRENT_BUNDLE_INVALID`、`PINNED_AUTHOR_SOURCE_MISSING` 的独立用例（部分经其它用例间接触发）；`readCurrentBundle` 抛错的处理未测。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双读 + 三重再认证 | 已证实 | `:160-183` |
| 白名单投影（不含私密字段） | 已证实 | `:184-194`；测试 `:41-46` |
| bundle/pin/owner 全等校验 | 已证实 | `:100-147` |
| 无 IPC/无磁盘 | 已证实 | 全文 import 仅类型 |
| 生产实例化点唯一（author-plan-ipc:329） | 已证实（检索） | 全树 `new CMainB20TrustedCandidateRead` 3 处（生产 1、测试 2） |
| `readCurrentBundle` 抛错行为 | 未知 | 无 catch；依赖调用方 |
| preview 消费端渲染行为 | 未知（超出本文件） | preload/renderer 未逐行核 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `identity`/`expectation`/`installed` | §3.1 | 69-97 | covered |
| `assertBundle` 全分支 | §3.2 | 100-147 | covered |
| `read` 双读/再认证 | §3.3 | 160-195 | covered |
| 构造校验 | §3.3 | 150-158 | covered |
| 投影脱敏 | §7 | 184-194 | covered |
| 回调抛错/部分错误码 | §9 | — | partial |
