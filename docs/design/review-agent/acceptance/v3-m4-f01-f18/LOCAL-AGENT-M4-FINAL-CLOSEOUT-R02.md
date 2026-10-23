# CDUT Studio Review V3｜本地 Agent 最终接收与产品收尾任务书 R02

**出具：2026-10-21 / 本主监督会话**  
**任务性质：执行交接，不是再次调研、不重新分发 F01–F18、不直接宣布发布完成。**  
**唯一代码候选**：[PR #206](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/206) / `integration/v3-m4-unified-f01-f18-r01` / 固定 HEAD `b0d3c3f69b089c1e673c4003c08c2f499a631bc8`。  
**main 快照**：`19efdbb039374aaab37c58aba0b5d14131c5cf58`（开工先重查，后续变化不得用本文件覆盖）。  
**模板调查依据**：[PR #186](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/186)，报告固定提交 `71f9ae0e8391c77b0a1f3cd00fdd1f2d134d9705`：`docs/design/review-agent/acceptance/v3-m4-parallel-r01/TEMPLATE-ASSET-AND-FALLBACK-RESEARCH-20261021.md`。  
**历史功能交接**：本目录 `LOCAL-AGENT-PR206-INTEGRATION-HANDOFF-R01.md`；R02 **补充并优先裁决“最终收尾顺序、模板资产口径与验收结果”**，不否认 R01 的 CI 证据。

## 0. 一句话任务与严格边界

**只接收一次 PR #206 的统一功能候选；不要重复接收 F01–F18 的 #188–#205。随后围绕真实用户业务闭环，优先排除 A15-S4 真实 GUI/文件导入阻断，核实并补齐“50 套 D4 + 公共兜底/作者流程 + 六类完整业务示例”的不同产品要求。以最小必要修改完成主线集成与验收。**

本地 Agent 是唯一有权进行最终 Main/IPC/Preload/Case/Run/评分可信事务修改、仓库 main 合并和桌面 GUI 验收的执行方。本任务书不要求重新设计 CaseV3、RuleStore、PlanStore 或重跑旧 T01–T10、R01/T01–T04 的历史集成任务。

## 1. 本次接收前已经被证明的事实

| 工件 / 里程碑 | 证据及实际状态 | 不能向上推断 |
| --- | --- | --- |
| **#206 F01–F18 统一代码候选** | 固定代码 `b0d3c3f`，相对当时 main 领先 19 提交、129 个文件有变更；GitHub 显示可干净合并；四个 Actions `verify/test-batch/review-baseline/scoped-pi` **completed/success** | **还没进 main，不代表 A01–A18/U01–U12 的用户行为或 A15 S4 已验收** |
| **main 的 A15 S1** | 通用组织模板、字段/材料槽、双阶段、无学年建案与复用 PASS | 不等于任意业务模板都能实际运行 |
| **main 的 A15 S2** | 四个 Main/Electron 真 RuleRun：18 人 compliant、21 人 non-compliant、人数未知 awaiting-confirmation、缺材料 awaiting-supplement；21 人无例外不得 stage-pass | 不等于六类真实业务已全验 |
| **main 的 A15 S3-01 / S3-02** | 两轮补件 insufficient→satisfied→新 Run/旧 Run 保留；真实 Run 绑定初审→本地模拟 teacher 终审、冷重启保全 PASS | 本地角色不是学校正式身份 |
| **main 的 A15 S4** | **PARTIAL**：真 UI 进审核区→选已发布模板→填 6 字段→建案→运行模板规则，得到真 Case/Run；原件仍 `documents=[]` | **不能说完整 GUI、上传、报告与重启一次性旅程 PASS** |
| **PR #186 公共模板调查** | 50 套资产保存并有 50/50 目录与逐项非零技术 Plan 安装测试；COMMON 通用编译与 B3 自建候选存在；六类 T01 ZIP 示例存在 | **未确认独立固定 catch-all 公共模板资产，也未证明 unmatched→AI 起草→正式发布→Run 全链路** |

**当前 S4 精确阻断**：headless xvfb/openbox 环境里原生 `dialog.showOpenDialog` 无法被 `xdotool` 成功操作，CDP 伪造文件无法提供 Electron `webUtils.getPathForFile` 的真实磁盘路径。测试中另有材料槽位未选、工作台案卷上下文和引导浮层遮挡，已查出真实原因。后续工作应优先有真实桌面会话的本机操作；环境不可达时保留 **PARTIAL/BLOCKED_ENV**，不走私有 IPC 假造 UI 上传成功。

## 2. 立即执行：一个代码来源、一个受控主线接收动作

1. **保护当前工作现场**：`git remote -v`、`git status --short`、`git log -8 --oneline`、`git worktree list`；查明当前仓库远端名称（历史不同工作树用过 `mine` 与 `origin`），保护任何本地尚未 push 的 A15 修复、截图和报告。不 reset hard、不强推、不改写已经合入的 main 历史。
2. **固定源和新基线**：fetch 真正指向 `Fuck-GH-Admin/cdut-studio-review-agent` 的远端，比较最新 main 与 PR #206 的**实际** HEAD；预期固定源为 `b0d3c3f69b089c1e673c4003c08c2f499a631bc8`。若任一头有新提交，必须先查看实际变化、冲突范围和 CI，不直接套用旧“干净合并”结论。
3. **使用独立 integration worktree** 以现有 main 为基线三方合并**#206 一次**（优先保存单独 merge commit / 回滚点）。绝不再把 #188–#205 逐个重复 cherry-pick 或 merge；**PR #186/#187 只是文档/调研或协调分支，不是功能代码来源**。除非任务另需保留 docs，不把它们混入此生产 merge。
4. **冲突复核优先级**：#206 改动多达 129 文件，包含 `review-ipc.ts`、`preload/index.ts`、`packages/shared/src/types/review.ts`、Main run/stage/evidence、`TemplateWizardPanel`、`BatchPanel`、`ReviewV3T05HumanWorkflow` 等**共享接口和正式用户入口**。不得整文件 `ours/theirs` 覆盖；针对真实消费关系逐处确认双方功能仍在。保留唯一 CaseAggregateV2/CAS/Receipt/DocumentVersion/SourceRef/ReviewRunV2/T07 CAS 权威。
5. **保留版本一致性**：#206 已把 `apps/electron/package.json` 和 `bun.lock` 保持与旧 main 一致，避免 18 个 PR 的零散版本升级破坏 `CHANGELOG.json` 对齐。此次不要重新并入各分支的版本 patch；正式发版版本由 L 最后统一决定。
6. **在真实新 merge SHA 上重验**：`bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、CI 同等 Electron Main/Preload/Renderer build 和 `bun test --isolate --timeout 30000`，随后 scoped/batch 专项。以前 `b0d3c3f` 的绿色不能自动沿用到合并后 SHA。根据受影响范围补最短的 Main/IPC/GUI 负例，不为数量额外造测试框架。
7. **提交与主线**：候选本地构建和重要门禁通过后由 L 自主决定 merge/push 到 main；按每次提交标注 pre-merge SHA、merge SHA、桥接修复 SHA、回滚点。若阻断属于真实契约/产品问题，修完再推进，**不要通过放宽权限/造假的通过 Check 偷渡**。

### 已在 #206 候选内完成的高价值收口（不得重复开发）

- F02 主模板负责人声明↔T04/Main Plan 桥接；F08 数值下限操作；F07 冻结绑定覆盖、0-check 阻断。
- F11 可信业务阶段 + F12 补件周期 + F13 申诉历史，在同一 T05 工作台组合，不能再造第二套决定/阶段权威。
- F06 证据归属工作台进入真实用户入口；F15 由 Main 从真实批次/已发布量表派生评分轮次；F18 评委离线回执由本地组织者显式确认且经 T07 CAS；T09 公开字段/学生补件 Actor 不由 Renderer 自封。
- **这些是代码候选交付内容，不是所有用户旅程已通过。**

## 3. 并行研究汇总：必须把 50、公共兜底与六套示例分开验收

| 对象 | 仓库中的真实形态 | 最小收尾验证 | 未证明的部分 |
| --- | --- | --- | --- |
| **50 套 D4 G01–G08** | `d4-unified-r01/catalog.json`；组数 5/3/10/8/6/9/7/2；`review-d4-catalog.ts`；测试目录 50/50 + 每套非零技术 Plan 安装 | 合并后保持 50 项 count、每条原始 Git blob SHA、可读取并安装 Plan；原有 `candidate-held`、`publicationAllowed=false` 不许篡改。选 1–2 条做真实来源/Run 冒烟，并单独记录覆盖多少 | 50 次 Plan attach ≠ 50 套学校正式发布 ≠ 50 次有真实原件的全用户 E2E |
| **COMMON-01/02** | `review-d4-common.ts:compileD4Generic`，已给工作区展开按对象/条件的技术检查 | 保留公共编译调用与负例；不重新创建并行 D4 目录 | 它不是固定“任何材料都可直接审核”的公共模板 |
| **“第 51 套” B3/B29/B1 候选** | `ReviewV3LocalCandidateWorkbench`、B3 unmatched→用户明确确认→B29 最小候选骨架→B1 作者保存/冻结 | 真实 unmatched 时用户能够创建、编辑并持久保存**候选**；不得因“没匹配”自动跳过确认。与 T01 草稿版次区别清楚 | 候选自建 ≠ 已发布业务模板 ≠ 合法本地最终决定 |
| **公共 catch-all 兜底/模板自动生成** | 静态调查**没有找到独立固定的通用 catch-all Template ID**；T01 自然语言/授权模型草稿在另一入口，未证明与 B3 自动接通 | **作为明确产品遗留问题处理**：优先在**现有统一目录**实现/验证一套共享的“未匹配→通用作者起点→编辑草稿→负责人确认→发布→真实 Plan/Run”流程。复用 B3/B29/B1/T01，不建第二套模板库或自动制定政策。固定资产 ID 若需新增，先确认它是**可编辑 scaffold 而不是可信政策模板**；实际发布前必须负责人核实所有规则/来源 | 不可用 COMMON 或六 ZIP 冒充兜底；没有真产品链就标 `PARTIAL` 或 `FOLLOWUP_REQUIRED` |
| **六种完整标准业务示例** | T01 `review-v3-t01-example-packs.ts` 六个虚构政策+原件 ZIP，另有 A15 实验室模板这一不同起点 | 六包文件可生成/下载且包含模板、政策、真实材料样例；根据产品成本至少逐一完成**真实导入/Run 的核心检查验证**，样例仅测试打包而未真实跑的要逐个记录 | 六包 ≠ 50 D4；不因任何单个 A15 PASS 推断六种不同业务的补件/评分/报告全 PASS |

**收尾策略**：#206 代码可以先集成，**无固定 catch-all 并不应被谎称“已交付”**，也不必为它否决已合入的 F01–F18 其他成果。把共享兜底用户旅程列为 M4 产品收尾 **P1 必查/必要时补最小接线**：优先只复用 B3→T01 起草及发布，不做“自动凭空审核所有业务”的新框架。若这条线路有实际剩余代码工作，L 可记录精确 F02/路由产品缺口和独立提交 SHA；功能最终完成前不能标整项完整。

## 4. A15-S4 与 M4 真正验收：先完成实际业务，不重复无关调查

**本轮 GUI 最短必验旅程**（以同一 Case/Run 证据为主）：

1. 真桌面启动 → 用户打开审核区 → 选已发布模板（不是未发布 D4 candidate）→ 编辑组织字段并建案。
2. **通过实际 OS 文件选择器或真实拖放**，选中正确的 `lab-use-plan` 槽并登记真 DOCX/PDF；在真实 `state.v2.json` 里核实 `documents` 非空、版本和字节/来源对应，不能只看 UI “登记中”。
3. 点击正式规则检查，得到当前 Plan 指纹/有效 Check/真实 Run；原件来源可定位，缺件/错误不能假通过。
4. 补件或纠错→新 DocumentVersion→新的 Run；旧 Run 不被改写；按模板合法的 reviewer/本地模拟 teacher 执行阶段行为；21 人超限不得无具名例外 stage-pass，未运行/0-check 也不得默认放行。
5. 导出实际报告、打开查看对应**当前 Run 和受众**；退出 Electron 后冷重启重新打开同一 Case/Report/任务和历史 Run，核对状态/ID 完整。
6. 任一步无法在当前 headless 完成，就去可实际操作原生文件对话框的**有桌面窗口本机环境**复演；如果仍不可执行，明列 `BLOCKED_ENV` 与证据，**A15-S4 留 PARTIAL，禁止虚构成功或降门禁**。

**M4 功能验收重点不是再跑 18 份子 PR 的原测试**：核实 #206 与现有 S4 的交叠；检查 F01 首次引导、F02 模板作者、F03 冲突来源、F04–06 图片/OCR/事实、F07–11 规则 Run/业务阶段、F12/13 补件申诉、F14/15 批次评分、F16/17 报告助手、F18 离线副本。可用“已实测 PASS / 功能可达但未 E2E / 部分实现 / 外部阻断”记录而不是再抄产品设计。100 案/500 文件、安装包、评委独立工作副本、所有导出格式和跨平台样本若未真实执行，明确 NOT_RUN。

**真实校方学校身份、政策批准和校园 API 属外部依赖**，在没有授权时可以模拟本地业务，但不得标为学校接入已完成。外部条件不能成为忽略可独立交付的本地功能的理由。

## 5. 质量与职责：最短但不能省略的门槛

- **代码接收 PASS**：#206 代码在明确新 SHA 的 main 上独立合并、构建/测试通过、无重复 writer/旧版本被覆盖；所有四个 GitHub 工作流在新 main 上可解释。
- **A15 核心业务 PASS**：S1/S2/S3 的已知实证不回归；S4 由一次真 UI + 真实文件 + Run/决定/报告/冷重启实际通过（或如实 PARTIAL/ENV）。
- **模板覆盖核查 PASS**：D4 50 套资产与逐一 Plan 安装不回归；COMMON/第51候选/六类 ZIP/公共兜底路径身份分别记录，未运行的不能算 PASS。
- **M4 产品收尾结论**：用 F01–F18/A01–A18/U01–U12 差距矩阵给出 PASS、PARTIAL、BLOCKED_ENV、BLOCKED_EXTERNAL、NOT_RUN，并明确影响版本发布的 P0/P1 项；**不靠 PR 206 的 CI_GREEN 直接宣布 PRODUCT_ACCEPTED**。
- **发版阶段**：如果申请正式收尾/安装发布，另做统一版本与 CHANGELOG、Windows/Linux 安装与无开发依赖启动、格式依赖、真实包内资源和回滚确认。未执行则标 RELEASE_NOT_RUN，不要自动夹带版本改动。

**异常处理**：若本地合并时发现跨域数据合同冲突，只修最小真实消费者与写入链，记录 SHA 与一条复现；不要扩展成全仓历史考古。若欠缺学校正式权限、无 GUI 桌面环境，请明示，不要让测试假 PASS。

## 6. 本地 Agent 必须提交的最终回执（请直接按此结构）

~~~text
V3 M4 Local-L final receipt
SOURCE: PR#206 HEAD=b0d3c3f69b089c1e673c4003c08c2f499a631bc8
BASE: main-before=<sha> / merge=<sha> / final-main=<sha> / rollback=<sha>
CI: typecheck / boundaries / build / full bun tests / batch / scoped, commands+actual results
CODE: merged F01-F18 once; ownership conflicts resolved=<files>; main writes conserved=<evidence>
A15: S1=... S2=... S3-01=... S3-02=... S4=...
S4 EVIDENCE: caseId, runId, documentVersionIds, real OS dialog/drag route, sourceRefs, report path, cold restart
TEMPLATES:
  D4 50/50 assets=... plan attach=... real sampled runs=... official publication=NOT_AUTHORIZED
  COMMON-01/02=... / B3-B29-B1 #51 candidate=...
  PUBLIC FALLBACK: static ID? / unmatched→editable draft→confirm→publish→Run actual=...
  SIX EXAMPLES: six ZIP inventory=... / each real business tested=...
M4: F01-F18 & A01-A18 status source, outstanding P0/P1, release gates
BLOCKERS: BLOCKED_ENV / BLOCKED_EXTERNAL / CONTRACT_GAP with reproduction
DECISION: INTEGRATED | CORE_JOURNEY_ACCEPTED | PRODUCT_ACCEPTED | PARTIAL | RELEASE_NOT_RUN
NEXT: only concrete remaining P0/P1, no fresh parallel research or redundant PR remerge
~~~

**最终工程原则**：先把现有成果真实接收和验收，避免为了收尾再启动 18 个 Agent；尊重 50 套既有资产与公共兜底需求，同时不降低学校权限、证据版本和实际 GUI 的真实性。只有项目负责人能根据实证宣布“第四里程碑完成”或正式发布。
