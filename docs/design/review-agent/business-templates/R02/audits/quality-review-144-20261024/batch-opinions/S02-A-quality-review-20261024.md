# S02 教学与课程｜T01–T05 候选模板质量核验意见

证据：PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`。只针对各研究 MD 与 TS 的逐文件字典、材料条件和规则表达能力；校方政策仅沿用研究标注、尚未独立确认所有原文；场景未在客户端执行。

| ID／事项 | MD F/M/R/SRC | TS F/M/R | minCount=0／>0 | manual/semantic/dataCheck | 验收 |
|---|---|---|---|---|---|
| S02-T01 缓考及考试时间例外安排申请审核 | 46/30/31/13 | 46/30/31 | 30/0 | 31/0/0 | 结构比对完成，业务待验 |
| S02-T02 免考与特殊考试条件资格审核 | 48/31/54/20 | 48/31/54 | 31/0 | 54/0/0 | 结构比对完成，业务待验 |
| S02-T03 课程免修、免听资格审核 | 24/16/22/16 | 24/16/22 | 16/0 | 18/4/0 | 结构比对完成，业务待验 |
| S02-T04 课程替代及学业修读方案个体调整审核 | 42/23/36/20 | 42/23/36 | 23/0 | 36/0/0 | 结构比对完成，业务待验 |
| S02-T05 校外、跨校及交换学习课程学分认定审核 | 35/18/28/15 | 35/18/28 | 18/0 | 27/1/0 | 结构比对完成，业务待验 |

## 逐项问题与证据

### S02-T01 缓考及考试时间例外安排申请审核

- 证据：[研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T01.md) blob `741ec6fa529044c04ab69d52ca78fdfda715276c`，[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T01.ts) blob `55917b760e086d1f31e7a64947aab10485a77b66`。00–14 节 15/15；F/M/R/SRC=46/30/31/13; TS F/M/R=46/30/31。
- 需复核材料条件：30 个材料槽为 minCount=0，0 个为正数；若研究稿有当前／条件必需义务，TS 没有自行机器表达，必须给逐情形激活表，避免把“学生补件”与“学校权威源断连”混淆（候选定义质量风险，不代表已证明实际误审）。
- 规则执行来源：manual=31、semantic=0，显式 dataCheck=0；具体业务判断未在本轮实际运行，不能只根据文字 requirement 宣称准确执行。
- F/M/R 编号集合静态对齐；这不等于规则语义及政策充分。
- 作者自己标注的待确认项（仅引述，非外部独立确证）：1. **政策核验**：SRC-001 的本科第 26 条再校验；SRC-011 新核研究生公开正文但**没有找到研究生缓考细则**；SRC-012 历史研究生课程管理效力未知；2026—27 学期/2025—26-2 学期通知正文、学院试行附件、宜宾/国际/合作/继续教育具体规则仍待核。切勿将旧稿的“最新学期正文待核”误写为已验证。；2. **R02 原件已取得**：已读 144 候选主目录和从 116 原始方向到 R02 的审计；本 ID 与 S02-T02/T03/T06/T10、T01-T01/T06/T07/T08 及 G50 的业务目的边界见 03 节。旧稿 Q07“R02 两份原件未取得”已消除；**G50 50 套原子规则逐条查重仍未做**，SRC-010 不能充当生产接线证明。
- 合成案例登记：①事实可核但无校方有效决定 → 不自动批准；②当前材料缺失而后置材料未形成 → 仅适用槽生成待办；③政策或证据冲突 → POLICY_UNCONFIRMED/CONFLICT/人工。**三案均 NOT_EXECUTED**。
- 本 ID 结论：`quality=PENDING_DEEP_POLICY_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S02-T02 免考与特殊考试条件资格审核

- 证据：[研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T02.md) blob `f127010f2b92e6bef35fcdcf7ac2fff73e878d49`，[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T02.ts) blob `65b302925e7c83443c55181ebbc297c90d4e1a18`。00–14 节 15/15；F/M/R/SRC=48/31/54/20; TS F/M/R=48/31/54。
- 需复核材料条件：31 个材料槽为 minCount=0，0 个为正数；若研究稿有当前／条件必需义务，TS 没有自行机器表达，必须给逐情形激活表，避免把“学生补件”与“学校权威源断连”混淆（候选定义质量风险，不代表已证明实际误审）。
- 规则执行来源：manual=54、semantic=0，显式 dataCheck=0；具体业务判断未在本轮实际运行，不能只根据文字 requirement 宣称准确执行。
- F/M/R 编号集合静态对齐；这不等于规则语义及政策充分。
- 作者自己标注的待确认项（仅引述，非外部独立确证）：- **本小节为首轮历史检查点**；“13项SRC”与尚未建F/M/R均是当时状态，当前结论以14.4以后及检查单为准。；`CATALOG-CHANGE-REQUEST: OWNER_REVIEW_RECOMMENDED_NOT_SUBMITTED`。**不自行创建第二模板、不改R02 ID、不把三种考试制度的正式决定混为一体。** 第四轮形成此建议时尚未取得R02目录；**本轮已读两册总账且确认S02-T02名称/归属未变**。若将来校本原文证实某情形有不同的独立决定对象，由总账Owner审查是
- 合成案例登记：①事实可核但无校方有效决定 → 不自动批准；②当前材料缺失而后置材料未形成 → 仅适用槽生成待办；③政策或证据冲突 → POLICY_UNCONFIRMED/CONFLICT/人工。**三案均 NOT_EXECUTED**。
- 本 ID 结论：`quality=PENDING_DEEP_POLICY_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S02-T03 课程免修、免听资格审核

- 证据：[研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T03.md) blob `2df8d4d44e779710eba8c5b4b4a06a987bdd9d37`，[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T03.ts) blob `a166a3cd70e0d3ca2f94798f8a67fa5b83bae786`。00–14 节 15/15；F/M/R/SRC=24/16/22/16; TS F/M/R=24/16/22。
- 需复核材料条件：16 个材料槽为 minCount=0，0 个为正数；若研究稿有当前／条件必需义务，TS 没有自行机器表达，必须给逐情形激活表，避免把“学生补件”与“学校权威源断连”混淆（候选定义质量风险，不代表已证明实际误审）。
- 规则执行来源：manual=18、semantic=4，显式 dataCheck=0；具体业务判断未在本轮实际运行，不能只根据文字 requirement 宣称准确执行。
- F/M/R 编号集合静态对齐；这不等于规则语义及政策充分。
- 作者自己标注的待确认项（仅引述，非外部独立确证）：编号连续：SRC-001–SRC-016（16）；F001–F024（24）；M001–M016（16）；R001–R022（22）。每项 R 的行内均有触发、阶段、F/M/SRC 和下一责任角色；每件 M 关联一个以上 R。各条件 M 只在具体分支及正确阶段校验。风险缺口：GAP-01 2019/2021/2022政策当期效力；GAP-02 现行表单原件及受理/签章/备案链；
- 合成案例登记：①事实可核但无校方有效决定 → 不自动批准；②当前材料缺失而后置材料未形成 → 仅适用槽生成待办；③政策或证据冲突 → POLICY_UNCONFIRMED/CONFLICT/人工。**三案均 NOT_EXECUTED**。
- 本 ID 结论：`quality=PENDING_DEEP_POLICY_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S02-T04 课程替代及学业修读方案个体调整审核

