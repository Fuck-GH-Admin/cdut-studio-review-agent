# T02 人事、聘任与教师发展｜B 批 T10–T17 质量意见

来源 PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`。已取得每份研究 MD 和候选 TS 进行编号与执行声明对照；政策正文核准及真实业务测试未完成。

| ID | 名称 | 研究 F/M/R/SRC | 运行 F/M/R | minCount>0 | dataCheck | 状态 |
|---|---|---|---|---:|---:|---|
| T02-T10 | 访学、研修、培训的人事安排与资格审核 | 42/27/37/16 | 0/27/37 | 0 | 0 | 编号待核，未业务验收 |
| T02-T11 | 教职工事假、病假等劳动人事请销假审核 | 40/15/23/9 | 40/15/23 | 0 | 0 | 编号对齐，未业务验收 |
| T02-T12 | 离职、辞职、解聘与离岗手续审核 | 49/30/32/21 | 0/30/32 | 0 | 0 | 编号待核，未业务验收 |
| T02-T13 | 退休、延期退休及返聘资格审核 | 48/38/43/19 | 48/38/43 | 0 | 0 | 编号对齐，未业务验收 |
| T02-T14 | 人才计划、教学名师及专家荣誉称号申报推荐审核 | 50/34/48/12 | 50/34/48 | 0 | 0 | 编号对齐，未业务验收 |
| T02-T15 | 高等学校教师资格认定校内材料与资格审核 | 44/27/29/10 | 44/27/29 | 0 | 0 | 编号对齐，未业务验收 |
| T02-T16 | 学生工作、辅导员、班主任等专责教师岗位任职审核 | 41/29/28/16 | 41/29/28 | 0 | 0 | 编号对齐，未业务验收 |
| T02-T17 | 教职工因私出国（境）意见签署与校内材料审核 | 35/23/25/14 | 35/23/25 | 0 | 0 | 编号对齐，未业务验收 |

## 分 ID 实质待核项目

### T02-T10 访学、研修、培训的人事安排与资格审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T10.md) blob `5d3ac067d6ae396a3ec2f6558957da868889263e`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T10.ts) blob `921a9e53f9be2d398026657704cae7391b32600a`，00–14 章节 15/15，文稿编号 F/M/R/SRC 42/27/37/16，候选 F/M/R 0/27/37。
- **P1 模板定义材料约束待校验**：27/27 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 29、semantic 8、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:F041,F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032,F033,F034,F035,F036,F037,F038,F039,F040,F042；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：/ A1 2025 岗培报名 / R001–R009、R017、R035、R037；**申请特殊线上方式才触发 R036** / 校方 2025 通知已核拟聘/师资博士后、学历及未参训范围；线上证明合法替代和附件格式仍待核，2026 新年度须重取通知 /；/ X2 学生/公派任教/报销分流 / R001/R008；明确非本事项时后续 R→NA / 已按 R02 总账定位 S08-T09、T02-T09/T15/T17、T06-T04、T08-T06、G05；G50 历史源码与实际系统接线仍待核 /。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T11 教职工事假、病假等劳动人事请销假审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T11.md) blob `e7afbe4e2941846e26cac052d7c4e835823cfd36`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T11.ts) blob `facfede5b64da308cf3dc3f6b520b118f6362203`，00–14 章节 15/15，文稿编号 F/M/R/SRC 40/15/23/9，候选 F/M/R 40/15/23。
- **P1 模板定义材料约束待校验**：15/15 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 23、semantic 0、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:无；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：`CATALOG-CHANGE-REQUEST: NOT_PROPOSED_ROUND3`。目前不足以证明该事项必须拆成两个或更多独立业务目的；不同假别、身份、阶段、补办及复核先保留为同一模板情形矩阵。G50 与 R02 总账原件未取得，不能宣称精确去重已完成。；- [x] 03 为 A–H 办理动作、I 身份覆盖、J 未确认其他假别列出触发、阶段、角色、相对截止节点、撤回和复核未知点。。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T12 离职、辞职、解聘与离岗手续审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T12.md) blob `f2d12ccea34c93a32d1a31dbb5ec2dce54d46767`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T12.ts) blob `bdac121ca0e12e557d4d9038bd2a3c3fce19b90a`，00–14 章节 15/15，文稿编号 F/M/R/SRC 49/30/32/21，候选 F/M/R 0/30/32。
- **P1 模板定义材料约束待校验**：30/30 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 30、semantic 2、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:F014,F013,F018,F001,F049,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F015,F016,F017,F019,F020,F021,F022,F023,F024,F025,F034,F026,F027,F028,F029,F030,F031,F032,F033,F035,F036,F037,F038,F039,F040,F041,F042,F043,F044,F045,F046,F047,F048；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：**关键证据缺口（沿用 ROUND1 六项并按 ROUND2 细化，后续轮按风险优先级核查）：**；**G50/S/T 去重证据边界。** 本轮实际读取 R02 目录、审计及 144 项台账，已锁定 T02-T12 与 T02-T05/T06/T08/T13、T08-T04、T06-T04、T01-T02、G05 `g05-t04` 等跨项**不同唯一决定对象**。G50 原始 `catalog.json` 未在 Z。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T13 退休、延期退休及返聘资格审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T13.md) blob `83af301d048cb662a9a97af4e2b6360c5b0c95ba`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T13.ts) blob `0bab6e44e48d06e2571c0c0b65661fe3c7551416`，00–14 章节 15/15，文稿编号 F/M/R/SRC 48/38/43/19，候选 F/M/R 48/38/43。
- **P1 模板定义材料约束待校验**：38/38 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 43、semantic 0、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:无；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：- [x] R02 原始总账/范围审查、G50 固定 SHA 冻结目录已读；纠正第三轮“未取得目录”的陈述并形成逐项去重映射；1. **D01｜最高：2018 与 2025 政策衔接。** 向人事处取得 2025–2026 现行退休/特殊高级专家延退办事制度，确认 2018 35号是否仍生效、各身份何时用弹性退休或专家延退、旧年龄/时限条款如何调整；未确认前相应资格阈值全数 `POLICY_UNCONFIRMED`。关联 SRC-001/00。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T14 人才计划、教学名师及专家荣誉称号申报推荐审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T14.md) blob `5e30255b4412ff20acbeea78746fda9bfa75a2f8`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T14.ts) blob `dd6616ad5411c071ba3601867570a93b013daeb9`，00–14 章节 0/15，文稿编号 F/M/R/SRC 50/34/48/12，候选 F/M/R 50/34/48。
- **P1 模板定义材料约束待校验**：34/34 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 47、semantic 1、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:无；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：政策现行性及授权依旧需要外部核实。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T15 高等学校教师资格认定校内材料与资格审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T15.md) blob `fc04ed0325c1f3abdd8ed3ecf6a48783ff75bdb9`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T15.ts) blob `63d40a3c8012ec9dfdf46b603a63ffa44c7c7e13`，00–14 章节 15/15，文稿编号 F/M/R/SRC 44/27/29/10，候选 F/M/R 44/27/29。
- **P1 模板定义材料约束待校验**：27/27 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 29、semantic 0、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:无；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：政策现行性及授权依旧需要外部核实。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T16 学生工作、辅导员、班主任等专责教师岗位任职审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T16.md) blob `7a0bdf766d3e959a1c995996d20afd16a901451d`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T16.ts) blob `9df1b159bafabe519e4755dea20a950e188f2e42`，00–14 章节 15/15，文稿编号 F/M/R/SRC 41/29/28/16，候选 F/M/R 41/29/28。
- **P1 模板定义材料约束待校验**：29/29 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 28、semantic 0、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:无；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：- [x] 来源 `SRC-001` 起连续编号，明确正式原文与历史/未取得文件之别。；- [x] 第 4 轮已复核可得官方原文/检索局部、执行编号依赖检查、模拟高风险反例并完成交付；**未取得的校本原文/岗位表不可勾成已证实，更不允许上线自动高影响决定**。。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T17 教职工因私出国（境）意见签署与校内材料审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T17.md) blob `eee98be8b77e3bb8135a876bee14fbe3867210b5`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T17.ts) blob `72b8b625e2b07cd43833ef27edd3440ac73c0073`，00–14 章节 15/15，文稿编号 F/M/R/SRC 35/23/25/14，候选 F/M/R 35/23/25。
- **P1 模板定义材料约束待校验**：23/23 材料 minCount=0、正数 0；人事岗位/聘期/用工/资历/待遇记录跨不同人群须具体区分证据来源、授权范围及条件触发。须交各情形最小当前证据集，不得把未来人事决定倒填初次申请。
- **P1/P2 R规则完整性**：manual 25、semantic 0、dataCheck 0；需要确定性事实规则映射或显式人工待办，并保护政策未知与用工合同版本冲突，不得以自然语言 criterion 冒充可重复运行判据。
- 编号静态缺口：F:无；M:无；R:无；纯 ID 对齐不意味着正文规则与 TS 意义一致。
- 作者自述未完成：/ M019 `P6 L/C` / R024 / 校本后续义务、返校/销假/保管均待核 /；/ R009–R012 `P2` / 干部、专业、请假联办、专项事由；F002/004/006/008/012/015–017/021/022/033/034，M001–003/005–007/009/023，SRC-001–003/005–007/011/013 / 干部办法正文、具体保密流程、请假强制性、私事补证的。
- 三条合成场景仅设计未执行：资格事实成立但学校决定不存在；当前材料缺失且不要求签批后凭证；合同/身份/政策存在矛盾交人事归口人工。
- 本 ID 仅阶段性核验：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

本批只做模板审计，不改共享 Main/IPC 与人事系统业务；向独立审计 PR #263 提交书面意见。
