# B4 R14｜32 条高风险业务规则：原文字节/条款正文 × D4 技术 Check 的真实差分账

本轮在 R13 107 条规则名称/CheckID 技术映射的基础上，**进一步读取 Library 原始 Markdown 的对应条款正文**（原字节已于 R12 按 SHA256 固定）。记录原始 R-XX 行号、正文前 1,100 字、D4 CheckID、真实对象 genericScope、SourceRef applicability/verification/locator、可能缺少的实例区分维度、人工权限证据缺口及至少一条需要独立验证的多对象负例。

| 模板 | 核验高风险规则数 | 原文要求的显著对象边界 | D4 技术 Check 可以证明的范围 |
|---|---:|---|---|
| G03-T12 | 7 | 场馆区段、时段和 scope_item_id 的逐对象许可 | Check + 类型/证据事实 + SourceRef 技术绑定存在；尚无按场次签发权的逐实例真实执行证明 |
| G04-T03 | 14 | 个人×实验室×范围×操作×校规版本的独立资格与撤权 | 学生/职工 variant 的 Check 有来源线索；不能仅凭两份 ID 相同认定实例隔离/人工签发完整 |
| G06-T06 | 11 | ReleaseAction×渠道×claim×asset×版本的许可边界 | 多渠道等 Check 有技术线索；缺每个动作的真实批准主体、适用政策版本和运行证据 |

审计文件：`B4-R14-HIGH-RISK-32-SEMANTIC-EVIDENCE.json`（逐条原文/技术范围/候选负例）；B-owned validator + Bun negatives `review-v3-b4-high-risk-semantic-evidence.ts/.test.ts`。本轮结论每条均 `CANDIDATE_CHECK_TRACEABLE_SEMANTIC_UNPROVEN`；它不是断言 D4 功能在别处绝对不存在。**缺的只是“所持当前冻结证据尚不能证明运行时业务语义”的证据**，下一轮应按 32 条 targeted cases 在 C/I Main 组合、学校授权/Gold 边界下集中复验，不再只比标题。

特别说明：技术档案的 `genericScope` 不包含某一实例字段，只能得出“此字段不在该档案的 Check 范围中被明确证明”，不能单独推断整个产品绝不具备。50 套继续 candidate-held / publicationAllowed=false；历史原字节 47/50 / 三冲突不变；4,163 Source applicability 和 G01 34 UNKNOWN 保持阻断。Gate O 仅该批实际 CI；E/L/P 未满足。正式共享 DTO/Main Actor/Writer 归 Dev-C，B 只提供证据与技术只读 validator。
