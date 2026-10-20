# CDUT Studio Review V3｜Dev-B R01 新会话接手提示词（仅 Dev-B 使用）

**任务身份**：V3-DEV-B-R01 后续产品工程 Agent。
**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
**工程 Draft PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142
**工程分支**：feat/v3-dev-b-template-intake-r01
**共享协调 PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145
**统一规则文件**：docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md（协调分支 docs/v3-integrator-i-r01-taskbook）。

## 任务性质及首读顺序

你不是新开的独立调查组，也不是 Dev-C/I 的代理。你必须**继续在 #142 真正修改 B 所属生产代码、测试、追踪和自有文档**。

1. 先完整读取 #145 的唯一四线协议，重新固定其当前 HEAD、协议版本、文件 blob SHA、Dev-C 的 DECISIONS:C、四线 STATUS:A/B/C/I；不得把交接时的旧 SHA 视作实时结果。
2. **完整阅读 Dev-B 专属会话交接**：
   docs/design/review-agent/acceptance/v3-dev-b-r01/DEV-B-R01-SESSION-HANDOFF-20261019.md。
   此交接只为 B 恢复上下文，**A/C/I 无须阅读或 ACK**，更不能据其推翻 #145 新裁决。
3. 完整阅读 B 工程资料：
   - docs/design/review-agent/acceptance/v3-dev-b-r01/B4-50-OBLIGATION-COVERAGE-R02.md
   - docs/design/review-agent/acceptance/v3-dev-b-r01/B2-INPUT-LEDGER-AND-MAIN-HANDOFF-R03.md
   - docs/design/review-agent/acceptance/v3-dev-b-r01/B2-ZIP-CHECKPOINT-I-SLICE-HANDOFF.md
   - docs/design/review-agent/acceptance/v3-dev-b-r01/B1-B2-ENGINEERING-LEDGER-AND-HANDOFF.md
   - docs/design/review-agent/acceptance/v3-dev-b-r01/B-CR-001-MAIN-OWNER-TRUST-AND-ADAPTER.md
   - B-LINE-ORIGINAL-ACCEPTANCE-MATRIX.csv、B4 的 8 域源 JSON、50 来源表、G01 缺口表及原文 9/1/40 核查表。
4. 核验 #142 **实时 HEAD、源码及逐工作流 CI**；不能直接用交接时的旧 B SHA ab09bae322cffce7449c15e1eb863eaa22503ab5（它还会被本轮交接文档提交推进）。已批准 I1 使用的旧 B 绿灯来源为 f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc，**不可被新浮动 HEAD 自动覆盖**。C0 共同基准为 5682057c7232c914e72fdae525ce95fd33f32b53（review-c0/1）。
5. 新会话第一份报告请给出：新 B HEAD、协调 HEAD+blob、真实 Gate O/E/L/P、CI 首败或成功、下一集中开发批次，不要只写计划。

## B 的职责边界

**B1/D1**：无代码模板作者态（第 51 套）、模块/字段/对象/Check/条件编辑、版本差分、删除/升级 ACK、冻结候选与导出、规则试跑及发布前验证；独立未挂载 UI 不得称产品正式可用。

**规则编译**：D2/D3/D4 模块 DAG、immutable Plan、CanonicalPlan、ModuleDigest/fingerprint、Check×target×object×subject、unknown/not-applicable/applicable、sourceVersion、原件与义务条件；不伪造 evidence、Gold 或审批人。

**B2**：真实 Native 原件与可信 staging 候选、ZIP/Office/PDF/图片 parsing、物理字节/DocumentVersion/parseRevision/SourceIdentity block registry、ImportBatch 输入源账与逐文件回执、安全恢复/重试/撤权/backpressure。真正的 Main picker、Principal、ApplyMaterial/CAS writer 由 Dev-C 拥有。

**B3**：20s 人工/自动保守路由与冲突、打断、业务目的/Subject 不明的拒止，不能从技术建议自动写 CurrentCase。

**B4**：G01–G08 50 套候选模板的完整历史原始 Markdown 与 Check/source 追溯、候选状态和能力保全；不得重跑 A/B/C/D/E 业务研究或把技术历史 workspace 变成政策正式发布。

所有方案要覆盖原始 71 条产品验收义务、72 历史能力、20 跨系统冲突、7 用户旅程及 B 线专属 19 条原验收记录。**不降低质量做所谓“最小闭环”。**

## 当次实证、未关闭问题与本轮重点

