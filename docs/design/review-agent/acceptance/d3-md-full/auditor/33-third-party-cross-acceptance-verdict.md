# 33｜D3-MD-Q1 A/B 双独立 Agent 第三方交叉验收（2026-10-11）

> **结论：Agent A 技术制作回放 PASS；Agent B 独立业务金标结构 PASS；完整 MD→模块化审核的业务质量 = PARTIAL / 尚不可签收。**  
> 本文是第三方审计结论，不授权自动合并 A PR #15、B PR #16、审计 PR #17 或 D3 PR #9，也不授权 D4 完整业务模板或 D5 开工。源 MD 原始字节不上传 GitHub。

## 0. 固定证据与独立性

| 参与者 | 固定 HEAD / PR | 证据 |
| --- | --- | --- |
| D3 公共冻结工具 | `6747de44b1d8b6dcf673750ced96ce2edb1cbfdd` / [#9](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/9) | 始终 Draft，未合入 main |
| Agent A（独立制作） | `f8d95c4f7fe995ee55cbdfe15f16e95f514c0333` / [#15](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/15) | [A 作者专项 #38098830332](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38098830332) success；此 SHA 完整 PR CI success |
| Agent B（独立金标） | `fbf0ee1e072f790e1d7957cfef80d869d6b5aa91` / [#16](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/16) | [B 金标专项 #38110901340](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38110901340) success；此 SHA 完整 PR CI success |
| 第三方审计者 | [审计 Draft PR #17](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/17) | 新 GitHub Actions runner 固定 A/B SHA 并重新执行两者工具，输出 `cross-audit.json`、实际 D2 编译计划、双方日志；第一个执行尝试仅因审计者脚本误以为全部 item target 均有 operation 字段而失败，**作者两方独立的命令早已成功**。审计者更正了自身字段读取并重跑成功，不能混记为作者业务错误 |

统一业务真值源：`g01_archive_utilization_template_editor_spec_v1_5.md`，70,413 字节、725 行，SHA-256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`。第三方在当前会话可访问原始文件并独立复算摘要；**GitHub Actions 无原文，故 CI 只比较作者与金标的固定来源声明，不能说 CI 又验证了一次原始文件**。

## 1. 证据核对后的实际成绩

### Agent A

- D1 revision 1→2 保存、读取、父链摘要与 diff；D3 `validate`、`discover`、export/import 干净目录、规则/来源/对象/摘要对比均通过真实 CLI。
- D2 编译出 **77 个 Check**，落到 **8 个实际目标**（3 档案件、5 利用操作），对应 **R01–R42 中 39 个 R-ID 有编译实例**；不等于 39 条业务语义已无损执行。
- **R24（档案证明出具）、R29（电子授权合法替代）、R40（历史差异与合理替代）没有编译 Check**，在 ledger 中保留工具缺口，没有删去源责任。
- 另有 **12 个 R-ID（R04/R08/R09/R10/R11/R12/R13/R32/R33/R35/R36/R42）**既存在自然语言 Check，又被作者诚实地标记 `tooling-blocked`：复杂关系、三态条件、阶段义务、逐操作复合结果或版本重审**没有证明由运行层无损执行**。不可把这些 R-ID 算成完整运行功能。
- 编译映射 authority 实际计数 **56 个 `unverified-policy`、21 个 `request-scope`**；后者也不等于正式校本制度确认。A 使用 **11 个工作区本地模块、0 个共享冻结引用**：法律上合理，不能强行判为复用失败，但未测真实完整业务复用维护收益。
- A 的 15 个条件分支、14 个材料槽、16 个反误杀例外在源清单中确实存在；`workspaces` 把其中部分内容写进 task 自然语言；**尚无完整的 B/S/E 逐场景运行显式证据**。
- 17 项 Pi 基础合成服务测试来自现有 D2/D3 测试，不是 A 的 77-Check 档案专属 Case/Run；**本次模板的真实 Pi Case/Run/SourceRef 仍 NOT-RUN**。电子证据高级关系有明确 `D2_UNMAPPED_ADVANCED` 拒止。

### Agent B

- 独立审查源：`R01–42`（42） + `B01–15`（15） + `S01–14`（14） + `E01–16`（16） + `P01–16`（16） = **103 项来源责任**。与 A 的 54 项 R+X 账本**采用不同归档粒度**：不能直接断言 A 漏 49 项，必须检查 A 单列的 B/S/E inventories。
- 实际提交 **30 个合成案例**，案例输入与 expected 分开，Oracle 结构检查确认 103 项责任均至少被某个案例引用；**只是案例设计覆盖，不是这些业务行为已经通过审核模型**。
- Gold 事前保持源业务 ID，不填 A Check/Rule/Subject：独立性正确，但也意味着尚无实际 D2/Pi 对接金标。
- B 的 P01–P16 正文原则与 A 的 X01–X12 不同粒度。第三方只产生候选语义关联（如 P05↔X03、P09↔X04/R37、P14↔R42），**这些只是审核线索而不是可执行等价证明**。正式适配必须允许一项对应多 Check/人工门禁/结构约束，不能强迫一条义务一个节点。
- PR #16 描述处仍曾写“28 个案例”，现固定 HEAD 的 `archive-cases.json` / `archive-expectations.json` 与专项测试均实为 **30 个**：仅文案口径小缺陷，按实际数据验收。

## 2. 本次真正发现的 Release 风险（按优先级）

| 优先级 | 真实证据 | 当前判定 / 关闭条件 |
| --- | --- | --- |
| **阻断完整业务质量** | B 的 30 案未有一个通过 A 模板的完整 Pi Case/Run，独立金标对实际 Rule/Check/Subject/证据尚未绑定 | `NOT-RUN`；第三方建立独立适配器、至少优先跑权限串用/阶段误杀/规则版本/材料替代等高风险反例，报告每项 Run 和 SourceRef |
| **阻断全业务可执行完整性** | R24/R29/R40 零编译实例；12 个附有文本 Check 的 R-ID 仍因复杂关系或条件语义而 `tooling-blocked` | 不得把 fail-closed 或文本说明冒充无损功能；若确属 D3/D2 数据结构问题，应返回公共工具开发修复并重测 |
| **阻断独立语义覆盖签署** | B/S/E 45 项在 A inventory 可见，但其触发、材料所属阶段及反例未形成独立运行对照；P 的 16 个正文原则与 X 的 12 个不变量还未逐一裁决 | 形成 103 项源→模块/结构/Check/人工门控→真实用例的细化账本；`source-catalog` count 不是模型理解证据 |
| **来源待核（不妨碍受控合成预审）** | CDUT 最新校本制度、三张原始审批表及馆方权限/签章/保管接口未取得确认 | `BLOCKED-BY-SOURCE`；技术预审与正式学校发布必须分开 |

特别注意：A 现有 `R08` 和 `R33` **各有文本 Check**，不同于此前 B01/B02 六 Check 片段中缺少独立责任的情况。本轮焦点已从“没有 Check”转为“有 Check 但关系/阶段语义未经真实执行证实”，不要沿用上一次片段验收的缺项结论。

## 3. 技术与业务裁定

**D3-MD-Q1 制作能力结论：**

- 技术作者工具可用性：**PASS**（第三方在新配置重新完成 D1/D2/D3 完整命令、指纹、导入导出、已知高级关系拒止）。
- 原文索引完整性：**PARTIAL-PASS 作为来源责任台账**（R01–42/B01–15/S01–14/E01–16 均有记录，P/X 需要适配；原文来源哈希另经本会话复核）。
- 独立金标准备：**PASS（结构与预期用例设计）**，不是模型结果 PASS。
- 复杂条件无损编译/制度权威：**TOOLING-BLOCKED / BLOCKED-BY-SOURCE**，不掩盖。
- 完整业务保真与真实 Pi 案卷：**NOT-RUN；整个 D3-MD-Q1 = PARTIAL、禁止签发完整业务验收**。

## 4. 下轮最短有效验收路径

1. 第三方冻结两 SHA，**不让 A/B 看另一方结果并改写独立金标**；另存 `adapted-independent-gold.json` 和 `103-duty-crosswalk.json`，保留原金标与 A 作者台账不可变。
2. 先对 B 的高风险案例做 8–12 个真实 D2/Pi 合成回执测试：跨操作 read/copy、双重代理、目录公布≠开放、待审批≠申请人缺件、历史更名与电子委托、失效临时校规、混合多件、多次材料版本修订及 `certified_copy` 的正确拒止。与 B 期望对照，保存独立 Case/Run/SourceRef。**不允许仅把 expected JSON 填入 Pi 结果**。
3. 按根因细分：作者模板遗漏→改 A 模板；D3 条件/证据/角色缺口→修 D3/D2 并重新冻结工具；真实校规不明→保留待核。高级关系失败可作为安全拒止 PASS，但完整业务功能仍属于缺口。
4. 通过上述反例并补全必要运行能力后，再跑全部 30 用例和五套 G01 工作的统一验收；PR #9/#15/#16/#17 先保持 Draft，不擅自合并 main 或进入 D5。

**这份审计从未使用自己生成的 gold 覆盖 B 的独立基线，也未宣称真实学校批准或在线模型准确率。**
