# E4 r02｜逐票差分问题及正式修复状态台账

> 冻结旧票据：`audit/g08-e-v1-r01@d5901f1d6ed03454fe1c00201e20d4a373834b75` 的 `E4-issue-ledger.md`；**不删除、不修改旧票号或旧裁定**。日期2026-10-15。

原7票继续开放：4 P1 / 2 BLOCKED_SOURCE / 1 BLOCKED_INPUT。新增2票：1 P1（T02公开Manifest错误）+1 BLOCKED_INPUT（T02/T03新私库ACL）。**r02现计5 P1 OPEN、2来源阻断、2输入依赖阻断，已修复并独立复验关闭数0**。

| issue | r02实际状态 | 修复交付 | 作者/责任 | 对E2或最终放行的影响 |
|---|---|---|---|---|
| E-G08-T02-0001 | SUBMITTED_STRUCTURAL_CHECK_PASS_E2_GOLD_BLOCKED | 存在部分增量 | D | 不满足完整关闭条件 |
| E-G08-T02-0002 | REMEDIATION_CLAIM_RECEIVED_SEMANTIC_RETEST_BLOCKED | 存在部分增量 | D | 不满足完整关闭条件 |
| E-G08-T03-0001 | SUBMITTED_STRUCTURAL_CHECK_PASS_E2_GOLD_BLOCKED | 存在部分增量 | D | 不满足完整关闭条件 |
| E-G08-A-0001 | NO_AUTHOR_FIX_OPEN | 仅来源/访问元数据 | A | 不满足完整关闭条件 |
| E-G08-T02-S01 | BLOCKED_SOURCE | 仅来源/访问元数据 | source-owner | 不满足完整关闭条件 |
| E-G08-T03-S01 | BLOCKED_SOURCE | 仅来源/访问元数据 | source-owner | 不满足完整关闭条件 |
| E-G08-T02-I01 | BLOCKED_INPUT_PROVENANCE_PARTIAL | 存在部分增量 | D | 不满足完整关闭条件 |
| E-G08-T02-R02-0001 | CONFIRMED_P1_OPEN | 存在部分增量 | D | 不满足完整关闭条件 |
| E-G08-R02-ACL-0001 | BLOCKED_INPUT_ACL_UNVERIFIED | 仅来源/访问元数据 | storage-admin | 不满足完整关闭条件 |

## 各票重放、变化、复验与闭环要求

### E-G08-T02-0001

- **r01或新票基线**：P1 OPEN；首要责任 D。
- **原问题与冻结版本**：D T02 32案、51条B候选中13条无直接场景；原INPUT SHA 86d3ac2c…, 原EVAL SHA cf3fe933…。
- **r02获得的新证据/版本和实际核验**：新14案公开INPUT SHA be657d17755c429825aa9c2dfc084895834ef64951da4ac49456b7f38201a571，14/14 manifest及70/70引用文件结构复验通过。13个B候选ID公开列出，但私有对应的rule→case/Gold无法在未核ACL时读取。
- **r02状态**：`SUBMITTED_STRUCTURAL_CHECK_PASS_E2_GOLD_BLOCKED`。**未关闭**。
- **关闭门槛/受影响复验**：D持ACL提供逐B-R规则明确可判定输入/适用-不适用-未知条件及gold预期；E核13条语义、E1已有H02/H04/H08/H11边界；任何新增独立来源须新盲审者。

### E-G08-T02-0002

- **r01或新票基线**：P1 OPEN；首要责任 D。
- **原问题与冻结版本**：旧32/32 Gold evidence_anchors泛化PDF页码；原EVAL cf3fe933…、D21 overlay 8e7c4caa…。
- **r02获得的新证据/版本和实际核验**：作者称私有补丁 ad95f70925c81e70ce9c001b7cf51218a12c0de6e2e3a3709c8e088ad00c69c9 包含32案语义索引及47页作者目视。只能确认实际ZIP哈希，未按ACL开Gold，不等于E语义复核。
- **r02状态**：`REMEDIATION_CLAIM_RECEIVED_SEMANTIC_RETEST_BLOCKED`。**未关闭**。
- **关闭门槛/受影响复验**：授权E按不含公开答案的内部位置核原申请DOCX/PDF、可信底账字段及各状态事实；抽查所有H关键案并保留私库证据链，不向公开PR写精确事实。

### E-G08-T03-0001

- **r01或新票基线**：P1 OPEN；首要责任 D。
- **原问题与冻结版本**：原D 30案 INPUT SHA 68bc0982…、EVAL fabc24f4…；B52候选仅44直接场景。
- **r02获得的新证据/版本和实际核验**：新28案INPUT SHA 56248ec8fc52dfce6d4b94ae53be25b31c9ef27a5f1b35ca81fadb6260e0086f，150文件/28manifest引用结构通过；公开rule_counts 44+8=52且新增8项计数合计28，**仅覆盖表算术**；私有EVAL SHA 56f0ab405ebd12e3e715593741f3a59115f34e338e1f9732b579afe5435c7630 ACL不明。
- **r02状态**：`SUBMITTED_STRUCTURAL_CHECK_PASS_E2_GOLD_BLOCKED`。**未关闭**。
- **关闭门槛/受影响复验**：授权E逐R07/22/29/32/38/42/43/45审真实情形、政策适用、原信件/证据、可信工单及Gold预期；R43山东条件不得外推成理。

### E-G08-A-0001

