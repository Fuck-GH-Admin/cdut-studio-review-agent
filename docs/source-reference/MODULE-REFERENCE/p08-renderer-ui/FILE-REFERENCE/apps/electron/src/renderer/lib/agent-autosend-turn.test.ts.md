---
path: apps/electron/src/renderer/lib/agent-autosend-turn.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c3ecea52f92fec29e87df42be2fb07c21105af0
sha256: cd22a85242dd23a5346d17df76303f85cb9a11beaf4753b082dbc33301e620d4
lines: 142
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-autosend-turn.test.ts

## 1. 测试目标

空闲自动启动+轮结束七步决策（含压缩边界场景）。不运行（`NOT_RUN`）。

## 2. 用例清单

16 用例，2 describe：
- `shouldStartAutoSendFromIdle`（:21，2 用例）：空闲可发立即启动（:22）/四类不启动（:32）。
- `evaluateAutoSendTurn`（:47，15 用例）：**compact_boundary 后仍等 STREAM_COMPLETE**（:48）/自动压缩中原任务运行不发（:67）/压缩空队列后入队不依赖旧信号（:80）/重挂载未捕获下降沿仍发（:85）/live 持久化交接前不发交接后发（:89）/条件恢复不需再一轮信号（:94）/锁释放后 FIFO（:99）/正常 send（:103）/运行中不抢发（:107）/live 未清 defer（:112）/机会已过 consume（:116）/关闭时消费不发（:122）/停止中不发（:133）/空 idle（:138）。

## 3. 真实断言

- 各用例断言 `evaluateAutoSendTurn(state)` 返回值 toBe 之一：'send'/'defer'/'consume'/'idle'。
- `shouldStartAutoSendFromIdle` 断言 toBe 布尔（:22-44 两用例覆盖真/假路径）。
- 关键断言语义：compact_boundary 后不 send（:48-65）、defer 不消费版本号（:112-114）、关闭时 consume（:122-131）、空队 idle（:138-140）。

## 4. 未覆盖与脆弱点

mock 边界：纯函数状态 fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 七步决策全路径+压缩场景 | 16 用例 | covered |
