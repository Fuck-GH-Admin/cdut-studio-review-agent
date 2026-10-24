---
path: packages/shared/src/types/changelog.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e6205c4922777013621f55c7e3097b8d4980ef04
sha256: 066ac0a41a672190f1865e8f4a164d9f16f2c4c5ca22fb53523997f5aeab3eb5
lines: 30
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/changelog.ts

## 1. 结论与边界

版本更新日志（CHANGELOG）**类型模块**（`packages/shared/src/types/changelog.ts:1-6`）：版本历史维护在应用内置 `CHANGELOG.json`，前端读本地文件展示，**不依赖 GitHub 等外部服务**。

## 2. 导出与关键符号

`export` 共 **3 个**。

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `ChangelogEntry` | `:9-18` | `{version, date: YYYY-MM-DD, title?, notes: markdown}` |
| `ChangelogFile` | `:21-24` | `{releases: ChangelogEntry[]}`（新版本在前） |
| `CHANGELOG_IPC_CHANNELS` | `:27-30` | `GET: 'changelog:get'` |

## 3. 内部逻辑与关键流程

无逻辑。`title` 缺省显示 `v{version}`（`:14` 注释）。

## 4. 调用者与调用链

消费方：更新日志 UI、主进程读 `CHANGELOG.json`。出向：无。

## 5. 数据 I/O、读写与副作用

无运行时行为（纯类型）。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

无身份语义。

## 8. 修改影响面

`CHANGELOG_IPC_CHANNELS.GET` 是契约；`ChangelogFile` 形状与内置 JSON 文件耦合。

## 9. 测试证据

纯类型无专属测试（全树检索命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

3 个导出与形状已证实（全文）；读取服务行为未知（不在本批）。

## 11. 覆盖表

| 符号 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:9-30` | covered |
