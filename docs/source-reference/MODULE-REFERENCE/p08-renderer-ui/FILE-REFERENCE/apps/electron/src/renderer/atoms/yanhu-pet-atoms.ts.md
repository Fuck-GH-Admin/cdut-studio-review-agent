---
path: apps/electron/src/renderer/atoms/yanhu-pet-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cd2274aa87dbc32419a7b8db8cac65512816d122
sha256: 6666142bf086c3f4e01c81dfbffcf27bdb2918a63aaf078b07cca5f071abb57b
lines: 57
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/yanhu-pet-atoms.ts

## 1. 结论与边界

桌宠「砚小龙」渲染层状态（头注释 :2-7）：独立透明子窗口；**主进程为配置/记忆/流式唯一数据源**，渲染层只消费广播+本地交互态。

## 2. 导出与关键符号

导出 11 条（`export`）：`DEFAULT_PET_CONFIG`（:22-27，**petPosition (24,24) 为「待动态居中」占位**，宿主首帧迁移至物理正中 :19-21）、`petConfigAtom`（:30）、`petViewportSizeAtom`（:33）、`petPresentedAtom`（:36）、`petMessagesAtom`（:39）、`petStreamingAtom`（:42）、`petStreamTextAtom`（:45）、`petReasoningTextAtom`（:48）、`petActiveToolsAtom`（:51）、`petRequestIdAtom`（:54）、`petSpriteStateAtom`（:57，四态精灵 'breathing' 等）。

## 3-7. 不适用

纯原子+默认配置（无逻辑分支）——依据：57 行全文核对。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `cdut-zone/yanhu/pet/YanhuPetFloatingHost.tsx:17-26`（:68-83 全符号）。否定：`petRequestIdAtom` **0 消费者**；`DEFAULT_PET_CONFIG` 仅模块内用。出向：jotai、`@profer/shared` 类型。

## 8. 修改影响面

- 消费面：桌宠宿主。
- 依赖面：主进程配置/流式广播。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 11 条；占位迁中契约 | 已证实 | :19-27 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | §2 | :22-57 | covered |
