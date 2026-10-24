---
path: apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 36c74c06cb21f34ba4f15af39fd860b935a5829d
sha256: d779c7846ca81f3f2f6252b9ab7aae9e0460af0700dc2c2a3c4aa6c18d2b6960
lines: 179
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `CMainB20TrustedCandidateRead` 的授权边界（无 IPC）：只返回 pin 一致的当前 B20 候选预览并脱敏（不含物理选择 key/Principal/Issuer）；安装 token、frame、Owner、pin、bundle 任一在 await 后漂移都 fail-closed；伪造的 bundle/ provenance 不能冒充当前来源。

## 2. 用例清单

共 8 个 `test(`（`review-v3-main-b20-trusted-candidate-read.test.ts:83-178`，单一 `describe`）。

夹具（`:48-81`）：`candidateBundle()`（`:18-47`）返回 pin 对齐的 bundle，并故意塞入 `principalId`/`nativePhysicalArchiveKey`/`sessionId`/`schoolIssuer` 私密字段（`:41-46`）；`fixture()` 维护 `current/pinned/token/allowed/raw/callCount/onRead`，返回 `revoke/noFrame/rotateOwner/swapFrame/revokeInstall/reinstallSameSource/rotateSource/mutate` 控制柄。期望 pin：`revision:3`、两个 digest（`:8-11`）；身份含 `caseCandidateId:'case-candidate-51'`（`:12-17`）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | only exact current B20 candidate is returned, redacting physical picker/Principal/Issuer（`:84`） | 正常读取；伪造 binding 后再读 | `calls()===2`；`toMatchObject({templateId:'template51',authorRevision:3,displayOnly:true,state:'candidate-held',candidateOnly:true,publicationAllowed:false,businessWriteAllowed:false,schoolPolicyVerified:false})`；`not.toHaveProperty('nativePhysicalArchiveKey'/'principalId'/'schoolIssuer')`；`bindings[0].state==='unknown'`；再读 `bindings` 长度仍 1（克隆隔离） |
| 2 | no Main/Owner installation or wrong template refuses before any B read（`:101`） | 空依赖构造；`'../traversal'`；`revokeInstall()`；`noFrame()`；`revoke()` | `TRUSTED_MAIN_AND_B20_DEPENDENCIES_REQUIRED`；`TEMPLATE_SCOPE_INVALID`；`MAIN_INSTALLATION_MISSING` 且 `calls()===0`；`MAIN_IDENTITY_NOT_INSTALLED`；`MAIN_ACL_REVOKED` |
| 3 | revoked same-object Main installation during first awaited source read is not revived（`:116`） | 第 1 次读取时 `reinstallSameSource()`（换 token） | `MAIN_CONTEXT_REVOKED_AFTER_B20_READ`；`calls()===1` |
| 4 | swapped physical frame, rotated Owner generation or removed auth after await fail closed（`:123`） | 换帧/第 2 读轮换 owner/撤销 ACL | `MAIN_CONTEXT_REVOKED_AFTER_B20_READ` ×2；`MAIN_ACL_REVOKED` |
| 5 | C Main source revision, digest and fingerprint must remain identical after awaited disk read（`:133`） | 读取时 `rotateSource()`；`mutate(authorRevision=2)`；`mutate(frozenDescriptor...fingerprint)` | `MAIN_CONTEXT_REVOKED_AFTER_B20_READ`；`B20_BUNDLE_NOT_PINNED_TO_MAIN`；`B20_FROZEN_DESCRIPTOR_MISMATCH` |
| 6 | candidate bundle cannot claim published policy, business write, or independent authorizer（`:147`） | 5 种篡改：`publicationAllowed=true`/`businessWriteAllowed=true`/`schoolPolicyVerified=true`/`authorityInstalledByB=true`/`authorStatus='published'` | 全部 `B20_BUNDLE_NOT_PINNED_TO_MAIN` |
| 7 | cross-case, rotated Owner, forged B19 receipt/provenance status cannot pass as current（`:160`） | 4 种篡改：`caseCandidateId`/`ownerGeneration`/`candidateProvenance.caseCandidateId`/`candidateProvenance.publicationAllowed`/`snapshotHash`/`planFingerprint` | `/B20_(BUNDLE_NOT_PINNED_TO_MAIN|SOURCE_PROVENANCE_NOT_CURRENT)/` |
| 8 | in-flight B20 source changes after first physical read are not returned（`:173`） | 第 1 读后改 `snapshotHash` | `B20_SOURCE_CHANGED_DURING_READ`；`calls()===2` |

