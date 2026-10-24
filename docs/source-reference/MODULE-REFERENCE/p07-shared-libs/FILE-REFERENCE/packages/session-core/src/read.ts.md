---
path: packages/session-core/src/read.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a57730489e081ec96c3168e144ad5e312d45ea37
sha256: eb4e5b4d4d0e4e8297761b7c06474640d8cfb35d0b034326364423eadb068040
lines: 99
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/read.ts

## 1. 结论与边界

会话 JSONL 文本 → SDKMessage[]（纯函数、浏览器安全，头注释 :1-15）：旧扁平格式（AgentMessage 有 role 字段）统一归一为近似 SDKMessage，下游无需区分「格式 A/B」。刻意不 import node:fs（:12-14）。

## 2. 导出与关键符号

导出 2 条（`export` :22/:80）：
- `convertLegacyMessage(legacy)`（:22-74）：user→type 'user' 文本块（:23-33）；assistant→含 model（:35-46）；status→assistant+error 结构（:48-65，携带 _errorCode/_errorTitle/_errorDetails/_errorCanRetry/_errorActions）；其余→system init（:68-73）。均标 `_legacy: true`。
- `readSessionMessagesFromString(raw)`（:80-99）：逐行 JSON.parse，坏行静默跳过（:86-90 注释「容错：跳过损坏行」）；旧格式检测 `'role' in parsed && !('type' in parsed)`（:92）→ convertLegacyMessage，否则原样入列。

## 3. 内部逻辑与关键流程

四角色分支+行级容错（§2）。不适用取消/恢复：纯函数。

## 4. 调用者与调用链

入向（子agent 交叉核）：`read-fs.ts:9`（readSessionMessagesFromString）、`index.ts:13-16` 聚合；经 index 仅 `session-core.test.ts:3`。**否定**：`convertLegacyMessage` 无外部消费者——`main/lib/agent-session-manager.ts:1350` 是其本地同名函数（调用 :1239/:2495），非本模块 import（全树检索）。出向：`@profer/shared`（type AgentMessage/SDKMessage :16）。

## 5. 数据 I/O、读写与副作用

无 I/O（文本解析纯函数）。

## 6. 分支、失败、取消与恢复

坏行 catch 静默跳过（:87-90）；角色四分支（:23-73）。

## 7. 权限与权威状态

不适用，依据：纯解析。旧格式归一是兼容权威（:5-7 注释）。

## 8. 修改影响面

会话读取链（read-fs/CLI/主进程）；`session-core.test.ts`（批外）间接覆盖。

## 9. 测试证据

`session-core.test.ts`（批外，未在本批清单）经 index 间接。本批内无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；坏行容错/旧格式检测 | 已证实 | :80-99 |
| convertLegacyMessage 无外部消费者 | 已证实（否定） | §4 全树检索 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `convertLegacyMessage` 四分支 | §2 | :22-74 | covered |
| `readSessionMessagesFromString` | §2/§6 | :80-99 | covered |
| 测试 | §9 | — | unknown（批外） |
