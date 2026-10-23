# 03｜G01–G08：50 套冻结候选的实际完整性分层

证据：八域集成 `b68443b23293b4714e61a3b81383d3d3a56434fc` 的 [catalog.json](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b68443b23293b4714e61a3b81383d3d3a56434fc/docs/design/review-agent/acceptance/d4-unified-r01/catalog.json)、50 份各自 manifest 的远端只读逐份检索、8 域代表性 workspace；W1 [review-d4-catalog.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-catalog.ts) 和 `review-d4-unified.test.ts`。**不是独立 Gold、校规或真实 GUI 质量验收。**

## 一、三个不能混淆的分母

- **50/50**：cat 固定了身份、源 Git blob SHA、`sourceSha256`、workspace/manifest 路径与 `candidate-held`。全部 `integrationStatus=NOT_RUN`，catalog `publicationAllowed=false`。
- **技术作者工具**：`review-d4-unified.test.ts` 的断言是 50 项 D1 validation/50 项 D3 transfer，D2 编译测试门槛 **>=45**，而非“50/50 已在真实案卷与模型全执行”。本轮未重跑，记录为历史测试代码/manifest 主张。
- **业务完整性**：原文**每一项独立义务**→Check/Subject/来源/适用性/阶段/必要人审，不是模块总数。源材料有效性、独立 Gold、真实 Provider、多图/Office、校方授权都未在 catalog 中签收。因此目前 **0 套可独立确认为“已经正式校规批准且完整上线”**；这不是说 50 套都无价值。

## 二、逐域与逐模板盘点

| 领域 | 数量 / 全部冻结 candidate ID | manifest 可直接观察的阶段 | 至少一个尚未闭合的具体问题 |
| --- | --- | --- | --- |
| G01 | 5：`g01-archive-utilization`, `g01-special-campus-card`, `g01-student-identity-correction`, `g01-political-procedure`, `g01-special-proof-seal` | 多数 `AUTHOR_CANDIDATE_NOT_YET_EXECUTED`；学籍项 `AUTHOR_CANDIDATE_PENDING_COMMON_RUNTIME` | 档案 v1.5 146 checks 是源义务技术候选，不是校方政策；部分真实 case/runtime 尚未闭合 |
| G02 | 3：`g02-t01-review`, `g02-t02-review`, `g02-t03-review` | 三者 manifest `PARTIAL`，合成 D1/D2/Pi 有历史证据 | 其 C 原始完整 MD 有些是 Library raw、只存 SHA/声明，没有全部原文入当前集成树；政策与授权未确认；T03 版本不能混签旧 E/D |
| G03 | 10：`g03-t01`, `g03-t02`, `g03-t03`, `g03-t06`, `g03-t07`, `g03-t08`, `g03-t09`, `g03-t10`, `g03-t11`, `g03-t12` | 10 份 `GENERATED_NOT_RUN`, `POLICY_HOLD`, `Gold UNTOUCHED` | 有生成 workspace/check/source，但原文责任完整编译与真实教室/后勤部门权限未经证明 |
| G04 | 8：`d4-g04-t01`…`d4-g04-t08` | 全部 `PARTIAL`，校方 authority `NOT_GRANTED`，Gold `NOT_READ` | T01 manifest 明示 BR/F/MS/EV 和阶段/证据不全为独立 gate；合成 pending-only 并非已执行业务裁量 |
| G05 | 6：`g05-t01`…`g05-t06` | 全部 `PARTIAL` / `POLICY_HOLD` / `Gold NOT_ACCESSED` | 跨阶段与复杂证据判定仍需人审/外部来源；合成 Pi pending-only |
| G06 | 9：`g06-t01`…`g06-t09` | 全部 `PARTIAL` / `POLICY_HOLD` / `Gold NOT_RUN` | 跨对象 Claim 与阶段条件不能因 2 Subject / N Check 的技术验证而宣称完整 |
| G07 | 7：`g07-t01`…`g07-t07` | 全部 `PARTIAL`；各模板有明确 knownGaps | T01 的 BR-13…BR-22 明确仅语义留存，未结构化执行；资金/票据/财务事件不能从候选规则推断 |
| G08 | 2：`g08-t02`, `g08-t03` | `READY_FOR_INTEGRATION`、Gold `NOT_READ`、权威 `NOT_VERIFIED` | 合成技术递交可用，失物权属/保管处置由有权部门确认，非发布业务流程 |

