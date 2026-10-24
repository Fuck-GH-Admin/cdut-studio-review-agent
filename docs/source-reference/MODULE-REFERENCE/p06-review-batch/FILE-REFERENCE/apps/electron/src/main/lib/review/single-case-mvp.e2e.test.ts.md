---
path: apps/electron/src/main/lib/review/single-case-mvp.e2e.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 351f256e872ad247cb9fa933326c40b53f949116
sha256: 82eb1a3e950c2a14a364c390f9b0d151e6cd700fe07faa1a01a8ff9d9f9e0d32
lines: 224
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/single-case-mvp.e2e.test.ts

## 1. 测试目标

单案审核 MVP **全链路 E2E**（describe `:85`，「真实存储与执行器，模型调用使用稳定模拟客户端」）：模板发布→建卷→材料/规则→提交→AI 抽取→缺件补交→事实更正→复跑→豁免/认定→partial-pass 决定→organizer 报告→重启恢复。一个大用例覆盖 application-service/case-store-v2/material-service/stage-workflow/workspace-business-service-v2/run-service-v2/report-export-v2-service 等 12 个模块的集成契约。

## 2. 用例清单

1 describe、1 test（`:86-223`）。夹具：`PROFER_CONFIG_DIR` 临时目录（`:19-21`）；`templateDraft`（`:30-46`，2 材料槽 application-form requiredAt=submission / certificates requiredAt=decision，auto-check→final-review 两阶段）；`fakeClient`（`:48-68`，注入式模拟：命中「任务：从下列案卷材料中抽取」返回 3 条固定观察（国家级×2/校级×1，sourceRefs 反查真实 blockId，`:52-64`），其余返回固定意见）；fixture 目录 `fixtures/mvp-single-case`（真实文件：rules/comprehensive-rules.txt、application/student-application.txt、evidence/competition-certificate.txt，`:27-28`）；`runCase`/`addMaterial` 助手（`:70-83`）。

1. `:86-223` 从材料导入、缺件补交、AI 事实更正到 partial-pass、报告导出和重启恢复。

## 3. 真实断言

- 建卷/规则：`created.ok`、`ruleUpdate.ok`（`:96/:109`）；提交后 `stage==='submitted'` 且无 certificates 文档（`:114-115`）。
- 初跑：`coverage.plannedChecks===6`、`effectiveRuleIds` 等于两条编译规则、`awaiting-supplement` 3 条（`:118-120`）；抽取 3 条 level 观察（`:122`）；视图 pendingActions 含 material-slot:certificates 与 3 条 fact（`:124-125`）。
- 补件闭环：open supplement→registerMaterial(certificates)→respond→resolve 全 ok（`:132-142`）。
- 证据关联 3 事项、材料全部 acknowledge ok（`:146-152`）。
- 事实更正 3 条（a 国家级/8、b 省级、c 校级）ok（`:155-163`）。
- 复跑：inputManifest.hash 变化、plannedChecks 6、level-mapping 三检查 `['compliant','non-compliant','compliant']`、用户更正观察 3 条 `extractedBy==='user'`（`:166-170`）。
- 豁免：non-compliant 逐条 `disposition:'waived'` ok（`:172-179`，reason 含「豁免不等于规则符合」）。
- 事项认定 accepted/modified/rejected 三连 ok（`:181-190`）。
- 决定：`result:'partial-pass'` 后 `finalScores` 精确 `['8','4','0']` 带 basisRunId（`:196-200`）。
- 报告：organizer 视图含 `'事项最终认定'`/`'最终分值 4'`/`'有效规则集哈希'`/`'人工豁免（不代表规则符合）'`（`:203-211`，注释 RUN-31：内部视图须 Main 可信操作者显式请求）。
- 重启恢复：decisions 尾项 `partial-pass`、adjudications 3、supplement `satisfied`；重载视图 pendingActions/resolvedActions/status 与重启前 `toEqual`，status `'decided'`（`:213-222`）。

## 4. 未覆盖与脆弱点

mock 边界：模型=注入式 `fakeClient`（`assembleV2Executors(…, {client: fakeClient as never})`），**非 mock.module**；其余全真实（存储/执行器/报告）。未覆盖：`pass`/`reject` 决定路径、supplement `unsatisfied` 路径、`request-revision` 类操作、多 run 并发、`exportCaseReport` 学生版默认视图。脆弱点：plannedChecks===6 等数字断言绑定当前内置模板的通用审核责任数量（模板演进会连锁改断言）；fakeClient 的 prompt 匹配串（`:51/:56`）绑定提示词文案。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例全流程断言行号 | 已证实 | `:86-223` 逐条核对 |
| finalScores 8/4/0 与 waived 语义 | 已证实 | `:172-200` |
| 重启恢复等价性断言 | 已证实 | `:213-222` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 链路环节 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 模板发布/建卷/规则确认/提交 | §3 | test:87-115 | covered |
| 初跑/抽取/视图 | §3 | test:117-125 | covered |
| 补件闭环/证据/更正 | §3 | test:127-163 | covered |
| 复跑/豁免/认定/决定 | §3 | test:165-200 | covered |
| 报告/重启恢复 | §3 | test:202-222 | covered |
| pass/reject/unsatisfied 等 | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
