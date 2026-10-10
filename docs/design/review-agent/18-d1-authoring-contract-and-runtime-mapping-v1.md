# D1 · 审核作者态最小数据契约与真实规则映射 v1

> 实现日期：2026-10-11。D0.5 修复分支 `feat/review-d05-agent-semantic-modules` 为基线；D1 开发分支 `feat/review-d1-authoring-contract-v1`。本文记录实际已实现的 D1 技术范围，未提供任何真实学校审批授权。

## 1. 继承 D0.5 的实验结果

D0.5 已证明自然语言模块可独立表达审核责任，并验证固定模块版本、参数/嵌套组合、情景预览和 Agent JSON 操作。已修复：隐藏子分支投影前递归拒止；覆盖回执必须绑定同一 `fingerprint`；父子参数优先级固定。

D1 只把已验证的最小概念提升为**稳定的作者态数据契约（v1）**，不将 D0.5 所有实验细节都固化成广泛 DSL。简单文本不必填写 Claim、Evidence、业务对象关系或 ConditionAST。较复杂业务仍可在作者态保存与预览，但没有精确运行映射时禁止落成“生效的正式审核规则”。

## 2. D1 数据分层（消除双重真相）

| 数据对象 | 作用 | 版本/权限 |
| --- | --- | --- |
| `ReviewAuthoringWorkspaceV1` | 审核模板制作的语义源：模块、引用、模板、责任来源及适用性 | `schemaVersion=1` + 单调 `revision`；只做草稿 |
| `ReviewAuthoringSourceV1` | 描述“用户要求/模拟/外校参考/制度候选”及内容核查状态和引用定位 | `content-checked` **不是** “校本制度已确认、已授权” |
| `ReviewAuthoringSourceBindingV1` | 实例级 `templateId@version:checkId → sourceIds` | 防止同一模块引用到不同业务后误继承制度来源 |
| `ReviewAuthoringManifestV1` | 责任 → criterion → 当前实际 RuleSpec 的 ID、内容摘要、来源、版本与整包指纹 | 仅 `review-candidate` 且 `publicationAllowed=false` |
| `TemplateVersion` / `RuleSpec` | 沿用现有存储/运行时生效标准和 Pi 案卷执行 | 未新建第二审核运行内核；D1 候选不允许正式发布 |
| `ReviewAuthoringRevisionV1` | 配置文件下不可覆盖的草稿历史版本，父摘要链接与操作者标签 | 草稿 `revision` 与发布 `TemplateVersion.version` **不是同一概念** |

主要实现：

- `packages/shared/src/types/review-authoring-v1.ts`：D1 v1 强类型。
- `apps/electron/src/main/lib/review/review-authoring-v1.ts`：来源/责任核验、选择性编译、与 `resolveEffectiveRules` 的逐条真值映射和摘要核验。
- `apps/electron/src/main/lib/review/review-authoring-store-v1.ts`：逐 revision 的文件本地存储，不覆盖历史，不依赖数据库。
- `apps/electron/scripts/review-authoring-v1.ts`：Agent JSON 调用入口，不在 Electron GUI 新建重复真相源。

**注意**：源文件定位采用 `documentVersionId + locator + excerpt?`，是“作者声明的依据定位”，并不是运行时 `SourceRef` 内容哈希已通过核验。D1 的编译器不会把任何 `policy-candidate` 或 `cross-school-reference` 的约束提升为当前可执行的校级硬性要求；需要有权制度治理后方可推进。

## 3. 从一份语义定义到真实 RuleSpec

`compileReviewAuthoringCandidateV1(workspace, templateId, version)` 执行：

1. 校验所有模块与模板结构，逐个情景展开全部 `checkId`，检查每一条有实例级合法来源绑定，阻止悬空、重复、父子冲突和遗漏。
2. 对不具备运行映射的高级 Claim、证据关系、业务角色或复杂嵌套场景进行**明确拒止**；不静默删掉不认识的强制条件。
3. 复用 D0.5 无条件项目的编译器得到 **现有** `TemplateVersion.sections[].criteria`，在每条 requirement 中保留来源性质标记（非制度批准）。
4. 使用现有 `resolveEffectiveRules` 生成真正运行会使用的 `RuleSpec`，逐条核对 `criterion` ID、标题、要求、执行类型、目标范围及总数；任意不一致报 `RULE_TRUTH_MISMATCH`。
5. 返回 `template`（仅 draft，带 `D1_AUTHORING_CANDIDATE` 标记）、`preview`、`manifest`。manifest 绑定作者态完整摘要、模板内容摘要、生效规则集哈希、责任来源和 `previewFingerprint`。
6. `verifyReviewAuthoringManifestV1(template, manifest, workspace)` 可重新验证上面的内容摘要及来源绑定。修改作者语义、模板标准、规则或来源都会让旧 manifest 失效。

