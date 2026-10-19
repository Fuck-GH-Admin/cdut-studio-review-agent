# CDUT Studio Review V3｜Dev-B R01 专属会话交接（2026-10-19）

> **文档属性：DEV-B SESSION HANDOFF ONLY / NOT ABCI GOVERNANCE / NOT FOR A/C/I REQUIRED READING。**
> 本文件只服务 Dev-B 新会话恢复上下文，不是 A/B/C/I 新协议，不要求 Dev-A、Dev-C、Integrator-I 阅读或 ACK。
> 本文件位于 Dev-B 自有工程分支及 Draft PR #142 的 docs/design/review-agent/acceptance/v3-dev-b-r01/ 下。**不要**把它迁移为 #145 唯一四线协调文件的平行规则；#145 的 docs-only 分支仅保留共享规则、Dev-C 裁决及各线状态摘要。
> 新会话启动必须重新取当前远端 SHA、协议 blob、CI、源码和新决议。本文件所有 SHA 与 Gate 是 2026-10-19 的交接快照，不是实时结论。

## 0. 资产索引与不可变参考

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- B 工程 Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142
- B 工作分支：feat/v3-dev-b-template-intake-r01
- **本文件编写前已核实的 B HEAD**：ab09bae322cffce7449c15e1eb863eaa22503ab5；其时 PR 共 55 个变更文件、仍 Draft；**写入交接文件后 HEAD 必然变化**，应以远端最新为准。
- C0 合同基准：5682057c7232c914e72fdae525ce95fd33f32b53，review-c0/1；共同 DTO 仍由 C 独占。
- B 早期单线 CI 成功来源：f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc。Integrator-I I1 已按此 SHA 锁定旧 B1/B2/B3 切片；**不得用新 B 浮动 HEAD 替代**。
- 历史八领域 D4 workspace 固定来源 PR #97：b68443b23293b4714e61a3b81383d3d3a56434fc。
- 四线统一协议唯一入口：docs/v3-integrator-i-r01-taskbook/docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md（协调 PR #145）；2026-10-19 本次读取版本 V3-ABCI-GOVERNANCE-R01/V1.0，协议文件 blob 8c4c40816b90075381ad42bb2ef4ad8ecb57869c，协调 PR HEAD d64ccdb5ddfba560b3553f2f91855c6a9330e153，后续须重新核实。
- C 工程 PR #144 当次 HEAD 49406a60e8f960e996a818e674025df5e7145497；A #143 当次 HEAD 56e0758cf1fe4aaf610d1fa12c62c3deff8f64e6。
- I0 PR #146 已获 C I0_ACCEPTED_SCOPED（旧 I0 锁不可改），I1 工程 Draft PR #147 当次 HEAD 09d67ee494481dcc32571c8887ea1326b9a45b36，基于 C 明示准入的旧绿灯 C1/A/B。I1 联合 Gate O 当次仍待真实同 SHA 结果，绝非已部署。
- 协调文档只可通过最新 blob SHA 乐观锁编辑 <!-- BEGIN:STATUS:B --> 与 <!-- END:STATUS:B --> 之间；不覆盖 A/C/I 区段，C 的 DECISIONS:C 只能 C 修改。

## 1. B 线完整身份和长期职责（不是第二个 Dev-C）

目标是把 V3 的作者、模板、规则、材料与来源系统建成可使用、可验证、可追溯的完整产品；不是再做 A/B/C/D/E 领域研究，更不是只写接口定义。

**B1／D1 模板作者态**：原生无代码创建、修改、模块化编排、版本化草稿、候选冻结、发布前检查、版本 diff、升级/删除责任 ACK、试跑与导出。第 51 套“没有预制审核目的”的新模板必须可以由真实非开发用户完成业务表达，并保留人工核验步骤与来源条件，不可自造发布权限。

**B1 规则编译／D2/D3/D4**：D2/D3/D4 模块、依赖 DAG、ModuleDigest、CanonicalPlan、不可变 fingerprint、Check×target×object×subject、条件/required/unknown 三值、sourceVersionId、真实材料规则绑定、失败拒止。不能将 unknown 当 false / pass，也不能静默把新候选替换旧 Plan。

**B2 原件输入/来源**：Native picker/drop/ZIP 的真实物理字节候选；安全大小、批量压力与 ZIP slip/symlink/bomb 防线；短效 single-use staging grant；PDF/DOCX/XLSX/图片的 parser block 与精确 page/bbox、paragraph/table/cell/图片定位；raw hash、physical document version、parseRevision、原件当前性与 SourceIdentity/SourceRef 精确追踪；ImportBatch 输入侧逐文件状态、冲突/恢复和可信 Main handoff。真实 Main caller/senderFrame 授权不由 B 自行发行。

