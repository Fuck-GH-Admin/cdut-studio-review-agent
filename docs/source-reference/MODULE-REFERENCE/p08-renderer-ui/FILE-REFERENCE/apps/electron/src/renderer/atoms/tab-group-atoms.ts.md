---
path: apps/electron/src/renderer/atoms/tab-group-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab3a16737248af5acb3a60ec6445c1736d7bcfe8
sha256: 5d7f76574ed7291483d6dba024992bcd05e246f4b6dfdda6e0056ae25c60cac5
lines: 533
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/tab-group-atoms.ts

## 1. 结论与边界

**Tab 组合 atoms（组合 tab）**（`apps/electron/src/renderer/atoms/tab-group-atoms.ts:1-16`）：两个标签各占左右一栏，**允许一栏先空**。模型（保持扁平防 #288 嵌套耦合，`:4`）：`tabsAtom` 扁平（组合成员是普通标签，**渲染时折叠成一个条目**）；每组合是叠加态（leftTabId/rightTabId/focusedTabId）；**允许一侧为空**（拖进分区不自动补对照会话，`:8-9`）；焦点=activeTabId 属哪一侧（不另设 focusedPane，`:10-12`）；「组合激活」=activeTabId∈非空成员（点第三标签不劫持，`:13`）。**宽度归属唯一事实源：只由分栏缝拖动决定（`tabGroupRatioAtom` localStorage）；拖放标签只决定成员与左右顺序，任何时候都不改宽度**（`:15-16`）。

## 2. 导出与关键符号

`export` 共 **44 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TabGroupSide` | type | `:37` | — |
| `TabGroupState` | interface | `:40` | — |
| `TabGroupDragState` | interface | `:50` | — |
| `PersistedTabGroup` | interface | `:56` | — |
| `TabGroupsState` | type | `:63` | — |
| `GROUP_ELIGIBLE_TAB_TYPES` | const | `:73` | — |
| `GROUP_SPLIT_GAP` | const | `:76` | — |
| `GROUP_MIN_PANE_WIDTH` | const | `:79` | — |
| `GROUP_MIN_RATIO` | const | `:82` | — |
| `GROUP_MAX_RATIO` | const | `:83` | — |
| `isGroupEligibleTab` | function | `:88` | — |
| `groupTabIds` | function | `:93` | — |
| `groupContextSessionId` | function | `:104` | — |
| `isSessionConsistentGroup` | function | `:122` | — |
| `isGroupComplete` | function | `:139` | — |
| `emptyGroupSide` | function | `:144` | — |
| `createGroup` | function | `:154` | — |
| `isGroupMember` | function | `:166` | — |
| `findTabGroup` | function | `:172` | — |
| `replaceTabGroup` | function | `:184` | — |
| `removeTabGroup` | function | `:199` | — |
| `reorderRenderedTabItem` | function | `:211` | — |
| `isGroupActive` | function | `:253` | — |
| `groupSideOf` | function | `:258` | — |
| `resolveGroupPaneFocusTarget` | function | `:271` | — |
| `focusGroupMember` | function | `:283` | — |
| `fillGroupSide` | function | `:295` | — |
| `planAutoGroupWorkTab` | function | `:312` | — |
| `resolveGroupMembership` | function | `:334` | — |
| `GroupDropPlan` | interface | `:353` | — |
| `planGroupDrop` | function | `:366` | — |
| `reconcileGroup` | function | `:402` | — |
| `reconcileTabGroups` | function | `:416` | — |
| `toPersistedTabGroup` | function | `:434` | — |
| `fromPersistedTabGroup` | function | `:448` | — |
| `toPersistedTabGroups` | function | `:457` | — |
| `fromPersistedTabGroups` | function | `:469` | — |
| `clampGroupRatio` | function | `:477` | — |
| `GroupSplitGeometry` | interface | `:482` | — |
| `resolveGroupSplitGeometry` | function | `:495` | — |
| `tabGroupsAtom` | const | `:524` | — |
| `tabGroupRatioAtom` | const | `:527` | — |
| `tabGroupDragAtom` | const | `:530` | — |
| `hasTabGroupAtom` | const | `:533` | — |

## 3. 内部逻辑与关键流程

- 扁平模型（`:4-13`）：渲染折叠、叠加态、允许空栏、焦点经 activeTabId。
- **宽度只归分栏缝**（`:15-16`）——拖放不改宽度（回归锁，test `:439-443`）。
- 纯函数层（构造/成员/合并/对账/几何 clamp）。

## 4. 调用者与调用链

- 消费方：组合 Tab 栏/分栏。
- 出向：`tab-atoms`（tabsAtom 扁平）、localStorage（ratio）。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

- **宽度归属唯一事实源**（`:15-16`）——被否决过两次实现（test `:439-443` 回归锁）。
- 扁平防嵌套耦合（`:4`）。

## 8. 修改影响面

- 组合叠加态形状；`tabGroupRatioAtom` 持久化。
- 拖放/宽度分离规则（回归锁锁定）。

## 9. 测试证据

`tab-group-atoms.test.ts`（539 行）直接覆盖（组合白名单/构造/合并落点/对账/持久化/几何 clamp/拖放-宽度归属）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

组合模型/宽度归属契约已证实（`:1-16`）；测试实际通过未知（NOT_RUN）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 组合状态集 | 全文 | covered |
| 模型/宽度契约 | `:1-16` | covered |
