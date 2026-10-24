---
path: apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3039718333ee217b5542b1398bc4c4a8e08e777
sha256: 9ea29559ad7939812b0c71e4a3cb097b289a5cfeee2dee829b893d887cb188af
lines: 383
kind: test
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.test.ts

## 1. 测试目标

验证 B R19 全链「真实 ZIP→Main 暂存→解析→输入账本→B1 Check×target」的候选来源证明（`buildB19CandidateSourceBindings`，`review-v3-b1-b2-candidate-source-bridge.ts:267-357`）：接受态可链接、缺失保持 UNKNOWN、伪造/篡改/跨代全阻断、永不发布（`apps/electron/src/main/lib/review/review-v3-b1-b2-candidate-source-bridge.test.ts:131`）。

## 2. 用例清单

2 describe / 13 test。夹具（`:15-130`）：`fixture()` 建真实 `ReviewB2StagingService`/`ReviewB2SourceVersionAdapter`/`ReviewB2ArchiveVault`/`ReviewB2InputLedger`（各用独立 tmp 目录）；`zip()` 手工构造真实 ZIP 字节（`:27-51`）；`imported()` 走 `saveAndStage`→逐条 `ledger.decide(…accepted, role:'supporting', subjectId:'student-1')`→`parser.parse`（`:67-91`）；`author()` 构造 4 check（check-a1/a2/b/both）单 target 的 B1 文档（`:92-118`）；`ctx={senderId:21,frameId:3,ownerId:'trusted-main',ownerGeneration:5,caseCandidateId:'case-r19'}`（`:17-18`）。

**describe 1「B R19 actual ZIP…」（`:131-308`）**

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| R19-01 | 真实接受回执链接两个物理源到四项义务，绝不 PASS/发布 | 全链 compile | 4 bindings 全 `linked-candidate`；check-both 2 源；每源 receipt/ledger/proposal hash 64 位、`fullDocumentProven===false`；四 false 标志；同输入重编译相等；planFingerprint 对齐 | `:132-149` |
| R19-02 | 缺失/部分来源保持 UNKNOWN，不删 Check | 只给 1 个选择 | 4 bindings 保留；3 个 `unknown`；check-b `linked-candidate` | `:150-156` |
| R19-03 | 同名同字节不同物理档案不可复用源版本 | 两次 `imported` 同内容不同 physical key | rawSha 相同、documentVersionId 不同；旧选择→全 `stale`；迁移选择→全 linked 且 5 条 `source-version-changed` 失效 | `:157-171` |
| R19-04 | 换源 A 仅失效三条 A 链，B-only Check 不动 | 变更 same.txt 后混编选择 | 全 linked；3 条失效均 `s-a`；check-b 的 receiptHash 与旧快照相同 | `:172-196` |
| R19-05 | 错角色/主体、未确认账本、假 key 阻断 | requiredRole 改 application；subjectId 改；假账本+`'forged-key'` | 前两者 `needs-human-confirmation`；假 key 抛 `B_R19_NATIVE_ARCHIVE_KEY_MISMATCH` | `:197-227` |
| R19-06 | 跨条目/假解析块/过期 parseRevision/重复选择不可过 | 逐项伪造 | 跨条目抛 `B_R19_ZIP_STAGED_ENTRY_IDENTITY_MISMATCH`；过期/假块→`stale`；重复抛 `B_R19_SELECTION_INVALID_OR_DUPLICATE` | `:228-238` |
| R19-07 | 无关 Case/Owner/代与撤销绝不铸证据 | 改 ctx 三项；`staging.revoke` | 全抛；撤销后抛 `B2_OWNER_INVALID_OR_REVOKED` | `:239-253` |
| R19-08 | 真实账本/归档字节篡改阻断重算 | 改 `ledger.json`；换 `archive.zip` 字节 | `B2_LEDGER_CORRUPT`；`/B2_ARCHIVE_/`；还原后全 linked | `:254-269` |
| R19-09 | 直接 Main 暂存原件+真实解析无账本回执不虚假升级 | `staging.stage` 直通 | `needs-human-confirmation`；readExtent.rawSha256 对齐 | `:270-286` |
| R19-10 | 伪造冻结作者/删 Check/篡改前审计不被默收 | 改 `recordedBy`；篡改 prior receiptHash；删 check-a2 | `B1_FROZEN_DIGEST_MISMATCH`；`B_R19_PRIOR_SNAPSHOT_UNTRUSTED`；`binding-removed-or-changed` 失效；新 3 bindings vs 旧 4 | `:287-307` |

