# G06 E0｜准入裁定（r01）

**裁定：`READY_WITH_DECLARED_GAPS`（仅允许 E1 独立事实复核；不等于 E2/E3/E4 或设计验收合格）。**

- 日期：2026-10-14。
- Git 审计分支：`audit/g06-e-v1-r01`；仓库起点：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。
- 原产物仓库化状态：`PARTIAL`。主分支只存在 G01 模板目录；G06 完整 A/B/C/D 主要来自用户文件库（完整字节指纹见 E0 manifest），T09 另有公开 D 摘要分支，**不能为多源产物捏造统一作者 SHA**。
- A 研究阶段自评：`DOMAIN_PARTIAL`；正式目录以 T01–T09 共 9 个为母集，T10 作为待证暂缓候选。
- 归档存取与完整性：9 B + 9 C + 9 D 输入 + 9 D 隐藏评测包 + 9 D 报告 + 1 A 共享基线均可读取 ZIP 字节、SHA-256 已实算、ZIP CRC 完整。
- E0 盲审状态：`NOT_CONTAMINATED_BY_C_OR_GOLD`，没有打开 C 业务判断正文或 D 期待答案。请以 E0 计划中的 H/M/L 风险母集执行 E1。
- **不得提前进入 E2**：E1 首先完成全部适用 H 的独立官方来源核对，保存 `E1-official-fact-register.md`、`E1-adversarial-hypotheses.md`、`E1-evidence-lock.json`，并使文件 SHA-256 与锁定时间均固定。
- 保留依赖缺口：校本原始 DOC/DOCX 以及政策全文/权限、T08 B 后续补证文件的额外独立冻结、Gold 生产独立性过程证据及访问 ACL、D 单案/包内部版本对应、C/D 作者源 commit。该缺口不足以让任何模板自动 PASS。

## 下一阶段输入

1. E0 冻结清单 `E0-input-manifest.json`；官方来源原始定位由 A 共享 ZIP 的 `G06_03_来源索引.md` 及 B 各 TXX 的 `_04_官方来源与差异登记.md` 提供。
2. 首先只展开/查阅 **A/B**，不打开 `C-CLOSED` 或 `D-GOLD-CLOSED`，依据 E0 事前计划按 TXX 拆批次核对官方原文。
3. 来源无法查全文时记 `SOURCE_UNVERIFIED` / `POLICY_PENDING`；官方文件不适用于本校时记 `CROSS_SCHOOL_REFERENCE`，不转写为当前强制条件。

**结论边界**：`E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION`。
