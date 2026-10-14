# G02-T03 D作者原始资产版本补证（E r01定向整改）

**签署日：2026-10-14。** 此文是D原会话对既有字节内容的当前书面重新核验，不是密码学签名或2026-10-13可信时间戳。仅负责G02-T03（**条件研究候选，非正式发布通过**）。不能修改E r01审计原裁定。

## 唯一原始资产三元组（旧文件完全保留）

| 类型 | 文件 | 原始字节数 | SHA-256 |
|---|---|---:|---|
| 普通盲测输入 | `G02-T03_INPUT_ONLY.zip` | 4117024 | `27fa687035bfad178d5052d237667fe7ff36c51872029f8a34f36533fe496238` |
| **私有评估Gold** | `G02-T03_EVALUATION_ONLY.zip` | 33549 | `daae981464f4945fe4a12f462a4791e86fe80b724dd329e4ea1cc62b07f4e2f5` |
| D0–D4报告 | `G02-T03_D_REPORTS.zip` | 9409 | `58547f28373effed9b31f18b6788b6717f43c422ac1e3b0978b4cc5877305cd9` |

**Gold ID：** `G02-T03 / FROZEN_GOLD_v1 / daae981464f4945fe4a12f462a4791e86fe80b724dd329e4ea1cc62b07f4e2f5`。

实际打开原受控包的 `frozen_manifest.json`：`gold_tag=FROZEN_GOLD_v1`、`gold_frozen=2026-10-13`、`source_baseline=A-v2.4; B-v0.2; attached D-v2.1 prompt`；该manifest SHA-256是 `3de72fcd5d20efedd7fe017592744671824dc49d2322ac49553a0424b59fb1c0`。原冻结日期仅为原始声明，未经不可篡改时间戳验证。重新验证输入**136/136**、原Gold文件**18/18**的逐文件SHA一致，三ZIP CRC PASS，无任何原件修改。

原D报告中的Gold子文件组合摘要 `3eebffd33b0d05ca672be430d353c712af6b93ce27273de162256dbc07c4a410` 保留为**原始历史声明**；其拼接计算方法未定义，本轮未声称独立复现这个辅助摘要，也未据此修改Gold内容。

原始D评估ZIP的 `frozen_manifest.json`未逐项列出其它9项受控依赖文件（包括可信mock、模拟政策、覆盖与评分）；完整ZIP SHA已固定其全部字节，当前生成额外的**RESTRICTED-only依赖哈希增量清单**供授权E审查者与存储管理员使用。该清单**未上传公开Git**，不替代Gold、不增加案例或更改原manifest。

## 研究依据与作者版本来源

- A-v2.4研究增量ZIP（据E0）：`294d4b3c056a8c9ed3d7fd78124a2c2d35c6b74b4685f82c00f65e46c3c47431`。
- A/B统一冻结ZIP（据E0）：`ff60d67993176851284d504dddccdd2ad63a99d1cd30396d62f24e6639398ff1`。
- B-T03-v0.1 ZIP（据E0）：`170194f4e0675a5183319196a8bfc2d58e9043721cebb3673335fe8d09e1dbac`。
- B-T03-v0.2 ZIP（据E0）：`aa75a97aae97ffb32752f3332e36694bc24edb138a8b7c5d100977cdd552ea0e`。
- 原D合同本地SHA `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1`；B00、B02、B06、B07研究文件本轮重新物化，SHA与原D00报告一致。

**原始A/B/C/D作者Git commit：`NOT_AVAILABLE`。** E r01审计冻结HEAD `49a14db3abb53e2ba6164af15537c4537b8f15fc`与main基线 `dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`都不是D原作者提交。本修复分支将产生的提交只代表**新的元数据补证**，不追认原件已在仓库提交。

## 访问、权利和独立性

**`ACL_UNVERIFIED`；`ISOLATION_PASSED=false`。** ZIP分离与会话下载并不证明持久私有对象存储的ACL。没有核实私有存储URI、主体和角色策略、实际允许/拒绝访问测试、管理员审计日志。E2前由有权存储管理员完成并留证；公开Git及PR**禁止**含Gold、可信mock、逐案结果、辅助评分和私有补充清单。

成都理工2026普通WebVPN/SSLVPN统一认证属常规服务，**不得要求常规登录者提交专项高权限材料**。成都理工专项运维VPN/堡垒机现行申请表、权限责任链未核实，保持`SOURCE_PENDING/POLICY_PENDING`；外校期限与证件要求不能设校本强制拒件。批准网络通道不等于业务角色、数据使用或堡垒机操作权；形式核验通过不等于校方批准或后台已开通。

原D独立性声明保留一次C验收说明文件名与规则数量的有限元数据接触；没有以C规则反推Gold。E r01审查者接触C语义导致其`BLINDING_COMPROMISED`，**本D补证无法使该审查者恢复未污染身份**。

**结果**：`GOLD_VERSION_ATTESTED=FROZEN_GOLD_v1`；`ACL_UNVERIFIED`；`T03_RELEASE_NOT_APPROVED`；`ORIGINAL_D_GIT_COMMIT=NOT_AVAILABLE`；不修改E r01，不宣布E通过。
