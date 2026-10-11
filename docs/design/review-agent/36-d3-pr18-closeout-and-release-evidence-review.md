# 36｜PR #18 工程收口与 D3 Release 证据复核（2026-10-11）

> **范围**：以既有 D1 `ReviewAuthoringWorkspaceV1`、D2/Pi 及 D3 冻结模块机制为准，检查 PR #18 的工程收口、边界和 D3-01～12；不创建作者 Schema v2、不泛化档案适配器、不宣称整套业务 MD/在线模型准确率通过。
>
> **状态分类**：`PASS-TOOLING` = 代码/真实服务的技术能力已有可复现证据；`PASS-WITH-BOUNDARY` = 有条件技术通过，不能外推业务语义；`NOT-RUN` = 无真实执行证据；`TOOLING-BLOCKED` = 运行模型不能忠实表达。**本报告是 Release 证据审查，不是校方授权或 D4 五套完整模板的业务签收。**
>
> **固定历史公共 D3 基线**：`6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`（D3 开发分支 PR #9，完整 PR CI/D1/D2/D3/旧基线均 success）。**PR #18 专项工程修复基线**：`d9d68049f87097a0765e5bd2db8f62109b4c8c1c`，专项与全仓共六组 PR CI 均 success；后续任何文档提交或合并都会改变 HEAD，最终签 Release 必须以最终集成 SHA 重新核对同 SHA CI。

## 1. 修复的真实工程问题与分层测试

原 PR #18 的 [完整 PR CI #38114088314](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38114088314) 在默认全仓测试中失败；从 job 日志确认实际根因：`review-d3-md-dynamic-runtime.test.ts` 模块初始化无条件读取 `MDQ1_AUTHOR_ROOT`、`MDQ1_ORACLE_ROOT`、`MDQ1_IMPLEMENTATION_OUTPUT_DIR`，而通用 PR runner 并不检出 A/B 两个外部分支，报 `Pinned author+oracle checkout paths and output directory required`。**不是已证实的 D2 gate 运行逻辑断言失败。**

已经在 PR #18 分支修正：

1. `53e2b0bc8b7cc6cb7f6b9480f0be2edd62ad39f8`：只有三个外部输入**全部缺席**时，通用全仓测试才标记一项显式 `skip`；部分传入则 fail-closed；三个齐全时运行全部固定 A/B 用例，保留 30 案的专门必跑工作流。
2. `d9d68049f87097a0765e5bd2db8f62109b4c8c1c`：新增不依赖外部检出的 `review-d2-execution-gates.test.ts`，让全仓 CI 始终执行三值条件、当前目标与来源版本、纸/电子 OR 替代、材料截止阶段、有权部门责任和坏 gate 的守卫回归。
3. `35` 号实现说明的工程收口节更正：`D3ArchiveCaseRequestV1` 仅为档案业务适配器输入，不应提升为五份 D4 模板强制 Schema。

**修复后同一代码提交 `d9d68049` 的实际验收**： [PR CI](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142051245) / [D3 动态固定 A/B](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142051227) / [D3 冻结模块](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142051274) / [D2](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142051267) / [D1](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142051247) / [旧基线](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142051326)：**Success**。六项中，动态专项实际提供固定 A/B 快照，不能用全仓的一项 skip 代替。

## 2. 领域适配器 / 公共 D2 / Pi 审核职责审计

| 层次 | 真实实现与调用 | 已确认边界 |
| --- | --- | --- |
| D1 作者态 | `ReviewAuthoringWorkspaceV1`、SourceBinding 和 D3 shared lock；`review-authoring-v1.ts` | 无复杂 gate 的简单任务可走旧候选映射；含 gate 时旧无条件候选抛 `D1_UNMAPPABLE_EXECUTION_GATE`，不丢条件 |
| 档案专用适配器 | `instantiateD3ArchiveCaseV1` / `review-d3-dynamic-case.ts build` | 从既有模块原型实例化档案件×具体操作、校验来源差异、复制精确绑定、保留冻结锁；不创建新通用作者 Schema、不发布或决定 |
| 公共 D2 技术执行 | `compileD2RuntimePlan`、`D2ExecutionGateV1` | 计划与 SourceBinding 同步冻结、三值 `true/false/unknown`、申请人/权威部门材料分离、技术阶段 `dueStages`、当前 subject 上人工确认的 OR 替代 |
| 公共 Pi 提交及验证 | `preparePiReviewRunV2`、`submitPiReviewResultV2`、`verifyD2PiRun` | 固定计划指纹、会话授权、当前输入哈希、来源与对象范围、结果证据 gate；无可信行政签署不能从材料推出正式批准 |
| 发布和人类 UI | 原 `TemplateVersion` / `RuleSpec` / `TemplateWizardPanel.tsx` | Agent 候选保持 `candidate-held`；已有 GUI 不等于 D1/D3 作者态与旧模板视图已经完成 D5 集成 |

