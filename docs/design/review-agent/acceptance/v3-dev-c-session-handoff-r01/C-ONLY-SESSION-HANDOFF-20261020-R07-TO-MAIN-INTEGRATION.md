# CDUT Studio Review V3 — Dev-C ONLY 会话交接（2026-10-20，R07→真实 Main 集成）

> **C-ONLY / FOR NEXT DEV-C AND USER ONLY。** 本文件仅用于新 Dev-C 会话与用户恢复上下文。**A、B、I 不需要阅读、ACK、执行或修改此文件。** 它不是新增共享协议，不授 Main/IPC/Case/Run/Business Writer 权限。四线唯一有约束力的协调合同仍是 Draft PR #145 中的 ABCI-UNIFIED-COORDINATION-AND-STATUS.md，尤其是最新 DECISIONS:C/STATUS:C。本目录另有 C 专属下一会话执行提示词 C-ONLY-NEXT-DEV-C-EXECUTION-20261020-R07.md。

## 1. 身份、分支、权限与原则

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

Dev-C 是 **唯一共享业务合同、可信 Electron Main/Preload/IPC、Principal/Owner、原生 Case CAS/Receipt、Canonical Plan/发布者、C Run/Host 物理回执、业务写入的所有者与 A/B/I 的正式裁决者**。不是新的设计考古 Agent，也不是 Integrator-I。必须继续实际开发与验收，不能只写方案。

- C 代码：Draft PR #144，分支 feat/v3-dev-c-business-r01，**当前正式 Gate O 已签准确 SHA 67960811880e0a84bf62eb6f828ea6c72a101901**，基线 PR base feat/v3-dev-c-c0-contract-r01。
- 公共规则：Draft #145，分支 docs/v3-integrator-i-r01-taskbook，文档 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md。**仅修改自身 DECISIONS:C、STATUS:C marker**；每次写前读取最新文件 Git blob SHA，以免覆盖并行写入。历史 PENDING 可能已由较新 C 签收覆盖。
- A 负责 Pi SDK/Owner/transport/dispatch/技术 Proposal；B 负责作者/模板、原件 ZIP/parser/来源、路由/候选、未命中第51套；I 负责 C 限权许可后的 exact-source import、隔离 Draft 和联合回归，不拥有 C Main 或 Business Writer。
- I Main lease CONDITIONAL_NOT_ACTIVE，I Business Writer DENIED；所有 PR 保持 Draft、不得直接合并 main；没有批准不得合并整条 A/B HEAD 或扩大共享权限。
- **Gate O**：固定 SHA 离线 GitHub Actions/Bun/TS/三端 build。**Gate E NOT_RUN**：真实 Electron 虚拟屏/OS；**Gate L BLOCKED_NO_AUTH**：实际学校政策授权与 issuer；**Gate P NOT_RUN**：五位真实用户每人30分钟；**Release NO_GO**。不许把 Gate O、Mock/Fixture、SDK transport ID、Parser Accepted 当成真实业务授权。

## 2. 截至本次核验的真实四线固定节点

| 线 | PR、最新精确 SHA | 已完成的实证 |
|---|---|---|
| C | #144：67960811880e0a84bf62eb6f828ea6c72a101901 | 5/5 CI SUCCESS，PR 39340406876 Bun 4160 PASS/5 skip/0 fail，新增 10/10 Main 一次性人工删除确认专项；Baseline 39340406742、Batch 39340406718、D1 39340407022、D2 39340406724 全绿。C 正式签收 commit 4bb40300f60538b55ee1ddb5c4c1568b729a22f7。 |
| A | #143：341c01144a5960b47f915461ee9d5e26a570ae20 | R19-07 真 Pi SDK 0.86.1 × SIGKILL × 新 PID/独立 CAS 故障；3/3 CI，PR 39337965334 Bun 4177/5/0；不能冒充 C Host 物理 Receipt/外网 Provider/正常自动孤锁修复。 |
| B | #142：d96c3d176159cd12f4befd2a91bfeade44dca216 | R23 真 B1 作者历史+冻结、B2 多 ZIP 真物理原件/InputLedger 与重启只读预检，PR 39338187046 Bun 4245/5/0，专项 13/13，3/3 CI；历史 accepted 不等于当前选档来源可复用。 |
| I | #155：d9ba4ba54293963f8d962182548a627d52b566a3 | C 在交接本轮新签 A19 严格隔离子 PID/磁盘注入技术 Gate O：3/3 CI、PR 39339440133 Bun 4344/5/0、4/4 A R19-04 Git 来源文件 source/target 匹配、7/7 parent 依赖匹配、仅 6 个新增路径无 C 生产改动。正式 C commit 25dbba28c2d9d1d88f4f2f68df42cb3e39f4478c；回复 #144 issuecomment-6279716043。 |

