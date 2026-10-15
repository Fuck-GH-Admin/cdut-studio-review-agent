# G04 r02｜E2 定向交叉复验（仅公开可验证部分）

## T01｜已找到原C，不等于Gold通过
- 原r01 E0-C = NOT_FOUND。r02从ChatGPT Library取回C-v0.1原ZIP SHA d9aa139ecc9e7630d2b73f370183cf0332fd323170564ad5549cf30ab03f92bd，与C作者恢复ZIP内嵌原ZIP字节完全相等；原ZIP成员9/9完整、ZIP CRC通过。
- C主文 SHA 54ce879cacd4895da0dd746a65579098569b513c1166e0f8fd828dd39bf17efb，规则矩阵CSV SHA 4dd8e7e89b8459d7065c5868016047e493800a7a758fd53ed1eb6f7c2d620f56。CSV实际40行，母版可识别 R-01..R-40、BR-01..BR-13、S01..S29；内容在当前恢复中未改。
- 抽核业务边界：门点审批粒度为人员×门点×动作×有效时段；T01物理门禁与T03安全培训、T02校门访客、T05专项危险操作及T07施工动火分开；正式批准与设备写入结果分阶段；校本校区/责任人政策未知为LOCAL_RULE_UNKNOWN；审批后签章/回执不可当首次申报必交。以上仅证明C文档表述存在，不是每条规则都经官方原始材料独立证实。
- 原C支持培训先行/经有权明确允许宽限/无要求的三分支，但**没有取得适用CDUT所有门点的原始有效配套规定**；不得将C条件轴当成本校已生效政策。
- T01 D共24案，原Gold zip整包SHA与r01一致；**ACL证据仍缺，r02不打开Gold预期，不做C↔Gold逐案语义判定**。T01 E2结果仅C_STRUCTURE_VERIFIED / TEMPLATE_FIDELITY_PARTIAL / GOLD_RETEST_BLOCKED_INPUT。

## T06｜E-G04-T06-0004限定缺陷复验
- 独立读取旧C v0.1（主文SHA 1dba3e36f83efe3553ff1103aa199e4d7dc17acf2b196707a43289a981e2a9da）和新C v0.1.1（主文SHA d9c459f23bfdae097b6fa2a71700f0c10391bd9ffa63e8b387325db08cece0c2），逐行比对均为1087行；仅1023—1029七行发生变化，其他1080行字节对应文本一致。
- 新MD CD04–CD10七条 https URL全部与固定B02来源索引相同；Markdown链接语法满足[原文](https://...)，来源限制说明回到正确的第4表列。不存在通过放宽R-37..R-48、重写D预期或改变业务决定来“制造”修复。
- 官方链接可达性：CD04 PDF文本可取但视觉截图工具Cache Miss；CD05/CD07/CD08/CD09/CD10直接网页可读；CD06直访失败，作者新母版明确标SOURCE_UNVERIFIED。CD09仍是历史国际会议政策，不签2026有效性；CD10上级规章校站转载，绝非CDUT本校审批表。
- 针对原P2的具体**错误Markdown链接目标/错误列位**，E复验结果为 FIXED_VERIFIED；允许将原E-G04-T06-0004在限于格式与B原URL对应的范围标记RETESTED_CLOSED。但绝不表示CD06已可达、2026本校活动安全流程已确证或T06 Gold已通过；此等仍归E-G04-SOURCE-0006及GLOBAL-0003。
- 如制度适用性或Gold正确性因以后正式来源变化需要修改规则，另由未暴露E1审查者确认并重新冻结源，再启受影响Gold复验。

## Gold与系统限制
- r02只做8套D 24个整包原始字节SHA-256重核，24/24与旧E0相同，不读取受控ZIP内部答案；212案的r01结构对应结论可继承，但212案 Gold语义 **NOT_RETESTED**。
- 当前未验证D4技术模板转换、Pi/在线模型、CDUT真实审批API及学校行政签批，分别NOT_RUN/NOT_VERIFIED。