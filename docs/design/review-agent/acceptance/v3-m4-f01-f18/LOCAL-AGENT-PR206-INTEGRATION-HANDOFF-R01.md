# CDUT Studio Review V3｜M4 PR #206 → 本地 Agent 合并与验收交接 R01

> **更新（2026-10-21）：统一接收任务已升级为 [LOCAL-AGENT-M4-FINAL-CLOSEOUT-R02.md](./LOCAL-AGENT-M4-FINAL-CLOSEOUT-R02.md)。新 R02 同时吸收 PR #206 的工程交付和 PR #186 的 50 套模板/公共兜底调查，并以最新 main S4=PARTIAL 为准。执行请先读 R02；本 R01 保留其原始代码候选与 CI 证据。**


> **交付定义：本文件确认“可交付本地 Agent 的集成代码候选”，不宣布第四里程碑完成，也不授权云端 Agent 修改 main。** 主线合并、实际 Electron 回归、A15 S4、第四里程碑验收判断均归本地 Agent 和项目负责人。

## 0. 固定交付凭据（严禁使用模糊的“最新”替代）

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- **唯一要接收的功能集成 PR**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/206 （Draft / Open / 尚未合并）
- **唯一功能交付分支**：`integration/v3-m4-unified-f01-f18-r01`
- **固定代码交付 HEAD**：`b0d3c3f69b089c1e673c4003c08c2f499a631bc8`（简写 `b0d3c3f`）
- 当时 PR base / main：`19efdbb039374aaab37c58aba0b5d14131c5cf58`。GitHub 报告 PR mergeable=true、mergeable_state=clean。
- **协调与本交接文档分支**：`docs/v3-m4-f01-f18-delivery-r01`（docs-only；不参与代码合并）。
- **冻结纪律**：本交接文件只在协调文档分支提交，不改变上述 #206 的源 SHA。如果取件时该 PR HEAD、main 或文件目录已经变更，先停止“照单验收”，核对增量并在新 SHA 重新跑相应门禁。

## 1. 云端工程的交付范围

F01–F18 的 18 个 Draft PR（#188–#205）源文件、领域模块、组件、必要测试与接口桥接，已在 #206 的独立集成分支中合并为一套候选代码。**不要把 #188–#205 再逐个合并到 main，否则会重复覆盖且引入历史版本冲突。**

对应原 PR：F01 #189；F02 #196；F03 #194；F04 #195；F05 #190；F06 #203；F07 #197；F08 #200；F09 #199；F10 #202；F11 #193；F12 #191；F13 #192；F14 #188；F15 #204；F16 #205；F17 #201；F18 #198。

本轮已处理的关键共用接口/冲突：
- F11 阶段权威判定 + F12 补件周期 + F13 申诉历史同置 T05 工作台，避免整文件覆盖和第二业务真值。
- F02 负责人声明对接 Main 模板计划桥接；F08 最小数值约束算子；F07 计划覆盖接到正式 Run。没有有效检查/未读取原件不能直接 stage-pass。
- F15 评分轮次由 Main 从实际批次和已发布量表派生，不直接信任 Renderer 的初始 state。
- F06 证据归属工作台挂载到真实界面；F18 评委离线包签发、预览、经本地组织者显式确认导入 T07 CAS；离线回执按 actionId 处理重复/崩溃恢复。
- T09 学生公开字段只能从 Main 的已发布模板派生，Renderer 不能自行标 public；学生/审核员本地补件身份由 Main 重绑定。
- 为避免 18 条并发 PR 同时升级版本引起发布校验错误，#206 **保留 main 的 `apps/electron/package.json` 与 `bun.lock` 原状态**。统一发版版本升级应在后续单独处理，不能在此次取件时把原 18 个 PR 的版本补丁再引入。

## 2. 严格的 CI 接收证据（针对同一个 SHA）

对 `b0d3c3f69b089c1e673c4003c08c2f499a631bc8`，2026-10-21 UTC 的四个 GitHub Actions **全部 completed/success**：

| Job | 结果及永久链接 |
|---|---|
| verify (ubuntu-latest) | PASS：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39523845418/job/118974165899 |
| test-batch | PASS：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39523845445/job/118973790630 |
| review-baseline | PASS：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39523845461/job/118973790470 |
| scoped-pi | PASS：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39523845396/job/118973790415 |

