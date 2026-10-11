# Agent B — 档案利用申请审核独立质量金标

**角色**：只做业务质量 Oracle、材料/预期隔离测试和最终交叉验收依据；不制作最终 D1 模板，不修 D3/D2/Pi，不读 Agent A 分支、PR、JSON、ledger 或变更。

- 固定代码基线：`6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`，目标分支 `feat/review-d3-shared-frozen-modules`。
- 独立分支：`test/d3-md-independent-gold-archive`。
- 唯一业务真值：私有原 MD `g01_archive_utilization_template_editor_spec_v1_5.md`，**SHA-256** `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`。
- 2026-10-11 在隔离工作区读取原始 70,413 字节、725 行文件，并用 `sha256sum` 与提供值核对一致。GitHub **不包含原 MD 全文**。
- 读取背景边界仅包括 15、16、23、24、31、32 号设计文档；没有以 16 号横向概要或已有七项 pilot gold 反推出业务答案。
- **业务含义已提取 ≠ 本校规章已认证 ≠ D2 编译成功 ≠ Pi 模型正确 ≠ 有权审批/实际交付**。

## 索引边界

`source-catalog.json`：R01–R42（42）、B01–B15（15）、S01–S14（14）、E01–E16（16）、正文约束 P01–P16（16），共 **103** 个追踪 ID。B/S/E/P 属于条件、材料、反误杀或不变量；**不暗示 103 个独立 D2 Check**。

`independent-oracle.json`：每个来源 ID 的语义、对象、触发/排除、反例、证据和审批限制；真实 Check ID 有意全部留空。它不预测另一名作者的模块命名。

`branch-matrix.json`：主体、档案件、操作、校规来源、渠道、证据和阶段的交叉维度，含 15 个分支和 14 个材料槽。

`tests/cases/archive-cases.json`：仅合成申报与材料、虚构人员和测试学校，不含正确答案；`tests/expected/archive-expectations.json`：30 案预期、所涉责任、误判断言及待核边界。**不能一起传给受测 Pi Agent**。

`check_oracle.py`：Python 标准库静态检测：责任 ID 完整性、索引对应、期望和材料隔离、测试配对、逐操作目标、source anchor 与原文 SHA。未提供原始 MD 时只允许 `PASS-STRUCTURE-ONLY`。

`source-audit.md`、`semantic-boundaries.md`、`quality-checklist.md`、`gold-adapter-guide.md`、`run-log.md` 与 `verdict.md` 是人工复核依据。

## 核验

```bash
# 无私有 MD，可跑结构检查（不能证明原文匹配）
python3 docs/design/review-agent/acceptance/d3-md-full/agent-oracle/check_oracle.py

# 有经授权的原始 MD，在本地严格做内容锚点、真实字节摘要和格式检查
python3 docs/design/review-agent/acceptance/d3-md-full/agent-oracle/check_oracle.py \
  --source /private/g01_archive_utilization_template_editor_spec_v1_5.md \
  --output /private/oracle-source-audit-result.json
```

仓库原已有 `apps/electron/scripts/review-d3-md-coverage.py` 作为 **源→作者 ledger→真实 D2 plan→独立 gold** 结构检查器。本 PR 不修改它；见 `gold-adapter-guide.md` 说明之后如何绑定真实 Check，不能因没有另一作者的产物而虚构 Run。

## 冻结边界

对每个 `case_id + item_id + operation_id` 单独判断，不得从身份、委托、单位函、目录或同档查阅推导复制、摘录、证明或外借权。所有预审自身交付权为 false。合法替代与未核校规不产生新式的硬性缺件；待审批不能改称缺申请人材料。学校最终签批和档案馆交付属外部有权系统。
