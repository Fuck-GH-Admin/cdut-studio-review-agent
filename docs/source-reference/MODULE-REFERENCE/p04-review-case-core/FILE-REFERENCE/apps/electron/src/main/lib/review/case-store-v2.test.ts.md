---
path: apps/electron/src/main/lib/review/case-store-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5622c7ff60d561668dabc27e3039d0a29428fc51
sha256: 21f82b606da89620f2ed0db13ea950b4fcbe32964546d214473f9dc94c95591c
lines: 83
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-store-v2.test.ts

## 1. 测试目标

`case-store-v2.ts` 的 N1c 命令事务（头注标注 07 §3.3 / R01，:2）：回执与业务同事务落盘、幂等回执、requestId 碰撞、CAS 冲突不写数据、handler 校验失败无部分写入、revision 只 +1。被测函数 `createAggregate`/`submitCommand`/`readAggregate`/`CommandValidationError`（:9）。

## 2. 用例清单

5 用例 / 1 describe（`submitCommand（07 §3.3 事务）`，:30）。夹具：隔离 `PROFER_CONFIG_DIR=work/tmp/profer-test-agg-{Date.now()}`（:11-12，`afterAll` rmSync :13）；`caseV2` fixture（:15-19，`stage:'draft', revision:0`）；`setup()` 用真实 `createAggregate`（:22-24）；`bumpStage` 作为 `mutate` 把 `stage` 改为 `'submitted'`（:26-28）。无 mock/无网络。**用例共享同一案卷、严格顺序执行**（后用例的 `expectedRevision` 显式读当前值）。

| # | 用例 | 行 | 动作 |
| --- | --- | --- | --- |
| 1 | 正常命令 revision+1 且回执同事务落盘 | 31-44 | `submitCommand` `r1` |
| 2 | 同 requestId 同载荷重试返回原回执 | 46-55 | 连续两次 `r-idem` |
| 3 | 同 requestId 不同载荷 → REQUEST_ID_COLLISION | 57-63 | `r-coll` 两次载荷不同 |
| 4 | 过期 expectedRevision → VERSION_CONFLICT 不写 | 65-74 | `r-stale` 用 `current-1` |
| 5 | handler 校验失败拒绝且无部分写入 | 76-82 | `r-fail` handler 抛错 |

## 3. 真实断言

- 用例 1（:36-43）：`outcome.ok` true；`outcome.aggregate.caseV2.revision === 1`；`outcome.aggregate.receiptLog` 长度 1；`readAggregate` 重读 `persisted.caseV2.revision === 1`、`persisted.receiptLog` 长度 1（回执与业务同事务）。
- 用例 2（:50-54）：两次 `ok` true；`second.receipt.revision === first.receipt.revision`（原回执）；`second.aggregate.caseV2.revision === first.aggregate.caseV2.revision`（未再递增）。
- 用例 3（:59-62）：第一次 `ok` true；第二次 `ok` false 且 `code === 'REQUEST_ID_COLLISION'`。
- 用例 4（:68-73）：`ok` false、`code === 'VERSION_CONFLICT'`、`currentRevision` 等于提交前版本；`readAggregate(...).caseV2.revision` 不变（未写）。
- 用例 5（:79-81）：`ok` false、`code === 'VALIDATION_FAILED'`（`CommandValidationError` 的 code 穿透事务层）；revision 不变。

## 4. 未覆盖与脆弱点

- 未覆盖：`NOT_FOUND`（聚合缺失）、可解析形状坏的 `INVALID_TRANSITION`、归档冻结分支（`case-store-v2.ts:238-240`）、`createAggregate` 重名/`authorizeAtCommit`、`payloadHash` 稳定性、`CommandSourceMeta`（assignmentId/sessionId）回执字段、`.previous.json` 回退、跨进程锁（在 `review-v3-case-disk-tx.test.ts`）。
- 脆弱点：5 用例共享一个案卷且依赖执行顺序（用例 4/5 的 revision 动态读取缓解了部分脆弱）；`toBeTrue/toBeFalse` 为 Bun 断言风格。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言行号如 §3 | 已证实 | 本文件逐行 |
| 幂等/CAS/无部分写三条不变量被断言 | 已证实 | :46-82 |
| 用例间共享状态顺序耦合 | 已证实 | :47/:58/:66/:77 动态取 revision |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 正常提交 + 回执同事务 | §3 | 31-44 | covered |
| 幂等重放 | §3 | 46-55 | covered |
| REQUEST_ID_COLLISION | §3 | 57-63 | covered |
| VERSION_CONFLICT | §3 | 65-74 | covered |
| VALIDATION_FAILED 无部分写 | §3 | 76-82 | covered |
| NOT_FOUND/INVALID_TRANSITION/归档冻结/createAggregate | §4 | — | unknown（未测） |
