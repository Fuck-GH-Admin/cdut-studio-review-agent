# CDUT Studio Review V3｜Integrator-I 会话专属工程交接 R01（2026-10-20）

> **I-ONLY / DEV-I SESSION HANDOFF / OTHER LINES DO NOT NEED TO READ**
>
> **这是一份仅供下一 Dev-I / Integrator-I 会话恢复工作现场的专属上下文快照，不是新的 ABCI 共同规则，也不是 C 的正式业务裁决。Dev-A、Dev-B、Dev-C 没有必要阅读或维护。**  
> 全体四线共同规则、授权及状态的唯一权威仍为 [#145 ABCI-UNIFIED-COORDINATION-AND-STATUS.md](../v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)，其中 **DECISIONS:C 只有 Dev-C 有权签署**，各自进度只修改各自 STATUS 区。出现冲突时以 #145 最新 C 裁决、准确 SHA 和实际 CI/源码为准。
>
> **快照日期**：2026-10-20。此文仅为当前 I 会话的可交接事实与待办，后续时间变化必须重核，不可把旧快照视为新权限或最新 HEAD。

## 0. 当前结论（下一会话先看）

**最新已获 Dev-C 正式精确工程签收的 I 主干检查点是 Stage 2 R01，Draft PR #151、SHA：**

`687ed356de3aee59075b85bf09a978eedab12a02`

- **Stage 3 I-only 候选已实际开发并完成全量 Gate O，但 C 的新 CR 与正式工程签收还没有在此次快照中出现**。Draft PR [#152](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152) exact `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`，PR CI `39317723780`、Baseline `39317723768`、D2 `39317723879` 全部成功；原始 Bun **4,307 PASS / 5 OS SKIP / 0 FAIL**，新 I 5/5 测试通过。不能写成「C 已签 Stage 3」。
- 用户已明确：**本次只做 I 会话交接；C 对 #152 的后续裁决将在新会话由用户提供。不要在交接期间擅自推动 Stage 3 源升级、改已签分支或代 C 裁决。**
- 下一会话首件事：读取用户送来的 C 裁决以及 #145 **最新** `DECISIONS:C`，逐字核对批准/拒绝、限定文件与固定 SHA。若尚无裁决，保持候选并仅继续不需授权的准备工作。

## 1. 身份、四线职责与工程边界

- 仓库：<https://github.com/Fuck-GH-Admin/cdut-studio-review-agent>。四线协调 Draft PR [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，文档分支 `docs/v3-integrator-i-r01-taskbook`。
- **Dev-A** 拥有 Pi SDK/Owner/Host、技术执行、Provider HTTP/SSE/native witness、会话及失败恢复相关 A-owned 源码、测试；不得越界改 C Main 或业务事务。当前 #143 Draft 的浮动 HEAD 在本次核验为 `d1422ab1d4ace46c033117e2fe3c4c7c95114bb7`，**不是批准来源**。
- **Dev-B** 拥有 50 套模板义务保全、B1 作者/规则编译、B2 原件 staging/解析/ZIP、B3 路由、B4 来源只读证据、候选第 51 套作者工具；候选非学校正式发布。#142 当前浮动 HEAD 在本次核验为 `263b7f36034cacd4d51a00edd5f39266c37037fa`，**不是批准来源**。
- **Dev-C** 对共享 schema、Case/Plan/Run 原生事务、可信 Main Actor/Owner/来源入口、正式 ACK/CAS/Receipt、IPC/Preload、业务与学校安全、最终工程签收及所有高风险权限具有**最终决策权**。#144 当前浮动 HEAD 核验为 `331519d3833e254c7d54c18605b50f3252582517`；它自身 CI 通过不意味着 I 允许升级来源。
- **Integrator-I（本会话和下个会话）**：专门负责跨 A/B/C 技术源码选择、逐路径 Git blob 精确重放、I-owned adapter / test bridge、Owner/Plan/Source/Host 合同负例与回归、跨线来源证据、隔离检查点与新组合 Gate O。**I 不是第二个 C，不指挥 A/B/C、不代签 C、不为了打通接口而偷改 Owner 源。**
- 明确权限：`I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`；`I-LEASE-BUSINESS-WRITER=DENIED`。I 不编辑 C-owned `packages/shared/**`、`review-ipc.ts`、Preload、`case-store-v2.ts`、`plan-binding-v3.ts`、C Main Host factory/registry/Plan trust port、Run writer、Case/SchoolPort/Decision/Outbox 正式业务源码或 C 测试；**唯一历史特许**为已签 I1/I2/I3 原样重放的 `review-c0-ipc.test.ts` **原字节前缀不变 +167/-0**，不是继续编辑许可。
- E `NOT_RUN`（正式 Electron 实机联合验收）、L `BLOCKED_NO_AUTH`（学校）、P `NOT_RUN`（产品与非开发者）、Release `NO_GO`；GitHub Bun/Test PASS 不代表学校/生产验收、真实 Provider 或用户可用。严禁将 A Provider `x-request-id`、SSE 终态、mock/Proposal/Renderer DTO 冒充 C `V3VerifiedHostReceipt` 的独立 PHYSICAL Read/Check/terminal 回执。

## 2. I 历史 Draft/工程检查点总账（完整 SHA）

| PR | 工程用途 / 冻结锚点 | HEAD / 状态 | 真实验收 / 关键限制 |
| --- | --- | --- | --- |
| [#146](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/146) | I0 前置调查与协调 | 已有 C `C-I0-ACCEPT-001` scoped | 审计，不代表工程发布 |
| [#147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147) | I1，C `31aa352c45a33d6832612884b0fea38e39b5cf8d` | `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7` / Draft | 24 变动路径，I 联合 19/19，Bun 4073/5/0；历史基线，不改 |
| [#148](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/148) | I2，C `3242b22a0825eec347b2748680bb746eb0f55215` | `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57` / Draft | C `C-I2-FINAL-ENG-ACCEPT-R01` 已签；34 路径，I 联合 23/23，Bun 4191/5/0 |
| [#149](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/149) | 独立 I2 R04 B2 staged 原件→A Host→C pure validator fence | `fc663a9c3b9beff8b48020d1b818089b6c4b3f1d` / Draft | Bun 4194/5/0，3/3 I cases；**不在 I3 来源中，未核得该 SHA 的 C 单独正式签收，禁止自动迁入** |
| [#150](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/150) | I3 Stage 1，冻结 C R03 `e87f75e044becc35c28292cc835a2c2ec41df48a` | `36dd1c37bc18d7614d8d4835b5213d5cb6459792` / Draft | C `C-I3-FINAL-ENG-ACCEPT-R01` 已签；I2 34/34 exact blobs，Bun **4211/5/0** |
| [#151](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/151) | I3 Stage 2 R01，从 #150 签收 SHA 冻结，选 A R14 | `687ed356de3aee59075b85bf09a978eedab12a02` / Draft | **最新 C 已签主干**：C `C-I3-STAGE2-R01-FINAL-ENG-ACCEPT`；A 8/8 exact blobs，Bun **4302/5/0**，I 新 4/4 |
| [#152](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152) | Stage 3 **I-only candidate**，从 #151 C-accepted SHA 冻结 | `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b` / Draft | **Candidate Gate O PASS / C 新 CR & 签收 PENDING**：Bun **4307/5/0**，I 新 5/5；仅 1 I 测试 + 2 I 证据文件 |

**截至快照 #147–#152 全部是 OPEN DRAFT，未合并**。除非新会话查明变更，不得声称它们已合入 main、正式上线或签收范围扩大。

## 3. 最重要的不可变分支、来源锁与日志

### I3 Stage 1 (#150)

- C 冻结 ref `integration/v3-i3-c-anchor-003-frozen` → `e87f75e044becc35c28292cc835a2c2ec41df48a`。
- I2 C-accepted source `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57` → I3 原样 **34/34 source blob**，另增两份 I3 文档；共 36 改动路径，0 C 专有生产 hunk。
- C0 唯一被允许重放的测试原 blob `7c4d73b209e926369747ae50f5ce4a5601e3effa`，追加之后 blob `8633f3f5d636a813da0bf7b12264e384705063fd`，旧原件字节是完整前缀，+167/-0。
- I3 source-only replay checkpoint `d05d39fb6924d5786e3d68486bd9ae16679ea572`；最终 #150 `36dd1c37bc18d7614d8d4835b5213d5cb6459792`。来源证据 `docs/design/review-agent/acceptance/v3-integrator-i3-r01/I3-SOURCE-AND-CHECKPOINT-LOCK.json`。
- Gate O：PR CI [39306748828](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39306748828)（4211/5/0）、Baseline 39306749049、D2 39306748965 SUCCESS。C 签 `C-I3-FINAL-ENG-ACCEPT-R01`；相关 [决议 482cae8](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/482cae8bcab3efc6d6ca559a1823094b13ba8dca)。

### I3 Stage 2 (#151)：最新已签工程主干

- ref `integration/v3-i3-stage1-accepted-frozen` → #150 签收 SHA `36dd1c37bc18d7614d8d4835b5213d5cb6459792`。
- Dev-A 唯一授权 R14 来源 `56f450f3c783299ceb0a6489bf855a1ba8f0a913`；**不能漂移到 A R15/R16/R17 或当前 #143 HEAD**。
- source-only 8 个 Git blob 导入 checkpoint `abfd6a26b8b8795617c9be6aa559208dcd4887d1`，路径：`review-v3-pi-http-provider-engine.ts` / `.test.ts`、`review-v3-sdk-physical-turn-port.ts` / `.test.ts`、`review-v3-main-sdk-turn-bridge.ts` / `.test.ts`、`review-v3-sdk-dispatch-fence.ts`、`review-v3-sdk-dispatch-crashpid.test.ts`；均位于 `apps/electron/src/main/lib/review/`。8/8 原 A blob 与实际 #151 Git tree 相同，0 原 A R12 文件替换。
- I 新 4 用例 checkpoint `e175ae04997fae67d9770e267a1bd81d6ceb439a`：C inert Pi session 结构上可满足 A 的 factory shape 但无合法 Case/Plan/Owner 不得启动；A Provider 请求/Turn ID 不能注册为 C 物理 Host Read/Check/terminal；冷注册表/Owner 撤权/Grant 换代保守拒绝。
- 最终 #151 `687ed356de3aee59075b85bf09a978eedab12a02`，源锁 `docs/design/review-agent/acceptance/v3-integrator-i3-stage2-r01/I3-STAGE2-SOURCE-LOCK.json`，验收 `I3-STAGE2-REPLAY-AND-GATES.md`。11 新路径（8 A 原 blob + 1 I test + 2 I docs），0 C-exclusive 改动。
- Gate O：PR CI [39314119021](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39314119021) job 118271031880 full Bun **4302/5/0**；Baseline 39314119022；D2 39314119056 全 success。Dev-C 单独按 [决议 75f31782](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/75f31782d90469e91c8a6ea759ac5acef2ebe624) 签 `C-I3-STAGE2-R01-FINAL-ENG-ACCEPT / YES_EXACT_SHA_SCOPED`，对应 [#151 C 签收回复 6276178218](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/151#issuecomment-6276178218)。
- ref `integration/v3-i3-stage2-accepted-frozen` → `687ed356de3aee59075b85bf09a978eedab12a02`，**是新阶段候选的父锚点，不是 C 最新 HEAD**。

### Stage 3 I-only 候选 (#152)：当前最后工程产物

- branch `integration/v3-i3-stage3-i-only-physical-witness-candidate-r01`，base `integration/v3-i3-stage2-accepted-frozen` = #151 精确 SHA。
- 只新增三文件：
  1. `apps/electron/src/main/lib/review/review-v3-integration-i3-stage3-sdk-host-technical.test.ts`，源码 checkpoint `f5fde5b2b2fbd4da1d84b8ddcd4d130dc470b88d`，5 项真正执行的离线正反例；
  2. `docs/design/review-agent/acceptance/v3-integrator-i3-stage3-candidate-r01/I3-STAGE3-I-ONLY-SOURCE-LOCK.json`；
  3. 同目录 `I3-STAGE3-CR-AND-TEST-EVIDENCE.md`。
- 最终候选 HEAD `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`；**0 A/B/C 原源覆盖、0 C 原测试修改、0 shared/IPC/Preload 改动**。
- 测试调用已经在 #151 导入的 A R14 `V3APiHttpSingleRequestEngine`/物理 turn port；使用 in-memory HTTPS fetch response、SSE body 消费与 **Pi lifecycle shim（不是实际 AgentSession 或真实互联网 Provider）**；同 C R03 `C2MainPhysicalHostReceiptRegistry` 比对：一请求完成也不是 C Host、缺 terminal 拒绝、第二物理请求拒绝、Owner await 中撤销不能收 Host、响应后 abort 不能确认 A terminal/注册 C。
- 新组合 Gate O：PR CI [39317723780](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39317723780) job 118283445421 **4307 PASS/5 OS SKIP/0 FAIL**，Baseline [39317723768](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39317723768)，D2 [39317723879](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39317723879) **3/3 SUCCESS**。raw Bun 可见新 I 5/5、旧 I 23/23、I Stage2 4/4、C Pi+registry 13/13、A HTTP 35/35、physical 12/12、SDK bridge 39/39、crashPID 1/1。
- 本轮精确权限申请 [#144 评论 6276302601](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276302601)，新 SHA Gate O + 正式裁决申请 [#144 评论 6276490583](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276490583)，自身 [#152 验收评论 6276491378](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152#issuecomment-6276491378)。
- **状态**：`STAGE3_CANDIDATE_GATE_O=PASS_EXACT_SHA_SCOPED`，`I-CR-I3-R03-I-ONLY=PENDING_C_DECISION`，`C_ACCEPTED_FOR_ENGINEERING_I3_STAGE3=PENDING_C_SIGNATURE`。截至本次核验 #145 没有该 Stage3 专项 C 新签；**下一会话用户会提供其裁决**。

## 4. C 对 B-CR-002 的细分裁决及最新 C 进展——全部“知情，不自动集成”

用户提供 [正式补签/裁决提交 482cae8](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/482cae8bcab3efc6d6ca559a1823094b13ba8dca)：
- `B-CR-002-A`：**仅 C** 实现可信 Main 作者最新 revision/digest/read snapshot，Main 本地 Principal/session/Owner/frame/template + before/after await revalidation；不授权 I 加 IPC/Preload 端口、不自动合并 B 作者候选。
- `B-CR-002-B`：**仅 C** 实现旧/新 Plan 完整删除义务、Check×target×object×subject×sourceVersionIds、Main Principal/Owner、显式 removal ACK、expectedRevision、requestId/payloadHash、当前 issuer/source、真实单案 CAS/durable Receipt/旧历史保全。B UI 的本地二次确认不是业务 ACK。
- `B-CR-002-C`：B/I 只准 candidate-held B 作者技术准备；实际第 51 套作者 UI/保存/冻结的 Main/Preload/正式学校发布、非开发者 UAT 与 Gate P **另 CR、不得宣称已完成**；任何 B R14/R15 source 导入还须 C 逐文件 SHA 授权。

**C #144 现已在 C 自己的隔离生产工程分支进一步完成，但不是 I 已合入成果**：
- C BCR002-A 离线 AuthorRead 只读验收 `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d`、7/7，5/5 Actions 成功。
- C BCR002-B removal ACK/CAS/Receipt `461b5c9e7abc17a020c843f279118208196f5ef0`、6/6，5/5 Actions 成功。
- C `C-MAIN-WIRE-R01` Main+Preload/IPC 真实注册的 C-only 工程 HEAD `331519d3833e254c7d54c18605b50f3252582517`，PR CI 39321173561 full Bun **4132 PASS/5 SKIP/0 FAIL** + 4 条同 SHA workflows green，新增 8/8 Main handler 安全测试。**由于正式 B1 vault/publisher、A Owner/Host 实体来源未安装，真实 UI 的默认可信权限入口应保守拒绝；尚未经过桌面实机 Gate E**。不能将其纳入 #152 或宣传为产品 E PASS。
- C 所有这些较新的代码及 `C-Tx` 来源均**不是** I3 已签 C R03 `e87f75e...` 来源；后续集成须新冻锚点、逐文件 Git blob、C CR 和全新联合 Gate O。
- A #143、B #142 之后持续移动，**任何浮动 HEAD 的变更均不被过去 C 签名自动覆盖**。

## 5. 下一 Dev-I 的启动与执行顺序（裁决到达后）

1. **先复核** `#145 DECISIONS:C`、最新 `STATUS:I` 和 C 对上述 [Stage3 CR](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276490583) 的正式回应（用户下一会话会提供裁决）。不能仅根据评论情绪或 CI 结果猜签收。
2. **完整锁定** #151/C accepted、#152 candidate、各自 base exact SHA、PR diff 3 paths 与三条 #152 success workflows；C 新裁决所引精确 SHA、文件、函数和租约要比对现有 CR 原文。
3. 如果 C `APPROVED_SCOPED` 且**另行正式签 #152 exact engineering**，只记录实际签收，在独立新 ref 冻结 #152 SHA；不要改写 #152 已签 SHA。随后**先提交下一批独立 exact CR**，未批准不得升级 A/B/C 新源或正式接 Main。
4. 如果 C 仅允许候选测试/要求更改：只在允许 I-owned 文件实施可证明修复，新提交新 exact SHA，重新完整 Gate O 与 C 精确复审；不能将旧 4307/5/0 挪给新 SHA。
5. 如果 C `DEFERRED/REQUEST_CHANGES`，保存 #152 候选与报告原样，按 C 指定 evidence 再动作；可以在 I-only 范围做只读来源调查、拟写新的 B candidate-only exact CR，但不能自动导入 `#149`、B R14/R15、A R15/16/17 或 C R04/R05/MainWire。
6. 后续有批准的 Stage4/C anchor 升级时，须**独立工作分支**，从最近 **C-accepted 的精确 I SHA** 冻结父树；先做 Git compare / blob 来源差异清单及 hunk 许可，再导入，测试旧 I1/I2 23/23、C Main Pi/Host 13/13、A selected HTTP/SDK 和新增跨线正反例；PR CI frozen Bun/typecheck/boundaries/skin/Main+Preload+Renderer builds/full Bun + Baseline/D2（视适用触发 D1/Batch），依赖安全证明与前置 source manifests; 只有真实新 HEAD 绿才报 Gate O。
7. 始终保留 Draft、不 merge main、不删旧分支、不能以「节约时间」删安全负例或把技术自测冒充 Gate E/L/P。用户希望批次够大、有意义，同时质量不能降低；I 不应陷入无穷小文档迭代，但**越权集成不是提高效率**。
8. 将新增实际进度只更新 #145 `STATUS:I`，交接文件只给 Dev-I 自己用；对 C 的授权请求投 #144 评论并引用证据/精确 SHA，C 正式裁决由他自己写在 #145 `DECISIONS:C`。

## 6. 新会话恢复所需最少材料（按顺序）

1. **必读唯一共同协议**：[ABCI 统一协调文档](../v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)，重点全体规则、`DECISIONS:C`、最新 `STATUS:I`；这是唯一四线共同规范。
2. **此 I-ONLY 手交接**和同目录 `I-ONLY-NEXT-DEV-I-EXECUTION-20261020-R01.md`，非其他会话必读。
3. #151 签收 [C commit 75f31782](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/75f31782d90469e91c8a6ea759ac5acef2ebe624)、[#151 代码/锁](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/151)；
4. #152 [代码/3 路径/5 测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152)、[Stage3 CR](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276302601)、[精确 Gate O 请求](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276490583)；
5. 只有需要继续 I3 机械重放时再读 #150/I2 #148 的完整 source-lock，勿无理由重做已完成历史。
6. **不要求 A/B/C 阅读此专属手交接**；若需要跨线共享新的事实，应把压缩后的相关信息放到 #145 对应 I 区或在 C #144 发明确申请，而不是要求别的会话消化私人历史材料。

## 7. 交接校验警示

- #145 同一 STATUS 段保留历史「PENDING」条目以追溯首败和某轮当时状态；**按时间与精确 SHA 读取较后正式条目**，不能把旧 pending 当成新阶段最终结论。
- `#152` 是绿色工程 **候选**，还没获 C Stage3 正式接收；绝不可从这个候选直接主干化。
- `#149` 虽单独测试绿色，但与 #151/#152 不同源；不能随手 merge。
- Dev-C 已经在生产工程分支推进到 MainWire，也并不消除 I 的旧锚点/外部来源锁/真实 Electron 端到端 Gate E 缺口。
- 无联网真实 Provider、没有正式独立物理 Host 注册链、没有学校 policy issuer、没有不可伪造业务身份，就没有产品业务闭环的证据；不可把 fake response、test-only callbacks 或 C-only mock issuer 充作真实验收。
- 文档仅记录已检事实，**下一会话收到 C 的新裁决后，应以新精确裁决覆盖本快照的「待审批」部分**，不要修改用户没有要求改的 A/B/C 私有交接。
