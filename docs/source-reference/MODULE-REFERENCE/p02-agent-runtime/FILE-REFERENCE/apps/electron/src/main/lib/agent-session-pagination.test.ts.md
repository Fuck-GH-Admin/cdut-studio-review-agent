---
path: apps/electron/src/main/lib/agent-session-pagination.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7b27d214e1a49d514b075fb10235db3e8e29a463
sha256: 61d9fa26f7e47b1a16ab67e9398e7941142136ac4f41dda57c7506e4a1b88a49
lines: 76
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-pagination.test.ts

## 1. 测试目标

`paginateSDKMessages`（`agent-session-manager.ts:3438`）：按 turn 边界向前扩展，上划翻页永不以 assistant 片段开头、页间无缺口。bun:test；electron mock+动态 import；消息夹具（userInput/toolResult/assistant，`:26-48`）。

## 2. 用例清单

共 **1 个 `test(`**（8 条消息两 turn，`:51-75`）：尾页 startIndex=4（第二 turn 用户输入边界）+hasMore=true；续页 before=4→startIndex=0、hasMore=false；两页拼接=完整序列。

## 3. 真实断言

`:64-66` `startIndex` `toBe(4)`/`hasMore` `toBe(true)`/`messages` `toEqual(messages.slice(4))`；`:72-74` `startIndex` `toBe(0)`/`hasMore` `toBe(false)`/拼接 `toEqual(messages)`。

## 4. 未覆盖与脆弱点

无 user 前缀起点（i===1 回 0 分支）、targetMessages 缺省 10 组合无独立断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例/断言 | 已证实 | 全 76 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 用例 | §2/§3 | 51-75 | covered |
