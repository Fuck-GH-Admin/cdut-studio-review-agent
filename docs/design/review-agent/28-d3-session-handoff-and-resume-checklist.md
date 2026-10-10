# 28｜D3 开发会话交接：真实进度、风险、下一会话执行清单

> 截止日期：2026-10-11。**本文件是会话迁移快照，不是 D3 Release，也不代表 D3→D4 已准入。**  
> 私有仓库：`Fuck-GH-Admin/cdut-studio-review-agent`。  
> 当前开发分支：`feat/review-d3-shared-frozen-modules`；[Draft PR #9](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/9)，base = `main`，未合并。  
> **已验证的代码基线**：`d3522a1fb6644a02fddf0130049cb2202f5c7efd`。本交接文件的后续文档提交会改变分支 HEAD，务必以实际最新 SHA 和其对应 CI 重新判断。  
> Electron 当前包版本：`0.15.150`。所有 CI 记录及代码位置应由下一会话先复核。

## 0. 下一会话先读这四句话

1. **D2 已合并主分支**：PR #8，合并提交 `98708f965f09f83541deef64f577767cb0c753b6`。不要重复做 D2，D3 必须继续使用 D1/D2 的正式数据面与原有 Pi 服务。
2. **D3-W0/W1/W2/W3/W4 的大部分工程路径已做且有合成 CI 验证**，包括冻结、复用、升级、导入导出、B01/B02 在 A/C 的局部复用、D2 技术案卷、真实 Pi 服务接口回执、服务端越权拒止、恶意外部条文隔离及结构化问题票。
3. **D3-10 两名真正独立的陌生 Agent 交接测试尚未执行**。原开发 Agent 的 CI / CLI 子进程不是两名独立 Agent。D3-08 仅验证了结构化服务端对抗防线，**真实模型的提示注入盲测未执行**。
4. **没有签署 D3 Release，没有让五个业务会话开始 D4，也没有合并 PR #9**。第 23 号定义 D3 准入，第 24 号定义 D4 并行制作与迭代，必须先通过独立验收再冻结统一交付 SHA。

## 1. 正确的设计文件及其阅读顺序

- [15｜模板模块化与运行边界](15-template-modules-and-runtime-boundary-spec.md)：Agent-first、局部责任、条件实例与制作/运行分离。
- [16｜五份 G01 横向模块化分析](16-template-editor-five-g01-gap-and-module-extraction-v0.1.md)：要读 **这个** 16，不是同目录另一份 `16-batch-review-automation-and-issue-clustering-spec.md`。
- [23｜D3 共享模块库与 D4 交付/12 项自验收契约](23-d3-shared-module-library-and-d4-handoff-contract.md)：**本阶段准入的最终权威合同**。
- [24｜D4 五模板并行制作与统一验收](24-d4-five-template-authoring-and-feedback-loop.md)：**下一阶段合同**，不是已开工的事实。
- [18｜D1 作者态](18-d1-authoring-contract-and-runtime-mapping-v1.md)、[19｜D2 真实 Pi 技术审核](19-d2-scenario-scoped-pi-runtime.md)：不能越过 D1/D2 的候选发布/来源/案卷门禁。
- [25｜D3 W0/W1 实现说明](25-d3-w0-implementation-and-operating-notes.md)、[26｜D3 W2 B01/B02 交接样例](26-d3-w2-b01-b02-cross-business-handoff.md)、[27｜D3 W3 安全、Pi 与 W4 缺口票](27-d3-w3-pi-security-and-handoff-acceptance.md)：当前实现、真实命令、限制。
- [29｜独立 Agent A/B 接手验收手册](29-d3-independent-agent-acceptance-playbook.md)：专供下一会话组织 D3-10 的两份**从未执行的**验收任务。

**业务原文特别注意**：I/A/C/S/P 五份完整原始 MD 多由各业务会话保管，Git 仓库内的 16 号横向概要不可以替代原文。D3 合成样例只能用于工具试验，不能倒推出成都理工大学正式政策，更不能宣称五份完整 D4 已制作。

## 2. 当前工程实际状态

| 阶段 | 已提交、已验证内容 | 边界/未做 |
| --- | --- | --- |
| D3-W0 | `ReviewD3FrozenModule`、ID + version + digest、不可同版覆盖、递归冻结依赖锁、模块查询、可携作者态包；`review-d3-library.ts` CLI | 样例 ID 是资产定位，不是金标准测试成功证明；本地 SHA 不是数字签名 |
| D3-W1 | `ReviewAuthoringWorkspaceV1.sharedModuleLocks` 显式固定；D1/D2 编译前核验；升级影响/反向消费者；删除检查显式签收，历史修订无漂移 | 反向索引基于实际保存的 D1 工作区；没有保存的工作区不能假称被扫描到 |
| D3-W2 | 合成 B01 代办授权/B02 来源证据核验在 C family/temporary 与 A read/copy 跨工作区复用；导出两份携包，在独立配置目录导入；纯文本无复杂 DSL 的最小 Agent CLI 制作 | 只是两份局部能力样本，不代表 I/A/C/S/P 五份完整业务模板 |
| D3-W3 | 复用后的 B01/B02 已走 `createD2TechnicalCase`、真实 `registerMaterial` / `setEvidenceLink` / `preparePiReviewRunV2` / `submitPiReviewResultV2` / `verifyD2PiRun`；模拟回执测试查阅/复制隔离、待核校规、不许行政批准；恶意来源/假系统命令由服务端权限拒止；冻结 exampleIds 防同版替换、CLI import 输出冲突防半安装 | 用的是合成材料与模拟 Pi 回执，不是在线模型真实阅读的准确率报告；跨多个文件的事务极端崩溃恢复仍非全局原子 |
| D3-W4 | `report-gap` 票据要求原 MD 定位、原始责任 ID、模板 ID/版本、模块实例路径、Check IDs、Run IDs；不存在的 Check/Run 用**显式空数组**，区分 `source-missing` 与 `tooling-blocked`；最新代码和测试全绿 | `verifiedAgainstRun:false`：**只验证票据结构，不会自动向实际案卷/Run 校验作者填的 ID**；未验证五业务真实缺口票是否好用 |

**职责边界**：D3 工具生产技术预审计划和制作资产；D2 Pi 是审核运行入口；`candidate-held` 并不等于正式发布许可；AI 不能代替校方有权人员批准。D5 人类界面不是 D3 工作内容。

## 3. 真实 CI 快照（同一代码 SHA，不能混用旧记录）

已核实 `d3522a1fb6644a02fddf0130049cb2202f5c7efd` 的五项 GitHub Actions **全为 success**：

| 门禁 | 运行记录 | 验证范围 |
| --- | --- | --- |
| PR CI | [38087685750](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38087685750) | 全仓 TypeScript、构建、架构边界、完整单元及回归 |
| D3 专项 | [38087685711](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38087685711) | W0–W4 模块/CLI/B01/B02/Pi/安全/缺口票测试 |
| D1 作者态 | [38087685705](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38087685705) | 作者态历史、来源、候选 |
| D2 专项 | [38087685717](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38087685717) | 情景/逐操作真实 Pi 服务边界 |
| 既有回归 | [38087685708](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38087685708) | 原基础回归 |

**严格口径**：此后即便只修改文档也产生新 HEAD；下一会话必须读取最新 SHA 和它的 Actions。不能将 `d3522a1` 的绿灯直接标注为新 HEAD 的绿灯。文档提交前已确认 PR #9 为 `open + Draft + mergeable`，base `main`。

## 4. 关键代码与可复制命令

主实现：
- `packages/shared/src/types/review-authoring-v1.ts`、`review-d3.ts`：草稿和共享冻结契约；
- `apps/electron/src/main/lib/review/review-d3-module-library.ts`：冻结、导入导出、显式复用；
- `apps/electron/src/main/lib/review/review-d3-workspace-locks.ts`：D1/D2 编译锁验证；
- `apps/electron/src/main/lib/review/review-d3-upgrade.ts`：反向消费者、显式升级；
- `apps/electron/src/main/lib/review/review-authoring-v1.ts`：D1 制作态校验；
- `apps/electron/src/main/lib/review/review-d2-runtime.ts`、`pi-case-review-service.ts`：D2 固定运行计划和 Pi 服务；
- `apps/electron/scripts/review-authoring-v1.ts`：D1 草稿 save/read/diff；
- `apps/electron/scripts/review-d3-library.ts`：D3 discover/inspect/freeze/reuse/validate/export/import/diff/impact/upgrade/report-gap；
- `apps/electron/scripts/review-d3-handoff-demo.ts`：生成 A/C 两套 B01/B02 可携合成样例；
- `apps/electron/scripts/review-d2-plan.ts`：D2 preview/register/create/attach。

在仓库根目录以隔离目录运行：

```bash
bun install --frozen-lockfile
export PROFER_CONFIG_DIR="$(mktemp -d)"
bun apps/electron/scripts/review-d3-library.ts validate docs/design/review-agent/fixtures/d3-minimal-workspace.json
bun apps/electron/scripts/review-d2-plan.ts preview \
  docs/design/review-agent/fixtures/d3-minimal-workspace.json \
  docs/design/review-agent/fixtures/d3-minimal-selection.json \
  docs/design/review-agent/fixtures/d3-minimal-case.json
```

复杂样例（用**新**输出目录，脚本防止覆盖）：

```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
bun apps/electron/scripts/review-d3-handoff-demo.ts "$(mktemp -d)"
```

所需测试（不用生产配置目录）：

```bash
bun run typecheck
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-module-library.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-handoff.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-handoff-cli.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-minimal-cli.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-pi-integration.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-adversarial.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d2-runtime.test.ts
```

## 5. 下一会话优先级（必须从上往下，不重复 W0–W3）

**P0｜重新拉状态、确认最新 HEAD，先修独立 Agent 可能立即遇到的 CLI 问题**

- 检查 `review-d3-library.ts` 的 `impact <moduleId> <fromVersion> <toVersion>` 子命令。当前条件中的数字正则文本为 `/^\\d+$/`（字符级读取显示包含两层反斜杠），**疑似误将数字版本拒绝**；已有测试重点在 `inspectD3UpgradeImpact` 函数，并未覆盖该 CLI 子命令。下一会话应从独立子进程实际复现、修复后新增 CLI 回归，不可只改文档。
- 逐项核对 `report-gap` 输出 `sourceRequirementIds / instancePaths / checkIds / runIds`，保证出现无效身份时明确 fail-closed；明确结构化映射不代表运行存在性已核实。
- 对所有修补在同一 SHA 重新跑全部 CI 后，更新本文件中的新基线（不能只沿用旧 Actions）。

**P1｜真正执行 D3-10 两个独立陌生 Agent 的验收**

- 将 [29 号交接手册](29-d3-independent-agent-acceptance-playbook.md) 的 Agent A 与 B 任务发给**两个没有参与实现的独立会话**。A：零模块文本、D1 修订、新目录导入、D2 候选建案。B：A/C B01/B02、升级影响与被删责任签收、显式缺口票、跨操作待核。
- 每个人独立记录代码 SHA、隔离配置路径、所有命令退出码、输出 JSON/锁/差异、失败重试、无需原作者猜测的程度；统一验收者独立复跑。没有这两份记录，D3-10 继续 `not-run`。
- 实际受阻的问题按 [24 号](24-d4-five-template-authoring-and-feedback-loop.md) 归因：工具/D3，模板业务/D4，Pi/运行层，来源/制度待核。不要以“熟悉代码的当前 Agent 自测”冒充独立验收。

**P2｜按第 23 号 D3-01～12 做逐条复验与交接包封版**

- 对 [27 号验收矩阵](27-d3-w3-pi-security-and-handoff-acceptance.md) 的 `pass / fail / not-run / source-blocked` 补实际证据；D3-08 的在线模型提示注入盲测尚 `not-run`，不能伪称已完成（D3 的服务端权限测试已存在）。
- 特别复核 W4 的原责任→实例→Check→Run 关系：工具验证字段结构，但业务会话仍需给出真实原 MD ID；尚未创建 Run 时允许空数组，禁止伪造运行。
- 汇集同一代码 SHA、模块索引及内容摘要、D1 工作区、导出包、D2 计划与 Pi 回执、测试结果、两名独立 Agent 报告、尚存边界。
- **只有 D3-01 至 D3-12 均有可审核结论且阻断项已闭合或按第 23 号获得明确接受**，才能签发统一 `D3 Release`，把固定 SHA 与模块锁交给原五个业务会话开展 D4。任何一项 `not-run` 不得填成 pass。

## 6. 已知能力限制与明确禁止

- D2 技术预审试点 C 顶层分支仍需要显式选择、明确申请主体；A 的 item × operation 必须逐操作核实。
- 当前不支持把任意复杂 Claim/Evidence 替代/阶段/权限图无损编译。涉及关键业务义务时返回 `D2_UNMAPPED_ADVANCED`，并产生结构化 `report-gap`；**不得删掉义务以换取绿色测试**。
- 合成模块/材料/回执不是本校校规、不是在线 Pi 金标准；`request-scope` 合成来源不能冒充已获准的校本正式依据。
- 发布候选不能变更为正式有效模板；正式行政批准依旧由服务端拒止。
- `version + digest` 与 bundle fingerprint 是本地一致性保证，不是外部可信签名；本地目录拥有写权限的人不是学校发布管理员。
- 五份业务完整原始 MD 要从原研究会话或用户文件取得；不得依照此项目摘要“补写”缺失的政策原文。
- 暂无 D3→D4 release；D4 尚未统一开工；D5 更不得开始。

## 7. 给下一 ChatGPT 会话的直接接手提示

> 请继续私有仓库 `Fuck-GH-Admin/cdut-studio-review-agent` 的 D3，**不要重新规划已完成的 D0.5/D1/D2**。先通过 GitHub 查看 Draft PR #9（分支 `feat/review-d3-shared-frozen-modules`）的最新 HEAD 和该 SHA 五组 Actions，并完整阅读 `docs/design/review-agent/28-d3-session-handoff-and-resume-checklist.md`、`29-d3-independent-agent-acceptance-playbook.md` 以及 23/24 号契约。历史绿色基线为 `d3522a1fb6644a02fddf0130049cb2202f5c7efd`，交接文档之后的提交必须重新核验。D3 W0–W4 的共享模块锁、携包、A/C 的 B01/B02、真实 Pi 接口及结构化 W4 缺口票已开发；**PR #9 未合并 main，D3-10 两个陌生 Agent 的独立验收未运行**。优先实际测试并修复 D3 CLI `impact` 版本参数校验及其专项回归，然后组织两名独立 Agent 的完整干净环境接手，记录真实失败/报告，逐条闭合 D3-01～12，最后才考虑签发 D3 Release 并移交五个 D4 会话。禁止编造本校生效制度、用模拟 Pi 回执声称线上模型合格、提前合并或启动 D5。

---

**维护约定**：本文件是接力入口。下一会话若推进 W4/W5，应在这里追加新的完整 SHA、Actions 链接、真实进展与剩余任务，保留此快照作为历史，不要默默把旧版的 `not-run` 改成 `pass`。
