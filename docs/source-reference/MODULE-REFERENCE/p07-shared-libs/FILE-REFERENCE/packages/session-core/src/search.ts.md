---
path: packages/session-core/src/search.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2cd3e1adbbbb7c86556bc756ccd2a24ac63eaa01
sha256: 494ceb39edcb826d5440671836f088947e7d3b40248a54278a829c292b634d93
lines: 57
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/src/search.ts

## 1. 结论与边界

**转录子串搜索纯函数**（`packages/session-core/src/search.ts:20-23` 注释）：在 `TranscriptTurn[]` 的正文+工具摘要上做子串匹配，返回命中 turn 的下标/角色/片段/次数；注释自述供 Agent "再用 selectTurns / export --turns 取命中邻域，避免全量读"（`:22`）。不做正则/模糊/语义检索。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SearchHit` | interface（export） | `:3-10` | `{ index; role; snippet; matchCount }` | snippet 为命中处上下文（`:6`） |
| `SearchOptions` | interface（export） | `:12-18` | `{ caseSensitive?; context?=60; limit? }` | context 前后字符数（`:14`） |
| `searchTurns` | function（export） | `:24-57` | `(turns, query, opts?) => SearchHit[]` | 唯一函数 |

## 3. 内部逻辑与关键流程

`searchTurns`（`:24-57`）：

1. 空 query → `[]`（`:26`）；needle 按 `caseSensitive` 决定是否小写（`:27`）。
2. 逐 turn（`:30-54`）：`haystack = [text, ...toolSummaries].join('\n')`（`:31`），非大小写敏感时小写化（`:32`）。
3. 计数循环 `indexOf` 递进（`:36-42`）：记录 `firstIdx` 与 `matchCount`；`from = idx + needle.length` 防重叠。
4. 片段窗口（`:45-50`）：`[firstIdx-context, firstIdx+len+context]` 钳到原文，前后补 `…`（`:48/:50`），空白折叠（`:49`）。
5. 推入 `{index, role, snippet, matchCount}`（`:52`）；`limit` 达到即 break（`:53`）。

## 4. 调用者与调用链

- 入向（包外 1 文件）：`apps/cli/src/commands/search.ts`（CLI 搜索命令）；`packages/session-core/src/index.ts` 再导出；注释提及：`select.ts` 无、`search.ts:22` 自述联动。
- 测试入向：`packages/session-core/src/session-core.test.ts:98-103`。
- 出向：类型 `./transcript`（`TranscriptTurn/TurnRole`，`:1`）。

## 5. 数据 I/O、读写与副作用

纯函数：无 I/O/状态/副作用；确定性输出。

## 6. 分支、失败、取消与恢复

分支：空 query、caseSensitive 两态、无命中 continue（`:43`）、limit 提前停（`:53`）。不抛错（`indexOf` 语义）。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改匹配/片段语义 → CLI `search` 命令输出与 `session-core.test.ts:98-103`；与 `selectTurns`/`export --turns` 的邻域工作流联动（`:22` 注释）。

## 9. 测试证据

**直接测试 `session-core.test.ts:98-103`（1 用例，NOT_RUN）**：`searchTurns(turns,'needle')` → `toHaveLength(1)`、`hits[0].index` `toBe(1)`、`snippet` `toContain('needle')`（`:100-102`）。未覆盖：caseSensitive、context 窗口、limit、多命中计数、工具摘要命中。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出、计数/片段/limit 逻辑 | 已证实 | 逐行读 `:1-57` |
| 测试 1 用例断言 | 已证实 | 测试 `:98-103` |
| 未测分支行为 | 已证实（代码）/未测 | §9 列 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `searchTurns` 全流程 | §3/§6 | `:24-57` | covered |
| `SearchHit`/`SearchOptions` | §2 | `:3-18` | covered |
| 测试 | §9 | 测试行号 | covered（NOT_RUN） |
