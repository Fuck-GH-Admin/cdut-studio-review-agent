# 审核报告：合成本专科生国家奖学金样例

- 案卷：glm-final-suite-01-scholarship-v2-1791406002604
- 阶段：submitted（revision 7）

## 审核依据（运行 run-1791406008430-mn0f）
- 有效规则集哈希：cec8233f85111d9bb286c7c48d9e3ed3356e0b3cac40ca783342ce17a0702734
- 【基本资格与申报条件】逐条核对当年通知（section-eligibility-notice-conditions；semantic；模板 scholarship-v2@7）
- 【基本资格与申报条件】资格冲突与重复申报（section-eligibility-eligibility-conflict；semantic；模板 scholarship-v2@7）
- 【学业成绩与排名】成绩材料一致性（section-academic-record-record-match；semantic；模板 scholarship-v2@7）
- 【学业成绩与排名】门槛与排序规则（section-academic-record-ranking-rule；manual；模板 scholarship-v2@7）
- 【荣誉、竞赛与综合表现】成果事实与归属（section-achievements-achievement-support；semantic；模板 scholarship-v2@7）
- 【荣誉、竞赛与综合表现】成果复用与重复计入（section-achievements-achievement-duplicate；semantic；模板 scholarship-v2@7）
- 【困难资助资格（按需）】申请资格材料（section-supporting-needs-need-documents；semantic；模板 scholarship-v2@7）
- 【困难资助资格（按需）】敏感材料人工确认（section-supporting-needs-privacy-review；manual；模板 scholarship-v2@7）
- 【推荐意见与集体复核】推荐和意见完整性（section-recommendation-recommendation-completeness；semantic；模板 scholarship-v2@7）
- 【推荐意见与集体复核】公示/名额定稿（section-recommendation-final-list；manual；模板 scholarship-v2@7）

## 检查结果（运行 run-1791406008430-mn0f）
- section-academic-record-ranking-rule：awaiting-confirmation——需要人工核对：仅按本年度已确认的正式规则检查成绩门槛和排序；未提供阈值或名额时只整理数据并交人工决定。
- section-supporting-needs-privacy-review：awaiting-confirmation——需要人工核对：对敏感信息、认定口径和资格结论只提示证据位置并转授权人员确认，不自动形成最终资格结论。
- section-recommendation-final-list：awaiting-confirmation——需要人工核对：核对最终名单、名额和排序是否与经授权的决议一致；最终批准由教师/主管部门完成。
- section-eligibility-notice-conditions：awaiting-confirmation——案卷内无本年度国家奖学金正式通知/校内当年实施方案（rules.md 明确各校仍须有当年实施方案，一般项目须另附本年度正式通知）；学籍、年级、申报类型、限制条件与截止时间缺少可逐条核对的权威依据，学籍/年级核验尚需学校学籍系统确认。标记待人工确认。
- section-eligibility-eligibility-conflict：awaiting-confirmation——申报材料未披露已获奖项目或重复申报记录；按规则在无权威信息时不作否定推断，但在读状态与重复申报情况尚无权威核验来源，转人工确认。
- section-academic-record-record-match：awaiting-confirmation——scholarship-transcript.xlsx 自身声明『本表不是成绩单』，且为合成测试值；虽申报摘要中的成绩排名 8/120、综合考评 18/120、绩点 3.72 与该表数值一致，但缺少正式成绩单，学生身份、统计周期、课程/绩点/排名无法与权威成绩单核对，转人工确认。
- section-achievements-achievement-support：awaiting-confirmation——竞赛证明为扫描图像（doc-4-muykvuj5-v1-page-001-image），当前配置模型无法接收图像，获得者、级别、日期、颁发方及是否落在本次认定周期（2025-2026）均无法从可提取文本核验，须由人工核对图像内容后确认。
- section-achievements-achievement-duplicate：awaiting-confirmation——案卷仅见一份合成竞赛证明，未发现同一成果被重复用作不同加分项的文本证据；但允许复用范围需由本单位规则确定，而案卷缺少校内当年规则，且证明内容为图像无法核验，转人工确认。
- section-supporting-needs-need-documents：awaiting-confirmation——分项专属材料声明『国家奖学金申请，不涉及家庭经济困难认定』，与案卷字段 familyStatus=不适用 一致；但案卷缺少当年正式通知，无法核对该分项适用条件与要求的资格材料清单，是否完全适用及材料齐全性转人工确认。
- section-recommendation-recommendation-completeness：non-compliant——推荐意见与回避声明文本存在且对应本次合成测试批次，但材料自述回避声明为『模拟记录，未经真实签字/授权』，校级名额和公示记录未提供，评审意见及必要签章缺失，不满足签章与对应本次批次的完整性要求。

## 事项字段
- 合成事项-基本资格与申报条件：{"major":"合成专业","grade":"大三","awardName":"本专科生国家奖学金","gpa":3.72,"rank":8,"familyStatus":"不适用：本案申请国家奖学金","declaredCategory":"国家奖学金"}
- 合成事项-学业成绩与排名：{"major":"合成专业","grade":"大三","awardName":"本专科生国家奖学金","gpa":3.72,"rank":8,"familyStatus":"不适用：本案申请国家奖学金","declaredCategory":"国家奖学金"}
- 合成事项-荣誉、竞赛与综合表现：{"major":"合成专业","grade":"大三","awardName":"本专科生国家奖学金","gpa":3.72,"rank":8,"familyStatus":"不适用：本案申请国家奖学金","declaredCategory":"国家奖学金"}
- 合成事项-困难资助资格（按需）：{"major":"合成专业","grade":"大三","awardName":"本专科生国家奖学金","gpa":3.72,"rank":8,"familyStatus":"不适用：本案申请国家奖学金","declaredCategory":"国家奖学金"}
- 合成事项-推荐意见与集体复核：{"major":"合成专业","grade":"大三","awardName":"本专科生国家奖学金","gpa":3.72,"rank":8,"familyStatus":"不适用：本案申请国家奖学金","declaredCategory":"国家奖学金"}