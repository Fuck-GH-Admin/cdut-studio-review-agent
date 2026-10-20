# Review V3 七条用户旅程 · I6 可复核产品集成证据矩阵

> I6 只负责可验证的跨线源码、ABI 和联合负例。**技术模块存在 ≠ 安装在真实 Electron ≠ 学校授权正式业务成功**。本矩阵用于对照遗漏、减少重复开发，最终产品义务与发布裁决由 Dev-C 持有。日期：2026-10-20；证据锚点 [C 产品决议](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6283639440) 与 [I6 139 条目录内四源精确 Blob 清单](./I6-00-FOUR-LINE-EXACT-BLOB-INVENTORY.json)。

**冻结来源**：I5 `a77a70b3a75da11728d99dba35717b18b02a5089`、C R09 `d7548c3eefedb10f4cc23c12e70712e1e1fd1e3a`、A R21 `703e2bf8e20a7b598e1eb923d5faf6f7b17ab3a9`、B R29 `4c4f277773c0e20185a7364d0bb66439d51ca7a4`。A/B/C 工程各自 standalone Gate O 不等于跨线产品 Gate E。

| # | 用户应完成的真实旅程 | 已有固定源码/已通过的范围 | 当前实际运行入口及缺口 | Owner 与下一次可验证的证据 | E / L / P |
|---|---|---|---|---|---|
| J01 | 学生拖入真实 PDF/Office/ZIP → 完整多材料识别 → 自动或手动保守路由 | B R23 `review-intake-adapter-v3-b2.ts@e9116630`、`review-zip-intake-v3-b2.ts@2289f2fb`、`review-import-ledger-v3-b2.ts@273b8ea7` 与 I5 真实 ZIP CRC/独立 PID；B R29 候选安全预检 | C R09 OS 原生 picker `review-v3-main-native-archive-registry.ts@9354427a` 独立工程绿，但 B Vault↔C Main 当前物理 registry/Principal/Owner 尚未**实际装配**；20s 默认路由的完整 Renderer→Main 用户旅程未验 | C R10 安装真实 source current witness + 原件置换/Owner/frame/冷重启 Gate E；B 负责完整 staged set/错误语义；I 对照原始版本不复刻 Vault | E NOT_RUN；L 按机构政策阻断；P NOT_RUN |
| J02 | 匹配 50 套模板，或第 51 套未匹配业务临时作者候选 | B R25 保持 **49/50 原件匹配**、G08-T03 RAW 缺失、34 G01 scope gaps/4,163 UNKNOWN；B R29 `review-v3-b3-unmatched-author-bootstrap.ts@7af5fb6d` B-only 技术绿 | B 51st 目前是 `candidateOnly`、UNKNOWN/需人确认；C 没有独立学校 issuer，不能自动 Policy 发布或替换 G08-T03 原字节 | B 逐条来源/Gold/UNKNOWN/用户确认；C 当前 publisher 真授权；I 验 candidate 不产生正式 Plan/Case Decision；完整 50+1 真人 UAT | E NOT_RUN；L BLOCKED_NO_AUTH；P NOT_RUN |
| J03 | 作者保存/冻结/来源检查 → Main 当前性双读 → 人工修改规则/删义务确认 | I5 B1 存盘 `review-template-author-store-v3-b1.ts@065251ca`，C immutable B20 read `@d0e6ea27` 10/10 离线 C/B 正反例；C R09 native removal observer `@cee650e8` / Main handler `@00d77c3f` 独立 Gate O | Main 注册 handler 和 Preload facade 源码存在；真实 B1/B2/B19/B20 Current Author dependency installer 未装、删除官方 Check 还须真实学校出版 verifier | C R10 Current grant/picker + C authority/revoke + before/after await；B author/resume/upgrade UX；I5 test retention；E 真人删除对话/拒绝重复批准 | E NOT_RUN；L BLOCKED_NO_AUTH；P NOT_RUN |
| J04 | 真实 Pi 审核 → Host Read/Check/terminal → 正式 Run → 暂停/撤权/失败 | A R21 `review-v3-technical-sequence-driver.ts@144677d0` B? **A-only** 多轮真实 Pi 技术流；I5 旧 A R19 真实 Bun child/SIGKILL；C R09 durable fence `review-v3-durable-host-fence.ts@75e989ef`、Run writer `@b53cea6f` C-alone 绿 | C `C2MainTrustedExecutionAssembly` 依赖实际 Host observer/A Owner/学校 published Plan，但未证实 live 已安装；A SDK 回执不是 C Host Receipt；R09 fence E 没测，旧 Host Registry I5 是不同旧 blob | A 开展 R21 technical stop/resume/unknown remote，C 真实 Main current Owner+Host observer→Case CAS/Run/receipt，I 新绿 C SHA 上复演 after-await、late event、fence/cold PID | E NOT_RUN；L BLOCKED_NO_AUTH；P NOT_RUN |
| J05 | 用户批量提交 → 每项审查 → 人工复核 → 业务 Decision/批次最终结算 | B R29 bulk candidate readiness 技术组件；A R21 batch 技术 turn mode；C 旧 V2 `batch-automation-service.ts/finalizeCompletedBatch` 存在 | **未证实 V3 Run×Decision×Batch exact-finalizer**；候选 ledger 不可自动写 Decision，缺完整多 Case CAS/正式人工复核 | C 独占 V3 Batch/Decision/finalizer/身份、I 联合负例证据检查；完成需 100 Case/500 文件压力及重复/部分失败/finalizer 语义 | E NOT_RUN；L 按使用条件；P NOT_RUN |
| J06 | Pi 后台会话 → 停止/掉线/重启/历史重开/人工恢复 | A R20 Linux PID/boot/startTicks 只读技术证据、CAS intent、multi PID fault tests；C C-TX Case 原事务、R09 Run-wide persistent fence | 旧 `.write-lock` 无原始 PID 可信凭据，真实 operator lock takeover **DENIED**，不能把 A 受控测试 unlink 当正式 recovery；旧 V2 Pi bridge 未自动升级为 V3 Main | A 继续技术独立证据，C Main/auth operator 单独真实授权；I 冷 PID×持久 Run/Host×未决 Provider 技术负例；完成需跨 OS/异常真人操作与历史数据一致 | E NOT_RUN；L BLOCKED_NO_AUTH；P NOT_RUN |
| J07 | 结果、证据追溯 → 申诉/评价/导出 → 外部有效回执/历史完整性 | C V2 business/rating、V3 Case+Receipt/Plan/Run 有源码基础，I5 C Reader redaction/技术来源证据 | 未有可确认的统一 V3 Decision/Appeal/Rating/Outbox 当前业务真值、正式外部学校受理 ACK；旧 V1→V2 migration 并非 V1→V3 full chain | C 设计/写唯一 V3 业务状态和 Outbox 原子事务/迁移；I 核来源与重复发布/回滚；真人旅程需含导出准确性及旧案重开 | E NOT_RUN；L BLOCKED_NO_AUTH；P NOT_RUN |

