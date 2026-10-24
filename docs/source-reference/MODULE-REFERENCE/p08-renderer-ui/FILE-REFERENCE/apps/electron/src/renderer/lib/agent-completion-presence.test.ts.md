---
path: apps/electron/src/renderer/lib/agent-completion-presence.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe07a744d21fc1bbba1976e429c84ab6bd8f2c9b
sha256: 09b9fea117b36e9146051e6680492c3ccaf94e81391d3ceb2e076073f886b816
lines: 72
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-completion-presence.test.ts

## 1. 测试目标

Agent 完成归属判断（在看/后台/兼容/失焦）。不运行（`NOT_RUN`）。

## 2. 用例清单

4 用例（:6/:25/:44/:54），1 describe（:5）：
1. 同 Agent Tab 激活→在看（:6-23）。
2. 草稿页激活→后台完成（:25-42）。
3. Tab 未恢复但 currentAgentSessionId 匹配→兼容判断（:44-52）。
4. **窗口后台→未查看入账角标**（:54-70）。

## 3. 真实断言

toBe/toEqual 级（markers 断言）。

## 4. 未覆盖与脆弱点

mock 边界：TabItem fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 在看/后台/兼容/失焦 | #1-#4 | covered |
