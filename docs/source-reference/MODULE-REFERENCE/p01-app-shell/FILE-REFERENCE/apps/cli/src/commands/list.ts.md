---
path: apps/cli/src/commands/list.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 411e0b8c993c559d09199d11a8e900dff3aba00c
sha256: 0fa6b4cefbb485122c7c8e695c53639a8a4d2a6a6dcb970a3634eb31a013bd79
lines: 52
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/commands/list.ts

## 1. 结论与边界

`profer session list` 命令（CLI 运行时）：列出会话索引（便宜，不读 JSONL 正文），支持 `--limit N`/`--workspace W`/`--json`（文件头 `apps/cli/src/commands/list.ts:1-2`，usage `:21`）。

边界：不读正文；过滤/截断在内存；输出格式在本文件。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（`register` 副作用注册）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MetaLike` | 接口（内部） | 9-16 | 输出投影字段（id/title/updatedAt/workspaceId/modelId/archived） |
| `register({name:'list',…})` | 副作用 | 18-52 | 命令定义 |

## 3. 内部逻辑与关键流程

1. `limit=numFlag`、`workspace=strFlag`（`:23-24`）；`listSessions(ctx.pathOpts)` 全量（`:25`）。
2. `--workspace` 精确过滤 workspaceId（`:26`）；`--limit>0` 截断（`:27`，0/负值不截断）。
3. `--json`：投影 6 字段数组（title 空串兜底、`archived:!!s.archived`，`:30-37`）。
4. 文本模式：空列表 `info('（没有会话）')` 返回 0（`:41-44`）；每行 `id  时间(ISO 切 16 位)  标题(空白折叠 50 字)`（`:45-49`，时间缺省 `—`）。

## 4. 调用者与调用链

入向：经 `index.ts:23`（import 注册）被 `getCommand('list')` 分发（`index.ts:57-72`）；无其它 import。

出向：`../registry`（`register`，`:4`）、`../sessions`（`listSessions`，`:5`）、`../output`（`:6`）、`../args`（`:7`）。

## 5. 数据 I/O、读写与副作用

读会话索引（经 sessions.ts）；写 stdout/stderr。无盘写/网络（依据：全文读）。幂等：纯读。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| workspace 过滤 | flag 存在 | 26 |
| limit 截断 | >0 | 27 |
| json/文本 | ctx.json | 29-49 |
| 空列表 | 无会话 | 41-44 |

无异常路径（索引损坏=空列表，sessions.ts 降级）；无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；只读展示。

## 8. 修改影响面

- index.ts 注册链（`:23`）；输出字段是 Agent 消费契约。
- `MetaLike` 与 `AgentSessionMeta` 的字段子集关系（`:9-16`，全量 cast `:25`）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `commands/list` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 分支全流程 | 已证实 | `:9-52` 逐行读 |
| limit≤0 不截断 | 已证实 | `:27` |
| 注册分发链 | 已证实 | `index.ts:23,57-72` |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 命令注册体 | §2-3 | 18-52 | covered |
| 过滤/截断/双模式 | §3, §6 | 23-49 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
