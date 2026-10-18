# 60｜新会话任务书：独立重新执行 P06 L02-00（2026-10-18）

## 角色与边界

你是 CDUT Studio 审核后台会话 P06 的新一轮 **L02-00 独立事实归因与真实运行验收 Agent**。用户已明确要求换会话并**从头重做 L02-00**，不是从上个会话的中断处写结论，也不是直接推进 L02-01。

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

本轮仅对 A/B/C 历史审核队列，尤其 C 案 execution-failed 的来源、修复真实性、材料/assignment/工具/provider/SourceRef/V2/批次账本一致性作严谨调查。可以在本轮权限内独立运行合法的受控验证、真实 Electron/Main/Pi 合成案卷复演，保留原始失败和日志。在需要最小代码修复时必须先复现并记录、明确责任边界和回归；若属于 P06 已有“L02-00 不改生产代码”的验收范围，则将修复拆到独立补丁而不污染原归因样本。

**严禁为了达成 PASS 改 Gold、伪造运行日志、删除原首败、降低审核授权/SourceRef 检查。不得合并 main、进入 P07/P08 或把受控 CI 算成新的 Live E2E。**

## 第零步：重新冻结实际远端

1. 实查 PR #21 / #72 / #98 / #99 的 head、base、Draft 状态及最新工作流，确认是否有并发修改；不要凭本文时间点猜最新 HEAD。
2. 默认源基线采用 PR #99 已查固定 HEAD 5bfa339eaacc16705e6f2693ca39b1e81e5a60d5 的生产树和历史审查脚本；本交接文档提交后 HEAD 会改变。读取新 HEAD 变化，验证未污染生产代码。PR #98 固定源码为 2d9e93f3a637e8325862769f80fe4b4e884c51a1。
3. 使用独立 git worktree / clone / 独立合成 profile；不得改已有工作树的未提交内容。原则上继续独立 Draft PR #99 的归因工作；若 PR #99 正被并发修改，创建专用后续分支并记录 lineage，禁止 force push。
4. 阅读本任务书、59 状态交接、27 架构、29 权威 LIVE、46 原实机、47 阶段合同、49 版本排序、54/55/56 U0/U1、57/58 上一轮调查，以及 32/71/79 外部与已知风险。
5. 将所有读取过的文件和 Git 记录逐项注明“源 SHA / 工件 / 证据等级 / 是否适用于本新运行”。先创建新一轮事实台账，不直接复制旧报告的 PASS。

## 阶段 A：历史独立复核（必须重新执行）

- 打开 scripts/qa/p06-l02-00-archive-attribution.py、.github/workflows/p06-l02-00-archive-attribution.yml 与 scripts/qa/review-live-batch.mjs，独立审查验证器本身的假设，不只是点开 green workflow。
- 在确定有历史 Git commits 的独立 checkout 中执行等价命令：

~~~bash
mkdir -p /tmp/p06-l02-00-rerun
python3 scripts/qa/p06-l02-00-archive-attribution.py \
  --out /tmp/p06-l02-00-rerun/historical-ledger.json
echo "exit=$?"
sha256sum /tmp/p06-l02-00-rerun/historical-ledger.json
~~~

以上路径只是临时执行示例，正式 raw/public 工件应放在隔离目录并建立自己的 hash manifest。必须保留真实退出码，不得在 shell 失败后接着用 echo 的返回码冒充执行通过。

- 再自行读取冻结 Git 源码 d24d1c2 和 b95b44f 中 apps/electron/src/main/lib/review/v2-executor-factory.ts，对 case/group 无 subjectIds 但已通过插件工具提交的 fallback 条件进行差异检查。
- 对照历史 corrected、witness、selected 三份原 JSON，验证 9 条不重合的 case/run ID、状态、每个 SourceRef 数量、两项 command exit1 与一项 exit0、archive SHA-256 与已有 manifest；核对工具/Provider witness 属整批而非逐案。
- 标记分类：old duplicate fallback 是 EXECUTION_FAILURE（历史）；b95 C 的 awaiting-supplement 是 BUSINESS_INCOMPLETE / NEEDS_SUPPLEMENT（只按实际业务证据）；过期问题组与未开代批是不同路径的 CORRECT_DENIAL。若没有合法输入不能臆断为 HARNESS_INVALID 或模型故障。
- 验证原始脚本测试的 A/B/C 为三份预算文本（100 元、120 元、缺金额），与用户业务领域 D4 的 A/B/C 阶段或旧人工审批并不等价。

**阶段 A 退出：** 形成独立九案矩阵，重算 SHA-256，给出可复现的历史根因与无法证实的字段；不得仅凭 PR #99 #39070327923 PASS 代签本轮。

## 阶段 B：逐案 provenance 和 C 归因

对每个历史 caseId/runId 查找以下信息，逐项记录“得到/未得到、证据路径、可信等级”，不可猜值：

- inputManifest.hash、模板 version、policy/rule version、材料源 path/hash、documentVersionId / parseRevision；
- assignmentId、turnId、runId、sessionId、caseId 关联，审核白名单与授权撤销 timeline；
- 每次真实模型/provider 调用（包含 token 见证但不重复计算 stream event），严格工具名称、input/output、成功/失败及 SourceRef；
- V2 checks、引用位置/quote、覆盖、人工动作、batch ledger、各层终态、失败原因；
- private/raw/public 日志及 SHA-256，公开库不得包含真实 profile、密钥、transcript、用户个人案卷。

