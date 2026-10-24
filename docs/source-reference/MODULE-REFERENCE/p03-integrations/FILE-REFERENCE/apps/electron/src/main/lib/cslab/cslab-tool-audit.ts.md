---
path: apps/electron/src/main/lib/cslab/cslab-tool-audit.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a02d1a6d6d8a8a347b3126fed0b34a10d2fe9a9d
sha256: 5dcb18fc652396f62906c584fb57c779e8bcafe3eb73d6befdf165eeea5ceaec
lines: 110
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tool-audit.ts

## 1. 结论与边界

**CSLab 自定义 Python 工具执行审计**（`cslab-tool-audit.ts:1-9` 注释）：每次执行（含失败）追加一行 JSONL 到实验室沙箱 `runtime/logs/tool-executions.jsonl`（`:4-5`）。红线：**写入失败只 warn，绝不改变工具执行结果**（`:7`）；Promise 队列串行追加**保证行序与执行顺序一致**（`:7-8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabToolExecutionAuditInput` | interface（export） | `:20-33` | labId/sessionId?/source(agent\|ipc)/permissionMode?/moduleRelPath?/function/args/ok/exitCode?/elapsedMs/result?/error? |
| `appendCsLabToolAudit` | function（export） | `:69-110` | 追加审计；内部吞写盘异常（`:68`） |

内部：`AUDIT_REL_DIR/PATH`（`:15-16`）、`MAX_ARGS_CHARS=8K`/`MAX_RESULT_CHARS=2K`（`:17-18`）、`CsLabToolExecutionAuditRecord`（`:35-50`）、`safeJson`（序列化失败回 String `:52-59`）、`truncate`（截断加 `…`+标记 `:61-64`）、`auditQueue`（`:66`）。

## 3. 内部逻辑与关键流程

`appendCsLabToolAudit`（`:69-110`）：args/result/error 分别截断（args 8K、result/error 2K `:70-76`）；记录含 `at` ISO 时间戳与 `argsTruncated` 标记（`:79-93`）；**入队串行**（`auditQueue.then` mkdir+appendFile `:95-104`）；`.catch` 仅 warn（**:105-107，失败不外抛**）；返回队列 Promise。

## 4. 调用者与调用链

入向：CSLab 工具执行器（tool-registry/IPC 路径，同批/跨文件）。出向：`./cslab-paths`（resolveLabRelativePath `:13`）、`node:fs/promises`。

## 5. 数据 I/O、读写与副作用

写：实验室沙箱审计 JSONL（appendFile）；console.warn（失败）。无读。

## 6. 分支、失败、取消与恢复

失败静默 warn（`:105-107`，红线 `:7`）；序列化失败回退字符串（`:56-58`）。不适用取消/恢复（队列自愈）。

## 7. 权限与权威状态

审计=观测不干预（`:7`）；记录含 permissionMode/source（授权上下文留痕）。

## 8. 修改影响面

改记录形状/截断 → 审计回放与合规检查；队列改动影响行序保证。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `appendCsLabToolAudit` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+4 内部+队列/截断/静默全链 | 已证实 | 逐行读 `:1-110` |
| 消费方调用覆盖 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+全链 | §2/§3 | `:20-110` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
