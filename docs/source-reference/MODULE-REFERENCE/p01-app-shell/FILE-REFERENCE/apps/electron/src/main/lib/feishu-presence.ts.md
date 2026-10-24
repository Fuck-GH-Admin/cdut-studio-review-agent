---
path: apps/electron/src/main/lib/feishu-presence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9b2f1de41bf4cd5c213aa40fe83499981caa36ec
sha256: 6edf0f8877b181483236f633185b1f694bc1176038119274365d180656d9fb43
lines: 73
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu-presence.ts

## 1. 结论与边界

**进程内「用户在场」判定服务**（73 行，纯内存状态类 + 单例导出）：接收渲染进程上报的活动会话，结合 Electron 窗口状态与系统空闲时间，判定用户是否正在关注某会话；语义约定「在场=不发飞书通知，离开=发飞书通知」（`feishu-presence.ts:6-7` 注释）。

边界：本文件只做判定与状态存储，**不发送任何飞书通知、不落盘、不发网络**；通知决策应由调用方消费 `isUserPresent` 结果（当前全冻结树 0 个生产消费者，见 §4）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `presenceService` | 导出常量 | 73 | `const presenceService = new PresenceService()` | 全进程单例，唯一导出 |
| `PresenceState` | 内部接口 | 14-19 | `{ activeSessionId: string\|null; lastInteractionAt: number }` | 内部在场状态 |
| `SYSTEM_IDLE_TIMEOUT` | 内部常量 | 22 | `= 120`（秒） | 系统空闲阈值 |
| `FOCUS_LOST_TIMEOUT` | 内部常量 | 24 | `= 30_000`（毫秒） | 窗口失焦阈值 |
| `PresenceService` | 内部类 | 26-71 | 见下两行 | 状态容器 + 判定器 |
| `updatePresence` | 内部方法 | 33-36 | `(report: FeishuPresenceReport): void` | 渲染上报写状态 |
| `isUserPresent` | 内部方法 | 47-70 | `(sessionId: string): boolean` | 在场判定 |

导出计数：`export` 1 条（`feishu-presence.ts:73`），与源码逐条核对一致。

## 3. 内部逻辑与关键流程

- **状态初始化**（`feishu-presence.ts:27-30`）：`activeSessionId: null`，`lastInteractionAt: Date.now()`（模块加载时刻）。
- **updatePresence**（`:33-36`）：直接以 `report.activeSessionId` / `report.lastInteractionAt` 覆盖状态两个字段，无校验、无节流。
- **isUserPresent 判定顺序**（`:47-70`，任一条件命中即 `false` 短路）：
  1. `BrowserWindow.getAllWindows()[0]` 取第一个窗口；窗口不存在或 `isDestroyed()` → `false`（`:48-49`）。
  2. `win.isMinimized()` → `false`（`:52`）。
  3. 窗口未聚焦 **且** `Date.now() - lastInteractionAt > 30_000` → `false`（`:55-57`）。未聚焦但 30 秒内有交互仍视为在场。
  4. `powerMonitor.getSystemIdleTime() > 120` → `false`（`:60-61`）；`powerMonitor` 抛错（注释：某些环境下不可用）被 `catch` 静默吞掉（`:62-64`），继续后续判定。
  5. `this.state.activeSessionId !== sessionId` → `false`（`:67`）——后台会话不在场。
  6. 全部通过 → `true`（`:69`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep` `feishu-presence|presenceService|isUserPresent|updatePresence`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:450` `import { presenceService } from './lib/feishu-presence'`。
  - `apps/electron/src/main/ipc.ts:5929` `presenceService.updatePresence(report)`，位于 `FEISHU_IPC_CHANNELS.REPORT_PRESENCE`（通道值 `feishu:report-presence`，`packages/shared/src/types/feishu.ts:280`）的 `ipcMain.handle`（`ipc.ts:5926-5931`）。
  - **`isUserPresent` 全冻结树 0 消费者**（检索范围：冻结树全文件、排除本文件自身；含测试）：该方法目前为死导出面，判定链路尚未接通通知逻辑。
