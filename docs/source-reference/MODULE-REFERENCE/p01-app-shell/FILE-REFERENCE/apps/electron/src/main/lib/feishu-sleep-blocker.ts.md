---
path: apps/electron/src/main/lib/feishu-sleep-blocker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 905e9e128da7c5ddaa90c0d1b9c3c0d9bdc6c1b3
sha256: 2e38e18fcc99bde81f567870a609c59a650f7f6fd14467239b27371b2e468514
lines: 30
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu-sleep-blocker.ts

## 1. 结论与边界

**飞书实时同步防休眠的 Electron 适配层**（30 行）：把 `AppSettings.feishuSessionMirror` 的设置同步到 `powerSaveBlocker`，飞书实时同步（`mode === 'stream'`）期间阻止系统自动休眠。

边界：同步策略判定（`shouldPreventSleepForFeishuSync`）与状态机在 `./feishu/sleep-blocker`（域外依赖），本文件只提供 Electron `powerSaveBlocker` 适配器与两个导出包装（异常兜底记日志）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `syncFeishuSyncSleepBlocker` | 导出函数 | 16-22 | `(settings: Pick<AppSettings, 'feishuSessionMirror'>): void` | 按设置同步防休眠状态 |
| `stopFeishuSyncSleepBlocker` | 导出函数 | 24-30 | `(): void` | 关闭防休眠 |
| `electronSleepBlocker` | 内部常量 | 6-12 | `SleepBlockerAdapter`：start/stop/isStarted 映射 `powerSaveBlocker` | 适配器；`start(type)` 返回 `number` id |
| `blocker` | 内部常量 | 14 | `new FeishuSyncSleepBlocker(electronSleepBlocker)` | 模块级单例 |

导出计数：`export` 2 条（`:16`、`:24`），与源码一致。

## 3. 内部逻辑与关键流程

- `syncFeishuSyncSleepBlocker`（`:16-22`）：`try { blocker.sync(settings) } catch { console.error('[飞书防休眠] 同步状态失败:', error) }`——异常仅记日志不重抛。
- `stopFeishuSyncSleepBlocker`（`:24-30`）：`try { blocker.stop() } catch { console.error('[飞书防休眠] 关闭失败:', error) }`，同样吞异常。
- 被包装的域外状态机 `./feishu/sleep-blocker`（`feishu/sleep-blocker.ts:17-52`，本轮已读）：
  - `sync(settings)`：`shouldPreventSleepForFeishuSync(settings)`（`sleep-blocker.ts:11-15`，即 `feishuSessionMirror?.mode === 'stream'`）为真 → `start()`，否则 `stop()`（`:22-29`）。
  - `start()`（`:43-51`）：已有 `activeBlockerId` 且 `isStarted` → 幂等返回；否则 `adapter.start('prevent-app-suspension')` 记 id。
  - `stop()`（`:31-41`）：id 为 null → 直接返回；否则清 id 后若 `isStarted(id)` 再 `adapter.stop(id)`。
  - `SleepBlockerType` 字面量仅 `'prevent-app-suspension'`（`sleep-blocker.ts:3`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep` `feishu-sleep-blocker|syncFeishuSyncSleepBlocker|stopFeishuSyncSleepBlocker`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:449` import；`ipc.ts:2205`：`SETTINGS_IPC_CHANNELS.UPDATE` handler 中当 `updates.feishuSessionMirror !== undefined` 时 `syncFeishuSyncSleepBlocker(result)`；`ipc.ts:2308`：`SETTINGS_IPC_CHANNELS.UPDATE_SYNC`（`ipcMain.on`，beforeunload 场景）同样条件调用。
  - `apps/electron/src/main/index.ts:237` import；`index.ts:1046` 启动流程 `safeRun('syncFeishuSyncSleepBlocker', () => syncFeishuSyncSleepBlocker(getSettings()))`；`index.ts:1277` 退出流程（before-quit 清理序列）`stopFeishuSyncSleepBlocker()`。
