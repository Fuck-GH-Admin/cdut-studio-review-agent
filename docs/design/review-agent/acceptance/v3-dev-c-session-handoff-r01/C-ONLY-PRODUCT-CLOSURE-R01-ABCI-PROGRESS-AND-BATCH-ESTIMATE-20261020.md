# Dev-C 专属｜V3 全产品完成度、ABCI 最新状态与剩余集中工程批次（2026-10-20）

> C-only 用户沟通与执行参考，A/B/I 无须阅读或 ACK。本文件不是新的四线共同协议，不替代 #145 唯一 ABCI 共同规则和 DECISIONS:C；具体正式批准以 C 在 #144/#142 的最新评论及 #145 DECISIONS:C 为准。不要把下列批次当作工期承诺或发布签收。

## 官方协调裁决与最新 SHA

- I 提案 docs-only `bc809badad7a311b963a3dd37ec6ceb516181b97`：提出 ABC 完整产品收口、Q1–Q10、71 义务与七旅程。C 决定 `C_PRODUCT_CLOSURE_R01=ADOPT_WITH_STATUS_CORRECTIONS_AND_BOUNDARIES`，完整裁决：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283639440。
- A #143 **R21 `703e2bf8e20a7b598e1eb923d5faf6f7b17ab3a9`**（真实 A-only 3/3 CI green）：新增多轮单 Owner SDK turn 顺序执行驱动，保留 R19/R20 多 PID/Pi/SSE/隔离及恢复证据；仍是 SDK 技术结果，不是 C 物理 Host business ACK。A20/R21 不获得新的 I source import、operator empty lock 自动清理或 C Main/Business Writer。
- B #142 **R29 `4c4f277773c0e20185a7364d0bb66439d51ca7a4`**：R25 已签绿 `ca725148abd3818747350f605171e58f967646ab` 后，R26–R29 增 7 条纯 B-owned 文件、源证据工作台/readiness/Remediation/第51套候选作者引导。C 签 B-only 限定源功能：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6283674404。**同 SHA PR CI `39370866836` attempt2 全绿，Bun 4344 pass/5 skip/0 fail/502 files，D2 `39370866787`、Baseline `39370866687` 全绿**；attempt1 有未修改 `pi-agent-bash.test.ts:327` 200ms 时序失败，仍记录，不能当 first try clean。B 源使用与发行能力不是一回事：G08-T03 Frozen RAW 缺失；原始 49/50 可核；34 G01 scopes、4163 UNKNOWN SourceRefs、32 条原文高危 hash pin 尚未获得学校语义/Gold 认可。
- C #144 **R09 `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`**：相比 R08 `e4881d28...`，新增 Host Run-wide tombstone 的同案 C-TX/Case CAS+Receipt 原子落盘、冷 PID Host 拒绝、C Main OS native 人工移除确认安装 helper（没有虚构政策 issuer）；严格 **5/5 CI green，Bun 4180 pass/5 skip/0 fail/483 files**。C 完整范围：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283530674。C 能注册 B20 read-only IPC/Preload，**但尚未在真实 Electron Main 安装实际独立 B1/B2/B19/B20 producer，Owner/Principal/epoch/native Archive picker current source**。
- I #156 **I5 `a77a70b3a75da11728d99dba35717b18b02a5089`**：C 25/25 B R23+C 4 immutable blob 双向精确来源核验并正式签技术源集成；I5-01..10 PASS，PR attempt2 Bun 4439 pass/5 skip/0 fail；首轮未改 Goal 15ms timing fail 保留。签署：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283462332。I5 只是离线集成来源，不能做 C Main 物理 source publisher 或直接产生 Case/Run/Host/School ACK；I Main lease `CONDITIONAL_NOT_ACTIVE`，I writer `DENIED`。

## 功能状态分类（不是代码行数量）

