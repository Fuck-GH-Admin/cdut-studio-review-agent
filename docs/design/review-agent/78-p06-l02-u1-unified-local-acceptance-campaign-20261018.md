# 78｜P06 L02-U1｜统一本机集中验收任务书（单 Agent / 单次活动 / 统一证据）

> **2026-10-18 执行入口：本文件取代 73 号与 76 号作为“下一次本机 Agent 的启动任务”，两者仅作为细项技术规范和已有风险参考。**
> 目标是一次本机集中运行中解决剩余 **Pi Provider、完整五工具授权、真实 Renderer 运行、I/O 满卷与跨 PID、P02/Office 最小兼容、V2 SourceRef、A/B/C** 的验证；不是为了反复做相同构建/安装/重启或把若干独立任务拼成多次验收。
> **执行的本机 Agent 必须实际运行、诊断、保留原始首败、必要时最小修复和有针对性重测**，最终只提交 **一份统一结果、一套有标识的证据、一份独立 Draft PR**。禁止只生成计划。当前已完成的远程工作和既有实机专项验收不可冒充本轮新证据。

## 0. 固定基线、已有结论与尚缺的唯一证据

本轮计划基于审核仓库 Draft PR #116；创建本机 worktree **前先查远端 #116 最新 HEAD/tree、PR #115、#114、#113、#110、#108、#105、main、CI 和未合并并发 PR**。编写任务书时 #116 HEAD 为 `afe3fd4133fa203611190a066c6247125fd13632`，但**这是快照，不是未来执行的授权固定 SHA**：本机应以执行开始时 #116 的真实最新 HEAD 记录为 `CANDIDATE_SHA`，整个运行期间冻结代码和构建。如果任何新修改进入 #116，不能自动吸收，先按变更影响重新冻结。不可自行合并上述 PR。

| 来源 | 已有可靠结论 | 集中验收策略 |
| --- | --- | --- |
| PR #108 | P02 普通 Agent 删除后迟到 metadata 复活：真实 Electron 定向通过 | 不重跑 7 项，保留 1 条删除/预览隔离兼容烟测 |
| PR #113 | Office #71 DOCX/XLSX/PPTX 同名异路径、改版、锚点等真实 Electron 专项通过 | 不重跑 O71-01～09；做 1 条混合来源同名材料/SourceRef 冒烟；上游原项目移植依然单列阻断 |
| PR #114 | Main V2 有效 binding、五工具白名单、撤权、非 user trigger / 普通正例：受控 5/5 | 本次抓**真实** SDK+Main callback，不把旧 WitnessAdapter 结果算 Provider |
| PR #115 | 真实 Renderer→preload→Main ACK、Pi SDK active/model-facing 五工具 PASS_SCOPED；无合法 Provider 凭据，在线调用零次，A/B/C 未运行 | 复用已知探针/启动流程；真正补 Provider 收据、离开后恢复、运行中撤权、普通 Agent 正例 |
| PR #116 | Linux `/dev/full` 真实 kernel ENOSPC、运行与撤权写盘失败受控测试通过 | 不重复搭受控 fixture；若安全条件满足，以独立满卷测试卷和不同 Electron PID 补真正恢复 |
| L02-00 | 旧九案已有历史归因，**没有本轮获批准的新业务 LIVE 闭环** | 真 Provider S0 通过才开新合成 A/B/C，不以历史案替代 |
| Office #71 上游 | `Nya-Angle/CDUT-Studio` 创建分支此前 403 | 单列 `UPSTREAM_PORT_BLOCKED_ACCESS`，不拿验收 Agent 在本轮重复尝试权限问题 |

**总状态初始冻结**：`P06 PARTIAL / P06-S02 NOT ACCEPTED / U1_FULL NOT ACCEPTED / L02-00 EXIT NOT ACCEPTED / L02-01 NOT ADMITTED / MERGE NO-GO`。只有证据达到各门槛才能讨论修改。不得编辑 29 个唯一 LIVE 记录、旧 P02/Office RED/Gold 或正式业务真实数据。

## 1. 最节省时间的一次执行组织

**单个 Agent、单个工单、单个 worktree、单次安装/构建、统一私有证据根目录、统一测试清单。** 不等于所有测试共用同一个 profile：应在同一证据根目录下按阶段创建 **独立的 profile 子目录 / 合成案卷 / 真正受限测试卷**，把身份、服务端口、PID、磁盘故障状态隔离，避免错误继承导致误报。

