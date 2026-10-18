# 88｜P06 L02-01 R02：集中验收 r01 后的产品修补与下一轮开发门禁（2026-10-19）

> **工程实现记录，并非真实 LIVE 验收结论。** 此文件与代码位于独立 Draft PR #131；基线是 #127 固定 SHA `bc228f64750714e70c73cbd115d2f169c610a517`。#130 仅为冻结实机证据，不在本 PR 重新执行或改写。不可编辑 #118/#121/#127/#130、29 号 LIVE 台账、历史首败/隐藏 Gold；不得据此解除 P06 PARTIAL 和 MERGE NO-GO。

## 1. 本轮为何开发而非重新实机测试

#130 验收得到 9 PASS、1 FAIL、其余 19 阻断/未跑。E06 普通 Pi、工具拒绝/恢复、Stop、预览及跨 PID 子集已提供有效证据，但不足 FULL；E05 没有业务 LIVE 全量通过。本轮只修补可在独立开发工作树完成的**确定性产品缺口**与冻结版本安全守卫，并补无付费代码级正反回归。实机 Provider、授权学校审批、扫描原件、ENOSPC/跨 PID 完整工作流统一后测；不要按单个小修正反复启动大型环境。

## 2. 实际代码内容

### R02-A：真实多批补件回流 GUI（不是代批）

- 新组件：`apps/electron/src/renderer/components/content-review/SupplementRequeueDialog.tsx`；纯状态函数 `supplement-requeue-ui.ts` 与同名单测。
- `BatchPanel.tsx` 对有多个批次归属且进入重审阶段的案卷展示“选择补件回流批次”。弹窗从 **Main** 读取最新 V2 aggregate 和所有 batch 状态，分别明确选择 **已满足的来源补件**、**唯一目标批次**，勾选人工确认；不默认选当前批次，也不自动修改全部历史批次。
- 界面会拒止/解释：没有满足的补件、仍有其他开放补件、无对应开放 reviewer task、案卷版本不明、候选批次模板锁不匹配、批次 running/finalized、单案 queued/running。不同身份 task 必须 fail closed。
- 提交前再次 Main 查询最新修订和候选列表；提交只调用**已有** `BATCH_ACTION_V2/requeue-supplement`，显式 `confirmed=true`。Main `bindLocalReviewerCommand` 使用固定 `local-reviewer` 身份，并由 `selectSupplementRequeueBatch` 权威复核来源任务、身份、revision、模板、cursor/幂等及目标状态。Renderer 不能声明校方/teacher 授权。
- 提交结果显示单批队列改变，不代表学校正式签批；不复用 group-action 或创建第二套业务引擎。
- **保留缺口**：尚未完成真实 Renderer/Preload/Main Electron 图形操作验收；已有补件来源信息不能自动推导“应该回哪个历史批次”，仍必须人工选择。

### R02-B：冻结模板/Run 一致性安全检查

- 新的纯判定入口 `apps/electron/src/main/lib/review/batch-template-lock.ts`，及 `batch-template-lock.test.ts` 正反测试。
- 在现有 `RUN_BATCH_V2` Main 执行器中，**先**从实际 Main V2 案卷取当前 templateId/version 与批次锁一致且属于该批次，才触发可能付费的 Pi；**后**核对实际持久 Run 的 templateId/version，不一致不能写 done，保留为 per-case failed 并继续其他独立案。
- 不更换审核引擎，不自动迁移 V1 旧模板，不篡改旧 Run 或提升 `done` 为正式决定。
- **重要溯源提醒**：#130 的 `e05-case-ledger.json` 将 A/B/C `caseTemplate` 记为 `comprehensive-assessment-v2@3`，但 `runTemplate` 是 `p06-batch-live-…@1`。这份**报告字段的来源是否一致仍未证实**，需要在未来验收中从同一时间、同一案卷读取 **V1 selectedTemplate、V2 aggregate.caseV2.templateId/version、batch.templateId/version、Run manifest、policy lock** 五个事实，先确定是报告映射问题还是产品同步 bug，不能猜测和自动纠正历史。
- 若实际版本不一致，本轮 fail-closed 阻断可能暴露更多既有问题；这是预期安全行为，不应通过删除模板检查令 CI 变绿。

