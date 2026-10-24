---
path: apps/electron/src/main/lib/ipc-sender-guard.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1162ac0ae63943fa78dd4f48d2f44461c664899d
sha256: b6dcc29a4d05180a83ac5927899cc33e2324ef95619c0957e55ca9fd9a9008fc
lines: 34
kind: test
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/ipc-sender-guard.test.ts

## 1. 测试目标

`ipc-sender-guard.ts` 的**主窗口 sender 守卫**（`isMainWindowSender`/`assertMainWindowSender`）：主窗口放行、辅助窗口/销毁 sender/销毁主窗口拒绝、assert 抛固定文案。Bun test，最小 fake（无 Electron 运行时、无 mock 库）。**trusted 三函数不在本测试范围**（import 面 `apps/electron/src/main/lib/ipc-sender-guard.test.ts:2` 仅两函数）。

## 2. 用例清单

1 个 describe、1 个 `test(`（与源码 `test(` 出现次数一致：`:22`）。

| # | 用例 | 行 | 设置 | 动作 | 断言（见 §3） |
| --- | --- | --- | --- | --- | --- |
| 1 | Given 主窗口、辅助窗口和销毁 sender When 校验来源 Then 仅主窗口通过 | 22-33 | `fake()`×2 + `windowWith(sender)` | 5 次判定/断言 | 5 条 |

依赖顺序：单用例内自上而下（`sender` 先建后复用）；用例间无依赖。

## 3. 真实断言

- `apps/electron/src/main/lib/ipc-sender-guard.test.ts:27`：`expect(isMainWindowSender({ sender }, () => mainWindow)).toBe(true)`
- `:28`：`expect(isMainWindowSender({ sender: otherSender }, () => mainWindow)).toBe(false)`
- `:29`：`expect(isMainWindowSender({ sender: fake(true) }, () => mainWindow)).toBe(false)`
- `:30`：`expect(isMainWindowSender({ sender }, () => windowWith(sender, true))).toBe(false)`
- `:31-32`：`expect(() => assertMainWindowSender({ sender: otherSender }, () => mainWindow)).toThrow('仅允许 Profer 主窗口')`

共 5 条 `expect(`（4×`toBe` + 1×`toThrow` 子串匹配）。`NOT_RUN`：本轮未执行 Bun 测试；上述只是静态读到的断言行，不代表测试已通过。

## 4. 未覆盖与脆弱点

- 未覆盖：`registerTrustedAgentSender`/`isTrustedAgentSender`/`assertTrustedAgentSender` 全部分支（WeakSet 登记、次级窗口放行、次级窗口销毁、`assertTrustedAgentSender` 错误文案 `仅允许主窗口或科学助理窗口…`）；`webContents.isDestroyed()` 单独为 true 的分支（`:25` 前半）。
- mock 边界：`fake`/`windowWith` 仅实现 `isDestroyed()`/`webContents` 最小面（`:4-19`），与 `IpcSenderLike`/`MainWindowLike` 结构对齐；未模拟真实 Electron webContents 身份语义（引用相等由对象复用表达）。
- 脆弱点：`toThrow('仅允许 Profer 主窗口')` 是子串断言（完整文案见实现 `:32`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例、5 条 expect | 已证实 | `:22` 声明；expect 行 `:27-31` |
| 只测主窗口双函数 | 已证实 | `:2` import 面 |
| trusted 三函数无测试 | 已证实（检索本文件全文） | 0 引用 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 用例/断言 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 主窗口放行 | §3 | 27 | covered |
| 辅助/销毁 sender 拒绝 | §3 | 28-29 | covered |
| 销毁主窗口拒绝 | §3 | 30 | covered |
| assert 抛错 | §3 | 31-32 | covered |
| trusted 三函数 | §4 | — | unknown（未覆盖） |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