- **阶段 0｜一次预检与基线锁**：锁定 `CANDIDATE_SHA`、tree、build hash、CI/checkout tree；检查 Bun/Electron 版本、可执行构建、loopback CDP 端口、测试卷隔离/挂载权限、**用户已授权的合成 Provider 测试凭据是否在本机可用**、预算/次数上限、私有证据路径。无凭据不必询问或停整个活动，标 `PROVIDER_BLOCKED_ENV` 并继续离线子项。
- **阶段 1｜共用一次环境准备**：`bun install --frozen-lockfile`、typecheck、check:boundaries、Main/Preload/Renderer build、指定受控回归、一次必要全仓测试。保存标准输出、exit、SHA-256。CI 通过不替代本机实机结果；若构建失败停止所有依赖该二进制的实机任务，但保留能执行的源码回归并归因。
- **阶段 2｜真实无 Provider Electron 快速闭环**：在同一进程/隔离 profile 执行安全 IPC ACK、SDK 实际 tool list、隐藏 Owner、撤权和旧绑定负例、普通 Agent 正例、真实 UI 跳页/返回、P02+Office 最小烟测。只对“需要进程重启”的场景重启；其余不要每项重启 GUI。
- **阶段 3A｜真实 I/O 故障 + 跨 PID**：仅在独立受限测试卷经验证安全时运行；用新的合成 case/profile/mount，记录真实 `ENOSPC`、主记录、.tmp/.bak、tombstone，关闭旧 Electron PID 并启动不同 PID，检验旧授权拒止、修复后的新 run/普通 Agent。若没有隔离挂载权限，保持 `BLOCKED_ENV`，不能填满宿主分区。
- **阶段 3B｜真实 Provider**（与 3A 相互独立）：如有**获授权测试凭据**，使用新隔离 profile、合成材料、有限预算完成五工具调用，记录 Provider→Pi SDK→Main→V2 receipts；若没有凭据，这条标 `BLOCKED_ENV`，但 3A 和阶段 2 继续完成。不要在故障满卷的 profile 内启动 Provider。
- **阶段 4｜业务 A/B/C**：**仅当 3B 真 Provider 的必要安全 S0 正反门禁通过**，继续在同次活动中执行全新 A/B/C；否则三项明确 `NOT-RUN_GATE`，保留本次其他检查。
- **阶段 5｜一次汇总、有限修复、差分复验**：按 `PRODUCT_FAIL / HARNESS_FAIL / BLOCKED_ENV / DEFERRED_UPSTREAM / PASS` 分类。若有明确的本仓生产缺陷，先保留完整 RED，再在**单独本地修复提交**最小改动；每次代码改变重锁新 SHA，重跑受影响项目、相关负例及必要全仓回归，不重跑无关已通过场景。最终**一次统一 Draft PR** 与统一结论，描述所有迭代前后 SHA，不得拿不同代码 SHA 的零散 PASS 拼成同一版完整 PASS。

每个阶段**允许跳过因条件不满足的任务，但不允许绕过必须先通过的安全门禁**。统一执行的含义是合并环境管理和采证，不是用一个“全 PASS”掩盖不同等级。

## 2. 统一执行矩阵（一次活动中记录每条）

