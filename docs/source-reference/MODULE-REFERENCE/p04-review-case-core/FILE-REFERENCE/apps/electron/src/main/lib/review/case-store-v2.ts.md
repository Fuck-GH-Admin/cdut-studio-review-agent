---
path: apps/electron/src/main/lib/review/case-store-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab33b4e3614b6c7b42dcc8751455fbe7f47f48b4
sha256: 643676c9fd19a7795c02e18ba79be83008f8a578c9ee67b097b8d496a7d651bf
lines: 284
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-store-v2.ts

## 1. 结论与边界

V2 案卷聚合的存储与应用事务层（N1c，头注 `case-store-v2.ts:1-11`）：单案业务事务文件 `review-cases/{caseId}/state.v2.json`，逐案串行队列 + 跨进程磁盘锁，命令级幂等（requestId+payloadHash）、乐观并发（expectedRevision CAS）、归档冻结、回执与业务同事务落盘；另提供 ASSET-17 损坏主账的只读回退与 ASSET-12 坏案卷诊断索引。

边界：
- 不含业务规则：命令处理器 `CommandHandler` 由调用方注入（:191-192），本层只做事务不变量；不在本层校验 sender/actor 身份（`actor` 仅作为回执元数据写入，:253-254）。
- 不写 V1 `case.json`；V1 兼容入口在 `case-store.ts`（其仅只读本文件 `readAggregate`）。
- 磁盘锁与耐久写委托 `review-v3-case-disk-tx.ts`（:19）。

## 2. 导出与关键符号

导出 13 项（9 函数 + 2 接口 + 1 类型 + 1 类），与 `export` 逐条一致：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `emptyAggregate` | fn | 23 | `(caseV2) => CaseAggregateV2` | 空聚合（9 个空数组） |
| `readAggregate` | fn | 51 | `(caseId) => CaseAggregateV2 \| undefined` | 读主账，损坏回退 `.previous.json` |
| `CaseStorageIssue` | interface | 75 | `{caseId, code, message, canReadFromBackup}` | 诊断条目；code 4 值 |
| `listCaseStorageIssues` | fn | 86 | `() => CaseStorageIssue[]` | 只读诊断索引（不修复） |
| `AggregateSummary` | interface | 123 | `{caseId,title,stage,revision,templateId,templateVersion,updatedAt}` | 聚合摘要 |
| `listAggregatesV2` | fn | 133 | `() => AggregateSummary[]` | 摘要列表（updatedAt 倒序） |
| `writeAggregate` | fn | 167 | `(aggregate) => void` | 持锁耐久写（直写入口） |
| `payloadHash` | fn | 187 | `(type, payload) => string` | `sha256(type\|JSON(payload))` |
| `CommandHandler` | type | 192 | `(aggregate, payload) => {summary, mutate}` | 校验+纯变更，抛错中止 |
| `CommandSourceMeta` | interface | 195 | `{assignmentId?, sessionId?}` | Agent 代操作追溯 |
| `submitCommand` | fn | 203 | `(caseId, command, handler, source?) => Promise<ReviewCommandResult>` | 命令事务主入口 |
| `CommandValidationError` | class | 264 | `(code: CommandErrorCode, message)` | 业务校验错误（带错误码） |
| `createAggregate` | fn | 271 | `(caseId, caseV2, initialReceipt?, authorizeAtCommit?) => Promise<void>` | 建案事务（revision=0 起） |

关键内部符号：`writeQueues`（:29）、`aggregatePath`（:31-34）、`previousAggregatePath`（:36-38）、`isUsableAggregate`（:40-45）、`enqueueCase`（:177-183）。

## 3. 内部逻辑与关键流程

