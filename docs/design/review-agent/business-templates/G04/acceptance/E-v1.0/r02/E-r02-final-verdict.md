# G04 E v1.0｜r02 差分独立审计正式裁定

**E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION**

**r02最终状态：BLOCKED_INPUT，并有BLOCKED_SOURCE和一个新登记P1版本证据缺陷；不签PASS_DESIGN或PASS_WITH_LIMITATIONS。** 这是针对旧版整改的差分结论，并非重新做第一次G04全量E。

## 固定版本与继承
- r01原PR #27、审计分支 audit/g04-e-v1-r01、最终E冻结HEAD fc2ace5c874454ddbcfca731be7aa093416dab12；该SHA仅是E提交，不是A/B/C/D历史原作者SHA。r02新分支 audit/g04-e-v1-r02 从该完整HEAD创建，原r01所有文件与错误结论原样保留。
- r01 E1冻结SHA 8466534655138224480e9f4ba15c40c7adf9eea2；独立事实MD SHA f9d66e46c686f8176a8907b9c1b493bed089474f1d893c82c3822a02dd82b9c9。旧21事实、12挑战在已审范围有效，但不等于完整校本2026强制规则核证。
- r01 E2已核212案编号和输入路径结构，却没有全量逐案业务语义复算；r02未打开受控Gold，不能写Gold PASS。r01 E3的A40项母集原判断与9组边界继续继承，r02只做受影响横向核查。

## E0 → E4 本次完成程度
| 阶段 | 继承 | 本轮新增 | 不可越过的门槛 |
|---|---|---|---|
| E0 | r01旧文件与SHA冻结 | T01 C原包9文件恢复，T06 C新旧差分，8份D作者补证文件定位，24个旧D整包SHA复核 | Gold ACL、独立性外部时间戳、原作者生产提交仍缺 |
| E1 | r01有效21事实/12反例的先盲审锁 | 官方URL和版本文本验证属于非盲元数据核对 | 当前审计者见过C/D，新争议的首次独立盲审须交新会话 |
| E2 | r01已审7个C及D结构 | T01 C规则结构可审；T06 7行链接修复复验完成 | Gold不获授权；212案未进行新语义独立复算 |
| E3 | A40项、9组边界 | T01↔T02/T03/T05/T07受影响回归；T06来源链接与G03/G05作用域未扩张 | 长期驻场N18及相邻领域有权路由未证 |
| E4 | r01原7票全历史保留 | 0004 P2格式问题限域关闭；0001输入已补仍待E2；0008新P1版本标签复用问题；其余按证据保持OPEN | 无受控新Gold重建/时间链，未取得正式校本修复版 |

## 原问题结果与新增问题
| 问题 | r02实际状态 |
|---|---|
| E-G04-T01-0001 | C输入已找到，FIXED_AWAITING_E2_RETEST（未关闭） |
| E-G04-GLOBAL-0002 | 新D补证Git提交不等于原D制作commit，OPEN |
| E-G04-GLOBAL-0003 | 8份作者独立性自述已读；ACL和历史读取日志无第三方证明，OPEN |
| E-G04-T06-0004 | 仅原7条Markdown URL及第四列错位问题复验通过，RETESTED_CLOSED（限域） |
| E-G04-A-0005 | 无作者新A源索引，OPEN |
| E-G04-SOURCE-0006 | 2026现行学校真实办理与个别原文不可达，BLOCKED_SOURCE OPEN |
| E-G04-DOMAIN-0007 | N18长期驻场校门与门禁权限边界来源不足，BLOCKED_SOURCE OPEN |
| E-G04-GOLD-LINEAGE-0008（新） | P1：T05/T06冻结标签复用、T08版本报告冲突，需第三方原历史字节差异复验，OPEN |

