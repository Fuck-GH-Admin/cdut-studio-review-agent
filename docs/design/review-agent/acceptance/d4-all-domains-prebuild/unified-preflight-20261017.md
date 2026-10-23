# CDUT Studio D4｜G01–G08 八领域适配检查统一收口（2026-10-17）

> 性质：对八个**已提交**领域适配报告的只读交叉汇总和工程开工决策，不是第九轮业务调研、正式政策验证、D4 模板产物或 Release 签署。报告只使用各领域固定提交所载结论，并将公共 GAP 去重。不得把其“READY_TO_BUILD”解读为“已经生成全部技术模板/跑过全部业务”。

## 一、统一结论（先给制作负责人）

1. **50 套现有候选完整业务模板均可立即开始 D1/D3 作者态模块制作**：G01 5、G02 3、G03 10、G04 8、G05 6、G06 9、G07 7、G08 2。八份报告一致认为现有 D3 的模块定义/局部语义责任/组合/版本锁/来源绑定/便携导入导出足以承载制作任务；不存在需要重新设计 D3 模块作者态的全域硬阻断。
2. **这些“支持制作”不代表完整 D2/Pi 逐业务对象运行**。八份报告都是静态适配检查，未在本轮制作并运行对应领域全部模板，更没有在这八轮读取隐藏 Gold 或证明模型业务正确率。只有此前 G01-I 单独试点有旧版本运行记录；不能转作其他领域的 PASS。
3. **真正被跨域重复报告的公共运行能力不足，合并为两个优先工程项**：①非学籍通用业务对象及实例级 Check/Subject/证据作用域；②面向这些对象的多条件／互斥＋叠加场景及 TRUE/FALSE/UNKNOWN 三值生效。R1 的 `student-field` 特例不可冒充通用业务对象。
4. 其他能力以“明确需要确定性机器保证”作为触发条件：有权阶段/受控事实事件、有限跨主体证据关系、分项输出投影。财务自动定额、学校正式审批、法律证据真伪和任意 Claim 图**均不是 50 套作者态开工前提**。
5. **执行决定**：八个领域原会话可以直接继续 D4 转换，在各自独立工作树按固定来源生产真实 D1 workspace、局部模块、来源/责任 ledger、已支持部分 D2 编译和受控技术回执。不能无损运行的责任须在同一模板保留并标记 TOOLING_BLOCKED／HUMAN_ONLY／POLICY_HOLD，绝不能删除、静默转换为普通 case Check 或写成“全部已运行”。
6. 另由**一个公共技术维护分支**一次性补齐两项真正共享的运行能力，最小正反例用多个领域验证；不要让八个业务 Agent 各自新增相互冲突的 TargetKind、Agent 内核或 DSL。公共改动与八域制作**并行**，不因此暂停已支持的工作。

## 二、八份原始报告与版本（严格分开，不以当前 main 替代）

| 领域 | 模板数 | 固定审查提交 | 原始报告 |
|---|---:|---|---|
| G01 | 5 | `e6b559ef7ad5547085d7e285f5c2cab114238a48` | [G01 r01](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/e6b559ef7ad5547085d7e285f5c2cab114238a48/docs/design/review-agent/acceptance/d4-g01-prebuild/g01-adaptation-report-r01.md) |
| G02 | 3 | `a08b9fa3eeb0100fa71fcaaaafa3d23e5122c42e` | [G02](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/a08b9fa3eeb0100fa71fcaaaafa3d23e5122c42e/docs/design/review-agent/business-templates/G02/d4-g02-d3-adaptation-check-20261017.md) |
| G03 | 10 | `1f7cb668c1f152288303b092aab307cb2e03e341` | [G03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1f7cb668c1f152288303b092aab307cb2e03e341/docs/design/review-agent/business-templates/G03/d4/2026-10-17-G03-D3-adaptation-preflight.md) |
| G04 | 8 | `d1e52bb9470c3dae8ffffa7620908d804852bf31` | [G04](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/d1e52bb9470c3dae8ffffa7620908d804852bf31/docs/design/review-agent/acceptance/d4-g04-prebuild/G04-D4-adaptation-report-20261017.md) |
| G05 | 6 | `2535c6e7246ff3e4c7a8bd33315cc0283e9f644d` | [G05](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/2535c6e7246ff3e4c7a8bd33315cc0283e9f644d/docs/design/review-agent/acceptance/d4-g05-adaptation-preflight/README.md) |
| G06 | 9 | `5c19a70a1a2541b90ed16e76bfe90bfbc94f70b2` | [G06](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/5c19a70a1a2541b90ed16e76bfe90bfbc94f70b2/docs/design/review-agent/business-templates/G06/adaptation/D4-G06-D3-capability-audit-20261017.md) |
| G07 | 7 | `6ce3773fa1d6648ddfdf917772549107427b5011` | [G07](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/6ce3773fa1d6648ddfdf917772549107427b5011/docs/design/review-agent/business-templates/G07/d4-preflight/G07-D4-D3-adaptation-report-20261017.md) |
| G08 | 2 | `07d80329f4dbb5fa587a01db10f7490563e71a3c` | [G08](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/07d80329f4dbb5fa587a01db10f7490563e71a3c/docs/design/review-agent/business-templates/G08/d4-prebuild/G08-D4-D3-capability-fit-20261017.md) |