I 血缘不可改：#152 I3 Stage3 8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b → #153 I4-A18 ec880cd6b5bc6779095fcbdddb143b1034d751c5（已签）→ #154 I4-B18 a74d513f3c990fe4b87401380a2eade8677b2163（已签，C commit 245024b392848f373c702716f3514b89bdd3856b）→ #155 A19 d9ba4ba54293963f8d962182548a627d52b566a3（**刚刚已签**）。来源批准不允许自行漂移至 A R19-05/06/07、B R19/20/23 新 HEAD。#155 内四份从 A R19-04 固定旧绿来源来的文件 **仅测试/worker 技术源**。

B R20 精确前置依赖已正式由 C 验收：B #142 SHA 984fbdda35590b39e8547860a025ef0db5a666b9，B20 facade review-v3-b1-b2-main-read-bundle-v3-b.ts 的 Git blob 2ff051fc5d18a2c0ef9465188a3611a71a0989ee，12/12 B1/B2/B19 联合测试、全量 Bun 4212/5/0、3/3 green；C 决策 B-R20-C-DEPENDENCY-ACCEPT-R01 **只是接收 B 完成源依赖，不是 C/I 已导入**。

## 3. C 已完成的具体业务能力与限制

1. **C0/C1：**共享业务类型与 Main actor 真伪门禁、原生 Case/Subject/状态事务、乐观 CAS + 幂等 Receipt、不可默默升级的 Canonical Plan、原件/current validity；始终由 C 决定业务最终信任。
2. **C2：**Main-only 已发布 Plan/issuer/current Case 原件 SHA 验证、C physical Host receipt registry/独立真实 Host witness、技术 Proposal/Run seal 安全边界。已签 R06 C SHA 7e80c5e782c0e7d5b41a804b11cd5cbe6a130c45 的 Run-wide tombstone 按 [caseId,runId] 禁止**本进程**迟到 Host ID 与 Owner attempt 变换后复活，8192 满则关闭 registry；**不是**跨 PID/冷重启持久围栏。
3. **C-MAIN-WIRE-R02：**真实 Electron review-ipc 已注册 AUTHOR_READ_LATEST_V3 和 UPGRADE_CANONICAL_PLAN_V3。Main 当前 frame/Owner/revision/安装代次检查，B1 作者 reader 与学校发布 Plan writer **独立**安装撤销。代码 current local-reviewer 只是 Main 当前本地 reviewer 身份，不是学校政策发布者；B1 source/School publisher 真安装仍没有完成。已签 C SHA 5005ecd7a034d6e983fca5e377d3da751e5a8811。
4. **C-MAIN-B20-R01：**Main-only 候选来源信任消费者 review-v3-main-b20-trusted-candidate-read.ts + tests，独立 current Main Principal/frame/Owner/epoch、pinned author revision/digest/frozenPlan 双次验证、安装 token 防旧请求复活，candidate-only/displayOnly、敏感 picker/issuer 不下发。已签 C SHA d5a61304ddb09c38fea7982623786f0ce56ed220，全量 Bun 4150/5/0、8/8 新案例。**注意：C 分支没有真实 B20 producer 导入。**
5. **最新 C-MAIN-REMOVAL-R01：**真实 UpgradeCanonicalPlanV3 Main handler 在 Case CAS 删除 Check 时必须消费独立 Main human-observed consent：完整 Check×target×object×subject×sourceVersionSet 清单、原/新 Plan fingerprint、Case revision、Principal/session/frame/Owner epoch/request/reason、5分钟 TTL；同 Main 观察源一次性 approval ID 在进程内卸载重装仍不复活，4096 满关门。签收 C SHA 67960811880e0a84bf62eb6f828ea6c72a101901，10/10 新测试+整仓 4160/5/0；此前 TS strict narrowing 失败与旧 fixture 漏注入观察源导致 Bun 4159/5/1 的首败均记录并修复，没有减弱生产 deny。**真实 Electron human observer/School issuer 未安装，用户 UI ACK 仍不能授权正式删除。** C-only 详情 C-MAIN-REMOVAL-R01-HUMAN-ONE-USE-ACK-20261020.md。

## 4. 最新实际发现的结构性缺口：不可跳过

本会话用 GitHub connector **直接查询 C #144 精确 HEAD**：
- C 分支不存在 B20 read facade review-v3-b1-b2-main-read-bundle-v3-b.ts；
- C 分支不存在 B19 candidate bridge review-v3-b1-b2-candidate-source-bridge.ts；
- C 分支不存在 B1 vault review-template-author-store-v3-b1.ts；
- C 分支不存在 B2 staging review-intake-adapter-v3-b2.ts 与 ZIP Vault review-import-checkpoint-v3-b2.ts。
- I #155 的已签来源树虽然有较早 B1 vault 与 B2 staging，**也没有 B19/B20 及 ZIP Vault**。

