# S06 创新创业、竞赛与实践｜8 项模板质量核验意见

证据来自 PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`，补缺 PR #262 `e7009e38f4c6ee30a8d75172f38d51e65f45f82b`；未合并候选分别保持各自提交 SHA。

| ID | 事项 | 候选PR | 研究 F/M/R/SRC | 定义 F/M/R | 正数材料 | dataCheck |
|---|---|---:|---|---|---:|---:|
| S06-T01 | 大学生创新训练计划立项、中期、结项全过程审核 | #251 | 42/34/28/17 | 42/34/28 | 0 | 0 |
| S06-T02 | 学科竞赛报名、校内推荐与参赛资格审核 | #251 | 26/17/20/13 | 26/17/20 | 0 | 0 |
| S06-T03 | 学科竞赛奖项、成绩与参赛角色认定审核 | #262 | 34/19/26/21 | 0/0/26 | 0 | 0 |
| S06-T04 | 学生创新科研成果校级奖励申报审核 | #262 | 34/18/26/16 | 0/0/26 | 0 | 0 |
| S06-T05 | 学生社会实践立项、成果与实践时长认定审核 | #251 | 48/32/26/9 | 48/32/26 | 0 | 0 |
| S06-T06 | 课程实习、专业实习与毕业实习资格及成果认定 | #262 | 46/27/32/12 | 0/0/32 | 0 | 0 |
| S06-T07 | 学生创业项目孵化、入驻与团队资格审核 | #262 | 44/34/40/12 | 0/0/40 | 0 | 0 |
| S06-T08 | 学生创业扶持资金、创业专项奖励申请审核 | #262 | 32/20/30/12 | 0/0/30 | 0 | 0 |

## 逐模板审核意见（静态，不冒称已完成实机）

### S06-T01 大学生创新训练计划立项、中期、结项全过程审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S06-T01.md) blob `33b142012ba719aac71adfe54730d8061ba0f6da`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T01.ts) blob `ee6a1d2436fec78b35e1522b2e38ab5c8e1fe565`；00–14 章节 15/15，MD F/M/R/SRC 42/34/28/17，TS F/M/R 42/34/28。
- **P1 条件必需表映射未得到运行证据**：34/34 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 27、semantic 1、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=无；M=无；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：- [ ] **政策与实务待核而非研究文稿未完成：** 现行全校制度、2026 省厅通知原件、当期申报/中期/变更原表全文、真实学生匿名化材料验证、正式签发权限与客户端执行；`v1.0` **不代表学校正式授权或生产验收**。；/ GAP-01 / **2026 全校大创管理办法及首批申报附件未取得**；SRC-003 计网第一批年级/人数、部分路径已有原文，但**不能证明全校或后续批次通用** / 向教务处/创新创业学院核对现行制度、SRC-003 是否被修订、2026 申报书/推荐表和其他院批次；仅未能落到同院同批同级同类的门槛才输出 `POLICY_UNCONFIRMED` 。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T02 学科竞赛报名、校内推荐与参赛资格审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S06-T02.md) blob `1ae918a87ad95e756d467941db549395119b9ef1`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T02.ts) blob `ec49fa1f9238334765fdd60ffaf0bfe52f2277d5`；00–14 章节 15/15，MD F/M/R/SRC 26/17/20/13，TS F/M/R 26/17/20。
- **P1 条件必需表映射未得到运行证据**：17/17 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 15、semantic 5、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=无；M=无；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：> 本表沿用原稿 GAP 编号；“阻断”是**投入校内真实运行/自动签发的权限或政策前置条件**，不是公开资料研究稿、合成场景与 ZIP 交付阻断。未取得的内部文件不声称已取得，也不要求用户在本轮上传。；/ GAP-06 / **目录级已修复；实现级开放**：G50/S/T 语义重复风险 / 固定 SHA 的 `catalog.json` 50/50 ID、R02 Master、含旧 116 项去向的 Audit **本次均已实际读取**；§02、§12 映射 S06-T03、`g03/g04/g05/g06/g07` 精确 ID。仍未逐行查 50 份 wo。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T03 学科竞赛奖项、成绩与参赛角色认定审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/docs/design/review-agent/business-templates/R02/S06-T03.md) blob `f7e6bb28e25ea346c0712af217cc78fa239160b9`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T03.ts) blob `589b47194e08aa60e28cabf380ec0f8e03613f12`；00–14 章节 15/15，MD F/M/R/SRC 34/19/26/21，TS F/M/R 0/0/26。
- **P1 条件必需表映射未得到运行证据**：0/0 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 0、semantic 0、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032,F033,F034；M=M001,M002,M004,M005,M003,M019,M006,M010,M011,M007,M008,M014,M013,M016,M009,M017,M012,M015,M018；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：§14 未自动摘取明确列表，仍需独立核政策证据。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T04 学生创新科研成果校级奖励申报审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/docs/design/review-agent/business-templates/R02/S06-T04.md) blob `0b6250f5db9f37703c90ea619837a705c97926c5`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T04.ts) blob `fcae980b2436992c2eeec84ceb3ecd682d87cad9`；00–14 章节 15/15，MD F/M/R/SRC 34/18/26/16，TS F/M/R 0/0/26。
- **P1 条件必需表映射未得到运行证据**：0/0 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 0、semantic 0、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032,F033,F034；M=M001,M004,M005,M006,M009,M011,M008,M007,M010,M012,M013,M014,M015,M016,M017,M018,M002,M003；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：2. 任何源与现行批次权限不符，仅用于解释或提出政策缺口，不参与自动硬判。SRC-005/016 没有可执行奖项金额、资格权的证据；SRC-013～015 全部跨校参考。。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T05 学生社会实践立项、成果与实践时长认定审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S06-T05.md) blob `20ea57b7135df2d33f3594c06c3de4041858985c`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T05.ts) blob `3f209889e5435b80cb841d9e9d4e24dad7d3b947`；00–14 章节 15/15，MD F/M/R/SRC 48/32/26/9，TS F/M/R 48/32/26。
- **P1 条件必需表映射未得到运行证据**：32/32 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 21、semantic 5、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=无；M=无；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：/ GAP-01 / 2026 年暑期/寒假校团委正式通知、结项及评优办法未取得全文，旧通知不可自动延续 / 在校团委发文库核原文件、落款、批次生效与作废信息；以 SRC-004 所引 2026 两份通知作为检索目标 / 2026 参数全部 `POLICY_UNCONFIRMED` /；- [ ] 对 2026 批次有效的必需项、拒绝阈值、时长核定公式、正式撤回/复核权与期限，仍须归口机关证实；不得据 Round3 规则草稿自动审批。。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T06 课程实习、专业实习与毕业实习资格及成果认定

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/docs/design/review-agent/business-templates/R02/S06-T06.md) blob `1641a591b996262116081944c1cb2128aeb9251d`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T06.ts) blob `9f025bd11fb23dea1b413520966569e1059f1fb3`；00–14 章节 15/15，MD F/M/R/SRC 46/27/32/12，TS F/M/R 0/0/32。
- **P1 条件必需表映射未得到运行证据**：0/0 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 0、semantic 0、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032,F033,F034,F035,F036,F037,F038,F039,F040,F041,F042,F043,F044,F045,F046；M=M001,M002,M003,M004,M005,M006,M007,M008,M009,M010,M011,M012,M013,M014,M015,M016,M017,M018,M019,M020,M021,M022,M023,M024,M025,M026,M027；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：§14 未自动摘取明确列表，仍需独立核政策证据。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T07 学生创业项目孵化、入驻与团队资格审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/docs/design/review-agent/business-templates/R02/S06-T07.md) blob `db945e6d78ef359bb3eff06dabf61022ceef548a`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T07.ts) blob `94d3eca66a180a6b6dd6016e7072b375478fd936`；00–14 章节 15/15，MD F/M/R/SRC 44/34/40/12，TS F/M/R 0/0/40。
- **P1 条件必需表映射未得到运行证据**：0/0 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 0、semantic 0、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032,F033,F034,F035,F036,F037,F038,F039,F040,F041,F042,F043,F044；M=M001,M002,M003,M004,M005,M006,M007,M008,M009,M010,M011,M012,M013,M014,M015,M016,M017,M018,M019,M020,M021,M022,M023,M024,M025,M026,M027,M028,M029,M030,M031,M032,M033,M034；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：§14 未自动摘取明确列表，仍需独立核政策证据。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

### S06-T08 学生创业扶持资金、创业专项奖励申请审核

- [研究原文](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/docs/design/review-agent/business-templates/R02/S06-T08.md) blob `ce84bccb02ed8ee63149cdd5a33a8bc47f5fd352`；[候选定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e7009e38f4c6ee30a8d75172f38d51e65f45f82b/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S06-T08.ts) blob `ca1297dc406505799d75a5acbec573ba7fa06706`；00–14 章节 15/15，MD F/M/R/SRC 32/20/30/12，TS F/M/R 0/0/30。
- **P1 条件必需表映射未得到运行证据**：0/0 材料槽为 `minCount=0`，正数槽 0。项目立项/成员身份/奖项等级/主办单位/学时认定不同子情形材料应由各自已确认政策决定；科研/活动材料不能强制套一个通用奖状证明。作者需证明各个 M 的阶段激活、合法替代和后置成果处理。
- **P1/P2 规则可执行性风险**：manual 0、semantic 0、显式 dataCheck 0；对研究规则 R 的主体关联、团队角色、授权成果、期限/等级和例外保留原证据及人工决定权限。静态 criterion 文字不证明真实自动核验。
- 字典 ID 静态对照（MD 中出现、TS ID 未出现）：F=F001,F002,F003,F004,F005,F006,F007,F008,F009,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020,F021,F022,F023,F024,F025,F026,F027,F028,F029,F030,F031,F032；M=M001,M002,M003,M004,M005,M006,M007,M008,M009,M010,M011,M012,M013,M014,M015,M016,M017,M018,M019,M020；R=无。仍须人工比对字段类型和规则逻辑，非通过票。
- 本研究稿标识的缺口：- **当前最关键缺口**：本校具体资金计划/年度公告/表单/金额/公示评审/授权签批权限；四川 2025→2026 属地细则、过渡条款、重复受助规则；政府接口是否向学校开放只读查询；校内留存及合法个人信息处理依据。以上在 `P12` 配置项确认前，不能切为全自动硬判，更不能提交正式审批。。
- 合成情景：①真实参赛/实践事实可核但不等于学分或奖励认定；②条件材料缺/成果尚未形成应按阶段处理；③组织方资质或校方政策未知转人工。全部 `NOT_EXECUTED`。
- 三轴：内容 `REVIEW_PENDING`；政策 `PARTIAL_OR_UNCONFIRMED`；定义 `PARTIAL`；真实运行 `UNVERIFIED`。

仅负责模板自身质量，不重构共享执行；需要补证的制度必须以实际批次、正式主体核对。
