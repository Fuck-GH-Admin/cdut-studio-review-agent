---
path: apps/electron/src/main/lib/review/review-v3-durable-host-fence.worker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bdcb4e7f33f96271cbb7ad107590ea7f7b60804a
sha256: cbf7267b819c9f876443d0acec8e219680a503a773e20d99f3ad3b5cab2a06aa
lines: 11
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-durable-host-fence.worker.ts

## 1. 结论与边界

极薄 CLI 脚本（11 行）：独立 Bun/OS 进程读取案卷并用 `isC2RunDurablyFenced` 验证 C Case CAS 的 Run 级 Host 围栏（本文件头注释 `:1` “Independent Bun OS PID verifies C Case CAS Run-wide Host fence”）。它只做“读围栏→打印→退码”，无业务写入、无 IPC。

## 2. 导出与关键符号

无 `export`（顶层脚本）。关键符号：`process.argv[2]`（caseId，`:4`）、`readAggregate`（`:5`，定义 `case-store-v2.ts:51`）、`isC2RunDurablyFenced`（`:8`，定义 `review-v3-durable-host-fence.ts:60`）。

## 3. 内部逻辑与关键流程

1. `caseId=process.argv[2]`；`readAggregate(caseId)` 无聚合或无 `v3TechnicalExecution.run` → stderr `NO_PERSISTED_RUN`、exit 2（`:4-6`）。
2. `isC2RunDurablyFenced(a.v3TechnicalExecution.run)` → stdout `DURABLE_FENCED`（exit 0）或 `NOT_FENCED`（exit 3）（`:7-10`）。
3. 任何异常 → stderr `String(e)`、exit 4（`:11`）。

## 4. 调用者与调用链

入向：`review-v3-durable-host-fence.test.ts:63-65` 以 `spawnSync(process.execPath,[worker,caseId],{env:{PROFER_CONFIG_DIR:root}})` 调用（本批测试）。生产无调用者（检索 `apps/`+`packages/` 非测试 `*.ts` 对文件名 0 命中）。出向：`review-v3-durable-host-fence.ts:60`（`isC2RunDurablyFenced`）、`case-store-v2.ts:51`（`readAggregate`）。

## 5. 数据 I/O、读写与副作用

- 读：案卷聚合（经 `PROFER_CONFIG_DIR` 指定根）；写：无。副作用：stdout/stderr + 退码。

## 6. 分支、失败、取消与恢复

| 情形 | 输出 | 退码 | 行 |
| --- | --- | --- | --- |
| 无 caseId/无聚合/无持久 Run | `NO_PERSISTED_RUN` | 2 | 120 |
| 已围栏 | `DURABLE_FENCED` | 0 | 123-124 |
| 未围栏 | `NOT_FENCED` | 3 | 123-124 |
| 异常 | `String(e)` | 4 | 125 |

无取消/恢复语义（一次性进程）。

## 7. 权限与权威状态

无权限判定；权威完全来自 `isC2RunDurablyFenced`（损坏台账 fail-closed，见其手册）。

## 8. 修改影响面

改退码/输出影响 `review-v3-durable-host-fence.test.ts:66-67` 的 `toMatchObject({status:0,stdout:'DURABLE_FENCED'})` 断言。

## 9. 测试证据

间接：`review-v3-durable-host-fence.test.ts:63-67`（spawnSync 真实独立进程断言 `DURABLE_FENCED`/exit 0）。`NOT_RUN`：本轮未执行。

缺口：`NO_PERSISTED_RUN`/`NOT_FENCED`/exit 4 分支无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 独立进程读围栏 | 已证实 | `:115-125`；测试 spawnSync |
| 生产无调用者 | 已证实（检索范围：冻结树 `apps`+`packages` 非测试 `*.ts`） | 0 命中 |
| 退码 2/3/4 分支 | 已证实（源码） | `:6-11` |
| 退码行为断言 | 未知 | 仅 0 分支被测 |

## 11. 覆盖表

| 分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `NO_PERSISTED_RUN` | §6 | 6 | covered（源码）/partial（断言） |
| `DURABLE_FENCED`/`NOT_FENCED` | §6 | 9-10 | covered |
| 异常 | §6 | 11 | covered（源码） |
