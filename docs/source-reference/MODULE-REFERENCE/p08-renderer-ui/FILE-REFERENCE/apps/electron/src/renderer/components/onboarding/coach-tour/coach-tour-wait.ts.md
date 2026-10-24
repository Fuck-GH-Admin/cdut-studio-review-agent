---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-wait.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34bcbd58190c0c1cb6f59a88f6812df990195304
sha256: 90ec4c861fcf31cd9f3200aaf7f0d4e7e73851745b353dbc939b7680fc92fdfe
lines: 250
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-wait.ts

## 1. 结论与边界

**引导步骤业务等待状态机**（250 行）：五类等待（Agent 回合、CDUT 登录、桌宠回合、CSLab 验密、任意选择器），核心规则是「先见 running 后见 idle 才算完成」防上一步残留误判，另加快发快回基线兜底（错过上升沿时以进入步骤时刻为基线判定）；任何等待都有超时，**超时只上报 timeout 不自动关闭引导**（注释 `:9`）。

边界：步骤数据类型来自 `coach-tour-steps.ts`；消费方只 `CoachTourOverlay`；桌宠状态经 `window.electronAPI.yanhuExpress.petGetChatStatus` 轮询（主进程域外）。

## 2. 导出与关键符号

导出计数：`export` **7 条**（`:15`、`:17`、`:20`、`:31`、`:43`、`:57`、`:101`），与源码逐条一致。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CoachTourWaitStatus` | 类型 | 15 | `'idle'\|'waiting'\|'done'\|'timeout'` | |
| `AgentTurnPhase` | 类型 | 17 | `'awaiting-send'\|'running'\|'done'` | |
| `reduceAgentTurn` | 函数 | 20-28 | `(phase, running, backgroundWaiting) => AgentTurnPhase` | 纯状态转移 |
| `AgentStreamBaseline` | 接口 | 31-34 | `{startedAt, contentLen}` | 快发快回基线 |
| `agentWaitShouldCompleteByBaseline` | 函数 | 43-50 | `(baseline, current) => boolean` | 快发快回兜底 |
| `petWaitShouldCompleteByBaseline` | 函数 | 57-62 | `(baselineDoneAt, lastDoneAt) => boolean` | 桌宠兜底 |
| `useCoachTourWait` | 函数 | 101-250 | `(args) => {status, message}` | 主 hook |
| `DEFAULT_TIMEOUT_MS` | 内部常量 | 64-70 | agent-idle 240s/cdut-active 60s/pet-idle 180s/cslab-verified 180s/selector 120s | |
| `MESSAGES` | 内部常量 | 93-99 | 各 kind 等待文案 | |

## 3. 内部逻辑与关键流程

- **reduceAgentTurn**（`:20-28`）：`done` 终态保持；`awaiting-send` 仅在 `running` 时进 `running`；`running` 仅在 `!running && !backgroundWaiting` 时 `done`（**后台任务在飞不算完成**）。
- **agentWaitShouldCompleteByBaseline**（`:43-50`）：`startedAt > baseline.startedAt`（新回合）→ true；同回合且 `contentLen > baseline.contentLen`（内容增长）→ true；否则 false（注释 `:36-42`：应对 running 上升沿发生在两次渲染之间被错过）。
- **petWaitShouldCompleteByBaseline**（`:57-62`）：`lastDoneAt !== null && lastDoneAt > baselineDoneAt`。
- **hook 结构**（`:101-250`）：
  - 切步/换会话重置（`[stepKey, sessionId]`）：phase→awaiting-send、记 Agent 流式基线（`streamMetaRef` render 期镜像，`:120-123`）、pet 基线→null、status→idle（`:126-134`）。
  - pet 基线快照（`:139-153`）：进入 pet-idle 步骤瞬间 `petGetChatStatus().lastDoneAt`（catch 保持 null 只走上升沿，`:147-149`）。
  - agent-idle effect（`:156-168`）：`reduceAgentTurn` + 基线兜底（仅 `awaiting-send && !running && !backgroundWaiting` 时用）；status = done ? done : waiting。
  - cdut-active（`:171-174`）/cslab-verified（`:177-180`）：布尔直通。
  - pet-idle（`:183-213`）：700ms 轮询 `petGetChatStatus`；`awaiting-send→running` 上升沿；`running→!running` = done；`awaiting-send && !running` 时走基线兜底（注释 `:196-197`：秒发短指令可能在轮询间隔内完成整轮）。
  - selector（`:216-234`）：250ms 轮询 `document.querySelector` 可见（`getClientRects().length > 0`）即 done。
  - 超时（`:237-242`）：`status==='waiting'` 时 `waitFor.timeoutMs ?? DEFAULT_TIMEOUT_MS[kind]` 后 `setStatus('timeout')`。
- **返回**（`:244-249`）：timeout → 「等待超时，可点击下一步继续」；否则 `MESSAGES[kind]`（如「正在等待模型完整回复…」）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep coach-tour-wait|useCoachTourWait|reduceAgentTurn|ShouldCompleteByBaseline`，apps+packages 全类型）：
  - `CoachTourOverlay.tsx:40` import、`:138-149` `useCoachTourWait({enabled: open && runner.phase==='ready' && step.advanceOn==='wait', ...})`（`running`/`backgroundWaiting`/`contentLength`/`startedAt` 来自 `agentSessionStreamingStateAtomFamily`，`cdutActive`/`cslabVerified` 来自 atoms）。
  - `coach-tour-wait.test.ts:2-6`（同批专属测试，13 用例测三个纯函数）。