1. **路径** `aggregatePath`（:31-34）：`assertSafeReviewStorageId(caseId, 'caseId')`（`review-storage-id.ts:8-16`，白名单 `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$` 且禁 `..`）后 join `review-cases/{caseId}/state.v2.json`。
2. **读取** `readAggregate`（:51-73）：主账不存在 → `undefined`（:53）；解析成功直接返回（:54-55）；解析失败 `console.warn` 后尝试 `.previous.json`（:56-59），备份须过 `isUsableAggregate`（:40-45：`caseV2.id === caseId`、`revision` 为安全非负整数、`receiptLog` 为数组），不合法拒绝恢复（:62-65），合法则 warn 提示恢复读取并返回（:66-67）；备份也不可读 → `undefined`（:68-70）。**不写业务数据、不改写主账**（ASSET-17 注释 :47-50）。限定：路径解析经 `aggregatePath → getConfigDir()`（`config-paths.ts:80-90`），配置目录缺失时会 `mkdirSync`（目录创建副作用，非 JSON 写）。
3. **诊断** `listCaseStorageIssues`（:86-120）：遍历 `review-cases/`；非法 id 跳过（:91）；无主账时，仅有 `case.json` 的旧 V1 目录不算损坏（:95-96），否则 `missing-main`（:97）；主账 JSON 不可解析 → `invalid-main-json`（:103）；形状不合法 → `invalid-main-shape`（:107）；主账可用但 `.previous.json` 的 revision 更高 → `main-behind-backup` 提示核验（:110-115），备份损坏不阻断（:116）。
4. **摘要** `listAggregatesV2`（:133-164）：逐目录读聚合；形状全检（id/title/stage/templateId/templateVersion/revision/updatedAt/receiptLog，:145-149）不过则 warn 跳过（:150-152）；`updatedAt.localeCompare` 倒序（:163）。
5. **写入** `writeAggregate`（:167-174）：校验 id 后 `withC2CaseDiskWriteSync(id, …)` 持 OS 锁调 `writeC2CaseStateDurably(id, JSON.stringify(aggregate, null, 2))`（`review-v3-case-disk-tx.ts:103-112/:118-152`：唯一随机名 tmp + fsync + rename + 非 win32 目录 sync；写前把可解析旧主账备份为 `.previous.json`，:134-142）。注释 :169-170 说明直写者（fixture/迁移）也必须拿同一把锁。
6. **队列** `enqueueCase`（:177-183）：同 caseId 严格串行、跨案并发；任务包在 `withC2CaseDiskTransaction(caseId, task)`（:179-180，前序成败都继续）；队尾存 `next.catch(()=>undefined)` 吞错防链断裂，返回的 promise 保留错误。
7. **事务** `submitCommand`（:203-261），逐序：
   - `assertSafeReviewStorageId`（:209）→ 队列内 `readAggregate`，缺失返回 `{ok:false, code:'NOT_FOUND'}`（:211-212）。
   - 可解析但形状坏 → `INVALID_TRANSITION`（:213-219），绝不让坏 JSON 变成可写伪案卷。
   - 幂等：`payloadHash(command.type, payload)`（:222）与 `receiptLog` 中同 `requestId` 回执比对；同 hash 同 type → 返回原回执 + 当前聚合（:224-227）；同 id 不同载荷 → `REQUEST_ID_COLLISION`（:228）。
   - CAS：`command.expectedRevision !== aggregate.caseV2.revision` → `VERSION_CONFLICT` 携 `currentRevision`（:232-234）。
   - 归档冻结：`stage === 'archived'` 且命令不是 `RestoreReviewCaseV3` → `INVALID_TRANSITION`（:238-240，注释 :235-237）。
   - handler 执行（:243-248）：抛 `CommandValidationError` 保留其 `code`，其他错误归为 `VALIDATION_FAILED`；无部分写入（写盘在后）。
   - `structuredClone` 复制草稿 → `applied.mutate(draft)`（:249-250）→ revision 事务内统一 +1 一次、`updatedAt` 刷新（:251-252）→ 回执带 `payloadHash/revision/at/summary/actor` 与可选 `assignmentId/sessionId`（:253-254）追加 `receiptLog`（:255）→ `writeAggregate(draft)` 同事务落盘（:257-258）→ 返回 `{ok:true, receipt, aggregate, entity}`（:259）。
8. **建案** `createAggregate`（:271-284）：双 id 校验且必须一致（:272-274，不一致抛 `CommandValidationError('VALIDATION_FAILED')`）；队列内 `existsSync(aggregatePath)` 已存在 → `INVALID_TRANSITION`（:276）；**落盘前**调用可选 `authorizeAtCommit`（:277-278，注释「Main capability must still be alive at the serialized durable write」）；`emptyAggregate` 后可选初始回执与创建动作同事务（:279-282）。

## 4. 调用者与调用链

