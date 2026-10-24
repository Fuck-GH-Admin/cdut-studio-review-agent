---
path: apps/cli/src/commands/search.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d26cb52ef571e291aae70a51851617609c5e6899
sha256: 18ecee89961b2ff5b3f59b2564744ba007ccbc461cc0e8f56bd3164f20070d53
lines: 46
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/commands/search.ts

## 1. 结论与边界

`profer session search` 命令（CLI 运行时）：会话内子串搜索，返回命中 turn 下标+片段，Agent 再用 `export --turns` 取邻域避免全量读（文件头 `apps/cli/src/commands/search.ts:1-4`，usage `:15`）。选项 `--context N`/`--limit N`/`--case-sensitive`。

边界：搜索算法在 `session-core.searchTurns`；不做正则（子串，由 searchTurns 语义，非本批）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（`register` 副作用注册）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `register({name:'search',…})` | 副作用 | 12-46 | 命令定义 |

## 3. 内部逻辑与关键流程

1. 位置参数 `[query, target]`：缺 query/target 各抛 `UsageError`（`:17-19`）；`resolveSession` 失败 → EXIT_ERROR（`:20-24`）。
2. `searchTurns(turns, query, {context, limit, caseSensitive})`（`:26-31`）。
3. `--json` 原样 hits 数组（`:33-35`）；0 命中 `info('未命中: "…"')` 返回 0（`:37-40`）；否则每行 `#下标 [role] (N处) 片段`（`:41-43`）。

## 4. 调用者与调用链

入向：经 `index.ts:26` 注册被 `getCommand('search')` 分发。无其它 import。

出向：`../registry`/`../sessions`/`../output`/`../args`（`:10`）、`@profer/session-core/node`（`:8`）、`@profer/session-core`（`searchTurns`，`:9`）。

## 5. 数据 I/O、读写与副作用

读 JSONL 全量入内存（`:26`）；写 stdout/stderr。无写盘/网络（依据：全文读）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| 缺 query/target | 位置参数不足 | 17-19 | 2 |
| 找不到会话 | resolveSession undefined | 20-24 | 1 |
| 0 命中 | hits 空 | 37-40 | 0（非错误） |
| json/文本 | ctx.json | 33-43 | 0 |

无本地 catch（解析异常冒泡，推断）；无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；只读检索。

## 8. 修改影响面

- index.ts 注册链（`:26`）；`searchTurns` 命中/片段语义在 session-core（非本批）。
- 输出行格式（`#index [role] (N处) snippet`）是 Agent 消费契约。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `commands/search` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 全流程 | 已证实 | `:12-46` 逐行读 |
| 0 命中非错误 | 已证实 | `:37-40` 返回 EXIT_OK |
| searchTurns 语义 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 命令注册体 | §2-3 | 12-46 | covered |
| 参数/命中/双模式分支 | §6 | 17-43 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
