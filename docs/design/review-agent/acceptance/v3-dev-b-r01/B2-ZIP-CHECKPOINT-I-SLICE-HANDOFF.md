# Dev-B R01 → Integrator-I｜B2 ZIP / 原件暂存切片交接

**日期**：2026-10-19。**协议**：V3-ABCI-GOVERNANCE-R01/V1.0，B ACK 协调分支提交 `f77887c3340d7e6dc9658857ae43334429bc093a`。
**来源**：Dev-B Draft PR #142，源代码基准（编写本文件前） `f42753b650220d4431051df2746b56749720e2b4`，从 C0 `5682057c7232c914e72fdae525ce95fd33f32b53` 派生。**状态**：`SOURCE_ONLY / CI_PENDING_AT_THIS_SHA`，不可把接口就绪当成正式材料写入就绪。

## 真实新增生产代码和入口

| 文件 | 可用代码 | 约束 |
|---|---|---|
| `review-zip-intake-v3-b2.ts` | `decodeReviewB2Zip(bytes, limits)` | 仅内存解 ZIP，中心目录+本地头、CRC32、尺寸与压缩率、重叠检查、ZIP64/多卷拒止、symlink/特殊文件、Windows/POSIX 路径、同名大小写冲突、data descriptor；逐文件 receipt。无写磁盘行为 |
| `review-zip-staging-v3-b2.ts` | `stageReviewB2TrustedZip(ctx, staging, nativeZip)` | Main 注入的可信 sender/frame/owner，整档文件哈希+物理来源，逐条再 mint staging token；文件先标 `unassigned` / `needs-user-confirmation`，绝不 CreateCase/ReviewBatch |
| `review-import-checkpoint-v3-b2.ts` | `ReviewB2ArchiveVault.saveAndStage/inspect/prepareRestage` | 将原 ZIP bytes/hash 与逐文件目录 receipt 写入独立本地暂存库。存量仅为恢复输入，不是当前材料有效性；重启必须以新可信 Main 身份再校验、再暂存 |
| `review-intake-adapter-v3-b2.ts`（已存在，补安全约束） | `ReviewB2StagingService` | 单用/撤权 token；本轮收紧绝对路径/相对路径、Windows 设备名与控制字符；幂等键包含 ownerGeneration，documentVersion 哈希包含 ownerId |

以上源文件与对应 `*.test.ts` 由 B 维护。I 可以引入 immutable ZIP decoder 作为完全无写权切片；Main pickle/drop/Case 写入必须先经 C 决议。

## 先后集成序列

1. `B2-ZIP-DECODE`：`READY_FOR_ADAPTER` **仅在该 exact HEAD 的 TypeScript + ZIP 测试通过之后**。无依赖于 C 的业务写口。I 可先验证 ZIP 正反例和复用，不可自行将 ZIP path 写进 CurrentCase。
2. `B2-ZIP-STAGE`：需要 Main 验证 owner/frame/来源物理 handle 并注入 `B2MainContext`；无该事实时 I 只能在 synthetic Main harness 核验并标 `CONTRACT_BLOCKED`。
3. `B2-ZIP-DURABLE`：独立 InputBatch source archive checkpoint；**只保证原件/目录阶段的本地恢复候选**，并不保证正式 `ImportBatch` CAS 回执、逐条业务完成或源解析读账持久性。不可将原 staging 候选跨重启视作已确认材料。
4. `B2-PARSER-SOURCE`：使用已存在 `ReviewB2SourceVersionAdapter`；只有 parser registry 内真实 block 才能 mint `SourceIdentity`。实际 `ApplyMaterial` 由 Dev-C 权威命令完成。

## 拒止清单与异常数据不变性

`B-IN-01` ZIP slip、反斜杠、驱动器/UNC/绝对路径、符号链接、重复路径、超阈值、CRC/中央目录不一致、坏归档、加密/ZIP64/多卷、并发同 requestId 不同物理包；受损 entry 给 `rejected`（结构级坏包则整个拒绝），不向磁盘解压，不写 CurrentCase。
`B-IN-02/03` revoked/old owner generation/cross-case 不能继续读，重复请求相同 bytes 得同暂存 ID，不同 bytes 拒止；文件角色/Subject 不完整则 needs-user-confirmation。checkpoint 意外中断或 hash 不一致标 `RECOVERY_REQUIRED` / `CHECKPOINT_INTEGRITY`，旧案卷/Plan/Run 不变。
`B-DOC-01/02` ZIP 子文件与物理存档 identity / parseRevision 必须维持，真 DOCX/XLSX/PDF 与 Office71 物理路径差异仍需要独立验收。

## 待 Dev-C 的 B-CR-001（不能由 I 默许）

- 从 `nativeDialog` / `drop` 获得真 byte buffer 和 Main-issued physicalArchiveKey，不接受 Renderer 路径/自称 owner。
- 正式 `InstallPlan` / `ApplyMaterial` 需 Main principal、expectedRevision、requestId、CAS 事务、SourceRef/DocumentVersion 验证和 Receipt；B 不写共享类型/IPC/Preload。
- Policy/Gold ACL 与 50 candidate-held 完全独立于 ZIP 技术成功，不得因 ZIP 合法就发布业务模板。
- 调整 ImportBatch 正式持久进度、逐文件确认后状态属于 B 输入源记录 + C 正式应用命令协作；需要 C 明示版控决定。

## Gate 判读

- **Gate O**：最新 B2 ZIP 代码已提交，GitHub Actions 对最新 SHA 需单独验证；本文写入时 `NOT_YET_ATTESTED`。最小命令 `bun run typecheck`、`bun run check:boundaries`、`bun test apps/electron/src/main/lib/review/review-zip-intake-v3-b2.test.ts apps/electron/src/main/lib/review/review-zip-staging-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.test.ts`。
- **Gate E**：`NOT_RUN`：真实 Electron、Native picker、运行中撤权/多窗口、Office/ZIP 大样本、ENOSPC/断电故障。
- **Gate L**：`BLOCKED_NO_AUTH`：无学校制度签发/Gold/真实账户授权。
- **Gate P**：`PARTIAL`：尚需 100 案/500 文件、真人 UAT/第51套/50套完整义务映射。

**质量注意**：本地 vault 采用普通 SHA-256 完整性检查，不是带密钥的来源认证或对抗本地管理员的数字签名。缓存和临时目录要由真实平台的文件权限/保留政策约束。Git revert 不意味着已经导入的真实材料消失或回滚。