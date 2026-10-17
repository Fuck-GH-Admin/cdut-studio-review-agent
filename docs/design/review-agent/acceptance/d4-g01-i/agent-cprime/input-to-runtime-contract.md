# C′｜B r02 → D3-R1/A′ 中立数据合同（无答案）

- 引擎父提交：`94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`。
- 作者模板提交：`38277ce925347284d03347cef85ee59c6f30ec26`（PR #84；技术候选未正式放行）。
- B INPUT ZIP：`33ad9e1fe5104cae91463218293ae58ccd27c934ff091b0687b20c64d699b26c`。
- v1.7 来源 SHA：`52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329`。

## 数据迁移（候选，不是业务运行）

| B r02 | R1/A′ | 边界 |
|---|---|---|
| applicant.syntheticId | `studentId` | 只用于合成学生 ID；应保存 applicant 与真实权威记录的区别 |
| request.changes[] | `D2ScenarioSelection.targets[]` | 姓名→`full-name`；证号→`credential-id`；出生日期→`birth-date`；其他字段需授权枚举映射；不得将多个字段压为一项 |
| request.intent | target.intent / 前置路由 | 仅 `CURRENT_ENROLLMENT_CORRECTION` 可进入候选更正；范围外由业务显式 ROUTE，不能悄悄转成更正 |
| applicant.enrollment | 输入申请人声明 | 绝不能作为可信 enrolled 决策依据 |
| trusted-fixtures/...schoolRegistrySnapshot | 受控 `D2TrustedStudentSnapshotV1` 侧通道 | `SIMULATED_AUTHORIZED`、`SIMULATED_BOUND` 等是测试假设，不是学校权限；未知必须待核；记录 snapshotVersionId |
| evidenceRefs[] | `documentVersionId` + 每字段独立 `EvidenceLink.supportsFact/subjectId` | 文书可以共用，但每个事实需独立确认；旧版验证不能自动继承；只因原文件写 SIMULATED_AUTHORITY 不能自动确认为 legal-document |
| trusted-fixtures/...issuerChecks | 受控签发核验假设 | `UNKNOWN` 不得提升为 verified；`CONFIRMED_IN_SIMULATION` 仅作合成场景标记，不能直接代替人工 evidence link 审核 |
| policyContext.currentStatus | 政策核验/待核位 | 未取得校本现行全文，保持 POLICY_HOLD；SIMULATED_CONFIRMED 也不构成真实校规生效 |
| workflow.stage/decision | 受控校务阶段配置 | P6 阶段、权威决定不可由申请材料或技术预审自动推断 |
| variantOf/historicalVersionHistory | 独立运行与版本谱系 | 不能继承其他案例或旧文书的 Check、Plan 指纹和验证结果 |

**关键适配缺口：** B 的中立契约没有经过权威签署的 S01–S13 场景选择。A′ 模板仅在显式选择场景时激活，不能用「字段名匹配」冒充条件已经证实。受控夹具与申请材料必须分离；学生递交的文件永远不能冒充学校底账。

## 可执行边界

本轮公开 `cprime_input_preflight.py` 可在本地接收私有原始 INPUT ZIP，独立核验 ZIP/CRC/119个 manifest 成员哈希、28案、59材料索引、28受控 fixture 和信任来源分隔，输出私有的逐案无答案映射与 `pre-gold-freeze.json`。**原始 ZIP 与逐案映射不进入公开仓库。**

`review-d4-g01-cprime.test.ts` 在 GitHub Actions 上使用完全新的无 B 合成样本实测 R1/A′ 动态目标/反例/受控 Pi 回执；其结果不能计入 28 案 `RUN_ACTUAL`，也不能替代显式业务场景映射和原始 B 材料的实跑。无可信原件或完整场景映射时不填写假 Case/Run ID。