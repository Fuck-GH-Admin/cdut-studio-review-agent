# S03 奖助与学生事务｜B 批 T08–T13 质量意见

PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38` 候选；非主分支已合并快照。研究 MD 与 TS 均按实际 fetch 检查。业务情景未执行；政策原文现行性仍需逐项证实。

| ID | 名称 | F/M/R/SRC (MD) | F/M/R (TS) | M min>0 | 规则 dataCheck | 静态结论 |
|---|---|---|---|---:|---:|---|
| S03-T08 | 国家助学贷款申请校内资格与材料核验（研究交接稿） | 32/22/27/17 | 32/22/27 | 0 | 0 | 编号对齐；未验业务 |
| S03-T09 |  | 59/29/37/18 | 59/29/37 | 0 | 0 | 编号对齐；未验业务 |
| S03-T10 | 临时困难补助和应急救助申请审核 | 40/22/27/15 | 0/22/27 | 4 | 0 | 待核缺号 |
| S03-T11 | 学费减免与专项经济资助资格审核 | 53/33/38/23 | 53/33/38 | 0 | 0 | 编号对齐；未验业务 |
| S03-T12 | 应征入伍服兵役学生学费补偿、贷款代偿与退役后学费减免审核 | 46/25/28/16 | 46/25/28 | 0 | 0 | 编号对齐；未验业务 |
| S03-T13 | 新生入学“绿色通道”学费缓缴资格审核 | 32/15/19/14 | 0/15/19 | 2 | 0 | 待核缺号 |

## 分模板具体检查意见

### S03-T08 国家助学贷款申请校内资格与材料核验（研究交接稿）

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T08.md) blob `b4f60b2556dbcd41c5b7a759361d13f2a66d00c5`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T08.ts) blob `4b2ba46d5541a2bbffebff4a2e1b12bb8c261f83`。章节检出 15/15；MD F/M/R/SRC=32/22/27/17；TS F/M/R=32/22/27。
- P1 返修条件：22/22 个材料槽 `minCount=0`，正数 0；作者须证明当前必要、条件必要、学校自持与正式决定后形成的材料不会被错误并列或遗漏。特别需要标识金额、资格、批次等事实的数据权威来源与版本。
- 运行能力证据缺口：manual=13、semantic=14、dataCheck=0。只存 criterion 文字不能证明规则根据学生类型/事项/时段真正求值；逐条结果码、人工办理人与校方授权必须保留。
- MD 出现但 TS 未出现编号：F:无；M:无；R:无（仅引用集合检查）。
- 文档已声明的待确认事实：/ `GAP-01` / **2026 年校园地是否依然未开通？** 2025 本科及研究生资料只是历史状态 / 已检索2026校方公开贷款与资助页面、财务通知；找到生源地路径，未取得2026校园地开放/关闭正式答复。需资助中心当期签收 / `POLICY_UNCONFIRMED`；不得永久拒绝、虚构校园地批准 /。
- 合成场景登记：已有可信事实不得自动正式批准；未具备申请阶段的条件材料须补件但未来批准件不能前置；政策/证据不确定转人工。状态 `NOT_EXECUTED`，不伪造通过数。
- 验收：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; implementation=PARTIAL/UNVERIFIED`。

