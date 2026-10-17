# 可复算 CI / 命令 / 退出码账本

技术工作以 GitHub 实际运行作为证据，非模型模拟“PASS”。

## R0 红灯（第一个 R1 红灯测试提交）
- Parent: `4b191c729f3d5f8135c73b87c17642023f6c3986`；测试提交 `a0044b3485c0a1916326edcbdf2f350fa1fde46c`。
- CI: https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38997939311 ，workflow= D3-R1 G01-I typed runtime evidence，结论 **failure**（这是期望的旧实现拒止证据）。
- `bun install --frozen-lockfile` 退出 0、`bun run typecheck` 退出 0。
- `bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-r1-student.test.ts` 退出 1：1 PASS / 1 FAIL；错误包含 `D2_AUTHORING_INVALID ... 未映射结构化字段：studentScope`，说明旧 D1 不支持所需字段约束。Artifact #12087128585，保留期 30 天。

## 中途真实修复调试
- R1 中途提交 `58ebdd740f911ff035fc11efe2a5ec39bb21d1d1`，CI https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38998283875 （FAIL）：专项 7 PASS / 2 FAIL；修复了未知意图/不适用后门禁相互矛盾，以及新测试类型错误；同轮旧 Pi/D1/D2/D3 7 个文件 **52 PASS / 0 FAIL**。此失败保留，不得擦除。
- 绿色固定代码提交 `8a62fbe151951cf0248ca3b93fb327886ff16a9b`，CI https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38998459675 （SUCCESS）。
- `bun install --frozen-lockfile` 退出 0。
- `bun test --isolate --timeout 60000 apps/electron/src/main/lib/review/review-d3-r1-student.test.ts` 退出 0，**9 PASS / 0 FAIL**，其中使用真正的 `createD2TechnicalCase`、`registerMaterial`、`setEvidenceLink`、`preparePiReviewRunV2`、`submitPiReviewResultV2`、`verifyD2PiRun`。
- `bun run typecheck` 退出 0（所有 workspaces，包含 Electron）。
- 旧 D2 runtime + execution gates + D1 authoring + D3 portable handoff + Pi integration 等 **52 PASS / 0 FAIL**。
- 产出 Artifact #12088072721: `d3-r1-g01-probes-38998459675-1`，含 `source-head-sha.txt`、`checkout-sha.txt`、`install.log`、`student-tests.log`、`typecheck.log`、`regression.log`。CI 的 `checkout-sha` 可是 GitHub 的测试合并提交，不等于 `source-head-sha`；判定源码请用后一项。
- R0/C 独立 CI #38988460944 不算 R1 证据，A 的 49 规则 plan 也不是 R1 的两个字段运行结果。

## 扩展性测试的后续阶段
提交后添加了**显式多情景、拒绝未声明 case-scope、真实 CLI validate/save/read/diff→portable export/import→D2 preview/register/create** 等专项检查。此处若未补齐最终 workflow 实际日志，不得将其标记为通过；以 Draft PR #83 最新 workflow 的成功/失败状态为唯一实际依据。

## 执行权限区分
- GitHub workflow 是真实 Bun/TypeScript/本地合成 Pi 工具服务；`onlineModelRun=NOT_RUN`、`officialStudentSystem=NOT_CONNECTED`、`independentGold=UNREAD`。
- 配置目录为 runner 临时目录，测试完成删除；仅合成姓名/证件字段标签，未使用正式学生证件号。
- 原 D3-R0 冻结模块的回归命令：`node apps/electron/scripts/review-d3-r0-verify.cjs`，单列实际 CI 验证结果。
