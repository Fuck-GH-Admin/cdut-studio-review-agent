# E4｜G08 复验与变更台账

| 验证ID | 对象 | 旧版本/改动版本 | 本轮实际复验 | 状态 | 后续步骤 |
|---|---|---|---|---|---|
| RET-001 | T02 D21受限修补两处 | 原Gold ZIP `cf3fe933ea19e66bae209df4c858d70860358d75dbf9250cde501602b1c3b8ed`;overlay ZIP `8e7c4caa9241612c1adc3ec6e2361469c29c89b3d40385887bccda834680878d` | 两处旧/新条目的SHA256与增量manifest全部一致，输入盲包独立旧SHA仍在；**仅哈希/结构复验** | HASH_ONLY_PASS, SEMANTIC_RETEST_OPEN | 新分类与子物件可信事实应按本案原申请和源责任独立复查，绝不能只验脚本绿灯 |
| RET-002 | T03 D1冻结时间勘误 | 新旧时间元数据摘要在私有`freeze_correction_audit.md` | 留痕存在、Gold逐案hash清单可核；没有第三方可信时间戳 | PROVENANCE_PARTIAL | 提供早期不可变外部时间证据（如有），不倒签 |
| RET-003 | T02/C全件哈希 | 原作者MD v0.1，C v2.1迁移包 | 作者清单10/10 SHA匹配实际字节 | HASH_ONLY_PASS | 源变化后受影响规则升版另核 |
| RET-004 | T03/C全件哈希 | 原作者MD v0.1，C v2.1迁移包 | 作者清单8/8 SHA匹配实际字节 | HASH_ONLY_PASS | D覆盖扩大后对照C同一固定SHA |
| RET-005 | G08旧T01归并G01 | G01模板v1.4 blob `6b931fb5f7d00482cb551f58d4fbb9349bd33cd2` | A记载SHA和main实际Git blob完全相同，实读§1/3/5–8核业务功能 | DESIGN_MAPPING_CHECKED | 不代G01完成Gold/运行验收 |
| RET-006 | 未关闭P1/依赖7票 | E-G08-T02-0001/2, T03-0001, A-0001, T02-S01, T03-S01, T02-I01 | 本轮**没有作者新版修复候选/校本官方批准证据** | NOT_RUN | 各责任分支提交新固定SHA和diff后，再开独立E round r02，按必要横向回归 |

**复验纪律**：不可修改原C或原D后宣称旧版通过；每次必须对新候选固定SHA，只重测实际影响与受影响横向共享义务，保留已开放票证据。
