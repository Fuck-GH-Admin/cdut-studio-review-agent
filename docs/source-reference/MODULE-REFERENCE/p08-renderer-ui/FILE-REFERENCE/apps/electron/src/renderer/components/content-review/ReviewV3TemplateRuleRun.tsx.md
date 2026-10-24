---
path: apps/electron/src/renderer/components/content-review/ReviewV3TemplateRuleRun.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f9b7bd6b08937c7f0021d1e97e2f2e6fdd4b9cdd
sha256: 2ced6b60f75b7ec8e72bf23ba7ef9e57230b1c594593104411cdc009aed2f0dd
lines: 89
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3TemplateRuleRun.tsx

## 1. 结论与边界

**已发布模板规则检查入口（ARCH-CLOSURE-R01 S2/S4）**（`:1-7` 注释）：一次点击，Main 用真实已发布模板+已确认字段编译冻结计划、跑 T04 确定性检查、写真实 ReviewRunV2；**界面只展示 Main 返回结果，不构造任何 Plan/Check/Run**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3TemplateRuleRun` | function（export） | `:30-89` | `({caseId})` |

内部：`RuleRunResult`（`:12-18`）、`statusLabel` 7 判定（`:20-28`）。

## 3. 内部逻辑与关键流程

`run`（`:35-47`）：`runTemplateRuleReview({caseId})` → toast 计数（`:41`）；**失败如实报出，不降级成「通过」**（`:43-45`）。结果块：runId/状态（completed→已完成/部分完成）/planFingerprint 前 12 位（`:67-68`）；逐 check（compliant 绿/non-compliant 玫瑰/其余琥珀 `:73-78`，ruleId+reason）。

## 4. 调用者与调用链

入向：规则检查区（跨文件）。出向：`window.reviewAPI.runTemplateRuleReview`、sonner、`@profer/ui`。

## 5. 数据 I/O、读写与副作用

写：真实 ReviewRunV2（经 Main）；toast。

## 6. 分支、失败、取消与恢复

失败→error 行+清结果（`:44-45`）；busy 防重。不适用取消/恢复。

## 7. 权限与权威状态

红线：界面零构造（`:6`）；失败≠通过（`:43`）。

## 8. 修改影响面

改入口 → 模板规则检查 UX 与结果可信度。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3TemplateRuleRun` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+失败语义 | 已证实 | 逐行读 `:1-89` |
| Main 检查实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:30-89` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
