# G01-I 技术缺口与最小复现说明

## D3/D2-01：身份业务多轴分支没有合法 D2 target（Blocker）

- 源：v1.7 §3 S01-S13，§7，R001/R002/R014/R020/R025。
- 源码：`review-d2-runtime.ts:78-133` 的 `validateTargets` 仅接受 campus-card/archive-item/archive-operation；含 scenarios 时强制一个 campus-card。
- 复现：把工作区 template.scenarios 设为 ["name-change"]，选择 `scenario:name-change` 与 `targets:[]`，执行 `bun apps/electron/scripts/review-d2-plan.ts preview workspace.json selection.json case.json`，期望 `D2_SCENARIO_SCOPE_REQUIRED`；冒充 campus-card 是不允许的语义降级。
- 影响：两种条件不能形成精确不同 D2 检查集合；当前全案规则会包含不适用规则，必须明确 NOT_APPLICABLE 或待核，不能宣称动态自动路由。
- 责任建议：主 D3/D2 在后续冻结版中引入经测试的 G01-I 对象与多轴条件表达；本分支不修改公共内核。

## D3/D2-02：一证多事实、认可的合法替代不能无损编译（Blocker）

- 源：M02-M05，F07/F09/F20，R007/R014/R015/R020 与 §6。
- 源码：`review-d2-runtime.ts:114-116` 对非空 `workspace.advanced.evidenceRelations` 返回 `D2_UNMAPPED_ADVANCED`。
- 复现：复制 `workspace.json`，添加 `advanced:{claimKeys:["name-old-new"],evidenceRelations:[{claimKey:"name-old-new",requiredSourceIds:["md-original"]}]}`，使用 D2 preview，期望拒止；不能默默丢掉关系。
- 事实标签 `evidence-any` 需要 reviewer-confirmed subject evidenceLink + 当前文档版本；G01-I 没有合法 subject target 时得到 unknown，不能视为证据无效。

## D4-03：申请事实与权威源缺 typed 输入契约（Major）

- 源：F01-F28 与 §4、§5，历史招生底账及授权核验。
- 复现：D2 `compileD2RuntimePlan` 只核 templateId/version、selection/scenario/targets；`caseFields` 不参与分支选择。仅更换 `caseFields.oldName` 不改变计划 fingerprint。
- 当前处理：全部 F 仅为业务审核命题，不声明已创建真实 case field/subject/SourceRef 对照；需经主开发确认可靠的输入适配和权限接口。

## POLICY-04：CDUT 2026 校规、表单与来华研究生交叉规程（Policy hold）

- 源：C01/C02 公开待核、C03 仅 2024 规程存在证据、C04 历史，§13.3。
- 当前处理：全部为 `policy-candidate/unknown`，跨校 E01-E04 为 `cross-school-reference/reference-only`，不升级为当前成都理工强制附件。
- 需要有权部门：签发当期有效文本、表单和权限/审批链；非本 Agent 自动补足。
