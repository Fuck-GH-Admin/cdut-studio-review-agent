---
path: apps/electron/src/main/lib/pi-background-task-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b02e618b207d3297170577075bda7161d43ebed2
sha256: 3fab396ac73a149bbecdf383899117fc3ac10e3880bce95aaa25ab4d2dc9356e
lines: 70
kind: test
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-background-task-manager.test.ts

## 1. 测试目标

`PiBackgroundTaskManager` 类的行为契约（70 行，bun:test）：①sessionId+taskId 双键隔离与输出/summary 回传；②block 阻塞查询等到终态；③从持久化 registry record 恢复任务句柄时不虚构历史输出；④非服务 record 不恢复。被测对象是类（`:2` import 类本身，非单例）；mock 边界：**无 mock**（纯内存类；`RuntimeProcessRecord` 仅为 fixture 类型，`:3`，未调用真实 registry/进程 API）。

## 2. 用例清单

依赖顺序：无（4 个 test 相互独立，各自 `new PiBackgroundTaskManager()`）；共享 fixture 工厂 `serviceRecord(overrides)`（`:5-24`，`RuntimeProcessRecord` 全字段样板：id/sessionId/runtime:'pi'/source:'pi-owned'/launcher:'bash'/likelyService:true/command/cwd/shellPid/pid/startTime/ports/launchedAt/lastObservedAt/status:'running'——测试态给定 running+pid+startTime）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | 按 sessionId + taskId 隔离输出，并保留输出 tail | 27-40 | 新实例 | begin('session-1','task-1')→append('ready\n')→complete('completed','服务已结束') | getOutput('session-1','task-1') resolves.toEqual 全对象；getOutput('session-2','task-1') rejects |
| 2 | 阻塞查询等待后台任务进入终态 | 42-51 | 新实例；`setTimeout(30ms)` 后 complete('stopped') | getOutput({block:true, timeoutMs:500}) | toMatchObject {isComplete:true, status:'stopped'} |
| 3 | 从持久化 registry record 恢复任务句柄，不虚构历史输出 | 53-62 | 新实例 | hydrate(serviceRecord())；getOutput('session-restore','task-restore-1') | toMatchObject {output:'', isComplete:false, status:'running'} |
| 4 | 非服务 record 不会被恢复为后台任务 | 64-69 | 新实例 | hydrate(serviceRecord({likelyService:false, id:'short-command'}))；getOutput | rejects.toThrow('不存在或不属于当前会话') |

声明合计 **4 test / 0 it**（机械计数 grep `test(`）。

## 3. 真实断言

- `:33-38` `resolves.toEqual({ output: 'ready\n', isComplete: true, status: 'completed', summary: '服务已结束' })`——完整对象相等（含 summary）。
- `:39` `rejects.toThrow('不存在或不属于当前会话')`——跨会话 taskId 取输出报错。
- `:47-50` `resolves.toMatchObject({ isComplete: true, status: 'stopped' })`——30ms 后终态、500ms 预算内等到。
- `:57-61` `resolves.toMatchObject({ output: '', isComplete: false, status: 'running' })`——hydrate 恢复后空输出+running。
- `:68` `rejects.toThrow('不存在或不属于当前会话')`——`likelyService:false` 不入任务表。

## 4. 未覆盖与脆弱点

- **未覆盖**：`stop()` 全部分支（三重守卫 throw、终止失败 throw、成功路径 markExited）；`attachProcess`；2MB 截尾（用例 1 标题称"保留输出 tail"但断言未触达截尾逻辑——标题与断言面不符，照实记录）；`clear()`；getOutput 的 timeoutMs 上下限（0/30000 clamp）与非 block 路径；`ensureTask` 的 registry 回填路径（用例 3 直接 hydrate 绕过）。
- **脆弱点**：用例 2 依赖 30ms 定时器与 50ms 轮询节奏的相对快慢（CI 慢机下 timeoutMs:500 内仍需完成一次轮询）；fixture 的 `status:'running'` 与 `pid/startTime` 是给定测试态（非真实进程观测）。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例设置/动作/断言如上 | 已证实 | `:1-70` 全文逐行 |
| 声明计数 4 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| fixture 全字段形状 | 已证实 | `:5-24` |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| begin/append/complete/getOutput(非 block) | §2.1/§3 | 27-40 | covered |
| getOutput(block) 轮询 | §2.2/§3 | 42-51 | covered |
| hydrate 恢复语义 | §2.3/§3 | 53-62 | covered |
| hydrate 拒绝（likelyService:false） | §2.4/§3 | 64-69 | covered |
| stop/截尾/attachProcess/clear | §4 | - | unknown（未覆盖） |
