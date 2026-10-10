# 32｜从完整业务 Markdown 到可运行模块化审核模板：Agent 制作与独立质量验收协议（v1）

> 范围：D3 交 D4 前的**作者工作流/质量控制**。不设“自动 Markdown 转换器”：当前 D3 实际接口消费的是作者态 JSON，不是上传 MD 后自动完全理解。规范的作用是让 Agent **有程序可执行、有独立金标可核对，发现不保真时必须报错**。依据 [23](23-d3-shared-module-library-and-d4-handoff-contract.md) 与 [24](24-d4-five-template-authoring-and-feedback-loop.md)。

## 1. 什么才叫「从 MD 转成模板」

不能只在编辑器里新建几个模块并获得 `validate PASS`。完整交付至少同时满足：

1. **源语义覆盖**：原 MD 每条独立核验职责、例外、阶段门禁、适用分支、需要人工处理的结果都能追溯去向；不等于强制“每条原文=一个 Check”，允许共享/拆分/合并，但合并后仍能单独判断的责任不被隐藏。
2. **对象与条件正确**：同一案的每个档案件和 read/copy/borrow 等不同操作有自己的目标；未知适用不得变成“不适用”，也不能默认激活另一分支。
3. **来源边界明确**：已核对原文内容 `content-checked` 不等于现行校规有效；共享模块不继承另一业务/学校依据。
4. **模块语义等价**：公共 B01/B02 只能覆盖相同的局部责任；业务资格、法律允许范围、正式审批必须由对应本地规则/有权部门维护。
5. **实际编译运行**：所有声明已制作的责任在真实 D2 `mapping/rules/subjects/authority` 中有据可查；至少合成正/负/未知/替代/阶段/错误来源反例，Pi 服务可按 Check 与 SourceRef 拒止越权。
6. **不支持有明确证据**：尚不具备的复杂条件、合法电子替代、阶段关系使用 fail-closed + `report-gap`，保留原责任，并列出待实现范围，不伪造“已完成”。

**覆盖率分母是原 MD 的独立审核义务，不是组件数量、代码行数、引用模块次数。** 同一条责任可能编译到两个操作 Check，几个职责也可能共享同一 Check——但若需要分别输出状态就不能把一个总 Check 当成多项结果。

## 2. 两阶段制作；先过责任清单，再写模块

### 阶段 A：独立理解原文（不写 D1 JSON）

- 读取完整原始 MD（不是第 16 号横向概要），记录文件 sha256、生效性与待核项、原文行/节定位。
- 抽取全部业务规则、限制、条件分支、阶段、主体、证据替代和“不足以决定”的人类权限。
- 生成 `source-catalog.json`：每项 `id/locator/purpose`，以及类型、对象、触发条件/unknown 结果、不能触及的行政权限。重复表述合并时必须保留所有原文 ID。
- **先让独立审查者完成或核对 gold**：哪些职责可以合并、哪些必须有独立 Check、作用对象/来源及反例是什么。Gold 不能只由同一个转换 Agent 依据自己做好的结果反推。
- 本阶段没有足够源材料时只能记 `source-missing`；不知道学校制度是否有效用 `policy-awaiting-confirmation`，不能删除责任。

### 阶段 B：用 D3 制作、编译、核对

1. 按局部语义运行 `discover/inspect`；记录“使用 B01/B02 / 拒绝共享”的**逐项理由**。
2. 为无合适共享定义的责任制作 `workspace-local` 模块/任务；为多主体和多操作绑定具体的 `objectKey`、`scenario`、模板实例路径，标出材料/阶段未知时的安全处理。
3. 每条独立结果必须拥有 Check、合法 sourceBinding 及 D2 runtime target；只需协同解释的复合文本允许同一 Check，**但不许把它当独立分子项都已验收**。
4. D1 `validate/save/diff` 后 D3 `validate`，D2 `preview`；建立 `conversion-ledger.json`，按原 ID 逐条标注 `implemented-not-tested`、`implemented-and-tested`、`policy-awaiting-confirmation`、`tooling-blocked`、`source-missing`、`manual-only` 或 `out-of-scope-with-reason`，列出完整 Check 目标和独立解释。
5. 针对原文所有关键分支及例外构造金标：正例、负例、合法替代、来源未知、异操作授权、另一阶段才应要求的材料、材料版本变化；金标须另存，不能直接作为运行 Agent 的输入。
6. 真正生成 D2 技术案卷和 Pi 工具回执；记录 `onlineModelRun` 是否真的运行。安全/来源门禁失败需要保存原始拒止理由，不能以“反正拒绝了”替代具体原因。
7. 导出/全新配置导入，验证 digest、fingerprint、规则分母、Check/Source/Subject 完全等价；尚无工具映射的原文规则不得因此被删去。

## 3. 可执行的原 MD 覆盖门禁

脚本：`apps/electron/scripts/review-d3-md-coverage.py`，仅 Python3 标准库。

```bash
python3 apps/electron/scripts/review-d3-md-coverage.py \
  --source /PRIVATE/PATH/original-business.md \
  --catalog source-catalog.json \
  --ledger conversion-ledger.json \
  --gold independent-reference.json \
  --plan actual-d2-preview.json \
  --gaps documented-gaps.json \
  --output coverage-report.json
```

四份 JSON 的结构可参照 `docs/design/review-agent/fixtures/d3-md-archive-7-pilot-*.json`，真实 D2 产物参照 `fixtures/d3-md-archive-b-actual-plan-snapshot.json`。