**B3 路由与输入体验**：L1/L2 的技术路由、20 秒自动/人工选择与打断、角色/Subject/source 不明确时拒止或请求人工确认、G01–G08 候选的适用性；不通过路由直接创建 CurrentCase。手动切换、无模型/模型出错时的稳定性要保留。

**B4 50 套候选与历史能力保全**：固定 50 套候选 workspace 的原始业务 Markdown、模块/任务/Check/sourceBinding/作用域/来源版本逐项归档；技术来源、校规当前效力、独立 Gold 三种验证绝不可混为一谈。G01–G08 保持 candidate-held/publicationAllowed=false，历史 G03 GENERATED_NOT_RUN、G04/G07 缺口不抹去。保留原产品 71 条义务、72 项历史能力、20 项跨系统冲突、7 条用户旅程和 B 相关的 19 条 F/A/C/S/D/K 验收记录。

**无正式写权**：B 不拥有学校发布 ACL、Main IPC/Preload 可信 Principal、正式 CurrentCase/CaseAggregate/ReviewRun/Decision/Outbox/Batch finalizer、InstallPlan/ApplyMaterial 的最终写权。无 C 授权不得修改共享 types/DTO、C owned Main handler/CaseStore 或另建业务数据库。

## 2. 已提交代码及真实状态

### B1 候选 Plan 与作者

- apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.ts + test：作者 source/field/target/module/check/stage/output 的严谨编译，DAG/digest/immutable candidate fingerprint，2 targets × 6 Checks、unknown/not-applicable/applicable、删 Check ACK。正式政策/plan 安装仍 BLOCKED。
- review-template-author-store-v3-b1.ts + test：作者草稿修订、append-only 版本记录、冻结候选；需继续审查持久化 CAS/故障处理/作者权限和端到端真实界面。
- review-template-author-main-port-v3-b1.ts + test：Main 注入已认证 B1TrustedAuthorContext 与授权回调的 saveDraft/preview/freezeCandidate；不是实际 IPC。
- apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx、review-v3-author-trial.ts + test：可编辑字段、对象、Check、条件/阶段/输出，typed 合成试跑，三值预览、candidate JSON 导出。试跑样例不写入冻结母版，伪造 evidence 不能通过；**组件仍未经 C 接到真实工作台，五人 30 分钟第 51 套 UAT 未做**。

### B2 来源/安全/恢复

- review-intake-adapter-v3-b2.ts + test：owner/sender/frame/generation token、requestId 作用域、safe filename、raw bytes SHA、候选物理版本。旧初版有独立绿色 CI，后续增强还须新 CI。
- review-source-version-adapter-v3-b2.ts + test：复用真实 parser，登记 physical documentVersion/parseRevision/block，只有 registry 内受验 block 可 mint 来源候选；非正式 ApplyMaterial。
- review-zip-intake-v3-b2.ts、review-zip-staging-v3-b2.ts 各带 test：ZIP 中央目录/本地头、CRC、压缩炸弹/路径逃逸/目录冲突拒止，安全子文件独立暂存，整包 requestId 绑定原始 ZIP 身份；不直接向案卷安装。
- review-import-checkpoint-v3-b2.ts + test：原始 ZIP bytes/manifest 本地输入检查点、所有权/哈希/重启再授权。普通 SHA/本地文件权限不构成校方信任签名；强制进程中断/磁盘空间不足/多 PID/父目录 symlink race 等仍需目标机验证。
- review-import-ledger-v3-b2.ts + test：独立逐文件 InputLedger，owner/Subject/role/raw hash、revision CAS、requestId、receipt hash 链、重启后读账；**输入账不是第二套 CaseStore、不是正式 Batch 或 durable ApplyMaterial ACK**。
- review-import-handoff-v3-b2.ts + test：只读 input-only-unapplied proposal envelope；C 仍须独立验证现行 SourceIdentity、Principal、Case revision、durable write/ACK 和当前材料效力。

### B3 路由

- review-intake-routing-adapter-v3-b3.ts + test：唯一证据充分/用户未打断才能在 20 秒倒计时技术建议路由；歧义、条件不完备保守拒止。仅 pure function，未与真实工作台正式 CreateCase command 连接。

### B4 资产、验证器及源账

