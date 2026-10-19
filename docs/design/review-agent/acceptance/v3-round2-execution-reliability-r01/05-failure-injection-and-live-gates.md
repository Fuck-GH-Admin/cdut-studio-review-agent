# 05｜故障实验、真实 Provider 门禁与本轮执行清单

审计日 2026-10-19（UTC+8），本轮是 GitHub API **源码审阅**与**可执行性探针**，无可写源码工作树。**没有运行任何仓库级 Bun、Electron、Provider、ENOSPC 或校方业务测试**。本文件严格区分过去审计中留下的受控证据和本轮新的运行结果。

## 本轮真实执行命令、退出码和记录

| 时段/环境 | 原样命令 | 退出码 | 结果与日志 |
|---|---|---|---|
| 2026-10-19 05:51:39 UTC，沙箱 | `git ls-remote https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git HEAD` | **128** | `fatal: ... Could not resolve host: github.com`；无法克隆/独立工作树 |
| 同一环境 | `command -v bun` | **1** | Bun 不存在 |
| 同一环境 | `find /mnt/data -maxdepth 2 -name package.json` | **0** | 无结果，`/mnt/data` 无项目仓库可供运行 |
| 连接的 GitHub 仓库接口 | pinned SHA `fetch_file` 与 `fetch_commit`，以及独立 docs-only `create_branch/create_file` | API 请求成功；**无 shell 退出码** | 固定源/测试 blob SHA、文档内容；不能拿 API 成功冒充测试 PASS |

完整探针输出在当前执行沙箱：`/mnt/data/v3-round2-2c-evidence/environment.log`，SHA-256 `7c3d53c171e86f5442149aec63fa6e55c25360590744c14fdfdf1bd5a6d4bcfa`。关键失败原文：

```text
timestamp_utc=2026-10-19T05:51:39Z
command=git ls-remote https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git HEAD
fatal: unable to access 'https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git/': Could not resolve host: github.com
exit_code=128
command=command -v bun
exit_code=1
command=find . -maxdepth 2 -name package.json
exit_code=0
```

**没有可重现测试 logs**：本轮各测试统一 `NOT_RUN_THIS_ROUND`，退出码 `N/A`，失败日志 `N/A`。已读取并逐条记录过往通过/失败的来源，不将过往通过重标本轮通过。

## 历史实验与限定结论（第一轮、第 1.5 轮移交）

| 风险和能力 | 历史来源、实际已知状态 | 2C 静态判断 | 当前仍需什么 |
|---|---|---|---|
| EXP-05 Provider tool_use/真实提交 | [74 号报告 @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/docs/design/review-agent/74-p06-l02-u1-pi-provider-local-result-20261018.md)：在 PR #114 SHA `cf8c5f36...` 独立 Electron/Main/IPC 和 Pi SDK 0.86.1 的 active/model-facing 五工具核验 PASS_SCOPED；无授权测试 Provider 凭据，transport 前停止 | 真正 Provider `tool_use` → Host gate → Main execute → tool_result → V2 Run/SourceRef **BLOCKED_ENV** | 有授权合成测试渠道的真实请求 ID、完整工具回执、Main/Run 交叉快照；不能伪造 |
| EXP-06 P02 迟到 session 恢复 | [79 号报告 @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/docs/design/review-agent/79-p06-l02-u1-unified-local-result-20261018.md)：初次 Electron 失败与后续修复 scoped PASS；Owner UUID journal 和投影防复活受控测试 | 当前 Owner 源码持久 tombstone/journal，不能把前端隐藏当安全 | kill/restart，旧 `.bak`，after-await 消息迟到，Pocket/Relay 综合实机负例 |
| EXP-06 Office 原件交叉串源 | 历史同名 DOCX/XLSX/PPTX 首败、#110 后 scoped PASS（79 号报告） | sourceRoot/docVersionId/realpath 验证存在 | Windows/macOS、解析缓存、同名不同 hash、多图/扫描材料 |
| EXP-07 ENOSPC | 历史 PR #116 的 `/dev/full` CONTROLLED_KERNEL_IO 有通过记录；79 号本机有限容积 mount 权限阻断 | assignment pending deny/atomic JSON、run interrupted fencing 有静态实现 | 真正满卷 + kill -9 + **不同 PID** 恢复，终态未写/ACK 已发/授权撤销路径 |
| EXP-08 Pi 9 项漏结论+算术 | [12 号首败报告 @main](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/docs/design/review-agent/12-template-audit-failure-analysis-and-repair.md)：9 项缺结论、1,680 对 1,480 差额 200、已检任务被误当人工 | R03 requiredToolKeys、execution-failed 占位、D4 repair 提示缓解技术漏项；`v2-executor-factory` 实现计算，但未证明新版本新样例稳定命中 | 无答案泄露的真实逐材料输入 → 逐 Check 和数值来源，预算差 200、缺行/重复票号、图片延迟 |
| EXP-01 大工具输出/压缩 | main `13-single-agent-framework-trial.md` 仅实验与可借鉴思想，不证明 Deep Agents 已产品集成 | Pi review Compaction 摘要包含 Run read/check/rejected checkpoint | 正式 CompactContext 前后同 runId 与工具权限实机证据 |
| BG-05 revoke/late-write | 历史 Main 撤权测试 scoped PASS、R03 pendingRevocations 代码 | 在 current PID 异常写盘时拒止；跨进程/恢复尚无真卷闭环 | 在 read/preview await、submitted check 后，终态失败、runId 更新、重启所有交错点复测 |
| BAT-06 跨批 Run | R02/R03 静态、R02 专项测试源码及 R03 同案异 Run 测试源码 | 应 fail closed；R02 双绑定与 R03 ID 绑定**没有等价证明** | 同时多批+身份窜改+旧 `done`+finalize/系统 actor 内层调用的端到端测试 |
| EXT-01 Outbox | [external-ports.ts @main](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/external-ports.ts) 当前主要 MockSchoolAdapter/LocalPackageAdapter；[batch-store.test.ts @R03](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/batch-store.test.ts) 有 pending 恢复等测试源码 | 原始 payload WAL/持久 actionId/冲突处理有代码，但两阶段本地事务和远端幂等未真实联调 | 获得真正 SchoolPort sandbox 授权前保持 **NOT_TESTED_REAL_SCHOOL** |

