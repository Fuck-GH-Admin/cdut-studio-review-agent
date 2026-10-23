# CDUT Studio Review V3｜Dev-A 专属交接增量：I4 已签来源与 A 当前 R19-08（2026-10-20）

> **A_ONLY_CROSSLINE_HANDOFF_DELTA / FOR_NEXT_DEV_A_ONLY / NOT_ABCI_SHARED_POLICY / I_AUTHORED_FACT_CHECK**
>
> **仅供新任 Dev-A 交接时阅读。Dev-B、Dev-C、Integrator-I 其他会话不需要阅读、ACK 或据此改变职责。** 本补充由 Integrator-I 会话在用户要求准备“Dev-A 专属交接”时整理，用来核对最新 A/I/C 的实际差异；**不是 I 的任务改派，不是 A 自己已执行的新工作，不是任何新的授权或共同协议**。首要 A 交接仍是同目录的两份 R02 A-only 文件；跨线权威仍只有 #145 唯一统一协议的 `DECISIONS:C`、`STATUS:A/B/C/I`。

## 1. A 线真实最新状态（重新核验 GitHub，不要拿 I SHA 当 A HEAD）

- Dev-A 工程 [Draft #143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)，分支 `feat/v3-dev-a-pi-execution-r01`，最新远端 `HEAD=341c01144a5960b47f915461ee9d5e26a570ae20`，**Draft/unmerged**。
- 已核 #143 与上次绿色 R19-06 `87cf182f4cfc970d39670658e89f038924989042` 的差异：**ahead 1/behind 0，只更改 A-owned** `review-v3-native-pi-crosspid-r19.worker.ts` 和新增 `review-v3-native-pi-sigkill-settlement-r19.test.ts`；不是 Main/Preload/shared/C Case/Run 生产代码更改。
- A R19-07 精确本 SHA 3/3 workflows completed/success：PR CI [39337965334](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39337965334)（full Bun **4177 PASS / 5 OS SKIP / 0 FAIL**、冻结依赖/TS/包边界/skin/Electron Main+Preload+Renderer build）；D2 [39337965399](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39337965399)；Baseline [39337965345](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39337965345)。正式 A 原证据 [#143 评论 6279190590](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143#issuecomment-6279190590)；R19-07A/B 包含真 SIGKILL 于 **Turn=1 已落盘之后** Dispatch settled CAS 前/后，孤儿 Owner write-lock 只能 fail-closed，并在测试证实已 reaped 子进程后模拟人工清理，**没有生产自动解锁**。
- **R19-08 仍 NOT_STARTED**：A 自己已定下从以上绿色 HEAD 继续真 Pi 0.86.1/离线 Responses SSE，针对 **Turn Journal CAS 的真实 precommit/postcommit SIGKILL** 补两个独立 PID 负例和冷恢复证据。与 R19-07 的 Dispatch settlement 窗口不同，不能把旧覆盖算成完成。
- A 后续 R20 是 operator-verified lock reconciliation、owner epoch/CAS 的隔离原型与负例；任何正式 Main/授权或业务 writer 接线仍需 C 新精确 CR。

## 2. I 线集成的精确签收差异（只供 A 了解来源状态）

- I3 Stage3 #152 C-signed `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`；I4 A18 #153 C-signed `ec880cd6b5bc6779095fcbdddb143b1034d751c5`；I4 B18 #154 C-signed `a74d513f3c990fe4b87401380a2eade8677b2163`，已建只读性质的 frozen refs。**这是 I 技术 Gate O 的 C 精确签收，不是 A 生产 Main/Provider 准入。**
- 最新 I4 A19 [Draft #155](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/155) 精确 `d9ba4ba54293963f8d962182548a627d52b566a3`，固定上一个 C 已签 I B18 作为父；新 PR CI [39339440133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39339440133) full Bun **4344 PASS/5 OS SKIP/0 FAIL**，D2 `39339440065`、Baseline `39339440086` 3/3 success。**刚核实 #145 DECISIONS:C 已有 `C-I4-A19-R01-FINAL-ENG-ACCEPT / YES_EXACT_SHA_SCOPED`，仅签这一固定 SHA。**
- #155 引入的 A 来源不是现在 #143 的 R19-07 新 worker。它只从早期 **R19-04** 固定 `58aed24f05645159cdc06afd8448244e7fe9710a` 机械引用 C 已批的 4 Git blobs（`review-v3-native-pi-crosspid-r19.worker.ts@ffbb803a7e93e47488bcb7e97f0537258ff76f04`、`review-v3-native-pi-crosspid-r19.test.ts@7855139e7bdf367f8ed023483c8905a59903ca27`、`review-v3-native-pi-revoke-r19.test.ts@27f9d589b37f7560bc1945b5ba2a303f746436e3`、`review-v3-sdk-diskfault-r19.test.ts@094698f65a93b47a5fa5cba5080132ea5e733547`）；另 2 I-only 证据文档，零 A/B/C 已有生产路径改动。
- **A R19-05/06/07 的后续 test/worker blob 和未来 R19-08/R20 不在 #155 既有来源批准内**；如果未来 I 要吸收，须新 C 逐文件 CR/source hash/依赖及新联合 Gate O/独立 C 签收，A 不必为 I 同步而改变自己的 R19-08 优先级。
- I 负责跨线固定来源/隔离技术集成和联合负例，不负责 A Owner SDK 生产技术实现。C 拥有共享 DTO、可信 Main/IPC/Preload、C2 physical Host observer、Case/Plan/Run/SchoolPort/业务写入等唯一裁决权。I Main lease `CONDITIONAL_NOT_ACTIVE`，Business writer `DENIED`；A 亦无从这些技术签收获得 C writer 权限。Gate E `NOT_RUN`、L `BLOCKED_NO_AUTH`、P `NOT_RUN`、Release `NO_GO`。

## 3. 必读正式 A-only 交接（这是补充，不是替代）

1. [A-ONLY-SESSION-HANDOFF-20261020-R02.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/docs/v3-integrator-i-r01-taskbook/docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/A-ONLY-SESSION-HANDOFF-20261020-R02.md)：A1–A4 长期职责、R14–R19-07 逐批 SHA、R19-07 真实进程/锁语义、R19-08/R20 风险、回滚和 Gate，**只供 A 阅读**。
2. [A-ONLY-NEXT-DEV-A-EXECUTION-20261020-R02.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/docs/v3-integrator-i-r01-taskbook/docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/A-ONLY-NEXT-DEV-A-EXECUTION-20261020-R02.md)：下一任 A 的 R19-08 **真正编码实施和验收标准**、预/后提交 SIGKILL、Owner orphan lock 明确隔离和新 PID、禁止污染旧安全测试。
3. [唯一四线协议 #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) 与 [C 裁决 #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)：交接新会话必须从**当前 HEAD**重新核对 `DECISIONS:C`、`STATUS:A` 与已签 SHAs；**A 只允许修改统一文档 `STATUS:A` 标记区**。

## 4. Dev-A 新会话的执行原则

- 不重新做 R19-01～07；首先核验 #143 的远端 HEAD/原始同 SHA CI 并阅读真实 A1–A4 模块，从已绿 R19-07 开始 **直接真实研发 R19-08**，提交 A-owned code+test 给 Draft #143。
- 对真正预算 Turn CAS 的 pre/post kill 注入保证物理测试 PID、SSE 正常消费、Turn 持久物和 Owner/dispatch journals 均有可检查证据；残留 `.write-lock` 必须先 fail-closed，绝不能因年龄/PID 猜测自行删除，模拟 operator 清理只能在私人测试目录先证实旧进程 SIGKILL 已回收。
- 每次新精确完整 SHA 必须重新运行 PR CI + D2 + Baseline（frozen deps、TS、边界/skin、三端 Electron build、full Bun），原始 R19-08A/B 日志可查且全部通过才能写 PASS；失败保留原 SHA/job/根因并在 A-owned 修复，不能删负例弱化质量。
- 工程代码/测试只写 A 工程分支 #143，交接文档在本目录，协调文档只编辑 `STATUS:A`。不能因为本 I-authored 补充就在 A 分支修改 I/C/B 专属资产。C 门禁/生产 Provider 和 Gate E/L/P 未批继续明确 BLOCKED/NOT_RUN/NO_GO。

> **本补充的有效性截至编写时的远端核验。Dev-A 的首要职责仍由原 A-only R02 两份文件和 C 最新裁决定义；本文件不要求其他会话阅读。**
