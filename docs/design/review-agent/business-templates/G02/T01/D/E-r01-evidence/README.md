# G02-T01｜D 作者 E r01 定向证据补齐（公开元数据）

> 2026-10-14。仅处理 E0 的 `ACL_UNVERIFIED`、原作者来源证据及 v3 版本辨识；不修改 E r01 原裁定、不运行 E1–E4、不修改 C 或受控 Gold。

## 1. 审计与作者身份

- 正式审计分支：`audit/g02-e-v1-r01`；审计冻结 HEAD：`49a14db3abb53e2ba6164af15537c4537b8f15fc`。
- E r01 固定代码基线：`dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。
- **上述两个 SHA 均不是 D 原作者 Git commit**；A/B/C/D 原作者提交：`NOT_AVAILABLE`。
- 已阅读 `E0-decision.md`、`E0-coverage-and-isolation.md`、`E0-input-manifest.json`（于 E r01 审计 HEAD），未改写它们。

## 2. 指定版本：FROZEN_GOLD_v3

本轮从用户 Library 找回 v3 的**原始字节**，重新计算全部 ZIP SHA-256、ZIP CRC，并和作者侧 `G02-T01_D_ASSET_HASHES.json` 及审计侧 E0 manifest 交叉核对，全部匹配：

| 原件 | 字节数 | SHA-256 |
|---|---:|---|
| G02-T01_INPUT_ONLY(1).zip | 1138127 | `5a4fd8f384c10ad96038ee8adf03537a53d24d85ddc1e382dd5808584e61f4cb` |
| G02-T01_EVALUATION_ONLY(1).zip **（不公开上传）** | 31862 | `4fb0ae435251257d751461e4d34069d3938e3be9afb57ad8c2874f6cd0fb7210` |
| G02-T01_D_REPORTS(1).zip | 6242 | `2eae987e651ffdbcde4cf4acdb5619a082bf2abcd61b1b8b2f6bd45f012e2d12` |

受控 ZIP 内有且仅有一个文件的内容 SHA-256 与作者声明的冻结 Gold 哈希 `2e2c41b042e05110d6a407e341c82a11e75f46e6536f8e9a5cd41a8a65b5a38c` 匹配。此处仅核字节身份，未发布、解析或修改逐案预期答案。

旧版三件原件**不选用**：

- `G02-T01_INPUT_ONLY.zip`：`4a47ad32bae4ec702b792805e2cde9ac0afac08c7197dbf9c8cc19455e65cca5`
- `G02-T01_EVALUATION_ONLY.zip`：`5e6d6a187c7fc1c06a0021a69572e088231272ea9df57ec5e1f9a2775c774d57`
- `G02-T01_D_REPORTS.zip`：`5dd330080fb8ec8218c3ac26b09c5421840549b2ef2bd21beaf104d3e94145f1`

**新旧包不得交叉使用。** v3 的 20 案不得和早期21案 Gold、mock底账、报告交叉评分。

## 3. 使用的 A/B 原始档案

经独立重新读取文件字节并通过哈希/CRC：

- `G02_A阶段第二轮补充调研_v2.4_20261012.zip`：`294d4b3c056a8c9ed3d7fd78124a2c2d35c6b74b4685f82c00f65e46c3c47431`
- `G02_B阶段_统一冻结基线_v2.4_20261012.zip`：`ff60d67993176851284d504dddccdd2ad63a99d1cd30396d62f24e6639398ff1`
- `G02-T01_B阶段深度调研_v0.1_20261012.zip`：`e47641d842a8757608da3cfa2c02a28b3911a8e12dd7942767d1ed290a02ddd7`
- `G02-T01_B阶段_校本补充核验_v0.2_20261012.zip`：`acc61d5163fc00974bf74814c594b77cee9ec47dff3aaf44e23ad1411785ecee`

文件字节一致不能证明 Gold 制作前的完整工具阅读顺序。

## 4. 未闭合项与责任边界

- `INDEPENDENCE_UNVERIFIED`：v3 作者报告自述 Gold 冻结前未接触 C；但是没有具备法证完整性的工具/访问日志证实先后顺序。Library文件上传时间**不是**可信Gold冻结时间。
- `ACL_UNVERIFIED`：EVALUATION_ONLY 资产存于用户Library并与输入分包；但尚未取得对象级ACL、完整读者名单、私有存储ID、允许/拒绝访问验证及访问审计日志。
- `SOURCE_PENDING`：2026年成都理工大学数据共享制度和当前流程仍需有权部门核实。严禁用外校规定虚构本校拒件条件。
- 本次公开分支**没有提交**任何 Gold、评分答案、受控可信底账或逐案答案索引。D v3 原包**一个字节未改**。本次没有重做测试案例，也没有将 E r01 阻断裁定改成 PASS。

## 5. E r02 所需工作

- **E0**：独立再验 v3 三包和来源哈希；由存储管理员补交真实受限仓库 ACL、授权读者、访问日志和私有版本ID；原作者独立性证据无法证实时继续保留未证状态。
- **E1**：由**未接触 C 语义的审查者**依据 A/B 和官方原文重新预注册并冻结风险/事实基线；特别注意“尚待数据生产部门批准”并非“提交时缺后置会签”。此项不是 E0 已确认的 D 错误。
- **E2**：仅在 E1 独立冻结且ACL就绪后受控读取 C 与 D Gold。
- **E3**：在 E2 完成后做 G02 的模板/风险覆盖及跨业务遗漏核验。

`E0-decision.md` 原结论保持 `BLOCKED_INPUT`。此文是D作者侧增量证据，不是E r02通过证明。
