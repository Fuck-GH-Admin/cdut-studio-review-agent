# NB-09-r1 独立复验报告 — batchVerdict: accepted（17/17）

- 批次 `nb-09-r1`（revisionOf `nb-09`，sealId `seal-f67c1fca2f34bcc2`，sealedAtUtc 2026-10-23T16:21:20Z）；frozenSha `05fb2565…37c2`（HEAD 核、clean）。
- **G0 PASS**：17 源绑定=SCOPE=MANIFEST 重算全等；17 手册 hash 磁盘=MANIFEST=READY；MANIFEST `bf3e5988…`→READY `1a33c056…`→DONE 链一致；ZIP `169ff706…`（87867 B/20 条目）无穿越/符号链接/外批；`before/` 6 篇 == nb-09 stage 原字节（逐 hash）；`changes.diff` 从 before/ 重放 6/6 逐字节 == stage；FINDINGS-RESPONSE after-hash 表 6/6 与实算一致。
- **G2 PASS**：6 篇修订逐 hunk 回源复验，**6 findings 全部关闭**——
  - NB09-F-01 → case-store.ts.md §3.9/§9 + case-store.test.ts.md §4：按 `case-store.ts:289-292` 实现写明"缺省（undefined）完全跳过 CAS"，照实记录注释 :273-274 矛盾，缺口句改"缺省跳过 CAS 无直接用例"。✅
  - NB09-F-02 → review-d2-execution-gates.ts.md §8/§9/§10：唯一调用点 `review-d2-runtime.ts:533`、`verifyD2PiRun` 无生产调用者、提交拒绝归 `pi-case-review-service.ts:915/:984`，:360 vs :328/:374 分层改写。✅
  - N-01 拒绝串 13（学籍 3+通用 1+gate 4+材料 5 行号组）✅；N-02 disk-tx 测试导入 3/5+间接 ✅；N-03 application-service :347/:354/:351/:502/:505 ✅；N-04 readAggregate"不写业务数据/不改写主账"+getConfigDir mkdir 限定、75 静态+3 动态 require ✅。
- **11 篇逐字节未变**（== r0 QA verified 字节），按子批规则在 REVIEWED-HASHES.json 重新登记同一 hash。
- 判定 **17 accepted / 0 revision_required / 0 unknown**；`acceptedHashes` 17 个 exact manualSha256（以 r1 表为准，r0 表停用）。
- NOT_RUN：产品测试/typecheck/build/GUI/真实模型；未改任何文件区（作者正文/源码/candidate/全局账）；父批 r0 字节保留未动。

## 下一步
lead 按 `reviews/nb-09-r1/REVIEWED-HASHES.json` 17 hash 机械合入（nb-09 系列闭链）；QA 续 nb-14 验收与 nb-15 起预读。