## 必须收敛的产品级验收证据，不得虚报

| 产品承诺（原需求） | 当前状态 | 谁交付 |
|---|---|---|
| **71** 项产品质量义务 | I6 仅做源码 ABI/安全联合负例；没有 71 项通过台账 | C 定义单一 checklist、I 连接源码/回归 |
| **72** 项历史能力 + **20** 项跨系统风险 | 先前设计基线存在；I6 blob 清单可标示来源，不等于 72 项行为均已复演 | C 负责技术选型，I 做血缘/覆盖；A/B 维护各自技术证据 |
| **120+30** 评测、**100 案/500 文件** | 未完成 Gate P 产品性能证据，不因 Bun 测试数更多而被满足 | C/I Gate P 联合执行；A/B 提供真实输入 |
| **G01–G08 50 套 + 第 51 套** | R29 技术 B-only 通过，**G08-T03 缺真实完整原始版本**，其余 UNKNOWN/语义/发行未关 | B 提来源/Gold，C 许可真正 School Publisher |
| **七条旅程 + 五位 30 分钟真人体验** | 上表是计划/追溯字段，**不是实机验收通过** | C 产品 Owner、各业务参与人 |
| Gate E / Gate L / Gate P / Release | **NOT_RUN / BLOCKED_NO_AUTH / NOT_RUN / NO_GO** | C 最终裁决；合法外部认证不可模拟 |

## 统一证据状态键（后续 I 会话继续维护本表）

每条旅程下一次更新必须固定 `source_sha`、`runtime_entry`（真 Electron Handler / injected fixture / ABSENT）、`C_business_state`、`E/L/P_evidence`（workflow + 时间 + 平台/真人）、`owner`、`next_exact_acceptance`；不能只标“完成度 85%”。

**当前策略**：C 先从其已绿 R09 独立开发 R10 真实 Main B20；I6 先做无权威来源锁和联合回归（只有 I5 已签源），C R10 新固定 all-green SHA 产生并经精确 CR 后，再实施新 I 合成，不在此文设想生产 writer。
