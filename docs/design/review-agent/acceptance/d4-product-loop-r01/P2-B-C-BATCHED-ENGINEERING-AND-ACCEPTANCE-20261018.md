# CDUT Studio D4｜P2-B/P2-C 离线连续开发与批量验收制度（2026-10-18）

> 本文是 P1-C/P2 工程推进的**正式执行合同**。任何 Agent 接手本阶段须先读取本文件；不能以阶段报告或 CI 冒充 Electron 实机、真实 Provider、学校审核政策或 P06 验收。

## 0. 现有冻结链（按实际 SHA）

- P1-C 原生材料入口和 20 秒推荐：PR #109，候选 `4dce31f4792a188e969c0bdbedd844620a82aaf6`；独立 Xvfb 报告 PR #111 `56d2492cd1d8c3559d55de28ab7383948df394f8`：C01–C09 scoped PASS，C10 false-failure FAIL。
- C10 同步防重修复：PR #112，`2e24e0c9a24d378a5b7f2e160c81c03041a2859c`；3729 pass / 6 skip / 0 fail，**未找到独立新实机 C10_PASS**。原 #111 不可覆写。
- P2-A 提示契约、107→70 requirements 无损正文词典、逐 Check 映射：PR #117，`ff1aa01670bbeeeba33aa0f01efdf4d8da87bb9e`；3735 pass / 6 skip / 0 fail，尚未配对模型性能对照。
- 上述 PR 均是 Draft，**不自行合并主仓、P06、冻结 Gold 或真实校规**。阶段结论：`OFFLINE_ENGINEERING_PERMITTED`，不是 `RELEASE_ACCEPTED`。

## 1. 调整后的统一工作方式（替代“每轮开发立即实机”）

**阶段顺序**：P2-B 独立分支代码与测试 → P2-C 从 P2-B 固定版本另开分支代码与测试 → 独立统一工程集成/最终 HEAD CI → 一次独立 Electron/Xvfb 离线 GUI 批量验收 + 一次受控模型 A/B 测试 → 按归因定向修复 → 签署候选。阶段之间须保存固定 HEAD SHA、父子关系、Draft PR、变更摘要、负例、运行输出和未决问题。

**开发与验证分离**：同一 Agent 可做静态检查、纯 Bun 单测、真实 Main/service 测试、样本 Prompt 差分；不得由自己的开发结果宣布 `GUI_PASS` 或 `PROVIDER_PASS`。实机由独立 Agent 在冻结 SHA、隔离 OS 账户/profile/工作树上执行。拒绝整轮“干跑”，每项验收有明确 Go/No-Go 和最低证据。

**每个开发 PR 的硬门禁**：
1. 主仓未变更、无覆盖原 #109/#111/#112/#117；干净独立分支，固定父 HEAD，提交可复现命令与 Git SHA。
2. 新增正反例，运行 TypeScript、包边界、Main/Preload/Renderer 构建、全仓单测和 D2/D3/COMMON 对应 CI。必须引用该 PR **最后一份生产代码 HEAD** 的实际 CI；红灯必须修复并保留首次失败记录。
3. SourceRef、逐 Subject EvidenceLink、RuleSpec、三态适用性、`candidate-held`、D2 fingerprint、不可变 Plan、Pi Main tool allowlist 和拒绝闭环不可放宽。新增优化不能让未读材料或错误引用“默认为通过”。
4. **代码级验收通过**写 `CODE_CI_PASS`，**模型效果未测**写 `MODEL_NOT_RUN`；**真实 GUI 未测**写 `GUI_NOT_RUN`，跨越两个层级是失败。
5. P06 后台 owner / Pi 五工具权限与 Provider 是独立门禁。不得通过 P2 合并/工具扩权绕开。

## 2. P2-B｜真实 Prompt 离线差分及回归基建

**目标**：对 *真实* `preparePiReviewRunV2.userMessage` 建立可离线执行的稳定测量入口。优先在既有合成 D4 G08 模板创建隔离的 2 Subject/107 Check D2 案卷，调用实际 Pi run-preparation，但**不调用 Provider**、不写生产用户目录。Runner 每次新建临时 profile，结束后清理。

