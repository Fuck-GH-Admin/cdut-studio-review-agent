# CDUT Studio D4｜G01 五套完整模块化业务模板技术制作交接（COMMON R2）

> **Draft 技术候选；不是正式校规或行政许可。** 固定公共父提交：`a7a6a11d4840ad64cfc858c17b35f35180adf063`；COMMON Draft PR #88；本领域 Draft PR #95，base `feat/d4-common-object-scenario-r01`。本文件由领域制作 Agent 提交，不能替代独立 E/金标验收。

## 1. 真实交付范围

原始 Markdown 全文位于 `docs/design/review-agent/business-templates/G01/originals/`，按 main 原件 Git Blob **原样搬运**至本独立 COMMON 子分支（原 COMMON 交接树中尚不存在五文件）。`source-manifest.json` 保留五份源 SHA-256、原始版本和 Git Blob；未更改原文。G01 五个独立业务目的没有拆成更多模板。

| 模板 | 原件／SHA-256 | 局部模块 | 来源绑定 Check | 本轮合成 D2/Pi Run | 结果 |
|---|---|---:|---:|---|---|
| I 学籍身份更正 v1.7 | `g01_student_identity_complete_template_v1.7.md` · `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329` | 23 | 62（A′ v2） | **60 Check / 2 Subject**，schema2 | **PARTIAL** |
| A 档案利用 v1.5 | `g01_archive_utilization_template_editor_spec_v1_5.md` · `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785` | 15 | 146 | **267 Check / 2 Subject**，schema3 | **PARTIAL** |
| C 特殊校园卡 v1.4 | `special_campus_card_template_v1.4.md` · `fa409cfa30ad0f0c624784f9beab4799cc1e31bbcf3d118c0e41a67deba8937f` | 14 | 86 | **161 Check / 2 Subject**，schema3 | **PARTIAL** |
| S 专项证明与用印 v1.4 | `G01_special_proof_seal_review_template_v1.4.md` · `bb9b11b7963e0cd7661afe12bb3a23eec1655153de2d122ffb59b26f10190c15` | 10 | 92 | **163 Check / 2 Subject**，schema3 | **PARTIAL** |
| P 政审材料程序 v0.3 | `G01_political_review_template_v0.3.md` · `542e73ddc26e861e1bc1d454841dc6096299f1a991e944f59a487d84d97304ec` | 15 | 150 | **269 Check / 2 Subject**，schema3 | **PARTIAL** |

**合计：5/5 作者态已生成，77 个本地模块，536 条实例来源绑定；5/5 本轮 D1 validate、D3 冻结携包 export/import、D2 计划生成及受控技术建案、Pi 服务 submit/verify 成功；本轮所选合成场景共形成 920 个 Check / 10 个 Subject。** 这些数量表示程序检查映射和 pending 回执，**绝不表示 920 项业务判断“已通过”或原文语义已获独立 Gold 签署**。

机器可读证据入口：`runtime-evidence/summary.json`。每套 `runtime-evidence/{I|A|C|S|P}/` 包含 `actual-plan.json`（RuleSpec、mapping、Subject、来源、指纹）、`authoring-and-transfer.json`、`pi-run.json`、`pi-receipt.json`。这些文件是 GitHub Actions 真正运行后写回的实际 JSON，不是示意结构。

## 2. 每套目录与可编辑/可复现资产

- **I**：`I/workspace/workspace.json`、`I/source-catalog.json`、`I/coverage/ledger-85.json`、`I/fixtures/selections.json`、`I/fixtures/controlled-registry.json`、`I/manifest.json`；逐项差分沿用 **A′ PR #84 @ 38277ce925347284d03347cef85ee59c6f30ec26**，不覆盖历史 A/Gold。
- **A/C/S/P**：各含 `workspace.json`（真实 `ReviewAuthoringWorkspaceV1`）、`source-catalog.json`、`coverage-ledger.json`、`selection.json`、`synthetic-case.json`、`manifest.json`、`README.md`。来源 Check 记录原件路径和行号；规则表、字段/材料表、分支与叙述性约束的正文都进入语义模块，不只保存 R 编号。
- 所有新增 A/C/S/P 模块均 **workspace-local** 并有固定 `moduleId/version`；未冒充正式共享冻结模块。**B01/B02 暂不引用**：R0 冻结资产是受控合成的局部示例，直接继承其签署／代理／事实效力会混淆不同业务。未来证明真正语义等价后再显式 reuse＋重验。
- 四套新模板使用 COMMON `generic-object` 稳定 objectKey、subjectId、businessType、逐对象 scenarioSource 和完整 conditions 三值声明。各自双目标选择特意包含一个 **unknown**，以及另一对象已确认适用状态；跨对象证据、失效文档版本和不允许的确定性状态按现有门禁验证。
- I 使用既有 R1 `student-field` schema2 和 `studentScope`，不是错误地把两项更正合并成普通 case Check；13 场景候选仍需额外业务反例全面复测。

