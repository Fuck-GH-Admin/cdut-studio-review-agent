# G04 E v1.0｜独立研究设计审计首轮最终裁定（r01）

**E总状态：BLOCKED_INPUT；存在BLOCKED_SOURCE；不予签署PASS_DESIGN或PASS_WITH_LIMITATIONS。** 这是一份完成E0–E4首轮受限研究审查后的**阻断裁定**，不是宣布8份候选模板业务质量均不合格。E1源事实并非覆盖全部B候选规则、E2未独立复算212条Gold语义，因此无扩大结论。

> E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION

## 固定输入与阶段完成情况
- 日期：2026-10-14；审计者：G04-independent-E-r01；公开仓main冻结 `dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。A/B/C/D使用独立Library ZIP原始字节摘要，详见E0-input-manifest.json；未取得原作者Git commit/blob或可证明的Gold访问控制。
- E0：READY_WITH_DECLARED_GAPS；A 1，B 8，C 7（**T01未找到**），D每T三分包8；首次审计快照/分支已保存。
- E1：**已在打开C/Gold之前冻结**21个官方事实/待定源条款、12个反例假说，H=19、M=2、L=0（这是预登记风险复核事项分母，**不是B全量H义务已覆盖的声明**）。E1事实MD SHA256 `f9d66e46c686f8176a8907b9c1b493bed089474f1d893c82c3822a02dd82b9c9`；独立挑战MD SHA256 `0f61eb4a7986cecfb7279adeefd3d59f088ff51345b31e25f427b151d3a01918`；提交 `8466534655138224480e9f4ba15c40c7adf9eea2`。
- E2：双向交叉检查8份D结构与已有7份C，22条高风险源义务追踪（含E2另发现的2025校本会议法规）；D总计212个输入/Gold唯一案例编号结构对齐，**212个业务答案未全量人工复算**。C T06七条正式来源坏链接为确证P2；T01 C缺失阻断完整评审。8份分报告已保存。
- E3：逐项核查A完整40条候选矩阵，40/40有独立模板、条件配置、邻接路由或排除解释；跨模板9组边界研究，N18驻场长期通行仍存适用风险；无相邻领域固定工作树，因此不能称所有领域交叉去重已完成。
- E4：出具7项未关闭缺陷/依赖及复验入口，其中确认P2两项；由于无新固定修复版本，**修复数0、复验数0、关闭数0**。禁止E修改作者C/Gold代替返工。

## 分模板八维状态
列顺序：sourceValidity / templateFidelity / goldValidity / crossTemplate / provenanceIntegrity；全部模板的technicalTemplateRuntime=NOT_RUN、onlineModelAccuracy=NOT_RUN、administrativeAuthority=NOT_VERIFIED。

| TXX | 来源 | C完整性 | Gold有效性 | 跨模板 | 证据版本 |
|---|---|---|---|---|---|
| G04-T01 | BLOCKED_SOURCE | BLOCKED_INPUT | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T02 | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T03 | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T04 | PARTIAL | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T05 | BLOCKED_SOURCE | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T06 | BLOCKED_SOURCE | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T07 | BLOCKED_SOURCE | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |
| G04-T08 | BLOCKED_SOURCE | PARTIAL | PARTIAL | PARTIAL | BLOCKED_INPUT |

## 复核结论及相互否定的关键边界
- 2023成理校发〔2023〕40号第35条自2024-01-01替代2016试行办法，**不能**引用2016单独构成2026硬性拒件。已检查的T03/T04/T05 C主文注意了此点，A旧来源索引仍需增补废止状态。
- 国家505号“面向社会公众+活动类型+每场预计至少1000人”和成都理工大学2025学术会议组织管理1000人内部分层，不是同一许可；当前T06 C规则总体有分开，但C来源索引CD04-CD10链接损坏需修复。
- T01门禁、T03人员资格、T04项目方案、T05具体作业、T07施工动火许可证在责任、阶段与最终授权上不能互相替代。
- 2022因公访客与2022车证历史程序不可自动成为2026现行本校审批/费用的强制门槛。
- 研究态事实审查不代表已接入学校门禁/安保、消防、公安、年卡和专家审批系统；D4与真实模型准确率均NOT_RUN。

## 缺陷等级与显式阻断
P0 0（本轮已检查范围），P1 0（已检查范围），P2 2（T06七条损坏来源URL、A旧制度状态未回写），另有依赖BLOCKED_INPUT 3、BLOCKED_SOURCE 2。详见E4-issue-ledger.md。若后续全量B高风险/Gold逐案复核发现新的P0/P1，则必须更新本结论，不能将本次0误读为风险不存在。

## 恢复放行的必要动作
1. 收齐T01完整C包与不可变SHA及A/B/C/D作者固定版、可信Gold访问控制，复核E0与独立性。
2. 取得核心现行CDUT办事表单/校规适用期和人工审批职责，更新E1仅受影响事实；未获有权确认的硬性条件只保留POLICY_PENDING，不得加入自动拒件。
3. C作者修复T06七条本校URL并自检；A研究作者补2016废止元数据。
4. 以不含Gold答案的脱敏输入独立复算受影响Gold及T01全套Gold，补充跨TXX长期施工/N18、教学焊接/N26的来源与反例。
5. 按新固定输入和审计轮次执行E4差分复验，在P0/P1和必要依赖关闭后再签署限定范围的设计放行。正式软件运行、在线模型及行政授权继续各自另验。

本报告由独立审计分支提交，未合并main、未改写作者A/B/C/D、未公开隐藏Gold。
