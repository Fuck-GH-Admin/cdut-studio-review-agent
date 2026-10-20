# CDUT Studio Review V3 · Integrator-I I6-00 / I6-02 — 精确来源闭包、ABI 风险、下一次 C→I 合成

> **Scope**：I-only 源码及工程约束报告，非 C 业务裁决、非来源导入授权。固定时间 2026-10-20。产品全功能要求与 C 正式 [C_PRODUCT_CLOSURE_R01](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283639440) 保持一致。

## 0. 不可变锚点与证据

| 源 | 固定 SHA | 目前可用身份 | 说明 |
|---|---|---|---|
| I5 approved | `a77a70b3a75da11728d99dba35717b18b02a5089` | C-signed accepted-only | `integration/v3-i5-b20-accepted-frozen` GitHub ref 实际回读 MATCH；#156 继续 Draft |
| C R09 | `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a` | C-only exact Gate O green | 5/5 actions 成功；后续 C R10 唯一基础、**不是 I 导入许可** |
| A R21 | `703e2bf8e20a7b598e1eb923d5faf6f7b17ab3a9` | A-only latest fixed source | `review-v3-technical-sequence-driver.ts@144677d06de8862322ff326035017d0f5bdd46cd` 等新文件不可自动 I 导入 |
| B R29 | `4c4f277773c0e20185a7364d0bb66439d51ca7a4` | B-only C accepted technical with unrelated flaky retry | C #145 最新受限承认 R26–R29 同 SHA rerun 4344/5/0；**不批准** I 重放 B R24–R29 |

**完整机器可读的文件级 source SHA→target SHA + Blob + 分流理由** 在 [`I6-00-FOUR-LINE-EXACT-BLOB-INVENTORY.json`](./I6-00-FOUR-LINE-EXACT-BLOB-INVENTORY.json)。从上述四个 GitHub 精确 commit 对 `apps/electron/src/main/lib/review/` 的实际 Contents API 单独读取，纳入 139 条 review 范围文件：`14` I5/C 完全相同、`5` I5/C 已有版本冲突、`24` I5/B 相同、`16` I5/A 相同、`14` I5-only、`19` C-only 还没在 I5、`14` A-only 尚未准许、`33` B-only 尚未准许。分类为文件目录 **静态快照**，不是 139 条文件均可迁移或全仓合并闭包；跨目录的 shared、Preload、UI/Case/Run 仍须 C 自己核验。

**重要：** `git compare C R09...I5` 是分歧血缘，不是安全可 cherry-pick patch。真正下一 C 合成应从 C R09 开发真实 B20，I 新切片必须在未来 C 的新 exact green anchor 上重新核对原 I5 已签能力并独立申请来源 CR。

## 1. I5 与 C R09 的五个 exact-path 修改冲突

在两个实际固定 commit 中，同路径 Git blob 明确不同，均属 C 所有/安全敏感，**I 不得覆盖任何一侧**：

| 相同路径（前缀 `apps/electron/src/main/lib/review/`） | I5 Blob | C R09 Blob | 交由 C 判断的行为 |
|---|---|---|---|
| `plan-binding-v3.ts` | `8a252806f9d470b4abc3b9896f58509768885f79` | `5870588b953def085504874cad61c47438510421` | Policy/Plan 对 current Case CAS 的发布证明与 Check 移除校验 |
| `review-v3-main-host-receipt-registry.test.ts` | `9b0054cb293397620db6b72ff99eb26adef1b185` | `a54d71db69b11caa3c0ed827f8c416806bb7d6f9` | Host 对新 Run-wide fence 的既有负例与新版断言 |
| `review-v3-main-host-receipt-registry.ts` | `bba17b3c3e01ebf0be643bf00fbf1284028f1e7f` | `26359d4b2f3a10f517bc284d426187d5dd030e54` | 旧进程内 revoke 与 C 新持久读围栏，禁止旧代码覆盖 |
| `review-v3-run-writer.ts` | `e48506faf30c17b0e3071a692becd7a5f2fb9e5b` | `b53cea6fb2a71c003d7d8baaf501508d0a239eed` | C 新真实 Run fenced admission/seal、Case CAS 权限 |
| `review-v3-technical-ledger.ts` | `a0ed06a05775674143f584b140b1cb36d490a6f2` | `a3378792a1e2f3a3b8a5d214a969746054c33d8b` | 被 fence 的旧 Run 技术事件永远不得翻新入账 |

