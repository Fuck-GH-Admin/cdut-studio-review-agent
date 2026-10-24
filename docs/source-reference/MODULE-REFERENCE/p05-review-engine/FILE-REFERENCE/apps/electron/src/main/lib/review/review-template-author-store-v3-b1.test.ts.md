---
path: apps/electron/src/main/lib/review/review-template-author-store-v3-b1.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6f1c25079e6f54f7953ccb94b71679176fc912e
sha256: 14c414356a6239aca72e1462c9d6a127a3b55d18ffc06898077e3308806cb606
lines: 91
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-template-author-store-v3-b1.test.ts

## 1. 测试目标

B1 作者修订与不可变候选保险库：append-only 存、全链校验篡改可检、author.lock CAS、冻结幂等/STALE、status 不可欺升。

## 2. 用例清单

4 用例 / 1 describe。夹具 `synthetic(templateId)`（:16-31，真实 B1AuthorDocument）；真实 tmp 目录+真实锁文件；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 不完整草稿可存、映射齐才可冻结 | 31-49 | v1 存→冻结 `B1_AUTHOR_INVALID`；完整→v2+parentDigest 链、重复存 `B1_AUTHOR_REVISION_CONFLICT`；冻结 bindings 1+`candidate-held`、重放幂等、旧版 `B1_AUTHOR_REVISION_STALE`、v1 保留 |
| 2 | 原始修订篡改可检 | 50-63 | 改 1.json 内容→读/存均 `B1_HISTORY_BROKEN` |
| 3 | author.lock 串行化 | 64-84 | 占锁→freeze/save 均 throw；解锁→v2、旧冻结 STALE、新冻结 ok |
| 4 | status 不可欺升 | 85-89 | `status:'published'`→`B1_DRAFT_STRUCTURE_INVALID` |

## 3. 真实断言

如 §2 表（逐条读自 :31-89）；`:48` 断言 `readB1AuthorRevision(tpl,1).document.modules` 长度 0（旧版不被覆盖）。

## 4. 未覆盖与脆弱点

- 未覆盖：safeRead symlink 拒、`B1_FROZEN_CORRUPT`/`IDENTITY_CONFLICT`、Windows fsync 注记。
- 脆弱点：锁文件竞态窗口依赖 `wx` 语义；`writeFileSync(file,…)` 直改模拟篡改（:53-54）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §2 | 已证实 | 本文件逐行 |
| append-only/篡改可检/CAS 被固定 | 已证实 | 用例 1-3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| save/read 全链+冲突 | §2 | covered |
| freeze 幂等/STALE/INVALID | §2 | covered |
| 篡改检测 | §2 | covered |
| safeRead symlink/冻结损坏 | §4 | unknown（未测） |
