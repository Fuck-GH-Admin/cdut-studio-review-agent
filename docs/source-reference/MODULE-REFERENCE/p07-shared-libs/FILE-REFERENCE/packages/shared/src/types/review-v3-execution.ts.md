---
path: packages/shared/src/types/review-v3-execution.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13870f3761547881561405a40b955df0dd9d9955
sha256: 0169df5b1fde3888abd5464c825e20ca0a0ccb5b443af6efef088444f5354893
lines: 27
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v3-execution.ts

## 1. 结论与边界

**Review V3 执行提案传输 DTO**（`review-v3-execution.ts:1-8` 注释，CR-A-001、Dev-C 拥有版本化 DTO）：纯声明。红线：这是**提案信封**，不是正式 ReviewRun/权限令牌/accepted 业务 Check/持久 ACK；A 仅从 Host 佐证结果发出，C Main 独占校验当前权威并持久化 Run（`:4-7`）。

## 2. 导出与关键符号（4 条）

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `REVIEW_V3_EXECUTION_SCHEMA` | const（export） | `:11` | `'review-v3-execution/1'` | schema 标识 |
| `V3CheckStatus` | type（export） | `:13` | `'accepted'\|'rejected'\|'missing'\|'unknown'` | 技术态 |
| `V3TechnicalTerminal` | type（export） | `:14-16` | `'completed-technical'\|'partial'\|'cancelled'\|'timed-out'\|'needs-resume'\|'failed'` | 技术终态 |
| `V3ExecutionProposal` | type（export） | `:18-27` | 三分支联合：`kind:'read'`（`read:{source,extent:'block'\|'full-document'}`）/`kind:'check'`（`check:{checkKey,targetKey,objectKey,subjectId,status}`）/`kind:'terminal'`（`terminal:{status,reason?}`） | 每分支都带 `schemaVersion/eventId/run/sequence/permissionGrantId/hostReceiptId` |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）；三提案分支以 `kind` 判别（`:19/:22/:25`），公共六字段每分支重复（DTO 冗余设计）。

## 4. 调用者与调用链

- 出向：`./review-v3-c0`（`RunEvidenceIdentity/SourceIdentity`，`:9`，本批同组）。
- 入向：经 `@profer/shared` barrel（A 端提案生成 / C Main 校验持久化，跨批）；`review-v3-run.ts` 的注释声明"本传输保持独立冻结"（`review-v3-run.ts:8`）。

## 5. 数据 I/O、读写与副作用

无（声明文件）。

## 6. 分支、失败、取消与恢复

不适用（纯类型）；`V3TechnicalTerminal` 含 `needs-resume`（`:15`）——恢复语义由实现方承担。

## 7. 权限与权威状态

**权威红线为本文件核心**（`:4-7`）：提案≠Run/权限/业务结论；C Main 独占校验权威与持久化；现有 frozen review-c0/1 不变（`:7`）。

## 8. 修改影响面

改 DTO → A/C 提案链路与 `review-v3-run.ts`/`review-v3-c0.ts` 的类型引用；注释明示该传输"frozen"（跨版本兼容约束）。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `V3ExecutionProposal|REVIEW_V3_EXECUTION_SCHEMA` → 0 命中；`review-v3-c0.test.ts` 测的是 c0 层，不测本 DTO）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+三分支联合+权威红线 | 已证实 | 逐行读 `:1-27` |
| A/C 实现遵守该边界 | 未知 | 实现方（跨批）未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | `:11-27` | covered |
| 权威红线 | §7 | `:4-7` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
