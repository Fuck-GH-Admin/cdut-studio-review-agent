# 05｜V3 四种收敛路线比较、正式候选选型

**决策类型：CANDIDATE_SELECTED / NOT_IMPLEMENTED / NO_RELEASE**。权威依据：#134 72项、#135–138静态调查、#139 L0/L1执行证据与主产品00/02/03/04/14。仍不对真实业务发布。

| 维度 | A：增强V2 CaseAggregate/CAS | B：重抽V1/V2共享合同 | C：重建核心 | 受约束混合（选定） |
|---|---|---|---|---|
| 业务表达 | V2 Subject/Observation/Task/Appeal/Rating真实业务语义较全，需D2多对象 | 可同时保V1人机流程，风险为最低公分母 | 最灵活但容易遗漏旧高级能力 | V2业务对象 + D4 Plan/Source + P06执行适配，不重造域名 |
| 72项保全 | V1三栏、D3规则、Owner需逐项移植 | 理论易承接但适配层过多 | 72项遗忘风险最大 | 02逐项一责一测 + 历史read-only适配 |
| 当前写权 | V2最自然单一owner | 如旧V1写还在则隐藏双写 | 新owner需全迁移 | 只允许Dev-C命令→V2 aggregate，legacy只读 |
| 安全边界 | 直接复用P06 actor危险 | 所有适配处重复身份风险 | 重做授权风险 | Main binding重建+领域二次授权，保留Pi多层防御 |
| Run/Batch正确性 | 需加源身份和终写栅栏 | 抽接口不能代替事务 | 可设计最干净，但全量重测 | Run identity统一+finalizer事务强约束 |
| 模板/旧案迁移 | V2迁移相对可控，旧run和V1字段需shadow | 兼容面过宽 | 新schema高风险 | 版本化Plan迁移+旧V1影子读+旧run只读 |
| 审计/回滚 | CAS已有Receipt，跨文件不原子 | 需要强迁移日志 | 新WAL一开始无可信回归 | 保留CAS算法、增加commit-intent/对账恢复与tombstone |
| 工程与维护 | 少量迁入但旧分支合流冲突大 | 长期适配巨大 | 重写最重 | 初期适配工时可控，兼容层有明确退役门槛 |
| 可靠性测试 | 旧CAS有选定测试 | 适配矩阵大 | 必须重建全部测试 | 旧测试迁移+持久负例+新合并快照 |
| GUI/Provider发布 | 均未通过 | 均未通过 | 均未通过 | 明确三类独立门禁，无任何LIVE签名 |

## 选定：增强 A + **边界重构**，不是第四套业务系统

1. **唯一当前业务权威**：在 `case-store-v2.ts` 的 Aggregate/CAS/Receipt 语义上收敛、经整改后的CaseApplicationService由Dev-C维护。唯一写入接口是Main可信Principal下的类型化CaseCommand。底层数据继续用既有CaseAggregate语义，不先验盲改schemaVersion。
2. **各类历史最优实现保全**：V1三栏/原件定位与人工交互（读模型）、D1/D3作者DSL/来源/模块digest/升级ACK、D2 immutable target/Check映射、D4 token/ZIP/材料归档、P06 Pi Owner/受限工具/ReviewBatch、R02终审Run绑定负例。由三个Owner通过统一命令合同衔接。
3. **必须重建而非覆写**：Main Actor可信身份来源、Plan版本适配、Source有效性级联、Batch最终定稿事务、跨文件Outbox/Run commit/recovery。新组件是原V2应用服务边界的责任层，不维护独立的CaseV3.json或另一个当前事实状态机。
4. **Run承认多个执行适配但一个持久真值**：Graph/Direct/Background/Batch都产生同一种CanonicalRunEvidence，Dev-C独占Run持久提交。Dev-A只产生授权执行事件；Dev-B只产生编译Plan和来源描述。
5. **schemaVersion纪律**：先维持兼容的`schemaVersion:2`；若冻结Plan/tx journal实质改变持久合同，必须以显式迁移版本、前后hash/回滚和旧案测试证明才升级。字段别名升级不能凭“V3”名称强行改号。

## 反证与设计失败条件

- 如果V2聚合无法在完整评分、回避、申诉、多Subject/Check×target之下维持一致CAS与历史不可变性，则暂停复用，转向C的**局部**核心重建，并重新评估迁移成本；不是悄悄生成第二套当前案卷。
- 如果跨PID写故障、Outbox replay和Main真实teacher授权不能在选定结构下实现fail closed，则禁止上线，允许继续离线开发和目标机探索。
- D4归档负例、P06伪Actor、finalize错Run只要任一在新实现重现，选型视为 **工程NO-GO** 而非可先放行的已知问题。
- 若迁移导致V1三栏、评分/回避、补件、申诉、报告/离线包消失，72项验收不签字，不能以“简化工作台”辩护。

## 集成起点

**代码工作树以固定main `8989941b6fb5651564e32d11c4215b6a6d5a5209`为首个工程集成起点**，理由是V2 CaseAggregate/CAS在此有已知原始语义，P06 R03是其后继但含归档/Actor/finalize复现失败；D4 W1与main分叉，不能将其最新HEAD当作有序上游。只移植所需函数/行为并附旧新同构测试。后续的main增量另建报告，不静默替换固定样本。

审批前至少核查实际Dev-C设计合同与四个永久故障反例转绿；设计候选签字不等于工程合格。