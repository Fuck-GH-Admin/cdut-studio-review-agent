# 31｜D3-01～12 Release 证据矩阵与新增加的 MD 转化质量门槛（2026-10-11）

> **状态：D3 技术验收证据复核；未签 D3 Release。** 这是 Release candidate 判断，不是向 D4 五会话发放正式开工许可。公共工具旧基线：`5c940602068f4ae472da5ffeb99a496e96821655`，五组 CI 在该 SHA success；本次 MD 质量门禁新增于 Draft PR #14，必须按其最新 HEAD 单独验证。参照 [23](23-d3-shared-module-library-and-d4-handoff-contract.md) §7、[24](24-d4-five-template-authoring-and-feedback-loop.md) 与 [30](30-d3-10-independent-agent-acceptance-result.md)。

## 1. 十二项验收证据（技术工具层）

| ID | 范围与原始通过标准 | 可核验证据 | 判定与限制 |
| --- | --- | --- | --- |
| D3-01 | 完全新配置下零共享模块、无需复杂 Claim 创建文本模板 | Agent A PR #11：revision 1→2→3、独立 D1/D2/Pi 技术验收；第三方 PR #13 重跑 | **PASS**；AI 自主文本语义识别并非该合成回执结论 |
| D3-02 | 共享模块两工作区复用且 digest 一致 | Agent B PR #12 B01/B02 A/C 工作区、模块锁及 D3 BDD | **PASS** |
| D3-03 | 冻结篡改、缺依赖、循环及坏 digest/version 拒止 | D3 module-library/Bun CLI 测试与 W3 复测 | **PASS** |
| D3-04 | 共享语义参数化但来源独立、不借规则权威 | PR #12 A/C SourceBinding 和 D2 authority 映射、独立预期 | **PASS（合成来源）** |
| D3-05 | impact、显式 upgrade、历史和未升级工作区不漂移 | PR #12 四个 v1 消费者、B01 v2、A read 升级、copy/C 不升级、未签收拒止 | **PASS** |
| D3-06 | C 双分支、A read/copy 分对象计划及真实 Pi 服务接口 | W3 `review-d3-pi-integration.test.ts`；Agent B 自有 `archive-r3` Run 和合成逐操作控制案卷 | **PASS（真实服务端、合成回执）**；不是在线模型准确率证明 |
| D3-07 | 未支持的证据替代/高级阶段关系明确拒止并报告 | B 的 D1 有效高级输入，D2 `D2_UNMAPPED_ADVANCED` exit 1；`report-gap` 映射 R08–R10/R29 和基线 Run | **PASS（安全拒止）**；高级关系的真实执行能力仍 TOOLING-BLOCKED |
| D3-08 | 不可信规则含伪权威/提示命令不可提权 | D3 adversarial 源与实际 Pi 服务端守卫回归 | **PASS（服务端边界）**；在线模型提示注入盲测单列 NOT-RUN |
| D3-09 | export/import 干净目录编译与来源、指纹等价 | A/B 携包、W2/D3 CLI、第三方双 runner 复验 | **PASS** |
| D3-10 | 两个陌生独立作者、无隐藏上下文完成任务 | PR #11/12；审计 PR #13，[双 runner #38093886953](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093886953) | **PASS**，[30 号签署](30-d3-10-independent-agent-acceptance-result.md) |
| D3-11 | 全量 + D1/D2/D3/旧回归在同一 HEAD 成功 | 基线 `5c940602`：[PR CI #38093981756](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093981756)、[D3 #38093981754](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093981754)、[D2 #38093981858](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093981858)、[D1 #38093981749](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093981749)、[旧回归 #38093981755](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093981755) | **PASS 仅限该 SHA**；合入 PR #14 后必须重新运行最新集成 HEAD 的全部门禁 |
| D3-12 | 未映射项关联源 MD/原始责任/模板/实例/Check/Run | W4 `report-gap` 拒止 spoof 和坏路径；B 的 P2 溯源原 MD R08–R10/R29、完整模拟复现以及真实基线 Run | **PASS（结构和追溯）**；`verifiedAgainstRun:false` 不可写成“高级输入 Run 已验证” |

**禁止误读：** 12 项技术测试不是“五份完整业务 MD 无损转换”验收。D3-10 的 A 是最小文本，B 是 A/C 的几个严选共享模块**业务片段**；不要求 B 先做整个档案模板。该片段通过不能外推出整体业务模板可用。

## 2. 新增 D3-MD-Q1：完整原文责任追溯能力（尚未整体 PASS）

用户关切：给制作 Agent 一份真实、完整、已调研的业务 MD，它能否在不漏审、不错误合并、不断言不存在的校规、不误复用公共模块的前提下，转为完整可审的技术模板？

答案需要 **独立对照 + 实例代码与实际 D2 编译结果 + 反例运行**，而不是一次合成 Demo 绿灯。

- 原档案 v1.5 Markdown SHA256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`，§6 按原文表格可以解析出 **R01–R42 共 42 条原子核验点**，不等同 42 个必须独立成模块的节点。
- Agent B 的 `archive-r3` 是**刻意限定为小片段**的 6 个 D2 Check；既没有声明，也不应被认为已经覆盖全部 42 项。
- 新增 `fixtures/d3-md-archive-original-rule-index-v1.json` 记录 42 项 ID、原文规则名与位置，**不提交用户的全量原 MD**；完整源文件必须由有权使用的业务作者在自己的隔离环境显式提供和哈希核对。
- 新增严格来源目录/作者 ledger/独立 gold/真实 D2 plan 对照 CLI（`apps/electron/scripts/review-d3-md-coverage.py`）。该门禁只能发现缺少 Check、错对象、越权来源、遗漏 gap、金标冲突及若干可核实的语义关键词，不能自动证明文本逻辑等价或模型阅读效果。
- 七条 `R08/R09/R10/R18/R23/R29/R33` 独立审查样本刻意把 B 小片段当作**不完整转化候选**；预期工具报告 **FAIL**，指出“代理双方身份没有独立 Check”和“待审批≠缺件没有专门的阶段 Check”。这是质量门禁拦住真实缺口，**不是**宣称 B 的有限 D3-10 任务失败。
- **当前 D3-MD-Q1 = PARTIAL / FULL CONVERSION NOT-RUN。** 原业务作者还没有按完整原 MD 新制作一版完整 D4 工作区，不能签“五套原文无损转换”。本门禁代码及自动化自身必须先通过 PR #14 同 SHA CI。

## 3. 建议的阶段判断

- D3-01～12 工具层已积累足够实证；**先把门禁、制作 Agent handoff 说明和独立金标质量规程固定**，再考虑 D3 Release。
- 如果质量试点发现缺陷在工具而不是作者使用上，返工 D3；如果工具正常但业务作者漏了要求，优先改模板、补来源与金标；不能通过提高成功率删掉源 MD 义务。
- D4 五套正式并行仍需要独立的 Release SHA、模块 digest、用例金标及准入签字。不提前启动 D5。
