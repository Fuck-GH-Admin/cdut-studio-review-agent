# CDUT Studio D4｜W1 后续工程接手与总进度（2026-10-19）

> **正式交接状态**：W1 是完整的产品功能批次，不等于“一次对话”，也不等于仅做一个最小闭环。坚持**一组较大功能连续开发 → 持续工程正反回归 → 功能收齐后集中独立 GUI 验收**。不因时间紧张缩减原产品要求、校正规则、安全门禁或最终验收范围。
>
> 本文依据实际远端 PR #129、代码、W1 台账及最后 CI 回执整理。请下个 Agent 首先刷新 HEAD 与 CI；如果后续有新提交，**本文 SHA 是接手快照，不是可替代最新实际状态的断言**。

## 1. 仓库、基线、唯一开发入口

- 仓库： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- D4 W1 Draft PR： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/129
- 开发分支： `feat/d4-w1-intake-assignment-and-routing-r01`
- **本次交接前最后已验证生产 HEAD**：`a095e8aad606c5132af5569365f7a4312abb1e00`
- 固定父 PR #126：`412e1520b22591818463dff3e6658cfa09fe124d`；其上游产品 C10 生命周期修复 PR #124：`fc5100b339d1f097aea4ee60bd2d912276bf8429`；D4 P1/P2 PR #120：`026cfe0f4905bf10f46291bdd7451788c60df5f9`。
- 历史 C10 独立 GUI PR #128 的结论是 **`C10_R03_BLOCKED_INPUT`**，非通过也非明确产品失败。不得篡改旧证据，也不得以本次 CI 全绿自动改成 GUI PASS。
- P06 后台 owner / IPC / Pi / E06 属独立工作链，不能用 D4 CI 代替 P06 验收、不能擅自混并其代码。
- PR #129 持续保持 **Draft / candidate-held / NO MERGE**。新 Agent 延续此 PR 或在明确说明需要隔离的情况下另开其子 PR，不得未经独立验收合并 main。

## 2. 已有可验证工程成果（截至 `a095e8a`）

**最新固定代码 SHA 的 CI 全部通过**：
- PR CI： https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251463 ；**3793 pass / 6 skip / 0 fail、441 个测试文件**，TypeScript 类型、模块边界、Main/Preload/Renderer 构建通过。
- D4 八领域统一：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251528
- D4 COMMON：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251451
- D2 Scoped Pi：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251459
- D3-R1：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251457
- D3 MD：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251473
- Review Baseline：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39164251458

**产品已实现但尚未做 W1 综合实机验收的功能**：

1. 新建 D4 案卷逐文件区分 application/evidence，原生系统文件选择/ZIP/递归文件夹，Main 限额、ZIP Slip/符号链接/文件格式拒止；批次同字节 SHA-256 去重、文件名保留、未导入逐项清单须人工同意。
2. 保守候选模板路由，完整名称提示、歧义/多事项拒止、人工决定主场景与所有三态 unknown 条件；批量建立独立 D2 Subject（每次 20、案卷总 100），无自动校方规则授权。
3. 已建案后的 batch assess → skip/append/replace：所有选择来自 Main-owned token；角色、sender、案卷 revision、冲突目标、同名/同 SHA 验证。新解析成功才归档旧件，保留原件和版本历史；记录来源 `d4IntakeOrigins` 与历史异常 `d4IntakeWarnings`。
4. D4 Subject 层能显示候选事实，选择有效来源与原文块、人工确认/更正、Typed FieldValue（数值/日期/布尔/枚举/多值）、跨对象责任字段守卫、来源点击定位；复用 V2 `CorrectObservation`、`SourceRef`、`EvidenceLink`，精度不足为 file-level，绝不伪造坐标或自动确认事实。
5. 本次**最新**增量：`review-d4-document-retry.ts` 与 `D4RetryDocumentButton`。重试在案卷自己的 `source-docs` 内解析 Main 留存原件，核对 size/sha256/路径、旧 revision 和 per-case BUSY。新的可审核文本 parsed 才归档旧件；依旧 partial、图片只有视觉待审或解析失败，则归档尝试版本、保留当前原件；把尝试与失败写入来源/警告历史。不能把重试当 OCR/模型核验。
6. 本次**最新**增量：`stageD4DroppedBytes` + typed IPC / preload + `D4CaseBatchControls` 真正接收用户拖拽的 `File.arrayBuffer()` 字节。Renderer **不提交路径**，Main 限 16 份/每份 10 MB/总 40 MB，统一走 Main ZIP/文件类型/去重/route/token、用户确认冲突。D4 旧路径直导拖拽隐藏；其他非 D4 旧流程未擅自修改。

