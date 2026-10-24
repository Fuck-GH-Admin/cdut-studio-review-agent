---
path: apps/electron/src/renderer/atoms/bulletin-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 272eecdca3789683254521e17bbdb6d10b01d5a3
sha256: 1c8f12da5e1bcaaa3714b07597c312fdd0544db3cc5fdebfadb744043ba2add5
lines: 26
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/bulletin-atoms.ts

## 1. 结论与边界

本地公告栏状态（头注释 :2-6）：数据源自内置 bulletin.json（主进程 IPC 读取）；弹窗生命周期=启动弹一次→关闭后本次运行不再弹→**有新公告再提醒一次**。

## 2. 导出与关键符号

导出 5 条（`export` :11/:14/:17/:20/:26）：`bulletinListAtom`（缓存）、`selectedBulletinIdAtom`、`bulletinDialogOpenAtom`、`bulletinLastReadIdAtom`（已读基准：启动从 settings 同步/关闭写回，:19）、`bulletinSessionDismissedAtom`（内存态重启复位，:22-25）。

## 3-7. 不适用

纯原子+生命周期契约（无逻辑分支）——依据：26 行全文。

## 8. 修改影响面

- 消费面：公告弹窗链。
- 依赖面：bulletin.json+settings 已读基准。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；弹窗生命周期 | 已证实 | :2-26 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | :11-26 | covered |
