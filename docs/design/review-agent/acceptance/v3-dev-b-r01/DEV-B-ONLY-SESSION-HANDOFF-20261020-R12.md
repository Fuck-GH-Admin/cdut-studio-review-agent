# CDUT Studio Review V3｜Dev-B 专属会话交接 R12（2026-10-20）

> **DEV-B SESSION HANDOFF ONLY — PRIVATE TO DEV-B WORKFLOW / NOT ABCI GOVERNANCE / NOT REQUIRED READING FOR DEV-A, DEV-C, OR INTEGRATOR-I.**
>
> 这是 Dev-B 上一会话给下一会话的**内部上下文恢复与执行指令**。放在四线协调文档分支，只为便于用户和下一 Dev-B 会话访问；**其他三线不需要阅读、ACK 或执行此文件**。它不创建第二套统一协作规则、不改变唯一 ABCI 协调协议，也不是 C 的签署裁决。若有冲突，以协调协议当下生效版本、C 明确裁决及真实源码/CI 为准。
>
> 固定于 2026-10-20 的快照。新会话必须重新查询最新 HEAD、Git tree、CI、C/I 授权和冲突再开发，不能把这里的固定 SHA 当浮动来源。

## 0. 工程与文档唯一入口

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- Dev-B 工程 Draft PR **#142**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142
- B 独立工程分支：**feat/v3-dev-b-template-intake-r01**；最新核实 HEAD **45809553d19b6fba731fd7edb813ebbb81071031**，仍 Draft，尚未合并。
- 四线统一协调 PR **#145**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145
- 唯一协调分支：**docs/v3-integrator-i-r01-taskbook**
- 唯一四线协议：**docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md**（V3-ABCI-GOVERNANCE-R01 / V1.0，协议和 C 裁决不得由 B 修改）。此次核实协调 PR HEAD **c4862c230bd4e0e6582762acf4df062023613df0**，协议 blob **7896ccd7c107350459ed218dcfb603f44b2d07fc**；本交接与随后 B 状态更新还会推进协调 HEAD。
- C0 固定共享合同：**5682057c7232c914e72fdae525ce95fd33f32b53**，合同 **review-c0/1**。
- A 工程 PR #143，最近核实 HEAD **1f1f5d1499cb59c813d590aa407189ba05f65f10**；C 工程 PR #144，最近核实 HEAD **34c7ea3bd881504302d2682aad79065c0ef9a24c**（C2 R02 5 项 Gate O 均通过）；I1 工程 PR #147 已由 C 对 SHA **642c1fa3d3dd2042b7af1afdb3882397d4ca79a7** 签正式“仅工程技术”接收。
- 本文是旧 B 工程分支内 **DEV-B-R01-SESSION-HANDOFF-20261019.md** 的更新续篇。旧文的日期性 SHA/CI 状态大部分已过期，**本文优先解释 10 月 20 日已验证进度**。

## 1. Dev-B 持久职责：不缩小为当下修 TypeScript

**产品目标**：让 Review V3 具备完整可靠的业务输入、无代码模板作者、规则编译、可信材料来源、动态路由和 G01–G08 真实业务候选体系；是产品持续开发，不是重新做 A/B/C/D/E 研究。并行四线中的 B 独立开展 B 所有权工程，不能因 C 或 I 尚未接好正式界面而停止推进。

### B1：无代码作者、版本与规则编译（D1/D2/D3/D4）

包括新建/编辑独立审核业务、来源、字段、对象/Subject、Check×target、模块 DAG、condition/required/unknown 三值、Stage/Output、revision CAS、draft/freeze candidate、导入导出、保存与显示快照一致性、版本 diff/升级/删除 Check 明确 ACK、无代码试跑。作者产生的是 candidate-held；发布校规与真实 Gold 的权力属于 C/校方。

**第51套**：当既有50套都不匹配时，产品不能只返回“无模板”。B 已有“没有匹配模板→自建审核业务”候选入口，以及 B1/B3 可视组件；这不代表自动生成具有学校效力的“通用模板”，也不代表真实五人用户已验收。

