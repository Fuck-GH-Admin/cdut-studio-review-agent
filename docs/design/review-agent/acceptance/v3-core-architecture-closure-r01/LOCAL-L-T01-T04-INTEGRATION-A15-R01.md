# CDUT Studio Review V3｜Local-L 接收架构收口 T01–T04 并执行 A15｜执行任务书 R01

> **立即生效：** 本文件补充 PR #180 的核心架构裁决，不覆盖 Local-L04 原十线集成台账。原始十线已经在 main，**本轮四个 T01/T02/T03/T04 均为新的“架构收口/材料增强”续作，不能拿历史同名 Txx 分支重复合并。** 实际本地主线与已开工工作树以现场为准，逐条对照增量，不丢失正在进行的事务或已有修复。  
> **核验主线**：`main@9ebfb0f0f13a7f1662ac3ee2eb0a23697453c629`（2026-10-21 复核）。该主线已经有 `36cb1dcd1303` 的业务模式/Run 有效性收口，以及 `9ebfb0f0f13a` 的 A15 S3-02 实机阶段验证。**绝不能从四个旧基线覆盖这两次 main 增量。**

## 1. 四个实际交付：精确来源与质量状态

| 顺序 | 独立 PR | 分支 / 2026-10-21 固定 HEAD | 修改重点 | 当前门禁（以开工最新 HEAD 重核） |
| --- | --- | --- | --- | --- |
| **A：先接 T02** | **#181** | `feat/v3-t02-ocr-source-geometry-r01` / `ee0b787d80edd0d9d81089610c617c750d3a055f` | PPTX 内嵌媒体关系路径、真实像素坐标的 OCR 块、B2 staged 只读预览、UI bbox；5 文件 | **PR CI、Review Baseline、D2 Scoped 均 SUCCESS**；不涉及核心 R01 合同 |
| **B：接 T01 作者态** | **#183** | `feat/v3-arch-r01-t01-typed-criteria` / `f5ae8bb1eb9883e57d44e77a4216f12d78c61796` | 新 `ReviewV3T01NumberRuleEditor`、`deterministicConstraint`、负责人确认、A15 20 人规则从 UI max 移到业务标准；8 文件 | **PR CI FAILURE，日志仅见现有主线 T05 测试 `TS2339` 两处；该次流程未跑单测**，不能声称全部绿 |
| **C：对齐合同后接 T04 编译器** | **#182** | `feat/v3-core-t04-published-plan-r01` / `e39cbbd2643533e879c9607b9dc2e2956ffdedca` | 新 `compilePublishedTemplateReviewPlan`、T04 `material-min-count`、A15 规则域单测；4 文件 | **Baseline SUCCESS；PR CI / D2 Scoped FAILURE**，同两处 T05 测试类型错误；产品 Run 还未接 |
| **D：最后接 T03 Run 门禁** | **#184** | `feat/v3-architecture-r01-t03-run-gate` / `1f3e2ce1521de81dfccb56f4a149dac7a7753b7f` | `assessT03RunAction`、`selectT03CurrentRun` + 定向测试和 Main 交接；3 文件，**不修改 T05 Main** | **Baseline SUCCESS；D2 Scoped FAILURE**（同 T05 TS 错）；**PR CI 最终 FAILURE**，同主线 T05 测试 TS2339，未到后续测试阶段；不能用旧 SHA 绿灯代替 |

所有四分支均从 `main@5643959a4219` 派生；而现 main 已前进。每个 PR 都是 **docs/source 增量**，不是“完整 E2E 已通过”。

**当前 CI 的真实已知故障**：主线本身 `PR CI run 39503846703` 以及 T01 PR run `39503902591`、T04 PR run `39503775147`、T03 Scoped run `39504738012` 均在 typecheck 时失败，错误一致：
`src/main/lib/review/review-v3-t05-business-mode.test.ts(43,30)` 和 `(136,64)`：`TS2339: Property 'caseV2' does not exist on type 'never'`。**这是主线共享测试类型错误，不能归罪于 T01/T03/T04；修好后必须重新 typecheck，并真正跑各自单测。** 本地只按失败日志修该测试/类型收窄的真实问题，不修改生产权限或业务门禁来“刷绿”。

## 2. 先做的三项零成本检查

