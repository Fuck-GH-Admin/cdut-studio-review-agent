---
path: apps/electron/src/renderer/lib/agent-message-merge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 97c762fe9d825d6fcb63f14f620de9dc3ef7e867
sha256: cc96402210cbf4c7cbc477460bf5f9f0b47c954c44e619f24f76b3a1d001e703
lines: 34
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-message-merge.test.ts

## 1. 测试目标

mergeMessagesByUuid 去重/原位保留。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:11/:21/:28），1 describe（:10）：
1. `/compact` 单份+原位保留（会话切换场景）。
2. 不同用户动作同文本保留。
3. 无 UUID 消息不去重。

## 3. 真实断言

- :11-19：合并结果 toEqual——/compact 单份且位于持久化原位（会话切换场景）。
- :21-26：不同用户动作同文本两条均保留（toEqual）。
- :28-32：无 UUID 消息不去重（长度 toEqual 全保留）。

## 4. 未覆盖与脆弱点

mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 原位/去重 | 3 用例 | covered |