### B2：真实输入与来源

Native picker/drop/ZIP（真实授权端口由 C）、大小/条目/路径/symlink/炸弹/CRC 防护、一次性 Main scope token、原始 ZIP 持久检查点、解码策略锁和跨进程容量锁、DOCX/XLSX/PDF/图片 parser block 精度、rawSha256/DocumentVersion/parseRevision/SourceRef、InputLedger 逐文件状态/Subject/role/receipt 链/revision CAS、owner revoke 和只读 source handoff。**ImportLedger 是业务输入账，不是 C CurrentCase/Run/Batch 最终真值。**

### B3：保守材料路由与人工中断

L1/L2 轻量技术建议、默认20秒（时钟由 Main、不是 Renderer 提供）、Subject/role/source 不明确则人工确认、候选目录资格过滤、人工改选/中断、Owner/frame/session/revoke 后的陈旧建议拒止。Router 不创建 CurrentCase、不静默安装政策。

### B4：50套模板与逐业务义务保全

G01–G08 共 50 套、历史 D4 冻结源 PR #97 SHA **b68443b23293b4714e61a3b81383d3d3a56434fc**。共 3,875 个历史技术 Check、4,163 条 source link applicability 目前仍 unknown；G01 **34 项 Check object/case scope UNKNOWN/NO_AUTO_DEFAULT**。任务是从原始 MD→task/check→sourceBinding/Check×object×scope→条件与有效性建立真实差分，而不是拿完整的技术 workspace 血缘替代业务无损性和学校签署。

历史产品范围还需追溯 71 条产品验收义务、72 项历史能力、20 项跨系统冲突、7 条用户旅程，按证据签收/保留缺口。B 不得推断当前校方政策授权/Gold。

## 2. 不得越权的文件与正式合同

- C 独占共享 DTO/types、正式 Main IPC/Preload、Principal/Owner 可信发行、CaseAggregate/CurrentCase/SourceCurrentValidity、ApplyMaterial/InstallPlan/ReviewRun/ReadReceipt/Decision/Appeal/Rating/Batch/Outbox、政策 Publisher/Gold/校方授权与正式工作台最终写口。B 不改这些生产文件，不建第二套业务真值，不提供伪 receipt。
- C 正式 **B-CR-001 = APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING**：认可 B1 候选 Plan、B2 stage/parser、B3 保守 route 的切片规格及 Main 可信接口方向；**不是**自动授权 B 自己实现 C Main handler、Preload 或发布政策。
- C **C-I1-FINAL-ENG-ACCEPT-R01** 正式接受旧 I1 技术集成 SHA 642c…；已另签 **C-I2-ANCHOR-002 / APPROVED_SCOPED_TECHNICAL_SOURCE_REPLAY**。I2 的固定 **B 来源锁为 bf88320e57b20ebc2023f27665c544ce2ba72ce4**（R10 三项绿色 SHA），并且 A 锁 c0132ae06de8ae09ab021ac231ffd34756eb5990、C 锁 3242b22a0825eec347b2748680bb746eb0f55215，原 I1 642c…；即使 B 之后 R11 更新、CI 全绿，I2 也**不得无 C 新决定就浮动至 B R11 HEAD**。I 可有选择地引 B 成熟技术模块和测试，不应等 B4 全部完成；任何 I2 新集成快照需自己的 Gate O 和 C 签收。
- **I-LEASE-MAIN-PORT-R01 = CONDITIONAL_NOT_ACTIVE**；正式 C 文件/Preload/业务 Writer 对 I 与 B 均 DENIED。I 已获的 C test-only 窄租约不是正式代码写入许可。
- 协调文件 #145 只能以最新 Git Blob SHA 乐观锁修改 **<!-- BEGIN:STATUS:B -->** 至 **<!-- END:STATUS:B -->** 内的自己状态；不改 DECISIONS:C / STATUS:A/C/I，状态摘要不得成为平行治理文档。本文件纯 B 会话交接也不要求其他 Agent 阅读。

## 3. 本次经过核验的 Gate O，必须区分 R10 / R11 / I2 锁

