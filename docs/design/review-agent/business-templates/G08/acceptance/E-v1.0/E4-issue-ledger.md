# E4｜G08 独立问题台账（公开脱敏版）

审计日期2026-10-14；所有输入SHA固定于 `E0-input-manifest.json`；E1锁定于 `5a24a0197d4b6d8260097da17be64e18346b511b`。**不得把D私有Gold预期答案、可信后台JSON、隐含标签或源个人信息附到本文件。**

共 **4项P1（开放）**，**2项BLOCKED_SOURCE**，**1项BLOCKED_INPUT**；本轮未证实P0、P2、C/D共同事实错判。注意缺覆盖属于**未取得足够证明**，并不等于证明已存在错误结果；不据此编造Gold预测错误。

| 票号 | 等级 | 首要归属 | 影响 | 状态 |
|---|---|---|---|---|
| E-G08-T02-0001 | P1 | D | T02 Gold高风险覆盖、E1 H02/H04/H08/H11 | open |
| E-G08-T02-0002 | P1 | D | T02 32 Gold原件及D21 overlay索引 | open |
| E-G08-T03-0001 | P1 | D | T03 H06/H08/H09/H10及相应金标覆盖 | open |
| E-G08-A-0001 | P1 | A | A C04/C05;T03分流；G08全集E3 | open |
| E-G08-T02-S01 | BLOCKED_SOURCE | source-owner | T02强制校本资格/材料/交付条件 | open |
| E-G08-T03-S01 | BLOCKED_SOURCE | source-owner | T03 R25–R43校本部署能力 | open |
| E-G08-T02-I01 | BLOCKED_INPUT | D | T02 D1 Gold独立生产证据质量 | open |

## E-G08-T02-0001

- `issueId`: E-G08-T02-0001; `phase`: E2; `severity`: P1; `kind`: gold-coverage; `status`: open.
- `sourceRefs` / 原始定位：民法典§314–318;个人信息保护法§5/6/28–30;T02 B-R17/20/21/37/46/47。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: D原始coverage/b_rule_crosswalk.csv显示51条B候选中13条NOT_COVERED，含代理适格、敏感设备/隐私、特殊材料/后台责任等影响误放或隐私的高风险责任；只有普通代理/主场景不能证实各分支已受挑战。
- `expected`: 至少为高风险义务各提供一个适用/不适用/反事实的独立挑战；缺乏校本规则时使用封闭模拟政策且不把其当学校真值。
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: D; `secondaryOwners`: B,source-owner; `impactScope`: T02 Gold高风险覆盖、E1 H02/H04/H08/H11。
- `fixRequirement`: D新版非泄漏案例/覆盖表，旧D SHA保持，关键代理权限、隐私、敏感设备、特别材料挑战可独立复算
- `requiredRetests`: E2-duty H02/H04/H08/H11;新增案不泄露Gold;后台隔离复查

## E-G08-T02-0002

- `issueId`: E-G08-T02-0002; `phase`: E2; `severity`: P1; `kind`: gold-provenance; `status`: open.
- `sourceRefs` / 原始定位：T02 D 32 Gold evidence_anchors; D21公开E交接; T02 D21受限locator导航；民法典§314–316。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: 32/32 Gold evidence锚点均使用evidence/材料*.pdf:第1页起泛化占位；补丁locator可定位文件/页，但声明只验证FILE_AND_PAGE_EXIST，非逐事实可读与真值一致。E只抽样人工观看个别PDF，不足以确认关键Gold语义。
- `expected`: 关键H Gold逐案证据锚点应定位到可辨认可核的页/字段/来源责任及对应事实，视觉复核记录独立留私库；公开仅哈希和无答案摘要。
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: D; `secondaryOwners`: none; `impactScope`: T02 32 Gold原件及D21 overlay索引。
- `fixRequirement`: 不回写旧D；D作者创建受控语义索引或新版Gold追踪清单，独立E逐案抽查高风险页并保留hash/diff
- `requiredRetests`: E2高风险Gold事实逐页独立回算；源与可信数据角色分离

## E-G08-T03-0001

- `issueId`: E-G08-T03-0001; `phase`: E2; `severity`: P1; `kind`: gold-coverage; `status`: open.
- `sourceRefs` / 原始定位：教育部令41号§59–61;信访工作条例§31–36;成都理工信箱渠道通知;T03-R07/22/29/32/38/42/43/45。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: D coverage/B_rule_coverage.csv 的52条候选仅44条SCENARIO_LINKED，8条未直接测；其中有无职权受理、多部门协作、二次办理后状态/时钟规则，影响渠道越权与阶段错判。
- `expected`: 每个直接影响正式权限/办理时点的规则有至少一个独立的受控场景和反例；外校7/10天定时器不能套CDUT。
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: D; `secondaryOwners`: B; `impactScope`: T03 H06/H08/H09/H10及相应金标覆盖。
- `fixRequirement`: 补对应适用/不适用/未知政策的受控案卷，保持旧30案不变，合成政策注明非CDUT
- `requiredRetests`: E2新增Gold语义、版本时点及E3共享渠道回归