### 代表性原始对照及显式缺口

- G01-A manifest：42 个原文 R 规则、50 行字段、15 个模块、146 Check/SourceBinding，正式审批 `false`、Gold `NOT_GENERATED`。由 [manifest](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b68443b23293b4714e61a3b81383d3d3a56434fc/docs/design/review-agent/acceptance/d4-g01-build/A/manifest.json) 定位。
- G02-T01 manifest：源 680 行原始业务 MD、状态 `BUSINESS_MD_DRAFT_WITH_GAPS`，来源可能不在集成树，合成运行、D2 plan 与 Pi 均有历史记录，明确 4 类责任未完成。[manifest](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b68443b23293b4714e61a3b81383d3d3a56434fc/docs/design/review-agent/acceptance/d4-g02-build/T01/manifest.json)。
- G04-T01：`incompleteReasons` 直接承认详细 BR/F/MS/EV、材料阶段适用性**未全部成为结构化 gates**；因此不可用模块/Check 总数作为无损证明。[manifest](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b68443b23293b4714e61a3b81383d3d3a56434fc/docs/design/review-agent/acceptance/d4-g04-build/t01/manifest.json)。
- G07-T01：对 22 条 BR 仅把 12 条作为结构条件轴，BR-13…BR-22 保存在原文语义/来源，另待权威财务确认。是**已声明缺失，不是仅待测试**。[manifest](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b68443b23293b4714e61a3b81383d3d3a56434fc/docs/design/review-agent/acceptance/d4-g07-build/T01/manifest.json)。
- G08-T02：51 规则+6 非数字职责，57 sourceBinding，`PASS_PENDING_ONLY`；`businessSemanticCorrectness=NOT_SIGNED_BY_E`。[manifest](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/b68443b23293b4714e61a3b81383d3d3a56434fc/docs/design/review-agent/acceptance/d4-g08-build/g08-t02/manifest.json)。

## 三、责任遗漏的确定性反例

[32-md-to-modular-template-agent-quality-protocol.md](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/docs/design/review-agent/32-md-to-modular-template-agent-quality-protocol.md) 中档案 v1.5 的 MD-Q1 反例：D3-10 片段只覆盖局部 read/copy；R08 双方代理身份与 R33 等责任遗漏不能靠 JSON 校验通过掩盖。该协议明确：`gate=PASS` 仍强制 `semanticEquivalenceVerified=false`、`completeBusinessTemplateCertified=false`。转换 ledger 的分母必须是原文独立义务及例外，不是 Check 总数或模块数。

## 四、差异与调查边界

各单领域 #89–#96 分支不是 #97 的提交级祖先（见 #133 Git compare）；catalog 固定了来源 blob，但**当前未对 50 份源 MD 做独立逐条语义映射和 per-file tree diff**。部分来源为 Git 外的 Library raw；本轮不读取受限 Gold，也不猜测不存在的学校制度。此处按“候选产物、技术历史主张、业务已签”的三层给出可信分类，不能按源缺失判定代码一定丢失。

## 五、下一阶段具体审查

为每一模板独立维护 `original obligation ID + locator → D1 task/use → sourceBinding → D2 mapping/subject/gate → fixture + run → independent business decision`；所有原文非 R 义务单独记账。优先取 G04-T01、G07-T01、G02-T03、G03-T01 和 G01-A 进行反例，不必先改生产代码。收集单领域与集成的 Git blob 精确差分，若出现 #133 未收录的独有分支资产，独立建 2D 差分附录，不回改旧总账。
