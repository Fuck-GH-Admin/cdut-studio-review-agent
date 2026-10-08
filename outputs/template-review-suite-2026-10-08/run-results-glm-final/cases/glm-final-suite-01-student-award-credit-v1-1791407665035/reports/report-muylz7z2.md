# 审核报告：合成竞赛团队成果认定样例

- 案卷：glm-final-suite-01-student-award-credit-v1-1791407665035
- 阶段：submitted（revision 5）

## 审核依据（运行 run-1791407671059-sv8f）
- 有效规则集哈希：0027a463506bc391f7807a0eaac788a15d51e619929fbee92eff3e40f5e3a581
- 【个人竞赛与荣誉】个人身份与等级（section-individual-award-award-person；semantic；模板 student-award-credit-v1@7）
- 【个人竞赛与荣誉】认定周期（section-individual-award-award-cycle；semantic；模板 student-award-credit-v1@7）
- 【集体奖项与团队成果】团队归属（section-team-award-team-proof；semantic；模板 student-award-credit-v1@7）
- 【集体奖项与团队成果】分项与成员拆分（section-team-award-team-split；semantic；模板 student-award-credit-v1@7）
- 【科研、创新与作品成果】成果归属与状态（section-research-output-output-ownership；semantic；模板 student-award-credit-v1@7）
- 【科研、创新与作品成果】成果去重（section-research-output-output-duplicate；manual；模板 student-award-credit-v1@7）

## 检查结果（运行 run-1791407671059-sv8f）
- section-research-output-output-duplicate：awaiting-confirmation——需要人工核对：按正式规则检查同一成果在竞赛、论文、专利或项目等类别是否重复计算；本模板不自行判定互斥关系。
- section-individual-award-award-person：awaiting-confirmation——证书为扫描图像且系统未附加图片，个人姓名、奖项名称、颁发单位、等级、日期均无法逐字核对；且rules.md明确该通知不提供本校积分映射，台账F6标注“待校内积分规则确认”，确认分值缺失，奖项映射无法判定。
- section-individual-award-award-cycle：awaiting-confirmation——awardDate=2026-08-15 属于2025-2026学年范围内，但该日期未出现在任何可提取文本材料中（仅申报台账与团队名单，均无日期记载）；扫描证书为图像无法核验，日期真实性待确认。
- section-team-award-team-proof：awaiting-confirmation——团队名单（doc-4）明确列出 TEST-STU-03 为第4位成员（现场记录），集体名称与成员角色可核对；但名单自注为纯虚构且不代表主办方核验，未获官方成员证明，个人归属仍需负责人确认。
- section-research-output-output-ownership：awaiting-supplement——subject-3（科研、创新与作品成果）无专属证明材料，仅全案共用台账/团队名单提及同一竞赛团队奖；doc-3 扫描证书明确标注为“分项：个人竞赛与荣誉”专属材料，不得跨分项引用，作者/完成人、成果名称、完成时间与证明载体均无法核验。
- section-team-award-team-split：awaiting-confirmation——Pi 审核 Agent 未通过内置审核工具提交可核验结论，需审核员人工复核。

## 事项字段
- 合成事项-个人竞赛与荣誉：{"achievementName":"合成创业模拟赛事团队奖","achievementType":"competition","awardLevel":"校级选拔赛三等奖（合成）","awardDate":"2026-08-15","personRole":"团队成员（申报列第4位）","declaredPoints":8}
- 合成事项-集体奖项与团队成果：{"achievementName":"合成创业模拟赛事团队奖","achievementType":"competition","awardLevel":"校级选拔赛三等奖（合成）","awardDate":"2026-08-15","personRole":"团队成员（申报列第4位）","declaredPoints":8}
- 合成事项-科研、创新与作品成果：{"achievementName":"合成创业模拟赛事团队奖","achievementType":"competition","awardLevel":"校级选拔赛三等奖（合成）","awardDate":"2026-08-15","personRole":"团队成员（申报列第4位）","declaredPoints":8}