### R10 首次真正稳定检查点

**bf88320e57b20ebc2023f27665c544ce2ba72ce4**：

- PR CI #39291009965 **SUCCESS**：typecheck、boundaries、skin、Main+Preload+Renderer build、完整 Bun **4,100 pass / 5 OS skip / 0 fail**（4,105 tests、479 files、18,283 assertions）。
- D2 #39291009879 **SUCCESS**。
- Review Baseline #39291009937 **SUCCESS**。

**确切修过什么**：从 R09 的真实 CI 日志读取 InputLedger original 可能 undefined、handoff SHA nullable、B4 archive unknown、AuthorWizard B1Condition discriminated union 的 TS 首败；随后全量发现 17 项 ZIP / checkpoint / OOXML 回归：负数 Unix attributes 写 UInt32LE 的 test fixture、恶意符号链接用例污染其他 ArchiveVault 根目录、JSZip 额外目录 entry 与预期 3 文件不符。修复限于 B-own 类型收窄和试验夹具隔离，没有放宽生产安全拒绝。

**R10 为 C/I2 正式批准的 B 来源锁**；其 Gate O PASS 不意味着产品正式 release。

### R11 来源真实性、作者交互继续批次，最新也已绿

#142 **当前核验的精确 HEAD 45809553d19b6fba731fd7edb813ebbb81071031**；相比 R10 仅 B-own 6 路径变化：R11 JSON 原件账、B4 原件账 consistency test、B1BufferedIdentityInput.tsx + test、ReviewV3AuthorWizard 三类 ID 输入替换、R11 用户验收/政策阻断报告。

真实 CI（与当前 HEAD 同 SHA）：

- PR CI **#39294621431 — SUCCESS**，typecheck、boundaries、skin、Main/Preload/Renderer build、全部 Bun **4,105 pass / 5 skip / 0 fail**（4,110 tests、481 files、18,685 assertions），所有步骤通过。
- D2 Scoped Pi **#39294621479 — SUCCESS**。
- Review Baseline **#39294621743 — SUCCESS**。

R11 中间的新来源账测试曾先后触发 TS7006（未指定 JSON 数组元素类型）、TS2345（来源 SHA string|null）；已在 R11 最终精确 SHA 修复，新 CI 三项成功。**R11 B 独立 Gate O = PASS_EXACT_SHA_45809553**。旧 R10 的 Gate O 同样保留，用于已批准的 I2 固定源。此处区分 **“B 自己独立绿”与“I2 获准导入新 B SHA”**，后者尚未获新批准。

### 实机与业务门禁（两版均非绿）

- **Gate E = NOT_RUN**：真实 Electron/Main/Preload/Native picker、Office71、不同 CPU/OS、中文 IME、跨案撤权、20s countdown、100案/500文件、ZIP/ENOSPC/强杀/多 PID、对象/原件坐标回溯，需集中实机执行；不能以 Bun SSR/合成测试冒充。
- **Gate L = BLOCKED_NO_AUTH**：实际学校签发 Principal、校规原件/时效与独立 Gold、政策发布权限缺失；所有 50 套仍 candidate-held/publicationAllowed=false。
- **Gate P = PARTIAL / REAL_UAT_NOT_RUN**：第51套真实五人×30分钟无代码作者 UAT、正式主窗口 C 接线、50套逐条原文义务损失检查和来源适用性验收尚未完成。

## 4. B1/B2/B3 最新实际产物和未闭环点

**B1**：ReviewV3AuthorWizard + author edit/trial, B1 compiler + Main-only AuthorPort，保留条件三值、试跑输入不污染 frozen candidate、source/field/target rename 级联、删除仍被引用元素拒绝、异步旧预览失效、已保存 revision + 显示源快照一致才允许候选冻结。**必须由未来 C 工作台通过 freezeSavedDocument(ctx,doc,revision) 而不是旧 freezeCandidate(templateId,revision) 实现可信保存/冻结**。R11 B1BufferedIdentityInput 将三个 ID 的暂态输入缓冲到 blur/非组合 Enter，Escape 取消；真实 IME 还未测，仍可能有焦点重建/异步问题。