## 3. 真实测试与失败记录

以 `.github/workflows/review-d4-g01.yml` 为可复跑入口；工作流严格要求 COMMON SHA 是 Git 祖先，Bun 1.4.0 frozen-install，运行全仓 `bun run typecheck` / `bun run check:boundaries`，然后运行 `bun apps/electron/scripts/review-d4-g01-build.ts`。脚本使用隔离 `PROFER_CONFIG_DIR`、合成材料注册、当前文档版本及同 Subject 审核员确认的 `EvidenceLink`；以现有服务 `preparePiReviewRunV2 → submitPiReviewResultV2 → verifyD2PiRun` 验证。

**成功 Actions：[#39051330755](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051330755)**，对应技术制作脚本及将证据提交回仓的 workflow steps 全部 SUCCESS。本轮早期真实红灯也保留：无效 workflow 环境上下文导致无 job、浅克隆导致祖先检查无法完成、整案 Check 错传空 Subject、证据提交碰上分支并发、CI 工作树未清洁无法 rebase。分别通过本 PR 中的工作流/测试脚本修订解决；**不修改公共引擎或原始业务规则来追求绿色**。

该 Pi 是**真实本地技术服务接口处理合成 pending 回执**，`onlineModelRun=false`；状态统一 `awaiting-confirmation`。对于 A/C/S/P 双对象，至少一个正向“对象 A 的当前版材料证据链接可识别”及反例“对象 B 不得借 A 链接”“旧版不得复用”“未知不能确定通过”受到实际 D2 门禁校验。不能将 pending-only 的 `verifyD2PiRun.complete=true` 写成资料已符合学校标准。

## 4. 模板级状态（严格区分技术链和业务完整性）

本轮 **5 套均为 PARTIAL，而非 BLOCKED_INPUT、NOT_RUN 或全量 READY_FOR_INTEGRATION**。五套全部完成了模块/候选 Plan/Pi 技术路径；但并没有对原文所有可能分支做独立覆盖验证，未提供真实校方身份、资料权限和签章事件，未做隐藏 Gold/在线模型准确性检查。统一集成负责人可以接入技术候选并继续定向测试，不得发布正式学校审批模板。

- **I｜PARTIAL**：13 个业务场景有作者态，COMMON 仅用 S01/S02/S07 的双字段样本；原 B r02 28 案 Gold 正式交叉测试仍没有执行。学籍/招生主管底账、材料法定效力及 P0–P7 部门事件需有权接口。
- **A｜PARTIAL**：R01–R42、50 字段及额外说明有作者态/来源；本轮实例只覆盖部分档案操作。档案出具 R24 不可冒充普通复制；馆藏开放、保密批准、原件实际交付需馆方确认；跨操作/同类多操作须继续业务反例。
- **C｜PARTIAL**：C01–C10／F01–F08／T01–T09 明确进入作者态，两个主卡种都在技术 Plan；退休/已故/三方派遣及亲缘证据的真实合法性不由“关联文本匹配”自动确定。
- **S｜PARTIAL**：SP-01–SP-29、四类业务动作和材料表已制作；仅示范其中两个动作及一个未知条件，**批准稿版本×章种×份数×监印执行状态**仍缺真实受控审批和精确门禁，语义文书比对可先做但不能代批。
- **P｜PARTIAL**：R001–R036、F001–F059、B01–B22 与其他流程文字已入模块；出具/接收合成对象已运行。真实组织意见签章、纸件收讫/验签、接收方届别制度不可信时，只能待核；**政治实质评价永久 HUMAN_ONLY**。

## 5. 交接缺口与下一步

结构化问题目录：`issues.json`，按 **ENGINE / AUTHORING / SOURCE / POLICY / EXTERNAL / TEST** 归类，附受影响模板、原文 ID 与最小关闭条件。SOURCE 原始业务文件已归档、无 BLOCKED_INPUT；SOURCE 方面剩下的是具体 2026 校方政策现行性而非仓库业务原件。

独立集成建议按 **先用本 PR 真实 Plan/Rule/Check 与原文源目录逐条核对 → 再覆盖未跑的关键业务组合和非编号不变量 → 才测试在线模型/金标 → 校方制度/部门权限独立治理** 的顺序处理。禁止因全部 Pi pending 检查有回执就给 D5/正式校内上线签署 PASS。

> 固定签署：G01 **FIVE_AUTHORING_PACKAGES_BUILT; FIVE_SYNTHETIC_D2_PI_RUNS_PASS; FULL_SEMANTIC_AND_AUTHORITY_INTEGRATION_PARTIAL**。
