---
path: apps/cli/src/sessions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 578548350100e9300106f7fbc0d4f42321a35e78
sha256: 71b4018d8f38dba7b5ec6affc2cd3f42d847d92aa6eff4a3ed686de32c808f6c
lines: 72
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/sessions.ts

## 1. 结论与边界

CLI 会话索引读取（electron-free，只读）：等价主进程 `agent-session-manager` 的 readIndex/listAgentSessions，直接读 `<configDir>/agent-sessions.json`；CLI 只读不写（导出/清洗不修改用户数据，文件头 `apps/cli/src/sessions.ts:1-7`）。

边界：不读 JSONL 正文（`@profer/session-core/node` 的 `readSessionMessages` 在各命令）；不写索引；索引格式兼容在解析层。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 4 函数 = 5 个导出（`AgentSessionsIndex`/`safeBytes` 内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `readSessionIndex` | 函数（导出） | 18-27 | `(opts?) => AgentSessionMeta[]` | 缺失/损坏→[] |
| `listSessions` | 函数（导出） | 30-34 | `(opts?) => AgentSessionMeta[]` | updatedAt 降序 |
| `getSessionMeta` | 函数（导出） | 36-38 | `(id, opts?) => AgentSessionMeta \| undefined` | 按 id 查 |
| `ResolvedSession` | 接口（导出） | 40-46 | `{id, filePath, meta?, bytes?}` | |
| `resolveSession` | 函数（导出） | 54-64 | `(target, opts?) => ResolvedSession \| undefined` | 路径或 id 解析 |

内部：`AgentSessionsIndex`（`:12-15`）、`safeBytes`（`:66-72`，stat 失败→undefined）。

## 3. 内部逻辑与关键流程

1. `readSessionIndex`（`:18-27`）：文件不存在→[]（`:20`）；JSON.parse + `Array.isArray(data?.sessions)` 校验，异常/结构不符→[]（`:21-26`）。
2. `listSessions`（`:30-34`）：`updatedAt` 缺省按 0 参与降序（`:32`）。
3. `resolveSession`（`:54-64`）：target 以 `.jsonl` 结尾且存在→直接当文件（id 取 basename 去扩展，`:56-58`）；否则当 session id 拼 `<configDir>/agent-sessions/<id>.jsonl`（`:60-63`）；都不存在→undefined（命令层报错，`:52`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`commands/list.ts:5`（listSessions）、`commands/info.ts:8`/`outline.ts:6`/`search.ts:6`/`export.ts:14`（resolveSession/getSessionMeta 经 resolveSession）。

出向：`./paths`（`:10`）、`@profer/shared` `AgentSessionMeta` 类型（`:9`）、`node:fs`（`:8`）。

## 5. 数据 I/O、读写与副作用

- 读：`agent-sessions.json`（`:22`）、stat（`:68`）。**无写**（依据：全文读无写调用 + `:5-6` 声明）。
- 副作用：无。并发/幂等：每次全量读（无缓存）；纯读安全。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 结果 |
| --- | --- | --- | --- |
| 索引缺失/损坏 | exists/parse/结构 | 20-26 | 空列表（静默） |
| 目标=文件 | .jsonl 且存在 | 56-58 | 直接用 |
| 目标=id | 拼路径存在 | 60-63 | 解析 |
| 未找到 | 都不存在 | 62 | undefined |

无恢复概念，依据：只读一次性。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限检查；读取范围由 `paths.ts` 的 configDir 决定（含 §8 所述 `~/.profer` vs `~/.cdutai` 矛盾——默认可能读空）。索引权威=主进程 agent-session-manager 写入的数据。

## 8. 修改影响面

- 5 个 commands（§4）；索引格式 `AgentSessionsIndex{version, sessions}` 与主进程写方（`agent-session-manager`，非本批）耦合——version 字段未参与校验（`:22-23` 只查 sessions 数组，照实记录）。
- `resolveSession` 的 `.jsonl` 路径识别与 id 抽取规则（`:57`，`split('/')`——Windows 反斜杠路径取不到 basename，推断边界）。
- 需同步的测试：无（0 test；paths.test/args.test 不覆盖本文件）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `sessions.ts`/`readSessionIndex`/`resolveSession` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出 + 只读语义 | 已证实 | `:18-72` 逐行读 |
| 损坏索引静默降级空列表 | 已证实 | `:20-26` |
| version 不参与校验 | 已证实 | `:22-23` |
| Windows 反斜杠 basename 边界 | 推断 | `:57` split('/') |
| 主进程索引写格式 | 未知 | agent-session-manager 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2-3 | 18-64 | covered |
| 降级/解析分支 | §3, §6 | 18-64 | covered |
| 调用链 | §4 | - | covered |
| 主进程格式/运行期 | §10 | - | unknown（非本批/NOT_RUN） |
