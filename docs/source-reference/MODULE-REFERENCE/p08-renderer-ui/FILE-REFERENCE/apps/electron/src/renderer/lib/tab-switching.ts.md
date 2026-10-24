---
path: apps/electron/src/renderer/lib/tab-switching.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a93965896151d233ad2d98458bae73b8ceed8d60
sha256: c30212de2034addb32b9176ae452bb02642032b8b2448b1ede4e8a4b1c29c2e4
lines: 60
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/tab-switching.ts

## 1. 结论与边界

Ctrl+Tab 标签切换的 MRU 纯算法（60 行）：`promoteTabMru` 维护最近访问队列，`getInitialTabSwitchIndex` 按 MRU 序算首次命中的候选下标（tab-switching.ts:15、:28）。不读写任何 atom，状态由调用方（TabSwitcher）持有。

## 2. 导出与关键符号

函数 2 个：`promoteTabMru(mru: string[], tabId: string | null, limit = DEFAULT_TAB_MRU_LIMIT): string[]`（tab-switching.ts:16-26）、`getInitialTabSwitchIndex<T extends TabSwitchCandidate>(candidates, activeTabId, mru, direction: 1 | -1): number`（:29-60）。内部符号：`DEFAULT_TAB_MRU_LIMIT = 50`（内部常量，:4）、`TabSwitchCandidate`（内部接口，:6-8）、`arraysEqual`（内部，:10-13）。

## 3. 内部逻辑与关键流程

- `promoteTabMru`（:21-25）：`!isMruEligibleId(tabId)` 短路返回原数组（:21）；`next = promoteMru(mru, tabId, limit)`（:23，@profer/shared）；`arraysEqual(mru, next)` 相等时返回原引用（:25，保持引用稳定）。
- `getInitialTabSwitchIndex`（:35-59）：`candidates` 空 → `-1`（:35）；构造 `orderedIds`：先按 mru 顺序过滤出候选内 id 并去重（:41-45），再补上候选列表中未出现的 id（:47-51）；`activeIndex = orderedIds.indexOf(activeTabId)`，未激活为 -1（:53）；目标下标：无激活时 `direction===1 ? 0 : length-1`，否则 `(activeIndex + direction + length) % length` 环形回绕（:54-56）；`candidates.findIndex(id 匹配)` 返回展示列表下标（:59）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`apps/electron/src/renderer/components/tabs/TabSwitcher.tsx:19` import、`:173` 调 `promoteTabMru`、`:214` 调 `getInitialTabSwitchIndex`。无其它引用（检索范围：baseline 全树 grep `promoteTabMru|getInitialTabSwitchIndex`）。
- 出向：`@profer/shared` 的 `promoteMru`（packages/shared/src/utils/tab-mru.ts:6）；`@/atoms/tab-atoms` 的 `isMruEligibleId`（tab-atoms.ts:228）。无动态调用。

## 5. 数据 I/O、读写与副作用

纯函数，无模块状态、无副作用；输入数组不被修改，输出为新数组或原引用（:25）。

## 6. 分支、失败、取消与恢复

tabId 为 null 或不在 MRU 资格内 → 原样返回（:21）；candidates 空 → `-1`（:35）；activeTabId 不在 orderedIds → -1 分支取方向首/尾（:54-55）；环形回绕防越界（:56）；重复 id 在 orderedIds 中去重（:42、:48）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

改动影响 `TabSwitcher.tsx:173/214` 的 Ctrl+Tab 行为；`promoteMru`（shared）或 `isMruEligibleId`（tab-atoms.ts:228）语义变更需联动评估；本批次无对应测试文件，修改缺少直接回归网。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。scope 18 文件内无 tab-switching 测试文件（机械计数不适用）；间接证据：`TabSwitcher.tsx:173/214` 为生产调用点（间接）。不得声称运行成功。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两函数的短路/回绕/去重逻辑 | 已证实 | tab-switching.ts:16-60 全文 |
| promoteMru 上游语义 | 已证实 | packages/shared/src/utils/tab-mru.ts:6（定义点） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| promoteTabMru | §3/§6 | tab-switching.ts:16-26 | covered |
| getInitialTabSwitchIndex | §3/§6 | tab-switching.ts:29-60 | covered |
| arraysEqual / 常量 / 内部接口 | §2 | tab-switching.ts:4-13 | covered |
