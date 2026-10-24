# NB-14 独立复核报告（G0/G1/G2）— p05-review-engine · p05.pi + p05.t04

- 批次 `nb-14`（sealId `seal-910d78c7a7cee3ea`，sealedAtUtc 2026-10-23T15:56:07Z）；frozenSha `05fb2565…37c2`。作者 `docs-r07-author-nb-09-20261023`；QA `docs-r07-qa-nb-09-20261023`。
- **batchVerdict：accepted（14/14；0 blocking；4 minor 待关闭）**。预读 `reviews/nb-14/{SOURCE-CHECKLIST.md,PRE_READ_DONE.json}` 作为 G2 对照基线复用。

## G0 PASS（机械复算 0 错误）
14 源 blob+sha256/bytes/lines = SCOPE = MANIFEST；14 手册 hash 磁盘=MANIFEST=READY；MANIFEST `d4de72ab…`→READY `0eb0c1f6…`→DONE 链一致；ZIP `542de6e8…`（58712 B/17 条目=14 manual+MANIFEST+2 mechanical TSV，seal v2 无 READY/DONE）安全且逐字节一致；`changes.diff` 空树重放 14/14；元数据头 11 键 14/14。

## G1 PASS
导出计数逐文件复核：pi-case-review-service 22（8 接口+14 函数）、agent-client 2、executor 11、coverage 1、prompt-contract 1、published-plan 6、rules-scoring 19（手册误 18→N-03）；测试手册计数 4/11/8 声明 10 运行/5/3/10/13 与测试源逐行一致；行号引用抽核 30+ 处（跨文件 ipc.ts:3849/:3852、pi-review-ops-tools:17-21/:82/:109/:128/:181、pi-builtin-tools、review-pi-run-bridge/admission/strict-pi-tools、run-async-service、review-storage-id.test:92-95）0 未解析。

## G2 PASS_WITH_NOTES（对照预读 + 回源）
行为/权限/调用链/测试边界结论与独立预读一致，重点口径全部正确：RUN-42（技术完成≠业务就绪）、RUN-44（reconcile 读路径不落盘）、RUN-46（引用须本轮读取）、D2 门禁分工（submit 用 `verifyD2InstalledPlan`+`validateD2OperationEvidence`，**不用** `validateD2GuardSubmission`）、prepare/submit 门禁序与回滚、t04 asOfDate 禁机器时钟/多政策具名裁决/decision 槽 submission 期 not-applicable/最大余数尾差守恒。测试断言全部静态读标注，NOT_RUN 无冒充。

### Findings（4 条 minor，G4 前必须关闭——errata 或任一 rN）
| id | 文件 | 摘要 |
| --- | --- | --- |
| NB14-N-01 | pi-review-executor.ts.md | "15 个工具名/schema"应为 **13**（:23-27 与 :57-71 均 13；两处） |
| NB14-N-02 | pi-review-agent-client.ts.md | §3.2 `toolProfile:'customTools'` 应为 **`'review'`**（:148），与本篇 §9/测试 :189 自相矛盾 |
| NB14-N-03 | review-v3-t04-rules-scoring.ts.md | "18 导出"应为 **19**（10 type+9 fn，grep 实测） |
| NB14-N-04 | pi-case-review-service.ts.md | 未显式记录 :949 恒 false 死比较怪癖（行为描述正确无误导，补记即可） |

## 边界
产品测试/typecheck/build/GUI/真实模型/CLI/子进程全 **NOT_RUN**（52 测试声明仅静态读）；未改作者正文/源码/candidate/全局 FILES/COVERAGE/MANIFEST/INDEX/inventory/g0；未 commit/push。

## 下一步
lead 按 `reviews/nb-14/REVIEWED-HASHES.json` 14 个 exact manualSha256 合入并归档 `inventory/g0/nb-14.json`；NB14-N-01..04 并入 ACCEPTED-ERRATA（或作者 rN 顺带修）；QA 续 nb-15 起预读与新 sealed 验收。
