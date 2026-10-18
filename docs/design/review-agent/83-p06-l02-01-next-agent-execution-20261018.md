# 83｜P06 L02-01 下一会话工程 Agent 执行任务书（2026-10-18）

> **这是实际工程任务，不是另写计划。** 必须开展代码审查、必要最小修复、可执行正反回归、独立 Git 提交、Draft PR 与 CI 取证。
> 首先完整阅读 [82 号跨会话交接](82-p06-l02-01-next-session-handoff-20261018.md)、[81 号总进度](81-p06-overall-progress-and-roadmap-20261018.md)、[80 号阶段入口](80-p06-l02-01-offline-engineering-entry-20261018.md)、[79 号 U1 集中验收](79-p06-l02-u1-unified-local-result-20261018.md)、[47 号 L02 原计划](47-p06-evidence-driven-followup-plan-20261015.md)、[29 号权威 LIVE 台账](29-background-session-preflight-audit.md)、仓库 AGENTS.md。

## 1. 身份、基线和边界

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- 下一阶段目标：P06 L02-01 **离线业务闭环 E02→E03→E04**，延续 [Draft PR #121](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/121)，分支 feat/p06-l02-01-offline-business-closure-r01。
- 父 PR #118；父冻结提交 3baf1fc2ccf27607f948923dbf5aff26d984729e；#118/79 号已归档为 **U1_ACCEPTANCE_CAMPAIGN=CLOSED_SCOPED_PARTIAL**，不得回写历史。
- 最近一个经过验证的 E01 **代码** SHA：3b3e52c01e38667d1bbc98f90b6ffa0abda5d722；tree 261029968f6672b9228e1bd2d06471addd12b15b。该版本 PR CI 4016 PASS、5 SKIP、0 FAIL；batch-focused 143 PASS、0 FAIL；Review Baseline 和 D2 Scoped Pi 均 SUCCESS。以上绿灯属于该 SHA，不能替代 **增加交接文档后的最新 HEAD** 的 CI。
- 执行前先查 PR #121 **最新 HEAD/tree**、分支状态、与父 #118 的 compare、实际 CI、是否另有 Agent 在此分支写入、D4 并发 PR #119/#120/#122/#123。无冲突则继续本开发分支；若存在并发写入，独立开源于其最新 HEAD 的工作树/分支和 Draft PR，不覆盖其他人。
- **用户决定**：不要每处理一个点就叫本地 Agent 跑一遍 Electron；E02/E03/E04 能在云端开发的部分先连续做完，阶段末统一构建/CI，未来只对真正需要 GUI/Provider/物理故障的缺口再做一次集中本地验收。

## 2. 先确认 E01 真实修复仍然有效

读取：
- apps/electron/src/main/lib/review/stage-workflow.ts
- apps/electron/src/main/lib/review/stage-workflow-l02-01-idempotent-batch.p06.test.ts
- apps/electron/src/main/lib/review/case-store-v2.ts
- apps/electron/src/main/lib/review/batch-store.ts

E01 两轮失败属于历史，应保留：
1. 首轮 f36bff88，PR CI #39132697022：重复 ResolveSupplement 相同 requestId 产生二次外部 requeue，已推进 done 错回 queued。
2. 仅增加 result.entity 判断的版本 c576fe7a，batch-focused #39133158848：两个原有“首次成功满足必须入队”的测试失败。原因是 submitCommand 只将 mutate(draft) **返回值**赋给 result.entity，原 handler 外层 entity 并未生效。
3. 最新生产修复：新执行的 mutate 返回 SupplementRequest，重放只回放旧 receipt 不含 entity，外部 requeue 仅新执行且所有待补件解除时触发。新测试验证“首次正确入队”和“重放绝不二次入队”，旧正例也通过。
4. 首次 CI 的非目标 Goal 会话异步测试有过一次 Expected failed / Received active，固定 E01 SHA 全仓已恢复 PASS，不能谎称与本项有因果或把历史日志删除。

可执行基线测试（以当前 Bun/包脚本为准）：

    bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/stage-workflow-l02-01-idempotent-batch.p06.test.ts apps/electron/src/main/lib/review/stage-workflow.test.ts apps/electron/src/main/lib/review/batch-automation-service.test.ts apps/electron/src/main/lib/review/batch-group-action-service.test.ts

如果环境无 Bun/构建失败，留下真实 exit 和 BLOCKED_ENV，不使用历史成功报告代签。

## 3. E02：人工决定／身份／可靠事实

**先做源码差分和已有测试覆盖矩阵，再改确认的缺陷。** 至少审查：
- stage-workflow.ts 的 ensureInitialTask、recordStageDecision、resolveAppealV2 和 resolveFinalDecisionProjection；
- workspace-business-service-v2.ts、decision-readiness-v2.ts、case-store-v2.ts、相关 IPC/Controller 入口；
- stage-workflow.test.ts、decision-readiness-v2.test.ts、workspace-business-service-v2.test.ts 的已经存在的正反例。

必须能在真实合成 V2 案卷与已有事务上证明：
1. 有权 reviewer 初审仅记录 stage 级结果，正式 final 只能由相应角色、开放任务与冻结模板执行；agent 无权冒签教师。
2. AI 提议不等于正式校方决定；未确认的事实、未读材料、未解决 Check、错误 SourceRef、过期模板或旧 run 必须阻止正式决定。检查**真正生产业务决定入口是否调用可信就绪判断**，不能只测独立 readiness helper。
3. 相同 requestId + 同载荷的重放只返回原 receipt，不新增第二条决定/任务或副作用；不同载荷同 ID 拒绝 REQUEST_ID_COLLISION，过期 expectedRevision 拒绝 VERSION_CONFLICT，已完成 task 不能用另一 requestId 重复决定。
4. 决定、任务、案卷阶段与 receiptLog 必须持久一致。人工驳回、补件、撤回与 final-pass 不混淆。
5. 确认没有缺陷时写 NO_CHANGE_WITH_EVIDENCE，不为了增加提交数而重写已经稳固的实现。

交付：E02-gap-matrix（具体文件、已有测试、遗漏风险、正反结果）、必要最小代码修复、新回归。

## 4. E03：补件回流／重审／旧证据拒止

复用 respondSupplementV2、resolveSupplementV2、requeueCaseAfterSupplement、run-store-v2、当前 Bridge/SourceRef 接口，不引入第二队列。
- 多个补件只满足其一，不能回 reviewing 或入队；insufficient→再次回复→经原阶段责任人认定 satisfied 才恢复。
- 所有待补件解决后恢复正确源阶段 task、角色与 round；新请求只回流一次。重复请求、旧案旧批次事件不得重排其他已经推进的批次。
- 材料 documentVersionId/parseRevision 更新后必须明确旧 run / 原始 SourceRef / 旧覆盖在新版是否仍有效；风险缺口先 RED→修复再正反回归，不得从旧模型建议直接产生审批。
- 对审查失败、写盘异常和局部批次失败保持 fail-closed，普通批次正例正常。
- Provider 尚未得到真实授权回执，因此合成受控重审只签 CONTROLLED，不签 ONLINE_REVIEW。

交付：E03 差分覆盖与必要代码/回归。保留 E01 2 条关键回归和旧 batch 正例。

## 5. E04：逐批自动化、定稿、出站操作幂等

复用 batch-automation-service.ts、batch-group-action-service.ts、batch-store.ts、workspace-business-service-v2.ts、既有测试与持久 outbox。

- 默认 assist 不得自动批准；auto-return 不得等于自动通过；auto-approve 必须同时满足全局显式授权、已确认的批次授权、已发布模板显式许可、可信当前材料/Run/证据/人工业务条件。
- 授权撤销、改版、未知/未读证据、过期 previewHash、跨案、旧 automation revision 必须正确拒绝。actorSource='system' 或 agent 不得凭调用参数绕过正式校方授权。
- batch 的技术 done 不是正式决定；未完成补件或申诉、开放任务、缺有效 final BusinessDecision 时不能 finalizeBatch。重新打开批次不能改旧快照。
- requestId、operationId、outbox actionId 幂等及不同载荷冲突；检查失败重试是否重复对外发动作。
- 已有覆盖直接引用、不要再复制大量同内容 fixture；有确证遗漏才新增最小实现和正反回归。

交付：E04 差分覆盖与必要代码/回归、批次/正式审批边界记录。

## 6. 阶段末只做一次统一技术验收

- 不为 E02、E03、E04 每一项启动独立 Electron 或本地 Agent。开发时只跑变更相关测试；最后固定 **一个最终候选 SHA/tree**。
- 运行仓库现行 typecheck、boundaries、Electron Main/Preload/Renderer build、全仓 Bun regression 与 Review batch focused、Review Baseline、D2 Scoped Pi CI。跨 SHA 成功不得拼装成一份全绿结果。
- 如果修改 Main/Bridge、owner、权限、RunStore 或 V2 事务，按影响范围额外复核 E03/E04/E05、普通 Agent 和 ENOSPC/重启的受控正反例；仍不要伪称完整 LIVE。
- 将所有阶段末数据归档为 84 号 L02-01 离线工程结果，以及 acceptance/p06-l02-01-offline-r01/ 中的 candidate-lock、gap-matrix、command-ledger、defects-and-first-failures 与 SHA256SUMS。原始敏感信息只留私有目录，公开脱敏与哈希。
- Git 按“首败测试→最小修复→文档归档”有意义地分提交；最终 push 同一 Draft PR 或已说明的新独立 Draft。真 CI 未完成时报告 PENDING，不提前 PASS。

## 7. 仍然不能解除的正式门禁

U1 #118 集中活动 **CLOSED_SCOPED_PARTIAL**，并非 U1 FULL PASS。真实 Provider tool-use/SourceRef 的完整 receipts 仍 BLOCKED_ENV，真实 A/B/C 仍 NOT-RUN_GATE；真独立满卷和跨 PID 故障恢复 BLOCKED_ENV；Office #71 上游移植 BLOCKED_UPSTREAM；生产中心 Relay 多 viewer/ticket BLOCKED；Pocket FIFO TARGET NOT-RUN；P04 永久 tombstone/owner journal 不安全 GC 严禁。29 号是唯一 LIVE 台账。不得修改冻结 PR #118、隐藏 Gold、校方真实材料、上游主分支，不合并、不开始 P07/P08，不降低严格五工具/Owner/SourceRef/业务授权。

本批可望签 **L02-01_OFFLINE_DEV_REMOTE_CONTROLLED_PASS**，绝不因此签 **L02-01_LIVE_ACCEPTED** 或 **P06_RELEASE_READY**。

## 8. 给下一会话的一段完整提示词

接手 CDUT Studio 审核后台 P06 的 L02-01 离线工程开发。仓库 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent ，继续 Draft PR #121（feat/p06-l02-01-offline-business-closure-r01），父版 PR #118。请首先完整阅读仓库 docs/design/review-agent/ 中的 83-p06-l02-01-next-agent-execution-20261018.md、82-p06-l02-01-next-session-handoff-20261018.md、81-p06-overall-progress-and-roadmap-20261018.md、80-p06-l02-01-offline-engineering-entry-20261018.md，以及 79、47、29、根 AGENTS.md。重新核查远端 #121 最新 HEAD/tree/四条 CI、#118 冻结版本、D4 并发 PR。E01 补件幂等已经以代码 SHA 3b3e52c01e38667d1bbc98f90b6ffa0abda5d722 得到四条 CI SUCCESS、4016 PASS/5 SKIP 和 batch 143/143，保留两轮 RED 不回写历史。用户确认此前 U1 #118 集中验收活动已经结束，**本轮直接实际开发 E02（人工决定/可信权限）、E03（补件回流/版本失效）、E04（授权自动化/批次/outbox）**：先发现确定的实现缺口，最小修复、跑正反回归、保存原始错误、运行最终固定 HEAD CI、提交独立 Draft PR 和 84 号结果。不要只写分析或计划，也不要每完成一个小改动就让本地 Agent 重新跑 Electron；可离线开发内容先连续做完，真实 Provider/物理满卷/GUI 最后批量验收。#118、旧 FAIL、隐藏 Gold、29 LIVE 与上游均只读，不得擅自合并、发布或进入 P07/P08。继续保持 P06 PARTIAL / L02-01 LIVE NOT ADMITTED / MERGE NO-GO。
