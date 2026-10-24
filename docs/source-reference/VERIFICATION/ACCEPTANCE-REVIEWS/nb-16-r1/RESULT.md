# NB-16-r1 独立复验报告 — batchVerdict: accepted（17/17）

- `nb-16-r1`（revisionOf nb-16，sealId `seal-f6f07d0025a2affe`，sealedAtUtc 2026-10-23T17:34:40Z）；frozenSha `05fb2565…37c2`。
- **G0 PASS**：三方 hash/链一致；ZIP `5d2bec84…`（57668 B/20 条目）安全逐字节一致；`before/` 3 篇==父 stage；`changes.diff` 重放 3/3；RESPONSE after-hash 3/3。
- **G2 PASS**：**NB16-N-01 全关闭**（coverage-ledger 两篇标签 13→11 共 3 处，与 test :75-158 实测 11 声明一致）；**NB16-N-02 全关闭**（`validateDemoState` :213-283 + 辅助函数分列，与 grep 实测一致）。14 篇逐字节未变子批重登记。
- 17 accepted / 0 revision_required；`acceptedHashes` 17 个 exact manualSha256（3 新 + 14 同 r0）。NOT_RUN；哈希脚本生成。nb-16 系列闭链（NB16-N-01/02 errata 销记）。
