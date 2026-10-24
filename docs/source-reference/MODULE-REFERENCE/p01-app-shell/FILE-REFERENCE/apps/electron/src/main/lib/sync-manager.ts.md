---
path: apps/electron/src/main/lib/sync-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13a843072cb8657abb341ca11c2fca8fd2a95e1c
sha256: 7a4d04006e00941138a2fe3dd93debb25a0bb767a14f94e419bd5eef1129a767
lines: 527
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/sync-manager.ts

## 1. 结论与边界

**团队工作区双向同步引擎**（527 行）：本地变更信封队列推送（`/v1/sync/push`）、定时轮询拉取（`/v1/sync/pull`）、游标推进（`lastOccurredAt`+`lastSeq` 双游标）、被移除检测、心跳上报；自调度轮询（60s±15s 抖动，空闲 10min 降频，拉满一页 2s 追赶）。

边界：只同步「team 类型工作区」（`:219`、`:416`）；冲突语义为**最后写入者胜出+旧版本备份**（模块注释 `:7`，实现在应用侧域外）；令牌刷新在 `auth-service`（域外）；`skill` 类型变更由对应服务处理（`:315` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `enqueueChange` | 导出函数 | 99-128 | `(workspaceId, entityType, entityId, operation, payload): void` | 变更入队 |
| `startSyncEngine` | 导出函数 | 457-487 | `(): void` | 启动自调度轮询 |
| `stopSyncEngine` | 导出函数 | 490-496 | `(): void` | 停止 |
| `triggerSync` | 导出函数 | 499-501 | `(_workspaceId?): Promise<void>` | 手动触发一轮 |
| `getSyncStatus` | 导出函数 | 504-506 | `(): {workspaces: WorkspaceSyncState[]}` | 状态快照 |
| `getPendingChanges` | 导出函数 | 509-514 | `(workspaceId) => SyncEnvelope[]` | 待发查询（workspace 类型+entityId 过滤） |
| `discardPendingChanges` | 导出函数 | 517-527 | `(workspaceId): void` | 丢弃待发 |
| `pushEnvelopes`/`pullChanges` | 内部函数 | 132-207、217-266 | 推/拉 | |
| `applyRemoteChanges`/`checkIfRemoved` | 内部函数 | 271-341 | 应用/移除检测 | |
| `sendHeartbeat`/`broadcastStatusChange` | 内部函数 | 346-379 | 心跳/状态广播 | |
| `syncCycle`/`isIdleOrHidden` | 内部函数 | 390-454 | 周期/空闲判定 | |
| `readSyncIndex`/`writeSyncIndex`/`getWorkspaceSyncState` | 内部函数 | 33-70 | 同步状态文件 | |
| 常量 | 内部 | 21-27 | 轮询 60s±15s、空闲 600s、空闲阈值 300s、心跳 300s、追赶 2s、`MAX_RETRY_COUNT=5` | |

导出计数：`export` **7 条**（`:99`、`:457`、`:490`、`:499`、`:504`、`:509`、`:517`），与源码逐条一致。

## 3. 内部逻辑与关键流程

- **信封队列**（`:74-128`）：`<config>/sync-queue.json`（`JSON.parse` 容错读、全量写，`:83-96`）；`enqueueChange` 构造 `{id: randomUUID(), …, occurredAt, retryCount:0}` 入队+落盘；**注意 `:123` 用 `getWorkspaceSyncState(entityId)` 更新 `pendingOutgoing`（以 entityId 而非 workspaceId 查状态）**——照实记录于 §10。
- **push**（`:132-207`）：全量 `toSend` POST `/v1/sync/push`；401 → `refreshAuthToken` 成功后**带新 token 重试一次**（成功按 id 出队，`:150-168`）；刷新失败→false 不出队；其余 !ok → throw 入 catch；成功出队（`:176-181`）；catch → 逐条 `retryCount++`/`lastError` 落盘 → **`retryCount > 5` 的信封写死信队列**（动态 import `sync-dead-letter`，`:192-201`）并从队列移除（`:202`）。
- **pull**（`:217-266`）：仅 team 工作区；取**最大游标**（保守：宁可多拉不丢，`:223-234`）；POST `/v1/sync/pull` `{since, afterSeq}`；!ok/异常 → 空结果；**兼容旧服务端裸数组**（`:252-254`）；返回 `{envelopes, lastOccurredAt, lastSeq, hasMore}`。
- **应用**（`applyRemoteChanges`，`:292-341`）：`workspace` 类型且带 `memberSummary` → 写本地工作区索引（`:298-309`）；`file` 类型 → 标记 `hasFileChanges`；收尾广播 `WORKSPACE_FILES_CHANGED` 全窗口 + `teamNotificationService.notifyFromSync`（SSE 降级通知，`:322-340`，服务未加载忽略）。
- **被移除检测**（`:271-289`）：workspace update 且 `memberSummary` 不含自己的 `teamAccountId` → 记录 `removedWorkspaceIds`（`:280-282`，console.log；**`syncCycle` 中 `checkIfRemoved(changes)` 返回值未被使用**——照实记录 §10）。
- **syncCycle**（`:390-441`）：`_isRunning` 防重入；无 auth 先刷新；push→pull→apply→游标推进（**仅 `lastOccurredAt>0` 才推进**，防网络错误后游标倒退，`:420-423`）→ 心跳（限频 5min，`:343-371`）→ `broadcastStatusChange`；返回 `hasMore`。
- **自调度**（`:457-487`）：`scheduleNext(base±15s 抖动，min 2s)`；`hasMore` → 2s 追赶；否则 `isIdleOrHidden()`（系统空闲 ≥300s 或无可见未最小化窗口，`:444-454`）→ 10min : 60s；失败 catch 后照常调度。
- **状态文件**（`:33-70`）：`<config>/sync-state`（`getSyncStatePath`），`WorkspaceSyncState` 8 字段；`_syncIndex` 内存缓存。

