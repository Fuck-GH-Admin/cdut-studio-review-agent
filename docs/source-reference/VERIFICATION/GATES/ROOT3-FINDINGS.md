# ROOT3-FINDINGS — STAGE5 独立 QA（DSH MiMo/max）

时间 2026-10-23T23:08:55Z（date -u）。对象：`final-hour/stage/DESIGN-VS-IMPLEMENTATION.md`（第三份 ROOT 文档）；前置 `GATES/INDEX/CODEBASE-MAP/MODULE-API/STAGE4.json` 全 PASS。核对方式：**静态源码核对**，真实运行 **NOT_RUN**。

## 结论：S5PASS（0 事实错误，不产 ROOT-DOC-ACTIONS.json）

绑定三个 stagehash：

- CURRENT-ARCHITECTURE.md `0f633ff9a470fb7adb28ae31e54d8980549b9ac3cd7a0115ed054add6f2f1872`（=STAGE4 门记录）
- BUSINESS-FLOW.md `32847ccc17b85d94574f92d358a19f8d4622321dbb2508490c272349e3027dd5`（=STAGE4 门记录）
- DESIGN-VS-IMPLEMENTATION.md `0d1b7485f81a36d8d60cd160b4cdceab38ec54fdcad87b942bbbffa5cc97c218`（本 gate 对象）

## 经理点名事实逐条回源（全部与文档表述一致）

1. **latestReportDecision**：byTimeThenId 降序（`right.localeCompare(left)`+ID 降序兜底）后 `.at(-1)` 实取**最早**、无 finality 过滤——review-v3-report-snapshot.ts:26-76 实读；文档 D10 如实（含「函数名/提示与实际相反」缺陷口径）。
2. **普通 Pi 无 planFingerprint**：buildRun（pi-case-review-service.ts:274-309）不写 planFingerprint；freezeAttemptIdentity 缺指纹返 undefined（review-runtime-contract.ts:55-73）——D04/BUSINESS-FLOW §5 一致。
3. **legacy run 也 business**：classifyRunAuthority 回退 business-attempt（:31-37）——D02 一致。
4. **T03 属当前 T05 非旧 recordStageDecision 全局**：assessT03RunAction 在 resolveCurrentBusinessRun/:178-194 与 workspace-business-service-v2:87-110；recordStageDecision 无 Run/T03 校验、产 `run@rev` 依据（stage-workflow:134）——D05 一致。
5. **V1 CAS 缺省跳过**：`expectedRevision !== undefined` 才比对（case-store.ts:288-290），注释与实现不符被文档如实点名——D01 一致。
6. **D2 verifyPi 仅测试调用**：verifyD2PiRun 非 test 生产调用为零（定义 review-d2-runtime.ts:498）；生产走 verifyD2InstalledPlan（:462/:932）——D06 一致。
7. **工具 turn/scope 帮助函数非普遍调用**：requireAssignment 不传 turnId/requireTurnMatch（ops-tools:200-205）；list/get cases 不走 checkCaseReadScope/isCaseVisible（:270-310）——D08 一致。
8. **cslab 事务/worker/配置根边界**：md/sidecar 先写后 DB（cslab-manuscript:244-306）、30s watchdog 仅 worker 分支（cslab-ooxml:1120-1137）、路径词法包含（cslab-paths:320-333）、`.cdutai(.dev)` vs `.profer(.dev)` 双根（config-paths:24-80 / cli/paths:25-28）——D11-D13 一致。
9. **completed/businessReady ≠ approved**（D03，businessReady 判定 pi-case-review-service:819-836 实读）与 **SourceRef parseRevision 重建非校验 input**（:326；文档未误述）均一致。

## 结构核对

- 链接 43/43 解析通过；25 处 file:line 引证抽查 12 组证据区间全部命中真实内容。
- 与前两份 ROOT 文档、MODULE-API 门产物互证一致（含「latestReportDecision 缺陷保留不美化」口径）；五 MD/MODULE 名称未动。
- 未重复既有报告；无事实问题即闭合。三份正文一字未改（Codex 所写）。

边界：本 gate 覆盖第三份 ROOT 文档的引证真实性与三文档一致性，不等于全仓技术验收；真实运行 NOT_RUN。

## 与 manager/ROOT-DOC-ACTIONS.json 对账（2026-10-23T23:10:07Z）

该 registry（23:04:39Z，非本 QA 所建、未改动）4 项 action 源于 STAGE4-FINDINGS 对**草稿**（7bcad7f7…/3b9aa130…）的 findings。修复版正文三份（0f633ff9…/32847ccc…/0d1b7485…）经本 QA 逐条回源：**4 项要求事实均已落实**（报告选择实况、parseRevision 重建、businessReady 含 completed、T03 限 T05/原生路径）。registry 状态仍为 OPEN 系建单时未复核修复版——建议经理按修复版正文关闭。本 QA 无新错误可派（未产新 ROOT-DOC-ACTIONS.json）。