**实质性限制**：当前 `gateAssignments` 筛选器最多按 `moduleId/taskId + itemId/operation`，**没有 operationId 选择字段**。相同档案件可为多次同类操作生成独立 objectKey/subject 和独立 EvidenceLink，但还不能为某一次同类操作单独配置不同 gate；不得将它描述为任意多操作条件差异均支持。保留为 D4 档案模板遇到真实需求时的定向反馈项，不因它去发明通用模板 DSL。

原文业务阶段 `submission/decision/post_decision` 与系统 `CaseStage` 尚无经过校本确认的对应关系；技术 `dueStages` 不能自行解释学校审批时点。`certified_copy` 有专门模块时可以形成隔离的**技术检查候选**，但不能借普通 copy 获得正式证明/签章权限。没有专门模块时必须显式拒止。

## 3. D3-01～12 固定工具证据矩阵

沿用 [31 号矩阵](31-d3-release-evidence-and-md-quality-gate.md) 和 [30 号三方隔离签收](30-d3-10-independent-agent-acceptance-result.md)，此次复核的是**工具能力**，不是原始完整档案 MD 的金标准确率。

| ID | 复核结果 | 支持证据及不扩大结论的边界 |
| --- | --- | --- |
| D3-01 从零文本模板 | **PASS-TOOLING** | Agent A PR #11 自主制作/修订至三独立 Check；真实 D1/D2/Pi 技术调用 |
| D3-02 跨工作区冻结复用 | **PASS-TOOLING** | Agent B PR #12 在 A/C 场景引用相同 B01/B02 digest |
| D3-03 版本、摘要、依赖拒止 | **PASS-TOOLING** | D3 模块库专项及独立交接拒止回归 |
| D3-04 参数/来源边界 | **PASS-WITH-BOUNDARY** | A/C 不串用 SourceBinding；不代表跨校制度正式适用 |
| D3-05 影响/升级/旧版不漂移 | **PASS-TOOLING** | B 独立影响分析、单消费者迁移、未签收删除拒止 |
| D3-06 情景对象与真实 Pi 服务 | **PASS-WITH-BOUNDARY** | A/C 技术案卷、逐操作拒止和自有 Run；合成/受控回执而非模型成绩 |
| D3-07 高级不支持明确拒止 | **PASS-TOOLING** | `D2_UNMAPPED_ADVANCED` + report-gap；**高级证据关系的执行本身仍 TOOLING-BLOCKED** |
| D3-08 规则提示注入安全 | **PASS-WITH-BOUNDARY** | 服务端来源/权限对抗测试；真实联网模型盲测仍 **NOT-RUN** |
| D3-09 独立携包重导入 | **PASS-TOOLING** | Agent A/B 重导入和第三方不同 runner 固定 SHA 复验 |
| D3-10 两名独立制作 Agent | **PASS-TOOLING** | PR #11/#12，第三方 PR #13；[#38093886953](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093886953) 双 runner PASS |
| D3-11 同 SHA 完整 CI | **PASS 对旧公共 D3 HEAD** | `6747de44` 五组 CI success；PR #18 修复 `d9d68049` 六组 CI success。**最终合并 HEAD 必须重新核验** |
| D3-12 原 MD/Check/Run 追溯 | **PASS-WITH-BOUNDARY** | 来源 ID、实例路径、检查项及真实基线 Run 可追；`verifiedAgainstRun:false` 不可写成高级输入被实际运行过 |

按可用命令复核的制作闭环：

```text
D1: validate → save(revision) → read → diff
D3: discover/inspect → freeze/reuse/validate → impact/upgrade → export → import
D2: preview → register/create(候选技术案卷) → Pi prepare/submit/verify
```

