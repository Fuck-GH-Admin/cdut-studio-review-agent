# B4 R13｜三套已独立验明原文的 107 项原子规则—D4 Check 双向溯源

工程基线：#142 R12B `c87f1dc81ab2d620eb24a0d0e01950920fdf9628`（3/3 Gate O PASS）。原始 Git D4 SHA `b68443b23293b4714e61a3b81383d3d3a56434fc`。来源是 Library 的三份原始 Markdown，先前以 `raw_file` 的真实 bytes 对照 D4 冻结 SHA，R13 再逐条读取原始 heading/line，与原 `B4-OBLIGATION-SOURCE-G0*.json` 的真实 CheckID/task/sourceId 对照；不将业务原件全文上传 Git。

## 真正已做的核验，不要误称逐义务审核通过

- G03-T12：27 个 R-01…R-27 原文字节对应规则标题，D4 Check anchor 逐 ID 找到；原文定义 `scope_item_id` 逐片区/场次和场馆/体育主管独立授权，而 Check 的 `businessTypes:e.g. g03-sports-slot` + 规则事实不证明实际按时间/分区实例展开。
- G04-T03：46 个 R-01…R-46 原文规则，D4 对应学生/职工等两种 module variant，`rXX` task ID 双向匹配；原文 `unit_id=(case,person,lab,scope,action,policy)`、同人多室部分结果、撤权、签发权，标题双份存在尚不能证明不同个体的状态和人审授权真正隔离。
- G06-T06：34 个 R-01…R-34 原文规则，D4 对应 Check（某些一条原文映射多 Check）；原文 `ReleaseAction(channel,operation,version)`→`Claim/Asset`，同一素材不同渠道的许可必须分别核验；技术 `g06-news-release-action` 对象类型不能自动证明该多层事实粒度、来源时效、频道审批已经落实。
- JSON `B4-R13-107-RAW-RULE-CHECK-ANCHOR-LEDGER.json` 每条包括原文行号/原文标题/首段摘要、CheckID、候选源 ID、高风险分组。B4-only `review-v3-b4-rule-source-diff.ts` 与 Bun 测试禁止缺规则、丢 D4 Check/SourceID、重复计算或把同名技术 anchor 当正式业务 Gold。
- 所有 107 条新账 `status=RULE_ID_ANCHOR_ONLY_SEMANTICS_NOT_VALIDATED`、`semanticValidated=false`、`schoolAuthorityVerified=false`；尚未完成同条款条件、SourceRef精度、Check×真实对象、人工审批职责及升级版本差分。**发现的是“业务语义尚未经证据充分核实”的可复核差异层，不是断言 D4 必然遗失 107 条**。

## 下一步明确的语义对照（不得省略）

以高风险分组先补 `original clause + trigger truth table + object identity + issuer boundary + workspace condition + Main source version` 的实义判决及至少一正一负反例。例如 G03 R-22、R-17、R-27；G04 R-14、R-15、R-19、R-28、R-30、R-38、R-41；G06 R-19、R-20、R-22、R-25、R-27、R-30。缺少可复核的实际业务条件/权威信息，保留 `UNKNOWN`，不能标为“已保全”。

其他 47/50 raw source match、3 conflict，以及 G01 34 UNKNOWN / 4,163 applicability UNKNOWN 未变。50 套一律 `candidate-held/publicationAllowed=false`，Gate L/P 未通过。
