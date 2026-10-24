---
path: apps/electron/src/renderer/hooks/useEnterCdutAiClass.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07ecade6e63d8d0cda87427b6de2d0f5505d7abf
sha256: 32c70dfc0c67a91dafd9eb360d40ce64de9e8f15d63b7505230b09b0d3c019fa
lines: 37
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useEnterCdutAiClass.ts

## 1. 结论与边界

**进入「AI速课堂」统一导航封装**（37 行，注释 `:1-9`）：激活专属会话 Tab→切回 CDUT 专区视图→沉浸式折叠主边栏（暂存原折叠态）→打开速课堂子页面。两处复用：会话选择弹窗选定/新建、侧边栏课堂会话锁定引导按钮。

## 2. 导出与关键符号

1 导出：`useEnterCdutAiClass(): (sessionId, title?) => void`（`:18`）。

## 3. 内部逻辑与关键流程

回调（`:27-36`）：`openSession('agent', sessionId, title||'AI速课堂')`（复用统一 openSession 同步 Tab/当前会话/工作区，`:28`）→`setActiveView('cdut-zone')`（openSession 会切 conversations 此处拉回，`:30-31`）→`sidebarRestore===null` 才记录进入前状态（`:33`）→`setSidebarCollapsed(true)`+`setSubView('ai-class')`。

## 4. 调用者与调用链

- 入向：CdutZoneView.handlePickSession、侧边栏锁定引导（注释 `:4-6`，域外）。
- 出向：`useOpenSession`（本批）、active-view/cdut-account/tab atoms。

## 5. 数据 I/O、读写与副作用

写 activeViewAtom/cdutSubViewAtom/sidebarCollapsedAtom/cdutSidebarRestoreAtom；经 openSession 写 Tab 与 settings。

## 6. 分支、失败、取消与恢复

sidebarRestore 幂等暂存（仅 null 时记录）；无抛错。

## 7. 权限与权威状态

无权限分支，依据：导航封装；进入语义（含折叠暂存/恢复约定）权威=本 hook 与关闭侧的 cdutSidebarRestoreAtom 协议。

## 8. 修改影响面

速课堂进入路径的四处状态联动（Tab/视图/边栏/子页）；折叠恢复契约依赖进入时的暂存语义。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四步联动/暂存幂等 | 已证实 | `:1-37` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 18-36 | covered |