- review-v3-b4-inventory.test.ts、review-v3-b4-obligation-lineage.ts + test、review-v3-b4-original-evidence.test.ts。
- docs/design/review-agent/acceptance/v3-dev-b-r01/B4-50-CANDIDATE-SOURCE-LEDGER.csv、B4-50-CHECK-SOURCE-COVERAGE-R02.csv、B4-G01-34-SCOPE-GAPS-R02.csv、B4-50-ORIGINAL-MD-GIT-AUDIT-R02.csv。
- B4-OBLIGATION-SOURCE-G01.json ... G08.json、B4-ORIGINAL-MD-GIT-G01.json ... G08.json。G04 为等价紧凑 JSON（避免 GitHub Contents 单文件响应上限）。
- **正式摘要必读**：B4-50-OBLIGATION-COVERAGE-R02.md；以及 B-CR-001-MAIN-OWNER-TRUST-AND-ADAPTER.md、B2-INPUT-LEDGER-AND-MAIN-HANDOFF-R03.md、B2-ZIP-CHECKPOINT-I-SLICE-HANDOFF.md、B1-B2-ENGINEERING-LEDGER-AND-HANDOFF.md、B-LINE-ORIGINAL-ACCEPTANCE-MATRIX.csv。
- 本轮 B4 technical lineage：G01 5套/536 Check；G02 3/171；G03 10/613；G04 8/972；G05 6/391；G06 9/610；G07 7/466；G08 2/116，**合计 50/3,875**，源链接共 **4,163 项 applicability=unknown**，结构性孤立/缺 source 为 0，但 G01 **34 条缺显式 object 或 case scope**。这些数是 D4 固定 workspace 的技术 Check 记录数，不等于全部已独立验收校规责任。
- 原始业务 Markdown 证据 **9/1/40 分级**：9 套取得 Git Blob 与 manifest 预期 blob 匹配（G01 2 + G07 7，G07 取历史 original.branchCommit）；1 套取得 Git Blob 但 manifest 没有预期锁（G01 1）；40 套只有 catalog/manifest SHA256 元数据声明，**未能重新取得并独立计算原文 bytes SHA256**。即使 9 套 blob 匹配，也不证明原文校规现行有效。历史来源若无法取得，标 BLOCKED_INPUT，严禁编造 Gold、虚构对象范围或把历史内容升级为政策发布。

## 3. I/C 四线协作与正式裁决

统一协议：V3-ABCI-GOVERNANCE-R01/V1.0（新版本须取实时文档）。

- Dev-C：统一业务安全/共享合同裁决，唯一正式 Main、Case/Run、Source CurrentValidity、Policy verifier、批次正式写入 owner。B-CR-001 为 APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING，批准 B 技术候选桥接方向，**不等于可信 Main handler/InstallPlan/ApplyMaterial 已完成**。
- Integrator-I：I0 PR #146 @ c84f575addcbb1f36b5eff0acb27442b91073fa1 获 C I0_ACCEPTED_SCOPED（只是旧输入锁/预检）；I1 PR #147，初始 C 锚点 31aa352c45a33d6832612884b0fea38e39b5cf8d，A 锁 d8fd3e0e696caa1df7321c23c46e4f70a1f910f7，B 锁 f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc。I 可集成 B1 纯候选编译、B2 纯暂存+parser、B3 pure router；无共享 C 文件写入 lease。I 不需要等待 B4 完成；新的 B SHA 必须独立 O 绿灯后重新锁定、再经 C 判断可否集成。
- Dev-A：后台 Owner/Grant/Pi Host proposal/outbox、可靠性/批量执行方向；跨线联调由 I，正式 Run/Decision writer 由 C。B 不因 A/C 新合同版本出现就自行修改 shared types。
- 协调 #145：仅 B 自己 STATUS:B 段可写，需要实时文件 blob SHA 的乐观锁，若并发变化就重读重放自己的部分。B 专属本会话交接无需 I/A/C 阅读，也**不应**添加为另一份四线共同规则。

## 4. 四门禁与已知首败风险

- **Gate O**：旧 B SHA f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc 的 PR CI、D2、Baseline 各 SUCCESS；新 B HEAD ab09bae322cffce7449c15e1eb863eaa22503ab5 的 PR CI 39247377820、D2 39247377819、Baseline 39247377814 **最后查询仍 QUEUED**。新 B4/ZIP/ledger/Author UI 无同 SHA 全绿实证；不得借旧绿灯。先真实读取 run/jobs/logs 的首败并在 #142 修复，再固定新 SHA。
- **Gate E**：NOT_RUN，需真实 Electron/Main/Native picker/drop、Office71、ZIP 大样本、撤权/重试/多窗口、断电/ENOSPC/多 PID、SourceRef 真实定位和 100 案/500 文件的目标机任务；集中验收可批量，但不得删要求。
- **Gate L**：BLOCKED_NO_AUTH，真实校方身份/签发人/校规原件/当前版本和独立 Gold 未就绪；不把 synthetic material/Gold 当有权发布。
- **Gate P**：PARTIAL；第 51 套自建业务 5 人 30 分钟无代码 UAT、50 套原始 Markdown 逐义务业务无损性、真实工作台整链及未知/旧 P06 unsupported 产品提示仍缺。
- 历史首败：早期 B1 TS18048/never 与 B2 grant/stored 变量窄化失败，已各修复；中间 ZIP TS2366 亦修复。**新 SHA 必须重新编译证明**。
- 后续 B2 安全性尤其注意：本地 SHA256 日志不是签名；多个文件的独立保存未被证明跨文件原子；父目录 symlink/权限/时序与失败回滚需要真实测试。不得因一次单进程 Bun 负例就宣称故障可靠性全面通过。

