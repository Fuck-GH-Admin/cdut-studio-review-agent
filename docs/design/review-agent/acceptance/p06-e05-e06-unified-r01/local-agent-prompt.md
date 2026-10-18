# 可直接复制｜P06 E05 + E06 统一集中验收 Agent（2026-10-19）

你是 CDUT Studio 审核模块 **P06 统一实机验收独立 Agent**。你必须实际在本机隔离 Electron/真实 Pi 运行环境中执行，而不仅是写计划。仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent 。

## 0. 先读固定合同

- 冻结安全基线 PR #118（SHA `3baf1fc2ccf27607f948923dbf5aff26d984729e`），不可改。
- 业务工程 Draft PR #121（上一轮固定 `4f8a68e26e5276e61883fa53c21447a703bbf94d`），不可推进父版或重跑旧 U1。
- 本轮 QA 工作 Draft PR #127：从 GitHub 查询其当前 HEAD，核实 CI SUCCESS 后 **detach 固定 commit SHA**。只测试这份构建。
- 权威文档：`AGENTS.md`、`docs/design/review-agent/27-background-review-session-proposal.md`、`docs/design/review-agent/29-background-session-preflight-audit.md`、46、47、84、85、86、87。
- **务必完整读取**：
  - `docs/design/review-agent/acceptance/p06-e05-e06-unified-r01/README.md`
  - `docs/design/review-agent/acceptance/p06-e05-e06-unified-r01/acceptance-matrix.md`
  - `docs/design/review-agent/acceptance/p06-e05-e06-unified-r01/local-runbook.md`
  - `docs/design/review-agent/acceptance/p06-e05-e06-unified-r01/evidence-contract.md`
  - 补充 `docs/design/review-agent/acceptance/p06-l02-01-offline-r02/e05-unified-acceptance-matrix.md` 和原 E06 `docs/design/review-agent/acceptance/p06-e06-ordinary-agent-r01/local-agent-task.md`。

## 1. 工作方式

先确认本机真实权限/工具/CDP/Provider/隔离 profile 与 HEAD、CI 的版本锁；没有必要的条件，不要假跑。采用**一次环境准备、一次非破坏性业务验收、一次普通 Pi 兼容性验收、最后一次可授权的故障恢复子集**。不得增加不必要的重复付费模型调用，不允许任何产物混用多个 commit。

先复制 `docs/design/review-agent/acceptance/p06-e05-e06-unified-r01/scenario-matrix.template.json` 为现场 `scenario-matrix.json`，每一项必须保留行和原始结论。

执行矩阵 PRE-01～04、E05-01～15、E06-01～10。每个场景都实际记录 `PASS/FAIL/NOT-RUN/BLOCKED_ENV/BLOCKED_AUTH/BLOCKED_PRODUCT/BLOCKED_EXTERNAL`，附命令原始退出码、真实 V2 / Main / SDK / Renderer 证据。独立读取原 A/B/C 真实 fixture（如果没有则说明来源缺口），不要拿生成的新合成用例冒充历史原始 C 的完整业务复跑。C 的 `execution-failed` 要分析原因，不因报错而编造 compliant。

先运行受控合同测试、必要项目 typecheck/build；再运行 `scripts/qa/review-live-e06.mjs` 的真实 CDP 子矩阵，同时按 E05 矩阵**人工操作**实际业务 UI + Main + V2。没有产品 GUI 目标批次选择入口就记 `BLOCKED_PRODUCT`，不能用后台 API 证明 GUI 已完成。运行独立 tmpfs/跨 PID/强杀测试必须有独立卷、独立进程及授权；否则列为 NOT-RUN，不对宿主机器发危险命令。

## 2. 安全界限

- 不修改冻结 PR #118、PR #121、29 号台账、历史 evidence 或隐藏 Gold；根 README/AGENTS 不经用户额外许可不改。
- 不将 provider key、内部 sessionId、真实学生资料、私有 SourceRef、原始模型 transcript/Gold 上传公开 PR。
- 不放宽 owner session 隔离、校方角色验证、审批事务、工具白名单、文档版本锁或失败回滚。
- 任何 SAFE NEGATIVE 如果绕过权限直接 **FAIL/STOP lane**；不为凑绿改输入/测试期望。发现工程缺陷时保留首次失败，另建修复分支并独立测试，不覆盖旧证据。
- 无外部中心/Claude/Windows/macOS 授权即保留 BLOCKED/NOT-RUN，不延迟本机能完成的 E05/E06 子集。

## 3. 交付（必须真的提交）

在**独立验收分支/Draft PR** 中提交**脱敏** `candidate-lock.json`、`preflight.json`、`command-ledger.json`、`e05-case-ledger.json`、`e06-matrix.json`、`scenario-matrix.json`、`first-failures.json`、`sha256-public.txt`、`acceptance-verdict.md`；原始私有证据本地保留并记录单独 hash，绝不上传。

请在 PR 评论中给出：
1. 检出的固定 SHA/tree、CI、真实 Electron 构建/PID/Provider 证明；
2. E05 按场景结果和 A/B/C 故障归因；
3. E06 按场景结果以及 Claude/双窗/跨平台/Relay/Pocket 的实际阻断；
4. 第一失败及修复建议（不要自行提交更改生产代码到验收分支）；
5. 29 LIVE-01～08 的**差分建议**，但不改权威 29；
6. 实测可复核 evidence URL 和缺项。

结束时将 PR 保持 Draft，不合并、不标 P06 LIVE PASS、不进入 P07/P08。无需向我逐项询问已给定的要求；真实条件不具备就记录阻断并继续互不依赖的安全子集。
