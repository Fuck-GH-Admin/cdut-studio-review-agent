---
path: apps/electron/src/main/lib/ipc-sender-guard.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 695de65086e33271f7afeca9a850aa57cb8d2194
sha256: 79a1e71ee3b16f4c20a0ab6c90f030489f6afde193932803e2fab6c79c1b353e
lines: 59
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/ipc-sender-guard.ts

## 1. 结论与边界

敏感 Agent IPC 的**主进程 sender 来源校验**工具：不依赖 Electron 具体实现（最小接口注入），提供“主窗口 sender”与“主窗口或可信次级窗口 sender”两级守卫（`apps/electron/src/main/lib/ipc-sender-guard.ts:1-5`）。

边界：只做来源校验（sender 身份/存活），不做 payload 校验、不做角色/权限模型；不注册 IPC handler。

## 2. 导出与关键符号

`export` 逐条核对：9 个（接口 3 + 类型 1 + 函数 5）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `IpcSenderLike` | 接口（导出） | 6-8 | `{isDestroyed(): boolean}` | sender 最小面 |
| `MainWindowLike` | 接口（导出） | 10-13 | `{isDestroyed(); webContents: IpcSenderLike}` | 主窗口最小面 |
| `IpcEventLike` | 接口（导出） | 15-17 | `{sender: IpcSenderLike}` | IPC 事件最小面 |
| `MainWindowGetter` | 类型（导出） | 19 | `() => MainWindowLike \| null` | 注入的窗口 getter |
| `isMainWindowSender` | 函数（导出） | 22-27 | `(event, getMainWindow) => boolean` | 主窗口来源判定 |
| `assertMainWindowSender` | 函数（导出） | 30-34 | `(event, getMainWindow) => void` | 非主窗口即 throw |
| `registerTrustedAgentSender` | 函数（导出） | 43-45 | `(sender) => void` | 登记可信次级窗口 webContents |
| `isTrustedAgentSender` | 函数（导出） | 48-52 | `(event, getMainWindow) => boolean` | 主窗口或已登记次级窗口 |
| `assertTrustedAgentSender` | 函数（导出） | 55-58 | `(event, getMainWindow) => void` | 非可信即 throw |

内部：`trustedSecondarySenders`（`WeakSet<object>`，`:40`，注释 `:38-39`：用 WeakSet 防持有窗口引用阻止回收）。

## 3. 内部逻辑与关键流程

`apps/electron/src/main/lib/ipc-sender-guard.ts:22-58`：

1. `isMainWindowSender`（`:22-27`）：`getMainWindow()` 为空或主窗口已销毁 → false（`:24`）；`event.sender.isDestroyed()` 或 `webContents.isDestroyed()` → false（`:25`）；否则 `event.sender === mainWindow.webContents` 引用相等（`:26`）。
2. `assertMainWindowSender`（`:30-34`）：不通过则 `throw new Error('仅允许 Profer 主窗口调用此 Agent IPC')`。
3. `registerTrustedAgentSender`（`:43-45`）：`WeakSet.add`（注释 `:42`：只有主进程创建的窗口才允许登记——由调用纪律保证，工具本身不验证创建来源）。
4. `isTrustedAgentSender`（`:48-52`）：主窗口通过 → true（`:49`）；`event.sender.isDestroyed()` → false（`:50`）；否则查 `trustedSecondarySenders.has`（`:51`）。
5. `assertTrustedAgentSender`（`:55-58`）：不通过 `throw new Error('仅允许主窗口或科学助理窗口调用此 Agent IPC')`。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/ipc.ts`（敏感 Agent IPC handler 守卫）、`apps/electron/src/main/lib/cslab/cslab-window-manager.ts`（可信次级窗口登记侧）、`apps/electron/src/main/lib/review/review-ipc.ts`、`review-ipc-actor-guard.ts`、`review-c0-authority.ts`（review 链复用）。测试：`ipc-sender-guard.test.ts`（仅覆盖主窗口双函数，见 §9）。

出向：无（纯函数 + 模块级 WeakSet）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/IPC。
- 状态：模块级 `trustedSecondarySenders` WeakSet（进程内、随窗口回收）；登记无撤销接口（窗口销毁后 WeakSet 自动弱化，但显式注销不存在——见 §10）。
- 副作用：assert 失败抛错（由调用方 IPC 层转为拒绝）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 主窗口缺失/已销毁 | 24 | false / throw |
| sender 或 webContents 已销毁 | 25,50 | false / throw |
| sender ≠ 主窗口 webContents | 26 | false / throw |
| 已登记次级窗口且未销毁 | 51 | true |
| 未登记 | 51 | false / throw |

- 无异步/无恢复语义；登记后不支持注销（无 `unregister`，静态确认）。
- 两个错误文案固定（`:32`、`:57`），被调用方/测试引用。

## 7. 权限与权威状态

- 本文件是**权限守卫实现**：权威判定 = `event.sender` 与 `mainWindow.webContents` 的引用相等 + WeakSet 登记表。
- 登记权威在主进程（`registerTrustedAgentSender` 的调用纪律“只有主进程创建的窗口才允许登记”，`:42`）；工具不校验该前提（推断性约束）。
- 两级守卫的选用由各 handler 决定（FACT-CHECK：不能借别的 handler 的 assert 暗示本 handler 也验证）。

## 8. 修改影响面

- 改守卫语义影响 `ipc.ts` 敏感 Agent IPC 与 review 三文件的全部受守卫 handler。
- 改接口形状（`IpcSenderLike` 等）影响测试 fake 与 cslab-window-manager 登记调用。
- 无 `unregister`：若需撤销可信窗口，需改本文件或依赖 GC。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/ipc-sender-guard.test.ts` —— 1 describe/1 test（5 条 expect：主窗口通过 true、辅助窗口 false、销毁 sender false、销毁主窗口 false、assert 抛 `仅允许 Profer 主窗口`；详见该测试手册）。**trusted 三函数（`registerTrustedAgentSender`/`isTrustedAgentSender`/`assertTrustedAgentSender`）无任何测试**（测试文件 import 行仅引入 `assertMainWindowSender`/`isMainWindowSender`，`:2`）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行。

缺口（静态判断）：WeakSet 登记/次级窗口放行/销毁次级窗口分支无自动化断言。维护者验证：科学助理窗口调用受守卫 IPC 验证放行，伪造 sender 验证拒绝。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 个导出 | 已证实 | `grep -c '^export'`=9，`:6,10,15,19,22,30,43,48,55` |
| 引用相等 + 三重存活检查 | 已证实 | `:22-27` |
| 两错误文案 | 已证实 | `:32,:57` |
| trusted 三函数无测试 | 已证实 | 测试 `:2` import 面；测试全文 0 引用 |
| 登记纪律（仅主进程创建）靠调用方 | 推断 | `:42` 注释，工具不验证 |
| 无 unregister | 已证实（本文件全文检索） | 仅 `add/has`（`:44,51`） |
| 真实 Electron webContents 行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isMainWindowSender` | §3 | 22-27 | covered |
| `assertMainWindowSender` | §3 | 30-34 | covered |
| `registerTrustedAgentSender` | §3 | 43-45 | covered |
| `isTrustedAgentSender` | §3 | 48-52 | covered |
| `assertTrustedAgentSender` | §3 | 55-58 | covered |
| WeakSet 状态/无注销 | §5,§10 | 40 | covered |
| 测试 | §9 | — | partial（3 函数无测试） |
