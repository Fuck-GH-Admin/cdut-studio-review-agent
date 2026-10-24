---
path: apps/electron/src/renderer/lib/agent-message-merge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0cc56ec2510388b17f647965d9012a32184a17ad
sha256: cb6790f29c384dbdeee435c21803918cb9f75a9d81f3af7668460454069ee1f0
lines: 35
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-message-merge.ts

## 1. 结论与边界

持久化+实时转录合并（头注释 :2-6）：以 `type+uuid` 身份去重；**实时覆盖同 UUID 持久化副本但保留原位置**（防 `/compact` 重复渲染、防 live 副本挪到末尾）。

## 2. 导出与关键符号

导出 1 条（`export` :7）：`mergeMessagesByUuid<T>(persisted, live)`（:7-35）。内部：`appendOrReplace`（:14-30）。

## 3. 内部逻辑与关键流程

无 uuid 直接追加（:15-18）；key=`type:uuid`（:20）；已存在→**原位替换**（:28-29）；先 persisted 后 live（:32-33）。

## 4. 调用者与调用链

入向：会话转录渲染链。出向：无。

## 5-7. 数据/分支/权限

纯函数；不适用。

## 8. 修改影响面

- 消费面：转录合并渲染。
- 依赖面：消息形状（type/uuid）。
- 需同步测试：`agent-message-merge.test.ts`（34 行）。

## 9. 测试证据

`agent-message-merge.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；原位覆盖契约 | 已证实 | :2-6/:28-29 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+去重链 | §2/§3 | :7-35 | covered |
