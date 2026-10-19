# 08｜向第二轮 2D 集成审查、第三轮 V3 选型的正式交接

## 一、证据基线与范围

本轮专责 TPL-01..09、IN-01..07、DOC-01..04、EXP-02/03/04、RET-01/03；交叉 CASE-03/04/05/06、RUN-01/02、BG-03。沿用 #134 的**32 个独立能力 ID**，逐项源文件/SHA/现有行为/缺口/证据层次/依赖/处置候选见 `07-capability-disposition.csv`。其他并行的 2A/2C 不在本轮代做审查。

固定基线：main `8989941b6fb5651564e32d11c4215b6a6d5a5209`、D0.5 `5709c562696a7560aba092afc86c0af83cc5cd2c`、D1 `f05c17e1f620f3f3fcaddeb5c9b36c7492f30d2e`、D2 `56fa52a5173dfd5acd75af52f63d821ed9d5cf47`、D3 `4b191c729f3d5f8135c73b87c17642023f6c3986`、COMMON `a7a6a11d4840ad64cfc858c17b35f35180adf063`、50候选 `b68443b23293b4714e61a3b81383d3d3a56434fc`、D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`、P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`、PR #134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`。已再次读取各 PR 元数据：#88/#97/#110/#129/#132/#133/#134 HEAD 均与以上快照一致，main HEAD 仍同固定 SHA；未观察到这些输入的 SHA 漂移。此为**本轮读取时**结果，后续远端变更重新取证。