1. 在现有本地工作树先 `git status`、`git log -8 --oneline`、`git branch -vv`，保护尚未提交内容；`git fetch origin` 后比较实际 `origin/main` 与四 PR 最新 HEAD。**如果本地已经修了 Run/T05，不要再次按旧文档重做**。
2. 在独立 integration worktree 以当前 main 作为接收基线；每个 PR 独立三方合并/独立提交，保留可回滚 SHA。禁止 `git reset --hard`、强推、整文件取 ours/theirs 覆盖和把四线 squash 成一个不透明提交。
3. 对比 `36cb1dcd1303` 的 Main Run 选择/按动作 gate 与 #184 的新纯领域模块：**先列等价能力与缺口，复用新模块但不得创造第二套相反的 readiness 权威**。

## 3. 真实领域合同冲突：T01 + T04 **不能直接拼起来就算接通**

已经核查两个 PR 的源码和交接文档，存在至少 **两组明确不一致**：

| 契约字段 | **T01 #183 已实现** | **T04 #182 当前接收** | 必须怎样消除 |
| --- | --- | --- | --- |
| 数值规则 | `deterministicConstraint: {schemaVersion:1,kind:'field-number-limit',fieldKey,fieldScope:'case',operator:'lte'|'gte',threshold:number,ownerStatement}`；投影 `collectT01ConfirmedNumericChecks()` | `T04PublishedConstraint.constraint: {kind:'field-maximum',fieldKey,maximum:string,unit?}`；顶部 `confirmedBy,confirmedAt` | **T01/T04 Owner 对齐显式无损适配/有限规范，不让 Local-L 猜业务规则**。A15 的 `lte` 可明确映射到既有 `value-limit`；`gte` 若 T04 尚无最小值算子，须实现真实最小值操作或标 unresolved，**不可冒充 lte**。来源 `ownerStatement` 留在发布证据里，由 Main 确认发布者身份 |
| RuleSpec 来源标识 | T01 投影 `policyVersionId='template-owner:<id>@<version>'` | 旧 `resolveEffectiveRules()` 自动分项 RuleSpec：`policyVersionId='template:<id>@<version>'`；T04 使用 `(policyVersionId,ruleId)` 精确 join | 为同一个真实 published criterion 形成**唯一、明确、相等的 rule identity**。建议以现有 `resolveEffectiveRules()` 的 `template:<id>@<version>` 为正式运行规则身份，`owner-statement` 另存经过 Main 验证的出处，不要把它冒充学校政策；Owner 如选另一个版本号须同时改生成侧与消费侧并证明历史兼容 |
| 字段名称 | T01 实验室 preset 使用 `peopleCount`（案卷级 numeric）；A15 早期测试草案有 `applicantCount` | T04 编译 `fieldKey` 严格查 `TemplateVersion.fields` | **只采用真实已发布模板字段键**，不得在 Main/T04 硬编码任一字符串；更换字段 ID 必须新模板版本 |
| 表单与规则 | T01 主动移除了实验室计数字段 `FieldSpec.max=20`；改为负责人确认的审核标准 | T04 `value-limit` 应生成明确的 CheckResult | 这是合理的：21 人必须**能建案**并被规则判 `non-compliant`，而非被表单拒绝导致反例永远无法审核 |
| 未确认标准 | T01 导入/模型草稿不能继承 Owner 签名，模板编辑页发布前拦未确认 | T04 仅接受 `published` + 已确认 `RuleSpec` + 显式 `T04PublishedConstraint` | Main 保存/发布时也验证，Renderer 的 `enteredBy` 不构成可信发布身份；纯 requirement 不能被推断成 deterministic |

### 优先执行的消歧方式

- **T01 Owner** 定义唯一可发布数值条件并维护编辑器与 `TemplateVersion` 的一致性；接受向下兼容的正式可选 `TemplateCriterionSpec.deterministicConstraint` 类型（或严格解析保留的 JSON 字段），不引入第二套 TemplateStore。
- **T04 Owner** 让 `compilePublishedTemplateReviewPlan` 消费该明确的 T01 条件；规则 ID 与 `resolveEffectiveRules` 一致。原本的 `field-maximum` 作为中间适配类型只可用于完全表达无损的 lte，否则不适用。编译不允许把未知值当 0、不得按文章文本猜上限。
- **Local-L** 负责共享 DTO、TemplateStore 发布版本的可信来源校验、Main 正式安装、Run/Check 写入。**不要自行设计 `operator=gte` 的规则语义或声明 owner 学校身份**。若 Owner 还在改动，先把 T01 + T04 代码隔离接入集成 worktree，记录 `CONTRACT_REQUEST`，继续 T02/T03 及其他可执行 Main 工作；**不要将未兼容的组合标 WIRED 或直接宣称 S2 PASS**。
- **关键运行回归**：一个真正发布的组织模板 + `peopleCount` 或 `applicantCount`（以模板实际 key 为准）；`18→compliant`，`21→non-compliant`，未知/未确认→`awaiting-confirmation`，缺材料→`awaiting-supplement`。四者必须来自**同一 RuleSpec+Plan 编译器**和真实 Main 输入。

