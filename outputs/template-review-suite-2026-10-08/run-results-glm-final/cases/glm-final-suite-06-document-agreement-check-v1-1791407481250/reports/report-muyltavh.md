# 审核报告：合成联合测试协议一致性核对样例

- 案卷：glm-final-suite-06-document-agreement-check-v1-1791407481250
- 阶段：submitted（revision 4）

## 审核依据（运行 run-1791407481335-meoc）
- 有效规则集哈希：6091b4a0645a13e15434a5b23fdf03e96ed9908cacfeb748cbad9bda542a777e
- 【文件要求与条款清单】必备要素（section-requirements-required-clauses；semantic；模板 document-agreement-check-v1@2）
- 【文件要求与条款清单】附件与引用（section-requirements-attachments；semantic；模板 document-agreement-check-v1@2）
- 【主体、日期和金额一致性】主体与签署信息（section-consistency-identity；semantic；模板 document-agreement-check-v1@2）
- 【主体、日期和金额一致性】金额/期限/编号一致性（section-consistency-values；semantic；模板 document-agreement-check-v1@2）
- 【签章与人工复核】签署/审批完整性（section-execution-signature；manual；模板 document-agreement-check-v1@2）
- 【签章与人工复核】敏感条款人工审查（section-execution-legal-review；manual；模板 document-agreement-check-v1@2）

## 检查结果（运行 run-1791407481335-meoc）
- section-execution-signature：awaiting-confirmation——需要人工核对：检查签署页、盖章或审批记录是否存在、清晰并覆盖适用主体；签章效力必须人工确认。
- section-execution-legal-review：awaiting-confirmation——需要人工核对：对法律责任、数据保护、知识产权和争议解决等事项提示给授权法务审查，模型不输出法律合规结论。
- section-requirements-required-clauses：awaiting-supplement——案卷内仅有申报摘要（doc-2），未提供本案确认的逐项要求清单及协议完整条款正文，无法逐项记录条款存在、缺失或无法判断；不将模板示例视为法律强制条款。需补充要求清单与协议正文。
- section-requirements-attachments：non-compliant——正文附件清单引用的《测试数据处理说明》未实际附上，附件引用与实际材料不对应，属不符合。
- section-consistency-identity：awaiting-supplement——subject-2 分项无专属可用材料：application.docx 为「文件要求与条款清单」分项专属材料，rules.md 为规则来源而非一致性证据，不得跨分项引用。组织名称、经办人、签署主体和日期一致性缺乏可核对材料，需补充。
- section-consistency-values：awaiting-supplement——subject-2 分项无专属可用材料，不得引用 application.docx（另一分项专属）中正文与附件金额差异作为本分项依据；金额、期限、编号一致性需补充可核对的正文、附件及申请表材料。

## 事项字段
- 合成事项-文件要求与条款清单：{"owner":"合成经办人","counterparty":"合成相对方","documentVersion":"Rev 2"}
- 合成事项-主体、日期和金额一致性：{"owner":"合成经办人","counterparty":"合成相对方","documentVersion":"Rev 2"}
- 合成事项-签章与人工复核：{"owner":"合成经办人","counterparty":"合成相对方","documentVersion":"Rev 2"}