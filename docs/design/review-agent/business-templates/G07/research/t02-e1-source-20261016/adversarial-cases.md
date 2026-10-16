# G07-T02｜中性最小事实差分案例（封闭模拟，不含 D Gold）

> 本案例专门跟随同批次 `independent-source-register.md`。**S=全部 A/B 案情都是虚构且只改一个显式 `changedFact`，不是成都理工大学真实审批案例；F=引用的学校文本确有该类规定但限对应年份与范围；U=现行政策、角色与金额未核的部分。**
> 严格独立性限制：同一会话历史已接触 G07 C 语义，这一轮不访问 C/D 但**不得署名为全新首次盲审**。以下不包含任何 C 漏项位置、模拟测试答案或 D Gold。预期仅是研究性“材料/路由/待审批”状态，不是正式 E2 结论。

## 设计纪律

- 每个 A/B 都固定 `sharedFacts`，只有一个 `changedFact.key` 改为 A/B 两值；不暗中改变住宿类型、发生费用、审批、人物、时间及证据真实性。
- 对真实校规已核 F 的条件仅写其适用范围；证据未到/权限未知为 U，不给强制否决。
- 单一校发条款“不适用”≠“其他制度禁止”，关键是审查一个可反驳的政策适用假设。
- 另标 `admissibleAlternatives`，只有当前校方明确认可等效证据时才可作为真实办事替代。

### AC-T02-01｜G07-T02-E1-01

- **dutyId**：`G07-T02-E1-01`；**sourceLocator**：SRC-01:p5条目6；SRC-02:p3,p12；SRC-06:2025-07。
- **applicability**：成都理工大学2025及2026待确认的国内出差，封闭虚构同一项目工作行程。
- **sharedFacts（S）**：均为同一科研教学工作人员、已实际出差、真实票据和审批齐全、相同路线与日期。仅资金性质变化。
- **changedFact（唯一）**：`funding_class`，A=`research`，B=`nonresearch`。除这一项外所有事实固定。
- **expectedDecision**：A→适用科研差旅文件和科研审批/额度路径；逐项预审；B→适用非科研路径，2025〔33〕全文不足则POLICY_SCOPE_UNKNOWN；不能沿用科研补贴额。
- **admissibleAlternatives**：项目属于混合经费则按明细资金来源拆行；真实项目属性须权威查。
- **evidenceAnchors**：2025清单第6项科研与非科研分栏；报销手册p3/p12。
- **failureMode（可证伪风险）**：因申报人身份一样而把两种经费准则混用。
- **confidence**：F for 2025分类；U for完整2026非科研限额。
- **unresolved**：资金项目财政属性与2025〔33〕正式版本。

### AC-T02-02｜G07-T02-E1-04

- **dutyId**：`G07-T02-E1-04`；**sourceLocator**：SRC-01:p5科研③；SRC-02:p12科研⑶。
- **applicability**：封闭模拟科研出差赴同一会议，已完成校内事前审批及所有其他票据。
- **sharedFacts（S）**：本人实际参加同一正式学术会议，申报日期/金额/交通住宿票据不变。
- **changedFact（唯一）**：`official_conference_notice_attached`，A=`true`，B=`false`。除这一项外所有事实固定。
- **expectedDecision**：A→会议通知证据满足本项的材料基础，可继续核事实；B→所触发的会议通知材料待补或查有权等价通知，不全案自动拒件。
- **admissibleAlternatives**：组织方官方邮件/公告或可信会议注册记录是否等效，需校方或规则认可。
- **evidenceAnchors**：2025清单科研③；手册科研⑶。
- **failureMode（可证伪风险）**：所有科研出差都强索会议通知，或实际参会却完全不检查。
- **confidence**：F for 2025材料触发，S for两案。
- **unresolved**：当期可信电子会议通知等效路径。

### AC-T02-03｜G07-T02-E1-07

