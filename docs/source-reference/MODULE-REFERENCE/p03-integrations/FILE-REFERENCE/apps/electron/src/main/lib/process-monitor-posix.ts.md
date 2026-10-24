---
path: apps/electron/src/main/lib/process-monitor-posix.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c5ac4a25429189cf1d1f0a8c3faabbe35b686fe0
sha256: 8e8e8c878c6a85882a4b19183ee00725cf1786a8ccc9a781f24866a0b537204e
lines: 128
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/process-monitor-posix.ts

## 1. 结论与边界

POSIX 进程监控：解析 `ps -axo pid=,ppid=,lstart=,comm=,args=` 与 `lsof -F pnPc` 输出，提供进程/端口映射/进程树/同进程判定（PID 复用防护）。薄文件（128 行）。

## 2. 导出与关键符号

`export` 逐条核对：2 个接口 + 8 个函数 = 10 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PosixProcessInfo` | 接口（导出） | 8-14 | `{pid,ppid,name,cmd,startTime?}` | |
| `PosixSnapshot` | 接口（导出） | 16-19 | `{portPids,processes}` 两 Map | |
| `parsePsOutput` | 函数（导出） | 22-43 | ps 行→Info[]（<8 字段/非法 pid/ppid 跳过；lstart 五字段拼接解析；解析失败省 startTime） |
| `parseLsofListenOutput` | 函数（导出） | 46-65 | `p` 行=PID、`n` 行取 `:port`（1-65535）；同端口多 PID 去重 |
| `listPortPidMapPosix` | 函数（导出） | 85-87 | `lsof -nP -iTCP -sTCP:LISTEN -F pnPc` |
| `captureOsSnapshotPosix` | 函数（导出） | 89-95 | `Promise.all` 并行两查询 |
| `listProcessesPosix`/`getProcessInfoPosix` | 函数（导出） | 97-104 | 进程表/单查 |
| `isSameProcessPosix` | 函数（导出） | 106-110 | **PID 复用防护**：startTime 差 <2s 才算同进程（无期望时间→false） |
| `listProcessTreePosix` | 函数（导出） | 112-128 | BFS 子孙树（maxDepth 8，seen 去环） |
| `run`/`queryProcesses` | 内部 | 67-83 | execFile 8s 超时/16MB，**失败返回空串**（`:75-77`） |

## 3. 内部逻辑与关键流程

`run`（`:67-77`）静默吞错返回 `''`（监控类工具不打断主流程）；`parsePsOutput`（`:22-43`）字段数/数值校验后组装；`listProcessTreePosix`（`:112-128`）frontier BFS 逐层扩（ppid 匹配、maxDepth 默认 8）。

## 4. 调用者与调用链

入向：进程监控/端口占用排查/受管浏览器进程树；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`node:child_process`、`node:util`。

## 5. 数据 I/O、读写与副作用

子进程：`ps`/`lsof`（8s 超时、16MB）；失败静默空结果。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 命令失败/超时 | 返回空串→空集合 | 75-77 |
| 行字段不足/非法 PID | 跳过 | 30-32 |
| 端口越界 | 跳过 | 60 |
| 无 expectStartTime | `isSameProcessPosix` false | 107 |
| 树环/深 | seen+maxDepth | 115-117 |

## 7. 权限与权威状态

同进程判定权威=startTime 容差 2s（PID 复用防护，`:106-110`）。

## 8. 修改影响面

改解析影响监控准确性；改容差影响进程复用判定。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 静默失败语义 | 已证实 | `:75-77` |
| PID 复用防护 | 已证实 | `:106-110` |
| 树 BFS/去环 | 已证实 | `:112-128` |
| 真实 ps/lsof | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 解析族 | §2,§3 | 22-65 | covered |
| 查询族 | §2 | 85-128 | covered |
| 断言 | §9,§10 | — | unknown |
