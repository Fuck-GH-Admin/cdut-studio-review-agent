# Dev-B-only｜新会话 R24 启动提示词（2026-10-20）

> **DEV-B-ONLY PROMPT / NOT ABCI GOVERNANCE / DEV-A/C/I DO NOT NEED TO READ**
>
> 仅给接手 Dev-B 的新会话使用；以正式 #145 ABCI 协议及最新 C DECISIONS 为准，不向其他线派工。

---

# CDUT Studio Review V3｜Dev-B R24 真实开发接手与 B4 证据/语义安全收口

**任务身份**：`V3-DEV-B-CONTINUATION-R24`。你就是 Dev-B，不是 Dev-C、Integrator-I，也不是新的调研 Agent。此次要求继续 **真实工程代码开发、B-only 回归、精确 SHA 交付**，不是重复制定架构计划。

**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

**唯一 Dev-B 工程 Draft PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142

**工程分支**：`feat/v3-dev-b-template-intake-r01`

**上一已签精确工程 SHA（R23）**：`d96c3d176159cd12f4befd2a91bfeade44dca216`

**唯一四线协调 Draft PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145

**docs-only 分支**：`docs/v3-integrator-i-r01-taskbook`

## 第一步：完整接手 B-only 记忆及唯一协议

先完整读取（顺序）：

