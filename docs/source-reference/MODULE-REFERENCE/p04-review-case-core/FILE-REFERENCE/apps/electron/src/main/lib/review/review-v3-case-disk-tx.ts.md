---
path: apps/electron/src/main/lib/review/review-v3-case-disk-tx.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8117ffab25417d648f5bbd73f730a7ce456e30a6
sha256: 1cc36fcda00fa3ddea2c7623217dda2a6a26de246da6f156c3f383d067ce7440
lines: 198
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-case-disk-tx.ts

## 1. 结论与边界

Dev-C C-Tx-R01：**跨进程单案磁盘事务栅栏**。以 `mkdir(O_EXCL)` 作为文件系统线性化的锁点（`review-v3-case-disk-tx.ts:4-6`），每个原生 Case 写事务必须持有该案卷的 OS 锁；进程内 Promise 队列不足以跨独立 Electron Main 进程互斥。崩溃进程**故意留下锁**，绝不按时间租约自动抢夺（:8-11），恢复需独立离线维护授权 + 同机死 PID 证明。

边界：本文件不做业务读写（`writeC2CaseStateDurably` 只写调用方给的文本）；不提供 Renderer/IPC 接口（:11、:161-162 注释）；不做任何 sender/role 权限判断（授权由调用方 `authorize` 回调承担）。

## 2. 导出与关键符号

导出 5 个函数（无类型/常量导出）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `withC2CaseDiskTransaction` | async fn | 78 | `(caseId, work: () => Promise<T>) => Promise<T>` | 异步事务：持锁执行，可重入 |
| `withC2CaseDiskWriteSync` | fn | 103 | `(caseId, write: () => T) => T` | 同步直写路径（fixture/迁移），同一把锁 |
| `writeC2CaseStateDurably` | fn | 118 | `(caseId, text) => void` | 耐久写 state.v2.json：fsync+rename+目录 sync |
| `inspectC2CaseDiskLock` | fn | 155 | `(caseId) => {locked, owner?}` | 只读审计（禁止据此抢锁） |
| `recoverC2AbandonedCaseDiskLock` | fn | 170 | `(caseId, authorize: (owner) => void) => void` | 显式离线恢复孤儿锁 |

关键内部符号：`context`（:23，`AsyncLocalStorage<Map<string,string>>`，锁 token 传播）、`maxWaitMs`（:24，30_000）、`Owner`（:25，`{schemaVersion:'review-v3-case-disk-lock/1', token, pid, acquiredAt}`）、`refuse`（:26，抛 `C_TX_RECOVERY_REQUIRED: …`）、`paths`（:27-31）、`ownerPath`（:32）、`isExists`（:33-35，判 `EEXIST`）、`readOwner`（:37-45）、`assertOwned`（:46-48）、`holdOne`（:49-69）、`releaseOne`（:70-74）、`sleep`（:75）。

## 3. 内部逻辑与关键流程

