# S01 学籍与身份状态｜8 项模板独立质量核验意见（候选快照）

**范围**：仅研究内容、F/M/R/SRC、模板定义对照；不评价 Main/IPC 或声称真实审核运行。**结论性质**：本报告完成逐文件机器化审查和文中关键条件检查，不等于 8 份全部逐条政策来源人工复核。所有情景尚未执行，禁止把纸面预期记为通过。

**取证**：PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`；PR #252 HEAD `b7d6c5bf5777f0274314de4b41097b9232e24330`；统一 base `150acfe761cb7ad0424a2ca009fd57f12dbfddfd`；上述 PR 均为候选未合并快照。

## 各模板核验台账

| ID／业务名称 | 来源PR | MD F/M/R/SRC | TS F/M/R | 必填字段／正数材料槽／dataCheck | 定义结论 |
|---|---:|---:|---:|---:|---|
| S01-T01 学生休学资格与材料审核 | #251 | 42/24/30/15 | 42/24/30 | 3/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T02 学生复学及退役复学资格审核 | #251 | 48/23/29/15 | 48/23/29 | 3/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T03 保留入学资格、保留学籍与应征入伍保留资格审核 | #251 | 38/26/32/17 | 38/26/32 | 3/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T04 转专业及专业身份变更申请审核 | #252 | 36/24/29/15 | 36/24/29 | 6/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T05 跨校转入、转出和转学申请审核 | #251 | 49/29/37/14 | 49/29/37 | 3/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T06 本人申请退学及学籍退出手续核验 | #251 | 52/28/36/15 | 52/28/36 | 1/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T07 降级、留级和年级编入变更审核 | #251 | 38/17/29/14 | 38/17/29 | 1/0/0 | 字典覆盖静态相符；条件未建模 |
| S01-T08 提前毕业、延期毕业与修业年限调整审核 | #251 | 50/25/41/12 | 50/25/41 | 5/0/0 | 字典覆盖静态相符；条件未建模 |

## 逐项证据、问题与必要返修

### S01-T01 学生休学资格与材料审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T01.md) blob `1438d380dd604d08a31c9f55b7bf183931e618b8`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T01.ts) blob `3bdf264843fa325be01523b2ba9df22ed1cce805`。研究稿 773 行、00–14 二级章节检出 15/15；字段 42、材料 24、规则 30、来源 15；运行定义字段 42、材料 24、规则 30。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 24/24；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：30 条候选 criterion 中 manual=26、semantic=4、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`／ R011 ／ 001/002/003 ／ F027–F029/F035 ／ M004/M005 ／ L2 病伤证据；普通病因材料形式未知仍待核，引用齐 ／`；`／ R024 ／ 004/005（**撤回细则缺**） ／ F011/F012/F041 ／ M002/M015/M021/M023 ／ L1–L4 X2/X3；撤回仅请求、实质权限待核，引用齐 ／`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T02 学生复学及退役复学资格审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T02.md) blob `88cea098bcd42decc097cb9b2bc7dd431b9cc227`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T02.ts) blob `4395b95ca545dc037686f87f598dd3f88ee6a173`。研究稿 758 行、00–14 二级章节检出 15/15；字段 48、材料 23、规则 29、来源 15；运行定义字段 48、材料 23、规则 29。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 23/23；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：29 条候选 criterion 中 manual=25、semantic=4、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`- [ ] 2026 合作办学全文、当前院系办事窗口和授权链——待核实。`；`- [x] 第 4 轮已按现有公开证据及 R02 目录做静态交叉验收，并生成独立检查单和交接 ZIP；未公开签批链与 2026 新规附件继续列为政策待核，不宣称实机验收。`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T03 保留入学资格、保留学籍与应征入伍保留资格审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T03.md) blob `9b699798877bf08be27687f18f8f32cea143168e`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T03.ts) blob `23b9cd6b6443f8a024c07bff20238eafe179ffab`。研究稿 742 行、00–14 二级章节检出 15/15；字段 38、材料 26、规则 32、来源 17；运行定义字段 38、材料 26、规则 32。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 26/26；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：32 条候选 criterion 中 manual=32、semantic=0、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`**证据现状：** SRC-001–005、007–012共11项已核来源正文/真实技术文件，SRC-006、013–015四项仍未取得可核权威全文；已核文本不等于2026现行性获校方确认。补充检索2022校申诉办法只发现另份校本来华留学生制度引用成理校发〔2022〕24号，未取得该办法正文，因此**未增加SRC、未写新申诉时限**。`；`本小节对前文所标 'ROUND3'、'下轮'、'R02原件仍缺' 等**旧轮次记录统一做状态勘误**，不改旧规则编号及证据语义。Library整合包已实际读取目录、审阅、第三轮主稿，R02原件缺失这一条现已关闭；不意味着校本政策或系统接口缺口关闭。旧稿SHA256：'27585501384ab92f78ccade090db434fb2ec`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T04 转专业及专业身份变更申请审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b7d6c5bf5777f0274314de4b41097b9232e24330/docs/design/review-agent/business-templates/R02/S01-T04.md) blob `a8486582a5a18e9d18484ba8abc92e1d2ee88305`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b7d6c5bf5777f0274314de4b41097b9232e24330/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T04.ts) blob `6b8cbf0e16eea3f7c18f2eb4eb17b03bddc809a8`。研究稿 381 行、00–14 二级章节检出 15/15；字段 36、材料 24、规则 29、来源 15；运行定义字段 36、材料 24、规则 29。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 24/24；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：29 条候选 criterion 中 manual=9、semantic=20、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T05 跨校转入、转出和转学申请审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T05.md) blob `57d1b149c570abf23a814f97871ba529b386c8e0`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T05.ts) blob `f3a4b8986d2448ffbbe5df2250cc87f9c59c2362`。研究稿 767 行、00–14 二级章节检出 15/15；字段 49、材料 29、规则 37、来源 14；运行定义字段 49、材料 29、规则 37。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 29/29；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：37 条候选 criterion 中 manual=35、semantic=2、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`／ 本科2019办法及2017专项可以直接声明2026有效？ ／ 2019校方PDF有条文，但专项2017未取得、是否替代待核；不存在基于旧引文自动硬判窗口的依据 ／ 'POLICY_UNCONFIRMED' ／`；`／ 研究生、留学生可套本科录取线？ ／ 以F006分流，R014/015不适用；研究生需M012/013，涉外特别规则未知 ／ 结构闭合、政策局部待核 ／`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T06 本人申请退学及学籍退出手续核验

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T06.md) blob `7bbbb816525edb7125557f285adc3ebe14e6968e`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T06.ts) blob `809c24a98743dc8791cb1af414b6410d1f543681`。研究稿 627 行、00–14 二级章节检出 15/15；字段 52、材料 28、规则 36、来源 15；运行定义字段 52、材料 28、规则 36。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 28/28；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：36 条候选 criterion 中 manual=20、semantic=16、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`- [ ] R02 总账、去重审计及 G50 'catalog.json' 原文逐条对照：**否，资料未取得**。`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T07 降级、留级和年级编入变更审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T07.md) blob `1228f1b75c1f238d8bf3a6cb085c07dc3bf84815`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T07.ts) blob `8858094681cd24c6c87686c55809076205ec7374`。研究稿 693 行、00–14 二级章节检出 15/15；字段 38、材料 17、规则 29、来源 14；运行定义字段 38、材料 17、规则 29。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 17/17；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：29 条候选 criterion 中 manual=27、semantic=2、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`**第四轮结论（2026-10-23）**：本稿在保留原 'F001–F038/M001–M017/R001–R029' 连续编号基础上新增 'SRC-011–014' 四条来源和 S17–S20 四项敌意模拟，未为政策未知制造伪规则。旧文中“R02 总账未取得”已由实读原始范围文件纠正，旧文“中外合作仅知会议修订”“研究生以 2021 `；`- [ ] 'SRC-005' 当期现用表单及制度时效、研究生/合作办学细则、R02/G50 精确映射、申诉时限仍未取得；不声称信息已齐全。`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

