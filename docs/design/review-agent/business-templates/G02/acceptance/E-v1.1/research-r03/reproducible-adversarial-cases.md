# G02 r03｜最小区分反例与复查规程

**类型：** `RESEARCH_CROSSCHECK`。全部虚构申请主体/记录，不是真实学校数据；不使用 D Gold、旧 D 结果/分布或敏感档案。
**共同语义：** `PRECHECK_CONTINUE` 仅表示继续预审；`PENDING_APPROVAL` 后置等待；`DO_NOT_INFER_PERMISSION` 禁止将申请/通道/账号存在等同正式授权；`POLICY_UNKNOWN` 校规不明；`PROVISIONING_UNVERIFIED` 未取得可信后台执行回执。标签是研究定义，非项目运行环境枚举。所有现实主体的正式决定由有权人作出。

## RC01 — 阶段签字 vs 当前材料（F-CDUT-HISTORICAL + U-current）

- **dutyId:** `D04`, r02 `T01-H04`; C `G02-T01: ST-02/ST-04, R-11, F-18/F-19`.
- **sourceLocator:** CDUT 2020《信息化数据管理办法（试行）》§17 与附件2，<https://wxc.cdut.edu.cn/__local/4/16/0D/B676B386C2C23526DE6611153D0_6D51DC3A_81133.pdf>；旧制度 2026 效力 U。
- **applicability:** 仅显式假定 2020 流程适用于该历史时点的「单位请求来源部门数据」。
- **changedFact:** 同一单位申请，来源审批意见空白。A：还在首次申请提交 `ST-02`；B：系统企图把当前同一案宣布为「已批准并立即交付」。
- **expectedDecision:** A=申请信息齐全可 `PRECHECK_CONTINUE` 并路由后续签批；B=`DO_NOT_INFER_PERMISSION`、`PENDING_APPROVAL`，不得实施/声明授权。
- **admissibleAlternatives:** 有可信 OA 下一节点意见，可确认流转进度；真实电子签章可按该校规则替代纸签；若只是现行系统版本不明，`POLICY_UNKNOWN`。
- **evidenceAnchors:** 历史官方 §17/附2申请方、数据源会签与网信后续意见栏；C `R-11` 原文「未到节点→待办」。
- **failureMode:** 阶段折叠、空审批栏被判初次缺件，或提交自动提升为已授权。
- **confidence:** 历史制度义务高，2026 强制适用未知；固定 C 静态该点 **未发现上述错误**。
- **unresolved:** 2026 当前流程、签章替代、真实后台节点。

## RC02 — 单数据源 vs 第二数据源（F-CDUT-HISTORICAL + U-current）

- **dutyId:** `D02`, r02 `T01-H03`; C `G02-T01: BR-03, R-09/10/25`.
- **sourceLocator:** 同一 CDUT 2020 制度 §7、§17、附件2多数据来源栏目。
- **applicability:** 不以单一网信协调者替代具体来源部门的许可；历史角色结构，现行部门目录 U。
- **changedFact:** A 请求历史业务部门 X 的数据，已有 X 有效许可；B 追加历史业务部门 Y 的数据，其他材料和 X 许可不变，Y 尚无许可。
- **expectedDecision:** A 可在只涉及 X 且其他条件满足的前提下报告 X 的批准状态；B 不能把 X 的同意传播给 Y，逐源 `PENDING_APPROVAL`；**整案部分生效与否仍 U**。
- **admissibleAlternatives:** 有权授权链跨部门兼任必须由可信正式委任证实；新来源正式许可形成后可复核。
- **evidenceAnchors:** PDF 历史多来源栏目；C `DATA_ITEM`, `R-09/10/25`。
- **failureMode:** 同案单一布尔覆盖全部来源，或把「记录部分结论」提升为「允许部分实施」。
- **confidence:** 历史证据支持逐来源审查；具体部分执行不可确认。
- **unresolved:** 现行权威目录、签批角色、部分共享权限。

## RC03 — 2024 申请资格/材料 vs 后台真实开通（F-CDUT-HISTORICAL + U-current）

- **dutyId:** `M01/M02`, r02 `T02-H02/H04/H05`; C `G02-T02: ST-02/ST-04/ST-05/ST-07, R-10/11/13`.
- **sourceLocator:** CDUT《网络与信息化服务指南（教师版）》第四版（编制 2024-12）官方 PDF P20—P22，尤其 **PDF P22 原始表单截图**：<https://wxc.cdut.edu.cn/__local/2/F7/A1/0E8EDEF68218B83FB5757A2F506_98ED2073_393AC4.pdf>。
- **applicability:** 此截图发生在新教师邮箱申请说明中，「单位、教师办公邮箱申请」是同一个入口标题；**不能直接等同于 2026 部门公共邮箱审核规则**。
- **changedFact:** A 申报方栏目齐全，单位与网信审批尚未产生，后台账号栏空；B 在同样申报和审批版本下，**另取得校方可信回执**，证明该账号已按该权限范围真实开户（假定所有实际要求的有权审批也已形成）。
- **expectedDecision:** A 只能说明申请材料状态及后置等待，`PROVISIONING_UNVERIFIED`；B 才可陈述回执证明的特定账号**已实施**，不能扩大到成员、额外邮箱或校方批准。
- **admissibleAlternatives:** 官方可验的原生系统账户状态/开通回执可替代纸面账号信息；申请人自己截图不与可信回执等价；2026 政策 U 应转权威确认。
- **evidenceAnchors:** P22 申请单位、申请人一卡通、负责人、单位负责人意见、网信意见及「以下由网信处填写」；C `R-10/11/13` 分离阶段。
- **failureMode:** 用申请表、单位负责人意见或过去邮箱名称推断网信最终批准、后台配置和使用权已生效。
- **confidence:** P22 **已实际视觉复核**，证据较强；2026 现行部署 U。
- **unresolved:** 部门公共邮箱独立申请资格/后台反馈渠道和现行字段。