### S03-T09 

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T09.md) blob `c694623c77f1a51f723bb5dddf653d1dae39f3ba`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T09.ts) blob `23562ba91cea3ec21496c426a300289c232463c8`。章节检出 15/15；MD F/M/R/SRC=59/29/37/18；TS F/M/R=59/29/37。
- P1 返修条件：29/29 个材料槽 `minCount=0`，正数 0；作者须证明当前必要、条件必要、学校自持与正式决定后形成的材料不会被错误并列或遗漏。特别需要标识金额、资格、批次等事实的数据权威来源与版本。
- 运行能力证据缺口：manual=33、semantic=4、dataCheck=0。只存 criterion 文字不能证明规则根据学生类型/事项/时段真正求值；逐条结果码、人工办理人与校方授权必须保留。
- MD 出现但 TS 未出现编号：F:无；M:无；R:无（仅引用集合检查）。
- 文档已声明的待确认事实：/ SRC-005 / CDUT-VERIFIED；2025 地科院公告实质原文 / 某校本批次困难认定、纸表、面试、学院审核公示、报中心审批链；R001/R012/R013/R019–R023 / 不推广到保卫部、研究生助管、2026、他校区；附件未取得 /；/ SRC 连续性 / SRC-001–SRC-018 共 18；无跳号 / 11 项仍未取得实体全文或现行性不明；全国规范全文可核但校本办法仍未核完整 /。
- 合成场景登记：已有可信事实不得自动正式批准；未具备申请阶段的条件材料须补件但未来批准件不能前置；政策/证据不确定转人工。状态 `NOT_EXECUTED`，不伪造通过数。
- 验收：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; implementation=PARTIAL/UNVERIFIED`。

### S03-T10 临时困难补助和应急救助申请审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T10.md) blob `0a6201f904ae38721228074e514f0bb771bf0b47`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T10.ts) blob `11a3b365ce6baaa83cf92bff23d216110e497664`。章节检出 15/15；MD F/M/R/SRC=40/22/27/15；TS F/M/R=0/22/27。
- P1 返修条件：18/22 个材料槽 `minCount=0`，正数 4；作者须证明当前必要、条件必要、学校自持与正式决定后形成的材料不会被错误并列或遗漏。特别需要标识金额、资格、批次等事实的数据权威来源与版本。
- 运行能力证据缺口：manual=12、semantic=15、dataCheck=0。只存 criterion 文字不能证明规则根据学生类型/事项/时段真正求值；逐条结果码、人工办理人与校方授权必须保留。
- MD 出现但 TS 未出现编号：F:F001,F040,F006,F037,F027,F028,F029,F030,F002,F003,F004,F005,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F031,F032,F033,F034,F035,F036,F038,F039；M:无；R:无（仅引用集合检查）。
- 文档已声明的待确认事实：/ GAP-07 / HIGH / R02 总账、审查表与 G50 目录仍未取得，可能造成重叠或错路由 / 在第 4 轮取得三份固定文件，逐项对照 G50 通用事实核验与 S03-T06/T07/T08/T09 等独立授权决定 / 不发明 G50 编号或重编号，不形成假定复用 /；/ F 字段连续编号 / **40/40 定义**，F001～F040 / 真实学校表单字段未取得；字典是 V3 建模候选 /。
- 合成场景登记：已有可信事实不得自动正式批准；未具备申请阶段的条件材料须补件但未来批准件不能前置；政策/证据不确定转人工。状态 `NOT_EXECUTED`，不伪造通过数。
- 验收：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; implementation=PARTIAL/UNVERIFIED`。

