# CDUT Studio Review V3 — C-MAIN-WIRE-R02 独立权威安装与撤销代次（2026-10-20）

> **C-ONLY ENGINEERING EVIDENCE / NOT_ABCI_SHARED_POLICY / NOT_AUTHORIZATION**。
> 只供 Dev-C 和用户复核。A/B/I 不必阅读/ACK。所有正式跨线权限只存在 #145 唯一共同协议的 DECISIONS:C。

## 1. 精确工程来源

- 工程 Draft PR #144，分支 `feat/v3-dev-c-business-r01`，起点已签 C-MAIN-WIRE-R01 `331519d3833e254c7d54c18605b50f3252582517`（5/5 旧 Gate O）。
- R02 第 1 提交 `de2dcf2c2d15d8f5e352836b445b69a1e34d2d41`：**C-owned** `apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts`。
- R02 第 2 提交 `5005ecd7a034d6e983fca5e377d3da751e5a8811`：**C-owned** `apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.test.ts` 新增 6 项真实注册 handler 正反例。
- R02 新 Source Gate O **不继承 R01 旧绿**。GitHub 本批各测试实际结果以同 SHA 最新 CI 为准；此文档初次写入时 PR CI `39324903439`、Baseline `39324903425`、Batch `39324903466`、D1 `39324903396`、D2 `39324903435` 仍在收集中，不宣布 5/5 签收。

## 2. 真实实现

此前 `CMainV3AuthorPlanAuthorities` 强制 B1 candidate reader 与 School published issuer/Case writer **同时安装**；即便是合法本地作者只读，也因为校方尚无发行机构而默认拒绝。正确策略是不降低升级 Plan 安全门槛，而是拆分互相独立、仍 fail-closed 的 **Main-only** 安装槽：

- `installCMainV3AuthorReadAuthorities` / `CMainV3AuthorReadAuthorities`：需要 Main 的真实 Author Owner generation+epoch、mainFrame Principal、`canReadAuthor` 及 B1 全链 `readB1AuthorRevision`；**不依赖、不生成、也不宣称 School publisher**，输出仍是 `candidate-held/displayOnly`。
- `installCMainV3PlanUpgradeAuthorities` / `CMainV3PlanUpgradeAuthorities`：需要独立 Case Owner grant、canUpgradeCase 和真实 `C2MainPublishedPlanSource`；`C2MainPublishedPlanProvenance` 在同一原生 Case CAS 重新验证真实发行原件、历史 Plan 与 Case 物理源，删除 Check 仍要完整 `CMainUpgradeRemovalAck`；无 publisher/无授权继续拒绝。
- 兼容旧 `installCMainV3AuthorPlanAuthorities`：只有两个槽都空时才一次安装两个 Main 权威；已有任意分装则拒绝劫持，不允许替换已有来源。
- 撤销安全：每次安装形成 **独立 token 的 installation 实例**，不能只比较 callback/source JavaScript 对象的引用；撤销后把同一个源对象重新安装也不允许旧 in-flight B1 read 或旧 Case CAS 回调复活。

## 3. 新增 6 项覆盖与预期

1. 独立合法 reader 仅能读取 `candidate-held`，缺 publisher 的 Plan upgrade 拒绝且 Receipt 不增加。
2. 独立合法 published Case writer 可按原 C CAS 合同提交一次升级，但缺 B1 reader 时不能读作者草稿；此为**受信测试 fixture**，并不表示学校授予真实 publisher。
3. 撤销 writer 不影响合规 reader display，writer 调用立即拒绝。
4. 在 B1 异步历史读取边界卸载/**同对象重装**，原调用拒绝。
5. 在 Case CAS publisher 边界卸载/**同对象重装**，原调用不得生成新 Receipt。
6. 旧 combined installer 遇到独立 writer/reader 槽不许接管，重复安装拒绝。

另保留 R01 原有 8 个注册 Main handler 正反例。所有受信测试 `local-reviewer`、fake published source 只在 Bun 离线测试内部；生产默认没有安装真实权威源。

## 4. 尚未解决的真实依赖及禁止范围

1. Dev-B B1 全链候选作者账本：B 已绿 R18 源 `263b7f36034cacd4d51a00edd5f39266c37037fa`，`review-template-author-store-v3-b1.ts@065251ca843c51e68e225dc688bb7a8caab2fea7` 导出 `readB1AuthorRevision`；依赖 `review-template-plan-adapter-v3-b1.ts@974f0b0d127301ed71ad10df5ae64623ce378882`（以及既有 C0 shared/config-paths）。目前**这些真实 B-owned 文件并未进入 C #144**，不可通过 dummy reader、重写 B vault 或自动合并整个 B 分支替代。
2. 同源 B Main candidate author port `review-template-author-main-port-v3-b1.ts@1a046806994f76cca51267c62fd931a458983a7a` 仅持有候选 save/preview/freeze 的技术入口，不验证学校政策。它需要真实 Main authenticated Principal/Owner/permission registry；目前 **未在正式 Main 安装**。
3. Owner generation/canReadAuthor 真实来源尚缺；`local-reviewer` 仅是活着的 C0 mainFrame 身份，**不是教师/校方 policy Publisher**；不得固定 `canRead=true` 充数。
4. 人工删除 Check 的 Main-issued、不可重放、绑定 Principal/Subject/old+new Plans 的确认挑战仍待下一 C 工程批次；Renderer 二次确认 JSON 不等于信任证明。
5. 实际 Gate E Linux/Windows/macOS、校方来源 Gate L、真人产品 Gate P 均未通过；Release NO_GO。不得授权 I C-owned hunk 或浮动 A/B HEAD。

## 5. 集中 Gate E 验收矩阵（本机虚拟屏）

在有真实 main-frame、真实 B1 作者账本+可信 read-grant 且依旧无学校 issuer 的隔离 profile：
- 正例：Main 主窗打开 B1 候选 → 保存 Revision → 重新加载/重开 Main → 读回相同 digest/revision/candidate-held，只用于 diff/导出；不自动丢弃用户未保存内容。
- 负例：子 frame/导航/窗口关闭/窗口重建/跨模板/Owner revoke+rotation/reader 卸载后旧 in-flight read 均拒绝；同源重新安装不复活旧 request。
- 正例/负例分离：缺 school issuer 的 Plan upgrade 一律拒绝，`state.v2.json` revision、old PlanHistory、Receipt 数和原件 bytes sha256 均不变；只有真实发行机构 Gate L 具备后才设计生产写入 Gate E。
- 每场记录机型和 OS、Electron/Preload 当前 SHA、脱敏屏幕录像、IPC 拒绝原因、Main 主窗口/frame 和 Owner epoch、Case state 前后 hash、PID、原件 sha256、测试结果；不可只写截图看起来正常。

**结论截至文档创建**：真实的独立安装代码与 6 个回归测试已经提交；同 SHA GitHub Gate O 尚需完成，本地真实 Electron/学校/真人 UAT 仍未运行。本文件不得被当作 Gate E/L/P 签收。
