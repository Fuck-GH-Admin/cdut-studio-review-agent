# 61｜P06 L02-00 R02 独立重新执行：首败因果、逐案来源与安全门禁（2026-10-18）

> **本文件属于新会话 R02，禁止引用 58 号作为本次验收通过证明。** 后继独立分支 `audit/p06-l02-00-r02-independent-20261018` 基于 PR #99 固定 HEAD `66dc3f099e4711b8889d24fabb893973896c71ee` 创建，生产源码不修改。最终 CI 证据须以本分支当前 HEAD、Actions job 和 artifact 另行锁定；本文件建立独立事实、证据等级和不能签署的门禁。**P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO**；P07/P08 NOT STARTED；29 LIVE 不改。

## 1. 新会话先做过的远端复核

- 59、60 两份任务书与交接；27 架构、29 LIVE、46 真实旧机、47 L02 合同、54/55/56 U0/U1、57/58 历史调查，及源代码和三份原 JSON 已重新取阅。
- PR #21=`ecea6de83e2a384caad03805a6b2e7b12fb05dea`，#72=`b1bcaffe5b9aa9ac7e02f71c95e651f24a17297f`，#98=`2d9e93f3a637e8325862769f80fe4b4e884c51a1`，#99=`66dc3f099e4711b8889d24fabb893973896c71ee`；均 Draft/Open，查远端时无 HEAD 漂移。#99 已有旧 archive CI success；这是新会话的输入**不是**R02 成功记录。
- #98 固定 HEAD `2d9e93f3` 的 Actions #39068176008 两项 job success（U0 工程与 U1 受控 SourceRef/Office），Office #71 真实同名索引风险尚未消除；最新完整 Main/IPC/Office/Provider/Preview/Owner U1 LIVE 未签收。
- 独立容器：Git 可用、Node 22.16.0、Xvfb 存在，但 Bun 不存在且 `git ls-remote` 对 github.com DNS 失败。不能在此环境声称执行新的 Electron 或 Pi/provider。为避免碰旧工作树，用 GitHub 仓库通道创建独立 R02 分支与 Ubuntu 历史复核 / self-hosted Bun 受控定向任务，原始结果按 CI 真实 exit 记录。
- **并发/权限**：不动 #21/#72/#98/#99/main，上游不合并。以 `#99@66dc3f09` 为唯一父引用；本次分支不覆盖原 57/58、29、37/38/44/46、隐藏 Gold。

## 2. 直接对原始记录审查得到的独立事实

原历史材料根：`docs/design/review-agent/acceptance/p06-recheck-live-20261014/`。三批由 `review-live-batch.mjs` 在隔离 profile 创建**不同**三份合成预算文本：A=100元，B=120元，C=金额缺失。caseId 与 runId 在三批均不相同，彼此之间不可互相替代。三条 run 都 `completed`，队列中各案为 `done`，全部 `decisionCount=0`。

| 原始记录 | 源 SHA | 原命令 exit | A / B / C 原业务 Check | 同规则错误 fallback | **原命令直接停止原因** |
| --- | --- | --- | --- | --- | --- |
| `records/live-final/batch-corrected/batch-real-result.json` | `d24d1c2` | 1 / FAIL | compliant / non-compliant / awaiting-supplement | 三案存在 | `AssertionError: 每案实际模型用量均非零`：断言读取 V2 `modelUsage=[]`，在 providerWitness 写入 JSON 之前中断；并非由 fallback 判词直接触发命令退出 |
| `records/live-final/batch-witness/batch-real-result.json` | `d24d1c2` | 1 / FAIL | 同上 | 三案存在 | 含 `问题组已失效或不再存在` 的预期过期组拒止从 IPC 传播到驱动，导致当前脚本 exit1；此拒止**不等于模型执行故障**，实际 Promise/夹具接收时序应另开问题核实 |
| `records/live-b95-final/batch-real-result.json` | `b95b44f` | 0 / PASS 子集 | 同上 | 不存在 | 测试驱动 9 断言均 PASS；C 仍待补件，整个 A/B/C 工作流**未办结** |

以上机器 JSON 的原 SHA-256 锁定为 `4a32389840d71edcb3aca64408f4628da12deeaeccb5379060f38b7b1f3fac2a`、`cbb3fdc36486c593152a3e4d19ae892b6f9e040ba8b694f63d611e1c11d096a3`、`381bc830150d3399ce241176489c615cfb22c304bd04a56f23b308fbba0cb1d1`。**需由本轮 R02 CI 重新按字节计算才能标 R02 verified**；不能把旧 58 CI digest 当新运行结果。命令记录见各批 `batch-real.command.json` / `06-batch.command.json` 与归档 `evidence-manifest.json`。

### 新会话对 58 号的修正

58 号把两份旧 FAIL 与重复 fallback 密切联系，**但旧 Check 中存在重复 fallback ≠ 命令退出直接由它导致**。R02 额外逐项核对 `data.error`、失败断言、providerWitness 和队列事件，分别记录：