以上八份均仅新增适配审计/覆盖索引；未提交八领域生产模板，不应以各领域审查提交冒称原业务 C 作者提交。G04 [PR #86](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/86) 是其中一个独立 Draft；其他报告也可直接按固定 SHA 读取，不以是否有 PR 作为是否完成审查的标准。

## 三、全域去重后的公共技术事项

### P0 / COMMON-01：受控通用业务目标与实例级映射

- 证据：R1 `D2TargetKind` 仅 campus-card、archive-item、archive-operation、student-field；`validateTargets` 对其他 kind 拒绝。档案专用实例化不能泛化到资源、人员、物件、费用行、科研成果、诉求事项。
- 明确出现于 G01(S/P/C 部分)、G02(T01–03)、G03(T01/T02/T03/T12/T06–11)、G04(T01–08)、G05(T01–06)、G06(T01–09)、G07(T01–07)、G08(T02/T03)。G01-I 学籍已由 R1 有限支持，G01-A 档案已有专用对象，不应让其回退。
- 最小定义：显式注册同案多个稳定 `objectKey/subjectId`，仅接受模板声明允许的对象范围及来源；作者 Check/模块使用实例能按匹配目标形成独立 RuleSpec、Subject、SourceBinding、EvidenceLink 和分项结果；重复/悬空/跨对象/零有效责任一律拒止。
- 闭合证据：选择至少**跨两个不同领域**的具体合成反例（如 G03 两个资源时段、G08 两件失物，或 G07 两笔费用）及来源版本错绑负例，真实 D1 保存→D3 携包→D2 实例化→Pi 回执，Check/Subject/SourceRef 不串用；旧 R0/R1 领域回归仍通过。

### P0 / COMMON-02：非学籍目标的有限复合条件及三值生效

- 证据：R1 多 `scenarios[]` 主要是 student-field 专用；非学籍含场景模板仍被单 campus-card＋单 scenario 约束。`applicabilityNote` 只承载说明，不能冒充可执行条件门禁。
- 最小定义：每个有界目标可以选择合法业务主分支及若干叠加条件，标记互斥/并存，来源与版本独立；TRUE/FALSE/UNKNOWN 对该目标的 Check 生效范围可核验；未知不得变不适用/默默删除责任。
- 闭合证据：同案两业务目标具有不同主分支、部分叠加条件；另有条件未知、互斥冲突、源版本变化的负例。现有校园卡单场景、档案分操作、学生字段多情景合同保持兼容。

### P1 / COMMON-03：受控业务阶段和权威事实事件（按需，不自动放权）

- 各报告多次指出：`CaseStage` 是技术审核阶段，不能冒充学校批准、收件、出库、已支付、撤销、档案/成果状态。G02/G05/G07/G08 对阶段材料是否到期尤为敏感。
- 技术候选可优先保留语义审核＋待有权人确认，不需要先接真实 OA。**只有要求程序判定某种正式状态或到期规则时**，提供来源/对象/事件/阶段/生效时间/版本/撤销的受控只读事实，并让未知 fail-closed。
- 禁止将申请人 caseFields、上传的批准文件截图或 R1 的 controlled-synthetic 学籍标识升级为真实学校授权。

### P1 / COMMON-04：有限证据关系和材料合法替代（有实需才补）

- `advanced.*` 非空仍会 `D2_UNMAPPED_ADVANCED`。不要求通用 Claim Graph；多个独立语义 Check、现有 EvidenceLink、人工确认、受控有限 all/any 常可保留原文语义。
- 只有发现具体业务同案跨对象误授权、同一证明错误覆盖另一个事实、旧版本继承、跨主体替代等**当前手段不能正确表示**的责任，才限定补其精确关系，且保留失败最小样例。

### P2 / LOCAL：分项结果/专门业务细节

- G01-A：同一档案件两次相同操作的 `operationId` gate 指派（小型定向补丁）。
- G01-S：批准稿版本×章种×份数与执行动作的正式许可绑定；仅预审差异 Check 不以此为前提。
- G06/G08：逐资产、逐问题的可追溯输出投影优先作为只读业务侧车；无必要不修改 Pi 内核。
- G07：自动精确财务净额/会计结清不纳入 D4 必需范围，先输出待财务确认。
- 本地作者模块不够时由业务领域新增 workspace-local 模块；B01/B02 只是冻结的合成复用样例，不是全域业务政策模块库。不要为追求共享比例强制复用。

## 四、制作准入与具体锁版本风险

| 领域 | 可立即做的制作工作 | 固定原件特别注意 |
|---|---|---|
| G01 | 5 套完整 D1 模板；I 可参考既有 A′，A/C 有现有专用对象，S/P 先语义制作 | 五份 originals 已归仓；I 旧 A、A′ 和 R1 不能混作同一基线；G01-A `certified_copy` 专属责任不能被普通 copy 吞掉 |
| G02 | 3 套 D1 及整案子集 | T03 v0.1/v0.1.1 需选定唯一原件 SHA；校本政策/服务权限待核 |
| G03 | 10 套 D1 及整案子集 | 历史 T04/T05 归 T03 的 V02/V03，不新增独立模板；大部分 C 原文字节在 Library，不在固定技术树 |
| G04 | 8 套 D1 及整案子集 | T06 采用报告中的 v0.1.1 URL 修正版 SHA；其余 C 原文在 Library，须可复取 |
| G05 | 6 套 D1 及整案子集 | 重点保持出行/成员/经费/审批阶段分离，研究原文 SHA 固定后再导入 |
| G06 | 9 套 D1 及整案子集 | 九份原文当前见于 Library；T01 如拟采用新增规则版，须显式升版而不是覆盖 v0.1 |
| G07 | 7 套 D1 及整案子集 | 260 条 R 仅为制作责任分母，不能将自动净额/会计结清当作默认承诺 |
| G08 | T02/T03 两套 D1 及整案子集 | 旧 T01 用印并入 G01-S；T03 R31 的旧版及独立修订版必须由负责人选定一个新制作输入 SHA，不得拼接 |

**当前公共代码选择**：R0 固定 `4b191c729f3d5f8135c73b87c17642023f6c3986`；R1 候选 `94d5ec32b6de1ac0c185b63b4aabfddaa29b1649` 已经专项与全仓 CI 通过，但仍是 Draft 非正式 Release。统一集成**应显式选择且锁定一个技术代码 SHA**供八域本次制作，不可让部分领域随 R0、部分随当前 main、其余随 R1 漂移。为避免重复迁移，建议此次研究性 D4 制作统一采用 R1 固定候选 SHA（标记 experimental/not released），后续通用能力补丁再显式迁移。它不会自动让 G02–G08 的通用对象可用。

**重要原件交接**：除 G01 已在 GitHub 固定原文外，多个领域本次报告所核的业务 Markdown 主体仍存在于 ChatGPT Library/既有原始 ZIP/个人作者分支，不等于生产仓库已经有完整原文。八域制作 Agent 必须先按领域报告中的文件名与 SHA 实际获得**完整字节**；不可只用报告摘要、规则编号重建业务原文。可按用户授权进行受限原件交接，绝不可公开隐藏 Gold/真实受限学校数据；找不到单份原文只挂起该模板，不拖住其他模板。

## 五、给八个制作 Agent 与一个公共修复者的执行界线

- **八域作者从现在就开工**：固定源 → 全部原文业务责任及非 R 条件/例外/输出录入 ledger → 实际 D1 workspace／局部模块／SourceBinding／冻结锁（如复用）→ D3 验证、导出重导入 → 已支持范围 D2 compile/create/Pi 合成待核。业务原文不改，不能靠删 Check 或一律 `caseScopeJustification` 凑完成率。每域独立分支/Draft PR。
- **一个公共开发者仅处理 COMMON-01/02**：先复现不同领域的真实目标/分支阻断，再以最小兼容改动提供新的固定候选 SHA、原本 R0/R1 正反回归与迁移合同；若阶段或证据某细节确实阻碍基本预审，再按具名实例决定是否增补 COMMON-03/04，禁止先设计完整通用审批流程或图数据库。
- **统一集成/本地验收**：合并前先比对每领域原 MD hash、workspace/模块/Check/SourceBinding 完整性和来源权责；再用相同技术 SHA 逐模板编译，检查最低的 Check/Subject/RuleSpec/SourceRef/状态/指纹；实际有能力运行的案例才记录 PASS，其余保持 TOOLING_BLOCKED/POLICY_HOLD/NOT_RUN。最后在本地实际审核入口用既有合成材料跑出可定位结果。之前 A/B/C/D/E 的历史测试资产可用于回归，不因新增技术版本自动废弃，但不宣布已取得学校审批。
- **不再开启第九轮调研或重建五十套 Gold**。研究性证据、功能制作、实际 Pi 技术运行、模型业务准确率和正式行政授权是不同事项；以工程产出推进，而不是让这些边界成为无限追加流程的理由。

## 六、统一集成决策

**GO：50/50 作者态 D4 模块制作。**

**GAP：全域严格逐对象/复合条件的 D2 完整运行；集中补 COMMON-01/02，不让领域 Agent 各自实现。**

**NO CLAIM：没有任何八域适配报告独立完成全部正式业务运行或当前学校行政授权。**

仅此一次整合检查，不宣称替代原 C、D、E 的制度/Gold 业务验收。
