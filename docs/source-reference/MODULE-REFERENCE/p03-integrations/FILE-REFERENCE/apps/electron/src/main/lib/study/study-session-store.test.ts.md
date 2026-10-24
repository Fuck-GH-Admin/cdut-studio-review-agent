---
path: apps/electron/src/main/lib/study/study-session-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c45ad7e963fef1bec5695f1af353707386511091
sha256: 42b85829802adf2b62ea254a39f5f8bafbfaa13e0d8adb581920de4a002f4b48
lines: 45
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-session-store.test.ts

## 1. 测试目标

**速课堂多 Tab 拓扑归一化（BDD-TAB-01）**（`apps/electron/src/main/lib/study/study-session-store.test.ts:19`）：首页恒首位不可关、伪造 home 剔除、`activeTabId` 回退、`createHomeTab`。

## 2. 用例清单

1 describe / 4 test。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 首页恒居首位且不可关闭 | `tabs[0].id===AI_CLASS_HOME_TAB_ID`、`closable===false`、顺序 `[home,'t1','t2']` | `:20-25` |
| 2 | 伪造 home 剔除、仅唯一固定首页 | `filter(type==='home').length===1`、`tabs[0].id===home` | `:27-32` |
| 3 | `activeTabId` 指向已关标签回退首页 | `activeTabId===AI_CLASS_HOME_TAB_ID` | `:34-37` |
| 4 | `createHomeTab` 固定首页 | `id/type/closable` 断言 | `:39-44` |

## 3. 真实断言

- `expect(state.tabs.map((t) => t.id)).toEqual([AI_CLASS_HOME_TAB_ID, 't1', 't2'])`（`:24`）。
- `expect(state.activeTabId).toBe(AI_CLASS_HOME_TAB_ID)`（`:36`）。

## 4. 未覆盖与脆弱点

- 未覆盖：Tab 增删/持久化。
- 脆弱点：`AI_CLASS_HOME_TAB_ID` 常量绑定（`@profer/shared`）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖 Tab 拓扑不变量 | 已证实 | `:20-44` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 首页不变量 | 1-2 | `:20-32` | covered |
| 回退 | 3 | `:34-37` | covered |
| createHomeTab | 4 | `:39-44` | covered |