- **r01或新票基线**：P1 OPEN；首要责任 A。
- **原问题与冻结版本**：A v0.2.1跨域C04学生处分申诉、C05教师人事复核只列S/T类别，缺稳定目的地ID；A原ZIP dbbf9621…。
- **r02获得的新证据/版本和实际核验**：未收到A作者新目录SHA、跨域接收模板稳定ID或明确未实现路由清单。D增量没有改变A正式母集。
- **r02状态**：`NO_AUTHOR_FIX_OPEN`。**未关闭**。
- **关闭门槛/受影响复验**：A负责人提供稳定ID或未实现且只提示转有权机关的状态；E以A完整候选目录复验T03路由及G01边界。

### E-G08-T02-S01

- **r01或新票基线**：BLOCKED_SOURCE OPEN；首要责任 source-owner。
- **原问题与冻结版本**：缺2026成理非校园卡普通失物保管、代理、权属交付现行校本原文。
- **r02获得的新证据/版本和实际核验**：2026-10-15定向官网检索未获取适用本校非卡领回官方条款；T02新案仍按封闭模拟学校规则，D作者明确声明来源阻断。
- **r02状态**：`BLOCKED_SOURCE`。**未关闭**。
- **关闭门槛/受影响复验**：有权部门提供制度原文、时间效力、审批/放物权限与代理路径；由未见C/Gold独立审查者对新增争议强制条款先锁事实，然后E差分再核。

### E-G08-T03-S01

- **r01或新票基线**：BLOCKED_SOURCE OPEN；首要责任 source-owner。
- **原问题与冻结版本**：缺成理校级邮箱可信自动再办、撤回、评价、内部工单接口和权限源。
- **r02获得的新证据/版本和实际核验**：官网仍只证邮箱建议实名；党政办职责载明负责来信处理，但不证明可由系统自动状态变更。T03 D作者明确仍禁用本校自动再办功能。
- **r02状态**：`BLOCKED_SOURCE`。**未关闭**。
- **关闭门槛/受影响复验**：校方党政办/系统负责人提供带时效、角色和接口权限的制度或确认不可用；新增争议条款换未受污染盲审者。

### E-G08-T02-I01

- **r01或新票基线**：BLOCKED_INPUT OPEN；首要责任 D。
- **原问题与冻结版本**：旧D1 Gold冻结时刻无可信外部时间证据；D21公开作者Git SHA 4c04a4ec…不含原Gold。
- **r02获得的新证据/版本和实际核验**：新D作者分支公开README再次明确旧原D1不可变Git SHA=NOT_AVAILABLE、可信绝对时间戳=NOT_AVAILABLE；旧E审计SHA不能冒充作者SHA。
- **r02状态**：`BLOCKED_INPUT_PROVENANCE_PARTIAL`。**未关闭**。
- **关闭门槛/受影响复验**：取得比接触C更早的可信第三方冻结/上传记录与文件哈希关系；否则历史限制永久保留，不以新ZIP洗白。

### E-G08-T02-R02-0001

- **r01或新票基线**：NEW P1 (r02)；首要责任 D。
- **原问题与冻结版本**：T02新交付自身的哈希链争议；r01无此新文件。
- **r02获得的新证据/版本和实际核验**：**实测**私人delta包SHA ad95f70925c81e70ce9c001b7cf51218a12c0de6e2e3a3709c8e088ad00c69c9，作者公开README/整改报告一致；但同一个公开HANDOFF包内 `01_新旧SHA与交付清单.json` 的 `new_private_delta_sha256` 字段写的是 04993294d671ca8c7d1c11af153bc99cfecd64e726426b527c65be5eca69b3c1。两者不相同。
- **r02状态**：`CONFIRMED_P1_OPEN`。**未关闭**。
- **关闭门槛/受影响复验**：作者出具更正版Manifest，不抹旧v1/旧包；明确哪个归档是E受测候选、保存新旧manifest SHA/diff及修订理由；E确认一致后才准入私有语义复验。

### E-G08-R02-ACL-0001

- **r01或新票基线**：NEW BLOCKED_INPUT (r02)；首要责任 storage-admin。
- **原问题与冻结版本**：新私有Gold/语义索引的组织级权限不是r01已验证资产。
- **r02获得的新证据/版本和实际核验**：T02/T03作者在公开交接中都明示ACL_NOT_VERIFIED，Library有文件但不能证明仅E可读、C作者不可读；r02未打开任何新增PRIVATE ZIP内部成员和Gold内容，只有整包bytes/SHA。
- **r02状态**：`BLOCKED_INPUT_ACL_UNVERIFIED`。**未关闭**。
- **关闭门槛/受影响复验**：提供受控存储路径、RBAC/ACL列明D作者/C作者/E评分系统实际权限、访问审计日志与现行有效证据，E独立核后有权读取；若已实际公开泄漏应独立重建Gold并重新验。


## 与r01 RET-001的关系
T02 D21原overlay `8e7c4caa9241612c1adc3ec6e2361469c29c89b3d40385887bccda834680878d` 未动；新作者宣称对两处修补完成自核，但该事实仅为D作者证明，E实际完成的是历史SHA不漂移。RET-001仍为`HASH_ONLY_PASS; SEMANTIC_RETEST_OPEN`，不得被记成关闭。

## 禁止移交为已PASS的事项
本轮没有读取新增私有Gold/可信底账/评分器，也没有校方正式授权、实际Pi/OCR模型准确率。新增档案的出现说明作者提供了候选修复，不代表真值校验、来源适用和历史独立性得到证明。