项目第一轮 [PR #133](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/133)、第1.5轮 [PR #134](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/134) 均保持 Draft。#133 的 190 分支/128 PR 固定快照并不等于本轮实时数量。两轮 #133/#134 的独立 Git 树/测试限定未被悄然升级为 PASS。本轮没有合并或删除任何历史分支。

## 二、应继承的真实资产

1. **模板作者权威底座**：D1 workspace 与 sourceBindings、作者版本记录、拒绝未映射语义；D3 module frozen digest、依赖树/循环、签收删除 Check 的升级差异；D2 frozen Plan 与 fingerprint。移植时保留历史机制及独立单测，不照搬技术预审进入正式审批的权威。
2. **多对象/多分支**：COMMON 为 Subject/Check 单实例扩展与条件三值，为未确认 primary/来源拒绝；D3 Archive 动态 item-operation prototype 和 exact source binding 各有技术价值。复杂跨对象关系缺失必须明示并阻断，不能丢规则。
3. **原件与输入**：W1 的 Native picker/drag byte staging、临时 token+owner、ZIP path/symlink/size/hash 检查、多任务拒止、逐文件角色、批量导入 checkpoint/retry/archive；P06/Main 的文档坐标、Office71 多物理源分离、SourceRef 正式引用验证、只读 Pi 工具与阅读覆盖。
4. **可保留的实验/负例**：单 Agent Docling 按需结构解析与扫描视觉、MD-Q1 独立原文责任漏项；测试失败也作为 V3 防回归资产。不要因为 50 模块化 candidate 或一次扫描字段 5/5 就认定校方现行政策和模型真准确率。

## 三、2D 必须裁定的架构冲突（按优先级）

| 优先级 | 冲突 | 2D 必须给出的可验交付合同 | 需要 2A/2C 配合 |
| --- | --- | --- | --- |
| P0 | D4 legacy ReviewCase 及表单/材料 vs V2 CaseAggregate 单案事务 | 一张唯一业务写权入口表；`CaseCreate` + `PlanInstall` + `MaterialImport` 在断电/部分失败时的恢复方案，不能出现第二套事实数据库 | 2A 查状态/事务及迁移；2C 查 Main IPC 权限 |
| P0 | D1 作者字段/来源 vs D2 Plan/COMMON vs W1 ReviewerForm 与 V2 FieldValue | 有版本、objectType/Subject ID、`obligation → mapping/Check → source → form fact` 的适配合同；未知与来源 gate 不丢 | 2A 汇总 V2 Subject/Observation |
| P0 | 原件版次/Office `fileId` vs V2 `SourceRef`，材料替换后旧结论 | `DocumentVersion+parseRevision+blockId+location` 唯一引用身份与跨格式坐标等级；材料变更触发 Observation/EvidenceLink/Run/Outcome invalidation | 2A 看证据和结论事务；2C 看文件工具及过期 Run |
| P0 | 候选资产形式完整 vs 校内业务完整与发布权威 | 定义 `candidate-held → independently reviewed → policy-authorized → published` 的独立事件/签署门禁。不得以合成 50/50 候选替代 | 2A/2D 制定审批与用户工作台 |
| P1 | G07 22 BR 中部分仅语义、G04 材料/阶段 gate 非全部机器表达 | 一个列出原文独立义务、所需Check/Subject/gate、未映射缺口和人工路线的 `CoverageContract`；不能自动补造校规字段 | 2D 模板语义审核工作流 |
| P1 | D4 import batch vs P06 execution batch、Run/owner/provenance | 明确两种批次类型/状态/幂等键/RunID；共享同一案卷ID但不得把“材料已导入”判“审核已执行” | 2C/P06 侧 |
| P1 | 旧 D0.5 demo/两类 SIGNALS 路由 | 继承 UI 经验与 fail-closed，退役演示状态机和硬编码路由的“通用产品化” | 2A/2D 产品决策 |

**直接建议**：先冻结 *接口与可回归不变量*，不要先把全部 D4 W1 或 P06 版本强推覆盖另一侧的 `review-ipc.ts`。#133 已证明两线 diverged，项目存在三份同名源码 blob 和独立变更。

## 四、第三轮必须实际跑通的验收

1. **第 51 套从零业务模板**（陌生审核目的）：有权来源原文 → 独立职责 catalog → 用户通过无代码编辑完整对象/字段/条件/模块、预览、修正、复制、冻结、导出、回退 → 独立 Gold/业务审查；不能拿 D1 JSON CLI 当作最终 UI。
2. **50 套现有候选建立分类总账**：50个 catalog 项目均 `candidate-held`、`integrationStatus=NOT_RUN`，G03 10个 `GENERATED_NOT_RUN`，G07-T01 BR-13..22 语义未结构化，G04-T01 材料/阶段语义不全；逐模板源义务 coverage ledger 后才能确定哪套“完整”，不使用受限 Gold。
3. **100 份 Native picker/文件夹+ZIP**、多窗口 token、损坏件、symlink/zip-slip/hash、不一致修订、选择同名替换和旧证据失效，必须记录真实原件 hash、Main receipt、案卷版次、第一次失败原因；跨平台 GUI 复测。
4. **Office/PDF/Excel/图片**：不同源同名不同内容、同文件改版、PDF 页矩形、DOCX 真实段/图片、Excel sheet/cell/公式、扫描视觉无 text 时仍 partial；Office 修复虽然在 P06 历史线存在，W1 完整链尚未实测。
5. **Reviewer 权限/严格工具链**：跨案 documentVersionId/SourceRef、轮次撤销 await 后回执、unknown 条件错误 compliant、模型遗漏一半 Check，必须拒止/未完成；记录真实 Provider/tool event 与 Run 绑定。
6. **发布与业务**：学校正式授权、版本有效性、角色和 external/outbox/SchoolPort 才能给正式可用标签。没有校务签署，技术测试再多也只是 candidate。

最少把 06 的 TB-01..TB-15 作为可执行测试清单，逐项标 `PASS/FAIL/BLOCKED/NOT_RUN`、记录配置和未触碰 Gold 的边界。测试源存在 ≠ 运行通过。

## 五、独有资产差分附录的状态

第一轮已明确八个领域的独立分支与 #97 并非提交级祖先；本轮从 catalog、八域代表 manifest/workspace 核对源路径与 SHA，**未得到可证明的“#133 遗漏独有领域分支”新事实**。当前容器无法 `git clone`，因此未执行完整 `merge-base/git cherry/patch-id` 与 50 个原始分支逐文件 diff；差分结论记 `UNKNOWN_NOT_RUN`，绝不伪造新漏项或回写第一轮账本。2D 如在独立本地工作树证实漏项，应按以下字段生成 **2D 差分附录**：`domain, branch, sourceSHA, blob/path, originalPR, integrationBlob, semanticDelta, evidence, mergeBase/patchId, confidence`。不得静默修改 #133 总账或断言功能缺失。

## 六、工作方式和交付质量

本轮仅通过 GitHub 授权 API 读取固定源文件及提交独立远端 `audit/v3-round2-template-intake-r01` 分支的 **8 个 docs-only 文件**，**并未实际建立本地 Git worktree 或运行测试**（当前容器不可 DNS 解析 github.com）。若 2D 需要本地按 SHA 可复现，只能在它自己的独立可写 worktree 进行，不能与 2A/2C 共用。保留第一轮历史分支和 Gold ACL，不修改生产代码、不发布/合并 PR。详细事实链见 01–06；逐能力机器索引为 07。
