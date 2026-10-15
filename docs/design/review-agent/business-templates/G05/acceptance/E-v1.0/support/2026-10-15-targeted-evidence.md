# G05 r02 原审计会话｜定向安全核验与新E交接（2026-10-15）

**本文件性质**：在既定E r02冻结HEAD `20a65e5f47626e438a050852b19bf0643eeed3be` 后的最小增量佐证，仅服务受控交接；**不重启E0～E4，不修改或关闭r01/r02任何问题，不签新E1，不重建C/D Gold**。当前原审计会话过去已接触C作者交接语义及T04聚合Gold结果统计，不能担任首次无污染E1。公开文件不包含答案、敏感ACL或逐案索引。

## A. G05-T04 E0 安全清单独立静态核验（本次新复核）

**公开核验对象**：`fix/g05-t04-d-e0safe-r02@4be7e095f0a5c8f1bc84f1426b3c3bd05db4f3d8` 下
`docs/design/review-agent/business-templates/G05/T04/D/E0-003-r02/E0_SAFE_MANIFEST.json`。

- Git blob SHA-1：`98e3851531f8b8df4283de5ed22780cfbce71cba`。
- **本原审计会话直接从 GitHub 读取原始 UTF-8 文件并独立计算 SHA-256**：`da20bbf6fcac3ad13b448045a4380e6756459d3dbed43eb99471d6192ba86aa5`。
- JSON根键只有`version`及`assets`；`assets`数组7项，成员键只包含 `version, path, sha256, accessibility`。
- 全字段/文本检查没有发现`status_counts`、逐案`case_id/claim_id`、`expected_status`、风险覆盖到案号、状态类别数/分布、Gold预期结果等字段或标签分布。
- 作者报告中的**原有旧件**为`G05-T04_D_REPORTS.zip::frozen_manifest.json`，旧源字节SHA-256 **仅由原D作者报告、未由本E回读原受控字节**：`b93043f4da166a4946a105f8af0e60f63776502634c1ab5ba7b9a48de7a7e11a`。该旧文件与新 `E0_SAFE_MANIFEST.json` 是不同的交接入口，不能误当为同一个文件的内容改写或`git diff`。
- **复核结论**：新安全清单本身可作为E0无答案元数据入口，当前检查范围内`NO_AGGREGATE_GOLD_LABELS_IN_SAFE_MANIFEST`。**不是**对旧报告、Git全历史、缓存、外部文件库和全部测试输入的无泄漏证明；不能消除r01 E审查者已见汇总的事实。T04仍需新的未见旧统计者独立E1，旧`E-G05-E0-003`保持OPEN。

**最小复现**（公开仓库本地克隆）：
```bash
git show 4be7e095f0a5c8f1bc84f1426b3c3bd05db4f3d8:docs/design/review-agent/business-templates/G05/T04/D/E0-003-r02/E0_SAFE_MANIFEST.json | sha256sum
git show 4be7e095f0a5c8f1bc84f1426b3c3bd05db4f3d8:docs/design/review-agent/business-templates/G05/T04/D/E0-003-r02/E0_SAFE_MANIFEST.json | jq '{top:keys, n:(.assets|length), per_asset:(.assets|map(keys)|unique)}'
```
正确摘要应为 `da20bbf6fcac3ad13b448045a4380e6756459d3dbed43eb99471d6192ba86aa5`。

## B. G05-T02 与 T03 旧D历史接触链定位（原证据再定位，非新Gold复算）

| 模板 | 作者制作顺序披露 | 公开可复查说明blob | 旧受控 EVALUATION ZIP SHA-256（**作者自报原字节**, E未读取） | 原D制作Git commit |
|---|---|---|---|---|
| T02 | 同一历史会话先写C v0.1含46规则及作者走查，2026-10-13转D v2.1前披露既往接触，再生成18案42项原Gold | `432f86882184c3783e334554a058e2746ee4ba65`（`T02/D/remediation/E0-004-r01/E-r02-handoff.md`） | `a5c4af6868cc7fe63c39ead6f2dac4c6d5a425830fe4284ffbe08e4e8d510ad6` | `NOT_AVAILABLE` |
| T03 | 同一历史会话先做C，再做28案原D；作者承认`NOT_STRICTLY_INDEPENDENT_OF_C` | `cadf7856b3966aee7e260e34ea3cd4757c94e65e`（`T03/D/e0-002-access-evidence-r01/README.md`） | `5f7fbdc3411d258f157a72c1345e5e50bbf3d06d929cf92b46b00671f09677b7` | `NOT_AVAILABLE` |

