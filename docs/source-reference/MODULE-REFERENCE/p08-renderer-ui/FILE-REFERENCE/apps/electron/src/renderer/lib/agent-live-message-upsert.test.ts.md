---
path: apps/electron/src/renderer/lib/agent-live-message-upsert.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 90b2fa1265b350ed4856273e0fce789cc063f945
sha256: 70de435fa5dd9bb1532129d4effd565547836e9b42367796678d256ff5073bda
lines: 41
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-live-message-upsert.test.ts

## 1. 测试目标

upsertLiveMessageByUuid partial/final 帧语义。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:11/:27/:34），1 describe（:10）：
1. Pi partial 累计帧+final 共 UUID 逐帧替换。
2. incoming partial 替换已有 final。
3. **final→final 去重保留**。

## 3. 真实断言

- :11-25：多帧 upsert 后数组 toEqual 仅保留最终帧（同 UUID 原位替换，长度不涨）。
- :27-32：incoming partial 替换已有 final（toEqual 内容为 partial 帧）。
- :34-39：final→final 重复 toEqual 原数组（去重丢弃）。

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
| partial 覆盖/去重 | 3 用例 | covered |
