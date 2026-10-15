# 49｜原项目更新后的 P06 重排与基线兼容验收（2026-10-15）

> **状态：设计修订 / PLANNED；未实施新的代码整合或实机验收。** 本文覆盖 [47 号](47-p06-evidence-driven-followup-plan-20261015.md) 中“直接 L02-00 → 01”的**执行前置顺序**，不覆盖其安全原则、历史证据与业务质量目标。27 号仍是后台 v1 架构合同，29 号仍是 LIVE-01～08 唯一状态台账；[46 号](46-p06-recheck-live-local-acceptance-20261014.md) 是上一冻结代码的独立实测证据。**49 不授权合并 PR 或更改外部项目。**

## 1. 冻结版本及真实差异

| 对象 | 冻结提交 | 角色 |
| --- | --- | --- |
| 本仓库 `main` | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | **最新版技术兼容性目标**；已包含上游及截至当时的审核开发成果 |
| 上游原项目 `Nya-Angle/CDUT-Studio` | `c179f2575d5bb5abdc883268fb885d1a6449325e` | **只读来源**；相对共同基线 `f2c7347d` 新增 16 个提交 |
| 我方 `feat/review-owned-background-sessions` | `60e805cfa5b55865add80856f2e9a27f6271de08` | PR #21 当前审核分支，**尚未吸收 `main` 的 Office/预览/提示词更新** |
| 我方 `main` 内容整合提交 | `6ff93be71399683fb21c9b5e36cedce05d1945b8` | 以旧 `main` 为父的受控**文件树整合**；不是含审核所有历史祖先的普通 merge commit |
| `main` 后续修复 | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | 修正上游英文身份提示的单测预期，未声称变更审核执行语义 |
| 上一次 P06 真实 Electron/Pi | `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027` | 46 号的**原已验证源码**，不得自动迁移实测 PASS 到新引擎 |
| 原 47 号规划起点 | `f716d2efaed0dcd8924d5acc30cd3012eb093348` | 实测后第一版优先级与历史记录 |

本仓库 `main` 的正式整合和八个冲突文件逐项取舍，见 **[48 号上游整合报告（main 固定 SHA）](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/48-upstream-cloud-main-integration-20261015.md)**。它保留了双方的功能，但**构建/全仓测试绿灯不等于新组合路径的真实端到端验证**。

