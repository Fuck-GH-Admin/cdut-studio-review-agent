# 08｜第三轮必须明确裁决的架构问题

本轮**不作最终裁决**。下列问题均绑定源码与能力 ID；若不定，第三轮的三个并行开发会话会发生不可安全合并的接口/owner 冲突。状态为 2D 静态调查与现有专项交叉结果。

| 问题 | 当前证据与关联冲突 | 必须明确的第三轮交付合同 | 审批前证明 |
|---|---|---|---|
| Q01 谁写 Case 当前输入、旧 V1 case.json 是不是只读？ | 三条建案路径/双 rev：ARCH-001/018；CASE-01/02 | CaseAggregate写 owner、命令 CAS+重放、V1只读迁移及回滚 | A01+B08 |
| Q02 D2 Plan/Subject/CheckKey 的唯一权威在哪里？ | D4 fixedD2而P06没有：ARCH-002/005 | `PlanId+fingerprint+CheckKey×target+conditions` 与新旧映射版本 | A02+A13 |
| Q03 MaterialVersion、SourceRef、confirmed Observation 谁负责失效？ | D4/P06 archived差：ARCH-003/010/012 | 失效图和原始Evidence不可变/当前有效性分离 | A03+A16+B03 |
| Q04 Main可信Actor怎样绑定不同命令？ | renderer input.actor与bindLocalReviewerCommand共存：ARCH-004 | sender→identity→role→allowed command/action的统一模型 | A11+B01/B02 |
| Q05 Graph Run / Pi direct Run 是否必须合并Runner？ | 2C 两个Run writer、三类入口；ARCH-006/013 | 共同 RunEvidenceIdentity/manifest/check/read契约；允许不同Runner但不得不同完成定义 | A04–A07+C01 |
| Q06 批次属于自己的 Run 如何冻结与定稿？ | R02双指纹 vs R03 runId+当前hash：ARCH-007/008 | BatchAttempt identity、snapshot冻结时校验basedOnRunId、旧done处理 | A08/A10+B05 |
| Q07 自动处理的内外权限必须各验什么？ | 内层 `checkAutoBatchAction` 未核 exact绑定候选：ARCH-009 | preview/apply/transaction重验 policy/run/case/actor CAS | A09+B05 |
| Q08 两类 batch 是否独立？ | D4材料导入 vs P06审核批次：ARCH-011 | 独立DTO/状态机/执行命令名/权限，不可含糊复用 | A15+A08 |
| Q09 模板版本升级能否修改旧案？ | D3 digest/ACK + D4 lock：ARCH-015/020 | 新Plan需明确签认；旧Run/Source/Check不可改写 | A13/A14 |
| Q10 人工/校方审批、评分与申诉角色在哪里校验？ | `RESOLVE_APPEAL_V2` reviewer/teacher失配：ARCH-014 | actor role provenance、旧 run@rev迁移、审批授权与回滚门禁 | A11+C02 |
| Q11 Outbox 何时可宣称真实成功？ | Case CAS、Snapshot与Outbox非同一事务：ARCH-016/017 | idempotency+payloadhash+回执可信级别、异常重放及对账 | B04/B08+C02 |
| Q12 V1三栏/Source focus/历史Run如何保留？ | UI-01..06/CASE-12/RET-02：ARCH-018 | UI读模型、历史只读 adapter、确认/待办区别与GUI验收 | A18+B07 |
| Q13 72项中谁验收、谁迁移、谁只留测试？ | 01中仍21 UNKNOWN +4 BLOCKED | 按每ID明确 owner、取舍、迁移字段、正反例、验收门槛 | 72项签名矩阵 |
| Q14 R02修复和G01..08移植是否真有血缘？ | R02 helper缺于R03、#97 575 文件且compare截断：ARCH-020 | git cherry/patch-id、blob清单、semantic obligations逐条比较 | 04本地命令+资产报告 |
| Q15 采用A/B/C哪一种收敛？ | 06表显示各有技术/保全/回滚风险 | 模块所有权图、依赖DAG、迁移顺序、可回滚方案与三个会话接口 | 不得选型后再定义72项验收 |

### 先后顺序与否决条件（提案，供第三轮确认）
- **先定数据权威与安全边界**：Q01–04、Q06、Q10、Q11；它们决定任何方案的写入和审批正确性。
- **再定 Plan/Run/Batch 与模板合同**：Q02、05、07–09；禁止多个开发会话分别发明近似对象。
- **最后才定工作台与迁移规模**：Q12–15；历史能力不能因界面重写而删除。
- 如果无法证明 archival observation、cross-batch finalize、Actor来源三个P0候选的 fail-closed 行为，第三轮**不得签署可上线/真业务自动决定**，即便能开始离线设计/开发。
