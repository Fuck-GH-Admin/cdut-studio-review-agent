# T02 人事、聘任与教师发展｜A 批 T01–T09 质量意见

PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38` 与补缺 PR #258 `8c214ceabe807f0e9507e83d7f89337ed3a2f880`，均为当前未合并候选快照。T02-T08 尚未发现对应候选文件；该项属于当前交付覆盖缺口。

| ID | 事项 | PR | MD F/M/R/SRC | TS F/M/R | M 正数槽 | dataCheck | 状态 |
|---|---|---:|---|---|---:|---:|---|
| T02-T01 | 新教职工入职资格和入职材料审核 | #258 | 49/30/32/20 | 49/30/32 | 0 | 0 | 静态编号对齐 |
| T02-T02 | 教职工试用期考核、转正申请审核 | #258 | 41/21/30/16 | 41/21/30 | 0 | 0 | 静态编号对齐 |
| T02-T03 | 教职工岗位聘任、等级晋升及岗位调整审核 | #258 | 43/26/32/24 | 43/26/32 | 0 | 0 | 静态编号对齐 |
| T02-T04 | 专业技术职称评审与申报材料审核 | #258 | 41/29/36/22 | 41/29/36 | 0 | 0 | 静态编号对齐 |
| T02-T05 | 教职工年度考核与师德考核关联事实审核 | #251 | 44/22/24/16 | 44/22/24 | 0 | 0 | 静态编号对齐 |
| T02-T06 | 聘期考核与续聘资格审核 | #251 | 43/25/29/20 | 43/25/29 | 0 | 0 | 静态编号对齐 |
| T02-T07 | 个人教学、科研与社会服务业绩认定审核 | #251 | 38/28/32/14 | 38/28/32 | 0 | 0 | 静态编号对齐 |
| T02-T08 | 教职工校内调动与单位岗位流转审核 | 未发现 | — | — | — | — | **MISSING_IN_CANDIDATES** |
| T02-T09 | 在职学历学位进修资格申请审核 | #251 | 48/26/27/20 | 48/26/27 | 0 | 0 | 静态编号对齐 |

## 各项审核意见

### T02-T01 新教职工入职资格和入职材料审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/docs/design/review-agent/business-templates/R02/T02-T01.md) blob `c75af71307058b8ff86a07cdfd3ff5486d9dd301`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T01.ts) blob `11bdb560984772cf3db46dcd3fc69d6069aebd33`。章节 15/15，F/M/R/SRC 49/30/32/20，运行 F/M/R 49/30/32。
- **P1/待作者证明条件激活**：30/30 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 32、semantic 0、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：- [ ] 所有原始校本附件、岗位表及后续公告链的学校权威确证；原站 412/内网缺口不能伪称完成。；2. **岗位附件、补充公告链和授权（高）**：SRC-002/004/006/016 岗位表未完整下载，SRC-014 已证实首批时间变更、SRC-015 第二批仍有附件缺口；学校要确认当批实际截止、候补、公示、用章与备案职责。不能把历史 2026 日期作今后批次参数。。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T02 教职工试用期考核、转正申请审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/docs/design/review-agent/business-templates/R02/T02-T02.md) blob `16dfb7f5a850c40ad5364bc3be015b81eea70560`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T02.ts) blob `223775b94574ee374f51b919955cc7fcbb390bf8`。章节 15/15，F/M/R/SRC 41/21/30/16，运行 F/M/R 41/21/30。
- **P1/待作者证明条件激活**：21/21 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 30、semantic 0、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：/ 缺口 / 风险 / 第四轮实证更新 / 下一步校方核定项目（**非本次研究阻断**） /；/ GAP-05 G50 和邻接 T02/T06/T08 重叠 / **中等，部分解决**。R02 总目录、审计已读，02.3 精确列正式邻项；冻结 G50 catalog.json 原文未取得，源系统 decisionRef 仍未验证。 / 目录 owner 核 G50 技术 ID 和实际复用接口，不双审批 T02-。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T03 教职工岗位聘任、等级晋升及岗位调整审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/docs/design/review-agent/business-templates/R02/T02-T03.md) blob `b6e75bdd95326efe1473a59b91caa3078060d0e3`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T03.ts) blob `7524a5091a6b232123dac615e9e47eefd03bd8a4`。章节 15/15，F/M/R/SRC 43/26/32/24，运行 F/M/R 43/26/32。
- **P1/待作者证明条件激活**：26/26 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 32、semantic 0、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：/ 入口/身份/岗位 / `R001—R007`，ST-00—02 / `M001—M004 M018 M019 M022`；制度现行性、批次发起权尚待核，但独立身份事实可预核 /；6. `GAP-06`：上位法`SRC-021`已核（仅其第11条具体事项及附属程序适用），**普通岗位竞聘公示异议是否属于法定申诉**仍须有权机关判断；本批具体公示、撤回/重提、救济机关、权威变更与档案周期待核。。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T04 专业技术职称评审与申报材料审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/docs/design/review-agent/business-templates/R02/T02-T04.md) blob `a2c6a53a92dbd630f34e6046a1e7d80c26fa8b84`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8c214ceabe807f0e9507e83d7f89337ed3a2f880/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T04.ts) blob `894e6caf19635d661c03288dce5ead936c5b579e`。章节 15/15，F/M/R/SRC 41/29/36/22，运行 F/M/R 41/29/36。
- **P1/待作者证明条件激活**：29/29 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 36、semantic 0、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：/ 规则及输出 / R001–R036 逐行具阶段、T/F/U、SRC/F/M、来源层、异常及有权角色；八种代码互斥，Check/待办可追溯；后产材料不提前索取 / 校本政策/签发证据缺口导致不能生产自动执行；集成时需另行审查映射，不冒充已跑真实Run /；1. **旧稿误报目录未取得**：已实收并读取两份 R02 规范，改写 00、02、04.3、05 GAP-07、12、14；目录级引用可确认，运行时代码尚未碰撞测试。。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T05 教职工年度考核与师德考核关联事实审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T05.md) blob `e1797c1ba5110a1051f511f319d7fdc55cce4d6f`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T05.ts) blob `e2a5711be7d4e5def2242c437712eafed97fdf83`。章节 15/15，F/M/R/SRC 44/22/24/16，运行 F/M/R 44/22/24。
- **P1/待作者证明条件激活**：22/22 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 21、semantic 3、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：/ M001 / A–I，P0 政策组织 / R001/R004；校方归口政策库 / 当期原文未取得只能 PC；不得由本人造通知 /；- [x] **R02 总账已真实读取**：包含冻结的 144 项目录、T02 邻项与去重审查正文；纠正旧稿“R02 未取得”的过时结论。。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T06 聘期考核与续聘资格审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T06.md) blob `30ddef3e5e033455df737207028326ca48a1ccca`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T06.ts) blob `77a49f2370a6cb025fd7d84a7e91b7ca67966b7b`。章节 15/15，F/M/R/SRC 43/25/29/20，运行 F/M/R 43/25/29。
- **P1/待作者证明条件激活**：25/25 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 24、semantic 5、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：- [ ] 第四轮仍需取得现行校本政策、当期表单、各类人员/岗位适用细则、真实签发与申诉管辖权限、G50/R02 正文，以及授权样本/业务演练确认。政策缺口不能用技术通过率替代。；**剩余证据请求及处理人：** (1) 人事处：新版《岗位设置与聘用管理办法》含文号、生效/废止/过渡条款，2026 通知、表单、批次范围、岗位与合同期限分立；(2) 学院获授权考核工作组：分类指标、任务书版本、不同岗位及双肩挑折算；(3) 人事/人才部门：2025 珠峰 31 号、2022 版过渡与每名当事人的有效协。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T07 个人教学、科研与社会服务业绩认定审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T07.md) blob `0330690dbc96521f1c6fef4975633deb12f00337`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T07.ts) blob `b864467da312f4020ec591102aef5ffac8bd9e4d`。章节 15/15，F/M/R/SRC 38/28/32/14，运行 F/M/R 38/28/32。
- **P1/待作者证明条件激活**：28/28 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 23、semantic 9、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：原稿 §14 未自动抓出；需核校方政策现行性/工作职责。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### T02-T08 教职工校内调动与单位岗位流转审核

- **P1 当前候选覆盖缺口**：在 PR #251 和 252–262 文件集均未发现候选 MD+TS；未证明研究稿历史缺失。需要模板 Owner 提供本 ID 的主研究 MD、F/M/R/SRC、TS 定义、PR/提交及有效 SHA 后，才可以进入逐条质量核验；本报告没有伪称不存在历史研究成果。
- 状态：`research_current_candidate=MISSING; runtime=MISSING; quality=UNVERIFIED; policy=UNCONFIRMED`。

### T02-T09 在职学历学位进修资格申请审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T02-T09.md) blob `7a28bf0021305835fd444fca5a7da22a562f5d65`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T02-T09.ts) blob `5b22bf526af19f928048e26d78d2e8a941363dd7`。章节 15/15，F/M/R/SRC 48/26/27/20，运行 F/M/R 48/26/27。
- **P1/待作者证明条件激活**：26/26 个材料 minCount=0、正数 0。教师聘任、岗位流转、晋升、考核等对象要求按任职身份/事业编制/合同类型/阶段/单位区分，不能将单条通用必要件套到其他制度或把后来签署决定当申请件。
- **P1/P2 判断与原稿绑定风险**：manual 17、semantic 10、dataCheck 0；资格资历、岗位和人事数据须根据权威记录与已确认有效期核对，不能把模拟模型事实审查升级为人事聘用决定。
- 字典差异：F:无；M:无；R:无；若使用具名业务键需另写 ID 映射。
- 自述待证事项：/ GAP-01 / **本部是否有现行直接制度、表单和独立审批？** 何时生效、是否废止旧制度？ / 第 4 轮官网公开检索仍未取得；**下一步需本部人事处提供**校发文号、完整原文与历史有效版本，核对 OA 服务目录、表单及签发日期，逐格映射 F/M / 无此依据不能创建资格硬门槛或称独立服务已上线 /；- [x] 12 将校本规则/期限/权限/成果/资金设为待核配置，逐项说明哪类 SRC 不得跨用。。
- 三合成用例（NOT_EXECUTED）：事实可核不等于聘任批准；缺当前材料但不索后置审批；政策或工资/岗位来源冲突转有权人事管理。
- `quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

审计意见仅发给模板作者/批次负责人，没有更改共享业务或生产模板。
