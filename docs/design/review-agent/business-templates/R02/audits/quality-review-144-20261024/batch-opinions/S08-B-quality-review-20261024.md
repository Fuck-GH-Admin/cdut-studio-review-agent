# S08 研究生培养与学位｜B 批 T06–T10 质量意见

候选 PR #251 SHA `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`、补缺 #259 SHA `a353b32fedc3ea566140d50dcfbf8af1a231ba8d`；静态获取逐文件核验，不主张研究生现行制度已核准。

| ID | 名称 | PR | MD F/M/R/SRC | TS F/M/R | min>0 | dataCheck | 状态 |
|---|---|---:|---|---|---:|---:|---|
| S08-T06 | 学位论文预审、预答辩、送审资格与评阅材料审核 | #251 | 58/39/44/16 | 58/39/44 | 0 | 0 | 静态编号相符 |
| S08-T07 | 研究生学位论文正式答辩资格与程序材料审核 | #259 | 47/32/38/20 | 47/32/38 | 0 | 0 | 静态编号相符 |
| S08-T08 | 硕博士学位申请、延期授予及学位决定材料审核 | #259 | 35/27/32/13 | 35/27/32 | 0 | 0 | 静态编号相符 |
| S08-T09 | 研究生联合培养及培养单位变更资格审核 | #259 | 42/27/28/15 | 42/27/28 | 0 | 0 | 静态编号相符 |
| S08-T10 | 硕博连读、直博或培养层次转段资格审核 | #259 | 48/34/44/14 | 48/34/44 | 0 | 0 | 静态编号相符 |

## 逐份模板质量意见

### S08-T06 学位论文预审、预答辩、送审资格与评阅材料审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S08-T06.md) blob `7aedd51fad502823390ddffc76f8bc67b6659716`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T06.ts) blob `7ca62bc9c949933f88438a1dbaa22cbf0332cff7`。章节 15/15，MD 编号 58/39/44/16、TS 58/39/44。
- **材料声明≠条件激活**：39/39 个材料 `minCount=0`，0 个正数；条件必需、后生、校内记录、导师或学位委员会形成件不能混作学生初请材料。作者需证明当前事项全部情形的最小证据集及合法替代。
- **规则与结论间隙**：37 manual、7 semantic、0 显式 dataCheck；补齐研究 R→稳定检查→证据版本→事实结果/人员待办映射。未确认的校本指标不应自动通过或否决。
- 编号差异：F 无；M 无；R 无；如定义使用业务键需提供单独映射说明。
- 研究稿列为待核的事项：/ SC-10D 检测结果复议 / F028/F029/F056 / M014*/M035 / 003（现行性待核） / 缺异议证据；读表单；源检测经办/分委会；策复议程序时效未知，非 M023 /；/ `M006` / R011 预审格式检查（证明义务待核） / `M025` / R031 同行复议结果 /。
- 三种情境均为设计未执行：可核事实非批准；缺当前件不强索后置回执；证据冲突或现行政策不明交有权人工。实际 `NOT_EXECUTED`。
- 结论：`quality=PENDING_RULE_REVIEW`、`policy=PARTIAL/UNCONFIRMED`、`definition=PARTIAL`、`runtime=UNVERIFIED`。

### S08-T07 研究生学位论文正式答辩资格与程序材料审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/docs/design/review-agent/business-templates/R02/S08-T07.md) blob `056bbd59bab54c745dca24f131bdba06d420552a`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T07.ts) blob `12ca7a6a40389d6f9d2bc7e1b1bd7bb4ffc43dea`。章节 15/15，MD 编号 47/32/38/20、TS 47/32/38。
- **材料声明≠条件激活**：32/32 个材料 `minCount=0`，0 个正数；条件必需、后生、校内记录、导师或学位委员会形成件不能混作学生初请材料。作者需证明当前事项全部情形的最小证据集及合法替代。
- **规则与结论间隙**：2 manual、36 semantic、0 显式 dataCheck；补齐研究 R→稳定检查→证据版本→事实结果/人员待办映射。未确认的校本指标不应自动通过或否决。
- 编号差异：F 无；M 无；R 无；如定义使用业务键需提供单独映射说明。
- 研究稿列为待核的事项：/ **GAP-03 可信身份与职权** / 只有技术设计的E3/E2/F044，未取得校方学籍、导师任命、委员资历、校方审查及签章的实际只读权限映射；R002/R010/R017–R029/R036不能实证运行。 / 由研究生院学位与研究生系统及学院提供授权角色、签认/备案/会议记录的脱敏样例或只读接口合同 /；/ **GAP-04 R02与G50运行端接线** / **已解决“R02原始目录未取得”**：整合包内SRC-015/016两份原文已读；S08-T06是预审/送审、T06-T01是导师资格，前版误映射已修。剩下的只是运行端sourceRef/scope/sourceVersion/唯一写权与上游正式结果没有接口证据。 / 目录/集成O。
- 三种情境均为设计未执行：可核事实非批准；缺当前件不强索后置回执；证据冲突或现行政策不明交有权人工。实际 `NOT_EXECUTED`。
- 结论：`quality=PENDING_RULE_REVIEW`、`policy=PARTIAL/UNCONFIRMED`、`definition=PARTIAL`、`runtime=UNVERIFIED`。