- 出向：`electron` 的 `BrowserWindow` / `powerMonitor`（`:10`）；类型 `FeishuPresenceReport` 来自 `@profer/shared`（`:11`，类型级依赖无运行调用）。

## 5. 数据 I/O、读写与副作用

- 输入：`FeishuPresenceReport`（由渲染进程经 IPC 送达，形状含 `activeSessionId`、`lastInteractionAt`，见 `:34-35`）。
- 输出：布尔判定结果。
- 磁盘/JSON/网络/缓存：**无**（仅进程内 `state` 内存对象）。
- 副作用：读取 Electron 窗口状态与系统空闲秒数（`:48`、`:61`）；无进程/窗口/通知/日志/遥测副作用。

## 6. 分支、失败、取消与恢复

- 分支：§3 六个短路点，均为确定性早退。
- 失败：唯一可抛点 `powerMonitor.getSystemIdleTime()` 被 `try/catch` 包裹，异常时**跳过空闲判定继续**（`:60-64`）——即 powerMonitor 不可用环境下「系统空闲」条件不生效（照实记录的实现取舍）。
- 取消/恢复：无异步任务、无 I/O，不适用（依据：本文件无 Promise/定时器/资源句柄）。
- 重启行为：状态为内存态，主进程重启后 `lastInteractionAt` 重置为模块加载时刻、`activeSessionId` 为 `null`，直到渲染端再次上报。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；IPC 端 `REPORT_PRESENCE` handler（`ipc.ts:5926-5931`）也未做 `event.sender` 校验。
- 权威状态：`activeSessionId` / `lastInteractionAt` 由渲染进程上报值直接决定（`:34-35`），主进程不复核。谁是「当前查看会话」以渲染上报为准（推断自实现，无额外校验证据）。

## 8. 修改影响面

- 消费方：`ipc.ts:5929` 的 `feishu:report-presence` 通道返回值（`void`）；改签名会破坏 preload 对应声明（`apps/electron/src/preload/index.ts` 的 `FeishuPresenceReport` 传参）。
- `FeishuPresenceReport` 类型（`@profer/shared`）字段变动需同步 `updatePresence`。
- 若未来接通 `isUserPresent` 作为飞书通知抑制条件，本文件的阈值常量（`:22`、`:24`）将直接影响通知触发；当前无消费者，改动对用户可见行为无影响。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep` `feishu-presence|presenceService|isUserPresent|updatePresence`，仅命中 `ipc.ts` 两处，无任何 `*.test.ts` 引用。
- 间接证据：无。
- `NOT_RUN`：本轮未运行任何测试（产品测试/typecheck/build/Electron-GUI 均未执行）；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `presenceService` 单例 | 已证实 | `feishu-presence.ts:73` |
| 判定六步顺序与短路条件 | 已证实 | `:47-70` |
| powerMonitor 异常被静默吞掉 | 已证实 | `:60-64` |
| `isUserPresent` 零消费者 | 已证实 | 全冻结树检索（见 §4 范围） |
| updatePresence 无校验直接覆盖状态 | 已证实 | `:33-36` |
| 通知「在场抑制」语义的实际接线 | 未知 | 判定结果无消费者，接线点不存在 |
| `FeishuPresenceReport` 完整字段定义 | 推断 | 仅见使用点 `:34-35` 两字段，shared 类型体未逐行核 |
| 运行行为（真机窗口/空闲检测） | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `presenceService` 导出 | §2/§4 | 73 | covered |
| `PresenceState`/常量 | §2/§3 | 14-24 | covered |
| `updatePresence` | §3/§7 | 33-36 | covered |
| `isUserPresent` 全分支 | §3/§6 | 47-70 | covered |
| powerMonitor catch 分支 | §6 | 60-64 | covered |
| 通知消费链路 | §4/§10 | — | unknown（0 消费者） |