**describe 2「B R19 conservative ledger and author semantics」（`:311-383`）**

| # | 名称 | 动作 | 断言要点 | 行 |
| --- | --- | --- | --- | --- |
| R19-11 | 跳过/拒绝文件保留原字节但永不成 linked 证据 | `ledger.decide` skipped/rejected | 两 binding 均 `needs-human-confirmation`；无 linked；账本态 `['skipped','rejected']`；初始态未被改写 | `:312-347` |
| R19-12 | 旧输入回执不能跨新 Main 代重新授权 | `ownerGeneration+1` 新 ctx 引用旧 archiveId | `HISTORIC_INPUT_RECEIPT_REAUTH_REQUIRED`；`needs-human-confirmation`；账本 mutation 仍旧代 | `:348-369` |
| R19-13 | linked 证据不覆盖 unknown 作者适用性 | 加 `field-equals` 条件 | binding.applicability `unknown`、source `linked-candidate`、binding 态 `unknown`；相邻 binding `linked-candidate` | `:370-382` |

**依赖顺序**：`fixture()` 每用例独立（`count` 递增命名）；R19-08 内部按「篡改→断言→还原→断言」顺序。

## 3. 真实断言

- R19-01：`expect(result.bindings.every(x => x.sources.every(s => s.receiptHash?.length===64 && … && s.readExtent?.fullDocumentProven===false))).toBe(true)`（`:138-140`）。
- R19-03：`expect(migrated.invalidatedPriorEvidence.every(x=>x.reason==='source-version-changed')).toBe(true)`（`:169`）。
- R19-06：`expect(() => compile(f, entry, undefined, cross)).toThrow('B_R19_ZIP_STAGED_ENTRY_IDENTITY_MISMATCH')`（`:231`）。
- R19-12：`expect(snapshot.bindings[0]!.sources[0]!.reason).toBe('HISTORIC_INPUT_RECEIPT_REAUTH_REQUIRED')`（`:366`）。
- R19-13：`expect(result.bindings[0]!.state).toBe('unknown')`（`:380`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`archiveId`/`entryIndex` 只给其一的半选择（`ZIP_SELECTOR_INCOMPLETE`）、`B2_INPUT_ROLE` 为 application 的链接、32+ 档案、并发 ledger decide。
- 脆弱点：手工 ZIP 构造器（`:27-51`）与 B2 vault 的 ZIP 解析实现耦合；`count` 全局递增使并行执行可能撞目录名（当前串行安全）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例逐一对应被测分支/错误码 | 已证实 | 只读核对本文件与 bridge 源 |
| 夹具为真实 vault/ledger/parser、非 mock | 已证实 | `:55-60`、`:68-70` |
| 测试实际通过 | 未知 | NOT_RUN |
| R19-05 的未确认账本路径走 `INPUT_LEDGER_NOT_ACCEPTED` | 推断 | 断言只看 state，未断言 reason |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 全链链接+不发布 | R19-01 | `:132-149` | covered |
| UNKNOWN 保义务 | R19-02 | `:150-156` | covered |
| 物理档案不可复用 | R19-03 | `:157-171` | covered |
| 失效粒度 | R19-04 | `:172-196` | covered |
| 角色/主体/key | R19-05 | `:197-227` | covered |
| 选择器伪造 | R19-06 | `:228-238` | covered |
| ctx/撤销 | R19-07 | `:239-253` | covered |
| 字节篡改 | R19-08 | `:254-269` | covered |
| 直通不升级 | R19-09 | `:270-286` | covered |
| 作者/前审计 | R19-10 | `:287-307` | covered |
| 跳过/拒绝 | R19-11 | `:312-347` | covered |
| 跨代回执 | R19-12 | `:348-369` | covered |
| 适用性 unknown | R19-13 | `:370-382` | covered |
