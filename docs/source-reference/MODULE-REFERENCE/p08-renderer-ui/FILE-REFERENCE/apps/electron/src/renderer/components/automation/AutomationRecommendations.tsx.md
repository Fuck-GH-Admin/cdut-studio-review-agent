---
path: apps/electron/src/renderer/components/automation/AutomationRecommendations.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3169fc884d4c3b34d77ea89f1048b6d759999756
sha256: 088bb8b76b1795e0e9a8a2e59263058ecd07af587f313a8aa4f85b3da556de99
lines: 36
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/automation/AutomationRecommendations.tsx

## 1. 结论与边界

自动化建议卡片列表（渲染层运行时）：展示 `Recommendation`（标题/理由/置信度/证据），提供「检查任务」（跳编辑表单并记 accepted）与「不再建议」（dismissed）（`apps/electron/src/renderer/components/automation/AutomationRecommendations.tsx:1-35`）。空列表返回 null（`:11`）。

边界：建议生成在主进程 `recommendation-engine`；反馈存储经 IPC；不管理任务本体。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AutomationRecommendations` | 函数/组件（导出） | 9-36 | `({recommendations: Recommendation[], onRefresh: () => Promise<void>}) => React.ReactElement \| null` | 建议列表 |

内部闭包：`respond`（`:12-18`）、`open`（`:19-25`）。

## 3. 内部逻辑与关键流程

1. `respond(recommendation, status)`（`:12-18`）：`window.electronAPI.respondToRecommendation({id, status})`；dismissed 时 toast「已忽略这条建议」（`:15`）；`onRefresh()` 刷新（`:16`）；失败 toast error.message（`:17`）。
2. `open`（`:19-25`）：`action.type==='edit_automation'` 且有 automationId → `listAutomations()` 找到后 `setForm({open:true, draft:automationToDraft(item)})`（`:20-23`）；随后 `respond(..., 'accepted')`（`:24`）。
3. 渲染：标题+reason+置信度百分比（`Math.round(confidence*100)%`，`:30`）、逐条 evidence（`:31`）、两个按钮（`:32`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`automation/AutomationsListView.tsx:19`（import）、`:135`（`<AutomationRecommendations recommendations={…} onRefresh={refreshList}/>`）。唯一调用方。

出向：`@profer/shared` `Recommendation`（`:5`）、`@/atoms/automation-atoms`（`automationFormAtom`/`automationToDraft`，`:7`）、`window.electronAPI.respondToRecommendation`/`listAutomations`（`:14,21`）。

## 5. 数据 I/O、读写与副作用

IPC 写（respond accepted/dismissed）+ 读（listAutomations）；toast；表单 atom 写。无盘直接操作。幂等：由主进程 feedback 语义（dismissed 不再生成）保证。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 空列表 null | recommendations.length===0 | 11 |
| respond 失败 | IPC reject | 17 |
| action 非 edit/找不到任务 | open 前段 | 20-23 |
| accepted 无条件提交 | open 末 | 24 |

注意：`open` 即便找不到任务也会 `respond(..., 'accepted')`（`:24`）——照实记录。无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；建议反馈权威=主进程 recommendations 存储。

## 8. 修改影响面

- 唯一调用方 AutomationsListView:135；props 变更影响列表页。
- `respondToRecommendation` IPC 契约（preload/主进程，非本批）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索本组件 0 命中（`recommendation-engine.test.ts` 命中系 `refreshAutomationRecommendations` 子串，非本组件测试）。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实 IPC。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + respond/open 流程 | 已证实 | `:9-36` 逐行读 |
| open 无条件 accepted | 已证实 | `:24` |
| 唯一调用方 | 已证实 | `AutomationsListView.tsx:19,135` |
| 主进程 feedback 语义 | 已证实（跨文件） | `recommendation-manager.ts:41-49`（交叉读） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AutomationRecommendations` | §2-3 | 9-36 | covered |
| respond/open 分支 | §3, §6 | 12-25 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
