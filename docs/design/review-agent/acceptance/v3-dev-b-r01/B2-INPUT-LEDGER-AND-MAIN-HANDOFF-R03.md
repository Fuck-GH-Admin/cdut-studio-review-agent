# B2 R03｜持久逐文件 ImportBatch 输入账与 Main 候选交接

**状态**：`SOURCE_ONLY / CODE_SUBMITTED / GATE_O_PENDING_AT_CURRENT_SHA`。2026-10-19。
**上游合同**：C0 `review-c0/1` SHA `5682057c7232c914e72fdae525ce95fd33f32b53`，C 在协调 #145 的 `B-CR-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`，I 尚未获得共享 IPC / CurrentCase 写入租约。
**源工程**：Draft PR #142 `feat/v3-dev-b-template-intake-r01`，本次代码截止 `15c4b03b8691120d4f9ff4c1116986778f67ae34`；此行只是源码 SHA，不是测试 PASS。协作文件只写 B 状态摘要。

## 为什么需要输入账

现有 `ReviewB2ArchiveVault` 已能通过原始 ZIP+来源 manifest 恢复文件，但只有总档状态，没有逐项主观确认、同请求重放、过期版本、拒止原因可审计的**输入侧** record。仅靠内存 `ReviewB2StagingService` 不能在重启后还原哪些文件曾经被作者确认，也不能把 ZIP import 误作正式业务 `ReviewBatchAttempt`。

新增源代码：

| 专属文件 | 正式入口 | 职责 |
|---|---|---|
| `review-import-ledger-v3-b2.ts` | `ReviewB2InputLedger.getOrCreate/snapshot/decide` | 以**已验证的原始 ZIP 检查点**建源账。拒绝不相符的 owner/case/hash、禁止对 zip-rejected 条目改判、作者确认 Subject/role+raw SHA；用 expectedRevision CAS、requestId+payload SHA 和 hash 链追踪文件级 input receipt。原始拒止不会在“恢复”中自动变成功 |
| `review-import-handoff-v3-b2.ts` | `proposeB2MaterialCandidates` | 只导出经输入确认的 `input-only-unapplied` 候选：archiveId、source manifest、文件原始 SHA、Subject/role、输入版本及确认回执 SHA。**非** C0 `SourceIdentity`、**非**受信 `ApplyMaterial` |
| `review-import-ledger-v3-b2.test.ts` | Bun | 逐文件初始化、坏目录不可改判、确认的 origin hash 与 Subject、版本冲突、同 requestId 相同内容幂等/不同内容拒止、重新认证可读、撤权和文件篡改拒止 |
| `review-import-handoff-v3-b2.test.ts` | Bun | 只有确认后的原件才可导出只读候选、跨重启保持 receipt/hash、无正式 Case ID/SourceIdentity、撤权不导出 |

**数据权威分层**：ZIP 物理原件 hash/manifest → 本地 B Source/InputLedger（候选输入意图）→ parser-verified `SourceIdentity` → C Main `ApplyMaterial(expectedRevision/requestId/payloadHash/principal)` 原子归属/SourceRegistry/回执。当前只实现链路前两段和候选交接；B 不得将导出的 `candidateVersionKey` 当成最终 `MaterialVersion` ID。

## 写入安全约束

- `archiveId` 只能由 `ReviewB2ArchiveVault.inspect(ctx,id)` 确认 owner+case+raw bytes hash+source manifest；不接受 renderer 的伪 origin metadata。
- 每条 `accepted` 必须授权 Main callback、正确 Subject/材料角色、独立条目 raw SHA；`skipped/rejected` 要明确原因；ZIP 原被拒绝或已经终态的项不可重新改判。
- 串行文件锁 `input.lock` + revision CAS + 请求体 hash，在同一 archive 上避免 double click/并发误写；副本重放返回同一 durable receipt，新 payload 同 requestId fail closed。
- 在自身 app 输入目录使用临时 `wx`、fsync、rename、文件校验摘要。虽然可抵御意外改版/一般损坏，这**不是**有密钥签名、不是针对本机 root 的不可抵赖审计。
- Source 输入记录能跨进程重读，但必须由新有效 Main owner/session 重新认证；旧 B2 grant token / staged candidate ID 不跨重启复活。
- 输入侧磁盘 WAL **不等于** C 正式 CaseStore；不删除旧 Plan/ReviewRun/ReadReceipt，不改变 current material validity，不进行真正审批。

## 与 Integrator-I/Dev-C 的端口边界

1. I 可在独立分支静态引入 `B2-INPUT-LEDGER` 和 `B2-INPUT-HANDOFF`，只做离线候选导入数据及回归；须锁新 B SHA 并通过新的 Gate O。**不能**把 SOURCE_ONLY 新增入口覆盖已通过 CI 的 B0 老切片。
2. C 的 Main IPC 持有 Native picker/drop/senderFrame/owner/policy/权限及物理字节 capability；用户确认 Subject/role 的操作必须由真实授权 caller 派生 `B2InputAuthority`，不能直接把 renderer `principalId/authorize` 传入 B。
3. 正式 `ApplyMaterial` 需要 C 实现独立的 trusted SourceIdentity/parseRevision/SourceRef 验证、current revision CAS、原件变动失效级联和 durable Case Receipt；此日志最多贡献 `input candidate`，不代行。
4. 恢复期间 ENOSPC/kill -9、多 PID、同时确认/撤权、软连接父目录绕过、Windows path ACL 和 100案/500文件负载仍需要目标机 E 验收；不要用 Bun 合成证明全链质量。

## 门禁矩阵

| Gate | 状态 | 最低实证 |
|---|---|---|
| O | `PENDING_FINAL_CI` | 固定当前 B HEAD 上 `bun run typecheck`、`bun run check:boundaries`、B2 ledger/handoff/zip 全负例和仓库 PR CI |
| E | `NOT_RUN` | 实际 Electron Picker/ZIP Office，进程崩溃恢复、跨窗口授权、目录 ACL |
| L | `BLOCKED_NO_AUTH` | 校方政策、真实身份、独立 Gold |
| P | `PARTIAL` | 50逐 Check 映射、第 51 套真实 UAT、100案500文件性能 |

## 离线核验命令

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-handoff-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts apps/electron/src/main/lib/review/review-zip-staging-v3-b2.test.ts apps/electron/src/main/lib/review/review-zip-intake-v3-b2.test.ts
```

**交接限制**：合并时仅凭本文件不视为源码验收，必须锁定实际提交 SHA、GitHub Actions 日志与首败，再由 C 同意正式 Main 接线。