---
path: apps/electron/src/main/lib/error-patterns.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad4c42e9507bc76a68525b74b416d231a8cd374e
sha256: dddffdc4f9206afe1a5a5266d5a4dd56efc2d971579d76d9384873c441319469
lines: 192
kind: test
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/error-patterns.test.ts

## 1. 测试目标

直接测试 `error-patterns.ts` 7 函数（6 个 describe `:4`/`:54`/`:70`/`:83`/`:101`/`:114`/`:173`）。24 个 `test(` + 4 个 `test.each`（生成 31 个参数化用例，合计 55 个运行用例）。

## 2. 用例清单

**isTransientNetworkError（`:4-52`）**：16 例原有正则防回归（test.each `:6`）+**10 例 #903 断连**（test.each `:28`，注释"此前误入终止分支清除 sdkSessionId"）+stderr 命中+业务错误拒绝（3 断言）。

**isEphemeralTransportError（`:54-68`）**：HTTP/2 流错误临时化+分类联动；业务错误入历史；network_error 码文案无关。

**isTransientUpstreamText（`:70-81`）**：中文瞬时 2 例→true；3 例不误判。

**isRecoveredEphemeralTransportError（`:83-99`）**：**尾部失败不丢弃**（3 断言）；已恢复丢弃（2）；已恢复但业务错误不丢弃（2）。

**isMalformedResponseError（`:101-110`）**：JSON 失败 2 例→true；socket hang up→false。

**classifyNetworkError（`:114-171`）**：7 类各组（dns/refused/reset/timeout/stream 8 例/parse_error 优先级/unknown/空输入/stderr）。

**getCategoryRetryDelayMultiplier（`:173-192`）**：4 组乘数断言（0/1.0/1.5/2.0）。

## 3. 真实断言

`toBe`（布尔+分类字符串+数值）。纯函数无 mock。

## 4. 未覆盖

- 正则 ReDoS/超长文本；混合多错误文本优先级边界；getLocale 影响。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 24 个 `test(`+4 test.each、断言如 §2 | 已证实 | 文件全读（192 行） |
| **#903 回归防线**（`:28-41`）+**丢弃门防线**（`:83-99`） | 已证实 | 原文注释 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 状态 |
| --- | --- | --- |
| 7 函数全谱 | §2 | covered |
| §4 边缘 | — | — | unknown |
