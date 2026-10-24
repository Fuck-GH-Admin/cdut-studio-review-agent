---
path: apps/electron/src/renderer/components/cdut-science/CsLabRunTimeline.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fee1edf26713352a12b5497ecb60d52baf673f4b
sha256: c434e8bdd90673283188bfee49261795e14a8970688cb3dfda6301bb8ab3deca
lines: 730
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabRunTimeline.tsx

## 1. 结论与边界

实验规程与批次时间轴（头注释 :2-6）：Protocol 模板（步骤/参数定义）+Run 批次（参数实填、成败现象、数据关联）；Editorial Minimalism 视觉。

## 2. 导出与关键符号

导出 1 条（`export` :126）：`CsLabRunTimeline`（:126-）。

## 3. 内部逻辑与关键流程

（头+大纲级，730 行）：jotai 两原子（protocols/runs :30，:133-134）；electronAPI 链（子agent 交叉核）：listProtocols:163/listRuns:164/createProtocol:218/createRun:243/updateRun:274/linkRunAsset:298/unlinkRunAsset:318。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:94` → :2221（drawer.mode==='runs'）。出向：`@profer/shared`（7 类型 :20-28）、cslab-atoms 两原子。

## 5. 数据 I/O、读写与副作用

规程/批次 CRUD IPC+数据关联。

## 6. 分支、失败、取消与恢复

创建/更新/关联分支；不适用取消/恢复。

## 7. 权限与权威状态

Run 状态语义（CsLabRunStatus）权威；数据关联（linkRunAsset）。

## 8. 修改影响面

- 消费面：WorkspaceView runs 抽屉。
- 依赖面：cslab.run IPC 族。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；IPC 链行号 | 已证实 | 子agent 交叉核 |
| 时间轴实现逐行 | 推断（头+大纲级） | :126-729 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+IPC 链 | §2/§3 | :126-729 | covered |
