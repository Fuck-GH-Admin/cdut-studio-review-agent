# G05-T03｜E r02 只读受控交接、独立性与复验范围

> D原作者对 `E-G05-E0-002` 的补证；2026-10-15。仅整理证据，不修改Gold或原E r01。

## 原资产冻结对象

- A v0.1：`a7c749c1702c573fc1459344d5885a5928393a629d170ffe384b2f25e37bbf42`。
- B v0.2：`3c4b6201a9857d4e6f89ef57228c291d4795cfdfc84200e7b8b158615b61a128`。
- D INPUT：`0345691064a0f0487dead197fe73d8035e05b0b091813cb326decce0b92c2f08`。
- D EVALUATION（须私有ACL）：`5f7fbdc3411d258f157a72c1345e5e50bbf3d06d929cf92b46b00671f09677b7`。
- D REPORTS：`a0a4d6159cdca31267a43d366e5add424165fcfbf991ec9a55601d3c96025535`。
- 旧Gold索引：`be4daef8e7d1c95aac89e9a3a27560f710967e15ef4c59466e510e3f6eef8442`，28份源文件内容与索引一致，`FROZEN_GOLD_v1`不变。

原Gold manifest自报首次冻结日期 `2026-10-13`（无可靠UTC精确时间证明）。**原D作者仓库commit＝`NOT_AVAILABLE`**，本次公开文档提交不替代原作者commit。G05 E r01冻结HEAD `0d5a1f493b2aeadcc6d65503a433e19a052ae539`仅属审计基线。

## 阅读与访问次序

1. **E0（必须重检）**：取得A/B原字节与3个D原ZIP、各自SHA；管理员授予受控Evaluation对象只读白名单；E2以独立角色真实读取并比对SHA；用无授权测试身份验证拒绝；附ACL快照、对象版本与访问日志。若缺任一步，`ACL_UNVERIFIED`不得关闭。
2. **E1（独立事实复核）**：从A+B及可核官方原文独立核具名项目年度、报名身份、材料触发、批准权范围与待补合法替代；不要以已知Gold或C作者规则推导“正确政策”。本T03未参与T04被暴露聚合信息事件，不借此宣称自身Gold盲性达标。
3. **E2（受控逐案审查）**：由与C/D原作者隔离的独立评审者取得具名授权后审Gold。历史同一会话先制作过C，再形成D：标 `NOT_STRICTLY_INDEPENDENT_OF_C`，独立复核需从A+B官方证据入手。需更正Gold时显式升版留差异，**不能本次D作者按C模板修Gold**。
4. **E3（覆盖与对象边界）**：查一案多项目、合法替代、不适用、政策未知、后置签批与授权结果的分项、证据定位及可信模拟底账注入；未执行产品运行则不得报告准确率。
5. **E4（仅E有权）**：正式缺陷归因与后续复测。禁止修改E r01原裁定，本次D作者不能签E通过。

## 当前需外部执行的验收门禁

| 项 | 现值 |
|---|---|
| `E0_controlled_URI` | `PENDING_ADMIN` |
| `E0_object_version_and_ACL` | `PENDING_ADMIN` |
| `E0_E2_authorized_read` | `NOT_TESTED` |
| `E0_unauthorized_read_denied` | `NOT_TESTED` |
| `E1_source_lock` | `NOT_STARTED_BY_THIS_D` |
| `E2_independent_gold_adjudication` | `NOT_STARTED_BY_THIS_D` |
| `E3_cross_case` | `NOT_STARTED_BY_THIS_D` |
| `E_r02_final_decision` | `NOT_AVAILABLE` |

原D状态 `D_ASSETS_READY_WITH_GAPS`；当前定向问题 `PACKAGE_RECOVERED / ACL_UNVERIFIED`。其余G05模板/当前统一工作树与E0-001/005缺口不是本T03能自行解除的阻断。校本规则未知仍标`SOURCE_PENDING`，不得用外校校规编成都理工大学的拒件标准。

### 禁止归档内容

本目录只允许文本摘要/哈希/需求单。**绝不能提交任何Gold逐案结果、模拟学校私有底账、答案映射、评分脚本或Evaluation ZIP**。真实受控对象URL、ACL成员名单、可用访问令牌只私发E，不公开上仓。
