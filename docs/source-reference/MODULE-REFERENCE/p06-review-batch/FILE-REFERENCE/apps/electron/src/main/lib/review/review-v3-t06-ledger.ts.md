---
path: apps/electron/src/main/lib/review/review-v3-t06-ledger.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7896a90fb5ee2045b8e8fdaccd0c1bc0226436cf
sha256: e4fa690e0319a5e4bf51d7161fcbe152595d1f2c8c03989629890bedb990afef
lines: 171
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t06-ledger.ts

## 1. 结论与边界

T06 物理入库的持久账本（文件头 `:1-11`，RUN-45/BATCH-07/ASSET-18）：进程内 Map 只能同进程幂等，真实用户会中断/崩溃/重启后重试，故 Main 侧原子落盘两类记录——来源选择记录（相对路径+SHA-256，ZIP 只记包路径）与 requestId 级提交账本（请求指纹、逐组状态、已登记 versionId、批次结果）。账本只存本地路径与哈希，不存 ZIP 原字节/凭据/模型回执；续跑前必须重新核对来源字节（“磁盘上还在”≠“内容未变”）。纯存储层。

不做的事：不读取来源字节（由 `review-v3-t06-main-service.loadSelection` 核对）；不处理业务；不管 ZIP 解码。

## 2. 导出与关键符号

导出 13 项（function 6、interface 6、const 1）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `T06_REQUEST_STALE_MS` | `:19` | `30*60*1000`（30 分钟账本过期判定） |
| `T06LedgerEntryRecord` | `:21-30` | 条目：entryId/relativePath/byteLength/contentSha256/absolutePath?/zipEntryName? |
| `T06StoredSelectionRecord` | `:32-43` | 选择记录：selectionId/fingerprint/sourceKind/zipPath?/entries/warnings/excluded/createdAt |
| `T06RequestDocumentRecord` | `:45-50` | 登记结果：entryId/documentVersionId/role?/materialSlotId? |
| `T06RequestGroupRecord` | `:52-59` | 组记录：groupId/status(pending/running/done/failed)/caseId?/documents/warnings?/error? |
| `T06RequestBatchRecord` | `:61-66` | 批次记录：batchId/templateId/templateVersion/caseIds |
| `T06RequestLedgerRecord` | `:68-83` | 请求账本：requestId/requestFingerprint/selectionId/previewFingerprint/ownerPid/status/startedAt/updatedAt/groups/batches?/batchError?/receipt? |
| `saveT06SelectionRecord` | `:115-118` | 写选择记录（先清理 30 天前旧档） |
| `readT06SelectionRecord` | `:120-132` | 读+schema 校验（schemaVersion 1、id 匹配、entries 数组、fingerprint 字符串），不合法 undefined |
| `readT06RequestLedger` | `:134-145` | 同上（requestId/groups 校验） |
| `saveT06RequestLedger` | `:147-150` | 写请求账本（先清理，`updatedAt` 刷新） |
| `isProcessAlive` | `:152-161` | `process.kill(pid,0)` 探活；`EPERM` 视为存活；非法 pid false |
| `isRequestLedgerBusy` | `:164-171` | 账本是否被另一存活进程持有：status running + 非本进程 + ownerPid 存活 + 未超 `T06_REQUEST_STALE_MS` |

内部：`SAFE_ID=/^[A-Za-z0-9_-]{1,160}$/`（`:16`）；`SELECTION_RETENTION_MS/REQUEST_RETENTION_MS=30 天`（`:17-18`）；`rootDir`（`:85-89`，`review-t06-intake/{selections,requests}`）；`pathOf`（`:91-94`，ID 校验后拼路径）；`writeAtomic`（`:96-100`，tmp 含 pid+随机）；`pruneOld`（`:102-113`，mtime 超期删除，失败不阻断）。

## 3. 内部逻辑与关键流程

- **路径安全**：`pathOf` 先过 `SAFE_ID`（`:92`），ID 不合法 throw/返回 undefined；用户可控 ID 不进路径。
- **原子写**：`writeAtomic` tmp+rename（`:96-100`），tmp 名含 `process.pid` 防跨进程碰撞。
- **保留策略**：写前 `pruneOld` 清 30 天前的 `.json`（`:102-113`）；清理失败静默（注释“清理失败不阻断业务，下次再试”）。
- **读校验**：`readT06SelectionRecord`/`readT06RequestLedger` 逐层校验 schemaVersion/id/数组形状，JSON 损坏或不合法返回 undefined（`:126-131/:140-144`）。
- **进程占用判定** `isRequestLedgerBusy`（`:164-171`）：非 running → 不忙；ownerPid 是本进程 → 不忙；ownerPid 已死 → 不忙（可接管）；`updatedAt` 超 30 分钟 → 不忙（超龄可接管）；否则 busy（拒绝并行重做）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| T06 Main 服务 | `review-v3-t06-main-service.ts:27-29`（import）；`:297` `saveT06SelectionRecord`；`:339` `readT06SelectionRecord`；`:539` `readT06RequestLedger`；`:550` `isRequestLedgerBusy`；`:597/:697/:742` `saveT06RequestLedger` | 唯一消费者 |

