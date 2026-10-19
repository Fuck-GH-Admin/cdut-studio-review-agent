# B4 R12B｜G06-T01 真实原始 v0.1 单独恢复追加凭证

不覆写 R11 `B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json` 或 R12A `B4-3-ORIGINAL-RAW-RECOVERY-R12.json`，它们是历史检查点，不应“修正后看不见曾经的版本冲突”。

- R11 原先找到 `G06-T01_正式业务模板_MD_v0.1.1.md`，原始哈希 `819ede4d926cfc671b22c19ecb3ec0fea03c75ba2f27f492fad47912a3024230`，确与 D4 冻结原文不同，隔离结论当时正确。
- R12B 另行找回 `G06-T01_正式业务模板_MD_v0.1.md` 原始 94,183 bytes，直接 `sha256sum`：`e3bb29673e317bf65b00b9b20f5af56a69d8fb2d87f42e2c3aab0473d7e9f727`，与 D4 冻结元数据相同；并非把新版本改名/规范化后凑出哈希。
- 总历史原文字节身份：原 R03+R11 43/50、R12A 3/50、R12B 1/50 → **47/50**。剩余 G02-T03、G04-T06、G08-T03 仍 `HASH_MISMATCH_QUARANTINED`，且其不同版本原文的真实 SHA 也重新物理哈希确认为原 R11 观察结果。
- 四线法律/业务边界不变：47 份 raw matches 仅证明原文身份，不是 47 套政策真实有效、业务无损映射、独立 Gold 或正式发布。50 套仍 `candidate-held/publicationAllowed=false`；G01 34 scope UNKNOWN 与 4,163 条来源 applicability unknown 保留。
- G06-T01 的原文到 Check×Subject×责任×版本的逐义务审计仍待推进，原 v0.1.1 如按新候选处理须明确另立版本与人工变更记录；不得覆盖历史冻结 v0.1 身份。

本条仅为 Dev-B B4 证据追加，正式 I2 B 来源仍是 C 已锁 R10 `bf88320e57b20ebc2023f27665c544ce2ba72ce4`，无 C/I 共享端口写入或政策升级。新增专项 Bun consistency test 不代替本轮实际物理原件 SHA256 重算。