如果历史归档确实只有简化 Check、无完整 assignment/input manifest 或私有 transcript，应明确写 MISSING_PUBLIC_EVIDENCE 或 UNDETERMINED。**不得将新建 case 冒充原 C 案**。如果发现另外一种技术错误，必须给它单独的案例标识和重现证据，不得把所有 C 异常都归为旧 fallback。

## 阶段 C：新版真实复演与 U1 门禁

在运行任何可签 LIVE 的 L02-00 之前，核实 55/56 的 U1 真实安全入口：Office #71 的同名文档碰撞影响范围、严格 Pi 五工具在 runAgent/Main 的授权、SourceRef 版本失效与拒止、普通预览与 owner 隔离、关键 Renderer 迟到事件。U0 工程通过不替代 U1 LIVE。

- 若合规隔离设备、合法 Pi provider 配置、真实 Electron/Main/Preload/Renderer 链路均可用，按 46 号的可复现驱动做**本轮独立的真实三案运行**，完整锁定源码 SHA、输入 hash、模型/工具回执、case/run/assignment、V2 账本、PDF/Office 读取等级、UI 操作和退出码。不能使用真实校方行政资料；只用合成输入。
- 若 U1 关键安全入口仍 BLOCKED，可以进行只读归因或有明确隔离的诊断试验，但**不得给 LIVE PASS**，不要求修改 Office #71 来求绿。无授权 provider/设备则 NOT-RUN / BLOCKED_ENV；不要说“测试应该通过”。
- 每个新案创建独立 ID、标记 NEW_SYNTHETIC，不能代替旧历史案。对 C 的缺金额应确认“需补件”是否按规则正确生成；不得仅靠模型说 compliant 或 batch done 判为行政审批成功。C 的真实补件回流、人工审批和幂等主要属于后续 L02-01，明确交接而不误签本轮。
- 若重现 execution-failed，先保存新的 raw 首败，再查 cause 是真正工具/模型执行异常、预期拒止、材料不足、夹具无效或未定。符合权限的最小修复在**另一个范围清楚的修复提交/PR**评估，不改原始 Gold。

## 阶段 D：验收判定与交付

请在仓库新增本次“R02 独立重新执行”的结果文档及机器可读矩阵，不能覆盖 57/58、29、旧 37/38/44/46。建议使用与 59/60 区分的顺序编号，首次失败证据永久存档，明确范围。

### 每一条结论必须有

- 候选 commit/tree、OS、Bun/Node/Electron 版本；
- 具体 case/run/assignment/材料或 null + 原因；
- 输入 hash、规则和模板版本、真实命令+exit、Main/IPC/PI 工具 witness；
- SourceRef / V2 / batch /人工动作 与预期、实际差异；
- 证据级别：STATIC、ARCHIVED_REAL_RUN、CONTROLLED、MAIN_IPC、PI_PROVIDER、IO_RECOVERY 或 NOT-RUN；
- 公开脱敏日志、raw 私有保管路径、SHA-256、确认者；
- 五类归因、根因证据、残留问题和后续责任分支。

### 本轮最终应返回

1. **HISTORICAL ATTRIBUTION**：是否独立复现 9 案归因及所有哈希、是否还有其他解释；
2. **PROVENANCE COVERAGE**：每案哪些字段成功取回，哪些证据事实上缺失；
3. **NEW CONTROLLED / LIVE**：同候选实际运行的范围、通过/失败/不可执行，不能用旧 b95 的 16/16 充数；
4. **C ROOT CAUSE**：旧重复 fallback、C 业务需补件及其它新错误逐项分开；
5. **L02-00 EXIT**：HISTORICAL_PASS / LIVE_PASS / PARTIAL / BLOCKED，明确正式总签收是否可给；
6. **L02-01 准入**：需要先解决哪些 U1/P06 风险，哪些环境/外部阻断不妨碍业务验证；
7. **交付**：独立分支/commit/Draft PR、CI run/artifact、文档和原始证据、风险登记。

只有 29 号权威 LIVE 所需证据真实满足且用户验收后，才能更新其对应 PASS。不能自行宣布 P06 通过、解除 Draft、合并或进入 P07/P08。

## 不能碰的范围

- Office #71 共享索引修复按用户约定延后：集中验收后下一轮先单独上游 PR，再有必要时提交我方审核侧 PR；本轮只能复现与证明影响。
- PR #21/#72/#98 不 rebase、不强行合并；上游/main 不直接更改。#99 是历史只读审查的基线。
- P04 永久 tombstone / owner UUID journal 无安全证明不得 TTL/GC；P05 生产 Relay 多 viewer 及 Pocket 独立目标仍 BLOCKED/TARGET NOT-RUN。
- 不新建另一套 Agent 引擎、V2 账本、通用 eventbus，不改变 Main ACK 与 Renderer 视图分离，不把 owner 当业务授权。
- 不修改隐藏 Gold、真实校方数据、历史 raw 失败，不降低严格审核工具/Scope/SourceRef 权限。
- 不做 D4 模板制作、网站开发、P07/P08；本会话完成 L02-00 再决定进入 L02-01。

**执行从现在开始，先真实工作、再形成结论；在当前授权与环境允许的范围内尽可能直接完成，而不是只提交另一份计划。**
