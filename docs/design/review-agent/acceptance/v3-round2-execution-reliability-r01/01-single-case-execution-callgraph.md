# 01｜单案执行：实际入口、调用链与成功语义

**审计范围**：只读源码，固定主干 `8989941b6fb5651564e32d11c4215b6a6d5a5209`、D2 `56fa52a5173dfd5acd75af52f63d821ed9d5cf47`、D4 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`、P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`。逐条核对相关源码及测试**存在和内容**，本轮未执行仓库测试、Electron、Provider 或真实学校接口。本文件不构成架构选型。

## 结论：两种 Run 写入机制，多种入口

按**产生并持久化 ReviewRunV2 的机制**计，当前发现 **2 条**主要单案执行链；按用户产品入口计至少 **3 类**：审核图入口（直接/异步/批次复用）、普通 Pi 会话受控审核、Main 持有的后台 Pi 审核。D4 模板/材料导入不构成第三个审核运行器；D2 不可变预审 Plan 是执行前约束而非独立 Run 库。

| 类别 | 起点/主要函数 | 运行者与记录 | 易混淆点 |
|---|---|---|---|
| A：V2 审核图 | `review-ipc.ts:RUN_REVIEW_V2` → `assembleAndRunReview` → `assembleV2Executors` → `runReviewCaseV2` → `executeRunGraph` | 主进程编排 graph+Pi 暂存模型会话，节点产物/检查点汇入 `run-store-v2` | `completed` 是图状态，未必覆盖或业务合格 |
| A-async | `startReviewRunAsync` → 写 `queued` 占位 → 同一 `runReviewCaseV2` | 进程内 `activeRuns`、AbortController；V2 Run 是状态权威 | queued 起始 manifest.hash 为空，仅运行后真实填充 |
| A-batch | `RUN_BATCH_V2` → `runBatchQueue` → `assembleAndRunReview` | 同一 A 执行器，另有独立 BatchCaseEntry 状态 | 批次 `done`≠自动审批/正式定稿 |
| B：普通 Pi | `PREPARE_PI_REVIEW_V2` → `preparePiReviewRunV2` → 普通 `review-operator` session → Main `review_submit_result` → `submitPiReviewResultV2` | 每次 Pi 运行绑定 `assignmentId + sessionId + turnId + caseId + runId`；数据写 V2 Run 与 artifacts | 模型最终文本不是审核证据 |
| B-background | `START_BACKGROUND_PI_REVIEW_V2` → `startBackgroundPiReview` → `createReviewOwnedAgentSession` → `admitPreparedPiReviewTurn` → **相同 B 提交器** | Main 独占 owner、ACK、取消与工具权限；只对 UI 投影状态 | 不是另一套 Check/业务事实账本 |

## A：真实调用图（重点 RUN-01/02/03/04/06）

```text
Renderer reviewAPI / Agent business tool / batch queue
  └─ Main review-ipc.RUN_REVIEW_V2 | RUN_BATCH_V2
       └─ run-async-service.assembleAndRunReview(caseId)
            ├─ application-service.getCaseV2Aggregate
            ├─ template-store.getTemplate(case.templateId, case.templateVersion)
            ├─ assembleReviewClient → createPiReviewModelClient
            │    └─ PiAgentAdapter.query with review profile; temporary transcript removed
            ├─ v2-executor-factory.assembleV2Executors
            │    ├─ materials/tools/read receipts, deterministic rule checks
            │    └─ semantic rule tools submit_checks (requiredToolKeys)
            └─ run-service-v2.runReviewCaseV2 → review-run-graph.executeRunGraph
                 ├─ inputManifest + computeRunInputHash
                 ├─ checkpoint/artifact atomic-file saves
                 ├─ node output → checks, opinions, coverage-ledger
                 └─ run-store-v2.saveRunV2 → stored ReviewRunV2
```

**版本冻结和失效**：`computeRunInputHash` 对模板、caseFields、规则、文档 version/contentHash/parseRevision/parseStatus、Subjects、observations、evidenceLinks 计算哈希；不把输出侧 usage/unusedReason 当输入。Run manifest 另存政策版本、有效规则集合哈希和文档版本。Graph 恢复需输入指纹、依赖和产物一致；失效输入不能续用旧 checkpoint。快照顺序变更存在旧 hash 兼容路径；尚未用跨进程中断/并发写验证。

**Pi 模型客户端**（`pi-review-agent-client.ts`）：`maxTurns=24`；只有全部 `requiredToolKeys` 获可验证 `ok` 后才允许无摘要的工具回执兜底；单个 check 被接受不等于完成。达到轮次上限显式产生 `PI_REVIEW_TURN_LIMIT_EXHAUSTED`，Provider 超时可生成解释“未获得可核验结论”的 JSON fallback。后者不是业务成果；`v2-executor-factory` 在 Pi 无有效工具提交时生成 `execution-failed` 检查占位，`coverage-ledger` 将其排除 completed。早期 `pi-review-executor.ts` 的辅助 `buildReviewExecutors` 曾为 extract/check 构造空 observations/opinions 的 done 产物；**不能据此断言现版实际装配仍这么运行**，实际产品装配走 `v2-executor-factory`。

