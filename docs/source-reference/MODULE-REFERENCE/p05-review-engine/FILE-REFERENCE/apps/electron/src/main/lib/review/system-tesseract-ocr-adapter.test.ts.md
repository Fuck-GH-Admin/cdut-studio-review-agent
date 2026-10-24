---
path: apps/electron/src/main/lib/review/system-tesseract-ocr-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 068e180633ed71798d011dd99c0b834d56408c03
sha256: 36d62afdd3b7dfdac40bd65c8dc4405f702a6eff41d8e96168558669188bb639
lines: 24
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/system-tesseract-ocr-adapter.test.ts

## 1. 测试目标

`probeSystemTesseract` 的探测准确性：等待语言清单进程结束后精确报告「缺少 chi_sim 中文语言包」（describe :10）。

## 2. 用例清单

1 用例 / 1 describe（:11-23）。夹具：`mkdtemp` 临时目录写 fake `tesseract` shell 脚本（`--version` 输出 `tesseract 5.5.0` exit 0；否则 `sleep 0.05` 后输出仅含 `eng` 的语言清单）:12-14；`PATH` 前插 fakeBin（:15-16），finally 还原（:20-21）。mock 边界：CLI 为脚本冒充，不跑真实 tesseract。

## 3. 真实断言

- `status` `toEqual({ available: false, reason: '系统 tesseract 缺少 chi_sim 中文语言包' })`（:19）——同时隐含断言探测等待了 `sleep 0.05` 的语言清单进程（若提前返回会误报「探测失败」类 reason）。

## 4. 未覆盖与脆弱点

- 未覆盖：探测成功路径、CLI 缺失、`--version` 失败、超时、`recognize` 全分支、`parseTsv`。
- 脆弱点：依赖 `PATH` 环境改写与 `#!/bin/sh`（POSIX-only）；`probeSystemTesseract` 进程内缓存——若同进程其他测试先探测将取缓存（本文件为缓存首次消费假定）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例断言如 §3 | 已证实 | 本文件逐行 |
| mock 边界=shell 脚本冒充 CLI | 已证实 | :12-16 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 探测缺 chi_sim 路径 | §3 | 19 | covered |
| 成功/缺失/超时/recognize | §4 | — | unknown（未测） |
