# nb-39-r1 独立复验报告（G0/G1/G2）

- 返修批 `nb-39-r1`（revisionOf `nb-39`）；sealId `seal-5be9bf8200d1faa7`；**批次结论：accepted（8/8）**。NOT_RUN。
- G0 PASS：哈希链 MANIFEST→READY→DONE→ZIP 一致；changes.diff 与 before→stage 增量逐 hunk 实算全等；**3 篇修订 + 5 篇逐字节同 r0 accepted hash**（旧接受不套新字节——修订篇均按新 manualSha256 重新实证）。
- G2 PASS：逐条复核 findings 修正文本回源，全部成立：
  - `sonner.tsx.md`：F-NB39-01 已关闭（revised in r1）。
  - `spinner.tsx.md`：F-NB39-02 已关闭（revised in r1）。
  - `todo-date-picker.tsx.md`：N-NB39-01 已关闭（revised in r1）。
- 未修订篇与 r0 acceptedHashes 逐字节一致，r0 accepted 结论继续有效。
- 合入：全部 8 篇按 `reviews/nb-39-r1/REVIEWED-HASHES.json` exact manualSha256 合入 candidate（取代 r0 对应行）。
- 证据：`reviews/nb-39-r1/{RESULT.json,REVIEWED-HASHES.json,DONE.json}`；未改作者/源码/candidate/全局账；NOT_RUN。
