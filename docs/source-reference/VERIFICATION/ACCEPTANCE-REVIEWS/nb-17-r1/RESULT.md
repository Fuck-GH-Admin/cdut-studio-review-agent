# NB-17-r1 独立复验报告 — batchVerdict: accepted（18/18）

- `nb-17-r1`（revisionOf nb-17，sealId `seal-6b5a0ccbe833249f`，sealedAtUtc 2026-10-23T17:58:06Z）；frozenSha `05fb2565…37c2`。
- **G0 PASS**：18 源绑定=MANIFEST=SCOPE；18 手册 hash 磁盘=MANIFEST=READY；链一致；ZIP `923da705…`（58404 B/21 条目）安全逐字节一致；`before/` 7 篇==父 stage；`changes.diff` 重放 7/7；RESPONSE after-hash 7/7。
- **G2 PASS_WITH_NOTES**：**3 findings 全关闭**——F-01（castRating 3 生产消费点逐条如实+动态口径否定范围）✅、F-02（compileOwnerRules→review-ipc:1178/:1181，逐符号分开）✅、N-01（7 篇 §2 行号 grep 实测重导+校订注+§10 软化，抽核 7 处全吻合）✅。11 篇逐字节未变子批重登记。
- **残余 NB17R1-L1（minor→errata）**：application-service §3.2 与 document-service §3 各 1 处叙述旧值残留（§2 已正确+校订注兜底）。
- 18 accepted / 0 revision_required；`acceptedHashes` 18 个 exact manualSha256（7 新+11 同 r0）。NOT_RUN；哈希脚本生成。nb-17 系列闭链。

## 下一步
lead 按 `reviews/nb-17-r1/REVIEWED-HASHES.json` 合入；NB17R1-L1 并 errata；QA 续 nb-66 验收。
