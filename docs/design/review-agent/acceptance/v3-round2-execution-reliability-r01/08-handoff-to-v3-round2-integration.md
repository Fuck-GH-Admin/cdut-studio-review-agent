# 08｜移交 V3 第二轮集成：2C 证据裁决、阻断与接口问题

## 基线和审计独立性

- 仓库：[`Fuck-GH-Admin/cdut-studio-review-agent`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent)。
- 第一轮 Draft [#133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/133)，固定 head `ff5e1068b99dc2aa41f53c692cd0e44a2e7ca071`；第 1.5 轮 Draft [#134](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/134)，固定 head `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`。重点读取 #134 `02/03/04/05/07/08`，核对 #133 提供的 lineage/risk/handoff；沿用能力 ID 和原 evidence status，不把历史意见自动提升。
- 固定证据：main `8989941b6fb5651564e32d11c4215b6a6d5a5209`，D2 `56fa52a5173dfd5acd75af52f63d821ed9d5cf47`，D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`，P06 R02 `c23789882aabf18689c314c77c270ac4a8ae4729`，P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`。本轮通过 GitHub 连接器读取完整文件/指定区间，固定每项可获取 blob SHA；没有读取新 main 代码并作为已验收基线。
- 独立审计分支：`audit/v3-round2-execution-reliability-20261019-r01`，直接从**固定 main SHA** 创建，只增 `docs/design/review-agent/acceptance/v3-round2-execution-reliability-r01/` 八个证据文件，不改生产码，不复用 2A/2B 可写树、不合并 PR。
- **实际环境阻断**：`git ls-remote` exit 128（DNS 无法解析 GitHub），`bun` 缺失 exit 1；只能远端 API 只读源调查与 docs-only 提交。**未建立本地工作树，也没有运行仓库测试**；这一状态不符合工程实测，必须按 `NOT_RUN` 传下去。日志和 SHA 详 05 文件。

## 第二轮必须能够回答的 7 个问题：2C 回答

1. **当前有几条单案执行路径？** 按 Run 写入驱动 **2 条**：`runReviewCaseV2` 审核图、`pi-case-review-service` 直接 Pi；按用户入口至少 **3 类**（审核图、普通 Pi、后台 Pi），批量复用前者、后台复用后者；异步 IPC/Agent 工具提供其他接入方式。D4 导入批次不是审核运行器。详 01。
2. **哪些 Pi 属通用适配、哪些属审核业务？** 通用：模型协议、实际 tool_use/回执、max-turn/abort、deadline/CompactContext、安全 tool callbacks；审核业务：Check 计划/目标/证据、deterministic 核验、submit 的 accepted/rejected/missing、模板/规则锁、覆盖和 readiness。所有真实业务决定仍在 case-store-v2。详 01/06。
3. **后台 Owner 的不可替代价值？** 隔离普通 Agent 工具/会话/文件，Main 独占运行权 ACK、显式用户 turn 指派、撤权和 stop-wait、删除 tombstone/UUID fence、终态业务投影。这是运行安全边界而非“隐藏 UI”。详 02。
4. **批量如何复用单案？** BatchCaseEntry 绑定特定真实 `(caseId,runId)` + 模板政策/当前输入，调用单案图；批次另外持有调度、补件选择、group/manual、opt-in automation、snapshot/outbox。不能以 Case latestRun 取代 Batch 归属。详 03/04。
5. **D4/P06 哪些重复？** D4 batch 是一案多个材料的受控导入，P06 是多案审核队列，不重复；D4 submit repair 与 P06 requiredToolKeys 互补；可统一 manifest、CheckKey 和证据/失败合同，不能删 Owner/权限双重检查。详 06。
6. **严重未关闭风险？** 首选调查 `BAT-06`：R02 `runId+runInputHash` 到 R03 `runId+live input check` 的不等价，尤其 **finalize 未显式要求本批 Run=最终决定 basedOnRunId**；`BAT-04` 自动决定内层 gate 缺 exact run binding 候选。其次 `BG-07/EXP-07` 容量不足终态/授权跨 PID、`EXP-05` 真实 Provider tool_use 尚无证据。均为**静态风险或历史阻断，不是本轮漏洞利用证明**。详 04/05。
7. **哪些安全实验进入永久回归？** provider tool_use/Host/Main/tool receipt、拒 Bash/MCP/跨根、after-await revoke、24 轮 missing+rejected、9 Check/200 差额、P02 删除迟到、Owner 备份回滚、Office 同名串源、ENOSPC+跨 PID、Batch A/B Run 错绑、人工/CAS/出站重复回执。详 05。

## 给第二轮集成 Agent 的“证据 → 决策”接口问题

| 提案议题 | 来自 2C 的可证明事实 | 仍需 2A/2B 联合确认 | 禁止预先决策 |
|---|---|---|---|
| `ReviewRunContract` | Graph/Direct 都落 V2 Run，但执行完成判定不同 | 2A Case 阶段/裁决/任务和 2B template/SourceRef 的权威输入 | 不能宣布整个 Run 必须只用一种 Runner |
| `CheckPlan`/`SubmissionAttempt` | Pi 必需 keys 与 accepted/rejected/missing，coverage 不计失败 | 2B 动态模板 check×target、groupKey、图像块来源版本 | 不按模型自然语言直接创建最终符合判定 |
| `OwnerCapability` | Main 执行 token + UUID journal + assignment + strict tools | 2A 工作台“暂停/继续/撤权”的用户权限边界 | 不拆掉持久 deny ledger/owner tombstone |
| `BatchAttemptIdentity` | P06 Batch 独立状态；R02 双指纹、R03 仅 runId+current hash | 2A 正式决定是否必须属于本批次；2B 模板策略冻结和跨版本升级 | 不以 latestRun 替代 batch attempt；不做隐式 Batch 历史回填 |
| `DecisionAuthority` | Agent 不可签最终决定；system actor 需批次策略；学校仍需真实授权 | 2A 单案/批量终审对照、校方身份与角色模型 | 不从模型 Run `completed` 推导“批准” |
| `SourceInspectionReceipt` | 直接 Pi 能记录真实 read/preview 和继承未改版凭据 | 2B 多格式原件真实 hash、解析修订和样例图片稳定索引 | 不把图片展示当逐块全文读取 |
| `OutboxReceipt` | persistent actionId、payload 和 mock/offline 适配 | 2A 校方业务动作; 2B 真实来源/导出标准 | 不把 mock accepted 说成校方业务 API 成功 |
| `LegacyRunCompatibility` | 虚拟 `run@rev` 与真实 Run 区别明确 | 2A V1/V2 历史决定归档，2B 旧模板输入映射 | 不制造“旧运行已验证”的兼容替身 |

## 按优先级排序的未验证负例（建议集中测试而非逐点碎片化）

**Gate A：离线确定性回归（每案多步但一次运行）**

1. 单案 V2 图：9 个 Check 丢第 9 个；按规则分项/组逐项统计；故意提交错误 quote、跨案 blockId、数字差额 200；同 Check 先拒后补交；一项 `execution-failed` 不合格。
2. 两个 Batch 共用 Case/模板但不同 Run；旧 Batch 执行 triage、automation、group、finalize 全链（含旧 `done` 无 runId、另一批更晚 Run、after preview input revision changed）。单独执行受控 `decideWorkspaceCaseV2` 的 system actor 内层拒止。
3. 一项先成功、另两项失败，补件/手动选 Batch、定向重试、同 requestId 双提交、stop→restart 的 Run/BatchCaseEntry 回放，检查历史未改写。
4. Outbox `pending` 持久化后写入故障，actionId/payloadHash mismatch、重启 replay、未证实外部状态保留未确认。

**Gate B：真实 Electron/Main/受控故障实验**

1. 从 Renderer preload 正式入口建立 Owner，离开页面仍可查询同 runId；normal desktop/remote 的 session list/send/stop/metadata 不能影响该 owner。
2. Provider 未接通条件下先只跑 SDK/Host 合成工具回调；故意 Bash/MCP/path traversal/symlink/incorrect case; 在 `await inspectOriginal` 中 stop/revoke 并确认无迟到 read receipt。
3. 在每个关键写点注入 `/dev/full` 或隔离卷 ENOSPC；跨 PID crash-restart 确认旧 Running 无授予、终态不假成功、Outbox 不重复推送。保留失败首因与 log SHA。

**Gate C：授权后独立 LIVE**

1. 专门授权的测试 Provider 实际 `tool_use`—Host gate—execute—return—Run SourceRef；不把 SDK profile 查询代替 provider 调用。记录模型通道、请求 ID、样例匿名 hash，严格删凭据。
2. 校方 SchoolPort 真联调须另得授权、测试账户和明确外部版本；在此前全部 `NOT_TESTED_REAL_SCHOOL`，避免真实写入。
3. 如无上述条件，2D 集成可以进行静态架构讨论，但**不允许把对应能力标为 PASS/LIVE-ADMITTED/可合并发布**。

## 2C 交付文件与字段解释

- 01 单案真实执行入口/graph/check/input；
- 02 Owner、严格工具、生命周期与残存危险；
- 03 D4/P06 差异，BatchCaseEntry/triage/group/automation/outbox；
- 04 R02/R03 安全绑定非等价、终审/出站权威；
- 05 实验来源、命令/退出码/环境阻断与永久负例；
- 06 重复 vs 互补，建议讨论的分层接口；
- 07 机器可读 **29 行**矩阵，`source_fixed_ref` 表示所在代码快照，`source_blob_sha_2c` 为空则表示 2C 未单独固定 blob，`source_inspection` 可为 PR134 转入，`test_blob_sha_2c` 有值仅证明测试代码已查阅，`test_executed_2c=NOT_RUN` 对每行一致，`evidence_status_inherited` 不代表本轮通过；
- 08 本交接。

**最终审计判定**：SOURCE_REVIEW_COMPLETED_IN_SCOPE（核心调用图、分支差异、29 IDs 的定位），`OFFLINE_TEST_NOT_RUN`，`ELECTRON_NOT_RUN`，`PROVIDER_BLOCKED_NO_AUTH`，`TRUE_ENOSPC_NOT_RUN`，`REAL_SCHOOL_NOT_AUTHORIZED`，`V3_ARCHITECTURE_NOT_DECIDED`。不变更 D4/P06 历史交付或第一、1.5轮及 2A/2B 独立分支。
