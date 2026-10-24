---
path: apps/electron/src/renderer/components/content-review/RightPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 83b1b4832e70ff0b923ef010912d4ac845ba6baf
sha256: 960c28c5ff9c19197734f12241c16465b2ea09a38adf29f4d516dcc3ba89e0ea
lines: 526
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/RightPanel.tsx

## 1. 结论与边界

**右栏「待我处理」**（`RightPanel.tsx:1`）：V2 运行结果的审核员待办、补件与最终决定。回执归属红线：**操作回执只属于当前案卷和轮次，切案或重启不沿用上一轮停止提示**（`:72`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RightPanel` | function（export） | `:45-443` | `({actions: ReviewActions})` |

内部：`SupplementActions`（`:445-472`）、`MaterialActions`（`:474-489`）、`readinessBlockerLabel`（`:491-499`）、`decisionLabel`/`decisionSummary`（**:501-526，汇总按 basedOnRunId+inputHash 过滤当前认定、手动分数覆盖 declaredScore、rejected 计 0、待认定计数**）。

## 3. 内部逻辑与关键流程

1. **perform 作用域防护**（`:86-109`）：feedbackScope+operation 序号双闸（`:60-66`），**切案/换 Run 的陈旧回执丢弃**；对话框失败**rethrow 只有成功回执才关窗**（UI-06 `:104-105`）。
2. 待办卡（`:274-343`）：分组标题（verify/resolve/adjudication，**「这是待办数量，不是整案结论」** `:298`）；核验范围（subject/group/整案 `:306-310`）；来源链接（`ReviewV3SourceLinks`+focusSource 定位 `:315/:191-198`）；处置四钮（**确认问题≠整案驳回/确认符合≠整案通过** `:120-123`）；补件/认定/材料确认/补件登记各链。
3. 处置对话框（`:111-128`）：四 disposition 带默认理由+必填。
4. **最终决定区**（`:397-435`）：decisionReadiness blockers 可点击跳转（`:408-424`）；四按钮——通过/部分通过（canDecide）、退回补件（运行有效）、**整案驳回需 canReject「与当前案卷输入一致的已完成审核」**（`:431`）；驳回回执明示「其余待办随案卷结案，没有被逐条标记为确认问题」（`:161`）。
5. 其余：全部检查及出处（**「缺少精确来源不会被当作已定位」** `:352`）、审核建议（**「仅供审核参考」** `:375`）、已处理/随案结案列表、审核记录时间线（`CaseTimelinePanel` `:437`）。

## 4. 调用者与调用链

入向：三栏工作台右栏。出向：`./use-review-actions`/`use-review-workspace-actions`/`review-workspace-view-model`/`ReviewActionDialog`/`ReviewV3SourceLinks`/`CaseTimelinePanel`、`@/atoms/review-atoms`（11 原子）。

## 5. 数据 I/O、读写与副作用

写：处置/补件/认定/决定（workspaceActions→Main）；DOM 滚动定位。

## 6. 分支、失败、取消与恢复

失败→notice；对话框 rethrow 保留输入（UI-06）；busyKey 防重。不适用取消/恢复。

## 7. 权限与权威状态

红线：回执作用域（`:72`）；单条处置≠整案结论（`:120-123/:298`）；驳回门槛（`:431`）；建议仅供参考（`:375`）。

## 8. 修改影响面

改右栏 → 审核员待办/处置/决定全链。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `RightPanel`（content-review）→ 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+5 内部+全链 | 已证实 | 逐行读 `:1-526` |
| workspaceActions/Main | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:45-526` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
