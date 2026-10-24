---
path: apps/electron/src/renderer/hooks/useCdutAccountHydration.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0db887a48a9872253ac63e9b844bded19e2d5d4f
sha256: 645d69d3e70d91934af779c1bd23fc9479c606ef1cc3fd392dcc7de54141686a
lines: 35
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useCdutAccountHydration.ts

## 1. 结论与边界

**CDUT 特区账户全局水合 hook**（35 行）：根部挂载即拉取账户快照+订阅状态变更，使账户（含证件照头像）对任何界面可用（注释 `:3-7`：否则聊天里的学籍照片无法显示）。

## 2. 导出与关键符号

1 导出：`useCdutAccountHydration(): void`（`:13`）。

## 3. 内部逻辑与关键流程

（`:16-34`）：`cdutZone.getAccount()`→set `cdutAccountAtom`（active 竞态守卫 `:17,22`）；`cdutZone.onStatusChanged` 订阅→同步 set；cleanup 置 active=false+unsubscribe。拉取失败 console.error 不重试（`:24`）。

## 4. 调用者与调用链

- 入向：应用根部（注释 `:4`，域外）。
- 出向：`cdutAccountAtom`、`window.electronAPI.cdutZone`。

## 5. 数据 I/O、读写与副作用

IPC 拉取/订阅账户状态；写 cdutAccountAtom。

## 6. 分支、失败、取消与恢复

拉取失败仅日志（无重试）；active 竞态守卫；unmount 订阅清理。

## 7. 权限与权威状态

账户状态权威=主进程 cdutZone 服务（推送订阅）。

## 8. 修改影响面

全局 CDUT 账户可见性（学籍照片渲染等）；仅 CdutZoneView 填充的历史局限被此 hook 消除（注释 `:4-5`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 快照+订阅双通道/竞态守卫 | 已证实 | `:1-35` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 13-34 | covered |
