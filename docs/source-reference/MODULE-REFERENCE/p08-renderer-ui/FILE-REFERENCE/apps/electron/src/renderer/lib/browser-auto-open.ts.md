---
path: apps/electron/src/renderer/lib/browser-auto-open.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3df0c6ffc8578a7ba892ff23059b15bdbee00467
sha256: 724f76dcfc1d95b83c0dde46ec5819be0343aff76d991bcdf74fd6ff933b8c70
lines: 29
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/browser-auto-open.ts

## 1. 结论与边界

**浏览器面板自动打开门禁**（29 行）：判定 BROWSER_STATE_CHANGED 推送是否应自动打开浏览器面板，是「两道防线的第二道」（`browser-auto-open.ts:14-16`）。边界：切回会话经 getAgentBrowserState 恢复的路径不走这里（`browser-auto-open.ts:18-19`）。

## 2. 导出与关键符号

导出 1 个函数、0 常量、0 类型：`shouldAutoOpenBrowserFromPush`（`browser-auto-open.ts:21`）。内部符号 1 个：`BROWSER_DISPLAY_ACTIONS: ReadonlySet<string>`（`browser-auto-open.ts:9`，内部，`{'navigate','tab'}`）。

## 3. 内部逻辑与关键流程

单函数（`browser-auto-open.ts:21-29`）：`:24` 无 `agentTabId` → false；`:26` `tabs` 中不存在 `tabId === agentTabId` 的真实页 → false（防会话销毁后晚到状态开空白面板）；`:27-28` 取 `activity?.action`，要求 `action !== undefined && BROWSER_DISPLAY_ACTIONS.has(action)` 才返回 true。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/components/tabs/MainArea.tsx:19` import、`:115` 调用（结果传入 publishBrowserState 的 autoOpen）；测试 `apps/electron/src/renderer/lib/browser-auto-open.test.ts:3` import。
- 出向：类型 `BrowserViewState` from `@profer/shared`（`browser-auto-open.ts:1`，仅类型），无运行时调用。
- 动态调用：未知；检索方式——冻结树 grep `browser-auto-open|shouldAutoOpenBrowserFromPush`（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

纯函数 + 模块级只读常量：无状态写入，无 DOM/toast/窗口副作用。

## 6. 分支、失败、取消与恢复

无 `agentTabId` → false（`:24`）；工作标签不存在 → false（`:26`）；`activity` 为 null 或 action 不在 `{'navigate','tab'}` → false（`:27-28`）；navigate/tab → true。无 throw、无异步。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。门禁语义是 UI 展示权，不是访问权限。

## 8. 修改影响面

`MainArea.tsx` 浏览器推送自动打开行为（`:104` openBrowserTabFromPush 的 autoGroup 来源）；放宽动作集合会让只读查询把浏览器面板顶出来（`browser-auto-open.ts:6-8` 注释）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接证据：`apps/electron/src/renderer/lib/browser-auto-open.test.ts` 4 个 test（grep `test(` 计数=4），如 `:36-37` expect true（navigate/tab）、`:42` expect false（8 个只读/非展示动作）、`:47-49`、`:53` expect false。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三重守卫判定顺序 | 已证实 | `browser-auto-open.ts:24-28` |
| 主进程不再为只读查询广播 | 推断 | 注释 `browser-auto-open.ts:14-15`，主进程域外 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| shouldAutoOpenBrowserFromPush | §2/§3/§6 | 21-29 | covered |
| BROWSER_DISPLAY_ACTIONS | §2 | 9 | covered |
