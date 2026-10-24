---
path: apps/electron/src/main/lib/adapters/pi-streaming-control.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3bb727fdc5bd852a7d94e6262408daa9ddc6db12
sha256: 7046c6d0ac45629b2ff931e80b6e29ac39493b85e9fea7c424c43d52b139945f
lines: 19
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-streaming-control.test.ts

## 1. 测试目标

`pi-streaming-control.ts` 的 `createPartialMessageCoalescer`：窗口内只发最新帧 + dispose 停止。被测逻辑见同组手册。

## 2. 用例清单

1 describe + **1 个 `test()`**（`:5-18`）：flushes only the newest partial message and stops after dispose。

## 3. 真实断言

- `:9-12` schedule('first')/schedule('latest') 后 flush → `emitted` `toEqual(['latest'])`（旧帧被覆盖）。
- `:14-17` schedule('discarded') 后 dispose+flush → `emitted` 仍 `toEqual(['latest'])`（不再发射）。

夹具：`createPartialMessageCoalescer((v)=>emitted.push(v), 50)`（`:7`）。

## 4. 未覆盖与脆弱点

- 未覆盖：定时器自然到期路径（时间推进）、`intervalMs` 节流余量计算、dispose 清 pending。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例断言如 §3 | 已证实 | 逐行读 `:1-19` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 覆盖旧帧/flush 尾帧/dispose 停止 | 1 | covered |
| 定时器自然到期 | — | unknown |
