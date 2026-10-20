# Dev-A R23–R24｜技术物理 Host 观察、限额后台批量与 C R10 依赖锁

> **A-only technical handoff** / 2026-10-20. 本文仅给 Dev-C 独立 ABI/文件来源决策；不是新共享 DTO、学校授权或 C Main/Run writer 许可。全量 A R19–R24 分支不可直接合并。

## 1. 固定版本和生产增量

- A #143 工程最终 SHA：`880becfa28cba99cc027af1f1a81be26e2ce2db9`。R22/C 已接受的稳定回滚：`511cd61071943f7035f37f44342ebda269825fa0`；compare **ahead=2/behind=0，3 个 A-only 新文件**，无任何 C Main/IPC/Preload/Case/Plan/Run/Host registry/SchoolPort/shared 改动。
- C R10 已签技术父 SHA：`2cb8331b8fdff43da70a894ec597820595cb4d2d`；旧 R22 六份精确 blob **仅 C 自己**有权在新隔离 C R11 选择性引入；A R23 新三文件和下列缺失上游**不包含**在旧 CR 中。
- 代码目录统一前缀：`apps/electron/src/main/lib/review/`。

| A R23/24 新文件 | exact Git blob | 业务边界 |
|---|---|---|
| `review-v3-a23-physical-host-observer.ts` | `5813dcc8728859c31f46dc4e39020a806d219d68` | A23ObservedHostTechnicalAdapter：Main 内 AVerifiedExecutionHost 适配，separate executor/observer 回调、Run/Grant/epoch/dispatch 对照、await 撤权、重复/未知拒绝 |
| `review-v3-a24-bounded-technical-batch.ts` | `8b205f92713387281c640047da49839b3c6d7349` | A24BoundedTechnicalBatchScheduler：hidden/batch 多 Case 同步冻结队列，最大 16 并发、128 Case 配额（构造参数），停止/队列不重放 |
| `review-v3-r23-r24-concentrated.test.ts` | `21131f163a24fbc16e052e661f5dad6e8bba4830` | R23 3 场景 Host 双端口/撤权/重复；R24 3 场景并发上限/停止/非法模式 |

## 2. 真实执行 API（A-owned）

**A23**：`A23ObservedHostTechnicalAdapter` 直接实现 A2 所需的 `AVerifiedExecutionHost`，绑定一份当前 Owner/Run/Grant/Principal，在 `read(source)`、`check(planBinding)`、`terminal(status)` 调用上提供 Main 中由两**独立注入**端口组成的物理执行 `A23PhysicalExecutor.execute(operation)` 和技术观察 `A23TechnicalPhysicalObserver.observe(operationId)`。技术证据冻结 `operationId/run/grant/session/ownerEpoch/dispatchId/真实 read/check/status/technicalReceiptId`；检查响应与观察值精确对应，输出 `A23TechnicalHostSnapshot`，显式 `cHostReceiptVerified=false`。物理请求在 await 中被撤权、调用者关闭、重复 receipt、观察缺失、来源不符或失败即永久 `needsRecovery()`，后续拒绝重发。**两端口并非可信 C 独立物理观察者**，仅 A 技术来源，可供 C 自行对照。

**A24**：`A24BoundedTechnicalBatchScheduler.runBatch([{caseId,request}], signal?)` 是额定并发 Main-local 技术队列，运行时委托已有 A22 `V3ABackgroundTechnicalCoordinator.run`，因此已开始的 Case 仍有 per-Case OS CAS、Owner/Grant/Turn/Dispatch 的真实保护。只接受 `hidden|batch`，精确检查 batch 内 Case/Request 唯一性；默认并发 4，最大可配 16，默认一次 32，最大 128；stop 取消未启动物理请求，对可能已完成的迟到操作只报 `recovery-required`。**队列内尚未开始的请求未落盘，不可冷 PID 自动续队**；活跃任务由 A22 保守恢复。该模块不是 DAG scheduler、C Batch业务 finalizer 或学校流程。

## 3. C R10 精确缺失的上游 A 来源清单（独立读到 Git blobs）

下列 8 文件均在固定 A R22 SHA `511cd610...` 下读取并取其 Git blob，在 C 固定 R10 `2cb8331...` 同路径实测 **MISSING**，不存在自动继承。前七条是已知的 A22 SDK/Owner/A2/A3/A4 技术闭包依赖；第八条是实际 Pi HTTP Provider 接线所需引擎。每一条需 C 再核 ABI/直接与间接依赖，并由 C 另签新的精确来源 CR，绝不能凭旧 R22 六文件许可移植。

