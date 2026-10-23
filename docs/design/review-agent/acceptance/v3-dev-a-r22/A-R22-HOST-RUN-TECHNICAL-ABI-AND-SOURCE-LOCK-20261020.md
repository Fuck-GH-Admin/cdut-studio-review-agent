# Dev-A R22｜C 可直接接线的技术 Host/Run ABI 与固定来源包

> **R22_A_TECHNICAL_SOURCE_LOCK / NOT_PRODUCTION_PERMISSION / 2026-10-20**
>
> Owner: Dev-A；C 独占真实 Main、IPC、Preload、物理 Host Registry、ReviewRun/业务 writer；I 重放需要 C 新的精确 CR。本文是来源交付与限制，不是新共享 DTO、发布许可或学校授权。

## A. 唯一源与回滚

- 仓库：`Fuck-GH-Admin/cdut-studio-review-agent`，工程 Draft [PR #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)，分支 `feat/v3-dev-a-pi-execution-r01`。
- **固定技术源 SHA：`511cd61071943f7035f37f44342ebda269825fa0`**；上一完整绿色回滚 `703e2bf8e20a7b598e1eb923d5faf6f7b17ab3a9`。base→head ahead=5/behind=0，只有下列 **六个 A-owned** 文件修改/新增，C Main/Preload/IPC/shared/Case/Plan/Run/SchoolPort/业务 writer 0 改动；无 I/B 修改。
- 严禁整分支 cherry-pick、用浮动 A HEAD 代替来源或将这些包提升为 C 已观察的物理回执。

| 文件（统一根目录 `apps/electron/src/main/lib/review/`） | Git blob SHA | 能力 |
|---|---|---|
| `review-v3-technical-sequence-driver.ts` | `3c4bbb8d2071eb5960e27048aa169a4fc8e11274` | R22-A 每 Turn Main 可信检查点/进度挂钩；既有 R21 顺序驱动 |
| `review-v3-sdk-dispatch-fence.ts` | `a2a53f3927d29b65c492753fc372e060546b6908` | R22-B Main-current Owner 门禁、Run scoped 技术派发 snapshot |
| `review-v3-a-host-technical-handoff.ts` | `9f7c86ea98851b26df95739f212e87e140a7d720` | R22-B 技术 Proposal+Dispatch/Grant/Run/Source/Turn 封包，非 C 物理回执 |
| `review-v3-background-technical-coordinator.ts` | `5bdb4b0b775c6a5e9db4bbabd9136ab14da7fb0b` | R22-C 持久多 Case 任务、exact CAS、冷 PID 拒绝、窗口停机 |
| `review-v3-r22-cold-background.worker.ts` | `21a7455f3c88ed6e4413c16b03800d0ca76d9c88` | 只读真实独立 Bun PID 冷恢复工装 |
| `review-v3-r22-concentrated.test.ts` | `d1f6278532d98af8e904eb48b80fa63c987217b8` | Owner/Proposal/Turn/Dispatch/多 Case/stop/cold PID 测试 |

## B. 实际可用的 A 生产技术入口

1. `V3ATechnicalSequenceDriver.execute(call, sequence, signal?, hooks?)`：同一 Main-frozen Run/Owner 的 `direct/hidden/graph/batch` **顺序**物理 SDK Turn；`beforeTurn/afterTurn` 同步技术检查点；Dispatch claim 与单次真实 Pi 请求由现有 `V3ASDKTurnBridge` 负责，持久 Turn Budget/receipt/CAS 由原生 A3/A4 完成。hooks 抛错会停止下一次物理派发，并不抹去此前已执行的请求。Graph 的 DAG 排程及正式 Batch finalizer **不在本模块**。
2. `V3ASDKDispatchFence.technicalSnapshot(call)`：须已绑定 **当前 Main Owner/Grant/Principal**，只读冻结 Run 的每次 `dispatchId / grantId / caseId / sessionId / state / technicalReceiptId`；`in-flight`/`late-denied` 均不能自动重试。技术 `technicalReceiptId` 不等于 C 的物理 Host receipt。
3. `A22TechnicalEvidenceHandoff.snapshot(call)`：从当前 A Owner 与 A2 `V3AProposalProducer.replayCandidates` 构造版本 `v3-dev-a-host-handoff/1` 的只读 `A22TechnicalEvidenceEnvelope`。字段包含：完整 `RunEvidenceIdentity`、session/sender/generation/epoch/grant、冻结 `sourceVersionIds`/Plan Check bindings、按序号且 `eventId` 哈希复核的 read/check/terminal 原始技术 Proposal、`sdkDispatches`、技术 Turn Budget、未知 Provider 副作用标记及 `evidenceHash`。硬门禁 `trust=A_TECHNICAL_ONLY_C_PHYSICAL_OBSERVER_REQUIRED`、`canSealCReviewRun=false`。哈希是自一致校验，**不是签名或独立物理证明**。
4. `V3ABackgroundTechnicalCoordinator`：C/Main 注入 `A22BackgroundTrustPort`，包含 `assertCurrent(call):RunEvidenceIdentity`、`driverForCase(caseId)` 和**逐 Case OS CAS** `storeForCase(caseId)`。方法 `run({requestId,call,sequence})` 支持不同 Case 并发/同 Case 单活、冻结 Grant/sender/Run/模式和请求去重；`inspect(caseId)` 的跨 PID `running/stopping` 显示为 `recovery-required`、**不自动恢复**；`stop(caseId,requestId)`、`stopSession(sessionId)` 主动 Abort，但 **不谎称 Provider 一定停下**。底层存储必须 `compareAndWrite`；无跨 PID CAS 的注入拒绝。

### C 侧最低接线约束

- C 保持唯一 `C2MainTrustedExecutionAssembly`、`C2MainPhysicalHostReceiptRegistry`、`createC2MainTrustedRunPort`、`review-v3-technical-ledger`、`review-v3-run-writer` 权威。本包仅能作为当前 Main 内侧技术输入；C 必须独立观察并核验实体原件、`read/check/terminal` 物理 Host 回执和对应冻结运行身份，才能调用 Case CAS writer。
- `C2MainPhysicalHostSource.getObservedPhysicalReceipt(receiptId)` 与 `getCurrentOwner(run)` 必须由 C 独立可信 Main observer 实现。A 的 `sdkDispatches.technicalReceiptId`、`AExecutionProposal.hostReceiptId`、`evidenceHash` **任何一个都不能**直接注册成 `C2MainHostWitness` / `V3VerifiedHostReceipt` / C durable Run ACK。
- C 需要明确 Main-only 的窗口 `Principal/frame/authorityEpoch`、真实 Owner 授权与 SDK factory 绑定、B 当前发布的 Source/Plan 与原件物理再核验、操作员/学校 issuer 以及 IPC/Preload 背景任务读/停端口。A 不写这些文件。C 的现有 C-TX Case 事务/Run-wide Host tombstone 不得被 A shadow-spool 覆盖。
- 生产旧 `.write-lock` 没有可认证原 PID 出处；冷启动只报告 `RECOVERY_REQUIRED`，没有自动 unlink/接管或重新派发未知远端副作用。

## C. 固定 SHA Gate O 与局限

- **`511cd61071943f7035f37f44342ebda269825fa0` 同 SHA 3/3 SUCCESS**：[PR CI 39374723943](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39374723943) job `118470273740`，frozen deps/TypeScript/packages/skin/Main+Preload+Renderer build/full Bun **4194 PASS/5 OS SKIP/0 FAIL**；[D2 39374723949](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39374723949)、[Review Baseline 39374723942](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39374723942) 成功。
- R22 新的四组集中测试：R22-A/C-01 跨 Case 完成 + request 重放拒绝 + Dispatch 来源，R22-A/C-02 Abort/迟到 SDK 不复活，R22-B-01 A2 真实 Host**技术回调夹具**的 read/check/terminal 封签而非 C receipt，R22-C-03 真实独立 Bun OS PID 冷读正在运行的 spool、不可偷接管，均见原始 PR CI PASS。历史 R20 真 Pi SDK + SSE/EOF/SIGKILL + 跨 PID 恢复两用例仍 PASS。本批多 Turn 物理 SDK 引擎入口可运行，但新多 Case 测试注入可控 SDK 端口；没有真实 Electron Main 安装/远程 Provider 或完整 V3 Gate E。
- 首败/修复可追溯：初始 A `a175b3fe01dd4c3ec0478ed5ddd6c986800a0f85` PR `39374039497`、D2 `39374039472` 是 R22 新源码 TS18048/TS2339；`10e32c1a...` PR `39374254416` 仍有严格 Run/Plan narrowing；`c8a3ee9a...` 与 `dedacc323...` 中间 CI 被较新 SHA supersede 取消。最终只凭本 SHA 全新三 CI 判定绿色。
- **Gate O=A-only PASS_EXACT_SHA_SCOPED；Gate E NOT_RUN；School L BLOCKED_NO_AUTH；Product P NOT_RUN；Release NO_GO。**

## D. 向 Dev-C 的独立正式授权请求

请求号：`CR-A-R22-HOST-RUN-TECHNICAL-SOURCE-R01`，目标为上列 6 个精确 Git blobs 及固定 SHA，供 C **审查后选定** C-owned Main 实体接线依赖 / I **独立隔离技术来源重放**。请求限定为现有技术 API 和已验证的技术反例，不请求 A/I 写 C 生产文件、调用真实 Publisher/BusinessWriter、授权自动 Owner 锁清理，亦不声称已有 C 物理 Host proof。C 可分别签 `APPROVED_SCOPED_SOURCE_ONLY`、`REQUEST_CHANGES` 或 `DEFERRED`；没有精确 CR 则 I 不得重放。
