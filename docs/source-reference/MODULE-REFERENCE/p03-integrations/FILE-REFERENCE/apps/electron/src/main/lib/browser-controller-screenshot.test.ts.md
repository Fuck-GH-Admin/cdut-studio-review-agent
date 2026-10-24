---
path: apps/electron/src/main/lib/browser-controller-screenshot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d9812291e14d4b0e1e23fdbc308d4e19df9ef4a2
sha256: 8394b148346ef403747c2230779b6df343c05f5251fe08a9d20e6e5bb3bd1943
lines: 72
kind: test
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-controller-screenshot.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

回归（头注 :8-12）：视图隐藏/未渲染时 `capturePage`「成功」返回空 NativeImage——空图入会话历史会令部分模型（实测 kimi-k3 ~105s/次）挂起重试死循环，**必须显式失败**。

## 2. 用例清单

3 用例（顶层 test，无 describe）。夹具 `harness(capturePage)`（:14-38，替换 sessions Map+替身 tab）；`mock.module('./browser-risk-disclaimer')` 恒 true（:3-5）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 空图像报错 | 41-50 | `rejects.toThrow('截图为空')` |
| 2 | 空 PNG 字节报错 | 52-61 | `rejects.toThrow('截图为空')` |
| 3 | 正常返回 base64 | 63-71 | base64/mimeType `image/png`/url 透传 |

## 3. 真实断言

如 §2 表（逐条读自 :41-71）。

## 4. 未覆盖与脆弱点

- 未覆盖：超 3MB 拒、CDP 超时路径。
- 脆弱点：`controller as unknown` 注入内部 sessions（结构性耦合）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §2 | 已证实 | 本文件逐行 |
| 空图不假成功被固定 | 已证实 | 用例 1-2 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 空图/空 PNG 拒 | §2 | covered |
| 正常截图 | §2 | covered |
| 超限/超时 | §4 | unknown（未测） |
