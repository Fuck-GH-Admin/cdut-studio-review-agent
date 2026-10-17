# 八领域作者态使用合同
## 1. D1 新增字段
- `template.scenarios` 必须含所有可触发分支；`genericScenarioAxes:{primary:[...],conditions:[...]}` 明确其中“每对象互斥选一个”和“每对象全部声明、可叠加”的集合。两组不重叠，均引用已有 ID。
- `template.modules[].scenario` 仍是 D0.5/D3 的激活标识；模块定义不含业务对象身份。复用一条模块生成多个 Check 依靠实例对应的 `sourceBindings[].genericScope`。
- `genericScope:{businessTypes:['g03-resource-slot'], evidenceFacts:['d2:object:g03-resource-slot:scope']}` 精确属于一个 `checkId`。不可把只属于某对象的任务改为无范围 Check；真实整案职责需 `caseScopeJustification`（不少于12字符）。
- 来源至少声明 `sourceId`、性质、核验状态及适用性。选择性分支引用的来源必须有 `reference.documentVersionId`，仅标识该受控技术输入版本，不保证校规合法。
## 2. 案卷选择
- 每个 `generic-object` 有唯一安全 `objectKey`、`subjectId`、`businessType` 和显示标题。对象 ID 使用小写字母开头的字母/数字/连字符，长度不超过80。
- 有场景的模板每对象必须选合法 `scenario`，并给出 `scenarioSource:{sourceId,sourceVersionId,decidedBy:'reviewer'}`。不得使用顶层 `scenario` 或 `scenarios` 冒充逐对象选择。
- 对 `genericScenarioAxes.conditions` **逐项**给出 `id,applicability,sourceId,sourceVersionId,decidedBy`，包括已核实不适用和未知。确定适用/不适用用 `decidedBy:'reviewer'`；未知用 `decidedBy:'undetermined'`。
- 不支持任意布尔 DSL。声明第二个互斥主场景、漏条件、未知来源、错版本、重复 Object 或 Subject 均拒绝编译。
## 3. D2/Pi 运行界线
- 版本 3 计划保留 `targets`、`subjects`、`mapping`、`rules`、`previewFingerprint`、`fingerprint`。同一个 authored Check 对不同对象产生不同 `instanceCheckId` 和 RuleSpec ID；无命中对象/零任务拒止。
- `unknown` 条件仍生成该对象 Check，`applicability:'unknown'` 禁止 Pi 写成 `compliant`、`non-compliant` 或 `not-applicable`。`not-applicable` 仅可写成不适用或待确认。
- 想给任意对象下确定性的 `compliant/non-compliant`，必须在其本人 `subjectId` 上使用现有 `setEvidenceLink` 以 `linkedBy:'user'` 确认具体 `supportsFact` 与有效 `documentVersionId`，且本次 Check 引用该版本；同一文档在另一个对象上必须**另立关联**。上传文档本身绝不是确认。
- `caseFields`、OCR、模型猜测、未经核验的校方制度都不是受控授权。Pi 输出始终属于研究性技术预审，不是审批结论。
## 4. 最小执行
目录中的 `examples/g03-workspace.json`、`g03-selection.json`、`g03-case.json` 是一组可复验合成数据。先验证作者态、固定 D3 携包；再预览 Plan 并由现有 D2 服务注册/建案。请先阅读源码所在分支是否与交接 PR 固定一致；勿使用移动的 main。