必须至少输出：Git HEAD 或 `SOURCE_SHA`、fixture/template ID/version、subject 数量、runId/Plan fingerprint、prompt 字符数、UTF-8 字节数、主要片段长度（规则/映射/合同/正文）、Rule ID/Check ID 完整性摘要、提交-schema 字段、未确认政策语义、SourceRef 边界说明、是否触发模型（必须 false）。可在控制台输出 JSON，并允许写 JSON 文件。

**新旧配对**须在两个固定 worktree 用同一合成业务 selection 各执行一次 Runner 并用对照脚本比较；不能仅把归档 PR #100 的 129394 字符作为“同输入精确 A/B”——它来自另一个运行的输入包，可单独列为历史参考。若切换工作树或 import 的目标不一致，报告 `UNPAIRED` 而非统计百分比。自动差分须检测模板版本、规则总数、目标数、Check ID/Rule ID 集合、要求正文重建、SourceRef 作用域等，不因 prompt 更短而删除已固定的规则。

## 3. P2-C｜最小化工具拒绝与恢复开销（保持服务端门禁）

针对历史 PR #100 的 34 次拒绝，重点是错误 FieldSpec Observation、未确认 RuleSpec 却报 compliant、缺逐对象 EvidenceLink、unknown 误标 not-applicable。优化**现有** `review_submit_result` 的可消费拒绝提示/续交指引；不得修改允许状态、来源校验、`validateD2GuardSubmission` 或正式权限。不能通过“降级输出接受所有提交”来减少拒绝数。

必须：
- 将结构化 `rejected[]` 归因为稳定类别并给出**下一步可执行且不过度承诺**的修正说明；`missingChecks` 保持原值，不擅自减少检查。
- 单批工具提交结果需保持 `accepted/rejected/status` 完全真实，追加诊断字段需可选兼容，内容有长度和数量界限；不能泄漏其他案卷/Subject。
- 旧 `finish=false` / `finish=true` 语义和恢复同一 Run 保持，未完成状态应可继续而不是重新建案，且仅 valid checks 计入进度。
- 正反例覆盖：虚构 fieldKey、未确认 RuleSpec、缺证据或跨对象引用、无效 SourceRef、空理由、缺检查/有拒绝仍 finish=true、修正后合法续交。使用冻结合成输入，不碰隐藏 Gold。

## 4. 一次集中独立验收（开发完成后统一发任务）

**A. Electron/Xvfb（无需模型）**：在统一集成固定 HEAD 新建隔离工作树和原生选择框，短程复核 C10 连续双击和 Enter+click；无错误 toast、只有 1 case+1 application，source hash、D2 fingerprint/Subjects、重载状态不变；抽样 P1-C 20 秒人工改选，GUI 不自动确认对象。按 GUI、Main IPC、文件哈希分别取证。

**B. 真实 Pi A/B（须用户授权测试 Provider）**：固定样本、模板、模型/provider、采样配置和最大预算；旧 #112 Prompt vs P2 新 Prompt，区分 input/output/cache_read/cache_write token，记录单次时长、拒绝分类数量、全部 Check 覆盖、Main 拒绝的未确认/跨对象/SourceRef 结果、完成/部分完成、成本区间。最少两组有区分度的合成案例（有效证据+反例），优先做小样本，不以一次随机模型结果断言统计显著性。无凭据或授权则标 `BLOCKED_ENV`，绝不可伪造 Provider transcript。

**最终门禁**：P2-B/C CI PASS + 集成 CI PASS + C10 GUI PASS + 独立 A/B 报告（或明确在线 `BLOCKED_ENV` 并降低发布声明）+ P06 独立依赖状态确认。未签署不 MERGE，不称正式业务产品发布。

## 5. 停止条件和成本原则

- P2-B/P2-C 做完并通过离线 CI 就停止添新功能，只做必要的修复。严禁“跑着跑着扩成 50 套自动路由研究”。
- 首选只读日志和离线脚本，不为“多跑几次看看”浪费本地 Agent 时间。
- 遇到 Provider、上游 P06 或学校真实权限阻断时如实标 `BLOCKED`，不中断独立的纯技术开发，也不偷偷跨权替代。