## 4. 分批合并与可验行为（不要把“合入”当“验收”）

### 4.1 T02 #181：独立先接，不阻塞 A15

纯增量五文件；优先三方合并，验证 `review-v3-t02-visual-ocr.ts`、`review-v3-t02-staged-visual-ocr.ts`、`review-v3-t02-pptx-visual-assets.ts` 的像素位置、PPTX 关系、页面索引和页面 bbox 语义。Renderer 只显示真实可证的坐标，PPTX 当前无布局框就不得伪造。跑本模块定向测试，相关 build/typecheck。**T02 当前的独立通过状态与 A15 结构化规则无依赖**，即使 S2 不可开始，也可以先合入 T02。

### 4.2 T01 #183：接作者态，保存发布可信边界

合并其新增 editor、typed-criteria、preset、portability，**特别保护当前主线已有 T01 模型 Provider Main 调用**（`969cb1cb4809`）。更新 `TemplateWizardPanel.tsx` 时比较旧新入口，避免覆盖可用的自然语言模型起草。必须确保：

- 修改阈值取消历史确认；导入外部 JSON 不继承 `ownerStatement` 的“授权签名”；
- 编辑器不以 `FieldSpec.max` 代替规则；
- 现有模板发布机制经 Main 校验新可选 typed clause，旧模板版本不被就地改写；
- 不触碰 Pi/Case/Run writer。

### 4.3 T04 #182：和 T01 按联合合同接入

接收 `review-v3-t04-published-plan.ts`、规则最小增量、定向测试。只在 T01/T04 兼容后把编译器安到真实 published template 路径。保留旧 `compileT04Operation`/旧 V2 `buildDeterministicRuleChecks`；不要新造引擎。

**Main 必须真的做**：从真实 Published TemplateVersion、PolicyStore/OwnerStatement 和案卷已确认字段读取输入；编译一个有全部 bindings 的 CanonicalPlan（含 required-material 检查）；与原件版本和 policy 版次冻结指纹；通过已有 Case/Run writer 把 `evaluateT04Plan(...)` + `toT04CheckResult(...)` 生成的结果保存到**真实 ReviewRunV2**。不得由测试/Renderer 造假的 Plan 或假 Run 填回业务系统。

**尤其注意**：`T04PublishedPlanInput` 是编译输入，不是新的 Main 作者令牌、第二套 PlanStore 或新工作流状态。不能为了走通 UI 删除既有发布权限/plan provenance 门禁；本地模拟 OwnerStatement 与学校正式颁布政策分开。

### 4.4 T03 #184：最后接，先与 main 已做的 D3 修复去重

接入 `review-v3-core-t03-run-gate.ts` + 定向测试，读取它自己的 `T03-RUN-GATE-INTEGRATION-HANDOFF.md`。Main 已在 `36cb1dcd1303` 中做过 Run freshness、per-action readiness/业务模式优化，**不要用 PR #184 的旧 main 基线重写整份 `review-v3-t05-main-service.ts`**。

只补现有 Main 相比新 T03 纯函数确实缺的条件，例如：
- `ReviewRunV2.inputManifest.documentVersions` 与当前 DocumentVersion 版本、内容 hash 的完整匹配；
- `isWorkspaceRunStaleV2` / `computeRunInputHash` 等现有可信快照校验；不要接受 `Renderer.inputSnapshotFresh=true`；
- Run 的 `coverage.plannedChecks/completedChecks/pendingChecks` 和冻结 `PlanBinding→CheckResult.checkId` 集合；没 Run 或 0-check 非人工模板不可能通过；
- `stage-pass` 遇 `non-compliant` 必须阻断，若模板明确允许例外，需 Main 核验 `checkId + policyVersionId + actor + reason`。拒绝/退回不是 stage-pass；无 Run 时可以合法开缺件补件请求，**不能虚构 Run**；
- 每个阶段决定在现有 `submitCommand` CAS 内再次校验，最后复用 T05 `applyT05LocalStageProposal` 追加业务事件；不可建第二套状态机。

