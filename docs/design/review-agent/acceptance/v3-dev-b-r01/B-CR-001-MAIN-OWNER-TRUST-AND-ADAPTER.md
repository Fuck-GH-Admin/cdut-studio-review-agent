# B-CR-001｜Dev-B → Dev-C｜可信作者/原件/Plan 接入变更申请

**状态（按 Dev-C 2026-10-19 协调裁决）**：`APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING / NOT_MERGED`。只批准分片接口方向和 I 技术候选集成，**未授权正式 CurrentCase 写入、真实学校发布或 I 修改 C-owned 文件**。
**基线**：Dev-C0 `C0_FROZEN_GO` #141, `5682057c7232c914e72fdae525ce95fd33f32b53`, `review-c0/1`.
**提出方**：Dev-B #142；Dev-B **不修改** Main IPC、Preload、V2 Store、`workspace-service-v2.ts`、`case-store-v2.ts` 或共享合同。
**来源**：#140 06/07/08/09/10/12；#136、#139 负例；本线 B1-B3 适配器代码。

## 目的与差异

C0 定义可被唯一权威 Dev-C 消费的 `CanonicalPlan`、`SourceIdentity`、`ImportBatch`，但**没有把浏览器/Renderer 输入升级为 Main 已认证身份**，也不承诺现存 IPC 自动支持新作者 UI/物理来源。

请求 Dev-C 在其专属文件实现最小且完整的 TypeScript 适配边界，接上：

1. 从 Electron `IpcMainEvent.sender/senderFrame` + 独立可信 owner/session 索引派生 `B2MainContext`；与主应用已授权用户绑定。**不要相信 renderer JSON 的 `ownerId`, `senderId`, `frameId`, `teacher`, `actor.role`。**
2. Main 原件入口：Native picker/drop 的物理文件 capability 或已隔离原始字节 → Main 验证后分配 `physicalSourceKey` → `ReviewB2StagingService.grant/stage`。授权是 Main 独占；token 一次使用、有过期/撤权；双击与 after-await 正/反例；文件 symlink/ZIP-safe 等由可信服务后续实现。
3. 从 Dev-B 专用 `ReviewV3AuthorWizard` 收到**不可信用户作者字段**，由 Main 注入可信作者来源、身份与 source receipt；用 Dev-B `saveB1AuthorRevision` 保存作者草稿、`compileReviewB1Plan` 做预览、`freezeB1Candidate` 冻结候选；候选 `publicationAllowed=false`。独立 policy/Gold gate 未验证不得提供“正式发布”动作。
4. 对真实材料解析（Dev-B `ReviewB2SourceVersionAdapter.parse`）后的 `SourceIdentity` 使用 parser-verified registry `sourceForBlock`，不得接受 renderer/model 直接提供的 blockId/locator/DocumentVersion 声明。引入经 Dev-C CAS 权威 `ApplyMaterial`、`InstallPlan` 命令；具备 expectedRevision、requestId/payloadHash、审计Receipt和旧资料有效性撤销事务。
5. `ImportBatch` receipt/checkpoint 与正式 `ReviewBatchAttempt` 独立；一批 100案/500文件不表示100次审核完成。Dev-C 接收的候选只在**所有**真实来源/权限/Subject/应用条件检验后入 Case；不存在合法 authority 时拒绝且保留原件不丢责任。
6. Dev-B UI 路由用 `planB3ConservativeRouting` 只产生建议；Dev-C 负责用户确认、打断与最终 CreateCase typed command。20 秒自动**技术选模板**不等于自动审批或无声建案。

## DTO 影响／禁止降级

现有 C0 `CanonicalPlan` 的 `bindings: Check×target` / `sourceVersionIds` / 三值条件 / digest 全保留。Dev-B 暂以 `ImmutablePlanDescriptorB1` sidecar 担当 sourceLedger/字段/条件/阶段/对象责任和原声明；如 Dev-C 无法将其验签并转成受控命令，需要有版本的 adapter change，而**不是删掉多对象、unknown 或原始来源**。

