# 34｜D3-MD-Q1 第三方 Phase 2：103 项责任映射、真实 Pi 守卫、动态对象实例化验证

> **判断：真实 Pi 工具层安全边界 PASS；完整独立金标的业务语义 0/30 已评分（仍 NOT-RUN）；A 原始作者态仅是固定八目标的候选快照；独立作者侧动态实例化 PoC 能编译多数可表示操作，不能替代作者交付或 D3 正式能力声明。**
>
> 审计代码、构建样本、运行证据均在独立 [PR #17](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/17)，公共 D3 不变，A [#15](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/15) 和 B [#16](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/16) 均未修改；当前全部保留 Draft。详情与初审参照 [33 号](33-third-party-cross-acceptance-verdict.md)。

## 1. 固定基线和本轮新增工具

- D3 主开发 SHA：`6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`。
- 作者 A 固定 SHA：`f8d95c4f7fe995ee55cbdfe15f16e95f514c0333`；金标 B 固定 SHA：`fbf0ee1e072f790e1d7957cfef80d869d6b5aa91`。
- `third_party_md_cross_audit.py`：实际 A D2 计划编译后，生成完整 103 项 `sourceDutyCrosswalk`，其中包含源定位/锚点、B 案例编号、作者状态、实际 Check/Rule/Subject/SourceIds/authority/gap、作者原文任务文本中出现的 B/S/E 编号及 P→X/R 候选联系。每条 `businessSemanticEquivalenceCertified=false`。
- `pi-high-risk-probe.test.ts`：使用 B **只含输入、不含 expected** 的 Q02/Q11/Q13/Q20 合成材料，创建 A 实际技术案卷、注册材料、Read-only EvidenceLink、真实 Pi Run/SourceRef，执行错误 Copy 合格尝试、对象隔离检查与全部 77 条 pending-only 工具回执。
- `score_real_pi_guard_results.py`：在**测试运行完成后**才读取 B 期望文件，验证实际 Run/SourceRef、数量、错误的复制授权被拒、逐操作拒止与来源/主体边界；绝不对未执行的语义推理打金标合格分。
- `dynamic-case-adapter.test.ts`：**第三方专门创建的实验工具**，将 A 工作区已有的本地模块定义按 B 输入中实际档案件与操作生成不同 use instances 和独立 SourceBinding，再执行真实 D1 校验/D2 编译。该工具不属于 A 原始交付，不修改公共代码、源材料或 B 的金标。

所有原始日志、实际 D2 plan、可携包重导入、`cross-audit.json`、四个 Run 回执、金标工具层评分与动态编译结果均由第三方 GitHub Actions `d3-md-q1-third-party-audit` 上传为 artifact；带 A/B 固定 SHA；无真实用户档案、无原私有 MD、无生产校规授权。

## 2. 逐项对账成果：103 ≠ 103 个可执行 Check

| 责任来源 | 第三方当前证据 | **不得推出** |
| --- | --- | --- |
| R01–R42（42 条） | **39 条有实际编译 Check**，对应 A D2 共 77 条 Check；**15 条标注 tooling-blocked**，其中 3 条 R24/R29/R40 无编译 Check，其余 12 条仅有未证实结构语义的文本 Check | 不等于 39 条无损执行、也不等于仅有 3 个漏洞 |
| B01–B15（15 分支） | A 具名 inventory，映射到 RuleSpec 文本时只计算`Bxx` 文字引用 | 不等于条件树已按 true/false/unknown 运行 |
| S01–S14（14 证据槽） | A 具名 inventory、来源与阶段提示词文字 | 不等于激活条件、提供者、requiredAt 或替代材料被系统无损执行 |
| E01–E16（16 个反误杀例外） | A 独立 inventory；B/S/E 共 45 项中 **43 项出现在实际编译 Check 的任务文字里；2 项 E03、E13 只有 inventory** | 没有文字引用不表示完全没人理解；但 E03 合法电子委托、E13 电子证明合法替代恰与 R29/R40 的高级替代缺口相符，应列显式重点问题 |
| P01–P16（16 正文独立不变量） | A 对应的 X01–X12 加 Rxx，只建立**候选对照**及可见 Check/Gap；不同粒度不能按序号硬对应 | 不证明全部正式交付、角色及材料时点约束有运行门禁 |

**全源追溯的结构证据已齐；当前“已验证等价的业务责任”仍不能填 103/103。** 可以用该表指导修复而不能把它用于成功率宣传。

## 3. 真正调用了 Pi，但没有冒充在线审核

执行 B 的四份合成**输入**：`Q02`（查阅≠复制），`Q11`（跨档案及委托范围），`Q13`（公开目录/隐私与开放限制），`Q20`（混合档案件及操作）。

- 每案使用**A 的完整原始八目标 77-Check 技术计划**；真实 `createD2TechnicalCase` + 合成文本 `registerMaterial` + 对 `i01/read` 的 `setEvidenceLink` + `preparePiReviewRunV2` + `submitPiReviewResultV2` + `verifyD2PiRun`。
- 共 **4 个真实技术 Case/Run、308 个实际 Pi 检查回执**，每一条都是 `awaiting-confirmation`（待核），而非模型对业务细节的独立判断；所有正式制度和复制许可仍未确认。
- 每次尝试借用只关联查阅的材料，将 `i01/copy` 判 `compliant`，均被真实 Pi 服务拒止；同时 `validateD2OperationEvidence` 对不同操作、不同档案件返回具体拒止；真实 SourceRef/Run ID 和拒止理由存于 artifact。
- 这些测试证明现有 Pi 的**若干基本安全守卫**可执行，不证明 B 的 Q02/Q11/Q13/Q20 **完整业务结论**被正确计算；B 的 `expected.operationResults`、阶段激活、电子替代、组合授权尚未被执行比较，**独立金标成绩依旧 0/30**。合成工具回执标为 `syntheticToolReceipt=true`、`onlineModelRun=not-run`。

## 4. 动态档案件与操作：定位到作者实例化缺口，而不是立即推翻 D3

- A 的原始工作区把 `i01/i02/i03` 和 `i01/read`、`i01/copy`、`i02/read`、`i03/borrow`、`i03/excerpt` 固定写在模板 uses 里。B Q02 实际只有一个档案件的查阅+复制。直接删除 A 的无关目标后运行原 workspace 的 D2 编译，得到**真实 `D2_SCOPE_MISSING` 拒止**。**这是有效 fail-closed，也是 A 当前产物不具备动态按案生成能力的证据。**
- 第三方额外构造**只供探索**的作者态实例化适配器，使用 A 现有 module definitions，根据 B `archiveItems/operations` 生成每案目标与实例，给每个新 Check 独立 SourceBinding，不改变原校规权威。该测试的真实 D1 validate 与 D2 compile 在 CI 执行。
- 输入操作 `view` 映射为 D2 `read`，`borrow_original` 映射为 D2 `borrow`；两者要在正式契约明确，否则是潜在语义混淆。`certified_copy` **没有对应 D2 操作**，必须明确报 `UNSUPPORTED_OPERATION`，不能当普通 copy 处理。一次申请内同件同类操作若有两个不同 operationId，该 PoC 会拒绝对象键碰撞；该情形仍需业务稳定键设计。
- 此实验**只能证明结构上存在作者侧动态实例化路线**，不能回填 A 的 ledger 或声称 Agent A 原本制作了通用模板，更不能代替真实 B 案例按条件选择激活规则、对证据进行自动审核。

## 5. 下一轮必须转化为正式制作规范的事项

1. **作者侧 schema/实例化契约**：区分“复用的规则模块定义”和“某一 Case 的对象实例”；通过明确 ID`case/item/operationId` 生成 uses/SourceBindings/targets。默认不得偷偷添加模板里演示的其他目标；缺对象应拒止，不能用固定 demo 代替输入。
2. **动态范围契约**：证明一个档案件的多操作、多档案件混合、一个档案件同操作多次带不同范围、并发单位+私人委托均不串用。同一 SourceRef 可以被复用但必须逐操作显式确认。
3. **操作词表与模板责任区分**：支持/分流 `certified_copy`、`borrow_original`、`view` 等源业务操作；正式证明出具仍有外部权威门禁，禁止复用普通 `copy`。
4. **实质语义引擎**：条件三态、材料 requiredAt/提供者、电子授权 OR 与合法替代、可信批准、部分符合与冲突并存、版本重审。编译文本 Check ≠ 结构化可执行检查。
5. **独立金标真实评分**：以上结构支持后，用 B 全套 Q01–Q30 自主业务核验（不能由测试脚本把 Gold 预设状态提交），保存每一 Case/Run/SourceRef、禁止误判及失败归因。先把 Q02/Q11/Q13/Q20 走全业务目标图；拒止或待核若属于校规未知要区分正确保守与误杀。

## 6. Release 裁定

- **A 制作/导入/编译技术质量：PASS。**
- **第三方来源义务追溯：PASS（索引+真实 Check/Source/Subject 映射），语义保真仍待执行。**
- **真实 Pi 合成回执与权限守卫：PASS（狭义、非在线模型，非金标）。**
- **通用动态模板：原 A 产物 FAIL/NOT-SUPPORTED（固定 uses）；第三方实验支持可行路线，但不是 A 正式成果。**
- **原业务 103 项全量语义无损 + 30 案金标准确率：NOT-RUN / TOOLING-BLOCKED，整体 D3-MD-Q1 仍 PARTIAL。**

不合并 PR #9/#15/#16/#17，不启动 D5。下一次返工应首先让作者侧可动态实例化并可绑定独立真实业务对象，然后再对 B 的高风险案例做完整语义验收。
