---
path: apps/electron/src/main/lib/agent-fork-workspace-copy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9de9eb327d982c37983a9647780d87ddb966337c
sha256: 397e738806168b62ce8a40c84a2c2085c463a5d03c8594d670a0717c3533a77b
lines: 78
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fork-workspace-copy.ts

## 1. 结论与边界

Fork 会话工作区复制：按黑名单跳过高风险目录（:5-23：.claude/.git/node_modules/.venv/build 产物/.cdutai-pi-checkpoints 等 15 项，注释 :10-11：Pi 检查点已迁配置目录不随分叉复制）；失败不抛、结构化记录。

## 2. 导出与关键符号

导出 3 条（`export` :25/:32/:36）：`ForkWorkspaceCopyResult`（:25-30，copied/skipped/failed 计数+failedPaths）、`shouldCopyForkWorkspacePath(src)`（:32-34，basename 黑名单判定）、`copyForkWorkspaceFiles(sourceDir, destDir)`（:36-78）。

## 3. 内部逻辑与关键流程

（:36-78）：dest 不存在则 mkdir；readdir 失败→failedPaths+warn+返回（:47-54）；逐条目：黑名单跳过（:59-62）→`copyForkPath`（recursive+filter :65-68）→成功 copied++/异常 failedPaths+warn（:70-74）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/agent-session-manager.ts:30`（唯一调用 :2004）；测试 `agent-fork-workspace-copy.test.ts:5-8`。否定：`shouldCopyForkWorkspacePath`/`ForkWorkspaceCopyResult` 无外部生产消费者。出向：`node:fs`/`node:path`、`./fork-file-ops`（copyForkPath/describeForkFileError）。

## 5. 数据 I/O、读写与副作用

磁盘复制（经 fork-file-ops）；console.warn 两处。无网络。

## 6. 分支、失败、取消与恢复

逐条目 try/catch 不中断（:64-74）；目录读取失败整体降级（:47-54）。不适用取消/恢复。

## 7. 权限与权威状态

黑名单=复制边界权威（:5-23）；无权限字段。

## 8. 修改影响面

fork 会话创建链（agent-session-manager:2004）。需同步测试（4 用例）。

## 9. 测试证据

`agent-fork-workspace-copy.test.ts`（批内，1 describe/4 用例，NOT_RUN）：保留 .context/跳过高风险目录（copied 6/skipped 3/failed 0 :50-62）、源不存在结构化失败（ENOENT :65-76）、Windows 超长路径 key 稳定 ≤240（:78-85，测 fork-file-ops）、黑白名单判定（:87-94）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；黑名单语义 | 已证实 | :5-34 |
| shouldCopy 无外部消费者 | 已证实（否定） | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+失败降级 | §2/§3 | :25-78 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