**结论：** 这五项必须保留**新 C 源**，以前 I5 获签的测试/行为在新 C 绿锚点下重新运行，而不是重放五项旧 I5 C 文件。原 I5 frozen 不动以便对照/rollback。B1 compiler、B2 staging、ZIP Vault、InputLedger、B19/B20 的 fixed B R23 候选路径在 I5 中与 B R29 共用 Git blobs 可逐项去重；同名 B3 routing `review-intake-routing-adapter-v3-b3.ts` I5 `51a0fa003eb...` vs B R29 `cd1d5b885e6...` 必须单独源 CR / semantic diff，不能以同名假设相等。

## 2. 真实 ABI 映射而非无条件类型转换

| 方向 | 已观察 ABI | 当前权限风险与必须 C 实施的桥 |
|---|---|---|
| C Main → B20 | B `B20MainReadScope`：numeric `senderId`, `frameId`, `authorityEpoch`；另有 Owner/generation/session/caseCandidate | C Main 的 `windowId`, `frameId`、`authorityEpoch` 是 string，`sender.id` 可 numeric 而 frame string 是 processId:routingId 形态。只有 C **本机真实回执和同一观察源**能创建、维护数值 B scope 与字符串 C token 之间 current 授权关系；禁止 `Number(stringEpoch)`、Renderer 主张、I synthetic fake Main |
| C archive picker → B Vault | B `ReviewB2ArchiveVault` 按 Main Native archive key、物理 ZIP raw/CRC、B2 parsed receipt；C `CMainNativeArchiveRegistry` 按 SHA/dev/ino/realpath、Owner/frame/epoch 与 Vault witness 作 current recheck | 需 C-owned adapter 把**唯一一次**物理原件授权与 B archiveId/key/SHA/current scope 精确绑定，保留 cold PID fail-closed；不可复制 B Vault、建立平行 C SourceLedger 或向 Renderer 返还 private key |
| B1/B2/B19/B20 → C preview | I5 真实存盘 B1 author revision+frozen、B2 ZIP/ledger/parser、B19 Check×target×object×Subject、C immutable B20 二次读取已通过离线技术测试；C R09 注册 `B20_CANDIDATE_READ_V3` Main handler 和 Preload read-only facade | handler 存在**不等于真实生产依赖已安装**。R10 C 应注入真实 Owner/ACL/current pinned author/current B20 bundle，读前/读后确认，保留 `candidate-held/displayOnly/publicationAllowed=false` |
| A21 Pi → C C2 Run/Host | A `V3ATechnicalSequenceDriver` 顺序技术 SDK/turn budget，A R20 operator recovery read-only、A SDK SSE technical receipt；C R09 `C2MainTrustedExecutionAssembly`、独立 `C2MainPhysicalHostReceiptRegistry` / durable Case CAS Run fence | A 的 SSE 完成/SDK transport ID **不能**直接变成 C physical Host Read/Check/terminal、Case Run ACK、学校决定。C 安装真实当前 Host observer/Owner/Run grant；Operator takeover 禁止，无来源不重派 |
| B29 51st / Batch → C published/Decision | B29 `prepareB29UnmatchedAuthorDraft@7af5fb6...` 明确 `candidateOnly=true`, `planCondition=unknown`, `requiresMainPickerAndRoleRecheck=true`；B R29 其他 bulk readiness 技术源 | 51st 永不能默认为学校现行政策，候选 Batch 不能从技术结果自动写入 C V3 Decision；C 需要独立 published issuer/Decision/Batch finalizer，缺则 manual/UNKNOWN |

## 3. 真正已存在的 I5 能力与本批不重放清单

- **I5 保留：** I1/I2 owner event/proposal、I3 Provider/Host 技术隔离、I4 A HTTP SSE/Host 负例及 B18 source version、I4 A19 固定子 PID/SIGKILL/注入 EIO/ENOSPC、I5 B R23 11 production+10 tests、四 C immutable offline author/B20 reader/test、I5 10 项物理原件/冷 PID 来源验证。源码 SHA 见已签 I5 内 source-lock 和本 I6 JSON。
- **C R09 与 I5 相同的 14 个既有关键目录模块**（如 `review-v3-main-b20-trusted-candidate-read.ts@d0e6ea27...` / `review-v3-main-author-revision-read.ts@ba80feb...`）按 **blob equality** 直接略过；不能靠“新文件名不同”重复造 Reader。
- **A R21 增量**：A R20 `e8eec841...`→R21 `703e2bf8...` ahead 2 / behind 0，仅新增 `review-v3-technical-sequence-driver.ts@144677d06de8862322ff326035017d0f5bdd46cd` 与 `.test.ts@4befa68e335c8bd98fd03399263da7c4c7046f2f`；其原有 Host/Owner 依赖虽已有 I5 部分，但 R21 真实 Main 来源未授权，不在 I6 复制。
- **B R29 增量**：B R25 `ca725148...`→R29 `4c4f277...` ahead 4 /behind 0 **仅新增 7 B-only 文件**：`review-v3-b-bulk-product-workbench.test.ts`、`review-v3-b-bulk-remediation-cycle.ts`、`review-v3-b-candidate-readiness-workbench.ts`、`review-v3-b3-unmatched-author-bootstrap.ts` 与测试、`review-v3-b4-bulk-evidence-workbench.ts`、B-only UAT 文档；不等于 B29 全仓都可重放。B25 R24 等早期新资产仍缺单独 CR。
- **C R09 只读**：新 `review-v3-durable-host-fence.ts@75e989ef7deb63f36d9c9e2f636d800e69064d0c` 及 worker/tests、真实 C-TX Case CAS，C Main native archive registry/author handler/shared 等都由 C 持有；I 本批 **0 C 文件导入**。

