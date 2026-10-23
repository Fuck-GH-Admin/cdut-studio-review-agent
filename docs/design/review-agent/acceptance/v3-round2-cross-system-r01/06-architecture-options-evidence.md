# 06｜V3 三种架构收敛路线：证据化比较（不选型）

**审查结论：PARTIAL；第三轮拥有最终选择权。** 本文不按遗留代码量或沉没成本给方案打胜负分。72 项能力覆盖、20 项冲突见 01/05；当前 72 项验证级别为 **47 PARTIAL / 21 UNKNOWN / 4 BLOCKED**，没有一项在本轮独立重跑完整工程用例。故评分只能表示架构**待验证风险**，不表示真实实施工时或质量证书。

## 必须先保全的能力，不因路线而异

1. V1 三栏原件/规则/问题跳转、人工编辑和真实状态可视；V2 CAS、Receipt、Observation supersedes、多对多 EvidenceLink、评审角色/补件/评分/申诉；D1/D3 的来源责任、冻结模块与升级签收；D2 多对象/Check×target不可变Plan；D4 暂存、文件角色、来源失效与确认；P06 Main Owner、撤权 tombstone、Run/Batch绑定、原件按需阅读、outbox。
2. 明确不作为新生产权威：D0.5 demo state engine、`run@rev` 合成 Run、两领域关键词推荐器、mock school ack。保留能复现旧行为与迁移反例的测试。
3. P0_CANDIDATE 必须通过场景 B/D/F 和身份负例验证后再判定是否属于正式上线阻断；不能仅因为可能严重就混同为已证漏洞。

## A｜以 V2 为权威业务内核，选择迁移 V1/D4/P06

**正面证据**：main `case-store-v2.submitCommand` 将同案 CAS/Receipt 放在一个 aggregate JSON 更新中；V2 已有 Observation/EvidenceLink、stage/补件/评分与业务门禁；2A #135 验证代码调用路径。P06 `decideWorkspaceCaseV2` 继续使用该命令事务，但不意味着独立 Run/outbox 与 V1 文件自动原子。

**典型实施合同**：V2 Aggregate 为“当前业务状态”；D2 Plan / SourceVersion / Run 可是独立不可变对象，经 ID+hash 快照引用；V1 仅兼容导入和可审计旧历史；Renderer 统一工作台；P06 后台 Owner 原样保留信任边界。

| 维度 | 风险/证据 |
|---|---|
| 能力保全 | 容易保留 CASE-02、CASE-04..12、BAT、BG，但若直接将 V1 降格为纯 UI，UI-01/02/03 和旧 V1 状态机实际能力可能丢失。 |
| 状态去重 | 预期较高，但须先做 V1/V2 双写停用条件与遗留 case.json shadow migration。 |
| 安全 | 不能直接继承 CRUD 透传 actor；需统一 Main 认证、Plan frozen、防跨案 SourceRef，正式决定只走可信角色。 |
| 迁移/回滚 | 中高风险：V1 runs、旧 V2 aggregate、outbox、历史导出需迁入只读账本；回滚不可用旧主写覆盖新主数据。 |
| 重新实现 | D4→V2 命令适配、工作台统一、D3→Case/Plan合同、外部 Receipt 协调层。 |
| 可验证性 | 强制影子校验和历史 fixture diff，见 Gate A/B；未满足前不可宣布“一站式”可用。 |

## B｜提炼 V1/V2 共同稳定合同，重组执行器与工作台

**正面证据**：V1 和 V2 已有局部互补而非完全重复；同一 SourceRef/Run/状态字段可做不可变事实对象，命令适配器分 V1 legacy 与 V2 modern。此路线避免过早假定 V2 的所有字段/权限模型完备，尤其 P06 legacy stage `run@rev` 与 D4 frozen plan。

| 维度 | 风险/证据 |
|---|---|
| 能力保全 | 对 UI-01..06、CASE-01..12 有机会兼容；但易把两代“最低公分母”变成更弱状态机，丢 subject adjudication、出处身份、role/approval。 |
| 状态去重 | 中等，需冻结权威数据字典；若“通用接口”背后仍 dual-write，则只是掩盖 ARCH-001。 |
| 安全 | 需要 Main actor/session/source/batch 真实能力贯通，不能以跨模块共享 TypeScript 类型代替边界。 |
| 迁移/回滚 | 中等偏高：抽取合同同时兼容旧存储，可逐步影子迁移；但接口适配层复杂度和长期双维护风险较大。 |
| 重新实现 | 共享领域命令/事件合同、read-model、Runner adapters、Plan/Run/Decision provenance 接口，仍需重做 role 来源。 |
| 可验证性 | 可针对各 adapter 做契约测试；必须做所有 72 功能的保留验证，不能只跑主路径。 |

## C｜新定义关键核心，只保留经复核的历史实现

**正面证据**：三条建案路径、D4/P06 同名函数语义不一致、R02/R03 provenance 变动，说明“简单合并 V2”会保留负债。以不可变来源与统一状态机新定义可更直接处理 Plan/Run/Batch identities。

| 维度 | 风险/证据 |
|---|---|
| 能力保全 | **最高遗忘风险**：需要把 72 项及全部历史 UX、MD-Q1、验收失败转换为可执行合同，不能先删再找。 |
| 状态去重 | 理论最高，但当前无基准证明新实现比现有 CAS/Owner 更可靠。 |
| 安全 | 可建立明晰领域边界；但重新实现 Main revoke、SourceRef、CAS、outbox 容易引入新错。 |
| 迁移/回滚 | 高：新 schema 升级、多版本回放、离线原件与旧 Run/Receipt 映射难度大。 |
| 重新实现 | V3 Aggregate/Source/Plan/Run/Batch/Decision、Client/read model、adapters、迁移器；可选精确沿用经验证模块而非全重写。 |
| 可验证性 | 新旧双跑+差分基准可做，但必须有独立 Gold/负例、允许回滚的只读迁移，工期风险未量化。 |

## 混合方向（仅待讨论）

可以讨论 **B 的合同清晰度 + A 的已证事务/Owner/Source实现 + C 针对批次出处及跨文件事务的重建**，但这不是本轮的决策建议；必须由第三轮证明它减少重复状态、不过度抽象并能对 72 项逐行签验。

## 可量化风险与第三轮验收量尺（候选，非伪精度）

| 量尺 | 当前证据 | 第三轮定案前最低要求 |
|---|---|---|
| 72 项 ID 责任与来源覆盖 | 72/72 有原 ID、主责与来源建议；7 项交叉审查 | 72/72 指定 V3 owner 和迁移/测试合同，不能仅有名义 owner |
| 本轮独立产品通过数 | 0/72（未运行） | 按高风险/关键场景逐门禁出实测日志，再定义最低通过线 |
| 静态未关闭冲突 | 20 个（5 P0 候选，14 P1，1 P2） | P0 候选经复现或证伪；正式架构明确每项唯一负责实现 |
| 源码合流缺口 | D4/P06 diverged；compare 截断 | 全量函数/类型 diff 与本地 patch-id/资产 hash 清单 |
| 两类 Batch 身份 | D4 入库批次、P06 审核批次 | DTO 身份、生命周期、请求授权、重试策略分别固定 |
| 外部实机可靠性 | Provider/ENOSPC/SchoolPort 均 BLOCKED/NOT_RUN | 真正权限与设备条件具备后分批独立出具 LIVE 证据 |

**不可用“方案得分”替代证据**：尚未获取可复现的工程基准、迁移规模和硬件运行日志。第三轮可先定义明确 go/no-go 决策矩阵，再让三个开发会话按同一合同实现。
