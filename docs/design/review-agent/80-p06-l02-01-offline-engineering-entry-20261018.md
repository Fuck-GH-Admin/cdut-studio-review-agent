# 80｜P06｜U1 集中验收归档与 L02-01 离线工程阶段入口（2026-10-18）

> **两个不同判词**：`U1_ACCEPTANCE_CAMPAIGN=CLOSED_SCOPED_PARTIAL` 表示用户决定本次集中验收活动结束、历史结果固定归档；**并非** `U1_FULL_PASS`、`P06-S02_PASS`、`L02-00_EXIT_ACCEPTED` 或 `L02-01_LIVE_ADMITTED`。
>
> **当前工作进入 L02-01 的开发工序**：在不依赖在线 Provider 的情况下，完善已存在的人工决定、补件回流、V2 command 幂等、批次副作用与版本/授权冲突的实现和受控回归。先修产品缺陷、集中后验收；不把每个补丁转换成单次 Electron 实机测试。

## 1. 固定继承与证据

- 验收历史：Draft PR [#118](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/118)，HEAD `3baf1fc2ccf27607f948923dbf5aff26d984729e`，79 号报告及完整 `acceptance/p06-u1-unified-local-r01/`。本轮 **只读**，不改其断言/源 SHA/原始日志。
- 本轮 Draft PR #121：`feat/p06-l02-01-offline-business-closure-r01`，从 #118 固定 HEAD 建分支。生产变动必须保持极小；独立 CI 以最终 HEAD 为准。
- P02 已通过真实删除回执兼容，Office #71 已取得真实同名异源证据，真实 Electron/Main/SDK 五工具、Owner 隔离和 SourceRef 跨案拒绝均为 **PASS_SCOPED**；不重复全部复测。
- 79 号遗留：`PI_PROVIDER_TOOL_RECEIPTS=BLOCKED_ENV`、在线撤权及 A/B/C `NOT-RUN_GATE`；真实满卷/故障跨 PID `BLOCKED_ENV`；Office #71 上游移植 `BLOCKED_UPSTREAM`；r12 登录 UI 仅 `PASS_SCOPED`，原始记录不完整。终端发布 `P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO / L02-01 LIVE NOT ADMITTED`。
- 并发 D4 P2-A/B/C 使用其独立基线和 PR #117/#119/#120；禁止把它们直接合并进本工序，也不声称已覆盖其 API 差异。29 号唯一 LIVE 台账不更改。

## 2. 本轮工程目标及边界

依照 47 号的 L02-01 意图，但本轮仅推进 **offline implementation and regression**，尚不能进行正式 live business acceptance：

1. **人工决定契约**：`stage-workflow.ts` 的 `recordStageDecision` / `resolveSupplementV2`、正式阶段角色、V2 revision、task、decision、supplement 和回执不重复；模型意见不能自动生成校方决定。
2. **补件回流**：open→responded→satisfied 后仅触发一次 queue side effect，不允许同一 `requestId` 的迟到重放在业务已经推进后重新把 `done` 改成 `queued`；`insufficient`、跨案、旧版/错角色不放行。
3. **严格幂等和版本冲突**：同 `requestId + payloadHash` 只取缓存回执，不能再次触发外部副作用；相同 ID 不同 payload 必须 `REQUEST_ID_COLLISION`；旧 revision 进入 `VERSION_CONFLICT`；已决定 Task 不得重复操作。
4. **批次事实与自动化防线**：继续使用 `case-store-v2.ts` 的唯一事务、`batch-store.ts` 的既有队列/状态，复用 `stage-workflow` / 正式权限服务，不新建状态机/账本/伪 Provider；默认无授权不允许自动审批。补件结束不等于模型审核成功或人工正式批准。
5. **工程开发节奏**：离线代码与合成测试按合理模块连续推进；只有阶段性固定版本跑 CI。最终具备合法 Provider、独立安全卷及必要外部资源时才统一跑剩余真实 E2E；若没有这些资源，保留相应状态不阻断独立离线开发。

## 3. 第一处实际发现：补件重复请求的队列副作用

新增 `apps/electron/src/main/lib/review/stage-workflow-l02-01-idempotent-batch.p06.test.ts`，用真正 V2 Aggregate + stage workflow + 持久 batch storage：

- 首次满足补件会把队列从 `done` 重新设为 `queued`，然后另一个操作确实能推进批次状态；
- **重放同一满足请求应只回放 V2 receipt，不能再次重排批次**；
- 人工阶段决定的相同请求只能产生一条决定；篡改同 ID payload、旧 revision 不得通过。

首次 PR #121 CI [#39132697022](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39132697022) 验证发现 `same ResolveSupplement request replay must not requeue a batch already marked done` **RED**：`Expected done / Received queued`。源码原本在 `submitCommand` 已按 `requestId` 返回缓存回执后，仍调用 `requeueCaseAfterSupplement`，重复写入批次队列。修补以 `result.entity !== undefined` 明确区分本轮真正执行和旧缓存回执（这是当前 `submitCommand` 明确返回形状）；**仅新执行的成功满足操作触发原有 requeue**，不修改其他工作流合同。保留首次 RED，不重写历史。

同一首次完整 CI 另出现不在本改动范围内的 `goal-session-service.test.ts` 异步用例 `空白证据或无运行终态不能被桥接改回成功`：Expected failed / Received active。初步作为 **INDEPENDENT_FAILURE_PENDING_ATTRIBUTION**，不是凭一次结果声称 flake，也不能无独立复验直接归因为本轮补件修复。后续 CI 根据最终同 SHA 独立核验；若仍失败应隔离验证 Goal 代码路径、时序和 runner 环境，不顺手改非目标生产代码求绿。

## 4. L02-01 下一批次开发清单（待独立工程执行）

| 任务 | 实际代码/证据要求 | 是否依赖 Provider |
| --- | --- | --- |
| E01 补件事务/批次幂等 | 重放不得触发二次 batch requeue；旧 revision / payload collision；首次回流正例；固定 HEAD CI | 否 |
| E02 正式人工决定及授权 | reviewer/teacher/student 阶段权限、拒批与通过、未确认意见不可直接通过、任务终态、独立 V2/receipt 验证 | 否（可控制输入） |
| E03 补件后重新审核与批次回收 | 文件版本变化、补件不足再回复、强制输入重锁、旧 run 结果失效、多个补件聚合、重复事件 | 否（仅可做受控） |
| E04 自动授权/拒止与出站幂等 | 显式人工+模板+全局授权、失效授权、批次定稿 outbox/idempotency；不得模型自行代批 | 可离线准备 |
| E05 独立最后集中验收 | Provider 真 tool→V2→A/B/C，严格原件和压缩；独立真满卷/跨 PID、UI、外部 Relay/Pocket | 是/需对应环境 |

**下一工程回合只处理未满足 E01～E04 的代码缺口，不为已经完整覆盖的模块重复堆测试。** 与 L02-02 严格原件/长上下文的正式阶段顺序不冲突：E05 前统一梳理 E02–E04 完成度再定 test matrix。

## 5. 交付和准入

- 本轮所有提交保留一个独立 Draft PR #121，明确 source/test SHA、CI 首败与修补版本、普通 Agent/Pi/Review V2 的回归，不覆盖 #118 的证据。生产代码更改后必须运行新的固定 SHA typecheck/full PR CI 和与 batch 相关的 scoped tests。
- `L02-01_OFFLINE_DEV` 可以 `IN_PROGRESS` 或在范围完成后 `REMOTE_CONTROLLED_PASS`。**`L02-01_LIVE` 不能因该标记变成 `ACCEPTED`**；C 原始案的身份、模型回执和人工决定仍要按 47、59、79 核对。
- 不触碰 main、原上游、Gold、29 LIVE、不合并 Draft PR，不进入 P07/P08。
