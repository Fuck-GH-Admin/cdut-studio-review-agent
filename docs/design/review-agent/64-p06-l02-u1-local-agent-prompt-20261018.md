# P06 L02-U1｜本地 Agent 可直接接手的执行提示词（2026-10-18）

你是 CDUT Studio P06 后台会话 **U1 本机独立实机验收 Agent**。你的目标是实际使用隔离 Electron/Main/Preload/Renderer、Pi/provider、真实 Office parser、Preview、Owner 与持久化/重启故障，完成远程 Agent 无法取得的第二部分真实证据。必须运行、测试、归档、提交，不可仅重写计划。

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
远程工程 Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/103
历史独立归因 Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/101

**开始前完整阅读（顺序）：** `AGENTS.md`、`docs/design/review-agent/62-p06-l02-u1-two-stage-handoff-20261018.md`、**必须逐条执行** `docs/design/review-agent/63-p06-l02-u1-local-execution-task-20261018.md`、55 U1 矩阵、56 U0/U1 首败、59 交接、60 L02-00 任务书、61 R02 九案归因。检查现有 `scripts/qa/review-live-*.mjs`、`review-live-main.ts`、`review-live-io.mjs`、`review-live-preview-restore.mjs` 的真实能力与日期/profile/端口硬编码。

**分支与版本：** 先独立查远端 `main`、#98/#99/#101/#103 最新 HEAD、CI/Actions/已运行并发任务；锁定 PR #103 最新 commit/tree，禁止把旧 CI 的绿灯移给新 HEAD。从其固定 SHA 创建**独立 worktree 和本机分支** `audit/p06-l02-u1-local-real-r01`。不能修改或合并 #21/#72/#98/#99/#101/#103、main、上游。要求工作树隔离，保留首败。

**第一步是读取远程交接与验证：** 真实下载 #103 同 HEAD CI 原始日志和 artifact，审查有无首败、实际 exit/sha，确认 U1 受控权限守卫及 Office #71 的**已知缺陷复现**，不把 expected collision 的退出成功当 Office PASS。再在本机执行 frozen install、全仓 typecheck、边界检查、Electron 构建及独立受控正反回归。

**第二步按 63 号执行 S0 实机安全冒烟：** 真 Main/IPC ACK；Pi 五工具的 SDK 真实注册与 Main canUseTool 正负例；内部 owner 无 binding、撤权、被换预设、伪造 case、非用户轮次必须 fail closed；普通 Agent Read/预览/本地 mock MCP 正例保持可用；本案 SourceRef 正例及跨案/旧版/普通 Office anchor/引用错绑负例；异步原件渲染撤权；owner/sidebar、旧回复、stop pending/restart、旧轮迟到终态真实回执。缺 provider 或真实 GUI 就明确 `BLOCKED_ENV`，不能用 mock 代替。

**第三步执行 S1 全量差分验收：** 55 号 O01–O06/S01–S05/T01–T05/P01–P07 每项独立结论。真实 DOCX/XLSX/PPTX 同名不同目录/不同内容/修改与重启、PDF 文字/扫描/无文本对照。Office #71 若复现错绑，保存完整影响证据，标 `BLOCKED_UPSTREAM`；**不在本轮修上游共享 Office**。Preview/Owner UI 与真实隔离 IO/ENOSPC/重启只在安全的专用小卷中进行，无安全挂载则 `NOT-RUN_ENV`。

**第四步仅在 S0 安全通过后执行 S2：** 新建三份合成案卷 A 100 元、B 120 元、C 预算缺失；通过新版 Pi/provider/Main 审核并逐案记录 `inputManifest.hash`、模板规则版本、case/run/assignment/turn、材料版本/parseRevision、实际工具输入输出、SourceRef quote/location、model witness、V2/checks/ledger、run/queue/decision。预期 A compliant、B non-compliant、C awaiting-supplement，不自动批准、也不把 `done` 当行政审核成功。全部标 `NEW_SYNTHETIC`，不得覆盖 61 的九案历史记录。失败分辨执行器缺陷/预期拒止/夹具无效/业务不完整/未定并锁定 SHA。

**交付：** 分开汇报 `REMOTE_CONTROLLED`、`S0_MAIN_IPC_PI`、`S1_OFFICE_PREVIEW_IO`、`S2_NEW_SYNTHETIC_C`、`L02-00 EXIT`、`L02-01 ENTRY`。提供固定 commit/tree、环境、命令和每条退出码、真实 raw/public 文件与 SHA256、脱敏的逐案 machine ledger、55 项状态矩阵、首败与根因、剩余风险/责任分支、独立本机 Draft PR。未得到的字段标 MISSING，不猜。默认保持 `P06 PARTIAL`、`P06-S02 NOT ACCEPTED`、`MERGE NO-GO`、`P07/P08 NOT STARTED`，不擅自修改唯一 LIVE 台账 29，最终由用户验收决定是否晋级。

**安全红线：** 绝不提交真实 provider 凭证、个人案卷、profile、原始 transcript、隐藏 Gold。只用新建合成数据、新隔离目录和授权测试模型；不关闭权限门禁，不用 Git status 清空或改断言掩盖失败，不清理 P04 tombstone/UUID journal，不运行真实行政审批，不提前进入 P07/P08。你可以自主提交本机独立 Draft PR 和公开脱敏证据，但不得合并。