出向：`node:fs`、`node:path`、`config-paths.getConfigDir`。`isProcessAlive` 仅被 `isRequestLedgerBusy` 内部使用（`packages/apps` 检索无其它调用）。

## 5. 数据 I/O、读写与副作用

- **磁盘**：`review-t06-intake/selections/{selectionId}.json`、`review-t06-intake/requests/{requestId}.json`（原子写）；写前清理超期记录（副作用：删除 30 天前文件）。
- **不保存**：ZIP 原字节、凭据、模型回执（文件头 `:9-10`；`T06RequestLedgerRecord.receipt` 是本方提交回执快照，不是外部字节）。
- **幂等**：同 id 覆写；读校验防损坏。
- **并发**：多进程并发写同 id 无锁（tmp 名含 pid 降低碰撞）；占用判定靠 `ownerPid`+时间窗。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| ID 非法 | `:92/:121/:135` | throw / 返回 undefined |
| 文件缺失 | `:123/:138` | undefined |
| JSON 损坏/schema 不符 | `:126-131/:140-144` | undefined |
| 清理失败 | `:111` | 静默跳过 |
| 写失败 | 无捕获 | 抛出（调用方处理） |
| 进程死/超龄 | `:167/:169` | 允许接管 |
| 取消/恢复 | 无 | 持久账本本身即恢复介质 |

## 7. 权限与权威状态

无权限分支（纯存储）。权威状态：来源选择以**内容哈希**为凭（`fingerprint`+逐条 `contentSha256`），续跑时由 Main 重新核对；请求账本以 `requestFingerprint` 防同 requestId 异内容；`ownerPid` 是进程占用的弱权威（可被 `isRequestLedgerBusy` 的死亡/超龄规则推翻）。

## 8. 修改影响面

- 改记录形状 → 影响 `review-v3-t06-main-service` 的恢复路径（`loadSelection`/`commitT06PhysicalImport`）；测试 `review-v3-t06-main-service.test.ts:342-384`（重启恢复/接管）间接覆盖。
- 改 `SAFE_ID`/路径构造 → 安全边界。
- 改 `T06_REQUEST_STALE_MS` → 接管时间窗。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。本文件无专属测试；经 `review-v3-t06-main-service.test.ts` 间接：

- `:342-359`：`__resetT06ProcessCachesForTest` 模拟重启后同 requestId 从 `readT06RequestLedger` 恢复回执，revision/文档数不变。
- `:361-384`：伪造 `ownerPid:2147483646`（死进程）+status running 的账本文件 → `isRequestLedgerBusy` 判不忙 → 接管续跑完成。
- `:327-340`：同 requestId 并发（本进程）拒绝（`activeRequests` 在 Main 服务，非本文件）。

**未覆盖**：`pruneOld` 30 天清理、`isProcessAlive` 的 EPERM 分支、损坏 schema 的 undefined 分支、双进程并发写。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 账本只存路径+哈希，不存原字节/凭据 | 已证实 | 文件头 `:9-10`；记录形状 `:21-83` |
| ID 白名单 + 原子写 | 已证实 | `:16/:91-100` |
| 读校验 fail-safe（undefined） | 已证实 | `:126-131/:140-144` |
| 占用判定：死进程/超龄可接管 | 已证实 | `:164-171`；测试 `:361-384` |
| 重启恢复依赖磁盘账本 | 已证实 | 测试 `:342-359` |
| 30 天清理行为 | 已证实（代码）/未知（测试） | `:102-113` |
| 双进程并发写 | 未知 | 无锁 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 记录形状（6 类型） | 2 | `:21-83` | covered |
| `saveT06SelectionRecord`/`readT06SelectionRecord` | 3 | `:115-132` | covered（间接） |
| `readT06RequestLedger`/`saveT06RequestLedger` | 3 | `:134-150` | covered（间接） |
| `isProcessAlive` | 3 | `:152-161` | partial |
| `isRequestLedgerBusy` | 3 | `:164-171` | covered（间接） |
| `pruneOld` | 3 | `:102-113` | unknown |