- **dutyId**：`G07-T02-E1-07`；**sourceLocator**：SRC-03:2024〔20〕第7条；SRC-02:p12科研⑸。
- **applicability**：科研出差，交通票据丢失，有真实旅行证据、明确无票原因和项目负责人已签说明。
- **sharedFacts（S）**：路线、旅费、订单及支付记录、遗失原因、负责人的签字均不变，仅学院审批回执从有效变为未完成。
- **changedFact（唯一）**：`college_approval_state`，A=`approved`，B=`pending`。除这一项外所有事实固定。
- **expectedDecision**：A→该条特定交通票据补充佐证达到学院审批条件；仍核费用真实性；B→AUTHORITY_PENDING；不能以只有项目负责人签字当完整授权。
- **admissibleAlternatives**：有权正式电子OA批准可替代纸面签章（仅在校方认可时）。
- **evidenceAnchors**：2024第7条；2025手册p12。
- **failureMode（可证伪风险）**：把项目负责人和学院批准合并为一个签名节点。
- **confidence**：HIGH for official scope; 2017原办法全文U。
- **unresolved**：2026智能报销批准节点ID。

### AC-T02-04｜G07-T02-E1-08

- **dutyId**：`G07-T02-E1-08`；**sourceLocator**：SRC-03:2024〔20〕第7条；SRC-02:p12科研⑸。
- **applicability**：科研项目成员野外艰苦地区通过帐篷/民家住宿，客观无法取得规范票据。
- **sharedFacts（S）**：同一人同一真实野外任务、住宿安排、未出票原因、项目负责人签字及学院正式审批。只变更说明是否含可核验真实住宿时空事实。
- **changedFact（唯一）**：`explanation_has_verifiable_trip_lodging_facts`，A=`true`，B=`false`。除这一项外所有事实固定。
- **expectedDecision**：A→作为野外无票据佐证具备事实基础，待财务审核；B→NEEDS_SUPPLEMENT/HUMAN_REVIEW：形式上签批不能填补未说明何处何时住宿。
- **admissibleAlternatives**：项目野外日志、任务书、接待单位记录，可作事实支撑但须有权认可。
- **evidenceAnchors**：2024第7条；2025手册科研⑸；2026风险提示真实性。
- **failureMode（可证伪风险）**：只识别签名图像无条件视为已证实住宿与花费。
- **confidence**：F for存在条件性佐证；S for具体事实要求。
- **unresolved**：费用核销金额凭何种凭据确定。

### AC-T02-05｜G07-T02-E1-09

- **dutyId**：`G07-T02-E1-09`；**sourceLocator**：SRC-01:p5科研④(3)；SRC-02:p12科研⑸；SRC-03:2024校发第7条。
- **applicability**：科研人员同样在亲属以外的民家临时住宿且无法开票，项目和学院审批都齐全，金额/日期/材料相同。
- **sharedFacts（S）**：只有住宿所在地是否符合『野外艰苦地区』变化；其余条件同，包括同一民家住宿形式、付款事实和审批，均合成。
- **changedFact（唯一）**：`lodging_is_rugged_field_area`，A=`true`，B=`false`。除这一项外所有事实固定。
- **expectedDecision**：A→明确命中2024校发第7条特殊住宿佐证条件；仍不是自动批准住宿费；B→该条的野外条件不成立；2025简表省略限定不能自动扩展，POLICY_CLARIFICATION_REQUIRED，亦不能据此证明所有其他合法例外不存在。
- **admissibleAlternatives**：若存在更新校发/有权解释允许非野外等效材料，B可合法继续审核，必须出示具体生效依据。
- **evidenceAnchors**：2024校发第7条检索摘录；2025手册p12；2025清单p5。
- **failureMode（可证伪风险）**：忽略正式文件的野外限制，或逆向把该条不适用等于整笔费用绝对不可核销。
- **confidence**：HIGH for policy-text discrepancy, MEDIUM for actual source full-PDF visual verification。
- **unresolved**：2017完整原文、是否有2025/2026有权扩展解释。

### AC-T02-06｜G07-T02-E1-06