| 统一 ID | 实际检查与必须保留的真证据 | 阶段 / 阻断处理 |
| --- | --- | --- |
| U-00 | PR #116 最新 HEAD/tree、工作树、实际 binary/build hash、所有相关旧 PR SHA、CI、干净 profile、时间/端口/PID 清单 | 前置，未完成不得签任何后续实机 |
| U-01 | Electron 真实 Renderer→preload→Main 点击启动（能 GUI 点击优先，CDP API 作为独立限定子集），`accepted` ACK runId 与 V2 一致；页面离开、返回时从 Main 恢复正在执行的 run | 无 Provider 时可验证启动/失败记录及页面切换，**不能**冒充正常持续在线运行 |
| U-02 | 真 Pi SDK 创建 session，`active tools` 与模型上下文均为 **五项**（四个 review + CompactContext）；内部 `getAllTools` 的八个 inactive 定义如仍存在必须如实注明 | 不依赖 Provider；记录 Main binding 与 SDK context 的配对哈希 |
| U-03 | review-case owner 普通列表/检索/元数据/预览/事件拒止；无 binding、wrong preset、wrong trigger、跨案 owner 拒止；合法普通 Agent 读权限和只读预览正例 | Main/IPC 正反对照，不能只看 UI 不显示 |
| U-04 | 当前合法真实轮次 `canUseTool` 五项允许、Read/Write/Bash/MCP 等越权工具拒止；**区分受控 Main callback 和真实 Provider 产生的 tool call** | 无 Provider 仅 `CONTROLLED/SDK_SCOPED`；不得写 `PROVIDER_PASS` |
| U-05 | P02 最小冒烟：普通 session 真 IPC 删除后 Main meta null，迟到查询不重建 Preview；Office 同名两源/锚点最小冒烟：索引和 SourceRef 不混案 | 只做 2 条，不展开旧 7+9 全量用例 |
| U-06 | 独立小卷真实满卷，真 errno `ENOSPC` + 卷容量与 fs/mountID、V2 running 原字节 hash、旧授权即刻隔离 | 若 mount/卷隔离不可信立即 `BLOCKED_ENV`，绝不填宿主盘；`/dev/full` 不替代 |
| U-07 | revoke JSON/原子替换双失写；重启到不同 Electron PID；旧 assignment/run 在新 PID 下不可复活，owner journal/tombstone 隔离；容量解除后 failed 状态持久化 | 与 U-06 同一安全卷，保留重启前后真实 IPC/hash |
| U-08 | 故障后的新合法 run/assignment/普通 Agent 正例；stop-pending、旧 callback 与新 run 不串，残缺 tmp、旧 bak、owner index 故障仍 fail closed | 不需要 Provider，需真实 Main 生命周期 |
| U-09 | 真 Provider 生成的工具调用及真实 `tool_use → Main canUseTool → tool execution → receipt → V2 read/SourceRef` 串联，包含读取文本、图片、原件、提交结果和 CompactContext（如真的执行） | 无授权测试凭据则整项 `BLOCKED_ENV`，不得制造伪造 transcript |
| U-10 | 在线工具调用期间 revoke/stop/跨案/旧版材料/旧工具 handle，五工具含 CompactContext 失效；延迟视觉回执不可写入新 run | 依赖 U-09 安全在线用例；正反 test 必须安全且合成 |
| U-11 | 普通 Agent 的真实 Pi Provider 工具与授权路径保持正常；真实压缩前后 owner/review scope 不漂移 | 有 Provider 才能签对应在线/压缩项目；无 Provider 允许单独普通 IPC 冒烟 |
| U-12 | A：真实新合成案 100 元且证据充分，预期 compliant **建议**，不自动批准；B：120 元且证据充分，预期 non-compliant，有准确 SourceRef；C：缺金额，不允许猜造，待补件/待确认 | 必须 U-09/U-10 的 S0 关键正反例已通过。每案独立 case/run/turn/assignment、Provider receipts/V2 coverage |
| U-13 | 跨阶段汇总：旧专项基线和本轮所有状态、与 Office 上游 403 的独立交付差距；记录未通过项下一步可执行修复，不回写历史 | 一次统一报告，按证据分层签署 |

**特别提醒**：`CompactContext` 被注册/允许不等于实际触发过压缩；不能为了追求 PASS 而绕过 SDK 的正常上下文策略。Provider 如果无法可靠引导模型实际调用某个工具，则该**工具项**标 `NOT-RUN`，并保留真实尝试次数与预算消耗。

## 3. 停止线与如何减少重复劳动

- 执行前先做 **一次 preflight inventory**，包括 Provider 授权是否实际存在、独立测试卷隔离是否可以无害完成、安全测试材料可否生成。不能做到的直接打预期 blocker，不做无意义的绕圈尝试。
- **并发只用于互不影响的静态分析**；不得并行运行共享 Main/session index/assignment ledger 的故障写入测试。每个 lane 的 caseId/runId/sessionId/assignmentId 和 config folder 必须独立，进程 PID 可审计。
- U-03 身份隔离、U-04 受控权限出现 **PRODUCT_FAIL** 时，该安全 profile 终止后续在线工具和 A/B/C；不妨碍另一个独立安全 profile 完成 I/O 路线。
- U-06 真独立卷隔离无法保证时禁止强行模拟装作真实通过，但继续所有其他 lane。
- Provider 渠道无凭证时，**统一执行不会自动补上凭据**；在无网络隔离证据下在线项目 BLOCKED_ENV，A/B/C 不启动。唯一可做的是真实 Main/SDK/IPC 和 I/O 任务的价值回收。
- 新发现 bug 可以在本轮集中形成问题清单，但禁止为“全绿”悄悄修改预期。修复后差分复跑，结果附 `oldSHA/newSHA`；旧来源结果仍作为历史，不自动变成新 SHA 的成功。
- 若修复量超出安全预算/范围，也不反复启动另一轮：留 `OPEN_PRODUCT_DEFECT`、最小复现和独立后续工程任务；整体不接受。