入向（生产；全树 grep：静态 `from './case-store-v2'` 75 处 + 动态 `require('./case-store-v2')` 3 处（`review-ipc.ts:985/:1247`、`adapters/pi-review-ops-tools.ts:277`），生产约 40 处）：
- `application-service.ts:16`（`createCaseFromTemplate/updateFields/correctObservation/setEvidenceLink/upsertCaseSubject` 全走 `submitCommand`，receipt `:210`）；`stage-workflow.ts:17`、`material-service.ts:15`、`material-lifecycle-v3.ts:7`、`workspace-service-v2.ts:8`、`workspace-business-service-v2.ts:6`、`rating-service.ts:11`、`case-lifecycle-v3.ts:10`、`plan-binding-v3.ts:10`、`batch-automation-service.ts:10`、`batch-group-action-service.ts:12`（均 `submitCommand`/`CommandValidationError`）。
- `native-workspace-case-v3.ts:11`（`createAggregate/payloadHash/readAggregate/submitCommand/CommandValidationError`）；`review-d2-runtime.ts:14`（建 D2 技术案卷/计划安装）；`review-v3-run-writer.ts:19`、`review-v3-technical-ledger.ts:15`、`review-v3-durable-host-fence.ts:15`（回执 hash 复核 `:42`）、`review-v3-f13-main-service.ts:10`、`review-v3-t05-main-service.ts:20`、`review-v3-t06-main-service.ts:22`、`review-v3-main-template-run.ts:18`、`review-v3-main-trust-port.ts:22`、`review-v3-main-pi-factory.ts:14`、`review-v3-main-d4-local-plan.ts:11`、`review-v3-main-b1-local-plan.ts:6`、`review-v3-main-local-product-intake.ts:16`、`review-v3-main-local-technical-review.ts:18`、`review-v3-t09-asset-registration.ts:13`、`review-strict-pi-tools.ts:12`、`run-service-v2.ts:14`、`batch-automation-service` 系列、`review-v3-durable-host-fence.worker.ts:3`。
- `case-store.ts:18`（V1 层只读 `readAggregate`）；`review-c0-case-service.ts:8`（`payloadHash/readAggregate/CommandValidationError`）；`run-async-service.ts:12`（仅类型 `CommandSourceMeta`）。
- 动态 require：`review-ipc.ts:985-986`（`listCaseStorageIssues` → `LIST_CASE_STORAGE_ISSUES_V3`）、`:1247-1248`（`listAggregatesV2` → `LIST_CASES_V2`）；`pi-review-ops-tools.ts:277-278`（`listAggregatesV2`）；`apps/electron/scripts/review-d2-plan.ts:13`（CLI 读 `readAggregate`）。

出向：`./review-storage-id` `assertSafeReviewStorageId`（:18）；`./review-v3-case-disk-tx` `withC2CaseDiskTransaction/withC2CaseDiskWriteSync/writeC2CaseStateDurably`（:19，调用点 :171-172/:179-180）；`../config-paths` `getConfigDir`（:17）；`node:fs` `existsSync/readdirSync/readFileSync`（:13）、`node:crypto createHash`（:14）。

## 5. 数据 I/O、读写与副作用

- 单一持久化文件：`{configDir}/review-cases/{caseId}/state.v2.json`（:33）；附属 `.previous.json`（:37，耐久写内自动维护，`review-v3-case-disk-tx.ts:134-142`）、锁目录 `.state.v2.tx.lock`（`review-v3-case-disk-tx.ts:30`）。
- 写入序列化 `JSON.stringify(aggregate, null, 2)`（:172）；耐久性：fsync 文件 + rename + 非 win32 父目录 fsync（`review-v3-case-disk-tx.ts:127-147`）。
- 幂等键：`requestId + payloadHash(type,payload)`（:222-229）；CAS 键：`caseV2.revision`（:232）；revision 唯一递增点在事务（:252），纯函数 `mutate` 不递增（头注 :9）。
- 并发交错：同案命令经 `enqueueCase` 串行（:177-183）+ 跨进程同一 OS 锁（`withC2CaseDiskTransaction`）；队列内嵌 `writeAggregate` 复用已持锁（`review-v3-case-disk-tx.ts:105-106` 检测 context token 直写）。
- 副作用：`console.warn` 于读取回退/跳过坏案卷（:57/:63/:66/:69/:150）；无网络、无窗口、无遥测。

