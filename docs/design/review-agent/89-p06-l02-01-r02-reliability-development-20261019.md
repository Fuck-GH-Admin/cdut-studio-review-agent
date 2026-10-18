# 89｜P06 L02-01 R02 第二批可靠性开发与后续工程门禁（2026-10-19）

> 本文件是**已经实际提交的离线工程变化**与待核验事项清单，不是实机 E05/E06 复验报告。来源为 #130 r01 集中验收和 #131 产品开发。#130 9 PASS、1 FAIL、11 BLOCKED_AUTH、2 BLOCKED_PRODUCT、2 BLOCKED_ENV、1 BLOCKED_EXTERNAL、3 NOT-RUN 的历史矩阵保留，禁止修改老 evidence/Gold/29 号 LIVE 台账。#131 基于 #127 `bc228f64750714e70c73cbd115d2f169c610a517`，维持 Draft/未合并。

## 1. 已实现：Pi 轮次耗尽的判定与兜底门禁

现有 `pi-review-agent-client.ts` 固定 `maxTurns=24`（保持不变），#130 的合成 C 未取得有效检查结果；这是**技术失败**，不是材料被判不合规。

本批次修改：
- SDK 非成功 `result` 遇到 max-turn/轮次上限时返回稳定、无原始 transcript 的错误码 `PI_REVIEW_TURN_LIMIT_EXHAUSTED`；继续保留异常使 Run/批次失败，不制造业务核验结果。
- 修正“部分审核工具调用被接受即走成功兜底”漏洞：**要求完整覆盖 `requiredToolKeys`**，且无 required keys 时本次工具提交的全部子项都必须成功，才允许使用“已完成工具提交但未收到文字总结”的兜底。被拒的检查、部分覆盖、模型轮次耗尽一律不能因为其他检查曾被接受而掩盖。
- `v2-executor-factory.ts` 的语义审核提示强调一次定向读取后，预算等字段不存在时应提交待确认/待补件，禁止同义反复搜索、缺金额编造成 0。仍要求可靠出处，不替代模型真实工具行为。
- `batch-ui-feedback.ts` 可识别稳定错误码，不在界面显示原始 Provider 报错。
- `pi-review-agent-client.test.ts` 包含“0 项提交 + max-turn 正确失败”“仅 1/2 项提交 + max-turn 正确失败”“混合成功与被拒不能兜底”“全部目标已接受才能使用工具回执兜底”等离线正反例。

**尚未证明：**真实 C 的 24 次具体工具序列、为什么没有按提示提前提交、是否 SDK 终止行为或工具引用拒止。真实流式日志仍只在受限私人验收目录；下一轮授权真实测试才可归因。不得修改 #130 历史 C 结果，也不得写“C 已通过”。

## 2. 已实现：批次身份、版本和完成状态门禁

- `batch-template-lock.ts` 除了运行前检验 `caseId` 属于 batch 且 V2 templateId/version 与批次锁一致，现在还检验模型返回的 Run **确实属于当前 caseId**，Run templateId/version 和 `inputManifest.templateVersion` 与批次锁一致。
- Graph `completed` 不意味着所有规则成功；如果 Run 检查中存在 `execution-failed`，队列项标为 `technical-check-failed` / `failed`，不写 `done`；正常的 `awaiting-confirmation` 则保留已完成执行、等待人工的业务语义。
- 继续沿用现有 Main IPC 与 `runBatchQueue`，不新增权限或模型编排引擎；技术失败单案隔离，不阻塞下一案。
- 正反回归位于 `batch-template-lock.test.ts`，覆盖跨案、跨模板、manifest 版本错配和 execution-failed 与 awaiting-confirmation 的区分。
- #130 报告里的 `caseTemplate=comprehensive-assessment-v2@3` 与 `runTemplate=p06-batch-live-…@1` **仅能确定证据字段不一致**，还未从同一时刻 V1、V2、Batch、Run 四源独立重建，不宣布已找到根因。防守性版本门禁不是根因修复。

## 3. 已实现：本地人工补件闭环正反回归

- 在 `stage-workflow-l02-01-idempotent-batch.p06.test.ts` 增加真实 V2 事务（无 Provider）：人工退回补件、伪造文件版本 ID 拒止、不足退回、学生再次回复、人工确认满足、恢复来源审核阶段、同案双批不猜测、明确选一个目标重新入队、旧版本拒绝、重放不复活历史 done。
- 这条路径只使用隔离**合成材料**和本地 reviewer/student，校方签批等价性**明确不成立**。它属于代码级 `OFFLINE` 正反证据，不能据此宣称 E05-03～12 已获 LIVE 准入。

## 4. CI、失败和审计

本次工程变动目标是四条固定 HEAD CI 全绿：`PR CI`、`Review batch focused`、`Review Baseline CI`、`D2 Scoped Pi`。必须以**本文及代码一起提交后的同一 SHA**为准；此前 #131 `e400068b` 四 CI 成功不能挪用于新 SHA。

禁止跑真实 Electron/CDP、真实 Pi/学校身份、故障卷 ENOSPC、跨平台或外部 Relay/Pocket；没有原始 Gold，原真实业务验证仍保持阻断。禁止改动 #118/#121/#127/#130 与权威 29 号台账。

## 5. 下一开发/集中验收边界

**L02-01 仍待产品开发与调研**：通过一致性快照追踪 V1→V2 映射（尤其创建与投影后的案卷选模板）、缺失源文档与重审 Run freshness、本地 reviewer 人工 group-action/定稿/重开/outbox 正反覆盖、C 工具循环及 Stop/resume 归因。允许继续云端无 Provider 工程，在成熟后批量做实机验收。若这些被别的 PR 并行改动，请先审阅最新远端 HEAD 并维护无混版工作树。

**L02-02**：原件读取与 SourceRef、扫描型 PDF、Office、CompactContext 的真实可操作链路，可并行做静态开发，但不借 E05/E06 历史结论越权放行。

**统一验收**：留到多轮功能开发全部完成后，冻结最新集成 SHA，真实 GUI 测多批回流与版本门禁、真 Pi C、E05 本地/校方分层业务、E06 必需受影响回归；按两套独立合同分别签收。缺合法校方身份只阻断**正式签批 LIVE**，不应无理由阻断合成案卷本地事务回归。

**当前口径：#131 Draft / L02-01 R02 offline development；E05 LIVE NOT ADMITTED；E06 LIVE PARTIAL；P06 PARTIAL；MERGE NO-GO；P07/P08 NOT STARTED。**