- Agent A/B 及审计者已以真实 CLI/服务调用检验工作区读写和版本、冻结复用、候选编译、可携重导入、真实服务端 Run/拒止。具体调用与日志固定在 PR #11/#12/#13 的提交和 CI artifact 中。
- D3 动态固定 A/B 新实验进一步检验按具体档案件/操作生成不同技术案卷，最多说明技术链能执行，不说明其 30 案真实金标达到预期语义。
- 当前无通用「作者只提交材料 JSON 就启动 Pi 模型审核」的一键 smoke CLI：陌生 Agent 可用现有服务编写测试脚本，但制作易用性仍有 P2 缺口；不是重新设计 DSL 的理由。

## 4. 单独保留的缺口与不能签收的结果

| 类别 | 保留结论 |
| --- | --- |
| 原始完整 Markdown → 全业务模板 | **PARTIAL / 未签金标**；档案原 MD 的责任、条件和例外需要逐条与独立金标、目标 Check、真实运行状态交叉审计 |
| 30 案语义验收 | **NOT-RUN**；28 个 pending-only Pi 回执只证明服务端能接受安全的技术待核状态，另两例特殊操作有专门阻断/隔离测试，绝非 28/30 业务正确率 |
| 在线模型真实材料审读及注入盲测 | **NOT-RUN**；合成服务回执不等于模型理解正确 |
| 校方制度与正式行政决定 | **BLOCKED-BY-SOURCE/AUTHORITY**；当前不能签发正式学校批准、盖章或权威政策效力 |
| 复杂关系与阶段 | **TOOLING-BLOCKED**；双委托/角色图、任意 AND/OR 证据关系、精确校方业务阶段、个别操作差异 gate 尚未通用支持 |
| 人类编辑 UI 与 Agent 作者态统一 | **D5 工作**；现有编辑器存在，不为技术 D3 自验收额外复制一套 Schema |

## 5. Release 决策

**技术工具层结论**：第 23 号契约 D3-01～12 有足够的独立制作、第三方重跑和公共代码证据支持**有边界的技术 Release candidate**。质量分层至关重要：`D3-10 PASS` 不等于 `D3-MD-Q1 PASS`，更不等于学校批准。

**形式门槛**：PR #18 若要合并，必须其最终 HEAD 同时完成全仓 PR、D1/D2/D3/旧基线、动态固定 A/B 工作流；合入 D3 分支后还需在**实际合并 SHA** 完成新的同 SHA 完整验证，核对旧冻结模块/旧案不漂移，方可签署 D3 Release。尚未执行的真实模型盲测、业务金标及学校授权不作为“已经通过”的 Release 证据，也不能被掩藏或降级。

**阶段纪律**：保留 PR #9 Draft、未合并 main；PR #15/16/17 原始作者和金标保持只读验收来源；不在本轮启动 D4 五路正式交付或 D5 UI 重构。D4 后续发现共性工具缺陷，按 24 号契约单独回修 D3。


## 6. PR #18 集成结果与正式 Release 边界（后续补记）

- **PR #18 已在最终提交 `b648a92e4ddd61cd8523756fcc608bd75a676ceb` 上完成六组同 SHA CI success**，随后经 squash 合并进入 PR #9 的 D3 开发分支，集成提交 `5a722ffcc0fc9bdc8f8c8e0e39e6f061beefb107`。PR #18 已 merged；PR #9 仍为 Draft、未合并 main。
- 集成提交与 PR #18 的最终 HEAD 不是同一 SHA，即使内容经 squash 等价，**不能把合并前的绿灯冒认为合并后的同 SHA 验收**。本段补记又产生后续 D3 分支提交，正式签发仍需读取最新 PR #9 HEAD 的实际 CI 结果。
- 此处的“D3 工具已具备交接能力”是依据 PR #11/#12/#13、旧版 D3 五组 CI、PR #18 六组 CI 的有条件技术判断；**正式 D3 Release 仍未签署**。合并后逐项复核 CI，再决定是否签署“Agent-first 工具技术 Release”；完整业务 MD 金标、真实在线模型准确率、校方规则认定不得随之自动签署。
- 保持对 D4 的正确边界：档案专用 `instantiateD3ArchiveCaseV1` 只用于档案业务；其他业务仍从现有 D1/D3/D2 契约起步。未来如遇真实可重现的其他领域工具缺口，另开针对性的 D3 修复并进行依赖影响与回归。
