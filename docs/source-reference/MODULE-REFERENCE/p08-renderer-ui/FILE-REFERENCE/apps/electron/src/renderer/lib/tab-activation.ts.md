---
path: apps/electron/src/renderer/lib/tab-activation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2645e8f77cd2d08a7343b5e5f21a7d4f3bd91c8b
sha256: 8c9c2b468a92d2727b981d9ae4cd3e0bc289a42551d05764b6eba28670c45f56
lines: 86
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/tab-activation.ts

## 1. 结论与边界

顶栏标签「激活」的唯一权威入口（tab-activation.ts:2-7）：所有标签切换出口统一走 `activateTabWithSideEffects`，集中维护 appMode/当前会话/前台浏览器所有权/MRU/定时任务表单收起等副作用。本文件只做编排，不含标签数据结构定义。

## 2. 导出与关键符号

函数 2 个：`activateTabWithSideEffects(store: JotaiStore, tabId: string): boolean`（tab-activation.ts:34-71）、`openTutorialTab(store: JotaiStore): void`（:77-86）。内部符号：`JotaiStore` 类型（内部，:27，`ReturnType<typeof useStore>`）。类型 0、常量 0。

## 3. 内部逻辑与关键流程

按执行顺序（`activateTabWithSideEffects`）：

1. 查找 tab：`store.get(tabsAtom).find(t => t.id === tabId)`，不存在返回 `false`（tab-activation.ts:35-36）。
2. agent 类型可见性门禁：按 `tab.sessionId` 查会话，`!isAgentWorkspaceIdVisible(...)` 返回 `false`（:38-41）。
3. 前台浏览器所有权：`bridge.setAgentBrowserForeground`（typeof 守卫 :45）传 `agent|browser ? tab.sessionId : null`（:46）。
4. browser Tab 切主进程当前页：`browserState.activeTabId !== tab.browserTabId` 且桥可用时 `void bridge.selectAgentBrowserTab({...}).catch(() => undefined)`（:49-53，fire-and-forget）。
5. `store.set(activeTabIdAtom, tabId)`（:56）。
6. 分屏组焦点同步：`findTabGroup` 命中则 `focusGroupMember`，结果变化时 `replaceTabGroup` 写回（:58-65）。
7. MRU 提升：`store.set(tabMruAtom, prev => promoteSessionMru(prev, tab.sessionId))`（:66）。
8. 收起定时任务表单：`automationFormAtom` 置 `{ open: false, draft: null }`（:68）。
9. `syncActiveTabSideEffectsForStore(store, tab)`（:69）；返回 `true`（:70）。

`openTutorialTab`（:78-85）：`openTab(..., { type: 'tutorial', sessionId: TUTORIAL_TAB_ID, title: TUTORIAL_TAB_TITLE })` → 写 `tabsAtom`（:83）→ `activeViewAtom` 置 `'conversations'`（:84）→ 继而调用 `activateTabWithSideEffects(store, result.activeTabId)`（:85，统一收口，非递归）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`activateTabWithSideEffects` —— exploration-tab.ts:15,57、browser-tab.ts:29,154、components/welcome/WelcomeView.tsx:19,79、components/tabs/TabSwitcher.tsx:20,200、components/tabs/TabBar.tsx:47,208,978、components/tabs/MainArea.tsx:12,218,294、components/shortcuts/GlobalShortcuts.tsx:25,196；`openTutorialTab` —— App.tsx:10,63、components/tutorial/TutorialBanner.tsx:15,40、components/settings/SettingsPanel.tsx:33,172。无其它调用点（检索范围：baseline 全树 grep `activateTabWithSideEffects|openTutorialTab`；`active-tab-side-effects.ts:5` 为注释提及非调用点）。
- 出向（已逐个核对定义点）：`@/atoms/tab-atoms`（tabsAtom:76、activeTabIdAtom:79、tabMruAtom:82、TUTORIAL_TAB_ID:38、TUTORIAL_TAB_TITLE:39、promoteSessionMru:236、openTab:345）、`@/atoms/automation-atoms`（automationFormAtom:57）、`@/atoms/active-view`（activeViewAtom:17）、`@/atoms/browser-atoms`（browserStateMapAtom:5）、`@/atoms/agent-atoms`（agentSessionsAtom:218、agentWorkspacesAtom:219）、`@/lib/product-feature-flags`（isAgentWorkspaceIdVisible:32）、`@/lib/active-tab-side-effects`（syncActiveTabSideEffectsForStore:23）、`@/atoms/tab-group-atoms`（findTabGroup:172、focusGroupMember:283、replaceTabGroup:184、tabGroupsAtom:524）。动态调用：`window.electronAPI.setAgentBrowserForeground`/`selectAgentBrowserTab` 经 `Partial<typeof window.electronAPI>` 桥（tab-activation.ts:43-52），运行时是否存在未知，检索方式：grep preload/index.ts 的 electronAPI 声明。

## 5. 数据 I/O、读写与副作用

有状态编排（模块级无状态，全部状态在 Jotai store）：写 activeTabIdAtom/tabGroupsAtom/tabMruAtom/automationFormAtom/tabsAtom/activeViewAtom（:56、:63、:66、:68、:83-84）；副作用含 IPC 桥调用（:46、:52，后者异步且吞错）。

## 6. 分支、失败、取消与恢复

tab 不存在 → `false`（:36）；agent Tab 工作区不可见 → `false`（:40）；浏览器 Tab 已是当前页则跳过 select（:51）；`selectAgentBrowserTab` 失败被 `.catch(() => undefined)` 吞掉（:52）；分屏组 focus 不变则不写（:62）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（:40 的 `isAgentWorkspaceIdVisible` 为工作区可见性门禁，非权限校验）。

## 8. 修改影响面

签名/返回值变更需同步 §4 全部 10 个调用文件（exploration-tab.ts、browser-tab.ts、WelcomeView.tsx、TabSwitcher.tsx、TabBar.tsx、MainArea.tsx、GlobalShortcuts.tsx、App.tsx、TutorialBanner.tsx、SettingsPanel.tsx）；副作用顺序变更影响 MRU/表单收起/浏览器前台行为；本批次无直接测试文件。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。scope 18 文件内无 tab-activation 测试文件（机械计数不适用）；间接证据：shortcut-dispatch.test.ts 等本批次测试均不覆盖本文件（间接否定）。不得声称运行成功。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 激活流程 9 步与两处返回 false | 已证实 | tab-activation.ts:34-71 全文 |
| 出向符号全部存在 | 已证实 | §4 各定义点行号 |
| electronAPI 桥方法运行时可用性 | 未知 | 仅 typeof 守卫（:45、:51），未运行验证 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| activateTabWithSideEffects | §3 | tab-activation.ts:34-71 | covered |
| agent 可见性门禁 | §3/§6 | tab-activation.ts:38-41 | covered |
| 浏览器前台/选页副作用 | §3/§5 | tab-activation.ts:43-54 | partial |
| 分屏组/MRU/表单收起 | §3/§5 | tab-activation.ts:58-68 | covered |
| openTutorialTab | §3 | tab-activation.ts:77-86 | covered |
