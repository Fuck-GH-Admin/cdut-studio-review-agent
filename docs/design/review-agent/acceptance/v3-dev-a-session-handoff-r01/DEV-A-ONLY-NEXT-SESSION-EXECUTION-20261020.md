# CDUT Studio Review V3｜新 Dev-A 会话正式接手任务书（A 专属，2026-10-20）

> **A_ONLY_NEXT_SESSION_TASK / NOT_SHARED_ABCI_POLICY / NOT_REQUIRED_FOR_B_C_I**
>
> 用途：用户把本任务书或下方提示词交给新 Dev-A，会话读取后直接恢复真实生产工程。本文只在 A-only 目录保存交接和执行顺序；不得解释为新四线共同规范、C 对 Main 写入的委托或 I2 自动升级授权。原唯一四线协议 #145 和 C 最新 DECISIONS:C 权威不变。

## 必须先锁定的事实

- 仓库 https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- Dev-A Draft PR #143：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143
- Dev-A 分支 feat/v3-dev-a-pi-execution-r01
- 接手前固定 A SHA **1f1f5d1499cb59c813d590aa407189ba05f65f10**，C0 源 **5682057c7232c914e72fdae525ce95fd33f32b53**
- R13 exact 3/3 Gate O PASS：PR CI 39296623502（4145 pass、5 skip、0 fail，471 files）、D2 39296623298、Baseline 39296623275，均 completed/success，源码 typecheck/build/full tests 实际通过；**E 尚未真实执行，L 无授权，P 未执行。**
- 唯一四线共约 Draft #145：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145
- C 工程 #144 最新 C2-R02 SHA **34c7ea3bd881504302d2682aad79065c0ef9a24c**，5/5 CI PASS，C Main trusted Host/source port 生产回调仍未真实接 A SDK/Host registry。
- I2 工程 #148：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/148，当前最后核验 SHA **89a8c52bdaa407f0b8b99a17b2ecc8475e776e57**，3/3 CI PASS，但 C 最终工程签收需新核；I2 A 冻结来源仍为 **R12 c0132ae06de8ae09ab021ac231ffd34756eb5990**，不是最新 R13。I2 只选择性导入 A 的 9 blob，A4-R13/Provider 没有全部集成。
- C 接线申请 **CR-A-PI-HTTP-WITNESS-R01** 已由 A 留在 C #144 评论：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6273618639 。截至交接时未在 C 决议区发现正式 Main 生产修改租约；接手后先重查。

## 必须按顺序完成的读取

1. **第一优先级**：当前协调分支 docs/v3-integrator-i-r01-taskbook 的 docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md。读当前 blob/HEAD、所有长期权限、最新 STATUS:A/C/I、C 的 DECISIONS:C。先验证是否有新 CR 批准、I2 变更；唯一共同协议不可由本 A-only 文档取代。A 不得编辑 C 决议或别线状态。
2. **第二优先级——本会话接续**：docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/DEV-A-ONLY-SESSION-HANDOFF-20261020.md。该文档明确标记 A_ONLY_SESSION_MEMORY，B/C/I 无需读取。
3. **第三优先级——真实 A 工程**：从 #143 精确分支读取 docs/design/review-agent/acceptance/v3-dev-a-r01/DEV-A-CURRENT-PROGRESS-AND-GATES.md、DEV-A-R01-IMPLEMENTATION-AND-HANDOFF.md、A4-R10-PI-0861-TRANSPORT-EVIDENCE-AND-INTEGRATION-CR.md、A4-R11-TYPECHECK-REMEDIATION-AND-EXACT-SHA-GATE-O.md、A4-R12-PI-SDK-SESSION-LIFECYCLE-AND-GATE-E.md、A4-R13-PI-NATIVE-SETTLED-AND-FAULT-QUARANTINE.md，并阅读 A-owned Pi Owner/proposal/SDK physical port/Pi HTTP engine/dispatch fence/bridge 的真实源码和测试。历史文件按当时 SHA 理解。
4. **第四优先级——跨线接口现状**：C #144 的 review-v3-main-trust-port.ts + review-v3-main-trust-port.test.ts、review-v3-run-writer.ts、review-v3-technical-ledger.ts，I2 #148 的精确来源锁、实际 PR 状态和 C 是否签 I2。只读核验；尚未获批不能修改 C 文件或覆盖 I 的固定锚点。

## 当前任务和建议下一工程批次：A4-R14