## 4. 证据结构与唯一交付物

在统一的**新本机验收分支**（建议 `audit/p06-l02-u1-unified-local-r01`）使用一份新的受限私有证据目录和公开脱敏目录：

```text
docs/design/review-agent/acceptance/p06-u1-unified-local-r01/
  README.md
  candidate-lock.json                # parent SHA, tested SHA/tree, build SHA, CI
  preflight-environment-redacted.json # provider readiness, safe volume capability, no secrets
  command-ledger.json                 # all attempts, exit codes, private stdout/stderr SHA
  unified-matrix.json                 # U-00..U-13, status, gate, exact candidate SHA
  io-fault-timeline-redacted.json     # real errno/mount/PID/hash, or explicit BLOCKED_ENV
  pi-tool-receipt-index.json          # real SDK/Main/Provider/V2 chain, empty if blocked
  abc-matrix.json                     # no empty pseudo-success; if blocked record NOT-RUN
  defects-and-first-failures.json     # preserve RED/harness errors and retests
  evidence-index.json
  SHA256SUMS
docs/design/review-agent/79-p06-l02-u1-unified-local-result-20261018.md
```

私有日志、原始技术 ID、实际模型 transcript、授权 provider 配置、screenshots/trace 都放在仅本机 `0700` 目录。脱敏公共文件引用不可逆 SHA-256 和命令索引，但不要公开用户或学校真实材料。若有修复，在同一个本地 Draft PR 中以**分离的测试/生产 commit**保留差异，不能修改冻结旧 PR 或上游文件。

最终报告必须分别签：`P02_COMPAT`、`OFFICE71_COMPAT`、`PI_MAIN_IPC`、`PI_SDK_ACTIVE_TOOLS`、`PI_MAIN_AUTH`、`PI_PROVIDER_TOOL_RECEIPTS`、`IO_KERNEL_ENOSPC`、`IO_REAL_SMALL_VOLUME`、`IO_CROSS_PID`、`A/B/C`、`OFFICE71_UPSTREAM_PORT`、`U1_FULL`、`L02-00 EXIT`、`L02-01 ENTRY`。不能通过一项以“总体通过”覆盖其余未运行项。

## 5. 本地 Agent 唯一启动提示词（直接复制使用）

你是 CDUT Studio 审核后台 P06 L02-U1 的**集中本机独立验收 Agent**，仓库 `https://github.com/Fuck-GH-Admin/cdut-studio-review-agent`。本轮只从 **Draft PR #116 的最新 HEAD** 冻结独立 worktree，完整阅读并**实际执行** `docs/design/review-agent/78-p06-l02-u1-unified-local-acceptance-campaign-20261018.md`。同时读取 `AGENTS.md`、74–76、72–73、68、71 和历史 PR #105/#108/#113/#114/#115 的固定证据；不重复制作计划，不修改原始 Gold、29 LIVE、旧 PR 或上游仓库。

**一次 Agent 活动完成统一 preflight、一次构建/安装、风险定向冒烟、真实 Electron/Main/IPC、五工具 SDK/授权、独立安全满卷与跨 PID、在合法 Provider 凭据可用且 S0 严格通过时的新 A/B/C。** 凭据缺失仅阻断在线 lane，独立磁盘故障不可安全执行仅阻断对应 lane；继续跑剩余有价值的部分，绝不伪造实际 Provider/满卷证据。使用独立合成 profile 和 case，原始日志仅本机保留、公开材料脱敏哈希可核验。

不要每个检查新开会话/新 worktree/重复全仓构建。遇到产品缺陷记录真实首败并在本次活动有限最小修复 + 差分重测；产出**一套** `acceptance/p06-u1-unified-local-r01/` 与 **79 号统一结果**，新建一个独立 Draft PR；把 PASS/FAIL/BLOCKED/NOT-RUN 与精确测试版本一一对应。绝不因为集中运行而绕过安全依赖或擅自放行 L02-01、合并任何已有 PR。
