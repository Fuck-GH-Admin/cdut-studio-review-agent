---
path: apps/electron/src/renderer/lib/format-time.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d0ebf09b8ad844921d4d0860e51d874642c04a95
sha256: b61d1e0dcee03bf9fc8b256a98b960f80caafd470e774451f42160460e0381f8
lines: 21
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/format-time.ts

## 1. 结论与边界

**消息时间格式化**（21 行）：今年 `MM/DD HH:mm`、跨年 `YYYY/MM/DD HH:mm`（`:2-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `formatMessageTime` | `:6-21` | `(timestamp: number) => string`：padStart 补零；同年省年份 |

## 3. 内部逻辑与关键流程

单函数纯格式化（本地时区 getHours 等）。

## 4. 调用者与调用链

消息头时间戳（message 族）；纯函数无出向。

## 5. 数据 I/O、读写与副作用

无 IO（读系统时间比较年份）。

## 6. 分支、失败、取消与恢复

同年/跨年两分支；无输入校验（NaN 时间戳产出 NaN 字段——照实）。

## 7. 权限与权威状态

本地时区语义（非 UTC）。

## 8. 修改影响面

改格式影响消息时间显示；同年省年份规则联动消息头布局宽度，padStart 补零口径为 UI 硬编码约定。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 21 行全读 |
| **边界**：无 NaN 时间戳防御 | 已证实 | `:6-21` |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