| C R10 缺失 A 文件 | 固定 A Git blob | 用途 |
|---|---|---|
| `review-pi-owner-adapter.ts` | `cb80e050c7c8256d002f2c1315b3f3c388d47427` | A Owner/Grant/ProcessEpoch 与授权门禁 |
| `review-execution-event-adapter.ts` | `be2ad9195991ecfef3068f80295d74fdc0bf629f` | V3ReviewToolCall、A 旧 C0 提案技术事件 |
| `review-execution-event-adapter-completeness.ts` | `0e15f14d2d1bc145acec8325d43e9e6276ead802` | A2 Source/Check 完整度判别 |
| `review-v3-execution-proposal-producer.ts` | `c4eb67ff185ecd889864431a898bee77c352fc84` | A2 原始 Read/Check/Terminal 技术 Proposal，非 C 物理回执 |
| `review-v3-execution-turn-budget.ts` | `34d52ebb9716fd964aa3e9a82e7f3f5671d2e221` | A3 真实完成 turn 的持久 24 次预算 |
| `review-v3-main-sdk-turn-bridge.ts` | `7937bd0b995ebdb5730399a761e58e2a329c52fe` | Main-only 单 Turn SDK→Dispatch/Turn/Proposal 协调 |
| `review-v3-sdk-physical-turn-port.ts` | `49b8d9270570a76f58f04d90c3bdc77ce6230a9b` | A4 native Provider 单请求可信技术结果边界 |
| `review-v3-pi-http-provider-engine.ts` | `029419de63dd1974c262f59dc80fc8d9b559004d` | A4 真 Pi 0.86.1 网络传输/SSE 技术证据引擎；实际 SDK 接线时需要 |

已核对 `review-storage-id.ts@1c668c515f7982ae47699ea133799ddf38fa8b6b` 在 A/C 两侧字节一致，无须再次添加。注意以上为**选定的已验证直接/关键运行链**，不是声明全仓和 SDK 第三方依赖完全闭合；尤其 C shared DTO/Host 校验语义可能不同，必须由 C 独立验证后确认。

## 4. 完整工程证据和首败

- 最终 A-only SHA `880becfa28cba99cc027af1f1a81be26e2ce2db9` 同源三个 GitHub workflow **SUCCESS**：PR CI [39383781568](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39383781568)，job `118498694463`，TypeScript、包边界、皮肤规范、Electron Main/Preload/Renderer build、full Bun **4200 PASS / 5 OS SKIP / 0 FAIL**；D2 [39383781440](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39383781440)，Baseline [39383781603](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39383781603) 全成功。
- 本轮 R23 三个 Host 技术来源测例与 R24 三个 bounded scheduling/stop/early-denial 测例 PASS，旧 R22 冷真实 PID、R20 真实 Pi SDK/SIGKILL pre/post-CAS 测试保留 PASS。R23 新测使用受控实际 executor/observer 端口，**不等于生产 Electron Main 的独立 C Host 观察者**，R24 限额调度测使用受控协调器（不替代真实远程 Provider）。
- 初次候选 `63fb8988e0c07610ba485f7350c5870021134b53` PR CI `39383533208` / D2 `39383533251` 因新观察器类型收窄 TS2345/TS2322/TS2339 失败；Baseline `39383533211` 成功。精确代码修复后才有上列最终完整绿色 Gate O。R22 前一绿色 `511cd610...` 保留回滚。

**Gate O=A-only PASS_EXACT_SHA_SCOPED；Gate E NOT_RUN；School L BLOCKED_NO_AUTH；Product P NOT_RUN；Release NO_GO。**

## 5. C 下一步必须决策的可信端口

1. 如何以 C独立 Main Principal/Owner/Grant/Case current 和 publisher/source 原件 rehash，**另行产生独立物理** `C2MainPhysicalHostSource.getObservedPhysicalReceipt` 与 `getCurrentOwner`，并由 C 的 `C2MainTrustedExecutionAssembly` / `createC2MainTrustedRunPort` / `review-v3-technical-ledger` / `review-v3-run-writer` 在 Case CAS 核验；**不得直接转换** A23 `technicalReceiptId` 成 C 物理 Host receipt。
2. C 是否授权仅自己在独立 C R11/R12 分支选择性引入上述 A R23 三份新文件和缺失八份上游源，必要时可分别回复 APPROVED_SCOPED / REQUEST_CHANGES；I 仅只读，**不得**因此取得 A23 或旧 A19/A20/A21 自动重放许可。
3. C 主进程实际背景 review window 关闭、同 Case current Grant 轮换及 native Provider 事件观察必须由 C 注册；A 的 `.write-lock` 仍禁止根据 PID/mtime/虚拟操作员证据自动删除。UNKNOWN Provider 继续 fail closed。
