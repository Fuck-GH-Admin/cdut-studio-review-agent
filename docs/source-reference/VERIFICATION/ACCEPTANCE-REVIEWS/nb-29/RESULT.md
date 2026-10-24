# NB-29 独立验收报告（G0/G1/G2）

- 批：nb-29（14 文件/3324 行，p06-review-batch · p06.residual）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-29/` 封版字节（sealId `seal-8ccdc6c2f7fc1367`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— 14 accepted / 0 revision_required / 0 unknown（附 2 条 low 非阻断计数备注）。
- 测试/构建/真实模型：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链 MANIFEST→READY→DONE→ZIP 实算一致（DONE 三 hash + sealId 匹配）；ZIP 17 条目无穿越/绝对路径/符号链接/外批/reviews、无 READY/DONE、逐条目==盘上字节；源绑定 14/14 ==SCOPE==MANIFEST==冻结树；manualSha256 14/14 无 drift；changes.diff 空树重放 14/14 逐字节一致；SOURCE-EVIDENCE/COVERAGE 人工列 14/14 非空；元数据 11 键 14/14。

## G1 格式：PASS
7 源手册 11 章 / 7 测试手册 6 章；带名行号引用 33/33 在范围（含 preload/index.ts:4916-5032 实测 5105 行）；测试起始行抽核 22 处全吻合；14/14 三分法 + NOT_RUN。

## G2 源码真实性：PASS
14 手册逐篇完整阅读并回源复核。正向核实（均实测）：
- **否定结论正确**：`review-v3-t07-rating-adapter.ts` 五导出**全树零消费者**（作者如实写「当前无调用者/潜在预留接口」，QA 预读旧注错误已作废）；`review-v3-t07-state-store.ts` 无专属测试如实标注。
- T07 域：同分三分支（共享名次/by-dimension 同值同 rank 不按 caseId/owner-decides 精确匹配）、跨名额边界 selected=null、提交五重校验、actionId 重放 `T07_ACTION_REPLAY`、reopen 复制规则、投影不泄漏——与源逐条一致；定点六位 half-up 语义正确。
- B2 域：`input-only, not applied to CurrentCase` 红线、/1 只读（LEGACY_SCHEMA_UNPINNED）/2 四字段固化、终态重放防篡改、`RECOVERY_REQUIRED`（`ledger-<20hex>.tmp`）/`LOCKED`/nlink!==1 fail-closed、tmp+双 fsync+rename、token 先消费后拷贝、五元 scope、documentVersionId 物理源区分——全部与源一致。
- 模板域：TAR-08 发布重跑 T01、TAR-13 executionScope 派生、TAR-14 复合规则 ID、TAR-17 锁隔离留证据、停用 sidecar 不改正文、comprehensive-assessment-v2 requiredAt 迁移限定——与源一致；测试 19 用例计数正确。
- e2e 两篇：`DEPENDENCY_UNRESOLVED` 安全拒止断言、fakeClient/mock.module 双层模拟边界、MANAGER-INTAKE-GATE 不绕行——如实；断言未冒充运行。

### 非阻断 findings（2，low，不影响合入）

| id | 文件 | 内容 |
| --- | --- | --- |
| F-NB29-01 | `review-v3-t07-rating-workflow.ts.md` | §2/§10「导出类型 18 + 函数 4」→ 实测 16 类型 + 4 函数（表格 20 项正确）。 |
| F-NB29-02 | `template-store.ts.md` | §2/§10「17 导出」→ 实测 18 条 export（表格 17 行系 remove/restore 合行，清单完整）。 |

均为汇总计数笔误、逐项清单正确；按 G2「≤2 非阻断精确性备注」入 accepted。若未来开 rN 顺带修正即可（不接受原地改字节）。

## 合入
14 篇全部可按 `reviews/nb-29/REVIEWED-HASHES.json` 的 exact manualSha256 合入 candidate。证据索引：`reviews/nb-29/{RESULT.json,REVIEWED-HASHES.json,DONE.json}` + 预读 `SOURCE-CHECKLIST.md`/`PRE_READ_DONE.json`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
