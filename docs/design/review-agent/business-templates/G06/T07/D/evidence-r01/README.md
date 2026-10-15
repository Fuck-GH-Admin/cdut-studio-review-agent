# G06-T07 D v2.1 | E r01 作者证据增量（2026-10-15）

- 业务：G06-T07 涉人研究伦理材料核验
- 关联问题：E-G06-ALL-0001；校本来源 E-G06-T07-0001
- 审计固定引用：`audit/g06-e-v1-r01@1dcf4033256121efd3dea62b1153592df1facd7c`，**不是D作者commit**。
- 原D制作提交：`NOT_AVAILABLE`；E r01 基线 `dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e` 不是原D制作提交。
- **本分支仅保存2026-10-15的事后证据增量**，不对2026-10-13制作过程倒签；未修改E r01裁定或原D资产。

## 原始字节已恢复并与E0 manifest一致

| 原件 | SHA-256 |
|---|---|
| G06-T07_INPUT_ONLY.zip | `7be99c240cf06fa3c9faee65bb3cf4737b215456d6876a0ca1ff0e62d23c9f8d` |
| G06-T07_EVALUATION_ONLY.zip (**隐藏，不在本Git分支**) | `a2346867d94b9b07fba26a11e8926f2b819e6e609626e694a88fe4bb6fe69264` |
| G06-T07_D_REPORTS.zip | `7b586c9eeae46684f7b5d5daa1ec1bad40195ba7bb0abd5bb4c970183a7c6893` |
| G06-T07_D_DELIVERY_INDEX.json | `a57fd33fb7ca6ee271e1af4e5bcb8d1b1ecd0dd0e208462d7e5380ef643f6120` |
| 受控包内部冻结清单 | `d58acfac446681159375502c69fcbc951ad4fecafacd336dbe4ade90b55bcefc` |

20个案卷、186个输入文件，20份图片型PDF共24页；静态ZIP CRC、按清单逐文件SHA和PDF渲染/无可抽正文层检查通过。**不是内容正确率或产品测试**。原Gold仍为 `FROZEN_GOLD_v1.0`，未重做或改答。

## 可恢复的制作前依据

| 资料 | SHA-256 |
|---|---|
| D v2.1原提示词 | `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1` |
| A G06_00 | `67094b439d1a3d480655c3c6186dd317133b4bc0f6d391668ee5ece1a3ed8689` |
| A G06_02 | `f2f64257356d1919c9a28d6fe1547c47cefdd0261645ce7e5b1976c1b0d056e6` |
| B T07_07校本补证 | `be54ecba13fd63fc02305cb7634db6d4848adf66bcb529f257f64fe4f0457625` |

原B深调包v0.2在E0登记为 `776b6a2bbe9e4d88202cdca6ac14881255b6ec388ae9b193e0430766588cad92`，**本D整改回合未取到B0–B6原文**，故不声称原B已完整回读。

## 独立性与ACL的现实状态

原D报告声明未读C正文（仅曾见C文件名元数据），本次仅核实原报告、A/B可恢复文件及E r01公示；**不存在冻结前第三方可验证的完整操作或C访问日志**。声明为 `D_AUTHOR_DECLARED_C_INDEPENDENT; PRE_FREEZE_PROCESS_LOG=NOT_AVAILABLE`。新commit不追认为旧提交。

`GOLD_ACL=NOT_VERIFIED`：只有分包，没有真实私有存储授权主体、访问拒绝测试或IAM/ACL审计。**本分支不含隐藏Gold、可信底账或评分文件**。私有存储由具权限管理员指定真实身份、最小ACL、拒绝访问验证与审计时间后独立交E；当前 `ACL_OWNER_NOT_ASSIGNED`。

## 来源与E r02复验

T07 E1共18项候选：限定证实5，来源/程序待核13（H11/M2），不是13项Gold缺陷；全G06高风险H91缺口属于来源责任，不是T07的91个错误。T07伦理委员会受理/授权/非医学路径与学生PI权限仍 `SOURCE_PENDING`。**来源正式更新后**才做 `RECHECK_AFTER_SOURCE_FIX` 影响定位；确有Gold错误时另行显式升版，不随C规则反推Gold。

- **E0**：复核原SHA、A/B源版本、作者commit与私有ACL证据（后二者未补齐）。
- **E1**：校方正式原文与效力、主体、豁免条件逐条补证并重新锁定。
- **E2**：仅来源解阻并由独立E获C/Gold受控访问后进行源义务交叉验收（未启动）。
- **E3**：与T08动物伦理、T05发表和C20跨业务边界审查（未启动）。
- **E4**：仅依实际E2/E3证据裁定新缺陷/关闭阻断（未启动）。

`E_R02=NOT_RUN`；`C_CROSS_ACCEPTANCE=NOT_IN_SCOPE_FOR_D`；`RUNTIME_VALIDATION=NOT_IN_SCOPE_FOR_D`；`PRODUCT_ACCURACY=NOT_MEASURED`。
