# G04-T02｜Gold provenance 与 ACL 状态（E r01 定向补证）

- 责任：原 G04-T02 D v2.1 作者；仅处理 E-G04-GLOBAL-0003，不改 C、Gold、E r01。
- 日期：2026-10-15，**不是原Gold创建/冻结日期**。
- 现状：`AUTHOR_PROVENANCE_RECORDED / INDEPENDENCE_SELF_ATTESTED_ONLY / ACL_UNVERIFIED / E_R02_REQUIRED`。
- E依据：`audit/g04-e-v1-r01@fc2ace5c874454ddbcfca731be7aa093416dab12` 的 E4-issue-ledger、E-final-verdict、E0-coverage-and-isolation。此审计SHA与main的`dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`都不是原D作者commit。

## 恢复的真实原始资产（未改）
| 原件 | SHA-256 |
|---|---|
| G04-T02_INPUT_ONLY.zip | `a6108d5686326fc59b10fbb3a5a36d360a7afa3c4374d78ebaa5a444307a1b8c` |
| G04-T02_EVALUATION_ONLY.zip | `c81d27287d7b13f2f5fcf4b6bbf225108fcc54461613b287b77dc21991f24e33` |
| G04-T02_D_REPORTS.zip | `d93cdc4175c613c8b9bbc33f40947e235f4ba3b90547fb6c6ad6258b37529217` |
| 受控包内 Gold/cases.json（内容摘要，**不可公开原件**） | `0f3361a31eff55cca7081864fce2a4ad1835c4ba537ecf7dfafc1548babc488e` |

三份原ZIP SHA与E r01 E0-input-manifest.json **完全匹配**；Gold内字节SHA匹配原冻结清单。原件仓库作者commit `NOT_AVAILABLE`。原D0=PARTIAL（A/B部分原文未能完整恢复）；原D1-D4=PASS（各自原报告限定的离线范围）；此次不改其结果。

## 首次构建时间与独立性证据分级
- Gold ZIP内条目时间`2026-10-12 20:55:22`；冻结清单ZIP条目时间`2026-10-12 20:59:50`。这两个是**无时区、可修改的ZIP元数据**，非可信外部时钟。
- 原冻结清单标`snapshot_date=2026-10-13`、`FROZEN_GOLD_v1.0`、`NO_C_CONSUMED`；是原D作者自述。
- 最早本轮能引用的**第三方字节一致性记录**：2026-10-14 E r01 的E0 manifest。不能据此证明Gold确切创制时刻。故`gold_first_built_at=NOT_EXTERNALLY_ATTESTED`，`gold_first_frozen_at=NOT_EXTERNALLY_ATTESTED`。
- 原D作者报告称创建Gold时未看C正式MD、C自检或作者答案；本轮也未取用C正文，只读了**冻结之后**E审计记录的C状态。没有完整跨账户、跨会话访问日志，独立性只能记`SELF_ATTESTED_ONLY`，**不是第三方完全证明**。
- 未发现C实际访问Gold或D先接触C答案的确证，`confirmed_contaminated_cases=NONE_IDENTIFIED`；未知访问历史`UNKNOWN`。**缺ACL不能推断已泄漏**，也不能由分包推断无泄漏。

## 路径、可见性、ACL
- 当前会话可访问工作副本：`/mnt/data/G04-T02_INPUT_ONLY.zip`、`/mnt/data/G04-T02_EVALUATION_ONLY.zip`、`/mnt/data/G04-T02_D_REPORTS.zip`。这不是经审核的长期私有ACL存储。
- E r01在其Library档案读取过相同SHA；**并无C作者可读/不可读的成员级证明或访问记录**。
- 公开Git main中E0未发现原作者三包；尚未对仓库所有历史/Actions/外部下载链接证明完全无泄漏。
- `private_gold_storage=NOT_CONFIGURED_OR_NOT_VERIFIED`；`acl_snapshot=NOT_AVAILABLE`；`download_access_logs=NOT_AVAILABLE`；`C_author_access=UNKNOWN`；`public_CI_access=UNKNOWN`。不能将文件分类标签`RESTRICTED_E_ONLY`等同实际 ACL。
- 本轮静态复查：30案例、INPUT=205文件、EVAL=40文件，相对路径交集0；冻结清单205条INPUT哈希全部匹配，missing/extra/mismatch=0。这只能证明**封装层隔离**，不能证明人员隔离或未发生内容泄漏。

## 公开范围和待办
可公开：三ZIP整体SHA、Gold总体SHA、30案、原D状态、以上版本/缺口及脱敏修复台账。**禁止公开** EVALUATION_ONLY字节、Gold、mock trusted fixtures、含预期的coverage矩阵、scoring及逐案答案链接。INPUT_ONLY若另行上传须先经公开材料审查。

要求管理员配置受控对象级ACL及访问/下载日志，向E r02提供私下可验的访问人范围与日志覆盖区间；若历史无法恢复标`HISTORICAL_LOGS_NOT_AVAILABLE`。如果确认C在冻结前获得Gold或D原先接触C答案，定位污染范围并交新独立D会话重建；**当前不重建30案**。

原E问题`E-G04-GLOBAL-0003`依旧OPEN；增量文档不是E r02 PASS。