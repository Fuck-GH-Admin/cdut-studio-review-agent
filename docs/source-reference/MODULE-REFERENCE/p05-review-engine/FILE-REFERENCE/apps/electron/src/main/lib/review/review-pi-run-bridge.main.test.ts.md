---
path: apps/electron/src/main/lib/review/review-pi-run-bridge.main.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ac3802f97bd0999857d225de29e3c63dafe5d1b9
sha256: e9d0197d71bf54ebe03b73a920f4162f1cdad8c396b71150605258a2f075b70e
lines: 309
kind: test
package: p05-review-engine
author: docs-r07-author-models-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-pi-run-bridge.main.test.ts

## 1. 测试目标

`review-pi-run-bridge.ts` 的 **Main 薄接线集成测试**：用真实 V2 运行/会话/指派/IPC 模块，只把 `../agent-service` 换成受控执行器（mock），验证启动受理时序、ACK 不泄漏内部 ID、同案互斥、续交、停止身份、模型选择、迟到回调隔离与 IPC sender 边界。12 个 `test(`，全部在 `describe('后台 Main 入口与受理边界')`（`:74`）内。

## 2. 用例清单

### 2.1 夹具与 mock（`:11-72`）

- `configDir = mkdtempSync(tmpdir()/review-main-bridge-)`，`process.env.PROFER_CONFIG_DIR = configDir`（`:11-12`），`afterAll` 递归删除（`:13`）。
- `executions`（`:14`）：每次 `runAgent` 调用压入 `{input, owned, end}`；`active`（`:15`）模拟 orchestrator 活跃会话；`stopGate`（`:16`）用于阻塞停止。
- `mock.module('../agent-service', ...)`（`:17-30`）：
  - `isAgentSessionActive(id)` = `active.has(id)`；
  - `runAgent(input,_wc,_promotion,owned)` 返回 pending Promise，`owned()` 把 sessionId 加入 active 并调用真实 `onRunOwned`；`end(status)` 调 `input.onRunOutcome({status, error:'合成执行失败' if failed})`、移出 active、resolve；
  - `stopAgentAndWait(id)` 若 `stopGate` 存在先 await，然后对最后一条该会话执行 `end('stopped')`。
- 之后动态 import 被测模块与真实依赖（`:31-45`）；`windowContents` 为 fake WebContents（`:46`）。
- 渠道：`provider:'deepseek'`、`enabled:true`、`models:[{id:'synthetic-model',enabled:true}]`（`:47-48`）；应用设置 `agentChannelId/agentModelId` 指向它（`:49`）；审核模块设置显式选择同一渠道/模型（`:51`）。
- `fixture()`（`:53-64`）：生成唯一 templateId，模板含 1 个 `execution:'semantic'`、`targetScope:'case'` 的检查项；`saveDraft` + `publishTemplate` + `createCaseFromTemplate`，返回 caseId。**注意**：`createCaseFromTemplate` 默认 `stage:'draft'`（`application-service.ts:205`），而 bridge 不拒绝 draft（`review-pi-run-bridge.ts:26-107` 无 stage 门禁；`pi-case-review-service.ts:456` 只拒 archived）。**用例与 draft 的关系要分开看，不能概括为"全部成功"**：使用 `pendingExecution()` 的 10 个用例（1、2、3、4、6、7、8、10、11、12）都在 draft 案卷上成功走到启动；用例 5（`:151-160`）虽然用 `fixture()` 建的是 draft 案卷，但 `startBackgroundPiReview` 因渠道停用/非法参数被拒（断言 `'停用'`、`'非法 caseId'`、`'模式非法'`），不是成功启动；用例 9（`:210-224`）只直接创建 assignment，不建案、不启动运行。**没有任何用例断言 draft 被拒绝**——draft 门禁不是本测试的对象。
- `pendingExecution()`（`:65-72`）：建案 → `startBackgroundPiReview({caseId}, windowContents)` → 轮询 `Bun.sleep(0)` 直到 `executions` 增长 → 返回 `{caseId, admission, execution}`。**注意 `admission` 是尚未 await 的 Promise**。