### S08-T08 硕博士学位申请、延期授予及学位决定材料审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/docs/design/review-agent/business-templates/R02/S08-T08.md) blob `36d49f7aa9e58a454937b494a535d44379d5318f`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T08.ts) blob `1b829d9f25fcf3e5de105d6b399198ac2f62422d`。章节 15/15，MD 编号 35/27/32/13、TS 35/27/32。
- **材料声明≠条件激活**：27/27 个材料 `minCount=0`，0 个正数；条件必需、后生、校内记录、导师或学位委员会形成件不能混作学生初请材料。作者需证明当前事项全部情形的最小证据集及合法替代。
- **规则与结论间隙**：6 manual、26 semantic、0 显式 dataCheck；补齐研究 R→稳定检查→证据版本→事实结果/人员待办映射。未确认的校本指标不应自动通过或否决。
- 编号差异：F 无；M 无；R 无；如定义使用业务键需提供单独映射说明。
- 研究稿列为待核的事项：**关键校本证据缺口（已完成公开资料第四轮，后续仅由有权学校核实后可激活真实参数；不妨碍研究交接）：**；4. **P1｜最新表单与字段原文**：已取得硕博旧送审/答辩流程图（`SRC-010/011`），且发现研究生院 2026-05-09《学位申请材料》索引（`SRC-012`），但附件正文未取得。须索取当前表单、学院受理字段与线上系统真实提交规则，核定 `M001/M011/M024` 的实际时点，不能沿用旧纸质强制清单。。
- 三种情境均为设计未执行：可核事实非批准；缺当前件不强索后置回执；证据冲突或现行政策不明交有权人工。实际 `NOT_EXECUTED`。
- 结论：`quality=PENDING_RULE_REVIEW`、`policy=PARTIAL/UNCONFIRMED`、`definition=PARTIAL`、`runtime=UNVERIFIED`。

### S08-T09 研究生联合培养及培养单位变更资格审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/docs/design/review-agent/business-templates/R02/S08-T09.md) blob `8fc16cc7506ac33494acee6c3ae60122e21f0fad`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T09.ts) blob `11b5fb84e191ad241e73fb181850cbbd58c5a7e8`。章节 15/15，MD 编号 42/27/28/15、TS 42/27/28。
- **材料声明≠条件激活**：27/27 个材料 `minCount=0`，0 个正数；条件必需、后生、校内记录、导师或学位委员会形成件不能混作学生初请材料。作者需证明当前事项全部情形的最小证据集及合法替代。
- **规则与结论间隙**：2 manual、26 semantic、0 显式 dataCheck；补齐研究 R→稳定检查→证据版本→事实结果/人员待办映射。未确认的校本指标不应自动通过或否决。
- 编号差异：F 无；M 无；R 无；如定义使用业务键需提供单独映射说明。
- 研究稿列为待核的事项：1. **P0—新版学籍制度**：向研究生院/校办索取成理校研〔2024〕29 号全文、印发及生效日、对 2021 版的废止衔接；专查联合培养、保留学籍、校内培养单位调整、转专业/转学和申诉章。未取得前不启用学籍政策硬判断。对应 SRC-002/003/004/008。；- **不能声称确认**：所有 SRC 的当前有效性（其中 3 项有明确缺口）、2024 学籍办法的最终内容、附件原件准确页格、真实学生材料可读性、校方在线系统 API、Actor 写权可达性、G50/两份 R02 总账的**逐条源码级去重**。这些要第 4 轮读取原件与实机证据才能关闭。。
- 三种情境均为设计未执行：可核事实非批准；缺当前件不强索后置回执；证据冲突或现行政策不明交有权人工。实际 `NOT_EXECUTED`。
- 结论：`quality=PENDING_RULE_REVIEW`、`policy=PARTIAL/UNCONFIRMED`、`definition=PARTIAL`、`runtime=UNVERIFIED`。

### S08-T10 硕博连读、直博或培养层次转段资格审核

- [研究文稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/docs/design/review-agent/business-templates/R02/S08-T10.md) blob `0ca5b30e75776a92cd9ee3d492c244fa8d7ca889`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a353b32fedc3ea566140d50dcfbf8af1a231ba8d/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S08-T10.ts) blob `5ee4aeed4bf3cbb188dc20765c45e109aa9a8134`。章节 15/15，MD 编号 48/34/44/14、TS 48/34/44。
- **材料声明≠条件激活**：34/34 个材料 `minCount=0`，0 个正数；条件必需、后生、校内记录、导师或学位委员会形成件不能混作学生初请材料。作者需证明当前事项全部情形的最小证据集及合法替代。
- **规则与结论间隙**：0 manual、44 semantic、0 显式 dataCheck；补齐研究 R→稳定检查→证据版本→事实结果/人员待办映射。未确认的校本指标不应自动通过或否决。
- 编号差异：F 无；M 无；R 无；如定义使用业务键需提供单独映射说明。
- 研究稿列为待核的事项：**本轮已取得** R02 原始总目录、去重审查与统一制作提示词；审阅路径来自用户指定的整合包，旧稿与原始留存 SHA 一致。**未取得** G50 技术 `catalog.json`，所以本表完成的是业务授权对象级去重，不是 50 个运行模板的源码逐项查重。技术集成需保持同一 Case/Plan/Run 的唯一业务 Owner，后续由单。
- 三种情境均为设计未执行：可核事实非批准；缺当前件不强索后置回执；证据冲突或现行政策不明交有权人工。实际 `NOT_EXECUTED`。
- 结论：`quality=PENDING_RULE_REVIEW`、`policy=PARTIAL/UNCONFIRMED`、`definition=PARTIAL`、`runtime=UNVERIFIED`。

这份 B 批意见不做共享执行修复，也不改任何业务模板源文件。
