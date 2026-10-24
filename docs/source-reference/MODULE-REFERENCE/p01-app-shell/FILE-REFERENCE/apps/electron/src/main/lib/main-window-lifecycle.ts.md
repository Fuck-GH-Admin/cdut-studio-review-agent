---
path: apps/electron/src/main/lib/main-window-lifecycle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 05c27bc3b93f583a5adde49270cf7467be3f1232
sha256: 71ac9670d91e0f29ada485aed219b9b9284e645d6d9f5d06bba7c055e1c3e094
lines: 76
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/main-window-lifecycle.ts

## 1. 结论与边界

主窗口生命周期的两个纯帮助函数：①提取可持久化窗口状态（全屏/最大化时只存普通 bounds）；②macOS 关闭窗口后的"隐藏而非退出"延迟隐藏流程（76 行）。

**边界**：不管理窗口创建/销毁，不写配置文件（持久化由调用方完成），不做跨平台 hide 策略（仅 macOS 语义，由调用方选择调用）。两个函数均为纯内存/窗口 API 操作，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MainWindowStateReadable` | 接口（导出） | 10-16 | `isDestroyed/isMaximized/isFullScreen/getBounds/getNormalBounds` | 可读窗口视图 |
| `MacCloseWindowController` | 接口（导出） | 18-24 | `isDestroyed/isFullScreen/setFullScreen/once('leave-full-screen')/hide` | 隐藏流程所需窗口面 |
| `MacCloseAppController` | 接口（导出） | 26-28 | `hide(): void` | app 面 |
| `ScheduleFn` | 类型（导出） | 30 | `(callback, delayMs) => unknown` | 可注入调度器 |
| `FULL_SCREEN_HIDE_DELAY_MS` | 常量（内部） | 32 | `= 160` | 离全屏后延迟 hide |
| `FULL_SCREEN_HIDE_FALLBACK_DELAY_MS` | 常量（内部） | 33 | `= 1000` | 兜底延迟 hide |
| `getPersistableMainWindowState` | 函数（导出） | 38-50 | `(win: MainWindowStateReadable) => MainWindowState \| null` | 可持久化状态提取 |
| `hideMacMainWindowAfterClose` | 函数（导出） | 52-76 | `(win, app, schedule = setTimeout) => void` | 全屏感知的隐藏流程 |

导出合计 6（3 接口 + 1 类型 + 2 函数）；内部符号 3（`WindowBounds` 接口（未导出，`:3-8`）、2 个延迟常量）。

## 3. 内部逻辑与关键流程

1. **getPersistableMainWindowState**（`:38-50`）：`isDestroyed()` → `null`（`:39`）；`isMaximized` 取自 `win.isMaximized()`（`:41`）；`bounds = (isMaximized || win.isFullScreen()) ? win.getNormalBounds() : win.getBounds()`（`:42`）——全屏/最大化时只取普通 bounds，避免把全屏 Space 尺寸写入配置（注释 `:35-37`）；返回 `{width,height,x,y,isMaximized}`（`:43-49`），不含全屏标志。
2. **hideMacMainWindowAfterClose**（`:52-76`）：闭包 `hideWindowAndApp`（`:58-64`）用 `didHide` 单次守卫（`:57`、`:59`），再查 `win.isDestroyed()`（`:60`，destroyed 时 return 且不置 didHide），否则 `win.hide(); app.hide()`（`:62-63`）。
3. 非全屏：立即 `hideWindowAndApp()` 并 return（`:66-69`）。
4. 全屏：`win.once('leave-full-screen', () => schedule(hideWindowAndApp, 160))`（`:71-73`）→ `win.setFullScreen(false)` 主动退全屏（`:74`）→ `schedule(hideWindowAndApp, 1000)` 兜底（`:75`）。两条路径（事件+定时）竞争由 `didHide` 去重，先到者执行、后者空转。

## 4. 调用者与调用链

- 入向（全冻结树检索 `main-window-lifecycle`）：
  - `apps/electron/src/main/lib/planning-window.ts:5`（import）→ `:74` `getPersistableMainWindowState(win)`。
  - `apps/electron/src/main/lib/cslab/cslab-window-manager.ts:19`（import）→ `cslab-window-manager.ts:101` `getPersistableMainWindowState(win)`。
  - `hideMacMainWindowAfterClose` **冻结树内零调用者**（检索范围：baseline/source 全树 grep `hideMacMainWindowAfterClose`/`main-window-lifecycle`，命中仅本文件定义与上述 2 处 import 行；无测试引用）。
- 出向：仅类型导入 `MainWindowState`（`../../types` `:1`）；运行时调用窗口/app 对象方法，无业务模块依赖。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：全文无 fs/net 引用；返回值由调用方决定是否持久化）。副作用：`win.hide()`/`app.hide()`（`:62-63`）、`win.setFullScreen(false)`（`:74`）、注册一次性 `leave-full-screen` 监听（`:71`）、定时器调度（`:72`/`:75`）。无全局状态。

## 6. 分支、失败、取消与恢复

- `getPersistableMainWindowState`：destroyed→`null`（`:39`）；最大化/全屏→getNormalBounds 分支（`:42`）。
- `hideMacMainWindowAfterClose`：`didHide` 防重入（`:59`）；destroyed 检查（`:60`）；非全屏短路（`:66-69`）；全屏走事件+双定时竞争（`:71-75`）。
- 无 throw/错误码/用户文案（不适用，依据：全文无 throw）。
- 恢复：`didHide` 保证 hide 至多执行一次；`schedule` 可注入（测试/超时控制），默认 `setTimeout`。定时器不取消（1000ms 兜底若窗口已 hide 则 `didHide` 空转）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；窗口状态读取基于传入对象接口（结构型），权威状态（最大化/全屏）由 Electron BrowserWindow 提供。

## 8. 修改影响面

- `getPersistableMainWindowState` 的返回形状即 `MainWindowState` 配置形状：影响 `planning-window.ts:74`、`cslab-window-manager.ts:101` 两处的窗口状态持久化；改字段名会波及配置读取方（`../../types` 的 `MainWindowState`）。
- `hideMacMainWindowAfterClose` 当前无调用者，改动无现存运行影响，但它是 macOS "关窗不退出"策略的预留实现，删除前需确认产品意图（未知）。
- 需同步修改的测试：冻结树内无本文件测试（见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `main-window-lifecycle`/`hideMacMainWindowAfterClose`/`getPersistableMainWindowState` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：无（两处调用方各自测试未在检索中暴露本函数断言）。

`NOT_RUN`：本轮未运行任何测试；无断言可读。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两函数全部分支/守卫/竞争去重语义 | 已证实 | `:1-76` 全文逐行 |
| 入向=planning-window.ts:74、cslab-window-manager.ts:101 | 已证实 | 全树检索 `main-window-lifecycle` |
| `hideMacMainWindowAfterClose` 零调用者 | 已证实 | 全树检索（`hideMacMainWindowAfterClose` 仅 `:52` 定义） |
| 未来接线意图 | 未知 | 无代码连接，不能推断"不存在需求" |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MainWindowStateReadable`/`MacCloseWindowController`/`MacCloseAppController`/`ScheduleFn`/`WindowBounds` | §2 | 3-30 | covered |
| `getPersistableMainWindowState` | §3.1/§8 | 38-50 | covered |
| `hideMacMainWindowAfterClose`（didHide/全屏分支/双定时） | §3.2-3.4/§6 | 52-76 | covered |
| 调用者与零调用否定 | §4/§9 | - | covered |
