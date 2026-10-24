---
path: apps/electron/src/main/lib/remote-service-send-message.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 534a696cd145879674e828af2685d8455312eb5f
sha256: c76d0a5b953c94b55af189a6449bf827daaa96223420d071f01bebed8ceb628d
lines: 114
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-service-send-message.test.ts

## 1. 测试目标

`send_message` 的 `uuid`/`startedAt` 透传（WS 命令级）——**缺口来源 quality-report-server.md §7.2 条目 3（实施者自述无测试）**（`:7`）。只 mock `runAgentHeadless` 捕获实参（`:19-26`），断言真实传入实参（`:10`）。

## 2. 用例清单

**3 个 `test()`**（describe `send_message 的 uuid / startedAt 透传`）：逐字透传（`:64-82`）、双缺省回退（`:84-98`）、类型不符/空串按缺省（`:100-113`）。

## 3. 真实断言

- `:67-81` `{ok:true,data:{accepted:true}}`；`input.startedAt` `toBe(1700000000000)`、`input.uuid` `toBe('pocket-uuid-abc-123')`；其余字段 matchObject 防漏字段；`callbacks.source` `toBe('bridge')`。
- `:93-97` 缺省时 startedAt 数值落 [before,after] 区间、**uuid 键不出现**（`hasOwnProperty` false，对应 `{...(uuid?{uuid}:{})}` 实现）。
- `:109-112` startedAt 字符串/uuid 空串 → 同缺省处理。

## 4. 未覆盖与脆弱点

mock 掉真实 run（`:21`）；真实执行链未测。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-114` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| uuid/startedAt 透传三面 | 3 | covered |
