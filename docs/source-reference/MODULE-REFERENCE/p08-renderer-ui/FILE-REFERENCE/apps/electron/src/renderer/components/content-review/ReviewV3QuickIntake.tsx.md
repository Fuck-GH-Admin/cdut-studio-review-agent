---
path: apps/electron/src/renderer/components/content-review/ReviewV3QuickIntake.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef3053ee3d3a947483e69ddb80d9802404d24084
sha256: 3d3f9639cfd2e94559406a08cd93b2daa94c70123abfc6e1b4d5aed669eac738
lines: 154
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3QuickIntake.tsx

## 1. 结论与边界

**材料优先快捷建案**（`ReviewV3QuickIntake.tsx:1` 注释）：先建同一原生案卷再交 Main 路由。红线：**初始字段不做 AI 猜测/自动证据归属**（`:21`）；建案成功但导入未完成保留真实草稿（UI-10 不留隐形空草稿 `:16`）；部分失败停留本页保重试入口（UI-11 `:58`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3QuickIntake` | function（export） | `:9-154` | `({onCreated})` |

内部：`createCase`（`:20-32`，Main 未返真实 ID 即抛 `:29`）、`startWithPaths`（拖拽/重试共用 `:34-72`）、`onDrop`（`:74-92`）、`pickFiles`（系统选择器+importDocument 事务 `:94-120`）。

## 3. 内部逻辑与关键流程

1. 建案字段：title 空取首文件名、applicant 空='待核实申请人'（`:23-25`）；`draftCaseId` 记账。
2. 路径导入（`:34-72`）：逐文件 `registerMaterialPathV2`（role 'application'）；**零成功即抛**（`:55`）；部分失败→失败清单+「重试失败文件」按钮（`:56-62/:144-147`）；全成功→onCreated。
3. 拖拽（`:74-92`）：`getPathForFile` 取本机路径；**任一文件无可读路径→整体取消**（防漏件 `:87-89`）。
4. 选择器（`:94-120`）：用 **importDocument 原件导入事务**（避免聊天附件 base64 副本冒充原件 `:99`）；canceled→草稿保留提示（`:102-104`）；failures 逐条列出（`:107-112`）。
5. UI：拖放区（键盘可操作 `:132`）、草稿卡（打开草稿/重试按钮 `:140-148`）。

## 4. 调用者与调用链

入向：内容审核入口（跨文件）。出向：`window.reviewAPI`（createCase/registerMaterialPathV2/importDocument）、`window.electronAPI.getPathForFile`、sonner。

## 5. 数据 I/O、读写与副作用

写：Main 案卷+材料登记（真实草稿）；toast；无本地文件写。

## 6. 分支、失败、取消与恢复

失败均留草稿+可重试（`:67/:117`）；取消保留草稿（`:102-104`）；busy 防重。不适用取消/恢复。

## 7. 权限与权威状态

红线：不猜测申请人（`:21`）；原件走审核导入事务（`:99`）；失败不吞（逐文件提示 `:136`）。

## 8. 修改影响面

改建案流 → 材料优先入口 UX 与草稿生命周期。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3QuickIntake` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+双导入链 | 已证实 | 逐行读 `:1-154` |
| reviewAPI 行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:9-154` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
