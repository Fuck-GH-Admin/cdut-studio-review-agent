# 审核报告：合成科研差旅报销预审样例

- 案卷：glm-final-suite-04-teacher-expense-check-v1-1791407254360
- 阶段：submitted（revision 6）

## 审核依据（运行 run-1791407254565-m262）
- 有效规则集哈希：c0967296a6cf6bb48fe23d41f8d2bbd43c60d21ad8933071387c38579e899e19
- 【经费来源与审批】经费项目与用途（section-authorization-funding-source；semantic；模板 teacher-expense-check-v1@2）
- 【经费来源与审批】事前审批材料（section-authorization-authorization；manual；模板 teacher-expense-check-v1@2）
- 【票据和附件要素】票据字段核对（section-invoice-invoice-elements；semantic；模板 teacher-expense-check-v1@2）
- 【票据和附件要素】票据与事项对应（section-invoice-attachment-link；semantic；模板 teacher-expense-check-v1@2）
- 【金额与预算一致性】金额计算（section-amount-arithmetic；semantic；模板 teacher-expense-check-v1@2）
- 【金额与预算一致性】标准与限额（section-amount-policy-limits；manual；模板 teacher-expense-check-v1@2）
- 【财务复核与结论】会计复核（section-decision-finance-review；manual；模板 teacher-expense-check-v1@2）

## 检查结果（运行 run-1791407254565-m262）
- section-authorization-authorization：awaiting-confirmation——需要人工核对：检查制度要求的事前审批、出差/采购/活动批复是否存在；审批效力由财务或主管人员确认。
- section-amount-policy-limits：awaiting-confirmation——需要人工核对：仅按案卷附带的正式财务制度/批准预算核对限额；制度缺失、年份不明或例外情形转财务人工复核。
- section-decision-finance-review：awaiting-confirmation——需要人工核对：登记财务审核意见、补件要求和审批记录；模型只提供预审提示，不代替付款决定。
- section-authorization-funding-source：awaiting-confirmation——申请摘要载明项目号 TEST-PRJ-02、用途为科研差旅，与案卷字段一致；但案卷未提供负责人信息与所附预算/审批对应材料（approval.md 仅为登记号 TEST-APPROVAL-001，无签批），且申报表自述申报总额与附件汇总不一致（申报 4580 与明细合计 4280 不符），无法确认经费来源与预算信息完整对应，需人工确认并补充负责人及预算批复信息。
- section-invoice-invoice-elements：non-compliant——报销明细中同一票据号 TEST-INV-02 出现两行（各 1400 元，其中一行标注为“住宿重复申报”），构成同一票号重复列支；明细表仅有票号、日期、类型、金额，未见票据抬头、购买方等要素可与报销信息核对；明细日期均在 2026-08 与费用期间一致，但重复票号使金额字段可靠性不成立。
- section-invoice-attachment-link：awaiting-supplement——会议参加记录（2026-08-12 至 2026-08-13，成都市）可支持会议注册费（2026-08-12，800 元）事项；但交通（2026-08-11）与住宿（2026-08-11 起“两晚”）日期早于会议记录起始日，无行程/合同/订单佐证其与本次活动的对应关系，且记录自述未提供原始电子票据验证，按规则形成补件项。
- section-amount-arithmetic：non-compliant——明细行算术关系（680+1400+1400+800=4280）与表内“明细合计 4280”一致；但申报总额 4580 与明细合计 4280 相差 300 元，且案卷中无任何分项或票据能对应该差额，属无法对应数字。同时 TEST-INV-02 重复两行使住宿金额是否应计两次存疑，需剔除重复后由人工复核实际可报金额。

## 事项字段
- 合成事项-经费来源与审批：{"projectCode":"TEST-PRJ-02","totalAmount":4580,"expensePeriod":"2026-08","purpose":"合成科研差旅"}
- 合成事项-票据和附件要素：{"projectCode":"TEST-PRJ-02","totalAmount":4580,"expensePeriod":"2026-08","purpose":"合成科研差旅"}
- 合成事项-金额与预算一致性：{"projectCode":"TEST-PRJ-02","totalAmount":4580,"expensePeriod":"2026-08","purpose":"合成科研差旅"}
- 合成事项-财务复核与结论：{"projectCode":"TEST-PRJ-02","totalAmount":4580,"expensePeriod":"2026-08","purpose":"合成科研差旅"}