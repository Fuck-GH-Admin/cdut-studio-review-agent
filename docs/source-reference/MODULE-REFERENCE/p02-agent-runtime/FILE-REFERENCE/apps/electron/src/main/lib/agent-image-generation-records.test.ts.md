---
path: apps/electron/src/main/lib/agent-image-generation-records.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c2e71bd5f43b4db12dae8bfcc388227d44566d7d
sha256: 9a635fcbc4b34a90a636001d32e19cdb2389b27431c954895ebb2e93fea5b253
lines: 91
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-image-generation-records.test.ts

## 1. 测试目标

JSONL 记录：同毫秒顺序、重放过滤、防篡改、终态查询。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:35/:46/:54/:62/:71/:82），1 describe（:34）；fixture（:14-21）+`succeeded()` 工厂（:23-32）。
1. 同毫秒 UUID 逆序（:35-44）：list toEqual `['z-first','a-second']`（追加顺序）、latest 'a-second'（:42-43）。
2. 生命周期重放（:46-52）：1 卡含 id/status succeeded/chargedCredits 5（:50）、JSONL 3 行（:51）。
3. 坏行/异会话过滤（:54-60）：仅本会话合法卡。
4. referencePaths 不落盘（:62-69）：card 无属性+raw 无串。
5. 篡改输出路径不成卡（:71-80）：list toEqual([])。
6. 终态查询/无效转换（:82-90）：latest success/failed 重试记录/`rejects.toThrow('状态转换')`。

## 3. 真实断言

`:42-43`/`:50-51`/`:59`/`:67-68`/`:79`/`:87-89`（toEqual/toBe/not.toHaveProperty/rejects.toThrow 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：parseRecord 各字段裁剪边界。mock 边界：真实文件系统 tmp。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 顺序/重放/过滤/防篡改/终态 | #1-#6 | covered |
