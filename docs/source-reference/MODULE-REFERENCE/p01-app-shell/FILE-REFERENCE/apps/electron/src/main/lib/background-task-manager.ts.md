---
path: apps/electron/src/main/lib/background-task-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9c19e7231b95f967cff5e5753a85fe6da8fbc08b
sha256: 439c8367ab6ac716db7527e48db65918c3585abeca7e1d71bcd5becd04d0798c
lines: 97
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/background-task-manager.ts

## 1. 结论与边界

**SDK 后台任务归属与最终输出的主进程权威**（97 行）："Renderer input is never used to create records or choose an output path"（`:27`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `BackgroundTaskStatus`/`Record`/`Output` | `:3`/`:5-14`/`:16-21` | 状态四值/记录（type? 缺失仅兼容旧记录不猜 renderer 类型 `:8`）/输出 |
| `BackgroundTaskManager`（class） | `:29-97` | `upsert`（合并保留旧 outputFile/summary `:42-43`）/`get`/`markStopped`（不存在 throw `:56`）/`readOutput`（**尾部截断 2MB** `:23`/`:64`）/`getOutput`（可选阻塞轮询 50ms、超时钳 0-30s `:75`）/`forgetSession`/`clear` |

## 3. 内部逻辑与关键流程

内存 Map<session, Map<task, record>>；getOutput 阻塞循环（running 时 50ms 轮询到 deadline）→输出+终态判定。

## 4. 调用者与调用链

SDK 后台任务工具（getOutput/stop）；被 `background-task-manager.test.ts`（3 个 `test(`）覆盖。

## 5. 数据 I/O、读写与副作用

读输出文件（readFileSync）；内存状态。

## 6. 分支、失败、取消与恢复

不存在→throw（含"不属于当前会话"文案）；输出文件缺失/读错→''；超时→返回当前状态。

## 7. 权限与权威状态

- **主进程权威契约**（`:26-27`）：renderer 不得创建记录/选输出路径。
- 跨会话访问拒绝（sessionId+taskId 双键）。

## 8. 修改影响面

改归属语义影响后台任务安全面；测试 3 用例锁定。

## 9. 测试证据

`background-task-manager.test.ts`（同批，3 个 `test(`）：双键访问拒绝、阻塞等待终态、重复停止幂等。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/权威契约/双键 | 已证实 | 97 行全读（主根自读兜底） |
| 行为锁定 | 已证实 | 测试 3 用例 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
