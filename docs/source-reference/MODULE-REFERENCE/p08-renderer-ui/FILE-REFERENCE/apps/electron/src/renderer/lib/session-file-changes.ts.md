---
path: apps/electron/src/renderer/lib/session-file-changes.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76a92e0f77ed149b68f8fccefbd0948121fd6834
sha256: 8903fd9d8ba8c0e54a32ee2cd4d308fb70a9a02f9dae68b62a6bb5d58d563c0d
lines: 58
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/session-file-changes.ts

## 1. 结论与边界

非 Git 目录中 Agent 写工具（Write/Edit 等）产生的文件变更：**纯类型定义 + 纯函数去重/分组工具**（`session-file-changes.ts:1-8` 文件头自述）。运行时无任何 I/O；事件监听在 `useGlobalAgentListeners`，渲染在 `DiffChangesList`。

边界：不监听工具事件、不写盘、不持久化（记录存于渲染态 Jotai atom，见 §5）；不判断 Git/非 Git 场景（由 DiffChangesList 按场景决定展示，`DiffChangesList.tsx:220-227`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SessionFileChangeKind` | type | 10 | `'created' \| 'edited'` | 变更类型二值 |
| `SessionFileChange` | interface | 12-17 | `{path, kind, runId, updatedAt}` | 单条变更记录 |
| `getSessionFileChangeKind` | 函数 | 20-23 | `(toolName: string) => SessionFileChangeKind` | 工具名→变更类型 |
| `upsertSessionFileChange` | 函数 | 30-46 | `(changes, next) => SessionFileChange[]` | 按 path 去重插入/更新 |
| `groupSessionFileChanges` | 函数 | 49-58 | `(changes, currentRunId?) => {current, earlier}` | 按 runId 分组 |

导出计数 5（`export` 逐条核：type 1、interface 1、function 3）。无独立内部函数（`findIndex`/`map` 内联于 `upsertSessionFileChange`）。

## 3. 内部逻辑与关键流程

- `getSessionFileChangeKind`（`session-file-changes.ts:20-23`）：`toolName === 'Write'` → `'created'`（`:21`），**其余一律** `'edited'`（`:22`，含 Edit/未知工具名）。
- `upsertSessionFileChange`（`:30-46`）：① 按 `path` 严格相等 `findIndex`（`:34`）；② 未命中 → `[next, ...changes]` 前插（`:35`），即新记录排最前；③ 命中 → 保留原记录位置（`changes.map` 原位替换 `:43-45`），合并规则：基础字段全取 `next`（spread `:38`），但 `kind` 为 `'created'` 时不可被后续 `'edited'` 覆盖（`:41`，注释 `:40`），否则取 `next.kind`。同路径更新时 `updatedAt` 取 `next`（新值）。
- `groupSessionFileChanges`（`:49-58`）：`currentRunId` 为空 → 全部归 `current`、`earlier` 为空数组（`:53`）；否则按 `change.runId === currentRunId` 精确分流（`:55-56`）。纯过滤，不改记录、不排序。

## 4. 调用者与调用链

入向（grep 全冻结树，3 个生产消费点）：
- `useGlobalAgentListeners.ts:83`（import）、`:1107` `getSessionFileChangeKind(entry.toolName)`、`:1116` `upsertSessionFileChange(existing, fileChange)` —— 写工具完成事件里积累变更并写入 `agentNonGitFileChangesAtom`（`:1117-1122`）。
- `DiffChangesList.tsx:17-18`（import 函数+类型）、`:225` `groupSessionFileChanges(filtered, currentFileChangeRunId)`（搜索词先过滤 `:222-224`）；`:54`/`:531` 组件 props/行组件使用 `SessionFileChange` 类型。
- `agent-atoms.ts:14`（类型 import）、`:424` `agentNonGitFileChangesAtom` 值类型。

出向：本文件无 import（纯函数，`session-file-changes.ts:1-58` 无 import 语句）。

## 5. 数据 I/O、读写与副作用

- 输入为内存数组/对象，返回新数组，不修改入参（`:35`、`:43-45` 均构造新数组）。
- 无磁盘/网络/缓存读写；无进程、窗口、日志副作用。
- 记录最终存放于渲染态 `agentNonGitFileChangesAtom`（`agent-atoms.ts:424`，默认 `new Map()`）——仅内存，应用重启后丢失（推断，见 §10）。

## 6. 分支、失败、取消与恢复

- 分支：`:21` Write 判断；`:35` `index < 0` 短路前插；`:41` created 优先三元；`:53` 空 `currentRunId` 短路。
- 无 throw、无错误码、无用户可见文案；入参无校验（`path`/`runId` 为空也照常入列，无防御代码，已证实）。
- 取消/恢复不适用，依据：本文件无异步、无定时器、无持久化，纯同步变换。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/权限检查，纯函数对任何调用方开放。权威状态（谁的 runId 算「本轮」）由调用方 `DiffChangesList` 传入的 `currentFileChangeRunId` 决定（`DiffChangesList.tsx:225`），本文件不产生权威状态。

## 8. 修改影响面

- 调用方 3 处：`useGlobalAgentListeners.ts`（积累逻辑 `:1107-1122`）、`DiffChangesList.tsx`（分组展示 `:225`、行渲染 `:531`）、`agent-atoms.ts:424`（类型）。
- 改 `kind` 语义会影响「文件改动」面板的创建/编辑图标（`DiffChangesList.tsx:535` `isCreated = change.kind === 'created'`）；改分组语义影响「本轮/更早」分区（`:220-227`）。
- 需同步修改的测试：无专属测试（§9）。

## 9. 测试证据

- 直接测试文件：**无**。检索范围：冻结树全部 `.ts/.tsx/.js/.jsx/.mjs/.cjs`，pattern `getSessionFileChangeKind|upsertSessionFileChange|groupSessionFileChanges|session-file-changes`，仅命中本文件与 §4 三个生产消费点，0 个测试文件。
- 间接证据：无（其它测试未覆盖本模块函数）。
- 本轮未执行任何测试：`NOT_RUN`（静态阅读所得）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出与签名如 §2 | 已证实 | `session-file-changes.ts:10-58` |
| Write→created、其余→edited | 已证实 | `session-file-changes.ts:21-22` |
| created 不被后继 edit 覆盖 | 已证实 | `session-file-changes.ts:40-41` |
| 新记录前插、同路径原位替换 | 已证实 | `session-file-changes.ts:35,43-45` |
| 真实消费点为 useGlobalAgentListeners/DiffChangesList/agent-atoms | 已证实 | `useGlobalAgentListeners.ts:83,1107-1116`、`DiffChangesList.tsx:225`、`agent-atoms.ts:424` |
| atom 仅内存，重启丢失 | 推断 | `agent-atoms.ts:424` 默认 `new Map()`，未见持久化代码 |
| 无直接测试 | 已证实（否定，检索范围见 §9） | 全树 grep 0 测试命中 |
| 工具名集合的完整语义（哪些工具算 Write/Edit） | 未知 | 上游 `entry.toolName` 来源未逐点追至主进程事件 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SessionFileChangeKind`/`SessionFileChange` | §2 | 10-17 | covered |
| `getSessionFileChangeKind` | §2/§3 | 20-23 | covered |
| `upsertSessionFileChange`（去重/created 优先/前插） | §3 | 30-46 | covered |
| `groupSessionFileChanges`（含空 runId 分支） | §3 | 49-58 | covered |
| 消费链 3 处 | §4 | - | covered |
| 测试覆盖 | §9 | - | unknown（无测试） |
