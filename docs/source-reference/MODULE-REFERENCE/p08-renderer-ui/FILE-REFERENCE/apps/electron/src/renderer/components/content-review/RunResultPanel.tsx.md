---
path: apps/electron/src/renderer/components/content-review/RunResultPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 71c92c296f180aa1409ef8fe9981f6960de44324
sha256: 27b1883ce947af06b2236d86506dfe8ed9d60eae398db24d375dafa9442980a2
lines: 192
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/RunResultPanel.tsx

## 1. 结论与边界

**审核结果面板**（`:1-3` 注释）：展示最近一次真实运行的检查明细、结论与覆盖。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RunResultPanel` | function（export） | `:38-192` | `({caseId, refreshNonce})` |

内部：`describeSource`（**:22-36，文件名同名≠同来源**，按案卷/原件版本/解析版本三重核对，跨案卷/缺档/旧版均「不可采信」）、`RunPreflight`（`:13-20`）。

## 3. 内部逻辑与关键流程

1. `load`（`:46-80`）：runs+aggregate 并取；ruleLabels（section-criterion→名称 `:55-57`）；**预检**：缺必需材料槽（requiredAt≠decision 且 minCount 不足 `:60`）、缺表格数据检查槽（无 sheet-cell 块 `:61-62`）、**无正式政策时人工判断标题清单**（政策/额度等关键词 `:63-66`）。
2. 操作：`runReviewV2` 真实运行（四层：真实渠道+执行器 `:84`）、`exportReportV2` 导出 MD（`:85-93`）。
3. 预检行（`:118-125`）：分工计数；「避免把缺件误作通过」/「缺工作簿时计算显示待补件」/「不自动决定额度或资格」。
4. Run 卡（最近 3 条 `:127`）：展开明细——来源去重（`:138-139`）；**证明已归属其他事项→「不可直接采信」**（**:144-147**）；未知事项/来源无效→「来源归属异常」琥珀（`:151-158`）+「不得直接作为可靠通过依据」（`:162`）；核对证据来源列表（`:163-166`）；结论/Agent 能力调用/模型调用 tokens/诊断折叠（`:170-185`）。

## 4. 调用者与调用链

入向：结果区（refreshNonce 驱动重载 `:82`）。出向：`window.reviewAPI` 5 接口、sonner。

## 5. 数据 I/O、读写与副作用

写：审核 Run/报告导出（Main）；读：runs/aggregate/template。

## 6. 分支、失败、取消与恢复

加载失败 console.error（`:77-79`）；toast 反馈。不适用取消/恢复。

## 7. 权限与权威状态

红线：来源三重核对（`:22`）；归属异常显式标注（`:147/:162`）；缺件≠通过（`:121`）。

## 8. 修改影响面

改面板 → 结果可信度展示与预检口径。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `RunResultPanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+预检/明细全链 | 已证实 | 逐行读 `:1-192` |
| reviewAPI 返回形态 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:38-192` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
