---
path: apps/electron/src/renderer/lib/dock-badge-count.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ead662802c94678ef908250ba9653909a8e34ff1
sha256: 443b1894a68be14061b34f6250be1e2bb7ae5e04ec8bfdf35e0e928f7522cd14
lines: 36
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/dock-badge-count.ts

## 1. 结论与边界

**Dock 角标计数工具**（36 行）："只统计需要用户回来看一眼或处理的事项"（`:4`）：未查看完成会话+待审批权限+待答 AskUser+待批计划。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `DockBadgeCountInput` | `:7-16` | 四类计数入参（各有语义注释） |
| `countPendingRequests` | `:19-25` | `<T>(Map<string, T[]>) => number`：按会话分组队列求总和 |
| `calculateDockBadgeCount` | `:28-36` | 四项求和 `Math.max(0, …)` 下限保护 |

## 3. 内部逻辑与关键流程

两个纯函数（求和+钳制）。

## 4. 调用者与调用链

Dock 角标（Electron 外壳层）；被 `dock-badge-count.test.ts`（3 用例）覆盖。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

负数输入→max(0) 钳制。

## 7. 权限与权威状态

角标语义="需要用户回来看"（四类口径即产品契约）。

## 8. 修改影响面

改口径影响 Dock 提醒；测试 3 用例锁定。

## 9. 测试证据

`dock-badge-count.test.ts`（同批，3 个 `test(`）：零项返回 0、四项求和 7、分组队列求和 3。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 36 行全读 |
| 行为锁定 | 已证实 | 测试 3 用例 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
