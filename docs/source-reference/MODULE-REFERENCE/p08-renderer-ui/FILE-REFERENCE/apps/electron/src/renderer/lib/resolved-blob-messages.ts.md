---
path: apps/electron/src/renderer/lib/resolved-blob-messages.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 30897b85368c5b84729409513505d3c81d6e5b35
sha256: b5c3699548767a40c91c43047189f483f7b9e514e5dd516354b90cbfe2268d8a
lines: 29
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/resolved-blob-messages.ts

## 1. 结论与边界

被外部化消息的**完整版覆盖纯函数**：落盘时超限大载荷被搬去 blob、行内只留片段；用户点「加载全文」取回原文后，本层按 uuid 把完整版覆盖回消息流，下游（turn 分组、工具结果查找、任务映射）无需改动（`resolved-blob-messages.ts:1-10`）。

边界：不发起 IPC 取回（写 `resolvedBlobMessagesAtom` 的是 `SDKMessageRenderer.tsx:650`）；不解析 blob 引用表（那是 `@profer/shared` 的 `readSessionBlobRefs`，见 §4）；不管清理（`useCloseTab.tsx:148`、`DataManagementSettings.tsx:705`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `applyResolvedBlobMessages` | 导出泛型函数 | 13-29 | `<T extends object>(messages: T[], overrides: Map<string, unknown>) => T[]` | 按 uuid 覆盖为完整版；无命中保持原数组引用 |

导出计数：1（函数 1）；无内部函数/常量。文件仅 29 行，单一职责（`resolved-blob-messages.ts:1-29`）。

## 3. 内部逻辑与关键流程

`applyResolvedBlobMessages`（`resolved-blob-messages.ts:13-29`）按序：
1. `overrides.size === 0` → 直接返回入参 `messages`（`:17`，零开销短路）。
2. `map` 逐条：取 `message.uuid`，非 string → 原样返回（`:20-21`，无 uuid 不可定位）；`resolved = overrides.get(uuid)`；`!resolved || resolved === message` → 原样返回（`:23`，含「覆盖值即同一对象」情形）；否则 `changed = true` 并返回 `resolved as T`（`:24-25`）。
3. 返回 `changed ? next : messages`（`:28`）——**无任何命中时不换数组引用**（注释 `:27`：避免下游 `useMemo` 无谓失效）。

## 4. 调用者与调用链

入向（全冻结树检索 `resolved-blob-messages`/`applyResolvedBlobMessages`）：
- `components/agent/AgentMessages.tsx:44` 导入；`:685` `resolvedBlobMessagesBySession = useAtomValue(resolvedBlobMessagesAtom)`；`:689` `applyResolvedBlobMessages(allSDKMessagesMerged, resolvedBlobMessages)`——唯一生产消费点（`:682` 注释自述「加载全文」流程）。

出向：无 import（`resolved-blob-messages.ts:1-29` 全文无导入语句）；语义关联（非代码依赖）：
- 数据源 atom `resolvedBlobMessagesAtom`：`atoms/agent-atoms.ts:1059`（`Map<sessionId, Map<uuid, SDKMessage>>`）；写入方 `SDKMessageRenderer.tsx:650`（IPC 取回后写入）、`use-left-sidebar.ts:173`；清理方 `useCloseTab.tsx:148`（删会话项）、`DataManagementSettings.tsx:705`（清空）。
- blob 引用表契约：`packages/shared/src/constants/session-storage.ts:13`（`SESSION_BLOB_REFS_FIELD='_proferBlobs'`）、`:31-41`（`readSessionBlobRefs` 过滤形状不合法条目）——测试文件第 2 组直接测它（见 §9）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用，依据：`resolved-blob-messages.ts:13-29` 纯函数（map/filter 级别），不写 atom/磁盘/网络；副作用边界在调用方（IPC 取回写 atom 见 `SDKMessageRenderer.tsx:650`）。输入输出形状：`T[]` 与 `Map<string, unknown>` → `T[]`；替换为 `Map` 里的引用对象（`:25`），不拷贝（测试 `resolved-blob-messages.test.ts:14` 断言同引用）。

