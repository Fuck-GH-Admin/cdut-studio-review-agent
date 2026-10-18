# 86｜P06 E06 普通 Agent 独立兼容性入口（2026-10-19）

> E06 在本仓历史定义中是普通 Agent / 工具权限 / Preview / 会话恢复 / 多端兼容性。**不是** L02-01 后续 E05 业务集中验收。当前独立 Draft PR #127；源父候选是 PR #121 固定 HEAD `4f8a68e26e5276e61883fa53c21447a703bbf94d`，冻结 PR #118 和 29 号 LIVE 台账都只读。

## 既有证据和独立判断

- 历史 46 号 E06：真实 Pi create/list/meta/send、Read/Write 允许与拒绝、Stop、文本预览、PDF/Office 部分预览、重启子集有真实运行记录；其固定版本为 `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027`，不代表当前 PR #127 HEAD。
- 历史 Claude runtime、fork/双窗完整恢复、Windows/macOS、生产 Relay/Pocket 仍 NOT-RUN/BLOCKED；A/B/C 的技术队列部分通过不等于业务真实闭环。不能拼成 E06 FULL PASS，更不能放行 P08。
- 本次仅提升 **实际实机驱动的证据质量和安全前置门禁**：不修改生产 Agent Orchestrator、Pi 工具白名单、审核 Owner、case-store、SchoolPort、隐藏 Gold 或旧实机 evidence。

## 本轮源码

- `scripts/qa/review-live-e06-contract.mjs`：独立 profile、40 位候选 SHA、既有 Pi 授权配置预检；四条基础 Pi lane 任意空断言假 PASS、重复 ID、失败 witness 判 FAIL；基础子矩阵全 PASS 也只允许 E06 总结 PARTIAL。
- `scripts/qa/review-live-e06.mjs`：在创建普通会话/发出收费模型请求前锁 Git HEAD、profile、模型；执行真实 CDP 后读取工具 SDK 返回中合成唯一标记；Provider 库存记录改 INFO；结果只写有限结构化事实，不上传原始 Pi 对话或 token；初始 create 进入 finally，保证普通会话清理。
- `scripts/qa/review-live-e06-contract.test.ts`：离线正反测试、脚本 Node 语法检查。CI 只证明脚本可执行与证据契约，**不是**当次实际 Electron + provider 运行。

## E06 执行入口

真实执行应由独立本机 Agent 按 [现场任务书](acceptance/p06-e06-ordinary-agent-r01/local-agent-task.md) 在具有授权 Pi、隔离 CDUT profile、可运行 Electron 及 CDP 的设备上进行。所有历史缺失的 Claude、fork/双窗、跨平台、SchoolPort / Pocket / Relay 必须另有真实回执；无法执行如实标 `BLOCKED_ENV`、`NOT-RUN`，不得新造截图或成功 exit。

阶段为 **E06_ENGINEERING_TEST_HARNESS_READY**（须以最新 HEAD CI 证明），并非 **E06_LIVE_PASS**。保持 `P06 PARTIAL / L02-01 E05 NOT RUN / LIVE-08 PARTIAL / MERGE NO-GO`，PR #127 持续 Draft，不越权修改旧 PR #118/121、29 台账或启动 P07/P08。
