---
path: apps/electron/src/renderer/atoms/agent-atoms-lifecycle.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 74b88516b45e269243a4b51787d14938d51b75c2
sha256: 662a6bf019cb32f8266daa9358a450a41bb11c15f617915e24fd8ddf695474e7
lines: 65
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/agent-atoms-lifecycle.test.ts

## 1. 测试目标

`applyAgentEvent`/`deleteSessionMapEntry`（测自 `./agent-atoms`，**源文件不属本批**）：会话重缓存释放与渲染端生命周期归属。不运行（`NOT_RUN`）。

## 2. 用例清单

4 用例，2 describe：
- 「session-keyed heavy cache release」（:13，2 用例）：删除存在会话返无该 entry 新 Map（:14-25）；**缺席会话保持同引用**（:27-31，不产生无谓重渲染）。
- 「Agent renderer lifecycle ownership」（:33，2 用例）：SDK error 主进程未释放 ownership 时保持渲染端 run 活跃（:34-41）；typed error 同条件只清 retry UI（:43-62）。

## 3. 真实断言

toEqual/not.toBe/toBe 级（Map 引用与 run 活跃断言）。

## 4. 未覆盖与脆弱点

被测属 agent-atoms（批外源）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 缓存释放/生命周期归属 | #1-#4 | covered |