1. **路径** `paths`（:27-31）：`assertSafeReviewStorageId(caseId)` 后给出 `{root: review-cases/{id}, lock: root/.state.v2.tx.lock, state: root/state.v2.json}`。
2. **拿锁** `holdOne`（:49-69）：`mkdirSync(root, recursive, 0o700)` → `mkdirSync(lock, 0o700)`（已存在即抛 EEXIST，这就是互斥点）→ `token=randomUUID()` 写 `owner.json`（`openSync('wx', 0o600)` + `writeFileSync` + `fsyncSync`，:59-61）；owner 写失败则**不留孤儿锁**：尝试 unlink owner.json + rmdir lock 后重抛（:62-66）。
3. **持有校验** `readOwner`（:37-45）：解析 `owner.json`，要求 schemaVersion 精确、token 非空串、pid 为正安全整数；任一不符返回 `undefined`。`assertOwned`（:46-48）token 不符即 `refuse('disk lock lost or replaced')`。
4. **异步事务** `withC2CaseDiskTransaction`（:78-100）：id 校验（:79）；若 AsyncLocalStorage 已持本锁 → `assertOwned` 后直跑 `work()`（可重入，:82-85）；否则自旋 `holdOne`：EEXIST 时 10ms 间隔等待（:88-95），超过 30s → `refuse('busy or abandoned case lock; no automatic stale lock stealing')`（:92），非 EEXIST 错误直接重抛（:91）；持有后把 token 放入 store 传入 `context.run`（:96-98），`finally releaseOne`（:99）。
5. **同步直写** `withC2CaseDiskWriteSync`（:103-112）：context 已持锁 → 校验后直写（:105-106）；否则 `holdOne` 一次（**不等待**），EEXIST → `refuse('unleased direct writer blocked by another PID')`（:109）；持有后 `context.run` 执行 `write`，`finally releaseOne`。
6. **释放** `releaseOne`（:70-74）：先 `assertOwned`，`unlinkSync(owner.json)` + `rmdirSync(lock)`。
7. **耐久写** `writeC2CaseStateDurably`（:118-152）：无 context token → `refuse('durable state write without C-Tx owner')`（:120-121）；`assertOwned`（:122）；tmp 名 `state.{uuid}.tmp`（:123）`openSync('wx', 0o600)` 写 + fsync + close（:127-130）；再次 `assertOwned`（:131）；ASSET-17 备份：当前 `state.v2.json` 若存在**且可 JSON 解析**，复制为 `.previous.json`（bakTmp `wx` + rename，:134-141；备份失败吞掉不阻断业务写，注释 :141）；`renameSync(tmp, state)`（:143）；非 win32 打开 root 目录 fsync（:144-147）；失败路径：已建 tmp 则 unlink 清理（unlink 失败保留残片作证据，:148-150）后重抛。
8. **审计** `inspectC2CaseDiskLock`（:155-158）：返回 `{locked: existsSync(lock), owner: readOwner(lock)}`；注释 :154 明确 PID 存活**不构成**抢锁授权。
9. **恢复** `recoverC2AbandonedCaseDiskLock`（:170-198）：`authorize` 非函数 → refuse（:174）；无锁 → refuse('no orphan Case lock to recover')（:177）；`mkdirSync(lock + '.recovery')` 失败 → refuse('another recovery process is active')（:178-179，恢复者自身互斥）；owner 缺失/非法 → refuse（:181-182）；调 `authorize(structuredClone(owner))`（:183）；死 PID 证明：`process.kill(owner.pid, 0)` 抛 `ESRCH` 才算 dead（:185-190）；否则 refuse('owner PID is alive, recycled, or not provably dead')（:191）；token 复核（:192）后 unlink owner.json + rmdir lock（:193-194）；`finally rmdirSync(recovery)`（:195-197）。

## 4. 调用者与调用链

入向（全树 grep `review-v3-case-disk-tx`，仅 2 处 import）：
- `case-store-v2.ts:19` 导入 `withC2CaseDiskTransaction/withC2CaseDiskWriteSync/writeC2CaseStateDurably`；调用点：`writeAggregate:171-172`（writeSync+durable）、`enqueueCase:179-180`（transaction）。因此全部 V2 业务写（`submitCommand/createAggregate`）都经本栅栏。
- `review-v3-case-disk-tx.test.ts:8-11` 直接导入 3/5 个导出（`inspectC2CaseDiskLock`/`recoverC2AbandonedCaseDiskLock`/`withC2CaseDiskTransaction`）；`withC2CaseDiskWriteSync`/`writeC2CaseStateDurably` 经 `case-store-v2.writeAggregate`（:171-172）间接覆盖；另以 `spawn(process.execPath, ['-e', …])` 起真实子进程直接 import 本模块拿锁（:34-45）。
- `inspectC2CaseDiskLock` / `recoverC2AbandonedCaseDiskLock` **无生产调用者**（全冻结树检索 `inspectC2CaseDiskLock|recoverC2AbandonedCaseDiskLock` 仅命中本文件定义与该测试文件）——恢复通道为程序内 API，无 IPC/自动化接线。