## 6. 分支、失败、取消与恢复

| 失败点 | 返回/抛出 | 磁盘状态 |
| --- | --- | --- |
| 聚合缺失 | `{ok:false,'NOT_FOUND'}`（:212） | 无写 |
| 形状损坏（可解析） | `INVALID_TRANSITION`（:217-218） | 无写 |
| requestId 复用不同载荷 | `REQUEST_ID_COLLISION`（:228） | 无写 |
| expectedRevision 过期 | `VERSION_CONFLICT`+`currentRevision`（:233） | 无写 |
| 归档案卷非恢复命令 | `INVALID_TRANSITION`（:239） | 无写 |
| handler 抛错 | `CommandValidationError.code` 或 `VALIDATION_FAILED`（:247） | 无写（写盘在 :258） |
| `createAggregate` 已存在 | 抛 `INVALID_TRANSITION`（:276） | 无写 |

恢复语义：主账损坏时**读路径**回退 `.previous.json`（:56-71）且不改写主账；写路径照常 CAS，下一次成功写会把可解析旧主账再备份。无取消机制（无 AbortSignal；队列任务不可中断）；崩溃遗留锁不自动抢夺（`review-v3-case-disk-tx.ts:88-95` 30s 等待后 `C_TX_RECOVERY_REQUIRED`），需离线维护授权恢复。

## 7. 权限与权威状态

- 本层**无 sender/role 校验**（依据：无 event/actor 判断，`actor` 仅写入回执，:254）。身份绑定在 `review-c0-authority.ts`/`review-ipc-actor-guard.ts`/`review-principal-service.ts`（各自 handler 层）；本层负责把已绑定的 `actor`/`source` 不可变地记入 `receiptLog`（:253-255，注释「时间线可辨人工/AI」）。
- 提交时能力重核钩子：`createAggregate(…, authorizeAtCommit)` 在**串行耐久写时**回调（:277-278）；生产接线为 `review-ipc.ts:908` `authorizeAtCommit: () => assertC0ReviewMainSender(event)`——写入瞬间主窗口仍须可信。
- 权威状态规则：归档（`stage==='archived'`）冻结一切业务变更，唯一出口 `RestoreReviewCaseV3`（:235-240）；revision 为唯一权威版本号，回执账 `receiptLog` 为权威操作历史。

## 8. 修改影响面

