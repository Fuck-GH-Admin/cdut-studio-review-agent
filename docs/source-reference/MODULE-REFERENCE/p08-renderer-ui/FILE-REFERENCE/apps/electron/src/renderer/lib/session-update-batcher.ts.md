---
path: apps/electron/src/renderer/lib/session-update-batcher.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0e220f3f71f8e44a904cb3f131f4a8499912092d
sha256: a2165e7e07b4508a26cd44217aca71181bd7f623af19176c78eff034069cd714
lines: 59
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/session-update-batcher.ts

## 1. 结论与边界

把同一帧内同一会话的高频更新合并为一次 `flush` 提交（`session-update-batcher.ts:6-9` 注释）：工厂函数 `createSessionUpdateBatcher` 返回按 `sessionId` 独立排队的批处理器（每个 session 一条队列+一个调度句柄，不会跨会话混合）。

边界：不理解 update 语义（泛型 `T` 原样透传）；不持久化、不跨窗口；调度器可注入（默认 `requestAnimationFrame`/`setTimeout(16)`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SessionUpdateBatcherOptions` | interface | 1-4 | `{schedule?, cancel?}` | 可注入调度器 |
| `createSessionUpdateBatcher` | 函数 | 10-59 | `<T>(flush, options?) => {enqueue, flush, flushAll, cancel}` | 工厂 |

导出计数 2（`export` 逐条核：interface 1、function 1）。关键内部：`pending: Map<string, T[]>`（`:14`）、`scheduled: Map<string, number>`（`:15`）、默认 `schedule`（`:16-19`，rAF 优先、退化 `setTimeout(16)`）、默认 `cancel`（`:20-23`，`cancelAnimationFrame`/`clearTimeout`）、`flushSession`（`:25-35`）。返回对象 4 方法：`enqueue`（`:38-45`）、`flush`（`:46-48`）、`flushAll`（`:49-51`）、`cancel`（`:52-57`）。

## 3. 内部逻辑与关键流程

- `enqueue(sessionId, update)`（`:38-45`）：`pending` 该会话数组 `push`（`:39-41`）；若 `scheduled` 无句柄则 `schedule(() => flushSession(sessionId))` 并登记（`:42-44`）——每会话**至多一个**待处理句柄，同帧多次 enqueue 只合并进同一数组。
- `flushSession(sessionId)`（`:25-35`）：① 有句柄先 `cancel` 并从 `scheduled` 移除（`:26-30`）；② `pending` 无记录或数组为空 → 直接 return（`:31-32`）；③ `pending.delete` 后调用外部 `flush(sessionId, updates)`（`:33-34`），一次性把整批交出。
- `flush(sessionId)`（`:46-48`）：同步执行 `flushSession`——用于终态前强制提交最后一批（调用方语义见 §4）。
- `flushAll()`（`:49-51`）：遍历 `pending.keys()` 逐会话 `flushSession`；迭代中 `pending.delete` 当前项，JS Map 迭代器对此安全（行为已证实于代码结构 `:50`+`:33`，不跨会话混合）。
- `cancel(sessionId)`（`:52-57`）：取消句柄（`:53-54`）并删 `scheduled`/`pending` 两项（`:55-56`）——**丢弃**该会话未提交更新。
- 调度语义：默认 `schedule` 只有在「无 pending 句柄」时才被调用（`:42`），flushSession 完成/取消后句柄槽清空（`:29,:55`），下一次 enqueue 重新调度。

## 4. 调用者与调用链

入向（grep 全冻结树，`createSessionUpdateBatcher|session-update-batcher`）：
- `useGlobalAgentListeners.ts:79` import；`:419` `liveMessageBatcher = createSessionUpdateBatcher<SDKMessage>`（flush 回调逐条 `upsertLiveMessageByUuid` 后写 `liveMessagesMapAtom`，`:420-430`）；`:432` `streamStateBatcher = createSessionUpdateBatcher<AgentEvent>`（flush 回调 `reduce(applyAgentEvent)` 后写 `agentStreamingStatesAtom`，`:433-444`）。注释 `:415-418` 说明「终态入口会主动 flush，保证最后一帧不丢」。
- 真实调用点：`enqueue` `:937`（消息）、`:973`（流事件）；`flush` `:975`（流事件终态分支）、`:1417-1418`、`:1641-1642`（会话终止/清理入口）；`flushAll` `:1827`。
- `session-update-batcher.test.ts:2,8,30`（测试）。

出向：无 import（纯实现，`session-update-batcher.ts:1-59` 无 import 语句）；仅调用注入/默认的 `schedule`/`cancel` 与外部 `flush` 回调。

## 5. 数据 I/O、读写与副作用

- 输入/输出：`enqueue` 入队任意 `T`；`flush` 回调收到 `(sessionId, updates: readonly T[])`，顺序保持入队序（数组 push，`:40`）。
- 内存状态：实例私有 `pending`/`scheduled` 两个 Map（`:14-15`），随实例生命周期存在。
- 副作用：调度帧回调（rAF/定时器）；外部 `flush` 的副作用由调用方决定（atom 写入，`useGlobalAgentListeners.ts:420-444`）。无磁盘/网络。
- 并发交错：会话间完全隔离（独立数组+独立句柄）；同会话内 enqueue/flushSession 交错由「每会话单句柄」保证不重入（`:42-44`）。

## 6. 分支、失败、取消与恢复

- 分支：`:27` 句柄存在→取消；`:32` 空批短路（不调用外部 flush）；`:42` 无句柄才调度；`:17-18`/`:21-22` rAF 可用性分支。
- `cancel(sessionId)`（`:52-57`）= 丢弃路径：过期会话更新不落库（测试 `session-update-batcher.test.ts:41-44` 断言 cancel 后 flush 不产生提交）。
- 失败恢复：外部 `flush` 抛错时 `pending` 已删除（`:33` 先 delete 后调用），该批丢失且无重试——不可恢复点（已证实于代码顺序）。
- 脆弱点（推断）：`options.schedule`/`cancel` 是独立可选项（`:2-3`），只注入其一会造成句柄语义错配（如自定义 schedule 返回 setTimeout 句柄但 cancel 用默认 rAF 取消）；当前调用方均整体使用默认（`useGlobalAgentListeners.ts:419,432` 未传 options），测试成对注入（`session-update-batcher.test.ts:10,32`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。会话归属由调用方以 `sessionId` 参数决定；本模块不校验 sessionId 合法性（空字符串同样成队）。

## 8. 修改影响面

- 直接影响 `useGlobalAgentListeners.ts` 两条流：Agent SDK 实时消息合并（`:419-430`）与流状态合并（`:432-444`），涉及 `liveMessagesMapAtom`/`agentStreamingStatesAtom` 的写入频率与最终帧完整性。
- 改调度语义（如改 16ms 定时）影响消息延迟与「终态 flush」时序（`:975,:1417-1418,:1641-1642,:1827` 依赖 flush/flushAll 的同步性）。
- 需同步修改的测试：`session-update-batcher.test.ts`（2 用例，§9）。

## 9. 测试证据

- 直接测试文件：`apps/electron/src/renderer/lib/session-update-batcher.test.ts`（见其手册）。要点：2 用例——①「合并同一 session 的一帧更新，但不混合其他 session」（`session-update-batcher.test.ts:5-25`，断言 `:16` 批前 0 提交、`:19` a 批含两条保序、`:21-24` b 批独立）；②「flush 会在终态前提交最后一批，cancel 会丢弃过期 session 更新」（`:27-45`，断言 `:37`、`:39`、`:44`）。mock 边界：注入 `schedule`/`cancel`（`:10,:32`），`createSessionUpdateBatcher` 本体为真实实现。
- 未覆盖：默认 rAF/`setTimeout(16)` 路径、`flushAll`、`cancel` 不存在的会话、外部 flush 抛错、部分注入错配（见测试手册 §4）。
- 本轮未执行测试：`NOT_RUN`（断言为静态阅读所得，不得视为已运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、4 方法签名如 §2 | 已证实 | `session-update-batcher.ts:1-58` |
| 每会话单句柄合并、不跨会话 | 已证实 | `session-update-batcher.ts:38-45` |
| flush 先删 pending 再回调（失败即丢批） | 已证实 | `session-update-batcher.ts:33-34` |
| cancel 丢弃未提交更新 | 已证实 | `session-update-batcher.ts:52-57` |
| 真实消费者 useGlobalAgentListeners 两处 + 调用点 6 处 | 已证实 | `useGlobalAgentListeners.ts:419,432,937,973,975,1417-1418,1641-1642,1827` |
| 注入错配可致句柄取消失效 | 推断 | `:2-3,:16-23` 结构 |
| 默认调度在生产下实际帧率/延迟 | 未知 | 未运行（NOT_RUN），rAF/定时器实际行为未测 |
| `flushAll` 迭代中删除的安全性 | 已证实（代码结构）+ 未运行验证 | `:49-51`+`:33`；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SessionUpdateBatcherOptions` | §2 | 1-4 | covered |
| `enqueue`（单句柄合并） | §3 | 38-45 | covered |
| `flushSession`（取消句柄/空批短路） | §3/§6 | 25-35 | covered |
| `flush`/`flushAll` | §3 | 46-51 | covered |
| `cancel` | §3/§6 | 52-57 | covered |
| 默认 schedule/cancel | §3/§6 | 16-23 | covered（运行未测） |
| 消费链与调用点 | §4 | - | covered |
| 测试证据 | §9 | - | covered（2 用例） |
