# S04 学生事务｜七份模板独立质量意见

来源 PR #251 HEAD `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38`，**候选而非已合并**。本文逐份对照完整 MD 与 TS 的编号、材料激活信息和规则属性，未验证电子校务系统权限、政策现行全文或实际执行结果。

| 模板 | 事项 | 研究 F/M/R/SRC | 运行 F/M/R | material min>0 | 数据检验 | 质量审阅状态 |
|---|---|---|---|---:|---:|---|
| S04-T01 | 学生请假、长短期病假、续假、销假与返校核验 | 50/24/38/28 | 50/24/38 | 0 | 0 | 编号一致，未通过业务验收 |
| S04-T02 | 校外住宿与安全责任申请审核 | 50/28/35/11 | 50/28/35 | 0 | 0 | 编号一致，未通过业务验收 |
| S04-T03 | 宿舍调整、调换及特殊住宿安排审核 | 25/16/18/9 | 25/16/18 | 0 | 0 | 编号一致，未通过业务验收 |
| S04-T04 | 假期留宿与临时住宿申请审核 | 36/16/25/11 | 36/16/25 | 0 | 0 | 编号一致，未通过业务验收 |
| S04-T05 | 延长住宿、退住及住宿资格终止核验 | 43/26/34/16 | 43/26/34 | 0 | 0 | 编号一致，未通过业务验收 |
| S04-T06 | 学生纪律处分申诉程序与材料审核 | 28/17/22/15 | 28/17/22 | 0 | 0 | 编号一致，未通过业务验收 |
| S04-T07 | 学生处分解除、撤销和影响期满资格核验 | 45/20/25/12 | 45/20/25 | 0 | 0 | 编号一致，未通过业务验收 |

## 逐 ID 的修复意见与检查证据

