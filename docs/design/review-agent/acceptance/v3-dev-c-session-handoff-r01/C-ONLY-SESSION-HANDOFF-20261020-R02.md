# CDUT Studio Review V3｜Dev-C 新会话专属工程交接（2026-10-20 R02）

> **C_ONLY_SESSION_HANDOFF / NOT_SHARED_ABCI_POLICY / NOT_A_OR_B_OR_I_TASKBOOK**  
> 阅读对象：**仅下一个 Dev-C 主开发/正式裁决会话**。Dev-A、Dev-B、Integrator-I **不需要阅读、同步或 ACK 本文**。本文只保存 Dev-C 的上下文、精确工程证据、已签/待签规则和下一开发顺序，不替代任何四线正式决议。  
> 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent  
> **这是 2026-10-19 `C-ONLY-SESSION-HANDOFF-20261019.md` 的更新后完整接手版**；旧文作为历史快照保留。**以新会话启动时的最新 GitHub PR、源码、同 SHA CI、以及 #145 正式 `DECISIONS:C` 为准**，不得把本文的 HEAD 当作不变事实。
>
> 严禁将本 C-only 文档送给其他三线当共同协议；若 C 要对 A/B/I 作实际授权、撤权或共享进度裁决，**只能更新统一协议的 C 专属区段**。

## 0｜接手目标和必读顺序

本会话是 **Dev-C 正式主开发与最终共享业务安全裁决权的连续接手**，不是又一个调研 Agent，也不是 Integrator-I。立刻先做：

