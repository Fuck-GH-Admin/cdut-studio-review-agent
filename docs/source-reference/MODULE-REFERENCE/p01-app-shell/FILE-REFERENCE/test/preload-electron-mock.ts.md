---
path: test/preload-electron-mock.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 50744dccd3048bc32d86ab19876c61dd09816ec3
sha256: 8c275f5d87494bbb9e45013e322bb64490b97f355a0cab10d07acfa8ef0bc6f1
lines: 192
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# test/preload-electron-mock.ts

## 1. 结论与边界

**bun test 全局 preload：统一 electron mock**（192 行 TS）：经 `bunfig.toml [test].preload` 在任何测试加载源码前拦截 `electron` 模块，消除「测试各自 `mock.module('electron')` 因 bun 模块缓存执行顺序失效」问题（头注释 `test/preload-electron-mock.ts:1-10`）。契约（`:12-21`）：源码新增 electron API 使用必须同步更新本 mock，否则显性报错或空实现假通过；`app.getVersion` 等值须与 electron 版本保持一致（`:15`）；**--isolate 下测试文件对已 mock 的 'electron' 二次 `mock.module` 不生效**（`:17-18`），窗口/快捷键类测试必须经 `globalThis.__proferElectronTestHooks` 取状态（`:19-21`）。边界：仅测试基建，不进生产包；不模拟真实 electron 行为语义（多为占位/记录）。

## 2. 导出与关键符号

无导出（全局 preload 副作用模块）：唯一导入是 `import { mock } from 'bun:test'`（`test/preload-electron-mock.ts:23`）；export 计数 0。
- 全局符号 `globalThis.__proferElectronTestHooks`（类型声明 `:28-44`，初始化 `:46-59`）：`createdWindows`（窗口记录）、`registeredAccelerators`（快捷键记录）、`exposedApi`（`contextBridge.exposeInMainWorld` 暴露记录）、`ipcRendererInvoke`（invoke 委托，测试自赋值）、`ipcMainHandlers`（Map，权限/路径测试用）、`reset()`（`:52-58` 清空五者）。
- `MockBrowserWindow`（内部类，`:62-86`）：构造即登记 `createdWindows`（`:68`）；实例方法 `isDestroyed`/`destroy`/`isVisible`/`show`/`hide`/`focus`/`setBounds`/`restore`/`isMinimized(恒 false)`/`loadURL`/`loadFile`（均 resolve）/`on`/`once`（`:71-83`）；静态 `getAllWindows(): []`、`fromWebContents(): undefined`（`:84-85`）；`webContents = { send, once, on }` 空实现（`:65`）。
- `mock.module('electron', …)` 注册面（`:88-192`，23 个顶层 API 键）：`app`（`:89-99`：getPath ''/isPackaged false/getVersion '43.0.0'/getName 'Profer'/whenReady/on/once/quit/setAppUserModelId）、`BrowserWindow`（`:100`）、`net`（`:104-106`：`fetch` 恒 `Promise.reject('net.fetch 未在测试中实现')`）、`View`/`WebContentsView`（空类，`:107-108`）、`session`（`:109-112`）、`globalShortcut`（`:113-125`：register 登记返回 true、unregister 摘除、unregisterAll 清空）、`clipboard`（`:126-129`）、`contextBridge`（`:133-137`：exposeInMainWorld → `exposedApi[key]`）、`ipcRenderer`（`:138-146`：invoke 走 `ipcRendererInvoke` 委托，无委托 `Promise.reject('ipcRenderer.invoke 未在测试中实现（<channel>）')`；on/send 空）、`dialog`（`:147`：showMessageBox `{response:0}`、showOpenDialog `{canceled:true,filePaths:[]}`）、`ipcMain`（`:148-156`：handle/removeHandler 操作 `ipcMainHandlers`）、`Menu`（`:157-160`）、`nativeImage`（`:161-164`）、`nativeTheme`（`:165-167`）、`Notification`（`:168`）、`powerMonitor`（`:169-171`）、`powerSaveBlocker`（`:172-175`）、`safeStorage`（`:176-180`：isEncryptionAvailable false、encrypt/decrypt 为 Buffer 直通）、`screen`（`:181-185`：1920×1080 固定几何）、`shell`（`:186-189`）、`systemPreferences`（空对象，`:190`）、`Tray`（`:191`）。

