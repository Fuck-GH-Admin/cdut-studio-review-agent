# G04｜独立 E v1.0 审计 r01

E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION

范围：G04安全、通行与校园秩序；A正式领域目录8个TXX，A候选40条。审计者G04-independent-E-r01，核查2026-10-14。

**首轮E0–E4已形成正式报告；研究设计裁定 `BLOCKED_INPUT`，并有 `BLOCKED_SOURCE`。不签PASS_DESIGN。** 主要阻断：T01 C缺失、作者源码固定SHA/Gold ACL未证及各业务当前校本有权来源缺口。T06 C损坏七条来源URL为已证P2。Gold仅结构核对212案例，业务预期并未逐案全量独立复算。

## 审计阅读顺序
1. E-final-verdict.md：整体裁定、逐TXX八维状态与复验先决条件。
2. E-final-manifest.json：固定Git基线、每个文档及ZIP可重放摘要、问题汇总。
3. E0-input-manifest.json / E0-coverage-and-isolation.md / E0-decision.md。
4. E1-official-fact-register.md / E1-adversarial-hypotheses.md / E1-evidence-lock.json（于读取C/Gold**之前**冻结）。
5. E2-duty-crosswalk.csv / E2-case-audit.md / E2-TXX-verdicts目录。
6. E3-domain-coverage.md / E3-cross-template-matrix.md / E3-domain-verdict.md。
7. E4-issue-ledger.md / E4-retest-ledger.md。

A/B/C/D原件为ChatGPT Library中的ZIP归档，源作者Git提交不可考；E本分支仅保存必要证据、校验摘要与脱敏报告，绝不公开隐藏Gold、学生个人信息或敏感底账。E只提问题不擅自修复作者C/D。
