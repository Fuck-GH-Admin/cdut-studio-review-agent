---
path: apps/electron/src/main/lib/project-graph-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 99061ea49218c1e700e5d480992b83c230a72bba
sha256: db98c16c3ff620a8eea246da395514302e98051ee82cfa8dd4a757d51d76265e
lines: 116
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/project-graph-service.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Graph sessionId 安全边界：路径穿越/不安全字符拒绝；指向会话目录外的 Graph 符号链接拒绝；配置目录软链别名走真实路径语义通过；`loadHarnessGraphSnapshot` 一次加载返回稳定 ready/focus 事实且不写事件。

## 2. 用例清单

共 4 个 `test(`（两个 describe：`:26` 安全边界 3 个、`:85` 快照 1 个）。夹具：`PROFER_CONFIG_DIR` 临时根（`:10-24`）；**动态 import 带 query 哈希**绕过模块缓存（`:29` 等）；mock `electron`（`:6-8`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 路径穿越/不安全字符（`:27`） | `../secret`/`nested/session`/`session id`/`..` 对 `loadGraph`/`appendGraphEvent` 均 `toThrow('无效的会话标识')` |
| 2 | 外指 symlink 拒（`:39`） | `loadGraph`/`appendGraphEvent` 均 `toThrow('符号链接')`（EPERM 平台守卫 `:48-51`） |
| 3 | 别名目录真实路径语义（`:60`） | 软链 config-alias→real-config 写入后 `loadGraph('session-alias').nodes.task?.subject==='path alias'`；`existsSync(realConfigDir/agent-sessions/session-alias-graph.jsonl)===true`（win32 junction/EPERM 守卫） |
| 4 | 快照稳定（`:86`） | `readyTaskIds` `toEqual(['earlier','later'])`（按 createdAt 排序）；`focusTaskId==='earlier'`；`focusReason` 含 `'创建时间最早'`；`second` `toEqual(first)`；节点数 3 |

## 3. 真实断言

逐条见上表（`:31-35,179-183,206-207,236-240`）。mock 边界：仅 mock `electron`；JSONL 读写/路径安全为**真实实现**（真实临时目录/软链）。

## 4. 未覆盖与脆弱点

未覆盖：`getGraphSummary`/`getProjectPreamble`/`queryNodesByStatus`/`initProjectMeta`/`syncProjectMetaFromGraph`、`realpathCandidate` 各分支、win32 盘符。EPERM 平台守卫会跳过 symlink 用例（`:48-51,68-71`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(` |
| sessionId 边界 | 已证实 | `:27-37` |
| symlink 拒/别名真实路径 | 已证实 | `:39-82` |
| 快照确定性 | 已证实 | `:110-114` |
| 其余导出 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| ID 安全 | 1 | 153-163 | covered |
| symlink 拒 | 2 | 165-184 | covered |
| 别名语义 | 3 | 186-208 | covered |
| 快照 | 4 | 212-241 | covered |
| 其余导出 | 无 | — | unknown |
