# D4 COMMON-01/02 公共运行能力交接（R2 工程候选）
> **Draft PR #88，仅合成技术预审。不是正式 R2 Release，不是学校政策或行政授权。**

固定父版本：`94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`（PR #83）；统一缺口来源 PR #87。实际代码分支 `feat/d4-common-object-scenario-r01`。

提供通用 `generic-object` 多对象编译、精确来源绑定和 per-Subject 证据门禁；对象主场景互斥、附加条件同时可用；`unknown` 必须保留待确认责任；旧 R0/R1 的 `student-field`、`campus-card`、档案 item/operation 和 Pi 内核不替换。

作者按顺序阅读 [authoring-contract.md](authoring-contract.md) → [examples/](examples/) → [migration-guide.md](migration-guide.md)；诊断请参考 [test-evidence.md](test-evidence.md) 和 [known-gaps.md](known-gaps.md)。作者可以采用旧 D3 的本地模块或冻结共享模块；不得通过复制上一对象的 EvidenceLink 抹平审核差异。

此目录的测试状态随 CI 更新；**不要以本段文字作为验证 PASS**，需核验 PR 固定 HEAD 及实际 CI。
