# Dev-B B2-R06｜持久 ZIP 恢复策略锁、跨进程容量互斥与故障隔离

**任务线**：`V3-DEV-B-R01`；PR #142 `feat/v3-dev-b-template-intake-r01`；上游 C0 `review-c0/1` 不变。本文记录实际提交的 B-owned 变更、测试设计、Gate O/E/L/P 边界。文中“新增测试”均指**提交的可执行测试**，未经精确 SHA CI 成功不得宣称 PASS。

## 发现的缺陷与不变量

### 1. 同一历史 ZIP 可以用不同解码配置重试

- R05 `review-b2-archive/2` 虽持久化了最初的 `decodeLimits`，但 `saveAndStage(ctx,input,newLimits)` 复用已经存在的 `archiveId` 时，只对整包 raw SHA 做重试检查，随后又将**新调用的 limits**传给 `stageReviewB2TrustedZip`。于是旧 checkpoint `rejected` 子文件可能在重试预览中变成 `needs-user-confirmation`，两份来源状态矛盾。
- R06 在**任何重新暂存之前**核对历史 `decodeLimits` 与新调用的**实际生效配置**（默认 archive/entry/total/entries/ratio 均规范展开）；不一致一律 `B2_ARCHIVE_DECODE_PROFILE_CONFLICT`。等价写法（空对象与显式默认值）可合法重放，避免伪冲突。
- 老 `review-b2-archive/1` **没有**持久化完整解码限额，原则上允许 read-only `inspect/prepareRestage` 提供原字节以供 Main 再核，但**拒绝对旧 archiveId 直接 `saveAndStage`**：`B2_ARCHIVE_LEGACY_PROFILE_UNPINNED`。这是显式的迁移阻断，不应自动推断历史策略或把旧候选升格为已审核材料。

### 2. 容量检查和 ZIP 原件写入不是一项跨进程原子动作

- 原来对新 ZIP 的 `usedBytes() + newBytes <= 1GiB` 检查发生在每个归档自己的 `write.lock` 之前。两个不同 archiveId、不同进程可以分别看到相同剩余额度，然后都写入。
- R06 `withCapacityLock` 使用**同一归档根目录**的 `capacity.lock` + `openSync(wx,0600)` 原子独占机制，持有期间完成重新确认、容量核对、归档原件/manifest 的原子重命名、受信 staging 输出。
- 遇到另一个写者或遗留锁一律 `B2_ARCHIVE_CAPACITY_LOCKED`，无权限/磁盘错误为 `B2_ARCHIVE_CAPACITY_LOCK_UNAVAILABLE`，不在业务层自作主张移除别人的锁。保留当前失败 `RECOVERY_REQUIRED` 语义：有 ZIP 但无 manifest 时拒绝再次“保存成功”。禁用根 symlink 写入。
- 文件锁只约束**采用相同目录/本模块写路径**的进程。独立测试中的 `capacity.lock` 代表竞争 PID，但**不等于真实两个 Electron 进程并发压测**；不同主机共享网络文件系统的 `O_EXCL` 语义、断电/ENOSPC/OS 目录 fsync 要在 Gate E 独立验证。

## 精确代码、正反例

生产文件：
- `apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.ts`

Bun 文件：
- `apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts`

在历史恢复、ZIP bytes/CRC、owner/revoke/Root symlink 既有测试之上，本轮增加：

1. strict `maxEntryBytes=3` 导致子文件 rejected；同 ZIP、同 request/physical identity 用默认/宽松配置重放必须拒止；旧回执不变；用原 strict limits 重放成立。
2. 显式五个默认限额与未传 limits 的规范配置等价，幂等候选状态不变。
3. 模拟另一个 PID 已持有 `capacity.lock`，所有新档写入拒止，锁所有权不被破坏；解除外部锁后同一请求恢复合法导入。
4. 构造历史 `/1` 记录，manifest SHA 重新计算但解码策略缺失：可只读审查，不能在旧 archiveId 直接自动重暂存。
5. 删除已持久化 checkpoint、留下归档 ZIP（模拟崩溃时序），必须 `RECOVERY_REQUIRED`、保留字节且释放自己持有的根锁。
6. 根目录符号链接拒止，不读取外部目标。

## 验收命令及必须归档的证据

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts
bun test apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-handoff-v3-b2.test.ts apps/electron/src/main/lib/review/review-b2-office-zip-subject-v3.test.ts apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.test.ts
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
```

**Gate O**：只有本批精确 SHA 的 PR CI + Baseline + D2 全部完成、targeted tests + typecheck/boundaries/build 零 fail 才可签 PASS；GitHub Actions 若长时间排队应如实标 `QUEUED/BLOCKED_INFRA`，不能把没有跑的用例记作 PASS。

**Gate E（仍需在目标机集中执行）**：真正双 PID 各生成多档并并发写入限额边缘，记录成功数、总字节、完整回执、lock 不丢；强制 kill/断电/ENOSPC；外部符号链接/硬链接；真实 Office71/100案500文件；Main session 重新认证与物理 picker/drop；Windows/Linux 权限表现。必须证明恢复不会自动升级为 C 正式材料。

**Gate L**：`BLOCKED_NO_AUTH`；无校方签发政策、SchoolPort ACL 与独立 Gold。
**Gate P**：`PARTIAL`；第 51 套无代码真人 UAT、正式工作台接线未完成，50 candidate-held、G01 34 scope UNKNOWN、38 套原文未核验。

## 四线隔离和交接

- `B-CR-001=APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`；只变更 B-owned ZIP vault + tests/文档；未修改共享 DTO、C IPC/Preload/CurrentCase/ApplyMaterial/InstallPlan/Run。
- I1 原绿 B 来源固定 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，本批不得直接热替换。I 需等新 Gate O 证据并固定后续 B slice，再由 C 按协议独立签工程集成。
- 后续 B2 候选工作：读/写锁碰撞诊断、失效锁人工恢复协议、原文多进程实机压测。安全审计不得把普通 SHA256 当本地恶意写者的签名证明。
