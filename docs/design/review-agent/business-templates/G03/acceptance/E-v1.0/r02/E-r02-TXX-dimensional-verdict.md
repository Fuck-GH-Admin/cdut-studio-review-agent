# G03 r02｜十模板分维度研究性判定（截止2026-10-15）

> 继承 r01 51原件 SHA；r02新增九D补证的独立ZIP SHA/新Git commit见 E0-r02-delta-input-manifest.json。下面**没有任何TXX获准 PASS_DESIGN**。未读取任何C业务规则正文或Gold逐案正确答案。

| TXX | sourceValidity | templateFidelity | goldValidity | crossTemplate | provenanceIntegrity | 差分结论 |
|---|---|---|---|---|---|---|
| T01 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | B 2文件新旧SHA差异已登记，新补证与公开包CRC已核，Gold ACL/权限未解 |
| T02 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | 有D作者追溯增量；原Gold不变，实际ACL仍待 |
| T03 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | 作者选择`(1)`版，非Gold原始输入/报告哈希CRC复验；Gold私有复核未执行 |
| **T06** | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | **FAIL_INDEPENDENCE** | NOT_EVALUATED | **FAIL_FOR_GOLD_INDEPENDENCE** | 原D作者确认**先读C实质后造Gold**；原Gold明确PROVISIONAL_CONTAMINATED，独立性P0待独立D重制 |
| T07 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | D自检溯源增量、原件原SHA不变，ACL/作者原Git链待证 |
| T08 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | 来源/原件哈希增量，实际授权存储与2023政策未解 |
| T09 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | 原D作者披露曾见泛化C元数据，未核实实质影响；ACL仍缺 |
| T10 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | B 4份新旧来源差异，历史offline QA指v1而现行Gold声明v2；C搜索摘要接触待追 |
| T11 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | D来源元数据新增；电子屏校本签批链缺正式证明 |
| T12 | PARTIAL/BLOCKED_SOURCE | BLOCKED_INPUT | BLOCKED_INPUT | NOT_EVALUATED | BLOCKED_INPUT | 无可核的本轮新D归档/校本实际场馆授权，继承r01 Gold和来源待核 |

维度解释：`crossTemplate=NOT_EVALUATED` 表示正式E3未执行，r02另做了前置影响筛查；不能将其记为PASS或把没有做的E3结论冒称PARTIAL审计通过。外部 Gold ACL 与源事实义务尚缺使其它C/D维度不具备语义签署条件。

所有TXX共同的独立层状态：

- `technicalTemplateRuntime = NOT_RUN`
- `onlineModelAccuracy = NOT_RUN`
- `administrativeAuthority = NOT_VERIFIED`
- `productEndToEnd = NOT_RUN`

本业务 E 只审研究设计；在具备完整E1+Gold访问+独立性之前不触碰E2。
