# E4｜G04 r01 问题与依赖台账（首轮正式版）

冻结基础：main dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e；E0 f7881dc5bbbc07111e400a59c47618f3611ff8be；E1锁8466534655138224480e9f4ba15c40c7adf9eea2；E2 7ce83686f9b0765a3d8690eac3035dc84cc7becd；E3 20b3bfe24282aefbafe2d0f252ed8a985be437f5。

**结果计数**：经本轮已检查范围发现的 P0=0、P1=0、P2=2；另有 BLOCKED_INPUT=3、BLOCKED_SOURCE=2。P0/P1为0只表示在已完成的受限检查中没有确认到这些等级的具体缺陷，**不是完整的Gold逐案业务安全保证**。未证据支持的问题保持依赖状态，不降级成P2也不虚构P1。

| ID | 阶段 | 等级 | 归类 | 影响范围 | 一句话缺口 | 主责 | 状态 |
|---|---|---|---|---|---|---|---|
| E-G04-T01-0001 | E0 | BLOCKED_INPUT | input | T01 | A/B/D已可达但T01的C业务母版、规则追踪、作者自检、E对接卡在本次主仓/Library未发现；没有合法C固定SHA | C | open |
| E-G04-GLOBAL-0002 | E0 | BLOCKED_INPUT | provenance | G04全域 | A/B/C/D交付材料位于Library ZIP，仓库main不含G04原作者资产；无作者Git SHA及blob可查 | source-owner | open |
| E-G04-GLOBAL-0003 | E0 | BLOCKED_INPUT | isolation | G04全域Gold | D INPUT_ONLY/EVALUATION_ONLY分开且结构对齐，但未证实Gold原始制作与C作者完全独立；Library ACL与访问记录未形成可核证据 | D | open |
| E-G04-T06-0004 | E2 | P2 | template-error | G04-T06 | C v0.1 MD行1023—1029内7项本校源CD04—CD10写作[原文](中文论述...)而不是源URL，Markdown链接目标损坏、后部限制列重排 | C | open |
| E-G04-A-0005 | E3 | P2 | source-error | G04 A源索引 / T03-T05 | A-v0.1来源C01仅以2016试行注明'现行待核'，没有明确收录2023办法第35条自2024-01-01废止2016；B v0.2/C已作正确处理 | A | open |
| E-G04-SOURCE-0006 | E1/E4 | BLOCKED_SOURCE | source-error | T01-T08校本执行条件 | 现行CDUT门禁授权、2026访客入口、考试阈值、项目表单/专业复核、单次高危票、校内活动办理、动火证和车辆年卡最新条件不齐；历史/外校素材不能替代 | source-owner | open |
| E-G04-DOMAIN-0007 | E3 | BLOCKED_SOURCE | cross-template | A项N18 / T02-T01-T07 | A将施工人员长期驻场/外包身份N18列作T02临时访客角色限制，但长周期驻场与临时访客资格生命周期及实际授权部门可能不同；A自身标中置信度 | A | open |

## 可复验原始问题记录
### E-G04-T01-0001
- phase: E0
- severity: BLOCKED_INPUT
- kind: input
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与T01相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: A/B/D已可达但T01的C业务母版、规则追踪、作者自检、E对接卡在本次主仓/Library未发现；没有合法C固定SHA
- expected/fixRequirement: 固定版T01-C全套交付，作者侧明确版本/来源链，再做E2及T01与T03/T02边界复核
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: C
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: T01
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

### E-G04-GLOBAL-0002
- phase: E0
- severity: BLOCKED_INPUT
- kind: provenance
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与G04全域相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: A/B/C/D交付材料位于Library ZIP，仓库main不含G04原作者资产；无作者Git SHA及blob可查
- expected/fixRequirement: 档案管理员出具按TXX区分的不可变交付位置/版本/签署人、内容摘要与相应Git对象或受控归档
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: source-owner
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: G04全域
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