对应单测与真实 D2/Main 回归请在代码里查看：
`review-d4-client-intake-roles.test.ts`、
`review-d4-batch-staging.test.ts`、
`review-d4-case-batch.test.ts`、
`review-d4-document-retry.test.ts`、
`w1-fact-source.test.ts`、
`w1-fact-value.test.ts`、
`d4-generic-object-builder.test.ts` 等。

**本轮实际 CI PASS 只说明自动化测试通过**，不说明打包后的 Electron 真正文件拖放、平台兼容、模型能力或学校业务规范已被验证。那 6 个 skip 不算 PASS。

## 3. 重要代码入口与安全边界

| 范围 | 代码入口 | 不得破坏的行为 |
|---|---|---|
| Native/Main 暂存 | `apps/electron/src/main/lib/review/review-d4-intake.ts` 与 `review-d4-batch-staging.ts` | OS 授权选择/文件字节、owner-bound 一次性 token、受限 ZIP/目录、异常隔离、真实 SHA |
| Main 建案/追加 | `review-d4-client.ts`、`review-d4-case-batch.ts`、`case-import.ts` | D2 compile/plan 不可变、role/subject 分离、替换先收后归档、重复预检 |
| Main 定向重试 | `review-d4-document-retry.ts` | 案卷内原件校验、不接受 Renderer 路径、hash、旧 revision、失败不撤旧件 |
| IPC / Preload / shared | `review-ipc.ts`、`apps/electron/src/preload/index.ts`、`packages/shared/src/types/review.ts` | typed 参数＋真实 Main sender/frame 校验，不信任 Renderer 输入 |
| UI | `D4IntakePicker.tsx`、`D4CaseBatchControls.tsx`、`D4RetryDocumentButton.tsx`、`CenterPanel.tsx` | 切案/关闭清理旧 token；审批冲突/跳过/无来源明确可见 |
| 事实核对 | `w1-fact-source.ts`、`w1-fact-value.ts`、`use-review-workspace-actions.ts` | 本 Subject 字段范围、有效 SourceRef、按 V2 Command + receipt |
| V1/V2 持久化 | `case-store.ts`、`case-store-v2.ts`、`workspace-service-v2.ts` | 旧文件归档、原件指纹、原来的 V2 人工确认与 EvidenceLink 不丢 |

特别注意：`importDocumentFromPath` 在原代码就不是一个覆盖整个“导入→解析→投影→失败记录”的单一数据库事务；不要把完整 CI 或局部文件落盘等同于事务级一致性保证。所有重试、替换需考虑失败后仍存在两个版本、引用已变化和再次启动后的恢复表现。

## 4. W1 尚未完成（下个会话继续做实际产品代码，不止补文档）

**R1：先接收本轮最新功能并独立审核**。先检查最后 CI、`review-d4-document-retry` 与 byte drop；补诊断遗漏：失败后重试/重新选择、并发 revision 漂移、owner token 生命周期、超大 IPC payload、无效 ZIP、源内容与版本引用不一致、修改/归档后的 EvidenceLink 失效、重启后的永久警告。确认没有 S0（跨案、权限越界、原件丢失、伪确认）后继续做功能，不要求每个小修都跑独立 GUI。

