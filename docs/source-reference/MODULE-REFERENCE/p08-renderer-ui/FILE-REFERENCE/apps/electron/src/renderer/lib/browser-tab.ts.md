---
path: apps/electron/src/renderer/lib/browser-tab.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8a3b33c05b16324768c4c667bd5028b1d947833b
sha256: bba52b6f2b61b97fbbb855b6b689e4a2da1d25740c322370e89d01423df0b9e5
lines: 155
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/browser-tab.ts

## 1. 结论与边界

**受管浏览器顶栏 Tab 化入口**（155 行）：浏览器内部页与顶栏 Tab 一一对应，id 规则 `__browser__:${sessionId}:${tabId}`（`browser-tab.ts:4`）；reconcile 以主进程 BrowserViewState 为准增删/改标题（`:5-6`）；手动打开清 dismissed+激活（`:7`）；Agent 推送自动与对话组合并排、焦点留对话（`:8-9`）；关闭 Tab=关网页，末页关闭记 dismissed（`:10-11`）。

## 2. 导出与关键符号

导出 5 个函数、0 常量、0 独立类型导出：`planBrowserTabReconcile`（`browser-tab.ts:41`）、`activeBrowserTopTabId`（`:80`）、`reconcileBrowserTabs`（`:88`）、`openBrowserTabFromPush`（`:107`）、`openBrowserTabManually`（`:136`）。内部符号 1 个：`type JotaiStore = ReturnType<typeof useStore>`（`:32`，内部，避免直接 import Jotai 内部 Store 类型）。

## 3. 内部逻辑与关键流程

