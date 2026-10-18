# P06 集中验收 r01｜E05 + E06 逐场景正反矩阵

状态列为**计划**而非结果。实际结果必须保存到 `scenario-matrix.json`，逐项引用真实现场证据。每行独立判定：`PASS` / `FAIL` / `NOT-RUN` / `BLOCKED_ENV` / `BLOCKED_AUTH` / `BLOCKED_PRODUCT` / `BLOCKED_EXTERNAL`；`CORRECT_DENIAL` 是观测到的安全行为类型而非整行 PASS 的替代物。

## U0 / U1 共用无付费门禁

| ID | 场景（正反覆盖） | 成功/正确拒止条件 | 必需证据 |
| --- | --- | --- | --- |
| PRE-01 | PR #127 SHA/tree 与 PR #121 基线、#118 冻结基线、git worktree | 1 个固定 HEAD、净工作树、最新 CI 同 SHA；任何不一致 STOP | candidate lock、git 命令退出、CI run ID |
| PRE-02 | Electron/Main/Renderer/CDP 真实目标与独立 profile | Main/Renderer 来自同一构建、PID/端口核对，测试数据不进入真实 profile | build hash、PID、启动命令、环境别名 |
| PRE-03 | 授权 Pi、测试额度与资料隔离 | 现有合法配置可读，不向公开仓泄露渠道 ID / token；无凭据＝BLOCKED_AUTH | 脱敏 provider 类别与 preflight |
| PRE-04 | 既有受控回归与 E06 QA 合同 | Bun test、typecheck/构建与 Node 脚本检查成功；不能替代实机 | CLI exit、Actions 链接和 log hash |

## E05｜L02-01 真实业务闭环（同日独立记录）

| ID | 现场操作 | 必须断言的正/负判词 | 保存 |
| --- | --- | --- | --- |
| E05-01 | 创建合成 A/B/C；记录模板、政策、材料版、引用与冻结 Gold | 三案互相独立，初始版本/SourceRef 可追踪；旧 C `execution-failed` 不篡改 | 版本表、各案原件/哈希、Gold 单独私存 |
| E05-02 | Pi 真 run + Main ACK + V2 Run 持久化 | 真 tool-use 和 SDK/provider 回执指向同一 case/run/assignment；技术 `done` 不生成审批 | provider witness、Run/inputManifest、V2 前后像 |
| E05-03 | 人工 stage-pass / final-pass / final-reject | 终审必须绑定真实未过期 Run、inputHash、当前模板；合法权限可用，缺 Run/伪造哈希/旧材料 fail-closed | task/decisions/revision、拒止错误码 |
| E05-04 | 身份隔离 | 学生/普通 Agent/Renderer 自称 school/teacher/system 均不能获得签批；本地 reviewer 不冒充校方 | Main IPC 正反回执、角色绑定证明 |
| E05-05 | 审核准备度反例 | 零有效规则、未读原件、悬而未决 check、未确认事实、证据候选/缺 adjudication 不能最终 PASS | blockers、Run/receipts、零写入证明 |
| E05-06 | 人工补件：open→responded→insufficient→新回复→satisfied | 仅当前有效文档 version IDs；旧/伪造/重复 ID 和同毫秒旧 Run 拒止；同 requestId 幂等 | response history、doc versions、Run 时间线 |
| E05-07 | 两条补件仅满足其一及回审 | 未全部满足不得重审；满足后恢复来源 stage/task，未产生多份重复任务 | task/round、supplement 状态、V2 账本 |
| E05-08 | 同案两个历史/当前 batch 的补件回流 | 不能广播重排；人工明确 `confirmed=true` 只选择一批；更高 revision 重放不会复活旧 done | 2 个 batch JSON、cursor、前后快照 |
| E05-09 | 多批 GUI 选择入口 | **必须在真实 Renderer 找到可理解的选择/确认入口**；若只有 Main IPC，记 `BLOCKED_PRODUCT`，不能算 GUI PASS | 操作录像/截图、可追踪 IPC |
| E05-10 | 逐批 auto-approval 授权 | assist 默认不代批；全局开关/发布策略/逐批确认/当前可信 Run 联合成立才允许，撤权后拒止 | 运行策略、真实 V2 决定及拒止 |
| E05-11 | group preview/confirm/hash/replay | 已确认 preview hash 与操作一致；旧预览、同 operationId 冲突/重放不二次产生人工决定 | group 账本、previewHash、事务日志 |
| E05-12 | finalize/reopen/outbox | 未决任务不得定稿；真实快照不可变；重开新批不覆盖历史；actionId/payloadHash 重放只结算一次 | snapshot/ledger/WAL/outbox，独立重启 |
| E05-13 | 原 A/B/C 质量与故障归因 | 成功与不合规、材料不足与执行失败严格区分；旧 C 必须还原 first failure 再决定是否复测 | 原始问题集（私有）、run/SDK exit、判定矩阵 |
| E05-14 | 真原件（扫描 PDF/PNG/Office） | 严格审核 `review_inspect_original`/跨页/读取回执；普通浏览器预览不能证明模型看过原件 | materialVersion、页码、source refs、实际 tool receipt |
| E05-15 | 真 I/O/跨 PID 失败恢复 | 仅在隔离卷及额外许可下模拟 ENOSPC/Main 中断/outbox 迟到；失写 fail-closed，新进程恢复不误授权 | errno、进程 PID、磁盘差分及 WAL/回执 |

