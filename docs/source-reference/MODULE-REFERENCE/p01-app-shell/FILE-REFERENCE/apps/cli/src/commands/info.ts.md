---
path: apps/cli/src/commands/info.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe86c9ad44bcbe0b423f75123aa7fd525ccfed5b
sha256: fd90c3d707797334ced34e38c6b7555608d6a597cc9b25e43ed177141714f084
lines: 54
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/commands/info.ts

## 1. 结论与边界

`profer session info` 命令（CLI 运行时）：会话体量/结构概览——turn 数、角色分布、估算 tokens、字节数、时间区间；只输出统计量不输出正文，供 Agent 决定全量读还是分段/搜索读（文件头 `apps/cli/src/commands/info.ts:1-6`，usage `:16`）。

边界：正文渲染在 export；分段在 outline；tokens 为 `toTranscript` 估算值（`:31`）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（`register` 副作用注册）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `register({name:'info',…})` | 副作用 | 13-54 | 命令定义 |

## 3. 内部逻辑与关键流程

1. `target` 缺失 → `UsageError('缺少会话 id 或路径')`（`:18-19`）；`resolveSession` 失败 → `errorLine('找不到会话: …')` 返回 `EXIT_ERROR`（`:20-24`）。
2. `toTranscript(groupIntoTurns(readSessionMessages(filePath)))`（`:26`）；按 role 计数（`:27-30`）；tokens 累加（`:31`）。
3. report：`{id, title, bytes, turns, roles, estimatedTokens, model}`（`:33-41`，model 取 meta.modelId）。
4. `--json` 原样输出（`:43-45`）；文本模式：标题行 + `turns: N (role:count …)` + `估算 tokens: ~N` + `原始 JSONL: N KB`（bytes 有值才显示，`:48-51`）。

## 4. 调用者与调用链

入向：经 `index.ts:24` 注册被 `getCommand('info')` 分发。无其它 import。

出向：`../registry`/`../sessions`/`../output`/`@profer/session-core/node`（`readSessionMessages`，`:10`）、`@profer/session-core`（`groupIntoTurns`/`toTranscript`，`:11`）。

## 5. 数据 I/O、读写与副作用

读 JSONL 正文（全量入内存解析，`:26`）+ 索引 meta；写 stdout/stderr。无写盘/网络（依据：全文读）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| 缺参数 | 无 target | 18-19 | 2（UsageError→index 捕获） |
| 找不到会话 | resolveSession undefined | 20-24 | 1 |
| json/文本 | ctx.json | 43-51 | 0 |

JSONL 解析异常未捕获（`readSessionMessages` 抛错冒泡至 index → EXIT_ERROR，推断）。无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；只读展示。

## 8. 修改影响面

- index.ts 注册链（`:24`）；report 字段是 Agent 消费契约。
- `toTranscript` 的 tokens 估算语义在 `@profer/session-core`（非本批）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `commands/info` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 全流程分支 | 已证实 | `:13-54` 逐行读 |
| 退出码语义 | 已证实 | `:18-24` + `output.ts:10-12` |
| tokens 估算口径 | 未知 | session-core `toTranscript`（非本批） |
| 解析异常冒泡 | 推断 | 无本地 catch |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 命令注册体 | §2-3 | 13-54 | covered |
| 错误/双模式分支 | §6 | 18-51 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
