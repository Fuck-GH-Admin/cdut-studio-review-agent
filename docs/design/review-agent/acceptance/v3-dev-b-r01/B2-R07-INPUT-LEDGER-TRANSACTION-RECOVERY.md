# Dev-B B2-R07｜逐文件输入账事务一致性与故障恢复

**归属**：Review V3 Dev-B R01，工程 PR #142，分支 `feat/v3-dev-b-template-intake-r01`。本文是 B 会话内部工程跟踪，不是四线新协议，不构成 C 业务/安全授权。

## 一、固定调查基线

- 本轮核查起点：B #142 `9952348d413cac58da3db2b99c14dae2405a6120`，保持 Draft、未合并。共同 C0：`5682057c7232c914e72fdae525ce95fd33f32b53`（`review-c0/1`）。
- 基线源码：`review-import-ledger-v3-b2.ts` Git blob `ca8a9075337102b275f1bdbfe98c4709fa19ecd6`；测试 blob `a831e4e4e0fc5d12be35d01016d48b9c022fefd7`。
- 上轮 R06 原档 `review-b2-archive/2` 的解码配置锁和根目录 `capacity.lock` 已提交，**不代表** InputLedger 的跨进程一致性已充分验证。
- 最新观察：B SHA 上 PR CI #39261512493 `pending`，Baseline #39261512601 与 D2 #39261512456 `queued`；三个运行均尚无通过报告。禁止复用旧 SHA 的成功结果。
- C 的 `B-CR-001`：`APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`；B 只维护输入候选、审计回执与恢复机制。C 独占可信 Main Picker、Preload、CurrentCase、ApplyMaterial、InstallPlan、Run/Batch 和发布授权，I 的既有 B 绿源锁仍固定 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`。

## 二、R07 实际确认的缺口

### R07-01：snapshot 不受与写者相同的文件锁保护

`getOrCreate()` 和 `decide()` 使用 `input.lock`，但 `snapshot()` 当前只调用 `checkedArchive`、`read`。写入采用 tempfile + fsync + rename + directory fsync；这有助于避免局部 JSON，但并不证明一个并发读取者取得了已完成 durable 目录提交的一致快照。

**期望**：同一个 archiveId 的创建、决策、重放、快照读取共用跨 PID 互斥门禁；持有锁时拒绝其他读写；对遗留锁不自动清除。持锁前后均验证 owner/scope，正式身份只能由 C 的 Main 衍生。

### R07-02：旧回执没有独立封存业务归属

当前 `B2InputMutation` 包括 requestId、payloadHash、status、entryIndex、ownerGeneration、decidedBy 和 receiptHash 链，但没有把确认时的 `role`、`subjectId` 和 `rawSha256` 作为回执可独立回放的业务字段。旧 `verify()` 检查状态终态与文件数组关系，却不能仅凭回执字段重建被确认的 Subject/角色。

**期望**：采用版本化 ledger/receipt 合同；新确认回执明确带 role/subjectId/raw SHA（拒绝/跳过必须为 null），receiptHash 覆盖这些字段；回放时逐文件验证「独立回执 ↔ 终态文件 ↔ ZIP 原始哈希」，并保持每个文件最多一次终态转移。对没有独立归属证据的旧版已确认回执，不能自动认可为可交接的 ApplyMaterial 候选；必须走明确的 Main 重新确认/迁移流程。不能擅自把普通 SHA256 描述成抗本机恶意操作者的签名。

### R07-03：重启、异常退出与跨文件事务边界

`ArchiveVault` 与 `InputLedger` 分别持久化，不是一个跨文件原子事务；恢复时必须先验 archive 原始字节和已锁的解码策略，再核 InputLedger 归属与 hash chain。若 ZIP 只有 archive.zip 而无 manifest、ledger 只有临时文件、锁未释放、JSON 损坏/缺失或 ENOSPC，均需要明确阻断与人工恢复路径。不能在不完整状态下自动生成正式 Case/ReviewRun/Decision。

## 三、R07 工程实现与负例标准

必须先修 B-owned `review-import-ledger-v3-b2.ts` 及其测试，覆盖：

1. 持有 `input.lock` 时，`snapshot/getOrCreate/decide` 均拒绝操作、不删除他人锁；解除锁后恢复既有账本且保持 revision。
2. `snapshot` 中的 archive 核验、ledger 读取与回执校验处于同一锁期间；有 await/撤权的其他链必须再次复核 owner。
3. 同文件两次不同终态、变更 requestId body、旧 revision、跨 owner/Subject、原始 SHA 不匹配全部拒止。
4. 修改终态 role/Subject/rawSha、再重新计算 JSON ledgerHash，仍不能通过回执链和逐文件归属重放。
5. 新老 schema 边界：历史无归属回执不能无声升级或向 C 作为已验证输入提交；有效新回执重启后的同请求/同 body 重放不产生第二条 mutation。
6. 崩溃遗留 `input.lock`、孤立 temp、损坏 ledger、ENOSPC、symlink/hardlink、真实双 PID、断电/目录 fsync 回放均保留为集中 Gate E。
7. 保留 `candidateKind='input-only-unapplied'`；不得改 C shared DTO、IPC、Preload 或写入正式 Case/Run/Plan。

## 四、执行门禁与集中目标机计划

离线 O（要求**同一精确新 SHA**）：

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-handoff-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts apps/electron/src/main/lib/review/review-b2-office-zip-subject-v3.test.ts
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
```

