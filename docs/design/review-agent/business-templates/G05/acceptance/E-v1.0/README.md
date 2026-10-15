# G05｜E v1.0 独立验收 r01

- 任务：G05 全领域，六个 TXX；2026-10-14 开始。
- 本审计是独立研究性质量核查，不修改 A/B/C/D 作者文件。
- GitHub 固定母基线：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`；审计分支 `audit/g05-e-v1-r01`。
- 当前阶段：**E0 完成部分版本锁与隔离审计，状态 `BLOCKED_INPUT`**。E1/E2/E3/E4 尚未执行。
- 关键限定：六份C母版原始字节摘要已核验；完整B/C辅件/D受控包尚未锁入可复现统一输入。T04聚合Gold统计曾在E0暴露，盲态待重建。
- 续接入口依次：`E0-decision.md` → `E0-coverage-and-isolation.md` → `E0-input-manifest.json` → `E4-issue-ledger.md`。
- 公开分支**不含**受控 Gold、逐案例答案、可信校方底账或个人材料。
- E1的原始事实判决应在接触 C 正文 / D 逐案答案之前自行计算摘要并固定，不得让此 E0 缺口阻断记录被冒充通过。

`E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION`
