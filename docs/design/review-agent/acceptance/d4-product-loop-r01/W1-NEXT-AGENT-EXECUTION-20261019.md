# CDUT Studio D4｜W1 下一会话工程执行任务书（2026-10-19）

> **供下一位开发 Agent 直接执行。不是让 Agent 再写开发计划，也不是要求把 W1 缩成三个“最小闭环”会话。** 任务是继续完成完整 W1 的剩余产品能力，允许跨会话连续推进，每一轮做一组有价值的真实开发，工程回归随开发运行，统一实机验收安排在 W1 功能收齐后。

## A. 身份与唯一目标

你是 CDUT Studio D4 审核模块 W1 产品开发 Agent。仓库：
https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

现有 Draft PR：
https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/129

开发分支：
`feat/d4-w1-intake-assignment-and-routing-r01`

本轮目标是 **实际把剩余 W1 的材料补救、用户可见批次状态、跨格式原件复核与真正业务字段/Subject 证据归属做出来**，包括生产代码、UI 接线、Main/D2/V2 集成测试、正反回归、修复、GitHub 提交及证据与更新台账。不可只生成文档后宣布完成。

上一 Agent 的最后已验证**代码快照**：
`a095e8aad606c5132af5569365f7a4312abb1e00`；
其 PR CI #39164251463：3793 PASS、6 SKIP、0 FAIL；六条 scoped workflow 全部 SUCCESS。**正式交接文档提交使分支 HEAD 前移；新会话必须先实时核对最新远端 SHA 和最新 CI。**

## B. 必做前置（首先执行、不可略过）

完整阅读，按先后顺序：
1. `docs/design/review-agent/acceptance/d4-product-loop-r01/W1-SESSION-HANDOFF-20261019.md`（冻结上下文/实际进度）
2. `docs/design/review-agent/acceptance/d4-product-loop-r01/W1-FUNCTIONAL-DEVELOPMENT-AND-BATCH-ACCEPTANCE-20261019.md`（功能台账及集中验收范围）
3. 本执行任务书
4. `docs/design/review-agent/02-product-and-templates.md`、`04-acceptance-and-evaluation.md`、`05-completion-roadmap-and-feasibility.md`（原设计与验收权威）
5. PR #129 的当前 HEAD、diff、最新提交与 CI；对照 #126 固定父 SHA；参考 #124 C10 生命周期修复及 #128 `C10_R03_BLOCKED_INPUT`。

核验工程的实际已有能力，**不要因为不熟悉代码而复制已有实现**：
- `review-d4-intake.ts` / `review-d4-batch-staging.ts` / `review-d4-case-batch.ts` / `review-d4-document-retry.ts` / `case-import.ts`
- `review-ipc.ts`、Preload `index.ts`、`packages/shared/src/types/review.ts`
- `D4IntakePicker.tsx`、`D4CaseBatchControls.tsx`、`D4RetryDocumentButton.tsx`、`CenterPanel.tsx`、`ReviewMaterialControls.tsx`
- `w1-fact-source.ts`、`w1-fact-value.ts`、`use-review-workspace-actions.ts`、`workspace-service-v2.ts`、`SourceBlockView.tsx`、`document-preview-path.ts`
- 既有 `review-d4-document-retry.test.ts` / `review-d4-case-batch.test.ts` / `w1-fact-source.test.ts` 等。

若仓库当前已有与任务相当的增量（可能来自并发 Agent），先对齐，勿冲掉已提交内容。按既有边界补完缺口。

## C. 这轮须完成的实质工程工作（优先级顺序）

### C1. 对最新拖放/解析重试做一次定向代码核验，发现安全问题立即修

关注：
- 真正经 File.arrayBuffer() 到 IPC 的明文字节，在 Main 严格限制 16 份/10MB 单份/40MB 总；没有通过 `getPathForFile` 或 Renderer 自报本地路径偷渡；ZIP 扩展后仍遵守 100 份/50MB/100MB、目录层级与 skip ledger。
- Main token 的 owner/sender/过期/复用，异步文件选择返回后换案/关闭，重复提交，离线重试和失败后的资源回收。
- 重试只找自己案卷下保存的原件且 SHA/大小复核；新的 parsed **且存在可审核文字**且版本未出现并发变化后才允许归档旧件；partial/failed/image-only 不得撤下旧件。异常中断/同名并发时两个版本均有明确提示，不能覆盖真实证据。
- 历史来源/Warning 是不可抵赖的审计信息，但不能误把旧失败列表显示成目前仍缺材料。
- Main、Renderer 状态区分：准备中、解析中、已收录、部分解析、解析失败、重复跳过、修订成功、修订冲突/需人工处理。
- 所有安全修复必须有失败复现、正反回归和准确前后差异。

不要求此时跑独立 Electron GUI；这些问题先做确定性 Main + UI 单测。若发现 S0 原件破坏/跨案/越权，必须当轮收口，不能作为普通“集中验收后再说”。

### C2. 实现可实际使用的批量状态、修订历史、失败补救与中断后恢复