| 能力 | 已有可用技术代码 | 实际产品缺口 |
|---|---|---|
| V3 native Case/Plan | C1 Case 单一 `state.v2.json`、plan-binding CAS、archive/restore、版本历史；有部分旧 UI bridge | 真正统一 Renderer→Preload→Main→Case 工作台、current Principal/issuer/publisher、完整用户业务态 |
| B1/B2/B3/B4/第51套 | B R23→R29 作者库/原件/CRC/Vault/ledger/parser/路由/Check×Subject、UNKNOWN 管理、无匹配动态作者候选 | Main 真身份/物理选档注册、用户试跑复核、真实学校政策可发布性和 Gold、G08/G01 缺口 |
| Pi Host Run | A R21 SDK multi-turn；C R09 durable fence、technical ledger、ReviewRun seal + physical Host Registry 实现 | 真实 Main Pi session/Host observed actual Read/Check/terminal/Run→UI 生命周期、跨 PID unknown external effects |
| C3 Batch/决定/Outbox | 旧 V2 batch-automation-service、workspace-business-service/rating 代码及 C V3 部分数据契约 | 唯一 V3 Case/Run/Batch/Decision/Appeal/Rating/Outbox 原子逻辑、业务版本 ACK、可见错误和恢复 |
| 工作台/后台/迁移 | C 原生三栏部分建案、V1 read projection、旧 V2 background Pi 与 V1→V2 migration | 全量 7 用户旅程、真实重开/人工审批/批量、V1→V3 可验证迁移、后台 pause/resume/stop |
| 发布门禁 | 单线/集成离线 Gate O 检查很多 | 真实 Electron E 未执行，校方独立 L 无授权，五人/性能/全旅程 P 未执行，Release NO_GO |

## 集中批次预算：4–6 个主要功能工程包 + 1–2 个独立验收修复包

**R10 C 原生身份与 B20 真实物理来源**：以 C R09 签绿 SHA + C 已签 I5 固定 B R23 11+10 与 C immutable 4 文件闭包为输入，C 自行精确重放/去重 B source，真实 Main Principal/frame/Owner/grant/epoch 数值转接、native picker→B archive physical key、B1 freeze/current revision、B2 Vault/ledger/parser、B19/20 候选只读 Renderer。输出一个新 C full-green Gate O，明确不能发布 school Plan。A/B/I 同时继续各自技术开发。新 B R29 I replay 仍需新的精确 C CR。
**R11 A Pi → C Host/Run**：真实 C 安装 current A Owner/grant、Pi SDK tool physical observed Host Read/Check/terminal into C registered physical receipts、技术提案、Run seal，确保同一 Case/Plan manifest/current source, late/duplicate after-await，R09 跨 PID fence/真实恢复停机策略。旧 Provider side effects UNKNOWN 默认不自动重派。需另列精确 A 来源 CR，不允许 A 自行写 C。
**R12 C3/4 统一业务命令**：V3 Batch exact finalizer、manual Check/Decision/Appeal/Rating，失败重试和 Outbox 业务幂等/外部 ACK（真实学校 publisher 未获则保留 pending/not-authorized），Case-Run-Batch-Decision 单一业务真值；没有学校 Gold 时界面显示人工复核而不是 PASS。
**R13 C5 产品界面与完整材料工作流**：三栏工作台、后台会话、重开历史/冷启动、V1→V3 安全迁移、50+1 候选、可见排错/放弃，按七旅程验证用户可实际完成流程。把 B R26–R29 工作台源头成果按批准的精确 CR 选取，不将 Renderer UI 成果当真实 C 业务写。
**R14 综合持久可靠性与性能**：跨模块 Case/Run/Batch/Outbox Crash/Cold PID/磁盘空间/撤销/权限恢复、100 Cases/500 files 压力、120+30、50+1 来源矩阵、跨 Linux/Windows/macOS 可用性/缺口，I 独立集成 Gate O，新 C 全线签收。本包可与 R12/R13 交叠，但不应吞掉必要业务能力。
**R15+ 校验与修复**：真实 Electron Gate E（含独立 OS 记录）和产品 P（71 义务与七旅程 mapping、五个 30min 用户），修复实际发现的阻断项直至独立结论。若 R10–R14 汇合很顺利，这部分压成 1–2 集中批次；若缺陷多需追加，不按自然时间倒推“必然完成”。
**学校 L 独立关口**：来源、政策、独立 Gold、真实发布者或 Provider 授权均不能靠模拟技术通过。缺学校许可，最多交付明确 candidate/manual/unpublished 的内部技术产品，不可报完整正式对外使用或 Release GO。

## 核心调度约束

- **A/B 均不必等 C 完工才写自有代码**；I 收敛 source SHA→integration SHA 与独立跨线 tests，而不是第二个 C。
- **C 优先做真实 Main 当前授权、Host/Run 生产接线、V3 Single Case/Batch/Decision/Outbox**，避免大量孤立无应用的单元；集中开发但每个最终唯一新 SHA 跑 Gate O。
- R10 明确输入 C R09 `d7548c3e...`、I5 `a77a70b3...`；R11 A R21 `703e2bf8...` **当前只 A own，不能未经新 CR 导入**；R13 B R29 `4c4f277...` **当前只 B own，不能未经新 CR 导入**。
- 当前 E NOT_RUN / School L BLOCKED_NO_AUTH / Product P NOT_RUN / Release NO_GO，不用绿测试数量取代业务义务完成比例。
