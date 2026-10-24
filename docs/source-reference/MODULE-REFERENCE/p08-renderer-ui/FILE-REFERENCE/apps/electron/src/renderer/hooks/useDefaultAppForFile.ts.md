---
path: apps/electron/src/renderer/hooks/useDefaultAppForFile.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07f1e1457e2c5038727f1f473f4cd595827c8ad7
sha256: 56230d5402d02232067395b5ea2afda42ccfa7ec3873e78ce751e8858119ae4e
lines: 62
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useDefaultAppForFile.ts

## 1. 结论与边界

**默认 App 探测 hook**（62 行）：探测本机文件类型注册的默认 App 并按后缀缓存（进程内有效；切默认 App 后下次启动生效，注释 `:1-6`）。跨组件共用（预览顶栏/文件浏览器菜单）。

## 2. 导出与关键符号

1 导出：`useDefaultAppForFile(filePath, access?): DefaultAppInfo|null`（`:20`）。内部：`extKeyOf`（`:14`，后缀小写 key；无后缀回落全路径）、模块级 `rendererCache` Map（`:12`）。

## 3. 内部逻辑与关键流程

（`:24-59`）：初值读缓存→effect：无文件置 null；缓存命中（含 null）直接用；否则 `getDefaultAppForFile(filePath, access)` IPC——**带 access 时 null 可能是授权失败不入缓存**（防污染按后缀共享缓存，注释 `:46-47`）；无 access 的 null/结果与异常才缓存（异常缓存 null `:53`）；cancelled 竞态守卫。

## 4. 调用者与调用链

- 入向：预览面板顶栏按钮、文件浏览器三点菜单（注释 `:4`，域外）。
- 出向：`window.electronAPI.getDefaultAppForFile`、`@/lib/file-utils`。

## 5. 数据 I/O、读写与副作用

IPC 探测；模块级缓存写（进程生命周期）。

## 6. 分支、失败、取消与恢复

无文件/缓存命中/带 access 的 null 防污染/异常缓存 null；cancelled 守卫。

## 7. 权限与权威状态

默认 App 信息权威=主进程探测；**授权失败与"无默认 App"的区分**由 access 条件缓存语义承载（`:46-47`）。

## 8. 修改影响面

预览/文件菜单的"用默认应用打开"入口；缓存防污染语义影响带权限路径的探测正确性。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 缓存 key/防污染分支/竞态守卫 | 已证实 | `:1-62` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+2 内部 | §2/§3 | 12-59 | covered |
