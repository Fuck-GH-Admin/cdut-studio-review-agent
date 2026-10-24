---
path: apps/electron/src/main/lib/review/tesseract-ocr-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 35c4c31e34014cdbfb1be2d7f5b1db416f8807ef
sha256: 109c63c4db2ffb22ef53f49eb56688d65cc9a49f8dbd39a4274d6087199e1460
lines: 34
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/tesseract-ocr-adapter.test.ts

## 1. 测试目标

G02：Tesseract 适配诚实降级（未安装→available=false+原因）、不可用 recognize 明确抛错、资源探测形状。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:12/:21/:30），1 describe（:11）。`PROFER_CONFIG_DIR` 隔离（:8-10）。
1. 未安装（:12-19）：`port.available` toBeFalse、`unavailableReason` toBeTruthy、`dependencyLoaded===false || languageResourcesFound===false` toBeTrue。
2. 不可用抛错（:21-28）：条件 `if (!port.available)` 下 `rejects.toThrow('OCR 不可用')`。
3. 资源探测（:30-34）：两字段 `typeof === 'boolean'`。

## 3. 真实断言

`:16-18`/`:25`/`:32-33`（toBeFalse/toBeTruthy/toBeTrue/rejects.toThrow/typeof 断言如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：可用路径真实识别、recognize 映射、signal。脆弱点：用例 2 条件执行（本环境有 tesseract.js 时静默跳过）；用例 3 只查类型不查值。mock 边界：真实探测。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 依赖/资源缺失降级 | #1 | covered |
| 不可用抛错 | #2 | covered（条件执行） |
| 探测形状 | #3 | partial |
| 可用路径 | — | unknown |
