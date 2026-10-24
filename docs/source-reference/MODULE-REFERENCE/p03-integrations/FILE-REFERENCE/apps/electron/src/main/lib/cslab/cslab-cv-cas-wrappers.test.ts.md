---
path: apps/electron/src/main/lib/cslab/cslab-cv-cas-wrappers.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bfafa89881c0ff7035debf60c2bd1c1bd9a10929
sha256: b1d6883d7a38229b22971c08bf3a98f26b9b85c93682d0fa542d5a3eb1c5d312
lines: 379
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-cv-cas-wrappers.test.ts

## 1. 测试目标

**CV/CAS Python 包装层**（`apps/electron/src/main/lib/cslab/cslab-cv-cas-wrappers.test.ts`）：`digitizePlot`/`verifyFormula`/`ocrFormula` 三包装的载荷归一化、失败降级（**ok:false 透传、不伪造曲线**）、参数夹紧、前置拒绝。

## 2. 用例清单

3 describe / 13 test（mock Python 进程边界）。

**`digitizePlot` 包装层（`:59-246`，6 用例）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 1 | 归一化 Python 载荷：过滤坏点、默认标签、刻度类型回退 | `:60-124` |
| 2 | 颜色/容差透传并**夹紧 8~60** | `:125-144` |
| 3 | `ok:false` 透传原因、**不生成伪造曲线** | `:145-163` |
| 4 | `ok:true` 但全部曲线点数不足→降级失败 | `:164-184` |
| 5 | Python 抛错/非法 JSON→`ok:false` | `:185-214` |
| 6 | 非法 dataURL/不足刻度**调 Python 前即拒绝** | `:215-246` |

**`verifyFormula` 包装层（`:247-349`，5 用例）**：空表达式不启动 Python（`:248-261`）；归一化（滤非法数组、residual 转字符串、时间戳兜底，`:262-304`）；`elapsedMs===0`→`undefined`（`:305-320`）；抛错/非法 JSON→`ok:false`（`:321-349`）。

**`ocrFormula` 包装层（`:350-379`，3 用例）**：合法图像返回 LaTeX+引擎（`:351-362`）；OCR 失败只 `ok:false` 不影响手工验算（`:363-372`）；非法 dataURL 直接拒（`:373-378`）。

## 3. 真实断言

- `:125-144`（容差夹紧 8~60 断言组）；`:145-163`（`ok:false` 无伪造曲线）；`:215-246`（前置拒绝）；`:248-261`（空表达式不启动 Python）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Python 端实现（mock 边界外）。
- 脆弱点：断言绑定归一化细节（residual 字符串化/时间戳兜底）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例覆盖三包装归一化/失败/夹紧 | 已证实 | `:60-378` |
| 不伪造曲线/结果红线 | 已证实（断言） | `:145-163` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| digitizePlot | 1-6 | `:60-246` | covered |
| verifyFormula | 7-11 | `:248-349` | covered |
| ocrFormula | 12-15 | `:351-378` | covered |