- 出向：`electron.powerSaveBlocker`（`:1`，`:7-11`）；`./feishu/sleep-blocker` 的 `FeishuSyncSleepBlocker`/类型（`:3-4`）；`../../types` 的 `AppSettings` 类型（`:2`）。

## 5. 数据 I/O、读写与副作用

- 输入：`settings.feishuSessionMirror`（设置对象由调用方传入）；输出：`void`。
- 磁盘/JSON/网络：无。
- 副作用：`powerSaveBlocker.start('prevent-app-suspension')` / `.stop(id)`（系统级阻止自动休眠；`sleep-blocker.ts:50` 注释明确「允许息屏锁屏」）；`console.error`/`console.log` 日志（本文件 `:20`、`:28`；域外 `sleep-blocker.ts:39`、`:50`）。

## 6. 分支、失败、取消与恢复

- 本文件分支：仅 try/catch 两处（`:18-21`、`:26-29`），失败→`console.error` 吞掉，**不回滚已启动的 blocker**。
- 幂等：`FeishuSyncSleepBlocker.start/stop` 自带幂等（`sleep-blocker.ts:44-47`、`:32-35`）；重复 `sync` 不会叠加多个 blocker。
- 重启/恢复：`activeBlockerId` 是 `blocker` 模块级内存态，主进程重启即丢失；`index.ts:1046` 启动时按设置重新 `sync` 兜底，退出时 `index.ts:1277` 显式 `stop`。
- 不可恢复点：无（系统 blocker 由 Electron 管理，进程退出自动释放——Electron 平台语义，推断）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查。
- 权威状态：`AppSettings.feishuSessionMirror.mode`（由设置服务持久化，经 `updateSettings` 返回值传入 `ipc.ts:2205`）；本文件不校验来源。

## 8. 修改影响面

- 调用方：`ipc.ts:2205`（`settings:update`）、`ipc.ts:2308`（`settings:update-sync`）、`index.ts:1046/1277`（启动/退出）。
- 类型：`AppSettings.feishuSessionMirror`（`../../types`）字段变动需同步 `Pick<...>` 签名。
- 适配器契约：`SleepBlockerAdapter`（`sleep-blocker.ts:5-9`）；改 `SleepBlockerType` 需同步 Electron `powerSaveBlocker.start` 参数。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep` `feishu-sleep-blocker|syncFeishuSyncSleepBlocker|stopFeishuSyncSleepBlocker`，仅命中 `ipc.ts`/`index.ts` 两个生产文件，无 `*.test.ts` 引用。
- 间接证据：无。
- `NOT_RUN`：未运行任何测试；`bun test`/产品测试/typecheck/build/Electron-GUI 均 NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出签名与 try/catch 吞异常 | 已证实 | `feishu-sleep-blocker.ts:16-30` |
| `mode === 'stream'` 才开启防休眠 | 已证实 | `feishu/sleep-blocker.ts:11-15` |
| start/stop 幂等语义 | 已证实 | `feishu/sleep-blocker.ts:31-51` |
| 调用点 5 处（ipc 2 + index 2 + import） | 已证实 | `ipc.ts:449,2205,2308`；`index.ts:237,1046,1277` |
| 进程退出自动释放系统 blocker | 推断 | Electron 平台语义，非本仓源码证据 |
| `powerSaveBlocker` 在目标平台的实际行为 | 未知 | NOT_RUN，需真机验证 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `syncFeishuSyncSleepBlocker` | §3/§4 | 16-22 | covered |
| `stopFeishuSyncSleepBlocker` | §3/§4 | 24-30 | covered |
| `electronSleepBlocker` 适配器 | §2/§3 | 6-12 | covered |
| `FeishuSyncSleepBlocker` 状态机 | §3 | sleep-blocker.ts:17-52 | covered（跨文件） |
| 退出清理路径 | §6 | index.ts:1277 | covered |
| 系统级休眠实际效果 | §10 | — | unknown（NOT_RUN） |
