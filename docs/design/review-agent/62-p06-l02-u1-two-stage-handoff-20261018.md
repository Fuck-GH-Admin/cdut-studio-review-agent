# 62｜P06 L02-U1 双阶段验收交接（远程工程 / 本机真实复演）｜2026-10-18

> **当前边界**：本文件是独立 Draft PR #103（父 PR #101 / `0524604cac13794af5f43cff7771160f98f176d9`）的工程交接；本分支新 HEAD 应以远端实际 Git 和 CI 为准。**P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO；L02-00 总验收 NOT ACCEPTED；P07/P08 NOT STARTED。** 不覆盖 29、46、55、56、57、58、59、60、61 及隐藏 Gold。

## 1. 依据与明确分工

原始 U0/U1 范围以 [54](54-p06-l02-u0-independent-candidate-and-gates-20261018.md)、[55](55-p06-l02-u1-differential-matrix-20261018.md)、[56](56-p06-l02-u0-u1-first-failure-fix-evidence-handoff-20261018.md) 为准，L02-00 独立历史归因以 [61](61-p06-l02-00-r02-independent-reexecution-20261018.md) 与 R02 Actions #39089177006 为准。

| 维度 | 第一部分：远程 Agent 与仓库 CI | 第二部分：本机 Agent，详见 [63](63-p06-l02-u1-local-execution-task-20261018.md) |
| --- | --- | --- |
| U0 | 复用同源码可核验的 U0/PR CI；新变更必须重新 typecheck、相关单测、clean gate | 真实系统版本、隔离安装及 Electron 启动 |
| 审核五工具 | 代码严格 admission、丢失 binding fail-closed、工具过滤、撤权和 Scope 受控单测 | 真实 Main `runAgent`、Pi 真实 provider 与五工具调用/拒止及原始回执 |
| SourceRef | 真实模块函数级正反例：同名多版本、retired、普通 Office fN 不能冒充引用 | 案卷原文及版次、实际解析/视觉路径、跨案 symlink/异步撤权、逐案有位置/quote 的证据账 |
| Office | 对共享 `materializeToWorkspace` 的**已知 #71 碰撞复现**，不修共享生产实现 | 真实 DOCX/XLSX/PPTX/PDF + 同 stem 不同路径/哈希/重启缓存的可见影响，记录阻断与修复责任 |
| Preview/Owner | 现有 P04/P06 受控 Main 桥、tombstone、IPC actor、Owner 测试 | Electron 主窗口与 sidepanel 真 IPC，owner 隔离、stop/restart、旧 response/迟到事件 |
| IO/恢复 | 原有单测；不能称磁盘真实 ENOSPC | 独立私有 profile/受控小 tmpfs、受控 I/O 故障与重启，绝不触及宿主真实目录 |
| 证据等级 | STATIC / CONTROLLED / ARCHIVED | MAIN_IPC / PI_PROVIDER / IO_RECOVERY（各自独立签收），缺项保留 NOT-RUN |

## 2. 本轮真实工程变化（限审查范围）

1. `apps/electron/src/main/lib/agent-orchestrator.ts`：已有代码只有在 `review-operator`、用户轮次及有绑定时启用严格五工具；**新增仅针对 owner.kind='review-case' 的必要 fail-closed 守卫**。缺可信 binding、非法 Agent runtime、非用户轮次、审核预设意外漂移或 caseId 不一致时，中止本次 sendMessage 而不能退回一般 Pi profile/custom MCP。普通 owner 不受这个分支约束；不新造引擎或修改现有 Pi Adapter 合同。
2. `agent-orchestrator-permission-wiring.p06.test.ts`：新增“内部 owner 没有绑定”和“预设意外漂移”两个反例；只断言会话准备阶段拒止、`adapter.calls===0`，不谎称真实 provider。
3. `.github/workflows/p06-l02-u1-split-controlled.yml`：与普通 PR CI 分开，实际在 self-hosted Linux/Bun 1.4.0/Node22 执行 frozen install、全仓 typecheck、7 个真实模块的定向 tests；另执行 `scripts/qa/p06-l02-office-index-identity-repro.ts`。记录 HEAD/tree/命令退出码/logs/sha256 和 Git 工作树状态。
4. **Office #71 的复现脚本成功只表示缺陷仍可复现，绝不等于 Office 安全验收 PASS**。仅生成故障报告，不修改 `document-parse-tools.ts` 等共享 Office 生产文件。

