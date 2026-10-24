---
path: apps/electron/src/renderer/lib/shortcut-dispatch.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 44be651fa4228b05e43c4be5ac8cf93d43539d8d
sha256: 29ca3637d9dd46f5f139dfe8b9703d1da82e1f10c76a4f7b512c5dfbc9aec41f
lines: 109
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/shortcut-dispatch.test.ts

## 1. 测试目标

观察真实 `dispatchShortcut` 的 handler 执行次数（纯函数用例看不到"注册了几个 handler、执行了几次"，shortcut-dispatch.test.ts:4-10 注释）：验证同键多 handler 的全执行/独占单执行/注销后不重复执行。手段：伪造 `window.addEventListener` 捕获 keydown 监听（makeWindow :14-22）、`pressF2` 模拟无修饰 F2（:25-37，对应 `rename-item` 默认 accelerator `F2`，shortcut-defaults.ts:132-139）、带 query 动态 import 破模块缓存拿独立注册表实例（freshRegistry :48-63）。框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=5、`it(`=0、`test.each(`=0，共 5 个用例（顶层 test，均 async）：

1. `Given 同一快捷键注册多个 handler When 均未声明 exclusive Then 全部执行`（shortcut-dispatch.test.ts:65-73）
2. `Given 同一快捷键注册多个 handler When 均声明 exclusive Then 只执行最后注册的一个`（:75-82）
3. `Given 单个 exclusive handler When 触发 Then 正常执行一次`（:84-90）
4. `Given 有 exclusive 也有非 exclusive When 触发 Then 只跑 exclusive`（:92-99）
5. `Given 注销后仅剩一个 handler When 触发 Then 不再重复执行`（:101-109）

## 3. 真实断言

shortcut-dispatch.test.ts:72 `expect(hits).toBe(2)`（两 handler 各执行一次，注释 :71 指出对应"活跃会话双区域渲染"原始缺陷形态）；:81 `expect(order).toEqual([2])`（只跑最后注册的 exclusive）；:89 `expect(hits).toBe(1)`；:98 `expect(order).toEqual(['exclusive'])`（exclusive 压过 plain）；:108 `expect(hits).toBe(1)`（`off1()` 注销后 :106，仅剩 handler 执行一次）。

## 4. 未覆盖与脆弱点

未覆盖 `no-handler`/`none` 分发（在 shortcut-registry.test.ts）、`isComposing`、真实 KeyboardEvent；未验证 `preventDefault/stopPropagation` 是否被调用（pressF2 提供空实现 :34-35）；`freshRegistry` 依赖 bun 的 `import('...?query')` 模块缓存隔离（:54）与 `globalThis.window` 注入（:53），换运行器可能失效（脆弱点）。`cleanup` 数组 afterEach 统一注销（:39-43）防状态泄漏。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例与断言行真实存在 | 已证实 | shortcut-dispatch.test.ts:65-109 机械计数 |
| 模块缓存隔离在 bun 下生效 | 推断 | :54 动态 import query 手法（静态可读，未运行验证） |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 多 handler 全执行 | §2/§3 | shortcut-dispatch.test.ts:65-73 | covered |
| 双 exclusive 末位胜出 | §3 | :75-82 | covered |
| 单 exclusive 正常执行 | §3 | :84-90 | covered |
| exclusive 压 plain | §3 | :92-99 | covered |
| 注销语义 | §3 | :101-109 | covered |
| preventDefault/stopPropagation | §4 | — | unknown |
