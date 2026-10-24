# nb-08 独立真值审查报告（independentQA: docs-r07-qa-nb-03-20261023）

- batch: nb-08 / frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
- authorSession: docs-r07-author-nb-03-20261023 / reviewerSession: docs-r07-qa-nb-03-20261023
- 审查对象: deliveries/nb-08（sealId seal-26162a91a91bfb18，sealedAtUtc 2026-10-23T14:15:53Z，18 manuals / 2354 manual lines）
- **batchVerdict: revision_required**（14 accepted / 4 revision_required / 5 findings + 2 可选备注）
- 生成时间（机器 UTC）: 2026-10-23T16:58:28Z
- 本轮 NOT_RUN：bun test / GUI / 构建 / 模型产品调用。

## 1. G0 机械门（pass）

- 18/18 源文件 blob、sha256、lines 与冻结树 `baseline/source@05fb2565` 逐条一致，与 nb-08-SCOPE 清单一致。
- manual sha256 stage == MANIFEST == READY 18/18；manualLines 一致。
- ZIP `R07-nb-08-05fb2565.zip`（sha256 09b52f5e…，100537 B，21 entries）= 18 manuals + MANIFEST + 2 mechanical TSV；无路径穿越/绝对路径/盘符。
- seal v2 链 MANIFEST→READY→DONE 哈希互洽（manifest 7ce5065b…、ready 39345717…、done 2bc32a95…）。

## 2. G1 证据门（pass）

- `changes.diff` 在空树重放 18/18 与 stage 字节一致。
- 元数据头 11 必备字段 + ≥5 章节 18/18；frozenSha/blob/sha256/lines/path/kind/package 与源一致；无自 `accepted` 状态。

## 3. G2 逐文件事实（revision_required）

独立源读真值基线：`reviews/nb-08/SOURCE-CHECKLIST.md`（7 source + 11 test 逐行预读，110 test / 423 expect / 0 mock）。本轮回源复验作者新声明，逐文件抽验符号、行号、分支、权限、读写、恢复、测试证据。

### 3.1 findings（须返修）

| id | 文件 | 严重度 | 摘要 |
| --- | --- | --- | --- |
| NB08-EXP-01 | native-workspace-case-v3.ts.md | low | §2 摘要“导出 11 项”与源 13 export、自身 13 行导出表自相矛盾 |
| NB08-PERM-01 | native-workspace-case-v3.ts.md | medium | §4.1/§7 概括各 IPC 调用点统一传 authorizeAtCommit；实际 review-ipc.ts:451 未传（仅前后断言，无提交时复核）——FACT-CHECKING-NOTES 第 8 条 |
| NB08-EXP-02 | review-v3-t05-local-stage-plan.ts.md | low | §2 摘要“导出 7 项”实际 9（3 fn + 6 type/interface），与自身 9 行表矛盾 |
| NB08-EXP-03 | review-v3-t05-main-service.ts.md | low | §2 摘要“14 项（function 9、type/interface 5）”实际 24 export（fn 15、type/if 8、re-export 1 含 2 名） |
| NB08-EXP-04 | stage-workflow.ts.md | low | §2 摘要总数 9 对但分类错（实际 7 function + 2 type/interface，无“2 其它”） |

### 3.2 可选备注（非阻断）

- NB08-NOTE-01 decision-readiness-v2.test.ts.md：夹具 10 处 `as never` 未标注未类型化脆弱性（另三本测试手册已标注同类）。
- NB08-NOTE-02 stage-workflow.test.ts.md：夹具 2 处 `as never`/`as unknown as` 未标注。

### 3.3 已复验为真的关键声明（抽样）

- run@rev 双口径：stage-workflow.ts.md §1/§3.2 明示 `basedOnRunId = run@rev${revision}`（源 `:134`）与 T05“只认真实 Run”并存属现存差异（源 review-v3-t05-local-stage-plan.ts:47-52 注释）——如实，未混同。
- non-compliant 仅 `waived`/`human-confirmed-compliant` 解释（源 review-v3-t05-main-service.ts:292-293）与 `T05_RESOLVING_DISPOSITIONS`（:199-201）差异已如实记录。
- `void hasOpen` 死代码 + 注释与实现不一致（源 stage-workflow.ts:330-333）照实记录。
- decision-readiness-v2.test 被测对象在 packages/shared/src/review/decision-readiness-v2.ts:35、非批内 18 文件——手册已明示。
- 权限其余入口：C0 主窗+主框、`deriveT05LocalActor` 非法角色降级、agent 代批门、申诉限 teacher、RUN-14 权威 Run 门均与源一致。
- 测试计数 6/1/11/8/5/11/12/23/11/12/10 = 110 test、describe 数 2/1/1/1/1/1/1/8/2/3/1 与源逐一相符。

## 4. 结论

4 本 source 手册的 §2 导出摘要计数/分类与源码及自身表格不符（事实错），1 本的权限章节未按实际消费者分列守卫（NB08-PERM-01）。按“事实错须返修、别为快放行”判 revision_required；其余 14 本 accepted。返修请出 nb-08-r1 新目录新 seal，逐条按 findings 的 action 改摘要行/权限节，其余字节不动；QA 将按新 hash 复验。

> 时间戳勘误：生成时 `date -u` 读到未同步时钟（2026-01-27T16:43:54Z）；机器 NTP 校正后真实机器 UTC 为 2026-10-23 线。本文件时间戳已按更正后机器 UTC 校准，无其他字节改动。
