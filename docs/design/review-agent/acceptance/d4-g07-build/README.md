# G07 D4｜七套真实业务母版的模块化候选与技术运行

**定位：研究性技术预审。不是学校行政审批、已确认财务制度、自动支付、受控 Gold 验收或真实业务线上发布。**

- 统一公共代码（严格父提交）：`a7a6a11d4840ad64cfc858c17b35f35180adf063`，COMMON PR #88。
- G07 作者分支：`feat/d4-g07-modular-templates-r01`；Draft PR [#90](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/90)，base 为 `feat/d4-common-object-scenario-r01`。
- 七份 C v0.1 原始 Markdown 逐字归档于各 `TXX/source/frozen-C-v0.1.md`，CI 重算 SHA-256，按固定原作者 Git blob SHA-1 比对一致；这些是候选业务稿，不是经校方签署的正式制度。
- 全量 **260 条 R-ID** 已映射为模块中的独立责任；非编号章节也已成为可追溯的语义任务（规则章节用规则簿追溯），段落、F/M/MS、EV、ST、BR、结果/人审保持在完整原文与 coverage-ledger 中。任何非编号语义均须在独立验收中进一步检查实质等价，不以规则 ID 数量取代语义验收。
- 七份 `ReviewAuthoringWorkspaceV1`、本地模块 @1、实例、`sourceBindings.genericScope`、`policy-candidate / unknown` 来源分类、逐对象 `generic-object`、主场景和三值条件测试输入均为真实 JSON。没有强行复用 B01/B02，故 `sharedModuleLocks=[]`；各本地模块版本锁由工作区和 D3 携包摘要记录。
- GitHub Actions 专项 [#39051441393](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051441393)：**7 PASS / 0 FAIL**，含 D1 校验与不可变 save/read/diff、D3 export/import、D2 v3 逐对象 Plan、真实合成案卷与材料/证据链接、Pi prepare/submit/verify，以及错误对象、缺条件、陈旧来源、跨 Subject 证据和旧文档版本的负例。Plan/Run/判定原始 JSON 在 `runtime/TXX/`，每个 `technical-verdict.json` 有实际 SHA256 与 fingerprint。此 CI 不是真实学校系统/在线模型准确率测试。

## 每套实际制作与运行

| 模板 | C 原子规则 | 已定义语义任务/SourceBinding | 本地模块 | 实测 Subject | 实测 D2 Check | 交付状态 |
|---|---:|---:|---:|---:|---:|---|
| T01 | 32 | 61 | 15 | 2 | 122 | PARTIAL |
| T02 | 36 | 65 | 15 | 2 | 130 | PARTIAL |
| T03 | 33 | 62 | 15 | 2 | 124 | PARTIAL |
| T04 | 36 | 66 | 15 | 2 | 132 | PARTIAL |
| T05 | 45 | 74 | 15 | 2 | 148 | PARTIAL |
| T06 | 36 | 67 | 15 | 2 | 134 | PARTIAL |
| T07 | 42 | 71 | 15 | 2 | 142 | PARTIAL |

合计：**7 套、260 原子规则、466 个已绑定作者态语义任务、105 个 workspace-local 模块、14 个合成 Subject**。每套保留逐 Subject Check 与来源、文档版本、Pi 待确认回执。**PARTIAL** 并非“运行失败”，而是业务条件与权威来源不能声称完整落地。

## 必须保留的执行界线

1. **ENGINE/AUTHORING**：COMMON-02 每模板最多 13 个叠加条件轴。本次采用 `core` 主场景 + 12 个 BR 条件轴，其余业务 BR 在冻结原文与语义责任中保留，尚未证明能自动进行所有互斥/叠加/逐条适用性判断。语义审核可以提取线索，但未知不得默认为 false/通过。
2. **POLICY/SOURCE**：全部冻结 C 原件为候选业务规则，`source.kind=policy-candidate`、`applicability=unknown`，不能因为 D2 编译/证据链接成功而转成“已核实学校政策”。待校方有权岗位确认制度效力、资金/对象/时点，进行来源授权配置后才能评估确定性状态。
3. **EXTERNAL/HUMAN**：科研经费余额、历史已付款、税票真伪、专家资格/签批、真实银行入账、会计冲正/债务结清缺授权权威接口。禁止将语义模型的金额建议记为财务最终可付数额；T07 不实现正式清账。
4. **TEST**：七个技术 Pi 回执以 `awaiting-confirmation` 完成受控案卷，不代表七套业务语义正确；隐藏 D Gold 没有读取，历史 E0 `BLOCKED_INPUT` 未由此取消，线上模型准确性未测。

## 开发及复验命令

```bash
bun install --frozen-lockfile
export PROFER_CONFIG_DIR="$(mktemp -d)"
export D4_G07_OUTPUT_DIR="$PWD/docs/design/review-agent/acceptance/d4-g07-build/runtime"
bun test --isolate --timeout 180000 apps/electron/src/main/lib/review/review-d4-g07-templates.test.ts
# 单套独立 CLI 也可直接执行，例如 T03
P=docs/design/review-agent/acceptance/d4-g07-build/T03
bun apps/electron/scripts/review-authoring-v1.ts validate "$P/workspace/workspace.json"
bun apps/electron/scripts/review-d3-library.ts validate "$P/workspace/workspace.json"
bun apps/electron/scripts/review-d2-plan.ts preview "$P/workspace/workspace.json" "$P/fixtures/selection.json" "$P/fixtures/case.json"
```

新配置目录与合成案例 ID 必须互相隔离，切勿接真实学生/财务数据；请勿将本目录纳入自动发布模板目录。每套 `manifest.json`、`issues.json`、`source/coverage-ledger.json` 和 `runtime/TXX/technical-verdict.json` 分别给出来源、义务、技术状态与缺口。