对 #184 最新 HEAD 的 CI 失败（同主线 T05 TS2339），L 不必空等：可先做 read-only 对照/本地隔离集成，**未经核验不直接算该提交 CI 绿灯**。若新旧 Main 等价，则复用旧 Main，不为“接入新模块”增加重复抽象。

## 5. A15 启动点与执行顺序

**S1 模板功能已由本地 L 记录 PASS；S3-02 的阶段链已经有 `main@9ebfb0f0f13a` 真实 Run 关联测试提交，但那并不代表 T04 确定性人数 Check 已执行。** 本轮要集中解决 **S2 的真实规则→Run**，再复跑基于它的 S3 与 S4。

1. **S2 必备门槛**：真实已发布的 owner-confirmed 数值约束、T04 编译与 Main 安装、真 DOCX 与版本化 Source、真实 T04 CheckResult 存入当前 Run。18/21/unknown/no-plan 四案例通过后才能写 `S2 PASS`。使用已合入 `work/e2e/a15-fixtures/generate.mjs`，不要重造数据。
2. **S3 回归**：在具名合法本地 reviewer/teacher 身份下，真实 Run 合规 → 初审→终审；21 人规则不合规时拒绝无依据 stage-pass；缺件、首次补件不足、二次补件、新 Run 与旧 Run 不可变都必须保全；不能冒充校方批准。
3. **S4 最后一趟**：真实 Electron 用户 UI（不是仅直接调用后门 IPC）从创建/复用模板到上传原件、一次开始、真实 Check/SourceRef、人工补件/决定、可读报告与冷重启，证据写回**现有 L3 台账**。

- T02 的真实扫描/OCR/PPTX 多格式用户走查属于它独立的最终验收，不阻塞使用普通 DOCX 做 A15。
- A15 **PRODUCT_ACCEPTED** 必须 S1–S4 真机完整通过，不等于原产品所有 F/A 需求完成。
- **如果 S2 失败**，明确写 `BLOCKED_OWNER:T01/T04`（规则身份、谓词、编译器合同）或 `BLOCKED_BRIDGE:Local-L`（Main 安装/Run/来源持久化），附真实函数与最短复现，不要再启动无边界架构调查。

## 6. 本地 Agent 实际操作节奏

```bash
git status --short
git fetch origin
git log -8 --oneline origin/main
git worktree list
# 选择/继续现有安全集成工作树，记录当前集成基线
# 对来源的每个 PR：核 HEAD、merge-base、受影响文件、CI，再独立 git merge --no-ff
# 每个合并与对应的 Bridge 单独提交和记录 SHA，成功的增量可以分批 push main
# 合并冲突以“两个消费者功能均在”为准，绝不整文件强制覆盖
# 验证：相关 Bun 单测 → workspace typecheck / 必要 Electron build → 对应真机验收
node work/e2e/a15-fixtures/generate.mjs
```

**不要误用**：原 R01 十线 B1/B2/B3；不用全部跑百千项测试才继续，但修共享类型后至少真实 typecheck；不让本地 L 替 T01/T04 重写业务编译；也不为了测试通过删除真实审批门禁。**一次性自驱执行，不等待额外人工批准；前四分支的架构合同冲突由各 Owner 小修，本地持续推进不受其阻塞的工作。**

### 每轮必须更新既有 L3 台账的最短回执

```text
Local-L R01: origin/main=<sha>
#181 T02: source=<sha> → merge=<sha> → wired=<sha> → acceptance=...
#183 T01: source=<sha> → merge=<sha> → author/editor=... → CONTRACT=...
#182 T04: source=<sha> → merge=<sha> → compiler/Run=... → CONTRACT=...
#184 T03: source=<sha> → merge=<sha> → existing D3 overlap=... → action gate=...
CI baseline: T05 test TS2339 fixed/reproduced; tests run=...
A15: S1 / S2 / S3 / S4 each status; real RunId / plan fingerprint / source versions / roles
blockers: BLOCKED_OWNER / BLOCKED_BRIDGE with exact missing interface
next: single real executable change, not another investigation
```

**文件引用**：PR #180 架构裁决 R01；PR #183 T01 交接 `T01-T04-PLAN-COMPILATION-HANDOFF.md`；PR #182 T04 交接 `T04-R01-IMPLEMENTATION-HANDOFF.md`；PR #184 T03 交接 `T03-RUN-GATE-INTEGRATION-HANDOFF.md`；PR #181 T02 技术说明；现有 `docs/design/review-agent/acceptance/local-l01/L3-DELIVERY-LEDGER.md` 与 A15 真文件夹。
