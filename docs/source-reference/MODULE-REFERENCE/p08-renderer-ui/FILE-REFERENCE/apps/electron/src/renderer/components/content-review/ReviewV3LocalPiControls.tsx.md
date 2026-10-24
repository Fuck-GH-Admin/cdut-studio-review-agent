---
path: apps/electron/src/renderer/components/content-review/ReviewV3LocalPiControls.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: daca64d9b43b08ca1901468a2b8121e6c22a5018
sha256: 4a07184ebf332aa5f3feb05e81d8daa352b87345b3d99c10d6fb1258a3353bbb
lines: 189
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3LocalPiControls.tsx

## 1. 结论与边界

**真实本地 Pi/ReviewRun 可见性**（`:1-3` 注释）：显示 Main 既有持久化 Run，**不伪造进度或审批**；页面明示「使用已存在的 Main Pi/ReviewRun 持久存储」（`:110`）；**本视图不另写 Decision**（`:184`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3LocalPiControls` | function（export） | `:16-189` | `({caseId})` |

内部：`statusName` 7 判定文案（`:8-13`）、`refresh`（`:29-56`）、`execute`（start/restart/stop/refresh `:81-102`）、generation/refreshSequence 竞态双计数（`:26-27`）。

## 3. 内部逻辑与关键流程

1. `refresh`：并取后台状态+Run 列表；**caseId 范围校验**（MAIN_PI_CASE_SCOPE_MISMATCH/PERSISTED_RUN_SCOPE_MISMATCH `:37/:40-41`）；**是否过期由 Main 判定，界面不自算哈希**（`:42-48`）；早到慢查询不覆盖后发回执（`:49-50`）。
2. 轮询：仅 running/queued/awaiting-* 状态 2.5s 自动刷新（`:69-79`）。
3. 操作（`:81-102`）：start/restart（**restart=新独立审核会话+旧 Run 留历史** `:91-92`）；stop 需 runId（`:94`）；全部范围校验。
4. 展示：F09 生命周期投影（`projectF09RunLifecycle` `:104`，title/explanation/nextStep/覆盖率进度条 `:114-128`）；**stale→「历史检查不可直接当作新版本结论」**（`:129`）；历史 Run 选择（不改 Main 当前运行 `:142`）；逐项检查（checkId/状态/executedBy/reason/来源/计算明细 `:160-171`，>30 折叠 `:172-173`）；模型意见 details（`:175-183`）。

## 4. 调用者与调用链

入向：本地 V3 工作台。出向：`./review-v3-f09-run-lifecycle`（投影 `:6`）、`window.reviewAPI` 5 接口（state/runs/getRun/validity/start/stop）。

## 5. 数据 I/O、读写与副作用

写：Run 启停（经 Main）；读：Run 账本/有效性。

## 6. 分支、失败、取消与恢复

范围/状态异常 throw→error；双计数防陈旧（`:50`）；卸载取消轮询。不适用取消/恢复。

## 7. 权限与权威状态

红线：不伪造进度/审批（`:2`）；过期判定归 Main（`:42`）；不写 Decision（`:184`）。

## 8. 修改影响面

改面板 → 本地 Pi 审核账本 UX 与运行控制。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3LocalPiControls` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+竞态/控制全链 | 已证实 | 逐行读 `:1-189` |
| reviewAPI/投影实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:16-189` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
