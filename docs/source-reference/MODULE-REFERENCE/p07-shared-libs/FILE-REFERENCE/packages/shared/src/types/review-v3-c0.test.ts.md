---
path: packages/shared/src/types/review-v3-c0.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 78acec41ccdc6e6c3eca5e78217761eccd16b6ed
sha256: 25628d875f7af8a964f1a010597c8cee460d489708f25c2cf00b056b9217c892
lines: 115
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v3-c0.test.ts

## 1. 测试目标

`review-v3-c0.ts` 的 C0 schema 运行时校验函数（`assertC0*` 九件）："no silent downgrade"（`:11`）——unknown 不得当 pass、版本/条件强制、mock 不得冒充外部 ACK；并把已提交的 JSON fixtures 当可执行测试输入（`:66`）。

## 2. 用例清单

2 个 describe + **10 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| C0 schema runtime validation（5） | multi-target unknown 非 pass/版本条件强制 / Source 要 raw+version+locator / Run+执行提案身份回执形状 / ImportBatch≠ReviewBatchAttempt+Run 校验 / mock 不证外部 ACK | `:12-59` |
| C0 committed schema fixtures（5） | local-reviewer 非学校凭证（role/scope 再核）/ L1-02 四通道 spoof 显式不信任 / multi-target-unknown 从 JSON 加载 / 无精确 Run 结构非法 / 四级回执 fixture 驱动 | `:67-114` |

夹具：`entry` 常量（`:8-10`）；`C0-SCHEMA-FIXTURES` 目录 JSON（`import.meta.dir` 相对定位 `:62-65`）。

## 3. 真实断言

- `:17-21` 合法 plan `not.toThrow()`、两 binding `applicability` `toEqual(['unknown','unknown'])`；`'pass'`/`conditionFingerprint:''`/`schemaVersion:'review-c0/999'` 均 `toThrow()`。
- `:26-28` 合法 source `not.toThrow()`；`documentVersionId:''`/`location:{}` `toThrow()`。
- `:34-40` run/event 合法通过；`attemptId:''`/`manifestHash:''` `toThrow()`。
- `:46-51` review/import 各自通过、交叉 `toThrow()`；`entryRunId:''`/`decisionBasedOnRunId:'other'` `toThrow()`。
- `:56-58` `trustTier:'mock-accepted'` `not.toThrow()`；`'externally-acknowledged'` `toThrow()`；带 `externalReference:'ack'` 才 `not.toThrow()`。
- `:74-82` local-reviewer fixture 通过 `UPDATE_FIELDS_V2`；role:'teacher' → `ROLE_FORBIDDEN`；换 caseId → `CASE_SCOPE_FORBIDDEN`；source:'school' → `BLOCKED_AUTH`（`toThrow('…')` 精确码）。
- `:86-93` spoof fixture `expected` `toBe('ACTOR_UNTRUSTED')`、四通道 `toHaveLength(4)`、`liveElectronRendererAttackProven` `toBe(false)`。
- `:97-104` multi-target fixture 通过、错误 schemaVersion `toThrow()`；missing-run → `BATCH_ATTEMPT_MISMATCH`。
- `:109-112` outbox-tiers `cases` `toHaveLength(5)`，逐项 valid/`CONTRACT_INVALID`。

## 4. 未覆盖与脆弱点

- 未覆盖：`assertC0*` 的其余拒绝分支；fixtures 目录内其他文件。
- 脆弱点：精确错误码字符串（`ROLE_FORBIDDEN` 等）与 fixture 文件名绑定；fixtures 路径含 6 层 `..`（目录移动会碎）。
- **NOT_RUN**：本轮未执行本文件；fixtures 文件未逐个读（仅测试引用）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例与断言如 §3 | 已证实 | 逐行读 `:1-115` |
| fixture JSON 内容 | 未知 | 未逐个读（负向：路径引用与断言一致） |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测函数 | 用例 | 状态 |
| --- | --- | --- |
| assertC0CanonicalPlan/SourceIdentity/RunEvidenceIdentity/ExecutionEvent | 3 | covered |
| assertC0ReviewBatchAttempt/ImportBatch/BatchBinding | 1 | covered |
| assertC0OutboxReceipt | 2 | covered |
| assertC0CaseAuthorization | 1 | covered |
| fixtures 加载链 | 3 | covered（引用级） |
