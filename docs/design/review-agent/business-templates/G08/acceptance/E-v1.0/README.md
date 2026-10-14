# G08 E v1.0 独立验收工作区

- 审计者：G08 独立 E 会话；依据《05_E_GXX领域独立交叉验收_主会话_v1.0.md》。
- 范围：G08-T02 / G08-T03；T01 已根据 A v0.2.1 归入 G01，待 E3 核查合并边界。
- 基座：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。冻结的 A/B/C/D ZIP 位于有权访问的用户文件库，**不在 Git 仓库**。
- 状态：**E0 已完成，E1 受控启动**；E2/E3/E4 尚未签署，任何单项 PASS 不成立。
- 阅读顺序：`E0-decision.md` → `E0-input-manifest.json` → `E0-coverage-and-isolation.md` → （形成并锁定）E1 → E2 → E3 → E4。
- Gold 隔离：公开报告只能有摘要、哈希与脱敏票据，严禁上传私有 Gold/overlay、可信模拟底账、答案泄漏脚本。
- 状态跟踪：`E-phase-status.json`。所有后续报告必须记录原始冻结输入哈希、审计版本和下一步。

`E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION`。
