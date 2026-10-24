# S03 奖助与学生事务｜第 A 批 T01–T07 质量核验意见

**快照** PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`；基线 `150acfe761cb7ad0424a2ca009fd57f12dbfddfd`。逐文件实际取样 MD+TS 的字段、材料、规则、来源与文稿缺口，不代表全量校方原文复验或真实 Run 测试。

| ID | 正式事项 | MD F/M/R/SRC | TS F/M/R | minCount>0 / dataCheck | 结论 |
|---|---|---|---|---|---|
| S03-T01 | 综合素质测评及分项加扣分材料审核 | 32/18/23/11 | 32/18/23 | 0/0 | 编号静态一致；待实审 |
| S03-T02 | 国家奖学金（含研究生对应情形）申报审核 | 28/19/25/12 | 28/19/25 | 0/0 | 编号静态一致；待实审 |
| S03-T03 | 国家励志奖学金申报审核 | 44/24/36/16 | 44/24/36 | 0/0 | 编号静态一致；待实审 |
| S03-T04 | 校院及专项奖学金（含研究生学业奖学金）评审 | 51/34/34/23 | 51/34/34 | 0/0 | 编号静态一致；待实审 |
| S03-T05 | 学生先进个人、荣誉称号及评优资格审核 | 42/28/38/13 | 42/28/38 | 0/0 | 编号静态一致；待实审 |
| S03-T06 |  | 40/25/26/17 | 40/25/26 | 0/0 | 编号静态一致；待实审 |
| S03-T07 | 国家助学金和基于困难身份的助学资助审核 | 51/31/40/23 | 51/31/40 | 0/0 | 编号静态一致；待实审 |

## 模板作者待处理与证据

### S03-T01 综合素质测评及分项加扣分材料审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T01.md) blob `606b69a0b4d4a8fbb1044acb3b0c106507ddfb6b`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T01.ts) blob `349feb98c84db73cfdfb2fbb665c1d2dccbb67a7`。15 个二级节实际检出 15；字典 MD 32/18/23/11、TS 32/18/23。
- **条件性材料映射 P1-待作者举证**：TS 中 18/18 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 23、semantic 0、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：/ GAP-07 年度、学院及研究生规则延续效力 / 高：旧奖学金表误作现行全校规则 / 追索 SRC-006/007 原始发布公告、2026 研究生学院实施细则、具体受理年份 / 限为来源线索，规则保持未确认 /。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

### S03-T02 国家奖学金（含研究生对应情形）申报审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T02.md) blob `9188ead3b8704457b5b2daea0e15f8e8c34a93b8`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T02.ts) blob `693bb9de65bc796c9c8d8531a4ddcc5e0a53bf1c`。15 个二级节实际检出 15；字典 MD 28/19/25/12、TS 28/19/25。
- **条件性材料映射 P1-待作者举证**：TS 中 19/19 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 25、semantic 0、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：**第四轮重审（2026-10-23）：** 已实际取得整合 ZIP、第一轮主稿、审阅记录、R02 总账/目录审计/制作规范。原主稿 SHA256 `0678b11779b65ce0d889bb328a4c3d9c2bfe3e65db4c4a742986ff4b8ae3d0ec`。本轮保留 SRC-001–012 的旧号并补 F001–F；1. **本科校级办法全文（高优先）。** SRC-002 已定位目录但未取得正式附件，下一轮从学生处正式政策附件/信息公开页完整读取成理校学〔2024〕9 号，确认资格条件、机构、申诉、补件/撤回、生效与废止条款；不能用学院短通知替代。。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

### S03-T03 国家励志奖学金申报审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T03.md) blob `c318fe997f81b699d2e674a44b4c76ed449e3280`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T03.ts) blob `e96f6f1b42cca4226f64f13306d16808303370c5`。15 个二级节实际检出 15；字典 MD 44/24/36/16、TS 44/24/36。
- **条件性材料映射 P1-待作者举证**：TS 中 24/24 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 36、semantic 0、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：/ 015 / 国家资助中心 310 号附件2链接＋区政府可读完整文本，2021 原颁布；`GENERAL-RESEARCH` / 第1—4、8—11条和样表结构可逐条核：资格、学校组织、校级至少五工作日、逐级报送批复及后续支付 / 官方 DOCX 本次网页工具不支持解码，采用政府官方文本回查；国家第4条9/30与2025校本10月实际不；/ 结果失效链 / `M004/M005` 修改影响成绩、排名和依赖的推荐，非全案无差别重跑；`M008` 只动国奖互斥；`M006` 只动困难资格及其依赖；校级/省级旧决定仅提人工作废/更正 / 11.3 给最小依赖重审集；真正在 V3 里执行仍须实现验证 /。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

### S03-T04 校院及专项奖学金（含研究生学业奖学金）评审

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T04.md) blob `5fb3a4e6f0df9857822416ae6e7f90c3f256ae73`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T04.ts) blob `0c290b776222642c7daa76eb2cc300ab4a186a91`。15 个二级节实际检出 15；字典 MD 51/34/34/23、TS 51/34/34。
- **条件性材料映射 P1-待作者举证**：TS 中 34/34 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 34、semantic 0、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：- **已读学校正式制度正文**：SRC-001 成理校研〔2022〕18号（8页，2022-05施行/撤旧规、后修订待核）；SRC-002 成理校研〔2020〕92号（7页，2020-12印发、珠峰奖自2021-01-01施行、后修订待核）；SRC-012 核自院研字〔2023〕2号（8页，**限核自院**）。引用的身份、二级申诉、学院；1. **2026 学校统一本科/研究生及专项奖学金的当批政策**：向党委研工部、研究生院、学生资助中心索取 2026 正式通知、批次名额/等级、截止、公示、有效修订以及成理校研〔2022〕18/〔2020〕92 的最新有效版本。影响 R001—R003、R006—R013、R023—R030，未取得时统一锁定涉及资格/分值的 `POLI。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

