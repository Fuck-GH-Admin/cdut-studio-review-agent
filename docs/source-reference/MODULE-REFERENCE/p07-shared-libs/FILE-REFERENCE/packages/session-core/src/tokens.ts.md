---
path: packages/session-core/src/tokens.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f53b37f724e38e642eefedca061798339887890a
sha256: 377cc23cf27d3f4b5d7a15de83e704d9ee01fdb9bb5ee19f36e159b1597a7a26
lines: 16
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/src/tokens.ts

## 1. 结论与边界

**近似 token 估算纯函数**（`packages/session-core/src/tokens.ts:1-16`）：无第三方 tokenizer，启发式 = 英文约 4 字符/token、CJK 约 1.5 字符/token（`:2-4` 注释）。注释明确"仅用于 info/outline 的『够不够塞进上下文』量级判断，非精确计费"（`:4`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `estimateTokens` | function（export） | `:6-16` | `(text: string) => number` | 唯一导出 |

## 3. 内部逻辑与关键流程

`estimateTokens`（`:6-16`）：空串返回 0（`:7`）→ 逐字符计 CJK（`codePointAt` 落在 `0x3000-0x9fff`，`:10-12`）→ `ascii = length - cjk` → `Math.ceil(ascii/4 + cjk/1.5)`（`:15`）。无分支异常。

## 4. 调用者与调用链

- 入向：`packages/session-core/src/transcript.ts`（`toTranscript` 三处 tokens 字段）；`packages/session-core/src/index.ts` 再导出；包外 **1 文件**：`apps/electron/src/main/lib/pi-harness/graph-focus-packet.ts`。
- 出向：无（纯函数）。

## 5. 数据 I/O、读写与副作用

无 I/O、无状态；确定性输出。

## 6. 分支、失败、取消与恢复

空串分支（`:7`）；不抛错。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改公式 → `transcript.ts` 的 `tokens` 字段与 graph-focus-packet 的量级判断；无测试锁定具体数值（§9）。

## 9. 测试证据

无直接断言（`session-core.test.ts` 未断言 tokens 数值——仅经 `toTranscript` 间接经过）。负向检索：冻结树 `*.test.*` 检索 `estimateTokens` → 仅 `session-core.test.ts` 导入面提及（无数值断言）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出、CJK 区段判定、ceil 公式 | 已证实 | 逐行读 `:1-16` |
| 估算精度 | 未知 | 启发式（注释自述非精确） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `estimateTokens` | §2/§3 | `:6-16` | covered |
| 测试 | §9 | — | covered（无断言，NOT_RUN） |