## 5. 下一会话应执行的开发批次（集中离线开发，目标机测试后置而非删除）

**P0 — 冻结最新事实和真实 Gate O**。重新读取协调协议、#142/#143/#144/#145/#147 的 SHA/status、B4 报告、B-CR-001；检查同 SHA 所有 CI。若失败读取 job log、定位首败并修代码与负例；明确 TypeScript、boundaries、Main/Renderer build、Bun 的实际结果。避免每次只做极小修复，无意义连续提交造成 Actions 自动取消；以一批完整源码+tests 后集中验收。

**P1 — B4 原文与责任细化**。优先把 G01 34 条无明示 Scope 做源文对照：可见证据足够则以受证据支持的候选 scope 单独记录及测试；证据不足保持 UNKNOWN/BLOCKED_INPUT。40 套原文寻找 historical Git ref/文件系统/Library/附件中真正 bytes 后计算 SHA256/Git Blob、记录 origin/ref/locator；不可把宣称的 SHA 当实测。与 9 已固定、1 未钉预期对照；保留 3,875 Check 和 4,163 source-link unknown 的三值语义。按原始业务条款做 Check×source×scope×condition×测试 coverage，明确“技术 workspace 血缘”与“原始政策义务保全”之间 gap，不重复历史 A/B/C/D/E 领域研究。

**P2 — B2 Office/物理来源工程**。补 DOCX/XLSX/PDF/图片 parser 差异与原始文件版本、block locators、parseRevision/cache，嵌套 Office/附件/ZIP 子文件与不同 physical document 的跨版防混；OCR 未提供则诚实标 PARTIAL；强化 per-file ImportLedger 的多进程/崩溃/磁盘/撤权 fail closed、最大文件数/背压。C Main Native picker 与受信 ApplyMaterial 不由 B 写，提供明确端口给 C/I。

**P3 — B1/B3 产品能力与第 51 套**。继续完整作者版本 diff、升级与撤项 ACK、错误诊断、条件/来源编辑体验和人工流程，真实用户可操作性。B3 用户手动选路/倒计时取消/角色 Subject 不全时拒止。原生工作台 Main/Preload 接线依 C，保留可运行的独立 UI/harness 测试及真实 UAT 计划，不宣称已挂载。

**P4 — 对 I 的切片交接**。每个 mature slice 单列源文件、exact SHA/blob、C0/C1 依赖、正反例及 Gate O/E/L/P、publication 状态；既不要让 I 等 B4 全部，也不要让 I 在未经验证的新 HEAD 上浮动集成。最新 B owned bugs 在 #142 修，C-owned 缺陷通过 B-CR-001 精确请求 C，I glue 在 #147 修。

## 6. 新会话操作和交付纪律

1. 优先完整读取本文件、唯一 #145 协议及 C 决议，再读 B4-R02、B2-R03、B-CR-001、B1-B2 ledger；不要依赖前一聊天文字当作最新代码。
2. 最好用独立工作树；该运行环境若无法 clone/Bun，使用已连接 GitHub 工具真实读取/写入 #142，CI 测试必须等待最终 run 返回成功才可声称通过。本机真正 Electron/Office/断电缺失则准确写 NOT_RUN 并提供可执行验收材料。
3. 只提交 B-own 文件，附代码+测试+文档/证据，不修改 C-owned types/IPC/Preload/CurrentCase；不主动合并或设 ready。Candidate/Gold/Publisher/SchoolPort 的授权绝不伪造。
4. 每轮固定 B HEAD、支持的结果、失败/阻断、后续次序，更新 #142；#145 只更新 B 状态区，其他线无需读本交接。
5. 保持可集中验收且严格完备的产品开发节奏，不以“最小闭环/demonstration”替代原定质量要求。

**交接信号**：B4 逐 Check 技术来源账已经建立（50/3,875，9/1/40 原文分级，G01 34 Scope 缺口），下一会话直接从“CI 核实与 B4 实质原文责任复核 + B2 Office 深化”继续，不重做本轮已固定的历史盘点。