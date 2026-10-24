---
path: apps/electron/src/main/lib/app-lifecycle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1b28a131e73ad152ab88f857f05a9df91085b198
sha256: f14e2b51b3ebbaadd8dff3bc68967e5f35e0f7f3559c944199c0cbeeb2a59fdc
lines: 16
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/app-lifecycle.ts

## 1. 结论与边界

**应用生命周期共享状态**（16 行）："抽取退出标志为独立模块，避免循环依赖"（`:4`）：区分关闭窗口 vs 退出应用（`:7`）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `getIsQuitting` | `:10-12` | 读退出标志 |
| `setQuitting` | `:14-16` | 写退出标志（默认 true） |

内部：模块级 `_isQuitting:8`。

## 3. 内部逻辑与关键流程

单布尔读写对（防循环依赖的最小模块）。

## 4. 调用者与调用链

app 退出钩子（before-quit）+窗口 close 判定（main 窗口层）。

## 5. 数据 I/O、读写与副作用

进程内存状态。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

退出语义的单一真源（跨模块共享防循环依赖）。

## 8. 修改影响面

改动影响关窗/退出区分行为（托盘/自动退出链路）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 16 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
