# 审核报告：合成学生组织活动审批样例

- 案卷：glm-final-suite-01-student-activity-approval-v1-1791405393629
- 阶段：submitted（revision 6）

## 审核依据（运行 run-1791405393745-037c）
- 有效规则集哈希：03ea61fcfc795473ec13ed6c094be3ab2f44bf4634d72d66d33ceb54ff1da032
- 【申请资格与活动信息】组织和负责人（section-eligibility-org-eligibility；semantic；模板 student-activity-approval-v1@5）
- 【申请资格与活动信息】时间地点与计划（section-eligibility-activity-info；semantic；模板 student-activity-approval-v1@5）
- 【实施计划与风险保障】计划完整性（section-safety-plan-feasibility；semantic；模板 student-activity-approval-v1@5）
- 【实施计划与风险保障】风险与审批（section-safety-safety-plan；manual；模板 student-activity-approval-v1@5）
- 【预算与经费】预算明细（section-funding-budget-items；semantic；模板 student-activity-approval-v1@5）
- 【预算与经费】额度与来源（section-funding-budget-limit；manual；模板 student-activity-approval-v1@5）
- 【活动结项与成果】实际执行对照（section-closeout-actual-vs-plan；semantic；模板 student-activity-approval-v1@5）
- 【活动结项与成果】缺失材料与补件（section-closeout-supplement；semantic；模板 student-activity-approval-v1@5）

## 检查结果（运行 run-1791405393745-037c）
- section-safety-safety-plan：awaiting-confirmation——需要人工核对：检查材料中是否包含所需安全、场地或校外审批；不代替安全主管人员审批。
- section-funding-budget-limit：awaiting-confirmation——需要人工核对：只按案卷附带且已确认的经费限额核验；没有正式额度时列出金额并交人工决定。
- section-eligibility-org-eligibility：awaiting-confirmation——申报组织与负责人字段已填（合成学生组织/合成负责人），但材料仅为合成测试声明：材料状态注明“样例数据；真实性未核验；不得用于真实审批”，且 rules.md 明确缺少校内当年通知、授权签字等，适用资格以本单位通知为准——无法确认资格，转人工。
- section-eligibility-activity-info：awaiting-confirmation——案卷字段（2026-11-07、合成测试教室、80 人）与申报摘要“计划人数 80，场地为测试教室”一致；但申报摘要明确“安全、场地和事后总结均为虚构测试记录，不代表真实审批”，且材料中未见活动目标/详细方案，真实性未核验，需人工确认。
- section-safety-plan-feasibility：awaiting-supplement——safety.md 仅含一行风险清单（室内场地、80 人、用电演示）和场地审批编号 TEST-VENUE-11（自称无真实审批效力），未见议程、人员分工、设备安排和应急预案内容，无法确认覆盖所申报活动，需补充材料。
- section-closeout-actual-vs-plan：awaiting-supplement——结项材料声明“活动尚未执行；本次用作案卷流程测试，不含签到、总结或真实支出凭证”，无任何总结、签到/参与记录、照片或成果材料可与批准方案（2026-11-07、80 人）对照，无法核验执行情况。
- section-closeout-supplement：awaiting-supplement——结项材料全部缺失，按材料槽形成补件清单：①活动总结；②签到/参与记录（对照批准的 80 人）；③照片或成果材料；④真实支出凭证。材料自述“不含签到、总结或真实支出凭证”。
- section-funding-budget-items：awaiting-confirmation——Pi 审核 Agent 未通过内置审核工具提交可核验结论，需审核员人工复核。

## 事项字段
- 合成事项-申请资格与活动信息：{"applicantName":"合成负责人","startDate":"2026-11-07","endDate":"2026-11-07","location":"合成测试教室","participants":80,"budget":1680,"actualCost":0}
- 合成事项-实施计划与风险保障：{"applicantName":"合成负责人","startDate":"2026-11-07","endDate":"2026-11-07","location":"合成测试教室","participants":80,"budget":1680,"actualCost":0}
- 合成事项-预算与经费：{"applicantName":"合成负责人","startDate":"2026-11-07","endDate":"2026-11-07","location":"合成测试教室","participants":80,"budget":1680,"actualCost":0}
- 合成事项-活动结项与成果：{"applicantName":"合成负责人","startDate":"2026-11-07","endDate":"2026-11-07","location":"合成测试教室","participants":80,"budget":1680,"actualCost":0}