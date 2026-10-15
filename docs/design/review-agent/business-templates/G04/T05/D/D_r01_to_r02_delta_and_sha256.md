# G04-T05 D r01定向整改——原件与增量差异

原D0—D4为2026-10-13会话交付，E r01在2026-10-14记录其SHA。此次2026-10-15**只补证据与陈述**：原INPUT/EVALUATION/REPORTS的SHA与E冻结目录一致，零字节更改；未重新生成Gold、没有改C、没有修改E原裁定。详细数字见`gold_provenance_and_acl_status.md`。

| 内容 | 旧/当前对比 | 影响 |
|---|---|---|
| 原INPUT_ONLY.zip | `cb778721698bee8106bcced4a59b163f5afcf8564999eadb7c3468e11085033b` → **相同** | 原26案保持 |
| 原EVALUATION_ONLY.zip | `3439b51dde96863cfe854432d62ded6db1c41fb6d4e5b622b5b1099f6f11de0e` → **相同** | 原逐案Gold与底账保留 |
| 原D_REPORTS.zip | `121737bce03946cada21067d8432ddc8907b0b5e099763e07994c0f485b58a80` → **相同** | 保留旧作者D0=PARTIAL、自报D1-D4 |
| 新来源/ACL状态 | 新增公开说明 | 陈述制作时序与限制，不修正答案 |
| 新E r02交接 | 新增公开说明 | 指定E0/E1/E2/E3/E4复验 |
| 本次Git commit | 新的2026-10-15 D作者增量 | **不能**当作2026-10-13原作者commit |

实际Gold首次计算时间`NOT_PROVEN`；C制作期完全独立`UNVERIFIED`；私有ACL/访问日志`UNVERIFIED/NOT_AVAILABLE`；校本专项实施条件`SOURCE_PENDING`；E修复状态`OPEN`。单纯缺ACL不能断言泄漏。

**公开Git仅含这三份无逐案答案的元数据MD**。完整Gold、模拟底账、内部manifest、评分脚本全部保留于原评估包且不得进入公开PR。