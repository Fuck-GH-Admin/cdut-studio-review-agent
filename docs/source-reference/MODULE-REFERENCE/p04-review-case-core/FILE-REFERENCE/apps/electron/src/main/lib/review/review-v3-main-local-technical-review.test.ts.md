---
path: apps/electron/src/main/lib/review/review-v3-main-local-technical-review.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 021f425b8912872010a348c5d93a67a0facc57c9
sha256: d8447fcc920b733aa441cd7aaf3de4a669ec185c766bfcf5af12add69b0351b1
lines: 210
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-local-technical-review.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `C11MainLocalTechnicalReview` 的 C R11 本地审阅边界：真实物理 Host read + 案卷原件才能产出候选人工审阅（且绝不写正式 `v3ReviewRun`/学校权威）；A 自封信封、Owner 撤销、原件篡改、grant 轮换、A 篡改、空事件集都拒绝；未知 Provider 效果归 `local-recovery-required`；冷进程不信 A 的 Host 快照。

## 2. 用例清单

共 7 个 `test(`（`review-v3-main-local-technical-review.test.ts:140-209`，单一 `describe`）。

夹具（`:37-138`）：`mkdtempSync(tmpdir,'c11-local-first-host-')` + `PROFER_CONFIG_DIR`；真实 `createAggregate` 落盘案卷（`stage:'reviewing'`、`v1` 原件、block1 文本块）并 `writeAggregate` 挂 `canonicalPlan`（`:83-88`）；`run:RunEvidenceIdentity`（`checkKeys:['check-1']`、`sourceVersionIds:['v1']`）；`event` 是带 `eventId:executionProposalId(readBody)` 的 `read` 提议（`:91-97`）；`proof` 信封 `trust:'A_TECHNICAL_ONLY_C_PHYSICAL_OBSERVER_REQUIRED'`、`canSealCReviewRun:false`（`:99-114`）；`seal()` 加 `evidenceHash:sha(canon(clone))`（`:115-118`）；`provider` 为 `C11LocalReviewSource`（`getObservedPhysicalReceipt`/`getCurrentOwner`/`readCurrentCase`，`:119-125`）；控制柄 `observe/revoke/rotate/drop`。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | real physical Host read + saved source -> candidate/manual, no school issuer or C formal Run（`:141`） | `observe()` 后 `inspect`；`close()` 后再 `inspect` | `toMatchObject({status:'local-manual-review',officialSchoolApproved:false,schoolPolicyPublished:false,businessWriteAllowed:false,formalReviewRunSealed:false,readCount:1,seenPhysicalEvents:1,hostSource:'independent-c-main-physical-observer'})`；`readAggregate(f.caseId)?.v3ReviewRun` 为 `undefined`；`toThrow('PORT_CLOSED')` |
| 2 | A own self-sealed technical proposal without an independent physical Host is always refused（`:155`） | 未 observe → inspect；observe → inspect；`drop()` → inspect | `toThrow('No independently observed')`；`readCount===1`；再 `toThrow('No independently observed')` |
| 3 | Owner revoke and physical source bytes mutation independently deny before anything is considered（`:165`） | `revoke()`；另一组改写原件文件 | `toThrow('MAIN_OWNER_GRANT_NOT_CURRENT')`；`toThrow('物理原件')` |
| 4 | current owner grant rotation, A tamper and mismatched physical read reject（`:173`） | `rotate()`；改 `owner.grantId='forged'`；改事件 `extent:'full-document'` | 三次 `toThrow('A_OWNER_DOES_NOT_MATCH_INDEPENDENT_C_OWNER'/'A_OWNER_DOES_NOT_MATCH_INDEPENDENT_C_OWNER'/'A_EVENT_DIGEST_INVALID')` |
| 5 | empty A evidence never produces manual-review without any physical observation（`:187`） | `technicalEvents:[]` | `toThrow('TECHNICAL_EVENT_SET_INVALID_OR_NO_PHYSICAL_PROOF')` |
| 6 | unknown Provider effect remains local recovery-required even with real physical witness（`:193`） | `unresolvedProviderEffect:true` | `toMatchObject({status:'local-recovery-required',unresolvedProviderEffect:true,officialSchoolApproved:false,formalReviewRunSealed:false})` |
| 7 | fresh locally opened process does not trust cold Host snapshots from A event DTO alone（`:201`） | `createC11MainLocalReview` 读一次；close；`drop()`；新建再读 | 第一实例 `readCount===1`；新实例 `toThrow('No independently observed')` |

