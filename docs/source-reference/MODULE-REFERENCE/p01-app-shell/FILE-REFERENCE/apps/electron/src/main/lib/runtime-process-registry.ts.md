---
path: apps/electron/src/main/lib/runtime-process-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e515eb2991a1838ee7e60046aae4cc3ce888021f
sha256: 95b24906c1bcde415b7244d5a1cf2b8245aa47606af2d4a45c252a8936bf72db
lines: 400
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/runtime-process-registry.ts

## 1. 结论与边界

**运行时长驻服务进程登记表**（400 行）：在 Pi shell 启动点登记「长跑服务命令」（dev/serve/start/watch 等），持久化到运行时进程文件；30s 低频全局巡检用 shell 子进程树 + 端口证据确认真实 `{pid, startTime, ports}`，支持面板查询与终止标记。

边界：不自行创建/杀进程（终止走 `process-handle`/`process-monitor` 域外）；只登记 `source:'pi-owned'` 的自有记录，**不从任意 renderer 输入推断**（注释 `:16-21`）；端口解析复用 `process-monitor.extractRequestedPort` 避免两处策略分叉（`:177-180`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `RuntimeProcessRecord` | 导出接口 | 22-39 | id/sessionId/runtime:'pi'/source:'pi-owned'/launcher/likelyService/command/cwd/shellPid?/pid?/startTime?/ports/launchedAt/lastObservedAt/status:'pending'\|'running'\|'exited' | 记录形状 |
| `RUNTIME_PROCESS_REGISTRY_CHANGED` | 导出常量 | 47 | `'runtime-process-registry-changed'` | 事件名 |
| `onRuntimeProcessRegistryChanged` | 导出函数 | 48-51 | `(listener) => () => void` | 订阅+退订 |
| `isLongRunningServiceCommand` | 导出函数 | 90-95 | `(command) => boolean` | 服务命令分类器 |
| `resolveServiceWorkingDirectory` | 导出函数 | 107-113 | `(command, fallbackCwd) => string` | 从 `cd … &&` 提取项目 cwd |
| `registerPendingPiRuntimeProcess` | 导出函数 | 115-154 | `(sessionId, command, cwd, launcher='bash', shellPid?) => Record\|undefined` | 登记入口 |
| `registerPiRuntimeProcessShell` | 导出函数 | 162-170 | 同上（shellPid 必填形态） | 受控启动点 PID 证据 |
| `matchRecordInTree` | 导出函数 | 220-248 | `(record, tree, portMap) => {pid,startTime?,ports}\|undefined` | shell 子进程树匹配 |
| `matchRecordAgainstSnapshot` | 导出函数 | 255-283 | 全量快照匹配 | **兼容导出（仅测试用）** |
| `listOwnedRuntimeProcesses` | 导出函数 | 385-390 | `(sessionId) => Promise<Record[]>` | 面板查询（先巡检再返回） |
| `markOwnedRuntimeProcessExited` | 导出函数 | 392-399 | `(sessionId, pid, startTime?) => void` | 标记退出 |
| `normalizeShellWorkingDirectory` | 内部函数 | 98-105 | Git Bash `/d/…` → `D:/…` | |
| `commandTokens`/`requestedPort`/`compatible` | 内部函数 | 172-191 | 关键字/端口/兼容性判定 | |
| `scheduleInspection`/`inspectOnce` | 内部函数 | 205-214、286-382 | 30s 巡检调度/单轮巡检 | |
| `load`/`save`/`isRecord` | 内部函数 | 56-87 | 注册表文件读写（tmp+rename） | |

导出计数：`export` **11 条**（`:22`、`:47`、`:48`、`:90`、`:107`、`:115`、`:162`、`:220`、`:255`、`:385`、`:392`），与源码逐条一致。

## 3. 内部逻辑与关键流程

