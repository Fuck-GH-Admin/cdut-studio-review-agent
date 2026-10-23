# 06｜对第三轮架构裁决的影响

本报告补充固定 SHA 的执行事实，不替第三轮选择 A/B/C。状态回答的是本轮能证明什么。

| #138 Q | 本轮结论 | 状态 / 证据 | 仍待证明 |
|---|---|---|---|
| Q01 Case 当前输入唯一写权威、旧 V1 只读 | M 的 case-store-v2 stale CAS / replay 选定回归在基线通过；本轮没有做完整三入口写 owner/迁移回滚 | PASS_SCOPED，L1-06 | 全路径 CaseAggregate owner、V1 写隔离与回滚 |
| Q02 D2 Plan/Subject/CheckKey 权威 | D4 保留完整通用多 target/condition；P06 schema 拒绝 D4 generic-object，并在旧 archive prompt 缺 full contract | VERIFIED_STATIC + PASS_SCOPED / BLOCKED_SCHEMA，L1-05 | Canonical DTO、Plan 版本映射与跨 schema 同输入测试 |
| Q03 MaterialVersion/SourceRef/Observation 失效 | D4 撤销旧 Observation 确认；P06 归档后仍 confirmed，且 test-only state setup 后的服务级探针调用正式决定函数时消费旧值 4 | D4 PASS_SCOPED，P06 REPRODUCED_FAIL，L1-01 | live UI 全路径、真实业务规则及部署范围；需阻止正式放行 |
| Q04 Main 可信 Actor | P06 四条 Main handler 持久化 Renderer 提供的伪造 school/teacher Actor | REPRODUCED_FAIL，L1-02 | live Electron sender/frame 与生产身份源；统一 sender→identity→role→command 门禁 |
| Q05 Graph Run 与 Pi direct Run 是否合并 | 本轮选定 Run/Pi 回归未发现所覆盖的假完成；没有合并 runner 或统一全部 writer | PARTIAL，L1-06 | 统一 RunEvidenceIdentity、manifest/check/read 完成定义；是否同一 runner 由架构组裁决 |
| Q06 BatchAttempt 冻结与定稿 | R02 有错批 Run 保护；R03 正常自动路径保留精确绑定，但 Main finalize 和底层 finalize 可错配/缺失仍定稿 | REPRODUCED_FAIL + PASS_SCOPED，L1-03 | live UI action、事务内 entry/decision Run 与 hash 的最终绑定检查 |
| Q07 自动处理内外层授权 | 所选 R03 自动路径绑定 Run；finalizer 反例证明不能把自动路径安全外推到最终定稿所有入口 | PARTIAL，L1-03 | preview/apply/transaction 的 policy/case/run/actor/revision 重验矩阵 |
| Q08 两类 batch 是否独立 | 静态接口显示 D4 材料导入批次和 P06 审核批次是不同对象/状态机 | VERIFIED_STATIC，L0 | 统一层 DTO 与命令命名；本轮不合并实现 |
| Q09 模板升级能否改旧案 | 替换材料时的 Plan 差异已测；独立模板版本升级/ACK 不在本轮测试 | PARTIAL，L1-01 | 新 Plan 明确签认、旧 Run/Source/Check 保持只读的完整迁移用例 |
| Q10 角色、审批和 appeal | local reviewer 被 teacher gate 正确拒止且状态不变；可信 school teacher 入口未证明；直传 Actor 已证明可写入其他命令 | REPRODUCED_DENY + BLOCKED_AUTH_DESIGN，L1-02 | 真实身份 provenance、角色授权、审批/申诉 GUI 与撤销/回滚门禁 |
| Q11 Outbox 成功定义 | 本轮没有执行 Case CAS 与 Outbox 原子性、异常重放或 payload hash 对账 | NOT_RUN | idempotency、payloadhash、可信回执分级及 failover |
| Q12 V1 三栏、历史 Run、Source focus | 未做 live GUI 或 UI 读模型迁移验收 | NOT_RUN | 历史只读 adapter、确认/待办区分和 GUI 验收 |
| Q13 72 项能力的 owner/迁移 | 本轮只跑少量影响架构的门禁，没有签 72 项矩阵 | NOT_RUN | 逐 ID owner、取舍、迁移字段与正反例验收 |
| Q14 R02 和 #97 Git/资产血缘 | 四组分支血缘完整保存；R02 helper 语义部分保留、finalize 不变量未保留；八个原 PR 无原路径丢失，#91 有 14 个同路径 blob/mode 差异 | VERIFIED_STATIC，L0 | semantic obligation 人工复核、PR #91 差异逐项签名；path comparison 不是 Gold |
| Q15 A/B/C 收敛选型 | 发现三项必须成为统一架构边界的事实；没有足够证据在本地替第三轮做总体方案成本/回滚选择 | NOT_DECIDED | 三方案模块所有权、DAG、迁移顺序、并行会话合同及可回滚评估 |

## 第三轮现在可以开始什么

可以基于固定证据开始离线架构讨论，优先确定 Case 写权威、Canonical Plan/Check×target、Source/Observation 当前效力、Main Actor 身份、BatchAttempt/Run 身份及最终化事务约束。可并行设计 D4/P06 合同适配和历史迁移，不必等待 Provider、学校系统或完整 72 项测试。

## 当前不能签署什么

在 P06 归档 Observation 可进入正式决定、伪造 Actor 可落入 Receipt、批次错 Run 可定稿三个负例没有被实现层约束并重新验证前，不能把固定快照签为可上线的真实自动业务处理。local reviewer appeal 被拒且可信 teacher 入口未知，也不能签署申诉业务闭环。L1-07、Outbox、live GUI/Renderer/Preload、真实校方身份、Provider 与真实 Office 权限仍是后续门禁。
