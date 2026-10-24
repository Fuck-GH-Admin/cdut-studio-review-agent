# NB-41-R2 返修复验报告（rN 独立验收，终态）

- 批：nb-41-r2（revisionOf nb-41-r1，18 文件）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-41-r2/`（sealId `seal-246efa6dfd90a0d8`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— **18 accepted / 0 revision_required / 0 unknown**。nb-41 系列就此**结案**。
- 测试：**NOT_RUN**。

## G0：PASS-with-defect
链/绑定/before==r1（18/18）/人工列/元数据全过；**F-NB41R2-G0-01（minor，证据层）**：changes.diff 用非标准 hunk 头「@@ §10 单格修订 @@」，git apply 不可重放；QA 以 before/stage 直接比对证实 delta 与 diff 意图**逐字一致**（唯 :66 一行）——缺陷在 diff 语法不在字节。**合入证据以 before/stage 直接比对为准**，lead 合并台账记录此例外；后续 rN 交付须恢复标准 unified-diff 头。

## G2：FULL
- **F-NB41R1-01 闭合**：dataset.ts.md §10 `:66` 改「3 导出…（QA F-NB41R1-01 校正：残留 4→3）」，与 §2「共 3 个导出」一致 ✓
- **N-NB41R1-01 顺带闭合**：FINDINGS-RESPONSE 列举名更正（未改动 5 篇实为 evaluator/dataset.test/2×tsconfig/benchmark package.json）；r1 封字节未动——处置正确 ✓
- 其余 17 篇 == r1 字节 ✓

### 处置
**18 篇全量合入**（`reviews/nb-41-r2/REVIEWED-HASHES.json` exact manualSha256，**取代 r1/r0 对应行，nb-41 系列最终版**）。证据：`reviews/nb-41-r2/{RESULT.json,REVIEWED-HASHES.json,DONE.json}`。未改作者/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
