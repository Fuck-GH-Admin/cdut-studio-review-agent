---
path: packages/core/src/providers/sse-reader.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4070b9c15d3ded027d1907eb5bffeff5c8cde292
sha256: ab3f70a71720bde0348cb7144459f29f0aa4365b51db0c8a1f5474d8f67a2a92
lines: 147
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/sse-reader.test.ts

## 1. 测试目标

`streamSSE`（`sse-reader.ts:162`）的帧解析/工具参数/用量行为：尾帧无换行保留、并行工具按 index 分配参数、同帧多行 `data:` 合并、CRLF、空闲超时、usage 汇总/缺省（`packages/core/src/providers/sse-reader.test.ts:16`）。

## 2. 用例清单

1 describe / 7 test。夹具：`responseFromText(text)` 用真实 `Response(ReadableStream)` 作 `fetchFn` 注入（`:7-14`）；`OpenAIAdapter` 作真实解析器（非 mock）。

| # | 名称 | 动作 | 断言 | 行 |
| --- | --- | --- | --- | --- |
| 1 | 尾帧无换行保留最后一段 | 单行 `data:` 无尾换行 | `content==='tail'` | `:17-28` |
| 2 | 并行工具参数交错按 index 分配 | 2 工具×3 帧交错 delta | `toolCalls` 两条完整参数（`{query:'docs'}`/`{path:'README.md'}`）且 `metadata.toolIndex` 0/1 | `:30-60` |
| 3 | 同帧多行 `data:` 按规范合并 | JSON 拆 2 行 + 空行 | `content==='multi'` | `:62-79` |
| 4 | CRLF 行尾不带 `\r` | `\r\n\r\n` | `content==='crlf'` | `:81-94` |
| 5 | 空闲超时终止 reader | 空流 + `idleTimeoutMs:5` | rejects「流式响应空闲超过 5ms」 | `:96-109` |
| 6 | 流末 usage chunk 汇总 | 3 行含 usage | `usage.inputTokens===100`、`outputTokens===20`、事件含 `usage` | `:111-133` |
| 7 | 无 usage → `undefined`（调用方回退估算） | 单行无 usage | `usage===undefined` | `:135-146` |

## 3. 真实断言

- `expect(result.toolCalls).toEqual([{ id: 'call-a', name: 'search', arguments: { query: 'docs' }, metadata: { toolIndex: 0 } }, …])`（`:56-59`）。
- `await expect(streamSSE({… idleTimeoutMs: 5 …})).rejects.toThrow('流式响应空闲超过 5ms')`（`:102-108`）。
- `expect(result.usage).toBeUndefined()`（`:145`）。

## 4. 未覆盖与脆弱点

- 未覆盖：重试环（`hasEmitted` 门禁/退避）、首字节超时、`ProviderStreamError` 路径、thinking 块、`fetchTitle`。
- 脆弱点：`OpenAIAdapter.parseSSELine` 的输出形状被 `toEqual` 全量断言（含 `metadata`）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖帧/工具/用量 | 已证实 | `:17-146` |
| 夹具为真实 Response/ReadableStream | 已证实 | `:7-14` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测行为 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 尾帧 flush | 1 | `:17-28` | covered |
| 工具参数分配 | 2 | `:30-60` | covered |
| 帧合并 | 3 | `:62-79` | covered |
| CRLF | 4 | `:81-94` | covered |
| 空闲超时 | 5 | `:96-109` | covered |
| usage 有/无 | 6-7 | `:111-146` | covered |
| 重试环 | — | — | unknown（未覆盖） |
