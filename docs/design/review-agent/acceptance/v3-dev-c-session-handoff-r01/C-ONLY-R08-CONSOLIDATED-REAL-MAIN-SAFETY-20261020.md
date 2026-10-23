# C-ONLY R08｜真实 Main 人工观察与 ZIP 实体选档、I5/A20 裁决集中交接（2026-10-20）

> 本文仅供 Dev-C 与用户；A/B/I 不需要阅读或 ACK。唯一约束性的 ABCI 规则和 DECISIONS:C/STATUS:C 仍在 #145 同一统一文件。本报告不是新增共享协议、授权租约或学校发布者。

## 完整固定工程状态

- 仓库 `Fuck-GH-Admin/cdut-studio-review-agent`；C Draft PR #144 `feat/v3-dev-c-business-r01`；上一已签 C R07 `fd88be3ea33fe60ca992af3640d77ecc36f015bb`。
- 本 R08 最新**正式 C 精确工程签收 SHA** `e4881d28129445f893915d95b0d3c7bead2cfb79`。上一版本 compare ahead 7 / behind 0，仅六条 C-exclusive paths：修改 `review-v3-main-author-plan-ipc.ts`、`review-v3-main-removal-consent.ts`；新增 `review-v3-main-native-removal-observer.ts`、对应测试、`review-v3-main-native-archive-registry.ts`、对应测试。
- 签收公告：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6280814238
- 精确同 SHA 5/5 completed success：PR CI https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39350255610 job `118392508254`，workspace TypeScript/packages/skin/Main+Preload+Renderer build 全 PASS、Bun **4176 PASS/5 SKIP/0 FAIL，482 files/4181 tests**；Baseline `39350255452`、Batch `39350255667`、D1 `39350255395`、D2 `39350255430` 全绿。新 Native Human 5/5，Native ZIP 5/5。
- 首败留档：`d8bb04454704be4bf8378fa59bbb3ebb94657c38` PR `39349446004` 的 TS2322/TS18048，修复 `1998a93106c6ce3c58d4bb290144dcff17aeef20`；此中间 SHA PR `39349825570` Bun 4175/5/1，失败仅来自测试行误把 getter 包成函数后断言 toBeUndefined，`e4881d28` 只修测试并最终全部重验。没有生产安全门禁放宽。

## R08 实际 C 生产代码

### 原生人工确认观察
- 真实 `handleCMainUpgradeCanonicalPlan` 在已有 serial C Case CAS、真实当前 Principal/Owner/current issuer 复验后，调用可选 Main-owned `removalConsentSource.observeAtCommit`。要求真实 Main 提供 `CMainNativeRemovalObserver`。
- 可创建真实 Electron `dialog.showMessageBoxSync` 原生确认弹窗，显示**完整** Check×target×object×subject×sourceVersionSet 列表、老/新 Plan 指纹、Case/owner/当前修订/确认理由；过长不截断，直接拒绝；取消不产生 approval。批准生成独立 Main UUID、严格当前 epoch/revision/request scope、一次性用 C gate 在 CAS 内消费。测试已有 5 类正反例。
- **尚未在真实 Main composition 安装学校 publishedPlanSource 或真实 observer**。原生代码能够用，但不得称 Gate E 实机完成/可供普通用户合法发布。依然无学校授权则删除正式 Check DENY。

### 原生 ZIP 文件选择与物理重验
- `CMainNativeArchiveRegistry` 是 Main-only ephemeral OS capability，`createCMainElectronNativeArchiveChooser` 通过真实 OS native picker 单文件选择 ZIP；每次从文件 descriptor 重读原始字节、SHA256、设备号/inode、类型/link count/realpath，禁止符号链接、硬链接、换原件、相同 sha 但不同 inode、跨 Principal/frame/Owner/generation、冷启动复用。
- 必须额外安装真实可信的 C Main `currentScope()` 和 B Vault current `assertCurrentArchive`；返回私有物理 key 仅供 Main 使用。**它不是第二份 ZIP Vault、B2 staging、InputLedger 或已安装真实 B19/B20**；没有实现 C Main 选档→B Vault 映射，不得谎称来源全链成立。OS Gate E 尚未实测，Windows/macOS 文件描述符行为需跨系统验证。

## 同轮 C 正式跨线裁决

- I I5 S1+S2 [#144 comment 6280485665](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6280485665)，在 #145 DECISIONS:C 精确生效：
  - S1 仅固定 B R23 `d96c3d176159cd12f4beade44dca216` 11 生产 blobs +至多10规定测试，B1/B2旧来源路径有实际版本差异，须完整审计替换；
  - S2 唯一一次性 immutable C-only 4 file copy lease `C-I5-S2-IMMUTABLE-B20-READ-R01` from C `d5a61304...`，仅离线不修改，且已经与当前 C R07 四 blob 逐一同一确认。
  - I 新 Draft #156 `[V3 Integrator-I I5]` 正在开展，只是 SOURCE-ONLY 候选，绝不自动通过 Gate O，也不是生产 Main/Case 接线或 C 工程签收；I 需完整联合测试/新 exact CI/另外向 C 申请签署。先前 I #155 `d9ba4ba54293963f8d962182548a627d52b566a3` 仍是已签冻结父，不得改动。
- A R20 Operator Recovery [#144 comment 6280695461](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6280695461)：A-only source `e8eec841b2ab13f3f2c59bbb8c357fd4a26389ec` 3/3 green，只读证据技术可用；C owns new future readonly seam，**NO** A/I source import without new specific CR，**NO** Main lock takeover、automatic unlink、Host physical ACK、Provider replay；空白 lock 不能证明原 PID。
- I Main lease `CONDITIONAL_NOT_ACTIVE`、Business Writer `DENIED`；A/B/I latest moving source does NOT amend fixed C decisions.

## 下一集中工程批次（优先，不做重复研究）

1. **C Main B20 physical compose**：等 I #156 new exact Gate O + C signature 后，沿 approved source trace，将原生 C Main Principal/session/senderFrame/Owner/grant/epoch、当前 candidate/template pin、B1 latest revision digest/frozen descriptor、B2 raw ZIP physical picker、B19 source selection registry 与真正 B20 facade 组合。特别要修 Main string epoch 与 B20 numeric epoch 的安全映射；不能来自 Renderer 构造。实际可调用 Renderer Read but schoolIssuer=false。
2. **C native observer integration**：在真实 Main lifecycle 组合安装 observed consent source，学校发布接口在无真实学校文件时继续 BLOCKED，先让真实 Main 打开实际人工确认 modal 的 OS Gate E 做 negative coverage；与正式 Case CAS 的版本竞争/Owner 撤权联测。
3. **C Run durable Host fence**：既有 C R06 tombstone 只在进程内，需放到正式 Case/Run durable CAS，跨 PID 旧 Owner late Host/read receipt、Run/manifest/源 bytes、锁和事务 fail closed；A R20 readonly rescue 不代表可写恢复。
4. **工作台+批量/迁移+E/P集中验收**：不可只做 Demo/最小闭环。真实 OS 主流程、五位真实用户各 30min 和独立学校 L 授权之前全部 Draft / NO_GO。

完整发布仍：Gate E NOT_RUN、L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO。不得根据已绿单模块推测 V3 总体完成百分比。