## 3. 内部逻辑与关键流程

按模块加载顺序（`test/preload-electron-mock.ts:23-192`）：
1. 导入 bun test 的 `mock`（`:23`）。
2. `declare global` 声明 hook 形状（`:28-44`，类型层无运行时动作）。
3. 初始化 `globalThis.__proferElectronTestHooks` 并附 `reset`（`:46-59`）：状态变化=全局对象被赋值；`reset()` 清空 createdWindows/registeredAccelerators/exposedApi/ipcRendererInvoke/ipcMainHandlers（`:52-58`）。
4. 定义 `MockBrowserWindow` 类（`:62-86`）：构造登记实例（`:67-69`）；类内仅状态位与空操作，无短路。
5. `mock.module('electron', factory)` 替换模块（`:88-192`）：factory 返回 23 键对象（§2）。handler 级分支仅两处——`ipcRenderer.invoke` 无委托时 reject（`:140-141`）、`globalShortcut.unregister` 命中才 splice（`:119-120`）。
返回值：无（模块顶层副作用）；短路条件：无顶层分支。

## 4. 调用者与调用链

- 入向（grep 冻结树 `preload-electron-mock`）：
  - `bunfig.toml:7` `preload = ["./test/preload-electron-mock.ts"]`（根测试套件）；`apps/electron/bunfig.toml:5` `preload = ["../../test/preload-electron-mock.ts"]`（electron 包测试套件）。
  - `.github/workflows/review-batch-tests.yml:10` paths 触发器点名本文件。
  - 测试文件按路径引用：`apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts:99`、`apps/electron/src/main/lib/review/review-tombstone-index-scale.p04.test.ts:96`（`fileURLToPath` 解析 preload 路径）。
  - hook 消费（`globalThis.__proferElectronTestHooks`）：`apps/electron/src/main/lib/global-shortcut-service.test.ts:27,35` 等 11 个测试文件（grep `__proferElectronTestHooks` 命中 12 文件=本文件+11 个测试文件，清单含 `review-ipc-path.test.ts`、`review-pi-run-bridge.main.test.ts`、`review-v3-main-b20-electron-ipc.test.ts` 等）；`apps/electron/src/main/lib/global-shortcut-service.test.ts:10` 注释声明类型与本文件保持一致。
- 出向：`bun:test` 的 `mock`（`test/preload-electron-mock.ts:23`）；`mock.module('electron', …)` 目标模块（`:88`）。无其他 import/require。

## 5. 数据 I/O、读写与副作用

无磁盘/网络读写点，依据：`test/preload-electron-mock.ts:1-192` 全文无 `fs`/`fetch`/`process` 引用。副作用= bun 模块系统内替换 `'electron'`（`:88`）+ 挂载 `globalThis.__proferElectronTestHooks`（`:46`）；`createdWindows`/`registeredAccelerators`/`exposedApi`/`ipcMainHandlers` 为测试可变记录（`:47-51`）。幂等：`reset()` 可恢复初始状态（`:52-58`）；mock 注册随模块加载一次。

## 6. 分支、失败、取消与恢复

- 显性失败契约：`net.fetch` 恒 reject（`test/preload-electron-mock.ts:105`）与 `ipcRenderer.invoke` 无委托时 reject（`:141`）——把「测试未实现的通道」显式暴露而非静默空转（头注释 `:13-14` 的显性报错侧）。
- handler 分支：`globalShortcut.unregister` 仅命中索引 ≥0 才摘除（`:119-120`）；`reset()` 无条件清空（`:52-58`）。
- 无 exit code/错误码；无取消机制（不适用，依据：无异步资源与信号处理）。失败后状态：reject 由测试自行捕获；记录数组可经 `reset()` 恢复。
- 隐性假通过风险（契约明示，`:14`）：如 `dialog: {}` 空实现会让未实现 API 的测试静默通过——本文件 dialog 已给具体返回值（`:147`），但 `systemPreferences: {}`（`:190`）等空壳仍属此类风险面。

