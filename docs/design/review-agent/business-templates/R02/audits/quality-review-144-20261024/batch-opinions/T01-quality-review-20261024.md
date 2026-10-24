# T01 教学运行与考务｜9 份质量审阅意见

PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`，补缺 #255 `1be75125329366aa8bbb03c02a1f5f8b38a747b9`。源 MD 与候选 TS 已逐文件取回并静态比对，非学校现行规则认证，不证明真实 Run 通过。

| ID | 事项 | PR | MD F/M/R/SRC | TS F/M/R | minCount>0 | dataCheck | 状态 |
|---|---|---:|---|---|---:|---:|---|
| T01-T01 | 课程调课、停课、补课与教学时间变更审核 | #255 | 57/32/36/16 | 57/32/36 | 0 | 0 | 编号相符 |
| T01-T02 | 临时代课、教师替换与教学任务人员调整审核 | #255 | 44/22/25/11 | 44/22/25 | 0 | 0 | 编号相符 |
| T01-T03 | 课程新开、停开和开课资格申请审核 | #255 | 47/33/29/11 | 46/33/29 | 0 | 0 | 映射待复核 |
| T01-T04 | 教材选用与课堂教学资料审查 | #255 | 48/30/37/13 | 48/30/37 | 0 | 0 | 编号相符 |
| T01-T05 | 试卷命题、试题保密与考试材料审核 | #255 | 48/28/31/19 | 48/28/31 | 0 | 0 | 编号相符 |
| T01-T06 | 课程考核方式、考核方案调整审核 | #251 | 46/29/33/12 | 46/29/33 | 0 | 0 | 编号相符 |
| T01-T07 | 教师成绩录入延期申请审核 | #251 | 35/20/24/14 | 35/20/24 | 0 | 0 | 编号相符 |
| T01-T08 | 教师发起的课程成绩更正材料审核 | #251 | 40/19/30/12 | 40/19/30 | 0 | 0 | 编号相符 |
| T01-T09 | 实验教学、实习与实践教学安排变更审核 | #251 | 44/27/34/18 | 44/27/34 | 0 | 0 | 编号相符 |

## 逐模板核验意见

### T01-T01 课程调课、停课、补课与教学时间变更审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/docs/design/review-agent/business-templates/R02/T01-T01.md) blob `85cc2bafb43426e405f1065ba9a91d57208104d2`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T01.ts) blob `b1784d92815ddc57dcfef9f7b16f6e10599a0166`；00–14 15/15 节，F/M/R/SRC 57/32/36/16，TS F/M/R 57/32/36。
- **P1 材料条件需作者解释**：32/32 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 22、semantic 14、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：最新校历、考试考务规则与有效授权仍需逐条独立复核。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T02 临时代课、教师替换与教学任务人员调整审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/docs/design/review-agent/business-templates/R02/T01-T02.md) blob `f5aea5d470288fac1bee66efc53a04643f4c0b8f`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T02.ts) blob `3ae87b42aa61ff60a79449a0c0fc6bbd1850c5a0`；00–14 15/15 节，F/M/R/SRC 44/22/25/11，TS F/M/R 44/22/25。
- **P1 材料条件需作者解释**：22/22 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 16、semantic 9、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：最新校历、考试考务规则与有效授权仍需逐条独立复核。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T03 课程新开、停开和开课资格申请审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/docs/design/review-agent/business-templates/R02/T01-T03.md) blob `ea997cf54ca35ce3d8ab7ab743441650875dc3d8`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T03.ts) blob `0fe35fedcea536331139fb11e7758e86a24ea691`；00–14 15/15 节，F/M/R/SRC 47/33/29/11，TS F/M/R 46/33/29。
- **P1 材料条件需作者解释**：33/33 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 15、semantic 14、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:F047；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：2. **申请表与真实批次（高）**：已检索 `aao.cdut.edu.cn` 表格/通知、`cdut.edu.cn` 范围以及申请表精确名称，仍未取得公开的本科“新开课程申请表”样张、方案增删改表单。须向教务处/学院取得当前版本；公选 2026/27-1 通知虽有官网索引全文但原页不能直接打开，下一批次未；4. **本研与特殊课程边界（高）**：校方 2022 文件已明确援引成理校研〔2021〕11号，但其正文未取得；研究生院需明确它与 2018 暂行规定的废改关系，查 2026/27 公选、国际化和普通研究生课程现行开停程序与真实表单；本科生提前修读研究生课的课程审批 owner 不由本模板猜定。I1/I2/。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T04 教材选用与课堂教学资料审查

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/docs/design/review-agent/business-templates/R02/T01-T04.md) blob `8a46fca5ea7b71f8c8adea8a3defb91bd9ec0499`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T04.ts) blob `1997832195ae0af99ef4ceb245a7ebcf65eefb30`；00–14 15/15 节，F/M/R/SRC 48/30/37/13，TS F/M/R 48/30/37。
- **P1 材料条件需作者解释**：30/30 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 20、semantic 17、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：/ `GAP-01` 2024 校本总办法 / `SRC-001/003` 已在成都理工正式通知援引成理校教〔2024〕18号；旧 `SRC-009` 2018 办法只作历史比较 / 完整 PDF、附则、附件、施行及与 2021/2018 的替代关系未取得；商学院目录访问 412；`F045/R002/R02；/ `GAP-02` 2026 秋批次与目录 / `SRC-001/008` 可直接/索引核到 2025-26 两学期流程；`SRC-007` 证实 2026 秋公选课教材同期审 / 2026–2027 秋教材选用专属通知、结果、当期马工程课程－教材映射、出版社 ISBN/版次对照库未取到；`R002/R00。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T05 试卷命题、试题保密与考试材料审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/docs/design/review-agent/business-templates/R02/T01-T05.md) blob `0df36339e155e487e04b46b67d5c0f05ec0c62ee`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1be75125329366aa8bbb03c02a1f5f8b38a747b9/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T05.ts) blob `af8b7b563963bd784c3026f5198f3173b5daa125`；00–14 15/15 节，F/M/R/SRC 48/28/31/19，TS F/M/R 48/28/31。
- **P1 材料条件需作者解释**：28/28 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 31、semantic 0、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：- **authoring_status = RESEARCH_HANDOFF_READY**：15 节、字段/材料/规则、来源账、条件触发、负面场景、版本重审与边界均具备可审阅结构；不因暂未取得内部制度而阻断公开研究交付。。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T06 课程考核方式、考核方案调整审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T01-T06.md) blob `07b0ae218902c2b4df209460990506b434ef8146`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T06.ts) blob `44170da5b6a1c7ce81bb87115d009eba71635e70`；00–14 15/15 节，F/M/R/SRC 46/29/33/12，TS F/M/R 46/29/33。
- **P1 材料条件需作者解释**：29/29 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 30、semantic 3、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：**变更请求**：第二轮仍**不提出 `CATALOG-CHANGE-REQUEST`**，因为未取得证明独立授权目的的新增校本原文；对未知流程仅在本 ID 内留 `POLICY_UNCONFIRMED` 和人工待办。；- [x] R001—R029 的 F001—F044、M001—M028 **全部至少有一条规则引用**；SRC-001—003、005—009 被规则用于适用性或事实依据。**SRC-004 未用于任何现行硬规则**，刻意仅保留在第04节历史索引，因2017课程考核规定当前效力待核；不以“提高来源覆盖率”。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T07 教师成绩录入延期申请审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T01-T07.md) blob `29df6d946b95c83d14eea10dcdc9778edfda49a4`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T07.ts) blob `68bb19255527b15072bfae5873c3b25fcfb0e907`；00–14 15/15 节，F/M/R/SRC 35/20/24/14，TS F/M/R 35/20/24。
- **P1 材料条件需作者解释**：20/20 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 18、semantic 6、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：6. **G50 条目实物（P1）**：R02 总账与范围审计已经取得并审读；仅剩固定 SHA 的 G50 `catalog.json` 条目级 `template_id/name/decisionOwner` 核对。未取得时不自称完成 G50 全部映射；实际集成者应记录精确差异并提变更请求。。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T08 教师发起的课程成绩更正材料审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T01-T08.md) blob `e5783de92dc3096ee3b878d449eebacdbff65469`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T08.ts) blob `fe13120a759b5f5ea50684695417414b9422fef4`；00–14 15/15 节，F/M/R/SRC 40/19/30/12，TS F/M/R 40/19/30。
- **P1 材料条件需作者解释**：19/19 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 21、semantic 9、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：- [ ] 2026 当期办事时限、毕业后改分/代理/批量/撤回程序：未取得现行原文，不能写自动拒绝阈值。；/ GAP-01 本科现行流程 / 2017 第 28 条签审链可核但可能已修订；2024 通知援引 2022 教学规范，**未确认更正表单仍为 2017 版** / 向教务处成绩管理归口核 2026 年《学生成绩补录（更正）登记表》、最新办理指南、授权岗位、纸电版替代关系；索取带生效信息的原件 /。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

### T01-T09 实验教学、实习与实践教学安排变更审核

- [研究文件](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T01-T09.md) blob `8721267a6c1bc616e1b76aa4676256f835136fac`、[定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T01-T09.ts) blob `c9f72f5f63ae6bf17f0eea824ecb8ce817931b93`；00–14 15/15 节，F/M/R/SRC 44/27/34/18，TS F/M/R 44/27/34。
- **P1 材料条件需作者解释**：27/27 个槽 minCount=0，正数 0；开课/调课/排考/监考/成绩与考试异常须分事项、角色与节点配置当前材料、校方原始台账与后续审批件，不得按通用一套材料硬套。
- **P1/P2 实质规则尚无运行证明**：manual 24、semantic 10、dataCheck 0；请回查 §08 判据在 TemplateVersion 中是否仍有准确 guard/数值/成绩批次/正式授权角色。文字描述不是执行通过证据。
- F/M/R ID 静态对照：F:未检出差异；M:未检出差异；R:未检出差异。存在具名业务键时须做显式对照。
- 研究自己标示待核内容：最新校历、考试考务规则与有效授权仍需逐条独立复核。
- 3 个合成案例，全部 NOT_EXECUTED：①校内考试事实可核但非正式教学决定；②当前提交材料缺失、后置审批记录不可前置；③成绩、考试身份或现行制度未知转可信人工。
- 质量 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、候选定义 `PARTIAL`、真实执行 `UNVERIFIED`。

按真实模板 ID 分条提交意见，未修改 Main/IPC、考试系统或任何模板源码。