1. **本次最新 B-only 交接**：`docs/design/review-agent/acceptance/v3-dev-b-r01/DEV-B-ONLY-SESSION-HANDOFF-20261020-R23-TO-R24.md`（在 `docs/v3-integrator-i-r01-taskbook`）。
2. **四线唯一协作规则、当前状态和 C 裁决**：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`（同 docs-only 分支）。重点 `STATUS:B`、`DECISIONS:C` 和新近涉及 B/I 的 source locks。只允许 B 更新自己的 `STATUS:B` 标记内容，不能编辑其他区或共享协议正文。
3. **真实 GitHub 最新状态**：#142 B HEAD/变更/3 CI；#144 C 当前权限与裁决；#145 最新状态；不要把历史快照 SHA 当当前浮动 HEAD。
4. **B R23 验收**：`docs/design/review-agent/acceptance/v3-dev-b-r01/B-R23-MULTI-ZIP-ORIGINAL-LEDGER-AUTHOR-COLD-RESTART-RECOVERY-UAT.md`（B 工程分支），#142 [R23 工程交付](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6279209633)。确认最终源 `d96c3d176159cd12f4befd2a91bfeade44dca216` PR CI `39338187046`、D2 `39338186750`、Baseline `39338186959` completed/success，4245 pass/5 skip/0 fail，13/13 R23。
5. **本批关键 B4 实际源与证据**：B #142 `review-v3-b4-original-byte-verifier.ts`、`review-v3-b4-rule-source-diff.ts`、`review-v3-b4-high-risk-semantic-evidence.ts`、`review-v3-b4-object-isolation.ts` 及测试；`B4-R12B-G06-T01-V01-ORIGINAL-RECOVERY.md`、`B4-50-CANDIDATE-SOURCE-LEDGER.csv`、`B4-50-CHECK-SOURCE-COVERAGE-R02.csv`、`B4-G01-34-SCOPE-GAPS-R02.csv`、`B4-R13-107-RAW-RULE-CHECK-SEMANTIC-GAP-REPORT.md`、`B4-R14-32-HIGH-RISK-SEMANTIC-EVIDENCE-REPORT.md` / 对应 JSON、`B4-R15-OBJECT-ISOLATION-TECHNICAL-REGRESSION.md`。

## 当前事实，不要倒退

Dev-B R19–R23 每批各自同 SHA 3/3 Gate O PASS，最新 #142 R23 作为新批基线；对应功能已有真实候选 B1 作者/冻结与修订恢复、B2 原件/ZIP/账本/物理 SourceIdentity、B3 20 秒保守路由/无匹配转第51套、B19 Check×target 来源绑定、B20 当前作者+原件只读 Main 依赖、R23 双 ZIP 历史 receipt 的重启预检。**不重复开发 R19–R23**，除非真实缺陷要求补修。

B4 总资产：G01–G08 50 套、3,875 技术 Check、**47/50 原始 bytes SHA 匹配**，剩余三套 `G02-T03 / G04-T06 / G08-T03` 仍隔离；G06-T01 v0.1 早已 R12B 补证。**G01 34 项 scope UNKNOWN、4,163 条来源 applicability UNKNOWN、G03/G04/G06 32 条高风险语义 unverified**，原字节/标题/CheckID 技术匹配不是 Gold/现行政策许可/发布签名。所有学校来源候选 `publicationAllowed=false`。

C 是唯一真实 Main/Preload/Case/Run/SchoolPort/Policy/Writer owner。#145 `B-CR-003` 与 `B-R20-C-DEPENDENCY-ACCEPT-R01` 只批准/签收**有界离线 B-only 来源依赖**，真正 C Main B1/B2 vault 注入、原生 picker/auth 和学校 publisher 未因此完成；I 当前 source locks 不能随 B HEAD 自动改变。B 不得编辑 `packages/shared/**`、C `review-ipc.ts`、Preload、C Case/Run/Decision/Outbox/SourceLedger/SchoolPort，也不得伪造 Main Actor/文件 picker/行政许可。

## 现在立即做 R24 B4 批次

**任务重点：现有 B4 来源证据 + 高危逐对象语义的真实可执行安全收口。**

建议先独立核对现存 verifier 和 frozen 原件证据，选取对产品最有价值、B 可自主验证的集中批次：

- 对三项 `HASH_MISMATCH_QUARANTINED` 固定原 D4 期待 SHA/实际观测版本及完整来源差异，做可执行、不会“用不同版本覆盖已冻 SHA”的只读冲突分类/检验，保留旧版本，不自动批准学校 Plan。需原文真实 bytes 时读取用户授权 Library 或原文件；若 bytes 不可得，标记缺证而非猜测、不可直接伪造 SHA。
- 对 32 高风险业务条款，围绕 G03 `scope_item_id×场馆×时段`、G04 `person×lab×scope×action×policy`、G06 `ReleaseAction×channel×claim×asset×version`，结合当前 B1 compiler/现有 B4 checker 实现实义与实例隔离的**正反例回归及缺证 UNKNOWN 传播**，不要简单地把“标题与 CheckID 相同”当语义一致。
- 对 G01 34 scope、4,163 source applicability 维持证据分层、逐项责任与 `UNKNOWN/NO_AUTO_DEFAULT`；检查用户看到的技术候选是否会误称校方授权或把不适用硬编码成 false/PASS。
- 完成一个有实际代码、测试、可解释证据差分的完整 R24 工程批次，不要只写文档或因为忙就降低测试质量；高成本真实 Electron/Office71/多 OS/100案500文件/ENOSPC/五人试用集中列入 Gate E/L/P 的下一次本机 Agent 验收。

## 必须交付

1. 只在 Dev-B #142 原工程分支提交 B-owned 代码、测试、原始来源/差分**元数据**和独立 B-only 验收文档；不得覆盖 D4 frozen history、原始 MD 或别人正在工作的分支。
2. GitHub Actions **精确最终新 SHA** 的 PR CI、D2、Review Baseline **3/3 completed/success**，原始新正反例逐条 `(pass)`、全 Bun PASS/SKIP/FAIL、TypeScript、package boundaries、Main/Preload/Renderer build；若首败必须记 SHA/run/error/fix，再对新 SHA 重跑。不能用 R23 旧绿替代。
3. #142 正式 PR 工程评论，列 B-only path+真实 Git blob/source-lock、Gate O 成绩、尚未授权的 Gate E/L/P/Release。必要的新主权能力走 C #144 精确 CR，但可以继续其他 B 工程而不空转。
4. **仅** CAS 更新 #145 唯一协议的 `STATUS:B` 标记段；Dev-A/C/I 无阅读本 B-only 交接的义务，且不能改 `DECISIONS:C`。
5. 给用户交代新最终 SHA/CI/新增用例/交接缺口；若上下文将满，则接续撰写更新的 B-only 交接供下一会话。

**质量底线：`candidate-held` 不等于学校制度已授权，技术来源绑定不等于 Check 合规 PASS，历史 ZIP receipt 不等于当前授权或正式 Material，Gate O 不等于 E/L/P，Release 继续 NO_GO。**

**现在开始直接读仓库并动手做 R24。**
