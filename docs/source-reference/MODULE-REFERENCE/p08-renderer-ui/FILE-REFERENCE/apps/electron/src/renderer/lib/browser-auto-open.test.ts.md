---
path: apps/electron/src/renderer/lib/browser-auto-open.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a8e5d5ddebe5b7648f2e2df53b6d85307ad7e318
sha256: d65bba67075203c43323e2877074286886a9e972d91a46195915a474fad490e7
lines: 55
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/browser-auto-open.test.ts

## 1. 测试目标

验证 `browser-auto-open.ts`（同批收录）的浏览器面板自动打开门禁 `shouldAutoOpenBrowserFromPush`：仅 navigate/tab 展示型动作自动打开，只读动作、无工作标签、无操作记录一律不打开。测试框架 `bun:test`（`browser-auto-open.test.ts:1`）。

## 2. 用例清单

grep `test(` 机械计数=4、`describe(`=1、`it(`=0：`:35` navigate/tab 打开；`:40` 8 种只读/非展示动作不打开；`:46` 无 Agent 工作标签不打开；`:52` 无操作记录不打开。合计 4，与标签一致（describe「浏览器状态推送自动打开门禁」）。

## 3. 真实断言

- `:36-37`：expect(shouldAutoOpenBrowserFromPush(snapshot({activity:trace('navigate')}))).toBe(true)；trace('tab') 同为 true。
- `:41-43`：对 ['observe','wait','screenshot','dom','script','click','fill','press'] 循环 expect(...).toBe(false)。
- `:47`：agentTabId:null → expect false；`:49` agentTabId:'tab-missing'（tabs 中不存在）→ expect false。
- `:53`：activity:null → expect false。

## 4. 未覆盖与脆弱点

未覆盖：`state.activity.action` 为 undefined 的显式断言（源码 `browser-auto-open.ts:28` 短路分支，测试仅以 null 覆盖）；`agentTabId` 存在但 `tabs` 为空数组的组合；`trace` 工厂（`:11-23`）固定 success/status 字段，未来判定若引入成功/失败维度无测试锁定。脆弱点：动作枚举 ['click','fill','press'] 在测试注释中称「只读动作」（`:40`），实际含写操作——文档语义与门禁实现（BROWSER_DISPLAY_ACTIONS 白名单）以实现为准。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例清单与断言文本 | 已证实 | `browser-auto-open.test.ts:35-54` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| MainArea 消费链路 | 间接 | `MainArea.tsx:115`（未运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| shouldAutoOpenBrowserFromPush（true 分支） | §2/§3 | 35-38 | covered |
| 只读动作 false 分支 | §2/§3 | 40-44 | covered |
| 无/失效 agentTabId 分支 | §2/§3 | 46-50 | covered |
| activity 缺失分支 | §2/§3 | 52-54 | covered |
| action===undefined 分支 | §4 | — | partial |
