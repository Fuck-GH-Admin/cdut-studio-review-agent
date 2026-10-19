# 07｜第三轮 Agent 交接

## 需要带入的固定事实

1. **归档与正式决定**：D4 在真实替换/移除入口后把旧 Observation 标为未确认并拒绝旧 EvidenceLink，冻结 Plan 不变。P06 R03 归档后 Observation 仍确认；服务级反例在 harness-only aggregate mutation 和合成 current Run/adjudication 前置下调用真实决定函数，输出归档 V1 的旧分值 4，普通 UI 到该设置的路径未证。先把历史事实保留与当前可用性分开建模。
2. **身份**：P06 Main 直接传递 renderer actor 的四个写 IPC 已实测接受并持久化伪造 school/teacher Receipt。把身份派生放 Main sender/可信登录上下文；角色和命令权限逐类型验证。Actor 字段不能承担身份认证。
3. **批次**：R03 自动路径仍选择 entry-bound Run，R02 的 helper/回归也保留了更严格的 finalizer 预期；但 R03 public Main finalize 和低层 finalizeBatch() 实测允许 entry.runId 与 decision.basedOnRunId 不匹配或 entryRunId 缺失仍定稿。绑定必须在最后写入事务再次核验。
4. **合同差异**：D4 generic-object 与 conditions schema 和 P06 archive/scenario schema 不兼容。不要把两条不相同的输入路径描述成模型质量 A/B。
5. **Git**：完整四组 diff 和 PR #97 path/blob 比较在 02-git-lineage-and-asset-delta/。helper 文件是否存在与语义是否保留分开核对；#91 的 14 个同路径差异需逐项语义复核。

## 建议的下一轮门禁顺序

1. 先确定统一写权威和 DTO：CaseId + expectedRevision + commandId/payloadHash；冻结 Plan fingerprint/CheckKey×target/conditions/source version；把 SourceRef/Evidence 的历史保留与有效性分层。
2. 定义可信 Main Actor provenance 与允许的 command/action 表。增加相同合成输入的 positive/negative IPC 集成测试，检查 Receipt、revision、状态日志和 disk aggregate。
3. 定义 BatchAttempt 身份并将 case/templateVersion/runId/inputHash/decision.basedOnRunId/revision 在 finalizer 事务内强制相等；从真正 Renderer/Preload 确认 finalize-completed 是否可被正常界面调用。
4. 重新跑 D4/P06 L1-01 同构 fixture；正式决定必须证明旧 observation 不会迁移到新 current Run。D4 结果可作为目标不变量参考，不把 D4 代码直接并入 P06。
5. 再进入 Run/Outbox、申诉身份、Office same-stem 权限和 UI/history 迁移验收；L1-07 owner 撤权单独覆盖。

这些是应冻结的业务与安全不变量，不代表选定方案 A/B/C。Provider、学校接口、真实材料和真实账户仍在本轮范围外。

## 可复现性索引

- 报告内：筛选后的合成 JSON、完整 Git diff、CSV 测试矩阵、日志 SHA256。
- 私有本机原始日志：/home/miku/Bot/CDUTStudio/.workdir/v3-evidence-profiles/。
- 新增 test-only harness 文件的路径及 SHA256：08-test-only-harness-index.md。这些文件只在隔离固定 SHA worktree 中，不包含在产品树或报告 PR；运行前应将对应文件放入该 SHA 的 apps/electron/src/main/lib/review/ 并使用独立 profile。