**不得修改 C0 schema 名称、仅凭 Draft PR 文本声明授权、把 `candidate-held` 显示为 published、造 `SourceIdentity` 来补缺失 parser 或绕过 V2 单一写权。** G01–G08 50 套全部 candidate-held；历史 #91→#97 G05 差分必须存原 SHA。

## 安全与验收（必须有失败不变性）

| Case | 预期 |
|---|---|
| Renderer伪造teacher/owner/frame/token，跨窗口复用 | Main fail-closed，业务/暂存不新增 |
| 关闭窗口/取消/超时/after-await撤权/双击 | grant消费或撤销；当前案卷不会被写 |
| 同名同stem不同物理源/同字节异路径/改版/跨案假block | SourceIdentity 和 materialVersion 独立，旧 locator 不可作为当前有效引用 |
| 2 target × 6 Check、unknown 适用性 | 精确写入，只保留 unknown 待确认；旧 plan/run 不改 |
| D3 删除 R08/R33 未签 ACK | InstallPlan 拒绝，旧版本 Check/Run/Receipt 不变 |
| P06 legacy scenario 无损转换不可证 | `UNSUPPORTED_PLAN_MAPPING` + 原记录只读保留 |
| 50 domain templates 目录候选，独立 Gold / 校规 ACL 缺 | `candidate-held`、未发布 |

回归范围：新共享合并 SHA 的 `bun run typecheck` / `bun run check:boundaries` / B-TPL、B-IN、B-DOC、R3 L1-01/02/05/07，以及 Electron/E0 token/Office71；完整日志需 Exit Code、首败、真实SHA。不能用 Dev-B 单测 PASS 代替 Main/Electron/UAT。

## Dev-C 响应字段（留给主Owner）

- `decision = APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`
- `owner = Dev-C`
- `approved_DTO_change = none (C 仅裁决端口方向；正式类型/IPC 尚无生效代码 SHA)`
- `integration_PR = none`
- `adapter_contract_SHA = none`
- `cross_owner_test_SHA = none`

**处理原则**：只有 Dev-C 明确批准且提交真实代码+相关负例绿灯，Dev-B 才把 `B-INT-01` 改为集成已完成。

## R02 增量：B2 ZIP 与源暂存原件 checkpoint 的接口事实（2026-10-19）

新增 B 侧源码（本文件更新前独立提交 `0fbeff6b46c60a48ca0a38a982e0f8c39f307f0f`）：

- `review-zip-intake-v3-b2.ts`：真实 ZIP 原始字节校验、限额、CRC、安全 path、逐文件成功/拒止；不接受 Renderer 路径，也不写正式材料。
- `review-zip-staging-v3-b2.ts`：**仅 Main 验真后的** ZIP byte buffer + physicalArchiveKey，逐条申请 owner/frame token，暂存为 `unassigned/needs-user-confirmation`。
- `review-import-checkpoint-v3-b2.ts`：独立存放原件 ZIP、来源 hash、逐文件状态；重启只能返回 `needs-main-revalidation` 并经 Main 重新授权。不能冒充业务意义上的 CurrentCase Material 或正式 ImportBatch CAS 写入。
- `review-intake-adapter-v3-b2.ts` 增加 basename-only 的跨平台文件名门禁、按 ownerGeneration 分离幂等 requestKey 和 documentVersion。
- `B2-ZIP-CHECKPOINT-I-SLICE-HANDOFF.md` 给出精确源测试及 I 可先引用的不涉及 CurrentCase 片段。

**新增明确请求**：C 在 B-CR-001 裁决中拆分 `native picker/drop physicalSourceKey`、`ImportBatch receipt/复核事务`、`ApplyMaterial/SourceIdentity currentValidity` 为三个可独立签的 Main 端口。I 可先在独立集成分支引入 ZIP Decoder 及纯暂存候选；绝不授权直接通过 parser body 创建可信 actor/DocumentVersion。

**状态**：上述 B 代码已写入 #142，但接入 C 的 IPC、App 主进程委托及真实发布验证仍 `PENDING_C`，不因新增存档文件而变更本申请的 `decision = PENDING`。断电后归档原文与元数据需进行设备级断电、EACCES/ENOSPC/符号链接目录安全验收，不能把自校验 SHA 当作签发认可。

