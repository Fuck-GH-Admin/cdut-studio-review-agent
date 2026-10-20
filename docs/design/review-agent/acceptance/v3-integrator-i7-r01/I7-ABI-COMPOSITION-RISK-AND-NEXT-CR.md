# Integrator-I I7｜C R10 × I6 × A R22 × B R32 精确来源与完整产品可集成性报告

> 日期：2026-10-20；性质：只读源码/ABI 证据 + I-owned 测试开发；**不是**新增共享裁决、Main 安装、C 所有生产文件重放许可或完整产品验收。权威：[C 对 #157 的 I6 工程签收与 I7 指令](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/157#issuecomment-6285092127)、[C ABCI 正式总核验](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6285105398)及 #145 `DECISIONS:C`。
>
> 此文只汇集**已真实阅读的固定 GitHub Git 树与接口源码**。产品当前仍是 `Gate E=NOT_RUN`、`School L=BLOCKED_NO_AUTH`、`Gate P=NOT_RUN`、`Release=NO_GO`。

## 1. 身份 / 冻结核验

| 项目 | 精确提交 SHA | 作用、实际签证状态 |
|---|---|---|
| **I6 已签** | `d4ea818250df93dc00084378e8ab2d8bae0fc42e` | C [#157 决议](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/157#issuecomment-6285092127) 授权新的 immutable `integration/v3-i6-abi-accepted-frozen`。I 已实际创建并 GET ref 回读该 SHA；I3–I5 frozen 全不动，旧 #157 继续 Draft |
| **C R10 已签** | `2cb8331b8fdff43da70a894ec597820595cb4d2d` | C R09→R10 ahead=13 /behind=0，28 个 C 树变更；受限 5/5 Gate O 绿，只有这一固定 SHA 可做当前 C 只读来源锚点；不是已经加装实际 Main Principal/Owner 的 Gate E |
| **A R22 已签自有技术** | `511cd61071943f7035f37f44342ebda269825fa0` | A R21→R22 ahead=5 /behind=0、6 个 A-only 变更；C 专属 source eligibility，**非 I 许可** |
| **B R32 已签自有产品候选** | `3682465902565205a16a88a00324dc42ecf8ccbd` | B R29→R32 ahead=10/behind=0、7 个 B-own 变更；C 专属候选 source eligibility，**非 I 许可** |
| **B R23 真来源** | `d96c3d176159cd12f4befd2a91bfeade44dca216` | 旧 I5 正式批准且 C R10 重新精确导入的来源，不可因 R32 迭代而覆盖固定 B R23 |

**机器来源清单：** [`I7-00-EXACT-R10-A22-B32-SOURCE-ABI-CLOSURE.json`](./I7-00-EXACT-R10-A22-B32-SOURCE-ABI-CLOSURE.json)，记录 21 个三方同源 blob、7 个新 C R10 路径、5 个旧 I6/C R10 同路径冲突、6 个 A22 变更和 7 个 B32 变更的各自 Git blob/目标状态；这是只读文件身份，不意味着已经导入。另见 [I1–I6 现有 13 个 I-only 集成文件的直接依赖图](./I7-00-I-ONLY-TEST-REPLAY-DEPENDENCY-GRAPH.json)。

## 2. C R10 生产合成来源闭包与避免重复

Git 比对真实为 R09→R10 **28 个变更路径**，拆解为：

- **21 个 B R23 生产与测试来源**，其 Git blob 在 `B_R23`、`I6 frozen`、`C_R10` 三棵 Git tree **21/21 完全一致**。例如 B1 `review-template-author-store-v3-b1.ts@065251ca843c51e68e225dc688bb7a8caab2fea7`、B2 `review-intake-adapter-v3-b2.ts@e911663006cb105aad382a6a107630534e014739`、B20 `review-v3-b1-b2-main-read-bundle-v3-b.ts@2ff051fc5d18a2c0ef9465188a3611a71a0989ee`。**未来从 C R10 派生的新 I worktree 不应重新复制 21 件**。
- **七条 C R10 自有 Main/合同实际新增或修改路径**，每条具体 SHA 在机器表：`review-v3-main-author-plan-ipc.ts@6674944cbb58dd568d414e613363397afe7469b4`、`review-v3-main-b20-current-registry.ts@5ab581e104f89007f18f13ea9dc56327db13bf1e`、`review-v3-main-b20-physical-composition.ts@582e106690a8af369d6f5841b66ccad3f0658b32` 及 `.test.ts@a929b36e6b64313eaf2bdec63179aa93e502f74d`、`review-v3-main-native-archive-registry.ts@993de558511767b8b67251de80434f944a51b364`、`apps/electron/src/preload/index.ts@2ddcbcf33234a7d676c413719fe4f58e831d7f1f`、`packages/shared/src/types/review.ts@1faaf88e3a681d6ed75c2c44463a9e049c7656e2`。**这些都只能由 C 实装/修改；I7 不复制一条**。
- **五个 I6 旧/ C R10 新源码冲突**不能被旧 I5/I6 测试基线反向覆盖：`plan-binding-v3.ts`（旧 `8a252806...` → 当前 C `5870588b...`）、`review-v3-main-host-receipt-registry.ts`（旧 `bba17b3c...` → C `26359d4b...`）及 test（`9b0054cb...`→`a54d71db...`）、`review-v3-run-writer.ts`（`e48506fa...`→`b53cea6f...`）、`review-v3-technical-ledger.ts`（`a0ed06a0...`→`a3378792...`）。C R09 已有持久 `FenceV3HostRun` 的 Case CAS / physical Host Run tombstone，不可重置成旧 I6 process-local 语义。
- **A R22** 6 项只读固定源包括多轮 SDK 调度器 `review-v3-technical-sequence-driver.ts@3c4bbb8d2071eb5960e27048aa169a4fc8e11274`、Dispatch Fence 更新 `review-v3-sdk-dispatch-fence.ts@a2a53f3927d29b65c492753fc372e060546b6908`、`review-v3-a-host-technical-handoff.ts@9f7c86ea98851b26df95739f212e87e140a7d720`、`review-v3-background-technical-coordinator.ts@5bdb4b0b775c6a5e9db4bbabd9136ab14da7fb0b`，另有测试/冷 PID worker。**A technical evidence canSealCReviewRun=false**，SDK handoff 永远不直接当 C physical Host receipt。
- **B R32** 7 项包括 `review-v3-b30-current-materials-read.ts@a26143b485b5a6d51622927916d781da25ac0fad`、`review-v3-product-workflow.ts@0dcf2188c558e5fd7d73958d4a0d9a296f67edbc`、候选工作台与 IntakeSurface，新 Test + UAT 文档。B read 汇总 B2 完整 staged source，但仍 `candidateOnly=true` / independent C Main identity `false`；未获得 C 安装与正式学校发行者不可直接写 Batch/Decision。

## 3. ABI：真实 C 身份、物理原件、Run/Host 与用户界面之间的剩余信任边界

| 合成方向 | 已存在的技术实现 | 尚缺且不能由 I 构造的授权事实 / 禁止行为 |
|---|---|---|
| C Main current → B20 | C R10 真实 `CMainB20CurrentRegistry`、`CMainB20NumericEpoch`：本地数值 epoch **自行单调递增**，绝不 `Number(C string epoch)`；同一 Main Owner/frame scope 新代际重新校验。真实 B1 revision/frozen、B2 Vault/ledger/parser、B19 selections/B20 双读 | R10 是 production 代码和注册入口+技术 isolated Gate O，**真实 Electron 启动时可信 Principal/Owner/Grant producer 尚未安装**；I 测试不会编造 |
| C OS ZIP → B Vault current key | C Main `B20_NATIVE_REPICK_V3` / native chooser、inode/SHA/size/opaque original digest，B ledger 的物理文件版本字段 | 主进程当前身份与物理原件 OS 当前观察缺席要 fail-closed；存盘 B1 不能重新授权冷 PID 原件，Renderer 不得交凭据 |
| A Pi/Host → C Run | A22 `A22TechnicalEvidenceEnvelope` 保持 `canSealCReviewRun:false`、turn-budget/dispatch/owner ledger；C R09/10 Run-wide durable fence/唯一 C-TX Case Receipt、物理 Host independent observer 合同 | A 技术 proposal/SSE/SDK ACK 不能变 C Host Read/Check/terminal，旧 Run fence 永远优先，实际 C live SDK/Host/Owner 仍未接通 |
| B30/B32 UI → C Case/Plan/Decision | B32 产生完整材料 `candidate-only` 只读快照、可预览/人工修复/第 51 套动态候选 UX | B Candidate/UNKNOWN 不等于 published school policy、Run/Batch Decision。C Main 还需真实 Owner/Case/Publisher、readVersion、Renderer mount 和 Gate E，禁止默认 PASS |
| C Native Plan/Removal → human confirmation | C R10 `review-v3-main-author-plan-ipc.ts` / C-only one-time user consent、学校来源外部 dependency | 本机 reviewer 身份≠学校授权 Principal；没有 Publisher/独立 Gold 就不能正式发布/删项等业务批准 |

### 七条旅程对下一次 I Gate 的落地优先级

- **J01 真材料接收/路由**：I 重验 C R10 真 ZIP 原件 → B2 Vault/ledger，敏感 Main current Scope 在实际 Gate E 才能确认。
- **J02 50+1 模板**：B R32 51st 不获政策发行，G08-T03 原件 49/50 与 4,163 UNKNOWN SourceRefs 继续手工路径，不能自动 PASS。
- **J03 作者更新/冻结**：R10 trusted current B1 revision/B19/B20 candidate preview 可离线验证，physical Main actor 与权限仍缺。
- **J04 Pi/Host/Run**：C durable Run fence 应优先于旧 I6 in-process registry；A22 envelope 仅技术来源，R11 由 C 装真实 Host 见证。
- **J05 Batch/Decision**：B32 candidate workflow 不代表 C V3 Batch exact finalizer、正式 Decision writer，需 C 另做真实业务链。
- **J06 后台与失败恢复**：Main 断连、跨 PID、unknown Provider 不自动 replay、空白 `.write-lock` 仍拒绝接管。
- **J07 申诉/评价/导出/来源追溯**：C 独占正式 Outbox/Decision/Appeal/Rating 与迁移；V2 业务代码不等于 V3 产品 Gate E。

## 4. I-only 实际技术工程的验证边界

新 I7 本轮从**已签 I6 ref**单独派生，仅在 I 自己的路径增加机械 source-lock 和不具备主进程的 fail-closed/cold PID 测试；不把 C R10 主进程代码复制进 I，故新 I7 回归不能声称“实测 R10 Gate E”或“实测 C durable fence”。

- 本轮 I7 已新增机器四源表和 [I-only 13 文件 direct dependency graph](./I7-00-I-ONLY-TEST-REPLAY-DEPENDENCY-GRAPH.json)。13 个已有 I-owned test/technical 模块中，**仅 5 个无 C R10 缺失的直接导入**；且 `review-v3-integration-i4-b18-version-host-boundary.test.ts`、`review-v3-integration-i6-joint-technical.test.ts` 使用旧 C process-local Host 语义，需要用 C R10 真实 `isRunFenced` 重新检验；`review-v3-integration-i6-locked-sources.test.ts` 锁旧 C/blob 与“R10 新文件不得存在”，不能直接移植到新 C 源，只能重基线。
- **精确可优先评估的独立来源子集**：I5 `review-v3-integration-i5-b20-cmain-offline.test.ts@754a86fbffa12787309090e58b38bffb4ca647a0` 及同批 worker `review-v3-integration-i5-coldpid.worker.ts@fb2cc8ef6346acd8117362513b513cb2f28b3fa9`。两者直接依赖的 B1/B2/B19/B20、C immutable read Git blobs在固定 C R10 内都存在，来源到达 C10 **无需额外 A/B 生产 blob**。但仍需 C 先对 **I→C 或新 I 测试分支**的两个确切 blob 发新的来源 CR 与完整 Gate O 才能实际移植；“无缺失 direct imports”不能取代真实运行回归/合同签收。
- I6 测试和 I7 当前代码属于已签 I6 父加新 I-only；因 C R10 ABI 真值改变，下阶段 I 用独立新测试证明“old I6 positive may be no longer allowed”时，**不放松 C 的安全门禁**。

## 5. C R10→I 新授权申请建议（本报告本身不构成来源许可）

**建议最小首次 I7 技术测试来源请求**：严格只申请从已签 `integration/v3-i6-abi-accepted-frozen@d4ea818250df93dc00084378e8ab2d8bae0fc42e` 上述 **2 个 I-only test/worker Git blobs**，导入**以 C R10 `2cb8331b8fdff43da70a894ec597820595cb4d2d` 为唯一安全主干的新隔离技术验证 worktree**，没有新 C/A/B 生产源复制。验证 R10 的 C reader 不破坏旧 I5 原件/冷 PID/候选当前性后汇报新 exact SHA 给 C 签收。**绝不**把 I6 旧 C Registry/Plan/Run/ledger 五个 blob，或者 B20 来源新翻版覆盖 R10。若 C 希望 I 新工作树不以 C R10 为父，也可签只读比较而暂不授权移植；无自授权。

**未来 A R22/B R32 原件若确需由 I 单独联测**：当前 C 仅授予 C 自身的六项 A/六项 B 技术试验来源许可，不授予 I；需一份独立新 CR，且先读 C R11/R12 中是否已经包含与 A/B 相同 blob，避免重复和覆盖。具体 Git SHA/path 在上述机器表，未安装的 C 主进程能力仍由 C 自身维护。

**Rollback**：本 I7 隔离分支只添加 I-owned test/worker/docs/manifest；放弃 Draft 或 revert 新增文件即回到 immutable I6 `d4ea8182...`。C R10 本身 rollback R09 按 C 自己的流程，**I 不触碰 C Case 持久文件、Host Receipts、业务 Actor**。完成后独立 #157/新 I7 Draft 与 Gate O/完整先前失败保全，再请 C 精确工程签收；签署之前不创建 I7 accepted frozen。
