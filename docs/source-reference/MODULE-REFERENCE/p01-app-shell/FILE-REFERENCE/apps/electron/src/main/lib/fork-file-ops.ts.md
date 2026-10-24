---
path: apps/electron/src/main/lib/fork-file-ops.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17110dfd45671bb457d38a599aac965362f4bf5e
sha256: 3d16828969c6a2683bd45698ad4051b60cf71f032ad31d1418b661db16680733
lines: 73
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/fork-file-ops.ts

## 1. 结论与边界

**Agent fork 会话文件操作的 Windows 容错层**（73 行）：对 `cpSync`/`renameSync`/`rmSync` 包一层「文件锁/Defender 扫描期」可重试执行器（同步退避），另提供 fork 项目键生成（防 Windows 下 project 目录键无限增长）。

边界：只做 fs 重试与键生成；fork 会话复制策略（blocklist、失败统计）在 `agent-fork-workspace-copy.ts`，会话生命周期在 `agent-session-manager.ts`（均域外）；本文件不管理回滚语义（注释 `:44`：失败仍抛出，由调用方决定降级还是回滚）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `describeForkFileError` | 导出函数 | 19-23 | `(error: unknown): string` | 错误→`code: message` 文本 |
| `copyForkPath` | 导出函数 | 45-47 | `(source, destination, options?: ForkCopyOptions): void` | 带重试 `cpSync` |
| `copyForkFile` | 导出函数 | 50-52 | `(source, destination): void` | 单文件复制（委托 `copyForkPath`） |
| `renameForkFile` | 导出函数 | 55-57 | `(source, destination): void` | 带重试 `renameSync` |
| `removeForkPath` | 导出函数 | 60-62 | `(path, options = { recursive: true, force: true }): void` | 带重试 `rmSync` |
| `buildForkProjectKey` | 导出函数 | 65-73 | `(projectDir: string): string` | 项目键（长度受控） |
| `FORK_FS_RETRY_DELAYS_MS` | 内部常量 | 6 | `[0, 50, 150, 400, 1000]` | 5 次尝试的退避序列 |
| `RETRYABLE_CODES` | 内部常量 | 7 | `Set{'EBUSY','EPERM','EACCES','EMFILE','ENFILE','ENOTEMPTY'}` | 可重试错误码 |
| `sleepSync` | 内部函数 | 9-12 | `(ms): void` | `Atomics.wait` 同步阻塞 |
| `errorCode` | 内部函数 | 14-17 | `(error): string\|undefined` | 取 `NodeJS.ErrnoException.code` |
| `isRetryable` | 内部函数 | 25-28 | `(error): boolean` | code ∈ RETRYABLE_CODES |
| `withForkFsRetry` | 内部函数 | 30-42 | `<T>(operation: () => T): T` | 重试执行器 |
| `ForkCopyOptions`/`ForkRemoveOptions` | 内部类型 | 3-4 | `Parameters<typeof cpSync>[2]` / `Parameters<typeof rmSync>[1]` | 透传 node:fs 选项 |

导出计数：`export` 6 条（`:19`、`:45`、`:50`、`:55`、`:60`、`:65`），与源码一致。

## 3. 内部逻辑与关键流程

