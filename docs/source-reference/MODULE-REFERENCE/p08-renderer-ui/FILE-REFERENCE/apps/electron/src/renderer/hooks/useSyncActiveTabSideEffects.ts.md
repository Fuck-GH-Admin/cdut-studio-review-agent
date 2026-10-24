---
path: apps/electron/src/renderer/hooks/useSyncActiveTabSideEffects.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96e56fdcb78838b26cba916fd04aed9366de143a
sha256: a36cc934a934b45509b9e7f058cf392cda2b743e9c22621d845ddadd236c9afe
lines: 26
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useSyncActiveTabSideEffects.ts

## 1. 结论与边界

“激活标签副作用”同步的 React store 绑定（运行时，纯薄包装）：标签页切换/关闭时把 appMode、currentConversationId、currentAgentSessionId、currentAgentWorkspaceId、unviewedCompletedSessionIds 等全局状态同步到新激活标签（文件头注释 `apps/electron/src/renderer/hooks/useSyncActiveTabSideEffects.ts:1-8`）。

边界：语义全部在 `lib/active-tab-side-effects`，本 hook 仅做 store 绑定避免多处漂移（`:6-7` 注释）；不直接 set 任何 atom（经 lib）；不管理标签列表本身。

## 2. 导出与关键符号

`export` 逐条核对：1 类型 + 1 函数 = 2 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SyncActiveTabSideEffects` | 类型（导出） | 15 | `(newActiveTab: TabItem \| null) => void` | 回调形状 |
| `useSyncActiveTabSideEffects` | 函数（导出） | 17-25 | `() => SyncActiveTabSideEffects` | 返回绑定 store 的回调 |

无内部函数。

## 3. 内部逻辑与关键流程

`useStore()` 取 jotai store（`:18`）；`useCallback` 包裹 `(newActiveTab) => syncActiveTabSideEffectsForStore(store, newActiveTab)`（`:20-24`），deps `[store]`（`:24`）——store 稳定则回调稳定。

被委托函数（`apps/electron/src/renderer/lib/active-tab-side-effects.ts:23-80`，交叉读，非本批文件）分支摘要：`null` → 清 conversation/session（`:27-32`）；`chat` → 强制 scratch 模式并清两 id（兼容旧状态，`:34-40`）；`scratch`/`tutorial` → 清 conversation，团队工作区强制退团队视图，否则保留 agent 模式下仍打开的会话（`:42-59`）；agent/browser → `appMode='agent'` + 设 sessionId + 清该会话“已完成未查看”标记 + 按会话 workspaceId 同步工作区并 `updateSettings` 持久化（`:61-79`）。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：

- `hooks/useCloseTab.tsx:37`（import）、`:50`（`const syncActiveTabSideEffects = useSyncActiveTabSideEffects()`）。
- `components/app-shell/left-sidebar/use-left-sidebar.ts:96`（import）、`:347`（同上）。

注释交叉引用：`atoms/tab-group-atoms.ts:12`（说明单点同步把“当前会话”跟到焦点栏）。

出向：`@/lib/active-tab-side-effects` 的 `syncActiveTabSideEffectsForStore`（`:13`，定义 `active-tab-side-effects.ts:23`）；jotai `useStore`（`:11`）；类型 `TabItem`（`@/atoms/tab-atoms`，`:12`）。

## 5. 数据 I/O、读写与副作用

- 本文件写：无（只转调）。副作用全部在被委托函数：写 5 组 atom + `window.electronAPI.updateSettings`（`active-tab-side-effects.ts:27-79`）。不写盘/网络（本文件无 fs/IPC/fetch）。
- 并发/幂等：回调同步执行；幂等性由被委托函数的 set 语义决定。

## 6. 分支、失败、取消与恢复

本文件无分支（除 useCallback 构造）；无失败/取消/恢复路径，依据：同步转调，无异步、无状态、无 try/catch。分支语义见 §3 的被委托函数摘要（其失败行为属 `active-tab-side-effects`，非本文件）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；状态权威在 jotai atom（全局单 store），本 hook 只是取 store 引用。

## 8. 修改影响面

- 调用方 2 处（§4）：`useCloseTab`、`use-left-sidebar`；返回类型变更会破坏二者。
- 语义变更应发生在 `lib/active-tab-side-effects.ts`（单一事实源，`:1-7` 注释）；若改本 hook 的委托目标需同步两处调用方的调用时机。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `useSyncActiveTabSideEffects` 0 命中。间接证据：无（`active-tab-side-effects` 的测试不在本批；未检索到覆盖本 hook 的断言）。

真实断言：不适用。未覆盖：store 绑定、回调稳定性。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI；以上行为均为冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 签名 | 已证实 | `:15-17` |
| 委托 `syncActiveTabSideEffectsForStore` | 已证实 | `:20-24` |
| 被委托函数分支摘要 | 已证实 | `active-tab-side-effects.ts:23-80`（交叉读） |
| 2 个调用方 | 已证实 | `useCloseTab.tsx:37,50`；`use-left-sidebar.ts:96,347` |
| 回调随 store 稳定 | 推断 | deps `[store]`（`:24`）+ jotai store 稳定性约定 |
| 被委托函数运行期表现 | 未知 | NOT_RUN；非本批文件 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SyncActiveTabSideEffects` | §2 | 15 | covered |
| `useSyncActiveTabSideEffects` | §2-3 | 17-25 | covered |
| 委托语义（摘要） | §3 | - | partial（跨文件引用，非本批） |
| 调用方 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
