# 90｜P06 L02-01 R02 第三批：批次专属 Run 归属与定稿证据（2026-10-19）

> **工程实现与回归合同，不是 LIVE 验收报告。** 与 88/89 号文档同属 Draft PR #131；基础 #127 `bc228f64750714e70c73cbd115d2f169c610a517`，PR #130 的 29 项实测和 29 号权威 LIVE 台账均保持只读。不得把本轮类型检查/离线事务 PASS 替代正式 SchoolPort 授权、E05 LIVE 或 P06 放行。

## 一、缺口及安全目标

旧实现对同案多批次（包括**相同 templateId/version**）在 `BatchPanel`、`batch-automation-service`、`batch-group-action-service` 与 `retryBatchCases` 中读取最近一次案例 Run。此 Run 可在另一批次执行后产生，无法通过仅对比模板版本区分来源。自动通过和人工组操作有机会引用非目标批次的结果。

新原则：**批次队列项自己证明“本轮执行的是哪个 Run、运行输入指纹是什么”；不得从案例级“最新”猜测批次历史。**

## 二、本轮实际落地

- 共享 `BatchStateV2.cases[]` 追加可选持久字段 `runId / runInputHash`，兼容旧记录序列化与读取，但**无绑定的旧记录不能自动获得业务动作资格**。由产品 `RUN_BATCH_V2` 在真实 Run 返回时提供 `run.id / run.inputManifest.hash`；`runBatchQueue` 在完成状态与绑定数据一次原子存储中记录。
- 即使注入执行器报告 `completed`，若无有效 64 位输入 SHA-256 和明确 Run ID，单案以 `failed` 持久化，不能虚报 `done`。异常单案仍不拖累其他案卷。正常失败并已提供可靠 Run 的，可保留归属供技术定位。
- `validateBoundBatchRun` 检查批次成员、绑定 Run ID、caseId、templateId/version、manifest templateVersion 和 inputManifest.hash，缺任一来源即返回未确认。其 Main 业务调用从 `getRunV2(caseId, entry.runId)` 精确读取；人工组预览及提交前再次验证，自动化只对绑定 Run 做 triage、readiness 与事务。
- Renderer 读取案卷运行历史，在选中批次的队列项上**按已绑定 Run ID**查找，不再以“最新 Run”代替；缺失/错配时提示不可使用该 Run 作为批次结论。执行后通知里的 triage 同样取批次绑定。
- 补件完成重新回流、失败重试或人工重新排队时，清除旧 Run ID/哈希，下一轮必须取得真实新回执；**另一历史批次既有绑定不可连带改写**。
- 批次自动定稿增加双向校验：已形成的最终决定 `basedOnRunId` 必须与当前批次队列绑定一致，还要验证绑定 Run 真实可读、输入没有变旧。自动定稿快照带 `runId + runInputHash`；既有不可变快照/哈希、重开新批和 Outbox actionId 原载荷幂等实现保持原样。核心 `assertBatchBusinessReadyForFinalization` 对存在绑定的条目也校验 final decision 引用，不允许错误批次定稿。
- 不重新造 Pi 引擎，不增加权限身份或补签历史，没有对 #130 源数据推测的模板记录冲突自动回填。

## 三、离线测试覆盖和历史兼容策略

1. 两个同案同模板批次分别跑 Run-A/Run-B，状态各自记录，后运行不会覆写前一个。
2. 本批次无完整 Run ID/哈希即失败；错误的案卷、模板、manifest、输入哈希，不能通过 `validateBoundBatchRun`。
3. 无绑定的旧 `done` 行不能从案卷最新 Run 自动得到资格；执行过程中重排/补件时清除旧绑定。
4. 自动化和人工分组处置的已有合成夹具写入真实已保存 Run 的 ID/hash；未因收紧来源校验而绕过旧业务门禁。
5. 修改 final decision 指向另一批 Run，自动定稿必须拒绝并保留 queued、不可伪造快照。
6. 现有定稿/重开和 Outbox 重启去重回归保留；**不在本轮执行 ENOSPC 或真外部 Port**，不声称外部回执已签。

历史已完成批次若缺 `runId`，不能单凭最新 Run 自动补写，必须经过授权人工辨别原始命令账本或重新创建/重跑隔离业务批次后再做依赖该 Run 的操作。旧定稿快照保持不可变，不会偷偷回填。

## 四、验收与残余边界

PR #131 本次源版本以提交后的**最新完整 SHA**为准，四项 CI 必须逐一确认，不借用旧 SHA 的绿色结果。产品真实 Main/Preload/Renderer 的执行/断电恢复、统一 E05/A/B/C 与 E06、学校身份、原件 SourceRef、Outbox 外部 ACK 在下次集中实机检查前仍为未签。

待后续离线开发：同一案例从 V1→V2 投影更改模板后的合法迁移路径、正式人工决定更完整的阶段/来源约束、已有未绑定历史数据的安全升级向导、Outbox 对接真实 SchoolPort 的幂等签收，以及旧 C 的 24 轮耗尽根因。

**当前状态不变：P06 PARTIAL / L02-01 E05 LIVE NOT ADMITTED / E06 LIVE PARTIAL / PR #131 Draft / MERGE NO-GO / P07–P08 NOT STARTED。**
