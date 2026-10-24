---
path: apps/electron/src/main/lib/cslab/cslab-hpc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ef171ec80f6006555d0875adfe1b6aeeefa86b5
sha256: ec634c5b3b4627af960bd8df8ac88c96e7cf16ff648b7186934baa565220d0ac
lines: 1282
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-hpc.ts

## 1. 结论与边界

CSLab **远程学术算力网关**（`apps/electron/src/main/lib/cslab/cslab-hpc.ts:1-12`）：纯 ssh2 双跳（堡垒机 forwardOut）+ keyboard-interactive MFA/TOTP 透传；统一计算契约→Slurm/PBS/LSF 批处理脚本；确定性 UUID 作业名+hpc_jobs.sqlite 重水合（断网数天不丢作业）；外科手术式回传（白名单轻量产物落库，重型轨迹只记 `sftp://` 远程 URI）。**三条红线**（`:8-11`）：① 状态未知如实标 UNKNOWN **绝不伪造 COMPLETED**；② 重水合找不到作业只提示「可安全重投」**不自动重复提交**；③ 所有计时器 unref、失败收敛为明确错误。

边界：MFA 90s 超时/轮询 30s 起倍增至 5min/回传上限 500MB（`:64-67`）；命令注入防护三重（JobID/调度器标识符/输入文件名白名单正则）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabHpcSink` | interface | 94-97 | onJob/onMfa 回调 |
| `assertSafeRemoteJobId` | function | 123-130 | `^[A-Za-z0-9_.-]{1,64}$`，非法抛「已阻断潜在命令注入风险」 |
| `SynthesizedBatch`/`synthesizeBatchScript` | interface/function | 141-216 | 三调度器脚本合成（jobName=`cslab-{uuid8}`） |
| `normalizeSchedulerState` | function | 218-254 | slurm 带后缀状态（`CANCELLED by 1001`）/pbs/lsf 归一 |
| `parseSchedulerJson` | function | 262-328 | 三调度器 JSON/文本双路解析 |
| `answerHpcMfa` | function | 415-421 | MFA 应答（miss→false） |
| `listHpcProfiles`/`saveHpcProfile`/`deleteHpcProfile` | function | 653-729 | 档案 CRUD（口令 encryptToken 密文；编辑未输新口令**沿用旧密文**，`:700-703`） |
| `testHpcConnection` | function | 731-760 | `echo cslab-ok` 回显+latency |
| `listHpcJobs`/`submitHpcJob`/`refreshHpcJob`/`cancelHpcJob`/`cancelHpcJobsByKeys` | function | 762-1028 | 作业生命周期 |
| `harvestHpcJob` | function | 1088-1167 | 外科手术式回传 |
| `rehydrateHpcJobs` | function | 1203-1258 | 重水合扫描（「绝不自动重投」，`:1201`） |
| `__saveJobRowForTest`/`__findJobByRemoteIdForTest` | function | 1259-1266 | 测试辅助（不触发网络） |
| `stopAllHpcBridges` | function | 1268-1282 | 全量回收（timers/MFA/连接） |

内部（选要）：白/黑名单（`:68-85`，WAVECAR 等重型→remote-uri）、`shellQuote`（`:115-118`）、`requestMfa/attachKeyboardInteractive`（`:388-450`，验证码/密码正则分流）、`getConnection`（`:456-563`，双跳 forwardOut+失败回收堡垒机句柄）、`execCommand`（`:570-599`，超时 unref）、`schedulePoll/abandonPolling`（`:773-828`，连续 10 次 UNKNOWN 停轮询**状态仍如实 UNKNOWN**，`:812-814`）、`queryRemoteState`（`:888-938`，多命令回退）、`registerFigureAsset`（`:1052-1086`，figures 落库+锁+cslab-db 事务）、`findJobIdByName`（`:1173-1201`）。

## 3. 内部逻辑与关键流程

- `submitHpcJob`（`:830-886`）：校验（档案/命令/节点/核数）→合成脚本→sftp 上传输入（文件名 `^[\w.\-]+$` 白名单）+**唯一脚本名 `batch-{uuid8}.sh` 防并发覆盖**→三调度器提交命令→JobID 解析+安全校验→**先落盘再轮询**（断网仍可重水合，`:878` 注释）。
- `refreshHpcJob`（`:940-969`）：终态直接返回；UNKNOWN 时 message 如实记「未能从调度器确认状态（原始：…）」。
- `harvestHpcJob`（`:1088-1167`）：目录遍历（longname 'd' 判目录）；黑名单/超 500MB→`remote-uri` 只记 URI；白名单下载→png/jpg 走 `registerFigureAsset`（vault/figures+锁），其余 `ingestFiles` 落库；**入库失败降级 remote-uri**；finally 删暂存。
- `rehydrateHpcJobs`（`:1203-1258`）：档案删除→状态 UNKNOWN+「作业上下文保留」；找回 JobID 经 `assertSafeRemoteJobId`（**调度器返回值不可信**，`:1230`）；找不到→UNKNOWN+「可安全重新投递」；失败保留上下文。

## 4. 调用者与调用链

出向：`ssh2`、`node:fs/crypto/path`、`@profer/shared`（11 类型）、`./cslab-hpc-db`（12 符号）、`./cslab-paths`、`./cslab-hash`（copyFileWithHash/lockFileReadOnly）、`./cslab-db`、`./cslab-uri`、`./cslab-iron-cage`（ingestFiles）、`../token-crypto`（`:14-59`）。入向（rg 全冻结树）：`main/index.ts:217`（stopAllHpcBridges，进程退出）、`cslab-router.ts:220`（多符号，产品 IPC 面）、`cslab/index.ts:46` 转发、`cslab-hpc.test.ts`（本批 266 行）。

## 5. 数据 I/O、读写与副作用

SSH/SFTP 网络会话（连接缓存）；sftp 上传/下载；本地 staging/vault 写入+锁；cslab-db/cslab-hpc-db 事务；console.warn。**计时器全部 unref**（红线③）。

## 6. 分支、失败、取消与恢复

失败全部收敛为带上下文 Error/UNKNOWN 状态（不伪造）；`cancelHpcJobsByKeys` 失败只记录不抛（DAG 剪枝语义，`:1013`）；`stopAllHpcBridges` 全量回收防句柄悬挂。

## 7. 权限与权威状态

本文件不适用（无权限代码）；三条红线（`:8-11`）与注入防护（`:119-130,146-159`）是安全/诚实权威口径。

## 8. 修改影响面

- 状态归一表/脚本合成模板是三调度器兼容契约。
- 白/黑名单+500MB 阈值是回传成本控制面。
- 测试：cslab-hpc.test（本批）。

## 9. 测试证据

`apps/electron/src/main/lib/cslab/cslab-hpc.test.ts`（本批，266 行，断言见该篇；含测试辅助导出）。**NOT_RUN**（网络不执行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三红线（UNKNOWN 如实/不自动重投/unref） | 已证实 | `:8-11,812-814,1232-1240` |
| 命令注入防护三重 | 已证实 | `:119-130,146-159,851` |
| 先落盘再轮询（断网可重水合） | 已证实 | `:878-880` |
| 回传降级链（失败→remote-uri） | 已证实 | `:1148-1152` |
| 口令密文+编辑沿用旧密文 | 已证实 | `:700-707` |
| 真实集群三调度器行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15+ 导出 | §2 | 94-1282 | covered |
| 提交/刷新/取消/轮询 | §3 | 762-1028 | covered |
| 回传/重水合 | §3 | 1088-1258 | covered |
| 连接/MFA/双跳 | §2/§3 | 388-563 | covered |