把 `D4CaseBatchControls` / `D4RetryDocumentButton` / `CenterPanel` 做成完整的审阅体验：
- 每个导入材料或 archive 内文件清楚显示原始来源、拟操作、相同 hash/同名冲突、已处理/失败/部分解析、实际修订关系、是否仍 active；有必要的历史查看和可操作恢复入口。
- 增加流式进度或至少准确的逐文件阶段与完成情况；取消/切案/窗口关闭/IPC 错误都要阻止“旧案结果写进当前视图”，并在下次打开案卷后能看见真实持久状态。Main 已执行的操作不得被 UI 误显示“全部取消”。
- 失败记录应支持审核人针对有效原件执行安全重试；解析失败和重复同名应有可复核的理由，不能简单 toast 成功。不可自动抹除永久警告。
- 尽量复用原 `ReviewImportProgressEvent` 通道或现成 Main 处理函数。新增任何状态/IPC 必须保留 owner 校验、合同精确类型、正反例；不得创建第二套完全独立的存储逻辑。
- 对非原子多步更新明确提供恢复/对账能力（哪些材料仍 active、哪些已归档、哪些缺少证据），不假设所有导入都是事务成功。

### C3. 连通跨格式原件核对、候选事实及各 Subject 实际证据归属

- 先调查已经支持的 PDF、DOCX、Office/XLSX、图片及未解析格式，确认渲染、只读预览、document blocks、真实 `SourceRef` 的页/段/单元格与降级精度，**只补缺失部分**。
- 由材料导出的是**候选**事实/事项，必须按原 D2 模板和已创建的 Subject 作用域推荐；名称、纯文本片段、模型输出不能自动赋权或自动将三态 unknown 改为 true。
- 审核人需能看到原文与事实并排复核、手动修正字段值和来源，发现错误对象归属可以纠正；同一证明用于多个对象时必须逐对象确认 EvidenceLink、每条都可追踪。废弃、旧版或未解析的 SourceRef 不得继续当有效证据。
- 沿用 V2 `CorrectObservation`、`SetEvidenceLink` 等 Command 与 SourceRef，保留 expectedRevision/actor/receipt。拒绝跨案、跨 Subject、错版本、错误位置；无法定位的标记 file-level 及待确认，不伪造页码/坐标。
- 人工核对后仍不能认为已经执行真实 Provider 业务审查；不能填报校方已认可。

### C4. 真实作者态模板的业务字段 UI

- 根据冻结作者模板中已有字段说明、类型、校验、条件，映射成审核员可理解的中文表单，保留 author key 的追溯。缺作者描述时明确暴露 key 与不确定性，不应静默套综测业务语义。
- 多 Subject 分离，条件 unknown 默认不变；来源与事实范围精确绑定到 Subject。不得新增臆测的学生主字段、校发规范或业务权限。
- G01-I 的学籍 student-field 和来源依赖维持特殊通道和既有阻断条件。
- 必须有跨模板、同案多对象、混合事项和无有效来源的拒绝/人工接管正反测试。

## D. 质量、CI 与证据

每个开发增量至少执行可复现的针对性单测及 typecheck；当本轮一个较大功能组完成，跑完整 PR CI、D2、D3、COMMON、D4 统一 G01–G08 和基础回归；记录 **最终代码 HEAD 的实际运行 ID、通过/跳过/失败数**。如果 CI 失败，追踪并修实质问题，不删测试或松断言凑绿。

重点正反用例：文件夹/ZIP/用户拖放、损坏格式/zip-slip/大小炸弹、重复 hash、同名版本、token replay/跨 sender、案卷切换/迟到选择、failed/partial retry、无可审核文字、原件同尺寸篡改、parser 错误/后台取消、V1/V2 源版本同步、冻结 D2 Plan 不变、事实与 EvidenceLink 不串案、保存后重启来源位置不变。

不把“工程测试通过”写成“产品 GUI 已验收”。**完成 W1 全功能开发以后**，另写集中本机 GUI 任务书，安排一次覆盖完整场景的独立测试（包含 C10 差分复核）；对模型 Provider 语义和 P06 后台 E06 另按独立门禁签字。

## E. 禁止事项和状态准确性

- 不编辑正式校方材料、作者冻结 Gold、旧 PR #128 的证据，不用合成学生数据冒充真实系统接口。
- 不合并 main、不发布 W1、不把 #129 从 Draft 擅自转换成正式交付。
- 不把证据材料自动抬升为政策权威、不把 filename 自动抬升为 Subject fact，不确认未经核验的 EvidenceLink。
- 不用 Renderer 传本地绝对路径为生产授权；不把测试 CLI/开发版特殊通道打到 packaged 产品。
- 不把当前 3793 PASS/6 SKIP 的结论偷换成下一份未测 HEAD 的结果；C10 #128 始终 `BLOCKED_INPUT`，除非新的独立证据正式裁决。
- 不牺牲质量以减少会话数、不用重复空洞的“最小闭环”代替真实开发。

## F. 本会话需要实际产出

1. 最终 HEAD（及父 SHA）与变更范围；真实生产代码/UI/合同/测试并提交到 PR #129 分支。
2. 逐文件/功能说明，运行的测试命令和可验证 CI，实际发现与修复的问题及保留的未解决缺口。
3. W1 主台账与本任务书/必要的交接更新；任何未完成能力标 **OPEN** 而非 PASS。
4. 如果上下文耗尽，在当前分支写新接手文档并给用户一份可复制的后续提示词。
5. **本轮尚不必执行独立集中 GUI 验收**。若功能尚未开发完，继续下一实际工程增量，不把“写好 GUI 提示词”作为整个 W1 完成的替代。

**开始动作**：先核对远端 HEAD + CI + 三份规范 + W1 两份交接资料，接着从 C1 到 C2/C3/C4 开展真实代码和测试。遇到真实冲突安全问题优先修；除此之外，保持较大的功能批次和一次集中验收的效率策略。
