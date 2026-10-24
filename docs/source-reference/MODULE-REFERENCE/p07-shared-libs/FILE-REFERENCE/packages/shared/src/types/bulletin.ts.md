---
path: packages/shared/src/types/bulletin.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76837fa104ad77d33adece49b73f1304f594af35
sha256: ac3eea2b084498e7cfc90e89371292eecd9c84e9c77df66b2f47987ccdb8ac99
lines: 43
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/bulletin.ts

## 1. 结论与边界

公告栏**类型模块**（`packages/shared/src/types/bulletin.ts`，43 行）：公告条目/列表 + IPC 通道。纯声明。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BulletinCategory` | type | `:9` | `'notice' \| 'feature' \| 'tip' \| 'maintenance'` |
| `BulletinItem` | interface | `:12-28` | `{id, title, date, category, summary?, content, tag?, pinned?}`（**无 level/link/version**） |
| `BulletinFile` | interface | `:32-37` | `{version, items}`（**非 BulletinFile**） |
| `BULLETIN_IPC_CHANNELS` | const | `:40-…` | IPC 通道 |

## 3. 内部逻辑与关键流程

无逻辑。`content` 为 Markdown（`:13` 注释）。

## 4. 调用者与调用链

消费方：公告栏 UI、主进程公告服务。出向：无。

## 5. 数据 I/O、读写与副作用

无运行时行为（纯类型）。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

无身份语义。

## 8. 修改影响面

`BULLETIN_IPC_CHANNELS.GET` 是契约；`BulletinItem` 字段改动影响公告 UI 渲染。

## 9. 测试证据

纯类型无专属测试（全树检索命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

4 个导出与形状已证实（真实）；公告服务行为未知（不在本批）。

## 11. 覆盖表

| 符号 | 行 | 状态 |
| --- | --- | --- |
| `BulletinItem`/`BulletinFile`/`BULLETIN_IPC_CHANNELS` | `:8-43` | covered |
