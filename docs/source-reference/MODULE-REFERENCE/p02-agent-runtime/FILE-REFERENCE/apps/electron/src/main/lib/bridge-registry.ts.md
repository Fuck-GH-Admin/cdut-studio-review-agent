---
path: apps/electron/src/main/lib/bridge-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c4e4d8e4d9a016f3363ac759e4efd8ca0cfe7b7
sha256: 0e152b34e1d6d1e31a628dad229d2d1c7fd1446c4d296c53a346ca7a054919b0
lines: 177
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/bridge-registry.ts

## 1. 结论与边界

**Bridge Registry——统一管理 IM Bridge 生命周期**（`bridge-registry.ts:3-16` 注释）：解决每新增 Bridge 都要在 `app.whenReady()` 与 `before-quit` 两处加启动/清理代码（遗漏任一处=不启动或无法退出）。用法：各 Bridge `registerBridge()` → `startAllBridges()` → `stopAllBridges()`，新增只改一处。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BridgeRegistration` | interface（export） | `:19-32` | name/shouldAutoStart/needsRecovery?/start/stop/recover?（未提供时默认 stop+start `:30`） |
| `BridgeSelfHealingOptions` | interface（export） | `:34-37` | healthCheckIntervalMs（0 关闭） |
| `registerBridge` | function（export） | `:49-51` | push 注册 |
| `startAllBridges` | function（export） | `:59-72` | 并行启动，单个失败不影响其他（`:56-57`） |
| `startBridgeSelfHealing`/`stopBridgeSelfHealing` | function（export） | `:75-112` | 自愈守护启停（幂等 `:76/:95`） |
| `recoverAllBridges` | function（export） | `:115-147` | 恢复（§3） |
| `stopAllBridges` | function（export） | `:169-177` | 退出清理 |

内部：`DEFAULT_HEALTH_CHECK_INTERVAL_MS=60_000`/`POWER_RECOVERY_DELAYS_MS=[1500,10000]`（`:39-40`）、模块态（bridges/recoveryInFlight/selfHealingStarted/healthCheckTimer/scheduledRecoveryTimers `:42-46`）、`handlePowerResume/Unlock`/`schedulePowerRecovery`（`:149-166`）。

## 3. 内部逻辑与关键流程

1. `startAllBridges`（`:59-72`）：shouldAutoStart 才启；`.catch` 记日志；`Promise.all` 并行不串行（`:70`）。
2. 自愈守护（`:75-112`）：`powerMonitor` resume/unlock-screen 两事件（`:79-80`）+ 定时健康检查（默认 60s，`unref` 不阻退出 `:87`）→ `recoverAllBridges('定时健康检查', {force:false})`；stop 时清监听/定时器/计划恢复 timers（`:98-109`）。
3. `recoverAllBridges`（`:115-147`）：**`recoveryInFlight` 单飞防重入**（`:119`）；force=false 仅 `needsRecovery()===true` 的（`:125`）；恢复优先 `bridge.recover()`，否则 stop（失败记日志继续）+start（`:129-138`）；单个失败不阻断其他（`:140-142`）。
4. 电源恢复（`:157-166`）：两档延迟 1.5s/10s 各排一次 **force=true** 恢复（`unref`）；`scheduledRecoveryTimers` 记账供 stop 清理。

## 4. 调用者与调用链

入向：`index.ts`（app.whenReady/before-quit，`:12-13` 注释自述）；各 IM Bridge 注册（飞书/钉钉/微信，跨文件）。出向：electron（powerMonitor）。

## 5. 数据 I/O、读写与副作用

副作用：bridge.start/stop/recover（跨文件）、powerMonitor 监听、setInterval/setTimeout（均 unref）、console.log/error。模块级状态。

## 6. 分支、失败、取消与恢复

单失败隔离（`:56/:134-142/:173-175`）；幂等启停（`:76/:95`）；重入防抖（`:119`）。自愈=本模块核心恢复语义。不适用取消（无 AbortController）。

## 7. 权限与权威状态

不适用（生命周期管理）；可靠性契约=遗漏不发生（`:8`）、退出可清理（stop 全链）。

## 8. 修改影响面

改生命周期/自愈 → 全部 IM Bridge 长连接可靠性与应用退出；新增 Bridge 接入契约（registerBridge）。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `registerBridge|startAllBridges|recoverAllBridges` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出+6 内部+自愈全链 | 已证实 | 逐行读 `:1-177` |
| powerMonitor 事件时序 | 未知 | 平台层 |
| 各 Bridge 实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 | §2 | `:19-177` | covered |
| 启动/自愈/恢复/退出 | §3 | `:49-177` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
