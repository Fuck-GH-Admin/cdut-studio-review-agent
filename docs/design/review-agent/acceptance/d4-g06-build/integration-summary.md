# CDUT Studio D4｜G06 完整业务模板制作与合成运行交接

**COMMON 技术父提交**：`a7a6a11d4840ad64cfc858c17b35f35180adf063`，固定 PR #88；本领域 Draft PR #92 的 base 是 `feat/d4-common-object-scenario-r01`。原 C v0.1 九套完整 Markdown 业务母版按字节 SHA 固定，原文未修改，另有 T01 v0.1.1/R43 不在本轮混合。

本轮实际入仓：九套 `G06-Txx/workspace.json`（D1 作者态，可编辑原文语义模块）、`source-catalog.json`（含 R 与非 R 字段/材料/证据/条件/阶段定位）、`coverage-ledger.json`、`selection.json`、`case.json`、`manifest.json`，以及各套 `runtime/G06-Txx/d2-actual-plan.json`、`pi-actual-run.json`、`technical-receipt.json`。零外部 B01/B02 强制复用；每套模块都明确保持 workspace-local 和版本 1，D3 携包无损导入输出。

**两轮原始 CI**：[真实执行与冻结 #39050795868](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39050795868)；[重复验证 #39051081182](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051081182)。后者 9 tests、5094 assertions、0 fails，包含 typecheck、D1 validate、D3 export/import、D2 v3 plan、真实 D2 建案/材料登记/人工证据关联及 Pi prepare/submit/verify。`verifyD2PiRun` 九套均 `{complete:true,problems:[]}`。

| 模板 | R 条数 | 局部模块数 | 实际运行 Check | Subject | 有界合成技术链路 | 模板完成状态 |
|---|---:|---:|---:|---:|---|---|
| G06-T01 | 42 | 77 | 146 | 2 | 通过 | PARTIAL |
| G06-T02 | 36 | 74 | 138 | 2 | 通过 | PARTIAL |
| G06-T03 | 30 | 60 | 110 | 2 | 通过 | PARTIAL |
| G06-T04 | 35 | 70 | 130 | 2 | 通过 | PARTIAL |
| G06-T05 | 28 | 63 | 120 | 2 | 通过 | PARTIAL |
| G06-T06 | 34 | 64 | 124 | 2 | 通过 | PARTIAL |
| G06-T07 | 35 | 71 | 128 | 2 | 通过 | PARTIAL |
| G06-T08 | 24 | 63 | 110 | 2 | 通过 | PARTIAL |
| G06-T09 | 32 | 68 | 126 | 2 | 通过 | PARTIAL |
| **合计** | **296** | **610** | **1132** | **18** | **9/9 通过** | **9 PARTIAL** |

**已复验的反例**：每套两个合成业务对象、不同主场景、多个附加三值轴；对象 ID / Subject 不同。确认仅关联 A 的有效材料不会替 B 产生符合结果，过期/错版本证据也被拒；`unknown` 不得变成符合。所有未核校方规范的 Pi Check 结果均为 `awaiting-confirmation`，不冒充学校制度有效。

**缺口与治理**：详见 `issues.md`。T02 尚有 AX-09—AX-12 未作为结构化三值条件单独运行，T09 AX-01 等价性待核；跨对象复杂 Claim 关系不是已运行的确定性合同/伦理/知识产权审查。独立业务金标、全路径组合、真实线上模型准确率、真实校方审批全部 **NOT_RUN / POLICY_HOLD / EXTERNAL**。这些限制使每套模板状态保持 `PARTIAL`，而不是 `READY_FOR_INTEGRATION`。

**复现**：使用 COMMON exact commit 与本 PR 源码，在仓库根目录执行 `bun install --frozen-lockfile`、`bun run typecheck`、`D4_G06_RUNTIME_DIR="$(mktemp -d)" bun test apps/electron/src/main/lib/review/review-d4-g06.test.ts`。各次 Check/Subject 数与 planFingerprint/Run ID 在对应技术回执中可独立复核。

最终范围结论：`BUILT_NINE=TRUE; SCOPED_SYNTHETIC_D1_D3_D2_PI=9_PASS; FULL_BUSINESS_COMPLETENESS=PARTIAL; UNIVERSITY_AUTHORIZATION=NOT_VERIFIED`。不合并 Draft PR、不把合成技术审核认作正式行政批准。