T02来源分支`audit/g05-t02-d-e0-004-evidence-r01@ce26784a654276ead0523444972b3095b2800fdc`，Draft PR#52；T03来源分支`evidence/g05-t03-d-e0-002-20261015@8fa04da417c8e646f583e756d00eac78d3b0cde3`，Draft PR#55。旧版本均为`FROZEN_GOLD_v1`。当前是**作者披露的历史生产顺序证据**，不是已经取得独立的、带时间戳的全量会话/工具调用日志。

**两套单独的新D净室任务**：分别交给两个真正未见C正文、C作者自检、旧Gold和风险→案号映射的新D执行者；每位只提供固定A/B原文、官方来源及D v2.1合同。原D作者交A/B归档坐标和已有历史日志事实，**不得参与新Gold规则选择、测试采样或逐案判定**。在受控存储冻结新Gold版本、SHA、访问日志和身份隔离声明后，由新E按E1先锁事实、再获E2授权进行旧/新差分。

**精准尚缺日志请求**（请T02、T03各自原D资产管理员/会话保管人提交到受控渠道）：
1. 可验证的完整会话消息时间顺序/源会话ID与C首次生成、最后接触、D首次创建、Gold初冻结时间；尽可能含平台工具调用及文件访问日志、原始导出SHA；没有可信时间时如实标`AUTHOR_REPORTED_ONLY`。
2. A/B输入的实际完整归档哈希和版本、Gold首次冻结的原始受控清单/创建日志；不得用新文档的 Git commit 假装历史作者提交。
3. 新D各自的独立执行身份、隔离前置检查、访问白名单、全链路SHA和受控位置；不能只宣称“新聊天=新盲态”。
4. E协调验证E1锁定之前新E不能读评估包，之后具名E2可只读且未授权账号会被拒绝的ACL回执。

拿不到上述证据时：T02 `E-G05-E0-004`、T03 `E-G05-E0-006`和Gold ACL依赖仍OPEN；不推定全部旧Gold内容错误。

## C. G05-T06 只作官方来源定位（不作为独立E1最终事实锁）

- [2018-09-01发布于学校国际交流与合作处的国际会议专项规定](https://dice.cdut.edu.cn/info/1030/1101.htm)：网页末尾标注的**原文件日期是2017-10-08**，不可误以网页发布时间是条款制定日期。第2条限定其所称国际会议，第7～12条涉及报批、计划、提前报请、审批表、批准后通知和会后提交，第19条列解释部门，第20条规定自印发施行。
- [成理校发〔2025〕1号《成都理工大学会议管理办法（试行）》官方8页PDF](https://kjc.cdut.edu.cn/__local/4/8B/F5/215698571B2D5ED2946921CC3A2_D50922B2_32715.pdf)：2025-01-02印发；第2条说明适用于学校举办的各级各类会议；第5条（三）规定举办国际会议应先经国际交流与合作处审核、备案，再报分管外事工作的校领导审批；第17条自印发之日起试行，第18条由党委办公室、校长办公室解释。

**精确未决问题**：2018网页所载2017年制定的国际会议专项规定，至2026年是否仍有效、是否被明文修订/废止？2025总会议规定的归口审批与旧专项年度计划、提前期限及省级报批之间如何按适用主体、范围、阶段衔接？文书没有明确写“废止2017专项规定”并不证明两套所有条款当然累加，也不证明2017专项已失效。需新独立E1直接阅读两份全文及主管部门现行说明、自行做高风险义务判断并锁定。**本旧E不签E1**。

## D. 本辅助分支结论与交接安全

- 本轮唯一新增的**独立可复现文件级验证**：T04新安全JSON精确SHA-256与白名单字段结构核查。
- T06新增的原文定位细节仅用于确定新E查证点（2017文件落款/2018网页发布）；非政策效力结论。
- T02/T03接触链和旧包哈希属于r02已有作者披露证据；本次只是精确对接，未获得新的独立制作日志。
- **不提交新PR、不关闭旧问题、不覆盖r01/r02 HEAD**，是否启动新独立E1/D、ACL配置等交有权负责人。