## 每TXX分维度研究设计状态
| TXX | sourceValidity | templateFidelity | goldValidity | crossTemplate | provenanceIntegrity |
|---|---|---|---|---|---|
| G04-T01 | BLOCKED_SOURCE | PARTIAL [C recovered] | PARTIAL r01 inherited; r02 Gold NOT_RETESTED | PARTIAL | BLOCKED_INPUT |
| G04-T02 | PARTIAL | PARTIAL | PARTIAL r01 inherited; r02 Gold NOT_RETESTED | PARTIAL | BLOCKED_INPUT |
| G04-T03 | PARTIAL | PARTIAL | PARTIAL r01 inherited; r02 Gold NOT_RETESTED | PARTIAL | BLOCKED_INPUT |
| G04-T04 | PARTIAL | PARTIAL | PARTIAL r01 inherited; r02 Gold NOT_RETESTED | PARTIAL | BLOCKED_INPUT |
| G04-T05 | BLOCKED_SOURCE | PARTIAL | PARTIAL r01 inherited; P1 lineage issue | PARTIAL | BLOCKED_INPUT |
| G04-T06 | BLOCKED_SOURCE | PARTIAL [P2 link fixed] | PARTIAL r01 inherited; P1 lineage issue | PARTIAL | BLOCKED_INPUT |
| G04-T07 | BLOCKED_SOURCE | PARTIAL | PARTIAL r01 inherited; r02 Gold NOT_RETESTED | PARTIAL | BLOCKED_INPUT |
| G04-T08 | BLOCKED_SOURCE | PARTIAL | PARTIAL r01 inherited; v2 report conflict | PARTIAL | BLOCKED_INPUT |

所有8个TXX另三维统一：technicalTemplateRuntime=NOT_RUN；onlineModelAccuracy=NOT_RUN；administrativeAuthority=NOT_VERIFIED。端到端产品=NOT_RUN。

## 复验计数与局限
- r02确认原C T01字节ZIP完整9/9、规则矩阵40行及13分支；T06 7/7引用匹配固定B索引且除7行以外0文本改动；八D每套三ZIP的24个整包SHA均与r01相符。以上只有输入完整性和文字差分意义。
- r02新确认P2格式修复关闭1；原问题保留OPEN/待E2共6；新增0008 P1 OPEN1；共8票、关闭1、仍未关闭7。原r01当时统计不改写。
- D作者T05/T06补证报告明确指出原Gold构建历史中相同“FROZEN_GOLD_v1”标签对应内容变动；E独立读取的是公开作者声明与最终原档摘要，还**没有私下接收所有历史快照作首次第三方重放**。新P1应受控补证，不把它当“已证业务答案造假”。
- 今年本校门禁、访客、消防动火、车辆年卡、活动安保等具体审批权与表单仍缺；CD06直访失败、CD09衔接时效未解。外校制度不得升级成CDUT强制拒件依据。

## 复验出口与责任
1. C-T01负责人：原件已补，不需要重写旧母版；E受控访问Gold并独立检查来源→C40规则→Gold相关24案；得到正式依据后再判断T01是否真正可通过。
2. C-T06负责人：v0.1.1七链接修复已获限定复验；CD06与CD09源效力跟随SOURCE-0006，不要根据不可访问原文制造强制拒件。
3. D-T01～T08及存储管理员：提供不可变E-only私有对象、ACL导出、C作者及公共CI真实身份拒访证明、历史日志范围、原作者C接触记录；实证污染则由**未受污染的新D作者**重做受影响案，不修改旧Gold。
4. D-T05/T06/T08历史版本责任人：提交S1～Sn原包受控链、版本唯一命名、完整SHA与差异及冻结批准时点；E对真实差异再审P1，必要时扩大Gold重标注。
5. A/source-owner：A来源C01补2023废止2016说明；校方相关部门补2026有效规章、权限与N18长期施工驻场真实入口；新增实质争议交另一名未见C/D的独立E1先锁判断。
6. 独立E后续从r02 manifest重新取旧SHA和新增作者归档，差分重验受影响TXX；不合并main、不发布模板、不宣称D4/产品/行政验收已运行。