---
path: apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c25275a45687538b427e1c04eb46c65b5faed71
sha256: 4b4f25df809f61029ce3b5b7e051660ef4e72f6698a76f23b73c9f175251bd2e
lines: 581
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts

## 1. 测试目标

PR #21 / P01 复用探针（`apps/electron/src/main/lib/review/review-background-reuse.probe.test.ts:1-10`）：以受控编排器 + 合成 WebContents **执行真实 `runAgent()` 函数体**（从 `agent-service.ts` 源码文本提取+转译，`:34-39`，边界变化即抛 `runAgent source boundary changed`）；审核运行/指派走真实 V2 存储（隔离 `PROFER_CONFIG_DIR`）。验证无 Agent-tab 生命周期缝，**不是** live Pi/模型 E2E、Electron 窗口集成或远程可见性（`:8-9`）。

夹具/mock 边界（`:103-143`）：`existingRunAgentHarness` 用 `new Function` 注入 16 个依赖替身（编排器 sendMessage 可控、fake WebContents `isDestroyed/send`、静默 console）；`caseFixture`（`:49-101`）走真实模板发布→建案→registerMaterial→`preparePiReviewRunV2`→`recordPiReviewDocumentRead`（RUN-46 真实读序，`:86-87`）。

## 2. 用例清单

共 **21 个 `test(`**（4 个 `describe`）：

### P01「直接 Pi 审核可复用 runAgent 不导航聊天 tab」（5）

| # | 行 | 用例 | 要点 |
| --- | --- | --- | --- |
| 1 | 146-172 | 完整提交→completed；onRunOutcome 不覆盖已完成 V2 | 真实 `submitPiReviewResultV2`（RUN-46 引用真实读块）、`toMatchObject({status:'completed',rejected:[],missingChecks:[]})` |
| 2 | 174-182 | 无完整提交→partially-completed | |
| 3 | 184-195 | 迟到 SDK 成功不能把错误报成成功 | onError 后 onComplete(success) → `failed`+error 保留 |
| 4 | 197-205 | 用户停止→cancelled | |
| 5 | 207-214 | busy 无权不能假完成他人运行 | `AgentRunAlreadyActiveError`、状态 `running` |

### P03-S01「Main 拥有 Pi 阶段不依赖审核页寿命」（2）

| # | 行 | 用例 | 要点 |
| --- | --- | --- | --- |
| 6 | 218-241 | 拥有权后失窗不丢终态 | destroyWindow 后仍 `partially-completed` + `run_complete` 事件 |
| 7 | 243-265 | V2 running≠接受确认（onRunOwned 前） | `owned` 布尔时序断言 |

### P03-S02「Main 准入 ACK 与单 owner 生命周期」（6）

| # | 行 | 用例 | 要点 |
| --- | --- | --- | --- |
| 8 | 269-307 | ACK 仅在 onRunOwned 后，Main 拥有长 Pi 轮 | `admitPreparedPiReviewTurn` 时序（admitted 布尔 + `isPiReviewRunAdmitted`）、毁窗后仍终态、**终态后 `isPiReviewRunAdmitted` 回 false**（`:306`） |
| 9 | 309-319 | busy 拒绝只关新备运行 | `failed` + assignment 无残留 + 无 `run_complete` |
| 10 | 321-328 | 无 onRunOwned 早退不假 ACK | 抛 `'Agent 未获得执行权'`、`failed` |
| 11 | 330-351 | 重复准入拒但不取消 owner | 抛 `'不得重复启动'`、invoked 1、running 不受影响 |
| 12 | 353-364 | 授权后预检失败仍出 failed 结果 | ACK 保留 + `failed`+error |
| 13 | 366-376 | 不可信/陈旧绑定不能启动 | automation 触发 `'不一致'`、异 turn `'指派已失效'`、fakeRun 未被调用 |

### P06-FIX-03「持久撤销失败遏制」（8）

| # | 行 | 用例 | 要点 |
| --- | --- | --- | --- |
| 14 | 381-405 | 终态+撤销双失写：回调返回前拒旧授权 | `.tmp` 目录造 EISDIR；`checkAssignment` false、admitted false、V2 仍 running、磁盘无 revokedAt |
| 15 | 407-416 | 直接 Pi grant 随 V2 终态失效（磁盘未撤销） | `ASSIGNMENT_REVOKED`、`findActivePiReviewAssignment` 仍可见（审计留痕）、`getPiReviewBindingForSession` undefined |
| 16 | 418-430 | 畸形指派文件不可被新 grant 覆盖/授权旧工具 | 文件保持 `'{incomplete'`、createAssignment 抛、checkAssignment false |
| 17 | 432-476 | 撤销写失败观察：无 unhandled、ACK 清、本地拒、恢复后补写 | EISDIR、`unhandled` false、恢复写盘后 revokedAt 补齐、独立 grant 可用 |
| 18 | 478-508 | ACK 前执行器拒绝+存储损坏：调用方落定、重复围栏释放 | 抛原错、无 unhandled、恢复后 `ASSIGNMENT_REVOKED` |
| 19 | 511-542 | EACCES（0o500 目录）：revokedAt 未确认但本地拒 | root 跳过（`:514`）、chmod 造真 EACCES、无 unhandled |
| 20 | 544-569 | V2 终态写失效不当终态、不留陈旧 ACK | running 留盘是「OPEN persistence incident」非假完成（`:566-568`） |
| 21 | 571-580 | 成功持久撤销带 revokedAt 且独立 grant 可用 | |

## 3. 真实断言

（全 21 用例逐条见 §2；关键锚）：`:165` toMatchObject completed；`:181` partially-completed；`:192-194` failed+error；`:204` cancelled；`:212-213` instanceof+running；`:239-240`；`:259-264`；`:288-306`（含 `:306` admitted 回 false）；`:316-318`；`:325-327`；`:343-350`；`:361-363`；`:370-375`；`:396-400`；`:409-415`；`:424-426`；`:443-475`（无 unhandled + 恢复补写）；`:498-507`；`:533-541`；`:560-568`；`:574-579`。

## 4. 未覆盖与脆弱点

- runAgent 源码提取（`:34-39`）与 `agent-service.ts` 文本布局耦合（`'/**\n * 无渲染进程'` 边界锚）。
- fake WebContents/编排器是替身；真实 Electron/Pi/模型明确 NOT（`:8-9`）。
- `await Bun.sleep(40/50)`/`Promise.resolve()` 轮询（`:302,362` 等）是时序假设（脆弱点）。
- EACCES 用例 root 环境跳过（`:514`）。
- runAgent 的 16 依赖注入面（`:114-131`）以 `new Function` 顺序耦合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 21 test/4 describe、真实 V2 存储断言 | 已证实 | 全文 |
| ACK 时序/单 owner/终态回撤 | 已证实 | `:269-307` |
| 撤销失败遏制 8 面 | 已证实 | `:381-580` |
| runAgent 源边界防御 | 已证实 | `:35-37` |
| 测试通过与否 | 未知 | NOT_RUN |
| 真实 Pi/Electron E2E | 未知 | 明示 NOT（`:8-9`） |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| P01 复用 5 态 | §2 | 1-5 | covered |
| P03-S01 寿命分离 | §2 | 6-7 | covered |
| P03-S02 ACK/单 owner | §2 | 8-13 | covered |
| P06-FIX-03 撤销遏制 | §2 | 14-21 | covered |
| live E2E | §4 | — | unknown（NOT） |
