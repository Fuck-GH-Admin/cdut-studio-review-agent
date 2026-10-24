# S05 团学组织与第二课堂｜七份模板质量意见

候选 PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`，补缺 PR #256 `16358ce6b46f353b50016868039e59f130fa9d41`；严格独立快照，均不视为已合并。

| ID | 正式名称 | 候选 PR | MD F/M/R/SRC | TS F/M/R | minCount>0 | dataCheck |
|---|---|---:|---|---|---:|---:|
| S05-T01 | 第二课堂成绩单与活动学分认定审核 | #251 | 42/20/32/16 | 42/20/32 | 0 | 0 |
| S05-T02 | 志愿服务工时与志愿活动经历认证审核 | #256 | 36/20/29/15 | 36/20/29 | 0 | 0 |
| S05-T03 | 劳动教育实践学时、课程表现认定审核 | #256 | 37/20/32/18 | 37/20/32 | 0 | 0 |
| S05-T04 | 学生社团成立、注册、变更、换届与注销审核 | #251 | 26/20/25/10 | 26/20/25 | 0 | 0 |
| S05-T05 | 学生社团活动立项与组织责任审核 | #251 | 31/22/26/15 | 31/22/26 | 0 | 0 |
| S05-T06 | 学生干部任职、任期履职与工作经历认定审核 | #256 | 36/20/30/21 | 36/20/30 | 0 | 0 |
| S05-T07 | 学生代表大会及研究生代表大会代表提案提交、立案程序审核 | #256 | 32/17/25/12 | 32/17/25 | 0 | 0 |

## 各项待返修或补证

### S05-T01 第二课堂成绩单与活动学分认定审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S05-T01.md) SHA `496893158c1508e79b0640b25442403252299d8d`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T01.ts) SHA `0da1a735bee283d574a7e1520a5ef3dde65ebd9f`。章节 15/15，文档/TS 字典数 42/20/32/16/42/20/32。
- **P1 条件材料可执行性**：20/20 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 32、semantic 0、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：/ `M001–M020` / 连续 20，槽有目的、持有人、材料类型、时点、替代、F/SRC、版本和缺失/不可读路径；32 条 R 均引用、无无人使用槽 / 不代表这些表单全部是校方必交；校本实际办事表单未取得 /。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S05-T02 志愿服务工时与志愿活动经历认证审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/docs/design/review-agent/business-templates/R02/S05-T02.md) SHA `0a13a3770c7e4f36cb304b10ca39c361bd41b54f`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T02.ts) SHA `b35ca28ddf381fe538aaa4304962b74c8b640804`。章节 15/15，文档/TS 字典数 36/20/29/15/36/20/29。
- **P1 条件材料可执行性**：20/20 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 17、semantic 12、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：未自动抽取，仍需人审政策正文及本校现行性。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S05-T03 劳动教育实践学时、课程表现认定审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/docs/design/review-agent/business-templates/R02/S05-T03.md) SHA `b3674685b7091b607e8dec6fdef392c7deeecc45`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T03.ts) SHA `09023e2b5c34109ced70a6008227c96ee5b1aa36`。章节 15/15，文档/TS 字典数 37/20/32/18/37/20/32。
- **P1 条件材料可执行性**：20/20 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 20、semantic 12、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：未自动抽取，仍需人审政策正文及本校现行性。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S05-T04 学生社团成立、注册、变更、换届与注销审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S05-T04.md) SHA `9819ed69b1f88ac1132a7f05a1936326736c1336`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T04.ts) SHA `92b4500770f4a0c421a9faec713c7832de42b765`。章节 15/15，文档/TS 字典数 26/20/25/10/26/20/25。
- **P1 条件材料可执行性**：20/20 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 25、semantic 0、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：未自动抽取，仍需人审政策正文及本校现行性。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S05-T05 学生社团活动立项与组织责任审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S05-T05.md) SHA `03ab73024e1fe36e5acc583dd4a4307853902936`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T05.ts) SHA `c7f669afa59f2717715e97c52f8f61bcf77c3a2f`。章节 15/15，文档/TS 字典数 31/22/26/15/31/22/26。
- **P1 条件材料可执行性**：22/22 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 24、semantic 2、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：未自动抽取，仍需人审政策正文及本校现行性。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S05-T06 学生干部任职、任期履职与工作经历认定审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/docs/design/review-agent/business-templates/R02/S05-T06.md) SHA `57111cfb38b8e3e33e1e7d917c378e637e113936`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T06.ts) SHA `629dd92dd759b90667a8f046d56fb0a6b0bff4ed`。章节 15/15，文档/TS 字典数 36/20/30/21/36/20/30。
- **P1 条件材料可执行性**：20/20 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 18、semantic 12、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：1. 当前**全校统一学生干部任职证明办理办法、申请入口/表单、签发印章归口及授权角色矩阵**未取得，暂不支持正式自动签发。；7. 研究稿未取得生产环境 actor 授权、真实个人材料、学校签发接口、可用档案 API，也未做真实学校审批试跑。真实保留期限和数据处理合法基础要另经责任人确定。[SRC-018]。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

### S05-T07 学生代表大会及研究生代表大会代表提案提交、立案程序审核

- [MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/docs/design/review-agent/business-templates/R02/S05-T07.md) SHA `43adaa00d867c6daca8f76fdf2d05921b799913f`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/16358ce6b46f353b50016868039e59f130fa9d41/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S05-T07.ts) SHA `53560749a40279e03e33be43e45a3b662a4868ed`。章节 15/15，文档/TS 字典数 32/17/25/12/32/17/25。
- **P1 条件材料可执行性**：17/17 个材料 `minCount=0`，0 个正数。必须按团学任职、活动参与、劳动学时、第二课堂成绩等具体资格与阶段列“当前必需/条件必需/校方源/事后证明”，不得把一个事项的附件套到另一事项。
- **P1/P2 事实执行映射**：manual 18、semantic 7、dataCheck 0；研究稿 R 规则不是学校批准权，定义中未验证确定性比较与三值 guard 真实执行。请作者补逐 R 输入及证据版本与结果码对应表。
- 文本出现而 TS 没有 F/M/R 对应编号：F:未检出缺号；M:未检出缺号；R:未检出缺号；若 TS 改用业务键名必须另给稳定映射。
- 原稿自陈仍待确认：- **建议变更**：无新增/拆分 S/T 主模板；仅为 R02 总账维护者登记 POLICY-CONFIG-REQUEST-S05-T07（本届程序及角色配置缺口）。如将来校本文件确证院级提案拥有完全独立权利对象，可提交 CATALOG-CHANGE-REQUEST，未经批准仍共用本 ID 条件分支。。
- 合成用例：①事实满足≠正式确认；②仅当前情形的申请证据可报缺，后续证书不可前置；③来源或政策未知需人工。均 `NOT_EXECUTED`。
- 结论：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runtime=UNVERIFIED`。

未修改业务模板定义或任何共享代码。全部为模板质量意见，政策须以校方最新权威文件另证。