现有 `template-store.publishTemplate` 阻止 `D1_AUTHORING_CANDIDATE` 草稿未经制度治理直接发布。**编译通过不代表制度适用被认证**。本轮不改 `TemplateCriterionSpec` 现行运行结构、不绕过 Pi 原本的证据/权限校验。

## 4. 可执行的 Agent 操作

在仓库根目录：

```bash
DOC=docs/design/review-agent/fixtures/d1-authoring-text-v1.json

# 静态校验作者态
bun apps/electron/scripts/review-authoring-v1.ts validate "$DOC"

# 输出完整的旧运行模板候选 + 责任映射；不会调用正式发布
bun apps/electron/scripts/review-authoring-v1.ts candidate "$DOC" text-review 1

# 草稿必须选择隔离目录；此命令仅保存 v1 的不可变作者记录
PROFER_CONFIG_DIR=/tmp/d1-authoring-sandbox \
  bun apps/electron/scripts/review-authoring-v1.ts save "$DOC" 0 author-agent

# 读取刚刚存的不可变历史记录
PROFER_CONFIG_DIR=/tmp/d1-authoring-sandbox \
  bun apps/electron/scripts/review-authoring-v1.ts read d1-text-preview 1

# 差异: 需传入两份同工作区 JSON（v2 revision 增一）
bun apps/electron/scripts/review-authoring-v1.ts diff old.json new.json
```

命令以 JSON 数据为输入，不把 Markdown/模块文本当工具指令。保存的 `authorId` **只是审计标签**，不是真正的身份鉴权或发布资格。用户未明确提供隔离 `PROFER_CONFIG_DIR` 时拒绝通过此脚本写入。

## 5. D1 实际验收边界

- 普通文本作者态只需要明确审核目标、责任、适用范围、来源、完成要求、限制；可编译到现有 Pi 规则。
- C（家属卡/临时人员卡）双情景和 A（档案件 × 查阅/复制）可被作者态结构识别、来源绑定与校验，但**尚不能无损投影到旧 RuleSpec 对象关系与生效条件**；必须拒绝生成假完整模板。这属于 D2 的运行试点，不是 D1 的“失败”。
- 规则来源和可执行判断统一核对，不允许因为模板作者写了一段硬性文字，就自动成为“已验证校规”。
- `advanced` 可选。复杂 Claim/Evidence/角色块即使有数据也不会暗中被忽略，当前 `UNMAPPABLE_ADVANCED` 明确阻断简化编译。
- 不把 “所有局部责任都出结果” 或 “所有来源字段都非空” 冒充真实核验过材料、通过行政审批或实际 Pi 模型行为准确。
- 修订记录支持不可变读取与差异检视；**未实现完整编辑历史撤销/回滚、更换草稿发布版本、跨端权限或签名**。
- D1 与既有 Pi 审核运行的接缝使用确定性类型检查、原规则服务和 sidecar 映射测试；**未让 Pi 实际调用 G01 原始材料完成整轮审核**。

## 6. D2 的前置决定与风险

1. C 的多主体关系和 A 的 `item × operation` 要按有语义的目标绑定现有 `ReviewSubject` 或明确演进运行结构；不能仅在 requirement 文字写 `objectKey`。
2. Claim/Evidence 多对多、AND/OR/替代关系仅在真实业务需要且运行校验/覆盖能够等价表达后启用；不得给全部普通任务强加图式要求。
3. `TemplateCriterionSpec` 对结构化 `when`、`onUnknown` 和政策确认状态能力比 `RuleSpec` 窄。D2 接入正式运行前必须明确两者完整映射，并保留每项必核检查的来源、适用范围、权限。
4. `RuleSpec.confirmation:confirmed` 在当前 `resolveEffectiveRules` 对模板 criterion 自动设置，只表示内部运行结构，不等于校规来源已获确认。D1 坚持候选拒绝正式发布，D2 必须解决这项治理语义分层。
5. 正式回执要把 `previewFingerprint` 与 `ReviewRunV2.inputManifest.hash`、文档版本和真实 `SourceRef` 绑定，不以 D0.5 的模拟覆盖 API 代替正式证据账本。
6. 五份 G01 Markdown 如不在仓库，仍仅以显式合成用例进行压力测试，不据分析文档伪造细则。

**D1 的完成标准是最小数据契约与规则编译映射被实测，不是整套复杂行政模板已经具备正式运行资格。**