**确定性检查**：`v2-executor-factory.buildDeterministicRuleChecks` 根据事实/来源执行数值、去重、条件、组约束，不依赖模型自算；固定值未知须待确认。历史 9 项漏结论和 1,680/1,480 差额 200 的首败证明仅配置引擎或模型提示并不等于实际业务结果通过，应永久保留无答案泄露的负例。

## B：真实调用图（RUN-01/05/07、BG-01/02）

```text
普通审核工作台 explicit user turn 或 后台 Main-owned user turn
  └─ preparePiReviewRunV2 (case/template/D2 immutable plan/targets check)
       ├─ reject zero rules or zero applicable targets
       ├─ buildRun: deterministic checks + manifest + coverage
       ├─ saveRunV2(running) + create/bind assignment
       └─ Pi review strict tools
            ├─ review_read_documents, review_inspect_document_image
            ├─ review_inspect_original (case documentVersionId only)
            └─ review_submit_result → submitPiReviewResultV2
                 ├─ checkAssignment user turn + active run
                 ├─ current inputHash + D2 plan verify
                 ├─ validate observation, target, precise SourceRef, quoted numeric value
                 ├─ merge accepted semantic Check IDs; retain rejected reasons
                 ├─ missing/rejected → save artifacts, still running
                 └─ finish=true and no missing/rejected → save completed Run
             Pi stream terminates without finish:
                 completed turn→partially-completed; stop→cancelled; error→failed
```

**来源确权**：材料读取和扫描图像只是取得输入，不能把视觉预览当准确文字引文；符合/不符合需当前案卷真实版本、解析块和适用目标，数字候选必须在引文出现。`pi-document-coverage` 记录全文/部分/未读，带 hash 匹配的跨运行“已读凭据”可沿用，但不是沿用旧结论。运行终态还可包括 pending deterministic、unread 文档，故 `run.status=completed` 不能直接转业务通过。

**正式结果权威分级**：
`Pi SDK 轮完成` < `V2 Run 技术终态` < `Check + document coverage + input freshness` < `assessDecisionReadiness` + 逐 Subject 人工认定 + 阶段任务 < `decideWorkspaceCaseV2` 的可信 actor/CAS 决定 < `SchoolPort` 真实外部 accepted receipt。
`workpace-business-service-v2.ts`（文件名实际为 `workspace-business-service-v2.ts`）读取并重算当前 inputHash、校验 Run 与模板、补件回复，Agent 禁签；本地 reviewer 决定不等于校方远端确认。

## 源码与测试定位（SHA 固定）

- [review-ipc.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts) blob `593774d09098fdfbd2fb11f7d6525bba819a2b05`, lines 634–714。
- [run-async-service.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/run-async-service.ts) blob `2f53730903278cc030b0916e24b804f3846d3916`。
- [run-service-v2.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/run-service-v2.ts) blob `ffa31b44ceac53eb15d099667f204871e4bb6d76`。
- [v2-executor-factory.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/v2-executor-factory.ts) blob `e919b10411c1e585f5cd2c904e4b73a4006f16d2`。
- [pi-review-agent-client.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/pi-review-agent-client.ts) blob `0f4b185ce858045db21ff3e8c2fb569d350d7ac0`；[测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/pi-review-agent-client.test.ts) blob `45f1d223111486d6bd133338ff38d2cf858a238f`。
- [pi-case-review-service.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/pi-case-review-service.ts) blob `7683720355e06d2910b7d51c3c5b8751c6c9987c`；[测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/pi-case-review-service.test.ts) blob `0d7db959f8c6374eb4402ac669d4c0d1b5eeadf2`。
- [coverage-ledger.ts @main](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/coverage-ledger.ts) blob `167d22243e352a4a6cf192ba03de6d53e9cb3eea`；[测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/coverage-ledger.test.ts) blob `d173bd99819756c349e18114bb8c43a0370e62a6`。
- [pi-review-executor.ts @D2](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/56fa52a5173dfd5acd75af52f63d821ed9d5cf47/apps/electron/src/main/lib/review/pi-review-executor.ts) blob `b2fc761dcb157d67a3eb03cbcec980a78fa40d63`; @R03 blob `dcfe4c87f59c33ca20c1cab7e7ba9c9e0d701f73`。
- [run-store-v2.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/run-store-v2.ts) blob `479be69f6cd3328a57b4c555dbb4cdffd06746d0`。
- 本轮以上为 SOURCE_INSPECTED/TEST_SOURCE_INSPECTED；所有 test **NOT_RUN**。历史独立运行见 05 文件，不提升证据等级。
