# NB-15-r1 独立复验报告 — batchVerdict: accepted（17/17）

- `nb-15-r1`（revisionOf nb-15，sealId `seal-272a7f266a1cca1d`，sealedAtUtc 2026-10-23T17:26:02Z）；frozenSha `05fb2565…37c2`。
- **G0 PASS**：17 源绑定脚本实算==MANIFEST==SCOPE；17 手册 hash 磁盘=MANIFEST=READY；MANIFEST `74bb8870…`→READY `6525bf60…`→DONE 链一致；ZIP `929d2434…`（59236 B/20 条目）安全逐字节一致；`before/` 2 篇==父 stage 原字节；`changes.diff` 重放 2/2；RESPONSE after-hash 2/2。
- **G2 PASS**：**NB15-F-01 四点全关闭**（§9 列全 11 组声明行 grep 口径、缺口移除「输入变化拒绝」并显式更正误判、§11 覆盖行改 covered、StartRunOptions :80-91 形状 8 字段与源逐字一致）+ **NB15-N-01 全关闭**（7 表行+6 断言行改为实测值）；自核补正（`batch-store.ts:650` 注释归属）属实。15 篇逐字节未变子批重登记。
- 17 accepted / 0 revision_required；`acceptedHashes` 17 个 exact manualSha256（2 新 + 15 同 r0）。NOT_RUN；哈希脚本生成。nb-15 系列闭链。
