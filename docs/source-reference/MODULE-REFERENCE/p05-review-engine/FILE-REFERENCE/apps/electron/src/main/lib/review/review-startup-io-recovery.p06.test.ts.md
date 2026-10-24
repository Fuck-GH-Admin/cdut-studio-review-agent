---
path: apps/electron/src/main/lib/review/review-startup-io-recovery.p06.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7a7fe5715771f689c31968082e32d25b42fb6ad4
sha256: 1ca3d0eb18bd06ceda2ba3caeaba693f6bc5e2a34d917034c9ea71e714577ed4
lines: 78
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-startup-io-recovery.p06.test.ts

## 1. 测试目标

P06 实机首败默认回归：启动恢复 I/O 故障隔离——恢复失写时旧授权必须拒止、磁盘状态如实保留；修复后可再次持久化；新轮次/普通指派不受影响。

## 2. 用例清单

3 用例 / 1 describe（`P06 启动恢复 I/O 故障隔离` :21）。夹具 `fixture()`（:12-19，真模板发布/真建案/真 `preparePiReviewRunV2`）；用 `chmodSync` 真实制造权限故障；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 文件+目录双不可写 | 22-33 | `markStaleRunsInterrupted` 返回 0；盘上字节不变、状态仍 `running`；`checkAssignment` false；`getPiReviewBindingForSession` undefined |
| 2 | 文件只读目录可写 | 35-42 | 返回 1、状态 `failed`、授权拒绝 |
| 3 | 修复后可再持久化 | 44-57 | 先 0 后 1、状态 `failed`、旧授权拒；`preparePiReviewRunV2` 新 runId、新指派 ok；普通 `createAssignment` ok |

## 3. 真实断言

如 §2 表（逐条读自 :22-57）；`permission()` 以 `checkAssignment(...).ok` 表达工具授权。

## 4. 未覆盖与脆弱点

- 未覆盖：`reopenInterruptedRunForResume`（在 review-runtime-contract.test）、并发恢复。
- 脆弱点：chmod 语义依赖 POSIX（Windows 下 CI 或跳过/失效）；`fixture()` 每次建新案卷（随机 id）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §2 | 已证实 | 本文件逐行 |
| 失写拒止+磁盘如实被固定 | 已证实 | 用例 1-3 |
| Windows 下行为 | 未知 | chmod 语义差异 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| markStaleRunsInterrupted 失写/成功 | §2 | covered |
| 拒止/binding 失效 | §2 | covered |
| 修复重试+新轮次 | §2 | covered |
| reopen 续交 | §4 | unknown（他测覆盖） |
