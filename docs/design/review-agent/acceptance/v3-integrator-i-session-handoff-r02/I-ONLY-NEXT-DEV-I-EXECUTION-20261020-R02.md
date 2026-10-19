# CDUT Studio Review V3｜Dev-I 新会话执行清单 R02

> **I-ONLY / FOR NEXT INTEGRATOR-I SESSION ONLY.** 仅供新 Dev-I 恢复上下文，**Dev-A/B/C 无须阅读或维护**，非四线通行规则或新的 C 授权。完整工程/证据/来源/回滚详见本目录 [I-ONLY-SESSION-HANDOFF-20261020-R02.md](./I-ONLY-SESSION-HANDOFF-20261020-R02.md)，四线唯一共规仍为 [#145 ABCI](../v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)。

## 1. 当前确定的现场与职责

- 任务身份：`V3-INTEGRATOR-I-CONTINUATION-R02`。仓库 `Fuck-GH-Admin/cdut-studio-review-agent`，协调 PR #145、文档分支 `docs/v3-integrator-i-r01-taskbook`。I 是**真实跨线技术集成**，不是新架构研究或第二个 Dev-C。
- **最新由 C 精确签收的 I checkpoint**：[Draft PR #155](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/155) `d9ba4ba54293963f8d962182548a627d52b566a3`，C [正式 commit 25dbba28](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/25dbba28c2d9d1d88f4f2f68df42cb3e39f4478c) + [#144 回复 6279716043](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6279716043)，决议 `C-I4-A19-R01-FINAL-ENG-ACCEPT / YES_EXACT_SHA_SCOPED`。
- **已经新建/读回冻结父**：`integration/v3-i4-a19-accepted-frozen` → `d9ba4ba54293963f8d962182548a627d52b566a3`。之前 `integration/v3-i4-b18-accepted-frozen@a74d513f3c990fe4b87401380a2eade8677b2163`、`integration/v3-i4-a18-accepted-frozen@ec880cd6b5bc6779095fcbdddb143b1034d751c5`、I3 Stage3 `8e9f7caa...` 都已 C 签，不许修改。
- #155 final CI PR [39339440133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39339440133)、Baseline `39339440086`、D2 `39339440065` **3/3 success**，full Bun **4344 PASS /5 OS SKIP /0 FAIL**；四个精确授权 A R19-04 native SDK OS-PID/SIGKILL/late revoke/注入 EIO、ENOSPC 技术 worker/tests，没有已有 A/B/C 生产 hunk；不是真实外网 Provider/Electron Gate E。
- **不能自动导入下一来源**。C A19 签收不授权 A R19-05/06/07、B R19/R20/R23、新 C Main/Preload/Host/业务 writers。I Main lease `CONDITIONAL_NOT_ACTIVE`、业务 writer `DENIED`，E `NOT_RUN`、L `BLOCKED_NO_AUTH`、P `NOT_RUN`、Release `NO_GO`。所有历史工程 PR Draft、未合入 main。
- A 负责 SDK/Owner/Host 技术执行；B 负责模板与材料作者/解析/路由/来源；C 负责共享合同、可信 Main/IPC/Preload、Case/Plan/Run/学校发行者及最终安全裁决；I 只负责获准技术来源精确集成、I-owned 联合正反例、source lock、联合 CI 与 C 签收交付。

## 2. 新会话的第一批工作顺序

1. **恢复**：先完整读取本清单与同目录完整 R02 会话交接，再读 #145 最新唯一共同规范、`DECISIONS:C`、`STATUS:I` 与 C 最新 A19 决定；独立确认 #155 HEAD、frozen ref、3 CI、raw Bun 和 C 签名是否还一致。历史 I-only R01 的「pending」不要覆盖当前正式签署。
2. **来源只读预审**：核验候选技术切片，优先考虑 B20 当前可信候选原件/作者只读 bundle 与 C B20 Main 信任合同、或 C R06 Run-tombstone 与 A 跨进程恢复等真正有价值的跨线缺口。明确父 SHA、来源 PR 固定 SHA、每文件 blob、ABI/deps、可编辑/禁止 hunk、权限影响、真实/模拟边界、完整回归与 rollback。此处仅是建议，不能借建议自动导入代码。
3. **请求 C 新源码授权**：对选定切片向 [C PR #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144) 正式提出逐 blob scoped SOURCE CR，等待 [#145 `DECISIONS:C`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) 批复。若权限未获批，可继续只读分析、I-owned 不触生产的设计验证，但不得新 replay 未批准 A/B/C source；缺依赖标 `CONTRACT_BLOCKED`。
4. **实际开发**：获准后才从 `integration/v3-i4-a19-accepted-frozen` 派生一个新的隔离 Draft，机械 replay C 点名的 exact blobs，逐文件验证 source=target，补足 I-owned adapter/联合正反例、source lock、回滚报告。不要 whole-branch merge、不要改旧 accepted refs 或已签 #155 HEAD。
5. **完整独立 Gate O**：新 final exact SHA 冻结依赖、全 workspace TS、包边界/skin、Electron Main+Preload+Renderer 三端 build、全 Bun、PR CI+Baseline+D2；适用时核 D1/Batch。检查原始日志中新旧 A/B/C/I 正反例与平台 skips，失败保留原 SHA/log，修后全部重跑，不能借旧绿。
6. **新 C 工程签收**：新 Gate O PASS 后再向 C #144 发 exact-SHA 集成验收请求，明确来源锁/完整 diff/真实与模拟证据。只有 C 正式写 `DECISIONS:C` 的 scoped final engineering acceptance 才可建立新的 immutable accepted ref；未签仍保持 Draft。
7. **跨线进度**：`docs/v3-integrator-i-r01-taskbook` 的唯一共享协议只修改 `STATUS:I`，采用最新 blob SHA 乐观更新并验证其他所有字节不变；I-only 交接写本私有目录，不要求 Dev-A/B/C 阅读。不要擅自开启 Main writer、C physical Host receipt、学校 issuer、实机 E、产品 P、release。

## 3. 快速判断必须回答

- 你目前继承的是 **已签 A19 `d9ba4ba5...` 的精确 frozen 父**，不是 Dev-A/B/C 的最新移动 HEAD。
- 你将提给 C 的下一 SOURCE CR 有哪些具体 source paths、blob SHA、依赖、联合负例和回滚？权限若不足是否明确声明 `CONTRACT_BLOCKED`？
- 你是否完整区分 **source CR → 新组合 Gate O → C 精确工程签收 → immutable ref** 四个不同步骤？
- 即使 Bun 全绿，真实 E/L/P 和 Release 为何仍 NO_GO？是否始终拒绝 fake SSE/Renderer/B candidate 冒充 C physical Host 或业务 ACK？

**原则：用户希望足够大的真实工程批次、集中验收，但不允许为了赶进度降低安全或质量。下一会话从该已签冻结点继续开发，而不是重新走一轮 V3 历史考古。**
