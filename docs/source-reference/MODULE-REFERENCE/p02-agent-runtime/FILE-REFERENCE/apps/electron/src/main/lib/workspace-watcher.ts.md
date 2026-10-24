---
path: apps/electron/src/main/lib/workspace-watcher.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4de2dc597a5cf70563420f5a360e6c34063f5e8a
sha256: 4f02c90417b9e010f7da6af6f022d7ce8783abbbf1e60b095153e0366e698339
lines: 229
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/workspace-watcher.ts

## 1. 结论与边界

工作区文件监听器（头注释 :1-12）：`fs.watch` 递归监听 `~/.proma/agent-workspaces/`；mcp.json/skills/→CAPABILITIES_CHANGED，其他→WORKSPACE_FILES_CHANGED；附加目录统一 FILES_CHANGED；全部 300ms 防抖防 IPC 风暴。

## 2. 导出与关键符号

导出 5 条（`export` :51/:130/:154/:177/:222）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `startWorkspaceWatcher(win)` | `:51-125` | 根 watcher+恢复附加目录（:55） |
| `stopWorkspaceWatcher()` | `:130-143` | 全清理（根+附加+mainWin） |
| `restoreWorkspaceAttachedWatchers()` | `:154-171` | 启动恢复工作区级附加目录（注释 :148-150：对应上游 #1314 重启丢监听） |
| `watchAttachedDirectory(dirPath)` | `:177-217` | 路径去重（:178）；统一防抖合并刷新（:194-201） |
| `unwatchAttachedDirectory(dirPath)` | `:222-229` | |

内部：`DEBOUNCE_MS=300`（:22）、`WATCHER_RESTART_DELAY_MS=5000`（:25）、`HIGH_NOISE_SEGMENTS`（:28-31，node_modules/.next/.git 等 11 目录）、`isHighNoisePath`（:33-35）。

## 3. 内部逻辑与关键流程

根 watcher（:69-108）：噪声路径跳过（:76）；**仅忽略工作区顶层 config.json**（会话目录同名仍算用户文件 :80-83）；事件二分→双防抖定时器（:89-107）。**error 自愈**（:110-119）：注释 :110-111——EventEmitter 无 error 监听会拖死主进程，故显式监听+5s 后重启（:116-118）。附加目录 error→移除不重启（:206-210，外接盘易断）。

## 4. 调用者与调用链

入向（作者 grep）：生产 2 文件——`main/index.ts:211`（startWorkspaceWatcher :1040/stopWorkspaceWatcher）、`ipc.ts:438`（watchAttachedDirectory :2680/:4505/:4573、unwatchAttachedDirectory :4523/:4583）。出向：`node:fs`（watch）、`@profer/shared`、`./config-paths`、`./agent-workspace-manager`（:19）。

## 5. 数据 I/O、读写与副作用

fs.watch 递归监听+IPC 推送。无写。

## 6. 分支、失败、取消与恢复

error 自愈（根）/移除（附加）；防抖双通道；噪声过滤。恢复=restoreWorkspaceAttachedWatchers。

## 7. 权限与权威状态

config.json 顶层忽略语义（:80-83 注释）；IPC 事件类型权威。

## 8. 修改影响面

- 消费面：文件浏览器/侧边栏刷新链（两 IPC 事件）。
- 依赖面：agent-workspace-manager 附加目录、config-paths、AGENT_IPC_CHANNELS。
- 需同步测试：无专属测试（清单内无 workspace-watcher.test）。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；防抖/自愈/噪声过滤 | 已证实 | :22-229 |
| error 自愈动机（防主进程崩溃） | 已证实 | :110-111 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+监听链 | §2/§3 | :51-229 | covered |
| 测试 | §9 | — | unknown |