### 2.2 用例

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:75-97` | `pendingExecution()` | 未 `owned()` 前读状态；`owned()` 后 await admission；`end('completed')` | `:78` `before.phase==='preparing'`；`:82` `settled===false`；`:85` `receipt.phase==='accepted'`；`:86` `'sessionId' in receipt === false`；`:87` `'assignmentId' in receipt === false`；`:89` `meta.owner` 等于 `{kind:'review-case',caseId}`；`:91` `meta.workspaceId===ensureDefaultWorkspace().id`；`:92` `meta.attachedDirectories` 长度 1；`:95` 结束后 phase `'incomplete'`；`:96` 运行 `partially-completed` |
| 2 | `:99-109` | 同上 | 未 owned 时第二次 start；owned 后第三次 start；`end('failed')` | `:101` 第一次拒绝含 `'正在启动或停止'`；`:104` 第二次拒绝含 `'已有审核正在进行'`；`:105` 原运行仍 `running`；`:108` `error==='合成执行失败'` |
| 3 | `:111-135` | 第一轮 completed | 断言上一轮部分完成；写入一个 startedAt=2099 的 `run-t04-after-pi`；`mode:'update'` 再启动 | `:118` `previous.status==='partially-completed'`；`:119` 存在 `execution-failed` 检查；`:130` `continued.runId===receipt.runId`；`:131` 复用同一 sessionId；`:132` 运行 `running` |
| 4 | `:137-149` | 一轮 running | 用未知 runId 停止；用另一案卷 + 正确 runId 停止；再用正确身份停止 | `:141`/`:143` 均拒绝含 `'运行已变化'`；`:144` 错误身份后会话仍 active；`:146` `state.runStatus==='cancelled'`；`:147` active 已移除；`:148` 绑定 `undefined` |
| 5 | `:151-160` | 新建案 | 停用渠道后启动；恢复后传 `../../bad`；传 `mode:'bad'` | `:155` 拒绝含 `'停用'`；`:157` 拒绝含 `'非法 caseId'`；`:158` 拒绝含 `'模式非法'`；`:159` 会话总数不变 |
| 6 | `:162-180` | 第一轮 completed | 把会话 preset 改成 `DEFAULT_PRESET_ID`、清 presetReference；再启动 | `:175` 新执行使用**不同** sessionId；`:177` 新会话预设为 `'review-operator'` |
| 7 | `:182-194` | 新建 `selected-model` 渠道并写审核显式选择 | 启动 | `:188` `input.channelId===selected.id`；`:189` `input.modelId==='selected-model'`；结束后恢复默认选择（`:193`） |
| 8 | `:196-207` | 审核选择置 null、应用设置指向合成渠道 | 启动 | `:202` `input.channelId===channel.id`；`:203` `input.modelId==='synthetic-model'`；结束后恢复（`:206`） |
| 9 | `:210-224` | 同 session 两个 assignment，分别绑定 run，直接改 JSON 把 `createdAt` 改成同一毫秒 | 调 `findActivePiReviewAssignment` | `:223` 返回 `current.id`（后插入者胜出） |
| 10 | `:226-251` | 第一轮 failed；第二轮 `mode:'update'` | 检查旧指派、启动第二轮、尝试停旧 run、投递迟到旧回调 | `:233` 旧指派 `checkAssignment(...).code==='ASSIGNMENT_REVOKED'`；`:238` 复用同一 session；`:241` 新 runId 不同；`:242` `phase==='accepted'`；`:243` 停旧 run 拒绝 `'运行已变化'`；`:245` 旧 run error 仍 `'合成执行失败'`；`:246` 新 run `running`；`:247` 新会话 active；`:250` 第二轮结束后 `partially-completed` |
| 11 | `:253-285` | `stopGate` 阻塞停止 | 启动 stop（不 await）、restart 被拒、释放 stopGate、再 restart | `:261` restart 拒绝 `'正在启动或停止'`；`:262` 停止期间运行仍 `running`；`:264` stop 结果 `cancelled`；`:265` active 已移除；`:274` restart 使用新 session；`:277` 新 runId；`:278` 停旧 run 拒绝；`:280` 旧 run 仍 `cancelled`（迟到回调不改）；`:281` 新 run `running`；`:282` 新会话 active |
| 12 | `:287-308` | 清空 `globalThis.__proferElectronTestHooks.ipcMainHandlers`，`registerReviewIpc()`，`setMainWindow(fake)` | 用非主窗口 sender 调 START/STOP；用真实绑定调 PREPARE/ABORT/ASSIGNMENT_REVOKE；读 GET_PI_REVIEW_SESSION/ASSIGNMENT_LIST | `:293`/`:294` 抛含 `'仅允许'`；`:299`/`:300`/`:301` 均 `toThrow()`；`:302` `GET_PI_REVIEW_SESSION` 返回 `null`；`:303` `ASSIGNMENT_LIST` 不含该 sessionId；`:304` 运行仍 `running`；`:307` 结束后清理 `setMainWindow(null)`（`:306` 是 `await Bun.sleep(0)`） |

## 3. 真实断言

- 时序类断言是核心：`:78`（preparing）、`:82`（admission 未 settle）、`:85`（accepted）共同证明"ACK 只在执行权授予后返回"；`:86-87` 证明返回对象不含内部 ID。
- 归属类：`:89` 深比较 owner；`:91` 默认工作区；`:92` 附加目录 1 个。
- 失败/终态类：`:96`、`:108`、`:250`、`:280` 依赖 `finishPiReviewRunV2` 的 `completed→partially-completed`、`failed→failed`、`stopped→cancelled` 映射（`pi-case-review-service.ts:1142`）。
- 安全类：`:233` `ASSIGNMENT_REVOKED`；`:243`、`:278` 旧 runId 停止被拒；`:293-294` sender 校验；`:299-303` 旧入口不能操作新 owner。
- 这些断言均未调用真实模型；`runAgent` 被 mock，`onRunOutcome` 由测试手动触发。

## 4. 未覆盖与脆弱点

未覆盖：

- `resumeInterrupted:true` 的冷启动续交路径与 `interruptedResumeGate` 的拒绝文案（用例 3 只覆盖普通 `partially-completed`）。
- `isWorkspaceRunStaleV2` 为 true 时禁止续交。
- admission 失败（`runAgent` 在 `owned()` 前 reject）时 bridge 的补偿分支（`review-pi-run-bridge.ts:95-102`）。
- `preparePiReviewRunV2` 的归档/模板变化/输入哈希变化/无未完成项等失败。
- **draft/archived 门禁**：走 `pendingExecution()` 的用例在 draft 上成功启动；用例 5 在 draft 上被渠道停用/非法参数拒绝；用例 9 不建案。因此没有任何用例断言 draft 被拒绝（bridge 实际不拒绝）；也没有 archived 案卷的用例。
- 渠道 provider 非白名单（bridge 本身不查白名单，用例只测 `enabled:false`）。
- `inheritReadReceipts` 的实际继承结果与 `userMessage` 内容。
- 真实 orchestrator 的并发锁、真实 Pi 工具调用、真实模型/网络。

脆弱点：

- 大量 `Bun.sleep(0)` 轮询（`:69`、`:81`、`:94` 等）依赖事件循环调度顺序，慢机器上可能不稳定。
- 用例共享渠道/设置（`:47-51`），5/7/8 在失败前未恢复会污染后续用例；用例 9 直接改写 `review-agent-assignments.json` 的内部形状（`assignments[].createdAt`），存储格式变化即失效。
- 依赖 `globalThis.__proferElectronTestHooks`（`:288`）与 `setMainWindow`（`:291`、`:307`），属测试专用注入。
- `executions.findLast`（`:28`）需要支持 `findLast` 的运行时。
- 用例 6 依赖 `DEFAULT_PRESET_ID` 与 `review-operator` 两个预设常量；预设体系调整会破坏断言。
- `afterAll` 只删配置目录，不重置 `stopGate`/全局 hooks；用例 11 在 `finally` 中释放 stopGate（`:266-269`），但异常路径仍可能残留。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个用例，全部通过真实 V2/会话/指派模块，仅 mock agent-service | 已证实 | `:17-31`、`:74-308` |
| 受理 ACK 在执行权授予前不 resolve | 已证实 | `:78`、`:82`、`:85`；`review-pi-admission.ts:186-192` |
| 返回状态不含 sessionId/assignmentId | 已证实 | `:86-87`；`review-background-state.ts:20-53` |
| 显式审核模型优先于应用全局 | 已证实 | `:182-194` |
| 未显式配置时回退全局 | 已证实 | `:196-207` |
| 旧 run 的迟到回调不能改新运行 | 已证实 | `:244-246`、`:279-282` |
| 停止必须等执行权释放后才能 restart | 已证实 | `:253-285` |
| IPC 只接受主窗口 sender | 已证实 | `:293-294`；`ipc-sender-guard.ts:30-34` |
| 这些用例是否真实通过 | 未知 | 本轮 `NOT_RUN`，只读断言 |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| preparing→accepted 时序/ACK 形状 | §2、§3 | `:75-97` | covered |
| 忙/重复启动 | §2 | `:99-109` | covered |
| F09 续交 | §2 | `:111-135` | covered |
| 停止身份 | §2 | `:137-149` | covered |
| 停用/非法入参 | §2 | `:151-160` | covered |
| 预设复用边界 | §2 | `:162-180` | covered |
| 显式/回退模型 | §2 | `:182-207` | covered |
| 指派并列/迟到回调 | §2 | `:210-251` | covered |
| 停止释放后重启 | §2 | `:253-285` | covered |
| IPC sender/旧入口 | §2 | `:287-308` | covered |
| 冷启动续交/补偿/stale | §4 | — | unknown（未覆盖） |
