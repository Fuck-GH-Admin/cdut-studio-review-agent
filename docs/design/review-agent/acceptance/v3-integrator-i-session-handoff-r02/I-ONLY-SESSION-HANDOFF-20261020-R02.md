# CDUT Studio Review V3｜Integrator-I 专属会话工程交接 R02（2026-10-20）

> **I-ONLY / DEV-I SESSION HANDOFF — NOT REQUIRED FOR A/B/C.** 本文仅供下一 Integrator-I 会话恢复工作现场；Dev-A、Dev-B、Dev-C 无须阅读或维护。本文不取代共同协调规范、无新权限授权、不代表 C 业务裁决。四线唯一共同规则仍是 [#145 ABCI](../v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)。遇到冲突，以最新 `DECISIONS:C`、实际 exact Git SHA 与 GitHub CI 为准。该 R02 替代过时的 I-only R01 快照。

## 0. 最新结论，切勿沿用旧 pending

- **最新 C 正式签收检查点**：I4 A19 [Draft #155](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/155) 的精确 SHA `d9ba4ba54293963f8d962182548a627d52b566a3`。
- C 决议 `C-I4-A19-R01-FINAL-ENG-ACCEPT / C_ACCEPTED_FOR_ENGINEERING_I4_A19=YES_EXACT_SHA_SCOPED`，权威 [#145 签署 commit 25dbba28c2d9d1d88f4f2f68df42cb3e39f4478c](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/25dbba28c2d9d1d88f4f2f68df42cb3e39f4478c)，C [#144 回复 6279716043](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6279716043)。旧 `STATUS:I` 写的 A19 pending 是**历史状态**，不是最新结论。
- **I 已新建并通过 GitHub ref 读回核验**：`integration/v3-i4-a19-accepted-frozen` → `d9ba4ba54293963f8d962182548a627d52b566a3`。这是最新不可变接受锚点；#155 保持 Draft、未合并、未改 HEAD。
- A19 全新精确 SHA Gate O **3/3 success**：PR CI [39339440133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39339440133)（job `118357162793`，frozen install、TypeScript、boundaries、skin、Electron Main/Preload/Renderer 三端 build、Bun **4344 PASS/5 OS SKIP/0 FAIL，4349 tests/500 files**）；Baseline [39339440086](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39339440086)、D2 [39339440065](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39339440065) success。
- **下一独立来源批次还没有新 CR 授权**。A19 本次签收仅对固定四个 A R19-04 `test/worker` source blob，不允许自动引入 A R19-05/06/07、B R19/R20/R23、C #144 Main 最新代码。

## 1. 职责及权限

- 仓库 `Fuck-GH-Admin/cdut-studio-review-agent`；共同协调 PR [#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)；分支 `docs/v3-integrator-i-r01-taskbook`；唯一共同文档路径 `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`。
- **Dev-A #143**：Pi SDK/Owner/grant、执行、Provider HTTP/SSE、崩溃和跨进程恢复。**Dev-B #142**：模板 50 套、作者/规则、实体材料 staging/解析/ZIP、路由、候选源、51st 候选（不是正式学校模板）。**Dev-C #144**：共享合同、可信 Main/IPC/Preload、Principal/Owner/Host、Case/Plan/Run 与 ACK/CAS/Publisher 业务唯一权威和最终裁决。**Integrator-I**：按 C 授权逐文件精确来源重放，I-owned adapters/跨线负例、source-lock、隔离 Checkpoint、完整新组合 Gate O、向 C 请求工程签收；不是第二个 Dev-C，也不指挥 A/B/C。
- I Main `I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`，业务 Writer `DENIED`。不得改 `packages/shared/**`、`review-ipc.ts`、Preload、C Case/Plan/Run/Host/SchoolPort/Decision/Outbox 生产或 C 测试；历史 I1/I2 特许 `review-c0-ipc.test.ts` 只属于已签提交，不授予当前继续编辑权限。
- E 正式 Electron 实机 `NOT_RUN`，L 学校政策 `BLOCKED_NO_AUTH`，P 非开发者产品 `NOT_RUN`，Release `NO_GO`。假 HTTPS/SSE、B candidate、A request ID、测试注册的 Host/Owner 不能冒称 C 独立物理 Host Read/Check/terminal、正式 Run ACK 或学校发布。
- #145 只允许 I 编辑 `<!-- BEGIN:STATUS:I -->` 和 `<!-- END:STATUS:I -->` 之间文本；采用最新文件 blob SHA 的乐观并发更新，逐字保证 I 区之外完全不变。C `DECISIONS:C` 及 C STATUS 等只有其所有者编辑。

## 2. 已签历史链及不可变 refs

| I 阶段 | Draft PR | C 签精确 HEAD | 全 Bun PASS / skip / FAIL |
| --- | --- | --- | --- |
| I1 | [#147](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/147) | `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7` | 4073/5/0 |
| I2 | [#148](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/148) | `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57` | 4191/5/0 |
| I3 S1 | [#150](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/150) | `36dd1c37bc18d7614d8d4835b5213d5cb6459792` | 4211/5/0 |
| I3 S2 | [#151](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/151) | `687ed356de3aee59075b85bf09a978eedab12a02` | 4302/5/0 |
| I3 S3 | [#152](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152) | `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b` | 4307/5/0 |
| I4 A18 | [#153](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/153) | `ec880cd6b5bc6779095fcbdddb143b1034d751c5` | 4330/5/0 |
| I4 B18 | [#154](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/154) | `a74d513f3c990fe4b87401380a2eade8677b2163` | 4340/5/0 |
| **I4 A19 最新** | [#155](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/155) | **`d9ba4ba54293963f8d962182548a627d52b566a3`** | **4344/5/0** |

- `#149` I2 R04 是另一个独立绿候选 `fc663a9c3b9beff8b48020d1b818089b6c4b3f1d`，并未确认为 I3 主链获签来源，不能自动合并。
- Frozen refs 已全部重新 GitHub 验证：`integration/v3-i3-stage3-accepted-frozen` → `8e9f7caa...`；`integration/v3-i4-a18-accepted-frozen` → `ec880cd6...`；`integration/v3-i4-b18-accepted-frozen` → `a74d513f...`；**`integration/v3-i4-a19-accepted-frozen` → `d9ba4ba5...`**。不可 force-update、reset、删旧 PR、覆盖签收 SHA；新阶段只从相应最新 signed ref 新建独立 Draft。

## 3. 最近工程实质、来源和负例

**A18，#153**：从 C 已签 I3 Stage3 起，固定 A R18 `0febf1248bc6a580a1bc7b3144e0d96ca4313916` 机械 4/4 blob 导入；A HTTP 引擎 `029419de...`、测试 `55879650...`、Main SDK bridge 测试 `b42a605e...`、native Pi offline 测试 `5e2dfa65...`。加 I-owned SSE↔C physical Host 5 条测试与两份 I 文档，7 paths/0 C-owned。首败 `54b52574...` CI 4329/5/1 为 I fixture 错把 Responses completion 配到 Completions model，A 正确 fail-closed；仅修 I-owned test，最终 4330/5/0。C 正式签 [ede3d1fc](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/ede3d1fcda3ab0194190a60b160a70852c48c1ca)，别名 [b2d55829](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/b2d55829e5513d3c9dc25df2233d41e007989a77) 不是第二次权限。

**B18，#154**：从 A18 accepted 起，固定 B R18 `263b7f36034cacd4d51a00edd5f39266c37037fa` 2/2 精确 blob：`review-source-version-adapter-v3-b2.ts@b2101be80e3dce561f6365c3378b2930245dda73` 取代旧 `367390a...`，新增 `review-v3-b2-version-transition.test.ts@1ca56df2317f345f86e962af4017af82ad10b4de`。I-owned 4 条 B version↔C Host 负例和 2 docs，仅 5 paths。候选的原件替换/相同 bytes 但另一物理文件使旧候选 block 全部失效；不代表已自动撤销正式 C published Run。B-only tests 6/6、I 4/4；C 签 [245024b](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/245024b392848f373c702716f3514b89bdd3856b)。

**A19，#155**：依据 C 以前单独准许的 `CR-A-R17-R19-SECURITY-SOURCE-R01`，固定 A R19-04 旧绿 commit `58aed24f05645159cdc06afd8448244e7fe9710a`，4/4 exact source=target：`review-v3-native-pi-crosspid-r19.worker.ts@ffbb803a7e93e47488bcb7e97f0537258ff76f04`，`review-v3-native-pi-crosspid-r19.test.ts@7855139e7bdf367f8ed023483c8905a59903ca27`，`review-v3-native-pi-revoke-r19.test.ts@27f9d589b37f7560bc1945b5ba2a303f746436e3`，`review-v3-sdk-diskfault-r19.test.ts@094698f65a93b47a5fa5cba5080132ea5e733547`。源-only replay `366d3f26dcecb19d7fa5864631266f2186854f09`，加 2 I-only source/rollback docs；相对 C-accepted B18 **6 add-only files、0 既有 A/B/C 生产修改**，7/7 依赖可满足。Bun 原始日志 R19-01/02、03、04A、04B **4 条 PASS**：真实 Bun OS child PID+Pi 0.86.1、SIGKILL+新独立 PID 恢复、late revoke；EIO/ENOSPC 属故障**注入**，HTTPS/SSE 仍是离线 fake，不是外部 Provider/真实硬件故障。C 正式签 [25dbba28](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/25dbba28c2d9d1d88f4f2f68df42cb3e39f4478c)。#155 源锁 `docs/design/review-agent/acceptance/v3-integrator-i4-a19-r01/I4-A19-EXACT-SOURCE-LOCK.json`。

## 4. 其他工程线最新仅供知情、不是 I 导入授权

- 快照观察到 A #143 HEAD `6dce7c4affe9e1d22348dedd231506437f738825`、B #142 `617f44f2837e1ac2e2ce9f09a7edc350c79746b7`、C #144 `67960811880e0a84bf62eb6f828ea6c72a101901`，#145 `b00ef0f29e23eceb33b3a12c61136484bbd7897a`。**均是移动 HEAD**，新会话必须重新查询，不能直接作批准来源。
- C R06 Host tombstone fixed `7e80c5e782c0e7d5b41a804b11cd5cbe6a130c45`，防同 registry Run invalidate 后的迟到物理 Host ID 复活，但不是跨 PID durable tombstone。
- C B20 Main trusted read fixed `d5a61304ddb09c38fea7982623786f0ce56ed220`，离线可信读边界，仍无完整 B20 真实 source/native picker 接线。
- C Main human removal consent 最新 `67960811880e0a84bf62eb6f828ea6c72a101901`，离线 Case CAS 技术门禁、物理人工批准来源未真正安装，默认拒绝；C-only Bun 4160/5/0、5 workflows 绿色；**不授予 I Main/IPC/Preload 生产写权**。
- B R20 current-source read bundle C 仅接受其作为 B-only 来源/合同依据，固定 B #142 `984fbdda35590b39e8547860a025ef0db5a666b9`，`review-v3-b1-b2-main-read-bundle-v3-b.ts@2ff051fc5d18a2c0ef9465188a3611a71a0989ee`，**不是 I source CR**；B19/20/23 或 A19 更新 HEAD 均不被既有签收自动纳入。

## 5. 新 Dev-I 下一批必须执行

1. 优先读此文、同目录 NEXT 指令、#145 唯一共同协议**最新** `DECISIONS:C`/`STATUS:I`、C [A19 签收评论](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6279716043)、#155 source lock。核实最新 immutable A19 ref、签收 commit、PR 和 3/3 CI；不要让用户重复已知资料，不重做架构考古。
2. 以 `integration/v3-i4-a19-accepted-frozen@d9ba4ba...` 作为未来候选父节点，**但没有新 A/B/C 源导入许可**。只读研究能有意义集成的技术切片，例如 B20 current physical candidate read ↔ C B20 trusted Main source/currentity，或 C R06 run tombstone ↔ A cross-PID recovery。选一个真实工程范围，逐路径固定 source SHA、Git blob、ABI/deps、C 独占边界、cross-line positive/negative tests 和回滚；向 C #144 提新的**逐 blob scoped source CR**。未经 C 在 #145 `DECISIONS:C` 裁决不得导入。
3. C 确认后才从已签冻结 ref 建**新独立 Draft**；机械重放批准对象，核对 source/target blobs；补 I-owned adapter/联合安全负例与源锁。依赖不全就 `CONTRACT_BLOCKED`、重新请求 C，不偷加 C/shared/Main。
4. 新 exact SHA：完整冻结依赖、TS、packages boundary、skin、Main/Preload/Renderer builds、全 Bun；PR CI+Baseline+D2 及适用 D1/Batch；人工核对原始 Bun 关键测试、失败日志，修复后新 SHA **全部重新跑**。过门禁仅叫 `Gate O PASS`，仍需 C 独立工程签收。
5. C 最终精确签收后才新建下一条 **immutable** accepted ref；所有 PR 保持 Draft、不得擅自 merge main。I 进度更新**只改** #145 `STATUS:I`，其他区字节不变；私有交接可在本目录继续 R03，不要求 A/B/C 读。
6. 用户要真正有意义的集中工程批次，不能靠删用例、假造物理 Host 或降低验收标准提速。技术 Gate O ≠ Electron 实机 E、学校 L、产品 P 与发布 NO_GO。

## 6. 权威指引

- [#145 统一协议](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/docs/v3-integrator-i-r01-taskbook/docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)；[C A19 正式决定](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/25dbba28c2d9d1d88f4f2f68df42cb3e39f4478c)；[#155 代码和已签 Gate O](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/155)；[C #144 新 CR 入口](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)。
- [此前 I-only R01 交接](../v3-integrator-i-session-handoff-r01/I-ONLY-SESSION-HANDOFF-20261020-R01.md) 仅供查历史，不可当最新状态。

**本 R02 交接停止点：A19 已获 C 精确签并已新建不可变 frozen ref；下一来源批次仍未获得新 CR，尚未开新开发 Draft。**