**B2**：B2StagingService，ReviewB2ArchiveVault，decodeReviewB2Zip，ReviewB2InputLedger，proposeB2MaterialCandidates，ReviewB2SourceVersionAdapter；保守 ZIP 原件恢复只返回 requestId+bytes，不伪造 physicalArchiveKey；输入账已带 receipt hash、Subject、源 SHA/版本、CAS 与 crash fail-closed，传统 /1 仅旧候选兼容，不自动授权升版。仅 Main 有权用 Native picker/当前 owner 重新认证。独立 Bun 已绿，目标机/多进程/ENOSPC 尚无 Gate E。

**B3**：ReviewB3OwnerBoundRouteSession 和独立 ReviewV3CandidateIntakeSurface：严格取 B2 当前 stage 的 candidate physical identity，Main 时间，不接受 Renderer 自填起点；材料/建议/资格变更重新计时、用户打断黏性、手动只选当前获技术资格条目；无模板时进入 B1 候选作者页。UI 仍 **NOT_MOUNTED_TO_C_WORKBENCH**，显示的是 proposalOnly:true，不是建案。

**同样重要**：旧验收文档 B1-R08、B1+B3-R09、B2-R05/R06/R07、B4-50-OBLIGATION-COVERAGE-R02.md、B-CR-001、R11 最新报告均是后续工程切片依据，不要重新做历史考古。

## 5. B4 R11 真实原文字节补证：43/50，绝不与校规效力混淆

旧 R03 从 Git 历史物理 blob 原文取得 **12/50** 实际字节 SHA256 重新匹配（G01 5 + G07 7）；38 套因原 MD 没进原仓库被标 unavailable。R11 通过用户已授权的 ChatGPT Library 搜索/取回对应原始 Markdown 内容，用**真正文件 bytes** 重新算 SHA256 与固定 D4 manifest 对照；新 JSON：

**docs/design/review-agent/acceptance/v3-dev-b-r01/B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json**

其中 38 个原缺口的结果：

- **31 份新增 MATCHED_LIBRARY_RAW_BYTES**。
- **4 份 HASH_MISMATCH_QUARANTINED**，隔离为独立不同版本或摘要冲突：**G02-T03、G04-T06、G06-T01（找到 v0.1.1 而非原冻结版）、G08-T03**。不得重新规范化/覆写 D4 历史 SHA 来“凑齐”。
- **3 份 RAW_LIBRARY_FILE_NOT_FOUND**：**G03-T12、G04-T03、G06-T06**。保留 BLOCKED_INPUT；未找到≠永久不存在。
- 因此当前**历史原始 Markdown 字节匹配证据 43/50**（12+31），不是 43 套通过学校政策核验、不是 Gold，也没有证明 3,875 个 Check 都无遗漏。该 JSON 与 R03 CSV 一一对应的 Bun consistency test 已在 R11 精确 SHA Gate O 通过。原始 MD bytes 未写入 Git 仓库，存档为 sha/文件名/冻结关系/状态元信息。

**后续必须进行**：7 项原文差异/缺失的可核对来源恢复或原作者确认；43 项已匹配原文的**逐义务**校对（业务条件、对象/case scope、Check×target、来源用途、冲突处理、人工责任、版本升级），并保持 4,163 applicability unknown 和 G01 34 Scope UNKNOWN，不能因为有完整来源文字就推测学校授权。

详细验收标准：**B4-B1-R11-RAW-SOURCE-AND-AUTHOR-UAT-READINESS.md**，以及 R03 CSV / B4-G01-34-ORIGINAL-LINE-ANCHORS-R04.json。

## 6. 第 51 套真实 UAT 的完整准备（不能伪装通过）

基础演练：无模板→创建用户声明候选审核目的/2 原始来源/3 字段 boolean-enum-evidence/2 对象与 Subject/2 Check（4 条 Check×target binding）/人工 Stage/Output，试跑 unknown/true/false、来源重命名、重复 ID、存后编辑、冻结旧源拒绝、修改 Check 必须版本 ACK、导出/重启恢复。五个真实非开发用户、各 30 分钟、从空白真实 UI 完成，不允许通过复制内置 JSON 或开发者手动操作冒充。