### R02-C：C 型 24 轮失败的用户反馈，不擅改 Pi 限额

- `batch-ui-feedback.ts` 与 `BatchPanel.tsx` 对队列中的 `failed` 案卷显示技术失败，若 Run diagnostics 提到 max-turn/轮次上限，再提示剩余检查数量；不会把 0 checks / maxTurns=24 写成“审核不合规”，也不把模型原始返回/私密报错直接显示到 UI。
- `batch-ui-feedback.test.ts` 添加可读性、隐私与失败分类回归。
- **根因仍待确认**：Pi `pi-review-agent-client.ts` 当前 `maxTurns: 24`；#130 的 C 达到限制、未提交有效结果。但本轮不直接调大 24、不把 `execution-failed` 偷换成 `non-compliant` 或 `awaiting-supplement`；待下次授权实机时只采集脱敏 **工具名/尝试次数、提交被拒/缺失检查、退避重试次数、最终 stop reason、input hash**，定位是指令/预算/工具回执/模型行为或 SDK 缺陷，然后修正具体原因。

## 3. 离线回归及安全约束

仅做代码级适配与 CI：
- `supplement-requeue-ui.test.ts`：多批选择、无匹配 task/其他身份、未完成补件、冻结模板/运行中/已排队/非成员拒止；
- `batch-template-lock.test.ts`：同案同版正例、跨案/缺失案卷/错模板与错版本拒止、Run 错版本拒止；
- `batch-ui-feedback.test.ts`：技术失败不被当不合规，原始模型敏感异常不泄漏；旧 E01/E02/E03/E04 测试保持。
- 预期 CI：PR CI + Review batch focused + Review Baseline + D2 Scoped Pi 全部同最终 SHA 通过，否则记录真实失败及修复，不凭本文件签 CI PASS。
- 禁止擅改根 `AGENTS.md` 和 `README.md`（需要用户单独许可）；本变更记录归档于 88 号。不得自动改动真实 SchoolPort 权限、隐藏 Gold、真实学生数据、#130 的 A/B/C 验收材料。

## 4. 后续开发批次建议（先开发再统一测试）

1. **L02-01 R02 后续**：从 V1/V2/Run/batch 的同一候选快照完成模板归属的可复现归因；结合旧 C 的真实工具回执定位 24 轮耗尽，必要时补 “安全续交未完成检查”的受控路径；完善本地授权范围内的正式处置、补件往返、Outbox/回放的无 Provider 合成端到端回归。**不能把 #130 的 `BLOCKED_AUTH` 一概视作所有本地业务验证都无法做**。
2. **L02-02 工程开发**：`review_inspect_original` 真实页/图片、扫描 PDF、Office sourceRef，长任务 CompactContext 与任务交接；尽量集中先做云端可审代码和无模型回归，再用单次实机审查全部需要 GUI/本地模型/文件系统的场景。
3. **集中验收差分**：冻结 R02+L02-02 集成提交、同 SHA 四 CI；一套专用隔离 profile/有界故障卷；E05 和 E06 两套独立 verdict；核对真实 UI 操作、A/B/C、补件两批回流、跨 PID、原件/SourceRef、权限/静态安全和外部授权。重复已经通过的 E06 场景仅做受影响边界的必要回归，历史证据仍需保留。

**当前保守判词：R02 = ENGINEERING IN DEVELOPMENT（待最终 SHA CI）；L02-01 E05 LIVE NOT ADMITTED；P06 E06 PARTIAL；P06 PARTIAL；MERGE NO-GO；P07/P08 NOT STARTED。** 此文件不会触发实机验收。
