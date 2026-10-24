---
path: apps/electron/src/renderer/lib/use-session-setting-mutation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b27f164c39af7bfb286abde936ad8d8452e0005d
sha256: 20c09917506564439137e16d7e3913a30127bbe189f59bc830cf6f6f1fa692f0
lines: 14
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/use-session-setting-mutation.test.ts

## 1. 测试目标

session setting mutation ordering 单测：`isLatestSessionSettingRequest` 的“仅最新请求可应用异步结果”语义。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**2 test**（`:4-13`）：

1. `:5-8` `isLatest(1,2)=false`、`isLatest(2,2)=true`（only the latest request may apply）。
2. `:10-13` 旧序号 1 vs 3 丢弃、3 vs 3 通过（stale response cannot become authoritative）。

## 3. 真实断言

精确布尔断言（序号相等语义）；两用例覆盖“被超越”与“最新”两态。

## 4. 未覆盖与脆弱点

**未覆盖**：`useSessionSettingMutation` hook 本体（React 竞态/乐观/回滚编排未测）。

**脆弱点**：纯谓词测试，hook 行为未锁。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、2 test | 已证实 | `:4`；`grep -c test(`=2 |
| 序号相等语义 | 已证实 | `:5-13` |
| hook 编排 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `isLatestSessionSettingRequest` | #1/#2 | `:5-13` | covered |
| hook 本体 | — | — | unknown |
