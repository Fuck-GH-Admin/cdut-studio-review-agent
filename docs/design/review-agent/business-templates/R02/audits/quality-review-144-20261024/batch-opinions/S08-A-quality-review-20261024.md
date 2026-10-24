# S08 研究生培养与学位｜A 批 T01–T05 质量意见

候选 PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38` 与补缺 PR #259 `a353b32fedc3ea566140d50dcfbf8af1a231ba8d`。研究文稿与 TS 均已取实际 HEAD 静态检查，非校方批准，也未执行真实案例。

| ID | 事项 | PR | MD F/M/R/SRC | TS F/M/R | M min>0 | dataCheck |
|---|---|---:|---|---|---:|---:|
| S08-T01 | 研究生导师选择、变更和双向确认审核 | #251 | 38/21/28/12 | 38/21/28 | 0 | 0 |
| S08-T02 | 研究生个人培养计划变更和课程安排审核 | #259 | 32/21/27/15 | 32/21/27 | 0 | 0 |
| S08-T03 | 硕博研究生学位论文开题资格和报告审核 | #251 | 44/26/36/12 | 44/26/36 | 0 | 0 |
| S08-T04 | 研究生中期考核与培养进展审核 | #251 | 28/22/31/8 | 28/22/31 | 0 | 0 |
| S08-T05 |  | #251 | 46/31/39/19 | 46/31/39 | 0 | 0 |

## 分模板质量意见

### S08-T01 研究生导师选择、变更和双向确认审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S08-T01.md) blob `5a87b50b8bfaf4fc5c4ce94a62c8d5b54066149d`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T01.ts) blob `f35bb49e853b936918b925497aa8d96cd40660d4`；章节 15/15；文稿字典 38/21/28/12，TS 编号 38/21/28。
- **P1-候选映射待证**：21/21 个材料槽 `minCount:0`，正数 0。硕/博、全/非全、导师/培养单位、论文/课程/学位环节不同条件不得互相套用；研究计划和后置审批材料按事件阶段区别。
- **P1/P2-运行核验未证**：manual=23、semantic=5、dataCheck=0；研究 §08 每条政策 guard / F/M/SRC／结果必须保留权威来源和版本，不能用模型提取取代导师/学院/校学位组织决定。
- 静态编号差：F:无；M:无；R:无；TS 若以独立业务键命名，还须单独核映射，不立刻宣称缺字段。
- 研究自述待核：- [ ] `SRC-003` 2024 学籍办法正文、`SRC-005` 国际表单正文、当期双选方案、学校决定/登记/交接文书、校本学生申诉管理原文、G50 各 workspace 的材料及规则原文尚未逐项读；这些待核项转列 14.1 和交接检查单，不以缺授权或私有文书为由阻止公开研究成果交付。；/ A1 硕士初配、A2 博士/直博初配 / P0/P1 R001/002/004/005/006/026；P2 R007/008/009/011；P4 R018/019；P5 R020/021 / 初选通知、博士独特确认方式、截止日/有权签发依据未取得，PC /。
- 三例已登记、未运行：a 事实满足不自动授位/培养决定；b 仅当前与条件 M 报缺，后置材料不前置；c 学生/导师/政策证据冲突 → 人工。均 `NOT_EXECUTED`。
- 结论：内容 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、定义 `PARTIAL`、真实运行 `UNVERIFIED`。

### S08-T02 研究生个人培养计划变更和课程安排审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/docs/design/review-agent/business-templates/R02/S08-T02.md) blob `c5c56b336d008fe7c11c86b9aa4211859defc48c`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T02.ts) blob `4455497e1188f0700f49441c8573418288902de8`；章节 15/15；文稿字典 32/21/27/15，TS 编号 32/21/27。
- **P1-候选映射待证**：21/21 个材料槽 `minCount:0`，正数 0。硕/博、全/非全、导师/培养单位、论文/课程/学位环节不同条件不得互相套用；研究计划和后置审批材料按事件阶段区别。
- **P1/P2-运行核验未证**：manual=4、semantic=23、dataCheck=0；研究 §08 每条政策 guard / F/M/SRC／结果必须保留权威来源和版本，不能用模型提取取代导师/学院/校学位组织决定。
- 静态编号差：F:无；M:无；R:无；TS 若以独立业务键命名，还须单独核映射，不立刻宣称缺字段。
- 研究自述待核：未自动抽取；当前规定、表单、授权链需进一步独立确证。
- 三例已登记、未运行：a 事实满足不自动授位/培养决定；b 仅当前与条件 M 报缺，后置材料不前置；c 学生/导师/政策证据冲突 → 人工。均 `NOT_EXECUTED`。
- 结论：内容 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、定义 `PARTIAL`、真实运行 `UNVERIFIED`。

### S08-T03 硕博研究生学位论文开题资格和报告审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S08-T03.md) blob `d1f65148f738c3faff80b7a0abef04295e894e66`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T03.ts) blob `b7d6505c5471126072c8c0da0a2019e7650d0896`；章节 15/15；文稿字典 44/26/36/12，TS 编号 44/26/36。
- **P1-候选映射待证**：26/26 个材料槽 `minCount:0`，正数 0。硕/博、全/非全、导师/培养单位、论文/课程/学位环节不同条件不得互相套用；研究计划和后置审批材料按事件阶段区别。
- **P1/P2-运行核验未证**：manual=32、semantic=4、dataCheck=0；研究 §08 每条政策 guard / F/M/SRC／结果必须保留权威来源和版本，不能用模型提取取代导师/学院/校学位组织决定。
- 静态编号差：F:无；M:无；R:无；TS 若以独立业务键命名，还须单独核映射，不立刻宣称缺字段。
- 研究自述待核：- [x] 第四轮重新读取 2021 主办法、2025 工程博士专项、2024 涉密办法与 2026 学位工作通知等官方原文；取得 R02 主目录/范围审查及 G50 固定 SHA 的 50 项目录，修正旧稿“未取得目录”错误；新增 `SRC-011/012` 对 2026 方案的效力限制作实证说明；制作唯一主稿/交接；- [ ] **仅属于将来校方实施的验证**：每学院当期经备案细则与入学级转换规则、表格附件字段/签章、真实学校人员/专家资格与评议结果源、撤回/线上开题/二次复议办理细则、涉密接入许可和实机连接证据。这些待核项**不阻断研究交接**，但阻止无证据的生产自动放行/驳回。。
- 三例已登记、未运行：a 事实满足不自动授位/培养决定；b 仅当前与条件 M 报缺，后置材料不前置；c 学生/导师/政策证据冲突 → 人工。均 `NOT_EXECUTED`。
- 结论：内容 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、定义 `PARTIAL`、真实运行 `UNVERIFIED`。

### S08-T04 研究生中期考核与培养进展审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S08-T04.md) blob `edc3b5d5e44a68527487e24763444e64ebf1c085`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T04.ts) blob `7f846452d094ea8fec38dc0909a5b80af34f45ce`；章节 15/15；文稿字典 28/22/31/8，TS 编号 28/22/31。
- **P1-候选映射待证**：22/22 个材料槽 `minCount:0`，正数 0。硕/博、全/非全、导师/培养单位、论文/课程/学位环节不同条件不得互相套用；研究计划和后置审批材料按事件阶段区别。
- **P1/P2-运行核验未证**：manual=15、semantic=16、dataCheck=0；研究 §08 每条政策 guard / F/M/SRC／结果必须保留权威来源和版本，不能用模型提取取代导师/学院/校学位组织决定。
- 静态编号差：F:无；M:无；R:无；TS 若以独立业务键命名，还须单独核映射，不立刻宣称缺字段。
- 研究自述待核：未自动抽取；当前规定、表单、授权链需进一步独立确证。
- 三例已登记、未运行：a 事实满足不自动授位/培养决定；b 仅当前与条件 M 报缺，后置材料不前置；c 学生/导师/政策证据冲突 → 人工。均 `NOT_EXECUTED`。
- 结论：内容 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、定义 `PARTIAL`、真实运行 `UNVERIFIED`。

### S08-T05 

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S08-T05.md) blob `e531f9c7fbb79473fb05f63da73b5759b5d58513`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T05.ts) blob `b5029e8522f42fd8b6d3b39275c4d5580e3af49d`；章节 15/15；文稿字典 46/31/39/19，TS 编号 46/31/39。
- **P1-候选映射待证**：31/31 个材料槽 `minCount:0`，正数 0。硕/博、全/非全、导师/培养单位、论文/课程/学位环节不同条件不得互相套用；研究计划和后置审批材料按事件阶段区别。
- **P1/P2-运行核验未证**：manual=33、semantic=6、dataCheck=0；研究 §08 每条政策 guard / F/M/SRC／结果必须保留权威来源和版本，不能用模型提取取代导师/学院/校学位组织决定。
- 静态编号差：F:无；M:无；R:无；TS 若以独立业务键命名，还须单独核映射，不立刻宣称缺字段。
- 研究自述待核：7. **GAP-07｜G50 原始资产实物复核**：已读 R02 总账与审查文，对 G06 成果权属及 S08-T01/T03/T04/T06/T07/T08、T06-T01 分开审批目的核对；**仍未取得**指定技术 SHA 的 `catalog.json` 原文，未来集成期对其实际键/对象字段再核。若校本原文证实。
- 三例已登记、未运行：a 事实满足不自动授位/培养决定；b 仅当前与条件 M 报缺，后置材料不前置；c 学生/导师/政策证据冲突 → 人工。均 `NOT_EXECUTED`。
- 结论：内容 `PENDING_DEEP_REVIEW`、政策 `PARTIAL/UNCONFIRMED`、定义 `PARTIAL`、真实运行 `UNVERIFIED`。

未改动生产模板；本批意见仅用于候选作者返修与质量闭环。
