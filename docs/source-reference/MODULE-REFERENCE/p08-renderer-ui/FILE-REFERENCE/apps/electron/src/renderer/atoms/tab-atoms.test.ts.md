---
path: apps/electron/src/renderer/atoms/tab-atoms.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c175e17d7fa4a35cb9f9c835671c863d69b67d0
sha256: fddfdbf514362cf9d4773135499a330562aaa2ca1305ca3e6d4e24793ba8683b
lines: 218
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/tab-atoms.test.ts

## 1. 测试目标

Tab Atoms 状态语义（`apps/electron/src/renderer/atoms/tab-atoms.test.ts`）：Tab 增删/切换/桥接同步。

## 2. 用例清单

**21 test** 逐条：

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 关闭当前普通标签时回退到最近访问标签而非右侧标签 | `:6` |
| 2 | 关闭非当前标签不改变活动标签 | `:12` |
| 3 | 同一会话可同时打开多个浏览器页 Tab，重复打开同一页只聚焦 | `:18` |
| 4 | 浏览器 Tab 每会话单例，重复打开只聚焦 | `:32` |
| 5 | 关闭会话 Tab 时连带关闭其全部工作 Tab（浏览器×N） | `:40` |
| 6 | 工作 Tab 不参与持久化，激活工作 Tab 时持久化回退到 owner 会话 | `:52` |
| 7 | 打开会话不再丢弃其工作 Tab | `:60` |
| 8 | 打开子会话 Tab 携带 parentSessionId，且参与持久化 | `:70` |
| 9 | 已存在的 Tab 补上血缘时不丢原数据 | `:79` |
| 10 | tabContextSessionId 沿血缘走到根会话 | `:85` |
| 11 | tabContextSessionId 在父 Tab 缺失或血缘成环时回退自身 | `:96` |
| 12 | 关闭回退：同类会话还在时优先 MRU 回退到同类，不跨模式 | `:105` |
| 13 | 关闭回退：关闭最后一个 agent 时回 Scratch Pad，不跳 chat | `:115` |
| 14 | 关闭回退：关闭最后一个 chat 时回 Scratch Pad，不跳 agent | `:123` |
| 15 | 关闭回退：引擎结果已是同类/关闭工作 Tab/非激活关闭时不覆盖 | `:131` |
| 16 | orderTabsBySessionContext 把子会话紧跟父会话排列 | `:147` |
| 17 | isMruEligibleId 排除后台常驻与工作 Tab | `:156` |
| 18 | promoteSessionMru 只记录真实会话 ID | `:164` |
| 19 | 新打开带 parentSessionId 的子会话 Tab 时直接插入到父会话簇之后，同时保留手动排序顺序 | `:169` |
| 20 | 关闭当前激活的浏览器工作 Tab 时优先回退到所属宿主会话 Tab | `:199` |
| 21 | 关闭非当前会话标签时保持教程 Tab 激活，教程不被连带关闭 | `:212` |

## 3. 真实断言

（断言组——Tab 状态语义。）

## 4. 未覆盖与脆弱点

- 未覆盖：持久化边界。
- 脆弱点：桥接 atom 同步顺序。

## 5. 已证实/推断/未知

Tab 状态用例覆盖已证实（218 行）；测试实际通过未知（NOT_RUN）。

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| Tab 状态 | 1-21 | 全文 | covered |
