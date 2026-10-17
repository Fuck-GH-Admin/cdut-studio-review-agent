# D4 COMMON-01/02 公共运行能力交接（R2 工程候选）
> **Draft PR #88，仅合成技术预审。不是正式 R2 Release，不是学校政策或行政授权。**

固定父版本：`94d5ec32b6de1ac0c185b63b4aabfddaa29b1649`（PR #83）；统一缺口来源 PR #87。实际代码分支 `feat/d4-common-object-scenario-r01`。

提供通用 `generic-object` 多对象编译、精确来源绑定和 per-Subject 证据门禁；对象主场景互斥、附加条件同时可用；`unknown` 必须保留待确认责任；旧 R0/R1 的 `student-field`、`campus-card`、档案 item/operation 和 Pi 内核不替换。

作者按顺序阅读 [authoring-contract.md](authoring-contract.md) → [examples/](examples/) → [migration-guide.md](migration-guide.md)；诊断请参考 [test-evidence.md](test-evidence.md) 和 [known-gaps.md](known-gaps.md)。作者可以采用旧 D3 的本地模块或冻结共享模块；不得通过复制上一对象的 EvidenceLink 抹平审核差异。

## 已验证的固定运行证据
在固定候选代码 HEAD `f13f7dd4860e37509dd8bf457f8c15e4672af484` 的 PR CI：
- [全仓 CI #39047829966](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047829966)：安装、全仓类型检查、架构边界、三个 Electron 构建和测试 **3623 PASS、6 SKIP、0 FAIL**。
- [COMMON-01/02 专项 #39047830003](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047830003)：新专项 + R1 **18 PASS、0 FAIL**，相关 D1/D2/D3/Pi 回归 **46 PASS、0 FAIL**，并产生可下载的原始 [Plan / Pi JSON Artifact #12106815095](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047830003/artifacts/12106815095)。
- [R1 学籍专项 #39047829992](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047829992)、[D1 #39047829964](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047829964)、[D2 #39047829969](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047829969)、[D3 MD #39047829972](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047829972) 均通过。

更严格的真实 Material/EvidenceLink 双目标负例在后续 `3a54052dcb39306fc3a8bfc05be858e1ef35492e` 实现提交中新增，须查看 [新增专项 CI #39048123453](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39048123453) 结果，不得把前一轮 CI 冒作对新增测试的验证。最终 PR HEAD SHA 与 Actions head_sha 共同构成锁定版本，正式切换到八领域前应重新确认。

