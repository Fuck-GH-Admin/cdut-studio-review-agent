# S02 教学与课程｜T06–T10 候选质量检查

来源 PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`。仅模板与研究资料质量；逐条原文政策实证和真实 Run 尚未完成。

| ID | 名称 | MD F/M/R/SRC | TS F/M/R | 正数材料槽 | 显式 dataCheck | 字典相符 |
|---|---|---|---|---:|---:|---|
| S02-T06 | 学生发起的成绩复核、复核后异议及复议申请审核 | 36/25/39/16 | 36/25/39 | 0 | 0 | 是（仅编号） |
| S02-T07 | 逾期补选、退课资格审核 | 37/22/30/10 | 37/22/30 | 0 | 0 | 是（仅编号） |
| S02-T08 | 重修、补修资格及教学班调整审核 | 42/29/40/19 | 42/29/40 | 0 | 0 | 是（仅编号） |
| S02-T09 | 辅修、双学位、微专业修读资格审核 | 47/30/43/17 | 47/30/43 | 0 | 0 | 是（仅编号） |
| S02-T10 | 学生体质健康测试免测、缓测与补测资格审核 | 45/22/27/13 | 45/22/27 | 0 | 0 | 是（仅编号） |

## 逐项意见（本文静态扫描，不冒充业务实测）

### S02-T06 学生发起的成绩复核、复核后异议及复议申请审核

- 源证：[MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T06.md) SHA 3206439ea5843496641b8ba67910cdccb8a8b1af；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T06.ts) SHA 2eb00c290173c0d6912d91bb9b8c8f614bd40f24。00–14 节 15/15，39 条 R 编号与候选 39 条 criterion 静态关联。
- **P1-待复核**：25/25 个材料槽最小数量为 0；即使研究稿说明条件必需，定义本身也没有可执行的阶段激活条件。需区分学生材料、校方权威记录、后续签发回执并提供逐业务情形对应 M 槽和补件语义。
- **P1/P2-待核执行表达**：字段 required=true 1 处，manual=39、semantic=0、显式 dataCheck=0；未见逐 R 可复核确定性校验配置证据。自然语言 requirement 不能被当作已经验证的判断器。
- **字典核对**：F 无缺号；M 无缺号；R 无缺号。只有 ID 静态覆盖，不等于 SRC 权威性或业务正确性。
- **文档自述待核事项**：/ P4 答复后异议 / R028（异议事实）、R038（渠道授权）；正式申诉范围的分流先经 R029 / M018，须核已产生 M014/M015 / 不自造成绩复议决定、申诉适用性待核 /；- [x] ROUND4 研究级复查：完成旧稿提取和 SHA 对照、R02 真实目录阅读、公开源定向复查、权限敌意检查、合成反例重放及交接。尚未取得的校本原文/G50 技术原件明确列为外部证据缺口，不伪装已核。。
- **三场景**：有限事实满足≠正式批准；适用材料缺失≠要求后置凭证；政策或可信源未知≠自动拒绝。三场景全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### S02-T07 逾期补选、退课资格审核

- 源证：[MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T07.md) SHA e82c647af1aadd16c9f88fdc00bb6a90830794b7；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T07.ts) SHA 411e70f0f051c550dc9c6ae62caa63ac8338d5eb。00–14 节 15/15，30 条 R 编号与候选 30 条 criterion 静态关联。
- **P1-待复核**：22/22 个材料槽最小数量为 0；即使研究稿说明条件必需，定义本身也没有可执行的阶段激活条件。需区分学生材料、校方权威记录、后续签发回执并提供逐业务情形对应 M 槽和补件语义。
- **P1/P2-待核执行表达**：字段 required=true 1 处，manual=30、semantic=0、显式 dataCheck=0；未见逐 R 可复核确定性校验配置证据。自然语言 requirement 不能被当作已经验证的判断器。
- **字典核对**：F 无缺号；M 无缺号；R 无缺号。只有 ID 静态覆盖，不等于 SRC 权威性或业务正确性。
- **文档自述待核事项**：/ SRC-010 `CDUT-VERIFIED` / 官方章程学生权益与申诉机构的条文 / 不是专门选课申诉指南；核准/修订沿革及具体受理时限尚未复核 /；8. **K08｜G50 真实业务来源与实施接口**（中）：**R02 总账和去重审计已取得，本项“原件未得”缺口已关闭。** 但 G50 的具体学校政策、每条证据结论如何受信接入 V3 以及当期 School Owner 正式批准仍未证；技术目录 50 项未发布，不能把其 `PASS_FACT` 当成本案行政批准。。
- **三场景**：有限事实满足≠正式批准；适用材料缺失≠要求后置凭证；政策或可信源未知≠自动拒绝。三场景全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### S02-T08 重修、补修资格及教学班调整审核

- 源证：[MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T08.md) SHA d2d87d975b554172302a70630e2d728e5fde614a；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T08.ts) SHA e4289d55f5bf36b509c8dd2aae55856d69c6ba59。00–14 节 15/15，40 条 R 编号与候选 40 条 criterion 静态关联。
- **P1-待复核**：29/29 个材料槽最小数量为 0；即使研究稿说明条件必需，定义本身也没有可执行的阶段激活条件。需区分学生材料、校方权威记录、后续签发回执并提供逐业务情形对应 M 槽和补件语义。
- **P1/P2-待核执行表达**：字段 required=true 1 处，manual=40、semantic=0、显式 dataCheck=0；未见逐 R 可复核确定性校验配置证据。自然语言 requirement 不能被当作已经验证的判断器。
- **字典核对**：F 无缺号；M 无缺号；R 无缺号。只有 ID 静态覆盖，不等于 SRC 权威性或业务正确性。
- **文档自述待核事项**：/ 当前政策与实现可运行性 / 2026–2027 秋原始通知及本期特殊办理细则仍未取得；真实接口、权限配置、业务端到端行为没有授权数据可测 / **`RESEARCH_HANDOFF_READY_POLICY_OPEN`；`OFFICIAL_POLICY_UNVERIFIED`，不得上线替学校审批** /；/ **GAP-01 当期选课/重修正文**：SRC-014 仅有 2026-06-26 标题，无附件；未取得 2026 秋重修通知 / R005/R019–R022/R027–R029；A–G / 从教务处原件或教务授权人员取得文号、日期、附件、补充通知，核原文条页与适用身份；否则 `POLICY_UNCONFIRMED`，不写任何截止时间 /。
- **三场景**：有限事实满足≠正式批准；适用材料缺失≠要求后置凭证；政策或可信源未知≠自动拒绝。三场景全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### S02-T09 辅修、双学位、微专业修读资格审核

- 源证：[MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T09.md) SHA deb0a3b45dd1e6acb5fa29c56a7d2cd6576b48fe；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T09.ts) SHA c6bf0f8de2b6af6a2fe03671089cfdac92c4807c。00–14 节 15/15，43 条 R 编号与候选 43 条 criterion 静态关联。
- **P1-待复核**：30/30 个材料槽最小数量为 0；即使研究稿说明条件必需，定义本身也没有可执行的阶段激活条件。需区分学生材料、校方权威记录、后续签发回执并提供逐业务情形对应 M 槽和补件语义。
- **P1/P2-待核执行表达**：字段 required=true 1 处，manual=43、semantic=0、显式 dataCheck=0；未见逐 R 可复核确定性校验配置证据。自然语言 requirement 不能被当作已经验证的判断器。
- **字典核对**：F 无缺号；M 无缺号；R 无缺号。只有 ID 静态覆盖，不等于 SRC 权威性或业务正确性。
- **文档自述待核事项**：> **第三轮自检及历史缺口台账；不是第四轮最终验收。** 后续轮次必须修改**本原文件**，不能另起完整综述。；/ 流程事实/决定分离 / 10 定义**八种互斥结果**+独立正式决定轴；11.4 要求可信签发者，R032/R033/R036/R039只消费学校有权决定 / 可信 Host/Main Actor、校方 API、实际审批表尚未验收 /。
- **三场景**：有限事实满足≠正式批准；适用材料缺失≠要求后置凭证；政策或可信源未知≠自动拒绝。三场景全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### S02-T10 学生体质健康测试免测、缓测与补测资格审核

- 源证：[MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S02-T10.md) SHA 17014f5a529e6e68279ca901f769c53150df7b42；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S02-T10.ts) SHA 0c2eef7011c9e72c42b4ad69b5cedcf788e761da。00–14 节 15/15，27 条 R 编号与候选 27 条 criterion 静态关联。
- **P1-待复核**：22/22 个材料槽最小数量为 0；即使研究稿说明条件必需，定义本身也没有可执行的阶段激活条件。需区分学生材料、校方权威记录、后续签发回执并提供逐业务情形对应 M 槽和补件语义。
- **P1/P2-待核执行表达**：字段 required=true 1 处，manual=27、semantic=0、显式 dataCheck=0；未见逐 R 可复核确定性校验配置证据。自然语言 requirement 不能被当作已经验证的判断器。
- **字典核对**：F 无缺号；M 无缺号；R 无缺号。只有 ID 静态覆盖，不等于 SRC 权威性或业务正确性。
- **文档自述待核事项**：**读取口径**：`C`=该阶段业务核对必须有的事实（**可能是系统记录而非上传件**）；`K`=遇到明确条件才需；`L`=后续才形成。表中标注的 `S/U/P` 分别为：`S`权威来源不可达→`SOURCE_UNAVAILABLE`；`U`材料不可读取→`UNREADABLE`（仅对实际存在的需读件生效）；`P`2026成都理工大学现行政策未核→`POLICY_UNCONFI；/ **C04 缓测后补测**；`SRC-001/005` / `F002–F011/F016/F017/F032/F033/F043` / **C** `M001/M002/M006/M012`；**K** `M003`依预约规定 / `M013`及补测成绩 / 只凭学生声称缓测→`CONFLICT`/待核；缓测状态失联→`S`；2026转补测规则→`P`；不重复强索原医疗材。
- **三场景**：有限事实满足≠正式批准；适用材料缺失≠要求后置凭证；政策或可信源未知≠自动拒绝。三场景全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL_OR_UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

本批意见不修改原模板，未将候选 PR 当成已合并内容，提交至独立审计 PR #263。
