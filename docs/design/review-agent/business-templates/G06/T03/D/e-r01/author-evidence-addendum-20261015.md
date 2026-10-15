# G06-T03 D作者侧：E r01定向补证（2026-10-15）

> 本文件是2026-10-15事后证据补充，不是2026-10-13原制作日志或Gold冻结证明。仅G06-T03（科研成果首次登记与认领）。原D与E r01裁定均未修改。

## 真实来源与完整性

- E冻结审计：audit/g06-e-v1-r01@1dcf4033256121efd3dea62b1153592df1facd7c，绝不视作A/B/C/D原作者提交。
- E审计原文：acceptance/E-v1.0/E4-issue-ledger.md、E-final-verdict.md、E1-supplementary-evidence-20261014.md；另核对E0-input-manifest.json及E1-official-fact-register.md（同目录）。
- 原D三套ZIP在本次工作容器恢复，SHA-256逐包与E0固定值一致，CRC通过：

| 原D包 | SHA-256 |
|---|---|
| G06-T03_INPUT_ONLY.zip | 418f055b4682625112dd69c07947d63ac72208d11c4088f21706f2b88d57a7b4 |
| G06-T03_EVALUATION_ONLY.zip（保密，严禁入公开Git） | 4af9582f67fefa9d59c6dd7f91d6bd168676875a1cb47fb2d8078406099df679 |
| G06-T03_D_REPORTS.zip | 8de183c4e14b3705f22c2498f55370b65f34781a22cadaa7e40cc89cdf04878f |

- 输入18案/82文件；评估包9成员、报告5成员；原Gold版本FROZEN_GOLD_v1，金标文件哈希18883192329677e32a4e659a55536f9c41fd9dcf2384e9af3b2676f83f966403；冻结清单哈希3a90405225a2357e960f1e7d6b14ee727b74e87317faaa6787c3f62ac6dac19e。只核原始字节，没有更改Gold、可信底账或输入。
- E0登记的A统一基线原ZIP哈希60e13c8f6805e65fa4bbec89f00f30e31bc4825884da298ffded0f096795b72b；B T03 v1.1原ZIP哈希e12a11136414f0e2126789ee5d356ad8cf29c7d7feefafd49fa7629b1ddd7053。A/B ZIP本轮未取得字节复算，不可倒写冻结前已逐字节核验。
- 原D作者生产Git commit：NOT_AVAILABLE_LIBRARY_ASSET；本补证新分支提交不能充当原作者生产commit。

## 独立性和Gold ACL

- 原D报告已经披露Library检索A/B时曾意外看到C标题和少量搜索摘要，未主动打开C母版或按C推Gold。本轮恢复材料的宽泛检索再次意外露出C摘要片段；未用于改Gold。独立性只能标为D_INDEPENDENCE_QUALIFIED，不可声称FULLY_BLIND_VERIFIED。
- 2026-10-13冻结前完整过程日志：PRE_FREEZE_PROCESS_LOG=NOT_AVAILABLE。本补证是事后复核，不是补造当时日志。
- 两个独立ZIP是物理分包，不是服务器ACL。私有Gold ACL=UNVERIFIED；尚无实际存储管理员、用户授权清单、可复查的允许/拒绝读取测试。管理员须建立受限Gold存储并提供ACL快照、真实读隔离证据，不能在公开仓库上传Gold、逐案预期、coverage.csv、trusted_fixtures或评分文件。

## E1范围和E r02条件

- E1对T03独立追踪22条：H18/M4；限定支持R03/R05/R06/R14/R15共5条，待证17条（H14/M3）。全域H91为来源待证，不等于91项D错误，更不等于T03错误。
- E-G06-T03-0001要求来源方补教师/学生实际发起及授权权限、已终审记录更正职责；T03首次登记/未审退回补正和T04历史更正不能混淆。各校特殊规则不得直接充当CDUT强制拒件。
- T01专利普通/快速预审、T05涉密研究生、T08动物伦理与实验安全、T09权利处分路径均为其他模板的范围挑战，对T03记录RECHECK_AFTER_SOURCE_FIX或NOT_APPLICABLE_TO_T03_GOLD_REWORK，不因此重做18案。
- 只有A/B/校方来源负责人取得新原文及适用时点/权限/例外，并经独立E1重新冻结后，才评估是否需要局部Gold显式升版；原v1不可改。
- E r02复核：E0重新验新补证SHA及受限ACL、E1重新核T03来源范围、具备前置条件后E2才对照C/D、E3跨业务边界复查、E4仅基于真实发现定缺陷。当前E_R02_ACCEPTANCE=NOT_RUN。

## 本次增量归档

- 原D包字节变化：0；Gold升版：NONE；C规则读取用于整改：NONE。
- 2026-10-15完整本地补证包 G06-T03_D_E-r01_evidence_addendum_20261015.zip，SHA256 d95cec7b25d421bee3f0cbb55196b712e3909bfcb8e86605a1cea0482d182440；含4份扩展说明、公开哈希清单及只核字节的离线脚本，不含隐藏Gold。
- 本次新Git提交仅用于归档公开安全证据，不修改审核E r01原分支和裁定，也不代表E r02验收通过。