**允许启动真人 UAT 的前提**：C/I 取得授权后真实 Electron 工作台安装了 B1+B3 技术候选入口；Main 依据真实 sender/frame/owner 获取 Principal，保存/冻结用 C 明示可信 port + revision CAS、物理来源与模板权限再验；集成的精确 SHA Gate O 通过。没有前提时 B 可继续补组件和离线准备用例，但**不能填 P=PASS**。

**保留证据**：五份完整屏录/匿名参与者 ID/OS+应用版本+精确 B/I/C SHA/开始结束时间、无代码独立完成率、每一步 UI/原件 SHA/SourceRef/DocumentVersion、Main Receipt/revision 与冻结 candidate fingerprint、中文 IME/键盘、异常/撤权/重开/错误恢复和失败首发日志、PASS/PARTIAL/BLOCKED 的独立判据。

**NO-GO**：错误 Subject 或原件版本跨案串写、撤权后旧 actor 生效、试跑伪附件被当已验证、未保存 UI 静默冻结、Check/来源引用意外丢失、错误校规发布、无可信 Main 接线/政策发行，都不能签 P。具体五人每五分钟脚本见 R11 文档，不要把合成第 51 套技术试跑写成真人验收。

## 7. 新 Dev-B 下一阶段建议顺序（可并行准备，禁止伪装签收）

**P0 / 恢复真实现场**：先读本文件、#145 唯一协议最新 blob 的 B/C/I 与 C 决议、#142 当前 HEAD 和 R11 四门禁，以及 #144、#147 当前 source locks。确认 45809553 的 3/3 CI 和 4,105 pass 无回退；若远端新 HEAD 再变则重新核算。

**P1 / B4 实质来源真实性与逐义务差分**：先检查 R11 的 31 raw match 证明链；在用户授权的 Library/历史 Git 中继续找 7 项。能够独立找到的要比较真实 bytes/版本/规则变化，不要静默忽略哈希冲突。并选择 G01 34 UNKNOWN 等高风险义务做原文逐条 business scope 与 decision duty matrix；只有原文+可信权威能支持时才升级具体判断；允许 UNKNOWN 但必须列阻断和责任人。

**P2 / B1 真正无代码作者产品完善**：先检查 B1BufferedIdentityInput 的真实编辑状态与新交互负例（输入法 composition、外部 prop 更新、blur/Enter/Escape、重复 ID、异步 save 的 race）；继续错误引导、展示完整受限权限、版本 diff 与删 Check ACK、导入/导出、Source/Subject preview。保持 R11 的候选权限边界，不引入 C writer。

**P3 / B2 更有价值的原件可靠性与批量验收准备**：不再围绕已通过的类型错误打补丁，集中补跨案/跨进程来源事故、ZIP 容量锁 orphan 手工安全恢复、ENOSPC/kill、Office71 真实原件矩阵、100案/500文件输入背压、PDF/DOCX/XLSX/图片 source locator 差异与 parseRevision 后 stale-proof。目标机必需的真实验证书写成可独立执行任务与证据。

**P4 / B3+C/I 技术桥接交付**：以 R11 最新 B 技术源为**新的可考虑候选 SHA**（不是自动替换 C-I2 锁）；给 C/I 准备精确 file list/blob SHA、明确 source identities、前后验收差异、依赖 C0/C2/owner/grants、技术只读 handler 需求 CR。I2 现行授权锁是 R10 bf883...，除非 C 修改裁决，否则 I 保持 R10 来源。正式 Main/Preload/Plan/Run writer 最终由 C 集成。

**阶段门禁**：每轮 B-owned 生产+测试集中提交，最后以**同一精确 SHA**的 PR CI、D2、Baseline 和必要的专项 build/tests 验证 Gate O；Gate E/L/P 一律如实。严禁因 Runner 排队打散成大量细碎提交或借旧绿证明新功能。可将目标机测试集中批次执行，但不可缩减其范围/质量。