- **分类器**（`:90-95`）：命令小写匹配 `(astro|vite|next|nuxt|webpack|parcel) (dev|serve)`、`(npm|pnpm|yarn|bun) (run )?(dev|serve|start|watch)`、`nodemon|ts-node-dev|docker compose up`；短命令不入表（`:123-124`）。
- **登记**（`:115-154`）：`likelyService=false` → undefined（不落盘不巡检）；`resolveServiceWorkingDirectory` 提取显式 `cd <dir> &&`（双引号/单引号/裸词三分支，`:110-112`；Git Bash `/d/` 形式归一 `D:/`，`:98-105`）；**15s 窗口去重**（同 session+command+cwd+launcher 且未 exited，`:129-141`，重复仅补 `shellPid`）；新记录 `status:'pending'` 写盘 + `emitChanged` + 唤醒巡检（`:142-153`）。
- **`registerPiRuntimeProcessShell`**（`:162-170`）：受控启动点拿到的 shell PID 只是**启动证据**（注释 `:156-161`：包管理器/`nohup &` 常 fork 出真正监听者），仍待巡检确认。
- **匹配语义**（`compatible`，`:182-191`）：`startTime < launchedAt - 3s` 视为 PID 转世不兼容；**显式端口命中即认**（强证据）；否则命令 token（≥3 字符、剔除 npm/pnpm/yarn/bun/run、取前 4 个）需有任一出现在 cmd 内。
- **30s 巡检**（`inspectOnce`，`:286-382`）：`inspectInFlight` 防并发；①pending 服务按 `shellPid` 分组 `listProcessTree` 树内 `matchRecordInTree`（端口优先，`:220-248`）；POSIX 服务 shell 退出后被 init 收养时懒加载全量 `captureOsSnapshot` 兜底（`:303-323`）；命中→填 `pid/startTime/ports`、`status:'running'`；②confirmed 批量 `listAliveProcesses` 存活校验（`startTime` 差 <2s 才算 same，`:349`），**非服务记录直接退役**（老版本误升级清理，`:341-347`）；③过期清理：exited 7 天、pending 非服务 60s、pending 服务 10min（`:362-367`）；变更即写盘+`emitChanged`；仍有活跃记录才续排下一轮（`:378`）。
- **调度**（`:205-214`）：`scheduleInspection` 单例定时器，`timer.unref()` 不阻止进程退出（`:211-212`）。
- **持久化**（`:78-87`）：tmp（`<path>.<pid>.tmp`）+ rename 原子写，finally 清理残留；`load` 损坏/缺失回空表（`:56-68`）；`isRecord` 字段级校验（`:70-76`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep runtime-process-registry|六导出名`，apps+packages 全类型）：
  - `apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`（Pi BashSpawnHook 同步登记点，注释 `:97`）与 `adapters/pi-powershell-tool.ts`（powershell launcher）。
  - `apps/electron/src/main/lib/pi-background-task-manager.ts`（后台任务）+ 其测试 `pi-background-task-manager.test.ts`。
  - `apps/electron/src/main/lib/process-handle.ts` + `process-handle.test.ts`（终止链消费）。
  - `apps/electron/src/main/ipc.ts`（面板 IPC：list/mark）。
  - `apps/electron/src/renderer/components/agent/RuntimeProcessPanel.tsx`（渲染面板，经 preload）。
  - **直接测试**：`apps/electron/src/main/lib/runtime-process-registry.test.ts`（107 行，**9 test**，非本批 scope 属他批主手册，断言级引用见 §9）。
- 出向：`./config-paths.getRuntimeProcessesPath`（`:4`）；`./process-monitor` 的 `captureOsSnapshot/extractRequestedPort/isSameProcess/terminateProcessTreeGracefully/listAliveProcesses/listPortPidMap/listProcessTree`（`:5-14`，其中 `isSameProcess`/`terminateProcessTreeGracefully` 在本文件 import 未见调用点——照实记录 §10）；`node:crypto`/`node:fs`/`node:events`。

## 5. 数据 I/O、读写与副作用

- 磁盘写：注册表文件（`getRuntimeProcessesPath()`，tmp+rename 原子写）；读：load。
- 副作用：EventEmitter 事件（`runtime-process-registry-changed`）；OS 观测子进程调用（`process-monitor` 域外实现）；`unref` 定时器。
- 并发：`inspectInFlight` 单飞；15s 登记去重；`save` 全量覆盖写（多入口串行于 JS 单线程）。

## 6. 分支、失败、取消与恢复

- 短命令/非服务：不登记（`:123-124`）。
- 匹配失败：pending 保留至 10min 过期清理（`:365`）。
- confirmed 存活校验失败（PID 转世/退出）：`status:'exited'`（`:352-357`）。
- 恢复：注册表持久化，重启后 load 恢复；巡检自动重建（新登记唤醒）。
- 取消：无显式取消；`unref` 定时器 + 应用退出自然终止。

## 7. 权限与权威状态

- 无 sender/role 检查；登记入口在主进程 Pi 启动钩子（不接受 renderer 直接登记，注释 `:16-21`）。
- 权威状态：`{pid, startTime, ports}` 仅在 OS 观测兼容（startTime 窗口/端口证据）时写入——**PID 不信任 shell pid 本身**（`:156-161`）；面板渲染以此为准。

## 8. 修改影响面

- 消费方：pi-agent-adapter/pi-powershell-tool（登记）、process-handle（终止）、pi-background-task-manager、ipc.ts 面板通道、RuntimeProcessPanel。
- `process-monitor` 共享函数（端口提取/进程树）改动影响匹配语义。
- 注册表文件格式 `version:1`（`:41-44`）；`isRecord` 校验收紧会过滤旧记录。
- 测试：`runtime-process-registry.test.ts`（9 用例）覆盖分类器/cwd 解析/匹配语义，改动需同步。

## 9. 测试证据

- 直接测试：`apps/electron/src/main/lib/runtime-process-registry.test.ts`（107 行，bun:test，**9 test**，NOT_RUN；**非本批 scope**，断言级引用）——分类 1（`:19-25`：astro dev/npm run dev/docker compose up 真、git status/bun test 假）；`resolveServiceWorkingDirectory` 3（`:27-43`：显式 cd 双引号、Git Bash `/d/` 归一 `D:/`、无 cd 保持 fallback）；`matchRecordAgainstSnapshot` 5（`:49-106`：显式端口命中、POSIX 脱壳按端口、无端口按 cwd 关键字、startTime 过旧拒绝 PID 转世、排除 claude-agent-sdk 自身进程）。
- 未覆盖：`registerPendingPiRuntimeProcess` 15s 去重、`inspectOnce` 巡检三段、`matchRecordInTree`、过期清理、`listOwnedRuntimeProcesses`/`markOwnedRuntimeProcessExited`。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实进程巡检；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出与签名 | 已证实 | `:22-399` |
| 分类器正则三组 | 已证实 | `:90-95` |
| 15s 去重+shellPid 升级 | 已证实 | `:129-141` |
| 巡检三段（pending 树匹配/confirmed 存活/过期清理窗口） | 已证实 | `:286-378` |
| 端口强证据、startTime 3s 兼容窗、PID 转世拒绝 | 已证实 | `:182-191`、`:349` |
| POSIX 懒加载全量快照兜底 | 已证实 | `:303-323` |
| `matchRecordAgainstSnapshot` 仅测试用 | 已证实 | `:250-254` 注释 |
| tmp+rename 原子写 | 已证实 | `:78-87` |
| `isSameProcess`/`terminateProcessTreeGracefully` 本文件未调用 | 已证实 | 全文检索（import `:5-14` 无调用点） |
| 9 用例断言 | 已证实 | `runtime-process-registry.test.ts:19-106` |
| 真实进程巡检/终止行为 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `RuntimeProcessRecord`/事件 | §2 | 22-54 | covered |
| `load/save/isRecord` | §3 | 56-87 | covered |
| 分类器/cwd 归一 | §3/§9 | 90-113 | covered |
| 登记+去重 | §3 | 115-170 | covered |
| `compatible`/`matchRecordInTree`/`matchRecordAgainstSnapshot` | §3/§9 | 172-283 | covered |
| `inspectOnce` 三段+调度 | §3/§6 | 201-382 | covered |
| `listOwnedRuntimeProcesses`/`markOwnedRuntimeProcessExited` | §3 | 385-399 | covered |
| 真实巡检/终止行为 | §10 | — | unknown（NOT_RUN） |
