---
path: apps/electron/src/renderer/atoms/yanhu-express-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 33449452b7d88c8211ba5e46b81efd5305828fa6
sha256: cd2a02f202a3842ecb7d96723fa92812e9384fd183a4c6b777f899e236a77b17
lines: 24
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/yanhu-express-atoms.ts

## 1. 结论与边界

智联万站渲染层状态（头注释 :2-7）：**主进程为标签拓扑唯一数据源**（`yanhu:on-tabs-changed` 广播）；渲染层只消费不自行推导（保 UI 与原生视图一致）。

## 2. 导出与关键符号

导出 4 条（`export` :12/:15/:18/:24）：`yanhuTabsAtom`（:12）、`yanhuActiveTabIdAtom`（:15，派生）、`yanhuActiveTabAtom`（:18-21，派生 null 兜底）、`yanhuLoadingAtom`（:24，加载态映射驱动转圈）。

## 3-7. 不适用

纯原子+派生（无逻辑分支）——依据：24 行全文核对。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `cdut-zone/yanhu/YanhuExpressView.tsx:26`（:52/:53/:54 三原子）。否定：`yanhuActiveTabIdAtom` **0 消费者**（死导出）。出向：jotai、`@profer/shared` 类型。

## 8. 修改影响面

- 消费面：智联万站视图。
- 依赖面：主进程广播通道。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；主进程权威契约 | 已证实 | :2-7 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | :12-24 | covered |