### S04-T01 学生请假、长短期病假、续假、销假与返校核验

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T01.md) blob `01d5139cea3509a1f279b6f2d889975a98e2a61d`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T01.ts) blob `4512da49493c9b9e367e2374586072e9c265eacf`。MD 二级章节 15/15，字典 50/24/38/28，运行 F/M/R=50/24/38。
- **P1 候选合同待验**：材料槽 24/24 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：76 manual、0 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：本轮在线直接读到原始PDF：本科`SRC-001`、国际学生`SRC-003`、研究生外出通知与附件`SRC-004`、网信处2026教师版指南`SRC-024`；国际2025会议纪要`SRC-021`已由官方PDF索引复核。研究生2021文本`SRC-002`是**历史线索**。官方页面在某些入口返回412；**材料生命周期复核**：`M001`身份证据用于`R002/R003`；`M002/M003/M004/M005`用于`R005–R013`；`M006/M007/M008`用于`R014–R018`；`M009–M013`用于`R024–R029`；`M014–M016`用于`R019–R022/R030。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

### S04-T02 校外住宿与安全责任申请审核

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T02.md) blob `2ff7b1510817539e6ea452ec97bf75b0e507a700`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T02.ts) blob `8b380493e66ba843c38823309d31acd8325785ee`。MD 二级章节 15/15，字典 50/28/35/11，运行 F/M/R=50/28/35。
- **P1 候选合同待验**：材料槽 28/28 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：70 manual、0 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：2. **SRC-001**：2026-10-23 官方后勤服务页经搜索结果重新检索，明确区分本科双面申请表、安全承诺、家长签字文件、房屋安全承诺、条件性房产证、退宿单及学院纸电汇总；搜索索引可见，但网页直接打开服务发生工具内部错误。因未直读本轮完整网页及可下载表格，不将任何推测中的栏位加入强制字段。原正文信；6. **SRC-005、SRC-009**：2017纪律处分文件不得被移作外住自动拒批或复核期限依据；SRC-009 是待取得的技术清单线索，不是政策依据；正式的 G50 资产 `catalog.json` 尚未取得，不能声称精确技术重复检查完成。。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

### S04-T03 宿舍调整、调换及特殊住宿安排审核

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T03.md) blob `a29d664aa9f5123c1b5d2757b13928de7c2499b7`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T03.ts) blob `df9a39e40a5cd3271a6d33ae9df26b38041c0179`。MD 二级章节 15/15，字典 25/16/18/9，运行 F/M/R=25/16/18。
- **P1 候选合同待验**：材料槽 16/16 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：36 manual、0 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：/ GAP-01 / 高：材料口径/现行性 / SRC-001 官网页面直连 412，未取得两张表的原件、版次、字段、落款；较早服务指南可能过时 / 由楼寓服务中心/所在学院提供现用空白表及盖章样例，逐字段/版本核验；不用第三方转载 /；/ GAP-03 / 高：床位冲突 / 可分配床位的权威台账、锁位/冻结、跨学院与并发审批冲突、空床或无床位处置未核 / 询问楼寓中心台账归口、时点与人工协调规则；无可信数据时只显示待核/冲突，不执行分配 /。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

### S04-T04 假期留宿与临时住宿申请审核

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T04.md) blob `7d18db565958deb4f58d4771cf5f9e68b696e507`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T04.ts) blob `f79c7b6472c2002d2e486adae4c88609b8f0f392`。MD 二级章节 15/15，字典 36/16/25/11，运行 F/M/R=36/16/25。
- **P1 候选合同待验**：材料槽 16/16 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：50 manual、0 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：/ 缺口 / 本轮规则化后仍存风险 / ROUND4 必须取得或人工明确的依据 /；/ H01 寒假常规申请 / R001—R010/R025；R011 仅代办 / R012—R016、R018/R019，P7/P8 按需要 R021—R024 / F002—F025；M001—M005，之后 M006/M007/M010；SRC-001/002；**新批次政策仍待核** /。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

### S04-T05 延长住宿、退住及住宿资格终止核验

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T05.md) blob `de1a0317fb531f275e7a2691db2a63a23c8699ee`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T05.ts) blob `2015fdae7d0a613a25db66635c1219a70cb03091`。MD 二级章节 15/15，字典 43/26/34/16，运行 F/M/R=43/26/34。
- **P1 候选合同待验**：材料槽 26/26 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：22 manual、12 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：- [x] 第一轮曾只核 G50 指定 SHA，无法取得 R02 主/审计总账。**本轮已从整合 ZIP 实际取得并核对两份目录，旧缺口不再成立**。；5. **交接门禁**：当前 `RESEARCH_HANDOFF_READY_POLICY_OPEN` 可供工程侧讨论、集成事实/材料规则与开展校本取证，但不得对外宣称校方官方模板、不得启用任何自动终止或自动拒绝权利规则。政策高影响缺口须经校本原文与真正有权人确认后，方可冻结可执行的高影响 profile。。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

### S04-T06 学生纪律处分申诉程序与材料审核

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T06.md) blob `f0d975eded1597bb102b5af3c99ecc66bc41195d`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T06.ts) blob `66a7bf8b8855a51cd9fec094f44d0ca2ce9a0e19`。MD 二级章节 15/15，字典 28/17/22/15，运行 F/M/R=28/17/22。
- **P1 候选合同待验**：材料槽 17/17 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：7 manual、15 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：本稿完整设置 SRC-001–015、F001–F028、M001–M017、R001–R022；主事实核验规则均带阶段、字段、材料、来源和角色。SRC-007 未取得全文，SRC-004/008/009/014 的现行性未知；SRC-012仅技术证据。字段、槽和规则是可实现的研究设计，不是校方正式表单。旧稿。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

### S04-T07 学生处分解除、撤销和影响期满资格核验

- 源：[研究稿](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/S04-T07.md) blob `d22ba4510ead88e549bb55afc388b73ff3913122`；[运行定义](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/S04-T07.ts) blob `22c5fea9abfcf75b08edbc70ee376769bfc5dc73`。MD 二级章节 15/15，字典 45/20/25/12，运行 F/M/R=45/20/25。
- **P1 候选合同待验**：材料槽 20/20 最小数为 0，正数 0。请按学生身份、事由、业务阶段给出申请材料／校方已掌握事实／处理完成凭证的分类和条件必需规则；不得把事后准假/处分/审批结果当初始材料。
- **P1/P2 事实审查规则待证**：24 manual、1 semantic、0 dataCheck。需对 §08 逐 R 显示真实事实值、来源版本、冲突/未知/不适用、下一人，而非单纯传递描述文字。
- **ID 对照**：F 静态齐；M 静态齐；R 静态齐。如 TS 使用业务键名而非 F 编号，需显式映射表才可确认语义一致。
- **文档自身保留待核**：/ 编号／优先级 / 缺口／风险 / 下一轮可操作查证动作 / 对自动化的临时限制 /；/ GAP-04／P1 / **申请表、处分期考察及履行证据**现用字段未知，附件可能在 PDF 外；不能臆造必交材料 / 获取普通学生／留学生解除处分现用表单、学院核查清单；按阶段核定材料产生者和是否可替代 / 仅记录缺口，不将未产生的审批件作为初次申请缺件 /。
- 设计场景 3 条（真实执行数 0）：a. 合格事实不授权自动校方决定；b. 当前缺件提出阶段性补充，禁止后置件前置；c. 政策版本/材料归属冲突转有权人工。状态均 `NOT_EXECUTED`。
- 三轴：质量 `REVIEW_PENDING`；政策 `PARTIAL/UNCONFIRMED`；定义 `PARTIAL`。

