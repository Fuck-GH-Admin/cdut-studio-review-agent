# 07｜Round 2A → Round 2D 独立架构集成交接

**审查性质**：只读、docs-only、候选架构证据。**总状态 PARTIAL**：固定代码与 GitHub compare VERIFIED；本地执行/GUI/Provider/学校授权 BLOCKED。没有修改生产代码、Gold、校务材料或共享分支，也未合并或删除历史 PR。审计目录 `docs/design/review-agent/acceptance/v3-round2-core-business-r01/`。

## 固定基线和项目现实

- 第一轮 [#133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/133) 远端考古；第 1.5 轮 [#134](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/134) 72 项能力。main `8989941b6fb5651564e32d11c4215b6a6d5a5209`；D4 W1 #129 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`；P06 R03 #132 `db0284879f75ce123b5d83cb6577a3cc7ad057da`；遗产审计 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`。
- GitHub compare **独立再次验证** main↔D4 为 diverged (ahead 333 / behind 170)，main→P06 ahead 113，D4↔P06 diverged (ahead 283 / behind 333)。**2D 不得以任何一支当另一支的后继**。大 compare 文件列表 300 条上限，不能作为所有文件已审尽的证据。
- 本会话仅远端独立审计分支提交 docs；仓库本地 clone 因 github.com DNS 被阻断。源码定位、测试路径存在是 `VERIFIED (static)`，但没有执行单测/跨进程/Electron GUI/Provider/校方系统。

## 六个核心问题逐项回答

**Q1：V1/V2 哪里双写或同步？** **VERIFIED**：V1 `case-store.updateCase/saveCase` 落本地 `case.json`；V1 主工作台由 `review-ipc` 创建/更新、材料服务导入，随后 `ensureWorkspaceAggregateV2/syncWorkspaceProjectionV2` 以 V2 `submitCommand` 写 `aggregate` 和系统 Receipt。**另有 V2-native `createCaseFromTemplate` 不经 V1**，D4 是 `createD2TechnicalCase(V2)`→`saveCase(V1)`→固定 Plan 投影的第三条链。没有证明两文件跨进程事务原子性。详见 [01](01-case-state-and-write-map.md)、[`apps/electron/src/main/lib/review/review-d4-client.ts:82`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-client.ts#L82)。

**Q2：哪些状态应只保留一份权威？** **PARTIAL（目标合同待 2D 定）**：Declared Input、冻结 D2 Plan、Observation/人工确认、EvidenceLink、材料版本及 Read Receipt、Run/Check/输入 hash、任务/补件/申诉/评分/决定、外部 action/Receipt、历史快照都必须逐类指定**唯一有效写 owner**。当前真实权威是分区的，不能先迁代码后补字段 owner 表。历史文件可保留为只读证据，不代表每一类只能存一个物理文件。详见 [04](04-data-migration-and-compatibility.md)。

**Q3：两代各有哪些优秀实现？** **VERIFIED（源码）+PARTIAL（UX）**：V1 三栏展示、SourceBlock 跳转、用户所见规则/原件、轻量修订/人工编辑；V2 `submitCommand` 的 CAS/幂等/Receipt、Observation supersedes、EvidenceLink 多对多、任务/补件/评分、角色投影和正式 Run readiness、批次自动化栅栏。D4 W1 另有 token/文件来源/冻结 Plan；P06 另有后台 owner/会话/批次 Run 保护。全部按 #134 ID 审理，未把 V1 降格仅 UI，也未把 V2 定案完美内核。

**Q4：历史与高级评审能力能否无损迁移？** **UNKNOWN**。`migration` 未迁 V1 runs；遗留 `case.v2.json` + 当前 V2 aggregate 与 outbox 是不同持久层；`stage-workflow` 非 final 仍留 `run@rev` 标记；评分/回避/申诉存在服务，但 UI/校方真实身份不完整。甚至 **P06 `RESOLVE_APPEAL_V2` IPC 绑定 reviewer，service 必须 teacher，现有本地 IPC 不能完成该教师复核**：[`apps/electron/src/main/lib/review/review-ipc.ts:721`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-ipc.ts#L721)、[`apps/electron/src/main/lib/review/stage-workflow.ts:322`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/stage-workflow.ts#L322)。这不是可直接宣布“完全兼容”的状态。

**Q5：哪些代码可靠、哪些仅候选？** `case-store-v2.submitCommand` 内存队列与一次聚合文件 Receipt 具有清晰代码和现有测试定义，**REUSE 候选**；V1 三栏与 V2 审核/补件/评分等 **REFACTOR 候选**；`SchoolPort Mock` 与旧 `run@rev` **不能正式复用，需要 REIMPLEMENT 或仅保留兼容显示**；现有 regression `.test.ts` **PRESERVE_TESTS**。但因无本轮执行证据，所有复用均 **PARTIAL** 而非“实机 VERIFIED”。

**Q6：第三轮选型必须解决何种数据与 UX 冲突？** **P0**：V1/V2 独立 rev+写权；D4 `fixedD2` vs P06 同名投影/IPC；Renderer 透传 actor 的部分 CRUD；正式教师/学校审批入口；历史 V1 Run/虚拟 Run；归档 SourceRef、人工确认生效逻辑。**P1**：V1 三栏与 V2CasePanel 双列表双入口、补件/申诉/评分可操作闭环、跨批 Run 绑定、离线角色投影与 outbox 回执、历史报告。详见 [03](03-workbench-capability-audit.md)、[06](06-cross-team-contract-questions.md)。

## 2A 提供给 2D 的核验资产

| 文件 | 提供决策输入 | 证据状态 |
|---|---|---|
| [01-case-state-and-write-map.md](01-case-state-and-write-map.md) | 三种建案写链、V1/V2 投影、字段 owner、直接写入口及 mermaid 图 | VERIFIED static / PARTIAL dynamic |
| [02-business-lifecycle-matrix.csv](02-business-lifecycle-matrix.csv) | CASE-01 至 CASE-12 每 ID 持久/权限/UI/失败/测试和候选 | PARTIAL |
| [03-workbench-capability-audit.md](03-workbench-capability-audit.md) | UI-01 至 UI-06 与两个页面的真实接线，D4/P06 差分 | VERIFIED static / PARTIAL GUI |
| [04-data-migration-and-compatibility.md](04-data-migration-and-compatibility.md) | 历史 V1/Run/aggregate/outbox schema 与迁移/回滚风险 | PARTIAL |
| [05-core-regression-gates.md](05-core-regression-gates.md) | CAS、human fact、archive、real Run、actor、appeal、offline、batch、SourceRef 负例 | NOT_RUN |
| [06-cross-team-contract-questions.md](06-cross-team-contract-questions.md) | TPL-03/05, RUN-04/07, BAT-03/04/06, EXT-01 的明确交叉问答 | PARTIAL |
| 本文件 | 2D 的选型门槛与明确未决事项 | PARTIAL |

## 供第三轮选型考虑的非约束候选

| 能力 ID | 候选动作 | 理由（不是批准） |
|---|---|---|
| CASE-02 | REUSE（事务算法）+ PRESERVE_TESTS | 具备 CAS/幂等/回执，在授权与跨文件原子性之外仍需压测 |
| CASE-01/03/04/05/06 | REFACTOR | V1 输入+D4 frozen+V2事实三组完整性必须通过迁移后保留 |
| CASE-07/08/09/10/11/12 | REFACTOR / PRESERVE_TESTS | 不放弃阶段、申诉、补件、独立评分、离线回传、报告；补足真实身份与 GUI |
| UI-01…UI-06 | REFACTOR | 原件工作台、V2业务页、模板/批次经验需要一套用户状态与可信回执 |
| EXT-01 | REIMPLEMENT（业务授权/真实外部） | SchoolPort mock/local outbox 不是校内API |
| RUN-04/07、TPL-03/05、BAT-03/04/06 | INVESTIGATE（交叉主责） | 必须等待 2B/2C 分别给出来源/冻结/Run及批次证明 |

## 严格移交门槛（任何一项不具证据不开始生产重构）

1. 2D 提交按固定 SHA 的 `Main / IPC / Preload / Renderer / PersistedStore / Agent / SchoolPort` write-owner 分层图；每个业务实体唯一有效写权及 fallback 规则。
2. 合并 D4+P06 须有完整 `review-ipc.ts` 与 `workspace-service-v2.ts` 函数差分清单和 frozen D2/Actor 安全负例，严禁静默覆盖。
3. 完成历史单案/补件/申诉/评分/离线包至少一套可重开的持久化回放与兼容导出。旧 Run 必须以历史标记呈现，不得用于正式决策。
4. 本机隔离执行 [05](05-core-regression-gates.md) 的 Gate 清单：保存 raw logs、输入/输出、原始前后文件 hash、实际可重复拒止/成功证明；**CI/Provider/GUI/SchoolPort 分别签署**。
5. 用户入口验证最少覆盖三栏原件、原生 V2、D4 建案、P06 批次、模板编排、补件+复核/申诉。没有学校凭据的教师功能标注不可用，不用前端假 role 解决。
6. 保持 #133/#134 与 2B/2C/2A 各 Draft PR 独立；2D 只采纳经复核证据，任何正式代码迁移、删兼容、变基/强推另开审批。

**不得误写**：本轮没有运行任何单测、没有通过 GUI、没有真正连接学校、没有生成 V3 生产代码。此报告将部分具体风险升级为“需跑负例”，**不是已经复现漏洞/证明无损迁移**。
