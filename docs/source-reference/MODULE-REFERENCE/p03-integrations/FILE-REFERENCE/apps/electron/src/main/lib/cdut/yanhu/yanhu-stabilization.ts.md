---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-stabilization.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0026b638d760f128208271a9120833967566f043
sha256: 14f4a8e87909969a31bf91ca10b09ff437494328869395ec2f7a68035ccb4fb6
lines: 632
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-stabilization.ts

## 1. 结论与边界

**确定性同步与高保真因果交互引擎**（632 行，`:2`）：三大算法基元——①`StabilizationWatcher` 双平面静止（网络在途清零+跨 Frame DOM 排空+滑动窗口静默，`:7`）；②`MultiFrameCoordinateTransformer` 嵌套 frameset 坐标递归投影（`:8`）；③`HybridAdaptiveDispatcher` 两阶梯自适应分派（合成事件→因果 DAG→CDP 硬件级，`:9`）+ `YanhuDeadlockGuard` 振荡死锁熔断（Period-2 乒乓检测+动作遮罩）。设计约束（`:11-12`）：纯逻辑编排不依赖 Electron，经 `StabilizationProbe`/`HybridDispatcherAdapter` 抽象 100% 可单测。

## 2. 导出与关键符号

**常量（7）**：`YANHU_CAUSAL_OBSERVATION_MS=300:25`、`YANHU_STABILIZE_WINDOW_MS=150:27`、`YANHU_STABILIZE_NAV_WINDOW_MS=600:29`、`YANHU_STABILIZE_TIMEOUT_MS=10_000:31`、`YANHU_STABILIZE_POLL_MS=80:33`、`YANHU_DEFAULT_DPR=1:35`、`YANHU_DEADLOCK_HISTORY_DEPTH=64:533`；单例 `yanhuStabilizationWatcher:259`、`yanhuDeadlockGuard:632`。

**函数（2）**：`buildCrossFrameDrainScript:73-145`（跨 Frame 排空 IIFE 脚本生成，Promise 恒 resolve）、`normalizeCrossFrameDrain:148-159`（防御归一，**settled 恒 true** `:54`）。

**接口（16）+ 类型（1）**：`CrossFrameDrainOptions:40-50`、`CrossFrameDrainResult:52-63`、`StabilizationProbe:164-172`、`StabilizationClock:174-177`（可注入伪时钟 `:176`）、`QuiescenceOptions:180-190`、`QuiescenceResult:192-200`、`FrameProjectionLink:264-272`、`FrameProjectionInput:274-281`、`DispatchOptions:310-313`、`CausalSnapshot:316-322`、`CausalObservation:324-336`、`SyntheticDispatchResult:338-350`（`stateChanged` 防勾选反切注释 `:342-347`）、`HybridDispatcherAdapter:352-366`、`DispatchResult:371-386`、`DispatchOutcome:368`（verified-success/escalated-success/terminal-failed）、`DeadlockStepRecord:521-526`、`DeadlockVerdict:536-542`。

**类（3+1）**：`StabilizationWatcher:213-256`（`waitForQuiescence`）、`MultiFrameCoordinateTransformer:289-305`（静态 `project`）、`HybridAdaptiveDispatcher:394-516`（`dispatch`）、`YanhuDeadlockGuard:555-630`（`evaluate`/`reset`）。

## 3. 内部逻辑与关键流程

- **双平面静止**（`:216-255`）：轮询循环取 beforeActivity→drainCrossFrame（catch 降级无突变）→判定 `settled = mutations===0 ∧ inflight===0 ∧ idleMs>=windowMs`（`:245-246`，LaTeX 判定式注释 `:210`）→超时 `timedOut`。
- **排空脚本**（`:73-145`）：收集文档（深度 6+去重）→每文档 MutationObserver→MessageChannel port2 **即时 yielding**（`:135-136` 考古注释：channel.postMessage 误用致退化 16ms 轮询的修复）→requestIdleCallback 收口；FIRST 分支 mutations>0 立即返回。
- **坐标投影**（`:290-304`）：叶子→根逆序（减滚动加框架偏移）×DPR 取整。
- **两阶梯分派**（`:434-515`）：基线→合成派发→**同步捷径**（`syncMutations>0 || stateChanged` 免观察窗，`:448-468`；含新标签补漏 `:454-461`）→否则观察因果→有边 settle('verified-success')；No-Op→CDP 硬件升级→二次观察→escalated-success/terminal-failed（`:494-514`）。
- **死锁熔断**（`:567-622`）：`stateHash+actionSignature` 按 tabId 留 64 步史→最近 4 步 Period-2 判定（`s0===s2&&s1===s3&&s0!==s1` + 状态哈希两两相等，`:600-606`）→遮罩 s1/s3+熔断理由文案。