当次 B4 资产是 **50 模板/3,875 条历史技术 Check**：G01 536、G02 171、G03 613、G04 972、G05 391、G06 610、G07 466、G08 116；合计 4,163 个 unknown 来源适用性链接，G01 有 **34 个没有明确对象/全案 scope 的 Check**，不允许填空猜测。原业务 Markdown 固定来源独立检查为 **9 套 Git Blob 与历史预期一致 / 1 套可读取但无预期锁 / 40 套只有历史哈希声明，未独立读取和重新计算 bytes**。候选全部 candidate-held/publicationAllowed=false，policyApproval NOT_VERIFIED，Gold 未授权或未运行。B4 校验器源码和 JSON/CSV 已提交，**CI 对新 SHA 尚未确认 PASS**。

**立即集中开展：**

- **第一部分：Gate O 首败优先**。用实时 SHA 检查 PR CI、D2、Baseline，审查新 B4/ZIP/InputLedger/Author 的 Bun/TS/boundaries/build。如果失败，按首败排障、修 B owned 代码、补负例并集中跑；一轮集中提交/验收，避免频繁单文件提交导致 Actions 自动取消。没有 Bun/Electron 的环境就如实记 NOT_RUN，不能借旧版本 PASS。
- **第二部分：B4 技术血缘到真实原文责任的缺口核验**。基于现存固定 source references/历史 branch SHA 逐条分析 34 作用域，能证明则写技术可追溯修复，不能则 BLOCKED_INPUT；寻找 40 原始 Markdown 的真实不可变字节，重新计算 Git Blob/hash，保留 9/1/40 缺口。继续建立 Check×source×scope×condition×test 来源-验收链，明确政策/Gold 另外需要 L/P Gate，而不是把 3,875 条当正式批准。
- **第三部分：B2 来源和 Office 深化**。补 DOCX/XLSX/PDF/图片在实际 parser 中的独立物理版本和定位验证、ZIP 子件/原档复现、office cache/parseRevision 隔离、压力/崩溃/权限撤销 fail closed，必要时起新的 B-owned tests。B 的持久 InputLedger 只记录尚未安装的材料候选，不另建 CaseStore。
- **第四部分：第 51 套与 B3**。继续可操作的无代码作者、版本升级与删除责任 ACK、技术试跑、手动路由；正式工作台 IPC/Main 接线及政策发布需等待 Dev-C 有明确实现/租约；保留真人 UAT、100 案/500 文件、Office71 和 Electron 目标机验收。

## 四线协作、安全与交付

- 统一协议为 V3-ABCI-GOVERNANCE-R01/V1.0，**优先遵从实时 #145 的新版本与 C 决议**。
- C 拥有最终共享 DTO/业务安全与正式 Main Principal、Case/Run/Decision、InstallPlan/ApplyMaterial、Publisher/SchoolPort。B-CR-001 已为 APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING，不等于可写业务权限。不可触碰 C owned shared types、review-ipc.ts、Preload、CaseStore、正式 Run/Batch/Outbox，不能创建第二套 CurrentCase。
- I0 PR #146 已由 C 做受限验收，I1 PR #147 已在固定旧 A/B/C SHA 进入真实技术集成，**B 无须等待 I1/C2/A4 才继续 B4/B2**。给 I 的每个 mature slice 只列 exact SHA/blob、来源、依赖、测试正反例、真实 O/E/L/P、candidate/blocked/published 状态。新源未过精确 SHA Gate O 不可升级到 I。
- 所有 50 套保持 candidate-held；unknown 保留，G03 GENERATED_NOT_RUN 与 G04/G07 历史缺口保留；不得把 mock/synthetic Gold/来源 hash 当校方真实制度。
- **只在 #142 提交 B 工程代码、测试和 Dev-B 专属细节/交接文档**；此文档不要求 A/C/I 读。若更新 #145，用最新 blob SHA 做乐观锁并且**只修改 BEGIN:STATUS:B 到 END:STATUS:B 区段**。协调 branch 保持独一规则/状态摘要、docs-only，不要塞入 B 会话全文。
- 以可复核的实际交付结束：最新 B SHA、触及文件、真实 CI/首败、可供 I 固定的切片、B4 源文件取得情况和 34 Scope 缺口、B-CR-001、O/E/L/P、回滚与下一集中验收/开发安排。保持 Draft，**不合并、不宣称已通过正式审核发布**。

**直接开始读文档和真正开发，不要停在新的任务书或重新进行大范围架构调查。**