---
path: apps/electron/src/renderer/components/cdut-science/CsLabPreparationView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6e04712fee4e6242b27d65aba53277bb88876009
sha256: 0e30f19a83062219275875c3886d8f0236af254e9470a0b2d2c0b5d254dc67a4
lines: 584
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabPreparationView.tsx

## 1. 结论与边界

CDUT Science 实验室选择页（头注释 :2-6）：**数据 100% 来自主进程真实沙箱（lab.manifest.json），零硬编码实验室**（:4）；视觉=暖调编辑式极简（:5）。

## 2. 导出与关键符号

导出 1 条（`export` :80）：`CsLabPreparationView()`（:80-，无 props）。内部：`STATUS_STYLES`（:55）、`FILTER_LABELS`（:64）、`sortLabs`（:71）。

## 3. 内部逻辑与关键流程

（头部+大纲级，584 行）：jotai 原子取/设；列表渲染（置顶/归档/重命名/删除/搜索/模糊匹配 matchLabFuzzy :26）；ContextMenu 操作族。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CdutScienceView.tsx:18` → :72（activeLabId 分支）。出向：matchLabFuzzy（:26→:136）、ContextMenu/Dropdown、window-controls-layout；electronAPI listLabs:106/openLab:152/listAssets:153/createDemoLab:174/lockSession:186/togglePinLab:239/toggleArchiveLab:255。

## 5. 数据 I/O、读写与副作用

lab 清单 CRUD IPC（真实沙箱）。

## 6. 分支、失败、取消与恢复

过滤/排序/搜索分支。不适用取消/恢复。

## 7. 权限与权威状态

「零硬编码、真沙箱」权威（:4）。

## 8. 修改影响面

- 消费面：CSLab 入口页。
- 依赖面：lab.manifest.json 契约、shared 模糊匹配。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；真沙箱契约 | 已证实 | :2-6 |
| 列表/操作实现逐行 | 推断（头+大纲级） | :80-583 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+契约 | §2/§7 | :2-80 | covered |
| 列表实现 | §3/§10 | :80-583 | 推断 |