### S03-T05 学生先进个人、荣誉称号及评优资格审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T05.md) blob `6cabc291acb4fbbd971fc5bba52032805e2f042d`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T05.ts) blob `566eb161a419d647f49874978b883f4c8ec3173b`。15 个二级节实际检出 15；字典 MD 42/28/38/13、TS 42/28/38。
- **条件性材料映射 P1-待作者举证**：TS 中 28/28 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 38、semantic 0、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：- `[ ]` 现行正式校级制度、研究生 2025 试行办法、当期表单正文、R02/G50 原件未取得，不能声称当前所有办理条件已覆盖。；1. **已完成研究交接**：原稿、原审阅、R02 144 项质量台账及原始候选主目录、拆并审计、四轮合同已从 Library ZIP 实际读取；已按 `02.3` 固定 S03-T01–T13 边界、按 `08.5` 重审 R001–R038 三态可达性。原 14.5 中“R02 原件未取得”的历史快照已被本项取代，不能再用旧句描述现状。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

### S03-T06 

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T06.md) blob `89f1c883780553be0b6574453c1b75e109d93558`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T06.ts) blob `0927b7a5b1990ae0daa63624f161b0e7f6f1af9b`。15 个二级节实际检出 15；字典 MD 40/25/26/17、TS 40/25/26。
- **条件性材料映射 P1-待作者举证**：TS 中 25/25 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 20、semantic 6、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：/ 规则 R / `R001–R026` **26** 条，定义唯一，均有 SRC/F/M、T/F/U、阶段、方法、例外、状态及下一角色；F/M 均被至少一条 R 引用 / 多处 `[P]` 为政策待核，规则不能靠旧阈值自动拒收/批准 /；- `SRC → R`：04.1 已记录每个来源的可用强度；未取原文的 SRC-011/014 只用于说明**政策缺口**，不可用作硬规则的正证据。历史来源 SRC-010/017 仅作为冲突和情形线索。。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

### S03-T07 国家助学金和基于困难身份的助学资助审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S03-T07.md) blob `a2a089bfff7ad5307496202c425f24f63e5c60e8`；[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S03-T07.ts) blob `47f51b1bdffd2e4948fa37d3d52fc6592100edb0`。15 个二级节实际检出 15；字典 MD 51/31/40/23、TS 51/31/40。
- **条件性材料映射 P1-待作者举证**：TS 中 31/31 个 minCount=0，0 个正数。奖助类事项必须明确“申请人证明/学校成绩与家庭经济认定记录/审定后公示及拨付记录”分阶段、分批次的必需性和替代关系；本报告不代定校规。
- **业务判据静态风险**：manual 35、semantic 5、dataCheck 0；需核研究 §08 每条 R 在 TS 的可执行检查或人工待办是否保留 guard=UNKNOWN、来源失联及人工有权决定，不得把 OCR 当权威记录。
- 编号缺项检查：F=无；M=无；R=无（仅编号层，不等于法律条款正确）。
- 研究稿自述待核：/ SRC-018 / **校内学院 PDF 全文已核**，核技术与自动化工程学院无工资认定申请/承诺/证明选择 / 原附件编号可能不一致；限本学院，有效时间待核 /；3. **规则→证据**：R001—R040 均记录阶段、真/假/未知触发、F/M、至少一 SRC 或明确指出 SRC 缺口（**R036 明示撤回缺校本 SRC，列旧公示仅作存在性，不能作为撤回效力依据**）、比较对象、时间层级与下个有权办理人。R010、R023、R040 本轮增加 SRC-014/023 关联，未凭研究发现扩充伪原子。
- 三类合成用例：A 事实满足但尚未经校方审定；B 缺当前证据而拨付/公示属于后置件；C 来源、资格或政策冲突需归口人工。**状态均 NOT_EXECUTED**。
- 验收：质量 `PENDING_RULE_REVIEW`、政策 `PARTIAL_OR_UNCONFIRMED`、定义 `PARTIAL`、运行 `UNVERIFIED`。

风险为模板自身映射问题；Main/IPC、财政支付及权限接口不在本批修改范围。
