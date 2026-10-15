# G07-T04 D v2.1｜E r01 定向证据恢复（2026-10-15）

**仅适用于 G07-T04｜采购及委托服务履约结算预审。** 本文件为 D 原作者2026-10-15新增的可公开脱敏证据，不替代 D 原始Git提交，也不修改 `audit/g07-e-v1-r01` 的 `BLOCKED_INPUT` 原裁定。未读取 C 模板、C 自测或其他TXX Gold。

## 正式审计依据

已阅读 `audit/g07-e-v1-r01@ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab` 的 `E0-decision.md`、`E0-coverage-and-isolation.md`、`E0-input-manifest.json`。该 SHA **是独立E审计SHA，不是A/B/C/D作者SHA**。E0要求完整A/B/C/D原始输入和版本哈希、真实Gold受控存储及ACL，E1先锁独立政策复核后才可读取C/D答案。

## 原产物恢复：字节不变

| 原始产物 | 大小(byte) | SHA-256 |
|---|---:|---|
| G07-T04_INPUT_ONLY.zip | 16628413 | `2b4e2a4e9d46358263104b451f753b38ba63be72e6df108a491c1d1bf4fe0a8f` |
| G07-T04_EVALUATION_ONLY.zip | 77960 | `75e2f5a0203ef9b2df14e4f86611ee0cbee1fa7830d692ba0b6d29113dce36a1` |
| G07-T04_D_REPORTS.zip | 9321 | `1a4ca361bdfe1129d7ef3b8db5a8c87c5b3ad2b4251b8bc6e115f4890880d74f` |
| G07-T04_D21_CHECKSUMS.json | 1070 | `c7639d9cecaf6d17b1d87329ef14ee0865afdd66f48fa50266383a4f3abdd772` |

原产物当前可在D作者**原会话附件**中恢复；这些本地路径及聊天附件**不等于**独立E会话已经有访问权或真实ACL私有仓库存储。

原Gold版本：`FROZEN_GOLD_v1.0_30_plus_ADDENDUM_v1.1_TC031`。2026-10-15重新校验：329/329输入成员SHA、31/31 Gold成员SHA、最初30案冻结快照、TC-031单独增量冻结快照、虚构政策、9/9 A/B研究源SHA均一致。31案、174 PDF/205页能打开、低分辨率渲染且无PDF文字层，全部ZIP CRC通过。**不是重制Gold，不是模型/真实系统验收，也未逐页人工重新全文校验。**

D历史记录：D0=PARTIAL、D1/D2/D3/D4=PASS（历史离线限定范围）；D作者原Git提交SHA=`NOT_AVAILABLE`（原交接已声明未上传Git）。文件内“Gold先于输入制作”是作者记录；没有独立签名的历史时间链，第三方制作顺序证实=`NOT_VERIFIED`。

## 尚未解除的E0阻断

- `ACL_UNVERIFIED`：未取得私有Gold对象ID、存储管理员、访问控制名单与日志。**不得将隐藏Gold或Mock上传公开仓库/PR**。当前公开仓只提供元数据摘要，不提供按案 Gold、逐案期望、私有测试情景或可信Mock。
- 原A/B部分文件未全部恢复；本轮9个已取得源哈希一致不能说明其他B01/B04/B05已完成第三方冻结。2026校本细则的缺口仍是 `SOURCE_PENDING`。
- E0是全G07七套模板准入：本D作者只负责T04；其他六套未由本轮恢复。
- E原`BLOCKED_INPUT`不变；E1/E2/E3/E4一律未由本作者执行。

**结论：`T04_ORIGINAL_D_ASSETS_LOCALLY_RECOVERED_AND_HASH_VERIFIED / ACL_UNVERIFIED`；仅作E r02输入证据，不是E r02结论。**