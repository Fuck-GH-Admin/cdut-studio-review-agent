---
path: apps/electron/src/renderer/components/agent/SDKMessageRenderer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34e4a04bdbf2f48aadb00ef5dcf5de7ce407cfae
sha256: 1632b9eabeb2697a3e60208ed3ab81533d72d84c3f408bf5c10d2afaf548d512
lines: 237
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/SDKMessageRenderer.test.ts

## 1. 测试目标

**SDKMessageRenderer 渲染语义**（`apps/electron/src/renderer/components/agent/SDKMessageRenderer.test.ts`）：quoted_context chip 化不泄漏 XML、system 压缩消息独立成组/回填语义、迷你地图 join/截断、历史任务主体。

## 2. 用例清单

4 describe / 12+ test。

| describe | # | 断言要点 | 行 |
| --- | --- | --- | --- |
| 用户消息引用上下文渲染 | 1-2 | quoted_context→引用 chip 不泄漏 XML（正文/迷你地图预览都剥离） | `:25-53` |
| system 消息渲染分组 | 3-5 | 压缩消息独立成组阻断 turn 合并；**压缩分界后 result 回填压缩前 turn 耗时/token 不丢**；`/compact` 自身 result 不回填上一轮 | `:54-118` |
| assistant-turn 迷你地图预览 | 6-10 | text 块空格 join（含同消息多块/前导空格语义）；**>200 字符截断保留块间空格**；无 text 空串 | `:120-161` |
| buildHistoricalTaskSubjects | 11+ | 历史任务主体 | `:162-237` |

## 3. 真实断言

（`:25-237` 断言组——chip 剥离/回填/join 截断。）

## 4. 未覆盖与脆弱点

- 未覆盖：全组件渲染树（聚焦语义函数）。
- 脆弱点：join/截断边界断言（200 字符/空格语义）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12+ 用例覆盖渲染语义 | 已证实 | `:25-237` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| quoted_context | 1-2 | `:25-53` | covered |
| 压缩/回填 | 3-5 | `:54-118` | covered |
| 迷你地图 | 6-10 | `:120-161` | covered |
| 历史主体 | 11+ | `:162-237` | covered |