1. **证据级别 STATIC + ARCHIVED_REAL_RUN**：旧 `d24` 在同一个 `section-all-budget` 同时生成带 1 个 SourceRef 的语义 Check 和无 SourceRef 的 `execution-failed`；旧生产源代码当时用 `existingTargets.size > 0` 判断是否已提交。case/group 规则无 subject 时集合为空，因而发生**错误的额外 fallback**。
2. **源码最小修复可静态证明**：`b95` 生产源对应改为 `pluginRuleIds.has(rule.id)`；两个 Git 版本的该文件仅这个谓词不同，候选当前生产源与 b95 的文件 blob 相同。仍须本轮真实 Bun test 才可称 **NEW CONTROLLED**。
3. **独立批次中的 C**：旧 d24 C 的额外 Check 分类 `EXECUTION_FAILURE (WRONG_FALLBACK)`，C 本身的 `awaiting-supplement` 分类 `BUSINESS_INCOMPLETE`；b95 C 没有同一缺陷，但并非旧 C 的补件回流、人工确认或正式审批完成。
4. **过期问题组 / 未开全局代批**：正确拒止若有完整回执才能分为 `CORRECT_DENIAL`；不能因 witness 的驱动退出就说业务允许越权，或把这次业务拒止算 C 的技术失败。

## 3. R02 逐案 provenance 覆盖合同

机器输出 `nine-case-matrix.json` 每条实际列出 caseId、runId、创建顺序关联的 batchId、合成预算类型、源 SHA、独立状态/SourceRef 数量、重复 fallback 与正式决定数。对应字段不可得时**显式标原因**：

| 字段 | 现有公开归档是否可可信还原 | 不允许推导的内容 |
| --- | --- | --- |
| caseId/runId、批次归属、Check status、SourceRefCount、队列/run terminal、decisionCount | 原 JSON 存在；须由本轮脚本严检 JSON/创建顺序/命令记录/哈希 | 不能从 run completed 推审批成功 |
| 每案 inputManifest.hash、真实输入路径/字节 SHA256、模板/政策/规则锁、材料 documentVersionId / parseRevision | `MISSING_PUBLIC_EVIDENCE` | 脚本中的合成文字不可替代历史原文件 hash |
| SourceRef 真实 quote/location、证据覆盖、逐案严格工具输入/输出 | `MISSING_PUBLIC_EVIDENCE`（只存 SourceRef 数量） | 数量为1 ≠ 文本/页码/时序已核准 |
| assignmentId、turnId、sessionId、撤权时序、人工确认/补件闭环 | `MISSING_PUBLIC_EVIDENCE` / `NOT_EVIDENCED` | 不据假设填 UUID |
| provider 用量及具体 tool call | corrected 未捕获 provider witness；witness/selected 仅**整批聚合** SDK 事件，无 case/run 绑定；部分 stream event 重复 | 不逐案分配 token，不重复计算计费，不虚构 C turn |
| 历史 raw 私有 profile/transcript | 46 `raw-inventory.json` 仅列旧私有路径与哈希，本轮无该私有目录访问 | 不复制真实账号/密钥或声称已取得 transcript |

## 4. 本轮独立工程交付与证据方法

- 新增 **独立于 58 号脚本**的 `scripts/qa/p06-l02-00-r02-independent.py`：打开原 9 条，重新计算 archive / command / stdout/stderr 的字节 SHA-256，强制三份 manifest 条目存在，校验创建/队列/执行三层 ID 联结，不依赖旧脚本的 `zip("ABC", EXPECTED, runs)` 裸顺序假设；对比冻结生产代码的真实 Git blob；分开保存历史命令退出直接原因。
- 新增 `.github/workflows/p06-l02-00-r02-independent.yml`：Ubuntu 历史只读独立核验 + self-hosted Bun 1.4/Node22 的 **新版受控** `review-batch-case-fallback`、停用材料 SourceRef、不同版本 SourceRef 专项回归。**有 CI success + 明确测试 exit/日志/sha 才可将两栏写 PASS**；工作流成功也不冒充 Main/IPC。
- 不执行自动 provider 或 Main LIVE 的默认 workflow，不连接密钥，不发真实行政审批；`PROFER_CONFIG_DIR/PROFER_USER_DATA_DIR` 的新版环境、授权 provider 和安全门禁未经提供时，`NEW LIVE E2E=NOT-RUN / BLOCKED_ENV_AND_U1`。

## 5. 三栏判词与 L02-01 准入

| 栏 | 现阶段可签范围 | R02 总签收 |
| --- | --- | --- |
| HISTORICAL ATTRIBUTION | 待本轮 Actions 实际确认 9 案 SHA256、原命令 exit 和 code predicate；不能借 58 的 SUCCESS | PENDING_R02_CI |
| NEW CONTROLLED REGRESSION | 同 R02 HEAD 的 Bun 真跑定向三份 test 及日志；不能套 #98 历史测试 | PENDING_R02_CI |
| NEW LIVE E2E | 本轮无授权 provider、合规隔离 Electron profile，且 U1 Office #71/Main/IPC/严格 Pi/Preview/Owner 未解锁 | **NOT-RUN / BLOCKED** |

**L02-00 正式签收仍为 `PARTIAL / NOT ACCEPTED`，不能进入 L02-01 的正式业务验收执行。** 可以做不涉及发布授权的输入准备、隔离合成数据和后续复演安排；正式 L02-01 必须先有固定最新安全候选的 U1 Main/IPC/Office/严格五工具、撤权后不写入、SourceRef 原件引用、preview/owner 正反回执。需要能隔离运行真实 Electron/Pi、授权模型、真实输入 manifest/hash 和逐案工具/权限日志；否则完整业务矩阵不可签。Office #71 本阶段只能测影响不改共享源码，集中验收后另开上游 Office PR；P05 Relay/Pocket 的外部门禁不妨碍 L02-00 静态归因但阻断整体合并。P04 tombstone/UUID journal 永久安全记录不动。

验收者：R02 独立 Agent（自动化结果需 CI 和用户核验）。**不更改 29 号唯一 LIVE-01～08，不合并任何 Draft PR，不进入 P07/P08。**