`main` 的 [PR CI #38749615086](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38749615086) 实际 **3983 pass / 5 skip / 0 fail，3988 tests / 456 files**；审核分支 `60e805cf` 的 7 条 Actions 成功是**另一个 SHA**，不构成两者融合后的 E2E。主分支首次整合的身份提示单测曾 FAIL（报告48已保留），后修正 PASS，禁止抹去首败。

**重要 Git 语义**：两分支在提交祖先关系上已 `diverged`；`main` 曾将审核分支的**文件内容**受控整合进单个新提交，但保留 PR #21 原始开发提交与 Draft 状态。不要把“`main` 含现有审核代码”误作“PR #21 已合并”。未经重新分析共同祖先、patch 同一性和后续主分支变动，不执行盲目 rebase/merge/cherry-pick、force push 或直接解除 Draft。后续正式代码实施以经过本文件 U0 核准的集成工作树为基线，明确 PR/新分支交付方式由用户决定。

## 2. 会改变验收判词的上游新能力

| 更新区域及可核查实现 | 真实影响 | 现在**不能**推断 |
| --- | --- | --- |
| **Office 解析/数据平面**：`document-parse-tools.ts` 现用 `@profer/core/office-engine`，`OFFICE_INDEX_SCHEMA_VERSION='v2'`；`materializeToWorkspace` 同时落纯净 Markdown 和 `.context/artifacts` 中的带锚索引。普通 Agent 有按需读取、截断及 document evidence 注入 | DOCX/XLSX/PPTX 与变体的结构化页、表格、单元格定位、`fileId/revision`、重建索引、上下文与 token 占用均可能改变。应通过实际输入版本和锚点测试与已有审核 `SourceRef` 对齐 | **不能**因为普通文本有新索引，就认为审核已读取所有规则/原件；双态锚点不天然等价于审核原有 SourceRef 的授权及版本证明 |
| **普通文档工具/提示词**：`pi-builtin-tools.ts` 新的 Kernel Document Engine 说明、`agent-orchestrator.ts` 附件证据/提示构建、`pi-agent-adapter.ts` 的压缩后恢复提示 | 普通 Agent 的文档检索、零 token 数据平面、压缩后的引用/交接可能与旧测试不同；相同 E06 输入不一定产生同样工具轨迹 | 不能把普通 RAG 摘要或泛用 Read 的自动重定向替代严格审核 `review_read_documents`、`review_inspect_original`、覆盖账本和实际提交 |
| **审核五工具权限边界**：最新版 `review-strict-pi-tools.ts` 仍由可信 `binding` 选择案卷工具、`review_inspect_original`、`CompactContext`；Main 主动 `canUseTool` 再鉴权 | 必须专门验证上游新工具发现/文档读取是否仍**无法**穿透审核白名单，且带有效 run/assignment 的同案原件可以正常读 | 编译成功或“普通 Agent 工具变多”不能自动证明严格审核仍安全，亦不能通过借用普通工具实现更宽松准入 |
| **预览与普通会话 UX**：`FilePreviewDialog`、`preview-opener`、会话 listener 改为上游**只读侧栏预览**，旧 Preview Tab IPC/恢复路径部分退役（见48号八文件取舍） | P04 普通 Tab/事件隔离测试、E05 旧页迟到投影及 E06 Office/PDF 预览必须按**新实际入口**取证；普通文件/内部 owner 的读权限仍由 Main 最终把关 | 46 号旧预览 Tab 成功不等于只读侧栏/关闭后状态恢复成功；不能为了让旧测试通过复活被上游移除的 Preview Tab |
| **其他提示词/模型策略及依赖版本**：原项目刷新身份、交互与 prompt 拼装；Electron/shared/core/ui 版本与锁文件均变化（48记录具体版本） | 真实 SDK 工具交互、语言和输入压缩策略可能改变 C 案的 `execution-failed` 归因；应固定 provider/runtime/模板与材料版本后对照 | 旧 C 案的失败不直接等于新 `main` 的代码缺陷；新版本不必然提升业务正确率或解除外部 Relay/Pocket 阻断 |

## 3. 调整后的工作批次与准入

这是对 [47](47-p06-evidence-driven-followup-plan-20261015.md) 的**前置两批新增**，后续 L02-00～04 均保留但改为**受条件约束**的顺序：

| 批次 | 顺序 / 本批唯一输出 | 退出条件 |
| --- | --- | --- |
| **L02-U0：版本整合/影响清单（NEW，最优先）** | 只读比较 `main@8989941b`、PR #21 `60e805cf`、上游 `c179f257`，在隔离工作树建立**候选集成基线**和所有变更的文件/接口映射，明确代码与 PR 后续归属。未经用户明确批准，**不更新 `main` 或重写 PR #21 HEAD**。 | 固定 candidate SHA/tree、Office/Pi/预览/owner/RunStore差分矩阵、可能移除/迁移的 API、依赖与版本差异；在候选树上冻结安装、typecheck、boundaries、构建、全部适用 CI 的真实结果，异常不掩盖。历史 SHA 对应的既有结论保留。 |
| **L02-U1：新解析/预览/工具安全合同（NEW，阻断业务 E2E）** | 使用候选集成基线做**小规模差分验证**：DOCX/XLSX/PPTX/扫描 PDF 输入 hash 与 `Office index v2`、清洁 Markdown/带锚引用映射、旧缓存迁移；严格案卷原件工具和普通 RAG/Read 隔离；新只读侧栏、owner路径阻断、慢返回与文件版本变更。 | 每种高影响入口至少一条真实 Main/IPC 路径及正负例；SourceRef/覆盖不被普通检索或截图替代；权限拒止 fail-closed。若核心共享实现发生改变，重跑受影响的 E05/E03/E04/重启/ENOSPC **定向**子集，不能用旧 46 号 PASS 签新 SHA；结果留退出码、日志哈希。 |
| **L02-00：E06-C 失败归因（47号原第一批，改为第三批）** | **只在 U0/U1 固定的目标代码上**复核 C `execution-failed`；旧 46 号只作历史对照，归类正确拒止/业务未完/执行故障/夹具无效/未知，成本可控地最小复演。 | 不改变 Gold/规则/权限，真实模型与工具回执及来源版本可对账；无法复现旧错时记录 `NOT_REPRODUCED`，不假造修复。 |
| **L02-01：既有 A/B/C 业务闭环** | 在同一已验版本做人工确认/否决、补件回流重审、受限代批正反例、幂等/版本冲突、账本对账。 | 业务正确/正确拒止/技术异常单独计数；不能在后台化 PR 增加新批量产品特性。 |
| **L02-02：模型原件与长上下文闭环** | 新 Office 索引兼容 U1 通过后，完成真实扫描 PDF/PNG、多页 `review_inspect_original`、`CompactContext` 实际恢复、审读覆盖/SourceRef，以及解析失败回退。 | 真正**审核模型**的视觉/工具回执、压缩前后检查点一致，不以预览 canvas 或普通 RAG 代替。 |
| **L02-03：普通 Agent/窗口/平台回归** | 按合法独立渠道验证 Claude、普通 Pi、fork、双窗口、只读侧栏/历史 Tab 恢复、删除案卷、模型停用、Windows/macOS。 | 各平台/工具/入口独立判词；未授权或无设备 `NOT-RUN`，不借用 Linux/Pi 成功冒充。 |
| **L02-04：外部和最终签收** | P05 Relay 双 viewer/ticket 与 Pocket 目标仓补丁条件可**并行协调**，最终按 29 唯一台账收敛 LIVE-01～08。 | 两项外部未通过继续 `BLOCKED/TARGET NOT-RUN`，P04 tombstone/UUID journal无安全证明不得 GC；完整外部证据和用户明确验收以前 MERGE NO-GO。 |

**优先顺序**：`L02-U0 → L02-U1 → L02-00 → L02-01 → L02-02`；L02-03 按合法设备条件前后并行，L02-04 的外部资源准备可提前开始。U1 是兼容性冒烟及边界证据，不替代 L02-02 的完整模型视觉审读；这样既不重复旧 E05 的全量付费测试，也不在错误版本上开发业务。

## 4. 版本与证据的判词规则

1. **三种基线分开**：`46 实机旧源码 PASS`、`main 新静态/CI PASS`、`候选整合集成真机 PASS/FAIL/NOT-RUN` 分别登记，绝不可跨 SHA 承接 E2E。检查 Git ancestry 与文件 hash，避免 PR #21 已被内容整合而重新引入旧解析/预览 API。
2. **新增双重读图边界**：普通 `@profer/core/office-engine` 的 `fileId/revision/anchor` 是可检索数据索引；审核 V2 的 `documentVersionId/SourceRef/runId/assignmentId` 是可提交证据授权，两者必须有明确映射/独立校验。跨案、版本变化、路径越界、权限撤销、新旧缓存混读须有负例。
3. **候选版本覆盖矩阵**：记录差异文件/接口、旧证据适用性、需要跑的定向历史反例、expected/observed、操作主体、退出码、公开脱敏 SHA。必须保留原 37/38/44 首败，旧裸 `store.set` 仍独立归档，不改变旧 Gold。
4. **安全优先**：owner不等于授权，`runAgent`/RunStore变更需检查永久 deny/tombstone、原子写/重启；受控工具新增时禁止自动放宽审核白名单。模型 C 的质量调查不能在未锁定 U0/U1 合同前决定“调 prompt 或换模型”。
5. **历史与 PR 归属**：本增补只写我们的审核 Draft 分支文档，`main@8989941b` 和上游 `Nya-Angle/CDUT-Studio` 都**只读**。未来是否将审核 PR #21 关闭、改基线或以新 PR 推进须由用户批准；现有 PR 保留 Draft，不强推、不合并、不启动 P07/P08。

## 5. 文档依赖与下一步交接

- [27](27-background-review-session-proposal.md)：架构与当前边界，不因新 Office 引擎自行重写。
- [28](28-review-stage-delivery-status.md)：早期产品交付快照，仍含模板/学校身份/解析/部署的长期路线，不用 49 冒称历史已完成。
- [29](29-background-session-preflight-audit.md)：唯一 LIVE-01～08 逐项验收状态，**U0/U1 新建为 PLANNED，不改旧 LIVE 行**。
- [30](30-background-session-handoff.md) 与 [31](31-background-session-continuation-prompts.md)：入口改为 `L02-U0`，禁止从旧 47 的 `L02-00` 提示直接开工。
- [32](32-p05-stage-acceptance-and-local-gates.md)：外部服务状态不变；[46](46-p06-recheck-live-local-acceptance-20261014.md) 与原始 evidence 不修改；[47](47-p06-evidence-driven-followup-plan-20261015.md) 仍保留原来对质量/业务的细则，但执行前置以本 49 为准。
- [48 号](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/48-upstream-cloud-main-integration-20261015.md)：`main` 已完成上游内容整合的历史记录，来自**另一个版本**，不应复制或假设本 PR 分支包含此文件。

**现行唯一下一批：`P06-RECHECK-LIVE-02 / L02-U0`，状态 `PLANNED / NOT-RUN`。** P06-S02 NOT ACCEPTED / P06 PARTIAL / LIVE-07 PARTIAL / PR #21 Draft/Open/MERGE NO-GO；已有 46 号实机 PASS 只对原冻结版本有效，后续改动不能自动承接。