- **dutyId**：`G07-T02-E1-06`；**sourceLocator**：SRC-01:p5科研④(2)。
- **applicability**：科研出差由同一合作单位免费安排相同日数住宿，其他交通/参会材料齐全。
- **sharedFacts（S）**：住宿确属合作单位免费提供且真实发生，本人未付房费。仅接待单位住宿证明是否加盖真实公章改变。
- **changedFact（唯一）**：`host_lodging_letter_seal_verified`，A=`true`，B=`false`。除这一项外所有事实固定。
- **expectedDecision**：A→具备2025清单对应的免费住宿证明入口；住宿自付金额零，其他费用独立审核；B→接待方责任佐证待补或获取可信电子记录；不因无住宿发票而指控未出差。
- **admissibleAlternatives**：可获得经授权单位住房系统记录时是否等效须由校方确认。
- **evidenceAnchors**：2025清单科研④(2)。
- **failureMode（可证伪风险）**：把对方免费提供住宿错误算作申请人有实际付费住房。
- **confidence**：F for statement about stamped proof; S for facts。
- **unresolved**：补助是否受免费住宿影响、接受的电子凭证。

### AC-T02-07｜G07-T02-E1-05

- **dutyId**：`G07-T02-E1-05`；**sourceLocator**：SRC-01:p5科研④(1)；SRC-02:p12科研⑷。
- **applicability**：同一科研差旅租住民房，税务票据、协议、收款和支付记录均已具备。
- **sharedFacts（S）**：所有证据、出租人身份及费用不变，只变更『出租人身份证材料已在有权受控区提交』布尔值。
- **changedFact（唯一）**：`landlord_identity_evidence_available_to_authorized_reviewer`，A=`true`，B=`false`。除这一项外所有事实固定。
- **expectedDecision**：A→2025清单列举的身份材料项可由有权限审核者检查；仍须看其它材料与现行隐私规则；B→该材料条件待校方核实适当替代及权限；不得要求上传房东证件到公有审查项目。
- **admissibleAlternatives**：经授权电子核验、依法认可的掩码材料需正式认可后才算等效。
- **evidenceAnchors**：2025清单科研④(1)；2025手册p12。
- **failureMode（可证伪风险）**：过度收集私人证件，或把学生无法访问敏感身份证定为欺诈。
- **confidence**：F for 2025 checklist; U for 2026 equivalence。
- **unresolved**：数据最小化、电子身份证明及授权保管方式。

### AC-T02-08｜G07-T02-E1-10

- **dutyId**：`G07-T02-E1-10`；**sourceLocator**：SRC-01:p14条目30。
- **applicability**：同一差旅丢失正式票据，订单/支付截图与当事人签名说明齐全，其他出差批准齐全。
- **sharedFacts（S）**：只有线上差旅票据丢失事项的正式审批是否完成变化。
- **changedFact（唯一）**：`lost_ticket_approval_state`，A=`approved`，B=`pending`。除这一项外所有事实固定。
- **expectedDecision**：A→2025特定失票专项审批链完成，可继续其他真实性核验；B→AUTHORITY_PENDING；齐全截图不能替代有权审批，更非财务最终付款。
- **admissibleAlternatives**：2026智能流程若更名则需相应可信审批回执，不限纸面旧名称。
- **evidenceAnchors**：2025清单p14订单/支付截图及签字说明；科研⑥。
- **failureMode（可证伪风险）**：订单截图和支付截图直接视为已批准报销。
- **confidence**：F for old application materials; U for new system node。
- **unresolved**：2026操作界面、是否仍需专项审批。

### AC-T02-09｜G07-T02-E1-13

- **dutyId**：`G07-T02-E1-13`；**sourceLocator**：SRC-07:2026开账通知第4项。
- **applicability**：2026年1月15日以后同一校内教职工报销，真实费用与审批齐全。
- **sharedFacts（S）**：只变更申报途径：一个使用智能报销，另一个只上传旧网报纸质预约单，其他所有事实不变。
- **changedFact（唯一）**：`submitted_channel`，A=`smart_reimbursement`，B=`legacy_appointment_paper_only`。除这一项外所有事实固定。
- **expectedDecision**：A→符合2026原则上的系统入口，可进行后续材料核对；B→WORKFLOW_ROUTE_REVIEW：原则不再使用旧预约；若特殊线下例外存在，应由财务确认，不能自动假称纸单无效。
- **admissibleAlternatives**：有权例外线下通道必须有2026正式凭据。
- **evidenceAnchors**：2026开账通知关于原则不再使用旧系统。
- **failureMode（可证伪风险）**：沿用2025清单把打印旧预约单作2026全员强制。
- **confidence**：HIGH official 2026 notice。
- **unresolved**：特殊业务人工受理范围。

