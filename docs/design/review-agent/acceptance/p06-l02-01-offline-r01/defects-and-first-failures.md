# 真实失败与修复归因（不可覆写）
1. E01 历史两轮 RED：PR CI #39132697022 证明同 requestId 的 ResolveSupplement 重放产生二次外部 requeue；batch CI #39133158848 证明初版补丁把正常首次 requeue 误拒。此处只索引，不修改原文件。
2. E02 新首败（提交 `0a2a318e`）：[batch CI #39138285980](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39138285980) FAILURE，三个新增测试均为 Received true / Expected false。证明：学生可直接驳回、Agent 开全局开关可直接签署、reviewer 越过教师开放任务可形成最终决定。
3. E02 第一修复回归（`8e290cf1`）：[Review Baseline #39138470324](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39138470324) FAILURE，`single-case-workspace.e2e.test.ts:255` 期望 `DEPENDENCY_UNRESOLVED` 得 `INVALID_TRANSITION`。回退错误顺序，而非解除权限门禁。
4. E02/E03 集成过强拦截（`4ae2ec96`）：[PR CI #39139316175](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39139316175) FAILURE 4 条：`real-chain-journey.test.ts` 旧合法 system auto-check 技术交接被泛化拒止、致后续两条链路缺少初审任务；`single-case-mvp.e2e.test.ts` 缺技术交接步骤不能直接 final partial-pass。随后严格限定技术移交、补足模拟链路步骤，仍不授权普通 Agent 直接做终审。
5. E03 独立新增补件版本/时间与多批次反例在快推阶段其旧 SHA 工作流为 CANCELLED；**没有足够证据宣称观察到单独 RED**。应依据最终 HEAD test PASS 证明已实现防护，并将未来独立复验与具体 Provider E2E 留在统一任务。

所有引用为公开仓 CI；原失败在 GitHub 服务端保留，不删除、不重跑来覆盖首败。旧 29 LIVE、#118 U1、Gold 及实际用户材料均未修改。