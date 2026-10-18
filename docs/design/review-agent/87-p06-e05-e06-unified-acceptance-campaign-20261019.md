# 87｜P06 L02-01 E05 + P06 E06 集中实机验收总方案（2026-10-19）

> 本文批准的是**测试执行方案和证据归档办法**，不是产品/业务发布。E05 与 E06 是两套不同合同；允许共用一台主机、一次冻结、一次隔离配置和一次现场窗口，但不允许串换结论、补签历史。唯一 LIVE-01～08 权威台账是 [29 号](29-background-session-preflight-audit.md)，本轮不直接改其结论。

## 1. 候选及版本关系

- 工作仓库：`Fuck-GH-Admin/cdut-studio-review-agent`。
- 业务代码：Draft PR [#121](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/121)，曾冻结 `4f8a68e26e5276e61883fa53c21447a703bbf94d`。
- E06 QA 驱动和本文：独立 Draft PR [#127](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/127)，从 PR #121 的上述 commit 派生，包含 E02/E03/E04 离线工程和 E06 验收驱动。
- PR #118 的固定 U1 SHA `3baf1fc2ccf27607f948923dbf5aff26d984729e`、29/46/79/84 号历史文档及证据保持只读。
- 本次文档生成前 PR #127 工程 HEAD `d170d4a6522817a5c4107b21966f532f212e2c38`，其 [PR CI #39148423875](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39148423875) 为 **4034 PASS / 5 SKIP / 0 FAIL**（4039 tests / 464 files）。**写入本文后的 HEAD 会变化，现场必须选择最新 CI 成功、并被人工记录与锁定的 PR #127 SHA**。不要把旧 SHA 的绿灯用于新 SHA。
- 每个本机证据文件必须指向这**同一个完整候选 SHA、tree SHA、构建 artifact hash**，且与实际 Electron PID/CDP target 关联。发现并发新推送时停止在当前锁定版，不跨 SHA 混测。

## 2. 两套验收合同、一次资源准备

**E05｜L02-01 真实业务闭环**：E01 补件回放、E02 基于真实 Run/版本与人工权限的最终处置、E03 补件→重审及多批目标确认、E04 逐批授权/自动化/快照/出站；包含 A/B/C 独立可核查材料与失败归因。可复用 #121 代码，但尚无一次覆盖全部 E05 的自动驾驶器。必须由本机 Agent 实际运行当前生产 Main/IPC/GUI/Provider，同时独立记录 V2 账本与外部回执。

**E06｜P06 普通 Agent 不退化**：普通 Pi create/list/meta/send、实际工具回执、权限拒绝/恢复、Stop、Preview、Owner 隔离；有环境时延伸 Claude、fork/双窗/应用重启、跨平台及 Pocket/Relay。既有 `scripts/qa/review-live-e06.mjs` 只是四条 Pi 基础 lane 的真实执行器，最多给出 **E06 PARTIAL**，不是 E06 全量放行。

可复用的资源只有：安全隔离 profile、候选构建、测试模型/Provider、受限 Electron/CDP、时钟、命令账本、证据归档与清理。**业务状态、角色授权、结果认定、审批责任、历史数据及场景 verdict 永远分开**。

## 3. 执行批次与集中点

| 批次 | 所需动作 | 自动化/现场性 | 进入下一批的门禁 |
| --- | --- | --- | --- |
| U0 环境与源版本锁 | 验证独立 profile、真实应用、CDP、密钥隔离、git 状态、CI、测试卷范围、风险操作授权、脱敏目录 | 可自动前检，不调用模型 | 任一源码/数据归属异常即停止，标 `BLOCKED_ENV` |
| U1 无模型/低成本回归 | 本地合同测试、类型/构建或读取最新 CI；合成 V2 正负、角色欺骗、幂等、多批冲突及数据迁移只读检查 | 优先自动/受控 Main | 任一安全负例错误放行＝`FAIL`，不得继续破坏性 lane |
| U2 真 Provider + GUI（一次进程启动） | E06 四条 Pi lane；E05 A/B/C 最小真调用、人工阶段、补件/选择批次、批准/驳回，均捕获 Main/SDK/V2 前后像 | 合并启动但逐合同记证据 | 禁止用 E06 普通 Pi 成功覆盖 E05 审读失败 |
| U3 故障与恢复 | 已获授权的隔离测试卷内 ENOSPC/断电模拟、跨 PID、旧 ACK/回调、outbox 重放、普通会话恢复与多窗 | 需要可复原设备/专用故障 profile；严格守卫 | 无隔离卷或设备权限则 `NOT-RUN/BLOCKED_ENV`，不得测试宿主生产目录 |
| U4 结论/清理/签收建议 | 逐项对比固定 source+manifest，保存第一失败、脱敏及 SHA256，停进程、独立状态复核，输出 E05、E06、LIVE 差分三个判断 | 一个汇总，两套 verdict | 不自行更新 29 LIVE 台账，不解除 Draft，不合并 |

**优化时间成本**：U0/U1 只做一次；U2 按测试数据快照复用一套真实 Provider；不因单场景失败无理由重跑整个历史 U1。安全负例失败时立即停该风险 lane，独立正例可在证据隔离且风险解除后继续。U3 只跑已授权的风险子集，避免现场调用 `sudo` 影响宿主。

## 4. 强制维持的门禁

1. 不改 `AGENTS.md`、根 `README.md`（需要用户另行许可）、#118、29、隐藏 Gold、历史失败或 PR #121 父 SHA；禁止修改 SchoolPort 真实身份或伪造 school/teacher 凭据。
2. 模型输出 `compliant`、批次项 `done`、本地 reviewer、Main `accepted` 不是学校业务正式签批；用户/校方真实权限不足标 `BLOCKED_AUTH`，不能制造通过判定。
3. 记录正确拒止 `CORRECT_DENIAL` 是独立安全结果，不是实际材料合规；C `execution-failed` 是技术失败，不能视作业务失败/通过之一。
4. 仅在合成案卷、隔离文件/账户、授权服务上操作；固定/离线 Gold 与 provider transcript 不上传到公开仓。P05 外部 Relay/Pocket 无授权仍为 `BLOCKED_EXTERNAL`。
5. **一个未签 LIVE 场景足以阻断整体发布**。离线 CI PASS、E05/E06 的部分实机 PASS、验收活动“已运行”三者不能替代完整 LIVE 签署。

## 5. 本次交付物

- [集中验收索引](acceptance/p06-e05-e06-unified-r01/README.md)；
- [分场景正反矩阵](acceptance/p06-e05-e06-unified-r01/acceptance-matrix.md)；
- [本机执行与环境/清理操作手册](acceptance/p06-e05-e06-unified-r01/local-runbook.md)；
- [证据结构、隐私与判定合同](acceptance/p06-e05-e06-unified-r01/evidence-contract.md)；
- [本地 Agent 可直接接手提示词](acceptance/p06-e05-e06-unified-r01/local-agent-prompt.md)。

结论：**UNIFIED CAMPAIGN PREPARED（文档和代码 CI 待最终 HEAD 复验）；E05 LIVE NOT RUN，E06 LIVE PARTIAL；P06 PARTIAL；PR #121/#127 Draft；MERGE NO-GO；P07/P08 不启动**。
