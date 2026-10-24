---
path: apps/electron/src/renderer/lib/browser-tab.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 071c7d5f1276a085fcbb602a9e1ccde925eb2408
sha256: 105c9e29cff241150ac6539017dc6515acd1aac7147a43c6e7a756dc35eb5165
lines: 121
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/browser-tab.test.ts

## 1. 测试目标

验证 `browser-tab.ts`（同批收录）的纯函数 `planBrowserTabReconcile` 与 `activeBrowserTopTabId`：按主进程 BrowserViewState 增删顶栏浏览器 Tab、同步标题、dismissed 只拦新建、无变化返回原数组引用、激活页映射。有状态函数 reconcileBrowserTabs/openBrowserTabFromPush/openBrowserTabManually 不在本文件（reconcileBrowserTabs 由 `agent-tab-access.test.ts:74-100` 联测，间接）。

## 2. 用例清单

grep `test(` 机械计数=6、`describe(`=0、`it(`=0（顶层平铺）：`:38` 首次推送生成页 Tab 挂会话 Tab 后；`:51` 关页移除对应 Tab 保留其它；`:66` 会话销毁（tabs 空）移除全部浏览器 Tab；`:82` dismissed 不新增但同步标题+移除已关闭页；`:100` 无变化返回引用相同数组；`:115` activeBrowserTopTabId 指向激活页。计数与标签一致。

## 3. 真实断言

- `:45-48`：browserTabs 的 browserTabId toEqual(['t1','t2'])、sessionId 's1'、title '页面一'。
- `:63`：关闭 t2 后 expect map(browserTabId) toEqual(['t1'])。
- `:78-79`：expect(...some(browser 且 sessionId==='s1')).toBe(false)、expect(...some(id==='s1')).toBe(true)（会话 Tab 保留）。
- `:95-97`：dismissed 下 browserTabs toEqual(['t1'])（t2 不建）且 title '新标题'。
- `:112`：expect(again).toBe(next)（引用相等）。
- `:116-120`：expect(activeBrowserTopTabId('s1', ...)).toBe('__browser__:s1:t2')。

## 4. 未覆盖与脆弱点

未覆盖：`planBrowserTabReconcile` 中 `browserTabId` 为空的既有 Tab 被移除分支（`browser-tab.ts:50`）；标题缺省'新建标签页'（`:57`）未断言（`:48` 用例两页均有标题）；`openTab` 入组/激活副作用未测（reconcile 只测返回值）；`reconcileBrowserTabs`/`openBrowserTabFromPush`/`openBrowserTabManually` 三有状态函数（`:88-155`）无直接测试。脆弱点：`state` 工厂（`:8-26`）以 `as BrowserViewState` 强转补全字段，SUT 增用新字段时测试数据可能静默失真。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例清单与断言文本 | 已证实 | `browser-tab.test.ts:38-121` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| reconcileBrowserTabs 准入行为 | 间接 | `agent-tab-access.test.ts:74-100`（未运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| planBrowserTabReconcile（增/删/标题/引用） | §2/§3 | 38-113 | covered |
| activeBrowserTopTabId | §2/§3 | 115-121 | covered |
| reconcileBrowserTabs | §4 | — | unknown（本文件未测） |
| openBrowserTabFromPush / openBrowserTabManually | §4 | — | unknown（本文件未测） |
