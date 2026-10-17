# D3-R1 未关闭缺口、影响及最小复现

| ID | 状态/级别 | 未完成能力/最小复现 | 修复归属 |
|---|---|---|---|
| R1-G01-I-01 | **TOOLING_BLOCKED / P0** | 固定 A #81 旧工作区未具备每条 `studentScope`；把它直接与 student-field targets 编译 → `D2_STUDENT_UNSCOPED_CHECK`，不能称为 G01 49 项都已动态执行；需 A′ 逐项映射并给出覆盖账本 | A′/D4 |
| R1-G01-I-02 | **TOOLING_BLOCKED / P1** | 任意 `advanced.evidenceRelations` 非空仍 → `D2_UNMAPPED_ADVANCED`；仅支持每 Subject/字段版本精确绑定的有限一证多事实；多文书复杂 Claim 图和法律替代性真值未实现 | D3/R2 |
| R1-G01-I-03 | **TOOLING_BLOCKED / P0** | 实际校方在校注册底账、招生数据、电子注册、签发机关和学院签署未接入认证/撤销接口；`controlled-synthetic` 不能视作校务权威，学生上传不能替代后台事实 | 校方授权接口/校务数据治理 |
| R1-G01-I-04 | **POLICY_HOLD / P0** | C01 2019 本科条款现行性、C02 2022 留学生规定现行性、C03 2024 研究生全文及角色/表单；`policy-candidate` 不可宣称本校有效 | 独立政策 E+学校正式授权 |
| R1-G01-I-05 | **TOOLING_BLOCKED / P1** | 13 条 S01-S13 原文分支和本科/研究生/来华/双路径等全矩阵尚未迁移，R1 仅证明两个字段 × 两个合成 scenario 可运行；S12/S13 需真实分流/旧错误例外 | A′/D4 产品 |
| R1-G01-I-06 | **TOOLING_BLOCKED / P1** | P0–P7 校务工作流的独立 Stage 事实、后续部门履责/权限、正式拒绝前先后顺序仍非校方受控数据；目前只用已有 `CaseStage` 和 `provider` 门禁 | D3/R2+校务流程 |
| R1-G01-I-07 | **TEST_LIMITATION / P1** | 固定 B r02 私有 Gold 无权访问，28 案运行/交叉比对未执行；不得称完整业务 PASS | 独立 C′、B 权限隔离 |
| R1-G01-I-08 | **TEST_LIMITATION / P1** | 在线模型语义漏检率、未知证据真实性、政策冲突准确性未测；合成 Pi 工具回执不等于 LLM 业务金标 | 独立 E/系统测 |
| R1-G01-I-09 | **TECHNICAL_REVIEW_PENDING / P1** | 尚未获第三方锁定 SHA/发布签署，Draft PR 不允许合并到冻结 release；如果 AGENTS/README 的全局版本文档要同步变更须先取得维护者批准 | 技术集成负责人 |
| R1-G01-I-10 | **DESIGN_LIMIT / P1** | 来源 `sourceKind` 字段是合成模拟受控标记，未做密码学签名/主体认证；技术测试不能宣称可信真实生产身份 | 安全/权限工程 |
| R1-G01-I-11 | **DESIGN_LIMIT / P2** | 旧 schema1 学生信息没有无损自动升级规则：不迁移 49 项 case 规则；需通过 A′ 显式修订、重新预览/建案（禁止原案静默升级） | 迁移/作者态 |

最小复现都在本仓最新 `review-d3-r1-student.test.ts`、`review-d2-execution-gates.test.ts`、`review-d3-handoff-cli.test.ts`。**禁止**以删除未解决任务、向模板补假政策或复制 Gold 的方式关闭。