因此 C 现有 B20 gate 是**真实安全边界代码但离线、未挂真正 B 源**。新 Dev-C 第一批要先调查精确的 B20 完整 imports/dependency graph 和 C/I/B SHA 的重叠冲突，形成可回滚的**受 C 批准的有界源移植 + 合成锚点**；不得直接把当前 B #142 R23 整分支合入 C 或把 C 的 floating HEAD 偷渡到 I #155 accepted parent。不允许造第二个 B vault/Parser/ACL 来绕过缺依赖。I 可以执行经 C 批准的 non-C-owned source replay，但 C Main/Preload/IPC/Business Writer 始终仅由 C 修改。

## 5. 尚需完成的真实产品与工程包：建议次序

**P0 — 跨源收敛与真实可信 Main B20 读链接线（第一优先）**。核查 C/I/B 精确 HEAD、B1 vault + frozen、B2 staging ZIP Vault/parser/InputLedger/source version、B19 bridge、B20 facade 的物理原件依赖与 Git blob；锁来源、锁接受父树、列缺依赖、编制单独 C source CR 与独立联合 Gate O。再真正注入 **Main current authenticated Principal/session/senderFrame、Owner grant/generation/epoch、nativePicker 私有物理来源、当前 source selection registry、B1 revision digest/frozen fingerprint**；消费真实 B20 facade；必要时 C 自己新增只读 IPC/Preload DTO，不能把 Renderer 上报的 actor/source key/picker path 当权限。对多 ZIP/Subject/role/parser/旧 accepted/同 SHA 不同物理源/冷恢复/撤权重复跑完整正反例。没有源齐备先注明 CONTRACT_BLOCKED，再推进其他 C 自有持久化业务工作。

**P1 — 真实受信用户交互与正式发布。** B3 未匹配50模板就展示 unmatched 并允许 B1 第51套 candidate-held 作者入口，不能自动通用模板/正式政策。完成真实 Electron Main 人机删除确认观察器与用户能看到的完整义务差异确认；人工同意不能是 Renderer bool。真正 School policy issuer/模板 publish/revoke/权限 Gate L 需要学校正式文件，不可伪造；没有授权时用户界面必须给出可信阻断，而非 mock PASS。

**P2 — C Run/Host 跨 PID durable recovery。** C R06 in-memory tombstones 不覆盖进程崩溃，须在 C Case/Run/Owner durable CAS 内验证 revocation、abandoned write-lock、late Host、Run manifest、原件 bytes、学校 published Plan、seal 和 resumed run；A SIGKILL/冷 PID 测试是技术 evidence，不是 C business ACK。不能自动清残留写锁假装安全恢复。

**P3 — 整条用户可操作审核链+批量/后台会话可靠性。** 真拖入材料/路由/51套候选、作者 CAS/freeze、ZIP ledger & 原件授权、C Case/Subject、C Plan publisher/Run、A Pi SDK/Host receipts、前台 Check/证据/人工处置、冷重启/批量审核、错误恢复、三 OS 客户端；质量不能降为虚假的最小闭环。集中 Gate E 真 Electron/OS 虚拟屏与脱敏视频/日志；Gate P 五位真实用户×30min，须产品级误操作/报错/恢复记录。

**P4 — 发布/Policy 合规。** 学校 L Gate 的真实政策来源/授权、审查 50 套及 UNKNOWN/跨材料冲突/历史来源保全、各线 ABI 合并/回滚与联合 CI、完整 Gate E/P 通过后才讨论非 Draft 与 main；发布继续 NO_GO，不给无依据的“80%完成”数字。

## 6. 新 Dev-C 开工的明确次序和验收

第一步读 #145 唯一规则和 C 最新决策，核实 #144 与 #155/#142/#143 HEAD 与 CI，不用老 SHA 当新 SHA。第二步只读差异/血缘/source graph 核对缺源，选定来源锁的 C/I 新有界合成方案（必要时 C CR 批准 I 只搬 non-C-owned），同时开始 C 自己的真实 Main authority/native picker 或 C Run durable 模块。第三步实打实修改生产代码与至少一组正反例、在 Draft 提交，每次失败日志完整保留，最终同 SHA PR CI/附属 CI 100% 成功才 C 签 Gate O；文件 provenance/ref 不精准就不能签。第四步更新最新 #145 的 C marker + 本 C-only 文档，及时核批 I/A/B 对 C 的真实 CR，绝不因跨线等待停工。

新会话可以优先读取这些 C-only 材料：C-MAIN-B20-R01-TRUSTED-CANDIDATE-READ-BOUNDARY-20261020.md、C-MAIN-REMOVAL-R01-HUMAN-ONE-USE-ACK-20261020.md、C-R06-PHYSICAL-HOST-RUNWIDE-TOMBSTONE-20261020.md。历史 C0/上下文再按实际任务增量取，不要把所有历史调研一股脑重读。真正共同规则只有 #145，**其他 A/B/I 不必为这份 C-only 会话交接做任何事情**。