## 3. 真实断言

- 用例 1：`expect(x).toMatchObject({...})`（`:144-148`）；`expect(readAggregate(f.caseId)?.v3ReviewRun).toBeUndefined()`（`:150`）；`expect(()=>r.inspect(...)).toThrow('PORT_CLOSED')`（`:152`）。
- 用例 2：`toThrow('No independently observed')`（`:158,161`）；`expect(r.inspect(...).readCount).toBe(1)`（`:160`）。
- 用例 3：`toThrow('MAIN_OWNER_GRANT_NOT_CURRENT')`（`:168`）；`toThrow('物理原件')`（`:171`）。
- 用例 4：`toThrow('A_OWNER_DOES_NOT_MATCH_INDEPENDENT_C_OWNER')`（`:175,181`）；`toThrow('A_EVENT_DIGEST_INVALID')`（`:184`）。
- 用例 5：`toThrow('TECHNICAL_EVENT_SET_INVALID_OR_NO_PHYSICAL_PROOF')`（`:189-190`）。
- 用例 6：`toMatchObject({status:'local-recovery-required',unresolvedProviderEffect:true,...})`（`:195-198`）。
- 用例 7：`expect(first.inspect(...).readCount).toBe(1)`（`:204`）；`expect(()=>cold.inspect(...)).toThrow('No independently observed')`（`:208`）。

夹具/mock 边界：磁盘案卷与原件是**真实** IO（临时目录）；Host 观察器/Owner 是内存 mock（`provider`）；A22 信封由测试自构造并真实哈希（`seal()`）；无 Electron/IPC。

## 4. 未覆盖与脆弱点

- 未覆盖：`check`/`terminal` 事件正例、`C_HOST_READ_OR_SOURCE_NOT_EQUAL`、`C_HOST_CHECK_NOT_EQUAL`/`CHECK_NOT_BOUND_TO_LOCAL_FROZEN_PLAN`、`C_HOST_TERMINAL_NOT_EQUAL`、`RUN_SOURCES_NOT_UNIQUE`、`RUN_WIDE_DURABLE_FENCE`、`MAIN_CASE_AND_LOCAL_FROZEN_PLAN_NOT_CURRENT`、`A_EVENT_IDENTITY_SEQUENCE_OR_GRANT_INVALID`、事后漂移 `MAIN_CASE_OR_OWNER_CHANGED_AFTER_OBSERVING`、8192 上限。
- 脆弱点：用例 3 的“物理原件”断言依赖 `assertC2PhysicalOriginalBytes` 的中文错误文案；`canon()` 哈希与实现同算法但由测试重算（若实现改规范化会失配）；夹具 `serial` 依赖执行顺序。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例 | 已证实 | `grep test(`；`:141,155,165,173,187,193,201` |
| 成功路径不写正式 Run | 已证实 | `:150` |
| 无 Host 一律拒（含冷进程） | 已证实 | `:155-162,201-209` |
| 原件篡改独立拒绝 | 已证实 | `:165-172` |
| unknown Provider → recovery-required | 已证实 | `:193-199` |
| 磁盘真实、Host mock | 已证实 | `:37-88`（createAggregate/writeAggregate）与 `:119-125` |
| check/terminal 正例 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 真实 read → manual-review | 1 | 141-153 | covered |
| 无 Host 拒绝 | 2 | 155-163 | covered |
| Owner 撤销/原件篡改 | 3 | 165-172 | covered |
| grant 轮换/A 篡改/事件摘要 | 4 | 173-185 | covered |
| 空事件集 | 5 | 187-191 | covered |
| unknown Provider | 6 | 193-199 | covered |
| 冷进程快照 | 7 | 201-209 | covered |
| check/terminal/围栏/漂移 | 无 | — | unknown |