## R03：C 已裁决的分片边界（仅规范获准，实际生产仍阻断）

**权威**：[统一协调协议 #145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/docs/v3-integrator-i-r01-taskbook/docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)；本次读取协调 HEAD `256cce64a86bd06447b1d7d785340fdfe2b8fedc`、Blob `b6867029334287b5361aec5a26ed9c8e4465c06f`、`V3-ABCI-GOVERNANCE-R01 V1.0`。Dev-C 独占 DECISIONS:C 已正式登记：

- `B-0 APPROVED`：I 可先在技术隔离集成 B1 immutable candidate compiler、B2 staging/parser-verified SourceIdentity、B3 router。**该批准不涉及候选 Plan 正式安装或模板政策发布**。初始锁定 B 源 SHA `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`（曾三个 CI SUCCESS）。新的 ZIP/恢复提交属增量，必须拿新固定 SHA 与独立 CI，不可拿旧成功替代。
- `B-1 SPEC APPROVED / IMPLEMENTATION_PENDING`：可信 Main Principal 必须从 Electron `sender/senderFrame` 和当前 owner/session 获得，Native picker/drop 物理 bytes capability 由 C 持有，B 只接收 Main-issued `B2MainContext` + bytes，短时一次使用、超时/撤权/跨 owner fail closed。Renderer 的 path/owner/teacher/blockId 均不能升级为身份。
- `B-2 SPEC APPROVED / IMPLEMENTATION_PENDING`：`ApplyMaterial`、`InstallPlan` 由 C 独占 Main Command/CAS writer，固定 expectedRevision/requestId/payloadHash/Principal/Source Registry、旧来源效力失效级联与旧 Plan/Check/Run 保留；发布资格需真实权威政策版本和独立审核。C1 当前 `bindCanonicalPlanV3` 的内部 verifier callback **不等于**正式 Provenance/Policy verifier。
- `B-3 BLOCKED E/L/P`：真实 Native picker/ZIP/Office、durable ImportBatch 业务确认/重试、50 套逐原义务与第 51 套真实 UI、独立 Gold/政策权限等仍不能宣称合格。
- `I-DELEGATION-001 NO_C_FILE_WRITE_LEASE`：未委托 I 改写任何 C-owned types/IPC/Preload/Main writer，I 只能先做隔离 glue/测试/候选片段。

**Dev-B 当前行动**：保留自有 ZIP decoder/staging/checkpoint 源代码和负例，向 I 提供 `B2-ZIP-CHECKPOINT-I-SLICE-HANDOFF.md`，把新源 SHA 与 CI 实际结果固定后再请求新切片准入；不要求 I 等待本线全体 B4 完成。



## R04：已交付的 B1 Main 作者端口与请求 Dev-C 挂接边界

B 新增 `review-template-author-main-port-v3-b1.ts`，提供 `ReviewB1AuthorMainPort`：`saveDraft(ctx,doc,expectedRevision)`、`preview(ctx,doc)`、`freezeCandidate(ctx,templateId,expectedRevision)`。`ctx` 不是不可信 Renderer JSON；调用者必须由 C Main 以真实 sender/frame/owner/session 生成，附 C 可信 `B1AuthorPermission` 回调。端口会用真实 `principalId` 覆盖作者自称 `recordedBy`，并严格保持 `candidate-held`，绝不签发学校批准或创建 CurrentCase。

请求 C 或按已批准受限 I glue 接入以下 *typed callbacks*（尚无授权写 C-owned Main handler 或 Preload 代码）：

- `AuthorSaveDraft`：Main principal/owner/session/expectedRevision/正确 author scope；调用 B1 port，返回 draft revision，不写业务案卷。
- `AuthorPreview`：同一可信身份与限额，允许 B 的第 51 套模板样例 trial 编译；临时 trial 值不可作为 CurrentCase 的已确认来源。
- `FreezeCandidate`：只创建 candidate-held immutable Plan，冻结后只能另建版本；正式 `InstallPlan` 仍由 C 独占、待真实 policy provenance verifier/ACL 校验。
- `AuthorExport`：renderer 仅导出候选声明配置及 `publicationAllowed=false`；导出 JSON 不等于 SchoolPort 受理/Gold 通过或官方发布。
- `B2-claimArchiveRequest`：整包 `requestId/physicalArchiveKey/rawSha256` 需由可信 C Native 输入发放。B 的内存幂等和本地源档 checkpoint 不得被 I 当成正式 CurrentCase CAS/Receipt。

**真实状态**：`B-CR-001 APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`。上述新增文件为 B 自有源码和测试，新的 HEAD CI 未确认前 `SOURCE_ONLY`。无 C Main 授权实装或学生/老师真实学校 Principal，Dev-B 不能标 `B-INT-01 PASS`。


## R05｜输入侧逐文件账已实现，正式 Case command 保持待实现

B 新增 `ReviewB2InputLedger` 与 `proposeB2MaterialCandidates`（详见 `B2-INPUT-LEDGER-AND-MAIN-HANDOFF-R03.md`）。来源先经过原 ZIP byte/manifest 的重新校验、Main owner 授权回调和逐文件 Subject/role/raw SHA 确认；输入账按 revision CAS / requestId / body hash / 逐项 receipt 保存。导出对象明确为 `input-only-unapplied`，没有有效 `SourceIdentity`、正式 `MaterialVersion` 或 CurrentCase write。

**向 C 的精确接线请求仍为 `APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`**：

- Main 可信入口派生 `B2MainContext` 与 `B2InputAuthority`，从真实物理文件读取 bytes/重试 grant；Renderer 不能发放 token 或在 IPC body 中自称 authorize。
- 在正式 `ApplyMaterial` 前，根据 `archiveId/entryIndex/rawSha256/inputRevision/ledgerHash/receiptHash` 向 B InputLedger 复核当前来源；再由 C 验证真实 parser-verified SourceIdentity / Subject / 权限和 case revision，执行有唯一 durable Receipt 的原子写入。
- `ImportBatch` 的输入记录只是候选来源事务，`ReviewBatchAttempt` 由 C 另行拥有；提议输入绝不能自动变成某案 confirmed Material 或 reviewer Run evidence。
- C/ I 不得依据普通 SHA-256 原件及本地 journal hash 冒充有权签署人签名、学校制度或独立 Gold。

**状态**：B 自有源码已提交，最新 B HEAD CI 仍需按真实 SHA 判断。I 可以准备隔离的 read-only handoff 合同测试；不能在新的 Gate O 通过之前将 R03 新代码作为 approved integrated slice。

## R06｜B4 50 候选模板与原始政策能力验证分层

Dev-B 新交付 `B4-50-OBLIGATION-COVERAGE-R02.md` 及 8 域 `B4-OBLIGATION-SOURCE-Gxx.json`、`B4-50-CHECK-SOURCE-COVERAGE-R02.csv`、`B4-50-ORIGINAL-MD-GIT-AUDIT-R02.csv` 和两组独立测试。固定 D4 历史 SHA `b68443b23293b4714e61a3b81383d3d3a56434fc`；50 套 workspace 共 3,875 条 Check 映射到历史 task/sourceBinding，0 个历史结构性孤立绑定；**G01 仍有 34 条未单独明示对象/全案 scope**。原文证据中 9 套有匹配的历史预期 Git Blob、1 套能观察 Git Blob 但无预期锁、40 套仅有原文 SHA256 元数据且无法从已记录的固定仓库原文路径完成本批独立字节核验。9 套 Git Blob 技术一致也不等于校规现行有效。

对 C 的 `InstallPlan` policy provenance gate **仍然全体阻断**。不能用 `B4_WORKSPACE_BOUND`、`verification=content-checked`、目录 `SHA256` 声明、D4 合成 Pi 或本批 JSON 作为有权来源/现行校规/独立 Gold 证据；不得自动补齐 34 个对象或将 50 候选提升为 published。

本批新增 B4 校验器仅提供离线候选档案防丢失/版本血缘/负例，不导入共享 types/IPC，也不写 CurrentCase、ReviewRun 或模板正式批准记录。I 可等新精确 B SHA CI 绿灯后读这些 `SOURCE_ONLY` 片段，C 负责正式 policy verifier/权限签出与独立 L/P Gate。
