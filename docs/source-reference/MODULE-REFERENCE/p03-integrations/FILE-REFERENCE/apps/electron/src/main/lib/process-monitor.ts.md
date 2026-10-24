---
path: apps/electron/src/main/lib/process-monitor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: afcd37f68d400975a8ae8bed361aaf5467dad3f0
sha256: c1c4951a1b885425ba1e66cec8e17800b494523d0a6a14fa09c737cbeea9f026
lines: 629
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/process-monitor.ts

## 1. 结论与边界

**process-monitor——会话运行进程采集（期一 M1b-M2）**（`process-monitor.ts:1-12`）：按平台枚举真实 OS 进程+端口映射，把 SDK 后台任务（type:'shell'）匹配到真实 PID。设计原则：**零第三方依赖、全异步不阻塞 UI**、**pid 无转世（{pid,startTime} 双因子校验 kill 前必查）**、Windows 长驻 PowerShell 管道/POSIX ps-lsof 失败安全降级空结果、不支持平台直接空结果（`:7-11`）。

## 2. 导出与关键符号（17 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `extractRequestedPort` | function（export） | `:35-48` | 命令→显式端口（参数形态优先 `:39`，URL/冒号回退 `:44`；**锚定防把 pid/计数误当端口** `:32-33`；1-65535 校验 `:47`） |
| `MonitoredProcess` | interface（export） | `:50-58` | pid/name/cmd/startTime?/ports/sessionId?/sdkTaskId? |
| `listPortPidMapWin`/`captureOsSnapshotWin`/`listProcessesWin`/`isSameProcessWin`/`getProcessInfoWin`/`listProcessTreeWin` | function（export） | `:180-447` | Windows 系（§3.1） |
| `listSessionDirProcesses` | function（export） | `:319-338` | 按会话目录枚举（**纯 OS 视角，能补 SDK 未标记的真实 dev server** `:317`） |
| `mapSdkShellTasks` | function（export） | `:344-388` | SDK shell 任务→真实 PID（端口命中优先 `:358`，退命令首关键字+node 匹配 `:373-383`） |
| `listAliveProcesses` | function（export） | `:460-486` | 批量存活查询（WQL OR 一次 `:470`；**按 pid 集合 2s TTL 缓存** `:453-457`） |
| `listPortPidMap`/`captureOsSnapshot`/`listProcesses`/`getProcessInfo`/`isSameProcess`/`listProcessTree` | function（export） | `:503-561` | 平台中立分派（**不支持平台 fail closed 空结果** `:509-517`） |
| `terminateProcessTreeGracefully` | function（export） | `:579-613` | 优雅终止（§3.3） |
| `killProcessTree` | function（export） | `:616-629` | taskkill /T /F（POSIX 退 SIGKILL） |

内部：`PowerShellPipe`（**:76-163，长驻单例 `:166**：token 边界 FIFO 切分 `:88-152`、超时 10s 整管重建 `:95-99`、失败重建保证不降级 `:63-64`）、`PS_PORT_CMD`（netstat -ano（不用 -p TCP 防漏 IPv6 `:179`），实测 3.3s→360ms `:174-175`）、OS 快照 2s TTL（`:207-210/:265-268`，三路并发共享防重复 spawn）、`queryWinProcesses`（WQL 过滤 `:406-417`）、`signalPosixProcessTree`（进程组优先 `:564-576`）。

## 3. 内部逻辑与关键流程

### 3.1 Windows 采集（`:177-447`）

合并命令一次往返（netstat 端口+Get-CimInstance 进程+CreationDate startTime `:214-234`）；进程树 BFS 逐层 WQL（ParentProcessId OR，**父退出不 reparent 孤儿仍可查** `:422-423`，maxDepth 8，开销 400ms→几十 ms `:425`）；`isSameProcessWin` 双因子容差 2s、**startTime 缺失→拒绝**（`:294-308`）。

### 3.2 任务匹配（`:344-388`）

端口命中（command 端口→监听 pid，相似度判 node/前缀 8 字符/含 `:port` `:364-367`）→ 退关键字匹配。

### 3.3 终止（`:579-629`）

优雅链：taskkill /T（或 SIGTERM 进程组）→ 等 graceMs 2.5s → **isSameProcess 复核**（`:599`，防 PID 转世误杀）→ 仍存活才强杀（taskkill /T /F 或 SIGKILL）。

## 4. 调用者与调用链

入向：会话运行面板/kill IPC（跨文件）；测试 `process-monitor.test.ts`（同批 8 用例）。出向：`./process-monitor-posix`（跨文件，ps/lsof）、`node:child_process`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

spawn/execFile（powershell.exe/taskkill/ps/lsof）；进程终止副作用；缓存态。

## 6. 分支、失败、取消与恢复

命令不可用→空结果（`:10`）；管道失效重建（`:63-64`）；不支持平台空结果（`:11`）。不适用取消。

## 7. 权限与权威状态

安全契约：kill 前双因子复核（`:9/:599`）；防误杀（PID 转世防护）。

## 8. 修改影响面

改采集/匹配/终止 → 进程面板数据与 kill 行为；管道/缓存策略影响 UI 流畅度。

## 9. 测试证据

**直接测试 `process-monitor.test.ts`（8 用例，NOT_RUN）**：extractRequestedPort 6（锚定/范围/空）、POSIX ps/lsof 解析 2（跨文件函数）——断言见测试手册。未覆盖：Windows 管道/匹配/终止链。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 导出+管道+采集+终止全链 | 已证实 | 逐行读 `:1-629` |
| 测试 8 用例断言 | 已证实 | 测试文件；NOT_RUN |
| 真实 Windows/POSIX 命令行为 | 未知 | 平台层 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 17 导出 | §2 | `:35-629` | covered |
| 管道/采集/匹配/终止 | §3 | `:76-629` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
