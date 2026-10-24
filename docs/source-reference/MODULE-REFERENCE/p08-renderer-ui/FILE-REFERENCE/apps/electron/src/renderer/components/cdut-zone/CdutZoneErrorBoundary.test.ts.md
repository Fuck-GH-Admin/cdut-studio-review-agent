---
path: apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3fc1a34ac1bc045261c2665df5b2fcfc21a6184
sha256: 8c6cca67c28f6fe6866c6095c6381c28a460fc9a80b0563a59e365d4217be845
lines: 28
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

熔断器（文件头 `apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.test.ts:1-3`）：子模块渲染异常必须被拦截给出可复位降级界面而非白屏。

## 2. 用例清单

共 3 个 `test(`（`apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.test.ts:8,15,22`，describe `:7`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 降级态（`:8`） | `getDerivedStateFromError(error)`：`hasError` true、`state.error` `toBe(error)` |
| 2 | 新异常覆盖（`:15`） | 两次调用 `error.message` 分别 `'a'`/`'b'`（不卡旧错误） |
| 3 | 初始态干净（`:22`） | `new CdutZoneErrorBoundary({children:null}).state` `toEqual({hasError:false,error:null})`（`:23-24` 注释：setState 未挂载 no-op，验证重挂载关键性质） |

## 3. 真实断言

逐条见上表（`:11-12,18-19,26`）。无 mock；直接调用静态方法/构造器。

## 4. 未覆盖与脆弱点

未覆盖：真实渲染捕获（react-test 渲染崩溃）、`handleReset` 复位、fallback UI 断言。注释自述无 DOM 无法模拟复位（`:23-24`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例 | 已证实 | `grep test(`；`:8-27` |
| 状态机语义 | 已证实 | `:11-26` |
| 真实崩溃拦截 | 未知 | 未覆盖 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 降级态 | 1,2 | 8-20 | covered |
| 初始态 | 3 | 22-27 | covered |
| 真实渲染/复位 | 无 | — | unknown |