### S01-T08 提前毕业、延期毕业与修业年限调整审核

- **实际取证**：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S01-T08.md) blob `a86f645717963347f975cf05db5eeab3cfd07bbe`、[候选 TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S01-T08.ts) blob `d6f91beeff482d619ecb7b00f6dd4fd57f17ff74`。研究稿 827 行、00–14 二级章节检出 15/15；字段 50、材料 25、规则 41、来源 12；运行定义字段 50、材料 25、规则 41。
- **P1 条件材料静态表达风险**：材料槽 `minCount=0` 为 25/25；`minCount>0` 为 0。材料当前必需／分支必需／后置需靠自然语言或下游实现另行判定，不能把本定义单独当“完整材料校验”。要求作者交付身份×事项×阶段→M 的机器可核矩阵，并说明权威源缺失与学生补件的区分。
- **P1/P2 规则执行能力需验证**：41 条候选 criterion 中 manual=40、semantic=1、显式 dataCheck=0。静态转录不证明三值分支、证据身份或精确阈值在执行时被实施；要求逐 R 给出运行绑定或人工任务的可复验证据。
- **研究稿自行声明的政策/审阅缺口（未独立证实）**：`### 14.1 第一至三轮累计证据缺口与第四轮动作（优先级依风险）`；`／ ID ／ 关键缺口/风险 ／ 下一轮补查或确认动作 ／ 未完成时处理 ／`。
- **验收**：内容质量 `PENDING_RULE_BY_RULE`；政策证据 `PARTIAL_OR_UNCONFIRMED`；模板定义 `PARTIAL`；真实业务场景 `NOT_EXECUTED`。

## S01 已专项核查事项

- S01-T01 §06 F022/F027 的时长属性被映射为 `date`，会影响“超过 6 周”等持续时间表达；应保留单位与比较口径（P2）。
- S01-T03 §14 历史 ROUND3 自检保留 15 项 SRC，而当前文档已有 17 项；应标明其为历史口径（P3）。
- S01-T04 §14 说明 2026 转专业正式规则、指标与签批链未完全取得，不得将往年或单学院条件视作全校现行门槛。
- S01-T08 §14 说明研究生 2024 版、2025 提前毕业细则及 2026 办事通知存在原文证据缺口，必须限制自动否决和通过。

## 合成用例三类（已设计，未运行）

| ID | 当前已核实事实 | 缺件／后置件 | 未知政策／证据冲突 |
|---|---|---|---|
| S01-T01 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T02 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T03 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T04 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T05 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T06 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T07 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |
| S01-T08 | 可核事实最多出 `PASS_FACT`，不自动批准；NOT_EXECUTED | 仅就适用 M 生成缺件或校方核源，后置文件不可前置；NOT_EXECUTED | `POLICY_UNCONFIRMED/CONFLICT/NEEDS_HUMAN_DECISION`；NOT_EXECUTED |

**本批最终业务验收**：未作 PASS。该批意见定位模板作者可修内容与定义合同，实际运行回归由共享实现审计独立承担；请勿将本报告用作签发或上线许可。
