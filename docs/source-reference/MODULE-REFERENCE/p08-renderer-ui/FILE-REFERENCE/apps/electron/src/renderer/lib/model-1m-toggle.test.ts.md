---
path: apps/electron/src/renderer/lib/model-1m-toggle.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2d1d3388d17681f416e14a6241116251ea613534
sha256: f839fabffee8e7f8e248d5ca136a5b30249f340561de00aa0b590a8849686dae
lines: 39
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/model-1m-toggle.test.ts

## 1. 测试目标

`resolveModel1MToggleState` 的三态解析契约（39 行，bun:test，describe `'渠道模型 1M 勾选状态'` `:4`）：自动判定开/关、强开、强关四场景的 `{enabled, source, nextExplicit, title}`。mock 边界：**无 mock**——直接调用被测函数，底层 `resolveOneMillionContextDecision` 为 `@profer/shared` **真实规则**（测试断言依赖 shared 行为，见 §5）。

## 2. 用例清单

依赖顺序：无（4 用例独立输入）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | Given DeepSeek 官方 V4 模型且未手动设置 When 解析 Then 显示自动开启且点击会强关 | 5-12 | `{id:'deepseek-v4-pro'}`，provider `'deepseek'` | `resolveModel1MToggleState` | enabled true、source `'auto'`、nextExplicit false、title toContain `'自动'` |
| 2 | Given 未验证的第三方网关模型 When 解析 Then 默认不开启且点击会强开 | 14-20 | `{id:'deepseek-v4-pro'}`，provider `'custom'` | 同上 | enabled false、source `'auto'`、nextExplicit true |
| 3 | Given 用户在未验证网关上强开 When 解析 Then 显示已开启且点击会改为强关 | 22-29 | `{id:'glm-4.6', context1m:true}`，provider `'custom'` | 同上 | enabled true、source `'forced-on'`、nextExplicit false、title toContain `'手动开启'` |
| 4 | Given 用户关掉了已验证模型的 1M When 解析 Then 显示关闭且来源为强关 | 31-38 | `{id:'deepseek-v4-pro', context1m:false}`，provider `'deepseek'` | 同上 | enabled false、source `'forced-off'`、nextExplicit true、title toContain `'手动关闭'` |

声明合计 **4 test / 0 it**（机械计数）。

## 3. 真实断言

- `:8-11` `expect(state.enabled).toBe(true)`、`source` toBe `'auto'`、`nextExplicit` toBe(false)、`title` toContain `'自动'`。
- `:17-19` `enabled` toBe(false)、`source` toBe `'auto'`、`nextExplicit` toBe(true)。
- `:25-28` `enabled` toBe(true)、`source` toBe `'forced-on'`、`nextExplicit` toBe(false)、`title` toContain `'手动开启'`。
- `:34-37` `enabled` toBe(false)、`source` toBe `'forced-off'`、`nextExplicit` toBe(true)、`title` toContain `'手动关闭'`。

## 4. 未覆盖与脆弱点

- **未覆盖**：title 全文（仅 toContain 子串）；`OneMillionContextSource` 若有其他取值；`context1m` 三态之外的非法值。
- **脆弱点**：断言绑定 `@profer/shared` 的真实判定规则（如"deepseek+deepseek-v4-pro 自动开、custom 自动关"）；shared 规则演进会翻转用例 1/2 期望（测试是规则的活文档）。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例设置/动作/断言如上 | 已证实 | `:1-39` 全文逐行 |
| 声明计数 4 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 断言依赖 shared 真实规则（无 mock） | 已证实 | `:1-2` 无 mock.module，输入即真实判定 |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 自动开/自动关 | §2.1-2.2/§3 | 5-20 | covered |
| 强开/强关 | §2.3-2.4/§3 | 22-38 | covered |
| title 全文/非法值 | §4 | - | unknown（未覆盖） |
