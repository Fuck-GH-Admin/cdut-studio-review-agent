---
path: apps/electron/src/main/lib/browser-observation-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c48fb7db5c71d2d721c8437906d6757eb14ee762
sha256: 22158f9ced10cacf5215fef06f35fa5658510741d59667896e866c886b046d5b
lines: 63
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-observation-policy.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

浏览器 Observe 的 AX 观察预算策略（63 行）：元素上限钳制 20-400（默认 240）；**可交互节点优先**（2/3 预算）+语义上下文补足（注释 :38-41）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEFAULT/MAX/MIN_BROWSER_OBSERVE_MAX_ELEMENTS` | const | 1-3 | 240/400/20 |
| `resolveBrowserObserveMaxElements` | fn | 24-28 | undefined→默认；非有限→throw；floor+clamp |
| `isInteractiveAxRole` | fn | 30-32 | 18 个交互 role 小写匹配 |
| `isInteractiveBrowserObservationCandidate` | fn | 35-37 | `editable===true` 或交互 role（contenteditable 注释 :34） |
| `prioritizeBrowserObservationCandidates` | fn | 43-56 | `ceil(max*2/3)` 交互 + 剩余上下文 |
| `browserObservationNameLimit` | fn | 58-60 | 交互 160 字/其余 80 字 |

内部：`INTERACTIVE_ROLE_RATIO=2/3`（:5）、`INTERACTIVE_AX_ROLES`（:7-22）。

## 3. 内部逻辑与关键流程

`prioritizeBrowserObservationCandidates`：分流 interactive/context→交互取前 `ceil(max*2/3)`→上下文补至 max（默认 240 分配 160+80，注释 :38-41）。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts:18`（observeInternal 候选排序/名字截断）。出向：纯函数。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

`resolveBrowserObserveMaxElements` 非有限数→throw；其余纯函数不抛。

## 7. 权限与权威状态

- 观察诚实权威：预算按「可操作优先」分配而非任意截断（注释 :38-41）；nameLimit 防长文本膨胀。
- 无 sender/role 检查。

## 8. 修改影响面

BrowserObserve 元素选择与截断。无专属测试文件。

## 9. 测试证据

直接测试：无独立文件；经 `browser-controller` observe 路径间接。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 2/3 预算分配/钳制语义 | 已证实（代码） | :24-56 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveBrowserObserveMaxElements` | §3 | 24-28 | covered（未测） |
| 交互判定/预算分配 | §3 | 30-56 | covered（未测） |
| `browserObservationNameLimit` | §2 | 58-60 | covered（未测） |