## 8. 工程清单与路径索引（新会话优先从此进入）

- B1 主：apps/electron/src/main/lib/review/review-template-plan-adapter-v3-b1.ts、review-template-author-store-v3-b1.ts、review-template-author-main-port-v3-b1.ts；apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx、review-v3-author-edit.ts、review-v3-author-trial.ts、B1BufferedIdentityInput.tsx（每个有相应测试）。
- B2 主：apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.ts、review-source-version-adapter-v3-b2.ts、review-zip-intake-v3-b2.ts、review-zip-staging-v3-b2.ts、review-import-checkpoint-v3-b2.ts、review-import-ledger-v3-b2.ts、review-import-handoff-v3-b2.ts（每个需核对应有测试）。
- B3 主：apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts；apps/electron/src/renderer/components/review-v3-dev-b/review-v3-route-view.ts、ReviewV3CandidateIntakeSurface.tsx 与测试。
- B4 主：apps/electron/src/main/lib/review/review-v3-b4-obligation-lineage.ts、review-v3-b4-original-byte-verifier.ts、review-v3-b4-library-original-audit.test.ts；docs/design/review-agent/acceptance/v3-dev-b-r01/B4-*，特别 R02/03/R04/R11 证据账。
- 作者与第51套：docs/design/review-agent/acceptance/v3-dev-b-r01/B1-R08-AUTHOR-REFERENCE-INTEGRITY-AND-51-UAT.md、B1-B3-R09-VISIBLE-ROUTING-AND-AUTHOR-ENTRY.md、B4-B1-R11-RAW-SOURCE-AND-AUTHOR-UAT-READINESS.md。
- 本 B 会话可回查工程内旧交接 DEV-B-R01-SESSION-HANDOFF-20261019.md，但以此 R12 为准；跨线只读 #145 唯一协议。

## 9. 下一会话交付纪律与必须避免的错误

1. 工程改动只交 B 工程 Draft #142，不 merge main、不改 C owned/shared DTO/IPC/Preload/正式工作台。可用独立 worktree；当前工具环境不能本地 clone/Bun 时可走 GitHub 连接读写，然后必须看真实 Actions job log。旧测试合成数据不等于实机。
2. 最新的 45809553 是**独立 B Gate O PASS**，但 I2 签署的 B 来源仍 bf88320…，这两个事实并行成立；不得擅改 C 决议、写成“已被 I2 集成”。
3. B4 raw MD 的 43/50 仅 bytes identity，4 个摘要冲突和 3 个未找到必须逐项保留；所有 50 套持续 candidate-held，Gold/政策授权 BLOCKED_NO_AUTH。
4. B3 20s、B1 第51套已是独立可见技术候选，不等于真实 C 主窗口/Native 已接线。Gate E NOT_RUN，P REAL_UAT_NOT_RUN。
5. 所有业务身份由 Main 实际 owner/sender/frame 派生；源物理版本、Subject、read/check/revision、撤权与最终 receipt 必须严格绑定。绝不以 synthetic Main、Renderer JSON、模型建议或 hash 元数据伪造正式校方行为。
6. 只在 #145 STATUS:B 中以原 blob SHA CAS 更新短状态，必要时附本 B-only 文档**地址供下一 B 会话引用**，不要求 A/C/I 阅读；C 裁决区/其他 STATUS 保持原样。
7. 用户偏好**完整产品批次+集中验收，不降低质量**。下一轮优先开展真实价值明确的 B4 来源差分和 B1 用户操作，而不是又跑一轮无边界考古或仅提交空文档。

**交接终点**：截至 2026-10-20，Dev-B 最新 B-owned R11 代码已经取得三项精确 SHA Gate O PASS；B4 43/50 raw-byte 技术身份、7 个问题项；B1 缓冲身份编辑、B1+B3 可见候选表面已入库；下一会话应继续真实业务来源/作者/Office 验收工程，持续与 C/I 安全接线协调，不重做 R10 类型修复。