历史 CI 不是当前实验：#114 记录 4012 passed / 5 skipped、真实 Provider 阻断；#116 记录 4014 passed / 5 skipped、真实满卷阻断。上述数字和状态只引自指定历史记录，不是本轮计数。

## 可供本机 Agent 后续实际执行的冻结命令（本轮 NOT_RUN）

必须独立工作树，自含目录/临时用户 profile；对每条命令保存 stdout/stderr、环境、exit code、源码 SHA、日志 hash，负例原始首败不可覆盖。推荐使用仓库已有脚本名称和文件路径，先固定其当前存在情况。

```bash
# 在具有 GitHub 网络、bun 的授权隔离主机执行；以下全部 NOT_RUN
git clone https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git v3-round2-2c
cd v3-round2-2c
git fetch origin
git worktree add --detach ../v3-round2-2c-r03 db0284879f75ce123b5d83cb6577a3cc7ad057da
cd ../v3-round2-2c-r03
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/pi-review-agent-client.test.ts
bun test apps/electron/src/main/lib/review/pi-case-review-service.test.ts
bun test apps/electron/src/main/lib/review/batch-automation-service.test.ts
bun test apps/electron/src/main/lib/review/batch-group-action-service.test.ts
bun test apps/electron/src/main/lib/review/batch-store.test.ts
bun test apps/electron/src/main/lib/agent-orchestrator-review-tool-gates.p06.test.ts
bun test apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts
bun test apps/electron/src/main/lib/agent-session-delete-projection.p02.test.ts
```

**禁止直接执行**：没有受控测试凭据就不能向 Provider 发送隐私材料；没有学校测试凭证就不能发任何真实学校写操作。Electron 实机应开启全新隔离 profile，日志要截除 token、学生身份证明、真实校方数据。容积不足测试只在有权限的隔离卷内注入，不能对共享宿主或生产卷填满空间。

## 永久负例门禁列表

1. **Provider** 实际 `tool_use/tool_result`；仅 active set 不够，SDK `getAllTools()` 可出现未激活通用工具，禁止把“有定义”错当“可使用”。
2. 未授权 `Bash/MCP/read/write` 与跨案、`../`、符号链接、原件 root；`await` 期间撤权后不登记读取成功。
3. Pi 24 轮耗尽、被拒 Check、部分成功提交、Provider 5xx/timeout、abort；技术异常保留 `execution-failed`，无摘要兜底须验证 **全部 required keys 已被有效接受**。
4. 9 项实际计划必须 9 项可追溯结果；同一组遗漏、人工不适用、不完整 OCR 均不能变全绿；金额 1680/1480 = **200**，无隐含答案字段。
5. Owner delete/backup 回滚/迟到 upsert、stop/abort/restart，以及 Main 内 ACK 与真实 Run 单一事实一致。
6. 两批同案同模板，`A.runId≠B.runId`，旧批不能取新 Run；无绑定 `done` fail closed；重试/补件清旧绑定；批次定稿正式决定 Run 归属。
7. ENOSPC 或 EACCES 在写 run、撤权、outbox pending、outbox receipt 后立刻 kill/restart，不报假成功；重复 actionId 相同载荷幂等、不同载荷拒绝、外部状态未知保持 pending。
8. 模拟校方或离线包回执不得标为 `school:accepted` 或真实行政审批证据。
