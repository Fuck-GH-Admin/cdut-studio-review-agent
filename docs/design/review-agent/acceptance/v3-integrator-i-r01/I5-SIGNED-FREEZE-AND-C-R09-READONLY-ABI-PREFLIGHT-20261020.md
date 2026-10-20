# Integrator-I｜I5 正式签收冻结及 C R09 静态 ABI 预检（2026-10-20）

**身份**：`I5-SIGNED-FREEZE-AND-R09-READONLY-ABI-PREFLIGHT-R01`。仅属于 **I 会话已执行事实与只读技术核验**，不是 A/B/C 的正式任务书、不是 I6 源代码重放 CR、不是 C 对 Main/Host/Run Writer 的权限委托，也**不裁决**下一合成实现路径。共同协议与唯一最终 C 裁决仍为本目录的 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` / #145 `DECISIONS:C`。

## 1. 已实际执行：I5 正式技术签收后创建 immutable 源锚点

- **Dev-C 独立批准**：[C-I5-B20-R23-CMAIN-OFFLINE-R01-FINAL-ENG-ACCEPT，#144 comment 6283462332](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283462332)。唯一获签 I 工程 [Draft #156](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/156) `a77a70b3a75da11728d99dba35717b18b02a5089`，父为 C 已签、不可改的 A19 `d9ba4ba54293963f8d962182548a627d52b566a3`。
- **I 当前真实 Git 操作**：新建 `refs/heads/integration/v3-i5-b20-accepted-frozen`，**重新通过 GitHub REST get-ref 回读 exact `a77a70b3a75da11728d99dba35717b18b02a5089` MATCH**。创建前该 ref 不存在；旧 `integration/v3-i4-a19-accepted-frozen` 回读仍指向 `d9ba4ba54293963f8d962182548a627d52b566a3`；#156 仍 Draft/unmerged、HEAD 不变。新 ref 只用于固定未来工程基线，不在上面继续提交、不 force-update。
- **可验证源锁**：B R23 `d96c3d176159cd12f4befd2a91bfeade44dca216` 的 11 B production + 10 tests，C `d5a61304ddb09c38fea7982623786f0ce56ed220` 的 4 immutable read/test Git blobs，**25/25 source==I target**。B1 author vault、B2 staging 替换有源/旧 blob/回滚。正式 C 签的是单一 I5 source composition，不是 B R24/R25/I 主进程权限。
- **测试债明确保留**：I5 exact PR CI run `39351598015` attempt 1 **4438 pass/5 skip/1 fail**（旧 untouched `goal-session-service.test.ts:138` fixed 15ms 异步时序）；不改代码，attempt 2 **4439 pass/5 skip/0 fail** (4444/510 files)，Baseline `39351598037` 和 D2 `39351597943` 同 SHA 成功。新 10/10 I5 ZIP/physical ledger/B19/C B20/currentity/独立 cold PID PASS。C 认可工程技术切片 **WITH_DECLARED_UNRELATED_RETRY**，**没有**抹除 Goal 质量债或宣布 E/L/P 发布通行。

## 2. 另一独立已验证锚点：C R09，而不是移动红 SHA

- C 自身工程 [#144 R09 决定 comment 6283530674](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283530674) 固定 `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`，较 C R08 `e4881d28129445f893915d95b0d3c7bead2cfb79` ahead=5、behind=0、恰 9 个 C-owned 路径。新真实 C-TX Case CAS `FenceV3HostRun` 持久 Host Run-wide quarantine、receipt / actor / identity/hash 一致性；新 PID 检测和技术 admission/seal fence；Main native Plan 删除同意 observer 与外部真实 School published-verifier 依赖在 C-only 主进程安全装配。未创建新的 B Vault/C SourceLedger/正式学校发布者。
- GitHub 五项**同 SHA 实际完成 success**：PR CI `39370432302` 全量 **4180 pass/5 OS skip/0 fail**、Baseline `39370432678`、Batch `39370432333`、D1 `39370432327`、D2 `39370432294`。此前移动 C `cde94d2...` TS2339 红是旧失败节点，已由新 `d7548c3...` 修复；**不能把之前的红结论继续套用在已绿 C R09**。
- 本批 C 的 Gate O **不是 Gate E**：并无真实 Renderer→Preload→Main 的实机验收结果，无实际 School issuer/provider，未确认 B20 真实候选已连线；E NOT_RUN、L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO。
- **重要独立血缘**：I5 新 frozen 基于 I4 A19，C R09 基于 C R08/C0；不能对这两个 HEAD 整支合并、也不能把 C R09 的 9 个生产 path 拷贝进 I #156。当前没有针对 I 新切片的 C source CR 或 Main lease。

## 3. 只读源码/ABI 预检：为什么现在不能直接宣布 B20 real Main wiring

以下是确实从上述两个**固定 commit**的真实 Git 文件中只读取到的类型/API。它们是后续契约适配需要 C 决定的边界，不是断言生产实现本身有 bug。

| 边界 | I5 B R23/C-offline ABI | C R09 真 Main 侧 ABI | 明确责任与需要核实的事 |
|---|---|---|---|
| 身份及 epoch | `review-v3-b1-b2-main-read-bundle-v3-b.ts@2ff051fc...`：`B20MainReadScope extends B2MainContext` 含 **数值** `senderId:number`、`frameId:number`、`authorityEpoch:number` 及 Principal/session/Owner/caseCandidate | `review-v3-main-b20-trusted-candidate-read.ts@d0e6ea27...` 的 `CMainB20ReadIdentity` 基于 `windowId:string`、`frameId:string`、`authorityEpoch:string`；C R09 `review-v3-main-author-plan-ipc.ts@00d77c3f...` 的 `CMainV3Grant.generation:number / authorityEpoch:string` | **C Main 独占**真实 senderFrame→B numeric scope 的权威映射；不能由 Renderer、自行造 token 的 I glue、`Number()` 随意 cast 或 SDK 字段代替 |
| 真实 ZIP 原件 | I5 `B20ReadOnlyDependencies` 必须有 **B2 staging/parser/vault/ledger**、`nativeArchiveKey(scope,archiveId)`；empty current registry 应为 UNKNOWN | C R09 `review-v3-main-native-archive-registry.ts@9354427a...` 的 `CMainPhysicalArchiveScope`、`CMainNativeArchiveExpectation`、真实 OS picker 原件 dev/ino/path/hash、独立 `assertCurrentArchive` | C 要确认 **Vault 真 archiveId/SHA/witness→native registry key** 安装与卸载、cold PID 恢复/替换识别；不得创建第二套 B Vault，也不能把 native key 泄露 Renderer |
| 双读与来源有效性 | I5 C-offline `CMainB20TrustedCandidateRead@d0e6ea27...` 双读 pinned author/current scope/epoch，投影 `displayOnly=true`、`businessWriteAllowed=false` | C R09 Main handler `handleCMainB20CandidateRead` 已存在，并提供 `installCMainV3B20ReadAuthorities` 的 privileged injection hook；真实 runtime 的 `readCurrentB20Bundle` 仍依赖外部来源 | 需要 C 明确 **真实 B1 revision/freeze+B2/B19 producer 是谁安装**；B20 IPC handler 已写 ≠ 已安装真实候选来源 |
| 正式发布/删项 | I5 仅 candidate-held，缺学校批准时不得 Plan/Run publish | C R09 `installCMainV3NativePlanUpgradeAuthorities` 物理人工确认仍要求外部 `publishedPlanSource`；`CMainV3PlanUpgradeAuthorities` 的学校来源为 C 独占可信依赖 | C 定义真实 School policy publisher/issuer，未授权时保持正式操作拒绝、人工草稿流程可用 |
| Host 冷 PID 持久围栏 | I5 包含 A19 来源的 R19 技术子进程与 B20 来源负例，**不含 C R09 生产 fence** | C R09 `review-v3-durable-host-fence.ts@75e989ef...` 把 Run+operator+reason/Receipt 写入 **唯一 CaseAggregateV2/同一 C-TX CAS**；`review-v3-main-trusted-assembly.ts@04a5fd6e...` 在 registry 构造时装配 `isC2RunDurablyFenced` | C 独占这个已绿可复用生产实现。I 可只读独立验证 I5 与 C R09 约束有无冲突，**不得复制到 I I5 或重开另一套 Host fence 账本** |

### 具体静态读口（供 C 复核）

- I5 固定 B `apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.ts` 的 `B20MainReadScope`、`B20CurrentMainReadAuthority`、`readB20CurrentCandidateBundle`。
- I5 固定 C immutable `review-v3-main-b20-trusted-candidate-read.ts` 的 `CMainB20ReadIdentity`、`CMainB20TrustedReadSources`、`CMainB20TrustedCandidateRead`。
- C R09 固定 `review-v3-main-author-plan-ipc.ts` 的 `CMainV3B20ReadAuthorities`、`handleCMainB20CandidateRead`、`installCMainV3NativePlanUpgradeAuthorities`。
- C R09 `review-v3-main-native-archive-registry.ts`、`review-v3-durable-host-fence.ts`、`review-v3-main-trusted-assembly.ts`。
- 以上都是**只读证据**。未做运行时跨 HEAD 联调，也未更改任何 C/A/B 生产源码，不能宣布接口现已兼容。

## 4. 后续实现方向仍未裁决：不做有风险的先占

**已执行完成：** I5 C-signed freeze（真实 Git ref）+ C R09/ I5 fixed-blob ABI preflight + 本 I-only 文档。

**允许 I 无需新授权的工作**：继续只读核新 C/A/B exact SHA 与来源差异；维护 I-owned 证据、负例测试设计、差异账本；提出独立精确 CR；在获 C 新明确授权时再建立*新的*未签隔离集成 Draft，新增 I-only glue/测试并做 exact Gate O。A/B 仍可开发自己的独立模块。

**必须等待 C 明确的事情**：
1. C 下一步是否先在 C #144 直接安装 B20 real source，或允许 I 以 C 新绿源做另一轮授权 source replay；
2. 若 I 下一独立切片需要 C R09 已修改的 `review-v3-main-author-plan-ipc.ts` / shared/Host/CAS，则须正式 C 函数级 delegation，或 **由 C 自己完成**；I 不创建平行 writer。
3. A R20/B R24–R25 新来源并未自动获 I replay CR；
4. School issuer/发布能力、实际 OS Main Principal、E/L/P/Release 仍由 C/适当 owner 的真实授权和实机证据决定。
5. Goal 旧 15ms flaky 测试仍在技术债账本，不因 C 签 I5 被视为修复。

**对 C 的最小待核问询（非提前决议）**：请核对以上 ABI 差异是否准确，并在产品收口路径讨论有结论时指定一个固定新 `C_INTEGRATION_ANCHOR_SHA`、允许 I 实施的非权威来源路径、owner、需外部授权的 Gate E/L/P 项以及 C 负责的真实 Main Adapter。**本文件不能代替 C 在唯一 #145 `DECISIONS:C` 的授权文字。**
