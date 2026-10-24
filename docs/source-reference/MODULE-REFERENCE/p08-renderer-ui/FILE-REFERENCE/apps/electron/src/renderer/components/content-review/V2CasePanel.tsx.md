---
path: apps/electron/src/renderer/components/content-review/V2CasePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 00a94c0eb50a7e328403810f2e50facb043795c6
sha256: a1b2ba46b03b4759c49f32daf21d85711115d53b459d14cd58b4924206059852
lines: 702
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/V2CasePanel.tsx

## 1. 结论与边界

**案卷原子与面板（审核命令可操作入口）**（`V2CasePanel.tsx:1-6`）：Jotai 聚合缓存+动作回调；**组件只做展示与触发命令，不散落 IPC 调用（仓库四层约定）**。U01 走通：seed 样例→建案→改字段→重启保留。

## 2. 导出与关键符号（6 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `reviewV2AggregateAtom`/`reviewV2BusyAtom`/`reviewV2NoticeAtom` | atom（export） | `:29-31` | 聚合/忙/通知 |
| `templatesRefreshAtom` | atom（export） | `:33` | 模板发布后重载（**面板常驻挂载 tab 切换不触发 effect**） |
| `V2CasePanel` | function（export） | `:208-702` | 主面板 |

内部：`localActor`（本地声明 actor `:35`）、`CaseSubjectEditor`（**:95-205，导入草稿补齐必需分项的唯一产品入口** `:89-94`）、`initialSubjectRows`（必需分项预置行 `:44-53`）、`renderTemplateFieldInput`/`fieldValueToInput`/`rawValueForSpec`（`:55-87`）。

## 3. 内部逻辑与关键流程

1. **建案**（`createFromTemplate` `:290-326`）：仅 published 模板（`:448`）；**只提交用户真正填写的事项**（防空白行被「事项名称不能为空」拒 `:294-297`）；字段按 spec 转型（`:301-304/:312-315`）。
2. **openCase 竞态闸**（**:266-278，快速连续开 A/B 只落地最后一次（UI-02)**；案卷不存在提示）。
3. **run/applyResult**（`:239-264`）：错误 humanize 展示；**冲突/校验错误如实呈现不静默重试（07 §3.1）**（`:260`）。
4. **T05 可信阶段端口**（`:350-395`）：**渲染层只声明角色，actor/Run/规则准备度由 Main 重核**（`:351`）；能力获取失败=技术预审/CanonicalPlan 案卷按设计不可办业务（**不展示能力也不伪造** `:364-365`）；`recordTrustedStageDecision` 写后重读聚合（**拒绝原因原样回传不得改写成「已完成」** `:388`）。
5. **Run 账本**（`:402-428`）：**当前 Run 只从持久账本取，不凭运行按钮猜状态**（`:408`）；stale 由 Main validity 判定。
6. **材料槽**（`:430-443`）：单槽自动选中；**切案/换模板版本必须重算防串槽**（UI-12 `:431-432`）。
7. 面板组合（`:586-697`）：UnifiedRun/ReportPanel/T05HumanWorkflow（含申诉三端口 `:639-641`）/RunDecision/RunResultPanel/ObservationConfirmPanel/TemplateRuleRun（高级只跑规则 `:647`）/T09/T02/T03/AssignmentCard/Timeline/**CaseSubjectEditor（仅 draft `:659-661`）**；姓名保存（`updateFieldsV2` CAS `:677-695`）。
8. seed 示例（`:327-346`，固定 comprehensive-assessment-v2 演示数据）。

## 4. 调用者与调用链

入向：内容审核工作台。出向：同批 12 个子面板、`window.reviewAPI` 12 接口、`@/atoms`、sonner。

## 5. 数据 I/O、读写与副作用

写：案卷/字段/事项/提交（Main CAS）；读：聚合/Run 账本/模板。

## 6. 分支、失败、取消与恢复

run 统一错误转译；openCase/ready 竞态防护；slotScope 重算。不适用取消/恢复。

## 7. 权限与权威状态

红线：零散落 IPC（`:5`）；冲突不重试（`:260`）；拒绝不改写（`:388`）；Run 以账本为准（`:408`）；actor 仅声明（`:351`）。

## 8. 修改影响面

改面板 → 案卷办理全链与子面板编排；atoms 变化牵动全工作台。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `V2CasePanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+全链+T05 端口 | 已证实 | 逐行读 `:1-702` |
| reviewAPI 实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 原子+CaseSubjectEditor | §2 | `:29-205` | covered |
| 主面板+编排 | §3 | `:208-702` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
