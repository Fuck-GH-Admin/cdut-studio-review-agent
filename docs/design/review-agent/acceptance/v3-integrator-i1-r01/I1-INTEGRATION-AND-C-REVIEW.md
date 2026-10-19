# Review V3 I1｜真正 A/B/C 技术集成、联合验证及 C 复核请求

**状态：`I1_CODE_ASSEMBLED / EXACT_SHA_GATE_O_PENDING / C_SIGNOFF_PENDING`**  
**工程 PR**：[Draft #147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147)  
**单一治理/授权**：[Draft #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) `C-ANCHOR-001` / `C-I1-AUTH-001`，协议 `V3-ABCI-GOVERNANCE-R01/V1.0`。

## 1. 冻结输入与 Git 血缘

| 角色 | 固定 SHA | 授权/真实边界 |
|---|---|---|
| C 技术锚点 | `31aa352c45a33d6832612884b0fea38e39b5cf8d` | #144 原 C1 绿 CI；并非 C 后续浮动 HEAD |
| A1/A2/A3 | `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` | #143 原已绿，技术 proposals-only |
| B1/B2/B3 | `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` | #142 原已绿，候选作者/暂存解析/技术选路 |
| shared | C0 `5682057c7232c914e72fdae525ce95fd33f32b53` | `review-c0/1` 不变 |
| 上个 I 检查点 | I0 #146 `c84f575addcbb1f36b5eff0acb27442b91073fa1` | C 已签 I0_ACCEPTED_SCOPED；**仅引用历史锁，不改旧历史** |

I1 从 C 锚点创建独立远端 `integration/v3-i1-technical-a-b-c-r01`，**不是从 #145 docs 分支、A/B 整分支、或 C 浮动最新 SHA** 派生。为避免 GitHub PR base 随 Dev-C 并行开发移动，创建 **冻结只读对比基准引用** `integration/v3-i1-c-anchor-001-frozen`，精确指向 C 批准 SHA。#147 Draft 以此作为 base；这样 PR 所见的 21+ 变动是 I1 导入/新增，不把 C 新提交当旧锚点一部分。不得合并这个基准分支进 main 或宣称主线已整合。

Git 对象级文件导入：`b6e767f0c85eca8e1c83a5420bc31ea8b4533e8f` 父 commit 是**唯一** C 锚点；其 tree 以 C 的原树为 base，增加 A 自有 8 个源码/测试 blob、B 自有 10 个源码/测试 blob，来源 SHA/每文件 blob 都保存在 `I1-SOURCE-AND-CHECKPOINT-LOCK.json`。这种方式没有 whole-branch merge，也没有覆盖旧 C 文件。后续 I 独立 glue/test 提交按普通 fast-forward 累积。

## 2. 实际新增跨线能力（可执行代码，而非设计文件）

- `review-v3-integration-i1-technical.ts`：调用 **B2 Main-scoped staging registry** 取原件候选、**B1 compileReviewB1Plan/verifyReviewB1Descriptor** 生成候选不可变 Plan，与 **A3 V3ExecutionCompletenessAdapter** 对 `Check×target×object×subject` 做技术诊断，同时使用 **C1 currentSourceValidityBlockers** 拒止归档确认、用 **B3 planB3ConservativeRouting** 验证 20 秒唯一可信技术选路。
- 同一 I 自有模块再连接 **B2 ReviewB2SourceVersionAdapter** 的实际原件解析与 `sourceForBlock` 注册表，从物理原件字节生成可追溯 C0 `SourceIdentity`，不允许由 Caller/Renderer 自报 block/locator；伪 block、旧 parse、撤权失败处理沿用 B 源代码。
- 所有输出固定为 `STAGED_ONLY`，`publicationAllowed=false`，`canInstallPlan=false`、`canCommitRun=false`、`canFinalizeDecision=false`。即便技术覆盖全匹配，也只是技术诊断、不是正式业务完成、更不是校方受理。真实 Host 回执由 A/C 以后的正式接口提供；本 I1 仅合成技术输入且**不允许**将结果作为业务授权凭证。
- `review-v3-integration-i1-technical.test.ts`：**8 条新合成跨线测试已提交（执行状态需以 I1 HEAD CI 为准）**，覆盖 B1/B2/A3 unknown 拒绝、Plan/Run 伪 Source 拒止、技术全匹配仍无写权、C1 归档旧来源拒止、B3 candidate-held/20s、B2 真解析/伪 block/撤权、跨 Subject 材料错误绑定拒止与单 Subject 合法预览、重复与撤权拒止。A/B 的 9 个独立源测试文件也在同一 I1 tree；并应执行全部原有回归。
- 不引入 C 最新 `review-v3-execution/1`（它在新的 C SHA，非旧锚点）。`CR-A-001` 已批准的未来 DTO 只是规范，正式事件生产者/Run writer 未接。`B-CR-001` 的 Main native picker/正式 Plan publisher 和 ApplyMaterial 也依旧由 C 独占，未擅加。

## 3. Source blob → I commit 与所有权证明

- 18 个 A/B 文件保留**完全相同的 Git blob SHA**，原始清单见 JSON，不在本 Markdown 重复 18×40 位字符；代码导入提交 `b6e767f0...`。
- I 自有胶水初始提交 `9a31c89d68d2bfea0f96cee52391c0f00c75cdfb`，联合测试初始提交 `96e20263f78869cca31b311edfa9d27923b7cff6`；解析真实物理块补充提交 `9afd9d80eb03041b665964efce8a34c1c9337126` 与 `6a90a235325d6802e119bf3a143f4b5d6ec7bc85`；另有 Subject-source fail-closed `bed8c537bd2a2187c33d006afe0f9d9c7b7bbd2e` 与联合正反例 `df7b79e663a96841310b8f91b90311bead62e9fd`。
- `UPSTREAM_TO_A`：目前无源代码修复；`UPSTREAM_TO_B`：无；`UPSTREAM_TO_C`：无；`I_ONLY`：两个新 `review-v3-integration-i1-technical*` 文件与本锁/本验收报告。
- C 独占 `packages/shared/**`、`review-ipc.ts`、Main Principal、Preload、`application-service.ts`、Case/Run/Batch/Outbox 等 **零修改**。没有委托租约，I 不能修改它们；新版共享 DTO 也未借文件级导入绕过 C 签署。

## 4. 门禁、可复验命令与失败分流

**当前运行限制**：本工具容器 `git ls-remote https://github.com/... ` 报 DNS 不可解析 github.com，且无 Bun。经已连接 GitHub Git 数据接口完成原生 Git tree/commit/branch/PR 操作，未建立或冒充 Linux 本地可写 worktree。**联合 Gate O 必须以 #147 最新实际 CI 运行作为证据**，不能把原单线绿 CI 或本地 JS 静态断言计作通过；在最新 CI 结束前标 `PENDING_EXACT_SHA_CI`。

精确 I1 代码 HEAD 上须运行并保留 exit/log/首败：`bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、Main/Preload/Renderer build、`bun test apps/electron/src/main/lib/review/review-v3-integration-i1-technical.test.ts`、导入 A/B 所属定向测试、`bun test --isolate --timeout 30000`；PR CI 如自动覆盖需核对工作流 step 和实际 checkout SHA/tree。若 merge ref 与真实 I HEAD 不同，要记录精确受测树，不能宣称未经测试的 I HEAD 已完整 PASS。

**Gate E=NOT_RUN**（Electron/GUI、实际 Picker、Office、Host/跨进程）；**Gate L=BLOCKED_NO_AUTH**（学校/Provider/校规、Gold）；**Gate P=NOT_RUN**（71条、7旅程、100案/500文件、120+30和真人验收）；Release NO-GO。

三类历史安全负例：#139 L1-01 归档当前效力在本联合测试加入了 C1 负例；L1-02 真实 Main 角色注入拒止仍属于 C 受权入口/未来 Electron 验证（本批没有权限修改共享 IPC），未证明；L1-03 Batch exact Run finalizer 尚无 C3 正式代码，不能伪造通过。

**Bug 按 Owner 回流**：A Host/Owner/技术事件 → A #143；B parser/compiler/staging/routing → B #142；C Case/Principal/writers → C #144 精确 CR；I glue/test/replay → I #147 自修。

## 5. C 工程签收请求（不是自行签署）

请 C 在新 I1 精确 HEAD 的所有 Gate O 证据可见后，复核 #147 的 21+ 个真实变动文件、18 个同源 blob、`review-c0/1` 未变更与 I 只有非业务写入 glue 的事实；检验旧 #139 L1-01/02/03 尚未覆盖的真实风险是否仍清楚标 BLOCKED。然后对**精确 I_CHECKPOINT_SHA** 在 #145 第 9 节签署 `C_ACCEPTED_FOR_ENGINEERING` 或 `CHANGES_REQUESTED`。目前 C 工程签收为 PENDING。

**下一增量**：若 C 选下一锚点（如承载 `review-v3-execution/1` 的新 C SHA），不得直接覆写 #147 的已接收 I 工作。用新 C 的实际固定 SHA + 先前通过的 I_CHECKPOINT_SHA 做 patch/blob/行为差异，跳过 C 已吸收片段，逐片重放旧 I 自有 glue/A/B 受权切片、全量重跑同新 SHA Gate O。新正式写权仍须 C 逐端口批准。