## 4. 调用者与调用链

`yanhu-browser-tools`/express-manager（交互派发与稳定化）；出向 `@profer/shared`（YanhuBidNode）。测试直调（stabilization.test，16 用例）。

## 5. 数据 I/O、读写与副作用

纯编排；副作用=注入脚本（生成字符串，注入方执行）+ DeadlockGuard 两个 Map 状态 + Date.now()（`:584` 硬编码）。

## 6. 分支、失败、取消与恢复

drain 异常→静止降级（`:231-233`）；safeObserve 异常→无因果边（`:408`）；awaitQuiescence 异常→quiescence:null（`:428-430`）；两阶梯全败→terminal-failed 不再二次探测（`:494-497`）；**snapshot/resolveActiveTabId 无保护**（矛盾⑧）。

## 7. 权限与权威状态

- **判定式权威**（`:210` LaTeX）：三条件合取才 settled——根除"固定延时猜延迟"（`:5`）。
- **状态切换防反切**（`:342-347`）：`stateChanged` 覆盖原生勾选纯状态切换，防 CDP 二次点击"勾选被反向切回"。
- 死锁遮罩面向大模型的可读理由（`:541`/`:617`）。

## 8. 修改影响面

判定式/观察窗改动影响交互成功率与耗时；遮罩逻辑影响死锁自愈；`YanhuBidNode` 契约联动工具层；测试 16 用例锁定主行为。

## 9. 测试证据

`yanhu-stabilization.test.ts`（同批，16 `test(`）：双平面静止 4、坐标投影 2、排空/归一 2、分派状态机 8（含同步捷径/防反切/新标签接管）。**DeadlockGuard 零覆盖**（U1）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+原始字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/三基元/死锁熔断 | 已证实 | 632 行全读（子agent 分段） |
| **M1** 观察窗口径 2000ms vs 300ms：常量=300（`:25`）但 `:448` 注释/测试 NO_EDGE 文本（`:71`）/测试显式传 2000——"2000ms"为历史遗留表述 | 已证实 | `:23` vs `:448`/测试 `:71`/`:201` 等 8 处 |
| **M4** 死锁遮罩只 mask s1/s3（=同一签名），不含对侧 s0——单侧遮罩充分性存疑 | 已证实 | `:612-613` |
| **M8** snapshot/resolveActiveTabId 无 try/catch | 已证实 | `:421`/`:435`/`:511` |
| **M9/M10** terminal-failed 两处 escalated/newTab 口径不一 | 已证实 | `:496` vs `:506-514` |
| **M14** 同步捷径不看 `ok`（ok:false+syncMutations>0 亦 verified-success） | 已证实 | `:453` |
| **M15** DeadlockGuard 硬编码 Date.now（不可伪时钟） | 已证实 | `:584` |
| **M2/M3/M5-M7/M11-M13**（settled 恒 true/考古注释/前瞻注释/跨层引用/文本耦合/maxMs 缺省复用） | 已证实 | 各行号见子agent 笔记 |
| 技术报告（Deterministic Synchronization…）引用 | 推断 | 注释自述，文档不在冻结树 |
| DeadlockGuard/排空脚本运行实效 | 未知 | U1-U3 零/弱覆盖 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 32 导出（含 2 单例：常量 7+单例 2+函数 2+接口 16+类型 1+类 4）+3 类+1 守卫 | §2 | covered |
| 三基元+熔断算法 | §3 | covered |
| 判定式/防反切红线 | §7 | covered |
| 16 测试用例/16 矛盾 | §9/§10 | covered |
