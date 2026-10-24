# S07 毕业发展｜9 项模板质量核验意见

PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`；补缺 S07-T09 PR #254 HEAD `a01a5a091e37a95f888e5aa4039d4ec3d987f269`。本文基于两分支逐 MD、TS 的静态审阅；不自动认可政策或学校最终决定。

| ID | 正式业务 | PR | 研究 F/M/R/SRC | TS F/M/R | 正数材料槽 | dataCheck | 静态状态 |
|---|---|---:|---|---|---:|---:|---|
| S07-T01 | 学生毕业资格、培养方案达成及结业状态核验 | #251 | 50/34/39/17 | 0/0/0 | 0 | 0 | 待核编号映射 |
| S07-T02 | **本科生**学士学位授予资格与申请材料审核 | #251 | 1/1/1/12 | 0/0/0 | 0 | 0 | 待核编号映射 |
| S07-T03 | 学生离校手续及部门结清记录核验 | #251 | 38/20/20/15 | 0/0/0 | 0 | 0 | 待核编号映射 |
| S07-T04 | 毕业生档案转递及收件人身份核验 | #251 | 48/24/32/15 | 0/0/0 | 0 | 0 | 待核编号映射 |
| S07-T05 | 毕业就业协议签约、解约与重新签约资格及程序审核 | #251 | 42/27/24/8 | 42/27/24 | 0 | 0 | 静态编号齐 |
| S07-T06 | 就业去向登记、就业证明与相关变更材料审核 | #251 | 42/23/28/18 | 42/23/28 | 0 | 0 | 静态编号齐 |
| S07-T07 | 基层就业学费补偿、国家助学贷款代偿资格审核 | #251 | 44/25/33/15 | 44/25/33 | 0 | 0 | 静态编号齐 |
| S07-T08 | 结业后达标申请换发毕业证资格审核 | #251 | 28/18/19/12 | 28/18/19 | 0 | 0 | 静态编号齐 |
| S07-T09 | 优秀应届本科毕业生推荐免试攻读研究生（推免）资格审核 | #254 | 47/26/36/11 | 47/26/36 | 0 | 0 | 静态编号齐 |

## 逐份问题与整改验收要求

### S07-T01 学生毕业资格、培养方案达成及结业状态核验

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T01.md) blob `3c1bb0af549e18ed195454de43b0a34f9f4fbd06`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T01.ts) blob `8963c490b68ab6266004bf5783655931cf109a32`；00–14 共 15/15 节，MD 50/34/39/17，TS 0/0/0。
- **P1 待验证条件材料的独立表达**：7/0 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 11，semantic 4，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:F001,F050,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032,F033,F034,F035,F036,F037,F038,F039,F040,F041,F042,F043,F044,F045,F046,F047,F048,F049；M:M001,M034,M030,M002,M031,M003,M011,M013,M004,M005,M006,M007,M008,M012,M029,M014,M009,M010,M016,M032,M021,M023,M017,M020,M019,M018,M028,M025,M022,M026,M027,M015,M024,M033；R:R019,R020,R028,R001,R039,R002,R003,R004,R005,R006,R007,R008,R009,R010,R011,R012,R013,R014,R015,R016,R017,R018,R021,R022,R023,R024,R025,R026,R027,R029,R030,R031,R032,R033,R034,R035,R036,R037,R038；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：/ 政策证据 / 15个 SRC 均至少有一条 R 引用；SRC-010/011 仍为关键全文缺口，SRC-013～015 仅证目录/表单存在 / 取得完整正文、效力日期、部门确认，不把旧通知当现行 /；4. `SRC-012` 来华留学生办法第70条明确援引成理校发〔2022〕24号学生申诉管理办法；此次官方域名检索未取得该办法全文。另查 `SRC-016` 留学生处分程序只能证明相邻处理事项存在陈述、送达和申诉机制，不能挪用于毕业批准本身。。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T02 **本科生**学士学位授予资格与申请材料审核

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T02.md) blob `01e6c99999b8d9b25661a62860de205fd51758d5`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T02.ts) blob `e15f853289b535e6db04a4f42e540f3b66e7217c`；00–14 共 15/15 节，MD 1/1/1/12，TS 0/0/0。
- **P1 待验证条件材料的独立表达**：6/0 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 6，semantic 2，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:F001；M:M001；R:R001；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：当期学校制度及后续授予授权待逐条核实。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T03 学生离校手续及部门结清记录核验

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T03.md) blob `694a5375006017941627eeb81224b5f23e267ef2`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T03.ts) blob `07e0f405f41a58e1894acca904de27391ba720a5`；00–14 共 15/15 节，MD 38/20/20/15，TS 0/0/0。
- **P1 待验证条件材料的独立表达**：6/0 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 7，semantic 3，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:F003,F001,F009,F010,F017,F014,F031,F032,F029,F033,F034,F036,F002,F006,F007,F011,F012,F016,F035,F023,F038,F004,F005,F008,F013,F015,F018,F019,F020,F021,F022,F024,F025,F026,F027,F028,F030,F037；M:M001,M002,M003,M004,M011,M013,M019,M020,M014,M016,M017,M018,M012,M005,M006,M007,M008,M009,M010,M015；R:R001,R020,R002,R003,R004,R005,R006,R007,R008,R009,R010,R011,R012,R013,R014,R015,R016,R017,R018,R019；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：- [ ] M003 当前系统清单、2026 具体岗位授权、适用性/豁免配置、委托与复核制度尚未取得；故仍不可升级为学校正式自动放行规则。；/ GAP-07 / **中高**：`ST-CANDIDATE-MASTER-CATALOG-R02.md`、`ST-CATALOG-AUDIT-R02.md` 本轮未取得正文，S/T 邻接编码细项和 G50 具体重叠清单尚需逐条对账。 / 获取两个 R02 总账的确定版本与 S07/G01 对照项；当前保持 S07-T03 不拆号，不据。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T04 毕业生档案转递及收件人身份核验

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T04.md) blob `ab0af0529ebe7fa7067ca9b757f7246d85bc3a28`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T04.ts) blob `11ce3d9d72b9d6ba40d7db3b4cb28ba74bfd98fb`；00–14 共 15/15 节，MD 48/24/32/15，TS 0/0/0。
- **P1 待验证条件材料的独立表达**：8/0 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 8，semantic 4，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:F001,F048,F029,F047,F008,F002,F003,F016,F024,F030,F046,F019,F023,F040,F041,F042,F031,F033,F034,F009,F010,F028,F035,F036,F043,F044,F004,F005,F006,F007,F011,F012,F013,F014,F015,F017,F018,F020,F021,F022,F025,F026,F027,F032,F037,F038,F039,F045；M:M001,M024,M012,M013,M014,M016,M015,M017,M018,M006,M007,M008,M019,M002,M010,M004,M021,M003,M005,M009,M011,M023,M022,M020；R:R001,R028,R029,R002,R003,R004,R017,R005,R006,R007,R008,R014,R009,R010,R011,R012,R013,R015,R016,R018,R019,R020,R021,R027,R022,R023,R024,R025,R026,R030,R031,R032；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：- 实际继承：文件库 ZIP `CDUT-ST-R02-Partial-Integration-20261023-FINAL.zip`，其中主稿、审阅记录、进度台账、目录、目录审计、四轮提示合同及原始留存均已取得。第三轮主稿 SHA256 为 `6967bdc15d9e6f8cd10c834d7d2a5c393691a8914e256ca；/ F/M/SRC 依赖 / `F001—F048`、`M001—M024`、`SRC-001—SRC-014` 保留单一字典和连续编号；逐 R 关联引用，R 对所有 M 有使用路径 / 2025 附件及 2026 专门通知正文未取得，政策效力逐条仍不能宣布通过 /。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T05 毕业就业协议签约、解约与重新签约资格及程序审核

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T05.md) blob `8d51fa538a2f1a402bba66604d3f8a110d6c46d4`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T05.ts) blob `4390dada7d509055a013d8198585af2d5db269f7`；00–14 共 15/15 节，MD 42/27/24/8，TS 42/27/24。
- **P1 待验证条件材料的独立表达**：27/27 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 21，semantic 3，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:无；M:无；R:无；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：**R003与R013纠偏**：R003的L0/L1/Lx真触发仅表示有实际发起/应约/代理动作；若服务端身份缺失则触发为`?`并输出`SOURCE_UNAVAILABLE`，若代理授权存在但其效力不明则`NEEDS_HUMAN_DECISION`。`SRC-004`证明平台单位用户可操作，不证明该账号实际个人拥有公司签署、授权代理或学校；**第四轮敌意反例补充**：C15“单位批量邀约误绑定同名不同学号”，M006事件同时含多人但F001权威主键仅匹配其中一人：R001/R008对错绑对象`CONFLICT`，不得批量应约。C16“企业被注销或经办人离职后出具解约函”，单位曾有平台账号但F019签署时点权限不明：R003/R015 `NEEDS_HUMAN_DECISIO。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T06 就业去向登记、就业证明与相关变更材料审核

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T06.md) blob `4d687bdbb6d0d4b93406e0aca777c5c5c1807156`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T06.ts) blob `073a106f0d57a941a0721e17dd314be4ad64b9d2`；00–14 共 15/15 节，MD 42/23/28/18，TS 42/23/28。
- **P1 待验证条件材料的独立表达**：23/23 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 28，semantic 0，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:无；M:无；R:无；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：当期学校制度及后续授予授权待逐条核实。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T07 基层就业学费补偿、国家助学贷款代偿资格审核

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T07.md) blob `3fb9b4dab545b9904336ce824d6bf9144e5e76ff`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T07.ts) blob `29621d8a6af98600c4d002762ebbbc4f37b63324`；00–14 共 15/15 节，MD 44/25/33/15，TS 44/25/33。
- **P1 待验证条件材料的独立表达**：25/25 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 33，semantic 0，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:无；M:无；R:无；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：/ 原缺口 / 2026-10-23第四轮证据状态 / 对规则/材料/权限的处理 /。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T08 结业后达标申请换发毕业证资格审核

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S07-T08.md) blob `936bf5835c1a133af0327d58c6cf130e3fdcf1df`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T08.ts) blob `59c65a74fa4ecc9b06d0b918b9f7a4aaa5625600`；00–14 共 15/15 节，MD 28/18/19/12，TS 28/18/19。
- **P1 待验证条件材料的独立表达**：18/18 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 18，semantic 1，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:无；M:无；R:无；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：当期学校制度及后续授予授权待逐条核实。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

### S07-T09 优秀应届本科毕业生推荐免试攻读研究生（推免）资格审核

- 证据 [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a01a5a091e37a95f888e5aa4039d4ec3d987f269/docs/design/review-agent/business-templates/R02/S07-T09.md) blob `245fc136ef2c412539bd3450ebfdda87fa46dde7`、[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a01a5a091e37a95f888e5aa4039d4ec3d987f269/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S07-T09.ts) blob `03453c3bf42e2909418f575953d119f80fec83da`；00–14 共 15/15 节，MD 47/26/36/11，TS 47/26/36。
- **P1 待验证条件材料的独立表达**：26/26 槽 `minCount:0`，正数 0。资格审查必须区分毕业/就业/推免的申请证据、学籍成绩权威记录、公式/遴选批次证据、正式决定后的证书或公示。请明确当前必需/条件必需/后置 M 的生效条件，不可用概述代替。
- **P1/P2 研究规则是否真可执行**：manual 36，semantic 0，显式 dataCheck 0；所有按学段、批次、特殊身份、申请对象变化的实质性 R 必须映射三值/异常及来源；不允许凭旧批次指标直接硬拒绝。
- 静态编号差异：F:无；M:无；R:无；如存在业务 key 另需作者给出 F 编号映射表。
- 文中留置的制度缺口（非独立确证）：当期学校制度及后续授予授权待逐条核实。
- 待执行三案：事实满足不自动颁发毕业/学位/推免决定；阶段性缺证只按该业务要求补件，后续形成证书不前置；学段或当期公示规则未知应停在人审。**NOT_EXECUTED 3/3**。
- 三轴状态：内容 `PENDING_DEEP_REVIEW`；政策 `PARTIAL_OR_UNCONFIRMED`；工程 `PARTIAL/UNVERIFIED`。

本报告的规则映射意见交模板作者，学校实际授予/决定权限无审核代理权。无生产修改。