## 3. 真实断言

- 用例 1：`expect(f.calls()).toBe(2)`（`:87`）；`expect(value).toMatchObject({...})`（`:88-92`）；三个 `not.toHaveProperty`（`:93-95`）；`expect(p.bindings[0]?.state).toBe('unknown')`（`:98`）；`expect((again.candidateProvenance as typeof p).bindings).toHaveLength(1)`（`:100-101` 区段 `:100`）。
- 用例 2：`rejects.toThrow('TEMPLATE_SCOPE_INVALID')`（`:105`）、`MAIN_INSTALLATION_MISSING` + `expect(f.calls()).toBe(0)`（`:107-108`）、`MAIN_IDENTITY_NOT_INSTALLED`（`:111`）、`MAIN_ACL_REVOKED`（`:114`）。
- 用例 3/4/5：`rejects.toThrow('MAIN_CONTEXT_REVOKED_AFTER_B20_READ')`（`:118,126,129,135`）；`MAIN_ACL_REVOKED`（`:131`）；`B20_BUNDLE_NOT_PINNED_TO_MAIN`（`:138`）；`B20_FROZEN_DESCRIPTOR_MISMATCH`（`:141`）。
- 用例 6/7：循环内逐篡改 `rejects.toThrow(...)`（`:155,168-171`）。
- 用例 8：`B20_SOURCE_CHANGED_DURING_READ` + `calls()===2`（`:176-177`）。

夹具/mock 边界：完全单元级——无 Electron、无磁盘、无 IPC；B20 bundle 是内存对象（`readCurrentBundle` 返回克隆）；身份/ACL/pin/token 全部注入可控。

## 4. 未覆盖与脆弱点

- 未覆盖：`MAIN_INSTALLATION_MISSING` 之外的 token 缺失形态、`B20_CURRENT_BUNDLE_INVALID`（非对象）、`readCurrentBundle` 抛错/拒绝、`expected.revision<1` 等 `expectation` 细分、`templateId` 80 字符边界。
- 脆弱点：用例 6/7 的篡改循环依赖 `B20_BUNDLE_NOT_PINNED_TO_MAIN` 与 `B20_SOURCE_PROVENANCE_NOT_CURRENT` 的具体错误码；实现若细分错误码需同步改断言。用例 1 的 `calls()===2` 依赖双读实现。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个用例 | 已证实 | `grep test(`；`:84,101,116,123,133,147,160,173` |
| 脱敏被断言（3 个私密字段） | 已证实 | `:93-95` |
| 克隆隔离被断言 | 已证实 | `:96-101` |
| 双读被断言 | 已证实 | `:87,177` |
| await 后漂移全路径拒绝 | 已证实 | `:116-141` |
| bundle/provenance 篡改拒绝 | 已证实 | `:147-171` |
| 测试无磁盘/无 Electron | 已证实 | import 仅 `bun:test` 与被测模块 |
| `readCurrentBundle` 抛错行为 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 正常读取/脱敏/克隆 | 1 | 84-101 | covered |
| 构造/模板/安装/身份/ACL 拒绝 | 2 | 101-115 | covered |
| 同对象重装不复活 | 3 | 116-122 | covered |
| 帧/Owner/ACL 漂移 | 4 | 123-132 | covered |
| pin/bundle 指纹漂移 | 5 | 133-142 | covered |
| 越权声明篡改 | 6 | 147-158 | covered |
| 跨案/provenance 篡改 | 7 | 160-172 | covered |
| 读中源变化 | 8 | 173-178 | covered |
| 回调抛错/其余错误码 | 无 | — | unknown |