出向：`../config-paths getConfigDir`（:20）；`./review-storage-id assertSafeReviewStorageId`（:21）；`node:async_hooks AsyncLocalStorage`、`node:crypto randomUUID`、`node:fs` 系列、`node:path join`（:13-19）。

## 5. 数据 I/O、读写与副作用

- 磁盘产物：锁目录 `{caseDir}/.state.v2.tx.lock/`（内含 `owner.json`，0o600，fsync）、恢复栅栏 `{lock}.recovery/`、状态文件 `state.v2.json` 与其 `.previous.json` 备份、随机名 tmp。
- 权限位：root/lock 目录 `0o700`，owner/tmp `0o600`（:51-52/:59/:127/:139）。
- 副作用：进程信号探活 `process.kill(pid, 0)`（:186，仅探测不发信号）；`setTimeout` 轮询（:75）；无日志/网络/窗口。
- 并发交错语义：同进程重入免重拿（:82-85）；跨进程排队（自旋 ≤30s）；崩溃残留锁保留至显式恢复（:8-11）。

## 6. 分支、失败、取消与恢复

- 全部拒绝路径统一抛 `Error('C_TX_RECOVERY_REQUIRED: ' + why)`（`refuse`，:26）：锁被替换（:47）、忙/弃锁超时（:92）、无租约直写遇他人持锁（:109）、无锁主写（:121）、无孤儿锁可恢复（:177）、恢复并发（:179）、owner 记录缺失/非法（:182）、PID 活/复用/不可证死（:191）、恢复期间 owner 变更（:192）。
- `holdOne` 的 owner 写失败清理孤儿锁（:62-66）；`writeC2CaseStateDurably` 失败清理 tmp（:148-150），备份失败不阻断（:141）。
- 无取消/超时中断接口：`withC2CaseDiskTransaction` 的 30s 是**拿锁等待**上限而非事务超时；`work()` 执行期间无看门狗。
- 恢复语义如 §3.9：只接受「精确 owner 已证明死亡」；PID 被复用/进程仍活/无法检查一律拒绝（:165-167 注释）。

## 7. 权限与权威状态

- 锁即权威：`owner.json` 的 token 是持有凭证，每次写前后 `assertOwned`（:122/:131）防止锁被替换后的写入。
- 恢复授权不在本文件内判定：`authorize(owner)` 回调由调用方注入（须独立认证的维护权威，:160-168 注释）；本文件只强约束「证明死 PID + token 未变 + 单恢复者」。
- 无 sender/role 分支：依据为全文件无 IPC event/角色检查；Renderer 不可达（无 handler 注册）。

## 8. 修改影响面