Gate E：两 Electron/PID 实际竞争同一输入账锁，kill -9 前后 receipt CAS 与原件不损；ENOSPC/只读目录/原件丢失/软硬链接；Office71 和 ZIP 真实原件，100 案/500 文件完整性、时间/峰值内存、重新登录和多个 Subject 区隔。保存命令、环境、原件/账本 hash、日志、首败和恢复步骤；未执行不得记 PASS。

Gate L：`BLOCKED_NO_AUTH`（校方政策/身份/独立 Gold）。
Gate P：`PARTIAL`（第51套无代码真人 UAT、50 套来源义务、34 G01 Scope UNKNOWN、38 套原文未独立取得及真实工作台）。

## 五、本轮进度与写入限制

前一会话核查时曾遇工具写入限制，当时**尚无** R07 工程代码合入。此段记录历史阻断，并非下述后续工程提交的当前状态。所有通过结论均须按新精确 SHA 单独验证。

## 六、R07 实际工程提交（2026-10-19）

**已真实推送** Dev-B Draft PR #142：起点 `9952348d413cac58da3db2b99c14dae2405a6120`，本批精确代码 HEAD `2e4c35f1c6d13a7fad48c2b5740d3b55ec94949f`。代码及测试合计 4 个 B 自有路径（另有本文件）：

- `review-import-ledger-v3-b2.ts`：`snapshot` 使用与 `getOrCreate/decide` 相同的 `input.lock`，持锁内校验 ArchiveVault 和 ledger、离开前复查当前 owner；孤立 `ledger-<20hex>.tmp` 不再静默重建，而是 `B2_LEDGER_RECOVERY_REQUIRED`。引入 `review-v3-b2-input-ledger/2`，为每项 mutation 固定 `confirmedRole`、`confirmedSubjectId`、`confirmedRawSha256`、`decisionReason` 并纳入 receipt SHA256；逐项重放确认这些值与文件最终状态一致。
- `review-import-handoff-v3-b2.ts`：候选来源交接要求 ledger/2 且必须再次核对该文件原始 SHA、Subject、role 与已封存 receipt；旧 ledger/1 虽可保守读取历史审计，但因未封存这组确认信息，`decide` 与 `proposeB2MaterialCandidates` 均 fail closed，需要 Main 主导的显式重新确认机制。
- `review-import-ledger-v3-b2.test.ts`：原有用例保持，现共 **10 项测试定义**，新增 snapshot 外部写锁阻断、不自动清理外部锁、孤立临时文件恢复阻断、v2 确认字段/拒绝原因篡改且仅重算 ledgerHash 不获通过、重启同请求精确 replay 和 legacy ledger/1 拒写与拒交接。
- 本文件：保留发现依据、完整 Gate E 集中验收要求与当前风险。

**确证层级**：提交代码和正反例已成立，但 CI 仍在排队。新 HEAD 对应 [PR CI #39265404543](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39265404543)、[Baseline #39265404354](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39265404354)、[D2 #39265404480](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39265404480) 首查均 QUEUED，**Gate O=PENDING_EXACT_SHA_CI**；本会话未能运行本地 Bun。Gate E=NOT_RUN，L=BLOCKED_NO_AUTH，P=PARTIAL。未经验证的工程不可入 I1 已冻结的原 B 绿色来源，也不签 C 工程认可。

**剩余工程风险**：InputLedger 和 ArchiveVault 仍不是跨两个目录的单一原子事务；强制断电/ENOSPC 后已 rename 但目录尚未 fsync 的结果，需要多 PID 实机故障注入取证。旧 ledger/1 的正式迁移与重新授权由 C 共同裁决；不得根据内部哈希直接批准。底层 SHA256 与 hash chain 不保证抵御对本地文件具有任意写权限的攻击者。业务完成、InstallPlan/ApplyMaterial、校方政策与独立 Gold 仍在 B 的授权之外。