- `submitCommand`/`createAggregate`/`readAggregate` 是全部 V2 业务写读的共同底座：改动事务顺序/幂等/CAS 语义会影响 §4 列出的全部服务（模板建案、材料、阶段流转、评分、批次、D2 计划、F13 申诉、run 写入等）与 `review-ipc.ts` 各 handler 返回形状 `ReviewCommandResult`。
- `payloadHash` 格式（`${type}|${JSON.stringify(payload)}`，:188）被多个**回执复核点**依赖：`review-v3-durable-host-fence.ts:42`、`review-v3-run-writer.ts:70/:84`、`review-v3-technical-ledger.ts:84/:110`、`native-workspace-case-v3.ts:266`、`review-c0-case-service.ts:28`；改格式将使历史回执失配。
- `isUsableAggregate`/摘要形状守卫（:40-45/:145-149）决定坏案卷可见性；与 `case-store.ts:206-215` 的旧投影判定共用同一聚合，需同步。
- 直接测试：`case-store-v2.test.ts`；间接大量（§9）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/case-store-v2.test.ts`（5 用例 / 1 describe；隔离 `PROFER_CONFIG_DIR=work/tmp/profer-test-agg-{Date.now()}` :11-13；fixture `ReviewCaseV2` :15-19 + `createAggregate` :22-24）。本轮 **NOT_RUN**。

逐用例真实断言：
1. `:31-44` 正常命令：`outcome.ok` true、`aggregate.caseV2.revision===1`、`receiptLog` 长度 1；重读盘 `persisted.revision===1` 且 `receiptLog` 长度 1（回执与业务同事务）。
2. `:46-55` 同 requestId 同载荷重试：两次均 ok、`second.receipt.revision===first.receipt.revision`、聚合 revision 未再增（幂等）。
3. `:57-63` 同 requestId 不同载荷：`second.ok` false、`code==='REQUEST_ID_COLLISION'`。
4. `:65-74` 过期 expectedRevision：`code==='VERSION_CONFLICT'`、`currentRevision===current`、盘上 revision 不变。
5. `:76-82` handler 抛 `CommandValidationError('VALIDATION_FAILED')`：`ok:false`、code 保留、盘上 revision 不变（无部分写）。

间接证据：`review-v3-case-disk-tx.test.ts:62-77`（双并发 `submitCommand` 恰一个 `VERSION_CONFLICT`、revision=1、赢家重放幂等）；`review-storage-id.test.ts:6`（`createAggregate/readAggregate/submitCommand/writeAggregate/listAggregatesV2` 的 id 守卫，:66 `listAggregatesV2()` 空）；`review-c0-ipc.test.ts:47/:65/:86/:104/:145`（经 C0 IPC 路径验证回执不变/幂等/碰撞）；`native-workspace-case-v3.test.ts`、`plan-binding-v3.test.ts`、`review-v3-technical-ledger.test.ts`、`review-v3-durable-host-fence.test.ts`、`review-v3-run-writer.test.ts` 等（`writeAggregate`/`readAggregate` 夹具路径）。

未覆盖（缺口）：`.previous.json` 回退读、`listCaseStorageIssues` 四类 code 的直接断言（仅 `review-v3-case-storage-durability.test.ts:91` 间接调用一次）、`main-behind-backup` 分支、`source`（assignmentId/sessionId）回执字段的断言、`createAggregate` 的 `authorizeAtCommit` 拒绝路径无直接用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出符号/行号如 §2 | 已证实 | `case-store-v2.ts:23-271` 逐条 `export` |
| 幂等=回执比对、CAS=revision、归档冻结 | 已证实 | :221-240；`case-store-v2.test.ts:46-82` |
| 回执与业务同事务落盘、revision 只 +1 | 已证实 | :249-258；`case-store-v2.test.ts:31-44` |
| 读回退 `.previous.json` 且不改写主账 | 已证实 | :51-73（无写调用） |
| 落盘走 OS 锁 + fsync 原子替换 | 已证实 | :167-174 → `review-v3-case-disk-tx.ts:103-152` |
| `payloadHash` 被 6+ 处回执复核消费 | 已证实 | §8 列举行号 |
| `authorizeAtCommit` 生产接线为主窗口重核 | 已证实 | `review-ipc.ts:908` |
| 回退副本参与后续 CAS 的版本判断 | 推断 | `submitCommand:211` 读到的可能是回退副本（:56-71），其 revision 即当前版；无用例固定此组合 |
| 恢复读取的业务层后果（旧副本 vs 新回执） | 未知 | 属运行期数据形态，静态不可判 |
| 跨进程锁的真实争用行为 | 未知（本文件层面） | 由 `review-v3-case-disk-tx.test.ts` 覆盖（见该篇） |

记录：头注 :5「唯一临时名 + 原子替换」指 `writeC2CaseStateDurably` 的随机名 tmp（`review-v3-case-disk-tx.ts:123`），与 `case-store.ts:73-77` 的固定 `.tmp` 名不同；两层耐久性档位不同（本层 fsync，V1 层无）。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `emptyAggregate` | §2/§3.8 | 23-25 | covered |
| `readAggregate`（回退分支） | §3.2/§6 | 51-73 | covered |
| `CaseStorageIssue`/`listCaseStorageIssues`（4 code） | §3.3 | 75-120 | covered |
| `AggregateSummary`/`listAggregatesV2` | §3.4 | 123-164 | covered |
| `writeAggregate` | §3.5/§5 | 167-174 | covered |
| `payloadHash` | §3.7/§8 | 187-189 | covered |
| `CommandHandler`/`CommandSourceMeta` | §2/§3.7 | 192-200 | covered |
| `submitCommand`（幂等/CAS/归档/handler/落盘） | §3.7/§6 | 203-261 | covered |
| `CommandValidationError` | §2/§6 | 264-268 | covered |
| `createAggregate`（重名/authorizeAtCommit） | §3.8/§7 | 271-284 | covered |
| `enqueueCase`/`writeQueues` | §3.6/§5 | 29, 177-183 | covered |
| `isUsableAggregate` | §3.2/§3.3 | 40-45 | covered |
| 回退副本参与 CAS | §10 | 211 + 56-71 | partial（推断） |
