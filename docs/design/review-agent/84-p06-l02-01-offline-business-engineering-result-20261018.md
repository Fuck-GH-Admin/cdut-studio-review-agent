# 84｜P06 L02-01 离线业务工程差分结果（2026-10-18）
> 工程开发证据；不是 LIVE 放行，也不修改 29 号唯一 LIVE 台账。本文件和配套 evidence 属于 PR #121，父版是冻结 #118。

## 结论与工程范围
本轮对 E02 人工业务决定及角色授权、E03 补件回复/新旧输入/批次回流、E04 逐批授权/批次定稿/outbox 进行了现有代码与回归差分核对，并针对复现的缺陷进行了受控修复。候选代码父提交为 `2ca0f37ade153f307b2b72077c7a3f9bfaf1c2d9`（tree `4d2b7f7e75a4104a54b9adfc3b2ccfae278cec19`）；文档提交会改变最终 HEAD，必须以其独立 CI 判词为准，不得沿用旧 SHA 绿灯。最初接手 #121 `095a00f6` 的四项 CI SUCCESS。#118 的 U1 验收活动为 CLOSED_SCOPED_PARTIAL。

当前签收等级：**E02/E03 = OFFLINE PATCHED / FINAL-HEAD CI PENDING；E04 = NO_CHANGE_WITH_EXISTING_COVERAGE / FINAL-HEAD CI PENDING。L02-01 LIVE NOT ADMITTED；P06 PARTIAL；MERGE NO-GO。** 真实 Provider、A/B/C、真独立满卷跨 PID、GUI、Relay/Pocket 后续统一验收，不能借本轮离线结果签收。

## E02：已有缺陷、修复及保留风险
- 直接调用 `decideWorkspaceCaseV2` 的非 reviewer/local 学生可提交驳回；普通 Agent 仅靠全局 `reviewAgentAutoApproval` 能绕过逐批授权；本地 reviewer 可越过教师开放任务直接形成终态。新增三个持久事务负例，在 `0a2a318e` 的 batch CI #39138285980 **3 FAIL（原始首败）**。随后在事务内拒绝普通 Agent、验证人工来源/角色与开放任务、确认 published 模板及当前 Run 的模板锁，并保存 V2 receipt/修订边界。
- 首轮修复 `8e290cf1` 改变原工作台安全拒止的错误顺序，Review Baseline CI #39138470324 FAIL（预期业务依赖不足，实际先得到任务变更拒止）。已在 `4291a349` 恢复 readiness-first 正确诊断但仍维持审批角色门禁；batch CI #39138669206 SUCCESS。
- `stage-workflow` 原可将全局开关视为普通 Agent 的阶段签署授权。现在明确拒止 Agent、系统补件/申诉冒签；对 `system` 只保留 **有真实已完成且未过期 Run 的 auto-check 开放任务、只执行 stage-pass、必须交给下一阶段** 的技术移交，绝不允许机器终审决定。旧 `real-chain-journey` 与单案 MVP 因过强拒止产生回归，PR CI #39139316175 **4 FAIL**；已最小修正技术移交，同时补齐单案 MVP 原测试中缺失的 system→reviewer 阶段步骤。
- **重要未消除范围**：历史 `recordStageDecision` 对部分人工阶段决定仍使用 `run@rev...` 合成 `basedOnRunId`；该路径尚未形成端到端实际 Run/SourceRef/可信身份凭据的正式验收。不能把这些模拟 stage 测试视为完整合法校方业务审批。后续需将最终决定与正式 Run/证据及模板锁全面约束，并做迁移和实机确认。

## E03：补件与跨批来源
- `respondSupplementV2` 原未验证提交的 `documentVersionIds` 是否是当前有效案卷材料，现拒绝不存在/退役/重复的版本，整个事务失败不写回执。新增材料版本负例。
- 同毫秒 `response.at===run.completedAt` 曾可绕过仅使用 `>` 的补件新鲜度判断，现采取 `>=` 的 fail-closed 策略，避免模糊时间顺序让旧 Run 继续正式处置；新增合成负例，真正 provider 时序仍待统一验收。
- `requeueCaseAfterSupplement` 原遍历同案的所有批次，可能将历史 `done` 错回 `queued`。本轮对同模板多批归属拒绝无来源的自动广播，仅唯一归属自动回流；针对两个历史/并发批次添加受控回归。**多个批次归属时明确选定目标批次的人工作业尚未实现**，应登记为功能缺口，不可宣称所有补件自动回流完成。E01 同 requestId 重放的旧两条正反例继续保留。
- 多补件只解除其一不回流、insufficient→再次回复→satisfied 后重审任务等既有正反例继续作为回归基线；新反例 RED 的中间版本 CI 被新推送取消，不冒称取得可独立核验的原始 RED。

## E04：差分判断
现有 `batch-automation-gates.ts` 检查 assist 默认不自动批准、全局开关+逐批明确确认+模板自动通过许可+发布政策与可信证据/当前 Run；`batch-group-action-service.ts` 使用人工 previewHash/operationId 持久操作记录与逐案 V2；`batch-store.ts` 阻断 done≠正式决定、待补件/申诉/开放任务、支持定稿快照锁和新轮次重开；outbox 以 actionId/payloadHash/WAL 保存原始重试载荷并拒绝漂移。对应测试集已存在，**本轮 E04 未认定新生产缺陷，NO_CHANGE_WITH_EVIDENCE，不额外复制引擎**。正式外部 SchoolPort 回执及异常跨 PID 的完整端到端仍未运行，不能签 LIVE；人工 assist 模式的独立定稿流程亦需后续确认产品意图与入口。

## 证据入口、候选状态
- 脱敏材料与逐提交命令账本：[acceptance/p06-l02-01-offline-r01](acceptance/p06-l02-01-offline-r01/README.md)。
- E01 代码固定 `3b3e52c0...` 四 CI SUCCESS：4016 PASS / 5 SKIP；批次 143 PASS。历史 E01 首败两轮均保持只读。
- E02 RED #39138285980（3 fail），兼容性 RED #39138470324、全仓四 FAIL #39139316175 均保留。最新代码父提交 `2ca0f37ade153f307b2b72077c7a3f9bfaf1c2d9` 聚焦 CI #39139858746 SUCCESS；在写本文时其 PR CI、Review Baseline、D2 队列尚未给出可签 SUCCESS。**需要核验最终文档提交的四项 CI**。
- AGENTS.md 要求功能变更更新 README/AGENTS 但须先经用户许可；本轮未擅改，84 号与 PR 证据记录变更，正式文档同步列为待授权工作。

## 统一验收及放行边界
不重启 #118 U1；真实 Provider tool-use→Main gate→V2 receipts 与 A/B/C 因凭据/环境阻断，独立安全小测试卷满卷/跨 PID、真实业务 UI、Office 上游 #71、Relay 多 viewer、Pocket FIFO 尚未签收。29 号永久 LIVE 台账与 Gold、#118、历史 RED、上游全部只读。保持 `P06 PARTIAL / L02-01 LIVE NOT ADMITTED / MERGE NO-GO`，不合并、不启动 P07/P08。