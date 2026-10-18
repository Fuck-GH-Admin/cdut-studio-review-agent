# D4｜PR #100 后续 P0/P1/P2 与新会话工程交接（2026-10-18）

> 本文件记录已完成的事实、尚未验证的前提和下一步 **D4 负责人**的工作边界。交接性质：docs-only、研究性候选、不代签 P06 或 D4 正式发行。目标是帮助新会话直接在现有产品成果上继续，不重新发明流程、不重新启动 A/B/C/D/E。文中时间取各源记录中的日期，远端状态以新会话检索的实时 HEAD/CI 为准。

## 0. 一句话决策

**P0（Main-owned 后台会话兼容）先查事实、由独立 P06 会话负责修复/完成闭环，本 D4 会话不抢占其安全归因与发布签收。P1（真实业务对象/条件输入和路由）及 P2（审核任务组织、上下文和开销优化）由 D4 会话负责。**

P1、P2 可先围绕 PR #100 候选功能展开设计与必要定向工程；一切依赖 P06 owner/IPC 的接线、合并和正式释放，必须等待 P06 有证据的固定兼容合同，不能凭接口名称相似直接移植。

## 1. 固定仓库与版本坐标

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- COMMON-01/02 公共对象/条件：[PR #88](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/88)，SHA `a7a6a11d4840ad64cfc858c17b35f35180adf063`。
- G01–G08 50 套模板：[PR #89–#96](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pulls)，均从 COMMON 固定技术版本衍生。
- 统一集成：[PR #97](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/97)，SHA `b68443b23293b4714e61a3b81383d3d3a56434fc`。50 套 D1/D3 验证、49 套通用 D2 夹具和 50 套 candidate-held 安装，G01-I 用单独 student-field 夹具。统一报告：`docs/design/review-agent/acceptance/d4-unified-r01/INTEGRATION-REPORT.md`。
- **当前 D4 产品闭环工作版本**：[PR #100](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/100)，固定 HEAD `b5a1bde69b04832a3ce5625b9577a8b50e626f13`，相对 #97 的独立 Draft，尚未合并 main。原报告 `docs/design/review-agent/acceptance/d4-product-loop-r01/REPORT.md`；原始核对数据 `evidence/verification.json`，`evidence/g08-run.json`，`evidence/g08-read-ledger.json`，`evidence/g08-online-tools.jsonl`，`evidence/g08-evidence-links.json`；截图存同目录。
- PR #100 最终 HEAD 对应的八个远端工作流成功；统一全仓 [CI #39073291550](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39073291550)：3718 PASS / 6 SKIP / 0 FAIL；此前 G04 反推 Git push 竞争已改为 Artifact-only，CI #39073291588 成功。这些是工程回归，不代替新版 Main-owned/P06 LIVE。
- 项目文档治理：`AGENTS.md` 要求更改它和根 README.md 之前取得用户授权。本交接不触碰这两个文件，也不更新产物版本。

## 2. PR #100 实际完成（别重做）

真正打通：Electron UI 选择 D4 candidate-held → 逐对象主场景/三值条件确认 → 真实 D1 workspace → D2 compile/create/attach 固定 Plan → 上传材料、保留原 Subject/RuleSpec → 指定对象的证据关联 → 原有普通 Pi review-operator 会话和材料工具 → Check 提交、SourceRef 和原件定位 → 工作台展示。不是只安装了 50 个空壳。

关键代码：
- `apps/electron/src/main/lib/review/review-d4-client.ts`、`review-d4-catalog.ts`、`review-ipc.ts`；
- `apps/electron/src/renderer/components/content-review/D4CaseSetup.tsx`、`CreateCaseDialog.tsx`、`SourceBlockView.tsx`；
- `apps/electron/src/main/lib/review/pi-case-review-service.ts`、`workspace-service-v2.ts`；
- `apps/electron/scripts/review-d4-product-loop.ts`（隔离 profile 开发启动）；
- `docs/design/review-agent/acceptance/d4-unified-r01/catalog.json`（50 套来源目录）。

本地复测（示例，模型配置只传**目录**，不传 Key）：先 `bun install --frozen-lockfile`，再进入 `apps/electron` 运行 `bun run review:d4:dev --model-config /已有模型配置目录`。启动器隔离 `PROFER_CONFIG_DIR`，不能复用真实个人审核数据。候选不可自动发布为校方正式模板。

真实在线技术预审仅 **G08-T02 一案**：两件失物、107 个 Check、两个 Subject、两份 Markdown 解析原件 18/18 block 已读；DeepSeek Flash 真正使用 `review_read_documents` 1 次、`review_submit_result` 6 次。R-01 中 A 对象符合、B 对象不符合（耳机/雨伞与序号矛盾），每项均有 SourceRef；13 项 unknown 保留待核。最终 107/107 提交，统计 compliant 1 / non-compliant 1 / awaiting-confirmation 74 / awaiting-supplement 10 / not-applicable 21；`effectiveVerdicts=2`，其余并非确定性业务结论。耗时约 2 分 52 秒，SDK 分别记录 input 105996、output 43594、cache-read 845568 tokens；三项计数口径不要简单相加当作成本或总上下文。

G03 两资源条件重选的独立新案与指纹、G01-I 两字段和两条独立 EvidenceLink 做过定向建案/服务验证，但**没有**为这两个领域声称在线模型业务结论通过。50 套均可加载不等于每套实际模型结论已评测。

**已知样本污染**：`fixtures/A-电子购买凭证.md` 明示“不能仅因缺纸质发票报缺件”，`fixtures/B-申报与登记冲突.md` 明示“明确问题：申报物品与登记不一致”。该次运行证明产品和来源链，**不能据此证明模型自主发现能力、泛化准确率或模块化相对完整 Markdown 的收益**。不要求此时重新开 Gold 研究；未来做任何效果比较须先移除材料中的答案提示，且限定为具体产品决策。

## 3. P0｜后台会话：只核接口真相，不由本领域代签

- P06 独立推进仓库分支：[PR #98](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/98)（U0/U1）与 [PR #99](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/99)（L02-00 归因）。
- PR #99 检查时 HEAD `66dc3f099e4711b8889d24fabb893973896c71ee`；#98 为 `2d9e93f3a637e8325862769f80fe4b4e884c51a1`。都是另一条分支，**不能拿它们当 #100 的直接兼容父 SHA**。
- 必须优先读 P06 自己的 `docs/design/review-agent/59-p06-l02-00-session-handoff-20261018.md` 和 `60-p06-l02-00-restart-execution-task-20261018.md`（这些存在 P06 分支，不应假定已经包含在 #100 文件树）。
- P06 当时记录：`P06 = PARTIAL`、`P06-S02 = NOT ACCEPTED`、`L02-00 LIVE = BLOCKED/NOT-RUN`；U0 和部分 U1 受控回归通过，但真实 Electron/Main/IPC/Office/Provider、owner/SourceRef 完整安全验证及部分后续阶段未正式签署。需新会话重查最新进度，不能把此历史状态当成永远不变。
- PR #100 仍通过 Renderer 启动**普通可见 Pi 会话**；P06 候选采用 Main-owned `owner.kind=review-case`、Bridge、主窗口 sender 校验、admission ACK、事件和状态投影。二者尚未实际合并及复演。
- **本 D4 的 P0 任务仅是接口差分检查和消费条件定义**：列出现用 D4 建案/启动/停止/恢复、assignment/run、工具权限、SourceRef/EvidenceLink、跨案事件隔离、进度回显，与 P06 最新 HEAD 接口的差异；标记 verified / incompatible / unknown，写可执行兼容需求和阻断，不重复跑 P06 L02-00/01，亦不擅自把 Main ACK 当 running、把 owner 当授权。
- P0 代码改动或正式跨分支联调只在 P06 提供稳定合同及具体安全门禁后，先经双方固定 SHA 评估再执行。P06 Office #71/SourceRef、Relay/Pocket、LIVE 签收不属于本 D4 会话代办事项。

## 4. P1｜我们负责：把开发夹具输入变成用户可用的实际表单与路由

现状：`D4CaseSetup.tsx` 从各模板**合成 selection** 预填两个对象、英文主场景 ID、三值 condition ID，可编辑名称、选条件、展开 JSON；不能自然新建/删除业务对象、录入真实业务事实与证据归属，也没有“拖材料 → 识别事项 → 选择模板”的可靠产品入口。当前条件变化要求新案，以避免旧结果继承；不可偷偷允许覆盖原 Plan。

目标（依托既有 D1/D2、TemplateStore、Pi，不要重建 DSL 或 D5 编辑器）：
1. 首先用真实作者态/目录声明生成**可理解的业务字段和条件表单**：新建/移除对象、主场景及叠加三值、填写来源/受控确认、名称和对象 ID；对 G01-I 单独保留 student-field 路径和合成数据警示。
2. 允许上传后基于材料内容**提出**候选审核事项/领域模板/对象和条件（原产品目标有 20s 自动选择窗口、人工可覆盖）；未被证实的关键条件保持 unknown。用户选定、确认后调用原 D2 固定建案，不要把 AI 猜测当成有权登记、授权或正式校规。
3. 维持多任务上传默认拒绝或显式拆案，防止跨业务/跨对象材料误配；保留人工切换模板及能解释“为什么推荐”的最低依据。
4. 安全边界：不使用隐藏 Gold、真实受限学籍/OA；不让改模板/条件静默修改已运行案卷；输入控件不允许随意填 `decidedBy=reviewer` 伪造用户确认；合成 fixture 仅在开发/演示模式显式出现，生产默认不得使用合成身份底账。
5. 最小验收：一个非学籍业务用界面创建**非预设数量**对象，至少两个不同条件，其中一个 unknown；经原 D2 compile/create 形成按对象的 Check/Subject；至少一份材料在用户确认后正确归属，无串证；一项路由错误可被人工改选且保留说明。只需要一个真正可用的工作流切片，不全量 50 套逐一 GUI 走查。

**不预设自动路由已实现**；先追踪现有路由/20s 倒计时源码，再复用或最小补齐。不允许不经用户同意扩大为全新的智能工作流引擎。

## 5. P2｜我们负责：减少模型负担，同时保持可追溯和既有门禁

现状：G08-T02 两个对象展开 107 Check，短材料也消耗大量输出与重复上下文。工具记录里先出现“模板不存在观察字段”、对象证据范围未满足、不正确不适用状态等拒绝，后来纠正；错误不是全由模型弱导致，也可能是模型提交合同/Schema 过载。不能把 107/107 的最终覆盖当作有效推理数。

目标：
1. **先用已有 PR #100 原始日志建立基线**：Plan 检查项中适用/不适用/unknown 的分布，提交工具调用及 reject 类型，payload 长度、输入/输出/cache tokens、运行时长、逐块读取数、最终待核数。新的观测可只补最小统计点，不开新的复杂实验。
2. 优先排查把整个 107 Check 列表、重复固定元信息、每项详细证明事实、长原文重复塞进提示词，以及要求模型提交缺乏字段定义的 observations。先解决多余字段、提示词重复、工具 payload 格式不匹配等**已经实测的浪费**。
3. 在现有 D2/Pi 责任账本下尝试任务分组与增量提交、固定规则信息引用/按需读取；适用性已被可靠判为 not-applicable 时可由合法确定性门禁填充相应记录，unknown 绝不可被猜成不适用，任何过滤/短路都不能删除审计责任、改变 fingerprint、减弱 SourceRef 约束。
4. 按模型能力设计“小任务、固定输入、明确输出”，但不得把领域语义碎片化到丢失上下文；所有实际结论仍需正确 RuleId/Subject/证据引文，已拒绝的提交保留可见重试原因。
5. 只选择当前已有的一套样本及经去答案提示的一个小材料变体进行定向对比：同一模板、模型与内容版本，比较是否仍能发现关键矛盾、是否跨对象串证、是否出现假通过，同时统计时间和 tokens。若改动没有可观察收益则撤销/登记，不开无限重复实验。
6. 不追求新的硬编码规则覆盖率，也不要求一次把 50 套模板全部优化。保留在线模型的真实执行证据和受控 pending 语义区分。

## 6. 先后顺序、分支和停止边界

- **先接收状态**：新会话读取 #100 固定源代码和上面运行证据，同时只读检查 #98/#99 的最新进度；明确 P0 的外部依赖，不要擅自推进 P06。
- **P1 优先**：目前普通用户必须接触合成初始对象和原始 JSON；先做最小可用业务表单与选择链，不应将 P2 性能指标作为 P1 开工门槛。
- **P2 随 P1 稳定后定向优化**：以 PR #100 实测数据作基线，去重复、降无效提交，最小正反例确认不改变业务语义；可以先做只读剖析，避免与 P1 的文件交叉改动。
- **P0 随 P06 实际进展重新判定**：其未正式接线的情况下，新 D4 代码不得以兼容 P06 作为发布承诺；跨分支需要独立兼容工作树、明确固定 SHA 和双方安全限制。
- **工作方式**：使用 PR #100 固定代码 `b5a1bde69b04832a3ce5625b9577a8b50e626f13` 为 D4 当前候选基线，确认远端 HEAD 后再创建独立 worktree/PR；不从浮动 main 偷偷迁移，不修改冻结原业务 Markdown / hidden Gold；不自行合并、发布或认证学校政策；代码变更需运行关联回归、typecheck/boundaries/必要 Electron/GUI，保存实际命令与失败；项目要求先征求用户同意才改 `AGENTS.md` 和根 README.md。
- **停止条件**：本会话只做当前有实际使用价值的 P1/P2 与 P0 消费边界；同一个不可解故障保留最小复现和准确责任归属即可，不再衍生 A/B/C/D/E、50 模板大型重复验收。

## 7. 给新会话的首轮回答要求

请先复核固定 PR、实际状态，简洁归纳 **已完成 / P0 已知与待核 / P1 下一代码切片 / P2 首个可测性能改善**，明确先动哪些文件及预计能改善哪个用户行为。先与用户讨论优先级；未收到明确开始开发的指令，不要擅自跨 P06 安全边界提交生产修改。不得再给出“为了证明方法有价值还需一整轮研究”的建议。

**本文件是一次交接，不是新的工程 PASS。**
