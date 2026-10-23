# E0 阶段裁定 — BLOCKED_INPUT

- **验收批次**：G02 E v1.0 r01，2026-10-13。
- **固定仓库基线**：`Fuck-GH-Admin/cdut-studio-review-agent@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。
- **A/B/C/D 固定输入**：`E0-input-manifest.json` 中 20 个字节级冻结 Archive；A/B/C 原作者 Git SHA **未取得**，不可假填。所有 ZIP CRC PASS，C母版实际SHA匹配C E交接，D T01 v3/T02 v1 bundle SHA匹配作者声明，T03 D版本声明尚待独立确认。
- **验收范围**：G02-T01/T02/T03；G02-T03 是条件研究候选，非默认发布。A目录 43 种研究场景单独在 E3 做覆盖检查。
- **E0 内容盘点**：完成。**E0 独立性门禁：失败。**

## 正式阻断

`BLINDING_COMPROMISED`：本轮审查者在 E1 判断冻结前，读取了 C 作者的 T01/T02/T03 语义交接摘要，违反 E0 的元数据只读限制；不能在同一审查者身份下声称随后对受影响领域的 E1 是完整独立盲审。

`ACL_UNVERIFIED`：D Gold 各包虽与待审输入分离，但实际私有访问隔离无证据；T02 作者摘要直述未配置私有 ACL。**Gold 内容未被本审计者读取**，亦未被提交到仓库。这是独立性待证，而非声称已发生 Gold 泄漏。

`MISSING_GIT_PROVENANCE`：公开仓库固定 main 不含 G02 A/B/C/D 原资产，作者侧 Git SHA 与来源分支不可核；文件字节可在用户 Library 固定，但不能伪称由 repo 提供统一可重放作者 commit。

## 退出条件与下一阶段

**E0 不满足本审查者独立 E1 的准入门，故按合同停止本轮受影响的 E1–E4，不伪造 E1 事实基线、规则交叉覆盖或发布 PASS。** 另启未见 C 语义/Gold 的 E1 独立会话，基于这份 E0 manifest 与 A/B原件完成风险预注册、官方原文核查、冻结 E1 独立事实及 hash；隔离 ACL 核实后才能 E2 读取 C/D。E3/E4 依赖 E2 完成。若正式版本改变，新增 SHA 和审计轮次，不覆盖本 E0 结论。

## 分维度状态（仅截至 E0）

| sourceValidity | templateFidelity | goldValidity | crossTemplate | provenanceIntegrity | technicalTemplateRuntime | onlineModelAccuracy | administrativeAuthority |
|---|---|---|---|---|---|---|---|
| NOT_ASSESSED（E1未运行） | BLOCKED_INPUT | BLOCKED_INPUT | NOT_ASSESSED | BLOCKED_INPUT（Git/ACL） | NOT_RUN | NOT_RUN | NOT_VERIFIED |

`E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION`。
