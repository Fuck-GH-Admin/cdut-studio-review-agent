---
path: apps/electron/src/renderer/components/content-review/review-v3-fallback-executable-plan.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a09772020cb65fe05c43b0aeb1127326ea4438c6
sha256: dde8a008d84f7cd5392a055768b1d8ff9be448230d10f5ad93cb64673471c317
lines: 73
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-fallback-executable-plan.ts

## 1. 结论与边界

**未匹配 B1 初稿→可冻结本地 Pi 审核计划**（`apps/electron/src/renderer/components/content-review/review-v3-fallback-executable-plan.ts:1-3`）：经 Main 原件核验；**所有检查仍为语义/人工确认；不生成校方政策、自动通过或审批结论**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `proposedFallbackChecks` | 函数 | `:8-22` | `(proposal: T01BriefDraft, brief) => string[]` 检查建议 |
| `executableFallbackAuthor` | 函数 | `:24-73` | `(prepared, requirements, nativeDocuments, recordedBy='local-reviewer') => B1AuthorDocument` 冻结计划 |

## 3. 内部逻辑与关键流程

- **`proposedFallbackChecks`**（`:8-22`）：仅**模型或用户明确提出**的规则入检查（`supportedBy==='authorized-model-draft'` 或 `草拟要求：`/`材料：` 前缀，`:9-15`）；**无规则时停留探索性检查**「核对内容/完整性/一致性…不推断制度要求」（`:16-20` 注释+`:19-20`）；去重截 30（`:21`）。
- **`executableFallbackAuthor`**（`:24-73`）：B29 初稿校验（schemaVersion/sources/候选，`:29-31`）；要求 1-30 条、每条 ≤2000 字（`:32-34`）；**来源按原件 SHA 一一对应**（`byteHash===rawSha256`、恰好 1 个匹配，`:36-47`——B2 候选 ID 不能当持久 DocumentVersion，`:48-49` 注释，防幽灵来源）；`human_scope_confirmed:true`（**只许可 Pi 审阅检查，不构成校方规则事实确认**，`:56-59`）；模块 `local-fallback-semantic-review`（责任「本机审核者」）；stage `technical-review`/`mode:'technical'`；output `kind:'non-authoritative-business-candidate'`（`:71`）。

## 4. 调用者与调用链

- 消费方：B29 未匹配兜底流（Main 侧 B1/B29 模块类型导入，`:4-5`）。
- 出向：`review-v3-t01-brief-authoring`（`T01BriefDraft`）、主进程 B1/B29 类型。

## 5. 数据 I/O、读写与副作用

纯函数；写发生在 Main（B1 计划冻结）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无规则 | `:19-20` | 探索性检查（不推断制度） |
| B29 初稿不合规 | `:29-31` | 抛「缺少经过真实材料核验的公共兜底初稿」 |
| 要求越界 | `:32-34` | 抛（1-30 条/≤2000 字） |
| 来源非一一对应 | `:46-47` | 抛「兜底来源未能与当前案卷真实原件一一对应」 |

## 7. 权限与权威状态

- 「不生成校方政策/自动通过/审批结论」（`:2`）。
- **SHA 一一对应防幽灵来源**（`:48-49`）；`human_scope_confirmed` 只限 Pi 审阅（`:56`）；输出非权威业务候选（`:71`）。

## 8. 修改影响面

- B1/B29 类型契约（主进程模块）；`non-authoritative-business-candidate` 输出 kind。
- 要求预算（30 条/2000 字）。

## 9. 测试证据

本批无专属测试（`t05-stage-actions.test` 不含；全树检索 `executableFallbackAuthor` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、SHA 一一对应/不推断红线 | 已证实 | `:8-73` |
| Main 侧冻结执行 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:8-73` | covered |
| 检查建议/冻结计划 | `:8-73` | covered |
