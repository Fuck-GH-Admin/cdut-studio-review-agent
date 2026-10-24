---
path: apps/electron/src/main/lib/review/review-v3-t09-main-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0df9c7e77f7a6709a1fa81933705080c9699a665
sha256: 35b86bed13a0dc4ab52812788fb1b27f5c4271639451b67a53cd1fa4676c838e
lines: 289
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-main-service.test.ts

## 1. 测试目标

T09 桥接（文件头 `:1`）：签发→预览→导入（附件先登记原件 + 本 action 推进 revision 后 CAS）+ 崩溃续跑。被测：`review-v3-t09-main-service.{issueT09StudentPackage,previewT09Package,importT09Package,t09AssetTempRoot,pruneT09AssetTempRoot}`；`T09ImportDeps` 用最小 harness（`:25-88`）模拟真实 Main 语义（每次登记/答复 revision+1、外部写入也推进、可注入失败/中断、`verifyApplied` 按事务回执核验）。夹具：`PROFER_CONFIG_DIR=mkdtemp(t09-)`（`:8-10`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**13 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:100-112` | 签发→应答→预览 `ready` |
| 2 | `:114-131` | 两附件逐份登记推进 revision（3→4→5），答复 CAS 用 **5**（非预览版本 3）；`registerMetas` 精确 `{displayName, materialSlotId:'proof-slot'}`×2（OFF-05）；最终 revision 6 |
| 3 | `:133-149` | 两次登记之间外部写入：`rejected`、`respondCalls` 0、只登记了 `c1.txt`（保留供续跑） |
| 4 | `:151-166` | 登记后、答复前外部写入：`rejected`、supplementStatus 仍 `open`、回执 0（不覆盖外部改动） |
| 5 | `:168-176` | 同 actionId 重导：`accepted`→`duplicate`、`respondCalls` 1（不重复写） |
| 6 | `:178-186` | 签发后补件被判 satisfied → 预览 `conflict` |
| 7 | `:188-196` | OFF-02 预览后 revision 前进：`conflict`、零登记零答复 |
| 8 | `:198-213` | 答复中断续跑：首抛“进程中断”（登记 f1/f2、rev 5）；重放 `accepted`、**不重复登记**、第二次答复 `expectedRevision===5`、rev 6 |
| 9 | `:215-225` | 续跑前外部写入（5→6）：`rejected`、登记仍 2 次、答复仅中断前 1 次 |
| 10 | `:227-245` | 答复成功但 applied 标记前中断：重放经 `verifyApplied` 核验 → `duplicate`、不重放（respondCalls 不增、rev 5） |
| 11 | `:247-260` | OFF-03 receipts.json 丢失：`accepted` 后删 receipts → 重放 `duplicate`、登记+答复总次数不变 |
| 12 | `:262-274` | 第 2 份附件登记失败：不写答复；重试 `accepted`、只补登记 j2（`registerCalls==['j1.txt','j2.txt']`、attempts 3）、CAS 5 |
| 13 | `:276-288` | OFF-06 `utimesSync` 制造 1h 前旧文件：`pruneT09AssetTempRoot(60_000)` 删旧保新（`removed>=1`） |

## 3. 真实断言

- #2 断言 `respondCalls[0].expectedRevision===5`——“本 action 自己推进后的准确 revision 做 CAS”的核心语义（注释 `:120`）。
- #8/#10/#11 是三种崩溃现场的真实模拟（抛错/标记前中断/删 receipts.json），断言 duplicate 语义分别经 staging、`verifyApplied`、`stagingReceipt` 三条恢复路径。
- #12 断言 `registerAttempts===3`（1 成功+1 失败+1 补登记）——不复制已成功附件。
- #13 用 `utimesSync` 真实改 mtime 验证 60s 回收窗口。
- harness 的 `respondSupplement` 自带 CAS 校验（`expectedRevision !== state.revision` → VERSION_CONFLICT，`:74-76`）。

## 4. 未覆盖与脆弱点

**未覆盖**：`t09PublishedStudentVisibility`（在 `review-v3-t09-visibility.test.ts`）；载荷漂移（`T09_ACTION_PAYLOAD_DRIFT`）分支；`T09_STAGED_ASSET_MISSING`；`applying` 且 `verifyApplied` 未提供时的 `T09_RECOVERY_UNCERTAIN`；非 student 回包拒绝；`readT09TaskPackage` 白名单；旧版 staging 无 index 的回退匹配。

**脆弱点**：harness 是模拟而非真实聚合（`as unknown as CaseAggregateV2`）；revision 语义完全由 harness 定义；`respondCalls`/`registerCalls` 为唯一副作用证据。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、13 test、真实账本文件 | 已证实 | `:99`；`grep -c test(`=13 |
| 附件先登记、CAS 用本 action 推进版 | 已证实 | `:114-131` |
| 外部并发在登记间/答复前均拒 | 已证实 | `:133-166` |
| 幂等 duplicate | 已证实 | `:168-176` |
| 三种崩溃恢复（staging/verifyApplied/stagingReceipt） | 已证实 | `:198-260` |
| 附件失败不写答复、续跑不复制 | 已证实 | `:262-274` |
| 60s 临时回收 | 已证实 | `:276-288` |
| 载荷漂移/其它拒绝分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 签发/预览 | #1/#6 | `:100-112`、`:178-186` | covered |
| 导入主链（登记+CAS） | #2/#12 | `:114-131`、`:262-274` | covered |
| 并发守卫 | #3/#4/#7/#9 | 多处 | covered |
| 幂等/恢复 | #5/#8/#10/#11 | 多处 | covered |
| `pruneT09AssetTempRoot` | #13 | `:276-288` | covered |
| 漂移/缺失/待核验分支 | — | — | unknown |
