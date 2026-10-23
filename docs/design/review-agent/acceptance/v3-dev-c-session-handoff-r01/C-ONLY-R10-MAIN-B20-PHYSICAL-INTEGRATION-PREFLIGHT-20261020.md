# Dev-C ONLY｜R10 B20 真来源 × 原生 Main 读取与 OS ZIP 重选集中工程（2026-10-20）

> Dev-C 专属阶段性工程证据，不要求 A/B/I 阅读或 ACK；这不是 Main/Writer 权限转授，也不是正式 Gate O、E、L 或 P 签收。R10 的最终正式签收只能以唯一最终 SHA 五个 CI workflow **completed/success**、所有最初失败记录和真实测试原文判断。

## 输入与固定来源

- C R09 上一已签精确绿锚点：`d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`。
- I5 新签 accepted immutable frozen：`integration/v3-i5-b20-accepted-frozen@a77a70b3a75da11728d99dba35717b18b02a5089`，在 C #144 comment 6283462332 精确签署。
- B R23 固定获批来源：`d96c3d176159cd12f4befd2a91bfeade44dca216`，批准 CR `CR-B20-R23-EXACT-SOURCE-INTEGRATION-R01`；C 的四个 immutable offline-reader modules 从旧 `d5a61304` 保全，不重复新建。
- 本 R10 C 分支最早固定源重放提交 `4efabb9a71640cb64ded5015d1b7720615d0d815`。21 个 B-owned R23 source/test 原字节 Git blob 写入 C R09 源树；从 C 最新 candidate 文件树逐 blob 与 I5 `I5-EXACT-SOURCE-LOCK.json` 比较，**25/25 C/I/B 来源 blob 相同**，无 B R24–R29 漂移。
- 当前 R10 代码修复检查点：`2cb8331b8fdff43da70a894ec597820595cb4d2d`，PR #144 Draft；相对 R09 共 28 路径：21 B-approved + 7 C-owned Main/Preload/shared/native source/test；未合入 main。

## 当前真实生产代码（不等于 App 启动后已安装合法授权）

- `review-v3-main-b20-physical-composition.ts`：真实 B1 保存/frozen 作者 + B2 staging/parser/ZIP ArchiveVault/InputLedger + B19 Check×target×object×Subject + B20 readCurrentCandidateBundle 的 Main 来源消费者；Main IPC 当前 signed Owner/Principal/session/window/frame + Owner generation/grant/epoch 每次读取重检；numeric senderId/frameId 从 event.sender.id 与 senderFrame.routingId **主进程原生取值**，C 字符串 authorityEpoch 转换成 Main-local 单调数字 epoch，而非简单 cast 或 Renderer 指定；双重读取后仍拒变更；只返回 candidate/display-only/publish false。
- `review-v3-main-b20-current-registry.ts`：C Main-local 候选注册账本（**纯 process ephemeral，非第二 Case/SourceLedger/ZIP Vault**），require 实际当前 Main authenticated owner source；Main 侧 register 必须读取真实 B1 最新版、原已冻结 fingerprint、B2 staged 材料及 B19 selection frozen-binding membership，撤权或冷 Main PID 清空；若未有真实 current Main owner source，保持 default-deny。
- `review-v3-main-native-archive-registry.ts`：C Main OS 真实文件选择与 inode/sha 复验之外新增 `pickForBVault`，重新选择 ZIP 后将当前 B2 archived checkpoint 的已签 `physicalArchiveKeyDigest` 与 Main-only 私密原件 key 双重核对，不允许猜测旧随机 key 作 B19 凭据。
- shared `B20_NATIVE_REPICK_V3` + Preload `repickCurrentB20ArchiveV3(templateId,archiveId)` + Main `handleCMainB20NativeArchiveRepick`：Renderer 只可传两个 ID；Main 再核对 current Candidate/Owner/pin/真实 B19 selections/B Vault 原件后才调用 OS native picker，路径/key/学校签发者不经 Renderer；返回仅 candidate-only 技术选档状态。
- `review-v3-main-b20-physical-composition.test.ts`：真实 GitHub Action 中注册的 Main IPC 与真实 B1/B2 ZIP file bytes/CRC、InputLedger/Parser、C Native original key 的联合正反例，包含 Main 多次读取、物理原件替换、冷 Main 未重选、权限撤销、作者保存版变化、错误来源和数字 epoch 换代。没有学校发布者或凭空 Host/Run receipt。

## 首败、修复与当前门禁（不得假装全绿）

- 源码重放后 R10 初始 TS TypeScript 首败：`51ec1e5a...` workflow `39373928081` 中 Main numeric possibly undefined 和 interface readonly method 修复；源码持续开发导致后续旧 CI cancelled/过时，不作为 Gate O。
- 最新较早 `5ff2f8bc5ddc849d84b0e18e0965bcdd3129bf5e` PR CI `39375295755` TS/build 全绿、Bun 4268 pass/5 skip/5 fail (4278 tests/494 files)：五个新 R10 测试夹具把 C Main identity 通过 JSON key 插入顺序比较，导致真实 Principal 误判 revoked；下一提交 `2cb8331b...` 将 C 原生主进程身份 Principal/session/window/frame/candidate/Owner/generation/epoch 改为逐字段比较，生产仍 fail closed，不降低授权。所有红结果保留。
- 当前精确 R10 HEAD `2cb8331b...` workflow：PR `39375717913`、Baseline `39375717996`、Batch `39375717997`、D1 `39375717977`、D2 `39375717988`。截至本文件撰写，后四项已绿，PR CI 尚在运行；**不能签收为 Gate O PASS**，需要查看 full Bun 原始日志后正式 C 裁决。

## 最重要仍未完成的产品义务

- **真正 App Main 的可信 Owner/Principal 提供方与物理 Intake 生命周期**尚未完成实际生产安装；当前已有可安装组件和真实注册 IPC，CI 路径使用隔离的授权 host fixture 进行 OS 文件正反验证。不能把可安装源码误写成 App 生产场景已经持有有效 Main 身份。
- 需要 Gate E 真 Electron 用户：用户材料→已认证 Main physical re-pick→B Vault/input original→B19/B20 current preview 的 OS 实际动作及重启负例。仅 Bun IPC mocked Electron/GitHub CI 不等于 Gate E。
- 真学校 Publisher/Gold Gate L 缺授权，正式业务 Case/Plan/Run/Decision/Batch/Outbox 尚不可从 B candidate 直接写；I Main lease/Writer 权限不因本轮改变。
- R11 A Pi→C Host/Run、R12 C3/C4、R13 V3 工作台/迁移、R14 综合恢复、E/P 后续按 C 产品收口裁决实施；绝不将 R10 candidate-only source preview 视为发布许可证。

继续 PR Draft/no merge，E NOT_RUN / L BLOCKED_NO_AUTH / P NOT_RUN / Release NO_GO。后续更新由 C 单独签精确最终 SHA，不修改本文件无须 A/B/I ACK。