1. 读取唯一四线共同协议及最新 C 裁决：PR [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，分支 `docs/v3-integrator-i-r01-taskbook`，文件 `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。绝不可覆盖 A/B/I 的状态或决议段。
2. 本份 **C-only** 交接与两份直接工程运行手册：  
   `.../v3-dev-c-session-handoff-r01/C2-R01-RUN-SEAL-AND-GATE-O-20261020.md`  
   `.../v3-dev-c-session-handoff-r01/C2-R02-MAIN-TRUSTED-HOST-SOURCE-PORT-20261020.md`
3. C 工程 [Draft #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)，分支 `feat/v3-dev-c-business-r01`，源码本身才是 C2-R02 当前事实来源；同时读取其 `docs/design/review-agent/acceptance/v3-dev-c1plus-r01/README.md`（此文件在工程分支，不在协调 docs-only 分支）。
4. C0 唯一冻结 [Draft #141](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/141) `5682057c7232c914e72fdae525ce95fd33f32b53` / `review-c0/1`。
5. I1 已签工程 [Draft #147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147)、I2 精确候选 [Draft #148](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/148)；A [#143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)，B [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)。特别阅读 I2 `I2-SOURCE-AND-CHECKPOINT-LOCK.json`、`I2-REPLAY-AND-GATE-O.md` 和 A `A4-R13-PI-NATIVE-SETTLED-AND-FAULT-QUARANTINE.md`。
6. 旧一轮考古 #133、1.5 #134、二轮 #135-138、定向 #139、统一架构 #140 **按具体冲突回溯**，不得再次展开无边界调查。

## 1｜身份、所有权与刚性约束

| Line | 生产工程所有权 | 绝不可越过的边界 |
| --- | --- | --- |
| Dev-A #143 | Pi SDK AgentSession Owner/session/generation/grant；独占 Host 事件 proposal/取消/重试/故障保护；物理 HTTPS/SSE Provider 证据 | **不能**写 Case/Plan/Run/Check/Decision/SchoolPort；本线技术 terminal/outbox 不能替代 C 正式 ACK；A 无权变更 C Main/Preload/shared |
| Dev-B #142 | 模板作者候选、50 套 G01–G08 template source、B2 parser/bytes/ZIP/InputLedger、B3 20s routing、B4 来源字节证据、作者 UI | 候选 `candidate-held`、`publicationAllowed=false` **不是**已发布校规/Gold/正式 InstallPlan；B 不能绕过 C 选定的材料/Plan/来源当前有效性事务 |
| Integrator-I #147/#148 | 源 SHA/路径/Git blob 分段重放；联合技术桥接、I-only 测试、精确 CI/回滚 | **不是 C、不能指挥 C**；业务 writer **DENIED**；Main 技术只读租约 **CONDITIONAL_NOT_ACTIVE**；只能保留已签 C-test 窄租约范围 |
| **Dev-C（你） #144** | 唯一受信 Main Principal、原生 Case/Plan/Material/Source、统一 Case 业务状态、ReviewRun、Check/人工判定、BatchAttempt、Decision、Outbox/SchoolPort、真实工作台/迁移；四线合同及最终业务安全签收 | 不得把 Renderer 传来的 Actor/teacher/owner/requestId 作为写权；不可混淆合成、技术状态、机构制度与真实回执；生产 CaseStore 一份主权 |

典型 **C 独占**：`packages/shared/**`、`apps/electron/src/main/lib/review/review-ipc.ts`、正式 Preload、`case-store-v2.ts`、`review-c0-authority.ts`、`plan-binding-v3.ts`、`review-v3-technical-ledger.ts`、`review-v3-run-writer.ts`、`review-v3-main-trust-port.ts`、`case-lifecycle-v3.ts`、正式 Batch/Outbox/Decision/SchoolPort；I 仅在特别批准的 C 测试文件末尾追加指定合成联合测试。

**质量策略**：不做质量缩水的“最小闭环”；做较完整工程批次，把必须本机 Electron/真实 Provider/学校身份的事项集中 Gate E/L/P 验收。各批不因队列阻塞就伪写 PASS。最重要的是推进 **真实产品链路**，不是无限研究或不断制造任务书。

## 2｜2026-10-20 交接前精确 Git + Gate O 快照

> 每行 SHA 是交接时观测，未来新会话须重新取 PR `head_sha`，并只承认与之相同 SHA 的 GitHub Actions 真实日志。GitHub 自托管 Runner 时而慢/排队；不可借父级绿色 CI。

| PR/身份 | 交接时 HEAD | 精确 Gate O 核验 | 当前范围 |
| --- | --- | --- | --- |
| #141 C0 frozen | `5682057c7232c914e72fdae525ce95fd33f32b53` | 5/5 PASS | `review-c0/1` 冻结唯一合同 |
| **#144 Dev-C** | **`34c7ea3bd881504302d2682aad79065c0ef9a24c`** | **5/5 PASS**：PR `39297266036`、Baseline `39297266053`、Batch `39297266045`、D1 `39297266299`、D2 `39297266109`；PR job `118212910829` **4081 pass / 5 OS skip / 0 fail**，typecheck/boundaries/skin/Main/Preload/Renderer build PASS | C1 持续 + C2-R02 Main可信端口离线可运行，**真实 A Host/B 发布验证仍未装配** |
| #143 Dev-A | `1f1f5d1499cb59c813d590aa407189ba05f65f10` | PR `39296623502`、D2 `39296623298`、Baseline `39296623275` **3/3 PASS** | A4-R13 SDK native settled/HTTP witness，**Gate E未跑**，不能升级 I2 已签 A-R12 |
| #142 Dev-B | `45809553d19b6fba731fd7edb813ebbb81071031` | PR `39294621431`、D2 `39294621479`、Baseline `39294621743` **3/3 PASS** | B 较新 standalone 工程；I2 仍锁 B 较旧 `bf88320e...` |
| #147 I1 | `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7` | PR `39277400876`、D2 `39277400995`、Baseline `39277400916` **3/3 PASS**；4073/5/0 | **C 已签 I1 工程 scoped 接收**，old C+A+B 冻结的技术预览 |
| **#148 I2** | **`89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`** | PR `39298594421` job `118217554563`、D2 `39298594426`、Baseline `39298594262` **3/3 PASS**；**4191 pass / 5 skip / 0 fail**；23/23 I联合技术用例 | I1→新 C R01→选中 A 9/B 8 的**有界技术合并**，C 裁决需读 #145 最新决议；**并非正式业务接收或I Main写权** |
| #145 协调 | `docs/v3-integrator-i-r01-taskbook` | docs-only CI 按每次更新另查 | **唯一** ABCI 协调与正式 C 决议。本文在同分支但不是共同政策 |

**特别注意 C SHA 的递进**：C1/C2-R00 的 `9a81b2c6...` 五 CI PASS（4061/5/0）；C2-R01 `3242b22a0825eec347b2748680bb746eb0f55215` 五 CI PASS，新增 `review-v3-run/1` 不可变 Run 封存；C2-R02 上述 `34c7ea3...` 五 CI PASS。**I2 的固定 C 底座是 C2-R01 `3242b22...`，不是当前 C2-R02 `34c7ea3...`，即使两者都各自绿色。** 不能说 I2 已测试 C2-R02。

## 3｜C 已有的真实工程，不准重复

### C0：唯一业务合同/可信 IPC

`review-c0/1`：Main sender/mainFrame 必须可信，Principal 在 Main 派生，Renderer actor 不能获得 teacher/school 系统权，使用 CAS+Receipt 的身份、requestId、revision、Scope；C0 frozen SHA 如上。变更 C0 必须显式版本化、CR/Owner 兼容性；不随 A/B/I 引入隐式 schema 变化。

### C1：原生案卷/人工作业（仍 PARTIAL）

- C 已有 native aggregate优先、V1 shadow 禁止回写 native、归档/恢复 CAS+Receipt、每个 archive 周期独立稳定的幂等 ID；旧 DELETE 对新 V3 案卷**软归档**，新 Main `RESTORE_CASE_V3` 有可信 frame/Actor、Preload/三栏 UI 已可用。**不要重复修旧交接中所谓“恒定 archive ID”**，现代码已修。
- 原生建案链路/兼容 V1 投影、material/CurrentSourceValidity/人工作业、NativeManualItemDialog/SourceRef+实体原件绑定已逐批开发；C1 不是“一切完成”，需实测真正 Native 建案、文件导入、列表发现、恢复、三栏在多来源文件上的统一行为。
- C1 原生来源：归档/换版后旧 Evidence/Observation/Read/Run 仅留审计、不自动复权；人写 Subject 不表示事实已 AI 核查，不得把缺失的制度验证推定为已批准。
- 所有工作仍建立在 `state.v2.json` 单案业务主权；legacy case.json、runs-v2 不能重新成为第二主权。

### C2-R00：版本化 Host **技术事件账**（已离线验证）

`packages/shared/src/types/review-v3-execution.ts` + `review-v3-execution-contract.ts` + `review-v3-technical-ledger.ts`：`review-v3-execution/1`，技术 `RunEvidenceIdentity`、精准 eventId/body SHA、physical Host read/check/terminal proposal，单案 CAS receipt 链和幂等、防终态继续；但仅技术候选账，不是真实 Provider receipt、评分、学校批复。

### C2-R01：不可变 Run 业务**证据快照**（已离线验证）

`packages/shared/src/types/review-v3-run.ts` 和 `CaseAggregateV2.v3ReviewRun?`；C `review-v3-run-writer.ts` `sealV3ReviewRun/getV3ReviewRunRecord`：在**同案 CAS+Receipt**中封存 Run、不可变 Plan/Source、Host Read/Check/technical terminal hash、绑定的检查分母和 `requires-human-review/incomplete/interrupted`，另有历史只读防篡改检查。没有自动业务 Decision/SchoolPort/Outbox、没有第二份 Run 数据库。一案目前仅一笔封存 Run；Attempt/Run 历史、续跑和 C-Tx 尚未完成。合成校验 callback 不能取代真实 Main Host registry。

### **C2-R02 最新**：Main可信消费端口 + 磁盘原件独立重读（已离线验证）

`apps/electron/src/main/lib/review/review-v3-main-trust-port.ts`、同名测试：
- `createC2MainTrustedRunPort` 建立**未注册正式 IPC 的、C Main 专属** `admit / record / seal` 端口。它**要求外部由真实 Main 注入**：
  1. `assertPublishedPlan(aggregate,run)`：Main 已批准发布来源的精确 Plan，不得传候选 Plan；
  2. `getCurrentOwner(run)`：A Owner grant/epoch/manifest 的当前可信登记；
  3. `getPhysicalHostReceipt(hostReceiptId)`：已注册的真正物理 Host 回执，必须与 Run/grant/event Kind 一致。
- `assertC2PhysicalOriginalBytes` 按当前 Case 安全相对 `assetPath` 从磁盘读取原件、重新计算实际 SHA256，拒绝路径逸出、错版/字节篡改/软链逃逸；不仅比较 DTO 哈希。
- 测试使用**真实临时磁盘字节文件 + 合成 Main/Host 信任适配器**：positive read→check→terminal→human review Run seal；negatives revoked Owner, rotated grant, host missing/cross-run, byte tamper, symlink escape, unpublished Plan。**真实 Pi Provider、B published Plan、跨进程 receipt registry、Electron Gate E 并未接线**。
- 首次新源码 SHA `10f000f49e...` TS 可空两处 FAIL；新修复版 `34c7ea3...` PR 完整 **4081/5/0 且五 CI PASS**；已由 C 在 #145 签 `C2-R02-GATE-O-R01`。**本会话内不能再拿 R02 当成仅“待测代码”。**

## 4｜I1/I2 正式裁决与关键来源血缘

- I0：C 已签 `I0_ACCEPTED_SCOPED`，不是 I1/I2 的业务放行。
- I1：C 已签 `C-I1-FINAL-ENG-ACCEPT-R01`，对旧冻结技术源的 I1 SHA `642c1fa3...` 生效，仅 **STAGED_ONLY technical Gate O**。
- I2：按 `C-I2-ANCHOR-002` 开独立新分支，C 底座 `3242b22a0825eec347b2748680bb746eb0f55215`，旧 I1 `642c1fa3...`，A 源池 `c0132ae06de8ae09ab021ac231ffd34756eb5990`，B 源池 `bf88320e57b20ebc2023f27665c544ce2ba72ce4`。
- **真实三阶段 I2 源重放**：
  1. R01 `5731c2244a4b3967f344773a767e393494080cdb`：旧 I1 **24/24 文件与源 Git blob 精确相等**（Dev-C 对 R01 的 24 路径逐个再次 fetch 核验），PR/D2/Baseline 3/3 success，4142/5/0，旧 I1 联合 19/19。
  2. R02 `c9548e1310b9fd14046e21318b72051ba3bb42ef`：按 A 固定新源导入 **9/9** 精确 Git blob，PR/D2/Baseline success，4181/5/0，增加 2 项 I2 A/C 技术测试。
  3. R03 **`89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`**：按 B 固定新源导入 **8/8** 精确 Git blob，PR/D2/Baseline success，4191/5/0，I1/I2 新旧联合 23/23。
- C 独立 compare 新 C R01→I2 R03 **34 变更路径**，C-exclusive **production 0 hunk**，唯有既签租约的 `review-c0-ipc.test.ts` 追加部分、保留原 C 完整字节前缀；未改 shared、正式 Main/Preload、Case/Plan/Run、Decision/Outbox/SchoolPort。
- **容易误读的实证**：最终 I2 HEAD 内旧 I1 的 **18 个来源 blob 有 11 个已被新 A/B 冻结 blob 取代**（直接在最终 HEAD 对照旧 I1 得 **7/18 相同**）；这不违反 I2 分段权限，因为先在 R01 完整 24/24 重放并通过 CI，再在 R02/R03 受控替换并各自 CI，通过新的 A 9/9、B 8/8 source/blob 定向核验。**绝不能写“旧 I1 原 blob 在最终 I2 仍 24/24 全都不变”**；正式签收的是分阶段血缘与最终行为测试。
- 当前 #148 Draft 不合并 main；I2 工程接收如 C 新签仅适用于上述精确 SHA 和选中的 A/B 技术切片，**不是**选中源池全部 A/B 26/72 路径，也**不是** R02 新 C main trusted port 集成；对后者须新锚点、新联合 CI。
- I 仅保留 `I-LEASE-C-TEST-R01` 原小范围测试追加；`I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`，`I-LEASE-BUSINESS-WRITER=DENIED`。哪怕 I2 scoped 工程签收完成，**不会自动转成业务主权或只读 IPC 写租约**。

## 5｜Dev-A 新 `CR-A-PI-HTTP-WITNESS-R01`（#144 评论 6273618639）

A #143 新 R13 `1f1f5d1499cb59c813d590aa407189ba05f65f10` 三 CI 全 PASS（Bun 4145/5/0，据 A 报告；须需要时查原始 job），建立 Pi 0.86.1 native `turn_start → turn_end → agent_end(willRetry:false) → agent_settled` 防二次派发/故障 quarantine；有 HTTPS/SSE `x-request-id` witness 研究及 A-only 合成门禁，**无生产 Electron + 真 Provider Gate E**。这是有价值的 A 能力，**不能静默更换 I2 已签 R12 A 锚点**。

由 C 负责决定的不是“技术可否用”，而是**何时允许在唯一 Main 业务边界创建 SDK Session、登记 Host physical receipt 并给 C2 durable ACK**。正式裁决应分为：
- **批准 C-owned 离线、inert 独立 Pi factory 的设计与代码准备**：在 C 专属新 Main adapter/test 文件中实现一次性 AgentSession 的强制 Owner/grant/host/abort/session settled/credential 来源约束。任何 C 使用 A/B 技术 slice 都需源 SHA/接口白名单。
- **正式生产 SDK/Provider/Run Host 接线暂不批准**：真实 HTTPS 来源与 `x-request-id`/代理转发/无透明重试、session-native event、Pi 0.86.1 上游真实兼容、Main token registry、取消+dispose、A Owner generation、B published Plan/real Source/学校授权都仍缺 C 安全验收或 Gate E；不得用 `()=>{}` 回调、模型文本/assistantId、本地 outbox 或合成 fetch 冒充 physical Host。
- 若需改现有用户 `pi-agent-adapter.ts` 的 `runWithPiRequestProxy`/`sanitizeContextForInference`、既有 tools permission，则 **另发具体 hunk CR**；不要让独立 V3 新 factory 破坏普通 Agent。
- I 只读 Main 租约未激活，A/I 无权改 C Main 生产入口，外部凭证不得入 PR、日志或测试 fixture。

参照 #145 本会话新的正式 `DECISIONS:C` 条目为最终准绳；上面仅是新 C 恢复上下文用的背景说明。

## 6｜实际尚缺什么：下一批顺序，不要重新研究

**第一批 C2-R03（下一会话直接干真实生产代码）：**
1. **先检查 #145 两项刚签裁决、#148 是否仍同 SHA、#144 是否有人提交**。不要为了转发本交接再做旧 SHA 的 CI。
2. 在**独立 C-only Main 新 adapter** 落地 `C2 Main AgentSession Factory + Host Receipt Registry` 的**离线工程边界**；具体比对 A4-R13 的 native Pi 0.86.1、旧 sanitizer/proxy/Owner 代次，明确 active owner at-commit、single fetch/abort、Provider transparent retry、真实 host receipt 必填和冷启动不可伪回执；先在 C-own 模块/测试推进，不接公网或正式 IPC，出真实代码 commit、源路径、new exact SHA。
3. 配套 B1 published Plan provenance/Main material version 对接合同；现有 B candidate-held 不得绕过。可提交明确的 C-only授权拒止 adapter/接口测试；任何正式校规/Gold 需要 Gate L 来源授权。
4. 更完整的 C2 Run 生命周期：多 attempt/续跑/失败恢复/历史 Run、只读当前/历史、Outbox ACK 分层。**不要**把技术 journal 当最终学校审批。
5. 本批集中 Gate O（五项/按新 SHA），CI 首败源行→修复→重新跑新 SHA；不将 C2-R02 的旧 4081 PASS 赋给新 R03。

**第二批 C-Tx、C3、C4（依正确依赖，可并行独立准备，但不要自动宣称完成）：**
- C-Tx：`state.v2.json` CAS 当前**仅同进程内串行**，真实跨 PID/multi-object Run store、文件 bytes、provider intent 之间无完全原子门禁；ENOSPC/EIO/fsync/crash/SIGKILL、archive-vs-Run、await 撤权和多步 intent/recover 必须真测/设计。
- C3：`BatchAttempt` 与固定 entry Run、Decision.basedOnRunId、同 ID retry 和 input manifest SHA 坚实关联；无运行的批次不得自动最终成功。
- C4：正式写回 Outbox/SchoolPort 与真实制度/权限分离，模拟与外部 ACK 不可混淆。
- C5：统一 Native 三栏、原件导入/唯一 Case、V1 adoption/migration、恢复/历史/报告呈现，50 套 G01–G08 真实旅程和新需求的“无现成匹配模板→受控通用/临时候选 Plan”（**必须 user confirmation + C publication gate，非自动认可学校制度**），历史 72 资产/20 冲突保全，产品级 UAT。

**集中实机节点**：C1+C2+I 有真实 Main 接线后第一次 Gate E；C-Tx+C3/C4+下一 I 后第二次 Gate E；C5 产品完整体验 E/P；机构政策/Gold/学校身份 Gate L 单独。**目前 Gate E=NOT_RUN、L=BLOCKED_NO_AUTH、P=NOT_RUN、Release=NO-GO**。

## 7｜项目工程方法与协作纪律

- **C 工程分支**：`feat/v3-dev-c-business-r01` / PR #144。**协调 C-only docs 分支**：`docs/v3-integrator-i-r01-taskbook` / PR #145。两个 branch 不要混。
- 与 #145 的公共文件共写时，先 `fetch_file` 获得最新 blob SHA，**仅编辑 `<!-- BEGIN:DECISIONS:C -->...<!-- END:DECISIONS:C -->` 与 `STATUS:C`**，对 C 的本身状态保留历史事实但写明后继裁决覆盖了何种旧状态；禁止改 A/B/I 的段落。遇到远端并发 409/sha mismatch，重新 fetch 并仅重放 C 自己的 hunk。
- C-only 文档仅供 C 交接，不要把此文件塞成 A/B/I 唯一强制共同阅读资料；对外审批发正式裁决 ID 与 #145 协议链接、具体 SHA。
- GitHub Connector 能直接 `get_pr_info`、`fetch_file`、`compare_commits`、`fetch_commit_workflow_runs`、`fetch_workflow_run_jobs/logs`、`update_file` 和 PR comments。无法访问真实仓库网络/没有 Bun 时只能根据**真实 GitHub CI**作明确的离线 Gate O 结论；绝不声称自己在本机执行过 Bun/Electron。
- 每一次授权记录：范围/Owner/精确源 SHA/目标 I SHA/文件及函数 hunk/测试 PASS 数、失败/回滚、O/E/L/P；不得允许 I 因完成测试扩到共享 DTO/正式 Main/Run writer。
- A/B/I 不需要停工等 C 合并，I 可以按获授权精确源做独立技术桥接；C 保持不可外包的业务安全裁决和产品真实落地。

## 8｜下一会话首轮产出要求

1. **核验远端最新 PR #142/#143/#144/#145/#147/#148 及五门禁**，确认本文件快照没有漂移；先完整读取最新 `DECISIONS:C`。
2. 以 C2-R02 `34c7ea3...` 为工程基础，推进 C2-R03 真 C-owned Main Pi factory/Host receipt registry/Owner/Plan trust adapter 的源码、测试与 Draft #144，禁止未经实机验证真实 Provider 或自动对外发布。
3. 真失效/冒用负例须覆盖：跨 Case/Run/generation、Host ID 不匹配/缺失、revoke during await、lost-reply replay、Provider retry、原件换版、symlink、假 source、no `agent_settled`、abort/SIGKILL、old I1/C0 outbox 不是真实 C2 ACK。
4. 对应源 SHA CI 成功再记 Gate O，按约定保留必须实机的 Gate E 任务和证据要求；绝不重开旧材料调研/禁用原测试。
5. 正式业务/集成权限变更写 #145 C 独占段；在 #144 留工程回执，C 文档在 docs-only 分支单独维护。下次换会话时更新本 C-only交接，但不让三线反复阅读。

**结尾：Dev-C 继续做实际工程，所有技术 Gate O 与 Main/学校/产品实际验收分层。不要把用户催速度误解为降低验收质量，也不要拿 C2-R02 的成功当成“V3 全系统已上线”。**
