---
path: apps/electron/src/renderer/components/content-review/ReviewV3UnifiedRun.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f9f9af6cb285fbe33b253ace7004e6a2a429608
sha256: 5dab935cb1622a5a3251f2abdb61e71c5e3a27c182ecd9306c1b95624ae3388d
lines: 162
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3UnifiedRun.tsx

## 1. 结论与边界

**普通用户单案审核入口**（`:1-4` 注释）：规则与 Pi 共用同一案卷/材料版本/Main 账本；**两种运行各自保存 Run，只编排已有 Main 操作，不伪造合并结果**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3UnifiedRun` | function（export） | `:26-162` | `({caseId, stage, documentCount, technicalPlan?, canRun?, onUpdated})` |

内部：`RuleReceipt`/`terminalStatuses`（`:9-24`）、`refresh`（`:43-57`）、`start`（`:73-123`）、requestSeq+caseIdRef 双核（**UI-13 旧案异步回读不写进新案卡片** `:38-41`）。

## 3. 内部逻辑与关键流程

1. `refresh`：状态/Run 范围校验（不一致即 throw `:47/:49`）；陈旧响应丢弃（`:50`）；终态提示「请核对待确认项、证据和人工决定」（`:53-56`）。
2. `start`（update/restart/resumeInterrupted）：
   - 前置：canRun/材料非空校验（**:75-76，不能审核空案卷**）。
   - draft+非技术计划→尝试 `submitCaseV2` 转正式办理；**提交失败不阻断本地预审，明示原因**（`:79-89`）。
   - 非技术计划→规则检查；**确定性检查失败≠语义检查可假称通过**（`:96-98`）。
   - 启动 `startBackgroundPiReviewV2`；范围/回执校验（`:105`）；失败→「规则结果不能当成完整审核」（**:114）；**冷启动中断续跑失败关闭，仅显式确认放行**（RUN-43 `:35`/`:112-113`，resumePrompt 按钮 `:136-138`）。
3. 展示：规则/AI 双回执分行（`:146-148`）；覆盖率（`:149`）；**completed 仅技术执行结束≠完整审核通过**（`:150-156`）；材料未读 alert（`:157-158`）。

## 4. 调用者与调用链

入向：单案审核页。出向：`window.reviewAPI` 5 接口（state/getRun/submitCaseV2/runTemplateRuleReview/startBackgroundPiReviewV2）。

## 5. 数据 I/O、读写与副作用

写：提交/规则 Run/AI Run（经 Main）；轮询 2.5s（running 时 `:65-71`）。

## 6. 分支、失败、取消与恢复

各链独立回执互不冒充（§3）；resumePrompt 显式续跑；busy 防重。不适用取消/恢复。

## 7. 权限与权威状态

红线：不伪造合并结果（`:3`）；规则≠完整审核（`:114`）；completed≠通过（`:155`）；续跑显式（RUN-43）。

## 8. 修改影响面

改入口 → 单案审核执行 UX 与回执语义。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3UnifiedRun` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+双回执全链 | 已证实 | 逐行读 `:1-162` |
| reviewAPI 行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:26-162` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