## 7. 权限与权威状态

无权限分支，依据：`test/preload-electron-mock.ts:1-192` 无 env、凭据、token 读取；`safeStorage.isEncryptionAvailable` 恒 false 且 encrypt/decrypt 为 Buffer 直通（`:176-180`）为假实现，不提供真实加密权威。版本权威契约：`app.getVersion` 返回 `'43.0.0'`（`:92`），注释 `:15` 要求与 electron 版本一致；冻结树内 `apps/electron/electron-builder.yml:9` `electronVersion: 43.2.0`、`apps/electron/package.json:156` `"electron": "^43.2.0"`（注释所称 package.json 的 electronVersion 键实际位于 electron-builder.yml）——字面 43.0.0 ≠ 43.2.0，语义一致性判定未知（未运行验证）。

## 8. 修改影响面

- 全部 bun 测试的 electron 依赖面（根与 apps/electron 两套 bunfig preload，`bunfig.toml:7`、`apps/electron/bunfig.toml:5`）；新增 electron API 使用必须同步本 mock（契约 `:12-15`、`:102-103`）。
- hook 形状（`:28-44`）变化影响 11 个消费测试文件（§4 清单），其中 `global-shortcut-service.test.ts:12-14` 复制了类型声明（双处同步）。
- `mock.module('electron')` 二次覆盖不可行（`:17-18`），测试行为调整只能改本文件或走 hooks。
- CI 联动：`.github/workflows/review-batch-tests.yml:10` 的 paths 触发。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。本文件为测试基建，自身无用例（`it(`/`test(` 计数 0）。间接证据（标「间接」）：消费 hooks 的测试真实断言——`apps/electron/src/main/lib/global-shortcut-service.test.ts:27` 读取 `globalThis.__proferElectronTestHooks.registeredAccelerators`、`:35` 调 `reset()`、`:43` `expect(ok).toBe(true)`；`review-owner-index-recovery.p06-fix01.test.ts:99` 与 `review-tombstone-index-scale.p04.test.ts:96` 以 preload 路径构造隔离 bun 进程（间接引用本文件）。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出、23 键 mock 面、hooks 五字段、MockBrowserWindow 方法面 | 已证实 | `test/preload-electron-mock.ts:1-192` 全文 |
| --isolate 二次 mock 失效契约与显性失败设计 | 已证实 | `:13-21`、`:105`、`:141` |
| 入向 4 类消费（bunfig/CI/路径引用/hooks） | 已证实 | `bunfig.toml:7`、`apps/electron/bunfig.toml:5`、`.github/workflows/review-batch-tests.yml:10`、§4 列表 |
| getVersion '43.0.0' 与 electronVersion 43.2.0 字面不等 | 已证实 | `:92`、`apps/electron/electron-builder.yml:9` |
| 版本值语义一致性影响 | 未知 | NOT_RUN，无运行校验 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `__proferElectronTestHooks` 声明+初始化+reset | §2/§3 | 28-59 | covered |
| `MockBrowserWindow` 全方法面 | §2/§3 | 62-86 | covered |
| `app`/`BrowserWindow`/`net`/`View`/`WebContentsView`/`session` | §2 | 89-112 | covered |
| `globalShortcut`/`clipboard`/`contextBridge`/`ipcRenderer` | §2/§6 | 113-146 | covered |
| `dialog`/`ipcMain`/`Menu`/`nativeImage`/`nativeTheme` | §2 | 147-167 | covered |
| `Notification`/`powerMonitor`/`powerSaveBlocker`/`safeStorage`/`screen`/`shell`/`systemPreferences`/`Tray` | §2 | 168-191 | covered |
| 入向消费链 | §4 | - | covered |
| 版本一致性 | §7/§10 | 92,15 | partial |
| 运行验证 | §10 | - | unknown（NOT_RUN） |