- 锁协议变更是**跨进程协议变更**：影响 `case-store-v2.ts` 的全部写路径与所有 V2 业务服务；旧版本进程持锁形态（owner.json schemaVersion）变更会使 `readOwner` 判非法 → 拒绝恢复读取/抢锁。
- `writeC2CaseStateDurably` 的备份行为影响 `case-store-v2.readAggregate` 的回退（`case-store-v2.ts:56-71`）与 `listCaseStorageIssues` 的 `canReadFromBackup`。
- 无直接单测之外的验证手段；修改需同步 `review-v3-case-disk-tx.test.ts`（4 用例含真实子进程）与 `case-store-v2.test.ts`。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-case-disk-tx.test.ts`（4 用例 / 1 describe，`C-Tx R01 same-Case durable multi-PID CAS fence` :61）。隔离 `PROFER_CONFIG_DIR=work/tmp/v3-c-tx-r01-{Date.now()}`（:13-15）；`seed()` 用真实 `createAggregate`（:24）；`command()` 走真实 `submitCommand`（:25-32）；子进程通过 `spawn(process.execPath, ['-e', …])` 动态 import 模块 URL（:34-45），`awaitLocked` 读 stdout `LOCKED`（:46-59）。本轮 **NOT_RUN**（含子进程用例；win32 分支 :81/:105 直接 return）。

逐用例真实断言：
1. `:62-77` 双并发写同案：`[a.ok,b.ok]` 恰 1 个 true、失败者 `code==='VERSION_CONFLICT'`、`revision===1`、`receiptLog` 长度 1；赢家以 revision 0 重放 `again.ok===true` 且回执仍 1 条（幂等）。
2. `:79-101` 真实子 PID 持锁：`inspectC2CaseDiskLock` locked=true 且 `owner.pid===child.pid`；父进程 `writeAggregate` 抛 `'C_TX_RECOVERY_REQUIRED'`；随后 `submitCommand` 等待 ≥100ms 后成功、revision=1；子进程退出后锁自动释放（locked=false）。
3. `:103-122` 崩溃 PID 残锁：子进程正常退出但锁仍在（locked=true、pid 记录不变）；`recoverC2AbandonedCaseDiskLock(id, () => { throw })` 抛 `'not authorized'` 且锁仍在；授权回调校验 `owner.pid/token` 与 `inspect` 一致后恢复成功（locked=false）；恢复后 `submitCommand` 成功且 `receiptLog` 1 条。
4. `:124-131` 当前活跃 PID 的锁不可夺：事务内调用恢复（空授权）抛 `'alive'`；事务结束锁自动释放。

间接证据：`case-store-v2.test.ts`（全部写路径经本栅栏，无锁异常）；`review-v3-case-storage-durability.test.ts`（.previous.json 恢复语义间接）。

未覆盖（缺口）：30s 等待超时分支、`withC2CaseDiskWriteSync` 遇他人持锁分支、owner.json 写失败清理、`.previous.json` 备份失败吞错、恢复期间 token 变更分支、win32 行为（用例直接 return）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出符号/行号如 §2 | 已证实 | :78-170 逐条 `export` |
| mkdir(O_EXCL) 为互斥点、崩溃留锁不自动夺 | 已证实 | :49-68、:8-11；测试 :103-122 |
| 耐久写 = fsync 文件 + rename + 非 win32 目录 sync | 已证实 | :127-147 |
| 恢复需 authorize + ESRCH 死 PID 证明 + token 复核 | 已证实 | :170-197；测试 :103-131 |
| 活跃 PID 永不被夺（即使授权回调为空） | 已证实 | :185-191；测试 :124-131 |
| `inspect/recover` 无生产调用者 | 已证实（否定结论） | 全冻结树 grep 两符号仅本文件+测试 |
| 同进程重入免重拿锁 | 已证实 | :82-85 |
| 跨进程 30s 后的行为（真实多 Main 场景） | 未知 | 仅单测单机子进程模拟，未跑 NOT_RUN 之外的真实双 Main |
| win32 目录 fsync 省略的耐久性差异 | 推断 | :144 `process.platform!=='win32'`；无 win32 用例 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `withC2CaseDiskTransaction`（重入/等待/超时） | §3.4 | 78-100 | covered |
| `withC2CaseDiskWriteSync`（直写/拒斥） | §3.5 | 103-112 | covered |
| `writeC2CaseStateDurably`（fsync/备份/失败清理） | §3.7 | 118-152 | covered |
| `inspectC2CaseDiskLock` | §3.8 | 155-158 | covered |
| `recoverC2AbandonedCaseDiskLock`（全部 refuse 分支） | §3.9/§6 | 170-198 | covered |
| `holdOne/releaseOne/assertOwned/readOwner` | §3.2-3.3 | 37-74 | covered |
| 30s 超时分支 | §9 缺口 | 87-92 | unknown（未测） |
| win32 行为 | §10 | 144 | unknown |