## 4. 本轮 I6-01 工程内容与验证边界

I6 I-only 独立分支从 I5 signed immutable ref 直接派生，仅新增：
- `review-v3-integration-i6-locked-sources.test.ts`：实际本机读取 21 个已签 I5 Git blob，按 `blob <byteLen>\0<real bytes>` 计算真实 SHA1 Git blob，防止 silent source drift；负例验证篡改、重复路径，断言上述 7 个未授权新 A/B/C 文件未被移入树。
- `review-v3-integration-i6-joint-technical.test.ts`：只用 I5 **已有 B2/C 旧技术组件**，实读 B2 staging/parser/sourceVersion 与 C independent physical Host observer/Owner，物理替换但相同 SHA 仍独立版本、SDK ACK 不造 Host、Owner revoke、Run manifest cross-original、numeric/string identity 差异、真实 C immutable B20 preview 候选非正式 Run/Batch/学校发布。fixture 的 Main Principal/Owner **明确是测试依赖注入，不是 R09 live install**。
- 机器来源映射、本文、七旅程技术矩阵、测试/失败/回滚报告和 C CR 均属于 I-owned docs，零 C Main/Preload/shared/Case/Run/Host writer 生产改动。

**注意**：本轮技术测试使用 I5 的旧 C2 physical Host registry（仍是 process-local），**并未宣称实测 C R09 的新 durable Host fence**。C R09 仅源码/ABI 对照，下一步以 C R10 新绿 anchor 作新 Gate O。

## 5. C R10 结束后 I 的最小源重放排序（须先独立新 C CR）

1. C 固定 R10 **实际全绿 exact combined SHA** 和新的对外 ABI、并授权为 C_SOURCE_ANCHOR；I 实际核最新 C git tree、CI、PR/Draft 仍未发布的含义。
2. I 从全新隔离分支/工作树派生该 **C 绿色新锚点**，先比对本 JSON 与 I5 freeze 的每一个获签源/blob，区分 `ALREADY_IN_C`、`SAME_BLOB`、`C_SUPERSEDES_OLDER_VERSION`、`REPLAY_IF_C_APPROVES`、`CONTRACT_BLOCKED`。默认以 C 当前 Run/Host/Plan binding 实现为准。
3. 向 C #144 申请**尚缺且**在 C 新树上版本兼容的 I-only tests/glue、非 C-owned A/B 来源具体路径和 blob；测试依赖闭包、版本、主进程/Owner字段、错误/迁移/rollback 都固定。未经 CR 不复制 A R21/B R29/C R09 的新生产来源。
4. 机械来源 source/target blob+diff 逐文件重放；I-only 复演当前 B20/picker/after-await/revocation/cold PID、A Host/Run durable fence 与旧技术事件、51st、Batch 未授权 Decision，完整 TS/Boundaries/Build/Bun + CI `Gate O` 于**同最终 SHA**集中执行，保留 first fail。
5. 由 C 独立检查**新的** integrated SHA、反例和 rollback，再签 `C_ACCEPTED_FOR_ENGINEERING`。只有签后创建新的不可变 accepted ref；旧 I5 永不改变。
6. 后续实机 `Gate E`、独立学校 `Gate L` 和产品 `Gate P` 以及 RELEASE_GO 是**另一个**验收制度，任何技术 source replay 不应提前签产品通过。

### C 必须裁决 / 尚不可执行

**C R10**：完成真实 B20 Main native picker/数字 scope→可信 C frame 的永久身份重验；授权学校 issuer 未安装时 official Policy/Run 仍 fail-closed。**I 无权限**注册/修改 Main/Preload/shared、C-TX、Run/Host/Batch/Decision writer。

**A**：R21 multi-turn technical source admission into new C trusted Run/Host 尚没有精确 CR。**B**：B R24–29 新候选与 51st 源可否进入新 C 安全读口尚没有精确 CR。**I**：I6 当前不得重放这两条线的新 blobs；正式 CR 需 C R10 绿色合成后根据实际 C 源图最小化申请，不能预先强拿全部。