### AC-T02-10｜G07-T02-E1-14

- **dutyId**：`G07-T02-E1-14`；**sourceLocator**：SRC-08:2026风险防范提示差旅事项。
- **applicability**：同一真实科研出差及全部费用，材料完备、金额相同。
- **sharedFacts（S）**：仅历史已生效报销事实是否有同一成本份额重复领取发生变化。
- **changedFact（唯一）**：`same_cost_share_already_reimbursed`，A=`false`，B=`true`。除这一项外所有事实固定。
- **expectedDecision**：A→若有权财务系统证实未被报销，可继续核其他条件；B→明确已核销相同成本份额不得再按同一份额付费；按真正重叠部分核减并转财务。
- **admissibleAlternatives**：不同费用行或依法有分摊，不可一票出现两次就认定全额重复。
- **evidenceAnchors**：2026财务处风险防范提示第70–80行。
- **failureMode（可证伪风险）**：只有PDF相同判为全额重复，或根本不查已核销历史。
- **confidence**：HIGH for risk advisory; not a full accounting execution model。
- **unresolved**：有权实时财务历史是否可访问。

### AC-T02-11｜G07-T02-E1-20

- **dutyId**：`G07-T02-E1-20`；**sourceLocator**：SRC-04完整2017办法未取得；SRC-06公布人员级别摘要。
- **applicability**：同一真实科研团队成员、行程与住宿票据，身份全部真实并能由校内核验。
- **sharedFacts（S）**：唯一改动旅行人身份为在籍学生/已聘教职工；经费及实际任务授权保持相同，属于模拟。
- **changedFact（唯一）**：`traveler_status`，A=`in_school_student`，B=`employee`。除这一项外所有事实固定。
- **expectedDecision**：A→ELIGIBILITY_PENDING：尚需按有效科研差旅办法/任务书核准，不能仅因学生身份否决或放行；B→按有效职级和科研任务确认待遇；不能把教师等级自动归给学生。
- **admissibleAlternatives**：真实项目合同可能授权特定学生，但必须有权依据。
- **evidenceAnchors**：科研标准网址及2017办法索引；原规范缺失。
- **failureMode（可证伪风险）**：将『其他人员』直接推导成所有学生可领同等补助，或一概排除学生。
- **confidence**：U for detailed current eligibility。
- **unresolved**：2017完整条款、学籍/身份和项目授权。

## 反向解释检验（不靠已知作者错误挑题）

1. **2025简表措辞更宽，2024校发与2025手册更窄**：若校财务处有生效于2025/2026、明确覆盖非野外城市住宿客观无票的正式解释，则 AC-T02-05 的 B 可能有合法入口；反之不得因简表省略短语就推定 B 被制度承认。
2. **2024校发明确野外条件，不代表其他所有住宿制度均自动禁止例外**：第七条的专门例外不适用，只能输出 `POLICY_CLARIFICATION_REQUIRED`，不是高置信拒件。
3. **“票据丢失”与“从未开具”不同**：AC-T02-08 的订单/支付截图是失票事项申请资料；它不能不加证明地替代住房费发票或在所有无票情形中合法通用。
4. **“对方安排免费住宿”与“自行付费民宿无票”不同**：同一没有酒店税票的外观，不得抹掉是否实际承担住宿费的事实。
5. **2026系统改革改变材料动作时点，不等于校方放弃财务核实**：旧纸单可能存在过渡例外，需看当期有权流程记录。
6. **学生/教师等身份不是资金属性的替代判定**：科研项目归属、项目任务、本人身份及可领额度都要权威证据，不按一般印象套用。

### 子会话最终状态

`SOURCE_RESEARCH_ONLY / CASES_SYNTHETIC / INDEPENDENCE_CONTAMINATED_BY_EARLIER_CHAT`。公开案例不含真实受控材料，不得转作正式 Gold，也不包含任何 C 规则或 D 答案。