### S03-T11 学费减免与专项经济资助资格审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T11.md) blob `7c4174532a80abfb5e88dcf3d7dac98ac06d68f5`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T11.ts) blob `dca62970b78c5982452c89e99180b50c94918b65`。章节检出 15/15；MD F/M/R/SRC=53/33/38/23；TS F/M/R=53/33/38。
- P1 返修条件：33/33 个材料槽 `minCount=0`，正数 0；作者须证明当前必要、条件必要、学校自持与正式决定后形成的材料不会被错误并列或遗漏。特别需要标识金额、资格、批次等事实的数据权威来源与版本。
- 运行能力证据缺口：manual=19、semantic=19、dataCheck=0。只存 criterion 文字不能证明规则根据学生类型/事项/时段真正求值；逐条结果码、人工办理人与校方授权必须保留。
- MD 出现但 TS 未出现编号：F:无；M:无；R:无（仅引用集合检查）。
- 文档已声明的待确认事实：**双层结论：`authoring_status=RESEARCH_HANDOFF_READY`；`handoff_status=RESEARCH_HANDOFF_READY_POLICY_OPEN`；`policy_status=PARTIALLY_VERIFIED / POLICY_UNCONFIRMED`。** ；11. **SRC-021：** 四川省学生资助管理中心 2023 年原公告全文可直读；申请在四川政务服务网、学校核学籍、县级部门会审公示及一卡通发款，有**独立政府财政目的与办理链**。故该历史项目必须视为外部独立资助，不准由 S03-T11 校内普通减免作同一款项的资格/发款决定，更不能套它的 2023 款额或县级。
- 合成场景登记：已有可信事实不得自动正式批准；未具备申请阶段的条件材料须补件但未来批准件不能前置；政策/证据不确定转人工。状态 `NOT_EXECUTED`，不伪造通过数。
- 验收：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; implementation=PARTIAL/UNVERIFIED`。

### S03-T12 应征入伍服兵役学生学费补偿、贷款代偿与退役后学费减免审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T12.md) blob `b582a0e3d906d5efd813966e0bbf3995af698349`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T12.ts) blob `9afacf7dfbf90b0316e8baee9d0e1e0891e5277f`。章节检出 15/15；MD F/M/R/SRC=46/25/28/16；TS F/M/R=46/25/28。
- P1 返修条件：25/25 个材料槽 `minCount=0`，正数 0；作者须证明当前必要、条件必要、学校自持与正式决定后形成的材料不会被错误并列或遗漏。特别需要标识金额、资格、批次等事实的数据权威来源与版本。
- 运行能力证据缺口：manual=11、semantic=17、dataCheck=0。只存 criterion 文字不能证明规则根据学生类型/事项/时段真正求值；逐条结果码、人工办理人与校方授权必须保留。
- MD 出现但 TS 未出现编号：F:无；M:无；R:无（仅引用集合检查）。
- 文档已声明的待确认事实：/ `SRC-003` `CURRENTITY-UNKNOWN` / 官方政策目录确有成理校学〔2024〕8 号及首条开头，旧公告引用其文号 / **正文、审批章次序、最终权责、修订/废止均未核** / `R006/R007/R017/R022/R023/R026` 只支持“待核校本规范”标志，不能作已确定阈值 /；/ `SRC-010` `CROSS-SCHOOL-REFERENCE` / 中国石油大学（华东）2026 年自己的受理公告 / 机构不同，不得移植线上核验、材料数或报送时间到 CDUT / **不为任何 R 提供 CDUT 硬条件**，仅缺口检索线索 /。
- 合成场景登记：已有可信事实不得自动正式批准；未具备申请阶段的条件材料须补件但未来批准件不能前置；政策/证据不确定转人工。状态 `NOT_EXECUTED`，不伪造通过数。
- 验收：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; implementation=PARTIAL/UNVERIFIED`。

### S03-T13 新生入学“绿色通道”学费缓缴资格审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T13.md) blob `5dcf8d4a072d53885bd8c5499049e435df69e6f0`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T13.ts) blob `0a57d114f2dce28cd4bf50971dea2629dc99df1d`。章节检出 15/15；MD F/M/R/SRC=32/15/19/14；TS F/M/R=0/15/19。
- P1 返修条件：13/15 个材料槽 `minCount=0`，正数 2；作者须证明当前必要、条件必要、学校自持与正式决定后形成的材料不会被错误并列或遗漏。特别需要标识金额、资格、批次等事实的数据权威来源与版本。
- 运行能力证据缺口：manual=5、semantic=14、dataCheck=0。只存 criterion 文字不能证明规则根据学生类型/事项/时段真正求值；逐条结果码、人工办理人与校方授权必须保留。
- MD 出现但 TS 未出现编号：F:F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032；M:无；R:无（仅引用集合检查）。
- 文档已声明的待确认事实：- 已实读整合包唯一主稿、S03-T13 独立审阅、进度总账、R02 候选目录、目录审查、研究输出规范，旧主稿 `SRC-011`“未取得总账”已修正；固定 SHA G50 精确 catalog **仍未取得，不能声称条目级去重**。。
- 合成场景登记：已有可信事实不得自动正式批准；未具备申请阶段的条件材料须补件但未来批准件不能前置；政策/证据不确定转人工。状态 `NOT_EXECUTED`，不伪造通过数。
- 验收：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; implementation=PARTIAL/UNVERIFIED`。

范围仅模板核验，不调整任何共享执行或财政业务系统。