## RC04 — 外协人员链 vs 特定资源属主链（S-CLOSED，明确模拟规则）

- **dutyId:** `N04` / `G02-R03-C-T03-01`，r02 `T03-H04`; C `G02-T03: BR-02/BR-03, SC-06, R-10/R-17`.
- **sourceLocator:** CDUT 历史《网络安全管理办法（试行）》§11 的外来公司账号与最小化原则（历史风险背景），<https://wxc.cdut.edu.cn/__local/9/8F/4D/EDCE5568A88F519606DEA2F2537_C718DC5C_C843B.pdf>。**真正决定本合成案的规则只有下面三条 S，不借此声称 CDUT 当前有同一申请表**。
- **applicability / S closed rules:** 在假设机构 `School-Z`，只有同时满足 `(A) 申请由可信校内 sponsor 提交、(B) 此 beneficiary 在此 resource 上拥有有效资源属主许可、(C) 网络部门有该 user×resource×action×period 的有效准入决定` 才允许**技术实施**。任意条件缺失，只能待该责任主体办理。
- **changedFact:** 假人 Contractor-Q、校内 Sponsor-P、资源 R1、动作 `connect`、本月期限均相同，`A=true, C=true`；A 案 `B=true`；B 案仅将资源属主许可设为 `B=false`。
- **expectedDecision:** A 仍须检查实施日志，但可进入配置候选；B=`PENDING_RESOURCE_OWNER` 与 `DO_NOT_INFER_PERMISSION`，即使 sponsor 有效也绝不能直接实施。
- **admissibleAlternatives:** 有权资源属主对**同一身份/资源/动作/期限**做新许可并可信落盘，可以使 B 恢复下一流程；普通 VPN、单一外包合同、系统备案不能代替。
- **evidenceAnchors:** C `BR-02` 注释「与BR-03按受益身份分流」与 `BR-03` 注释「可叠加BR-02」，同文 `SC-06` 指定 `BR-03+BR-02`。官方 §11 只用于真实风险映射，非 School-Z 政策源。
- **failureMode:** 仅按外协身份选择 BR-03 而丢失 BR-02 资源检查；会把缺资源权的案子推进实施。反向只选 BR-02 也可能漏担保链。
- **confidence:** 静态表达歧义可复核；**未运行 C 编译器、Pi 或实际权限系统，尚不能宣称系统误放行已发生**。
- **unresolved:** C作者最终组合定义、正式运行期分支合成实现、CDUT资源审批真实表单。

## RC05 — 普通 SSLVPN vs 另一个受控操作（F-CDUT-SERVICE + U-privileged）

- **dutyId:** `N01/N04`，r02 `T03-H01/H04`; C `G02-T03: BR-01/08, R-01/13`.
- **sourceLocator:** CDUT 2026-01-29《寒假网络信息服务指南》VPN栏目 <https://wxc.cdut.edu.cn/info/1006/3954.htm>；CDUT 2024-12 官方教师指南 PDF P11—P14；另校本历史安全试行办法 §11。
- **applicability:** 普通 WebVPN/SSLVPN 是正常网络服务，不等于向校内高权限系统请求操作资格。
- **changedFact:** 同一普通师生已按公开允许的方式接入 SSLVPN。A 只访问已开放的普通服务；B 额外请求一台有独立管理权限要求的服务器的管理员操作，尚无对应许可。
- **expectedDecision:** A 依公开服务指南自助，不进入 T03 的特权申请；B 不能因 VPN 连通就推断服务器管理员权限，`DO_NOT_INFER_PERMISSION`，具体校本申请流程 `POLICY_UNKNOWN`。
- **admissibleAlternatives:** 若校方可信授权证明 B 对该具体服务器及操作已有许可，则按相应系统核验；网络通道不是替代。
- **evidenceAnchors:** 官方 VPN 接入服务说明、历史 §11 特权最小授权；C `R-01/R-13`。
- **failureMode:** 因使用 SSLVPN 即错误要求外协申请表；或因成功 VPN 登录就自动授予系统管理操作权。
- **confidence:** 普通 VPN 服务事实强；2026 T03 特殊权利如何办理 U。
- **unresolved:** 真实专项受理入口、操作粒度和资源属主。

## 检验方式及不越权规则

- **已实测：** 三份 C 母版文件实际 SHA-256 与 r01 manifest 一致，相关章节做过人工文字级比对；2024 PDF P22 已实际截图核查。
- **可以手工复核：** RC01—RC05 的关键变化只有指定条件；每个测试按 `sourceLocator→适用范围→C对应分支→允许的材料建议/权限限制` 检查，不需要任何 Gold。
- **仅合成试验：** RC04 的 School-Z 规则由本文件明示，**不得**拿它当成都理工大学强制拒件标准，也不得在真实学校系统执行权限操作。
- **未实测：** 未运行系统编译、Pi、独立 D 输入或受控 D Gold，故没有运行时错误率、Gold 锚点有效性或 E2 正式结果。
