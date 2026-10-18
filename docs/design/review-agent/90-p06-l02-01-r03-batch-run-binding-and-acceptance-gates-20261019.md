# 90｜P06 L02-01 R03：批次 Run 归属持久化与跨批误判隔离（2026-10-19）

> 本文件记录实际提交的代码改动，不是 E05/E06 新一轮实机验收。**用户要求继续开发、集中验收后置。** 分支 `feat/p06-l02-01-r03-batch-run-binding-r01` 独立从 #131 工程 SHA `85fdc1038751114a38a4cc396840d28f0032ba35` 派生。#130 原始证据、#127、#118、#121 与 29 号权威台账不修改，业务 LIVE 准入不变。

## 原因与范围

#131 的 89 号文档正确指出，单纯按模板版本过滤 `latestRun(caseId)` 仍不能证明该 Run 属于哪一个批次：**同案卷跨两个同模板批次**时，旧批次可能借用另一批较新的 Run，错误显示覆盖、启用自动处理或按组作出人工业务决定。本轮修复这个已知根因级缺口，不创建第二套审核运行器。

## 1. 完成的工程变化

- `BatchStateV2.cases[]` 增加可选 `runId`，兼容没有绑定的历史数据；真实 `RUN_BATCH_V2` 在返回 `ReviewRunV2` 后，向 `runBatchQueue` 交付 `status + runId`，与对应队列项一起持久化。技术失败但 Run 已返回时同样留其身份，以供明确失败归因。
- 重新进入 queued/running、补件回流和主动重试时**清除上一轮 runId**，避免旧证据“复活”。崩溃中的 running 案卷不能直接冒充已完成；恢复为 failed 并显式手工处理。
- `BatchPanel` 使用已绑定的 Run ID 从当前案卷历史中精确读取；`selectBatchMatchingRun` 同时验证 case ID、模板 ID/版本与 inputManifest 版本。无绑定或绑定失效的历史 done 显示风险提示，不能盲取另一个最新 Run；真实 batch 执行后的 triage 也只使用本批结果。
- `batch-automation-service` 和 `batch-group-action-service` 从实际批次的 `entry.runId` 获取 Run，而不是全局最新 Run。自动审批执行中再次检查仍为同一 done 队列项 + 同一 runId；group preview/apply 亦确认来源一致。**无绑定的旧记录 fail closed**：不向无依据的自动/批量批准下沉权限。
- `retryBatchCases` 允许用户明确选择重跑没有可信 Run 绑定的历史 done，但有绑定且真实完成的案卷不能无故重跑。重试以后旧绑定清空。
- 不提升本机 reviewer 为校方身份，不改变 SourceRef、隐藏 Gold、自动审批授权策略、历史 outbox actionId。

## 2. 离线回归

新增/扩展覆盖 `batch-ui-feedback.test.ts`、`batch-group-action-service.test.ts`、`batch-automation-service.test.ts` 和 `batch-store.test.ts`：
- 同案存在另一个更晚、同模板但**不属于本批**的 Run，不可影响本批的自动审批和组操作；
- 老批次无 runId 不可继承 latestRun 后批准；
- 新 Run 绑定、不同绑定拒止、补件及重试清除旧绑定；
- 人工/group 的原正反回归与 outbox/快照原测试保持。
- **CI 必须以最终 R03 SHA 为准**。如果 CI 失败，记录实际错误并修补，不能拿 #131 旧成功作为 R03 证明。

## 3. 后续尚未完成

- 真实 C 的 24 轮工具序列未从私有证据解密核验；不提高 maxTurns 或编造缺金额结果。#131 目前在**所有 required checks 已被工具接受**的极窄情形下仍允许返回无摘要的工具回执兜底；必须按既有 SDK 正反测试确定该边界，不能把“有部分提交”与“所有检查已接受”混同。
- 产品层存在 V1→V2 投影版与 batch/run 版本核对的历史疑点；本轮新增不可猜测的 Run 归属，但不能由此宣称 #130 原始案卷记录差异已经找到确切原因。
- 本机授权 Reviewer 的人工确认、完整 group/finalize/reopen/outbox、严格扫描原件、真实 SchoolPort、Claude、Windows/macOS、Relay/Pocket 与 ENOSPC **本轮均未实机执行**。
- 下一阶段建议：先补完本地业务权限内的人工批次处置和出站配置的产品正反路径、统一合成业务样本的跨阶段回归，再与 L02-02 源材料/长上下文一起集中验收。

**阶段口径：R03 ENGINEERING ONLY；L02-01 E05 LIVE NOT-ADMITTED；E06 PARTIAL；P06 PARTIAL；MERGE NO-GO；P07/P08 NOT STARTED。**
