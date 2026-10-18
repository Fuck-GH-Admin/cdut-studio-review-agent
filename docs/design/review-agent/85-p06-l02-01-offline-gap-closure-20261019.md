# 85｜P06 L02-01 离线业务缺口续修（2026-10-19）

> 在 84 号已提交结果及 PR #121 基础上继续做 **实际工程修复**；本件不是新增 LIVE 台账，也不修改冻结 U1 PR #118 / 29 / 79 及既有首败证据。最新版本以 PR #121 当前 HEAD 及对应四项 CI 为准。

## 版本与边界

- 仓库：`Fuck-GH-Admin/cdut-studio-review-agent`；既有开发分支：`feat/p06-l02-01-offline-business-closure-r01`；Draft PR #121。
- 冻结父基线 PR #118：`3baf1fc2ccf27607f948923dbf5aff26d984729e`；本轮起点：`a70b07db6d2db571caee451425a2555963573217`。
- 本轮代码候选（本文生成前）：`ac20088cb5404e8599b77781b006a89b02418dc9`；文档提交会改变 HEAD，应重新查看最终四项 CI，严禁以本文前的绿灯覆盖文档后 HEAD。
- **仍是 P06 PARTIAL / L02-01 LIVE NOT ADMITTED / MERGE NO-GO。** 不改 29 唯一 LIVE 台账；不合并、不推进 P07/P08、不签验收、不重跑 #118。

## E02：正式阶段决定必须绑定真实运行

前一轮的 `stage-workflow.ts/recordStageDecision` 对阶段（含真正 final）的 `basedOnRunId` 使用 `run@rev…` 合成值。本轮增加可选 `basedOnRunId` 和 `inputHash` 字段：

1. **新生成的 final 阶段决定**，包括最后一级 `stage-pass` 及 `final-reject`，必须持久引用真实本案 Run；在 `submitCommand` 事务内核验 Run 存在、已完成/部分完成、哈希和模板版本锁有效、当前案卷输入未发生变化，以及补件回复不晚于该 Run。
2. 传入任何显式 Run/hash 的非终审阶段决定同样执行匹配检查；未显式传入 Run 的**遗留非终审阶段**仍可使用原 `run@rev…` 投影，暂不宣称历史全面迁移。
3. `final stage-pass` 复用 `assessDecisionReadiness`，校验有效规则、未读材料、当前检查处置、未确认事实、候选证据、待补件、事项终局认定等，未满足返回 `DEPENDENCY_UNRESOLVED`；驳回仍需真实 Run，但不强制当事人先消除被驳回所指问题。
4. 正向合成测试保存真实 `ReviewRunV2`，补件后全链路 journey 重新运行获取新 Run；负例覆盖无 Run 冒签和零有效检查冒充最终通过。不通过“临时跳过就绪门禁”修复旧测试。

**保留缺口**：历史 `run@rev` 非终审和已落盘终审数据的迁移/完整真实性未执行；本地 `actorSource` 字段并非校方认证凭据；原始 SourceRef 真实图文原件/Provider 真实工具链、学校签署能力和跨 PID 恢复未签 LIVE。独立 `decideWorkspaceCaseV2` 的正式权限逻辑及已有 E02 负例继续保留，不新增第二审批引擎。

## E03：多批归属的显式补件回流

`batch-store.ts` 新增 `selectSupplementRequeueBatch(caseId,batchId,selection)`。多批归属的自动广播继续 fail-closed；明确选择才可回流 **一个** 已选定的批次。

- 校验有效 caseId/batchId、指定满足的补件、重审来源阶段当前 open task 与本地审核角色、expectedRevision、冻结模板锁、实际批次成员，以及非 running/finalized；
- 批次 JSON 持久化补件回流 cursor；同案卷同补件二次提交即使案卷修订后来增加，也不能将已经完成的队列重新置 queued；其他历史批次始终不受影响；
- 在既有 Main `BATCH_ACTION_V2` 中增加 `requeue-supplement`，要求 `confirmed===true`，且通过 `bindLocalReviewerCommand` 强制主进程固定本地 reviewer，拒绝 Renderer 自称校方/教师/Agent；Preload 增加相同动作契约，无新 IPC 权限渠道；
- 受控测试覆盖多批误广播、目标选择后重放、错误角色、旧 revision、未确认的 IPC、伪造学校 actor。

**保留缺口**：原来的单批自动回流沿用既有路径；新显式选择虽有 Main/Preload 入口，但 Renderer 人工目标挑选/具体提示尚未完成端到端 GUI 验证。Main 本地 reviewer 不等于持有校方身份或 SchoolPort 授权。多批同时修改、断电撕裂窗口、跨 PID 与真外部系统场景待 E05；不能把 persist JSON cursor 视作完整 WAL。

## E04 与回归、首败

E04 批次自动化、定稿、outbox 仍沿用 84 号既有审计和代码，未创建第二套引擎。保留 84 号全部可复查失败/通过证据。

本轮新 CI：
- `24777e5` 的 PR、batch、D2 成功，其余以 Actions 页面最终状态核对；
- `4c274b1` **PR CI #39146078030、Review batch #39146078031、Review Baseline #39146078202、D2 Scoped Pi #39146078029 全部 SUCCESS**；
- `a879fd9` 引入的 E03 合成测试变量名重复，在 **D2 Scoped Pi #39146455098 TYPECHECK FAIL**，错误 `TS2451` 和 `TS2339`，保留原始日志。随后 `c372d4b` 仅改测试变量名，`ac20088` 补入有效合成检查，避免新 readiness 在一条旧空规则正例上合理拒绝。提交排队/被新 SHA 取消的旧 CI，不得记为失败或成功已证；
- **最终文档提交之后要以该 SHA 的四个 GitHub workflow 的实际 SUCCESS 才能称“离线回归通过”**。未知状态保留 PENDING；无本机 Bun/真实 Electron/Provider 执行证据。

测试计划/执行边界见 [r02 证据索引](acceptance/p06-l02-01-offline-r02/README.md)；E05 所需本机条件和集中验收清单见 [E05 矩阵](acceptance/p06-l02-01-offline-r02/e05-unified-acceptance-matrix.md)。

## 下一步

先确认最终固定 SHA/四项 CI、把失败逐项收口；再集中准备 E05 本机合成/真实 Provider、SchoolPort/真实授权、原始证据/Office、A/B/C、GUI 选择多批来源、物理磁盘 ENOSPC、跨 PID、Relay/Pocket 和 outbox 故障恢复。缺项必须记真实阻断，不能以单元测试代替现场。根目录 AGENTS.md/README.md 受“变更前用户许可”限制，本文先在审计文档中记录功能契约，不擅改根目录。
