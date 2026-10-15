# 50｜P06 当前版本验证：跨会话完整交接（2026-10-15）

> **性质：新会话接手文件，不是验收通过声明。** 只在我方后台审核 Draft PR #21 保存文档；本次未修改源码、CI、Gold、原始证据，未开展新的 U0/U1 版本兼容测试。**当前正式先行任务：P06-RECHECK-LIVE-02 / L02-U0，随后 L02-U1；两者通过以后才能进入 47 号 L02-00～04。** 所有 SHA 均为本次快照；新会话必须先重新查询远端。

## 1. 项目目标与架构原则

- 我方测试仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- 工作分支：feat/review-owned-background-sessions
- Draft PR #21：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21
- 上游源项目（本任务只读）：https://github.com/Nya-Angle/CDUT-Studio

用户要实现的体验：材料在案卷内发起审读，Main 实际受理 Pi 以后可离开页面；不建立可供普通聊天访问的内部审核会话；再次进入显示可信 V2 状态、引用依据、补件、待人工决定或真实技术失败；批量 A/B/C 按原有权限处理，**模型结论不等于学校正式审批**。强调独立的可靠数据，而不是所有测试都绿。

[27 号](27-background-review-session-proposal.md)仍是最小 v1 架构合同：复用 Main runAgent、AgentOrchestrator、Session Manager、Pi Adapter、受控工具/权限和 RunStore V2，不新造第二引擎、第二数据库或事件总线。Main 真实 onRunOwned ACK 和仅有 V2 running 不同。owner 表示会话归属，不能代替案卷/轮次/指派/材料版本/SourceRef 的业务授权；Renderer 的缓存是可重建投影。27 号的“本 PR 不添加新批量产品能力”边界仍有效。[28 号](28-review-stage-delivery-status.md)是 2026-10-11 的整体产品历史快照，不能拿其旧“后台尚未实现”描述覆盖当前开发事实。

## 2. 三方版本与 Git 拓扑：极易误判的变化

| 对象 | 2026-10-15 核验 SHA | 角色 |
| --- | --- | --- |
| 我方 main | 8989941b6fb5651564e32d11c4215b6a6d5a5209 | 新技术兼容性基准：包含新上游与审核功能的文件树整合 |
| 我方 PR #21 开发分支 | d9c22c409345d0ba0844dfcc09525f24dc92f1cc | Draft 现行开发与 47/49 计划，尚未融入 main 的新 Office/预览行为 |
| 上游 Nya-Angle/CDUT-Studio main | c179f2575d5bb5abdc883268fb885d1a6449325e | 只读变化来源 |
| 46号实机冻结生产代码 | b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027 | 旧代码测试 PASS 的唯一适用基础 |
| 47号旧计划起点 | f716d2efaed0dcd8924d5acc30cd3012eb093348 | 上游整合前的证据/规划背景 |

整合主提交 6ff93be71399683fb21c9b5e36cedce05d1945b8 是**以原 main 为父的受控文件树整合**，不是把审核 PR 的整条 Git 历史正常合并；随后 8989941b 修正因上游身份提示英文变动而失败的测试。详见**[48 号 main 整合报告](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/48-upstream-cloud-main-integration-20261015.md)**。

本次远端比较显示 main 与 PR 分叉，PR 对 main 大约 195 commits ahead、2 behind；数字只对上述 SHA 有效。**main 文件已有审核功能 ≠ PR 已经 merge。** 新会话不可在未知 merge-base/patch 对应关系时自动 rebase、cherry-pick、merge、force push 或用旧审核分支覆盖 main 的退役接口。是否转为新分支/新 PR、如何处理现有 PR，须用户明确决定。