## E06｜普通 Agent/兼容性（与 E05 隔离 verdict）

| ID | 现场操作 | 必须断言的正/负判词 | 保存 |
| --- | --- | --- | --- |
| E06-01 | 独立普通 Pi create/list/meta/send/Read | 真工具名 **和**本轮唯一合成 marker 读取到 SDK 回执，owner 不出现在普通列表 | `e06-matrix.json`、SDK 摘要/marker 布尔 |
| E06-02 | 普通 Write 权限拒绝与恢复 | `deny` 后文件不存在、下一次 `allow` 才写入，无旧 pending | 权限 UI 截图、文件 hash |
| E06-03 | 运行中 Stop / 新轮 | 真 executor active→stop→inactive；旧 callback 不能污染新轮 | Main/IPC 时间线、PID |
| E06-04 | 普通只读文本预览与工作台切换 | Main 授权、Renderer Shadow DOM 确实可读，切回 E05 工作台仍正常 | Tab/canvas/Shadow DOM 截图 |
| E06-05 | owner 隔离及按 ID 负例 | review-only 会话不得被普通列表、Tab、预览、搜索、归档/异步事件唤回 | 普通可见列表与 owner ledger 双轨 |
| E06-06 | DOCX/扫描 PDF 普通预览 | DOM/Office/pdf canvas 的真实可视性与源文件对应；不宣称审核原件工具已调用 | 真实图片、页码/文件 digest |
| E06-07 | 普通会话跨 PID、fork 与双窗恢复 | 新 PID、跨窗与 Tab 恢复保留普通会话及权限；review owner 不复活 | 旧/新 PID、session/event/log |
| E06-08 | Claude ordinary runtime | 有授权真实 Claude 才进行独立 read/permission/stop/fork；Pi 通过不能代签 | 真实 provider/runtime/SDK 摘要 |
| E06-09 | Windows 与 macOS 原生设备 | 分平台重复最小普通 Pi + owner/恢复/Office；无设备记 `NOT-RUN` | 原生安装/构建和真实退出码 |
| E06-10 | Pocket/Relay/外部 | 真实中心授权的多 viewer/ticket、独立 Pocket FIFO 及旧事件重放；无接入仍 `BLOCKED_EXTERNAL` | 外部独立 actor/回执/日志 |

## 验收等级

- **基础必须先验**：PRE-01～04。安全/来源异常先解决后才能碰真实模型与文件。
- **E05 技术范围**：E05-01～13；其中 GUI E05-09 如果实际产品没有入口，**明确 BLOCKED_PRODUCT**，不虚构“现场操作通过”。E05-14/15 为原件/故障/全链放行必需，外部条件不具备可记录阻断，但不得签 E05 LIVE FULL。
- **E06 当前 Pi 最小真实范围**：E06-01～04；旧的四条基础场景能 PASS 也只能 `E06 PARTIAL`。E06-05～10 依设备/第三方实际可用性调度，不因无法执行而冒充完成。
- 三种记录绝对不能混同：`技术检查通过`、`业务正确拒止`、`真实有效业务签批`。只要29号 LIVE 权威门禁有未完成项，PR仍 Draft / MERGE NO-GO。
