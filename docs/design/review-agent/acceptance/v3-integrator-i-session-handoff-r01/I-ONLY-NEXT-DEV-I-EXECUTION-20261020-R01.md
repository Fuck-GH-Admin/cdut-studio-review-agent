# CDUT Studio Review V3｜仅供新 Dev-I 会话的恢复/执行清单 R01

> **I-ONLY, NOT ABCI SHARED REQUIRED READING.** 仅下一任 Dev-I / Integrator-I 使用，Dev-A、Dev-B、Dev-C 无需阅读。本文件只恢复会话，不是新批准来源或新代码权限。
>
> 详细事实、SHA、PR、rollback、C/B-CR-002 权限、CI 见同目录 [I-ONLY-SESSION-HANDOFF-20261020-R01.md](./I-ONLY-SESSION-HANDOFF-20261020-R01.md)。共同规则唯一权威为 [ABCI-UNIFIED-COORDINATION-AND-STATUS.md](../v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md)。

## 接手身份

**Integrator-I**，本轮是真实持续集成工程，不是架构重调研或第二个 Dev-C。负责从 **精确 C accepted 锚点**、按文件 Git blob 来源锁，开展 A/B/C 选择性技术导入、I-owned 桥接、可靠性负例和完整联合 Gate O；Dev-C 独有业务/Main/IPC/Preload 生产裁决权；A/B 各自拥有自己的生产技术源，不偷改。

## 本次会话停止点

- 最新 **C-accepted** I Stage2：[Draft #151](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/151) `687ed356de3aee59075b85bf09a978eedab12a02`，正式 C 工程接收 [`75f31782`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/75f31782d90469e91c8a6ea759ac5acef2ebe624)，full Bun 4302/5/0，8/8 A R14 source blobs，C 0 hunk。
- Stage3 **仅候选 Gate O 成功、未获 C 新签**：[Draft #152](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/152) `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`，frozen accepted base `integration/v3-i3-stage2-accepted-frozen` = #151 精确 SHA；仅 1 I-owned source test + 2 I docs，PR CI `39317723780` full Bun 4307/5/0（5/5 新 tests）、D2 `39317723879`、Baseline `39317723768` 全成功。
- C 审批请求：[原候选 CR](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276302601)、[新精确 SHA 签收/裁决请求](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6276490583)；**用户说将在下一会话交付 C 最新裁决，因此先听裁决，不要再次代询问、也不要虚构已签。**
- 第 3 阶段用已经导入的 A R14 `56f450f3c783299ceb0a6489bf855a1ba8f0a913` 技术 HTTP engine + 非联网 injected SSE 与 Pi lifecycle shim 测试 C R03 Host registry；不是实际 Pi Session/Provider/Electron 或 C2 business ACK。

## 新会话真实第一批动作

1. 读此专属交接和 #145 唯一共同协议最新文本，验证 #151 和 #152 refs 与 exact SHA、最新 PR status、C 最新 `DECISIONS:C` 和 C 在 #144 的判定。
2. 核对用户传来的 C Stage3 裁决是否确指 #152 `8e9f7caa...`，内容为 `APPROVED_SCOPED`、`REQUEST_CHANGES` 或 `DEFERRED`，以及是否**另行工程签收**。逐句判断是测试许可、code acceptance 还是 Main/Provider 生产权限；绝不混淆。
3. 若明确 C 接收该 exact SHA，冻结单独新接受 ref（不移动旧 frozen ref，不改 #152 已签 SHA），更新 #145 **仅 STATUS:I**；然后就 Stage4 精确来源/路径/函数给 C 提新 CR，不可用本签收自动升级 A/B/C 外源。
4. 若要求变更，限改 I-owned 测试/adapter，保留旧失败 SHA 与新 SHA 完整 CI；请求 C 新签收。若仍 pending，#152 暂保留，做只读下一候选来源核验/CR 设计，不引入新生产源码。
5. 一切正式 Main/Preload/Business writer、B published school Plan、独立物理 Host Registry/Electron Gate E、真实 UAT/Gate P，继续 C-only 边界，未经明确授权不得开发或声称通过。

## 核验参数

- Repo `Fuck-GH-Admin/cdut-studio-review-agent`；公共协调 PR #145，branch `docs/v3-integrator-i-r01-taskbook`，公共协议路径 `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`；
- #152 branch `integration/v3-i3-stage3-i-only-physical-witness-candidate-r01`；#151 branch `integration/v3-i3-stage2-a-r14-offline-r01`；Stage1 #150 `36dd1c37bc18d7614d8d4835b5213d5cb6459792`；冻结 C R03 `e87f75e044becc35c28292cc835a2c2ec41df48a`；
- C/B-CR-002 A/B/C 2026-10-20 决议完整见 [`482cae8`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/482cae8bcab3efc6d6ca559a1823094b13ba8dca)，其中 A/B 是 C-only Main read/ACK，C 是 B/I candidate-only 技术准备，**不授权新 B import 或 I Main write**。
- C #144 新工程在本次交接核验 HEAD `331519d3833e254c7d54c18605b50f3252582517`：C-MAIN-WIRE-R01 的 C-only Gate O 通过，然而未有真实 B issuer/Main trusted producer 默认安装、尚无 Gate E；I3 不自动含该 C SHA；
- A #143 HEAD `d1422ab1d4ace46c033117e2fe3c4c7c95114bb7`、B #142 HEAD `263b7f36034cacd4d51a00edd5f39266c37037fa` 在快照时仍可移动，**不要使用浮动 HEAD**；
- `I-LEASE-MAIN-PORT-R01=CONDITIONAL_NOT_ACTIVE`、`I-LEASE-BUSINESS-WRITER=DENIED`，E NOT_RUN、L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO；
- 改已有签收 SHA 或重放 #149（独立候选）均需要新 C 裁决。禁止 merge main、删除历史证据/分支。
- 使用 GitHub 原生 API / connector 阅读和提交代码，只有实际对应 SHA 新 CI 成功才可报 Gate O；真实桌面 Gate E 必须本机独立验收，不以合成测试代替。

## 完成这次接手的可验证标准

能向用户清楚回答：**I 目前最新 C-accepted 的 SHA 是什么？下一候选 #152 的确切 Gate O 和 C 裁决状态是什么？下一批可编辑哪些文件、不可编辑哪些？C 新批准在哪条评论/协议 commit？有哪些已绿但未被 I 合并的 C/B/A 来源？** 然后直接展开获批范围内的实际工程、测试和新的 Draft 检查点，尽量集中验收，不要重做历史调研或降低质量。
