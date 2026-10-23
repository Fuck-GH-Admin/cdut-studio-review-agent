# G05 E4 问题与依赖台账（E0 预登记；E4 未启动）

| 编号 | 发现阶段 | 分类 | 严重度/依赖 | 责任主体 | 状态 | 解决/复核 |
|---|---|---|---|---|---|---|
| E-G05-E0-001 | E0 | input-version-gap | BLOCKED_INPUT | A/B/C/D交付负责人 | open | 完整包固定SHA、可达、版本与上下游映射；E0重检 |
| E-G05-E0-002 | E0 | gold-access-gap | BLOCKED_INPUT | D资料保管人 | open | 六套D受控真实可访问评估包；不进入公开Git；E0重检 |
| E-G05-E0-003 | E0 | isolation | BLINDING_COMPROMISED_POTENTIAL（待裁定） | E审计协调方 | open | T04 汇总结果信息暴露范围存证；T04新独立E1审查者复核 |
| E-G05-E0-004 | E0 | D-independence | D_INDEPENDENCE_QUALIFIED（非自动定P0） | D-T02负责人 / E2审查者 | open | 确认既往C暴露范围；E2按独立官方来源复核 |
| E-G05-E0-005 | E0 | cross-domain-baseline | BLOCKED_INPUT | A领域负责人 | open | 对照最新版统一工作树与相邻领域稳定模板 |

以上为**输入/隔离问题**，不冒充已经证明 C 或 D 存在业务语义错判，P0/P1/P2 仅在对应证据齐全后裁定。E4业务归因及复验另起正式结果。