- 出向：`./coach-tour-steps` 类型；`window.electronAPI.yanhuExpress.petGetChatStatus`（`:142`、`:189`）；React。

## 5. 数据 I/O、读写与副作用

- 输入：会话流式状态（running/backgroundWaiting/contentLength/startedAt）、CDUT/CSLab 布尔态、桌宠状态轮询结果；输出 `{status, message}`。
- 磁盘/网络：无直接（桌宠 IPC 经主进程）。
- 副作用：轮询定时器（pet 700ms、selector 250ms）、超时定时器；均 cleanup（`:209-212`、`:230-233`、`:241`）。

## 6. 分支、失败、取消与恢复

- 超时：只置 `timeout` 状态（不自动关引导、不重试），用户可手动下一步（注释 `:9`、Overlay 文案）。
- 轮询失败：pet 轮询 catch 保持等待由超时兜底（`:203-205`）；基线快照失败保持 null 只走正常上升沿（`:147-149`）。
- 取消：所有 effect cleanup 置 `cancelled`/清定时器；切步即重置状态（`:126-134`）。
- 恢复：无持久状态；同一步骤内超时后 status 停在 timeout（effect 依赖 `status !== 'waiting'` 不再起新定时器，`:238`）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；输入均为已授权 UI 状态。
- 权威状态：Agent 回合（会话流式 atoms）、桌宠（主进程 `petGetChatStatus`）、CDUT/CSLab（atoms）——hook 只观测不改写。

## 8. 修改影响面

- 唯一消费者 `CoachTourOverlay`（`enabled` 条件与 status 驱动 auto-advance/waiting 文案）。
- `CoachTourWait` 类型（`coach-tour-steps.ts:72-77`）与 `DEFAULT_TIMEOUT_MS` 的 kind 集合耦合。
- 测试：`coach-tour-wait.test.ts`（13 用例）覆盖三个纯函数；hook 本体未测。

## 9. 测试证据

- 直接测试：`coach-tour-wait.test.ts`（74 行，`bun:test`，**13 test**，NOT_RUN）——`reduceAgentTurn` 5（`:9-27`：未见 running 不完成/进运行态/回 idle 完成/后台在飞不完成/done 稳定）；`agentWaitShouldCompleteByBaseline` 5（`:33-59`：startedAt 前移/内容增长/无变化不误判/缺失状态不误判/内容更短仍完成）；`petWaitShouldCompleteByBaseline` 3（`:63-73`：新完成时间/相同不误判/null 不误判）。断言逐条引用见同批测试手册。
- 未覆盖：`useCoachTourWait` hook（effects/轮询/超时）、`DEFAULT_TIMEOUT_MS` 各值。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出与签名 | 已证实 | `:15-101` |
| 「先 running 后 idle」+后台等待抑制 | 已证实 | `:20-28` |
| 快发快回基线兜底（Agent/桌宠双套） | 已证实 | `:43-62`、`:156-213` |
| 超时只上报不自动关闭 | 已证实 | `:237-242`、`:246-247` |
| 五 kind 超时表 | 已证实 | `:64-70` |
| 13 用例断言 | 已证实 | `coach-tour-wait.test.ts:8-73` |
| hook 实际运行行为 | 未知 | NOT_RUN |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `reduceAgentTurn` | §3/§9 | 20-28 | covered |
| `agentWaitShouldCompleteByBaseline` | §3/§9 | 43-50 | covered |
| `petWaitShouldCompleteByBaseline` | §3/§9 | 57-62 | covered |
| `useCoachTourWait` 五 effect+超时 | §3/§6 | 101-250 | covered |
| `DEFAULT_TIMEOUT_MS`/`MESSAGES` | §2/§3 | 64-99 | covered |
| hook 运行行为 | §10 | — | unknown（NOT_RUN） |