**使用规则**：
- `catalog.scope=full`：必须提供完整 MD 字节、源摘要且 Rxx 规则表的 ID 与 catalog 精确一致；检测遗漏 1 条或外加 1 条即失败。非 Rxx 原文仍需由审查者建立独立索引，现有自动索引无法识别的必须人工核对，不可宣称已验证。
- `scope=pilot`：明确 selectionReason；允许只审一小部分，未纳入的 runtime Check 会被报告，但 **PASS 只表示该小样本结构对照通过，永远不签完整业务模板**。
- 每条源责任恰有一个 ledger disposition；`tooling-blocked` 必须指向已登记的 `gapId`、原文责任和复现；`policy-awaiting-confirmation` 不能在 D2 中变成已确认制度；编译状态必须能在 D2 mapping 中找到 Check。
- 独立 gold 能约束所需 Check、目标 subject、来源 IDs，以及少量不可遗漏的 RuleSpec 关键语义文字。关键词只防明显漏写，不证明自然语言等价或法律正确。
- `implemented-and-tested` 至少列出实际运行引用，**但门禁本身不验这些 Run 的事实性或模型正确率**。独立验收仍需用真实运行快照核对 Check 分母、文档版本和证据。
- 即使门禁输出 `gate=PASS`，仍固定 `semanticEquivalenceVerified=false`、`onlineModelAccuracyVerified=false`、`completeBusinessTemplateCertified=false`；**完整业务质量需要独立评审与反例运行另行签署**。

## 4. 一个真实反面样本：档案 v1.5 的七项代表责任

原文共有 42 条 R01–R42。Agent B 的 D3-10 交付故意只做 A/C 共享模块与档案 read/copy 片段（实际 6 条 Check），它已经通过其**限定范围的 D3-10 验收**，但不能据此直接签完整转换。

为验证门禁能发现“合法 JSON 也会漏业务”的风险，使用原文七项独立参考：

| 原始职责 | 对 B 技术片段的对照 | 质量风险 |
| --- | --- | --- |
| R08 双方代理身份 | B01 目前侧重授权对象/操作/时间 | **没有独立身份双方核验 Check**，需补制作或另建资格/身份模块 |
| R09 代理授权对象 | read/copy 两个 B01 Check | 有范围隔离，校规仍待核 |
| R10 代理方式与期限 | B01 和 read scope-trace | 部分映射可见，需更多主体/时间反例 |
| R18 公布与开放区分 | `item-1-open/open-state` | 合成安全约束被编译，**不能借此声称馆方开放状态已获证实** |
| R23 复制独立权限 | `item-1-copy-local/copy-authorization` | 正确作用到 copy，未核校规只可待核 |
| R29 合法电子授权替代 | `D2_UNMAPPED_ADVANCED` + gap | **仍然 TOOLING-BLOCKED**，不能把正确拒止当已支持 |
| R33 待批准不等于申请人缺件 | B 的任务限制里有禁止自动批准的描述 | **无独立阶段/审批待办 Check**；原业务完整实现时需可观测 |

审查者将这七项写入自己的独立 gold；对 B 现有产物执行覆盖脚本，**预期 FAIL 并报告 R08、R33**。这是一条刻意预留的负向回归：若脚本“通过”，说明检查器没有防住漏项；不能让作者降低 gold 以求通过。

运行（仓库自带的是源 ID/摘要/金标及真实 D2 技术快照；**用户原 MD 未提交到 GitHub**）：

```bash
python3 apps/electron/scripts/review-d3-md-coverage.py \
  --source /PRIVATE/PATH/g01_archive_utilization_template_editor_spec_v1_5.md \
  --catalog docs/design/review-agent/fixtures/d3-md-archive-7-pilot-catalog.json \
  --ledger docs/design/review-agent/fixtures/d3-md-archive-7-pilot-ledger-agent-b.json \
  --gold docs/design/review-agent/fixtures/d3-md-archive-7-pilot-independent-gold.json \
  --plan docs/design/review-agent/fixtures/d3-md-archive-b-actual-plan-snapshot.json \
  --gaps docs/design/review-agent/fixtures/d3-md-archive-7-pilot-gaps.json
# 预期 exit 1 / gate FAIL：R08、R33；源 SHA 正确时 sourceHashVerified=true
```

**特别注意**：这一失败是“拿不完整片段冒充完整七项”的反例，不能倒扣 B 的原 D3-10 通过判定。R08/R33 是否能组合/拆分为更合理模块需要独立业务作者研究，而不是强制每条原文立即建一个节点。

## 5. 实际让陌生 Agent 证明「理解 MD」需要新增的盲测

本门禁是脚手架，不是自动转换完成。要回答用户真正的可用性问题，还需一个**未参与制作的独立 Agent**用原始完整 MD 与冻结 D3 工具建立 `catalog/ledger/workspace/real D2 plan/tests`，另一名独立评审者保留金标，完成以下独立观察：

- 完整 42 项 **没有任何无标记漏项**，所有条件分支、例外及人工决定有明确去向。
- 抽测至少 7 项独立行为（含上表 R08/R33）以及 read/copy 组合，至少一个真实材料/Pi 服务负例、一个 source-unverified、一个电子替代 fail-closed，且不能把失败归因混淆。
- 任意共享模块不再把代办授权扩展到正式允许档案查阅或复制。
- 作者能用文档和真实 CLI 自行修复少量建模错误，不靠改公共 D3 代码让模板“跑绿”。
- 第三方评审可复算来源摘要、Gold 与 Check/Run 账本；确认关键业务误判不出现。

**这项完整 MD 制作验证属于 D3→D4 的能力压力验证 / D4 首个质量试点。当前状态是 NOT-RUN，而不是 PASS。** 有缺陷按 [24](24-d4-five-template-authoring-and-feedback-loop.md) §6 归因，必要时退回 D3。不能用一轮格式检查声称 Agent 已完全理解合法业务逻辑。
