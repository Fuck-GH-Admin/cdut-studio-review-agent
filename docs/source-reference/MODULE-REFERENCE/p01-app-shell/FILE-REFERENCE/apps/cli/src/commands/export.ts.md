---
path: apps/cli/src/commands/export.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b38e0d1fdd11088bef19495984bf5f3e1373aaa
sha256: 25303a9f280585511998be18a7797b84d2ca9f2898792058caad0abeb2115a27
lines: 110
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/commands/export.ts

## 1. 结论与边界

`profer session export` 命令（CLI 运行时）：把会话或 turn 子集渲染为干净 Markdown。面向有限上下文的护栏：**未指定任何窗口**且输出超 `--max-bytes`（默认 51200=50KB）时拒绝灌 stdout，落盘并回执路径（文件头 `apps/cli/src/commands/export.ts:1-10`，usage `:25`）。窗口优先级（`selectTurns` 语义）：`--after-message` > `--turns` > `--head` > `--tail` > `--offset/--limit`（`:8`）；`--out FILE` 显式落盘不受护栏限制（`:9`）。

边界：Markdown 渲染在 `session-core.renderTranscriptMarkdown`；锚点查找在本文件 `findAssistantAnchorTurnIndex`；不改源数据（只读+写新文件）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（`register` 副作用注册）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `findAssistantAnchorTurnIndex` | 函数（导出） | 100-104 | `(groups: MessageGroup[], messageId: string) => number \| undefined` | assistant uuid→turn 下标 |
| `DEFAULT_MAX_BYTES` | 常量（内部） | 20 | `51200` | 护栏预算 |
| `register({name:'export',…})` | 副作用 | 22-97 | 命令定义 |
| `writeFileTo` | 函数（内部） | 106-110 | mkdir -p + 写文件 | |

## 3. 内部逻辑与关键流程

1. 解析与定位（`:27-33`）：缺 target→UsageError；找不到会话→EXIT_ERROR。
2. 窗口解析（`:38-53`）：`hasWindow`=任一窗口 flag 存在（`:45`）；`--after-message` 走 `findAssistantAnchorTurnIndex`，锚点缺失抛 `UsageError('找不到 assistant 消息锚点: …')`（`:47-49`），命中则取 `allTurns.slice(anchorTurnIndex + 1)`（锚点 turn **不含**，`:51-52`）；否则 `selectTurns`/全量（`:53`）。
3. 渲染：`renderTranscriptMarkdown(turns, {sessionId, header: !hasWindow})`——有窗口省略顶部标题便于拼接（`:54-55`）；`bytes=Buffer.byteLength(md)`（`:56`）。
4. `--out` 显式落盘：`writeFileTo`+回执 `{written, bytes, turns, totalTurns}`（`:63-69`）。
5. **护栏**（`:71-91`）：`!hasWindow && !forceStdout && bytes>maxBytes` → 写 `<id>.clean.md`，回执 `{guarded:true, reason:'output-exceeds-max-bytes', written, hint:…}`（JSON/文本两态），返回 0。
6. 否则 `emitText(md)`（`:93-95`）。

`findAssistantAnchorTurnIndex`（`:100-104`）：在 `assistant-turn` 组的 `assistantMessages` 中找 `uuid===messageId` 的组下标；找不到 undefined。

## 4. 调用者与调用链

入向：经 `index.ts:27` 注册被 `getCommand('export')` 分发；`findAssistantAnchorTurnIndex` 被 `export.test.ts:4` 测试。

出向：`../registry`/`../sessions`/`../output`/`../args`（`numFlag/strFlag/boolFlag/parseRange`，`:18`）、`@profer/session-core/node`（`:16`）、`@profer/session-core`（`groupIntoTurns/toTranscript/selectTurns/renderTranscriptMarkdown/MessageGroup`，`:17`）、`node:fs`（`mkdirSync/writeFileSync`，`:11`）。

## 5. 数据 I/O、读写与副作用

- 读：JSONL 全量（`:35`）；写：`--out` 或护栏 fallback `<id>.clean.md`（写**当前工作目录**相对路径，`:73,106-110`，`writeFileTo` 自动建父目录 `:108`）。
- 副作用：文件写入；stdout/stderr 输出。幂等：覆盖写（writeFileSync 无 flag）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| 缺参数/找不到会话 | - | 27-33 | 2 / 1 |
| 锚点缺失 | after-message 无命中 | 47-49 | 2 |
| after-message 窗口 | 锚点命中 | 51-52 | - |
| selectTurns 窗口 | 其它窗口 flag | 53 | - |
| --out 落盘 | out 存在 | 63-69 | 0 |
| 护栏落盘 | 无窗口+超预算+未 --stdout | 71-91 | 0 |
| stdout 全量 | 其余 | 93-95 | 0 |

写文件失败（权限/磁盘）不捕获，冒泡→index EXIT_ERROR（推断）；无取消/恢复概念。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限检查；写路径完全由用户 flag/fallback 决定（`--out` 任意路径、fallback 写 cwd），无沙箱约束（照实记录）。

## 8. 修改影响面

- index.ts 注册链（`:27`）；`findAssistantAnchorTurnIndex` 是导出面（export.test 直测）。
- 护栏参数（50KB 默认）与 hint 文案（`:82`）是 Agent 工作流契约；`renderTranscriptMarkdown` 的 `header` 选项耦合（`:55`）。
- 需同步的测试：`export.test.ts`（2 用例，本批——只覆盖锚点函数，护栏未测）。

## 9. 测试证据

直接测试：`apps/cli/src/commands/export.test.ts`（本批，2 用例，逐条见该手册）。真实断言：锚点下标 1/2（测试 `:23-24`）、空组 undefined（`:28`）。

未覆盖：护栏落盘、`--out`、窗口优先级、`header` 省略、`writeFileTo`。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行；断言均为静态读取。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 三路输出/护栏 | 已证实 | `:22-110` 逐行读 |
| 锚点 turn 不含本体 | 已证实 | `:51-52`（+1） |
| 护栏默认 50KB/回执形状 | 已证实 | `:20,71-91` |
| 写路径无沙箱 | 已证实 | `:58,73,106-110` |
| 写失败冒泡 | 推断 | 无 catch |
| selectTurns/renderTranscriptMarkdown 内部 | 未知 | session-core 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `findAssistantAnchorTurnIndex` | §2-3 | 100-104 | covered |
| 窗口解析/优先级 | §3 | 38-53 | covered |
| 护栏/落盘/stdout 三路 | §3, §6 | 63-95 | covered |
| `writeFileTo` | §2, §5 | 106-110 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
