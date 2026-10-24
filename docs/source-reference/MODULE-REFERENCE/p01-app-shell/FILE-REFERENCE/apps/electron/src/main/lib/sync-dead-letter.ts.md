---
path: apps/electron/src/main/lib/sync-dead-letter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9c5908cfc9e4e7babff1dc4647e5e1607d408390
sha256: 8dd02cb5811488836f9e1e05166ddbc01dc1dd13231eb142469b755097c20e72
lines: 45
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/sync-dead-letter.ts

## 1. 结论与边界

**同步死信队列**（45 行）：超过重试上限的 `SyncEnvelope` 追加写入 JSONL（不静默丢弃），供 UI 查看/手动重试/导出（模块注释 `:1-4`）。

边界：只做落盘与读取；重试上限判定在 `sync-manager.pushEnvelopes`（域外同批）；不主动重放。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `writeDeadLetterEnvelopes` | 导出函数 | 20-28 | `(envelopes: SyncEnvelope[]): void` | 追加写死信 |
| `readDeadLetters` | 导出函数 | 30-41 | `(): SyncEnvelope[]` | 读全部 |
| `getDeadLetterFilePath` | 导出函数 | 43-45 | `(): string` | 路径暴露（导出/查看用） |
| `getDeadLetterPath` | 内部函数 | 12-18 | 懒解析 `<config>/sync/dead-letters.jsonl` | 模块级缓存 |
| `deadLetterPath` | 内部变量 | 10 | 路径缓存 | |

导出计数：`export` 3 条（`:20`、`:30`、`:43`），与源码一致。

## 3. 内部逻辑与关键流程

- **getDeadLetterPath**（`:12-18`）：缓存命中返回；否则 `<getConfigDir()>/sync/` 目录不存在则 `mkdirSync(recursive)`；缓存 `dead-letters.jsonl` 全路径。
- **writeDeadLetterEnvelopes**（`:20-28`）：逐条 `{...env, dead_letter_at: Date.now()}`（同一调用共享同一时间戳，`:22`）`appendFileSync` JSONL；console.warn 报数量与路径。
- **readDeadLetters**（`:30-41`）：文件不存在/空 → `[]`；按行 `JSON.parse`；任一行解析失败 → console.error + **返回 `[]`**（整批丢弃，照实记录 §10）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep sync-dead-letter|三导出名`，apps+packages 全类型）：
  - `apps/electron/src/main/lib/sync-manager.ts:196-197`：`pushEnvelopes` 失败路径对 `retryCount > MAX_RETRY_COUNT(5)` 的信封动态 `import('./sync-dead-letter')` 写死信（`sync-manager.ts:192-201`）。
  - `readDeadLetters`/`getDeadLetterFilePath`：全冻结树检索仅本文件定义（UI 查看/导出入口在域外按通道消费，本批未见直接调用点——照实记录 §10）。
- 出向：`node:fs`（`appendFileSync/existsSync/mkdirSync/readFileSync`，`:5`）、`./config-paths.getConfigDir`（`:7`）、`./sync-types.SyncEnvelope` 类型（`:8`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：`<config>/sync/dead-letters.jsonl`（append-only JSONL）；目录自动创建。
- 磁盘读：整文件读入内存按行解析。
- 副作用：console.warn/error；无网络。

## 6. 分支、失败、取消与恢复

- 写入：`appendFileSync` 失败会抛出到 `sync-manager` 的 try/catch（`sync-manager.ts:198-200` catch「死信持久化失败」仅记日志）。
- 读取：解析失败整批返回 `[]`（`:37-40`）——**坏行会导致好行一并丢失**（照实记录）。
- 取消/恢复：同步函数不适用；死信文件不自动重放，UI 手动处理（注释 `:3`）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；死信内容为本地同步信封（含 payload），文件位于用户配置目录。

## 8. 修改影响面

- `sync-manager` 失败路径（`:192-203`）与 UI 死信查看/导出（域外）。
- `SyncEnvelope` 形状（`./sync-types`）变化需同步 `dead_letter_at` 附加字段约定。
- 测试：无专属测试（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：无（`sync-manager` 亦无专属测试，见该手册）。
- 未覆盖：写入/读取/坏行/目录创建。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出与 JSONL 形状 | 已证实 | `:20-45` |
| 头注释路径 `~/.cdutai/sync-dead-letters.jsonl` 与实现 `<config>/sync/dead-letters.jsonl` 不一致 | 已证实 | 注释 `:3` vs `:14-16`（照实记录） |
| 读取坏行整批返回 [] | 已证实 | `:37-40` |
| 同一调用共享 dead_letter_at | 已证实 | `:22-25` |
| `readDeadLetters`/`getDeadLetterFilePath` 0 直接消费者 | 已证实 | 全冻结树检索（§4 范围） |
| UI 消费面 | 未知 | 域外（注释声明用途） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `writeDeadLetterEnvelopes` | §3/§5 | 20-28 | covered |
| `readDeadLetters` | §3/§6 | 30-41 | covered |
| `getDeadLetterFilePath`/路径缓存 | §2/§3 | 10-18,43-45 | covered |
| 注释/实现路径不一致 | §10 | 3,14-16 | covered |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