## 3. 第一部分客观结果记录规则

- 必须以当前分支 **最终固定 SHA** 的 CI 原始 Job/Artifact 为准；typecheck、7 组 tests、install、git clean 都 exit 0，才可写 `REMOTE CONTROLLED PASS`。失败保留首败、不能写“应该通过”。
- `office71-repro.json` 必须确认为 issue=71、六行 DOCX/XLSX/PPTX x 相同/不同 revision，且 `collisionDetected=true` 才可写 `OFFICE71 CONFIRMED BLOCKER`。未来碰撞消失时脚本 exit2，需调查是否修复，不得机械地把新实现算测试失败。
- 标注单测实际通过数量，**不使用**早先 #98 的 3986 PASS 或 #101 的 9 PASS 冒充本轮新 HEAD 结果。
- 若 PR CI 有 pending/timeout/环境缺失，分别标 `PENDING_CI` 或 `BLOCKED_ENV`；文档不能先写完成。

## 4. 第二部分入口与分档结论

本机 Agent 接手时先验证最新 PR #103 head/父子 commit、受控 CI、工作树 clean；**从最新固定 HEAD 创建新本地工作树和独立执行分支，不更新远程 PR #103**。严格按照 [63](63-p06-l02-u1-local-execution-task-20261018.md) 运行。以下等级禁止混写：

- **U1_REMOTE_CONTROLLED_PASS**：安全机制本地函数级边界受控通过，需本次 CI 见证。
- **U1_MAIN_IPC_PASS_SCOPED**：本机真实 Electron/Main/Preload/Renderer 正反例通过，但不自动证明 provider、Office parser 或磁盘恢复。
- **U1_PI_PROVIDER_PASS_SCOPED**：本机有授权 provider 产生真实本案工具 input/output/身份与 SourceRef，经过清洗复核；不能仅靠模型自然语言回复。
- **U1_OFFICE_REAL_STATUS**：若 #71 确实错绑（哪怕其余 PASS），记 `BLOCKED_UPSTREAM`，不得修原共享 Office 模块或冒充完整 U1 PASS。
- **U1_IO_RECOVERY_PASS_SCOPED**：需真实文件系统故障与进程重启，有旧权限不能恢复的原始回执；mock 仅 CONTROLLED。
- **L02-00 纯文本合成案卷 LIVE** 与 **完整 U1 发布验收** 分开签署：只有 Main IPC + 严格 Pi/provider + Owner/SourceRef 限定范围正反例足够，才能评估纯文本 C 诊断链；它**不解除** Office/Preview/恢复和 P05 外部门禁。

## 5. 本轮永久冻结与后续责任

- #21/#72/#98/#99/#101 不回写，`main` 和上游不改；#103 Draft，绝不合并。
- P04 tombstone/UUID journal 不做未经证明的 TTL、GC 或替代数据层。
- 普通 Agent `Read/MCP/preview` 正例必须仍可用；审核只认 host 的合法当前绑定（owner != authorization）。
- 旧错误复现和 61 九案仍保留历史身份；本机任何新 A/B/C 用 `NEW_SYNTHETIC` + 新 ID，不能覆盖旧案例或修改隐藏 Gold。
- Provider key、真实校方材料、私有 transcript、真实 profile 一律本地保留，公开只存脱敏 manifest、诊断 summary 与 SHA256；不得把凭证或截图中的私人信息写入 Git。
- 完成后本机交付独立本地分支和 Draft PR，并按 [63](63-p06-l02-u1-local-execution-task-20261018.md) 的证据表审阅；未经用户验收不更新 29 权威 LIVE。
