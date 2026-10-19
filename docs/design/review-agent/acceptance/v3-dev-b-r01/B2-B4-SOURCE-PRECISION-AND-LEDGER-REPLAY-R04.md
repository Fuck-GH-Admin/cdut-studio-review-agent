# Dev-B B2/B4-R04｜来源精度与 InputLedger 状态回放工程批次

**权限边界**：B-owned 解析候选、输入账、历史来源证据；不是 Main Principal、CurrentCase、InstallPlan、ApplyMaterial、学校 Policy/Gold 审批。C 的 B-CR-001 仍 `APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`，I1 固定原绿 B 源不随 B HEAD 自动更新。

## B2 真实修改

1. `review-source-version-adapter-v3-b2.ts`：对 DOCX 使用 `document-block` 诚实标明 Mammoth/document-service 块顺序；C0 `paragraph` 只是兼容载体，JSON 明确 `locatorKind=docx-parser-block` 或 `docx-table-cell`、`parserBlockIndex` 和真实 parser table 坐标。**不再写入伪 `paragraphIndex`**；DOCX 纯文本 fallback 或表格缺 row/column 仅 file-level approximate。Excel 要求有效 sheet 及正整数行列，PDF 保留真实 normalized rect；未证明的坐标不抬为精准引用。
2. `parseRevision` 的 fingerprint 补入 parser 读序 `readingOrder` 和错误详情；当解析结果语义变化时不沿用旧 block ID。跨物理版本仍由旧实现的原始 SHA、physicalSourceKey、owner/Subject generation 与 staging registry 分隔。
3. `review-import-ledger-v3-b2.ts`：重放 hash-linked per-entry receipt 时验证每个合法 ZIP 子文件最多只能有一个终态 mutation，历史 rejected child 不可被再次决议，最终 input 文件 status/reason 必须与 terminal receipt 对齐；无决议应保持初始 needs-user-confirmation。即使单独重新计算普通 ledger SHA256，也不得通过内部矛盾账。没有新增任何正式 Case/Run/Batch 写入。
4. 对应 Bun 正反例新增：DOCX 块/表格与 fallback、XLSX/PDF 坏几何、PDF readingOrder 版本变化、复制摘要后的状态冲突、重复终态决议。

## B4 G01 34 个 Scope 缺口

从历史 Git Blob `aec737f471d4e648ab98a9243dcf4bc9939ce8a5` （原始 MD SHA256 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329`）的原文 **536 行**，对 34 个缺显式 Scope Check 逐个提取 R/S/M/F 锚点和行号，原文 exact line 保存为 `B4-G01-34-ORIGINAL-LINE-ANCHORS-R04.json`。源码按 checkId 追溯到可见原文行 **34/34**，但业务对象、Subject、caseScope 尚无逐项授权裁决：**34/34 继续 UNKNOWN / NO_AUTO_DEFAULT**。该项只是可复核原文字面定位，不允许自动补 scope。

## 门禁与后续

- Gate O：**新精确 SHA 提交后仍需 PR CI/D2/Baseline 成功**（必须同 SHA 验证 typecheck/boundaries/完整构建/Bun，不能借旧 PASS）；本报告在工程验证前不标通过。
- Gate E：NOT_RUN（真实 DOCX/XLSX/PDF、Office71、Electron Main Native Picker、非正常退出/多进程/ENOSPC、安全 ACL）。
- Gate L：BLOCKED_NO_AUTH（签发政策、真实 SchoolPort Principal、独立 Gold）。
- Gate P：PARTIAL（第51套 UAT、其他38套原文字节、50套逐义务无损性和 34 Scope 仍待决）。

后续 I 只能在新 SHA Gate O 稳定绿灯后取 B2 技术 source slice；C-only Main 写入仍等待 C 实际 command 及安全签收。
