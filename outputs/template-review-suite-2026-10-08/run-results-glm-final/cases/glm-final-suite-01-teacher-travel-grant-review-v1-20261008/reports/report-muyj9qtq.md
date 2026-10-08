# 审核报告：合成学术交流资助申请样例

- 案卷：glm-final-suite-01-teacher-travel-grant-review-v1-20261008
- 阶段：submitted（revision 5）

## 审核依据（运行 run-1791403178435-cds1）
- 有效规则集哈希：9469b6f3122cecc427bf595bb2e501f940ae77125c6ad9d73a87e3d0ecb10728
- 【资格与活动相关性】申请资格（section-eligibility-eligibility；semantic；模板 teacher-travel-grant-review-v1@7）
- 【资格与活动相关性】活动与工作关联（section-eligibility-event-relevance；semantic；模板 teacher-travel-grant-review-v1@7）
- 【邀请、注册与行程】会议/邀请真实性材料（section-invitation-event-proof；semantic；模板 teacher-travel-grant-review-v1@7）
- 【邀请、注册与行程】行程匹配（section-invitation-travel-plan；semantic；模板 teacher-travel-grant-review-v1@7）
- 【差旅预算】预算计算（section-budget-calculation；semantic；模板 teacher-travel-grant-review-v1@7）
- 【差旅预算】标准和可报范围（section-budget-policy；manual；模板 teacher-travel-grant-review-v1@7）
- 【资助评议与成果承诺】资助必要性与预期产出（section-review-review；semantic；模板 teacher-travel-grant-review-v1@7）
- 【资助评议与成果承诺】额度与最终决定（section-review-decision；manual；模板 teacher-travel-grant-review-v1@7）

## 检查结果（运行 run-1791403178435-cds1）
- section-budget-policy：awaiting-confirmation——需要人工核对：按本单位已确认的差旅制度/资助上限核对；不对酒店、票据或报销资格作未授权结论。
- section-review-decision：awaiting-confirmation——需要人工核对：资助金额由有权审批者按当期额度和排序确定；模板不自动审批或发放经费。
- section-eligibility-eligibility：awaiting-supplement——案卷中未见本批次正式资助通知（rules.md 明确：公开差旅报销标准不等于差旅资助申请规则；事前资助要有本年度资助通知、岗位类别与可用额度）。无通知则不认定资助资格，待补正式通知后再核对申请人、活动类型和截止日期。
- section-eligibility-event-relevance：awaiting-supplement——邀请函仅列明活动名称、日期和报告人，未提供会议/交流主题与申请人研究/教学方向的描述，无法核对相关性；待补相关材料。
- section-invitation-event-proof：awaiting-confirmation——邀请函列明邀请单位、活动时间（2026-11-06 至 2026-11-07）和报告人，但材料自述信息完全虚构、未由任何会议主办方发出，真实性无法通过主办方确认，且报告人"合成教师-07"与申请人"合成测试-申请人-1"身份是否一致无法核对；需人工/主办方确认。
- section-review-review：awaiting-confirmation——材料仅记录"预期交流成果：形成一份内部交流纪要"，但没有评审人对活动相关性、资助必要性、申请材料的真实审批意见（材料自述"没有当期资助申请通知、资助额度或真实审批意见"），无法记录评审意见，待人工确认/补件。
- section-budget-calculation：compliant——预算分项核对：往返交通 1×1800=1800 + 住宿 3×520=1560 + 会议注册 1200 + 市内交通 4×50=200，合计 4760，与表内"明细合计 4760"一致，分项和合计计算一致。
- section-invitation-travel-plan：awaiting-supplement——预算表含往返交通（2026-11-04 至 2026-11-08）、住宿 3 晚、会议注册（标注"邀请函列明活动日期"）和市内交通估算值，但案卷中没有独立的行程表（出发地、目的地、逐日日程），仅有活动日期，缺少行程安排无法核对行程与活动日程相符，按规则列为补件。

## 事项字段
- 合成事项-资格与活动相关性：{}
- 合成事项-邀请、注册与行程：{}
- 合成事项-差旅预算：{}
- 合成事项-资助评议与成果承诺：{}