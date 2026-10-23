# Dev-C ONLY｜R09 Run/Host 持久围栏集中工程与 I5 来源签收（2026-10-20）

> 仅 Dev-C / 用户阅读。A/B/I 无须阅读或 ACK；唯一跨线正式规则与裁决仍是 #145 ABCI-UNIFIED-COORDINATION-AND-STATUS.md 的 DECISIONS:C 和 STATUS:C。本文不新增跨线写权限、不假冒真实学校发布者。

## 固定工程与来源

- 仓库 `Fuck-GH-Admin/cdut-studio-review-agent`，C 独立 `feat/v3-dev-c-business-r01` Draft PR #144。
- C R08 上一全绿回滚源 `e4881d28129445f893915d95b0d3c7bead2cfb79`。
- **C R09 已正式 exact Gate O 签收 `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`**（ahead 5 / behind 0，九个 C-owned 路径，0 A/B/I 生产越权）。
- 签收公告 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283530674
- 精确 CI 5/5 SUCCESS：PR CI https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39370432302 job `118456844078`，workspace TypeScript、包边界、skin、Electron Main/Preload/Renderer build，**Bun 4180 PASS/5 OS SKIP/0 FAIL、4185 tests across 483 files**；Baseline `39370432678`，Batch `39370432333`，D1 `39370432327`，D2 `39370432294` 均 SUCCESS。R09 专项真实独立 Bun OS PID 测试 4/4 PASS。
- 首败真实存档：`28fca41d523eaef463b93027b2193a70e2f12e1d` PR `39369741413` TypeScript worker 不合法 `caseId&&readAggregate` union；`b4090795036e6ddb5bc954d5f14e89df4b5cc9f9` PR `39369912840` Bun 4179/5/1，仅负例错误地要求特定 "corrupt" 文案，但生产前置鉴权拒绝缺少唯一 Case Receipt，`d7548c3e` 仅修测试语义断言，生产不松门禁，重验 5/5 PASS。

## R09 九个改动源实际结构

- 新 C-owned `review-v3-durable-host-fence.ts` 和 `.test.ts`、独立 `.worker.ts`。
- `packages/shared/src/types/review-v2-contracts.ts` 只新增 C Main 永久 Run-wide `v3HostRunFences` 可选字段，并持久写回 **同一案卷 Case Aggregate** `state.v2.json`。
- `case-store-v2::submitCommand` 执行 `FenceV3HostRun`，走已有单案进程级队列 + C-TX OS 物理锁 + CAS/Receipt 原子落盘，不是 A SDK outbox/第二 Host Journal。需要显式 C Main 授权回调，必须指向已登记原始 Run exact identity，写入唯一 `requestId`、`Actor`、reason、完整 Run、时间及对应唯一可信 Case Receipt payloadHash，损坏/无 Receipt 全面拒绝。超过 4096 条拒绝、不会移除历史 fence。多次重复命令按原 Case idempotency，冲突拒绝。
- `review-v3-main-host-receipt-registry.ts` 新增 C trusted assembly 安装的持久查询（普通老技术 fixture 单独保持进程本地）；实际 `C2MainTrustedExecutionAssembly` 将 `isC2RunDurablyFenced` 注入其 registry，旧 Run ID 的晚到物理 Host 回执禁止注册/再读。
- `review-v3-technical-ledger.ts` 在 CAS 内运行准入、事件记录，`review-v3-run-writer.ts` 在正式封存前检查 Run-wide 持久 fence，且新增属性本身不被忽略为“普通技术日志”，从而不会因 Host revoke 继续接受旧冻结输入。
- `review-v3-main-trusted-assembly.ts` 新增 `invalidateRunDurably(...)`：Case CAS 持久围栏成功 **之后** 同步本进程 tombstone；没有 C Main trusted authorization 不能代发；不许系统自动清死 PID/write-lock、用 A SDK transport receipt 当 Host 物理 ACK、自动 Provider 重试或重新解释学校政策。
- `review-v3-main-author-plan-ipc.ts` 新增 `installCMainV3NativePlanUpgradeAuthorities` 把先前的真实 Electron OS native human delete dialog 与现有真正的 C authorized Plan publisher/Owner principal/source 联合安装生命周期，但 **不伪造正式 issuer**，学校来源未装 => 功能 fail closed。

## 同批 I5 正式来源集成裁决

- 新 I5 独立 Draft PR #156 最终 `a77a70b3a75da11728d99dba35717b18b02a5089`，先前 C 签冻结 I A19 父 `d9ba4ba54293963f8d962182548a627d52b566a3`（#155 永不覆盖）。
- C 批复 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283462332；#145 正式 `C-I5-B20-R23-CMAIN-OFFLINE-R01-FINAL-ENG-ACCEPT`，**仅技术组合 `YES_EXACT_SHA_SCOPED_WITH_DECLARED_UNRELATED_RETRY`**。
- 已独立 GitHub 三树（固定 B R23 `d96c3d176159cd12f4befd2a91bfeade44dca216`、C `d5a61304ddb09c38fea7982623786f0ce56ed220`、I 最新）逐 blob 检查 **25/25 exact source=target**，四条 immutable C B20/author read 模块及测试未改，B1 vault 和 B2 staging 两旧有源已合法精确替换；git compare ahead 4/behind 0、25 路径，其中 4 I-only。
- I5 同 SHA PR 39351598015 **attempt2** all Bun 4439 PASS/5 SKIP/0 FAIL（510 files），I5 10/10 real ZIP/B19/B20/offline child PID PASS，D2/Baseline SUCCESS；但 **attempt1 4438/5/1** 未改 `goal-session-service.test.ts:138` 固定 15ms 异步偶发测试失败保留作为可靠性债，不冒充 first try green。
- 只允许 I 创建 exact signed I5 frozen 新 ref；I Main lease 未激活，Writer DENIED；不能因为 I5 技术证明便认为 C Electron Main 物理来源已装配、School published policy 或物理 Host ACK 已存在。

## 下一批次 R10：主线真实运行装配 — 一批写完集中测试

1. 固定新 I5 accepted SHA 和全部来源 blob，C OWNED 分支内精确 replay 11 B R23 生产依赖+必要 tests 到真正 C Main 业务树（仅用同一作者 Vault/B2 ZIP Vault/ledger/parser/Check来源，不复制 storage）。先验 I 接受冻结父完整 CI；运行时实际依赖构造不得使用 I offline fixture。
2. C-owned 独立可信 Electron Main Principal/session/window/frame/Owner/grant/epoch 和官方 CurrentCandidate registry；B20 数值 `senderId/frameId/authorityEpoch` 与 C 字符串身份需要**真实 Main 显式验证映射**，严禁 cast/Renderer 声明、跨 Case；本机 Local Principal 不等于正式学校发布者。
3. 把 C 原生 ZIP picker 真实物理 inode/sha/key 与 B ArchiveVault 原件、B19 selection 注册、B1 frozen/author 版及 B20 producer 挂到 `installCMainV3B20ReadAuthorities`，再向已经存在的真实 Preload IPC 只读接口提供 current candidate-only preview；不允许发布或改 Case。
4. 后续与正式 Case/Plan/Run/Host durable fence、人工观察器和产品工作台合并一个实际 Electron Gate E。继续保留 Gate L school authorization BLOCKED，Gate P NOT_RUN，Release NO_GO。严格区分已完成代码与未执行实际 OS 测试；学校正式 issuer 绝不自行生成。

此文件 C-only，不要求 A/B/I 阅读 ACK。所有历史签绿 SHA 均不改、不合并 main。