## 6. 分支、失败、取消与恢复

分支：`:17` 空 Map 短路；`:21` 无 uuid；`:23` 无命中/同对象；`:28` changed 门。无 throw、无异步、无取消；`overrides` 值为 `unknown`，命中即强转 `T`（`:25`）——类型层不校验完整版形状（如实记录：错配形状由上游保证，本层不防御）。无持久状态，失败恢复不适用（覆盖数据由 atom 生命周期管理，会话关闭即清 `useCloseTab.tsx:148`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/身份检查；完整版真伪权威在写入方（IPC 取回结果）与存储契约（`session-storage.ts:1-10` 注释自述字段共用常量防缺口事故），本层只做映射。

## 8. 修改影响面

- 改匹配键（uuid）或引用稳定性语义（`:28`）：直接影响 `AgentMessages.tsx:689` 的 `useMemo` 失效行为与消息流渲染；会破坏「切换会话残留覆盖不该重算所有消息」的契约（测试 `resolved-blob-messages.test.ts:23-28` 固定）。
- 泛型签名变更影响唯一调用点 `AgentMessages.tsx:689` 的类型推导。
- 同步测试：`resolved-blob-messages.test.ts`（10 用例，其中 4 例测 shared 的 `readSessionBlobRefs`）。

## 9. 测试证据

直接测试 `apps/electron/src/renderer/lib/resolved-blob-messages.test.ts`（10 个 `test(`，2 个 describe）：
- 「完整版覆盖 · 按 uuid 替换」6 例（`:5-58`）：命中替换保序且同引用（`:13-14` `toEqual`+`toBe(resolvedA)`）、空覆盖同数组引用（`:20` `toBe(messages)`）、有值无命中引用不变（`:27`）、无 uuid 原样保留（`:35-36`）、同对象覆盖引用不变（`:44-45`）、多条命中全部替换（`:56`）。
- 「引用表读取」4 例（`:60-97`）：测 `@profer/shared` 的 `readSessionBlobRefs`（跨模块）——正常逐条读出（`:68-69`）、无表/`null`/字符串空数组（`:73-75`）、坏条目过滤剩 1（`:88-90`）、字段非数组空数组（`:94-95`）。
- mock 边界：无 mock/spy，纯函数直测（`:1-3` 导入仅 `bun:test`、shared、被测模块）。
- 未覆盖：`overrides` 值非对象（如字符串）的类型强转后果；`uuid` 重复消息的覆盖语义。
- NOT_RUN：本轮未执行 `bun test`/typecheck/build/GUI；断言为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出、4 分支语义、引用稳定性契约 | 已证实 | `resolved-blob-messages.ts:13-29` 逐行读 + 测试 `:6-57` |
| 唯一生产消费点 `AgentMessages.tsx:689` 与 atom 生命周期（写/清） | 已证实 | `AgentMessages.tsx:44,682-689`、`agent-atoms.ts:1059`、`useCloseTab.tsx:148`、`DataManagementSettings.tsx:705`、`SDKMessageRenderer.tsx:650`（grep 命中行号） |
| 下游「turn 分组/工具结果查找/任务映射」无需改动 | 推断 | `resolved-blob-messages.ts:5-6` 注释自述，未逐一读下游实现 |
| 覆盖值形状错配时的实际渲染后果 | 未知 | `:25` 无校验，未读 `SDKMessage` 消费端容错 |

NOT_RUN：未运行测试/构建/GUI。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `applyResolvedBlobMessages` 全分支 | §3/§9 | 13-29 | covered |
| 引用稳定性契约 | §3/§8/§9 | 27-28 | covered |
| atom 写/清生命周期 | §4 | — | covered（消费方 file:line） |
| 覆盖值形状错配 | §10 | 25 | unknown |
