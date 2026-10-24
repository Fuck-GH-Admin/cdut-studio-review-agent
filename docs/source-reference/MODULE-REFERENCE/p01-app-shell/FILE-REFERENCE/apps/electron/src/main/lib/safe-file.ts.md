---
path: apps/electron/src/main/lib/safe-file.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 01aee42e9206db24bf8fabcb915f2b6591730ad8
sha256: 5d361bf9e743327ddf78ebb5bed93eadb25e46a14307a074fcd1abdee9ff3ef4
lines: 90
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/safe-file.ts

## 1. 结论与边界

**崩溃安全的 JSON 文件读写工具**（90 行）：写入走 write-to-temp → rename（POSIX 原子）+ `.bak` 备份；读取主文件 → `.tmp` 残留 → `.bak` 三层容错，解决强关机/崩溃导致 JSON 索引截断的问题（模块注释 `:1-7`）。

边界：只服务 JSON 单文件（对象序列化，2 空格缩进）；不做并发锁（调用方串行）；不管理目录；`.bak` 语义由调用方用 `skipBackup` 控制。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `writeJsonFileAtomic` | 导出函数 | 15-33 | `(filePath, data: object, skipBackup = false): void` | 原子写 |
| `readJsonFileSafe` | 导出函数 | 39-90 | `<T>(filePath) => T \| null` | 三层容错读 |

导出计数：`export` 2 条（`:15`、`:39`），与源码一致。

## 3. 内部逻辑与关键流程

- **writeJsonFileAtomic**（`:15-33`）：`skipBackup=false` 且目标存在时先 `copyFileSync(→ .bak)`（失败不阻塞，`:20-26`）；`writeFileSync(.tmp, JSON.stringify(data, null, 2))`（`:29`）；`renameSync(.tmp → filePath)`（`:32`，注释：POSIX rename 原子）。
- **readJsonFileSafe**（`:39-90`）：
  1. 主文件存在且非空白 → `JSON.parse` 返回；解析失败/空 → `console.warn('[数据恢复] 主索引文件损坏')` 继续（`:43-53`）。
  2. `.tmp` 存在：解析成功 → **`renameSync(.tmp → 主文件)` 提升为主文件**并返回（`:56-65`）；失败 → `unlinkSync(.tmp)` 清理（`:70`）。
  3. `.bak` 存在：解析成功 → **`writeJsonFileAtomic(主文件, parsed, true)`**（skipBackup 防止用损坏主文件覆盖好 `.bak`，`:79-82`）恢复并返回。
  4. 全失败 → `null`（注释：需上层从 JSONL 重建，`:89`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep safe-file|writeJsonFileAtomic|readJsonFileSafe`，apps+packages 全类型）：
  - `apps/electron/src/main/lib/knowledge-item-service.ts:20` import（同批 nb-130 手册交叉引用）：`readIndex` 用 `readJsonFileSafe`、`writeIndex` 用 `writeJsonFileAtomic`（`knowledge-item-service.ts:97-107`）。
  - 其余消费者（会话/工作区索引等）以相同模式使用（全树检索命中多个主进程索引模块，逐文件主手册属他批）。
- 出向：`node:fs` 的 `writeFileSync/renameSync/existsSync/copyFileSync/readFileSync/unlinkSync`（`:9`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：`<filePath>.tmp` → rename 覆盖 `<filePath>`；`<filePath>.bak` 备份（可选）。
- 磁盘读：主/`.tmp`/`.bak` 三文件。
- 恢复动作：`.tmp` 提升、`.bak` 回写（`:62`、`:80`）。
- 无网络/无全局状态；副作用=文件系统变更 + console 日志。

## 6. 分支、失败、取消与恢复

- 备份失败：静默继续写入（`:23-25`）。
- 主文件损坏：`.tmp`→`.bak` 逐级回退（§3）；`.tmp` 无效会被删除（`:70`）；`.bak` 也坏 → `null` + console.error（`:84-89`）。
- 写入路径无 try/catch：`writeFileSync`/`renameSync` 失败会抛出到调用方（照实记录 §10）。
- 取消/恢复：同步函数不适用取消；崩溃恢复即三层读取语义本身。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、路径由调用方决定；纯 fs 工具。

## 8. 修改影响面

- 所有 JSON 索引持久化的健壮性（`knowledge-item-service` 等）；rename 原子性依赖 POSIX 语义（Windows 下 Node 实现为近似原子——照实推断）。
- `skipBackup` 语义变化影响 `.bak` 回退链；测试：无专属测试文件（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：`knowledge-item-service.test.ts`（同批 nb-130，4 test）经 `readIndex/writeIndex` 间接走读写路径（断言索引内容，不断言容错链）。
- 未覆盖：`.tmp`/`.bak` 回退、备份失败、写抛错路径。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与三层容错链 | 已证实 | `:15-90` |
| `.tmp` 提升/`.bak` 回写+skipBackup 防覆盖 | 已证实 | `:62`、`:79-82` |
| 备份失败不阻塞写入 | 已证实 | `:20-26` |
| 写路径异常直抛 | 已证实 | `:29-32` 无 catch |
| Windows rename 原子性 | 推断 | Node/POSIX 语义，未实测 |
| 专属测试缺失 | 已证实 | 全冻结树检索（§9 范围） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `writeJsonFileAtomic` | §3/§5 | 15-33 | covered |
| `readJsonFileSafe` 三层 | §3/§6 | 39-90 | covered |
| 恢复动作（提升/回写） | §5 | 62-82 | covered |
| 容错链测试 | §9 | — | unknown（无测试） |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