## E-G08-A-0001

- `issueId`: E-G08-A-0001; `phase`: E3; `severity`: P1; `kind`: cross-template-routing; `status`: open.
- `sourceRefs` / 原始定位：A v0.2.1 G08-A-C04/C05；教育部令41号§59–61；A R05/R07。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: A已把学生正式处分申诉指向S类、教职工人事复核指向T类，但未固定可访问目标模板ID/版本；G08 T03有正确分流原则，仍无法证明端到端目录注册后法定保护途径不会落空。
- `expected`: 跨域归属须有稳定业务目录/目标模板ID或明确‘暂未建成，仅告知有权机关’，且不得由G08信箱承诺法定救济已受理。
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: A; `secondaryOwners`: B,engineering; `impactScope`: A C04/C05;T03分流；G08全集E3。
- `fixRequirement`: A/领域负责人完善可追踪路由ID、目标职责或显式未建成标志；不仓促生成G08新T
- `requiredRetests`: E3跨域转交及T03法定分流回归

## E-G08-T02-S01

- `issueId`: E-G08-T02-S01; `phase`: E1; `severity`: BLOCKED_SOURCE; `kind`: source-policy; `status`: open.
- `sourceRefs` / 原始定位：成都理工网信学生指南2024 P37-38仅校园卡；民法典§314–318。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: 未找到有效覆盖2026成都理工普通非卡类失物领回、保管人授权/代理方式的校本正式原文；跨校规则非本校生效条件。
- `expected`: 来源主管部门有权人员出具现行办理规则/访问路径、效力范围、时点/委托/保管/现场签收职责；否则保持POLICY_UNKNOWN
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: source-owner; `secondaryOwners`: B,C,D; `impactScope`: T02强制校本资格/材料/交付条件。
- `fixRequirement`: 官方规则/授权确认材料固定SHA及公布或受控来源路径
- `requiredRetests`: E1源复核+E2受影响业务条件重新冻结

## E-G08-T03-S01

- `issueId`: E-G08-T03-S01; `phase`: E1; `severity`: BLOCKED_SOURCE; `kind`: source-policy; `status`: open.
- `sourceRefs` / 原始定位：成都理工校领导信箱、学院/教务处信箱；山东平台2025仅外校。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: 未查到成都理工普通信箱具有复办/撤回/工单评价且可由代理调用的当前校内接口和授权文书；不能据山东流程实施学校状态变更。
- `expected`: 校方来源和有权业务配置证明或继续禁用该功能；明确信箱回复/登记/自动续办区别
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: source-owner; `secondaryOwners`: B,engineering; `impactScope`: T03 R25–R43校本部署能力。
- `fixRequirement`: 现行本校产品功能/业务授权/后台接口证明；若无则保持纯咨询建议
- `requiredRetests`: E1来源再核，E2功能启用与Gold版本分支复验

## E-G08-T02-I01

- `issueId`: E-G08-T02-I01; `phase`: E0; `severity`: BLOCKED_INPUT; `kind`: isolation-provenance; `status`: open.
- `sourceRefs` / 原始定位：T02 D1_FROZEN.json freeze_time_utc, D21公开迁移报告, E0-input-manifest.json。本轮核查时间2026-10-14；源URL请参 `E1-official-fact-register.md`。
- `inputVersions`: A/B/C/D压缩包逐份SHA已在E0冻结，C原母版T02=7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418，T03=53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af。
- `observed`: 原始T02 D1自认无可信绝对冻结时刻；只靠构建顺序无法达到强法证先金标后盲材料独立性证明。未发现泄漏证据，不能凭时间空缺指控P0泄漏。
- `expected`: 生产维护者提供最早可信不可变外部提交/对象元数据与旧hash链，或E明确降低provenanceIntegrity并受控复评
- `repro`: 从E0原包只读加载上述来源/覆盖映射，按E2-case-audit.md方法重新数规则与定位；私人Gold仅在授权独立环境阅览。
- `primaryOwner`: D; `secondaryOwners`: none; `impactScope`: T02 D1 Gold独立生产证据质量。
- `fixRequirement`: 建立可信提交/冻结链及时间真实性说明，不能覆盖原始清单或给旧时点倒签
- `requiredRetests`: E0版本及隔离审查、E2 Gold安全复验


## 无可证明COMMON_MODE_ERROR时的纪律

**当前COMMON_MODE_ERROR确认数=0；不意味着不存在。** 由于本校现行强制来源待核且并非全部62案逐页重算，不能以C与D同向或部分模型字段对齐宣称已经排除共同错误。源权限或校本细则一旦补齐应优先测试E1 ADV-01—14并重新冻结变更范围。