## 4. 调用者与调用链

- 入向（全冻结树 `grep sync-manager|七导出名`，apps+packages 全类型）：
  - `apps/electron/src/main/index.ts:1074-1137`（登录后/团队就绪时 `startSyncEngine`，三处 lazy require）、`:1274-1275` 退出 `stopSyncEngine`。
  - `apps/electron/src/main/ipc.ts`（状态/手动同步/丢弃通道，经 preload `SYNC_IPC_CHANNELS`）。
  - `apps/electron/src/main/lib/team-manager.ts`（`enqueueChange` 变更上报）、`team-notification-service.ts`（事件协同）。
- 出向：`undici.fetch`、`electron.BrowserWindow/powerMonitor`、`./config-paths.getSyncStatePath`、`./auth-service`（getTeamAuth/refreshAuthToken/getAuthStatus）、`./agent-workspace-manager`（listAgentWorkspaces/readIndex/writeIndex）、`@profer/shared` 通道、动态 `./sync-dead-letter`/`./team-notification-service`（`:11-19`、`:196`、`:329`）。

## 5. 数据 I/O、读写与副作用

- 磁盘：`sync-queue.json`（信封队列）、`sync-state`（游标/状态）——均为全量 JSON 写（**非原子**，对照 `safe-file`，照实记录）。
- 网络：push/pull/heartbeat（Bearer 令牌）。
- 副作用：`webContents.send`（`WORKSPACE_FILES_CHANGED`/`SYNC_IPC_CHANNELS.STATUS_CHANGED`）；通知服务调用；console 日志。

## 6. 分支、失败、取消与恢复

- 401：push 侧刷新令牌重试一次；pull 侧不重试（空结果）。
- 重试/死信：`retryCount>5` 进死信（不静默丢弃，`:192-202`）。
- 游标倒退防护：`lastOccurredAt>0` 才推进（`:420-423`）。
- 取消：`stopSyncEngine` 清定时器（在逢单轮不中断）；`_isRunning` finally 释放。
- 恢复：队列/状态持久化，重启续传；`startSyncEngine` 立即首跑（`:481-486`）。

## 7. 权限与权威状态

- 无 sender/role 检查（主进程引擎）；令牌/账号态来自 `auth-service`（域外）。
- 权威状态：服务端事件为权威（最后写入者胜出）；本地游标为副本（双游标保守推进）；`memberSummary` 移除检测仅记录（见 §10）。

## 8. 修改影响面

- `index.ts` 生命周期（登录后启动/退出停止）、`team-manager` 变更上报、`ipc.ts` 同步状态通道、渲染同步状态 UI。
- 服务端契约 `/v1/sync/push|pull|heartbeat` 与 `SyncEnvelope`/`SyncPullResponse`（`./sync-types`）。
- `sync-dead-letter`（同批）失败链；`team-notification-service` 通知语义。
- 测试：无专属测试（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：无。
- 未覆盖：push/pull/死信/游标/防重入/自调度全链。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实同步；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出与签名 | 已证实 | `:99-527` |
| 401 刷新重试一次/失败不出队 | 已证实 | `:150-171` |
| 死信阈值 5+不静默丢弃 | 已证实 | `:192-202` |
| 游标「>0 才推进」防倒退 | 已证实 | `:420-423` |
| 自调度三档（2s/60s/10min）+抖动 | 已证实 | `:457-487`、`:444-454` |
| 兼容旧服务端裸数组 | 已证实 | `:252-254` |
| `enqueueChange` 以 entityId 查 sync state（疑为 workspaceId 笔误） | 已证实 | `:123`（照实记录，效果=pendingOutgoing 计在错误状态项） |
| `checkIfRemoved` 返回值未消费（仅日志） | 已证实 | `:411` 对比 `:271-289` |
| 队列/状态非原子写 | 已证实 | `:48-51`、`:94-96` |
| 无专属测试 | 已证实 | 全冻结树检索（§9 范围） |
| 真实同步/冲突表现 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 队列/`enqueueChange` | §3/§10 | 74-128 | covered |
| `pushEnvelopes`（401/死信） | §3/§6 | 132-207 | covered |
| `pullChanges`（游标/兼容） | §3 | 217-266 | covered |
| `applyRemoteChanges`/`checkIfRemoved` | §3/§10 | 271-341 | covered |
| 心跳/广播 | §3 | 343-379 | covered |
| `syncCycle`/自调度/空闲判定 | §3 | 381-496 | covered |
| `getSyncStatus`/`getPendingChanges`/`discardPendingChanges` | §2 | 504-527 | covered |
| 真实同步行为 | §10 | — | unknown（NOT_RUN） |
