---
path: apps/electron/src/main/lib/review/review-v3-execution-contract.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b05a8c29c972b8902b2ece742260a0dc019be6b
sha256: 6b6e83307518b1e5118237e4a56a51d2b0b904951610ad3d8f407166987fae67
lines: 134
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-execution-contract.ts

## 1. 结论与边界

C 拥有的 CR-A-001「执行提案」**提案**边界（文件头 :1-8）：`validateV3ExecutionProposal` 是面向未来 C2 durable 消费者的纯 fail-closed 前置校验；`executionProposalId` 给出稳定提案身份。明示：不是 ReviewRun 写者、不是 Main IPC 注册；只有 C 的可信 Main 消费者能构造 Host 回执与 run/permission 上下文；Renderer/Pi 事件字段本身永不证明权威；C0/1 冻结、本传输修订不可降级。

不做的事：不落盘、不发 ACK（'replay' 语义要求 C2 回旧 ACK，:65-66 注释）、不做 Run/Decision 写入。

## 2. 导出与关键符号

导出 4 条（`export` 逐条核 :17/:30/:59/:68）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `V3VerifiedHostReceipt` | interface | `:17-24` | `{permissionGrantId, kind:'read'\|'check'\|'terminal', source?, extent?, check?, terminalStatus?}` | 可信 Host 回执 |
| `V3TrustedConsumptionContext` | interface | `:30-40` | run/plan/permissionGrantId/grantActive/currentCaseRevision/activeSourceVersionIds/verifiedHostReceipts/nextSequence/committedDigests | C Main 构造的消费上下文（:26-29 注释） |
| `executionProposalId` | function | `:59-61` | `(payload) => digest(payload)` | 稳定摘要（`stable` 键排序 :45-51） |
| `validateV3ExecutionProposal` | function | `:68-134` | `(event, trusted) => 'new' \| 'replay'` | 主校验 |

内部符号：`bad`（:42-44，抛 `C0ContractError`，码 ∈ CONTRACT_INVALID/RUN_IDENTITY_MISMATCH/SOURCE_STALE/RECOVERY_REQUIRED）、`stable/same/nonempty/digest/tuple`（:45-57）。

## 3. 内部逻辑与关键流程

`validateV3ExecutionProposal`（:68-134）顺序：
1. 身份字段（:69-73）：schemaVersion===`REVIEW_V3_EXECUTION_SCHEMA`、permissionGrantId/hostReceiptId 非空、sequence 安全整数 ≥1、eventId 64hex，违者 `CONTRACT_INVALID`。
2. 三方断言（:74-77）：`assertC0RunEvidenceIdentity(event.run/trusted.run)`、`assertC0CanonicalPlan(trusted.plan)`。
3. 当前性（:78-84）：run 与 trusted.run 全等、`grantActive`、caseRevision/planFingerprint/templateVersion/ownerGeneration 一致、event.permissionGrantId===trusted.permissionGrantId，违者 `RUN_IDENTITY_MISMATCH`。
4. source 活性（:85-87）：run.sourceVersionIds ⊆ activeSourceVersionIds，否则 `SOURCE_STALE`。
5. 摘要自洽（:88-91）：重算 digest 必须等于 eventId。
6. 可信回执匹配（:92-95）：`verifiedHostReceipts.get(hostReceiptId)` 存在且 kind+grantId 相等，否则 `No matching trusted Host receipt`。
7. 分 kind（:96-121）：
   - read：`assertC0SourceIdentity`；caseId/versionId 双检 + source 与回执 `same` + extent 相等（:96-104），违者 `SOURCE_STALE`。
   - check：binding 唯一匹配（tuple）、checkKey∈run、sourceVersionIds 双 ⊆、check 与回执 `same`、`accepted` 仅 applicable、status 枚举（:105-114），违者 `RUN_IDENTITY_MISMATCH`。
   - terminal：status 枚举且 `=== receipt.terminalStatus`（:115-119），违者 `CONTRACT_INVALID`。
   - 其它 kind：`Unknown event kind`（:120-121）。