- `planBrowserTabReconcile`（`browser-tab.ts:41-77`，纯函数）：`:47` 建期望 Map（createBrowserTabId）；`:48-51` 先过滤——本会话浏览器 Tab 中无 browserTabId 或已不在期望集合的被移除；`:55-65` 已存在页同步标题（默认'新建标签页'，`:57`）；`:66` dismissed 时跳过新建；`:67-74` 新页 openTab 追加；`:76` 无变化返回原数组引用。
- `activeBrowserTopTabId`（`:80-82`）：activeTabId 存在则映射顶栏 id，否则 null。
- `reconcileBrowserTabs`（`:88-96`）：`:89-90` 撤销或非普通会话 → null；`:91` 读 dismissed；`:93-94` 有变化才写 tabsAtom；`:95` 返回激活页顶栏 id。
- `openBrowserTabFromPush`（`:107-133`）：`:112` 仅处理 agent 模式当前会话（否则返回）；`:113` reconcile；`:114-123` 无 topTabId 时经 `ensureOrdinaryWorkTabOwner`（load=window.electronAPI.getAgentSessionMeta，isCurrent 双条件）授权后递归重试一次；`:125` autoGroup===false 跳过布局；`:126-132` `planAutoGroupWorkTab` 计算对话左/浏览器右组合，有变化写 tabGroupsAtom。
- `openBrowserTabManually`（`:136-155`）：`:138` state.sessionId 不匹配或已撤销 → return；`:139-143` 未知会话走 Main 授权水合后递归重试；`:144-149` 从 dismissed 集合移除（Set 写回）；`:150` reconcile；`:151-154` 指定 browserTabId 或激活页，`activateTabWithSideEffects` 激活。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/components/tabs/MainArea.tsx:17` import `openBrowserTabFromPush`（`:104`）；`TabBar.tsx:48` import `openBrowserTabManually`（`:675`）；测试 `browser-tab.test.ts:4`（planBrowserTabReconcile/activeBrowserTopTabId）、`agent-tab-access.test.ts:8`（reconcileBrowserTabs，`:74-100`）。
- 出向：`jotai`（`:14`）、`@/atoms/tab-atoms`（activeTabIdAtom/createBrowserTabId/isBrowserTab/openTab/tabsAtom/TabItem，`:15-22`）、`@/atoms/browser-atoms`（browserPanelDismissedSessionIdsAtom，`:23`）、`@/atoms/tab-group-atoms`（planAutoGroupWorkTab/tabGroupsAtom，`:24`）、`@/atoms/app-mode`/`@/atoms/agent-atoms`（`:25-26`）、`@/lib/agent-tab-access`（`:27`）、`@profer/shared`（BrowserViewState，`:28`）、`@/lib/tab-activation`（activateTabWithSideEffects，`:29`）。IPC 出向：`window.electronAPI.getAgentSessionMeta`（`:118`、`:140`）。
- 动态调用：未知；检索方式——冻结树 grep `lib/browser-tab|planBrowserTabReconcile|activeBrowserTopTabId|reconcileBrowserTabs|openBrowserTabFromPush|openBrowserTabManually`（*.ts/*.tsx），无 import()/require()；preload 桥无该模块引用（window.electronAPI 为既有桥）。

## 5. 数据 I/O、读写与副作用

有状态模块（经 Jotai store 读写）：读 revokedAgentSessionIdsAtom/agentSessionsAtom/browserPanelDismissedSessionIdsAtom/tabsAtom/appModeAtom/currentAgentSessionIdAtom/tabGroupsAtom/activeTabIdAtom；写 tabsAtom（`:94`）、tabGroupsAtom（`:132`）、browserPanelDismissedSessionIdsAtom（`:144-149`）；`planBrowserTabReconcile`/`activeBrowserTopTabId` 为纯函数。副作用：激活 Tab（`:154`）、异步 IPC 元数据水合（`:117`、`:140`）；无 DOM/toast/窗口直接操作。

## 6. 分支、失败、取消与恢复

撤销/非普通会话 → null/return（`:89-90`、`:138`）；dismissed 只拦新建、不拦移除与标题同步（`:66`、`browser-tab.ts:37-38` 注释）；无变化返回原引用（`:76`）；非当前会话推送直接忽略（`:112`，后台会话等切回时 getState 路径对账）；未知会话 → Main 授权水合一次，授权失败保持拒绝（`:115-116` 注释：stale/hidden ID stays denied）；autoGroup===false 不动布局（`:125`）；state.sessionId 与参数不一致 → return（`:138`）。失败收敛为 null/return，无 throw。

## 7. 权限与权威状态

无 sender/role 权限分支，依据：本文件无 sender/role 检查。但有访问裁决前置：`revokedAgentSessionIdsAtom` + `canOpenOrdinaryWorkTab`（`:89-90`、`:138-139`），未知会话须 Main GET_SESSION_META 授权（经 ensureOrdinaryWorkTabOwner，权威在 Main，`agent-tab-access.ts:44`）。

## 8. 修改影响面

MainArea 浏览器推送布局（`:104`）、TabBar 浏览器按钮（`:675`）、useCloseTab→closeAgentBrowserTab 链路（`browser-tab.ts:10` 注释）、tab-groups 并排布局、agent-tab-access.test.ts 依赖 reconcileBrowserTabs 行为。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接证据：`browser-tab.test.ts` 6 个 test（grep `test(` 计数=6）：`:46-48` 首推生成 Tab、`:63` 关页移除、`:78-79` tabs 空清全部、`:96-97` dismissed 只同步不新增、`:112` 无变化同引用（expect(again).toBe(next)）、`:120` activeBrowserTopTabId='__browser__:s1:t2'。间接：`agent-tab-access.test.ts:74-100`（reconcileBrowserTabs 准入）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| reconcile 纯函数增删/标题/同引用语义 | 已证实 | `browser-tab.ts:41-77` |
| 两个打开路径的授权与递归重试 | 已证实 | `browser-tab.ts:107-155` |
| closeAgentBrowserTab 关页链路 | 推断 | 注释 `:10`，useCloseTab 实现域外 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| planBrowserTabReconcile | §3/§6 | 41-77 | covered |
| activeBrowserTopTabId | §3 | 80-82 | covered |
| reconcileBrowserTabs | §3/§7 | 88-96 | covered |
| openBrowserTabFromPush | §3/§6 | 107-133 | covered |
| openBrowserTabManually | §3/§6 | 136-155 | covered |