- `withForkFsRetry`（`:30-42`）：按 `FORK_FS_RETRY_DELAYS_MS` 逐个 `sleepSync(delay)` 后执行 `operation`；**首次 delay=0（立即执行）**；捕获错误后若 `!isRetryable(error)` 立即 `break` 并抛出 `lastError`（`:38-41`）；可重试错误最多 5 次尝试（累计等待 1.6s），全部失败抛最后一次错误（`:41`）。
- `sleepSync`（`:9-12`）：`ms <= 0` 直接返回；否则 `Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)`——**同步阻塞调用线程**（主进程上会阻塞事件循环）。
- `describeForkFileError`（`:19-23`）：有 `code` → `` `${code}: ${message}` ``，否则 `String(error)` 或 `error.message`。
- `buildForkProjectKey`（`:65-73`）：`projectDir` 中非 `[a-zA-Z0-9]` 全部替换为 `-`（`:66`）；≤200 直接返回（`:67`）；否则 `前200字符 + '-' + Math.abs(hash).toString(36)`，hash 为 `hash*31 + charCodeAt` 的 32 位 `|0` 累积（`:68-72`）。注释（`:64`）：与迁移流程保持同一规则（迁移侧实现域外，本批未核）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep` 六个导出名 + 模块名，apps+packages 全文件类型）：
  - `apps/electron/src/main/lib/agent-fork-workspace-copy.ts:3` import `copyForkPath, describeForkFileError`；调用点 `:51`、`:72`（`describeForkFileError` 记入 `failedPaths.reason`）、`:65`（`copyForkPath(srcPath, destPath, { recursive: true, filter: shouldCopyForkWorkspacePath })`）。
  - `apps/electron/src/main/lib/agent-session-manager.ts:31` import `copyForkFile, buildForkProjectKey, renameForkFile, removeForkPath`；**实际调用点仅 2 处**：`:1580` `removeForkPath(sessionDir)`（删除会话后清理 session 工作目录）、`:2619` `renameForkFile(tmpPath, filePath)`（JSONL 原子改写 tmp→目标）。`copyForkFile` 与 `buildForkProjectKey` 在该文件**仅 import 无调用点**（全冻结树 `grep copyForkFile` 命中数=1，即该 import 行本身 → 0 实际调用）。
  - `apps/electron/src/main/lib/agent-fork-workspace-copy.test.ts:9` import `buildForkProjectKey`；`:80-81` 测试调用（见 §9）。
- 出向：`node:fs` 的 `cpSync`/`renameSync`/`rmSync`（`:1`）；无其他运行依赖。

## 5. 数据 I/O、读写与副作用

- 输入：源/目标路径字符串 + node:fs 选项；输出：`void`（`buildForkProjectKey` 返回字符串）。
- 磁盘写：`cpSync` 复制（可递归）、`renameSync` 重命名、`rmSync` 默认 `recursive+force` 递归强删（`:60`）。
- 网络/缓存/全局状态：无。
- 副作用：文件系统变更；同步阻塞（`Atomics.wait` + 同步 fs）；无日志（错误描述由调用方打印）。

## 6. 分支、失败、取消与恢复

- 不可重试错误：首次尝试即抛出（`:38` break → `:41` throw）。
- 可重试错误：0/50/150/400/1000ms 退避共 5 次尝试后抛最后一次错误（`:32-41`）。
- 取消：无取消机制（同步 API）；中途无法中断。
- 恢复：本文件无回滚；`agent-fork-workspace-copy` 捕获错误记 `failedPaths` 继续（`agent-fork-workspace-copy.ts:70-74`）；`agent-session-manager` 侧的回滚由 `forkAgentSession` 统一负责（`agent-session-manager.ts:2606-2608` 注释，域外）。
- 半成品清理：`removeForkPath` 默认 `{recursive:true, force:true}`（`:60`）用于清 fork 半成品（注释 `:59`）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无路径授权逻辑；路径合法性由调用方保证（如 `agent-fork-workspace-copy` 的 blocklist、`agent-session-manager` 的会话目录推导）。

## 8. 修改影响面

- `copyForkPath`/`describeForkFileError`：`agent-fork-workspace-copy.ts` 的 fork 工作区复制与失败报告。
- `renameForkFile`：`agent-session-manager.ts:2619` JSONL 原子改写（改重试语义会影响 fork 会话复制的原子性）。
- `removeForkPath`：`agent-session-manager.ts:1580` 会话删除清理（默认参数变化影响清理强度）。
- `buildForkProjectKey`：输出必须与「迁移流程」同规则（`:64` 注释）；输出变化会导致 project 目录键不匹配（迁移侧域外）；测试 `agent-fork-workspace-copy.test.ts:78-85` 断言其稳定性。
- 需同步修改的测试：`agent-fork-workspace-copy.test.ts`（fork 复制计数与 key 稳定性断言）。

## 9. 测试证据

- 直接测试：**无专属测试文件**（检索范围：冻结树全文件 `grep fork-file-ops|六导出名`）。
- 间接证据（`agent-fork-workspace-copy.test.ts`，4 test，bun:test，NOT_RUN）：
  - `:78-85`「超长 Windows 路径生成 project key」：`expect(first).toBe(second)`（稳定性）+ `expect(first.length).toBeLessThanOrEqual(240)`（长度受控）——**直接**调用 `buildForkProjectKey`。
  - `:32-63`「fork 工作区复制保留 .context 跳过高风险目录」：经 `copyForkWorkspaceFiles` 间接覆盖 `copyForkPath` 递归复制与 filter；真实断言 `copiedCount=6/skippedCount=3/failedCount=0` 及逐目录 `existsSync`。
  - `:65-76`「源目录不存在返回结构化失败」：间接覆盖 `describeForkFileError`（断言 `reason` 含 `ENOENT`）。
- 未覆盖：`renameForkFile`、`removeForkPath`、`copyForkFile` 无任何测试；重试退避路径（RETRYABLE_CODES）未被测试触发。
- `NOT_RUN`：本轮未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出签名/默认参数 | 已证实 | `:19-73` |
| 重试序列与可重试码集合 | 已证实 | `:6-7`、`:30-42` |
| 首次 delay=0、不可重试立即抛 | 已证实 | `:32-41` |
| `copyForkFile` 全树 0 实际调用点 | 已证实 | 全冻结树检索（§4 范围），仅 import 行 |
| `buildForkProjectKey` 在 agent-session-manager 引而未用 | 已证实 | `agent-session-manager.ts:31` 无其余命中 |
| Atomics.wait 阻塞事件循环 | 已证实 | `:11` |
| 与迁移流程键规则一致 | 未知 | 迁移侧实现域外，仅注释（`:64`）声明 |
| Windows Defender 场景实际效果 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `describeForkFileError` | §2/§3 | 19-23 | covered |
| `copyForkPath`/`copyForkFile` | §3/§4 | 45-52 | covered |
| `renameForkFile` | §3/§4 | 55-57 | covered |
| `removeForkPath` | §3/§4 | 60-62 | covered |
| `buildForkProjectKey` | §3/§9 | 65-73 | covered |
| `withForkFsRetry` 退避分支 | §3/§6 | 30-42 | covered |
| RETRYABLE_CODES 重试路径 | §6/§9 | 7,38 | partial（无测试触发） |
| 迁移侧键一致性 | §10 | 64 | unknown |