我方 main 的 [PR CI #38749615086](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38749615086) 为 3983 pass、5 skip、0 fail（3988 tests / 456 files）；首次内容整合曾有身份提示测试 1 FAIL，见 48。PR 旧 SHA 的 CI 也可 SUCCESS。**二者都不能证明“main + 本 PR”的新候选树真实 E2E 已验证。**

## 3. 必须依次阅读的权威文档

1. [49｜上游影响与新版前置顺序](49-upstream-impact-replan-20261015.md)：覆盖 47 的“直接先做 L02-00”顺序，U0/U1 状态仍 PLANNED。
2. [48｜main 内容整合原始报告](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/48-upstream-cloud-main-integration-20261015.md)：八个冲突文件、上游新版工具/解析/只读侧栏和相关版本、第一次失败。
3. [47｜实测驱动的业务质量后续计划](47-p06-evidence-driven-followup-plan-20261015.md)：L02-00～04 的业务证据合同依然有效，但必须晚于 U0/U1。
4. [46｜本地独立实机报告](46-p06-recheck-live-local-acceptance-20261014.md)：旧版本真机步骤/失败/修复/哈希；完整原始证据在 acceptance/p06-recheck-live-20261014。
5. [29｜唯一 LIVE-01～08 状态台账](29-background-session-preflight-audit.md)、[27｜架构边界](27-background-review-session-proposal.md)、[30｜已有交接](30-background-session-handoff.md)、[31｜历史执行提示](31-background-session-continuation-prompts.md)、[32｜P05 跨仓门禁](32-p05-stage-acceptance-and-local-gates.md)；必要时追读 37/38/39/40/41/44/45 的历史首败与回归。

权威优先级：27=架构/允许改动；29=唯一 LIVE 判词/合并门禁；49=新版本工作顺序；47=业务质量测试细则；46/48=已冻结事实（不能反写）；50=本次上下文交接；[51｜新会话启动提示](51-p06-current-version-validation-new-session-prompt-20261015.md)=具体任务指令。28 仅解释早期产品阶段。

## 4. 上一次实机已证明与未证明的事情

46 号真实 Electron/Main/Renderer/Pi，在冻结 b95b44f7 版本下：
- E05 旧 IPC 回复跨页迟到 9/9 PASS；E03 真实 stop Promise 可控 pending/busy/restart 8/8 PASS；E04 真实旧 executor outcome 闭包的受控迟到重放 7/7 PASS。E03/E04 不等于随机自然网络竞态全部覆盖。
- 独立 8 MiB tmpfs 原子写 ENOSPC 8/8 PASS；双持久化/owner 失写 5/5 PASS；故障保持重启 2/2 PASS；恢复可写重启 3/3 PASS。权限出错 fail-closed。
- 普通 Pi Read/Write 权限、停止、文本/Office/扫描 PDF **预览**、普通会话重启恢复、批次队列及拒止子集验证过。**预览画面不等于模型已执行严格审核原件视觉读取。**
- **选定 16/16 实机场景、77/77 显式断言**全部 PASS，普通 Pi 另 5 项布尔判词；旧融合版全仓 **3894 pass/5 skip/0 fail**。此结果不是整个项目完成比例。
- **E06 PARTIAL**：原 A/B/C 的完整人工处置、补件回流/重审、代批正例与幂等、Claude、双窗/fork/多平台、严格审核 PDF/PNG 原件和压缩均未完成；三案 C 有 execution-failed，禁止把它记作正确业务审批结果。
- 原 38 号审计精确脚本仍 **3 PASS / 1 FAIL、exit1**。旧 WORKSPACE-WRITER 的裸 Jotai store.set 绕过当前写令牌，不能当生产有效写入者；旧 SETTLE 仅 chmod 授权文件本体，没有命中原子 tmp 写故障。45 号新版工作流保留原脚本的红灯、单独以生产 Hook/Controller 等效测试做门禁。绝不改写原失败、Gold、日志或冻结日期。

**目前整个 P06-S02 NOT ACCEPTED / P06 PARTIAL / LIVE-07 PARTIAL；P05 Relay BLOCKED、Pocket PATCH READY/TARGET NOT-RUN；P04 永久 tombstone + owner UUID journal 禁止未经安全证明 TTL/GC；PR #21 Draft/Open/MERGE NO-GO，P07/P08 均未启动。**

## 5. 最新 main 更新对下一轮判断的影响

在 [48](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/48-upstream-cloud-main-integration-20261015.md)/[49](49-upstream-impact-replan-20261015.md) 中实证：
- Office / document-parse-tools 使用 @profer/core/office-engine 与 index schema v2；materializeToWorkspace 写干净 Markdown 和 .context/artifacts 带锚索引。普通 fileId/revision/anchor 与受控审核 documentVersionId/SourceRef/有效 assignment **不是同一个授权合同**。
- 普通 Pi 新 Kernel Document Engine / Read / 证据提示与压缩后恢复会改变工具轨迹，不能因此放宽严格审核五工具白名单，更不能用普通 RAG 阅读记录充当审查覆盖账本。
- FilePreviewDialog/preview-opener、useGlobalAgentListeners/useOpenSession 已转为**只读侧栏**，部分旧 Preview Tab 及 IPC 退役。旧 UI PASS 不保证新版 Main 授权、owner 拒止、晚到写入和侧栏/普通 Tab 恢复。**不可为跑绿旧测试而恢复退役 Preview Tab。**
- 48 号整合过八文件：ipc.ts、document-parser.ts、review/pi-review-executor.ts、review/v2-executor-factory.ts、preview-opener.ts、FilePreviewDialog.tsx、useGlobalAgentListeners.ts、useOpenSession.ts。必须核对新版代码中是否仍沿同一真实调用链。整合时记录 Electron 0.15.162、shared 0.1.68、core 0.2.15、ui 0.2.1，实际要按最新 manifest/lock 复核。
- 触动 AgentOrchestrator、Main 权限回调、RunStore、binding、owner 或 Bridge 时，旧 E05/E03/E04/ENOSPC/重启等证据按受影响范围重跑于**新版候选 SHA**，不能直接迁移 46 号 PASS。

## 6. 新会话精确工作合同与退出条件

### L02-U0（当前唯一先行批次）

1. 重新读取三源 HEAD、PR Draft/CI、merge-base/ancestry 和 compare，列出新提交。检查 48 八文件真实接口/调用方、49 新工具/Office/预览风险，区分已被 main 保留、已被上游替换、当前审核 PR 特有、旧夹具已退役。
2. 在隔离 worktree 中制定（条件具备则构造）**不覆盖主分支的候选集成 tree/hash**，明确采用哪条冻结树、何处有冲突、如何避免旧代码回滚新版预览和 Office。未获用户批准不改 main / PR HEAD、不强推、不 merge；必要时报告数种分支接续方案，等用户决定。
3. 对有效候选版本执行冻结安装、typecheck、boundaries、Main/Preload/Renderer build 和适用专项/全仓测试。记录命令、版本、exit code、日志哈希、首次失败与修复归因；无法构造候选版本则标 BLOCKED_INPUT，不假报 PASS。
4. 交付机器与人都可读的文件/API/风险矩阵、版本/环境清单、候选 tree/hash、旧证据可继承范围、L02-U1 最小测试入口及 expected/actual。此批**不开发业务功能、不调模型、不改 Gold**。

### L02-U1（仅 U0 固定后准入）

1. 真实新 Office v2 索引与案卷身份对应：DOCX/XLSX/PPTX/扫描 PDF 的版本 hash、锚点、清洁 Markdown/索引、跨案、文件版本与旧缓存负例。
2. 新只读侧栏、实际 Main/IPC/Renderer 权限、owner 路径拒止、旧异步响应、停止/重进与普通会话兼容。
3. 严格审核五工具与普通 Read/RAG/新文档引擎隔离的正反例；需要真实绑定的有效 run/assignment/SourceRef，禁止以 DOM/canvas 预览替代模型工具/证据。若核心执行/存储变化，定向跑 E05/E03/E04、ENOSPC/双故障重启。
4. 按候选 SHA 留真实 exit/截图/脱敏日志/raw-public SHA-256；未运行的 provider/OS/外部条件一律 NOT-RUN。此阶段只是**兼容烟测**，不是 L02-02 的完整模型原件/长上下文业务验收。

**U0→U1 之后**：依 [47](47-p06-evidence-driven-followup-plan-20261015.md) 执行 L02-00 真实三案 C 失败归因 → L02-01 已有 A/B/C 业务闭环 → L02-02 严格原件与压缩 → L02-03 Claude/多窗/fork/平台 → L02-04 Relay/Pocket/最终 LIVE-01～08。外部 P05 可并行协调，不解除最终合并阻断。

## 7. 安全/保密、证据与交付规范

只用隔离工作树、合成案卷、已经获授权的 provider/profile；不可上传密钥、设备/渠道配置、原始 SDK transcript、真实案卷/隐私 binding。IO 故障仅能在隔离可销毁的测试目录或小容量 tmpfs 中注入，不破坏用户真实分区和现有本机任务。

每批至少写：冻结代码 SHA/tree、实际依赖版本/环境、输入及材料版本和 SHA、接口调用链、业务 run/assignment（别名）、正反例/过期与越权、命令和真实 exit、日志/截图与 raw/public hash、PASS/FAIL/NOT-RUN/BLOCKED/UNKNOWN、风险和下一操作。不同版本的“历史实机 PASS”“main CI PASS”“新候选实机 PASS”严格分开。错误和初始失败保留，原失败不可为了通过测试而抹除。

未经用户明确许可：**不写源项目，不推送或改写我方 main，不强制改 PR 的树/历史，不合并、解除 Draft 或开展 P07/P08**。仅可提交本分支新的审计/交接文档，且先核对远端 HEAD，避免与其他会话冲突。分支归属决策需用户批准。

新会话交付应包括：① 最新三源 SHA/ancestry/CI；② 完整历史和风险基线；③ U0 差分矩阵和候选方案/可复验结果；④ U1 是否准入及实际执行范围；⑤ 29/30/31/PR 的具体同步或阻断说明；⑥ 剩余 LIVE/P05 条件与下一小批。不要宣布已验收或合并，除非 29 全部满足且用户正式认可。

**可复制正式新会话提示**：[51 号](51-p06-current-version-validation-new-session-prompt-20261015.md)。