### E-G04-GLOBAL-0003
- phase: E0
- severity: BLOCKED_INPUT
- kind: isolation
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与G04全域Gold相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: D INPUT_ONLY/EVALUATION_ONLY分开且结构对齐，但未证实Gold原始制作与C作者完全独立；Library ACL与访问记录未形成可核证据
- expected/fixRequirement: 受控Gold访问人表、生产阶段独立性和泄漏复盘、隔离路径证据；必要时独立重做已污染案例
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: D
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: G04全域Gold
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

### E-G04-T06-0004
- phase: E2
- severity: P2
- kind: template-error
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与G04-T06相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: C v0.1 MD行1023—1029内7项本校源CD04—CD10写作[原文](中文论述...)而不是源URL，Markdown链接目标损坏、后部限制列重排
- expected/fixRequirement: C作者恢复7条B原文URL及局限说明、提交新MD及差分SHA；独立点击定位与E2来源映射回归
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: C
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: G04-T06
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

### E-G04-A-0005
- phase: E3
- severity: P2
- kind: source-error
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与G04 A源索引 / T03-T05相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: A-v0.1来源C01仅以2016试行注明'现行待核'，没有明确收录2023办法第35条自2024-01-01废止2016；B v0.2/C已作正确处理
- expected/fixRequirement: A来源索引追加明确废止与2023替代链接及效力期，不覆盖既有历史原件；复核新文档不会导致2016重新升权
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: A
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: G04 A源索引 / T03-T05
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

### E-G04-SOURCE-0006
- phase: E1/E4
- severity: BLOCKED_SOURCE
- kind: source-error
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与T01-T08校本执行条件相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: 现行CDUT门禁授权、2026访客入口、考试阈值、项目表单/专业复核、单次高危票、校内活动办理、动火证和车辆年卡最新条件不齐；历史/外校素材不能替代
- expected/fixRequirement: 取得有权校方适用文件/表单/实施日起点/权限验证，逐项限定并重跑受影响E1/E2，无权确认时保持POLICY_PENDING
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: source-owner
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: T01-T08校本执行条件
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

### E-G04-DOMAIN-0007
- phase: E3
- severity: BLOCKED_SOURCE
- kind: cross-template
- sourceRefs: E1-official-fact-register.md 与 G04 A/B固定归档所列相应原文URL；T06问题来自本校2025会议制度B调研原始来源CD04–CD10（不使用Gold答案）。
- sourceDutyIds: E1-G04-001…021及E2-ADD-001内与A项N18 / T02-T01-T07相应的独立义务，不存在的关联不作强制一对一假映射。
- inputVersions: G04 E0-input-manifest.json；受限C：T02～T08 v0.1；B：T01～T08 v0.2；D：独立分包，摘要见E0；审计主仓基线如上。
- observed: A将施工人员长期驻场/外包身份N18列作T02临时访客角色限制，但长周期驻场与临时访客资格生命周期及实际授权部门可能不同；A自身标中置信度
- expected/fixRequirement: 取得本校长期施工驻场办事规则、角色委托和门禁生效机制，决定T02条件分支是否足够或重编领域母集；专业动火仍归T07
- repro: 根据固定的E0清单取本轮归档，按上述文件名、原文定位/行号重现；如涉及D只使用脱敏源义务和结构测试，不暴露Gold预期。
- primaryOwner: A
- secondaryOwners: 按实际源影响通知下游作者，具体责任需归档负责人分配。
- impactScope: A项N18 / T02-T01-T07
- requiredRetests: E0版本/隔离复核；涉及校本来源则E1重判；C/D升版则受影响E2 Gold重新派生并重审；涉及N18/复用则E3横向回归。
- status: open

## 归因与审批纪律
- 001/002/003 为**材料及隔离证据依赖**，不证明作者故意泄漏或现存业务模型违规。
- 004 已直接观察到 C 排版及引用损坏；未擅自修复/替换 C 或 D。
- 005 源版本元数据维护责任优先回流 A，不要求C把已修对的规则改回旧规。
- 006 当前效力由有权校方/来源持有人确认，E不得凭外校或样例做强制拒件；007需跨域授权确认。
- 没有修复后固定版本与复验日志，所有问题一律保持 `open`，不得写成 `retested-closed`。任何正式审批权必须学校授权主体决定。