- 证据：[研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T04.md) blob `6e4512a5138828ca18f4824ffbe2bb61b5da557f`，[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T04.ts) blob `b48b1402ec1d4a93e8ff176df2f5dfacc0cdad70`。00–14 节 15/15；F/M/R/SRC=42/23/36/20; TS F/M/R=42/23/36。
- 需复核材料条件：23 个材料槽为 minCount=0，0 个为正数；若研究稿有当前／条件必需义务，TS 没有自行机器表达，必须给逐情形激活表，避免把“学生补件”与“学校权威源断连”混淆（候选定义质量风险，不代表已证明实际误审）。
- 规则执行来源：manual=36、semantic=0，显式 dataCheck=0；具体业务判断未在本轮实际运行，不能只根据文字 requirement 宣称准确执行。
- F/M/R 编号集合静态对齐；这不等于规则语义及政策充分。
- 作者自己标注的待确认项（仅引述，非外部独立确证）：- `[ ]` **固定 SHA G50 技术目录／生产接口尚未验**：不可宣称 G50 全部 50 项源代码逐项审完、R 规则已经运行或获校方授权；没有 GitHub PR、CI、客户端改动。；/ 编号 / 尚未公开证实的校本缺口与风险 / 校方业务验收／未来接线时需取得的依据（不阻断本研究稿） /
- 合成案例登记：①事实可核但无校方有效决定 → 不自动批准；②当前材料缺失而后置材料未形成 → 仅适用槽生成待办；③政策或证据冲突 → POLICY_UNCONFIRMED/CONFLICT/人工。**三案均 NOT_EXECUTED**。
- 本 ID 结论：`quality=PENDING_DEEP_POLICY_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S02-T05 校外、跨校及交换学习课程学分认定审核

- 证据：[研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T05.md) blob `229f20f5863a02419219ebbeeabe9f5d08ee6e3a`，[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T05.ts) blob `3f6858d0175e7b15070fbf40bdd2393a18143849`。00–14 节 15/15；F/M/R/SRC=35/18/28/15; TS F/M/R=35/18/28。
- 需复核材料条件：18 个材料槽为 minCount=0，0 个为正数；若研究稿有当前／条件必需义务，TS 没有自行机器表达，必须给逐情形激活表，避免把“学生补件”与“学校权威源断连”混淆（候选定义质量风险，不代表已证明实际误审）。
- 规则执行来源：manual=27、semantic=1，显式 dataCheck=0；具体业务判断未在本轮实际运行，不能只根据文字 requirement 宣称准确执行。
- F/M/R 编号集合静态对齐；这不等于规则语义及政策充分。
- 作者自己标注的待确认项（仅引述，非外部独立确证）：/ SRC 来源账 / SRC-001–SRC-015，四类标签严格区分；校本 2019 本科、2022 来华学生两份 PDF 与教育部规则正文能按条定位；2024、2025 会议纪要仅作存在性旁证 / 新规/年度版本仍未取得完整原文，不能声称已验证现行；网页 412 的详情不得升格为已核正文 /；/ G50/R02 邻接去重 / R02 总账/审计原件本轮已读，S02-T03/T04/T06/T10、T01-T08、S08-T09 精确分工；G05 出行及 S01 学籍只读既有决定 / G05 六项独立业务批准文书及真实系统尚未取得 /
- 合成案例登记：①事实可核但无校方有效决定 → 不自动批准；②当前材料缺失而后置材料未形成 → 仅适用槽生成待办；③政策或证据冲突 → POLICY_UNCONFIRMED/CONFLICT/人工。**三案均 NOT_EXECUTED**。
- 本 ID 结论：`quality=PENDING_DEEP_POLICY_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

**提交性质**：以上问题提交作者及集成负责人复核，不更改模板源码；并未完成逐 R 官方条文核验或真实端到端执行，不可作为最终 PASS。
