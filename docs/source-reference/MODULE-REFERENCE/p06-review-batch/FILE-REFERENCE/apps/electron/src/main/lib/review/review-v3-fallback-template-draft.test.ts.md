---
path: apps/electron/src/main/lib/review/review-v3-fallback-template-draft.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0071689d59ed3ba610efdba69bcd21f13845c58
sha256: 14f86a81cf7193f8cccd00deb31a2eda0cb3a72162271acf2696fd12195215e5
lines: 91
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-fallback-template-draft.test.ts

## 1. 测试目标

“未匹配业务 → 可编辑模板草稿”（describe `:40`）：draft 状态+双阶段（技术阶段不进业务链）、不虚构政策（policy 两空）、判据全 semantic 无确定性约束、字段/枚举/subject scope 映射、空手审补最小学审、缺字段/缺 ID 拒绝不产出空模板。被测：`fallbackDraftFromB1`。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**6 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:41-47` | draft 状态+双阶段；技术阶段不进业务阶段链 |
| 2 | `:48-55` | `policyVersionIds`/`policyRefs` 为空，来源只作证据（sourceCandidates） |
| 3 | `:56-65` | 判据一律 semantic、无 deterministicConstraint（等负责人确认） |
| 4 | `:66-77` | 字段映射：`kind` 为 enum 且 options 2 个；`itemName` scope `subject` |
| 5 | `:79-85` | 仅 technical 阶段时补 1 个 `initial-review`（executorRole reviewer） |
| 6 | `:87-90` | `fields:[]` → throw“没有字段”；模板 ID `'  '` → throw“缺少模板 ID” |

## 3. 真实断言

- #2 是“不虚构政策”的直接反证（两空数组+sourceCandidates 独立）。
- #3 断言判据 `execution==='semantic'` 且无确定性字段。
- #6 双拒绝（空字段/空 ID）——“不产出空模板”。

## 4. 未覆盖与脆弱点

**未覆盖**：`materialSlots` 空断言；`notes` 内容断言；`stagesOf` 的 teacher 角色映射与 nextStageId 串联；evidence→text 降级；`rawSha256` 透传。

**脆弱点**：`document()` 夹具构造器（`:10` 附近）与 B1 形状耦合；#1/#3 的断言细节在前段（已读确认）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、6 test、纯内存 | 已证实 | `:40`；`grep -c test(`=6 |
| draft+技术阶段过滤 | 已证实 | `:41-47` |
| 不虚构政策 | 已证实 | `:48-55` |
| 全 semantic | 已证实 | `:56-65` |
| 字段/枚举/subject 映射 | 已证实 | `:66-77` |
| 空手审补默认/缺字段拒绝 | 已证实 | `:79-90` |
| notes/materialSlots/teacher 映射 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| draft/阶段链 | #1/#5 | `:41-47`、`:79-85` | covered |
| 政策两空/来源证据 | #2 | `:48-55` | covered |
| semantic 判据 | #3 | `:56-65` | covered |
| 字段映射 | #4 | `:66-77` | covered |
| 拒绝族 | #6 | `:87-90` | covered |
