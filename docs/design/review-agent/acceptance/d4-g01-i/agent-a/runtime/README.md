# D2 技术计划与回执

以当前冻结源编译真实计划：`bun apps/electron/scripts/review-d2-plan.ts preview docs/design/review-agent/acceptance/d4-g01-i/agent-a/workspace/workspace.json docs/design/review-agent/acceptance/d4-g01-i/agent-a/workspace/selection.json docs/design/review-agent/acceptance/d4-g01-i/agent-a/runtime/synthetic-draft-case.json`。此目录暂不包含编造的 D2 plan JSON；实际 CI/受控命令输出才是有效运行证据。禁止把两案卷同一 plan 当作业务分支成功。

## 已实际取得的运行资产

`actual-d2-draft-plan.json` 为 GitHub CI #38978918519 中真实 D2 运行编译器的输出（四个独立测试文件各输出一段后还原）。完整 JSON 经解析校验，固定指纹 `31b1240de64e4f2038790c7f7cdbdb7f139b14ce9db8e9689620fafdcce472ef`，49 个 RuleSpec 与映射、零虚构学生 Subject，`publicationAllowed=false`。

`ci-cli-receipt.json` / `verification.json` 包含真实命令执行和 CI job 标识。项目 G01-I 多轴条件分支仍 BLOCKED，不能由当前 whole-case plan 冒充动态实例化结果。