- **当前主要目标**：从已经 R13 Gate O 全绿的 A-only 技术保护进一步走向真实 Pi SDK/Provider 可信物理请求回执与故障恢复，而不是再次设计一套没有运行证据的泛抽象。
- **第一节点**：固定新看到的 A/C/I2 SHA、C CR 状态，核实真实 Pi 0.86.1 的 turn_start/end、agent_end(willRetry)、agent_settled、streamFunction / API fetch、SDK retry/onResponse/HTTP stream EOF、AgentSession.dispose 在本项目 patched 包与 existing proxy/sanitizer 下的表现；必要时精确检查相关上游 commit/本仓 patches。留存源码定位和风险账。
- **第二节点**：聚焦 A-owned 的物理回执关键失败窗口：HTTP 已响应但 SSE/模型未结清、Provider 真实/透明重试、网络 disconnect、Main Abort 与 SDK worker 未停止、跨 PID/new run 误重派、原 Host 成功但 Main CAS 未入库、重复 native receipt、图片降级触发二次 Provider 请求、cold registry 丢失。能做的可信离线故障注入/真 OS 测试可提前做，**但合成 Provider 不可升级 Gate E**。发现实际问题先修 A 自有生产文件并加负例。
- **第三节点**：对 C 新 Main trusted Host port 写清只读的 exact API 差分、真实 Host registry 及 owner/grant/current/source/Plan/Run 身份链缺项，追踪 C 的 CR-A-PI-HTTP-WITNESS-R01 明确结果。**只有 C 在 DECISIONS:C 发布逐文件、逐函数、基准 SHA、授权主体、测试和失效条件的 Main 租约后才能动对应 C-owned 生产代码**。最好由 C 自己改 C 主进程，或授权 I 只做窄 glue；A 在自己代码里准备受信 SDK factory/Host source adapter。
- **第四节点：准确 Gate O**。每批代码停在唯一 SHA，PR CI + D2 + Baseline 全套实际 PASS，记录 install/typecheck/boundaries/skin/Main/Preload/Renderer builds/Bun full、失败首行与 job IDs、真正 PASS/FAIL/SKIP；首败只修 A own 后新 SHA 全部重验，严禁继承 R13 已绿结论。
- **第五节点：真实 Gate E**。只有合法目标机、实际 Electron/Main、真实 Pi SDK/Provider 授权、真实 HTTPS/SSE request-id/stream/trace 和退出恢复证据才能讨论 E 是否 PASS；若无凭据/学校授权或 C 接线租约，则必须明确记 NOT_RUN/BLOCKED，不得伪造 Provider/学校回执或要求用户每个小点都做虚拟屏操作。
- **第六节点：给 I2 交付 source**。若 A R14 达 Gate O，提交精确 source SHA/path/blob、需要 C/I 协作的接口 CR；由 C 另签新 I2 source lock，I 逐片引入/联合负例/单 SHA Gate O、C 正式签收。不要自动把 #143 移动 HEAD 当作 I2 输入。

## 不允许发生的事

- 不做新一轮 V1/V2/V3 无边界考古，不重复 C 的 Case/Run/Decision/Outbox writer，不创建第二套“正式 Run ACK”。
- 不改共享 types、C Main/Preload/IPC/Run/Case 正式业务文件、B policy/publisher/Gold，除非 C 明确授权；I Main read-only lease 仍 CONDITIONAL_NOT_ACTIVE，Business writer DENIED。
- 不让 Renderer/model 自称身份，不用 assistant UUID、agent_end 单事件或合成 HTTP header 当原生可信物理 Provider 完成；不因网络超时推断 Provider 已停止、不得自动重发未知副作用。
- 不降低 strict TypeScript、删除旧负例、把 test skipped 当 pass、不按不同 SHA 拼凑 Gate O、未签合并 main、不改写已签 I1/I2 来源历史。
- 不向 #143 增加“仅为切换聊天会话”的纯文档 commit；本 A-only handoff 与本任务书已经存放在 #145 协调分支的独立 A-only 目录。A 专属进度记在 A 原有工程 docs；#145 只更新 STATUS:A。

## 新会话的实际回复和交付标准

开始时给用户简明的**固定 SHA、真实 Gate O、未签 Gate E/L/P、C CR/最新 I2 锁源、拟实施 R14 工作范围**。随后进行代码核查、必要的真实工程实现、GitHub commit、专项测试/CI 与用户可点击的 Draft PR/文档链接。不停在抽象计划，不反复要求用户补已经提供的条件，也不将受限执行环境伪称测试通过。优先提高每批实际开发含量，集中验收。
