---
path: packages/shared/src/types/review-v3-c0.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96f8bcabf39d73868a4723748786c0380b9c06ad
sha256: b0342ca4a936ad91f03bc55feea48be07ab4904ccf3f076f561a6b321ceaca91
lines: 255
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v3-c0.ts

## 1. 结论与边界

**Review C0/1 契约 + 运行时校验函数**（`review-v3-c0.ts:1-16` 注释）：Main 拥有业务权威；A/B 只交换不可变 plan/source/执行提案；**任何一方都不产生第二份 Case 状态**（`:3`）。每个持久化实现必须精确绑定 schemaVersion，legacy 适配器**拒绝未知版本而非静默降级**（`:14-15`）。文件头逐对象列出读写归属（Principal/Main-only 等，`:5-13`）。

## 2. 导出与关键符号（25 条，表 21 行含 3 处合并行）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `REVIEW_C0_SCHEMA_VERSION` | const | `:17` | `'review-c0/1'` |
| `C0RejectionCode` | type | `:19-24` | 13 拒绝码（含 `BLOCKED_AUTH`/`ACTOR_UNTRUSTED`/`SCHEMA_VERSION_UNSUPPORTED` 等） |
| `C0CaseAction` | type | `:26-29` | 5 动作（CREATE/UPDATE_FIELDS/UPSERT_SUBJECT/CORRECT_OBSERVATION/SET_EVIDENCE_LINK `_V2`） |
| `Principal` | interface | `:31-40` | source/role/assurance/scope{caseIds,actions,institutionId?}；`credentialReference` **Main-only 证据引用，非 renderer 字段/非 bearer 凭证**（`:38`） |
| `AuthorizedCaseCommand<T>` | interface | `:42-51` | `principal` **Main 内注入、永不序列化为 IPC 请求**（`:49`） |
| `PlanApplicability` | type | `:53` | applicable/not-applicable/**unknown**（三值） |
| `PlanBinding`/`CanonicalPlan` | interface | `:55-73` | binding 含 `conditionFingerprint`；plan 含 `moduleDigests` |
| `SourceIdentity` | interface | `:75-84` | rawSha256/parseRevision/blockId/location{kind 5 种,locator} |
| `RunEvidenceIdentity` | interface | `:86-98` | runId/caseRevision/planFingerprint/inputManifestHash/attemptId/ownerGeneration |
| `ExecutionEvent` | interface | `:100-108` | eventKind 4 种；toolReceipt 或 null |
| `BatchEntryBinding` | interface | `:110-121` | decisionBasedOnRunId 必须=entryRunId（`:229`） |
| `ImportBatch`/`ReviewBatchAttempt` | interface | `:123-138` | `kind` 区分 'import'/'review' |
| `OutboxReceipt` | interface | `:140-147` | trustTier 4 级；`externally-acknowledged` 需 `externalReference`（`:252`） |
| `C0ContractError` | class | `:149-154` | 携带 `code` |
| `assertC0CaseAuthorization` | function | `:163-181` | 授权判定（§3） |
| `assertC0CanonicalPlan` | function | `:183-193` | 三值 applicability 强制（`:189`） |
| `assertC0SourceIdentity` | function | `:195-203` | 物理版本/定位缺失 → `SOURCE_STALE` |
| `assertC0RunEvidenceIdentity` | function | `:205-213` | → `RUN_IDENTITY_MISMATCH` |
| `assertC0ExecutionEvent` | function | `:215-223` | 回执信封强制 |
| `assertC0BatchBinding`/`assertC0ImportBatch`/`assertC0ReviewBatchAttempt` | function | `:225-248` | 决策-Run 精确绑定/两 kind 互斥（内层 try/catch `:243`） |
| `assertC0OutboxReceipt` | function | `:249-255` | mock 不得冒充外部 ACK（§3） |

内部：6 个守卫（obj/str/strings/hash/nonnegative/schema，`:156-161`；hash=64 hex）。

## 3. 内部逻辑与关键流程

1. **`assertC0CaseAuthorization`**（`:163-181`）顺序：身份完整性→`CONTRACT_INVALID`（`:164-166`）；principal/scope 缺失→`ACTOR_UNTRUSTED`（`:169-171`）；越 scope→`CASE_SCOPE_FORBIDDEN`（`:173-174`）；**local+local-device+reviewer 放行**（`:176`）；school 而非 verified-school→`BLOCKED_AUTH`（`:177-178`）；其余→`ROLE_FORBIDDEN`（`:180`）。
2. **`assertC0CanonicalPlan`**（`:183-193`）：applicability 必须在三值内（"unknown must remain unknown"，`:191`）。
3. **`assertC0ReviewBatchAttempt`**（`:240-248`）：逐 entry `assertC0BatchBinding`（try/catch 吞错转 false，`:243`）且 `batchAttemptId` 与外层一致。
4. **`assertC0OutboxReceipt`**（`:249-255`）：`externally-acknowledged` 必须带 `externalReference`（`:252`）——mock-accepted 不可声明外部确认。

## 4. 调用者与调用链

- 入向：`@profer/shared` barrel（测试 `review-v3-c0.test.ts` 直接 import，`:4-6`）；C Main 校验链（跨批实现未读）；`review-v3-execution.ts`/`review-v3-run.ts` 引用其类型（`RunEvidenceIdentity/SourceIdentity/CanonicalPlan/PlanBinding`）。
- 出向：无（自包含）。

## 5. 数据 I/O、读写与副作用

无 I/O；纯校验（抛 `C0ContractError`）；确定性。

## 6. 分支、失败、取消与恢复

失败=抛 `C0ContractError`（13 码，`:19-24`）；`RECOVERY_REQUIRED`/`SCHEMA_VERSION_UNSUPPORTED` 码声明但**本文件校验函数未使用**（前者留给上层流程）；legacy 拒绝未知版本由 `schema()`（`:161`）+ 文件头规约（`:14-15`）落实。不适用取消/恢复。

## 7. 权限与权威状态

**权威边界为核心**：Main 独占写（`:5-13` 归属表）、principal 不走 IPC（`:49`）、credentialReference 非 bearer（`:38`）、三值 unknown 不得降级（`:189-191`）、mock 回执不得冒充外部 ACK（`:252`）、school 无 verified-school 即 BLOCKED_AUTH（`:177-178`）。

## 8. 修改影响面

改接口/校验 → C Main 校验链、A/B 提案传输（review-v3-execution/run）、C0 fixtures 测试（10 用例）；拒绝码语义变更影响上层错误处理。

## 9. 测试证据

**直接测试 `review-v3-c0.test.ts`（10 用例，NOT_RUN）**：schema 强制/三值/两 kind 互斥/mock 边界/四通道 spoof fixture/精确错误码断言（逐条见测试手册）。fixtures 目录 `docs/design/review-agent/acceptance/v3-dev-c0-r01/C0-SCHEMA-FIXTURES`（`:62`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 25 导出+校验全分支+权威红线 | 已证实 | 逐行读 `:1-255` |
| `SCHEMA_VERSION_UNSUPPORTED`/`RECOVERY_REQUIRED` 的实际使用点 | 未知 | 跨批实现未读 |
| 10 测试断言 | 已证实（静态） | 测试 `:1-115`；NOT_RUN |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 25 导出 | §2 | `:17-255` | covered |
| 授权/三值/mock 校验链 | §3 | `:163-255` | covered |
| 权威红线 | §7 | `:3/:5-15/:38/:49/:189/:252` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