**R2：做一组较大的体验与可靠性开发**：
- **完整批次进度与异常恢复**：建案前/后文件导入的成功、跳过、解析失败、重试、取消、二次提交状态统一可见；不可显示“导入成功”而隐藏 partial；明确重启/中断后的继续操作方式。对真实“同名/同 hash/旧版归档失败”给出可执行解决操作，不只是永久 warning；避免静默丢材料。
- **跨格式真实预览/对象归属/人工纠错**：复用现有 PDF、DOCX、表格、图片以及 `SourceBlockView`、`SourceRef`、V2 文档块与已有预览，不创建第二解析/第二证据系统。逐格式核对文本/图片/表格、页/段/单元格锚点与退化精度；让候选事实绑定到明确 Subject，人工核准前维持 unknown。
- **业务友好表单与关联**：把 frozen author template/D2 mapping 的字段标签/校验/必填/说明映射到实际输入；对不同 Subject 的条件、事实、EvidenceLink 做可见关联、冲突/缺证提示和人工纠错。G01-I 学籍特殊模型与真实校方资料缺口须独立保留，不造学生主数据底账。
- **材料版本比较与补救**：当前可保留历史，但需要让用户在工作台看到“原材料/新版本/归档或失败原因/当前是否有仍生效引用”，至少能从失败条目回到相应文件并进行安全补救。保留审计可追溯性。

**R3：工程集中回归并准备 W1 一次性独立 GUI 验收**：完成上述开发后再冻结 W1 candidate SHA；针对最终 HEAD 跑 Main/Renderer/Preload + D2/D3/COMMON/G01–G08 回归，组织独立 Electron/Xvfb + 本地 Agent 一次性端到端业务验收。不得把 W1 拆成十几个需要频繁重复操作的本机验证轮次。

## 5. W1 集中验收范围（尚未执行）

采用隔离的真实 Electron 桌面环境与**合成**样本，跨 Windows/Linux 适配时尤其验收真实 `File` drag event/Uint8Array 转交、文件夹 picker、ZIP 深层路径、重复文件、无效内容、超过上传限额、延迟 native dialog 结束后切案，以及普通关闭与被打断的 Main/Renderer 交互。

走完整产品链：选择真实模板 → 20 秒候选/手动确认/多事项拒绝 → 多 Subject/unknown → 建案前角色分配 → ZIP/文件夹/拖放 → 建案后追加/同名替换 → 失败/partial 文件重试 → 原文预览与候选事实 → 一份材料归多个对象时**逐条确认** EvidenceLink → 最终修订/来源存证 → 重启读取 → 案卷数据/来源版本/哈希/收据一致。C10 风险在此验收窗口定向复核并如实保留旧 R03 结果。

证据必须包括事件链、真实 GUI 截图、IPC/Main 相关日志（不含敏感内容）、修订与 token/文件 hash、案例输入与预期结果、正反断言、FAIL/WAIVED/BLOCKED 实际判定；防止测试输入与结果由同一 Agent 编造。对 P06 兼容与 online Provider 应另有独立门禁，不凭 D4 CI 签署。

## 6. 规范与边界阅读顺序

1. 本交接文档；`W1-NEXT-AGENT-EXECUTION-20261019.md`（本文件旁）；既有 `W1-FUNCTIONAL-DEVELOPMENT-AND-BATCH-ACCEPTANCE-20261019.md`。
2. `docs/design/review-agent/02-product-and-templates.md`、`04-acceptance-and-evaluation.md`、`05-completion-roadmap-and-feasibility.md`；原 A/C/S 验收条款依旧生效。
3. #129 diff + Main/IPC/preload/Renderer + 对应正反测试；#120/#124/#126/#128 历史差异和冻结边界。
4. 如有并发提交，先检查远端与最近 CI，避免覆盖其他会话。仅在必要范围修复；保留事实、作者模板和 Gold。

## 7. 状态字典和明确交付标准

- `W1_DEVELOPMENT_IN_PROGRESS`：当前。
- `W1_CODE_CI_PASS_AT_a095e8a`：真实工程回归通过（最后生产代码快照）。
- `W1_ELECTRON_GUI_NOT_RUN`：不能填 PASS。
- `C10_R03_BLOCKED_INPUT`：历史事实，不随本项目修复自愈。
- `MODEL_LIVE_NOT_RUN` / `P06_NOT_RUN` / `SCHOOL_POLICY_UNVERIFIED`：不得以此 PR 代签。
- **合并/发布：BLOCKED**，直至 W1 完工、独立 GUI 和相关外部门禁满足并有明确签署。

交接成功的标志不是写出更漂亮的任务列表，而是下个会话能从这两个文档直接定位代码、继续产出真实可用的产品能力、提交回归并记录缺口，同时不把 W1 规模缩水。
