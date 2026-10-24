---
path: apps/electron/src/main/lib/main-window-state.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a74aceab3ec6f768ef74ab9c2e6f2e49343d6f66
sha256: 83efbd9545c6709e05531a4e25f97c5b9a6b286235b0821b7ec433efba1ea7b0
lines: 11
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/main-window-state.ts

## 1. 结论与边界

主窗口引用的模块级单例存取（11 行）：全 main 进程共享一个 `BrowserWindow | null` 引用槽。纯引用存取，**不含**任何窗口生命周期/焦点/销毁逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getMainWindow` | 函数（导出） | 5-7 | `() => BrowserWindow \| null` | 读当前引用 |
| `setMainWindow` | 函数（导出） | 9-11 | `(window: BrowserWindow \| null) => void` | 写引用 |

内部：模块级 `let mainWindow: BrowserWindow | null = null`（`:3`）。导出合计 2 函数。

## 3. 内部逻辑与关键流程

单行 getter/setter（`:6`/`:10`）：直接返回/赋值模块级变量，无守卫、无事件、无派生状态。首次 import 时初始化为 `null`（`:3`）。

## 4. 调用者与调用链

入向（全冻结树检索 `main-window-state`，共 22 个文件 import（21 静态 + 1 动态 import））：
- 设置方（`setMainWindow`）：`main/index.ts:202`（import 行；主窗口创建时写入）、`apps/electron/scripts/plugin-smoke.ts:14`、`plugin-rpc-smoke.ts:8`（脚本测试环境）、8 个测试文件（`review-v3-legacy-entry-gates.test.ts:9`、`review-pi-run-bridge.main.test.ts:45` 动态 import、`review-v3-main-d4-local-plan.test.ts:12`、`review-v3-main-b20-electron-ipc.test.ts:9`、`review-v3-main-b20-physical-composition.test.ts:11`、`review-ipc-legacy-sender.test.ts:9`、`review-v3-main-author-plan-ipc.test.ts:9`、`review-c0-ipc.test.ts:5`——测试内注入假窗口）。
- 读取方（`getMainWindow`）：`main/ipc.ts:341`、`main/index.ts:202`、`lib/security/executable-open-guard.ts:19`、`lib/cslab/cslab-window-manager.ts:20`、`lib/review/review-ipc.ts:18`、`review-ipc-actor-guard.ts:11`、`review-c0-authority.ts:9`、`review-v3-main-local-product-intake.ts:13`、`review-v3-main-native-removal-observer.ts:16`、`review-v3-main-author-plan-ipc.ts:18`、`review-v3-main-native-archive-registry.ts:16`、`review-v3-main-local-author-workbench.ts:9`（均取当前窗口做 IPC/渲染操作）。
- 出向：仅 `electron` 类型（`:1`）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：全文无 fs/net）。副作用：仅模块级内存变量（`:3`）的读写；进程内共享单例，无锁（单线程事件循环语义）。

## 6. 分支、失败、取消与恢复

无分支（不适用，依据：`:5-11` 无条件语句）。`setMainWindow(null)` 可清引用；销毁窗口后若未清引用，getter 会返回已销毁窗口——是否清理由调用方负责（本文件无 `isDestroyed` 检查，〔证实〕全文）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态=模块级变量当前值；写入点集中在 `main/index.ts` 与测试注入。

## 8. 修改影响面

改本文件会影响全部 22 个 import 方的窗口获取语义（尤其 `ipc.ts:341`、`executable-open-guard.ts:19` 等 IPC 焦点/权限相关路径）；单例换多窗口方案需全量改造上述调用者。测试依赖 `setMainWindow` 注入假窗口（8 处测试），签名变化会破坏这些 fixture。

## 9. 测试证据

直接测试：无专门测试文件（全树检索 `main-window-state` 无专属 test 命中）。间接证据：8 处 review 测试/脚本经 `setMainWindow` 注入 fixture 窗口（§4 列表，`review-pi-run-bridge.main.test.ts:45` 为动态 import），但未对本文件行为本身断言。

`NOT_RUN`：本轮未运行 bun test。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单例存取实现、无守卫、初始 null | 已证实 | `:1-11` 全文逐行 |
| 22 个 import 方与读/写角色 | 已证实 | 全树检索 `main-window-state`（21 静态+1 动态） |
| 窗口销毁后引用是否被清 | 未知 | 未读全部调用方清理逻辑（跨批文件） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 模块级 `mainWindow` | §2/§3/§5 | 3 | covered |
| `getMainWindow` | §2/§3 | 5-7 | covered |
| `setMainWindow` | §2/§3 | 9-11 | covered |
| 调用者矩阵 | §4 | - | covered |
