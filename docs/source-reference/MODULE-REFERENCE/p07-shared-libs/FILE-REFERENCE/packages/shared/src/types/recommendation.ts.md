---
path: packages/shared/src/types/recommendation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c2255c67e7704834b040a18897d0e39a08a23d8
sha256: 2525c9c411d6cd43c59798bee1f1268ada29d4ec8fdae4c0ec240b3ba89d1fe1
lines: 54
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/recommendation.ts

## 1. 结论与边界

**主动建议（Recommendation）类型 + IPC 通道常量**（`packages/shared/src/types/recommendation.ts:1-54`）：纯声明。注释红线："本地、可解释、需用户确认的主动建议"（`:1`）——建议不自动执行。

## 2. 导出与关键符号（7 条）

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `RecommendationKind` | type | `:2` | `'schedule'\|'maintenance'` | — |
| `RecommendationStatus` | type | `:3` | `'suggested'\|'accepted'\|'dismissed'\|'snoozed'` | — |
| `RecommendationSafetyLevel` | type | `:4` | `'read_only'\|'runs_agent'` | 安全分级 |
| `RecommendationEvidence` | interface | `:6-11` | `{ label; detail; sourceId?; sourceKind?('automation'\|'run') }` | 证据 |
| `RecommendationAction` | interface | `:13-25` | `{ type:'create_automation'\|'edit_automation'; automationId?; prefill?{name,prompt,scheduleType,intervalMinutes?,timeOfDay?,dayOfWeek?,dayOfMonth?} }` | 动作（仅自动化两型） |
| `Recommendation` | interface | `:27-41` | id/kind/title/reason/confidence/safetyLevel/duplicateKey/evidence/action/status/createdAt/updatedAt/snoozedUntil? | 主体 |
| `RecommendationFeedbackInput` | interface | `:43-47` | `{ id; status: 'accepted'\|'dismissed'\|'snoozed'; snoozedUntil? }` | 反馈入参 |
| `RECOMMENDATION_IPC_CHANNELS` | const | `:49-54` | `LIST:'recommendation:list'`、`REFRESH:'recommendation:refresh'`、`FEEDBACK:'recommendation:feedback'`、`CHANGED:'recommendation:changed'` | `as const` |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）。`duplicateKey`（`:34`）暗示去重契约由实现方定义（未在本文件说明）。

## 4. 调用者与调用链

经 `@profer/shared` barrel 消费（建议 UI/主进程 recommendation 服务；具体 file:line 跨批未逐一核）。出向：无。

## 5. 数据 I/O、读写与副作用

无（声明文件）。

## 6. 分支、失败、取消与恢复

不适用，依据：纯类型/常量。

## 7. 权限与权威状态

语义红线（`:1`"需用户确认"）+ `safetyLevel` 分级（`:4`）——执行权由动作类型约束（仅 create/edit_automation）；权威判定在实现方。

## 8. 修改影响面

改形状/通道 → 建议 UI、automation 创建流程、主进程 recommendation handler（跨批）。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `RECOMMENDATION_IPC_CHANNELS|Recommendation` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7+1 导出形状与行号 | 已证实 | 逐行读 `:1-54` |
| duplicateKey/scheduleType 语义细节 | 未知 | 实现方未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出 | §2 | `:2-54` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
