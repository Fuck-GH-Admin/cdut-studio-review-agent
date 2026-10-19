# CDUT Studio Review V3｜Dev-C 下一会话启动指令（2026-10-20 R03）

> **C_ONLY_NEXT_SESSION_PROMPT / NOT_ABCI_SHARED_POLICY / FOR_NEXT_DEV_C_ONLY**。仅供 Dev-C 新会话；A/B/I 不需阅读或 ACK。本文件不能更改 #145 中 C 的正式决定，也不授予任何工程线新权限。以 GitHub 最新实际 PR HEAD、源码、同 SHA CI 与 `DECISIONS:C` 为准。

## 可直接复制的新 Dev-C 指令

你接手 **CDUT Studio Review V3 的 Dev-C 持续生产研发与最终共享业务安全裁决**，任务身份 **`V3-DEV-C-CONTINUATION-R03`**。这是既有 C 工程主线的连续接手，**不是**新一轮架构调查、不是 Integrator-I，也不是让四线重新分工。继续在仓库 **https://github.com/Fuck-GH-Admin/cdut-studio-review-agent** 实际编写、提交、测试 C-owned 生产代码，保持质量与四线并行效率。

**唯一正式协调与签署处**：[PR #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，branch `docs/v3-integrator-i-r01-taskbook`，`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。只能更改 `DECISIONS:C` / `STATUS:C` 的 C 专属 marker，不许覆盖 STATUS:A/B/I。本 C-only 交接不是共同协议。

**第一步完整读取**：

- 当前 C 专属完整交接：`docs/design/review-agent/acceptance/v3-dev-c-session-handoff-r01/C-ONLY-SESSION-HANDOFF-20261020-R03.md`，并按其“首读顺序”查过去 R02、当前 C 专项 Gate O 和 C-MAIN-WIRE 原始证据；
- 唯一 ABCI 共同协议中最新 C 正式裁决，不能只读历史状态 PENDING；
- C 工程 Draft [PR #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)、branch `feat/v3-dev-c-business-r01`，最近已签代码 SHA **`331519d3833e254c7d54c18605b50f3252582517`**，对应 PR CI [39321173561](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39321173561) Bun **4132 PASS/5 OS SKIP/0 FAIL**，全部 5/5 Gate O completed/success；当前真实 Main author-read / UpgradePlan Preload 双通道已经编译并离线 8/8 handler 测试通过，**不要重做它**。真实 B1 vault/publisher/Owner grant 尚未注入、production 默认 deny。
- Dev-B [PR #142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)：最近已绿 R18 **`263b7f36034cacd4d51a00edd5f39266c37037fa`**，PR [39320422706](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39320422706)、Baseline `39320422642`、D2 `39320422755` 3/3 success。该 B-owned 来源中的 `readB1AuthorRevision` 与作者候选账本需要精确 provenance/真实 Main 装配，不可把 `candidate-held` 当 SchoolPublisher。
- Dev-A [PR #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)：观察时新 HEAD `fb2bcc3e6315aba32e94768b86f950244414b775` 的 PR CI `39322397220` 尚在运行，Baseline/D2 green；旧已绿 R18 `0febf1248bc6a580a1bc7b3144e0d96ca4313916`，所以重新查最新 SHA，不许把旧绿签新 HEAD。
- Integrator-I：#150 Stage1 `36dd1c37bc18d7614d8d4835b5213d5cb6459792`、#151 Stage2 `687ed356de3aee59075b85bf09a978eedab12a02` 和 **本次新签** [#152 Stage3](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152) **`8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`**。Stage3 新正式裁决 **`I-CR-I3-R03-I-ONLY=APPROVED_SCOPED`** / **`C-I3-STAGE3-I-ONLY-ENG-ACCEPT-R01=YES_EXACT_SHA_SCOPED`** 在 [commit `0ae3a501`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/0ae3a501d84128b214704a75ab78823c1434fd51)，PR `39317723780` full Bun **4307/5/0**、三 CI PASS，仅 I-only 3 新文件和假 transport 技术证据，无 Main 写权。别把 #152 当待批。

**四线责任和绝对权限边界**：A 持有 Pi SDK/Owner/HTTP/SSE 和技术 Host proposal；B 持有 50+1 模板候选/作者/B2/route/source；I 只准按 C 批准的 fixed SHA+path+Git blob 做技术重放和联合回归；**C 唯一持有 Main Principal/senderFrame/Preload/shared、Case/Material/Plan/Run/Check/Decision/Batch/Outbox、CAS/Receipt、Policy/SchoolPort 与真实主线集成最终裁决**。I Main lease `CONDITIONAL_NOT_ACTIVE`、business writer `DENIED`，其它线未经精确 C CR 不得改 C 生产文件。没有 Gate E/L/P，Release `NO_GO`。技术 SSE/Provider ID 不等于独立观察的 C physical Host，B candidate-held 不等于已发布学校制度，UI 确认不等于 Main 正式删除 Check ACK。

**下一步第一工程批次：`C-MAIN-WIRE-R02`**。请先独立核查上面准确来源和新的待批 CR，然后**直接开发**：
1. 以已有真实 `registerCMainV3AuthorPlanIpc`、`CMainTrustedAuthorRevisionRead`、B R18 `readB1AuthorRevision` 为准，完成 C 自有 **privileged Main real B1 current candidate reader/Owner grant 装配**，不复制 B vault、不造第二套状态。来源未批准纳入当前工作树时，先锁 B source/blob、提交对 I 的逐文件技术 CR，C 可在自己线并行落实安全 Main adapter 和负例。
2. 认真审查现有 `CMainV3AuthorPlanAuthorities` 将只读 author 接口和必须 school published issuer 的正式 Plan 升级绑在同一安装对象的局限。允许分离两组 Main-only fail-closed 安装门禁，使合法候选只读不必伪造学校发布源才能工作；**升级 Plan 始终要求独立真实 issuer 和业务用户同意**，缺源一律拒绝。
3. 明确人类删除 Check 的 Main-verified Principal/Subject/Owner/old+new Plan/完整删除集合/一次性 intent，不把 Renderer callback 当证明；在 `submitCommand` CAS 内重验、保留只一份 durable Receipt。检查 revoked Owner、窗口换代/导航、authority uninstall、requestId replay/collision、出版撤销、真实 bytes 改版和多 PID crash 的正反例。
4. 保持 C2 physical Host / Pi 事件与 native Run、School Decision 独立层级；如对接 A/I 或修改 shared/IPC/Preload，只有 C 可以写 C-owned 文件。用户想要的模板未命中→受控通用/临时候选必须先做候选+明确人工确认，不允许模型默认创造并发布学校规则。
5. 一个相对完整、可验证的 C 工程批次集中跑适用 GitHub Actions，保留首败与修正提交，以最后同 SHA `PR CI + Baseline + Batch + D1 + D2` 的真实状态决定 Gate O；不能用旧绿。可将必须本机虚拟屏/真实 Electron 的一组 Gate E 命令、矩阵和脱敏证据要求保存到 C-only 验收报告供本机集中执行。

**交付要求**：真实代码、相关回归、exact SHA、真实 GitHub CI 和原始日志、对 I/B 的具体 CR 若有、#145 中正式 C 决议/状态、C-only 工程证据和下一批清晰顺序。不要只写方案，也不要请求用户重复确认已知信息。需要跨线批准时精确限定 SHA/路径/hunk/权限/何时失效，并在对应 PR 回帖。所有 PR 保持 Draft、不自行合并 main、不授权学校发行者或业务 release。

**开始时先简要报告你恢复的当前状态和这批准备改的 C-owned 文件，然后实际开工。**