`verify` 工作流真实执行：`bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、Electron skin contract、Main/Preload/Renderer 构建，以及 `bun test --isolate --timeout 30000`。这是 CI GREEN/BUILD GREEN，**不是** Electron GUI 实机、真实操作系统文件选择器或学校接口验证。

## 3. 本地 Agent 的接收与合并任务（由本地 Agent 自主实施）

1. **冻结工作现场**：保存当前本地 main HEAD、工作树 dirty 文件、A15 日志/截图及任何未 push 的本地改动；如有工作现场改动，使用独立 worktree/备份隔离，不覆盖。本任务并非要求云端 Agent 合并。
2. **核对源身份**：fetch 最新远端并确认 #206 的提交 `b0d3c3f69b089c1e673c4003c08c2f499a631bc8` 仍在分支上；核对 main 实际 HEAD 与本交接基线。若有新 main 提交，识别交叠文件、测试变化及 A15 证据再合入，不能直接假定无冲突。
3. **单次接收 #206**：在本地 Agent 掌控的集成/验收工作树中处理 #206，而不是分别重演 18 条 PR，也不要把 docs-only 协调 PR #187 当作代码来源。优先保留单一 CaseAggregateV2/CAS/Receipt/SourceRef/ReviewRunV2 权威、唯一评分状态、Main 授权门禁。
4. **合并前后的质量门禁**：运行与 GitHub 等效的 typecheck、边界检查、正式构建和全测试；另跑批次/审核专项用例。新合并 SHA 不等于上面的绿色 SHA——在最终合并 SHA 上要重新验证，失败必须修复并记录，不得借用旧 SHA 的 PASS。
5. **真实 Electron 与 A15**：由本地 Agent 操作真实窗口、真正的文件系统选取/拖拽、真实 DOCX/PDF/图片入库、案卷提交、模板正式规则检查、结果/来源定位、人工阶段决定或阻断、补件/复审、报告导出、重启后同案持久化。对真实操作保存命令、时间、SHA、案卷 ID、Run ID、截图及必要脱敏日志。
6. **安全及外部阻断**：校方 Teacher/SchoolPort 身份、政策正式授权和真实校园接口缺失时，必须以 BLOCKED_EXTERNAL 明示；本地 actor、单机弹窗或离线包 SHA-256 均不等于校方认证，绝不可伪造完成。
7. **最终回报**：提交合并后的 main SHA、CI/实机 A15 证据、逐 F/A 检查、剩余 BLOCKED/FAIL/PARTIAL 与风险；由用户裁决第四里程碑，不由本云端集成方宣布。

**本地 Agent 可以决定具体 merge 方法和问题修复策略，但不得降低产品闭环、追溯性或角色权限要求来换取“通过”。**

## 4. A15 S4 历史断点（必须在实际环境复验）

前一版主线台账 `docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md` 将 S4 标记为 **PARTIAL**：

- 已真实 UI 走通：进入内容审核、选择已发布模板、建案、运行正式规则检查；有真实 Case/Run。
- **没有走通“真实文件进入案卷 → 继续审核 → 导出报告 → 冷重启”的一次性闭环**。
- headless xvfb/openbox 下，原生 OS 文件对话框无法被 xdotool 可靠控制；CDP 伪造 File 也不能满足 Electron `webUtils.getPathForFile`。当时已有截图和真实磁盘计数证据，`documents=[]`，不得声称材料已登记。
- 实测时材料槽位和当前案卷选择必须正确；引导浮层可能遮挡点击。
- **要求**：优先有桌面窗口的本机实测；如环境仍阻断，记录可复核的 BLOCKED_ENV 证据，不能把模拟 IPC 上传冒充 S4 UI 通过。

## 5. M4 源码整合之外的验收核对（非当前 CI 的 PASS 结论）

这些是必须由本地 Agent **确认并如实记录**的产品能力，不预设全部已通过：

- **F02/模板资产**：检查 50 套 D4 历史模板完整保留；B1 的第 51 候选、6 套业务完整示例、通用兜底模板/未匹配时模板生成，是不同资产和逻辑；不得把“6 套样例”解释成“只有 6 套模板”。兜底/生成必须验证实际可用性，不能仅凭文件存在判通过。
- **F03**：政策冲突的优先级人工确认、持久化、版本变化失效机制是否真正从 Main 闭环，制度文件是否来源可信。
- **F04/F05/F06/F10**：OCR/图片/PPT/DOCX/PDF 原件字节、版本与解析版本，以及事实更正、证据多对多绑定和来源坐标能否在 UI→Main→文件系统→Run→报告贯通。
- **F07/F08/F09/F11**：冻结计划覆盖、确定性上下限计算、Run stale/恢复、业务通过门禁；0 检查、缺原件、未完成/失败、21 人违规不得在无具名合法处置时放行。
- **F12/F13**：补件回复、原件登记、复审、申诉/撤回的 CAS 持久化及角色边界；复审教师校方权限无凭据时不要“本地模拟通过”。
- **F14/F15/F18**：批次物理分案、队列与并发、回避、评分、缺评、同分/冻结；离线包的预览、冲突、重复、崩溃窗口及重启恢复。100 案/500 文件规模测试如未实际执行，明标 NOT_RUN；校方真实鉴权另列外部阻断。
- **F16/F17**：实际 MD/PDF/XLSX/JSON/ZIP 输出文件打开和观众权限、当前/指定历史 Run 的一致性；助手修改应是可审阅建议，正式提交由已有业务命令执行，不得直接变更权威记录。
- **A15/冷重启**：真正的 UI 建案、原件、审查、补件、报告、刷新/重启后状态恢复，且全部证据固定到同一个合并 SHA。

优先修会影响实际用户闭环的功能阻断，不因全仓单测已绿就认为所有 F 的 UAT 已完成。外部不具备的学校接口应单列，不把本地独立副本能力当成校方接入。

## 6. 本地 Agent 结束后的汇报模板

请报告：
- 源 PR #206 固定源 SHA；本地实际 merge/集成前后的 main SHA；操作方法及是否清洁工作树；
- 最终构建与全测试记录（命令、总通过/失败、输出路径、执行时间）；
- A15 S4 真实 UI：建案、真实材料登记、ReviewRun、来源查看、业务决定、导出、冷重启逐项 PASS / FAIL / PARTIAL / BLOCKED（附证据）；
- F01–F18 未满足要求清单及优先级，尤其 50 技术模板/兜底模板、政策、身份、批次、离线；
- 校内权限/接口等外部依赖，用 BLOCKED_EXTERNAL 而非 DONE；
- **结论只写“本地 Agent 实际完成的合并与验收范围”，不代用户宣布 M4 完成。**

### 本次边界确认

本交接由云端整合 Agent 发出，仅代表代码版本 `b0d3c3f69b089c1e673c4003c08c2f499a631bc8` 可交付本地 Agent 取件；云端 Agent **没有合并 main、没有执行本地 OS GUI、没有给 A15 S4 打 PASS、没有宣布第四里程碑完成**。
