---
path: apps/electron/src/renderer/components/cdut-science/CsLabZoteroPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 52e05085b48d7f2af6691563441446b7f63e4437
sha256: 31acb0eddf5dec3fd7c31ee6b8808965fcedf80a48ec18d3c622c4105f8dd3d9
lines: 219
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabZoteroPanel.tsx

## 1. 结论与边界

Zotero 只读同步控制台（头注释 :2-5）：仅触发发现/同步/监听与状态展示；**所有写库行为均被主进程禁止**（:4）。UI 底注「绝不写入 zotero.sqlite」（:210）+WAL 占用自动重试不中断（:215）。

## 2. 导出与关键符号

导出 1 条（`export` :26）：`CsLabZoteroPanel({labId, onChanged})`（:26-219）。内部：`AVAILABILITY_LABEL`（:19-24，ready/not-found/no-permission/schema-unsupported 四态）。

## 3. 内部逻辑与关键流程

四操作（busy 互斥 :28）：`refresh`（getZoteroStatus :32-39，挂载即取 :41-43）；`discover`（:45-58）；`pickDataDir`（openFolderDialog→setZoteroDataDir :60-74）；`sync(forceFull)`（:76-90，ok 才 onChanged）；`toggleWatch`（WAL 监听开/停 :92-109）。状态卡（数据目录/三计数/上次同步 :113-147）；强制全量重建按钮（:187-194）；写回桥接「预留」（:207-212）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabWorkspaceView.tsx:93` → :2348-2353（drawer.mode=zotero，onChanged→refreshAssets）。出向：cslabZoteroStatusAtom（:27）；electronAPI 7 处（getZoteroStatus:34/discoverZotero:50/openFolderDialog:62/setZoteroDataDir:66/syncZotero:81/stopZoteroWatch:97/startZoteroWatch:100）。

## 5. 数据 I/O、读写与副作用

只读触发同步/监听 IPC（写库在主进程侧被禁）。

## 6. 分支、失败、取消与恢复

各操作 catch→setError；busy 互斥防重。WAL 占用自动重试（:215 声明）。

## 7. 权限与权威状态

只读边界权威（:4/:210）；写回桥接预留未开（:208）。

## 8. 修改影响面

- 消费面：Zotero 集成入口面板。
- 依赖面：cslab.zotero IPC 族+主进程禁写策略。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；只读契约+四操作 | 已证实 | :2-5/:45-109 |
| 主进程禁写实现 | 未知（批外） | :4 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+四操作/状态卡 | §2/§3 | :26-219 | covered |
