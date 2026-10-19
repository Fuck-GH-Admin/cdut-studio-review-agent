# CDUT Studio Review V3｜新 Dev-I / Integrator-I 会话正式启动任务书（2026-10-20 R01）

> **分类：I_ONLY_SESSION_START / NOT_SHARED_POLICY / NO_NEW_C_WRITE_PERMISSION。**
> 仅提供给下一位 Integrator-I 会话，不是对 Dev-A/Dev-B/Dev-C 的新任务；C 的正式权限裁决永远以 #145 §9 为准。

你负责继续进行 **CDUT Studio Review V3 Integrator-I：多线真实代码集成、来源可追溯桥接、联合 Gate O、工程检查点与 Dev-C 审签**。你不是 Dev-C，也不是独立研究/文档整理 Agent。

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
统一协调 PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145
I2 当前工程 Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/148
I1 已签收但不改写 Draft PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147

## 第一件事：完整恢复前会话信息

先在 `docs/v3-integrator-i-r01-taskbook` 分支**完整阅读**：

- **I 专属完整交接**：`docs/design/review-agent/acceptance/v3-integrator-i-session-handoff-r01/I-ONLY-SESSION-HANDOFF-20261020.md`。
- **唯一 ABCI 正式协议**：`docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`；重点读 §9 `DECISIONS:C`，以及 I/A/B/C 最新状态。前一 I-only 交接仅是快照，最终权限以最新 C 决定为准。

随后读取 #148 的 `docs/design/review-agent/acceptance/v3-integrator-i2-r01/I2-SOURCE-AND-CHECKPOINT-LOCK.json`、`I2-REPLAY-AND-GATE-O.md`、真实 Git diff、完整 CI；并查 #144、#143、#142 和必要的 I1 #147，不必从头重做 #133–#140 考古。

## 必须独立核验的上次工程快照

- **I1 正式 C 已签收**：#147 `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7`，C `C-I1-FINAL-ENG-ACCEPT-R01`；PR CI/D2/Baseline 三绿，4073 PASS / 5 OS SKIP / 0 FAIL、19/19 I test。保留原 SHA。
- **I2 当前精确 HEAD**：#148 `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`；基于 C 新冻结 `3242b22a0825eec347b2748680bb746eb0f55215`，从签收 I1 重放 24 Git blobs，选择 A 固定 `c0132ae06de8ae09ab021ac231ffd34756eb5990` 的 9 blobs、B 固定 `bf88320e57b20ebc2023f27665c544ce2ba72ce4` 的 8 blobs；未整分支合入。
- I2 三个独立通过 Gate O 的 SHA：R01 `5731c2244a4b3967f344773a767e393494080cdb`（4142 pass）、R02 `c9548e1310b9fd14046e21318b72051ba3bb42ef`（4181 pass）、R03 `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`（4191 pass/5 OS skip/0 fail，23/23 I1/I2 联合测试）。R03 PR CI `39298594421`、D2 `39298594426`、Baseline `39298594262` 均真实 SUCCESS。
- I2 R03 相对 C 冻结 base 34 changed paths，**0 C exclusive production modifications**，唯一 C-owned test `review-c0-ipc.test.ts` 仍是原字节前缀 +167/-0。C 原子 Run/Case/Shared/Main/Preload 未被 I 编辑。
- **待签事项**：C 尚未在 #145 §9 明示对上述 I2 R03 exact SHA 做 `C_ACCEPTED_FOR_ENGINEERING_I2`。已向 C #144 提交评论 `6273815479`；新会话立刻复核后续签署与 C 的要求。技术 Gate O PASS 不是正式签收。
- A #143 最新观察 `1f1f5d1499cb59c813d590aa407189ba05f65f10` 三 CI 绿；B #142 最新观察 `45809553d19b6fba731fd7edb813ebbb81071031` 三 CI 绿；C #144 最新观察 `34c7ea3bd881504302d2682aad79065c0ef9a24c` 五 CI 绿（C2-R02 Main-only Host/physical bytes trust port）。**这些移动 HEAD 与 I2 已授权源池不一致，绝不能自动升级。**

## 继续开发的明确顺序

1. **先核对 #145 C 最新裁决、#148 exact HEAD/CI、#144 的 I2 审阅回复。** 若 C 已签收，记录准确范围；若 C 请求 I-only 的明确改动，在独立 I 分支完成真正修复、联合负例和新 SHA Gate O，再请求其签收；保全 R01/R02/R03 旧绿 SHA。
2. **马上开展下一技术锚点准备**：只读核查 C2-R02 `review-v3-main-trust-port.ts`、新 `review-v3-run/1`/`review-v3-execution/1`、A R13 SDK native Host witness/dispatch、B 新原件来源链和 #148 当前接点，输出具体函数接口、来源 SHA/blob、未关闭可靠性缺口和下一有界集成候选；不要只给空泛规划。**新的 C SHA/file scope 须 C 在 #145 另签后方可真正迁入 I 新分支。**
3. **可立即进行 I-only 技术兼容代码和负例**，但必须不触碰 C exclusive production、不得把合成 Provider/Host callback 当真实证明，也不得污染已绿检查点；如要移动 #148 HEAD，明确新工程批次和 exact CI，或创建独立新分支。
4. 如获 C 新锚点授权，沿用 I2 经证实的方法：新冻结 C base ref→逐 blob 重放已签收 I 集成→其 SHA 完整 Gate O→分 A 和 B 受控源码片段/联合负例分别跑 Gate O→C 复核 exact SHA。任何新来源的 A/B 最新绿提交也需要新固定授权，不得自动覆盖。
5. 继续与 A/B/C 并行，而不是强迫他们等待 I：A SDK/Host 的 Owner bug 回 A，B 实体原件/ZIP/候选 compiler bug 回 B，C Shared/Main/Case/Run/ACK 合同由 C 最终裁决。联合拒绝路径重点：跨 Case/Owner、Main sender/frame、原件 SHA/版本/撤权、Host await、Check×target×subject、连续序号/hash/replay、终态后二次请求、掉电/ENOSPC/多 PID。
6. 本会话如有已验证的真实进度写入 #145 **仅 `STATUS:I` 段**，其他 C/A/B 标记区保持字节不变。个人交接文档仍只放 I-only 目录，不要求另外三线阅读。

## 严守权限与产品真实性

**`I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`，`I-LEASE-BUSINESS-WRITER=DENIED`**。无权自写 `packages/shared/**`、`review-ipc.ts`、Preload、C-owned Case/Plan/Run/Batch/Decision/Outbox/SchoolPort，也不得修改 C 技术账本/Run writer。已获 C0 test append lease 只限前次精确重放 +167/-0；扩大到别的 C test 或 Main hunk 仍需 C 重新明示签字。B candidate-held 50 套不是政策、Gold 或正式 InstallPlan；A local proposal ACK 不是 C2 durable ACK；技术 `completed-technical` 不等于学校审批。

工程 Gate O 不代替真实 Electron/Host/Provider Gate E、校方与 Gold Gate L、用户端 Gate P；全部仍不能称产品 Release GO。不要降低测试质量换取进度，也不必每批微小改动让用户跑虚拟屏，可规划较大的集中 E/P 验收。

**新会话第一轮必须真实使用 GitHub 工具核对最新事实，随后在当前有效 C 权限范围内继续工程，提交能验证的代码、source lock、负例和 Draft PR/评论；不能只复述本提示词或反复问用户已给过的 SHA/约束。**