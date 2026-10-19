# B-CR-001｜Dev-B → Dev-C｜可信作者/原件/Plan 接入变更申请

**状态**：`PROPOSED / NOT_APPROVED / NOT_MERGED`
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

- `decision = PENDING`
- `owner = Dev-C`
- `approved_DTO_change = none`
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