8. 序列（:122-133）：`nextSequence` 必须安全整数 ≥1（否则 `RECOVERY_REQUIRED`）；`sequence < nextSequence` 时只有 `committedDigests.get(sequence)===eventId` 才 `'replay'`（否则 `RECOVERY_REQUIRED`）；`sequence !== nextSequence` → `Execution sequence must be contiguous`。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- 生产：`review-v3-technical-ledger.ts:16`（`executionProposalId` :107、`validateV3ExecutionProposal` :269）+ `:18` 类型；`review-v3-main-local-technical-review.ts:32`（`executionProposalId` :143）；`review-v3-main-trust-port.ts:24`（类型 V3VerifiedHostReceipt :41/:146）。
- 测试：`review-v3-execution-contract.test.ts:7-9`（批内，7 用例）；批外 `review-v3-technical-ledger.test.ts:10/:12`、`review-v3-main-trusted-assembly.test.ts:11`（:92）、`review-v3-main-trust-port.test.ts:11`、`review-v3-run-writer.test.ts:10`、`review-v3-main-local-technical-review.test.ts:12`（:99）。

出向：`node:crypto` createHash（:54）；`@profer/shared`（C0ContractError/assertC0RunEvidenceIdentity/assertC0CanonicalPlan/assertC0SourceIdentity/REVIEW_V3_EXECUTION_SCHEMA + 类型 :10-15）。

## 5. 数据 I/O、读写与副作用

无 IO/无副作用/无状态（依据：纯校验 + 哈希函数；输入为值对象）。

## 6. 分支、失败、取消与恢复

- 失败 = `C0ContractError` 四码（§3 逐处）；'replay' 仅对**完全一致且已提交**的事件（:65-66 注释：C2 必须回旧 ACK，不得新发）。
- 不适用「取消/恢复」：纯函数。

## 7. 权限与权威状态

- 权威模型：`V3TrustedConsumptionContext` 必须由 C 的 Main 信任边界从注册 Host 结果/当前 Case/grant/持久事件构造（:26-29 注释）；本文件只做形状+一致性校验。
- 无 sender/role 检查（依据：无相关字段）；「Renderer/Pi 事件字段本身永不证明权威」（:4-5）。

## 8. 修改影响面

- 消费方 `review-v3-technical-ledger.ts`（C2 消费前置）与 `review-v3-main-local-technical-review.ts`（身份计算）；摘要算法与 producer 侧 `createAV3ProposalId`（`review-v3-execution-proposal-producer.ts:87`）是双端契约，须同步。
- 需同步测试：批内 7 用例 + 批外 5 个测试文件（§4）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-execution-contract.test.ts`（批内，1 describe/7 用例，NOT_RUN）：new+replay（:62-68）、换体/丢 committed digest fail-closed（:70-78）、read 物理身份/extent/active/spoof（:80-89）、applicability=unknown 不算 accepted（:91-95）、grant/caseRevision/eventId/sequence 严格（:96-110）、C0 冒充新传输被拒（:111-116）、terminal 回执不匹配被拒（:117-129）。
- 未覆盖：`RECOVERY_REQUIRED` 的 `nextSequence` 缺失分支、check `same` 负例面较窄。mock 边界：纯 fixture 字面量（`as unknown as` C0 提案冒充）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；'replay' 仅完全一致已提交事件 | 已证实 | :59-68/:123-131 |
| 三方断言 + 当前性 + source 活性 + 摘要自洽 | 已证实 | :74-91 |
| 必须有匹配可信 Host 回执 | 已证实 | :92-95 |
| accepted 仅 applicable；terminal 须回执回显 | 已证实 | :105-119 |
| C0 提案冒充被拒（schema 版本门） | 已证实 | :69-73；测试 :111-116 |
| 双端摘要契约（producer/contract） | 已证实 | :59-61 vs producer:87 |
| C2 实际消费者落地 | 未知（文件自述 future consumer :63-66） | — |
| `assertC0*` 断言内部 | 未知（@profer/shared） | :74-77 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validateV3ExecutionProposal` 全 8 步 | §3/§9 | :68-134 | covered |
| `executionProposalId` | §2/§8 | :59-61 | covered |
| 两接口 | §2 | :17-40 | covered |
| nextSequence 缺失分支 | §9 | :122-124 | unknown |
| C2 落地 | §10 | — | unknown |
